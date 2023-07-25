/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.SplitButton.
sap.ui.define([  'sap/ui/commons/library', 'sap/ui/commons/Button', 'sap/ui/commons/MenuButton', 'sap/ui/commons/MenuItem', 'sap/ui/core/Control', './SplitButtonRenderer' ],
	function(CommonsLibrary, Button, MenuButton, MenuItem, Control, SplitButtonRenderer) {
	"use strict";

	/**
	 * Constructor for a new SplitButton.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The Split Button Control is a composite control that consists of a default-action Button and a Menu Button control.
	 * The default-action button control represents a simple push button. It is used for initiating actions, such as save or print. It can contain some text, an icon, or both; the order of the two can be configured. The action initiated by this button is considered to be the default action for the control, and it must be one of the selections defined in the Menu Button menu.
	 * The Menu Button control is a button that opens a menu upon user's click. MenuButton is a composition of the Menu control and the Button control and thus inheriting all features. When a menu item is selected by the user, MenuButton throws an event called itemSelected. The event transfers the itemId of the selected item. As an alternative, the button press event can be used which has a similar behavior.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. Not Fiori.
	 * @alias sap.suite.ui.commons.SplitButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SplitButton = Control.extend("sap.suite.ui.commons.SplitButton", /** @lends sap.suite.ui.commons.SplitButton.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Invisible split buttons are not rendered
				 */
				visible: { type: "boolean", group: "Misc", defaultValue: true },

				/**
				 * Boolean property to enable the control (default is true). Buttons that are disabled have other colors than enabled ones, depending on custom settings.
				 */
				enabled: { type: "boolean", group: "Behavior", defaultValue: true },

				/**
				 * The split button is rendered as lite split button.
				 */
				lite: { type: "boolean", group: "Appearance", defaultValue: false },

				/**
				 * Style of the control (e.g. emphasized, accept)
				 */
				style: {
					type: "sap.ui.commons.ButtonStyle",
					group: "Appearance",
					defaultValue: "Default"
				},

				/**
				 * Indicatied if the button is styled. If not it is rendered as native HTML-button. In this case a custom styling can be added usig addStyleClass.
				 */
				styled: { type: "boolean", group: "Appearance", defaultValue: true },

				/**
				 * If set to true (default), the display sequence is 1. icon 2. control text .
				 */
				iconFirst: { type: "boolean", group: "Appearance", defaultValue: true },

				/**
				 * Text to be displayed for the action button.
				 */
				text: { type: "string", group: "Appearance", defaultValue: '' },

				/**
				 * Icon to be displayed as graphical element within the action button.
				 */
				icon: { type: "sap.ui.core.URI", group: "Appearance", defaultValue: '' }
			},
			aggregations: {

				/**
				 * Menu that shall be opened when the menu part of the button is clicked
				 */
				menu: { type: "sap.ui.commons.Menu", multiple: false }
			}
		}
	});

	/**
	 * Checks that oMenuItem is in oMenu.
	 *
	 * @param {sap.ui.commons.Menu} oMenu Menu
	 * @param {sap.ui.commons.MenuItem} oMenuItem Item of menu
	 * @return {boolean} true if the oMenuItem exists in the menu, false otherwise
	 * @private
	 */
	function existingMenuItem(oMenu, oMenuItem) {

		if (!oMenuItem || !oMenu || oMenu.getItems().length === 0) {
			return false;
		}

		if (oMenu.indexOfItem(oMenuItem) >= 0) {
			return true;
		}

		var aItems = oMenu.getItems();
		var oSubmenu = null;

		for (var i = 0; i < aItems.length; i++) {
			oSubmenu = aItems[i].getSubmenu();
			if (existingMenuItem(oSubmenu, oMenuItem)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Interceptor method for menu item <code>setVisible()</code> method. Resets the menu is this menu item is not visible.
	 *
	 * @param {sap.suite.ui.commons.SplitButton} oSplitButton The SplitButton control
	 * @return {function} Proxy function
	 * @private
	 */
	function menuItemSetVisibleInterceptor(oSplitButton) {
		return function() {
			MenuItem.prototype.setVisible.apply(oSplitButton._oMenuItem, arguments);

			if (!oSplitButton._oMenuItem.getVisible()) {
				oSplitButton.setMenu(oSplitButton._oMenuButton.getMenu());
			}
			return oSplitButton._oMenuItem;
		};
	}

	/**
	 * Interceptor method for menu item <code>setIcon()</code> method. Updates default action button icon as well if it is not set.
	 *
	 * @param {sap.suite.ui.commons.SplitButton} oSplitButton The SplitButton control
	 * @return {function} Proxy function
	 * @private
	 */
	function menuItemSetIconInterceptor(oSplitButton) {
		return function() {
			MenuItem.prototype.setIcon.apply(oSplitButton._oMenuItem, arguments);
			if (!oSplitButton.getIcon()) {
				oSplitButton._oDefaultActionButton.setIcon(oSplitButton._oMenuItem.getIcon());
			}
			return oSplitButton._oMenuItem;
		};
	}

	/**
	 * Interceptor method for menu item <code>setTooltip()</code> method. Updates default action button tooltip as well.
	 *
	 * @param {sap.suite.ui.commons.SplitButton} oSplitButton The SplitButton control
	 * @return {function} Proxy function
	 * @private
	 */
	function menuItemSetTooltipInterceptor(oSplitButton) {
		return function() {
			MenuItem.prototype.setTooltip.apply(oSplitButton._oMenuItem, arguments);
			oSplitButton._oDefaultActionButton.setTooltip(oSplitButton._oMenuItem.getTooltip());
			return oSplitButton._oMenuItem;
		};
	}

	/**
	 * Interceptor method for menu item <code>setTooltip()</code> method. Updates default action button text as well if it is not set.
	 *
	 * @param {sap.suite.ui.commons.SplitButton} oSplitButton The SplitButton control
	 * @return {function} Proxy function
	 * @private
	 */
	var menuItemSetTextInterceptor = function(oSplitButton) {
		return function() {
			MenuItem.prototype.setText.apply(oSplitButton._oMenuItem, arguments);
			if (!oSplitButton.getText()) {
				oSplitButton._oDefaultActionButton.setText(oSplitButton._oMenuItem.getText());
			}
			return oSplitButton._oMenuItem;
		};
	};

	/**
	 * Interceptor method for menu item <code>setEnabled()</code> method. Updates default action button as well with new property value if the control is enabled.
	 *
	 * @param {sap.suite.ui.commons.SplitButton} oSplitButton The SplitButton control
	 * @return {function} Proxy function
	 * @private
	 */
	var menuItemSetEnabledInterceptor = function(oSplitButton) {
		return function() {
			MenuItem.prototype.setEnabled.apply(oSplitButton._oMenuItem, arguments);
			if (oSplitButton.getEnabled()) {
				oSplitButton._oDefaultActionButton.setEnabled(oSplitButton._oMenuItem.getEnabled());
			}
			return oSplitButton._oMenuItem;
		};
	};

	SplitButton.prototype.init = function() {

		this._oDefaultActionButton = new Button(this.getId() + "-defaultActionButton");
		// when default button is clicked and _menuItem is set then the event
		// will be fired
		this._oDefaultActionButton.attachPress(function() {

			if (this._oMenuItem) {
				this._oMenuItem.fireSelect();
			}
		}, this);

		this._oMenuButton = new MenuButton(this.getId() + "-menuButton");
		this._oMenuButton.addStyleClass("sapSuiteUiCommonsSplitButton-menuButton");
		if (this.getMenu()) {
			this._oMenuButton.setMenu(this.getMenu());
		}
	};

	SplitButton.prototype.exit = function() {

		this.destroyAggregation("menu", true);
		this._oDefaultActionButton.destroy();
		this._oDefaultActionButton = null;
		this._oMenuButton.destroy();
		this._oMenuButton = null;
	};

	/**
	 * Set the menu to the button and set menu item for the action button. The menu item for action button must exist in the menu. If it doesn't exist the first menu item is set by
	 * default.
	 *
	 * @param {sap.ui.commons.Menu} oMenu Menu
	 * @param {sap.ui.commons.MenuItem} oMenuItem Item of menu
	 * @return {sap.suite.ui.commons.SplitButton} <code>this</code> to allow method chaining
	 * @public
	 */
	SplitButton.prototype.setMenu = function(oMenu, oMenuItem) {
		this._oMenuButton.setMenu(oMenu);

		if (existingMenuItem(oMenu, oMenuItem) && oMenuItem.getVisible()) {
			this._oMenuItem = oMenuItem;
		} else if (oMenu && oMenu.getItems()) { // set first menu item by default
			var firstMenuItem = oMenu.getItems()[0];
			if (firstMenuItem && firstMenuItem.getVisible()) {
				this._oMenuItem = firstMenuItem;
			} else {
				this._oMenuItem = null;
			}
		}

		if (this._oMenuItem) {
			if (!this.getText()) {
				this._oDefaultActionButton.setText(this._oMenuItem.getText() || null);
			}
			if (!this.getIcon()) {
				this._oDefaultActionButton.setIcon(this._oMenuItem.getIcon() || null);
			}
			if (this.getEnabled()) {
				this._oDefaultActionButton.setEnabled(this._oMenuItem.getEnabled());
			}

			this._oDefaultActionButton.setTooltip(this._oMenuItem.getTooltip() || null);

			this._oMenuItem.setTooltip = menuItemSetTooltipInterceptor(this);
			this._oMenuItem.setText = menuItemSetTextInterceptor(this);
			this._oMenuItem.setIcon = menuItemSetIconInterceptor(this);
			this._oMenuItem.setEnabled = menuItemSetEnabledInterceptor(this);
			this._oMenuItem.setVisible = menuItemSetVisibleInterceptor(this);
		}

		return this;
	};

	SplitButton.prototype.getMenu = function() {

		return this._oMenuButton.getMenu();
	};

	SplitButton.prototype.destroyMenu = function() {

		this._oMenuButton.destroyMenu();
		return this;
	};

	SplitButton.prototype.setEnabled = function(bEnabled) {

		this._oDefaultActionButton.setEnabled(bEnabled);
		this._oMenuButton.setEnabled(bEnabled);
		this.setProperty("enabled", bEnabled);

		return this;
	};

	SplitButton.prototype.setLite = function(bLite) {

		this._oDefaultActionButton.setLite(bLite);
		this._oMenuButton.setLite(bLite);
		this.setProperty("lite", bLite);

		return this;
	};

	SplitButton.prototype.setStyle = function(oStyle) {

		this._oDefaultActionButton.setStyle(oStyle);
		this._oMenuButton.setStyle(oStyle);
		this.setProperty("style", oStyle);

		return this;
	};

	SplitButton.prototype.setStyled = function(bStyled) {

		this._oDefaultActionButton.setStyled(bStyled);
		this._oMenuButton.setStyled(bStyled);
		this.setProperty("styled", bStyled);

		return this;
	};

	SplitButton.prototype.setIconFirst = function(bIconFirst) {

		this._oDefaultActionButton.setIconFirst(bIconFirst);
		this.setProperty("iconFirst", bIconFirst);

		return this;
	};

	SplitButton.prototype.setIcon = function(sIcon) {

		this._oDefaultActionButton.setIcon(sIcon);
		this.setProperty("icon", sIcon);

		return this;
	};

	SplitButton.prototype.setText = function(sText) {

		this._oDefaultActionButton.setText(sText);
		this.setProperty("text", sText);

		return this;
	};

	return SplitButton;

});
