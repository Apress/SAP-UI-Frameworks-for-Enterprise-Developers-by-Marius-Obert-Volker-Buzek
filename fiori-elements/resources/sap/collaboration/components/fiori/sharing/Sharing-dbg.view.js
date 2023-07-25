/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.define(["sap/ui/core/mvc/JSView", "sap/m/VBox", "sap/m/Label", "sap/m/Input", "sap/m/library", "sap/ui/layout/VerticalLayout", "sap/m/FlexItemData", "sap/collaboration/components/controls/SocialTextArea", "sap/m/CheckBox"], function(JSView, VBox, Label, Input, mobileLibrary, VerticalLayout, FlexItemData, SocialTextArea, CheckBox) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.InputType
	var InputType = mobileLibrary.InputType;

	sap.ui.jsview("sap.collaboration.components.fiori.sharing.Sharing", {

		/**
		 * Specifies the Controller belonging to this View.
		 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
		 * @memberOf Sharing
		 */
		getControllerName : function() {
			return "sap.collaboration.components.fiori.sharing.Sharing";
		},

		/**
		 * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
		 * Since the Controller is given to this method, its event handlers can be attached right away.
		 * Creates and returns a UI5 mobile VBox
		 * @memberOf Sharing
		 */
		createContent : function(oController) {
			var sPrefixId = this.getViewData().controlId;

			this.oSharingVBox = new VBox(sPrefixId + "_SharingVbox");
			this.createSharingVBoxContent(oController);

			return this.oSharingVBox;
		},

		/**
		 * Creates the content for the Sharing VBox
		 * @private
		 */
		createSharingVBoxContent : function(oController) {
			var sPrefixId = this.getViewData().controlId;
			var oLangBundle = this.getViewData().langBundle;
			var sJamUrl = this.getViewData().jamUrl;

			this.oObjectDisplay = this.getViewData().objectDisplay;
			if (this.oObjectDisplay){
				this.oSharingVBox.addItem(this.oObjectDisplay);
			}

			// GROUP SELECTION
			var oGroupLabel = new Label(sPrefixId + "_GroupLabel", {
				text: oLangBundle.getText("GRP_SELECT_LABEL"),
				required : true,
				width: "100%"
			});

			this.oGroupSelect = new Input(sPrefixId + "_GroupSelect",{
				width: "100%",
				type: InputType.Text,
				placeholder: oLangBundle.getText("GRP_SELECT_BUTTON_TEXT"),
				showValueHelp: true,
				enabled: true,
				editable: true,
				valueHelpOnly: true,
				valueHelpRequest: function(oControlEvent) {
							oController.onGroupSelectValueHelpPress(oControlEvent);
				},
				ariaLabelledBy: sPrefixId + "_GroupLabel"
			});

			var oGroupSelectionLayout = new VerticalLayout(sPrefixId + "_GroupSelectionLayout", {
				width: "100%",
				layoutData: new FlexItemData({growFactor: 1}),
				content: [
							oGroupLabel,
							this.oGroupSelect
				]
			}).addStyleClass("sharingVBox");
			this.oSharingVBox.addItem(oGroupSelectionLayout);

			// ATTACHMENTS
			var oAttachmentsLabel = new Label(sPrefixId + "_AttachmentsLabel", {
				text: oLangBundle.getText("ATTACHMENTS_LABEL"),
				required : false,
				width: "100%"
			});
			this.oAttachmentsInput = new Input(sPrefixId + "_AttachmentsInput", {
				width: "100%",
				type: InputType.Text,
				placeholder: oLangBundle.getText("ATTACHMENTS_FIELD_TEXT",[""]),
				showValueHelp: true,
				enabled: true,
				editable: true,
				valueHelpOnly: true,
				valueHelpRequest: function(oControlEvent) {
					oController.onAttachmentsValueHelpPress(oControlEvent);
				},
				ariaLabelledBy: sPrefixId + "_AttachmentsLabel"
			});

			this.AttachmentsInputLayout = new VerticalLayout(sPrefixId + "_AttachmentsInputLayout", {
				width: "100%",
				layoutData: new FlexItemData({growFactor: 1}),
				content: [
							oAttachmentsLabel,
							this.oAttachmentsInput
				]
			}).addStyleClass("sharingVBox");
			this.oSharingVBox.addItem(this.AttachmentsInputLayout);

			// TARGET FOLDER
			var oTargetFolderLabel = new Label(sPrefixId + "_TargetFolderLabel", {
				text: oLangBundle.getText("TARGET_FOLDER_LABEL"),
				required : false,
				width: "100%"
			});

			this.oTargetFolderInput = new Input(sPrefixId + "_TargetFolderInput", {
				width: "100%",
				type: InputType.Text,
				placeholder: oLangBundle.getText("TARGET_FOLDER_FIELD_TEXT"),
				showValueHelp: true,
				enabled: true,
				editable: true,
				valueHelpOnly: true,
				valueHelpRequest: function(oControlEvent) {
					oController.onTargetFolderValueHelpPress(oControlEvent);
				},
				ariaLabelledBy: sPrefixId + "_TargetFolderLabel"
			});

			this.oTargetFolderInputLayout = new VerticalLayout(sPrefixId + "_TargetFolderInputLayout", {
				width: "100%",
				layoutData: new FlexItemData({growFactor: 1}),
				content: [
							oTargetFolderLabel,
							this.oTargetFolderInput
				]
			}).addStyleClass("sharingVBox");
			this.oSharingVBox.addItem(this.oTargetFolderInputLayout);

			// COMMENTS BOX
			var oNoteLabel = new Label(sPrefixId + "_NoteLabel", {
				text: oLangBundle.getText("ADD_NOTE_LABEL"),
				width: "100%"
			});

			var iObjectId_CharLength;
			this.getViewData().objectId ? iObjectId_CharLength = this.getViewData().objectId.length : iObjectId_CharLength = 0;
			var iNoteTextArea_MaxChar = 1000 - iObjectId_CharLength - 1; // -1 to account for the newline we add as separator bet the Obj Id and the note in the feed

			this.oNoteTextArea = new SocialTextArea(sPrefixId + "_NoteTextArea", {
				initialValue: this.getViewData().objectShare,
				rows: 6,
				width : "100%",
				suggestionPlacement: PlacementType.Top,
				maxLength: iNoteTextArea_MaxChar,
				suggest: oController.onSuggestion.bind(oController),
				ariaLabelledBy: sPrefixId + "_NoteLabel"
			});

			var oNoteLayout = new VerticalLayout(sPrefixId + "_NoteLayout", {
				width: "100%",
				layoutData: new FlexItemData({growFactor: 2}),
				content: [
							oNoteLabel,
							this.oNoteTextArea
				]
			}).addStyleClass("sharingVBox");
			this.oSharingVBox.addItem(oNoteLayout);

			// ATTACHMENTS ONLY CHECKBOX
			this.oAttachmentCB = new CheckBox(sPrefixId + "_AttchmentCB",{
				text: oLangBundle.getText("SHARE_ATTACHMENTS_ONLY_LABEL"),
				enabled: false,
				select: function(){
					oController.onAttachmentCheckBoxSelected();
				},
				ariaLabelledBy: sPrefixId + "_AttchmentCB"
			});
			this.oSharingVBox.addItem(this.oAttachmentCB);
		}
	});

});
