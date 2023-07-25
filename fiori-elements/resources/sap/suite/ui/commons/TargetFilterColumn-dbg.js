/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'./library',
	'sap/ui/core/Element',
	'sap/ui/model/type/String',
	'sap/ui/model/SimpleType',
	"sap/base/Log"
], function(library, Element, StringType, SimpleType, Log) {
	"use strict";

	/**
	 * Constructor for a new TargetFilterColumn.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The configuration element for the column in the TargetFilter control.
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated.
	 * @alias sap.suite.ui.commons.TargetFilterColumn
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TargetFilterColumn = Element.extend("sap.suite.ui.commons.TargetFilterColumn", /** @lends sap.suite.ui.commons.TargetFilterColumn.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * The binding path.
				 */
				path: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * The column title.
				 */
				title: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * The number of the retrieved entries for the cloud of the links in the quadrant. The quadrant can display fewer links than retrieved.
				 * The font size of the links in the quadrant depends on the measure number. The font size of the links is relative in the retrieved group.
				 */
				length: {type: "int", group: "Misc", defaultValue: 10},

				/**
				 * The type of the displayed data. The type of the property must be sap.ui.model.SimpleType or its descendants. By default, sap.ui.model.type.String.
				 * This property is used for formatting the displayed values. If sap.ui.model.type.String, the filter operator in the Search field of the column selection dialog is 'Contains'.
				 * In other cases, the filter operator is 'EQ'.
				 */
				type: {type: "any", group: "Misc", defaultValue: null}
			}
		}
	});

	TargetFilterColumn.prototype.init = function() {
		this.setType(new StringType());
		return this;
	};

	TargetFilterColumn.prototype.setType = function(oType, bSuppressInvalidate) {
		if (!(oType instanceof SimpleType)) {
			Log.error(oType + " is not instance of sap.ui.model.SimpleType", this);
		}
		this.setProperty("type", oType, bSuppressInvalidate);

		return this;
	};

	return TargetFilterColumn;
});
