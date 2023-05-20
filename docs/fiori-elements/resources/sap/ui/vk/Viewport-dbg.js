/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Viewport.
sap.ui.define([
	"sap/base/util/ObjectPath",
	"./ViewportBase",
	"./ViewStateManager",
	"./ViewportRenderer",
	"./VisibilityMode",
	"./RenderMode",
	"./Scene",
	"./Camera",
	"sap/base/Log"
], function(
	ObjectPath,
	ViewportBase,
	ViewStateManager,
	ViewportRenderer,
	VisibilityMode,
	RenderMode,
	Scene,
	Camera,
	Log
) {
	"use strict";

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
	 * @alias sap.ui.vk.Viewport
	 * @since 1.50.0
	 */
	var Viewport = ViewportBase.extend("sap.ui.vk.Viewport", /** @lends sap.ui.vk.Viewport.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			designtime: "sap/ui/vk/designtime/Viewport.designtime"
		}
	});

	var basePrototype = Viewport.getMetadata().getParent().getClass().prototype;

	Viewport.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._implementation = null;
	};

	Viewport.prototype.exit = function() {
		this._destroyImplementation();

		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}
	};

	Viewport.prototype.getImplementation = function() {
		return this._implementation;
	};

	Viewport.prototype._destroyImplementation = function() {
		if (this._implementation) {
			// Take aggregations back from implementation
			// They will be set to implementation viewport if it's created
			var content = this.removeAllContent();
			var that = this;
			content.forEach(function(c) {
				that.addAggregation("content", c);
			});
			this.setAggregation("safeArea", this._implementation.getSafeArea());

			this._implementation.destroy();
			this._implementation = null;
		}
		return this;
	};

	////////////////////////////////////////////////////////////////////////
	// Propagate public properties to implementation

	Viewport.prototype.getShowDebugInfo = function() {
		if (this._implementation) {
			return this._implementation.getShowDebugInfo();
		}
		return basePrototype.getShowDebugInfo.call(this);
	};

	Viewport.prototype.setShowDebugInfo = function(value) {
		basePrototype.setShowDebugInfo.call(this, value);
		if (this._implementation) {
			this._implementation.setShowDebugInfo(value);
		}
		return this;
	};

	Viewport.prototype.getAutoStartRendering = function() {
		if (this._implementation) {
			return this._implementation.getAutoStartRendering();
		}
		return basePrototype.getAutoStartRendering.call(this);
	};

	Viewport.prototype.setAutoStartRendering = function(value) {
		basePrototype.setAutoStartRendering.call(this, value);
		if (this._implementation) {
			this._implementation.setAutoStartRendering(value);
		}
		return this;
	};


	Viewport.prototype.getBackgroundColorTop = function() {
		if (this._implementation) {
			return this._implementation.getBackgroundColorTop();
		}
		return basePrototype.getBackgroundColorTop.call(this);
	};

	Viewport.prototype.setBackgroundColorTop = function(value) {
		basePrototype.setBackgroundColorTop.call(this, value);
		if (this._implementation) {
			this._implementation.setBackgroundColorTop(value);
		}
		return this;
	};

	Viewport.prototype.getBackgroundColorBottom = function() {
		if (this._implementation) {
			return this._implementation.getBackgroundColorBottom();
		}
		return basePrototype.getBackgroundColorBottom.call(this);
	};

	Viewport.prototype.setBackgroundColorBottom = function(value) {
		basePrototype.setBackgroundColorBottom.call(this, value);
		if (this._implementation) {
			this._implementation.setBackgroundColorBottom(value);
		}
		return this;
	};

	Viewport.prototype.setWidth = function(value) {
		basePrototype.setWidth.call(this, value);
		if (this._implementation) {
			this._implementation.setWidth(value);
		}
		return this;
	};

	Viewport.prototype.setHeight = function(value) {
		basePrototype.setHeight.call(this, value);
		if (this._implementation) {
			this._implementation.setHeight(value);
		}
		return this;
	};

	Viewport.prototype.setSelectionMode = function(value) {
		this.setProperty("selectionMode", value, true);
		if (this._implementation) {
			this._implementation.setProperty("selectionMode", value, true);
		}
		return this;
	};

	Viewport.prototype.getSelectionMode = function() {
		if (this._implementation) {
			return this._implementation.getSelectionMode();
		}
		return basePrototype.getSelectionMode.call(this);
	};

	Viewport.prototype.setSelectionDisplayMode = function(value) {
		basePrototype.setSelectionDisplayMode.call(this, value);
		if (this._implementation) {
			this._implementation.setSelectionDisplayMode(value);
		}
		return this;
	};

	Viewport.prototype.getSelectionDisplayMode = function() {
		if (this._implementation) {
			return this._implementation.getSelectionDisplayMode();
		}
		return basePrototype.getSelectionDisplayMode.call(this);
	};

	Viewport.prototype.setShowSelectionBoundingBoxes = function(value) {
		basePrototype.setShowSelectionBoundingBoxes.call(this, value);
		if (this._implementation) {
			this._implementation.setShowSelectionBoundingBoxes(value);
		}
		return this;
	};

	Viewport.prototype.getShowSelectionBoundingBoxes = function() {
		if (this._implementation) {
			return this._implementation.getShowSelectionBoundingBoxes();
		}
		return basePrototype.getShowSelectionBoundingBoxes.call(this);
	};

	Viewport.prototype.setShowSafeArea = function(value) {
		basePrototype.setShowSafeArea.call(this, value);
		if (this._implementation) {
			this._implementation.setShowSafeArea(value);
		}
		return this;
	};

	Viewport.prototype.getShowSafeArea = function() {
		if (this._implementation) {
			return this._implementation.getShowSafeArea();
		}
		return basePrototype.getShowSafeArea.call(this);
	};

	Viewport.prototype.setShowAllHotspots = function(value) {
		basePrototype.setShowAllHotspots.call(this, value);
		if (this._implementation) {
			this._implementation.setShowAllHotspots(value);
		}
		return this;
	};

	Viewport.prototype.getShowAllHotspots = function() {
		if (this._implementation) {
			return this._implementation.getShowAllHotspots();
		}
		return basePrototype.getShowAllHotspots.call(this);
	};

	Viewport.prototype.setDisableHotspotHovering = function(value) {
		basePrototype.setDisableHotspotHovering.call(this, value);
		if (this._implementation) {
			this._implementation.setDisableHotspotHovering(value);
		}
		return this;
	};

	Viewport.prototype.getDisableHotspotHovering = function() {
		if (this._implementation) {
			return this._implementation.getDisableHotspotHovering();
		}
		return basePrototype.getDisableHotspotHovering.call(this);
	};

	Viewport.prototype.setHotspotColorABGR = function(value) {
		basePrototype.setHotspotColorABGR.call(this, value);
		if (this._implementation) {
			this._implementation.setHotspotColorABGR(value);
		}
		return this;
	};

	Viewport.prototype.getHotspotColorABGR = function() {
		if (this._implementation) {
			return this._implementation.getHotspotColorABGR();
		}
		return basePrototype.getHotspotColorABGR.call(this);
	};

	Viewport.prototype.setHotspotColor = function(value) {
		basePrototype.setHotspotColor.call(this, value);
		if (this._implementation) {
			this._implementation.setHotspotColor(value);
		}
		return this;
	};

	Viewport.prototype.getHotspotColor = function() {
		if (this._implementation) {
			return this._implementation.getHotspotColor();
		}
		return basePrototype.getHotspotColor.call(this);
	};

	Viewport.prototype.setKeepOutputSize = function(value) {
		if (this._implementation && this._implementation.setKeepOutputSize) {
			this._implementation.setKeepOutputSize(value);
		} else {
			this.setProperty("keepOutputSize", value);
		}
	};

	Viewport.prototype.getKeepOutputSize = function() {
		if (this._implementation && this._implementation.getKeepOutputSize) {
			return this._implementation.getKeepOutputSize();
		}
		return this.getProperty("keepOutputSize");
	};

	Viewport.prototype.setShowAllHotspotsTintColor = function(color) {
		if (this._implementation && this._implementation.setShowAllHotspotsTintColor) {
			this._implementation.setShowAllHotspotsTintColor(color);
		} else {
			this.setProperty("showAllHotspotsTintColor", color);
		}
	};

	Viewport.prototype.getShowAllHotspotsTintColor = function(color) {
		if (this._implementation && this._implementation.getShowAllHotspotsTintColor) {
			this._implementation.getShowAllHotspotsTintColor(color);
		} else {
			this.getProperty("showAllHotspotsTintColor", color);
		}
	};

	Viewport.prototype.setCamera = function(value) {
		basePrototype.setCamera.call(this, value);
		if (this._implementation) {
			this._implementation.setCamera(value);
			return this;
		}

		return this;
	};

	Viewport.prototype.getCamera = function() {
		if (this._implementation) {
			return this._implementation.getCamera();
		}
		return basePrototype.getCamera.call(this);
	};

	Viewport.prototype.setShouldRenderFrame = function() {
		if (this._implementation) {
			this._implementation.setShouldRenderFrame();
		}
		return this;
	};

	Viewport.prototype.shouldRenderFrame = function() {
		if (this._implementation) {
			this._implementation.shouldRenderFrame();
		}
	};

	Viewport.prototype.setRenderMode = function(value) {
		if (this._implementation && this._implementation.setRenderMode) {
			this._implementation.setRenderMode(value);
		}
		return this;
	};

	Viewport.prototype.getRenderMode = function() {
		if (this._implementation && this._implementation.getRenderMode) {
			return this._implementation.getRenderMode();
		}
		return RenderMode.Default;
	};

	Viewport.prototype.setFreezeCamera = function(value) {
		basePrototype.setFreezeCamera.call(this, value);

		if (this._implementation) {
			this._implementation.setFreezeCamera(value);
		}
		return this;
	};

	/**
	 * @param {any|any[]} nodeRefs The node reference or the array of node references that we want to tint.
	 * @param {boolean} show Whether to highlight the nodes or remove the highlight.
	 * @param {int|sap.ui.core.CSSColor} color The color to use for highlighting the nodes passed as argument.
	 * @return {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewport.prototype.showHotspots = function(nodeRefs, show, color) {
		if (this._implementation && this._implementation.showHotspots) {
			this._implementation.showHotspots(nodeRefs, show, color);
		}
		return this;
	};

	/////////////////////////////////////////////////////////////////////
	// Forward tool association methods to the implementation object

	Viewport.prototype.addTool = function(tool) {
		this.addAssociation("tools", tool);

		if (this._implementation) {
			this._implementation.addTool(tool);
		}
	};

	Viewport.prototype.removeTool = function(tool) {
		this.removeAssociation("tools", tool);

		if (this._implementation) {
			this._implementation.removeTool(tool);
		}
	};

	Viewport.prototype.getTools = function() {
		if (this._implementation) {
			return this._implementation.getTools();
		}

		return this.getAssociation("tools", []);
	};

	Viewport.prototype.removeAllTools = function() {
		this.removeAllAssociation("tools");

		if (this._implementation) {
			this._implementation.removeAllTools();
		}
	};

	/////////////////////////////////////////////////////////////////////
	// Forward content aggregation methods to the implementation object

	Viewport.prototype.addContent = function(content) {
		if (this._implementation) {
			this._implementation.addContent(content);
		} else {
			this.addAggregation("content", content);
		}
	};

	Viewport.prototype.removeContent = function(content) {
		if (this._implementation) {
			return this._implementation.removeContent(content);
		}

		return this.removeAggregation("content", content);
	};

	Viewport.prototype.getContent = function() {
		if (this._implementation) {
			return this._implementation.getContent();
		}
		return this.getAggregation("content");
	};

	Viewport.prototype.removeAllContent = function() {
		if (this._implementation) {
			return this._implementation.removeAllContent();
		}

		return this.removeAggregation("content");
	};

	Viewport.prototype.setOutputSettings = function(outputSettings) {
		if (this._implementation && this._implementation.setOutputSettings) {
			this._implementation.setOutputSettings(outputSettings);
		} else {
			this.setAggregation("outputSettings", outputSettings);
		}
	};

	Viewport.prototype.getOutputSettings = function() {
		if (this._implementation && this._implementation.getOutputSettings) {
			return this._implementation.getOutputSettings();
		}
		return this.getAggregation("outputSettings");
	};

	Viewport.prototype.removeOutputSettings = function() {
		if (this._implementation) {
			return this._implementation.removeAggregation("outputSettings");
		}
		return this.removeAggregation("outputSettings");
	};

	/////////////////////////////////////////////////////////////////////
	// Forward SafeArea aggregation methods to the implementation object

	Viewport.prototype.setSafeArea = function(safeArea) {
		if (this._implementation) {
			this._implementation.setSafeArea(safeArea);
		} else {
			this.setAggregation("safeArea", safeArea);
		}
	};

	Viewport.prototype.getSafeArea = function() {
		if (this._implementation) {
			return this._implementation.getSafeArea();
		}
		return this.getAggregation("safeArea");
	};

	Viewport.prototype.removeSafeArea = function() {
		if (this._implementation) {
			return this._implementation.removeAggregation("safeArea");
		}
		return this.removeAggregation("safeArea");
	};

	/////////////////////////////////////////////////////////////////////
	// Forward annotation aggregation methods to the implementation object

	Viewport.prototype.addAnnotation = function(annotation) {
		if (this._implementation) {
			this._implementation.addAnnotation(annotation);
		} else {
			this.addAggregation("annotations", annotation);
		}
	};

	Viewport.prototype.destroyAnnotations = function() {
		if (this._implementation) {
			return this._implementation.destroyAnnotations();
		}

		return this.destroyAggregation("annotations");
	};

	Viewport.prototype.getAnnotations = function() {
		if (this._implementation) {
			return this._implementation.getAnnotations();
		}
		return this.getAggregation("annotations");
	};

	/**
	 * Get the Symbol node from nodeId,
	 * if nodeId is not set, returns a collection of all Symbol nodes
	 *
	 * @param {string} nodeId node Id string, optional
	 * @returns {any[]} An array of nodes
	 * @public
	 * @experimental Since 1.82.0 This method is experimental and might be modified or removed in future versions
	 */
	Viewport.prototype.getSymbolNodes = function(nodeId) {
		if (this._implementation && this._implementation.getSymbolNodes) {
			return this._implementation.getSymbolNodes(nodeId);
		}
		return [];
	};

	Viewport.prototype.indexOfAnnotation = function(annotation) {
		if (this._implementation) {
			return this._implementation.indexOfAnnotation(annotation);
		}

		return this.indexOfAggregation("annotations", annotation);
	};

	Viewport.prototype.removeAllAnnotations = function() {
		if (this._implementation) {
			return this._implementation.removeAllAnnotations();
		}

		return this.removeAggregation("annotations");
	};

	Viewport.prototype.removeAnnotation = function(annotation) {
		if (this._implementation) {
			return this._implementation.removeAnnotation(annotation);
		}

		return this.removeAggregation("annotations", annotation);
	};

	Viewport.prototype.insertAnnotation = function(annotation, index) {
		if (this._implementation) {
			return this._implementation.insertAnnotation(annotation, index);
		}

		return this.insertAggregation("annotations", annotation, index);
	};

	/**
	 * Get current view -  remembered when activateView function is called
	 *
	 * @returns {sap.ui.vk.View} current view
	 * @public
	 */
	Viewport.prototype.getCurrentView = function() {
		if (this._implementation && this._implementation.getCurrentView) {
			return this._implementation.getCurrentView();
		}
		return null;
	};


	Viewport.prototype.pan = function(dx, dy) {
		if (this._implementation && this._implementation.pan) {
			this._implementation.pan(dx, dy);
		}
	};

	Viewport.prototype.rotate = function(dx, dy) {
		if (this._implementation && this._implementation.rotate) {
			this._implementation.rotate(dx, dy);
		}
	};

	Viewport.prototype.zoom = function(dy) {
		if (this._implementation && this._implementation.zoom) {
			this._implementation.zoom(dy);
		}
	};

	////////////////////////////////////////////////////////////////////////
	// Content connector handling begins.

	// Overridden sap.ui.vk.ViewportBase#_setContent.
	Viewport.prototype._setContent = function(content) {
		basePrototype._setContent.apply(this, arguments);

		if (content instanceof HTMLImageElement || content instanceof HTMLObjectElement) {
			this._setImage(content);
			return this;
		}

		var scene = null;
		var camera = null;

		if (content) {
			scene = content;
			if (!(scene instanceof Scene)) {
				scene = null;
			}
			camera = content.camera;
			if (!(camera instanceof Camera)) {
				camera = null;
			}
		}

		this._setScene(scene);

		if (camera) { // camera is optional so only set it if exist
			this.setCamera(camera);
		}

		return this;
	};

	Viewport.prototype._setImage = function(image) {
		var nativeViewportImplementationType = "sap.ui.vk.NativeViewport";
		if (!this._implementation || this._implementation.getMetadata().getName() !== nativeViewportImplementationType) {
			this._destroyImplementation();

			var Class = ObjectPath.get(nativeViewportImplementationType);
			this._implementation = new Class({
				tools: this.getAssociation("tools"),
				content: this.getContent(),
				contentConnector: this.getAssociation("contentConnector")
			});
			this._implementation.setParent(this);
			this.invalidate();
		}
		return this;
	};

	Viewport.prototype._setScene = function(scene) {
		if (scene instanceof Scene) {
			var sceneType = scene.getMetadata().getName(),
				implementationType = this._implementation && this._implementation.getMetadata().getName(),
				reuseImplementation = sceneType === "sap.ui.vk.dvl.Scene" && implementationType === "sap.ui.vk.dvl.Viewport" ||
					sceneType === "sap.ui.vk.threejs.Scene" && implementationType === "sap.ui.vk.threejs.Viewport" ||
					sceneType === "sap.ui.vk.svg.Scene" && implementationType === "sap.ui.vk.svg.Viewport";

			if (!reuseImplementation) {
				this._destroyImplementation();
				var newImplementationType;
				var camera = this.getCamera();

				if (sceneType === "sap.ui.vk.dvl.Scene") {
					newImplementationType = "sap.ui.vk.dvl.Viewport";
				} else if (sceneType === "sap.ui.vk.threejs.Scene") {
					newImplementationType = "sap.ui.vk.threejs.Viewport";
				} else if (sceneType === "sap.ui.vk.svg.Scene") {
					newImplementationType = "sap.ui.vk.svg.Viewport";
				}

				if (newImplementationType) {
					// The Viewport implementation classes from the `dvl`, `threejs` and `svg` namespaces are loaded by
					// the corresponding content managers, so there is no need to load them here. We can safely assume
					// that they are available at this point.
					var Class = ObjectPath.get(newImplementationType);
					this._implementation = new Class({
						viewStateManager: this.getViewStateManager(),
						tools: this.getAssociation("tools"),
						content: this.getContent(),
						outputSettings: this.getOutputSettings(),
						safeArea: this.getSafeArea(),
						showSafeArea: this.getShowSafeArea(),
						showAllHotspots: this.getShowAllHotspots(),
						showAllHotspotsTintColor: this.getShowAllHotspotsTintColor(),
						disableHotspotHovering: this.getDisableHotspotHovering(),
						hotspotColorABGR: this.getHotspotColorABGR(),
						keepOutputSize: this.getKeepOutputSize(),
						showDebugInfo: this.getShowDebugInfo(),
						width: this.getWidth(),
						height: this.getHeight(),
						backgroundColorTop: this.getBackgroundColorTop(),
						backgroundColorBottom: this.getBackgroundColorBottom(),
						selectionMode: this.getSelectionMode(),
						selectionDisplayMode: this.getSelectionDisplayMode(),
						showSelectionBoundingBoxes: this.getShowSelectionBoundingBoxes(),
						freezeCamera: this.getFreezeCamera(),
						renderMode: this.getRenderMode(),
						autoStartRendering: this.getAutoStartRendering()
					});
					this._implementation.setContentConnector(this.getContentConnector());
					var annotations = this.getAggregation("annotations");
					if (annotations) {

						// Pass all annotation aggregations to the implementation viewport
						annotations.forEach(function(annotation) {
							this.removeAggregation("annotations", annotation);
							this._implementation.addAnnotation(annotation);
						}, this);
					}

					// pass the camera, if we have one
					if (camera) {
						this._camera = null; // proxy no longer owns the camera
						this._implementation.setCamera(camera); // forward the camera to implementation
					}

					this._implementation.setParent(this);
				}

				this.invalidate();
			}
		} else {
			this._destroyImplementation();
			this.invalidate();
		}
		return this;
	};

	// Content connector handling ends.
	////////////////////////////////////////////////////////////////////////

	Viewport.prototype.onSetViewStateManager = function(viewStateManager) {
		if (this._implementation) {
			this._implementation.setViewStateManager(viewStateManager);
		}
	};

	Viewport.prototype.onUnsetViewStateManager = function(viewStateManager) {
		if (this._implementation) {
			this._implementation.setViewStateManager(null);
		}
	};

	/**
	 * Calls activateView with view definition
	 *
	 * @param {sap.ui.vk.View} view object definition
	 * @param {boolean} playViewGroup true if view activation is part of playing view group
	 * @param {boolean} skipCameraTransitionAnimation true if not animating the change of camera
	 * @returns {sap.ui.vk.Viewport} returns this
	 * @public
	 */
	Viewport.prototype.activateView = function(view, playViewGroup, skipCameraTransitionAnimation) {
		if (this._implementation) {
			this._implementation.activateView(view, playViewGroup, skipCameraTransitionAnimation);
			return this;
		} else {
			Log.error("no implementation");
			return this;
		}
	};

	/**
	 * Reset current view to its initial status
	 *
	 * @returns {sap.ui.vk.Viewport} returns this
	 * @private
	 * @since 1.67.0
	 */
	Viewport.prototype.resetCurrentView = function() {
		if (this._implementation && this._implementation.resetCurrentView) {
			this._implementation.resetCurrentView();
			return this;
		} else {
			Log.error("no implementation");
			return this;
		}
	};


	/**
	 * Zooms the scene to a bounding box created from a particular set of nodes.
	 *
	 * @param {sap.ui.vk.ZoomTo|sap.ui.vk.ZoomTo[]} what What set of nodes to zoom to.
	 * @param {any} nodeRef Is only used if what == sap.ui.vk.ZoomTo.Node.
	 * @param {float} crossFadeSeconds Time to perform the "fly to" animation. Set to 0 to do this immediately.
	 * @param {float} margin Margin. Set to 0 to zoom to the entire screen.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	Viewport.prototype.zoomTo = function(what, nodeRef, crossFadeSeconds, margin) {
		if (this._implementation) {
			this._implementation.zoomTo(what, nodeRef, crossFadeSeconds, margin);
		} else {
			Log.error("zoomTo: no implementation");
		}
		return this;
	};

	/**
	 * Executes a click or tap gesture.
	 *
	 * @param {int} x The tap gesture's x-coordinate.
	 * @param {int} y The tap gesture's y-coordinate.
	 * @param {boolean} isDoubleClick Indicates whether the tap gesture should be interpreted as a double-click. A value of <code>true</code> indicates a double-click gesture, and <code>false</code> indicates a single click gesture.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewport.prototype.tap = function(x, y, isDoubleClick) {
		if (this._implementation) {
			this._implementation.tap(x, y, isDoubleClick);
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
		if (this._implementation && this._implementation.tapObject) {
			this._implementation.tapObject(nodeRef);
		}
		return this;
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

	var setDefaultQuerySelection = function(effectiveQuery) {
		effectiveQuery.selection = false;
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
		if (!this._implementation) {
			Log.error("no implementation");
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
			setDefaultQuerySelection(effectiveQuery);
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

			if (typeof query.selection === "boolean") {
				effectiveQuery.selection = query.selection;
			} else if ("selection" in query) {
				// If selection is defined but is not of type boolean, this is an error.
				effectiveQuery.selection = false;
			} else {
				// If selection is not defined, use default value.
				setDefaultQuerySelection(effectiveQuery);
			}
		}

		return this._implementation.getViewInfo(effectiveQuery);
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
		if (this._implementation) {
			this._implementation.setViewInfo(viewInfo, flyToDuration);
		} else {
			Log.error("no implementation");
		}

		return this;
	};

	/**
	 * Returns viewport content as an image of desired size.
	 *
	 * @param {int} width Requested image width in pixels (allowed values 8 to 2048)
	 * @param {int} height Requested image height in pixels (allowed values 8 to 2048)
	 * @param {string} topColor The sap.ui.core.CSSColor to be used for top background color
	 * @param {string} bottomColor The sap.ui.core.CSSColor to be used for bottom background color
	 * @param {boolean} includeSelection Include selected nodes
	 * @returns {string} Base64 encoded PNG image
	 * @public
	 */
	Viewport.prototype.getImage = function(width, height, topColor, bottomColor, includeSelection) {
		if (this._implementation && this._implementation.getImage) {
			return this._implementation.getImage(width, height, topColor, bottomColor, includeSelection);
		}

		return null;
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
		if (this._implementation && this._implementation.projectToScreen) {
			return this._implementation.projectToScreen(x, y, z, camera);
		}
		return basePrototype.projectToScreen(x, y, z, camera);
	};

	/**
	 * Convert screen rectangle coordinates and size (in pixels) into coordinates and size relative to safe area in range -0.5 to +0.5
	 * @param {int} x Horizontal position in screen pixels
	 * @param {int} y Vertical position in screen pixels
	 * @param {int} width Rectangle width in screen pixels
	 * @param {int} height Rectangle height in screen pixels
	 * @return {object} Object with converted x, y, width and height in normalized units
	 * @private
	 */
	Viewport.prototype.normalizeRectangle = function(x, y, width, height) {
		if (this._implementation && this._implementation.normalizeRectangle) {
			return this._implementation.normalizeRectangle(x, y, width, height);
		}
		return basePrototype.normalizeRectangle(x, y, width, height);
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
		if (this._implementation && this._implementation.deNormalizeRectangle) {
			return this._implementation.deNormalizeRectangle(x, y, width, height);
		}
		return basePrototype.deNormalizeRectangle(x, y, width, height);
	};

	Viewport.prototype.getMeasurementSurface = function() {
		var impl = this._implementation;
		return impl == null ? null : impl.getMeasurementSurface();
	};

	Viewport.prototype.getShowAllHotspotsTintColorDef = function() {
		if (this._implementation && this._implementation.getShowAllHotspotsTintColorDef) {
			return this._implementation.getShowAllHotspotsTintColorDef();
		}

		return this;
	};

	return Viewport;
});
