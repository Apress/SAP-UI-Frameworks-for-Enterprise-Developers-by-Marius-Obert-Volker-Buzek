/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
// Provides control sap.ui.vk.RedlineSurface.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"./Loco",
	"./RedlineGesturesHandler",
	"./RedlineSurfaceRenderer",
	"./Redline",
	"sap/base/Log"
],
	function(
		vkLibrary,
		Control,
		Loco,
		RedlineGesturesHandler,
		RedlineSurfaceRenderer,
		Redline,
		Log
	) {
		"use strict";

		/**
		 *  Constructor for a new RedlineSurface.
		 *
		 * @class Provides a bass class control for redlining.
		 *
		 * @public
		 * @author SAP SE
		 * @version 1.113.0
		 * @extends sap.ui.core.Control
		 * @alias sap.ui.vk.RedlineSurface
		 * @since 1.40.0
		 */
		var RedlineSurface = Control.extend("sap.ui.vk.RedlineSurface", /** @lends sap.ui.vk.RedlineDesign.prototype */ {
			metadata: {
				library: "sap.ui.vk",
				aggregations: {
					redlineElements: {
						type: "sap.ui.vk.RedlineElement"
					}
				},
				properties: {
					virtualLeft: {
						type: "float"
					},
					virtualTop: {
						type: "float"
					},
					virtualSideLength: {
						type: "float"
					},
					/*
					 * Panning ratio is applied to deltaX and deltaY when broadcasting pan events
					 */
					panningRatio: {
						type: "float",
						defaultValue: 1
					}
				},
				events: {
					pan: {
						parameters: {
							deltaX: "float",
							deltaY: "float"
						}
					},
					zoom: {
						parameters: {
							originX: "float",
							originY: "float",
							zoomFactor: "float"
						}
					}
				}
			}
		});

		RedlineSurface.prototype.init = function() {

		};

		RedlineSurface.prototype.onAfterRendering = function() {

		};

		/**
		 * Exports all the current redline elements as an array of JSON objects.
		 * @returns {object[]} An array of JSON objects.
		 * @public
		 */
		RedlineSurface.prototype.exportJSON = function() {
			return this.getRedlineElements().map(function(element) {
				return element.exportJSON();
			});
		};

		/**
		 * Iterates through all JSON objects from the array passed as parameter, and creates and restores
		 * the redline elements serialized in the array.
		 * @param {object[]} jsonElements An array of serialized redline elements.
		 * @returns {this} <code>this</code> to allow method chaining.
		 * @public
		 */
		RedlineSurface.prototype.importJSON = function(jsonElements) {
			if (!jQuery.isArray(jsonElements)) {
				jsonElements = [jsonElements];
			}

			jsonElements.forEach(function(json) {
				var ElementClass;
				switch (json.type) {
					case Redline.ElementType.Rectangle:
						ElementClass = sap.ui.vk.RedlineElementRectangle;
						break;
					case Redline.ElementType.Ellipse:
						ElementClass = sap.ui.vk.RedlineElementEllipse;
						break;
					case Redline.ElementType.Freehand:
						ElementClass = sap.ui.vk.RedlineElementFreehand;
						break;
					case Redline.ElementType.Line:
						ElementClass = sap.ui.vk.RedlineElementLine;
						break;
					case Redline.ElementType.Text:
						ElementClass = sap.ui.vk.RedlineElementText;
						break;
					default:
						Log.warning("Unsupported JSON element type " + json.type);
				}
				if (ElementClass != null) {
					this.addRedlineElement(new ElementClass().importJSON(json));
				}
			}.bind(this));
			return this;
		};

		/**
		 * Translates one or two values from the absolute pixel space to the relative values
		 * calculated in relation to the virtual viewport.
		 * @param {number} x A value in pixels.
		 * @param {number?} y A value in pixels.
		 * @returns {number | object} A relative value, or object containing two properties.
		 * @private
		 */
		RedlineSurface.prototype._toVirtualSpace = function(x, y) {
			if (arguments.length === 1) {
				return x / this.getVirtualSideLength();
			} else {
				return {
					x: (x - this.getVirtualLeft()) / this.getVirtualSideLength(),
					y: (y - this.getVirtualTop()) / this.getVirtualSideLength()
				};
			}
		};

		/**
		 * Translates one or two values from the relative space to the absolute pixel space.
		 * @param {number} x A relative value.
		 * @param {number?} y A relative value.
		 * @returns {number | object} Absolute pixel value corresponding to the parameters.
		 * @private
		 */
		RedlineSurface.prototype._toPixelSpace = function(x, y) {
			if (arguments.length === 1) {
				return x * this.getVirtualSideLength();
			} else {
				return {
					x: x * this.getVirtualSideLength() + this.getVirtualLeft(),
					y: y * this.getVirtualSideLength() + this.getVirtualTop()
				};
			}
		};

		RedlineSurface.prototype.setPanningRatio = function(panningRatio) {
			this.setProperty("panningRatio", panningRatio, true);
		};

		/**
		 * Updates the panning ratio by making calculations based on virtual viewport size and actual viewport size.
		 * @returns {this} <code>this</code> to allow method chaining.
		 * @public
		 */
		RedlineSurface.prototype.updatePanningRatio = function() {
			var virtualLeft = this.getVirtualLeft(),
				virtualTop = this.getVirtualTop(),
				redlineDomRef = this.getDomRef(),
				redlineClientRect = redlineDomRef.getBoundingClientRect(),
				height = redlineClientRect.height,
				width = redlineClientRect.width,
				panningRatio;

			// Before broadcasting the pan event from within the redline gesture handler,
			// we need to apply a certain ratio to deltaX and deltaY.
			// Usually, the panning ratio is 1 which means no change, but we need to change the ratio when the
			// size of the virtual viewport is greater than the size of the actual viewport.
			if (virtualLeft === 0 && (height < width && virtualTop < 0 || (height > width && virtualTop > 0))) {
				panningRatio = height / width;
			} else {
				panningRatio = 1;
			}
			this.setPanningRatio(panningRatio);
			return this;
		};

		/**
		 * Exports all the current redline elements as an array of SVG objects.
		 * @returns {object[]} An array of SVG objects.
		 * @public
		 */
		RedlineSurface.prototype.exportSVG = function() {
			var svgDoc = document.createElementNS(Redline.svgNamespace, "svg");
			this.getRedlineElements().map(function(element) {
				svgDoc.appendChild(element.exportSVG());
			});
			return svgDoc;
		};

		/**
		 * Iterates through all SVG objects from the array passed as parameter, and creates and restores
		 * the redline elements in the array.
		 * @param {object[]} svg An array of redline elements in SVG format.
		 * @returns {this} <code>this</code> to allow method chaining.
		 * @public
		 */
		RedlineSurface.prototype.importSVG = function(svg) {
			svg.childNodes.forEach(function(typeElement) {
				if (typeElement.getAttribute) { // Skip HTML elements which don't have attributes (text, comments...)
					var ElementClass;
					switch (typeElement.tagName) {
						case "rect":
							ElementClass = sap.ui.vk.RedlineElementRectangle;
							break;
						case "ellipse":
							ElementClass = sap.ui.vk.RedlineElementEllipse;
							break;
						case "path":
							ElementClass = sap.ui.vk.RedlineElementFreehand;
							break;
						case "line":
							ElementClass = sap.ui.vk.RedlineElementLine;
							break;
						case "text":
							ElementClass = sap.ui.vk.RedlineElementText;
							break;
						default:
							Log.warning("Unsupported SVG element type " + ElementClass);
					}
					if (ElementClass) {
						this.addRedlineElement(new ElementClass().importSVG(typeElement));
					}
				}
			}.bind(this));

			return this;
		};

		return RedlineSurface;

	});
