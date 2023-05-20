/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Annotation
sap.ui.define([
	"sap/ui/core/Control",
	"./Core",
	"./AnnotationStyle",
	"./NodeUtils",
	"sap/m/FormattedText",
	"sap/ui/richtexteditor/RichTextEditor",
	"sap/ui/richtexteditor/library",
	"./AnnotationRenderer",
	"sap/ui/core/Core"

], function(
	Control,
	vkCore,
	AnnotationStyle,
	NodeUtils,
	FormattedText,
	RTE,
	rteLibrary,
	AnnotationRenderer,
	core
) {
	"use strict";

	/**
	 * Constructor for a new Annotation.
	 *
	 * @class
	 * Annotation allows applications to display custom html annotation on top of Viewport and associate it with 3D object
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.Annotation
	 * @experimental Since 1.76.0 This class is experimental and might be modified or removed in future versions.
	 */

	var Annotation = Control.extend("sap.ui.vk.Annotation", /** @lends sap.ui.vk.Annotation.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Reference to the annotation Id
				 */
				annotationId: "string",
				/**
				 * Reference to the annotation name
				 */
				name: "string",
				/**
				 * Reference to the node that represents the annotation
				 */
				nodeRef: "any",
				/**
				 * The text that will be displayed in the annotation
				 */
				text: {
					type: "string",
					defaultValue: ""
				},
				/**
				 * The style of the annotation
				 */
				style: {
					type: "sap.ui.vk.AnnotationStyle",
					defaultValue: AnnotationStyle.Default
				},
				/**
				 * Controls the visibility of the annotation
				 */
				display: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Controls the animation of the annotation. If set to <code>false</code> then animation is not played.
				 */
				animate: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Amount of time in seconds to wait before animation is played. Default value of -1 means that this is not set.
				 */
				animationDelay: {
					type: "float",
					defaultValue: -1
				},
				/**
				 * Controls the annotation selected state
				 */
				selected: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * If annotation is editable then double click event is fired when user double clicks on the annotation
				 * and text editing is allowed by calling openEditor() method.
				 * If annotation is also selected then resize and reposition handles will be displayed.
				 */
				editable: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Sets the X Coordinate of the annotation. This uses a scale of -0.5 to 0.5, left to right respectively.
				 * This is relative to the Viewport's safe area if present, otherwise it is relative to the Viewport.
				 */
				xCoordinate: {
					type: "float",
					defaultValue: 0
				},
				/**
				 * Sets the Y Coordinate of the annotation. This uses a scale of -0.5 to 0.5, top to bottom respectively.
				 * This is relative to the Viewport's safe area if present, otherwise it is relative to the Viewport.
				 */
				yCoordinate: {
					type: "float",
					defaultValue: 0
				},
				/**
				 * Sets horizontal offset of annotation's position relative to the point where it should be normally placed.
				 * Can be used to offset annotation from attachment node (if set).
				 * This uses a scale of -0.5 to 0.5, left to right respectively.
				 */
				xOffset: {
					type: "float",
					defaultValue: 0
				},
				/**
				 * Sets horizontal offset of annotation's position relative to the point where it should be normally placed.
				 * Can be used to offset annotation from attachment node (if set).
				 * This uses a scale of -0.5 to 0.5, top to bottom respectively.
				 */
				yOffset: {
					type: "float",
					defaultValue: 0
				},
				/**
				 * Sets the height of the annotation. This uses a scale of 0 to 1, 0% to 100% respectively.
				 * This is relative to the Viewport's safe area if present, otherwise it is relative to the Viewport.
				 * Negative values will be ignored.
				 */
				height: {
					type: "float"
				},
				/**
				 * Sets the width of the annotation. This uses a scale of 0 to 1, 0% to 100% respectively.
				 * This is relative to the Viewport's safe area if present, otherwise it is relative to the Viewport.
				 * Negative values will be ignored.
				 */
				width: {
					type: "float"
				}
			},
			associations: {
				viewport: {
					type: "sap.ui.vk.Viewport",
					multiple: false
				}
			},
			aggregations: {
				textEditor: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			}
		},

		constructor: function(sId, mSettings) {
			Control.apply(this, arguments);
			if (this._viewport == null) {
				this._topLimit = -0.5;
				this._leftLimit = -0.5;
			}
		}
	});

	Annotation.prototype.setViewport = function(vp) {
		this.setAssociation("viewport", vp);

		this._viewport = core.byId(this.getViewport());
		// Get the normalized visible range (x: _leftLimit and y: _topLimit) based on the current viewport.
		if (this._viewport.getSafeArea().getDomRef()) {
			var safeBox = this._viewport.getSafeArea().getDomRef().getBoundingClientRect();
			var viewBox = this._viewport.getDomRef().getBoundingClientRect();
			var widthMargin = viewBox.left - safeBox.left;
			var heightMargin = viewBox.top - safeBox.top;
			var rect = this._viewport.normalizeRectangle(0, 0, widthMargin, heightMargin);
			this._topLimit = -0.5 + rect.height;
			this._leftLimit = -0.5 + rect.width;
		}
	};

	Annotation.prototype._firePositionChanged = function(annotation) {
		vkCore.getEventBus().publish("sap.ui.vk", "annotationPositionChanged", {
			annotation: annotation,
			x: annotation.getXCoordinate(),
			y: annotation.getYCoordinate()
		});
	};

	Annotation.prototype._fireSizeChanged = function(annotation, annotationWidth, annotationHeight) {
		vkCore.getEventBus().publish("sap.ui.vk", "annotationSizeChanged", {
			annotation: annotation,
			width: annotationWidth,
			height: annotationHeight
		});
	};

	/**
	 * Return list of target nodes.
	 * @return {any[]} Target nodes for leader lines
	 * @public
	 */
	Annotation.prototype.getTargetNodes = function() {
		this._targetNodes = this._targetNodes || [];
		return this._targetNodes;
	};

	/**
	 * Returns attached node. If set annotation will follow it on the screen
	 * @returns {any} Attachment node
	 */
	Annotation.prototype.getAttachmentNode = function() {
		return this._attachmentNode;
	};

	/**
	 * Sets attached node. If set then annotation will follow it on the screen
	 * @param {any} attNode Attachment node reference
	 */
	Annotation.prototype.setAttachmentNode = function(attNode) {
		this._attachmentNode = attNode;
		if (attNode) {
			this.rerender(); // Replay animation
		}
	};

	Annotation.prototype.getDisplay = function() {
		if (this.getNodeRef()) {
			var vsm = core.byId(this._viewport.getViewStateManager());
			return vsm.getVisibilityState(this.getNodeRef());
		}
		// We can't use property "visible" as it's already used by sap.ui.core.Control to control rendering
		return this.getProperty("display");
	};

	Annotation.prototype.setDisplay = function(visible) {
		if (this.getProperty("display") === visible) {
			return this;
		}

		this.setProperty("display", visible, true);

		var annotation = this.getDomRef();
		if (annotation) {
			this._reverse = !visible;
			this.invalidate();
		}
		return this;
	};

	Annotation.prototype.getSelected = function() {
		if (this.getNodeRef()) {
			var vsm = core.byId(this._viewport.getViewStateManager());
			return vsm.getSelectionState(this.getNodeRef());
		}
		return this.getProperty("selected");
	};

	Annotation.prototype.setSelected = function(selected) {
		// Rerender control only if it's editable because it changes style
		this.setProperty("selected", selected, !this.getEditable());
		if (selected) {
			this._setMaxZ();
		}
		var vsm = core.byId(this._viewport.getViewStateManager());
		var nodeRef = this.getNodeRef();
		if (vsm.getSelectionState(nodeRef) !== selected) {
			vsm.setSelectionState(nodeRef, selected);
		}

		// Assign local listener for event wheel for each item. When multiple texts are selected,
		// scroll operation will occur on each text.
		var that = this;
		var onscroll = function(ev) {
			var textDivDom = that._textDiv.getDomRef();
			if (textDivDom == null) {
				return;
			}
			ev.stopPropagation();
			textDivDom.scrollTo(textDivDom.scrollLeft + ev.deltaX, textDivDom.scrollTop + ev.deltaY);
		};
		if (selected) {
			this._localScroll = onscroll;
			document.addEventListener("wheel", onscroll, true);
		} else {
			if (this._localScroll) {
				document.removeEventListener("wheel", this._localScroll, true);
			}
			this._localScroll = undefined;
		}

		this._moving = false;
		return this;
	};

	Annotation.prototype.setAnnotationId = function(newId) {
		var oldAnnotationId = this.getAnnotationId();

		this.setProperty("annotationId", newId, true);

		// TODO: This code should be moved to somewhere else as it must not depend on existence of
		// the annotation control.
		if (this._viewport && this.sourceData) {
			this._viewport.getScene().setAnnotationPersistentId(this.sourceData.annotation, newId);

			var view = this._viewport.getCurrentView();
			if (view != null) {
				view.getNodeInfos().forEach(function(nodeInfo) {
					if (nodeInfo.annotationId === oldAnnotationId) {
						nodeInfo.annotationId = newId;
					}
				});
			}
		}
	};

	Annotation.prototype._getNodeRefScreenCenter = function(viewport, node) {
		var center = NodeUtils.centerOfNodes([node]);

		// Return object with screen coordinates in pixels and normalized z coordinate (node's depth)
		return viewport.projectToScreen(center[0], center[1], center[2], viewport.getCamera());
	};

	Annotation.prototype._getSortIndex = function(viewport) {
		this.zIndex = this.zIndex || "auto";
		var aNode = this.getTargetNodes()[0];
		if (aNode) {
			var center = NodeUtils.centerOfNodes([aNode]);
			var screenPoint = viewport.projectToScreen(center[0], center[1], center[2], viewport.getCamera());
			this.zIndex = Math.floor(10000 * (1 - screenPoint.depth));
		}
		return this.zIndex;
	};

	Annotation.prototype._getOpacity = function() {
		if (this._viewport) {
			var zIndex = this.zIndex;
			var annotations = [];
			this._viewport.getAnnotations().forEach(function(atn) {
				if (atn.getDisplay() === true) {
					annotations.push(atn);
				}
			});
			if (annotations.length > 1) {
				var zIndexes = Array.from(annotations, function(atn) {
					return atn.zIndex;
				});
				var zMax = Math.max.apply(null, zIndexes);
				var zMin = Math.min.apply(null, zIndexes);
				return 0.7 + (zIndex - zMin) * 0.3 / (zMax - zMin);
			}
		}
		return 1;
	};

	Annotation.prototype._updateBlocked = function() {
		// Hide annotation when target node is obscured
		var targetNode = this.getTargetNodes()[0];
		if (this.getDisplay() && targetNode) {
			var viewport = this._viewport;
			var nodeScreen = this._getNodeRefScreenCenter(viewport, targetNode);
			var hitNode = viewport.hitTest(nodeScreen.x, nodeScreen.y);
			var annotation = this.getDomRef();
			if (targetNode.visible == false) {
				annotation.style.visibility = "hidden";
			} else {
				annotation.style.visibility = "visible";
			}
			if (hitNode && annotation) {
				var subNodes = [];
				targetNode._vkTraverseMeshNodes(function(node) { subNodes.push(node); });
				if (subNodes.indexOf(hitNode.object) >= 0) {
					// Display annotation when hit node is the target node
					annotation.style.visibility = "visible";
				} else {
					var vsm = core.byId(viewport.getViewStateManager());
					var worldPos = vsm.getTransformationWorld(hitNode.object).translation;
					var hitPos = viewport.projectToScreen(worldPos[0], worldPos[1], worldPos[2], viewport.getCamera());
					// Hide annotation when target node is deeper than the hit node
					if (hitPos.depth < nodeScreen.depth) {
						annotation.style.visibility = "hidden";
					}
				}
			}
		}
		return this.getDisplay();
	};

	Annotation.prototype.setName = function(name) {
		this.setProperty("name", name);

		if (this.getNodeRef()) {
			this.getNodeRef().name = name;
		}
	};

	Annotation.prototype.getName = function() {
		if (this.getNodeRef()) {
			return this.getNodeRef().name;
		}
		return this.getProperty("name");
	};

	Annotation.prototype.setText = function(text) {
		this.setProperty("text", text, true);

		if (this.sourceData) {
			this.sourceData.annotation.text = { html: text };
		}

		if (this.getTextEditor()) {
			// We have editor open, set text to RTE control
			this._textDiv.value = text;
			return this;
		}

		if (this._textDiv == null) {
			this._textDiv = new FormattedText({
				width: this._textWidth ? this._textWidth + "px" : "auto",
				height: this._textHeight ? this._textHeight + "px" : "auto"
			});
			this._textDiv.addStyleClass("sapUiVizKitAnnotationText");
		}
		if (this.getAnimate() && (this.getStyle() === AnnotationStyle.Random || this.getStyle() === AnnotationStyle.Expand)) {
			this._setSpanText(text);
		} else {
			this._textDiv.setHtmlText(text);
		}
		this._textDiv.rerender();
		this.update();
		return this;
	};

	Annotation.prototype._setSpanText = function(textValue) {
		if (this.getTextEditor()) {
			// No random text while editor is open
			return this;
		}
		var newText = "";
		for (var i = 0; i < textValue.length; i++) {
			if (textValue[i] === "<") {
				newText += "<";
				while (textValue[i] !== ">") {
					i++;
					newText += textValue[i];
				}
			}
			if (textValue[i] === "&") {
				newText += "<span class=vitAnnotation>&";
				while (textValue[i] !== ";") {
					i++;
					newText += textValue[i];
				}
				newText += "</span>";
			} else if (textValue[i] !== ">") {
				newText += "<span class=vitAnnotation>";
				newText += textValue[i];
				newText += "</span>";
			}
		}
		this._textDiv.setHtmlText(newText);

		return this;
	};

	Annotation.prototype.setStyle = function(val) {
		this.setProperty("style", val);

		if (this.sourceData) {
			this.sourceData.annotation.style = val;
		}

		// Re-set text here as some styles may require different text rendering
		this.setText(this.getText());
	};

	Annotation.prototype.setAnimate = function(val) {
		this.setProperty("animate", val);
		if (this.sourceData) {
			this.sourceData.annotation.animate = val;
		}
		// Re-set text here as some styles may have text animation
		this.setText(this.getText());
	};

	Annotation.prototype._setMaxZ = function() {
		// Set annotation element with max z-Index
		var annotation = this.getDomRef();
		if (annotation) {
			var maxZ = Math.max.apply(
				null,
				this._viewport.getAnnotations().map(function(ant) { return ant.zIndex || 1; }));
			if (!this.zIndex || this.zIndex < maxZ) {
				this.zIndex = maxZ + 1;
			}
			annotation.style.zIndex = this.zIndex;
		}
	};

	Annotation.prototype.onclick = function(evt) {
		// Handle click event only if we are not editing text and not moving/resizing annotation.
		if (this.getTextEditor() == null && !this._moving) {
			// Avoid two single clicks when user performs double click. Wait short period of time before accept single click.
			if (this._firstClick) {
				// First click is not cleared yet which means that this is second click of double click event.
				vkCore.getEventBus().publish("sap.ui.vk", "annotationDoubleClicked", {
					annotation: this
				});
				this._firstClick = false;
			} else {
				// First time here, just set this flag and wait little bit
				this._firstClick = true;
				setTimeout(function() {
					if (this._firstClick) {
						// Second click didn't happen, this is genuine single click event. Proceed with selection change.
						this._firstClick = false;
						this._viewport.tapObject(this.getNodeRef());
					}
				}.bind(this), 250);
			}
		}

		// Always stop propagation to viewport which would cause another selectionChanged event
		evt.stopPropagation();
	};

	Annotation.prototype.openEditor = function() {
		if (!this.getEditable()) {
			return null;
		}
		var rte = new RTE({
			editorType: rteLibrary.EditorType.TinyMCE4,
			width: this._textDiv.getWidth(),
			height: this._textDiv.getHeight(),
			value: this.getText()
		});
		if (this._textDiv) {
			this._textDiv.destroy();
		}
		rte.addStyleClass("sapUiVizKitRichTextEditor");
		this._textDiv = rte;
		this.setTextEditor(rte);

		return rte;
	};

	Annotation.prototype.closeEditor = function() {
		if (this.getTextEditor() == null) {
			// Editor is not open
			return;
		}
		var text = this._textDiv.getValue();
		this.destroyTextEditor(); // Destroy editor aggregation, this will also destroy editor control
		this._textDiv = null;
		this.setText(text);
	};

	Annotation.prototype.onAfterRendering = function() {
		var annotation = this.getDomRef();
		if (annotation) {
			this._initialOffsetWidth = annotation.offsetWidth;
			this._initialOffsetHeight = annotation.offsetHeight;
			if (!this.getDisplay()) {
				annotation.style.visibility = "hidden";
			}
			if (this.getAnimate() && this.getAnimationDelay() > 0) {
				annotation.style.animationDelay = this.getAnimationDelay() + "s";
			}
			if (this._textDiv) {
				var domRef = this._textDiv.getDomRef();
				if (domRef) {
					var delay = this.getAnimationDelay();
					if (delay === -1) {
						delay = 0;
					}
					var animationName = "";
					var children = domRef.getElementsByTagName("span");
					var style;
					var styleObjects = [];
					for (var i = 0; i < children.length; i++) {
						if (children[i].className === "vitAnnotation") {
							styleObjects.push(children[i].style);
						}
					}
					if (this.getStyle() === AnnotationStyle.Random) {
						animationName = this.getAnimate() ? "annotationRandomTextSpan" : "annotationStatic";
						for (var j = 0; j < styleObjects.length; j++) {
							style = styleObjects[j];

							var randomDelay = (delay + Math.random()) + "s";

							style.animationName = animationName;
							style.animationDuration = "4s";
							style.animationTimingFunction = "linear";
							style.animationDelay = randomDelay;
							style.animationIterationCount = "1";
							style.animationDirection = "alternate";
							style.animationFillMode = "both";
						}
					} else if (this.getStyle() === AnnotationStyle.Expand) {
						animationName = this.getAnimate() ? "annotationExpandTextSpan" : "annotationStatic";
						for (var k = 0; k < styleObjects.length; k++) {
							style = styleObjects[k];

							style.animationName = animationName;
							style.animationDuration = ((0.1 / styleObjects.length) * (k + 1)) + "s";
							style.animationTimingFunction = "linear";
							style.animationDelay = (delay + 0.5) + "s";
						}
					}
				}
			}
			this.setXCoordinate(this.getXCoordinate());
			this.setYCoordinate(this.getYCoordinate());
			this.setWidth(this.getWidth());
			this.setHeight(this.getHeight());

			this.update();
		}

		this.setEditableState(this.getEditable() && this.getSelected());

		if (this.zIndex) {
			annotation.style.zIndex = this.zIndex;
		}
	};

	Annotation.prototype.setEditable = function(editable) {
		if (this.getEditable() == editable) {
			return;
		}
		this.setProperty("editable", editable);

		if (this.sourceData) {
			this.sourceData.annotation.editable = editable;
		}

		this._previousState = this._previousState || {};
		var annotation = this.getDomRef();
		if (annotation && editable) {
			var annotationRect = annotation.getBoundingClientRect();
			this._previousState.x = annotationRect.x;
			this._previousState.y = annotationRect.y;
		}
	};

	Annotation.prototype.setHeight = function(height) {
		if (height < 0) {
			return;
		}

		this.setProperty("height", height, true);

		if (this.getNodeRef()) {
			this.getNodeRef().scale.setY(height);
		}

		if (this._viewport && this._textDiv && this._textDiv.getDomRef()) {
			var textDivDom = this._textDiv.getDomRef();
			var rect = this._viewport.deNormalizeRectangle(0, 0, 0, height);
			var testHeight = rect.height;
			if (this._textDiv.getNativeApi) {
				if (this._resized) {
					textDivDom.style.height = "calc(" + rect.height + "px)";
				} else {
					textDivDom.style.height = "calc(" + rect.height + "px + 0.6rem)";
				}
			} else {
				textDivDom.style.height = "calc(" + rect.height + "px - 1rem)";
			}

			var rectText = textDivDom.getBoundingClientRect();
			var bBox = this._viewport.getDomRef().getBoundingClientRect();
			if (textDivDom.clientHeight < textDivDom.scrollHeight) {
				textDivDom.style.height = "calc(" + textDivDom.scrollHeight + "px - 1rem)";
				testHeight = textDivDom.scrollHeight;
			}
			if (testHeight + rectText.y > bBox.y + bBox.height) {
				textDivDom.style.height = Math.round(bBox.y + bBox.height - rectText.y).toString() + "px";
			}
			// Avoid different rendering with "auto" and style.height.
			this._textDiv.setHeight(textDivDom.style.height);
		}
	};

	Annotation.prototype.setWidth = function(width) {
		if (width < 0) {
			return;
		}

		this.setProperty("width", width, true);

		if (this.getNodeRef()) {
			this.getNodeRef().scale.setX(width);
		}

		if (this._viewport && this._textDiv && this._textDiv.getDomRef()) {
			var rect = this._viewport.deNormalizeRectangle(0, 0, width, 0);
			var textDivDom = this._textDiv.getDomRef();
			var testWidth = rect.width;
			if (this._textDiv.getNativeApi) {
				if (this._resized) {
					textDivDom.style.width = "calc(" + rect.width + "px)";
				} else {
					textDivDom.style.width = "calc(" + rect.width + "px + 0.6rem)";
				}
			} else {
				textDivDom.style.width = "calc(" + rect.width + "px - 1rem)";
			}

			if (textDivDom.clientWidth < textDivDom.scrollWidth) {
				textDivDom.style.maxWidth = textDivDom.style.width;
			} else {
				textDivDom.style.maxWidth = textDivDom.style.width;
			}
			var rectText = textDivDom.getBoundingClientRect();
			var bBox = this._viewport.getDomRef().getBoundingClientRect();
			if (testWidth + rectText.x + 26 > bBox.x + bBox.width) {
				textDivDom.style.width = Math.round(bBox.x + bBox.width - rectText.x - 26).toString() + "px";
			}
			// Avoid different rendering with "auto" and style.width.
			this._textDiv.setWidth(textDivDom.style.width);
		}
	};

	Annotation.prototype.setXCoordinate = function(x) {
		if (this._viewport && this._textDiv && this._textDiv.getDomRef()) {
			// set x to be always in the visible range of the current viewport.
			if (x < this._leftLimit) {
				x = this._leftLimit;
			}
			var rightEnd = this._viewport.normalizeRectangle(0, 0, 96, 0);
			if (x > -this._leftLimit - rightEnd.width) {
				x = -this._leftLimit - rightEnd.width;
			}
			if (x < this._leftLimit) {
				x = this._leftLimit;
			}
			var rect = this._viewport.deNormalizeRectangle(x, 0, 0, 0);
			this.getDomRef().style.left = rect.x + "px";
		}

		this.setProperty("xCoordinate", x, true);

		if (this.getNodeRef()) {
			this.getNodeRef().position.setX(x);
		}

	};

	Annotation.prototype.setYCoordinate = function(y) {
		if (this._viewport && this._textDiv && this._textDiv.getDomRef()) {
			var textDivDom = this._textDiv.getDomRef();
			var textRect = this._viewport.normalizeRectangle(0, 0, 0, textDivDom.clientHeight);
			// scrollbar may be needed when there are more contents.
			if (textDivDom.scrollHeight > textDivDom.clientHeight || textRect.height > 1) {
				textDivDom.style.setProperty("--overflow", "auto");
			}
			// set y to be always in the visible range of the current viewport.
			if (y < this._topLimit) {
				y = this._topLimit;
			}
			if (y > -this._topLimit - textRect.height) {
				y = -this._topLimit - textRect.height;
			}
			if (y < this._topLimit) {
				y = this._topLimit;
			}
			var rect = this._viewport.deNormalizeRectangle(0, y, 0, 0);
			this.getDomRef().style.top = rect.y + "px";
		}

		this.setProperty("yCoordinate", y, true);

		if (this.getNodeRef()) {
			this.getNodeRef().position.setY(y);
		}

	};

	Annotation.prototype._resizeEnd = function() {
		this._handleViewportStop();
		var textDivDom = this._textDiv.getDomRef();
		var rect = this._viewport.normalizeRectangle(0, 0, textDivDom.clientWidth, textDivDom.clientHeight);
		this._resized = true;
		this.setWidth(rect.width);
		this.setHeight(rect.height);
		this._fireSizeChanged(this, rect.width, rect.height);
	};

	Annotation.prototype.setEditableState = function(editable) {
		if (!editable) {
			this.ontouchstart = null;
			return;
		}

		var currentSize = new Map();
		var editableAnnotations = [];
		var vp = this._viewport;

		var getEditableAnnotations = function() {
			editableAnnotations = vp.getAnnotations().filter(function(ant) { return ant.getEditable() && ant.getSelected(); });
			editableAnnotations.forEach(function(annotation) {
				var computedStyle = window.getComputedStyle(annotation._textDiv.getDomRef());
				var textWidth = parseInt(computedStyle.width.slice(0, -2), 10);
				var textHeight = parseInt(computedStyle.height.slice(0, -2), 10);
				var textMaxWidth = parseInt(computedStyle.maxWidth.slice(0, -2), 10);
				currentSize.set(annotation.getAnnotationId(), {
					width: textWidth,
					height: textHeight,
					maxWidth: textMaxWidth
				});
			});
		};

		var that = this;
		var annotation = this.getDomRef();
		var gripElements = annotation.childNodes;
		var resizer = {
			strategies: {
				"sapUiVizKitAnnotationElement0": gripNW,
				"sapUiVizKitAnnotationElement1": gripN,
				"sapUiVizKitAnnotationElement2": gripNE,
				"sapUiVizKitAnnotationElement3": gripE,
				"sapUiVizKitAnnotationElement4": gripSE,
				"sapUiVizKitAnnotationElement5": gripS,
				"sapUiVizKitAnnotationElement6": gripSW,
				"sapUiVizKitAnnotationElement7": gripW
			},
			resize: gripHandler
		};

		this.ontouchstart = function(ev) {
			var oEvent = ev || event;
			oEvent.stopPropagation();
			getEditableAnnotations();
			var resizeHandler = resizer.strategies[oEvent.targetTouches[0].target.className];
			if (resizeHandler) {
				// resize annotations
				resizer.resize(oEvent, resizeHandler);
			} else {
				// move annotations
				that._previousState.offsetTop = that._offsetTop;
				that._previousState.offsetLeft = that._offsetTop;

				editableAnnotations.forEach(function(annotation) {
					annotation._initialX = oEvent.clientX ? oEvent.clientX : oEvent.targetTouches[0].clientX;
					annotation._initialY = oEvent.clientY ? oEvent.clientY : oEvent.targetTouches[0].clientY;
				});
				var onMouseMove = function(ev) {
					oEvent = ev || event;
					that._viewport._viewportGestureHandler._gesture = false;
					oEvent.stopPropagation();
					editableAnnotations.forEach(function(annotation) {
						annotation._moving = true;
						var clientX = oEvent.clientX ? oEvent.clientX : oEvent.targetTouches[0].clientX;
						var clientY = oEvent.clientY ? oEvent.clientY : oEvent.targetTouches[0].clientY;
						annotation._currentX = clientX - annotation._initialX;
						annotation._currentY = clientY - annotation._initialY;
						setTranslate(annotation._currentX, annotation._currentY, annotation.getDomRef());
						annotation.update();
					});
				};
				var onMouseUp = function(ev) {
					oEvent = ev || event;
					oEvent.stopPropagation();
					editableAnnotations.forEach(function(annotation) {
						annotation._handleViewportStop();
					});
					document.removeEventListener("mousemove", onMouseMove);
					document.removeEventListener("mouseup", onMouseUp);
					document.removeEventListener("touchmove", onMouseMove);
					document.removeEventListener("touchend", onMouseUp);
				};

				document.addEventListener("mousemove", onMouseMove);
				document.addEventListener("mouseup", onMouseUp);
				document.addEventListener("touchmove", onMouseMove);
				document.addEventListener("touchend", onMouseUp);

				that.update();
			}
		};

		/**
		 * DISABLED FOR THE MOMENT
		 */
		// move leader line arrowhead
		// var annotationNodeElement = annotation.nextSibling;
		// annotationNodeElement.onmousedown = function(ev) {
		// 	var oEvent = ev || event;
		// 	var hitNode;
		// 	var annotationNode = {
		// 		_initialX: oEvent.clientX,
		// 		_initialY: oEvent.clientY
		// 	};
		// 	var currentNode = that.getNodeRef();
		// 	document.onmousemove = function(ev) {
		// 		that._moving = true;
		// 		that._viewport._viewportGestureHandler._gesture = false;
		// 		oEvent = ev || event;
		// 		setTranslate(oEvent.clientX - annotationNode._initialX, oEvent.clientY - annotationNode._initialY, annotationNodeElement);
		// 		hitNode = that._viewport.hitTest(oEvent.clientX - viewportRect.x, oEvent.clientY - viewportRect.y);
		// 	};
		// 	document.onmouseup = function() {
		// 		that._moving = false;
		// 		var computedStyle = window.getComputedStyle(annotationNodeElement);
		// 		var transform = annotationNodeElement.style.transform;
		// 		annotationNodeElement.style.transform = "";
		// 		var x = parseFloat(transform.substring(transform.indexOf("(") + 1, transform.indexOf(",")));
		// 		var y = parseFloat(transform.substring(transform.indexOf(",") + 1, transform.indexOf(")")));
		// 		annotationNodeElement.style.left = parseFloat(computedStyle.left) + x + "px";
		// 		annotationNodeElement.style.top = parseFloat(computedStyle.top) + y + "px";
		// 		if (hitNode) {
		// 			that.setNodeRef(hitNode.object);
		// 		} else {
		// 			that.setNodeRef(currentNode);
		// 		}
		// 		that._shouldRenderVp = true;
		// 		document.onmousemove = null;
		// 		document.onmouseup = null;
		// 	};
		// };

		// resize annotations
		function gripHandler(oEvent, resizeHandler) {
			var clientX = oEvent.clientX ? oEvent.clientX : oEvent.targetTouches[0].clientX;
			var clientY = oEvent.clientY ? oEvent.clientY : oEvent.targetTouches[0].clientY;
			var disX = clientX - gripElements[0].offsetLeft;
			var disY = clientY - gripElements[0].offsetTop;

			var oTarget = jQuery(oEvent.currentTarget).control()[0]._viewport.$();
			// get the iframe in RTE
			var rteIfr = jQuery("iframe[id$='-textarea_ifr']");
			if (rteIfr.length) {
				var cover = jQuery("<div></div>");
				cover.attr("id", "rte_ifr_cov");
				cover.css({ position: "absolute" });
				cover.css({ opacity: 0 });
				cover.css({ top: oTarget.offset().top, left: oTarget.offset().left });
				cover.height(oTarget.height());
				cover.width(oTarget.width());
				jQuery("body").append(cover[0]);
			}
			document.onmousemove = function(ev) {
				that._viewport._viewportGestureHandler._gesture = false;
				var oEvent = ev || event;
				var clientX = oEvent.clientX ? oEvent.clientX : oEvent.targetTouches[0].clientX;
				var clientY = oEvent.clientY ? oEvent.clientY : oEvent.targetTouches[0].clientY;
				var deltaWidth = clientX - disX;
				var deltaHeight = clientY - disY;
				editableAnnotations.forEach(function(annotation) {
					annotation._moving = true;
					resizeHandler(annotation, deltaWidth, deltaHeight);
					annotation.update();
				});
			};
			document.onmouseup = function() {
				var rteIfr = jQuery("#rte_ifr_cov");
				if (rteIfr) {
					rteIfr.remove();
				}
				editableAnnotations.forEach(function(annotation) {
					var size = currentSize.get(annotation.getAnnotationId());
					size.width = annotation._textWidth;
					size.height = annotation._textHeight;
					size.maxWidth = annotation._textMaxWidth;
					annotation._resizeEnd();
				});
				document.onmousemove = null;
				document.onmouseup = null;
				document.ontouchmove = null;
				document.ontouchend = null;
			};
			document.ontouchmove = document.onmousemove;
			document.ontouchend = document.onmouseup;
		}

		var setSize = function(annotation, width, maxWidth, height) {
			var domRef = annotation._textDiv.getDomRef();
			if (width) {
				annotation._textWidth = width;
				domRef.style.width = annotation._textWidth + "px";
				annotation._textDiv.setProperty("width", domRef.style.width, true);
			}
			if (maxWidth) {
				annotation._textMaxWidth = maxWidth;
				domRef.style.maxWidth = annotation._textMaxWidth + "px";
			}
			if (height) {
				annotation._textHeight = height;
				domRef.style.height = annotation._textHeight + "px";
				annotation._textDiv.setProperty("height", domRef.style.height, true);
			}
		};

		// north west
		function gripNW(annotation, deltaWidth, deltaHeight) {
			setSize(
				annotation,
				currentSize.get(annotation.getAnnotationId()).width - deltaWidth,
				currentSize.get(annotation.getAnnotationId()).maxWidth - deltaWidth,
				currentSize.get(annotation.getAnnotationId()).height - deltaHeight
			);
			annotation._currentX = deltaWidth;
			annotation._currentY = deltaHeight;
			setTranslate(deltaWidth, deltaHeight, annotation.getDomRef());
		}

		// north
		function gripN(annotation, deltaWidth, deltaHeight) {
			setSize(
				annotation,
				null,
				null,
				currentSize.get(annotation.getAnnotationId()).height - deltaHeight
			);
			annotation._currentX = 0;
			annotation._currentY = deltaHeight;
			setTranslate(0, deltaHeight, annotation.getDomRef());
		}

		// north east
		function gripNE(annotation, deltaWidth, deltaHeight) {
			setSize(
				annotation,
				currentSize.get(annotation.getAnnotationId()).width + deltaWidth,
				currentSize.get(annotation.getAnnotationId()).maxWidth + deltaWidth,
				currentSize.get(annotation.getAnnotationId()).height - deltaHeight
			);
			annotation._currentX = 0;
			annotation._currentY = deltaHeight;
			setTranslate(0, deltaHeight, annotation.getDomRef());
		}

		// east
		function gripE(annotation, deltaWidth, deltaHeight) {
			setSize(
				annotation,
				currentSize.get(annotation.getAnnotationId()).width + deltaWidth,
				currentSize.get(annotation.getAnnotationId()).maxWidth + deltaWidth,
				null
			);
		}

		// south east
		function gripSE(annotation, deltaWidth, deltaHeight) {
			setSize(
				annotation,
				currentSize.get(annotation.getAnnotationId()).width + deltaWidth,
				currentSize.get(annotation.getAnnotationId()).maxWidth + deltaWidth,
				currentSize.get(annotation.getAnnotationId()).height + deltaHeight
			);
		}

		// south
		function gripS(annotation, deltaWidth, deltaHeight) {
			setSize(
				annotation,
				null,
				null,
				currentSize.get(annotation.getAnnotationId()).height + deltaHeight
			);
		}

		// south west
		function gripSW(annotation, deltaWidth, deltaHeight) {
			setSize(
				annotation,
				currentSize.get(annotation.getAnnotationId()).width - deltaWidth,
				currentSize.get(annotation.getAnnotationId()).maxWidth - deltaWidth,
				currentSize.get(annotation.getAnnotationId()).height + deltaHeight
			);
			annotation._currentX = deltaWidth;
			annotation._currentY = 0;
			setTranslate(deltaWidth, 0, annotation.getDomRef());
		}

		// west
		function gripW(annotation, deltaWidth, deltaHeight) {
			setSize(
				annotation,
				currentSize.get(annotation.getAnnotationId()).width - deltaWidth,
				currentSize.get(annotation.getAnnotationId()).maxWidth - deltaWidth,
				null
			);
			annotation._currentX = deltaWidth;
			annotation._currentY = 0;
			setTranslate(deltaWidth, 0, annotation.getDomRef());
		}
	};

	Annotation.prototype.update = function() {
		var annotation = this.getDomRef();
		if (!annotation) {
			return;
		}

		var isVisible = this._updateBlocked();
		if (this.getProperty("display") != isVisible) {
			// Annotation visibility is different from its scene node visibility.
			this.setDisplay(isVisible);
		}

		if (!this.getText()) {
			// Disable showing with empty annotations
			annotation.style.display = this.getDisplay() ? "block" : "none";
		}

		var isSelected = this.getSelected();
		if (this.getProperty("selected") != isSelected) {
			// Annotation selection state is different from annotation node selection state.
			this.setSelected(isSelected);
		}

		// These two elements are node and leader - see AnnotationRenderer for order of elements
		var annotationNodeElement = annotation.childNodes[8];
		var annotationLeaderLine = annotation.childNodes[9];

		if (this.getWidth() && !this._moving) {
			this.setWidth(this.getWidth());
		}
		if (this.getHeight() && !this._moving) {
			this.setHeight(this.getHeight());
		}

		this._resized = false;

		if (!this.getAnimate()) {
			annotation.style.setProperty("--animation-name", "annotationStatic");
		}
		var aNode = this.getTargetNodes()[0];
		var nodeScreen = aNode ? this._getNodeRefScreenCenter(this._viewport, aNode) : { x: 0, y: 0, depth: 0 };
		var viewportRect = this._viewport.getDomRef().getBoundingClientRect();

		// Existence of attachmentNode determines if annotation is relative or fixed.
		if (this.getAttachmentNode()) {
			var attNodeScreen = this._getNodeRefScreenCenter(this._viewport, this.getAttachmentNode());
			if (attNodeScreen.depth > 1) {
				// If node is behind the camera then move annotation out of viewport
				attNodeScreen.x = viewportRect.width + 1000;
			}
			var normRect = this._viewport.normalizeRectangle(attNodeScreen.x, attNodeScreen.y, 0, 0);
			this.setXCoordinate(normRect.x + this.getXOffset());
			this.setYCoordinate(normRect.y + this.getYOffset());
		}

		var annotationNodeScreen = this._viewport.deNormalizeRectangle(this.getXCoordinate(), this.getYCoordinate(), 0, 0);

		if (this.getEditable() && this.getSelected()) {
			if (this._previousState.x === undefined) {
				var annotationRect = annotation.getBoundingClientRect();
				this._previousState.x = annotationRect.x;
				this._previousState.y = annotationRect.y;
			}
			annotation.style.left = this._previousState.x - viewportRect.x + "px";
			annotation.style.top = this._previousState.y - viewportRect.y + "px";
		} else {
			switch (this.getStyle()) {
				case AnnotationStyle.Default:
					annotation.childNodes[0].style.visibility = "hidden";
					annotation.childNodes[1].style.visibility = "hidden";
					annotation.childNodes[2].style.visibility = "hidden";
					annotation.childNodes[3].style.visibility = "hidden";
					annotation.childNodes[4].style.visibility = "hidden";
					break;
				case AnnotationStyle.Explode:
					annotation.childNodes[0].style.visibility = "hidden";
					annotation.childNodes[1].style.visibility = "hidden";
					annotation.childNodes[2].style.visibility = "hidden";
					break;
				case AnnotationStyle.Square:
					annotation.childNodes[0].style.visibility = "hidden";
					annotation.childNodes[1].style.visibility = "hidden";
					annotation.childNodes[2].style.visibility = "hidden";
					break;
				case AnnotationStyle.Random:
					annotation.childNodes[0].style.visibility = "hidden";
					break;
				default:
					break;
			}
		}
		if (aNode) {
			var posX = nodeScreen.x - annotationNodeScreen.x;
			var posY = nodeScreen.y - annotationNodeScreen.y;
			if (this._moving) {
				posX -= this._currentX;
				posY -= this._currentY;
			}
			annotationNodeElement.style.left = posX + "px";
			annotationNodeElement.style.top = posY + "px";

			// this.setLeaderLine(annotationNodeElement, annotation, annotationLeaderLine);

			// config leader line options for different style
			var leaderOptions = new Map([
				[AnnotationStyle.Default, { isElbow: true, toHeight: 0.5 }],
				[AnnotationStyle.Explode, { isElbow: true, toHeight: 0.5 }],
				[AnnotationStyle.Square, { isElbow: false, toHeight: 0.95 }],
				[AnnotationStyle.Random, { isElbow: false, toHeight: 0.5 }],
				[AnnotationStyle.Expand, { isElbow: true, toHeight: 0.5 }]
			]).get(this.getStyle());

			// draw leader line using svg path
			setLeaderLineSVG(annotationNodeElement, annotation, annotation.childNodes[10], {
				isElbow: leaderOptions.isElbow,  // draw elbow or not
				toHeight: leaderOptions.toHeight  // leader line point to height percentage: 0 top, 0.5 middle, 1 bottom
			});
		} else {
			annotationNodeElement.style.visibility = "hidden";
			annotationLeaderLine.style.visibility = "hidden";
		}

		var nodeRef = this.getNodeRef();
		this.setXCoordinate(nodeRef ? nodeRef.position.x : this.getProperty("xCoordinate"));
		this.setYCoordinate(nodeRef ? nodeRef.position.y : this.getProperty("yCoordinate"));
	};

	Annotation.prototype._handleViewportStop = function() {
		setTimeout(function() {
			// Delay clearing of this flag to avoid click event after we stop moving or resizing
			this._moving = false;
			this.update();
		}.bind(this), 300);
		var domRef = this.getDomRef();
		var computedStyle = window.getComputedStyle(domRef);
		var transform = domRef.style.transform;
		domRef.style.transform = "";
		this._currentX = 0;
		this._currentY = 0;
		var x = parseFloat(transform.substring(transform.indexOf("(") + 1, transform.indexOf(",")));
		var y = parseFloat(transform.substring(transform.indexOf(",") + 1, transform.indexOf(")")));
		if (x || y) {
			domRef.style.left = (parseFloat(computedStyle.left) + x) + "px";
			domRef.style.top = (parseFloat(computedStyle.top) + y) + "px";
			this._offsetTop = domRef.offsetTop;
			this._offsetLeft = domRef.offsetLeft;
			var normRect = this._viewport.normalizeRectangle(this._offsetLeft, this._offsetTop, 0, 0);
			this.setXCoordinate(normRect.x);
			this.setYCoordinate(normRect.y);
			this._firePositionChanged(this);
		}
	};

	function setTranslate(x, y, annotation) {
		annotation.style.transform = "translate(" + x + "px, " + y + "px)";
	}

	function setLeaderLineSVG(from, to, leaderLineSVG, options) {
		options = options || {};
		var fromRect = from.getBoundingClientRect();
		var toRect = to.getBoundingClientRect();

		var x1 = fromRect.x - toRect.x + fromRect.width / 2;
		var y1 = fromRect.y - toRect.y + fromRect.height / 2;

		var x2 = x1 < 0 ? 0 : toRect.width;
		var y2 = toRect.height * (options.toHeight || 0.5);

		if (x1 < 0 && !to.classList.contains("leaderlineLeft")) {
			to.classList.remove("leaderlineRight");
			to.classList.add("leaderlineLeft");
		}

		if (x1 >= 0 && !to.classList.contains("leaderlineRight")) {
			to.classList.remove("leaderlineLeft");
			to.classList.add("leaderlineRight");
		}

		var svgLeft = Math.min(x1, x2);
		var svgTop = Math.min(y1, y2);

		leaderLineSVG.style.left = svgLeft + "px";
		leaderLineSVG.style.top = svgTop + "px";

		leaderLineSVG.style.width = Math.abs(x2 - x1) + "px";
		leaderLineSVG.style.height = Math.abs(y2 - y1) + "px";

		var startX = x2 > x1 ? 0 : x1 - x2;
		var startY = y2 > y1 ? 0 : y1 - y2;
		var deltaX = x2 - x1;
		var deltaY = y2 - y1;

		var pathway = "M" + startX + " " + startY + "v" + deltaY + "h" + deltaX;
		if (x1 > 0 && x1 < toRect.width) {
			pathway = "M" + startX + " " + startY + "h" + deltaX + "v" + deltaY + "h-2";
		}

		if (!options.isElbow) {
			// draw straight leaderline
			pathway = "M" + startX + " " + startY + "l" + deltaX + " " + deltaY;
		}

		var leaderLine = leaderLineSVG.childNodes[0];
		if (pathway !== leaderLine.getAttribute("d")) {
			// update leaderLine when path attribute changes
			leaderLine.setAttribute("d", pathway);
			leaderLine.style.setProperty("--stroke-dasharray", leaderLine.getTotalLength());
			leaderLine.style.setProperty("--stroke-dashoffset", leaderLine.getTotalLength());
		}
	}

	Annotation.prototype.setLeaderLine = function(from, to, line) {
		var toRect = to.getBoundingClientRect();

		var fT = from.offsetTop + from.offsetHeight / 2;
		var tT = toRect.height / 2;
		var fL = from.offsetLeft + from.offsetWidth / 2;
		var tL = 0;
		if (fL > tL) {
			tL = toRect.width;
		}
		var topSide = Math.abs(tT - fT);
		var leftSide = Math.abs(tL - fL);
		var height = Math.sqrt(topSide * topSide + leftSide * leftSide);
		var angle = 180 / Math.PI * Math.acos(topSide / height);
		var top, left;
		if (tT > fT) {
			top = (tT - fT) / 2 + fT;
		} else {
			top = (fT - tT) / 2 + tT;
		}
		if (tL > fL) {
			left = (tL - fL) / 2 + fL;
		} else {
			left = (fL - tL) / 2 + tL;
		}

		if ((fT < tT && fL < tL) || (tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)) {
			angle *= -1;
		}
		top -= height / 2;

		line.style.transform = "rotate(" + angle + "deg)";
		line.style.top = top + "px";
		line.style.left = left + "px";
		line.style.height = height + "px";
	};

	/**
	 * Get transformation matrix from the annotation node
	 *
	 * @returns {number[]} The transformation matrix
	 * @public
	 */
	Annotation.prototype.getTransform = function() {
		var annotationNode = this.getNodeRef();
		annotationNode.updateMatrix();
		return sap.ui.vk.TransformationMatrix.convertTo4x3(annotationNode.matrix.elements);
	};

	/**
	 * Set transformation matrix to the annotation node
	 *
	 * @param {number[]} transform The transformation matrix
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Annotation.prototype.setTransform = function(transform) {
		var annotationNode = this.getNodeRef();
		annotationNode.position.set(transform[9], transform[10], transform[11]);
		annotationNode.scale.set(transform[0], transform[4], transform[8]);
		annotationNode.updateMatrix();
		this.setXCoordinate(annotationNode.position.x);
		this.setYCoordinate(annotationNode.position.y);
		this.setWidth(annotationNode.scale.x);
		this.setHeight(annotationNode.scale.y);
		this.update();
		return this;
	};

	Annotation.prototype.updateNodeId = function(nodeId) {
		var annotationNode = this.getNodeRef();
		// NB: nodeId is an sid of the tree node which has the annotation as its content. The node
		// reference from the annotation breaks the requirement that one annotation can be shared by
		// many nodes.
		annotationNode.userData.nodeId = nodeId;
		this.sourceData.annotation.nodeId = nodeId;
		this._viewport.getScene().setNodePersistentId(annotationNode, nodeId);
		return this;
	};

	/**
	 * Adjust annotation size and position so it is placed close to the object it's pointing to.
	 * This method can be used if precise position is not known by the application.
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Annotation.prototype.setInitialOffset = function() {
		var targetNode = this.getTargetNodes().values().next().value;
		var nomPos = { x: 0, y: 0, width: 0.1, height: 0.08 };
		// set initial offset when no x, y provided, and there is attachment node
		if (targetNode && this.getXCoordinate() === 0 && this.getYCoordinate() === 0) {
			var targetNodePos = this._getNodeRefScreenCenter(this._viewport, targetNode);
			var viewportRect = this._viewport.getDomRef().getBoundingClientRect();
			var initialX = targetNodePos.x >= viewportRect.width / 2
				? targetNodePos.x - 150
				: targetNodePos.x + 50;
			var initialY = targetNodePos.y >= viewportRect.height / 2
				? initialY = targetNodePos.y + 20
				: targetNodePos.y - 120;
			nomPos = this._viewport.normalizeRectangle(initialX, initialY, 0, 0);
		}

		if (nomPos.x < -0.5) {
			nomPos.x = -0.5;
		} else if (nomPos.x > 0.5) {
			nomPos.x = 0.4;
		}

		if (nomPos.y < -0.5) {
			nomPos.y = -0.5;
		} else if (nomPos.y > 0.5) {
			nomPos.y = 0.35;
		}

		this.setTransform([0.1, 0, 0, 0, 0.08, 0, 0, 0, 1, nomPos.x, nomPos.y, 0]);
		return this;
	};

	/**
	 * Adjust annotation size to fit text
	 * @param {number} [maxWidth] If set then maximum width of annotation will be limited to this number in pixels.
	 * @param {number} [maxHeight] If set then maximum height of annotation will be limited to this number in pixels.
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Annotation.prototype.fitToText = function(maxWidth, maxHeight) {
		if (this._textDiv == null || this._textDiv.getDomRef() == null) {
			return this;
		}

		var div = document.createElement("div");
		div.style.setProperty("whiteSpace", "nowrap", "important");
		div.style.setProperty("visibility", "hidden", "important");
		div.style.setProperty("position", "absolute");
		if (maxWidth != null) {
			div.style.maxWidth = maxWidth + "px";
		}
		if (maxHeight != null) {
			div.style.maxHeight = maxHeight + "px";
		}
		div.innerHTML = this._textDiv.getDomRef().innerHTML;

		document.body.appendChild(div);
		div.style.setProperty("width", "calc(" + div.clientWidth + "px + 1rem)");
		div.style.setProperty("height", "calc(" + div.clientHeight + "px + 1rem)");
		var normRect = this._viewport.normalizeRectangle(0, 0, div.clientWidth, div.clientHeight);
		document.body.removeChild(div);
		this.setWidth(normRect.width);
		this.setHeight(normRect.height);

		return this;
	};

	Annotation.getStyles = function() {
		var styles = [
			{
				style: AnnotationStyle.Default,
				darkThemeSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABACAYAAADlNHIOAAAABGdBTUEAALGPC/xhBQAACktpQ0NQc1JHQiBJRUM2MTk2Ni0yLjEAAEiJnVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4BUaaISkgChhBgSQOyIqMCIoiKCFRkUccDREZCxIoqFQbH3AXkIKOPgKDZU3g/eGn2z5r03b/avvfY5Z53vnH0+AEZgsESahaoBZEoV8ogAHzw2Lh4ndwMKVCCBA4BAmC0LifSPAgDg+/Hw7IgAH/gCBODNbUAAAG7YBIbhOPx/UBfK5AoAJAwApovE2UIApBAAMnIVMgUAMgoA7KR0mQIAJQAAWx4bFw+AagEAO2WSTwMAdtIk9wIAtihTKgJAowBAJsoUiQDQDgBYl6MUiwCwYAAoypGIcwGwmwBgkqHMlABg7wCAnSkWZAMQGABgohALUwEI9gDAkEdF8AAIMwEojJSveNJXXCHOUwAA8LJki+WSlFQFbiG0xB1cXbl4oDg3Q6xQ2IQJhOkCuQjnZWXKBNLFAJMzAwCARnZEgA/O9+M5O7g6O9s42jp8taj/GvyLiI2L/5c/r8IBAQCE0/VF+7O8rBoA7hgAtvGLlrQdoGUNgNb9L5rJHgDVQoDmq1/Nw+H78fBUhULmZmeXm5trKxELbYWpX/X5nwl/AV/1s+X78fDf14P7ipMFygwFHhHggwuzMrKUcjxbJhCKcZs/HvHfLvzzd0yLECeL5WKpUIxHS8S5EmkKzsuSiiQKSZYUl0j/k4l/s+wPmLxrAGDVfgb2QltQu8oG7JcuILDogCXsAgDkd9+CqdEQBgAxBoOTdw8AMPmb/x1oGQCg2ZIUHACAFxGFC5XynMkYAQCACDRQBTZogz4YgwXYgCO4gDt4gR/MhlCIgjhYAEJIhUyQQy4shVVQBCWwEbZCFeyGWqiHRjgCLXACzsIFuALX4BY8gF4YgOcwCm9gHEEQMsJEWIg2YoCYItaII8JFZiF+SDASgcQhiUgKIkWUyFJkNVKClCNVyF6kHvkeOY6cRS4hPcg9pA8ZRn5DPqAYykDZqB5qhtqhXNQbDUKj0PloCroIzUcL0Q1oJVqDHkKb0bPoFfQW2os+R8cwwOgYBzPEbDAuxsNCsXgsGZNjy7FirAKrwRqxNqwTu4H1YiPYewKJwCLgBBuCOyGQMJcgJCwiLCeUEqoIBwjNhA7CDUIfYZTwmcgk6hKtiW5EPjGWmELMJRYRK4h1xGPE88RbxAHiGxKJxCGZk1xIgaQ4UhppCamUtJPURDpD6iH1k8bIZLI22ZrsQQ4lC8gKchF5O/kQ+TT5OnmA/I5CpxhQHCn+lHiKlFJAqaAcpJyiXKcMUsapalRTqhs1lCqiLqaWUWupbdSr1AHqOE2dZk7zoEXR0miraJW0Rtp52kPaKzqdbkR3pYfTJfSV9Er6YfpFeh/9PUODYcXgMRIYSsYGxn7GGcY9xismk2nG9GLGMxXMDcx65jnmY+Y7FZaKrQpfRaSyQqVapVnlusoLVaqqqaq36gLVfNUK1aOqV1VH1KhqZmo8NYHacrVqteNqd9TG1FnqDuqh6pnqpeoH1S+pD2mQNcw0/DREGoUa+zTOafSzMJYxi8cSslazalnnWQNsEtuczWensUvY37G72aOaGpozNKM18zSrNU9q9nIwjhmHz8nglHGOcG5zPkzRm+I9RTxl/ZTGKdenvNWaquWlJdYq1mrSuqX1QRvX9tNO196k3aL9SIegY6UTrpOrs0vnvM7IVPZU96nCqcVTj0y9r4vqWulG6C7R3afbpTump68XoCfT2653Tm9En6PvpZ+mv0X/lP6wActgloHEYIvBaYNnuCbujWfglXgHPmqoaxhoqDTca9htOG5kbjTXqMCoyeiRMc2Ya5xsvMW43XjUxMAkxGSpSYPJfVOqKdc01XSbaafpWzNzsxiztWYtZkPmWuZ883zzBvOHFkwLT4tFFjUWNy1JllzLdMudltesUCsnq1Sraqur1qi1s7XEeqd1zzTiNNdp0mk10+7YMGy8bXJsGmz6bDm2wbYFti22L+xM7OLtNtl12n22d7LPsK+1f+Cg4TDbocChzeE3RytHoWO1483pzOn+01dMb53+cob1DPGMXTPuOrGcQpzWOrU7fXJ2cZY7NzoPu5i4JLrscLnDZXPDuKXci65EVx/XFa4nXN+7Obsp3I64/epu457uftB9aKb5TPHM2pn9HkYeAo+9Hr2z8FmJs/bM6vU09BR41ng+8TL2EnnVeQ16W3qneR/yfuFj7yP3OebzlufGW8Y744v5BvgW+3b7afjN9avye+xv5J/i3+A/GuAUsCTgTCAxMChwU+Advh5fyK/nj852mb1sdkcQIygyqCroSbBVsDy4LQQNmR2yOeThHNM50jktoRDKD90c+ijMPGxR2I/hpPCw8OrwpxEOEUsjOiNZkQsjD0a+ifKJKot6MNdirnJue7RqdEJ0ffTbGN+Y8pjeWLvYZbFX4nTiJHGt8eT46Pi6+LF5fvO2zhtIcEooSrg933x+3vxLC3QWZCw4uVB1oWDh0URiYkziwcSPglBBjWAsiZ+0I2lUyBNuEz4XeYm2iIbFHuJy8WCyR3J58lCKR8rmlOFUz9SK1BEJT1IleZkWmLY77W16aPr+9ImMmIymTEpmYuZxqYY0XdqRpZ+Vl9Ujs5YVyXoXuS3aumhUHiSvy0ay52e3KtgKmaJLaaFco+zLmZVTnfMuNzr3aJ56njSva7HV4vWLB/P9879dQlgiXNK+1HDpqqV9y7yX7V2OLE9a3r7CeEXhioGVASsPrKKtSl/1U4F9QXnB69Uxq9sK9QpXFvavCVjTUKRSJC+6s9Z97e51hHWSdd3rp6/fvv5zsaj4col9SUXJx1Jh6eVvHL6p/GZiQ/KG7jLnsl0bSRulG29v8tx0oFy9PL+8f3PI5uYt+JbiLa+3Ltx6qWJGxe5ttG3Kbb2VwZWt2022b9z+sSq16la1T3XTDt0d63e83SnaeX2X167G3Xq7S3Z/2CPZc3dvwN7mGrOain2kfTn7ntZG13Z+y/22vk6nrqTu037p/t4DEQc66l3q6w/qHixrQBuUDcOHEg5d+873u9ZGm8a9TZymksNwWHn42feJ398+EnSk/Sj3aOMPpj/sOMY6VtyMNC9uHm1JbeltjWvtOT77eHube9uxH21/3H/C8ET1Sc2TZadopwpPTZzOPz12RnZm5GzK2f72he0PzsWeu9kR3tF9Puj8xQv+F851eneevuhx8cQlt0vHL3Mvt1xxvtLc5dR17Cenn451O3c3X3W52nrN9Vpbz8yeU9c9r5+94Xvjwk3+zSu35tzquT339t07CXd674ruDt3LuPfyfs798QcrHxIfFj9Se1TxWPdxzc+WPzf1Ovee7PPt63oS+eRBv7D/+T+y//FxoPAp82nFoMFg/ZDj0Ilh/+Frz+Y9G3guez4+UvSL+i87Xli8+OFXr1+7RmNHB17KX078VvpK+9X+1zNet4+FjT1+k/lm/G3xO+13B95z33d+iPkwOJ77kfyx8pPlp7bPQZ8fTmROTPwTA5jz/IzFdaUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAALEwAACxMBAJqcGAAAEFRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMC1jMDAwIDc5LjE3MWMyN2ZhYiwgMjAyMi8wOC8xNi0yMjozNTo0MSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAzLTI2VDExOjEwOjAyKzEzOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTEyLTE1VDE0OjM2OjQ5KzEzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0xMi0xNVQxNDozNjo0OSsxMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzFjMjU4NjMtOTkwNi00ZjdhLWIxODUtYjE0ZjM2YTU3NGY2IiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6NjRmMzNiZmItNGYxZi00YTQyLTgzY2ItY2JhZjRmMWI0Njc0IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZWU1NTEwZjgtNmI2ZC00NDJhLTkwOTMtMzQ4NmNlNDA0ZDU0IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249Ijk2IiBleGlmOlBpeGVsWURpbWVuc2lvbj0iNjQiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxMToxMDowMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjEyYTg4Mjg4LWYzOWItNDU4My04M2FlLTk0NTExY2FjZGU5OCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDoxNTozMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmEwMDkzM2E5LTA4NzctNDRlYi04YThmLTZlZDYyZjA1ZDhlZCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlmZGE3OTBiLTZlODQtNGVmNS1hNGYxLTg0ZWFiMGIwNWJjOCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFiMmM1Y2ExLWUzYTQtNGViMi1hODg5LTBmNzUwOWVlYmJhNiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBpbWFnZS9wbmcgdG8gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gaW1hZ2UvcG5nIHRvIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZiOTY1MjJmLTA3OTYtNDZhMS1iY2JjLTM2ZmJhYzIyNmQ4OSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjFjMjlhMTg2LWMyOTYtNDNkZC1iM2EwLTZiMzdjODQ3ZmI0OCIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxNDozNjo0OSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjMxYzI1ODYzLTk5MDYtNGY3YS1iMTg1LWIxNGYzNmE1NzRmNiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxNDozNjo0OSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFjMjlhMTg2LWMyOTYtNDNkZC1iM2EwLTZiMzdjODQ3ZmI0OCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjIyOTFjN2Q1LTdiMGYtNmI0YS1iMDNmLTZjMjlkMjBmZGI5MCIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIvPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6MjI5MWM3ZDUtN2IwZi02YjRhLWIwM2YtNmMyOWQyMGZkYjkwPC9yZGY6bGk+IDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjhhZDQ0NTBlLTdmZjUtYmU0Mi05ZjUwLThhNGQwZWE1ODJhZTwvcmRmOmxpPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pt0YsxsAAAKNSURBVHic7duxbtpAHAbwz7TpgBu17hLaJRt5AqRsvELeoKO9VfILWDxCN1tiSN+AV2CrxOaRrUtJljqlrYdK5TIAqmPOJiS2vrP5/6QT5AjH6f+Fu2AbSykFwdNhT+DYSQBkEgDZS01f2aZg1TURg9VaD10AGI1Gp7r+IAie+3qNU1KLX1WMb2n+C1I4zr/0Q1VSJ9kDyLRLUM732mfRHB+qHlDeAWQSAJkEQCYBkEkAZBIAmQRAJgGQSQBkEgCZBEAmAZBJAGSUACzLep9vZf1hGHZt2+5lx7BtuxeGYbfseU3wmMPRlVNKLYB14bb3849leZ6XzufzF47jnCVJcus4zpnrun88z0v3jWe6x5wRq+18QL5g+wo4HA7fzWazV4PB4O90Ov2xb7waZM8HtPOMWNky4rpuulqt4LpuypibhnpCe8C4AJRSi23LPxZFUbfT6SCKoi5jbhrWgW2HcQEU8X3/NI7jkzRNb+I4PvF9X3u1QtNQNuEy+aVHKbUIw7A7Ho/t5XJ5AwBJktzatt3r9/v/thtxU1E34QZ67ia885zGLEFtJQGQSQBkEgCZBEAmAZBJAGQSAJkEQCYBkEkAZBIAmQRAJl/Sezo5GtoGRd8Tfq3rD4Lgd73TMU9JLSoZv2gJKvz9Sl61Waqsx84SpHsHHGORy9RaD9kDyCQAMgmATAIgkwDITA7gEsA1gLtMu970t4bJAXgALgB8AnC+ub3Y9LeG7oOYKe6wLvqXTN9HAJ8BvCXMpwo7H8RMD+AcwM9M3xsA3za3TdWog3FXBT8felm4Se0B466Ozpjg/3o/wbr43uZ+a5i8BF1iXfCrTN8EQAjgK2E+tTA5gKNg+h7QehIAmQRAdg/eDtBlcYbovwAAAABJRU5ErkJggg==",
				lightThemeSrc: "data:image/png;base64,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Y0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAALEwAACxMBAJqcGAAAEAhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMC1jMDAwIDc5LjE3MWMyN2ZhYiwgMjAyMi8wOC8xNi0yMjozNTo0MSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAzLTI2VDExOjEwOjAyKzEzOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTEyLTE1VDEwOjEzOjE0KzEzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0xMi0xNVQxMDoxMzoxNCsxMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTJjODA3YzItZmRmZC00NTk1LTlkZjMtY2FmYzRiNmQxMWYyIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YmM5ZjBiNTItOTcyYi04MjQ2LThhZjgtNmRlMGQwNGM2ZTllIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZWU1NTEwZjgtNmI2ZC00NDJhLTkwOTMtMzQ4NmNlNDA0ZDU0IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249Ijk2IiBleGlmOlBpeGVsWURpbWVuc2lvbj0iNjQiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxMToxMDowMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjEyYTg4Mjg4LWYzOWItNDU4My04M2FlLTk0NTExY2FjZGU5OCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDoxNTozMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmEwMDkzM2E5LTA4NzctNDRlYi04YThmLTZlZDYyZjA1ZDhlZCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlmZGE3OTBiLTZlODQtNGVmNS1hNGYxLTg0ZWFiMGIwNWJjOCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFiMmM1Y2ExLWUzYTQtNGViMi1hODg5LTBmNzUwOWVlYmJhNiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBpbWFnZS9wbmcgdG8gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gaW1hZ2UvcG5nIHRvIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZiOTY1MjJmLTA3OTYtNDZhMS1iY2JjLTM2ZmJhYzIyNmQ4OSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZkNTdlZDg5LWMxZDgtNGFkNS1iNTgzLTU0NWI1N2QyM2RjNCIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxMDoxMzoxNCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjUyYzgwN2MyLWZkZmQtNDU5NS05ZGYzLWNhZmM0YjZkMTFmMiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxMDoxMzoxNCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjZkNTdlZDg5LWMxZDgtNGFkNS1iNTgzLTU0NWI1N2QyM2RjNCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjIyOTFjN2Q1LTdiMGYtNmI0YS1iMDNmLTZjMjlkMjBmZGI5MCIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIvPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6OGFkNDQ1MGUtN2ZmNS1iZTQyLTlmNTAtOGE0ZDBlYTU4MmFlPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+VYU64wAAArlJREFUeJztm7GO2kAQhmeQlVQJiCaRUlyRB7DQUvgxqNKliZQyZXr6dFSuTpborvKDsLL8ACmuI8VF5tIkwWJSBC6cwZC7W/jXMJ9kIUbyajyfPWt5bRYRUnC00AmcOyoAjAoAE1QDzFw7KYgIHzYd/zh0PTYELHn+1IFPiLpa/HIxOFfvgphZzvFMfyiu6qRzAJi6FnRHv99/cYxEmsBkMvnheky9AsCoADAqAIwKAKMCwKgAMCoAjAoAowLAqAAwKgCMCgCjAsDsfRp6CKy1t9WYMeZlXTzP8/dlWX4xxrxeG2MaBMHnMAzHdfu5z9w9EAGr4lhrb6uF2la4MAzHWZa9tdZeG2MurLXXrVYrDsNwvG8832lMC+r1ekNmzq2135g57/V6Q3ROLoBcAbtYbyfVszkIgsv5fB4FQXB5/Mw22bVgX0d1GdM7AbtaSFmWH4hIlr/p0ZKq4aFrwtuENaYFZVk2FJHQGPNKRMIsy4bonFzg3RVQvaNZ3QUtFouPxpg3y9iFtXaa5/nX1UTcVPa+lqKL8v9YX5R/zGsp2/ZpTAs6VVQAGBUARgWAUQFgVAAYFQBGBYBRAWBUABgVAEYFgFEBYPQjvUeiT0NPhK0LMsz8bFtcRH4fNh3/qKuFK+pWxOo+Qj7H1uTkg+w6NgRo/7/PoeuhcwAYFQBGBYBRAWBUABhvBTBzl5lHzDxl5p/L3xEzd9G5OUVEvNyIaBRFkSRJIkVRSJIkEkWRENEIndsTjkk2YuikdiQ7TZJE1kmSRIhois7NpYCNh3G+wMzzoiiCdrt9F5vNZtTpdEry8J3W/0Ua9DDuJk3Te4Hl/xsR4aZu1YP0+Uy6iuP4ExHRYDCgNE0pjmMioitsWm7xuQV1iWhIRO+IqENEBf0t/lBEvsMSc4y3As4Fn+eAs0AFgFEBYP4AGCek2ueplPYAAAAASUVORK5CYII="
			}, {
				style: AnnotationStyle.Explode,
				darkThemeSrc: "data:image/png;base64,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Y0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAALEwAACxMBAJqcGAAAEFRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMC1jMDAwIDc5LjE3MWMyN2ZhYiwgMjAyMi8wOC8xNi0yMjozNTo0MSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAzLTI2VDExOjEwOjAyKzEzOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTEyLTE1VDE0OjMzOjQ3KzEzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0xMi0xNVQxNDozMzo0NysxMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MGQyNDYxZGYtZjhjNi00ZDgwLWFiZmQtMjI1ZGE2N2RjZGYzIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MDZhMDRlNzItMzI2Zi01MTQyLWI2NDUtYTkyNjEyMzJmNmJiIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZWU1NTEwZjgtNmI2ZC00NDJhLTkwOTMtMzQ4NmNlNDA0ZDU0IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249Ijk2IiBleGlmOlBpeGVsWURpbWVuc2lvbj0iNjQiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxMToxMDowMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjEyYTg4Mjg4LWYzOWItNDU4My04M2FlLTk0NTExY2FjZGU5OCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDoxNTozMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmEwMDkzM2E5LTA4NzctNDRlYi04YThmLTZlZDYyZjA1ZDhlZCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlmZGE3OTBiLTZlODQtNGVmNS1hNGYxLTg0ZWFiMGIwNWJjOCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFiMmM1Y2ExLWUzYTQtNGViMi1hODg5LTBmNzUwOWVlYmJhNiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBpbWFnZS9wbmcgdG8gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gaW1hZ2UvcG5nIHRvIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZiOTY1MjJmLTA3OTYtNDZhMS1iY2JjLTM2ZmJhYzIyNmQ4OSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjcwYmZhZDkwLWI1OTUtNDU5My05ZmI0LTFkYTE1ZmZkZDczYiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxNDozMzo0NysxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjBkMjQ2MWRmLWY4YzYtNGQ4MC1hYmZkLTIyNWRhNjdkY2RmMyIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxNDozMzo0NysxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjcwYmZhZDkwLWI1OTUtNDU5My05ZmI0LTFkYTE1ZmZkZDczYiIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjIyOTFjN2Q1LTdiMGYtNmI0YS1iMDNmLTZjMjlkMjBmZGI5MCIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIvPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6MjI5MWM3ZDUtN2IwZi02YjRhLWIwM2YtNmMyOWQyMGZkYjkwPC9yZGY6bGk+IDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjhhZDQ0NTBlLTdmZjUtYmU0Mi05ZjUwLThhNGQwZWE1ODJhZTwvcmRmOmxpPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ptfq2U8AAAKSSURBVHic7ZtBbqMwFEA/melIg+mC2TQzB8gNso66rtprwJoLoNwCpJyiPUFWLLKDXQ7QtJsiZTyONNLEs4giVcgQEoy+Hf6TkCIn+Vj/xf4QbEdKCQQeI+wODB0SgAwJQOaroq2pKDh9dcRges2HSgDM5/NbVXscx13PZx0NufitI76juAqSMMxf+rloyRPVAGSUU1CF1957YQ+/dAekEYAMCUBGJYAKcDu05IlGADIkABkSgAwJQIYEIEMCkCEByJAAZEgAMiQAGRQBjuP8rB5N7UmSuIyx8ecYjLFxkiRu0/dsoM3f0dqRUm4ADok7vq6+95kwDMV6vf7i+/5dWZbvvu/fBUHwJwxDcSqe6aieiFXp7XlANWGnEjibzX6sVqtv0+n073K5/DgVrweu/3lA0zQSBIHY7/cQBIHA6FsfGCdASrk5HtX30jR1R6MRpGnqYvStD4wTUEcURbd5nt8IId7yPL+Joki5WsE2UIpwE9WpR0q5SZLEXSwWbLvdvgEAlGX5zhgbTyaTf8dCbCuoRdhCrr8IDw0SgAwJQIYEIEMCkCEByJAAZEgAMiQAGRKAjEoAbRxuh5Y80QhAhgQgQ5v0Loc26V0DdfuEPVV7HMe83+6YR0MutMSvm4JqP6/lrHbRlI8nAHjpErxuj1jdMUTqcvEEAM8A8NglONWAy3kBDRJIQDc6SyAB3ekkgQTo4WIJJEAfF0kwVkCWZfeccwGHy0AJAJJzLrIsu0fuWhNnS2izMAsFzrnwPO+7on3neZ7pa0Mf4SDh5H2CsQLA/hvCVhJsFWAbtRKMW5zbEhtGQCuMLcKc89057bZirICiKB6qyeac74qieMDqUx+YXAMGgbEjYCiQAGRIADL/AeLd68Q29Hp3AAAAAElFTkSuQmCC",
				lightThemeSrc: "data:image/png;base64,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Y0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAALEwAACxMBAJqcGAAAEAhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMC1jMDAwIDc5LjE3MWMyN2ZhYiwgMjAyMi8wOC8xNi0yMjozNTo0MSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAzLTI2VDExOjEwOjAyKzEzOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTEyLTE1VDEwOjE0OjIxKzEzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0xMi0xNVQxMDoxNDoyMSsxMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzViZDEyMDQtNjA1MS00YTJhLTliY2EtYjQ3MDVjMmRmMDhiIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZWQ2M2JhNzMtNjkxMC0yODQwLTgxNGEtN2U2ZGI0NTE3NjhmIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZWU1NTEwZjgtNmI2ZC00NDJhLTkwOTMtMzQ4NmNlNDA0ZDU0IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249Ijk2IiBleGlmOlBpeGVsWURpbWVuc2lvbj0iNjQiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxMToxMDowMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjEyYTg4Mjg4LWYzOWItNDU4My04M2FlLTk0NTExY2FjZGU5OCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDoxNTozMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmEwMDkzM2E5LTA4NzctNDRlYi04YThmLTZlZDYyZjA1ZDhlZCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlmZGE3OTBiLTZlODQtNGVmNS1hNGYxLTg0ZWFiMGIwNWJjOCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFiMmM1Y2ExLWUzYTQtNGViMi1hODg5LTBmNzUwOWVlYmJhNiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBpbWFnZS9wbmcgdG8gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gaW1hZ2UvcG5nIHRvIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZiOTY1MjJmLTA3OTYtNDZhMS1iY2JjLTM2ZmJhYzIyNmQ4OSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjhiNTE0YjFiLWE5N2ItNGQ3NS1iNzU0LThjNjk4ZDlhNmU1ZSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxMDoxNDoyMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjM1YmQxMjA0LTYwNTEtNGEyYS05YmNhLWI0NzA1YzJkZjA4YiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxMDoxNDoyMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhiNTE0YjFiLWE5N2ItNGQ3NS1iNzU0LThjNjk4ZDlhNmU1ZSIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjIyOTFjN2Q1LTdiMGYtNmI0YS1iMDNmLTZjMjlkMjBmZGI5MCIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIvPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6OGFkNDQ1MGUtN2ZmNS1iZTQyLTlmNTAtOGE0ZDBlYTU4MmFlPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+RoRIaQAAAqNJREFUeJztm7GO00AQhuePLKhA6Jo7ieIewbI2BS+RK+koQOIR6N3T5QHuiuuo0PEaWVl+AAq6XHESOhqOWB4KDESO18nF68w6nk+yrGyczWQ+z+7KjsHMpMgxkQ5g7KgAYVSAMFG9AYBzUmBm9BtOePSdjw0BFU+7dnxEuHLx4KNz1FdBAHiMZ/pj8ZUnnQOEcQ1B/5hOp88OEcgQWCwWP3z3qRUgjAoQZkOATsC74StPWgHCqABhVIAwKkAYFSCMChBGBQijAoRRAcKoAGG2Xg3tA2vtfb3NGPPc1Z7n+ZuiKD4aY87W+lhGUfQhjuNr1+f8R+6fjRsydfq8HG2tvV9PVP31OlmWpWVZvjXGnFtrv00mk6skSdK2/nwz6svRSZKkAHJr7S2AvJ78oSIyBLWxPpzUz+Yoii5Xq9WrKIouDx9ZPwQnoG0IKYriHRFxtf98sKB6ZDBDUJZlKTPHxphTZo6zLEulY/JBcBVQX9H8XQWVZfneGPOyaju31i7zPP8ax/G1TKR+EF0FDY1Rr4KOFRUgjAoQRgUIowKEUQHCqABhVIAwKkAYFSDMhoC2Z6KU//jKk1aAMCpAGH1Ib0/0Ib0jofGGDIAnTe3M/KvfcMLDlQtfuCrgwbGNEWcuAMy6dt74jJhr6/plQ6QlFxdEdNNVgs4Be8LMX8iDBBXQAR8SVEBHukpQAR7oIkEFeGJfCcEKAHACYA5gCeBntZ8DOJGOzcVeEpg5yI2I5kTEDdtcOrYdYp9Vsc62Hbv1n3FSAFgS0WnDW7fMfNbQHhRVBdwQ0UVVGc3HBSxgRc2XSgpHe8g4JYT8Q+6ouQLuhlABuxLsJExEnx7ZPkhCroC02r8mohdE9J3+JD9tPHqgBDsHjIWQh6BRoAKEUQHC/AatzyrxOPjbVwAAAABJRU5ErkJggg=="
			}, {
				style: AnnotationStyle.Square,
				darkThemeSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABACAYAAADlNHIOAAAABGdBTUEAALGPC/xhBQAACktpQ0NQc1JHQiBJRUM2MTk2Ni0yLjEAAEiJnVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4BUaaISkgChhBgSQOyIqMCIoiKCFRkUccDREZCxIoqFQbH3AXkIKOPgKDZU3g/eGn2z5r03b/avvfY5Z53vnH0+AEZgsESahaoBZEoV8ogAHzw2Lh4ndwMKVCCBA4BAmC0LifSPAgDg+/Hw7IgAH/gCBODNbUAAAG7YBIbhOPx/UBfK5AoAJAwApovE2UIApBAAMnIVMgUAMgoA7KR0mQIAJQAAWx4bFw+AagEAO2WSTwMAdtIk9wIAtihTKgJAowBAJsoUiQDQDgBYl6MUiwCwYAAoypGIcwGwmwBgkqHMlABg7wCAnSkWZAMQGABgohALUwEI9gDAkEdF8AAIMwEojJSveNJXXCHOUwAA8LJki+WSlFQFbiG0xB1cXbl4oDg3Q6xQ2IQJhOkCuQjnZWXKBNLFAJMzAwCARnZEgA/O9+M5O7g6O9s42jp8taj/GvyLiI2L/5c/r8IBAQCE0/VF+7O8rBoA7hgAtvGLlrQdoGUNgNb9L5rJHgDVQoDmq1/Nw+H78fBUhULmZmeXm5trKxELbYWpX/X5nwl/AV/1s+X78fDf14P7ipMFygwFHhHggwuzMrKUcjxbJhCKcZs/HvHfLvzzd0yLECeL5WKpUIxHS8S5EmkKzsuSiiQKSZYUl0j/k4l/s+wPmLxrAGDVfgb2QltQu8oG7JcuILDogCXsAgDkd9+CqdEQBgAxBoOTdw8AMPmb/x1oGQCg2ZIUHACAFxGFC5XynMkYAQCACDRQBTZogz4YgwXYgCO4gDt4gR/MhlCIgjhYAEJIhUyQQy4shVVQBCWwEbZCFeyGWqiHRjgCLXACzsIFuALX4BY8gF4YgOcwCm9gHEEQMsJEWIg2YoCYItaII8JFZiF+SDASgcQhiUgKIkWUyFJkNVKClCNVyF6kHvkeOY6cRS4hPcg9pA8ZRn5DPqAYykDZqB5qhtqhXNQbDUKj0PloCroIzUcL0Q1oJVqDHkKb0bPoFfQW2os+R8cwwOgYBzPEbDAuxsNCsXgsGZNjy7FirAKrwRqxNqwTu4H1YiPYewKJwCLgBBuCOyGQMJcgJCwiLCeUEqoIBwjNhA7CDUIfYZTwmcgk6hKtiW5EPjGWmELMJRYRK4h1xGPE88RbxAHiGxKJxCGZk1xIgaQ4UhppCamUtJPURDpD6iH1k8bIZLI22ZrsQQ4lC8gKchF5O/kQ+TT5OnmA/I5CpxhQHCn+lHiKlFJAqaAcpJyiXKcMUsapalRTqhs1lCqiLqaWUWupbdSr1AHqOE2dZk7zoEXR0miraJW0Rtp52kPaKzqdbkR3pYfTJfSV9Er6YfpFeh/9PUODYcXgMRIYSsYGxn7GGcY9xismk2nG9GLGMxXMDcx65jnmY+Y7FZaKrQpfRaSyQqVapVnlusoLVaqqqaq36gLVfNUK1aOqV1VH1KhqZmo8NYHacrVqteNqd9TG1FnqDuqh6pnqpeoH1S+pD2mQNcw0/DREGoUa+zTOafSzMJYxi8cSslazalnnWQNsEtuczWensUvY37G72aOaGpozNKM18zSrNU9q9nIwjhmHz8nglHGOcG5zPkzRm+I9RTxl/ZTGKdenvNWaquWlJdYq1mrSuqX1QRvX9tNO196k3aL9SIegY6UTrpOrs0vnvM7IVPZU96nCqcVTj0y9r4vqWulG6C7R3afbpTump68XoCfT2653Tm9En6PvpZ+mv0X/lP6wActgloHEYIvBaYNnuCbujWfglXgHPmqoaxhoqDTca9htOG5kbjTXqMCoyeiRMc2Ya5xsvMW43XjUxMAkxGSpSYPJfVOqKdc01XSbaafpWzNzsxiztWYtZkPmWuZ883zzBvOHFkwLT4tFFjUWNy1JllzLdMudltesUCsnq1Sraqur1qi1s7XEeqd1zzTiNNdp0mk10+7YMGy8bXJsGmz6bDm2wbYFti22L+xM7OLtNtl12n22d7LPsK+1f+Cg4TDbocChzeE3RytHoWO1483pzOn+01dMb53+cob1DPGMXTPuOrGcQpzWOrU7fXJ2cZY7NzoPu5i4JLrscLnDZXPDuKXci65EVx/XFa4nXN+7Obsp3I64/epu457uftB9aKb5TPHM2pn9HkYeAo+9Hr2z8FmJs/bM6vU09BR41ng+8TL2EnnVeQ16W3qneR/yfuFj7yP3OebzlufGW8Y744v5BvgW+3b7afjN9avye+xv5J/i3+A/GuAUsCTgTCAxMChwU+Advh5fyK/nj852mb1sdkcQIygyqCroSbBVsDy4LQQNmR2yOeThHNM50jktoRDKD90c+ijMPGxR2I/hpPCw8OrwpxEOEUsjOiNZkQsjD0a+ifKJKot6MNdirnJue7RqdEJ0ffTbGN+Y8pjeWLvYZbFX4nTiJHGt8eT46Pi6+LF5fvO2zhtIcEooSrg933x+3vxLC3QWZCw4uVB1oWDh0URiYkziwcSPglBBjWAsiZ+0I2lUyBNuEz4XeYm2iIbFHuJy8WCyR3J58lCKR8rmlOFUz9SK1BEJT1IleZkWmLY77W16aPr+9ImMmIymTEpmYuZxqYY0XdqRpZ+Vl9Ujs5YVyXoXuS3aumhUHiSvy0ay52e3KtgKmaJLaaFco+zLmZVTnfMuNzr3aJ56njSva7HV4vWLB/P9879dQlgiXNK+1HDpqqV9y7yX7V2OLE9a3r7CeEXhioGVASsPrKKtSl/1U4F9QXnB69Uxq9sK9QpXFvavCVjTUKRSJC+6s9Z97e51hHWSdd3rp6/fvv5zsaj4col9SUXJx1Jh6eVvHL6p/GZiQ/KG7jLnsl0bSRulG29v8tx0oFy9PL+8f3PI5uYt+JbiLa+3Ltx6qWJGxe5ttG3Kbb2VwZWt2022b9z+sSq16la1T3XTDt0d63e83SnaeX2X167G3Xq7S3Z/2CPZc3dvwN7mGrOain2kfTn7ntZG13Z+y/22vk6nrqTu037p/t4DEQc66l3q6w/qHixrQBuUDcOHEg5d+873u9ZGm8a9TZymksNwWHn42feJ398+EnSk/Sj3aOMPpj/sOMY6VtyMNC9uHm1JbeltjWvtOT77eHube9uxH21/3H/C8ET1Sc2TZadopwpPTZzOPz12RnZm5GzK2f72he0PzsWeu9kR3tF9Puj8xQv+F851eneevuhx8cQlt0vHL3Mvt1xxvtLc5dR17Cenn451O3c3X3W52nrN9Vpbz8yeU9c9r5+94Xvjwk3+zSu35tzquT339t07CXd674ruDt3LuPfyfs798QcrHxIfFj9Se1TxWPdxzc+WPzf1Ovee7PPt63oS+eRBv7D/+T+y//FxoPAp82nFoMFg/ZDj0Ilh/+Frz+Y9G3guez4+UvSL+i87Xli8+OFXr1+7RmNHB17KX078VvpK+9X+1zNet4+FjT1+k/lm/G3xO+13B95z33d+iPkwOJ77kfyx8pPlp7bPQZ8fTmROTPwTA5jz/IzFdaUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAALEwAACxMBAJqcGAAAEFRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMC1jMDAwIDc5LjE3MWMyN2ZhYiwgMjAyMi8wOC8xNi0yMjozNTo0MSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAzLTI2VDExOjEwOjAyKzEzOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTEyLTE1VDE0OjMwOjI2KzEzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0xMi0xNVQxNDozMDoyNisxMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDVmM2Q0YmQtMjFiNi00NDc2LTlhZTEtOTYxNGY5OTgzZWQwIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6NTMwMmI4MGEtODllNC0wNzQwLTk0NjktZjg1OWEzYjk1MjNhIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZWU1NTEwZjgtNmI2ZC00NDJhLTkwOTMtMzQ4NmNlNDA0ZDU0IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249Ijk2IiBleGlmOlBpeGVsWURpbWVuc2lvbj0iNjQiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxMToxMDowMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjEyYTg4Mjg4LWYzOWItNDU4My04M2FlLTk0NTExY2FjZGU5OCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDoxNTozMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmEwMDkzM2E5LTA4NzctNDRlYi04YThmLTZlZDYyZjA1ZDhlZCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlmZGE3OTBiLTZlODQtNGVmNS1hNGYxLTg0ZWFiMGIwNWJjOCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFiMmM1Y2ExLWUzYTQtNGViMi1hODg5LTBmNzUwOWVlYmJhNiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBpbWFnZS9wbmcgdG8gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gaW1hZ2UvcG5nIHRvIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZiOTY1MjJmLTA3OTYtNDZhMS1iY2JjLTM2ZmJhYzIyNmQ4OSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlmZTZlYzA5LTk4MDctNDE5OC1hNWZlLTUxNmZkOTg3ZDNiMyIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxNDozMDoyNisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjQ1ZjNkNGJkLTIxYjYtNDQ3Ni05YWUxLTk2MTRmOTk4M2VkMCIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxNDozMDoyNisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjlmZTZlYzA5LTk4MDctNDE5OC1hNWZlLTUxNmZkOTg3ZDNiMyIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjIyOTFjN2Q1LTdiMGYtNmI0YS1iMDNmLTZjMjlkMjBmZGI5MCIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIvPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6MjI5MWM3ZDUtN2IwZi02YjRhLWIwM2YtNmMyOWQyMGZkYjkwPC9yZGY6bGk+IDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjhhZDQ0NTBlLTdmZjUtYmU0Mi05ZjUwLThhNGQwZWE1ODJhZTwvcmRmOmxpPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PoTh4bYAAAI7SURBVHic7dtPbptAGAXwh9t0wTQLuonTA/gGXvsEyTECay6AuAVUPkV7Aq+9Y+kD1MmmSE7DIlI9XVSWKMX/MPQZ5/0kSw4m49H3NDM2YxxrLYRnwO7AW6cAyBQA2Xt2By7WF6d+cX2wTvlPjQAyBUCmAMgUAJkC6MbdoSc6+ibcujsAXwHcA/i272SNgHYdVXxAAbTp6OIDCqAtjYoPKIA2NC4+oABOdVLxAV0LaqZ8nefBNi4+UB+APpcep3HxgS0jII7j67rjURT9POXN+iiO44/VY9Etnttqv+6LmAXg1Jwrf2ulTlqEyQ5ZhL933ov++Nx2gxoBZAqATAGQKQAyBUCmAMgUAJkCIFMAZAqATAGQKQAyBUBGCcBxnNvqY9fxJElcY8yw3IYxZpgkibvr//qAsidsrV0Cfwq3eV59rSwIgmKxWLzzPO8mz/Mnz/NufN9/CYKg2NfeuTtkR6yz/YBqwfYVcDKZfJrP5x/G4/HrbDb7sa+9DpT3Ay5zR2zXNOL7frFer+H7fsHoWxfOLgBr7XLzqL6Wpqk7GAyQpqnL6FsXzi6AbcIwvM6y7Kooiscsy67CMKz95UbfnN0Ps6pTj7V2mSSJO51OzWq1egSAPM+fjDHD0Wj0a7MQ9xV1Ee6hy1+E3xoFQKYAyBQAmQIgUwBkCoBMAZApADIFQKYAyBQAmQIg0016zelq6CXYdp/wP/fGArpPuCyKolba3zYFyWFOnoLqRoDm//9IawCZAiBTAGS/ASn/tOZ3KbsPAAAAAElFTkSuQmCC",
				lightThemeSrc: "data:image/png;base64,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Y0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAALEwAACxMBAJqcGAAAEAhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMC1jMDAwIDc5LjE3MWMyN2ZhYiwgMjAyMi8wOC8xNi0yMjozNTo0MSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAzLTI2VDExOjEwOjAyKzEzOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTEyLTE1VDEwOjA0OjMzKzEzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0xMi0xNVQxMDowNDozMysxMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6YWJhM2M1ODQtYjYyMS00ZWMyLWI0ZTUtMmU0MGZjZmIyYTM5IiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MjZhZGY2ODMtOGU3ZC05MDQyLTg0NDMtYTkwMDZjZWQwYTMwIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZWU1NTEwZjgtNmI2ZC00NDJhLTkwOTMtMzQ4NmNlNDA0ZDU0IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249Ijk2IiBleGlmOlBpeGVsWURpbWVuc2lvbj0iNjQiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxMToxMDowMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjEyYTg4Mjg4LWYzOWItNDU4My04M2FlLTk0NTExY2FjZGU5OCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDoxNTozMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmEwMDkzM2E5LTA4NzctNDRlYi04YThmLTZlZDYyZjA1ZDhlZCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlmZGE3OTBiLTZlODQtNGVmNS1hNGYxLTg0ZWFiMGIwNWJjOCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFiMmM1Y2ExLWUzYTQtNGViMi1hODg5LTBmNzUwOWVlYmJhNiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBpbWFnZS9wbmcgdG8gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gaW1hZ2UvcG5nIHRvIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZiOTY1MjJmLTA3OTYtNDZhMS1iY2JjLTM2ZmJhYzIyNmQ4OSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVjNmI5ODJjLWNjMzYtNGQwNi1hNGY4LTljNDMyZTM0MDA4ZSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxMDowNDozMysxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFiYTNjNTg0LWI2MjEtNGVjMi1iNGU1LTJlNDBmY2ZiMmEzOSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxMDowNDozMysxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmVjNmI5ODJjLWNjMzYtNGQwNi1hNGY4LTljNDMyZTM0MDA4ZSIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjIyOTFjN2Q1LTdiMGYtNmI0YS1iMDNmLTZjMjlkMjBmZGI5MCIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIvPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6OGFkNDQ1MGUtN2ZmNS1iZTQyLTlmNTAtOGE0ZDBlYTU4MmFlPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+bzx8FQAAAe1JREFUeJztnDFSwkAYhd9zHC0sLDiDB7C0t8VDWKjjRTyAjVpwCG3tPYRnoKPRwmdB4ihuDIbgA3zfTAaygd2d/yO7yS4bSkLwseWuwH8nAsxEgJltdwU2ljuWO9cz8fNuzgAzEWAmAsxEgJkIWAIkh3N/NnfC3SDZdGgI4B7AiaSHtnxyBvTLr4IPRECffAQfwFzBByKgLzoFH4iAPugcfCACFmWh4AO5CurGp3EenpeDP29cvw3GkQ2DSOED3X7Z7fTLr2kaDd0tFiy9LlLYOkJyp5D8Ur9ZtAX51gSRlKTGu4wwpa84pRM2EwFmIsBMBJiJADMRYCYCzESAmQgwEwFmIsBMBJiJADMRYCYCzFgEkNTs1pJ+SnIyk8eE5OlP31sHLOsD6omM0qRGaZJD0ojkAcmxpAHJMYBrSaO2/FYd64zYbFltZZN8BHAE4EnScVt+y2RjZ8RampEbTOt888fVWhorJ0AS661w+ALAW/W6EaycgCZIXgE4lLQH4LDaX3tWbpHebNMjidXVzqWk/SptUF0FPdcd8bqSv6V0ZGM74f9GBJiJADMRYCYCzESAmQgwEwFmIsBMBJiJADMRYCYCzESAmQgwU5yQaVgbm3XCS6BpRuyllPjDQ4pCR/KsCDPpA8xEgJkIMPMOoaG9maMqnmAAAAAASUVORK5CYII="
			}, {
				style: AnnotationStyle.Random,
				darkThemeSrc: "data:image/png;base64,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Y0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAALEwAACxMBAJqcGAAAEFRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMC1jMDAwIDc5LjE3MWMyN2ZhYiwgMjAyMi8wOC8xNi0yMjozNTo0MSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAzLTI2VDExOjEwOjAyKzEzOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTEyLTE1VDE0OjI5OjMzKzEzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0xMi0xNVQxNDoyOTozMysxMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZWU1YjljNDgtZDBmMi00MjYwLWI2ODMtMGY1YWFlZjQ2MzM3IiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZDA3OTQ0YjYtNDQ5Zi01NjRlLWI2ZWItMGM0NGEzMjA5ZTgzIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZWU1NTEwZjgtNmI2ZC00NDJhLTkwOTMtMzQ4NmNlNDA0ZDU0IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249Ijk2IiBleGlmOlBpeGVsWURpbWVuc2lvbj0iNjQiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxMToxMDowMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjEyYTg4Mjg4LWYzOWItNDU4My04M2FlLTk0NTExY2FjZGU5OCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDoxNTozMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmEwMDkzM2E5LTA4NzctNDRlYi04YThmLTZlZDYyZjA1ZDhlZCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlmZGE3OTBiLTZlODQtNGVmNS1hNGYxLTg0ZWFiMGIwNWJjOCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFiMmM1Y2ExLWUzYTQtNGViMi1hODg5LTBmNzUwOWVlYmJhNiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBpbWFnZS9wbmcgdG8gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gaW1hZ2UvcG5nIHRvIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZiOTY1MjJmLTA3OTYtNDZhMS1iY2JjLTM2ZmJhYzIyNmQ4OSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjE4NDI0N2UzLTVlNTUtNDk0Ny05MDc4LWZlYzNiMzhjNjVkNCIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxNDoyOTozMysxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlNWI5YzQ4LWQwZjItNDI2MC1iNjgzLTBmNWFhZWY0NjMzNyIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxNDoyOTozMysxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjE4NDI0N2UzLTVlNTUtNDk0Ny05MDc4LWZlYzNiMzhjNjVkNCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjIyOTFjN2Q1LTdiMGYtNmI0YS1iMDNmLTZjMjlkMjBmZGI5MCIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIvPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6MjI5MWM3ZDUtN2IwZi02YjRhLWIwM2YtNmMyOWQyMGZkYjkwPC9yZGY6bGk+IDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjhhZDQ0NTBlLTdmZjUtYmU0Mi05ZjUwLThhNGQwZWE1ODJhZTwvcmRmOmxpPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuaRfCQAAAJWSURBVHic7ZtNjtowGIY/059FXBbpBqYH4AasOcHMMZqsc4GIC7BORpxi5gSs2bHkAGVm00i0zaJScRcIDQrEQOLoDcP7SJGQrXyxvgfbSewoY4wQHB10A24dCgBDAWA+lpTbJgbVRENaTKO5KBMg4/G4e6w8juO617wqLHn45SK+KrkLMnJ7//RLcZIjzgFgSoegPX403orr4ZvrgOwBYCgADAWAoQAwFACGAsBQABgKAEMBYCgADAWAoQAwFAAGIkApdVc8bOVJknha6/5+DK11P0kSz3beNXDO62jnGGNWItvE7X4X6/YJwzBfLpcffN/vZVn26vt+LwiCP2EY5qfitZ3DFbFH9Vbw3ShpcD2gmLBTCRyNRl/n8/nn4XD4dzab/TwVrwG26wGHOapM6+YA2zASBEG+2WwkCIIc0bYmaJ0AY8xqdxTr0jT1Op2OpGnqIdrWBIdzwLZLtW5RPoqi7mKx+JTn+Yvv+70oirqTycTJzoSLcZgjyCRsozj0GGNWSZJ40+lUr9frFxGRLMtetdb9wWDwbzcRXyvnbEvhovwb+4vy3JbyHqAAMBQAhgLAUAAYCgBDAWAoAAwFgKEAMBQAhgLAUAAYfqRXHb4NfQ/YvhP+cqw8juPfzTWnfVjy4CS+bQgqPcfJla8HWy4eROS5TvCyIUhZjlujLA8PIvIkIvd1gnMOqM6zOJBAAfWoLYEC6lNLAgW4obIECnBHJQkU4JaLJZQ9B5B63MujejpaU9hNzR7QDGc/nFEAGAoAQwFgKAAM74LAsAeAoQAwFADmP2XnwRUGPpopAAAAAElFTkSuQmCC",
				lightThemeSrc: "data:image/png;base64,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Y0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAALEwAACxMBAJqcGAAAEAhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMC1jMDAwIDc5LjE3MWMyN2ZhYiwgMjAyMi8wOC8xNi0yMjozNTo0MSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAzLTI2VDExOjEwOjAyKzEzOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTEyLTE1VDEwOjEwOjU3KzEzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0xMi0xNVQxMDoxMDo1NysxMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NzYzYTE2YWQtM2NhNC00NzZkLWE4MmQtOWZkZDkxZTg3NDRjIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MTk3ZmFhNjMtZjQzMy1lOTQ0LWJlZDQtMzMxZGM4MzhmOTlkIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZWU1NTEwZjgtNmI2ZC00NDJhLTkwOTMtMzQ4NmNlNDA0ZDU0IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249Ijk2IiBleGlmOlBpeGVsWURpbWVuc2lvbj0iNjQiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxMToxMDowMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjEyYTg4Mjg4LWYzOWItNDU4My04M2FlLTk0NTExY2FjZGU5OCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDoxNTozMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmEwMDkzM2E5LTA4NzctNDRlYi04YThmLTZlZDYyZjA1ZDhlZCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlmZGE3OTBiLTZlODQtNGVmNS1hNGYxLTg0ZWFiMGIwNWJjOCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFiMmM1Y2ExLWUzYTQtNGViMi1hODg5LTBmNzUwOWVlYmJhNiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBpbWFnZS9wbmcgdG8gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gaW1hZ2UvcG5nIHRvIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZiOTY1MjJmLTA3OTYtNDZhMS1iY2JjLTM2ZmJhYzIyNmQ4OSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmI5M2NlMTNiLWQyMzAtNDkzMy1iM2MyLTc1YzVmMzMxYjk1NyIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxMDoxMDo1NysxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjc2M2ExNmFkLTNjYTQtNDc2ZC1hODJkLTlmZGQ5MWU4NzQ0YyIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxMDoxMDo1NysxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmI5M2NlMTNiLWQyMzAtNDkzMy1iM2MyLTc1YzVmMzMxYjk1NyIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjIyOTFjN2Q1LTdiMGYtNmI0YS1iMDNmLTZjMjlkMjBmZGI5MCIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIvPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6OGFkNDQ1MGUtN2ZmNS1iZTQyLTlmNTAtOGE0ZDBlYTU4MmFlPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+zaFqWgAAAk5JREFUeJztmzGOEzEUhv0iCypoQaLYggNYI6fgEssNaJCAE9Cn5wIsxTa5AFquEWs0B6DYbmmXaskoj2ITEc2OJ0vsmX+S/J80suQoztP75tnWeCKqagiOCTqAU4cCwFAAGNvWKSLRhUFVpb9wxkffuWgVsOZp6uBHQiwPdzkGl7ZdkIjoqd3p/0uuHHENANM1BRljjJlOp8+GCOQQWCwWv3OPyQoAQwFgKAAMBYChADAUAIYCwFAAGAoAQwFgKAAMBYChADA7n4b2QQjhttnnvX8e66+q6l1d11+89y+3xrix1n52zs1j38sfeX4gAjbJCSHcNhPVljjn3Lwsy9chhGvv/VkI4XoymXx1zs13jTd2Hk5B30T14r4dPpw4RVHMRKQKIfwSkaooihksmIw5glRAF9vTSfNuttZeLpfLN9bay+Ej64fRCeiaQuq6fm+M0XX7fbCgeuThFPRRRT7dt8OHE6csy5mqOu/9C1V1ZVnOYMFkzNHoKqC5o9nsglar1Qfv/at131kI4aaqqp+bhfhQ2flaCg/l/7F9KM/XUo4ECgBDAWAoAAwFgKEAMBQAhgLAUAAYCgBDAWAoAAwFgOGf9PaET0OPhOiBjIg8aetX1T/9hTM+YnnIRVcF3EWuUyOaBxE5Tx28VYCqSuxK/cFDoyMPb40xV6kSuAbsiar+MBkkUEACOSRQQCKpEiggAykSKCAT+0qggIzsI6H1UQRJQ0TO9cJctX7YeJ2RFdAD60p4FBQAhgLAUAAYCgDDXRAYVgAYCgBDAWD+Ahq8ETBRdAhNAAAAAElFTkSuQmCC"
			}, {
				style: AnnotationStyle.Expand,
				darkThemeSrc: "data:image/png;base64,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Y0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAALEwAACxMBAJqcGAAAEFRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMC1jMDAwIDc5LjE3MWMyN2ZhYiwgMjAyMi8wOC8xNi0yMjozNTo0MSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAzLTI2VDExOjEwOjAyKzEzOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTEyLTE1VDE0OjM5OjIzKzEzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0xMi0xNVQxNDozOToyMysxMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTBhMTllMjgtZmQzYS00MDcxLTg4NmYtZmFlZmFiYjhiYWIzIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6NGY5MTczOWEtNDM0Ny0yMzRhLTkyOTYtYTUzZmRlMzI1YzJmIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZWU1NTEwZjgtNmI2ZC00NDJhLTkwOTMtMzQ4NmNlNDA0ZDU0IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249Ijk2IiBleGlmOlBpeGVsWURpbWVuc2lvbj0iNjQiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxMToxMDowMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjEyYTg4Mjg4LWYzOWItNDU4My04M2FlLTk0NTExY2FjZGU5OCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDoxNTozMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmEwMDkzM2E5LTA4NzctNDRlYi04YThmLTZlZDYyZjA1ZDhlZCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlmZGE3OTBiLTZlODQtNGVmNS1hNGYxLTg0ZWFiMGIwNWJjOCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFiMmM1Y2ExLWUzYTQtNGViMi1hODg5LTBmNzUwOWVlYmJhNiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBpbWFnZS9wbmcgdG8gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gaW1hZ2UvcG5nIHRvIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZiOTY1MjJmLTA3OTYtNDZhMS1iY2JjLTM2ZmJhYzIyNmQ4OSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFmN2U1YmE2LTY4ZmMtNDcwZi05NjJmLTAwMDMwM2E0Y2U2MiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxNDozOToyMysxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjUwYTE5ZTI4LWZkM2EtNDA3MS04ODZmLWZhZWZhYmI4YmFiMyIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxNDozOToyMysxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmFmN2U1YmE2LTY4ZmMtNDcwZi05NjJmLTAwMDMwM2E0Y2U2MiIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjIyOTFjN2Q1LTdiMGYtNmI0YS1iMDNmLTZjMjlkMjBmZGI5MCIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIvPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6MjI5MWM3ZDUtN2IwZi02YjRhLWIwM2YtNmMyOWQyMGZkYjkwPC9yZGY6bGk+IDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjhhZDQ0NTBlLTdmZjUtYmU0Mi05ZjUwLThhNGQwZWE1ODJhZTwvcmRmOmxpPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrPGZq4AAAJ/SURBVHic7ZuxjqJAGMc/iFtoZhuK9a5e3+Di1pa+hC3hAaiPeE9BsNxun8DS3mxDbX/uFiTmVre4y3CFmmNhgOjC/Qf4fslEGWSYfD/nG8KAEccxMThMdAe6DgsAwwLA9BR1RZOCUVdHNKbWeKgE0Hw+v1XVe5732fM1joJY/KqifUNxFRRTN//pl1JJnHgOAKNMQUniOP75PzrSBAzD+Fp1mzwCwLAAMCwADAsAwwLAsAAwLAAMCwDDAsCwADAsAAwLAMMCwEAEmKb5JV2K6n3f7wshhsk2hBBD3/f7Rcc1gdLb0XUgpdwSHQN3/p7el8RxnPfNZtOzLOsuiqJXy7LuHMc5OI7zXtae7pSuiNW5HpAOWFkAJ5OJtV6vb8bj8e/VahWVtVc1qfWAdq6IFaUR27YPUkqybfuA6JuC+IryAe0ESCm355LeFwTBwDRNCoJggOibAuPCkkE7AXm4rnsbhmFvv9+/hGHYc11X+bRC04BMwkWkU4+Ucuv7fn+xWAx2u90LEVEURa9CiOFoNPpznoibCnQSbhoVTMKZYxqTgtoKCwDDAsCwADAsAAwLAMMCwLAAMCwADAsAwwLAsAAwLAAMv6R3PXw3tA3kvScsVPWe573V2x39KIhFJe3npaDc31dy1mZRZTwyKUg1AroY5CJqjQfPAWBYABgWAIYFgGEBYLR7MCvBNyKaEdE0Ubckokcieob0qAZ0HgEzIronou9E9HD6vD/VtwadR8CUjkF/Om2fP39gulMPOo8AomPKUW1f81i4DiWD7gKmOduXPhauU/mAziloSf/y/ZKOwZ9RdlQ0GtXNOF3oxFWQzgI6ge5zQOthAWBYAJi/tpT89Cm0y3kAAAAASUVORK5CYII=",
				lightThemeSrc: "data:image/png;base64,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Y0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAALEwAACxMBAJqcGAAAEAhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMC1jMDAwIDc5LjE3MWMyN2ZhYiwgMjAyMi8wOC8xNi0yMjozNTo0MSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTAzLTI2VDExOjEwOjAyKzEzOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTEyLTE1VDEwOjA3OjUzKzEzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0xMi0xNVQxMDowNzo1MysxMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDM2MWVlMzItNjFiZS00ZTMyLTk2N2YtNzc0ZTY0NDQ4OGRlIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YmVhMGZhMTEtN2UxNi0zZTQ0LTgxMTItMmM1MTJmNjk1MTE0IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZWU1NTEwZjgtNmI2ZC00NDJhLTkwOTMtMzQ4NmNlNDA0ZDU0IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249Ijk2IiBleGlmOlBpeGVsWURpbWVuc2lvbj0iNjQiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxMToxMDowMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjEyYTg4Mjg4LWYzOWItNDU4My04M2FlLTk0NTExY2FjZGU5OCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDoxNTozMisxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmEwMDkzM2E5LTA4NzctNDRlYi04YThmLTZlZDYyZjA1ZDhlZCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlmZGE3OTBiLTZlODQtNGVmNS1hNGYxLTg0ZWFiMGIwNWJjOCIgc3RFdnQ6d2hlbj0iMjAyMC0wMy0yNlQxNDozNDo1NCsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFiMmM1Y2ExLWUzYTQtNGViMi1hODg5LTBmNzUwOWVlYmJhNiIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBpbWFnZS9wbmcgdG8gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gaW1hZ2UvcG5nIHRvIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZiOTY1MjJmLTA3OTYtNDZhMS1iY2JjLTM2ZmJhYzIyNmQ4OSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQwODoyNjowMSsxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZiOGEyNGM2LTk0MjMtNDVlMS1iYmM1LTlkN2YzNmE0ZWI4NSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxMDowNzo1MysxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjQzNjFlZTMyLTYxYmUtNGUzMi05NjdmLTc3NGU2NDQ0ODhkZSIgc3RFdnQ6d2hlbj0iMjAyMi0xMi0xNVQxMDowNzo1MysxMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjZiOGEyNGM2LTk0MjMtNDVlMS1iYmM1LTlkN2YzNmE0ZWI4NSIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjIyOTFjN2Q1LTdiMGYtNmI0YS1iMDNmLTZjMjlkMjBmZGI5MCIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmVlNTUxMGY4LTZiNmQtNDQyYS05MDkzLTM0ODZjZTQwNGQ1NCIvPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6OGFkNDQ1MGUtN2ZmNS1iZTQyLTlmNTAtOGE0ZDBlYTU4MmFlPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Ng/hYAAAAmVJREFUeJztmztu20AURe8NjKRIIUFeQxbgjumzAFVZgKsgQPbgLr3SsDJYu+IC0mcR2YAaBRTgIj/kpjAV2BQp+kPmjqR3gAHBETh8nEPNDPCGlITAxzN3AMdOCDATAsycNCtIdk4KkjhuOOkxdn9sCah58dSGD4iuvvgxRONsroJI6hjf9IcyVD/FHGAmBJgJAWZCgJkQYCYEmAkBZkKAmRBgJgSYCQFmQoCZEGAmBJgJAWYsAkiqWXrqz0leN9q4Jnm+67p9oCsjNiqbREZbUqMtySHpkuQrkitJpyRXAD5JuuxrL3WsGbHmvfruTfIzgNcAvkh609femBxsRqxnGMlxE3P+n8NqpW3o6yvNNpITIImb0vLzOwB/6qOd27Hep7S1kZyALkh+BHAm6SWAs/p877FMwrto/k0lsV7tvJc0qetO61XQ181EvK/EtpRH8ph+artmb4agQyUEmAkBZkKAmRBgJgSYCQFmQoCZEGAmBJgJAWZCgJkQYCYEmAkBZloTMiSft9VL+jluOOnR1RdD0ZUR6/oI+RgTNYN8kN3FloDIht1l7P6IOcBMCDATAsyEADMhwEyyAkjOSC5ILkl+r48LkjN3bIMiKckCYJFlmYqiUFVVKopCWZYJwMId2xOeSVt17qB2BLssikK3KYpCAJbu2IYUsLU1MRVI/qqq6mQymfyrW6/XmE6nv5Hgntb7oj3amrgqy/JORX2+0gO3hadUmg+Z8pt0lef5BwCYz+coyxJ5ngPAlTesYUl5CJoBuADwFsAUQIWbzr+Q9M0W2MAkK+BYSHkOOApCgJkQYOYv4nG+qvJR/IYAAAAASUVORK5CYII="

			}
		];
		return styles;
	};

	/**
	 * The main method for creation of annotations
	 * @param {any} divAnnotation Object with annotation settings
	 * @param {sap.ui.vk.Viewport} viewport Viewport where annotation are displayed
	 * @returns {sap.ui.vk.Annotation} Newly create annotation
	 * @public
	 */
	Annotation.createAnnotation = function(divAnnotation, viewport) {
		var escapeCharacters = function(text) {
			if (!text) {
				return "";
			}

			return text.replaceAll(/(\{|\})/g, "\\$1");
		};

		// Order of these properties is important as many of them depend on values of style and nodeRef
		var annotation = new Annotation({
			viewport: viewport,
			annotationId: divAnnotation.annotation.id,
			nodeRef: divAnnotation.node,
			style: divAnnotation.annotation.style,
			animate: divAnnotation.annotation.animate === undefined ? true : divAnnotation.annotation.animate,
			editable: !!divAnnotation.annotation.editable,
			name: divAnnotation.node.name,
			text: escapeCharacters(divAnnotation.annotation.text && divAnnotation.annotation.text.html),
			xCoordinate: divAnnotation.node.position.x,
			yCoordinate: divAnnotation.node.position.y,
			width: divAnnotation.node.scale.x,
			height: divAnnotation.node.scale.y
		});

		annotation._attachmentNode = divAnnotation.attachment;

		if (divAnnotation.targetNodes) {
			divAnnotation.targetNodes.forEach(function(targetNode) {
				annotation.getTargetNodes().push(targetNode);
			});
		}
		annotation.sourceData = divAnnotation;
		return annotation;
	};

	Annotation.prototype._getBackgroundColor = function() {
		var color = "rgba(221, 221, 221, 0.5)";
		var annotation = this.sourceData.annotation;
		if (annotation.label && annotation.label.colour) {
			var colorArray = annotation.label.colour;
			color = "rgba(" + colorArray[0] * 255
				+ ", " + colorArray[1] * 255
				+ ", " + colorArray[2] * 255
				+ ", " + colorArray[3]
				+ ")";
		}
		return color;
	};

	return Annotation;
});
