/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.RedlineCollaboration.
sap.ui.define([
	"sap/ui/core/Element",
	"./Core",
	"sap/ui/vk/tools/RedlineTool",
	"./RedlineConversation",
	"sap/ui/vk/uuidv4",
	"sap/ui/vk/RedlineUpgradeManager",
	"sap/ui/core/Core"
], function(
	Element,
	vkCore,
	RedlineTool,
	RedlineConversation,
	uuidv4,
	RedlineUpgradeManager,
	core
) {
	"use strict";

	/**
	 *  Constructor for a new RedlineCollaboration.
	 *
	 * @class Provides a base class control for RedlineCollaborations.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0s
	 * @extends sap.ui.core.Element
	 * @alias sap.ui.vk.RedlineCollaboration
	 * @since 1.89.0
	 */
	var RedlineCollaboration = Element.extend("sap.ui.vk.RedlineCollaboration", {
		metadata: {
			library: "sap.ui.vk",
			aggregations: {
				/**
				 * A list of available conversations.
				 */
				conversations: {
					singularName: "conversation",
					type: "sap.ui.vk.RedlineConversation",
					multiple: true
				}
			},
			associations: {

				viewport: {
					type: "sap.ui.vk.Viewport",
					multiple: false
				},

				/**
				 * Currently active conversation.
				 */
				activeConversation: {
					type: "sap.ui.vk.RedlineConversation",
					multiple: false
				},

				/**
				 * Currently active comment.
				 */
				activeComment: {
					type: "sap.ui.vk.RedlineComment",
					multiple: false
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
				},
				conversationActivating: {
					parameters: {
						conversation: "sap.ui.vk.RedlineConversation"
					}
				},
				conversationActivated: {
					parameters: {
						conversation: "sap.ui.vk.RedlineConversation",
						viewportLocked: "boolean"
					}
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

	RedlineCollaboration.prototype.init = function() {
		this._header = new Map();
	};

	RedlineCollaboration.prototype.exit = function() {
		if (this._tool) {
			this._tool.setActive(false);
			this._tool.destroy();
			this._tool = null;
		}
		var viewport = core.byId(this.getViewport());
		if (viewport) {
			var surface = viewport.getMeasurementSurface();
			surface.detachMeasurementsAdded(this._onmMeasurementsAdded, this);
			surface.detachMeasurementsRemoving(this._onMeasurementsRemoving, this);
			surface.detachScaleChanged(this._onMeasurementsScaleChanged, this);
		}
	};

	/**
	 * Returns the internally generated element id
	 * @returns {string} element id as string
	 */
	RedlineCollaboration.prototype.getElementId = function() {
		return this._elementId;
	};

	/**
	 * Sets the viewport that the internal RedlineTool is called on
	 * @param {sap.ui.vk.Viewport} viewport Viewport to use RedlineTool on
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	RedlineCollaboration.prototype.setViewport = function(viewport) {
		this.setAssociation("viewport", viewport);

		if (!this._tool) {
			this._tool = new RedlineTool();
			this._tool.attachElementCreated(this._onElementCreated, this);
			this._tool.attachElementClicked(this._onElementClicked, this);
			this._tool.attachElementHovered(this._onElementHovered, this);
		} else {
			this._tool.setActive(false, viewport);
		}

		viewport.addTool(this._tool);

		var surface = viewport.getMeasurementSurface();
		surface.attachMeasurementsAdded(this._onMeasurementsAdded, this);
		surface.attachMeasurementsRemoving(this._onMeasurementsRemoving, this);
		surface.attachScaleChanged(this._onMeasurementsScaleChanged, this);

		return this;
	};

	RedlineCollaboration.prototype._onMeasurementsAdded = function(event) {
		var measurements = event.getParameter("measurements");
		if (this.getActiveConversation()) {
			var conversation = core.byId(this.getActiveConversation());
			var comment;
			if (this.getActiveComment()) {
				comment = core.byId(this.getActiveComment());
			}
			measurements.forEach(function(measurement) {
				var json = measurement.toJSON();
				conversation.addMeasurement(json);
				if (comment) {
					comment.addMeasurement(json.id);
				}
			}, this);
		}
	};

	RedlineCollaboration.prototype._onMeasurementsRemoving = function(event) {
		var measurements = event.getParameter("measurements");
		if (this.getActiveConversation()) {
			var conversation = core.byId(this.getActiveConversation());
			measurements.forEach(function(measurement) {
				var id = measurement.getId();
				conversation.removeMeasurement(id);
				var comments = conversation.getComments();
				comments.forEach(function(comment) {
					comment.removeMeasurement(id);
				});
			});
		}
	};

	RedlineCollaboration.prototype._onMeasurementsScaleChanged = function(event) {
		var scale = event.getParameter("newScale");
		if (this.getActiveConversation()) {
			var conversation = core.byId(this.getActiveConversation());
			conversation.setMeasurementScale(scale);
		}
	};

	RedlineCollaboration.prototype._onElementHovered = function(event) {
		this.fireElementHovered({ elementId: event.getParameter("elementId") });
	};

	RedlineCollaboration.prototype._onElementCreated = function(event) {
		var element = event.getParameter("element");
		if (element) {
			if (this.getActiveConversation()) {
				var conversation = core.byId(this.getActiveConversation());
				conversation.addContent(element);
				this._tool.destroyRedlineElements();
				conversation._activate(this._tool);
			}
			if (this.getActiveComment()) {
				var comment = core.byId(this.getActiveComment());
				comment.addContent(element);
			}
		}

		this.fireElementCreated({
			element: element
		});
	};

	RedlineCollaboration.prototype._onElementClicked = function(event) {
		this.fireElementClicked({ elementId: event.getParameter("elementId") });
	};

	/**
	 * Sets a header property used during export
	 * @param {string} key The name of the property
	 * @param {string} value The value of the property
	 * @returns {this} <code>this</code> to allow method chaining..
	 */
	RedlineCollaboration.prototype.setHeaderProperty = function(key, value) {
		this._header.set(key, value);

		return this;
	};

	/**
	 * Retrieves a header property from the provided property name
	 * @param {string} key The name of the property
	 * @returns {string} The value of the property
	 */
	RedlineCollaboration.prototype.getHeaderProperty = function(key) {
		return this._header.get(key);
	};

	/**
	 * Removes a header property using the provided property name
	 * @param {string} key The name of the property
	 * @returns {this} <code>this</code> to allow method chaining..
	 */
	RedlineCollaboration.prototype.removeHeaderProperty = function(key) {
		this._header.delete(key);

		return this;
	};


	/**
	 * Creates a new conversation, adds it to the conversation aggregation, and sets it as the active conversation
	 * @param {string} name The name of the conversation
	 * @returns {sap.ui.vk.RedlineConversation} The newly created conversation
	 */
	RedlineCollaboration.prototype.createConversation = function(name) {
		var conversation = new RedlineConversation({ conversationName: name });
		this.addConversation(conversation);
		this.setActiveConversation(conversation);
		return conversation;
	};

	/**
	 * Sets the currently active conversation and activates it
	 * @param {any|sap.ui.vk.RedlineConversation} conversation The conversation to activate
	 * @returns {this} <code>this</code> to allow method chaining..
	 */
	RedlineCollaboration.prototype.setActiveConversation = function(conversation) {
		var activeConversation = core.byId(this.getActiveConversation());
		if (activeConversation) {
			if (activeConversation.getViewInfo()) {
				var result = this._updateViewInfo();
				activeConversation.setViewInfo(result);
			}
			activeConversation._deactivate();
		}
		this.setAssociation("activeConversation", conversation);
		var viewport = core.byId(this.getViewport());
		if (!viewport) {
			return this;
		}

		if (!conversation) {
			this._tool.setActive(false, viewport);
			return this;
		}

		this.fireConversationActivating({ conversation: conversation });

		this._tool.destroyRedlineElements();

		if (conversation.getViewInfo()) {
			var scene = core.byId(viewport.getContentConnector()).getContent();
			var views = scene.getViews();
			var view;
			for (var j = 0; j < views.length; j++) {
				if (views[j].getViewId() === conversation.getViewId()) {
					view = views[j];
				}
			}
			if (view) {
				vkCore.getEventBus().subscribe("sap.ui.vk", "readyForAnimation", this._readyForAnimation, this);
				var vsm = core.byId(viewport.getViewStateManager());
				var vm = core.byId(vsm.getViewManager());
				this._activatingView = true;
				if (this._tool.getActive()) {
					this._tool.setActive(false, viewport); // RedlineTool must be deactivated before activateView
				}
				vm.activateView(view, true, true);
			}
			if (!this._tool.getActive()) {
				this._tool.setActive(true, viewport);
			}
		} else if (this._tool.getActive()) {
			this._tool.setActive(false, viewport);
		}

		if (conversation.getContent()) {
			conversation._activate(this._tool);
		}

		if (conversation.getMeasurements()) {
			var measurements = conversation.getMeasurements();
			viewport.getMeasurementSurface().fromJSON({ measurements: measurements, scale: conversation.getMeasurementScale() }, true);
			viewport.setShouldRenderFrame();
		}

		this.fireConversationActivated({ conversation: conversation, viewportLocked: this._tool.getActive() });

		return this;

	};

	RedlineCollaboration.prototype._readyForAnimation = function() {
		var viewport = core.byId(this.getViewport());
		if (!viewport) {
			return;
		}
		var conversation = core.byId(this.getActiveConversation());
		if (conversation) {
			var animationPlayer = core.byId(viewport.getViewStateManager()).getAnimationPlayer();
			animationPlayer.setTime(conversation.getAnimationOffset());
			var viewInfo = conversation.getViewInfo();
			if (viewport.getCamera() && viewport.getCamera().getCameraRef()) {
				var camera = viewport.getCamera().getCameraRef();
				if (viewInfo.camera.view && camera && !camera.view) {
					camera.view = viewInfo.camera.view;
					camera.view.enabled = true;
				}
			}
			viewport.setViewInfo(viewInfo);
		}
		this._activatingView = false;
		vkCore.getEventBus().unsubscribe("sap.ui.vk", "readyForAnimation", this._readyForAnimation, this);
	};

	/**
	 * Adds a new RedlineElement to the internal RedlineTool
	 * @param {sap.ui.vk.RedlineElement} redlineElement The RedlineElement to add to the RedlineTool
	 * @returns {sap.ui.vk.RedlineElement} The newly added RedlineElement
	 */
	RedlineCollaboration.prototype.createElement = function(redlineElement) {
		var conversation = core.byId(this.getActiveConversation());
		var viewport = core.byId(this.getViewport());
		if (!viewport) {
			return redlineElement;
		}
		if (conversation && !conversation.getViewInfo()) {
			var result = this._updateViewInfo();
			conversation.setViewId(viewport.getCurrentView().getViewId());
			conversation.setViewInfo(result);
			conversation.setAnimationOffset(core.byId(viewport.getViewStateManager()).getAnimationPlayer().getTime());
		}
		if (!this._tool.getActive()) {
			this._tool.setActive(true, viewport);
		}
		this._tool.startAdding(redlineElement);

		return redlineElement;
	};

	/**
	 * Deactivates redlining drawing
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	RedlineCollaboration.prototype.deactivateRedlineDrawing = function() {
		if (this._tool) {
			this._tool.stopAdding();
		}

		return this;
	};

	/**
	 * Removes a RedlineElement from the active conversation
	 * @param {any|string|sap.ui.vk.RedlineElement} redlineElement RedlineElement, RedlineElement JSON representation, or RedlineElement id to remove
	 * @returns {this} <code>this</code> to allow method chaining..
	 */
	RedlineCollaboration.prototype.removeElement = function(redlineElement) {
		var conversation = core.byId(this.getActiveConversation());
		if (conversation) {
			conversation.removeContent(redlineElement);
			this._tool.destroyRedlineElements();
			conversation._activate(this._tool);
		}

		return this;
	};

	RedlineCollaboration.prototype._normalizeElementsArray = function(elements) {
		var normalizedArray = [];
		var currentElements = this.getActiveRedlineElements();
		if (Array.isArray(elements)) {
			for (var i = 0; i < elements.length; i++) {
				if (elements[i] instanceof sap.ui.vk.RedlineElement) {
					normalizedArray.push(elements[i]);
				} else {
					for (var j = 0; j < currentElements.length; j++) {
						if (elements[i] === currentElements[j].getElementId()) {
							normalizedArray.push(currentElements[j]);
						}
					}
				}
			}
		} else if (elements instanceof sap.ui.vk.RedlineElement) {
			normalizedArray.push(elements);
		} else {
			for (var k = 0; k < currentElements.length; k++) {
				if (elements === currentElements[k].getElementId()) {
					normalizedArray.push(currentElements[k]);
				}
			}
		}

		return normalizedArray;
	};

	/**
	 * Highlights provided RedlineElements
	 * @param {sap.ui.vk.RedlineElement|sap.ui.vk.RedlineElement[]|string|string[]} elements RedlineElement, RedlineElement id, or array of either, to highlight
	 * @param {any} color in rgb(r, g, b) or rgba(r, g, b, a) format. If no Alpha value is provided it is assumed to be 1. If no color is provided, default color is used
	 * @returns {this} <code>this</code> to allow method chaining..
	 */
	RedlineCollaboration.prototype.setHighlight = function(elements, color) {
		if (!elements) {
			return this;
		}

		var normalizedArray = this._normalizeElementsArray(elements);

		for (var i = 0; i < normalizedArray.length; i++) {
			var element = normalizedArray[i];
			element.setHalo(true);
			if (color) {
				element.setHaloColor(color);
			} else if (this._tool._haloColor) {
				element.setHaloColor(this._tool._haloColor);
			} else {
				element.setHaloColor("rgba(255, 0, 0, 1)");
			}
		}

		this._tool.getGizmo().rerender();

		return this;
	};

	/**
	 * Sets the color to use when highlighting, when no color is provided to setHighlight
	 * @param {any} color Color in rgb(r, g, b) or rgba(r, g, b, a) format. If no Alpha value is provided it is assumed to be 1
	 * @returns {this} <code>this</code> to allow method chaining..
	 */
	RedlineCollaboration.prototype.setDefaultHighlightColor = function(color) {
		if (color) {
			this._tool._haloColor = color;
		}

		return this;
	};


	/**
	 * Removes highlight from provided RedlineElements
	 * @param {sap.ui.vk.RedlineElement|sap.ui.vk.RedlineElement[]|string|string[]} elements RedlineElement, RedlineElement id, or array of either, to remove highlight from
	 * @returns {this} <code>this</code> to allow method chaining..
	 */
	RedlineCollaboration.prototype.clearHighlight = function(elements) {
		if (!elements) {
			return this;
		}

		var normalizedArray = this._normalizeElementsArray(elements);

		for (var i = 0; i < normalizedArray.length; i++) {
			normalizedArray[i].setHalo(false);
		}

		this._tool.getGizmo().rerender();

		return this;
	};

	/**
	 * Adds a style class to the internal tool's gizmo
	 * @param {string} className Style class name
	 * @returns {this} <code>this</code> to allow method chaining..
	 */
	RedlineCollaboration.prototype.addStyleClass = function(className) {
		if (className && this._tool) {
			this._tool.getGizmo().addStyleClass(className);
		}

		return this;
	};

	/**
	 * Removes a style class to the internal tool's gizmo
	 * @param {string} className Style class name
	 * @returns {this} <code>this</code> to allow method chaining..
	 */
	RedlineCollaboration.prototype.removeStyleClass = function(className) {
		if (className && this._tool) {
			this._tool.getGizmo().removeStyleClass(className);
		}

		return this;
	};

	/**
	 * Toggles a style class on the internal tool's gizmo
	 * @param {string} className Style class name
	 * @returns {this} <code>this</code> to allow method chaining..
	 */
	RedlineCollaboration.prototype.toggleStyleClass = function(className) {
		if (className && this._tool) {
			this._tool.getGizmo().toggleStyleClass(className);
		}

		return this;
	};

	RedlineCollaboration.prototype._updateViewInfo = function() {
		var viewport = core.byId(this.getViewport());
		if (!viewport) {
			return {};
		}
		var query = {
			camera: {
				matrices: true
			},
			visibility: true,
			selection: true
		};
		var result = viewport.getViewInfo(query);
		return result;
	};

	/**
	 * Retrieves the current viewInfo and applies it to the active conversation if the active conversation has no viewInfo.
	 * Activates the internal RedlineTool if it is not already active
	 * @returns {this} <code>this</code> to allow method chaining..
	 */
	RedlineCollaboration.prototype.freezeView = function() {
		var conversation = core.byId(this.getActiveConversation());
		var viewport = core.byId(this.getViewport());
		if (!viewport) {
			return this;
		}
		if (conversation && !conversation.getViewInfo()) {
			var result = this._updateViewInfo();
			conversation.setViewId(viewport.getCurrentView().getViewId());
			conversation.setViewInfo(result);
			conversation.setAnimationOffset(core.byId(viewport.getViewStateManager()).getAnimationPlayer().getTime());
		}
		if (!this._tool.getActive()) {
			this._tool.setActive(true, viewport);
		}

		return this;
	};

	/**
	 * Deactivates the internal RedlineTool if the active conversation has no redline elements or
	 * comments, or if it has a single comment without any text, and the RedlineTool is already active.
	 *
	 * Clears the viewInfo of the active conversation
	 * @returns {this} <code>this</code> to allow method chaining..
	 */
	RedlineCollaboration.prototype.unfreezeView = function() {
		var conversation = core.byId(this.getActiveConversation());
		if (conversation) {
			var comments = conversation.getComments();
			if (this._tool.getActive() && this._tool.getRedlineElements().length === 0 && (comments.length === 0 || (comments.length === 1 && !comments[0].getText()))) {
				this._tool.setActive(false);
				conversation.setViewInfo(null);
			}
		}

		return this;
	};

	/**
	 * Retrieves RedlineElements from active conversation
	 * @returns {Object[]} Array of redline elements
	 **/
	RedlineCollaboration.prototype.getActiveRedlineElements = function() {
		if (this._tool) {
			var elements = this._tool.getRedlineElements();
			return elements;
		}
	};

	RedlineCollaboration.prototype._createConversationFromJSON = function(json) {
		var conversation = new RedlineConversation();
		var userIds = conversation.importJSON(json);
		this.addConversation(conversation);
		return userIds;
	};


	/**
	 * Imports a JSON and applies supplied conversations, comments and elements to the collaboration
	 * @param {any} json The JSON to import
	 * @returns {Set} A set of user IDs contained within the supplied JSON
	 */
	RedlineCollaboration.prototype.importJSON = function(json) {
		json = RedlineUpgradeManager.upgrade(json);
		var userIds = new Set();
		this.setActiveConversation(null);
		this.destroyConversations();
		this.setActiveComment(null);
		var headerProperties = Object.entries(json.header);
		for (var i = 0; i < headerProperties.length; i++) {
			this.setHeaderProperty(headerProperties[i][0], headerProperties[i][1]);
		}
		this._elementId = this.getHeaderProperty("elementId");
		var jsonConversations = json.conversations;
		if (jsonConversations) {
			for (var j = 0; j < jsonConversations.length; j++) {
				var ids = this._createConversationFromJSON(jsonConversations[j]);
				ids.forEach(userIds.add, userIds);
			}
		}
		var initialId = this.getHeaderProperty("initialConversation");
		var conversations = this.getConversations();
		var initialConversation;
		if (conversations) {
			for (var k = 0; k < conversations.length; k++) {
				if (conversations[k].getElementId() === initialId) {
					initialConversation = conversations[k];
					break;
				}
			}
		}
		this.setActiveConversation(initialConversation);

		return userIds;
	};

	/**
	 * Exports the collaboration as a JSON
	 * @returns {any} The exported JSON
	 */
	RedlineCollaboration.prototype.exportJSON = function() {
		var activeId = "";
		if (this.getActiveConversation()) {
			var activeConversation = core.byId(this.getActiveConversation());
			if (!this._activatingView && activeConversation.getViewInfo()) {
				var result = this._updateViewInfo();
				activeConversation.setViewInfo(result);
			}
			activeId = activeConversation.getElementId();
		}
		this.setHeaderProperty("initialConversation", activeId);
		if (!this.getHeaderProperty("elementId")) {
			this.setHeaderProperty("elementId", this._elementId);
		}
		var headerObject = Object.fromEntries(this._header);
		var json = {
			schemaVersion: "1.0",
			header:
				headerObject,
			conversations:
				this.getConversations().map(function(conversation) {
					return conversation.exportJSON();
				})
		};

		return json;
	};

	return RedlineCollaboration;

});
