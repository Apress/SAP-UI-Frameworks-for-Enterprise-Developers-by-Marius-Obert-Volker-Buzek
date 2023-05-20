/**
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/base/Object'],
	function(BaseObject){
	"use strict";

	var sClassName = "sap.collaboration.components.controls.PlaceholderUtility";
	var atMentionsPlaceholderPattern = /@@.\{\d+\}/;
	var contentPlaceholderPattern = /@@[o]\{\d+\}/;

	/**
	 * AtMentions Utility class
	 *
	 * @class
	 * Utility class for resolving placeholders from Jam for AtMentions and Content item name. Contains static methods
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @public
	 */
	var placeholderUtility = BaseObject.extend(sClassName, {
	});

	/**
	 * Returns a list of all the atMentions placeholders and their values
	 * @param {string} sText - Text
	 * @param {string} sTextWithPlaceholders - Text with the placeholders
	 * @return {object[]} array of atMentions {placeholder,value}
	 * @memberOf sap.collaboration.components.controls.PlaceholderUtility
	 */
	placeholderUtility.getAtMentionsValues = function(sText, sTextWithPlaceholders){
		var oPlaceholderRegex = new RegExp(atMentionsPlaceholderPattern);

		var aStringWithPlaceholders = this.splitByPlaceholders(sTextWithPlaceholders);

		var sTextToSlice = sText; // Original text that will be traversed and spliced
		var aPlaceholderValues = [];
		var iPlaceholdersCount = 0;
		// find the placeholders values
		for ( var i = 0; i < aStringWithPlaceholders.length; i++) {
			var substring = aStringWithPlaceholders[i];

			if ( oPlaceholderRegex.test(substring) == true ) {
				var nextToken = aStringWithPlaceholders[i + 1];
				var sPlaceholderValue = "";

				// if nextToken == "", placeholder is either the last token in the string
				// OR the placeholder is immediately (no space) followed by another placeholder.
				if ( nextToken == "" ) {
					var nextNextToken = aStringWithPlaceholders[i + 2];

					// placeholder is the last token
					if (nextNextToken == undefined) {
						sPlaceholderValue = sTextToSlice;
						sTextToSlice = sTextToSlice.slice(sTextToSlice.indexOf(nextToken));
					}
					// placeholder is immediately followed by another placeholder
					else if (oPlaceholderRegex.test(nextNextToken) == true) {
						// ASSUMPTION: in the text, the @mentions names begin with "@" AND "@" does not appear in the name
						sPlaceholderValue = this._findFirstPlaceholderValueInText(sTextToSlice);
						sTextToSlice = sTextToSlice.slice(sPlaceholderValue.length);
					}

				}
				// if nextToken == " ", placeholder is followed by another placeholder seperated by a space
				// OR a trailing space at the end
				else if ( nextToken == " " ) {
					// ASSUMPTION: in the text, the @mentions names begin with "@" AND "@" does not appear in the name
					sPlaceholderValue = this._findFirstPlaceholderValueInText(sTextToSlice);
					sTextToSlice = sTextToSlice.slice(sPlaceholderValue.length);
				}
				else {
					// next token is just normal text
					sPlaceholderValue = sTextToSlice.slice(0, sTextToSlice.indexOf(nextToken));
					sTextToSlice = sTextToSlice.slice(sTextToSlice.indexOf(nextToken));
				}
				// if the value is not equal to @@m{*}, save the value
				if ( !oPlaceholderRegex.test(sPlaceholderValue) ) {
					aPlaceholderValues.push({
						placeholder: "@@m{" + iPlaceholdersCount + "}",
						value: sPlaceholderValue
					});
					iPlaceholdersCount++;
				}
			}
			else {
				sTextToSlice = sTextToSlice.slice(substring.length);
			}
		}

		return aPlaceholderValues;
	};

	/**
	 * Returns the name of the Content Item.
	 * ASSUMPTIONS: There is only one placeholder at the end of the text
	 *
	 * @param {string} sAction - Action Text
	 * @param {string} sActionWithPlaceholders - Action Text with the placeholders
	 * @return {object[]} array of atMentions {placeholder,value}
	 * @memberOf sap.collaboration.components.controls.PlaceholderUtility
	 */
	placeholderUtility.getContentItemName = function(sAction, sActionWithPlaceholders){

		var sActionToSlice = sAction;
		var aActionWithoutPlaceholders = sActionWithPlaceholders.split(contentPlaceholderPattern); // array of substrings without placeholders

		// remove all text except for content item name
		for (var i = 0; i < aActionWithoutPlaceholders.length; i++){
			sActionToSlice = sActionToSlice.replace(aActionWithoutPlaceholders[i], "");
		}
		var sContentItemName = sActionToSlice.trim();

		return sContentItemName;
	};
	/**
	 * Returns the an array of substrings seperated by placeholders
	 *
	 * @param {string} sString - String to split
	 * @return {string[]} array of substrings seperated by the placeholders
	 * @memberOf sap.collaboration.components.controls.PlaceholderUtility
	 */
	placeholderUtility.splitByPlaceholders = function(sTextWithPlaceholder){

		var aStringWithPlaceholders = [];

		if (sTextWithPlaceholder) {
			var allAtMentionsplaceholderPattern = /@@.\{\d+\}/g; // all placeholders
			var aStringSeperatedByPlaceholders = sTextWithPlaceholder.split(allAtMentionsplaceholderPattern); // split by placeholders
			var aPlaceholders = sTextWithPlaceholder.match(allAtMentionsplaceholderPattern); // get all the placeholders
			var iPlaceholdersCount =  aPlaceholders == null ? 0 : aPlaceholders.length;

			// build array with string and placeholders
			for ( var i = 0; i < aStringSeperatedByPlaceholders.length + iPlaceholdersCount; i++ ) {
				if ( i % 2 == 0 ){
					aStringWithPlaceholders.push(aStringSeperatedByPlaceholders[i / 2]);
				}
				else {
					aStringWithPlaceholders.push(aPlaceholders[Math.floor(i / 2)]);
				}
			}
		}

		return aStringWithPlaceholders;
	};
	/**
	 * Returns the first placeholder value in the original Text substring. The substring must begin with an "@".
	 * e.g. "@John Doe '@Jane Doe are here to party." The function will only return '@John Doe'.
	 *
	 *
	 * BIG ASSUMPTION: in the text, the @ mentions names begin with "@" AND "@" does not appear in the name
	 *
	 * @private
	 * @param {string} sTextSubstring
	 * @return {string} Place holder value
	 * @memberOf sap.collaboration.components.controls.PlaceholderUtility
	 */
	placeholderUtility._findFirstPlaceholderValueInText = function(sTextSubstring){
		var sPlaceholderValue;

		// if the substring starts with a placeholder, then return it as is.
		if (sTextSubstring.search(atMentionsPlaceholderPattern) == 0) {
			sPlaceholderValue = sTextSubstring.match(atMentionsPlaceholderPattern)[0];
		}
		else {
			// traverse the string until the first @ (after the first one
			// FIX: JAM now returns an invisible character in front of the @mentions to force
			// text direction. we have to star parsing at the 2nd index.
			//
			sPlaceholderValue = sTextSubstring[0] + sTextSubstring[1]; // "@"
			for (var i = 2; i < sTextSubstring.length; i++) {
				if (sTextSubstring[i] === "\u200E" || sTextSubstring[i] === "\u200F" // for special character &lrm; or &rlm;
					|| sTextSubstring[i] === '@' ) { // for fake placeholders
					break;
				}
				sPlaceholderValue += sTextSubstring[i]; // add character to placeholder value
			}
		}

		// remove spaces
		sPlaceholderValue = sPlaceholderValue.trim();
		return sPlaceholderValue;
	};
	Object.freeze(placeholderUtility);
	return placeholderUtility;
}, /* bExport= */ true);

