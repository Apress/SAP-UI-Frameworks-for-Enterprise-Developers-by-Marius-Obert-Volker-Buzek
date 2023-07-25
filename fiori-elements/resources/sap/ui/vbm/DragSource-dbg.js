/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.DragSource.
sap.ui.define([
	"sap/ui/core/Element",
	"./library"
], function(Element, library) {
	"use strict";

	/**
	 * Constructor for a new DragSource.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class DragSource Aggregation element
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.DragSource
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DragSource = Element.extend("sap.ui.vbm.DragSource", /** @lends sap.ui.vbm.DragSource.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Drag type
				 */
				type: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.DragSource.prototype.init = function(){
	// // do something for initialization...
	// };

	return DragSource;

});
