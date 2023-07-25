/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/*************************************************************
* SplitApp View Controller
*
* Is the controller for the SplitApp View and is responsible
* for creating and setting the master and detail pages for
* the ui5 split app and for registering the navigation events
**************************************************************/

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/collaboration/components/utils/OdataUtil",
	"sap/ui/core/mvc/View",
	"sap/ui/core/library"
], function(Log, Controller, OdataUtil, View, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	sap.ui.controller("sap.collaboration.components.fiori.feed.splitApp.SplitApp", {

		/**
		* Called when a controller is instantiated and its View controls (if available) are already created.
		* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		* It initializes class variables and registers event handlers for the navigation.
		* @private
		*/
			onInit: function() {
				this.oSplitApp = this.getView().oSplitApp;
				this.sAppType = this.getView().getViewData().appType;
				this.oOdataModel = this.getView().getViewData().odataModel;
				this.oBusinessObject = this.getView().getViewData().object;
				this.oLangBundle = this.getView().getViewData().langBundle;

				this.sPrefixId = this.getView().getViewData().controlId;

				this.oEventBus = sap.ui.getCore().getEventBus();
				this.oEventBus.subscribe("nav", "to", this.navToHandler, this);
				this.oEventBus.subscribe("nav", "back", this.navBackHandler, this);
			},

		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered.
		* (NOT before the first rendering! onInit() is used for that one!).
		* It calls the createMasterDetail() function. Please refer to this function for the JSDoc.
		* @private
		*/
			onBeforeRendering: function() {
				this.createMasterDetail();
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
		 * Creates and sets the master and detail pages for the split app.
		 * The master page on initial load will be the Feed Type Master View.
		 * The detail page will be the Detail View.
		 * @private
		 */
			createMasterDetail : function() {

				var oODataUtil = new OdataUtil();
				var sJamUrl = oODataUtil.getJamUrl(this.oOdataModel);
				this.sJamToken = oODataUtil.getJamToken(this.oOdataModel);

				var oMasterView = sap.ui.view({
					id: this.sPrefixId + "masterView",
					viewData : {
						controlId: this.sPrefixId,
						jamToken: this.sJamToken,
						langBundle: this.oLangBundle,
						object: this.oBusinessObject
					},
					type: ViewType.JS,
					viewName: "sap.collaboration.components.fiori.feed.splitApp.FeedTypeMaster"
				});

				var oDetailView = sap.ui.view({
					id: this.sPrefixId + "detailView",
					viewData : {
						controlId: this.sPrefixId,
						appType: this.sAppType,
						jamURL:	sJamUrl,
						jamToken: this.sJamToken,
						langBundle: this.oLangBundle,
						object: this.oBusinessObject
					},
					type: ViewType.JS,
					viewName: "sap.collaboration.components.fiori.feed.commons.Detail"
				});

				this.oSplitApp.addDetailPage(oDetailView);
				this.oSplitApp.addMasterPage(oMasterView);
				this.oSplitApp.setInitialDetail(oDetailView);
				this.oSplitApp.setInitialMaster(oMasterView);
			},

		/**
		 * Handler for the "navigate to" event.
		 * This handler creates the Group Master View in case it was not previously created and add it to the master page of the split app.
		 * @param {string} sChannelId The ID for the Navigation channel.
		 * @param {string} sEventId The ID of the Event.
		 * @param {object} oData The navigation data.
		 * @private
		 */
			navToHandler : function(sChannelId, sEventId, oData) {
				if (oData && oData.viewId === this.sPrefixId + "groupMasterView") {
					if (!sap.ui.getCore().byId(oData.viewId)) {
						var oView = sap.ui.view({
							id: oData.viewId,
							viewData : {
								controlId: this.sPrefixId,
								odataModel:  this.oOdataModel,
								object:	this.oBusinessObject,
								feedType: oData.data.feedType,
								pageTitle: oData.data.groupMasterPageTitle,
								jamToken: this.sJamToken,
								langBundle: this.oLangBundle
							},
							type: ViewType.JS,
							viewName: oData.viewName
						});

						this.oSplitApp.addMasterPage(oView);
					}
					else {
						// the rerender() will not create the content of the view again or call the init of the controller, it will only start from calling the onBeforeRendering()
						// it is needed so that the group list is rebound again with the groups in case we switch from groups to bo groups or in case the data changes on the backend
						// ie to get always the latest data (groups)
						sap.ui.getCore().byId(oData.viewId).getController().sFeedType = oData.data.feedType;
						sap.ui.getCore().byId(oData.viewId).getController().sPageTitle = oData.data.groupMasterPageTitle;
						sap.ui.getCore().byId(oData.viewId).rerender();
					}
					this.oSplitApp.to(oData.viewId);
				} else {
					Log.error("nav-to event cannot be processed. Invalid data: " + oData);
				}
			},

		/**
		 * Handler for the "navigate back" event.
		 * It navigates back to the previous master page.
		 * @private
		 */
			navBackHandler : function() {
				this.oSplitApp.backMaster();
			}

		});

});
