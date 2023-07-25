/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.dvl.ContentManager.
sap.ui.define([
	"../ContentManager",
	"../getResourceBundle"
], function(
	ContentManagerBase,
	getResourceBundle
) {
	"use strict";

	/**
	 * Constructor for a new ContentManager.
	 *
	 * @class
	 * Provides a loader that uses the DVL library to load VDS and VDSL files.
	 *
	 * @param {string} [sId] ID for the new ContentManager object. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new ContentManager object.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.ContentManager
	 * @alias sap.ui.vk.dvl.ContentManager
	 * @deprecated Since version 1.72.0.
	 * @since 1.50.0
	 */
	var ContentManager = ContentManagerBase.extend("sap.ui.vk.dvl.ContentManager", /** @lends sap.ui.vk.dvl.ContentManager.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = ContentManager.getMetadata().getParent().getClass().prototype;

	ContentManager.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._handleDownloadingProgressProxy = this._handleDownloadingProgress.bind(this);

		this._graphicsCore = null;
		this._failedSources = [];
	};

	ContentManager.prototype.exit = function() {
		if (this._graphicsCore) {
			this._graphicsCore.destroy();
			this._graphicsCore = null;
		}

		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}
	};

	var runtimeSettings = {},
		webGLContextAttributes = {
			antialias: true,
			alpha: true,
			premultipliedAlpha: true
		};

	/**
	 * Gets optional Emscripten runtime module settings.
	 * @returns {object} A JSON-like object. See {@link ContentManager.setRuntimeSettings ContentManager.setRuntimeSettings}.
	 * @public
	 * @static
	 * @since 1.50.0
	 */
	ContentManager.getRuntimeSettings = function() {
		return runtimeSettings;
	};

	/**
	 * Sets optional Emscripten runtime module settings.
	 *
	 * Emscripten runtime module settings cannot be changed after the Emscripten module is initialized.
	 * @param {object} settings                         A JSON object with the following properties.
	 * @param {int}    [settings.totalMemory=536870912] The size of Emscripten module memory in bytes, default value: 512 MB.
	 * @param {string} [settings.logElementId]          ID of a textarea DOM element to write the log to.
	 * @param {string} [settings.statusElementId]       ID of a DOM element to write the status messages to.
	 * @public
	 * @static
	 * @since 1.50.0
	 */
	ContentManager.setRuntimeSettings = function(settings) {
		runtimeSettings = settings;
	};

	/**
	 * Gets optional WebGL context attributes.
	 * @returns {object} A JSON-like object. See {@link ContentManager.setWebGLContextAttributes ContentManager.setWebGLContextAttributes}.
	 * @public
	 * @static
	 * @since 1.50.0
	 */
	ContentManager.getWebGLContextAttributes = function() {
		return webGLContextAttributes;
	};

	/**
	 * Sets optional WebGL context attributes.
	 *
	 * @param {object} attributes                             A JSON object with the following properties.
	 * @param {boolean} [attributes.antialias=true]           If set to <code>true</code>, the context will attempt to perform antialiased
	 *                                                        rendering if possible.
	 * @param {boolean} [attributes.alpha=true]               If set to <code>true</code>, the context will have an alpha (transparency) channel.
	 * @param {boolean} [attributes.premultipliedAlpha=false] If set to <code>true</code>, the color channels in the framebuffer will be stored
	 *                                                        premultiplied by the alpha channel to improve performance.
	 * Other {@link https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2 WebGL context attributes} are also supported. WebGL
	 * context attributes cannot be changed after the control is fully initialized.
	 * @public
	 * @static
	 * @since 1.50.0
	 */
	ContentManager.setWebGLContextAttributes = function(attributes) {
		webGLContextAttributes = Object.assign(webGLContextAttributes, attributes);
	};

	/**
	 * Gets the instance of <code>GraphicsCore</code>.
	 * @returns {Promise} A promise that is resolved with a {@link sap.ui.vk.dvl.GraphicsCore GraphicsCore} instance when it is created and initialized.
	 * @private
	 */
	ContentManager.prototype._getGraphicsCore = function() {
		var that = this;
		return new Promise(function(resolve, reject) {
			if (that._graphicsCore) {
				resolve(that._graphicsCore);
			} else {
				sap.ui.require(["sap/ui/vk/dvl/GraphicsCore"], function(GraphicsCore) {
					GraphicsCore.create(runtimeSettings, webGLContextAttributes)
						.then(function(graphicsCore) {
							that._graphicsCore = graphicsCore;
							that._graphicsCore.attachSceneLoadingStarted(that._handleDvlSceneLoadingStarted, that);
							that._graphicsCore.attachSceneLoadingFinished(that._handleDvlSceneLoadingFinished, that);
							that._graphicsCore.attachSceneLoadingProgress(that._handleDvlSceneLoadingProgress, that);
							resolve(that._graphicsCore);
						});
				});
			}
		});
	};

	ContentManager.prototype._handleDownloadingProgress = function(event) {
		var source = event.getParameter("source"),
			loaded = event.getParameter("loaded"),
			total = event.getParameter("total"),
			value = total ? loaded / total * 50 : 0;
		this.fireContentChangesProgress({
			phase: getResourceBundle().getText("PROGRESS_INDICATOR_DOWNLOADING"),
			source: source,
			percentage: value
		});
	};

	ContentManager.prototype._handleDvlSceneLoadingProgress = function(event) {
		this.fireContentChangesProgress({
			phase: getResourceBundle().getText("PROGRESS_INDICATOR_RENDERING"),
			source: event.getParameter("source"),
			percentage: 50 + event.getParameter("percentage") * 50
		});
	};

	ContentManager.prototype._handleDvlSceneLoadingStarted = function(event) {
	};

	ContentManager.prototype._handleDvlSceneLoadingFinished = function(event) {
	};

	/**
	 * Starts downloading and building or updating the content from the content resources.
	 *
	 * This method is asynchronous.
	 *
	 * @param {any}                         content          The current content to update. It can be <code>null</code> if this is an initial loading call.
	 * @param {sap.ui.vk.ContentResource[]} contentResources The content resources to load or update.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.50.0
	 */
	ContentManager.prototype.loadContent = function(content, contentResources) {
		this.fireContentChangesStarted();
		var that = this;
		this._getGraphicsCore()
			.then(
				function(graphicsCore) { // onFulfilled
					graphicsCore.setDecryptionHandler(that._decryptionHandler);
					graphicsCore.setAuthorizationHandler(that._authorizationHandler);
					graphicsCore.setRetryCount(that._retryCount);
					graphicsCore.loadContentResourcesAsync(
						contentResources,
						function(sourcesFailedToDownload) {
							var failureReason = [];
							if (sourcesFailedToDownload) {
								sourcesFailedToDownload.forEach(function(item) {
									failureReason.push({
										error: item,
										errorMessage: "Failed to download source '" + ((item.source instanceof File) ? item.source.name : item.source) + "'."
									});
								});
							}

							var loadedScene = content ? content : undefined;

							graphicsCore.updateSceneTreeAsync(loadedScene, contentResources)
								.then(function(data) {
									var result = {
										content: data.scene
									};
									if (data.failureReason) {
										failureReason = failureReason.concat(data.failureReason);
									}
									if (failureReason.length > 0) {
										result.failureReason = failureReason;
									}

									// The following modules are pulled in to avoid their synchronous loading in
									// `sap.ui.vk.Viewport` and `sap.ui.vk.ViewStateManager`. We assume that if a VDS
									// model is loaded it will be displayed in a Viewport, and a ViewStateManager will
									// also be used.
									sap.ui.require([
										"sap/ui/vk/dvl/Viewport",
										"sap/ui/vk/dvl/ViewStateManager"
									], function() {
										that.fireContentChangesFinished(result);
									});
								})
								.catch(function(reason) {
									if (typeof reason === "string") {
										failureReason.push({
											error: reason,
											errorMessage: reason
										});
									} else {
										failureReason.push({
											error: reason,
											errorMessage: reason.message ? reason.message : reason.errorMessage
										});
									}
									that.fireContentChangesFinished({
										content: null,
										failureReason: failureReason
									});
								});
						},
						that._handleDownloadingProgressProxy
					);
				},
				function(reason) { // onRejected
					that.fireContentChangesFinished({
						content: null,
						failureReason: {
							error: reason,
							errorMessage: "Failed to create DVL graphics core object."
						}
					});
				}
			);
		return this;
	};

	/**
	 * Destroys the content.
	 *
	 * @param {any} content The content to destroy.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.50.0
	 */
	ContentManager.prototype.destroyContent = function(content) {

		if (content) {
			this._graphicsCore.destroyScene(content);
		}

		return this;
	};

	/**
	 * Collects and destroys unused objects and resources.
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.50.0
	 */
	ContentManager.prototype.collectGarbage = function() {
		this._graphicsCore.collectGarbage();
		return this;
	};

	return ContentManager;
});
