/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.ListPanel.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/m/library",
	"./ListPanelRenderer"
], function(
	vkLibrary,
	Control,
	mobileLibrary,
	ListPanelRenderer
) {
	"use strict";

	/**
	 * Constructor for a new ListPanel.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Aggregation control for the Legend
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.ListPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @experimental Since 1.38.0 This class is experimental and might be modified or removed in future versions.
	 */
	var ListPanel = Control.extend("sap.ui.vk.ListPanel", /** @lends sap.ui.vk.ListPanel.prototype */ {
		metadata: {

			library: "sap.ui.vk",
			properties: {
				/**
				 * Header text
				 */
				"headerText": {
					type: "string",
					group: "Misc"
				},
				/**
				 * Header icon
				 */
				"headerIcon": {
					type: "sap.ui.core.URI",
					group: "Misc"
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
				 * Selection Mode
				 */
				"selectionMode": {
					type: "sap.m.ListMode",
					group: "Misc",
					defaultValue: sap.m.ListMode.MultiSelect
				}

			},
			aggregations: {
				/**
				 * Item aggregation
				 */
				"items": {
					type: "sap.m.ListItemBase",
					multiple: true,
					singularName: "item"
				},
				/**
				 * hidden panel aggregation needed for binding
				 */
				"panel": {
					type: "sap.m.Panel",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				/**
				 * Event is fired if the header icon is pressed
				 */
				headerIconPress: {},
				/**
				 * Event is fired if the panel is expanded of collapsed
				 */
				expand: {},
				/**
				 * Event is fired when selection is changed via user interaction inside the control.
				 */
				selectionChange: {
					parameters: {

						/**
						 * The item whose selection has changed. In <code>MultiSelect</code> mode, only the up-most selected item is returned. This
						 * parameter can be used for single-selection modes.
						 */
						listItem: {
							type: "sap.m.ListItemBase"
						},

						/**
						 * Array of items whose selection has changed. This parameter can be used for <code>MultiSelect</code> mode.
						 */
						listItems: {
							type: "sap.m.ListItemBase[]"
						},

						/**
						 * Indicates whether the <code>listItem</code> parameter is selected or not.
						 */
						selected: {
							type: "boolean"
						}
					}
				},
				/**
				 * Event is fired when an item is pressed unless the item's <code>type</code> property is <code>Inactive</code>.
				 */
				itemPress: {
					parameters: {

						/**
						 * The item which fired the pressed event.
						 */
						listItem: { type: "sap.m.ListItemBase" },

						/**
						 * The control which caused the press event within the container.
						 */
						srcControl: { type: "sap.ui.core.Control" }
					}
				}
			}
		}
	});

	// ...........................................................................//
	// This file defines behavior for the control,...............................//
	// ...........................................................................//
	// Public API functions
	// ............................................................................//

	/**
	 * Returns selected list item. When no item is selected, "null" is returned. When "multi-selection" is enabled and multiple items are selected, only the up-most selected item is returned.
	 * @returns {sap.m.ListItemBase} Selected item.
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListPanel.prototype.getSelectedItem = function() {
		return this._oList.getSelectedItem();
	};

	/**
	 * Selects or deselects the given list item.
	 *
	 * @param {sap.m.ListItemBase} oListItem
	 *         The list item whose selection to be changed. This parameter is mandatory.
	 * @param {boolean} bSelect
	 *         Sets selected status of the list item. Default value is true.
	 * @param {boolean} bFireEvent Whether to fire the event or not.
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListPanel.prototype.setSelectedItem = function(oListItem, bSelect, bFireEvent) {
		this._oList.setSelectedItem(oListItem, bSelect, bFireEvent);
	};

	/**
	 * Returns an array containing the selected list items. If no items are selected, an empty array is returned.
	 *
	 * @returns {sap.m.ListItemBase[]} Selected items
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListPanel.prototype.getSelectedItems = function() {
		return this._oList.getSelectedItems();
	};

	// ........................................................................//
	// Implementation of UI5 Interface functions
	// ........................................................................//
	ListPanel.prototype.init = function() {
		// do something for initialization...
		this._oList = new sap.m.ListBase({
			mode: this.getSelectionMode(),
			itemPress: this.fireItemPress.bind(this),
			selectionChange: this.fireSelectionChange.bind(this)
		});

		this._oPanel = new sap.m.Panel({
			expandable: true,
			expanded: true,
			expandAnimation: true,
			headerToolbar: new sap.m.Toolbar({
				active: false
			}),
			content: [
				this._oList
			],
			expand: this.fireExpand.bind(this)
		});
		this._oPanel.getHeaderToolbar().addStyleClass("sapUiVkLPTb");
		this.setAggregation("panel", this._oPanel, /* bSuppressInvalidate= */ true);

		this._oHeaderIcon = null;
		this._oHeaderText = null;
		this._bHeaderToolbarChanged = true;

	};

	ListPanel.prototype.exit = function() {
		this._destroyControl(this._oList);
		this._destroyControl(this._oPanel);
		this._destroyControl(this._oHeaderIcon);
		this._destroyControl(this._oHeaderText);
	};

	ListPanel.prototype.getItems = function() {
		return this._oList.getItems();
	};

	ListPanel.prototype.addItem = function(oObject) {
		return this._oList.addItem(oObject);
	};

	ListPanel.prototype.insertItem = function(oObject, iIndex) {
		return this._oList.insertItem(oObject, iIndex);
	};

	ListPanel.prototype.removeItem = function(oObject) {
		return this._oList.removeItem(oObject);
	};

	ListPanel.prototype.removeAllItems = function() {
		return this._oList.removeAllItems();
	};

	ListPanel.prototype.setHeaderText = function(value) {
		if (!this._oHeaderText) {
			this._oHeaderText = new sap.m.Title();
		}
		this._oHeaderText.setText(value);
		this._bHeaderToolbarChanged = true;

		if (this._oHeaderIcon) {
			this._oHeaderIcon.setTooltip(value);
			this._oHeaderIcon.addAriaLabelledBy(this._oHeaderText);
			this._oHeaderIcon.addAriaDescribedBy(this._oHeaderText);
		}
		return this.setProperty("headerText", value);
	};

	ListPanel.prototype.getExpanded = function() {
		return this._oPanel.getExpanded();
	};

	ListPanel.prototype.setExpanded = function(value) {
		return this._oPanel.setExpanded(value);
	};

	ListPanel.prototype.getExpandAnimation = function() {
		return this._oPanel.getExpandAnimation();
	};

	ListPanel.prototype.setExpandAnimation = function(value) {
		return this._oPanel.setExpandAnimation(value);
	};

	ListPanel.prototype.setHeaderIcon = function(value) {
		if (!this._oHeaderIcon) {
			this._oHeaderIcon = new sap.m.Button({
				press: this.fireHeaderIconPress.bind(this),
				type: sap.m.ButtonType.Transparent,
				tooltip: this.getHeaderText()
			});
		}
		this._oHeaderIcon.setIcon(value);
		this._bHeaderToolbarChanged = true;

		if (this._oHeaderText) {
			this._oHeaderIcon.addAriaLabelledBy(this._oHeaderText);
		}

		return this.setProperty("headerIcon", value);
	};

	ListPanel.prototype.setSelectionMode = function(value) {
		this._oList.setMode(value);
		return this.setProperty("selectionMode", value);
	};

	ListPanel.prototype.onBeforeRendering = function() {
		if (this._bHeaderToolbarChanged) {
			var oToolbar = this._oPanel.getHeaderToolbar();
			oToolbar.removeAllContent();
			if (this._oHeaderIcon) {
				oToolbar.addContent(this._oHeaderIcon);
			}
			if (this._oHeaderText) {
				oToolbar.addContent(this._oHeaderText);
			}
			this._bHeaderToolbarChanged = false;
		}
	};

	// ...............................................................................
	// Internal functions
	// ...............................................................................

	ListPanel.prototype._destroyControl = function(oControl) {
		if (oControl) {
			oControl.destroy();
			oControl = undefined;
		}
	};

	return ListPanel;

});
