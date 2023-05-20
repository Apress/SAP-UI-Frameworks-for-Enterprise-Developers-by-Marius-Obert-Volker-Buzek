/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.MapContainer.
sap.ui.define([
	"./ContainerBase",
	"sap/ui/core/IconPool",
	"sap/ui/vbm/lib/sapvbi",
	"sap/ui/Device",
	"./MapContainerRenderer",
	"./MapContainerButtonType",
	"./getResourceBundle"
], function(
	ContainerBase,
	IconPool,
	sapvbi,
	Device,
	MapContainerRenderer,
	MapContainerButtonType,
	getResourceBundle
) {
	"use strict";

	/**
	 * Constructor for a new MapContainer.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Abstract Constructor for a new Container.
	 * @extends sap.ui.vk.ContainerBase
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.MapContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MapContainer = ContainerBase.extend("sap.ui.vk.MapContainer", /** @lends sap.ui.vk.MapContainer.prototype */ {
		metadata: {

			library: "sap.ui.vk",
			properties: {
				/**
				 * Show navbar
				 */
				"showNavbar": {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Controls the visibility of the home button
				 */
				"showHome": {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Controls the visibility of the Map Layer Select
				 */
				"showMapLayer": {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Controls the visibility of the rectangular zoom button
				 */
				"showRectangularZoom": {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Controls the visibility of the zoom buttons
				 */
				"showZoom": {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				}
			},
			aggregations: {
				/**
				 * List Panel aggregation
				 */
				"listPanelStack": {
					type: "sap.ui.vk.ListPanelStack",
					multiple: false
				},
				/**
				 * hidden scroll container aggregation needed for binding
				 */
				"scrollCont": {
					type: "sap.m.ScrollContainer",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {},
			events: {}
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

	MapContainer.prototype.init = function() {
		// call super init
		ContainerBase.prototype.init.apply(this, arguments);

		// create model and set the data
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({
			rectZoom: false
		});
		this.setModel(oModel, "rectZoom");

		// navbar
		this._oNavbar = new sap.m.Toolbar({
			// Use ToolbarDesign.Auto
			width: "auto"
		});
		// scroll container for list panel stack
		this._oScrollCont = new sap.m.ScrollContainer({
			horizontal: false,
			vertical: true,
			focusable: false
		});
		this.setAggregation("scrollCont", this._oScrollCont, /* bSuppressInvalidate= */ true);

		// create potential navbar buttons
		this._oHomeButton = new sap.m.Button({
			icon: "sap-icon://home",
			type: sap.m.ButtonType.Transparent,
			tooltip: getResourceBundle().getText("MAPCONTAINER_HOME"),
			press: this._onNavbarHome.bind(this)
		});
		this._oRectZoomButton = new sap.m.ToggleButton({
			icon: "sap-icon://draw-rectangle",
			type: sap.m.ButtonType.Transparent,
			pressed: "{rectZoom>/rectZoom}",
			tooltip: getResourceBundle().getText("MAPCONTAINER_RECT_ZOOM")
		}).setModel(oModel, "rectZoom");
		this._oZoomInButton = new sap.m.Button({
			icon: "sap-icon://add",
			type: sap.m.ButtonType.Transparent,
			tooltip: getResourceBundle().getText("MAPCONTAINER_ZOOMIN"),
			press: this._onNavbarZoomIn.bind(this)
		});
		this._oZoomOutButton = new sap.m.Button({
			icon: "sap-icon://less",
			type: sap.m.ButtonType.Transparent,
			tooltip: getResourceBundle().getText("MAPCONTAINER_ZOOMOUT"),
			press: this._onNavbarZoomOut.bind(this)
		});

		// Menu buttons for ListPanelStack on mobile phone
		if (Device.system.phone) {
			this._oMenuOpenButton = new sap.m.Button({
				layoutData: new sap.m.OverflowToolbarLayoutData({
					priority: sap.m.OverflowToolbarPriority.NeverOverflow
				}),
				icon: "sap-icon://menu2",
				type: sap.m.ButtonType.Transparent,
				tooltip: getResourceBundle().getText("CONTAINERBASE_MENU"),
				press: function() {
					this._bSegmentedButtonSaveSelectState = true;
					this._showListPanelStack();
				}.bind(this)
			});
			this._oMenuCloseButton = new sap.m.Button({
				type: sap.m.ButtonType.Transparent,
				icon: "sap-icon://nav-back",
				press: function() {
					this._bSegmentedButtonSaveSelectState = true;
					this._hideListPanelStack();
				}.bind(this)
			});
		}

		this.addStyleClass("sapUiVkMapContainer");
	};

	MapContainer.prototype.exit = function() {
		if (this._oNavbar) {
			this._oNavbar.destroy();
			this._oNavbar = undefined;
		}
		if (this._oScrollCont) {
			this._oScrollCont.destroy();
			this._oScrollCont = undefined;
		}
		// call super exit
		ContainerBase.prototype.exit.apply(this, arguments);
	};

	// delegate listPanelStack aggregation to ScrollContainer content aggregation
	MapContainer.prototype.getListPanelStack = function() {
		return this._oScrollCont.getContent()[0];
	};

	MapContainer.prototype.setListPanelStack = function(oPanel) {
		if (Device.system.phone) {
			// Do not allow to collapse List Panel Stack on mobile phones, since it is rendered in a side container there
			oPanel.setCollapsible(false);
			oPanel.setWidth("100%");
		}
		this._oScrollCont.removeAllContent();
		return this._oScrollCont.addContent(oPanel);
	};

	// ...............................................................................
	// Redefined functions
	// ...............................................................................

	MapContainer.prototype.onBeforeRendering = function() {
		// call super implementation
		ContainerBase.prototype.onBeforeRendering.apply(this, arguments);

		this._oNavbar.removeAllContent();
		// repopulate navbar buttons according current settings

		this._shouldRenderMapLayerSwitch = false;

		var content = this.getSelectedContent();
		if (content !== null) {
			var control = content.getContent();
			this._isInstanceGeoAnalytic = control instanceof sap.ui.vbm.GeoMap || control instanceof sap.ui.vbm.AnalyticMap;
			if (this._isInstanceGeoAnalytic) {
				if (this.getShowHome()) {
					this._oNavbar.addContent(this._oHomeButton);
				}
				if (!Device.system.phone && this.getShowRectangularZoom()) {
					this._oNavbar.addContent(this._oRectZoomButton);
				}
				if (this.getShowZoom()) {
					this._oNavbar.addContent(this._oZoomInButton);
					this._oNavbar.addContent(this._oZoomOutButton);
				}
				this._shouldRenderListPanel = true;
			} else {
				this._shouldRenderListPanel = false;
			}
			this._isSupportingMapLayerSwitch = control instanceof sap.ui.vbm.GeoMap && !(control instanceof sap.ui.vbm.AnalyticMap);
			if (this._isSupportingMapLayerSwitch && control.getMapConfiguration() !== null && this.getShowMapLayer()) {

				var config = control.getMapConfiguration();
				var layers = [].concat(config.MapLayerStacks);

				if (layers.length > 1) {

					this._currentText = new sap.m.Text().addStyleClass("mapLayerSelectedText");
					this.addDependent(this._currentText); // bind life/render cycle to MapContainer

					this._box = new sap.m.HBox().addStyleClass("mapContainerHboxPopover");

					this._popover = new sap.m.Popover({
						enableScrolling: false,
						placement: sap.m.PlacementType.Horizontal,
						content: this._box,
						showHeader: false
					});

					this._selectionMap = new sap.m.Image({
						press: function(event) {
							if (this._popover.isOpen()) {
								this._popover.close();
							} else {
								this._popover.openBy(this._selectionMap);
							}
						}.bind(this)
					}).addStyleClass("mapLayerPopoverItem");
					this.addDependent(this._selectionMap); // bind life/render cycle to MapContainer

					this._shouldRenderMapLayerSwitch = true;
				}
			}
		}
	};

	MapContainer.prototype.onAfterRendering = function() {
		if (Device.system.phone) {
			// append ListPanelStackWrapper to control div to be a sibling of the content wrapper
			var oListPanelWrapperDiv = document.getElementById(this.getId() + "-LPW");
			this.getDomRef().appendChild(oListPanelWrapperDiv);
		}

		// call super implementation
		ContainerBase.prototype.onAfterRendering.apply(this, arguments);

		if (this._shouldRenderMapLayerSwitch) {
			var control = this.getSelectedContent().getContent();
			var config = control.getMapConfiguration();
			var layers = [].concat(config.MapLayerStacks);
			// Access the scene to use getPreviewImage callback
			var scene = control.mVBIContext.GetMainScene();

			layers.forEach(function(v) {
				var currentMapLayerStack = control.mVBIContext.m_MapLayerStackManager.GetMapLayerStack(v.name);

				var item = new sap.m.Image({
					alt: v.name,
					press: function(event) {
						this._popover.close();
						this._currentText.setText(v.name);
						this._selectionMap.setAlt(v.name);
						control.setRefMapLayerStack(v.name);

						if (item.getSrc()) {
							this._selectionMap.setSrc(item.getSrc());
						} else {
							scene.GetPreviewImage(currentMapLayerStack, function(img) {
								this._selectionMap.setSrc(img.src);
							}.bind(this));
						}
					}.bind(this)
				}).addStyleClass("layerType");

				// set the source of items in popover
				scene.GetPreviewImage(currentMapLayerStack, function(img) {
					item.setSrc(img.src);
				});

				var itemText = new sap.m.Text({ text: v.name }).addStyleClass("mapLayerPopoverItemText");

				var verticalLayout = new sap.ui.layout.VerticalLayout();
				verticalLayout.addContent(item);
				verticalLayout.addContent(itemText);

				this._box.addItem(verticalLayout);
			}, this);

			this._currentText.setText(control.getRefMapLayerStack());
			this._selectionMap.setAlt(control.getRefMapLayerStack());

			// set tile of selected map layer stack on initial load
			scene.GetPreviewImage(scene.m_MapLayerStack, function(img) {
				this._selectionMap.setSrc(img.src);
			}.bind(this));
		}
	};

	/**
	 * Set custom item on the MapContainer toolbar.
	 * All custom items added between selection segment button and setting button.
	 *
	 * @param {object}			item Item configuration object.
	 * @param {string}			item.id Id of the item for future references.
	 * @param {int}				item.index Relative index of an item across all custom items.
	 * @param {boolean}			item.visible Visibility of an item.
	 * @param {boolean}			item.active Active item or not.
	 * @param {string}			item.text Text of an item.
	 * @param {string}			item.tooltip Tooltip of an item.
	 * @param {boolean}			item.overflow If true create Overflow button or standard if false.
	 * @param {sap.ui.core.URI}	item.icon Icon of an item.
	 * @param {sap.ui.core.URI}	item.activeIcon Alternative icon of an item, see {@link sap.m.Button} for details.
	 * @param {string}			item.type The {@link sap.ui.vk.MapContainerButtonType} enum.
	 * @param {function}		item.press Callback function which is called when item gets pressed.
	 * @param {boolean}			item.toggled sets the initial pressed state for a {@link sap.ui.vk.MapContainerButtonType} Toggle button. This does not fire the pressed event handler. It should be used if pressed logic is activated by application code on first load.

	 * @returns {object} Item configuration object
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	MapContainer.prototype.setToolbarItem = function(item) {
		if (!item || !item.id) {
			return null;
		}
		var obj;

		for (var i = 0; i < this._customButtons.length; ++i) {
			if (item.id === this._customButtons[i].id) {
				obj = this._customButtons[i];
				obj.index = i; // update index as it may be out of sync
				this._customButtons.splice(i, 1); // remove it now to add later
				break;
			}
		}
		if (!obj) { // new item -> use default parameters
			obj = {
				id: item.id,
				visible: true,
				active: true,
				index: this._customButtons.length, // add to the end
				type: MapContainerButtonType.Click // click by default
			};
		}
		// override parameters
		if ("index" in item) {
			obj.index = item.index;
		}
		if ("visible" in item) {
			obj.visible = item.visible;
		}
		if ("overflow" in item) {
			obj.overflow = item.overflow;
		}
		if ("active" in item) {
			obj.active = item.active;
		}
		if ("text" in item) {
			obj.text = item.text;
		}
		if ("tooltip" in item) {
			obj.tooltip = item.tooltip;
		}
		if ("icon" in item) {
			obj.icon = item.icon;
		}
		if ("activeIcon" in item) {
			obj.activeIcon = item.activeIcon;
		}
		if ("press" in item) {
			obj.press = item.press;
		}
		if ("toggled" in item) {
			// Track changes to toggled state so that we know whether the data value or the existing button state should be persisted
			obj.toggled = item.toggled;
			if (obj.button) {
				obj.button.setPressed(item.toggled);
			}
		}
		if ("type" in item) {
			obj.type = item.type;
		}
		// normalize index
		if (obj.index > this._customButtons.length) {
			obj.index = this._customButtons.length;
		} else if (obj.index < 0) {
			obj.index = 0;
		}
		this._customButtons.splice(obj.index, 0, obj); // add ("back" if exists) to the array
		this.invalidate();

		return obj;
	};

	MapContainer.prototype.setSelectedContent = function(oContent) {
		var oOldControl;
		if (this._oSelectedContent) {
			if ((oOldControl = this._oSelectedContent.getContent()) instanceof sap.ui.vbm.GeoMap) {
				oOldControl.unbindProperty("rectZoom", "rectZoom>/rectZoom");
			}
		}
		// call super implementation
		ContainerBase.prototype.setSelectedContent.apply(this, arguments);

		var oNewControl = this._oSelectedContent.getContent();
		if (oNewControl instanceof sap.ui.vbm.GeoMap) {
			oNewControl.bindProperty("rectZoom", "rectZoom>/rectZoom");
		}
	};

	MapContainer.prototype._addToolbarContent = function() {
		if (Device.system.phone) {
			this._oToolbar.addContent(this._oMenuOpenButton);
		}
		// call super implementation
		ContainerBase.prototype._addToolbarContent.apply(this, arguments);
	};

	// ...............................................................................
	// Internal functions
	// ...............................................................................

	MapContainer.prototype._onNavbarZoomIn = function(oEvent) {

		var control = this.getSelectedContent().getContent();
		if (control.getZoomlevel && control.setZoomlevel && control.setEnableAnimation) {
			control.setEnableAnimation(true);
			control.setZoomlevel(control.getZoomlevel() + 1);
		}
	};

	MapContainer.prototype._onNavbarZoomOut = function(oEvent) {
		var control = this.getSelectedContent().getContent();
		if (control.getZoomlevel && control.setZoomlevel && control.setEnableAnimation) {
			control.setEnableAnimation(true);
			control.setZoomlevel(control.getZoomlevel() - 1);
		}
	};

	MapContainer.prototype._onNavbarHome = function(oEvent) {
		var control = this.getSelectedContent().getContent();
		if (control.goToStartPosition) {
			control.goToStartPosition();
		}
	};

	MapContainer.prototype._showListPanelStack = function() {
		jQuery("#" + this.getId() + "-LPW").addClass("sapUiVkMapContainerLPWIn");
		jQuery("#" + this.getId() + "-wrapper").addClass("sapUiVkMapContainerMapOut");
	};

	MapContainer.prototype._hideListPanelStack = function() {
		jQuery("#" + this.getId() + "-LPW").removeClass("sapUiVkMapContainerLPWIn");
		jQuery("#" + this.getId() + "-wrapper").removeClass("sapUiVkMapContainerMapOut");
	};

	return MapContainer;

});
