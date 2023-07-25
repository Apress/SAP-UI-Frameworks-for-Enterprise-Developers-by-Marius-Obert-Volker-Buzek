/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'sap/ui/commons/library',
	'sap/ui/core/Control',
	'sap/ui/commons/Button',
	'sap/ui/commons/Label',
	'sap/ui/commons/ListBox',
	'sap/ui/commons/TextField',
	'sap/ui/commons/TextArea',
	'sap/ui/commons/FileUploader',
	'sap/suite/ui/commons/NoteTakerCard',
	'sap/ui/commons/Link',
	'sap/ui/core/ListItem',
	"sap/base/util/deepEqual",
	"sap/ui/events/KeyCodes",
	"./NoteTakerFeederRenderer"
], function (jQuery, CommonsLibrary, Control, Button, Label, ListBox, TextField, TextArea, FileUploader, NoteTakerCard, Link, ListItem,
			 deepEqual, KeyCodes, NoteTakerFeederRenderer) {
	"use strict";

	/**
	 * Constructor for a new NoteTakerFeeder.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control allows you to enter a quick note and N note cards.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Standard Fiori technology should be used.
	 * @alias sap.suite.ui.commons.NoteTakerFeeder
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NoteTakerFeeder = Control.extend("sap.suite.ui.commons.NoteTakerFeeder", /** @lends sap.suite.ui.commons.NoteTakerFeeder.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * The text inside the note card.
				 */
				body: {type: "string", group: "Data", defaultValue: null},

				/**
				 * This text is the header of a new note.
				 */
				title: {type: "string", group: "Data", defaultValue: null},

				/**
				 * The list of tags selected for addition to a new note card.
				 */
				tags: {type: "object", group: "Misc", defaultValue: []},

				/**
				 * Sets positive indication for a new note.
				 */
				thumbUp: {type: "boolean", group: "Misc", defaultValue: null},

				/**
				 * Sets negative indication for a new note.
				 */
				thumbDown: {type: "boolean", group: "Misc", defaultValue: null},

				/**
				 * Sets the upload attachment URL for a new card.
				 */
				attachmentUploadUrl: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * The attachment property name for identification on the server side after sending data to the server.
				 */
				attachmentName: {type: "string", group: "Misc", defaultValue: 'attachment'}
			},
			aggregations: {

				/**
				 * Hidden aggregation of body area control.
				 */
				bodyArea: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

				/**
				 * Hidden aggregation of title field control.
				 */
				titleInput: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

				/**
				 * Hidden aggregation of FileUploader control.
				 */
				fileUploader: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

				/**
				 * Hidden aggregation of tag field control.
				 */
				tagInput: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
			},
			events: {

				/**
				 * The event is fired when a user chooses the Add button in the control.
				 */
				addNote: {
					parameters: {

						/**
						 * The title of the note to be added.
						 */
						title: {type: "string"},

						/**
						 * The text of the note to be added.
						 */
						body: {type: "string"},

						/**
						 * The timestamp of the note to be added.
						 */
						timestamp: {type: "object"},

						/**
						 * If set to true, a new card should be marked as positive one.
						 */
						thumbUp: {type: "boolean"},

						/**
						 * If set to true, a new card should be marked as negative one.
						 */
						thumbDown: {type: "boolean"},

						/**
						 * Stores the attachment file name for a new card.
						 */
						attachmentFilename: {type: "string"}
					}
				},

				/**
				 * The event is fired when the value of attached file has been changed.
				 */
				attachmentSelect: {
					parameters: {

						/**
						 * A name of the attached file.
						 */
						filename: {type: "string"}
					}
				},

				/**
				 * The event is fired when the upload of the file is completed. However this covers only the client side of the Upload process and does not give any success status from the server.
				 */
				attachmentUploadComplete: {
					parameters: {

						/**
						 * The response message that comes from the server. On the server side this response has to be put within the "body" tags of the response document of the iFrame. It can consist of a return code and an optional message. This does not work in cross-domain scenarios.
						 */
						response: {type: "string"}
					}
				},

				/**
				 * The event is fired when a user presses the Delete button in the Feeder card.
				 */
				attachmentDelete: {
					parameters: {

						/**
						 * A name of the attached file.
						 */
						filename: {type: "string"}
					}
				},

				/**
				 * The event is fired when a user presses the attachment link.
				 */
				attachmentClick: {
					parameters: {

						/**
						 * A name of the attached file.
						 */
						filename: {type: "string"}
					}
				}
			}
		}
	});

	NoteTakerFeeder.prototype.init = function () {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
		this._selectedTags = [];
		this._bTagPopupOpen = false;
		var that = this; //eslint-disable-line

		this._oAddButton = new Button({
			id: this.getId() + "-add-button",
			text: this._rb.getText("NOTETAKERFEEDER_BUTTON_ADD_TEXT"),
			tooltip: this._rb.getText("NOTETAKERFEEDER_BUTTON_ADD_TOOLTIP"),
			press: function () {
				that._handleAdd();
			}
		});
		this._oAddButton.addStyleClass("sapSuiteUiCommonsNoteTakerFeederHeaderAddButton");

		this._oTagList = new ListBox({
			id: this.getId() + "-tagListBox",
			visibleItems: 10,
			width: "100%",
			height: "194px",
			select: function (oEvent) {
				that._handleListSelect(oEvent);
			}
		});

		this._oTagInput = new TextField({
			id: this.getId() + "-inputTag",
			liveChange: function (oEvent) {
				that._handleTagInputLive(oEvent);
			}
		});

		this.setAggregation("tagInput", this._oTagInput);

		this._oTagInput.onsapdown = function (oEvent) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
			jQuery("#" + that.getId() + "-tagListBox li:eq(0)").focus();
		};

		this._oCancelTagButton = new Button({
			id: this.getId() + "-cancel-tags-button",
			text: this._rb.getText("NOTETAKERFEEDER_BUTTON_CANCEL_TAGS"),
			tooltip: this._rb.getText("NOTETAKERFEEDER_BUTTON_CANCEL_TAGS_TOOLTIP"),
			press: function () {
				that._toggleTagPopup();
			}
		});
		this._oCancelTagButton.addStyleClass("sapSuiteUiCommonsNoteTakerFeederCancelTagButton");

		this._oCancelTagButton.onfocusout = function (oE) {
			that._oTagInput.focus();
		};

		this._oAddTagButton = new Button({
			id: this.getId() + "-add-tags-button",
			text: this._rb.getText("NOTETAKERFEEDER_BUTTON_ADD_TAGS"),
			tooltip: this._rb.getText("NOTETAKERFEEDER_BUTTON_ADD_TAGS_TOOLTIP"),
			press: function () {
				that._handleAddTag(that._oTagInput.getValue());
				that._oTagButton.rerender();
				that._toggleTagPopup();
			}
		});

		this._oTagButton = new Button({
			id: this.getId() + "-tag-button",
			tooltip: this._rb.getText("NOTETAKERFEEDER_BUTTON_TAG_TOOLTIP"),
			press: function () {
				that._toggleTagPopup();
			}
		});
		this._oTagButton.addStyleClass("sapSuiteUiCommonsNoteTakerFeederTagButton");

		this._oTitle = new TextField({
			id: this.getId() + "-title-field",
			placeholder: this._rb.getText("NOTETAKERFEEDER_PLACEHOLDER_HEADER") + "...",
			maxLength: 50
		});

		this.setAggregation("titleInput", this._oTitle);

		this._oBody = new TextArea({
			id: this.getId() + "-body-field",
			placeholder: this._rb.getText("NOTETAKERFEEDER_PLACEHOLDER_BODY") + "...",
			required: true,
			liveChange: function (e) {
				that._setAddButtonEnabled(e.mParameters["liveValue"], null);
			}
		});

		this.setAggregation("bodyArea", this._oBody);

		this._oThumbUpButton = new Button({
			id: this.getId() + "-thumb-up-button",
			press: function (e) {
				that._handleThumbUpButtonPress();
			},
			tooltip: this._rb.getText("NOTETAKERFEEDER_BUTTON_THUMB_UP_TOOLTIP")
		});
		this._oThumbUpButton.addStyleClass("sapSuiteUiCommonsNoteTakerFeederThumbUpButton");

		this._oThumbDownButton = new Button({
			id: this.getId() + "-thumb-down-button",
			press: function (e) {
				that._handleThumbDownButtonPress();
			},
			tooltip: this._rb.getText("NOTETAKERFEEDER_BUTTON_THUMB_DOWN_TOOLTIP")
		});
		this._oThumbDownButton.addStyleClass("sapSuiteUiCommonsNoteTakerFeederThumbDownButton");

		this._oFileUploader = new FileUploader({
			id: this.getId() + "-attach",
			uploadOnChange: false,
			name: this.getAttachmentName(),
			change: function (oEvent) {
				that._disableAddAttachBtn();
				var name = oEvent.getParameter("newValue");
				that._oAttachmentLink.setText(name);
				that._oAttachmentLink.rerender();
				that._handleAddAttachUI();

				var eData = {};
				eData.filename = name;
				that.fireAttachmentSelect(eData);
				that._oTitle.focus();
			},
			uploadComplete: function (oEvent) {
				that._handleUploadComplete(oEvent);
			}
		});

		this._oFileUploader.onfocusin = function (oE) {
			that._oTitle.focus();
		};
		this._oFileUploader.oBrowse.setText("");

		this.setAggregation("fileUploader", this._oFileUploader);

		this._oAddAttachButton = new Button({
			id: this.getId() + "-attach-button",
			press: function (e) {
				(that._oFileUploader.getId() + "-fu" ? window.document.getElementById(that._oFileUploader.getId() + "-fu") : null).click();
			},
			tooltip: that._rb.getText("NOTETAKER_BUTTON_ATTACH_TOOLTIP")
		});
		this._oAddAttachButton.addStyleClass("sapSuiteUiCommonsNtAttachIcon");

		this._oAttachmentLoadingLabel = new Label({
			id: this.getId() + "-loading-label",
			text: this._rb.getText("NOTETAKERFEEDER_LABEL_ATTACHMENT_LOADING") + "..."
		});

		this._oDeleteAttachButton = new Button({
			id: this.getId() + "-delete-attach-button",
			lite: true,
			press: function (e) {
				that._handleDeleteAttachUI();
				var eData = {filename: that._oFileUploader.getName()};
				that.fireAttachmentDelete(eData);

			},
			tooltip: this._rb.getText("NOTETAKERFEEDER_BUTTON_DELETE_ATTACHMENT")
		});

		this._oAttachmentLink = new Link({
			id: this.getId() + "-attachmentLink",
			tooltip: this._rb.getText("NOTETAKERFEEDER_LINK_ATTACHMENT_TOOLTIP"),
			press: function (e) {
				var eData = {filename: that._oFileUploader.getName()};
				that.fireAttachmentClick(eData);
			},
			width: "200px"
		});

		this._oRequiredLbl = new Label({required: true}).addStyleClass("sapSuiteRequiredLbl");
	};

	NoteTakerFeeder.prototype.exit = function () {
		this._oAddButton.destroy();
		this._oTitle.destroy();
		this._oBody.destroy();
		this._oTagButton.destroy();
		this._oTagList.destroy();
		this._oTagInput.destroy();
		this._oCancelTagButton.destroy();
		this._oAddTagButton.destroy();
		this._oThumbUpButton.destroy();
		this._oThumbDownButton.destroy();
		this._oFileUploader.destroy();
		this._oAddAttachButton.destroy();
		this._oAttachmentLoadingLabel.destroy();
		this._oDeleteAttachButton.destroy();
		this._oAttachmentLink.destroy();
		this._oRequiredLbl.destroy();
	};

	NoteTakerFeeder.prototype._handleAdd = function () {
		if (this.getBody()) {
			var eData = {};
			eData.title = this.getTitle();
			eData.body = this.getBody();
			eData.timestamp = this._getTimestamp();
			eData.tags = this._selectedTags;
			eData.thumbUp = this.getThumbUp();
			eData.thumbDown = this.getThumbDown();
			eData.attachmentFilename = this._oFileUploader.getValue();

			this.setTitle("");
			this.setBody("");

			this.setThumbDown(false);
			this.setThumbUp(false);

			this._oFileUploader.setValue("");
			this._enableAddAttachBtn();
			this.fireAddNote(eData);
			jQuery(this._oFileUploader.oFileUpload).show();
			this._handleClearTag();
		} else {
			this._setAddButtonEnabled(this.getBody());
		}

	};

	NoteTakerFeeder.prototype._getTimestamp = function () {
		return new Date();
	};

	NoteTakerFeeder.prototype.setTitle = function (sTitle) {
		this._oTitle.setValue(sTitle);
		return this;
	};

	NoteTakerFeeder.prototype.getTitle = function () {
		return jQuery(document.getElementById(this.getId() + "-title-field")).hasClass('sapSuiteUiCommonsPlaceholder') ? "" : this._oTitle.getValue();
	};

	NoteTakerFeeder.prototype.setBody = function (sBodyText) {
		this._oBody.setValue(sBodyText);
		return this;
	};

	NoteTakerFeeder.prototype.getBody = function () {
		return this._isBodyPlaceholderActive() ? "" : this._oBody.getValue();
	};

	NoteTakerFeeder.prototype._applyPlaceholder = function () {
		jQuery('[data-placeholder]').focus(
			function () {
				var input = jQuery(this);
				if (input.hasClass('sapSuiteUiCommonsPlaceholder')) {
					input.val('');
					input.removeClass('sapSuiteUiCommonsPlaceholder');
				}
			}
		).blur(
			function () {
				var input = jQuery(this);
				if (deepEqual(input.val(), '') || deepEqual(input.val(), input.attr('data-placeholder'))) {
					input.addClass('sapSuiteUiCommonsPlaceholder');
					input.val(input.attr('data-placeholder'));
				}
			}
		).blur();
	};

	NoteTakerFeeder.prototype._isBodyPlaceholderActive = function () {
		return jQuery(document.getElementById(this.getId() + "-body-field")).hasClass('sapSuiteUiCommonsPlaceholder');
	};

	NoteTakerFeeder.prototype._setAddButtonEnabled = function (sBody, notRerender) {
		var bEnabled = sBody !== null && !this._isBodyPlaceholderActive() && !/^\s*$/.test(sBody);
		if (bEnabled !== this._oAddButton.getEnabled()) {
			this._oAddButton.setEnabled(bEnabled);
			if (!notRerender) {
				this._oAddButton.rerender();
			}
		}
	};

	NoteTakerFeeder.prototype._adjustUploaderForIe = function () {
		this._oFileUploader.superOnkeydown = this._oFileUploader.onkeydown;
		this._oFileUploader.onkeydown = function (oEvent) {
			var iKeyCode = oEvent.keyCode,
				eKC = KeyCodes;
			if (iKeyCode !== eKC.SPACE && iKeyCode !== eKC.ENTER) {
				this.superOnkeydown(oEvent);
			}
		};

		jQuery(this._oFileUploader.oFilePath.getDomRef()).hide();
		jQuery(this._oFileUploader.oBrowse.getDomRef()).hide();
		jQuery(this._oAddAttachButton.getDomRef()).attr("tabindex", "-1");

		var that = this; //eslint-disable-line
		jQuery(this._oFileUploader.oFileUpload).attr("tabindex", "0").attr("title", this._rb.getText("NOTETAKER_BUTTON_ATTACH_TOOLTIP"))
			.on("focus", function () {
				this.hasFocus = true;
				jQuery(that._oAddAttachButton.getDomRef()).addClass("sapUiBtnStdFocus");
			}).on("focusout", function () {
			this.hasFocus = false;
			jQuery(that._oAddAttachButton.getDomRef()).removeClass("sapUiBtnStdFocus");
		}).on("hover", function () {
			jQuery(that._oAddAttachButton.getDomRef()).addClass("sapUiBtnStdFocus");
		}, function () {
			if (!this.hasFocus) {
				jQuery(that._oAddAttachButton.getDomRef()).removeClass("sapUiBtnStdFocus");
			}
			jQuery(that._oAddAttachButton.getDomRef()).removeClass("sapSuiteUiCommonsNoteTakerFeederButtonSelected");
		}).on("mousedown", function () {
			jQuery(that._oAddAttachButton.getDomRef()).addClass("sapSuiteUiCommonsNoteTakerFeederButtonSelected")
				.addClass("sapUiBtnAct");
		}).on("mouseup", function () {
			jQuery(that._oAddAttachButton.getDomRef()).removeClass("sapSuiteUiCommonsNoteTakerFeederButtonSelected");
		});

		jQuery(this._oFileUploader.oFileUpload).keydown(function (oEvent) {
			var eKC = KeyCodes;
			if (oEvent.keyCode === eKC.TAB) {
				if (oEvent.shiftKey) {
					that._oThumbDownButton.focus();
				} else {
					that._oTitle.focus();
				}
				oEvent.preventDefault();
				oEvent.stopPropagation();
			}
		});
	};

	NoteTakerFeeder.prototype._setAriaInfo = function () {
		jQuery(document.getElementById(this._oThumbUpButton.getId())).attr("aria-pressed", this.getThumbUp());
		jQuery(document.getElementById(this._oThumbDownButton.getId())).attr("aria-pressed", this.getThumbDown());

		jQuery(document.getElementById(this._oTitle.getId())).attr("aria-label", this._rb.getText("NOTETAKERFEEDER_PLACEHOLDER_HEADER"));
		jQuery(document.getElementById(this._oBody.getId())).attr("aria-label", this._rb.getText("NOTETAKERFEEDER_PLACEHOLDER_BODY"));
		jQuery(this._oFileUploader.oFileUpload).attr("aria-label", this._rb.getText("NOTETAKER_BUTTON_ATTACH_TOOLTIP"));
	};

	NoteTakerFeeder.prototype.onAfterRendering = function () {
		this._applyPlaceholder();
		this._adjustPopupState();

		if (this._oFileUploader.getValue()) {
			jQuery(document.getElementById(this.getId() + "-attachment-panel")).show();
			jQuery(document.getElementById(this.getId() + "-attachment-loading")).hide();
			jQuery(document.getElementById(this.getId() + "-attachment-delete")).show();
		}

		jQuery(document.getElementById(this._oFileUploader.getId())).addClass("sapSuiteUiCommonsNtfUploader");

		this._setAriaInfo();

		if (jQuery.browser.msie) {
			this._adjustUploaderForIe();
		}
	};

	NoteTakerFeeder.prototype.onBeforeRendering = function () {
		this._setAddButtonEnabled(this.getBody(), true);
		this._setThumbButtonsView();
	};

	NoteTakerFeeder.prototype.getFormattedTags = function () {
		return NoteTakerCard.prototype._getFormattedTags();
	};

	NoteTakerFeeder.prototype._adjustPopupState = function () {
		if (this._bTagPopupOpen) {
			jQuery(document.getElementById(this.getId() + "-selectTag-panel")).show();
		}
	};

	NoteTakerFeeder.prototype._handleAddTag = function (sTag) {
		this._selectedTags = [];
		var aNewTags = sTag.split(new RegExp("\\s+"));

		var oTemp = {};

		for (var i = 0; i < aNewTags.length; i++) {
			if (aNewTags[i].length !== 0) {
				oTemp[aNewTags[i]] = 0;
			}
		}

		for (var field in oTemp) {
			this._selectedTags.push(field);
		}

		if (this._oTagButton) {
			this._adjustTagButton();
		}

	};

	NoteTakerFeeder.prototype._adjustTagButton = function () {
		if (this._selectedTags.length) {
			this._oTagButton.setTooltip(this._rb.getText("NOTETAKERFEEDER_BUTTON_ADD_TAGS_SELECTED_TOOLTIP") + ": " + this._selectedTags.join(" "));
			this._oTagButton.addStyleClass("sapSuiteUiCommonsNoteTakerFeederButtonSelected");
		} else {
			this._oTagButton.setTooltip(this._rb.getText("NOTETAKERFEEDER_BUTTON_TAG_TOOLTIP"));
			this._oTagButton.removeStyleClass("sapSuiteUiCommonsNoteTakerFeederButtonSelected");
		}
	};

	NoteTakerFeeder.prototype._handleClearTag = function () {
		if (this._oTagInput) {
			this._oTagInput.setValue("");
		}

		if (this._oTagList) {
			this._oTagList.clearSelection();
		}

		this._selectedTags = [];

		if (this._oTagButton) {
			this._adjustTagButton();
		}
	};

	NoteTakerFeeder.prototype.setTags = function (aTags) {
		this.setProperty("tags", aTags, true); // no automatic rerendering
		return this;
	};

	NoteTakerFeeder.prototype._toggleTagPopup = function () {
		if (this._bTagPopupOpen) {
			jQuery(document.getElementById(this.getId() + "-selectTag-panel")).slideToggle();
			this._focusDefaultControl();
			this._bTagPopupOpen = false;
		} else {
			this._addTagsToListBox(this.getTags());
			jQuery(document.getElementById(this.getId() + "-selectTag-panel")).slideToggle();
			jQuery(document.getElementById(this.getId() + "-inputTag")).val(this._selectedTags.length === 0 ? "" : this._selectedTags.join(" ") + " ");
			this._oTagInput.focus();
			this._bTagPopupOpen = true;
		}
	};

	NoteTakerFeeder.prototype._focusDefaultControl = function () {
		this._oTagButton.focus();
	};

	NoteTakerFeeder.prototype._handleTagInputLive = function (oEvent) {
		var sLiveValue = oEvent.getParameter("liveValue");
		var aNewTags = sLiveValue.split(" ");
		var sCurrentlyEntering = aNewTags[aNewTags.length - 1];
		this._filterListBox(sCurrentlyEntering);
	};

	NoteTakerFeeder.prototype._filterListBox = function (sInput) {
		if (sInput.length === 0) {
			this._addTagsToListBox(this.getTags());
			return;
		}

		var aFiltered = jQuery.grep(this.getTags(), function (a) {
			return a.indexOf(sInput) >= 0;
		});

		this._addTagsToListBox(aFiltered);
	};

	NoteTakerFeeder.prototype._addTagsToListBox = function (aTags) {
		var aListItems = jQuery.map(aTags, function (v, i) {
			return new ListItem({text: v});
		});

		this._oTagList.setItems(aListItems, true);
		this._oTagList.rerender();
	};

	NoteTakerFeeder.prototype._handleListSelect = function (oEvent) {
		var sSelectedTag = oEvent.getParameter("selectedItem").getText();
		var sTemp = this._oTagInput.getValue();
		var aNewTags = sTemp.split(" ");

		aNewTags.pop();

		if (aNewTags.length === 0) {
			this._oTagInput.setValue(sSelectedTag + " ");
		} else {
			this._oTagInput.setValue(aNewTags.join(" ") + " " + sSelectedTag + " ");
		}

		this._oTagList.setSelectedIndex(-1);
		this._oTagInput.focus();
	};

	NoteTakerFeeder.prototype._setThumbButtonsView = function () {
		if (this.getThumbUp()) {
			this._oThumbUpButton.addStyleClass("sapSuiteUiCommonsNoteTakerFeederButtonSelected");
		} else {
			this._oThumbUpButton.removeStyleClass("sapSuiteUiCommonsNoteTakerFeederButtonSelected");
		}

		if (this.getThumbDown()) {
			this._oThumbDownButton.addStyleClass("sapSuiteUiCommonsNoteTakerFeederButtonSelected");
		} else {
			this._oThumbDownButton.removeStyleClass("sapSuiteUiCommonsNoteTakerFeederButtonSelected");
		}
	};

	NoteTakerFeeder.prototype._handleThumbUpButtonPress = function () {
		this.setThumbUp(!this.getThumbUp());
		if (this.getThumbUp()) {
			this.setThumbDown(false);
		}
	};

	NoteTakerFeeder.prototype._handleThumbDownButtonPress = function () {
		this.setThumbDown(!this.getThumbDown());
		if (this.getThumbDown()) {
			this.setThumbUp(false);
		}
	};

	NoteTakerFeeder.prototype._disableAddAttachBtn = function () {
		this._oAddAttachButton.setEnabled(false);
		this._oAddAttachButton.removeStyleClass("sapSuiteUiCommonsNtAttachIcon");
		this._oAddAttachButton.addStyleClass("sapSuiteUiCommonsNtDsblAttachIcon");
		this._oAddAttachButton.setTooltip("");

		this._oAddAttachButton.rerender();
	};

	NoteTakerFeeder.prototype._enableAddAttachBtn = function () {
		this._oAddAttachButton.setEnabled(true);
		this._oAddAttachButton.removeStyleClass("sapSuiteUiCommonsNtDsblAttachIcon");
		this._oAddAttachButton.addStyleClass("sapSuiteUiCommonsNtAttachIcon");
		this._oAddAttachButton.setTooltip(this._rb.getText("NOTETAKER_BUTTON_ATTACH_TOOLTIP"));
		this._oAddAttachButton.rerender();

		if (jQuery.browser.msie) {
			jQuery(document.getElementById(this._oAddAttachButton.getId())).attr("tabindex", "-1");
		}
	};

	NoteTakerFeeder.prototype._handleAddAttachUI = function () {
		jQuery(this._oFileUploader.oFileUpload).hide();
		jQuery(document.getElementById(this.getId() + "-attachment-loading")).show("fast");
		jQuery(document.getElementById(this.getId() + "-body")).animate({
			height: "332px"
		}, 300);

		jQuery(document.getElementById(this.getId() + "-attachment-panel")).slideDown({duration: 300, queue: false});
	};

	NoteTakerFeeder.prototype._handleDeleteAttachUI = function () {
		jQuery(this._oFileUploader.oFileUpload).show();
		jQuery(document.getElementById(this.getId() + "-body")).animate({
			height: "352px"
		}, 300);

		jQuery(document.getElementById(this.getId() + "-attachment-delete")).hide("fast");
		jQuery(document.getElementById(this.getId() + "-attachment-panel")).hide({duration: 300, queue: false});

		this._enableAddAttachBtn();

		this._oFileUploader.setValue("");
		this._oFileUploader.addStyleClass("sapSuiteUiCommonsNtfUploader");
		this._oAttachmentLink.setText("");
		this._oAddAttachButton.focus();
	};

	NoteTakerFeeder.prototype.handleUploadResponse = function (sResponse) {

	};

	NoteTakerFeeder.prototype._handleUploadComplete = function (oEvent) {
		jQuery(document.getElementById(this.getId() + "-attachment-loading")).hide("fast");
		jQuery(document.getElementById(this.getId() + "-attachment-delete")).show("fast");

		var eData = {
			response: oEvent.getParameter("response")
		};
		this.fireAttachmentUploadComplete(eData);
	};

	NoteTakerFeeder.prototype.setAttachmentUploadUrl = function (sUrl) {
		this._oFileUploader.setUploadUrl(sUrl);
		return this;
	};

	NoteTakerFeeder.prototype.getAttachmentUploadUrl = function () {
		return this._oFileUploader.getUploadUrl();
	};

	return NoteTakerFeeder;
});
