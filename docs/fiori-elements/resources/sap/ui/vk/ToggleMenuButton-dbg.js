/*!
* SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
*/

// Provides control sap.ui.vk.ToggleMenuButton.
sap.ui.define([
	"./library",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/m/library",
	"sap/m/Button",
	"sap/m/ButtonRenderer",
	"sap/m/ToggleButton",
	"sap/m/Menu",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/IconPool",
	"sap/ui/core/library",
	"sap/ui/core/Popup",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"./ToggleMenuButtonRenderer"
], function(
	library,
	core,
	Control,
	MLibrary,
	Button,
	ButtonRenderer,
	ToggleButton,
	Menu,
	EnabledPropagator,
	IconPool,
	CoreLibrary,
	Popup,
	Device,
	KeyCodes,
	ToggleMenuButtonRenderer
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = CoreLibrary.TextDirection;

	// shortcut for sap.m.ButtonType
	var ButtonType = MLibrary.ButtonType;

	// shortcut for sap.ui.core.Popup.Dock
	var Dock = Popup.Dock;

	/**
	 * Constructor for a new <code>ToggleMenuButton</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Enables users to trigger actions.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.ToggleMenuButton
	 */
	var ToggleMenuButton = Control.extend("sap.ui.vk.ToggleMenuButton", /** @lends sap.ui.vk.ToggleMenuButton.prototype */ {
		metadata: {

			interfaces: [
				"sap.m.IOverflowToolbarContent"
			],
			library: "sap.ui.vk",
			properties: {
				/**
				 * Defines the type of the button (for example, Default, Accept, Reject, Transparent).
				 * Values <code>Back</code>, <code>Up</code> and <code>Unstyled</code> are ignored.
				 */
				type: { type: "sap.m.ButtonType", group: "Appearance", defaultValue: ButtonType.Default },

				/**
				 * Defines the width of the button.
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: null },

				/**
				 * Boolean property to enable the control (default is <code>true</code>).
				 * <b>Note:</b> Depending on custom settings, the buttons that are disabled have other colors than the enabled ones.
				 */
				enabled: { type: "boolean", group: "Behavior", defaultValue: true },

				/**
				 * When set to <code>true</code (default), one or more requests are sent trying to get
				 * the density perfect version of image if this version of image doesn't exist on the server.
				 * If only one version of image is provided, set this value to <code>false</code> to
				 * avoid the attempt of fetching density perfect image.
				 */
				iconDensityAware: { type: "boolean", group: "Misc", defaultValue: true },

				/**
				 * Specifies the position of the popup menu with enumerated options.
				 * By default, the control opens the menu at its bottom left side.
				 *
				 * <b>Note:</b> In the case that the menu has no space to show itself in the view port
				 * of the current window it tries to open itself to
				 * the inverted direction.
				 */
				menuPosition: { type: "sap.ui.core.Popup.Dock", group: "Misc", defaultValue: Dock.BeginBottom },

				/**
				 * This property specifies the element's text directionality with enumerated options.
				 * By default, the control inherits text direction from the DOM.
				 */
				textDirection: { type: "sap.ui.core.TextDirection", group: "Appearance", defaultValue: TextDirection.Inherit },

				/**
				 * The property is “true” when the control is toggled. The default state of this property is "false".
				 */
				pressed: { type: "boolean", group: "Data", defaultValue: false }
			},
			aggregations: {
				_menu: { type: "sap.m.Menu", multiple: false, visibility: "hidden" },
				_toggleButton: { type: "sap.m.ToggleButton", multiple: false, visibility: "hidden" },
				_arrowButton: { type: "sap.m.Button", multiple: false, visibility: "hidden" },

				/**
				 * Defines the menu items contained within this control.
				 */
				items: {
					type: "sap.ui.vk.ToggleMenuItem",
					multiple: true,
					forwarding: {
						getter: "_getMenu",
						aggregation: "items",
						forwardBinding: true
					}
				}
			},
			associations: {
				/**
				 * Sets or retrieves the selected item from the aggregation named items.
				 */
				defaultItem: {
					type: "sap.ui.vk.ToggleMenuItem",
					multiple: false
				},

				/**
				 * Association to controls / IDs, which describe this control (see WAI-ARIA attribute aria-describedby).
				 */
				ariaDescribedBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy" },

				/**
				 * Association to controls / IDs, which label this control (see WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
			},
			events: {
				/**
				 * Fired before menu opening when the <code>buttonMode</code> is set to <code>Split</code> and the user
				 * presses the arrow button.
				 */
				beforeMenuOpen: {},

				/**
				 * Fired when a <code>ToggleMenuItem</code> is toggled.
				 */
				itemToggled: {
					parameters: {
						/**
						 * The <code>ToggleMenuItem</code> which was unpressed.
						 */
						oldItem: { type: "sap.ui.vk.ToggleMenuItem" },
						/**
						 * The <code>ToggleMenuItem</code> which was pressed.
						 */
						newItem: { type: "sap.ui.vk.ToggleMenuItem" }
					}
				},

				/**
				 * Fired when a <code>ToggleMenuItem</code> is selected.
				 */
				itemSelected: {
					parameters: {
						/**
						 * The <code>ToggleMenuItem</code> which was selected.
						 */
						item: { type: "sap.ui.vk.ToggleMenuItem" }
					}
				}
			}
		}
	});

	EnabledPropagator.call(ToggleMenuButton.prototype);

	ToggleMenuButton.prototype.init = function() {
		if (Control.init) {
			Control.init.call(this);
		}

		var menu = new Menu({ id: this.getId() + "-menu" });
		menu.attachClosed(this._menuClosed, this);
		menu.attachItemSelected(this._menuItemSelected, this);
		this.setAggregation("_menu", menu);

		var toggleButton = new ToggleButton({
			id: this.getId() + "-toggleButton",
			width: "100%",
			tooltip: this.getTooltip(),
			press: function() {
				var item = core.byId(this.getDefaultItem());
				if (item) {
					this.fireItemToggled(this.getPressed() ? { newItem: item, oldItem: null } : { newItem: null, oldItem: item });
				}
			}.bind(this)
		}).addStyleClass("sapUiVkTMBText");
		this.setAggregation("_toggleButton", toggleButton);

		var arrowButton = new Button({
			id: this.getId() + "-arrowButton",
			icon: "sap-icon://slim-arrow-down",
			tooltip: this.getTooltip(),
			ariaHasPopup: CoreLibrary.aria.HasPopup.Menu,
			press: function() {
				this._handleArrowPress();
			}.bind(this)
		}).addStyleClass("sapUiVkTMBArrow");
		this.setAggregation("_arrowButton", arrowButton);
	};

	ToggleMenuButton.prototype._getMenu = function() {
		return this.getAggregation("_menu");
	};

	ToggleMenuButton.prototype._getToggleButton = function() {
		return this.getAggregation("_toggleButton");
	};

	ToggleMenuButton.prototype._getArrowButton = function() {
		return this.getAggregation("_arrowButton");
	};

	ToggleMenuButton.prototype.onAfterRendering = function() {
		var $toggleButtonRef = this._getToggleButton().$(),
			$arrowButtonRef = this._getArrowButton().$();

		$toggleButtonRef.attr("tabindex", "-1");
		$arrowButtonRef.attr("tabindex", "-1");
		$toggleButtonRef.removeAttr("title");
		$arrowButtonRef.removeAttr("title");
		$toggleButtonRef.removeAttr("aria-describedby");
		$arrowButtonRef.removeAttr("aria-describedby");
	};

	/**
	 * Handles the <code>buttonPress</code> event and opens the menu.
	 * @param {boolean} bWithKeyboard If keyboard is used
	 * @private
	 */
	ToggleMenuButton.prototype._handleArrowPress = function(bWithKeyboard) {
		var menu = this._getMenu(),
			oOffset = {
				zero: "0 0",
				"plus2_right": "0 +2",
				"minus2_right": "0 -2",
				"plus2_left": "+2 0",
				"minus2_left": "-2 0"
			};

		this.fireBeforeMenuOpen();

		if (this._popupOpened) {
			this._getMenu().close();
			this._popupOpened = false;
			return;
		}

		if (!menu.getTitle()) {
			menu.setTitle(this.getText());
		}

		var aParam = [this, bWithKeyboard];

		switch (this.getMenuPosition()) {
			case Dock.BeginTop:
				aParam.push(Dock.BeginBottom, Dock.BeginTop, oOffset.plus2_right);
				break;
			case Dock.BeginCenter:
				aParam.push(Dock.BeginCenter, Dock.BeginCenter, oOffset.zero);
				break;
			case Dock.LeftTop:
				aParam.push(Dock.RightBottom, Dock.LeftBottom, oOffset.plus2_left);
				break;
			case Dock.LeftCenter:
				aParam.push(Dock.RightCenter, Dock.LeftCenter, oOffset.plus2_left);
				break;
			case Dock.LeftBottom:
				aParam.push(Dock.RightTop, Dock.LeftTop, oOffset.plus2_left);
				break;
			case Dock.CenterTop:
				aParam.push(Dock.CenterBottom, Dock.CenterTop, oOffset.plus2_left);
				break;
			case Dock.CenterCenter:
				aParam.push(Dock.CenterCenter, Dock.CenterCenter, oOffset.zero);
				break;
			case Dock.CenterBottom:
				aParam.push(Dock.CenterTop, Dock.CenterBottom, oOffset.minus2_right);
				break;
			case Dock.RightTop:
				aParam.push(Dock.LeftBottom, Dock.RightBottom, oOffset.minus2_left);
				break;
			case Dock.RightCenter:
				aParam.push(Dock.LeftCenter, Dock.RightCenter, oOffset.minus2_left);
				break;
			case Dock.RightBottom:
				aParam.push(Dock.LeftTop, Dock.RightTop, oOffset.minus2_left);
				break;
			case Dock.EndTop:
				aParam.push(Dock.EndBottom, Dock.EndTop, oOffset.plus2_right);
				break;
			case Dock.EndCenter:
				aParam.push(Dock.EndCenter, Dock.EndCenter, oOffset.zero);
				break;
			case Dock.EndBottom:
				aParam.push(Dock.EndTop, Dock.EndBottom, oOffset.minus2_right);
				break;
			case Dock.BeginBottom:
			default:
				aParam.push(Dock.BeginTop, Dock.BeginBottom, oOffset.minus2_right);
				break;
		}

		menu.openBy.apply(menu, aParam);

		if (this._getMenu()) {
			this._popupOpened = true;
		}

		this._writeAriaAttributes();

		if (!Device.system.phone) {
			this.setArrowState(true);
		}
	};

	ToggleMenuButton.prototype._menuClosed = function() {
		this._popupOpened = false;

		this.setArrowState(false);
		var arrowButton = this._getArrowButton();

		arrowButton.$().removeAttr("aria-controls");
		arrowButton.$().attr("aria-expanded", "false");
	};

	ToggleMenuButton.prototype._writeAriaAttributes = function() {
		var arrowButton = this._getArrowButton(),
			menu = this._getMenu();

		if (menu) {
			arrowButton.$().attr("aria-controls", menu.getDomRefId());
			arrowButton.$().attr("aria-expanded", "true");
		}
	};

	/**
	 * Sets the arrow state to down or not down.
	 * @param {boolean} bIsDown Is the arrow down
	 * @public
	 */
	ToggleMenuButton.prototype.setArrowState = function(bIsDown) {
		this._getArrowButton().$()[bIsDown ? "addClass" : "removeClass"]("sapMSBActive");
	};

	ToggleMenuButton.prototype.getPressed = function() {
		return this._getToggleButton().getPressed();
	};

	ToggleMenuButton.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {
		if (sPropertyName === "type" && (oValue === ButtonType.Up || oValue === ButtonType.Back || oValue === ButtonType.Unstyled)) {
			return this;
		}

		var result = Control.prototype.setProperty.apply(this, arguments);

		function _fnCapitalize(sText) {
			return sText.charAt(0).toUpperCase() + sText.slice(1);
		}

		if (sPropertyName === "iconDensityAware" || sPropertyName === "textDirection") {
			ToggleButton.prototype.setProperty.apply(this._getToggleButton(), arguments);
		} else if (sPropertyName === "text" || sPropertyName === "type" || sPropertyName === "icon" || sPropertyName === "pressed") {
			var sSetterName = "set" + _fnCapitalize(sPropertyName);

			ToggleButton.prototype[sSetterName].call(this._getToggleButton(), oValue);

			if (sPropertyName === "type") {
				Button.prototype[sSetterName].call(this._getArrowButton(), oValue);
			}
		}

		return result;
	};

	ToggleMenuButton.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === KeyCodes.SPACE) {
			oEvent.preventDefault();
		}

		this._getToggleButton().onkeydown(oEvent);
	};

	ToggleMenuButton.prototype.onkeyup = function(oEvent) {
		this._getToggleButton().onkeyup(oEvent);
	};

	ToggleMenuButton.prototype.onsapup = function(oEvent) {
		this._handleArrowPress();
	};

	ToggleMenuButton.prototype.onsapdown = function(oEvent) {
		this._handleArrowPress();
	};

	ToggleMenuButton.prototype.onsapupmodifiers = function(oEvent) {
		this._handleArrowPress();
	};

	ToggleMenuButton.prototype.onsapdownmodifiers = function(oEvent) {
		this._handleArrowPress();
	};

	// F4
	ToggleMenuButton.prototype.onsapshow = function(oEvent) {
		this._handleArrowPress();
		oEvent.preventDefault();
	};

	ToggleMenuButton.prototype.getButtonTypeAriaLabelId = function() {
		var sButtonType = this._getToggleButton().getType();
		return ButtonRenderer.getButtonTypeAriaLabelId(sButtonType);
	};

	ToggleMenuButton.prototype.getTitleAttributeValue = function() {
		var sTooltip = this.getTooltip_AsString(),
			oIconInfo = IconPool.getIconInfo(this.getIcon()),
			sResult;

		if (sTooltip || (oIconInfo && oIconInfo.text && !this.getText())) {
			sResult = sTooltip || oIconInfo.text;
		}

		return sResult;
	};

	/**
	 * Required by the {@link sap.m.IOverflowToolbarContent} interface.
	 *
	 * @returns {object} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface.
	 */
	ToggleMenuButton.prototype.getOverflowToolbarConfig = function() {
		return {
			canOverflow: true,
			propsUnrelatedToSize: ["enabled", "type", "icon", "pressed"],
			autoCloseEvents: ["press"]
		};
	};

	ToggleMenuButton.prototype._menuItemSelected = function(oEvent) {
		var menuItem = oEvent.getParameter("item");
		if (menuItem.getToggleable()) {
			var toggleButton = this._getToggleButton();
			var oldItem = toggleButton.getPressed() ? core.byId(this.getDefaultItem()) : null;
			if (menuItem !== oldItem) {
				this.setDefaultItem(menuItem);
				toggleButton.setPressed(true);
				toggleButton.rerender();
				this.fireItemToggled({ newItem: menuItem, oldItem: oldItem });
			} else {
				toggleButton.setPressed(!toggleButton.getPressed());
				this.fireItemToggled(toggleButton.getPressed() ? { newItem: menuItem, oldItem: null } : { newItem: null, oldItem: menuItem });
			}
		} else {
			this.fireItemSelected({ item: menuItem });
		}

		this._popupOpened = false;
	};

	ToggleMenuButton.prototype.getIcon = function() {
		return this._getToggleButton().getIcon();
	};

	ToggleMenuButton.prototype.getText = function() {
		return this._getToggleButton().getText();
	};

	ToggleMenuButton.prototype.setDefaultItem = function(item) {
		this.setAssociation("defaultItem", item);
		if (item == null) {
			return this;
		}
		if (typeof item === "string") {
			item = core.byId(item);
		}
		var icon = item.getIcon();
		var toggleButton = this._getToggleButton();
		toggleButton.setIcon(icon);
		toggleButton.setText(icon ? null : item.getText());
		// TODO: figure out why the button is not rerendered without this deprecated call.
		this.rerender();
	};

	ToggleMenuButton.prototype.onBeforeRendering = function() {
		if (!this.getDefaultItem()) {
			var firstToggleableItem = this.getItems().find(function(item) { return item.getToggleable(); });
			if (firstToggleableItem) {
				this.setDefaultItem(firstToggleableItem);
			}
		}
	};

	return ToggleMenuButton;
});
