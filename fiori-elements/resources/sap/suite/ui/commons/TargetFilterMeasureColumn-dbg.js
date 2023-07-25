/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.TargetFilterMeasureColumn.
sap.ui.define([
	'./library',
	'sap/ui/core/Element',
	'sap/ui/model/type/Integer',
	'sap/ui/model/SimpleType',
	"sap/base/Log"
], function (library, Element, IntegerType, SimpleType, Log) {
	"use strict";

	/**
	 * Constructor for a new TargetFilterMeasureColumn.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The configuration element for the measure column in the TargetFilter control.
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated.
	 * @alias sap.suite.ui.commons.TargetFilterMeasureColumn
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TargetFilterMeasureColumn = Element.extend("sap.suite.ui.commons.TargetFilterMeasureColumn", /** @lends sap.suite.ui.commons.TargetFilterMeasureColumn.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * The binding path.
				 */
				path: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * This property is used for formatting the displayed values. The type of the property must be sap.ui.model.SimpleType or its descendants. By default, sap.ui.model.type.Integer with enabled grouping.
				 */
				type: {type: "any", group: "Misc", defaultValue: null}
			}
		}
	});

	TargetFilterMeasureColumn.prototype.init = function () {
		this.setType(new IntegerType({groupingEnabled: true}));
	};

	TargetFilterMeasureColumn.prototype.setType = function (oType, bSuppressInvalidate) {
		if (!(oType instanceof SimpleType)) {
			Log.error(oType + " is not instance of sap.ui.model.SimpleType", this);
		}
		this.setProperty("type", oType, bSuppressInvalidate);

		return this;
	};

	return TargetFilterMeasureColumn;
});
