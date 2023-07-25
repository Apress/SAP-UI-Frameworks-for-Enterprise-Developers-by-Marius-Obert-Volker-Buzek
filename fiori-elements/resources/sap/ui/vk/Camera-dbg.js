/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Camera class.
sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(
	ManagedObject
) {
	"use strict";

	/**
	 * Constructor for a new Camera.
	 *
	 * @class Provides the base interface for the camera.
	 *
	 * The objects of this class should not be created directly. Use PerspectiveCamera or OrthographicCamera instead.
	 *
	 * @public
	 * @abstract
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.Camera
	 * @since 1.52.0
	 */
	var Camera = ManagedObject.extend("sap.ui.vk.Camera", /** @lends sap.ui.vk.Camera.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Camera position in global space (x, y, z coordinates)
				 */
				"position": {
					type: "float[]",
					defaultValue: [0, 0, 0]
				},
				/**
				 * Camera direction vector in global space (normalized x, y, z vector values)
				 */
				"targetDirection": {
					type: "float[]",
					defaultValue: [1, 0, 0]
				},
				/**
				 * Camera up vector in global space (normalized x, y, z vector values)
				 */
				"upDirection": {
					type: "float[]",
					defaultValue: [0, 1, 0]
				},
				/**
				 * Near clipping plane distance
				 */
				"nearClipPlane": {
					type: "float",
					defaultValue: 0.1
				},
				/**
				 * Far clipping plane distance
				 */
				"farClipPlane": {
					type: "float",
					defaultValue: 1.0
				}
			}
		}
	});


	/**
	 *
	 * @returns {any} Camera reference that this camera class wraps
	 * @public
	 */
	Camera.prototype.getCameraRef = function() {
		return null;
	};

	/**
	 * @returns {boolean} Flag indicating if camera object is modified
	 * @protected
	 */
	Camera.prototype.getIsModified = function() {
		return !!this._isModified;
	};

	/**
	 * @param {boolean} val Set or reset flag to indicate if this object is modified
	 * @protected
	 */
	Camera.prototype.setIsModified = function(val) {
		this._isModified = val;
	};

	return Camera;
});
