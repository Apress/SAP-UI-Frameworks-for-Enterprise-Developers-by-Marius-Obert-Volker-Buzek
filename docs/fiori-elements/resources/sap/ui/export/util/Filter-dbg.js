/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(['sap/ui/base/Object'], function(BaseObject) {
	'use strict';

	/**
	 * Representation of filter settings that are used for exporting.
	 *
	 * @param {string} sProperty Name of the technical filter property
	 * @param {object|object[]} vRawFilter Raw filter object
	 * @param {string} vRawFilter.operator Filter operator
	 * @param {string|string[]} vRawFilter.value Filter value(s)
	 * @param {boolean} [vRawFilter.exclude] Defines whether it is an exclude filter
	 * @param {string} [sLabel] Optional label for the filter property
	 *
	 * @class The <code>sap.ui.export.util.Filter</code> class represents filter settings that are used for the export.
	 * It provides the capability to have a visual representation of the filters in the exported document and offers
	 * convenience functions like <code>sap.ui.export.util.Filter#setType</code> to improve the result.
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @since 1.110
	 * @alias sap.ui.export.util.Filter
	 * @extends sap.ui.base.Object
	 * @constructor
	 * @public
	 */
	var Filter = BaseObject.extend('sap.ui.export.util.Filter', {
		constructor: function(sProperty, vRawFilter, sLabel) {
			this.property = sProperty;
			this.rawValues = Array.isArray(vRawFilter) ? vRawFilter : [vRawFilter];
			this.label = typeof sLabel === 'string' ? sLabel : undefined;
		}
	});

	/**
	 * Returns the technical name of the property on which the filter
	 * is applied.
	 *
	 * @returns {string} Name of the property
	 *
	 * @since 1.110
	 * @public
	 */
	Filter.prototype.getProperty = function() {
		return this.property;
	};

	/**
	 * Returns the filter label if available. Otherwise the name
	 * of the filter property will be returned.
	 *
	 * @returns {string} Filter label
	 *
	 * @since 1.110
	 * @public
	 */
	Filter.prototype.getLabel = function() {
		return this.label || this.property;
	};

	/**
	 * Returns the formatted filter value(s) as string. If there are
	 * multiple filters for the same property, which are combined via
	 * <code>OR</code>, it will return a semicolon-separated list of the
	 * filter values including their operators.
	 *
	 * @returns {string} Formatted and semicolon-separated filter settings
	 *
	 * @since 1.110
	 * @public
	 */
	Filter.prototype.getValue = function() {
		var aFormattedValues, fnFormat;

		aFormattedValues = [];
		fnFormat = this.type ? this.format || this.type.formatValue.bind(this.type) : this.format;

		this.getRawValues().forEach(function(oRawFilter) {
			var vValue = oRawFilter.value;

			/* Apply format */
			if (typeof fnFormat === 'function') {
				if (Array.isArray(oRawFilter.value)) {
					vValue = [];
					oRawFilter.value.forEach(function(sVal) {
						try {
							vValue.push(fnFormat(sVal, 'string')); // Pass output type in case SimpleType.formatValue is being used
						} catch (oError) {
							vValue.push(sVal); // Ignore error and use raw value instead
						}
					});
				} else {
					try {
						vValue = fnFormat(oRawFilter.value, 'string'); // Pass output type in case SimpleType.formatValue is being used
					} catch (oError) { /* No action */}
				}
			}

			/* Append filter operator */
			switch (oRawFilter.operator) {
				case '==':
					vValue = '=' + vValue;
					break;
				case 'between':
					vValue = vValue[0] + '...' + vValue[1];
					break;
				case 'contains':
					vValue = '*' + vValue + '*';
					break;
				case 'endswith':
					vValue = '*' + vValue;
					break;
				case 'startswith':
					vValue += '*';
					break;
				default:
					vValue = oRawFilter.operator + vValue;
			}

			if (oRawFilter.exclude) {
				vValue = '!' + vValue;
			}

			aFormattedValues.push(vValue);
		});

		return aFormattedValues.join('; ');
	};

	/**
	 * Returns an Array of raw filter settings
	 *
	 * @returns {Array} The raw filter settings
	 *
	 * @private
	 */
	Filter.prototype.getRawValues = function() {
		return this.rawValues;
	};

	/**
	 * Uses the given format function to format all filter values.
	 * The function has to accept a single parameter of type <code>string</code>
	 * and needs to return a string value. The function will be called
	 * for every single raw value without the corresponding filter
	 * operator.
	 *
	 * If there is a "between" filter, the function will be called
	 * twice. In case of an error, the function call will be skipped,
	 * and the raw value will be taken instead.
	 *
	 * The format function has priority over the type-dependent format.
	 * To reset the format function and return to type-dependent
	 * formatting, the format function needs to be set to <code>null</code>.
	 *
	 * @param {function} fnFormat Format function that will be applied to the raw values
	 *
	 * @since 1.110
	 * @public
	 */
	Filter.prototype.setFormat = function(fnFormat) {
		if (typeof fnFormat !== 'function' && fnFormat !== null) {
			return;
		}

		this.format = fnFormat;
	};

	/**
	 * Takes the given string as label of the filter.
	 *
	 * @param {string} sLabel Filter label
	 *
	 * @since 1.110
	 * @public
	 */
	Filter.prototype.setLabel = function(sLabel) {
		if (typeof sLabel !== 'string' || !sLabel) {
			return;
		}

		this.label = sLabel;
	};

	/**
	 * Uses the given <code>sap.ui.model.SimpleType</code> instance
	 * to format the filter values accordingly.
	 *
	 * @param {sap.ui.model.SimpleType} oType Type instance that is used for formatting
	 *
	 * @since 1.110
	 * @public
	 */
	Filter.prototype.setType = function(oType) {
		if (!oType || typeof oType.isA !== 'function' || !oType.isA('sap.ui.model.SimpleType')) {
			return;
		}

		this.type = oType;
	};

	return Filter;
}, /* bExport= */ true);