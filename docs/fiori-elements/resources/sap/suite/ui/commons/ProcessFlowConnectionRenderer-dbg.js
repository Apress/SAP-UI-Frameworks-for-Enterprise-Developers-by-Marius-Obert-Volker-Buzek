/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(['./library'],
	function(library) {
	"use strict";

	/**
	 * @class ProcessFlowConnection renderer.
	 * @static
	 */
	var ProcessFlowConnectionRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	ProcessFlowConnectionRenderer.render = function (oRm, oControl) {
		var oConnection = oControl._traverseConnectionData();
		var sZoomLevel = oControl.getZoomLevel();

		oRm.openStart("div");
		oRm.attr("id", oControl.getId());

		//Writes ARIA details.
		oRm.attr("role", "presentation");
		oRm.attr("aria-label", oControl._getAriaText(oConnection));
		oRm.openEnd();

		//Writes the lines.
		if (oControl._isHorizontalLine(oConnection)) {
			this._writeHorizontalLine(oRm, oConnection, sZoomLevel, oControl);
		} else if (oControl._isVerticalLine(oConnection)) {
			this._writeVerticalLine(oRm, oConnection, sZoomLevel, oControl._getShowLabels());
		} else {
			this._writeSpecialLine(oRm, oConnection, sZoomLevel, oControl);
		}
		oRm.close("div");
	};

	/* =========================================================== */
	/* Helper methods                                              */
	/* =========================================================== */

	/**
	 * Writes the vertical line.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {object} connection Connection which needs to be checked
	 * @param {object} zoomLevel Zoom level of control
	 * @param {boolean} showLabels Show labels
	 */
	ProcessFlowConnectionRenderer._writeVerticalLine = function (oRm, connection, zoomLevel, showLabels) {
		// Left column
		oRm.openStart("div");
		oRm.class("sapSuiteUiCommonsFloatLeft");
		if (showLabels) {
			oRm.class("sapSuiteUiCommonsPFWithLabel");
		}
		switch (zoomLevel) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsBoxZoom1Width");
				oRm.class("sapSuiteUiCommonsBoxWideZoom1Height");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsBoxZoom3Width");
				oRm.class("sapSuiteUiCommonsBoxWideZoom3Height");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsBoxZoom4Width");
				oRm.class("sapSuiteUiCommonsBoxWideZoom4Height");
				break;
			default:
				oRm.class("sapSuiteUiCommonsBoxZoom2Width");
				oRm.class("sapSuiteUiCommonsBoxWideZoom2Height");
		}
		oRm.openEnd();
		oRm.close("div");

		// Middle column
		oRm.openStart("div");
		oRm.class("sapSuiteUiCommonsFloatLeft");
		oRm.class("sapSuiteUiCommonsBoxMiddleBorderWidth");
		switch (zoomLevel) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsBoxWideZoom1Height");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsBoxWideZoom3Height");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsBoxWideZoom4Height");
				break;
			default:
				oRm.class("sapSuiteUiCommonsBoxWideZoom2Height");
		}
		oRm.class("sapSuiteUiCommonsBorderLeft");
		if (connection.top.type === library.ProcessFlowConnectionType.Planned) {
			oRm.class("sapSuiteUiCommonsBorderLeftTypePlanned");
		} else {
			oRm.class("sapSuiteUiCommonsBorderLeftTypeNormal");
		}
		if (connection.top.state === library.ProcessFlowConnectionState.Highlighted) {
			oRm.class("sapSuiteUiCommonsBorderLeftStateHighlighted");
			oRm.class("sapSuiteUiCommonsStateHighlighted");
		} else if (connection.top.state === library.ProcessFlowConnectionState.Dimmed) {
			oRm.class("sapSuiteUiCommonsBorderLeftStateDimmed");
		} else if (connection.top.state === library.ProcessFlowConnectionState.Selected) {
			oRm.class("sapSuiteUiCommonsBorderLeftStateSelected");
			oRm.class("sapSuiteUiCommonsStateSelected");
		} else {
			oRm.class("sapSuiteUiCommonsBorderLeftStateRegular");
			oRm.class("sapSuiteUiCommonsStateRegular");
		}
		oRm.openEnd();
		oRm.close("div");

		// Right column
		// Omitted

		ProcessFlowConnectionRenderer._resetFloat(oRm);
	};

	/**
	 * Writes the horizontal line.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {object} connection Connection which needs to be checked
	 * @param {object} zoomLevel Zoom level of control
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 */
	ProcessFlowConnectionRenderer._writeHorizontalLine = function (oRm, connection, zoomLevel, oControl) {
		//1st row
		oRm.openStart("div");
		oRm.class("sapSuiteUiCommonsBoxWideWidth");
		switch (zoomLevel) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsBoxTopZoom1Height");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsBoxTopZoom3Height");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsBoxTopZoom4Height");
				break;
			default:
				oRm.class("sapSuiteUiCommonsBoxTopZoom2Height");
		}
		oRm.openEnd();
		oRm.close("div");

		// 2nd row
		oRm.openStart("div");
		if (connection.arrow) {
			// connection column
			oRm.class("sapSuiteUiCommonsParentPosition");
			if (oControl._getShowLabels()) {
				oRm.class("sapSuiteUiCommonsPFWithLabel");
			}
			switch (zoomLevel) {
				case library.ProcessFlowZoomLevel.One:
					oRm.class("sapSuiteUiCommonsBoxWideArrowZoom1Width");
					break;
				case library.ProcessFlowZoomLevel.Three:
					oRm.class("sapSuiteUiCommonsBoxWideArrowZoom3Width");
					break;
				case library.ProcessFlowZoomLevel.Four:
					oRm.class("sapSuiteUiCommonsBoxWideArrowZoom4Width");
					break;
				default:
					oRm.class("sapSuiteUiCommonsBoxWideArrowZoom2Width");
			}
		} else {
			oRm.class("sapSuiteUiCommonsBoxWideWidth");
		}
		oRm.class("sapSuiteUiCommonsBoxMiddleBorderHeight");
		oRm.class("sapSuiteUiCommonsBorderBottom");
		if (connection.right.type === library.ProcessFlowConnectionType.Planned) {
			oRm.class("sapSuiteUiCommonsBorderBottomTypePlanned");
		} else {
			oRm.class("sapSuiteUiCommonsBorderBottomTypeNormal");
		}
		if (connection.right.state === library.ProcessFlowConnectionState.Highlighted) {
			oRm.class("sapSuiteUiCommonsBorderBottomStateHighlighted");
			oRm.class("sapSuiteUiCommonsStateHighlighted");
		} else if (connection.right.state === library.ProcessFlowConnectionState.Dimmed) {
			oRm.class("sapSuiteUiCommonsBorderBottomStateDimmed");
		} else if (connection.right.state === library.ProcessFlowConnectionState.Selected) {
			oRm.class("sapSuiteUiCommonsBorderBottomStateSelected");
			oRm.class("sapSuiteUiCommonsStateSelected");
		} else {
			oRm.class("sapSuiteUiCommonsBorderBottomStateRegular");
			oRm.class("sapSuiteUiCommonsStateRegular");
		}
		oRm.openEnd();

		if (connection.labels && oControl._showLabels) {
			ProcessFlowConnectionRenderer._renderLabel(oRm, oControl, connection);
		}

		if (connection.arrow) {
			oRm.openStart("div");
			oRm.class("sapSuiteUiCommonsArrowRight");
			if (connection.right.state === library.ProcessFlowConnectionState.Highlighted) {
				oRm.class("sapSuiteUiCommonsBorderLeftStateHighlighted");
			} else if (connection.right.state === library.ProcessFlowConnectionState.Dimmed) {
				oRm.class("sapSuiteUiCommonsBorderLeftStateDimmed");
			} else if (connection.right.state === library.ProcessFlowConnectionState.Selected) {
				oRm.class("sapSuiteUiCommonsBorderLeftStateSelected");
			} else {
				oRm.class("sapSuiteUiCommonsBorderLeftStateRegular");
			}
			oRm.openEnd();
			oRm.close("div");
		}
		oRm.close("div");

		// 3rd row
		// Omitted
	};

	/**
	 * Writes the special line (e.g. branch or corner).
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {object} connection Connection which needs to be checked
	 * @param {object} zoomLevel Zoom level of control
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 */
	ProcessFlowConnectionRenderer._writeSpecialLine = function (oRm, connection, zoomLevel, oControl) {
		ProcessFlowConnectionRenderer._writeFirstRowOfSpecialLine(oRm, connection, zoomLevel, oControl);
		ProcessFlowConnectionRenderer._writeSecondRowOfSpecialLine(oRm, connection, zoomLevel, oControl);
		ProcessFlowConnectionRenderer._writeThirdRowOfSpecialLine(oRm, connection, zoomLevel, oControl);
		ProcessFlowConnectionRenderer._resetFloat(oRm);
	};

	/**
	 * Writes the first row of a special line (e.g. branch).
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {object} connection Connection which needs to be checked
	 * @param {object} zoomLevel Zoom level of control
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 */
	ProcessFlowConnectionRenderer._writeFirstRowOfSpecialLine = function (oRm, connection, zoomLevel, oControl) {
		// Left column
		oRm.openStart("div");
		oRm.class("sapSuiteUiCommonsFloatLeft");
		if (oControl._getShowLabels()) {
			oRm.class("sapSuiteUiCommonsPFWithLabel");
		}
		switch (zoomLevel) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsBoxZoom1Width");
				oRm.class("sapSuiteUiCommonsBoxTopZoom1Height");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsBoxZoom3Width");
				oRm.class("sapSuiteUiCommonsBoxTopZoom3Height");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsBoxZoom4Width");
				oRm.class("sapSuiteUiCommonsBoxTopZoom4Height");
				break;
			default:
				oRm.class("sapSuiteUiCommonsBoxZoom2Width");
				oRm.class("sapSuiteUiCommonsBoxTopZoom2Height");
		}
		oRm.openEnd();
		oRm.close("div");

		// Middle column
		oRm.openStart("div");
		if (oControl._getShowLabels()) {
			oRm.class("sapSuiteUiCommonsPFWithLabel");
		}
		oRm.class("sapSuiteUiCommonsFloatLeft");
		switch (zoomLevel) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsBoxTopZoom1Height");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsBoxTopZoom3Height");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsBoxTopZoom4Height");
				break;
			default:
				oRm.class("sapSuiteUiCommonsBoxTopZoom2Height");
		}
		if (connection.hasOwnProperty("top") && connection.top.draw) {
			oRm.class("sapSuiteUiCommonsBoxMiddleBorderWidth");
			oRm.class("sapSuiteUiCommonsBorderLeft");
			if (connection.top.type === library.ProcessFlowConnectionType.Planned) {
				oRm.class("sapSuiteUiCommonsBorderLeftTypePlanned");
			} else {
				oRm.class("sapSuiteUiCommonsBorderLeftTypeNormal");
			}
			if (connection.top.state === library.ProcessFlowConnectionState.Highlighted) {
				oRm.class("sapSuiteUiCommonsBorderLeftStateHighlighted");
				oRm.class("sapSuiteUiCommonsStateHighlighted");
			} else if (connection.top.state === library.ProcessFlowConnectionState.Dimmed) {
				oRm.class("sapSuiteUiCommonsBorderLeftStateDimmed");
			} else if (connection.top.state === library.ProcessFlowConnectionState.Selected) {
				oRm.class("sapSuiteUiCommonsBorderLeftStateSelected");
				oRm.class("sapSuiteUiCommonsStateSelected");
			} else {
				oRm.class("sapSuiteUiCommonsBorderLeftStateRegular");
				oRm.class("sapSuiteUiCommonsStateRegular");
			}
		} else {
			oRm.class("sapSuiteUiCommonsBoxMiddleWidth");
		}
		oRm.openEnd();
		oRm.close("div");

		// Right column
		// Omitted
	};

	/**
	 * Writes the second row of a special line (e.g. branch).
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {object} connection Connection which needs to be checked
	 * @param {object} zoomLevel Zoom level of control
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 */
	ProcessFlowConnectionRenderer._writeSecondRowOfSpecialLine = function (oRm, connection, zoomLevel, oControl) {
		ProcessFlowConnectionRenderer._resetFloat(oRm);

		// Left column
		oRm.openStart("div");
		oRm.class("sapSuiteUiCommonsFloatLeft");
		if (oControl._getShowLabels()) {
			oRm.class("sapSuiteUiCommonsPFWithLabel");
		}
		switch (zoomLevel) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsBoxZoom1Width");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsBoxZoom3Width");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsBoxZoom4Width");
				break;
			default:
				oRm.class("sapSuiteUiCommonsBoxZoom2Width");
		}
		if (connection.hasOwnProperty("left") && connection.left.draw) {
			oRm.class("sapSuiteUiCommonsBoxMiddleBorderHeight");
			oRm.class("sapSuiteUiCommonsBorderBottom");
			if (connection.left.type === library.ProcessFlowConnectionType.Planned) {
				oRm.class("sapSuiteUiCommonsBorderBottomTypePlanned");
			} else {
				oRm.class("sapSuiteUiCommonsBorderBottomTypeNormal");
			}
			if (connection.left.state === library.ProcessFlowConnectionState.Highlighted) {
				oRm.class("sapSuiteUiCommonsBorderBottomStateHighlighted");
				oRm.class("sapSuiteUiCommonsStateHighlighted");
			} else if (connection.left.state === library.ProcessFlowConnectionState.Dimmed) {
				oRm.class("sapSuiteUiCommonsBorderBottomStateDimmed");
			} else if (connection.left.state === library.ProcessFlowConnectionState.Selected) {
				oRm.class("sapSuiteUiCommonsBorderBottomStateSelected");
				oRm.class("sapSuiteUiCommonsStateSelected");
			} else {
				oRm.class("sapSuiteUiCommonsBorderBottomStateRegular");
				oRm.class("sapSuiteUiCommonsStateRegular");
			}
		} else {
			oRm.class("sapSuiteUiCommonsBoxMiddleHeight");
		}
		oRm.openEnd();
		oRm.close("div");

		// Middle column
		oRm.openStart("div");
		oRm.class("sapSuiteUiCommonsFloatLeft");
		if (oControl._getShowLabels()) {
			oRm.class("sapSuiteUiCommonsPFWithLabel");
		}
		oRm.class("sapSuiteUiCommonsBoxMiddleWidth");
		oRm.class("sapSuiteUiCommonsBoxMiddleBorderHeight");
		if ((connection.hasOwnProperty("left") && connection.left.draw) ||
			(connection.hasOwnProperty("right") && connection.right.draw) ||
			(connection.hasOwnProperty("top") && connection.top.draw) ||
			(connection.hasOwnProperty("bottom") && connection.bottom.draw)) {
			oRm.class("sapSuiteUiCommonsBorderBottom");
			oRm.class("sapSuiteUiCommonsBorderBottomTypeNormal");
			if (connection.right.state === library.ProcessFlowConnectionState.Highlighted ||
				connection.top.state === library.ProcessFlowConnectionState.Highlighted ||
				connection.left.state === library.ProcessFlowConnectionState.Highlighted ||
				connection.bottom.state === library.ProcessFlowConnectionState.Highlighted) {
				oRm.class("sapSuiteUiCommonsBorderBottomStateHighlighted");
				oRm.class("sapSuiteUiCommonsStateHighlighted");
			} else if (connection.right.state === library.ProcessFlowConnectionState.Selected ||
				connection.top.state === library.ProcessFlowConnectionState.Selected ||
				connection.left.state === library.ProcessFlowConnectionState.Selected ||
				connection.bottom.state === library.ProcessFlowConnectionState.Selected) {
				oRm.class("sapSuiteUiCommonsBorderBottomStateSelected");
				oRm.class("sapSuiteUiCommonsStateSelected");
			} else if (connection.right.state === library.ProcessFlowConnectionState.Dimmed ||
				connection.top.state === library.ProcessFlowConnectionState.Dimmed ||
				connection.left.state === library.ProcessFlowConnectionState.Dimmed ||
				connection.bottom.state === library.ProcessFlowConnectionState.Dimmed) {
				oRm.class("sapSuiteUiCommonsBorderBottomStateDimmed");
			} else {
				oRm.class("sapSuiteUiCommonsBorderBottomStateRegular");
				oRm.class("sapSuiteUiCommonsStateRegular");
			}
		}
		oRm.openEnd();
		oRm.close("div");

		// Right column
		oRm.openStart("div");
		if ((oControl._getShowLabels() && connection.arrow) || !oControl._getShowLabels()) {
			oRm.class("sapSuiteUiCommonsFloatLeft");
		}
		if (oControl._getShowLabels()) {
			oRm.class("sapSuiteUiCommonsPFWithLabel");
		}
		if (connection.arrow) {
			oRm.class("sapSuiteUiCommonsParentPosition");
			switch (zoomLevel) {
				case library.ProcessFlowZoomLevel.One:
					oRm.class("sapSuiteUiCommonsBoxArrowZoom1Width");
					break;
				case library.ProcessFlowZoomLevel.Three:
					oRm.class("sapSuiteUiCommonsBoxArrowZoom3Width");
					break;
				case library.ProcessFlowZoomLevel.Four:
					oRm.class("sapSuiteUiCommonsBoxArrowZoom4Width");
					break;
				default:
					oRm.class("sapSuiteUiCommonsBoxArrowZoom2Width");
			}
		} else if (oControl._getShowLabels()) {
			switch (zoomLevel) {
				case library.ProcessFlowZoomLevel.One:
					oRm.class("sapSuiteUiCommonsBoxZoom1WidthWithLabel");
					break;
				case library.ProcessFlowZoomLevel.Three:
					oRm.class("sapSuiteUiCommonsBoxZoom3WidthWithLabel");
					break;
				case library.ProcessFlowZoomLevel.Four:
					oRm.class("sapSuiteUiCommonsBoxZoom4WidthWithLabel");
					break;
				default:
					oRm.class("sapSuiteUiCommonsBoxZoom2WidthWithLabel");
			}
		} else {
			switch (zoomLevel) {
				case library.ProcessFlowZoomLevel.One:
					oRm.class("sapSuiteUiCommonsBoxZoom1Width");
					break;
				case library.ProcessFlowZoomLevel.Three:
					oRm.class("sapSuiteUiCommonsBoxZoom3Width");
					break;
				case library.ProcessFlowZoomLevel.Four:
					oRm.class("sapSuiteUiCommonsBoxZoom4Width");
					break;
				default:
					oRm.class("sapSuiteUiCommonsBoxZoom2Width");
			}
		}
		if (connection.hasOwnProperty("right") && connection.right.draw) {
			oRm.class("sapSuiteUiCommonsBoxMiddleBorderHeight");
			oRm.class("sapSuiteUiCommonsBorderBottom");
			if (connection.right.type === library.ProcessFlowConnectionType.Planned) {
				oRm.class("sapSuiteUiCommonsBorderBottomTypePlanned");
			} else {
				oRm.class("sapSuiteUiCommonsBorderBottomTypeNormal");
			}
			if (connection.right.state === library.ProcessFlowConnectionState.Highlighted) {
				oRm.class("sapSuiteUiCommonsBorderBottomStateHighlighted");
				oRm.class("sapSuiteUiCommonsStateHighlighted");
			} else if (connection.right.state === library.ProcessFlowConnectionState.Dimmed) {
				oRm.class("sapSuiteUiCommonsBorderBottomStateDimmed");
			} else if (connection.right.state === library.ProcessFlowConnectionState.Selected) {
				oRm.class("sapSuiteUiCommonsBorderBottomStateSelected");
				oRm.class("sapSuiteUiCommonsStateSelected");
			} else {
				oRm.class("sapSuiteUiCommonsBorderBottomStateRegular");
				oRm.class("sapSuiteUiCommonsStateRegular");
			}
		} else {
			oRm.class("sapSuiteUiCommonsBoxMiddleHeight");
		}
		oRm.openEnd();

		if (connection.labels && oControl._showLabels) {
			ProcessFlowConnectionRenderer._renderLabel(oRm, oControl, connection);
		}

		if (connection.arrow) {
			oRm.openStart("div");
			oRm.class("sapSuiteUiCommonsArrowRight");
			if (connection.hasOwnProperty("right")) {
				if (connection.right.state === library.ProcessFlowConnectionState.Highlighted) {
					oRm.class("sapSuiteUiCommonsBorderLeftStateHighlighted");
				} else if (connection.right.state === library.ProcessFlowConnectionState.Dimmed) {
					oRm.class("sapSuiteUiCommonsBorderLeftStateDimmed");
				} else if (connection.right.state === library.ProcessFlowConnectionState.Selected) {
					oRm.class("sapSuiteUiCommonsBorderLeftStateSelected");
				} else {
					oRm.class("sapSuiteUiCommonsBorderLeftStateRegular");
				}
			}
			oRm.openEnd();
			oRm.close("div");
		}
		oRm.close("div");
	};

	/**
	 * Writes the third row of a special line (e.g. branch).
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {object} connection Connection which needs to be checked
	 * @param {object} zoomLevel Zoom level of control
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 */
	ProcessFlowConnectionRenderer._writeThirdRowOfSpecialLine = function (oRm, connection, zoomLevel, oControl) {
		ProcessFlowConnectionRenderer._resetFloat(oRm);

		// Left column
		oRm.openStart("div");
		oRm.class("sapSuiteUiCommonsFloatLeft");
		if (oControl._getShowLabels()) {
			oRm.class("sapSuiteUiCommonsPFWithLabel");
		}
		switch (zoomLevel) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsBoxZoom1Width");
				oRm.class("sapSuiteUiCommonsBoxBottomZoom1Height");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsBoxZoom3Width");
				oRm.class("sapSuiteUiCommonsBoxBottomZoom3Height");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsBoxZoom4Width");
				oRm.class("sapSuiteUiCommonsBoxBottomZoom4Height");
				break;
			default:
				oRm.class("sapSuiteUiCommonsBoxZoom2Width");
				oRm.class("sapSuiteUiCommonsBoxBottomZoom2Height");
		}
		oRm.openEnd();
		oRm.close("div");

		// Middle column
		oRm.openStart("div");
		if (oControl._getShowLabels()) {
			oRm.class("sapSuiteUiCommonsPFWithLabel");
		}
		oRm.class("sapSuiteUiCommonsFloatLeft");
		switch (zoomLevel) {
			case library.ProcessFlowZoomLevel.One:
				oRm.class("sapSuiteUiCommonsBoxBottomZoom1Height");
				break;
			case library.ProcessFlowZoomLevel.Three:
				oRm.class("sapSuiteUiCommonsBoxBottomZoom3Height");
				break;
			case library.ProcessFlowZoomLevel.Four:
				oRm.class("sapSuiteUiCommonsBoxBottomZoom4Height");
				break;
			default:
				oRm.class("sapSuiteUiCommonsBoxBottomZoom2Height");
		}
		if (connection.hasOwnProperty("bottom") && connection.bottom.draw) {
			oRm.class("sapSuiteUiCommonsBoxMiddleBorderWidth");
			oRm.class("sapSuiteUiCommonsBorderLeft");
			if (connection.bottom.type === library.ProcessFlowConnectionType.Planned) {
				oRm.class("sapSuiteUiCommonsBorderLeftTypePlanned");
			} else {
				oRm.class("sapSuiteUiCommonsBorderLeftTypeNormal");
			}
			if (connection.bottom.state === library.ProcessFlowConnectionState.Highlighted) {
				oRm.class("sapSuiteUiCommonsBorderLeftStateHighlighted");
				oRm.class("sapSuiteUiCommonsStateHighlighted");
			} else if (connection.bottom.state === library.ProcessFlowConnectionState.Dimmed) {
				oRm.class("sapSuiteUiCommonsBorderLeftStateDimmed");
			} else if (connection.bottom.state === library.ProcessFlowConnectionState.Selected) {
				oRm.class("sapSuiteUiCommonsBorderLeftStateSelected");
				oRm.class("sapSuiteUiCommonsStateSelected");
			} else {
				oRm.class("sapSuiteUiCommonsBorderLeftStateRegular");
				oRm.class("sapSuiteUiCommonsStateRegular");
			}
		} else {
			oRm.class("sapSuiteUiCommonsBoxMiddleWidth");
		}
		oRm.openEnd();
		oRm.close("div");

		// Right column
		// Omitted
	};

	/**
	 * Resets the float.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 */
	ProcessFlowConnectionRenderer._resetFloat = function (oRm) {
		oRm.openStart("div");
		oRm.class("sapSuiteUiCommonsFloatClear");
		oRm.openEnd();
		oRm.close("div");
	};

	/**
	 * Renders the label based on criteria like state and priority.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 */
	ProcessFlowConnectionRenderer._renderLabel = function (oRm, oControl) {
		var oLabel = oControl._getVisibleLabel();
		if (oControl.getAggregation("_labels")) {
			var aLabels = oControl.getAggregation("_labels");
			for (var i = 0; i < aLabels.length; i++) {
				if (aLabels[i]._getSelected()) {
					oLabel._setDimmed(false);
					if (aLabels[i].getId() !== oLabel.getId()) {
						oLabel._setSelected(true);
						aLabels[i]._setSelected(false);
					}
				}
			}
		}
		if (oLabel) {
			oRm.renderControl(oLabel);
		}
	};


	return ProcessFlowConnectionRenderer;

}, /* bExport= */ true);
