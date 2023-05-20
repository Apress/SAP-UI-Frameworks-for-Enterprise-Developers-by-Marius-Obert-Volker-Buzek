/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.RedlineTool
sap.ui.define([
	"sap/base/Log",
	"../library",
	"./Tool",
	"./RedlineToolHandler",
	"./RedlineToolGizmo",
	"../Redline",
	"../RedlineElementRectangle",
	"../RedlineElementEllipse",
	"../RedlineElementFreehand",
	"../RedlineElementLine",
	"../RedlineElementText"
], function(
	Log,
	vkLibrary,
	Tool,
	RedlineToolHandler,
	RedlineToolGizmo,
	Redline,
	RedlineElementRectangle,
	RedlineElementEllipse,
	RedlineElementFreehand,
	RedlineElementLine,
	RedlineElementText
) {
	"use strict";

	/**
	 * Constructor for a new RedlineTool.
	 *
	 * @class
	 * The RedlineTool allows applications to display custom tooltip text on top of 3D object over which pointer is hovering

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.RedlineTool
	 */
	var RedlineTool = Tool.extend("sap.ui.vk.tools.RedlineTool", /** @lends sap.ui.vk.tools.RedlineTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Determines if elements editing is enabled
				 */
				editable: {
					type: "boolean",
					defaultValue: true
				}
			},
			events: {
				elementCreated: {
					parameters: {
						element: "object"
					}
				},
				elementClicked: {
					parameters: {
						elementId: "string"
					}
				},
				elementHovered: {
					parameters: {
						elementId: "string"
					}
				}
			},
			aggregations: {
				/**
				 * The redline element/elements which will be rendered as soon as the redline tool is activated.
				 */
				redlineElements: {
					type: "sap.ui.vk.RedlineElement",
					multiple: true,
					forwarding: {
						getter: "getGizmo",
						aggregation: "redlineElements",
						forwardBinding: true
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			// Treat tool instantiation as singleton
			if (RedlineTool._instance) {
				return RedlineTool._instance;
			}

			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = new RedlineToolHandler(this);

			RedlineTool._instance = this;
		}
	});

	RedlineTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.svg.Viewport", "sap.ui.vk.threejs.Viewport", "sap.ui.vk.dvl.Viewport", "sap.ui.vk.NativeViewport"]);

		this.setAggregation("gizmo", new RedlineToolGizmo());
	};

	RedlineTool.prototype.exit = function() {
		RedlineTool._instance = null;
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	RedlineTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);

		var viewport = this._viewport;
		if (viewport) {
			if (value) {
				if (viewport._activateRedline) {
					viewport._activateRedline();
				} else if (viewport instanceof vkLibrary.threejs.Viewport) {
					viewport._viewportGestureHandler._activateRedline();
				}

				viewport._redlineHandler = this._handler;
				this._handler._zoomFactor = 1; // reset zoom factor on activation

				this._gizmo = this.getGizmo();
				if (this._gizmo) {
					this._gizmo.show();
				}

				this._addLocoHandler();
			} else {
				this._removeLocoHandler();

				if (this._gizmo) {
					this._gizmo.hide();
					this._gizmo = null;
				}

				delete viewport._redlineHandler;

				if (viewport._deactivateRedline) {
					viewport._deactivateRedline();
				} else if (viewport instanceof vkLibrary.threejs.Viewport && viewport._viewportGestureHandler) {
					viewport._viewportGestureHandler._deactivateRedline();
				}
			}
		}

		return this;
	};

	var JsonElementClasses = {
		rectangle: RedlineElementRectangle,
		ellipse: RedlineElementEllipse,
		freehand: RedlineElementFreehand,
		line: RedlineElementLine,
		text: RedlineElementText
	};

	var SvgElementClasses = {
		rect: RedlineElementRectangle,
		ellipse: RedlineElementEllipse,
		path: RedlineElementFreehand,
		line: RedlineElementLine,
		text: RedlineElementText
	};


	/**
	 * Prepares the RedlineTool control for adding a new instance of {sap.ui.vk.RedlineElement}.
	 * @param {sap.ui.vk.RedlineElement} elementInstance The redlining element which needs to be added.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	RedlineTool.prototype.startAdding = function(elementInstance) {
		this.getGizmo()._startAdding(elementInstance);
		return this;
	};

	/**
	 * Stops the mode for adding redlining, which begins when the {@link sap.ui.vk.RedlineTool#startAdding startAdding} method is called.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	RedlineTool.prototype.stopAdding = function() {
		this.getGizmo()._stopAdding(false);
		return this;
	};

	/**
	 * Exports all the current redline elements as an array of JSON objects.
	 * @returns {object[]} An array of JSON objects.
	 * @public
	 */
	RedlineTool.prototype.exportJSON = function() {
		return this.getGizmo().getRedlineElements().map(function(element) {
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
	RedlineTool.prototype.importJSON = function(jsonElements) {
		var gizmo = this.getGizmo();

		jsonElements = Array.isArray(jsonElements) ? jsonElements : [jsonElements];
		jsonElements.forEach(function(json) {
			var ElementClass = JsonElementClasses[json.type];
			if (ElementClass) {
				gizmo.addRedlineElement(new ElementClass().importJSON(json));
			} else {
				Log.warning("Unsupported JSON element type " + json.type);
			}
		});

		gizmo.rerender();

		return this;
	};


	/**
	 * Exports all the current redline elements as an array of SVG objects.
	 * @returns {object[]} An array of SVG objects.
	 * @public
	 */
	RedlineTool.prototype.exportSVG = function() {
		var svgDoc = document.createElementNS(Redline.svgNamespace, "svg");
		this.getGizmo().getRedlineElements().map(function(element) {
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
	RedlineTool.prototype.importSVG = function(svg) {
		var gizmo = this.getGizmo();

		svg.childNodes.forEach(function(typeElement) {
			if (typeElement.getAttribute) { // Skip HTML elements which don't have attributes (text, comments...)
				var ElementClass = SvgElementClasses[typeElement.tagName];
				if (ElementClass) {
					gizmo.addRedlineElement(new ElementClass().importSVG(typeElement));
				} else {
					Log.warning("Unsupported SVG element type " + ElementClass);
				}
			}
		});

		gizmo.rerender();

		return this;
	};

	/** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	RedlineTool.prototype.queueCommand = function(command) {
		if (this._addLocoHandler()) {
			if (this.isViewportType("sap.ui.vk.threejs.Viewport") || this.isViewportType("sap.ui.vk.NativeViewport")) {
				command();
			}
		}
		return this;
	};

	RedlineTool.prototype.onElementClicked = function(event) {
		this.fireElementClicked({ elementId: event.getParameter("elementId") });
	};

	return RedlineTool;
});
