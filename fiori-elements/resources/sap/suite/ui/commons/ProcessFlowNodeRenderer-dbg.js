/*
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'./library',
	'sap/ui/Device',
	"sap/base/security/encodeXML"
], function(library, Device, encodeXML) {
	"use strict";

	/**
	 * @class ProcessFlowNode renderer.
	 * @static
	 */
	var ProcessFlowNodeRenderer = {
		apiVersion: 2
	};

	/**
	 * ProcessFlowNodeRenderer constants
	 *
	 * @static
	 */
	ProcessFlowNodeRenderer._constants = {
		top:    "top",
		right:  "right",
		bottom: "bottom",
		left:   "left",
		corner: "corner"
	};

	/**
	 * ProcessFlowNodeRenderer node levels
	 *
	 * @static
	 */
	ProcessFlowNodeRenderer._nodeLevels = {
		iLevel0: 0,
		iLevel1: 1,
		iLevel2: 2,
		iLevel3: 3
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	ProcessFlowNodeRenderer.render = function (oRm, oControl) { // EXC_SAP_006_1, EXC_JSHINT_046
		var oFoldedCornerControl = null;
		var oCustomContent = oControl._getCurrentZoomLevelContent();

		if (oControl._getFoldedCorner()) {
			oFoldedCornerControl = oControl._getFoldedCornerControl();
		}
		var oHeaderControl = oControl._getHeaderControl();
		var oIconControl = oControl._getIconControl();
		var oStateControl = oControl._getStateTextControl();
		var oText1Control = oControl._createText1Control();
		var oText2Control = oControl._createText2Control();

		/*
		 In order to be able to display folded corner we have add another four div containers -
		 - node1-node4
		 node0 - base container contains all subparts
		 node1 - corner container contains folded corner
		 node2 - top container
		 node3 - node components
		 */
		// node0
		oRm.openStart("div", oControl);
		if (oCustomContent) {
			oRm.class("sapSuiteUiCommonsProcessFlowNodeCustom");
		}
		ProcessFlowNodeRenderer._assignNodeClasses(oRm, oControl, 0);
		oRm.openEnd();

		switch (oControl._getDisplayState()) {
			case library.ProcessFlowDisplayState.Highlighted:
			case library.ProcessFlowDisplayState.HighlightedFocused:
			case library.ProcessFlowDisplayState.SelectedHighlighted:
			case library.ProcessFlowDisplayState.SelectedHighlightedFocused:
				//border-top shadowing
				oRm.openStart("div");
				ProcessFlowNodeRenderer._assignShadowClasses(oRm, oControl, "top");
				oRm.openEnd().close("div");

				//border-right shadowing
				oRm.openStart("div");
				ProcessFlowNodeRenderer._assignShadowClasses(oRm, oControl, "right");
				oRm.openEnd().close("div");

				//border-bottom shadowing
				oRm.openStart("div");
				ProcessFlowNodeRenderer._assignShadowClasses(oRm, oControl, "bottom");
				oRm.openEnd().close("div");

				//border-left shadowing
				oRm.openStart("div");
				ProcessFlowNodeRenderer._assignShadowClasses(oRm, oControl, "left");
				oRm.openEnd().close("div");

				if (oControl._getFoldedCorner()) {
					//folded corner shadowing
					oRm.openStart("div");
					ProcessFlowNodeRenderer._assignShadowClasses(oRm, oControl, "corner");
					oRm.openEnd().close("div");
				}
				break;
			default:
		}
		// node1
		oRm.openStart("div");
		ProcessFlowNodeRenderer._assignNodeClasses(oRm, oControl, 1);
		oRm.openEnd();
		if (oControl._getFoldedCorner()) {
			oRm.renderControl(oFoldedCornerControl);
		}
		oRm.close("div");
		// node2
		oRm.openStart("div");
		ProcessFlowNodeRenderer._assignNodeClasses(oRm, oControl, 2);
		oRm.openEnd();
		oRm.close("div");
		// node3
		oRm.openStart("div");
		ProcessFlowNodeRenderer._assignNodeClasses(oRm, oControl, 3);
		oRm.openEnd();

		if (oCustomContent) {
			oRm.openStart("div");
			oRm.class("sapSuiteUiCommonsProcessFlowNode3ContentPadding");
			oRm.openEnd();
			oRm.renderControl(oCustomContent);
			oRm.close("div");
		} else {
			// node3 contents (actual node contents - title, state, texts)
			// title
			oRm.openStart("div");
			ProcessFlowNodeRenderer._assignNodeTitleClasses(oRm, oControl);
			oRm.openEnd();
			oRm.renderControl(oHeaderControl);
			oRm.close("div");
			// state area
			oRm.openStart("div");
			ProcessFlowNodeRenderer._assignNodeStateClasses(oRm, oControl);
			oRm.openEnd();
			// state icon
			oRm.openStart("div");
			ProcessFlowNodeRenderer._assignNodeIconClasses(oRm, oControl);
			oRm.openEnd();
			oRm.renderControl(oIconControl);
			oRm.close("div");
			// state text
			oRm.openStart("div");
			ProcessFlowNodeRenderer._assignNodeStateTextClasses(oRm, oControl);
			oRm.openEnd();
			oRm.renderControl(oStateControl);
			oRm.close("div");
			oRm.close("div");
			// end of state
			// text1
			oRm.openStart("div");
			ProcessFlowNodeRenderer._assignNodeText1Classes(oRm, oControl);
			oRm.openEnd();
			oRm.renderControl(oText1Control);
			oRm.close("div");
			// text2
			oRm.openStart("div");
			ProcessFlowNodeRenderer._assignNodeText2Classes(oRm, oControl);
			oRm.openEnd(); // div element for text2
			oRm.renderControl(oText2Control);
			oRm.close("div");
		}
		oRm.close("div"); // end of node3
		oRm.close("div"); // end of node0
	};

	/* =========================================================== */
	/* Helper methods                                              */
	/* =========================================================== */

	/*
	 * Navigation focus is used for the keyboard support
	 *
	 * business focus comes from outside and just make different visual representation (blue rectangle around). The focus
	 * is in the styles represents with the word selected (timing and historical reasons)
	 */

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 * @param {int} nodeLevel The nodeLevel of the node (0 - parent node, 1 - upper left (folded corner icon), 2 - top part of the node, 3 - bottom part of the node
	 */
	ProcessFlowNodeRenderer._assignNodeClasses = function (oRm, oControl, nodeLevel) { // EXC_SAP_006_1, EXC_JSHINT_047
		switch (nodeLevel) {
			case ProcessFlowNodeRenderer._nodeLevels.iLevel0:
				//oRm.writeAttribute("id", oControl.getId() + "-base-container");
				break;
			case ProcessFlowNodeRenderer._nodeLevels.iLevel1:
				oRm.attr("id", oControl.getId() + "-corner-container");
				break;
			case ProcessFlowNodeRenderer._nodeLevels.iLevel2:
				oRm.attr("id", oControl.getId() + "-top-container");
				break;
			case ProcessFlowNodeRenderer._nodeLevels.iLevel3:
				oRm.attr("id", oControl.getId() + "-content-container");
				break;
			default:
		}
		if (nodeLevel > ProcessFlowNodeRenderer._nodeLevels.iLevel0) {
			// Planned
			switch (oControl.getState()) {
				case library.ProcessFlowNodeState.Planned:
					if ((nodeLevel === ProcessFlowNodeRenderer._nodeLevels.iLevel1) && (oControl._getFoldedCorner())) {
						oRm.class("sapSuiteUiCommonsProcessFlowFoldedCornerPlanned");
					} else {
						oRm.class("sapSuiteUiCommonsProcessFlowNodeStatePlanned");
						oRm.class("sapSuiteUiCommonsProcessFlowNodeStatePlannedDashedBorder");
					}
					break;
				case library.ProcessFlowNodeState.PlannedNegative:
					if ((nodeLevel === ProcessFlowNodeRenderer._nodeLevels.iLevel1) && (oControl._getFoldedCorner())) {
						oRm.class("sapSuiteUiCommonsProcessFlowFoldedCornerPlanned");
					} else {
						oRm.class("sapSuiteUiCommonsProcessFlowNodeStatePlanned");
						oRm.class("sapSuiteUiCommonsProcessFlowNodeStatePlannedDashedBorder");
					}
					break;
				default:
			}
			if (oControl._getNavigationFocus()) {
				oRm.class("sapSuiteUiCommonsProcessFlowFoldedCornerDisplayStateNavigation");
			}
			// Display state: Focused
			switch (oControl._getDisplayState()) {
				case library.ProcessFlowDisplayState.RegularFocused:
				case library.ProcessFlowDisplayState.HighlightedFocused:
				case library.ProcessFlowDisplayState.DimmedFocused:
				case library.ProcessFlowDisplayState.SelectedHighlightedFocused:
				case library.ProcessFlowDisplayState.SelectedFocused:
					if ((nodeLevel === ProcessFlowNodeRenderer._nodeLevels.iLevel1) && (oControl._getFoldedCorner())) {
						oRm.class("sapSuiteUiCommonsProcessFlowFoldedCornerDisplayStateFocused");
					} else {
						oRm.class("sapSuiteUiCommonsProcessFlowNodeDisplayStateFocused");
					}
					break;
				default:
			}
			// Display state: Regular, Highlighted, Dimmed
			switch (oControl._getDisplayState()) {
				case library.ProcessFlowDisplayState.Regular:
				case library.ProcessFlowDisplayState.RegularFocused:
				case library.ProcessFlowDisplayState.Selected:
					if ((nodeLevel === ProcessFlowNodeRenderer._nodeLevels.iLevel1) && (oControl._getFoldedCorner())) {
						oRm.class("sapSuiteUiCommonsProcessFlowFoldedCornerDisplayStateRegular");
					} else {
						oRm.class("sapSuiteUiCommonsProcessFlowNodeDisplayStateRegular");
					}
					break;
				case library.ProcessFlowDisplayState.Highlighted:
				case library.ProcessFlowDisplayState.HighlightedFocused:
				case library.ProcessFlowDisplayState.SelectedHighlighted:
				case library.ProcessFlowDisplayState.SelectedHighlightedFocused:
					if (nodeLevel === ProcessFlowNodeRenderer._nodeLevels.iLevel1 && oControl._getFoldedCorner()) {
						oRm.class("sapSuiteUiCommonsProcessFlowFoldedCornerDisplayStateHighlighted");
					} else {
						oRm.class("sapSuiteUiCommonsProcessFlowNodeDisplayStateHighlighted");
					}
					break;
				case library.ProcessFlowDisplayState.Dimmed:
				case library.ProcessFlowDisplayState.DimmedFocused:
					if (nodeLevel === ProcessFlowNodeRenderer._nodeLevels.iLevel1 && oControl._getFoldedCorner()) {
						oRm.class("sapSuiteUiCommonsProcessFlowFoldedCornerDisplayStateDimmed");
					} else {
						oRm.class("sapSuiteUiCommonsProcessFlowNodeDisplayStateDimmed");
					}
					break;
				default:
			}
		}
		if (nodeLevel === ProcessFlowNodeRenderer._nodeLevels.iLevel0) {
			if (oControl._getNavigationFocus()) {
				oRm.class("sapSuiteUiCommonsProcessFlowFoldedCornerDisplayStateNavigation");
			}
			if (oControl._getDisplayState() === library.ProcessFlowDisplayState.Highlighted) {
				oRm.class("sapSuiteUiCommonsProcessFlowNodeDisplayStateHighlighted");
			}
			if (oControl.getType() === library.ProcessFlowNodeType.Aggregated) {
				ProcessFlowNodeRenderer._assignAggregatedNodeClasses(oRm, oControl);
			}
		}
		switch (oControl._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class(encodeXML("sapSuiteUiCommonsProcessFlowNode" + nodeLevel + "ZoomLevel1"));
				break;
			case library.ProcessFlowZoomLevel.Two:
				oRm.class(encodeXML("sapSuiteUiCommonsProcessFlowNode" + nodeLevel + "ZoomLevel2"));
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class(encodeXML("sapSuiteUiCommonsProcessFlowNode" + nodeLevel + "ZoomLevel3"));
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class(encodeXML("sapSuiteUiCommonsProcessFlowNode" + nodeLevel + "ZoomLevel4"));
				break;
			default:
		}
		if (nodeLevel === ProcessFlowNodeRenderer._nodeLevels.iLevel1) {
			if (oControl._getFoldedCorner()) {
				oRm.class("sapSuiteUiCommonsProcessFlowNode1FoldedBorderStyle");
			} else {
				oRm.class("sapSuiteUiCommonsProcessFlowNode1BorderStyle");
				oRm.class("sapSuiteUiCommonsProcessFlowNodeBorderStandard");
			}
		} else if (nodeLevel > ProcessFlowNodeRenderer._nodeLevels.iLevel1) {
			oRm.class(encodeXML("sapSuiteUiCommonsProcessFlowNode" + nodeLevel + "BorderStyle"));
			oRm.class("sapSuiteUiCommonsProcessFlowNodeBorderStandard");
		}

		if (((nodeLevel === ProcessFlowNodeRenderer._nodeLevels.iLevel1) && (oControl._getFoldedCorner()))) {
			oRm.class("sapSuiteUiCommonsProcessFlowFoldedCornerNode1");
		} else {
			oRm.class(encodeXML("sapSuiteUiCommonsProcessFlowNode" + nodeLevel));
		}
		if (((nodeLevel === ProcessFlowNodeRenderer._nodeLevels.iLevel0) && (oControl._getFoldedCorner()))) {
			oRm.class("sapSuiteUiCommonsProcessFlowFoldedCornerIndication");
		}
	};

	/**
	 * Renders the HTML shadow borders for the given aggregated node, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	ProcessFlowNodeRenderer._assignAggregatedNodeClasses = function (oRm, oControl) {
		switch (oControl._getDisplayState()) {
			// Highlighted and regular states uses the same color
			case library.ProcessFlowDisplayState.Highlighted:
			case library.ProcessFlowDisplayState.Regular:
			case library.ProcessFlowDisplayState.Selected:
				if (oControl._getZoomLevel() === library.ProcessFlowZoomLevel.Four) {
					oRm.class("sapSuiteUiCommonsProcessFlowNodeAggregatedZoomLevel4");
				} else {
					oRm.class("sapSuiteUiCommonsProcessFlowNodeAggregated");
				}
				break;
			// Dimmed state uses a lighter color
			case library.ProcessFlowDisplayState.Dimmed:
				if (oControl._getZoomLevel() === library.ProcessFlowZoomLevel.Four) {
					oRm.class("sapSuiteUiCommonsProcessFlowNodeAggregatedDimmedZoomLevel4");
				} else {
					oRm.class("sapSuiteUiCommonsProcessFlowNodeAggregatedDimmed");
				}
				break;
			// The other possible states are focused states
			default:
				if (oControl._getZoomLevel() === library.ProcessFlowZoomLevel.Four) {
					oRm.class("sapSuiteUiCommonsProcessFlowNodeAggregatedFocusedZoomLevel4");
				} else {
					oRm.class("sapSuiteUiCommonsProcessFlowNodeAggregatedFocused");
				}
				break;
		}
	};

	/**
	 * Renders the HTML shadow borders for the given highlighted node, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 * @param {string} border Border type: "top", "bottom", "left", "right"
	 */
	ProcessFlowNodeRenderer._assignShadowClasses = function (oRm, oControl, border) {
		oRm.class("sapSuiteUiCommonsShadowedDivCommon");
		switch (border) {
			case ProcessFlowNodeRenderer._constants.top:
				if (oControl._getFoldedCorner()) {
					oRm.class("sapSuiteUiCommonsShadowedDivFoldedCornerBorderTop");
				} else {
					oRm.class("sapSuiteUiCommonsShadowedDivBorderTop");
				}
				break;
			case ProcessFlowNodeRenderer._constants.right:
				oRm.class("sapSuiteUiCommonsShadowedDivBorderRight");
				break;
			case ProcessFlowNodeRenderer._constants.bottom:
				oRm.class("sapSuiteUiCommonsShadowedDivBorderBottom");
				break;
			case ProcessFlowNodeRenderer._constants.left:
				if (oControl._getFoldedCorner()) {
					oRm.class("sapSuiteUiCommonsShadowedDivFoldedCornerBorderLeft");
				} else {
					oRm.class("sapSuiteUiCommonsShadowedDivBorderLeft");
				}
				break;
			case ProcessFlowNodeRenderer._constants.corner:
				if (Device.browser.safari) {
					oRm.class("sapSuiteUiCommonsShadowedDivFoldedCornerSafari");
				} else {
					oRm.class("sapSuiteUiCommonsShadowedDivFoldedCorner");
				}
				break;
			default:
		}
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	ProcessFlowNodeRenderer._assignNodeTitleClasses = function (oRm, oControl) {
		oRm.attr("id", oControl.getId() + "-title");

		switch (oControl._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel1");
				break;
			case library.ProcessFlowZoomLevel.Two:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel2");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel3");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TitleZoomLevel4");
				break;
			default:
		}
		oRm.class("sapSuiteUiCommonsProcessFlowNode3Title");
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	ProcessFlowNodeRenderer._assignNodeStateClasses = function (oRm, oControl) {
		oRm.attr("id", oControl.getId() + "-state");

		switch (oControl._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3StateZoomLevel1");
				break;
			case library.ProcessFlowZoomLevel.Two:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3StateZoomLevel2");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3StateZoomLevel3");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3StateZoomLevel4");
				break;
			default:
		}
		oRm.class("sapSuiteUiCommonsProcessFlowNode3State");
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	ProcessFlowNodeRenderer._assignNodeIconClasses = function (oRm, oControl) {
		oRm.attr("id", oControl.getId() + "-icon-container");

		switch (oControl.getState()) {
			case library.ProcessFlowNodeState.Positive:
				oRm.class("sapSuiteUiCommonsProcessFlowNodeStatePositive");
				break;
			case library.ProcessFlowNodeState.Negative:
				oRm.class("sapSuiteUiCommonsProcessFlowNodeStateNegative");
				break;
			case library.ProcessFlowNodeState.Planned:
				oRm.class("sapSuiteUiCommonsProcessFlowNodeStatePlanned");
				break;
			case library.ProcessFlowNodeState.Neutral:
				oRm.class("sapSuiteUiCommonsProcessFlowNodeStateNeutral");
				break;
			case library.ProcessFlowNodeState.PlannedNegative:
				oRm.class("sapSuiteUiCommonsProcessFlowNodeStateNegative");
				break;
			case library.ProcessFlowNodeState.Critical:
				oRm.class("sapSuiteUiCommonsProcessFlowNodeStateCritical");
				break;
			default:
		}
		switch (oControl._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel1");
				break;
			case library.ProcessFlowZoomLevel.Two:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel2");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel3");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3StateIconZoomLevel4");
				break;
			default:
		}
		oRm.class("sapSuiteUiCommonsProcessFlowNode3StateIcon");
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	ProcessFlowNodeRenderer._assignNodeStateTextClasses = function (oRm, oControl) {
		oRm.attr("id", oControl.getId() + "-state-text");

		switch (oControl.getState()) {
			case library.ProcessFlowNodeState.Positive:
				oRm.class("sapSuiteUiCommonsProcessFlowNodeStatePositive");
				break;
			case library.ProcessFlowNodeState.Negative:
				oRm.class("sapSuiteUiCommonsProcessFlowNodeStateNegative");
				break;
			case library.ProcessFlowNodeState.Planned:
				oRm.class("sapSuiteUiCommonsProcessFlowNodeStatePlanned");
				break;
			case library.ProcessFlowNodeState.Neutral:
				oRm.class("sapSuiteUiCommonsProcessFlowNodeStateNeutral");
				break;
			case library.ProcessFlowNodeState.PlannedNegative:
				oRm.class("sapSuiteUiCommonsProcessFlowNodeStateNegative");
				break;
			case library.ProcessFlowNodeState.Critical:
				oRm.class("sapSuiteUiCommonsProcessFlowNodeStateCritical");
				break;
			default:
		}
		switch (oControl._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel1");
				break;
			case library.ProcessFlowZoomLevel.Two:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel2");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel3");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3StateTextZoomLevel4");
				break;
			default:
		}
		oRm.class("sapSuiteUiCommonsProcessFlowNode3StateText");
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	ProcessFlowNodeRenderer._assignNodeText1Classes = function (oRm, oControl) {
		oRm.attr("id", oControl.getId() + "-text1");

		switch (oControl._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TextWithGapZoomLevel1");
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel1");
				break;
			case library.ProcessFlowZoomLevel.Two:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TextWithGapZoomLevel2");
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel2");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel3");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel4");
				break;
			default:
		}
		oRm.class("sapSuiteUiCommonsProcessFlowNode3Text");
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	ProcessFlowNodeRenderer._assignNodeText2Classes = function (oRm, oControl) {
		oRm.attr("id", oControl.getId() + "-text2");

		switch (oControl._getZoomLevel()) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel1");
				break;
			case library.ProcessFlowZoomLevel.Two:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel2");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel3");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsProcessFlowNode3TextZoomLevel4");
				break;
			default:
		}
		oRm.class("sapSuiteUiCommonsProcessFlowNode3Text");
	};


	return ProcessFlowNodeRenderer;

}, /* bExport= */ true);
