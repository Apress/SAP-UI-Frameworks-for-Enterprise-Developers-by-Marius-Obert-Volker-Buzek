/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define(function() {
    "use strict";

    /**
     * Enum of available semantics value for Measure.
     *
     * @enum {string}
     * @public
     * @alias sap.chart.data.MeasureSemantics
     */
    var MeasureSemantics = {
        /**
         * facts that happened in the past.
         * @public
         */
        Actual: "actual",
        /**
         * where values will be, e.g.: forecasts, estimations, predictions.
         * @public
         */
        Reference: "reference",
        /**
         * where values should be, e.g.: thresholds, targets.
         * @public
         */
        Projected: "projected"
    };

    return MeasureSemantics;

}, /* bExport= */ true);
