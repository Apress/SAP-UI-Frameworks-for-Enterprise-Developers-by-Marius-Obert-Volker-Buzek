/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.DrawerToolbar.
sap.ui.define([
	"./library",
	"./Core",
	"./DrawerToolbarRenderer",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/ui/Device",
	"sap/m/VBox",
	"sap/m/FlexAlignContent",
	"sap/m/FlexAlignItems",
	"sap/m/FlexItemData",
	"sap/m/FlexRendertype",
	"sap/m/OverflowToolbar",
	"sap/ui/core/Icon",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/ToolbarDesign",
	"sap/m/ToolbarSeparator",
	"sap/m/ToggleButton",
	"sap/m/MenuButton",
	"./tools/RectSelectTool",
	"./tools/CrossSectionTool",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"./NavigationMode",
	"./ZoomTo",
	"./getResourceBundle",
	"./ToggleMenuButton",
	"./ToggleMenuItem",
	"./Viewport",
	"./DrawerToolbarButton",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Core",
	"./tools/HighlightMeasurementTool",
	"./tools/CalibrateDistanceMeasurementTool",
	"./tools/DeleteMeasurementTool",
	"./tools/DistanceMeasurementTool",
	"./tools/AngleMeasurementTool",
	"./tools/AreaMeasurementTool",
	"./thirdparty/three"
], function(
	vkLibrary,
	vkCore,
	DrawerToolbarRenderer,
	Control,
	IconPool,
	Device,
	VBox,
	FlexAlignContent,
	FlexAlignItems,
	FlexItemData,
	FlexRendertype,
	OverflowToolbar,
	Icon,
	Button,
	ButtonType,
	ToolbarDesign,
	ToolbarSeparator,
	ToggleButton,
	MenuButton,
	RectSelectTool,
	CrossSectionTool,
	Menu,
	MenuItem,
	NavigationMode,
	ZoomTo,
	getResourceBundle,
	ToggleMenuButton,
	ToggleMenuItem,
	Viewport,
	DrawerToolbarButton,
	ManagedObjectObserver,
	core,
	HighlightMeasurementTool,
	CalibrateDistanceMeasurementTool,
	DeleteMeasurementTool,
	DistanceMeasurementTool,
	AngleMeasurementTool,
	AreaMeasurementTool,
	THREE
) {
	"use strict";

	/**
	 * Constructor for a new DrawerToolbar control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Overflow toolbar that can be collapsed.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP
	 * @version 1.113.0
	 *
	 * @public
	 * @alias sap.ui.vk.DrawerToolbar
	 */
	var DrawerToolbar = Control.extend("sap.ui.vk.DrawerToolbar", /** @lends sap.ui.vk.DrawerToolbar.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Indicates whether the DrawerToolbar is expanded or not.
				 * If expanded is set to true, then both the toolbar and 'Close' icon are rendered.
				 * If expanded is set to false, then only the 'Open' icon is rendered.
				 */
				expanded: {
					type: "boolean",
					defaultValue: true
				},
				navigationMode: {
					type: "sap.ui.vk.NavigationMode",
					defaultValue: NavigationMode.Turntable
				}
			},
			aggregations: {
				/**
				 * Determines the content of the DrawerToolbar. See {@link sap.m.OverflowToolbar} for list of allowed controls.
				 * The content visible when the DrawerToolbar is expanded.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: {
						getter: "_getToolbar",
						aggregation: "content",
						forwardBinding: true
					}
				},
				/**
				 * @private
				 */
				_container: {
					type: "sap.m.VBox",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				viewport: {
					type: "sap.ui.vk.ViewportBase",
					multiple: false
				}
			},
			events: {
				/**
				 * Indicates whether the DrawerToolbar is expanded or collapsed.
				 */
				expanded: {
					parameters: {
						/**
						 * If the DrawerToolbar is expanded, this is true.
						 * If the DrawerToolbar is collapsed, this is false.
						 */
						expand: {
							type: "boolean"
						}
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Control.apply(this, arguments);
		}
	});

	var drawerToolbarIcons = [
		{
			name: "show",
			unicode: "e900"
		}, {
			name: "hide",
			unicode: "e901"
		}, {
			name: "turntable",
			unicode: "e902"
		}, {
			name: "orbit",
			unicode: "e903"
		}, {
			name: "pan",
			unicode: "e904"
		}, {
			name: "zoom",
			unicode: "e905"
		}, {
			name: "fit-to-view",
			unicode: "e906"
		}, {
			name: "rectangular-selection",
			unicode: "e907"
		}, {
			name: "predefined-views",
			unicode: "e93c"
		}, {
			name: "cross-section",
			unicode: "e913"
		}, {
			name: "cross-section-x",
			unicode: "e914"
		}, {
			name: "cross-section-y",
			unicode: "e916"
		}, {
			name: "cross-section-z",
			unicode: "e915"
		}, {
			name: "reverse-direction",
			unicode: "e917"
		}, {
			name: "distance-measurement",
			unicode: "e92b"
		}, {
			name: "angle-measurement",
			unicode: "e926"
		}, {
			name: "area-measurement",
			unicode: "e963"
		}, {
			name: "settings",
			unicode: "e909"
		}, {
			name: "calibrate-distance",
			unicode: "e968"
		}
	];
	var collectionName = "vk-icons";
	var fontFamily = "vk-icons";

	drawerToolbarIcons.forEach(function(icon) {
		IconPool.addIcon(icon.name, collectionName, fontFamily, icon.unicode);
	});

	var visIconPath = "sap-icon://vk-icons/";

	DrawerToolbar.prototype.init = function() {
		if (Control.prototype.init) {
			Control.prototype.init.apply(this);
		}

		this._measurementsToggleButton = null;
		this._distanceMeasurementItem = null;
		this._angleMeasurementItem = null;
		this._areaMeasurementItem = null;
		this._deleteMeasurementItem = null;
		this._measurementSettingsItem = null;
		this._calibrateDistanceMeasurementItem = null;

		this._itemsVisibility = new Map();
		this._itemsVisibilityObserver = new ManagedObjectObserver(this._itemVisibilityChanged.bind(this));

		this._toolbar = new OverflowToolbar({
			width: "auto",
			design: ToolbarDesign.Solid,
			layoutData: new FlexItemData({
				growFactor: 0,
				shrinkFactor: 0
			}),
			content: this.createButtons()
		});

		this._toolbar.ontouchstart = function(event) {
			event.setMarked(); // disable the viewport touchstart event under the toolbar
		};

		this._toolbarObserver = new ManagedObjectObserver(this._toolbarContentChanged.bind(this));
		this._toolbarObserver.observe(this._toolbar, { aggregations: ["content"] });

		this._container = new VBox({
			renderType: FlexRendertype.Bare,
			// fitContainer: false,
			// displayInline: true,
			alignContent: FlexAlignContent.Center,
			alignItems: FlexAlignItems.Center,
			items: [
				this._toolbar,
				new Icon({
					src: "sap-icon://navigation-up-arrow",
					noTabStop: true,
					press: function(event) {
						this._toggleExpanded();
					}.bind(this),
					layoutData: new FlexItemData({
						growFactor: 0,
						shrinkFactor: 0
					})
				}).addStyleClass("drawerToolbarIcon")
			]
		});

		this.setAggregation("_container", this._container);

		this._rectSelectTool = new RectSelectTool();
		this._distanceMeasurementTool = new DistanceMeasurementTool({
			enabled: [
				function(event) {
					if (this._measurementsToggleButton.getDefaultItem() === this._distanceMeasurementItem.getId()) {
						this._measurementsToggleButton.setPressed(event.getParameter("enabled"));
					}
				},
				this
			]
		});
		this._angleMeasurementTool = new AngleMeasurementTool({
			enabled: [
				function(event) {
					if (this._measurementsToggleButton.getDefaultItem() === this._angleMeasurementItem.getId()) {
						this._measurementsToggleButton.setPressed(event.getParameter("enabled"));
					}
				},
				this
			]
		});
		this._areaMeasurementTool = new AreaMeasurementTool({
			enabled: [
				function(event) {
					if (this._measurementsToggleButton.getDefaultItem() === this._areaMeasurementItem.getId()) {
						this._measurementsToggleButton.setPressed(event.getParameter("enabled"));
					}
				},
				this
			]
		});
		this._deleteMeasurementTool = new DeleteMeasurementTool({
			enabled: [
				function(event) {
					if (this._measurementsToggleButton.getDefaultItem() === this._deleteMeasurementItem.getId()) {
						this._measurementsToggleButton.setPressed(event.getParameter("enabled"));
						if (this._getViewport().getMeasurementSurface().getMeasurements().length === 0) {
							this._measurementsToggleButton.setDefaultItem(this._distanceMeasurementItem);
						}
					}
				},
				this
			]
		});
		this._calibrateDistanceMeasurementTool = new CalibrateDistanceMeasurementTool({
			enabled: [
				function(event) {
					if (this._measurementsToggleButton.getDefaultItem() === this._calibrateDistanceMeasurementItem.getId()) {
						var enabled = event.getParameter("enabled");
						this._measurementsToggleButton.setPressed(enabled);
						if (!enabled) {
							// When we finish with the distance calibration tool we switch the
							// default toggle menu button to the distance measurement tool.
							this._measurementsToggleButton.setDefaultItem(this._distanceMeasurementItem);
						}
					}
				},
				this
			]
		});
		this._highlightMeasurementTool = new HighlightMeasurementTool();

		var measurementTools = [this._distanceMeasurementTool, this._angleMeasurementTool, this._areaMeasurementTool, this._deleteMeasurementTool, this._calibrateDistanceMeasurementTool];
		function onToolEnabledChanged(event) {
			var activeTool = measurementTools.find(function(tool) { return tool.getActive(); });
			this._highlightMeasurementTool.setActive(activeTool == null, this._getViewport());
		}
		measurementTools.forEach(function(tool) {
			tool.attachEnabled(onToolEnabledChanged, this);
		}, this);

		var eventBus = vkCore.getEventBus();
		eventBus.subscribe("sap.ui.vk", "viewActivated", this._onViewActivated, this);
		eventBus.subscribe("sap.ui.vk", "readyForAnimation", this._onReadyForAnimation, this);
	};

	DrawerToolbar.prototype.exit = function() {
		var eventBus = vkCore.getEventBus();
		eventBus.unsubscribe("sap.ui.vk", "readyForAnimation", this._onReadyForAnimation, this);
		eventBus.unsubscribe("sap.ui.vk", "viewActivated", this._onViewActivated, this);

		this._distanceMeasurementTool.destroy();
		this._distanceMeasurementTool = null;
		this._angleMeasurementTool.destroy();
		this._angleMeasurementTool = null;
		this._highlightMeasurementTool.destroy();
		this._highlightMeasurementTool = null;
		this._areaMeasurementTool.destroy();
		this._areaMeasurementTool = null;
		this._deleteMeasurementTool.destroy();
		this._deleteMeasurementTool = null;
		this._calibrateDistanceMeasurementTool.destroy();
		this._calibrateDistanceMeasurementTool = null;

		this._measurementsToggleButton = null;
		this._distanceMeasurementItem = null;
		this._angleMeasurementItem = null;
		this._areaMeasurementItem = null;
		this._deleteMeasurementItem = null;
		this._measurementSettingsItem = null;
		this._calibrateDistanceMeasurementItem = null;

		this._toolbarObserver.disconnect();
		this._toolbarObserver = null;
		this._toolbar.destroy();
		this._toolbar = null;
	};

	DrawerToolbar.prototype._toolbarContentChanged = function() {
		var content = this._toolbar.getContent();
		for (var i = 0; i < content.length; i++) {
			if (content[i].getMetadata().getName() == "sap.m.ToolbarSeparator") {
				if (content[i - 1] == undefined || content[i + 1] == undefined || content[i - 1].getMetadata().getName() == "sap.m.ToolbarSeparator") {
					this._toolbar.removeContent(i);
				}
			}
		}
	};

	DrawerToolbar.prototype._itemVisibilityChanged = function(event) {
		if (!this._ignoreVisiblityChange) {
			this._itemsVisibility.set(event.object, event.current);
		}
	};

	function isViewport3D(viewport) {
		return viewport ? viewport.getMetadata().getName() === "sap.ui.vk.threejs.Viewport" : false;
	}

	function isSvgViewport(viewport) {
		return viewport ? viewport.getMetadata().getName() === "sap.ui.vk.svg.Viewport" : false;
	}

	function isNativeViewport(viewport) {
		return viewport ? viewport.getMetadata().getName() === "sap.ui.vk.NativeViewport" : false;
	}

	function isView3D(viewport) {
		var view = viewport.getCurrentView && viewport.getCurrentView();
		var dimension = view && view.getDimension();
		return isViewport3D(viewport) && !viewport._redlineHandler && !viewport._isPlanarActivated() && dimension !== 2;
	}

	DrawerToolbar.prototype._getViewport = function() {
		var viewport = core.byId(this.getViewport());
		viewport = viewport instanceof Viewport && viewport.getImplementation() || viewport;
		return viewport && (isViewport3D(viewport) || isSvgViewport(viewport) || isNativeViewport(viewport)) ? viewport : null;
	};

	DrawerToolbar.prototype._getViewStateManager = function() {
		var viewport = core.byId(this.getViewport());
		var vsmId = viewport.getViewStateManager();
		if (vsmId) {
			return core.byId(vsmId);
		}
		return null;
	};

	var predefineViews = [
		null, // initial
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0), // front
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI), // back
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2), // left
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2), // right
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), // top
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2) // bottom
	];

	DrawerToolbar.prototype.createButtons = function() {
		var that = this;
		var resourceBundle = getResourceBundle();

		var crossSectionToggleButton = new ToggleMenuButton({
			type: ButtonType.Transparent,
			tooltip: resourceBundle.getText("CROSS_SECTION_TOOLTIP"),
			items: [
				new ToggleMenuItem({
					icon: visIconPath + "cross-section-x",
					text: resourceBundle.getText("CROSS_SECTION_X"),
					key: 0
				}),
				new ToggleMenuItem({
					icon: visIconPath + "cross-section-y",
					text: resourceBundle.getText("CROSS_SECTION_Y"),
					key: 1
				}),
				new ToggleMenuItem({
					icon: visIconPath + "cross-section-z",
					text: resourceBundle.getText("CROSS_SECTION_Z"),
					key: 2
				}),
				new ToggleMenuItem({
					icon: visIconPath + "reverse-direction",
					text: resourceBundle.getText("CROSS_SECTION_REVERSE"),
					startsSection: true,
					toggleable: false,
					press: function(event) {
						var viewport = that._getViewport();
						if (viewport && that._crossSectionTool && that._crossSectionTool.getActive()) {
							that._crossSectionTool.setFlip(!that._crossSectionTool.getFlip());
						}
					}
				})
			],
			itemToggled: function(event) {
				var viewport = that._getViewport();
				if (viewport && that._crossSectionTool) {
					var newItem = event.getParameter("newItem");
					that._crossSectionTool.setActive(newItem != null, viewport);
					if (newItem) {
						var axis = parseInt(newItem.getKey(), 10);
						if (axis >= 0 && axis < 3) {
							that._crossSectionTool.setAxis(axis);
						}
					}
				}
			}
		});
		crossSectionToggleButton.vitId = DrawerToolbarButton.CrossSection;

		var turntable = new ToggleButton({
			icon: visIconPath + "turntable",
			type: ButtonType.Transparent,
			tooltip: resourceBundle.getText("TURNTABLE_TOOLTIP"),
			press: function(event) {
				that.setNavigationMode(NavigationMode.Turntable);
			}
		});
		turntable.vitId = DrawerToolbarButton.Turntable;

		var orbit = new ToggleButton({
			icon: visIconPath + "orbit",
			type: ButtonType.Transparent,
			tooltip: resourceBundle.getText("ORBIT_TOOLTIP"),
			pressed: false,
			press: function(event) {
				that.setNavigationMode(NavigationMode.Orbit);
			}
		});
		orbit.vitId = DrawerToolbarButton.Orbit;

		var pan = new ToggleButton({
			icon: visIconPath + "pan",
			type: ButtonType.Transparent,
			tooltip: resourceBundle.getText("PAN_TOOLTIP"),
			press: function(event) {
				that.setNavigationMode(NavigationMode.Pan);
			}
		});
		pan.vitId = DrawerToolbarButton.Pan;

		var zoom = new ToggleButton({
			icon: visIconPath + "zoom",
			type: ButtonType.Transparent,
			tooltip: resourceBundle.getText("ZOOM_TOOLTIP"),
			press: function() {
				that.setNavigationMode(NavigationMode.Zoom);
			}
		});
		zoom.vitId = DrawerToolbarButton.Zoom;

		this._gestureButtons = [
			turntable,
			orbit,
			pan,
			zoom
		];

		var show = new Button({
			icon: visIconPath + "show",
			type: ButtonType.Transparent,
			tooltip: resourceBundle.getText("SHOW_TOOLTIP"),
			press: function() {
				var vsm = that._getViewStateManager();
				if (vsm) {
					var selected = [];
					vsm.enumerateSelection(function(item) {
						selected.push(item);
					});
					vsm.setVisibilityState(selected, true, false);
				}
			}
		});
		show.vitId = DrawerToolbarButton.Show;

		var hide = new Button({
			icon: visIconPath + "hide",
			type: ButtonType.Transparent,
			tooltip: resourceBundle.getText("HIDE_TOOLTIP"),
			press: function() {
				var vsm = that._getViewStateManager();
				if (vsm) {
					var selected = [];
					vsm.enumerateSelection(function(item) {
						selected.push(item);
					});
					vsm.setVisibilityState(selected, false, false);
				}
			}
		});
		hide.vitId = DrawerToolbarButton.Hide;

		var fitToView = new Button({
			icon: visIconPath + "fit-to-view",
			type: ButtonType.Transparent,
			tooltip: resourceBundle.getText("FIT_TO_VIEW"),
			press: function() {
				var viewport = core.byId(that.getViewport());
				viewport = viewport instanceof Viewport && viewport.getImplementation() || viewport;
				if (viewport) {
					viewport.zoomTo(ZoomTo.All, null, 0.5, 0);
				}
			}
		});
		fitToView.vitId = DrawerToolbarButton.FitToView;

		this._rectSelectionButton = new ToggleButton({
			icon: visIconPath + "rectangular-selection",
			type: ButtonType.Transparent,
			tooltip: resourceBundle.getText("RECTANGULAR_SELECTION_TOOLTIP")
		});
		this._rectSelectionButton.vitId = DrawerToolbarButton.RectangularSelection;

		var predefinedViews = new MenuButton({
			icon: visIconPath + "predefined-views",
			activeIcon: visIconPath + "predefined-views",
			type: ButtonType.Transparent,
			tooltip: resourceBundle.getText("PREDEFINED_VIEW_MENUBUTTONTOOLTIP"),
			menu: new Menu({
				items: [
					new MenuItem({ text: resourceBundle.getText("PREDEFINED_VIEW_INITIAL") }),
					new MenuItem({ text: resourceBundle.getText("PREDEFINED_VIEW_FRONT"), startsSection: true }),
					new MenuItem({ text: resourceBundle.getText("PREDEFINED_VIEW_BACK") }),
					new MenuItem({ text: resourceBundle.getText("PREDEFINED_VIEW_LEFT") }),
					new MenuItem({ text: resourceBundle.getText("PREDEFINED_VIEW_RIGHT") }),
					new MenuItem({ text: resourceBundle.getText("PREDEFINED_VIEW_TOP") }),
					new MenuItem({ text: resourceBundle.getText("PREDEFINED_VIEW_BOTTOM") })
				]
			}).attachItemSelected(function(event) {
				var viewport = that._getViewport();
				if (viewport) {
					var item = event.getParameters("item").item;
					var index = this.indexOfItem(item);
					viewport._viewportGestureHandler.setView(predefineViews[index], 1000);
				}
			})
		});
		predefinedViews.vitId = DrawerToolbarButton.PredefinedViews;

		var fullscreen = new ToggleButton({
			icon: "sap-icon://full-screen",
			type: ButtonType.Transparent,
			tooltip: resourceBundle.getText("VIEWER_FULLSCREENBUTTONTOOLTIP"),
			press: function(event) {
				var viewport = that._getViewport();
				var isInFullScreen = function(document) {
					return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement);
				};
				if (this.getPressed()) {
					if (!isInFullScreen(document)) {
						if (!that._fullScreenHandler) {
							that._fullScreenHandler = function(event) {
								var isFullScreen = isInFullScreen(document);
								if (!isFullScreen) {
									document.removeEventListener("fullscreenchange", that._fullScreenHandler);
									document.removeEventListener("mozfullscreenchange", that._fullScreenHandler);
									document.removeEventListener("webkitfullscreenchange", that._fullScreenHandler);
									document.removeEventListener("MSFullscreenChange", that._fullScreenHandler);

									this.setPressed(false);
									viewport.removeStyleClass("sapVizKitViewerFullScreen");
								}
							}.bind(this);
						}

						var bodyElement = document.getElementsByTagName("body")[0];
						if (bodyElement.requestFullscreen) {
							document.addEventListener("fullscreenchange", that._fullScreenHandler);
							bodyElement.requestFullscreen();
						} else if (bodyElement.webkitRequestFullScreen) {
							document.addEventListener("webkitfullscreenchange", that._fullScreenHandler);
							bodyElement.webkitRequestFullscreen();
						} else if (bodyElement.mozRequestFullScreen) {
							document.addEventListener("mozfullscreenchange", that._fullScreenHandler);
							bodyElement.mozRequestFullScreen();
						} else if (bodyElement.msRequestFullscreen) {
							document.addEventListener("MSFullscreenChange", that._fullScreenHandler);
							bodyElement.msRequestFullscreen();
						}
					}

					viewport.addStyleClass("sapVizKitViewerFullScreen");
				} else {
					if (isInFullScreen(document)) {
						if (document.cancelFullScreen) {
							document.cancelFullScreen();
						} else if (document.msExitFullscreen) {
							document.msExitFullscreen();
						} else if (document.mozCancelFullScreen) {
							document.mozCancelFullScreen();
						} else if (document.webkitCancelFullScreen) {
							document.webkitCancelFullScreen();
						}
					}

					viewport.removeStyleClass("sapVizKitViewerFullScreen");
				}
			}
		});
		fullscreen.vitId = DrawerToolbarButton.FullScreen;

		this._distanceMeasurementItem = new ToggleMenuItem({
			icon: visIconPath + "distance-measurement",
			text: resourceBundle.getText("MEASUREMENTS_DISTANCE_MENUITEM")
		});

		this._angleMeasurementItem = new ToggleMenuItem({
			icon: visIconPath + "angle-measurement",
			text: resourceBundle.getText("MEASUREMENTS_ANGLE_MENUITEM")
		});

		this._areaMeasurementItem = new ToggleMenuItem({
			icon: visIconPath + "area-measurement",
			text: resourceBundle.getText("MEASUREMENTS_AREA_MENUITEM")
		});

		this._deleteMeasurementItem = new ToggleMenuItem({
			icon: "sap-icon://delete",
			text: resourceBundle.getText("MEASUREMENTS_DELETE_MENUITEM")
		});

		this._calibrateDistanceMeasurementItem = new ToggleMenuItem({
			icon: visIconPath + "calibrate-distance",
			text: resourceBundle.getText("MEASUREMENTS_CALIBRATE_DISTANCE_MENUITEM")
		});

		this._measurementSettingsItem = new ToggleMenuItem({
			startsSection: true,
			icon: visIconPath + "settings",
			text: resourceBundle.getText("MEASUREMENTS_SETTINGS_MENUITEM"),
			toggleable: false
		});

		this._measurementsToggleButton = new ToggleMenuButton({
			type: ButtonType.Transparent,
			tooltip: resourceBundle.getText("MEASUREMENTS_TOOLTIP"),
			items: [
				this._distanceMeasurementItem,
				this._angleMeasurementItem,
				this._areaMeasurementItem,
				this._deleteMeasurementItem,
				this._calibrateDistanceMeasurementItem,
				this._measurementSettingsItem
			],
			itemToggled: function(event) {
				var viewport = that._getViewport();
				var oldItem = event.getParameter("oldItem");
				var newItem = event.getParameter("newItem");

				if (oldItem === that._distanceMeasurementItem) {
					that._distanceMeasurementTool.setActive(false, viewport);
				} else if (oldItem === that._angleMeasurementItem) {
					that._angleMeasurementTool.setActive(false, viewport);
				} else if (oldItem === that._areaMeasurementItem) {
					that._areaMeasurementTool.setActive(false, viewport);
				} else if (oldItem === that._deleteMeasurementItem) {
					that._deleteMeasurementTool.setActive(false, viewport);
				} else if (oldItem === that._calibrateDistanceMeasurementItem) {
					that._calibrateDistanceMeasurementTool.setActive(false, viewport);
				}

				var tools = viewport.getTools();
				var tool;
				if (newItem === that._distanceMeasurementItem) {
					tool = that._distanceMeasurementTool;
				} else if (newItem === that._angleMeasurementItem) {
					tool = that._angleMeasurementTool;
				} else if (newItem === that._areaMeasurementItem) {
					tool = that._areaMeasurementTool;
				} else if (newItem === that._deleteMeasurementItem) {
					tool = that._deleteMeasurementTool;
				} else if (newItem === that._calibrateDistanceMeasurementItem) {
					tool = that._calibrateDistanceMeasurementTool;
				}
				if (tool != null) {
					if (tools.indexOf(tool.getId()) < 0) {
						viewport.addTool(tool);
					}
					tool.setActive(true, viewport);
				}
			},
			itemSelected: function(event) {
				var viewport = that._getViewport();
				var item = event.getParameter("item");
				if (item === that._measurementSettingsItem) {
					that._distanceMeasurementTool.setActive(false, viewport);
					that._angleMeasurementTool.setActive(false, viewport);
					that._areaMeasurementTool.setActive(false, viewport);
					that._deleteMeasurementTool.setActive(false, viewport);
					that._calibrateDistanceMeasurementTool.setActive(false, viewport);
					that._distanceMeasurementTool.showSettingsDialog(viewport);
				}
			},
			beforeMenuOpen: function() {
				var viewport = that._getViewport();
				var surface = viewport.getMeasurementSurface();
				var hasMeasurements = surface.getMeasurements().length > 0;
				that._deleteMeasurementItem.setEnabled(hasMeasurements);
				var hasDistanceMeasurements = surface.getMeasurements().some(function(measurement) { return measurement.isDistance; });
				that._calibrateDistanceMeasurementItem.setEnabled(hasDistanceMeasurements);
			}
		});

		this._measurementsToggleButton.vitId = DrawerToolbarButton.Measurements;

		var measurementsSeparator = new ToolbarSeparator();
		measurementsSeparator.vitId = DrawerToolbarButton.MeasurementsSeparator;

		var crossSectionSeparator = new ToolbarSeparator();
		var predefinedViewsSeparator = new ToolbarSeparator();

		var showHideSeparator = new ToolbarSeparator();
		var rectSelectSeparator = new ToolbarSeparator();
		this._itemsShowHideSelect = [show, hide, showHideSeparator, this._rectSelectionButton, rectSelectSeparator];

		this._itemTurntable = this._gestureButtons[0];
		this._itemPan = this._gestureButtons[2];

		this._items3D = [
			this._gestureButtons[1], // orbit
			crossSectionToggleButton,
			crossSectionSeparator,
			predefinedViews,
			predefinedViewsSeparator
		];

		var items = [
			show,
			hide,
			showHideSeparator,
			this._gestureButtons[0], // turntable
			this._gestureButtons[1], // orbit
			this._gestureButtons[2], // pan
			this._gestureButtons[3], // zoom
			new ToolbarSeparator(),
			this._measurementsToggleButton,
			measurementsSeparator,
			fitToView,
			new ToolbarSeparator(),
			this._rectSelectionButton,
			rectSelectSeparator,
			crossSectionToggleButton,
			crossSectionSeparator,
			predefinedViews,
			predefinedViewsSeparator,
			fullscreen
		];

		items.forEach(function(item) {
			this._itemsVisibility.set(item, true);
			this._itemsVisibilityObserver.observe(item, { properties: ["visible"] });
		}.bind(this));

		return items;
	};

	var gestureIcons = ["drawerToolbarIconTurntable", "drawerToolbarIconOrbit", "drawerToolbarIconPan", "drawerToolbarIconZoom"];

	var CameraHandler = function(vp, toolbar) {
		this.viewport = vp;
		this._toolbar = toolbar;
		this._mode = 1;
		this._gesture = false;
		this._x = 0;
		this._y = 0;
	};

	function setGestureIcon(viewport, mode) {
		gestureIcons.forEach(function(icon, i) {
			if (viewport.hasStyleClass(icon) && i !== mode) {
				viewport.removeStyleClass(icon);
			} else if (i === mode) {
				viewport.addStyleClass(icon);
			}
		});
	}

	function showZoomIconOnScroll(cameraHandler) {
		var viewport = cameraHandler.viewport;
		var mode = cameraHandler._mode;
		var originalIcon = viewport.hasStyleClass(gestureIcons[mode]) ? mode : -1;
		cameraHandler._isScrolling = true;
		if (originalIcon !== 3) {
			// set to zoom icon
			setGestureIcon(viewport, 3);
			// set to original icon when scrolling stop
			setTimeout(function() {
				cameraHandler._isScrolling = false;
				setGestureIcon(viewport, originalIcon);
			}, 500);
		}
	}

	CameraHandler.prototype.beginGesture = function(event) {
		this._gesture = true;
		if (this._mode < 3) {
			this._x = event.points[0].x;
			this._y = event.points[0].y;
		} else {
			this._x = event.x;
			this._y = event.y;
		}

		if (event.scroll) {
			showZoomIconOnScroll(this);
		}

		if (this._toolbar._rectSelectionButton.getPressed() || (event.event && (Device.os.macintosh ? event.event.metaKey : event.event.ctrlKey))) {
			var rect = this.viewport.getDomRef().getBoundingClientRect();
			this._selectionRect = { x1: this._x - rect.left, y1: this._y - rect.top, x2: this._x - rect.left, y2: this._y - rect.top };
		}
	};

	CameraHandler.prototype.endGesture = function() {
		this._gesture = false;
		if (this._selectionRect && (this._selectionRect.x1 !== this._selectionRect.x2 || this._selectionRect.y1 !== this._selectionRect.y2)) {
			this._toolbar._rectSelectTool._select(this._selectionRect.x1, this._selectionRect.y1, this._selectionRect.x2, this._selectionRect.y2, this.viewport, this.viewport.getScene(), this.viewport.getCamera());
			this._selectionRect = null;
			this.viewport.setSelectionRect(null);
		} else if (!this._isScrolling) {
			setGestureIcon(this.viewport, -1);
		}
	};

	CameraHandler.prototype.move = function(event) {
		if (this._gesture) {
			if (event.n == 1) {
				var p = event.points[0];
				if (this._selectionRect) {
					var rect = this.viewport.getDomRef().getBoundingClientRect();
					this._selectionRect.x2 = p.x - rect.left;
					this._selectionRect.y2 = p.y - rect.top;
					this.viewport.setSelectionRect(this._selectionRect);
				} else {
					setGestureIcon(this.viewport, this._mode);
					var dx = p.x - this._x;
					var dy = p.y - this._y;
					switch (this._mode) {
						case 0: this.viewport.rotate(dx, dy, true); break;
						case 1: this.viewport.rotate(dx, dy, false); break;
						case 2: this.viewport.pan(dx, dy); break;
						case 3: this.viewport.zoom(1 + dy * 0.005); break;
						default: break;
					}
					this._x = p.x;
					this._y = p.y;
				}
				event.handled = true;
			} else if (event.n == 2 && !this._isScrolling) {
				setGestureIcon(this.viewport, 2);
			}
		}
	};

	CameraHandler.prototype.hover = function() { };
	CameraHandler.prototype.getViewport = function() {
		return this.viewport;
	};

	DrawerToolbar.prototype.setNavigationMode = function(mode) {
		if (!mode || mode === NavigationMode.NoChange) {
			mode = this.getNavigationMode();
		}

		var viewport = this._getViewport();
		if (viewport) {
			if (!isView3D(viewport)) {// 2D
				if (mode !== NavigationMode.Pan && mode !== NavigationMode.Zoom) {
					mode = NavigationMode.Pan;
				}
			} else if (isViewport3D(viewport) && viewport._isPanoramicActivated()) {// panoramic
				if (mode !== NavigationMode.Turntable && mode !== NavigationMode.Zoom) {
					mode = NavigationMode.Turntable;
				}
			}
		}

		this.setProperty("navigationMode", mode, true);

		var modeIndex = [NavigationMode.Turntable, NavigationMode.Orbit, NavigationMode.Pan, NavigationMode.Zoom].indexOf(mode);
		this._gestureButtons.forEach(function(gestureButton, index) {
			gestureButton.setPressed(index === modeIndex);
		});

		if (viewport) {
			if (!this._cameraHandler || this._cameraHandler.getViewport() !== viewport) {
				this._cameraHandler = new CameraHandler(viewport, this);
				viewport._loco.addHandler(this._cameraHandler, 0);
			}

			this._cameraHandler._mode = modeIndex;
		}
	};

	DrawerToolbar.prototype._getToolbar = function() {
		return this._toolbar;
	};

	DrawerToolbar.prototype._toggleExpanded = function() {
		var newState = !this.getExpanded();
		this.setExpanded(newState);

		this.fireExpanded({
			expand: newState
		});
	};

	/**
	 * Sets the expanded property of the control.
	 * @param {boolean} bExpanded Defines whether control is expanded or not.
	 * @returns {this} Pointer to the control instance to allow method chaining.
	 * @public
	 */
	DrawerToolbar.prototype.setExpanded = function(bExpanded) {
		this.setProperty("expanded", bExpanded, true);

		var domRef = this.getDomRef();
		if (domRef) {
			if (!bExpanded) {
				domRef.classList.add("drawerToolbarCollapsed");
				domRef.classList.remove("drawerToolbarExpanded");
				this._container.addStyleClass("vboxCollapsed");
			} else {
				domRef.classList.add("drawerToolbarExpanded");
				domRef.classList.remove("drawerToolbarCollapsed");
				this._container.removeStyleClass("vboxCollapsed");
			}
		}

		return this;
	};

	DrawerToolbar.prototype._onViewActivated = function(channel, eventId, event) {
		if (event && event.view && event.source && event.source === this._getViewport()) {
			this.invalidate();
		}
	};

	DrawerToolbar.prototype._onReadyForAnimation = function(channel, eventId, event) {
		var viewport = this._getViewport();
		if (event && event.view && event.source && viewport._getViewStateManagerThreeJS && event.source === viewport._getViewStateManagerThreeJS()) {
			this.invalidate();
		}
	};

	DrawerToolbar.prototype.onBeforeRendering = function() {
		var viewport = this._getViewport();
		this._container.setVisible(!!viewport);
		if (viewport) {
			var is3D = isView3D(viewport);
			var isPanoramic = isViewport3D(viewport) && viewport._isPanoramicActivated();
			var isNative = isNativeViewport(viewport); // no scene tree, show/hide/selection not supported

			this._ignoreVisiblityChange = true;

			this._itemsShowHideSelect.forEach(function(item) {
				item.setVisible(!isNative && this._itemsVisibility.get(item));
			}.bind(this));

			this._itemTurntable.setVisible(is3D && this._itemsVisibility.get(this._itemTurntable));
			this._itemPan.setVisible(!isPanoramic && this._itemsVisibility.get(this._itemPan));

			this._items3D.forEach(function(item) {
				item.setVisible(is3D && !isPanoramic && this._itemsVisibility.get(item));
			}.bind(this));

			this._ignoreVisiblityChange = false;

			if (is3D && !isPanoramic) {
				this._crossSectionTool = this._crossSectionTool || new CrossSectionTool();
				viewport.addTool(this._crossSectionTool);
			}

			this.setNavigationMode(NavigationMode.NoChange); // update the navigation mode to match the viewport and view type
		}
	};

	return DrawerToolbar;
});
