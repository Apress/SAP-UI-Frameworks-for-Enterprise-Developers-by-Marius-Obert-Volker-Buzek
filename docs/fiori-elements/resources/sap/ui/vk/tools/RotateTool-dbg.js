/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.RotateTool
sap.ui.define([
	"./Tool",
	"../thirdparty/three",
	"./RotatableAxis",
	"./CoordinateSystem",
	"./RotateToolHandler",
	"./RotateToolGizmo",
	"./GizmoPlacementMode",
	"./Detector",
	"./ToolNodeSet"
], function(
	Tool,
	THREE,
	RotatableAxis,
	CoordinateSystem,
	RotateToolHandler,
	RotateToolGizmo,
	GizmoPlacementMode,
	Detector,
	ToolNodeSet
) {
	"use strict";

	/**
	 * Constructor for a new RotateTool.
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
	 * @alias sap.ui.vk.tools.RotateTool
	 */
	var RotateTool = Tool.extend("sap.ui.vk.tools.RotateTool", /** @lends sap.ui.vk.tools.RotateTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Select coordinate system in which this tool operates. Can be Local, World, Parent, Screen or Custom
				 */
				coordinateSystem: {
					type: "sap.ui.vk.tools.CoordinateSystem",
					defaultValue: CoordinateSystem.World
				},
				/**
				 * Controls which axis are rotatable around. Can be All, X, Y, or Z
				 */
				axis: {
					type: "sap.ui.vk.tools.RotatableAxis",
					defaultValue: RotatableAxis.All
				},
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
				 * Determines if auto reset values mode is enabled
				 */
				autoResetValues: {
					type: "boolean",
					defaultValue: true
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
				},
				/**
				 * Sets the placement mode. Can be Default, ObjectCenter, or OnScreen
				 */
				placementMode: {
					type: "sap.ui.vk.tools.GizmoPlacementMode",
					defaultValue: GizmoPlacementMode.Default
				}
			},
			events: {
				/**
				 * This event will be fired when rotation finished.
				 * This event contains parameter 'nodesProperties' that is array of objects, each object has five properties:
				 * 		{any} node: node reference,
				 *		{float[]} offsetToRest,  quaternion relative to rest position in parent coordinates
				 *		{float[]} offsetToPrevious,  euler rotation relative to end position of previous sequence, or
				 *									 euler rotation relative to rest position if no previous sequence in parent coordinates
				 *		{float[]} absolute,  quaternion in parent coordinates
				 * 		{float[]} world,  quaternion in world coordinates
				 * 		{float[]} restDifference, change of rest position quaternion in parent coordinates
				 *  	{float[]} restDifferenceInCoordinates, change of rest position in euler rotation in current coordinates
				 */
				rotating: {
					parameters: {
						x: "float",
						y: "float",
						z: "float",
						nodesProperties: "any[]"
					}
				},
				/**
				 * This event will be fired when rotation finished.
				 * This event contains parameter 'nodesProperties' that is array of objects, each object has five properties:
				 * 		{any} node: node reference,
				 *		{float[]} offsetToRest,  quaternion relative to rest position in parent coordinates
				 *		{float[]} offsetToPrevious,  euler rotation relative to end position of previous sequence, or
				 *									 euler rotation relative to rest position if no previous sequence in parent coordinates
				 *		{float[]} absolute,  quaternion in parent coordinates
				 * 		{float[]} world,  quaternion in world coordinates
				 * 		{float[]} restDifference, change of rest position quaternion in parent coordinates
				 *  	{float[]} restDifferenceInCoordinates, change of rest position in euler rotation in current coordinates
				 */
				rotated: {
					parameters: {
						x: "float",
						y: "float",
						z: "float",
						nodesProperties: "any[]"
					}
				},
				axisChanged: {
					parameters: {
						axis: "sap.ui.vk.tools.RotatableAxis"
					}
				},
				/**
				 * This event will be fired when the coordinate system changes.
				 */
				coordinateSystemChanged: {
					parameters: {
						coordinateSystem: "sap.ui.vk.tools.CoordinateSystem"
					}
				},
				// gizmo placement mode changed event
				placementModeChanged: {
					parameters: {
						placementMode: "sap.ui.vk.tools.GizmoPlacementMode"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = new RotateToolHandler(this);
			this._gizmo = null;
			this._detector = new Detector();
		}
	});

	RotateTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.threejs.Viewport"]);

		this.setAggregation("gizmo", new RotateToolGizmo());
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	RotateTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				this._gizmo = this.getGizmo();
				this._gizmo.setAxis(this.getAxis());
				this._gizmo.setCoordinateSystem(this.getCoordinateSystem());
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


	RotateTool.prototype.setPlacementMode = function(value) {
		var currentValue = this.getPlacementMode();
		if (currentValue !== value) {
			this.setProperty("placementMode", value, true);
			this.getGizmo().setPlacementMode(value);
			if (this._viewport) {
				this._viewport.setShouldRenderFrame();
			}
			this.firePlacementModeChanged({ placementMode: value });
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
	RotateTool.prototype.queueCommand = function(command) {
		if (this._addLocoHandler()) {
			if (this.isViewportType("sap.ui.vk.threejs.Viewport")) {
				command();
			}
		}
		return this;
	};

	RotateTool.prototype.setAxis = function(value) {
		var currentValue = this.getAxis();
		if (currentValue !== value) {
			this.setProperty("axis", value, true);
			this.getGizmo().setAxis(value);
			if (this._viewport) {
				this._viewport.setShouldRenderFrame();
			}
			this.fireAxisChanged({ axis: value });
		}
		return this;
	};

	RotateTool.prototype.setCoordinateSystem = function(value) {
		var currentValue = this.getCoordinateSystem();
		if (currentValue !== value) {
			this.setProperty("coordinateSystem", value, true);
			this.getGizmo().setCoordinateSystem(value);
			if (this._viewport) {
				this._viewport.setShouldRenderFrame();
			}
			this.fireCoordinateSystemChanged({ coordinateSystem: value });
		}
		return this;
	};

	RotateTool.prototype.setShowEditingUI = function(value) {
		this.setProperty("showEditingUI", value, true);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	RotateTool.prototype.setEnableSnapping = function(value) {
		this.setProperty("enableSnapping", value, true);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	RotateTool.prototype.resetValues = function() {
		this.getGizmo().resetValues();
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	RotateTool.prototype.getDetector = function() {
		return this._detector;
	};

	RotateTool.prototype.setNodeSet = function(value) {
		this.setProperty("nodeSet", value, true);
		if (this._gizmo) {
			this._gizmo.handleSelectionChanged();
		}
	};

	/**
	 * Performs rotation of selected objects. If coordinate system is specified a moved event is fired
	 *
	 * @param {float} x Euler rotation x axis angle in degrees.
	 * @param {float} y Euler rotation y axis angle in degrees.
	 * @param {float} z Euler rotation z axis angle in degrees.
	 * @param {sap.ui.vk.tools.CoordinateSystem} [coordinateSystem] Optional parameter to define coordinate system to be used when these coordinates are applied. If not specified then currently set coordinate system will be used.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	RotateTool.prototype.rotate = function(x, y, z, coordinateSystem) {
		var oldCoordinateSystem;
		if (coordinateSystem && coordinateSystem !== this.getCoordinateSystem()) {
			oldCoordinateSystem = this.getCoordinateSystem();
			this.setCoordinateSystem(coordinateSystem);
		}

		if (this._gizmo) {
			this._gizmo.rotate(x, y, z);
		}

		if (oldCoordinateSystem) {
			this.setCoordinateSystem(oldCoordinateSystem);
		}

		if (this._gizmo) {
			this._gizmo.endGesture();
		}

		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}

		return this;
	};

	/**
	 * Set initial euler rotation angles relative to the rest position, for using gizmo tool to find rotation relative to rest position
	 * or the end position of previous sequence, only working for rotation sequence defined with Euler rotation tracks
	 *
	 * @param {sap.ui.vk.AnimationPlayer} animationPlayer Used for getting the starting Euler rotation value
	 * @param {float} time Time to set
	 * @param {int} playbackIndex Optional, when specified, <code>time</code> is relative to beginning of specified playback.
	 *
	 * @return {object[]} Array of objects, each object has these properties:
	 * 					<ul>
	 * 						<li><code>node: any</code> - node reference</li>
	 *						<li><code>offsetToRest: float[]</code> - quaternion relative to rest position in parent coordinates</li>
	 *						<li><code>offsetToPrevious: float[]</code> - euler rotation relative to end position of previous sequence, or
	 *													euler relative to rest position if no previous sequence in parent coordinates</li>
	 *						<li><code>absolute: float[]</code> - quaternion in parent coordinates</li>
	 * 						<li><code>world: float[]</code> - quaternion in world coordinates</li>
	 * 						<li><code>restDifference: float[]</code> - change of rest position quaternion in parent coordinates</li>
	 *  					<li><code>restDifferenceInCoordinates: float[]</code> - change of rest position in euler rotation in current coordinates</li>
	 * 					</ul>
	 *
	 *  @private
	 */
	RotateTool.prototype.prepareForCreatingRotationKey = function(animationPlayer, time, playbackIndex) {
		if (this._gizmo) {
			this._gizmo._prepareForCreatingRotationKey(animationPlayer, time, playbackIndex);
			return this._gizmo._getNodesProperties();
		}
		return null;
	};

	/**
	 * Change the rest positions of selected node by rotation, if the node is within a rotational animation track,
	 * the difference between rest and animated positions remains constant
	 *
	 * @param {float} x Euler rotation x axis angle in degrees.
	 * @param {float} y Euler rotation y axis angle in degrees.
	 * @param {float} z Euler rotation z axis angle in degrees.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	RotateTool.prototype.rotateRestPosition = function(x, y, z) {
		if (this._gizmo) {
			this._gizmo.rotateRestPosition(x, y, z);
		}

		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	/**
	 * Rotate the selected nodes from their rest positions or the end position of previous sequence if the function
	 * prepareForCreatingRotationKey is called, and the playback with current sequence is after another playback
	 *
	 * @param {float} x Euler rotation x axis angle in degrees.
	 * @param {float} y Euler rotation y axis angle in degrees.
	 * @param {float} z Euler rotation z axis angle in degrees.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	RotateTool.prototype.rotateFromRestPosition = function(x, y, z) {
		if (this._gizmo) {
			this._gizmo.rotateFromRestPosition(x, y, z);
		}
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	return RotateTool;
});
