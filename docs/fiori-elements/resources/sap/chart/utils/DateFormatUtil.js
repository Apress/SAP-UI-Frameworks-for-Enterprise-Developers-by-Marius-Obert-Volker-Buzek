/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/chart/TimeUnitType","sap/ui/core/format/DateFormat"],function(e,t){"use strict";var y={};y[e.yearmonthday]="yyyyMMdd";y[e.yearquarter]="yyyyQQQQQ";y[e.yearmonth]="yyyyMM";y[e.yearweek]="yyyyww";function r(e){var r=y[e];if(r){return t.getDateInstance({pattern:r})}else{return null}}return{getInstance:r}});