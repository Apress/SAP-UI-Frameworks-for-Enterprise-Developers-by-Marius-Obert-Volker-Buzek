/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// --------------------------------------------------------------------------------
// Utility class
// --------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/comp/util/DateTimeUtil",
	"sap/ui/comp/util/FormatUtil",
	"sap/ui/comp/util/FilterUtil",
	"sap/ui/comp/library",
	"sap/ui/core/Configuration"
], function (
	Object,
	Filter,
	FilterOperator,
	DateTimeUtil,
	FormatUtil,
	FilterUtil,
	library,
	Configuration
) {
	"use strict";
	var FilterType = library.smartfilterbar.FilterType,
		ValueHelpRangeOperation = library.valuehelpdialog.ValueHelpRangeOperation;

	var FilterProviderUtils = Object.extend("sap.ui.comp.smartfilterbar.FilterProviderUtils");

	FilterProviderUtils.FIELD_NAME_REGEX = /\./g;
	FilterProviderUtils.BASIC_SEARCH_FIELD_ID = "_BASIC_SEARCH_FIELD";
	FilterProviderUtils.BASIC_FILTER_AREA_ID = "_BASIC";
	FilterProviderUtils.FILTER_MODEL_NAME = "fi1t3rM0d31";
	FilterProviderUtils.CUSTOM_FIELDS_MODEL_PROPERTY = "_CUSTOM";
	FilterProviderUtils.ASSOCIATE_VALUE_LISTS = "AssociateValueLists";
	FilterProviderUtils.INTL_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
	FilterProviderUtils.UI_TIMEZONE = Configuration.getTimezone();

	/**
	 * Creates a string empty filter based on field configuration.
	 * @param {string} sField - the name of the field
	 * @param {object} oFieldMetadata - field metadata object
	 * @param {boolean} [bExclude=false] - Is this exclude or include operation
	 * @returns {sap.ui.model.Filter} - The generated filter
	 * @private
	 */
	 FilterProviderUtils._getStringEmptyFilter = function (sField, oFieldMetadata, bExclude) {
		var sOperation = bExclude ? FilterOperator.NE : FilterOperator.EQ;

		if (oFieldMetadata && oFieldMetadata.nullable === "false") {
			// For non-nullable fields we add only empty string filter
			return new Filter(sField, sOperation, "");
		} else {
			return new Filter({
				and: !!bExclude,
				filters: [
					new Filter(sField, sOperation, ""),
					new Filter(sField, sOperation, null)
				]
			});
		}
	};

	FilterProviderUtils._getFieldMetadata = function(aViewMedatada, sFieldName) {
		var oFieldMetadata = null;
		aViewMedatada.some(function(oGroup) {
			if (oGroup && oGroup.fields) {
				oGroup.fields.some(function(oField) {
					if (oField && oField.fieldName === sFieldName) {
						oFieldMetadata = oField;
					}
					return oFieldMetadata !== null;
				});
			}

			return oFieldMetadata !== null;
		});

		return oFieldMetadata;
	};

	FilterProviderUtils._getTimezone = function(aDateTimeOffsetWithTimeZone, sFieldName){
		var oTimeZone = aDateTimeOffsetWithTimeZone && aDateTimeOffsetWithTimeZone.find(function (oDateTimeOffsetWithTimeZone) {
			return oDateTimeOffsetWithTimeZone.key === sFieldName;
		});
		if (oTimeZone){
			return oTimeZone.value;
		}
		return null;
	};

	/**
	 * Static function that adapts the time part of a date according to
	 * the field metadata
	 * @private
	 * @param {Date} oDate The date object
	 * @param {Object} oMetadata The field metadata
	 * @returns {Date} The adapted date object
	 */
	 FilterProviderUtils.adaptTime = function(oDate, oMetadata) {
		var iPrecision;
		// If oDate is not instanceof oDate or metadata is not available, just return the date
		if (!(oDate instanceof Date) || !oMetadata) {
			return oDate;
		}

		// If is single filter with DateRangeType configuration, set to 0:00 UTC
		if (oMetadata.filterRestriction === FilterType.single && oMetadata.control && oMetadata.control.isA("sap.m.DynamicDateRange")){
			return DateTimeUtil.normalizeDate(oDate, true);
		}

		// If displayFormat is Date, set to 0:00 UTC
		if (oMetadata.displayFormat === "Date") {
			return DateTimeUtil.normalizeDate(oDate, true);
		}
		// If precision is defined, adapt milliseconds to precision
		iPrecision = parseInt(oMetadata.precision);
		return DateTimeUtil.adaptPrecision(oDate, iPrecision);
	};

	/**
	 * Static function to generate filter array from the given field name array and Json data object
	 * @param {Array} aFieldNames - array of field names
	 * @param {Object} oData - the json object data
	 * @param {Object} mSettings - optional settings used while creating filters
	 * @returns {Array} array of sap.ui.model.Filter
	 * @private
	 */
	FilterProviderUtils.generateFilters = function (aFieldNames, oData, mSettings) {
		var aFilters = [],
			aArrayFilters = null,
			oExcludeFilters = null,
			aExcludeFilters = null,
			sField = null,
			sMatch = FilterProviderUtils.FIELD_NAME_REGEX,
			oValue = null,
			oValue1,
			oValue2,
			aValue = null,
			iLen = 0,
			iFieldLength = 0,
			oDateFormatSettings,
			bEnableUseContainsAsDefault,
			aStringFields,
			aTimeFields,
			bUseContains,
			bIsTimeField,
			aDateTimeOffsetFields,
			aDateTimeOffsetWithTimeZone,
			bIsDateTimeOffsetField,
			sTimeZone,
			oFieldMetadata,
			aViewMetadata = [],
			oRange,
			aFilterArrReference,
			sOperation;

		if (mSettings) {
			oDateFormatSettings = mSettings.dateSettings;
			bEnableUseContainsAsDefault = mSettings.useContainsAsDefault;
			aStringFields = mSettings.stringFields;
			aTimeFields = mSettings.timeFields;
			aDateTimeOffsetFields = mSettings.dateTimeOffsetValueFields;
			aViewMetadata = mSettings.viewMetadataData || [];
			aDateTimeOffsetWithTimeZone = mSettings.dateTimeOffsetWithTimeZone;

		}
		if (aFieldNames) {
			if (oData) {
				iFieldLength = aFieldNames.length;
				while (iFieldLength--) {
					bIsTimeField = false;
					bIsDateTimeOffsetField = false;
					sField = aFieldNames[iFieldLength];
					sTimeZone = this._getTimezone(aDateTimeOffsetWithTimeZone, sField);


					oFieldMetadata = FilterProviderUtils._getFieldMetadata(aViewMetadata, sField);

					// BCP: 1970554351 In case existing filter field is converted to a custom control but there is still
					// filter data for it coming from Variant Management - we do not generate filters for it.
					if (oFieldMetadata && oFieldMetadata.isCustomFilterField) {
						continue;
					}

					if (sField && sField !== FilterProviderUtils.BASIC_SEARCH_FIELD_ID) {
						aValue = null;
						bUseContains = false;
						if (bEnableUseContainsAsDefault && aStringFields) {
							if (aStringFields.indexOf(sField) > -1) {
								bUseContains = true;
							}
						} else if (aTimeFields && aTimeFields.indexOf(sField) > -1) {
							bIsTimeField = true;
						} else if (aDateTimeOffsetFields && aDateTimeOffsetFields.indexOf(sField) > -1) {
							bIsDateTimeOffsetField = true;
						}
						oValue = oData[sField];
						// Replace all "." with "/" to convert to proper paths
						sField = sField.replace(sMatch, "/");
						if (oValue && oValue.hasOwnProperty("low")) {// The data in the model corresponds to low and high Objects
							if (oValue.low && oValue.high) {
								oValue1 = oValue.low;
								oValue2 = oValue.high;
								if (!bIsDateTimeOffsetField && oDateFormatSettings && oDateFormatSettings.UTC && oValue1 instanceof Date && oValue2 instanceof Date) {
									oValue1 = DateTimeUtil.localToUtc(oValue1);
									oValue2 = DateTimeUtil.localToUtc(oValue2);
								}
								oValue1 = FilterProviderUtils.adaptTime(oValue1, oFieldMetadata);
								oValue2 = FilterProviderUtils.adaptTime(oValue2, oFieldMetadata);
								aFilters.push(new Filter(sField, FilterOperator.BT, oValue1, oValue2));
							} else if (oValue.low) {
								if (oValue.low instanceof Date) {
									// We do not have an interval value --> Use typed in value as a single value date filter
									oValue1 = oValue.low;
									if (!bIsDateTimeOffsetField && oDateFormatSettings && oDateFormatSettings.UTC) {
										oValue1 = DateTimeUtil.localToUtc(oValue1);
									}
									oValue1 = FilterProviderUtils.adaptTime(oValue1, oFieldMetadata);
									aFilters.push(new Filter(sField, FilterOperator.EQ, oValue1));
								} else if (typeof oValue.low === "string") {

									if (bIsDateTimeOffsetField && oFieldMetadata) {
										aValue = FormatUtil.parseDateTimeOffsetInterval(oValue.low);

										aValue[0] = oFieldMetadata.ui5Type.parseValue(aValue[0], "string");
										if (aValue.length === 2) {
											aValue[1] = oFieldMetadata.ui5Type.parseValue(aValue[1], "string");
										}
									} else {
										// since we bind non date interval values only to low; resolve this by splitting "-" into an interval
										aValue = FormatUtil.parseFilterNumericIntervalData(oValue.low);
									}

									if (aValue && aValue.length === 2) {
										oValue[0] = FilterProviderUtils.adaptTime(oValue[0], oFieldMetadata);
										oValue[1] = FilterProviderUtils.adaptTime(oValue[1], oFieldMetadata);
										aFilters.push(new Filter(sField, FilterOperator.BT, aValue[0], aValue[1]));
									} else if (aValue && aValue.length === 1) {
										oValue[0] = FilterProviderUtils.adaptTime(oValue[0], oFieldMetadata);
										aFilters.push(new Filter(sField, FilterOperator.EQ, aValue[0]));
									} else {
										// We do not have an interval value --> Use typed in value as a single value filter
										aFilters.push(new Filter(sField, bUseContains ? FilterOperator.Contains : FilterOperator.EQ, oValue.low));
									}
								}
							}
						} else if (oValue && oValue.hasOwnProperty("items")) {// The data in the model corresponds to multi-value/range with a typed in
							// value
							aArrayFilters = [];
							aExcludeFilters = [];
							oExcludeFilters = null;
							if (oValue && oValue.hasOwnProperty("ranges")) { // Check if the data is for an unrestricted filter
								aValue = oValue.ranges;
								iLen = aValue.length;
								// Range Filters
								while (iLen--) {
									oRange = aValue[iLen];
									oValue1 = oRange.value1;
									oValue2 = oRange.value2;
									if (bIsTimeField) {
										if (oValue1 instanceof Date) {
											oValue1 = FormatUtil.getEdmTimeFromDate(oValue1);
										}
										if (oValue2 instanceof Date) {
											oValue2 = FormatUtil.getEdmTimeFromDate(oValue2);
										}
									} else if (oFieldMetadata && oFieldMetadata.isCalendarDate) {
										if (oValue1 instanceof Date) {
											oValue1 = oFieldMetadata.ui5Type.parseValue(oValue1);
										}
										if (oValue2 instanceof Date) {
											oValue2 = oFieldMetadata.ui5Type.parseValue(oValue2);
										}
									} else if (!bIsDateTimeOffsetField && oDateFormatSettings && oDateFormatSettings.UTC) {// Check if Date values have
										// to be converted to UTC
										if (oValue1 instanceof Date) {
											oValue1 = DateTimeUtil.localToUtc(oValue1);
										}
										if (oValue2 instanceof Date) {
											oValue2 = DateTimeUtil.localToUtc(oValue2);
										}
									} else if (bIsDateTimeOffsetField && sTimeZone) {
										if (oValue1) {
											if (FilterProviderUtils.UI_TIMEZONE !== FilterProviderUtils.INTL_TIMEZONE) {
												oValue1 = DateTimeUtil.localToTimezone(oValue1, sTimeZone);
											} else {
												oValue1 = DateTimeUtil.toTimezone(oValue1, sTimeZone);
											}
											oValue1 = DateTimeUtil.localToUtc(oValue1);
										}
										if (oValue2) {
											if (FilterProviderUtils.UI_TIMEZONE !== FilterProviderUtils.INTL_TIMEZONE) {
												oValue2 = DateTimeUtil.localToTimezone(oValue2, sTimeZone);
											} else  {
												oValue2 = DateTimeUtil.toTimezone(oValue2, sTimeZone);
											}
											oValue2 = DateTimeUtil.localToUtc(oValue2);
										}
									} else if (bIsDateTimeOffsetField && !sTimeZone) {
										if (oValue1) {
											if (oDateFormatSettings && oDateFormatSettings.UTC) {
												oValue1 = DateTimeUtil.uiTimezoneToUtc(oValue1);
												oValue1 = DateTimeUtil.localToUtc(oValue1);
											} else {
												oValue1 = DateTimeUtil.toTimezone(oValue1, FilterProviderUtils.INTL_TIMEZONE);
											}
										}

										if (oValue2) {
											if (oDateFormatSettings && oDateFormatSettings.UTC) {
												oValue2 = DateTimeUtil.uiTimezoneToUtc(oValue2);
												oValue2 = DateTimeUtil.localToUtc(oValue2);
											} else {
												oValue2 = DateTimeUtil.toTimezone(oValue2, FilterProviderUtils.INTL_TIMEZONE);
											}
										}
									}
									oValue1 = FilterProviderUtils.adaptTime(oValue1, oFieldMetadata);
									oValue2 = FilterProviderUtils.adaptTime(oValue2, oFieldMetadata);

									aFilterArrReference = (oRange.exclude ? aExcludeFilters : aArrayFilters);
									if (oRange.operation === ValueHelpRangeOperation.Empty) {

										if (oFieldMetadata && ["Edm.DateTime", "Edm.DateTimeOffset"].indexOf(oFieldMetadata.type) > -1) {
											aFilterArrReference.push(new Filter(sField, oRange.exclude ? FilterOperator.NE : FilterOperator.EQ, null));
										} else {
											aFilterArrReference.push(FilterProviderUtils._getStringEmptyFilter(sField, oFieldMetadata, oRange.exclude));
										}

									} else {
										if (oRange.operation !== FilterOperator.BT && oRange.operation !== FilterOperator.NB) {
											// TODO: We should remove this in the future but currently we are blocked by SmartMultiInput unit test
											oValue2 = undefined;
										}

										sOperation = oRange.exclude ? FilterUtil.getTransformedExcludeOperation(oRange.operation) : oRange.operation;
										aFilterArrReference.push(new Filter(sField, sOperation, oValue1, oValue2));
									}

								}
								if (aExcludeFilters.length) {
									oExcludeFilters = new Filter(aExcludeFilters, true);
								}
							}
							aValue = oValue.items;
							iLen = aValue.length;
							// Item filters
							while (iLen--) {
								aArrayFilters.push(new Filter(sField, FilterOperator.EQ, aValue[iLen].key));
							}

							// MCB considers only tokens
							// if (oFieldMetadata && ((oFieldMetadata.fControlConstructor !== MultiComboBox) || (oFieldMetadata.hiddenFilter))) {
							// Only ignore "", null and undefined values
							if (oValue.value || oValue.value === 0 || oValue.value === false) {
								if (typeof oValue.value === "string") {
									oValue.value = oValue.value.trim();
								}
								aArrayFilters.push(new Filter(sField, bUseContains ? FilterOperator.Contains : FilterOperator.EQ, oValue.value));
							}
							// }

							// OR the array values while creating the filter
							if (aArrayFilters.length) {
								// If Exclude and array (inlcude) filters exists --> use AND between them before pushing to the filter array
								if (oExcludeFilters) {
									aFilters.push(new Filter([
										new Filter(aArrayFilters, false), oExcludeFilters
									], true));
								} else {
									aFilters.push(new Filter(aArrayFilters, false));
								}
							} else if (oExcludeFilters) {
								// Only exclude filters exists --> add to the filter array
								aFilters.push(oExcludeFilters);
							}
					} else if (oFieldMetadata && oFieldMetadata.control && oFieldMetadata.control.isA("sap.m.ComboBox") && this.isValueSignificant(oFieldMetadata)) {
							if (oValue === null && oFieldMetadata.control.getSelectedKey() === "") {
								oValue = "";
							}

							if (oFieldMetadata.control.getSelectedItem()) {
							oValue = FilterProviderUtils.adaptTime(oValue, oFieldMetadata);
							aFilters.push(new Filter(sField, bUseContains ? FilterOperator.Contains : FilterOperator.EQ, oValue));
							}
						} else if (oValue || oValue === 0 || oValue === false) {// Single Value
							// Only ignore "", null and undefined values
							if (typeof oValue === "string") {
								oValue = oValue.trim();
							}
							if (oValue && oValue instanceof Date) {
								if (bIsTimeField) {
									oValue = FormatUtil.getEdmTimeFromDate(oValue);
								} else if (!bIsDateTimeOffsetField && oDateFormatSettings && oDateFormatSettings.UTC) {
									oValue = DateTimeUtil.localToUtc(oValue);
								}
							}
							if (oValue || oValue === 0 || oValue === false) {
								oValue = FilterProviderUtils.adaptTime(oValue, oFieldMetadata);
								aFilters.push(new Filter(sField, bUseContains ? FilterOperator.Contains : FilterOperator.EQ, oValue));
							}
						}
					}
				}
			}
		}
		// AND the top level filter attributes if there is more than 1
		return (aFilters.length > 1) ? [
			new Filter(aFilters, true)
		] : aFilters;
	};

	/**
	 * Static function that return InitialValueIsSignificant annotation value
	 * from the field metadata
	 * @private
	 * @param {Object} oFieldMetadata The field metadata
	 * @returns {boolean} Is ValueListWithFixedValue or not
	 */
	FilterProviderUtils.isValueSignificant = function(oFieldMetadata) {
		var oValueListParameters = oFieldMetadata["com.sap.vocabularies.Common.v1.ValueList"]
				&& oFieldMetadata["com.sap.vocabularies.Common.v1.ValueList"].Parameters,
			oValueSignificantAnnotation;
		if (oValueListParameters) {
			oValueSignificantAnnotation = oValueListParameters.find(function (parameter) {
				return parameter.hasOwnProperty("InitialValueIsSignificant");
			});
		}

		if (oValueSignificantAnnotation && oValueSignificantAnnotation["InitialValueIsSignificant"]){
			return oValueSignificantAnnotation["InitialValueIsSignificant"].Bool.toLocaleLowerCase() === "true";
		}

		return false;
	};

	return FilterProviderUtils;
});
