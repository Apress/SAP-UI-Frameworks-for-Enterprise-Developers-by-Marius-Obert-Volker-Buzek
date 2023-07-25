/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/m/StandardListItem", "sap/m/library"], function(Controller, JSONModel, StandardListItem, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	sap.ui.controller("sap.collaboration.components.fiori.sharing.FolderSelection", {

			constants:{
				top: 20
			},
			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * Initialize class variables, set the view model and bind the list items
			 * memberOf DisplayFolders
			 */
			onInit: function() {
				this.oLangBundle = this.getView().getViewData().languageBundle;

				this.oODataModel = this.getView().getViewData().oDataModel;
				this.oODataUtil = this.getView().getViewData().oDataUtil;

				this.sGroupId =  this.getView().getViewData().groupId;
				this.oFolderSelectionDialog = this.getView().getViewData().folderSelectionDialog; //needed to change the headerbar

				this.sCurrentFolderId = '';
				this.aFolderBuffer = [];
			},

		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		*/
			onBeforeRendering: function() {
				this.refreshFolderSelection(this.sCurrentFolderId);
			},

		/**
		* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		* This hook is the same one that SAPUI5 controls get after being rendered.
		*/
			onAfterRendering: function() {
			},
			/**
			 * Rebuilds the displayed folder list
			 * @private
			 */
			refreshFolderSelection: function(sCurrentFolderId){
				// Build new list and replace it in the dialog
				var aFolders = this.buildFolderList(sCurrentFolderId);
				this.setViewModel(aFolders);
				this.bindFoldersList();
				this.refreshHeaderBar(sCurrentFolderId);

			},
			/**
			 * Fetch the folders to be displayed
			 * @private
			 */
			buildFolderList: function(sFolderId){
				var aSubFolders = [];


				var oFolder = this.getFolder(sFolderId);
				aSubFolders = this.getSubFolders(oFolder);

				// add empty folder items so that the number of folders in the list is displayed correctly
				if (oFolder.subFolderCount > aSubFolders.length){
					var difference = oFolder.subFolderCount - aSubFolders.length;
					for (var i = 0; i < difference; i++){
						aSubFolders.push({});
					}
				}
				return aSubFolders;
			},
			/**
			* Sets the view model with the passed folders
			* @private
			*/
			setViewModel : function(aFolders) {

				this.oViewData = {
					folders: aFolders
				};

				this.oViewModel = new JSONModel(this.oViewData);
				this.getView().setModel(this.oViewModel);
			},
			/**
			* Binds data to the folders List
			* @private
			*/
			bindFoldersList : function() {
				var self = this;
				var oItemTemplateStandardIcon = new StandardListItem({
					title : "{name}",
					icon : "{icon}",
					type : ListType.Navigation,
					press: self.selectFolder()
				});
				this.getView().oFoldersList.bindAggregation("items","/folders", oItemTemplateStandardIcon);
			},
			/**
			 * Refreshes the header bar (title, back button visibility)
			 * @private
			 */
			refreshHeaderBar: function(sFolderId){
				// Set Dialog
				if (!sFolderId == ""){		// Folder
					var oFolder = this.getFolder(sFolderId);
					this.setFolderSelectionDialogTitle(oFolder.name);
					this.setFolderSelectionDialogBackButtonVisibility(true);
				} else {					// Root Folder
					this.setFolderSelectionDialogTitle(this.oLangBundle.getText("TARGET_FOLDER_FIELD_TEXT"));
					this.setFolderSelectionDialogBackButtonVisibility(false);
				}
			},
			/**
			 * Event handler for when folder is clicked on
			 */
			selectFolder:  function(oEvent){
				var self = this;
				return function(oEvent){
					var sFolderId = oEvent.oSource.getBindingContext().getObject().id;

					self.refreshFolderSelection(sFolderId);
					self.sCurrentFolderId = sFolderId;
				};
			},
			/**
			 * Event handler for navigating back
			 */
			navigateBack: function(oEvent){
				var oCurrentFolder = this.getFolder(this.sCurrentFolderId);
				var sParentId = oCurrentFolder.parent;

				this.refreshFolderSelection(sParentId);
				this.sCurrentFolderId = sParentId;
			},
			/**
			 * Set the title in the header bar
			 * @private
			 */
			setFolderSelectionDialogTitle: function(folderName){
				var oHeaderBar = this.oFolderSelectionDialog.getCustomHeader();
				var oTitleLabel = oHeaderBar.getContentMiddle()[0];
				oTitleLabel.setText(folderName);
			},
			/**
			 * Set the visibility of the back button in the header bar
			 * @private
			 */
			setFolderSelectionDialogBackButtonVisibility: function(isVisible){
				var oHeaderBar = this.oFolderSelectionDialog.getCustomHeader();
				var oBackButton = oHeaderBar.getContentLeft()[0];
				oBackButton.setVisible(isVisible);
			},
			/**
			 * Returns the current selected folder
			 * used by AttachmentUtils
			 * @private
			 */
			getCurrentFolder: function(){
				if (this.sCurrentFolderId === ''){
					return {name: this.oLangBundle.getText("TARGET_FOLDER_FIELD_TEXT"), id:"" };
				}
				return this.getFolder(this.sCurrentFolderId);
			},

			/**
			 * Event handler for when list update is triggered
			 * @private
			 */
			updateStarted: function(oControlEvent){
				if (oControlEvent.mParameters.reason == 'Growing') {
					var aSubFolders = [];
					var oFolder = this.getFolderFromBuffer(this.sCurrentFolderId);

					var subFolderCount =  this.getSubFoldersFromBuffer(this.sCurrentFolderId).length;
					if (oFolder.subFolderCount != subFolderCount ){
						aSubFolders = this.fetchSubFolders( this.sCurrentFolderId, subFolderCount );
					}
					if (aSubFolders.length > 0) {
						this.addFoldersToBuffer(aSubFolders);
						// replace the blank entries in the view model
						for ( var i = 0; i < aSubFolders.length; i++ ){
							this.oViewData.folders[i + subFolderCount] = aSubFolders[i];
						}
					}
				}
			},

			/******************************
			 * FOLDER BUFFER METHODS
			 ******************************/
			/**
			 * Save folders to buffer and returns array of Folder objects
			 * @private
			 */
			addFoldersToBuffer : function(aFolders){
				if (!this.aFolderBuffer){
					this.aFolderBuffer = [];
				}

				for (var i = 0; i < aFolders.length; i++){
					this.aFolderBuffer.push(aFolders[i]);
				}
			},
			/**
			 * Returns sub folders from buffer
			 * @private
			 */
			getSubFoldersFromBuffer : function(sFolderId){
				var sId = '';
				if (sFolderId){
					sId = sFolderId;
				}

				var hasParent = function(folder){
					return folder.parent == sId;
				};

				return this.aFolderBuffer.filter(hasParent);
			},
			/**
			 * Returns folder from buffer
			 * @private
			 */
			getFolderFromBuffer : function(sFolderId){
				var hasId = function(folder){
					return folder.id == sFolderId;
				};
				var aFiltered =  this.aFolderBuffer.filter(hasId);
				return aFiltered[0];// should only find 1
			},
			/**
			 * Return specific folder
			 * @private
			 */
			getFolder : function(sFolderId){
				var folder = this.getFolderFromBuffer(sFolderId);
				if (!folder && sFolderId == ''){ // folder is not in buffer && it's the root folder.
					var result = this.oODataUtil.getSubFolders(this.oODataModel, this.sGroupId, null, '0', this.constants.top);
					folder = { name: this.oLangBundle.getText("TARGET_FOLDER_FIELD_TEXT"), id: '', parent: '0', subFolderCount : result.count, icon:"sap-icon://folder" };
					this.addFoldersToBuffer([folder]); // add root folder to buffer

					var aSubFolders = this.convertFolderEntities(result.folders, '');
					this.addFoldersToBuffer(aSubFolders);

				}
				if (folder.subFolderCount == undefined){ // folder is in buffer but does not have the subfolderCount
					var result = this.oODataUtil.getSubFolders(this.oODataModel, null, sFolderId, '0', this.constants.top);
					folder.subFolderCount = result.count;

					var aSubFolders = this.convertFolderEntities(result.folders, sFolderId );
					this.addFoldersToBuffer(aSubFolders);

				}
				return folder;
			},
			/**
			 * Return subfolders of folder
			 * @private
			 */
			getSubFolders : function(oFolder){
				var aSubFolders = [];
				if (oFolder.subFolderCount > 0){
					aSubFolders = this.getSubFoldersFromBuffer(oFolder.id);
				}
				return aSubFolders;
			},
			/**
			 * Convert the folder entities received from back end to this format
			 * { name, id, parent, hasNoChildren }
			 * @private
			 */
			convertFolderEntities : function(aFolders, sParentId) {
				var aConvertedFolders = [];
				for (var i = 0; i < aFolders.length; i++){
					aConvertedFolders.push( { name: aFolders[i].Name, id: aFolders[i].Id, parent: sParentId, icon:"sap-icon://folder" } );
				}
				return aConvertedFolders;
			},

			/**
			 * Returns sub folders of either the group or folder from Jam
			 * If sFolderId is blank or undefined, the sub folders of the root of the group is returned
			 * @private
			 */
			fetchSubFolders : function(sFolderId, skip ){
				var aSubFolders = [];

				if (!sFolderId || sFolderId == ''){ 		// root folder
					aSubFolders = this.oODataUtil.getSubFolders(this.oODataModel, this.sGroupId, null, skip, this.constants.top).folders; // group
					aSubFolders = this.convertFolderEntities(aSubFolders, '');
				}
				else {		// folder
					aSubFolders = this.oODataUtil.getSubFolders(this.oODataModel, null, sFolderId, skip, this.constants.top).folders; // folder
					aSubFolders = this.convertFolderEntities(aSubFolders, sFolderId );
				}
				return aSubFolders;
			},

			/**
			 * Clear the folder buffer
			 * @private
			 */
			clearFolderBuffer: function(){
				this.oFolderSelectionDialog.getContent()[0].getController().clearFolderBuffer();
			}
		});

});
