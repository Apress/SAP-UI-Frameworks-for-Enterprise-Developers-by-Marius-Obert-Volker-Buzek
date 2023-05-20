/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
	"sap/m/ComboBox",
	"sap/m/ComboBoxRenderer",
	"sap/ui/comp/util/ComboBoxUtils"
], function(
	BaseComboBox,
	ComboBoxRenderer,
	ComboBoxUtils
) {
	"use strict";

	/**
	 * Constructor for a new <code>odata/ComboBox</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Extends the functionalities in sap.m.ComboBox
	 * @extends sap.m.ComboBox
	 * @constructor
	 * @protected
	 * @alias sap.ui.comp.odata.ComboBox
	 */
	 var ComboBox = BaseComboBox.extend("sap.ui.comp.odata.ComboBox",
	 {
		metadata: {
			library: "sap.ui.comp",
			interfaces: [
				"sap.ui.comp.IDropDownTextArrangement"
			],
			properties: {
				/**
				 * Sets the <code>value</code> property formatting according to the <code>com.sap.vocabularies.UI.v1.TextArrangementType</code> from the ValueList property.
				 */
				textArrangement: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				}
			}
		},
		renderer: ComboBoxRenderer
	 });

	 ComboBox.prototype.onBeforeRendering = function () {
		BaseComboBox.prototype.onBeforeRendering.apply(this, arguments);
		this._processTextArrangement();
	};

	 ComboBox.prototype._processTextArrangement = function(){
		var sNewValue,
			sSelectedKey = this.getSelectedKey(),
			oSelectedItem = this.getItemByKey("" + sSelectedKey),
			sTextArrangement = this.getTextArrangement();

		if (!sTextArrangement || oSelectedItem === null) {
			return;
		}

		sNewValue = ComboBoxUtils.formatDisplayBehaviour(oSelectedItem, sTextArrangement);

		if (sNewValue) {
			this.setValue(sNewValue);
		}
	};

	return ComboBox;
});
