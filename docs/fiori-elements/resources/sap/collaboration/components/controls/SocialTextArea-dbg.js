/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/dom/includeStylesheet',
	'sap/ui/model/json/JSONModel',
	'sap/m/TextArea',
	'sap/m/Popover',
	'sap/m/List',
	'sap/m/StandardListItem',
	'./SuggestionUtility',
	'../utils/LanguageBundle',
	'sap/m/library',
	'sap/ui/Device'
],
	function(jQuery, includeStylesheet, JSONModel, TextArea, Popover, List, StandardListItem, SuggestionUtility, LanguageBundle, mobileLibrary, Device) {
	"use strict";

	// shortcut for sap.m.ListSeparators
	var ListSeparators = mobileLibrary.ListSeparators;

	// shortcut for sap.m.ListMode
	var ListMode = mobileLibrary.ListMode;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	includeStylesheet(sap.ui.require.toUrl("sap/collaboration/components/resources/css/SocialTextArea.css"));

	/**
	 * Constructor for a new Text Area Suggestions Control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.m.TextArea
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @alias sap.collaboration.components.controls.SocialTextArea
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) design time metamodel
	 */

	var SocialTextArea = TextArea.extend("sap.collaboration.components.controls.SocialTextArea", /** @lends sap.collaboration.components.controls.SocialTextArea.prototype */ {
		metadata : {
			library : "sap.collaboration",
			properties : {
				/**
				 * Defines the initial value of the control.
				 */
				initialValue: { type: "string", group: "Data", defaultValue: null },

				/**
				 * Enable "notify all" for suggestions
				 */
				enableNotifyAll : {type : "boolean", group : "Behavior", defaultValue : true},
	
				/**
				 * Which side the suggestions will be displayed
				 */
				suggestionPlacement : {type : "sap.m.PlacementType", group : "Misc", defaultValue : PlacementType.VerticalPreferedBottom},
	
				/**
				 * Height of the suggestion popover
				 */
				suggestionHeight : {type : "sap.ui.core.CSSSize", group : "Appearance"},
			},
			events : {

				/**
				 * This event is fired after the "suggestions" are triggered.
				 */
				suggest : {
					parameters : {
						/**
						 * This parameter contains the value entered by the user after the suggestions are triggered.
						 */
							value : { type : "string" }
					}
				},

				/**
				 * This event is fired after the "suggestions" are closed.
				 */
				afterSuggestionClose : {}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	/* =========================*/
	/*    Protected Methods		*/
	/* =========================*/

	/**
	* Initializes the Control instance after creation. [borrowed from sap.ui.core.Control]
	* @protected
	* @memberOf sap.collaboration.components.controls.SocialTextArea
	*/
	SocialTextArea.prototype.init = function() {
		// call parent
		TextArea.prototype.init.apply(this);

		// remove top and bottom padding
		this.addStyleClass("sapCollaborationSocialTextArea");

		// initialize class variables
		this._sTextAreaOldValue = "";
		this._sTextAreaCurrentValue = "";
		this._aAtMentionBuffer = []; // buffer to save the @mention(s)
		this._mCurrentAtMention = undefined; // a map containing information about the current @mention

		// initialize model
		this._oModel = new JSONModel();

		// create internal controls
		var oStandardListItem = new StandardListItem({
			title: "{fullName}",
			description: "{email}",
			icon: "{userImage}"
		});

		this._oList = new List(this.getId() + "-list", {
			mode: ListMode.SingleSelectMaster,
			rememberSelections: false,
			showSeparators: ListSeparators.None
		}).setModel(this._oModel).bindItems("/", oStandardListItem);

		this._oPop = new Popover(this.getId() + "-pop", {
			showHeader: false,
			showArrow: false,
			content: [this._oList],
		}).setInitialFocus(this);

		// initialize util classes
		this._oSuggestionUtil = SuggestionUtility;
		this._oLangBundle =  new LanguageBundle();

		// attach event handlers
		this._oList.attachSelectionChange(this.onSelectionChange.bind(this));
	};

	/**
	* Cleans up the control instance before destruction. [borrowed from sap.ui.core.Control]
	* @protected
	* @memberOf sap.collaboration.components.controls.SocialTextArea
	*/
	SocialTextArea.prototype.exit = function() {
		this._oPop.destroy();
		this._oPop = undefined;

		this._oSuggestionUtil = undefined;
	};

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @protected
	 * @memberOf sap.collaboration.components.controls.SocialTextArea
	 */
	SocialTextArea.prototype.onBeforeRendering = function() {
		this._oPop.setPlacement(this.getSuggestionPlacement());

		// set the list's no data text based on enableNotifyAll
		this.getEnableNotifyAll() ? this._oList.setProperty("noDataText", this._oLangBundle.getText("ST_NO_SUGGESTIONS", ["@@notify"])) :
									this._oList.setProperty("noDataText", this._oLangBundle.getText("ST_ADD_POST_NO_SUGGESTIONS"));
	};

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf sap.collaboration.components.controls.SocialTextArea
	 */
	SocialTextArea.prototype.onAfterRendering = function() {
		TextArea.prototype.onAfterRendering.apply(this);
		this._oPop.setContentWidth(this.$().width() + "px"); // set the content width of the popover based on the width of the text area
		var oElement = this.$().children()[0];
		if (oElement) {
			jQuery("#" + oElement.id).css({'height': '100%'});
		}
		this.$().css({'padding-top': '0', 'padding-bottom': '0'});
	};

	/* =========================*/
	/*    Event Handlers		*/
	/* =========================*/

	/**
	 * Handle DOM input event.
	 * This event is fired synchronously when the value the <textarea> element is changed.
	 * @override
	 * @param {jQuery.Event} oEvent The event object.
	 * @memberOf sap.collaboration.components.controls.SocialTextArea
	 */
	SocialTextArea.prototype.oninput = function(event) {
		TextArea.prototype.oninput.apply(this, [event]); // call parent

		if (event.isMarked("invalid")) { // check if parent or parents have set marker to "invalid", this implies the event was not an actual key stroke
			return;
		}

		this._sTextAreaCurrentValue = this.getValue();
		// if the user selected all of the text and deleted everything we clear the buffer, otherwise execute the _triggerSuggestions method
		if (this._sTextAreaCurrentValue.trim() === ""){
			this._aAtMentionBuffer = [];
			this.closeSuggestionPopover();
		}
		else {
			 this._triggerSuggestions(this._sTextAreaCurrentValue, this._sTextAreaOldValue); // starting point to trigger or not trigger the suggestions
		}
		this._sTextAreaOldValue = this._sTextAreaCurrentValue;
	};

	/**
	 * Handle list item selection.
	 * @param {object} event The event fire by a list item selection
	 * @memberOf sap.collaboration.components.controls.SocialTextArea
	 */
	SocialTextArea.prototype.onSelectionChange = function(event) {
		var oListItem = event.getParameter("listItem");
		var sFullname = oListItem.getProperty("title");
		var sEmail = oListItem.getProperty("description");

		this._sTextAreaCurrentValue = this._oSuggestionUtil.getTextAreaValueAfterSuggestionSelected(
				sFullname,
				sEmail,
				this._mCurrentAtMention,
				this._aAtMentionBuffer,
				this._sTextAreaCurrentValue,
				sFullname === "@@notify");

		this.setValue(this._sTextAreaCurrentValue);
		this._sTextAreaOldValue = this._sTextAreaCurrentValue;
		this.closeSuggestionPopover();
		this.selectText(this._mCurrentAtMention.endIndex + 2, this._mCurrentAtMention.endIndex + 2); // +2 to include the space at the end
		this._oList.removeSelections(); // remove selections to ensure that the next time the list appears nothing is selected
	};

	/* =========================*/
	/*    Public Methods		*/
	/* =========================*/

	/**
	* Sets the suggestions
	* @public
	* @param {array} suggestions an array of maps that contain the suggestion
	* @return {SocialTextArea} this - to allow method chaining
	* @memberOf sap.collaboration.components.controls.SocialTextArea
	*/
	SocialTextArea.prototype.showSuggestions = function(suggestions) {
		// check if the "@@notify" list item should be pushed to the list or not
		if (suggestions.length !== 0 && suggestions[suggestions.length - 1].fullName !== "@@notify" && this.getEnableNotifyAll()) {
			suggestions.push({ fullName : "@@notify", email : this._oLangBundle.getText("ST_ATATNOTIFY_DESCRIPTION"), userImage : "sap-icon://world" });
		}

		if (suggestions.length !== 0) {
			this._oPop.close();
		}
		this._oModel.setData(suggestions);
		this._oPop.openBy(this);

		return this;
	};

	/**
	* Sets the initial value for the text area
	* @public
	* @param {string} text The initial text to set on the text area
	* @return {SocialTextArea} this - to allow method chaining
	* @memberOf sap.collaboration.components.controls.SocialTextArea
	*/
	SocialTextArea.prototype.setInitialValue = function(text) {
		this.setProperty("initialValue", text, true);
		this.setValue(text);
		this._aAtMentionBuffer = [];
		this._sTextAreaCurrentValue = text;
		this._sTextAreaOldValue = text;

		return this;
	};

	/**
	* Sets the height of the suggestion popover
	* @public
	* @param {string} height The height of the suggestions popover
	* @return {SocialTextArea} this - to allow method chaining
	* @memberOf sap.collaboration.components.controls.SocialTextArea
	*/
	SocialTextArea.prototype.setSuggestionHeight = function(height) {
		this.setProperty("suggestionHeight", height, true);
		this._oPop.setContentHeight(height);

		return this;
	};

	/**
	* Closes the Suggestion popover if opened
	* @public
	* @return {SocialTextArea} this - to allow method chaining
	* @memberOf sap.collaboration.components.controls.SocialTextArea
	*/
	SocialTextArea.prototype.closeSuggestionPopover = function() {
		this._oPop.close();
		this.fireAfterSuggestionClose();

		return this;
	};

	/**
	* Clears the text area
	* @public
	* @return {SocialTextArea} this - to allow method chaining
	* @memberOf sap.collaboration.components.controls.SocialTextArea
	*/
	SocialTextArea.prototype.clearText = function() {
		// clear the current text area, old text area value and buffer
		this._sTextAreaCurrentValue = "";
		this._sTextAreaOldValue = "";
		this._aAtMentionBuffer = [];
		this.setValue("");

		return this;
	};

	/**
	* Converts a text that contains full names to email aliases
	* @public
	* @returns {string} sTextWithAlias - new text with the user's email alias instead of full name
	* @memberOf sap.collaboration.components.controls.SocialTextArea
	*/
	SocialTextArea.prototype.convertTextWithFullNamesToEmailAliases = function() {
		return this._oSuggestionUtil.convertTextWithFullNamesToEmailAliases(this.getValue(), this._aAtMentionBuffer);
	};

	/**
	* Inserts an @ character in the text area, triggering the suggestions
	* @public
	* @return {SocialTextArea} this - to allow method chaining
	* @memberOf sap.collaboration.components.controls.SocialTextArea
	*/
	SocialTextArea.prototype.atMentionsButtonPressed = function() {
		var iCursorPositionInTextArea = this.getDomRef("inner").selectionStart; // property "selectionStart" not available in IE8 or lower
		var mAtMentionPressed = this._oSuggestionUtil.atMentionsButtonPressed(this.getValue(), iCursorPositionInTextArea);
		this.setValue(mAtMentionPressed.newValue);
		this._sTextAreaCurrentValue = this.getValue();
		this.focus(); // set the focus back to the text area
		this.selectText(mAtMentionPressed.cursorPosition, mAtMentionPressed.cursorPosition); // set cursor position in the text area
		this._triggerSuggestions(this._sTextAreaCurrentValue, this._sTextAreaOldValue);
		this._sTextAreaOldValue = this._sTextAreaCurrentValue;

		return this;
	};

	/* =========================*/
	/*    Private Methods		*/
	/* =========================*/

	/**
	/**
	* Logic for when to fire the suggestions
	* @private
	* @param {string} textAreaCurrentValue
	* @param {string} textAreaOldValue
	* @memberOf sap.collaboration.components.controls.SocialTextArea
	*/
	SocialTextArea.prototype._triggerSuggestions = function(textAreaCurrentValue, textAreaOldValue) {
		/*
		 * Due to a Ux issue (the height of the @mention popover renders too small on phones), the @mention feature should NOT be available on phones.
		 * This should change when enhancements to the sap.m.TextArea are made in order to support opening the @mention popover inside a text area.
		 */
		if (!Device.system.phone) {
			// gets the change that happened on the text of the text area
			var oTextAreaChange = this._oSuggestionUtil.getChangesInTextArea(textAreaCurrentValue,textAreaOldValue);

			if (oTextAreaChange.operation === "addChar") { // user added characters
				this._handleAddedCharacters(oTextAreaChange, textAreaCurrentValue);
			}
			else if (oTextAreaChange.operation === "deleteChar") { // user deleted characters
				this._handleDeletedCharacters(oTextAreaChange, textAreaCurrentValue, this._aAtMentionBuffer);
			}
		}
	};

	/**
	* Logic when the user adds character(s)
	* @private
	* @param {object} textAreaChange
	* @param {string} textAreaCurrentValue
	* @memberOf sap.collaboration.components.controls.SocialTextArea
	*/
	SocialTextArea.prototype._handleAddedCharacters = function(textAreaChange, textAreaCurrentValue) {
		var iTextAreaChangeIndex = textAreaChange.changeIndex; // the index in the string where the change starts to happen
		var sTextAreaChangeChars = textAreaChange.charactersChanged; 	// the chars added by the change that happened on the text are, in case of delete it will be undefined
		var iAtBufferLength = this._aAtMentionBuffer.length; // buffer length
		var bIsNotifyAllEnabled = this.getEnableNotifyAll();

		/*
		 * IF the char(s) added:
		 * i - bIsNotifyAllEnabled is true AND
		 * ii - has a '@' in the beginning AND
		 * iii - has another '@' before it AND
		 * iv - the character before it has a space OR return carriage OR or undefined
		 *
		 * then it implies that the '@@notify' should be triggered
		 */
		if (bIsNotifyAllEnabled && sTextAreaChangeChars[0] === "@" && textAreaCurrentValue[iTextAreaChangeIndex - 1] === "@" &&
			(textAreaCurrentValue[iTextAreaChangeIndex - 2] === " " || textAreaCurrentValue[iTextAreaChangeIndex - 2] === "\n" || textAreaCurrentValue[iTextAreaChangeIndex - 2] === undefined)) {

			this.showSuggestions([{ fullName : "@@notify", email : this._oLangBundle.getText("ST_ATATNOTIFY_DESCRIPTION"), userImage : "sap-icon://world" }]);

			// update indices in the buffer
			for (var i = 0; i < iAtBufferLength; i++) {
				if (this._aAtMentionBuffer[i].startIndex === iTextAreaChangeIndex - 1){
					this._aAtMentionBuffer[i].endIndex += sTextAreaChangeChars.length;
				}
				else if (iTextAreaChangeIndex < this._aAtMentionBuffer[i].startIndex){
					this._oSuggestionUtil.maintainAtMentionIndices(this._aAtMentionBuffer[i], sTextAreaChangeChars.length);
				}
			}
		}
		/*
		 * ELSE IF the char(s) added:
		 * i- has a '@' in the beginning OR
		 * ii- has a '@' in the beginning with a space before it (' @')
		 *
		 * then it implies the suggestions should be triggered
		 */
		else if (sTextAreaChangeChars[0] === "@" || (sTextAreaChangeChars[0] === " " && sTextAreaChangeChars[1] === "@")) {
			if (sTextAreaChangeChars[1] === "@") {
				iTextAreaChangeIndex += 1; // need to increase the iTextChangeIndex by 1 to accommodate for the space since we want the start index to be where the '@' is
			}

			var iCurrentAtMentionArrayIndex = this._oSuggestionUtil.addToAtMentionBuffer(this._aAtMentionBuffer, iTextAreaChangeIndex, sTextAreaChangeChars);
			this._mCurrentAtMention = this._aAtMentionBuffer[iCurrentAtMentionArrayIndex];
			// if the text entered was an '@' char with a space after it (i.e. pressing the '@mentions' button), then -1 the end index in the buffer
			if (sTextAreaChangeChars === "@ ") {
				this._mCurrentAtMention.endIndex -= 1;
			}

			// get character before the '@' is a space, undefined or a return carriage
			var sCharBeforeAtMentionChar = textAreaCurrentValue[this._mCurrentAtMention.startIndex - 1];
			// get the next index after the added text
			var iNextCharAfterAddedTextIndex = this._mCurrentAtMention.endIndex + 1;
			if (sCharBeforeAtMentionChar === " " || sCharBeforeAtMentionChar === undefined || sCharBeforeAtMentionChar === '\n') { // if char before '@' is space, undefined or return carriage
				// get character(s) after the added text
				var sNextCharAfterAddedText = textAreaCurrentValue[iNextCharAfterAddedTextIndex];
				while (sNextCharAfterAddedText !== " " && sNextCharAfterAddedText !== undefined && sNextCharAfterAddedText !== '\n') {
					iNextCharAfterAddedTextIndex += 1;
					sNextCharAfterAddedText = textAreaCurrentValue[iNextCharAfterAddedTextIndex];
				}
				// update current AtMention end index with the characters after added text
				this._mCurrentAtMention.endIndex = iNextCharAfterAddedTextIndex - 1; // -1 since the last index is not a character but the end of the string
				this.fireSuggest({ value : textAreaCurrentValue.substring(iTextAreaChangeIndex + 1, iNextCharAfterAddedTextIndex) });
			}
			else {
				this.closeSuggestionPopover();
			}
		}
		/*
		 * ELSE the char(s) added do not have a '@' in the beginning
		 *
		 * then it implies that the '@@notify' or suggestions or nothing should be triggered
		 */
		else {
			for (var i = iAtBufferLength - 1; i >= 0; i--) {
				if (iTextAreaChangeIndex > this._aAtMentionBuffer[i].startIndex) {
					var sStringAfterAtMention = this._oSuggestionUtil.getStringAfterAtMention(iTextAreaChangeIndex + sTextAreaChangeChars.length - 1, textAreaCurrentValue, this._aAtMentionBuffer[i]);
					var sStringBeforeAtMention = this._oSuggestionUtil.getStringBeforeAtMention(this._aAtMentionBuffer[i], textAreaCurrentValue, iTextAreaChangeIndex);
					var sQueryString = sStringBeforeAtMention + sTextAreaChangeChars + sStringAfterAtMention;
					var oRegExp = new RegExp("^" + sQueryString);
					// case #1: the char(s) added are part of a "@@notify"
					if (bIsNotifyAllEnabled && oRegExp.test("@notify")) {
						this._aAtMentionBuffer[i].endIndex = this._aAtMentionBuffer[i].endIndex + sTextAreaChangeChars.length;
						this._mCurrentAtMention = this._aAtMentionBuffer[i];
						this.showSuggestions([{fullName : "@@notify", email : this._oLangBundle.getText("ST_ATATNOTIFY_DESCRIPTION"), userImage : "sap-icon://world"}]);
					}
					// case #2: the char(s) from the @mention start index to the char(s) added (sQueryString) have no space or one space
					else if (!sQueryString.match(/ /g) || (sQueryString.match(/ /g) && sQueryString.match(/ /g).length === 1)) {
						// if the char(s) were added to a @mention that was selected from the suggestions list (atMentioned === true) -
						// this would invalidate the @mention, therefore we remove the '@' char, replace it with a " " and remove the @mention from the buffer
						if ((this._aAtMentionBuffer[i].atMentioned === true || this._aAtMentionBuffer[i].notifyAll === true) && iTextAreaChangeIndex <= this._aAtMentionBuffer[i].endIndex) {
							var iAtMentionStartIndex = this._aAtMentionBuffer[i].startIndex;
							var sTextWithoutAtChar = textAreaCurrentValue.slice(0, iAtMentionStartIndex) + " " + textAreaCurrentValue.slice(iAtMentionStartIndex + 1, textAreaCurrentValue.length);

							this.setValue(sTextWithoutAtChar);
							this._sTextAreaCurrentValue = sTextWithoutAtChar;
							this._aAtMentionBuffer.splice(i, 1);
							this.selectText(iTextAreaChangeIndex + 1, iTextAreaChangeIndex + 1);
							this.closeSuggestionPopover();
						}
						// else check that there is no return carriage or '@' in the sQueryString and fire the suggestions
						else if (sQueryString.search("\n") === -1 && sQueryString.search("@") === -1) {
							this._aAtMentionBuffer[i].endIndex = this._aAtMentionBuffer[i].startIndex + sQueryString.length;
							this._mCurrentAtMention = this._aAtMentionBuffer[i];

							var sCharBeforeAtMentionChar = textAreaCurrentValue[this._mCurrentAtMention.startIndex - 1];
							// only fire the suggestions if the character before the '@' is a space, undefined or a return carriage
							if (sCharBeforeAtMentionChar === " " || sCharBeforeAtMentionChar === undefined || sCharBeforeAtMentionChar === '\n'){
								this.fireSuggest({value: sQueryString}); // fire suggestions
							}
						}
						else {
							this.closeSuggestionPopover();
						}
					}
					// case #3: the char(s) added have nothing to do with any @mentions (e.g. user entered a char, space or return carriage) then close any open suggestions
					else {
						this.closeSuggestionPopover();
					}
					break;
				}
				// update indices of @mentions in the buffer
				this._oSuggestionUtil.maintainAtMentionIndices(this._aAtMentionBuffer[i], sTextAreaChangeChars.length);

				if (i === 0) { // check if last iteration of for loop, then close suggestions in case it was previously opened
					this.closeSuggestionPopover();
				}
			}
		}
	};

	/**
	* Logic when the user deletes character(s)
	* @private
	* @param {map} textAreaChange
	* @param {string} textAreaCurrentValue
	* @memberOf sap.collaboration.components.controls.SocialTextArea
	*/
	SocialTextArea.prototype._handleDeletedCharacters = function(textAreaChange, textAreaCurrentValue) {
		var iTextAreaChangeIndex = textAreaChange.changeIndex; // the index in the string where the change starts to happen
		var sTextAreaChangeChars = textAreaChange.charactersChanged;
		var iCharsDifference = undefined; // the difference in char(s) between the old and new text area value

		// IF the deleted char(s) is part of a @mention in the buffer
		var iAtMentionIndexInBuffer = this._oSuggestionUtil.isDeletedCharPartOfAtMentioned(this._aAtMentionBuffer, iTextAreaChangeIndex);
		if (iAtMentionIndexInBuffer !== undefined) {
			// case #1: deleted char(s) is part of a selected @mention (atMentioned === true)
			if (this._aAtMentionBuffer[iAtMentionIndexInBuffer].atMentioned === true || this._aAtMentionBuffer[iAtMentionIndexInBuffer].notifyAll ===  true) {
				this.closeSuggestionPopover();
				// get the value of the text after deletion of the whole @mention string
				this._sTextAreaCurrentValue = this._sTextAreaCurrentValue.substr(0, this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex) +
																					this._sTextAreaCurrentValue.substr(this._aAtMentionBuffer[iAtMentionIndexInBuffer].endIndex -
																					textAreaChange.numberOfCharsChanged + 1);
				this.setValue(this._sTextAreaCurrentValue);
				this.selectText(this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex, this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex);
				this._sTextAreaOldValue = this._sTextAreaCurrentValue;

				iCharsDifference = 1 + this._aAtMentionBuffer[iAtMentionIndexInBuffer].endIndex - this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex; // +1 for the @
				this._aAtMentionBuffer.splice(iAtMentionIndexInBuffer, 1); // remove the @mention from the buffer
			}
			// case #2: deleted char(s) is not part of a selected @mention (atMentioned === false)
			else {
				iCharsDifference = textAreaChange.numberOfCharsChanged;
				var sCharBeforeAtMentionChar = textAreaCurrentValue[this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex - 1];
				// the deleted char(s) contains an '@' AND the char before is not an "@", remove the @mention from the buffer
				if (sTextAreaChangeChars.search("@") !== -1 && textAreaCurrentValue[textAreaChange.changeIndex - 1] !== "@") {
					this.closeSuggestionPopover();
					this._aAtMentionBuffer.splice(iAtMentionIndexInBuffer, 1);
				}
				// update the current @mention end index in the buffer and fire the suggest from the start to end index if the character before the "@" is a space, return carriage or undefined
				else if (sCharBeforeAtMentionChar === " " || sCharBeforeAtMentionChar === undefined || sCharBeforeAtMentionChar === '\n') {
					this._aAtMentionBuffer[iAtMentionIndexInBuffer].endIndex -= iCharsDifference;
					// +1 to the start index to not include the '@' char and +1 to the end index to account for the last char
					var sValue = textAreaCurrentValue.substring(this._aAtMentionBuffer[iAtMentionIndexInBuffer].startIndex + 1, this._aAtMentionBuffer[iAtMentionIndexInBuffer].endIndex + 1);
					var oRegExp = new RegExp("^" + sValue);
					if (sValue !== "" && oRegExp.test("@notify")) {
						this.showSuggestions([{fullName : "@@notify", email : this._oLangBundle.getText("ST_ATATNOTIFY_DESCRIPTION"), userImage : "sap-icon://world"}]);
					}
					else {
						this.fireSuggest({value : sValue});
					}
				}
			}
		}
		// update the rest of the indices in the buffer if the start index is greater than the change index
		iAtMentionIndexInBuffer = iAtMentionIndexInBuffer || 0;
		iCharsDifference = iCharsDifference || textAreaChange.numberOfCharsChanged;
		for (var j = iAtMentionIndexInBuffer; j < this._aAtMentionBuffer.length; j++) {
			if (iTextAreaChangeIndex < this._aAtMentionBuffer[j].startIndex) {
				this._oSuggestionUtil.maintainAtMentionIndices(this._aAtMentionBuffer[j], -iCharsDifference);
			}
		}
	};

	return SocialTextArea;
});