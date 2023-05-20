/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides the Design Time Metadata for the sap.m.Button control
sap.ui.define([], function () {
	"use strict";

	var TOOLBAR_TRANSLATION_KEYS = Object.freeze({
		"-sortIcon": "TIMELINE_SORT_BUTTON",
		"-filterIcon": "TIMELINE_FILTER_BUTTON",
		"-searchField": "TIMELINE_SEARCH_FIELD"
	});

	var resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	function getTranslation(sId) {
		return resourceBundle.getText(sId);
	}

	function getHeaderBarElementMetadata(sTranslationKey) {
		return {
			actions: {
				remove: {
					changeType: "hideToolbarItem",
					changeOnRelevantContainer: true
				},
				reveal: {
					changeType: "unhideToolbarItem",
					changeOnRelevantContainer: true,
					getLabel: function () {
						return getTranslation(sTranslationKey);
					}
				}
			},
			name: {
				singular: getTranslation.bind(null, sTranslationKey),
				plural: getTranslation.bind(null, sTranslationKey)
			}
		};
	}

	function getPropageMetadataFieldFactory(sIdSufix, sTranslationKey) {
		return function (oElement) {
			var sId = oElement.getId();
			if (typeof sIdSufix == "string" && sIdSufix.length > 0 && sId.endsWith(sIdSufix)) {
				return getHeaderBarElementMetadata(sTranslationKey);
			}
			return {};
		};
	}

	return {
		aggregations: {
			content: {
				ignore: true
			},
			customFilter: {
				ignore: true
			},
			filterList: {
				ignore: true
			},
			suggestionItems: {
				ignore: true
			},
			//Fake aggregations pointing to inner components
			headerBar: {
				propagateMetadata: function (oElement) {
					var sId = oElement.getId(),
						sKey;
					for (sKey in TOOLBAR_TRANSLATION_KEYS) {
						if (typeof sKey == "string" && sKey.length > 0 && sId.endsWith(sKey)) {
							return getHeaderBarElementMetadata(TOOLBAR_TRANSLATION_KEYS[sKey]);
						}
					}
					if (sId.endsWith("-headerBar")) {
						return getHeaderBarElementMetadata("TIMELINE_HEADER_BAR");
					}
					return {};
				},
				propagateRelevantContainer: true
			},
			searchField: {
				propagateMetadata: getPropageMetadataFieldFactory("-searchField", "TIMELINE_SEARCH_FIELD"),
				propagateRelevantContainer: true
			},
			sortIcon: {
				propagateMetadata: getPropageMetadataFieldFactory("-sortIcon", "TIMELINE_SORT_BUTTON"),
				propagateRelevantContainer: true
			},
			filterIcon: {
				propagateMetadata: getPropageMetadataFieldFactory("-filterIcon", "TIMELINE_FILTER_BUTTON"),
				propagateRelevantContainer: true
			}
		},
		actions: {
			remove: {
				changeType: "hideControl"
			},
			reveal: {
				changeType: "unhideControl",
				getLabel: function () {
					return getTranslation("TIMELINE_ACCESSIBILITY_TITLE");
				}
			}
		},
		name: {
			singular: "TIMELINE_ACCESSIBILITY_TITLE",
			plural: "TIMELINE_ACCESSIBILITY_TITLE"
		}
	};
}, /* bExport= */ false);
