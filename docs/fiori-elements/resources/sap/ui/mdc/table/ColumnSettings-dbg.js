/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/core/Element"
], function (Element) {
	"use strict";

	/**
	 * Constructor for a new <code>ColumnSettings</code>.
	 *
	 * Provides a number of general settings that are supported by both {@link sap.m.Column} and {@link sap.ui.table.Column}.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 *
	 * @class The table type info class for the metadata-driven table.
	 * @extends sap.ui.core.Element
	 * @version 1.113.0
	 * @author SAP SE
	 * @constructor
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	 * @alias sap.ui.mdc.table.ColumnSettings
	 * @since 1.110
	 */

	var ColumnSettings = Element.extend("sap.ui.mdc.table.ColumnSettings", {
		metadata: {
			library: "sap.ui.mdc",
			"abstract": true
		}
	});

	return ColumnSettings;
});