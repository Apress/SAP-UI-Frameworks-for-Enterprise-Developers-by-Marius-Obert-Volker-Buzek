/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// DataProvider and DataType namespace
// Author: Ulrich Roegelein

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

// ...........................................................................//
// helper functions..........................................................//
VBI.isInt = function(input) {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	return ((input - 0) == input && input % 1 == 0);
};

VBI.IndexOf = function(array, ele) {
	// to not use indexof in an array, we do this function here...............//
	var len = array.length;
	for (var nJ = 0; nJ < len; ++nJ) {
		if (ele == array[nJ]) {
			return nJ;
		}
	}
	return -1;
};

// data type enumerator......................................................//
VBI.Types = {
	// type enumeration.......................................................//
	st_unknown: 0,
	st_vector: 1,
	st_string: 2,
	st_vectorarray: 3,
	st_float: 4,
	st_color: 5,
	st_long: 6,
	st_bool: 7,
	st_vectorarraymulti: 8,

	// type conversions.......................................................//

	// ........................................................................//
	// from string conversions................................................//

	string2bool: function(a) {
		if (typeof a == "boolean") {
			return a;
		}
		if (typeof a == "number") {
			return a ? true : false;
		}

		var tmp = a.slice(0, 1); // check first character only
		return (tmp == 't' || tmp == '1' || tmp == 'X') ? true : false;
	},

	string2vector: function(a) {
		var error = false;
		var array = a.split(';');
		for (var nJ = 0, len = array.length; nJ < len; ++nJ) {
			array[nJ] = parseFloat(array[nJ]);
			if (!error && (isNaN(array[nJ]) || !isFinite(array[nJ]))) {
				error = true;
				jQuery.sap.log.error("The string contains invalid numbers");
			}
		}
		return array;
	},

	stringarray2vectorarray: function(a) {
		var result = [];
		// we expect an array of string arrays
		for (var nI = 0, len = a.length; nI < len; ++nI) {
			var polygon = [];
			for (var nJ = 0, len2 = a[nI].length; nJ < len2; ++nJ) {
				polygon.push(this.string2vector(a[nI][nJ]));
			}
			result.push(polygon);
		}
		return result;
	},

	string2rgba: function(a) {
		// return an rgba array [r,g,b,a,x] plus a 5ths component that defines that an alpha was set
		var cache, rgb;
		// CSS color formats
		if ((cache = /^rgba\(([\d]+)[,;]\s*([\d]+)[,;]\s*([\d]+)[,;]\s*([\d]+|[\d]*.[\d]+)\)/.exec(a))) {
			return [
				+cache[1], +cache[2], +cache[3], +cache[4], 1
			];
		} else if ((cache = /^rgba\(([\d]+)\%[,;]\s*([\d]+)\%[,;]\s*([\d]+)\%[,;]\s*([\d]+|[\d]*.[\d]+)\)/.exec(a))) {
			return [
				+Math.round(cache[1] * 2.55), +Math.round(cache[2] * 2.55), +Math.round(cache[3] * 2.55), +cache[4], 1
			];
		} else if ((cache = /^rgb\(([\d]+)[,;]\s*([\d]+)[,;]\s*([\d]+)\)/.exec(a))) {
			return [
				+cache[1], +cache[2], +cache[3], 1.0, 0
			];
		} else if ((cache = /^rgb\(([\d]+)\%[,;]\s*([\d]+)\%[,;]\s*([\d]+)\%\)/.exec(a))) {
			return [
				+Math.round(cache[1] * 2.55), +Math.round(cache[2] * 2.55), +Math.round(cache[3] * 2.55), 1.0, 0
			];
		} else if (a.charAt(0) === "#") {
			var sColor;
			if (a.length < 7) {
				// 3-digit hex color -> extend to 6-digit format
				sColor = a.substring(0, 2) + a.substring(1, 2) + a.substring(2, 3) + a.substring(2, 3) + a.substring(3, 4) + a.substring(3, 4);
			} else {
				sColor = a; // no extension needed
			}
			return [
				parseInt(sColor.substring(1, 3), 16), parseInt(sColor.substring(3, 5), 16), parseInt(sColor.substring(5, 7), 16), 1.0, 1
			];
		} else if ((cache = /^hsla\(([\d]+)[,]\s*([\d]+)\%[,]\s*([\d]+)\%[,]\s*([\d]+|[\d]*.[\d]+)\)/.exec(a))) {
			// hsla( 0-360, 0-100%, 0-100%, 0-1)
			cache = [
				+cache[1], +cache[2], +cache[3], +cache[4]
			];
			rgb = VBI.Utilities.HLS2RGB(cache[0] / 360.0, cache[2] / 100.0, cache[1] / 100.0); // Note: hsl -> HLS
			return [
				rgb[0], rgb[1], rgb[2], cache[3], 1
			];
		} else if ((cache = /^hsl\(([\d]+)[,]\s*([\d]+)\%[,]\s*([\d]+)\%\)/.exec(a))) {
			// hsl( 0-360, 0-100%, 0-100%)
			cache = [
				+cache[1], +cache[2], +cache[3]
			];
			rgb = VBI.Utilities.HLS2RGB(cache[0] / 360.0, cache[2] / 100.0, cache[1] / 100.0); // Note: hsl -> HLS
			return [
				rgb[0], rgb[1], rgb[2], 1.0, 0
			];
		} else
		// VBI internal color formats
		if ((cache = /^RGBA\(([\d]+)[,;]([\d]+)[,;]([\d]+)[,;]([\d]+|[\d]*.[\d]+)\)/.exec(a))) {
			return [
				+cache[1], +cache[2], +cache[3], parseFloat(+cache[4]) / 255.0, 1
			];
		} else if ((cache = /^RGB\(([\d]+)[,;]([\d]+)[,;]([\d]+)\)/.exec(a))) {
			return [
				+cache[1], +cache[2], +cache[3], 1.0, 0
			];
		} else if ((cache = /^ARGB\((0[xX][0-9A-Fa-f]+)[,;](0[xX][0-9A-Fa-f]+)[,;](0[xX][0-9A-Fa-f]+)[,;](0[xX][0-9A-Fa-f]+)\)/.exec(a))) {
			return [
				parseInt(cache[2], 16), parseInt(cache[3], 16), parseInt(cache[4], 16), parseFloat(+cache[1]) / 255.0, 1
			];
		} else if ((cache = /^ARGB\(([\d]+)[,;]([\d]+)[,;]([\d]+)[,;]([\d]+)\)/.exec(a))) {
			return [
				+cache[2], +cache[3], +cache[4], parseFloat(+cache[1]) / 255.0, 1
			];
		} else if ((cache = /^HLSA\(([\d]+)[,;]([\d]+)[,;]([\d]+)[,;]([\d]+)\)/.exec(a))) {
			// HLSA( 0-600, 0-600, 0-600, 0-255 )
			cache = [
				+cache[1], +cache[2], +cache[3], +cache[4]
			];
			rgb = VBI.Utilities.HLS2RGB(cache[0] / 600.0, cache[1] / 600.0, cache[2] / 600.0);
			return [
				rgb[0], rgb[1], rgb[2], cache[3] / 255, 1
			];
		} else if ((cache = /^HLS\(([\d]+)[,;]([\d]+)[,;]([\d]+)\)/.exec(a))) {
			// HLS( 0-600, 0-600, 0-600 )
			cache = [
				+cache[1], +cache[2], +cache[3]
			];
			rgb = VBI.Utilities.HLS2RGB(cache[0] / 600.0, cache[1] / 600.0, cache[2] / 600.0);
			return [
				rgb[0], rgb[1], rgb[2], 1.0, 0
			];
		}

		return [
			255, 0, 0, 1.0, 0 // failed to parse -> return RED color!
		];
	},

	string2color: function(a) {
		var rgba = this.string2rgba(a);
		return "rgba(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + "," + rgba[3] + ")";
	},

	string2rhls: function(a) {
		// input: RHLS(270;0.6;0.8)
		// input: RHLSA(270;0.6;0.8;0.5)

		// return vector items:
		// 0: hue shift in degrees/360 [0,1]
		// 1: saturation factor (float) [0,1]
		// 2: luminance factor (float) [0,1]
		// 3: alpha factor ( float ) [0,1]

		var cache;
		if ((cache = /^RHLS\(([\d]+|[\d]*.[\d]+)[,;]([\d]+|[\d]*.[\d]+)[,;]([\d]+|[\d]*.[\d]+)\)/.exec(a))) {
			return [
				parseFloat(+cache[1]) / 360.0, parseFloat(+cache[2]), parseFloat(+cache[3]), 1.0
			];
		} else if ((cache = /^RHLSA\(([\d]+|[\d]*.[\d]+)[,;]([\d]+|[\d]*.[\d]+)[,;]([\d]+|[\d]*.[\d]+)[,;]([\d]+|[\d]*.[\d]+)\)/.exec(a))) {
			return [
				parseFloat(+cache[1]) / 360.0, parseFloat(+cache[2]), parseFloat(+cache[3]), parseFloat(+cache[4])
			];
		}

		return null;
	},

	color2array: function(a) {
		// input rgba(128,128,128,1.0)
		// output [0.5,0.5,0.5,1.0] // red, green, blue, alpha

		var cache;
		if ((cache = /^rgba\(([\d]+)[,]([\d]+)[,]([\d]+)[,]([\d]+|[\d]*.[\d]+)\)/.exec(a))) {
			cache = [
				parseInt(+cache[1], 10), parseInt(+cache[2], 10), parseInt(+cache[3], 10), parseFloat(+cache[4])
			];
			return cache;
		}
		return null;
	},

	string2long: function(a) {
		if (typeof a == "boolean") {
			return a ? 1 : 0;
		}
		return parseInt(a, 10);
	},

	string2float: function(a) {
		if (typeof a == "boolean") {
			return a ? 1.0 : 0.0;
		}
		return parseFloat(a);
	},

	// ........................................................................//
	// to string conversions..................................................//

	float2string: function(a) {
		return a.toString();
	},

	vector2string: function(a) {
		// merge to a semicolon separated string...............................//
		var tmp = "";
		for (var nJ = 0; nJ < a.length; ++nJ) {
			tmp += a[nJ];
			if ((nJ + 1) < a.length) {
				tmp += ";";
			}
		}
		return tmp;
	},

	color2string: function(a) {
		var res;
		if ((res = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(a))) {
			res = [
				+res[1], +res[2], +res[3], parseInt(parseFloat(+res[4]) * 255.0, 10)
			];
			return "RGBA(" + res[0] + "," + res[1] + "," + res[2] + "," + res[3] + ")";
		}
		return null;
	},

	long2float: function(a) {
		return parseFloat(a, 10);
	},

	float2long: function(a) {
		return parseInt(a, 10);
	}
};

