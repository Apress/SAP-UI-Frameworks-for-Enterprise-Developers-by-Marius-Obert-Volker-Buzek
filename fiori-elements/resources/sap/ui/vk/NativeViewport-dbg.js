/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Viewport.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/ResizeHandler",
	"./Core",
	"./Loco",
	"./ViewportBase",
	"./ViewportHandler",
	"./Messages",
	"./NativeViewportRenderer",
	"./getResourceBundle",
	"sap/base/util/uid",
	"sap/base/Log"
], function(
	vkLibrary,
	Control,
	ResizeHandler,
	vkCore,
	Loco,
	ViewportBase,
	ViewportHandler,
	Messages,
	NativeViewportRenderer,
	getResourceBundle,
	uid,
	Log
) {
	"use strict";

	/**
	 * Constructor for a new NativeViewport.
	 *
	 * @param {string} [sId] ID for the new Native Viewport control, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new Native Viewport control.
	 * @class Enables loading, pan, zoom and overlay capabilities for a subset of file formats capable of being loaded into a browser natively.
	 *
	 * <pre>
	 * viewer.loadContent(&quot;https://www.google.co.nz/images/srpr/logo11w.png&quot;, &quot;png&quot;, true);
	 * </pre>
	 *
	 * @extends sap.ui.vk.ViewportBase
	 * @author SAP SE
	 * @version 1.113.0
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.NativeViewport
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.32.0
	 */
	var NativeViewport = ViewportBase.extend("sap.ui.vk.NativeViewport", /** @lends sap.ui.vk.NativeViewport.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Limit the ability to zoom out. If enabled the zoom out stops if the image size reaches 25% of the full view (best fit).
				 */
				limitZoomOut: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				}
			},
			events: {
				/**
				 * Raised when the display size of the image in the Native Viewport changes.
				 *
				 * @param {object} [oldSize] The starting size of the image.
				 * @param {object} [size] The final size of the image after the <code>resize</code> event.
				 */
				"resize": {
					parameters: {
						oldSize: "object",
						size: "object"
					}
				},
				/**
				 * Raised when the display position or magnification of the image in the Native Viewport changes.
				 *
				 * @param {object} [pan] The change in distance along the x, y-coordinates.
				 * @param {float} [zoom] The change in zoom factor.
				 */
				"move": {
					parameters: {
						pan: "object",
						zoom: "float"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Control.apply(this, arguments);

			this._canvas = null;
			this._canvas = document.createElement("div");
			// When we are doing the position calculations, we always assume this element is adding children
			// to its left, which is not the case in RTL mode. This is why we are setting the alignment to be "left".
			this._canvas.style.textAlign = "left";

			this._canvas.id = uid();

			this._resizeListenerId = null;

			this._viewportHandler = new ViewportHandler(this);
			this._loco = new Loco(this);
			this._loco.addHandler(this._viewportHandler, -1);

			this._reset();

			this._svgid = this.getId() + "-svg";

			vkCore.observeAssociations(this);
		}
	});

	NativeViewport.prototype.init = function() {
		// NativeViewport has transparent background by default
		this.setBackgroundColorTop("transparent");
		this.setBackgroundColorBottom("transparent");
	};

	NativeViewport.prototype.destroy = function() {
		this._loco.removeHandler(this._viewportHandler);
		this._viewportHandler.destroy();

		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}

		Control.prototype.destroy.call(this);
	};

	NativeViewport.prototype.onBeforeRendering = function() {
		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}
	};

	NativeViewport.prototype.onAfterRendering = function() {
		if (this._canvas) {
			var domRef = this.getDomRef();
			if (domRef.childNodes.length > 0) {
				domRef.insertBefore(this._canvas, domRef.childNodes[0]);
			} else {
				domRef.appendChild(this._canvas);
			}
			this._resizeListenerId = ResizeHandler.register(this, this._handleResize.bind(this));

			this._handleResize({
				size: {
					width: domRef.clientWidth,
					height: domRef.clientHeight
				}
			});
		}
	};

	NativeViewport.prototype.setShouldRenderFrame = function() {
		this.invalidate();
	};

	/**
	 * @param {object} event Event broadcast by the {sap.ui.core.ResizeHandler}
	 * @private
	 */
	NativeViewport.prototype._handleResize = function(event) {
		this.fireResize({
			oldSize: event.oldSize,
			size: event.size
		});

		if (this._s === 0 || this._svgError) {
			this.zoomTo();
		} else {
			this._update();
		}
	};

	/**
	 * @private
	 */
	NativeViewport.prototype._reset = function() {
		this._img = null;
		this._svg = null;
		this._svgError = null;
		this._imageW = 0;
		this._imageH = 0;
		this._bestFitScale = 0;
		this._s = 0;
		this._x = 0;
		this._y = 0;
		this._gx = 0;
		this._gy = 0;

		this._canvas.style.visibility = "hidden";  // hide the viewport content

		// remove previous content if it exists
		while (this._canvas.lastChild) {
			this._canvas.removeChild(this._canvas.lastChild);
		}
	};

	/**
	 * @private
	 */
	NativeViewport.prototype._update = function() {
		var image = this._svgError || this._img || this._svg;
		if (image) {
			var x = this._x - (this._imageW - this._canvas.clientWidth) / 2;
			var y = this._y - (this._imageH - this._canvas.clientHeight) / 2;
			var transform = "matrix(" + this._s + ",0,0," + this._s + "," + x + "," + y + ")";

			image.style.transform = transform;
			image.style.webkitTransform = transform;
			image.style.msTransform = transform;
			image.style.MozTransform = transform;
			image.style.OTransform = transform;
		}
	};

	/**
	 * Zooms the viewport to fit to the content bounds
	 * @return {sap.ui.vk.NativeViewport} this
	 * @public
	 */
	NativeViewport.prototype.zoomTo = function() {
		if (this._isRedlineActivated && !this._redlineHandler) {
			Log.info("zoomTo() method is disabled when Redlining is activated");
			return this;
		}
		if (this._svgError) {// error svg
			this._imageW = 550; // error image width;
			this._imageH = 512; // error image height
		} else if (this._svg) {// svg
			this._svg.width = 1024; // otherwise the svg size will depend on the viewport width
			this._imageW = this._svg.clientWidth;
			this._imageH = this._svg.clientHeight;
		} else if (this._img) {// image
			this._imageW = this._img.width;
			this._imageH = this._img.height;
		} else {
			return this;
		}
		if (!this._imageW || !this._imageH || !this._canvas.clientWidth || !this._canvas.clientHeight) {
			return this;
		}

		// Zoom to best fit
		var scale = Math.min(this._canvas.clientWidth / this._imageW, this._canvas.clientHeight / this._imageH);

		if (this._redlineHandler) {
			this._redlineHandler.pan(-this._x, -this._y);
			this._redlineHandler.zoom(scale / this._s, this._canvas.clientWidth * 0.5, this._canvas.clientHeight * 0.5);
		}

		this._bestFitScale = scale; // saving the scale used for best fit for zoom out limit
		this._s = scale;
		this._x = 0;
		this._y = 0;
		this._update();

		this._canvas.style.visibility = "visible"; // show the viewport content
		return this;
	};

	/**
	 * Loads a image URL into Viewport.
	 *
	 * @param {string} url - The URL of the resource.
	 * @param {function} onload - onload callback, called when the resource is loaded successfully.
	 * @param {function} onerror - onerror callback, called when an error occurs during the loading process.
	 * @param {function} onprogress - onprogress callback, called during the loading process.
	 * @param {array} resourceType - an array of type of resources to load.
	 * @return {sap.ui.vk.NativeViewport} this
	 * @public
	 * @deprecated Since version 1.50.0.
	 */
	NativeViewport.prototype.loadUrl = function(url, onload, onerror, onprogress, resourceType) {

		if (/^(svg)$/.test(resourceType.toLowerCase())) {
			this._reset();

			this._svg = document.createElement("object");
			this._svg.setAttribute("type", "image/svg+xml");
			this._svg.setAttribute("data", url);
			this._svg.setAttribute("id", this._svgid);
			this._svg.setAttribute("class", "SVGImage");
			this._svg.setAttribute("width", 1024);
			this._canvas.appendChild(this._svg);

			// we need to add a cover element to disable the context menu over the svg on Safari!
			var svgCover = document.createElement("div");
			svgCover.style.position = "absolute";
			svgCover.style.top = 0;
			svgCover.style.left = 0;
			svgCover.style.height = "100%";
			svgCover.style.width = "100%";
			this._canvas.appendChild(svgCover);

			this._svg.onload = function() {
				this._svg.onload = null; // svg.onload method may be called several times
				setTimeout(function() {
					this.zoomTo();
					if (onload) {
						onload();
					}
				}.bind(this), 0);
			}.bind(this);

			this._svg.onerror = function() {
				Log.error(getResourceBundle().getText(Messages.VIT1.summary), Messages.VIT1.code, "sap.ui.vk.NativeViewport");
				this._reset();
				if (onerror) {
					onerror();
				}
			}.bind(this);

			this._svg.src = url;

			return this;

		} else if (/^(jpg|jpeg|png|gif|bmp|tif|tiff)$/.test(resourceType.toLowerCase())) {
			// pdf rendering
			// http://mozilla.github.io/pdf.js/web/viewer.html
			// http://stackoverflow.com/questions/15341010/render-pdf-to-single-canvas-using-pdf-js-and-imagedata
			// https://github.com/mozilla/pdf.js
			this._reset();

			this._img = new Image();
			this._img.draggable = false;
			this._img.onload = function() {
				setTimeout(function() {
					this.zoomTo();
					this._canvas.appendChild(this._img);
					if (onload) {
						onload();
					}
				}.bind(this), 0);
			}.bind(this);

			this._img.onerror = function() {
				Log.error(getResourceBundle().getText(Messages.VIT2.summary), Messages.VIT2.code, "sap.ui.vk.NativeViewport");
				if (onerror) {
					onerror();
				}
			};

			this._img.src = url;

			return this;

		} else {
			Log.error(getResourceBundle().getText(Messages.VIT3.summary), Messages.VIT3.code, "sap.ui.vk.NativeViewport");
			if (onerror) {
				onerror();
			}
		}
	};

	NativeViewport.prototype.loadFailed = function(textContent) {

		this._reset();

		// We need the svg to be in a div container because SVGs
		// do not handle the offset properties properly.
		// These properties will be deprecated by the browser vendors.
		this._svgError = document.createElement("div");
		this._svgError.className = "svgErrorContainer";

		var svgNamespaceURI = "http://www.w3.org/2000/svg";

		this._svgErrorElement = document.createElementNS(svgNamespaceURI, "svg");
		this._svgErrorElement.setAttribute("width", "550px");
		this._svgErrorElement.setAttribute("height", "512px");
		this._svgErrorElement.setAttribute("viewBox", "-244 -244 512 512");
		this._svgErrorElement.setAttribute("enable-background", "new -244 -244 512 512");
		this._svgErrorElement.setAttribute("id", "SVGError");

		var rect = document.createElementNS(svgNamespaceURI, "rect");
		rect.setAttribute("fill", "#FFFFFF");
		rect.setAttribute("x", "-244");
		rect.setAttribute("y", "-244");
		rect.setAttribute("width", "512");
		rect.setAttribute("height", "512");
		rect.setAttribute("opacity", "0.1");
		this._svgErrorElement.appendChild(rect);

		var pathCircle = document.createElementNS(svgNamespaceURI, "path");
		pathCircle.setAttribute("fill", "#474747");
		pathCircle.setAttribute("d", "M12.833,89.742c-70.781,0-128.366-57.584-128.366-128.366c0-70.781,57.584-128.365,128.366-128.365 s128.365,57.584,128.365,128.365C141.198,32.158,83.614,89.742,12.833,89.742z M12.833-146.989 c-59.753,0-108.366,48.612-108.366,108.365c0,59.752,48.613,108.366,108.366,108.366S121.198,21.129 121.198-38.624 C121.198-98.376,72.586-146.989,12.833-146.989z");
		pathCircle.setAttribute("opacity", "0.3");
		this._svgErrorElement.appendChild(pathCircle);

		var rectExclamation = document.createElementNS(svgNamespaceURI, "rect");
		rectExclamation.setAttribute("fill", "#474747");
		rectExclamation.setAttribute("x", "-2.167");
		rectExclamation.setAttribute("y", "-120.847");
		rectExclamation.setAttribute("width", "30");
		rectExclamation.setAttribute("height", "119.447");
		rectExclamation.setAttribute("fill", "#474747");
		rectExclamation.setAttribute("opacity", "0.3");
		this._svgErrorElement.appendChild(rectExclamation);

		var rectExclamationCircle = document.createElementNS(svgNamespaceURI, "rect");
		rectExclamationCircle.setAttribute("fill", "#474747");
		rectExclamationCircle.setAttribute("x", "-2.167");
		rectExclamationCircle.setAttribute("y", "13.6");
		rectExclamationCircle.setAttribute("width", "30");
		rectExclamationCircle.setAttribute("height", "30");
		rectExclamationCircle.setAttribute("opacity", "0.3");
		this._svgErrorElement.appendChild(rectExclamationCircle);

		var pathCircleOverlay = document.createElementNS(svgNamespaceURI, "path");
		pathCircleOverlay.setAttribute("fill", "#474747");
		pathCircleOverlay.setAttribute("d", "M10.833,87.33c-70.781,0-128.366-57.584-128.366-128.365c0-70.781,57.584-128.365,128.366-128.365 s128.365,57.584,128.365,128.365C139.198,29.746,81.614,87.33,10.833,87.33z M10.833-149.4 c-59.753,0-108.366,48.612-108.366,108.365S-48.92,67.33,10.833,67.33S119.198,18.718,119.198-41.035S70.586-149.4,10.833-149.4z");
		this._svgErrorElement.appendChild(pathCircleOverlay);

		var rectExclamationOverlay = document.createElementNS(svgNamespaceURI, "rect");
		rectExclamationOverlay.setAttribute("fill", "#474747");
		rectExclamationOverlay.setAttribute("x", "-4.167");
		rectExclamationOverlay.setAttribute("y", "-123.259");
		rectExclamationOverlay.setAttribute("width", "30");
		rectExclamationOverlay.setAttribute("height", "119.447");
		rectExclamationOverlay.setAttribute("fill", "#474747");
		this._svgErrorElement.appendChild(rectExclamationOverlay);

		var rectExclamationCircleOverlay = document.createElementNS(svgNamespaceURI, "rect");
		rectExclamationCircleOverlay.setAttribute("fill", "#474747");
		rectExclamationCircleOverlay.setAttribute("x", "-4.167");
		rectExclamationCircleOverlay.setAttribute("y", "11.188");
		rectExclamationCircleOverlay.setAttribute("width", "30");
		rectExclamationCircleOverlay.setAttribute("height", "30");
		rectExclamationCircleOverlay.setAttribute("fill", "#474747");
		this._svgErrorElement.appendChild(rectExclamationCircleOverlay);

		var textOverlay = document.createElementNS(svgNamespaceURI, "text");
		textOverlay.setAttribute("id", "textError");
		textOverlay.setAttribute("left", "auto");
		textOverlay.setAttribute("right", "auto");
		textOverlay.setAttribute("y", "150");
		textOverlay.setAttribute("x", "10");
		textOverlay.setAttribute("display", "block");
		textOverlay.setAttribute("text-anchor", "middle");
		textOverlay.setAttribute("fill", "#474747");
		textOverlay.style.fontFamily = "Arial";
		textOverlay.setAttribute("font-size", "32");
		textOverlay.textContent = textContent ? textContent : getResourceBundle().getText("VIEWPORT_MESSAGEUNSUPPORTEDFILEFORMAT");
		this._svgErrorElement.appendChild(textOverlay);

		this._svgError.appendChild(this._svgErrorElement);

		this.zoomTo();

		this._canvas.appendChild(this._svgError);

		return this;
	};

	/**
	 * Marks the start of the current gesture operation.
	 *
	 * @param {int} x - x-coordinate in screen space.
	 * @param {int} y - y-coordinate in screen space.
	 * @return {sap.ui.vk.NativeViewport} this
	 * @public
	 */
	NativeViewport.prototype.beginGesture = function(x, y) {
		this._gx = (x - this._canvas.clientWidth / 2 - this._x) / this._s;
		this._gy = (y - this._canvas.clientHeight / 2 - this._y) / this._s;
		return this;
	};

	/**
	 * Marks the end of the current gesture operation.
	 *
	 * @return {sap.ui.vk.NativeViewport} this
	 * @public
	 */
	NativeViewport.prototype.endGesture = function() {
		this._gx = 0;
		this._gy = 0;
		return this;
	};

	/**
	 * Performs a <code>pan</code> gesture to pan across the Viewport.
	 *
	 * @param {int} dx - The change in distance along the x-coordinate.
	 * @param {int} dy - The change in distance along the y-coordinate.
	 * @return {sap.ui.vk.NativeViewport} this
	 * @public
	 */
	NativeViewport.prototype.pan = function(dx, dy) {
		if (this._svgError) {
			return this;
		}

		if (this._redlineHandler) {
			this._redlineHandler.pan(dx, dy);
		}

		this._x += dx;
		this._y += dy;
		this._update();
		this.fireMove({
			pan: {
				x: dx,
				y: dy
			},
			zoom: 1.0
		});

		return this;
	};

	/**
	 * Rotates the content of the Viewport.
	 *
	 * @param {int} dx - The change in x-coordinate used to define the desired rotation.
	 * @param {int} dy - The change in y-coordinate used to define the desired rotation.
	 * @return {sap.ui.vk.NativeViewport} this
	 * @public
	 */
	NativeViewport.prototype.rotate = function(dx, dy) {
		return this.pan(dx, dy);
	};

	NativeViewport.prototype._getZoomInLimit = function() {
		return 500;
	};

	NativeViewport.prototype._getZoomOutLimit = function() {
		return (this.getLimitZoomOut()) ? this._bestFitScale * 0.25 : 0.0001;
	};

	NativeViewport.prototype._getZoomFactor = function() {
		return this._s;
	};

	/**
	 * Performs a <code>zoom</code> gesture to zoom in or out on the beginGesture coordinate.
	 *
	 * @param {float} z - Zoom factor. A scale factor that specifies how much to zoom in or out by.
	 * @return {sap.ui.vk.NativeViewport} this
	 * @public
	 */
	NativeViewport.prototype.zoom = function(z) {
		if (this._svgError) {
			return this;
		}

		// Canvas zooming: http://stackoverflow.com/questions/3420975/html5-canvas-zooming
		var gxo = this._gx * this._s;
		var gyo = this._gy * this._s;

		// limit zoom out to a quarter of best fit if limiting is active
		var oldScale = this._s;
		this._s = Math.min(Math.max(this._s * z, this._getZoomOutLimit()), this._getZoomInLimit());
		z = this._s / oldScale;

		if (this._redlineHandler) {
			this._redlineHandler.zoom(z);
		}

		var gxn = this._gx * this._s;
		var gyn = this._gy * this._s;
		var dx = gxo - gxn;
		var dy = gyo - gyn;

		this._x += dx;
		this._y += dy;
		this._update();
		this.fireMove({
			pan: {
				x: dx,
				y: dy
			},
			zoom: z
		});

		return this;
	};

	/**
	 * Executes a click or tap gesture.
	 *
	 * @param {int} x - The tap gesture's x-coordinate.
	 * @param {int} y - The tap gesture's y-coordinate.
	 * @param {boolean} isDoubleClick - Indicates whether the tap gesture should be interpreted as a double-click. A value of <code>true</code>
	 *        indicates a double-click gesture, and <code>false</code> indicates a single click gesture.
	 * @return {sap.ui.vk.NativeViewport} this
	 * @public
	 */
	NativeViewport.prototype.tap = function(x, y, isDoubleClick) {
		if (isDoubleClick) {
			this.zoomTo();
		}
		return this;
	};

	/**
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command - The function to be executed.
	 * @return {sap.ui.vk.NativeViewport} this
	 * @public
	 */
	NativeViewport.prototype.queueCommand = function(command) {
		command();
		return this;
	};

	/**
	 * Gets information about the Viewport's attributes; for example, camera.
	 *
	 * @return {object} ViewInfo object.
	 * @public
	 */
	NativeViewport.prototype.getViewInfo = function() {
		var viewInfo = {};
		viewInfo.camera = [
			this._s, 0, 0, this._s, this._x, this._y
		];

		return viewInfo;
	};

	/**
	 * Sets information about the Viewport's attributes; for example, camera.
	 *
	 * @param {object} viewInfo - ViewInfo object.
	 * @return {sap.ui.vk.NativeViewport} this
	 * @public
	 */
	NativeViewport.prototype.setViewInfo = function(viewInfo) {
		if (this._svgError) {
			return this;
		}

		var cam = viewInfo.camera;

		this._s = cam[0];
		this._x = cam[4];
		this._y = cam[5];

		this._update();

		return this;
	};

	/**
	 * It retrieves information about the current virtual native viewport.
	 * The information can used for making calculations when restoring Redlining elements.
	 * @returns {object} outputSize The information in this object:
	 <ul>
		<li><b>left</b> - The x coordinate of the top-left corner of the virtual native viewport</li>
		<li><b>top</b> - The y coordinate of the top-left corner of the virtual native viewport</li>
		<li><b>sideLength</b> - The side length of the virtual native viewport</li>
	 </ul>
	 * @public
	 */
	NativeViewport.prototype.getOutputSize = function() {
		var boundingClientRect = this.getDomRef().getBoundingClientRect();
		// x and y coordinates are showing the position of the top-left
		// corner of the virtual viewport within the NativeViewport.
		// Because the getViewInfo method considers the center of the viewport (0,0),
		// we have to divide the width and height by 2 and add the current x (or y) position.
		return {
			left: boundingClientRect.width / 2,
			top: boundingClientRect.height / 2,
			sideLength: 1024
		};
	};

	////////////////////////////////////////////////////////////////////////
	// Content connector handling begins.

	NativeViewport.prototype.onSetContentConnector = function(contentConnector) {
		contentConnector.attachContentReplaced(this._onContentReplaced, this);
		this._setImage(contentConnector.getContent());
	};

	NativeViewport.prototype.onUnsetContentConnector = function(contentConnector) {
		this._setImage(null);
		contentConnector.detachContentReplaced(this._onContentReplaced, this);
	};

	NativeViewport.prototype._onContentReplaced = function(event) {
		this._setImage(event.getParameter("newContent"));
	};

	/**
	 * Sets an image obtained as content from the associated content connector.
	 *
	 * @param {HTMLImageElement} image New content or <code>null</code>.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	NativeViewport.prototype._setImage = function(image) {
		this._reset();

		if (image instanceof HTMLObjectElement) {
			this._svg = image;
			image.setAttribute("id", this._svgid);

			image.onload = function() {
				image.onload = null; // svg.onload method may be called several times
				// we need a timeout after svg.onload to get the correct svg size in Safari!
				setTimeout(function() {
					this.zoomTo();
				}.bind(this), 0);
			}.bind(this);

			if (sap.ui.Device.browser.msie || sap.ui.Device.browser.edge) {
				// the svg.onload method is not called in IE/Edge!
				setTimeout(function() {
					this.zoomTo();
				}.bind(this), 0);
			}

			this._canvas.appendChild(image);

			// we need to add a cover element to disable the context menu over the svg on Safari!
			var svgCover = document.createElement("div");
			svgCover.style.position = "absolute";
			svgCover.style.top = 0;
			svgCover.style.left = 0;
			svgCover.style.height = "100%";
			svgCover.style.width = "100%";
			this._canvas.appendChild(svgCover);

		} else if (image instanceof HTMLImageElement) {
			this._img = image;
			image.draggable = false; // by default the image is draggable
			setTimeout(function() {
				this.zoomTo();
				this._canvas.appendChild(image);
			}.bind(this), 0);
		}

		return this;
	};

	// Content connector handling ends.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Keyboard handling begins.

	var rotateDelta = 2;
	var panDelta = 2;

	[
		{ key: "left", dx: -panDelta, dy: 0 },
		{ key: "right", dx: +panDelta, dy: 0 },
		{ key: "up", dx: 0, dy: -panDelta },
		{ key: "down", dx: 0, dy: +panDelta }
	].forEach(function(item) {
		NativeViewport.prototype["onsap" + item.key] = function(event) {
			this.beginGesture(this.$().width() / 2, this.$().height() / 2);
			this.pan(item.dx, item.dy);
			this.endGesture();
			event.preventDefault();
			event.stopPropagation();
		};
	});

	[
		{ key: "left", dx: -rotateDelta, dy: 0 },
		{ key: "right", dx: +rotateDelta, dy: 0 },
		{ key: "up", dx: 0, dy: -rotateDelta },
		{ key: "down", dx: 0, dy: +rotateDelta }
	].forEach(function(item) {
		NativeViewport.prototype["onsap" + item.key + "modifiers"] = function(event) {
			if (event.shiftKey && !(event.ctrlKey || event.altKey || event.metaKey)) {
				this.beginGesture(this.$().width() / 2, this.$().height() / 2);
				this.rotate(item.dx, item.dy);
				this.endGesture();
				event.preventDefault();
				event.stopPropagation();
			}
		};
	});

	[
		{ key: "minus", d: 0.98 },
		{ key: "plus", d: 1.02 }
	].forEach(function(item) {
		NativeViewport.prototype["onsap" + item.key] = function(event) {
			this.beginGesture(this.$().width() / 2, this.$().height() / 2);
			this.zoom(item.d);
			this.endGesture();
			event.preventDefault();
			event.stopPropagation();
		};
	});

	// Keyboard handling ends.
	////////////////////////////////////////////////////////////////////////

	/**
	 * @private
	 */
	NativeViewport.prototype._activateRedline = function() {
		this._isRedlineActivated = true;
	};

	/**
	 * @private
	 */
	NativeViewport.prototype._deactivateRedline = function() {
		this._isRedlineActivated = false;
	};

	return NativeViewport;

});
