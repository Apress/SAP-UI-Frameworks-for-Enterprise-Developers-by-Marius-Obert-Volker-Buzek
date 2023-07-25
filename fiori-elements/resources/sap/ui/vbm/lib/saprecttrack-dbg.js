/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// this module does the label handling
// Author: Martina Gozlinski, extraction by Jürgen

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

/* global VBI */// declare unusual global vars for JSLint/SAPUI5 validation
VBI.addSceneRectangularTrackingFunctions = function(scene) {
	// ........................................................................//
	// RectangularTracking ....................................................//
	// ........................................................................//

	scene.RectangularTracking = function() {
		this.m_PosStart = null;
		this.m_PosMove = null;
		this.m_bTrack = false;
		this.m_keycode = 0;
	};

	scene.RectangularTracking.prototype.onsapkeydown = function(e) {
		if (e.keyCode == this.m_keycode) {
			// exit tracking mode ................//
			this.ExitMode();
			e.preventDefault();
			return true;
		}

	};

	scene.RectangularTracking.prototype.onsapdown = function(e) {
		// determine the sap down position.....................................//
		var rect = scene.m_Canvas[scene.m_nOverlayIndex].getBoundingClientRect();
		this.m_PosStart = scene.GetPosFromPoint([
			e.clientX - rect.left, e.clientY - rect.top, 0
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

	scene.RectangularTracking.prototype.handleEvent = function(e) {
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

	scene.RectangularTracking.prototype.TrackEnd = function(e) {

		if (!this.m_bTrack) {
			return false;
		}

		if (this.m_PosStart && this.m_PosMove) {
			this.execute(e);
		}
		this.m_PosStart = null;
		this.m_PosMove = null;
		this.m_bTrack = false;

		// trigger async rendering..........................................//
		scene.RenderAsync(true);
		e.preventDefault();
		e.stopPropagation();

		return true;
	};

	scene.RectangularTracking.prototype.onsapmove = function(e) {
		if (this.m_bTrack) {
			// determine the move position......................................//
			var rect = scene.m_Canvas[scene.m_nOverlayIndex].getBoundingClientRect();
			this.m_PosMove = scene.GetPosFromPoint([
				e.clientX - rect.left, e.clientY - rect.top, 0
			]);
		}
		scene.SetCursor('crosshair');
		scene.RenderAsync(true); // trigger async rendering...................//
		e.preventDefault();
		return true;
	};

	scene.RectangularTracking.prototype.onsapout = function(e) {
	};

	scene.RectangularTracking.prototype.execute = function(e) {
		// The prototype impl is empty
	};

	scene.RectangularTracking.prototype.Hook = function(inputmode) {
		scene.SetInputMode(inputmode);
		if (inputmode == VBI.InputModeRectSelect) {
				scene.m_Ctx.m_Control.setProperty("rectangularSelection", true, /* bSuppressInvalidate= */true);
		} else {
			scene.m_Ctx.m_Control.setProperty("rectZoom", true, /* bSuppressInvalidate= */true);
		}
		scene.m_DesignVO = this;
		scene.SetCursor('crosshair');
		scene.RenderAsync(true);

	};

	scene.RectangularTracking.prototype.UnHook = function() {
		if (scene.m_nInputMode == VBI.InputModeRectSelect || scene.m_nInputMode == VBI.InputModeRectZoom) {
			scene.m_Ctx.onChangeTrackingMode(scene.m_nInputMode, false);
			if (scene.m_nInputMode == VBI.InputModeRectSelect) {
				scene.m_Ctx.m_Control.setProperty("rectangularSelection", false, /* bSuppressInvalidate= */true);
			} else {
				scene.m_Ctx.m_Control.setProperty("rectZoom", false, /* bSuppressInvalidate= */true);
			}
			scene.SetInputMode(VBI.InputModeDefault);
		} else {
			jQuery.sap.log.error("Wrong InputMode in UnHook: " + scene.m_nInputMode);
		}

		this.m_PosStart = null;
		this.m_PosMove = null;
		this.m_bTrack = false;

		scene.m_DesignVO = null;
		scene.RenderAsync(true); // trigger async rendering...................//
	};

	scene.RectangularTracking.prototype.ExitMode = function() {
		// exit mode selection mode ................//
		this.UnHook();
		scene.SetCursor('default');
		scene.RenderAsync(true); // trigger async rendering...................//

	};

// ........................................................................//
// rectangular zoom ( sub class of RectangularTracking ) .................//
// ........................................................................//
	scene.RectangularZoom = function() {
		scene.RectangularTracking.call(this);
		this.m_keycode = 90;
		this.Hook(VBI.InputModeRectZoom);
	};

	scene.RectangularZoom.prototype = Object.create(scene.RectangularTracking.prototype);

	scene.RectangularZoom.prototype.constructor = scene.RectangularZoom;

	scene.RectangularZoom.prototype.execute = function(e) {
		var lons = [];
		var lats = [];
		lons[0] = this.m_PosStart[0];
		lons[1] = this.m_PosMove[0];
		lats[0] = this.m_PosStart[1];
		lats[1] = this.m_PosMove[1];
		scene.ZoomToMultiplePositions(lons, lats, 1.0);
	};

	scene.RectangularZoom.prototype.Render = function(canvas, dc) {
		if (!this.m_bTrack) {
			return false;
		}

		// check positions to prevent from failures.........................//
		if (this.m_PosMove && this.m_PosStart) {
			var ptStart = scene.GetPointFromPos(this.m_PosStart, false);
			var ptMove = scene.GetPointFromPos(this.m_PosMove, false);

			var ptCorrectedMove = ptMove.slice(0);
			var CurrentWidthZoomRect = ptMove[0] - ptStart[0];
			var CurrentHeightZoomRect = ptMove[1] - ptStart[1];

			var rectDiv = scene.GetInternalDivClientRect();

			var currentRatioDiv = Math.abs(rectDiv.width / rectDiv.height);
			var currentRatioZoomRect = Math.abs(CurrentWidthZoomRect / CurrentHeightZoomRect);
			var height = 0;
			var width = 0;

			if (currentRatioZoomRect < currentRatioDiv) {
				// keep width
				width = ptMove[0] - ptStart[0];
				height = width / currentRatioDiv;
				if (ptMove[0] < ptStart[0] && ptMove[1] > ptStart[1] || ptMove[0] > ptStart[0] && ptMove[1] < ptStart[1]) {
					ptCorrectedMove[1] = ptStart[1] - height;
				} else {
					ptCorrectedMove[1] = ptStart[1] + height;
				}
			} else {
				// keep height
				height = ptMove[1] - ptStart[1];
				width = currentRatioDiv * height;
				if (ptMove[0] < ptStart[0] && ptMove[1] > ptStart[1] || ptMove[0] > ptStart[0] && ptMove[1] < ptStart[1]) {
					ptCorrectedMove[0] = ptStart[0] - width;
				} else {
					ptCorrectedMove[0] = ptStart[0] + width;
				}
			}

			VBI.Utilities.DrawTrackingRect(dc, ptStart[0], ptStart[1], ptCorrectedMove[0], ptCorrectedMove[1]);

			var zf = scene.GetStretchFactor4Mode();
			ptCorrectedMove[0] *= zf[0];
			ptCorrectedMove[1] *= zf[1];

			this.m_PosMove = scene.GetPosFromPoint([
				ptCorrectedMove[0], ptCorrectedMove[1]
			]);

		}
	};

// ........................................................................//
// rectangular selection ( sub class of RectangularTracking ) ............//
// ........................................................................//
	scene.RectSelection = function() {
		scene.RectangularTracking.call(this);
		this.m_keycode = 82;
		this.Hook(VBI.InputModeRectSelect);
	};

	scene.RectSelection.prototype = Object.create(scene.RectangularTracking.prototype);

	scene.RectSelection.prototype.constructor = scene.RectSelection;

	scene.RectSelection.prototype.execute = function(e) {
		var pt1 = scene.GetPointFromPos(this.m_PosStart, false);
		var pt2 = scene.GetPointFromPos(this.m_PosMove, false);
		var ptStart = [];
		var ptMove = [];
		var nJ;
		for (nJ = 0; nJ <= 1; nJ++) {
			if (pt1[nJ] < pt2[nJ]) {
				ptStart[nJ] = pt1[nJ];
				ptMove[nJ] = pt2[nJ];
			} else {
				ptStart[nJ] = pt2[nJ];
				ptMove[nJ] = pt1[nJ];
			}
		}

		var zf = scene.GetStretchFactor4Mode();

		// bounding boxes are defined always in non stretched canvas........//
		// coordinates, therefore transform them............................//
		ptStart[0] /= zf[0];
		ptMove[0] /= zf[0];
		ptStart[1] /= zf[1];
		ptMove[1] /= zf[1];

		this.selectionRect = [
			ptStart[0], ptStart[1], ptMove[0], ptMove[1]
		];

		scene.PerFormMultiSelect(e, this);
	};

	scene.RectSelection.prototype.Render = function(canvas, dc) {
		if (!this.m_bTrack) {
			return false;
		}

		// check positions to prevent from failures.........................//
		if (this.m_PosMove && this.m_PosStart) {
			var ptStart = scene.GetPointFromPos(this.m_PosStart, false);
			var ptMove = scene.GetPointFromPos(this.m_PosMove, false);
			VBI.Utilities.DrawTrackingRect(dc, ptStart[0], ptStart[1], ptMove[0], ptMove[1]);
		}
	};

};

});
