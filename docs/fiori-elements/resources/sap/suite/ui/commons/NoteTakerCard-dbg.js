/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.NoteTakerCard.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'sap/ui/commons/library',
	'sap/ui/ux3/library',
	'sap/ui/commons/Link',
	'sap/ui/commons/MessageBox',
	'sap/ui/core/Control',
	'sap/ui/core/format/DateFormat',
	'sap/ui/ux3/OverlayContainer',
	'sap/ui/commons/Button',
	'sap/ui/core/ListItem',
	'sap/ui/commons/layout/VerticalLayout',
	'sap/ui/commons/layout/HorizontalLayout',
	'sap/ui/layout/HorizontalLayout',
	'sap/ui/core/HTML',
	'sap/ui/commons/TextField',
	'sap/ui/commons/InPlaceEdit',
	'sap/ui/commons/Label',
	'sap/ui/commons/ListBox',
	'sap/ui/commons/TextArea',
	"sap/base/security/encodeXML",
	"sap/base/security/URLListValidator",
	"./NoteTakerCardRenderer"
], function (jQuery, CommonsLibrary, Ux3Library, Link, MessageBox, Control, DateFormat, OverlayContainer, Button, ListItem, VerticalLayout,
			 CommonsHorizontalLayout, LayoutHorizontalLayout, HTML, TextField, InPlaceEdit, Label, ListBox, TextArea, encodeXML, URLListValidator, NoteTakerCardRenderer) {
	"use strict";

	/**
	 * Constructor for a new NoteTakerCard.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control allows you to store Note Taker card header and body text.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Standard Fiori technology should be used.
	 * @alias sap.suite.ui.commons.NoteTakerCard
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NoteTakerCard = Control.extend("sap.suite.ui.commons.NoteTakerCard", /** @lends sap.suite.ui.commons.NoteTakerCard.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Stores the Note Taker card header.
				 */
				header: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Stores the Note Taker card body text.
				 */
				body: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Stores a timestamp of the Note Taker card.
				 */
				timestamp: {type: "object", group: "Misc", defaultValue: new Date()},

				/**
				 * Contains an array of the String type tags applied to the current card.
				 */
				tags: {type: "object", group: "Misc", defaultValue: []},

				/**
				 * The View All link appears in the Note Taker card if a body text length exceeds the specified value.
				 */
				viewAllTrigger: {type: "int", group: "Misc", defaultValue: 1800},

				/**
				 * The card ID. This property should be set by an application developer.
				 */
				uid: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Shows whether the note card is hidden by the applied filter.
				 */
				isFiltered: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Indicates positive information for the card.
				 */
				thumbUp: {type: "boolean", group: "Misc", defaultValue: null},

				/**
				 * Indicates negative information for the card.
				 */
				thumbDown: {type: "boolean", group: "Misc", defaultValue: null},

				/**
				 * Contains an array of the String type tags available for selection during the card update.
				 */
				allTags: {type: "object", group: "Misc", defaultValue: []},

				/**
				 * Stores the name of the file attached to the card.
				 */
				attachmentFilename: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Stores the address of the file attached to the card.
				 */
				attachmentUrl: {type: "string", group: "Misc", defaultValue: null}
			},
			events: {

				/**
				 * The event is fired when a user chooses the Edit button in the note card.
				 */
				editNote: {
					parameters: {

						/**
						 * The title of edited card.
						 */
						title: {type: "string"},

						/**
						 * A new text of the edited card.
						 */
						body: {type: "string"},

						/**
						 * A new timestamp of the edited card.
						 */
						timestamp: {type: "string"},

						/**
						 * A unique ID that was set by an application developer.
						 */
						uid: {type: "string"},

						/**
						 * Indicates positive information for the edited card.
						 */
						thumbUp: {type: "boolean"},

						/**
						 * Indicates negative information for the edited card.
						 */
						thumbDown: {type: "boolean"},

						/**
						 * Updated array of the String type tags applied to the card during editing.
						 */
						tags: {type: "object"}
					}
				},

				/**
				 * The event is fired when a card needs to be deleted. This event is needed for the Note Taker control.
				 */
				deleteNote: {
					parameters: {

						/**
						 * The HTML ID of a card that needs to be deleted.
						 */
						cardId: {type: "string"},

						/**
						 * The title of the card to be deleted.
						 */
						title: {type: "string"},

						/**
						 * The text of the card to be deleted.
						 */
						body: {type: "string"},

						/**
						 * The timestamp of the card to be deleted.
						 */
						timestamp: {type: "string"},

						/**
						 * A unique ID that was set by an application developer.
						 */
						uid: {type: "string"},

						/**
						 * Indicates positive information for the deleted card.
						 */
						thumbUp: {type: "boolean"},

						/**
						 * Indicates negative information for the deleted card.
						 */
						thumbDown: {type: "boolean"}
					}
				},

				/**
				 * The event is fired when a user chooses the attachment download link.
				 */
				attachmentClick: {
					parameters: {

						/**
						 * A unique ID that was set by an application developer.
						 */
						uid: {type: "string"},

						/**
						 * The address of the file attached to the card.
						 */
						url: {type: "string"},

						/**
						 * The name of the file attached to the card.
						 */
						filename: {type: "string"}
					}
				}
			}
		}
	});

	///**
	// * This file defines behavior for the control,
	// */
	NoteTakerCard.prototype.init = function () {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

		var that = this; //eslint-disable-line
		this._oEditButton = new Button({
			id: this.getId() + "-edit-button",
			press: function (e) {
				that._handleEdit();
			},
			tooltip: this._rb.getText("NOTETAKERCARD_BUTTON_OPEN_EDIT_TOOLTIP")
		});
		this._oEditButton.addStyleClass("sapSuiteUiCommonsNoteTakerCardEditButton");

		this._oDeleteButton = new Button({
			id: this.getId() + "-delete-button",
			tooltip: this._rb.getText("NOTETAKERCARD_BUTTON_DELETE_TOOLTIP"),
			press: function () {
				that._handleDelete();
			}
		});
		this._oDeleteButton.addStyleClass("sapSuiteUiCommonsNoteTakerCardDeleteButton");

		this._oViewAllLink = new Link({
			id: this.getId() + "-viewAll-link",
			text: this._rb.getText("NOTETAKERCARD_LINK_VIEW_ALL_TEXT"),
			tooltip: this._rb.getText("NOTETAKERCARD_LINK_VIEW_ALL_TOOLTIP"),
			press: function () {
				that._openOverlay();
			}
		});

		this._oOverlayCard = new OverlayContainer(this.getId() + "-overlay", {
			openButtonVisible: false,
			close: function (oEvent) {
				that._handleOverlayCloseEvent(oEvent.getSource());
				oEvent.preventDefault();    // close overlay functionality already handled so prevent default close
			}
		});

		this._oOverlayCard.addDelegate({
			onAfterRendering: function () {
				var oOvrlTmpst = jQuery(document.getElementById(that.getId() + "-overlayTimestamp"));
				if (oOvrlTmpst) {
					oOvrlTmpst.html(that.getFormattedTimestamp());
				}
			}
		});

		// fixed unwanted scrolling of underlying content
		this._oOverlayCard._superOnsapselect = this._oOverlayCard.onsapselect;
		this._oOverlayCard.onsapselect = function (oEvent) {
			var controlId = oEvent.srcControl.getId();

			if (controlId.indexOf("-overlayBody") < 0 && controlId.indexOf("-inputTag") < 0 && controlId.indexOf("-overlayCardTitle") < 0) {
				oEvent.stopPropagation();
				oEvent.preventDefault();
			}

			//this is needed for Firefox
			setTimeout(function () {
				that._oOverlayCard._superOnsapselect(oEvent);
			}, 10);
		};

		this._oOverlayCard.addStyleClass("sapSuiteCommonsNoteTakerCardOverlayWindow");
		this._oOverlayCard._tagControls = {};
	};

	NoteTakerCard.prototype.exit = function () {
		this._oDeleteButton.destroy();
		this._oDeleteButton = null;

		this._oEditButton.destroy();
		this._oEditButton = null;

		this._oViewAllLink.destroy();
		this._oViewAllLink = null;

		this._oOverlayCard.destroy();
		this._oOverlayCard = null;
	};

	/**
	 * Formats timestamp using medium format style and current locale.
	 * @returns {Object} The locally formatted timestamp
	 */
	NoteTakerCard.prototype.getFormattedTimestamp = function () {
		var oLocale = sap.ui.getCore().getConfiguration().getLocale();
		var oDateFormat = DateFormat.getDateTimeInstance({style: "medium"}, oLocale);

		return oDateFormat.format(this.getTimestamp());
	};

	/**
	 * Closes overlay. If overlay is in edit mode then shows confirmation dialog before closing.
	 * @param {Object} oControl The control the event is to be handled of
	 */
	NoteTakerCard.prototype._handleOverlayCloseEvent = function (oControl) {
		if (oControl.bEditMode) {
			var that = this; //eslint-disable-line
			MessageBox.show(this._rb.getText("NOTETAKERCARD_CONFIRMATION_CANCEL_EDIT_MESSAGE"),
				MessageBox.Icon.QUESTION,
				this._rb.getText("NOTETAKERCARD_CONFIRMATION_CANCEL_EDIT_TITLE"),
				[MessageBox.Action.YES, MessageBox.Action.NO],
				function (sResult) {
					if (sResult === MessageBox.Action.YES) {
						that._closeOverlay();
						that._oEditButton.focus();
					} else {
						if (that.getId() + "-overlayBody" ? window.document.getElementById(that.getId() + "-overlayBody") : null) {
							(that.getId() + "-overlayBody" ? window.document.getElementById(that.getId() + "-overlayBody") : null).focus();
						}
					}
				},
				MessageBox.Action.NO);
		} else {
			this._closeOverlay();
		}
	};

	/**
	 * Destroys overlay content and closes overlay
	 */
	NoteTakerCard.prototype._closeOverlay = function () {
		this._oOverlayCard.close();
		this._destroyTagControls();
		this._oOverlayCard.bEditMode = false;
		this._oOverlayCard.destroyContent();
	};

	NoteTakerCard.prototype._openOverlay = function (bEditMode) {
		var sInitiallyFocusedId;

		if (!this._oOverlayCard.isOpen()) {

			this._oOverlayCard.bThumbUp = this.getThumbUp();
			this._oOverlayCard.bThumbDown = this.getThumbDown();

			this._prepareOverlayLayouts();
			this._prepareOverlayToolbar(bEditMode);
			this._prepareOverlayHeaderBtns(bEditMode);
			this._prepareOverlayBody();
			this._prepareOverlayButtons(bEditMode);

			if (bEditMode) {
				sInitiallyFocusedId = this.getId() + "-overlayBody";
			} else {
				sInitiallyFocusedId = this.getId() + "-overlay-close";
			}

			this._oOverlayCard.open(sInitiallyFocusedId);

			jQuery(document.getElementById(this.getId() + "-overlay-thumb-down-button")).attr("aria-pressed", this.getThumbDown());
			jQuery(document.getElementById(this.getId() + "-overlay-thumb-up-button")).attr("aria-pressed", this.getThumbUp());
		}
	};

	NoteTakerCard.prototype._getFormattedBody = function () {
		var aBuffer = [];
		var sText = this.getBody();
		var iPos;
		do {
			iPos = sText.search(/[\s<>]/); //search for whitespace character
			var sSpace = "",
				sWord = "";

			if (iPos < 0) {
				// only 1 word
				sWord = sText;
			} else {
				sWord = sText.slice(0, iPos);
				sSpace = sText.slice(iPos, iPos + 1);
				sText = sText.slice(iPos + 1);
			}

			// check for special strings
			switch (true) {
				case (this._isFullUrl(sWord)) :
					this.wrapFullUrl(aBuffer, sWord, sSpace);
					break;

				case (this._isShortUrl(sWord)) :
					this._wrapShortUrl(aBuffer, sWord, sSpace);
					break;

				case (this._isEmail(sWord)) :
					this._wrapEmail(aBuffer, sWord, sSpace);
					break;

				default :
					// regular word
					//rm.writeEscaped(sWord + sSpace, true);
					aBuffer.push(encodeXML(sWord + sSpace));
			}
		} while (iPos >= 0);

		return aBuffer.join("");
	};

	/**
	 * Verifies if the given word is a valid URL address starting with HTTP, HTTPS or FTP protocol.
	 * The check is case-insensitive.
	 * @param {string} sWord Word to check.
	 * @return {boolean} True if the word starts with http, https or ftp and is a valid URL.
	 */
	NoteTakerCard.prototype._isFullUrl = function (sWord) {
		return /^(https?|ftp):\/\//i.test(sWord) && URLListValidator.validate(sWord);
	};

	/**
	 * Verifies if the given word is a valid URL address starting with WWW.
	 * The check is case-insensitive.
	 * @param {string} sWord Word to check.
	 * @return {boolean} True if the word starts with www and is a valid URL for http request.
	 */
	NoteTakerCard.prototype._isShortUrl = function (sWord) {
		return /^(www\.)/i.test(sWord) && URLListValidator.validate("http://" + sWord);
	};

	/**
	 * Verifies if the given word is a valid e-mail address.
	 * The check is case-insensitive. E-mail address is valid if contains @-sign, and 2-6 chars long domain extension.
	 * @param {string} sWord Word to check.
	 * @return {boolean} True if the word is a valid e-mail address.
	 */
	NoteTakerCard.prototype._isEmail = function (sWord) {
		return /^[\w\.=-]+@[\w\.-]+\.[\w]{2,5}$/.test(sWord);
	};

	/*
	 * Renders full URL (with protocol specified) as clickable link.
	 * @param aBuffer - string array.
	 * @param sWord - Parsed word to render as URL.
	 * @param sSpace - Whitespace character(s) to render after the link.
	 */
	NoteTakerCard.prototype.wrapFullUrl = function (aBuffer, sWord, sSpace) {
		aBuffer.push('<a class="sapUiLnk" ');
		aBuffer.push('href = ' + '"' + encodeXML(sWord) + '"');
		aBuffer.push(' target = "_blank" rel="noopener noreferrer"');
		aBuffer.push('>');
		aBuffer.push(encodeXML(sWord));
		aBuffer.push('</a>' + sSpace);
	};

	/*
	 * Renders short URL (without protocol specified) as clickable link.
	 * @param aBuffer - string array.
	 * @param sWord - Parsed word to render as URL.
	 * @param sSpace - Whitespace character(s) to render after the link.
	 */
	NoteTakerCard.prototype._wrapShortUrl = function (aBuffer, sWord, sSpace) {
		aBuffer.push('<a class="sapUiLnk" ');
		aBuffer.push('href = ' + '"' + encodeXML("http://" + sWord) + '"');
		aBuffer.push(' target = "_blank" rel="noopener noreferrer"');
		aBuffer.push('>');
		aBuffer.push(encodeXML(sWord));
		aBuffer.push('</a>' + sSpace);
	};

	/*
	 * Renders Email (with protocol specified) as clickable link.
	 * @param aBuffer - string array.
	 * @param sWord - Parsed word to render as email address.
	 * @param sSpace - Whitespace character(s) to render after the link.
	 */
	NoteTakerCard.prototype._wrapEmail = function (aBuffer, sWord, sSpace) {
		aBuffer.push('<a class="sapUiLnk" ');
		aBuffer.push('href = "mailto:' + encodeXML(sWord) + '"');
		aBuffer.push('>');
		aBuffer.push(encodeXML(sWord));
		aBuffer.push('</a>' + sSpace);
	};

	NoteTakerCard.prototype._wrapBodyToDiv = function (sText) {
		return "<div class='sapSuiteUiCommonsNoteTakerCardBody'>" + sText + "</div>";
	};

	NoteTakerCard.prototype._wrapTagPanelToDiv = function (sText, bEditMode) {
		if (bEditMode) {
			return "<div class='suiteUiNtcOverlayTagPanelEditMode'>" + sText + "</div>";
		} else {
			return "<div class='suiteUiNtcOverlayTagPanelViewMode'>" + sText + "</div>";
		}
	};

	NoteTakerCard.prototype._handleEdit = function () {
		this._openOverlay(true);
	};

	/*
	 * Prepares tag list as HTML code for rendering.
	 */
	NoteTakerCard.prototype._getFormattedTags = function () {
		var aBuffer = [];
		var aTags;

		if (this._oOverlayCard.isOpen()) {
			aTags = this._oOverlayCard._selectedTags;
		} else {
			aTags = this.getTags();
		}

		aBuffer.push("<div id='" + this.getId() + "-tag-list' class='sapSuiteUiCommonsNoteTakerCardTagList'>");

		if (aTags.length === 0) {
			aBuffer.push(this._rb.getText("NOTETAKERCARD_LABEL_TAGS_EMPTY"));
		} else {
			aBuffer.push(this._rb.getText("NOTETAKERCARD_LABEL_TAGS_FULL") + ": ");
			var sTags = encodeXML(aTags.sort().join(" "));
			aBuffer.push("<span title='" + sTags + "'>");
			aBuffer.push(sTags);
			aBuffer.push("</span>");
		}
		aBuffer.push("</div>");
		return aBuffer.join("");
	};

	NoteTakerCard.prototype._handleDelete = function (bCloseOverlay) {
		var that = this; //eslint-disable-line
		MessageBox.show(
			this._rb.getText("NOTETAKERCARD_CONFIRMATION_DELETE_MESSAGE"),
			MessageBox.Icon.QUESTION,
			this._rb.getText("NOTETAKERCARD_CONFIRMATION_DELETE_TITLE"),
			[MessageBox.Action.YES, MessageBox.Action.NO],
			function (sResult) {
				if (sResult === MessageBox.Action.YES) {
					if (bCloseOverlay) {
						that._closeOverlay();
					}
					that._handleDeleteClick();
				}
			},
			MessageBox.Action.NO
		);
	};

	NoteTakerCard.prototype._handleDeleteClick = function () {
		var eData = {};
		eData.uid = this.getUid();
		eData.cardId = this.getId();
		eData.title = this.getHeader();
		eData.timestamp = this.getTimestamp();
		eData.body = this.getBody();
		eData.thumbUp = this.getThumbUp();
		eData.thumbDown = this.getThumbDown();

		this.fireDeleteNote(eData);
	};

	NoteTakerCard.prototype.setUid = function (sUid) {
		this.setProperty("uid", sUid, true); // no automatic rerendering
		return this;
	};

	NoteTakerCard.prototype._wrapThumbToDiv = function (sId) {
		var sClassName = null;
		var sTooltip = null;

		if (this.getThumbUp() && !this.getThumbDown()) {
			sClassName = "sapSuiteUiCommonsNoteTakerCardThumbUp";
			sTooltip = this._rb.getText("NOTETAKERCARD_ICON_THUMB_UP_TOOLTIP");
			this._oOverlayCard.removeStyleClass("suiteUiNtcNegativeCard");
			this._oOverlayCard.addStyleClass("suiteUiNtcPositiveCard");
		} else if (!this.getThumbUp() && this.getThumbDown()) {
			sClassName = "sapSuiteUiCommonsNoteTakerCardThumbDown";
			sTooltip = this._rb.getText("NOTETAKERCARD_ICON_THUMB_DOWN_TOOLTIP");
			this._oOverlayCard.removeStyleClass("suiteUiNtcPositiveCard");
			this._oOverlayCard.addStyleClass("suiteUiNtcNegativeCard");
		} else {
			this._oOverlayCard.removeStyleClass("suiteUiNtcPositiveCard");
			this._oOverlayCard.removeStyleClass("suiteUiNtcNegativeCard");
		}
		var aBuffer = [];
		aBuffer.push("<div");
		if (sId) {
			aBuffer.push(" id='");
			aBuffer.push(sId);
			aBuffer.push("'");
		}
		if (sClassName) {
			aBuffer.push(" class='");
			aBuffer.push(sClassName);
			aBuffer.push("'");

			aBuffer.push(" title='");
			aBuffer.push(sTooltip);
			aBuffer.push("'");
		}

		aBuffer.push("></div>");

		return aBuffer.join("");
	};

	NoteTakerCard.prototype._handleAddTag = function (sTag) {
		this._oOverlayCard._selectedTags = [];
		var aNewTags = sTag.split(new RegExp("\\s+"));

		var oTemp = {};

		for (var i = 0; i < aNewTags.length; i++) {
			if (aNewTags[i].length !== 0) {
				oTemp[aNewTags[i]] = 0;
			}
		}

		for (var field in oTemp) {
			this._oOverlayCard._selectedTags.push(field);
		}

		// Update tag panel with new values
		var oTagPanel = sap.ui.getCore().byId(this.getId() + '-overlayTagPanel');
		oTagPanel.setContent(this._wrapTagPanelToDiv(this._getFormattedTags(), true));
		this._adjustTagButton();
	};

	NoteTakerCard.prototype._adjustTagButton = function () {
		var oTagButton = this._oOverlayCard._tagControls.tagButton;
		if (this._oOverlayCard._selectedTags.length) {
			oTagButton.addStyleClass("sapSuiteUiCommonsNoteTakerFeederButtonSelected");
		} else {
			oTagButton.removeStyleClass("sapSuiteUiCommonsNoteTakerFeederButtonSelected");
		}
	};

	NoteTakerCard.prototype._toggleTagPopup = function () {
		var aSelectedTags = this._oOverlayCard._selectedTags;

		if (this._bTagPopupOpen) {
			jQuery(document.getElementById(this.getId() + "-selectTag-panel")).slideToggle();
			this._focusDefaultControl();
			this._bTagPopupOpen = false;
		} else {
			this._addTagsToListBox(this.getAllTags());
			jQuery(document.getElementById(this.getId() + "-selectTag-panel")).slideToggle();
			jQuery(document.getElementById(this.getId() + "-inputTag")).val(aSelectedTags.length === 0 ? "" : aSelectedTags.join(" ") + " ");
			this._oOverlayCard._tagControls.tagInput.focus();
			this._bTagPopupOpen = true;
		}
	};

	NoteTakerCard.prototype._focusDefaultControl = function () {
		this._oOverlayCard._tagControls.tagButton.focus();
	};

	NoteTakerCard.prototype._handleTagInputLive = function (oEvent) {
		var sLiveValue = oEvent.getParameter("liveValue");
		var aNewTags = sLiveValue.split(" ");
		var sCurrentlyEntering = aNewTags[aNewTags.length - 1];
		this._filterListBox(sCurrentlyEntering);
	};

	NoteTakerCard.prototype._filterListBox = function (sInput) {
		if (sInput.length === 0) {
			this._addTagsToListBox(this.getAllTags());
			return;
		}

		var aFiltered = jQuery.grep(this.getAllTags(), function (a) {
			if (a.indexOf(sInput) >= 0) {
				return true;
			}
		});

		this._addTagsToListBox(aFiltered);
	};

	NoteTakerCard.prototype._addTagsToListBox = function (aTags) {
		var aListItems = jQuery.map(aTags, function (v, i) {
			return new ListItem({text: v});
		});

		this._oOverlayCard._tagControls.tagList.setItems(aListItems, true);
		this._oOverlayCard._tagControls.tagList.rerender();
	};

	NoteTakerCard.prototype._handleListSelect = function (oEvent) {
		var sSelectedTag = oEvent.getParameter("selectedItem").getText();
		var oTagInput = this._oOverlayCard._tagControls.tagInput;
		var sTemp = oTagInput.getValue();
		var aNewTags = sTemp.split(" ");

		aNewTags.pop();

		if (aNewTags.length === 0) {
			oTagInput.setValue(sSelectedTag + " ");
		} else {
			oTagInput.setValue(aNewTags.join(" ") + " " + sSelectedTag + " ");
		}

		this._oOverlayCard._tagControls.tagList.setSelectedIndex(-1);
		oTagInput.focus();
	};

	NoteTakerCard.prototype._destroyTagControls = function () {
		var tagControls = this._oOverlayCard._tagControls;
		for (var controlName in tagControls) {
			tagControls[controlName].destroy();
		}
		this._oOverlayCard._tagControls = {};
	};

	NoteTakerCard.prototype._createTagSelectorControl = function () {

		var oTagControls = this._oOverlayCard._tagControls;

		var oTagSelectorLayout = new VerticalLayout({
			id: this.getId() + "-selectTag-panel"
		});
		oTagSelectorLayout.addStyleClass("sapSuiteUiCommonsNoteTakerFeederSelectTagPanel");
		oTagSelectorLayout.addStyleClass("sapUiShd");
		oTagControls.tagSelectorLayout = oTagSelectorLayout;

		// Arrow
		oTagSelectorLayout.addContent(new HTML(this.getId() + "-selectTag-arrow", {
			content: "<div class='sapSuiteUiCommonsNoteTakerFeederSelectTagArrow' ></div>"
		}));

		// Title
		oTagSelectorLayout.addContent(new HTML(this.getId() + "-selectTag-header", {
			content: ["<div class='sapSuiteUiCommonsNoteTakerFeederSelectTagHeader' >",
				this._rb.getText("NOTETAKERFEEDER_TOOLPOPUP_TITLE"),
				"</div>"].join("")
		}));

		oTagSelectorLayout.addContent(oTagControls.tagInput);
		oTagSelectorLayout.addContent(oTagControls.tagList);

		//Buttons
		var oTagSelectorButtonsLayout = new CommonsHorizontalLayout();
		oTagSelectorButtonsLayout.addStyleClass("sapSuiteUiCommonsNoteTakerFeederSelectTagButtons");
		oTagSelectorButtonsLayout.addContent(oTagControls.tagApplyBtn);
		oTagSelectorButtonsLayout.addContent(oTagControls.tagCancelBtn);
		oTagSelectorLayout.addContent(oTagSelectorButtonsLayout);

		return oTagSelectorLayout;
	};

	NoteTakerCard.prototype._prepareAttachmentPanel = function (bIsInOverlay) {
		var sIdPrefix = bIsInOverlay ? "-overlay" : "";
		var sCssPrefix = bIsInOverlay ? "Overlay" : "";

		var sId = [this.getId(), sIdPrefix, "-attachmentPanel"].join("");
		var oCurrentControl = sap.ui.getCore().byId(sId);
		if (oCurrentControl) {
			oCurrentControl.destroy();
		}

		var oAttachmentLayout = new CommonsHorizontalLayout(sId);
		oAttachmentLayout.addStyleClass(["suiteUiNtc", sCssPrefix, "AttachmentPanel"].join(""));
		oAttachmentLayout.addContent(new HTML({content: "<div class='suiteUiNtcAttachmentIcon'></div>"}));
		var oAttachmentLink = new Link({
			id: [this.getId(), sIdPrefix, "-attachmentLink"].join(""),
			text: this.getAttachmentFilename(),
			tooltip: this._rb.getText("NOTETAKERCARD_LINK_ATTACHMENT_TOOLTIP"),
			press: this._handleAttachmentDownload,
			href: this.getAttachmentUrl()
		});
		oAttachmentLink._ntc = this;
		oAttachmentLayout.addContent(oAttachmentLink);
		return oAttachmentLayout;
	};

	NoteTakerCard.prototype._prepareOverlayLayouts = function () {

		var oTopSectionLayout = new VerticalLayout();

		// Header&Timestamp (left side)
		var oHeaderLeftSideLayout = new VerticalLayout();
		oHeaderLeftSideLayout.addStyleClass("sapSuiteUiCommonsNtcOverlayTitle");

		// Edit&Delete buttons (right side)
		var oHeaderRightSideLayout = new CommonsHorizontalLayout();
		oHeaderRightSideLayout.addStyleClass("sapSuiteUiCommonsNtcHeaderButtons");

		// Title, timestamp and Edit&Delete buttons
		var oHeaderLayout = new CommonsHorizontalLayout(this.getId() + '-overlayHeader', {
			content: [oHeaderLeftSideLayout, oHeaderRightSideLayout]
		});
		oHeaderLayout.addStyleClass("sapSuiteUiCommonsNtcOverlayHeader");
		oTopSectionLayout.addContent(oHeaderLayout);

		// Toolbar
		var oToolbarLayout = new CommonsHorizontalLayout(this.getId() + '-overlayToolbar');
		oToolbarLayout.addStyleClass("suiteUiNtcToolbar");

		// Left side section
		var oToolbarLeftSideLayout = new CommonsHorizontalLayout();
		oToolbarLeftSideLayout.addStyleClass("suiteUiNtcOverlayToolbarLeftPanel");

		// Thumbs section of the toolbar
		var oToolbarRightSideLayout = new CommonsHorizontalLayout();
		oToolbarRightSideLayout.addStyleClass("suiteUiNtcOverlayToolbarRightPanel");

		// Construct toolbar
		oToolbarLayout.addContent(oToolbarLeftSideLayout);
		oToolbarLayout.addContent(oToolbarRightSideLayout);
		oTopSectionLayout.addContent(oToolbarLayout);
		this._oOverlayCard.addContent(oTopSectionLayout);

		// Body section
		var oBodySectionVerticalLayout = new LayoutHorizontalLayout();
		oBodySectionVerticalLayout.addStyleClass("sapSuiteUiCommonsNoteTakerCardContent");

		// Buttons section
		var oButtonsHorizontalLayout = new CommonsHorizontalLayout(this.getId() + "-buttons");
		oButtonsHorizontalLayout.addStyleClass("sapSuiteUiCommonsNoteTakerCardOverlayButtonPanel");

		this._oOverlayCard.layouts = {
			topSection: oTopSectionLayout,
			headerLeft: oHeaderLeftSideLayout,
			headerRight: oHeaderRightSideLayout,
			toolbar: oToolbarLayout,
			toolbarLeft: oToolbarLeftSideLayout,
			toolbarRight: oToolbarRightSideLayout,
			body: oBodySectionVerticalLayout,
			buttons: oButtonsHorizontalLayout
		};
	};

	NoteTakerCard.prototype._prepareOverlayHeaderBtns = function (bEditMode) {
		var that = this; //eslint-disable-line

		// Edit button
		var oEditButton = new Button(this.getId() + "-editButton", {
			tooltip: this._rb.getText("NOTETAKERCARD_BUTTON_EDIT_TOOLTIP"),
			press: function () {
				that._fnEdit();
			}
		});
		that._oOverlayCard.layouts.headerRight.addContent(oEditButton, 0);
		if (bEditMode) {
			oEditButton.setEnabled(false);
			oEditButton.addStyleClass("sapSuiteUiCommonsNoteTakerCardEditButtonDsbl");
		} else {
			oEditButton.setEnabled(true);
			oEditButton.addStyleClass("sapSuiteUiCommonsNoteTakerCardEditButton");
		}

		// Delete button
		var oDeleteButton = new Button(this.getId() + "-deleteButton", {
			tooltip: this._rb.getText("NOTETAKERCARD_BUTTON_DELETE_TOOLTIP"),
			press: function () {
				that._handleDelete(true);
			}
		});
		oDeleteButton.addStyleClass("sapSuiteUiCommonsNoteTakerCardDeleteButton");
		that._oOverlayCard.layouts.headerRight.addContent(oDeleteButton, 1);

		// Timestamp
		var oTimeStamp = new Label(this.getId() + "-overlayTimestamp", {
			text: that.getFormattedTimestamp()
		});
		oTimeStamp.addStyleClass("sapSuiteUiCommonsNoteTakerCardTimestamp");
		that._oOverlayCard.layouts.headerLeft.addContent(oTimeStamp, 1);
	};

	NoteTakerCard.prototype._prepareOverlayToolbar = function (bEditMode) {

		// Create tag list
		this._oOverlayCard._selectedTags = this.getTags();

		// Attachment panel
		if (this.getAttachmentFilename() !== "") {
			var oAttachmentPanel = this._prepareAttachmentPanel(true);
			this._oOverlayCard.layouts.topSection.addContent(oAttachmentPanel);

			this._oOverlayCard.layouts.body.addStyleClass("suiteUiNtcOverlayWithAttachment");
		} else {
			this._oOverlayCard.layouts.body.addStyleClass("suiteUiNtcOverlayWithoutAttachment");
		}
	};

	NoteTakerCard.prototype._prepareOverlayBody = function () {
		this._oOverlayCard.addContent(this._oOverlayCard.layouts.body);
	};

	NoteTakerCard.prototype._prepareOverlayButtons = function (bEditMode) {
		var that = this; //eslint-disable-line

		// Close button
		var oCloseButton = new Button(this.getId() + "-closeButton", {
			text: this._rb.getText("NOTETAKERCARD_BUTTON_CLOSE_OVERLAY"),
			tooltip: this._rb.getText("NOTETAKERCARD_BUTTON_CLOSE_OVERLAY_TOOLTIP"),
			press: function () {
				that._handleOverlayCloseEvent(that._oOverlayCard);
			}
		});
		oCloseButton.addStyleClass("sapSuiteUiCommonsNoteTakerCardOverlayButtonClose");

		// Save button
		var oSaveButton = new Button(this.getId() + "-saveButton", {
			text: this._rb.getText("NOTETAKERCARD_BUTTON_SAVE_TEXT"),
			tooltip: this._rb.getText("NOTETAKERCARD_BUTTON_SAVE_TOOLTIP"),
			press: function () {
				that._fnSave();
			}
		});
		oSaveButton.addStyleClass("sapSuiteUiCommonsNoteTakerCardOverlayButtonSave");
		that._oOverlayCard.layouts.buttons.addContent(oCloseButton, 0);
		that._oOverlayCard.layouts.buttons.addContent(oSaveButton, 1);

		if (bEditMode) {
			oSaveButton.setEnabled(true);
			this._fnCreateInEditMode();
		} else {
			oSaveButton.setEnabled(false);
			this._fnCreateInViewMode();
		}

		this._oOverlayCard.addContent(this._oOverlayCard.layouts.buttons);
	};

	// Adds components for the View mode of the overlay
	NoteTakerCard.prototype._fnCreateInViewMode = function () {
		var that = this; //eslint-disable-line
		that._oOverlayCard.bEditMode = false;

		//Title viewer section
		var oCardLabel = new Label(that.getId() + "-overlayCardHeader", {
			text: that.getHeader()
		});
		oCardLabel.addStyleClass("sapSuiteUiCommonsNoteTakerCardTitle");
		that._oOverlayCard.layouts.headerLeft.insertContent(oCardLabel, 0);

		// Tag viewer section of the toolbar
		var oTagPanel = new HTML(that.getId() + '-overlayTagPanel');
		oTagPanel.setContent(that._wrapTagPanelToDiv(that._getFormattedTags(), that._oOverlayCard.bEditMode));

		that._oOverlayCard.layouts.toolbarLeft.addContent(oTagPanel);

		// Display thumb if any
		var oThumb = new HTML({
			id: that.getId() + "-overlay-thumb",
			content: that._wrapThumbToDiv()
		});
		that._oOverlayCard.layouts.toolbarRight.addContent(oThumb);

		// Display body
		var oCardBody = new HTML(that.getId() + "-overlayBody");
		oCardBody.setContent(that._wrapBodyToDiv(that._getFormattedBody()));
		oCardBody.addStyleClass("sapSuiteUiCommonsNoteTakerCardBody");
		that._oOverlayCard.layouts.body.addContent(oCardBody);

		// Display Save button in the correct state
		var oSaveButton = that._oOverlayCard.layouts.buttons.getContent()[1];
		oSaveButton.setEnabled(false);
		// Display Edit button in the correct state
		var oEditBtn = that._oOverlayCard.layouts.headerRight.getContent()[0];
		oEditBtn.setEnabled(true);
		oEditBtn.removeStyleClass("sapSuiteUiCommonsNoteTakerCardEditButtonDsbl");
		oEditBtn.addStyleClass("sapSuiteUiCommonsNoteTakerCardEditButton");
	};

	// Adds components for the Edit mode of the overlay
	NoteTakerCard.prototype._fnCreateInEditMode = function () {
		var that = this; //eslint-disable-line
		that._oOverlayCard.bEditMode = true;

		// Display editable title
		var oCardTitleField = new TextField(that.getId() + "-overlayCardTitle", {
			maxLength: 50
		});
		oCardTitleField.setValue(that.getHeader());
		oCardTitleField.addStyleClass("sapSuiteUiCommonsNoteTakerCardTitle");
		var oTitleEdit = new InPlaceEdit(that.getId() + "-overlayCardTitleEdit", {
			content: oCardTitleField,
			tooltip: that._rb.getText("NOTETAKERCARD_EDITFIELD_TITLE_TOOLTIP"),
			design: CommonsLibrary.TextViewDesign.H2,
			undoEnabled: false
		});
		oTitleEdit.addStyleClass("sapSuiteUiCommonsNtcdTitleEdit");
		that._oOverlayCard.layouts.headerLeft.insertContent(oTitleEdit, 0);

		// Tag viewer section of the toolbar
		var oTagPanel = new HTML(that.getId() + '-overlayTagPanel');
		oTagPanel.setContent(that._wrapTagPanelToDiv(that._getFormattedTags(), that._oOverlayCard.bEditMode));

		that._oOverlayCard.layouts.toolbarLeft.addContent(oTagPanel);

		// Create tag selector button
		var oTagButton = new Button({
			id: that.getId() + "-tag-button",
			tooltip: that._rb.getText("NOTETAKERCARD_BUTTON_TAG_TOOLTIP"),
			press: function () {
				that._toggleTagPopup();
			}
		});
		oTagButton.addStyleClass("sapSuiteUiCommonsNoteTakerFeederTagButton");

		var oTagList = new ListBox({
			id: that.getId() + "-tagListBox",
			visibleItems: 10,
			width: "100%",
			height: "194px",
			select: function (oEvent) {
				that._handleListSelect(oEvent);
			}
		});

		var oTagInput = new TextField({
			id: that.getId() + "-inputTag",
			liveChange: function (oEvent) {
				that._handleTagInputLive(oEvent);
			}
		});
		oTagInput.onsapdown = function (oEvent) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
			jQuery("#" + that.getId() + "-tagListBox li:eq(0)").focus();
		};

		var oCancelTagButton = new Button({
			id: that.getId() + "-cancel-tags-button",
			text: that._rb.getText("NOTETAKERFEEDER_BUTTON_CANCEL_TAGS"),
			tooltip: that._rb.getText("NOTETAKERFEEDER_BUTTON_CANCEL_TAGS_TOOLTIP"),
			press: function () {
				that._toggleTagPopup();
			}
		});
		oCancelTagButton.addStyleClass("sapSuiteUiCommonsNoteTakerFeederCancelTagButton");

		var oAddTagButton = new Button({
			id: that.getId() + "-add-tags-button",
			text: that._rb.getText("NOTETAKERFEEDER_BUTTON_ADD_TAGS"),
			tooltip: that._rb.getText("NOTETAKERFEEDER_BUTTON_ADD_TAGS_TOOLTIP"),
			press: function () {
				that._handleAddTag(oTagInput.getValue());
				oTagButton.rerender();
				that._toggleTagPopup();
			}
		});

		// Store tag controls
		that._oOverlayCard._tagControls = {
			tagButton: oTagButton,
			tagList: oTagList,
			tagInput: oTagInput,
			tagCancelBtn: oCancelTagButton,
			tagApplyBtn: oAddTagButton
		};

		that._oOverlayCard.addContent(that._createTagSelectorControl());

		// Create thumb up button
		var oThumbUpButton = new Button({
			id: that.getId() + "-overlay-thumb-up-button",
			press: function (e) {
				that._oOverlayCard.bThumbUp = !that._oOverlayCard.bThumbUp;
				if (that._oOverlayCard.bThumbUp) {
					that._oOverlayCard.bThumbDown = false;
				}

				fnSetThumbsView();
			},
			tooltip: that._rb.getText("NOTETAKERFEEDER_BUTTON_THUMB_UP_TOOLTIP")
		});
		oThumbUpButton.addStyleClass("sapSuiteUiCommonsNoteTakerThumbUpBtn");

		// Create thumb down button
		var oThumbDownButton = new Button({
			id: that.getId() + "-overlay-thumb-down-button",
			press: function (e) {
				that._oOverlayCard.bThumbDown = !that._oOverlayCard.bThumbDown;
				if (that._oOverlayCard.bThumbDown) {
					that._oOverlayCard.bThumbUp = false;
				}

				fnSetThumbsView();
			},
			tooltip: that._rb.getText("NOTETAKERFEEDER_BUTTON_THUMB_DOWN_TOOLTIP")
		});
		oThumbDownButton.addStyleClass("sapSuiteUiCommonsNoteTakerThumbDownBtn");

		// Thumb buttons adjustment
		function fnSetThumbsView() {
			if (that._oOverlayCard.bThumbUp) {
				oThumbUpButton.addStyleClass("sapSuiteUiCommonsNoteTakerCardSelectedBtn");
				that._oOverlayCard.addStyleClass("suiteUiNtcPositiveCard");
			} else {
				oThumbUpButton.removeStyleClass("sapSuiteUiCommonsNoteTakerCardSelectedBtn");
				that._oOverlayCard.removeStyleClass("suiteUiNtcPositiveCard");
			}

			if (that._oOverlayCard.bThumbDown) {
				oThumbDownButton.addStyleClass("sapSuiteUiCommonsNoteTakerCardSelectedBtn");
				that._oOverlayCard.addStyleClass("suiteUiNtcNegativeCard");
			} else {
				oThumbDownButton.removeStyleClass("sapSuiteUiCommonsNoteTakerCardSelectedBtn");
				that._oOverlayCard.removeStyleClass("suiteUiNtcNegativeCard");
			}

			jQuery(document.getElementById(oThumbUpButton.getId())).attr("aria-pressed", that._oOverlayCard.bThumbUp);
			jQuery(document.getElementById(oThumbDownButton.getId())).attr("aria-pressed", that._oOverlayCard.bThumbDown);
		}

		fnSetThumbsView();

		// Adding toolbar elements
		that._oOverlayCard.layouts.toolbarLeft.insertContent(oTagButton, 0);
		that._oOverlayCard.layouts.toolbarRight.addContent(oThumbUpButton);
		that._oOverlayCard.layouts.toolbarRight.addContent(oThumbDownButton);

		// Display editable body
		var oSaveButton = that._oOverlayCard.layouts.buttons.getContent()[1];
		oSaveButton.setEnabled(true);
		var oCardBody = new TextArea(that.getId() + "-overlayBody", {
			required: true,
			liveChange: function (e) {
				var sEnteredText = e.getParameter("liveValue");
				var bEnabled = (sEnteredText !== null) && !/^\s*$/.test(sEnteredText);

				if (bEnabled !== oSaveButton.getEnabled()) {
					oSaveButton.setEnabled(bEnabled);
				}
			}
		});
		oCardBody.setValue(that.getBody());
		oCardBody.addStyleClass("sapSuiteUiCommonsNoteTakerCardBody");
		that._oOverlayCard.layouts.body.addContent(oCardBody);
		that._oOverlayCard.layouts.body.addContent(new Label({required: true}).addStyleClass("sapSuiteRequiredLbl"));

		// Display Edit button in the correct state
		var oEditBtn = that._oOverlayCard.layouts.headerRight.getContent()[0];
		oEditBtn.setEnabled(false);
		oEditBtn.removeStyleClass("sapSuiteUiCommonsNoteTakerCardEditButton");
		oEditBtn.addStyleClass("sapSuiteUiCommonsNoteTakerCardEditButtonDsbl");

	};

	NoteTakerCard.prototype._fnSave = function () {
		var that = this; //eslint-disable-line
		var oTitleEdit = that._oOverlayCard.layouts.headerLeft.getContent()[0];
		var oCardTitleField = oTitleEdit.getContent();
		var oCardBody = that._oOverlayCard.layouts.body.getContent()[0];

		if (oCardBody.getValue()) {
			if (!this.getBinding("body")) {
				that.setHeader(oCardTitleField.getValue());
				that.setBody(oCardBody.getValue());
				that.setTimestamp(new Date());

				that.setThumbUp(that._oOverlayCard.bThumbUp);
				that.setThumbDown(that._oOverlayCard.bThumbDown);
				that.setTags(that._oOverlayCard._selectedTags);
			}

			var eData = {};
			eData.uid = that.getUid();
			eData.title = oCardTitleField.getValue();
			eData.body = oCardBody.getValue();
			eData.timestamp = new Date();
			eData.thumbUp = that._oOverlayCard.bThumbUp;
			eData.thumbDown = that._oOverlayCard.bThumbDown;
			eData.tags = that._oOverlayCard._selectedTags;
			that.fireEditNote(eData);

			that._oOverlayCard.layouts.headerLeft.removeContent(oTitleEdit);
			oTitleEdit.destroy();
			oCardTitleField.destroy();
			that._oOverlayCard.layouts.body.removeAllContent();
			oCardBody.destroy();

			that._destroyTagControls();
			that._oOverlayCard.layouts.toolbarLeft.destroyContent();
			that._oOverlayCard.layouts.toolbarRight.destroyContent();

			that._fnCreateInViewMode();

			jQuery(document.getElementById(that.getId() + "-overlayTimestamp")).html(that.getFormattedTimestamp());
			jQuery(document.getElementById(that.getId() + "-overlay-close")).focus();
		}
	};

	NoteTakerCard.prototype._fnEdit = function () {
		var that = this; //eslint-disable-line
		var oCardLabel = that._oOverlayCard.layouts.headerLeft.getContent()[0];
		var oCardBody = that._oOverlayCard.layouts.body.getContent()[0];

		that._oOverlayCard.layouts.topSection.removeContent(oCardLabel);
		oCardLabel.destroy();
		that._oOverlayCard.layouts.body.removeContent(oCardBody);
		oCardBody.destroy();
		that._oOverlayCard.layouts.toolbarLeft.destroyContent();
		that._oOverlayCard.layouts.toolbarRight.destroyContent();

		that._fnCreateInEditMode();

		that._oOverlayCard.layouts.topSection.rerender();
		//set focus to text area. render it first
		that._oOverlayCard.layouts.body.rerender();

		if (that.getId() + "-overlayBody" ? window.document.getElementById(that.getId() + "-overlayBody") : null) {
			(that.getId() + "-overlayBody" ? window.document.getElementById(that.getId() + "-overlayBody") : null).focus();
		}
	};

	NoteTakerCard.prototype._handleAttachmentDownload = function () {
		var eData = {};
		eData.uid = this._ntc.getUid();
		eData.url = this._ntc.getAttachmentUrl();
		eData.filename = this._ntc.getAttachmentFilename();

		this._ntc.fireAttachmentClick(eData);
	};

	return NoteTakerCard;

});
