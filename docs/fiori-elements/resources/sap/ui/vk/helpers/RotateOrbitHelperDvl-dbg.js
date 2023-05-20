/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.helpers.RotateOrbitHelper.
sap.ui.define([
	"sap/ui/base/EventProvider"
], function(
	EventProvider
) {
	"use strict";

	var RotateOrbitHelperDvl = EventProvider.extend("sap.ui.vk.helpers.RotateOrbitHelperDvl", {
		metadata: {
			library: "sap.ui.vk",
			publicMethods: [
				"rotate"
			]
		},
		constructor: function(RotateOrbitTool, DvlInstance) {
			this._tool = RotateOrbitTool;
			this._dvl = DvlInstance;
			this._dvlRendererId = this._tool._viewport._dvlRendererId;
		}
	});

	RotateOrbitHelperDvl.prototype.destroy = function() {
		this._rotateOrbitTool = null;
	};

	/**
	 * Activates orbit rotation mode
	 *
	 * @returns {sap.ui.vk.helpers.RotateOrbitHelperDvl} this
	 * @public
	 */
	RotateOrbitHelperDvl.prototype.activateOrbitMode = function() {
		if (this._dvlRendererId) {
			this._dvl.Renderer.SetOption(sap.ve.dvl.DVLRENDEROPTION.DVLRENDEROPTION_CAMERA_ROTATION_MODE_ORBIT, true);
		}
		return this;
	};

	/**
	 * Deactivates orbit rotation mode
	 *
	 * @returns {sap.ui.vk.helpers.RotateOrbitHelperDvl} this
	 * @public
	 */
	RotateOrbitHelperDvl.prototype.deactivateOrbitMode = function() {
		if (this._dvlRendererId) {
			this._dvl.Renderer.SetOption(sap.ve.dvl.DVLRENDEROPTION.DVLRENDEROPTION_CAMERA_ROTATION_MODE_ORBIT, false);
		}
		return this;
	};

	/**
	 * Executes orbit rotation against DVL for the target Viewport.
	 *
	 * @param {int} dx The change in x-coordinate used to define the desired rotation.
	 * @param {int} dy The change in y-coordinate used to define the desired rotation.
	 * @returns {sap.ui.vk.helpers.RotateOrbitHelperDvl} this
	 * @public
	 */
	RotateOrbitHelperDvl.prototype.rotate = function(dx, dy) {
		if (this._dvlRendererId) {
			this._dvl.Renderer.Rotate(dx * window.devicePixelRatio, dy * window.devicePixelRatio, this._dvlRendererId);
			this._tool.fireRotate({
				dx: dx,
				dy: dy
			});
		}
		return this;
	};

	return RotateOrbitHelperDvl;
});
