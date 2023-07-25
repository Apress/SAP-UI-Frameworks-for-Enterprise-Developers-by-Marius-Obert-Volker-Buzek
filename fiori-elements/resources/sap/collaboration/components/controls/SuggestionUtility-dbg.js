/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define(["sap/ui/base/Object"], function(BaseObject) {
	"use strict";

	var SuggestionUtility = BaseObject.extend("sap.collaboration.components.controls.SuggestionUtility", {
	});

	/**
	* Logic for maintaining the the indices for an AtMention in the buffer
	* @public
	* @param {map} atMention
	* @param {integer} length
	* @memberOf sap.collaboration.components.controls.SuggestionUtility
	*/
	SuggestionUtility.maintainAtMentionIndices = function(atMention, length) {
		atMention.startIndex = atMention.startIndex + length;
		atMention.endIndex = atMention.endIndex + length;
	};

	/**
	* Logic to get the changes in a Text Area. The returned map that has the following information:
	* 1. operation : whether the change is add character(s) or delete character(s)
	* 2. charactersChanged: function that returns the characters added or removed
	* 3. changeIndex: the index where the change starts to happen
	* 4. numberOfCharsChanged: number of added or deleted character(s)
	*
	* @public
	* @param {string} textAreaCurrentValue
	* @param {string} textAreaOldValue
	* @returns {map}
	* @memberOf sap.collaboration.components.controls.SuggestionUtility
	*/
	SuggestionUtility.getChangesInTextArea = function(textAreaCurrentValue, textAreaOldValue) {
		if (textAreaOldValue !== ""){
			// the loop counter will be the length of the longest string between textAreaCurrentValue and textAreaOldValue
			var iLoopCounter = textAreaCurrentValue.length > textAreaOldValue.length ? textAreaCurrentValue.length : textAreaOldValue.length;
			// get the number of added or deleted characters to the text of the TextArea
			var iCharDiff = Math.abs(textAreaCurrentValue.length - textAreaOldValue.length);

			// function to return a string that represents the added characters to the text of the TextArea
			var fGetAddedChars = function(iCharDiff, iStartingIndex) {
				return textAreaCurrentValue.substring(iStartingIndex, iStartingIndex + iCharDiff);
			};
			var fGetRemovedChars = function(iCharDiff, iStartingIndex) {
				return textAreaOldValue.substring(iStartingIndex, iStartingIndex + iCharDiff);
			};

			// loop to compare character by character between the TextArea text before the change and the TextArea text after the change
			for (var i = 0; i < iLoopCounter; i++){
				// if there is a difference
				if (textAreaCurrentValue[i] !== textAreaOldValue[i]){
					// if the TextArea text after the change is > then the TextArea text before the change, then character(s) are added, otherwise characters are deleted
					return textAreaCurrentValue.length > textAreaOldValue.length ?
							{operation: "addChar", charactersChanged: fGetAddedChars(iCharDiff, i), changeIndex: i, numberOfCharsChanged: iCharDiff} : {operation: "deleteChar", charactersChanged: fGetRemovedChars(iCharDiff, i), changeIndex: i, numberOfCharsChanged: iCharDiff};
				}
			}
		}
		else {
			return {operation: "addChar", charactersChanged: textAreaCurrentValue, changeIndex: 0};
		}
	};

	/**
	* Converts a text that contains full names to email aliases
	* @public
	* @param {string} value - value of the AddPost Text Area with the full names
	* @param {map} atMentionBuffer - value of the AddPost Text Area with the full names
	* @returns {string} sTextWithAlias - new text with the user's email alias instead of full name
	* @memberOf sap.collaboration.components.controls.SuggestionUtility
	*/
	SuggestionUtility.convertTextWithFullNamesToEmailAliases = function(value, atMentionBuffer){
		var sTextWithAlias = "";
		var aBufferLength = atMentionBuffer.length;
		var iStartIndex = 0;

		if (aBufferLength !== 0){
			for (var i = 0; i < aBufferLength; i++){
				if (atMentionBuffer[i].atMentioned){ // if the '@mention' in the buffer is a real one
					var sEmailAlias = "@" + atMentionBuffer[i].email.split("@")[0];
					sTextWithAlias = sTextWithAlias + value.substring(iStartIndex, atMentionBuffer[i].startIndex) + sEmailAlias;
				}
				else {
					sTextWithAlias = sTextWithAlias + value.substring(iStartIndex, atMentionBuffer[i].endIndex + 1);
				}
				iStartIndex = atMentionBuffer[i].endIndex + 1;
			}
			// append the remaining text to sTextWithAlias
			sTextWithAlias = sTextWithAlias + value.substring(atMentionBuffer[aBufferLength - 1].endIndex + 1, value.length);
			return sTextWithAlias;
		}
			return value;
	};

	/**
	* Function to get the string after the char(s) inserted in an AtMention
	* example: '@pter', then the user inserted 'e' after the 'p' now it will be 'peter' and the after string 'ter'
	* @public
	* @param {integer} indexChangedChar
	* @param {string} textAreaCurrentValue
	* @param {map} atMention - an object containing information about the AtMention
	* @returns {string} sStringAfterAtMention
	* @memberOf sap.collaboration.components.controls.SuggestionUtility
	*/

	SuggestionUtility.getStringAfterAtMention = function(indexChangedChar, textAreaCurrentValue, atMention){
		var sStringAfterAtMention = "";
		var index = indexChangedChar;

		function buildString() {
			while (textAreaCurrentValue[index + 1] !== " " && textAreaCurrentValue[index + 1] !== undefined && textAreaCurrentValue[index + 1] !== '\n'){
				sStringAfterAtMention = sStringAfterAtMention.concat(textAreaCurrentValue[index + 1]);
				index += 1;
			}
		}

		buildString();

		// the following is to handle a  special case: the char(s) added are part of a @mention that was selected from the suggestions list
		// and the char(s) added were somewhere in the First Name - in this case we need to skip a space between the First and Last Name and continue
		// to build the string
		if (atMention.atMentioned && textAreaCurrentValue[index + 1] === " " && textAreaCurrentValue[index + 1] <= atMention.endIndex){
			sStringAfterAtMention = sStringAfterAtMention.concat(textAreaCurrentValue[index + 1]);
			index += 1;
			buildString();
		}
		return sStringAfterAtMention;
	};

	/**
	* Returns the string before the AtMention
	* @public
	* @param {map} atMention - an object containing information about the AtMention
	* @param {string} textAreaCurrentValue - the current value of the text area
	* @param {integer} textAreaChangeIndex - the index in the text area where the change occurred
	* @returns {string} sStringBeforeAtMention - the string before the at AtMention
	* @memberOf sap.collaboration.components.controls.SuggestionUtility
	*/
	SuggestionUtility.getStringBeforeAtMention = function(atMention, textAreaCurrentValue, textAreaChangeIndex){
		var sStringBeforeAtMention = textAreaCurrentValue.substring(atMention.startIndex + 1, textAreaChangeIndex);

		return sStringBeforeAtMention;
	};
	/**
	* Converts a text that contains full names to email aliases
	* @public
	* @param {array} atMentionBuffer - the AtMention buffer
	* @param {integer} textAreaChangeIndex - the index in the text area where the change occurred
	* @param {string} textAreaChangeChars - the char(s) changed in the text area
	* @returns {string} iAtMentionBufferIndex
	* @memberOf sap.collaboration.components.controls.SuggestionUtility
	*/
	SuggestionUtility.addToAtMentionBuffer = function(atMentionBuffer, textAreaChangeIndex, textAreaChangeChars){
		var iAtMentionBufferIndex = 0;
		var iAtBufferLength = atMentionBuffer.length;
		// case #1: the @mention buffer is empty - push the @mention to the buffer
		if (iAtBufferLength === 0){
			atMentionBuffer.push({startIndex: textAreaChangeIndex, endIndex: textAreaChangeIndex + textAreaChangeChars.length - 1, atMentioned: false});
			iAtMentionBufferIndex = 0;
		}

		// case #2: the @mention buffer is not empty - update indices for all @mentions in the buffer and insert the new @mention in the correct position
		else {
			// maintain the start and end index for each @mention in the buffer
			for (var i = 0; i < iAtBufferLength; i++){
				if (textAreaChangeIndex <= atMentionBuffer[i].startIndex){
					this.maintainAtMentionIndices(atMentionBuffer[i], textAreaChangeChars.length);
				}
			}
			// Add the @mention at the right position in the buffer
			for (var i = iAtBufferLength - 1; i >= 0; i--){
				if (textAreaChangeIndex > atMentionBuffer[i].startIndex){
					atMentionBuffer.splice(i + 1, 0, {startIndex: textAreaChangeIndex, endIndex: textAreaChangeIndex + textAreaChangeChars.length - 1 , atMentioned: false});
					iAtMentionBufferIndex = i + 1;
					break;
				}
				else if (i === 0){
					atMentionBuffer.splice(0,0,{startIndex: textAreaChangeIndex, endIndex: textAreaChangeIndex + textAreaChangeChars.length - 1, atMentioned: false});
					iAtMentionBufferIndex = 0;
				}
			}
		}
		return iAtMentionBufferIndex;
	};

	/**
	* Check if the deleted char(s) was part of an AtMention (from the start to end index) in the buffer
	* @public
	* @param {map} atMentionBuffer - the AtMention buffer
	* @param {integer} textAreaChangeIndex - the index in the text area where the change occurred
	* @returns {integer} iAtMentionIndexInBuffer - index in the atMention buffer
	* @memberOf sap.collaboration.components.controls.SuggestionUtility
	*/
	SuggestionUtility.isDeletedCharPartOfAtMentioned = function(atMentionBuffer, textAreaChangeIndex){
		var iAtMentionBufferLength = atMentionBuffer.length;
		for (var iAtMentionIndexInBuffer = 0; iAtMentionIndexInBuffer < iAtMentionBufferLength; iAtMentionIndexInBuffer++){
			if (textAreaChangeIndex >= atMentionBuffer[iAtMentionIndexInBuffer].startIndex && textAreaChangeIndex <= atMentionBuffer[iAtMentionIndexInBuffer].endIndex){
				return iAtMentionIndexInBuffer;
			}
		}
	};

	/**
	* Maintain buffer and return new text area value after selection from '@mentions' list
	* @param {string} fullName - the selected user's Full Name
	* @param {string} email - the selected user's Email address
	* @param {map} currentAtMention - the current AtMention
	* @param {array} atMentionBuffer - the AtMention buffer
	* @param {string} textAreaCurrentValue - the current text area value
	* @param {boolean} notifyAllSelected - whether the "@@notify" was selected
	* @return {string} sNewTextAreaValue - the new text area value
	* @public
	* @memberOf sap.collaboration.components.controls.SuggestionUtility
	*/
	SuggestionUtility.getTextAreaValueAfterSuggestionSelected = function(fullName, email, currentAtMention, atMentionBuffer, textAreaCurrentValue, notifyAllSelected){
		var startIndex = currentAtMention.startIndex;
		var endIndex = currentAtMention.endIndex;
		var iStringLengthBeforeMentioning = textAreaCurrentValue.length;
		var sNewTextAreaValue;
		var sAtNotifyText = "@notify";

		if (notifyAllSelected){
			sNewTextAreaValue = textAreaCurrentValue.substr(0, startIndex + 1) + sAtNotifyText + " " + textAreaCurrentValue.substr(endIndex + 1);
			currentAtMention.endIndex = startIndex + sAtNotifyText.length;
			currentAtMention.notifyAll = true;
		}
		else {
			sNewTextAreaValue = textAreaCurrentValue.substr(0, startIndex + 1) + fullName + " " + textAreaCurrentValue.substr(endIndex + 1);
			currentAtMention.endIndex = startIndex + fullName.length;
			currentAtMention.atMentioned = true;
			currentAtMention.email = email;
		}

		var iStringLengthAfterMentioning = sNewTextAreaValue.length;
		var iDifferenceInCharacters = iStringLengthAfterMentioning - iStringLengthBeforeMentioning;
		var iIndexOfCurrentAtMention = atMentionBuffer.indexOf(currentAtMention);
		for (var i = iIndexOfCurrentAtMention + 1; i < atMentionBuffer.length; i++){
			this.maintainAtMentionIndices(atMentionBuffer[i], iDifferenceInCharacters);
		}

		return sNewTextAreaValue;
	};

	/**
	* Returns a text area value and cursor position after the '@mentions' button has been pressed
	* @param {string} textAreaValue - the current text area value
	* @param {integer} cursorPosition - current cursor position in text area
	* @returns {map} - an map containing the new text area and the cursor position
	* @public
	* @memberOf sap.collaboration.components.controls.SuggestionUtility
	*/
	SuggestionUtility.atMentionsButtonPressed = function(textAreaValue, cursorPosition){
		var iCursorPositionToBeSet;
		var sTextBeforeCursorPosition = textAreaValue.slice(0, cursorPosition);
		var sTextAfterCursorPosition =  textAreaValue.slice(cursorPosition, textAreaValue.length);
		var sAtMentionChar = "";

		if (textAreaValue[cursorPosition - 1] === " "
			|| textAreaValue[cursorPosition - 1] === "\n"
			|| textAreaValue[cursorPosition - 1] === undefined){
			sAtMentionChar = "@";
			iCursorPositionToBeSet = cursorPosition + 1;
		}
		else {
			sAtMentionChar = " @";
			iCursorPositionToBeSet = cursorPosition + 2;
		}

		var sNewTextAreaValue = sTextBeforeCursorPosition + sAtMentionChar + sTextAfterCursorPosition;

		return { newValue : sNewTextAreaValue, cursorPosition : iCursorPositionToBeSet };
	};

	return SuggestionUtility;

});
