/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/*******************************************************
* GroupMaster View
*
* Is a view that displays the ui for a ui5 page.
* This page will contain a list of JAM groups
* It will be used as a mater page for the ui5 split app
********************************************************/

sap.ui.define(["sap/ui/core/mvc/JSView", "sap/m/Page", "sap/m/List"], function(JSView, Page, List) {
	"use strict";

	sap.ui.jsview("sap.collaboration.components.fiori.feed.splitApp.GroupMaster", {

		/** Specifies the Controller belonging to this View.
		* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
		* @private
		*/
		getControllerName : function() {
			return "sap.collaboration.components.fiori.feed.splitApp.GroupMaster";
		},

		/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
		* Since the Controller is given to this method, its event handlers can be attached right away.
		* It creates a UI5 page that has a list.
		* @param {sap.ui.controller} oController The view Controller
		* @private
		*/
		createContent : function(oController) {

			this.sPrefixId  = this.getViewData().controlId;

			this.groupMasterPage =
				new Page(this.sPrefixId  + "groupPage", {
					title: this.getViewData().groupMasterpageTitle,
					showNavButton : true,
					navButtonPress: oController.onNavButtonTap,
					content: [
								new List(this.sPrefixId + "groupsList",{inset: true})
							  ]
			});

			return this.groupMasterPage;
		}

	});

});
