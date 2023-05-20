/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define([
	'sap/base/Log',
	'sap/collaboration/components/utils/JamUtil',
	'sap/ui/core/mvc/Controller',
	'sap/collaboration/library'
],
	function(Log, JamUtil, Controller, library) {
	"use strict";

	// shortcut for sap.collaboration.FeedType
	var FeedType = library.FeedType;

	// shortcut for sap.collaboration.AppType
	var AppType = library.AppType;

	/**********************************************************
	* Detail View Controller
	*
	* Is the controller for the Detail View and is responsible
	* for loading JAM API Script and for creating and rendering
	* the JAM Feed Widget
	***********************************************************/

	sap.ui.controller("sap.collaboration.components.fiori.feed.commons.Detail", {

	/**
	* Called when a controller is instantiated and its View controls (if available) are already created.
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	* It initializes class variables.
	* @memberOf detail
	*/
		onInit: function() {
			this.sJamToken = this.getView().getViewData().jamToken;
			this.sJamURL = this.getView().getViewData().jamURL;
			this.oLangBundle = this.getView().getViewData().langBundle;
			this.sPrefixId  = this.getView().getViewData().controlId;
			this.oBusinessObject = this.getView().getViewData().businessObject;

			this.bJamWidgetInitialized = false;

			if (this.getView().getViewData().appType === AppType.split){
				this.sFeedType = FeedType.follows;
			} else {
				this.sFeedType = this.getView().getViewData().feedType;
				this.getView().oDetailPage.setShowHeader(false);
			}

			this.oJamUtil = new JamUtil();
		},

	/**
	* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	* (NOT before the first rendering! onInit() is used for that one!).
	* @memberOf detail
	*/
		onBeforeRendering: function() {
		},

	/**
	* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	* This hook is the same one that SAPUI5 controls get after being rendered.
	* It calls the loadFeedWidgetScript() function. Please refer to this function for the JSDoc.
	* @memberOf detail
	*/
		onAfterRendering: function() {
			try {
				this.loadFeedWidget(this.sJamURL);
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.fiori.feed.commons.Detail.onInit()");
				throw oError;
			}
		},

		/**
		 * Loads the JAM API scripts used to create feed widget
		 * @private
		 */
		loadFeedWidget: function(sJamURL){
		   var self = this;

		   try {
			   //1) Prepare the widget data
			   var sGroupIds = self.getView().getViewData().groupIds;
			   var oWidgetData = this.oJamUtil.prepareWidgetData(self.sJamToken, self.sFeedType, sGroupIds, self.oBusinessObject);

			   // Callback function to get notified once the script has been loaded
			   var fLoadSuccess = function(response){
				   Log.info("Jam Feed Widget Loaded Successfully","sap.collaboration.components.fiori.feed.commons.Detail.onInit()");

				   //3) Initialize the jam widget
				   self.oJamUtil.initializeJamWidget(self.sJamURL);
				   self.bJamWidgetInitialized = true;

				   //4) Create the Feed Widget
				   self.oJamUtil.createJamWidget(self.sPrefixId + "widgetContainer", oWidgetData);
				};

				var fLoadError = function(oError){
					Log.error(oError, "", "sap.collaboration.components.fiori.feed.commons.Detail.loadFeedWidgetScript()");
					throw oError;
				};

				//2) Load the feed widget
				// if the self.bJamWidgetInitialized = true this means that the Jam script is loaded and the widget is initialized
				if (this.bJamWidgetInitialized === false){
					this.oJamUtil.loadFeedWidgetScript(sJamURL, fLoadSuccess, fLoadError);
				} else {
					this.oJamUtil.createJamWidget(self.sPrefixId + "widgetContainer", oWidgetData);
				}
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.fiori.feed.commons.Detail.loadFeedWidgetScript()");
				throw oError;
			}

		}

	/**
	* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	* @memberOf detail
	*/
	//	onExit: function() {
	//
	//	}

	});

});
