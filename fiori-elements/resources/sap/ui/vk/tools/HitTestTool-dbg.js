/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides class sap.ui.vk.tools.HitTestTool control.
sap.ui.define([
	"./Tool",
	"./HitTestToolHandler",
	"./HitTestIdMode",
	"../thirdparty/three"
], function(
	Tool,
	HitTestToolHandler,
	HitTestIdMode,
	THREE
) {
	"use strict";

	/**
	 * Constructor for a new HitTestTool tool.
	 *
	 * @class
	 * When user clicks/taps inside of 3D Viewport this tool can be used to find if there is an object at this point
	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.HitTestTool
	 */
	var HitTestTool = Tool.extend("sap.ui.vk.tools.HitTestTool", /** @lends sap.ui.vk.tools.HitTestTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			properties: {
				/**
				 * Indicates what schema the tool should use to extract IDs from hit objects
				 */
				IdMode: {
					type: "sap.ui.vk.tools.HitTestIdMode",
					defaultValue: HitTestIdMode.ThreeJS
				}
			},

			events: {
				/**
				 * This event will be fired when 3D object is detected under hit position.
				 */
				hit: {
					parameters: {
						id: "any",
						object: "any",
						point: "any",
						clickType: "sap.ui.vk.tools.HitTestClickType"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			// Treat tool instantiation as singleton
			if (HitTestTool._instance) {
				return HitTestTool._instance;
			}

			// extend the properties of the base class
			Tool.apply(this, arguments);

			// Set the GUID for this tool. For VIT native tools, used to avoid naming conflicts with third party tools
			this.setToolid("63150593-75f6-c330-2a7a-c1f85d36b2b9");

			// Configure dependencies
			this._viewport = null;
			this._handler = new HitTestToolHandler(this);
			this._loco = null;

			HitTestTool._instance = this;
		}
	});

	HitTestTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.threejs.Viewport"]);
	};

	/*
	 * Override the active property setter so that we execute activation / deactivation code at the same time
	 */
	HitTestTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				// Prepare the tool to execute
				this._prepare();
			} else {
				this._removeLocoHandler();
			}
		}

		return this;
	};

	/*
	 * Checks that the execution criteria for this tool are met before execution of tool commands
	 */
	HitTestTool.prototype._prepare = function() {
		if (!this._addLocoHandler()) {
			return false;
		}

		var okToExec = false;
		if (this.isViewportType("sap.ui.vk.dvl.Viewport") && this._viewport._dvl) {
			this._dvlRendererId = this._viewport._dvlRendererId;
			this._dvl = this._viewport._dvl;
			okToExec = true;
		} else if (this.isViewportType("sap.ui.vk.threejs.Viewport") && (this._viewport._scene && this._viewport._scene.getSceneRef())) {
			okToExec = true;
		}

		return okToExec;
	};

	/**
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	HitTestTool.prototype.queueCommand = function(command) {
		if (this._prepare()) {
			if (this._dvlRendererId) {
				this._dvl.Renderer._queueCommand(command, this._dvlRendererId);
			}
		}
		return this;
	};

	/**
	 * Figure out which helper is needed and execute hit test
	 *
	 * @param {int} x The tap gesture's x-coordinate.
	 * @param {int} y The tap gesture's y-coordinate.
	 * @param {sap.ui.vk.Scene} scene Scene object used in current viewport.
	 * @param {sap.ui.vk.Camera} camera Current viewport's camera.
	 * @param {sap.ui.vk.tools.HitTestClickType} clickType One of predefined click types, this is passed to the hit event
	 * @returns {any} Structure with hit object, its id and screen point where hit test is performed. Null if hit test didn't detect any object.
	 * @public
	 */
	HitTestTool.prototype.hitTest = function(x, y, scene, camera, clickType) {
		if (this._prepare()) {

			var hitResult = null;

			if (this.isViewportType("sap.ui.vk.dvl.Viewport") && this._viewport._dvl) {
				// Fire the DVL HitTest logic
				return null;
			} else if (this.isViewportType("sap.ui.vk.threejs.Viewport")) {

				if (!scene || !camera) {
					hitResult = null;
				} else if (this._viewport._renderer) {
					// TODO: use sap.ui.vk.threejs.Viewport.hitTest()
					var element = this._viewport._renderer.domElement;
					var mouse = new THREE.Vector2((x - element.offsetLeft) / element.clientWidth * 2 - 1, (element.offsetTop - y) / element.clientHeight * 2 + 1);
					var raycaster = new THREE.Raycaster();

					raycaster.setFromCamera(mouse, camera.getCameraRef());

					var intersects = raycaster.intersectObjects(scene.getSceneRef().children, true);

					if (intersects && intersects.length) {
						for (var i in intersects) {
							var result = intersects[i];
							var object = result.object;

							// search for the first closed parent node
							var parent = object.parent;
							while (parent) {
								if (parent.userData.closed) {
									object = parent;
								}
								parent = parent.parent;
							}

							// skip "skipIt" and unnamed nodes
							while (object.parent && object.userData.skipIt) {
								object = object.parent;
							}

							if (object.visible && !object.isBillboard && !object.isDetailView) {
								result.object = object;
								hitResult = result;
								break;
							}
						}
					}
				}
			}

			var ret = null;
			if (hitResult) {
				var idResult;
				switch (this.getIdMode()) {
					case HitTestIdMode.VEsID:
						// Logic to extract VEsID from hitResult
						idResult = this._viewport._scene.nodeRefToPersistentId(hitResult.object);
						break;
					case HitTestIdMode.ThreeJS:
						idResult = hitResult.object.id;
						break;
					default:
						idResult = hitResult.object.id;
						break;
				}
				ret = {
					id: idResult,
					object: hitResult.object,
					point: hitResult.point,
					clickType: clickType
				};
				this.fireHit(ret);
			}
			return ret;
		}
	};

	return HitTestTool;
});
