/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/**
* Constructor for the App Controller
* @since 1.16
* constructor
* Is the controller for the App View and is responsible
* for creating and setting a page for the ui5 none-split
* app. This page will display the JAM Feed Widget.
* class App Controller<br>
*
* Is the controller for the App View and is responsible
* for creating and setting a page for the ui5 none-split
* app. This page will display the JAM Feed Widget.
*
* name sap.collaboration.components.fiori.feed.app.AppController
* @private
*/
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/collaboration/components/utils/OdataUtil",
	"sap/collaboration/components/utils/CommonUtil",
	"sap/ui/core/mvc/View",
	"sap/ui/core/library",
	"sap/collaboration/library"
], function(Log, Controller, OdataUtil, CommonUtil, View, coreLibrary, library) {
	"use strict";

	// shortcut for sap.collaboration.FeedType
	var FeedType = library.FeedType;

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	sap.ui.controller("sap.collaboration.components.fiori.feed.app.App",
		/* @lends sap.collaboration.components.fiori.feed.app.AppController */{

		/**
		* Called when a controller is instantiated and its View controls (if available) are already created (inherited).<br>
		* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		* It initialize class variables.
		* @private
		*/
		onInit: function() {
			this.oApp = this.getView().oApp;
			this.oOdataModel = this.getView().getViewData().odataModel;
			this.oLangBundle = this.getView().getViewData().langBundle;
			this.sPrefixId = this.getView().getViewData().controlId;
			this.sAppType = this.getView().getViewData().appType;
			this.sFeedType = this.getView().getViewData().feedType;
			this.sGroupIds = this.getView().getViewData().groupIds;
			this.oBusinessObject = this.getView().getViewData().object;
		},

		/**
		* This hook is invoked before the controller's View is re-rendered (inherited).<br>
		* It calls the initializeUtils() and the createDetailPage() functions.
		* @private
		*/
		onBeforeRendering: function() {
			try {
				this.initializeUtils();
				this.createDetailPage();
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.fiori.feed.app.App.controller.onBeforeRendering()");
				this.oCommonUtil.displayError();
			}
		},

		/**
		* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		* This hook is the same one that SAPUI5 controls get after being rendered.
		* @private
		*/
		//	onAfterRendering: function() {
		//
		//	},

		/**
		* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		* @private
		*/
		//	onExit: function() {
		//
		//	}

		/**
		 * Initializes an object from the sap.collaboration.components.utils.OdataUtil class.
		 * @private
		 */
		initializeUtils : function() {
			if (!this.oODataUtil){
				this.oODataUtil = new OdataUtil();
			}
			if (!this.oCommonUtil){
				this.oCommonUtil = this.oCommonUtil = new CommonUtil();
			}
		},

		/**
		 * Creates and sets a page for the app. This page is the detail view.
		 * @private
		 */
		createDetailPage : function() {
			try {
				/*if (this.sAppType === sap.collaboration.AppType.widget){
					this.getGroupIds();
				}*/
				var sViewId = this.sPrefixId + "detailView";

				if (!this.oApp.getPage(sViewId)){
					this.initOData();
					var oDetailView = sap.ui.view({
						id: sViewId,
						viewData : {
							controlId: this.sPrefixId,
							jamURL:	this.sJamUrl,
							jamToken: this.sJamToken,
							appType: this.sAppType,
							feedType: this.sFeedType,
							groupIds: this.sGroupIds,
							object: this.oBusinessObject,
							langBundle: this.oLangBundle
						},
						type: ViewType.JS,
						viewName: "sap.collaboration.components.fiori.feed.commons.Detail"
					});

					this.oApp.addPage(oDetailView);
					this.oApp.setInitialPage(oDetailView);
				}
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.fiori.feed.app.App.controller.createDetailPage()");
				throw oError;
			}
		},

		/**
		 * Gets the IDs of the JAM groups belonging to a user or the IDs of the JAM groups belonging to a user and related to a context in a back-end system.
		 * In case the feed type is "group" and the groups IDs are not set by the developer, it gets all the JAM groups belonging to a user.
		 * In case the feed type is "context" and the groups IDs are not set by the developer, it gets JAM groups belonging to a user and related to a context
		 * at the same time.
		 * In case the feed type is "context" and the groups IDs are set by the developer, it gets JAM groups belonging to a user and related to a context at
		 * the same time and uses them to filter the IDs set by the developer.
		 * @private
		 */
		getGroupIds : function() {
			var aGroupData;
			if (this.sFeedType === FeedType.group && (this.sGroupIds === undefined || this.sGroupIds === "")){
				aGroupData = this.oODataUtil.getGroupsData(this.oOdataModel, "/Groups");
				this.sGroupIds = this.oODataUtil.getGroupIds(aGroupData);
			}
			else if (this.sFeedType === FeedType.objectGroup && (this.sGroupIds === undefined || this.sGroupIds === "")){
				aGroupData = this.oODataUtil.getGroupsData(this.oOdataModel, "/BusinessObjects('" + this.oBusinessObject.id + "')/AssignedGroups");
				this.sGroupIds = this.oODataUtil.getGroupIds(aGroupData);
			}
			else if (this.sFeedType === FeedType.objectGroup && !(this.sGroupIds === undefined || this.sGroupIds === "")){
				aGroupData = this.oODataUtil.getGroupsData(this.oOdataModel, "/BusinessObjects('" + this.oBusinessObject.id + "')/AssignedGroups");
				var sContextRelatedGroupsId = this.oODataUtil.getGroupIds(aGroupData);
				this.sGroupIds = this.filterGroupIds(sContextRelatedGroupsId);
			}
		},

		/**
		 *Filter the JAM groups IDs set by the developer using the context related JAM groups IDs.
		 * @param {string} sContextRelatedGroupsId
		 * @private
		 */
		filterGroupIds : function(sContextRelatedGroupIds) {
			var sGroupIds;
			var aContextRelatedGroupIds = sContextRelatedGroupIds.split(",");
			var aInputGroupIds = this.sGroupIds.split(",");

			for (var i = 0; i < aInputGroupIds.length; i++){
				if (aContextRelatedGroupIds.indexOf(aInputGroupIds[i]) === -1){
					aInputGroupIds.splice(i,1);
					i = i - 1;
				}
			}

			if (aInputGroupIds.length !== 0){
				sGroupIds = aInputGroupIds.join();
			} else {
				sGroupIds = "";
			}

			return sGroupIds;
		},

		/**
		 * Initialize OData.
		 * @private
		 */
		initOData: function(){
			var self = this;
			var aBatchRequests = [];
			var bAsync = false;

			var fnParseBatchResults = function(aBatchResults){
				self.parseBatchResults(aBatchResults);
			};

			var fnBatchErrorCallback = function(oErrorBatchFailed){
				Log.error(oErrorBatchFailed, "", "sap.collaboration.components.fiori.feed.dialog.Component.initOdata(), fnBatchErrorCallback()");
				throw oErrorBatchFailed;
			};

			try {
				aBatchRequests = this.createBatchRequests();
				this.oODataUtil.executeODataBatchRequest(this.oOdataModel, aBatchRequests, fnParseBatchResults, bAsync, fnBatchErrorCallback);
			} catch (oInitOdataError){
				Log.error(oInitOdataError, "", "sap.collaboration.components.fiori.feed.app.App.controller.initOdata()");
				throw oInitOdataError;
			}
		},

		/**
		 * Creates batch requests for the different feed types.
		 * @return {array} aBatchRequests - An array of batch requests
		 * @throws {error} oErrorObjectUndefined Error thrown when one of the batch requests is not successfully created
		 * @private
		 */
		createBatchRequests : function(){
			var self = this;
			var aBatchRequests = [];

			try {
				//1) General batch requests, regardless of the feed type.
				if (!self.sJamUrl){
					aBatchRequests.push(self.oODataUtil.createJamUrlBatchOperation(self.oOdataModel));
				}
				aBatchRequests.push(self.oODataUtil.createJamTokenBatchOperation(self.oOdataModel));

				//2) Batch requests specific to the feed type.
				switch (self.sFeedType){
					case FeedType.object:
						aBatchRequests = aBatchRequests.concat(self.createExternalUrlBatchRequest(self.oODataUtil, self.oBusinessObject));
						break;
					case FeedType.group:
						aBatchRequests.push(self.oODataUtil.createGetGroupsDataBatchOperation(self.oOdataModel));
						break;
					case FeedType.objectGroup:
						aBatchRequests.push(self.createObjectGroupBatchRequest(self.oODataUtil, self.oBusinessObject));
						break;
				}
			} catch (oCreateBatchRequestsError){
				Log.error(oCreateBatchRequestsError, "", "sap.collaboration.components.fiori.feed.app.App.controller.createBatchRequests()");
				throw oCreateBatchRequestsError;
			}

			return aBatchRequests;
		},

		/**
		 * Create a batch request to get the external URL mapping for a business object
		 * @param {sap.collaboration.components.utils.OdataUtil} oODataUtil An object containing a reference to the OData Util Class
		 * @param {object} oBusinessObject a Business Object containing the URLs that need to be mapped
		 * @return {array} aBatchOperations an array containing the batch operations
		 * @private
		 */
		createExternalUrlBatchRequest: function(oODataUtil, oBusinessObject){
			var self = this;
			var aBatchOperations = [];

			if (oODataUtil && oBusinessObject){
				if (oBusinessObject.id){
					aBatchOperations.push(oODataUtil.createExternalOdataUrlBatchOperation(self.oOdataModel, oBusinessObject.id));
				}
				if (oBusinessObject.type){
					aBatchOperations.push(oODataUtil.createExternalOdataUrlBatchOperation(self.oOdataModel, oBusinessObject.type));
				}
			}

			return aBatchOperations;
		},

		/**
		 * Creates a batch request to get the groups assigned to business objects in the back-end
		 * @param {sap.collaboration.components.utils.OdataUtil} oODataUtil An object containing a reference to the OData Util Class
		 * @param {object} oBusinessObject a Business Object containing the URLs that need to be mapped
		 * @return {object} oBatchRequest a batch request to get the object groups
		 * @throws {error} oErrorObjectGroupBatchRequest Error thrown when the batch request cannot be created due to missing parameters (OData Util is missing, business object is undefined or its property id is missing)
		 */
		createObjectGroupBatchRequest: function(oODataUtil, oBusinessObject){
			var self = this;
			var oBatchRequest;

			if (oODataUtil && oBusinessObject && oBusinessObject.id){
				oBatchRequest = oODataUtil.createGetObjectGroupsBatchOperation(self.oOdataModel, oBusinessObject.id);
			} else {
				var oErrorObjectGroupBatchRequest = new Error("Missing parameters. Cannot create a batch request for Object Group.");
				Log.error(oErrorObjectGroupBatchRequest, "", "sap.collaboration.components.fiori.feed.app.App.controller.createObjectGroupBatchRequest()");
				throw oErrorObjectGroupBatchRequest;
			}

			return oBatchRequest;
		},

		/**
		 * Callback function to parse the results from the batch request.<br>
		 * Assumption: the results are returned in the same order as the requests.<br>
		 * The values from the batch results will be assigned to member variables to be used later when the Feed View is created.
		 * @param {array} aBatchResults An array containing the batch results to be parsed
		 * @throws {error} an error when parsing the results
		 * @private
		 */
		parseBatchResults: function(aBatchResults){
			var self = this;
			var i = 0;

			if (!self.sJamUrl){
				if (aBatchResults[i].error){
					throw new Error(aBatchResults[i].error);
				} else {
					self.sJamUrl = aBatchResults[i][self.oODataUtil.OdataUtilConstants.EndPoint.GetCollaborationHostUrl].Url;
				}
				i++;
			}

			if (aBatchResults[i].error){
				throw new Error(aBatchResults[i].error);
			} else {
				self.sJamToken = aBatchResults[i][self.oODataUtil.OdataUtilConstants.EndPoint.GetSingleUseToken].Id;
			}
			i++;

			if (self.sFeedType == FeedType.object){
				if (aBatchResults[i].error){
					throw new Error(aBatchResults[i].error);
				} else {
					self.oBusinessObject.id = aBatchResults[i][self.oODataUtil.OdataUtilConstants.EndPoint.GetExternalODataURL].URL;
					self.oBusinessObject.odata_url = self.oBusinessObject.id;
				}
				i++;

				if (aBatchResults[i].error){
					throw new Error(aBatchResults[i].error);
				} else {
					self.oBusinessObject.type = aBatchResults[i][self.oODataUtil.OdataUtilConstants.EndPoint.GetExternalODataURL].URL;
					self.oBusinessObject.metadata_url = self.oBusinessObject.type;
				}
			} else if (self.sFeedType == FeedType.group || self.sFeedType == FeedType.objectGroup){
				if (aBatchResults[i].error){
					throw new Error(aBatchResults[i].error);
				} else {
					var backEndGroupIds = self.oODataUtil.getGroupIds(aBatchResults[i].results);
					if (!self.sGroupIds){
						self.sGroupIds = backEndGroupIds;
					} else {
						self.sGroupIds = self.filterGroupIds(backEndGroupIds);
					}
				}
			}
		}

	});

});
