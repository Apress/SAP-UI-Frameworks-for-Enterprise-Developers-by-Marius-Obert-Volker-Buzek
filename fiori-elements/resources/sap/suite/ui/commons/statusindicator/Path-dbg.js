/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.statusindicator.Path.
sap.ui.define([
		"sap/suite/ui/commons/util/HtmlElement",
		"sap/suite/ui/commons/statusindicator/SimpleShape",
		"sap/suite/ui/commons/statusindicator/SimpleShapeRenderer"
	],
	function (HtmlElement, SimpleShape, SimpleShapeRenderer) {
		"use strict";

		/**
		 * Constructor for a new Path.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * Shape that consists of a single SVG path element.
		 * @extends sap.suite.ui.commons.statusindicator.SimpleShape
		 *
		 * @author SAP SE
		 * @version 1.113.0
		 * @since 1.50
		 *
		 * @constructor
		 * @public
		 * @alias sap.suite.ui.commons.statusindicator.Path
		 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
		 */
		var Path = SimpleShape.extend("sap.suite.ui.commons.statusindicator.Path",
			/** @lends sap.suite.ui.commons.statusindicator.Shape.prototype */
			{
				metadata: {
					library: "sap.suite.ui.commons",
					properties: {

						/**
						 * Specifies the path that outlines the shape.
						 * The format is identical to the <code>d</code> attribute of the <code>&lt;path&gt;</code>
						 * SVG element.
						 */
						d: {type: "string", defaultValue: null}
					}
				},
				renderer: SimpleShapeRenderer
			});

		Path.prototype._getSimpleShapeElement = function (sPathId) {
			var oPathElement = new HtmlElement("path");

			oPathElement.setId(this._buildIdString(sPathId));
			oPathElement.setAttribute("d", this.getD());
			oPathElement.setAttribute("stroke-width", this.getStrokeWidth());
			oPathElement.setAttribute("stroke", this._getCssStrokeColor());
			if (this.aCustomStyleClasses) {
				this.aCustomStyleClasses.forEach(oPathElement.addClass.bind(oPathElement));
			}

			return oPathElement;
		};

		return Path;

	});
