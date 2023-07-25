/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/**
* Is a view that displays the ui for a ui5 none-split app.
* This app will contain a page that will display the JAM
* Feed Widget
* @class App View
* @name sap.collaboration.components.fiori.feed.app.AppView
* @since 1.16
* @private
*/
sap.ui.define(["sap/ui/core/mvc/JSView", "sap/m/App"], function(JSView, App) {
	"use strict";

	sap.ui.jsview("sap.collaboration.components.fiori.feed.app.App",
		/* @lends sap.collaboration.components.fiori.feed.app.AppView */{

		/** Specifies the Controller belonging to this View.
		* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
		* @private
		*/
		getControllerName : function() {
			return "sap.collaboration.components.fiori.feed.app.App";
		},

		/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
		* Since the Controller is given to this method, its event handlers can be attached right away.
		* It creates/returns a UI5 app
		* @param {sap.ui.controller} oController The view Controller
		* @private
		*/
		createContent : function(oController) {
			this.sPrefixId = this.getViewData().controlId;
			this.oApp = new App(this.sPrefixId + "app");
			return this.oApp;
		}

	});

});
