/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.RedlineConversation.
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/vk/uuidv4",
	"sap/ui/vk/RedlineElementComment"
],
	function(
		Element,
		ManagedObjectObserver,
		uuidv4,
		RedlineElementComment
	) {
		"use strict";

		/**
		 *  Constructor for a new RedlineConversation.
		 *
		 * @class Provides a base class control for RedlineConversations.
		 *
		 * @public
		 * @author SAP SE
		 * @version 1.113.0
		 * @extends sap.ui.core.Element
		 * @alias sap.ui.vk.RedlineConversation
		 * @since 1.89.0
		 */
		var RedlineConversation = Element.extend("sap.ui.vk.RedlineConversation", {
			metadata: {
				library: "sap.ui.vk",
				properties: {
					conversationName: {
						type: "string"
					},
					timestamp: {
						type: "int"
					},
					viewId: {
						type: "string",
						defaultValue: ""
					},
					viewInfo: {
						type: "any",
						defaultValue: null
					},
					animationOffset: {
						type: "float",
						defaultValue: 0
					},
					measurementScale: {
						type: "float",
						defaultValue: 1
					}
				},
				aggregations: {
					comments: {
						singularName: "comment",
						type: "sap.ui.vk.RedlineElementComment",
						multiple: true
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
		RedlineConversation.prototype.getElementId = function() {
			return this._elementId;
		};

		/**
		 * Adds a RedlineElement to the conversation
		 * @param {any|sap.ui.vk.RedlineElement} content RedlineElement or its JSON representation to be added to this conversation
		 * @returns {this} <code>this</code> to allow method chaining.
		 */
		RedlineConversation.prototype.addContent = function(content) {
			if (!this._elements) {
				this._elements = new Map();
			}

			var elementId;
			var json;

			if (content instanceof sap.ui.vk.RedlineElement) {
				elementId = content.getElementId();
				json = content.exportJSON();
			} else {
				elementId = content.elementId;
				json = content;

			}

			this._elements.set(elementId, json);

			return this;
		};

		/**
		 * Removes a redline element from the conversation
		 * @param {any|sap.ui.vk.RedlineElement} content RedlineElement or its JSON representation to be removed from this conversation
		 * @returns {this} <code>this</code> to allow method chaining.
		 */
		RedlineConversation.prototype.removeContent = function(content) {
			if (this._elements) {

				var elementId;

				if (content instanceof sap.ui.vk.RedlineElement) {
					elementId = content.getElementId();
				} else if (typeof content === "string") {
					elementId = content;
				} else {
					elementId = content.elementId;
				}

				this._elements.delete(elementId);
			}

			return this;
		};

		/**
		 * Retrieves a list of RedlineElements contained in this RedlineConversation as JSON objects
		 * @returns {any[]} Array of RedlineElements as JSON objects.
		 */
		RedlineConversation.prototype.getContent = function() {
			var elementArray = [];

			if (this._elements) {
				elementArray = Array.from(this._elements.values());
			}

			return elementArray;
		};

		/**
		 * Adds a Measurement to the conversation
		 * @param {any} measurement Measurement's JSON representation to be added to this conversation
		 * @returns {this} <code>this</code> to allow method chaining.
		 */
		RedlineConversation.prototype.addMeasurement = function(measurement) {
			if (!this._measurements) {
				this._measurements = new Map();
			}

			this._measurements.set(measurement.id, measurement);

			return this;
		};

		/**
		 * Removes a Measurement from the conversation
		 * @param {any} measurement Measurement's JSON representation or id to be removed from this conversation
		 * @returns {this} <code>this</code> to allow method chaining.
		 */
		RedlineConversation.prototype.removeMeasurement = function(measurement) {
			if (this._measurements) {

				var measurementId;

				if (typeof measurement === "string") {
					measurementId = measurement;
				} else {
					measurementId = measurement.id;
				}

				this._measurements.delete(measurementId);
			}

			return this;
		};

		/**
		 * Retrieves a list of Measurement JSON objects contained in this RedlineConversation
		 * @returns {any[]} Array of Measurements as JSON objects.
		 */
		RedlineConversation.prototype.getMeasurements = function() {
			var measurementsArray = [];

			if (this._measurements) {
				measurementsArray = Array.from(this._measurements.values());
			}

			return measurementsArray;
		};

		RedlineConversation.prototype._activate = function(tool) {
			var that = this;
			if (!this._objectObserver) {
				var onPropertyChanged = function(change) {
					if (change.type === "property") {
						that.addContent(change.object);
					}
				};
				this._objectObserver = new ManagedObjectObserver(onPropertyChanged);
			}
			this._objectObserver.disconnect();
			tool.importJSON(this.getContent());
			var elements = tool.getRedlineElements();
			for (var i = 0; i < elements.length; i++) {
				this._objectObserver.observe(elements[i], { properties: true });
			}
		};

		RedlineConversation.prototype._deactivate = function() {
			if (this._objectObserver) {
				this._objectObserver.disconnect();
			}
		};

		RedlineConversation.prototype._createCommentFromJSON = function(json) {
			var comment = new RedlineElementComment();
			var userId = comment.importJSON(json);
			this.addComment(comment);
			return userId;
		};

		/**
		 * Exports this conversation as a JSON object
		 * @returns {any} JSON object.
		 */
		RedlineConversation.prototype.exportJSON = function() {
			if (this.getContent()) {
				this.getContent().forEach(function(content) {
					if (!content.createTimestamp) {
						content.createTimestamp = Date.now();
					}
					if (content.deletedByUser) {
						content.deleteTimestamp = Date.now();
					}
				});
			}
			var json = {
				conversationId: this.getElementId(),
				conversationName: this.getConversationName(),
				timestamp: this.getTimestamp() ? this.getTimestamp() : Date.now(),
				sceneView: this.getViewId(),
				viewInfo: this.getViewInfo(),
				animationOffset: this.getAnimationOffset(),
				measurementScale: this.getMeasurementScale(),
				comments:
					this.getComments().map(function(comment) {
						return comment.exportJSON();
					}),
				content: this.getContent(),
				measurements: this.getMeasurements()
			};
			return json;
		};

		/**
		 * Imports a JSON and applies supplied conversation, comments and elements to the conversation
		 * @param {any} json The JSON to import
		 * @returns {Set} A set of user IDs contained within the supplied JSON
		 */
		RedlineConversation.prototype.importJSON = function(json) {
			var userIds = new Set();
			if (json.hasOwnProperty("conversationId")) {
				this._elementId = json.conversationId;
			}
			if (json.hasOwnProperty("conversationName")) {
				this.setConversationName(json.conversationName);
			}
			if (json.hasOwnProperty("timestamp")) {
				this.setTimestamp(json.timestamp);
			}
			if (json.hasOwnProperty("sceneView")) {
				this.setViewId(json.sceneView);
			}
			if (json.hasOwnProperty("viewInfo")) {
				this.setViewInfo(json.viewInfo);
			}
			if (json.hasOwnProperty("animationOffset")) {
				this.setAnimationOffset(json.animationOffset);
			}
			if (json.hasOwnProperty("measurementScale")) {
				this.setMeasurementScale(json.measurementScale);
			}
			if (json.hasOwnProperty("comments")) {
				var comments = json.comments;
				if (comments) {
					for (var i = 0; i < comments.length; i++) {
						var userId = this._createCommentFromJSON(comments[i]);
						if (userId) {
							userIds.add(userId);
						}
					}
				}
			}
			if (json.hasOwnProperty("content")) {
				var content = json.content;
				if (content) {
					for (var j = 0; j < content.length; j++) {
						var creatorId = content[j].createdByUser;
						if (creatorId) {
							userIds.add(creatorId);
						}
						var deleterId = content[j].deletedByUser;
						if (deleterId) {
							userIds.add(deleterId);
						}
						this.addContent(content[j]);
					}
				}
			}
			if (json.hasOwnProperty("measurements")) {
				var measurements = json.measurements;
				if (measurements) {
					for (var k = 0; k < measurements.length; k++) {
						this.addMeasurement(measurements[k]);
					}
				}
			}
			return userIds;
		};

		return RedlineConversation;

	});
