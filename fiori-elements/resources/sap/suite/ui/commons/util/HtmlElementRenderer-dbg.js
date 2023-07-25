/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/Control",
	"sap/base/Log"
], function (BaseObject, Control, Log) {
	"use strict";

	var HtmlElement;
	/**
	 * Creates a renderer for HtmlElement.
	 *
	 * @class HtmlElementRenderer A renderer for HtmlElement.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @param {sap.suite.ui.commons.util.HtmlElement} oHtmlElement Html element to render.
	 *
	 * @constructor
	 * @alias sap.suite.ui.commons.util.HtmlElementRenderer
	 * @protected
	 */
	var HtmlElementRenderer = BaseObject.extend("sap.suite.ui.commons.util.HtmlElementRenderer", {
		constructor: function (oHtmlElement) {
			BaseObject.apply(this, arguments);

			this._oHtmlElement = oHtmlElement;
		}
	});

	/**
	 * Added as part of semantic rendering.
	 */
	HtmlElementRenderer.apiVersion = 2;

	/**
	 * Renders HtmlElement to given render manager.
	 * @param {sap.ui.core.RenderManager} oRm RenderManager used for outputting content.
	 * @protected
	 */
	HtmlElementRenderer.prototype.render = function (oRm) {
		oRm.openStart(this._oHtmlElement._sName);
		this._renderAttributes(oRm);
		oRm.openEnd();
		if (this._oHtmlElement._aChildren.length > 0) {
			this._renderChildren(oRm);
		}
		oRm.close(this._oHtmlElement._sName);
	};

	/**
	 * Renders all attributes of parent tag.
	 * @param {sap.ui.core.RenderManager} oRm RenderManager used for outputting content.
	 * @protected
	 */
	HtmlElementRenderer.prototype._renderAttributes = function (oRm) {
		var attributes = this._oHtmlElement._mAttributes;
		for (var attrName in attributes) {
			if (!attributes.hasOwnProperty(attrName)) {
				continue;
			}
			var val = attributes[attrName];

			switch (attrName){
				case "class":
						if (Array.isArray(val)){
							for (var className in val){
								oRm.class(val[className]);
							}
						} else {
							oRm.class(val);
						}
						break;
				case "style":
						if (typeof val === 'object' && !!val){
							for (var styleName in val){
								oRm.style(styleName, val[styleName]);
							}
						}
						break;
				default:
					if (Array.isArray(val)){
							val = val.join("");
						}
						oRm.attr(attrName, val);
			}
		}
	};

	/**
	 * Renders children of given node.
	 * @param {sap.ui.core.RenderManager} oRm RenderManager used for outputting content.
	 * @protected
	 */
	HtmlElementRenderer.prototype._renderChildren = function (oRm) {
		if (typeof HtmlElement === "undefined") {
			HtmlElement = sap.ui.require("sap/suite/ui/commons/util/HtmlElement");
		}
		this._oHtmlElement._aChildren.forEach(function (child) {
			if (typeof child === "string") {
				oRm.unsafeHtml(child);
			} else if (HtmlElement && child instanceof HtmlElement) {
				child.getRenderer().render(oRm);
			} else if (child instanceof Control) {
				oRm.renderControl(child);
			} else {
				Log.error(typeof child + " cannot be a child of a HTML element. Skipping rendering for this child.");
			}
		});
	};

	return HtmlElementRenderer;
});
