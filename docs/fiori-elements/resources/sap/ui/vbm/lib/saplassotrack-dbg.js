/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// this module does the label handling
// Author: Martina Gozlinski, extraction by Jürgen

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

/* global VBI */// declare unusual global vars for JSLint/SAPUI5 validation
VBI.addSceneLassoTrackingFunctions = function(scene) {
	// ........................................................................//
	// Lasso Tracking .........................................................//
	// ........................................................................//

	scene.LassoTracking = function() {
		this.m_PosMoves = [];
		this.m_bTrack = false;
		this.m_keycode = 0;
	};

	scene.LassoTracking.prototype.onsapkeydown = function(e) {
		if (e.keyCode == this.m_keycode) {
			// exit mode selection mode ................//
			this.ExitMode();
			e.preventDefault();
			return true;
		}

	};
	scene.LassoTracking.prototype.onsapdown = function(e) {
		// determine the sap down position.....................................//
		var rect = scene.m_Canvas[scene.m_nOverlayIndex].getBoundingClientRect();
		var zf = scene.GetStretchFactor4Mode();
		this.m_PosMoves.push([
			(e.clientX - rect.left) / zf[0], (e.clientY - rect.top) / zf[1]
		]);
		this.m_bTrack = true;
		if (e.type == "mousedown") {
			document.addEventListener('mouseup', this, true);
		} else if (e.type == "touchstart") {
			document.addEventListener('touchend', this, true);
		} else if (e.type == "pointerdown") {
			document.addEventListener('pointerup', this, true);
		}
		e.preventDefault();
		scene.m_Canvas[scene.m_nLabelIndex].focus({preventScroll: true});
		return true;
	};

	scene.LassoTracking.prototype.handleEvent = function(e) {
		if (e.type == "mouseup") {
			document.removeEventListener('mouseup', this, true);
		} else if (e.type == "touchend") {
			document.removeEventListener('touchend', this, true);
		} else if (e.type == "pointerup") {
			document.removeEventListener('pointerup', this, true);
			if (scene.m_Gesture) {
				scene.m_Gesture.pointerCount--;
				if (!scene.m_Gesture.pointerCount) {
					scene.m_Gesture.target = null;
					scene.m_Gesture = null;
				}
			}

		}
		this.TrackEnd(e);
	};

	scene.LassoTracking.prototype.TrackEnd = function(e) {
		if (!this.m_bTrack) {
			return false;
		}

		if (this.m_PosMoves.length > 2) {
			this.execute(e);
		}
		this.m_PosMoves = [];
		this.m_bTrack = false;

		// trigger async rendering..........................................//
		scene.RenderAsync(true);
		e.preventDefault();
		e.stopPropagation();
		return true;

	};

	scene.LassoTracking.prototype.onsapmove = function(e) {
		if (this.m_bTrack) {
			var zf = scene.GetStretchFactor4Mode();
			var rect = scene.m_Canvas[scene.m_nOverlayIndex].getBoundingClientRect();
			this.m_PosMoves.push([
				(e.clientX - rect.left) / zf[0], (e.clientY - rect.top) / zf[1]
			]);
		}
		scene.SetCursor('crosshair');
		scene.RenderAsync(true); // trigger async rendering...................//
		e.preventDefault();
		return true;
	};

	scene.LassoTracking.prototype.onsapout = function(e) {

	};
	scene.LassoTracking.prototype.execute = function(e) {
		// The prototype impl is empty
	};

	scene.LassoTracking.prototype.Hook = function() {
		scene.SetInputMode(VBI.InputModeLassoSelect);
		scene.m_Ctx.m_Control.setLassoSelection(true);
		scene.m_DesignVO = this;
		scene.SetCursor('crosshair');
		scene.RenderAsync(true);
	};

	scene.LassoTracking.prototype.UnHook = function() {
		if (scene.m_nInputMode == VBI.InputModeLassoSelect) {
			scene.m_Ctx.onChangeTrackingMode(scene.m_nInputMode, false);
			scene.SetInputMode(VBI.InputModeDefault);
			scene.m_Ctx.m_Control.setLassoSelection(false);
		} else {
			jQuery.sap.log.error("Wrong InputMode in UnHook: " + scene.m_nInputMode);
		}

		this.m_PosMoves = [];
		this.m_bTrack = false;

		scene.m_DesignVO = null;
		scene.RenderAsync(true); // trigger async rendering...................//
	};

	scene.LassoTracking.prototype.ExitMode = function() {
		// exit mode selection mode ................//
		this.UnHook();
		scene.SetCursor('default');
		scene.RenderAsync(true); // trigger async rendering...................//

	};

	// ........................................................................//
	// lasso selection ........................................................//
	// ........................................................................//
	scene.LassoSelection = function() {
		scene.LassoTracking.call(this);
		this.m_keycode = 65;
		this.Hook();
	};

	scene.LassoSelection.prototype = Object.create(scene.LassoTracking.prototype);

	scene.LassoSelection.prototype.constructor = scene.LassoSelection;

	scene.LassoSelection.prototype.execute = function(e) {
		scene.PerFormMultiSelect(e, this);
	};

	scene.LassoSelection.prototype.Render = function(canvas, dc) {
		if (!this.m_bTrack) {
			return false;
		}

		// check positions to prevent from failures.........................//
		if (this.m_PosMoves.length) {
			VBI.Utilities.DrawTrackingLasso(dc, this.m_PosMoves);
		}
	};

};

});
