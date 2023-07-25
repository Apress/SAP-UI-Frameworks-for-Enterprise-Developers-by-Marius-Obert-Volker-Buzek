/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// VisualObjects namespace
// Author: Ulrich Roegelein
// visual objects are the items that can be placed in a scene
// they support full databinding to the visual business datacontext
// bindable functions for VOS

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
VBI.Utilities.SceneBindDesignSpotBoxSize = function(ocb) {
	var scene = this.m_Scene;

	// only when the scale is changeable......................................//
	if (ocb.m_Design && (ocb.m_Hit == VBI.HTBOXHANDLE) && this.m_Scale.IsChangeable(scene.m_Ctx)) {
		// lower handles are not supported, due they would modify the position.//
		// current implementation ensures that position is kept................//
		// precisely...........................................................//
		if (ocb.m_Handle > 6) {
			return;
		}

		// get the current non scaled values...................................//
		var zsf = scene.GetStretchFactor4Mode();
		var nsx = ocb.m_ClientX / zsf[0];
		var nsy = ocb.m_ClientY / zsf[0];

		// get the current bounding box........................................//
		var bb = ocb.m_DhOrig[0];
		var midX = (bb[0] + bb[2]) / 2.0;
		var wh = (bb[2] - bb[0]) / 2.0; // half of original width
		var h = (bb[3] - bb[1]); // height

		var fx = 1.0, fy = 1.0;
		switch (ocb.m_Handle) {
			case 1:
				fy = Math.abs(nsy - bb[3]) / h;
				break;
			case 2:
			case 5:
				if (ocb.m_Handle == 2) {
					fy = Math.abs(nsy - bb[3]) / h;
				}
				fx = Math.abs(nsx - midX) / wh;
				break;
			case 0:
			case 3:
				if (ocb.m_Handle == 0) {
					fy = Math.abs(nsy - bb[3]) / h;
				}
				fx = Math.abs(nsx - midX) / wh;
				break;
			default:
				break;
		}

		var scale = ocb.m_ScaleOrig.slice(0);
		scale[0] *= fx;
		scale[1] *= fy;

		// set the new scale...................................................//
		this.m_Scale.SetValueVector(scene.m_Ctx, scale);
	}
};

VBI.Utilities.SceneBindDesignBoxBoxSize = function(keepratio, ocb) {
	var scene = this.m_Scene;

	// only when the scale is changeable................................//
	if (ocb.m_Design && (ocb.m_Hit == VBI.HTBOXHANDLE) && this.m_Scale.IsChangeable(scene.m_Ctx)) {
		// get the current non scaled values...................................//
		var zsf = scene.GetStretchFactor4Mode();
		var nsx = ocb.m_ClientX / zsf[0];
		var nsy = ocb.m_ClientY / zsf[0];

		// get the current bounding box........................................//
		var bb = ocb.m_DhOrig[0];
		var midX = (bb[0] + bb[2]) / 2.0;
		var midY = (bb[1] + bb[3]) / 2.0;
		var wh = (bb[2] - bb[0]) / 2.0; // half of original width
		var hh = (bb[3] - bb[1]) / 2.0; // height

		var fx = 1.0, fy = 1.0;
		switch (ocb.m_Handle) {
			case 0:
			case 2:
			case 6:
			case 8:
				fx = Math.abs(nsx - midX) / wh;
				fy = Math.abs(nsy - midY) / hh;
				// when keeping the ratio we use the max of both.................//
				if (keepratio) {
					fx = fy = Math.max(fx, fy);
				}
				break;
			case 1:
			case 7:
				fy = Math.abs(nsy - midY) / hh;
				if (keepratio) {
					fx = fy; // here we keep the ratio.............//
				}
				break;
			case 3:
			case 5:
				fx = Math.abs(nsx - midX) / wh;
				if (keepratio) {
					fy = fx; // here we keep the ratio.............//
				}
				break;
			default:
				break;
		}

		var scale = ocb.m_ScaleOrig.slice(0);
		scale[0] *= fx;
		scale[1] *= fy;

		// set the new scale...................................................//
		this.m_Scale.SetValueVector(scene.m_Ctx, scale);
	}
};

