/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.ListPanelStack.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/layout/library",
	"./ListPanelStackRenderer"
], function(
	vkLibrary,
	Control,
	layoutLibrary,
	ListPanelStackRenderer
) {
	"use strict";

	/**
	 * Constructor for a new ListPanelStack.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class ListPanelStack control
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.ListPanelStack
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @experimental Since 1.38.0 This class is experimental and might be modified or removed in future versions.
	 */
	var ListPanelStack = Control.extend("sap.ui.vk.ListPanelStack", /** @lends sap.ui.vk.ListPanelStack.prototype */ {
		metadata: {

			library: "sap.ui.vk",
			properties: {
				/**
				 * Control width
				 */
				"width": {
					type: "sap.ui.core.CSSSize",
					group: "Misc",
					defaultValue: "100%"
				},
				/**
				 * Expansion state
				 */
				"expanded": {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Expand animation
				 */
				"expandAnimation": {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Ability to collapse
				 */
				"collapsible": {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				}
			},
			aggregations: {

				"content": {
					type: "sap.ui.vk.ListPanel",
					multiple: true,
					singularName: "content"
				},
				/**
				 * hidden layout aggregation needed for binding
				 */
				"layout": {
					type: "sap.ui.layout.VerticalLayout",
					multiple: false,
					visibility: "hidden"
				}
			}
		}
	});

	// ...........................................................................//
	// This file defines behavior for the control,...............................//
	// ...........................................................................//
	// Public API functions
	// ............................................................................//

	// ........................................................................//
	// Implementation of UI5 Interface functions
	// ........................................................................//
	ListPanelStack.prototype.init = function() {
		// do something for initialization...
		this._oLayout = new sap.ui.layout.VerticalLayout();
		// default expandAnimation: true
		this._oLayout.addStyleClass("sapUiVkLPSTrans");
		this.setAggregation("layout", this._oLayout, /* bSuppressInvalidate= */ true);
		this._bFirstTime = true;
	};

	ListPanelStack.prototype.exit = function() {
		if (this._oLayout) {
			this._oLayout.destroy();
			this._oLayout = undefined;
		}
	};

	ListPanelStack.prototype.getContent = function() {
		return this._oLayout.getContent();
	};

	ListPanelStack.prototype.addContent = function(oObject) {
		oObject.attachExpand(this._onContentExpand.bind(this));
		oObject.attachHeaderIconPress(this._onContentHeaderIconPress.bind(this));
		return this._oLayout.addContent(oObject);
	};

	ListPanelStack.prototype.removeContent = function(oObject) {
		return this._oLayout.removeContent(oObject);
	};

	ListPanelStack.prototype.insertContent = function(oObject, iIndex) {
		return this._oLayout.insertContent(oObject, iIndex);
	};

	ListPanelStack.prototype.removeAllContent = function() {
		return this._oLayout.removeAllContent();
	};

	ListPanelStack.prototype.getWidth = function() {
		return this._oLayout.getWidth();
	};

	ListPanelStack.prototype.setWidth = function(value) {
		this.setProperty("width", value, true);
		return this._oLayout.setWidth(value);
	};

	ListPanelStack.prototype.setExpanded = function(value) {
		if (value != this.getExpanded()) {
			if (value) {
				this._expand();
			} else {
				this._collapse();
			}
		}
		return this;
	};

	ListPanelStack.prototype.setExpandAnimation = function(value) {
		this._oLayout.removeStyleClass("sapUiVkLPSTrans");
		if (value) {
			this._oLayout.addStyleClass("sapUiVkLPSTrans");
		}
		return this.setProperty("expandAnimation", value, true);
	};

	ListPanelStack.prototype.onBeforeRendering = function() {
		if (this._bFirstTime) {
			// check expand state of all content panels to determine initial expand state for stack
			var bExpanded = false;
			var aContent = this.getContent();
			for (var i = 0; i < aContent.length; ++i) {
				if (aContent[i].getExpanded()) {
					bExpanded = true;
				}
			}
			this.setExpanded(bExpanded);
			this._bFirstTime = false;
		}
	};

	ListPanelStack.prototype.onAfterRendering = function() {
		// If the control is not expanded, then it means it's collapsed
		// so we applied the required width.
		if (!this.getExpanded()) {
			this._updateCollapsedLayoutWidth();
		}
	};

	// ...............................................................................
	// Internal functions
	// ...............................................................................

	ListPanelStack.prototype._onContentExpand = function(oEvent) {
		var expanded = false;
		var aContent = this._oLayout.getContent();
		for (var i = 0; i < aContent.length; ++i) {
			if (aContent[i].getExpanded()) {
				expanded = true;
			}
		}
		this.setExpanded(expanded);
	};

	ListPanelStack.prototype._onContentHeaderIconPress = function(oEvent) {
		var bsetExpand = oEvent.oSource.getExpanded() ? false : true;
		oEvent.oSource.setExpanded(bsetExpand);
		var bExpand = false;
		var aContent = this._oLayout.getContent();
		for (var i = 0; i < aContent.length; ++i) {
			if (aContent[i].getExpanded()) {
				bExpand = true;
				break;
			}
		}
		this.setExpanded(bExpand);

	};

	ListPanelStack.prototype._expand = function() {
		this._oLayout.removeStyleClass("sapUiVkLPSCollapse");
		this._oLayout.setWidth(this.getProperty("width"));
		this.setProperty("expanded", true, true);
	};

	ListPanelStack.prototype._collapse = function() {
		if (!this.getCollapsible()) {
			return;
		}

		// make sure all panels are collapsed
		var aContent = this.getContent();
		for (var i = 0; i < aContent.length; ++i) {
			aContent[i].setExpanded(false);
		}
		// collapse the stack
		this._oLayout.addStyleClass("sapUiVkLPSCollapse");

		this._updateCollapsedLayoutWidth();

		this.setProperty("expanded", false, true);
	};

	ListPanelStack.prototype._updateCollapsedLayoutWidth = function() {
		// Checking if any ancestor of this element has the compact class;
		// we do not to apply the cozy size if the sapUiSizeCompact class
		// exists on an element which is not an ancestor.
		if (this._oLayout.$().closest(".sapUiSizeCompact").length === 0) {
			this._oLayout.setWidth("3rem");
		} else {
			this._oLayout.setWidth("2.5rem");
		}
	};

	return ListPanelStack;

});
