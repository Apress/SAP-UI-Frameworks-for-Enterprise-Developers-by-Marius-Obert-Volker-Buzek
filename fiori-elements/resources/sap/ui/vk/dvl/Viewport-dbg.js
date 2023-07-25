/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Viewport.
sap.ui.define([
	"sap/ui/core/ResizeHandler",
	"../abgrToColor",
	"../CameraFOVBindingType",
	"../CameraProjectionType",
	"../colorToABGR",
	"../colorToCSSColor",
	"../Core",
	"../cssColorToColor",
	"../getResourceBundle",
	"../glMatrix",
	"../Loco",
	"../Messages",
	"../SelectionMode",
	"../Smart2DHandler",
	"../ViewportBase",
	"../ViewportHandler",
	"../VisibilityMode",
	"../ZoomTo",
	"../OutputSettings",
	"./getJSONObject",
	"./Scene",
	"./ViewportRenderer",
	"sap/base/Log"
], function(
	ResizeHandler,
	abgrToColor,
	CameraFOVBindingType,
	CameraProjectionType,
	colorToABGR,
	colorToCSSColor,
	vkCore,
	cssColorToColor,
	getResourceBundle,
	glMatrix,
	Loco,
	Messages,
	SelectionMode,
	Smart2DHandler,
	ViewportBase,
	ViewportHandler,
	VisibilityMode,
	ZoomTo,
	OutputSettings,
	getJSONObject,
	Scene,
	ViewportRenderer,
	Log
) {
	"use strict";

	// dictionaries for strings
	var dictionary;

	var initializeDictionary = function() {
		if (dictionary) {
			return;
		}

		dictionary = {
			encodedProjectionType: {},
			decodedProjectionType: {},
			encodedBindingType: {},
			decodedBindingType: {},
			decodedZoomTo: {}
		};

		// camera projection type
		dictionary.decodedProjectionType[CameraProjectionType.Perspective] = sap.ve.dvl.DVLCAMERAPROJECTION.PERSPECTIVE;
		dictionary.decodedProjectionType[CameraProjectionType.Orthographic] = sap.ve.dvl.DVLCAMERAPROJECTION.ORTHOGRAPHIC;
		dictionary.encodedProjectionType[sap.ve.dvl.DVLCAMERAPROJECTION.PERSPECTIVE] = CameraProjectionType.Perspective;
		dictionary.encodedProjectionType[sap.ve.dvl.DVLCAMERAPROJECTION.ORTHOGRAPHIC] = CameraProjectionType.Orthographic;

		// camera FOVBinding
		dictionary.decodedBindingType[CameraFOVBindingType.Minimum] = sap.ve.dvl.DVLCAMERAFOVBINDING.MIN;
		dictionary.decodedBindingType[CameraFOVBindingType.Maximum] = sap.ve.dvl.DVLCAMERAFOVBINDING.Max;
		dictionary.decodedBindingType[CameraFOVBindingType.Horizontal] = sap.ve.dvl.DVLCAMERAFOVBINDING.HORZ;
		dictionary.decodedBindingType[CameraFOVBindingType.Vertical] = sap.ve.dvl.DVLCAMERAFOVBINDING.VERT;
		dictionary.encodedBindingType[sap.ve.dvl.DVLCAMERAFOVBINDING.MIN] = CameraFOVBindingType.Minimum;
		dictionary.encodedBindingType[sap.ve.dvl.DVLCAMERAFOVBINDING.MAX] = CameraFOVBindingType.Maximum;
		dictionary.encodedBindingType[sap.ve.dvl.DVLCAMERAFOVBINDING.HORZ] = CameraFOVBindingType.Horizontal;
		dictionary.encodedBindingType[sap.ve.dvl.DVLCAMERAFOVBINDING.VERT] = CameraFOVBindingType.Vertical;

		// zoom to options
		dictionary.decodedZoomTo[ZoomTo.All] = sap.ve.dvl.DVLZOOMTO.DVLZOOMTO_ALL;
		dictionary.decodedZoomTo[ZoomTo.Visible] = sap.ve.dvl.DVLZOOMTO.DVLZOOMTO_VISIBLE;
		dictionary.decodedZoomTo[ZoomTo.Selected] = sap.ve.dvl.DVLZOOMTO.DVLZOOMTO_SELECTED;
		dictionary.decodedZoomTo[ZoomTo.Node] = sap.ve.dvl.DVLZOOMTO.DVLZOOMTO_NODE;
		dictionary.decodedZoomTo[ZoomTo.NodeSetIsolation] = sap.ve.dvl.DVLZOOMTO.DVLZOOMTO_NODE_SETISOLATION;
		dictionary.decodedZoomTo[ZoomTo.Restore] = sap.ve.dvl.DVLZOOMTO.DVLZOOMTO_RESTORE;
		dictionary.decodedZoomTo[ZoomTo.RestoreRemoveIsolation] = sap.ve.dvl.DVLZOOMTO.DVLZOOMTO_RESTORE_REMOVEISOLATION;
		dictionary.decodedZoomTo[ZoomTo.ViewLeft] = sap.ve.dvl.DVLZOOMTO.VIEW_LEFT;
		dictionary.decodedZoomTo[ZoomTo.ViewRight] = sap.ve.dvl.DVLZOOMTO.VIEW_RIGHT;
		dictionary.decodedZoomTo[ZoomTo.ViewTop] = sap.ve.dvl.DVLZOOMTO.VIEW_TOP;
		dictionary.decodedZoomTo[ZoomTo.ViewBottom] = sap.ve.dvl.DVLZOOMTO.VIEW_BOTTOM;
		dictionary.decodedZoomTo[ZoomTo.ViewBack] = sap.ve.dvl.DVLZOOMTO.VIEW_BACK;
		dictionary.decodedZoomTo[ZoomTo.ViewFront] = sap.ve.dvl.DVLZOOMTO.VIEW_FRONT;
	};

	/**
	 * Constructor for a new Viewport.
	 *
	 * @class
	 * Provides a rendering canvas for the 3D elements of a loaded scene.
	 *
	 * @param {string} [sId] ID for the new Viewport control. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new Viewport control.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.ViewportBase
	 * @alias sap.ui.vk.dvl.Viewport
	 * @deprecated Since version 1.72.0.
	 */
	var Viewport = ViewportBase.extend("sap.ui.vk.dvl.Viewport", /** @lends sap.ui.vk.dvl.Viewport.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			properties: {
				/**
				 * Viewport background top color in the ABGR format
				 */
				backgroundColorTopABGR: {
					type: "int",
					defaultValue: 0xff000000 // rgba(0, 0, 0, 1) black
				},

				/**
				 * Viewport background bottom color in the ABGR format
				 */
				backgroundColorBottomABGR: {
					type: "int",
					defaultValue: 0xffffffff // rgba(255, 255, 255, 1) white
				}

			},

			events: {
				pan: {
					parameters: {
						dx: "int",
						dy: "int"
					}
				},

				zoom: {
					parameters: {
						zoomFactor: "float"
					}
				},

				rotate: {
					parameters: {
						dx: "int",
						dy: "int"
					}
				},

				/**
				 * This event will be fired when the frame rendering has finished.
				 */
				frameRenderingFinished: {
				}
			}
		}
	});

	var basePrototype = Viewport.getMetadata().getParent().getClass().prototype;

	Viewport.prototype.init = function() {
		// sap.ve.dvl might not be ready at this point, do not call initializeDictionary() here,
		// call it in _setContent when content != null.
		// initializeDictionary();

		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._eventBus = vkCore.getEventBus();

		this._graphicsCore = null;
		this._dvl = null;
		this._dvlRendererId = null;
		this._viewStateManager = null;
		this._canvas = null;
		this._resizeListenerId = null;
		// _is2D indicated whether this is a 2D Viewport or not
		this._is2D = false;

		this._viewportHandler = new ViewportHandler(this);
		this._loco = new Loco(this);
		this._loco.addHandler(this._viewportHandler, -1);
		this._smart2DHandler = null;

		// we keep track of which was the last played step; this info will be used in getViewInfo/setViewInfo
		this._lastPlayedStep = null;

		this._contentConnector = null;
	};

	Viewport.prototype.exit = function() {
		this._loco.removeHandler(this._viewportHandler);
		this._viewportHandler.destroy();

		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}

		this.setViewStateManager(null);
		this.setScene(null);
		this.setGraphicsCore(null);
		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}
	};

	/**
	 * Attaches or detaches the Viewport to the {@link sap.ui.vk.dvl.GraphicsCore GraphicsCore} object.
	 *
	 * @param {sap.ui.vk.dvl.GraphicsCore} graphicsCore The {@link sap.ui.vk.dvl.GraphicsCore GraphicsCore} object or <code>null</code>.
	 * If the <code>graphicsCore</code> parameter is not <code>null</code>, a rendering object corresponding to the Viewport is created.
	 * If the <code>graphicsCore</code> parameter is <code>null</code>, the rendering object corresponding to the Viewport is destroyed.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @deprecated Since version 1.50.0.
	 */
	Viewport.prototype.setGraphicsCore = function(graphicsCore) {
		initializeDictionary();

		if (graphicsCore != this._graphicsCore) {
			if (this._graphicsCore) {
				this._dvl.Client.detachFrameFinished(this._handleFrameFinished, this);
				this._dvl.Client.detachStepEvent(this._updateLastPlayedStep, this);
				this._dvl.Renderer.SetViewStateManager(null, this._dvlRendererId);
				this._graphicsCore._deregisterViewport(this);
				this._dvl = null;
			}

			this._graphicsCore = graphicsCore;

			if (this._graphicsCore) {
				this._dvl = this._graphicsCore._getDvl();
				this._graphicsCore._registerViewport(this);
				this.setShowDebugInfo(this.getShowDebugInfo()); // Synchronize DVL internals with viewport properties.
				this._dvl.Client.attachStepEvent(this._updateLastPlayedStep, this);
				this._dvl.Client.attachFrameFinished(this._handleFrameFinished, this);
				this._dvl.Renderer.SetViewStateManager(this._viewStateManager /* && this._viewStateManager.getImplementation() */, this._dvlRendererId);
			}
		}
		return this;
	};

	/**
	 * Gets the {@link sap.ui.vk.dvl.GraphicsCore GraphicsCore} object the Viewport is attached to.
	 * @returns {sap.ui.vk.dvl.GraphicsCore} The {@link sap.ui.vk.dvl.GraphicsCore GraphicsCore} object the Viewport is attached to, or <code>null</code>.
	 * @public
	 * @deprecated Since version 1.50.0.
	 */
	Viewport.prototype.getGraphicsCore = function() {
		return this._graphicsCore;
	};

	/**
	 * Sets the {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement HTMLCanvasElement} element for rendering 3D content.
	 * @param {HTMLCanvasElement} canvas The {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement HTMLCanvasElement} element.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	Viewport.prototype._setCanvas = function(canvas) {
		// Invalidate the viewport only when it is already rendered.
		var shouldInvalidate = this.getDomRef() && this._canvas !== canvas;
		this._canvas = canvas;
		if (shouldInvalidate) {
			this.invalidate();
		}
		return this;
	};

	/**
	 * Sets a renderer instance for the viewport.
	 * @param {string} rendererId The renderer ID.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	Viewport.prototype._setRenderer = function(rendererId) {
		this._dvlRendererId = rendererId;
		return this;
	};

	/**
	 * Updates the last played step.
	 * @param {object} parameters          A map of parameters. See below.
	 * @param {string} parameters.clientId Token representing the target client instance. This is usually the canvas ID.
	 * @param {number} parameters.type     The [DVLSTEPEVENT]{@link sap.ve.dvl.DVLSTEPEVENT} type of the event that happened to the step.
	 * @param {string} parameters.stepId   The identifier of the step.
	 * @private
	 */
	Viewport.prototype._updateLastPlayedStep = function(parameters) {
		if (parameters.type === sap.ve.dvl.DVLSTEPEVENT.DVLSTEPEVENT_STARTED) {
			this._lastPlayedStep = parameters.stepId;
			this._updateOutputSettings();
		}
	};

	/**
	 * Attaches the scene to the Viewport for rendering.
	 * @param {sap.ui.vk.Scene} scene The scene to attach to the Viewport.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @deprecated Since version 1.50.0.
	 */
	Viewport.prototype.setScene = function(scene) {

		if (this._dvlRendererId) {
			this._dvl.Renderer.AttachScene(scene && scene.getSceneRef() || null, this._dvlRendererId);
			this._dvlSceneRef = scene ? scene.getSceneRef() : null;
			if (scene) {
				this._dvl.Client.attachUrlClicked(this._fireUrlClicked, this);

				var isSmart2DContent = this._isSmart2DContent() || this._isSmart2DContentLegacy();
				// setting the Viewport background color
				if (isSmart2DContent) {
					// If it's smart 2D, make the viewport background white.
					this._dvl.Renderer.SetBackgroundColor(1, 1, 1, 1, 1, 1, 1, 1, this._dvlRendererId);
				} else {
					var topColor = this._getDecomposedABGR(this.getBackgroundColorTopABGR());
					var bottomColor = this._getDecomposedABGR(this.getBackgroundColorBottomABGR());
					this._dvl.Renderer.SetBackgroundColor(topColor.red, topColor.green, topColor.blue, topColor.alpha, bottomColor.red, bottomColor.green, bottomColor.blue, bottomColor.alpha, this._dvlRendererId);
				}
				this._updateOutputSettings();

				// Firing the 'viewActivated' event. We are notifying the listeners that a 2D/3D models has been loaded.
				this.fireViewActivated({
					type: isSmart2DContent ? "2D" : "3D"
				});
			} else {
				this._dvl.Client.detachUrlClicked(this._fireUrlClicked, this);
				if (this._smart2DHandler) {
					this._loco.removeHandler(this._smart2DHandler);
				}
				this.invalidate();
			}
		}
		return this;
	};

	Viewport.prototype._updateOutputSettings = function() {
		var stepInfo = this._dvl.Scene.RetrieveSceneInfo(this._dvlSceneRef, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_STEP_INFO);
		var dvlOutput = this._dvl.Scene.RetrieveOutputSettings(this._dvlSceneRef, stepInfo.StepId);
		var outputSettings = new OutputSettings({
			width: dvlOutput.width,
			height: dvlOutput.height,
			dpi: dvlOutput.dpi
		});
		this.setOutputSettings(outputSettings);
	};

	Viewport.prototype._isSmart2DContent = function() {
		var hotspotNodeRefs = getJSONObject(this._dvl.Scene.RetrieveSceneInfo(this._dvlSceneRef, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_HOTSPOTS).ChildNodes);
		// If a model has nodes flagged as hotspots, it means it's a Smart 2D model.
		return hotspotNodeRefs && hotspotNodeRefs.length > 0;
	};

	Viewport.prototype._isSmart2DContentLegacy = function() {
		var cameraId = this._dvl.Scene.GetCurrentCamera(this._dvlSceneRef),
			rotation = this._dvl.Camera.GetRotation(cameraId),
			projection = this._dvl.Camera.GetProjection(cameraId);
		return rotation[0] === 90 && rotation[1] === -90 && rotation[2] === 0 && projection === sap.ve.dvl.DVLCAMERAPROJECTION.ORTHOGRAPHIC;
	};

	Viewport.prototype._initializeSmart2DHandler = function() {

		if (this._viewStateManager) {
			if (this._smart2DHandler) {
				this._loco.removeHandler(this._smart2DHandler);
			}
			this._smart2DHandler = new Smart2DHandler(this, this._viewStateManager);
			this._loco.addHandler(this._smart2DHandler, 0);
		}

		if (this.getShowAllHotspots()) {
			var nodeHierarchy = this._viewStateManager.getNodeHierarchy(),
				hotspotsNodeRefs = nodeHierarchy.getHotspotNodeIds();
			this.showHotspots(hotspotsNodeRefs, true);
		}
	};

	Viewport.prototype._fireUrlClicked = function(paramaters) {
		this.fireUrlClicked({
			url: paramaters.url,
			nodeRef: paramaters.nodeId // In case of DVL nodeRef is nodeId
		});
	};

	// Override the generated method to suppress invalidation.
	Viewport.prototype.setHotspotColorABGR = function(value) {
		this.setProperty("hotspotColorABGR", value, true);

		// If value is null or undefined then previous call will assign default value to hotspotColorABGR
		// In this case we will use this default value to set hotspotColor by getting it from getProperty instead of using 'value'
		this.setProperty("hotspotColor", colorToCSSColor(abgrToColor(this.getProperty("hotspotColorABGR"))), true);
		return this;
	};

	// Override the generated method to suppress invalidation.
	Viewport.prototype.setHotspotColor = function(value) {
		this.setProperty("hotspotColor", value, true);

		// If value is null or undefined then previous call will assign default value to hotspotColor
		// In this case we will use this default value to set hotspotColorABGR by getting it from getProperty instead of using 'value'
		this.setProperty("hotspotColorABGR", colorToABGR(cssColorToColor(this.getProperty("hotspotColor"))), true);
		return this;
	};

	/**
	 * Retrieves the step index and the procedure index that can be used to store different steps since you cannot the save the dynamically generated stepId.
	 * @param {array} procedures The first argument is the procedure array where the search takes place.
	 * @param {string} stepId The second argument is the stepId for which we need to retrieve the step index and procedure index.
	 * @returns {object} An object which has two properties: <code>stepIndex</code> and <code>procedureIndex</code>.
	 * @private
	 */
	Viewport.prototype._getStepAndProcedureIndexes = function(procedures, stepId) {
		var procedureIndex = -1,
			stepIndex = -1,
			isFound = false;

		for (var i = 0; i < procedures.length; i++) {
			if (!isFound) {
				for (var j = 0; j < procedures[i].steps.length; j++) {
					if (procedures[i].steps[j].id === stepId) {
						stepIndex = j;
						procedureIndex = i;
						isFound = true;
						break;
					}
				}
			} else {
				break;
			}
		}

		return {
			stepIndex: stepIndex,
			procedureIndex: procedureIndex
		};
	};

	/**
	 * Gets the VE ID of the step.
	 *
	 * @param {string} stepId The step ID.
	 * @returns {string} The step VE ID.
	 * @private
	 */
	Viewport.prototype._getStepVeIdById = function(stepId) {
		if (stepId) {
			var veIds = this._dvl.Scene.RetrieveVEIDs(this._dvlSceneRef, stepId);
			if (Array.isArray(veIds)) {
				for (var idIndex = 0, idCount = veIds.length; idIndex < idCount; ++idIndex) {
					var veId = veIds[idIndex];
					if (veId.source === "SAP" && veId.type === "VE_VIEWPORT" && Array.isArray(veId.fields)) {
						for (var fieldIndex = 0, fieldCount = veId.fields.length; fieldIndex < fieldCount; ++fieldIndex) {
							var field = veId.fields[fieldIndex];
							if (field.name === "ID") {
								return field.value;
							}
						}
					}
				}
			}
		}
		return null;
	};

	/**
	 * Gets the step ID by VE ID.
	 *
	 * @param {array}  procedures A list of procedures to search the step in.
	 * @param {string} stepVeId The VE ID of the step.
	 * @returns {string} The step ID.
	 * @private
	 */
	Viewport.prototype._getStepIdByVeId = function(procedures, stepVeId) {
		for (var procedureIndex = 0, procedureCount = procedures.length; procedureIndex < procedureCount; ++procedureIndex) {
			var steps = procedures[procedureIndex].steps;
			for (var stepIndex = 0, stepCount = steps.length; stepIndex < stepCount; ++stepIndex) {
				var stepId = steps[stepIndex].id;
				if (this._getStepVeIdById(stepId) === stepVeId) {
					return stepId;
				}
			}
		}
		return null;
	};

	var setDefaultQueryCamera = function(effectiveQuery) {
		effectiveQuery.camera = {};
	};

	var setDefaultQueryCameraMatrices = function(effectiveQuery) {
		if (typeof effectiveQuery.camera === "object" && effectiveQuery.camera !== null) {
			effectiveQuery.camera.matrices = false;
		}
	};

	var setDefaultQueryCameraUseTransitionCamera = function(effectiveQuery) {
		if (typeof effectiveQuery.camera === "object" && effectiveQuery.camera !== null) {
			effectiveQuery.camera.useTransitionCamera = false;
		}
	};

	var setDefaultQueryAnimation = function(effectiveQuery) {
		effectiveQuery.animation = true;
	};

	var setDefaultQueryVisibility = function(effectiveQuery) {
		effectiveQuery.visibility = false;
	};

	var setDefaultQueryVisibilityMode = function(effectiveQuery) {
		if (typeof effectiveQuery.visibility === "object" && effectiveQuery.visibility !== null) {
			effectiveQuery.visibility.mode = VisibilityMode.Complete;
		}
	};

	/**
	 * Retrieves information about the current camera view in the scene, and saves the information in a JSON-like object.
	 * The information can then be used at a later time to restore the scene to the same camera view using the
	 * {@link sap.ui.vk.Viewport#setViewInfo setViewInfo} method.<br/>
	 * @param {object}         [query]                       Query object which indicates what information to be retrieved.
	 * @param {boolean|object} [query.camera=true]           Indicator to retrieve camera information.
	 * @param {boolean}        [query.camera.matrices=false] Indicator to retrieve camera view and projection matrices.
	 * @param {boolean}        [query.camera.useTransitionCamera=false] Indicator to retrieve the transition camera properties instead of regular one's.
	 * @param {boolean}        [query.animation=true]        Indicator to retrieve animation information.
	 * @param {boolean|object} [query.visibility=false]      Indicator to retrieve visibility information.
	 * @param {sap.ui.vk.VisibilityMode} [query.visibility.mode=sap.ui.vk.VisibilityMode.Complete]
	 *                                                       Indicator to retrieve the complete visibility definition or just the difference.
	 * @returns {object} JSON-like object which holds the current view information. See {@link sap.ui.vk.Viewport#setViewInfo setViewInfo}.
	 *                   In addition to properties defined in {@link sap.ui.vk.Viewport#setViewInfo setViewInfo} the output from
	 *                   {@link sap.ui.vk.Viewport#getViewInfo getViewInfo} contains camera view and projection matrices
	 * <pre>
	 *   {
	 *     ...
	 *     camera: {
	 *       ...
	 *       matrices: {
	 *         view:       [number, ...],
	 *         projection: [number, ...],
	 *       }
	 *       ...
	 *     },
	 *     ...
	 *   }
	 * </pre>
	 * @public
	 */
	Viewport.prototype.getViewInfo = function(query) {
		if (!this._dvlSceneRef) {
			return null;
		}

		var effectiveQuery = {};

		if (typeof query !== "object" || query === null) {
			setDefaultQueryCamera(effectiveQuery);
			setDefaultQueryCameraMatrices(effectiveQuery);
			setDefaultQueryCameraUseTransitionCamera(effectiveQuery);
			setDefaultQueryAnimation(effectiveQuery);
			setDefaultQueryVisibility(effectiveQuery);
			setDefaultQueryVisibilityMode(effectiveQuery);
		} else {
			if (typeof query.camera === "object" && query.camera !== null) {
				effectiveQuery.camera = {};
				if (typeof query.camera.matrices === "boolean") {
					effectiveQuery.camera.matrices = query.camera.matrices;
				} else if ("matrices" in query.camera) {
					// If camera.matrices is defined but not of type boolean, this is an error.
					effectiveQuery.camera.matrices = false;
				} else {
					// If camera.matrices is not defined, use default value.
					setDefaultQueryCameraMatrices(effectiveQuery);
				}
				if (typeof query.camera.useTransitionCamera === "boolean") {
					effectiveQuery.camera.useTransitionCamera = query.camera.useTransitionCamera;
				} else if ("useTransitionCamera" in query.camera) {
					// If camera.useTransitionCamera is defined but not of type boolean, this is an error.
					effectiveQuery.camera.useTransitionCamera = false;
				} else {
					// If camera.useTransitionCamera is not defined, use default value.
					setDefaultQueryCameraUseTransitionCamera(effectiveQuery);
				}
			} else if (typeof query.camera === "boolean") {
				if (query.camera === true) {
					effectiveQuery.camera = {};
					setDefaultQueryCameraMatrices(effectiveQuery);
					setDefaultQueryCameraUseTransitionCamera(effectiveQuery);
				} else {
					effectiveQuery.camera = false;
				}
			} else if ("camera" in query) {
				// If camera is defined but is not of type object or boolean, this is an error.
				effectiveQuery.camera = false;
			} else {
				// If camera is not defined at all, use default values.
				setDefaultQueryCamera(effectiveQuery);
				setDefaultQueryCameraMatrices(effectiveQuery);
				setDefaultQueryCameraUseTransitionCamera(effectiveQuery);
			}

			if (typeof query.animation === "boolean") {
				effectiveQuery.animation = query.animation;
			} else if ("animation" in query) {
				// If animation is defined but is not of type boolean, this is an error.
				effectiveQuery.animation = false;
			} else {
				// If animation is not defined, use default value.
				setDefaultQueryAnimation(effectiveQuery);
			}

			if (typeof query.visibility === "object" && query.visibility !== null) {
				effectiveQuery.visibility = {};
				if (query.visibility.mode === VisibilityMode.Complete || query.visibility.mode === VisibilityMode.Differences) {
					effectiveQuery.visibility.mode = query.visibility.mode;
				} else {
					// If visibility.mode is not defined or does not equal "complete" or "differences", use default value.
					// This condition is different from camera.matrices because the mode property must have a valid string value.
					setDefaultQueryVisibilityMode(effectiveQuery);
				}
			} else if (typeof query.visibility === "boolean") {
				if (query.visibility === true) {
					effectiveQuery.visibility = {};
					setDefaultQueryVisibilityMode(effectiveQuery);
				} else {
					effectiveQuery.visibility = false;
				}
			} else if ("visibility" in query) {
				// If visibility is defined but is not of type object or boolean, this is an error.
				effectiveQuery.visibility = false;
			} else {
				// If visibility is not defined, use default values.
				setDefaultQueryVisibility(effectiveQuery);
				setDefaultQueryVisibilityMode(effectiveQuery);
			}
		}

		var viewInfo = {};

		if (effectiveQuery.camera) {
			var cameraId = null;

			if (effectiveQuery.camera.useTransitionCamera) {
				cameraId = this._dvl.Renderer.GetTransitionCamera(this._dvlRendererId);
				if (cameraId === sap.ve.dvl.DVLID_INVALID) {
					cameraId = null;
				}
			}
			if (cameraId === null) {
				cameraId = this._dvl.Renderer.GetCurrentCamera(this._dvlRendererId);
			}

			var rotation = this._dvl.Camera.GetRotation(cameraId),
				cameraOrigin = this._dvl.Camera.GetOrigin(cameraId);

			viewInfo.camera = {
				rotation: {
					yaw: rotation[0],
					pitch: rotation[1],
					roll: rotation[2]
				},
				position: {
					x: cameraOrigin[0],
					y: cameraOrigin[1],
					z: cameraOrigin[2]
				},
				projectionType: dictionary.encodedProjectionType[this._dvl.Camera.GetProjection(cameraId)],
				bindingType: dictionary.encodedBindingType[this._dvl.Camera.GetFOVBinding(cameraId)]
			};

			if (this._matView) {
				viewInfo.viewMatrix = this._matView.slice();
			}
			if (this._matProj) {
				viewInfo.projectionMatrix = this._matProj.slice();
			}
			if (viewInfo.camera.projectionType === CameraProjectionType.Perspective) {
				// Perspective camera defines Field of View.
				viewInfo.camera.fieldOfView = this._dvl.Camera.GetFOV(cameraId);
			} else if (viewInfo.camera.projectionType === CameraProjectionType.Orthographic) {
				// Orthographic defines Zoom Factor.
				viewInfo.camera.zoomFactor = this._dvl.Camera.GetOrthoZoomFactor(cameraId);
			}

			if (effectiveQuery.camera.matrices) {
				var matrices = this._dvl.Renderer.GetCameraMatrices(this._dvlRendererId);
				viewInfo.camera.matrices = {
					view: matrices.view,
					projection: matrices.projection
				};
			}
		}

		if (effectiveQuery.animation) {
			var stepInfo = this._dvl.Scene.RetrieveSceneInfo(this._dvlSceneRef, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_STEP_INFO),
				isStepBeingPlayed = stepInfo.StepId !== sap.ve.dvl.DVLID_INVALID;

			var stepId = isStepBeingPlayed ? stepInfo.StepId : this._lastPlayedStep,
				animationTime = isStepBeingPlayed ? stepInfo.StepTime : 0,
				procedures = this._dvl.Scene.RetrieveProcedures(this._dvlSceneRef),
				stepAndProcedureIndexes = this._getStepAndProcedureIndexes(procedures.procedures, stepId),
				stepVeId = this._getStepVeIdById(stepId);

			viewInfo.animation = {
				animationTime: animationTime,
				stepIndex: stepAndProcedureIndexes.stepIndex,
				procedureIndex: stepAndProcedureIndexes.procedureIndex
			};

			if (stepVeId) {
				viewInfo.animation.stepVeId = stepVeId;
			}
		}

		if (effectiveQuery.visibility && this._viewStateManager) {
			viewInfo.visibility = {
				mode: effectiveQuery.visibility.mode
			};
			if (effectiveQuery.visibility.mode === VisibilityMode.Complete) {
				var allVisibility = this._viewStateManager.getVisibilityComplete();
				viewInfo.visibility.visible = allVisibility.visible;
				viewInfo.visibility.hidden = allVisibility.hidden;
			} else if (this._viewStateManager.getShouldTrackVisibilityChanges()) {
				viewInfo.visibility.changes = this._viewStateManager.getVisibilityChanges();
			} else {
				Log.warning(getResourceBundle().getText(Messages.VIT32.summary), Messages.VIT32.code, "sap.ui.vk.dvl.Viewport");
			}
		}

		return viewInfo;
	};

	/**
	 * Sets the current scene to use the camera view information acquired from the {@link sap.ui.vk.Viewport#getViewInfo getViewInfo} method.<br/>
	 * Internally, the <code>setViewInfo</code> method activates certain steps at certain animation times,
	 * and then changes the camera position, rotation and field of view (FOV) / zoom factor.
	 * @param {object}   viewInfo                             A JSON-like object containing view information acquired using
	 *                                                        the {@link sap.ui.vk.Viewport#getViewInfo getViewInfo} method.<br/>
	 * @param {object}   [viewInfo.camera]                    A JSON-like object containing the camera information.
	 * @param {object}   viewInfo.camera.rotation             Rotation defined in {@link https://en.wikipedia.org/wiki/Aircraft_principal_axes Aircraft principal axes}.
	 * @param {float}    viewInfo.camera.rotation.yaw         Angle around the vertical axis in degrees.
	 * @param {float}    viewInfo.camera.rotation.pitch       Angle around the lateral axis in degrees.
	 * @param {float}    viewInfo.camera.rotation.roll        Angle around the longitudinal axis in degrees.
	 * @param {object}   viewInfo.camera.position             Position defined in 3-dimensional space.
	 * @param {float}    viewInfo.camera.position.x           X coordinate.
	 * @param {float}    viewInfo.camera.position.y           Y coordinate.
	 * @param {float}    viewInfo.camera.position.z           Z coordinate.
	 * @param {sap.ui.vk.CameraFOVBindingType} viewInfo.camera.bindingType Camera field of view binding type.
	 * @param {sap.ui.vk.CameraProjectionType} viewInfo.camera.projectionType Camera projection type.
	 * @param {float}    viewInfo.camera.fieldOfView          Camera field of view in degrees. Applicable only to perspective cameras.
	 * @param {float}    viewInfo.camera.zoomFactor           Camera zoom factor. Applicable only to orthographic cameras.
	 * @param {object}   [viewInfo.animation]                 A JSON-like object containing the animation information.
	 * @param {string}   [viewInfo.animation.stepVeId]        Step VE ID. If it is omitted then procedure and step indices are used.
	 * @param {int}      [viewInfo.animation.procedureIndex]  Procedure index in the list of procedures.
	 * @param {int}      [viewInfo.animation.stepIndex]       Step index in the list of steps in the procedure.
	 * @param {float}    [viewInfo.animation.animationTime=0] Time at which to activate the step.
	 * @param {object}   [viewInfo.visibility]                A JSON-like object containing the visibility information.
	 * @param {sap.ui.vk.VisibilityMode} viewInfo.visibility.mode If the mode equals to {@link sap.ui.vk.VisibilityMode.Complete complete}
	 *                                                        then the visible and hidden fields are defined. If the mode
	 *                                                        equals {@link sap.ui.vk.VisibilityMode.Differences differences} then
	 *                                                        the changes field is defined.
	 * @param {string[]} viewInfo.visibility.visible          List of Ids of visible nodes.
	 * @param {string[]} viewInfo.visibility.hidden           List of Ids of hidden nodes.
	 * @param {string[]} viewInfo.visibility.changes          List of Ids of nodes with inverted visibility.
	 * @param {float}    [flyToDuration=0]                    Fly-to animation duration in seconds.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewport.prototype.setViewInfo = function(viewInfo, flyToDuration) {
		var shouldResetVisibility = false; // We need to reset view when viewInfo.visibility.mode equals "differences" and no procedure/step is provided.
		if (viewInfo.animation) {
			// retrieve all procedures from model
			var procedures = this._dvl.Scene.RetrieveProcedures(this._dvlSceneRef),
				procedureIndex = viewInfo.animation.procedureIndex,
				stepIndex = viewInfo.animation.stepIndex,
				stepVeId = viewInfo.animation.stepVeId,
				stepId,
				animationTime = viewInfo.animation.animationTime || 0;
			if (stepVeId || stepIndex >= 0 && procedureIndex >= 0) {
				if (stepVeId) {
					stepId = this._getStepIdByVeId(procedures.procedures, viewInfo.animation.stepVeId);
				} else if (procedureIndex >= 0 && procedureIndex < procedures.procedures.length) {
					// checking if step index has a valid value
					if (stepIndex >= 0 && stepIndex < procedures.procedures[procedureIndex].steps.length) {
						// retrieving stepId from step index and procedure index
						stepId = procedures.procedures[procedureIndex].steps[stepIndex].id;
					} else {
						// Unsupported value for step index
						Log.error(getResourceBundle().getText(Messages.VIT26.summary), Messages.VIT26.code, "sap.ui.vk.dvl.Viewport");
					}
				} else {
					// Unsupported value for procedure index
					Log.error(getResourceBundle().getText(Messages.VIT27.summary), Messages.VIT27.code, "sap.ui.vk.dvl.Viewport");
				}
				if (stepId) {
					// activating the current step
					this._dvl.Renderer.ActivateStep(this._dvlRendererId, stepId, false, false, animationTime);
					this._dvl.Renderer.PauseCurrentStep(this._dvlRendererId);
				}
			} else {
				shouldResetVisibility = true;
			}
		}

		if (viewInfo.camera) {
			var projectionType;

			if (viewInfo.camera.projectionType === CameraProjectionType.Perspective || viewInfo.camera.projectionType === CameraProjectionType.Orthographic) {
				projectionType = dictionary.decodedProjectionType[viewInfo.camera.projectionType];
			} else {
				Log.error(getResourceBundle().getText(Messages.VIT19.summary), Messages.VIT19.code, "sap.ui.vk.dvl.Viewport");
				projectionType = sap.ve.dvl.DVLCAMERAPROJECTION.PERSPECTIVE;
			}

			// creating a new camera
			var currentCamera = this._dvl.Scene.CreateCamera(this._dvlSceneRef, projectionType, sap.ve.dvl.DVLID_INVALID);

			if (projectionType === sap.ve.dvl.DVLCAMERAPROJECTION.PERSPECTIVE) {
				this._dvl.Camera.SetFOV(currentCamera, viewInfo.camera.fieldOfView);
			} else if (projectionType === sap.ve.dvl.DVLCAMERAPROJECTION.ORTHOGRAPHIC) {
				this._dvl.Camera.SetOrthoZoomFactor(currentCamera, viewInfo.camera.zoomFactor);
			}

			if (viewInfo.camera.position) {
				this._dvl.Camera.SetOrigin(currentCamera, viewInfo.camera.position.x, viewInfo.camera.position.y, viewInfo.camera.position.z);
			}

			if (viewInfo.camera.rotation) {
				this._dvl.Camera.SetRotation(currentCamera, viewInfo.camera.rotation.yaw, viewInfo.camera.rotation.pitch, viewInfo.camera.rotation.roll);
			}

			if (viewInfo.camera.bindingType) {
				var bindingType = dictionary.decodedBindingType[viewInfo.camera.bindingType] || sap.ve.dvl.DVLCAMERAFOVBINDING.MIN;
				this._dvl.Camera.SetFOVBinding(currentCamera, bindingType);
			}

			flyToDuration = flyToDuration || 0;

			// activating the camera
			this._dvl.Renderer.ActivateCamera(this._dvlRendererId, currentCamera, flyToDuration);
			// removing the camera that we created from the memory
			this._dvl.Scene.DeleteNode(this._dvlSceneRef, currentCamera);
		}

		if (viewInfo.viewMatrix) {
			this._matView = viewInfo.viewMatrix.slice();
		}

		if (viewInfo.projectionMatrix) {
			this._matProj = viewInfo.projectionMatrix.slice();
		}

		// restoring the visibility state
		if (viewInfo.visibility) {
			var nodeHierarchy = this._viewStateManager.getNodeHierarchy(),
				veIdToNodeRefMap = new Map(),
				allNodeRefs = nodeHierarchy.findNodesByName();

			allNodeRefs.forEach(function(nodeRef) {
				// create node proxy based on dynamic node reference
				var nodeProxy = nodeHierarchy.createNodeProxy(nodeRef),
					// get the VE_LOCATOR ve id
					veId = jQuery.grep(nodeProxy.getVeIds(), function(veId) {
						return veId.type === "VE_LOCATOR";
					});
				veId = Array.isArray(veId) && veId.length > 0 ? veId[0].fields[0].value : null;
				// destroy the node proxy
				nodeHierarchy.destroyNodeProxy(nodeProxy);
				if (veId) {
					// push the ve id to either visible/hidden array
					veIdToNodeRefMap.set(veId, nodeRef);
				}
			});

			switch (viewInfo.visibility.mode) {
				case VisibilityMode.Complete:
					var visibleVeIds = viewInfo.visibility.visible,
						hiddenVeIds = viewInfo.visibility.hidden;

					visibleVeIds.forEach(function(veId) {
						this._viewStateManager.setVisibilityState(veIdToNodeRefMap.get(veId), true, false);
					}, this);

					hiddenVeIds.forEach(function(veId) {
						this._viewStateManager.setVisibilityState(veIdToNodeRefMap.get(veId), false, false);
					}, this);

					break;

				case VisibilityMode.Differences:
					if (shouldResetVisibility) {
						this.resetView({
							camera: false,
							visibility: true,
							transition: false
						});
					}
					viewInfo.visibility.changes.forEach(function(veId) {
						var nodeRef = veIdToNodeRefMap.get(veId);
						// reverting the visibility for this particular node
						if (nodeRef) {
							this._viewStateManager.setVisibilityState(nodeRef, !this._viewStateManager.getVisibilityState(nodeRef), false);
						}
					}, this);

					break;

				default:
					Log.error(getResourceBundle().getText(Messages.VIT28.summary), Messages.VIT28.code, "sap.ui.vk.dvl.Viewport");
					break;
			}
		}

		return this;
	};

	/**
	 * Set selection rectangle for rendering
	 *
	 * @param {object} rect coordinates of selection rectangle
	 * @public
	 */
	Viewport.prototype.setSelectionRect = function(rect) {
		if (!rect) {
			this._dvl.Renderer.DrawSelectionRect(0, 0, 0, 0, this._dvlRendererId);
		} else {
			var p1 = this._toDvlRendererCoord(rect.x1, rect.y1);
			var p2 = this._toDvlRendererCoord(rect.x2, rect.y2);
			this._dvl.Renderer.DrawSelectionRect(p1.x, p1.y, p2.x, p2.y, this._dvlRendererId);
		}
	};

	/**
	 * Gets position and size of the viewport square.
	 * The information can be used for making calculations when restoring Redlining elements.
	 * @returns {object} The information in this object:
	 *   <ul>
	 *     <li><b>left</b> - The x coordinate of the top-left corner of the square.</li>
	 *     <li><b>top</b> - The y coordinate of the top-left corner of the square.</li>
	 *     <li><b>sideLength</b> - The length of the square.</li>
	 *   </ul>
	 * @public
	 */
	Viewport.prototype.getOutputSize = function() {
		var bindingType = this.getViewInfo().camera.bindingType,
			boundingClientRect = this.getDomRef().getBoundingClientRect(),
			// The height and width of the sap.ui.vk.Viewport() control
			viewportWidth = boundingClientRect.width,
			viewportHeight = boundingClientRect.height,
			// relevantDimension is either viewportWidth or viewportHeight,
			// depending which of them drives the viewport output size when resizing
			relevantDimension;

		switch (dictionary.decodedBindingType[bindingType]) {
			case sap.ve.dvl.DVLCAMERAFOVBINDING.MIN:
				relevantDimension = Math.min(viewportWidth, viewportHeight);
				break;
			case sap.ve.dvl.DVLCAMERAFOVBINDING.MAX:
				relevantDimension = Math.max(viewportWidth, viewportHeight);
				break;
			case sap.ve.dvl.DVLCAMERAFOVBINDING.HORZ:
				relevantDimension = viewportWidth;
				break;
			case sap.ve.dvl.DVLCAMERAFOVBINDING.VERT:
				relevantDimension = viewportHeight;
				break;
			default:
				break;
		}

		return {
			left: (viewportWidth - relevantDimension) / 2,
			top: (viewportHeight - relevantDimension) / 2,
			sideLength: relevantDimension
		};
	};

	Viewport.prototype.onBeforeRendering = function() {
		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}

		// this._updateContentConnector();
	};

	Viewport.prototype.onAfterRendering = function() {
		var domRef = this.getDomRef();
		if (this._canvas) {
			domRef.appendChild(this._canvas);
		}
		this._resizeListenerId = ResizeHandler.register(this, this._handleResize.bind(this));
		this._handleResize({
			size: {
				width: domRef.clientWidth,
				height: domRef.clientHeight
			}
		});
	};

	/**
	 * Handles the resize events from the {@link sap.ui.core.ResizeHandler ResizeHandler} object.
	 * @param {jQuery.Event} event The event object.
	 * @returns {boolean} Returns <code>true</code>, unless the <code>if</code> statement inside the method is false which causes the method to return <code>undefined</code>.
	 * @private
	 */
	Viewport.prototype._handleResize = function(event) {
		if (this._dvlRendererId && this._canvas) {
			var drawingBufferWidth = event.size.width * window.devicePixelRatio;
			var drawingBufferHeight = event.size.height * window.devicePixelRatio;

			if (this._matProj) {
				var px = this._matProj[0];
				var py = this._matProj[5];
				var pmax = Math.max(px, py);
				if (drawingBufferWidth > drawingBufferHeight) {
					px = pmax * drawingBufferHeight / drawingBufferWidth;
					py = pmax;
				} else {
					px = pmax;
					py = pmax * drawingBufferWidth / drawingBufferHeight;
				}
				this._matProj[8] *= px / this._matProj[0];
				this._matProj[9] *= py / this._matProj[5];
				this._matProj[0] = px;
				this._matProj[5] = py;
			}

			var dpi = 96 * window.devicePixelRatio;
			var outputSettings = this.getAggregation("outputSettings");
			this._gestureRatio = 1.0;
			// Viewport size and DPI override if output size is enabled
			if (this.getKeepOutputSize() && outputSettings && outputSettings.getDpi() > 0) {
				var width = outputSettings.getWidth() / 25.4 * dpi;
				var height = outputSettings.getHeight() / 25.4 * dpi;
				var wratio = width / drawingBufferWidth;
				var hratio = height / drawingBufferHeight;
				var ratio = (wratio > hratio) ? wratio : hratio;
				drawingBufferWidth *= ratio;
				drawingBufferHeight *= ratio;
				this._gestureRatio = ratio;
			}

			this._dvl.Renderer.SetDimensions(drawingBufferWidth, drawingBufferHeight, this._dvlRendererId);
			this._dvl.Renderer.SetOptionF(sap.ve.dvl.DVLRENDEROPTIONF.DVLRENDEROPTIONF_DPI, dpi, this._dvlRendererId);
			// set the minimum visible object size to 1px instead of 4px by default
			this._dvl.Renderer.SetOptionF(sap.ve.dvl.DVLRENDEROPTIONF.DVLRENDEROPTIONF_MIN_VISIBLE_OBJECT_SIZE, 1, this._dvlRendererId);
			this._canvas.width = drawingBufferWidth;
			this._canvas.height = drawingBufferHeight;
			// Using explicit sizes in pixels instead of CSS value "100%" reduces visual artifacts (stretching) when resizing the viewport via UI.
			this._canvas.style.width = event.size.width + "px";
			this._canvas.style.height = event.size.height + "px";

			this.fireResize({
				size: {
					width: event.size.width,
					height: event.size.height
				}
			});

			return true;
		}
	};

	Viewport.prototype._onVisibilityChanged =
		Viewport.prototype._onSelectionChanged =
		Viewport.prototype._onOpacityChanged =
		Viewport.prototype._onTintColorChanged =
		function(event) {
			if (this._dvlRendererId) {
				// Set the flag that viewport needs to be re-rendered.
				this._dvl.Renderer.ForceRenderFrame(this._dvlRendererId);
			}
		};

	/**
	 * @param {any|any[]} nodeRefs The node reference or the array of node references that we want to tint.
	 * @param {boolean} show Whether to highlight the nodes or remove the highlight.
	 * @param {int|sap.ui.core.CSSColor} color The color to use for highlighting the nodes passed as argument.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewport.prototype.showHotspots = function(nodeRefs, show, color) {
		var setTintColor = sap.ui.vk.dvl.NodeProxy.prototype[typeof color === "string" ? "setTintColor" : "setTintColorABGR"];
		// this function creates a node proxy based on the node reference and then changes its tint
		var setNodeProxyTintColor = function(nodeHierarchy, color, nodeRef) {
			var nodeProxy = nodeHierarchy.createNodeProxy(nodeRef);
			setTintColor.call(nodeProxy, color);
			nodeHierarchy.destroyNodeProxy(nodeProxy);
		};

		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		// if the highlight color is not passed as argument, we use the default hightlight color
		var highlightColor = color === undefined ? this.getHotspotColorABGR() : color;

		// if show is falsy, we remove the highlight (which means highlight color becomes 0)
		if (!show) {
			highlightColor = 0;
		}

		var nodeHierarchy = this._viewStateManager.getNodeHierarchy();

		if (this._isSmart2DContent()) {
			// When we tint the hotspots, we have to tint their children as-well.
			var children = [];
			nodeRefs.forEach(function(nodeRef) {
				var nodeChildren = getJSONObject(this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_CHILDREN).ChildNodes);
				Array.prototype.push.apply(children, nodeChildren);
			}.bind(this));

			// joining together the nodes to be tinted and their children
			Array.prototype.push.apply(children, nodeRefs);

			// Tinting the nodes
			children.forEach(setNodeProxyTintColor.bind(null, nodeHierarchy, highlightColor));
		} else {

			var descendants = [];
			var getAllDescendants = function(nodeRef) {
				// Getting children of the node
				var children = nodeHierarchy.getChildren(nodeRef);
				// Adding the children to the list of nodes to be tinted
				Array.prototype.push.apply(descendants, children);
				// collecting children recursively
				children.forEach(getAllDescendants);
			};
			nodeRefs.forEach(getAllDescendants);

			// Tinting all the node references that were passed as argument together with their descendants
			Array.prototype.push.apply(descendants, nodeRefs);
			descendants.forEach(setNodeProxyTintColor.bind(null, nodeHierarchy, highlightColor));
		}

		return this;
	};

	/**
	 * @param {number} integerColor The ABGR integer format (with 0x prefix) color to be decomposed into RGBA. For example,
	 * 0xFF00FF00 stands for prefix (0x) + 100% opacity (FF) + 0% red (00) + 100% green (FF) + 0% blue (00) .
	 * @returns {object} Object whose properties are the red, green, blue and alpha components in a 0-1 format.
	 * @private
	 */
	Viewport.prototype._getDecomposedABGR = function(integerColor) {
		return {
			red: (integerColor >>> 0 & 0xff) / 255,
			green: (integerColor >>> 8 & 0xff) / 255,
			blue: (integerColor >>> 16 & 0xff) / 255,
			alpha: (integerColor >>> 24 & 0xff) / 255
		};
	};

	/**
	 * It retrieves the current background colors from the public properties and it applies them via DVL Renderer.
	 * @private
	 */
	Viewport.prototype._setBackgroundColor = function() {
		if (this._dvl) {
			var top = this._getDecomposedABGR(this.getBackgroundColorTopABGR()),
				bottom = this._getDecomposedABGR(this.getBackgroundColorBottomABGR());
			this._dvl.Renderer.SetBackgroundColor(top.red, top.green, top.blue, top.alpha, bottom.red, bottom.green, bottom.blue, bottom.alpha, this._dvlRendererId);
		}
	};

	/**
	 * Sets the background color for the top area of the Viewport.
	 * @param {int} integerColor Takes an integer value as parameter.
	 * For example: 0xffffffff as hexadecimal value (0x prefix, FF alpha, FF blue, FF green, FF red)
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewport.prototype.setBackgroundColorTopABGR = function(integerColor) {
		this.setProperty("backgroundColorTopABGR", integerColor, true);
		// applying the background color
		this._setBackgroundColor();
		return this;
	};

	Viewport.prototype.setBackgroundColorTop = function(value) {
		this.setProperty("backgroundColorTop", value, true);
		return this.setBackgroundColorTopABGR(colorToABGR(cssColorToColor(value)));
	};

	/**
	 * Sets the background color for the bottom area of the Viewport.
	 * @param {int} integerColor Takes an integer value as parameter.
	 * For example: 0xffffffff as hexadecimal value (0x prefix, FF alpha, FF blue, FF green, FF red)
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewport.prototype.setBackgroundColorBottomABGR = function(integerColor) {
		this.setProperty("backgroundColorBottomABGR", integerColor, true);
		// applying the background color
		this._setBackgroundColor();
		return this;
	};

	Viewport.prototype.setBackgroundColorBottom = function(value) {
		this.setProperty("backgroundColorBottom", value, true);
		return this.setBackgroundColorBottomABGR(colorToABGR(cssColorToColor(value)));
	};

	Viewport.prototype.setKeepOutputSize = function(value) {
		this.setProperty("keepOutputSize", value);
		this._updateViewportSize();
	};

	Viewport.prototype.setOutputSettings = function(outputSettings) {
		this.setAggregation("outputSettings", outputSettings);
		this._updateViewportSize();
	};

	Viewport.prototype._updateViewportSize = function() {
		var domRef = this.getDomRef();
		if (domRef) {
			this._handleResize({
				size: {
					width: domRef.clientWidth,
					height: domRef.clientHeight
				}
			});
		}
	};

	////////////////////////////////////////////////////////////////////////
	// 3D Rendering handling begins.

	/**
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @protected
	 */
	Viewport.prototype.setShouldRenderFrame = function() {
		if (this._dvlRendererId) {
			// Set the flag that viewport needs to be re-rendered.
			this._dvl.Renderer.ForceRenderFrame(this._dvlRendererId);
		}
		return this;
	};

	/**
	 * @returns {boolean} It returns <code>true</code> or <code>false</code> whether the frame should be rendered or not.
	 */
	Viewport.prototype.shouldRenderFrame = function() {
		return this._dvlRendererId && this._dvl.Renderer.ShouldRenderFrame(this._dvlRendererId);
	};

	function lerp(a, b, f) {
		return a + (b - a) * f;
	}

	function smootherStep(edge0, edge1, x) {
		// Scale, and clamp x to 0..1 range
		x = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0.0), 1.0);
		// Evaluate polynomial
		return x * x * x * (x * (x * 6 - 15) + 10);
	}

	Viewport.prototype._updateRedlineZoomToAnimation = function() {
		var anim = this._anim;
		var startProjRect = anim.startProjRect;
		var endProjRect = anim.endProjRect;
		var f = Math.min(smootherStep(0, 1, (Date.now() - anim.startTime) / anim.duration), 1);
		var projRect = {
			left: lerp(startProjRect.left, endProjRect.left, f),
			right: lerp(startProjRect.right, endProjRect.right, f),
			top: lerp(startProjRect.top, endProjRect.top, f),
			bottom: lerp(startProjRect.bottom, endProjRect.bottom, f)
		};
		if (this._redlineHandler) {
			var prevProjRect = anim.currentProjRect;
			var pcx = (prevProjRect.left + prevProjRect.right) * 0.5;
			var pcy = (prevProjRect.top + prevProjRect.bottom) * 0.5;
			var ncx = (projRect.left + projRect.right) * 0.5;
			var ncy = (projRect.top + projRect.bottom) * 0.5;
			var domRef = this.getDomRef();
			var dx = (pcx - ncx) * domRef.clientWidth / (prevProjRect.right - prevProjRect.left);
			var dy = (pcy - ncy) * domRef.clientHeight / (prevProjRect.bottom - prevProjRect.top);
			this._redlineHandler.pan(dx, dy);
			this._redlineHandler.zoom((prevProjRect.right - prevProjRect.left) / (projRect.right - projRect.left), domRef.clientWidth * 0.5, domRef.clientHeight * 0.5);
			anim.currentProjRect = projRect;
		}
		setProjectionRect(this._matProj, projRect);
		if (f >= 1) {
			delete this._anim;
		}
	};

	/**
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	Viewport.prototype.renderFrame = function() {
		if (this._dvlRendererId) {
			if (this._matView && this._matProj) {
				if (this._anim) {
					this._updateRedlineZoomToAnimation();
				}
				this.renderFrameEx(this._matView, this._matProj, this._dvlRendererId);
				if (this._anim) {
					this.setShouldRenderFrame();
				}
			} else {
				this._dvl.Renderer.RenderFrame(this._dvlRendererId);
			}
		}
		return this;
	};

	/**
	 * @param {array} viewMatrix The <code>viewMatrix</code> array.
	 * @param {array} projectionMatrix The <code>projectionMatrix</code> array.
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	Viewport.prototype.renderFrameEx = function(viewMatrix, projectionMatrix) {
		if (this._dvlRendererId) {
			this._dvl.Renderer.RenderFrameEx.apply(this, [].concat(viewMatrix, projectionMatrix), this._dvlRendererId);
		}
		return this;
	};

	/**
	 * @param {object} resetOptions An object which is used for configuring the 'resetView' method.<br>
	 * It has three properties: <br>
	 <ul>
		<li> camera: boolean (defaults to true) - whether to reset the camera position to the initial state </li>
		<li> visibility: boolean (defaults to false) - whether to reset the visibility state to the default state </li>
		<li> transition: boolean (defaults to true) - whether to use transition or not when performing the reset </li>
	 </ul>
	 * @returns {sap.ui.vk.Viewport} this
	 */
	Viewport.prototype.resetView = function(resetOptions) {
		// if 'resetOptions' is defined, it has to be an object
		if (resetOptions !== undefined && !jQuery.isPlainObject(resetOptions)) {
			Log.error(getResourceBundle().getText(Messages.VIT31.summary), Messages.VIT31.code, "sap.ui.vk.dvl.Viewport");
		}

		// default options
		var options = {
			camera: true,
			transition: true,
			visibility: false
		};
		// attaching the options passed as argument to the default options
		jQuery.extend(options, resetOptions);

		// we perform the reset only if we need to reset the camera or the visibility
		if (options.camera || options.visibility) {

			var dvlOption = (options.camera ? sap.ve.dvl.DVLRESETVIEWFLAG.CAMERA : 0)
				| (options.transition ? sap.ve.dvl.DVLRESETVIEWFLAG.SMOOTHTRANSITION : 0)
				| (options.visibility ? sap.ve.dvl.DVLRESETVIEWFLAG.VISIBILITY : 0);

			if (this._dvlRendererId) {
				this._dvl.Renderer.ResetView(dvlOption, this._dvlRendererId);
				this._lastPlayedStep = null;
			}
		}
		return this;
	};

	/**
	 * @param {any} nodeRef The ID of the node to check.
	 * @returns {sap.ui.vk.Viewport} this
	 */
	Viewport.prototype.canIsolateNode = function(nodeRef) {
		if (this._dvlRendererId) {
			return this._dvl.Renderer.CanIsolateNode(nodeRef, this._dvlRendererId);
		} else {
			return false;
		}
	};

	/**
	 * @param {string} nodeId The ID of the node that we want to set as isolated.
	 * @returns {sap.ui.vk.Viewport} this
	 */
	Viewport.prototype.setIsolatedNode = function(nodeId) {
		if (this._dvlRendererId) {
			this._dvl.Renderer.SetIsolatedNode(nodeId, this._dvlRendererId);
		}
		return this;
	};

	/**
	 * @returns {string} The ID of the node that is currently set as isolated.
	 * @public
	 */
	Viewport.prototype.getIsolatedNode = function() {
		if (this._dvlRendererId) {
			return this._dvl.Renderer.GetIsolatedNode(this._dvlRendererId);
		} else {
			return sap.ve.dvl.DVLID_INVALID;
		}
	};

	Viewport.prototype._toDvlRendererCoord = function(x, y) {
		if (this._matProj) {
			var domRef = this.getDomRef();
			var r1 = getProjectionRect(this._matProj);
			var r2 = getProjectionRect(this._dvl.Renderer.GetCameraMatrices().projection);
			var rx = r1.left + (r1.right - r1.left) * (x / domRef.clientWidth);
			var ry = r1.top + (r1.bottom - r1.top) * (y / domRef.clientHeight);
			x = ((rx - r2.left) / (r2.right - r2.left)) * domRef.clientWidth;
			y = ((ry - r2.top) / (r2.bottom - r2.top)) * domRef.clientHeight;
		}
		return { x: x * window.devicePixelRatio * this._gestureRatio, y: y * window.devicePixelRatio * this._gestureRatio };
	};

	/**
	 * Performs a screen-space hit test and gets the hit node reference, it must be called between beginGesture() and endGesture()
	 *
	 * @param {int} x: x coordinate in viewport to perform hit test
	 * @param {int} y: y coordinate in viewport to perform hit test
	 * @returns {string} The ID of the node that is under the viewport coordinates (x, y).
	 */
	Viewport.prototype.hitTest = function(x, y) {
		if (this._dvlRendererId) {
			var p = this._toDvlRendererCoord(x, y);
			var result = this._dvl.Renderer.HitTest(p.x, p.y, this._dvlRendererId).id;
			this.setShouldRenderFrame();
			return result;
		} else {
			return null;
		}
	};

	Viewport.prototype.setShowDebugInfo = function(value) {
		this.setProperty("showDebugInfo", value, true);
		if (this._dvlRendererId) {
			this._dvl.Renderer.SetOption(sap.ve.dvl.DVLRENDEROPTION.DVLRENDEROPTION_SHOW_DEBUG_INFO, value, this._dvlRendererId);
		}
		return this;
	};

	Viewport.prototype._handleFrameFinished = function(parameters) {
		if (parameters.rendererId === this._dvlRendererId) {
			this.fireFrameRenderingFinished();
		}
	};

	// 3D Rendering handling ends.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Gesture handling ends.

	/**
	 * Marks the start of the current gesture operation.
	 *
	 * @param {int} x The x-coordinate of the gesture.
	 * @param {int} y The y-coordinate of the gesture.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.beginGesture = function(x, y) {
		if (this._dvlRendererId) {
			this._gesturePoint = { x: x, y: y };
			var p = this._toDvlRendererCoord(x, y);
			this._dvl.Renderer.BeginGesture(p.x, p.y, this._dvlRendererId);
		}
		return this;
	};

	/**
	 * Marks the end of the current gesture operation.
	 *
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.endGesture = function() {
		if (this._dvlRendererId) {
			this._dvl.Renderer.EndGesture(this._dvlRendererId);
		}
		return this;
	};

	Viewport.prototype._activateRedline = function() {
		this.renderFrame();
		var matrices = this._dvl.Renderer.GetCameraMatrices();
		this._matView = matrices.view;
		this._matProj = matrices.projection;
	};

	Viewport.prototype._deactivateRedline = function() {
		this._matView = null;
		this._matProj = null;
	};

	/**
	 * Performs a <code>pan</code> gesture to pan across the Viewport.
	 *
	 * @param {int} dx The change in distance along the x-coordinate.
	 * @param {int} dy The change in distance along the y-coordinate.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.pan = function(dx, dy) {
		if (this._dvlRendererId && !this.getFreezeCamera()) {
			if (this._redlineHandler) {
				this._redlineHandler.pan(dx, dy);
			}
			if (this._matProj) {
				var size = this.getDomRef();
				this._matProj[8] -= dx * 2 / size.clientWidth;
				this._matProj[9] += dy * 2 / size.clientHeight;
				this.setShouldRenderFrame();
			} else {
				this._dvl.Renderer.Pan(dx * window.devicePixelRatio * this._gestureRatio, dy * window.devicePixelRatio * this._gestureRatio, this._dvlRendererId);
			}
			this.firePan({
				dx: dx,
				dy: dy
			});
		}
		return this;
	};

	/**
	 * Rotates the content resource displayed on the Viewport.
	 *
	 * @param {int} dx The change in x-coordinate used to define the desired rotation.
	 * @param {int} dy The change in y-coordinate used to define the desired rotation.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.rotate = function(dx, dy) {
		if (this._dvlRendererId && !this.getFreezeCamera()) {
			if (this._redlineHandler) {
				return this.pan(dx, dy);
			}

			this._dvl.Renderer.Rotate(dx * window.devicePixelRatio * this._gestureRatio, dy * window.devicePixelRatio * this._gestureRatio, this._dvlRendererId);
			this.fireRotate({
				dx: dx,
				dy: dy
			});
		}
		return this;
	};

	function getProjectionRect(matProj) {
		// calculate projection rectangle from projection matrix
		var isOrthographic = matProj[15] === 1;
		var rightMinusLeft = 2 / matProj[0];
		var topMinusBottom = 2 / matProj[5];
		var rightPlusLeft, topPlusBottom;
		if (isOrthographic) {
			rightPlusLeft = -matProj[12] * rightMinusLeft;
			topPlusBottom = -matProj[13] * topMinusBottom;
		} else {
			rightPlusLeft = matProj[8] * rightMinusLeft;
			topPlusBottom = matProj[9] * topMinusBottom;
		}

		var right = (rightMinusLeft + rightPlusLeft) * 0.5;
		var left = rightPlusLeft - right;
		var top = (topMinusBottom + topPlusBottom) * 0.5;
		var bottom = topPlusBottom - top;
		return { left: left, top: top, right: right, bottom: bottom };
	}

	function setProjectionRect(matProj, rect) {
		var isOrthographic = matProj[15] === 1;
		// update projection matrix
		matProj[0] = 2 / (rect.right - rect.left);
		matProj[5] = 2 / (rect.top - rect.bottom);
		if (isOrthographic) {
			matProj[12] = -(rect.right + rect.left) / (rect.right - rect.left);
			matProj[13] = -(rect.top + rect.bottom) / (rect.top - rect.bottom);
		} else {
			matProj[8] = (rect.right + rect.left) / (rect.right - rect.left);
			matProj[9] = (rect.top + rect.bottom) / (rect.top - rect.bottom);
		}
	}

	/**
	 * Performs a <code>zoom</code> gesture to zoom in or out on the beginGesture coordinate.
	 * @param {float} dy Zoom factor. A scale factor that specifies how much to zoom in or out by.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.zoom = function(dy) {
		if (this._dvlRendererId && !this.getFreezeCamera()) {
			if (this._redlineHandler) {
				this._redlineHandler.zoom(dy);
			}
			if (this._matProj) {
				var size = this.getDomRef();
				var rect = getProjectionRect(this._matProj);
				var px = rect.left + (rect.right - rect.left) * this._gesturePoint.x / size.clientWidth;
				var py = rect.top + (rect.bottom - rect.top) * this._gesturePoint.y / size.clientHeight;
				var f = 1 / dy;
				rect.left = px + (rect.left - px) * f;
				rect.right = px + (rect.right - px) * f;
				rect.top = py + (rect.top - py) * f;
				rect.bottom = py + (rect.bottom - py) * f;
				setProjectionRect(this._matProj, rect);
				this.setShouldRenderFrame();
			} else {
				this._dvl.Renderer.Zoom(dy, this._dvlRendererId);
			}
			this.fireZoom({
				zoomFactor: dy
			});
		}
		return this;
	};

	/**
	 * Zooms the scene to a bounding box created from a particular set of nodes.
	 * @param {sap.ui.vk.ZoomTo|sap.ui.vk.ZoomTo[]} what What set of nodes to zoom to.
	 * @param {any} nodeRef Is only used if what == sap.ui.vk.ZoomTo.Node.
	 * @param {float} crossFadeSeconds Time to perform the "fly to" animation. Set to 0 to do this immediately.
	 * @param {float} margin Margin. Set to 0 to zoom to the entire screen.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.zoomTo = function(what, nodeRef, crossFadeSeconds, margin) {
		if (this._dvlRendererId) {
			var flags = 0;
			if (Array.isArray(what)) {
				for (var i in what) {
					flags |= dictionary.decodedZoomTo[what[i]];
				}
			} else {
				flags = dictionary.decodedZoomTo[what];
			}
			this._dvl.Renderer.ZoomTo(flags, nodeRef, crossFadeSeconds, margin, this._dvlRendererId);
		}
		return this;
	};

	Viewport.prototype._redlineZoomTo = function(nodeRef) {
		var rect = [Infinity, Infinity, -Infinity, -Infinity];
		if (nodeRef !== sap.ve.dvl.DVLID_INVALID) {
			var bbox = this._dvl.Scene.RetrieveNodeInfo(this._dvlSceneRef, nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_BBOX).bbox;
			var matWorld = this._dvl.Scene.GetNodeWorldMatrix(this._dvlSceneRef, nodeRef).matrix;
			if (bbox && matWorld) {
				var vec3 = glMatrix.vec3, mat4 = glMatrix.mat4;
				var matViewProj = mat4.multiply(mat4.create(), this._matProj, this._matView);
				var matWorldViewProj = mat4.multiply(mat4.create(), matViewProj, matWorld);
				var min = bbox.min, max = bbox.max;

				[
					vec3.fromValues(min[0], min[1], min[2]),
					vec3.fromValues(max[0], max[1], max[2]),
					vec3.fromValues(min[0], min[1], max[2]),
					vec3.fromValues(min[0], max[1], max[2]),
					vec3.fromValues(max[0], min[1], max[2]),
					vec3.fromValues(max[0], max[1], min[2]),
					vec3.fromValues(min[0], max[1], min[2]),
					vec3.fromValues(max[0], min[1], min[2])
				].forEach(function(p) {
					vec3.transformMat4(p, p, matWorldViewProj);
					if (p[2] > 0) {
						rect[0] = Math.min(rect[0], p[0]);
						rect[1] = Math.min(rect[1], p[1]);
						rect[2] = Math.max(rect[2], p[0]);
						rect[3] = Math.max(rect[3], p[1]);
					}
				});
			}
		}

		var projRect = getProjectionRect(this._matProj);
		this._anim = {
			startTime: Date.now(),
			duration: 500,
			startProjRect: projRect,
			currentProjRect: projRect
		};

		if (rect[2] > rect[0] && rect[3] > rect[1]) {
			var startProjRect = this._anim.startProjRect;
			var cx = lerp(startProjRect.left, startProjRect.right, (rect[0] + rect[2]) * 0.25 + 0.5);
			var cy = lerp(startProjRect.top, startProjRect.bottom, (rect[3] + rect[1]) * -0.25 + 0.5);
			var zoom = Math.max(rect[2] - rect[0], rect[3] - rect[1]) * 0.5;
			var hw = (startProjRect.right - startProjRect.left) * 0.5 * zoom;
			var hh = (startProjRect.top - startProjRect.bottom) * 0.5 * zoom;
			this._anim.endProjRect = {
				left: cx - hw,
				top: cy + hh,
				right: cx + hw,
				bottom: cy - hh
			};
		} else {
			this._anim.endProjRect = getProjectionRect(this._dvl.Renderer.GetCameraMatrices().projection);
		}

		this.setShouldRenderFrame();
	};

	/**
	 * Executes a click or tap gesture.
	 *
	 * @param {int} x The tap gesture's x-coordinate.
	 * @param {int} y The tap gesture's y-coordinate.
	 * @param {boolean} isDoubleClick Indicates whether the tap gesture should be interpreted as a double-click. A value of <code>true</code> indicates a double-click gesture, and <code>false</code> indicates a single click gesture.
	 * @returns {sap.ui.vk.dvl.Viewport} this
	 * @public
	 */
	Viewport.prototype.tap = function(x, y, isDoubleClick) {
		if (this._dvlRendererId) {
			var p = this._toDvlRendererCoord(x, y), node;
			if (!isDoubleClick) {
				node = this.hitTest(x, y); // NB: pass (x, y) in CSS pixels, hitTest will convert them to device pixels.
				var parameters = {
					picked: node === sap.ve.dvl.DVLID_INVALID || node == null ? [] : [node]
				};
				this.fireNodesPicked(parameters);

				if (this.getSelectionMode() === SelectionMode.Exclusive) {
					this.exclusiveSelectionHandler(parameters.picked);
				} else if (this.getSelectionMode() === SelectionMode.Sticky) {
					this.stickySelectionHandler(parameters.picked);
				}

				if (node !== sap.ve.dvl.DVLID_INVALID) {
					this.fireNodeClicked({ nodeRef: node, nodeId: node, x: x, y: y }, true, true);
				}
				this._dvl.Renderer.Tap(p.x, p.y, false, false, this._dvlRendererId);
			} else if (!this.getFreezeCamera()) {
				if (this._matView && this._matProj) {
					node = this.hitTest(x, y); // NB: pass (x, y) in CSS pixels, hitTest will convert them to device pixels.
					this._redlineZoomTo(node);
				} else {
					this._dvl.Renderer.Tap(p.x, p.y, true, false, this._dvlRendererId);
				}
			}
		}
		return this;
	};

	/**
	 * Executes a rectangular selection.
	 *
	 * @param {int} x1 The x-coordinate of starting vertex of selection rectangle.
	 * @param {int} y1 The y-coordinate of starting vertex of selection rectangle.
	 * @param {int} x2 The x-coordinate of ending vertex of selection rectangle.
	 * @param {int} y2 The y-coordinate of ending vertex of selection rectangle.
	 * @returns {any[]} The array of node references that are selected.
	 * @public
	 */
	Viewport.prototype.rectSelect = function(x1, y1, x2, y2) {
		var nodes = [];
		if (this._dvlRendererId) {
			var p1 = this._toDvlRendererCoord(x1, y1);
			var p2 = this._toDvlRendererCoord(x2, y2);
			var result = getJSONObject(this._dvl.Renderer.RectSelect(p1.x, p1.y, p2.x, p2.y, this._dvlRendererId));
			if (result.SelectedNodes) {
				nodes = result.SelectedNodes;
			}
		}
		return nodes;
	};

	/**
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.queueCommand = function(command) {
		if (this._dvlRendererId) {
			this._dvl.Renderer._queueCommand(command, this._dvlRendererId);
		}
		return this;
	};

	// Gesture handling ends.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Content connector handling begins.

	// Overridden sap.ui.vk.ViewportBase#_setContent.
	Viewport.prototype._setContent = function(content) {
		basePrototype._setContent.apply(this, arguments);

		var scene = null;
		if (content && content instanceof Scene) {
			// initializeDictionary();
			scene = content;
		}
		this._setScene(scene);
		return this;
	};


	Viewport.prototype._setScene = function(scene) {
		var graphicsCore = scene && scene.getGraphicsCore();
		this.setGraphicsCore(graphicsCore);
		this.setScene(scene);
		if (scene && (this._isSmart2DContent() || this._isSmart2DContentLegacy())) {
			this._initializeSmart2DHandler();
		}
	};

	Viewport.prototype.onSetContentConnector = function(contentConnector) {
		ViewportBase.prototype.onSetContentConnector.call(this, contentConnector);
		contentConnector.attachContentChangesFinished(this._onContentChangesFinished, this);
	};

	Viewport.prototype.onUnsetContentConnector = function(contentConnector) {
		contentConnector.detachContentChangesFinished(this._onContentChangesFinished, this);
		ViewportBase.prototype.onUnsetContentConnector.call(this, contentConnector);
	};

	Viewport.prototype._onContentChangesFinished = function(event) {
		if (event.getSource().getContentResources().length > 1) {
			this.zoomTo(ZoomTo.Visible, sap.ve.dvl.DVLID_INVALID, 0, 0);
		}
		this.setShouldRenderFrame();
	};

	// Content connector handling ends.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// View state manager handling begins.

	Viewport.prototype.onSetViewStateManager = function(viewStateManager) {
		this._viewStateManager = viewStateManager;
		viewStateManager.attachOpacityChanged(this._onOpacityChanged, this);
		viewStateManager.attachSelectionChanged(this._onSelectionChanged, this);
		viewStateManager.attachTintColorChanged(this._onTintColorChanged, this);
		viewStateManager.attachVisibilityChanged(this._onVisibilityChanged, this);
		if (this._dvl) {
			this._dvl.Renderer.SetViewStateManager(viewStateManager, this._dvlRendererId);

			if (this._isSmart2DContent() || this._isSmart2DContentLegacy()) {
				this._initializeSmart2DHandler();
			}
		}
	};

	Viewport.prototype.onUnsetViewStateManager = function(viewStateManager) {
		if (this._dvl) {
			this._dvl.Renderer.SetViewStateManager(null, this._dvlRendererId);
		}
		viewStateManager.detachOpacityChanged(this._onOpacityChanged, this);
		viewStateManager.detachSelectionChanged(this._onSelectionChanged, this);
		viewStateManager.detachTintColorChanged(this._onTintColorChanged, this);
		viewStateManager.detachVisibilityChanged(this._onVisibilityChanged, this);
		this._viewStateManager = null;
	};

	// View state manager handling ends.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Keyboard handling begins.

	var offscreenPosition = { x: -2, y: -2 };
	var rotateDelta = 2;
	var panDelta = 5;

	[
		{ key: "left", dx: -rotateDelta, dy: 0 },
		{ key: "right", dx: +rotateDelta, dy: 0 },
		{ key: "up", dx: 0, dy: -rotateDelta },
		{ key: "down", dx: 0, dy: +rotateDelta }
	].forEach(function(item) {
		Viewport.prototype["onsap" + item.key] = function(event) {
			this.beginGesture(offscreenPosition.x, offscreenPosition.y);
			this.rotate(item.dx, item.dy);
			this.endGesture();
			this.setShouldRenderFrame();
			event.preventDefault();
			event.stopPropagation();
		};
	});

	[
		{ key: "left", dx: -panDelta, dy: 0 },
		{ key: "right", dx: +panDelta, dy: 0 },
		{ key: "up", dx: 0, dy: -panDelta },
		{ key: "down", dx: 0, dy: +panDelta }
	].forEach(function(item) {
		Viewport.prototype["onsap" + item.key + "modifiers"] = function(event) {
			if (event.shiftKey && !(event.ctrlKey || event.altKey || event.metaKey)) {
				this.beginGesture(offscreenPosition.x, offscreenPosition.y);
				this.pan(item.dx, item.dy);
				this.endGesture();
				this.setShouldRenderFrame();
				event.preventDefault();
				event.stopPropagation();
			}
		};
	});

	[
		{ key: "minus", d: 0.98 },
		{ key: "plus", d: 1.02 }
	].forEach(function(item) {
		Viewport.prototype["onsap" + item.key] = function(event) {
			this.beginGesture(this.$().width() / 2, this.$().height() / 2);
			this.zoom(item.d);
			this.endGesture();
			this.setShouldRenderFrame();
			event.preventDefault();
			event.stopPropagation();
		};
	});

	// Keyboard handling ends.
	////////////////////////////////////////////////////////////////////////

	return Viewport;
});
