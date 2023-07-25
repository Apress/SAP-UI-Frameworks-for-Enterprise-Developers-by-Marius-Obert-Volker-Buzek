/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.ContentManager.
sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(
	ManagedObject
) {
	"use strict";

	/**
	 * Constructor for a new ContentManager.
	 *
	 * @class
	 * Provides a base loader interface.
	 *
	 * To load content a concrete loader class is to be used.
	 *
	 * @param {string} [sId] ID for the new ContentManager object. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new ContentManager object.
	 * @protected
	 * @abstract
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.ContentManager
	 * @since 1.50.0
	 */
	var ContentManager = ManagedObject.extend("sap.ui.vk.ContentManager", /** @lends sap.ui.vk.ContentManager.prototype */ {
		metadata: {
			"abstract": true,

			library: "sap.ui.vk",

			events: {
				/**
				 * This event will be fired when content resources are about to be loaded.
				 */
				contentChangesStarted: {
					parameters: {
					}
				},

				/**
				 * This event will be fired when content resources have been loaded successfully or with a failure.
				 */
				contentChangesFinished: {
					parameters: {
						/**
						 * The content created or updated.
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
						 *       match <code>error</code> to a {@link sap.ui.vk.ContentResource sap.ui.vk.ContentResource} object.
						 * </ul>
						 */
						failureReason: {
							type: "object"
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
				}
			}
		}
	});

	var basePrototype = ContentManager.getMetadata().getParent().getClass().prototype;

	ContentManager.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._decryptionHandler = null;
		this._authorizationHandler = null;
		this._retryCount = 1;
	};

	/**
	 * Starts downloading and building or updating the content from the content resources.
	 *
	 * This method is asynchronous.
	 *
	 * @function
	 * @name sap.ui.vk.ContentManager#loadContent
	 * @param {any}                         content          The current content to update. It can be <code>null</code> if this is an initial loading call.
	 * @param {sap.ui.vk.ContentResource[]} contentResources The content resources to load or update.
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining.
	 * @public
	 * @abstract
	 * @since 1.50.0
	 */

	/**
	 * Destroys the content.
	 *
	 * @param {any} content The content to destroy.
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining.
	 * @public
	 * @since 1.50.0
	 */
	ContentManager.prototype.destroyContent = function(content) {
		return this;
	};

	/**
	 * Collects and destroys unused objects and resources.
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining.
	 * @public
	 * @since 1.50.0
	 */
	ContentManager.prototype.collectGarbage = function() {
		return this;
	};

	/**
	 * Creates a Perspective camera
	 *
	 * @returns {sap.ui.vk.OrthographicCamera} Created Camera.
	 * @public
	 * @since 1.52.0
	 */
	ContentManager.prototype.createOrthographicCamera = function() {
		return null;
	};

	/**
	 * Creates a Orthographic camera
	 *
	 * @returns {sap.ui.vk.PerspectiveCamera} Created Camera.
	 * @public
	 * @since 1.52.0
	 */
	ContentManager.prototype.createPerspectiveCamera = function() {
		return null;
	};

	/**
	 * Destroys a camera for the content type
	 *
	 * @param {any} camera The camera to destroy.
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining.
	 * @public
	 * @since 1.52.0
	 */
	ContentManager.prototype.destroyCamera = function(camera) {
		return this;
	};

	/**
	 * Set application defined decryption handler object which will be used to decrypt encrypted files
	 *
	 * @param {sap.ui.vk.DecryptionHandler} handler The decryption handler.
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining.
	 * @private
	 * @since 1.60.0
	 */
	ContentManager.prototype.setDecryptionHandler = function(handler) {
		this._decryptionHandler = handler;
		return this;
	};

	/**
	 * Set application defined authorization callback function which will be used to obtain authorization token
	 * This can be used when content manager is connecting to secure remote server
	 *
	 * @param {sap.ui.vk.AuthorizationHandler} handler The authorization callback function.
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining.
	 * @private
	 * @since 1.60.0
	 */
	ContentManager.prototype.setAuthorizationHandler = function(handler) {
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
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining.
	 * @public
	 * @since 1.95.0
	 */
	ContentManager.prototype.setRetryCount = function(retryCount) {
		this._retryCount = Math.max(retryCount, 0);
		return this;
	};

	return ContentManager;
});
