/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.ContainerBase.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/ui/core/Popup",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/delegate/ScrollEnablement",
	"sap/ui/Device",
	"sap/m/library",
	"sap/m/Label",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarButton",
	"sap/m/Button",
	"sap/m/OverflowToolbarToggleButton",
	"sap/m/ToggleButton",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/ToolbarSpacer",
	"sap/m/OverflowToolbarLayoutData",
	"./ContainerBaseRenderer",
	"./MapContainerButtonType",
	"./getResourceBundle",
	"sap/base/util/uid",
	"sap/base/Log"
], function(
	vkLibrary,
	Control,
	IconPool,
	Popup,
	ResizeHandler,
	ScrollEnablement,
	Device,
	mobileLibrary,
	Label,
	OverflowToolbar,
	OverflowToolbarButton,
	Button,
	OverflowToolbarToggleButton,
	ToggleButton,
	SegmentedButton,
	SegmentedButtonItem,
	ToolbarSpacer,
	OverflowToolbarLayoutData,
	ContainerBaseRenderer,
	MapContainerButtonType,
	getResourceBundle,
	uid,
	Log
) {
	"use strict";

	/**
	 * Abstract Constructor for a new Container.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Abstract Constructor for a new Container.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.ContainerBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.38.0
	 */
	var ContainerBase = Control.extend("sap.ui.vk.ContainerBase", /** @lends sap.ui.vk.ContainerBase.prototype */ {
		metadata: {

			library: "sap.ui.vk",
			properties: {
				/**
				 * Show fullscreen toggle button in toolbar
				 */
				"showFullScreen": {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Show settings button in toolbar
				 */
				"showSettings": {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Show selection button in toolbar
				 */
				"showSelection": {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Controls whether the control is show fullscreen or embedded
				 */
				"fullScreen": {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				/**
				 * Title to show in toolbar
				 */
				"title": {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},
				"autoAdjustHeight": {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			},
			defaultAggregation: "content",
			aggregations: {
				/**
				 * Content Aggregation.
				 */
				content: {
					type: "sap.ui.vk.ContainerContent",
					multiple: true,
					singularName: "content"
				},
				/**
				 * Toolbar aggregation
				 */
				"toolbar": {
					type: "sap.m.Toolbar",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				/**
				 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
				 */
				ariaDescribedBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy" },

				/**
				 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledBy).
				 */
				ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
			},
			events: {
				"contentChange": {
					parameters: {
						selectedItemId: "string"
					}
				},
				"settingsPressed": {}
			}
		}
	});

	// ...........................................................................//
	// This file defines behavior for the control,...............................//
	// ...........................................................................//
	// Public API functions
	// ............................................................................//

	/**
	 * default Content could be defined in application
	 *
	 * @param {sap.ui.vk.ContainerContent} oContent the content to be visible; involves re-rendering
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ContainerBase.prototype.switchContent = function(oContent) {
		this.setSelectedContent(oContent);
		// fire the change event with id of the newly selected item..
		this.rerender();// invalidate();
	};

	/**
	 * update container to allow dynamic change button layout
	 *
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ContainerBase.prototype.updateContainer = function() {
		this._contentChanged = true;
		this.rerender();
	};

	/**
	 * set selected content
	 *
	 * @param {sap.ui.vk.ContainerContent} oContent the selected content; involves no re-rendering
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ContainerBase.prototype.setSelectedContent = function(oContent) {
		this._oSelectedContent = oContent;
	};

	/**
	 * get selected content
	 *
	 * @returns {sap.ui.vk.ContainerContent} the currently selected content container
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ContainerBase.prototype.getSelectedContent = function() {
		return this._oSelectedContent;
	};

	// ........................................................................//
	// Implementation of UI5 Interface functions
	// ........................................................................//

	ContainerBase.prototype.init = function() {
		this._selectionState = "SINGLE";
		this._firstTime = true;
		this._aContentIcons = [];
		this._selectedContent = null;
		this._oSelectedContent = null;
		this._bSegmentedButtonSaveSelectState = false;
		this._oMenu = null;
		this._customButtons = [];

		// Right side..
		var oLayoutData = new OverflowToolbarLayoutData({
			priority: sap.m.OverflowToolbarPriority.High
		});
		var buttonType = sap.m.ButtonType.Transparent;

		// Full screen button
		this._oFullScreenButton = new OverflowToolbarButton({
			layoutData: oLayoutData,
			type: buttonType,
			icon: "sap-icon://full-screen",
			text: getResourceBundle().getText("CONTAINERBASE_FULLSCREEN"),
			tooltip: getResourceBundle().getText("CONTAINERBASE_FULLSCREEN"),
			press: function() {
				this._bSegmentedButtonSaveSelectState = true;
				this._toggleFullScreen();
			}.bind(this)
		});

		// Settings button
		this._oSettingsButton = new OverflowToolbarButton({
			layoutData: oLayoutData.clone(),
			type: buttonType,
			icon: "sap-icon://action-settings",
			text: getResourceBundle().getText("CONTAINERBASE_SETTINGS"),
			tooltip: getResourceBundle().getText("CONTAINERBASE_SETTINGS"),
			press: function() {
				this._bSegmentedButtonSaveSelectState = true;
				this.fireSettingsPressed();
			}.bind(this)
		});

		// Selection buttons
		this._oSelectionButtonSingle = new SegmentedButtonItem({
			icon: "sap-icon://map-container/selection-single",
			tooltip: getResourceBundle().getText("CONTAINERBASE_MENU_SINGLE"),
			press: this._handleSelection.bind(this, "SINGLE")
		});

		this._oSelectionButtonRectangle = new SegmentedButtonItem({
			icon: "sap-icon://map-container/selection-rectangle",
			tooltip: getResourceBundle().getText("CONTAINERBASE_MENU_RECT"),
			press: this._handleSelection.bind(this, "RECT")
		});

		this._oSelectionButtonLasso = new SegmentedButtonItem({
			icon: "sap-icon://map-container/selection-lasso",
			tooltip: getResourceBundle().getText("CONTAINERBASE_MENU_LASSO"),
			press: this._handleSelection.bind(this, "LASSO")
		});

		this._selectionMenu = new SegmentedButton({
			items: [
				this._oSelectionButtonSingle,
				this._oSelectionButtonRectangle,
				this._oSelectionButtonLasso
			]
		});
		// Popup for container content
		this._oPopup = new Popup({
			modal: true,
			shadow: false,
			autoClose: false
		});

		// segmentedButton for for multiple content entries
		this._oContentSegmentedButton = new SegmentedButton({
			layoutData: oLayoutData.clone(),
			select: this._onContentButtonSelect.bind(this)
		});

		// Left side...
		// display title
		this._oContTitle = new Label();

		// toolbar
		this._oToolbar = new OverflowToolbar({
			// Use ToolbarDesign.Auto
			width: "auto"
		}).addStyleClass("sapUiVkContainerBaseToolbar");
		this.setAggregation("toolbar", this._oToolbar);

		this.sResizeListenerId = null;
		if (Device.system.desktop) {
			this.sResizeListenerId = ResizeHandler.register(this, jQuery.proxy(this._performHeightChanges, this));
		} else {
			Device.orientation.attachHandler(this._performHeightChanges, this);
			Device.resize.attachHandler(this._performHeightChanges, this);
		}

		// Adding new icons to the IconPool
		var mapContainerIcons = [{
			name: "selection-lasso",
			unicode: "E000"
		}, {
			name: "selection-rectangle",
			unicode: "E001"
		}, {
			name: "selection-single",
			unicode: "E002"
		}],
			collectionName = "map-container",
			fontFamily = "map-container";

		mapContainerIcons.forEach(function(icon) {
			IconPool.addIcon(icon.name, collectionName, fontFamily, icon.unicode);
		});
	};

	ContainerBase.prototype.exit = function() {
		if (this._oFullScreenButton) {
			this._oFullScreenButton.destroy();
			this._oFullScreenButton = undefined;
		}
		if (this._oPopup) {
			this._oPopup.destroy();
			this._oPopup = undefined;
		}
		if (this._oContentSegmentedButton) {
			this._oContentSegmentedButton.destroy();
			this._oContentSegmentedButton = undefined;
		}
		if (this._oSelectedContent) {
			this._oSelectedContent.destroy();
			this._oSelectedContent = undefined;
		}
		if (this._oToolbar) {
			this._oToolbar.destroy();
			this._oToolbar = undefined;
		}
		if (Device.system.desktop && this.sResizeListenerId) {
			ResizeHandler.deregister(this.sResizeListenerId);
			this.sResizeListenerId = null;
		} else {
			Device.orientation.detachHandler(this._performHeightChanges, this);
			Device.resize.detachHandler(this._performHeightChanges, this);
		}
	};

	/**
	 * set FullScreen - default is normal mode, but app can call this method to set the default to full screen
	 *
	 * @param {boolean} bFullScreen Fullscreen mode on or off
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ContainerBase.prototype.setFullScreen = function(bFullScreen) {
		if (this._firstTime) {
			// can't set the full screen and toggle since dom is not loaded yet
			return;
		}
		if (this.getFullScreen() == bFullScreen) { // check setter is overridden, if not, no need to set the property
			return;
		}
		var fullScreen = this.getProperty("fullScreen");
		if (fullScreen !== bFullScreen) {
			this._toggleFullScreen();
		}
	};

	ContainerBase.prototype.onAfterRendering = function() {
		var that = this;
		if ((this.sResizeListenerId === null) && (Device.system.desktop)) {
			this.sResizeListenerId = ResizeHandler.register(this, jQuery.proxy(this._performHeightChanges, this));
		}
		if (this.getAutoAdjustHeight() || this.getFullScreen()) {
			// fix the flickering issue when switch chart in full screen mode
			setTimeout(function() {
				that._performHeightChanges();
			}, 500);
		}
		this._firstTime = false;
		if (this.getSelectedContent() !== null) {
			var control = this.getSelectedContent().getContent();
			if (control instanceof sap.ui.vbm.GeoMap || control instanceof sap.ui.vbm.AnalyticMap) {
				if (this.getShowSelection()) {
					if (this._selectionState === "LASSO") {
						control.setLassoSelection(true);
					} else if (this._selectionState === "RECT") {
						control.setRectangularSelection(true);
					} else if (this._selectionState === "SINGLE") {
						control.setRectangularSelection(false);
						control.setLassoSelection(false);
					}
				}
			}
		}
	};

	ContainerBase.prototype.onBeforeRendering = function() {
		var that = this;
		if (that._contentChanged) {
			that._contentChange();
		}

		// Before destroying the toolbar, collect the button toggled states and update the data
		that._oToolbar.getContent().forEach(function(element) {
			var customButtonId = element.getId();
			var isPressed = element["getPressed"] ? element.getPressed() : null;
			for (var i in that._customButtons) {
				if (that._customButtons[i].button && that._customButtons[i].button.getId() == customButtonId) {
					that._customButtons[i].toggled = isPressed;
				}
			}
		});

		// re-populate toolbar content according to current settings
		that._oToolbar.removeAllContent();
		that._addToolbarContent();
	};

	/**
	 * Display title
	 *
	 * @param {string} sValue the title
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ContainerBase.prototype.setTitle = function(sValue) {
		this._oContTitle.setText(sValue);
		this.setProperty("title", sValue, true);
	};

	/**
	 * add container content - map, table..
	 *
	 * @param {sap.ui.vk.ContainerContent} oObject content object to add
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ContainerBase.prototype.addContent = function(oObject) {
		this.addAggregation("content", oObject);
		this._contentChanged = true;
	};

	/**
	 * insert container content - map, table..
	 *
	 * @param {sap.ui.vk.ContainerContent} oObject content object to insert
	 * @param {int} iIndex index in the content aggregation where to insert the new content object
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ContainerBase.prototype.insertContent = function(oObject, iIndex) {
		this.insertAggregation("content", oObject, iIndex);
		this._contentChanged = true;
	};

	/**
	 * update chartcontainer content
	 */
	ContainerBase.prototype.updateContent = function() {
		this.updateAggregation("content");
		this._contentChanged = true;
	};

	// ...............................................................................
	// Internal functions
	// ...............................................................................

	/**
	 * Toggle normal and full screen mode
	 *
	 * @private
	 */
	ContainerBase.prototype._toggleFullScreen = function() {
		var fullScreen = this.getProperty("fullScreen");
		var sId;
		var sHeight;
		var oContent;
		if (fullScreen) {
			this._closeFullScreen();
			this.setProperty("fullScreen", false, true);
			oContent = this.getSelectedContent().getContent();
			sId = oContent.getId();
			oContent.setWidth("100%");
			sHeight = this._contentHeight[sId];
			if (sHeight) {
				oContent.setHeight(sHeight);
			}
			this.invalidate();
		} else {
			var aObjects = this.getAggregation("content");
			this._contentHeight = {};
			if (aObjects) {
				for (var i = 0; i < aObjects.length; i++) {
					oContent = aObjects[i].getContent();
					sId = oContent.getId();
					if (jQuery.isFunction(oContent.getHeight)) {
						sHeight = oContent.getHeight();
					} else {
						sHeight = 0;
					}
					this._contentHeight[sId] = sHeight;
				}
			}
			// fix content disappear when toggle content with full screen button
			// by suppressing the invalid for the setProperty, this delay shouldn't be needed.
			this._openFullScreen(true);
			this.setProperty("fullScreen", true, true);
		}
		var sIcon = (fullScreen ? "sap-icon://full-screen" : "sap-icon://exit-full-screen");
		this._oFullScreenButton.setIcon(sIcon);
		this._oFullScreenButton.focus();
	};

	/**
	 * Open Container content with Full Screen
	 *
	 * @param {boolean} bNeedsScroll add scrolling to full screen display
	 * @private
	 */
	ContainerBase.prototype._openFullScreen = function(bNeedsScroll) {
		if ((bNeedsScroll !== null) && (bNeedsScroll === true)) {
			this._oScrollEnablement = new ScrollEnablement(this, this.getId() + "-wrapper", {
				horizontal: true,
				vertical: true
			});
		}
		this.$content = this.$();
		if (this.$content) {
			this.$tempNode = jQuery("<div></div>"); // id='" + this.$content.attr("id")+"-overlay"+ "'
			this.$content.before(this.$tempNode);
			this._$overlay = jQuery("<div id='" + uid() + "'></div>");
			this._$overlay.addClass("sapUiVkContainerBaseOverlay");
			this._$overlay.append(this.$content);
			this._oPopup.setContent(this._$overlay);
		} else {
			Log.warning("Overlay: content does not exist or contains more than one child");
		}
		this._oPopup.open(200, undefined, undefined, jQuery("body"));
	};

	/**
	 * Close Full Screen and return to normal mode
	 */
	ContainerBase.prototype._closeFullScreen = function() {
		if (this._oScrollEnablement !== null) {
			this._oScrollEnablement.destroy();
			this._oScrollEnablement = null;
		}
		this.$tempNode.replaceWith(this.$content);
		this._oToolbar.setDesign(sap.m.ToolbarDesign.Auto);
		this._oPopup.close();
		this._$overlay.remove();
	};

	/**
	 * Height change when toggle full and normal model mobile swap between portrait and Landscape will execute height change too
	 */
	ContainerBase.prototype._performHeightChanges = function() {
		if (this.getAutoAdjustHeight() || this.getFullScreen()) {
			var $this = this.$();
			// Only adjust height after both toolbar and content area are rendered in DOM
			if (($this.find(".sapUiVkContainerBaseToolbarArea").children()[0]) && ($this.find(".sapUiVkContainerBaseContentArea").children()[0])) {
				// var iContainerHeight = $this.height();
				// var iToolbarHeight = $this.find('.sapUiVkContainerBaseToolbarArea').children()[0].clientHeight;
				// var iToolbarBottomBorder = Math.round(parseFloat($this.find('.sapUiVkContainerBaseToolbarArea').children().css("border-bottom")));
				// var iNewHeight = iContainerHeight - iToolbarHeight - iToolbarBottomBorder;
				// var iExisitngHeight = $this.find('.sapUiVkContainerBaseContentArea').children()[0].clientHeight;
				var oinnerContent = this.getSelectedContent().getContent();
				if (oinnerContent.getDomRef().offsetWidth !== this.getDomRef().clientWidth) {
					// For table/non-vizFrame case, if width changes during resize event, force a rerender to have it fit 100% width
					this.rerender();
				}
			}
		}
	};

	/**
	 * Switch Content
	 *
	 * @param {string} sContentId id of the content object
	 * @private
	 */
	ContainerBase.prototype._switchContent = function(sContentId) {

		var oContent = this._findContentById(sContentId);

		this.setSelectedContent(oContent);

		this.fireContentChange({
			selectedItemId: sContentId
		}); // fire the change event with id of the newly selected item..
		this.rerender();// invalidate();
	};

	/**
	 * collect all content and repopulate content segmented button
	 */
	ContainerBase.prototype._contentChange = function() {
		var aContent = this.getContent();
		// remove and destroy all buttons for old content
		this._oContentSegmentedButton.removeAllButtons();
		this._destroyButtons(this._aContentIcons);

		this._aContentIcons = [];
		if (aContent.length === 0) {
			this._oContentSegmentedButton.removeAllButtons();
			this._setDefaultOnSegmentedButton();
			this.switchContent(null);
		}
		if (aContent) {
			for (var i = 0; i < aContent.length; i++) {
				var innerContent = aContent[i].getContent();
				if (innerContent.setWidth) {
					innerContent.setWidth("100%");
				}
				var oButton = new SegmentedButtonItem({
					icon: aContent[i].getIcon(),
					tooltip: aContent[i].getTitle(),
					key: innerContent.getId()
				});
				this._aContentIcons.push(oButton);
				this._oContentSegmentedButton.addItem(oButton);
				if (i === 0) {
					this.setSelectedContent(aContent[i]);
				}
			}
		}

		this._contentChanged = false;
	};

	ContainerBase.prototype._onContentButtonSelect = function(oEvent) {
		var sContentId = oEvent.getParameter("key");
		this._switchContent(sContentId);
	};

	/**
	 * get content to display by id
	 *
	 * @param {string} sId id of the content object
	 * @returns {sap.ui.vk.ContainerContent} content object found for given id
	 */
	ContainerBase.prototype._findContentById = function(sId) {
		var aContent = null;
		var aObjects = this.getAggregation("content");
		if (aObjects) {
			for (var i = 0; !aContent && i < aObjects.length; i++) {
				if (aObjects[i].getContent().getId() === sId) {
					aContent = aObjects[i];
				}
			}
		}
		return aContent;
	};

	/**
	 * adjusts customizable buttons of overflow toolbar, displays content buttons
	 * @protected
	 */
	ContainerBase.prototype._addToolbarContent = function() {
		this._oToolbar.addContent(new ToolbarSpacer()); // right align remaining content

		if (this._aContentIcons.length > 1) {
			this._oToolbar.addContent(this._oContentSegmentedButton);
		}

		if (this.getSelectedContent() !== null) {
			var control = this.getSelectedContent().getContent();
			if (control instanceof sap.ui.vbm.GeoMap || control instanceof sap.ui.vbm.AnalyticMap) {
				if (this.getShowSelection()) {
					this._oToolbar.addContent(this._selectionMenu);
				}
			}
		}

		this._customButtons.forEach(function(item) {
			if (item.visible) {
				var settings = {
					type: sap.m.ButtonType.Transparent,
					layoutData: new OverflowToolbarLayoutData({ priority: sap.m.OverflowToolbarPriority.High })
				};
				if ("active" in item) {
					settings.enabled = item.active;
				}
				if ("icon" in item) {
					settings.icon = item.icon;
				}
				if ("activeIcon" in item) {
					settings.activeIcon = item.activeIcon;
				}
				if ("text" in item) {
					settings.text = item.text;
				}
				if ("tooltip" in item) {
					settings.tooltip = item.tooltip;
				}
				if ("press" in item) {
					settings.press = item.press;
				}

				switch (item.type) { // supports "click" and "toggle" types only for now
					case MapContainerButtonType.Click:
						item.button = item.overflow ? new OverflowToolbarButton(settings) : new Button(settings);
						break;
					default:
						if ("toggled" in item) {
							settings.pressed = item.toggled;
						}
						item.button = item.overflow ? new OverflowToolbarToggleButton(settings) : new ToggleButton(settings);
						break;
				}
				this._oToolbar.addContent(item.button);
			}
		}, this);

		if (this.getShowSettings()) {
			this._oToolbar.addContent(this._oSettingsButton);
		}
		if (!Device.system.phone && this.getShowFullScreen()) {
			this._oToolbar.addContent(this._oFullScreenButton);
		}
	};

	/**
	 * The first button inside the segmented button is only set as default if the user did not click explicitly on another button inside the segmented
	 * button
	 *
	 * @private
	 */
	ContainerBase.prototype._setDefaultOnSegmentedButton = function() {
		if (!this._bSegmentedButtonSaveSelectState) {
			this._oContentSegmentedButton.setSelectedButton(null);
		}
		this._bSegmentedButtonSaveSelectState = false;
	};

	/**
	 * Buttons which are not needed anymore are destroyed here.
	 *
	 * @param {array} buttons The buttons which need to be destroyed.
	 * @private
	 */
	ContainerBase.prototype._destroyButtons = function(buttons) {
		buttons.forEach(function(oButton) {
			oButton.destroy();
		});
	};

	ContainerBase.prototype._handleSelection = function(mode) {
		var control = this.getSelectedContent().getContent();
		if (control instanceof sap.ui.vbm.GeoMap || control instanceof sap.ui.vbm.AnalyticMap) {
			if (mode === "LASSO") {
				control.setLassoSelection(true);
				this._selectionState = mode;
			} else if (mode === "RECT") {
				control.setRectangularSelection(true);
				this._selectionState = mode;
			} else if (mode === "SINGLE") {
				control.setRectangularSelection(false);
				control.setLassoSelection(false);
				this._selectionState = mode;
			}
		}

	};

	return ContainerBase;

});
