/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/*************************************************************
* JamUtil helper class
*
* Is responsible for the integration and communication with the
* JAM APIs
**************************************************************/

sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/Object",
	"sap/ui/dom/includeScript",
	"sap/collaboration/library"
], function(Log, BaseObject, includeScript, library) {
	"use strict";

	// shortcut for sap.collaboration.FeedType
	var FeedType = library.FeedType;

	var JamUtil = BaseObject.extend("sap.collaboration.components.utils.JamUtil",{

		FeedRenderedControllerConstants : {
			jamWidgetCSS :	{
				avatar: false,
				skin: "gr",
				post_mode: "inline",
				reply_mode: "inline",
				mobile_mode: true,
				live_update: true
			}
		},

		JamFeedType: {
			Follows: "follows",
			Company: "company",
			Group: "group",
			ObjectGroup: "context",
			Object: "external"
		},

		JamCallback: {
			autocomplete: "autocomplete",
			post_status: "post_status",
			link: "link"
		},

		JamEventType: {
			mouseover: "mouseover",
			mouseout: "mouseout",
			click: "click"
		},

		/**
		 * Creates the feed widget
		 * @param {string} sJamURL The URL for the JAM System
		 * @param {callback} fnLoadSuccess A call back function in case of success
		 * @param {callback} fnLoadError A call back function in case of error
		 * @private
		 */
		loadFeedWidgetScript : function(sJamURL, fnLoadSuccess, fnLoadError) {
			var sScriptUrl = sJamURL  + "/assets/feed_widget_v1.js";

			includeScript(sScriptUrl, "sap.collaboration.feed.JamFeedWidget", fnLoadSuccess, fnLoadError);
			Log.info("Jam Feed Widget Script Loading Asynchronously", "sap.collaboration.components.utils.JamUtil.loadFeedWidgetScript()");

		},

		/**
		 * Initialize the JAM feed widget by calling JAM API
		 * @param {string} sJamURL The URL for the JAM System
		 * @private
		 */
		initializeJamWidget : function(sJamURL) {
			try {
			   this.sapjam = eval('sapjam');
			   this.sapjam.feedWidget.init(sJamURL + "/widget/v1/feed", "single_use_token");
			   Log.info("Jam Feed Widget Initialized", "sap.collaboration.components.utils.JamUtil.initializeJamWidget()");
			   // "/c/cubetree.com/widget/v1/feed", "single_use_token"
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.utils.JamUtil.initializeJamWidget()");
				throw oError;
			}
		},

	   /**
		 * Creates the JAM feed widget by calling the JAM API
		 * @param {string} sJamToken A JAM token
		 * @param {string} sWidgetContainerID The DIV ID for the widget
		 * @param {string} sFeedType The widget feed type
		 * @param {string} sGroupIds The JAM groups ID in case feed type is "group"
		 * @param {object} oBusinessObject The object in case of object feed
		 * @private
		 */
		createJamWidget:function(sWidgetContainerID, oWidgetData){
			try {
				Log.debug("Jam Feed Widget Properties:", "", "sap.collaboration.components.utils.JamUtil.createJamWidget()");
				Log.debug("type: " + JSON.stringify(oWidgetData.type));
				Log.debug("group_id: " + JSON.stringify(oWidgetData.group_id));
				Log.debug("external_id: " + JSON.stringify(oWidgetData.external_id));
				Log.debug("external_type: " + JSON.stringify(oWidgetData.external_type));
				Log.debug("external_object: " + JSON.stringify(oWidgetData.external_object));

				this.sapjam = eval('sapjam');
				this.sapjam.feedWidget.create(sWidgetContainerID, oWidgetData);
			} catch (oError){
				Log.error(oError, "", "sap.collaboration.components.utils.JamUtil.createJamWidget()");
				throw oError;
			}

		},

		/**
		 * Creates the data needed by the JAM API to create the widget
		 * @param {string} sJamToken A JAM token
		 * @param {string} sFeedType The widget feed type
		 * @param {string} sGroupIds The JAM groups ID in case feed type is "group"
		 * @param {object} oBusinessObject The object in case of object feed
		 * @private
		 */
		prepareWidgetData:function(sJamToken, sFeedType, sGroupIds, oBusinessObject) {
			var oWidgetData;

			oWidgetData = {
				type: sFeedType,
				avatar: this.FeedRenderedControllerConstants.jamWidgetCSS.avatar,
				//skin: this.FeedRenderedControllerConstants.jamWidgetCSS.skin,
				live_update: this.FeedRenderedControllerConstants.jamWidgetCSS.live_update,
				post_mode: this.FeedRenderedControllerConstants.jamWidgetCSS.post_mode,
				reply_mode: this.FeedRenderedControllerConstants.jamWidgetCSS.reply_mode,
				mobile_mode: this.FeedRenderedControllerConstants.jamWidgetCSS.mobile_mode,
				hide_bookmark: true,
				single_use_token: sJamToken
			};

			switch (sFeedType){
				case FeedType.follows:
				case FeedType.company:
					oWidgetData.type = sFeedType;
					break;
				case FeedType.group:
				case FeedType.objectGroup:
					oWidgetData.type 			= this.JamFeedType.Group;
					oWidgetData.group_id 		= sGroupIds;
					break;
				case FeedType.object:
					oWidgetData.type 			= this.JamFeedType.Object;
					if (!oBusinessObject){
						var oErrorObjectUndefined = new Error("Object is undefined");
						Log.error(oErrorObjectUndefined, "", "sap.collaboration.components.utils.JamUtil.prepareWidgetData()");
						throw oErrorObjectUndefined;
					}
					if (!oBusinessObject.id){
						var oErrorIdUndefined = new Error("Property 'id' is undefined");
						Log.error(oErrorIdUndefined, "", "sap.collaboration.components.utils.JamUtil.prepareWidgetData()");
						throw oErrorIdUndefined;
					}
					if (!oBusinessObject.type){
						var oErrorTypeUndefined = new Error("Property 'type' is undefined");
						Log.error(oErrorTypeUndefined, "", "sap.collaboration.components.utils.JamUtil.prepareWidgetData()");
						throw oErrorTypeUndefined;
					}
					try {
						oWidgetData.external_id		= oBusinessObject.id;
						oWidgetData.external_type	= oBusinessObject.type;
						oWidgetData.external_object = oBusinessObject;
					} catch (oError){
						Log.error(oError, "", "sap.collaboration.components.utils.JamUtil.prepareWidgetData()");
						throw oError;
					}
					break;
				default:
					var sError = "Feed Type not supported";
					Log.error(sError, "", "sap.collaboration.components.utils.JamUtil.prepareWidgetData()");
					throw new Error(sError);
			}

			return oWidgetData;
		},

		/**
		 * Creates a XMLHttpRequest object to make a request the single use token from the SAP Jam REST API. If successful, returns the single use token
		 * @param {string} sCollaborationHostRestService The REST Service URL
		 * @param {function} fnAjaxCallback The callback function for the AJAX request
		 * @param {boolean} bAsync Whether the AJAX call should be asynchronous or not
		 */
		getJamSinglelUseTokens: function(sCollaborationHostRestService, fnAjaxCallback, bAsync, sCSRFToken){
			var xmlHttpRequest = new window.XMLHttpRequest();
			var sSingleUseTokenPostURL = sCollaborationHostRestService + "/single_use_tokens";

			xmlHttpRequest.open("POST",	sSingleUseTokenPostURL, bAsync);
			xmlHttpRequest.onreadystatechange = fnAjaxCallback;
			xmlHttpRequest.setRequestHeader("x-csrf-token", sCSRFToken);
			xmlHttpRequest.send();
		},

		/**
		 * Creates a XMLHttpRequest object to make a request the single use token from the SAP Jam REST API. If successful, returns the single use token
		 * @param {string} sCollaborationHostRestService The REST Service URL
		 * @param {function} fnAjaxCallback The callback function for the AJAX request
		 * @param {boolean} bAsync Whether the AJAX call should be asynchronous or not
		 */
		getCSRFToken: function(sEndPoint, fnAjaxCallback, bAsync){
			var xmlHttpRequest = new window.XMLHttpRequest();

			xmlHttpRequest.open("GET",	sEndPoint, bAsync);
			xmlHttpRequest.onreadystatechange = fnAjaxCallback;
			xmlHttpRequest.setRequestHeader("x-csrf-token", "fetch");
			xmlHttpRequest.send();
		}
	});

	return JamUtil;
});
