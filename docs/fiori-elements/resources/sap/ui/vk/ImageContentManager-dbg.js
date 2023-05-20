/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.ImageContentManager.
sap.ui.define([
	"./Messages",
	"./ContentManager",
	"./getResourceBundle"
], function(
	Messages,
	ContentManagerBase,
	getResourceBundle
) {
	"use strict";

	/**
	 * Constructor for a new ImageContentManager.
	 *
	 * @class
	 * Provides a loader that loads a 2D raster or vector image into an HTMLImageElement or HTMLObjectElement object.
	 *
	 * @param {string} [sId] ID for the new ImageContentManager object. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new ImageContentManager object.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.ContentManager
	 * @alias sap.ui.vk.ImageContentManager
	 * @since 1.50.0
	 */
	var ImageContentManager = ContentManagerBase.extend("sap.ui.vk.ImageContentManager", /** @lends sap.ui.vk.ImageContentManager.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = ImageContentManager.getMetadata().getParent().getClass().prototype;

	ImageContentManager.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._handleLoadSucceededProxy = this._handleLoadSucceeded.bind(this);
		this._handleLoadFailedProxy    = this._handleLoadFailed.bind(this);
		// NB: We do not have a listener for the "progress" event as it is not implemented for the HTMLImageElement interface.
		// See http://blogs.adobe.com/webplatform/2012/07/10/image-progress-event-progress/.
	};

	ImageContentManager.prototype.exit = function() {
		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}
	};

	ImageContentManager.prototype.loadContent = function(content, contentResources) {
		if (contentResources.length !== 1) {
			setTimeout(function() {
				this.fireContentChangesStarted();
				this.fireContentChangesFinished({
					content: null,
					failureReason: {
						errorMessage: getResourceBundle().getText("IMAGECONTENTMANAGER_ONLY_LOAD_SINGLE_IMAGE")
					}
				});
			}.bind(this), 0);
		} else if (contentResources[0].getContentResources().length > 0) {
			setTimeout(function() {
				this.fireContentChangesStarted();
				this.fireContentChangesFinished({
					content: null,
					failureReason: {
						errorMessage: getResourceBundle().getText("IMAGECONTENTMANAGER_CANNOT_LOAD_IMAGE_HIERARCHY")
					}
				});
			}.bind(this), 0);
		} else {
			var contentResource = contentResources[0],
			    source = contentResource.getSource(),
				sourceType = contentResource.getSourceType(),
				loader = null;

			if (contentResource._contentManagerResolver
				&& contentResource._contentManagerResolver.settings
				&& contentResource._contentManagerResolver.settings.loader) {
					loader = contentResource._contentManagerResolver.settings.loader;
				}

			if (source instanceof File) {
				var fileReader = new FileReader();
				fileReader.onload = function(event) {
					this._loadImageFromUrl(content, fileReader.result, sourceType, loader);
				}.bind(this);
				fileReader.readAsDataURL(source);
			} else {
				// The setSrc() method from sap.m.Image can be overridden by Fiori framework
				// which then modifies the URL to point to correct location
				// If we are in Fiori app then we will give it a chance to perform this correction
				// Otherwise we will not be able to load image as URL is not correct
				var tmpImg = new sap.m.Image({ src: source });
				source = tmpImg.getSrc();
				tmpImg.destroy();

				this._loadImageFromUrl(content, source, sourceType, loader);
			}
		}
	};

	ImageContentManager.prototype._addEventListeners = function(htmlElement) {
		htmlElement.addEventListener("load", this._handleLoadSucceededProxy);
		htmlElement.addEventListener("error", this._handleLoadFailedProxy);
	};

	ImageContentManager.prototype._removeEventListeners = function(htmlElement) {
		htmlElement.removeEventListener("error", this._handleLoadFailedProxy);
		htmlElement.removeEventListener("load", this._handleLoadSucceededProxy);
	};

	// NB: without adding the SVG element to the document downloading does not start.
	// Also we need to set some style properties to hide the svg element while downloading.
	// This properties will be removed when downloading finishes.
	ImageContentManager.prototype._addSvgQuirks = function(htmlElement) {
		htmlElement.style.setProperty("visibility", "collapse");
		htmlElement.style.setProperty("width", "0");
		htmlElement.style.setProperty("height", "0");
		htmlElement.style.setProperty("position", "absolute");
		document.body.appendChild(htmlElement);
		return this;
	};

	ImageContentManager.prototype._removeSvgQuirks = function(htmlElement) {
		htmlElement.parentElement.removeChild(htmlElement);
		htmlElement.style.removeProperty("visibility");
		htmlElement.style.removeProperty("width");
		htmlElement.style.removeProperty("height");
		htmlElement.style.removeProperty("position");
		return this;
	};

	ImageContentManager.prototype._loadImageFromUrl = function(content, url, sourceType, loader) {
		this.fireContentChangesStarted();
		switch (sourceType.toLowerCase()) {
			case "svg":
				var svg = document.createElement("object");
				this._addEventListeners(svg);
				svg.type = "image/svg+xml";
				svg.data = url;
				svg.className = "SVGImage";
				this._addSvgQuirks(svg);
				break;
			case "jpg":
			case "jpeg":
			case "png":
			case "gif":
			case "bmp":
			case "tif":
			case "tiff":
				var image = document.createElement("img");
				this._addEventListeners(image);
				if (loader) {
					var that = this;
					loader(url).then(
						function(result) {
							image.src = result;
						},
						function(error) {
							that.fireContentChangesFinished({
								content: null,
								failureReason: {
									errorMessage: error
								}
							});
						}
					);
				} else {
					image.src = url;
				}
				break;
			default:
				setTimeout(function() {
					this.fireContentChangesFinished({
						content: null,
						failureReason: {
							errorMessage: getResourceBundle().getText("IMAGECONTENTMANAGER_UNSUPPORTED_IMAGE_TYPE"),
							sourcesFailedToDownload: [
								{
									source: url
								}
							]
						}
					});
				}.bind(this), 0);
				break;
		}
	};

	ImageContentManager.prototype._handleLoadSucceeded = function(event) {
		var content = event.target;
		/* if (content instanceof HTMLObjectElement) {
			try {
				// NB: when HTMLObjectElement fails to load the content it does not fire 'error' event like HTMLImageElement,
				// so we check if it contains an SVG document.
				// If the document is not loaded then getSVGDocument() returns null.
				// If the document is loaded then getSVGDocument() returns a valid object, but in case of a cross-origin request
				// the call to getSVGDocument() throws an exception.
				if (!content.getSVGDocument()) {
					this._handleLoadFailed(event);
					return;
				}
			} catch (e) {
				// When getSVGDocument() fails then the document is from another domain. But the document is loaded.
			}
		}*/
		this._removeEventListeners(content);
		if (content instanceof HTMLObjectElement) {
			this._removeSvgQuirks(content);
		}
		this.fireContentChangesFinished({
			content: content
		});
	};

	ImageContentManager.prototype._handleLoadFailed = function(event) {
		var content = event.target;
		this._removeEventListeners(content);
		if (content instanceof HTMLObjectElement) {
			this._removeSvgQuirks(content);
		}
		// If resource has supported type but file doesn't exist throws error "Failed to load the image".
		this.fireContentChangesFinished({
			content: null,
			failureReason: {
				errorMessage: getResourceBundle().getText("IMAGECONTENTMANAGER_IMAGE_LOAD_FAILED"),
				sourcesFailedToDownload: [
					{
						source: content instanceof HTMLImageElement ? content.src : content.data
					}
				]
			}
		});
	};

	return ImageContentManager;
});
