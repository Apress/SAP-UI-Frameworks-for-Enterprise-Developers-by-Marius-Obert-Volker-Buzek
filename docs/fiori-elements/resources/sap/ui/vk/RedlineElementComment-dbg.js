/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides a class for the redlining comment elements.
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/vk/uuidv4"
], function(
	Element,
	uuidv4
) {
	"use strict";

	/**
	 * Redline element control for comment.
	 *
	 * @class Provides a control for creating RedlineElementComments.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Element
	 * @alias sap.ui.vk.RedlineElementComment
	 * @since 1.89.0
	 */

	var RedlineElementComment = Element.extend("sap.ui.vk.RedlineElementComment", {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				text: {
					type: "string",
					defaultValue: ""
				},
				createdByUser: {
					type: "any",
					defaultValue: ""
				},
				createTimestamp: {
					type: "int",
					defaultValue: null
				}
			}
		},
		constructor: function(sId, parameters) {
			Element.apply(this, arguments);

			if (typeof sId === "object") {
				parameters = sId;
				sId = undefined;
			}
			this._elementId = parameters && parameters.elementId ? parameters.elementId : uuidv4();
		}
	});

	/**
	 * Returns the internally generated element id
	 * @returns {string} element id as string
	 */
	RedlineElementComment.prototype.getElementId = function() {
		return this._elementId;
	};

	/**
	 * Retrieve a list of RedlineElements' elementIds associated with the comment
	 * @returns {any[]} Array of RedlineElements' elementIds.
	 */
	RedlineElementComment.prototype.getContent = function() {
		if (!this._elements) {
			this._elements = new Set();
		}

		var array = Array.from(this._elements);
		return array;
	};

	/**
	 * Adds an element ID into a list of RedlineElements' elementIds associated with the comment
	 * @param {string|sap.ui.vk.RedlineElement} content RedlineElement or its elementId to be associated with this comment
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	RedlineElementComment.prototype.addContent = function(content) {
		if (!this._elements) {
			this._elements = new Set();
		}
		if (content instanceof sap.ui.vk.RedlineElement) {
			var elementId = content.getElementId();
			this._elements.add(elementId);
		} else {
			this._elements.add(content);
		}

		return this;
	};

	/**
	 * Removes an element ID from a list of RedlineElements' elementIds associated with the comment
	 * @param {string|sap.ui.vk.RedlineElement} content RedlineElement or its elementId to be removed from this comment's content
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	RedlineElementComment.prototype.removeContent = function(content) {
		if (this._elements) {
			var elementId;
			if (content instanceof sap.ui.vk.RedlineElement) {
				elementId = content.getElementId();
			} else {
				elementId = content;
			}
			this._elements.delete(elementId);
		}

		return this;
	};

	/**
	 * Adds a Measurement Id into a list of Measurement Ids associated with the comment
	 * @param {string} measurementId Measurement Id to be associated with this comment
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	RedlineElementComment.prototype.addMeasurement = function(measurementId) {
		if (!this._measurements) {
			this._measurements = new Set();
		}

		this._measurements.add(measurementId);

		return this;
	};

	/**
	 * Retrieve a list of Measurement Ids associated with the comment
	 * @returns {any[]} Array of Measurement Ids
	 */
	RedlineElementComment.prototype.getMeasurements = function() {
		if (!this._measurements) {
			this._measurements = new Set();
		}

		var array = Array.from(this._measurements);
		return array;
	};

	/**
	 * Removes an Measurement Id from a list of Measurement Ids associated with the comment
	 * @param {string} measurementId Measurement Id to be removed from this comment's associated measurements
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	RedlineElementComment.prototype.removeMeasurement = function(measurementId) {
		if (this._measurements) {
			this._measurements.delete(measurementId);
		}

		return this;
	};

	/**
	 * Clears a list of RedlineElements' elementIds associated with the comment
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	RedlineElementComment.prototype.clearContent = function() {
		if (this._elements) {
			this._elements.clear();
		}

		return this;
	};

	/**
	 * Exports this comment as a JSON object
	 * @returns {any} JSON object.
	 */
	RedlineElementComment.prototype.exportJSON = function() {
		var json = {
			elementId: this.getElementId(),
			createdByUser: this.getCreatedByUser(),
			createTimestamp: this.getCreateTimestamp() ? this.getCreateTimestamp() : Date.now(),
			text: this.getText(),
			content: this.getContent(),
			measurements: this.getMeasurements()
		};
		return json;
	};

	/**
	 * Imports a JSON and applies supplied comment to this comment
	 * @param {any} json The JSON to import
	 * @returns {string} The createdByUser string if the supplied JSON contains it
	 */
	RedlineElementComment.prototype.importJSON = function(json) {
		if (json.hasOwnProperty("elementId")) {
			this._elementId = json.elementId;
		}
		if (json.hasOwnProperty("createTimestamp")) {
			this.setCreateTimestamp(json.createTimestamp);
		}
		if (json.hasOwnProperty("text")) {
			this.setText(json.text);
		}
		if (json.hasOwnProperty("content")) {
			var content = json.content;
			if (content) {
				for (var i = 0; i < content.length; i++) {
					this.addContent(content[i]);
				}
			}
		}
		if (json.hasOwnProperty("createdByUser")) {
			this.setCreatedByUser(json.createdByUser);
			return json.createdByUser;
		}
		if (json.hasOwnProperty("measurements")) {
			var measurements = json.measurements;
			if (measurements) {
				for (var j = 0; j < measurements.length; j++) {
					this.addMeasurement(measurements[j]);
				}
			}
		}
	};

	return RedlineElementComment;
});
