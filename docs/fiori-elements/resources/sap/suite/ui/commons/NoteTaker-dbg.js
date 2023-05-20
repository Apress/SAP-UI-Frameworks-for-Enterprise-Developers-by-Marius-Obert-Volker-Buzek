/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'sap/ui/commons/library',
	'sap/ui/commons/Carousel',
	'sap/ui/commons/Button',
	'sap/ui/commons/ListBox',
	'sap/ui/commons/SearchField',
	'sap/ui/core/Control',
	'sap/suite/ui/commons/NoteTakerCard',
	'sap/suite/ui/commons/NoteTakerFeeder',
	'sap/ui/core/ListItem',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/Sorter',
	"sap/ui/events/KeyCodes",
	"./NoteTakerRenderer"
], function (jQuery, CommonsLibrary, Carousel, Button, ListBox, SearchField, Control, NoteTakerCard, NoteTakerFeeder, ListItem,
			 Filter, FilterOperator, Sorter, KeyCodes, NoteTakerRenderer) {
	"use strict";

	/**
	 * Constructor for a new NoteTaker.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control allows you to create and store your notes for further reference.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Standard Fiori technology should be used.
	 * @alias sap.suite.ui.commons.NoteTaker
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NoteTaker = Control.extend("sap.suite.ui.commons.NoteTaker", /** @lends sap.suite.ui.commons.NoteTaker.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Number of notes to display.
				 */
				visibleNotes: {type: "int", group: "Misc", defaultValue: 2},

				/**
				 * The View All link appears in the Note Taker card when length of a card body text exceeds the specified value. The updated value of this property is not applied to the existing cards.
				 */
				cardViewAllTrigger: {type: "int", group: "Misc", defaultValue: 1800},

				/**
				 * A composite object containing criteria for filtering cards in the Note Taker.
				 */
				filterCriteria: {type: "object", group: "Misc", defaultValue: null},

				/**
				 * Defines a path on the server where the attached files are uploaded.
				 */
				attachmentUploadUrl: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * The attachment property name for identification on the server side after sending data to the server.
				 */
				attachmentName: {type: "string", group: "Misc", defaultValue: 'attachment'}
			},
			aggregations: {

				/**
				 * This aggregation allows you to add note cards to the Note Taker and remove them from the Note Taker.
				 */
				cards: {type: "sap.suite.ui.commons.NoteTakerCard", multiple: true, singularName: "card"},

				/**
				 * A slideable container for the NoteTaker cards and Feeder card.
				 */
				carousel: {type: "sap.ui.commons.Carousel", multiple: false, visibility: "hidden"}
			},
			events: {

				/**
				 * The event is fired when a new card is added if no data binding is available.
				 * If data binding is available, the event is fired to notify a developer to add an element to the model.
				 */
				addCard: {
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
						 * The View All link appears in the Note Taker card when length of a body text exceeds the specified value.
						 */
						viewAllTrigger: {type: "int"},

						/**
						 * Indicates positive information for a new card.
						 */
						thumbUp: {type: "boolean"},

						/**
						 * Indicates negative information for a new card.
						 */
						thumbDown: {type: "boolean"},

						/**
						 * Stores the name of the file attached to the card.
						 */
						attachmentFilename: {type: "string"},

						/**
						 * The unique ID if available.
						 */
						uid: {type: "string"},

						/**
						 * Stores the URL of the file attached to the card.
						 */
						attachmentUrl: {type: "string"},

						/**
						 * A newly created card if no data binding is available. If data binding is available, this parameter is empty.
						 */
						card: {type: "sap.suite.ui.commons.NoteTakerCard"}
					}
				},

				/**
				 * The event is fired when a new card is deleted if no data binding is available.
				 * If data binding is available, the event is fired to notify a developer to delete the element from the model.
				 */
				deleteCard: {
					parameters: {

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
						 * The unique ID that was set by an application developer.
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
				 * The event is fired when a new card has been edited.
				 */
				editCard: {
					parameters: {

						/**
						 * The title of the edited card.
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
				 * Fire event uploadComplete to attached listeners.
				 */
				attachmentUploadComplete: {
					parameters: {

						/**
						 * The response message of the String type that comes from the server. On the server side this response has to be put within the "body" tags of the response document of the iFrame. It can consist of a return code and an optional message. This does not work in cross-domain scenarios.
						 */
						response: {type: "string"},

						/**
						 * The unique ID of the card.
						 */
						uid: {type: "string"}
					}
				},

				/**
				 * The event is fired, when user deletes the attached file.
				 */
				attachmentDelete: {
					parameters: {

						/**
						 * A name of the attached file.
						 */
						filename: {type: "string"},

						/**
						 * The unique ID of the card.
						 */
						uid: {type: "string"}
					}
				},

				/**
				 * The event is fired when a user presses the attachment link.
				 */
				attachmentClick: {
					parameters: {

						/**
						 * The unique ID of the card.
						 */
						uid: {type: "string"},

						/**
						 * If true, a user chooses the attachment in the Note card. If false, a user chooses the attachment in the Feeder card.
						 */
						isCardAttachment: {type: "string"},

						/**
						 * A name of the attached file.
						 */
						filename: {type: "string"}
					}
				}
			}
		}
	});

	/**
	 * The NoteTaker initialization hook.
	 * Creates a carousel control initializing it with required parameters.
	 * Adds NoteTakerFeeder to the created carousel control.
	 *
	 * @private
	 */
	NoteTaker.prototype.init = function () {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
		this._bFilterTagPopupOpen = false;
		this._bSearchPopupOpen = false;

		this._carousel = new Carousel({
			id: this.getId() + "-carousel",
			height: "540px"
		});

		this.setAggregation("carousel", this._carousel);

		this._carousel.addContent(this._createFeederAndAddToThis());

		this._notFilteredCards = [];

		this._oHomeButton = new Button({
			id: this.getId() + "-home-button",
			tooltip: this._rb.getText("NOTETAKER_BUTTON_HOME_TOOLTIP"),
			press: [this._handleHomeButton, this]
		});
		this._oHomeButton.addStyleClass("sapSuiteUiCommonsNoteTakerHomeButton");

		this._oFilterTagButton = new Button({
			id: this.getId() + "-filterTag-button",
			tooltip: this._rb.getText("NOTETAKER_BUTTON_FILTER_TAG_TOOLTIP"),
			press: [this._toggleFilterTagPopup, this]
		});
		this._oFilterTagButton.addStyleClass("sapSuiteUiCommonsNoteTakerFilterTagButton");

		this._oFilterThumbUpButton = new Button({
			id: this.getId() + "-filter-thumb-up-button",
			tooltip: this._rb.getText("NOTETAKER_BUTTON_FILTER_THUMB_UP_TOOLTIP"),
			press: [this._handleFilteringByThumbUp, this]
		});
		this._oFilterThumbUpButton.addStyleClass("sapSuiteUiCommonsNoteTakerFilterThumbUpButton");

		this._oFilterThumbDownButton = new Button({
			id: this.getId() + "-filter-thumb-down-button",
			tooltip: this._rb.getText("NOTETAKER_BUTTON_FILTER_THUMB_DOWN_TOOLTIP"),
			press: [this._handleFilteringByThumbDown, this]
		});
		this._oFilterThumbDownButton.addStyleClass("sapSuiteUiCommonsNoteTakerFilterThumbDownButton");

		this._oFilterAllButton = new Button({
			id: this.getId() + "-filterAll-button",
			text: this._rb.getText("NOTETAKER_BUTTON_FILTER_ALL_TEXT"),
			tooltip: this._rb.getText("NOTETAKER_BUTTON_FILTER_ALL_TOOLTIP"),
			press: [this._handleResetFilters, this]
		});
		this._oFilterAllButton.addStyleClass("sapSuiteUiCommonsNoteTakerFilterAllButton");

		this._oSearchButton = new Button({
			id: this.getId() + "-filter-search-button",
			tooltip: this._rb.getText("NOTETAKER_BUTTON_SEARCH_TOOLTIP"),
			press: [this._handleSearchPopup, this]
		});
		this._oSearchButton.addStyleClass("sapSuiteUiCommonsNoteTakerSearchBtn");

		this._oFilterSearchField = new SearchField({
			id: this.getId() + "-filter-searchField",
			tooltip: this._rb.getText("NOTETAKER_BUTTON_SEARCH_TOOLTIP"),
			showListExpander: false,
			enableFilterMode: true,
			enableListSuggest: false,
			search: [this._handleSearchingByText, this]
		});
		this._oFilterSearchField.addStyleClass("suiteUiNtFilterSearchField");

		this._oFilterTagList = new ListBox({
			id: this.getId() + "-filterTag-listBox",
			allowMultiSelect: true,
			visibleItems: 10,
			width: "100%",
			height: "194px"
		});

		this._oCancelFilterTagButton = new Button({
			id: this.getId() + "-cancel-filterTags-button",
			text: this._rb.getText("NOTETAKERFEEDER_BUTTON_CANCEL_TAGS"),
			tooltip: this._rb.getText("NOTETAKERFEEDER_BUTTON_CANCEL_TAGS_TOOLTIP"),
			press: [this._toggleFilterTagPopup, this]
		});
		this._oCancelFilterTagButton.addStyleClass("sapSuiteUiCommonsNoteTakerCancelFilterTagButton");

		this._oCancelFilterTagButton.onfocusout = function (oEvent) {
			this._oFilterTagList.focus();
		}.bind(this);

		this._oApplyFilterTagButton = new Button({
			id: this.getId() + "-apply-filterTags-button",
			text: this._rb.getText("NOTETAKER_BUTTON_FILTER_TAG_APPLY_TEXT"),
			tooltip: this._rb.getText("NOTETAKER_BUTTON_FILTER_TAG_APPLY_TOOLTIP"),
			press: [this._toggleFilterTagPopup, this]
		});
	};

	/**
	 * Required adaptations before rendering.
	 *
	 * @private
	 */
	NoteTaker.prototype.onBeforeRendering = function () {
		this._carousel.setVisibleItems(this.getVisibleNotes());
		this._adjustFilteringButtonsStyle();
		this._feeder.setAttachmentName(this.getAttachmentName());
	};

	/**
	 * Required adaptations after rendering.
	 *
	 * @private
	 */
	NoteTaker.prototype.onAfterRendering = function () {
		this._adjustPopupState();
		if (!this.getAttachmentUploadUrl()) {
			jQuery(document.getElementById(this._feeder._oAddAttachButton.getId())).hide();
		}

		jQuery(document.getElementById(this._oFilterThumbUpButton.getId())).attr("aria-pressed", this.getFilterCriteria() && this.getFilterCriteria().thumbUp);
		jQuery(document.getElementById(this._oFilterThumbDownButton.getId())).attr("aria-pressed", this.getFilterCriteria() && this.getFilterCriteria().thumbDown);
	};

	/**
	 * Destroys this instance of NoteTaker.
	 *
	 * @private
	 */
	NoteTaker.prototype.exit = function () {
		this.destroyAggregation("carousel", true);
		this._carousel = null;
		this._oHomeButton.destroy();
		this._oHomeButton = null;
		this._oFilterTagButton.destroy();
		this._oFilterTagButton = null;
		this._oFilterThumbUpButton.destroy();
		this._oFilterThumbUpButton = null;
		this._oFilterThumbDownButton.destroy();
		this._oFilterThumbDownButton = null;
		this._oFilterAllButton.destroy();
		this._oFilterAllButton = null;
		this._oFilterTagList.destroy();
		this._oFilterTagList = null;
		this._oCancelFilterTagButton.destroy();
		this._oCancelFilterTagButton = null;
		this._oApplyFilterTagButton.destroy();
		this._oApplyFilterTagButton = null;
		this._oFilterSearchField.destroy();
		this._oFilterSearchField = null;
		this._oSearchButton.destroy();
		this._oSearchButton = null;
	};

	/**
	 * Handles the Add button press event generated by NoteTakerFeeder.
	 *
	 * @param {jQuery.EventObject} oEvent The event object
	 *
	 * @private
	 */
	NoteTaker.prototype._handleAddNote = function (oEvent) {
		var title = oEvent.getParameter("title");
		var body = oEvent.getParameter("body");
		var timestamp = oEvent.getParameter("timestamp");
		var tags = oEvent.getParameter("tags");
		var thumbUp = oEvent.getParameter("thumbUp");
		var thumbDown = oEvent.getParameter("thumbDown");
		var attachmentFilename = oEvent.getParameter("attachmentFilename");

		var eData = {};
		eData.title = title;
		eData.body = body;
		eData.timestamp = timestamp;
		eData.viewAllTrigger = this.getCardViewAllTrigger();
		eData.tags = tags;
		eData.thumbUp = thumbUp;
		eData.thumbDown = thumbDown;
		eData.attachmentFilename = attachmentFilename;
		eData.uid = this._nextCardUid;
		eData.attachmentUrl = this._nextCardAttachmentUrl;

		var oBinding = this.getBinding("cards");
		if (oBinding) {
			//in case of data binding model has to be updated
			this.fireAddCard(eData);
			//sorting should happen when model is updated
			var oTimestampSorter = new Sorter("timestamp", true);
			oBinding.sort(oTimestampSorter);
		} else {
			var oNoteCard = new NoteTakerCard();
			oNoteCard.setBody(body);
			oNoteCard.setHeader(title);
			oNoteCard.setTimestamp(timestamp);
			oNoteCard.setViewAllTrigger(this.getCardViewAllTrigger());
			oNoteCard.setTags(tags);
			oNoteCard.setThumbUp(thumbUp);
			oNoteCard.setThumbDown(thumbDown);
			oNoteCard.setAttachmentFilename(attachmentFilename);
			oNoteCard.setUid(this._nextCardUid);
			oNoteCard.setAttachmentUrl(this._nextCardAttachmentUrl);

			this.insertCard(oNoteCard, 0);

			eData.card = oNoteCard;
			this.fireAddCard(eData);
		}

		this._nextCardUid = null;
		this._nextCardAttachmentUrl = null;

		this._filter();
	};

	NoteTaker.prototype.addCard = function (oCard) {
		this._addDeleteDelegate(oCard);
		this._addEditDelegate(oCard);
		this._addAttachmentDelegate(oCard);
		this.getNotFilteredCards().push(oCard);
		this._carousel.addContent(oCard);
		this._sortIfNeeded();
		this._spreadTagList();
		return this;
	};

	NoteTaker.prototype.getCards = function () {
		return this._carousel.getContent().slice(1);
	};

	NoteTaker.prototype.insertCard = function (oCard, iIndex) {
		this._addDeleteDelegate(oCard);
		this._addEditDelegate(oCard);
		this._addAttachmentDelegate(oCard);
		this.getNotFilteredCards().push(oCard);
		this._carousel.insertContent(oCard, ++iIndex);
		this._spreadTagList();
		return this;
	};

	NoteTaker.prototype.removeCard = function (oCard) {
		this._spreadTagList();
		return this._carousel.removeContent(oCard);
	};

	NoteTaker.prototype.removeAllCards = function () {
		var aContent = this._carousel.removeAllContent();
		this._feeder.setTags([]);
		this._carousel.addContent(this._feeder);
		return aContent.slice(1);
	};

	NoteTaker.prototype.indexOfCard = function (oCard) {
		var iIndex = this._carousel.indexOfContent(oCard);
		return (iIndex > 0) ? --iIndex : -1;
	};

	NoteTaker.prototype.destroyCards = function () {
		this._carousel.destroyContent();
		this._carousel.addContent(this._createFeederAndAddToThis());
		return this;
	};

	/**
	 * The utility method which creates NoteTakerFeeder.
	 * Minimizes code duplication.
	 * @returns {sap.suite.ui.commons.NoteTakerFeeder} NoteTakerFeeder instance
	 * @private
	 */
	NoteTaker.prototype._createFeederAndAddToThis = function () {
		var that = this; //eslint-disable-line
		this._feeder = new NoteTakerFeeder({
			id: this.getId() + "-feeder",
			attachmentName: this.getAttachmentName(),
			addNote: [this._handleAddNote, this],
			attachmentUploadUrl: this.getAttachmentUploadUrl(),
			attachmentSelect: function (e) {
				var eData = {filename: e.getParameter("filename")};
				this.fireAttachmentSelect(eData);
			}.bind(this),
			attachmentUploadComplete: function (e) {
				var eData = {
					response: e.getParameter("response"),
					uid: that._nextCardUid
				};
				that.fireAttachmentUploadComplete(eData);
				this._oAttachmentLink.setHref(that._nextCardAttachmentUrl);
				this._oAttachmentLink.rerender();
			},
			attachmentDelete: function (e) {
				var eData = {
					filename: e.getParameter("filename"),
					uid: this._nextCardUid
				};

				this.fireAttachmentDelete(eData);
			}.bind(this),
			attachmentClick: function (e) {
				var eData = {
					filename: e.getParameter("filename"),
					uid: this._nextCardUid,
					isCardAttachment: false
				};

				this.fireAttachmentClick(eData);
			}.bind(this)
		});
		this._spreadTagList();
		return this._feeder;
	};

	/**
	 * Method for sorting cards inside NoteTaker.
	 * It is called only when databinding is undefined.
	 *
	 * @private
	 */
	NoteTaker.prototype._sortIfNeeded = function () {
		var oBinding = this.getBinding();
		if (oBinding === undefined) {
			var aCards = this.getCards();
			aCards.sort(function (oCard1, oCard2) {
				// descending sort
				return oCard2.getTimestamp().getTime() - oCard1.getTimestamp().getTime();
			});

			this.removeAllCards();

			for (var i = 0; i < aCards.length; i++) {
				this._carousel.addContent(aCards[i]);
			}
		}
	};

	NoteTaker.prototype.getAllTags = function () {
		var oBinding = this.getBinding("cards");
		var aCards = oBinding ? this.getCards() : this.getNotFilteredCards();
		var oTagSet = {};
		var aResult = [];
		for (var i = 0; i < aCards.length; i++) {
			var aTags = aCards[i].getTags();
			for (var j = 0; j < aTags.length; j++) {
				if (aTags[j] !== "") {
					oTagSet[aTags[j]] = true;
				}
			}
		}

		for (var tag in oTagSet) {
			aResult.push(tag);
		}

		return aResult.sort();
	};

	NoteTaker.prototype._handleDeleteNote = function (oEvent) {
		var oBinding = this.getBinding("cards");
		var eData = {};
		eData.title = oEvent.getParameter("title");
		eData.timestamp = oEvent.getParameter("timestamp");
		eData.body = oEvent.getParameter("body");
		eData.uid = oEvent.getParameter("uid");
		eData.thumbUp = oEvent.getParameter("thumbUp");
		eData.thumbDown = oEvent.getParameter("thumbDown");

		if (oBinding) {
			this.fireDeleteCard(eData);
		} else {
			var card2Delete = oEvent.getParameter("cardId");
			var allCards = this.getNotFilteredCards();
			for (var i = 0; i < allCards.length; i++) {
				if (allCards[i].getId() === card2Delete) {
					allCards.splice(i, 1);
				}
			}
			this.removeCard(card2Delete);
			this.fireDeleteCard(eData);
		}
	};

	NoteTaker.prototype._handleEditNote = function (oEvent) {
		var eData = {};
		eData.title = oEvent.getParameter("title");
		eData.timestamp = oEvent.getParameter("timestamp");
		eData.body = oEvent.getParameter("body");
		eData.uid = oEvent.getParameter("uid");
		eData.thumbUp = oEvent.getParameter("thumbUp");
		eData.thumbDown = oEvent.getParameter("thumbDown");
		eData.tags = oEvent.getParameter("tags");

		this.fireEditCard(eData);

		this._sortIfNeeded();

		this._spreadTagList();
	};

	NoteTaker.prototype._addDeleteDelegate = function (oCard) {
		oCard.attachDeleteNote(function (oEvent) {
			this._handleDeleteNote(oEvent);
		}, this);
	};

	NoteTaker.prototype._addEditDelegate = function (oCard) {
		oCard.attachEditNote(function (oEvent) {
			this._handleEditNote(oEvent);
		}, this);
	};

	/**
	 * Handles home button click. Scrolls carousel to its first element that is a feeder.
	 */
	NoteTaker.prototype._handleHomeButton = function () {
		this._carousel.setFirstVisibleIndex(0);
		this._feeder._focusDefaultControl();
	};

	/*
	 * Override to automatically apply filter
	 */
	NoteTaker.prototype.setFilterCriteria = function (oFilterCriteria) {
		this.setProperty("filterCriteria", oFilterCriteria);
		this._filter();
		return this;
	};

	NoteTaker.prototype._toggleFilterTagPopup = function () {
		if (this._bFilterTagPopupOpen) {
			jQuery(document.getElementById(this.getId() + "-filterTag-panel")).slideToggle();
			this._bFilterTagPopupOpen = false;
		} else {
			this._addTagsToFilterListBox(this.getAllTags());
			jQuery(document.getElementById(this.getId() + "-filterTag-panel")).slideToggle();
			this._oFilterTagList.focus();
			this._bFilterTagPopupOpen = true;
		}
		setTimeout(function () {
			this._handleFilteringByTags();
		}.bind(this), 400);
	};

	NoteTaker.prototype._addTagsToFilterListBox = function (aTags) {
		var aSelectedItems = [];
		var aFilterTags = this._getFilterTags();
		var aListItems = jQuery.map(aTags, function (v, i) {

			// The Array.indexOf() method is not supported in Internet Explorer 8
			if (aFilterTags.indexOf) {
				if (aFilterTags.indexOf(v) >= 0) {
					aSelectedItems.push(i);
				}
			} else {
				for (var k in aFilterTags) {
					if (aFilterTags[k] === v) {
						aSelectedItems.push(i);
						break;
					}
				}
			}

			return new ListItem({text: v});
		});

		this._oFilterTagList.setItems(aListItems, true);
		this._oFilterTagList.setSelectedIndices(aSelectedItems);
		this._oFilterTagList.rerender();
	};

	NoteTaker.prototype._cloneFilterCriteria = function () {
		var oFilterCriteria = this.getFilterCriteria();
		var oNewCriteria = {};

		if (oFilterCriteria) {
			for (var pName in oFilterCriteria) {
				oNewCriteria[pName] = oFilterCriteria[pName];
			}
		}

		return oNewCriteria;
	};

	NoteTaker.prototype._handleFilteringByTags = function () {
		var oFilterCriteria = this._cloneFilterCriteria();
		var aSelectedItems = this._oFilterTagList.getSelectedItems();
		var aTags = [];

		for (var i in aSelectedItems) {
			aTags.push(aSelectedItems[i].getText());
		}

		oFilterCriteria.tags = aTags;
		this.setFilterCriteria(oFilterCriteria);
	};

	NoteTaker.prototype._handleFilteringByThumbUp = function () {
		var oFilterCriteria = this._cloneFilterCriteria();
		oFilterCriteria.thumbUp = !oFilterCriteria.thumbUp;
		this.setFilterCriteria(oFilterCriteria);
	};

	NoteTaker.prototype._handleFilteringByThumbDown = function () {
		var oFilterCriteria = this._cloneFilterCriteria();
		oFilterCriteria.thumbDown = !oFilterCriteria.thumbDown;
		this.setFilterCriteria(oFilterCriteria);
	};

	NoteTaker.prototype._handleResetFilters = function () {
		var oFilterCriteria = this.getFilterCriteria();
		var oNewCriteria = null;

		if (oFilterCriteria && oFilterCriteria.search && oFilterCriteria.search.length > 0) {
			oNewCriteria = {};
			oNewCriteria.search = oFilterCriteria.search;
		}

		this.setFilterCriteria(oNewCriteria);
	};

	NoteTaker.prototype._handleSearchingByText = function (oEvent) {
		var sSearchText = oEvent.getParameter("query");
		var oFilterCriteria = this._cloneFilterCriteria();
		var aSearchWords = [];
		var aNewWords = sSearchText.split(new RegExp("\\s+"));

		for (var i = 0; i < aNewWords.length; i++) {
			if (aNewWords[i].length > 0) {
				aSearchWords.push(aNewWords[i]);
			}
		}

		oFilterCriteria.search = aSearchWords;

		this.setFilterCriteria(oFilterCriteria);
	};

	NoteTaker.prototype._adjustFilterTagButton = function () {
		var aFilterTags = this._getFilterTags();

		if (aFilterTags.length) {
			this._oFilterTagButton.setTooltip(this._rb.getText("NOTETAKER_BUTTON_FILTER_TAG_APPLY_SELECTED_TOOLTIP") + ": " + aFilterTags.join(" "));
			this._oFilterTagButton.addStyleClass("sapSuiteUiCommonsNoteTakerFilterButtonSelected");
		} else {
			this._oFilterTagButton.setTooltip(this._rb.getText("NOTETAKER_BUTTON_FILTER_TAG_TOOLTIP"));
			this._oFilterTagButton.removeStyleClass("sapSuiteUiCommonsNoteTakerFilterButtonSelected");
		}
	};

	NoteTaker.prototype._handleSearchPopup = function () {
		if (this._bSearchPopupOpen) {
			jQuery(document.getElementById(this.getId() + "-search-panel")).slideToggle();
			this._bSearchPopupOpen = false;
		} else {
			var oPosition = jQuery(document.getElementById(this.getId() + "-filter-search-button")).position();
			jQuery(document.getElementById(this.getId() + "-search-panel")).css("right", (oPosition.right - 20) + "px").slideToggle();
			this._oFilterSearchField.focus();
			this._bSearchPopupOpen = true;
		}
	};

	NoteTaker.prototype._adjustSearchButton = function () {
		var sSearchText = this._oFilterSearchField.getValue();

		if (sSearchText.length) {
			this._oSearchButton.setTooltip(this._rb.getText("NOTETAKER_BUTTON_SEARCHED_BY_TOOLTIP") + ": " + sSearchText);
			this._oFilterSearchField.setTooltip(this._rb.getText("NOTETAKER_BUTTON_SEARCHED_BY_TOOLTIP") + ": " + sSearchText);
			this._oSearchButton.addStyleClass("sapSuiteUiCommonsNoteTakerFilterButtonSelected");
		} else {
			this._oSearchButton.setTooltip(this._rb.getText("NOTETAKER_BUTTON_SEARCH_TOOLTIP"));
			this._oFilterSearchField.setTooltip(this._rb.getText("NOTETAKER_BUTTON_SEARCH_TOOLTIP"));
			this._oSearchButton.removeStyleClass("sapSuiteUiCommonsNoteTakerFilterButtonSelected");
		}
	};

	/**
	 * Extracts array of filtering tags from a filtering criteria object
	 * @returns {Object} Filter tags
	 */
	NoteTaker.prototype._getFilterTags = function () {
		var oFilterCriteria = this.getFilterCriteria();

		if (oFilterCriteria && oFilterCriteria.tags && oFilterCriteria.tags.length) {
			return oFilterCriteria.tags;
		} else {
			return [];
		}
	};

	NoteTaker.prototype._adjustPopupState = function () {
		var oTagPosition = jQuery(document.getElementById(this.getId() + "-filterTag-button")).position();
		jQuery(document.getElementById(this.getId() + "-filterTag-panel")).css("left", (oTagPosition.left - 20) + "px");
		if (this._bFilterTagPopupOpen) {
			jQuery(document.getElementById(this.getId() + "-filterTag-panel")).show();
		}
		if (this._bSearchPopupOpen) {
			jQuery(document.getElementById(this.getId() + "-search-panel")).show();
		}
	};

	NoteTaker.prototype._adjustFilteringButtonsStyle = function () {
		this._adjustFilterTagButton();
		this._adjustFilteringByThumbUpButtonStyle();
		this._adjustFilteringByThumbDownButtonStyle();
		this._adjustSearchButton();
	};

	NoteTaker.prototype._adjustFilteringByThumbUpButtonStyle = function () {
		if (this.getFilterCriteria() && this.getFilterCriteria().thumbUp) {
			this._oFilterThumbUpButton.addStyleClass("sapSuiteUiCommonsNoteTakerFilterButtonSelected");

		} else {
			this._oFilterThumbUpButton.removeStyleClass("sapSuiteUiCommonsNoteTakerFilterButtonSelected");
		}
	};

	NoteTaker.prototype._adjustFilteringByThumbDownButtonStyle = function () {
		if (this.getFilterCriteria() && this.getFilterCriteria().thumbDown) {
			this._oFilterThumbDownButton.addStyleClass("sapSuiteUiCommonsNoteTakerFilterButtonSelected");
		} else {
			this._oFilterThumbDownButton.removeStyleClass("sapSuiteUiCommonsNoteTakerFilterButtonSelected");
		}
	};

	NoteTaker.prototype.getNotFilteredCards = function () {
		if (!this._notFilteredCards) {
			this._notFilteredCards = [];
		}
		return this._notFilteredCards;
	};

	// Update all cards including feeder with new list of tags available to choose.
	NoteTaker.prototype._spreadTagList = function () {
		var aAllTags = this.getAllTags();
		this._feeder.setTags(aAllTags);
		var aCards = this.getCards();
		for (var i = 0; i < aCards.length; i++) {
			aCards[i].setAllTags(aAllTags);
		}
	};

	/**
	 * Filters note taker cards using filterCriteria property. Two different filtering methods implemented for control
	 * with and without binding.
	 */
	NoteTaker.prototype._filter = function () {
		var oBinding = this.getBinding("cards");
		var oCard;
		var i;

		if (oBinding) {
			var aModelCards = this.getModel().oData['cards'];

			for (i = 0; i < aModelCards.length; i++) {
				oCard = aModelCards[i];
				oCard.isFiltered = this._applyFilters(oCard);
			}

			this.getModel().updateBindings();
			oBinding.filter([new Filter("isFiltered", FilterOperator.EQ, false)]);
		} else {
			var aNotFilteredCards = this.getNotFilteredCards();
			var aVisibleCards = this.getCards();

			//for newly created taker notFilteredCards may not be set
			if (aNotFilteredCards.length === 0 && aVisibleCards.length > 0) {
				this.setNotFilteredCards(aVisibleCards);
				aNotFilteredCards = aVisibleCards;
			}

			for (i = 0; i < aNotFilteredCards.length; i++) {
				oCard = aNotFilteredCards[i];
				oCard.setIsFiltered(this._applyFilters(oCard));

				if (oCard.getIsFiltered()) {
					this.removeCard(oCard);
				} else if (this.indexOfCard(oCard) < 0) {
					this.addCard(oCard);
				}
			}
		}
	};

	/**
	 * Iterates through the list of filtering criteria and checks if given card should be filtered out and thus
	 * should be hidden from a user in the note taker.
	 * @param {Object} oCard Card to be filtered
	 * @returns {boolean} If filter not passed, card is filtered out
	 */
	NoteTaker.prototype._applyFilters = function (oCard) {
		var bFilterPassed = true;

		if (this.getFilterCriteria()) {
			for (var i = 0; (i < this._filters.length) && bFilterPassed; i++) {
				var fnFilter = this._filters[i];
				bFilterPassed = fnFilter.call(this, oCard);
			}
		}

		return !bFilterPassed;    // filter not passed means card is filtered out
	};

	/**
	 * Validates whether given card passes filter by thumbs.
	 * @param {Object} oCard Validated card could be NoteTakerCard instance or json object.
	 * @returns {Object} Filtered card
	 */
	NoteTaker.prototype._validateCardByThumbsFilter = function (oCard) {
		if (oCard.getThumbUp && oCard.getThumbDown) {
			return this._applyThumbsFilter(oCard.getThumbUp(), oCard.getThumbDown());
		} else {
			return this._applyThumbsFilter(oCard.thumbUp, oCard.thumbDown);
		}
	};

	/**
	 * Validates whether given card passes filter by tags.
	 * @param {Object} oCard Validated card could be NoteTakerCard instance or json object.
	 * @returns {Object} Filtered card
	 */
	NoteTaker.prototype._validateCardByTagsFilter = function (oCard) {
		if (oCard.getTags) {
			return this._applyTagsFilter(oCard.getTags());
		} else {
			return this._applyTagsFilter(oCard.tags);
		}
	};

	/**
	 * Validates whether given card passes search by text.
	 * @param {Object} oCard Validated card could be NoteTakerCard instance or json object.
	 * @returns {Object} Filtered card
	 */
	NoteTaker.prototype._validateCardByTextSearch = function (oCard) {
		if (oCard.getBody) {
			return this._applyTextSearch(oCard.getBody(), oCard.getHeader());
		} else {
			return this._applyTextSearch(oCard.body, oCard.header);
		}
	};

	/**
	 * Implements filtering criteria by thumbs. Validates whether given parameters conform to filtering criteria.
	 * @param {boolean} bThumbUp Filter thumb up
	 * @param {boolean} bThumbDown Filter thumb down
	 * @returns {boolean} Filtered criteria
	 */
	NoteTaker.prototype._applyThumbsFilter = function (bThumbUp, bThumbDown) {
		var bResult = true;
		var oFilterCriteria = this.getFilterCriteria();

		if (oFilterCriteria.thumbUp && oFilterCriteria.thumbDown) {
			bResult = bThumbUp || bThumbDown;
		} else if (oFilterCriteria.thumbUp) {
			bResult = bThumbUp;
		} else if (oFilterCriteria.thumbDown) {
			bResult = bThumbDown;
		}

		return bResult;
	};

	/**
	 * Implements filtering criteria by tags. Validates whether given parameter conforms to filtering criteria.
	 * @param {Array} aTags Filter tags
	 * @returns {boolean} True if matches found
	 */
	NoteTaker.prototype._applyTagsFilter = function (aTags) {
		var bResult = true;
		var oFilterCriteria = this.getFilterCriteria();

		if (oFilterCriteria.tags && oFilterCriteria.tags.length > 0) {
			var i, j;
			var aTagCriteria = oFilterCriteria.tags;

			bResult = false;     //  assume initially no tag matches

			//iterate since IE8 doesn't support Array.indexOf() method.
			for (i = 0; i < aTagCriteria.length && !bResult; i++) {
				for (j = 0; aTags && (j < aTags.length); j++) {
					if (aTagCriteria[i] === aTags[j]) {
						bResult = true;
						break;
					}
				}
			}
		}

		return bResult;
	};

	/**
	 * Implements searching by text. Validates whether given strings contain text given in filtering criteria.
	 * @param {string} sBody Body text to use for searching
	 * @param {string} sHeader? Text to search for
	 * @returns {boolean} True if matches found
	 */
	NoteTaker.prototype._applyTextSearch = function (sBody, sHeader) {
		var bResult = true;
		var oFilterCriteria = this.getFilterCriteria();

		if (oFilterCriteria.search && oFilterCriteria.search.length > 0) {
			var aSearchCriteria = oFilterCriteria.search;

			bResult = false;     // assume initially search found nothing
			sBody = sBody.toLowerCase();
			sHeader = sHeader ? sHeader.toLowerCase() : null;

			for (var i = 0; i < aSearchCriteria.length; i++) {
				var sWord = aSearchCriteria[i].toLowerCase();
				if ((sBody.indexOf(sWord) >= 0) || (sHeader && sHeader.indexOf(sWord) >= 0)) {
					bResult = true;
					break;
				}
			}
		}

		return bResult;
	};

	NoteTaker.prototype.setAttachmentUploadUrl = function (sUrl) {
		this.setProperty("attachmentUploadUrl", sUrl, true);
		this._feeder.setAttachmentUploadUrl(sUrl);
		return this;
	};

	/**
	 * Array of methods that implements validation by filtering criteria.
	 */
	NoteTaker.prototype._filters = [
		NoteTaker.prototype._validateCardByThumbsFilter,
		NoteTaker.prototype._validateCardByTagsFilter,
		NoteTaker.prototype._validateCardByTextSearch
	];

	NoteTaker.prototype.setNextCardUid = function (sUid) {
		this._nextCardUid = sUid;
		return this;
	};

	NoteTaker.prototype._addAttachmentDelegate = function (oCard) {
		oCard.attachAttachmentClick(function (oEvent) {
			this._handleCardAttachmentClick(oEvent);
		}, this);
	};

	NoteTaker.prototype._handleCardAttachmentClick = function (oEvent) {
		var eData = {
			filename: oEvent.getParameter("filename"),
			uid: oEvent.getParameter("uid"),
			isCardAttachment: true
		};

		this.fireAttachmentClick(eData);
	};

	NoteTaker.prototype.uploadAttachment = function () {
		this._feeder._oFileUploader.upload();
	};

	NoteTaker.prototype.setAttachmentData = function (sAdditionalData) {
		this._feeder._oFileUploader.setAdditionalData(sAdditionalData);
		return this;
	};

	NoteTaker.prototype.handleAttachmentUploadFail = function () {
		this._feeder._handleDeleteAttachUI();
		return this;
	};

	NoteTaker.prototype.setNextCardAttachmentUrl = function (sUrl) {
		this._nextCardAttachmentUrl = sUrl;
		return this;
	};

	NoteTaker.prototype.onkeyup = function (oEvent) {
		if (oEvent.which === KeyCodes.ESCAPE) {
			if (this._feeder._bTagPopupOpen) {
				this._feeder._toggleTagPopup();
				this._feeder._oTagButton.focus();
			}
			if (this._bFilterTagPopupOpen) {
				this._toggleFilterTagPopup();
				this._oFilterTagButton.focus();
			}
		}
	};

	return NoteTaker;
});
