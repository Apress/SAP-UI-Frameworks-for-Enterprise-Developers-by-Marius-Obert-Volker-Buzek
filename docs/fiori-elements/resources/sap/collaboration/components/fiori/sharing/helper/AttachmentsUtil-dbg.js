/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

/*************************************************************
* AttachmentsUtil helper class
*
**************************************************************/

sap.ui.define(['sap/collaboration/components/utils/CommonUtil', 'sap/ui/base/Object', 'sap/ui/model/Filter', 'sap/ui/model/FilterOperator', 'sap/m/SelectDialog', 'sap/m/StandardListItem', 'sap/m/library', 'sap/ui/model/json/JSONModel', 'sap/m/Bar', 'sap/m/Button', 'sap/m/Label', 'sap/m/Dialog', 'sap/ui/Device', 'sap/ui/core/mvc/View', 'sap/ui/core/library'],
	function(CommonUtil, BaseObject, Filter, FilterOperator, SelectDialog, StandardListItem, mobileLibrary, JSONModel, Bar, Button, Label, Dialog, Device, View, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	var AttachmentsUtil = BaseObject.extend("sap.collaboration.components.fiori.sharing.helper.AttachmentsUtil",{

		/**
		 * @memberOf sap.collaboration.components.fiori.sharing.helper.AttachmentsUtil
		 */
		constructor: function(oLangBundle, oODataUtil, oJamODataModel) {
			this.oCommonUtil = new CommonUtil();
			this.oLangBundle = oLangBundle;
			this.oODataUtil = oODataUtil;
			this.oJamODataModel = oJamODataModel;

		},

		/**
		* Creates the file selection dialog
		* @memberOf sap.collaboration.components.fiori.sharing.helper.AttachmentsUtil
		* @private
		*/
		createFileSelectionDialog : function(sPrefixId, oAttachmentsModel, fOnFileSelectionDialogConfirm, iWidth, iHeight) {

			var handleSearch = function(oEvent) {

					var sValue = oEvent.getParameter("value");
					var oFilter = new Filter("name", FilterOperator.Contains, sValue);
					var oBinding = oEvent.getSource().getBinding("items");
					oBinding.filter([oFilter]);
			};

			this.oFileSelectionDialog = new SelectDialog(sPrefixId + "_FileSelectionDialog",{
				multiSelect: true,
				rememberSelections: true,
				title: this.oLangBundle.getText("ATTACHMENTS_FIELD_TEXT",[""]),
				confirm: fOnFileSelectionDialogConfirm,
				search: handleSearch,
				liveChange: handleSearch
			});

			if (iWidth){
				this.oFileSelectionDialog.setContentWidth(iWidth.toString() + "px");
			}

			if (iHeight){
				this.oFileSelectionDialog.setContentHeight(iHeight.toString() + "px");
			}
			var oItemTemplate = new StandardListItem({
				title : "{name}",
				icon : "{icon}",
				iconDensityAware : false,
				iconInset : true,
				type : ListType.Active
			});
			this.oFileSelectionDialog.setModel(oAttachmentsModel);
			this.oFileSelectionDialog.bindAggregation("items","/attachments", oItemTemplate);

			return this.oFileSelectionDialog;
		},
		/**
		* Creates the attachments model necessary for the file selection dialog
		* @memberOf sap.collaboration.components.fiori.sharing.helper.AttachmentsUtil
		* @private
		*/
		createAttachmentsModel : function(aFiles){
			// create attachment model
			var aAttachments = [];
			for (var i = 0; i < aFiles.length; i++) {
				aAttachments.push( {
					name: aFiles[i].getName(),
					mimeType: aFiles[i].getMimeType(),
					url: aFiles[i].getUrl(),
					icon: this.oCommonUtil.getIconFromMimeType(aFiles[i].getMimeType())
				});
			}
			var oAttachmentsModel = new JSONModel({
				attachments : aAttachments
			});

			return oAttachmentsModel;
		},



		/**
		* Creates the folder selection dialog
		* @memberOf sap.collaboration.components.fiori.sharing.helper.AttachmentsUtil
		* @private
		*/
		createFolderSelectionDialog : function(sPrefixId, sGroupId, fOnFolderSelectionDialogConfirm, fOnFolderSelectionDialogCancel, iWidth, iHeight) {
			var self = this;

			// Header Bar
			var fnBack = function(oEvent){
				self.oFolderSelectionDialog.getContent()[0].getController().navigateBack();
			};
			var oHeaderBar = new Bar(sPrefixId + "_FolderSelectionDialogHeaderBar", {
				contentLeft:[new Button(sPrefixId + "_FolderSelectionDialogHeaderBarBackButton", { type: ButtonType.Back,
												visible: false,
												press: fnBack })],
				contentMiddle: [new Label(sPrefixId + "_FolderSelectionDialogHeaderBarTitle", {text:this.oLangBundle.getText("TARGET_FOLDER_FIELD_TEXT")})]
			});

			var oOKButton = new Button( sPrefixId + "_FolderSelectionDialogOKButton", {
				text: this.oLangBundle.getText("OK_BUTTON_TEXT"),
				press: function(evt){
					fOnFolderSelectionDialogConfirm(evt);
					self.oFolderSelectionDialog.close();
				}
			});
			var oCancelButton = new Button(sPrefixId + "_FolderSelectionDialogCancelButton", {
				text: this.oLangBundle.getText("CANCEL_BUTTON_TEXT"),
				press: function(evt){
					fOnFolderSelectionDialogCancel(evt);
					self.oFolderSelectionDialog.close();
					}
			});

			this.oFolderSelectionDialog = new Dialog(sPrefixId + "_FolderSelectionDialog", {
				beginButton: oOKButton,
				endButton: oCancelButton,
				customHeader: oHeaderBar
			}).addStyleClass("sapUiPopupWithPadding");
			var oFolderSelectionDialogContent = this.createFolderSelectionView(sPrefixId, sGroupId, iWidth, iHeight);
			this.oFolderSelectionDialog.addContent(oFolderSelectionDialogContent);

			if (Device.system.phone){
				this.oFolderSelectionDialog.setStretch(true);
			}

			return this.oFolderSelectionDialog;
		},
		/**
		* Creates the folder selection view
		* @memberOf sap.collaboration.components.fiori.sharing.helper.AttachmentsUtil
		* @private
		*/
		createFolderSelectionView : function(sPrefixId, sGroupId, iWidth, iHeight) {
			var oFolderView = sap.ui.view({
				id: sPrefixId + "_FolderSelectionView",
				viewData : {
					controlId: sPrefixId,
					groupId: sGroupId,
					languageBundle: this.oLangBundle,
					oDataUtil: this.oODataUtil,
					oDataModel: this.oJamODataModel,
					folderSelectionDialog: this.oFolderSelectionDialog
				},
				type: ViewType.JS,
				viewName: "sap.collaboration.components.fiori.sharing.FolderSelection"
			});

			if (iWidth){
				oFolderView.setWidth(iWidth.toString() + "px");
			}

			if (iHeight){
				oFolderView.setHeight(iHeight.toString() + "px");
			}

			return oFolderView;
		},
		/**
		 * Returns the current selected folder
		 * @memberOf sap.collaboration.components.fiori.sharing.helper.AttachmentsUtil
		 * @private
		 */
		getCurrentFolder: function(){
			if (this.oFolderSelectionDialog){
				return this.oFolderSelectionDialog.getContent()[0].getController().getCurrentFolder();
			}
			return {name: this.oLangBundle.getText("TARGET_FOLDER_FIELD_TEXT"), id:"" };
		},
		/**
		 * Returns the current group id
		 * @memberOf sap.collaboration.components.fiori.sharing.helper.AttachmentsUtil
		 * @private
		 */
		getCurrentGroupId : function(){
			return this.oFolderSelectionDialog.getContent()[0].getController().sGroupId;
		},
		/**
		 * Reset parameters of folder dialog
		 * @memberOf sap.collaboration.components.fiori.sharing.helper.AttachmentsUtil
		 * @private
		 */
		resetFolderSelection: function(sGroupId){
			if (this.oFolderSelectionDialog){
				this.oFolderSelectionDialog.getContent()[0].getController().sGroupId = sGroupId;
				this.oFolderSelectionDialog.getContent()[0].getController().sCurrentFolderId = '';
				this.oFolderSelectionDialog.getContent()[0].getController().aFolderBuffer = [];
			}
		},
		/**
		 * Set current folder id
		 * @memberOf sap.collaboration.components.fiori.sharing.helper.AttachmentsUtil
		 * @private
		 */
		setCurrentFolderId : function(sFolderId){
			this.oFolderSelectionDialog.getContent()[0].getController().sCurrentFolderId = sFolderId;
		}

	});


	return AttachmentsUtil;

});