VBI.Utilities.SceneBindMeterRadiusDesignBoxSize = function(ocb) {
	// determine a meter dimensioned radius...................................//
	var scene = this.m_Scene;
	if (ocb.m_Design) {
		// determine the center point information..............................//
		var center = this.m_Pos.GetValueVector(scene.m_Ctx);
		var cur = scene.GetPosFromPoint([
			ocb.m_ClientX, ocb.m_ClientY, 0
		]);

		// 0 1 2
		// 3 4 5
		// 6 7 8
		var r = 0;
		switch (ocb.m_Handle) {
			case 1:
			case 7:
				r = VBI.MathLib.Distance(VBI.MathLib.DegToRad(center), VBI.MathLib.DegToRad([
					center[0], cur[1]
				]));
				break;
			case 3:
			case 5:
				r = VBI.MathLib.Distance(VBI.MathLib.DegToRad(center), VBI.MathLib.DegToRad([
					cur[0], center[1]
				]));
				break;
			default:
				break;
		}

		// set the radius......................................................//
		this.m_Radius.SetValueFloat(scene.m_Ctx, Math.abs(r));
	}
};

VBI.Utilities.SceneBindRadiusDesignBoxSize = function(ocb) {
	// determines a pixel size radius.........................................//
	var scene = this.m_Scene;
	if (ocb.m_Design) {
		// determine the center point information..............................//
		var centerpos = this.m_Pos.GetValueVector(scene.m_Ctx);
		var centerpt = scene.GetPointFromPos(centerpos);
		centerpt[0] += ocb.m_IO;

		// 0 1 2
		// 3 4 5
		// 6 7 8
		var r = 0;
		switch (ocb.m_Handle) {
			case 1:
			case 7:
				r = (centerpt[1] - ocb.m_ClientY); // zf[1]; // in non zoomed pixel space
				break;
			case 3:
			case 5:
				r = (centerpt[0] - ocb.m_ClientX); // zf[0]; // in non zoomed pixel space
				break;
			default:
				break;
		}

		// set the radius......................................................//
		this.m_Radius.SetValueFloat(scene.m_Ctx, Math.abs(r));
	}
};

VBI.Utilities.SceneBindPosArrayDesignBoxSize = function(ocb) {
	var scene = this.m_Scene;
	if (ocb.m_Design) {
		// determine the new point information.................................//
		var pos = scene.GetPosFromPoint([
			ocb.m_ClientX - ocb.m_IO, ocb.m_ClientY, 0
		]);

		var minX = Number.MAX_VALUE;
		var maxX = -Number.MAX_VALUE;
		var minY = Number.MAX_VALUE;
		var maxY = -Number.MAX_VALUE;

		// determine min max from the original positions.......................//
		var apos = ocb.m_PosOrig.slice(0);
		var nJ, len = apos.length / 3, idx;
		for (nJ = 0; nJ < len; ++nJ) {
			idx = nJ * 3;
			if (minX > apos[idx]) {
				minX = apos[idx];
			}
			if (maxX < apos[idx]) {
				maxX = apos[idx];
			}
			if (minY > apos[idx + 1]) {
				minY = apos[idx + 1];
			}
			if (maxY < apos[idx + 1]) {
				maxY = apos[idx + 1];
			}
		}

		// 0,1,2
		// 3,4,5
		// 6,7,8

		// geo coordinate system goes from left to right but from bottom up....//
		var ax = 0, fx = 1;
		var ay = 0, fy = 1;
		switch (ocb.m_Handle) {
			case 0:
			case 1:
				if (ocb.m_Handle == 0) {
					ax = maxX;
					fx = (pos[0] - maxX) / (minX - maxX);
				}
				ay = minY;
				fy = (pos[1] - minY) / (maxY - minY);
				break;
			case 2:
			case 5:
				if (ocb.m_Handle == 2) {
					ay = minY;
					fy = (pos[1] - minY) / (maxY - minY);
				}
				ax = minX;
				fx = (pos[0] - minX) / (maxX - minX);
				break;
			case 6:
			case 3:
				if (ocb.m_Handle == 6) {
					ay = maxY;
					fy = (pos[1] - maxY) / (minY - maxY);
				}
				ax = maxX;
				fx = (pos[0] - maxX) / (minX - maxX);
				break;
			case 8:
			case 7:
				if (ocb.m_Handle == 8) {
					ax = minX;
					fx = (pos[0] - minX) / (maxX - minX);
				}
				ay = maxY;
				fy = (pos[1] - maxY) / (minY - maxY);
				break;
			default:
				break;
		}

		// all handles should be moved.........................................//
		for (nJ = 0; nJ < len; ++nJ) {
			idx = nJ * 3;
			apos[idx] = ax + (apos[idx] - ax) * fx;
			apos[idx + 1] = ay + (apos[idx + 1] - ay) * fy;
		}
		this.m_Pos.SetValueVector(scene.m_Ctx, apos);
	}
};

