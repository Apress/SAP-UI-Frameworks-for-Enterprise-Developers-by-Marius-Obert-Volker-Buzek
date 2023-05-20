/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.RedlineToolGizmo
sap.ui.define([
	"./Gizmo",
	"./RedlineToolGizmoRenderer"
], function(
	Gizmo,
	RedlineToolGizmoRenderer
) {
	"use strict";

	/**
	 * Constructor for a new RedlineToolGizmo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides UI to display tooltips
	 * @extends sap.ui.vk.tools.Gizmo
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.vk.tools.RedlineToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RedlineToolGizmo = Gizmo.extend("sap.ui.vk.tools.RedlineToolGizmo", /** @lends sap.ui.vk.tools.RedlineToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			aggregations: {
				redlineElements: {
					type: "sap.ui.vk.RedlineElement"
				},
				activeElement: {
					type: "sap.ui.vk.RedlineElement",
					multiple: false,
					visibility: "hidden"
				}
			}
		}
	});

	RedlineToolGizmo.prototype.init = function() {
		if (Gizmo.prototype.init) {
			Gizmo.prototype.init.apply(this);
		}

		this._activeElement = null;
		this._virtualLeft = 0;
		this._virtualTop = 0;
		this._virtualSideLength = 1;
	};

	RedlineToolGizmo.prototype.show = function() {
		this.getParent()._viewport.attachEvent("resize", null, this._onResize, this);
		this.addStyleClass("sapUiVizkitRedlineInteractionMode");
	};

	RedlineToolGizmo.prototype.hide = function() {
		this.getParent()._viewport.detachEvent("resize", this._onResize, this);
		this.removeStyleClass("sapUiVizkitRedlineDesignMode");
		this.removeStyleClass("sapUiVizkitRedlineInteractionMode");
	};

	RedlineToolGizmo.prototype._startAdding = function(elementInstance) {
		this._activeElement = null;
		this.setAggregation("activeElement", elementInstance);

		this.removeStyleClass("sapUiVizkitRedlineInteractionMode");
		this.addStyleClass("sapUiVizkitRedlineDesignMode");
	};

	RedlineToolGizmo.prototype._stopAdding = function(addElement) {
		var element = addElement ? this._activeElement : null;
		this._activeElement = null;
		this.setAggregation("activeElement", null);

		this.removeStyleClass("sapUiVizkitRedlineDesignMode");
		this.addStyleClass("sapUiVizkitRedlineInteractionMode");

		if (element) {
			if (element instanceof sap.ui.vk.RedlineElementLine && element.getLength() === 0) {
				element.destroy();
				element = null;
			} else {
				this.addRedlineElement(element);
				if (this.getParent().getEditable() && element instanceof sap.ui.vk.RedlineElementText) {
					this._createdTextElement = element;
					this.editTextElement(element, true);
				}
			}
			this.getParent().fireElementCreated({ element: element });
		}
	};

	/**
	 * Translates one or two values from the absolute pixel space to the relative values
	 * calculated in relation to the virtual viewport.
	 * @param {number} x A value in pixels.
	 * @param {number?} y A value in pixels.
	 * @returns {number | object} A relative value, or object containing two properties.
	 * @private
	 */
	RedlineToolGizmo.prototype._toVirtualSpace = function(x, y) {
		if (arguments.length === 1) {
			return x / this._virtualSideLength;
		} else {
			return {
				x: (x - this._virtualLeft) / this._virtualSideLength,
				y: (y - this._virtualTop) / this._virtualSideLength
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
	RedlineToolGizmo.prototype._toPixelSpace = function(x, y) {
		if (arguments.length === 1) {
			return x * this._virtualSideLength;
		} else {
			return {
				x: x * this._virtualSideLength + this._virtualLeft,
				y: y * this._virtualSideLength + this._virtualTop
			};
		}
	};

	RedlineToolGizmo.prototype._onResize = function() {
		if (this.getDomRef()) {
			this.rerender();
		}
	};

	/**
	 * Returns the panning ratio by making calculations based on virtual viewport size and actual viewport size.
	 * @returns {number} The panning ratio.
	 * @private
	 */
	RedlineToolGizmo.prototype._getPanningRatio = function() {
		var clientRect = this.getDomRef().getBoundingClientRect(),
			height = clientRect.height,
			width = clientRect.width;

		// Before broadcasting the pan event from within the redline gesture handler,
		// we need to apply a certain ratio to deltaX and deltaY.
		// Usually, the panning ratio is 1 which means no change, but we need to change the ratio when the
		// size of the virtual viewport is greater than the size of the actual viewport.
		if (this._virtualLeft === 0 && (height < width && this._virtualTop < 0 || (height > width && this._virtualTop > 0))) {
			return height / width;
		}

		return 1;
	};

	/**
	 * Activates text element editing
	 * @param {object} element sap.ui.vk.RedlineElementText to edit.
	 * @param {boolean} selectText Optional, select all text before editing.
	 * @protected
	 */
	RedlineToolGizmo.prototype.editTextElement = function(element, selectText) {
		if (!this.getParent().getEditable()) {
			return;
		}

		var domRef = this._textEditingElement && this._textEditingElement.getDomRef();
		if (domRef) {
			domRef.childNodes[0].blur(); // stop editing and move text element domRef to its original position
		}

		// console.log("edit", element.getText());
		domRef = element.getDomRef();
		if (domRef) {
			element._nextElementSibling = domRef.nextElementSibling; // store text element domRef position
			domRef.parentNode.appendChild(domRef); // move text element domRef to the end/top
			domRef.childNodes[0].focus();
			if (selectText) {
				domRef.childNodes[0].select();
			}
		}
	};

	RedlineToolGizmo.prototype.onBeforeRendering = function() {
		var viewport = this.getParent()._viewport;
		if (viewport && viewport.getDomRef()) {
			var virtualViewportSize = viewport.getOutputSize();
			this._virtualLeft = virtualViewportSize.left;
			this._virtualTop = virtualViewportSize.top;
			this._virtualSideLength = virtualViewportSize.sideLength;
		}
	};

	RedlineToolGizmo.prototype.onAfterRendering = function() {
		var that = this;
		function attachTextEventHandlers(element) {
			var domRef = element.getDomRef();
			var textArea = domRef && domRef.childNodes[0];
			if (!textArea) {
				return;
			}

			textArea.onfocus = function(event) {
				// console.log(">", element.getText());
				that._textEditingElement = element;
				this.style.background = "#0004";
				this.style.backdropFilter = "blur(8px)";
				this.style.resize = "both";
				this.style.overflow = "auto";
			};
			textArea.onblur = function(event) {
				// console.log("\t<", element.getText());
				that._textEditingElement = null;
				this.style.background = "none";
				this.style.backdropFilter = null;
				this.style.resize = "none";
				this.style.overflow = "hidden";
				this.scrollTop = 0;

				// set element width
				element.setWidth(parseFloat(this.style.width));

				// set element height
				var height = parseFloat(this.style.height);
				this.style.height = "1px"; // needed to calculate the correct content height using scrollHeight, otherwise scrollHeight will be increasing
				height = Math.max(height, this.scrollHeight);
				this.style.height = height + "px";
				element.setHeight(height);

				if (domRef === element.getDomRef()) {
					domRef.parentNode.insertBefore(domRef, element._nextElementSibling); // move text element domRef to its original position
				}
				delete element._nextElementSibling;

				if (that._createdTextElement === element) {
					that._createdTextElement = null;
					that.getParent().fireElementCreated({ element: element });
				}
			};
			textArea.onchange = function(event) {
				element.setText(this.value);
			};
			// Avoid viewport catch the shortcut press
			textArea.addEventListener("keypress", function(event) {
				event.stopPropagation();
			});
		}

		this.getRedlineElements().forEach(function(element) {
			if (element instanceof sap.ui.vk.RedlineElementText) {
				attachTextEventHandlers(element);
			}
		});

		if (this._activeElement instanceof sap.ui.vk.RedlineElementText && this._activeElement.getDomRef()) {
			attachTextEventHandlers(this._activeElement);
		}
	};

	RedlineToolGizmo.prototype.onkeydown = function(event) {
		if (this._textEditingElement) {// pass keydown events to an editable text element
			event.setMarked(true);
			event.stopPropagation();
		}
	};

	return RedlineToolGizmo;

});
