/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/integration/editor/fields/BaseField",
	"sap/m/CheckBox"
], function (
	BaseField, CheckBox
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.editor.fields.BaseField
	 * @alias sap.ui.integration.editor.fields.BooleanField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version 1.113.0
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var BooleanField = BaseField.extend("sap.ui.integration.editor.fields.BooleanField", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BaseField.getMetadata().getRenderer()
	});

	BooleanField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		if (!oVisualization) {
			oVisualization = {
				type: CheckBox,
				settings: {
					selected: { path: 'currentSettings>value' },
					editable: oConfig.editable
				}
			};
			oConfig.withLabel = true;
		} else if (oVisualization.type === "Switch") {
			oVisualization.type = "sap/m/Switch";
		}
		this._visualization = oVisualization;
	};

	return BooleanField;
});