/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
		"sap/ui/comp/odata/ComboBox",
		"sap/m/ComboBoxRenderer"
	],
	function(
		BaseComboBox,
		ComboBoxRenderer
	) {
	"use strict";

	var sDefaultGUID = "00000000-0000-0000-0000-000000000000";
	function isDefaultGUID(sValue){
		return sValue === sDefaultGUID;
	}
	/**
	 * Constructor for a new <code>SmartField/ComboBox</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Extends the functionalities in sap.m.ComboBox
	 * @extends sap.m.ComboBox
	 * @constructor
	 * @protected
	 * @alias sap.ui.comp.smartfield.ComboBox
	 */
	var ComboBox = BaseComboBox.extend("sap.ui.comp.smartfield.ComboBox",
	{
		metadata: {

			library: "sap.ui.comp",
			properties: {
				enteredValue: {
					type: "string",
					group: "Data",
					defaultValue: ""
				},
				/**
				 * Property works the same as sap.m.Input control <code>value</code>
				 */
				realValue: {
					type: "string",
					group: "Data",
					defaultValue: ""
				}
			}
		},
		renderer: ComboBoxRenderer
	 });

	ComboBox.prototype.init = function () {
		BaseComboBox.prototype.init.apply(this, arguments);

		this.attachChange(function () {
			var sSelectedKey = this.getSelectedKey(),
				sValue = sSelectedKey ? sSelectedKey : this.getValue();

			if (!sSelectedKey && this.getItemByKey(sValue)) {
				this.setSelectedKey(sValue);
			}

			this.setProperty("realValue", sValue);
		}.bind(this));
	};

	ComboBox.prototype.setRealValue = function (sValue) {
		this.setValue(sValue);
		this.setSelectedKey(sValue);

		return this.setProperty("realValue", sValue);
	};

	ComboBox.prototype.setEnteredValue = function (sValue) {
		if (typeof sValue !== "undefined") {
			this.setSelectedKey(sValue);
		}

		var oSelectedItem = this.getSelectedItem();

		if (sValue && !oSelectedItem && !isDefaultGUID(sValue)) {
			this.setValue(sValue);
		}
		var sEnteredValue = oSelectedItem ? this.getSelectedKey() : this.getValue();

		this.setProperty("enteredValue", sEnteredValue);

		return this;
	};

	return ComboBox;

});
