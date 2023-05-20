/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
/* global File */
// Provides the GraphicsCore class.
sap.ui.define([
	"jquery.sap.script",
	"sap/ui/base/EventProvider",
	"../thirdparty/html2canvas",
	"../ve/dvl",
	"./Scene",
	"../ContentResource",
	"../DownloadManager",
	"./ViewStateManager",
	"../DvlException",
	"../Messages",
	"sap/ui/thirdparty/URI",
	"./GraphicsCoreApi",
	"./checkResult",
	"./getPointer",
	"./getJSONObject",
	"../getResourceBundle",
	"../utf8ArrayBufferToString",
	"sap/base/assert",
	"sap/base/util/uid",
	"sap/base/Log",
	"sap/ui/core/Core"
], function(
	jQuery,
	EventProvider,
	Html2Canvas,
	Dvl,
	Scene,
	ContentResource,
	DownloadManager,
	ViewStateManager,
	DvlException,
	Messages,
	URI,
	GraphicsCoreApi,
	checkResult,
	getPointer,
	getJSONObject,
	getResourceBundle,
	utf8ArrayBufferToString,
	assert,
	uid,
	Log,
	core
) {
	"use strict";

	/**
	 * Gets the name of the storage in Emscripten file system to use.
	 * @param {string|File} source The source to test.
	 * @returns {string} The name of the storage in Emscripten file system to use:
	 *                   "remote" for files downloaded from remote servers,
	 *                   "local" for files loaded from the local file system.
	 */
	function getStorageName(source) {
		return source instanceof File ? "local" : "remote";
	}

	/**
	 * Gets the name of the source.
	 * @param {string|File} source The source to get the name of.
	 * @returns {string} The name of the source. If the source is string then the source itself, if the source is File then source.name.
	 */
	function getSourceName(source) {
		return source instanceof File ? source.name : source;
	}

	// The SourceDatum class is used to record information about sources used in content resource hierarchies.
	// Sources correspond to files/models downloaded from remote servers or from local file systems.
	// To optimise the usage of sources we use caching - if multiple content resources reference the same source
	// the source is not downloaded multiple times, it is downloaded only once, and is destroyed when the last content
	// resource is destroyed.
	var SourceDatum = function(source) {
		Object.defineProperties(this, {
			source: {
				value: source,
				writable: false,
				enumerable: true
			},
			_refCount: {
				value: 0,
				writable: true,
				enumerable: false
			}
		});
	};

	SourceDatum.prototype.isInUse = function() {
		return this._refCount > 0;
	};

	SourceDatum.prototype.addRef = function() {
		++this._refCount;
		return this;
	};

	SourceDatum.prototype.release = function() {
		--this._refCount;
		assert(this._refCount >= 0, "Too many calls to SourceDatum.release().");
		return this;
	};

	SourceDatum.prototype.destroy = function() {
	};

	// The VdslSourceDatum is used to record information about VDSL sources.
	var VdslSourceDatum = function(source, vdsSourceDatum, vdslContent) {
		SourceDatum.call(this, source);
		Object.defineProperties(this, {
			content: {
				value: vdslContent,
				writable: false,
				enumerable: true
			},
			vdsSourceDatum: {
				value: vdsSourceDatum,
				writable: false,
				enumerable: true
			}
		});
	};

	VdslSourceDatum.prototype = Object.create(SourceDatum.prototype);
	VdslSourceDatum.prototype.constructor = VdslSourceDatum;

	VdslSourceDatum.prototype.destroy = function() {
		assert(this.vdsSourceDatum, "VDSL source without VDS reference");
		if (this.vdsSourceDatum) {
			this.vdsSourceDatum.release();
		}
		SourceDatum.prototype.destroy.call(this);
	};

	// The DvlSceneDatum class is used to record information about what source a DVL scene is created from
	// and whether it is a root scene. Root scenes are not shared. Non-root scenes are read only and can be
	// used as sources for cloning nodes into the root scene. It might happen that the same source is used
	// as a root scene and non-root scene, e.g. if there is a hierarchy of content resources and all content
	// resources are built from the same source, e.g. a model with just one box.
	var DvlSceneDatum = function(dvlSceneId, sourceDatum, root) {
		Object.defineProperties(this, {
			dvlSceneId: {
				value: dvlSceneId,
				writable: false,
				enumerable: true
			},
			sourceDatum: {              // This field can be null which means the DVL scene is created as empty, not from a source.
				value: sourceDatum,
				writable: false,
				enumerable: true
			},
			root: {
				value: !!root,
				writable: false,
				enumerable: true
			},
			_refCount: {
				value: 0,
				writable: true,
				enumerable: false
			}
		});
	};

	DvlSceneDatum.prototype.isInUse = function() {
		return this._refCount > 0;
	};

	DvlSceneDatum.prototype.addRef = function() {
		++this._refCount;
		return this;
	};

	DvlSceneDatum.prototype.release = function() {
		--this._refCount;
		assert(this._refCount >= 0, "Too many calls to DvlSceneDatum.release().");
		// NB: we do not release the reference to the SourceDatum object as this object can be re-used later.
		// The reference to the SourceDatum object is released in the destroy method when this object is about to be completely dead.
		return this;
	};

	DvlSceneDatum.prototype.destroy = function() {
		// This object will not be re-used so we need to release the reference to the SourceDatum object if any.
		if (this.sourceDatum) {
			this.sourceDatum.release();
		}
	};

	// When the hierarchy of content resources changes we need to find what was changed.
	// The ShadowContentResource class is used to keep the original information of content resources.
	// We cannot keep references to the ContentResource objects because they can be rebuilt any time due
	// to data binding. The lifetime of objects of this class is controlled by the graphics core, so
	// content resource object can have references to shadow content resources.
	var ShadowContentResource = function(contentResource, fake) {
		// nodeProxy and dvlSceneId are mutually exclusive.
		Object.defineProperties(this, {
			source: {
				value: contentResource.getSource()
			},
			sourceType: {
				value: contentResource.getSourceType()
			},
			sourceId: {
				value: contentResource.getSourceId(),
				writable: true
			},
			name: {
				value: contentResource.getName()
			},
			localMatrix: {
				value: contentResource.getLocalMatrix(),
				writable: true
			},
			password: {
				value: contentResource.getPassword()
			},
			children: {
				value: contentResource.getContentResources().map(function(contentResource) {
					return new ShadowContentResource(contentResource);
				})
			},
			dvlSceneDatum: {         // This field can be null which means this content resource is a pure grouping node.
				value: null,
				writable: true
			},
			nodeProxy: {             // This field is null when dvlSceneDatum.root equals true.
				value: null,
				writable: true
			},
			fake: {
				value: !!fake
			},
			sourceProperties: {
				value: null,
				writable: true
			}
		});
		contentResource._shadowContentResource = this;
	};

	ShadowContentResource.prototype.destroy = function() {
		// This object will not be re-used so we need to release the reference to DvlSceneData is any.
		if (this.dvlSceneDatum) {
			this.dvlSceneDatum.release();
		}
	};

	var VkSceneDatum = function(vkScene, shadowContentResource) {
		Object.defineProperties(this, {
			vkScene: {
				value: vkScene
			},
			shadowContentResource: {
				value: shadowContentResource
			}
		});
	};

	/**
	 * Constructor for a new GraphicsCore.
	 *
	 * @class
	 * Loads the DVL library, wraps it, and makes the wrapper available for the application.
	 *
	 * Example:<br/>
	 * <pre>   var oGraphicsCore = new GraphicsCore();</pre><br/>
	 *
	 * @param {object} runtimeSettings The Emscripten runtime settings.
	 * @param {int}    runtimeSettings.totalMemory The size of Emscripten module memory in bytes.
	 * @param {string} runtimeSettings.logElementId The ID of a textarea DOM element to write the log to.
	 * @param {string} runtimeSettings.statusElementId The ID of a DOM element to write the status messages to.
	 * @param {object} webGLContextAttributes The WebGL context attributes. See {@link https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2 WebGL context attributes}.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.EventProvider
	 * @alias sap.ui.vk.dvl.GraphicsCore
	 * @deprecated Since version 1.72.0.
	 * @since 1.32.0
	 */
	var GraphicsCore = EventProvider.extend("sap.ui.vk.dvl.GraphicsCore", /** @lends sap.ui.vk.dvl.GraphicsCore.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			publicMethods: [
				"attachSceneLoadingFinished",
				"attachSceneLoadingProgress",
				"attachSceneLoadingStarted",
				"buildSceneTree",
				"buildSceneTreeAsync",
				"createViewStateManager",
				"destroyScene",
				"destroyViewStateManager",
				"detachSceneLoadingFinished",
				"detachSceneLoadingProgress",
				"detachSceneLoadingStarted",
				"getApi",
				"loadContentResourcesAsync",
				"showDebugInfo",
				"updateSceneTree",
				"updateSceneTreeAsync"
			]
		},
		constructor: function(runtimeSettings, webGLContextAttributes) {
			EventProvider.apply(this);

			var settings = jQuery.extend({}, runtimeSettings, {
				filePackagePrefixURL: sap.ui.require.toUrl("sap/ui/vk/ve") + "/"
			});
			this._dvlClientId = uid();

			var that = this;
			this._initialized = new Promise(function(resolve) {
				that._initResolve = resolve;
			});

			sap.ve.dvl.createRuntime(settings).then(function(dvl) {
				that._dvl = dvl;
				that._dvl.CreateCoreInstance(that._dvlClientId);
				checkResult(that._dvl.Core.Init(that._DVLMajorVersion, that._DVLMinorVersion));

				var ui5Core = core;
				ui5Core.attachLocalizationChanged(that._onlocalizationChanged, that);
				checkResult(that._dvl.Core.SetLocale(ui5Core.getConfiguration().getLanguageTag()));

				// The rendering WebGL canvas. If there is only one viewport then this canvas is used by that viewport directly.
				// If there are more than one viewport, then this canvas is used for off-screen rendering. Its content is copied
				// to viewports' 2D canvases. The size of this off-screen canvas is big enough to fit content of any viewport.
				that._canvas = that._createRenderingCanvasAndContext(webGLContextAttributes);

				// At least one renderer needs to be created and initialized at the very beginning because it is required
				// to load geometry into the GPU memory when loading models.
				that._rendererId = getPointer(that._dvl.Core.CreateRenderer());
				that._dvl.Renderer.SetOptionF(sap.ve.dvl.DVLRENDEROPTIONF.DVLRENDEROPTIONF_DPI, 96 * window.devicePixelRatio, that._rendererId);

				that._initResolve();
			});

			// The list of URLs and File objects. Their content is downloaded and copied to the Emscripten file system.
			// The content of files in the Emscripten file system is read only.
			this._sourceData = [];

			// The list of records with information about what sources the DVL scenes are created from.
			// These records can be shared among multiple vkScenes.
			this._dvlSceneData = [];

			// The list of VkSceneDatum objects.
			this._vkSceneData = [];

			// The list of viewport controls and associated data { control: sap.ui.vk.Viewport, canvas: HTMLCanvasElement, rendererId: String }.
			this._viewports = [];

			// An ID of pending refresh callback request.
			this._renderLoopRequestId = null;

			// The render loop function.
			this._renderLoop = this._renderLoop.bind(this);

			// The list of view state managers. Deprecated. Kept for backward compatibility.
			this._viewStateManagers = [];

			this._authorizationHandler = null;
			this._retryCount = 1;
		},

		// NB: Change these numbers when changing dependency on dvl.js in pom.xml.
		_DVLMajorVersion: 7,
		_DVLMinorVersion: 6
	});

	/**
	 * Creates and initializes an instance of GraphicsCore
	 * @param {object} runtimeSettings The Emscripten runtime settings.
	 * @param {int}    runtimeSettings.totalMemory The size of Emscripten module memory in bytes.
	 * @param {string} runtimeSettings.logElementId The ID of a textarea DOM element to write the log to.
	 * @param {string} runtimeSettings.statusElementId The ID of a DOM element to write the status messages to.
	 * @param {object} webGLContextAttributes The WebGL context attributes. See {@link https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2 WebGL context attributes}.
	 * @returns {Promise} Promise which will be resolved when GraphicsCore is initialized
	 * @static
	 */
	GraphicsCore.create = function(runtimeSettings, webGLContextAttributes) {
		return new Promise(function(resolve, reject) {
			try {
				var g = new GraphicsCore(runtimeSettings, webGLContextAttributes);
				g._initialized.then(function() { resolve(g); });
			} catch (err) {
				reject(err);
			}
		});
	};

	GraphicsCore.prototype.destroy = function() {
		core.detachLocalizationChanged(this._onlocalizationChanged, this);

		// GraphicsCore does not own Viewport objects, it should not destroy them, it can only reset their association with GraphicsCore.
		var viewports = this._viewports.slice();
		viewports.reverse();
		viewports.forEach(function(viewport) {
			viewport.control.setGraphicsCore(null);
		});
		this._viewports = null;

		this._cleanupVkSceneData();
		this._vkSceneData = null;

		this._cleanupDvlSceneData();
		assert(this._dvlSceneData.length === 0, "Not all DVL scenes are destroyed when sap.ui.vk.dvl.Scene objects are destroyed.");
		this._dvlSceneData = null;

		this._cleanupSourceData();
		assert(this._sourceData.length === 0, "Not all sources are deleted.");
		this._sourceData = null;

		this._viewStateManagers.slice().forEach(this.destroyViewStateManager.bind(this));
		this._viewStateManagers = null;

		this._webGLContext = null;
		this._canvas = null;

		// The default renderer.
		this._dvl.Core.DeleteRenderer(this._rendererId);
		this._rendererId = null;

		this._dvl.Core.Release();
		this._dvl = null;

		EventProvider.prototype.destroy.apply(this);
	};

	/**
	 * Creates a canvas element for the 3D viewport and initializes the WebGL context.
	 * @param {object} webGLContextAttributes WebGL context attributes. A JSON object with the following boolean properties:
	 * <ul>
	 *   <li>antialias {boolean} default value <code>true</code>.</li>
	 *   <li>alpha {boolean} default value <code>true</code>.</li>
	 *   <li>premultipliedAlpha {boolean} default value <code>false</code>.</li>
	 * </ul>
	 * Other {@link https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2 WebGL context attributes} are also supported.
	 * @returns {HTMLCanvasElement} The canvas element for the 3D viewport.
	 * @private
	 */
	GraphicsCore.prototype._createRenderingCanvasAndContext = function(webGLContextAttributes) {
		// _canvas is a private DOMElement used for WebGL rendering.
		// At the moment there can be only one canvas element and one viewport,
		// and the viewport uses the canvas.
		var canvas = document.createElement("canvas");
		canvas.id = uid();
		this._webGLContext = this._dvl.Core.CreateWebGLContext(canvas, webGLContextAttributes);
		return canvas;
	};

	/**
	 * Gets the canvas element used for 3D rendering.
	 * @returns {HTMLCanvasElement} The canvas element used for 3D rendering.
	 * @private
	 */
	GraphicsCore.prototype._getCanvas = function() {
		return this._canvas;
	};

	/**
	 * Gets the WebGL context used for 3D rendering.
	 * @returns {WebGLRenderingContext} The WebGL rendering context.
	 * @private
	 */
	GraphicsCore.prototype._getWebGLContext = function() {
		return this._webGLContext;
	};

	/**
	 * Gets the DVL object.
	 * @returns {DVL} The DVL object.
	 * @private
	 */
	GraphicsCore.prototype._getDvl = function() {
		return this._dvl;
	};

	/**
	 * Gets the DVL client ID used in processing notifications from DVL module.
	 * @returns {string} The DVL client ID.
	 * @private
	 */
	GraphicsCore.prototype._getDvlClientId = function() {
		return this._dvlClientId;
	};

	////////////////////////////////////////////////////////////////////////
	// BEGIN: Source Data related methods.

	/**
	 * Returns an array of items from this._sourceData that match the search criteria.
	 * @param {object} properties A JSON like object with one or several properties { source }.
	 * @returns {SourceDatum[]} An array of items from this._dvlSourceData that match the search criteria.
	 * @private
	 */
	GraphicsCore.prototype._findSourceData = function(properties) {
		var propNames = Object.getOwnPropertyNames(properties);
		return this._sourceData.filter(function(item) {
			return propNames.every(function(propName) {
				return properties[propName] === item[propName];
			});
		});
	};

	/**
	 * Destroys a single source.
	 * @param {SourceDatum} sourceDatum A SourceDatum object to destroy.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	GraphicsCore.prototype._destroySourceDatum = function(sourceDatum) {
		if (!(sourceDatum instanceof VdslSourceDatum)) {
			this._dvl.Core.DeleteFileByUrl(getSourceName(sourceDatum.source), getStorageName(sourceDatum.source));
		}
		sourceDatum.destroy();
		return this;
	};

	/**
	 * Cleans up unused sources.
	 *
	 * This method is called via setTimeout after multiple sources are released to collect unused objects.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	GraphicsCore.prototype._cleanupSourceData = function() {
		var needAnotherPass = false; // Another pass is needed when any VDSL source datum is destroyed and its referenced VDS source datum gets unused.
		for (var i = this._sourceData.length - 1; i >= 0; --i) {
			var sourceDatum = this._sourceData[i];
			if (!sourceDatum.isInUse()) {
				var referencedSourceDatum = sourceDatum instanceof VdslSourceDatum ? sourceDatum.vdsSourceDatum : null;
				this._sourceData.splice(i, 1);
				this._destroySourceDatum(sourceDatum);
				if (referencedSourceDatum && !referencedSourceDatum.isInUse()) {
					needAnotherPass = true;
				}
			}
		}
		if (needAnotherPass) {
			this._cleanupSourceData();
		}
		return this;
	};

	// END: Source Data related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: DVL Scene Data related methods.

	/**
	 * Returns an array of items from this._dvlSceneData that match the search criteria.
	 * @param {object} properties A JSON like object with one or several properties { dvlSceneId, source, root }.
	 * @return {DvlSceneDatum[]} An array of items from this._dvlSceneData that match the search criteria.
	 * @private
	 */
	GraphicsCore.prototype._findDvlSceneData = function(properties) {
		var propNames = Object.getOwnPropertyNames(properties);
		return this._dvlSceneData.filter(function(item) {
			return propNames.every(function(propName) {
				return properties[propName] === item[propName];
			});
		});
	};

	/**
	 * Destroys a single DVL scene datum object.
	 * @param {DvlSceneDatum} dvlSceneDatum A DvlSceneDatum object to destroy.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	GraphicsCore.prototype._destroyDvlSceneDatum = function(dvlSceneDatum) {
		this._dvl.Scene.Release(dvlSceneDatum.dvlSceneId);
		dvlSceneDatum.destroy();
		return this;
	};

	/**
	 * Cleans up unused DVL scene data.
	 *
	 * This method is called via setTimeout after multiple DVL scene data are released to collect unused objects.
	 * @private
	 */
	GraphicsCore.prototype._cleanupDvlSceneData = function() {
		for (var i = this._dvlSceneData.length - 1; i >= 0; --i) {
			var dvlSceneDatum = this._dvlSceneData[i];
			if (!dvlSceneDatum.isInUse()) {
				this._dvlSceneData.splice(i, 1);
				this._destroyDvlSceneDatum(dvlSceneDatum);
			}
		}
	};

	// END: DVL Scene Data related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: VK Scene Data related methods.

	/**
	 * Returns an array of items from this._vkSceneData that match the search criteria.
	 * @param {object} properties A JSON like object with one or several properties { vkSceneId, etc }.
	 * @return {VkSceneDatum[]} An array of items from this._vkSceneData that match the search criteria.
	 * @private
	 */
	GraphicsCore.prototype._findVkSceneData = function(properties) {
		var propNames = Object.getOwnPropertyNames(properties);
		return this._vkSceneData.filter(function(item) {
			return propNames.every(function(propName) {
				return properties[propName] === item[propName];
			});
		});
	};

	GraphicsCore.prototype._cleanupVkSceneData = function() {
		for (var i = this._vkSceneData.length - 1; i >= 0; --i) {
			this.destroyScene(this._vkSceneData[i].vkScene);
		}
	};

	// END: VK Scene Data related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: Shadow Content Resource related methods.

	GraphicsCore.prototype._destroyShadowContentResource = function(vkScene, shadowContentResource) {
		if (shadowContentResource.children) {
			shadowContentResource.children.forEach(this._destroyShadowContentResource.bind(this, vkScene));
		}
		if (shadowContentResource.nodeProxy) {
			var nodeHierarchy = vkScene.getDefaultNodeHierarchy();
			try {
				nodeHierarchy.removeNode(shadowContentResource.nodeProxy.getNodeRef());
			} catch (e) {
				var message = "Failed to delete node with ID = " + shadowContentResource.nodeProxy.getNodeRef() + ".";
				if (e instanceof DvlException) {
					message += " Error code: " + e.code + ". Message: " + e.message + ".";
				}
				Log.error(message);
			}
			nodeHierarchy.destroyNodeProxy(shadowContentResource.nodeProxy);
		}
		shadowContentResource.destroy();
	};

	// END: Shadow Content Resource related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: Generic Content Resource related methods.

	/**
	 * Gets a list of filtered content resources.
	 *
	 * @param {sap.ui.vk.ContentResource[]} contentResources The content resources to filter.
	 * @param {function} filter A function to test each content resource. Invoked with one argument <code>contentResource</code>.
	 * @return {sap.ui.vk.ContentResource[]} The content resources that are matched by the filter.
	 * @private
	 */
	GraphicsCore.prototype._filterContentResources = function(contentResources, filter) {
		var result = [];
		contentResources.forEach(function enumerate(contentResource) {
			if (filter(contentResource)) {
				result.push(contentResource);
			}
			contentResource.getContentResources().forEach(enumerate);
		});
		return result;
	};

	/**
	 * Gets a list of encrypted content resources without passwords.
	 *
	 * @param {sap.ui.vk.ContentResource[]} contentResources The content resources to check.
	 * @return {sap.ui.vk.ContentResource[]} The content resources that are encrypted and have no passwords.
	 * @private
	 */
	GraphicsCore.prototype._getContentResourcesWithMissingPasswords = function(contentResources) {
		var library = this._dvl.Library;
		return this._filterContentResources(contentResources, function(contentResource) {
			var source = contentResource.getSource();
			try {
				return source && (getJSONObject(library.RetrieveInfo(getSourceName(source), getStorageName(source))).flags & sap.ve.dvl.DVLFILEFLAG.ENCRYPTED) && !contentResource.getPassword();
			} catch (e) {
				Log.warning("Failed to get information from Emscripten virtual file system about file '" + getSourceName(source) + "'");
				return false;
			}
		});
	};

	/**
	 * Gets a list of content resources with encrypted VDS3 models.
	 *
	 * @param {sap.ui.vk.ContentResource[]} contentResources The content resources to check.
	 * @return {sap.ui.vk.ContentResource[]} The content resources with encrypted VDS3 models.
	 * @private
	 */
	GraphicsCore.prototype._getContentResourcesWithEncryptedVds3 = function(contentResources) {
		var library = this._dvl.Library;
		return this._filterContentResources(contentResources, function(contentResource) {
			var source = contentResource.getSource();
			if (source) {
				try {
					var fileInfo = getJSONObject(library.RetrieveInfo(getSourceName(source), getStorageName(source)));
					return fileInfo.major <= 3 && (fileInfo.flags & sap.ve.dvl.DVLFILEFLAG.ENCRYPTED);
				} catch (e) {
					Log.warning("Failed to get information from Emscripten virtual file system about file '" + getSourceName(source) + "'");
					return false;
				}
			} else {
				return false;
			}
		});
	};

	/**
	 * Collects content resource source properties.
	 *
	 * @param {ShadowContentResource} shadowContentResource The shadow content resource to inspect.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	GraphicsCore.prototype._collectAndCheckSourceProperties = function(shadowContentResource) {
		var sourceDatum = shadowContentResource.dvlSceneDatum.sourceDatum;
		if (!sourceDatum) {
			return this;
		}
		try {
			// VDSL files are not stored in Emscripten virtual file system.
			// Get the properties of the vds file which the vdsl file references to.
			if (sourceDatum instanceof VdslSourceDatum) {
				sourceDatum = sourceDatum.vdsSourceDatum;
			}
			var sourceInfo = getJSONObject(this._dvl.Library.RetrieveInfo(getSourceName(sourceDatum.source), getStorageName(sourceDatum.source)));
			shadowContentResource.sourceProperties = {
				version: {
					major: sourceInfo.major,
					minor: sourceInfo.minor
				}
			};
			if (sourceInfo.flags & (sap.ve.dvl.DVLFILEFLAG.PAGESCOMPRESSED | sap.ve.dvl.DVLFILEFLAG.WHOLEFILECOMPRESSED)) {
				shadowContentResource.sourceProperties.compressed = true;
			}
			if (sourceInfo.flags & sap.ve.dvl.DVLFILEFLAG.ENCRYPTED) {
				shadowContentResource.sourceProperties.encrypted = true;
			}
		} catch (e) {
			Log.warning("Failed to get information from Emscripten virtual file system about file '" + getSourceName(shadowContentResource.source) + "'");
		}
		return this;
	};

	/**
	 * Loads content resources.
	 *
	 * Content resources can be downloaded from a URL or loaded from a local file.
	 *
	 * @param {sap.ui.vk.ContentResource[]} contentResources The content resources to build the scene from.
	 * @param {function} onComplete The callback function to call when all content resources are processed.
	 *                              The onComplete callback parameter <code>sourcesFailedToLoad</code> takes an array of objects with
	 *                              the properties: source (The content resource that failed to load), status (The VIT Message code i.e 'VIT22') and statusText (VIT Message Summary).
	 * @param {function} onProgress The callback function to call to report the file loading progress.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	GraphicsCore.prototype.loadContentResourcesAsync = function(contentResources, onComplete, onProgress) {
		var that = this,
			sources = [], // this can be declared as new Set(), but in this case it will need to be converted to an array to pass to DownloadManager.
			vdslSources = new Map();

		// Collect unique sources that are not loaded yet.
		contentResources.forEach(function enumerate(contentResource) {
			var source = contentResource.getSource();
			if (source && sources.indexOf(source) < 0 && that._findSourceData({ source: source }).length === 0) {
				sources.push(source);
				var srcType = contentResource.getSource();
				var ext;
				if (srcType instanceof Object) {
					ext = srcType.name;
				} else {
					ext = srcType;
				}
				if (contentResource.getSourceType() === "vdsl" || contentResource.getSourceType() === "vds" && ext.split(".").pop() === "vdsl") {
					vdslSources.set(source, {});
				}
			}
			contentResource.getContentResources().forEach(enumerate);
		});

		// Accumulate source data in a local variable and then pass it to onComplete handler
		// otherwise the cleanup process can garbage collect them.
		var sourceData = [];

		// Asynchronously download all content resources with URLs or local files.
		if (sources.length > 0) {
			var sourcesFailedToLoad;
			var downloadManager = new DownloadManager(sources, null, this._authorizationHandler, this._retryCount)
				.attachItemSucceeded(function(event) {
					var source = event.getParameter("source");
					var response = event.getParameter("response");

					if (vdslSources.has(source)) {
						// We do not add SourceDatum for VDSL file yet.
						// We will add it after we successfully download the referenced VDS file.
						var content = utf8ArrayBufferToString(response);
						if (content.trim().length === 0) {
							sourcesFailedToLoad = sourcesFailedToLoad || [];
							sourcesFailedToLoad.push({
								source: source,
								status: Messages.VIT22.code,
								statusText: getResourceBundle().getText(Messages.VIT22.summary)
							});
							Log.error(getResourceBundle().getText(Messages.VIT22.summary), Messages.VIT22.code, "sap.ui.vk.dvl.GraphicsCore");
							return;
						} else {
							var lines = content.split(/\n|\r\n/);
							var m = lines[0].match(/^file=(.+)$/);
							if (!m) {
								sourcesFailedToLoad = sourcesFailedToLoad || [];
								sourcesFailedToLoad.push({
									source: source,
									status: Messages.VIT23.code,
									statusText: getResourceBundle().getText(Messages.VIT23.summary)
								});
								Log.error(getResourceBundle().getText(Messages.VIT23.summary), Messages.VIT23.code, "sap.ui.vk.dvl.GraphicsCore");
								return;
							} else {
								var vdslSourceData = vdslSources.get(source);
								vdslSourceData.content = lines;
								var referencedSource = m[1];
								var originalReferencedSource = referencedSource;
								var originalReferencedSourceUrl = new URI(originalReferencedSource);
								if (originalReferencedSourceUrl.is("relative")) {
									if (source instanceof File) {
										sourcesFailedToLoad = sourcesFailedToLoad || [];
										sourcesFailedToLoad.push({
											source: source,
											status: Messages.VIT24.code,
											statusText: getResourceBundle().getText(Messages.VIT24.summary)
										});
										Log.error(getResourceBundle().getText(Messages.VIT24.summary), Messages.VIT24.code, "sap.ui.vk.dvl.GraphicsCore");
										return;
									} else {
										var vdslSourceUrl = new URI(source);
										referencedSource = originalReferencedSourceUrl.absoluteTo(vdslSourceUrl).href();
									}
								}
								vdslSourceData.referencedSource = referencedSource;
								vdslSourceData.content[0] = vdslSourceData.content[0].replace(originalReferencedSource, this._dvl.Core.GetFilename(vdslSourceData.referencedSource, "remote"));
								if (sources.indexOf(vdslSourceData.referencedSource) < 0 && this._findSourceData({ source: vdslSourceData.referencedSource }).length === 0) {
									// The referenced source is not downloaded previously and is not queued for downloading yet.
									// It is possible to have a content resource hierarchy of VDSL files, some of them
									// can reference the same VDS file. In such cases we do not need to download the same
									// referenced VDS file multiple times.
									sources.push(vdslSourceData.referencedSource);
									downloadManager.queue(vdslSourceData.referencedSource);
								}
							}
						}
					} else {
						// If it is not a vdsl file, just store in the Emscripten file system.
						var isFile = source instanceof File;
						var name = isFile ? source.name : source;
						var storageName = getStorageName(source);
						this._dvl.Core.CreateFileFromArrayBuffer(response, name, storageName);
						sourceData.push(new SourceDatum(source));
					}
				}, this)
				.attachAllItemsCompleted(function(event) {
					Array.prototype.push.apply(this._sourceData, sourceData);
					// Create VdslSourceDatum for VDSL sources.
					vdslSources.forEach(function(vdslSourceData, vdslSource) {
						var vdsSourceDatum = this._findSourceData({ source: vdslSourceData.referencedSource })[0];
						if (vdsSourceDatum) {
							var sourceDatum = new VdslSourceDatum(vdslSource, vdsSourceDatum, vdslSourceData.content.join("\n"));
							this._sourceData.push(sourceDatum);
							vdsSourceDatum.addRef();
							// VdslSourceDatum will be addRef'ed when the corresponding scene is created.
						}
					}.bind(this));

					if (onComplete) {
						onComplete(sourcesFailedToLoad);
					}
				}, this)
				.attachItemFailed(function(event) {
					sourcesFailedToLoad = sourcesFailedToLoad || [];
					sourcesFailedToLoad.push({
						source: event.getParameter("source"),
						status: event.getParameter("status"),
						statusText: event.getParameter("statusText")
					});
				}, this);
			if (onProgress) {
				downloadManager.attachItemProgress(onProgress, this);
			}
			downloadManager.start();
		} else if (onComplete) {
			// Nothing to download or everything is already downloaded.
			onComplete();
		}

		return this;
	};

	/**
	 * Builds placeholder nodes for the content resources and their children.
	 *
	 * @param {sap.ui.vk.NodeHierarchy} nodeHierarchy          The node hierarchy.
	 * @param {any}                     parentNodeRef          The parent node reference.
	 * @param {any}                     insertBeforeNodeRef    The node reference to insert the top level nodes before.
	 * @param {ShadowContentResource[]} shadowContentResources The root shadow content resource.
	 * @returns {ShadowContentResource[]} A flat list of shadow content resources that have a non-empty source property.
	 * @private
	 */
	GraphicsCore.prototype._buildPlaceholders = function(nodeHierarchy, parentNodeRef, insertBeforeNodeRef, shadowContentResources) {
		var shadowContentResourcesToLoad = [];

		shadowContentResources.forEach(function build(parentNodeRef, insertBeforeNodeRef, shadowContentResource) {
			var nodeRef = nodeHierarchy.createNode(parentNodeRef, shadowContentResource.name, insertBeforeNodeRef);
			shadowContentResource.nodeProxy = nodeHierarchy.createNodeProxy(nodeRef);

			if (shadowContentResource.localMatrix) {
				shadowContentResource.nodeProxy.setLocalMatrix(shadowContentResource.localMatrix);
			}

			if (shadowContentResource.source) {
				shadowContentResourcesToLoad.push(shadowContentResource);
			}

			shadowContentResource.children.forEach(build.bind(this, nodeRef, null));
		}.bind(this, parentNodeRef, insertBeforeNodeRef));

		return shadowContentResourcesToLoad;
	};

	/**
	 * Updates the full tree of placeholder nodes.
	 *
	 * @param {sap.ui.vk.dvl.Scene}         vkScene                   The scene to update.
	 * @param {ShadowContentResource}       rootShadowContentResource The root shadow content resource.
	 * @param {sap.ui.vk.ContentResource[]} contentResources          The content resources. Changes in content resources need to be
	 *                                                                propagated to the shadow content resources.
	 * @returns {ShadowContentResource[]} A flat list of shadow content resources that have a non-empty source property and need to be loaded.
	 * @private
	 */
	GraphicsCore.prototype._updatePlaceholders = function(vkScene, rootShadowContentResource, contentResources) {
		var that = this,
			nodeHierarchy = vkScene.getDefaultNodeHierarchy(),
			shadowContentResourcesToLoad = [];

		(function update(shadowContentResources, contentResources, parentNodeRef) {
			// This function compares changes in properties which might lead to DVL node re-creation or deletion.
			function equals(shadowContentResource, contentResource) {
				if (!shadowContentResource && !contentResource) {
					// Both are undefined/null.
					return true;
				} else if (!!shadowContentResource ^ !!contentResource) {
					// One is undefined/null, another is not undefined/null.
					return false;
				} else {
					// Both are not undefined/null.
					return shadowContentResource.source === contentResource.getSource()
						&& shadowContentResource.sourceType === contentResource.getSourceType()
						&& shadowContentResource.name === contentResource.getName()
						&& shadowContentResource.password === contentResource.getPassword();
				}
			}

			// The mutable properties do not lead to re-creation of DVL nodes.
			function copyMutableProperties(shadowContentResource, contentResource) {
				contentResource._shadowContentResource = shadowContentResource;
				shadowContentResource.sourceId = contentResource.getSourceId();
				shadowContentResource.localMatrix = contentResource.getLocalMatrix();
				if (shadowContentResource.nodeProxy) {
					shadowContentResource.nodeProxy.setLocalMatrix(shadowContentResource.localMatrix);
				}
			}

			// Scan shadow content resources comparing them with new content resources.
			// Equal content resources are scanned recursively.
			var i = 0; // Shadow content resource index.
			var changes = jQuery.sap.arrayDiff(shadowContentResources, contentResources, equals, true);
			changes.forEach(function(change) {
				// Compare unchanged items.
				for (; i < change.index; ++i) {
					update(shadowContentResources[i].children, contentResources[i].getContentResources(), shadowContentResources[i].nodeProxy.getNodeRef());
					copyMutableProperties(shadowContentResources[i], contentResources[i]);
				}
				if (change.type === "delete") {
					that._destroyShadowContentResource(vkScene, shadowContentResources[change.index]);
					shadowContentResources.splice(change.index, 1);
				} else if (change.type === "insert") {
					var nextNodeRef;
					if (i < shadowContentResources.length && shadowContentResources[i].nodeProxy) {
						nextNodeRef = shadowContentResources[i].nodeProxy.getNodeRef();
					}
					var shadowContentResource = new ShadowContentResource(contentResources[change.index]);
					shadowContentResourcesToLoad = shadowContentResourcesToLoad.concat(that._buildPlaceholders(nodeHierarchy, parentNodeRef, nextNodeRef, [shadowContentResource]));
					shadowContentResources.splice(change.index, 0, shadowContentResource);
					++i;
				}
			});
			// Compare remaining unchanged items.
			for (; i < shadowContentResources.length; ++i) {
				update(shadowContentResources[i].children, contentResources[i].getContentResources(), shadowContentResources[i].nodeProxy && shadowContentResources[i].nodeProxy.getNodeRef());
				copyMutableProperties(shadowContentResources[i], contentResources[i]);
			}
		})(rootShadowContentResource.fake ? rootShadowContentResource.children : [rootShadowContentResource], contentResources, null);

		return shadowContentResourcesToLoad;
	};

	// END: Generic Content Resource related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// BEGIN: Synchronous Content Resource related methods.

	/**
	 * Loads and merges a content resources to the root scene.
	 *
	 * This is a private helper method used in methods buildSceneTree and updateSceneTree.
	 * @param {sap.ui.vk.NodeHierarchy} nodeHierarchy The node hierarchy object.
	 * @param {ShadowContentResource} shadowContentResource The content resource to merge into the root scene.
	 * @private
	 */
	GraphicsCore.prototype._loadAndMergeContentResource = function(nodeHierarchy, shadowContentResource) {
		if (shadowContentResource.source) {
			var sourceDatum = this._findSourceData({ source: shadowContentResource.source })[0];
			if (!sourceDatum) {
				Log.warning("Failed to load content resource with sourceId '" + shadowContentResource.sourceId + "' due to failed downloading from URL '" + getSourceName(shadowContentResource.source) + "'.");
			} else {
				var groupingNodeRef = shadowContentResource.nodeProxy.getNodeRef();
				var dvlSceneDatum = this._findDvlSceneData({ sourceDatum: sourceDatum, root: false })[0];
				if (!dvlSceneDatum) {
					// The DVL scene is not created yet.
					try {
						dvlSceneDatum = new DvlSceneDatum(
							getPointer(
								sourceDatum instanceof VdslSourceDatum ?
									this._dvl.Core.LoadSceneFromVDSL(sourceDatum.content, shadowContentResource.password) :
									this._dvl.Core.LoadSceneByUrl(getSourceName(shadowContentResource.source), shadowContentResource.password, getStorageName(shadowContentResource.source))),
							sourceDatum, false);
					} catch (e) {
						Log.error(getResourceBundle().getText(Messages.VIT34.summary) + ": " + getSourceName(shadowContentResource.source), Messages.VIT34.code, "sap.ui.vk.dvl.GraphicsCore");
						return;
					}
					this._dvlSceneData.push(dvlSceneDatum);
					sourceDatum.addRef();
				}
				shadowContentResource.dvlSceneDatum = dvlSceneDatum;
				dvlSceneDatum.addRef();
				this._collectAndCheckSourceProperties(shadowContentResource);
				this._dvl.Renderer.ResetView(sap.ve.dvl.DVLRESETVIEWFLAG.CAMERA, this._rendererId);
				this._dvl.Scene.Merge(nodeHierarchy._dvlSceneRef, dvlSceneDatum.dvlSceneId, groupingNodeRef);
			}
		}
	};

	/**
	 * Builds a scene tree from the hierarchy of content resources. The content resources must be already downloaded.
	 * @param {sap.ui.vk.ContentResource[]} contentResources The array of content resources to build the scene from.
	 * @returns {sap.ui.vk.dvl.Scene} The scene built from the content resources.
	 * @public
	 */
	GraphicsCore.prototype.buildSceneTree = function(contentResources) {
		// At this point all content contentResources must be downloaded.

		if (contentResources.length === 0) {
			return null;
		}

		var rootDvlSceneDatum;
		var rootShadowContentResource;
		var shadowContentResources = contentResources.map(function(contentResource) {
			return new ShadowContentResource(contentResource);
		});

		// First create a DVL scene either from the root content resource or an empty one if there are more than one
		// root content resource.
		// Then for each child content resource create a placeholder node.
		// Then load child DVL scenes and clone their top level nodes under placeholder nodes of the corresponding
		// content resources.

		// Process top level content contentResources in a special way. Then process next level content contentResources recursively.
		if (shadowContentResources.length === 1 && shadowContentResources[0].name == null) {
			rootShadowContentResource = shadowContentResources[0];
			if (rootShadowContentResource.source) {
				// If there is a single top level content resource with a URL or File then load the resource without creating
				// a grouping node and merging. Always create a new DVL scene because root DVL scenes are not shared among vkScenes.
				var sourceDatum = this._findSourceData({ source: rootShadowContentResource.source })[0];
				try {
					rootDvlSceneDatum = new DvlSceneDatum(
						getPointer(
							sourceDatum instanceof VdslSourceDatum ?
								this._dvl.Core.LoadSceneFromVDSL(sourceDatum.content, rootShadowContentResource.password) :
								this._dvl.Core.LoadSceneByUrl(getSourceName(rootShadowContentResource.source), rootShadowContentResource.password, getStorageName(rootShadowContentResource.source))),
						sourceDatum, true);
				} catch (e) {
					Log.error(getResourceBundle().getText(Messages.VIT34.summary) + ": " + getSourceName(rootShadowContentResource.source), Messages.VIT34.code, "sap.ui.vk.dvl.GraphicsCore");
					return null;
				}
				sourceDatum.addRef();
			} else {
				rootDvlSceneDatum = new DvlSceneDatum(this._dvl.Core.CreateEmptyScene(), null, true);
			}
		} else {
			// Create a fake root content resource.
			var fakeRootContentResource = new ContentResource({
				sourceType: "vds",
				sourceId: uid()
			});
			rootShadowContentResource = new ShadowContentResource(fakeRootContentResource, true);
			fakeRootContentResource.destroy();
			fakeRootContentResource = null;
			Array.prototype.push.apply(rootShadowContentResource.children, shadowContentResources);
			shadowContentResources = [rootShadowContentResource];
			// Always create a new empty scene for the root node.
			rootDvlSceneDatum = new DvlSceneDatum(this._dvl.Core.CreateEmptyScene(), null, true);
		}
		this._dvlSceneData.push(rootDvlSceneDatum);
		rootShadowContentResource.dvlSceneDatum = rootDvlSceneDatum;
		rootDvlSceneDatum.addRef();
		this._collectAndCheckSourceProperties(rootShadowContentResource);

		var vkScene = new Scene(this, rootDvlSceneDatum.dvlSceneId);
		this._vkSceneData.push(new VkSceneDatum(vkScene, rootShadowContentResource));

		this._buildPlaceholders(vkScene.getDefaultNodeHierarchy(), null, null, rootShadowContentResource.children)
			.forEach(this._loadAndMergeContentResource.bind(this, vkScene.getDefaultNodeHierarchy()));

		return vkScene;
	};

	/**
	 * Updates or rebuilds a scene tree from the hierarchy of content resources.
	 *
	 * The content resources must be already loaded. Some changes in the content resource hierarchy can lead to
	 * rebuilding the scene completely. In this case a new scene is created.
	 *
	 * @param {sap.ui.vk.dvl.Scene} vkScene The scene to update or null to force to create a new one.
	 * @param {sap.ui.vk.ContentResource[]} contentResources The array of content resources to update or build the scene from.
	 * @param {function} [onError] The callback function to call when an error happens.
	 * @returns {sap.ui.vk.dvl.Scene} The scene updated or created.
	 * @public
	 */
	GraphicsCore.prototype.updateSceneTree = function(vkScene, contentResources, onError) {
		// At this point all content contentResources must be downloaded.

		if (contentResources.length === 0) {
			return null;
		}

		var errors;
		var contentResourcesWithEncryptedVds3 = this._getContentResourcesWithEncryptedVds3(contentResources);
		if (contentResourcesWithEncryptedVds3.length > 0) {
			Log.error(getResourceBundle().getText(Messages.VIT25.summary), Messages.VIT25.code, "sap.ui.vk.dvl.GraphicsCore");
			errors = errors || {};
			errors.contentResourcesWithEncryptedVds3 = contentResourcesWithEncryptedVds3;
		}
		var contentResourcesWithMissingPasswords = this._getContentResourcesWithMissingPasswords(contentResources);
		if (contentResourcesWithMissingPasswords.length > 0) {
			Log.error(getResourceBundle().getText(Messages.VIT21.summary), Messages.VIT21.code, "sap.ui.vk.dvl.GraphicsCore");
			errors = errors || {};
			errors.contentResourcesWithMissingPasswords = contentResourcesWithMissingPasswords;
		}
		if (errors && onError) {
			onError(errors);
		}

		if (!vkScene) {
			return this.buildSceneTree(contentResources);
		}

		var rootShadowContentResource = this._findVkSceneData({ vkScene: vkScene })[0].shadowContentResource;
		var oldRootIsFromFile = !!rootShadowContentResource.source;
		var newRootIsFromFile = contentResources.length === 1 && !!contentResources[0].getSource();

		if (!(oldRootIsFromFile && newRootIsFromFile && rootShadowContentResource.source === contentResources[0].getSource()
			|| !oldRootIsFromFile && !newRootIsFromFile && rootShadowContentResource.fake === contentResources.length > 1
		)
			|| !rootShadowContentResource.fake && contentResources.length === 1 && rootShadowContentResource.name !== contentResources[0].getName()) {
			return this.buildSceneTree(contentResources);
		}

		this._updatePlaceholders(vkScene, rootShadowContentResource, contentResources)
			.forEach(this._loadAndMergeContentResource.bind(this, vkScene.getDefaultNodeHierarchy()));

		vkScene.getDefaultNodeHierarchy().fireChanged();

		return vkScene;
	};

	// END: Synchronous Content Resource related methods.
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// BEGIN: Asynchronous Content Resource related methods.

	/**
	 * Loads a DVL scene asynchronously.
	 * @param {SourceDatum} sourceDatum A source to load.
	 * @param {string}      [password]  A password to use to decrypt the model.
	 * @returns {Promise} A promise object which resolves with a scene ID.
	 * @private
	 */
	GraphicsCore.prototype._loadDvlSceneAsync = function(sourceDatum, password) {
		return new Promise(function(resolve, reject) {
			var deregisterEventHandlers;

			var handleSucceeded = function(parameters) {
				deregisterEventHandlers();
				this.fireSceneLoadingFinished({
					source: sourceDatum.source,
					sceneId: parameters.sceneId
				});
				resolve(parameters.sceneId);
			};

			var handleFailed = function(parameters) {
				deregisterEventHandlers();
				var errorMessage = parameters.errorMessage;
				if (errorMessage == null) {
					errorMessage = sap.ve.dvl.DVLRESULT.getDescription ? sap.ve.dvl.DVLRESULT.getDescription(parameters.errorCode) : "";
				}
				var reason = {
					source: sourceDatum.source,
					errorCode: parameters.errorCode,
					errorMessage: errorMessage
				};
				this.fireSceneLoadingFinished(reason);
				reject(reason);
			};

			var handleProgress = function(clientId, percentage) {
				this.fireSceneLoadingProgress({
					source: getSourceName(sourceDatum.source),
					percentage: percentage
				});
				return true; // Continue loading the model.
			}.bind(this);

			deregisterEventHandlers = function() {
				this._dvl.Client.NotifyFileLoadProgress = null;
				this._dvl.Client.detachSceneFailed(handleFailed, this);
				this._dvl.Client.detachSceneLoaded(handleSucceeded, this);
			}.bind(this);

			this._dvl.Client.attachSceneLoaded(handleSucceeded, this);
			this._dvl.Client.attachSceneFailed(handleFailed, this);
			this._dvl.Client.NotifyFileLoadProgress = handleProgress;

			this.fireSceneLoadingStarted({
				source: getSourceName(sourceDatum.source)
			});

			try {
				checkResult(sourceDatum instanceof VdslSourceDatum ?
					this._dvl.Core.LoadSceneFromVDSLAsync(sourceDatum.content, password) :
					this._dvl.Core.LoadSceneByUrlAsync(getSourceName(sourceDatum.source), password, getStorageName(sourceDatum.source)));
			} catch (e) {
				deregisterEventHandlers();
				handleFailed.call(this, { errorCode: e instanceof DvlException ? e.code : sap.ve.dvl.DVLRESULT.FAIL, errorMessage: e instanceof DvlException ? null : e });
			}
		}.bind(this));
	};

	var forEachAsynchronousSequential = function(objects, action) {
		return new Promise(function(resolve /* , reject */) {
			(function step(index) {
				if (index >= objects.length) {
					resolve();
				} else {
					action(objects[index])
						.catch(function() {
							// If the action fails we still need to go to the next object in the object list.
							// Pass through to the 'then' method below.
						})
						.then(function() {
							step(index + 1);
						});
				}
			})(0); // Start with the first item.
		});
	};

	/**
	 * Loads and merges a content resources to the root scene.
	 *
	 * This is a private helper method used in methods buildSceneTree and updateSceneTree.
	 * @param {sap.ui.vk.NodeHierarchy} nodeHierarchy The node hierarchy object.
	 * @param {ShadowContentResource[]} shadowContentResources The content resources to merge into the root scene.
	 * @returns {Promise} A Promise object that resolves when all content resources have been loaded.
	 * @private
	 */
	GraphicsCore.prototype._loadAndMergeContentResourcesAsync = function(nodeHierarchy, shadowContentResources) {
		var errors,
			that = this;
		return forEachAsynchronousSequential(shadowContentResources, function(shadowContentResource) {
			if (shadowContentResource.source) {
				var sourceDatum = that._findSourceData({ source: shadowContentResource.source })[0];
				if (!sourceDatum) {
					var message = "Failed to load content resource with sourceId '" + shadowContentResource.sourceId + "' due to failed downloading from URL '" + getSourceName(shadowContentResource.source) + "'.";
					Log.warning(message);
					errors = errors || [];
					errors.push({
						errorMessage: message,
						source: shadowContentResource.source
					});
					return Promise.reject();
				}
				return (function() {
					var dvlSceneDatum = that._findDvlSceneData({ sourceDatum: sourceDatum, root: false })[0];
					if (dvlSceneDatum) {
						return Promise.resolve(dvlSceneDatum);
					} else {
						// The DVL scene is not created yet.
						return that._loadDvlSceneAsync(sourceDatum, shadowContentResource.password).then(
							function(dvlSceneId) { // onFulfilled
								dvlSceneDatum = new DvlSceneDatum(dvlSceneId, sourceDatum, false);
								that._dvlSceneData.push(dvlSceneDatum);
								sourceDatum.addRef();
								return Promise.resolve(dvlSceneDatum);
							},
							function(reason) { // onRejected
								errors = errors || [];
								errors.push(reason);
								return Promise.reject();
							}
						);
					}
				})().then(function(dvlSceneDatum) {
					shadowContentResource.dvlSceneDatum = dvlSceneDatum;
					dvlSceneDatum.addRef();
					that._collectAndCheckSourceProperties(shadowContentResource);
					var groupingNodeRef = shadowContentResource.nodeProxy.getNodeRef();
					that._dvl.Renderer.ResetView(sap.ve.dvl.DVLRESETVIEWFLAG.CAMERA, that._rendererId);
					that._dvl.Scene.Merge(nodeHierarchy._dvlSceneRef, dvlSceneDatum.dvlSceneId, groupingNodeRef);
					return Promise.resolve();
				});
			}
			return Promise.resolve();
		}).then(function() {
			return Promise.resolve(errors);
		});
	};

	/**
	 * Builds a scene tree from the hierarchy of content resources. The content resources must be already loaded.
	 * @param {sap.ui.vk.ContentResource[]} contentResources The array of content resources to build the scene from.
	 * @returns {Promise} A {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise Promise} object
	 *     that resolves with an object with two fields:
	 *     <ul>
	 *         <li><code>scene</code> - {@link sap.ui.vk.dvl.Scene sap.ui.vk.dvl.Scene} - the scene object.</li>
	 *         <li><code>failureReason</code> - object[] - the list of errors if any.</li>
	 *     </ul>
	 * @public
	 */
	GraphicsCore.prototype.buildSceneTreeAsync = function(contentResources) {
		// At this point all content contentResources must be downloaded.

		if (contentResources.length === 0) {
			return Promise.resolve(null);
		}

		var shadowContentResources = contentResources.map(function(contentResource) {
			return new ShadowContentResource(contentResource);
		});

		// First create a DVL scene either from the root content resource or an empty one if there are more than one
		// root content resource.
		// Then for each child content resource create a placeholder node.
		// Then load child DVL scenes and clone their top level nodes under placeholder nodes of the corresponding
		// content resources.

		return function() {
			var rootShadowContentResource;
			// Process top level content contentResources in a special way. Then process next level content contentResources recursively.
			if (shadowContentResources.length === 1 && shadowContentResources[0].name == null) {
				rootShadowContentResource = shadowContentResources[0];
				if (rootShadowContentResource.source) {
					// If there is a single top level content resource with a URL or File then load the resource without creating
					// a grouping node and merging. Always create a new DVL scene because root DVL scenes are not shared among vkScenes.
					var sourceDatum = this._findSourceData({ source: rootShadowContentResource.source })[0];
					if (sourceDatum) {
						return this._loadDvlSceneAsync(sourceDatum, rootShadowContentResource.password).then(
							function(dvlSceneId) { // onFulfilled
								var rootDvlSceneDatum = new DvlSceneDatum(dvlSceneId, sourceDatum, true);
								sourceDatum.addRef();
								return Promise.resolve({
									shadowContentResource: rootShadowContentResource,
									dvlSceneDatum: rootDvlSceneDatum
								});
							}
						);
					} else {
						return Promise.reject({
							errorMessage: "Failed to download the root content resource.",
							source: rootShadowContentResource.source
						});
					}
				}
				return Promise.resolve({
					shadowContentResource: rootShadowContentResource,
					dvlSceneDatum: new DvlSceneDatum(this._dvl.Core.CreateEmptyScene(), null, true)
				});
			} else {
				// Create a fake root content resource.
				var fakeRootContentResource = new ContentResource({
					sourceType: "vds",
					sourceId: uid()
				});
				rootShadowContentResource = new ShadowContentResource(fakeRootContentResource, true);
				fakeRootContentResource.destroy();
				fakeRootContentResource = null;
				Array.prototype.push.apply(rootShadowContentResource.children, shadowContentResources);
				shadowContentResources = [rootShadowContentResource];
				// Always create a new empty scene for the root node.
				return Promise.resolve({
					shadowContentResource: rootShadowContentResource,
					dvlSceneDatum: new DvlSceneDatum(this._dvl.Core.CreateEmptyScene(), null, true)
				});
			}
		}.call(this).then(
			function(root) { // onFulfilled
				this._dvlSceneData.push(root.dvlSceneDatum);
				root.shadowContentResource.dvlSceneDatum = root.dvlSceneDatum;
				root.dvlSceneDatum.addRef();
				this._collectAndCheckSourceProperties(root.shadowContentResource);

				var vkScene = new Scene(this, root.dvlSceneDatum.dvlSceneId);
				this._vkSceneData.push(new VkSceneDatum(vkScene, root.shadowContentResource));

				var nodeHierarchy = vkScene.getDefaultNodeHierarchy();
				return this._loadAndMergeContentResourcesAsync(nodeHierarchy, this._buildPlaceholders(vkScene.getDefaultNodeHierarchy(), null, null, root.shadowContentResource.children)).then(function(errors) {
					return Promise.resolve({
						scene: vkScene,
						failureReason: errors
					});
				});
			}.bind(this)
		);
	};

	/**
	 * Updates or rebuilds a scene tree from the hierarchy of content resources.
	 *
	 * The content resources must be already loaded. Some changes in the content resource hierarchy can lead to
	 * rebuilding the scene completely. In this case a new scene is created.
	 *
	 * @param {sap.ui.vk.dvl.Scene} vkScene The scene to update or null to force to create a new one.
	 * @param {sap.ui.vk.ContentResource[]} contentResources The array of content resources to update or build the scene from.
	 * @returns {Promise} A {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise Promise} object
	 *     that resolves with an object with two fields:
	 *     <ul>
	 *         <li><code>scene</code> - {@link sap.ui.vk.dvl.Scene sap.ui.vk.dvl.Scene} - the scene object.</li>
	 *         <li><code>failureReason</code> - object[] - the list of errors if any.</li>
	 *     </ul>
	 * @public
	 */
	GraphicsCore.prototype.updateSceneTreeAsync = function(vkScene, contentResources) {
		// At this point all content contentResources must be downloaded.

		if (contentResources.length === 0) {
			return Promise.resolve(null);
		}

		var contentResourcesWithEncryptedVds3 = this._getContentResourcesWithEncryptedVds3(contentResources);
		if (contentResourcesWithEncryptedVds3.length > 0) {
			Log.error(getResourceBundle().getText(Messages.VIT25.summary), Messages.VIT25.code, "sap.ui.vk.dvl.GraphicsCore");
		}
		var contentResourcesWithMissingPasswords = this._getContentResourcesWithMissingPasswords(contentResources);
		if (contentResourcesWithMissingPasswords.length > 0) {
			Log.error(getResourceBundle().getText(Messages.VIT21.summary), Messages.VIT21.code, "sap.ui.vk.dvl.GraphicsCore");
		}

		if (!vkScene) {
			return this.buildSceneTreeAsync(contentResources);
		}

		var rootShadowContentResource = this._findVkSceneData({ vkScene: vkScene })[0].shadowContentResource;
		var oldRootIsFromFile = !!rootShadowContentResource.source;
		var newRootIsFromFile = contentResources.length === 1 && !!contentResources[0].getSource();

		if (!(oldRootIsFromFile && newRootIsFromFile && rootShadowContentResource.source === contentResources[0].getSource()
			|| !oldRootIsFromFile && !newRootIsFromFile && rootShadowContentResource.fake === contentResources.length > 1
		)
			|| !rootShadowContentResource.fake && contentResources.length === 1 && rootShadowContentResource.name !== contentResources[0].getName()) {
			return this.buildSceneTreeAsync(contentResources);
		}

		return new Promise(function(resolve, reject) {
			var nodeHierarchy = vkScene.getDefaultNodeHierarchy();
			this._loadAndMergeContentResourcesAsync(nodeHierarchy, this._updatePlaceholders(vkScene, rootShadowContentResource, contentResources)).then(function(errors) {
				resolve({
					scene: vkScene,
					failureReason: errors
				});
				nodeHierarchy.fireChanged();
			});
		}.bind(this));
	};

	// END: Asynchronous Content Resource related methods.
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: Scene related methods.

	/**
	 * Destroys the scene object.
	 * @param {sap.ui.vk.dvl.Scene} vkScene The scene to destroy.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	GraphicsCore.prototype.destroyScene = function(vkScene) {
		var vkSceneDataIndex;
		for (vkSceneDataIndex = 0; vkSceneDataIndex < this._vkSceneData.length; ++vkSceneDataIndex) {
			if (this._vkSceneData[vkSceneDataIndex].vkScene === vkScene) {
				break;
			}
		}
		if (vkSceneDataIndex === this._vkSceneData.length) {
			Log.warning("Scene with id '" + vkScene.getId() + "' is not created by this GraphicsCore.");
			return this;
		}
		var vkSceneData = this._vkSceneData.splice(vkSceneDataIndex, 1)[0];
		this._destroyShadowContentResource(vkScene, vkSceneData.shadowContentResource);
		vkScene.destroy();
		return this;
	};

	// END: Scene related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: Viewport related methods.

	var findIndex = function(array, predicate, thisArg) {
		assert(Array.isArray(array), "The first parameter must be an array.");
		assert(typeof predicate === "function", "The second parameter must be a function.");
		for (var i = 0, count = array.length; i < count; ++i) {
			if (predicate.call(thisArg, array[i], i, array)) {
				return i;
			}
		}
		return -1;
	};

	var findViewportByControl = function(viewports, control) {
		return findIndex(viewports, function(viewport) {
			return viewport.control === control;
		});
	};

	var findViewportByRendererId = function(viewports, rendererId) {
		return findIndex(viewports, function(viewport) {
			return viewport.rendererId === rendererId;
		});
	};

	/**
	 * Registers the viewport control in GraphicsCore.
	 * Viewports are registered when corresponding DVLRenderers are created.
	 * @param {sap.ui.vk.Viewport} viewportControl The viewport control to register.
	 * @returns {boolean} <code>true</code> if <code>viewportControl</code> gets registered, <code>false</code> if <code>viewportControl</code> was already registered.
	 * @private
	 */
	GraphicsCore.prototype._registerViewport = function(viewportControl) {
		assert(viewportControl, "The viewportControl parameter must not be null.");

		if (findViewportByControl(this._viewports, viewportControl) >= 0) {
			return false;
		}

		var newViewport = {
			control: viewportControl,
			canvas: null,
			rendererId: null
		};

		if (this._viewports.length === 0) {
			// As this is the only viewport use the WebGL canvas on screen and the default renderer.
			newViewport.canvas = this._canvas;
			newViewport.rendererId = this._rendererId;
			// As there is at least one viewport we can start the render loop.
			this._startRenderLoop();
		} else {
			// There are more than 1 viewport.

			if (this._viewports.length === 1) {
				// When a second viewport is registered the WebGL canvas associated with the first viewport goes off screen.
				// Create a 2D canvas for the first viewport.
				var firstViewport = this._viewports[0];
				firstViewport.control._setCanvas(firstViewport.canvas = document.createElement("canvas"));

				// The renderer for the first viewport remains the same.

				// Add a FrameFinished event handler to copy the image from the offscreen WebGL canvas to the 2D canvases.
				this._dvl.Client.attachFrameFinished(this._handleFrameFinished, this);
			}

			newViewport.canvas = document.createElement("canvas");
			newViewport.rendererId = this._dvl.Core.CreateRenderer();
		}

		viewportControl._setCanvas(newViewport.canvas);
		viewportControl._setRenderer(newViewport.rendererId);

		// When a viewport control changes its size we need to resize the WebGL canvas.
		viewportControl.attachResize(this._handleViewportResize, this);

		this._viewports.push(newViewport);

		return true;
	};

	/**
	 * De-registers the viewport control in GraphicsCore.
	 * Viewports are unregistered when corresponding DVLRenderers are destroyed.
	 * @param {sap.ui.vk.Viewport} viewportControl The viewport to unregister.
	 * @returns {boolean} <code>true</code> if <code>viewportControl</code> gets unregistered, <code>false</code> if <code>viewportControl</code> was already unregistered.
	 * @private
	 */
	GraphicsCore.prototype._deregisterViewport = function(viewportControl) {
		assert(viewportControl, "The viewportControl parameter must not be null.");

		var index = findViewportByControl(this._viewports, viewportControl);
		if (index < 0) {
			return false;
		}

		// The default renderer should not be deleted otherwise the behaviour is undefined.
		assert(index > 0 || this._viewports.length === 1, "The first registered viewport control must be deregistered last.");

		var viewport = this._viewports.splice(index, 1)[0];

		if (this._viewports.length === 0) {
			// It is the last viewport control, no need to run the render loop any more.
			// We do not delete the default renderer and the on-screen WebGL renderer used by the last viewport.
			this._stopRenderLoop();

			// NB: do not delete the last renderer as it is the default renderer required to keep geometry in GPU.
		} else {
			if (this._viewports.length === 1) {
				// As only one viewport remains there is no need to copy from the WebGL canvas to the 2D canvases any more,
				// so remove the FrameFinished event handler.
				this._dvl.Client.detachFrameFinished(this._handleFrameFinished, this);

				// As only one viewport remains use the WebGL canvas on screen.
				var remainingViewport = this._viewports[1 - index];
				remainingViewport.control._setCanvas(remainingViewport.canvas = this._canvas);
			}

			this._dvl.Core.DeleteRenderer(viewport.rendererId);
		}

		viewportControl.detachResize(this._handleViewportResize, this);
		viewportControl._setRenderer(null);
		viewportControl._setCanvas(null);

		return true;
	};

	/**
	 * Gets the Viewport object count.
	 * @returns {int} The number of Viewport objects registered in GraphicsCore.
	 * @private
	 */
	GraphicsCore.prototype._getViewportCount = function() {
		return this._viewports.length;
	};

	/**
	 * A [sap.ui.vk.Viewport.resize]{@link sap.ui.vk.Viewport#resize} event handler.
	 * @param {sap.ui.base.Event} event The event object.
	 * @private
	 */
	GraphicsCore.prototype._handleViewportResize = function(event) {
		if (this._viewports.length > 1) {
			this._canvas.width = Math.max.apply(null, this._viewports.map(function(viewport) { return viewport.canvas.width; }));
			this._canvas.height = Math.max.apply(null, this._viewports.map(function(viewport) { return viewport.canvas.height; }));
		}
	};

	/**
	 * Starts the render loop.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	GraphicsCore.prototype._startRenderLoop = function() {
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
	GraphicsCore.prototype._stopRenderLoop = function() {
		if (this._renderLoopRequestId) {
			window.cancelAnimationFrame(this._renderLoopRequestId);
			this._renderLoopRequestId = null;
		}
		return this;
	};

	/**
	 * Render a frame if needed and schedule rendering another frame.
	 * @private
	 */
	GraphicsCore.prototype._renderLoop = (function() {
		var lastRendererId; // The last renderer that rendered a frame. Used to optimise number of calls to SetDimensions in _renderLoop.

		return function() {
			var multipleViewports = this._viewports.length > 1;

			this._viewports.forEach(function(viewport) {
				var canvas = viewport.canvas,
					rendererId = viewport.rendererId;

				this._dvl.Renderer._processCommandQueue(rendererId);

				// NB: in some browsers the drawImage function fails when the canvas size is zero.
				if (canvas.width > 0 && canvas.height > 0 && this._dvl.Renderer.ShouldRenderFrame(rendererId)) {
					if (multipleViewports && lastRendererId !== rendererId) {
						// If there are more than one renderer we have to set OpenGL viewport for each frame.
						this._dvl.Renderer.SetDimensions(canvas.width, canvas.height, rendererId);
					}

					viewport.control.renderFrame();
					lastRendererId = rendererId;
				}
			}, this);

			this._renderLoopRequestId = window.requestAnimationFrame(this._renderLoop);
		};
	})();

	/**
	 * A callback called when rendering a frame finishes.
	 * @param {object} event            A map of parameters. See below.
	 * @param {string} event.clientId   Token representing the target client instance. This is usually the canvas ID.
	 * @param {string} event.rendererId Token representing the renderer instance.
	 * @private
	 */
	GraphicsCore.prototype._handleFrameFinished = function(event) {
		assert(this._viewports.length > 1, "Method _handleFrameFinished should be only called when there are multiple viewports.");

		if (this._viewports.length > 1) {
			// There are multiple viewports, copy from the WebGL canvas to the 2D canvas associated with the viewport.
			var index = findViewportByRendererId(this._viewports, event.rendererId);
			if (index >= 0) {
				var targetCanvas = this._viewports[index].canvas,
					targetContext = targetCanvas.getContext("2d"),
					targetWidth = targetCanvas.width,
					targetHeight = targetCanvas.height;
				// The origin of the WebGL context is in the left lower corner. The origin of the 2D context is in the left top corner.
				// That's why sourceY does not equal 0 in general case.
				targetContext.drawImage(this._canvas,
					0, this._canvas.height - targetHeight, targetWidth, targetHeight,
					0, 0, targetWidth, targetHeight);
			}
		}
	};

	// END: Viewport related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: View State Manager related methods.

	/**
	 * Creates a new ViewStateManager object.
	 *
	 * GraphicsCore owns the new ViewStateManager object. The object must be destroyed with the {@link #destroyViewStateManager destroyViewStateManager} method;
	 *
	 * @param {sap.ui.vk.NodeHierarchy} nodeHierarchy The NodeHierarchy object the view state manager is created for.
	 * @param {boolean} shouldTrackVisibilityChanges Flag set by the application to decide whether the {sap.ui.vk.ViewStateManager} should track the visibility changes or not.
	 * @returns {sap.ui.vk.ViewStateManager} The newly created ViewStateManager object.
	 * @public
	 * @deprecated Since version 1.50.0.
	 */
	GraphicsCore.prototype.createViewStateManager = function(nodeHierarchy, shouldTrackVisibilityChanges) {
		var viewStateManager = new ViewStateManager();
		viewStateManager._setNodeHierarchy(nodeHierarchy)
			.setShouldTrackVisibilityChanges(shouldTrackVisibilityChanges);
		this._viewStateManagers.push(viewStateManager);
		return viewStateManager;
	};

	/**
	 * Destroys the ViewStateManager object created with the {@link #createViewStateManager createViewStateManager} method.
	 *
	 * @param {sap.ui.vk.ViewStateManager} viewStateManager The ViewStateManagerObject to destroy.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @deprecated Since version 1.50.0.
	 */
	GraphicsCore.prototype.destroyViewStateManager = function(viewStateManager) {
		var index = this._viewStateManagers.indexOf(viewStateManager);
		if (index >= 0) {
			this._viewStateManagers.splice(index, 1)[0].destroy();
		}
		return this;
	};

	// END: View State Manager related methods.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// BEGIN: Utility methods.

	/**
	 * Shows or hides debug information in the viewports.
	 *
	 * @param {boolean} enable <code>true</code> to show debug information, <code>false</code> to hide debug information.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	GraphicsCore.prototype.showDebugInfo = function(enable) {
		this._viewports.forEach(function(viewport) {
			viewport.control.setShowDebugInfo(enable);
		});
		return this;
	};

	/**
	 * Gets one of APIs supported by the DVL library.
	 *
	 * @param {sap.ui.vk.dvl.GraphicsCoreApi} apiId The API identifier.
	 * @returns {object} The object that implements the requested API or null if the API is not supported.
	 * @public
	 */
	GraphicsCore.prototype.getApi = function(apiId) {
		switch (apiId) {
			case GraphicsCoreApi.LegacyDvl:
				return this._dvl;
			default:
				return null;
		}
	};

	/**
	 * Collects and destroys unused objects and resources.
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	GraphicsCore.prototype.collectGarbage = function() {
		this._cleanupDvlSceneData();
		this._cleanupSourceData();
		return this;
	};

	// END: Utility methods.
	////////////////////////////////////////////////////////////////////////

	GraphicsCore.prototype._onlocalizationChanged = function(event) {
		if (event.getParameter("changes").language) {
			checkResult(this._dvl.Core.SetLocale(core.getConfiguration().getLanguageTag()));
		}
	};

	/**
	 * Gets an object that decrypts content of encrypted models.
	 *
	 * @return {sap.ui.vk.DecryptionHandler} An object that decrypts content of encrypted models.
	 * @public
	 */
	GraphicsCore.prototype.getDecryptionHandler = function() {
		return this._dvl.Client.getDecryptionHandler();
	};

	/**
	 * Sets an object that decrypts content of encrypted models.
	 *
	 * @param {sap.ui.vk.DecryptionHandler} handler An object that decrypts content of encrypted models.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	GraphicsCore.prototype.setDecryptionHandler = function(handler) {
		this._dvl.Client.setDecryptionHandler(handler);
		return this;
	};

	/**
	 * Set application defined authorization callback function which will be used to obtain authorization token
	 * This can be used when download manager is connecting to secure remote server to download file
	 *
	 * @param {sap.ui.vk.AuthorizationHandler} handler The authorization callback function.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	GraphicsCore.prototype.setAuthorizationHandler = function(handler) {
		this._authorizationHandler = handler;
		return this;
	};

	/**
	 * Sets the maximum number of retry attempts for a download operation if the initial request to retrieve a model
	 * from a remote server could not be fulfilled and the error with which the request failed is considered recoverable.
	 *
	 * See {@link sap.ui.vk.ContentConnector#setRetryCount} for details.
	 *
	 * @param {int} retryCount Maximum number of retry attempts. Value must be non-negative.
	 * 				The default number of retry attempts is 1, unless specified otherwise by calling this method and
	 * 				passing in the desired value. Specifying 0 disables any retry attempts.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.95.0
	 */
	GraphicsCore.prototype.setRetryCount = function(retryCount) {
		this._retryCount = Math.max(retryCount, 0);
		return this;
	};

	////////////////////////////////////////////////////////////////////////////
	// BEGIN: Event handling

	GraphicsCore.prototype.attachSceneLoadingFinished = function(data, func, listener) {
		return this.attachEvent("sceneLoadingFinished", data, func, listener);
	};

	GraphicsCore.prototype.detachSceneLoadingFinished = function(func, listener) {
		return this.detachEvent("sceneLoadingFinished", func, listener);
	};

	GraphicsCore.prototype.fireSceneLoadingFinished = function(parameter, allowPreventDefault, enableEventBubbling) {
		return this.fireEvent("sceneLoadingFinished", parameter, allowPreventDefault, enableEventBubbling);
	};

	GraphicsCore.prototype.attachSceneLoadingProgress = function(data, func, listener) {
		return this.attachEvent("sceneLoadingProgress", data, func, listener);
	};

	GraphicsCore.prototype.detachSceneLoadingProgress = function(func, listener) {
		return this.detachEvent("sceneLoadingProgress", func, listener);
	};

	GraphicsCore.prototype.fireSceneLoadingProgress = function(parameter, allowPreventDefault, enableEventBubbling) {
		return this.fireEvent("sceneLoadingProgress", parameter, allowPreventDefault, enableEventBubbling);
	};

	GraphicsCore.prototype.attachSceneLoadingStarted = function(data, func, listener) {
		return this.attachEvent("sceneLoadingStarted", data, func, listener);
	};

	GraphicsCore.prototype.detachSceneLoadingStarted = function(func, listener) {
		return this.detachEvent("sceneLoadingStarted", func, listener);
	};

	GraphicsCore.prototype.fireSceneLoadingStarted = function(parameter, allowPreventDefault, enableEventBubbling) {
		return this.fireEvent("sceneLoadingStarted", parameter, allowPreventDefault, enableEventBubbling);
	};

	// END: Event handling
	////////////////////////////////////////////////////////////////////////////

	return GraphicsCore;
});
