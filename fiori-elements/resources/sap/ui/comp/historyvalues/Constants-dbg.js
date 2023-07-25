/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define(function() {
	"use strict";

	var HISTORY_PREFIX = "sapui5.history.";
	var SHORT_HISTORY_PREFIX = "ui5.";
	var SUGGESTIONS_GROUP_PROPERTY_NAME = "__sapui5_suggestion_order";
	var MAX_HISTORY_ITEMS = 5;

	return {
		getHistoryPrefix: function () {
			return HISTORY_PREFIX;
		},
		getShortHistoryPrefix: function () {
			return SHORT_HISTORY_PREFIX;
		},
		getSuggestionsGroupPropertyName: function () {
			return SUGGESTIONS_GROUP_PROPERTY_NAME;
		},
		getMaxHistoryItems: function () {
			return MAX_HISTORY_ITEMS;
		}
	};
});
