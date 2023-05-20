/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.tools.RotatableAxis.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Sets the Rotatable Axis type.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.tools.RotatableAxis
	 * @public
	 */
	var RotatableAxis = {
		/**
		 * All three axises rotatable
		 * @public
		 */
		All: "All",
		/**
		 * X axis rotatable
		 * @public
		 */
		X: "X",
		/**
		 * Y axis rotatable
		 * @public
		 */
		Y: "Y",
		/**
		 * Z axis rotatable
		 * @public
		 */
		Z: "Z"
	};

	return RotatableAxis;

}, /* bExport= */ true);
