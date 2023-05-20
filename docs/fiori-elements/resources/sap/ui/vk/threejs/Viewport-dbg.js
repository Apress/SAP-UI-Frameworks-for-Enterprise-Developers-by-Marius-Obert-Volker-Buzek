/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.threejs.Viewport.
sap.ui.define([
	"../Core",
	"../ViewportBase",
	"sap/ui/core/ResizeHandler",
	"sap/ui/events/KeyCodes",
	"../Loco",
	"../thirdparty/three",
	"../ViewStateManager",
	"./ViewportGestureHandler",
	"./OrthographicCamera",
	"./PerspectiveCamera",
	"./NodesTransitionHelper",
	"../Messages",
	"sap/ui/base/ManagedObjectObserver",
	"./ViewportRenderer",
	"../CameraProjectionType",
	"../CameraFOVBindingType",
	"../VisibilityMode",
	"../ZoomTo",
	"../SelectionMode",
	"../RenderMode",
	"../getResourceBundle",
	"../cssColorToColor",
	"../ViewStateManager",
	"./ViewStateManager",
	"./v2/ViewStateManager",
	"./HitTester",
	"./Scene",
	"./ContentDeliveryService",
	"./ThreeUtils",
	"../Annotation",
	"../measurements/Surface",
	"../NodeContentType",
	"sap/base/assert",
	"sap/base/Log",
	"sap/ui/core/Core",
	"../findIndexInArray"
], function(
	vkCore,
	ViewportBase,
	ResizeHandler,
	KeyCodes,
	Loco,
	THREE,
	ViewStateManager,
	ViewportGestureHandler,
	OrthographicCamera,
	PerspectiveCamera,
	NodesTransitionHelper,
	Messages,
	ManagedObjectObserver,
	ViewportRenderer,
	CameraProjectionType,
	CameraFOVBindingType,
	VisibilityMode,
	ZoomTo,
	SelectionMode,
	RenderMode,
	getResourceBundle,
	cssColorToColor,
	VkViewStateManager,
	ThreeJSViewStateManager,
	ThreeJSViewStateManagerV2,
	HitTester,
	Scene,
	ContentDeliveryService,
	ThreeUtils,
	Annotation,
	MeasurementSurface,
	NodeContentType,
	assert,
	Log,
	core,
	findIndexInArray
) {
	"use strict";

	/**
	 *  Constructor for a ThreeJs viewport.
	 *
	 * @class Provides a control for three.js canvas.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.ViewportBase
	 * @alias sap.ui.vk.threejs.Viewport
	 */
	var Viewport = ViewportBase.extend("sap.ui.vk.threejs.Viewport", /** @lends sap.ui.vk.threejs.Viewport.prototype  */ {
		metadata: {
			library: "sap.ui.vk",

			events: {
				cameraChanged: {
					parameters: {
						/**
						 * Returns a new camera position.
						 */
						position: "float[]",
						/**
						 * Returns a new camera rotation quaternion.
						 */
						quaternion: "float[]",
						/**
						 * Returns a new camera orthographic zoom factor.
						 */
						zoom: "float"
					},
					enableEventBubbling: true
				},
				frameRenderingFinished: {
				}
			}
		}
	});

	var basePrototype = Viewport.getMetadata().getParent().getClass().prototype;

	// Bug in three.js, original code: buffer[ offset ] = this.node[ this.propertyName ]
	THREE.PropertyBinding.prototype.GetterByBindingType[0] = function(buffer, offset) {

		buffer[offset] = this.targetObject[this.propertyName];
	};

	Viewport.prototype.init = function() {

		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		// An <svg> element to draw the measurements on.
		this._measurementSurface = new MeasurementSurface();

		// A THREE.WebGLRenderer which this viewport uses.
		this._renderer = null;

		// This canvas is used in methods `getImage`, `getMaterialImage`, `getObjectImage`.
		this._imageCanvas = null;

		// Either a 3D canvas element from `this._renderer` if there is only one viewport which renders the scene,
		// or a 2D canvas element otherwise, in which case the image is copied from `this._renderer` to
		// `this._canvas`.
		this._canvas = null;

		// A renderer registry entry associated with this viewport. See RegistryEntry definition in comments for
		// `registryEntries`.
		this._registryEntry = null;

		this._width = 1;
		this._height = 1;

		// this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		// this._renderer.setPixelRatio(window.devicePixelRatio);
		// this._renderer.setSize(1, 1); // set dummy size, resize event will correct this later
		// this._renderer.shadowMap.enabled = true;

		this._resizeListenerId = null;
		this._handleResize = this._handleResize.bind(this);
		this._renderLoopRequestId = 0;
		this._renderLoop = this._renderLoop.bind(this);
		this._shouldRenderFrame = true;
		this._shouldProcessHierarchy = true;
		this._shouldDoTraversalRendering = false;
		this._clippingPlanes = [];

		this._hitTester = new HitTester();

		this._scene = null;
		this._camera = new PerspectiveCamera();
		this._upAxis = 2; // (0 = +X, 1 = -X, 2 = +Y, 3 = -Y, 4 = +Z, 5 = -Z)

		var backgroundColorTop = new THREE.Vector4();
		var backgroundColorBottom = new THREE.Vector4();
		this._updateColor(backgroundColorTop, this.getBackgroundColorTop());
		this._updateColor(backgroundColorBottom, this.getBackgroundColorBottom());
		this._checkBackgroundColor();

		this._backgroundMaterial = new THREE.ShaderMaterial({
			uniforms: {
				topColor: { value: backgroundColorTop },
				bottomColor: { value: backgroundColorBottom }
			},

			vertexShader: [
				"varying float vPos;",
				"void main() {",
				"	gl_Position = vec4(position, 1.0);",
				"	vPos = position.y * -0.5 + 0.5;",
				"}"
			].join("\n"),

			fragmentShader: [
				"uniform vec4 topColor;",
				"uniform vec4 bottomColor;",
				"varying float vPos;",
				"void main() {",
				"	gl_FragColor = mix(topColor, bottomColor, vPos);",
				"}"
			].join("\n"),

			side: THREE.DoubleSide,
			depthTest: false,
			depthWrite: false,
			blending: THREE.NoBlending
		});

		this._backgroundCamera = new THREE.Camera();
		this._backgroundScene = new THREE.Scene();
		this._backgroundScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0, 1, 1), this._backgroundMaterial));

		this._underlayGroup = new THREE.Group();
		this._overlayGroup = new THREE.Group();

		this._xrayColor1 = new THREE.Vector4(0, 0.75, 1, 0.45);
		this._xrayColor2 = new THREE.Vector4(0, 0, 1, 0);
		this._xrayMaterial = new THREE.ShaderMaterial({
			uniforms: {
				color1: { value: this._xrayColor1 },
				color2: { value: this._xrayColor2 }
			},

			vertexShader: [
				"#include <clipping_planes_pars_vertex>",
				"varying vec3 vNormal;",
				"void main() {",
				"#include <beginnormal_vertex>", // beginnormal_vertex must be first, as it has cluster shader code
				"#include <defaultnormal_vertex>",
				"#include <begin_vertex>",
				"#include <project_vertex>",
				"#include <clipping_planes_vertex>",
				"	vNormal = normalize( transformedNormal );",
				"}"
			].join("\n"),

			fragmentShader: [
				"#include <clipping_planes_pars_fragment>",
				"uniform vec4 color1;",
				"uniform vec4 color2;",
				"varying vec3 vNormal;",
				"void main() {",
				"#include <clipping_planes_fragment>",
				"	gl_FragColor = mix(color1, color2, abs(normalize(vNormal).z));",
				"}"
			].join("\n"),

			side: THREE.DoubleSide,
			// depthTest: false,
			depthWrite: false,
			depthFunc: THREE.LessDepth,
			blending: THREE.NormalBlending,
			clipping: true,
			transparent: true
		});

		this._viewportGestureHandler = new ViewportGestureHandler(this);

		this._loco = new Loco(this);
		this._loco.addHandler(this._viewportGestureHandler, -1);

		this._zoomedObject = null;

		this._cdsLoader = null;

		this.attachCameraChanged(function(event) {
			this.setShouldRenderFrame(true);
		});

		// We'll use observer to detect scene changes in order to refresh screen
		this._sceneObserver = new ManagedObjectObserver(this.setShouldRenderFrame.bind(this));

		this._currentViewIndex = 0;
		this._currentView = null;

		vkCore.getEventBus().subscribe("sap.ui.vk", "viewStateApplied", this._onViewStateApplied, this);

		core.attachLocalizationChanged(this._onLocalizationChanged, this);
	};

	Viewport.prototype.cameraUpdateCompleted = function(params) {

		this.fireViewFinished({ viewIndex: this._currentViewIndex });
	};

	Viewport.prototype.exit = function() {
		core.detachLocalizationChanged(this._onLocalizationChanged, this);
		vkCore.getEventBus().unsubscribe("sap.ui.vk", "viewStateApplied", this._onViewStateApplied, this);

		this._measurementSurface.destroy();
		this._measurementSurface = null;

		this._loco.removeHandler(this._viewportGestureHandler);
		this._viewportGestureHandler.destroy();

		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}

		this._stopRenderLoop();

		var tools = this.getTools();

		for (var i = 0; i < tools.length; i++) {
			var tool = core.byId(tools[i]);
			if (tool) {
				tool.setActive(false);
			}
		}

		this._setContent(null);
		this.setCamera(null);
		// this._renderer.renderLists.dispose();
		// this._renderer.dispose();
		// this._renderer = null;
		this._backgroundCamera = null;
		this._backgroundMaterial = null;
		this._backgroundScene = null;
		this._loco = null;
		this._viewportGestureHandler = null;
		this._eyePointLight = null;
		this._hitTester = null;
		this._imageCanvas = null;

		if (this._cdsLoader) {
			this._cdsLoader.detachSceneUpdated(this._handleCdsSceneUpdate, this);
		}

		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}
	};

	Viewport.prototype._onLocalizationChanged = function(event) {
		var surface = this._measurementSurface;
		if (surface && surface.getMeasurements().length > 0) {
			surface.update(this, this.getCamera());
		}
	};

	Viewport.prototype.onSetViewStateManager = function(viewStateManager) {
		this._viewStateManager = viewStateManager;

		viewStateManager.attachVisibilityChanged(this._onVisibilityChanged, this);
		viewStateManager.attachOpacityChanged(this.setShouldRenderFrame, this);
		viewStateManager.attachTintColorChanged(this.setShouldRenderFrame, this);
		viewStateManager.attachHighlightColorChanged(this.setShouldRenderFrame, this);
		viewStateManager.attachTransformationChanged(this.setShouldRenderFrame, this);
		viewStateManager.attachOutlineColorChanged(this.setShouldRenderFrame, this);
		viewStateManager.attachOutlineWidthChanged(this.setShouldRenderFrame, this);

		viewStateManager.attachOutliningChanged(this._onOutliningOrSelectionChanged, this);
		viewStateManager.attachSelectionChanged(this._onOutliningOrSelectionChanged, this);
	};

	Viewport.prototype.onUnsetViewStateManager = function(viewStateManager) {
		viewStateManager.detachOutliningChanged(this._onOutliningOrSelectionChanged, this);
		viewStateManager.detachSelectionChanged(this._onOutliningOrSelectionChanged, this);

		viewStateManager.detachVisibilityChanged(this._onVisibilityChanged, this);
		viewStateManager.detachOpacityChanged(this.setShouldRenderFrame, this);
		viewStateManager.detachTintColorChanged(this.setShouldRenderFrame, this);
		viewStateManager.detachHighlightColorChanged(this.setShouldRenderFrame, this);
		viewStateManager.detachTransformationChanged(this.setShouldRenderFrame, this);
		viewStateManager.detachOutlineColorChanged(this.setShouldRenderFrame, this);
		viewStateManager.detachOutlineWidthChanged(this.setShouldRenderFrame, this);

		this._viewStateManager = null;
	};

	/**
	 * Starts the render loop.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	Viewport.prototype._startRenderLoop = function() {
		if (!this._renderLoopRequestId) {
			this._renderLoopRequestId = window.requestAnimationFrame(this._renderLoop);
		}
		return this;
	};

	/**
	 * Stops the render loop.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	Viewport.prototype._stopRenderLoop = function() {
		if (this._renderLoopRequestId) {
			window.cancelAnimationFrame(this._renderLoopRequestId);
			this._renderLoopRequestId = 0;
		}
		return this;
	};

	Viewport.prototype.setBackgroundColorTop = function(value) {
		basePrototype.setBackgroundColorTop.call(this, value);

		if (this._backgroundMaterial !== null) {
			this._updateColor(this._backgroundMaterial.uniforms.topColor.value, value);
			this._checkBackgroundColor();
		}

		return this;
	};

	Viewport.prototype.setBackgroundColorBottom = function(value) {
		basePrototype.setBackgroundColorBottom.call(this, value);

		if (this._backgroundMaterial !== null) {
			this._updateColor(this._backgroundMaterial.uniforms.bottomColor.value, value);
			this._checkBackgroundColor();
		}
		return this;
	};

	Viewport.prototype.setClippingPlanes = function(clippingPlanes) {
		this._clippingPlanes = clippingPlanes;
		return this;
	};

	Viewport.prototype.onBeforeRendering = function() {
		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}

		this._stopRenderLoop();
	};

	Viewport.prototype.onAfterRendering = function() {
		var domRef = this.getDomRef();
		if (this._canvas) {
			domRef.append(this._canvas);
		}
		domRef.append(this._measurementSurface.getDomRef());

		this._resizeListenerId = ResizeHandler.register(this, this._handleResize);

		this._handleResize({
			size: {
				width: domRef.clientWidth,
				height: domRef.clientHeight
			}
		});

		this._startRenderLoop();
	};

	Viewport.prototype._handleResize = function(event) {

		if (!this._camera || !this._renderer) {
			// nothing to do
			return false;
		}

		if (this.getSafeArea()) {
			this.getSafeArea().resize();
		}

		var width = event.size.width;
		var height = event.size.height;

		this._width = width;
		this._height = height;

		if (this._camera) {
			this._camera.update(width, height);
		}

		var canvas = this._canvas;
		var webGLCanvas = this._renderer.domElement;
		if (canvas !== webGLCanvas) {
			var devicePixelRatio = window.devicePixelRatio;
			canvas.width = Math.floor(width * devicePixelRatio);
			canvas.height = Math.floor(height * devicePixelRatio);
			canvas.style.width = width + "px";
			canvas.style.height = height + "px";
		}
		adjustWebGLRendererSize(this._registryEntry);

		var measurementSurfaceDomRef = this._measurementSurface.getDomRef();
		measurementSurfaceDomRef.style.width = width + "px";
		measurementSurfaceDomRef.style.height = height + "px";

		this.fireResize({
			size: {
				width: width,
				height: height
			}
		});

		this.setShouldRenderFrame(true);

		return true;
	};

	/**
	 * Attaches the scene to the Viewport for rendering.
	 * @param {sap.ui.vk.threejs.Scene} scene The scene to attach to the Viewport.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @deprecated Since version 1.50.0.
	 * @public
	 */
	Viewport.prototype.setScene = function(scene) {
		var nodeHierarchy;
		if (this._scene) {
			nodeHierarchy = this._scene.getDefaultNodeHierarchy();
			nodeHierarchy.detachNodeRemoving(this._onNodeRemoving, this);
			nodeHierarchy.detachNodeCreated(this._onNodeCreated, this);

			// In case an application calls `setScene(null)` directly instead of calling `setContentConnector(null)`.
			deregisterRendering(this, this._scene);
		}
		this._scene = scene;
		this._homeCamera = null;    // remove previous home camera
		this._currentViewIndex = 0;
		this._currentView = null;

		this._sceneObserver.disconnect();

		var nativeScene = this._getNativeScene();
		if (nativeScene) {
			// When doubleSided property in scene changes we want to refresh screen
			this._sceneObserver.observe(this._scene, { properties: ["doubleSided"] });

			this._backgroundNode = findBackgroundNode(nativeScene.children, true);

			// we create the scene and assume we have lights. Grab 1st one so we do 'CAD optimize light'
			// Basically light at your eye position
			var group;
			for (var i = 0; i < nativeScene.children.length; i++) {
				group = nativeScene.children[i];
				if (group.private && group.name === "DefaultLights" && group.children.length) {
					if (group.children[0] instanceof THREE.PointLight) {
						this._eyePointLight = group.children[0];
					}
				}
			}
		}

		if (this._scene) {
			nodeHierarchy = this._scene.getDefaultNodeHierarchy();
			nodeHierarchy.attachNodeCreated(this._onNodeCreated, this);
			nodeHierarchy.attachNodeRemoving(this._onNodeRemoving, this);
		}

		if (this._scene) {
			var initialView = this._scene.getInitialView();
			if (initialView && this._getViewStateManagerThreeJS()) {
				this.activateView(initialView, false, true);
			}
		}
		this._clearAnnotations(true);

		this.setShouldRenderFrame();

		return this;
	};

	/**
	 * Gets the Viewport Scene
	 * @returns {sap.ui.vk.threejs.Scene} returns Scene
	 * @public
	 */
	Viewport.prototype.getScene = function() {
		return this._scene;
	};

	Viewport.prototype._getNativeScene = function() {
		return this._scene ? this._scene.getSceneRef() : null;
	};

	Viewport.prototype._getNativeCamera = function() {
		return this._camera ? this._camera.getCameraRef() : null;
	};

	Viewport.prototype._clearAnnotations = function(clearAll) {
		if (clearAll) {
			this.destroyAnnotations();
		} else {
			// Delete auto-generated annotations only
			this.getAnnotations().forEach(function(annotation) {
				if (annotation.autoGenerated) {
					this.removeAnnotation(annotation);
					annotation.destroy();
				}
			}, this);
		}
		this._annotationsCreated = false;
	};

	Viewport.prototype._onNodeCreated = function(evt) {
		var nodeRef = evt.getParameter("nodeRef");
		if (nodeRef._vkGetNodeContentType() == NodeContentType.Annotation) {
			// New annotation is created, add it to current view (if exists)
			var view = this.getCurrentView();
			if (view) {
				view.getNodeInfos().push({
					target: nodeRef,
					visible: true,
					annotationId: nodeRef.userData.treeNode.annotationId
				});
			}

			var annotations = this._scene && this._scene._getAnnotations();
			if (annotations) {
				annotations.forEach(function(annotationInfo) {
					if (annotationInfo.node === nodeRef) {
						var annotation = Annotation.createAnnotation(annotationInfo, this);
						annotation.autoGenerated = true;
						this.addAnnotation(annotation);
						annotation.setDisplay(nodeRef.visible);
					}
				}, this);
			}
		}
	};

	Viewport.prototype._onNodeRemoving = function(event) {
		var nodeRef = event.getParameter("nodeRef");
		if (nodeRef._vkGetNodeContentType() === NodeContentType.Annotation) {
			this.getAnnotations().forEach(function(annotation) {
				if (annotation.getNodeRef() === nodeRef) {
					this.removeAnnotation(annotation);
					annotation.destroy();
				}
			}, this);
		}
	};

	/**
	 * Sets the camera for the Viewport
	 * @param {sap.ui.vk.Camera} camera parameter
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewport.prototype.setCamera = function(camera) {

		if (basePrototype.setCamera) {
			basePrototype.setCamera.call(this, camera);
		}

		var cam = this.getCamera();
		if (cam && this._renderer) {
			cam.update(this._width, this._height);

			if (!this._homeCamera && cam.getCameraRef()) {
				this._homeCamera = cam.getCameraRef().clone(); // set home camera
			}
		}

		this.setShouldRenderFrame(true);

		return this;
	};

	Viewport.prototype.getRenderer = function() {
		return this._renderer;
	};

	Viewport.prototype._getViewStateManagerThreeJS = function() {
		if (this._viewStateManager) {
			if (this._viewStateManager instanceof ThreeJSViewStateManager) {
				return this._viewStateManager;
			}
			if (this._viewStateManager instanceof VkViewStateManager &&
				this._viewStateManager._implementation instanceof ThreeJSViewStateManager) {
				return this._viewStateManager._implementation;
			}
		}
		return null;
	};

	/**
	 * @param {THREE.Vector4} destColor The destination color object.
	 * @param {number} cssColor The sap.ui.core.CSSColor color to be decomposed into RGBA.
	 * @private
	 */
	Viewport.prototype._updateColor = function(destColor, cssColor) {
		var color = cssColorToColor(cssColor);
		destColor.color = new THREE.Color(color.red / 255, color.green / 255, color.blue / 255);
		destColor.alpha = color.alpha;
		destColor.x = destColor.color.r * destColor.alpha;
		destColor.y = destColor.color.g * destColor.alpha;
		destColor.z = destColor.color.b * destColor.alpha;
		destColor.w = destColor.alpha;
	};

	Viewport.prototype._checkBackgroundColor = function() {
		var colorTop = this.getBackgroundColorTop();
		if (colorTop === this.getBackgroundColorBottom()) {
			if (this._backgroundColor === null) {
				this._backgroundColor = new THREE.Vector4();
			}

			this._updateColor(this._backgroundColor, colorTop);
		} else {
			this._backgroundColor = null;
		}

		this.setShouldRenderFrame(true);
	};

	Viewport.prototype._handleCdsSceneUpdate = function() {
		this.setShouldRenderFrame();
	};

	Viewport.prototype._handleLoadingFinished = function() {
		this._contentLoadingFinished = true;

		this._createAnnotations();

		this.setShouldRenderFrame();
	};

	/**
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @param {boolean} skipHierarchyProcessing If set to 'true', then hierarchy and matrix recomputation is not required, only redraw.
	 * @protected
	 */
	Viewport.prototype.setShouldRenderFrame = function(skipHierarchyProcessing) {
		this._shouldRenderFrame = true;
		if (skipHierarchyProcessing !== true) {
			this._shouldProcessHierarchy = true;
		}
		return this;
	};

	/**
	 * @returns {boolean} It returns <code>true</code> or <code>false</code> whether the frame should be rendered or not.
	 */
	Viewport.prototype.shouldRenderFrame = function() {
		return this._shouldRenderFrame;
	};

	// Override the generated method to suppress invalidation.
	Viewport.prototype.setRenderMode = function(renderMode) {
		this.setProperty("renderMode", renderMode, true);

		if (this._scene) {
			switch (renderMode) {
				case RenderMode.LineIllustration:
				case RenderMode.ShadedIllustration:
				case RenderMode.SolidOutline:
					this._scene._createOutlineGeometry(renderMode);
					break;
				default:
					this._scene._hideOutlineGeometry();
					break;
			}
		}

		this.setShouldRenderFrame(true);
		return this;
	};

	/**
	 * Performs a screen-space hit test and gets the hit node reference, it must be called between beginGesture() and endGesture()
	 *
	 * @param {int} x: x coordinate in viewport to perform hit test
	 * @param {int} y: y coordinate in viewport to perform hit test
	 * @param {object} options A map of parameters, optional
	 * @param {boolean} [options.ignoreUnderlay=false] If set to <code>true</code>, the underlay objects will be ignored
	 * @param {boolean} [options.ignoreOverlay=false] If set to <code>true</code>, the overlay objects will be ignored
	 * @returns {object} object under the viewport coordinates (x, y).
	 */
	Viewport.prototype.hitTest = function(x, y, options) {
		var nativeScene = this._getNativeScene();
		var nativeCamera = this._getNativeCamera();
		if (!nativeCamera || !nativeScene) {
			return null;
		}

		var vsm = this._getViewStateManagerThreeJS();
		if (vsm && vsm.applyNodeStates) {
			vsm.applyNodeStates();
		}

		try {
			var canvas = this._canvas;
			return this._hitTester.hitTest(x - canvas.clientLeft, y - canvas.clientTop, canvas.clientWidth, canvas.clientHeight,
				this._renderer, nativeScene, nativeCamera, this._clippingPlanes, options);
		} finally {
			if (vsm && vsm.revertNodeStates) {
				vsm.revertNodeStates();
			}
		}
	};

	Viewport.prototype._isRedlineActivated = function() {
		var nativeCamera = this._getNativeCamera();
		return nativeCamera ? nativeCamera.userData.isRedlineActivated : false;
	};

	var bgNodeNameToProjectionType = {
		"sphere": "spherical",
		"plane": "planar"
	};

	function findBackgroundNode(nodes, visible) {
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (!visible || node.visible) {
				if (node._vkGetNodeContentType() === NodeContentType.Background && bgNodeNameToProjectionType[node.name] !== undefined) {
					return node;
				}
				var bgNode = findBackgroundNode(node.children, visible);
				if (bgNode) {
					return bgNode;
				}
			}
		}
		return null;
	}

	Viewport.prototype._onVisibilityChanged = function(event) {
		// update background node if visibility of background nodes has changed
		var visibleNodes = event.getParameter("visible");
		var bgNode = visibleNodes && findBackgroundNode(visibleNodes, true);
		if (bgNode != null) { // set background node
			this._backgroundNode = bgNode;
		} else if (this._backgroundNode != null) {
			var hiddenNodes = event.getParameter("hidden");
			if (this._backgroundNode === (hiddenNodes && findBackgroundNode(hiddenNodes, false))) { // reset background node
				var nativeScene = this._getNativeScene();
				this._backgroundNode = nativeScene && findBackgroundNode(nativeScene.children, true);
			}
		}

		this.setShouldRenderFrame();
	};

	/**
	 * Get the background projection
	 *
	 * @returns {?string} Background projection or undefined
	 * @private
	 * @experimental Since 1.106.0 This method is experimental and might be modified or removed in future versions
	 */
	Viewport.prototype.getBackgroundProjection = function() {
		return bgNodeNameToProjectionType[this._backgroundNode && this._backgroundNode.name];
	};

	Viewport.prototype._isPanoramicActivated = function() {
		return this.getBackgroundProjection() === "spherical";
	};

	Viewport.prototype._isPlanarActivated = function() {
		return this.getBackgroundProjection() === "planar";
	};

	/**
	 * Executes a click or tap gesture.
	 *
	 * @param {int} x The tap gesture's x-coordinate.
	 * @param {int} y The tap gesture's y-coordinate.
	 * @param {boolean} isDoubleClick Indicates whether the tap gesture should be interpreted as a double-click. A value of <code>true</code> indicates a double-click gesture, and <code>false</code> indicates a single click gesture.
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	Viewport.prototype.tap = function(x, y, isDoubleClick) {

		if (!isDoubleClick) {
			if (this._viewStateManager) {
				var hit = this.hitTest(x, y); // NB: pass (x, y) in CSS pixels, hitTest will convert them to device pixels.

				var node = hit && hit.object;

				this.tapObject(node);

				if (node !== null) {
					this.fireNodeClicked({ nodeRef: node, x: x, y: y }, true, true);
				}
			}
		} else if (!this.getFreezeCamera()) {
			var hitForDB = this.hitTest(x, y);

			if (hitForDB && (this._zoomedObject === null || this._zoomedObject !== hitForDB.object)) {// double click on new object
				this._zoomedObject = hitForDB.object;
				this._viewportGestureHandler.zoomObject(this._zoomedObject, true);
			} else { // double click on previously double clicked object, or on empty space
				this._viewportGestureHandler.zoomObject(this._zoomedObject, false);
				this._zoomedObject = null;
			}
		}
		return this;
	};

	/**
	 * Executes a click or tap gesture on particular object
	 *
	 * @param {any} nodeRef Node that user clicked on
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	Viewport.prototype.tapObject = function(nodeRef) {
		var parameters = {
			picked: nodeRef ? [nodeRef] : []
		};
		this.fireNodesPicked(parameters);

		if (nodeRef && nodeRef._vkGetNodeContentType() === NodeContentType.Background) {
			// unselect all nodes when click on 360 background
			this.exclusiveSelectionHandler([]);
			return this;
		}

		if (this.getSelectionMode() === SelectionMode.Exclusive) {
			this.exclusiveSelectionHandler(parameters.picked);
		} else if (this.getSelectionMode() === SelectionMode.Sticky) {
			this.stickySelectionHandler(parameters.picked);
		}

		return this;
	};

	////////////////////////////////////////////////////////////////////////
	// Keyboard handling begins.

	var offscreenPosition = { x: -2, y: -2 };
	var rotateDelta = 2;
	var panDelta = 5;

	Viewport.prototype.onkeydown = function(event) {
		if (!event.isMarked()) {
			var cameraController;
			switch (event.keyCode) {
				case KeyCodes.ARROW_LEFT:
				case KeyCodes.ARROW_RIGHT:
				case KeyCodes.ARROW_UP:
				case KeyCodes.ARROW_DOWN:
					if (event.ctrlKey || event.altKey || event.metaKey) {
						break;
					}
					var delta = { x: 0, y: 0 };
					switch (event.keyCode) {
						case KeyCodes.ARROW_LEFT: delta.x = -1; break;
						case KeyCodes.ARROW_RIGHT: delta.x = +1; break;
						case KeyCodes.ARROW_UP: delta.y = -1; break;
						case KeyCodes.ARROW_DOWN: delta.y = +1; break;
						default: break;
					}
					cameraController = this._viewportGestureHandler._cameraController;
					cameraController.beginGesture(offscreenPosition.x, offscreenPosition.y);
					if (event.shiftKey) {
						cameraController.pan(panDelta * delta.x, panDelta * delta.y);
					} else {
						cameraController.rotate(rotateDelta * delta.x, rotateDelta * delta.y, true);
					}
					cameraController.endGesture();
					this.setShouldRenderFrame(true);
					event.preventDefault();
					event.stopPropagation();
					break;

				case 189: // KeyCodes.MINUS is not returning 189
				case KeyCodes.PLUS:
				case KeyCodes.NUMPAD_MINUS:
				case KeyCodes.NUMPAD_PLUS:
					cameraController = this._viewportGestureHandler._cameraController;
					cameraController.beginGesture(this.$().width() / 2, this.$().height() / 2);
					cameraController.zoom(event.keyCode === KeyCodes.PLUS || event.keyCode === KeyCodes.NUMPAD_PLUS ? 1.02 : 0.98);
					cameraController.endGesture();
					this.setShouldRenderFrame(true);
					event.preventDefault();
					event.stopPropagation();
					break;

				default: break;
			}
		}
	};

	// Keyboard handling ends.
	////////////////////////////////////////////////////////////////////////

	Viewport.prototype._onOutliningOrSelectionChanged = function(event) {
		var tools = this.getTools();
		for (var i = 0; i < tools.length; i++) { // loop over all oTools
			var tool = core.byId(tools[i]); // get control for associated control
			var gizmo = tool.getGizmoForContainer(this);
			if (gizmo && gizmo.handleSelectionChanged) {
				gizmo.handleSelectionChanged(event);
			}
		}
		this.setShouldRenderFrame();
	};

	Viewport.prototype.setSelectionRect = function(rect) {
		this.setShouldRenderFrame();

		if (!rect) {
			this._selectionRect = null;
			return;
		}

		var x1 = (rect.x1 / this._width) * 2 - 1;
		var y1 = (rect.y1 / this._height) * -2 + 1;
		var x2 = (rect.x2 / this._width) * 2 - 1;
		var y2 = (rect.y2 / this._height) * -2 + 1;
		var posArray = [x1, y2, -1, x2, y2, -1, x2, y1, -1, x1, y1, -1];

		if (!this._selectionRect) {
			var geom = new THREE.BufferGeometry();
			geom.setAttribute("position", new THREE.Float32BufferAttribute(posArray, 3));
			this._selectionRect = new THREE.LineLoop(geom, new THREE.LineBasicMaterial({ color: 0xC0C000, linewidth: window.devicePixelRatio }));
		} else {
			var posAttribute = this._selectionRect.geometry.getAttribute("position");
			posAttribute.array.set(posArray);
			posAttribute.needsUpdate = true;
		}
	};

	Viewport.prototype._renderLoop = function() {
		if (!this._renderer || !this.getDomRef()) {
			// break render loop
			this._renderLoopRequestId = 0;
			return;
		}

		if (this._viewportGestureHandler) {
			this._viewportGestureHandler.animateCameraUpdate();
		}

		if (this.getCamera()) {
			if (this.getCamera().getIsModified()) {
				this.getCamera().setIsModified(false);
				this.setShouldRenderFrame(true);
			}
		}

		var vsm = this._getViewStateManagerThreeJS();
		if (vsm) {
			if (vsm._playTransition() || vsm._playHighlight()) {
				this.setShouldRenderFrame();
			}
		}

		if (this._shouldRenderFrame && this.getAutoStartRendering()) {
			this._shouldRenderFrame = false;

			if (vsm) {
				vsm._setJointNodeMatrix();
			}

			this.render();

			var annotations = this.getAnnotations();
			if (annotations) {
				annotations.forEach(function(annotation) {
					annotation.update();
				});
			}

			this._measurementSurface.update(this, this.getCamera());
		}

		this._renderLoopRequestId = window.requestAnimationFrame(this._renderLoop); // request next frame
	};

	function _updateDynamicObjects(renderer, camera, scene, viewport) {
		var viewportSize = new THREE.Vector2(viewport._width, viewport._height);
		var backgroundProjection = viewport.getBackgroundProjection();

		// update billboards, callouts, lock to viewport nodes, etc
		scene.children.forEach(function(root) {
			if (root.userData._vkDynamicObjects) {
				root.userData._vkDynamicObjects.forEach(function(object) {
					if (object.parent) {
						object._vkUpdate(renderer, camera, viewportSize, backgroundProjection);
					}
				});
			}
		});
	}

	function _renderDetailViews(renderer, camera, scene, boundingBox, eyePointLight) {
		scene.children.forEach(function(root) {
			if (root.userData._vkDetailViews) {
				root.userData._vkDetailViews.sort(function(a, b) {
					return a.renderOrder - b.renderOrder;
				});
				root.userData._vkDetailViews.forEach(function(detailView) {
					if (detailView.node.visible) {
						detailView.detailView._render(renderer, camera, scene, boundingBox, eyePointLight);
					}
				});
			}
		});
	}

	Viewport.prototype._updateWorldMatrixRecursive = function(node, scratchBuf, textureDataArray, textureUpdateResults, force, noClusters) {
		if (node.visible === false) {
			if (textureDataArray) {
				ThreeUtils.removeNodeFromClusterRenderingRecursive(node, textureDataArray, textureUpdateResults);
			}
			return;
		}

		if (node.userData.renderStage) {
			(node.userData.renderStage < 0 ? this._underlayGroup : this._overlayGroup).children.push(node);

			// this object and its children will be rendered in a separate render() call as underlay/overlay
			if (!noClusters && textureDataArray) {
				noClusters = true;
				ThreeUtils.removeNodeFromClusterRenderingRecursive(node, textureDataArray, textureUpdateResults);
			}
		}

		node.matrixAutoUpdate = false;

		if (node.matrixWorldNeedsUpdate || force) {
			if (node.parent === null) {
				node.matrixWorld.copy(node.matrix);
			} else {
				node.matrixWorld.multiplyMatrices(node.parent.matrixWorld, node.matrix);
			}

			node.matrixWorldNeedsUpdate = true;
			force = true;
		}

		if (!noClusters) {
			// we've removed this branch from cluster rendering completely
			ThreeUtils.updateTextureDataForNode(node, scratchBuf, textureDataArray, textureUpdateResults);
		}

		// update children
		var children = node.children;
		for (var i = 0, l = children.length; i < l; i++) {
			this._updateWorldMatrixRecursive(children[i], scratchBuf, textureDataArray, textureUpdateResults, force, noClusters);
		}
	};

	function setChildrenVisibility(node, visible) {
		node.children.forEach(function(child) {
			child.visible = visible;
		});
	}

	Viewport.prototype.render = function() {
		var renderer = this._renderer;
		if (!renderer) {
			return;
		}

		var timerStart = performance.now();
		var vsm = this._getViewStateManagerThreeJS();

		if (vsm && vsm.applyNodeStates) {
			vsm.applyNodeStates();
		}

		try {
			renderer.setViewport(0, 0, this._canvas.width / window.devicePixelRatio, this._canvas.height / window.devicePixelRatio);

			var nativeScene = this._getNativeScene();
			var nativeCamera = this._getNativeCamera();
			if (!nativeScene || !nativeCamera) {
				return;
			}

			var sceneUD = nativeScene.userData;
			var currentScene = this.getScene(); // cannot be null, because nativeScene is not null

			if (this._eyePointLight) {// move light to eye position
				this._eyePointLight.position.copy(nativeCamera.position);
				this._eyePointLight.updateMatrix();
			}

			var geometryClusters = sceneUD.geometryClusters;
			var dataTexture = geometryClusters ? sceneUD.instanceDataTexture : null;
			var dataTextureArray = dataTexture ? dataTexture.image.data : null;
			var textureUpdateResults = ThreeUtils.prepareTextureUpdateResults(geometryClusters ? geometryClusters.length : 0, sceneUD.textureUpdateResults);
			sceneUD.textureUpdateResults = null; // all texture updates that happened between frames will be uploaded to GPU during rendering of this frame

			var instanceScratchBuffer = new Float32Array(20);
			var timerWorldMatrixRecursiveBegin = performance.now();
			if (sceneUD.recomputeMatrices === false) {
				// temp debug REMOVE!!!
				this._shouldProcessHierarchy = false;
			}

			var shouldUpdateSelectionBoxes = false;
			if (this._shouldProcessHierarchy) {
				this._shouldProcessHierarchy = false;
				shouldUpdateSelectionBoxes = true;
				this._underlayGroup.children.length = 0;
				this._overlayGroup.children.length = 0;
				this._updateWorldMatrixRecursive(nativeScene, instanceScratchBuffer, dataTextureArray, textureUpdateResults, false, false);
				this._shouldDoTraversalRendering = textureUpdateResults[2] === 1;
			} else {
				// lights must be recomputed every frame
				for (var iRootChild = 0, lenRootChild = nativeScene.children.length; iRootChild < lenRootChild; ++iRootChild) {
					var rootChild = nativeScene.children[iRootChild];
					if (rootChild.name === "DefaultLights") {
						this._updateWorldMatrixRecursive(rootChild, instanceScratchBuffer, dataTextureArray, textureUpdateResults, false, false);
					}
				}
			}
			var timerWorldMatrixRecursiveEnd = performance.now();
			nativeScene.matrixWorldAutoUpdate = false;

			sceneUD.doTraversalRendering = (sceneUD.allowTraversalRendering !== false) && this._shouldDoTraversalRendering;

			var timerDataTextureBegin = performance.now();
			if (dataTexture && textureUpdateResults[1] >= textureUpdateResults[0]) {
				ThreeUtils.processUpdatedDataTexture(dataTexture, textureUpdateResults[0], textureUpdateResults[1] + 1);
				ThreeUtils.computeClusterBoundingBoxes(geometryClusters, dataTextureArray, nativeScene, textureUpdateResults);
			}
			var timerDataTextureEnd = performance.now();

			var tools = this.getTools();
			var i, tool, gizmo, boundingBox;

			// Re-calculate clipping planes if necessary
			var timerComputeBoundingBoxBegin = performance.now();
			var timerComputeBoundingBoxEnd = timerComputeBoundingBoxBegin;
			if (this._camera.getUsingDefaultClipPlanes() || (nativeCamera.isOrthographicCamera && nativeCamera.zoom <= 0)) {
				boundingBox = currentScene._computeBoundingBox(true, false, true);
				timerComputeBoundingBoxEnd = performance.now();
				if (vsm) {// expand the bounding box with selected objects because they can be invisible
					vsm._selectedNodes.forEach(function(node) {
						node._expandBoundingBox(boundingBox, false, false, false);
					});
				}
				if (!boundingBox.isEmpty()) {
					if (nativeCamera.isOrthographicCamera && nativeCamera.zoom <= 0) {
						this._camera.adjustZoom(boundingBox);
					}

					if (this._camera.getUsingDefaultClipPlanes()) {
						for (i = 0; i < tools.length; i++) { // loop over all oTools
							tool = core.byId(tools[i]); // get control for associated control
							gizmo = tool.getGizmoForContainer(this);
							if (gizmo && gizmo.expandBoundingBox) {
								gizmo.expandBoundingBox(boundingBox);
							}
						}

						this._camera.adjustClipPlanes(boundingBox);
					}
				}
			}

			_updateDynamicObjects(renderer, nativeCamera, nativeScene, this);

			// Apply background
			renderer.autoClear = false;
			if (this._backgroundColor !== null) {
				renderer.setClearColor(this._backgroundColor.color, this._backgroundColor.alpha);
				renderer.clear(true, true, false); // clear color and depth, ignore stencil
			} else {
				renderer.render(this._backgroundScene, this._backgroundCamera);
				renderer.clearDepth();
			}

			// render underlay
			if (this._underlayGroup.children.length > 0) {
				renderer.render(this._underlayGroup, nativeCamera);
				renderer.clearDepth();

				setChildrenVisibility(this._underlayGroup, false);
			}
			setChildrenVisibility(this._overlayGroup, false);
			renderer.clippingPlanes = this._clippingPlanes;

			switch (this.getRenderMode()) {
				case RenderMode.XRay:
					// TODO(VSM): what is this?
					if (vsm) {
						var lightNode = nativeScene.children[nativeScene.children.length - 1].clone();
						vsm._selectedNodes.forEach(function(node) {
							if (node.visible) {
								node.add(lightNode);
								renderer.render(node, nativeCamera);
								node.remove(lightNode);
							}
						});
					}

					this._xrayMaterial.specularMap = dataTexture; // enable cluster rendering
					nativeScene.overrideMaterial = this._xrayMaterial;
					break;
				default: break;
			}

			// render scene
			var timerRenderBegin = performance.now();
			renderer.render(nativeScene, nativeCamera);
			var timerRenderEnd = performance.now();

			// save some render statistics
			var renderInfo = renderer.info.render;
			var renderedFrameNumber = renderInfo.frame;
			var rr = {
				calls: nativeScene.userData.doTraversalRendering ? -renderInfo.calls : renderInfo.calls,
				tris: renderInfo.triangles,
				tMatrix: (timerWorldMatrixRecursiveEnd - timerWorldMatrixRecursiveBegin).toFixed(1),
				tBBox: (timerComputeBoundingBoxEnd - timerComputeBoundingBoxBegin).toFixed(1),
				tRender: (timerRenderEnd - timerRenderBegin).toFixed(1),
				tTexture: (timerDataTextureEnd - timerDataTextureBegin).toFixed(1),
				lines: renderInfo.lines,
				points: renderInfo.points
			};

			renderer.clippingPlanes = [];
			nativeScene.overrideMaterial = null;

			var vsmBoxTime = 0;
			if (this.getShowSelectionBoundingBoxes() && vsm) {
				var boundingBoxesScene = vsm._boundingBoxesScene;
				if (boundingBoxesScene) {
					var timeVsmBboxBegin = performance.now();
					if (shouldUpdateSelectionBoxes) {
						vsm._updateBoundingBoxes();
					}

					renderer.render(boundingBoxesScene, nativeCamera);
					vsmBoxTime = performance.now() - timeVsmBboxBegin;
				}
			}

			// render overlay
			if (this._overlayGroup.children.length > 0) {
				setChildrenVisibility(this._overlayGroup, true); // restore overlay nodes visibility

				renderer.clearDepth();
				renderer.render(this._overlayGroup, nativeCamera);
			}
			setChildrenVisibility(this._underlayGroup, true); // restore underlay nodes visibility

			_renderDetailViews(renderer, nativeCamera, nativeScene, boundingBox, this._eyePointLight);

			if (vsm) {
				vsm._renderOutline(renderer, nativeScene, nativeCamera);
			}

			for (i = 0; i < tools.length; i++) { // loop over all oTools
				tool = core.byId(tools[i]); // get control for associated control
				gizmo = tool.getGizmoForContainer(this);
				if (gizmo && gizmo.render) {
					gizmo.render(this);
				}
			}

			if (this._selectionRect) {
				renderer.render(this._selectionRect, this._backgroundCamera);
			}

			var webGLCanvas = this._registryEntry.webGLRenderer.domElement;
			var targetCanvas = this._canvas;
			if (targetCanvas !== webGLCanvas) {
				var targetContext = targetCanvas.getContext("2d");
				var targetWidth = targetCanvas.width;
				var targetHeight = targetCanvas.height;
				targetContext.drawImage(webGLCanvas,
					0, webGLCanvas.height - targetHeight, targetWidth, targetHeight,
					0, 0, targetWidth, targetHeight);
			}

			// show some render stats
			var timerFinish = performance.now();
			Log.debug("Frame #" + renderedFrameNumber + ": " + (timerFinish - timerStart).toFixed(1) + "ms",
				"Calls=" + rr.calls + ", Tris=" + rr.tris
				+ ", tMatrix=" + rr.tMatrix
				+ ", tBBox=" + rr.tBBox
				+ ", tRender=" + rr.tRender
				+ ", tTexture=" + rr.tTexture
				+ ", tVsmBBox=" + vsmBoxTime.toFixed(1)
				+ ", lines=" + rr.lines
				+ ", points=" + rr.points
			);
		} finally {
			if (vsm && vsm.revertNodeStates) {
				vsm.revertNodeStates();
			}
		}

		this.fireFrameRenderingFinished();
	};

	/**
	 * Returns viewport content as an image of desired size.
	 *
	 * @param {int} width Requested image width in pixels. Allowed values are 8 to 2048, default is 16
	 * @param {int} height Requested image height in pixels. Allowed values are 8 to 2048, default is 16
	 * @param {string} topColor The sap.ui.core.CSSColor to be used for top background color
	 * @param {string} bottomColor The sap.ui.core.CSSColor to be used for bottom background color
	 * @param {boolean} includeSelection Include selected nodes
	 * @returns {string} Base64 encoded PNG image
	 * @public
	 */
	Viewport.prototype.getImage = function(width, height, topColor, bottomColor, includeSelection) {
		var nativeScene = this._getNativeScene();
		if (!nativeScene) {
			return null;
		}

		width = Math.min(width || 16, 2048);
		height = Math.min(height || 16, 2048);

		this._imageCanvas = this._imageCanvas || document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");

		var renderer = new THREE.WebGLRenderer({
			canvas: this._imageCanvas,
			preserveDrawingBuffer: true,
			antialias: true,
			alpha: true
		});
		renderer.setSize(width, height);

		// Remember background colors
		var currentBKTop = this.getBackgroundColorTop();
		var currentBKBottom = this.getBackgroundColorBottom();

		if (topColor && !bottomColor) {
			// If only top color is provided use it as a solid color
			renderer.setClearColor(topColor, 1);
		} else if (!topColor && bottomColor) {
			// If only bottom color is provided use it as a solid color
			renderer.setClearColor(bottomColor, 1);
		} else {
			if (topColor && bottomColor) {
				this.setBackgroundColorTop(topColor);
				this.setBackgroundColorBottom(bottomColor);
			}

			renderer.render(this._backgroundScene, this._backgroundCamera);
			renderer.autoClear = false;
		}

		document.body.appendChild(renderer.domElement);

		var vpCamera = this.getCamera();
		var camera = vpCamera instanceof PerspectiveCamera ? new PerspectiveCamera() : new OrthographicCamera();
		camera.getCameraRef().copy(vpCamera.getCameraRef());
		camera.update(width, height);

		if (this._eyePointLight) {// move light to eye position
			this._eyePointLight.position.copy(camera.getCameraRef().position);
			this._eyePointLight.updateMatrix();
			this._eyePointLight.updateMatrixWorld(true);
		}

		// remove selection for snapshot
		var selectedNodes = [];
		var vsm = this._getViewStateManagerThreeJS();
		if (!includeSelection) {
			if (vsm !== null) {
				// make copy of current nodes selected
				vsm.enumerateSelection(function(node) {
					selectedNodes.push(node);
				});

				// unselect selected nodes
				vsm.setSelectionState(selectedNodes, false, false, true);
			}
		}

		// capture snapshot
		renderer.render(nativeScene, camera.getCameraRef());
		var imageData = renderer.getContext().canvas.toDataURL();

		if (vsm !== null && selectedNodes.length > 0) {
			// add selection back for nodes that were originally selected
			vsm.setSelectionState(selectedNodes, true, false, true);
		}

		document.body.removeChild(renderer.domElement);
		renderer.dispose();

		if (currentBKBottom && topColor) {
			this.setBackgroundColorBottom(currentBKBottom);
		}
		if (currentBKTop && bottomColor) {
			this.setBackgroundColorTop(currentBKTop);
		}
		return imageData;
	};

	/**
	 * Returns a thumbnail of desired size for a specified material.
	 *
	 * @param {any|any[]} material The material or array of materials.
	 * @param {int} width Requested image width in pixels. Allowed values are 8 to 2048, default is 256
	 * @param {int} height Requested image height in pixels. Allowed values are 8 to 2048, default is 256
	 * @param {string} topColor The sap.ui.core.CSSColor to be used for top background color
	 * @param {string} bottomColor The sap.ui.core.CSSColor to be used for bottom background color
	 * @param {float} margin The object margin
	 * @returns {string|string[]} Base64 encoded PNG image or array of images if materials array was
	 * passes as an input parameter.
	 */
	Viewport.prototype.getMaterialImage = function(material, width, height, topColor, bottomColor, margin) {
		width = THREE.MathUtils.clamp(width || 256, 8, 2048);
		height = THREE.MathUtils.clamp(height || 256, 8, 2048);

		this._imageCanvas = this._imageCanvas || document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");

		var renderer = new THREE.WebGLRenderer({
			canvas: this._imageCanvas,
			preserveDrawingBuffer: true,
			antialias: true,
			alpha: true
		});
		renderer.setSize(width, height);

		// Remember background colors
		var currentBKTop = this.getBackgroundColorTop();
		var currentBKBottom = this.getBackgroundColorBottom();

		if (topColor && !bottomColor) {
			// If only top color is provided use it as a solid color
			renderer.setClearColor(topColor, 1);
		} else if (!topColor && bottomColor) {
			// If only bottom color is provided use it as a solid color
			renderer.setClearColor(bottomColor, 1);
		} else if (topColor && bottomColor) {
			// When both are specified, draw a gradient
			this.setBackgroundColorTop(topColor);
			this.setBackgroundColorBottom(bottomColor);
			renderer.render(this._backgroundScene, this._backgroundCamera);
			renderer.autoClear = false;
		} else {
			// If none are provided, draw fully transparent
			renderer.setClearColor("#000000", 0);
		}

		document.body.appendChild(renderer.domElement);

		var camera = new OrthographicCamera();
		var cameraRef = camera.getCameraRef();
		camera.update(width, height);

		var geometry = new THREE.SphereGeometry(1, 64, 32);
		var nodeRef = new THREE.Mesh(geometry);

		var boundingBox = new THREE.Box3();
		nodeRef._expandBoundingBox(boundingBox, false, false, false);

		cameraRef._vkZoomTo(boundingBox, margin);
		camera.adjustClipPlanes(boundingBox);

		var eyePointLight = new THREE.PointLight();
		eyePointLight.position.copy(cameraRef.position);
		eyePointLight.position.y = -1;
		eyePointLight.updateMatrix();
		eyePointLight.updateMatrixWorld(true);
		nodeRef.add(eyePointLight);

		var materials = Array.isArray(material) ? material : [material];
		var results = [];
		for (var i in materials) {
			nodeRef.material = materials[i];
			renderer.render(nodeRef, cameraRef);
			results.push(renderer.getContext().canvas.toDataURL());
		}

		nodeRef.remove(eyePointLight);
		document.body.removeChild(renderer.domElement);
		renderer.dispose();

		if (currentBKBottom && topColor) {
			this.setBackgroundColorBottom(currentBKBottom);
		}
		if (currentBKTop && bottomColor) {
			this.setBackgroundColorTop(currentBKTop);
		}
		return Array.isArray(material) ? results : results[0];
	};

	/**
	 * Returns object as an image of desired size.
	 *
	 * @param {any} nodeRef The node reference.
	 * @param {int} width Requested image width in pixels. Allowed values are 8 to 2048, default is 256
	 * @param {int} height Requested image height in pixels. Allowed values are 8 to 2048, default is 256
	 * @param {string} topColor The sap.ui.core.CSSColor to be used for top background color
	 * @param {string} bottomColor The sap.ui.core.CSSColor to be used for bottom background color
	 * @param {THREE.Quaternion} quaternion Optional camera rotation quaternion
	 * @param {float} margin The object margin
	 * @returns {string} Base64 encoded PNG image
	 * @public
	 * @experimental Since 1.82.0 This method is experimental and might be modified or removed in future versions
	 */
	Viewport.prototype.getObjectImage = function(nodeRef, width, height, topColor, bottomColor, quaternion, margin) {
		return this.getObjectImageEx(nodeRef, width, height, topColor, bottomColor, {
			quaternion: quaternion,
			margin: margin,
			includeOverlay: true
		});
	};

	/**
	 * Returns object/objects as an image of desired size.
	 *
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @param {int} width Requested image width in pixels. Allowed values are 8 to 2048, default is 256
	 * @param {int} height Requested image height in pixels. Allowed values are 8 to 2048, default is 256
	 * @param {string} topColor The sap.ui.core.CSSColor to be used for top background color
	 * @param {string} bottomColor The sap.ui.core.CSSColor to be used for bottom background color
	 * @param {object} options A map of parameters, optional
	 * @param {boolean} [options.useViewportCamera=false] If set to <code>true</code>, the viewport camera will be used
	 * @param {THREE.Quaternion} options.quaternion Camera rotation quaternion (if options.useViewportCamera is not set to <code>false</code>)
	 * @param {float} options.margin The object margin (if options.useViewportCamera is not set to <code>false</code>)
	 * @param {string} options.type Output image format. The default type is "image/png"
	 * @param {number} options.encoderOptions A number between 0 and 1 indicating the output image quality
	 * @param {boolean} [options.includeOverlay=false] If set to <code>true</code> then overlay nodes will be rendered
	 * @param {boolean} [options.includeUnderlay=false] If set to <code>true</code> then underlay nodes will be rendered
	 * @returns {string} Base64 encoded image
	 * @public
	 * @experimental Since 1.102.0 This method is experimental and might be modified or removed in future versions
	 */
	Viewport.prototype.getObjectImageEx = function(nodeRefs, width, height, topColor, bottomColor, options) {
		var nativeScene = this._getNativeScene();
		if (!nativeScene) {
			return null;
		}

		options = options || {};
		width = THREE.MathUtils.clamp(width || 256, 8, 2048);
		height = THREE.MathUtils.clamp(height || 256, 8, 2048);

		this._imageCanvas = this._imageCanvas || document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");

		var renderer = new THREE.WebGLRenderer({
			canvas: this._imageCanvas,
			preserveDrawingBuffer: true,
			antialias: true,
			alpha: true
		});
		renderer.setSize(width, height);

		// Remember background colors
		var currentBKTop = this.getBackgroundColorTop();
		var currentBKBottom = this.getBackgroundColorBottom();

		if (topColor && !bottomColor) {
			// If only top color is provided use it as a solid color
			renderer.setClearColor(topColor, 1);
		} else if (!topColor && bottomColor) {
			// If only bottom color is provided use it as a solid color
			renderer.setClearColor(bottomColor, 1);
		} else {
			if (topColor && bottomColor) {
				this.setBackgroundColorTop(topColor);
				this.setBackgroundColorBottom(bottomColor);
			}

			renderer.render(this._backgroundScene, this._backgroundCamera);
			renderer.autoClear = false;
		}

		document.body.appendChild(renderer.domElement);

		var vsm = this._getViewStateManagerThreeJS();
		if (vsm && vsm.applyNodeStates) {
			vsm.applyNodeStates();
		}

		try {
			if (nodeRefs == null) {
				nodeRefs = nativeScene.children.slice().filter(function(node) { return node.name !== "DefaultLights"; });
			} else if (!Array.isArray(nodeRefs)) {
				nodeRefs = [nodeRefs];
			}

			var vpCamera = this.getCamera();
			var camera = vpCamera instanceof PerspectiveCamera ? new PerspectiveCamera() : new OrthographicCamera();
			var cameraRef = camera.getCameraRef();
			cameraRef.copy(vpCamera.getCameraRef());
			if (options.quaternion && !options.useViewportCamera) {
				cameraRef.quaternion.copy(options.quaternion);
				cameraRef.updateMatrixWorld();
				cameraRef.up.setFromMatrixColumn(cameraRef.matrixWorld, 1).normalize();
			}
			camera.update(width, height);

			// update billboards
			if (!options.useViewportCamera) {
				nodeRefs[0].getWorldPosition(cameraRef.position);
				cameraRef.position.sub(cameraRef.getWorldDirection(new THREE.Vector3()).multiplyScalar(1000));
			}
			cameraRef.updateMatrixWorld();
			cameraRef.updateProjectionMatrix();
			var viewportSize = new THREE.Vector2();
			renderer.getSize(viewportSize);

			var hiddenNodes = [];
			nodeRefs.forEach(function(nodeRef) {
				nodeRef.traverseVisible(function(node) {
					if (node._vkUpdate) {
						node._vkUpdate(renderer, cameraRef, viewportSize);

						if (node._vkGetNodeContentType() === NodeContentType.Symbol) {// reset symbol opacity
							node._vkSetOpacity(1);
						}
					}
					if ((!options.includeOverlay && node.userData.renderStage > 0) ||
						(!options.includeUnderlay && node.userData.renderStage < 0)) {
						// hide overlay/underlay node
						hiddenNodes.push(node);
						node.visible = false;
					}
				});
			});

			var scene = new THREE.Scene();
			scene.children = nodeRefs;
			var boundingBox = new THREE.Box3();
			scene._expandBoundingBox(boundingBox, false, false, false);

			if (!options.useViewportCamera) {
				cameraRef._vkZoomTo(boundingBox, options.margin);
			}
			camera.adjustClipPlanes(boundingBox);

			// copy default scene lights
			var lightNode = nativeScene.children[nativeScene.children.length - 1].clone(); // DefaultLights node
			var eyePointLight = lightNode.children[0];
			eyePointLight.position.copy(cameraRef.position);
			eyePointLight.updateMatrix();
			eyePointLight.updateMatrixWorld(true);
			scene.add(lightNode);

			var selectedNodes = [];
			if (vsm != null) {
				// make copy of current nodes selected
				vsm.enumerateSelection(function(node) {
					selectedNodes.push(node);
				});

				// unselect selected nodes
				vsm.setSelectionState(selectedNodes, false, false, true);
			}

			renderer.render(scene, cameraRef);

			if (vsm != null && selectedNodes.length > 0) {
				// add selection back for nodes that were originally selected
				vsm.setSelectionState(selectedNodes, true, false, true);
			}

			if (hiddenNodes.length > 0) {// restore overlay/underlay nodes visibility
				hiddenNodes.forEach(function(node) { node.visible = true; });
			}

			scene.remove(lightNode);
			scene.children = [];
		} finally {
			if (vsm && vsm.revertNodeStates) {
				vsm.revertNodeStates();
			}
		}

		var imageData = renderer.getContext().canvas.toDataURL(options.type, options.encoderOptions);

		document.body.removeChild(renderer.domElement);
		renderer.dispose();

		if (currentBKBottom && topColor) {
			this.setBackgroundColorBottom(currentBKBottom);
		}
		if (currentBKTop && bottomColor) {
			this.setBackgroundColorTop(currentBKTop);
		}
		return imageData;
	};

	// Overridden sap.ui.vk.ViewportBase#_setContent.
	Viewport.prototype._setContent = function(content) {
		basePrototype._setContent.apply(this, arguments);

		var scene = null;
		var camera;
		var boundingBox;

		if (this._scene) {
			deregisterRendering(this, this._scene);
		}

		if (content) {
			scene = content;
			if (!(scene instanceof Scene)) {
				scene = null;
			}
			camera = content.camera;

			if (!(camera instanceof OrthographicCamera) && !(camera instanceof PerspectiveCamera)) { // create default perspective camera
				camera = new PerspectiveCamera();

				if (content.builders && content.builders.length > 0) { // the content was created by sap.ui.vk.threejs.SceneBuilder, but has no default camera
					boundingBox = scene._computeBoundingBox(true, true);
					if (!boundingBox.isEmpty()) {
						camera.setFov(14.27); // DVL camera initial FOV = (60 / π) radians = 1094.27° ≡ 14.27°
						var euler;
						if (content.upAxis === 4) { // z-up
							euler = new THREE.Euler(THREE.MathUtils.degToRad(90 - 30), 0, THREE.MathUtils.degToRad(55 - 90), "ZXY");
						} else { // y-up
							euler = new THREE.Euler(THREE.MathUtils.degToRad(-30), THREE.MathUtils.degToRad(55 - 90), 0, "YXZ");
						}
						this.setCamera(camera);
						this._viewportGestureHandler.zoomTo(boundingBox, new THREE.Quaternion().setFromEuler(euler), 0, 0, null, false);
					}
				}
			}

			var i;
			// if cds loaded this content, we need to attach some event for refreshing
			// this is because cds can update content after the scene is loaded
			// as cds streaming information from the server
			if (content.loaders) {
				for (i = 0; i < content.loaders.length; i++) {
					if (content.loaders[i] instanceof ContentDeliveryService) {
						this._cdsLoader = content.loaders[i]; // grab 1st one as we can only have one cds with scene atm
						this._cdsLoader.getSceneBuilder()._fireSceneUpdated = this.setShouldRenderFrame.bind(this);
						this._cdsLoader.attachSceneUpdated(this._handleCdsSceneUpdate, this);
						this._cdsLoader.attachLoadingFinished(this._handleLoadingFinished, this);
						this._cdsLoader.attachInitialViewCompleted(this.setShouldRenderFrame, this);
						this._contentLoadingFinished = false;
						break;
					}
				}
			}

			if (content.builders) {
				for (i = 0; i < content.builders.length; i++) {
					content.builders[i]._fireSceneUpdated = this.setShouldRenderFrame.bind(this);
					content.builders[i]._fireLoadingFinished = function(event) {
						this.setRenderMode(this.getRenderMode());
					}.bind(this);
				}
			}
		} else if (this._cdsLoader) {
			// No content, clear up resources
			this._cdsLoader.detachSceneUpdated(this._handleCdsSceneUpdate, this);
			this._cdsLoader.detachLoadingFinished(this._handleLoadingFinished, this);
			this._cdsLoader.detachInitialViewCompleted(this.setShouldRenderFrame, this);
			this._cdsLoader = null;
		}

		if (scene) {
			registerRendering(this, scene);
		}

		this.setScene(scene);

		if (camera) { // camera is optional so only set it if exist
			this.setCamera(camera);
		}

		if (content) {
			if (content.backgroundTopColor !== undefined) { // hex color
				this.setBackgroundColorTop(new THREE.Color(content.backgroundTopColor).getStyle());
			}

			if (content.backgroundBottomColor !== undefined) { // hex color
				this.setBackgroundColorBottom(new THREE.Color(content.backgroundBottomColor).getStyle());
			}

			if (content.renderMode !== undefined) { // sap.ui.vk.RenderMode
				this.setRenderMode(content.renderMode);
			}

			this._upAxis = content.upAxis || 2;
		}

		if (this._measurementSurface != null) {
			// Reset measurement scale factor to default.
			this._measurementSurface.setScale(1);
		}

		return this;
	};

	/**
	 * Get current view -  remembered when activateView function is called
	 *
	 * @returns {sap.ui.vk.View} Current view
	 * @public
	 */
	Viewport.prototype.getCurrentView = function() {
		return this._currentView;
	};

	Viewport.prototype._onViewStateApplied = function(channel, eventId, event) {
		if (event.source != this._getViewStateManagerThreeJS() || !this._scene) {
			return;
		}

		this._ignoreAnimationPosition = event.ignoreAnimationPosition;

		this.activateView(event.view, event.playViewGroup, event.skipCameraTransitionAnimation);
	};

	Viewport.prototype._activateSingleView = function(view, playViewGroup, skipCameraTransitionAnimation) {

		var viewGroups = this._scene.getViewGroups();
		var that = this;
		if (viewGroups) {
			viewGroups.forEach(function(viewGroup) {
				viewGroup.getViews().forEach(function(modelView) {
					if (modelView === view) {
						that._currentViewIndex = viewGroup.getViews().indexOf(modelView);
					}
				});
			});
		}

		this.fireViewActivated({ viewIndex: this._currentViewIndex, view: view });
		vkCore.getEventBus().publish("sap.ui.vk", "viewActivated", {
			source: this,
			view: view,
			viewIndex: this._currentViewIndex
		});

		this._currentView = view;


		var nativeScene = this._getNativeScene();
		this._backgroundNode = findBackgroundNode(nativeScene.children, true);

		var topColor = view.getTopColor();
		if (topColor != null) {
			if (Array.isArray(topColor) && topColor.length > 2) { // float value array [ r, g, b ] or [ r, g, b, a ]
				this.setBackgroundColorTop(new THREE.Color(topColor[0], topColor[1], topColor[2]).getStyle());
			} else { // handle hex value, and hex / rgb /hsl color string, and invalid inputs resulting an empty THREE.Color with getStyle function returning "rgb(255,255,255)"
				this.setBackgroundColorTop(new THREE.Color(topColor).getStyle());
			}
		}

		var bottomColor = view.getBottomColor();
		if (bottomColor != null) {
			if (Array.isArray(bottomColor) && bottomColor.length > 2) { // float value array [ r, g, b ] or [ r, g, b, a ]
				this.setBackgroundColorBottom(new THREE.Color(bottomColor[0], bottomColor[1], bottomColor[2]).getStyle());
			} else { // handle hex value, and hex / rgb /hsl color string, and invalid inputs resulting an empty THREE.Color with getStyle function returning "rgb(255,255,255)"
				this.setBackgroundColorBottom(new THREE.Color(bottomColor).getStyle());
			}
		}

		if (view.renderMode !== undefined) { // sap.ui.vk.RenderMode
			this.setRenderMode(view.renderMode);
		}

		var camera = view.getCamera();
		var vsm = this._getViewStateManagerThreeJS();
		var timeInterval = view.flyToTime != null ? view.flyToTime : 2000;

		var transitionEffect;
		if (vsm && vsm._fadeOutBackground && vsm._fadeInBackground && vsm._fadeOutBackground !== vsm._fadeInBackground && vsm._fadeOutBackground.name === "sphere") {
			transitionEffect = "zoomIn";
			camera = camera || this.getCamera(); // the new view may not have a camera
		}

		var timeIntervalCameraChange = 0;
		if (camera) {
			var pauseWhenNoCameraChange = playViewGroup && !view.hasAnimation();

			timeIntervalCameraChange = this._viewportGestureHandler.activateCamera(camera.getCameraRef(), skipCameraTransitionAnimation ? 0 : timeInterval, pauseWhenNoCameraChange, transitionEffect);
		} else {
			this.cameraUpdateCompleted();
		}

		var timeIntervalForTransition = 0;
		if (!skipCameraTransitionAnimation) {
			timeIntervalForTransition = vsm._startTransition(timeIntervalCameraChange > 0 ? timeIntervalCameraChange : timeInterval, view);
		}

		if (this.getSafeArea()) {
			this.getSafeArea().resize();
		}

		if (this._readyForAnimationTimer) {
			clearTimeout(this._readyForAnimationTimer);
		}

		this._readyForAnimationTimer = setTimeout(function() {
			this._readyForAnimationTimer = 0;
			if (vsm) {
				if (this._contentLoadingFinished !== false) {
					this._createAnnotations();
				}

				vsm.fireReadyForAnimation({
					view: view,
					ignoreAnimationPosition: this._ignoreAnimationPosition
				});

				vkCore.getEventBus().publish("sap.ui.vk", "readyForAnimation", {
					source: vsm,
					view: view,
					ignoreAnimationPosition: this._ignoreAnimationPosition
				});
				vsm._startHighlight();
			}
			// HACK: schedule firing of "readyForAnimation" event after camera and node transitions
			//       complete by increasing expected transition time interval as sometimes transitions end after
			//       this event was fired.
			// TODO, stage 1:
			//  - refactor ViewportGestureHandler.activateCamera to return Promise
			//  - refactor ViewStateManager._startTransitionHighlight to return Promise
			//  - replace setTimeout with Promise.all()
			// TODO, stage 2:
			//  - calling ViewStateManager._startTransitionHighlight will not work in case of multiple viewports. Refactor.
		}.bind(this), Math.max(timeIntervalForTransition, timeIntervalCameraChange) + 100);
	};

	/**
	 * Reset current view to its initial status
	 *
	 * @returns {sap.ui.vk.threejs.Viewport} returns this
	 * @private
	 * @since 1.67.0
	 */
	Viewport.prototype.resetCurrentView = function() {

		if (!this._currentView) {
			return this;
		}

		this._getViewStateManagerThreeJS()._resetNodesMaterialAndOpacityByCurrentView(this._currentView);
		this._getViewStateManagerThreeJS()._resetNodesStatusByCurrentView(this._currentView, true, false);

		this.setShouldRenderFrame();

		return this;
	};

	/**
	 * Activates the view based on view object passed
	 * @param {sap.ui.vk.View} view View object definition
	 * @param {boolean} playViewGroup true if view activation is part of playing view group
	 * @param {boolean} skipCameraTransitionAnimation true if not animating the change of camera
	 * @returns {sap.ui.vk.threejs.Viewport} returns this
	 * @public
	 * @since 1.52.0
	 */
	Viewport.prototype.activateView = function(view, playViewGroup, skipCameraTransitionAnimation) {
		if (this._isRedlineActivated()) {
			Log.error("activateView() method is disabled when Redlining is activated");
			return this;
		}
		this._clearAnnotations();
		this._activateSingleView(view, playViewGroup, skipCameraTransitionAnimation);
		return this;
	};

	/**
	 * Zooms the scene to a bounding box created from a particular set of nodes.
	 * @param {sap.ui.vk.ZoomTo|sap.ui.vk.ZoomTo[]} what What set of nodes to zoom to.
	 * @param {any} nodeRef Is used if what == (sap.ui.vk.ZoomTo.Node || ZoomTo.NodeSetIsolation)
	 * @param {float} crossFadeSeconds Time to perform the "fly to" animation. Set to 0 to do this immediately.
	 * @param {float} margin Margin. Set to 0 to zoom to the entire screen.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.zoomTo = function(what, nodeRef, crossFadeSeconds, margin) {
		var nativeScene = this._getNativeScene();
		var nativeCamera = this._getNativeCamera();
		if (!nativeCamera || !nativeScene) {
			return this;
		}

		margin = margin || 0;
		var boundingBox = new THREE.Box3();
		var quaternion = null;
		var node = null;
		(Array.isArray(what) ? what : [what]).forEach(function(what) {
			switch (what) {
				case ZoomTo.All:
					nativeScene._expandBoundingBox(boundingBox, false, true);
					break;
				case ZoomTo.Visible:
					nativeScene._expandBoundingBox(boundingBox, true, true);
					break;
				case ZoomTo.Selected:
					var vsm = this._getViewStateManagerThreeJS();
					if (vsm) {
						vsm.enumerateSelection(function(nodeRef) {
							nodeRef._expandBoundingBox(boundingBox, false, true);
						});
					}
					break;
				case ZoomTo.Node:
					if (!nodeRef) {
						return this;
					}
					node = nodeRef;
					if (Array.isArray(nodeRef)) {
						nodeRef.forEach(function(nodeRef) {
							nodeRef._expandBoundingBox(boundingBox, false, true);
						});
					} else {
						nodeRef._expandBoundingBox(boundingBox, false, true);
					}
					break;
				case ZoomTo.Restore:
					Log.error(getResourceBundle().getText("VIEWPORT_MSG_RESTORENOTIMPLEMENTED"));
					return this;
				case ZoomTo.NodeSetIsolation:
					Log.error(getResourceBundle().getText("VIEWPORT_MSG_NODESETISOLATIONNOTIMPLEMENTED"));
					return this;
				case ZoomTo.RestoreRemoveIsolation:
					Log.error(getResourceBundle().getText("VIEWPORT_MSG_RESTOREREMOVEISOLATIONNOTIMPLEMENTED"));
					return this;
				case ZoomTo.ViewLeft:
					quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
					break;
				case ZoomTo.ViewRight:
					quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
					break;
				case ZoomTo.ViewTop:
					quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
					break;
				case ZoomTo.ViewBottom:
					quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
					break;
				case ZoomTo.ViewBack:
					quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
					break;
				case ZoomTo.ViewFront:
					quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
					break;
				default:
					break;
			}
		}, this);

		if (!boundingBox.isEmpty()) {
			this._viewportGestureHandler.zoomTo(boundingBox, quaternion, margin, crossFadeSeconds * 1000, node, node !== null);
		}
		return this;
	};

	Viewport.prototype.pan = function(dx, dy) {
		this._viewportGestureHandler._cameraController.pan(dx, dy);
	};

	Viewport.prototype.rotate = function(dx, dy, isTurnTableMode) {
		this._viewportGestureHandler._cameraController.rotate(dx, dy, isTurnTableMode);
	};

	Viewport.prototype.zoom = function(dy) {
		this._viewportGestureHandler._cameraController.zoom(dy);
	};

	/**
	 * Retrieves information about the current camera view in the scene, and saves the information in a JSON-like object.
	 * The information can then be used at a later time to restore the scene to the same camera view using the
	 * {@link sap.ui.vk.Viewport#setViewInfo setViewInfo} method.<br/>
	 * @param {object}         [query]                       Query object which indicates what information to be retrieved.
	 * @param {boolean|object} [query.camera=true]           Indicator to retrieve camera information.
	 * @param {boolean}        [query.camera.matrices=false] Indicator to retrieve camera view and projection matrices.
	 * @param {boolean}        [query.camera.useTransitionCamera=false] Indicator to retrieve the transition camera properties instead of regular one's.
	 * @param {boolean|object} [query.visibility=false]      Indicator to retrieve visibility information.
	 * @param {sap.ui.vk.VisibilityMode} [query.visibility.mode=sap.ui.vk.VisibilityMode.Complete]
	 *                                                       Indicator to retrieve the complete visibility definition or just the difference.
	 * @param {boolean|object} [query.selection=false]       Indicator to retrieve selection information.
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
		var viewInfo = {};

		if (query == null) {
			query = {};
		}

		if (query.camera == null) {
			query.camera = true;
		}

		var nativeCamera = this._getNativeCamera();

		if (query.camera && nativeCamera) {
			var rotation = nativeCamera.rotation.clone();
			rotation.reorder("YXZ");

			viewInfo.camera = {
				rotation: {
					yaw: THREE.MathUtils.radToDeg(rotation.y),
					pitch: THREE.MathUtils.radToDeg(rotation.x),
					roll: THREE.MathUtils.radToDeg(rotation.z)
				},
				position: {
					x: nativeCamera.position.x,
					y: nativeCamera.position.y,
					z: nativeCamera.position.z
				},
				projectionType: nativeCamera.isOrthographicCamera ? CameraProjectionType.Orthographic : CameraProjectionType.Perspective,
				bindingType: CameraFOVBindingType.Vertical
			};

			var view = nativeCamera.view;
			if (view && view.enabled) { // Perspective camera RedLine mode is activated
				viewInfo.camera.view = {
					fullWidth: view.fullWidth,
					fullHeight: view.fullHeight,
					offsetX: view.offsetX,
					offsetY: view.offsetY,
					width: view.width,
					height: view.height
				};
			}

			if (viewInfo.camera.projectionType === CameraProjectionType.Perspective) {
				viewInfo.camera.fieldOfView = nativeCamera.fov; // perspective camera defines Field of View
			} else if (viewInfo.camera.projectionType === CameraProjectionType.Orthographic) {
				viewInfo.camera.zoomFactor = nativeCamera.zoom; // orthographic defines Zoom Factor
			}

			if (query.camera.matrices) {
				viewInfo.camera.matrices = {
					view: nativeCamera.matrixWorldInverse.elements.slice(),
					projection: nativeCamera.projectionMatrix.elements.slice()
				};
			}
		}

		if (query.visibility && this._viewStateManager) {
			var visibilityMode = query.visibility.mode == null ? VisibilityMode.Complete : query.visibility.mode;
			viewInfo.visibility = {
				mode: visibilityMode
			};
			if (visibilityMode === VisibilityMode.Complete) {
				var allVisibility = this._viewStateManager.getVisibilityComplete();
				viewInfo.visibility.visible = allVisibility.visible;
				viewInfo.visibility.hidden = allVisibility.hidden;
			} else if (this._viewStateManager.getShouldTrackVisibilityChanges()) {
				viewInfo.visibility.changes = this._viewStateManager.getVisibilityChanges();
			} else {
				Log.warning(getResourceBundle().getText(Messages.VIT32.summary), Messages.VIT32.code, "sap.ui.vk.threejs.Viewport");
			}
		}

		var vsm = this._getViewStateManagerThreeJS();
		if (query.selection && vsm) {
			viewInfo.selection = vsm._getSelectionComplete();
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
	 * @param {object}   [viewInfo.selection]                 A JSON-like object containing the selection information.
	 * @param {string[]} viewInfo.selection.selected          List of Ids of selected nodes.
	 * @param {string[]} viewInfo.selection.outlined          List of Ids of outlined nodes.
	 * @param {float}    [flyToDuration=0]                    Fly-to animation duration in seconds.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewport.prototype.setViewInfo = function(viewInfo, flyToDuration) {
		var nativeCamera = this._getNativeCamera();

		if (viewInfo.camera && nativeCamera) {
			var viCamera = viewInfo.camera;
			var newCamera = viCamera.projectionType === CameraProjectionType.Orthographic ? new THREE.OrthographicCamera() : new THREE.PerspectiveCamera();
			newCamera.userData = nativeCamera.userData;
			newCamera.aspect = nativeCamera.aspect;
			newCamera.position.copy(viCamera.position);
			var rotation = viCamera.rotation;
			newCamera.quaternion.setFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(rotation.pitch), THREE.MathUtils.degToRad(rotation.yaw), THREE.MathUtils.degToRad(rotation.roll), "YXZ"));
			newCamera.fov = viCamera.fieldOfView || newCamera.fov;
			newCamera.zoom = viCamera.zoomFactor || newCamera.zoom;
			newCamera.updateMatrix();
			newCamera.up.setFromMatrixColumn(newCamera.matrix, 1).normalize();

			if (nativeCamera.view && nativeCamera.view.enabled) { // RedLine mode is activated
				var view = viCamera.view || nativeCamera.view;
				newCamera.setViewOffset(view.fullWidth, view.fullHeight, view.offsetX, view.offsetY, view.width, view.height);
				if (nativeCamera.isPerspectiveCamera) {
					newCamera.aspect = view.fullWidth / view.fullHeight;
					newCamera.zoom = Math.min(newCamera.aspect, 1);
				}
			}

			this._viewportGestureHandler.activateCamera(newCamera, (flyToDuration || 0) * 1000);
		}

		var veIdToNodeRefMap = new Map();
		if (viewInfo.visibility || viewInfo.selection) {
			var nodeHierarchy = this._viewStateManager.getNodeHierarchy();
			if (nodeHierarchy) {
				var allNodeRefs = nodeHierarchy.findNodesByName();

				allNodeRefs.forEach(function(nodeRef) {
					// create node proxy based on dynamic node reference
					var nodeProxy = nodeHierarchy.createNodeProxy(nodeRef);
					var veId = nodeProxy.getVeId();
					// destroy the node proxy
					nodeHierarchy.destroyNodeProxy(nodeProxy);
					if (veId) {
						// push the ve id to either visible/hidden array
						veIdToNodeRefMap.set(veId, nodeRef);
					}
				});
			}
		}

		// restoring the visibility state
		if (viewInfo.visibility) {
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
					this._viewStateManager.resetVisibility();
					viewInfo.visibility.changes.forEach(function(veId) {
						var nodeRef = veIdToNodeRefMap.get(veId);
						// reverting the visibility for this particular node
						if (nodeRef) {
							this._viewStateManager.setVisibilityState(nodeRef, !this._viewStateManager.getVisibilityState(nodeRef), false);
						}
					}, this);
					break;

				default:
					Log.error(getResourceBundle().getText(Messages.VIT28.summary), Messages.VIT28.code, "sap.ui.vk.threejs.Viewport");
					break;
			}
		}

		var vsm = this._getViewStateManagerThreeJS();
		var selection = viewInfo.selection;
		if (selection && vsm) {
			var info = vsm._getSelectionComplete();

			if (Array.isArray(selection.selected)) {
				var selected = [];
				var unselected = [];
				selection.selected.forEach(function(veId) {
					var nodeRef = veIdToNodeRefMap.get(veId);
					if (nodeRef) {
						selected.push(nodeRef);
					}
				});
				info.selected.forEach(function(veId) {
					var nodeRef = veIdToNodeRefMap.get(veId);
					if (nodeRef && selection.selected.indexOf(veId) < 0) {
						unselected.push(nodeRef);
					}
				});
				vsm.setSelectionStates(selected, unselected, false, false);
			}

			if (Array.isArray(selection.outlined)) {
				var outlined = [];
				var unoutlined = [];
				selection.outlined.forEach(function(veId) {
					var nodeRef = veIdToNodeRefMap.get(veId);
					if (nodeRef) {
						outlined.push(nodeRef);
					}
				});
				info.outlined.forEach(function(veId) {
					var nodeRef = veIdToNodeRefMap.get(veId);
					if (nodeRef && selection.outlined.indexOf(veId) < 0) {
						unoutlined.push(nodeRef);
					}
				});
				vsm.setOutliningStates(outlined, unoutlined, false, false);
			}
		}

		this.setShouldRenderFrame();

		return this;
	};

	/**
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {sap.ui.vk.threejs.Viewport} returns this
	 * @public
	 */
	Viewport.prototype.queueCommand = function(command) {
		if (this instanceof Viewport) {
			command();
		}
		return this;
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
		var boundingClientRect = this.getDomRef().getBoundingClientRect();
		var viewportWidth = boundingClientRect.width;
		var viewportHeight = boundingClientRect.height;
		var relevantDimension;

		relevantDimension = Math.min(viewportWidth, viewportHeight);

		return {
			left: (viewportWidth - relevantDimension) / 2,
			top: (viewportHeight - relevantDimension) / 2,
			sideLength: relevantDimension
		};
	};

	/**
	 * Project 3D point to screen space
	 * @param {float} x X coordinate in world space
	 * @param {float} y Y coordinate in world space
	 * @param {float} z Z coordinate in world space
	 * @param {sap.ui.vk.Camera} camera Camera to be used with calculation of projection
	 * @private
	 * @returns {object} Object with x and y screen coordinates in pixels of projected point.
	 * Third parameter 'depth' is distance from the point to the camera normalized to camera's frustum (range from -1 to +1).
	 * The origin (0,0) of the screen space is in the left top corner, the Y axis points down.
	 */
	Viewport.prototype.projectToScreen = function(x, y, z, camera) {
		var viewportRect = this.getDomRef().getBoundingClientRect();
		var halfWidth = viewportRect.width / 2;
		var halfHeight = viewportRect.height / 2;
		var screenPoint = new THREE.Vector3(x, y, z).project(camera.getCameraRef());
		return {
			x: halfWidth + screenPoint.x * halfWidth,
			y: halfHeight - screenPoint.y * halfHeight,
			depth: screenPoint.z
		};
	};

	Viewport.prototype._createAndAddAnnotation = function(annotationData) {
		var annotationControl = Annotation.createAnnotation(annotationData, this);
		annotationControl.autoGenerated = true;
		annotationControl.setDisplay(this._viewStateManager.getVisibilityState(annotationData.node));
		this.addAnnotation(annotationControl);
		return annotationControl;
	};

	Viewport.prototype._createAnnotations = function() {
		if (this._annotationsCreated) {
			return this;
		}
		this._annotationsCreated = true;

		// If scene does not contain any Html annotation then we have nothing to do
		var annotations = this._scene && this._scene._getAnnotations();
		if (annotations == null || annotations.size === 0) {
			return this;
		}

		// Find all annotation nodes.
		//
		// If there is a view then find all annotation nodes in View.getNodeInfos() and extract
		// nodes and annotationIds from there. Then find matching annotation entries in
		// Scene#_getAnnotations().
		//
		// If there is no view then get all annotation nodes from Scene#_getAnnotations() as all of
		// them should be visualized.

		var view = this.getCurrentView();
		if (view) {
			view.getNodeInfos()
				.filter(function(nodeInfo) {
					var node = nodeInfo.target;
					return nodeInfo.annotationId != null && node._vkGetNodeContentType() === NodeContentType.Annotation && node.userData.annotationType === "html";
				})
				.forEach(function(nodeInfo) {
					var annotationNode = nodeInfo.target;
					var annotationData = annotations.get(nodeInfo.annotationId);
					assert(annotationData != null, "Cannot find annotation for node with sid=" + this._scene.nodeRefToPersistentId(annotationNode));
					if (annotationData != null) {
						assert(annotationNode === annotationData.node,
							"Annotation found for node with sid=" + this._scene.nodeRefToPersistentId(nodeInfo.target)
							+ " references other node with sid=" + this._scene.nodeRefToPersistentId(annotationData.node));
						if (annotationNode === annotationData.node) {
							this._createAndAddAnnotation(annotationData);
						}
					}
				}, this);
		} else {
			annotations.forEach(function(annotationData) {
				this._createAndAddAnnotation(annotationData);
			}, this);
		}

		// Set animation delays for each annotation to play one after another, not all at once
		var delay = 0;
		this.getAnnotations().forEach(function(annotation) {
			if (annotation.getAnimate() && annotation.getDisplay() && annotation.getAnimationDelay() === -1) {
				annotation.setAnimationDelay(delay++);
			}
		});

		return this;
	};

	/**
	 * Set the current Background node,
	 * if options is not set, switch the current Background node projection between sphere and plane;
	 *
	 * @param {object} [options] A map of parameters to create a background node, optional
	 * @param {string} options.sceneId scene Id
	 * @param {object} options.parametricContent parametric content object
	 * @returns {any[]} An array of Background nodes
	 * @private
	 * @experimental Since 1.82.0 This method is experimental and might be modified or removed in future versions
	 */
	Viewport.prototype.setBackgroundNode = function(options) {
		var nodeHierarchy = this._viewStateManager.getNodeHierarchy();
		var currBackgroundNode;
		var backgroundNodes = nodeHierarchy.findNodesByName().reduce(function(nodeInfos, currNode) {
			if (currNode._vkGetNodeContentType() === NodeContentType.Background) {
				if (this._viewStateManager.getVisibilityState(currNode)) { currBackgroundNode = currNode; }
				nodeInfos.push(currNode);
			}
			return nodeInfos;
		}.bind(this), []);

		if (!options) {
			// switch to the other background projection type
			this._viewStateManager.setVisibilityState(backgroundNodes, true, false);
			this._viewStateManager.setVisibilityState(currBackgroundNode, false, false);
			// reset camera to initial view
			this._viewportGestureHandler.setView(null, 1000);
		} else {
			var parametricContent = options.parametricContent;
			var materialId = parametricContent.materialId;
			var sceneId = options.sceneId;
			var backgroundNode = nodeHierarchy.createNode(
				currBackgroundNode && currBackgroundNode.parent, parametricContent.type, null, NodeContentType.Background, { parametricContent: parametricContent }
			);
			this._viewStateManager.setVisibilityState(backgroundNodes, false, false);
			backgroundNodes.push(backgroundNode);
			if (this._cdsLoader) {
				this._cdsLoader.assignMaterialToNodes(sceneId, materialId, backgroundNode.children);
			}
			var cameraView = parametricContent.type === "plane" ? (new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0)) : null;
			this._viewportGestureHandler.setView(cameraView, 1000);
		}
		return backgroundNodes;
	};

	/**
	 * Convert screen rectangle coordinates and size (in pixels) into coordinates and size relative to safe area in range -0.5 to +0.5
	 * @param {int} x Horizontal component in screen pixels
	 * @param {int} y Vertical component in screen pixels
	 * @param {int} width Rectangle width in screen pixels
	 * @param {int} height Rectangle height in screen pixels
	 * @return {object} Object with converted x, y, width and height in normalized units
	 * @private
	 */
	Viewport.prototype.normalizeRectangle = function(x, y, width, height) {
		var domRef = this.getSafeArea().getDomRef();
		// There will be no safe area object in AuthorViewport, fallback to viewport itself
		if (domRef == null) {
			domRef = this.getDomRef();
		}
		var computedStyle = window.getComputedStyle(domRef);
		var saWidth = parseFloat(computedStyle.width);
		var saLeft = parseFloat(computedStyle.left);

		var newX = (((x - saLeft)) / saWidth) - 0.5;

		var saHeight = parseFloat(computedStyle.height);
		var saTop = parseFloat(computedStyle.top);
		var newY = (((y - saTop)) / saHeight) - 0.5;

		return { x: newX, y: newY, width: width / saWidth, height: height / saHeight };
	};

	/**
	 * Convert normalized coordinates and size (relative to safe area in range -0.5 to +0.5) into screen rectangle coordinates and size (in pixels)
	 * @param {int} x Horizontal position
	 * @param {int} y Vertical position
	 * @param {int} width Rectangle width
	 * @param {int} height Rectangle height
	 * @return {object} Object with converted x, y, width and height in screen pixels
	 * @private
	 */
	Viewport.prototype.deNormalizeRectangle = function(x, y, width, height) {
		var domRef = this.getSafeArea().getDomRef();
		// There will be no safe area object in AuthorViewport, fallback to viewport itself
		if (domRef == null) {
			domRef = this.getDomRef();
		}
		var computedStyle = window.getComputedStyle(domRef);
		var saWidth = parseFloat(computedStyle.width);
		var saLeft = parseFloat(computedStyle.left);
		var saHalfWidth = saWidth / 2;
		var saHCenter = saLeft + saHalfWidth;

		var newX = Math.abs(x) * 2;
		if (x < 0) {
			newX = 1 - newX;
			newX *= saHalfWidth;
			newX += saLeft;
		} else if (x > 0) {
			newX *= saHalfWidth;
			newX += saHCenter;
		} else {
			newX = saHCenter;
		}

		var newWidth = Math.abs(width) * 2 * saHalfWidth;

		var saHeight = parseFloat(computedStyle.height);
		var saTop = parseFloat(computedStyle.top);
		var saHalfHeight = saHeight / 2;
		var saVCenter = saTop + saHalfHeight;

		var newY = Math.abs(y) * 2;
		if (y < 0) {
			newY = 1 - newY;
			newY *= saHalfHeight;
			newY += saTop;
		} else if (y > 0) {
			newY *= saHalfHeight;
			newY += saVCenter;
		} else {
			newY = saVCenter;
		}

		var newHeight = Math.abs(height) * 2 * saHalfHeight;

		return { x: newX, y: newY, width: newWidth, height: newHeight };
	};

	// An array of the following structures:
	// type RegistryEntry = {
	//   scene: sap.ui.vk.threejs.Scene
	//   webGLRenderer: THREE.WebGLRenderer
	//   viewports: sap.ui.vk.threejs.Viewport[]
	// }
	var registryEntries = [];

	/**
	 * Register the viewport's intention to render the scene.
	 *
	 * If this is the first viewport being registered for the scene a new 3D canvas is to be created.
	 * This newly created 3D canvas can be used by the viewport directly.
	 *
	 * If this is the second viewport being registered for the scene the 3D canvas used by the first
	 * viewport becomes shared, and both the first and the second viewports will use 2D canvases and
	 * copy images from the shared 3D canvas.
	 *
	 * The subsequent viewports just get their own 2D canvases and use the shared 3D canvas.
	 *
	 * @param {sap.ui.vk.threejs.Viewport} viewport A viewport to register.
	 * @param {sap.ui.vk.threejs.Scene}    scene    A scene that is to be rendered by the viewport.
	 * @inner
	 */
	function registerRendering(viewport, scene) {
		var registryEntryIndex = findIndexInArray(registryEntries, function(registryEntry) { return registryEntry.scene === scene; });

		if (registryEntryIndex < 0) {
			// As there is no renderer registered for the scene this viewport is the first to be registered.
			// No webGLRenderer for the scene yet, create one.
			var webGLRenderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true
			});
			webGLRenderer.setPixelRatio(window.devicePixelRatio);
			webGLRenderer.setSize(1, 1); // Set a dummy size, a resize event will correct this later.
			webGLRenderer.shadowMap.enabled = true;

			viewport._registryEntry = {
				scene: scene,
				webGLRenderer: webGLRenderer,
				viewports: [viewport]
			};
			registryEntries.push(viewport._registryEntry);

			viewport._renderer = webGLRenderer;
			// Use the 3D canvas directly as this is the only viewport to use this newly created WebGLRenderer.
			viewport._canvas = webGLRenderer.domElement;
			viewport.invalidate();
		} else {
			// There is a webGLRenderer for the scene and at least one viewport.
			var registryEntry = registryEntries[registryEntryIndex];
			var viewports = registryEntry.viewports;
			var viewportIndex = viewports.indexOf(viewport);

			if (viewportIndex < 0) {
				if (viewports.length == 1) {
					// When the second viewport is registered for the scene the canvas used by the first viewport goes
					// *offscreen*, and the first viewport gets a 2D canvas.
					var firstViewport = viewports[0];
					firstViewport._canvas = document.createElement("canvas");
					// Request HTML re-rendering of the first viewport to call `onAfterRendering()`.
					firstViewport.invalidate();
				}
				viewports.push(viewport);
				viewport._registryEntry = registryEntry;
				viewport._renderer = registryEntry.webGLRenderer;
				// Create a 2D canvas for the viewport.
				viewport._canvas = document.createElement("canvas");
				viewport.invalidate();
			}
		}
	}

	/**
	 * Deregister the viewport's intention to render the scene.
	 *
	 * If this is the penultimate viewport the last remaining viewport can start using the 3D canvas
	 * directly.
	 *
	 * If this is the last viewport the 3D canvas is to be released.
	 *
	 * @param {sap.ui.vk.threejs.Viewport} viewport A viewport to deregister.
	 * @param {sap.ui.vk.threejs.Scene}    scene    A scene that was being rendered by the viewport.
	 * @inner
	 */
	function deregisterRendering(viewport, scene) {
		var registryEntryIndex = findIndexInArray(registryEntries, function(registryEntry) { return registryEntry.scene === scene; });

		if (registryEntryIndex < 0) {
			return;
		}

		var registryEntry = registryEntries[registryEntryIndex];
		var viewports = registryEntry.viewports;
		var viewportIndex = viewports.indexOf(viewport);

		if (viewportIndex < 0) {
			return;
		}

		viewports.splice(viewportIndex, 1);

		if (viewports.length == 1) {
			// The remaining viewport can use the canvas directly.
			var lastViewport = viewports[0];
			lastViewport._canvas = registryEntry.webGLRenderer.domElement;
			// Request HTML re-rendering of the last remaining viewport to call `onAfterRendering()`.
			lastViewport.invalidate();
		} else if (viewports.length === 0) {
			// Time to delete the webGLRenderer.
			registryEntry.webGLRenderer.renderLists.dispose();
			registryEntry.webGLRenderer.dispose();
			registryEntries.splice(registryEntryIndex, 1);
		}

		viewport._registryEntry = null;
		viewport._canvas = null;
		viewport._renderer = null;

		viewport.invalidate();
	}

	/**
	 * Adjust the 3D canvas to fit all the viewports.
	 *
	 * The width of the 3D canvas equals the width of the widest viewport. The height of the 3D canvas equals the height
	 * of the highest viewport.
	 *
	 * @param {object} registryEntry An object containing a WebGLRender and viewports that use it.
	 * @inner
	 */
	function adjustWebGLRendererSize(registryEntry) {
		var maxWidth = 0;
		var maxHeight = 0;
		registryEntry.viewports.forEach(function(viewport) {
			maxWidth = Math.max(maxWidth, viewport._width);
			maxHeight = Math.max(maxHeight, viewport._height);
		});

		registryEntry.webGLRenderer.setSize(maxWidth, maxHeight, true);
	}

	Viewport.prototype.getMeasurementSurface = function() {
		return this._measurementSurface;
	};

	return Viewport;
});
