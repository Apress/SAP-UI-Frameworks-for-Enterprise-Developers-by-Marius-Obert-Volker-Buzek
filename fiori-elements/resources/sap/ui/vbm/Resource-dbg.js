/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Resource.
sap.ui.define([
	"sap/ui/core/Element",
	"./library"
], function(Element, library) {
	"use strict";

	/**
	 * Constructor for a new Resource.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class A resource is a Base64 encoded representation of an image binary that can be referenced by name in e.g. a <i>Spot</i> element. When
	 *        images are specified as a string resource it is guaranteed that the control can access the bits in the image. If just a URL to the
	 *        resource is given it is loaded and converted to a Base64 encoded binary. This happens asynchronously and it may require several
	 *        re-renderings of the control until all resource show up correctly.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Resource
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Resource = Element.extend("sap.ui.vbm.Resource", /** @lends sap.ui.vbm.Resource.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Value of the resource. Base64 endode binary.
				 */
				value: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * URL to an image. It is important that the image data is readable fom the visual business control. Therefore e.g. images coming from
				 * a local drive or cross domains are not allowed. The preferred way is to use the Base64 encoded data provided using the value
				 * property.
				 */
				src: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
				 * Name of the resource. The name should be always used when a resource is referenced.
				 */
				name: {
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
	// sap.ui.vbm.Resource.prototype.init = function(){
	// // do something for initialization...
	// };

	return Resource;

});
