/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.AnchorPointTool
sap.ui.define([
	"../thirdparty/three",
	"./Tool",
	"./AnchorPointToolHandler",
	"./AnchorPointToolGizmo",
	"./AnchorPointToolOperation"
], function(
	THREE,
	Tool,
	AnchorPointToolHandler,
	AnchorPointToolGizmo,
	AnchorPointToolOperation
) {
	"use strict";

	/**
	 * Constructor for an AnchorPointTool.
	 *
	 * @class
	 * Tool used to define an anchor point and orientation in 3D space which can be used to rotate, move or scale one or more selected objects

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.AnchorPointTool
	 */
	var AnchorPointTool = Tool.extend("sap.ui.vk.tools.AnchorPointTool", /** @lends sap.ui.vk.tools.AnchorPointTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * If set to <code>true<code> values will change in round number increments instead of continual change
				 */
				enableStepping: {
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
				 * Indicates the type of allowed operations
				 */
				allowOperation: {
					type: "sap.ui.vk.tools.AnchorPointToolOperation",
					defaultValue: AnchorPointToolOperation.All
				},
				/**
				 * Whether or not to allow context menu on right-click
				 */
				allowContextMenu: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * The anchor point tool position in the world coordinate system. This property is read-only.
				 */
				position: {
					type: "any", // THREE.Vector3
					defaultValue: null
				},
				/**
				 * The anchor point tool quaternion. This property is read-only.
				 */
				quaternion: {
					type: "any", // THREE.Quaternion
					defaultValue: null
				}
			},
			events: {
				/**
				 * This event will be fired when movement occurs.
				 */
				moving: {
					parameters: {
						x: "float",
						y: "float",
						z: "float"
					}
				},
				/**
				 * This event will be fired when movement finished.
				 */
				moved: {
					parameters: {
						x: "float",
						y: "float",
						z: "float"
					}
				},
				/**
				 * This event will be fired when rotation occurs.
				 */
				rotating: {
					parameters: {
						x: "float",
						y: "float",
						z: "float"
					}
				},
				/**
				 * This event will be fired when rotation finished.
				 */
				rotated: {
					parameters: {
						x: "float",
						y: "float",
						z: "float"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = new AnchorPointToolHandler(this);
			this._gizmo = null;
		}
	});

	AnchorPointTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.threejs.Viewport"]);

		var gizmo = new AnchorPointToolGizmo();
		this.setAggregation("gizmo", gizmo);

		this.setProperty("position", gizmo._gizmo.position);
		this.setProperty("quaternion", gizmo._gizmo.quaternion);
	};

	AnchorPointTool.prototype.setViewport = function(viewport) {
		if (this._viewport !== viewport) {
			this._deactivateScreenAlignment();
		}
		Tool.prototype.setViewport.call(this, viewport);
		if (viewport) {
			this.getGizmo()._initAnchorPoint(viewport);
		}
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	AnchorPointTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				this._gizmo = this.getGizmo();
				this._gizmo.show(this._viewport, this);

				this._addLocoHandler();
				this._deactivateScreenAlignment();
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
	AnchorPointTool.prototype.queueCommand = function(command) {
		if (this._addLocoHandler()) {
			if (this.isViewportType("sap.ui.vk.threejs.Viewport")) {
				command();
			}
		}
		return this;
	};

	AnchorPointTool.prototype.setShowEditingUI = function(value) {
		this.setProperty("showEditingUI", value, true);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	AnchorPointTool.prototype.setAllowOperation = function(value) {
		this.setProperty("allowOperation", value, true);
		if (this._gizmo) {
			this._gizmo._updateHandlesVisibility();
		}
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	/**
	 * Performs movement of the anchor point.
	 *
	 * @param {float} [x] Movement offset along x axis.
	 * @param {float} [y] Movement offset along y axis.
	 * @param {float} [z] Movement offset along z axis.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnchorPointTool.prototype.move = function(x, y, z) {
		if (this._gizmo) {
			this._gizmo.move(x, y, z);
		}
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	/**
	 * Performs rotation of the anchor point.
	 *
	 * @param {float} [x] Rotation angle around x axis in degrees.
	 * @param {float} [y] Rotation angle around y axis in degrees.
	 * @param {float} [z] Rotation angle around z axis in degrees.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnchorPointTool.prototype.rotate = function(x, y, z) {
		if (this._gizmo) {
			this._gizmo.rotate(x, y, z);
		}
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	/**
	 * Moves the anchor point to the center of objects or object's origin.
	 *
	 * @param {any|any[]} target The node reference or the array of node references or Matrix4.
	 * @param {boolean} useObjectsOrigin Use the object's origin if true or the center of objects if false.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnchorPointTool.prototype.moveTo = function(target, useObjectsOrigin) {
		var nodeRefs = Array.isArray(target) ? target : [target];
		var pos = new THREE.Vector3();
		if (target instanceof THREE.Matrix4) {
			target.decompose(pos, new THREE.Quaternion(), new THREE.Vector3());
		} else if (useObjectsOrigin) {
			var count = 0;
			var center = new THREE.Vector3();
			nodeRefs.forEach(function(nodeRef) {
				nodeRef.updateWorldMatrix(false, false);
				pos.add(center.setFromMatrixPosition(nodeRef.matrixWorld));
				count++;
			});
			pos.multiplyScalar(1 / count);
		} else {
			var boundingBox = new THREE.Box3();
			nodeRefs.forEach(function(nodeRef) {
				boundingBox.expandByObject(nodeRef);
			});
			boundingBox.getCenter(pos);
		}
		this.getGizmo().setPosition(pos);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	/**
	 * Aligns the anchor point rotation to the object rotation.
	 *
	 * @param {any} target The node reference or Matrix4.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnchorPointTool.prototype.alignTo = function(target) {
		this._deactivateScreenAlignment();
		var quaternion = new THREE.Quaternion();
		if (target instanceof THREE.Matrix4) {
			target.decompose(new THREE.Vector3(), quaternion, new THREE.Vector3());
		} else if (target) {
			target.updateWorldMatrix(false, false);
			target.matrixWorld.decompose(new THREE.Vector3(), quaternion, new THREE.Vector3());
		}
		this.getGizmo().setQuaternion(quaternion);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	/**
	 * Aligns the anchor point rotation to the world coordinate system.
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnchorPointTool.prototype.alignToWorld = function() {
		this._deactivateScreenAlignment();
		this.getGizmo().setQuaternion(new THREE.Quaternion());
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	/**
	 * Aligns the anchor point rotation to the camera rotation.
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnchorPointTool.prototype.alignToScreen = function() {
		if (this._viewport) {
			this._activateScreenAlignment();
			this.alignToScreenCallback();
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	AnchorPointTool.prototype._activateScreenAlignment = function() {
		if (!this.alignToScreenCallback) {
			this.alignToScreenCallback = function() {
				var camera = this._viewport.getCamera().getCameraRef();
				this.getGizmo().setQuaternion(camera.quaternion);
			}.bind(this);
			this._viewport.attachCameraChanged(this.alignToScreenCallback);
		}
	};

	AnchorPointTool.prototype._deactivateScreenAlignment = function() {
		if (this.alignToScreenCallback && this._viewport) {
			this._viewport.detachCameraChanged(this.alignToScreenCallback);
			this.alignToScreenCallback = null;
		}
	};

	AnchorPointTool.prototype.setPosition = function() {
		throw new Error("The AnchorPointTool position is read-only");
	};

	AnchorPointTool.prototype.setQuaternion = function() {
		throw new Error("The AnchorPointTool quaternion is read-only");
	};

	return AnchorPointTool;
});
