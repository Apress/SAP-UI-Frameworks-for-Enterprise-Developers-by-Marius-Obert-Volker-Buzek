/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/*******************************************************
* SplitApp View
*
* Is a view that displays the ui for a ui5 split app.
* This split app will contain a master page and a detail
* page. The master page will display either a list of
* Feed Types or a list of JAM groups. The detail page
* will display the JAM Feed WIdget
********************************************************/

sap.ui.define(["sap/ui/core/mvc/JSView", "sap/m/SplitApp"], function(JSView, SplitApp) {
	"use strict";

	sap.ui.jsview("sap.collaboration.components.fiori.feed.splitApp.SplitApp", {

		/** Specifies the Controller belonging to this View.
		* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
		* @private
		*/
		getControllerName : function() {
			return "sap.collaboration.components.fiori.feed.splitApp.SplitApp";
		},

		/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
		* Since the Controller is given to this method, its event handlers can be attached right away.
		* It creates a UI5 split app
		* @param {sap.ui.controller} oController The view Controller
		* @private
		*/
		createContent : function(oController) {
			this.sPrefixId = this.getViewData().controlId;
			this.oSplitApp = new SplitApp(this.sPrefixId + "splitApp");
			return this.oSplitApp;
		}

	});

});
