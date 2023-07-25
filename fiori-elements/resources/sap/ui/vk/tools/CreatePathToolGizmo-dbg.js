/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CreatePathToolGizmo
sap.ui.define([
	"./CreateParametricGizmo",
	"../svg/Element",
	"../svg/Path",
	"sap/ui/events/KeyCodes"
], function(
	Gizmo,
	Element,
	Path,
	KeyCodes
) {
	"use strict";

	/**
	 * Constructor for a new CreatePathToolGizmo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides UI to display tooltips
	 * @extends sap.ui.vk.tools.CreateParametricGizmo
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.vk.tools.CreatePathToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CreatePathToolGizmo = Gizmo.extend("sap.ui.vk.tools.CreatePathToolGizmo", /** @lends sap.ui.vk.tools.CreatePathToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	/**
	 * Indicates that the gizmo is not rendered as part of the viewport HTML element.
	 * @returns {boolean} false
	 */
	CreatePathToolGizmo.prototype.hasDomElement = function() {
		return false;
	};

	/**
	 * Shows gizmo.
	 * @param {sap.ui.vk.svg.Viewport} viewport The viewport to which this tool and gizmo belongs.
	 * @param {sap.ui.vk.tools.CreatePathTool} tool The tool to which this gizmo belongs.
	 */
	CreatePathToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;
		this._activeElement = null;
		this.updateParentNode();
		this._onKeyPressListener = this._onKeyPress.bind(this);
		document.addEventListener("keydown", this._onKeyPressListener);
	};

	/**
	 * Hides gizmo.
	 */
	CreatePathToolGizmo.prototype.hide = function() {
		document.removeEventListener("keydown", this._onKeyPressListener);
		if (this._gizmo) {
			this._gizmo.parent.remove(this._gizmo);
			this._gizmo = null;
		}
		if (this._activeElement) {
			this._finishPath(false);
		}
		this._viewport = null;
		this._tool = null;
		this._root = null;
	};

	var MIN_POINTS_DISTANCE = 4; // minimum distance between adjacent path points in pixels
	var CLOSURE_DISTANCE = 16; // minimum distance between the first and last point in pixels to close the path

	/**
	 * Calculates distance in pixels.
	 * @param {float} dx X-axis distance in world space coordinate system.
	 * @param {float} dy Y-axis distance in world space coordinate system.
	 * @returns {float} Calculated distance.
	 * @private
	 */
	CreatePathToolGizmo.prototype._getDistance = function(dx, dy) {
		return Math.sqrt(dx * dx + dy * dy) * this._viewport._camera.zoom;
	};

	/**
	 * Gets path segments for a crosshair point UI element.
	 * @param {object} pos Point position.
	 * @returns {object} Path segments.
	 * @private
	 */
	CreatePathToolGizmo.prototype._getGizmoSegments = function(pos) {
		var l = 5 / this._viewport._camera.zoom;
		return [
			{ type: "move", points: [pos.x - l, pos.y] },
			{ type: "line", points: [pos.x + l, pos.y] },
			{ type: "move", points: [pos.x, pos.y - l] },
			{ type: "line", points: [pos.x, pos.y + l] }
		];
	};

	/**
	 * Add point to the path
	 * @param {object} pos Point position.
	 * @param {boolean} forceAdd Flag to force adding a point
	 * @param {boolean} checkClosure Flag to check if the path can be closed
	 * @private
	 */
	CreatePathToolGizmo.prototype._addPoint = function(pos, forceAdd, checkClosure) {
		var activeElement = this._activeElement;
		if (!activeElement) {
			this._activeElement = activeElement = new Path({
				subelement: true,
				material: this._tool._material,
				lineStyle: this._tool._lineStyle,
				fillStyle: null,
				segments: [{
					type: "move",
					points: [pos.x, pos.y]
				}]
			});
			if (activeElement.stroke[3] === 0) {
				activeElement.stroke.set([1, 0, 0, 0.5]);
				activeElement.strokeDashArray = [5, 5];
			}
			if (this._tool.getClosePath()) {
				activeElement.segments.push({ type: "close" });
				activeElement.setFillStyle(this._tool._fillStyle);
			}
			this._pointCount = 2;
			this._canClosePath = false;

			// crosshair for the last added point
			this._gizmo = new Path({
				subelement: true,
				lineStyle: {
					colour: "#000",
					width: 2
				},
				segments: this._getGizmoSegments(pos)
			});

			var node = new Element({ name: "Path" });
			node.add(activeElement);
			node.add(this._gizmo);
			this._root.add(node);
		} else {
			var points = activeElement.segments[0].points;
			if (this._pointCount >= points.length) {
				points.push(pos.x, pos.y);
			} else {
				points[points.length - 2] = pos.x;
				points[points.length - 1] = pos.y;
			}
			activeElement.invalidate();

			if (forceAdd) {
				if (checkClosure && this._checkClosure(pos)) {
					return;
				}
				if (this._getDistance(pos.x - points[this._pointCount - 2], pos.y - points[this._pointCount - 1]) >= MIN_POINTS_DISTANCE) {
					this._canClosePath = this._canClosePath || this._getDistance(pos.x - points[0], pos.y - points[1]) >= CLOSURE_DISTANCE;
					this._pointCount = points.length;
					if (this._gizmo) {
						this._gizmo.segments = this._getGizmoSegments(pos);
						this._gizmo.invalidate();
					}
				}
			}
		}
	};

	/**
	 * Check and close the path if the first point is near the last point.
	 * @param {object} pos Current mouse position in world space coordinate system.
	 * @returns {boolean} Returns true if the path was closed and finished.
	 * @private
	 */
	CreatePathToolGizmo.prototype._checkClosure = function(pos) {
		var activeElement = this._activeElement;
		if (activeElement) {
			var points = activeElement.segments[0].points;
			if (this._getDistance(pos.x - points[0], pos.y - points[1]) < CLOSURE_DISTANCE) {
				if (this._canClosePath && this._pointCount >= 6) {
					this._finishPath(true);
					return true;
				}
			}
		}
		return false;
	};

	/**
	 * Finishes of the path element creation.
	 * @param {boolean} closePath Flag to close the path
	 * @private
	 */
	CreatePathToolGizmo.prototype._finishPath = function(closePath) {
		if (this._gizmo) {
			this._gizmo.parent.remove(this._gizmo);
			this._gizmo = null;
		}

		var activeElement = this._activeElement;
		if (activeElement) {
			if (this._pointCount < 4) {// only one point was added
				activeElement.parent.remove(activeElement);
				this._activeElement = null;
				this._tool.fireCompleted({});
			} else {
				var points = activeElement.segments[0].points;
				points.length = this._pointCount;
				activeElement.setLineStyle(this._tool._lineStyle);
				if (closePath && activeElement.segments.length === 1) {
					activeElement.segments.push({ type: "close" });
					activeElement.setFillStyle(this._tool._fillStyle);
				}
				activeElement.invalidate();
				this._tool.fireCompleted({
					node: activeElement.parent,
					request: this._createRequest(activeElement.parent),
					closed: closePath
				});
			}

			this._activeElement = null;
		}
	};

	/**
	 * Keypress event handler to handle pressing Escape or Enter.
	 * @param {object} event Key press event.
	 * @private
	 */
	CreatePathToolGizmo.prototype._onKeyPress = function(event) {
		switch (event.keyCode) {
			case KeyCodes.ESCAPE:
			case KeyCodes.ENTER:
				if (this._activeElement) {
					this._finishPath(false);
				}
				break;
			default: break;
		}
	};

	return CreatePathToolGizmo;
});