VBI.Utilities.BackupFont = function(dc) {
	dc.m_BackupFont = [];

	dc.m_BackupFont.m_font = dc.m_font = dc.font;
	dc.m_BackupFont.m_fillStyle = dc.fillStyle;
	dc.m_BackupFont.m_strokeStyle = dc.strokeStyle;
	dc.m_BackupFont.m_textAlign = dc.textAlign;
	dc.m_BackupFont.m_textBaseline = dc.textBaseline;
};

VBI.Utilities.RestoreFont = function(dc) {
	dc.m_font = dc.font = dc.m_BackupFont.m_font;
	dc.fillStyle = dc.m_BackupFont.m_fillStyle;
	dc.strokeStyle = dc.m_BackupFont.m_strokeStyle;
	dc.textAlign = dc.m_BackupFont.m_textAlign;
	dc.textBaseline = dc.m_BackupFont.m_textBaseline;
};

VBI.Utilities.SetTextAttributes = function(dc, newFont, newFillStyle, newStrokeStyle, newAlign, newTextBaseline) {
	if ((newFont != undefined) && (dc.m_font != newFont)) {
		dc.m_font = dc.font = newFont;
	}
	var aCol;
	if (newFillStyle) {
		aCol = VBI.Types.string2rgba(newFillStyle);
		dc.fillStyle = VBI.Utilities.RgbToHex(aCol[0], aCol[1], aCol[2]);
	}
	if (newStrokeStyle) {
		aCol = VBI.Types.string2rgba(newStrokeStyle);
		dc.strokeStyle = VBI.Utilities.RgbToHex(aCol[0], aCol[1], aCol[2]);
	}
	dc.textAlign = newAlign;
	dc.textBaseline = newTextBaseline;
};

VBI.Utilities.SetFont = function(dc, newFont) {
	if ((newFont != undefined) && (dc.m_font != newFont)) {
		dc.m_font = dc.font = newFont;
	}
};

VBI.DnDInfo = function() {
	var dndInfo = {}; // create the object
	dndInfo.m_datasource = null;
	dndInfo.m_boundtype = null;
	dndInfo.m_type = [];

	dndInfo.clear = function() {
		for (var nJ = 0; nJ < dndInfo.m_type.length; ++nJ) {
			dndInfo.m_type[nJ].clear();
		}
		if (dndInfo.m_boundtype) {
			dndInfo.m_boundtype.clear();
		}
		if (dndInfo.m_datasource) {
			dndInfo.m_datasource.clear();
		}
		dndInfo.m_datasource = null;
		dndInfo.m_boundtype = null;
		dndInfo.m_type = [];
	};

	// load from json parsed object
	dndInfo.load = function(dat, ctx, inst) {
		if (dat) {

			if (jQuery.type(dat) == 'array') {
				// load the vo array.............................................//
				for (var nJ = 0; nJ < dat.length; ++nJ) {
					if (jQuery.type(dat[nJ]) == 'object') {
						if (dat[nJ].datasource) {
							dndInfo.m_datasource = new VBI.NodeProperty(dat[nJ], 'datasource', inst.m_DataSource, ctx);
							dndInfo.m_boundtype = new VBI.AttributeProperty(dat[nJ], 'type', dndInfo.m_datasource, ctx);
						} else {
							dndInfo.m_type.push(new VBI.AttributeProperty(dat[nJ], 'type', null, ctx));
						}

					}
				}
			} else if (jQuery.type(dat) == 'object') {
				if (dat.datasource) {
					dndInfo.m_datasource = new VBI.NodeProperty(dat, 'datasource', inst.m_DataSource, ctx);
					dndInfo.m_boundtype = new VBI.AttributeProperty(dat, 'type', dndInfo.m_datasource, ctx);
				} else {
					dndInfo.m_type.push(new VBI.AttributeProperty(dat, 'type', null, ctx));
				}
			}
		}

	};
	dndInfo.getItemArray = function(ctx) {
		var aValue = [];
		var nS;
		if (dndInfo.m_datasource) {
			var ds = dndInfo.m_datasource;
			var nCurNde;
			if ((nCurNde = ds.GetCurrentNode(ctx))) {
				for (nS = 0; nS < nCurNde.m_dataelements.length; ++nS) {
					ds.Select(nS);
					aValue.push(dndInfo.m_boundtype.GetValueString(ctx));
				}
			}
		}
		if (dndInfo.m_type.length) {
			for (nS = 0; nS < dndInfo.m_type.length; ++nS) {
				aValue.push(dndInfo.m_type[nS].GetValueString(ctx));
			}
		}
		return aValue;
	};
	return dndInfo;
};

