/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
/*
 * Parse and Format Date String depending on sap.ui.core.format.DateFormat
 */
sap.ui.define([
	'sap/chart/TimeUnitType',
	'sap/ui/core/format/DateFormat'
], function(
	TimeUnitType,
	DateFormat
) {
	"use strict";

	var PATTERN_TABLE = {};
	PATTERN_TABLE[TimeUnitType.yearmonthday] =  "yyyyMMdd";
	PATTERN_TABLE[TimeUnitType.yearquarter] =  "yyyyQQQQQ";
	PATTERN_TABLE[TimeUnitType.yearmonth] =  "yyyyMM";
	PATTERN_TABLE[TimeUnitType.yearweek] =  "yyyyww";


	function getInstance(sTimeUnitType) {
		var sPattern = PATTERN_TABLE[sTimeUnitType];
		if (sPattern) {
			return DateFormat.getDateInstance({pattern: sPattern});
		} else {
			return null;
		}
	}

	return {
		getInstance: getInstance
	};
});