// ...........................................................................//
// data type provider........................................................//
// ...........................................................................//

VBI.DataTypeProvider = function() {
	var datatypeprovider = {};
	datatypeprovider.m_datatypenodes = [];
	datatypeprovider.vbiclass = "DataTypeProvider";

	// ........................................................................//
	// general purpose functions..............................................//

	datatypeprovider.isParentOf = function(oParent, oCurrent) {
		if (!oCurrent) {
			return false;
		}

		// check if oParent is a parent of oCurrent
		var tmp = oCurrent;
		while ((tmp = tmp.m_Parent)) {
			if (tmp == oParent) {
				return true;
			}
		}
		return false;
	};

	// ........................................................................//
	// interface functions....................................................//

	datatypeprovider.clear = function() {
		// clear the datatypeprovider..........................................//
		var o, nCount = this.m_datatypenodes.length;
		for (var nJ = 0; nJ < nCount; ++nJ) {
			if ((o = this.m_datatypenodes[nJ])) {
				o.clear();
			}
		}

		this.m_datatypenodes = []; // reset array
	};

	datatypeprovider.set = function(dat, ctx) {
		if (dat.type && dat.name) {
			/*
			 * TO DO:
			 * Set multiple types.
			 */
			if ((dat.type == "N")) {
				if (jQuery.type(dat.N) == 'object') {
					var destnode;
					if ((destnode = datatypeprovider.GetTypeNode(dat.name, true))) {
						destnode.load(dat.N);
						return;
					}
				} // else if (jQuery.type(dat.N) == 'array') {
				// set a node type............................................//
				/*
				 * TO DO:
				 * Set multiple nodes explicitily.
				 */
			}
		} else {
			// data type context should be set completely.......................//
			this.clear();
		}

		var dtn;
		if (jQuery.type(dat.N) == 'object') {
			this.m_datatypenodes.push(dtn = new VBI.DataTypeProvider.DataTypeNode(this, this.m_datatypenodes.length));

			if (dat.name) {
				dtn.m_Name = dat.name;
			}
			if (dat.N.key) {
				dtn.m_Key = dat.N.key;
			}

			// load subsequent data.......................................//
			dtn.load(dat.N);
		} else if (jQuery.type(dat.N) == 'array') {
			// load from array
			for (var i = 0, len = dat.N.length; i < len; ++i) {
				this.m_datatypenodes.push(dtn = new VBI.DataTypeProvider.DataTypeNode(this, this.m_datatypenodes.length));

				if (dat.N[i].name) {
					dtn.m_Name = dat.N[i].name;
				}
				if (dat.N[i].key) {
					dtn.m_Key = dat.N[i].key;
				}

				// load subsequent data.......................................//
				dtn.load(dat.N[i]);
			}
		}
	};

	datatypeprovider.load = function(dat, ctx) {
		// remove data first...................................................//
		// due sequence is not determined in our json, the sequence is always..//
		// remove then set, this can be different in the xml implementation....//
		// because the sequence is specified there.............................//

		// load the json delta data............................................//
		if (dat.Set) {
			if (jQuery.type(dat.Set) == 'object') {
				datatypeprovider.set(dat.Set, ctx);
			} else if (jQuery.type(dat.Set) == 'array') {
				for (var i = 0, len = dat.Set.length; i < len; ++i) {
					datatypeprovider.set(dat.Set[i], ctx);
				}
			}
		}
	};

	datatypeprovider.GetTypeNode = function(name, bcreate) {
		// get the type node...................................................//
		// when not available, create it.......................................//
		for (var i = 0; i < this.m_datatypenodes.length; ++i) {
			if (this.m_datatypenodes[i].m_Name == name) {
				return this.m_datatypenodes[i];
			}
		}

		// not found, create it................................................//
		if (!bcreate) {
			return null;
		}

		var node;
		// it is important that the new index is provided......................//
		this.m_datatypenodes.push(node = new VBI.DataTypeProvider.DataTypeNode(null, this.m_datatypenodes.length));
		node.m_Name = name;

		return node;
	};

	datatypeprovider.FindTypeRefs = function() {
		var aRef = [];
		// find the mapping reference..........................................//
		for (var i = 0, len = this.m_datatypenodes.length; i < len; ++i) {
			var ref = this.m_datatypenodes[i].m_Ref;
			if (ref) {
				aRef.push({
					m_Ref: ref,
					m_DTN: this.m_datatypenodes[i]
				});
			}
		}
		return aRef;
	};

	datatypeprovider.FindTypeNodeFromPath = function(path) {
		var nodeTemp, node = this.GetTypeNode(path[0], false); // find node but do not create
		for (var nJ = 1; nJ < path.length; ++nJ) {
			if (!(nodeTemp = node.GetTypeNode(path[nJ], false))) {
				continue;
			}

			node = nodeTemp;
		}

		return node;
	};

	datatypeprovider.FindTypeAttributeFromPath = function(path) {
		var ntPath = [];
		for (var nJ = 0; nJ < (path.length - 1); ++nJ) {
			ntPath.push(path[nJ]);
		}

		var nt = this.FindTypeNodeFromPath(ntPath); // find the nodetype
		return nt ? nt.GetTypeAttribute(path[path.length - 1]) : null; // find the attribute on the nodetype
	};

	// ........................................................................//
	// data type node.........................................................//

	VBI.DataTypeProvider.DataTypeNode = function(parent, arrayindex) {
		var datatypenode = {};
		datatypenode.m_datatypenodes = []; // a node can have other nodes or
		datatypenode.m_datatypeattributes = []; // attributes
		datatypenode.m_nArrayIndex = arrayindex; // node index inside parents container

		// a data node contains elements.......................................//
		datatypenode.m_Name = "";
		datatypenode.m_Key = null;
		datatypenode.m_Ref = null;
		datatypenode.m_Parent = parent;

		// selection types.....................................................//
		datatypenode.m_MinSelect = 1;
		datatypenode.m_MaxSelect = 1;

		// ( 0, 0 ) no selection at all will be done........................//
		// ( 0,-1 ) any number of elements can be selected, select state of elements is used, lead selection represents last positive selection
		// ( 1, 1 ) exactly one element is selected->lead selection is used and element selection is set accordingly
		// ( 1, -1) at least one element must be selected, any number of elements can be selected->lead selection can be used and can be empty

		datatypenode.clear = function() {
			var o, nJ, nCount;

			// clear inner data.................................................//
			datatypenode.m_Parent = null;

			// clear the nodes..................................................//
			nCount = datatypenode.m_datatypenodes.length;
			for (nJ = 0; nJ < nCount; ++nJ) {
				if ((o = datatypenode.m_datatypenodes[nJ])) {
					o.clear();
				}
			}
			datatypenode.m_datatypenodes = [];

			// clear the attributes.............................................//
			nCount = datatypenode.m_datatypeattributes.length;
			for (nJ = 0; nJ < nCount; ++nJ) {
				if ((o = datatypenode.m_datatypeattributes[nJ])) {
					o.clear();
				}
			}
			datatypenode.m_datatypeattributes = [];
		};

		datatypenode.load = function(dat) {
			// load data type nodes attributes..................................//
			if (dat.name) {
				datatypenode.m_Name = dat.name;
			}
			if (dat.key) {
				datatypenode.m_Key = dat.key;
			}
			if (dat.ref) {
				datatypenode.m_Ref = dat.ref;
			}
			if (dat.minSel) {
				datatypenode.m_MinSelect = parseInt(dat.minSel, 10);
			}
			if (dat.maxSel) {
				datatypenode.m_MaxSelect = parseInt(dat.maxSel, 10);
			}

			// load the attributes..............................................//
			var i;
			if (dat.A) {
				var ta;
				if (jQuery.type(dat.A) == 'array') {
					for (i = 0; i < dat.A.length; ++i) {
						// create only when not yet in.............................//
						ta = datatypenode.GetTypeAttribute(dat.A[i].name, true);
						// load subsequent data....................................//
						ta.load(dat.A[i]);
					}
				} else if (jQuery.type(dat.A) == 'object') {
					// create only when not yet in................................//
					ta = datatypenode.GetTypeAttribute(dat.A.name, true);
					// load subsequent data.......................................//
					ta.load(dat.A);
				}
			}

			// load subsequent nodes............................................//
			if (dat.N) {
				var tn;
				if (jQuery.type(dat.N) == 'array') {
					for (i = 0; i < dat.N.length; ++i) {
						datatypenode.m_datatypenodes.push(tn = new VBI.DataTypeProvider.DataTypeNode(this, datatypenode.m_datatypenodes.length));

						// load subsequent data....................................//
						tn.load(dat.N[i]);
					}
				} else if (jQuery.type(dat.N) == 'object') {
					datatypenode.m_datatypenodes.push(tn = new VBI.DataTypeProvider.DataTypeNode(this, datatypenode.m_datatypenodes.length));

					// load subsequent data.......................................//
					tn.load(dat.N);
				}
			}
		}; // end of load()

		datatypenode.GetTypeNode = function(name, bcreate) {
			// get the type node................................................//
			// when not available, create it....................................//
			var adtn = datatypenode.m_datatypenodes;
			for (var i = 0, len = adtn.length; i < len; ++i) {
				if (adtn[i].m_Name == name) {
					return adtn[i];
				}
			}

			// not found, create it.............................................//
			if (!bcreate) {
				return null;
			}

			var node;
			adtn.push(node = new VBI.DataTypeProvider.DataTypeNode(this, adtn.length));
			node.m_Name = name;

			return node;
		}; // end of GetTypeNode()

		datatypenode.GetKeyTypeAttribute = function() {
			// always create the key type attribute when not yet in.............//
			if (datatypenode.m_Key) {
				return datatypenode.GetTypeAttribute(datatypenode.m_Key, true);
			} else {
				return datatypenode.GetTypeAttribute("VB:ix", true);
			}
			return null;
		}; // end of GetKeyTypeAttribute()

		datatypenode.GetSelectTypeAttribute = function(bCreate) {
			return datatypenode.GetTypeAttribute("VB:s", bCreate);
		}; // end of GetSelectTypeAttribute()

		datatypenode.GetPath = function() {
			var names = [];
			var node = this; // eslint-disable-line consistent-this
			do {
				names.splice(0, 0, node.m_Name);
			} while ((node = node.m_Parent) && node['m_Name']);

			return names;
		};

		datatypenode.GetTypeAttribute = function(name, bCreate) {
			// get the type node................................................//
			// when not available, create it....................................//
			var adta = datatypenode.m_datatypeattributes;
			for (var i = 0, len = adta.length; i < len; ++i) {
				var dta = adta[i];
				// check for alias or name.......................................//
				if (dta.m_Alias == name || dta.m_Name == name) {
					return dta;
				}
			}

			if (bCreate) {
				// not found, create it and put in into the array................//
				var attribute;
				adta.push(attribute = new VBI.DataTypeProvider.DataTypeAttribute(adta.length));
				attribute.m_Name = name;
				attribute.m_Parent = this;

				// some attribute will be interpreted with a specific type.......//
				// when not set in datatypes.....................................//
				attribute.m_Type = (name == "VB:s") ? VBI.Types.st_bool : VBI.Types.st_string;

				return attribute;
			}

			return null;
		}; // end of GetTypeAttribute()

		return datatypenode;
	};

	VBI.DataTypeProvider.DataTypeAttribute = function(arrayindex) {
		var datatypeattribute = {};

		// a data type attribute may contain nodes.............................//
		datatypeattribute.m_Name = "";
		datatypeattribute.m_Alias = "";
		datatypeattribute.m_bChangeable = false; // by default attributes are !not! changeable
		datatypeattribute.m_Type = VBI.Types.st_unknown; // build in type
		datatypeattribute.m_nArrayIndex = arrayindex; // index where the attribute is located
		datatypeattribute.m_Parent = null;

		datatypeattribute.clear = function() {
			datatypeattribute.m_Parent = null; // reset the parent object
		};

		datatypeattribute.load = function(dat) {
			// load data type attributes values.................................//
			if (dat.name) {
				datatypeattribute.m_Name = dat.name;
			}
			if (dat.alias) {
				datatypeattribute.m_Alias = dat.alias;
			}
			if (dat.changeable) {
				datatypeattribute.m_bChangeable = VBI.Types.string2bool(dat.changeable);
			}

			if (dat.type) {
				switch (dat.type) {
					case "vectorarraymulti":
						datatypeattribute.m_Type = VBI.Types.st_vectorarraymulti;
						break;
					case "vectorarray":
						datatypeattribute.m_Type = VBI.Types.st_vectorarray;
						break;
					case "vector":
						datatypeattribute.m_Type = VBI.Types.st_vector;
						break;
					case "long":
						datatypeattribute.m_Type = VBI.Types.st_long;
						break;
					case "string":
						datatypeattribute.m_Type = VBI.Types.st_string;
						break;
					case "color":
						datatypeattribute.m_Type = VBI.Types.st_color;
						break;
					case "boolean":
						datatypeattribute.m_Type = VBI.Types.st_bool;
						break;
					case "float":
						datatypeattribute.m_Type = VBI.Types.st_float;
						break;
					default:
						// unknown type, set to string.............................//
						datatypeattribute.m_Type = VBI.Types.st_string;
						break;
				}
			}
		};

		return datatypeattribute;
	};

	return datatypeprovider;
};

