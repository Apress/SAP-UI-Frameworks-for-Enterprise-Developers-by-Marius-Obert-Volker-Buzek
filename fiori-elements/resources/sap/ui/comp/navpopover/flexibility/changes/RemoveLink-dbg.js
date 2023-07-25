/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
	"sap/base/util/isEmptyObject", "sap/base/Log"
], function(isEmptyObject, Log) {
	"use strict";

	/**
	 * Change handler for adding a smart form group element (representing a field).
	 *
	 * @constructor
	 * @private
	 * @since 1.44.0
	 * @alias sap.ui.comp.navpopover.flexibility.changes.RemoveLink
	 */
	var RemoveLink = {};

	/**
	 * Adds a smart form group element incl. a value control.
	 *
	 * @param {sap.ui.fl.Change} oChange
	 * @param {sap.ui.comp.navpopover.NavigationContainer} oNavigationContainer
	 * @param {object} mPropertyBag
	 * @private
	 */
	RemoveLink.applyChange = function(oChange, oNavigationContainer, mPropertyBag) {
		var oChangeContent = oChange.getContent();
		if (isEmptyObject(oChangeContent)) {
			Log.error("Change does not contain sufficient information to be applied");
			return false;
		}

		var aAvailableAction = oNavigationContainer.getAvailableActions().filter(function(oLinkData) {
			return oLinkData.getKey() === oChangeContent.key;
		});
		if (aAvailableAction.length !== 1) {
			Log.error("Item with key " + oChangeContent.key + " not found in the availableAction aggregation");
			return false;
		}

		// Update the value of 'availableActions' aggregation
		mPropertyBag.modifier.setProperty(aAvailableAction[0], "visibleChangedByUser", oChange.getLayer() === "USER");
		mPropertyBag.modifier.setProperty(aAvailableAction[0], "visible", oChangeContent.visible);

		oChange.setRevertData({
			name: oChangeContent.name,
			value: !oChangeContent.visible
		});

		return true;
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange Change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo
	 * @param {object} mPropertyBag
	 * @private
	 */
	RemoveLink.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		if (isEmptyObject(oSpecificChangeInfo.content)) {
			throw new Error("oSpecificChangeInfo.content should be filled");
		}
		if (!oSpecificChangeInfo.content.key) {
			throw new Error("In oSpecificChangeInfo.content.key attribute is required");
		}
		if (oSpecificChangeInfo.content.visible !== false) {
			throw new Error("In oSpecificChangeInfo.content.select attribute should be 'false'");
		}

		oChange.setContent(oSpecificChangeInfo.content);
	};

	RemoveLink.revertChange = function(oChange, oNavigationContainer, mPropertyBag) {
		var oChangeContent = oChange.getContent();
		if (isEmptyObject(oChangeContent)) {
			Log.error("Change does not contain sufficient information to be applied");
			return false;
		}

		var aAvailableAction = oNavigationContainer.getAvailableActions().filter(function(oLinkData) {
			return oLinkData.getKey() === oChangeContent.key;
		});
		if (aAvailableAction.length !== 1) {
			Log.error("Item with key " + oChangeContent.key + " not found in the availableAction aggregation");
			return false;
		}

		// Update the value of 'availableActions' aggregation
		mPropertyBag.modifier.setProperty(aAvailableAction[0], "visibleChangedByUser", oChange.getLayer() === "USER");
		mPropertyBag.modifier.setProperty(aAvailableAction[0], "visible", oChange.getRevertData().value);

		return true;
	};

	return RemoveLink;
},
/* bExport= */true);
