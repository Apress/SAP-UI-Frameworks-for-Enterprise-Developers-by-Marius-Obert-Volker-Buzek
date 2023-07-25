/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/Control",
	"./HtmlElementRenderer",
	"sap/base/assert",
	"sap/base/security/encodeXML",
	"sap/base/Log"
], function (BaseObject, Control, HtmlElementRenderer, assert, encodeXML, Log) {
	"use strict";

	/**
	 * Creates a HtmlElement which resembles one HTML tag.
	 *
	 * @class HtmlElement A model class for holding information about one HTML tag.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @param {string} sName Tag name (eg. div, ul etc.).
	 *
	 * @constructor
	 * @alias sap.suite.ui.commons.util.HtmlElement
	 * @protected
	 */
	var HtmlElement = BaseObject.extend("sap.suite.ui.commons.util.HtmlElement", {
		constructor: function (sName) {
			BaseObject.apply(this, arguments);

			assert(typeof sName === "string", "Element name must be a string.");
			this._sName = sName;
			this._mAttributes = {};
			this._aChildren = [];
		}
	});

	/**
	 * Returns a renderer for this tag.
	 * @returns {sap.suite.ui.commons.util.HtmlElementRenderer} The newly created renderer instance
	 * @protected
	 */
	HtmlElement.prototype.getRenderer = function () {
		return new HtmlElementRenderer(this);
	};

	/**
	 * Sets id attribute.
	 * @param {string} sId Id to set.
	 * @param {boolean} [bAddSapUi="false"] If true, data-sap-ui will be set to the Id as well.
	 * @protected
	 */
	HtmlElement.prototype.setId = function (sId, bAddSapUi) {
		assert(typeof sId === "string", "Id must by a string.");
		this.setAttribute("id", sId);
		if (bAddSapUi) {
			this.setAttribute("data-sap-ui", sId);
		}
	};

	/**
	 * Sets an attribute.
	 * @param {string} sKey Attribute name.
	 * @param {string|number|boolean} oValue Value of an attribute.
	 * @param {boolean} [bEscape="false"] Tells if the value should be escaped using encodeHTML.
	 * @protected
	 */
	HtmlElement.prototype.setAttribute = function (sKey, oValue, bEscape) {
		assert(typeof sKey === "string", "Key must by a string.");
		assert(typeof oValue === "string" || typeof oValue === "number" || typeof oValue === "boolean", "Value must be a string, number or boolean");
		var sVal = String(oValue);
		if (bEscape) {
			sVal = encodeXML(sVal);
		}
		if (sKey in this._mAttributes) {
			Log.warning("Replacing an already existing attribute.", "Attribute key = " + sKey + ", old value = " + this._mAttributes[sKey] + ", new value = " + sVal, this);
		}
		if (sKey === "style"){
			/**
			 * if sKey is 'style' then extract every individual style's name and value
			 * and assign it in _mAttributes object.
			 */
			var attributes = sVal.split(';');

			if (!this._mAttributes.style) {
				this._mAttributes.style = {};
			}

			for (var i = 0; i < attributes.length; i++) {
				// extract style string by splitting string at only first colon occurance
				var sEntry = attributes[i].split(/:(.+)/),
					sName = sEntry.splice(0,1)[0].trim(),
					sValue = sEntry.join('').trim();

				this._mAttributes.style[sName] = sValue;
			}
		} else {
			this._mAttributes[sKey] = sVal;
		}
	};

	/**
	 * Adds a class.
	 * @param {string} sClass - CSS class to add.
	 * @protected
	 */
	HtmlElement.prototype.addClass = function (sClass) {
		assert(typeof sClass === "string", "Class must be a string.");
		if (!this._mAttributes.class) {
			this._mAttributes.class = [];
		} else {
			assert(Array.isArray(this._mAttributes.class), "Cannot add class to customly added classes.");
		}
		this._mAttributes.class.push(sClass);
	};

	/**
	 * Adds a HTML style (eg. "color:red").
	 * @param {string} sName Name of the style (eg. margin, color).
	 * @param {string|number} oValue Value of the style.
	 * @protected
	 */
	HtmlElement.prototype.addStyle = function (sName, oValue) {
		assert(typeof sName === "string", "Name must be a string.");
		assert(typeof oValue === "string" || typeof oValue === "number", "Value must be a string or a number.");
		if (!this._mAttributes.style) {
			this._mAttributes.style = {};
		}
		this._mAttributes.style[sName] = oValue;
	};

	/**
	 * Adds all html relevant data from UI5 control. It sets ID, adds all custom data and adds custom style classes.
	 * This function should be called on the element which resembles the rendered control. It's usually the top element.
	 * @param {sap.ui.core.Control} oControl Control to load data from. Usually the control which resembles this element.
	 * @protected
	 */
	HtmlElement.prototype.addControlData = function (oControl) {
		assert(oControl instanceof Control, "Control must be a sapui5 control.");
		this.setId(oControl.getId(), true);
		var that = this; //eslint-disable-line
		oControl.getCustomData().forEach(function (oData) {
			var oCheckResult = oData._checkWriteToDom(oControl);
			if (oCheckResult) {
				that.setAttribute(oCheckResult.key, oCheckResult.value, true);
			}
		});
		if (oControl.aCustomStyleClasses && oControl.aCustomStyleClasses.length > 0) {
			oControl.aCustomStyleClasses.forEach(function (cls) {
				that.addClass(encodeXML(cls));
			});
		}
	};

	/**
	 * Adds a child to the element. A child can be either text, another HtmlElement or a Control. Children will e rendered
	 * as a content of this element.
	 * @param {string|sap.suite.ui.commons.util.HtmlElement|sap.ui.core.Control} oChild Child to add.
	 * @protected
	 */
	HtmlElement.prototype.addChild = function (oChild) {
		assert(typeof oChild === "string" || oChild instanceof HtmlElement || oChild instanceof Control, "Child must be a string, HtmlElement or a Control.");
		this._aChildren.push(oChild);
	};

	/**
	 * Adds a string child and escapes it using encodeHTML.
	 * @param {string} sText Text to add.
	 * @param {boolean} bConvertLineBreakToBr If true, \n will be converted to <br>.
	 * @protected
	 */
	HtmlElement.prototype.addChildEscaped = function (sText, bConvertLineBreakToBr) {
		assert(typeof sText === "string", "sText must be a string");
		sText = encodeXML(sText);
		if (bConvertLineBreakToBr) {
			sText = sText.replace(/&#xa;/g, "<br>");
		}
		this._aChildren.push(sText);
	};

	return HtmlElement;
});
