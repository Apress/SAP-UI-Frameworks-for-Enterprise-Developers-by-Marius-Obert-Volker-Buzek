/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.svg.ContentManager.
sap.ui.define([
	"sap/base/Log",
	"../ContentManager",
	"./Scene",
	"./SceneBuilder",
	"./Element",
	"../Messages",
	"../getResourceBundle",
	// The following modules are pulled in to avoid their synchronous loading in
	// `sap.ui.vk.Viewport` and `sap.ui.vk.ViewStateManager`. They go last in this list
	// to avoid declaration of unused parameters in the callback.
	"./Viewport",
	"./ViewStateManager"
], function(
	Log,
	ContentManagerBase,
	Scene,
	SceneBuilder,
	Element,
	Messages,
	getResourceBundle
) {
	"use strict";

	/**
	 * Constructor for a new ContentManager.
	 *
	 * @class
	 * Provides a content manager object that uses to load 2D content.
	 *
	 * When registering a content manager resolver with {@link sap.ui.vk.ContentConnector.addContentManagerResolver sap.ui.vk.ContentConnector.addContentManagerResolver}
	 * you can pass a function that will load a model and merge it into the three.js scene.
	 *
	 * @see {@link sap.ui.vk.ContentConnector.addContentManagerResolver sap.ui.vk.ContentConnector.addContentManagerResolver} for an example.
	 *
	 * @param {string} [sId] ID for the new ContentManager object. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new ContentManager object.
	 * @protected
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.ContentManager
	 * @alias sap.ui.vk.svg.ContentManager
	 * @since 1.80.0
	 */
	var ContentManager = ContentManagerBase.extend("sap.ui.vk.svg.ContentManager", /** @lends sap.ui.vk.svg.ContentManager.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			events: {
				errorReported: {
					parameters: {
						error: {
							type: "any"
						}
					}
				}
			}
		}
	});

	var basePrototype = ContentManager.getMetadata().getParent().getClass().prototype;

	ContentManager.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}
	};

	ContentManager.prototype.exit = function() {
		if (this.defaultCdsLoader) {
			this.defaultCdsLoader.destroy();
			this.defaultCdsLoader = null;
		}

		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}
	};

	ContentManager.prototype._handleContentChangesProgress = function(event) {
		this.fireContentChangesProgress({
			phase: event.getParameter("phase"),
			source: event.getParameter("source"),
			percentage: event.getParameter("percentage")
		});
	};

	ContentManager.prototype._handleContentLoadingFinished = function(event) {
		this.fireContentLoadingFinished({
			source: event.getParameter("source"),
			node: event.getParameter("node")
		});
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
	 * @since 1.80.0
	 */
	ContentManager.prototype.loadContent = function(content, contentResources) {
		var that = this;
		var load = function() {
			that.fireContentChangesStarted();

			var scene = new Scene();

			that._loadContentResources(scene, contentResources).then(
				function(values) { // onFulfilled
					Log.info("Content loading resolved", values);
					if (values && values.length > 0 && values[0].initialView) {
						scene.setInitialView(values[0].initialView);
					}

					var i;
					// add camera camera content
					for (i = 0; i < values.length; i++) {
						if (values[i].camera) { // We grab camera from 1st resolved content which has camera
							scene.camera = values[i].camera;
							break;
						}
					}

					if (values.length > 0) {
						var value = values[0];
						scene.backgroundTopColor = value.backgroundTopColor; // hex color or undefined
						scene.backgroundBottomColor = value.backgroundBottomColor; // hex color or undefined
					}

					// add loader information to content to show who loaded it
					for (i = 0; i < values.length; i++) {
						if (values[i].loader) {
							scene.loaders = scene.loaders || [];
							scene.loaders.push(values[i].loader);
						}
						if (values[i].builder) {
							scene.builders = scene.builders || [];
							scene.builders.push(values[i].builder);
						}
					}

					if (that._totaraLoader) {
						scene.setSceneBuilder(that._totaraLoader.getSceneBuilder());
					}

					that.fireContentChangesFinished({
						content: scene
					});
				},
				function(reason) { // onRejected
					Log.info("Content loading rejected:", reason);
					var errMsg;
					if (typeof reason === "string") {
						errMsg = reason;
					} else if (reason.errorText) {
						errMsg = reason.errorText;
					} else if (reason.message) {
						errMsg = reason.message;
					}
					errMsg = errMsg || getResourceBundle().getText(Messages.VIT37.summary);
					Log.error(getResourceBundle().getText("CONTENTMANAGER_MSG_CONTENTRESOURCESFAILEDTOLOAD"), errMsg);
					that.fireContentChangesFinished({
						content: null,
						failureReason: [
							{
								error: reason,
								errorMessage: errMsg
							}
						]
					});
				}
			);
		};

		load();

		return this;
	};

	ContentManager.prototype._getTotaraLoader = function() {
		if (this._totaraLoader == null) {
			return new Promise(function(resolve) {
				var totaraModule = "sap/ui/vk/totara/TotaraLoader";
				sap.ui.require([
					totaraModule
				], function(Class) {
					var loader = new Class();
					loader.setSceneBuilder(new SceneBuilder());
					resolve(loader);
				});
			});
		}
		return Promise.resolve(this._totaraLoader);
	};

	ContentManager.prototype._getMataiLoader = function() {
		if (this._mataiLoader == null) {
			var that = this;
			return new Promise(function(resolve) {
				var mataiModule = "sap/ui/vk/matai/MataiLoader";
				sap.ui.require([
					mataiModule
				], function(Class) {
					resolve(that._mataiLoader = new Class());
				});
			});
		}
		return Promise.resolve(this._mataiLoader);
	};

	ContentManager.prototype._createLoadParam = function(resolve, reject, parentNode, contentResource) {
		var that = this;
		var initialCamera;
		var sceneLoaded = false;

		var contextParams = {
			root: parentNode,
			vkScene: this._currentScene,

			enableLogger: contentResource.getEnableLogger(),
			includeAnimation: false,
			includeBackground: contentResource.getIncludeBackground(),
			includeHidden: contentResource.getIncludeHidden(),
			includeParametric: true,
			includeUsageId: contentResource.getIncludeUsageId(),
			metadataFilter: contentResource.getMetadataFilter(),
			pushPMI: true,
			pushViewGroups: contentResource.getPushViewGroups(),
			useSecureConnection: contentResource.getUseSecureConnection(),

			onActiveCamera: function(newCam) {
				initialCamera = newCam;
			},
			onInitialSceneFinished: function(initialView) {
				sceneLoaded = true;
				resolve({
					node: parentNode,
					contentResource: contentResource,
					initialView: initialView,
					camera: initialCamera,
					loader: that._totaraLoader
				});
			},
			onLoadingFinished: function() {
				that.fireContentLoadingFinished({
					source: contentResource,
					node: parentNode
				});
			},
			onContentChangesProgress: function(event) {
				that.fireContentChangesProgress({ source: event.source, phase: event.phase, percentage: event.percentage });
			}
		};

		var errorCallback = function(info) {
			Log.warning("Content loading error reported:", JSON.stringify(info.getParameters()));

			var reason;
			if (info.getParameter("errorText")) {
				reason = info.getParameter("errorText");
			} else if (info.getParameter("error")) {
				reason = info.getParameter("error");
			} else if (info.getParameter("reason")) {
				reason = info.getParameter("reason");
			} else {
				reason = "failed to load: unknown reason";
			}

			if (sceneLoaded) {
				var errorCode = info.getParameter("error");
				if (errorCode && errorCode === 4) {
					// We had a good connection and now we lost it. Try to re-create connection
					that.initUrl(this._loader.getUrl(), true);
				}
			} else {
				that.detachErrorReported(errorCallback);

				// error from server has some detailed info
				if (info.getParameter("events")) {
					reason = reason + "\n" + JSON.stringify(info.getParameter("events"));
				}

				// if error happened before initial scene finished, we reject
				reject(reason);
			}
		};

		that.attachErrorReported(errorCallback);

		return contextParams;
	};

	ContentManager.prototype._reportError = function(error) {
		this.fireErrorReported(error);
	};

	ContentManager.prototype._loadStream = function(parentNode, contentResource) {
		var that = this;
		return new Promise(function(resolve, reject) {
			that._getTotaraLoader().then(
				function(loader) {
					that._totaraLoader = loader;
					var contextParams = that._createLoadParam(resolve, reject, parentNode, contentResource);
					loader.onErrorCallbacks.attach(that._reportError.bind(that));
					loader.setUrl(contentResource.getSource());
					loader.run();

					loader.request(contentResource.getVeid(), contextParams, that._authorizationHandler);
				});
		});
	};

	ContentManager.prototype._loadVDS4 = function(parentNode, contentResource) {
		var that = this;
		return this._getMataiLoader().then(function(loader) {
			if (loader) {
				that._mataiLoader = loader;
				loader.attachContentChangesProgress(that._handleContentChangesProgress, that);
				loader.attachContentLoadingFinished(that._handleContentLoadingFinished, that);
				return loader.load(parentNode, contentResource);
			} else {
				return Promise.resolve({
					node: parentNode,
					contentResource: contentResource
				});
			}
		});
	};

	ContentManager.prototype._loadContentResources = function(scene, contentResources) {
		this._currentScene = scene;
		this._currentNodeHierarchy = scene.getDefaultNodeHierarchy();

		var promises = [];
		var that = this;

		contentResources.forEach(function loadContentResource(parentElement, contentResource) {
			var element = new Element();
			element.name = contentResource.getName();
			element.sourceId = contentResource.getSourceId();
			parentElement.add(element);
			contentResource._shadowContentResource = {
				nodeProxy: this._currentNodeHierarchy.createNodeProxy(element)
			};

			var contentManagerResolver = contentResource._contentManagerResolver;
			var loader = contentManagerResolver && contentManagerResolver.settings ? contentManagerResolver.settings.loader : null;
			if (loader) {
				if (typeof loader === "function") {
					promises.push(loader(element, contentResource, that._authorizationHandler));
				} else if (loader && loader.load) {
					element.matrix = new Float32Array([1, 0, 0, -1, 0, 0]);
					promises.push(loader.load(element, contentResource, that._authorizationHandler));
					this._totaraLoader = loader._loader;
					this._totaraLoader.onLoadingFinishedCallbacks.attach(function() {
						that.fireContentLoadingFinished({
							source: contentResource,
							node: element
						});
					});
				} else {
					promises.push(Promise.resolve({
						node: element,
						contentResource: contentResource
					}));
				}
			} else {
				var sourceType = contentResource.getSourceType();

				switch (sourceType ? sourceType.toLowerCase() : null) {
					case "stream2d": {
						// Since SVG coordinate system origin is top left and ours is bottom left we apply vertical flip
						element.matrix = new Float32Array([1, 0, 0, -1, 0, 0]);
						promises.push(this._loadStream(element, contentResource));
						break;
					}
					case "vds4-2d": {
						element.matrix = new Float32Array([1, 0, 0, -1, 0, 0]);
						promises.push(this._loadVDS4(element, contentResource));
						break;
					}
					default:
						break;
				}
			}
		}.bind(this, scene.getRootElement()));

		return Promise.all(promises);
	};

	ContentManager.prototype.destroyContent = function(content) {
		if (content) {
			content.destroy();
		}

		if (this._totaraLoader) {
			this._totaraLoader.dispose();
			this._totaraLoader = null;
		} else if (this._mataiLoader && content.builders && Array.isArray(content.builders)) {
			content.builders.forEach(function(sb) {
				if (sb) {
					sb.cleanup();
				}
			});
			this._mataiLoader.destroy();
			this._mataiLoader = null;
		}
	};

	return ContentManager;
});
