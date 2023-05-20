/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.ContentConnector.
sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/ui/base/Object",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Element",
	"./Messages",
	"./getResourceBundle",
	"./ContentResource",
	"./Core",
	"sap/base/Log"
], function(
	ObjectPath,
	BaseObject,
	ManagedObjectObserver,
	Element,
	Messages,
	getResourceBundle,
	ContentResource,
	vkCore,
	Log
) {
	"use strict";

	var basePrototype = Element.prototype;

	/**
	 * Constructor for a new ContentConnector.
	 *
	 * @class
	 * Provides an object that owns content resources, tracks their changes and loads and destroys the content built
	 * from the content resources.
	 *
	 * @param {string} [sId] ID for the new ContentConnector object. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new ContentConnector object.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Element
	 * @alias sap.ui.vk.ContentConnector
	 */
	var ContentConnector = Element.extend("sap.ui.vk.ContentConnector", /** @lends sap.ui.vk.ContentConnector.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			aggregations: {
				/**
				 * Content resources to load and display.
				 */
				contentResources: {
					type: "sap.ui.vk.ContentResource",
					bindable: "bindable"
				},

				/**
				 * View state managers.
				 */
				viewStateManagers: {
					type: "sap.ui.vk.ViewStateManagerBase"
				},

				/**
				 * Default view state manager.
				 *
				 * The default view state manager is used when no explicit view state manager is
				 * assigned to objects that require a view state manager.
				 * @private
				 */
				defaultViewStateManager: {
					type: "sap.ui.vk.ViewStateManagerBase",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * Content managers.
				 * @private
				 */
				contentManagers: {
					type: "sap.ui.vk.ContentManager",
					visibility: "hidden"
				}
			},

			defaultAggregation: "contentResources",

			events: {
				/**
				 * This event will be fired when content resource changes are about to be processed.
				 */
				contentChangesStarted: {
					parameters: {
					}
				},

				/**
				 * This event will be fired when any content resource or the contentResources aggregation has been changed and processed.
				 */
				contentChangesFinished: {
					parameters: {
						/**
						 * The content created or updated.
						 *
						 * The content can be of type HTMLImageElement, sap.ui.vk.Scene etc.
						 */
						content: {
							type: "any"
						},

						/**
						 * The failure reason if any.<br>
						 * An single element or an array of elements with the following structure:
						 * <ul>
						 *   <li>error - An object with details of the error.
						 *   <li>contentResource - A {@link sap.ui.vk.ContentResource sap.ui.vk.ContentResource} object when it is possible to
						 *       match the Error object to a {@link sap.ui.vk.ContentResource sap.ui.vk.ContentResource} object.
						 * </ul>
						 */
						failureReason: {
							type: "any"
						}
					}
				},

				/**
				 * This event will be fired to report the progress of content changes.
				 */
				contentChangesProgress: {
					parameters: {
						/**
						 * The name of the loading phase. It can be e.g. 'downloading', 'building the scene' etc.
						 * It might be null if reporting this parameter does not make sense.
						 */
						phase: {
							type: "string"
						},

						/**
						 * The overall percentage of the loading process.
						 */
						percentage: {
							type: "float"
						},

						/**
						 * The content resource currently being loaded. It might be null if reporting this parameter does not make sense.
						 */
						source: {
							type: "any"
						}
					}
				},

				/**
				 * This event will be fired when content loading is finished.
				 */
				contentLoadingFinished: {
					parameters: {
						source: {
							type: "any"
						},
						node: {
							type: "any"
						}
					}
				},

				/**
				 * This event will be fired when the current content is completely rebuilt or destroyed
				 * as a result of changes in content resources.
				 */
				contentReplaced: {
					parameters: {
						/**
						 * New content.
						 *
						 * The content can be of type HTMLImageElement, sap.ui.vk.Scene etc.
						 */
						newContent: {
							type: "any"
						},

						/**
						 * Old content.
						 *
						 * The content can be of type HTMLImageElement, sap.ui.vk.Scene etc.
						 */
						oldContent: {
							type: "any"
						}
					}
				},

				/**
				 * This event will be fired when the current content is about to be destroyed.
				 */
				contentDestroying: {
					parameters: {
						/**
						 * The content to be destroyed.
						 *
						 * The content can be of type HTMLImageElement, sap.ui.vk.Scene etc.
						 */
						content: {
							type: "any"
						},

						/**
						 * Returns a <code>function(prevent: boolean)</code> with one boolean parameter.
						 * To prevent garbage collection after the content is destroyed call this function
						 * passing <code>true</code> as a parameter.
						 */
						preventGarbageCollection: {
							type: "function"
						}
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			// Set to true when the content is being loaded. The flag is used to prevent attempts to load additional
			// content during the loading process.
			this._inLoading = false;

			// Set to true if there was a request to update content resources when the previous update has not finished
			// yet.
			this._delayContentResourcesUpdate = false;

			// The timer used to schedule content resources updates.
			this._scheduleContentResourcesUpdateTimerId = null;

			// The current content.
			this._content = null;

			// The current content manager.
			this._contentManager = null;

			this._decryptionHandler = null;
			this._authorizationHandler = null;
			this._retryCount = 1;

			// NB: call the base constructor here so that `_selfObserver` could react on initial assignment of
			// aggregations.
			basePrototype.constructor.apply(this, arguments);

			vkCore.observeLifetime(this);
		}
	});

	ContentConnector.prototype.isTreeBinding = function(name) {
		return name === "contentResources";
	};

	ContentConnector.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}
		// NB: this observer has to be created in the `init` method as it requires ID to be assigned but must be called
		// before `applySettings`. The `init` method` is exactly the right place.
		this._selfObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
		this._selfObserver.observe(this, { aggregations: ["contentResources", "viewStateManagers"] });
	};

	ContentConnector.prototype.destroy = function() {
		ContentConnector._cleanAssociatedLoaders();
		this._selfObserver.disconnect();
		this._selfObserver = null;

		// Cancel the delayed call if any.
		if (this._scheduleContentResourcesUpdateTimerId) {
			clearTimeout(this._scheduleContentResourcesUpdateTimerId);
			this._scheduleContentResourcesUpdateTimerId = null;
		}

		// Do not schedule new updates when the previous one finishes.
		this._delayContentResourcesUpdate = false;

		this._setContent(null, null);
		// Content managers in the contentManagers aggregation will be destroyed automatically.

		basePrototype.destroy.call(this);
	};

	ContentConnector.prototype._observeChanges = function(change) {
		if (change.name === "contentResources") {
			this._scheduleContentResourcesUpdate();
		} else if (change.name === "viewStateManagers") {
			if (change.mutation === "insert") {
				change.child.setContentConnector(this);
			} else if (change.mutation === "remove") {
				change.child.setContentConnector(null);
			}
		}
	};

	////////////////////////////////////////////////////////////////////////////
	// BEGIN: handle content resources

	ContentConnector.prototype.invalidate = function(origin) {
		if (origin instanceof ContentResource) {
			this._scheduleContentResourcesUpdate();
			return;
		}
		basePrototype.invalidate.apply(this, arguments);
	};

	/*
	 * Schedules an update of the content resource hierarchy.
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining.
	 * @private
	 */
	ContentConnector.prototype._scheduleContentResourcesUpdate = function() {
		if (this._inLoading) {
			// Postpone content update until the current process has finished.
			this._delayContentResourcesUpdate = true;
			return this;
		}

		if (!this._scheduleContentResourcesUpdateTimerId) {
			this._scheduleContentResourcesUpdateTimerId = setTimeout(function() {
				// The delayed call is invoked once. Reset the ID to indicate that there is no pending delayed call.
				this._scheduleContentResourcesUpdateTimerId = null;

				var contentResources = this.getContentResources();

				if (contentResources.length > 0) {
					this._collectContentResourceSourceTypeInformation(contentResources).then(function(info) {
						if (info.dimensions.length > 1) {
							setTimeout(function() {
								this.fireContentChangesStarted();
								this._setContent(null, null);
								this.fireContentChangesFinished({
									content: null,
									failureReason: {
										errorMessage: getResourceBundle().getText(Messages.VIT17.cause)
									}
								});
								Log.error(getResourceBundle().getText(Messages.VIT17.summary), Messages.VIT17.code, "sap.ui.vk.ContentConnector");
							}.bind(this), 0);
						} else if (info.contentManagerClassNames.length > 1) {
							setTimeout(function() {
								this.fireContentChangesStarted();
								this._setContent(null, null);
								this.fireContentChangesFinished({
									content: null,
									failureReason: {
										errorMessage: getResourceBundle().getText(Messages.VIT35.cause)
									}
								});
								Log.error(getResourceBundle().getText(Messages.VIT35.summary), Messages.VIT35.code, "sap.ui.vk.ContentConnector");
							}.bind(this), 0);
						} else if (info.contentManagerClassNames.length === 0) {
							setTimeout(function() {
								this.fireContentChangesStarted();
								this._setContent(null, null);
								// Unsupported file format throws error VIEWER_UNKNOWN_CONTENT_RESOURCE_TYPE_CAUSE = VIT36.
								this.fireContentChangesFinished({
									content: null,
									failureReason: {
										errorMessage: getResourceBundle().getText(Messages.VIT36.cause)
									}
								});
								Log.error(getResourceBundle().getText(Messages.VIT36.summary), Messages.VIT36.code, "sap.ui.vk.ContentConnector");
							}.bind(this), 0);
						} else if (info.contentManagerClassNames.length === 1) {
							var that = this;
							this._getContentManagerByClassName(info.contentManagerClassNames[0]).then(
								function(contentManager) {
									if (that._contentManager && contentManager !== that._contentManager) {
										that.fireContentChangesStarted();
										that._setContent(null, null);
										that.fireContentChangesFinished({
											content: null
										});
									}
									contentManager.loadContent(that._content, contentResources);
								}
							);
						}
					}.bind(this));
				} else {
					setTimeout(function() {
						this.fireContentChangesStarted();
						this._setContent(null, null);
						this.fireContentChangesFinished({
							content: null
						});
					}.bind(this), 0);
				}
			}.bind(this), 0);
		}
		return this;
	};

	// END: handle content resources
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// BEGIN: handle content loading

	ContentConnector.prototype._handleContentChangesStarted = function(event) {
		this._inLoading = true;
		this.fireContentChangesStarted();
	};

	ContentConnector.prototype._handleContentChangesFinished = function(event) {
		var content = event.getParameter("content");
		this._setContent(content, event.getSource());
		this.fireContentChangesFinished({
			content: content,
			failureReason: event.getParameter("failureReason")
		});
		this._inLoading = false;
		if (this._delayContentResourcesUpdate) {
			this._delayContentResourcesUpdate = false;
			this._scheduleContentResourcesUpdate();
		}
	};

	ContentConnector.prototype._handleContentChangesProgress = function(event) {
		this.fireContentChangesProgress({
			phase: event.getParameter("phase"),
			source: event.getParameter("source"),
			percentage: event.getParameter("percentage")
		});
	};

	ContentConnector.prototype._handleContentLoadingFinished = function(event) {
		this.fireContentLoadingFinished({
			source: event.getParameter("source"),
			node: event.getParameter("node")
		});
	};

	// END: handle content loading
	////////////////////////////////////////////////////////////////////////////

	/**
	 * Gets or creates a content manager object based on its class name.
	 * @param {string} className The name of the content manager class.
	 * @returns {Promise} The Promise that resolves to a content manager object that implements the {@link sap.ui.vk.ContentManager sap.ui.vk.ContentManager} interface.
	 * @private
	 * @since 1.50.0
	 */
	ContentConnector.prototype._getContentManagerByClassName = function(className) {
		var contentManager;
		var contentManagers = this.getAggregation("contentManagers", []);
		// Find an existing content manager.
		for (var i = 0, count = contentManagers.length; i < count; ++i) {
			contentManager = contentManagers[i];
			if (contentManager.getMetadata().getName() === className) {
				return Promise.resolve(contentManager);
			}
		}
		var that = this;
		// Create a new content manager.
		return new Promise(function(resolve, reject) {
			sap.ui.require([
				className.replace(/\./g, "/")
			], function(Class) {
				var contentManager = new Class();
				that.addAggregation("contentManagers", contentManager);
				contentManager.attachContentChangesStarted(that._handleContentChangesStarted, that);
				contentManager.attachContentChangesFinished(that._handleContentChangesFinished, that);
				contentManager.attachContentChangesProgress(that._handleContentChangesProgress, that);
				contentManager.attachContentLoadingFinished(that._handleContentLoadingFinished, that);
				that._assignDecryptionHandler([contentManager]);
				that._assignAuthorizationHandler([contentManager]);
				that._assignRetryCount([contentManager]);
				resolve(contentManager);
			});
		});
	};

	/**
	 * Gets the content currently loaded.
	 *
	 * @returns {any} The content loaded. It can be HTMLImageElement, sap.ui.vk.Scene etc.
	 * @public
	 * @since 1.50.0
	 */
	ContentConnector.prototype.getContent = function() {
		return this._content;
	};

	/**
	 * Gets the content manager used to load the current content.
	 *
	 * @returns {sap.ui.vk.ContentManager} The content manager used to load the current content.
	 * @public
	 * @since 1.50.0
	 */
	ContentConnector.prototype.getContentManager = function() {
		return this._contentManager;
	};

	/**
	 * Gets the default view state manager.
	 *
	 * The type of the default view state manager depends on the type of the currently loaded content.
	 *
	 * @returns {sap.ui.vk.ViewStateManagerBase|null} The default view state manager or <code>null</code>.
	 * @public
	 * @since 1.99.0
	 */
	ContentConnector.prototype.getDefaultViewStateManager = function() {
		return this.getAggregation("defaultViewStateManager");
	};

	ContentConnector.prototype._assignDecryptionHandler = function(contentManagers) {
		for (var i = 0; i < contentManagers.length; i++) {
			contentManagers[i].setDecryptionHandler(this._decryptionHandler);
		}
	};

	ContentConnector.prototype._assignAuthorizationHandler = function(contentManagers) {
		for (var i = 0; i < contentManagers.length; i++) {
			contentManagers[i].setAuthorizationHandler(this._authorizationHandler);
		}
	};

	ContentConnector.prototype._assignRetryCount = function(contentManagers) {
		for (var i = 0; i < contentManagers.length; i++) {
			contentManagers[i].setRetryCount(this._retryCount);
		}
	};

	/**
	 * Sets an object that decrypts content of encrypted models.
	 *
	 * @param {sap.ui.vk.DecryptionHandler} handler An object that decrypts content of encrypted models.
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining.
	 * @public
	 * @since 1.60.0
	 */
	ContentConnector.prototype.setDecryptionHandler = function(handler) {
		this._decryptionHandler = handler;
		this._assignDecryptionHandler(this.getAggregation("contentManagers", []));
		return this;
	};

	/**
	 * Sets a callback function which will be used to obtain authorization token when connected to remote server.
	 *
	 * @param {sap.ui.vk.AuthorizationHandler} handler An application defined callback function that can provide authorization token.
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining.
	 * @public
	 * @since 1.60.0
	 */
	ContentConnector.prototype.setAuthorizationHandler = function(handler) {
		this._authorizationHandler = handler;
		this._assignAuthorizationHandler(this.getAggregation("contentManagers", []));
		return this;
	};

	/**
	 * Sets the maximum number of retry attempts for a download operation if the initial request to retrieve a model
	 * from a remote server could not be fulfilled and the error with which the request failed is considered recoverable.
	 *
	 * <h3>Retry Mechanism</h3>
	 * Requests to retrieve (download) a model from a remote server may not always be fulfilled. If the request failed
	 * with an error that is considered recoverable then the <i>download manager</i> will keep on trying issuing new
	 * requests until the request is fulfilled or the specified <code>retryCount</code> is exceeded.
	 *
	 * The default number of retry attempts is 1, unless specified otherwise by calling this method.
	 * Note that, specifying 0 as <code>retryCount</code> disables the retry mechanism altogether.
	 *
	 * <b>Timing of retry attempts</b>: There is no delay between subsequent attempts.
	 *
	 * <b>Events fired</b>: The <i>download manager</i> will not fire any events between subsequent attempts.
	 * For each requested item there will be a single <code>itemSucceeded</code> or <code>itemFailed</code> event fired
	 * when the download operation for that given item finishes.
	 *
	 * <b>Recoverable errors</b>: The following errors are considered recoverable:
	 * <ul>
	 *   <li>Any kind of network error (e.g. due to temporary network outage). HTTP status code is expected to be 0.</li>
	 *   <li>Responses with the following 4xx-5xx HTTP status codes:
	 *     <ul>
	 *       <li>408: Request Timeout</li>
	 *       <li>425: Too Early (RFC 8470)</li>
	 *       <li>429: Too Many Requests (RFC 6585)</li>
	 *       <li>500: Internal Server Error</li>
	 *       <li>502: Bad Gateway</li>
	 *       <li>503: Service Unavailable</li>
	 *       <li>504: Gateway Timeout</li>
	 *     </ul>
	 *   </li>
	 * </ul>
	 *
	 *
	 * @param {int} retryCount Maximum number of retry attempts. Value must be non-negative.
	 * 				The default retry count is 1, unless specified otherwise by calling this method and passing in the
	 *              desired value. Passing in 0 disables any retry attempts.
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining.
	 * @public
	 * @since 1.95.0
	 */
	ContentConnector.prototype.setRetryCount = function(retryCount) {
		this._retryCount = Math.max(retryCount, 0);
		this._assignRetryCount(this.getAggregation("contentManagers", []));
		return this;
	};

	/**
	 * Sets the new content.
	 *
	 * @param {any}                          newContent        The new content. It can be HTMLImageElement, sap.ui.vk.Scene etc.
	 * @param {sap.ui.vk.ContentManagerBase} newContentManager The content manager to handle the new content.
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining.
	 * @private
	 */
	ContentConnector.prototype._setContent = function(newContent, newContentManager) {
		var oldContent = this._content;
		var oldContentManager = this._contentManager;

		if (oldContent !== newContent) {
			this._content = newContent;
			this._contentManager = newContentManager;

			this.destroyAggregation("defaultViewStateManager");

			if (newContentManager) {
				var newContentManagerClassName = newContentManager.getMetadata().getName();
				var newDefaultViewStateManagerClassName;
				if (newContentManagerClassName === "sap.ui.vk.threejs.ContentManager") {
					newDefaultViewStateManagerClassName = "sap.ui.vk.threejs.ViewStateManager";
				} else if (newContentManagerClassName === "sap.ui.vk.dvl.ContentManager") {
					newDefaultViewStateManagerClassName = "sap.ui.vk.dvl.ViewStateManager";
				} else if (newContentManagerClassName === "sap.ui.vk.svg.ContentManager") {
					newDefaultViewStateManagerClassName = "sap.ui.vk.svg.ViewStateManager";
				}
				if (newDefaultViewStateManagerClassName) {
					// The ViewStateManager implementation classes from the `dvl`, `threejs` and `svg` namespaces are
					// loaded by the corresponding content managers, so there is no need to load them here. We can
					// safely assume that they are available at this point.
					var Class = ObjectPath.get(newDefaultViewStateManagerClassName);
					var newDefaultViewStateManager = new Class(this.getId() + "-defaultviewstatemanager", { contentConnector: this });
					this.setAggregation("defaultViewStateManager", newDefaultViewStateManager);
				}
			}

			this.fireContentReplaced({
				oldContent: oldContent,
				newContent: newContent
			});

			if (oldContent) {
				var preventGC = false;
				// Should it be called before contentReplaced?
				this.fireContentDestroying({
					content: oldContent,
					preventGarbageCollection: function(value) {
						preventGC = value;
					}
				});
				oldContentManager.destroyContent(oldContent);
				if (!preventGC) {
					oldContentManager.collectGarbage();
				}
			}
		}

		return this;
	};

	var resolvers = [
		{
			pattern: /(^threejs[:.])|(^(threejs|stream|vds4)$)/,
			dimension: 3,
			contentManagerClassName: "sap.ui.vk.threejs.ContentManager"
		},
		{
			pattern: /^vdsl?$/,
			dimension: 3,
			contentManagerClassName: "sap.ui.vk.dvl.ContentManager"
		},
		{
			pattern: /^(png|jpg|jpeg|gif|bmp|tiff?|svg)$/,
			dimension: 2,
			contentManagerClassName: "sap.ui.vk.ImageContentManager"
		},
		{
			pattern: /^(stream2d|vds4-2d)$/,
			dimension: 2,
			contentManagerClassName: "sap.ui.vk.svg.ContentManager"
		}
	];

	/**
	 * Gets content manager class name, dimension and settings associated with the content resource.
	 *
	 * @param {sap.ui.vk.ContentResource} contentResource The content resource to test.
	 * @returns {Promise} {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise Promise} that
	 *     resolves with a value with the following structure:
	 *     <pre>
	 *         dimension:           int
	 *         contentManagerClass: string,
	 *         settings:            object
	 *     </pre>
	 * @private
	 */
	var resolveContentManager = function(contentResource) {
		return new Promise(function(resolve, reject) {
			var entries = resolvers.slice();
			var test = function(index) {
				if (index >= entries.length) {
					reject();
					return;
				}
				var resolver = entries[index];
				(function() {

					var sourceType = contentResource.getSourceType();
					if (sourceType) {
						sourceType = sourceType.toLowerCase();
					}

					if (typeof resolver === "function") {
						return resolver(contentResource);
					} else if (typeof resolver.pattern === "string") {
						var patternLowerCase = resolver.pattern.toLowerCase();
						if (patternLowerCase === sourceType) {
							return Promise.resolve(resolver);
						}
					} else if (resolver.pattern instanceof RegExp) {

						if (resolver.pattern.test(sourceType)) {
							return Promise.resolve(resolver);
						}
					}
					// Skip to the next resolver.
					return Promise.reject();
				})().then(
					function(value) { // onFulfilled
						resolve({
							dimension: value.dimension,
							contentManagerClassName: value.contentManagerClassName,
							settings: value.settings
						});
					},
					function() {      // onRejected
						test(index + 1);
					}
				);
			};
			test(0);
		});
	};

	/**
	 * Adds a new content manager resolver.
	 *
	 * The last added resolver will be executed the first.
	 *
	 * Content manager resolver analyzes the content resource definition and returns the type of the content manager to use for loading
	 * the content resource.
	 *
	 * The simplest resolver tests the content resource source type. The test can be either a string comparison or a regular expression.
	 *
	 * A more sophisticated resolver is a function that can use the full content resource definition to find a proper content manager dynamically,
	 * e.g. the resolver can use the 'HEAD' HTTP request to get the 'Content-Type' header to find out the type of the content resource.
	 *
	 * @example <caption>Add a new content manager resolver based on string comparison of the sourceType property of the content resource.</caption>
	 * sap.ui.vk.ContentConnector.addContentManagerResolver({
	 *     pattern: "vds",
	 *     dimension: 3,
	 *     contentManagerClassName: "sap.ui.vk.dvl.ContentManager"
	 * });
	 *
	 * @example <caption>Add a new content manager resolver based on regular expression test of the sourceType property of the content resource.</caption>
	 * sap.ui.vk.ContentConnector.addContentManagerResolver({
	 *     pattern: /^(png|jpg|jpeg|gif|bmp|tiff?|svg)$/,
	 *     dimension: 2,
	 *     contentManagerClassName: "sap.ui.vk.ImageContentManager"
	 * });
	 *
	 * @example <caption>Add a new content manager resolver that makes a 'HEAD' HTTP request and checks the Content-Type header.</caption>
	 * var loadCollada = function(parentNode, contentResource) {
	 *     return new Promise(function(resolve, reject) {
	 *         sap.ui.require(["sap/ui/vk/threejs/thirdparty/ColladaLoader"], function(ColladaLoader) {
	 *             new THREE.ColladaLoader().load(contentResource.getSource(),
	 *                 function(collada) { // onload
	 *                     parentNode.add(collada.scene);
	 *                     resolve({
	 *                         node: parentNode,
	 *                         contentResource: contentResource
	 *                     });
	 *                 },
	 *                 null,   // onprogress
	 *                 reject  // onfail
	 *             );
	 *         });
	 *     });
	 * };
	 *
	 * var resolveContentManager = function(contentResource) {
	 *     if (sap.ui.core.URI.isValid(contentResource.getSource())) {
	 *         return new Promise(function(resolve, reject) {
	 *             var xhr = new XMLHttpRequest();
	 *             xhr.onerror = function(event) {
	 *                 reject();
	 *             };
	 *             xhr.onload = function(event) {
	 *                 if (xhr.status === 200 && xhr.getResponseHeader("Content-Type") === "model/vnd.collada+xml") {
	 *                     resolve({
	 *                         dimension: 3,
	 *                         contentManagerClassName: "sap.ui.vk.threejs.ContentManager",
	 *                         settings: {
	 *                             loader: loadCollada
	 *                         }
	 *                     });
	 *                 } else {
	 *                     reject();
	 *                 }
	 *             };
	 *             xhr.open("HEAD", contentResource.getSource(), true);
	 *             xhr.send(null);
	 *         });
	 *     } else {
	 *         return Promise.reject();
	 *     }
	 * };
	 *
	 * sap.ui.vk.ContentConnector.addContentManagerResolver(resolveContentManager);
	 *
	 * @example <caption>Add a new content manager resolver to load content resources with three.js objects.</caption>
	 * var loadThreeJSObject = function(parentNode, contentResource) {
	 *     parentNode.add(contentResource.getSource());
	 *     return Promise.resolve({
	 *         node: parentNode,
	 *         contentResource: contentResource
	 *     });
	 * };
	 *
	 * var resolveThreeJSContentResource = function(contentResource) {
	 *     if (contentResource.getSource() instanceof THREE.Object3D) {
	 *         return Promise.resolve({
	 *             dimension: 3,
	 *             contentManagerClassName: "sap.ui.vk.threejs.ContentManager",
	 *             settings: {
	 *                 loader: loadThreeJSObject
	 *             }
	 *         });
	 *     } else {
	 *         return Promise.reject();
	 *     }
	 * };
	 *
	 * ContentConnector.addContentManagerResolver(resolveThreeJSContentResource);
	 *
	 * var torusGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
	 * var torus = new THREE.Object3D()
	 *     .add(new THREE.LineSegments(
	 *         torusGeometry,
	 *         new THREE.LineBasicMaterial({
	 *             color: 0xffffff,
	 *             transparent: true,
	 *             opacity: 0.5
	 *         })
	 *     ))
	 *     .add(new THREE.Mesh(
	 *         torusGeometry,
	 *         new THREE.MeshPhongMaterial({
	 *             color: 0x156289,
	 *             emissive: 0x072534,
	 *             side: THREE.DoubleSide,
	 *             flatShading: true
	 *         })
	 *     ));
	 *
	 * contentConnector.addContentResource(
	 *     new ContentResource({
	 *         source: torus,
	 *         sourceId: "abc",
	 *         name: "Torus"
	 *     })
	 * );
	 *
	 * @param {function|object} resolver Object that defines how to find out the content manager class name.<br>
	 *     If <code>resolver</code> is a function then this function takes one parameter of type {@link sap.ui.vk.ContentResource sap.ui.vk.ContentResource}
	 *     and returns a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise Promise} that resolves with
	 *     an object with the following properties:
	 *     <ul>
	 *       <li><code>dimension: int</code> - dimension of the model. E.g. 2 or 3.</li>
	 *       <li><code>contentManagerClassName: string</code> - name of content manager class to use for loading the content resource.</li>
	 *       <li><code>settings: object</code> - optional settings specific to the content manager.<br>
	 *           See {@link sap.ui.vk.threejs.ContentManager sap.ui.vk.threejs.ContentManager}.</li>
	 *     </ul>
	 *     If <code>resolver</code> is an object then it has the following properties:
	 * @param {string|RegExp} [resolver.pattern] The pattern the {@link sap.ui.vk.ContentResource#getSourceType sourceType} property
	 *     of the content resource is compared with.
	 * @param {int} [resolver.dimension] Dimension of models of this source type. E.g. 2 or 3.<br/>
	 * @param {string} [resolver.contentManagerClassName] Name of the content manager class to use for loading content resources of this type.
	 *     E.g. sap.ui.vk.dvl.ContentManager, sap.ui.vk.threejs.ContentManager, sap.ui.vk.ImageContentManager.
	 * @param {object} [resolver.settings] Optional settings specific to the content manager class.
	 * @returns {function} The {@link sap.ui.vk.ContentConnector sap.ui.vk.ContentConnector} class to allow method chaining.
	 * @public
	 * @static
	 * @since 1.50.0
	 */
	ContentConnector.addContentManagerResolver = function(resolver) {
		if (typeof resolver === "function") {
			resolvers.unshift(resolver);
		} else {
			resolvers.unshift({
				pattern: resolver.pattern,
				dimension: resolver.dimension,
				contentManagerClassName: resolver.contentManagerClassName,
				settings: resolver.settings
			});
		}
		return this;
	};

	/**
	 * Removes all content manager resolvers.
	 *
	 * @returns {function} The {@link sap.ui.vk.ContentConnector sap.ui.vk.ContentConnector} class to allow method chaining.
	 * @public
	 * @static
	 * @since 1.50.0
	 */
	ContentConnector.removeAllContentManagerResolvers = function() {
		resolvers = [];
		return this;
	};

	/**
	 * Removes a content manager resolver.
	 *
	 * If there are more than one content manager resolver matching the <code>resolver</code> the last added is removed.
	 *
	 * @param {function|string|RegExp|object} resolver Object that defines how to find out the content manager class name.
	 * @returns {boolean} <code>true</code> if a matching resolver is found and removed, <code>false</code> otherwise.
	 * @public
	 * @static
	 * @since 1.50.0
	 */
	ContentConnector.removeContentManagerResolver = function(resolver) {
		var isFunction = typeof resolver === "function",
			isString = typeof resolver === "string",
			isRegExp = resolver instanceof RegExp,
			isObject = (typeof resolver === "object") && !isRegExp;

		for (var i = 0, count = resolvers.length; i < count; ++i) {
			if (isFunction && resolvers[i] === resolver) {
				resolvers.splice(i, 1);
				return true;
			} else if (typeof resolvers[i] === "object") {
				if (isObject) {
					if (resolver.pattern && resolvers[i].pattern === resolver.pattern) {
						resolvers.splice(i, 1);
						return true;
					}
				} else if (isRegExp) {
					if (resolvers[i].pattern.source === resolver.source) {
						resolvers.splice(i, 1);
						return true;
					}
				} else if (isString) {
					if (resolvers[i].pattern instanceof RegExp) {
						if (resolvers[i].pattern.source === resolver) {
							resolvers.splice(i, 1);
							return true;
						}
					} else if (resolvers[i].pattern === resolver) {
						resolvers.splice(i, 1);
						return true;
					}
				}
			}
		}
		return false;
	};

	ContentConnector._cleanAssociatedLoaders = function() {
		for (var i = 0, count = resolvers.length; i < count; ++i) {
			var res = resolvers[i];
			if (res.settings && res.settings.loader && res.settings.loader.exit) {
				res.settings.loader.exit();
			}
		}
	};

	/**
	 * Collects information about content resource types.
	 *
	 * Content resources can be 2D and 3D models. Depending of content type different rendering technologies
	 * should be used, e.g. DVL, ThreeJS or native browser capabilities, e.g. for raster 2D files.
	 *
	 * This method has a side effect - it assigns content manager resolvers to the content resources.
	 *
	 * @param {sap.ui.vk.ContentResource[]} contentResources The array of content resources.
	 * @returns {Promise} Promise that resolves with a value with the following format:
	 * <pre>
	 *   {
	 *     noSourceTypes: boolean,                 // true if some of the content resources have no source types.
	 *     unknownSourceTypes: boolean,            // true if some of the content resources have unknown source types.
	 *     dimensions: [int, ...],                 // a list of distinct dimensions of the content resources.
	 *     contentManagerClassNames: [string, ...] // a list of distinct content manager class names.
	 *   }
	 * </pre>
	 * @private
	 * @since 1.50.0
	 */
	ContentConnector.prototype._collectContentResourceSourceTypeInformation = function(contentResources) {
		var noSourceTypes = false;
		var unknownSourceTypes = false;
		var dimensions = {};
		var contentManagerClassNames = {};
		var flatList = [];

		contentResources.forEach(function flatten(contentResource) {
			flatList.push(contentResource);
			contentResource.getContentResources().forEach(flatten);
		});

		return Promise
			.all(
				flatList.map(
					function(contentResource) {
						return resolveContentManager(contentResource)
							.then(
								function(resolver) { // onFulfilled
									dimensions[resolver.dimension] = true;
									contentManagerClassNames[resolver.contentManagerClassName] = true;
									return resolver;
								},
								function() { // onRejected
									if (contentResource.getSourceType()) {
										unknownSourceTypes = true;
									} else {
										noSourceTypes = true;
									}
									return false;
								}
							);
					}
				)
			)
			.then(function(results) {
				for (var i = 0, count = flatList.length; i < count; ++i) {
					if (results[i]) {
						// Assign the resolver to the content resource.
						// It might be used by those content managers that support additional settings.
						flatList[i]._contentManagerResolver = results[i];
					}
				}
				return {
					noSourceTypes: noSourceTypes,
					unknownSourceTypes: unknownSourceTypes,
					dimensions: Object.getOwnPropertyNames(dimensions).sort(),
					contentManagerClassNames: Object.getOwnPropertyNames(contentManagerClassNames)
				};
			});
	};

	/**
	 * @interface Contract for authorization callback function
	 *
	 * A callback function which can be implemented by an application to provide an authorization token. Such a function
	 * receives a single parameter which is a connection URL and must return a promise which will be resolved to
	 * {@link https://www.oauth.com/oauth2-servers/access-tokens/access-token-response/ Access Token Response} when
	 * authorization token is obtained.
	 *
	 * <h2>A sample implementation of authorization handler:</h2>
	 * <pre>
	 * ...
	 * var viewer = new sap.ui.vk.Viewer();
	 * viewer.setAuthorizationHandler(function(url) {
	 *     var headers = new Headers();
	 *     headers.append("Content-Type", "application/x-www-form-urlencoded");
	 *     headers.append("Authorization", "Basic " + basicAuth);
	 *
	 *     return fetch(accessTokenUrl, {
	 *             method: "POST",
	 *             body: "grant_type=client_credentials",
	 *             headers: headers
	 *         }).then(response => response.json())
	 * });
	 * ...
	 * </pre>
	 *
	 * @name sap.ui.vk.AuthorizationHandler
	 * @since 1.60.0
	 * @public
	 */

	/**
	 * @interface Contract for objects that implement decryption.
	 *
	 * An interface for an object provided by an application to decrypt content of encrypted models.
	 *
	 * Content is encrypted with the {@link https://en.wikipedia.org/wiki/Advanced_Encryption_Standard AES128} algorithm
	 * in the {@link https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_.28CBC.29 CBC} mode.
	 *
	 * A key is derived with the {@link https://en.wikipedia.org/wiki/PBKDF2 PBKDF2} algorithm by applying the
	 * {@link https://en.wikipedia.org/wiki/Hash-based_message_authentication_code HMAC}-{@link https://en.wikipedia.org/wiki/SHA-2 SHA256}
	 * function 10,000 times.
	 *
	 * <h2>A sample implementation and usage of the sap.ui.vk.DecryptionHandler interface with the {@link https://cdnjs.cloudflare.com/ajax/libs/asmCrypto/0.16.4/asmcrypto.js asmCrypto} library:</h2>
	 * <pre>
	 * ...
	 * &lt;script src="https://cdnjs.cloudflare.com/ajax/libs/asmCrypto/0.16.4/asmcrypto.js"&gt;&lt;/script&gt;
	 * ...
	 * var decryptionHandler = {
	 *     deriveKey: function(salt, password) {
	 *         try {
	 *             return asmCrypto.PBKDF2_HMAC_SHA256.bytes(password, salt, 10000, 16);
	 *         } catch (ex) {
	 *             return null;
	 *         }
	 *     },
	 *     decrypt: function(key, iv, input) {
	 *         try {
	 *             return asmCrypto.AES_CBC.decrypt(input, key, true, iv);
	 *         } catch (ex) {
	 *             return null;
	 *         }
	 *     }
	 * };
	 * ...
	 * var viewer = new sap.ui.vk.Viewer();
	 * viewer.setDecryptionHandler(decryptionHandler);
	 * var contentResource = new sap.ui.vk.ContentResource({
	 *     source: "http://my-web-server.com/my-encrypted-model.vds",
	 *     sourceType: "vds",
	 *     sourceId: "abc",
	 *     password: "abracadabra"
	 * });
	 * viewer.addContentResource(contentResource);
	 * </pre>
	 *
	 * @name sap.ui.vk.DecryptionHandler
	 * @since 1.38.0
	 * @public
	 */

	/**
	 * Generates a cryptographic session key derived from a base data value.
	 *
	 * The key must be derived with the {@link https://en.wikipedia.org/wiki/PBKDF2 PBKDF2} algorithm by applying the
	 * {@link https://en.wikipedia.org/wiki/Hash-based_message_authentication_code HMAC}-{@link https://en.wikipedia.org/wiki/SHA-2 SHA256}
	 * function 10,000 times.
	 *
	 * The resulting 128-bit key should be passed to subsequent calls to {@link sap.ui.vk.DecryptionHandler#decrypt sap.ui.vk.DecryptionHandler.decrypt}.
	 *
	 * @name sap.ui.vk.DecryptionHandler.prototype.deriveKey
	 * @function
	 * @param {Uint8Array} salt Random data that is used as an additional input to a one-way function that "hashes" a password or passphrase.
	 * @param {Uint8Array} password A password used for encryption/decryption.
	 * @return {object} A derived 128-bit key that should be passed to subsequent calls to {@link sap.ui.vk.DecryptionHandler#decrypt sap.ui.vk.DecryptionHandler.decrypt}.
	 * @public
	 */

	/**
	 * Decrypts the input buffer with the {@link https://en.wikipedia.org/wiki/Advanced_Encryption_Standard AES128} algorithm
	 * in the {@link https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_.28CBC.29 CBC} mode.
	 *
	 * @name sap.ui.vk.DecryptionHandler.prototype.decrypt
	 * @function
	 * @param {object} key The derived key generated by the previous call to {@link sap.ui.vk.DecryptionHandler#deriveKey sap.ui.vk.DecryptionHandler.deriveKey}.
	 * @param {Uint8Array} iv The 128-bit {@link https://en.wikipedia.org/wiki/Initialization_vector initialization vector}.
	 * @param {Uint8Array} encryptedData The encrypted buffer.
	 * @return {Uint8Array} The decrypted buffer.
	 * @public
	 */

	return ContentConnector;
});
