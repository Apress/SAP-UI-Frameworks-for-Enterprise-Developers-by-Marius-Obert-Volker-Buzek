/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

//START MEASUREMENT of control init here
(function() {
	"use strict";
	var Measurement = sap.ui.require("sap/ui/performance/Measurement");
	if (Measurement && Measurement.getActive()) {
		Measurement.start("SmartChartInit", "Measurement of SmartChart init time");
	}
}());

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/comp/library",
	"sap/ui/comp/util/DateTimeUtil",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/FlexItemData",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarButton",
	"sap/m/OverflowToolbarToggleButton",
	"sap/m/ToolbarSeparator",
	"sap/m/ToolbarSpacer",
	"sap/m/VBox",
	"sap/ui/comp/providers/ChartProvider",
	"sap/ui/comp/smartfilterbar/FilterProvider",
	"sap/ui/comp/smartvariants/SmartVariantManagement",
	"sap/ui/comp/smartvariants/PersonalizableInfo",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/comp/personalization/Util",
	"sap/ui/Device",
	"sap/ui/comp/odata/ODataModelUtil",
	"sap/ui/comp/odata/MetadataAnalyser",
	"sap/ui/comp/state/UIState",
	"sap/m/SelectionDetails",
	"sap/m/SelectionDetailsItem",
	"sap/m/SelectionDetailsItemLine",
	"sap/m/Title",
	"sap/ui/comp/util/FormatUtil",
	"sap/ui/comp/navpopover/NavigationPopoverHandler",
	"sap/ui/core/InvisibleText",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/library",
	"sap/ui/comp/personalization/Controller",
	"sap/ui/comp/personalization/ChartWrapper",
	"sap/ui/comp/navpopover/SemanticObjectController",
	"sap/ui/performance/Measurement",
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/chart/TimeUnitType",
	"sap/ui/core/CustomData",
	"sap/ui/core/ResizeHandler",
	"sap/ui/comp/util/FullScreenUtil",
	'sap/ui/comp/util/FilterUtil',
	'sap/ui/core/aria/HasPopup',
    "sap/ui/core/ShortcutHintsMixin",
	"sap/ui/events/KeyCodes"
], function(
	jQuery,
	library,
	DateTimeUtil,
	Button,
	Text,
	FlexItemData,
	OverflowToolbar,
	OverflowToolbarButton,
	OverflowToolbarToggleButton,
	ToolbarSeparator,
	ToolbarSpacer,
	VBox,
	ChartProvider,
	FilterProvider,
	SmartVariantManagement,
	PersonalizableInfo,
	JSONModel,
	Sorter,
	Filter,
	FilterOperator,
	PersoUtil,
	Device,
	ODataModelUtil,
	MetadataAnalyser,
	UIState,
	SelectionDetails,
	SelectionDetailsItem,
	SelectionDetailsItemLine,
	Title,
	FormatUtil,
	NavigationPopoverHandler,
	InvisibleText,
	OverflowToolbarLayoutData,
	MLibrary,
	PersoController,
	ChartWrapper,
	SemanticObjectController,
	Measurement,
	Log,
	merge,
	TimeUnitType,
	CustomData,
	ResizeHandler,
	FullScreenUtil,
	FilterUtil,
	AriaHasPopup,
	ShortcutHintsMixin,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = MLibrary.ToolbarDesign;

	// shortcut for sap.m.ListMode
	var ListMode = MLibrary.ListMode;

	// shortcut for sap.m.ListType
	var ListType = MLibrary.ListType;

	// shortcut for sap.m.PlacementType
	var PlacementType = MLibrary.PlacementType;

	// shortcut for ChangeType
	var ChangeType = library.personalization.ChangeType;

	// shortcut for ResetType
	var ResetType = library.personalization.ResetType;

	// shortcut for ResetType
	var SelectionMode = library.smartchart.SelectionMode;

	// Dependencies that are loaded lateron due to "loadLibrary()"
	var ChartLibrary;
	var Chart;
	var ColoringType;
	var ChartFormatter;
	var Dimension;
	var HierarchyDimension;
	var TimeDimension;
	var Measure;
	var MeasureSemantics;
	var VizPopover;
	var VizTooltip;
	var Breadcrumbs;
	var Link;
	var ResponsivePopover;
	var List;
	var StandardListItem;
	var Bar;
	var SearchField;
	var bInitialiseEventInUse;

	/**
	 * Constructor for a new SmartChart instance.
	 *
	 * @param {string} [sId] ID for the new control that is generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class
	 * The <code>SmartChart</code> control creates a chart based on the OData metadata and the provided configuration. To use the control, the <code>entitySet</code>
	 * property must be specified. This property is used to fetch the metadata, from which the chart UI will be generated.<br>
	 * Based on the <code>chartType</code> property, this control will render initially the corresponding chart.<br>
	 * <b>Note:</b> Most of the properties are not dynamic and cannot be changed once the control has been initialized.
	 *
	 * <b>Important:</b> Keep in mind that <code>SmartChart</code>, like all SAPUI5 smart controls, retrieves and analyzes
	 * the metadata and annotations of OData services. <b>The OData metadata is its primary API. These OData services
	 * are not part of the SAPUI5 framework and are usually maintained by the backend developers of your application.</b>
	 *
	 * With time, <code>SmartChart</code> can evolve and acquire new features. This means that its behavior or functionalities
	 * may change if the annotations that define this change are maintained in your backend metadata. To benefit from the new
	 * functionalities, your application should be able to adapt the backend metadata. <b>Therefore, we recommend
	 * using <code>SmartChart</code> only if you have control over the metadata of your application.</b>
	 *
	 * @extends sap.m.VBox
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartchart.SmartChart
	 * @see {@link topic:7a32157697474864b041fa739fcc51ba Smart Chart}
	 */
	var SmartChart = VBox.extend("sap.ui.comp.smartchart.SmartChart", /** @lends sap.ui.comp.smartchart.SmartChart.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			designtime: "sap/ui/comp/designtime/smartchart/SmartChart.designtime",
			properties: {

				/**
				 * The entity set name from which to fetch data and generate the columns.<br>
				 * <b>Note</b> This is not a dynamic property.
				 */
				entitySet: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * ID of the corresponding SmartFilter control. If specified, the SmartChart control searches for the SmartFilter control (also in the
				 * closest parent view) and attaches to the relevant events of the SmartFilter control to fetch data, show overlay etc.
				 */
				smartFilterId: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * CSV of fields that must be ignored in the OData metadata by the SmartChart control.<br>
				 * <b>Note:</b> No validation is done. Please ensure that you do not add spaces or special characters.
				 */
				ignoredFields: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * CSV of fields that must be always requested by the backend system.<br>
				 * This property is mainly meant to be used if there is no PresentationVariant annotation.<br>
				 * If both this property and the PresentationVariant annotation exist, the select request sent to the backend would be a combination
				 * of both.<br>
				 * <b>Note:</b> No validation is done. Please ensure that you do not add spaces or special characters. Also, setting this property
				 * during runtime, will delete the current drill-stack and lead to a loss of the drill history.
				 */
				requestAtLeastFields: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * CSV of fields that is not shown in the personalization dialog.<br>
				 * <b>Note:</b> No validation is done. Please ensure that you do not add spaces or special characters.
				 */
				ignoreFromPersonalisation: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies the type of chart to be created by the SmartChart control.
				 */
				chartType: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * CSV of fields that is not shown in the list of available chart types.<br>
				 * <b>Note:</b> No validation is done. Please ensure that you do not add spaces or special characters.
				 */
				ignoredChartTypes: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * If set to <code>true</code>, variants are used. As a prerequisite, you need to specify the persistencyKey property.
				 */
				useVariantManagement: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * If set to <code>true</code>, personalized chart settings are defined. If you want to persist the chart personalization, you need
				 * to specify the persistencyKey property.
				 */
				useChartPersonalisation: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Specifies header text that is shown in the chart.
				 */
				header: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Key used to access personalization data.
				 */
				persistencyKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Retrieves or applies the current variant.
				 */
				currentVariantId: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * If set to <code>true</code>, this enables automatic binding of the chart using the chartBindingPath (if it exists) or entitySet
				 * property. This happens right after the <code>initialise</code> event has been fired.
				 */
				enableAutoBinding: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Specifies the path that is used during the binding of the chart. If not specified, the entitySet property is used instead. (used
				 * only if binding is established internally/automatically - See enableAutoBinding)
				 */
				chartBindingPath: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Controls the visibility of the Drill Up and Drill Down buttons.
				 */
				showDrillButtons: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Controls the visibility of the Zoom In and Zoom Out buttons.
				 *
				 * @since 1.36
				 */
				showZoomButtons: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Controls the visibility of the Navigation button
				 *
				 * @since 1.36
				 */
				showSemanticNavigationButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				// false
				},
				/**
				 * Controls the visibility of the Variant Management.
				 *
				 * @since 1.38
				 */
				showVariantManagement: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Controls the visibility of the chart print button.
				 *
				 * @since 1.39
				 */
				/*
				 * showPrintButton: { type: "boolean", group: "Misc", defaultValue: true // false },
				 */
				/**
				 * Controls the visibility of the chart download button.
				 *
				 * @since 1.39
				 */
				showDownloadButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				/**
				 * Controls the visibility of the Details button. If set to <code>true</code>, the datapoint tooltip will be disabled as the
				 * information of selected datapoints will be found in the details popover. This will also set the drill-down button to invisible.
				 *
				 * @since 1.38
				 */
				showDetailsButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Controls the visibility of the Breadcrumbs control for drilling up within the visible dimensions. If set to <code>true</code>,
				 * the toolbar header will be replaced by the Breadcrumbs control. This will also set the drill-up button to invisible.
				 *
				 * @since 1.38
				 */
				showDrillBreadcrumbs: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				/**
				 * Controls the visibility of the chart tooltip. If set to <code>true </code>, an instance of sap.viz.ui5.controls.VizTooltip will
				 * be created and shown when hovering over a data point.
				 *
				 * @since 1.38
				 */
				showChartTooltip: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				// false
				},
				/**
				 * Controls the visibility of the Navigation button
				 *
				 * @since 1.36
				 */
				showLegendButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Set chart's legend properties.
				 *
				 * @since 1.36
				 */
				legendVisible: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Chart selection mode. Supported values are {@link sap.ui.comp.smartchart.SelectionMode.Single} or {@link sap.ui.comp.smartchart.SelectionMode.Multi}, case
				 * insensitive, always return in upper case. Unsupported values will be ignored.
				 *
				 * @since 1.36
				 */
				selectionMode: {
					type: "sap.ui.comp.smartchart.SelectionMode",
					group: "Misc",
					defaultValue: SelectionMode.Multi
				},

				/**
				 * Controls the visibility of the FullScreen button.
				 *
				 * @since 1.36
				 */
				showFullScreenButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Specifies weather an instance of {@link sap.viz.ui5.controls.VizTooltip} or {@link sap.viz.ui5.controls.Popover} is used.
				 * If set to <code>true</code>, a tooltip will be displayed, a popover otherwise.
				 *
				 * @since 1.36
				 */
				useTooltip: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Controls the visualization for chart type selection. If set to <code>true</code>, the list of available chart types will be
				 * displayed. If set to <code>false</code> and there are three or fewer available chart types, the chart types will be displayed as
				 * separate buttons in the toolbar. If there are more than three chart types, a list will be shown.
				 *
				 * @deprecated As of version 1.48.0. Setting the property to <code>false</code> will have no effect on the visualization of chart
				 *             type selection. <code>SmartChart</code> will always show a list of chart types.
				 *
				 * @since 1.38
				 */
				useListForChartTypeSelection: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Controls the visibility of the chart type selection button.
				 *
				 * @since 1.48
				 */
				showChartTypeSelectionButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Defines the custom text that will be displayed in case no data is found for the current binding.
				 *
				 * @since 1.46
				 */
				noData: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * Controls the visibility of the toolbar.
				 *
				 * @since 1.54
				 */
				showToolbar: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Defines the visual style of the smart charts <code>Toolbar</code>. <b>Note:</b> The visual styles are theme-dependent.
				 *
				 * @since 1.54
				 */
				toolbarStyle: {
					type: "sap.m.ToolbarStyle",
					group: "Appearance"
				},
				/**
				 * Controls the visibility of the title in the dimension area of the chart.
				 *
				 * @since 1.54
				 */
				showDimensionsTitle: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Controls the visibility of the title in the measure area of the chart.
				 *
				 * @since 1.54
				 */
				showMeasuresTitle: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Enables the use of timeseries on the inner chart when corresponding annotation is given
				 *
				 * @since 1.84
				 */
				activateTimeSeries: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				/**
				 * Text that is shown for values of an empty string.
				 * <b>Note:</b> The property does not change the behavior for charts of type <code>timeseries</code>.
				 * <b>Note:</b> Can only be changed in the XML/JS view. It cannot be changed once the control has been initialized.
				 * @since 1.106
				 *
				 */
				notAssignedText : {
					type: "string",
					group: "Misc",
					defaultValue: ""
				}
			},
			associations: {
				/**
				 * Identifies the SmartVariant control which should be used for the personalization. Will be ignored if the advanced mode is set.
				 *
				 * @since 1.38
				 */
				smartVariant: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			aggregations: {

				/**
				 * A custom toolbar that can be specified by the user to define their own buttons, icons, etc. If this is added, the SmartChart
				 * control does not create its own toolbar, but uses this one instead. However, if default actions, such as showSemanticNavigation,
				 * showFullScreenButton etc. are set, these actions are added at the left-hand side of the toolbar.
				 */
				toolbar: {
					type: "sap.m.Toolbar",
					multiple: false
				},

				/**
				 * The Semantic Object Controller allows the user to specify and overwrite functionality for semantic object navigation.
				 *
				 * @since 1.36
				 */
				semanticObjectController: {
					type: "sap.ui.comp.navpopover.SemanticObjectController",
					multiple: false
				},
				/**
				 * Actions on item level which can be specified for the selection details popover.
				 *
				 * @experimental Since 1.48
				 */
				selectionDetailsItemActions: {
					type: "sap.ui.core.Item",
					multiple: true
				},
				/**
				 * Actions on footer level which can be specified for the selection details popover.
				 *
				 * @experimental Since 1.48
				 */
				selectionDetailsActions: {
					type: "sap.ui.core.Item",
					multiple: true
				},
				/**
				 * Actions on group level which can be specified for the selection details popover.
				 *
				 * @experimental Since 1.48
				 */
				selectionDetailsActionGroups: {
					type: "sap.ui.core.Item",
					multiple: true
				}
			},
			events: {
				/**
				 * This event is fired once the control has been initialized.
				 * <b>Note:</b> For compatibility reasons the sap.chart library is loaded synchroniously as soon as a event handler for the <code>initialise</code>
				 * event has been attached. Since this event does not fulfill CSP requirements, please use event <code>initialized</code> instead.
				 *
				 * @deprecated Since 1.65
				 */
				initialise: {},

				/**
				 * This event is fired once the control has been initialized, asynchronous successor of <code>initialise</code>.
				 */
				initialized: {},

				/**
				 * This event is fired right before the <code>SmartChart</code> control triggers the binding / rebinding of the inner chart.<br>
				 * <b>Note:</b> In certain cases the inner chart triggers a rebinding by itself. In these cases, the event is not fired.
				 *
				 * @name sap.ui.comp.smartchart.SmartChart#beforeRebindChart
				 * @event
				 * @param {sap.ui.base.Event} oControlEvent
				 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
				 * @param {object} oControlEvent.getParameters
				 * @param {object} oControlEvent.getParameters.bindingParams The bindingParams object contains filters, sorters, and other
				 *        binding-related information for the chart
				 * @param {boolean} oControlEvent.getParameters.bindingParams.preventChartBind If set to <code>true</code> by the listener, binding
				 *        is prevented
				 * @param {sap.ui.model.Filter[]} oControlEvent.getParameters.bindingParams.filters The combined filter array containing a set of
				 *        sap.ui.model.Filter instances of the SmartChart and SmartFilter controls; can be modified by users to influence filtering
				 * @param {sap.ui.model.Sorter[]} oControlEvent.getParameters.bindingParams.sorter An array containing a set of sap.ui.model.Sorter
				 *        instances of the SmartChart control (personalization); can be modified by users to influence sorting
				 * @param {int} oControlEvent.getParameters.bindingParams.length The maximal number of items that is displayed for the
				 *        <code>SmartChart</code> control
				 * @param {object} oControlEvent.getParameters.bindingParams.parameters a map of parameters which is passed to the binding
				 * @param {object} oControlEvent.getParameters.bindingParams.events map of event listeners for the binding events (since 1.56). The
				 *        events listeners can only be registered while the binding is created. So, ensure that the events parameter is filled from
				 *        the beginning, so that the registration can be done while the binding is created.
				 * @public
				 */
				beforeRebindChart: {},

				/**
				 * This event is fired when data is received after binding. This event is fired if the binding for the chart is done by the SmartChart
				 * control itself.
				 * @deprecated Since 1.56. Use <code>beforeRebindChart</code> event to attach/listen to the binding "events" directly
				 */
				dataReceived: {},

				/**
				 * This event is fired after the variant management in the SmartChart control has been initialized.
				 */
				afterVariantInitialise: {},

				/**
				 * This event is fired after a variant has been saved. This event can be used to retrieve the ID of the saved variant.
				 */
				afterVariantSave: {
					parameters: {
						/**
						 * ID of the currently selected variant
						 */
						currentVariantId: {
							type: "string"
						}
					}
				},

				/**
				 * This event is fired after a variant has been applied.
				 */
				afterVariantApply: {
					parameters: {
						/**
						 * ID of the currently selected variant
						 */
						currentVariantId: {
							type: "string"
						}
					}
				},

				/**
				 * This event is fired right before the overlay is shown.
				 *
				 * @event
				 * @param {sap.ui.base.Event} oControlEvent
				 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
				 * @param {object} oControlEvent.getParameters
				 * @param {object} oControlEvent.getParameters.overlay Overlay object that contains information related to the overlay of the chart
				 * @param {boolean} oControlEvent.getParameters.overlay.show If set to code>false</code> by the listener, overlay is not shown
				 * @public
				 */
				showOverlay: {},

				/**
				 * This event is fired right after the full screen mode of the SmartChart control has been changed.
				 *
				 * @since 1.46
				 */
				fullScreenToggled: {
					parameters: {
						/**
						 * If <code>true</code> the control is in full screen mode
						 */
						fullScreen: {
							type: "boolean"
						}
					}
				},
				/**
				 * This event is fired when any action in the selection details popover is pressed.
				 *
				 * @experimental Since 1.48
				 * @since 1.48
				 */
				selectionDetailsActionPress: {
					parameters: {

						/**
						 * The action that has to be processed once the action has been pressed
						 */
						action: {
							type: "sap.ui.core.Item"
						},
						/**
						 * If the action is pressed on one of the {@link sap.m.SelectionDetailsItem items}, the parameter contains the
						 * {@link sap.ui.model.Context context} of the pressed {@link sap.m.SelectionDetailsItem item}. If a custom action or action
						 * group of the SelectionDetails popover is pressed, this parameter contains all {@link sap.ui.model.Context contexts} of the
						 * {@link sap.m.SelectionDetailsItem items}.
						 */
						itemContexts: {
							type: "sap.ui.model.Context"
						},
						/**
						 * The action level of action buttons. The available levels are Item, List and Group
						 */
						level: {
							type: "sap.m.SelectionDetailsActionLevel"
						}
					}
				},
				/**
				 * This event is fired when <code>SmartChart</code> control data changes, due to changes in the personalization dialog or drill
				 * operations.<br>
				 * The data can be changed via sorters, filters or drill-ups/drill-downs.
				 */
				chartDataChanged: {
					parameters: {
						/**
						 * Object which contains a boolean flag for dimeasure, filter, sort. If set to <code>true</code>, it has been changed.
						 */
						changeTypes: {
							type: "object"
						}
					}

				},
				/**
				 * This event is fired when the UI state changes either via the {@link sap.ui.comp.smartchart.SmartChart#setUiState} method or the chart personalization.
				 * @since 1.96.15
				 */
				uiStateChange: {}
			}
		},

		renderer: {
			apiVersion: 2
		}
	});

	SmartChart.prototype.init = function() {

		VBox.prototype.init.call(this);
		this.addStyleClass("sapUiCompSmartChart");
		this.setFitContainer(true);
		this._bUpdateToolbar = true;
		this._oChartTypeModel = null;

		//this.setHeight("100%");

		var oModel = new JSONModel({
			items: []
		});
		this.setModel(oModel, "$smartChartTypes");

		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");

		// currently handels _adjustHeight
		//this._processResizeHandler(true);

		if (!this.getLayoutData()) {
			this.setLayoutData(new FlexItemData({
				growFactor: 1,
				baseSize: "auto"
			}));
		}

	};

	SmartChart.prototype._getVariantManagementControl = function(oSmartVariantId) {
		var oSmartVariantControl = null;
		if (oSmartVariantId) {
			if (typeof oSmartVariantId === 'string') {
				oSmartVariantControl = sap.ui.getCore().byId(oSmartVariantId);
			} else {
				oSmartVariantControl = oSmartVariantId;
			}

			if (oSmartVariantControl) {
				if (!(oSmartVariantControl instanceof SmartVariantManagement)) {
					Log.error("Control with the id=" + typeof oSmartVariantId.getId == "function" ? oSmartVariantId.getId() : oSmartVariantId + " not of expected type");
					return null;
				}
			}
		}

		return oSmartVariantControl;
	};

	/**
	 * instantiates the SmartVariantManagementControl
	 *
	 * @private
	 */
	SmartChart.prototype._createVariantManagementControl = function() {

		// Do not create variant management when it is not needed!
		if (this._oVariantManagement || (!this.getUseVariantManagement() && !this.getUseChartPersonalisation()) || !this.getPersistencyKey()) {
			return;
		}

		// always create VariantManagementControl, in case it is not used, it will take care of persisting the personalisation
		// without visualization
		var oPersInfo = new PersonalizableInfo({
			type: "chart",
			keyName: "persistencyKey",
			dataSource: this.getEntitySet()
		});

		oPersInfo.setControl(this);

		var sSmartVariantId = this.getSmartVariant();
		if (sSmartVariantId) {
			this._oVariantManagement = this._getVariantManagementControl(sSmartVariantId);
		} else if (this._oSmartFilter && this._oSmartFilter.data("pageVariantPersistencyKey")) {
			sSmartVariantId = this._oSmartFilter.getSmartVariant();
			if (sSmartVariantId) {
				this._oVariantManagement = this._getVariantManagementControl(sSmartVariantId);
			}
		} else {
			this._oVariantManagement = new SmartVariantManagement(this.getId() + "-variant", {
				showShare: true
			});
		}

		if (this._oVariantManagement) {

			if (!this._oVariantManagement.isPageVariant()) {
				this._oVariantManagement.setVisible(this.getShowVariantManagement());
			}

			this._oVariantManagement.addPersonalizableControl(oPersInfo);

			// Current variant could have been set already (before initialise) by the SmartVariant, in case of GLO/Industry specific variant
			// handling
			this._oVariantManagement.attachSave(this._variantSaved, this);
			this._oVariantManagement.attachAfterSave(this._variantAfterSave, this);

			this._oVariantManagement.initialise(this._variantInitialised, this);
		}
	};

	/**
	 * event handler for variantmanagement save event
	 *
	 * @private
	 */
	SmartChart.prototype._variantInitialised = function() {
		if (!this._oCurrentVariant) {
			this._oCurrentVariant = "STANDARD";
		}
		this.fireAfterVariantInitialise();
		/*
		 * If VariantManagement is disabled (no LRep connectivity) trigger the binding
		 */
		if (this._oVariantManagement && !this._oVariantManagement.getEnabled()) {
			this._checkAndTriggerBinding();
		}
	};

	SmartChart.prototype._variantSaved = function() {
		if (this._oPersController) {
			this._oPersController.setPersonalizationData(this._oCurrentVariant, true);
		}
	};

	SmartChart.prototype._variantAfterSave = function() {
		this.fireAfterVariantSave({
			currentVariantId: this.getCurrentVariantId()
		});
	};

	SmartChart.prototype.setUseChartPersonalisation = function(bUseChartPersonalisation) {
		this.setProperty("useChartPersonalisation", bUseChartPersonalisation, true);
		this._bUpdateToolbar = true;
		return this;
	};

	SmartChart.prototype.setUseTooltip = function(bUseTooltip) {
		this.setProperty("useTooltip", bUseTooltip, true);
		this._createTooltipOrPopover();
		return this;
	};

	SmartChart.prototype._createTooltipOrPopover = function() {
		// only show tooltip, when enabled via showChartTooltip
		if (this.getUseTooltip() && this.getShowChartTooltip()) {
			// this._createTooltip();
			this._toggleChartTooltipVisibility(true);
		} else {
			this._createPopover();
		}
	};

	SmartChart.prototype._createPopover = function() {
		if (this._oChart) {
			// assign Popover to chart

			if (!VizPopover && !this._bVizPopoverRequested) {
				VizPopover = sap.ui.require("sap/viz/ui5/controls/Popover");
				if (!VizPopover) {
					sap.ui.require([
						"sap/viz/ui5/controls/Popover"
					], _VizPopoverLoaded.bind(this));
					this._bVizPopoverRequested = true;
				}
			}
			//Skip creation of popover in case application already connected one from outside
			//TODO: Discuss with sap.chart.Chart colleagues for a public API to call
			if (!this._oPopover && VizPopover && !this._oChart._getVizFrame()._connectPopover) {
				this._oPopover = new VizPopover({});
			}
			if (this._oPopover) {
				this._oPopover.connect(this._oChart.getVizUid());
			}
		}
	};

	function _VizPopoverLoaded(fnVizPopover) {
		VizPopover = fnVizPopover;
		this._bVizPopoverRequested = false;

		if (!this._bIsBeingDestroyed) {
			this._createPopover();
		}
	}

	SmartChart.prototype._destroyPopover = function() {
		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}
	};

	SmartChart.prototype.setUseVariantManagement = function(bUseVariantManagement) {
		this.setProperty("useVariantManagement", bUseVariantManagement, true);
		if (this._oPersController) {
			this._oPersController.setResetToInitialTableState(!bUseVariantManagement);
		}
		this._bUpdateToolbar = true;
		return this;
	};

	/**
	 * Sets the aggregated toolbar.
	 * <b>Note:</b> This is only used during initialization. The setter must not be called later on as the toolbar cannot be changed after the initialization.
	 *
	 * @param {sap.m.Toolbar} oToolbar The toolbar to set
	 * @returns {sap.ui.comp.smartchart.SmartChart} reference to <code>this</code> in order to allow method chaining
	 */
	SmartChart.prototype.setToolbar = function(oToolbar) {
		if (this._oToolbar) {
			this.removeItem(this._oToolbar);
		}
		this._oToolbar = oToolbar;
		this._bUpdateToolbar = true;

		this._oToolbar.setLayoutData(new FlexItemData({
			shrinkFactor: 0
		}));

		this.insertItem(this._oToolbar, 0);
		this._oToolbar.setVisible(this.getShowToolbar());
		this._oToolbar.setStyle(this.getToolbarStyle());

		return this;
	};

	SmartChart.prototype.getToolbar = function() {
		return this._oToolbar;
	};

	SmartChart.prototype.setHeader = function(sText) {
		this.setProperty("header", sText, true);
		this._refreshHeaderText();
		return this;
	};

	/**
	 * sets the header text
	 *
	 * @private
	 */
	SmartChart.prototype._refreshHeaderText = function() {
		if (!this._headerText) {
			this._bUpdateToolbar = true;
			return;
		}
		var sText = this.getHeader();
		this._headerText.setText(sText);

		if (this._oSeparator) {
			if (sText) {
				this._oSeparator.setVisible(true);
			} else {
				this._oSeparator.setVisible(false);
			}
		}
	};

	/**
	 * creates the toolbar
	 *
	 * @private
	 */
	SmartChart.prototype._createToolbar = function() {
		// If no toolbar exists --> create one
		if (!this._oToolbar) {
			this._oToolbar = new OverflowToolbar({
				design: ToolbarDesign.Transparent
			});
			this._oToolbar.addStyleClass("sapUiCompSmartChartToolbar");
			this._oToolbar.addStyleClass("sapMTBHeader-CTX");

			this._oToolbar.setLayoutData(new FlexItemData({
				shrinkFactor: 0
			}));
			this.insertItem(this._oToolbar, 0);
			this._oToolbar.setVisible(this.getShowToolbar());
			this._oToolbar.setStyle(this.getToolbarStyle());
		}
	};

	/**
	 * creates the toolbar content
	 *
	 * @private
	 */
	SmartChart.prototype._createToolbarContent = function() {
		// insert the items in the custom toolbar in reverse order => insert always at position 0
		this._addVariantManagementToToolbar();
		this._addSeparatorToToolbar();
		this._addHeaderToToolbar();

		// this._addDrillBreadcrumbs();

		// add spacer to toolbar
		this._addSpacerToToolbar();

		this._addSemanticNavigationButton();

		this._addDetailsButton();

		// Add Drill buttons
		this._addDrillUpDownButtons();

		// Add Legend button
		this._addLegendButton();

		// Add Zoom buttons
		this._addZoomInOutButtons();

		// this._addPrintButton();

		this._addDownloadButton();

		// Add Personalisation Icon
		this._addPersonalisationToToolbar();

		// Add Fullscreen Button
		this._addFullScreenButton();

		// Add Chart Type Button
		this._addChartTypeToToolbar();

		// Seems like toolbar only contains spacer and is actually not needed - remove it
		if (this._oToolbar && (this._oToolbar.getContent().length === 0 || (this._oToolbar.getContent().length === 1 && this._oToolbar.getContent()[0] instanceof ToolbarSpacer))) {
			this.removeItem(this._oToolbar);
			this._oToolbar.destroy();
			this._oToolbar = null;
		}
	};

	SmartChart.prototype.setShowVariantManagement = function(bFlag) {
		this.setProperty("showVariantManagement", bFlag);

		if (this._oVariantManagement && this._oVariantManagement.isPageVariant()) {
			this._oVariantManagement.setVisible(bFlag);
		}
		return this;
	};

	SmartChart.prototype.setShowDetailsButton = function(bFlag) {

		this.setProperty("showDetailsButton", bFlag);

		// Handle visibility of details button and chart tooltips
		if (this._oSelectionDetails) {
			this._oSelectionDetails.setVisible(bFlag);
			// Btn only exists together with selectionDetails control
			if (this._oDrillDownTextButton) {
				this._oDrillDownTextButton.setVisible(bFlag);
			}
			this._setBehaviorTypeForDataSelection();
		}
		// Handle visibility of drill up button
		if (this._oDrillDownButton) {
			this._oDrillDownButton.setVisible(!bFlag);
		}
		return this;
	};

	SmartChart.prototype.setShowChartTypeSelectionButton = function(bFlag) {
		this.setProperty("showChartTypeSelectionButton", bFlag);

		if (this._oChartTypeButton) {
			this._oChartTypeButton.setVisible(bFlag);
		}
		return this;
	};

	SmartChart.prototype.setShowDownloadButton = function(bFlag) {
		this.setProperty("showDownloadButton", bFlag);
		// Handle the visibility of the download button
		if (this._oDownloadButton) {
			this._oDownloadButton.setVisible(bFlag);
		}
		return this;
	};

	SmartChart.prototype.setShowDrillBreadcrumbs = function(bFlag) {

		this.setProperty("showDrillBreadcrumbs", bFlag);

		/*if (bFlag && !this._oDrillBreadcrumbs) {
			this._addDrillBreadcrumbs();
		}*/

		// Handle visibility of breadcrumbs
		if (this._oDrillBreadcrumbs) {
			this._oDrillBreadcrumbs.setVisible(bFlag);
		}
		// Handle visibility of drill up button
		if (this._oDrillUpButton) {
			this._oDrillUpButton.setVisible(!bFlag);
		}
		return this;
	};

	SmartChart.prototype.setShowChartTooltip = function(bFlag) {
		this.setProperty("showChartTooltip", bFlag);
		this._toggleChartTooltipVisibility(bFlag);
		return this;
	};

	SmartChart.prototype._setBehaviorTypeForDataSelection = function() {
		// Currently this property can only be set once during init time and is not dynamic.
		if (this.getShowDetailsButton()) {
			// If we use details button, noHoverBehavior has to be set in order to enable details event
			this._oChart.setVizProperties({
				"interaction": {
					"behaviorType": "noHoverBehavior"
				}
			});
		} else if (this._oChart.getVizProperties().interaction.behaviorType) {
			// Get current interaction vizProperties and delete behaviorType
			var oInteractionProps = this._oChart.getVizProperties().interaction;
			delete oInteractionProps.behaviorType;
			// Set modified interaction props on inner chart
			this._oChart.setVizProperties({
				"interaction": oInteractionProps
			});

		}
	};

	/**
	 * adds breadcrumbs to the toolbar for drilling up in the selected dimensions
	 *
	 * @private
	 */
	SmartChart.prototype._addDrillBreadcrumbs = function() {

		if (!this._oDrillBreadcrumbs && this.getShowDrillBreadcrumbs()) {
			if ((!Breadcrumbs || !Link) && !this._bBreadcrumbsRequested) {
				Breadcrumbs = sap.ui.require("sap/m/Breadcrumbs");
				Link = sap.ui.require("sap/m/Link");
				if (!Breadcrumbs) {
					sap.ui.require([
						"sap/m/Breadcrumbs", "sap/m/Link"
					], _BreadcrumbsLoaded.bind(this));
					this._bBreadcrumbsRequested = true;
				}
			}

			if (this._oChart && Breadcrumbs && Link) {
				this._oDrillBreadcrumbs = new Breadcrumbs(this.getId() + "-drillBreadcrumbs", {
					visible: this.getShowDrillBreadcrumbs()
				}).addStyleClass("sapUiCompSmartChartBreadcrumbs");

				this.insertItem(this._oDrillBreadcrumbs, 1);
				this._updateDrillBreadcrumbs();

				// Attach to the drill events in order to update the breadcrumbs
				this._oChart.attachDrilledUp(function(oEvent) {
					this._updateDrillBreadcrumbs();
					// Drill-Stack filters are not part of filter panel any more
					// this._updatePersFilters();
				}.bind(this));

				this._oChart.attachDrilledDown(function(oEvent) {
					this._updateDrillBreadcrumbs();
					// Drill-Stack filters are not part of filter panel any more
					// this._updatePersFilters();
				}.bind(this));
			}
		}
	};

	function _BreadcrumbsLoaded(fnBreadcrumbs, fnLink) {
		Breadcrumbs = fnBreadcrumbs;
		Link = fnLink;
		this._bBreadcrumbsRequested = false;

		if (!this._bIsBeingDestroyed) {
			this._addDrillBreadcrumbs();
		}
	}

	/**
	 * updates selection filters for usage within filter panel of settings dialog
	 *
	 * @private
	 */
	/*
	 * SmartChart.prototype._updatePersFilters = function() { if (this._oPersController) { // Set filters extracted from drill-stack on ChartWrapper
	 * this._oPersController.getTable().setExternalFilters(this._extractDrillStackFilters()); } };
	 */
	/**
	 * extracts all selection filters from current drill-stack and processes them for personalization controller.
	 *
	 * @returns {Array} An array of P13nFilterItems
	 * @private
	 */
	/*
	 * SmartChart.prototype._extractDrillStackFilters = function() { var aDrillStack = this.getChart().getDrillStack(); var aStackFilters = []; var
	 * fTakeFilters = function(oFilter) { if (!oFilter) { return; } if (oFilter && oFilter.sPath && oFilter.sOperator) { var oFilterItem = new
	 * P13nFilterItem({ operation: oFilter.sOperator, value1: oFilter.oValue1, value2: oFilter.oValue2, columnKey: oFilter.sPath });
	 * aStackFilters.push(oFilterItem); } // check for nested filters if (oFilter.aFilters) { oFilter.aFilters.forEach(function(oFilter_) {
	 * fTakeFilters(oFilter_); }); } }; // Create a sap.m.P13nFilterItem for each filter inside the drillstack;
	 * aDrillStack.forEach(function(oStackEntry, index, aDrillStack) { fTakeFilters(oStackEntry.filter); }); return aStackFilters; };
	 */

	/**
	 * returns all selection filters of current drill-stack
	 *
	 * @returns {sap.ui.model.Filter[]} An array of drill-stack filters
	 */
	SmartChart.prototype.getDrillStackFilters = function() {

		var aDrillStack = this._oChart.getDrillStack();
		var aStackFilters = [];

		var fTakeFilters = function(oFilter) {
			if (!oFilter) {
				return;
			}
			if (oFilter && oFilter.sPath && oFilter.sOperator) {

				aStackFilters.push(oFilter);
			}
			// check for nested filters
			if (oFilter.aFilters) {
				oFilter.aFilters.forEach(function(oFilter_) {
					fTakeFilters(oFilter_);
				});
			}
		};

		aDrillStack.forEach(function(oStackEntry) {
			fTakeFilters(oStackEntry.filter);
		});

		return aStackFilters;
	};
	/**
	 * returns all currently applied dimensions which are part of the chart's stack.
	 *
	 * @returns {string[]} array of drill-stack dimensions
	 * @private
	 */
	SmartChart.prototype._getDrillStackDimensions = function() {
		var aDrillStack = this._oChart.getDrillStack();
		var aStackDimensions = [];

		aDrillStack.forEach(function(oStackEntry) {
			// loop over nested dimension arrays
			oStackEntry.dimension.forEach(function(sDimension) {
				if (sDimension != null && sDimension != "" && aStackDimensions.indexOf(sDimension) == -1) {
					aStackDimensions.push(sDimension);
				}
			});
		});

		return aStackDimensions;
	};
	/**
	 * updates the breadcrumbs control when drilled up or down within the dimensions
	 *
	 * @private
	 */
	SmartChart.prototype._updateDrillBreadcrumbs = function() {
		if (!this._oDrillBreadcrumbs) {
			return;
		}

		// Get access to drill history
		var aVisibleDimensionsRev = this._oChart.getDrillStack();
		var newLinks = [];

		// When chart is bound to non-aggregated entity there is no drill-stack
		// existing
		if (aVisibleDimensionsRev) {
			// Reverse array to display right order of crumbs
			aVisibleDimensionsRev.reverse();
			aVisibleDimensionsRev.forEach(function(dim, index, array) {

				// Check if stack entry has dimension names and if a
				// dimension is existing for this name
				if (dim.dimension.length > 0 && typeof this._oChart.getDimensionByName(dim.dimension[dim.dimension.length - 1]) != 'undefined') {
					// show breadcrumbs
					if (this.getShowDrillBreadcrumbs()) {
						this._oDrillBreadcrumbs.setVisible(true);
					}
					// use the last entry of each drill-stack entry to built
					// up the drill-path
					var sDimLabel = this._oChart.getDimensionByName(dim.dimension[dim.dimension.length - 1]).getLabel();

					// Set current drill position in breadcrumb control
					if (index == 0) {

						this._oDrillBreadcrumbs.setCurrentLocationText(sDimLabel);
					} else {

						var oCrumb = new Link({
							text: sDimLabel,
							press: function(oEvent) {
								var iLinkIndex = this._oDrillBreadcrumbs.indexOfLink(oEvent.getSource());
								// plus the position before this link regarding the visualization in breadcrumbs
								this._oChart.drillUp(iLinkIndex + 1);
								// get rid of entries in the details model
								this._oChart.fireDeselectData(oEvent);
								// don't forget to update the bread crumbs
								// control itself
								this._updateDrillBreadcrumbs();

							}.bind(this)
						});

						newLinks.push(oCrumb);//note the links are added in an incorrect order need to reverse
					}
				} else {
					// Show no text on breadcrumb if stack contains only one
					// entry with no dimension at all (all dims are shown)
					if (index == 0) {
						// hide breadcrumbs
						this._oDrillBreadcrumbs.setVisible(false);
					}
				}
			}.bind(this));
		}

		var currLinks = this._oDrillBreadcrumbs.getLinks();
		newLinks.reverse();
		var diff = false;

		if (currLinks.length !== newLinks.length) {
			diff = true;
		} else {

			for (var i = 0; i < newLinks.length; i++) {
				if (newLinks[i].getText() != currLinks[i].getText()) {
					diff = true;
					break;
				}
			}
		}

		if (diff) {

			// Clear aggregation before we rebuild it
			if (this._oDrillBreadcrumbs.getLinks()) {
				this._oDrillBreadcrumbs.removeAllLinks();
			}

			for (var i = 0; i < newLinks.length; i++) {
				this._oDrillBreadcrumbs.addLink(newLinks[i]);
			}
		}

	};

	/**
	 * adds the details button to the toolbar
	 *
	 * @private
	 */
	SmartChart.prototype._addDetailsButton = function() {

		this._oSelectionDetails = new SelectionDetails(this.getId() + "-selectionDetails", {
			visible: this.getShowDetailsButton(),
			customData :  [new CustomData({
				key : "sap-ui-custom-settings",
				value : {
					"sap.ui.dt" : {
						"designtime": "sap/ui/comp/designtime/smartchart/SmartChartDetails.designtime"
					}
				}
			})]
		});


		this._oSelectionDetails.registerSelectionDetailsItemFactory([

		], function(aDisplayData, aData, oContext, oData) {
			var aLines = [];
			var fValFormatter = function(val) {
				var val = aDisplayData[i].value;
				if (val) {
					return val instanceof Object ? val : val.toString();
				} else {
					return val;
				}
			};
			for (var i = 0; i < aDisplayData.length; i++) {
				aLines.push(new SelectionDetailsItemLine({
					label: aDisplayData[i].label,
					value: fValFormatter(aDisplayData[i].value),
					unit: aDisplayData[i].unit
				}));
			}
			return new SelectionDetailsItem({
				enableNav: (function() {
					// Check if we have semantic objects before enabling navigation
					if (this._determineSemanticObjectsforDetailsPopover(aData, oContext).length > 0) {
						return true;
					} else {
						return false;
					}
				}.bind(this)()),
				lines: aLines
			}).setBindingContext(oContext);
		}.bind(this));

		// Attach to navigation event of selectionDetails
		// for semantic object navigation
		this._oSelectionDetails.attachNavigate(function(oEvent) {
			// Destroy content on navBack of selectionDetails
			// This either is the semanticNavContainer or the semanticNavItemList
			if (oEvent.getParameter("direction") === "back") {
				oEvent.getParameter("content").destroy();
			} else {
				// Forward navigation to semantic objects
				this._navigateToSemanticObjectDetails(oEvent);
			}

		}.bind(this));

		this._oSelectionDetails.attachActionPress(function(oEvent) {
			// extract binding information of each item
			var aItemContexts = [];
			oEvent.getParameter("items").forEach(function(oItem) {
				aItemContexts.push(oItem.getBindingContext());
			});
			// Re-arrange event object and navigate to outer press handler
			this.fireSelectionDetailsActionPress({
				id: oEvent.getParameter("id"),
				action: oEvent.getParameter("action"),
				itemContexts: aItemContexts,
				level: oEvent.getParameter("level")
			});
		}.bind(this));

		// Update of selectionDetails action aggregations
		this._oSelectionDetails.attachBeforeOpen(function(oEvent) {

			// Update item actions
			var aSelectionItems = this._oSelectionDetails.getItems();

			aSelectionItems.forEach(function(oItem) {
				var oActionClones = this._getDetailsActionsClones();
				oActionClones.selectionDetailsItemActions.forEach(function(oAction) {
					oItem.addAction(oAction);
				});
			}.bind(this));

			// Update list actions
			var oActionClones = this._getDetailsActionsClones().selectionDetailsActions;
			this._oSelectionDetails.removeAllActions();
			oActionClones.forEach(function(oAction) {
				this._oSelectionDetails.addAction(oAction);
			}.bind(this));

			// Update group actions
			var oGroupActionClones = this._getDetailsActionsClones().selectionDetailsActionGroups;
			this._oSelectionDetails.removeAllActionGroups();
			oGroupActionClones.forEach(function(oActionGroup) {
				this._oSelectionDetails.addActionGroup(oActionGroup);
			}.bind(this));

		}.bind(this));

		this._oSelectionDetails.attachBeforeClose(function(oEvent) {
			// Needs to be destroyed to re-navigate later.
			if (this._oNavigationContainer) {
				this._oNavigationContainer.destroy();
			}

		}.bind(this));

		// Add to SmartChart toolbar
		this._oToolbar.addContent(this._oSelectionDetails);

		// Add drill down text button as well
		this._addDrillDownTextButton();
	};
	/**
	 * Creates clones of each outer aggregation for selectionDetails control delegation of actions.
	 *
	 * @returns {{selectionDetailsItemActions: Array, selectionDetailsActions: Array, selectionDetailsActionGroups: Array}}
	 * @private
	 */
	SmartChart.prototype._getDetailsActionsClones = function() {

		var oDetailsActions = {
			selectionDetailsItemActions: [],
			selectionDetailsActions: [],
			selectionDetailsActionGroups: []
		};

		// Clone itemActions
		this.getSelectionDetailsItemActions().forEach(function(oItem) {
			oDetailsActions.selectionDetailsItemActions.push(oItem.clone());
		});

		// Clone actions
		this.getSelectionDetailsActions().forEach(function(oItem) {
			oDetailsActions.selectionDetailsActions.push(oItem.clone());
		});

		// Clone itemActions
		this.getSelectionDetailsActionGroups().forEach(function(oItem) {
			oDetailsActions.selectionDetailsActionGroups.push(oItem.clone());
		});

		return oDetailsActions;
	};
	/**
	 * adds a print button to the toolbar
	 */
	/*
	 * SmartChart.prototype._addPrintButton = function() { if (!this._oPrintButton && this.getShowPrintButton()) { this._oPrintButton = new
	 * Button(this.getId() + "-btnPrint", { type: "Transparent", tooltip: "Print Chart", icon: "sap-icon://print", layoutData: new
	 * sap.m.OverflowToolbarLayoutData({ priority: sap.m.OverflowToolbarPriority.NeverOverflow }), enabled: true, press: function(oEvent) {
	 * this._printChart(oEvent); }.bind(this) }); this._oToolbar.addContent(this._oPrintButton); } };
	 */

	/**
	 * adds a download button to the toolbar
	 */
	SmartChart.prototype._addDownloadButton = function() {
		if (!this._oDownloadButton) {
			this._oDownloadButton = new OverflowToolbarButton(this.getId() + "btnDownload", {
				type: "Transparent",
				text: this._oRb.getText("CHART_DOWNLOADBTN_TEXT"),
				tooltip: this._oRb.getText("CHART_DOWNLOADBTN_TOOLTIP"),
				icon: "sap-icon://download",
				visible: this.getShowDownloadButton(),
				enabled: false,
				press: function(oEvent) {
					// Check for browser
					if (window.navigator && window.navigator.msSaveOrOpenBlob) {
						// Handle IE, User can either open or save the svg
						// Create a blob object containing the chart svg data
						var svgBlob = new window.Blob([
							this._getVizFrame().exportToSVGString()
						], {
							'type': "image/svg+xml"
						});
						window.navigator.msSaveOrOpenBlob(svgBlob);
					} else {

						this._downloadChartPNG();
					}
				}.bind(this)
			});
			this._oToolbar.addContent(this._oDownloadButton);
		}
	};

	/**
	 * opens an image of the currently displayed chart in a new tab and show browsers print dialog
	 */
	/*
	 * SmartChart.prototype._printChart = function() { // Create a blob object containing the chart svg data var svgBlob = new window.Blob([
	 * this._getVizFrame().exportToSVGString() ], { 'type': "image/svg+xml" }); // Check for browser if (window.navigator &&
	 * window.navigator.msSaveOrOpenBlob) { // Handle IE, User can either open or save the svg window.navigator.msSaveOrOpenBlob(svgBlob); } else { //
	 * Firefox, Chrome // Create a local url for the blob in order to have same origin. var url = window.URL.createObjectURL(svgBlob); // Open new
	 * window showing the svg image var svgWindow = window.open(url, "svg_win"); // We need to use own var as window.onfocus is not working correctly
	 * after print dialog is closed var tabIsFocused = false; // check if print is finished or cancelled setInterval(function() { if (tabIsFocused ===
	 * true) { svgWindow.close(); } }, 1); // Do the print svgWindow.onload = function() { // TODO: Should work on all Apple devices, but wee need to
	 * handle Android separately if (Device.os.name === "Android") { // do something } else { svgWindow.print(); // Print was done or cancelled
	 * tabIsFocused = true; } }; } };
	 */

	/**
	 * downloads a svg file of the currently displayed chart
	 */
	SmartChart.prototype._downloadChartSVG = function() {
		// Download a file
		var fileName = this.getHeader();
		var dl = document.createElement('a');
		dl.setAttribute('href', 'data:image/svg+xml,' + encodeURIComponent(this._getVizFrame().exportToSVGString()));
		dl.setAttribute('download', fileName ? fileName : 'Chart' + '.svg');
		dl.click();
	};

	/**
	 * downloads the chart as png file
	 */
	SmartChart.prototype._downloadChartPNG = function() {
		// Not working for IE, in this case we create a blob and call the IE notification bar for downloading the SVG
		// Create Image and then download (Chrome)
		var fileName = this.getHeader();
		var chartSVG = this._getVizFrame().exportToSVGString();
		var canvas = document.createElement('canvas'); // Not shown on page
		var context = canvas.getContext('2d');
		var loader = new Image(); // Not shown on page

		// getId() because vizFrame content changes id when selecting another chart type
		loader.width = canvas.width = document.getElementById(this._oChart.getId()).offsetWidth;
		loader.height = canvas.height = document.getElementById(this._oChart.getId()).offsetHeight;

		loader.onload = function() {
			context.drawImage(loader, 0, 0);

			var dl = document.createElement('a');
			dl.setAttribute('href', canvas.toDataURL());
			dl.setAttribute('download', fileName ? fileName : 'Chart' + '.png');
			dl.click();
		};
		loader.setAttribute('crossOrigin', 'anonymous');
		loader.src = 'data:image/svg+xml,' + encodeURIComponent(chartSVG);
	};

	/**
	 * adds the full-screen button to the toolbar
	 *
	 * @private
	 */
	SmartChart.prototype._addFullScreenButton = function() {
		var oFullScreenButton;
		if (this.getShowFullScreenButton()) {
			oFullScreenButton = new OverflowToolbarButton(this.getId() + "-btnFullScreen", {
				type: "Transparent",
				press: function() {
					this._toggleFullScreen(!this.bFullScreen);
				}.bind(this),
				enabled: false
			});
			this.oFullScreenButton = oFullScreenButton;
			this._renderFullScreenButton();
			this._oToolbar.addContent(oFullScreenButton);
		}
	};

	/**
	 * adds the zoom-in / zoom-out buttons to the toolbar
	 *
	 * @private
	 */
	SmartChart.prototype._addZoomInOutButtons = function() {

		var that = this;
		this._oZoomInButton = new OverflowToolbarButton(this.getId() + "-btnZoomIn", {
			type: "Transparent",
			text: this._oRb.getText("CHART_ZOOMINBTN_TEXT"),
			tooltip: this._oRb.getText("CHART_ZOOMINBTN_TOOLTIP"),
			icon: "sap-icon://zoom-in",
			press: function() {
				if (that._oChart) {
					that._oChart.zoom({
						direction: "in"
					});
					this._oZoomInPressed = true;
					this._toggleZoomButtonEnablement();
				}
			}.bind(this),
			visible: this.getShowZoomButtons(),
			enabled: false
		});

		this._oZoomOutButton = new OverflowToolbarButton(this.getId() + "-btnZoomOut", {
			type: "Transparent",
			text: this._oRb.getText("CHART_ZOOMOUTBTN_TEXT"),
			tooltip: this._oRb.getText("CHART_ZOOMOUTBTN_TOOLTIP"),
			icon: "sap-icon://zoom-out",
			press: function() {
				if (that._oChart) {
					that._oChart.zoom({
						direction: "out"
					});
					this._oZoomOutPressed = true;
					this._toggleZoomButtonEnablement();
				}
			}.bind(this),
			visible: this.getShowZoomButtons(),
			enabled: false
		});

		this._oToolbar.addContent(this._oZoomInButton);
		this._oToolbar.addContent(this._oZoomOutButton);

		//Register zoom btn toggling
		//Will be called on window resize, drill-down, chart type change, etc.
		//this._oChart.attachRenderComplete(this._toggleZoomButtonEnablement, this);
	};

	SmartChart.prototype._toggleZoomButtonEnablement = function() {

		var iZoomInfo = this._oChart.getZoomInfo().currentZoomLevel;

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
			//switch the focus
			if (this._oZoomInPressed) {
				this._oZoomInButton.focus();
				this._oZoomInPressed = false;
			}
			this._oZoomOutButton.setEnabled(false);
			this._oZoomInButton.setEnabled(true);
			//Zoomed in all the way
		} else if (iZoomInfo === 1) {
			//switch the focus
			if (this._oZoomOutPressed) {
				this._oZoomOutButton.focus();
				this._oZoomOutPressed = false;
			}
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
	 * Sets the zoom-in / zoom-out buttons visibility state.
	 *
	 * @param {boolean} bFlag true to display the zoom-in / zoom-out buttons
	 */
	SmartChart.prototype.setShowZoomButtons = function(bFlag) {

		this.setProperty("showZoomButtons", bFlag);

		if (this._oZoomInButton) {
			this._oZoomInButton.setVisible(bFlag);
		}
		if (this._oZoomOutButton) {
			this._oZoomOutButton.setVisible(bFlag);
		}
		return this;
	};

	/**
	 * Sets the full screen button visibility state.
	 *
	 * @param {boolean} bFlag true to display the fullscreen button
	 */
	SmartChart.prototype.setShowFullScreenButton = function(bFlag) {
		this.setProperty("showFullScreenButton", bFlag);
		if (this.oFullScreenButton) {
			this.oFullScreenButton.setVisible(bFlag);
		}
		return this;
	};
	/**
	 * Sets the chart legend visibility state.
	 *
	 * @param {boolean} bFlag true to display the chart legend
	 */
	SmartChart.prototype.setLegendVisible = function(bFlag) {

		this.setProperty("legendVisible", bFlag);

		this._setLegendVisible(bFlag);
		return this;
	};

	/**
	 * Sets the chart legend visibility state.
	 *
	 * @param {boolean} bFlag true to display the chart legend
	 * @private
	 */
	SmartChart.prototype._setLegendVisible = function(bFlag) {

		var oVizFrame = this._getVizFrame();
		if (oVizFrame) {
			oVizFrame.setLegendVisible(bFlag);
		}

	};

	/**
	 * Returns the charts _vizFrame aggregation.
	 *
	 * @returns {object} charts _vizFrame aggregation object
	 * @private
	 */
	SmartChart.prototype._getVizFrame = function() {

		var oVizFrame = null;
		if (this._oChart) {
			oVizFrame = this._oChart.getAggregation("_vizFrame");
		}

		return oVizFrame;
	};

	/**
	 * adds the legend button to the toolbar
	 *
	 * @private
	 */
	SmartChart.prototype._addLegendButton = function() {

		var that = this;
		this._oLegendButton = new OverflowToolbarToggleButton(this.getId() + "-btnLegend", {
			type: "Transparent",
			text: this._oRb.getText("CHART_LEGENDBTN_TEXT"),
			tooltip: this._oRb.getText("CHART_LEGENDBTN_TOOLTIP"),
			icon: "sap-icon://legend",
			press: function() {
				that.setLegendVisible(!that.getLegendVisible());
				this.setPressed(that.getLegendVisible());
			},
			pressed: this.getLegendVisible(),
			visible: this.getShowLegendButton(),
			enabled: false
		});

		this._oToolbar.addContent(this._oLegendButton);
	};

	/**
	 * Sets the legend button visibility state.
	 *
	 * @param {boolean} bFlag true to display the legend button
	 */
	SmartChart.prototype.setShowLegendButton = function(bFlag) {

		this.setProperty("showLegendButton", bFlag);

		if (this._oLegendButton) {
			this._oLegendButton.setVisible(bFlag);
		}
		return this;
	};

	/**
	 * Sets the semantic navigation button visibility state.
	 *
	 * @param {boolean} bFlag true to display the semantic navigation button
	 */
	SmartChart.prototype.setShowSemanticNavigationButton = function(bFlag) {

		this.setProperty("showSemanticNavigationButton", bFlag);

		if (this._oSemanticalNavButton) {
			this._oSemanticalNavButton.setVisible(bFlag);
		} else {
			/* eslint-disable no-lonely-if */
			if (bFlag) {
				this._addSemanticNavigationButton();
			}
			/* eslint-enable no-lonely-if */
		}
		return this;
	};

	/**
	 * adds the semantical navigation button to the toolbar
	 *
	 * @private
	 */
	SmartChart.prototype._addSemanticNavigationButton = function() {
		var that = this/*, aSemanticObjects*/;

		if (!this._oSemanticalNavButton && this.getShowSemanticNavigationButton() && this._oToolbar) {
			this._oSemanticalNavButton = new Button(this.getId() + "-btnNavigation", {
				type: "Transparent",
				text: this._oRb.getText("CHART_SEMNAVBTN"),
				tooltip: this._oRb.getText("CHART_SEMNAVBTN_TOOLTIP"),
				visible: this.getShowSemanticNavigationButton(),
				enabled: false
			});

			this._oNavHandler = new NavigationPopoverHandler({
				control: this._oSemanticalNavButton,
				navigationTargetsObtained: function(oEvent) {
					var oMainNavigation = oEvent.getParameters().mainNavigation;
					// 'mainNavigation' might be undefined
					if (oMainNavigation) {
						var oData = oEvent.getSource().getBindingContext().getObject();
						var oField = this._getField(oEvent.getSource().getFieldName());
						var oTexts = FormatUtil.getTextsFromDisplayBehaviour(oField.displayBehaviour, oData[oField.name], oData[oField.description]);
						oMainNavigation.setDescription(oTexts.secondText);
						oEvent.getParameters().show(oTexts.firstText, oMainNavigation, undefined, undefined);
					}
					oEvent.getParameters().show();
				}.bind(this)
			});

			var oSemanticObjectController = this.getSemanticObjectController();
			if (oSemanticObjectController) {
				this._oNavHandler.setSemanticObjectController(oSemanticObjectController);
			}

			this._oSemanticalNavButton.attachPress(function(oEvent) {

				if (this._aSemanticObjects && (this._aSemanticObjects.length > 0)) {

					if (this._aSemanticObjects.length === 1) {
						var oSemanticObjects = MetadataAnalyser.getSemanticObjectsFromProperty(this._aSemanticObjects[0]);
						if (oSemanticObjects) {
							this._oNavHandler.setFieldName(this._aSemanticObjects[0].name);
							this._oNavHandler.setSemanticObject(oSemanticObjects.defaultSemanticObject);
							this._oNavHandler.setAdditionalSemanticObjects(oSemanticObjects.additionalSemanticObjects);
							this._oNavHandler.openPopover();
						}
					} else {
						that._semanticObjectList(this._aSemanticObjects, this._oNavHandler);
					}
				}
			}.bind(this));
			//TODO: Outsourced to _attachDataPointHandling because we changed time of creation of inner chart
			//TODO: Keep for now, to make sure the new setup works like expected by applications
			/*if (this._oChart) {

				this._oChart.attachDeselectData(function() {
					this._aSemanticObjects = that._setSelectionDataPointHandling(this._oNavHandler );
				});

				this._oChart.attachSelectData(function() {
					this._aSemanticObjects = that._setSelectionDataPointHandling(this._oNavHandler );
				});
			}*/

			if (this._oChart) {
				// In cases where button gets enabled at a later point in time
				this._attachDataPointHandling();
			} else {
				this.attachInitialized(function() {
					//Async when inner chart isn't created yet
					this._attachDataPointHandling();
				}.bind(this));
			}
			var iSpacerIdx = this._indexOfSpacerOnToolbar();
			this._oToolbar.insertContent(this._oSemanticalNavButton, iSpacerIdx + 1);
		}
	};
	/**
	 * Attach the datapoint selection of inner chart to our semantic object handling
	 * onces the inner chart is created.
	 *
	 * @private
	 */
	SmartChart.prototype._attachDataPointHandling = function() {
		if (this._oChart) {

			this._oChart.attachDeselectData(function() {
				this._aSemanticObjects = this._setSelectionDataPointHandling(this._oNavHandler);
			}.bind(this));

			this._oChart.attachSelectData(function() {
				this._aSemanticObjects = this._setSelectionDataPointHandling(this._oNavHandler);
			}.bind(this));
		}
	};
	/**
	 * sets the selectionMode for datapoint selection.
	 *
	 * @param {sap.chart.SelectionMode} selectionMode SINGLE, MULTI or NONE
	 */
	SmartChart.prototype.setSelectionMode = function(selectionMode) {
		this.setProperty("selectionMode", selectionMode);
		if (this._oChart) {
			this._oChart.setSelectionMode(selectionMode);
		}
		return this;
	};

	/**
	 * Sets the handling of selected data points in order to resolve a semantical object when semantic navigation button is pressed
	 *
	 * @param {sap.ui.comp.navpopover.NavigationPopoverHandler} oNavHandler The navigation handler for the semantical object navigation
	 * @returns {array} The semantic objects for selected data points
	 * @private
	 */
	SmartChart.prototype._setSelectionDataPointHandling = function(oNavHandler) {
		var aSemanticObjects = this._setSelectionDataPoint(oNavHandler);
		if (aSemanticObjects && aSemanticObjects.length > 0) {
			this._oSemanticalNavButton.setEnabled(true);
		} else {
			this._oSemanticalNavButton.setEnabled(false);
		}

		return aSemanticObjects;
	};

	/**
	 * Sets the semantical object context for each selected data point when details button is used
	 *
	 * @param {object} oEvent The event arguments
	 * @returns {array} The semantic objects for selected data points
	 * @private
	 */
	SmartChart.prototype._setSemanticObjectsContext = function(oEvent) {
		var oDataContext, oData, aSemanticObjects = null;

		// Get binding context
		// selectionDetails implementation
		oDataContext = oEvent.getParameter("item").getBindingContext();

		if (oDataContext) {
			// Get data object from context
			oData = oDataContext.getObject();
			if (oData) {
				// Retrieve semantical objects
				aSemanticObjects = this._determineSemanticObjectsforDetailsPopover(oData, oDataContext);
			}
		}
		return aSemanticObjects;
	};

	/**
	 * Sets the semantical object context for each selected data point when semantical nav button is used
	 *
	 * @param {sap.ui.comp.navpopover.NavigationPopoverHandler} oNavHandler The navigation handler for the semantical object navigation
	 * @returns {array} The semantic objects for selected data points
	 * @private
	 */
	SmartChart.prototype._setSelectionDataPoint = function(oNavHandler) {
		var oDataContext, oData, aSemanticObjects = null, aDataContext;

		var aSelectedDataPoints = this._oChart.getSelectedDataPoints();

		if (!aSelectedDataPoints || !aSelectedDataPoints.dataPoints || (aSelectedDataPoints.dataPoints.length === 0)) {
			return aSemanticObjects;
		}

		if (aSelectedDataPoints.dataPoints.length === 1) {
			oDataContext = aSelectedDataPoints.dataPoints[0].context;
			if (oDataContext) {
				oData = oDataContext.getObject();

				if (oData) {
					aSemanticObjects = this._determineSemanticObjects(oData, oDataContext);
					if (aSemanticObjects && (aSemanticObjects.length > 0)) {
						oNavHandler.setBindingContext(oDataContext);
					}
				}
			}

			return aSemanticObjects;
		}

		aDataContext = [];
		for (var i = 0; i < aSelectedDataPoints.dataPoints.length; i++) {
			oDataContext = aSelectedDataPoints.dataPoints[i].context;
			if (oDataContext) {
				oData = oDataContext.getObject();

				if (oData) {
					aDataContext.push(oData);
				}
			}
		}

		if (aDataContext && aDataContext.length > 0) {
			aSemanticObjects = this._condensBasedOnSameValue(aDataContext);
			if (aSemanticObjects && aSemanticObjects.length > 0) {
				oNavHandler.setBindingContext(aSelectedDataPoints.dataPoints[aSelectedDataPoints.dataPoints.length - 1].context);
			}
		}

		return aSemanticObjects;
	};

	/**
	 * Condenses data point contexts which are based on same values.
	 *
	 * @param {array} aData The data contexts of selected data points
	 * @returns {array} The semantic objects for selected data points
	 * @private
	 */
	SmartChart.prototype._condensBasedOnSameValue = function(aData) {

		var aSemObj = null, aResultSemObj, oSemObj, sName;

		// expectation: all datapoint have the same semantical objects
		aSemObj = this._determineSemanticObjects(aData[0]);

		if (aSemObj && aSemObj.length > 0) {
			for (var i = 0; i < aSemObj.length; i++) {
				oSemObj = aSemObj[i];
				sName = oSemObj.name;

				if (this._bAllValuesAreEqual(aData, sName)) {
					if (!aResultSemObj) {
						aResultSemObj = [];
					}

					aResultSemObj.push(oSemObj);
				}
			}
			aSemObj = aResultSemObj;
		}
		return aSemObj;
	};
	/**
	 * Checks if all values of a data point context are equal.
	 *
	 * @param {array} aData The data contexts of selected data points
	 * @param {string} sFieldName The field name against whose value should be checked
	 * @returns {boolean} True if all values are equals, false otherwise
	 * @private
	 */
	SmartChart.prototype._bAllValuesAreEqual = function(aData, sFieldName) {
		var oData, sValue;
		for (var i = 0; i < aData.length; i++) {
			oData = aData[i];

			if (i === 0) {
				sValue = oData[sFieldName];
				continue;
			}
			if (sValue != oData[sFieldName]) {
				return false;
			}
		}
		return true;
	};

	/**
	 * Creates a semantical object list for selected data points which resolve in more than one semantical object when semantical nav button is used.
	 *
	 * @param {array} aSemanticObjects The semantical objects for a selected data point
	 * @param {sap.ui.comp.navpopover.NavigationPopoverHandler} oNavHandler The navigation handler for the semantical object navigation
	 * @private
	 */
	SmartChart.prototype._semanticObjectList = function(aSemanticObjects, oNavHandler) {

		var oPopover, oList, oListItem, oSemanticObject;

		if (this._oChart) {

			if ((!ResponsivePopover || !List || !StandardListItem) && !this._bSemanticObjectListRequested) {
				ResponsivePopover = sap.ui.require("sap/m/ResponsivePopover");
				List = sap.ui.require("sap/m/List");
				StandardListItem = sap.ui.require("sap/m/StandardListItem");
				if (!ResponsivePopover || !List || !StandardListItem) {
					sap.ui.require([
						"sap/m/ResponsivePopover", "sap/m/List", "sap/m/StandardListItem"
					], _SemanticObjectListLoaded.bind(this));
					this._bSemanticObjectListRequested = true;
					this._oSemanticObjectListAttr = {
						object: aSemanticObjects,
						nav: oNavHandler
					};
				}
			}

			if (!ResponsivePopover || !List || !StandardListItem) {
				return;
			}

			oList = new List({
				mode: ListMode.SingleSelectMaster,
				selectionChange: function(oEvent) {
					if (oEvent && oEvent.mParameters && oEvent.mParameters.listItem) {
						var oSemanticObjects = oEvent.mParameters.listItem.data("semObj");
						if (oSemanticObjects) {
							oNavHandler.setFieldName(oEvent.mParameters.listItem.data("fieldName"));
							oNavHandler.setSemanticObject(oSemanticObjects.defaultSemanticObject);
							oNavHandler.setAdditionalSemanticObjects(oSemanticObjects.additionalSemanticObjects);
							// control is set to this._oSemanticalNavButton
							oNavHandler.openPopover();
						}
					}
					oPopover.close();
				}
			});

			for (var i = 0; i < aSemanticObjects.length; i++) {
				oSemanticObject = aSemanticObjects[i];
				oListItem = new StandardListItem({
					title: oSemanticObject.fieldLabel,
					type: ListType.Active
				});

				oListItem.data("semObj", MetadataAnalyser.getSemanticObjectsFromProperty(oSemanticObject));
				oListItem.data("fieldName", oSemanticObject.name);
				oList.addItem(oListItem);
			}

			oPopover = new ResponsivePopover({
				title: this._oRb.getText("CHART_SEMNAVBTN"),
				showHeader: false,
				contentWidth: "12rem",
				placement: PlacementType.Left
			});

			oPopover.addContent(oList);
			oPopover.openBy(this._oSemanticalNavButton);
		}
	};

	function _SemanticObjectListLoaded(fnResponsivePopover, fnList, fnStandardListItem) {
		ResponsivePopover = fnResponsivePopover;
		List = fnList;
		StandardListItem = fnStandardListItem;
		this._bSemanticObjectListRequested = false;

		if (!this._bIsBeingDestroyed) {
			this._semanticObjectList(this._oSemanticObjectListAttr.object, this._oSemanticObjectListAttr.nav);
		}

		delete this._oSemanticObjectListAttr;
	}

	/**
	 * Creates a semantical object list for selected data points which resolve in more than one semantical object when details button is used.
	 *
	 * @param {array} aSemanticObjects The semantical objects for a selected data point
	 * @param {object} oContext The binding context of the pressed list item
	 * @returns {sap.m.List} list containing items for the semantical objects for a selected data point
	 * @private
	 */
	SmartChart.prototype._semanticObjectListForDetails = function(aSemanticObjects, oContext) {
		var oList, oListItem, oSemanticObject;
		if (!this._oChart) {
			return undefined;
		}
		oList = new List({
			mode: ListMode.SingleSelectMaster,
			rememberSelections: false,
			itemPress: function(oEvent) {
				if (oEvent && oEvent.mParameters && oEvent.mParameters.listItem) {
					var oSemanticObjects = oEvent.mParameters.listItem.data("semObj");
					if (oSemanticObjects) {
						// TODO: Provide own function for this and also use it in _navigateToSemanticObjectDetails
						var oNavigationHandler = new NavigationPopoverHandler({
							fieldName: oEvent.mParameters.listItem.data("fieldName"),
							control: oEvent.mParameters.listItem,
							semanticObject: oSemanticObjects.defaultSemanticObject,
							additionalSemanticObjects: oSemanticObjects.additionalSemanticObjects,
							navigationTargetsObtained: function(oEvent) {
								var oMainNavigation = oEvent.getParameters().mainNavigation;
								// 'mainNavigation' might be undefined
								if (oMainNavigation) {
									var oData = oContext.getObject();
									var oField = this._getField(oEvent.getSource().getFieldName());
									var oTexts = FormatUtil.getTextsFromDisplayBehaviour(oField.displayBehaviour, oData[oField.name], oData[oField.description]);
									oMainNavigation.setDescription(oTexts.secondText);
									oEvent.getParameters().show(oTexts.firstText, oMainNavigation, undefined, undefined);
								}
								oEvent.getParameters().show();
							}.bind(this)
						});

						oNavigationHandler._getNavigationContainer().then(function(oNavigationContainer) {
							this._oNavigationContainer = oNavigationContainer;

							// Popover with direct link should not be opened.
							var oLink = oNavigationContainer.getDirectLink();
							if (oLink) {
								oNavigationHandler._fireInnerNavigate({
									text: oLink.getText(),
									href: oLink.getHref()
								});
								window.location.href = oLink.getHref();
								// Destroy container with StableID.
								oNavigationContainer.destroy();
								return;
							}
							// Attach link personalization handling
							oNavigationContainer.attachBeforePopoverOpen(function() {
								// set modal to keep selectionDetails popover open during link personalization
								this._oSelectionDetails.setPopoverModal(true);
							}.bind(this));
							oNavigationContainer.attachAfterPopoverClose(function() {
								this._oSelectionDetails.setPopoverModal(false);
							}.bind(this));

							this._oSelectionDetails.navTo("", oNavigationContainer);

						}.bind(this), function(oError) {
							Log.error("NavigationContainer could not be determined: " + oError);
						});
					}
				}
			}.bind(this)
		});

		// Get semantic objects and only create list item when navigation targets are available.
		SemanticObjectController.getDistinctSemanticObjects().then(function(oSemanticObjects) {
			for (var i = 0; i < aSemanticObjects.length; i++) {
				oSemanticObject = aSemanticObjects[i];
				if (oSemanticObject["com.sap.vocabularies.Common.v1.SemanticObject"] && oSemanticObject["com.sap.vocabularies.Common.v1.SemanticObject"].String && SemanticObjectController.hasDistinctSemanticObject([
					oSemanticObject["com.sap.vocabularies.Common.v1.SemanticObject"].String
				], oSemanticObjects)) {

					oListItem = new StandardListItem({
						title: oSemanticObject.fieldLabel,
						type: ListType.Navigation
					});

					oListItem.setBindingContext(oContext);
					oListItem.data("semObj", MetadataAnalyser.getSemanticObjectsFromProperty(oSemanticObject));
					oListItem.data("fieldName", oSemanticObject.name);
					oList.addItem(oListItem);
				}
			}
		});
		return oList;
	};

	/**
	 * Determines the semantical object for a given context of a selected data point.
	 *
	 * @param{object} mData data of a selected data point object
	 * @param{object} oDataContext binding context of a selected data point
	 * @returns {array} semantical objects
	 */
	SmartChart.prototype._determineSemanticObjects = function(mData, oDataContext) {
		var n, oField, aSematicObjects = [];
		if (mData) {
			for (n in mData) {
				if (n) {
					oField = this._getField(n);
					if (oField && oField.isDimension && oField.isSemanticObject) {
						aSematicObjects.push(oField);
					}
				}
			}
		}
		if (aSematicObjects) {
			aSematicObjects.sort(function(a, b) {
				return a.fieldLabel.localeCompare(b.fieldLabel);
			});
		}
		return aSematicObjects;
	};
	/**
	 * Determines the semantical object for a given context of a selected data point.
	 *
	 * @param{object} mData data of a selected data point object
	 * @param{object} oDataContext binding context of a selected data point
	 * @returns {array} semantical objects
	 */
	SmartChart.prototype._determineSemanticObjectsforDetailsPopover = function(mData, oDataContext) {

		var n, oField, aSematicObjects = [];
		if (mData) {
			for (n in mData) {
				if (n) {
					oField = this._getField(n);
					if (oField && oField.isDimension && oField.isSemanticObject) {
						aSematicObjects.push(oField);
					}
				}
			}
		}
		if (aSematicObjects) {
			aSematicObjects.sort(function(a, b) {
				return a.fieldLabel.localeCompare(b.fieldLabel);
			});
		}
		return aSematicObjects;
	};

	/**
	 * Adds the drill-up and drill-down button to the toolbar
	 *
	 * @private
	 */
	SmartChart.prototype._addDrillUpDownButtons = function() {

		if (this.getShowDrillButtons()) {

			var that = this;

			this._oDrillUpButton = new OverflowToolbarButton(this.getId() + "-btnDrillUp", {
				type: "Transparent",
				tooltip: this._oRb.getText("CHART_DRILLUPBTN_TOOLTIP"),
				text: this._oRb.getText("CHART_DRILLUPBTN_TEXT"),
				icon: "sap-icon://drill-up",
				press: function() {
					if (that._oChart) {
						that._oChart.drillUp();
					}
				},
				visible: !this.getShowDrillBreadcrumbs(),
				enabled: false
			});

			this._oDrillDownButton = new OverflowToolbarButton(this.getId() + "-btnDrillDown", {
				type: "Transparent",
				text: this._oRb.getText("CHART_DRILLDOWNBTN_TEXT"),
				icon: "sap-icon://drill-down",
				press: function(oEvent) {
					that._drillDown(oEvent);
				},
				visible: !this.getShowDetailsButton(),
				enabled: false,
				ariaHasPopup: AriaHasPopup.ListBox

			});
			this._oToolbar.addContent(this._oDrillUpButton);
			this._oToolbar.addContent(this._oDrillDownButton);
		}
	};
	/**
	 * Adds the drill-down text button to the toolbar This button only is visible together with selectionDetails control.
	 *
	 * @private
	 */
	SmartChart.prototype._addDrillDownTextButton = function() {

		this._oDrillDownTextButton = new Button(this.getId() + "-btnDrillDownText", {
			type: "Transparent",
			text: this._oRb.getText("CHART_DRILLDOWNBTN_TEXT"),
			tooltip: this._oRb.getText("CHART_DRILLDOWNBTN_TOOLTIP"),
			enabled: false,
			visible: this.getShowDetailsButton(),// show only when selectionDetails is used
			//Keep OverflowToolbar open during interaction
			layoutData: new OverflowToolbarLayoutData({
				closeOverflowOnInteraction: false
			}),
			press: function(oEvent) {
				this._drillDown(oEvent);
			}.bind(this),
			ariaHasPopup: AriaHasPopup.ListBox
		});

		this._oToolbar.addContent(this._oDrillDownTextButton);
	};

	/**
	 * Sets the drill-up button and drill-down button visibility state
	 *
	 * @param {boolean} bFlag true to display the drill-up and drill-down buttons, false otherwise
	 */
	SmartChart.prototype.setShowDrillButtons = function(bFlag) {

		this.setProperty("showDrillButtons", bFlag);

		if (this._oDrillUpButton) {
			this._oDrillUpButton.setVisible(bFlag);
		}
		if (this._oDrillDownButton) {
			this._oDrillDownButton.setVisible(bFlag);
		}
		return this;
	};

	/**
	 * Triggers a search in the drill-down popover
	 *
	 * @param {object} oEvent The event arguments
	 * @param {sap.m.List} oList The list to search in
	 * @private
	 */
	SmartChart.prototype._triggerSearchInPopover = function(oEvent, oList) {

		var parameters, i, sTitle, sTooltip, sValue, aItems;

		if (!oEvent || !oList) {
			return;
		}

		parameters = oEvent.getParameters();
		if (!parameters) {
			return;
		}

		sValue = parameters.newValue ? parameters.newValue.toLowerCase() : "";

		if (this._oChart) {
			aItems = oList.getItems();
			for (i = 0; i < aItems.length; i++) {

				sTooltip = aItems[i].getTooltip();
				sTitle = aItems[i].getTitle();

				if ((sTitle && (sTitle.toLowerCase().indexOf(sValue) > -1)) || (sTooltip && (sTooltip.toLowerCase().indexOf(sValue) > -1))) {
					aItems[i].setVisible(true);
				} else {
					aItems[i].setVisible(false);
				}
			}
		}
	};

	/**
	 * Opens the drill-down popover and shows a list of available dimensions for drilling in.
	 *
	 * @param {object} oEvent The event arguments
	 * @param {object} oSource The source of the drill down, only used in case of asynchrounus loading
	 * @private
	 */
	SmartChart.prototype._drillDown = function(oEvent, oSource) {

		var that = this, oPopover, aIgnoreDimensions, aDimensions, oDimension, oListItem, oList, oSubHeader, oSearchField, i, /*sTooltip,*/ oViewField, oInvTextSearch;

		if (this._oChart) {
			if ((!ResponsivePopover || !List || !Bar || !SearchField || !StandardListItem) && !this._bDrillDownRequested) {
				ResponsivePopover = sap.ui.require("sap/m/ResponsivePopover");
				List = sap.ui.require("sap/m/List");
				Bar = sap.ui.require("sap/m/Bar");
				SearchField = sap.ui.require("sap/m/SearchField");
				StandardListItem = sap.ui.require("sap/m/StandardListItem");
				if (!ResponsivePopover || !List || !Bar || !SearchField || !StandardListItem) {
					sap.ui.require([
						"sap/m/ResponsivePopover", "sap/m/List", "sap/m/Bar", "sap/m/SearchField", "sap/m/StandardListItem"
					], _DrillDownLoaded.bind(this));
					this._bDrillDownRequested = true;
					this._oDrillDownSource = oEvent.getSource();
				}
			}

			if (!ResponsivePopover || !List || !Bar || !SearchField || !StandardListItem) {
				return;
			}

			oList = new List({
				mode: ListMode.SingleSelectMaster,
				selectionChange: function(oEvent) {
					if (oEvent && oEvent.mParameters && oEvent.mParameters.listItem) {

						if (oEvent.mParameters.listItem.getType() === ListType.Inactive) {
							return;
						}

						var oDimension = oEvent.mParameters.listItem.data("dim");
						if (oDimension) {
							that._oChart.drillDown(oDimension);
						}
					}

					oPopover.close();
				}
			});

			oSubHeader = new Bar();
			oSearchField = new SearchField({
				placeholder: this._oRb.getText("CHART_DRILLDOWN_SEARCH")
			});
			var oInvText = new InvisibleText({
				text: this._oRb.getText("CHART_DRILLDOWN_SEARCH")
			});
			//oSearchField.addContent(oInvText);
			oSearchField.addAriaLabelledBy(oInvText.getId());
			oSearchField.attachLiveChange(function(oEvent) {
				that._triggerSearchInPopover(oEvent, oList);
			});
			oSubHeader.addContentMiddle(oInvText);
			oSubHeader.addContentMiddle(oSearchField);

			oPopover = new ResponsivePopover({
				contentWidth: "25rem",
				contentHeight: "20rem",
				placement: PlacementType.Bottom,
				subHeader: oSubHeader
			});

			oPopover.addStyleClass("sapUiCompSmartChartDrillDownPopover");

			//Show header only in mobile scenarios
			//still support screen reader while on desktops.
			if (Device.system.desktop) {
				var oInvText = new InvisibleText({
					text: this._oRb.getText("CHART_DRILLDOWN_TITLE")
				});
				oPopover.setShowHeader(false);
				oPopover.addContent(oInvText);
				oPopover.addAriaLabelledBy(oInvText);

				if (oPopover.getSubHeader() && oPopover.getSubHeader().getVisible() && oSearchField.getVisible() && oSearchField.getEnabled()) {
					oInvTextSearch = new InvisibleText({
						text: this._oRb.getText("CHART_DRILLDOWN_SEARCH_AVAILABLE")
					});
					oPopover.addContent(oInvTextSearch);
					oPopover.addAriaLabelledBy(oInvTextSearch);
				}
			} else {
				oPopover.setTitle(this._oRb.getText("CHART_DRILLDOWN_TITLE"));
			}

			oPopover.addContent(oList);


			// Get currently applied dimensions from drill-stack
			aIgnoreDimensions = this._getDrillStackDimensions();
			aDimensions = this._getSortedDimensions();

			if (aDimensions.length < 7) {
				oSubHeader.setVisible(false);
				oInvTextSearch.destroy();
			}

			for (i = 0; i < aDimensions.length; i++) {

				oDimension = aDimensions[i];

				if (aIgnoreDimensions.indexOf(oDimension.getName()) > -1) {
					continue;
				}

				oViewField = this._oChartProvider.getViewField(oDimension.getName());

				// If dimension is not filterable and datapoints are selected then skip
				if (!oViewField.filterable && this._oChart.getSelectedDataPoints().count > 0) {
					continue;
				}

				oListItem = new StandardListItem({
					title: oDimension.getLabel(),
					type: ListType.Active
				});

				oListItem.data("dim", oDimension);
				//Disable tooltips based on ACC BCP incident 2280103677
				/*sTooltip = this._getFieldTooltip(oDimension.getName());
				if (sTooltip) {
					oListItem.setTooltip(sTooltip);
				}*/

				oList.addItem(oListItem);
			}
			oPopover.openBy(oEvent ? oEvent.getSource() : oSource);
		}
	};

	function _DrillDownLoaded(fnResponsivePopover, fnList, fnBar, fnSearchField, fnStandardListItem) {
		ResponsivePopover = fnResponsivePopover;
		List = fnList;
		Bar = fnBar;
		SearchField = fnSearchField;
		StandardListItem = fnStandardListItem;
		this._bDrillDownRequested = false;

		if (!this._bIsBeingDestroyed) {
			this._drillDown(null, this._oDrillDownSource);
		}

		delete this._oDrillDownSource;
	}

	/**
	 * Navigates to the semantic object directly or to a list of available semantic objects of one details entry within the details popover
	 *
	 * @param {object} oEvent The event arguments
	 * @private
	 */
	SmartChart.prototype._navigateToSemanticObjectDetails = function(oEvent) {

		// update semantic objects based on details item press
		var aSemanticObjects = this._setSemanticObjectsContext(oEvent);

		if (aSemanticObjects && (aSemanticObjects.length > 0)) {

			if (aSemanticObjects.length === 1) {
				var oSemanticObjects = MetadataAnalyser.getSemanticObjectsFromProperty(aSemanticObjects[0]);
				if (oSemanticObjects) {
					var oControl = oEvent.getParameter("item");
					var oNavigationHandler = new NavigationPopoverHandler({
						fieldName: aSemanticObjects[0].name,
						control: oControl, // Pass pressed item to use its binding context
						semanticObject: oSemanticObjects.defaultSemanticObject,
						additionalSemanticObjects: oSemanticObjects.additionalSemanticObjects,
						navigationTargetsObtained: function(oEvent_) {
							var oMainNavigation = oEvent_.getParameters().mainNavigation;
							// 'mainNavigation' might be undefined
							if (oMainNavigation) {
								var oData = oControl.getBindingContext().getObject();
								var oField = this._getField(oEvent_.getSource().getFieldName());
								var oTexts = FormatUtil.getTextsFromDisplayBehaviour(oField.displayBehaviour, oData[oField.name], oData[oField.description]);
								oMainNavigation.setDescription(oTexts.secondText);
								oEvent_.getParameters().show(oTexts.firstText, oMainNavigation, undefined, undefined);
							}
							oEvent_.getParameters().show();
						}.bind(this)
					});

					oNavigationHandler._getNavigationContainer().then(function(oNavigationContainer) {
						this._oNavigationContainer = oNavigationContainer;

						// Attach link personalization handling
						this._oNavigationContainer.attachBeforePopoverOpen(function() {
							// set modal to keep selectionDetails popover open during link personalization
							this._oSelectionDetails.setPopoverModal(true);
						}.bind(this));
						this._oNavigationContainer.attachAfterPopoverClose(function() {
							this._oSelectionDetails.setPopoverModal(false);
						}.bind(this));

						// Navigate to semantic details page
						this._oSelectionDetails.navTo("", this._oNavigationContainer);

					}.bind(this), function(oError) {
						Log.error("NavigationContainer could not be determined");
					});
				}
			} else {
				var oContext = oEvent.getParameter("item").getBindingContext();
				// Call this function if we use the details section instead of the button for semantic navigation
				if ((!List || !StandardListItem) && !this._bObjectListRequested) {
					List = sap.ui.require("sap/m/List");
					StandardListItem = sap.ui.require("sap/m/StandardListItem");
					if (!List || !StandardListItem) {
						sap.ui.require([
							"sap/m/List", "sap/m/StandardListItem"
						], _ObjectListLoaded.bind(this));
						this._bObjectListRequested = true;
						this._oObjectListAttr = {
							context: oContext,
							objects: aSemanticObjects
						};
					}
				}

				if (List && StandardListItem) {
					var oList = this._semanticObjectListForDetails(aSemanticObjects, oContext);
					this._oSelectionDetails.navTo(this._oRb.getText("CHART_SEMNAVBTN"), oList);
				}
			}
		}

	};

	function _ObjectListLoaded(fnList, fnStandardListItem) {
		List = fnList;
		StandardListItem = fnStandardListItem;
		this._bObjectListRequested = false;

		if (!this._bIsBeingDestroyed) {
			var oList = this._semanticObjectListForDetails(this._oObjectListAttr.objects, this._oObjectListAttr.context);
			this._oSelectionDetails.navTo(this._oRb.getText("CHART_SEMNAVBTN"), oList);
		}

		delete this._oObjectListAttr;
	}

	/**
	 * adds the header line to the toolbar
	 *
	 * @private
	 */
	SmartChart.prototype._addHeaderToToolbar = function() {

		if (this._oToolbar) {
			if (!this._headerText) {
				this._headerText = new Title({});
				this._headerText.addStyleClass("sapMH4Style");
				this._headerText.addStyleClass("sapUiCompSmartChartHeader");
			}
			this._refreshHeaderText();
			this._oToolbar.insertContent(this._headerText, 0);
		}
	};

	/**
	 * adds a separator between header and variantmanagement to the toolbar
	 *
	 * @private
	 */
	SmartChart.prototype._addSeparatorToToolbar = function() {

		if (this.getUseVariantManagement() && this._oVariantManagement && !this._oVariantManagement.isPageVariant()) {
				this._oSeparator = new ToolbarSeparator();
				this._oToolbar.insertContent(this._oSeparator, 0);
				// Also set the height to 3rem when no height is explicitly specified
				if (!this._oToolbar.getHeight()) {
					this._oToolbar.setHeight("auto");
				}
		} else if (this._oSeparator) {
			this._oToolbar.removeContent(this._oSeparator);
		}
	};

	/**
	 * adds the VarientManagement to the toolbar
	 *
	 * @private
	 */
	SmartChart.prototype._addVariantManagementToToolbar = function() {

		if (this._oVariantManagement && !this._oVariantManagement.isPageVariant()) {

			if (this.getUseVariantManagement()) {
				this._oToolbar.insertContent(this._oVariantManagement, 0);
			} else if (this._oVariantManagement) {
				this._oToolbar.removeContent(this._oVariantManagement);
			}
		}
	};

	/**
	 * adds a spacer to the toolbar
	 *
	 * @private
	 */
	SmartChart.prototype._addSpacerToToolbar = function() {
		if (this._indexOfSpacerOnToolbar() === -1) {
			this._oToolbar.addContent(new ToolbarSpacer());
		}
	};

	SmartChart.prototype._indexOfSpacerOnToolbar = function() {
		var aItems = this._oToolbar.getContent(), i, iLength;
		if (aItems) {
			iLength = aItems.length;
			i = 0;
			for (i; i < iLength; i++) {
				if (aItems[i] instanceof ToolbarSpacer) {
					return i;
				}
			}
		}
		return -1;
	};


	SmartChart.prototype._getP13NSettings = function() {
		return {
			dimeasure: {
				visible: true,
				payload: {
					availableChartTypes: this.getAvailableChartTypes()
				}
			},
			sort: {
				visible: true
			},
			filter: {
				visible: true
			},
			contentWidth: "48rem"
		};
	};

	/**
	 * adds the Personalisation button to the toolbar
	 *
	 * @private
	 */
	SmartChart.prototype._addPersonalisationToToolbar = function() {
		if (this.getUseChartPersonalisation()) {
			if (!this._oChartPersonalisationButton) {
				this._oChartPersonalisationButton = new OverflowToolbarButton(this.getId() + "-btnPersonalisation", {
					type: "Transparent",
					icon: "sap-icon://action-settings",
					text: this._oRb.getText("CHART_PERSOBTN_TEXT"),
					tooltip: this._oRb.getText("CHART_PERSOBTN_TOOLTIP"),
					press: function(oEvent) {
						if (this._oPersController) {
							this._oPersController.openDialog(this._getP13NSettings());
						}
					}.bind(this),
					enabled: false

				});

				ShortcutHintsMixin.addConfig(this._oChartPersonalisationButton, {
					addAccessibilityLabel: true,
					messageBundleKey: Device.os.macintosh ?  "SMARTTABLE_SHORTCUT_SHOW_SETTINGS_MAC" : "SMARTTABLE_SHORTCUT_SHOW_SETTINGS" // Cmd+, or Ctrl+,
				}, this);
			}

			this._oToolbar.addContent(this._oChartPersonalisationButton);
		} else if (this._oChartPersonalisationButton) {
			this._oToolbar.removeContent(this._oChartPersonalisationButton);
		}
	};

	SmartChart.prototype.onkeydown = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}

		if ((oEvent.metaKey || oEvent.ctrlKey) && oEvent.which === KeyCodes.COMMA) {
			// CTRL (or Cmd) + COMMA key combination to open the table personalisation dialog
			var oSettingsBtn = this._oChartPersonalisationButton;
			if (oSettingsBtn && oSettingsBtn.getVisible() && oSettingsBtn.getEnabled()) {
				oSettingsBtn.firePress();

				oEvent.setMarked();
				oEvent.preventDefault();
			}

		}
	};

	/**
	 * Returns the associated SmartVariantManagement control.
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta
	 * @returns {sap.ui.comp.smartvariants.SmartVariantManagement} the associated SmartVariantManagement control, if any.
	 */
	SmartChart.prototype.getVariantManagement = function() {
		return this._oVariantManagement;
	};

	/**
	 * Opens the View Settings Dialog for the UI adaptation.
	 * <br><b>Note:</b> This function must only be used internally during the UI adaptation.
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta
	 *
	 * @param {string} sStyleClass indicating the ui adaption area
	 * @param {function} fCallBack will be executed, once the dialog closes.
	 */
	SmartChart.prototype.openDialogForKeyUser = function(sStyleClass, fCallBack) {
		this._fGetDataForKeyUser = fCallBack;

		var mSettings = this._getP13NSettings();
		mSettings.styleClass = sStyleClass;
		mSettings.showReset = false;

		this._oPersController.openDialog(mSettings);
	};

	SmartChart.prototype._cleanUpKeyUser = function() {
		this._fGetDataForKeyUser = null;
	};

	SmartChart.prototype._createKeyUserChange = function() {

		return [{
			selectorControl: this._oVariantManagement._getPersoController(),
			changeSpecificData: {
				changeType: "variantContent",
				content: {
					key: this._oVariantManagement.getSelectionKey(),
					persistencyKey: this.getPersistencyKey(),
					content: this.fetchVariant()
				}
			}
		}];
	};

	/**
	 * Adds the chart type button to the toolbar
	 *
	 * @private
	 */
	SmartChart.prototype._addChartTypeToToolbar = function() {
		// Use a OverflowToolbarButton regarding new UX re-design
		this._oChartTypeButton = this._createChartTypeButton();
		this._oToolbar.addContent(this._oChartTypeButton);
	};

	/**
	 * Creates a OverflowToolbarButton for selecting a specific chart type.
	 *
	 * @returns {sap.m.SegementedButton} The segmented button for chart type selection
	 * @private
	 */
	SmartChart.prototype._createChartTypeButton = function() {
		// Create a button for selecting chart types
		var oChartTypeButton = new OverflowToolbarButton(this.getId() + "-btnChartType", {
			visible: this.getShowChartTypeSelectionButton(),
			enabled: false,
			type: "Transparent",
			text: this._oRb.getText("CHART_TYPEBTN_TEXT"),
			ariaHasPopup: AriaHasPopup.ListBox,
			//Keep OverflowToolbar open during interaction
			layoutData: new OverflowToolbarLayoutData({
				closeOverflowOnInteraction: false
			}),
			press: function(oEvent) {
				this._displayChartTypes(oEvent);
			}.bind(this)
		});
		// Initial enrichment of button
		//this._enrichPassedButton(oChartTypeButton, this._oChart.getChartType());

		return oChartTypeButton;
	};

	/**
	 * Displays a popover which shows all available chart types
	 *
	 * @param {object} oEvent The event arguments
	 * @param {object} oSource The source of the drill down, only used in case of asynchrounus loading
	 * @private
	 */
	SmartChart.prototype._displayChartTypes = function(oEvent, oSource) {

		var that = this, oPopover, oList, oSubHeader, oSearchField, bDoNotUpdate = false;

		if (this._bAvailableChartListIsOpen) {
			return;
		}

		if (this._oChart && (oEvent || oSource)) {

			if ((!ResponsivePopover || !List || !Bar || !SearchField || !StandardListItem) && !this._bChartTypesRequested) {
				ResponsivePopover = sap.ui.require("sap/m/ResponsivePopover");
				List = sap.ui.require("sap/m/List");
				Bar = sap.ui.require("sap/m/Bar");
				SearchField = sap.ui.require("sap/m/SearchField");
				StandardListItem = sap.ui.require("sap/m/StandardListItem");
				if (!ResponsivePopover || !List || !Bar || !SearchField || !StandardListItem) {
					sap.ui.require([
						"sap/m/ResponsivePopover", "sap/m/List", "sap/m/Bar", "sap/m/SearchField", "sap/m/StandardListItem"
					], _ChartTypesLoaded.bind(this));
					this._bChartTypesRequested = true;
					this._oChartTypesSource = oEvent.getSource();
				}
			}

			if (!ResponsivePopover || !List || !Bar || !SearchField || !StandardListItem) {
				return;
			}

			var oButton = oEvent ? oEvent.getSource() : oSource;

			var oItemTemplate = new StandardListItem({
				title: "{$smartChartTypes>text}",
				icon: "{$smartChartTypes>icon}",
				selected: "{$smartChartTypes>selected}"
			});

			oList = new List({
				mode: ListMode.SingleSelectMaster,
				items: {
					path: "$smartChartTypes>/items",
					template: oItemTemplate
				},
				selectionChange: function(oEvent) {
					if (oEvent && oEvent.mParameters && oEvent.mParameters.listItem) {
						var oBinding = oEvent.mParameters.listItem.getBinding("title");
						if (oBinding) {
							var oCtx = oBinding.getContext();
							if (oCtx) {
								var oObj = oCtx.getObject();
								if (oObj && oObj.key) {
									// Set the chart type on the inner chart
									that._setChartType(oObj.key);
									// update the chart type buttons icon and tooltip
									that._enrichPassedButton(that._oChartTypeButton, that._oChart.getChartType());
								}
							}
						}
					}
					bDoNotUpdate = true;
					//Trigger baseSize change and rerender when type was changed.
					that._rerenderControlInFullscreen();
					oPopover.close();
				}
			});

			oSubHeader = new Bar();
			oSearchField = new SearchField({
				placeholder: this._oRb.getText("CHART_TYPE_SEARCH")
			});
			oSearchField.attachLiveChange(function(oEvent) {
				that._triggerSearchInPopover(oEvent, oList);
			});
			oSubHeader.addContentRight(oSearchField);

			oPopover = new ResponsivePopover({
				placement: PlacementType.Bottom,
				subHeader: oSubHeader,
				contentWidth: "25rem"
			});

			oPopover.addStyleClass("sapUiCompSmartChartTypePopover");

			oPopover.attachAfterClose(function(oEvent) {
				if (!bDoNotUpdate) {
					// that._updateVisibilityOfChartTypes(that._oChartTypeButton);
				}
				that._bAvailableChartListIsOpen = false;
			});

			oPopover.setModel(this.getModel("$smartChartTypes"), "$smartChartTypes");

			//Show header only in mobile scenarios
			//still support screen reader while on desktops.
			if (Device.system.desktop) {
				var oInvText = new InvisibleText({
					text: this._oRb.getText("CHART_TYPELIST_TEXT")
				});
				oPopover.setShowHeader(false);
				oPopover.addContent(oInvText);
				oPopover.addAriaLabelledBy(oInvText);
			} else {
				oPopover.setTitle(this._oRb.getText("CHART_TYPELIST_TEXT"));
			}

			oPopover.addContent(oList);

			if (oList.getItems().length < 7) {
				oSubHeader.setVisible(false);
			}

			this._bAvailableChartListIsOpen = true;
			oPopover.openBy(oButton);
		}
	};

	function _ChartTypesLoaded(fnResponsivePopover, fnList, fnBar, fnSearchField, fnStandardListItem) {
		ResponsivePopover = fnResponsivePopover;
		List = fnList;
		Bar = fnBar;
		SearchField = fnSearchField;
		StandardListItem = fnStandardListItem;
		this._bChartTypesRequested = false;

		if (!this._bIsBeingDestroyed) {
			this._displayChartTypes(null, this._oChartTypesSource);
		}

		delete this._oChartTypesSource;
	}

	var mMatchingIcon = {
		"bar": "sap-icon://horizontal-bar-chart",
		"bullet": "sap-icon://horizontal-bullet-chart",
		"bubble": "sap-icon://bubble-chart",
		"column": "sap-icon://vertical-bar-chart",
		"combination": "sap-icon://business-objects-experience",
		"dual_bar": "sap-icon://horizontal-bar-chart",
		"dual_column": "sap-icon://vertical-bar-chart",
		"dual_combination": "sap-icon://business-objects-experience",
		"dual_horizontal_combination": "sap-icon://business-objects-experience",
		"dual_horizontal_stacked_combination": "sap-icon://business-objects-experience",
		"dual_line": "sap-icon://line-chart",
		"dual_stacked_bar": "sap-icon://full-stacked-chart",
		"dual_stacked_column": "sap-icon://vertical-stacked-chart",
		"dual_stacked_combination": "sap-icon://business-objects-experience",
		"donut": "sap-icon://donut-chart",
		"heatmap": "sap-icon://heatmap-chart",
		"horizontal_stacked_combination": "sap-icon://business-objects-experience",
		"line": "sap-icon://line-chart",
		"pie": "sap-icon://pie-chart",
		"scatter": "sap-icon://scatter-chart",
		"stacked_bar": "sap-icon://full-stacked-chart",
		"stacked_column": "sap-icon://vertical-stacked-chart",
		"stacked_combination": "sap-icon://business-objects-experience",
		"treemap": "sap-icon://Chart-Tree-Map", // probably has to change
		"vertical_bullet": "sap-icon://vertical-bullet-chart",
		"100_dual_stacked_bar": "sap-icon://full-stacked-chart",
		"100_dual_stacked_column": "sap-icon://vertical-stacked-chart",
		"100_stacked_bar": "sap-icon://full-stacked-chart",
		"100_stacked_column": "sap-icon://full-stacked-column-chart",
		"waterfall": "sap-icon://vertical-waterfall-chart",
		"horizontal_waterfall": "sap-icon://horizontal-waterfall-chart"
	};

	SmartChart.prototype._rerenderControlInFullscreen = function() {
		if (this.bFullScreen) {
			this._oChart.setLayoutData(new FlexItemData({
				baseSize: "100%"
			}));
			//Invalidate inner chart to rerender UI
			//Seems to be needed in order to reflect changes
			this.invalidate(this._oChart);
		}
	};

	/**
	 * Returns a matching icon for a specific chart type
	 *
	 * @param {string} sCharType The chart type
	 * @returns{string} sIcon The icon url
	 * @private
	 */
	SmartChart.prototype._getMatchingIcon = function(sCharType) {
		var sIcon = mMatchingIcon[sCharType];
		if (!sIcon) {
			sIcon = "";
		}

		return sIcon;
	};

	/**
	 * Enriches a passed button with the needed information of the selcted chart type
	 *
	 * @param {sap.m.OverflowToolbarButton} oButton The button which shall be enriched
	 * @param {string} sKey The key of an available chart type
	 * @param {string} sText The text of an available chart type
	 * @private
	 */
	SmartChart.prototype._enrichPassedButton = function(oButton, sKey, sText) {

		if (!oButton) {
			return;
		}

		if (sText === undefined) {

			sText = sKey;
			var oKey = this._retrieveChartTypeDescription(sKey);
			if (oKey && oKey.text) {
				sText = oKey.text;
			}
		}

		oButton.data("chartType", sKey);

		var sSelectedChartTypeIcon = this._getMatchingIcon(sKey);
		oButton.setIcon(sSelectedChartTypeIcon ? sSelectedChartTypeIcon : "sap-icon://vertical-bar-chart");

		var sTextKey = (this._oChart.getChartType() === sKey) ? "CHART_TYPE_TOOLTIP" : "CHART_TYPE_UNSEL_TOOLTIP";
		oButton.setTooltip(this._oRb.getText(sTextKey, [
			sText
		]));
	};

	/**
	 * Updates the available chart types model
	 *
	 * @private
	 */
	SmartChart.prototype._updateAvailableChartType = function() {
		var that = this, oModel, mData, aItems = [];

		oModel = this.getModel("$smartChartTypes");
		if (!oModel) {
			return;
		}

		mData = {
			items: aItems
		};

		var sSelectedChartType = this._oChart.getChartType();

		this.getAvailableChartTypes().forEach(function(chartType) {

			var oItem = {
				key: chartType.key,
				text: chartType.text,
				icon: that._getMatchingIcon(chartType.key),
				selected: sSelectedChartType === chartType.key
			};
			aItems.push(oItem);
		});

		oModel.setData(mData);

		if (this._oSegmentedButton) {
			this._updateVisibilityOfChartTypes(this._oSegmentedButton);
		}
		//Update formatter based on current chartType
		this._updateVizTooltipFormatter();
	};

	/**
	 * creates the personalization controller if not yet done
	 *
	 * @private
	 */
	SmartChart.prototype._createPersonalizationController = function() {
		if (this._oPersController) {
			return;
		}

		var oSettings = this.data("p13nDialogSettings");
		if (typeof oSettings === "string") {
			try {
				oSettings = JSON.parse(oSettings);
			} catch (e) {
				oSettings = null;
				// Invalid JSON!
			}
		}

		oSettings = this._setIgnoreFromPersonalisationToSettings(oSettings);

		oSettings = oSettings || {};

		var oChartWrapper = ChartWrapper.createChartWrapper(this._oChart, this._oChart.data("p13nData"), this._aColumnKeysOrdered);
		if (this.$() && this.$().closest(".sapUiSizeCompact").length > 0) {
			this._oChart.addStyleClass("sapUiSizeCompact");
		}

		var fnSuppressDisabled = this._oChart.setVisibleMeasures;
		var fnSuppressEnabled = function(aMeasureNames, bSuppressInvalidate) {
			this.setProperty("visibleMeasures", aMeasureNames, bSuppressInvalidate);
			var oStackTop = this._getDrillStateTop();
			if (!this._bIsInitialized) {
				this._createDrillStack();
			} else {
				oStackTop.measures = this.getProperty("visibleMeasures");
			}

			if (!bSuppressInvalidate) {
				this._invalidateBy({
					source: this,
					keys: {
						binding: true,
						dataSet: true,
						vizFrame: true
					}
				});
			}

			return this;
		}.bind(this._oChart);

		this._oPersController = new PersoController(this.getId() + "-persoController", {
			table: oChartWrapper,
			setting: oSettings,
			resetToInitialTableState: !this.getUseVariantManagement(),
			afterP13nModelDataChange: this._personalisationModelDataChange.bind(this),
			/**
			 * The inner Chart does not provide the possibility to suppress the invalidation in case some
			 * measures have been udated - currently this always triggers an update in DimeasureController#syncJson2Table
			 * which will trigger an unnecessary request which may not contain the complete result of the PersoControllers
			 * return values. As the inner Chart's suppressInvalidation should not be enabled in general, the patch
			 * will only be executed for the time when the personalization controller is operation on the inner chart
			 * and resetting the method afterwards to avoid an additional request.
			 */
			beforePotentialTableChange: function(oEvt){
				this._oChart.setVisibleMeasures = fnSuppressEnabled;
			}.bind(this),
			afterPotentialTableChange: function(oEvt){
				this._oChart.setVisibleMeasures = fnSuppressDisabled;
			}.bind(this)
		});

		this._oPersController.attachDialogConfirmedReset(function() {
			if (this._oDrillBreadcrumbs) {
				this._updateDrillBreadcrumbs();
			}
			// Update the chartTypeButton
			var oChartTypeButton = sap.ui.getCore().byId(this.getId() + "-btnChartType");
			if (oChartTypeButton) {
				this._enrichPassedButton(oChartTypeButton, this._oChart.getChartType());
			}
		}.bind(this));

		this._oPersController.attachDialogAfterClose(function(oEvent) {
			if (this._fGetDataForKeyUser) {

				if (oEvent.getParameter("cancel")) {
					this._fGetDataForKeyUser([]);
				}

				this._cleanUpKeyUser();
			}
		}.bind(this));
	};

	/**
	 * adds the ignoreFromPersonalisation fields to the given setting
	 *
	 * @param {object} oSettings the former settings object
	 * @private
	 * @returns {object} the changed settings object
	 */
	SmartChart.prototype._setIgnoreFromPersonalisationToSettings = function(oSettings) {
		var aIgnoreFields = PersoUtil.createArrayFromString(this.getIgnoreFromPersonalisation());
		if (aIgnoreFields.length) {
			if (!oSettings) {
				oSettings = {};
			}

			var fSetArray = function(sSubName) {
				if (!oSettings[sSubName]) {
					oSettings[sSubName] = {};
				}
				oSettings[sSubName].ignoreColumnKeys = aIgnoreFields;
			};

			fSetArray("dimeasure");
			fSetArray("filter");
			fSetArray("sort");
		}
		return oSettings;
	};

	/**
	 * eventhandler for personalisation changed
	 *
	 * @param {object} oEvent The event arguments
	 * @private
	 */
	SmartChart.prototype._personalisationModelDataChange = function(oEvent) {
		this._oCurrentVariant = oEvent.getParameter("persistentData");

		if (this._fGetDataForKeyUser) {
			this._fGetDataForKeyUser(this._createKeyUserChange());
		}

		var oRuntimeDeltaDataChangeType = oEvent.getParameter("runtimeDeltaDataChangeType");
		var sChangeStatus = this._getChangeStatus(oRuntimeDeltaDataChangeType);

		if (sChangeStatus === ChangeType.Unchanged) {
			return;
		}

		// Only fire chartDataChanged when type as not Unchanged
		this._fireChartDataChanged(oRuntimeDeltaDataChangeType);

		if (!this._bApplyingVariant) {
			if (!this.getUseVariantManagement()) {
				this._persistPersonalisation();
			} else if (this._oVariantManagement) {
				this._oVariantManagement.currentVariantSetModified(true);
			}
		}

		// Update available chart types and the ChartTypeButton
		this._updateAvailableChartType();
		this._enrichPassedButton(this._oChartTypeButton, this._oChart.getChartType());
		this._checkDimensionColoring();

		//Workaround for sap.chart.Chart
		if (!this._bDisableTimeseriesUTC && !this._oChart.getVizProperties().general.showAsUTC) {

			try {
				if (!this._oChart.getVizProperties().general.showAsUTC){
					this._oChart.setVizProperties({general: {showAsUTC : true}});
				}

				if (this._bWorkaroundVizFormatter) {
					//This fixes the broken standard formatters of sap.chart.Chart
					this._oChart.setVizProperties({timeAxis : {levelConfig: {day : {visible: true, formatString:"MediumDay"}, month : {visible: true, formatString:"MediumMonth"}}}});
				}
			} catch (err) {
				Log.error("Couldn't set showAsUTC=true");
			}
		}

		if (sChangeStatus === ChangeType.TableChanged) {
			if (this._oSemanticalNavButton) {
				this._oSemanticalNavButton.setEnabled(false);
			}
		} else if (sChangeStatus === ChangeType.ModelChanged && this._bIsChartBound) {
			// Check if chart was bound already &&:
			// If a SmartFilter is associated with SmartChart - trigger search on the SmartFilter
			if (this._oSmartFilter) {
				this._oSmartFilter.search();
			} else {
				// Rebind Chart only if data was set on it once or no smartFilter is attached!
				this._reBindChart();
			}
		}
		// Reflect changes from the Personalization Controller to the Breadcrumbs control
		if (this._oDrillBreadcrumbs) {
			this._updateDrillBreadcrumbs();
		}

		// If required in future we can provide a reason for the state change
		this.fireUiStateChange(/* {reason: "string"} */);
	};

	SmartChart.prototype._fireChartDataChanged = function(oChangeStatus) {
		var oChangeTypes = {
			dimeasure: false,
			filter: false,
			sort: false
		};
		// Map changeStatus to change types and then fire public event
		for ( var sChangeType in oChangeStatus) {
			if (oChangeStatus[sChangeType] !== "Unchanged") {
				oChangeTypes[sChangeType] = true;
			}
		}

		this.fireChartDataChanged({
			changeTypes: oChangeTypes
		});
	};

	/**
	 * returns the current filter and sorting options from the table personalisation/variants
	 *
	 * @private
	 * @param {object} oChangeInfo The change info given by the personalization controller
	 * @returns {sap.ui.comp.personalization.ChangeType} the merged change status
	 */
	SmartChart.prototype._getChangeStatus = function(oChangeInfo) {
		if (!oChangeInfo) {
			// change info not provided return ModelChanged to indicate that we need to update everything internally
			return ChangeType.ModelChanged;
		}

		if (oChangeInfo.sort === ChangeType.ModelChanged || oChangeInfo.filter === ChangeType.ModelChanged || oChangeInfo.dimeasure === ChangeType.ModelChanged || oChangeInfo.group === ChangeType.ModelChanged) {
			// model has changed and was not applied to table
			return ChangeType.ModelChanged;
		}

		if (oChangeInfo.sort === ChangeType.TableChanged || oChangeInfo.filter === ChangeType.TableChanged || oChangeInfo.dimeasure === ChangeType.TableChanged || oChangeInfo.group === ChangeType.TableChanged) {
			// change was already applied to table
			return ChangeType.TableChanged;
		}

		return ChangeType.Unchanged;
	};

	/**
	 * The entity set name in the OData metadata against which the chart must be bound.
	 *
	 * @param {string} sEntitySetName The entity set
	 * @public
	 */
	SmartChart.prototype.setEntitySet = function(sEntitySetName) {
		this.setProperty("entitySet", sEntitySetName);
		this._initialiseMetadata();
		return this;
	};

	/**
	 * It could happen that the entity type information is set already in the view, but there is no model attached yet. This method is called once the
	 * model is set on the parent and can be used to initialise the metadata, from the model, and finally create the chart controls.
	 *
	 * @private
	 */
	SmartChart.prototype.propagateProperties = function() {
		VBox.prototype.propagateProperties.apply(this, arguments);
		this._initialiseMetadata();
	};

	/**
	 * Initialises the OData metadata necessary to create the chart
	 *
	 * @private
	 */
	SmartChart.prototype._initialiseMetadata = function() {
		if (!this._bMetadataIsInitialised) {
			ODataModelUtil.handleModelInit(this, this._onMetadataInitialised, true);
		}
	};

	/**
	 * Called once the necessary Model metadata is available
	 *
	 * @private
	 */
	SmartChart.prototype._onMetadataInitialised = function() {
		this._bMetaModelLoadAttached = false;
		if (!this._bMetadataIsInitialised) {

			/*
			When metadata is available, create everything which is independent
			from the inner sap.chart.Chart instance
			 */
			this._listenToSmartFilter();
			this._createToolbar();

			/*
			Apply possible variants.
			Creates VariantMngmntCtrl if useVariantManagement OR useChartPersonalisation is true.
			Control is only added to toolbar if useVariantManagement is set otherwise it acts as
			hidden persistance helper
			 */
			this._createVariantManagementControl();

			this._createToolbarContent();

			//Indicates the metadata was initialised.
			//This doesn't mean that the control is fully initialised
			//Therefore please use bIsInitialies
			//TODO: Think about providing a getter for this like for bisInitialised
			this._bMetadataIsInitialised = true;

			// Init inner Chart direclty, when a event handler for initialise is there
			if (bInitialiseEventInUse) {
				this._initialiseInnerChart();
			}

			//STOP MEASUREMENT of control init here
			if (Measurement.getActive()) {
				Measurement.end("SmartChartInit");
				//Display measurements in a table via browser console
				//console.table(Measurement.getMeasurement("SmartChartInit"));
			}
			//Fires initial _reBind or SmartFilterBar's search event.
			//Trigger initial binding if no Variant exists -or- if it is already initialised
			if (!this._oVariantManagement || (this._oVariantManagement && this._bVariantInitialised)) {
				this._checkAndTriggerBinding();
			}
		}
	};

	/**
	 * Check if control needs to be bound and trigger binding accordingly.
	 *
	 * @private
	 */
	SmartChart.prototype._checkAndTriggerBinding = function() {
		if (!this._bAutoBindingTriggered) {
			this._bAutoBindingTriggered = true;
			if (this.getEnableAutoBinding()) {
				if (this._oSmartFilter) {
					this._oSmartFilter.search();
				} else {
					this._reBindChart();
				}
			} else if (!this._oChart) {
				// create a temporaty NoData structure
				this._createTempNoData();
			}
		}
	};

	/**
	 * Create a temporary NoData structure in case inner chart is not created yet.
	 * @private
	 */
	SmartChart.prototype._createTempNoData = function() {
		var oNoDataText = new Text({
			text: this.getNoData()
		});

		this._oNoDataStruct = new VBox({
			items: [
				oNoDataText
			],
			justifyContent: "Center",
			alignItems: "Center",
			height: "100%"
		});

		this.insertItem(this._oNoDataStruct, 2);
	};

	/**
	 * Creates an instance of the chart provider
	 *
	 * @private
	 */
	SmartChart.prototype._createChartProvider = function() {
		var oModel, sEntitySetName;
		sEntitySetName = this.getEntitySet();
		oModel = this.getModel();

		// The SmartChart might also needs to work for non ODataModel models; hence we now create the chart independent
		// of ODataModel.
		if (oModel && !this._bChartCreated) {
			this._aAlwaysSelect = [];
			this._aInitialSorters = [];
			this._addDrillBreadcrumbs();
			this._bChartCreated = true;
		}
		if (oModel && sEntitySetName) {
			this._oChartProvider = new ChartProvider({
				entitySet: sEntitySetName,
				ignoredFields: this.getIgnoredFields(),
				dateFormatSettings: this.data("dateFormatSettings"),
				defaultDropDownDisplayBehaviour: this.data("defaultDimensionDisplayBehaviour"),
				skipAnnotationParse: this.data("skipAnnotationParse"),
				chartQualifier: this.data("chartQualifier"),
				presentationVariantQualifier: this.data("presentationVariantQualifier"),
				model: oModel,
				chartLibrary: ChartLibrary,
				useTimeSeries: this.getActivateTimeSeries(),
				notAssignedText: this.getNotAssignedText()
			});
		}
	};

	SmartChart.prototype._listenToSmartFilter = function() {
		this._fetchSmartFilter();

		if (this._oSmartFilter) {
			this._oSmartFilter.attachSearch(this._reBindChart, this);
			this._oSmartFilter.attachFilterChange(this._filterChangeEvent, this);
		}
	};

	/*SmartChart.prototype.getNoData = function() {
		var sNoData = this.getProperty("noData");
		// if no custom NoData is set, we use the standard ones
		if (!sNoData) {
			this._fetchSmartFilter();
			// Initial text
			if (this._oSmartFilter) {
				sNoData = this._oRb.getText("CHART_NO_DATA");
			} else {
				sNoData = this._oRb.getText("CHART_NO_DATA_WITHOUT_FILTERBAR");
			}
			this.setNoData(sNoData, true);
		}

		return sNoData;
	};*/

	SmartChart.prototype.setNoData = function(sNoData){
		if (this._oChart){
			this._oChart.setCustomMessages({
				'NO_DATA': sNoData
			});
		}
		this.setProperty("noData", sNoData);
		return this;
	};

	SmartChart.prototype.getNoData = function() {
		var sNoData = this.getProperty("noData");
		// if no custom NoData is set, we use the standard ones
		if (!this.getProperty("noData")) {
			// in case no inner chart is created yet / no request has been made
			if (!this._oChart) {
				this._fetchSmartFilter();
				// Initial text
				if (this._oSmartFilter) {
					sNoData = this._oRb.getText("CHART_NO_DATA");
				} else {
					sNoData = this._oRb.getText("CHART_NO_DATA_WITHOUT_FILTERBAR");
				}
				//this.setNoData(sNoData, true);
				// once the inner chart instance is available
			} else {
				sNoData = this._oRb.getText("CHART_NO_RESULTS");
			}
		}
		return sNoData;
	};

	SmartChart.prototype._fetchSmartFilter = function() {
		var sSmartFilterId = null;
		// Register for SmartFilter Search
		sSmartFilterId = this.getSmartFilterId();

		this._oSmartFilter = this._findControl(sSmartFilterId);
	};

	SmartChart.prototype._filterChangeEvent = function() {
		if (this._bIsChartBound && this._oSmartFilter && !this._oSmartFilter.getLiveMode() && !this._oSmartFilter.isDialogOpen()) {
			this._showOverlay(true);
		}
	};

	// Because of workaround applied in _createChart function the overlay height needs to be set manually
	SmartChart.prototype._adjustOverlayHeight = function() {
		if (Device.browser.safari || Device.browser.chrome) {
			var $this = this._oChart.$(), $overlay = $this.find(".sapUiCompSmartChartOverlay");
			if ($overlay.length === 1){
				$overlay.height($this.height());
			}
		}
	};

	SmartChart.prototype._renderOverlay = function(bShow) {

		if (this._oChart) {

			var $this = this._oChart.$(), $overlay = $this.find(".sapUiCompSmartChartOverlay");
			if (bShow && $overlay.length === 0) {
				$overlay = jQuery("<div>").addClass("sapUiOverlay sapUiCompSmartChartOverlay").css("z-index", "1");
				$this.append($overlay);
				this._adjustOverlayHeight();
				this.sOverlayResizeListenerId = ResizeHandler.register($this, this._adjustOverlayHeight.bind(this));
			} else if (!bShow) {
				$overlay.remove();
				ResizeHandler.deregister(this.sOverlayResizeListenerId);
			}
		}
	};
	/**
	 * Sets the ShowOverlay property on the inner chart, fires the ShowOverlay event
	 *
	 * @param {boolean} bShow true to display the overlay, otherwise false
	 *
	 * @private
	 * @ui5-restricted Fiori Elements
	 */
	SmartChart.prototype.showOverlay = function(bShow) {
		this._showOverlay(bShow);
	};

	/**
	 * sets the ShowOverlay property on the inner chart, fires the ShowOverlay event
	 *
	 * @param {boolean} bShow true to display the overlay, otherwise false
	 * @private
	 */
	SmartChart.prototype._showOverlay = function(bShow) {
		if (bShow) {
			var oOverlay = {
				show: true
			};
			this.fireShowOverlay({
				overlay: oOverlay
			});
			bShow = oOverlay.show;
		}
		// Flag is used in adjustHeight because setHeight call on inner chart lets overlay disappear.
		this._hasOverlay = bShow;
		this._renderOverlay(bShow);
	};

	/**
	 * searches for a certain control by its ID
	 *
	 * @param {string} sId the control's ID
	 * @returns {sap.ui.core.Control} The control found by the given Id
	 * @private
	 */
	SmartChart.prototype._findControl = function(sId) {
		var oResultControl, oView;
		if (sId) {
			// Try to get SmartFilter from Id
			oResultControl = sap.ui.getCore().byId(sId);

			// Try to get SmartFilter from parent View!
			if (!oResultControl) {
				oView = this._getView();

				if (oView) {
					oResultControl = oView.byId(sId);
				}
			}
		}

		return oResultControl;
	};

	/**
	 * searches for the controls view
	 *
	 * @returns {sap.ui.core.mvc.View} The found parental View
	 * @private
	 */
	SmartChart.prototype._getView = function() {
		if (!this._oView) {
			var oObj = this.getParent();
			while (oObj) {
				if (oObj.isA("sap.ui.core.mvc.View")) {
					this._oView = oObj;
					break;
				}
				oObj = oObj.getParent();
			}
		}
		return this._oView;
	};
	/**
	 * updates the inResultDimension property on inner sap.chart.Chart. A concatenation of inResultDimension, requestAtLeast and PresentationVariant
	 * is created. called via _rebindChart and setRequestAtLeastFields.
	 *
	 * @private
	 */
	SmartChart.prototype._updateInResultDimensions = function() {
		var aUniqueInResultDimensions = this._getInResultDimensionTotal();

		// make sure that we only set inResultDims when they have changed to previous setting
		var fnCompareWithCurrentInResult = function(aNewInResult) {
			var aCurrentInResult = this._oChart.getInResultDimensions();

			// compare length first to save up some time
			if (aCurrentInResult.length != aNewInResult.length) {
				return false;
			}
			for (var i = 0, l = aCurrentInResult.length; i < l; i++) {

				if (aCurrentInResult[i] != aNewInResult[i]) {
					// Only comparing strings here, not working for objects
					return false;
				}
			}
			//True when both arrays contain the same strings
			return true;
		}.bind(this);

		// if the new InResult array has values and is different then the one already set
		if (aUniqueInResultDimensions.length > 0 && !fnCompareWithCurrentInResult(aUniqueInResultDimensions)) {
			this._oChart.setInResultDimensions(aUniqueInResultDimensions);
		}
	};
	/**
	 * This loads all dependent sap.chart classes and initialises the inner chart instance.
	 * @private
	 */
	SmartChart.prototype._initialiseInnerChart = function() {

		// Create the inner sap.chart.Chart or reference the one from outside
		this._createChart();

		// Create ChartProvider instance and metadata based content
		this._createChartProvider();
		if (this._oChartProvider) {
			this._oChartViewMetadata = this._oChartProvider.getChartViewMetadata();
			if (this._oChartViewMetadata) {

				this._assignData();

				// Create Content after first request was made
				this._createContent();

				this._createPersonalizationController();

				// Do some work to the dependent toolbar buttons after inner chart init
				this._oChart.attachRenderComplete(this._toggleZoomButtonEnablement, this);
				// Attach to sap.chart.Charts private _selectionDetails event
				this._oSelectionDetails.attachSelectionHandler("_selectionDetails", this._oChart);
				// Update chart type button
				this._enrichPassedButton(this._oChartTypeButton, this._oChart.getChartType());

				// Enable all toolbar buttons, now that the inner chart is available
				this._enableToolbarButtons();

				//do if needed initial dimension coloring
				this._checkDimensionColoring();

				//update DrillBreadcrumbs after init in case we run async
				this._updateDrillBreadcrumbs();

				// Indicates the control is initialised and can be used in the initialise event/otherwise!
				this.bIsInitialised = true;
				this.fireInitialise();
				this.fireInitialized();

				//adjust height to correctly fit into scenarios like ALP
				//this._adjustHeight();

				//Apply Variant after inner chart was created
				this.applyVariant(this.fetchVariant());
			}
		}
	};
	/**
	 * This enables all relevant toolbar buttons after the  sap.chart libs have been loaded and the inner chart
	 * was initialised.
	 * @private
	 */
	SmartChart.prototype._enableToolbarButtons = function() {

		if (this._oDrillUpButton && this._oDrillDownButton) {
			this._oDrillUpButton.setEnabled(true);
			this._oDrillDownButton.setEnabled(true);
		}

		if (this._oDrillDownTextButton) {
			//this._oSelectionDetails enablement is based on chart datapoint selection
			this._oDrillDownTextButton.setEnabled(true);
		}

		if (this._oLegendButton) {
			this._oLegendButton.setEnabled(true);
		}

		if (this._oZoomInButton && this._oZoomOutButton) {
			this._oZoomInButton.setEnabled(true);
			this._oZoomOutButton.setEnabled(true);
		}

		if (this._oDownloadButton) {
			this._oDownloadButton.setEnabled(true);
		}

		if (this._oChartPersonalisationButton) {
			this._oChartPersonalisationButton.setEnabled(true);
		}

		if (this.oFullScreenButton) {
			this.oFullScreenButton.setEnabled(true);
		}

		if (this._oChartTypeButton) {
			this._oChartTypeButton.setEnabled(true);
		}
	};

	function _innerChartArtefactsLoaded(fnChartLibrary, fnChart, oColoringType, fnDimension, fnHierarchyDimension, fnTimeDimension, fnMeasure, oMeasureSemantics, fnVizTooltip, oChartFormatter) {
		ChartLibrary = fnChartLibrary;
		Chart = fnChart;
		ColoringType = oColoringType;
		Dimension = fnDimension;
		HierarchyDimension = fnHierarchyDimension;
		TimeDimension = fnTimeDimension;
		Measure = fnMeasure;
		MeasureSemantics = oMeasureSemantics;
		VizTooltip = fnVizTooltip;
		ChartFormatter = oChartFormatter;

		this._bChartRequested = false;

		if (!this._bIsBeingDestroyed) {
			this._reBindChart();
		}
	}

	/**
	 * This can be used to trigger binding on the chart used in the SmartChart
	 *
	 * @protected
	 */
	SmartChart.prototype.rebindChart = function() {
		if (!this._bMetadataIsInitialised){
			Log.error(
				"rebindChart method called before the metadata is initialized. Please execute the UI5 Support Assistant 'SmartChart' rules to get more information",
				this.getId(),
				"sap.ui.comp.smartChart"
			);
		}

		this._reBindChart();
	};

	/**
	 * Re-binds the chart
	 *
	 * @private
	 */
	SmartChart.prototype._reBindChart = function() {
		var mChartPersonalisationData, aSmartFilters, aProcessedFilters = [], aFilters, oExcludeFilters, aSorters, mParameters = {}, mBindingParams = {
			preventChartBind: false
		};
		//Lazy loading of sap.chart libs and init of inner chart dependent content
		//TODO: Refactor this to a nicer solution
		if (!this._oChart) {
			if ((!ChartLibrary || !Chart || !Dimension || !HierarchyDimension || !TimeDimension || !Measure || !VizTooltip) && !this._bChartRequested) {
				ChartLibrary = sap.ui.require("sap/chart/library");
				Chart = sap.ui.require("sap/chart/Chart");
				ColoringType = sap.ui.require("sap/chart/ColoringType");
				Dimension = sap.ui.require("sap/chart/data/Dimension");
				HierarchyDimension = sap.ui.require("sap/chart/data/HierarchyDimension");
				TimeDimension = sap.ui.require("sap/chart/data/TimeDimension");
				Measure = sap.ui.require("sap/chart/data/Measure");
				MeasureSemantics = sap.ui.require("sap/chart/data/MeasureSemantics");
				VizTooltip = sap.ui.require("sap/viz/ui5/controls/VizTooltip");
				ChartFormatter = sap.ui.require("sap/viz/ui5/format/ChartFormatter");

				if (!ChartLibrary || !Chart || !Dimension || !HierarchyDimension || !TimeDimension || !Measure || !VizTooltip) {
					sap.ui.getCore().loadLibrary("sap.chart", {
						async: true
					}).then(function() {
						sap.ui.require([
							'sap/chart/library', 'sap/chart/Chart', 'sap/chart/ColoringType', 'sap/chart/data/Dimension', 'sap/chart/data/HierarchyDimension', 'sap/chart/data/TimeDimension', 'sap/chart/data/Measure', 'sap/chart/data/MeasureSemantics', 'sap/viz/ui5/controls/VizTooltip', 'sap/viz/ui5/format/ChartFormatter'

						], _innerChartArtefactsLoaded.bind(this));
						this._bChartRequested = true;
					}.bind(this));
				}
			}

			if (!ChartLibrary || !Chart || !Dimension || !HierarchyDimension || !TimeDimension || !Measure || !VizTooltip) {
				return;
			}

			this._initialiseInnerChart();
		}

		mChartPersonalisationData = this._getChartPersonalisationData() || {};

		aFilters = mChartPersonalisationData.filters;
		oExcludeFilters = mChartPersonalisationData.excludeFilters;
		aSorters = mChartPersonalisationData.sorters;

		// Get Filters and parameters from SmartFilter
		if (this._oSmartFilter) {
			aSmartFilters = this._oSmartFilter.getFilters();
			mParameters = this._oSmartFilter.getParameters() || {};
		}

		// If filters from SmartFilter exist --> process them first with SmartChart exclude filters
		// since we need to manually AND multiple multi filters!
		if (aSmartFilters && aSmartFilters.length) {
			if (oExcludeFilters) {
				aProcessedFilters = [
					new Filter([
						aSmartFilters[0], oExcludeFilters
					], true)
				];
			} else {
				aProcessedFilters = aSmartFilters;
			}
		} else if (oExcludeFilters) {
			aProcessedFilters = [
				oExcludeFilters
			];
		}
		// Combine the resulting processed filters with SmartChart include filters
		if (aFilters) {
			aFilters = aProcessedFilters.concat(aFilters);
		} else {
			aFilters = aProcessedFilters;
		}

		// updateInResultDimensions before re-binding the chart
		this._updateInResultDimensions();

		// Enable some default parameters
		mParameters["entitySet"] = this.getEntitySet();
		if (!aSorters) {
			aSorters = [];
		}

		mBindingParams.filters = aFilters;
		mBindingParams.sorter = aSorters;
		mBindingParams.parameters = mParameters;
		mBindingParams.events = {};

		// fire event to enable user modification of certain binding options (Ex: Filters)
		this.fireBeforeRebindChart({
			bindingParams: mBindingParams
		});

		if (!mBindingParams.preventChartBind && this._oChartViewMetadata) {
			aSorters = mBindingParams.sorter;
			aFilters = mBindingParams.filters;
			mParameters = mBindingParams.parameters;
			this._oChart.setBusy(true);

			this._bDataLoadPending = true;

			SmartChart._addBindingListener(mBindingParams, "change", this._onDataLoadComplete.bind(this));
			SmartChart._addBindingListener(mBindingParams, "dataReceived", this._onDataReceived.bind(this));

			var oData = {
				path: this.getChartBindingPath() || ("/" + this.getEntitySet()),
				parameters: mParameters,
				filters: aFilters,
				//sorter: aSorters,
				events: mBindingParams.events
			};
			//Only set sorters on the first binding of inner chart
			if (!this._bIsChartBound) {
				oData.sorter = aSorters;
			}

			if (mBindingParams.length) {
				oData.length = mBindingParams.length;
			} else {
				var iMaxItems = this._oChartProvider.getMaxItems();

				if (iMaxItems > 0) {
					oData.length = iMaxItems;
				}
			}

			this._oChart.bindData(oData);

			//Only call this when the initial binding of inner chart was performed already
			if (this._bIsChartBound) {
				this._oChart.getBinding("data").sort(aSorters);
			}

			this._showOverlay(false);

			// Flag to indicate if Chart was bound (data fetch triggered) at least once
			this._bIsChartBound = true;
		}
	};

	/**
	 * validates if dimensions/measures are part of the request query before
	 * setting related sorters on the inner chart binding.
	 * @param aSorters Array of potential sorters
	 * @returns {Array} An array of valid sorters
	 * @private
	 */
	SmartChart.prototype._validateSorters = function(aSorters) {
		//TODO: Clarify if we also need to consider inResult / requestAtLeast for sorting
		var aValidSorters = [];
		//merge visible dims and measures for easier usage
		var aVisibleDimMeasures = this._oChart.getVisibleDimensions().concat(this._oChart.getVisibleMeasures());
		if (aSorters) {
			aSorters.forEach(function(oSorter) {
				aVisibleDimMeasures.forEach(function(sVisibleDim) {
					if (oSorter.sPath === sVisibleDim) {
						aValidSorters.push(oSorter);
					}
				});
			});
		}
		return aValidSorters;
	};

	/**
	 * Event handler for binding dataReceived
	 *
	 * @param {object} mEventParams - the event instance
	 * @private
	 */
	SmartChart.prototype._onDataReceived = function(mEventParams) {

		// AnalyticalBinding fires dataReceived too early
		if (mEventParams && mEventParams.getParameter && mEventParams.getParameter("__simulateAsyncAnalyticalBinding")) {
			return;
		}

		this._onDataLoadComplete(mEventParams, true);
		// notify any listeners
		try {
			this.fireDataReceived(mEventParams);
		} catch (error) {
			//Legacy-free UI5 will not be able to fire this event as it is deprecated. This is expected and shouldn't result in an error.
		}
	};

	/**
	 * Static method for checking and wrapping binding event listeners
	 *
	 * @param {object} oBindingInfo - the bindingInfo (or binding parameter) instance
	 * @param {object} sEventName - the event name
	 * @param {object} fHandler - the handler to be called internally
	 * @private
	 */
	SmartChart._addBindingListener = function(oBindingInfo, sEventName, fHandler) {
		if (!oBindingInfo.events) {
			oBindingInfo.events = {};
		}

		if (!oBindingInfo.events[sEventName]) {
			oBindingInfo.events[sEventName] = fHandler;
		} else {
			// Wrap the event handler of the other party to add our handler.
			var fOriginalHandler = oBindingInfo.events[sEventName];
			oBindingInfo.events[sEventName] = function() {
				fHandler.apply(this, arguments);
				fOriginalHandler.apply(this, arguments);
			};
		}
	};

	SmartChart.prototype._onDataLoadComplete = function(mEventParams, bForceUpdate) {

		if (this._oSemanticalNavButton) {
			this._oSemanticalNavButton.setEnabled(false);
		}

		if (this._bDataLoadPending || bForceUpdate) {
			this._bDataLoadPending = false;

			this._updateAvailableChartType();
			this._oChart.setBusy(false);
		}
	};

	SmartChart.prototype._assignData = function() {
		if (this._oChartViewMetadata && this._oChart) {

			// WORKARROUND: In some cases (inner Chart is given by app...) the drillstack has a strange state
			// Therefore... recreating it:
			this._oChart.resetLayout();

			if (this._oChartViewMetadata.measureFields && (this._oChartViewMetadata.measureFields.length > 0)) {
				this._oChart.setVisibleMeasures(this._oChartViewMetadata.measureFields);
			}

			if (this._oChartViewMetadata.dimensionFields && (this._oChartViewMetadata.dimensionFields.length > 0)) {
				this._oChart.setVisibleDimensions(this._oChartViewMetadata.dimensionFields);
			}

			if (!this.getChartType() && this._oChartViewMetadata.chartType) {
				this._setChartType(this._oChartViewMetadata.chartType);

			}
		}
	};

	SmartChart.prototype._createP13nObject = function(oField) {

		// add to initial sorters
		if (oField.sortable && oField.sorted) {
			var oSortItem = {
				columnKey: oField.name,
				operation: oField.sortOrder
			};

			// rebind to apply initial sorting
			if (oField.sortIndex != null) {
				this._aInitialSorters.splice(oField.sortIndex, 0, oSortItem);
			} else {
				this._aInitialSorters.push(oSortItem);
			}
		}

		return {
			columnKey: oField.name,
			leadingProperty: oField.name, // used to fetch data, by adding this to $select param of OData request
			additionalProperty: oField.additionalProperty, // additional data to fetch in $select
			sortProperty: oField.sortable ? oField.name : undefined,
			filterProperty: oField.filterable ? oField.name : undefined,
			fullName: oField.hasValueListAnnotation ? oField.fullName : null,
			type: oField.filterType,
			typeInstance: oField.modelType,
			maxLength: oField.maxLength,
			precision: oField.precision,
			scale: oField.scale,
			isMeasure: oField.isMeasure,
			isDimension: oField.isDimension,
			isHierarchyDimension: oField.isHierarchyDimension,
			hierarchyLevel: oField.hierarchyLevel,
			aggregationRole: oField.aggregationRole,
			label: oField.label,
			tooltip: oField.quickInfo,
			sorted: oField.sorted,
			sortOrder: oField.sortOrder,
			criticality: oField.valueCriticality
		};

	};

	/**
	 * Creates the content based on the metadata/configuration
	 *
	 * @private
	 */
	SmartChart.prototype._createContent = function() {
		var i, iLen = 0, oField, oChartObject, mProperties, aSortFilterableItems = [], oP13nDataObj;
		var aDataPoints = [];
		this._aColumnKeysOrdered = [];

		//chart annotation overrules the entity type ordering
		Object.assign(this._aColumnKeysOrdered, this._oChartViewMetadata.dimensionFields);
		this._aColumnKeysOrdered = this._aColumnKeysOrdered.concat(this._oChartViewMetadata.measureFields);

		iLen = this._oChartViewMetadata.fields.length;
		var aDimensionFields = this._oChartViewMetadata.dimensionFields || [];
		var aMeasureFields = this._oChartViewMetadata.measureFields || [];

		for (i = 0; i < iLen; i++) {

			oChartObject = null;

			oField = this._oChartViewMetadata.fields[i];

			//TODO: Evaluate if ControlProvider._createFieldMetadata would work for SmartChart as well
			//Quickfix for mapping technical name to label property
			oField.label = oField.fieldLabel || oField.name;

			if (this._aColumnKeysOrdered.indexOf(oField.name) === -1) {
				this._aColumnKeysOrdered.push(oField.name);
			}

			// Only create P13n data when there is no dimension/measure existing for this field
			// Custom dimensions/measures have to provide their own P13n data as JSON
			if (this._oChart.getDimensionByName(oField.name) === undefined && this._oChart.getMeasureByName(oField.name) === undefined) {
				oP13nDataObj = this._createP13nObject(oField);

				mProperties = {
					name: oField.name,
					label: oField.label,
					tooltip: oField.quickInfo
				};
			}

			// Check if should always be in Result of query
			if (oField.inResult) {
				this._aAlwaysSelect.push(oField.name);
			}

			if (oField.isDimension || oField.isHierarchyDimension || (aDimensionFields.indexOf(oField.name) != -1)) {

				// Check if dimension was already set from outside
				if (this._oChart.getDimensionByName(oField.name) === undefined) {
					if (oField.isDimension) {
						if (oField.isTimeDimension && this.getActivateTimeSeries()) {

							// Create TimeDimension instances
							oChartObject = new TimeDimension(mProperties);
							var sTimeUnitType = oField.timeUnitType;

							if (TimeUnitType.hasOwnProperty(oField.timeUnitType)) {
								oChartObject.setTimeUnit(TimeUnitType[sTimeUnitType]);
							}

							if (!this._bDisableTimeseriesUTC) {
								try {
									oChartObject._setIsUTC(true);
								} catch (err) {
									Log.error("Couldn't set UTC settings on TimeDimension");
								}

							}

						} else {

							// Create regular dimension instance
							oChartObject = new Dimension(mProperties);
						}

					} else {
						mProperties.level = oField.hierarchyLevel;
						oChartObject = new HierarchyDimension(mProperties);
					}

					this._oChart.addDimension(oChartObject);

					if (oField.description && (!oField.isTimeDimension || !this.getActivateTimeSeries())) {
						oChartObject.setTextProperty(oField.description);
						oChartObject.setTextFormatter(FormatUtil.getFormatterFunctionFromDisplayBehaviour(oField.displayBehaviour, false, this));
					} else if (oField.dateFormatter && (!oField.isTimeDimension || !this.getActivateTimeSeries())) {
						oChartObject.setTextFormatter(oField.dateFormatter);
					} else if (oField.isDimension && (!oField.isTimeDimension || !this.getActivateTimeSeries())) {
						//No formatter, so keep Chart default behavior and only introduce "Not Assigned" values
						oChartObject.setTextFormatter(function(sId, sDesc){

							if (sId === "") {
								return this.getNotAssignedText();
							} else {
								return sId;
							}

						}.bind(this));
					}

				} else {

					// If dimension was existing already, then parse the p13n JSON to object.
					var oP13nData = this._oChart.getDimensionByName(oField.name).data("p13nData");
					if (oP13nData) {

						// Check if p13nData is a String (defined in XML view ) or already an object (defined in JavaScript)
						this._oChart.getDimensionByName(oField.name).data("p13nData", typeof oP13nData === "string" ? JSON.parse(oP13nData) : oP13nData);
					}
				}
			} else if (oField.isMeasure || (aMeasureFields.indexOf(oField.name) != -1)) {

				// Check if measure was already set from outside
				if (this._oChart.getMeasureByName(oField.name) === undefined) {
					oChartObject = new Measure(mProperties);
					this._oChart.addMeasure(oChartObject);

					if (oField.dataPoint) {

						// remember data point to for semantics
						aDataPoints.push({
							dataPoint: oField.dataPoint,
							measure: oChartObject
						});
					}

					if (oField.unit) {
						oChartObject.setUnitBinding(oField.unit);
					}

				} else {

					// If measure was existing already, then parse the p13n JSON to object.
					var oP13nData = this._oChart.getMeasureByName(oField.name).data("p13nData");

					if (oP13nData) {

						// Check if p13nData is a String (defined in XML view ) or already an object (defined in JavaScript)
						this._oChart.getMeasureByName(oField.name).data("p13nData", typeof oP13nData === "string" ? JSON.parse(oP13nData) : oP13nData);
					}
				}

			} else if (oField.sortable || oField.filterable) {
				aSortFilterableItems.push(oP13nDataObj);
			}

			if (oChartObject) {

				if (oField.role) {
					oChartObject.setRole(oField.role);
				}

				oChartObject.data("p13nData", oP13nDataObj);
			}
		}

		if (this._oChart) {
			this._oChart.data("p13nData", aSortFilterableItems);
		}

		// enrich from data points when all measures are there
		if (aDataPoints.length > 0) {
			this._enrichFromDataPoints(aDataPoints);
		}
	};

	SmartChart.prototype._getField = function(sName) {
		var oField, i, iLen;

		if (sName && this._oChartViewMetadata && this._oChartViewMetadata.fields) {
			iLen = this._oChartViewMetadata.fields.length;
			for (i = 0; i < iLen; i++) {
				oField = this._oChartViewMetadata.fields[i];
				if (oField.name === sName) {
					return oField;
				}
			}
		}

		return null;
	};

	/**
	 * Loads the chart lib synchronously before the event is attached.
	 * That is done for compatibility reasons.
	 * <b>Note:</b> Attaching to this event causes the inner chart to load synchronously. This does not fulfill CSP requirements.
	 * Please use event <code>initialized</code> instead.
	 * @deprecated As of version 1.94, replaced by {@link #event:initialized}
	 * @public
	 */
	SmartChart.prototype.attachInitialise = function(oData, fnFunction, oListener) {
		this.attachEvent("initialise", oData, fnFunction, oListener);
		bInitialiseEventInUse = true;

		//sync load dependencies before
		sap.ui.getCore().loadLibrary('sap.chart');
		ChartLibrary = sap.ui.requireSync('sap/chart/library');
		Chart = sap.ui.requireSync('sap/chart/Chart');
		ColoringType = sap.ui.requireSync('sap/chart/ColoringType');
		Dimension = sap.ui.requireSync('sap/chart/data/Dimension');
		HierarchyDimension = sap.ui.requireSync('sap/chart/data/HierarchyDimension');
		TimeDimension = sap.ui.requireSync('sap/chart/data/TimeDimension');
		Measure = sap.ui.requireSync('sap/chart/data/Measure');
		MeasureSemantics = sap.ui.requireSync('sap/chart/data/MeasureSemantics');
		VizTooltip = sap.ui.requireSync('sap/viz/ui5/controls/VizTooltip');
		ChartFormatter = sap.ui.requireSync('sap/viz/ui5/format/ChartFormatter');

		//... and init the inner chart
		if (this._bMetadataIsInitialised) {
			this._initialiseInnerChart(); // init here; if metadata not yet initialised, inner chart will be init'd in the callback over there
		}

		Log.error("The event 'initialise' is deprecated, please use 'initialized' instead");

		return this;
	};

	/**
	 * Creates a Chart based on the configuration, if necessary. This also prepares the methods to be used based on the chart type.
	 *
	 * @private
	 */
	SmartChart.prototype._createChart = function() {
		// make sure to destroy the temporary NoData structure before inserting the inner chart
		if (this._oNoDataStruct) {
			this._oNoDataStruct.destroy();
		}
		var aContent = this.getItems(), iLen = aContent ? aContent.length : 0, oChart, that = this;
		var oDateFormatSettings;
		this._bDisableTimeseriesUTC = true; //Don't do anything if not explicitly stated by dateFormatSettings
		// Check if a Chart already exists in the content (Ex: from view.xml)
		while (iLen--) {
			oChart = aContent[iLen];
			if (oChart instanceof Chart) {
				break;
			}
			oChart = null;
		}
		// If a Chart exists use it, else create one!
		if (oChart) {
			this._oChart = oChart;

			try {
				oDateFormatSettings = this.data("dateFormatSettings") ? JSON.parse(this.data("dateFormatSettings")) : {};
				// Default to UTC true if nothing is provided --> as sap:display-format="Date" should be used without a timezone
				if (oDateFormatSettings.hasOwnProperty("UTC")) {
					this._bDisableTimeseriesUTC = !oDateFormatSettings["UTC"];
				}

				if (oDateFormatSettings.hasOwnProperty("style") && oDateFormatSettings["style"].toLowerCase() == "medium") {
					this._bWorkaroundVizFormatter = true;
				}

			} catch (error){
				//Not needed
			}
		} else {


			var oSettings = {
				uiConfig: {
					applicationSet: 'fiori'
				},
				// Needs to be set in order to visualize busy indicator when binding happens very fast
				busyIndicatorDelay: 0,
				vizProperties: {
					title: {
						text: ''
					},
					plotArea: {
						dataLabel: {
							// visible: true,
							hideWhenOverlap: false
						}
					},
					general: {
						groupData: false
					},
					valueAxis: {
						title: {
							visible: that.getShowMeasuresTitle()
						}
					},
					categoryAxis: {
						title: {
							visible: that.getShowDimensionsTitle()
						},
						layout: {
							autoHeight: true,
							autoWidth: true
						}
					}
				},
				selectionMode: this.getSelectionMode(),
				width: "100%"
			};

			try {
				oDateFormatSettings = this.data("dateFormatSettings") ? JSON.parse(this.data("dateFormatSettings")) : {};
				// Default to UTC true if nothing is provided --> as sap:display-format="Date" should be used without a timezone
				if (oDateFormatSettings.hasOwnProperty("UTC")) {
					oSettings.vizProperties.general.showAsUTC = !!oDateFormatSettings["UTC"];
					this._bDisableTimeseriesUTC = !oDateFormatSettings["UTC"];

					if (oDateFormatSettings.hasOwnProperty("style") && oDateFormatSettings["style"].toLowerCase() == "medium") {
						oSettings.timeAxis = {levelConfig : {day : {visible: true, formatString:"MediumDay"}, month : {visible: true, formatString:"MediumMonth"}}};
						this._bWorkaroundVizFormatter = true;
					}
				}

			} catch (error){
				//Don't use conversion if no custom data is given
			}


			this._oChart = new Chart(oSettings);

			//Only set inner chart's height to 100% if height was specified on SmartChart,
			//otherwise use 480px default height of sap.chart.Chart (as per API doc) to ensure visible content
			//at all times
			if (this.getHeight()) {
				this._oChart.setHeight("100%");
			}
			// adjust the overall height once inner rendering is complete and domRef offsetHeight is available
			/*this._oChart.attachRenderComplete(function(){
				this._adjustHeight();
			}.bind(this));*/

			this._toggleChartTooltipVisibility(this.getShowChartTooltip());
			this._setBehaviorTypeForDataSelection();
			this.insertItem(this._oChart, 2);
		}

		//Workaround for Safari and Chrome browsers
		//This replaces the prior handling and also works in cases where the ToolBar or Breadcrumbs are disabled by the user
		if (Device.browser.safari || Device.browser.chrome || Device.browser.firefox){
			this.addStyleClass("sapUiCompSmartChartInnerChartHeight");
		}

		//Check for legend visibility, once vizFrame is created.
		this.setLegendVisible(this.getLegendVisible());

		if (!this._oChart.getLayoutData()) {
			var oFlexItemData = {
				growFactor: 1
			};

			var oLayoutData = this.getLayoutData();

			if (oLayoutData && oLayoutData.getBaseSize) {
				oFlexItemData.baseSize = oLayoutData.getBaseSize();
			} else {
				//Default set the baseSize to 100%
				//BCP: 1770489819
				oFlexItemData.baseSize = "100%";
			}

			this._oChart.setLayoutData(new FlexItemData(oFlexItemData));
		}
		if (this.getChartType()) {
			this._setChartType(this.getChartType());
		}
		// Attach in order to re-set overlay when framework fires rerender events (like VariantManagement when saving a variant)
		this._oChart.attachRenderComplete(function() {
			// If overlay is active, it need to be set again because of setHeight on oChart
			if (this._hasOverlay) {
				setTimeout(function() {
					this._showOverlay(true);
				}.bind(this), 0);
			}

			//The flex item is somtimes added new after a rerender. This resets the layout data
			//Ensure that Grow-Factor is set correctly for chart to show up
			//BCP: 2180076915
			this._oChart.getLayoutData().setGrowFactor(1);
		}.bind(this));

		this._oChart.setCustomMessages({
			'NO_DATA': this.getNoData()
		});

		this._createTooltipOrPopover();
	};

	SmartChart.prototype._toggleChartTooltipVisibility = function(bFlag) {

		if (this._oChart) {
			if (bFlag) {
				if (!this._vizTooltip) {
					this._vizTooltip = new VizTooltip();
				}
				// Make this dynamic for setter calls
				this._vizTooltip.connect(this._oChart.getVizUid());
			} else {
				if (this._vizTooltip) {
					this._vizTooltip.destroy();
				}
			}
		}
	};

	/**
	 * updates the formatter of vizPopover / vizTooltip based on current chartType PERCENT formatter for all 100% chartTypes STANDARDFLOAT formatter
	 * otherwise.
	 *
	 * @private
	 */
	SmartChart.prototype._updateVizTooltipFormatter = function() {
		// Needs to be called when tooltip gets enabled and when chartType changes!
		if (this._vizTooltip) {
			if (this._oChart.getChartType().match(/100/) !== null) {
				this._vizTooltip.setFormatString(ChartFormatter.DefaultPattern.PERCENT);
			} else {
				this._vizTooltip.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
			}
		}
	};

	/**
	 * Returns the chart object used internally.<br>
	 * <b>Note:</b> Direct changes made to the inner {@link sap.chart.Chart chart} object or its {@link sap.viz.ui5.controls.VizFrame vizFrame} might
	 * lead to inconsistencies and side effects during runtime, as the <code>SmartChart</code> control doesn't listen to all changes made to the
	 * inner {@link sap.chart.Chart chart} instance. To avoid this, please use the API provided by the <code>SmartChart</code> control itself.
	 * <b>Note:</b> Calling this method when the chart is not yet initialized causes the inner chart to load synchronously. This does not fulfill CSP requirements. Please use <code>getChartAsync</code> instead.
	 *
	 * @returns {sap.chart.Chart} The inner chart object
	 * @public
	 * @deprecated As of version 1.57, replaced by {@link #getChartAsync}
	 */
	SmartChart.prototype.getChart = function() {

		if (!this._oChart && this._bMetadataIsInitialised) {
			//sync load dependencies before
			sap.ui.getCore().loadLibrary('sap.chart');
			ChartLibrary = sap.ui.requireSync('sap/chart/library');
			Chart = sap.ui.requireSync('sap/chart/Chart');
			ColoringType = sap.ui.requireSync('sap/chart/ColoringType');
			Dimension = sap.ui.requireSync('sap/chart/data/Dimension');
			HierarchyDimension = sap.ui.requireSync('sap/chart/data/HierarchyDimension');
			TimeDimension = sap.ui.requireSync('sap/chart/data/TimeDimension');
			Measure = sap.ui.requireSync('sap/chart/data/Measure');
			MeasureSemantics = sap.ui.requireSync('sap/chart/data/MeasureSemantics');
			VizTooltip = sap.ui.requireSync('sap/viz/ui5/controls/VizTooltip');
			ChartFormatter = sap.ui.requireSync('sap/viz/ui5/format/ChartFormatter');

			//... and init the inner chart
			this._initialiseInnerChart();
		} else if (!this._bMetadataIsInitialised){
			Log.error("Accesing the inner chart before the metadata is initialized will not work. Instead, wait for the initialized event!");
		}

		Log.error("This function is deprecated, please use getChartAsync instead");
		return this._oChart;
	};
	/**
	 * Returns a promise which will be resolved with the internally used chart object, once all dependencies have been loaded.<br>
	 * <b>Note:</b> Direct changes made to the inner {@link sap.chart.Chart chart} object or its {@link sap.viz.ui5.controls.VizFrame vizFrame} might
	 * lead to inconsistencies and side effects during runtime, as the <code>SmartChart</code> control doesn't listen to all changes made to the
	 * inner {@link sap.chart.Chart chart} instance. To avoid this, please use the API provided by the <code>SmartChart</code> control itself.
	 *
	 * @returns {Promise<sap.chart.Chart>} Promise for inner chart object
	 * @public
	 * @since 1.57.0
	 */
	SmartChart.prototype.getChartAsync = function() {

		if (!this._oChart && this._bMetadataIsInitialised) {

			return new Promise(function(resolve, reject) {

				sap.ui.require([
					"sap/chart/library", "sap/chart/Chart", "sap/chart/ColoringType", "sap/chart/data/Dimension", "sap/chart/data/HierarchyDimension", "sap/chart/data/TimeDimension", "sap/chart/data/Measure", "sap/chart/data/MeasureSemantics", "sap/viz/ui5/controls/VizTooltip", "sap/viz/ui5/format/ChartFormatter"
				], function(fnChartLibrary, fnChart, oColoringType, fnDimension, fnHierarchyDimension, fnTimeDimension, fnMeasure, oMeasureSemantics, fnVizTooltip, oChartFormatter) {

					ChartLibrary = fnChartLibrary;
					Chart = fnChart;
					ColoringType = oColoringType;
					Dimension = fnDimension;
					HierarchyDimension = fnHierarchyDimension;
					TimeDimension = fnTimeDimension;
					Measure = fnMeasure;
					MeasureSemantics = oMeasureSemantics;
					VizTooltip = fnVizTooltip;
					ChartFormatter = oChartFormatter;

					if (!this._oChart) {
						this._initialiseInnerChart();
					}
					if (this._oChart) {
						resolve(this._oChart);
					} else {
						reject("The inner chart couldn't be created");
					}
				}.bind(this));
			}.bind(this));

		} else if (!this._bMetadataIsInitialised){
			Log.error("Accessing the inner chart before the metadata is initialized will not work. Instead, wait for the initialized event!");
			return Promise.reject(new Error('Accessing the inner chart before the metadata is initialized will not work. Instead, wait for the initialized event!'));
		} else {
			//Inner chart instance exists already
			return Promise.resolve(this._oChart);
		}
	};

	SmartChart.prototype._getChartTypes = function() {
		var mChartTypes;
		try {
			mChartTypes = ChartLibrary.api.getChartTypes();
		} catch (ex) {
			mChartTypes = {};
			Log.error("sap.chart.api.getChartTypes throws an exception.\n" + ex.toString());
		}

		return mChartTypes;
	};

	SmartChart.prototype.getAvailableChartTypes = function() {
		var i, sKey, aAvailableChartTypes = [], aChartTypes, mChartTypes = {}, aIgnoredChartTypes;

		if (this._oChart) {

			aIgnoredChartTypes = PersoUtil.createArrayFromString(this.getIgnoredChartTypes());

			mChartTypes = this._getChartTypes();
			aChartTypes = this._oChart.getAvailableChartTypes().available;
			if (aChartTypes) {
				for (i = 0; i < aChartTypes.length; i++) {
					sKey = aChartTypes[i].chart;
					if (aIgnoredChartTypes.indexOf(sKey) < 0) {
						aAvailableChartTypes.push({
							key: sKey,
							text: mChartTypes[sKey]
						});
					}
				}
			}
		}

		return aAvailableChartTypes;
	};

	SmartChart.prototype._getAllChartTypes = function() {
		var sKey, aAllChartTypes = [], mChartTypes, aIgnoredChartTypes;

		aIgnoredChartTypes = PersoUtil.createArrayFromString(this.getIgnoredChartTypes());

		mChartTypes = this._getChartTypes();

		for (sKey in mChartTypes) {
			if (sKey) {
				if (aIgnoredChartTypes.indexOf(sKey) < 0) {
					aAllChartTypes.push({
						key: sKey,
						text: mChartTypes[sKey]
					});
				}
			}
		}

		return aAllChartTypes;
	};

	SmartChart.prototype._retrieveChartTypeDescription = function(sCharType) {
		var mChartTypes = this._getChartTypes();
		return ({
			key: sCharType,
			text: mChartTypes[sCharType]
		});
	};

	SmartChart.prototype._setChartType = function(sChartType) {

		if (this._oChart) {
			var sHeight = this._oChart.getHeight();
			this._oChart.setChartType(sChartType);

			// clear selected detail entries
			this._aDetailsEntries = [];

			// toggle the unit bindings of each measure based on chart type
			this._toggleMeasureUnitBinding(sChartType, this._oChart.getMeasures());
			// to be save set the Height again as it sometimes shrinked
			this._oChart.setHeight(sHeight);
		}
	};

	SmartChart.prototype._toggleMeasureUnitBinding = function(sChartType, aMeasures) {

		if (typeof aMeasures != 'undefined' && aMeasures instanceof Array) {

			if (sChartType.substring(0, 4) === "100_") {
				// Delete all unit bindings when chartType is percentage type
				aMeasures.forEach(function(oMeasure) {
					oMeasure.setUnitBinding();
				});
			} else {

				if (this._oChartProvider) {
					// Bring back the unit bindings for each measure from the metadata fields.
					var aFieldMetadata = this._oChartProvider._aODataFieldMetadata;

					aMeasures.forEach(function(oMeasure) {
						// Run until we found the correct field
						for (var i = aFieldMetadata.length - 1; i >= 0; i--) {
							if (aFieldMetadata[i].name == oMeasure.getName()) {
								if (aFieldMetadata[i]["Org.OData.Measures.V1.ISOCurrency"] && aFieldMetadata[i]["Org.OData.Measures.V1.ISOCurrency"].Path) {
									oMeasure.setUnitBinding(aFieldMetadata[i]["Org.OData.Measures.V1.ISOCurrency"].Path);
								} else if (aFieldMetadata[i]["Org.OData.Measures.V1.Unit"] && aFieldMetadata[i]["Org.OData.Measures.V1.Unit"].Path) {
									oMeasure.setUnitBinding(aFieldMetadata[i]["Org.OData.Measures.V1.Unit"].Path);
								}
								break;
							}
						}
					});
				}
			}
		}
	};

	SmartChart.prototype._getDimensions = function() {
		var aDimensions = [];

		if (this._oChart) {
			aDimensions = this._oChart.getDimensions();
		}

		return aDimensions;
	};

	SmartChart.prototype._getVisibleDimensions = function() {
		var aVisibleDimensions = [];

		if (this._oChart) {
			aVisibleDimensions = this._oChart.getVisibleDimensions();
		}

		return aVisibleDimensions;
	};

	SmartChart.prototype._getMeasures = function() {
		var aMeasures = [];

		if (this._oChart) {
			aMeasures = this._oChart.getMeasures();
		}

		return aMeasures;
	};

	SmartChart.prototype._getVisibleMeasures = function() {
		var aVisibleMeasures = [];

		if (this._oChart) {
			aVisibleMeasures = this._oChart.getVisibleMeasures();
		}

		return aVisibleMeasures;
	};

	SmartChart.prototype._getSortedDimensions = function() {
		var aDimensions = [];
		if (this._oChart) {
			aDimensions = this._oChart.getDimensions();
			if (aDimensions) {
				aDimensions.sort(function(a, b) {
					if (a.getLabel() && b.getLabel()) {
						return a.getLabel().localeCompare(b.getLabel());
					}
				});
			}
		}
		return aDimensions;
	};

	/**
	 * @typedef {object} sap.ui.comp.SmartChart.Variant.DimeasureItem
	 * @property {string} aggregationRole Aggregation role of the <code>DimeasureItem</code>, which can be either a <code>Dimension</code> or a <code>Measure</code>
	 * @property {string} columnKey Name of the property this <code>DimeasureItem</code> refers to in the metadata
	 * @property {int}  index Position of the dimension/name in the chart's drill stack
	 * @property {string} role The chart role of the dimension or measure
	 * @property {boolean} visible Determines whether the dimension or measure is currently visualized in the chart
	 */
	/**
	 * @typedef {object} sap.ui.comp.SmartChart.Variant.FilterItem
	 * @property {string} columnKey Name of the property this <code>DimeasureItem</code> refers to in the metadata
	 * @property {boolean} exclude Determines whether this is an exclude filter
	 * @property {string} operation Filter operation used for this filter
	 * @property {*} value1 Value 1 for the filter operation
	 * @property {*} [value2] Value 2 for the filter operation
	 */
	/**
	 * @typedef {object} sap.ui.comp.SmartChart.Variant.SortItem
	 * @property {string} columnKey Name of the property this <code>DimeasureItem</code> refers to in the metadata
	 * @property {string} operation Sort operation, which can be either <code>Ascending</code> or <code>Descending</code>
	 */
	/**
	 * @typedef {object} sap.ui.comp.SmartChart.Variant.Dimeasure
	 * @property {string} [chartTypeKey] Internal key of the chart type stored in the variant
	 * @property {sap.ui.comp.SmartChart.Variant.DimeasureItem[]} dimeasureItems Representation of all dimension and measures in the chart and their current state
	 */
	/**
	 * @typedef {object} sap.ui.comp.SmartChart.Variant.Filter
	 * @property {sap.ui.comp.SmartChart.Variant.FilterItem[]} filterItems Representation of all current filters of the chart
	 */
	/**
	 * @typedef {object} sap.ui.comp.SmartChart.Variant.Sort
	 * @property {sap.ui.comp.SmartChart.Variant.SortItem[]} sortItems Representation of all current sorters of the chart
	 */
    /**
      * @typedef {object} sap.ui.comp.SmartChart.Variant
      * @property {sap.ui.comp.SmartChart.Variant.Dimeasure} dimeasure Information about all measures and dimensions of the chart
      * @property {sap.ui.comp.SmartChart.Variant.Filter} [filter] Information about the current filters applied to the chart
      * @property {sap.ui.comp.SmartChart.Variant.Sort} [sort] Information about the current sorters applied to the chart
      * @public
      */
	/**
	 * Function for the {@link sap.ui.comp.smartvariants.SmartVariantManagement} control that returns the currently used variant data in an internal format.
	 * <b>Note:</b> This function must not be used by applications.
	 * @protected
	 *
	 * @returns {sap.ui.comp.SmartChart.Variant} The currently used variant in an internal format
	 */
	SmartChart.prototype.fetchVariant = function() {
		if (this._oCurrentVariant === "STANDARD" || this._oCurrentVariant === null) {
			return {};
		}

		return this._oCurrentVariant;
	};

	/**
	 * Interface function for SmartVariantManagement control that applies the current variant.
	 *
	 * @param {sap.ui.comp.SmartChart.Variant} oVariantJSON The variant JSON
	 * @param {string} sContext Describes the context in which the variant has been applied
	 * @public
	 */
	SmartChart.prototype.applyVariant = function(oVariantJSON, sContext) {
		this._oCurrentVariant = oVariantJSON;
		if (this._oCurrentVariant === "STANDARD") {
			this._oCurrentVariant = null;
		}

		// Set instance flag to indicate that we are currently in the process of applying the changes
		this._bApplyingVariant = true;

		if (this._oPersController) {
			if (this._oCurrentVariant === null || jQuery.isEmptyObject(this._oCurrentVariant)) {
				this._oPersController.resetPersonalization(ResetType.ResetFull);
			} else {
				this._oPersController.setPersonalizationData(this._oCurrentVariant, true);
			}
		}

		// Clear apply variant flag!
		this._bApplyingVariant = false;

		this.fireAfterVariantApply({
			currentVariantId: this.getCurrentVariantId()
		});
	};

	/**
	 * Interface function for SmartVariantManagment control. It indicates, that the variant management is fully initialized.
	 *
	 * @internal
	 */
	SmartChart.prototype.variantsInitialized = function() {
		this._bVariantInitialised = true;
		this._checkAndTriggerBinding();
	};

	/**
	 * The method returns the current UI state of SmartChart control.
	 *
	 * @returns {sap.ui.comp.state.UIState} Current UI state
	 * @public
	 */
	SmartChart.prototype.getUiState = function() {
		//load sync in case somebody calls this before inner structure was initialised
		if (!this.isInitialised()) {
			Log.error("SmartChart: Called getUiState() before inner structure was initialized. This will force a synchronous load of dependencies.");
			this.getChart();
		}


		var oDataSuiteFormat = this._oPersController ? this._oPersController.getDataSuiteFormatSnapshot() : null;
		return new UIState({
			presentationVariant: {
				ContextUrl: "", // TODO
				MaxItems: this._oChartProvider ? this._oChartProvider.getMaxItems() : undefined,
				SortOrder: oDataSuiteFormat ? oDataSuiteFormat.SortOrder : [],
				GroupBy: oDataSuiteFormat ? oDataSuiteFormat.GroupBy : [],
				Total: oDataSuiteFormat ? oDataSuiteFormat.Total : [],
				RequestAtLeast: this._getInResultDimensionTotal(),
				Visualizations: oDataSuiteFormat ? oDataSuiteFormat.Visualizations : []
			},
			selectionVariant: {
				SelectOptions: oDataSuiteFormat ? oDataSuiteFormat.SelectOptions : []
			},
			variantName: this.getCurrentVariantId()
		});
	};

	/**
	 * The method replaces the current UI state of SmartChart control with
	 * the data represented in <code>uiState</code>.
	 *
	 * @param {sap.ui.comp.state.UIState} oUiState the new representation of UI state
	 * @public
	 */
	SmartChart.prototype.setUiState = function(oUiState) {
		if (this._oPersController) {
			var oPersistentDataVariant = (this._oVariantManagement && oUiState.getVariantName()) ? this._oVariantManagement.getVariantContent(this, oUiState.getVariantName()) : {};
			this._oPersController.setDataSuiteFormatSnapshot(merge({}, oUiState.getPresentationVariant(), oUiState.getSelectionVariant()), oPersistentDataVariant, true);
		}

		this._setInResultDimensionFromVariant(oUiState);
	};

	SmartChart.prototype.setUiStateAsVariant = function(oUiState) {
		if (this._oPersController) {
			this._oPersController.setPersonalizationDataAsDataSuiteFormat(merge({}, oUiState.getPresentationVariant(), oUiState.getSelectionVariant()), true);
		}

		this._setInResultDimensionFromVariant(oUiState);
	};

	SmartChart.prototype._setInResultDimensionFromVariant = function(oUiState) {
		// TODO what is about MaxItems? How should it be set into oChart? Do we need a rebind for it?
		// TODO Do we need a rebind after 'InResult' is set?
		if (oUiState.getPresentationVariant() && this._oChart) {
			this._oChart.setInResultDimensions(oUiState.getPresentationVariant().RequestAtLeast);
		} else {
			//In case we're in async mode and no inner chart exists yet
			this._oUiStateRequestAtLeast = oUiState.getPresentationVariant().RequestAtLeast;
		}
	};

	SmartChart.prototype.setRequestAtLeastFields = function(sRequestAtLeastFields) {
		this.setProperty("requestAtLeastFields", sRequestAtLeastFields);
		if (this._oChart) {
			this._updateInResultDimensions();
		}
		return this;
	};

	SmartChart.prototype._getInResultDimensionTotal = function() {
		var aInResultDimensions = [];

		// From requestAtLeast property
		if (this.getRequestAtLeastFields()) {
			aInResultDimensions = this.getRequestAtLeastFields().split(",");
		}
		// From presentationVariant
		aInResultDimensions = aInResultDimensions.concat(this._aAlwaysSelect);

		// From inner chart inResultDimension property
		if (this._oChart) {
			aInResultDimensions = aInResultDimensions.concat(this._oChart.getInResultDimensions());
		}

		//From setUiState in case inner chart was not available at this point.
		if (this._oUiStateRequestAtLeast) {
			aInResultDimensions.concat(this._oUiStateRequestAtLeast);
			//reset
			this._oUiStateRequestAtLeast = null;
		}

		// Get rid of double entries
		return aInResultDimensions.filter(function(elem, index, self) {
			return index == self.indexOf(elem);
		});
	};

	SmartChart.prototype._getFieldTooltip = function(sKey) {
		var oField = this._getFieldByKey(sKey);
		if (oField) {
			return oField.quickInfo;
		}

		return "";
	};
	SmartChart.prototype._getFieldByKey = function(sKey) {

		var i, oField = null;

		if (this._oChartViewMetadata && this._oChartViewMetadata.fields) {
			for (i = 0; i < this._oChartViewMetadata.fields.length; i++) {

				oField = this._oChartViewMetadata.fields[i];
				if (sKey === oField.name) {
					return oField;
				}
			}

			return null;
		}
	};

	/**
	 * Returns the column for the given column key
	 *
	 * @param {array} aArray list of chart objects
	 * @param {string} sKey - the column key for the required column
	 * @returns {object} The found column or null
	 * @private
	 */
	SmartChart.prototype._getByKey = function(aArray, sKey) {
		var i, iLength, oCharObj, oCustomData;

		if (aArray) {
			iLength = aArray.length;
			for (i = 0; i < iLength; i++) {
				oCharObj = aArray[i];
				oCustomData = oCharObj.data("p13nData");
				if (oCustomData && oCustomData.columnKey === sKey) {
					return oCharObj;
				}
			}
		}

		return null;
	};

	SmartChart.prototype._getDimensionByKey = function(sKey) {
		if (this._oChart) {
			return this._getByKey(this._oChart.getDimensions(), sKey);
		}

		return null;
	};

	SmartChart.prototype._getMeasureByKey = function(sKey) {
		if (this._oChart) {
			return this._getByKey(this._oChart.getMeasures(), sKey);
		}

		return null;
	};

	SmartChart.prototype._getChartObjByKey = function(sKey) {
		var oChartObj = this._getDimensionByKey(sKey);
		if (!oChartObj) {
			oChartObj = this._getMeasureByKey(sKey);
		}

		return oChartObj;
	};

	/**
	 * Retrieves the path for the specified property and column key from the array of table columns
	 *
	 * @param {string} sColumnKey - the column key specified on the table
	 * @param {string} sProperty - the property path that needs to be retrieved from the column
	 * @returns {string} The path that can be used by sorters, filters etc.
	 * @private
	 */
	SmartChart.prototype._getPathFromColumnKeyAndProperty = function(sColumnKey, sProperty) {
		var sPath = null, oChartObj, oCustomData;
		oChartObj = this._getChartObjByKey(sColumnKey);

		// Retrieve path from the property
		if (oChartObj) {
			oCustomData = oChartObj.data("p13nData");
			if (oCustomData) {
				sPath = oCustomData[sProperty];
			}
		}

		return sPath;
	};

	/**
	 * returns the current filter and sorting options from the table personalisation/variants
	 *
	 * @private
	 * @returns {object} current variant's filter and sorting options
	 */
	SmartChart.prototype._getChartPersonalisationData = function() {
		if (!this._oCurrentVariant) {
			return null;
		}
		var aSorters = [], aFilters = [], aExcludeFilters = [], oExcludeFilters, aSortData, sPath;

		// Sort handling
		if (this._oCurrentVariant.sort) {
			aSortData = this._oCurrentVariant.sort.sortItems;
		} else {
			aSortData = this._aInitialSorters;
		}

		if (aSortData) {
			aSortData.forEach(function(oModelItem) {
				var bDescending = oModelItem.operation === "Descending";
				sPath = oModelItem.columnKey;
				aSorters.push(new Sorter(sPath, bDescending));

			}, this);
		}

		// Filter Handling
		if (this._oCurrentVariant.filter) {
			this._oCurrentVariant.filter.filterItems.forEach(function(oModelItem) {
				var oValue1 = oModelItem.value1, oValue2 = oModelItem.value2;
				// Filter path has be re-calculated below
				sPath = oModelItem.columnKey;
				var oChartField;
				if (this._oChartViewMetadata && this._oChartViewMetadata.fields ) {
					oChartField = this._oChartViewMetadata.fields.find(function(oMetadata) {return oMetadata.name === sPath;});
				}


				if (oValue1 instanceof Date && this._oChartProvider && this._oChartProvider.getIsUTCDateHandlingEnabled()) {
					oValue1 = DateTimeUtil.localToUtc(oValue1);
					oValue2 = oValue2 ? DateTimeUtil.localToUtc(oValue2) : oValue2;
				}
				if (oModelItem.exclude) {

					if (oModelItem.operation === "Empty") {

						aExcludeFilters.push(new Filter(sPath, "NE", ""));

						if (oChartField && oChartField.isNullable) {
							aExcludeFilters.push(new Filter(sPath, "NE", null));
						}

					} else {
						aExcludeFilters.push(new Filter(sPath, FilterUtil.getTransformedExcludeOperation(oModelItem.operation), oModelItem.operation === "Empty" ? "" : oValue1, oValue2));
					}
				} else if (oModelItem.operation === "Empty") {

					aFilters.push(new Filter(sPath, "EQ", ""));

					if (oChartField && oChartField.isNullable) {
						aFilters.push(new Filter(sPath, "EQ", null));
					}

				} else {
					aFilters.push(new Filter(sPath, oModelItem.operation, oValue1, oValue2));
				}
			}, this);

			if (aExcludeFilters.length) {
				oExcludeFilters = new Filter(aExcludeFilters, true);
			}
		}

		return {
			filters: aFilters,
			excludeFilters: oExcludeFilters,
			sorters: aSorters
		};
	};

	/**
	 * triggers (hidden) VariantManagementControl to persist personalisation this function is called in case no VariantManagementControl is used
	 *
	 * @private
	 */
	SmartChart.prototype._persistPersonalisation = function() {
		var sPersonalisationVariantName = "Personalisation";
		// implicit persistency should be disabled in Visual Editor, see customer case CS20220002582153
		if (!sap.ui.getCore().getConfiguration().getDesignMode() && this._oVariantManagement && !this._oVariantManagement.isPageVariant()) {
			var sPersonalisationVariantKey = this._oVariantManagement.getViewIdByName(sPersonalisationVariantName);
			if (sPersonalisationVariantKey === null) {
				sPersonalisationVariantKey = this.getCurrentVariantId();
			}

			// It seems Save is triggered again during Save by perso controller!
			if (!this._bSaving) {
				this._bSaving = true;
				this._oVariantManagement.fireSave({
					name: sPersonalisationVariantName,
					implicit: true,
					global: false,
					overwrite: !!sPersonalisationVariantKey,
					key: sPersonalisationVariantKey,
					def: true
				});
				delete this._bSaving;
			}
		}
	};

	/**
	 * Returns the ID of the currently selected variant.
	 *
	 * @public
	 * @returns {string} ID of the currently selected variant
	 */
	SmartChart.prototype.getCurrentVariantId = function() {
		var sKey = "";

		if (this._oVariantManagement) {
			sKey = this._oVariantManagement.getCurrentVariantId();
		}

		return sKey;
	};

	/**
	 * Applies the current variant based on the sVariantId parameter. If an empty string or null or undefined have been passed, the standard variant
	 * will be used. The standard variant will also be used if the passed sVariantId cannot be found. If the flexibility variant, the content for the
	 * standard variant, or the personalizable control cannot be obtained, no changes will be made.
	 *
	 * @public
	 * @param {string} sVariantId ID of the currently selected variant
	 */
	SmartChart.prototype.setCurrentVariantId = function(sVariantId) {
		if (this._oVariantManagement && !this._oVariantManagement.isPageVariant()) {
			this._oVariantManagement.setCurrentVariantId(sVariantId);
		} else {
			Log.error("sap.ui.comp.smartchart.SmartChart.prototype.setCurrentVariantId: VariantManagement does not exist or is a page variant");
		}
		return this;
	};

	SmartChart.prototype._adjustHeight = function() {
		// only if chart is not in full screen
		if (this._oChart) {
			var iToolbarHeight = 0, iBreadCrumbsHeight = 0;
			// Only save height when not in full-screen mode
			var iHeight = this.getDomRef() ? this.getDomRef().offsetHeight : 0;

			if (iHeight === 0) {
				return;
			}

			if (this._oToolbar && this._oToolbar.getDomRef()) {
				iToolbarHeight = this._oToolbar.getDomRef().offsetHeight;
			}

			if (this._oDrillBreadcrumbs && this._oDrillBreadcrumbs.getDomRef()) {
				// breadcrumbs are rendered inside a div and have margins
				var oBreadcrumbsNode = this._oDrillBreadcrumbs.getDomRef().parentNode ? this._oDrillBreadcrumbs.getDomRef().parentNode : this._oDrillBreadcrumbs.getDomRef();
				iBreadCrumbsHeight = oBreadcrumbsNode.offsetHeight;
			}

			var iChartHeight = iHeight - iToolbarHeight - iBreadCrumbsHeight;
			this._oChart.setHeight(iChartHeight + "px");
			// update breadcrumbs in order to react on size changes of the window
			// TODO: Evaluate for a more lightweight solution in the future.
			this._updateDrillBreadcrumbs();
			// If overlay is active, it need to be set again because of setHeight on oChart
			if (this._hasOverlay) {
				setTimeout(function() {
					this._showOverlay(true);
				}.bind(this), 0);
			}
		}
	};

	SmartChart.prototype._toggleFullScreen = function(bValue, bForced) {
		if (!this.oFullScreenButton || (bValue === this.bFullScreen && !bForced)) {
			return;
		}

		if (bValue == true && this._oChart) {
			// store old chart Height
			this._sChartHeight = this._oChart.getHeight();
			this._oChart.setHeight("100%");
		}

		this.bFullScreen = bValue;
		FullScreenUtil.toggleFullScreen(this, this.bFullScreen, this.oFullScreenButton, this._toggleFullScreen, "sapContrastPlus", true);

		if (!bValue)  {
			this._adjustHeight();
		}

		this._renderFullScreenButton();
		// Fire the fullScreen Event
		this.fireFullScreenToggled({
			fullScreen: bValue
		});

		if (bValue == false && this._oChart) {
			this._oChart.setHeight(this._sChartHeight);
		}

	};

	/**
	 * Renders the look and feel of the full screen button
	 */
	SmartChart.prototype._renderFullScreenButton = function() {
		this.oFullScreenButton.setTooltip(this.bFullScreen ? this._oRb.getText("CHART_MINIMIZEBTN_TOOLTIP") : this._oRb.getText("CHART_MAXIMIZEBTN_TOOLTIP"));
		this.oFullScreenButton.setText(this.bFullScreen ? this._oRb.getText("CHART_MINIMIZEBTN_TEXT") : this._oRb.getText("CHART_MAXIMIZEBTN_TEXT"));
		this.oFullScreenButton.setIcon(this.bFullScreen ? "sap-icon://exit-full-screen" : "sap-icon://full-screen");
	};

	/**
	 * Enriches the chart with data point information.
	 *
	 * @param {array} aDataPoints collection of data points and measures
	 * @private
	 */
	SmartChart.prototype._enrichFromDataPoints = function(aDataPoints) {
		var iLen = aDataPoints.length;

		var aColoringMeasures = [];

		var oMeasureValues = {};

		for (var i = 0; i < iLen; i++) {
			this._interpretDataPoint(aDataPoints[i].dataPoint, aDataPoints[i].measure, oMeasureValues, aColoringMeasures);
		}

		// switch the coloring
		if (aColoringMeasures.length > 0) {
			this._oChart.setActiveColoring({
				coloring: ColoringType.Criticality,
				parameters: {
					measure: aColoringMeasures
				}
			});

			this._oChart.setColorings({
				Criticality: {
					MeasureValues: oMeasureValues
				}
			});
		}
	};

	/**
	 * Interprets the data point information to patterns, boundaries and coloring.
	 *
	 * @param {object} oDataPoint UI.DataPoint annotation
	 * @param {object} oMeasure current measure
	 * @param {object} oMeasureValues current criticality measure values to enhance
	 * @param {array} aColoringMeasures array containing all measures for which coloring should be updated
	 * @returns {boolean} <code>true</code> if coloring for the current measure is set
	 * @private
	 */
	SmartChart.prototype._interpretDataPoint = function(oDataPoint, oMeasure, oMeasureValues, aColoringMeasures) {
		this._setSemanticPatterns(oDataPoint, oMeasure);

		if (oMeasure.setBoundaryValues) {
			this._setBoundaryValues(oDataPoint, oMeasure);
		}

		// semantic coloring
		if (oDataPoint.Criticality || oDataPoint.CriticalityCalculation) {
			oMeasureValues[oDataPoint.Value.Path] = this._oChartProvider.provideSemanticColoring(oDataPoint);
			aColoringMeasures.push(oDataPoint.Value.Path);
		}

	};

	/**
	 * Sets the semantic patterns for the UI.DataPoint annotation
	 *
	 * @param {object} oDataPoint UI.DataPoint annotation
	 * @param {object} oMeasure current measure
	 * @private
	 */
	SmartChart.prototype._setSemanticPatterns = function(oDataPoint, oMeasure) {
		// semantic patterns
		var sReferenceMeasureName = oDataPoint.TargetValue ? oDataPoint.TargetValue.Path : null;
		var sProjectedMeasureName = oDataPoint.ForecastValue ? oDataPoint.ForecastValue.Path : null;

		oMeasure.setSemantics(MeasureSemantics.Actual);

		if (sReferenceMeasureName != null) {
			var oReferenceMeasure = this._oChart.getMeasureByName(sReferenceMeasureName);
			if (oReferenceMeasure) {
				oReferenceMeasure.setSemantics(MeasureSemantics.Reference);
			} else {
				Log.error("sap.ui.comp.SmartChart: " + oDataPoint.TargetValue.Path + " is not a valid measure");
			}
		}
		if (sProjectedMeasureName) {
			var oProjectionMeasure = this._oChart.getMeasureByName(sProjectedMeasureName);
			if (oProjectionMeasure) {
				oProjectionMeasure.setSemantics(MeasureSemantics.Projected);
			} else {
				Log.error("sap.ui.comp.SmartChart: " + oDataPoint.ForecastValue.Path + " is not a valid measure");
			}
		}

		oMeasure.setSemanticallyRelatedMeasures({
			referenceValueMeasure: sReferenceMeasureName,
			projectedValueMeasure: sProjectedMeasureName
		});

	};

	/**
	 * Sets the boundary values for the UI.DataPoint annotation.
	 *
	 * @param {object} oDataPoint UI.DataPoint annotation
	 * @param {object} oMeasure current measure
	 * @private
	 */
	SmartChart.prototype._setBoundaryValues = function(oDataPoint, oMeasure) {
		var oBoundaryValues = {};

		if (oDataPoint.MinimumValue) {
			oBoundaryValues.minimum = oDataPoint.MinimumValue;
		}
		if (oDataPoint.MaximumValue) {
			oBoundaryValues.maximum = oDataPoint.MaximumValue;
		}

		if (oBoundaryValues.minimum || oBoundaryValues.maximum) {
			oMeasure.setBoundaryValues(oBoundaryValues);
		}
	};

	/**
	 * Checks whether the control is initialized.
	 *
	 * @returns {boolean} returns whether the control is already initialized
	 * @protected
	 */
	SmartChart.prototype.isInitialised = function() {
		return !!this.bIsInitialised;
	};

	/**
	 * Cleans up the control.
	 *
	 * @protected
	 */
	SmartChart.prototype.exit = function() {

		this._oRb = null;

		if (this._oSmartFilter) {
			this._oSmartFilter.detachSearch(this._reBindChart, this);
			this._oSmartFilter.detachFilterChange(this._filterChangeEvent, this);
		}

		if (this._oChartProvider && this._oChartProvider.destroy) {
			this._oChartProvider.destroy();
		}
		this._oChartProvider = null;

		if (this._oPersController && this._oPersController.destroy) {
			this._oPersController.destroy();
		}

		if (this._oSegmentedButton) {
			this._oSegmentedButton.removeAllButtons();
			this._oButtonChart1.destroy();
			this._oButtonChart2.destroy();
			this._oButtonChart3.destroy();
			this._oButtonChart4.destroy();
			this._oButtonChart5.destroy();

			this._oButtonChart1 = null;
			this._oButtonChart2 = null;
			this._oButtonChart3 = null;
			this._oButtonChart4 = null;
			this._oButtonChart5 = null;
		}

		this._oPersController = null;
		if (this._oVariantManagement) {

			this._oVariantManagement.detachSave(this._variantSaved, this);
			this._oVariantManagement.detachAfterSave(this._variantAfterSave, this);

			if (!this._oVariantManagement.isPageVariant() && this._oVariantManagement.destroy) {
				this._oVariantManagement.destroy();
			}
		}
		this._oVariantManagement = null;

		this._destroyPopover();

		FullScreenUtil.cleanUpFullScreen(this);

		if (this._oDetailsPopover) {
			this._oDetailsPopover.destroy();
			// This is not part of the popover until we have several semantic objects resolved for
			// a selected data point
			if (this._oRelatedAppsMasterList) {
				this._oRelatedAppsMasterList.destroy();
			}
		}

		//this._processResizeHandler(false);

		if (this._oChart) {
			this._oChart.detachRenderComplete(this._toggleZoomButtonEnablement, this);
		}

		this._oCurrentVariant = null;
		this._oChartViewMetadata = null;
		this._aAlwaysSelect = null;
		this._aInitialSorters = null;
		this._oSmartFilter = null;
		this._oToolbar = null;
		this._oChartPersonalisationButton = null;
		this._oView = null;
		this._oChart = null;
		this._bDisableTimeseriesUTC = null;
		this._bWorkaroundVizFormatter = null;
	};

	/**
	 * Process the attaching of the resize handler to the smart chart
	 *
	 * @param {boolen} bAttach If set to <code>true</code> the resize handler is attached, if set to <code>false</code> if is detached
	 * @private
	 */
	SmartChart.prototype._processResizeHandler = function(bAttach) {
		if (bAttach) {
			this.sResizeListenerId = null;
			if (Device.system.desktop) {
				this.sResizeListenerId = ResizeHandler.register(this, this._adjustHeight.bind(this));
			} else {
				Device.orientation.attachHandler(this._adjustHeight, this);
				Device.resize.attachHandler(this._adjustHeight, this);
			}
		} else {
			if (Device.system.desktop && this.sResizeListenerId) {
				ResizeHandler.deregister(this.sResizeListenerId);
				this.sResizeListenerId = null;
			} else {
				Device.orientation.detachHandler(this._adjustHeight, this);
				Device.resize.detachHandler(this._adjustHeight, this);
			}
		}
	};

	/**
	 * Change the visibility of the toolbar
	 *
	 * @param {boolean} bShowToolbar If set to <code>true</code> the toolbar is shown, if set to <code>false</code> it is not visible
	 * @public
	 * @since 1.54
	 */
	SmartChart.prototype.setShowToolbar = function(bShowToolbar) {
		if (this._oToolbar) {
			this._oToolbar.setVisible(bShowToolbar);
		}

		return this.setProperty("showToolbar", bShowToolbar, true);
	};

	/**
	 * Change the style of the toolbar
	 *
	 * @param {sap.m.ToolbarStyle} sStyle The style of the toolbar.
	 * @public
	 * @since 1.54
	 */
	SmartChart.prototype.setToolbarStyle = function(sStyle) {
		if (this._oToolbar) {
			this._oToolbar.setStyle(sStyle);
		}

		return this.setProperty("toolbarStyle", sStyle, true);
	};

	/**
	 * Change the visibility of the title in the dimensions area of the chart
	 *
	 * @param {boolean} bShowDimensionsTitle If set to <code>true</code> then the title of the dimensions is visible, if set to <code>false</code> not
	 * @since 1.54
	 */
	SmartChart.prototype.setShowDimensionsTitle = function(bShowDimensionsTitle) {
		if (this._oChart) {
			this._oChart.setVizProperties({
				"categoryAxis": {
					"title": {
						"visible": bShowDimensionsTitle
					}
				}
			});
		}

		return this.setProperty("showDimensionsTitle", bShowDimensionsTitle, true);
	};

	/**
	 * Change the visibility of the title in the measures area of the chart
	 *
	 * @param {boolean} bShowMeasuresTitle If set to <code>true</code> then the title of the measures is visible, if set to <code>false</code> not
	 * @since 1.54
	 */
	SmartChart.prototype.setShowMeasuresTitle = function(bShowMeasuresTitle) {
		if (this._oChart) {
			this._oChart.setVizProperties({
				"valueAxis": {
					"title": {
						"visible": bShowMeasuresTitle
					}
				}
			});
		}

		return this.setProperty("showMeasuresTitle", bShowMeasuresTitle, true);
	};

	SmartChart.prototype._checkDimensionColoring = function() {
		var aVisibleDimensions = this._getVisibleDimensions(), oField, oDimensionColoring = {
			Criticality: {
				DimensionValues: {}
			}
		}, oColoring;

		for (var i = 0; i < aVisibleDimensions.length; i++) {
			oField = this._getField(aVisibleDimensions[i]);

			oColoring = this._oChartProvider.calculateDimensionColoring(oField);

			if (oColoring) {
				if (this._sColoringDimension != oField.name) {
					oDimensionColoring.Criticality.DimensionValues[oField.name] = oColoring;

					this._oChart.setActiveColoring({
						coloring: ColoringType.Criticality,
						parameters: {
							dimension: oField.name
						}
					});

					this._oChart.setColorings(oDimensionColoring);
					this._sColoringDimension = oField.name;
				}
				return;
			}
		}
	};

	//override
	SmartChart.prototype.getIdForLabel = function() {
		if (this._headerText) {
			return this._headerText.getId();
		}

		//by default use the base class implementation
		return VBox.prototype.getIdForLabel.apply(this, []);
	};

	return SmartChart;

});
