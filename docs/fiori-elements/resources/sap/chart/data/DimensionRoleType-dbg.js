/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides enumeration sap.chart.DimensionRoleType
sap.ui.define(function() {
    "use strict";


    /**
     * Enum of supported role types for Dimension
     *
     * @enum {string}
     * @public
     * @alias sap.chart.data.DimensionRoleType
     */
    var DimensionRoleType = {
        /**
         * All dimensions with role "category" are assigned to the feed uid "categoryAxis".
         *
         * <b>NOTE:</b> If the chart type requires at least one dimension on the feed "categoryAxis" (true for all chart types except pie and donut), but no dimension has the role "category" or "category2", then the first visible dimension is assigned to the "categoryAxis".
         *
         * @public
         */
        category: "category",
        /**
         * All dimensions with role "series" are assigned to the feed uid "color".
         * @public
         */
        series: "series",
        /**
         * If a chart type does not use the feed uid "categoryAxis2", then all dimensions with role "category2" are treated as dimension with role "category" (appended).
         * @public
         */
        category2: "category2"
    };

    return DimensionRoleType;

}, /* bExport= */ true);
