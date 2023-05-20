/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
		"sap/ui/comp/util/FormatUtil"
	], function(
		FormatUtil
	) {
	"use strict";

	/**
	 * Utility class used by ComboBox and MultiComboBox
	 *
	 * @private
	 * @experimental This module is only for internal/experimental use!
	 */
	 return {
		/**
		 * Rearranges TextArragement Id and Description if required
		 *
		 * @param {object} oItem Selected ComboBox Item
		 * @param {string} sTextArrangement The required arrangement pattern
		 * @returns {string}
		 *
		 * @private
		 */
		formatDisplayBehaviour: function (oItem, sTextArrangement){
			var sResultValue,
				sKey,
				sDescription,
				oKeyBinding,
				oDescriptionBinding,
				sSelectedKey,
				oItemBindingText;

			if (oItem === null || oItem === undefined || !sTextArrangement) {
				return;
			}

			sSelectedKey = oItem.getKey();
			oItemBindingText = oItem && oItem.getBinding("text");

			if (sSelectedKey !== "" &&
				oItemBindingText && Array.isArray(oItemBindingText.aBindings)) {

				oKeyBinding = oItemBindingText.aBindings[0];
				oDescriptionBinding = oItemBindingText.aBindings[1];

				sKey = oKeyBinding && oKeyBinding.getValue();
				sDescription = oDescriptionBinding && oDescriptionBinding.getValue();

				if (sSelectedKey !== sKey) {
					return;
				}

				sResultValue = FormatUtil.getFormattedExpressionFromDisplayBehaviour(sTextArrangement, sKey, sDescription);
			}

			return sResultValue;
		}

	 };
});