// ...........................................................................//
// vo properties.............................................................//

VBI.NodeProperty = function(dat, name, pnp, ctx) {
	// a datanode can be bound or not.........................................//
	// in both cases a data node is referenced................................//
	var path = null;
	if (!(path = dat[name])) {
		path = dat[name + ".bind"];
	}

	/**
	 * BCP_286165_2018
	 *
	 * The below code expected path to be like either of the below and performed a split
	 * on the character '.' depending upon whether there was binding on not.
	 *
	 * 		Orders--legend 			--> Result of split ["Orders--legend"]
	 * 		Orders--legend.C		--> Result of split ["Orders--legend", "C"]
	 *
	 * In the context of GeoMap in Fiori Launchpad, the value of path above can be like below.
	 *
	 * manangeOrders::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--legend
	 * manangeOrders::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--legend.C
	 *
	 * The result of split results in a path that is no longer valid. For the above, the results
	 * should be as below respectively.
	 *
	 * ["manangeOrders::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--legend"]
	 * ["manangeOrders::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--legend", "C"]
	 *
	 * Hence, changing the below to perform the split on the last occurence of '.' (just before 'bind')
	 * if there is binding.
	 */
	var namespaces = path.split("::");
	var entries = namespaces[namespaces.length - 1].split(".");
	namespaces.splice(-1, 1);
	namespaces.push(entries[0]);
	entries[0] = namespaces.join("::");

	// store the data source path...//
	this.m_NPath = entries;
	// store the original data path.//
	this.m_Path = entries;

	this.m_PNP = pnp; // store the parentnodeproperty.//
	this.m_nCurElement = 0; // current element index........//
	this.m_CurElement = null; // current element instance.....//

	// determine the real parent node for this node...........................//
	// and the relative path of this node to the parents node.................//

	// update members.........................................................//
	this.m_DTN = ctx.m_DataTypeProvider.FindTypeNodeFromPath(this.m_Path);

	// determine the real responsible node parent.............................//
	var tmp = this; // eslint-disable-line consistent-this
	while ((tmp = tmp.m_PNP)) {
		if (ctx.m_DataTypeProvider.isParentOf(tmp.m_DTN, this.m_DTN)) {
			// adjust the path..................................................//
			var nJ, tmppath = tmp.m_DTN.GetPath();
			for (nJ = 0; nJ < tmppath.length; ++nJ) {
				if (this.m_NPath[0] == tmppath[nJ]) {
					this.m_NPath.splice(0, 1); // remove first
				} else {
					break;
				}
			}
			break;
		}
	}
	this.m_PNP = tmp;

	// ........................................................................//
	// data change notification...............................................//

	this.NotifyDataChange = function(ctx) {
		// current element instance is lazy determined later, therefore reset..//
		// when data has changed...............................................//
		this.m_CurElement = null;

		// update members......................................................//
		this.m_DTN = ctx.m_DataTypeProvider.FindTypeNodeFromPath(this.m_Path);
	};

	this.clear = function() {
		// clear the node property.............................................//
		this.m_PNP = null; // reset parent node property
		this.m_CurElement = null; // reset current element reference
		this.m_DTN = null; // reset data type node reference
		this.m_NPath = null; // reset adjusted node path
		this.m_Path = null; // reset original node path
	};

	// ........................................................................//
	// helper functions.......................................................//

	this.GetCurrentElement = function(ctx) {
		if (this.m_CurElement) {
			return this.m_CurElement; // return the cached element.//
		}

		var dn = this.GetCurrentNode(ctx);
		if (!dn) {
			return null;
		}

		// cache the current iterated element..................................//
		this.m_CurElement = dn.m_dataelements[this.m_nCurElement];
		return (this.m_CurElement);
	};

	this.GetIndexedElement = function(ctx, idx) {
		var dn = this.GetCurrentNode(ctx);
		if (!dn) {
			return null;
		}
		return dn.m_dataelements[idx];
	};

	this.GetCurrentNode = function(ctx) {
		var dn = null;
		if (this.m_PNP) {
			// there is a parent, get the right index there.....................//
			var de = this.m_PNP.GetCurrentElement(ctx);
			dn = de.FindNodeFromPath(this.m_NPath);
		} else {
			// determine the datanode directly..................................//
			dn = ctx.m_DataProvider.FindNodeFromPath(this.m_NPath);
		}
		return dn;
	};

	// this is the selection iterator.........................................//
	// and is just set to be able to iterate over elements....................//

	this.Select = function(idx) {
		// reset current element first, determine the current element when.....//
		// necessary again.....................................................//
		this.m_CurElement = null;
		this.m_nCurElement = idx;
	};

	// edit mode handling.....................................................//
	// current edit mode state is stored on element level.....................//

	this.SetEditMode = function(ctx, mode) {
		var de;
		if ((de = this.GetCurrentElement(ctx))) {
			de.m_EditMode = mode;
		}
	};

	this.GetEditMode = function(ctx) {
		var de;
		if ((de = this.GetCurrentElement(ctx)) && (de.m_EditMode != undefined)) {
			return de.m_EditMode;
		}

		return VBI.EMHandle; // handle mode is the default...//
	};

	// diagnostics............................................................//

	this.IsElementSelected = function(ctx) {
		var de;
		if ((de = this.GetCurrentElement(ctx))) {
			return de.IsSelected();
		}

		return false;
	};

	this.SetSelected = function(ctx, bSelect) {
		// todo: set the selection state in the current selected item..........//
		return;
	};

	return this;
};

