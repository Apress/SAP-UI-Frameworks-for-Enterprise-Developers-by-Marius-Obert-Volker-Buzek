sap.ui.define([
	"sap/ui/core/Element"
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new CustomSizeItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
		A <code>CustomSizeItem</code> can be used in the {@link sap.suite.ui.commons.imageeditor.ImageEditorContainer} aggregations to define custom items on the Resize, Crop Rectangle, and Crop Ellipse panels.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.66.0
	 *
	 * @constructor
	 * @public
	 *
	 * @alias sap.suite.ui.commons.imageeditor.CustomSizeItem
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var CustomSizeItem = Element.extend("sap.suite.ui.commons.imageeditor.CustomSizeItem", {
		metadata: {
			properties: {
				/**
				 * Defines the width of the <code>CustomSizeItem</code>. <br>This property is mandatory and must be greater than 0.
				 */
				width: {type: "float", defaultValue: 0},
				/**
				 * * Defines the height of the <code>CustomSizeItem</code>. <br>This property is mandatory and must be greater than 0.
				 */
				height: {type: "float", defaultValue: 0},
				/**
				 * Defines the label of the <code>CustomSizeItem</code>.
				 */
				label: {type: "string", defaultValue: ""},
				/**
				 * Defines the icon to be displayed in the <code>CustomSizeItem</code>. <br>If no icon is specified, the default image is used, which is derived from the set width and height.
				 */
				icon: {type: "sap.ui.core.URI", defaultValue: ""},
				/**
				 * Specifies whether the <code>width</code> and <code>height</code> properties use relative values (<code>true</code>) or absolute values (<code>false</code>).
				 * <br>When used in the <code>customResizeItems</code> aggregation of an {@link sap.suite.ui.commons.imageeditor.ImageEditorContainer}, width and height are multiplied by the <code>width</code> and <code>height</code> properties of the <code>CustomSizeItem</code>.
				 * <br>When used in the <code>customRectangleCropItems</code> or <code>customEllipseCropItems</code> aggregations of an {@link sap.suite.ui.commons.imageeditor.ImageEditorContainer}, aspect ratio is set to the <code>width</code> and <code>height</code> properties of the <code>CustomSizeItem</code>.
				 */
				relative: {type: "boolean", defaultValue: false}
			}
		}
	});

	return CustomSizeItem;
});
