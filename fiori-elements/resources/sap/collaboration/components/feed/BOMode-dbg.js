/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define([
	"./Mode",
	"sap/collaboration/components/utils/PendingRequestsUtil",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/thirdparty/jquery"
], function(Mode, PendingRequestsUtil, ODataModel, jQuery) {
	"use strict";

	var BOMode = Mode.extend("sap.collaboration.components.feed.BOMode",{
		constructor: function(oFeedController) {
			// Calls the superclass's constructor. This
			// causes this class to inherit the instance
			// variables list below.
			Mode.apply(this, [oFeedController]);

			// Inherited instance variables
			// this._oCommonUtil
			// this._oFeedController
			// this._oListItemTemplate
			// this._oList
			// this._oViewDataModel
			// this._oJamModel
			// this._oSelectPopover

			// current Jam External BO Id
			this._sJamBOId = undefined;

			// Utility to keep track of the pending OData requests.
			// Can be used to abort all the pending requests.
			this._oPendingRequestsUtil = new PendingRequestsUtil();

			// This mode needs access to the SMIv2 OData Mode.
			this._oSMIModel = this._oFeedController.getModel("smi");

			// This mode requires the language bundle for texts.
			this._oLanguageBundle = this._oFeedController.getLanguageBundle();

			this._oList.setModel(this._oJamModel);

			// Filter constants
			this.FILTER_CONSTANTS = {
					GROUP_WALL: "Group Wall",
					GROUP_OBJECT_WALL: "Group Object Wall"
			};

			// Attach event handler for filter control
			oFeedController.byId("filter_popover").attachSelectionChange(this.onFilterSelection, this);
		}
	});

	/**
	 * String to store URL for SMI V2 service
	 * @static
	 * @private
	 * @type {String}
	 */
	BOMode._sSMIv2ServiceUrl = "/sap/opu/odata/sap/SM_INTEGRATION_V2_SRV";

	/**
	 * Asks the BOMode object to start.
	 * @public
	 * @param {object} oFeedSourcesData - Uses this object if defined. Uses the current object otherwise.
	 * @memberOf sap.collaboration.components.feed.BOMode
	 * @param {object} oFeedSourcesData object with the following structure:
	 * {
	 *   appContext: <string>,
	 *   odataServicePath: <string>,
	 *   collection: <string>,
	 *   key: <string>,
	 *   name: <string>
	 * }
	 * @public
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype.start = function(oFeedSourcesData) {
		// The if statement below verifies that
		// the oFeedSourcesData parameter has the following
		// structure
		// {
		//   appContext: <string>,
		//   odataServicePath: <string>,
		//   collection: <string>,
		//   key: <string>,
		//   name: <string>
		// }
		if (!(this._oCommonUtil.isObject(oFeedSourcesData) &&
				this._oCommonUtil.isString(oFeedSourcesData.appContext) &&
				this._oCommonUtil.isString(oFeedSourcesData.odataServicePath) &&
				this._oCommonUtil.isString(oFeedSourcesData.collection) &&
				this._oCommonUtil.isString(oFeedSourcesData.key) &&
				this._oCommonUtil.isString(oFeedSourcesData.name)))  {
			var sErrorMessage = "The feedSources' data object is invalid.";
			this._oFeedController.logError(sErrorMessage);
			throw new Error(sErrorMessage);
		}

		// I'm worried about memory leaks in this chaining.
		// We need deeper analysis to fully understand all
		// the dangling objects that we're possibly creating.
		this._sendRequestMapInternalBOToExternalBO(
			oFeedSourcesData.appContext,
			oFeedSourcesData.collection,
			oFeedSourcesData.key,
			oFeedSourcesData.odataServicePath
		).then(
			(function(oData, oResponse) {
				return this._sendRequestExternalObjects_FindByExidAndObjectType(oData.MapInternalBOToExternalBO.Exid, oData.MapInternalBOToExternalBO.ObjectType);
			}).bind(this), // For success we chain.
			(function(oError) {
				// What are the possible things that can go wrong here?
				// 1. A network issue.
				// 2. A CSRF token issue.
				// 3. 401 (Unauthorized) Status code indicating that the user is not authorized to access the resource. This may mean the user is not authenticated.
				// 4. 5xx errors are server side errors, which I don't really know how to handle.

				// Although there are many error scenarios,
				// at the moment all errors are handled the same way.
				this._oFeedController.logError("The internal to external mapping for the business object could not be performed.");
				this._oFeedController.displayErrorMessage(this._oLanguageBundle.getText("SMIV2_INTERNAL_TO_EXTERNAL_BO_MAPPING_COULD_NOT_BE_PERFORMED"));

				// To indicate to the chained error handler not to display
				// its error message, we return the null object.
				return null;
			}).bind(this) // For errors, error messages are logged and displayed to the user.
		).then(
			(function(oData, oResponse) {
				this._sJamBOId = this._oCommonUtil.getODataResult(oData).Id; // set the Jam External BO id

				// Prior to binding the path for the list items, since this
				// is the start of a new list of list items being
				// populated, we attach to the list's update finished
				// event to update the view's data model about the
				// selection. The update finished method will then
				// detach itself to make sure it isn't called again.
				this._oList.attachUpdateFinished(this.onGroupSelectorUpdateFinished, this);

				// We must figure out a way to deal with the things that can
				// potentially go wrong after the list sends a request for
				// the groups. Whatever callback functions we register
				// must be unregistered when the request is successful.
				// Also, the registered callback should not have to worry
				// about other parts of the component that also use the
				// list control and/or ODataModel object.
				this._oList.bindItems({
					path: "/ExternalObjects('" + this._oCommonUtil.getODataResult(oData).Id + "')/Groups",
					template: this._oListItemTemplate
				});
			}).bind(this), // Success! We now set the path.
			(function(oError) {
				// What are the possible things that can go wrong here?
				// 1. A network issue. What does this look like?
				// 2. A tunnel issue.
				// 3. A CSRF token issue.
				// 4. 404 (Not Found) Status code indicating that the external object could not be found.
				// 5. 5xx errors are server side errors, which I don't really know how to handle.

				// If the oError object is null, it means the call to which we're chaining failed.
				// Therefore, since that call's error handler logged and displayed error messages,
				// none are logged or displayed here.
				if (oError !== null) {
					// Although there are many error scenarios,
					// at the moment all errors are handled the same way.
					this._oFeedController.logError("An external object associated with the given Exid and ObjectType could not be found.");
					this._oFeedController.displayErrorMessage(this._oLanguageBundle.getText("JAM_EXTERNAL_OBJECT_COULD_NOT_BE_FOUND"));
				}
			}).bind(this) // For errors, error messages are logged and displayed to the user.
		);

		//enable group feed by enabling add post button, group selector and the more button
		this._oFeedController.enableGroupFeed();
		// enable filter
		this._oViewDataModel.setProperty("/filterEnabled", true);


		// set filter criteria
		this._setFilterOptions(oFeedSourcesData.name);

		// Attach event handler for the List's updateFinished, this handler function simply removes the busy indicator on the list.
		// The reason we can't put it in this.onGroupSelectorUpdateFinished is because after this.onGroupSelectorUpdateFinished is executed, it then detaches itself
		this._oList.attachUpdateFinished(this.onUpdateFinished, this);
	};

	/**
	 * Asks the BOMode object to stop.
	 * @public
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype.stop = function() {
		this._oPendingRequestsUtil.abortAll();

		// disable filter
		this._oViewDataModel.setProperty("/filterEnabled", false);

		// detach handler for the list
		this._oList.detachUpdateFinished(this.onUpdateFinished, this);
	};

	/**
	 * A generic method to send various kinds of requests. Handles the
	 * pending requests in a generic way.
	 * @param {object} oODataModel the ODataModel class instance to use to send the function import OData request
	 * @param {string} sODataPath the path to use when calling the method on the ODataModel class instance.
	 * @param {object} oURLParameters the object representing the function import's parameters
	 * @private
	 * @return {object} oAbortableAndChainablePromiseRequest a promise object
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype._sendFunctionImportODataRequest = function(oODataModel, sODataPath, oParameters) {
		var oDeferred = jQuery.Deferred();
		var oAbortableRequest = oODataModel.callFunction(sODataPath, {
			urlParameters: oParameters,
			success: function(oData, oResponse) {
				oDeferred.resolve(oData, oResponse);
			},
			error: function(oError) {
				oDeferred.reject(oError);
			}
		});
		var oAbortableAndChainablePromiseRequest = oDeferred.promise(oAbortableRequest);
		this._oPendingRequestsUtil.add(oAbortableAndChainablePromiseRequest);
		oDeferred.always((function(){
			this._oPendingRequestsUtil.remove(oAbortableAndChainablePromiseRequest);
		}).bind(this));
		return oAbortableAndChainablePromiseRequest;
	};

	/**
	 * A method to make a request to get the internal to external mapping
	 * @param {string} sApplicationContext
	 * @param {string} sODataCollection
	 * @param {string} sODataKeyPredicate - The content to place between parenthesis to identify the business object.
	 * For example, say the collection is Opportunities and that opportunities has a string id
	 * of say aE6f, then the URL for that Opportunity would contain Opportunities('aE6f').
	 * Hence, the sODataKeyPredicate would be the string 'aE6F'. It's important to send
	 * the single quotes in with the string. Hence, the string would be "'aE6f'" in JavaScript.
	 * @param {string} sOdataServicePath - Path to the OData service. For example, his could be
	 * /sap/opu/odata/sap/ODataService/
	 * @private
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype._sendRequestMapInternalBOToExternalBO = function(sApplicationContext, sODataCollection, sODataKeyPredicate, sODataServicePath) {
		return this._sendFunctionImportODataRequest(this._oSMIModel, "/MapInternalBOToExternalBO", {
			ApplicationContext: sApplicationContext,
			ODataCollection: sODataCollection,
			ODataKeyPredicate: sODataKeyPredicate,
			ODataServicePath: sODataServicePath
		});
	};

	/**
	 * A method to make a request to find an external object by external Id and object type
	 * @param {string} Exid
	 * @param {string} ObjectType
	 * @private
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype._sendRequestExternalObjects_FindByExidAndObjectType = function(Exid, ObjectType) {
		return this._sendFunctionImportODataRequest(this._oJamModel, "/ExternalObjects_FindByExidAndObjectType", {
			Exid: Exid,
			ObjectType: ObjectType
		});
	};

	/**
	 * Set filter options
	 * @private
	 * @param {string} BOName The name of the BO
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype._setFilterOptions = function(BOName) {
		var sI18nText;
		BOName ? sI18nText = this._oLanguageBundle.getText("GF_FILTER_OBJECT", BOName) : sI18nText =  this._oLanguageBundle.getText("GF_FILTER_OBJECT_DEFAULT");
		var mFilterData = [{ Name : this._oLanguageBundle.getText("GF_FILTER_GROUP"), key : this.FILTER_CONSTANTS.GROUP_WALL },
						   { Name :  sI18nText, key : this.FILTER_CONSTANTS.GROUP_OBJECT_WALL }];
		this._oViewDataModel.setProperty("/filter", mFilterData);

		var oFilterPop = this._oFeedController.byId("filter_popover");
		oFilterPop.setSelectedItem(oFilterPop.getItems()[0]);
	};


	/**
	 * Returns the OData path for Add Post
	 * @public
	 * @return {string} The OData path for Add Post
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype.getAddPostPath = function () {
		var sGroupId = this._oViewDataModel.getProperty("/groupSelected/Id");

		return "/GroupExternalObjects(GroupId='" + sGroupId + "',ExternalObjectId='" + this._sJamBOId + "')/FeedEntries";
	};

	/**
	 * Displays  the feed source selector popover next to the specified control.
	 * @param {object} oControl the control next to which to display the feed source selector
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype.displayFeedSourceSelectorPopover = function(oControl) {
		this._oList.setBusy(true);
		this._oJamModel.refresh(/* bForceUpdate */ true);
		this._oGroupSelectPopover.openBy(oControl);
	};

	/**
	 * Event handler for the selector list when an item is selected.
	 * The structure of the model set on the individual list items
	 * must be known, and there must exist a way of mapping the
	 * selected list item.
	 * @param {object} oEvent
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype.onGroupSelected = function(oEvent) {
		var oGroupSelected = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
		this._oViewDataModel.setProperty("/groupSelected", {
			Id : oGroupSelected.Id,
			Name : oGroupSelected.Name,
			WebURL : oGroupSelected.WebURL
		});

		this._oViewDataModel.setProperty("/feedEndpoint", "/Groups('" + oGroupSelected.Id + "')/FeedEntries");

		// reset the filter and remove filter message
		this._oViewDataModel.setProperty("/filterMessage", "");
		var oFilterPop = this._oFeedController.byId("filter_popover");
		oFilterPop.setSelectedItem(oFilterPop.getItems()[0]);

		this._oGroupSelectPopover.close();
	};

	BOMode.prototype.onBatchCompleted = function(oEvent) {

	};

	/**
	 * When the group list is finished updating, then we make the
	 * the currently selected group equal to the first group
	 * in the list.
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype.onGroupSelectorUpdateFinished = function() {
		var aListItems = this._oList.getItems();
		var oFirstListItem;
		var oFirstGroup;
		if (aListItems.length > 0) {
			oFirstListItem = aListItems[0];
			this._oList.setSelectedItem(oFirstListItem);
			oFirstGroup = oFirstListItem.getBindingContext().getObject();
			this._oViewDataModel.setProperty("/groupSelected", oFirstGroup);
			this._oViewDataModel.setProperty("/feedEndpoint", "/Groups('" + oFirstGroup.Id + "')/FeedEntries");
		}

		// detach this event handler function since we only want it to run once
		this._oList.detachUpdateFinished(this.onGroupSelectorUpdateFinished, this);
	};

	/**
	 * When the group list is finished updating, then we make the
	 * the currently selected group equal to the first group
	 * in the list.
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype.onUpdateFinished = function() {
		this._oList.setBusy(false);
	};

	/**
	 * Event handler for filter selection
	 * @private
	 * @param {object} controlEvent the event from the selection change on the filter control
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */

	BOMode.prototype.onFilterSelection = function (controlEvent) {
		var sSelectedFilter = controlEvent.getParameter("listItem");
		var oFilterData = sSelectedFilter.getBindingContext().getObject();
		var sGroupId = this._oViewDataModel.getProperty("/groupSelected/Id");

		switch (oFilterData.key) {
			case this.FILTER_CONSTANTS.GROUP_WALL:
				this._oViewDataModel.setProperty("/filterMessage", "");
				this._oViewDataModel.setProperty("/feedEndpoint", "/Groups('" + sGroupId + "')/FeedEntries");
				break;
			case this.FILTER_CONSTANTS.GROUP_OBJECT_WALL:
				this._oViewDataModel.setProperty("/filterMessage", this._oLanguageBundle.getText("ST_FILTER_TEXT") + " " + oFilterData.Name);
				this._oViewDataModel.setProperty("/feedEndpoint", "/GroupExternalObjects(GroupId='" + sGroupId + "',ExternalObjectId='" + this._sJamBOId + "')/FeedEntries");
				break;
		}
	};


	/**
	 * Get the number of new updates since the latest feed entry
	 * @return {object} Deferred object for the request
	 *
	 * @public
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype.getFeedUpdatesLatestCount = function() {
		// get the first timeline item and get the Id
		var oLatestFeedEntry = this._oFeedController.byId("timeline").getContent()[0];
		var sLatestTopLevelId = oLatestFeedEntry ? oLatestFeedEntry.getModel().getProperty("/TopLevelId") : "";
		var sGroupId = this._oViewDataModel.getProperty("/groupSelected/Id");

		if (this._oViewDataModel.getProperty("/filterMessage") === "") {
			return this._sendRequestGroup_SinceLatestCount(sLatestTopLevelId, sGroupId);
		}
		else {
			var sExternalObjectId = this._sJamBOId;
			return this._sendRequestGroupExternalObject_SinceLatestCount(sLatestTopLevelId, sGroupId, sExternalObjectId);
		}
	};
	/**
	 * A method to make a request to get the number of new updates since the latest feed entry for a group
	 * @param {string} LatestTopLevelId
	 * @param {string} GroupId
	 * @return {object} Deferred object for the request
	 *
	 * @private
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype._sendRequestGroup_SinceLatestCount = function(LatestTopLevelId, GroupId) {

		return this._sendFunctionImportODataRequest(this._oJamModel, "/Group_FeedLatestCount", {
			LatestTopLevelId: LatestTopLevelId,
			Id: GroupId
		});
	};
	/**
	 * A method to make a request to get the number of new updates since the latest feed entry for an external object in a group
	 * @param {string} LatestFeedEntryId
	 * @param {string} GroupId
	 * @param {string} ExternalObjectId
	 * @return {object} Deferred object for the request
	 *
	 * @private
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype._sendRequestGroupExternalObject_SinceLatestCount = function(LatestTopLevelId, GroupId, ExternalObjectId ) {

		return this._sendFunctionImportODataRequest(this._oJamModel, "/GroupExternalObject_FeedLatestCount", {
			LatestTopLevelId: LatestTopLevelId,
			GroupId: GroupId,
			ExternalObjectId: ExternalObjectId
		});
	};

	/**
	  * Create and initialized the models for the view
	 * Jam model: OData model for connecting to Jam
	 * @private
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype._initializeModels = function() {
		Mode.prototype._initializeModels.apply(this);

		// SMIv2 model
		var oSMIModel =  new ODataModel(BOMode._sSMIv2ServiceUrl, true);
		this._oFeedController.setSmiModel(oSMIModel);
	};

	/**
	 * Returns the SMI Service Url
	 * @public
	 * @memberOf sap.collaboration.components.feed.Mode
	 */
	BOMode.prototype.getSMIv2ServiceUrl = function() {
		return BOMode._sSMIv2ServiceUrl;
	};

	return BOMode;
});
