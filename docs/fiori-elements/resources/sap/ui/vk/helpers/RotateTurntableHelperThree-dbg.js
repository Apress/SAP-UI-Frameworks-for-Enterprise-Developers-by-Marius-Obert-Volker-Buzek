/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.helpers.RotateTurntableHelper.
sap.ui.define([
	"sap/ui/base/EventProvider"
], function(
	EventProvider
) {
	"use strict";

	var RotateTurntableHelperThree = EventProvider.extend("sap.ui.vk.helpers.RotateTurntableHelperThree", {
		metadata: {
			library: "sap.ui.vk",
			publicMethods: [
				"rotate"
			]
		},
		constructor: function(rotateTurntableTool) {
			this._tool = rotateTurntableTool;
		}
	});

	RotateTurntableHelperThree.prototype.destroy = function() {
		this._tool = null;
	};

	/**
	 * Activates turntable rotation mode
	 *
	 * @returns {sap.ui.vk.helpers.RotateTurntableHelperThree} this
	 * @public
	 */
	RotateTurntableHelperThree.prototype.activateTurntableMode = function() {
		this._tool._viewport._viewportGestureHandler._cameraController.isTurnTableMode = true;
		return this;
	};

	/**
	 * Deactivates turntable rotation mode
	 *
	 * @returns {sap.ui.vk.helpers.RotateTurntableHelperThree} this
	 * @public
	 */
	RotateTurntableHelperThree.prototype.deactivateTurntableMode = function() {
		this._tool._viewport._viewportGestureHandler._cameraController.isTurnTableMode = false;
		return this;
	};

	/**
	 * Executes turntable rotation for the target Viewport.
	 *
	 * @param {int} dx The change in x-coordinate used to define the desired rotation.
	 * @param {int} dy The change in y-coordinate used to define the desired rotation.
	 * @returns {sap.ui.vk.RotateTurntableHelperThree} this
	 * @public
	 */
	RotateTurntableHelperThree.prototype.rotate = function(dx, dy) {
		// Call to ViewportGestureHandler rotate method using x/y co-ordinates passed to RotateOrbitTool rotate method
		this._tool._viewport._viewportGestureHandler._cameraController.rotate(dx, dy, true);
		this._tool.fireRotate({
			dx: dx,
			dy: dy
		});

		return this;
	};

	return RotateTurntableHelperThree;
});
