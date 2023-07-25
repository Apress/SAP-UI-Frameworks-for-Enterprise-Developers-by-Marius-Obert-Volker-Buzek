/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the base visual object.
sap.ui.define([
	"sap/ui/base/Object"
], function(BaseObject) {
	"use strict";

	/**
	 * VBI JSON is a result of conversion from XML to JSON. As a result, all property values
	 * in VBI JSON are encoded as strings. But logically they have well defined types.
	 *
	 * Types of VBI object's properties.
	 *
	 * All values are represented as strings. This is due to automatic translation of XML to JSON and lack of XML Schema for VBI XML.
	 *
	 * <caption>color</caption>
	 * A string in one of the following formats (delimiters can be either , (comma) or ; (semicolon)),
	 * The components are integers, decimal or hexadecimal starting with 0x or 0X:
	 *   RGB(r,g,b)
	 *   RGB(r;g;b)
	 *   RGBA(r,g,b,a)
	 *   RGBA(r;g;b;a)
	 *   ARGB(a,r,g,b)
	 *   ARGB(a;r;g;b)
	 *   HLS(h,l,s)
	 *   HLS(h;l;s)
	 *   HLSA(h,l,s,a)
	 *   HLSA(h;l;s;a)
	 * A hexadecimal representation of an integer number, a string starting with 0x or 0X:
	 *   0xaabbggrr
	 *   0Xaabbggrr
	 * A decimal representation of an integer number:
	 *   d+
	 * Everything else results in the black color with alpha 0.
	 *
	 * <caption>colorDelta</code>
	 * A string in one of the following formats (delimiter is only ; (semicolon), this is different from type 'color'),
	 * the components are float numbers:
	 *   RHLS(h;l;s)
	 *   RHLSA(h;l;s;a)
	 *
	 * <caption>boolean</caption>
	 * The <code>true</code> value is:
	 *   any string starting with characters:
	 *     't'
	 * The <code>false</code> value is:
	 *   an empty string '',
	 *   a string starting with characters:
	 *     'f'
	 *     ' '
	 *     '0'
	 * Any other string represents value <code>true</code>.
	 *
	 * <caption>vector3</caption>
	 * A string representation of three float numbers delimited with ; (semicolon).
	 */

	////////////////////////////////////////////////////////////////////////////
	// region: Window
	// Windows of type 'default' are 3D windows and their visual representation
	// is implemented as sap.ui.vk.threejs.Viewport.
	// Windows of type 'callout' are detail windows implemented as sap.m.ResponsivePopover.
	// The properties of the windows are non-bindable expect for property 'pos'.

	var windowPrototype = {
		id:        undefined,	// type: string
		type:      "default",	// type: string (enum: 'default' for 3D windows, 'callout' for detail windows)
		caption:   undefined,	// type: string
		refScene:  undefined,	// type: string (ID of the referenced scene), used as a weak reference
		refParent: undefined,	// type: string (ID of the parent window), used as a weak reference
		width:     "0",			// type: float
		height:    "0",			// type: float
		modal:     "true",		// type: boolean
		pos:       "0;0;0"		// type: vector, bindable
	};

	// endregion: Window
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// region: Scene
	// Scenes of type 'geo' are geo maps.
	// Scenes of type 'default' are 3D scenes and detail window scenes.
	// 3D scenes contain 3D visual objects - boxes and Collada models.
	// Detail window scenes contain UI controls like labels, URLs, buttons etc.

	var scenePrototype = {
		id:       undefined, // type: string
		type:     "default", // type: string (enum 'geo', 'default')
		voGroups: undefined, // type: array, this array contains Javascript references to visual object groups belonging to this scene.

		getVisualObjectGroupById: function(id) {
			for (var i = 0, count = this.voGroups.length; i < count; ++i) {
				var voGroup = this.voGroups[i];
				if (voGroup.id === id) {
					return voGroup;
				}
			}
			return undefined;
		}
	};

	// endregion: Scene
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// region: Visual Object Group

	var visualObjectGroupPrototype = {
		id:               undefined,	// type: string
		type:             undefined,	// type: string (GUID)
		datasource:       undefined,	// type: string
		scene:            undefined,	// type: object
		vos:              undefined,	// type: array
		maxSel:           "-1",			// type: integer, a copy from the DataTypes section
		minSel:           "0",			// type: integer, a copy from the DataTypes section
		keyAttributeName: undefined,	// type: string, a copy from the DataTypes section
		template:         undefined,	// type: object, property names are VO's attribute names, the values are either { value: "value" }
										// if the value is specified or { path: [ part1, part2, ... ] } if the property is data bound.
										// The 'path' contains a single attribute name is if 'datasource' is defined, or an absolute path if 'datasource' is undefined,
										// e.g. [ 'DetailWindow', 1, 'Column', 4, 'Text' ].
		isDataBound:      false,		// type: boolean, true if any attribute is data bound
		isDirty:          true			// type: boolean, indicates if the visual object group is new or updated
	};

	// endregion: Visual Object Group
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// region: Visual Objects
	// All visual objects have the following properties.
	// The values of properties are string representations of types defined in the comments.
	// NB: the properties with the 'undefined' value are declared to be enumerable in for...in loops.

	var threeDVisualObjectPrototype = Object.create(Object.prototype);

	// Changes to these properties result in the ElementChanged event.
	threeDVisualObjectPrototype["VB:c"]	= "false";	// type: boolean, full name: changeable
	threeDVisualObjectPrototype["VB:s"]	= "false";	// type: boolean, full name: selected

	// Changes to these properties result in the AttributeChanged event.
	threeDVisualObjectPrototype.color         = "RGB(128,128,128)";		// type: color
	threeDVisualObjectPrototype.fxdir         = "false";				// type: boolean
	threeDVisualObjectPrototype.fxsize        = "false";				// type: boolean
	threeDVisualObjectPrototype.hotDeltaColor = "RHLSA(0;1.1;1;1)";		// type: color or colorDelta
	threeDVisualObjectPrototype.opacity       = "1";					// type: float
	threeDVisualObjectPrototype.pos           = "0;0;0";				// type: vector3
	threeDVisualObjectPrototype.rot           = "0;0;0";				// type: vector3
	threeDVisualObjectPrototype.scale         = "1;1;1";				// type: vector3
	threeDVisualObjectPrototype.selectColor   = "RGBA(178;127;0;255)";	// type: color or colorDelta
	threeDVisualObjectPrototype.zsort         = "false";				// type: boolean
	threeDVisualObjectPrototype.dragSource    = undefined;				// type: string 
	threeDVisualObjectPrototype.dropTarget    = undefined;				// type: string 

	/* Properties which are not implemented
	threeDVisualObjectPrototype.hotScale      = "1.2;1.2;1.2";			// type: vector3	
	*/

	/* Properties whose meaning is unknown in 3D.
	threeDVisualObjectPrototype.icon       = undefined;	// type: string - usage is unclear
	threeDVisualObjectPrototype.image      = undefined;	// type: string - usage is unclear
	threeDVisualObjectPrototype.vmax       = undefined;	// type: vector3 - could not find usage in VB ActiveX
	threeDVisualObjectPrototype.vmin       = undefined;	// type: vector3 - could not find usage in VB ActiveX
	*/

	/**
	 * A prototype for Box visual objects.
	 * NB: the properties with the 'undefined' value are declared to be enumerable in for...in loops.
	 */
	var boxPrototype = Object.create(threeDVisualObjectPrototype);
	boxPrototype.isBox = true;
	boxPrototype.object3D = undefined;		// type: THREE.Object3D, this property can change if changes in other properties result in re-creation of 3D object
	boxPrototype.type = "{00100000-2012-0004-B001-BFED458C3076}";
	boxPrototype.colorBorder = undefined;	// type: color, if missing then no border is rendered.
	boxPrototype.texture     = undefined;	// type: string, a name of a resource which is a base64 encoded image.
	boxPrototype.texture6    = "false";		// type: boolean	
	boxPrototype.normalize   = "false";		// type: boolean
	boxPrototype.tooltip     = undefined;	// type: string

	/**
	 * A prototype for Cylinder visual objects.
	 * NB: the properties with the 'undefined' value are declared to be enumerable in for...in loops.
	 */
	var cylinderPrototype = Object.create(threeDVisualObjectPrototype);
	cylinderPrototype.object3D = undefined;		// type: THREE.Object3D, this property can change if changes in other properties result in re-creation of 3D object
	cylinderPrototype.isCylinder = true;
	cylinderPrototype.type = "{00100000-2012-0004-AFC0-5FDB345FC47E}";
	cylinderPrototype.colorBorder = undefined;	// type: color, if missing then no border is rendered.
	cylinderPrototype.texture     = undefined;	// type: string, a name of a resource which is a base64 encoded image.
	cylinderPrototype.textureCap  = undefined;	// type: string, a name of a resource which is a base64 encoded image.
	cylinderPrototype.isOpen      = false;		// type: boolean, if set to false then the cylinder will be capped.
	cylinderPrototype.normalize   = "false";	// type: boolean	
	cylinderPrototype.tooltip     = undefined;	// type: string

	/**
	 * A prototype for Area visual objects.
	 * NB: the properties with the 'undefined' value are declared to be enumerable in for...in loops.
	 */
	var polygonPrototype = Object.create(threeDVisualObjectPrototype);
	polygonPrototype.isPolygon = true;
	polygonPrototype.type = "{00100000-2014-0004-BDA8-87B904609063}";
	polygonPrototype.OuterNormal = "0;0;1";		// type: string
	polygonPrototype.colorBorder = undefined;	// type: color, if missing then no border is rendered.
	polygonPrototype.tooltip     = undefined;	// type: string

	/**
	 * A prototype for Collada or glTF (glb) Model visual objects.
	 * NB: the properties with the 'undefined' value are declared to be enumerable in for...in loops.
	 */
	var modelPrototype = Object.create(threeDVisualObjectPrototype);
	modelPrototype.isModel		= true;
	modelPrototype.type			= "{00100000-2012-0070-1000-35762CF28B6B}";
	modelPrototype.model		= undefined; // type: string, a name of a resource which is an XML.
	modelPrototype.text			= undefined; // type: string, used as tooltip when there is no tooltip property.
	modelPrototype.texture		= undefined; // type: string, a name of a resource which is a base64 encoded image.
	modelPrototype.normalize	= "false";   // type: boolean
	modelPrototype.tooltip		= undefined; // type: string

	/**
	 * A prototype for Decal visual objects.
	 */
	var decalPrototype = {
		object3D:    undefined,		// type: THREE.Object3D, this property can change if changes in other properties result in re-creation of 3D object
		isDecal:     true,			// type boolean, true if object is decal
		type:        "{388951f5-a66b-4423-a5ad-e0ee13c2246f}", // type: string (GUID)
		position:    "0;0;0",		// type: vector3, a position of a decal in target coordinate system
		direction:   "0;0;0",		// type: vector3, a direction to place decal along to
		size:        "0;0;0",		// type: vector3, a size of a decal
		rotation:    "0",			// type number, orientation of the label along the projection direction (degrees)
		texture:     undefined,		// type: string, a name of a resource which is a base64 encoded image for use as a decal
		text:        undefined,		// type: string, a text (html formatted) to display as a decal
		target:      undefined,		// type: string, a "key" attribute of a target where to apply decal to
		planeOrigin: undefined,		// type vector, an origin of a artificial plane where put decal to (if target is not defined)
		planeNormal: undefined		// type vector, a normal of a artificial plane where put decal to (if target is not defined)
	};

	/**
	 * A prototype for Window control visual objects.
	 */
	var windowControlPrototype = Object.create(Object.prototype);
	windowControlPrototype.left    = "0";		// type: integer
	windowControlPrototype.top     = "0";		// type: integer
	windowControlPrototype.right   = "0";		// type: integer
	windowControlPrototype.bottom  = "0";		// type: integer
	windowControlPrototype.align   = "0";		// type: integer
	windowControlPrototype.tooltip = undefined;	// type: string

	/**
	 * A prototype for Caption visual objects.
	 */
	var captionPrototype = Object.create(windowControlPrototype);
	captionPrototype.isCaption = true;
	captionPrototype.type = "{00100000-2013-1000-1100-50059A6A47FA}";
	captionPrototype.level = "0";		// type: integer
	captionPrototype.text  = undefined;	// type: string

	/**
	 * A prototype for Text visual objects.
	 */
	var labelPrototype = Object.create(windowControlPrototype);
	labelPrototype.isLabel = true;
	labelPrototype.type = "{00100000-2013-1000-3700-AD84DDBBB31B}";
	labelPrototype.text = undefined;	// type: string

	/**
	 * A prototype for Image visual objects.
	 */
	var imagePrototype = Object.create(windowControlPrototype);
	imagePrototype.isImage = true;
	imagePrototype.type = "{00100000-2013-1000-2200-6B060A330B2C}";
	imagePrototype.image = undefined;	// type: string, the resource name

	/**
	 * A prototype for Button visual objects.
	 */
	var buttonPrototype = Object.create(windowControlPrototype);
	buttonPrototype.isButton = true;
	buttonPrototype.type = "{00100000-2013-1000-1200-855B919BB0E9}";
	buttonPrototype.text = undefined;	// type: string

	/**
	 * A prototype for Link visual objects.
	 */
	var linkPrototype = Object.create(windowControlPrototype);
	linkPrototype.isLink = true;
	linkPrototype.type = "{00100000-2013-1000-2400-D305F7942B98}";
	linkPrototype.href = undefined;	// type: string
	linkPrototype.text = undefined;	// type: string

	/**
	 * A map from type ID to visual object prototype.
	 */
	var visualObjectPrototypes = new Map();
	visualObjectPrototypes.set(boxPrototype.type, boxPrototype);
	visualObjectPrototypes.set(cylinderPrototype.type, cylinderPrototype);
	visualObjectPrototypes.set(modelPrototype.type, modelPrototype);
	visualObjectPrototypes.set(polygonPrototype.type, polygonPrototype);
	visualObjectPrototypes.set(decalPrototype.type, decalPrototype);
	visualObjectPrototypes.set(captionPrototype.type, captionPrototype);
	visualObjectPrototypes.set(labelPrototype.type, labelPrototype);
	visualObjectPrototypes.set(imagePrototype.type, imagePrototype);
	visualObjectPrototypes.set(buttonPrototype.type, buttonPrototype);
	visualObjectPrototypes.set(linkPrototype.type, linkPrototype);

	// endregion: Visual Objects
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// region: Data Type Node

	var dataTypePrototype = {
		name:       undefined,	// type: string
		key:        undefined,	// type: string, the name of the attribute that is used as key
		minSel:     "-1",		// type: integer
		maxSel:     "0",		// type: integer
		attributes: undefined,	// type: array of attribute definitions
		dataTypes:  undefined,	// type: array of nested data type nodes

		getKeyAttribute: function() {
			return this.key ? this.getAttributeByName(this.key) : undefined;
		},

		getAttributeByAlias: function(alias) {
			for (var i = 0, count = this.attributes.length; i < count; ++i) {
				var attribute = this.attributes[i];
				if (attribute.alias === alias) {
					return attribute;
				}
			}
			return undefined;
		},

		getAttributeByName: function(name) {
			for (var i = 0, count = this.attributes.length; i < count; ++i) {
				var attribute = this.attributes[i];
				if (attribute.name === name) {
					return attribute;
				}
			}
			return undefined;
		},

		getDataTypeByName: function(name) {
			for (var i = 0, count = this.dataTypes.length; i < count; ++i) {
				var dataType = this.dataTypes[i];
				if (dataType.name === name) {
					return dataType;
				}
			}
			return undefined;
		}
	};

	// endregion: Data Type Node
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// region: Data Type Attribute

	var dataTypeAttributePrototype = {
		name:  undefined,	// type: string
		alias: undefined,	// type: string
		type:  "string"		// type: string
	};

	// endregion: Data Type Attribute
	////////////////////////////////////////////////////////////////////////////

	/**
	 * Constructor for a new visual object factory.
	 *
	 * @class
	 * Provides a base class for visual object factory.
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vbm.adapter3d.ObjectFactory
	 */
	var ObjectFactory = BaseObject.extend("sap.ui.vbm.adapter3d.ObjectFactory", /** @lends sap.ui.vbm.adapter3d.ObjectFactory.prototype */ {});

	/**
	 * Creates a visual object by its type (GUID).
	 *
	 * @param {object} voGroup      A VO group for which a VO instance is to be created.
	 * @returns {object|undefined} An instance of the visual object or <code>undefined</code>.
	 * @public
	 */
	ObjectFactory.prototype.createVisualObject = function(voGroup) {
		var prototype = visualObjectPrototypes.get(voGroup.type);
		var instance = prototype && Object.create(prototype, {
			voGroup: {         // non-enumerable
				writable: true
			},
			dataInstance: {    // non-enumerable
				writable: true
			}
		});
		if (instance) {
			instance._last = {}; // LRU values
			instance.voGroup = voGroup; // The group this VO belongs to.
			voGroup.vos.push(instance);
		}
		return instance;
	};

	/**
	 * Creates a visual object group.
	 *
	 * @param {object} scene The scene the new group belongs to.
	 * @returns {object} A new visual object group.
	 * @public
	 */
	ObjectFactory.prototype.createVisualObjectGroup = function(scene) {
		var group = Object.create(visualObjectGroupPrototype);
		group.scene = scene;
		scene.voGroups.push(group);
		group.template = {};
		group.vos = [];			// VOs belonging to this group
		group.selected = [];	// Selected VOs
		return group;
	};

	/**
	 * Creates a scene.
	 *
	 * @returns {object} A new scene.
	 * @private
	 */
	ObjectFactory.prototype.createScene = function(geo) {
		var scene = Object.create(scenePrototype);
		scene.voGroups = []; // VO groups belonging to this scene
		scene.sceneGeo = geo;
		return scene;
	};

	/**
	 * Creates a new window.
	 *
	 * @returns {object} A new window.
	 * @private
	 */
	ObjectFactory.prototype.createWindow = function() {
		return Object.create(windowPrototype);
	};

	/**
	 * Creates a new data type.
	 *
	 * @returns {object} A new data type.
	 * @private
	 */
	ObjectFactory.prototype.createDataType = function() {
		var dataType = Object.create(dataTypePrototype);
		dataType.attributes = [];
		dataType.dataTypes = [];
		return dataType;
	};

	/**
	 * Creates a new data type attribute.
	 *
	 * @returns {object} A new data type attribute.
	 * @private
	 */
	ObjectFactory.prototype.createDataTypeAttribute = function() {
		return Object.create(dataTypeAttributePrototype);
	};

	/**
	 * Creates a new data node.
	 *
	 * @returns {object[]} A new data node. Each element of the data node is a data instance.
	 * @private
	 */
	ObjectFactory.prototype.createDataNode = function() {
		return [];
	};

	/**
	 * Creates a new data instance.
	 *
	 * @returns {object} A new data instance.
	 * @private
	 */
	ObjectFactory.prototype.createDataInstance = function() {
		return Object.create(Object.prototype, {
			isDirty: {         // non-enumerable
				writable: true
			},
			visualObject: {    // non-enumerable
				writable: true
			}
		});
	};

	return ObjectFactory;
});
