/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"../library",
	"sap/suite/ui/commons/util/HtmlElement",
	"sap/ui/core/Renderer"
], function (library, HtmlElement, Renderer) {
	"use strict";

	var FillingType = library.statusindicator.FillingType;

	/**
	 * StatusIndicator renderer.
	 * @namespace
	 * @extends sap.ui.core.Renderer
	 */
	var SimpleShapeRenderer = Renderer.extend("sap.suite.ui.commons.statusindicator.SimpleShapeRenderer");
	SimpleShapeRenderer.apiVersion = 2;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 *            The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.suite.ui.commons.StatusIndicator} oControl
	 *            An object representation of the control that should be rendered.
	 */
	SimpleShapeRenderer.render = function (oRm, oControl) {
		var oModel = this._getHtmlModel(oControl);
		oModel.getRenderer().render(oRm);
	};

	/**
	 * Returns the HTML structure of the shape.
	 *
	 * @param {sap.suite.ui.commons.statusindicator.SimpleShape} oControl object by which html model will be generated
	 * @returns {HtmlElement} html model
	 *
	 * @private
	 */
	SimpleShapeRenderer._getHtmlModel = function (oControl) {
		var sMaskId = oControl._buildIdString(oControl.getId(), "mask");

		// root element has to be svg with namespace. It is due the way openui5 renders controls.
		// if root element is not svg with namespace, the element is not correctly displayed by browser
		var oShapeRootElement = new HtmlElement("svg");
		oShapeRootElement.setAttribute("xlmns", "http://www.w3.org/2000/svg");

		var sInternalViewBox = oControl._getInternalViewBox();
		if (sInternalViewBox) {
			oShapeRootElement.setAttribute("viewBox", sInternalViewBox);
		}
		oShapeRootElement.setAttribute("preserveAspectRatio", oControl._buildPreserveAspectRatioAttribute());
		oShapeRootElement.setAttribute("overflow", "visible");
		oShapeRootElement.addControlData(oControl);

		var oDefsElement = new HtmlElement("defs");

		if (oControl.getFillingType() !== FillingType.None) {
			// gradient element

			if (oControl._useGradientForAnimation()) {
				oDefsElement.addChild(oControl._getGradientElement(oControl._iDisplayedValue));
			}

			// mask element
			var oMaskElement = oControl._getMaskElement(sMaskId);
			oDefsElement.addChild(oMaskElement);
			oShapeRootElement.addChild(oDefsElement);
		}

		// element
		var sShapeId = oControl._buildIdString(oControl.getId(), "shape");
		var oShapeElement = oControl._getSimpleShapeElement(sShapeId);
		oShapeElement.setAttribute("fill", oControl._resolveFillColor());
		oShapeElement.setAttribute("mask", oControl._buildSvgUrlString(sMaskId));

		if (oControl._sStyleAttribute) {
			oShapeElement.setAttribute("style", oControl._sStyleAttribute);
		}

		oShapeElement.setAttribute("stroke-width", 0);
		oShapeRootElement.addChild(oShapeElement);

		var oBorderShapeElement = oControl._getSimpleShapeElement(oControl._buildIdString(sShapeId, "border"));
		oBorderShapeElement.setAttribute("fill", "transparent");
		oShapeRootElement.addChild(oBorderShapeElement);

		return oShapeRootElement;
	};

	SimpleShapeRenderer._updateDomColor = function (oControl, sNewFillColor) {
		oControl.$("shape").attr("fill", sNewFillColor);
	};

	SimpleShapeRenderer._updateDomGradient = function (oControl, iValue) {
		if (!oControl.$stopNodes) {
			oControl.$stopNodes = oControl.$(oControl.GRADIENT_ID).find(oControl.STOP_ID);
		}

		oControl.$stopNodes.attr("offset", oControl._getDisplayedGradientOffset(iValue));
	};

	SimpleShapeRenderer._updateDomPolygon = function (oControl, iValue) {
		// polygon based animation
		if (!oControl.$polygon) {
			oControl.$polygon = oControl.$("polygon");
		}

		var sPointsAttributeValue = oControl._getPolygonPoints(iValue)
			.reduce(function (acc, item) {
				return acc + item.x + "," + item.y + " ";
			}, "");
		oControl.$polygon.attr("points", sPointsAttributeValue);
	};

	SimpleShapeRenderer._clearDomReferences = function (oControl) {
		oControl.$polygon = null;
		oControl.$stopNodes = null;
	};

	return SimpleShapeRenderer;

}, true);