// ...........................................................................//
// bindable attribute object.................................................//

VBI.AttributeProperty = function(dat, name, pnp, ctx, def) {
	var val;

	// store a default value..................................................//
	this.m_DefaultValue = def;

	if ((val = dat[name])) {
		// there is no binding, use the specified name.........................//
		this.m_Name = name;
		this.m_Value = val;
	} else if ((val = dat[name + ".bind"])) {
		this.m_PNP = pnp;
		this.m_Name = name;

		/**
		 * BCP_286165_2018
		 *
		 * The below code expected val to be like either of the below and performed a split
		 * on the character '.' depending on whether there was binding or not.
		 *
		 * 		Orders--legend 					--> Result of split ["Orders--legend"]
		 * 		Orders--legend.SomeAlias		--> Result of split ["Orders--legend", "SomeAlias"]
		 *
		 * In the context of GeoMap in Fiori Launchpad, the value of val above can be like below
		 *
		 * manangeOrders::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--legend
		 * manangeOrders::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--legend.C
		 *
		 * The result of split results in a path that is no longer valid. For the above, the results
		 * should be as below respectively.
		 *
		 * ["manangeOrders::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--legend"]
		 * ["manangeOrders::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--legend", "C"]
		 *
		 * Hence, changing the below to perform the split on the last occurence of '.' (just before 'C')
		 * if there is databinding.
		 *
		 */
		var namespaces = val.split("::");
		var entries = namespaces[namespaces.length - 1].split(".");
		namespaces.splice(-1, 1);
		namespaces.push(entries[0]);
		entries[0] = namespaces.join("::");

		// relative binding path............//
		this.m_RelBind = entries;
		// absoulte original binding path...//
		this.m_AbsBind = entries;

		// determine the datatype attribute....................................//
		this.m_DTA = ctx.m_DataTypeProvider.FindTypeAttributeFromPath(this.m_AbsBind);

		// determine the real parent node and the relative the binding path....//
		var tmp = this; // eslint-disable-line consistent-this
		while ((tmp = tmp.m_PNP)) {
			if (ctx.m_DataTypeProvider.isParentOf(tmp.m_DTN, this.m_DTA)) {
				// adjust the path...............................................//
				var nJ, tmppath = tmp.m_DTN.GetPath();
				for (nJ = 0; nJ < tmppath.length; ++nJ) {
					if (this.m_RelBind[0] == tmppath[nJ]) {
						this.m_RelBind.splice(0, 1); // remove first
					} else {
						break;
					}
				}
				break;
			}
		}
		this.m_PNP = tmp;
	}

	// data change notification...............................................//

	this.NotifyDataChange = function(ctx) {
		// data in the datacontext has changed.................................//
		// determine the new datatype attribute when...........................//
		if (this.m_AbsBind) {
			this.m_DTA = ctx.m_DataTypeProvider.FindTypeAttributeFromPath(this.m_AbsBind);
		}
	};

	this.clear = function() {
		// clear the attribute properties......................................//
		this.m_PNP = null; // reset the parent
		this.m_DTA = null; // reset the type reference
		this.m_DefaultValue = null;

		// delete optional properties..........................................//
		if (this.m_Name) {
			this.m_Name = null;
		}
		if (this.m_Value) {
			this.m_Value = null;
		}
		if (this.m_PNP) {
			this.m_PNP = null;
		}
		if (this.m_RelBind) {
			this.m_RelBind = null;
		}
		if (this.m_AbsBind) {
			this.m_AbsBind = null;
		}
	};

	this.IsChangeable = function(ctx) {
		var attrib;
		if ((attrib = this.GetAttributeObject(ctx))) {
			return attrib.IsChangeable();
		}
		return false;
	};

	// ........................................................................//
	// data access............................................................//

	this.GetAttributeObject = function(ctx) {
		// this can only be called when binding is valid, in this case.........//
		// the data attribute is delivered.....................................//
		if (this.m_RelBind) {
			if (this.m_PNP) {
				// relative node property
				return this.m_PNP.GetCurrentElement(ctx).FindAttributeFromPath(this.m_RelBind);
			} else {
				return ctx.m_DataProvider.FindAttributeFromPath(this.m_RelBind);
			}
		}
		return null;
	};

	this.GetValueFloat = function(ctx) {
		// when this is an explicit property then return it immediately........//
		if (this.m_Value) {
			return VBI.Types.string2float(this.m_Value);
		}

		if (this.m_RelBind) {
			var attrib;
			if ((attrib = this.GetAttributeObject(ctx))) {
				if (attrib.m_dta.m_Type == VBI.Types.st_float) {
					return attrib.m_Value;
				}
				if (attrib.m_dta.m_Type == VBI.Types.st_string) {
					return VBI.Types.string2float(attrib.m_Value);
				}
				if (attrib.m_dta.m_Type == VBI.Types.st_long) {
					return VBI.Types.long2float(attrib.m_Value);
				}
				if (attrib.m_dta.m_Type == VBI.Types.st_bool) {
					return attrib.m_Value ? 1.0 : 0.0;
				}

				// todo: do other conversions here
			}
		}

		return this.m_DefaultValue;
	};

	this.GetValueString = function(ctx) {
		// when this is an explicit property then return it immediately........//
		if (this.m_Value) {
			return this.m_Value;
		}

		if (this.m_RelBind) {
			var attrib;
			if ((attrib = this.GetAttributeObject(ctx))) {
				if (attrib.m_dta.m_Type == VBI.Types.st_string) {
					return attrib.m_Value;
				} else {
					return attrib.GetStringValue();
				}
			}
		}

		return this.m_DefaultValue;
	};

	this.GetValueLong = function(ctx) {
		if (this.m_Value) {
			return VBI.Types.string2long(this.m_Value);
		}

		if (this.m_RelBind) {
			var attrib;
			if ((attrib = this.GetAttributeObject(ctx))) {
				if (attrib.m_dta.m_Type == VBI.Types.st_long) {
					return attrib.m_Value;
				}
				if (attrib.m_dta.m_Type == VBI.Types.st_bool) {
					return attrib.m_Value;
				}
				if (attrib.m_dta.m_Type == VBI.Types.st_string) {
					return VBI.Types.string2long(attrib.m_Value);
				}
				if (attrib.m_dta.m_Type == VBI.Types.st_float) {
					return VBI.Types.float2long(attrib.m_Value);
				}

				// todo: do other conversions here
			}

		}

		return this.m_DefaultValue;
	};

	this.GetValueBool = function(ctx) {
		if (this.m_Value) {
			return VBI.Types.string2bool(this.m_Value);
		}

		if (this.m_RelBind) {
			var attrib;
			if ((attrib = this.GetAttributeObject(ctx))) {
				if (attrib.m_dta.m_Type == VBI.Types.st_bool) {
					return attrib.m_Value;
				}
				if (attrib.m_dta.m_Type == VBI.Types.st_string) {
					return VBI.Types.string2bool(attrib.m_Value);
				}

				// todo: do other conversions here

			}
		}

		return this.m_DefaultValue;
	};

	this.GetValueVector = function(ctx) {
		// when this is an explicit property then return it immediately........//
		if (this.m_Value) {
			if (typeof (this.m_Value) === "string") {
				return VBI.Types.string2vector(this.m_Value);
			} else {
				return VBI.Types.stringarray2vectorarray(this.m_Value);
			}
		}
		if (this.m_RelBind) {
			var attrib;
			if ((attrib = this.GetAttributeObject(ctx))) {
				if ((attrib.m_dta.m_Type == VBI.Types.st_vector) || (attrib.m_dta.m_Type == VBI.Types.st_vectorarray) || (attrib.m_dta.m_Type == VBI.Types.st_vectorarraymulti)) {
					return attrib.m_Value;
				}
				if (attrib.m_dta.m_Type == VBI.Types.st_string) {
					return VBI.Types.string2vector(attrib.m_Value);
				}

				// todo: do other conversions here
			}
		}

		return this.m_DefaultValue;
	};

	this.GetValueColor = function(ctx) {
		// when this is an explicit property then return it immediately........//
		var rgba;
		if (this.m_Value) {
			rgba = VBI.Types.string2rgba(this.m_Value);
			return "rgba(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + "," + rgba[3] + ")";
		}
		if (this.m_RelBind) {
			// assume that the data is already a color..........................//
			var attrib;
			if ((attrib = this.GetAttributeObject(ctx))) {
				if ((attrib.m_dta.m_Type == VBI.Types.st_color)) {
					return attrib.m_Value;
				}
				if (attrib.m_dta.m_Type == VBI.Types.st_string) {
					rgba = VBI.Types.string2rgba(attrib.m_Value);
					return "rgba(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + "," + rgba[3] + ")";
				}

				// todo: do other conversions here
			}
		}

		return this.m_DefaultValue;
	};

	// ........................................................................//
	// modification functions.................................................//

	this.SetValueVector = function(ctx, val) {
		// when this is an explicit property then return it immediately........//
		if (this.m_Value) {
			return null; // only bound properties can be changed...........//
		}

		if (this.m_RelBind) {
			var attrib;
			if ((attrib = this.GetAttributeObject(ctx))) {
				if ((attrib.m_dta.m_Type == VBI.Types.st_vector) || (attrib.m_dta.m_Type == VBI.Types.st_vectorarray)) {
					attrib.set(val);
				}
				if (attrib.m_dta.m_Type == VBI.Types.st_string) {
					attrib.set(VBI.Types.float2string(val));
				}
			}
		}

		return null;
	};

	this.SetValueFloat = function(ctx, val) {
		// when this is an explicit property then return it immediately........//
		if (this.m_Value) {
			return null; // only bound properties can be changed...........//
		}

		if (this.m_RelBind) {
			var attrib;
			if ((attrib = this.GetAttributeObject(ctx))) {
				if ((attrib.m_dta.m_Type == VBI.Types.st_float)) {
					attrib.set(val);
				} else if ((attrib.m_dta.m_Type == VBI.Types.st_long)) {
					attrib.set(VBI.Types.float2long(val));
				} else if (attrib.m_dta.m_Type == VBI.Types.st_string) {
					attrib.set(VBI.Types.float2string(val));
				}
			}
		}

		return null;
	};

	// diagnostics............................................................//
	this.IsBound = function() {
		return this.m_RelBind ? true : false;
	};

	return this;
};

});
