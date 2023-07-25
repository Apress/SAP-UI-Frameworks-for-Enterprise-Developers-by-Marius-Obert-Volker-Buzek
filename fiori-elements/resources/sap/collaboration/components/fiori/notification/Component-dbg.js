/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/base/Log',
	'sap/collaboration/components/utils/CommonUtil',
	'sap/collaboration/library',
	'sap/ui/core/UIComponent',
	'sap/ui/core/mvc/View',
	'sap/ui/core/library'
], function(Log, CommonUtil, library, UIComponent, View, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	/**
	 * Constructor for the notification component.
	 *
	 * @param {string} [sId] ID for the new component
	 * @param {object} [mSettings] Initial settings for the new component instance
	 * @since version 1.18
	 *
	 * @class Notification Component
	 *
	 * A Notification Component is a UI5 component that displays a SAP Jam member's latest notifications.
	 *
	 * This component refreshes itself when the number of seconds specified in the <tt>refreshInterval</tt> parameter elapses.
	 * When refreshing, the backend is called to obtain the latest notifications.
	 * @name sap.collaboration.components.fiori.notification.Component
	 * @public
	 * @deprecated Since version 1.26.0.
	 * There is no replacement for this control. The Fiori Launchpad now provides its own implementation
	 * for this control. This control was never meant to be used directly by third parties.
	 */
	var Component = UIComponent.extend("sap.collaboration.components.fiori.notification.Component",
			/** @lends sap.collaboration.components.fiori.notification.Component.prototype */ {

			metadata: {
				properties: {

					/**
					 * The OData service URL needed for the notification component.
					 */
					oDataServiceUrl:		{type: "sap.ui.core.URI", defaultValue: "/sap/opu/odata/sap/SM_INTEGRATION_SRV"},

					/**
					 * The maximum number of notifications to be displayed.
					 */
					numberOfNotifications:	{type: "int", defaultValue: 10},

					/**
					 * The time in seconds a notification is displayed before the next notification is displayed.
					 */
					transitionInterval:		{type: "int", defaultValue: 10},

					/**
					 * The time in seconds before calling the backend to update the notifications.
					 */
					refreshInterval:		{type: "int", defaultValue: 300},

					/**
					 * When a user clicks on the component, a new browser tab will open at this URL.
					 */
					notificationsTargetUrl: {type: "sap.ui.core.URI"}
				}
			},

			/**
			* Initialization of the Component
			* @private
			*/
			init: function(){
				this.iMillisecondsPerSecond = 1000;
				this.oCommonUtil = new CommonUtil();
				this.oLangBundle = this.oCommonUtil.getLanguageBundle();

				this.sStyleClassPrefix = "sapClbNotif";

			},

			/**
			* Invoked before the Component is rendered.
			* It calls the setGroupsData() function. Refer to the setGroupsData() for the JSDoc
			* @private
			*/
			onBeforeRendering: function(){

			},

			/**
			* Called when the Component has been rendered
			* Creates the sharing View or rerender it
			* @function
			* @private
			*/
			onAfterRendering: function(){
				// log properties
				Log.debug("Notification Component properties:", this.mProperties.toString(),
						"sap.collaboration.components.fiori.notification.Component.onAfterRendering()");
				Log.debug("oDataServiceUrl: " + this.getODataServiceUrl());
				Log.debug("numberOfNotifications: " + this.getNumberOfNotifications());
				Log.debug("transitionInterval: " + this.getTransitionInterval());
				Log.debug("refreshInterval: " + this.getRefreshInterval());
				Log.debug("notificationsTargetUrl: " + this.getNotificationsTargetUrl());
				if (!this.oNotificationView) {
					this.oNotificationView = sap.ui.view({
						id: this.getId() + "_NotificationView",
						viewData: {
							controlId: 	this.getId(),
							langBundle: this.oLangBundle,
							oDataServiceUrl: this.getODataServiceUrl(),
							numberOfNotifications: this.getNumberOfNotifications(),
							transitionInterval:	this.getTransitionInterval() * this.iMillisecondsPerSecond,
							refreshInterval: this.getRefreshInterval() * this.iMillisecondsPerSecond,
							notificationsTargetUrl: this.getNotificationsTargetUrl(),
							styleClassPrefix : this.sStyleClassPrefix
						},
						type: ViewType.JS,
						viewName: "sap.collaboration.components.fiori.notification.Notification"
					});
	//				var button = new sap.m.Button();
	//				this.oNotificationView.destroy = function(bSuppressInvalidate) {
	//					var a = 1;
	//				};
	//				button.destroy =  function(bSuppressInvalidate) {
	//					var b = 1;
	//				};
	//				this.addAggregation("view", this.oNotificationView);
	//				this.addAggregation("view", button);
				}

				this.oNotificationView.placeAt(this.getId());
	//			setTimeout(this.destroy.bind(this), 5000);
			},

			/**
			* Called when the Component is destroyed. Use this one to free resources and finalize activities.
			* Destroys the sharing view
			* @private
			*/
			exit: function() {
				this.deactivateNotificationRefreshAndTransition();
				// destroy the view in case the component is destroyed as the view will not be destroyed by default. It's not in the aggregation of the component.
				this.oNotificationView.destroy();
			},

			/**
			 * Renders the outer HTML for the Component
			 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
			 * @private
			 */
			render: function(oRm){
				oRm.openStart("div", this.getId()); /* FIXME: potential ID conflict as this is not an Element ID */
				oRm.class(this.sStyleClassPrefix + "Component");
				oRm.class(this.sStyleClassPrefix + "CursorPointer");
				oRm.openEnd();
				oRm.close("div");
			},

			/**
			 * When this function is called, the automatic refresh and transition are deactivated.
			 * @private
			 */
			deactivateNotificationRefreshAndTransition : function() {
				this.oNotificationView.getController().deactivateNotificationTransition();
				this.oNotificationView.getController().deactivateNotificationRefresh();
			}
		}
	);


	return Component;
});