// ...........................................................................//
// data provider.............................................................//
// ...........................................................................//

VBI.DataProvider = function() {
	var dataprovider = {};

	// node, element, attribute
	var N = 0, E = 1, A = 2;

	dataprovider.vbiclass = "DataProvider";
	dataprovider.m_datanodes = [];
	dataprovider.m_dtp = null;
	dataprovider.m_Ctx = null;

	// ........................................................................//
	// dataprovider methods...................................................//

	dataprovider.clear = function() {
		// clear the datatypeprovider..........................................//
		var o, nCount = dataprovider.m_datanodes.length;
		for (var nJ = 0; nJ < nCount; ++nJ) {
			if ((o = dataprovider.m_datanodes[nJ])) {
				o.clear();
			}
		}

		// reset array
		dataprovider.m_datanodes = [];
		dataprovider.m_Ctx = null;
		dataprovider.m_dtp = null;
	};

	dataprovider.set = function(dat, ctx) {
		// the 'dat' should be now always an set object........................//

		// get the dataprovider from the context...............................//
		var dtp = ctx.m_DataTypeProvider;

		if (!dtp) {
			jQuery.sap.log.error("Data types are not available");
			return;
		}

		if (dat.type && dat.name) {
			if ((dat.type == "N")) {
				if (jQuery.type(dat.N) == 'object') { // set a node type............................................//
					var destnode;
					var path = dat.name.split(".");
					if ((destnode = this.FindNodeFromPath(path))) {
						if (dat.name != dat.N.name) {
							jQuery.sap.log.error("Node loading delta operation failed");
							return;
						}
						destnode.load(dat.N, dtp.FindTypeNodeFromPath(path));
						return;
					}
				} // else if (jQuery.type(dat.N) == 'array') {
				// set a node type............................................//
				/*
				 * TO DO:
				 * Set multiple nodes explicitly.
				 */
				// }
			} // else if ((dat.type == "E")) { }
			/*
			 * TO DO:
			 * do delta handling for elements
			 */
		} else {
			// data context should be set.......................................//
			this.clear();
		}

		if (dat.N) {
			var dtn, node, name;
			if (jQuery.type(dat.N) == 'object') {
				// ensure that node is in type section
				dtn = dtp.GetTypeNode(name = dat.N.name, true);
				this.m_datanodes[dtn.m_nArrayIndex] = (node = new VBI.DataProvider.DataNode());
				node.m_Parent = this;
				node.m_Name = name;

				// load subsequent data..........................................//
				node.load(dat.N, dtn);
			} else if (jQuery.type(dat.N) == 'array') {
				for (var i = 0; i < dat.N.length; ++i) {
					// ensure that node is in type section
					dtn = dtp.GetTypeNode(name = dat.N[i].name, true);
					this.m_datanodes[dtn.m_nArrayIndex] = (node = new VBI.DataProvider.DataNode());
					node.m_Parent = this;
					node.m_Name = name;

					// load subsequent data.......................................//
					node.load(dat.N[i], dtn);
				}
			}
		}
	};

	dataprovider.remove = function(inst, ctx) {
		// remove node.........................................................//
		var destnode, name;
		if (inst.type == "N" && (name = inst.name)) {
			if ((destnode = this.FindNodeFromPath(name.split(".")))) {
				// remove just the one node......................................//
				destnode.m_Parent.RemoveNode(destnode);
			}
		} else if (inst.type == "E" && (name = inst.name)) {
			if ((destnode = this.FindNodeFromPath(name.split(".")))) {
				// all the elements specified in the node should be..............//
				// removed.......................................................//
				destnode.RemoveElements(inst.N);
			}
		}
	};

	dataprovider.load = function(dat, ctx) { // load data in the dataprovider

		// get the dataprovider from the context...............................//
		var dtp = ctx.m_DataTypeProvider;

		// delta handling......................................................//
		// first execute the remove command....................................//
		if (dat.Remove) {
			if (jQuery.type(dat.Remove) == 'object') {
				this.remove(dat.Remove, ctx);
			} else if (jQuery.type(dat.Remove) == 'array') {
				// remove a set of objects.......................................//
				for (var nJ = 0, len = dat.Remove.length; nJ < len; ++nJ) {
					this.remove(dat.Remove[nJ], ctx);
				}
			}
		}

		// after the remove the set is executed................................//
		// load the json delta data............................................//
		if (dat.Set) {
			if (jQuery.type(dat.Set) == 'object') {
				dataprovider.set(dat.Set, ctx);
			} else if (jQuery.type(dat.Set) == 'array') {
				for (var i = 0; i < dat.Set.length; ++i) {
					dataprovider.set(dat.Set[i], ctx);
				}
			}
		}

		// store the datatypeprovider..........................................//
		dataprovider.m_dtp = dtp; // store datatypeprovider reference
		dataprovider.m_Ctx = ctx; // store context reference
	};

	dataprovider.store = function(dat) {
		if (this.IsModified()) {
			// check if dataprovider is modified
			dat.Data = {};
			dat.Data.Merge = {};
			var nodes = dat.Data.Merge.N = [];

			// the dataprovider is modofoed when one of its nodes is modified...//
			var tmp;
			for (var nJ = 0; nJ < this.m_datanodes.length; ++nJ) {
				if ((tmp = this.m_datanodes[nJ]) && tmp.IsModified()) {
					// create a node object and push..............................//
					var node = {};
					nodes.push(node);

					// call storing of nodes......................................//
					tmp.store(node);
				}
			}
		}
	};

	// ........................................................................//
	// dataprovider events....................................................//

	dataprovider.OnAttributeChanged = function(attrib) {
		// check for subscribed action and fire event..........................//
		var actions;
		if ((actions = dataprovider.m_Ctx.m_Actions)) {
			var action;
			if ((action = actions.findAction("AttributeChanged", null, null))) {
				var inst = attrib.m_Parent.GetPath() + "." + attrib.m_dta.m_Name;
				dataprovider.m_Ctx.FireAction(action, null, null, null, null, inst);
			}
		}
	};

	dataprovider.OnNodeChanged = function(node) {
		// check for subscribed action and fire event.......................//
		var actions;
		if ((actions = dataprovider.m_Ctx.m_Actions)) {
			var action;
			if ((action = actions.findAction("NodeChanged", null, null))) {
				var path = null;
				if (node.m_Parent && node.m_Parent.GetPath) {
					path = node.m_Parent.GetPath() + ".";
				} else {
					path = "";
				}
				dataprovider.m_Ctx.FireAction(action, null, null, null, null, path + node.m_dtn.m_Name);
			}
		}
	};

	dataprovider.OnElementChanged = function(element) {
		// check for subscribed action and fire event.......................//
		var actions;
		if ((actions = dataprovider.m_Ctx.m_Actions)) {
			var action;
			if ((action = actions.findAction("ElementChanged", null, null))) {
				dataprovider.m_Ctx.FireAction(action, null, null, null, null, element.GetPath());
			}
		}
	};

	// determine if something in the datacontext is modified and needs to be..//
	// serialized.............................................................//
	dataprovider.IsModified = function() {
		// the dataprovider is modofoed when one of its nodes is modified......//
		var tmp;
		for (var nJ = 0; nJ < this.m_datanodes.length; ++nJ) {
			if ((tmp = this.m_datanodes[nJ]) && tmp.IsModified()) {
				return true;
			}
		}
		return false;
	};

	dataprovider.RemoveNode = function(node) {
		var aix = node.m_dtn.m_nArrayIndex;
		this.m_datanodes[aix].clear();
		this.m_datanodes[aix] = null; // set the node to a null
	};

	// ........................................................................//
	// finding different kind of data.........................................//

	dataprovider.FindFromPathEx = function(parts, sidx, type, ele, node) {
		// when element is set, start pasing with element, else start with.....//
		// node parsing........................................................//

		var bParseElement = false, curNodeType = null, curElement = null, curNode = null;

		// get the start parameters............................................//
		if (node) {
			bParseElement = true;
			curNode = node;
			curNodeType = node.m_dtn;
		} else if (ele) {
			// set start parameters.............................................//
			curElement = ele;
			curNodeType = ele.m_Parent.m_dtn;
		}

		for (var nJ = sidx, len = parts.length; nJ < len; ++nJ) {
			if (bParseElement) {
				if (curNodeType.m_Key) {
					// expect element specified as a key..........................//
					if ((curElement = curNode.FindElementByKey(parts[nJ]))) {
						bParseElement = false;
						continue; // element parsed
					}
				} else if (VBI.isInt(parts[nJ])) {
					// element specified as an index..............................//
					curElement = curNode.m_dataelements[parseInt(parts[nJ], 10)];
					bParseElement = false; // element parsed
					continue;
				} else {
					// no element specified, so we use the first one .............//
					if (curNode.m_dataelements.length) {
						curElement = curNode.m_dataelements[0];
					}
					if (!curElement) {
						VBI.m_bTrace && VBI.Trace("Error: invalid lead selected element");
					}
				}
			}

			// check if we have to parse for the attribute......................//
			if (type == A && (nJ + 1) == len) {
				var ta;
				if ((ta = curNodeType.GetTypeAttribute(parts[nJ], false))) {
					if (curElement) {
						return curElement.m_dataattributes[ta.m_nArrayIndex];
					} else {
						// no element specified, so we use the first one .............//
						if (curNode.m_dataelements.length) {
							curElement = curNode.m_dataelements[0];
							return curElement.m_dataattributes[ta.m_nArrayIndex];
						}
					}
				}
			}

			// get the node type information....................................//
			curNodeType = curNodeType.GetTypeNode(parts[nJ], true);
			if (!curElement) {
				VBI.m_bTrace && VBI.Trace("Error: Invalid Binding Path " + parts);
				return false;
			}

			curNode = curElement.m_datanodes[curNodeType.m_nArrayIndex];

			// next is an element that should be parsed..........................//
			bParseElement = true;
		}

		if (type == A || type == E) {
			return null; // nothing found
		}
		return curNode; // node found
	};

	dataprovider.FindFromPath = function(parts, type) {
		if (!dataprovider.m_dtp) {
			return null; // no datatypes specified.........................//
		}

		// get the first node from the dataprovider............................//
		// provide it to the extended function to do continuous searching......//
		var curNodeType = dataprovider.m_dtp.GetTypeNode(parts[0], false);
		if (!curNodeType) {
			return null; // invalid binding path to type
		}
		var curNode = dataprovider.m_datanodes[curNodeType.m_nArrayIndex];
		if (!curNode) {
			return null; // invalid binding path to value
		}

		return dataprovider.FindFromPathEx(parts, 1, type, null, curNode);
	};

	dataprovider.FindAttributeFromPath = function(parts) {
		return dataprovider.FindFromPath(parts, A);
	};

	dataprovider.FindNodeFromPath = function(parts) {
		return dataprovider.FindFromPath(parts, N);
	};

	// global selection, all tables are affecte...............................//
	dataprovider.SetSelection = function(bSelect, bCheckCardinality) {
		var tmp, aNodes = dataprovider.m_datanodes;
		for (var nJ = 0, len = aNodes.length; nJ < len; ++nJ) {
			if ((tmp = aNodes[nJ])) {
				tmp.SetSelection(bSelect, bCheckCardinality);
			}
		}
	};

	VBI.DataProvider.DataNode = function() {
		var datanode = {};

		// a datanode contains elements........................................//
		datanode.m_Name = "";
		datanode.m_dataelements = [];
		datanode.m_Parent = null; // parent of the datanode
		datanode.m_dtn = null; // typeinfo for node
		datanode.m_bModified = false; // modified flag, usually selection

		datanode.clear = function() {
			// reset type information...........................................//
			datanode.m_dtn = null;

			// clear the elements...............................................//
			for (var nJ = 0; nJ < datanode.m_dataelements.length; ++nJ) {
				datanode.m_dataelements[nJ].clear();
				datanode.m_dataelements[nJ].m_Parent = null;
			}

			// clear the array..................................................//
			datanode.m_dataelements = [];
			datanode.m_Parent = null;
		};

		datanode.IsModifiedSelection = function() {
			return datanode.m_bModified ? true : false;
		};

		datanode.IsModifiedElements = function() {
			// the dataprovider is modofoed when one of its nodes is modified...//
			var aElements = datanode.m_dataelements;
			for (var nJ = 0; nJ < aElements.length; ++nJ) {
				if (aElements[nJ].IsModified()) {
					return true;
				}
			}
			return false;
		};

		datanode.IsModified = function() {
			// either datanode is modified or elements are modified.............//
			if (datanode.IsModifiedSelection() || datanode.IsModifiedElements()) {
				return true;
			}

			return false;
		};

		datanode.store = function(dat) {
			// store the node itself............................................//
			dat.name = datanode.m_dtn.m_Name; // set node name...............//

			// store the modified elements......................................//
			if (datanode.IsModifiedElements()) {
				dat.E = [];

				for (var nJ = 0; nJ < datanode.m_dataelements.length; ++nJ) {
					// store only modified elements...............................//
					if (datanode.m_dataelements[nJ].IsModified()) {
						// create the element object push it and call its store....//
						var ele = {};
						dat.E.push(ele);
						datanode.m_dataelements[nJ].store(ele);
					}
				}
			}
		};

		// .....................................................................//
		// node removers.......................................................//

		datanode.RemoveNode = function(node) {
			var aix = node.m_dtn.m_nArrayIndex;
			datanode.m_datanodes[aix].clear();
			datanode.m_datanodes[aix] = null; // set the node to a null
		};

		datanode.RemoveElements = function(dat) {
			// remove the elements specified in the node........................//
			// create a temporary keymap........................................//
			var kta = datanode.m_dtn.GetKeyTypeAttribute();
			var keymap = datanode.GetElementKeyMap(kta);

			// load the elements................................................//
			if (dat.E) {
				if (jQuery.type(dat.E) == 'object') {
					// find the element and remove it............................//
					datanode.InternalFindAndRemoveExistingElement(dat.E, 0, kta, keymap);
				} else if (jQuery.type(dat.E) == 'array') {
					for (var i = 0; i < dat.E.length; ++i) {
						datanode.InternalFindAndRemoveExistingElement(dat.E[i], i, kta, keymap);
					}
				}
			}
		};

		// .....................................................................//
		// element finders.....................................................//

		datanode.GetElementKeyMap = function(kta) {
			// create an element keymap.........................................//
			var tmp, keymap = [];
			var ktattribute = kta ? kta : datanode.m_dtn.GetKeyTypeAttribute();

			for (var nJ = 0; nJ < datanode.m_dataelements.length; ++nJ) {
				keymap[(tmp = datanode.m_dataelements[nJ]).m_dataattributes[ktattribute.m_nArrayIndex].m_Value] = tmp;
			}

			return keymap;
		};

		datanode.FindElementByKey = function(key, kta, keymap) {
			// use the provided map.............................................//
			var tmp;
			if (keymap) {
				return (tmp = keymap[key]) ? tmp : null;
			}

			// do sequential search.............................................//
			var ktattribute = kta ? kta : datanode.m_dtn.GetKeyTypeAttribute();

			var ele, aElements = this.m_dataelements;
			for (var nJ = 0, len = aElements.length; nJ < len; ++nJ) {
				if ((ele = aElements[nJ])) {
					if (ele.m_dataattributes[ktattribute.m_nArrayIndex].m_Value == key) {
						return ele;
					}
				}
			}
			return null;
		};

		datanode.FindElementByIndex = function(index) {
			return this.m_dataelements[index];
		};

		datanode.InternalFindAndRemoveExistingElement = function(dat, idx, kta, keymap) {
			var key = null, ele = null;
			if (kta.m_Alias && (key = dat[kta.m_Alias])) {
				ele = this.FindElementByKey(key, kta, keymap);
			} else if (kta.m_Name && (key = dat[kta.m_Name])) {
				ele = this.FindElementByKey(key, kta, keymap);
			} else {
				ele = this.FindElementByKey(key = idx, kta, keymap);
			}

			if (ele) {
				// remove the element from the array.............................//
				this.m_dataelements.splice(VBI.IndexOf(this.m_dataelements, ele), 1);

				// correct the key map...........................................//
				if (keymap) {
					keymap.splice(key, 1);
				}

				// clear the element.............................................//
				ele.clear();
			}
		};

		datanode.InternalFindOrCreateExistingElement = function(dat, idx, kta, keymap) {
			var key = null, ele = null;
			if (kta.m_Alias && (key = dat[kta.m_Alias])) {
				ele = datanode.FindElementByKey(key, kta, keymap);
			} else if (kta.m_Name && (key = dat[kta.m_Name])) {
				ele = datanode.FindElementByKey(key, kta, keymap);
			} else {
				ele = datanode.FindElementByKey(key = idx, kta, keymap);
			}

			if (ele) {
				return ele; // return the found element.......................//
			}

			// create the new element...........................................//
			ele = new VBI.DataProvider.DataElement();

			// push the element to the array....................................//
			datanode.m_dataelements.push(ele);

			// add the element to the keymap....................................//
			if (keymap) {
				keymap[key] = ele;
			}

			return ele;
		};

		datanode.load = function(dat, dtn) {
			datanode.m_dtn = dtn; // store type info for node.................//

			// create a temporary keymap........................................//
			var kta = datanode.m_dtn.GetKeyTypeAttribute();
			var keymap = datanode.GetElementKeyMap(kta);

			// load the elements................................................//
			if (dat.E) {
				var da, de;
				if (jQuery.type(dat.E) == 'object') {
					/*
					 * TO DO:
					 * Load element when it is submitted as single object.
					 */
					de = datanode.InternalFindOrCreateExistingElement(dat.E, 0, kta, keymap);
					de.m_Parent = datanode;

					// load subsequent data.......................................//
					de.load(dat.E, dtn);

					// ensure that the index attribute is available...............//
					// when not available, create it now..........................//
					if (de.m_dataattributes[kta.m_nArrayIndex] == null) {
						da = new VBI.DataProvider.DataAttribute(kta, null, de);
						da.m_Value = 0;
						de.m_dataattributes[kta.m_nArrayIndex] = da;
					}
				} else if (jQuery.type(dat.E) == 'array') {
					for (var i = 0, len = dat.E.length; i < len; ++i) {
						de = datanode.InternalFindOrCreateExistingElement(dat.E[i], i, kta, keymap);
						de.m_Parent = datanode;

						// load subsequent data....................................//
						de.load(dat.E[i], dtn);

						// ensure that the index attribute is available............//
						// when not available, create it now.......................//
						if (de.m_dataattributes[kta.m_nArrayIndex] == null) {
							da = new VBI.DataProvider.DataAttribute(kta, null, de);
							da.m_Value = i;
							de.m_dataattributes[kta.m_nArrayIndex] = da;
						}
					}
				}
			}
		};

		datanode.GetName = function() {
			/*
			 * TO DO:
			 * we can use the type for storing the name
			 */
			return this.m_Name;
		};

		datanode.GetPath = function() {
			return this.m_dtn.GetPath();
		};

		datanode.SetModified = function() {
			this.m_bModified = true; // set modified flag..................//

			var p = this; // eslint-disable-line consistent-this
			while (p.m_Parent) {
				p = p.m_Parent;
			}
			// raise the node changed event.....................................//
			if (p) {
				p.OnNodeChanged(this);
			}
		};

		datanode.GetSelectedElements = function() {
			var aSelElements = [];

			// get all selected elements, this includes the lead selected.......//
			// element..........................................................//

			var aElements = this.m_dataelements;
			var kta = this.m_dtn.GetTypeAttribute("VB:s", true);

			// set the selection state for all the elements.....................//
			for (var nJ = 0, len = aElements.length; nJ < len; ++nJ) {
				if (aElements[nJ].IsSelected(kta)) {
					aSelElements.push(aElements[nJ]);
				}
			}

			return aSelElements;
		};

		datanode.GetNumOfSelectedElements = function() {
			return (datanode.m_NumSelectedEltes != undefined) ? datanode.m_NumSelectedEltes : datanode.GetSelectedElements().length;
		};

		datanode.SetNumOfSelectedElements = function() {
			datanode.m_NumSelectedEltes = datanode.GetSelectedElements().length;
		};

		datanode.UnSetNumOfSelectedElements = function() {
			datanode.m_NumSelectedEltes = undefined;
		};

		datanode.SetSelection = function(bSelect, bCheckCardinality) {
			// set the selection state for all elements to the same value.......//
			// when the cardinality flag is set, it is used to keep state.......//
			// consistent.......................................................//
			var aElements = this.m_dataelements;
			var tmp = null, kta = this.m_dtn.GetTypeAttribute("VB:s", true);
			if (!bSelect && bCheckCardinality) {
				this.SetNumOfSelectedElements();
			}

			// set the selection state for all the elements.....................//
			for (var nJ = 0, len = aElements.length; nJ < len; ++nJ) {
				if ((tmp = aElements[nJ])) {
					if (bCheckCardinality) {
						tmp.Select(bSelect);
					} else {
						tmp.SetElementSelectionState(bSelect, kta);
					}
				}
			}
			this.UnSetNumOfSelectedElements();
			return null;
		};

		return datanode;
	};

	// ........................................................................//
	// DataElement............................................................//

	VBI.DataProvider.DataElement = function() {
		// a dataelement contains attributes or subsequent nodes...............//
		this.m_dataattributes = [];
		this.m_datanodes = [];
		this.m_Parent = null; // the parent should be always a node.......//
		this.m_bChangeable = false;// by default an element is not changeable..//
	};

	VBI.DataProvider.DataElement.prototype = {
		// a dataelement contains attributes or subsequent nodes...............//
		m_dataattributes: null,
		m_datanodes: null,
		m_Parent: null, // the parent should be always a node.//
		m_nModified: 0, // 0: nothing, 1: selection, 2: chanageableflag VB:c, 4: modifiedflag VB:m
		m_bChangeable: false, // the data element is not changeable.//

		clear: function() {
			// clear the nodes..................................................//
			var nJ, tmp;
			for (nJ = 0; nJ < this.m_datanodes.length; ++nJ) {
				if ((tmp = this.m_datanodes[nJ])) {
					tmp.clear();
					tmp.m_Parent = null;
				}
			}
			this.m_datanodes = [];

			// clear the attributes.............................................//
			for (nJ = 0; nJ < this.m_dataattributes.length; ++nJ) {
				if ((tmp = this.m_dataattributes[nJ])) {
					tmp.clear();
					tmp.m_Parent = null;
				}
			}

			this.m_dataattributes = [];
		},

		load: function(dat, dtn) {
			var bModified = false;
			this.m_nModified = 0;

			// get and remove the the elements modified flag....................//
			if (dat["VB:m"]) {
				// set both flags to modified, that the flags get submitted......//
				// in the next submit event......................................//
				if ((bModified = VBI.Types.string2bool(dat["VB:m"]))) {
					this.m_nModified = 7;
				}

				delete dat["VB:m"];
			}
			// get and remove the the elements changeable flag..................//
			if (dat["VB:c"]) {
				this.m_bChangeable = VBI.Types.string2bool(dat["VB:c"]);
				delete dat["VB:c"];
			}

			// add the attributes and put them into an array....................//
			for ( var a in dat) {
				if (!dat.hasOwnProperty(a)) {
					continue;
				}

				if (a == "N" && !(typeof dat[a] == 'string')) {
					var ldtn, node;
					if (jQuery.type(dat[a]) == 'object') {
						// this is interpreted as a node...........................//

						// determine the datatype node for the inner node..........//
						ldtn = dtn.GetTypeNode(dat.N.name, true);

						// place the node at its indexed position..................//
						this.m_datanodes[ldtn.m_nArrayIndex] = (node = new VBI.DataProvider.DataNode());
						node.m_Parent = this;
						node.m_Name = dat.N.name;

						node.load(dat[a], ldtn);
					} else if (jQuery.type(dat[a]) == 'array') {
						// this is interpreted as an array of nodes................//
						var na = dat[a];
						for (var nJ = 0; nJ < na.length; ++nJ) {
							var ndo = na[nJ];

							// determine the datatype node for the inner node.......//
							ldtn = dtn.GetTypeNode(ndo.name, true);

							// place the node at its indexed position...............//
							this.m_datanodes[ldtn.m_nArrayIndex] = (node = new VBI.DataProvider.DataNode());
							node.m_Parent = this;
							node.m_Name = ndo.name;

							node.load(ndo, ldtn);
						}
					}
				} else {
					// this is interpreted as an attribute........................//

					// determine the datatype attribute...........................//
					var dta = dtn.GetTypeAttribute(a, true);

					// place the attribute at the indexed position................//
					this.m_dataattributes[dta.m_nArrayIndex] = new VBI.DataProvider.DataAttribute(dta, dat[a], this, bModified);

				}
			}
		},

		IsModified: function(dat) {
			// when anything is modified return immediately.....................//
			if (this.m_nModified) {
				return true;
			}

			// check if there are attributes that are modified..................//
			var nJ, len, tmp;
			for (nJ = 0, len = this.m_dataattributes.length; nJ < len; ++nJ) {
				if ((tmp = this.m_dataattributes[nJ]) && tmp.IsModified()) {
					return true;
				}
			}

			// check if subnodes have changed...................................//
			for (nJ = 0, len = this.m_datanodes.length; nJ < len; ++nJ) {
				if ((tmp = this.m_datanodes[nJ]) && tmp.IsModified()) {
					return true;
				}
			}

			return false;
		},

		IsChangeable: function() {
			// just return the changable flag...................................//
			return this.m_bChangeable;
		},

		IsSelected: function(kta) {
			// the key type attribute can be applied to speed up in loops.......//
			var idx, dta = kta ? kta : this.m_Parent.m_dtn.GetSelectTypeAttribute(false);

			// when the select attribute is true, the item is selected..........//
			if (dta && ((idx = dta.m_nArrayIndex) < this.m_dataattributes.length)) {
				var tmp;

				// check the select attribute....................................//
				if ((tmp = this.m_dataattributes[idx])) {
					if (dta.m_Type == VBI.Types.st_string) {
						return VBI.Types.string2bool(tmp.m_Value);
					} else {
						return (tmp.m_Value ? true : false);
					}
				}
			}

			return false;
		},

		SetModified: function() {
			this.m_nModified |= 1; // set selection as modified...............//

			var p = this; // eslint-disable-line consistent-this
			while (p.m_Parent) {
				p = p.m_Parent;
			}
			// raise the attribute changed event................................//
			if (p) {
				p.OnElementChanged(this);
			}
		},

		store: function(dat) {
			// write the key attribute..........................................//
			var kta = this.m_Parent.m_dtn.GetKeyTypeAttribute();
			var ktaname = kta.m_Alias ? kta.m_Alias : kta.m_Name;
			dat[ktaname] = this.m_dataattributes[kta.m_nArrayIndex].GetStringValue();

			// when the changeable flag is modified, we submit the changeable ..//
			// flag as well.....................................................//

			if (this.m_nModified & 2) {
				dat["VB:c"] = this.m_bChangeable ? "true" : "false";
			}

			// when the modified flag was set initially we submit it............//
			if (this.m_nModified & 4) {
				dat["VB:m"] = "true";
			}

			// iterate through attributes and save the new values...............//
			// the selection information is in the attributes array.............//
			var nJ, len, tmp;
			for (nJ = 0, len = this.m_dataattributes.length; nJ < len; ++nJ) {
				if ((tmp = this.m_dataattributes[nJ]) && tmp.IsModified()) {
					var taname = tmp.m_dta.m_Alias ? tmp.m_dta.m_Alias : tmp.m_dta.m_Name;
					dat[taname] = tmp.GetStringValue();
				}
			}

			// iterate through nodes and save them as well......................//
			for (nJ = 0, len = this.m_datanodes.length; nJ < len; ++nJ) {
				if ((tmp = this.m_datanodes[nJ]) && tmp.IsModified()) {
					// create the node object.....................................//
					// and store the node into it.................................//
					tmp.store(dat["N"] = {});
				}
			}
		},

		// determine the elements path.........................................//
		GetKeyValue: function() {
			var kta;
			if (this.m_Parent && (kta = this.m_Parent.m_dtn.GetKeyTypeAttribute())) {
				return this.m_dataattributes[kta.m_nArrayIndex].m_Value;
			}

			return null;
		},

		// determine the explicit path of an element, this is usually needed in//
		// events that identify the clicked instance...........................//
		GetPath: function() {
			var path = null;
			var cur = this; // eslint-disable-line consistent-this
			while (cur) {
				// prepend key...................................................//
				var key = cur.GetKeyValue();
				if (path) {
					path = key + "." + path;
				} else {
					path = key;
				}

				// prepend node name.............................................//
				var n;
				if ((n = this.m_Parent)) {
					path = this.m_Parent.m_dtn.m_Name + "." + path;
				} else {
					break;
				}

				// go up one level...............................................//
				if (n.m_Parent && n.m_Parent.m_Parent) {
					// this is noe the dataprovider
					cur = n.m_Parent ? n.m_Parent : null;
				} else {
					break;
				}
			}

			return path;
		},

		SetElementSelectionState: function(bSelect, typeattribute) {
			// no cardinality checks are done when the function is called.......//
			var kta = typeattribute;
			if (!kta) {
				// select or unselect an element.................................//
				kta = typeattribute ? typeattribute : this.m_Parent.m_dtn.GetTypeAttribute("VB:s", true);
				kta.m_Type = VBI.Types.st_bool;
			}

			// when the key is not yet created, create it now...................//
			var idx = kta.m_nArrayIndex;
			if (this.m_dataattributes[idx] == null) {
				this.m_dataattributes[idx] = new VBI.DataProvider.DataAttribute(kta, null, this);
			}

			// set the selection state..........................................//
			// and mark it as modified..........................................//
			var bSelModified, attrib = this.m_dataattributes[idx];
			if ((bSelModified = (attrib.m_Value != (bSelect ? true : false)))) {
				attrib.m_Value = bSelect ? true : false;
				attrib.m_bModified = true;
			}

			// call modified function when selection has changed................//
			if (bSelModified) {
				this.SetModified();
				return true;
			}

			return false;
		},

		GlobalSingleSelect: function() {
			var dtn = this.m_Parent.m_dtn;
			if (dtn.m_MaxSelect == 0) {
				return 0;
			}

			// unselect all elements in this table...........................//
			this.m_Parent.SetSelection(false, false);

			// finally do the single selection on this element...............//
			this.Select(true);

			return 1;
		},

		Select: function(bSelect, oldCount) {
			var dtn = this.m_Parent.m_dtn;
			if (!oldCount) {
				oldCount = 0;
			}

			// this function checks the selection cardinalities.................//
			// selection and unselection is only possible when cardinality is...//
			// sufficient.......................................................//

			// selection is requested for the element...........................//
			// ( 0, 0 ) no selection will be done
			// ( 0,-1 ) any number of elements can be selected, select state of elements is used, lead selection represents last positive selection
			// ( 1, 1 ) exactly one element is selected->lead selection is used and element selection is set accordingly
			// ( 1, -1) at least one element must be selected, any number of elements can be selected->lead selection can be used and must not be
			// empty

			// selection remove is requested....................................//
			// ( 0, 0 ) exiting element selection is removed
			// ( 0,-1 ) exiting element selection can be removed
			// ( 1, 1 ) removing of selection not allowed
			// ( 1, -1) lead selection is keept, removing of selection only for selection state
			var nChanges;
			if (bSelect) {
				// element sould be selected.....................................//
				if (dtn.m_MaxSelect == 0) {
					// cardinality does not allow any selection
					return 0;
				}

				if (dtn.m_MaxSelect < 0) {
					// any number of elements can be selected
					nChanges = this.SetElementSelectionState(true) ? 1 : 0;
					return oldCount + nChanges;
				}

				if (dtn.m_MaxSelect == 1) {
					// exactly one element can be selected
					this.m_Parent.SetSelection(false, false); // unselect all elements, no cardinality check
					this.SetElementSelectionState(true); // select this element only
					return 1;
				}
			} else {
				// element should be unselected..................................//
				if (((dtn.m_MinSelect == 1) && (this.m_Parent.GetNumOfSelectedElements() > 1)) || (dtn.m_MinSelect == 0)) {
					// ensure that there are currently at least two elements......//
					// selected...................................................//
					nChanges = this.SetElementSelectionState(false) ? 1 : 0; // unselect this element only
					return oldCount - nChanges;
				}
			}
		},

		FindNodeFromPath: function(parts) {
			return dataprovider.FindFromPathEx(parts, 0, N, this, null);
		},

		FindAttributeFromPath: function(parts) {
			// call central function that should do everything correct..........//
			return dataprovider.FindFromPathEx(parts, 0, A, this, null);
		}
	};

	// ........................................................................//
	// DataAttribute..........................................................//

	VBI.DataProvider.DataAttribute = function(dta, value, parent, modified) {
		this.m_dta = dta; // the attributes name is stored in the dta.//
		this.m_Parent = parent;

		// set modified flag...................................................//
		if (modified) {
			this.m_bModified = true;
		}

		// data type enumerator................................................//
		// this.TypeEnum = { st_unknown : 0, st_vector : 1, st_string : 2, st_vectorarray : 3, st_float : 4, st_color : 5, st_long : 6, st_bool : 7 };

		// in this case the attributes value will not be assigned from a string//
		if (value === null) {
			return;
		}

		var vt = VBI.Types;
		if (dta.m_Type == vt.st_vectorarraymulti) {
			this.m_Value = vt.stringarray2vectorarray(value);
		} else if (dta.m_Type == vt.st_vectorarray || dta.m_Type == vt.st_vector) {
			this.m_Value = vt.string2vector(value);
		} else if (dta.m_Type == vt.st_long) {
			this.m_Value = vt.string2long(value);
		} else if (dta.m_Type == vt.st_float) {
			this.m_Value = vt.string2float(value);
		} else if (dta.m_Type == vt.st_bool) {
			this.m_Value = vt.string2bool(value);
		} else if (dta.m_Type == vt.st_color) {
			this.m_Value = vt.string2color(value);
		} else if (dta.m_Type == vt.st_string) {
			this.m_Value = value;
		} else {
			/*
			 * TO DO:
			 * support other datatypes
			 */
			this.m_Value = value;
		}
	};

	VBI.DataProvider.DataAttribute.prototype = {
		m_dta: null, // attributes type, containing name/alias......//
		m_Value: null, // attribute value, type depends on m_dta......//
		m_Parent: null, // attributes parent element...................//
		m_bModified: false, // modified state of attribute.................//

		clear: function() {
			this.m_Parent = null; // reset parent
			this.m_dta = null; // reset type relationship
		},

		store: function(dat) {
			/*
			 * TO DO:
			 * write the attribute to the object
			 */
		},

		set: function(val) {
			// set the attribute................................................//
			if (val != this.m_Value) {
				this.SetModified();
			}

			this.m_Value = val;
		},

		// .....................................................................//
		// helper functions....................................................//

		SetModified: function() {
			this.m_bModified = true;

			var p = this; // eslint-disable-line consistent-this
			while (p.m_Parent) {
				p = p.m_Parent;
			}
			// raise the attribute changed event................................//
			if (p) {
				p.OnAttributeChanged(this);
			}
		},

		IsModified: function() {
			return this.m_bModified;
		},

		IsChangeable: function() {
			// the attribute is changeable when the datatype and the elements...//
			// reports it as changeable.........................................//
			return (this.m_dta.m_bChangeable && this.m_Parent.m_bChangeable);
		},

		GetStringValue: function() {
			var tmp = "";

			// dependent on datatype we have to convert the value to a....//
			switch (this.m_dta.m_Type) {
				case VBI.Types.st_vectorarray:
				case VBI.Types.st_vector:
					return VBI.Types.vector2string(this.m_Value);
				case VBI.Types.st_long:
					tmp += this.m_Value;
					return tmp;
				case VBI.Types.st_float:
					tmp += this.m_Value;
					return tmp;
				case VBI.Types.st_string:
					return this.m_Value;
				case VBI.Types.st_bool:
					return this.m_Value ? "true" : "false";
				case VBI.Types.st_color:
					// convert the color back from rgba( 255,255,255, 0.1 ).......//
					// RGBA( ....)
					var cache;
					if ((cache = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(this.m_Value))) {
						cache = [
							+cache[1], +cache[2], +cache[3], parseInt(parseFloat(+cache[4]) * 255.0, 10)
						];
						return "RGBA(" + cache[0] + "," + cache[1] + "," + cache[2] + "," + cache[3] + ")";
					}
					break;
				default:
					// assume this is a string..........................................//
					return this.m_Value;
			}
		}
	};

	return dataprovider;
};

