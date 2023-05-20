/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/*******************************************************
* GroupMaster View Controller
*
* Is the controller for the GroupMaster View and is
* responsible for setting the view data model, for
* binding data to the group list and for navigating to
* a previous master page
********************************************************/

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/StandardListItem", "sap/m/library", "sap/collaboration/components/utils/OdataUtil", "sap/collaboration/components/utils/JamUtil", "sap/collaboration/library", "sap/ui/model/json/JSONModel"], function(Controller, StandardListItem, mobileLibrary, OdataUtil, JamUtil, library, JSONModel) {
	"use strict";

	// shortcut for sap.collaboration.FeedType
	var FeedType = library.FeedType;

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	sap.ui.controller("sap.collaboration.components.fiori.feed.splitApp.GroupMaster", {

		/**
		* Called when a controller is instantiated and its View controls (if available) are already created.
		* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		* It initializes class variables.
		* @private
		*/
			onInit: function() {
				this.oOdataModel = this.getView().getViewData().odataModel;
				this.oBusinessObject = this.getView().getViewData().object;
				this.sFeedType = this.getView().getViewData().feedType;
				this.sPageTitle = this.getView().getViewData().pageTitle;
				this.sJamToken = this.getView().getViewData().jamToken;
				this.oLangBundle = this.getView().getViewData().langBundle;
				this.sPrefixId  = this.getView().getViewData().controlId;
			},

		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		* It binds data to the groups list.
		* @private
		*/
			onBeforeRendering: function() {
				var self = this;
				this.getView().groupMasterPage.setTitle(this.sPageTitle);

				this.initializeUtils();
				this.setViewModel();

				var oStandardListItem = new StandardListItem();
				oStandardListItem.bindProperty("title", "Name");
				oStandardListItem.setType(ListType.Active);
				oStandardListItem.attachPress(function(){
					var sGroupId = this.getBindingContext().getProperty(this.getBindingContext().getPath()).Id;
					var sGroupName = this.getBindingContext().getProperty(this.getBindingContext().getPath()).Name;
					var oWidgetData = self.oJamUtil.prepareWidgetData(self.sJamToken, self.sFeedType, sGroupId);
					self.oJamUtil.createJamWidget(self.sPrefixId + "widgetContainer", oWidgetData);
					sap.ui.getCore().byId(self.sPrefixId + "feedDetailsPage").setTitle(sGroupName);

				});
				sap.ui.getCore().byId(this.sPrefixId + "groupsList").bindItems("/groupsData", oStandardListItem);

				var oStandardListItem_AllGroups =
					new StandardListItem({title: this.oLangBundle.getText("GROUP_MASTER_LIST_All_GROUPS")});
				oStandardListItem_AllGroups.setType(ListType.Active);
				oStandardListItem_AllGroups.attachPress(function(){
					var sGroupIds = self.oODataUtil.getGroupIds(self.aGroupData);
					var oWidgetData = self.oJamUtil.prepareWidgetData(self.sJamToken, self.sFeedType, sGroupIds);
					self.oJamUtil.createJamWidget(self.sPrefixId + "widgetContainer", oWidgetData);
					sap.ui.getCore().byId(self.sPrefixId + "feedDetailsPage").setTitle(self.oLangBundle.getText("GROUP_MASTER_LIST_All_GROUPS"));
				});
				sap.ui.getCore().byId(this.sPrefixId + "groupsList").insertItem(oStandardListItem_AllGroups,0);
			},

		/**
		* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		* This hook is the same one that SAPUI5 controls get after being rendered.
		* @private
		*/
			onAfterRendering: function() {
			},

		/**
		* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		* @private
		*/
		//	onExit: function() {
		//
		//	}

		/**
		 * Initializes an object from the sap.collaboration.components.utils.OdataUtil class
		 * and an object from the sap.collaboration.components.utils.JamUtil class
		 * @private
		 */
			initializeUtils : function() {
				this.oODataUtil = new OdataUtil();
				this.oJamUtil = new JamUtil();
			},

		/**
		 * Sets the data model to the view
		 * @private
		 */
			setViewModel : function() {
				this.aGroupData;
				this.sFeedType === FeedType.group ?
						this.aGroupData = this.oODataUtil.getGroupsData(this.oOdataModel, "/Groups")
						:
						this.aGroupData = this.oODataUtil.getGroupsData(this.oOdataModel, "/BusinessObjects('" + this.oBusinessObject.id + "')/AssignedGroups");

				this.oViewData = {
					groupsData:	this.aGroupData
				};

				this.oViewModel = new JSONModel(this.oViewData);
				this.getView().setModel(this.oViewModel);

			},

		/**
		 * Handler for the "showNavButton" press event
		 * @private
		 */
			onNavButtonTap : function() {
				sap.ui.getCore().getEventBus().publish("nav", "back");
			}

		});

});
