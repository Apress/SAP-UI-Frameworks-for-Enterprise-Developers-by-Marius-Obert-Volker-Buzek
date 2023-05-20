/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/isEmptyObject",
	"sap/ui/thirdparty/jquery",
	"./Mode",
	"sap/collaboration/components/utils/PendingRequestsUtil"
], function(Log, isEmptyObject, jQuery, Mode, PendingRequestsUtil) {
	"use strict";

	var GroupIDsMode = Mode.extend("sap.collaboration.components.feed.GroupIDsMode", {
		constructor: function(oFeedController) {
			Mode.apply(this, [oFeedController]);

			// instance variables
			// Utility to keep track of the pending OData requests.
			// Can be used to abort all the pending requests.
			this._oPendingRequestsUtil = new PendingRequestsUtil();
			this._iOpenGroupRequests;
			this._aGroupsToLoad;
			this.oResult;

			this._oList.setModel(this._oViewDataModel);
		}
	});

	/**
	 * Asks the GroupIDsMode object to start.
	 * @param {string[]} aFeedSourcesData an array of group ids
	 * @public
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype.start = function(aFeedSourcesData) {
		// The if statement below verifies that the aFeedSourcesData
		// is an array of strings.
		if (!this._oCommonUtil.isArrayOfStrings(aFeedSourcesData)) {
			var sErrorMessage = "The feedSources' data object is invalid.";
			this._oFeedController.logError(sErrorMessage);
			throw new Error(sErrorMessage);
		}

		// disable group feed if array is empty
		if (aFeedSourcesData.length === 0) {
			this._oFeedController.disableGroupFeed();
			return;
		}

		// remove duplicates from array
		aFeedSourcesData = aFeedSourcesData.filter(function (groupId, index) {
			return aFeedSourcesData.indexOf(groupId) === index && groupId.trim() !== "";
		});


		// fill the property /groups in the model
		this._oViewDataModel.setProperty("/groups", []);
		this._oViewDataModel.setProperty("/groupSelected/Id", undefined);
		this._iOpenGroupRequests = 0;
		this._aGroupsToLoad = jQuery.merge([], aFeedSourcesData);

		this._oList.bindItems({
			path: "/groups",
			template: this._oListItemTemplate
		});

		this._oGroupSelectPopover.setBusyIndicatorDelay(0).setBusy(true);
		this._fillGroupInfo(); // get the group info (name, weburl ...)
	};

	GroupIDsMode.prototype.onBatchCompleted = function(oEvent) {
		this._oJamModel.setUseBatch(false); // batch is required for initial load, turn off for all subsequent requests
		if (this._iOpenGroupRequests === 0){
			if (this._oGroupSelectPopover !== undefined){
				this._oGroupSelectPopover.setBusy(false);
			}
		}
	};

	/**
	 * Asks the GroupIDsMode object to stop.
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype.stop = function() {
		this._oPendingRequestsUtil.abortAll();
	};

	/**
	 * Returns the OData path for Add Post
	 * @public
	 * @return {string} The OData path for Add Post
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype.getAddPostPath = function () {
		var sGroupId = this._oViewDataModel.getProperty("/groupSelected/Id");

		return "/Groups('" + sGroupId + "')/FeedEntries";
	};

	/**
	 * Displays  the feed source selector popover next to the specified control.
	 * @param {object} oControl the control next to which to display the feed source selector
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype.displayFeedSourceSelectorPopover = function(oControl) {
		this._oGroupSelectPopover.openBy(oControl);
	};

	/**
	 * Event handler for the selector list when an item is selected.
	 * The structure of the model set on the individual list items
	 * must be known, and there must exist a way of mapping the
	 * selected list item
	 * @param {object} oEvent
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype.onGroupSelected = function(oEvent) {
		var oGroupSelected = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
		this._oViewDataModel.setProperty("/groupSelected", oGroupSelected);

		this._oViewDataModel.setProperty("/feedEndpoint", "/Groups('" + oGroupSelected.Id + "')/FeedEntries");

		this._oGroupSelectPopover.close();
	};

	/**
	 * Get and fill the group info of the groups
	 * @private
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype._fillGroupInfo = function() {
		var iBatchLimit = 10; //max batch size
		var iBatchId = 0; //id of the current batch
		var iBatchRequestCount = 0; // number of requests in current batch
		var iGroupsInRequestCount = 0; // number of groups in current request
		var iGroupsPerRequestLimit = 20; // limit for number of groups per request
		this._oJamModel.setUseBatch(true);
		var sFilterParameter = "$filter=Id eq '";

		for (var iLoopCounter = 0, iGroupsToLoadCount = this._aGroupsToLoad.length; iLoopCounter < iGroupsToLoadCount; iLoopCounter++ ){
			// building $filter URL parameter
			if (!(iLoopCounter % iGroupsPerRequestLimit == 0)) {
				sFilterParameter = sFilterParameter.concat(" or Id eq '" + this._aGroupsToLoad[iLoopCounter].replace(/'/g, "''") + "'");
			} else {
				sFilterParameter = sFilterParameter.concat(this._aGroupsToLoad[iLoopCounter].replace(/'/g, "''") + "'");
			}
			iGroupsInRequestCount++;

			// if the limit of groups per request or end of source array is reached
			if (iGroupsInRequestCount === iGroupsPerRequestLimit || iLoopCounter + 1 === iGroupsToLoadCount){
				this._iOpenGroupRequests++;
				var oResult;
				this._loadGroups(sFilterParameter, iBatchId).done((function(oData, oResponse) {

					oResult = this._oCommonUtil.getODataResult(oData);

					if (!isEmptyObject(oResult)){  //if the request returns no response the result object is empty
						if (oResult.length != undefined){ //if oResult.length is defined the response is an array of objects
							var iIndexInFeedSources = this._aGroupsToLoad.indexOf(oResult[0].Id);
							for (var iCount = 0, iODataResultLength = oResult.length; iCount < iODataResultLength; iCount++){
								this._oViewDataModel.setProperty("/groups/" + iIndexInFeedSources, oResult[iCount]);
								iIndexInFeedSources++;
							}
						} else { //if oResult.length is undefined the response is a single object
							this._oViewDataModel.setProperty("/groups/" + this._aGroupsToLoad.indexOf(oResult.Id), oResult);
						}
					}
					this._iOpenGroupRequests--;
					//After all request are handled clean up the data model
					if (this._iOpenGroupRequests === 0){
						if (this._oViewDataModel.getProperty("/groups/").length === 0) { // disable group feed component if there are no groups
							this._oFeedController.disableGroupFeed();
							Log.warning("No group information was retrieved for the current user.");
						}
						else {
							this._oFeedController.enableGroupFeed();
							var aGroups = this._oViewDataModel.getProperty("/groups/");
							aGroups = aGroups.filter(function(oCurrentGroup){ return oCurrentGroup !== undefined && oCurrentGroup !== null; });
							this._oViewDataModel.setProperty("/groups/", aGroups);
							this._oViewDataModel.setProperty("/groupSelected", aGroups[0]);
							this._oViewDataModel.setProperty("/feedEndpoint", "/Groups('" + aGroups[0].Id + "')/FeedEntries");
						}
					}
				}).bind(this));

				iBatchRequestCount++;
				iGroupsInRequestCount = 0;
				sFilterParameter = "$filter=Id eq '";
			}

			// limit of requests per batch reached
			if (iBatchRequestCount == iBatchLimit){
				iBatchId++;
				iBatchRequestCount = 0;
			}
		}
	};

	/**
	 * Fetches ID,Name and WebUrl for a list of groups definded in the $filter URL parameter
	 * @param {string} URL parameter for $filter
	 * @param {string} batchGroupId
	 * @private
	 * @return {object} A deferred promise object
	 * @memberOf sap.collaboration.components.feed.GroupIDsMode
	 */
	GroupIDsMode.prototype._loadGroups = function(sFilterParameter, batchGroupId) {
		// if Jam is not configured, do not execute
		if (!this.isJamServiceAvailable()) {
			return;
		}

		var that = this;

		var loadingGroups = jQuery.Deferred();

		var sPath = "/Groups/";
		var mParameters = {
			"urlParameters": sFilterParameter + "&$select=Id,Name,WebURL",
			"success": function(oData, response) {
				loadingGroups.resolveWith(that, [oData,response]);
			},
			"error": function(oError) {
				loadingGroups.rejectWith(that, [oError]);
				that._oFeedController.logError("The group information was not retrieved.");
			},
			"batchGroupId": batchGroupId
		};

		var request = this._oJamModel.read(sPath, mParameters);
		this._oPendingRequestsUtil.add(request);
		var oPromise = loadingGroups.promise(request);
		oPromise.always(function(){
			this._oPendingRequestsUtil.remove(request);
		});
		return oPromise;
	};

	return GroupIDsMode;
});

