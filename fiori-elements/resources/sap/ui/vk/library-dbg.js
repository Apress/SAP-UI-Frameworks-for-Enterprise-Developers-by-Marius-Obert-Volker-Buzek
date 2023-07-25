/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

/* global escape */

/**
 * Initialization Code and shared classes of library sap.ui.vk.
 *
 * For backward compatibility all enums and standalone functions are pulled in via sap.ui.define in order
 * to be available in legacy applications via sap.ui.vk.*.
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/base/util/ObjectPath",
	"sap/ui/core/library",
	"./BillboardBorderLineStyle",
	"./BillboardCoordinateSpace",
	"./BillboardHorizontalAlignment",
	"./BillboardStyle",
	"./BillboardTextEncoding",
	"./CameraFOVBindingType",
	"./CameraProjectionType",
	"./ContentResourceSourceCategory",
	"./ContentResourceSourceTypeToCategoryMap",
	"./DetailViewShape",
	"./DetailViewType",
	"./DvlException",
	"./IncludeUsageIdType",
	"./LeaderLineMarkStyle",
	"./MapContainerButtonType",
	"./Redline",
	"./RenderMode",
	"./SelectionMode",
	"./TransformationMatrix",
	"./VisibilityMode",
	"./ZoomTo",
	"./abgrToColor",
	"./colorToABGR",
	"./cssColorToColor",
	"./colorToCSSColor",
	"./getResourceBundle",
	"./utf8ArrayBufferToString",
	"./dvl/GraphicsCoreApi",
	"./dvl/checkResult",
	"./dvl/getJSONObject",
	"./dvl/getPointer",
	"./tools/AxisColours",
	"./tools/CoordinateSystem",
	"./tools/HitTestClickType",
	"./tools/HitTestIdMode",
	"./tools/PredefinedView"
], function(
	core,
	ObjectPath
) {
	"use strict";

	/**
	 * SAPUI5 library with controls for displaying 3D models.
	 *
	 * @namespace
	 * @name sap.ui.vk
	 * @author SAP SE
	 * @version 1.113.0
	 * @public
	 */

	// Delegate further initialization of this library to the Core.
	var vkLibrary = core.initLibrary({
		name: "sap.ui.vk",
		dependencies: [
			"sap.ui.core"
		],
		interfaces: [
			"sap.ui.vk.AuthorizationHandler",
			"sap.ui.vk.DecryptionHandler",
			"sap.ui.vk.IPlaybackCollection"
		],
		types: [
			// The `types` list is empty as we put all enums into separate modules. So there is no need
			// list them here, otherwise they will not be available due to how the `types` is processed in
			// the SAPUI core.
		],
		controls: [
			"sap.ui.vk.AnimationTimeSlider",
			"sap.ui.vk.ContainerBase",
			"sap.ui.vk.ContainerContent",
			"sap.ui.vk.DrawerToolbar",
			"sap.ui.vk.FlexibleControl",
			"sap.ui.vk.LegendItem",
			"sap.ui.vk.ListPanel",
			"sap.ui.vk.ListPanelStack",
			"sap.ui.vk.MapContainer",
			"sap.ui.vk.NativeViewport",
			"sap.ui.vk.Notifications",
			"sap.ui.vk.Overlay",
			"sap.ui.vk.ProgressIndicator",
			"sap.ui.vk.RedlineDesign",
			"sap.ui.vk.RedlineSurface",
			"sap.ui.vk.SceneTree",
			"sap.ui.vk.StepNavigation",
			"sap.ui.vk.Toolbar",
			"sap.ui.vk.Viewer",
			"sap.ui.vk.ViewGallery",
			"sap.ui.vk.Viewport",
			"sap.ui.vk.ViewportBase",
			"sap.ui.vk.dvl.Viewport",
			"sap.ui.vk.threejs.Viewport",
			"sap.ui.vk.svg.Viewport",
			"sap.ui.vk.tools.AnchorPointToolGizmo",
			"sap.ui.vk.tools.CrossSectionToolGizmo",
			"sap.ui.vk.tools.Gizmo",
			"sap.ui.vk.tools.MoveToolGizmo",
			"sap.ui.vk.tools.RotateToolGizmo",
			"sap.ui.vk.tools.ScaleToolGizmo",
			"sap.ui.vk.tools.SceneOrientationToolGizmo",
			"sap.ui.vk.tools.TooltipToolGizmo"
		],
		elements: [
			"sap.ui.vk.ContentConnector",
			"sap.ui.vk.FlexibleControlLayoutData",
			"sap.ui.vk.OverlayArea",
			"sap.ui.vk.RedlineElement",
			"sap.ui.vk.RedlineElementEllipse",
			"sap.ui.vk.RedlineElementFreehand",
			"sap.ui.vk.RedlineElementLine",
			"sap.ui.vk.RedlineElementRectangle",
			"sap.ui.vk.RedlineElementText",
			"sap.ui.vk.ViewStateManager",
			"sap.ui.vk.ViewStateManagerBase",
			"sap.ui.vk.dvl.ViewStateManager",
			"sap.ui.vk.threejs.NodesTransitionHelper",
			"sap.ui.vk.threejs.ViewStateManager",
			"sap.ui.vk.svg.ViewStateManager",
			"sap.ui.vk.tools.AnchorPointTool",
			"sap.ui.vk.tools.CrossSectionTool",
			"sap.ui.vk.tools.HitTestTool",
			"sap.ui.vk.tools.MoveTool",
			"sap.ui.vk.tools.RectSelectTool",
			"sap.ui.vk.tools.RotateOrbitTool",
			"sap.ui.vk.tools.RotateTool",
			"sap.ui.vk.tools.RotateTurntableTool",
			"sap.ui.vk.tools.ScaleTool",
			"sap.ui.vk.tools.SceneOrientationTool",
			"sap.ui.vk.tools.Tool",
			"sap.ui.vk.tools.TooltipTool",
			"sap.ui.vk.tools.PoiManipulationTool"
		],
		noLibraryCSS: false,
		version: "1.113.0",
		designtime: "sap/ui/vk/designtime/library.designtime"
	});

	if (vkLibrary == null) {
		// Workaround for using VIT with older versions of UI5 which don't return reference to this library from core.initLibrary()
		// This is case with EPD Visualization apps, in this case us old way of initialization
		vkLibrary = ObjectPath.get("sap.ui.vk");
	}

	var shims = {};
	shims["sap/ui/vk/thirdparty/html2canvas"] = {
		exports: "html2canvas",
		amd: true
	};
	shims["sap/ui/vk/thirdparty/gl-matrix"] = {
		exports: "glMatrix",
		amd: true
	};
	shims["sap/ui/vk/thirdparty/imagetracer"] = {
		exports: "ImageTracer",
		amd: true
	};

	sap.ui.loader.config({ shim: shims });

	// sap.ui.getCore().initLibrary() creates lazy stubs for controls and elements.
	// Create lazy stubs for non-Element-derived classes or extend Element-derived classed with static methods.
	var lazy = function(localClassName, staticMethods) {
		var methods = "new extend getMetadata";
		if (staticMethods) {
			methods += " " + staticMethods;
		}
		sap.ui.lazyRequire("sap.ui.vk." + localClassName, methods);
	};
	lazy("AnimationPlayback");
	lazy("AnimationSequence");
	lazy("BaseNodeProxy");
	lazy("Camera");
	lazy("ContentConnector", "registerSourceType"); // extend the lazy stub with the static method
	lazy("ContentManager");
	lazy("ContentResource");
	lazy("Core");
	lazy("DownloadManager");
	lazy("ImageContentManager");
	lazy("LayerProxy");
	lazy("Loco");
	lazy("Material");
	lazy("NodeHierarchy");
	lazy("NodeProxy");
	lazy("OrthographicCamera");
	lazy("PerspectiveCamera");
	lazy("RedlineDesignHandler");
	lazy("RedlineGesturesHandler");
	lazy("Scene");
	lazy("Smart2DHandler");
	lazy("Texture");
	lazy("View");
	lazy("ViewportHandler");
	lazy("dvl.BaseNodeProxy");
	lazy("dvl.ContentManager", "getRuntimeSettings setRuntimeSettings getWebGLContextAttributes setWebGLContextAttributes getDecryptionHandler setDecryptionHandler");
	lazy("dvl.GraphicsCore");
	lazy("dvl.LayerProxy");
	lazy("dvl.NodeHierarchy");
	lazy("dvl.NodeProxy");
	lazy("dvl.Scene");
	lazy("helpers.RotateOrbitHelperDvl");
	lazy("helpers.RotateOrbitHelperThree");
	lazy("helpers.RotateTurntableHelperDvl");
	lazy("helpers.RotateTurntableHelperThree");
	lazy("Highlight");
	lazy("svg.BaseNodeProxy");
	lazy("svg.ContentManager", "registerLoader");
	lazy("svg.NodeHierarchy");
	lazy("svg.NodeProxy");
	lazy("svg.Scene");
	lazy("threejs.AnimationSequence");
	lazy("threejs.BaseNodeProxy");
	lazy("threejs.Billboard");
	lazy("threejs.Callout");
	lazy("threejs.ContentDeliveryService");
	lazy("threejs.ContentManager", "registerLoader");
	lazy("threejs.DetailView");
	lazy("threejs.LayerProxy");
	lazy("threejs.Material");
	lazy("threejs.NodeHierarchy");
	lazy("threejs.NodeProxy");
	lazy("threejs.OrthographicCamera");
	lazy("threejs.PerspectiveCamera");
	lazy("threejs.Scene");
	lazy("threejs.Texture");
	lazy("threejs.Thrustline");
	lazy("threejs.ViewportGestureHandler");
	lazy("tools.AnchorPointToolHandler");
	lazy("tools.CrossSectionToolHandler");
	lazy("tools.HitTestToolHandler");
	lazy("tools.MoveToolHandler");
	lazy("tools.RectSelectToolHandler");
	lazy("tools.RotateToolHandler");
	lazy("tools.ScaleToolHandler");
	lazy("tools.TooltipToolHandler");

	/**
	 * @interface Contract for objects that provide access to animation playbacks.
	 *
	 * @name sap.ui.vk.IPlaybackCollection
	 * @public
	 */

	///////////////////////////////////////////////////////////////////
	//
	// IPlaybackCollection interface
	//
	///////////////////////////////////////////////////////////////////

	/**
	 * Gets all animation playbacks.
	 *
	 * @name sap.ui.vk.IPlaybackCollection.prototype.getPlaybacks
	 * @function
	 * @return {sap.ui.vk.AnimationPlayback[]} Array of playbacks.
	 * @private
	 */

	/**
	 * Gets animation playback by index.
	 *
	 * @name sap.ui.vk.IPlaybackCollection.prototype.getPlayback
	 * @function
	 * @param {int} index Playback index.
	 * @return {sap.ui.vk.AnimationPlayback} AnimationPlaybacks or <code>undefined</code>.
	 * @private
	 */

	/**
	 * Finds animation playback index.
	 *
	 * @name sap.ui.vk.IPlaybackCollection.prototype.getPlaybackIndex
	 * @function
	 * @param {sap.ui.vk.AnimationPlayback|string} playback Animation playback or it's ID.
	 * @return {int} Playback index or -1 if not found.
	 * @private
	 */

	/**
	 * Adds animation playback.
	 *
	 * @name sap.ui.vk.IPlaybackCollection.prototype.addPlayback
	 * @function
	 * @param {sap.ui.vk.AnimationPlayback} playback Animation playback to add.
	 * @return {sap.ui.vk.IPlaybackCollection} <code>this</code> to allow method chaining.
	 * @private
	 */

	/**
	 * Inserts animation playback to a specified position.
	 *
	 * @name sap.ui.vk.IPlaybackCollection.prototype.insertPlayback
	 * @function
	 * @param {sap.ui.vk.AnimationPlayback} playback Animation playback to insert.
	 * @param {int} index Animation playback position
	 * @return {sap.ui.vk.IPlaybackCollection} <code>this</code> to allow method chaining.
	 * @private
	 */

	/**
	 * Removes animation playback.
	 *
	 * @name sap.ui.vk.IPlaybackCollection.prototype.removePlayback
	 * @function
	 * @param {sap.ui.vk.AnimationPlayback|index|string} playback Animation playback or it's index or it's ID to remove.
	 * @return {sap.ui.vk.IPlaybackCollection} <code>this</code> to allow method chaining.
	 * @private
	 */

	/**
	 * Removes all animation playback.
	 *
	 * @name sap.ui.vk.IPlaybackCollection.prototype.removePlaybacks
	 * @function
	 * @return {sap.ui.vk.IPlaybackCollection} <code>this</code> to allow method chaining.
	 * @private
	 */

	///////////////////////////////////////////////////////////////////
	//
	// IJointCollection interface
	//
	///////////////////////////////////////////////////////////////////

	/**
	 * @interface Contract for objects that provide access to Joints.
	 *
	 * @name sap.ui.vk.IJointCollection
	 * @private
	 */

	/**
	 * Get joint(s).
	 *
	 * @name sap.ui.vk.IJointCollection.prototype.getJoint
	 * @function
	 * @param {any} 	 [joint]                      Joint to retrieve. If omitted, all joints will be retrieved
	 * @param {any?}     jointData.parent             parent node. If omitted, all joints for the specified child will be retrieved
	 * @param {any?}     jointData.node               child node. If omitted, all joints for the specified parent will be returned.
	 *
	 * @return {any|any[]} Joint or array of joints.
	 * @private
	 */

	/**
	 * Set joint.
	 *
	 * @name sap.ui.vk.IJointCollection.prototype.setJoint
	 * @function
	 * @param {any|any[]} joint Joint or array of joints to detach.
	 * @param {any}       jointData.parent             parent node
	 * @param {any}       jointData.node               child node
	 * @param {float[]}   jointData.translation        child's translation relative to parent
	 * @param {float[]}   jointData.quaternion         child's rotation relative to parent
	 * @param {float[]}   jointData.scale              child's scale relative to parent
	 *
	 * @return {sap.ui.vk.IJointCollection} <code>this</code> to allow method chaining.
	 * @private
	 */

	/**
	 * Removes joint or set of joints.
	 *
	 * @name sap.ui.vk.IJointCollection.prototype.removeJoint
	 * @function
	 * @param {any} [jointData]               joint data. If omitted, all joints will be removed.
	 * @param {any} [jointData.parent]        parent node. If omitted, all joints for the specified child will be removed.
	 * @param {any} [jointData.node]          child node. If omitted, all joints for the specified parent will be removed.
	 *
	 * @return {sap.ui.vk.IJointCollection} <code>this</code> to allow method chaining.
	 * @private
	 */

	return vkLibrary;
});
