/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.AxisAngleRotationTool
sap.ui.define([
	"./Tool",
	"../thirdparty/three",
	"./AxisAngleRotationToolHandler",
	"./AxisAngleRotationToolGizmo",
	"./Detector",
	"./ToolNodeSet"
], function(
	Tool,
	THREE,
	AxisAngleRotationToolHandler,
	AxisAngleRotationToolGizmo,
	Detector,
	ToolNodeSet
) {
	"use strict";

	/**
	 * Constructor for a new AxisAngleRotationTool.
	 *
	 * @class
	 * Tool to rotate 3D objects in space

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.AxisAngleRotationTool
	 * @experimental
	 */
	var AxisAngleRotationTool = Tool.extend("sap.ui.vk.tools.AxisAngleRotationTool", /** @lends sap.ui.vk.tools.AxisAngleRotationTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * If set to <code>true</code> values will change in round number increments instead of continual change
				 */
				enableStepping: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Determines if snapping when rotating is enabled
				 */
				enableSnapping: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Display text box with current value, which can also be used to directly modify the value
				 */
				showEditingUI: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Whether or not to allow context menu on right-click
				 */
				allowContextMenu: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Determine what set of nodes will be transformed with this tool
				 */
				nodeSet: {
					type: "sap.ui.vk.tools.ToolNodeSet",
					defaultValue: ToolNodeSet.Highlight
				}
			},
			events: {
				/**
				 * This event will be fired when rotation finished.
				 * This event contains parameter 'nodesProperties' that is array of objects, each object has five properties:
				 * <ul>
				 *   <li><code>node: any</code> - A node reference.</li>
				 *   <li><code>angle: float</code> - An angle of rotation about the axis.</li>
				 *   <li><code>azimuth: float</code> - An azimuth of the axis of rotation in degrees in the parent's space.</li>
				 *   <li><code>elevation: float</code> - An elevation of the axis of rotation in degrees in the parent's space.</li>
				 *   <li><code>axis: float[]</code> - An axis of rotation in cartesian coordinates in the parent's space.</li>
				 * </ul>
				 * An axis of rotation in animation keys is stored in cartesian coordinates, in UI an axis of rotation
				 * is displayed in polar coordinates using azimuth and elevation.
				 */
				rotating: {
					parameters: {
						nodesProperties: "object[]"
					}
				},
				/**
				 * This event will be fired when rotation finished.
				 * This event contains parameter 'nodesProperties' that is array of objects, each object has five properties:
				 * <ul>
				 *   <li><code>node: any</code> - A node reference.</li>
				 *   <li><code>angle: float</code> - An angle of rotation about the axis.</li>
				 *   <li><code>azimuth: float</code> - An azimuth of the axis of rotation in degrees in the parent's space.</li>
				 *   <li><code>elevation: float</code> - An elevation of the axis of rotation in degrees in the parent's space.</li>
				 *   <li><code>axis: float[]</code> - An axis of rotation in cartesian coordinates in the parent's space.</li>
				 * </ul>
				 * An axis of rotation in animation keys is stored in cartesian coordinates, in UI an axis of rotation
				 * is displayed in polar coordinates using azimuth and elevation.
				 */
				rotated: {
					parameters: {
						nodesProperties: "object[]"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = new AxisAngleRotationToolHandler(this);
			this._gizmo = null;
			this._detector = new Detector();
		}
	});

	AxisAngleRotationTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.threejs.Viewport"]);

		this.setAggregation("gizmo", new AxisAngleRotationToolGizmo());
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	AxisAngleRotationTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				this._gizmo = this.getGizmo();
				this._gizmo.show(this._viewport, this);

				this._addLocoHandler();
			} else {
				this._removeLocoHandler();

				if (this._gizmo) {
					this._gizmo.hide();
					this._gizmo = null;
				}
			}
		}

		return this;
	};

	/** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AxisAngleRotationTool.prototype.queueCommand = function(command) {
		if (this._addLocoHandler()) {
			if (this.isViewportType("sap.ui.vk.threejs.Viewport")) {
				command();
			}
		}
		return this;
	};

	AxisAngleRotationTool.prototype.setShowEditingUI = function(value) {
		this.setProperty("showEditingUI", value, true);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	AxisAngleRotationTool.prototype.setEnableSnapping = function(value) {
		this.setProperty("enableSnapping", value, true);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	AxisAngleRotationTool.prototype.resetValues = function() {
		this.getGizmo().resetValues();
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	AxisAngleRotationTool.prototype.getDetector = function() {
		return this._detector;
	};

	AxisAngleRotationTool.prototype.setNodeSet = function(value) {
		this.setProperty("nodeSet", value, true);
		if (this._gizmo) {
			this._gizmo.handleSelectionChanged();
		}
	};

	/**
	 * Change the angle of rotation by a delta angle.
	 *
	 * The delta angle is applied to angles of rotation for all nodes in the node set.
	 *
	 * @param {float} deltaAngle A delta angle.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 * @experimental
	 */
	AxisAngleRotationTool.prototype.rotateBy = function(deltaAngle) {
		this.getGizmo().rotateBy(deltaAngle);
		return this;
	};

	/**
	 * Set the axis of rotation for all nodes in the node set.
	 *
	 * If before this call the nodes in the node set had different axes after this call all of them will have the same
	 * axes.
	 *
	 * @param {object|float[]} axis - An axis of rotation. If the type of the parameter is float[] then the axis is
	 *   defined in cartesian coordinates in the parent's space. If the type of the parameter is object then the axis is
	 *   defined in polar coordinates and the object must have properties <code>azimuth</code> and <code>elevation<code>
	 *   defined in degrees.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 * @experimental
	 */
	AxisAngleRotationTool.prototype.setAxis = function(axis) {
		this.getGizmo().setAxis(axis);
		return this;
	};

	/**
	 * Get the current angles and axes of rotation for nodes in the node set.
	 *
	 * @returns {object[]} An array with objects with the following structure:
	 * <ul>
	 *   <li><code>node: any</code> - A node reference.</li>
	 *   <li><code>angle: float</code> - An angle of rotation about the axis.</li>
	 *   <li><code>azimuth: float</code> - An azimuth of the axis of rotation in degrees in the parent's space.</li>
	 *   <li><code>elevation: float</code> - An elevation of the axis of rotation in degrees in the parent's space.</li>
	 *   <li><code>axis: float[]</code> - An axis of rotation in cartesian coordinates in the parent's space.</li>
	 * </ul>
	 * An axis of rotation in animation keys is stored in cartesian coordinates, in UI an axis of rotation
	 * is displayed in polar coordinates using azimuth and elevation.
	 * @private
	 * @experimental
	 */
	AxisAngleRotationTool.prototype.getValues = function() {
		return this.getGizmo().getValues();
	};


	/**
	 * Set angles and axes of rotation for nodes in the node set.
	 * @param {object[]} values An array of objects with axis-angle parameters for each node in the node set. Each
	 * element in the array has the following structure:
	 * <ul>
	 *   <li><code>node: any</code> - A node reference.</li>
	 *   <li><code>angle: float</code> - An angle of rotation about the axis.</li>
	 *   <li><code>azimuth: float</code> - An azimuth of the axis of rotation in degrees in the parent's space.</li>
	 *   <li><code>elevation: float</code> - An elevation of the axis of rotation in degrees in the parent's space.</li>
	 *   <li><code>axis: float[]</code> - An axis of rotation in cartesian coordinates in the parent's space.</li>
	 * </ul>
	 * Properties (<code>azimuth</code>, <code>elevation</code>) and <code>axis</code> are mutually exclusive. Either
	 * pair (<code>azimuth</code>, <code>elevation</code>) or <code>axis</code> should be defined. If both are defined
	 * <code>axis</code> has priority over pair (<code>azimuth</code>, <code>elevation</code>).
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 * @experimental
	 */
	AxisAngleRotationTool.prototype.setValues = function(values) {
		this.getGizmo().setValues(values);
		return this;
	};

	return AxisAngleRotationTool;
});
