/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/mvc/JSView","sap/m/List","sap/m/VBox"],function(t,e,o){"use strict";sap.ui.jsview("sap.collaboration.components.fiori.sharing.FolderSelection",{getControllerName:function(){return"sap.collaboration.components.fiori.sharing.FolderSelection"},createContent:function(t){var i=this.getViewData().controlId;this.oFoldersList=new e(i+"_FoldersList",{inset:false,showNoData:true,noDataText:this.getViewData().languageBundle.getText("FOLDER_EMPTY"),growing:true,growingThreshold:t.constants.top,updateStarted:function(e){t.updateStarted(e)}});var a=new o(i+"_DisplayFoldersLayout",{width:"100%",height:"100%",items:[this.oFoldersList]});return a}})});