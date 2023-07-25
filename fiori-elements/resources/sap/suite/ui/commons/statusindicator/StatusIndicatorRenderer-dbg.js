/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"../library",
	"sap/ui/core/library",
	"sap/suite/ui/commons/util/HtmlElement",
	"sap/ui/core/Renderer",
	"sap/base/Log"
], function (library, coreLibrary, HtmlElement, Renderer, Log) {
	"use strict";

	var oSizeType = library.statusindicator.SizeType;
	var oLabelPositionType = library.statusindicator.LabelPositionType;
	var oTextAlignType = coreLibrary.TextAlign;
	var resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	function getClassBySize(oStatusIndicator, sPostfix) {
		var sResult = "";
		sPostfix = typeof sPostfix === "string" ? sPostfix : "";

		switch (oStatusIndicator.getSize()) {
			case oSizeType.Small:
				sResult = "sapSuiteUiCommonsStatusIndicatorSmall";
				break;
			case oSizeType.Medium:
				sResult = "sapSuiteUiCommonsStatusIndicatorMedium";
				break;
			case oSizeType.Large:
				sResult = "sapSuiteUiCommonsStatusIndicatorLarge";
				break;
			case oSizeType.ExtraLarge:
				sResult = "sapSuiteUiCommonsStatusIndicatorExtraLarge";
				break;
			case oSizeType.None:
				// nothing
				break;
			default:
				Log.error("Unknown size. Expecting size defined in sap.suite.ui.commons.statusindicator.SizeType," +
					" but '" + oStatusIndicator.getSize() + "' given.");
				// default size is small
				sResult = "sapSuiteUiCommonsStatusIndicatorSmall";
		}

		// if sResult is empty then return empty string
		if (sResult) {
			return sResult + sPostfix;
		} else {
			return "";
		}
	}

	function getLabelMarginClass(oStatusIndicator) {
		var sPosition = oStatusIndicator.getLabelPosition();
		var sSize = oStatusIndicator.getSize();
		return "sapSuiteUiCommonsStatusIndicator" + sSize + sPosition + "Label";
	}

	/**
	 * StatusIndicator renderer.
	 * @namespace
	 * @extends sap.ui.core.Renderer
	 */
	var StatusIndicatorRenderer = Renderer.extend("sap.suite.ui.commons.StatusIndicatorRenderer");
	StatusIndicatorRenderer.apiVersion = 2;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 *            The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.suite.ui.commons.StatusIndicator} oControl
	 *            An object representation of the control that should be rendered.
	 */
	StatusIndicatorRenderer.render = function (oRm, oControl) {
		var oModel = this._getHtmlModel(oControl);
		oModel.getRenderer().render(oRm);
	};

	/**
	 * Returns HtmlElement instance of the root div of the StatusIndicator.
	 *
	 * @param {sap.suite.ui.commons.StatusIndicator} oStatusIndicator
	 *            the StatusIndicator to be rendered
	 * @returns {sap.suite.ui.commons.util.HtmlElement} root div HtmlElement instance
	 * @private
	 */
	StatusIndicatorRenderer._getHtmlModel = function (oStatusIndicator) {
		var sLabelPosition = oStatusIndicator.getLabelPosition();
		var bIsRowOriented = sLabelPosition === oLabelPositionType.Left || sLabelPosition === oLabelPositionType.Right,
			bIsLabelFirst = sLabelPosition === oLabelPositionType.Left || sLabelPosition === oLabelPositionType.Top;

		var oRootElement = new HtmlElement("div");
		oRootElement.addControlData(oStatusIndicator);
		oRootElement.addClass("sapSuiteUiCommonsStatusIndicator");
		oRootElement.setAttribute("role", "progressbar");
		oRootElement.setAttribute("aria-roledescription", resourceBundle.getText("STATUS_INDICATOR_ARIA_ROLE_DESCRIPTION"));

		var sAriaLabel = oStatusIndicator.getAriaLabel();
		oRootElement.setAttribute("aria-label", sAriaLabel ? sAriaLabel : resourceBundle.getText("STATUS_INDICATOR_ARIA_LABEL"), true);

		var aAriaLabelledBy = oStatusIndicator.getAriaLabelledBy();

		if (aAriaLabelledBy && aAriaLabelledBy.length > 0) {
			oRootElement.setAttribute("aria-labelledby", aAriaLabelledBy.join(" "), true);
		}

		var aAriaDescribedBy = oStatusIndicator.getAriaDescribedBy();

		if (aAriaDescribedBy && aAriaDescribedBy.length > 0) {
			oRootElement.setAttribute("aria-describedby", aAriaDescribedBy.join(" "), true);
		}

		oRootElement.setAttribute("tabindex", "0");
		oRootElement.setAttribute("aria-valuemin", 0);
		oRootElement.setAttribute("aria-valuemax", 100);

		if (bIsRowOriented) {
			oRootElement.addClass("sapSuiteUiCommonsStatusIndicatorHorizontal");
		} else {
			oRootElement.addClass("sapSuiteUiCommonsStatusIndicatorVertical");
		}

		if (oStatusIndicator.getShowLabel()) {
			var oLabelWrapper = new HtmlElement("div");
			if (bIsLabelFirst) {
				oLabelWrapper.addClass("sapSuiteUiCommonsStatusIndicatorLabelBeforeSvg");
			} else {
				oLabelWrapper.addClass("sapSuiteUiCommonsStatusIndicatorLabelAfterSvg");
			}

			var oLabel = oStatusIndicator.getLabel();
			oLabel.addStyleClass("sapSuiteUiCommonsStatusIndicatorLabel");
			oLabel.addStyleClass(getClassBySize(oStatusIndicator, "Label"));
			oLabel.addStyleClass(getLabelMarginClass(oStatusIndicator));
			oLabel.setTextAlign(bIsRowOriented ? oTextAlignType.Left : oTextAlignType.Center);

			oLabelWrapper.addChild(oLabel);
			oRootElement.addChild(oLabelWrapper);
		}

		var oSvgContainer = new HtmlElement("div");
		oSvgContainer.setAttribute("focusable", false);
		oSvgContainer.addClass("sapSuiteUiCommonsStatusIndicatorSvg");

		oSvgContainer.addClass(getClassBySize(oStatusIndicator, "Svg"));
		oSvgContainer.addStyle("width", oStatusIndicator.getWidth());
		oSvgContainer.addStyle("height", oStatusIndicator.getHeight());
		oSvgContainer.addChild(this._getSvgElement(oStatusIndicator));

		oRootElement.addChild(oSvgContainer);

		return oRootElement;
	};


	/**
	 * Returns HtmlElement object of the svg element
	 *
	 * @param {sap.suite.ui.commons.StatusIndicator} oStatusIndicator
	 *            the StatusIndicator to be rendered
	 * @returns {sap.suite.ui.commons.util.HtmlElement} svg HtmlElement instance
	 * @private
	 */
	StatusIndicatorRenderer._getSvgElement = function (oStatusIndicator) {
		var oSvg = new HtmlElement("svg");
		oSvg.setId(oStatusIndicator._getFullId(oStatusIndicator._internalIds.svgNodeId));
		oSvg.setAttribute("version", "1.1");
		oSvg.setAttribute("xlmns", "http://www.w3.org/2000/svg");
		oSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
		oSvg.addStyle("width", "100%");
		oSvg.addStyle("height", "100%");

		oSvg.setAttribute("focusable", false);
		if (oStatusIndicator.getViewBox()) {
			oSvg.setAttribute("viewBox", oStatusIndicator.getViewBox());
		}

		oStatusIndicator._getGroupShapes().forEach(function (oShape) {
			oSvg.addChild(oShape);
		});

		return oSvg;
	};

	return StatusIndicatorRenderer;

}, true);
