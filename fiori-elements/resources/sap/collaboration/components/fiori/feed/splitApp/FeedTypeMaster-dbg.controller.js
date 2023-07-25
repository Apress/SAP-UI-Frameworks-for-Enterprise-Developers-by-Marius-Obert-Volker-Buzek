/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/*******************************************************
* FeedTypeMaster View Controller
*
* Is the controller for the FeedTypeMaster View and is
* responsible for creating JAM Feed Widget and for
* navigating to other master pages
********************************************************/

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/collaboration/library", "sap/collaboration/components/utils/JamUtil"], function(Controller, library, JamUtil) {
	"use strict";

	// shortcut for sap.collaboration.FeedType
	var FeedType = library.FeedType;

	sap.ui.controller("sap.collaboration.components.fiori.feed.splitApp.FeedTypeMaster", {

		/**
		* Called when a controller is instantiated and its View controls (if available) are already created.
		* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		* It initialize class variables.
		* @private
		*/
			onInit: function() {
				this.sJamToken = this.getView().getViewData().jamToken;
				this.sPrefixId = this.getView().getViewData().controlId;
				this.oBusinessObject = this.getView().getViewData().object;
			},

		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		* @private
		*/
		//	onBeforeRendering: function() {
		//
		//	},

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
		 * Handler for the list item press event
		 * This handler display the widget in case of feed type is "follows" or "company" by calling getJamWidget function
		 * Or it navigates to the Group Master Page in case the feed type in other that the above by calling navigateToGroupMaster
		 * @param {string} sFeedType The feed type for the widget
		 * @private
		 */
		listItemPress : function(sFeedType) {
			if (sFeedType === FeedType.follows || sFeedType === FeedType.company){
				this.getJamWidget(sFeedType);
				this.setDetailPageTitle(sFeedType);
			} else {
				this.navigateToGroupMaster(sFeedType);
			}
		},

		/**
		 * Display the widget
		 * @param {string} sFeedType The feed type for the widget
		 * @private
		 */
		getJamWidget : function(sFeedType){
			var oJamUtil = new JamUtil();
			var oWidgetData = oJamUtil.prepareWidgetData(this.sJamToken, sFeedType, "", this.oBusinessObject);
			oJamUtil.createJamWidget(this.sPrefixId + "widgetContainer", oWidgetData);
		},

		/**
		 * Sets the detail page title
		 * @param {string} sFeedType The feed type for the widget
		 * @private
		 */
		setDetailPageTitle : function(sFeedType){
			var sDetailPageTitle;
			   sFeedType === FeedType.follows ?		sDetailPageTitle = this.getView().oLangBundle.getText("FRV_DOMAIN_DATA_FEED_TYPES_FOLLOWS")
									  :  	sDetailPageTitle = this.getView().oLangBundle.getText("FRV_DOMAIN_DATA_FEED_TYPES_COMPANY");
			   sap.ui.getCore().byId(this.sPrefixId + "feedDetailsPage").setTitle(sDetailPageTitle);
	   },

	   /**
		 * Navigates the split app master page to to the Group Master View
		 * And creates the navigation data by calling the createNavigationData function
		 * @param {string} sFeedType The feed type for the widget
		 * @private
		 */
	   navigateToGroupMaster : function(sFeedType) {
		   var oNavData = this.createNavigationData(sFeedType);

		   sap.ui.getCore().getEventBus().publish("nav", "to", oNavData);
		},

		/**
		 * Creates the navigation data
		 * @param {string} sFeedType The feed type for the widget
		 * @private
		 */
		createNavigationData : function(sFeedType) {
			var oData;
			sFeedType === FeedType.group ?
					oData = {
								viewName: "sap.collaboration.components.fiori.feed.splitApp.GroupMaster",
								viewId: this.sPrefixId + "groupMasterView",
								data: {
										feedType: FeedType.group,
										lanBundle: this.getView().oLangBundle,
										groupMasterPageTitle: this.getView().oLangBundle.getText("GROUP_MASTER_PAGE_GROUP_TITLE")
								}
							}
					:
					oData = {
								viewName: "sap.collaboration.components.fiori.feed.splitApp.GroupMaster",
								viewId: this.sPrefixId + "groupMasterView",
								data: {
										feedType: FeedType.object,
										lanBundle: this.getView().oLangBundle,
										groupMasterPageTitle: this.getView().oLangBundle.getText("GROUP_MASTER_PAGE_BO_TITLE")
								}
							};

			return oData;
		}

	});

});
