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

	/**
	 * StatusIndicator renderer.
	 * @namespace
	 * @extends sap.ui.core.Renderer
	 */
	var CustomShapeRenderer = Renderer.extend("sap.suite.ui.commons.statusindicator.CustomShapeRenderer");
	CustomShapeRenderer.apiVersion = 2;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 *            The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.suite.ui.commons.StatusIndicator} oControl
	 *            An object representation of the control that should be rendered.
	 *
	 * @returns {void}
	 */
	CustomShapeRenderer.render = function (oRm, oControl) {
		var oModel = this._getHtmlModel(oControl);
		oModel.getRenderer().render(oRm);
	};

	/**
	 * Returns HTML structure of the shape.
	 *
	 * @param {sap.suite.ui.commons.statusindicator.CustomShape} oControl control object
	 *
	 * @returns {object} html model
	 */
	CustomShapeRenderer._getHtmlModel = function (oControl) {
		var oShapeRootElement = new HtmlElement("svg");
		oShapeRootElement.addControlData(oControl);
		oShapeRootElement.setAttribute("version", "1.1");
		oShapeRootElement.setAttribute("xlmns", "http://www.w3.org/2000/svg");

		var sInternalViewBox = oControl._getInternalViewBox();
		if (sInternalViewBox) {
			oShapeRootElement.setAttribute("viewBox", sInternalViewBox);
		}
		oShapeRootElement.setAttribute("preserveAspectRatio", oControl._buildPreserveAspectRatioAttribute());
		oShapeRootElement.setAttribute("x", oControl.getX());
		oShapeRootElement.setAttribute("y", oControl.getY());
		oShapeRootElement.setAttribute("width", oControl.getWidth());
		oShapeRootElement.setAttribute("height", oControl.getHeight());

		oControl.getShapes().forEach(oShapeRootElement.addChild.bind(oShapeRootElement));

		return oShapeRootElement;
	};

	CustomShapeRenderer._updateDomColor = function (oControl, sFillColor) {
		oControl._aFillableSubShapes.forEach(function (oSubShape) {
			var oShape = oSubShape.shape;
			var oRenderer = oShape.getRenderer();
			oRenderer._updateDomColor(oShape, sFillColor);
		});
	};

	return CustomShapeRenderer;

}, true);
