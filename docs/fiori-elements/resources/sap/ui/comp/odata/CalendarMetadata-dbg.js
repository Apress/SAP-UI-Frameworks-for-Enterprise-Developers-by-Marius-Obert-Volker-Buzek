/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// ----------------------------------------------------------------------------------
// Class used to determine/retrieve Calendar/Fiscal annotations for an OData property
// ----------------------------------------------------------------------------------
sap.ui.define([], function() {
	"use strict";

	// Some Calendar annotations chosen from: com.sap.vocabularies.Common.v1 SAP vocabulary
	var mCalendarValues = {
		"com.sap.vocabularies.Common.v1.IsCalendarDate": true,
		"com.sap.vocabularies.Common.v1.IsCalendarHalfyear": true,
		"com.sap.vocabularies.Common.v1.IsCalendarMonth": true,
		"com.sap.vocabularies.Common.v1.IsCalendarQuarter": true,
		"com.sap.vocabularies.Common.v1.IsCalendarWeek": true,
		"com.sap.vocabularies.Common.v1.IsCalendarYear": true,
		"com.sap.vocabularies.Common.v1.IsCalendarYearMonth": true,
		"com.sap.vocabularies.Common.v1.IsCalendarYearQuarter": true,
		"com.sap.vocabularies.Common.v1.IsCalendarYearWeek": true
	};

	/**
	 * Object used to determine/retrieve determine/retrieve Calendar/Fiscal annotations for an OData property
	 *
	 * @private
	 * @experimental This module is only for internal/experimental use!
	 * @ui5-restricted sap.ui.comp
	 */
	var CalendarMetadata = {
		isCalendarValue: function(oField) {
			return this._isMatching(oField, mCalendarValues);
		},
		isYear: function(oField) {
			return this._isDefaultTrue(oField["com.sap.vocabularies.Common.v1.IsCalendarYear"]);
		},
		isYearWeek: function(oField) {
			return this._isDefaultTrue(oField["com.sap.vocabularies.Common.v1.IsCalendarYearWeek"]);
		},
		isYearMonth: function(oField) {
			return this._isDefaultTrue(oField["com.sap.vocabularies.Common.v1.IsCalendarYearMonth"]);
		},
		isYearQuarter: function(oField) {
			return this._isDefaultTrue(oField["com.sap.vocabularies.Common.v1.IsCalendarYearQuarter"]);
		},
		_isMatching: function(oField, mMap) {
			var bMatch = false;
			for ( var sAnnotationName in mMap) {
				if (this._isDefaultTrue(oField[sAnnotationName])) {
					bMatch = true;
					break;
				}
			}
			return bMatch;
		},
		_isDefaultTrue: function(oTerm) {
			if (oTerm) {
				return oTerm.Bool ? oTerm.Bool !== "false" : true;
			}
			return false;
		}
	};

	return CalendarMetadata;
});
