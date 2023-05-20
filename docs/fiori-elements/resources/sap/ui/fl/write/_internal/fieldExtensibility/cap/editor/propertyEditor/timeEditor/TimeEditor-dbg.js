/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/dateEditor/DateEditor",
	"sap/ui/core/format/DateFormat"
], function (
	BasePropertyEditor,
	DateEditor,
	DateFormat
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>TimeEditor</code>.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.dateEditor.DateEditor
	 * @alias sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.timeEditor.TimeEditor
	 * @author SAP SE
	 * @since 1.93
	 * @version 1.113.0
	 *
	 * @private
	 * @experimental 1.93
	 * @ui5-restricted sap.ui.fl
	 */
	var TimeEditor = DateEditor.extend("sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.timeEditor.TimeEditor", {
		xmlFragment: "sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.timeEditor.TimeEditor",
		metadata: {
			library: "sap.ui.fl"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	TimeEditor.configMetadata = Object.assign({}, DateEditor.configMetadata, {
		pattern: {
			defaultValue: "HH:mm:ss"
		},
		// By default, ignore timezones due to winter/summer time etc. as 1st Jan 1970 is set as date
		utc: {
			defaultValue: false
		}
	});

	TimeEditor.prototype.getDefaultValidators = function () {
		return Object.assign(
			{},
			DateEditor.prototype.getDefaultValidators.call(this)
		);
	};

	TimeEditor.prototype.getFormatterInstance = function (mOptions) {
		return DateFormat.getTimeInstance(mOptions || {
			pattern: "HH:mm:ss.SSSS"
		});
	};

	return TimeEditor;
});
