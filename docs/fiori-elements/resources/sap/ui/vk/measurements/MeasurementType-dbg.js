/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.measurements.MeasurementType.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Measurement type.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.measurements.MeasurementType
	 * @private
	 */
	var MeasurementType = {
		/**
		 * Angle measurement
		 * @public
		 */
		Angle: "Angle",
		/**
		 * Distance measurement
		 * @public
		 */
		Distance: "Distance",
		/**
		 * Area measurement
		 * @public
		 */
		Area: "Area"
	};

	return MeasurementType;
});
