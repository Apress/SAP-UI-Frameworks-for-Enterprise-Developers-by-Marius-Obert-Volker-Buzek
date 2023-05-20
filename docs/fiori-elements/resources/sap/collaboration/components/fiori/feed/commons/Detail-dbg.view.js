/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/**
* Detail View
*
* Is a view that displays the ui for a ui5 page. This page
* will display the JAM Feed Widget
* @class Detail View
* @name sap.collaboration.components.fiori.feed.commons.DetailView
* @since 1.16
* @private
*/
sap.ui.define(["sap/ui/core/mvc/JSView", "sap/m/Page", "sap/m/ScrollContainer"], function(JSView, Page, ScrollContainer) {
	"use strict";

	sap.ui.jsview("sap.collaboration.components.fiori.feed.commons.Detail",
		/* @lends sap.collaboration.components.fiori.feed.commons.DetailView */{

		/**
		* Specifies the Controller belonging to this View.
		* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
		* @private
		*/
		getControllerName : function() {
			return "sap.collaboration.components.fiori.feed.commons.Detail";
		},

		/**
		* Is the place where the UI is constructed (inherited).<br>
		* It is initially called once after the Controller has been instantiated.
		* Since the Controller is given to this method, its event handlers can be attached right away.
		* It creates a UI5 page with a scroll container.
		* @param {sap.ui.controller} oController The view Controller
		* @private
		*/
		createContent : function(oController) {
			var oLangBundle = this.getViewData().langBundle;
			this.sPrefixId  = this.getViewData().controlId;

			this.oDetailPage = new Page(this.sPrefixId + "feedDetailsPage",{
				title: oLangBundle.getText("FRV_DOMAIN_DATA_FEED_TYPES_FOLLOWS"),
				enableScrolling: false,
				content: [
							new ScrollContainer(this.sPrefixId + "widgetContainer",{
								width: "100%",
								height: "100%",
								horizontal: false,
								vertical: false
							})
				]
			});

			return this.oDetailPage;
		}

	});

});
