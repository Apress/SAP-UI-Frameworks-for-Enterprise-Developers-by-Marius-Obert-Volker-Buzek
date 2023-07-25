/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"./CustomShape",
	"./CustomShapeRenderer",
	"./shapes/ShapeFactory"
], function (CustomShape, CustomShapeRenderer, ShapeFactory) {
	"use strict";

	/**
	 * Constructor for a new Library Shape.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Custom shape that is selected by <code>shapeId</code> from the shapes library.
	 * @extends sap.suite.ui.commons.statusindicator.CustomShape
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.60.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.statusindicator.LibraryShape
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var LibraryShape = CustomShape.extend("sap.suite.ui.commons.statusindicator.LibraryShape",
		/** @lends sap.suite.ui.commons.statusindicator.CustomShape.prototype */ {
			metadata: {
				properties: {
					/**
					 * An ID associated with a specific shape from the shape library.
					 */
					shapeId: {
						type: "string", group: "Misc", defaultValue: null
					}
				},
				events: {
					/**
					 * This event is fired when the definition of shape is loaded.
					 */
					"afterShapeLoaded": {}
				}
			},
			renderer: CustomShapeRenderer
		});

	LibraryShape.prototype.setShapeId = function (sShapeId) {
		sShapeId = this._getValidShapeId(sShapeId);
		this.setProperty("shapeId", sShapeId, true);
		new ShapeFactory().getShapeById(sShapeId).then(function (sData) {
			this.setDefinition(sData);
			this.fireAfterShapeLoaded();
		}.bind(this));

		return this;
	};

	LibraryShape.prototype._getValidShapeId = function (sShapeId) {
		return sShapeId.replace(/[\\\.\/]/g, "");
	};

	return LibraryShape;

});