// ...........................................................................//
// data adaptors.............................................................//

VBI.Adaptor = function(ctx) {
	var Ctx = ctx; // current session context................................//

	this.RecursiveLoadElement = function(de, odn, dtn) {
		var nK;
		// push the attributes into the current element........................//
		for (nK = 0; nK < dtn.m_datatypeattributes.length; ++nK) {
			var dta = dtn.m_datatypeattributes[nK];
			var da = odn[dta.m_Name];

			// append the attribute to the element, when not undefined..........//
			if (da === undefined) {
				continue;
			}

			// do correct data conversion
			if ((dta.m_Type == VBI.Types.st_vector) && jQuery.type(da) == "array") {
				de[dta.m_Alias] = "" + da[0] + ";" + da[1] + ";0";
			} else {
				de[dta.m_Alias] = da.toString();
			}
		}

		// dive deeper and get the nodes.......................................//
		if (dtn.m_datatypenodes.length) {
			var dna = de.N = [];
			for (nK = 0; nK < dtn.m_datatypenodes.length; ++nK) {
				// for each typenode create node.................................//
				var next_dn = dna[nK] = {};
				var next_dtn = dtn.m_datatypenodes[nK];
				var next_odn = odn[next_dtn.m_Name];
				if (next_odn) {
					this.RecursiveLoad(next_dn, next_odn, next_dtn);
				}
			}
		}
	};

	this.RecursiveLoad = function(dn, odn, dtn) {
		dn.name = dtn.m_Name; // set the datanode name
		dn.E = []; // create the element array

		// add all attributes to the new created elements......................//
		var de;
		if (jQuery.type(odn) == 'array') {
			for (var nJ = 0; nJ < odn.length; ++nJ) {
				de = dn.E[nJ] = {};
				this.RecursiveLoadElement(de, odn[nJ], dtn);
			}
		} else {
			de = dn.E[0] = {};
			this.RecursiveLoadElement(de, odn, dtn);
		}
	};

	this.LoadFindRefNode = function(data) {
		var aRefs = Ctx.m_DataTypeProvider.FindTypeRefs();

		for (var nJ = 0, len = aRefs.length; nJ < len; ++nJ) {
			var start = data;
			var parts = aRefs[nJ].m_Ref.split(".");
			for (var nK = 0, lenPart = parts.length; nK < lenPart; ++nK) {
				start = start[parts[nK]];
				if (start && ((nK + 1) == lenPart)) {
					aRefs[nJ].m_Root = start;
					return aRefs[nJ];
				}
				if (!start) {
					break;
				}
			}
		}

		return null; // not found
	};

	this.CreateLoadData = function(data) {
		if (!Ctx.m_DataTypeProvider) {
			return null;
		}

		var ref = null;
		if (!(ref = this.LoadFindRefNode(data))) {
			return null; // no match found
		}

		// get the type information...............................................//
		var dtn = ref.m_DTN;
		var root = ref.m_Root;

		// determine the type references..........................................//
		var vbiDat = {
			SAPVB: {
				"version": "2.0",
				"Data": {
					"Remove": {
						"type": "N",
						"name": dtn.m_Name
					},
					"Set": {
						"type": "N",
						"name": dtn.m_Name,
						"N": {}
					}
				}
			}
		};

		var odn = root;
		var dn = vbiDat.SAPVB.Data.Set.N;

		// recursively load the data...........................................//
		this.RecursiveLoad(dn, odn, dtn);

		// do a load of the converted data.....................................//
		return vbiDat;
	};
};

});
