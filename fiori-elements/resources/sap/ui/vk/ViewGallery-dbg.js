/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.ViewGallery.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"./library",
	"./Core",
	"sap/m/Slider",
	"./ViewGalleryRenderer",
	"./getResourceBundle",
	"./ViewGalleryThumbnail",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/FormattedText",
	"sap/m/FlexItemData",
	"sap/m/Image",
	"sap/m/ScrollContainer",
	"sap/m/Button",
	"sap/m/ToggleButton",
	"sap/m/Toolbar",
	"sap/m/Popover",
	"sap/m/Title",
	"sap/m/SelectList",
	"sap/m/ToolbarSpacer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/dnd/DropInfo",
	"sap/ui/core/dnd/DragInfo",
	"sap/base/Log"
], function(
	Control,
	IconPool,
	vkLibrary,
	vkCore,
	AnimationTimeSlider,
	ViewGalleryRenderer,
	getResourceBundle,
	ViewGalleryThumbnail,
	HBox,
	VBox,
	FormattedText,
	FlexItemData,
	Image,
	ScrollContainer,
	Button,
	ToggleButton,
	Toolbar,
	Popover,
	Title,
	SelectList,
	ToolbarSpacer,
	JSONModel,
	DropInfo,
	DragInfo,
	Log
) {
	"use strict";

	/**
	 *  Constructor for a new ViewGallery.
	 *
	 * @class
	 * Enables capabilities for navigating and activating procedures and steps contained in a single 3D scene.
	 *
	 * @param {string} [sId] ID for the new control. This ID is generated automatically if no ID is provided.
	 * @param {object} [mSettings] Initial settings for the new View Gallery control.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.ViewGallery
	 * @since 1.62.0
	 */
	var ViewGallery = Control.extend("sap.ui.vk.ViewGallery", /** @lends sap.ui.vk.ViewGallery.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Indicates that the View Gallery control should display animation slider showing time of animation in current view.
				 */
				showAnimationTimeSlider: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Indicates that the View Gallery control should display toolbar
				 */
				showToolbar: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Indicates that the View Gallery control should display thumbnails
				 */
				showThumbnailContainer: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Index of selected view
				 */
				selectedViewIndex: {
					type: "int",
					defaultValue: -1
				},
				/**
				 * Index of selected view group
				 */
				selectedViewGroupIndex: {
					type: "int",
					defaultValue: -1
				},
				/**
				 * Indicates that the View Gallery control should allow view reordering
				 */
				enableViewReordering: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Sets the transparency level of the view gallery. Range is 0-1, with 1 being 100% opaque and 0 being 0% opaque
				 */
				transparency: {
					type: "float",
					defaultValue: 1
				},
				/**
				 * If disabled, view gallery is non-interactive and greyed out
				 */
				enabled: {
					type: "boolean",
					defaultValue: true
				}
			},

			associations: {
				animationPlayer: {
					type: "sap.ui.vk.AnimationPlayer"
				},

				contentConnector: {
					type: "sap.ui.vk.ContentConnector"
				},

				host: {
					type: "sap.ui.vk.ViewportBase"
				},

				viewManager: {
					type: "sap.ui.vk.ViewManager"
				}
			},

			aggregations: {
				/**
				 * sap.m.Toolbar used to render the entire View Gallery control's content.
				 * @private
				 */
				toolbar: {
					type: "sap.m.Toolbar",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * sap.m.ScrollContainer used to render a list of thumbnails for the available steps.
				 * @private
				 */
				container: {
					type: "sap.m.ScrollContainer",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * @private
				 */
				animationTimeSlider: {
					type: "sap.m.Slider",
					multiple: false,
					visibility: "hidden"
				}
			},

			events: {
				/**
				 * Fires when selection is changed via user interaction inside the control.
				 */
				selectionChange: {
					parameters: {
						item: "sap.ui.core.Control"
					}
				},
				/**
				 * Fires when views are reordered
				 */
				viewOrderChange: {
					parameters: {
						view: "sap.ui.vk.View",
						viewIndex: "int"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Control.apply(this, arguments);
			vkCore.observeAssociations(this);
		}
	});

	ViewGallery.prototype.init = function() {
		if (Control.prototype.init) {
			Control.prototype.init.call(this);
		}

		var that = this;

		window.addEventListener("resize", function() {
			that.resizeToolbarSpacer();
		}, true);


		this._scene = null;
		this._vkScene = null;
		this._viewItems = [];
		this._viewManager = null;
		this._host = null;
		this._cdsLoader = null;
		this._selectedGroupIndex = -1;

		this._previousOrientationVertical = false;

		this._playingAnimation = true;
		this._draggedModelView = {};

		this._animationPlayer = null;
		this._manualTimeChange = false;

		IconPool.addIcon("landscape-text", "vk-icons", "vk-icons", "e019");
		IconPool.addIcon("portrait-text", "vk-icons", "vk-icons", "e01a");

		// Create JSON data model
		this.oModel = new JSONModel();

		if (this.getShowThumbnailContainer()) {
			this.createThumbnailContainer();
		}

		if (this.getShowToolbar()) {
			this.createToolbar();
		}

		if (this.getShowAnimationTimeSlider()) {
			this.setAggregation("animationTimeSlider", new AnimationTimeSlider());
			this._attachAnimationTimeSlider(this.getAnimationTimeSlider());
		}

		vkCore.getEventBus().subscribe("sap.ui.vk", "viewActivated", this._onViewActivated, this);
		vkCore.getEventBus().subscribe("sap.ui.vk", "procedureFinished", this._onProcedureFinished, this);
	};

	ViewGallery.prototype.exit = function() {
		vkCore.getEventBus().unsubscribe("sap.ui.vk", "viewActivated", this._onViewActivated, this);
		vkCore.getEventBus().unsubscribe("sap.ui.vk", "procedureFinished", this._onProcedureFinished, this);
		this.setScene(null);
	};

	ViewGallery.prototype.onSetViewManager = function(viewManager) {
		this._viewManager = viewManager;
	};

	ViewGallery.prototype.onUnsetViewManager = function(viewManager) {
		this._viewManager = null;
	};

	ViewGallery.prototype._getSelectedViewGroup = function() {
		var index = this.getSelectedViewGroupIndex();
		var result;
		if (this._vkScene) {
			var viewGroups = this._vkScene.getViewGroups();
			if (index >= 0 && index < viewGroups.length) {
				result = viewGroups[index];
			}
		}

		return result;
	};

	ViewGallery.prototype._getSelectedView = function() {
		var result;
		var index = this.getSelectedViewIndex();
		var views = this._getViews();
		if (views && index >= 0 && index < views.length) {
			result = views[index];
		}

		return result;
	};

	ViewGallery.prototype._getViewGroups = function() {
		var result;
		if (this._vkScene) {
			result = this._vkScene.getViewGroups();
		}
		return result;
	};

	ViewGallery.prototype._getViews = function() {
		var viewGroup = this._getSelectedViewGroup();

		var views;
		if (viewGroup) {
			views = viewGroup.getViews();
		} else if (this._vkScene) {
			views = this._vkScene.getViews();
		}

		return views;
	};

	ViewGallery.prototype._getViewIndex = function(view) {
		var result = -1;

		var views = this._getViews();
		if (Array.isArray(views)) {
			result = views.indexOf(view);
		}

		return result;
	};

	ViewGallery.prototype._getViewAnimationDuration = function(view) {
		view = view || this._getSelectedView();
		var result;

		if (view) {
			var playbacks = view.getPlaybacks();
			if (Array.isArray(playbacks) && playbacks.length) {
				result = playbacks.reduce(function(acc, playback) {
					return acc + playback.getDuration();
				}, 0);
			}
		}

		return result;
	};

	ViewGallery.prototype.setVisible = function(value) {
		if (Control.prototype.setVisible) {
			Control.prototype.setVisible.call(this, value);
		}

		this.setDescription();
	};

	ViewGallery.prototype.resizeToolbarSpacer = function() {
		// Skip if ViewGallery is not visible
		if (this.getDomRef()) {
			var buttonsWidth = this._nextItemButton.getDomRef().getBoundingClientRect().width;
			buttonsWidth += this._playButton.getDomRef().getBoundingClientRect().width;
			buttonsWidth += this._previousItemButton.getDomRef().getBoundingClientRect().width;
			var toolbarWidth = this.toolbar.getDomRef().getBoundingClientRect().width;
			var widthPercent = (buttonsWidth / toolbarWidth) * 100;
			var toolbarSpacerWidthPercent = 50 - widthPercent;
			this._toolbarSpacer.setWidth(toolbarSpacerWidthPercent + "%");
		}
	};

	ViewGallery.prototype.onAfterRendering = function() {
		this.resizeToolbarSpacer();

		if (document.getElementById("body")) {

			var computedStyle = window.getComputedStyle(document.getElementById("body"));
			var backgroundColor = computedStyle.getPropertyValue("background-color");
			var temporaryBackgroundColor;
			var viewGalleryDomRef = this.getDomRef();

			if (backgroundColor) {
				if (backgroundColor.indexOf("a") === -1) { // background color is in format rgb(r, g, b)
					temporaryBackgroundColor = backgroundColor.replace("rgb", "rgba").replace(")", ", " + this.getTransparency() + ")");
					viewGalleryDomRef.style.backgroundColor = temporaryBackgroundColor;
				} else { // background color is in format rgba(r, g, b, a)
					var reg = new RegExp("([^,]*)$"); // match from end of line back to first comma
					temporaryBackgroundColor = backgroundColor.replace(reg, " " + this.getTransparency() + ")");
					viewGalleryDomRef.style.backgroundColor = temporaryBackgroundColor;
				}
			}

			if (this.toolbar) {
				var toolbarDomRef = this.toolbar.getDomRef();
				toolbarDomRef.style.backgroundColor = "rgba(0, 0, 0, 0)"; // toolbar background color is applied overtop of view gallery, so we set it to transparent so it matches
			}

		}

		if (this._host && this._host.getContent().indexOf(this) !== -1) {
			// If view gallery is inside host we need to adjust step description box sizes
			this.adjustStepDescriptionBoxes();
		}

		if (this.getDomRef()) {
			var domRef = this.getDomRef();
			if (!this.getEnabled()) {
				var setTabIndexRecursive = function(domRef) {
					var children = domRef.children;
					for (var i = 0; i < children.length; i++) {
						children[i].tabIndex = -1;
						setTabIndexRecursive(children[i]);
					}
				};
				setTabIndexRecursive(domRef);
				this.addStyleClass("sapVizKitViewGalleryDisabled");
			} else {
				this.removeStyleClass("sapVizKitViewGalleryDisabled");
			}
		}
	};

	ViewGallery.prototype.setShowAnimationTimeSlider = function(value) {
		this.setProperty("showAnimationTimeSlider", value);

		if (value) {
			this._detachAnimationTimeSlider(this.getAnimationTimeSlider());
			this.setAggregation("animationTimeSlider", new AnimationTimeSlider());
			this._attachAnimationTimeSlider(this.getAnimationTimeSlider());
		} else {
			this._detachAnimationTimeSlider(this.getAnimationTimeSlider());
			this.destroyAggregation("animationTimeSlider");
		}
		this._setupAnimationSlider();
	};

	ViewGallery.prototype.getAnimationTimeSlider = function() {
		return this.getAggregation("animationTimeSlider");
	};

	ViewGallery.prototype.destroyToolbar = function() {
		this.destroyAggregation("toolbar");
	};

	ViewGallery.prototype.destroyThumbnailContainer = function() {
		this.destroyAggregation("container");
	};

	ViewGallery.prototype.createThumbnailContainer = function() {
		var that = this;
		this._hbox = new HBox();
		if (this.getEnableViewReordering()) {
			this._hbox.addDragDropConfig(new DropInfo({
				dropEffect: sap.ui.core.dnd.DropEffect.Move,
				dropPosition: sap.ui.core.dnd.DropPosition.On,
				targetAggregation: "items",
				drop: function(oEvent) {
					var droppedItem = oEvent.getParameter("droppedControl");
					that.reorderViews(droppedItem);
					that.fireViewOrderChange({ view: that._draggedModelView, viewIndex: that._viewItems.indexOf(droppedItem) });
				}
			}));
			this._hbox.getMetadata().getAggregation().dnd.droppable = true;
		}
		this._scrollContainer = new ScrollContainer(this.getId() + "-scroller", {
			width: "100%",
			horizontal: true,
			vertical: false,
			focusable: true,
			content: [this._hbox]
		});
		this._scrollContainer.addStyleClass("sapVizKitViewGalleryScrollContainer");
		this.setAggregation("container", this._scrollContainer);
	};

	ViewGallery.prototype.reorderViews = function(droppedItem) {
		var index = this._modelViews.indexOf(this._draggedModelView);
		this._modelViews.splice(index, 1);
		var index2 = this._viewItems.indexOf(droppedItem);
		this._modelViews.splice(index2, 0, this._draggedModelView);
		this._refreshItems();
	};

	ViewGallery.prototype.createToolbar = function() {
		var that = this;

		this.toolbar = new Toolbar({
			design: sap.m.ToolbarDesign.Auto
		});

		this.setAggregation("toolbar", this.toolbar);

		// Create the play previous button
		this._previousItemButton = new Button(this.getId() + "-previousItemButton", {
			type: sap.m.ButtonType.Transparent,
			icon: "sap-icon://close-command-field",
			tooltip: getResourceBundle().getText("STEP_NAV_PREVIOUSSTEPBUTTON"),
			press: function(event) {
				var i = that.getSelectedViewIndex();
				if (i > 0) {
					that.setSelectedItem(that._viewItems[i - 1]);
				}
			}
		});

		// Create the play next button
		this._nextItemButton = new Button(this.getId() + "-nextItemButton", {
			type: sap.m.ButtonType.Transparent,
			icon: "sap-icon://open-command-field",
			tooltip: getResourceBundle().getText("STEP_NAV_NEXTSTEPBUTTON"),
			press: function(event) {
				var i = that.getSelectedViewIndex();
				if (i >= 0 && i + 1 < that._viewItems.length) {
					that.setSelectedItem(that._viewItems[i + 1]);
				}
			}
		});

		// Create the procedure list popup
		this._viewGroupSelector = new Popover({
			showHeader: false,
			contentWidth: "20%",
			placement: sap.m.PlacementType.Top,
			horizontalScrolling: false,
			verticalScrolling: false,
			content: [
				new ScrollContainer({
					horizontal: false,
					vertical: true,
					content: [
						this._procedureList = new SelectList({
							width: "100%",
							itemPress: function(oControlEvent) {
								that._clearUI();
								var index = this.indexOfItem(oControlEvent.getParameter("item"));
								that.setSelectedViewGroupIndex(index);
							}
						})
					]
				})
			]
		});

		// Create the play button
		this._playButton = new ToggleButton(this.getId() + "-playButton", {
			type: sap.m.ButtonType.Transparent,
			pressed: false,
			icon: "sap-icon://media-play",
			visible: true,
			tooltip: getResourceBundle().getText("STEP_NAV_PLAYMENU_PLAY"),
			press: function(oEvent) {
				this._setPlayState(oEvent.getSource().getPressed());
				if (oEvent.getSource().getPressed()) {
					this._playProcedure();
				} else {
					this._pauseAnimation();
				}
			}.bind(this)
		});

		// Create the step count text
		this._stepCount = new Title({
			textAlign: sap.ui.core.TextAlign.Right,
			level: "H5",
			titleStyle: "H5"
		});

		// Create the current procedure title text
		this._currentGroupTitle = new Title({
			text: getResourceBundle().getText("STEP_NAV_PROCEDURES"),
			tooltip: getResourceBundle().getText("STEP_NAV_PROCEDURES"),
			level: "H5",
			titleStyle: "H5"
		}).addStyleClass("sapVizKitViewGalleryCurrentGroupTitle");

		// Create the "/" that separates the current procedure and current step title text
		this._separatorTitle = new Title({
			width: (5 / 1920) * 100 + "%", // width is relative to 5px on a 1920x1080 screen
			level: "H5",
			titleStyle: "H5"
		});

		// Create the current step title text
		this._currentStepTitle = new Title({
			level: "H5",
			titleStyle: "H5"
		}).addStyleClass("sapVizKitViewGalleryCurrentStepTitle");

		// Add click functionality to current procedure title text
		this._currentGroupTitle.addEventDelegate({
			ontap: function() {
				this._viewGroupSelector.openBy(this._currentGroupTitle);
			}.bind(this)
		});

		this._toolbarSpacer = new ToolbarSpacer();

		// Add components to toolbar
		this.toolbar.addContent(this._currentGroupTitle)
			.addContent(this._separatorTitle)
			.addContent(this._currentStepTitle)
			.addContent(new ToolbarSpacer())
			.addContent(this._stepCount)
			.addContent(this._toolbarSpacer)
			.addContent(this._previousItemButton)
			.addContent(this._playButton)
			.addContent(this._nextItemButton);
	};

	ViewGallery.prototype._setPlayState = function(isPlaying) {
		if (this.getAggregation("toolbar")) {
			this._playButton.setPressed(isPlaying);
			if (isPlaying) {
				this._playButton.setIcon("sap-icon://media-pause");
				this._playButton.setTooltip(getResourceBundle().getText("STEP_NAV_PLAYMENU_PAUSE"));
			} else {
				this._playButton.setIcon("sap-icon://media-play");
				this._playButton.setTooltip(getResourceBundle().getText("STEP_NAV_PLAYMENU_PLAY"));
			}
		}
	};

	// Create both the horizontal and vertical step description boxes
	ViewGallery.prototype._createStepDescriptionBoxes = function() {
		this._stepDescription = new VBox({
			renderType: sap.m.FlexRendertype.Bare,
			fitContainer: false,
			alignContent: sap.m.FlexAlignContent.Start,
			alignItems: sap.m.FlexAlignItems.Start,
			justifyContent: sap.m.FlexJustifyContent.End,
			items: [
				this._stepDescriptionToolbar = new Toolbar({
					design: sap.m.ToolbarDesign.Solid,
					content: [
						this._stepDescriptionIcon = new sap.ui.core.Icon({
							src: "sap-icon://navigation-up-arrow",
							press: function(event) {
								this._toggleViewDescription();
							}.bind(this)
						}).addStyleClass("sapVizKitViewGalleryStepDescriptionIcon sapVizKitViewGalleryStepDescriptionIconTransform"),
						new ToolbarSpacer(),
						this._stepDescriptionOrientationIcon = new sap.ui.core.Icon({
							src: "sap-icon://vk-icons/landscape-text",
							press: function(event) {
								this._toggleOrientation();
							}.bind(this)
						}).addStyleClass("sapVizKitViewGalleryStepDescriptionOrientationIcon")
					],
					layoutData: new FlexItemData({
						shrinkFactor: 0
					})
				}).addStyleClass("sapVizKitViewGalleryStepDescriptionToolbar"),
				this._stepDescriptionScroll = new ScrollContainer({
					horizontal: false,
					vertical: true,
					content: [
						this._stepDescriptionText = new FormattedText({
							visible: true
						}).addStyleClass("sapVizKitViewGalleryStepDescriptionText")
					]
				}).addStyleClass("sapVizKitViewGalleryStepDescriptionScroll")
			]
		}).addStyleClass("sapVizKitViewGalleryStepDescription");
		this._stepDescription.vitId = "VIT-StepDescription";

		this._stepDescriptionVertical = new HBox({
			renderType: sap.m.FlexRendertype.Bare,
			fitContainer: false,
			alignContent: sap.m.FlexAlignContent.Start,
			alignItems: sap.m.FlexAlignItems.Start,
			justifyContent: sap.m.FlexJustifyContent.End,
			items: [
				this._stepDescriptionVerticalScroll = new ScrollContainer({
					horizontal: false,
					vertical: true,
					content: [
						this._stepDescriptionVerticalText = new FormattedText({
							visible: false
						}).addStyleClass("sapVizKitViewGalleryStepDescriptionVerticalText")
					]
				}).addStyleClass("sapVizKitViewGalleryStepDescriptionVerticalScroll"),
				this._stepDescriptionVerticalToolbar = new Toolbar({
					design: sap.m.ToolbarDesign.Solid,
					content: [
						this._stepDescriptionVerticalIcon = new sap.ui.core.Icon({
							src: "sap-icon://navigation-right-arrow",
							press: function(event) {
								this._toggleViewDescriptionVertical();
							}.bind(this)
						}).addStyleClass("sapVizKitViewGalleryStepDescriptionVerticalIcon sapVizKitViewGalleryStepDescriptionIconTransform"),
						this._stepDescriptionVerticalOrientationIcon = new sap.ui.core.Icon({
							src: "sap-icon://vk-icons/portrait-text",
							press: function(event) {
								this._toggleOrientation();
							}.bind(this)
						}).addStyleClass("sapVizKitViewGalleryStepDescriptionVerticalOrientationIcon")
					],
					layoutData: new FlexItemData({
						shrinkFactor: 0
					})
				}).addStyleClass("sapVizKitViewGalleryStepDescriptionVerticalToolbar")
			]
		}).addStyleClass("sapVizKitViewGalleryStepDescriptionVertical");
		this._stepDescriptionVertical.vitId = "VIT-StepDescriptionVertical";
	};

	ViewGallery.prototype.adjustStepDescriptionBoxes = function() {
		if (this._stepDescription.getDomRef()) {
			var viewGalleryHeight = this.getDomRef().getBoundingClientRect().height;
			var stepDescription = this._stepDescription.getDomRef().id;
			var stepDescriptionVertical = this._stepDescriptionVertical.getDomRef().id;
			document.getElementById(stepDescription).style.bottom = viewGalleryHeight + "px";
			document.getElementById(stepDescriptionVertical).style.bottom = viewGalleryHeight + "px";
			var hostHeight = this._host.getDomRef().getBoundingClientRect().height;
			document.getElementById(stepDescriptionVertical).style.height = hostHeight - viewGalleryHeight + "px";
		}
	};

	// Toggles the step description box between horizontal and vertical
	ViewGallery.prototype._toggleOrientation = function() {
		if (this._stepDescriptionToolbar.getVisible()) {
			this._stepDescriptionToolbar.setVisible(false);
			this._stepDescriptionVerticalToolbar.setVisible(true);
			this._previousOrientationVertical = true;
			if (this._stepDescriptionText.getVisible()) {
				this._stepDescriptionVerticalText.setVisible(true);
			}
			this._stepDescriptionText.setVisible(false);
		} else {
			this._stepDescriptionToolbar.setVisible(true);
			this._previousOrientationVertical = false;
			if (this._stepDescriptionVerticalText.getVisible()) {
				this._stepDescriptionText.setVisible(true);
			}
			this._stepDescriptionVerticalToolbar.setVisible(false);
			this._stepDescriptionVerticalText.setVisible(false);
		}
		this._stepDescription.rerender();
		this._stepDescriptionVertical.rerender();

		if (this._host && this._host.getContent().indexOf(this) !== -1) {
			this.adjustStepDescriptionBoxes();
		}
	};

	// Toggles the horizontal step description box between expanded and not
	ViewGallery.prototype._toggleViewDescription = function() {
		if (!this._stepDescriptionText.getVisible()) {
			this._stepDescriptionText.setVisible(true);
			this._stepDescriptionIcon.addStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
			this._stepDescriptionVerticalIcon.addStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
		} else {
			this._stepDescriptionText.setVisible(false);
			this._stepDescriptionIcon.removeStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
			this._stepDescriptionVerticalIcon.removeStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
		}
		this._stepDescriptionText.rerender();
	};

	// Toggles the vertical step description box between expanded and not
	ViewGallery.prototype._toggleViewDescriptionVertical = function() {
		if (!this._stepDescriptionVerticalText.getVisible()) {
			this._stepDescriptionVerticalText.setVisible(true);
			this._stepDescriptionVerticalIcon.addStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
			this._stepDescriptionIcon.addStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
		} else {
			this._stepDescriptionVerticalText.setVisible(false);
			this._stepDescriptionVerticalIcon.removeStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
			this._stepDescriptionIcon.removeStyleClass("sapVizKitViewGalleryStepDescriptionIconTransform");
		}
		this._stepDescriptionVerticalText.rerender();
	};

	// Returns the ViewGallery main HBox
	ViewGallery.prototype._getHBox = function() {
		return this._hbox;
	};

	// Plays all steps of procedure from currently selected step until end of procedure
	ViewGallery.prototype._playProcedure = function() {
		this._manualTimeChange = false;
		if (this._viewManager) {
			var selectedView = this._getSelectedView();
			if (!selectedView) {
				var views = this._getViews();
				if (views && views.length) {
					selectedView = views[0];
				}
			}
			if (selectedView) {
				this._viewManager.playViewGroup(selectedView, this._getSelectedViewGroup());
			}
		}
	};

	// Pauses the procedure playing
	ViewGallery.prototype._pauseAnimation = function() {
		if (this._viewManager) {
			this._viewManager.stopPlayingViewGroup();
		}
	};

	/**
	 * Set if playing animation when activating view or playing procedure
	 *
	 * @param {boolean} play true if playing animation
	 * @public
	 */
	ViewGallery.prototype.setPlayingAnimation = function(play) {
		this._playingAnimation = play;
	};

	ViewGallery.prototype.onSetAnimationPlayer = function(animationPlayer) {
		this._animationPlayer = animationPlayer;
		animationPlayer.attachTimeChanged(this._onAnimationPlayerTimeChanged, this);
		animationPlayer.attachStateChanged(this._onAnimationPlayerStateChanged, this);
		this._setupAnimationSlider();
	};

	ViewGallery.prototype.onUnsetAnimationPlayer = function(animationPlayer) {
		animationPlayer.detachTimeChanged(this._onAnimationPlayerTimeChanged, this);
		animationPlayer.detachStateChanged(this._onAnimationPlayerStateChanged, this);
		this._animationPlayer = null;
	};

	ViewGallery.prototype._setupAnimationSlider = function() {
		var animationSlider = this.getAnimationTimeSlider();

		if (animationSlider && this._animationPlayer) {
			var duration = this._getViewAnimationDuration();
			if (duration) {
				animationSlider.setMax(duration);
				animationSlider.setStep(duration / 100);
				animationSlider.setValue(this._animationPlayer.getTime());
			}
		}
	};

	ViewGallery.prototype._onAnimationPlayerTimeChanged = function(event) {
		var time = event.getParameter("time");
		var animationSlider = this.getAnimationTimeSlider();
		if (animationSlider) {
			animationSlider.setValue(time);
		}
	};

	ViewGallery.prototype._onAnimationPlayerStateChanged = function(event) {
		var playing = event.getParameter("playing");

		this._setPlayState(playing);
	};

	ViewGallery.prototype._onProcedureFinished = function(event) {
		this._setPlayState(false);
	};

	/**
	 * Attaches a Scene object to the View Gallery control so that it can access the Scene’s procedures and steps.
	 *
	 * @param {object} scene The Scene object to attach to the View Gallery control.
	 * @public
	 */
	ViewGallery.prototype.setScene = function(scene) {
		// if cds loaded this content, we need to attach some event for refreshing
		// this is because cds can update content after the scene is loaded
		// as cds streaming information from the server
		if (scene && scene.loaders) {
			for (var i = 0; i < scene.loaders.length; i++) {
				var loader = scene.loaders[i];
				if (loader.getMetadata && loader.getMetadata().getName() === "sap.ui.vk.threejs.ContentDeliveryService") {
					if (this._cdsLoader) {
						this._cdsLoader.detachLoadingFinished(this._handleCdsViewGroupUpdate, this);
					}
					this._cdsLoader = loader; // grab 1st one as we can only have one cds with scene atm
					this._cdsLoader.attachLoadingFinished(this._handleCdsViewGroupUpdate, this);
					break;
				} else if (loader.requestViewGroup) { // TotaraLoader
					this._loader = loader;
					break;
				}
			}
		}

		if (scene == null && this._cdsLoader) {
			// No scene, clear up resources
			this._cdsLoader.detachLoadingFinished(this._handleCdsViewGroupUpdate, this);
			this._cdsLoader = null;
		}

		this._vkScene = scene;
		this._refreshProcedures();
		this._resetCurrentView();
	};

	ViewGallery.prototype._onViewActivated = function(channel, eventId, event) {
		var index;
		var view = event.view;
		var viewGroups = this._getViewGroups();
		if (viewGroups && viewGroups.length > 0) {
			var selectedGroup = viewGroups[this.getSelectedViewGroupIndex()];
			if (selectedGroup && selectedGroup.getViewGroupId() != view.viewGroupId) {
				// We need to activate view group first, it may need to download views before we can activate view
				for (var i = 0; i < viewGroups.length; i++) {
					if (viewGroups[i].getViewGroupId() === view.viewGroupId) {
						// View group found, activate it
						for (var k = 0; k < viewGroups[i].getViews().length; k++) {
							if (viewGroups[i].getViews()[k] === view) {
								index = k;
								this.setSelectedViewGroupIndex(i, index);
								break;
							}
						}
					}
				}
			} else {
				for (var j = 0; selectedGroup && j < selectedGroup.getViews().length; j++) {
					if (selectedGroup.getViews()[j] === view) {
						index = j;
						this.viewActivated(index, view);
						break;
					}
				}
			}
		}
	};

	ViewGallery.prototype.onSetHost = function(host) {
		if (host.getContent()) {
			var getIndex = function(name) {
				var content = host.getContent();
				for (var i = 0; i < content.length; i++) {
					if (content[i].vitId == name) {
						return i;
					}
				}
			};
			host.removeContent(getIndex("VIT-StepDescription"));
			host.removeContent(getIndex("VIT-StepDescriptionVertical"));
		}

		this._createStepDescriptionBoxes();

		host.addContent(this._stepDescription);
		host.addContent(this._stepDescriptionVertical);

		this._stepDescriptionToolbar.setVisible(false);
		this._stepDescriptionVerticalToolbar.setVisible(false);

		this._attachAnimationTimeSlider(this.getAnimationTimeSlider());
	};

	ViewGallery.prototype.onUnsetHost = function(host) {
		this._detachAnimationTimeSlider(this.getAnimationTimeSlider());
	};

	ViewGallery.prototype._attachAnimationTimeSlider = function(animationTimeSlider) {
		if (!animationTimeSlider) {
			return;
		}

		animationTimeSlider.attachChange(this._onSliderValueChange, this);
		animationTimeSlider.attachLiveChange(this._onSliderValueLiveChange, this);
	};

	ViewGallery.prototype._detachAnimationTimeSlider = function(animationTimeSlider) {
		if (!animationTimeSlider) {
			return;
		}

		animationTimeSlider.detachChange(this._onSliderValueChange, this);
		animationTimeSlider.detachLiveChange(this._onSliderValueLiveChange, this);
	};

	ViewGallery.prototype._onSliderValueLiveChange = function(event) {
		var value = event.getParameter("value");

		this._manualTimeChange = true;

		if (this._animationPlayer && this._animationPlayer.getTime() !== value) {
			this._animationPlayer.setTime(value);
		}
	};

	ViewGallery.prototype._onSliderValueChange = function(event) {
		var value = event.getParameter("value");

		this._manualTimeChange = true;

		if (this._animationPlayer && this._animationPlayer.getTime() !== value) {
			this._animationPlayer.setTime(value);
		}
	};

	// Populates the procedure select list
	ViewGallery.prototype._refreshProcedures = function(currentViewGroupId) {
		if (this.getAggregation("toolbar")) {
			this._procedureList.removeAllItems();
		}
		this._modelViews = null;

		var viewGroups = this._getViewGroups();
		if (viewGroups && viewGroups.length > 0) {
			this._selectedGroupIndex = 0;
			var index = 0;
			viewGroups.forEach(function(viewportGroup) {
				// viewportGroup.id = THREE.MathUtils.generateUUID();
				if (this.getAggregation("toolbar")) {
					this._procedureList.addItem(new sap.ui.core.Item({
						key: viewportGroup.getViewGroupId(),
						text: viewportGroup.getName()
					}));
				}

				if (currentViewGroupId && viewportGroup.getViewGroupId() === currentViewGroupId) {
					this._selectedGroupIndex = index;
				}
				index++;
			}.bind(this));

			this._modelViews = this._getViews();
			if (this.getAggregation("toolbar")) {
				this._currentGroupTitle.setText(viewGroups[this._selectedGroupIndex].getName()).setTooltip(viewGroups[this._selectedGroupIndex].getName());
			}
		} else if (this.getAggregation("toolbar")) {
			this._currentGroupTitle.setText(getResourceBundle().getText("STEP_NAV_PROCEDURES"));
		}

		this._refreshItems();
	};

	ViewGallery.prototype.refresh = function(scene) {
		this.setScene(scene);
	};

	var emptyThumbnail = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE4AAAA8CAYAAADIQIzXAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDE4LTA2LTA1VDEzOjU1OjAzKzEyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOC0wNi0wNVQxNDowMDo1MCsxMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wNi0wNVQxNDowMDo1MCsxMjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyNGZiYjQ5MS1mNzFkLTRm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";

	ViewGallery.prototype._clearUI = function() {
		if (this.getAggregation("toolbar")) {
			this._currentStepTitle.setText("");
			this._separatorTitle.setText("");
			this._viewGroupSelector.close();
			this._nextItemButton.setEnabled(false);
			this._previousItemButton.setEnabled(false);
			this._stepCount.setText("");
			if (this._stepDescriptionText) {
				this._stepDescriptionText.setHtmlText("");
			}
			if (this._stepDescriptionVerticalText) {
				this._stepDescriptionVerticalText.setHtmlText("");
			}
		}
		if (this.getAggregation("container")) {
			this._hbox.destroyItems();
		}
		this._viewItems = [];

		if (this._stepDescriptionToolbar) {
			this._stepDescriptionToolbar.setVisible(false);
		}
		if (this._stepDescriptionVerticalToolbar) {
			this._stepDescriptionVerticalToolbar.setVisible(false);
		}
	};

	// Refreshes the steps
	ViewGallery.prototype._refreshItems = function() {
		this._clearUI();
		var that = this;

		if (this._modelViews) {
			var press = function(event) {
				this.setSelectedItem(event.getSource());
			}.bind(this);

			this._modelViews.forEach(function(modelView) {
				var exited = true;
				var name = modelView.name || modelView.getName && modelView.getName(); // TODO: Should be getName() regardless if we load from Matai or from Totara
				var img = new ViewGalleryThumbnail({
					alt: name,
					densityAware: false,
					tooltip: name,
					viewGallery: this,
					source: modelView.thumbnailData || emptyThumbnail,
					press: function(event) {
						img.detachBrowserEvent("mouseenter", function(event) {
							that.startAnimate();
						});
						img.setSource(modelView.thumbnailData || emptyThumbnail);
						clearInterval(event.getSource().interval);
						press(event);
					},
					layoutData: new FlexItemData({
						shrinkFactor: 0
					})
				});



				var splitAnimatedThumbnail = function(img2, tileWidth) {
					var numberOfFrames = img2.width / tileWidth;
					var imgHeight = img2.height;


					var w2 = tileWidth;
					var h2 = imgHeight;

					var canvas = document.createElement("canvas");
					var context = canvas.getContext("2d");
					var frames = [];

					canvas.width = w2;
					canvas.height = h2;

					for (var i = 0; i < numberOfFrames; i++) {
						var x = w2 * i;
						context.clearRect(0, 0, w2, h2);
						context.drawImage(img2, x, 0, w2, h2, 0, 0, w2, h2);
						frames.push(canvas.toDataURL());
					}

					that.startAnimate = function() {
						if (exited) {
							exited = false;
							img.detachBrowserEvent("mouseenter", function(event) {
								that.startAnimate();
							});
							var i = 0;
							var animate = function() {
								if (i < numberOfFrames) {
									img.setSource(frames[i]);
									i++;
								} else {
									img.setSource(frames[0]);
									i = 0;
								}
							};
							img.interval = setInterval(function() { animate(); }, 250);
						}
					};

					img.attachBrowserEvent("mouseenter", function(event) {
						that.startAnimate();
					});

					img.attachBrowserEvent("mouseout", function(event) {
						exited = true;
						img.attachBrowserEvent("mouseenter", function(event) {
							that.startAnimate();
						});
						clearInterval(img.interval);
						img.setSource(modelView.thumbnailData);
					});
				};

				if (modelView.animatedThumbnailData !== undefined) {
					var img2 = document.createElement("img");
					img2.onload = function() { splitAnimatedThumbnail(img2, modelView.tileWidth); };
					img2.src = modelView.animatedThumbnailData;
				}

				if (this.getEnableViewReordering()) {
					img.addDragDropConfig(new DragInfo({ dragStart: function() { that._draggedModelView = modelView; } }));
					img.getMetadata().dnd.draggable = true;
				}
				img.data("modelView", modelView);
				this._viewItems.push(img);
				if (this.getAggregation("container")) {
					this._hbox.addItem(img);
				}
				if (this._hbox.getItems().length === 1) {
					// Assign help id on the first thumbnail only
					img.data("help-id", "vit-view-thumbnail", true);
				}
			}.bind(this));
			this.rerender();
		}
	};

	/**
	 * Sets the selected item.
	 *
	 * @param {sap.ui.core.Item | null} item New value for the selected item.
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewGallery.prototype.setSelectedItem = function(item) {
		if (item.getCustomData().length > 0) {
			var modelView = item.getCustomData()[0].getValue();

			if (this._viewManager) {
				this._viewManager.activateView(modelView);
			}
		}
		return this;
	};

	ViewGallery.prototype.setDescription = function() {
		if (!this._selectedItem) {
			return;
		}

		if (!this.getVisible()) {
			this._stepDescription.setVisible(false);
			this._stepDescriptionToolbar.setVisible(false);
			this._stepDescriptionVertical.setVisible(false);
			this._stepDescriptionVerticalToolbar.setVisible(false);
			return;
		}

		if (this._selectedItem.getCustomData().length > 0) {
			var modelView = this._selectedItem.getCustomData()[0].getValue();

			var description = modelView.getDescription();
			if (description) {
				if (this._previousOrientationVertical === false) {
					this._stepDescription.setVisible(true);
					this._stepDescriptionToolbar.setVisible(true);
					this._stepDescriptionVerticalToolbar.setVisible(false);
				} else {
					this._stepDescriptionVertical.setVisible(true);
					this._stepDescriptionToolbar.setVisible(false);
					this._stepDescriptionVerticalToolbar.setVisible(true);
					this._previousOrientationVertical = true;
				}
			} else if (this._previousOrientationVertical === true) {
				this._stepDescriptionVertical.setVisible(false);
			} else {
				this._stepDescription.setVisible(false);
				this._previousOrientationVertical = false;
			}

			if (description != null) {
				this._stepDescriptionText.setHtmlText(description);
				this._stepDescriptionVerticalText.setHtmlText(description);
			}
		}
	};

	// This is called when view has been activated in view manager
	ViewGallery.prototype.viewActivated = function(index) {
		if (this._selectedItem) {
			// Deselect selected item in
			if (this.getSelectedViewIndex() !== index) {
				this._selectedItem.removeStyleClass("selected");
			}
		}

		this._selectedItem = this._viewItems[index];

		if (!this._selectedItem) {
			return this;
		}

		if (this.getAggregation("toolbar")) {
			var title = getResourceBundle().getText("VIEWS_TITLE_WITH_COUNT", [index + 1, this._viewItems.length]);
			this._stepCount.setText(title);

			// Adjust button states
			var notFirstView = this._selectedItem !== this._viewItems[0] && this._viewItems.length > 1;
			var notLastView = this._selectedItem !== this._viewItems[this._viewItems.length - 1] && this._viewItems.length > 1;
			var isViewAnimated = this._selectedItem.getCustomData().length > 0 && this._selectedItem.getCustomData()[0].getValue().getPlaybacks().length > 0;

			this._previousItemButton.setEnabled(notFirstView);
			this._nextItemButton.setEnabled(notLastView);
			this._playButton.setEnabled(isViewAnimated || notLastView);
		}

		// Add selection rectangle
		this._selectedItem.addStyleClass("selected");
		if (this._isScrollingNecessary(this._selectedItem.getDomRef(), this._scrollContainer.getDomRef())) {
			this._scrollContainer.scrollToElement(this._selectedItem, 500);
		}

		if (this._selectedItem.getCustomData().length > 0) {
			var modelView = this._selectedItem.getCustomData()[0].getValue();
			var playbacks = modelView.getPlaybacks();
			var slider = this.getAnimationTimeSlider();
			if (slider) {
				if (!playbacks || playbacks.length === 0) {
					slider.setEnabled(false);
					slider.setValue(0);
				} else {
					slider.setEnabled(true);
				}
			}

			var name = modelView.name || modelView.getName && modelView.getName(); // TODO: Should be getName() regardless if we load from Matai or from Totara

			if (this.getAggregation("toolbar")) {
				this._separatorTitle.setText("/");
				this._currentStepTitle.setText(name).setTooltip(name);
			}
		}

		this.setDescription();

		this.fireSelectionChange({ item: this._selectedItem });

		this._setupAnimationSlider();

		return this;
	};
	/**
	 * Gets the selected item object.
	 *
	 * @returns {sap.ui.core.Item | null} The current selected item object, or null.
	 * @private
	 */
	ViewGallery.prototype.getSelectedItem = function() {
		return this._selectedItem;
	};

	/**
	 * Retrieves the index of the selected view.
	 *
	 * @returns {int} An integer specifying the index of selected view, or -1 if nothing is selected.
	 * @public
	 */
	ViewGallery.prototype.getSelectedViewIndex = function() {
		for (var n = 0; n < this._viewItems.length; n++) {
			if (this._viewItems[n] === this.getSelectedItem()) {
				return n;
			}
		}
		return -1;
	};

	/**
	 * Selects view with given view index.
	 *
	 * @param {int} index Index of view to become selected.
	 * @public
	 */
	ViewGallery.prototype.setSelectedViewIndex = function(index) {
		if (this._viewItems.length > index) {
			this.setSelectedItem(this._viewItems[index]);
		}
	};

	/**
	 * Retrieves the index of the selected view group.
	 *
	 * @returns {int} An integer specifying the index of selected view group, or -1 if nothing is selected.
	 * @public
	 */
	ViewGallery.prototype.getSelectedViewGroupIndex = function() {
		return this._selectedGroupIndex;
	};

	/**
	 * Selects view group with given index. This will reload list of views.
	 *
	 * @param {int} index Index of view group to become selected.
	 * @param {int} viewIndex Index of view in view group to become selected
	 * @public
	 */
	ViewGallery.prototype.setSelectedViewGroupIndex = function(index, viewIndex) {
		var viewGroups = this._getViewGroups();

		if (viewGroups && viewGroups.length > index) {
			this._selectedGroupIndex = index;
			if (viewIndex == null) {
				// If view index is not specified then activate the first view
				viewIndex = 0;
			}
			this._currentGroupTitle.setText(viewGroups[index].getName()).setTooltip(viewGroups[index].getName());
			this._separatorTitle.setVisible(true);

			this._modelViews = this._getViews();
			if (!this._modelViews || this._modelViews.length === 0) {
				// Asynchronously load views for this view group
				var id = viewGroups[index].getViewGroupId();
				var sceneId = viewGroups[index].sceneId;
				var that = this;
				if (this._loader && this._loader.requestViewGroup) {
					this._loader.requestViewGroup(sceneId, id, false).then(function(views) {
						that._refreshItems();
						that.setSelectedViewIndex(viewIndex);
					}).catch(function(error) {
						Log.error(error);
					});
				} else if (this._cdsLoader) {
					this._cdsLoader.loadViewGroup(sceneId, id).then(function(views) {
						that._refreshItems();
						that.setSelectedViewIndex(viewIndex);
					});
				}
			} else {
				this._refreshItems();
				this.setSelectedViewIndex(viewIndex);
			}
		}
	};

	ViewGallery.prototype._isScrollingNecessary = function(item, scroller) {
		if (item && scroller) {
			var rect = item.getBoundingClientRect();
			return rect.left < 0 || rect.right > scroller.clientWidth;
		}
		return false;
	};

	ViewGallery.prototype._setContent = function(content) {
		if (this._bIsBeingDestroyed) { // This is workaround for situation when event is fired on already destroyed object
			return;
		}

		var sceneClassName = content && content.getMetadata && content.getMetadata().getName();
		var isSceneSupported = sceneClassName === "sap.ui.vk.threejs.Scene" || sceneClassName === "sap.ui.vk.svg.Scene";
		this.setScene(isSceneSupported ? content : null);
		if (isSceneSupported && content.builders) {
			for (var i = 0; i < content.builders.length; i++) {
				content.builders[i]._fireThumbnailLoaded = function(event) {
					var item = null;
					for (var n = 0; n < this._viewItems.length; n++) {
						if (this._viewItems[n].data("modelView") == event.modelView) {
							item = this._viewItems[n];
							break;
						}
					}
					if (item) {
						item.setSource(event.modelView.thumbnailData);
					}
				}.bind(this);
			}
		}
		this._attachAnimationTimeSlider(this.getAnimationTimeSlider());
	};

	ViewGallery.prototype.onSetContentConnector = function(contentConnector) {
		contentConnector.attachContentReplaced(this._onContentReplaced, this);
		contentConnector.attachContentChangesStarted(this._onContentChangesStarted, this);
		contentConnector.attachContentLoadingFinished(this._handleCdsViewGroupUpdate, this);
		this._setContent(contentConnector.getContent());
	};

	ViewGallery.prototype.onUnsetContentConnector = function(contentConnector) {
		this._setContent(null);
		contentConnector.detachContentChangesStarted(this._onContentChangesStarted, this);
		contentConnector.detachContentLoadingFinished(this._handleCdsViewGroupUpdate, this);
		contentConnector.detachContentReplaced(this._onContentReplaced, this);
	};

	ViewGallery.prototype._onContentChangesStarted = function(event) {
		this._detachAnimationTimeSlider(this.getAnimationTimeSlider());
		this.setScene(null);
	};

	ViewGallery.prototype._onContentReplaced = function(event) {
		this._setContent(event.getParameter("newContent"));
	};

	ViewGallery.prototype._handleCdsViewGroupUpdate = function(event) {
		var currentViewGroupId = event.getParameter("currentViewGroupId");
		if (this._modelViews && this._modelViews.length) {
			this._refreshItems();
		} else {
			this._refreshProcedures(currentViewGroupId);
		}
		this._resetCurrentView();
	};

	ViewGallery.prototype._resetCurrentView = function() {
		if (this._viewManager) {
			var currentView = this._viewManager.getActiveView();
			if (currentView && this._viewItems) {
				for (var i = 0; i < this._viewItems.length; i++) {
					var viewItem = this._viewItems[i];
					var modelView = viewItem.getCustomData()[0].getValue();
					if (modelView === currentView) {
						if (this._selectedItem !== viewItem) {
							this.viewActivated(i);
							break;
						}
					}
				}
			}

			if (this._selectedGroupIndex !== -1) {
				var viewGroups = this._getViewGroups();
				if (viewGroups && viewGroups.length) {
					this._procedureList.setSelectedKey(viewGroups[0].getViewGroupId());
				}
			}
		}
	};

	return ViewGallery;
});
