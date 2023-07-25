/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/core/Element"
], function (Element) {
	"use strict";

	/**
	 * Constructor for a new Coordinate.
	 *
	 * @class
	 * Holds information about coordinates on a two-dimensional Cartesian plane.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.Coordinate
	 */
	var Coordinate = Element.extend("sap.suite.ui.commons.networkgraph.Coordinate", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * The value of the x coordinate.
				 */
				x: {
					type: "float", group: "Misc", defaultValue: undefined
				},
				/**
				 * The value of the y coordinate.
				 */
				y: {
					type: "float", group: "Misc", defaultValue: undefined
				}
			}
		}
	});

	Coordinate.prototype.setX = function (iX) {
		this.setProperty("x", iX, true);
		return this;
	};

	Coordinate.prototype.setY = function (iY) {
		this.setProperty("y", iY, true);
		return this;
	};

	return Coordinate;
});
