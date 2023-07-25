/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./library',
	'sap/m/library',
	'sap/viz/library',
	'sap/ui/base/ManagedObject',
	'sap/m/Button',
	'sap/m/OverflowToolbar',
	'sap/m/OverflowToolbarButton',
	'sap/m/SegmentedButton',
	'sap/m/Title',
	'sap/m/ToolbarSpacer',
	'sap/ui/Device',
	'sap/ui/core/Control',
	'sap/ui/core/CustomData',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/delegate/ScrollEnablement',
	'sap/m/ToggleButton',
	'sap/m/OverflowToolbarToggleButton',
	"sap/base/util/uid",
	"sap/base/Log",
	"./ChartContainerRenderer",
	"sap/suite/ui/commons/util/FullScreenUtil"
], function (jQuery, library, MobileLibrary, VizLibrary, ManagedObject, Button, OverflowToolbar, OverflowToolbarButton,
			 SegmentedButton, Title, ToolbarSpacer, Device, Control, CustomData, ResizeHandler, ScrollEnablement, ToggleButton, OverflowToolbarToggleButton, uid, Log, ChartContainerRenderer, FullScreenUtil) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = MobileLibrary.ButtonType;

	/**
	 * Constructor for a new ChartContainer.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides a toolbar with generic functions for tables and charts based on the VizFrame control like zoom, display in fullscreen mode, toggle the legend, switch between chart types, and changes of the chart dimension. The controls of the content aggregation are positioned below the toolbar. Additional functions can be added to the toolbar with the customIcons aggregation.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.ChartContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ChartContainer = Control.extend("sap.suite.ui.commons.ChartContainer", /** @lends sap.suite.ui.commons.ChartContainer.prototype */ {
		metadata: {

			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Set to true to display the personalization icon. Set to false to hide it.
				 */
				showPersonalization: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Set to true to display the full screen icon. Set to false to hide it.
				 */
				showFullScreen: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Display the chart and the toolbar in full screen or normal mode.
				 */
				fullScreen: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Set to true to display the charts' legends. Set to false to hide them. See also showLegendButton.
				 */
				showLegend: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * String shown if there are no dimensions to display.
				 */
				title: {type: "string", group: "Misc", defaultValue: ''},

				/**
				 * Custom Label for Selectors Group.
				 * @deprecated Since version 1.32.0.
				 * Obsolete property as sap.m.Toolbar is replaced by sap.m.OverflowToolbar.
				 */
				selectorGroupLabel: {type: "string", group: "Misc", defaultValue: null, deprecated: true},

				/**
				 * Determine whether to stretch the chart height to the maximum possible height of ChartContainer's parent container. As a prerequisite, the parent container needs to have a fixed value height or be able to determine height from its parent.
				 */
				autoAdjustHeight: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Set to true to display zoom icons. Set to false to hide them.
				 */
				showZoom: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * Set to true or false to display or hide a button for controlling the visbility of the chart's legend. Please be aware that setting this property to true indirectly is setting showLegend to false. If you need to hide the button but to show the legend, you need to set showLegend at a later point in time (onBeforeRendering). The execution order of the combined properties is not guaranteed by the control.
				 */
				showLegendButton: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * Set to true to display the 'Details' button that opens a popup dialog with details about the selected data from the VizFrame based chart.
				 * @since 1.48.0
				 */
				showSelectionDetails: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Set to true to wrap text labels in the dialog that opens when the user clicks or taps the 'Details' button.
				 * @since 1.58.0
				 */
				wrapLabels: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * If set to <code>true</code>, the Container control has its own scroll bar, with the scrolling taking place within the Container control itself.
				 */
				enableScroll: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * Defines the width of the Container.
				 */
				width: {type: "sap.ui.core.CSSSize", defaultValue: "100%"}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Dimension Selects.
				 */
				dimensionSelectors: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "dimensionSelector"
				},

				/**
				 * ChartToolBar Content aggregation. Only sap.viz.ui5.controls.VizFrame, sap.m.Table and sap.ui.table.Table can be embedded.
				 * If not specified explicitly, the rendering order of the charts is determined by the sequence of contents provided by the application via this aggregation. This means, per default the first chart of the aggregation will be rendered within the container.
				 */
				content: {
					type: "sap.suite.ui.commons.ChartContainerContent",
					multiple: true,
					singularName: "content"
				},

				/**
				 * Overflow ToolBar. If an external toolbar is used, it will be integrated with the embedded toolbar via a placeholder.
				 * This placeholder is mandatory, and it needs to be of type 'sap.suite.ui.commons.ChartContainerToolbarPlaceholder'.
				 */
				toolbar: {type: "sap.m.OverflowToolbar", multiple: false},

				/**
				 * This aggregation contains the custom icons that should be displayed additionally on the toolbar.
				 * It is not guaranteed that the same instance of the sap.ui.core.Icon control will be used within the toolbar,
				 * but the toolbar will contain a sap.m.OverflowToolbarButton with an icon property equal to the src property
				 * of the sap.ui.core.Icon provided in the aggregation.
				 * If a press event is triggered by the icon displayed on the toolbar, then the press handler of
				 * the original sap.ui.core.Icon control is used. The instance of the control, that has triggered the press event,
				 * can be accessed using the "controlReference" parameter of the event object.
				 */
				customIcons: {type: "sap.ui.core.Icon", multiple: true, singularName: "customIcon"}
			},
			events: {

				/**
				 * Event fired when a user clicks on the personalization icon.
				 */
				personalizationPress: {},

				/**
				 * Event fired when a user changes the displayed content.
				 */
				contentChange: {
					parameters: {

						/**
						 * Id of the selected item.
						 */
						selectedItemId: {type: "string"}
					}
				},

				/**
				 * Custom event for zoom in.
				 */
				customZoomInPress: {},

				/**
				 * Custom event for zoom out.
				 */
				customZoomOutPress: {}
			}
		}
	});

	/* ============================================================ */
	/* Life-cycle Handling                                          */
	/* ============================================================ */

	ChartContainer.prototype.init = function () {
		//private properties
		this._aUsedContentIcons = [];
		this._aCustomIcons = [];
		this._oToolBar = null;
		this._aDimensionSelectors = [];
		this._bChartContentHasChanged = false;
		this._bControlNotRendered = true;
		this._bSegmentedButtonSaveSelectState = false;
		this._mOriginalVizFrameHeights = {};
		this._oActiveChartButton = null;
		this._oSelectedContent = null;
		this._sResizeListenerId = null;
		this._bHasApplicationToolbar = false;
		this._iPlaceholderPosition = 0; // Index of the placeholder inside application toolbar

		//Resource bundle
		this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

		//Right side..

		//Full screen button
		this._oFullScreenButton = new OverflowToolbarToggleButton({
			icon: "sap-icon://full-screen",
			type: ButtonType.Transparent,
			text: this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN"),
			tooltip: this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN"),
			press: this._onFullScreenButtonPress.bind(this)
		});


		//legend button
		this._oShowLegendButton = new ToggleButton({
			icon: "sap-icon://legend",
			type: ButtonType.Transparent,
			// text: this._oResBundle.getText("CHARTCONTAINER_LEGEND"),
			tooltip: this._oResBundle.getText("CHARTCONTAINER_LEGEND"),
			press: this._onShowLegendButtonPress.bind(this)
		});

		//personalization button
		this._oPersonalizationButton = new OverflowToolbarButton({
			icon: "sap-icon://action-settings",
			type: ButtonType.Transparent,
			text: this._oResBundle.getText("CHARTCONTAINER_PERSONALIZE"),
			tooltip: this._oResBundle.getText("CHARTCONTAINER_PERSONALIZE"),
			press: this._onPersonalizationButtonPress.bind(this)
		});

		//zoom in button
		this._oZoomInButton = new OverflowToolbarButton({
			icon: "sap-icon://zoom-in",
			type: ButtonType.Transparent,
			text: this._oResBundle.getText("CHARTCONTAINER_ZOOMIN"),
			tooltip: this._oResBundle.getText("CHARTCONTAINER_ZOOMIN"),
			press: this._zoom.bind(this, true)
		});

		//zoom out button
		this._oZoomOutButton = new OverflowToolbarButton({
			icon: "sap-icon://zoom-out",
			type: ButtonType.Transparent,
			text: this._oResBundle.getText("CHARTCONTAINER_ZOOMOUT"),
			tooltip: this._oResBundle.getText("CHARTCONTAINER_ZOOMOUT"),
			press: this._zoom.bind(this, false)
		});

		//segmentedButton for chart and table
		this._oChartSegmentedButton = new SegmentedButton({
			select: this._onChartSegmentButtonSelect.bind(this),

			// This is needed, because otherwise the SegmentedButton would sometimes stretch to the whole parent width causing overflow in the OverflowToolbar
			width: "auto"
		});

		//Left side...
		//display title if no dimension selectors
		this._oChartTitle = new Title();
	};

	ChartContainer.prototype.onAfterRendering = function () {
		this._sResizeListenerId = ResizeHandler.register(this, this._performHeightChanges.bind(this));
		if (!Device.system.desktop) {
			Device.resize.attachHandler(this._performHeightChanges, this);
		}

		if (this.getAutoAdjustHeight() || this.getFullScreen()) {
			//fix the flickering issue when switch chart in full screen mode
			setTimeout(function () {
				var fnMethod = this._performHeightChanges.bind(this);
				if (typeof fnMethod === "string" || fnMethod instanceof String) {
					fnMethod = this[fnMethod];
				}
				fnMethod.apply(this, []);
			}.bind(this), 500);
		}
		var oSelectedContent = this.getSelectedContent(),
			bVizFrameSelected = false,
			oInnerContent;
		if (oSelectedContent) {
			oInnerContent = oSelectedContent.getContent();
			bVizFrameSelected = oInnerContent && oInnerContent.getMetadata().getName() === "sap.viz.ui5.controls.VizFrame";
		}

		if (this.getEnableScroll()) {
			this._oScrollEnablement = new ScrollEnablement(this, this.getId() + "-wrapper", {
				horizontal: !bVizFrameSelected,
				vertical: !bVizFrameSelected
			});
		}
		this._bControlNotRendered = false;

		if (this.getTitle() && (this.getToolbar().getContent().length === 2
								&& this.getToolbar().getContent()[0] instanceof sap.m.Title)) {
			this.getToolbar().setActive(true);
		}
	};

	ChartContainer.prototype.onBeforeRendering = function () {
		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
		if (!Device.system.desktop) {
			Device.resize.detachHandler(this._performHeightChanges, this);
		}

		if (this._bChartContentHasChanged || this._bControlNotRendered) {
			this._chartChange();
		}

		var aCustomIconsToBeDeleted = this._aCustomIcons; // Buttons in array have to be destroyed later on
		this._aCustomIcons = []; // Array has to be deleted to be synched with aggregation "customIcons"
		var aCustomIcons = this.getAggregation("customIcons");
		if (aCustomIcons && aCustomIcons.length > 0) {
			for (var i = 0; i < aCustomIcons.length; i++) {
				this._addButtonToCustomIcons(aCustomIcons[i]);
			}
		}

		//integrate toolbar inside the chart
		if (this._bControlNotRendered) {
			if (!this.getToolbar()) {
				//overflow embedded toolbar
				this.setAggregation("toolbar", new OverflowToolbar({
					design: "Transparent"}));
			}
		}
		this._adjustDisplay();
		this._destroyButtons(aCustomIconsToBeDeleted); // Destroy buttons from custom icons array

		// make sure we have only one event attached for each content field
		var oSelectedContent = this.getSelectedContent();
		if (oSelectedContent) {
			var oContent = oSelectedContent.getContent();
			if (oContent && oContent.attachRenderComplete) {
				oContent.detachRenderComplete(this._checkZoomIcons, this);
				oContent.attachRenderComplete(this._checkZoomIcons, this);
			}
		}
		this._oShowLegendButton.setPressed(this.getShowLegend());
	};

	ChartContainer.prototype.exit = function () {
		if (this._oFullScreenButton) {
			this._oFullScreenButton.destroy();
			this._oFullScreenButton = undefined;
		}
		if (this._oFullScreenUtil) {
			this._oFullScreenUtil.cleanUpFullScreen(this);
		}
		if (this._oShowLegendButton) {
			this._oShowLegendButton.destroy();
			this._oShowLegendButton = undefined;
		}
		if (this._oPersonalizationButton) {
			this._oPersonalizationButton.destroy();
			this._oPersonalizationButton = undefined;
		}
		if (this._oActiveChartButton) {
			this._oActiveChartButton.destroy();
			this._oActiveChartButton = undefined;
		}
		if (this._oChartSegmentedButton) {
			this._oChartSegmentedButton.destroy();
			this._oChartSegmentedButton = undefined;
		}
		if (this._oSelectedContent) {
			this._oSelectedContent.destroy();
			this._oSelectedContent = undefined;
		}
		if (this._oToolBar) {
			this._oToolBar.destroy();
			this._oToolBar = undefined;
		}
		if (this._oToolbarSpacer) {
			this._oToolbarSpacer.destroy();
			this._oToolbarSpacer = undefined;
		}

		if (this._aDimensionSelectors) {
			for (var i = 0; i < this._aDimensionSelectors.length; i++) {
				if (this._aDimensionSelectors[i]) {
					this._aDimensionSelectors[i].destroy();
				}
			}
			this._aDimensionSelectors = undefined;
		}
		if (this._oScrollEnablement) {
			this._oScrollEnablement.destroy();
			this._oScrollEnablement = undefined;
		}
		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
		if (!Device.system.desktop) {
			Device.resize.detachHandler(this._performHeightChanges, this);
		}
		if (this._oZoomInButton) {
			this._oZoomInButton.destroy();
			this._oZoomInButton = undefined;
		}
		if (this._oZoomOutButton) {
			this._oZoomOutButton.destroy();
			this._oZoomOutButton = undefined;
		}
	};

	/* =========================================================== */
	/* Event Handling                                              */
	/* =========================================================== */

	/**
	 * Button icon press event handler.
	 *
	 * @param {sap.ui.base.Event} oEvent Event object
	 * @private
	 */
	ChartContainer.prototype._onButtonIconPress = function (oEvent) {
		var sChartId = oEvent.getSource().getCustomData()[0].getValue();
		this._switchChart(sChartId);
	};

	/**
	 * Full screen button press event handler.
	 *
	 * @param {sap.ui.base.Event} oEvent Event object
	 * @private
	 */
	ChartContainer.prototype._onFullScreenButtonPress = function (oEvent) {
		if (oEvent.getParameter("pressed") === true) {
			this._oFullScreenButton.setTooltip(this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN_CLOSE"));
			this._oFullScreenButton.setText(this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN_CLOSE"));
			this._oFullScreenButton.setIcon("sap-icon://exit-full-screen");
		} else {
			this._oFullScreenButton.setTooltip(this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN"));
			this._oFullScreenButton.setText(this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN"));
			this._oFullScreenButton.setIcon("sap-icon://full-screen");
		}
		this._bSegmentedButtonSaveSelectState = true;
		this._toggleFullScreen();
		this._oFullScreenButton.focus();
	};

	/**
	 * Show legend button press event handler.
	 *
	 * @param {sap.ui.base.Event} oEvent Event object
	 * @private
	 */
	ChartContainer.prototype._onShowLegendButtonPress = function (oEvent) {
		this._bSegmentedButtonSaveSelectState = true;
		this._onLegendButtonPress();
	};

	/**
	 * Chart segment button select event handler.
	 *
	 * @param {sap.ui.base.Event} oEvent Event object
	 * @private
	 */
	ChartContainer.prototype._onChartSegmentButtonSelect = function (oEvent) {
		var sChartId = oEvent.getParameter("button").getCustomData()[0].getValue();
		this._bSegmentedButtonSaveSelectState = true;
		this._switchChart(sChartId);
	};

	/**
	 * Overflow Toolbar button press event handler.
	 *
	 * @param {sap.ui.base.Event} oEvent Event object
	 * @param {Object} data Press event data
	 * @private
	 */
	ChartContainer.prototype._onOverflowToolbarButtonPress = function (oEvent, data) {
		data.icon.firePress({
			controlReference: oEvent.getSource()
		});
	};

	/**
	 * Legend button press event handler.
	 *
	 * @private
	 */
	ChartContainer.prototype._onLegendButtonPress = function () {
		var oSelectedContent = this.getSelectedContent();
		if (oSelectedContent) {
			var selectedChart = oSelectedContent.getContent();
			//only support if content has legendVisible property
			if (jQuery.isFunction(selectedChart.getLegendVisible)) {
				var legendOn = selectedChart.getLegendVisible();
				selectedChart.setLegendVisible(!legendOn);
				this.setShowLegend(!legendOn);
			} else {
				this.setShowLegend(!this.getShowLegend());
			}
		} else {
			this.setShowLegend(!this.getShowLegend());
		}
	};

	/**
	 * Get zoom state from graph (if there is any) and  enable/disable zoom icons based on the results
	 *
	 * @private
	 */
	ChartContainer.prototype._checkZoomIcons = function (oEvent) {
		if (oEvent.getSource()._getZoomInfo) {
			var oZoomInfo = oEvent.getSource()._getZoomInfo();

			if (oZoomInfo) {
				this._manageZoomIcons(oZoomInfo.currentZoomLevel);
			}
		}
	};


	/**
	 * Personalization button press event handler.
	 *
	 * @private
	 */
	ChartContainer.prototype._onPersonalizationButtonPress = function () {
		this.firePersonalizationPress();
	};

	/* =========================================================== */
	/* Getter/Setter private methods                               */
	/* =========================================================== */

	/**
	 * Setter for private property oSelectedContent.
	 *
	 * @private
	 * @param {sap.ui.core.Control} selectedContent The object to be set as currently viewed
	 * @returns {sap.suite.ui.commons.ChartContainer} Reference to this in order to allow method chaining
	 */
	ChartContainer.prototype._setSelectedContent = function (selectedContent) {
		var bChartIsVizFrame; //chart is instance of sap.viz.ui5.controls.VizFrame
		if (this.getSelectedContent() === selectedContent) {
			return this;
		}
		if (selectedContent === null) {
			this._oShowLegendButton.setVisible(false);
			return this;
		}
		//show/hide the showLegend buttons
		var oChart = selectedContent.getContent();
		this._toggleShowLegendButtons(oChart);

		bChartIsVizFrame = oChart && oChart.getMetadata && oChart.getMetadata().getName() === "sap.viz.ui5.controls.VizFrame";
		var bShowChart = bChartIsVizFrame || jQuery.isFunction(oChart.setLegendVisible); //hide legend icon if table, show if chart
		if (this.getShowLegendButton()) {
			this._oShowLegendButton.setVisible(bShowChart);
		}

		var bShowZoom = this.getShowZoom() && Device.system.desktop && bChartIsVizFrame;
		this._oZoomInButton.setVisible(bShowZoom);
		this._oZoomOutButton.setVisible(bShowZoom);
		this._oSelectedContent = selectedContent;
		return this;
	};

	/**
	 * Executes necessary updates relevant to the SelectionDetails including visibility and event registration.
	 *
	 * @private
	 * @returns {sap.m.SelectionDetailsFacade} The SelectionDetailsFacade of the currently selected content
	 */
	ChartContainer.prototype._getSelectionDetails = function () {
		var oContent = this.getSelectedContent();
		return oContent && oContent._getSelectionDetails();
	};

	/**
	 * Toggles the showLegend buttons.
	 *
	 * @private
	 * @param {sap.ui.core.Control} chart Selected content
	 */
	ChartContainer.prototype._toggleShowLegendButtons = function (chart) {
		var sChartId = chart.getId();
		var oRelatedButton = null;
		for (var i = 0; !oRelatedButton && i < this._aUsedContentIcons.length; i++) {
			if (this._aUsedContentIcons[i].getCustomData()[0].getValue() === sChartId && chart.getVisible() === true) {
				oRelatedButton = this._aUsedContentIcons[i];
				this._oChartSegmentedButton.setSelectedButton(oRelatedButton);
				break;
			}
		}
	};

	/**
	 * Setter for the selected button of the chart segmented button.
	 *
	 * The first button inside the segmented button is only set as default if the
	 * user did not click explicitly on another button inside the segmented button.
	 *
	 * @private
	 */
	ChartContainer.prototype._setDefaultOnSegmentedButton = function () {
		if (!this._bSegmentedButtonSaveSelectState) {
			this._oChartSegmentedButton.setSelectedButton(null);
		}
		this._bSegmentedButtonSaveSelectState = false;
	};

	/* =========================================================== */
	/* Helper methods                                              */
	/* =========================================================== */

	/**
	 * Toggles between normal and full screen modes.
	 *
	 * @private
	 */
	ChartContainer.prototype._toggleFullScreen = function () {
		var bFullScreen = this.getProperty("fullScreen");

		var fnSetFullScreenButton = function (sIcon, sText, pressed) {
			this._oFullScreenButton.setIcon(sIcon);
			this._oFullScreenButton.setText(sText);
			this._oFullScreenButton.setTooltip(sText);
			this._oFullScreenButton.setPressed(pressed);
		}.bind(this);

		var oContent;
		var aContent = this.getAggregation("content");
		if (bFullScreen) {
			this.setProperty("fullScreen", false, true);
			fnSetFullScreenButton("sap-icon://full-screen", this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN"), false);
			for (var i = 0; i < aContent.length; i++) {
				oContent = aContent[i].getContent();
				oContent.setWidth("100%");
				if (typeof oContent.getHeight !== 'undefined') {
					oContent.setHeight(this._sChartOriginalHeight);
				}
			}
			this.invalidate();
		} else {
			this.setProperty("fullScreen", true, true);
			fnSetFullScreenButton("sap-icon://exit-full-screen", this._oResBundle.getText("CHARTCONTAINER_FULLSCREEN_CLOSE"), true);
			for (var i = 0; i < aContent.length; i++) {
				oContent = aContent[i].getContent();
				oContent.setWidth("100%");
				if (typeof oContent.getHeight !== 'undefined') {
					this._sChartOriginalHeight = oContent.getHeight();
				}
			}
		}

		bFullScreen = !bFullScreen;
		if (!this._oFullScreenUtil) {
			this._oFullScreenUtil = FullScreenUtil;
		}

		this._oFullScreenUtil.toggleFullScreen(this, bFullScreen, this._oFullScreenButton, this._toggleFullScreen);
	};


	/**
	 * Performs height changes needed when toggling between full screen and normal modes.
	 *
	 * If mobile mode is used, swaps between portrait and landscape trigger height changes too.
	 *
	 * @private
	 */
	ChartContainer.prototype._performHeightChanges = function () {
		var $Toolbar,
			$VizFrame;

		if (this.getAutoAdjustHeight() || this.getFullScreen()) {
			var $this = this.$(),
				oSelectedContent,
				oInnerChart,
				sInnerChartClass;

			$Toolbar = $this.find(".sapSuiteUiCommonsChartContainerToolBarArea :first");
			//Only adjust height after both toolbar and chart are rendered in the DOM.
			$VizFrame = $this.find(".sapSuiteUiCommonsChartContainerChartArea :first");
			oSelectedContent = this.getSelectedContent();
			if ($Toolbar[0] && $VizFrame[0] && oSelectedContent) {
				var iChartContainerHeight = $this.height();
				var iToolBarHeight = $Toolbar.height();
				var iToolbarBottomBorder = Math.round(parseFloat($Toolbar.css("borderBottomWidth")));
				var iNewChartHeight = iChartContainerHeight - iToolBarHeight - iToolbarBottomBorder;
				var iExistingChartHeight = $VizFrame.height();
				oInnerChart = oSelectedContent.getContent();
				if (oInnerChart) {
					sInnerChartClass = oInnerChart.getMetadata().getName();
					if (sInnerChartClass === "sap.viz.ui5.controls.VizFrame" || sInnerChartClass === "sap.chart.Chart") {
						if (iNewChartHeight > 0 && iNewChartHeight !== iExistingChartHeight) {
							this._rememberOriginalHeight(oInnerChart);
							oInnerChart.setHeight(iNewChartHeight + "px");
						}
					} else if (this.$("chartArea").innerWidth() && oInnerChart.$().innerWidth() !== this.$("chartArea").innerWidth()) {
						//For table/non-vizFrame case, if width changes on the re-size event, force a re-render to have it fit in 100% width.
						this.rerender();
					}
				}
			}
		}
	};

	/**
	 * Updates the mOriginalVizFrameHeights property to reflect the height of the specified chart.
	 *
	 * In the full screen mode it is necessary to remember the original height of the current chart.
	 * This allows restoring it later on in non-full screen mode.
	 *
	 * @private
	 * @param {sap.chart.Chart|sap.viz.ui5.controls.VizFrame} chart Current chart or vizframe
	 */
	ChartContainer.prototype._rememberOriginalHeight = function (chart) {
		var sHeight;
		if (jQuery.isFunction(chart.getHeight)) {
			sHeight = chart.getHeight();
		} else {
			sHeight = 0;
		}
		this._mOriginalVizFrameHeights[chart.getId()] = sHeight;
	};

	/**
	 * Switches the currently selected chart.
	 *
	 * @private
	 * @param {String} chartId The ID of the chart to be searched
	 */
	ChartContainer.prototype._switchChart = function (chartId) {
		var oChart = this._findChartById(chartId);

		this._setSelectedContent(oChart);

		this.fireContentChange({
			selectedItemId: chartId
		}); //Fires the change event with the ID of the newly selected item.
		this.rerender();
	};

	/**
	 * Collects all charts.
	 *
	 * @private
	 */
	ChartContainer.prototype._chartChange = function () {
		var aCharts = this.getContent();
		this._destroyButtons(this._aUsedContentIcons);
		this._aUsedContentIcons = [];
		if (this.getContent().length === 0) {
			this._oChartSegmentedButton.removeAllButtons();
			this._setDefaultOnSegmentedButton();
			this.switchChart(null);
		}
		if (aCharts) {
			var bShowLegend = this.getShowLegend();
			var oInnerChart;
			var oButtonIcon;
			for (var i = 0; i < aCharts.length; i++) {
				// In case the content is not visible, skip this content.
				if (!aCharts[i].getVisible()) {
					continue;
				}
				oInnerChart = aCharts[i].getContent();
				if (jQuery.isFunction(oInnerChart.setVizProperties)) {
					oInnerChart.setVizProperties({
						legend: {
							visible: bShowLegend
						},
						sizeLegend: {
							visible: bShowLegend
						}
					});
				}
				if (jQuery.isFunction(oInnerChart.setWidth)) {
					oInnerChart.setWidth("100%");
				}
				if (jQuery.isFunction(oInnerChart.setHeight) && this._mOriginalVizFrameHeights[oInnerChart.getId()]) {
					oInnerChart.setHeight(this._mOriginalVizFrameHeights[oInnerChart.getId()]);
				}
				oButtonIcon = new Button({
					icon: aCharts[i].getIcon(),
					type: ButtonType.Transparent,
					tooltip: aCharts[i].getTitle(),
					customData: [new CustomData({
						key: 'chartId',
						value: oInnerChart.getId()
					})],
					press: this._onButtonIconPress.bind(this)
				});
				this._aUsedContentIcons.push(oButtonIcon);

				if (i === 0) {
					this._setSelectedContent(aCharts[i]);
					this._oActiveChartButton = oButtonIcon;
				}
			}
		}
		this._bChartContentHasChanged = false;
	};

	/**
	 * Get the chart inside the content aggregation by id.
	 *
	 * @private
	 * @param {String} id The ID of the content control being searched for
	 * @returns {sap.ui.core.Control|null} The object found or null
	 */
	ChartContainer.prototype._findChartById = function (id) {
		var aObjects = this.getAggregation("content");
		if (aObjects) {
			for (var i = 0; i < aObjects.length; i++) {
				if (aObjects[i].getContent().getId() === id) {
					return aObjects[i];
				}
			}
		}
		return null;
	};

	/**
	 * Gets the exact position of the placeholder inside the toolbar
	 *
	 * @private
	 * @param {sap.m.OverflowToolbar} toolbar Toolbar where to find the placeholder
	 * @return {Number} The position of the placeholder or -1 if there is no placeholder
	 */
	ChartContainer.prototype._getToolbarPlaceHolderPosition = function (toolbar) {
		var oContent;
		for (var i = 0; i < toolbar.getContent().length; i++) {
			oContent = toolbar.getContent()[i];
			if (oContent.getMetadata && oContent.getMetadata().getName() === "sap.suite.ui.commons.ChartContainerToolbarPlaceholder") {
				return i;
			}
		}

		return -1;
	};

	/**
	 * Adds content to the toolbar at the provided position
	 *
	 * @private
	 * @param {Object} content The content to be added
	 * @param {Number} position The position where the content should be added
	 */
	ChartContainer.prototype._addContentToolbar = function (content, position) {
		if (!this._bHasApplicationToolbar) {
			if (!position) {
				this._oToolBar.addContent(content);
			} else {
				this._oToolBar.insertContent(content, position);
			}
		} else {
			// when an external toolbar is available, no embedded spacer is needed
			// all embedded standard buttons are arranged after the embedded spacer
			if (content instanceof ToolbarSpacer) {
				this._iPlaceholderPosition = this._getToolbarPlaceHolderPosition(this._oToolBar);
				return;
			}
			if (position) {
				this._iPlaceholderPosition = this._iPlaceholderPosition + position;
			}
			this._oToolBar.insertContent(content, this._iPlaceholderPosition);
			this._iPlaceholderPosition = this._iPlaceholderPosition + 1;
		}
	};

	/**
	 * Re-arranges the content inside the toolbar
	 *
	 * @private
	 */
	ChartContainer.prototype._rearrangeToolbar = function () {
		var iToolbarLength = this._aToolbarContent.length;
		for (var i = 0; i < iToolbarLength; i++) {
			this._oToolBar.insertContent(this._aToolbarContent[i], i);
		}
	};

	/**
	 * Adjusts customizable icons of overflow toolbar, displays chart buttons.
	 *
	 * @private
	 */
	ChartContainer.prototype._adjustIconsDisplay = function () {
		if (this.getShowSelectionDetails()) {
			this._addContentToolbar(this._getSelectionDetails());
		}
		if (this.getShowLegendButton()) {
			this._addContentToolbar(this._oShowLegendButton);
		}
		if (this.getShowZoom() && Device.system.desktop) {
			this._addContentToolbar(this._oZoomInButton);
			this._addContentToolbar(this._oZoomOutButton);
		}
		if (this.getShowPersonalization()) {
			this._addContentToolbar(this._oPersonalizationButton);
		}
		if (this.getShowFullScreen()) {
			this._addContentToolbar(this._oFullScreenButton);
		}

		var i = 0;
		for (i; i < this._aCustomIcons.length; i++) {
			this._addContentToolbar(this._aCustomIcons[i]);
		}
		if (!this._bControlNotRendered) {
			this._oChartSegmentedButton.removeAllButtons();
		}

		// ChartContainer with one chart does not have a segment container
		var iIconsCount = this._aUsedContentIcons.length;
		if (iIconsCount > 1) {
			for (i = 0; i < iIconsCount; i++) {
				this._oChartSegmentedButton.addButton(this._aUsedContentIcons[i]);
			}
			this._addContentToolbar(this._oChartSegmentedButton);
		}
	};

	/**
	 * Adjusts dimension selector displays.
	 *
	 * @private
	 */
	ChartContainer.prototype._adjustSelectorDisplay = function () {
		if (this._aDimensionSelectors.length === 0) {
			this._oChartTitle.setVisible(true);
			this._addContentToolbar(this._oChartTitle);
			return;
		}

		for (var i = 0; i < this._aDimensionSelectors.length; i++) {
			if (jQuery.isFunction(this._aDimensionSelectors[i].setAutoAdjustWidth)) {
				this._aDimensionSelectors[i].setAutoAdjustWidth(true);
			}
			this._addContentToolbar(this._aDimensionSelectors[i]);
		}
	};

	/**
	 * Re-creates the toolbar.
	 *
	 * @private
	 */
	ChartContainer.prototype._adjustDisplay = function () {
		this._oToolBar = this.getToolbar();
		if (this._oToolbarSpacer) {
			this._oToolBar.removeContent(this._oToolbarSpacer);
			this._oToolbarSpacer.destroy();
		}
		this._oToolBar.removeAllContent();
		this._oToolBar.setProperty("height", "3rem", true);
		if (this._bHasApplicationToolbar) {
			// rearranges the application toolbar
			this._rearrangeToolbar();
			this._iPlaceholderPosition = 0;
		}
		this._adjustSelectorDisplay();
		this._oToolbarSpacer = new ToolbarSpacer();
		this._addContentToolbar(this._oToolbarSpacer);
		this._adjustIconsDisplay();
	};

	/**
	 * Adds a new button to Custom Icons array.
	 *
	 * @param {sap.ui.core.Icon} icon to be added to toolbar
	 * @private
	 */
	ChartContainer.prototype._addButtonToCustomIcons = function (icon) {
		var oIcon = icon;
		var sIconTooltip = oIcon.getTooltip();
		var oButton = new OverflowToolbarButton({
			icon: oIcon.getSrc(),
			text: sIconTooltip,
			tooltip: sIconTooltip,
			type: ButtonType.Transparent,
			visible: oIcon.getVisible(),
			press: [{icon: oIcon}, this._onOverflowToolbarButtonPress.bind(this)]
		});
		this._aCustomIcons.push(oButton);
	};

	/**
	 * Zooms in or out of ChartContainer content.
	 *
	 * @param {boolean} zoomIn Flag showing if zoom in or out should be performed
	 * @private
	 */
	ChartContainer.prototype._zoom = function (zoomIn) {
		var oChart = this.getSelectedContent().getContent();
		if (oChart.getMetadata().getName() === "sap.viz.ui5.controls.VizFrame") {
			if (zoomIn) {
				oChart.zoom({"direction": "in"});
			} else {
				oChart.zoom({"direction": "out"});
			}
		}
		if (zoomIn) {
			this.fireCustomZoomInPress();
		} else {
			this.fireCustomZoomOutPress();
		}

		/*Toggle of ZoomIn and ZoomOut Button on reaching Threshold value*/
		this._manageZoomIcons(oChart._getZoomInfo().currentZoomLevel);
	};

	ChartContainer.prototype._manageZoomIcons = function (iZoomInfo) {
		// No zoom level available
		if (iZoomInfo === undefined) {
			return;
			// All data points plotted and max width of 96px reached
			// due to information from sap.chart.Chart team
		} else if (iZoomInfo === null) {
			this._oZoomOutButton.setEnabled(false);
			this._oZoomInButton.setEnabled(false);
			//Zoomed out all the way
		} else if (iZoomInfo === 0) {
			this._oZoomOutButton.setEnabled(false);
			this._oZoomInButton.setEnabled(true);
			//Zoomed in all the way
		} else if (iZoomInfo === 1) {
			this._oZoomInButton.setEnabled(false);
			this._oZoomOutButton.setEnabled(true);
		} else {
			//If button was disabled due to the above, enable it
			if (this._oZoomOutButton.getEnabled() == false) {
				this._oZoomOutButton.setEnabled(true);
			}
			if (this._oZoomInButton.getEnabled() == false) {
				this._oZoomInButton.setEnabled(true);
			}
		}
	};

	/**
	 * Destroys all the buttons that are passed.
	 *
	 * @param {sap.ui.core.Control[]} buttons The buttons which need to be destroyed
	 * @private
	 */
	ChartContainer.prototype._destroyButtons = function (buttons) {
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].destroy();
		}
	};

	/**
	 * Updates legendVisible property for all inner charts in the content.
	 *
	 * @param {Boolean} showLegend Flag showing if legend should be shown
	 * @private
	 */
	ChartContainer.prototype._setShowLegendForAllCharts = function (showLegend) {
		var aContents = this.getContent();
		var oInnerChart;
		for (var i = 0; i < aContents.length; i++) {
			oInnerChart = aContents[i].getContent();
			if (jQuery.isFunction(oInnerChart.setLegendVisible)) {
				oInnerChart.setLegendVisible(showLegend);
			} else {
				Log.info("ChartContainer: chart with id " + oInnerChart.getId() + " is missing the setVizProperties property");
			}
		}
	};

	/* =========================================================== */
	/* Public property getters/setters                             */
	/* =========================================================== */

	ChartContainer.prototype.setFullScreen = function (fullscreen) {
		if (this._bControlNotRendered) {
			//Can't set the full screen and toggle when the DOM is not loaded yet.
			return this;
		}
		if (this.getFullScreen() === fullscreen) {
			return this;
		}
		if (this.getProperty("fullScreen") !== fullscreen) {
			this._toggleFullScreen();
		}
		return this;
	};

	ChartContainer.prototype.setTitle = function (title) {
		if (this.getTitle() === title) {
			return this;
		}
		this._oChartTitle.setText(title);
		this.setProperty("title", title, true);
		return this;
	};

	ChartContainer.prototype.setShowLegendButton = function (showLegendButton) {
		if (this.getShowLegendButton() === showLegendButton) {
			return this;
		}
		this.setProperty("showLegendButton", showLegendButton, true);
		if (!this.getShowLegendButton()) {
			this.setShowLegend(false);
		}
		return this;
	};

	/**
	 * Getter for property selectorGroupLabel. Custom Label for Selectors Group.
	 *
	 * Default value is empty/undefined
	 *
	 * @deprecated
	 * @param {String} selectorGroupLabel The new value for property selectorGroupLabel
	 * @returns {sap.suite.ui.commons.ChartContainer} this to allow method chaining
	 */
	ChartContainer.prototype.setSelectorGroupLabel = function (selectorGroupLabel) {
		if (this.getSelectorGroupLabel() === selectorGroupLabel) {
			return this;
		}
		this.setProperty("selectorGroupLabel", selectorGroupLabel, true);
		return this;
	};

	ChartContainer.prototype.setShowLegend = function (showLegend) {
		if (this.getShowLegend() === showLegend) {
			return this;
		}
		this.setProperty("showLegend", showLegend, true);

		//Propagate to all charts.
		this._setShowLegendForAllCharts(showLegend);

		return this;
	};

	ChartContainer.prototype.setWrapLabels = function (bIsWrapped) {
		var oSelectionDetails;

		if (this.getWrapLabels() !== bIsWrapped) {
			this.setProperty("wrapLabels", bIsWrapped);

			oSelectionDetails = this._getSelectionDetails();
			if (oSelectionDetails) {
				oSelectionDetails.setWrapLabels(bIsWrapped);
			}
		}
		return this;
	};

	/* =========================================================== */
	/* Public aggregation getters/setters                          */
	/* =========================================================== */
	ChartContainer.prototype.setToolbar = function (toolbar) {
		if (!toolbar || this._getToolbarPlaceHolderPosition(toolbar) === -1) {
			Log.info("A placeholder of type 'sap.suite.ui.commons.ChartContainerToolbarPlaceholder' needs to be provided. Otherwise, the toolbar will be ignored");
			return this;
		}
		if (this.getToolbar() !== toolbar) {
			this.setAggregation("toolbar", toolbar);
		}
		if (this.getToolbar()) {
			this._aToolbarContent = this.getToolbar().getContent();
			this._bHasApplicationToolbar = true;
		} else {
			this._aToolbarContent = null;
			this._bHasApplicationToolbar = false;
		}
		this.invalidate();
		return this;
	};

	ChartContainer.prototype.getDimensionSelectors = function () {
		return this._aDimensionSelectors;
	};

	ChartContainer.prototype.indexOfDimensionSelector = function (dimensionSelector) {
		for (var i = 0; i < this._aDimensionSelectors.length; i++) {
			if (this._aDimensionSelectors[i] === dimensionSelector) {
				return i;
			}
		}
		return -1;
	};

	ChartContainer.prototype.addDimensionSelector = function (dimensionSelector) {
		this._aDimensionSelectors.push(dimensionSelector);
		return this;
	};

	ChartContainer.prototype.insertDimensionSelector = function (dimensionSelector, index) {
		if (!dimensionSelector) {
			return this;
		}
		var i;
		if (index < 0) {
			i = 0;
		} else if (index > this._aDimensionSelectors.length) {
			i = this._aDimensionSelectors.length;
		} else {
			i = index;
		}
		if (i !== index) {
			Log.warning("ManagedObject.insertAggregation: index '" + index + "' out of range [0," + this._aDimensionSelectors.length + "], forced to " + i);
		}
		this._aDimensionSelectors.splice(i, 0, dimensionSelector);
		return this;
	};

	ChartContainer.prototype.destroyDimensionSelectors = function () {
		if (this._oToolBar) {
			for (var i = 0; i < this._aDimensionSelectors.length; i++) {
				if (this._aDimensionSelectors[i]) {
					this._oToolBar.removeContent(this._aDimensionSelectors[i]);
					this._aDimensionSelectors[i].destroy();
				}
			}
		}

		this._aDimensionSelectors = [];
		return this;
	};

	ChartContainer.prototype.removeDimensionSelector = function (dimensionSelector) {
		if (!dimensionSelector) {
			return null;
		}
		if (this._oToolBar) {
			this._oToolBar.removeContent(dimensionSelector);
		}
		var iDimensionSelectorIndex = this.indexOfDimensionSelector(dimensionSelector);
		if (iDimensionSelectorIndex === -1) {
			return null;
		} else {
			// return the removed dimension selector
			return this._aDimensionSelectors.splice(iDimensionSelectorIndex, 1)[0];
		}
	};

	ChartContainer.prototype.removeAllDimensionSelectors = function () {
		var aDimensionSelectors = this._aDimensionSelectors.slice();
		if (this._oToolBar) {
			for (var i = 0; i < this._aDimensionSelectors.length; i++) {
				if (this._aDimensionSelectors[i]) {
					this._oToolBar.removeContent(this._aDimensionSelectors[i]);
				}
			}
		}
		this._aDimensionSelectors = [];
		return aDimensionSelectors;
	};

	ChartContainer.prototype.addContent = function (content) {
		this.addAggregation("content", content);
		this._bChartContentHasChanged = true;
		return this;
	};

	ChartContainer.prototype.insertContent = function (content, index) {
		this.insertAggregation("content", content, index);
		this._bChartContentHasChanged = true;
		return this;
	};

	/**
	 * @deprecated Not supported anymore
	 */
	ChartContainer.prototype.updateContent = function () {
		this.updateAggregation("content");
		this._bChartContentHasChanged = true;
	};

	ChartContainer.prototype.addAggregation = function (aggregationName, object, suppressInvalidate) {
		if (aggregationName === "dimensionSelectors") {
			return this.addDimensionSelector(object);
		} else {
			return ManagedObject.prototype.addAggregation.apply(this, arguments);
		}
	};

	ChartContainer.prototype.getAggregation = function (aggregationName, defaultForCreation) {
		if (aggregationName === "dimensionSelectors") {
			return this.getDimensionSelectors();
		} else {
			return ManagedObject.prototype.getAggregation.apply(this, arguments);
		}
	};

	ChartContainer.prototype.indexOfAggregation = function (aggregationName, object) {
		if (aggregationName === "dimensionSelectors") {
			return this.indexOfDimensionSelector(object);
		} else {
			return ManagedObject.prototype.indexOfAggregation.apply(this, arguments);
		}
	};

	ChartContainer.prototype.insertAggregation = function (aggregationName, object, index, suppressInvalidate) {
		if (aggregationName === "dimensionSelectors") {
			return this.insertDimensionSelector(object, index);
		} else {
			return ManagedObject.prototype.insertAggregation.apply(this, arguments);
		}
	};

	ChartContainer.prototype.destroyAggregation = function (aggregationName, suppressInvalidate) {
		if (aggregationName === "dimensionSelectors") {
			return this.destroyDimensionSelectors();
		} else {
			return ManagedObject.prototype.destroyAggregation.apply(this, arguments);
		}
	};

	ChartContainer.prototype.removeAggregation = function (aggregationName, object, suppressInvalidate) {
		if (aggregationName === "dimensionSelectors") {
			return this.removeDimensionSelector(object);
		} else {
			return ManagedObject.prototype.removeAggregation.apply(this, arguments);
		}
	};

	ChartContainer.prototype.removeAllAggregation = function (aggregationName, suppressInvalidate) {
		if (aggregationName === "dimensionSelectors") {
			return this.removeAllDimensionSelectors();
		} else {
			return ManagedObject.prototype.removeAllAggregation.apply(this, arguments);
		}
	};

	/* =========================================================== */
	/* Public methods                                              */
	/* =========================================================== */

	/**
	 * Returns the currently selected content control.
	 *
	 * @public
	 * @returns  {sap.ui.core.Control} The currently selected content
	 */
	ChartContainer.prototype.getSelectedContent = function () {
		return this._oSelectedContent;
	};

	/**
	 * Returns the current instance of the delegate to other controls.
	 *
	 * @protected
	 * @returns {sap.ui.core.delegate.ScrollEnablement} The current instance of the delegate
	 */
	ChartContainer.prototype.getScrollDelegate = function () {
		return this._oScrollEnablement;
	};

	/**
	 * Switches the currently viewed content (triggers re-rendering).
	 *
	 * @public
	 * @param {sap.ui.core.Control} chart The new content (Chart or Table) to be displayed
	 */
	ChartContainer.prototype.switchChart = function (chart) {
		this._setSelectedContent(chart);
		//Fires the change event with the ID of the newly selected item.
		this.rerender();
	};

	/**
	 * Updates ChartContainer and re-renders all its contents.
	 *
	 * @public
	 * @returns {sap.suite.ui.commons.ChartContainer} Reference to this in order to allow method chaining
	 */
	ChartContainer.prototype.updateChartContainer = function () {
		this._bChartContentHasChanged = true;
		this.rerender();
		return this;
	};

	/**
	 * Sets the Chart Container width.
	 *
	 * @public
	 * @param {string} sValue Width in string format.
	 * @returns {sap.suite.ui.commons.ChartContainer} this ChartContainer reference for chaining.
	 */
	ChartContainer.prototype.setWidth = function (sValue) {
		this.setProperty("width", sValue, true);
		this.$().css("width", this.getWidth());

		return this;
	};

	return ChartContainer;
});
