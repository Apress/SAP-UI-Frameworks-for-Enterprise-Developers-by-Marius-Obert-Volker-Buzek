/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define(["sap/ui/core/mvc/JSView", "sap/m/List", "sap/m/VBox"], function(JSView, List, VBox) {
	"use strict";

	sap.ui.jsview("sap.collaboration.components.fiori.sharing.FolderSelection", {

		/**
		 * Specifies the Controller belonging to this View.
		 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
		 * memberOf DisplayFolders
		 */
		getControllerName : function() {
			return "sap.collaboration.components.fiori.sharing.FolderSelection";
		},

		/**
		 * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
		 * Since the Controller is given to this method, its event handlers can be attached right away.
		 * Creates and returns a UI5 mobile list
		 */
		createContent : function(oController) {
			var sPrefixId = this.getViewData().controlId;

			this.oFoldersList = new List(sPrefixId + "_FoldersList", {
				inset : false,
				showNoData : true,
				noDataText : this.getViewData().languageBundle.getText("FOLDER_EMPTY"),
				growing : true,
				growingThreshold : oController.constants.top,
				updateStarted: function(oControlEvent){ oController.updateStarted(oControlEvent); }
			});

			var oDisplayFoldersVBox = new VBox(sPrefixId + "_DisplayFoldersLayout", {
				width: "100%",
				height: "100%",
				items: [this.oFoldersList]
			});

			return oDisplayFoldersVBox;
		}
	});


});
