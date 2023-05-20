/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides enumeration for sap.chart.ScaleBehavior
sap.ui.define(function() {
    "use strict";

    /**
     * Enumeration for the value axes scale behavior of analytical chart.
     *
     * @enum {string}
     * @public
     * @alias sap.chart.ScaleBehavior
     */
    var ScaleBehavior = {
        /**
         * Value axes scale is automatic.
         * @public
         */
        AutoScale: "AutoScale",
        /**
         * Value axes scale is fixed.
         * @public
         */
        FixedScale: "FixedScale"
    };

    return ScaleBehavior;

}, /* bExport= */ true);
