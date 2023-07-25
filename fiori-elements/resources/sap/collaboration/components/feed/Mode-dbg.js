/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/collaboration/components/utils/CommonUtil",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/thirdparty/jquery"
], function(BaseObject, Filter, FilterOperator, Fragment, CommonUtil, ODataModel, jQuery) {
	"use strict";

	var Mode = BaseObject.extend("sap.collaboration.components.feed.Mode", {
		constructor: function(oFeedController) {
			// The questions below may help me in refactoring.
			// Do controls define byId("")
			// Do views have the getController method?
			// Do controllers have a getView method?

			// a common utility used to verify input types
			this._oCommonUtil = new CommonUtil();

			// The group feed component's controller.
			this._oFeedController = oFeedController;

			// Initialize feed mode models
			this._initializeModels();

			// view properties
			this._oViewDataModel = this._oFeedController.getModel();
			this._oJamModel = this._oFeedController.getModel("jam");

			// construct the group selector fragment
			var sGroupSelectorFragmentId = this._getGroupSelectorFragmentId();
			sap.ui.xmlfragment(sGroupSelectorFragmentId, "sap.collaboration.components.feed.fragments.GroupSelector", this);

			// obtain a reference to the responsive popover
			this._oGroupSelectPopover = Fragment.byId(sGroupSelectorFragmentId, "responsivePopover");
			this._oGroupSelectPopover.setModel(this._oFeedController.getModel("i18n"), "i18n");

			// obtain a reference to the list control
			this._oList = Fragment.byId(sGroupSelectorFragmentId, "list");
			this._oList.addStyleClass("RightToLeftParenthesisStyling");
			this._oList.setBusyIndicatorDelay(0);

			// construct the custom list item fragment, binding will be done in each mode
			this._oListItemTemplate = sap.ui.xmlfragment("sap.collaboration.components.feed.fragments.CustomListItem", this);
		}
	});

	/**
	 * Boolean to store if jam service is available
	 * @static
	 * @private
	 * @type {Boolean}
	 */
	Mode._bJamServiceAvailable = true;

	/**
	 * String to store URL for jam service
	 * @static
	 * @private
	 * @type {String}
	 */
	Mode._sJamServiceUrl = "/sap/bc/ui2/smi/rest_tunnel/Jam/api/v1/OData";

	/**
	 * Integer used to store the next index to use in the group
	 * selector fragment id upon construction. This is to avoid
	 * collision of of ids.
	 * @static
	 * @private
	 * @type {Number}
	 */
	Mode._nextGroupSelectorFragmentIdIndex = 0;

	/**
	 * This method is used to make sure the various instances of this class
	 * don't construct group selector fragment having the same id.
	 * @private
	 * @return {string} the id to use when creating a group selector fragment
	 * @memberOf sap.collaboration.components.feed.Mode
	 */
	Mode.prototype._getGroupSelectorFragmentId = function () {
		return this._oFeedController.createId("groupSelectorFragment") + Mode._nextGroupSelectorFragmentIdIndex++;
	};

	/*********************
	 * HTTP GET Requests
	 ********************/
	/**
	 * Get Jam group wall feed entries
	 * @public
	 * @param {string} path the path to get the feed entries
	 * @param [string] skipToken the skip token from the next link
	 * @return {object} a deferred promise object
	 * @memberOf sap.collaboration.components.feed.Mode
	 */
	Mode.prototype.getFeedEntries = function (path, skipToken) {
		var loadingFeedEntriesPromise = jQuery.Deferred();
		var mParameters = {
				"urlParameters": {
					"$expand": "Creator,TargetObjectReference"
				},
				"success": function(oData, response) {
					loadingFeedEntriesPromise.resolve(oData, response);
				},
				"error": function(oError) {
					loadingFeedEntriesPromise.reject(oError);
				}
			};

		if (skipToken) {
			mParameters.urlParameters.$skiptoken = skipToken;
		}

		return loadingFeedEntriesPromise.promise(this._oJamModel.read(path, mParameters));
	};

	Mode.prototype.onGroupSearch = function(oEvent) {

		var oFilter = new Filter("Name", FilterOperator.Contains, oEvent.getParameter("newValue"));
		this._oList.getBinding("items").filter([oFilter]);
	};

	/*********************
	 * HTTP POST Requests
	 ********************/
	/**
	 * Post comment to Jam
	 * @public
	 * @param {string} content The comment to post in Jam
	 * @return {map} a map containing the path, and a deferred promise object
	 * @memberOf sap.collaboration.components.feed.Mode
	 */
	Mode.prototype.addPost = function (content) {
		var postingCommentPromise = jQuery.Deferred();
		var sPath = this.getAddPostPath();
		var oDataPayload = { "Text" : content };
		var mParameters = {
				"success": function(oData, response) {
					postingCommentPromise.resolve(oData, response);
				},
				"error": function(oError) {
					postingCommentPromise.reject(oError);
				}
		};
		// return the path and payload along with the promise in case the caller wants to make the request again (i.e. CSRF token refresh)
		return {
			"path" : sPath,
			"payload" : oDataPayload,
			"promise" : postingCommentPromise.promise(this._oJamModel.create(sPath, oDataPayload, mParameters))
		};
	};

	/**
	 * Get the number of new updates since the latest feed entry
	 * @return {object} Deferred object for the request
	 *
	 * @public
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	Mode.prototype.getFeedUpdatesLatestCount = function() {
		var gettingFeedUpdates = jQuery.Deferred();
		// get the first timeline item and get the Id
		var oLatestFeedEntry = this._oFeedController.byId("timeline").getContent()[0];
		var sLatestTopLevelId = oLatestFeedEntry ? oLatestFeedEntry.getModel().getProperty("/TopLevelId") : "";
		var sGroupId = this._oViewDataModel.getProperty("/groupSelected/Id");

		var sPath = "/Group_FeedLatestCount";
		var mParameters = {
			"urlParameters": {
				LatestTopLevelId: sLatestTopLevelId,
				Id: sGroupId
			},
			"success": function(oData, response) {
				gettingFeedUpdates.resolve(oData, response);
			},
			"error": function(oError) {
				gettingFeedUpdates.reject(oError);
			}
		};

		return gettingFeedUpdates.promise(this._oJamModel.callFunction(sPath, mParameters));
	};

	/**
	 * Create and initialized the models for the view
	 * Jam model: OData model for connecting to Jam
	 * @private
	 * @memberOf sap.collaboration.components.feed.Mode
	 */
	Mode.prototype._initializeModels = function() {
		// Jam model
		var oJamModel = new ODataModel(Mode._sJamServiceUrl);
		oJamModel.attachMetadataFailed(this._oFeedController._onMetadataFailed, this._oFeedController);
		oJamModel.attachRequestCompleted(this._oFeedController._onJamRequestCompleted, this._oFeedController);
		oJamModel.attachRequestFailed(this._oFeedController._onJamRequestFailed, this._oFeedController);
		oJamModel.attachRequestSent(this._oFeedController._onJamRequestSent, this._oFeedController);
		oJamModel.attachBatchRequestCompleted(this._oFeedController._onBatchCompleted, this._oFeedController);
		oJamModel.attachBatchRequestFailed(this._oFeedController._onBatchFailed, this._oFeedController);
		oJamModel.attachBatchRequestSent(this._oFeedController._onBatchSent, this._oFeedController);
		this._oFeedController.setJamModel(oJamModel);
	};

	/**
	 * Returns the Jam Service Url
	 * @public
	 * @memberOf sap.collaboration.components.feed.Mode
	 */
	Mode.prototype.getJamServiceUrl = function() {
		return Mode._sJamServiceUrl;
	};

	/**
	 * Return if the Jam service is available
	 * @public
	 * @memberOf sap.collaboration.components.feed.Mode
	 */
	Mode.prototype.isJamServiceAvailable = function() {
		return Mode._bJamServiceAvailable;
	};

	/**
	 * Sets the flag if the Jam service is available or not
	 * @public
	 * @memberOf sap.collaboration.components.feed.Mode
	 */
	Mode.prototype.setJamServiceAvailable = function(bJamServiceAvailable) {
		Mode._bJamServiceAvailable = bJamServiceAvailable;
	};

	return Mode;
});
