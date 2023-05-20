/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/base/Log',
	'sap/base/security/encodeURL',
	'./helper/AttachmentsUtil',
	'./helper/ShareUtil',
	'sap/collaboration/components/utils/CommonUtil',
	'sap/collaboration/components/utils/OdataUtil',
	'sap/ui/core/mvc/Controller',
	'sap/ui/thirdparty/jquery',
	'sap/ui/model/odata/ODataModel',
	'sap/ui/model/odata/CountMode',
	'sap/m/StandardListItem',
	'sap/m/library'
], function(Log, encodeURL, AttachmentsUtil, ShareUtil, CommonUtil, OdataUtil, Controller, jQuery, ODataModel, CountMode, StandardListItem, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	sap.ui.controller("sap.collaboration.components.fiori.sharing.Sharing", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * Initialize class variables
		 * @memberOf Sharing
		 */
		onInit: function() {
			// References to the View's controls needed by the Sharing controller.
			this.oNoteTextArea = this.getView().oNoteTextArea;
			this.oAttachmentsInput = this.getView().oAttachmentsInput;
			this.oTargetFolderInput = this.getView().oTargetFolderInput;

			this.oODataUtil = undefined;
			this.sPrefixId = this.getView().getViewData().controlId;
			this.oLangBundle = this.getView().getViewData().langBundle;

			this.iJamGroupsCount = 0;

			// Share Object and External Object
			this.sObjectId = this.getView().getViewData().objectId;
			this.sObjectShare = this.getView().getViewData().objectShare;
			this.oObjectDisplay = this.getView().getViewData().objectDisplay;
			this.oExternalObject = undefined;
			this.oMappedExternalObject = undefined;
			this.sMemberEmail = undefined; // remove after jam implements feed entry after sharing BO

			this.oSharingDialog = this.getView().getViewData().sharingDialog;
			this.fNoGroupsCallBack = this.getView().getViewData().noGroupsCallBack;

			this.oCommonUtil = new CommonUtil();

			// Variables for Attachment Selection
			this.oAttachments = this.getView().getViewData().attachments;
			this.bAttachmentsCB = false;
			this.aFiles = [];
			this.aSelectedFiles = [];

			// Variables for Group Selection
			this.sSelectedFolderId = '';
			this.oItemTemplate = undefined;
			this.oSelectedGroup = undefined;

			// Suggestions request
			this.gettingSuggestions = undefined;
		},

		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		* @memberOf Sharing
		*/
		onBeforeRendering: function() {
			try {
				// Variables for Group Selection, has to be in the onBeforerendering to be reset each time the component is loaded
				this.sSelectedGroupId = '';
				this.sSelectedGroupName = '';

				// Initialize Utility Classes
				if (!this.oSMIODataModel){
					this.initializeOdataModel();
				}
				if (!this.oODataUtil){
					this.initializeOdataUtils();
				}
				if (!this.oAttachmentsUtil){
					this.initializeAttachmentsUtil();
				}
				// The share util has to be initialized each time the dialog opens to handle the upload correctly
				this.initializeShareUtil();

				// Setup to be done on the controls before rendering
				this.preRenderSetup();
				// Fetch data needed for the Share view
				this.fetchData();

				// Attachments Initialization ***********************************************
				this.clearAttachmentsData();
				this.oAttachments = this.getView().getViewData().attachments;

				if (this.oAttachments && this.oAttachments.attachmentsArray){
					this.aFiles = this.oAttachments.attachmentsArray;
					// Enable/Disable attachment selection
					if (this.aFiles.length > 0){
						this.getView().oAttachmentsInput.setEnabled(true);
					}
					else {
						this.getView().oAttachmentsInput.setEnabled(false);
					}

					// Update the attachments dialog
					if (this.oFileSelectionDialog){
						var oAttachmentsModel = this.oAttachmentsUtil.createAttachmentsModel(this.aFiles);
						this.oFileSelectionDialog.setModel(oAttachmentsModel);
					}

					// Show attachments fields
					this.showAttachmentsFields(true);
				}
				else {
					// Hide attachments button
					this.showAttachmentsFields(false);
				}
				//***************************************************************************

				// In case the view was rerendered (ie it was created previously and then reused again), we have to reset the field for note
				if (this.sObjectId != this.getView().getViewData().objectId){
					this.sObjectId = this.getView().getViewData().objectId;
				}

				// In case the view was rerendered (ie it was created previously and then reused again) or the
				// user changed the note, we have to reset the field for note
				if (this.sObjectShare != this.getView().getViewData().objectShare ||
						sap.ui.getCore().byId(this.sPrefixId + "_NoteTextArea").setValue !== this.getView().getViewData().objectShare){
					this.sObjectShare = this.getView().getViewData().objectShare;
					sap.ui.getCore().byId(this.sPrefixId + "_NoteTextArea").setInitialValue(this.sObjectShare);
				}

				// In case of rerendering when display object was different than previous one, there are two possible scenarios:
				// 1. the previous display object existed, in this case remove the previous one then add the new item
				// 2. the previous display object did not exist, in this case just add the new item
				if (this.oObjectDisplay != this.getView().getViewData().objectDisplay){
					if (this.oObjectDisplay != undefined){
						this.getView().oSharingVBox.removeItem(0);
					}
					this.oObjectDisplay = this.getView().getViewData().objectDisplay;
					this.getView().oSharingVBox.insertItem(this.oObjectDisplay, 0);
				}

			}
			catch (oError){
				if (this.oSharingDialog){
					throw oError;
				}
				this.oCommonUtil.displayError(oError);
			}
		},

		/**
		* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		* This hook is the same one that SAPUI5 controls get after being rendered.
		* @memberOf Sharing
		*/
		onAfterRendering: function() {
			// After some investigation, we noticed that setting the focus without a delay only
			// worked on browsers other than Chrome. So to get the focus to appear on the select
			// control in as many browsers as possible, we make the call to the focus function
			// with some delay for all browsers.
			setTimeout(function() {sap.ui.getCore().byId(this.sPrefixId + "_GroupSelect").focus();}.bind(this), 1);
		},

		/**
		* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		* @memberOf Sharing
		*/
		onExit: function() {
			this.getView().destroyContent();
		},

		/**
		* Does some setup required on some control (i.e disable/enable, set text ...)
		* @private
		*/
		preRenderSetup : function() {
			this.getView().oGroupSelect.setEnabled(false);
			this.setGroupSelectionText("");
			if (this.oAttachments && this.oAttachments.attachmentsArray){
				this.getView().oTargetFolderInput.setEnabled(false);
			}
			this.getView().oNoteTextArea.setEnabled(false);
			// if Share is in dialog
			if (this.oSharingDialog){
				this.oSharingDialog.getButtons()[0].setEnabled(false); // enable "OK" button
				this.oSharingDialog.getButtons()[1].setEnabled(false); // enable "OK" button
			}
		},

		/**
		* Fetches the data needed for the component rendering
		* @private
		*/
		fetchData : function() {

			var self = this;

			var gettingGroupCount = new jQuery.Deferred();
			gettingGroupCount.done(function(count){
				self.iJamGroupsCount = count;
				if (self.iJamGroupsCount > 0){
					self.postFetchSetup();
					setTimeout(function(){
						self.getView().getContent()[0].getItems()[1].getContent()[1].focus();
					}, 50); // sets the focus to the Group Input field after it's enabled
				}
				else {
					if (self.fNoGroupsCallBack){
						self.fNoGroupsCallBack();
					}
				}
			});
			var gettingCollaborationHostUrl = new jQuery.Deferred();
			gettingCollaborationHostUrl.done(function(url){
				if (!self.sJamUrl){
					self.sJamUrl = url;
				}
			});
			var mappingInternalBOToExternalBO = new jQuery.Deferred();
			mappingInternalBOToExternalBO.done(function(externalBO){
				self.oMappedExternalObject = externalBO;
			});
			mappingInternalBOToExternalBO.fail(function(){
				self.oMappedExternalObject = undefined;
				Log.debug('Mapping Internal BO to External BO failed');
			});

			var gettingEmail = new jQuery.Deferred();
			gettingEmail.done(function(email){
				if (!self.sMemberEmail){
					self.sMemberEmail = email;
				}
			});

			jQuery.when(gettingGroupCount,gettingCollaborationHostUrl,mappingInternalBOToExternalBO).fail(function(oErrorReponse){
				if (self.oSharingDialog){
					self.oSharingDialog.close();
				}
				if (oErrorReponse.statusCode === 401 || oErrorReponse.statusCode === 403){
					self.oCommonUtil.displayError(self.oLangBundle.getText("SHARE_AUTHORIZATION_FAILURE_MSG"));
				}
				else {
					self.oCommonUtil.displayError();
				}
			});

			// Get group count
			this.oJamODataModel.read( '/Groups/$count', {
				success: function(oData, response){
					gettingGroupCount.resolve(parseInt(response.body));
				},
				error: function(oError){
					gettingGroupCount.reject(oError.response);
				}
			});

			// Get email
			this.oJamODataModel.read( '/Self', {
				success: function(oData, response){
					gettingEmail.resolve(this.oCommonUtil.getODataResult(oData).Email);
				}.bind(this),
				error: function(oError){
					gettingEmail.reject(oError.response);
				}
			});

			// Get collaboration host url
			if (!this.sJamUrl){
				this.oSMIODataModel.read('/GetCollaborationHostURL',{
					success: function(oData, response){
						gettingCollaborationHostUrl.resolve(oData.GetCollaborationHostURL.URL);
					},
					error: function(oError){
						gettingCollaborationHostUrl.reject(oError.response);
					}
				});
			} else {
				gettingCollaborationHostUrl.resolve();
			}

			// Map internal bo to external BO
			this.oExternalObject = this.getView().getViewData().externalObject; 		// Update external object from view data
			if (this.oExternalObject) {
				this.oSMIODataModel.read('/MapInternalBOToExternalBO',{
					urlParameters: { ApplicationContext: "'" + self.oExternalObject.appContext + "'",
									 ODataCollection: "'" + self.oExternalObject.collection + "'",
									 ODataKeyPredicate: "'" + self.oExternalObject.key + "'",
									 ODataServicePath: "'" + self.oExternalObject.odataServicePath + "'" },
					success: function(oData,response){
						mappingInternalBOToExternalBO.resolve(oData.MapInternalBOToExternalBO);
					},
					error: function(oError){
						mappingInternalBOToExternalBO.reject(oError.response);
					}
				});
			}
		},

		/**
		* Does some setup required on some control (i.e disable/enable ...)
		* @private
		*/
		postFetchSetup : function() {
			this.setGroupSelectionEnabled(true);
		},

		/**
		 * Initializes the OData Model
		 * @private
		 */
		initializeOdataModel : function() {
			var asJson = true;
			this.sSMIODataServiceUrl = this.getView().getViewData().odataServiceUrl;
			this.oSMIODataModel = new ODataModel(this.sSMIODataServiceUrl, asJson);

			this.sJamODataServiceUrl = this.getView().getViewData().collaborationHostODataServiceUrl;
			this.oJamODataModel = new ODataModel(this.sJamODataServiceUrl, asJson);
			this.oJamODataModel.setDefaultCountMode(CountMode.Inline);
		},

		/**
		 * Initialize the OData Utility Class
		 * @private
		 */
		initializeOdataUtils : function() {
			this.oODataUtil = new OdataUtil();
		},

		/**
		 * Initialize the Attachments Utility Class
		 * @private
		 */
		initializeAttachmentsUtil : function(){
			this.oAttachmentsUtil = new AttachmentsUtil(this.oLangBundle, this.oODataUtil, this.oJamODataModel);
		},

		/**
		 * Initialize the Share Utility Class
		 * @private
		 */
		initializeShareUtil : function(){
			this.oShareUtil = new ShareUtil(this.oLangBundle, this.oODataUtil, this.oSMIODataModel, this.oCommonUtil,
					this.oJamODataModel, this.getView().getViewData().collaborationHostRestService );
		},

		/**
		 * Set Group Selection Text
		 * @private
		 */
		setGroupSelectionText: function(sText){
			var oGroupSelect = sap.ui.getCore().byId( this.sPrefixId + "_GroupSelect");
			oGroupSelect.setValue(sText);
		},

		/**
		 * Set Group Selection Enabled
		 * @private
		 */
		setGroupSelectionEnabled: function(bEnabled){
			var oGroupSelect = sap.ui.getCore().byId( this.sPrefixId + "_GroupSelect");
			oGroupSelect.setEnabled(bEnabled);
		},

		/**
		 * Set Group Selection Enabled
		 * @private
		 */
		setFolderSelectionEnabled: function(bEnabled){
			this.oTargetFolderInput.setEnabled(bEnabled);
		},

		/**
		 * Show/Hide fields for attachments
		 * @private
		 */
		showAttachmentsFields : function(bVisibility){
			this.getView().AttachmentsInputLayout.setVisible(bVisibility);
			this.getView().oTargetFolderInputLayout.setVisible(bVisibility);
			this.getView().oAttachmentCB.setVisible(bVisibility);
		},

		/**
		 * Clear data for attachments
		 * @private
		 */
		clearAttachmentsData : function(){
			// Clear previous attachments data, buttons, texts
			this.aFiles = [];
			this.aSelectedFiles = [];
			this.sSelectedFolderId = '';
			this.bAttachmentsCB = false;

			// Reset text of button
			this.oAttachmentsInput.setValue("");

			// Clear Attachments Only checkbox
			this.getView().oAttachmentCB.setSelected(this.bAttachmentsCB);
			this.getView().oAttachmentCB.setEnabled(false);

			// Clear folder selection
			this.oTargetFolderInput.setValue("");
			if (this.oFolderSelectionDialog){
				this.oAttachmentsUtil.resetFolderSelection(this.getSelectedGroupId());
			}
		},

		/**
		* Event Handler for the attachment value help
		* @private
		*/
		onAttachmentsValueHelpPress : function(oControlEvent){

			if (this.oSharingDialog){
				var iShareDialogHeight = this.oSharingDialog.getContent()[0].getDomRef().offsetHeight;
				var iShareDialogWidth = this.oSharingDialog.getContent()[0].getDomRef().offsetWidth;
			}

			// Create the file selection dialog
			if (!this.oFileSelectionDialog) {
				var oAttachmentsModel = this.oAttachmentsUtil.createAttachmentsModel(this.aFiles);
				this.oFileSelectionDialog = this.oAttachmentsUtil.createFileSelectionDialog(this.sPrefixId, oAttachmentsModel, this.onFileSelectionDialogConfirm(), iShareDialogWidth, iShareDialogHeight);
			}

			// Clear the filter on the binding
			var oBinding = this.oFileSelectionDialog.getBinding("items");
			oBinding.filter([]);

			// Open dialog
			this.oFileSelectionDialog.open();
		},

		/**
		 * This function returns a function that is called when the OK button of the files selection dialog is clicked.
		 * @private
		 */
		onFileSelectionDialogConfirm: function() {
			var self = this;

			return function(oEvent){

				self.aSelectedFiles = [];
				var aContexts = oEvent.getParameter("selectedContexts");
				for (var i = 0; i < aContexts.length; i++){
					self.aSelectedFiles.push(aContexts[i].getObject());
				}

				// Set the text of the Attachments button (ex: Attachments(5) when there are 5 attachments selected)
				if (self.aSelectedFiles && self.aSelectedFiles.length > 0) {
					self.postFileSelectionSetup(true);
				}
				else {
					self.postFileSelectionSetup(false);
				}
			};
		},

		/**
		* Does some setup required on some control (i.e disable/enable, set text ...)
		* @private
		*/
		postFileSelectionSetup : function(filesSelected) {
			if (filesSelected === true){
				if (this.aSelectedFiles.length == 1){
					this.oAttachmentsInput.setValue(this.oLangBundle.getText("SELECTED_ATTACHMENT_FIELD_TEXT", [this.aSelectedFiles.length]));
				}
				else {
					this.oAttachmentsInput.setValue(this.oLangBundle.getText("SELECTED_ATTACHMENTS_FIELD_TEXT", [this.aSelectedFiles.length]));
				}

				this.getView().oAttachmentCB.setEnabled(true);

				if (this.sSelectedGroupId !== '') {
					this.setFolderSelectionEnabled(true);
				}
			}
			else {
				this.oAttachmentsInput.setValue("");
				this.bAttachmentsCB = false;
				this.getView().oAttachmentCB.setSelected(this.bAttachmentsCB);
				this.postAttachmentCheckBoxSelection();
				this.getView().oAttachmentCB.setEnabled(false);
				this.setFolderSelectionEnabled(false);
			}
		},

		/**
		* Event Handler for the group value help
		* @private
		*/
		onGroupSelectValueHelpPress: function(oEvent){

			if (!this.oItemTemplate){
				this.oItemTemplate = new StandardListItem({
					title : {
						parts: [
								"Name",
								"GroupType"
								],
								formatter : function(sName,sGroupType) {
									return sName + " (" + sGroupType + ")";
								}
					},
					type : ListType.Active,
					tooltip: "{Name}"
				});
			}

			if (this.oSharingDialog){
				var iShareDialogHeight = this.oSharingDialog.getContent()[0].getDomRef().offsetHeight;
				var iShareDialogWidth = this.oSharingDialog.getContent()[0].getDomRef().offsetWidth;
			}

			// Create the group selection dialog
			if (!this.oGroupSelectionDialog){
				this.oGroupSelectionDialog = this.oShareUtil.createGroupSelectionDialog(this.sPrefixId, this.oItemTemplate, this._onGroupSelectionDialogConfirm(), iShareDialogWidth, iShareDialogHeight, this.oJamODataModel);
			}
			else {
				this.oGroupSelectionDialog.setModel(this.oJamODataModel);
				this.oGroupSelectionDialog.bindAggregation("items", "/Groups", this.oItemTemplate);
			}

			this.oGroupSelectionDialog.open();
		},

		/**
		 * This function returns a function that is called when the group is selected.
		 * @private
		 * @returns {function} function called when the group is selected.
		 */
		_onGroupSelectionDialogConfirm: function() {
			var self = this;

			return function(oEvent){

				var aContexts = oEvent.getParameter("selectedContexts");
				for (var i = 0; i < aContexts.length; i++){
					self.oSelectedGroup = aContexts[i].getObject();
				}

				if (self.oSelectedGroup) {
					self.postGroupSelectionSetup(true);
				}
				else {
					self.postGroupSelectionSetup(false);
				}
			};
		},

		/**
		* Does some setup required on some control (i.e disable/enable ...)
		* @private
		*/
		postGroupSelectionSetup : function(groupSelected) {
			if (groupSelected === true){
				if (this.oSelectedGroup !== undefined){
					// Save selected group id
					this.sSelectedGroupId = this.oSelectedGroup.Id.toString();
					this.sSelectedGroupName = this.oSelectedGroup.Name.toString();
					this.setGroupSelectionText(this.sSelectedGroupName);
				}

				if (this.oAttachments && this.oAttachments.attachmentsArray){
					// Reset folder selection
					this.sSelectedFolderId = '';
					this.oAttachmentsUtil.resetFolderSelection(this.getSelectedGroupId());
					var oSelectedFolder = this.oAttachmentsUtil.getCurrentFolder();
					this.oTargetFolderInput.setValue(oSelectedFolder.name);
				}

				// If some attachments are already selected
				if (this.aSelectedFiles && this.aSelectedFiles.length > 0) {
					this.setFolderSelectionEnabled(true);
				}

				if (this.bAttachmentsCB === false){
					this.getView().oNoteTextArea.setEnabled(true);
				}
				// If Share is in dialog
				if (this.oSharingDialog){
					this.oSharingDialog.getButtons()[0].setEnabled(true); // enable @mention button
					this.oSharingDialog.getButtons()[1].setEnabled(true); // enable "OK" button
				}
			}
			else {
				this.setFolderSelectionEnabled(false);
				this.getView().oNoteTextArea.setEnabled(false);
			}

		},

		/**
		* Event Handler for the attachment value help
		* @private
		*/
		onTargetFolderValueHelpPress : function(oControlEvent){
			if (this.oSharingDialog){
				var iShareDialogHeight = this.oSharingDialog.getContent()[0].getDomRef().offsetHeight;
				var iShareDialogWidth = this.oSharingDialog.getContent()[0].getDomRef().offsetWidth;
			}

			// Build folder dialog if not built yet
			if (!this.oFolderSelectionDialog) {
				this.oFolderSelectionDialog = this.oAttachmentsUtil.createFolderSelectionDialog(this.sPrefixId, this.getSelectedGroupId(), this.onFolderSelectionDialogConfirm(), this.onFolderSelectionDialogCancel(), iShareDialogWidth, iShareDialogHeight);
				this.sSelectedFolderId = '';
			}

			// Update the Dialog title before opening
			this.oFolderSelectionDialog.getContent()[0].oController.setFolderSelectionDialogTitle(this.oTargetFolderInput.getValue());
			this.oFolderSelectionDialog.open();
		},

		/**
		 * This function is called when the OK button of the folder selection dialog is clicked.
		 * @private
		 */
		onFolderSelectionDialogConfirm : function(oEvent){
			var self = this;
			return function(){
				var oSelectedFolder = self.oAttachmentsUtil.getCurrentFolder();
				self.sSelectedFolderId = oSelectedFolder.id;
				self.oTargetFolderInput.setValue(oSelectedFolder.name);
			};
		},

		/**
		 * This function is called when the Cancel button of the folder selection dialog is clicked.
		 * @private
		 */
		onFolderSelectionDialogCancel: function(oEvent) {
			var self = this;
			return function(oEvent){
				self.oAttachmentsUtil.setCurrentFolderId(self.sSelectedFolderId);
			};
		},

		/**
		* Event Handler for the attachment checkBox
		* @private
		*/
		onAttachmentCheckBoxSelected : function() {
			// Toggle between checking and unchecking the Attachments Checkbox
			this.bAttachmentsCB = this.getView().oAttachmentCB.getSelected();
			this.postAttachmentCheckBoxSelection();
		},

		/**
		* Event Handler for when the atMentions button is pressed
		* @private
		*/
		atMentionsButtonPressed: function() {
			this.getView().oNoteTextArea.atMentionsButtonPressed();
		},

		/**
		* Event Handler for the suggestion
		* @private
		*/
		onSuggestion : function(oEvent) {
			if (this.gettingSuggestions) {
				this.gettingSuggestions.abort();
			}

			var that = this;
			var sValue = oEvent.getParameter("value");
			var oNoteTextArea = this.getView().oNoteTextArea;

			if (sValue.trim() === ""){ // if value is empty then it's the suggestions is triggered but user has not entered any text yet
				oNoteTextArea.showSuggestions([]);
				oNoteTextArea.setSuggestionHeight(undefined);
				return;
			}

			var sGroupId = this.getSelectedGroupId();
			var sPath = "/Members_Autocomplete";
			var mParameters = {
					"async": true,
					"urlParameters": {
						"Query": "'" + sValue + "'",
						"GroupId": "'" + sGroupId + "'",
						"$top": "4"
					},
					"success": function(oData, response){
						var aJamResults = that.oCommonUtil.getODataResult(oData);
						if (aJamResults.length === 0) { // if nothing is returns from jam then close the suggestion popover
							oNoteTextArea.closeSuggestionPopover();
							oNoteTextArea.setSuggestionHeight(undefined);
						}
						else {
							var aSuggestions = [];
							var iJamResultsLength = aJamResults.length;
							for (var i = 0; i < iJamResultsLength; i++){
								aSuggestions.push({
									fullName: aJamResults[i].FullName,
									email: aJamResults[i].Email,
									userImage: that._buildThumbnailImageURL(aJamResults[i].Id)
								});
							}
							oNoteTextArea.showSuggestions(aSuggestions);
							iJamResultsLength >= 3 ? oNoteTextArea.setSuggestionHeight("12rem") : oNoteTextArea.setSuggestionHeight(undefined);
						}
					},
					"error": function(oError){
						Log.error("Failed to get suggestions: " + oError.statusText);
					}
				};

			this.gettingSuggestions = this.oJamODataModel.read(sPath, mParameters);
		},

		/**
		* Does some setup required on some control (i.e disable/enable ...)
		* @private
		*/
		postAttachmentCheckBoxSelection : function() {
			if (this.bAttachmentsCB === true){
				this.getView().oNoteTextArea.setEnabled(false);
			}
			else {
				if (this.sSelectedGroupId !== ''){
					this.getView().oNoteTextArea.setEnabled(true);
				}
			}
		},

		/**
		* Gets the form data that can be used by other class to share some info to Jam
		* @private
		*/
		getSharingData : function() {
			var oFeedContent;

			if ((this.oNoteTextArea.getValue() !== undefined && this.oNoteTextArea.getValue() !== "") || (this.sObjectId !== undefined && this.sObjectId !== "")){
				oFeedContent = 	{
									note: this.oNoteTextArea.convertTextWithFullNamesToEmailAliases(),
									uiUrl: this.sObjectId
								};
			}
			if (JSON.stringify(this.oExternalObject) === '{}'){
				this.oExternalObject = undefined;
			}

			return {
			 feedContent:						 oFeedContent,
			  groupId:                           this.getSelectedGroupId(),
			  folderId:							 this.getSelectedFolderId(),
			  aFilesToUpload:                    this.aSelectedFiles,
			  externalObject:					 this.oExternalObject,
			  mappedExternalObject:				 this.oMappedExternalObject,
			  groupName: 						 this.getSelectedGroupName(),
			  //groupName: 						 sap.ui.getCore().byId( this.sPrefixId + "_GroupSelect").getValue(),
			  memberEmail:						 this.sMemberEmail
			};
		},

		/**
		 * Gets the selected group's id
		 * @private
		 */
		getSelectedGroupId : function() {
			return this.sSelectedGroupId;
		},

		/**
		 * Gets the selected group's name
		 * @private
		 */
		getSelectedGroupName : function() {
			return this.sSelectedGroupName;
		},

		/**
		 * Gets the selected folder's id
		 * @private
		 */
		getSelectedFolderId : function() {
			return this.sSelectedFolderId;
		},

		/**
		 * Shares the data to Jam group
		 *  We need the:
		 *  - Group
		 *  - Target Folder
		 *  - Attachments
		 *  - Comment
		 *  - The link to the BO
		 *  However, things are a little more complicated because there are different sharing scenarios:
		 *
		 *  Scenario 1 (BO only)
		 *  When BO only, then Group is set, the link to the BO is set,
		 *  and the comment is optional.
		 *  Scenario 1.1 BO (URL)
		 *  Scenario 1.2 BO (OData object)
		 *
		 *  Scenario 2 (Attachments only)
		 *  When Attachments only, then the Group is set, there is at least
		 *  one attachment selected, and the comment and target folder are optional.
		 *
		 *  Scenario 3 (Both)
		 *  When both, then the Group is set, there is at least one attachment selected,
		 *  the link for the BO is set, and the comment and target folder are optional.
		 *
		 * @private
		 */
		shareToJam : function() {
			var oSharingData = this.getSharingData();
			var self = this;

			// Nothing to share
			if (oSharingData.aFilesToUpload.length === 0 && (!oSharingData.feedContent || (!oSharingData.feedContent.uiUrl && oSharingData.feedContent.note.trim() === "")) && !oSharingData.externalObject){
				var sResultMessage = self.oLangBundle.getText("SHARING_NOTHING_TO_SHARE_MSG");
				this.oCommonUtil.showMessage(sResultMessage, {duration:3000, autoclose: false});
			}
			else {
				if (!this.bAttachmentsCB) {
					// For scenario 1 & 3.
					this.oShareUtil.shareBusinessObject(oSharingData);

				}
				if (oSharingData.aFilesToUpload.length > 0) {
					// For scenario 2 & 3.
					this.oShareUtil.uploadAttachments(oSharingData);
					var sResultMessage = this.oLangBundle.getText("SHARING_ACKNOWLEDGMENT_MSG");
					// SetTimeout to trigger the message toast 1/2 second after the dialog closes
					setTimeout(function(){self.oCommonUtil.showMessage(sResultMessage, {duration:3000, width:"30em", autoClose: false});}, 500);
				}
			}
		},

		/**
		 * Returns a URL for the ThumbnailImage
		 * @param {string} sUserId
		 * @return {string}
		 * @private
		 * @memberOf sap.collaboration.components.fiori.sharing.Sharing
		 */
		_buildThumbnailImageURL: function(sUserId) {
			return this.oJamODataModel.sServiceUrl + "/Members('" + encodeURL(sUserId) + "')/ThumbnailImage/$value";
		}
	});

});
