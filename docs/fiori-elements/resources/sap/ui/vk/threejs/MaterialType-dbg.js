/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.threejs.MaterialType.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Defines the three.js material type.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.threejs.MaterialType
	 * @public
	 */
	var MaterialType = {
		/**
		 * Mesh phong material
		 * @public
		 */
		MeshPhongMaterial: "MeshPhongMaterial",
		/**
		 * Mesh basic material
		 * @public
		 */
		MeshBasicMaterial: "MeshBasicMaterial",
		/**
		 * Line basic material
		 * @public
		 */
		LineBasicMaterial: "LineBasicMaterial"
	};

	return MaterialType;

}, /* bExport= */ true);
