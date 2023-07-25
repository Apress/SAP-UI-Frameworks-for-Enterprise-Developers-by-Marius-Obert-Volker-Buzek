/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

/**
 * Initialization Code and shared classes of library sap.suite.ui.commons.
 */
 sap.ui.define([
	"sap/ui/core/Core", // provides sap.ui.getCore()
	"sap/ui/core/library", // library dependency
	"sap/m/library" // library dependency
], function (Core) {
	"use strict";

	/**
	 * SAP UI library: sap.suite.ui.commons
	 *
	 * @namespace
	 * @alias sap.suite.ui.commons
	 * @public
	 */


	// library dependencies
	// delegate further initialization of this library to the Core
	var oSuiteCommonsLib = Core.initLibrary({
		name: "sap.suite.ui.commons",
		dependencies: ["sap.ui.core", "sap.m"],
		types: [
			"sap.suite.ui.commons.BulletChartMode",
			"sap.suite.ui.commons.CalculationBuilderComparisonOperatorType",
			"sap.suite.ui.commons.CalculationBuilderFunctionType",
			"sap.suite.ui.commons.CalculationBuilderItemType",
			"sap.suite.ui.commons.CalculationBuilderLayoutType",
			"sap.suite.ui.commons.CalculationBuilderLogicalOperatorType",
			"sap.suite.ui.commons.CalculationBuilderOperatorType",
			"sap.suite.ui.commons.CalculationBuilderValidationType",
			"sap.suite.ui.commons.CommonBackground",
			"sap.suite.ui.commons.ComparisonChartView",
			"sap.suite.ui.commons.DeviationIndicator",
			"sap.suite.ui.commons.FacetOverviewHeight",
			"sap.suite.ui.commons.FrameType",
			"sap.suite.ui.commons.HeaderContainerView",
			"sap.suite.ui.commons.ImageEditorContainerMode",
			"sap.suite.ui.commons.ImageEditorMode",
			"sap.suite.ui.commons.ImageFormat",
			"sap.suite.ui.commons.InfoTileSize",
			"sap.suite.ui.commons.InfoTileTextColor",
			"sap.suite.ui.commons.InfoTileValueColor",
			"sap.suite.ui.commons.LoadState",
			"sap.suite.ui.commons.MicroAreaChartView",
			"sap.suite.ui.commons.MicroProcessFlowRenderType",
			"sap.suite.ui.commons.networkgraph.ActionButtonPosition",
			"sap.suite.ui.commons.networkgraph.BackgroundColor",
			"sap.suite.ui.commons.networkgraph.ElementStatus",
			"sap.suite.ui.commons.networkgraph.LayoutAlgorithmType",
			"sap.suite.ui.commons.networkgraph.LayoutRenderType",
			"sap.suite.ui.commons.networkgraph.LineArrowOrientation",
			"sap.suite.ui.commons.networkgraph.LineArrowPosition",
			"sap.suite.ui.commons.networkgraph.LineType",
			"sap.suite.ui.commons.networkgraph.HeaderCheckboxState",
			"sap.suite.ui.commons.networkgraph.NodePlacement",
			"sap.suite.ui.commons.networkgraph.NodeShape",
			"sap.suite.ui.commons.networkgraph.NodeSize",
			"sap.suite.ui.commons.networkgraph.Orientation",
			"sap.suite.ui.commons.networkgraph.RenderType",
			"sap.suite.ui.commons.ProcessFlowConnectionLabelState",
			"sap.suite.ui.commons.ProcessFlowConnectionState",
			"sap.suite.ui.commons.ProcessFlowConnectionType",
			"sap.suite.ui.commons.ProcessFlowDisplayState",
			"sap.suite.ui.commons.ProcessFlowLaneState",
			"sap.suite.ui.commons.ProcessFlowNodeState",
			"sap.suite.ui.commons.ProcessFlowNodeType",
			"sap.suite.ui.commons.ProcessFlowZoomLevel",
			"sap.suite.ui.commons.SelectionState",
			"sap.suite.ui.commons.statusindicator.FillingType",
			"sap.suite.ui.commons.statusindicator.FillingDirectionType",
			"sap.suite.ui.commons.taccount.TAccountPanelState",
			"sap.suite.ui.commons.ThingGroupDesign",
			"sap.suite.ui.commons.TimelineAlignment",
			"sap.suite.ui.commons.TimelineAxisOrientation",
			"sap.suite.ui.commons.TimelineFilterType",
			"sap.suite.ui.commons.TimelineGroupType",
			"sap.suite.ui.commons.TimelineScrollingFadeout",
			"sap.suite.ui.commons.ValueStatus"
		],
		interfaces: [],
		controls: [
			"sap.suite.ui.commons.BulletChart",
			"sap.suite.ui.commons.BusinessCard",
			"sap.suite.ui.commons.CalculationBuilder",
			"sap.suite.ui.commons.CalculationBuilderExpression",
			"sap.suite.ui.commons.CalculationBuilderFunction",
			"sap.suite.ui.commons.CalculationBuilderInput",
			"sap.suite.ui.commons.CalculationBuilderItem",
			"sap.suite.ui.commons.CalculationBuilderVariable",
			"sap.suite.ui.commons.ChartContainer",
			"sap.suite.ui.commons.ChartContainerContent",
			"sap.suite.ui.commons.ChartContainerToolbarPlaceholder",
			"sap.suite.ui.commons.ChartTile",
			"sap.suite.ui.commons.ColumnMicroChart",
			"sap.suite.ui.commons.ComparisonChart",
			"sap.suite.ui.commons.CloudFilePicker",
			"sap.suite.ui.commons.DateRangeScroller",
			"sap.suite.ui.commons.DateRangeSlider",
			"sap.suite.ui.commons.DateRangeSliderInternal",
			"sap.suite.ui.commons.DeltaMicroChart",
			"sap.suite.ui.commons.DynamicContainer",
			"sap.suite.ui.commons.FacetOverview",
			"sap.suite.ui.commons.FeedItemHeader",
			"sap.suite.ui.commons.FeedTile",
			"sap.suite.ui.commons.GenericTile",
			"sap.suite.ui.commons.GenericTile2X2",
			"sap.suite.ui.commons.HarveyBallMicroChart",
			"sap.suite.ui.commons.HeaderCell",
			"sap.suite.ui.commons.HeaderContainer",
			"sap.suite.ui.commons.imageeditor.ImageEditor",
			"sap.suite.ui.commons.imageeditor.ImageEditorContainer",
			"sap.suite.ui.commons.InfoTile",
			"sap.suite.ui.commons.JamContent",
			"sap.suite.ui.commons.KpiTile",
			"sap.suite.ui.commons.LaunchTile",
			"sap.suite.ui.commons.LinkActionSheet",
			"sap.suite.ui.commons.MicroAreaChart",
			"sap.suite.ui.commons.MonitoringContent",
			"sap.suite.ui.commons.MonitoringTile",
			"sap.suite.ui.commons.networkgraph.Graph",
			"sap.suite.ui.commons.networkgraph.Node",
			"sap.suite.ui.commons.NewsContent",
			"sap.suite.ui.commons.NoteTaker",
			"sap.suite.ui.commons.NoteTakerCard",
			"sap.suite.ui.commons.NoteTakerFeeder",
			"sap.suite.ui.commons.NumericContent",
			"sap.suite.ui.commons.NumericTile",
			"sap.suite.ui.commons.PictureZoomIn",
			"sap.suite.ui.commons.ProcessFlow",
			"sap.suite.ui.commons.ProcessFlowConnection",
			"sap.suite.ui.commons.ProcessFlowConnectionLabel",
			"sap.suite.ui.commons.ProcessFlowLaneHeader",
			"sap.suite.ui.commons.ProcessFlowNode",
			"sap.suite.ui.commons.RepeaterViewConfiguration",
			"sap.suite.ui.commons.SplitButton",
			"sap.suite.ui.commons.statusindicator.StatusIndicator",
			"sap.suite.ui.commons.statusindicator.ShapeGroup",
			"sap.suite.ui.commons.statusindicator.Shape",
			"sap.suite.ui.commons.statusindicator.Rectangle",
			"sap.suite.ui.commons.statusindicator.Circle",
			"sap.suite.ui.commons.statusindicator.CustomShape",
			"sap.suite.ui.commons.statusindicator.PropertyThreshold",
			"sap.suite.ui.commons.statusindicator.DiscreteThreshold",
			"sap.suite.ui.commons.statusindicator.LibraryShape",
			"sap.suite.ui.commons.taccount.TAccount",
			"sap.suite.ui.commons.TargetFilter",
			"sap.suite.ui.commons.ThingCollection",
			"sap.suite.ui.commons.ThreePanelThingInspector",
			"sap.suite.ui.commons.ThreePanelThingViewer",
			"sap.suite.ui.commons.TileContent",
			"sap.suite.ui.commons.TileContent2X2",
			"sap.suite.ui.commons.Timeline",
			"sap.suite.ui.commons.TimelineFilterListItem",
			"sap.suite.ui.commons.TimelineItem",
			"sap.suite.ui.commons.UnifiedThingGroup",
			"sap.suite.ui.commons.UnifiedThingInspector",
			"sap.suite.ui.commons.VerticalNavigationBar",
			"sap.suite.ui.commons.ViewRepeater"
		],
		elements: [
			"sap.suite.ui.commons.BulletChartData",
			"sap.suite.ui.commons.CalculationBuilderValidationResult",
			"sap.suite.ui.commons.ColumnData",
			"sap.suite.ui.commons.ColumnMicroChartLabel",
			"sap.suite.ui.commons.ComparisonData",
			"sap.suite.ui.commons.CountingNavigationItem",
			"sap.suite.ui.commons.FeedItem",
			"sap.suite.ui.commons.HarveyBallMicroChartItem",
			"sap.suite.ui.commons.HeaderCellItem",
			"sap.suite.ui.commons.imageeditor.CustomSizeItem",
			"sap.suite.ui.commons.MicroAreaChartItem",
			"sap.suite.ui.commons.MicroAreaChartLabel",
			"sap.suite.ui.commons.MicroAreaChartPoint",
			"sap.suite.ui.commons.TargetFilterColumn",
			"sap.suite.ui.commons.TargetFilterMeasureColumn",
			"sap.suite.ui.commons.AriaProperties"
		],
		version: "1.113.0",
		extensions: {
			flChangeHandlers: {
				"sap.suite.ui.commons.Timeline": "sap/suite/ui/commons/flexibility/Timeline"
			}
		}
	});

	/**
	 * Enumeration of possible BulletChart display modes.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. sap.suite.ui.microchart.BulletMicroChartModeType should be used.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.BulletChartMode = {

		/**
		 * Displays the Actual value.
		 * @public
		 */
		Actual: "Actual",

		/**
		 * Displays delta between the Actual and Threshold values.
		 * @public
		 */
		Delta: "Delta"

	};
	/**
	 * Enumeration of possible theme specific background colors.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. Moved to sapui5.runtime.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.CommonBackground = {

		/**
		 * The lightest background color.
		 * @public
		 */
		Lightest: "Lightest",

		/**
		 * Extra light background color.
		 * @public
		 */
		ExtraLight: "ExtraLight",

		/**
		 * Light background color.
		 * @public
		 */
		Light: "Light",

		/**
		 * Medium light background color.
		 * @public
		 */
		MediumLight: "MediumLight",

		/**
		 * Medium background color.
		 * @public
		 */
		Medium: "Medium",

		/**
		 * Dark background color.
		 * @public
		 */
		Dark: "Dark",

		/**
		 * Extra dark background color.
		 * @public
		 */
		ExtraDark: "ExtraDark",

		/**
		 * The darkest background color.
		 * @public
		 */
		Darkest: "Darkest"

	};
	/**
	 * The view of the ComparisonChart.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. sap.suite.ui.microchart.ComparisonMicroChartViewType should be used.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.ComparisonChartView = {

		/**
		 * Titles and values are displayed above the bars.
		 * @public
		 */
		Normal: "Normal",

		/**
		 * Titles and values are displayed in the same line with the bars.
		 * @public
		 */
		Wide: "Wide"

	};
	/**
	 * Comparison operators supported by the calculation builder.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.CalculationBuilderComparisonOperatorType = {

		/**
		 * Less than.
		 * @public
		 */
		// Less: "<",
		"<": "<",


		/**
		 * Greater than.
		 * @public
		 */
		//Greater: ">",
		">": ">",


		/**
		 * Less than or equal to.
		 * @public
		 */
		// LessOrEqual: "<=",
		"<=": "<=",


		/**
		 * Greater than or equal to.
		 * @public
		 */
		// GreaterOrEqual: ">=",
		">=": ">=",


		/**
		 * Equal to.
		 * @public
		 */
		//Equal: "=",
		"=": "=",

		/**
		 * Not equal to.
		 * @public
		 */
		//NotEqual: "!="
		"!=": "!="
	};
	/**
	 * Functions supported by the calculation builder.<br>
	 * To add a custom function, use {@link sap.suite.ui.commons.CalculationBuilderFunction}.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.CalculationBuilderFunctionType = {

		/**
		 * ABS.
		 * @public
		 */
		ABS: "ABS",

		/**
		 * Round.
		 * @public
		 */
		Round: "ROUND",

		/**
		 * Round Up.
		 * @public
		 */
		RoundUp: "RoundUp",

		/**
		 * Round Down.
		 * @public
		 */
		RoundDown: "RoundDown",

		/**
		 * Case.
		 * @public
		 */
		Case: "CASE",

		/**
		 * SQRT.
		 * @public
		 */
		SQRT: "SQRT",

		/**
		 * NDIV0.
		 * @public
		 */
		NDIV0: "NDIV0",

		/**
		 * NODIM.
		 * @public
		 */
		NODIM: "NODIM",

		/**
		 * SUMCT.
		 * @public
		 */
		SUMCT: "SUMCT",

		/**
		 * SUMGT.
		 * @public
		 */
		SUMGT: "SUMGT",

		/**
		 * SUMRT.
		 * @public
		 */
		SUMRT: "SUMRT"
	};
	/**
	 * The types of items (operands) that can be used in a calculation builder expression.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.CalculationBuilderItemType = {

		/**
		 * Operator.
		 * @public
		 */
		Operator: "Operator",

		/**
		 * Custom arithmetic operator defined by the application.<br>Custom operators are not validated by the {@link sap.suite.ui.commons.CalculationBuilder} control.
		 * @public
		 */
		CustomOperator: "CustomOperator",


		/**
		 * Variable.
		 * @public
		 */
		Variable: "Variable",

		/**
		 * Constant.
		 * @deprecated As of version 1.77.0, replaced by {@link sap.suite.ui.commons.CalculationBuilderItemType.Literal}.
		 * @public
		 */
		Constant: "Constant",

		/**
		 * Literal.
		 *
		 * @since 1.77.0
		 * @public
		 */
		Literal: "Literal",

		/**
		 * Function.<br>
		 * Default functions are defined by {@link sap.suite.ui.commons.CalculationBuilderFunctionType}.
		 * @public
		 */
		Function: "Function",

		/**
		 * Custom Function.<br>
		 * Custom functions can be defined using {@link sap.suite.ui.commons.CalculationBuilderFunction}.
		 * @public
		 */
		CustomFunction: "CustomFunction",

		/**
		 * Empty value.<br>
		 * Empty values can be used for defining arguments passed to custom functions.
		 */
		Empty: "Empty",

		/**
		 * Error state for items incorrectly added to the expression through the text editor.
		 */
		Error: "Error"
	};
	/**
	 * Logical operators supported by the calculation builder.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.CalculationBuilderLogicalOperatorType = {

		/**
		 * Logical conjunction.
		 * @public
		 */
		AND: "AND",

		/**
		 * Logical disjunction.
		 * @public
		 */
		OR: "OR",

		/**
		 * Exclusive disjunction.
		 * @public
		 */
		XOR: "XOR",

		/**
		 * Negation.
		 * @public
		 */
		NOT: "NOT"
	};

	/**
	 * Layout of the calculation builder.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.CalculationBuilderLayoutType = {

		/**
		 * Both the visual and text editors are displayed.
		 * @public
		 */
		Default: "Default",

		/**
		 * Both the visual and text editors are displayed, but the text editor is read-only.
		 * @public
		 */
		VisualTextualReadOnly: "VisualTextualReadOnly",

		/**
		 * Only the visual editor is displayed.
		 * @public
		 */
		VisualOnly: "VisualOnly",

		/**
		 * Only the text editor is displayed.
		 * @public
		 */
		TextualOnly: "TextualOnly"
	};
	/**
	 * Arithmetic operators supported by the calculation builder.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.CalculationBuilderOperatorType = {

		/**
		 * Addition.
		 * @public
		 */
		"+": "+",

		/**
		 * Subtraction.
		 * @public
		 */
		"-": "-",

		/**
		 * Division.
		 * @public
		 */
		"/": "/",

		/**
		 * Multiplication.
		 * @public
		 */
		"*": "*",

		/**
		 * Left bracket.
		 * @public
		 */
		"(": "(",

		/**
		 * Right bracket.
		 * @public
		 */
		")": ")",

		/**
		 * Comma.
		 * @public
		 */
		",": ","
	};

	/**
	 * Types of expression validation that define when the expression entered into the {@link sap.suite.ui.commons.CalculationBuilder} is validated.
	 *
	 * @enum {string}
	 * @public
 	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.CalculationBuilderValidationMode = {
		/**
		 * The expression is validated when the user presses Enter or moves the focus outside of the expression input field.
		 */
		FocusOut: "FocusOut",

		/**
		 * The expression is validated, as the user types new characters into the input field.
		 */
		LiveChange: "LiveChange"
	};

	/**
	 * The marker for the deviation trend.
	 *
	 * @author SAP AG
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. Moved to sapui5.runtime.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.DeviationIndicator = {

		/**
		 * The actual value is more than the target value.
		 * @public
		 */
		Up: "Up",

		/**
		 * The actual value is less than the target value.
		 * @public
		 */
		Down: "Down",

		/**
		 * No value.
		 * @public
		 */
		None: "None"

	};
	/**
	 * Enumeration of possible FacetOverview height settings.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Object page should be used instead.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.FacetOverviewHeight = {

		/**
		 * Extra small height
		 * @public
		 */
		XS: "XS",

		/**
		 * Small height
		 * @public
		 */
		S: "S",

		/**
		 * Medium height
		 * @public
		 */
		M: "M",

		/**
		 * Large height
		 * @public
		 */
		L: "L",

		/**
		 * Extra Large height
		 * @public
		 */
		XL: "XL",

		/**
		 * Extra extra large height
		 * @public
		 */
		XXL: "XXL",

		/**
		 * Content based height
		 * @public
		 */
		Auto: "Auto",

		/**
		 * No value. The height of the control is defined by depricated height property.
		 * @public
		 */
		None: "None"

	};
	/**
	 * Enumeration of possible frame types.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. Moved to openUI5.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.FrameType = {

		/**
		 * The 1x1 frame type.
		 * @public
		 */
		OneByOne: "OneByOne",

		/**
		 * The 2x1 frame type.
		 * @public
		 */
		TwoByOne: "TwoByOne",

		/**
		 * The 2/3 frame type.
		 * @public
		 */
		TwoThirds: "TwoThirds",

		/**
		 * The Auto frame type that adjusts the size of the control to the content.
		 * @public
		 */
		Auto: "Auto"

	};
	/**
	 * The list of possible HeaderContainer views.
	 *
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.48.
	 * This control is deprecated since 1.48. Please use the equivalent sap.ui.core.Orientation.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.HeaderContainerView = {

		/**
		 * The horizontal orientation of the control.
		 *
		 * @public
		 */
		Horizontal: "Horizontal",

		/**
		 * The vertical orientation of the control.
		 *
		 * @public
		 */
		Vertical: "Vertical"

	};
	/**
	 * Enumeration of possible PointTile size settings.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. sap.m.InfoTileSize should be used.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.InfoTileSize = {

		/**
		 * Extra small size.
		 * @public
		 */
		XS: "XS",

		/**
		 * Small size.
		 * @public
		 */
		S: "S",

		/**
		 * Medium size.
		 * @public
		 */
		M: "M",

		/**
		 * Large size.
		 * @public
		 */
		L: "L",

		/**
		 * The size of the tile depends on the device it is running on. It is large on desktop, medium on tablet and small on phone.
		 * @public
		 */
		Auto: "Auto"

	};
	/**
	 * Enumeration of possible InfoTile text color settings.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. sap.m.InfoTileTextColor should be used.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.InfoTileTextColor = {

		/**
		 * Positive InfoTile text color.
		 * @public
		 */
		Positive: "Positive",

		/**
		 * Critical InfoTile text color.
		 * @public
		 */
		Critical: "Critical",

		/**
		 * Negative InfoTile text color.
		 * @public
		 */
		Negative: "Negative"

	};
	/**
	 * Enumeration of possible InfoTile value color settings.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. sap.m.InfoTileValueColor should be used.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.InfoTileValueColor = {

		/**
		 * Neutral InfoTile value color.
		 * @public
		 */
		Neutral: "Neutral",

		/**
		 * Good InfoTile value color.
		 * @public
		 */
		Good: "Good",

		/**
		 * Critical InfoTile value color.
		 * @public
		 */
		Critical: "Critical",

		/**
		 * Error InfoTile value color.
		 * @public
		 */
		Error: "Error"

	};
	/**
	 * Enumeration of possible load states for LoadableView.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. sap.m.LoadState should be used.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.LoadState = {

		/**
		 * LoadableView is loading the control.
		 * @public
		 */
		Loading: "Loading",

		/**
		 * LoadableView has loaded the control.
		 * @public
		 */
		Loaded: "Loaded",

		/**
		 * LoadableView failed to load the control.
		 * @public
		 */
		Failed: "Failed",

		/**
		 * LoadableView disabled to load the control.
		 * @public
		 */
		Disabled: "Disabled"

	};
	/**
	 * The list of possible MicroAreaChart views.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. sap.suite.ui.microchart.AreaMicroChartViewType should be used.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.MicroAreaChartView = {

		/**
		 * The view with labels on the top and bottom.
		 * @public
		 */
		Normal: "Normal",

		/**
		 * The view with labels on the left and right.
		 * @public
		 */
		Wide: "Wide"

	};

	/**
	 * Options that define how the micro process flow should be rendered inside its parent container.
	 * <br>These options can be useful when the width of the parent container does not allow for
	 * all nodes in the micro process flow to be displayed on the same line.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.MicroProcessFlowRenderType = {
		/**
		 * The micro process flow nodes are wrapped inside the parent container.
		 * @public
		 */
		Wrap: "Wrap",

		/**
		 * The micro process flow nodes are not wrapped inside the parent container.
		 * <br>The nodes that do not fit into the width of the parent container are
		 * not displayed.
		 * @public
		 */
		NoWrap: "NoWrap",

		/**
		 * Two scrolling icons are added to the parent container, which allows navigation
		 * by scrolling through the micro process flow.
		 * <br>Please note that the numbers displayed next to the scrolling icons are not recalculated
		 * dynamically when you resize the browser window. If you want them to be recalculated,
		 * consider using the <code>ScrollingWithResizer</code> render type instead.
		 * @public
		 */
		Scrolling: "Scrolling",

		/**
		 * Two scrolling icons are added to the parent container, with the number indicators
		 * updated automatically when you resize the browser window.
		 * <br>This option allows scrolling through the micro process flow, just as the <code>Scrolling</code>
		 * option does, but may slightly affect the performance. If using this render type affects your
		 * application's performance, consider using the <code>Scrolling</code> render type instead.
		 * @public
		 */
		ScrollingWithResizer: "ScrollingWithResizer"
	};

	oSuiteCommonsLib.networkgraph = oSuiteCommonsLib.networkgraph || {};

	/**
	 * Background color for the network graph.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.networkgraph.BackgroundColor = {
		/**
		 * The default color of the parent container is used.
		 *
		 * @public
		 */
		Default: "Default",

		/**
		 * White.
		 *
		 * @public
		 */
		White: "White"
	};

	/**
	 * Position of a custom action button.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.networkgraph.ActionButtonPosition = {
		/**
		 * The action button is aligned to the left.
		 *
		 * @public
		 */
		Left: "Left",

		/**
		 * The action button is aligned to the right.
		 *
		 * @public
		 */
		Right: "Right"
	};

	/**
	 * Shape of a node in a network graph.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.networkgraph.NodeShape = {
		/**
		 * Round shape with a text label below.
		 * @public
		 */
		Circle: "Circle",

		/**
		 * Rectangular shape with an optional list of attributes.
		 * @public
		 */
		Box: "Box",

		/**
		 * Shape for custom rendering.
		 * @public
		 */
		Custom: "Custom"
	};

	/**
	 * Type of connector line used in the network graph.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.networkgraph.LineType = {
		/**
		 * Solid connector line.
		 * @public
		 */
		Solid: "Solid",

		/**
		 * Dashed connector line.
		 * @public
		 */
		Dashed: "Dashed",

		/**
		 * Dotted connector line.
		 * @public
		 */
		Dotted: "Dotted"
	};

	/**
	 * Type of node placement for Layered Algorithm.
	 * See {@link https://rtsys.informatik.uni-kiel.de/confluence/display/KIELER/KLay+Layered+Layout+Options#KLayLayeredLayoutOptions-nodePlacement}
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.networkgraph.NodePlacement = {
		/**
		 * Minimizes the number of edge bends at the expense of the graph size.
		 * @public
		 */
		BrandesKoepf: "BrandesKoepf",

		/**
		 * Calculates the most optimal layout balance.
		 * @public
		 */
		LinearSegments: "LinearSegments",

		/**
		 * Minimizes the area taken by the graph at the expense of everything else.
		 * @public
		 */
		Simple: "Simple"
	};

	/**
	 * Semantic type of the node status.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.networkgraph.ElementStatus = {
		/**
		 * A standard node
		 * @public
		 */
		Standard: "Standard",

		/**
		 * A node type that communicates success.
		 * @public
		 */
		Success: "Success",

		/**
		 * A node type that communicates a warning.
		 * @public
		 */
		Warning: "Warning",

		/**
		 * A node type that communicates an error.
		 * @public
		 */
		Error: "Error",

		/**
		 * A node type that communicates information.
		 * @public
		 */
		Information: "Information"
	};

	/**
	 * Orientation of layered layout.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.networkgraph.Orientation = {
		/**
		 * The flow of the graph is left to right.
		 * @public
		 */
		LeftRight: "LeftRight",

		/**
		 * The flow of the graph is right to left.
		 * @public
		 */
		RightLeft: "RightLeft",

		/**
		 * The flow of the graph is top to bottom.
		 * @public
		 */
		TopBottom: "TopBottom",

		/**
		 * The flow of the graph is bottom to top.
		 * @public
		 */
		BottomTop: "BottomTop"
	};

	/**
	 * Determines how nodes are rendered. For optimal performance and usability, it is recommended that you use HTML,
	 * which allows you to avoid dealing with SVG limitations.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.networkgraph.RenderType = {
		/**
		 * Nodes are rendered as classic HTML.
		 * @public
		 */
		Html: "Html",

		/**
		 * Nodes are rendered as SVG.
		 * @public
		 */
		Svg: "Svg"

	};


	/**
	 * Direction of the arrow on the connector line.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.networkgraph.LineArrowOrientation = {
		/**
		 * The arrow points from parent to child.
		 * @public
		 */
		ParentOf: "ParentOf",

		/**
		 * The arrow points from child to parent.
		 * @public
		 */
		ChildOf: "ChildOf",

		/**
		 * The arrow is hidden.
		 * @public
		 */
		None: "None",

		/**
		 * The arrows on the line point both ways.
		 * @public
		 */
		Both: "Both"
	};

	/**
	 * Position of the arrow on a connector line.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.networkgraph.LineArrowPosition = {
		/**
		 * The arrow is placed at the beginning of the first line segment.
		 * @public
		 */
		Start: "Start",

		/**
		 * The arrow is placed in the middle of the last line segment. If the line has only one segment,
		 * the arrow appears in the middle of the line.
		 * @public
		 */
		Middle: "Middle",

		/**
		 * The arrow is placed at the end of the last line segment.
		 * @public
		 */
		End: "End"
	};

	/**
	 * Types of layout algorithms that define the visual features and layout of the network graph.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.networkgraph.LayoutRenderType = {
		/**
		 * Algorithm that arranges nodes into layers and ensures support for free-form groups.
		 * @public
		 */
		LayeredWithGroups: "LayeredWithGroups",
		/**
		 * Algorithm that arranges nodes into swim lanes, which are single-layer groups.
		 * @public
		 */
		SwimLanes: "SwimLanes",
		/**
		 * Algorithm that arranges the nodes freely in a force-directed manner, based on the attractive and repulsive forces within the graph.<br>
		 * This layout algorithm ignores node groups, so all nodes appear as standalone nodes not grouped in any way.
		 * @public
		 */
		Forces: "Forces",
		/**
		 * Algorithm that supports nested groups, similar to <code>SwimLanes</code>, but arranges them into two columns only: one on the left and one on the right.
		 * @public
		 */
		TwoColumns: "TwoColumns"
	};

	/**
	 * States of the Header checkbox.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.networkgraph.HeaderCheckboxState = {
		/**
		 * Checkbox is not visible.
		 * @public
		 */
		Hidden: "Hidden",

		/**
		 * Checkbox is visible and selected.
		 * @public
		 */
		Checked: "Checked",

		/**
		 * Checkbox is visible and not selected.
		 * @public
		 */
		Unchecked: "Unchecked"
	};

	/**
	 * Describes the state of a connection label.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.ProcessFlowConnectionLabelState = {

		/**
		 * Neutral connection label.
		 * @public
		 */
		Neutral: "Neutral",

		/**
		 * Positive connection label.
		 * @public
		 */
		Positive: "Positive",

		/**
		 * Critical connection label.
		 * @public
		 */
		Critical: "Critical",

		/**
		 * Negative connection label.
		 * @public
		 */
		Negative: "Negative"

	};

	/**
	 * Describes the state of a connection.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.ProcessFlowConnectionState = {

		/**
		 * Highlighted connection.
		 * @public
		 */
		Highlighted: "Highlighted",

		/**
		 * Dimmed connection.
		 * @public
		 */
		Dimmed: "Dimmed",

		/**
		 * Regular connection.
		 * @public
		 */
		Regular: "Regular",

		/**
		 * Selected connection.
		 * @public
		 */
		Selected: "Selected"

	};
	/**
	 * Describes the type of a connection.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.ProcessFlowConnectionType = {

		/**
		 * Planned connection.
		 * @public
		 */
		Planned: "Planned",

		/**
		 * Normal connection.
		 * @public
		 */
		Normal: "Normal"

	};
	/**
	 * The ProcessFlow calculates the ProcessFlowDisplayState based on the 'focused' and 'highlighted' properties of each node.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.ProcessFlowDisplayState = {

		/**
		 * The control is in the regular display state
		 * @public
		 */
		Regular: "Regular",

		/**
		 * The control is in the combination of regular and focused display state
		 * @public
		 */
		RegularFocused: "RegularFocused",

		/**
		 * The control is in highlighted display state
		 * @public
		 */
		Highlighted: "Highlighted",

		/**
		 * The control is in the combination of highlighted and focused display state
		 * @public
		 */
		HighlightedFocused: "HighlightedFocused",

		/**
		 * The control is in the dimmed state
		 * @public
		 */
		Dimmed: "Dimmed",

		/**
		 * The control is in the combination of dimmed and focused display state
		 * @public
		 */
		DimmedFocused: "DimmedFocused",

		/**
		 * The control is in the selected display state
		 * @public
		 */
		Selected: "Selected",

		/**
		 * The control is in the combination of selected and highlighted display state
		 * @public
		 */
		SelectedHighlighted: "SelectedHighlighted",

		/**
		 * The control is in the combination of selected, highlighted and focused display state
		 * @public
		 */
		SelectedHighlightedFocused: "SelectedHighlightedFocused",

		/**
		 * The control is in the combination of selected and focused display state
		 * @public
		 */
		SelectedFocused: "SelectedFocused"

	};
	/**
	 * This type is used in the 'state' property of the ProcessFlowLaneHeader. For example, app developers can set the status of the lane header if lanes are displayed without documents.
	 * If the complete process flow is displayed (that is, if the lane header is displayed with documents underneath), the given state values of the lane header are ignored and will be calculated in the ProcessFlow according to the current state of the documents.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.ProcessFlowLaneState = {

		/**
		 * In the 'state' array, the total amount of values needs to be 100%.
		 * @public
		 */
		value: "value",

		/**
		 * The 'state' property is associated with the given value. Possible states are: positive, negative, neutral, and planned.
		 * @public
		 */
		state: "state"

	};
	/**
	 * Describes the state connected to the content it is representing in the Process Flow Node. The state is also displayed in the Process Flow Lane Header as a color segment of the donut.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.ProcessFlowNodeState = {

		/**
		 * Positive status for a created document: the document is done, finished, solved.
		 * @public
		 */
		Positive: "Positive",

		/**
		 * Negative status for a created document: with this document, an issue occurred.
		 * @public
		 */
		Negative: "Negative",

		/**
		 * Critical status for a created document: with this document, a critical issue occurred, for example, the business process can be interrupted.
		 * @public
		 * @since 1.42.0
		 */
		Critical: "Critical",

		/**
		 * Planned status for a document: the document is planned to be started.
		 * @public
		 */
		Planned: "Planned",

		/**
		 * Neutral status for a created document: the document is in progress.
		 * @public
		 */
		Neutral: "Neutral",

		/**
		 * Planned, but negative status for a document: the planned document has an issue but has not yet been started.
		 * @public
		 */
		PlannedNegative: "PlannedNegative"

	};
	/**
	 * Describes the type of a node. The type value could be single or aggregated. With this type,
	 * the application can define if several nodes should be displayed as one aggregated node in a path per column to
	 * represent a grouping of semantically equal nodes.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.ProcessFlowNodeType = {

		/**
		 * Single node - one node is illustrated in a column.
		 * @public
		 */
		Single: "Single",

		/**
		 * Aggregated node - several nodes are illustrated as a stack of nodes in the same path and in one column.
		 * @public
		 */
		Aggregated: "Aggregated"

	};
	/**
	 * The zoom level defines level of details for the node and how much space the process flow requires.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.ProcessFlowZoomLevel = {

		/**
		 * The full details with normal font size.
		 * @public
		 */
		One: "One",

		/**
		 * The full detail view of the node but with smaller font size.
		 * @public
		 */
		Two: "Two",

		/**
		 * The details are the icon, title text and no additional texts.
		 * @public
		 */
		Three: "Three",

		/**
		 * Zoom level for least details - only icon is displayed.
		 * @public
		 */
		Four: "Four"

	};
	/**
	 * SelectionState
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.48.
	 * This Enumeration is deprecated as it is not used anywhere.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.SelectionState = {

		/**
		 * Selected
		 * @public
		 */
		Selected: "Selected",

		/**
		 * Not Selected
		 * @public
		 */
		NotSelected: "NotSelected",

		/**
		 * Semantic
		 * @public
		 */
		Semantic: "Semantic"

	};

	oSuiteCommonsLib.statusindicator = oSuiteCommonsLib.statusindicator || {};

	/**
	 * The direction of animation.<br>
	 *
	 * The direction types <code>Up</code>, <code>Down</code>, <code>Left</code>, and <code>Right</code> are available when
	 * {@link sap.suite.ui.commons.statusindicator.FillingType} is set to <code>Linear</code>.<br>
	 * The direction types <code>Clockwise</code> and <code>Counterclockwise</code> are available when
	 * {@link sap.suite.ui.commons.statusindicator.FillingType} is set to <code>Circular</code>.
	 *
	 * @public
	 * @enum {string}
	 */
	oSuiteCommonsLib.statusindicator.FillingDirectionType = {

		/**
		 * From bottom upwards.
		 *
		 * @public
		 */
		Up: "Up",

		/**
		 * From top to bottom.
		 *
		 * @public
		 */
		Down: "Down",

		/**
		 * From right to left.
		 *
		 * @public
		 */
		Left: "Left",

		/**
		 * From left to right.
		 *
		 * @public
		 */
		Right: "Right",

		/**
		 * Clockwise.
		 *
		 * @public
		 */
		Clockwise: "Clockwise",

		/**
		 * Counterclockwise.
		 *
		 * @public
		 */
		CounterClockwise: "CounterClockwise"
	};

	oSuiteCommonsLib.taccount = oSuiteCommonsLib.taccount || {};

	/**
	 * The state of the {@link sap.suite.ui.commons.taccount.TAccountPanel} that defines how T accounts included in the panel are displayed.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.taccount.TAccountPanelState = {

		/**
		 * The T account panel displays T accounts as T shapes with debit and credit entries on either side of the T.
		 * @public
		 */
		Default: "Default",

		/**
		 * The T account panel displays T accounts as an aggregated table, with each debit and credit entry listed on a separate row.
		 * @public
		 */
		Table: "Table"

	};

	/**
	 * The horizontal alignment of the status indicator within its parent container.
	 *
	 * @public
	 * @enum {string}
	 */
	oSuiteCommonsLib.statusindicator.HorizontalAlignmentType = {

		/**
		 * Left.
		 *
		 * @public
		 */
		Left: "Left",

		/**
		 * Middle.
		 *
		 * @public
		 */
		Middle: "Middle",

		/**
		 * Right.
		 *
		 * @public
		 */
		Right: "Right"
	};

	/**
	 * The vertical alignment of the status indicator within its parent container.
	 *
	 * @public
	 * @enum {string}
	 */
	oSuiteCommonsLib.statusindicator.VerticalAlignmentType = {

		/**
		 * Top.
		 *
		 * @public
		 */
		Top: "Top",

		/**
		 * Middle.
		 *
		 * @public
		 */
		Middle: "Middle",

		/**
		 * Bottom.
		 *
		 * @public
		 */
		Bottom: "Bottom"
	};

	/**
	 * Predefined sizes of the status indicator.
	 *
	 * @public
	 * @enum {string}
	 */
	oSuiteCommonsLib.statusindicator.SizeType = {

		/**
		 * No size settings are applied.
		 * @public
		 */
		None: "None",

		/**
		 * Small status indicator.
		 *
		 * @public
		 */
		Small: "Small",

		/**
		 * Medium status indicator.
		 *
		 * @public
		 */
		Medium: "Medium",

		/**
		 * Large status indicator.
		 *
		 * @public
		 */
		Large: "Large",

		/**
		 * Extra large status indicator.
		 *
		 * @public
		 */
		ExtraLarge: "ExtraLarge"
	};

	/**
	 * Position of the label, relative to the status indicator.
	 *
	 * @public
	 * @enum {string}
	 */
	oSuiteCommonsLib.statusindicator.LabelPositionType = {

		/**
		 * Top.
		 *
		 * @public
		 */
		Top: "Top",

		/**
		 * Right.
		 *
		 * @public
		 */
		Right: "Right",

		/**
		 * Bottom.
		 *
		 * @public
		 */
		Bottom: "Bottom",

		/**
		 * Left
		 *
		 * @public
		 */
		Left: "Left"
	};

	/**
	 * The type of filling.
	 *
	 * @public
	 * @enum {string}
	 */
	oSuiteCommonsLib.statusindicator.FillingType = {

		/**
		 * The shape is filled with a linear gradient.
		 *
		 * @public
		 */
		Linear: "Linear",

		/**
		 * The shape is filled with a radial gradient.
		 */
		Radial: "Radial",

		/**
		 * Clockwise or counterclockwise circular filling is applied.
		 *
		 * <p>
		 * For details, see {@link sap.suite.ui.commons.statusindicator.FillingDirectionType}.
		 * </p>
		 *
		 * @public
		 */
		Circular: "Circular",

		/**
		 * No filling is applied.
		 *
		 * @public
		 */
		None: "None"
	};

	/**
	 * Defines the way how UnifiedThingGroup control is rendered.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Object page should be used instead.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.ThingGroupDesign = {

		/**
		 * In this design there is no indentation between header and content of the group.
		 * @public
		 */
		ZeroIndent: "ZeroIndent",

		/**
		 * In this design there is indentation between header and content of the group.
		 * @public
		 */
		TopIndent: "TopIndent"

	};
	/**
	 * The alignment of timeline posts relative to the timeline axis.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.TimelineAlignment = {

		/**
		 * Entries are displayed to the right of the timeline axis.<br>
		 * In a horizontal timeline, entries are displayed below the timeline axis. Synonym for Bottom.
		 * @public
		 */
		Right: "Right",

		/**
		 * Entries are displayed to the left of the timeline axis.<br>
		 * In a horizontal timeline, entries are displayed above the timeline axis. Synonym for Top.
		 * @public
		 */
		Left: "Left",

		/**
		 * Entries are displayed above the timeline axis.<br>
		 * In a vertical timeline, entries are displayed to the left of the timeline axis. Synonym for Left.
		 * @public
		 */
		Top: "Top",

		/**
		 * Entries are displayed below the timeline axis.<br>
		 * In a vertical timeline, entries are displayed to the right of the timeline axis. Synonym for Right.
		 * @public
		 */
		Bottom: "Bottom"

	};
	/**
	 * Defines the orientation of the timeline axis.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.TimelineAxisOrientation = {

		/**
		 * Vertical timeline.
		 * @public
		 */
		Vertical: "Vertical",

		/**
		 * Horizontal timeline.
		 * @public
		 */
		Horizontal: "Horizontal"

	};
	/**
	 * Filter type for the timeline.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.TimelineFilterType = {

		/**
		 * Items filter based on data, defined by the {@link sap.suite.ui.commons.TimelineItem#getFilterValue filterValue}
		 * property or by a custom value.
		 * @public
		 */
		Data: "Data",

		/**
		 * Time range filter, defined by the start date (<code>from</code>) and end date
		 * (<code>to</code>) of the time range.
		 * @public
		 */
		Time: "Time",

		/**
		 * Search results filter.
		 * @public
		 */
		Search: "Search"

	};
	/**
	 * Type of grouping for timeline entries.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.TimelineGroupType = {

		/**
		 * No grouping is used.
		 * @public
		 */
		None: "None",

		/**
		 * Data is grouped by year.
		 * @public
		 */
		Year: "Year",

		/**
		 * Data is grouped by month.
		 * @public
		 */
		Month: "Month",

		/**
		 * Data is grouped by quarter.
		 * @public
		 */
		Quarter: "Quarter",

		/**
		 * Data is grouped by week.
		 * @public
		 */
		Week: "Week",

		/**
		 * Data is grouped by day.
		 * @public
		 */
		Day: "Day"

	};
	/**
	 * Type of the fadeout effect applied to the upper and lower margins of the visible timeline area.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.54.0. Not Fiori.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.TimelineScrollingFadeout = {

		/**
		 * Timeline does not fade out.
		 * @public
		 */
		None: "None",

		/**
		 * Timeline fades into the lower and upper margins of the visible area,
		 * but no scroll buttons are displayed.
		 * @public
		 */
		Area: "Area",

		/**
		 * Timeline fades into the lower and upper margins of the visible area,
		 * and scroll buttons are displayed.
		 * @public
		 */
		AreaWithButtons: "AreaWithButtons"

	};
	/**
	 * Marker for the key value status.
	 *
	 * @author SAP AG
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Numeric content or any other standard Fiori control should be used instead.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	oSuiteCommonsLib.ValueStatus = {

		/**
		 * Good value.
		 * @public
		 */
		Good: "Good",

		/**
		 * Positive value.
		 * @public
		 */
		Neutral: "Neutral",

		/**
		 * Critical value.
		 * @public
		 */
		Critical: "Critical",

		/**
		 * Bad value.
		 * @public
		 */
		Bad: "Bad"
	};

	/**
	 * Mode types for {@link sap.suite.ui.commons.imageeditor.ImageEditor}.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration will also be described in the UI5 (legacy) designtime metamodel.
	 */
	oSuiteCommonsLib.ImageEditorMode = {
		/**
		 * Image editor mode with resize handlers.
		 * @public
		 */
		Resize: "Resize",
		/**
		 * Image editor mode with rectangle crop area.
		 * @public
		 */
		CropRectangle: "CropRectangle",
		/**
		 * Image editor mode with ellipse crop area.
		 * @public
		 */
		CropEllipse: "CropEllipse",
		/**
		 * Image editor mode with custom shape crop area.
		 * @public
		 */
		CropCustomShape: "CropCustomShape",
		/**
		 * Image editor mode that shows just the source image.
		 * <br>This mode is used by default.
		 * @public
		 */
		Default: "Default"
	};

	/**
	 * Mode types for {@link sap.suite.ui.commons.imageeditor.ImageEditorContainer}.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration will also be described in the UI5 (legacy) designtime metamodel.
	 */
	oSuiteCommonsLib.ImageEditorContainerMode = {
		/**
		 * Mode with resize, rotate, and flip options.
		 * @public
		 */
		Transform: "Transform",
		/**
		 * Mode with rectangular and circular/oval crop options.
		 * @public
		 */
		Crop: "Crop",
		/**
		 * Mode with filter options, including grayscale, sepia, brightness, contrast, saturation, and some other.
		 * @public
		 */
		Filter: "Filter"
	};

	/**
	 * Image file format.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration will also be described in the UI5 (legacy) designtime metamodel.
	 */
	oSuiteCommonsLib.ImageFormat = {
		/**
		 * PNG file format.
		 * @public
		 */
		Png: "Png",
		/**
		 * JPEG file format.
		 * @public
		 */
		Jpeg: "Jpeg"
	};

	/**
	 * Action buttons for the {@link sap.suite.ui.commons.imageeditor.ImageEditorContainer}.
	 *
	 * @enum {string}
	 * @public
	 */
	oSuiteCommonsLib.ImageEditorContainerButton = {
		/**
		 * Transform button.
		 * @public
		 */
		Transform: "Transform",
		/**
		 * Crop button.
		 * @public
		 */
		Crop: "Crop",
		/**
		 * Filter button.
		 * @public
		 */
		Filter: "Filter"
	};

	/**
	 * Modes for the {@link sap.suite.ui.commons.CloudFilePicker}.
	 *
	 * @enum {string}
	 * @internal
	 */
	 oSuiteCommonsLib.FilePickerModes = {
		/**
		 * Allow selection of a File or Folder resource
		 * @public
		 */
		All: "All",
		/**
		 * Allow selection of File type of resource
		 * @public
		 */
		FileOnly: "FileOnly",
		/**
		 * Allow selection of Folder type of resource
		 * @public
		 */
		 FolderOnly: "FolderOnly"
	};

	return oSuiteCommonsLib;
});
