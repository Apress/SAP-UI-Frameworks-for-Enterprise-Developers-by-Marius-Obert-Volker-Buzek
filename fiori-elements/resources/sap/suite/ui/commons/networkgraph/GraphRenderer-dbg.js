/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/suite/ui/commons/library"
], function (library) {
	"use strict";

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	var BackgroundColor = library.networkgraph.BackgroundColor;

	return {
		_appendHeightAndWidth: function (oNetworkGraph, oRm) {
			oRm.style("height", oNetworkGraph.getHeight());
			oRm.style("width", oNetworkGraph.getWidth());
		},
		apiVersion: 2,
		render: function (oRM, oNetworkGraph) {
			var sLayeredClass = oNetworkGraph._isLayered() ? "sapSuiteUiCommonsNetworkGraphLayered" : "sapSuiteUiCommonsNetworkGraphNotLayered",
			bSwimLaneClass = oNetworkGraph._isSwimLane() ? "sapSuiteUiCommonsNetworkGraphSwimLane" : "";

			oRM.openStart("div",oNetworkGraph);
			oRM.class("sapSuiteUiCommonsNetworkGraph");
			oRM.class(bSwimLaneClass);
			oRM.class(sLayeredClass);
			oRM.attr("tabindex", "0");
			this._appendHeightAndWidth(oNetworkGraph, oRM);
			this._writeAriaTags(oRM, oNetworkGraph);
			oRM.openEnd();

			// toolbar
			oRM.renderControl(oNetworkGraph._toolbar);

			oRM.openStart("div", oNetworkGraph.getId() + "-wrapper" );
			oRM.class("sapSuiteUiCommonsNetworkGraphContentWrapper");
			oRM.attr("tabindex", "0");
			oRM.attr("aria-live", "assertive");
			oRM.attr("aria-label", oResourceBundle.getText("NETWORK_GRAPH_ACCESSIBILITY_LABEL"));
			oRM.attr("role", "application");
			oRM.openEnd();

			/**
			 * Theoretically at this point we should use either aria-hidden or InvisibleText. This is a workaround for Jaws bug
			 * which causes the text to be read twice.
			 */
			oRM.openStart("div", oNetworkGraph.getId() + "-accessibility" );
			oRM.class("sapSuiteUiCommonsNetworkGraphContentWrapperAccessibility");
			oRM.openEnd();
			oRM.text(oResourceBundle.getText("NETWORK_GRAPH_ACCESSIBILITY_CONTENT"));
			oRM.close("div");

			oRM.openStart("div", oNetworkGraph.getId() + "-scroller" );
			oRM.class("sapSuiteUiCommonsNetworkGraphScroller");
			if (oNetworkGraph.getBackgroundColor() === BackgroundColor.White) {
				oRM.class("sapSuiteUiCommonsNetworkGraphBackgroundWhite");
			} else {
				oRM.class("sapSuiteUiCommonsNetworkGraphBackgroundDefault");
			}
			oRM.openEnd();

			if (oNetworkGraph.getNoData()) {
				this._renderNoData(oRM, oNetworkGraph);
				oRM.close("div");
				oRM.close("div");
				oRM.close("div");
				return;
			}

			oRM.openStart("div", oNetworkGraph.getId() + "-innerscroller" );
			oRM.class("sapSuiteUiCommonsNetworkGraphInnerScroller");
			if (oNetworkGraph._isTwoColumnsLayout()) {
				oRM.style("width", "100%");
			}

			oRM.openEnd();

			// line tooltip
			oRM.openStart("div", oNetworkGraph.getId() + "-tooltiplayer");
			oRM.class("sapSuiteUiCommonsNetworkGraphTooltips");
			oRM.openEnd();
			oRM.openStart("div", oNetworkGraph.getId() + "-divlinebuttons");
			oRM.style("display", "none");
			oRM.class("sapSuiteUiCommonsNetworkGraphLineButtons");
			oRM.openEnd();
			oRM.openStart("div", oNetworkGraph.getId() + "-linetooltip");
			oRM.class("sapSuiteUiCommonsNetworkGraphLineTooltip");
			oRM.openEnd();
			oRM.close("div");
			oRM.openStart("div", oNetworkGraph.getId() + "-linetooltipbuttons");
			oRM.class("sapSuiteUiCommonsNetworkGraphLineActionButtons");
			oRM.openEnd();
			oRM.close("div");
			oRM.close("div");
			oRM.close("div");

			// groups
			oRM.openStart("div", oNetworkGraph.getId() + "-divgroups");
			oRM.class("sapSuiteUiCommonsNetworkGraphDivGroups");
			oRM.attr("aria-hidden", "true");
			oRM.openEnd();
			oRM.close("div");

			// nodes
			if (oNetworkGraph._isUseNodeHtml()) {
				oRM.openStart("div", oNetworkGraph.getId() + "-divnodes");
				oRM.class("sapSuiteUiCommonsNetworkGraphDivNodes");
				oRM.style("opacity", "0");
				oRM.attr("aria-hidden", "true");
				oRM.openEnd();
				oRM.close("div");
			}

			oRM.close("div");

			oRM.close("div");
			oRM.openStart("div",oNetworkGraph.getId() + "-ctrlalert" );
			oRM.class("sapSuiteUiCommonsNetworkAlertWrapper");
			oRM.openEnd();
			oRM.openStart("p");
			oRM.class("sapSuiteUiCommonsNetworkAlertText");
			oRM.openEnd();
			oRM.text(oResourceBundle.getText("NETWORK_GRAPH_ZOOMCTRL"));
			oRM.close("p");
			oRM.close("div");

			oRM.openStart("div", oNetworkGraph.getId() + "-legend");
			oRM.style("display", "none");
			oRM.class("sapSuiteUiCommonsNetworkGraphLegend");
			oRM.attr("tabindex", "0");
			oRM.openEnd();
			if (oNetworkGraph.getLegend()) {
				oRM.renderControl(oNetworkGraph.getLegend());
			}

			oRM.close("div");
			oRM.close("div");
			oRM.close("div");
		},
		_writeAriaTags: function (oRM, oNetworkGraph) {
			var aAriaLabelledBy = oNetworkGraph.getAriaLabelledBy(),
				aAriaDescribedBy = oNetworkGraph.getAriaDescribedBy();
				oRM.attr("role", "graphics-document");
			if (aAriaLabelledBy.length > 0) {
				oRM.attr("aria-labelledby", aAriaLabelledBy.join(" "));
			} else {
				oRM.attr("aria-label", oResourceBundle.getText("NETWORK_GRAPH_ACCESSIBILITY_LABEL"));
			}
			if (aAriaDescribedBy.length > 0) {
				oRM.attr("aria-describedby", aAriaDescribedBy.join(" "));
			}
		},
		_renderNoData: function (oRM, oNetworkGraph) {
			oRM.openStart("div");
			oRM.class("sapSuiteUiCommonsNetworkGraphNoDataWrapper");
			oRM.attr("tabindex", "0");
			oRM.openEnd();
			oNetworkGraph._renderHtmlIcon("sap-icon://document", "sapSuiteUiCommonsNetworkGraphNoDataIcon", null, null, null, oRM);

			var sText = oNetworkGraph.getNoDataText(),
				sTextInline = sText ? sText : oResourceBundle.getText("NETWORK_GRAPH_NO_DATA");

			oRM.openStart("div");
			oRM.class("sapSuiteUiCommonsNetworkGraphNoDataLabel");
			oRM.openEnd();
			oRM.text(sTextInline);
			oRM.close("div");
			oRM.close("div");
		}
	};
}, true);
