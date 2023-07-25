/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CreateTextToolGizmo
sap.ui.define([
	"./CreateParametricGizmo",
	"../svg/Element",
	"../svg/Text",
	"sap/ui/richtexteditor/RichTextEditor"
], function(
	Gizmo,
	Element,
	Text,
	RichTextEditor
) {
	"use strict";

	/**
	 * Constructor for a new CreateTextToolGizmo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides UI to display tooltips
	 * @extends sap.ui.vk.tools.CreateParametricGizmo
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.vk.tools.CreateTextToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CreateTextToolGizmo = Gizmo.extend("sap.ui.vk.tools.CreateTextToolGizmo", /** @lends sap.ui.vk.tools.CreateTextToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	/**
	 * Indicates that the gizmo is rendered as part of the viewport HTML element.
	 * @returns {boolean} true
	 */
	CreateTextToolGizmo.prototype.hasDomElement = function() {
		return true;
	};

	/**
	 * Shows gizmo.
	 * @param {sap.ui.vk.svg.Viewport} viewport The viewport to which this tool and gizmo belongs.
	 * @param {sap.ui.vk.tools.CreateTextTool} tool The tool to which this gizmo belongs.
	 */
	CreateTextToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;
		this._editForm = null;

		this.updateParentNode();
	};

	/**
	 * Hides gizmo.
	 */
	CreateTextToolGizmo.prototype.hide = function() {
		this._viewport = null;
		this._tool = null;
		this._root = null;
		if (this._editForm) {
			this._editForm.close();
			this._editForm = null;
		}
	};

	/**
	 * Creates a text element at a given position
	 * @param {object} pos Position in world space coordinate system.
	 * @param {string} text Initial text
	 * @private
	 */
	CreateTextToolGizmo.prototype._createText = function(pos, text) {
		if (this._editForm) {
			return;
		}

		var scale = 1 / this._viewport._camera.zoom;
		var nodeMatrix = Element._multiplyMatrices(Element._invertMatrix(this._root._matrixWorld()), [scale, 0, 0, scale, pos.x, pos.y]);
		var textMatrix = [1, 0, 0, nodeMatrix[3] < 0 ? -1 : 1, 0, 0];
		if (nodeMatrix[3] < 0) {
			nodeMatrix[2] *= -1;
			nodeMatrix[3] *= -1;
		}

		var activeElement = new Text({
			subelement: true,
			text: text,
			style: {
				size: this._tool.getFontSize(),
				fontFace: this._tool.getFontFace()
			},
			matrix: textMatrix,
			lineStyle: this._tool._lineStyle,
			fillStyle: this._tool._fillStyle
		});

		var node = new Element({
			name: "Text",
			matrix: nodeMatrix
		});
		node.add(activeElement);
		this._root.add(node);

		this._editText(activeElement);
	};

	CreateTextToolGizmo.prototype._editText = function(textElement) {
		var domRef = this.getDomRef();
		if (!domRef) {
			this._editElementWhenReady = textElement;
			return;
		}

		var pos = Element._transformPoint(textElement.x, textElement.y, textElement._matrixWorld());
		var screenPos = this._viewport._camera._worldToScreen(pos.x, pos.y);
		domRef.style.left = screenPos.x + "px";
		domRef.style.top = screenPos.y + "px";

		// console.log("!!!", textElement.getHtmlTextContent());

		var editForm = this._editForm = new sap.m.Popover({
			showHeader: false,
			placement: sap.m.PlacementType.PreferredLeftOrFlip,
			content: new sap.m.VBox({
				items: [
					new RichTextEditor({
						width: "500px",
						height: "200px",
						wrapping: false,
						customToolbar: true,
						showGroupUndo: true,
						showGroupFont: true,
						showGroupTextAlign: false,
						value: textElement.getHtmlTextContent(),
						change: function(event) {
							textElement.setHtmlTextContent(this.getValue());
							// console.log(">>>", this.getValue());
							// console.log("<<<", textElement.getHtmlTextContent());
						},
						customButtons: [
							new sap.m.Button({
								text: "OK",
								press: function() {
									editForm.close();
								}
							})
						]
					}).addStyleClass("sapUiSizeCompact"),
					new sap.m.Button({
						text: "OK",
						press: function() {
							editForm.close();
						}
					})
				]
			})
		});
		editForm.attachAfterClose(function() {
			this._tool.fireCompleted({
				node: textElement.parent,
				request: this._createRequest(textElement.parent)
			});
			this._editForm = null;
		}.bind(this));
		editForm.openBy(this);
	};

	CreateTextToolGizmo.prototype.onAfterRendering = function() {
		if (this._editElementWhenReady) {
			this._editText(this._editElementWhenReady);
			this._editElementWhenReady = null;
		}
	};

	return CreateTextToolGizmo;
});
