/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides enumeration sap.chart.TimeUnitType
sap.ui.define(function() {
    "use strict";


    /**
    * Enumeration for supported time unit types in analytical chart
    *
    * @enum {string}
    * @public
    * @alias sap.chart.TimeUnitType
    */
    var TimeUnitType = {
        /**
         * type is Edm.DateTime and V2 annotation sap:display-format is "Date" or timestamp, and type is Edm.Date in V4
         * @public
         */
        Date: "Date",
        /**
         * type is Edm.string and V2 annotation sap:semantics is "yearmonthday", like "yyyyMMdd"
         * @public
         */
        yearmonthday: "yearmonthday",

        /**
         * type is Edm.string, like "yyyyQQQQQ"
         * @public
         */
        yearquarter: "yearquarter",

        /**
         * type is Edm.string, like "yyyyMM"
         * @public
         */
        yearmonth: "yearmonth",
        /**
         * type is Edm.string, like "yyyyww"
         * @public
         */
        yearweek: "yearweek",
	    /**
         * type is Edm.string, like "YYYY"
         * @public
         */
        fiscalyear: "fiscalyear",
        /**
         * type is Edm.string, like "YYYYPPP"
         * @public
         */
        fiscalyearperiod: "fiscalyearperiod"

    };


    return TimeUnitType;

}, /* bExport= */ true);
