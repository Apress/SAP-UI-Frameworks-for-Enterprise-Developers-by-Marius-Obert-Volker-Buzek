/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/base/Object',
	"sap/base/security/encodeXML"
], function(BaseObject, encodeXML) {
	"use strict";

	var RenderingHelper = function(oRenderManager) {
		this._rm = oRenderManager;
	};

	RenderingHelper.prototype = Object.create(BaseObject.prototype || null);

	/**
	 * @returns {sap.ui.core.RenderManager} Returns the RenderManager
	 * @throws Error if no RenderManager exists
	 * @private
	 */
	RenderingHelper.prototype._getRenderManager = function() {
		if (!this._rm) {
			throw new Error("Render manager not defined");
		}
		return this._rm;
	};

	/**
	 * Writes complete opening tag with name sTagName.
	 * @param {String} sTagName The name for the tag.
	 * @param {Object} [oTag] Object which contains tag's classes and attributes.
	 */
	RenderingHelper.prototype.writeOpeningTag = function(sTagName, oTag) {
		oTag = oTag || {};

		// Get manager
		var rm = this._getRenderManager();
		var attrName;

		// Write tag name
		rm.write("<");
		rm.writeEscaped(sTagName);

		// Write CSS classes
		if (oTag.classes) {
			for (var i = 0; i < oTag.classes.length; i++) {
				rm.addClass(encodeXML(oTag.classes[i]));
			}
			rm.writeClasses();
		}

		// Write attributes
		if (oTag.attributes) {
			for (attrName in oTag.attributes) {
				rm.writeAttribute(attrName, oTag.attributes[attrName]); //ignore UI5 build warning, it is intended to work like that
			}
		}

		// Write escaped attributes
		if (oTag.escapedAttributes) {
			for (attrName in oTag.escapedAttributes) {
				rm.writeAttributeEscaped(attrName, oTag.escapedAttributes[attrName]);
			}
		}

		rm.write(">");
	};

	/**
	 * Writes complete opening tag with name sTagName.
	 * @param {String} sTagName The name for the tag.
	 */
	RenderingHelper.prototype.writeClosingTag = function(sTagName) {
		// Get manager
		var rm = this._getRenderManager();

		// Write tag name
		rm.write("</");
		rm.writeEscaped(sTagName);
		rm.write(">");
	};

	return RenderingHelper;
}, /* bExport= */ true);
