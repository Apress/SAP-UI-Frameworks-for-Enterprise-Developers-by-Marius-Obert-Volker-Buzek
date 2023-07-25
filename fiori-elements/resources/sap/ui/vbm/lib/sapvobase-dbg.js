/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// VisualObjects namespace
// Author: Ulrich Roegelein
// visual objects are the items that can be placed in a scene
// they support full databinding to the visual business datacontext
// visual objects
// for Utilities, NodeProperties, AttributeProperties and DNDInfo so voutils.//

sap.ui.define([
	"sap/ui/core/IconPool",
	"./sapvbi"
], function(IconPool) {
	"use strict";

/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
VBI.VisualObjects = function() {
	// namespace constants....................................................//
	VBI.EMHandle = 0; // handle edit mode
	VBI.EMBox = 1; // box edit mode

	VBI.HTHANDLE = 0; // hit on design handle
	VBI.HTBOX = 1; // hit in box
	VBI.HTBOXHANDLE = 2; // hit on boxhandle

	var visualobjects = {};
	visualobjects.vbiclass = "VisualObjects";

	// ........................................................................//
	// class factory mapping for objects......................................//

	visualobjects.Factory = {
		"{00100000-2012-0004-B001-64592B8DB964}": function() {
			return new VBI.VisualObjects.Spot();
		},
		"{00100000-2012-0004-B001-C46BD7336A1A}": function() {
			return new VBI.VisualObjects.Route();
		},
		"{00100000-2013-0004-B001-7EB3CCC039C4}": function() {
			return new VBI.VisualObjects.Circle();
		}, // circle
		"{00100000-2013-0004-B001-686F01B57873}": function() {
			return new VBI.VisualObjects.CircleDist();
		}, // distant circle
		"{00100000-2012-0004-B001-383477EA1DEB}": function() {
			return new VBI.VisualObjects.Pie();
		},
		"{00100000-2012-0004-B001-BFED458C3076}": function() {
			return new VBI.VisualObjects.Box();
		},
		"{00100000-2012-0004-B001-F311DE491C77}": function() {
			return new VBI.VisualObjects.Area();
		}, // area
		"{00100000-2012-0004-B001-E180770E8A12}": function() {
			return new VBI.VisualObjects.HeatMap();
		}, // heatmap
		"{00100000-2012-0070-1000-35762CF28B6B}": function() {
			return new VBI.VisualObjects.Dummy();
		}, // collada
		"{388951f5-a66b-4423-a5ad-e0ee13c2246f}": function() {
			return new VBI.VisualObjects.Dummy();
		}, // decal
		"{00100000-2014-0004-B001-9F1B43BE944A}": function() {
			return new VBI.VisualObjects.Route();
		}, // ext link
		"{00100000-2014-0004-BDA8-87B904609063}": function() {
			return new VBI.VisualObjects.Area();
		}, // ext area
		"{00100000-2012-0004-B001-2297943F0CE6}": function() {
			return new VBI.VisualObjects.Container();
		}, // chartcontainer

		// 2D controls.........................................................//
		"{00100000-2013-1000-1100-50059A6A47FA}": function() {
			return new VBI.VisualObjects.Caption();
		}, // caption ( sectionheader )
		"{00100000-2013-1000-3700-AD84DDBBB31B}": function() {
			return new VBI.VisualObjects.Label();
		}, // label
		"{00100000-2013-1000-2400-D305F7942B98}": function() {
			return new VBI.VisualObjects.Link();
		}, // link
		"{00100000-2013-1000-2200-6B060A330B2C}": function() {
			return new VBI.VisualObjects.Image();
		}, // image
		"{00100000-2013-1000-1200-855B919BB0E9}": function() {
			return new VBI.VisualObjects.Button();
		} // button
	};

	// ........................................................................//
	// class factory mapping for objects......................................//

	visualobjects.Factory3D = {
		"{00100000-2012-0004-B001-BFED458C3076}": function() {
			return new VBI.VisualObjects.Box3D();
		},
		"{00100000-2012-0070-1000-35762CF28B6B}": function() {
			return new VBI.VisualObjects.Dummy();
		} // collada
	};

	// class factory instance creation........................................//
	visualobjects.Factory.CreateInstance = function(clsid) {
		return visualobjects.Factory[clsid]();
	};

	// class factory instance creation........................................//
	visualobjects.Factory3D.CreateInstance = function(clsid) {
		return visualobjects.Factory3D[clsid]();
	};

	// ........................................................................//
	// base class for visual objects..........................................//

	VBI.VisualObjects.Base = {
		// vo properties.......................................................//
		m_Scene: null, // scene backreference...................//

		m_BB: [], // bounding box of the master object.....//
		m_IO: [], // offsets of master for round world.....//

		m_colorHot: 'rgba( 240, 171, 0, 0.5 )', // hot color
		m_defaultColor: 'rgba( 255, 0, 0, 1.0 )', // default color
		m_defaultTooltip: '', // default tooltip

		// members for Labeltext ..............................................//
		m_defaultLabeltext: '', // default labeltext
		m_defaultLabelBgCol: 'rgba(200,200,200,1.0)',
		// m_Label : [],

		// design mode members.................................................//
		m_DH: [], // designmode handles....................//
		m_szHandle: 6, // designmode handle size
		m_Track: null, // track object

		// RichTooltip related members
		m_tt: "", // Tooltip content - string or RichTooltip
		m_pos: "", // position of hot VO - used to calculate RichTooltip visibility
		m_clientX: 0, // offset X - where the RichTooltip should be opened
		m_clientY: 0, // offset Y - where the RichTooltip should be opened
		m_nActiveSelections: 0,

		SetRichTooltip: function(hot) {
			var scene = this.m_Scene;
			var ctx = this.m_Scene.m_Ctx;
			var pos = (this.m_Pos != null) ? this.m_Pos.GetValueVector(ctx) : this.m_PosM.GetValueVector(ctx);

			// In case of RichTooltip, act based on hottness of vo instance
			if (this.m_tt instanceof sap.ui.core.TooltipBase) {

				if (hot) {
					if (this.m_tt != "" && this.m_pos == "") {
						// open RichTooltip
						scene.SetToolTip(this.m_tt, true, this.m_clientX, this.m_clientY);
						this.m_pos = pos;
					}
				} else if (JSON.stringify(this.m_pos) == JSON.stringify(pos)) {
					// close RichTooltip
					scene.SetToolTip(this.m_tt, false);
					this.m_pos = "";
				}

			}
		},

		SetClusteredRichTooltip: function(elem) {
			var scene = this.m_Scene;
			var pos = [
				elem[0], elem[1]
			];
			// In case of RichTooltip, act based on hottness of vo instance
			if (this.m_tt instanceof sap.ui.core.TooltipBase) {

				if (elem.h) {
					if (this.m_tt != "" && elem.m_pos == undefined) {
						// open RichTooltip
						scene.SetToolTip(this.m_tt, true, this.m_clientX, this.m_clientY);
						elem.m_pos = pos;
					}
				} else if (JSON.stringify(elem.m_pos) == JSON.stringify(pos)) {
					// close RichTooltip
					scene.SetToolTip(this.m_tt, false);
					elem.m_pos = undefined;
				}

			}
		},

		LoadDragDropInfo: function(dat, ctx, inst) {
			if (dat.DragSource && dat.DragSource.DragItem) {
				inst.m_DragSourceInfo = new VBI.DnDInfo();
				inst.m_DragSourceInfo.load(dat.DragSource.DragItem, ctx, inst);
			}
			if (dat.DropTarget && dat.DropTarget.DropItem) {
				inst.m_DropTargetInfo = new VBI.DnDInfo();
				inst.m_DropTargetInfo.load(dat.DropTarget.DropItem, ctx, inst);
			}

		},

		// base loading of common properties...................................//
		BaseLoad: function(dat, ctx, inst) {
			if (VBI.m_bTrace) {
				VBI.Trace("BaseLoad");
			}
			inst.m_Props.push(inst.m_HotScale = new VBI.AttributeProperty(dat, 'hotScale', inst.m_DataSource, ctx, [
				1.0, 1.0, 1.0
			]));
			inst.m_Props.push(inst.m_HotDeltaColor = new VBI.AttributeProperty(dat, 'hotDeltaColor', inst.m_DataSource, ctx, null));
			inst.m_Props.push(inst.m_SelectColor = new VBI.AttributeProperty(dat, 'selectColor', inst.m_DataSource, ctx, null));
			inst.m_Props.push(inst.m_NonSelectColor = new VBI.AttributeProperty(dat, 'nonSelectColor', inst.m_DataSource, ctx, null));
			inst.m_Props.push(inst.m_FxSize = new VBI.AttributeProperty(dat, 'fxsize', inst.m_DataSource, ctx, true));
			inst.m_Props.push(inst.m_FxDir = new VBI.AttributeProperty(dat, 'fxdir', inst.m_DataSource, ctx));
			inst.m_Props.push(inst.m_Entity = new VBI.AttributeProperty(dat, 'entity', inst.m_DataSource, ctx, null));

			inst.m_Props.push(inst.m_Labeltext = new VBI.AttributeProperty(dat, 'labelText', inst.m_DataSource, ctx, inst.m_defaultLabeltext));
			inst.m_Props.push(inst.m_LabelBgCol = new VBI.AttributeProperty(dat, 'labelBgColor', inst.m_DataSource, ctx, inst.m_defaultLabelBgCol));
			inst.m_Props.push(inst.m_LabelBrdrCol = new VBI.AttributeProperty(dat, 'labelBorderColor', inst.m_DataSource, ctx, null));
			inst.m_Props.push(inst.m_LabelArrow = new VBI.AttributeProperty(dat, 'labelArrow', inst.m_DataSource, ctx, false));
			inst.m_Props.push(inst.m_LabelRounded = new VBI.AttributeProperty(dat, 'labelRounded', inst.m_DataSource, ctx, false));
			inst.m_Props.push(inst.m_LabelPos = new VBI.AttributeProperty(dat, 'labelPos', inst.m_DataSource, ctx));
			inst.m_Props.push(inst.m_LabelOffset = new VBI.AttributeProperty(dat, 'labelOffset', inst.m_DataSource, ctx, [
				0, 0
			]));
			inst.m_Props.push(inst.m_LabelIcon = new VBI.AttributeProperty(dat, 'labelIcon', inst.m_DataSource, ctx));
			inst.m_Props.push(inst.m_LabelIcBgrdCol = new VBI.AttributeProperty(dat, 'labelIconBgrdCol', inst.m_DataSource, ctx));
			inst.m_Props.push(inst.m_LabelIcTextCol = new VBI.AttributeProperty(dat, 'labelIconTextCol', inst.m_DataSource, ctx));

			inst.m_Props.push(inst.m_DragData = new VBI.AttributeProperty(dat, 'dragdata', inst.m_DataSource, ctx, null));
			if (!VBI.m_bIsMobile) {
				this.LoadDragDropInfo(dat, ctx, inst);
			}
		},

		// .....................................................................//
		// common message handling base functions..............................//

		BaseMousemove: function(event) {
			if (VBI.m_bTrace) {
				VBI.Trace("BaseMousemove");
			}
			// do not handle mouse moves in tracking mode.......................//
			// to prevent from flickering.......................................//
			if (this.m_Track) {
				return false;
			}
			if (!this.GetHitArray) {
				return false;
			}
			if (this.m_Scene.vbiclass == "3DScene") {
				return false;
			}
			// determine the instances that are hit.............................//
			var hits = this.GetHitArray(event.offsetX, event.offsetY);

			var scene = this.m_Scene;
			// set the hot item.................................................//
			if (hits.length > 0) {
				// this can be a design handle as well...........................//
				scene.SetCursor('pointer');
				if (scene.InternalSetHotItem(this, hits[0])) {
					// when the instance has a tooltip then set it...............//
					if (!hits[0].m_Design && this.m_Tooltip) {
						// store tooltip content and offset to use later during VO rendering
						this.m_tt = this.getTooltip(scene.m_Ctx, hits[0]);

						if (VBI.m_bIsRtl) {
							var xy = scene.GetEventVPCoords(event);
							this.m_clientX = xy[0];
						} else {
							this.m_clientX = event.clientX;
						}
						this.m_clientY = event.clientY;

						var tmp = this.m_tt.split("#");
						if (tmp[0] == "rtt") {
							// In case of RichTooltip, save the object to use later
							var id = tmp[1];
							this.m_tt = sap.ui.vbm.VBI.RttMap[id];
						} else {
							// string tooltips will be handled at this point
							scene.SetToolTip(this.m_tt);
						}
					}

					// determine the current cursor dependent on the hit.........//
					var cursor;
					if ((cursor = this.DetailCursor(event, hits[0]))) {
						scene.SetCursor(cursor);
					}
				}
				if (this.m_DragSourceInfo) {
					scene.m_Canvas[scene.m_nLabelIndex].draggable = true;
				}
			} else if (scene.m_Canvas[scene.m_nLabelIndex].draggable == true) {
				scene.m_Canvas[scene.m_nLabelIndex].draggable = false;
			}

			return hits.length > 0 ? true : false;
		},

		BaseContextmenu: function(event) {
			if (VBI.m_bTrace) {
				VBI.Trace("BaseContextmenu");
			}
			if (!this.GetHitArray) {
				return false;
			}
			var scene = this.m_Scene;

			if (scene.vbiclass == "3DScene") {
				return false; // check: handle the event
			}
			if (event.hitTests) { // collect hit tests only
				event.hitTests = event.hitTests.concat(this.GetHitArray(event.offsetX, event.offsetY, true));
				return event.hitTests.length > 0;
			}
			// use hit test provided or perform hit tests and get the first one
			var hit = event.hitCached ? event.hitCached : this.GetHitArray(event.offsetX, event.offsetY, false)[0];
			if (!hit) {
				return false;
			}
			// set the hot item
			var index = this.GetDataIndex(hit.m_Index);
			var action, actions = scene.m_Ctx.m_Actions;
			var directInst; // to be filled for clusters
			var element = this.m_DataSource.GetIndexedElement(scene.m_Ctx, index);
			if (element) {
				// check for design handle context menu subscription
				if (actions && hit.m_Design && (hit.m_Hit == VBI.HTHANDLE)) {
					// check if action is subscribed
					if ((action = actions.findAction("HandleContextMenu", scene, this))) {
						var params = scene.GetEventVPCoordsObj(event);
						params.handle = hit.m_Handle.toString();
						scene.m_Ctx.FireAction(action, scene, this, element, params);
						// prevent from default handling
						event.preventDefault();
						return true;
					}
				}
				// before we can fire the context menu, check the instance for
				// click, a detailed contextmenu can be in an edge or a waypoint
				if (this.DetailContextmenu(event, element, hit)) {
					event.preventDefault();
					return true;
				}
			} else {
				// we have an artifical element
				var refElte = this.m_BBRefs[hit.m_Index];
				directInst = scene.m_Ctx.m_Clustering.getClusterIdent(scene.m_PreassembledData, refElte.cI, refElte.i);
				element = this.GetPreassembledElement(hit.m_Index);
			}
			// check for subscribed action and raise it
			if (actions) {
				// check if action is subscribed
				if ((action = actions.findAction("ContextMenu", scene, this))) {
					scene.m_Ctx.FireAction(action, scene, this, element, scene.GetEventVPCoordsObjWithScene(event), directInst, null, hit);
					event.preventDefault();
					return true;
				}
			}
			// always prevent from default handling when there was a hit
			event.preventDefault();
			return false;
		},

		// .....................................................................//
		// action finding......................................................//

		BaseFindAction: function(name) {
			// check if the edge click is subscribed............................//
			var scene = this.m_Scene, actions = scene.m_Ctx.m_Actions;
			return actions ? actions.findAction(name, scene, this) : null;
		},

		// .....................................................................//
		// common event raising................................................//

		BaseClick: function(event) {
			if (VBI.m_bTrace) {
				VBI.Trace("BaseClick");
			}
			if (!this.GetHitArray) {
				return false;
			}
			var scene = this.m_Scene;

			if (scene.vbiclass == "3DScene") {
				return false; // check: handle the event
			}
			if (event.hitTests) { // collect hit tests only
				event.hitTests = event.hitTests.concat(this.GetHitArray(event.offsetX, event.offsetY, true));
				return event.hitTests.length > 0;
			}
			//use hit test provided or perform hit tests and get the first one
			var hit = event.hitCached ? event.hitCached : this.GetHitArray(event.offsetX, event.offsetY, false)[0];
			// set the hot item and raise click event
			if (!hit) {
				return false;
			}
			var index = this.GetDataIndex(hit.m_Index);
			// trigger async rendering
			scene.RenderAsync(false);
			// determine the data element of the instance that is hit
			// and process selection
			// shift-key adds selection
			// ctrl-key toggle selection
			// for touch events we always toggle selection state
			var ele;
			var directInst; // to be filled for clusters
			if (index >= 0 && (ele = this.m_DataSource.GetIndexedElement(scene.m_Ctx, index))) {
				// set the datanode iterator to the hit element
				this.m_DataSource.Select(index);

				if ((event.type.indexOf("touch") >= 0) || (event.type.indexOf("pointer") >= 0 || ((event.ctrlKey || event.metaKey) && !event.shiftKey))) {
					this.Select(ele, scene.m_Ctx, this.IsSelected(scene.m_Ctx) ? false : true);
				} else if (event.shiftKey) {
					if (!this.IsSelected(scene.m_Ctx)) { // add it to the selection
						this.Select(ele, scene.m_Ctx, true);
					}
				} else {
					this.m_nActiveSelections = ele.GlobalSingleSelect(); // and select the single one
				}
				if (scene.m_PreassembledData) {
					scene.UpdatePreData4Selected(this.m_nPreDataIndex, this.GetInternalIndex(hit.m_Index));
				}
				if (hit.m_Handle >= 0) {
					event.preventDefault(); // click on a handle is already fired with sapup event
					return true;
				} else if (this.IsPosChangeable(scene.m_Ctx)) {
					// when the position is changeable the click should toggle the
					// selection mode between box and handle, clicks are not fired
					// determine new edit mode
					var em = this.m_DataSource.GetEditMode(scene.m_Ctx) == VBI.EMHandle ? VBI.EMBox : VBI.EMHandle;
					if (VBI.m_bTrace) {
						VBI.Trace("SetEditMode: " + em);
					}
					this.m_DataSource.SetEditMode(scene.m_Ctx, em);
					event.preventDefault();
					return true;
				}
				// before we can fire the click, check the instance for detailed
				// click, a detailed click can be a click in an edge or waypoint
				if (this.DetailClick(event, ele, hit)) {
					event.preventDefault();
					return true;
				}
			} else {
				// we have an artifical element
				var refElte = this.m_BBRefs[hit.m_Index];
				directInst = scene.m_Ctx.m_Clustering.getClusterIdent(scene.m_PreassembledData, refElte.cI, refElte.i);
				ele = this.GetPreassembledElement(hit.m_Index);
			}
			// check for subscribed action and fire event
			var actions;
			if ((actions = scene.m_Ctx.m_Actions)) {
				var action;
				if ((action = actions.findAction("Click", scene, this))) {
					this.m_Scene.m_Ctx.FireAction(action, scene, this, ele, scene.GetEventVPCoordsObj(event), directInst, null, hit);
					event.preventDefault();
					return true;
				}
			}
			return false;
		},

		GetPreassembledElement: function(index) {
			return undefined;
		},

		// base routine for hit testing the bounding boxes in the right order..//
		// with taking care about round world behavior.........................//
		// the returned information is an array of hit information objects.....//
		BaseHitTest: function(nsx, nsy, ocb) {
			var hits = [];
			// returns an array of objects, containing the index and............//
			// other detailed hit data..........................................//
			// hit testing must be done in the reverse order....................//
			// a callback object is used to define the params of the detail hit.//
			// test.............................................................//
			// ..................................................................//
			// do hit testing on all design handles first.......................//
			// the ocb is filled with the required hit information..............//
			var hi = {}; // hit information...................................//
			if (this.BaseDesignHitTest(nsx, nsy, hi)) {
				// design handle hit found.......................................//
				hits.push(hi);
				return hits;
			}
			var map = new Map; //use map to avoid duplicate hit tests
			// check for label hit
			var labels = this.getLabelData(false);
			if (labels) {
				for (var i = labels.length - 1; i >= 0; --i) { //opposite order starting from last (topmost) instance
					var label = labels[i];
					var rgba = VBI.Types.string2rgba(label.m_BgColor);
					if (rgba[3] < 0.1 && rgba[4] == 1) {
						continue; // transparent background, not as hit considered
					}
					for (var j = 0; j < label.m_Pos.length; ++j) {
						for (var k = 0; k < label.m_Pos[j].length; ++k) {
							var point = [nsx, nsy];
							var xPos = label.m_Pos[j][k][0];
							var yPos = label.m_Pos[j][k][1];
							var tri = label.m_Pos[j][k].tri;
							var rect = label.m_Pos[j][k].rc;
							var textRect = [xPos, yPos, xPos + label.m_Width, yPos + label.m_Height];

							if (VBI.Utilities.PtInRect(point, textRect) || (tri && VBI.Utilities.pointInTriangle(tri, point)) || (rect && VBI.Utilities.PtInRect(point, rect))) {
								var hitObj = {
									m_Vo: this,
									m_Index: label.mIndex,
									m_Entity: this.GetEntity(label.mIndex, this.m_Scene.m_Ctx)
								};
								if (ocb.m_All) {
									map.set(hitObj.m_Index, hitObj);
								} else {
									hits.push(hitObj);
								}
								if (!ocb.m_All) { // if not hit test for all instances required -> exit immediately
									return hits;
								}
							}
						}
					}
				}
			}
			// loop for data bound instances
			for (var i = this.m_BB.length - 1; i >= 0; --i) { //opposite order starting from last (topmost) instance
				var bbox = this.m_BB[i];
				if (bbox) {
					for (var j = this.m_IO[i].length - 1; j >= 0; --j) { // loop for round world instances
						var off = this.m_IO[i][j];
						if (!VBI.Utilities.PtInRect([nsx - off, nsy], bbox)) {
							continue;
						}
						// hit test fits..............................................//
						// do detail hittest using callback...........................//
						if (ocb) {
							// do call back, transform coord to master instance........//
							var ret = ocb.m_cb(ocb, i, nsx - off, nsy);

							if (ret && ret.m_hit > 0) { // this is a hit
								var hitObj = {
									m_Vo: this,
									m_Index: i,
									m_Entity: this.GetEntity(i, this.m_Scene.m_Ctx),
									m_Detail: ret,
									m_IO: off
								};
								if (ocb.m_All) {
									map.set(hitObj.m_Index, hitObj);
								} else {
									hits.push(hitObj);
								}
								if (!ocb.m_All && ret.m_hit == 1) { // 1: true hit, 2: diffuse hit (e.g. transparent objects)
									return hits;
								}
							}
						}
					}
				}
			}
			if (ocb.m_All) { //map -> array
				map.forEach(function(item) {
					hits.push(item);
				});
			}
			return hits;
		},

		// clear the vo........................................................//
		clear: function() {
			// call the clear on the properties.................................//
			var nJ;
			if (this.m_Props) {
				for (nJ = 0; nJ < this.m_Props.length; ++nJ) {
					this.m_Props[nJ].clear();
				}
				// destroy the props array.......................................//
				this.m_Props = null;
			}

			// clear drag and drop info
			if (this.m_DragSourceInfo) {
				this.m_DragSourceInfo.clear();
				this.m_DragSourceInfo = null;
			}
			if (this.m_DropTargetInfo) {
				this.m_DropTargetInfo.clear();
				this.m_DropTargetInfo = null;
			}

			// reset the backreference..........................................//
			this.m_Scene = null;

			// reset objects....................................................//
			this.m_Track = null;

			// cleararrays......................................................//
			this.m_BB = null;
			this.m_IO = null;
			this.m_DH = null;

			if (this.m_Label) {
				for (nJ = 0; nJ < this.m_Label.length; ++nJ) {
					this.m_Label[nJ].clear();
				}
				this.m_Label = [];
			}
		},

		// load the basic properties of a visual object........................//
		// Base Impl: Needs to be called with suitable scope or will fail!
		load: function(dat, ctx) {
			// non bindable properties
			if (dat.id) {
				this.m_ID = dat.id;
			}
			// load generic properties here.....................................//
			this.m_Props = [];
			this.m_DragSourceInfo = null;
			this.m_DropTargetInfo = null;
		},

		NotifyDataChange: function(ctx) {
			// iterate through properties and update them due data has changed..//
			if (this.m_Props) {
				for (var nJ = 0, len = this.m_Props.length; nJ < len; ++nJ) {
					this.m_Props[nJ].NotifyDataChange(ctx);
				}
			}

			// set an additional marker for all vos even when not used..........//
			this.m_bChanged = true;

			this.m_nActiveSelections = undefined;
		},

		IsPosChangeable: function(ctx) {
			// determine if position is changeable..............................//
			if (VBI.m_bMouseSupported && this.m_Pos) {
				return this.m_Pos.IsChangeable(ctx);
			}
			return false;
		},

		IsSelected: function(ctx) {
			if (this.m_DataSource) {
				return this.m_DataSource.IsElementSelected(ctx);
			}
			return false;
		},

		GetNumActiveSelections: function(ctx) {
			if (this.m_nActiveSelections === undefined) {
				// DataChanged was called so we have to recalculate the # selections
				this.m_nActiveSelections = 0;
				var currElement = this.m_DataSource.m_nCurElement;
				var node = this.m_DataSource.GetCurrentNode(ctx);
				if (node) {
					for (var nJ = 0, len = node.m_dataelements.length; nJ < len; ++nJ) {
						this.m_DataSource.Select(nJ);
						if (this.IsSelected(ctx)) {
							this.m_nActiveSelections++;
						}
					}
				}
				this.m_DataSource.Select(currElement);
			}

			return this.m_nActiveSelections;
		},

		Select: function(ele, ctx, bSelect) {
			this.m_nActiveSelections = ele.Select(bSelect, this.GetNumActiveSelections(ctx));
		},

		IsHandleMode: function() {
			// checks the current state if handles should be displayed for......//
			// editing..........................................................//
			return this.m_DataSource.GetEditMode(this.m_Scene.m_Ctx) == VBI.EMHandle ? true : false;
		},

		IsBoxMode: function() {
			// checks the current state if a box should be displayed for........//
			// editing..........................................................//
			return this.m_DataSource.GetEditMode(this.m_Scene.m_Ctx) == VBI.EMBox ? true : false;
		},

		IsDataAccepted: function(event) {

			var scene = this.m_Scene;

			// do nothing when tracking is active...............................//
			if (this.m_Track) {
				if (VBI.m_bTrace) {
					VBI.Trace("Error: Track object should be already gone");
				}
				return false;
			}

			if (!this.GetHitArray) {
				return false;
			}
			// determine the instances that are hit.............................//
			var hit, hits = this.GetHitArray(event.offsetX, event.offsetY);

			if (hits.length && (hit = hits[0]).m_Design) {
				return false;
			}

			if (hits.length && scene.m_DragInfo) {
				this.m_DataSource.Select(hit.m_Index);
				if (this.m_DropTargetInfo) {
					var ctx = scene.m_Ctx;
					var aDropItems = this.m_DropTargetInfo.getItemArray(ctx);
					var aDragItems = scene.m_DragInfo.aItems;

					for (var nJ = 0; nJ < aDropItems.length; ++nJ) {
						if (aDragItems.indexOf(aDropItems[nJ]) != -1) {
							try {
								event.dataTransfer.dropEffect = 'copy';
								event.stopPropagation();
								event.preventDefault();

							} catch (err) {
								// just trace the message...........................................//
								if (VBI.m_bTrace) {
									VBI.Trace("Warning: sapvobase.IsDataAccepted exception occured: " + err.message);
								}
							}

							return hit;
						}
					}
				}
			}
			return false;
		},

		GetEntity: function(nIndex, ctx) {
			this.m_DataSource.Select(nIndex);
			return this.m_Entity.GetValueString(ctx);
		},

		IsHot: function(idx) {
			// returns true only when the object itself is hot..................//
			// when design handles are hit no hot state is reported.............//
			var scene = this.m_Scene, hi = scene.m_HotItem;

			// a VO is hot when there is an entity match........................//
			if (hi.m_Entity && hi.m_Entity == this.m_Entity.GetValueString(scene.m_Ctx)) {
				return true;
			}
			// the index does not fit...........................................//
			if (!hi.m_HitObj || hi.m_Index != idx) {
				return false;
			}
			// it is not a hot design handle....................................//
			if (hi.m_Design) {
				return false;
			}
			// the vo does not fit..............................................//
			if (hi.m_VO != this) {
				return false;
			}
			// when no action is subscribed we do not show it as hot............//
// if( !(actions = this.m_Scene.m_Ctx.m_Actions) || !actions.findAction( null, this.m_Scene, this ) )
// return false;

			return true;
		},

		InternalChangeHotItem: function(oldIndex, newIndex) {

		},

		IsClusterable: function() {
			return false;
		},

		GetDataIndex: function(BBIndex) {
			return BBIndex; // overwritten for clusterable VOs
		},

		GetInternalIndex: function(BBIndex) {
			return BBIndex; // overwritten for clusterable VOs
		},

		getTooltip: function(ctx, hitObj) {
			this.m_DataSource.Select(hitObj.m_Index);
			return this.m_Tooltip.GetValueString(ctx);
		},

		getLabelText: function(ctx, hitObj) {
			this.m_DataSource.Select(hitObj.m_Index);
			return this.m_Labeltext.GetValueString(ctx);
		},

		getLabelData: function(bRecalc) {
			if (!this.m_Label) {
				return null;
			}
			if (bRecalc) {
				for (var nJ = 0; nJ < this.m_Label.length; nJ++) {
					var lb = this.m_Label[nJ];
					if (lb.CalculateLabelPos && lb.m_PosArray.pa.length > 0) {
						lb.m_Pos = [];
						for (var nK = 0; nK < lb.m_aIO.length; nK++) {

							var aPositions = this.CalculateLabelPos(this.m_Scene, lb.m_PosArray, lb.m_aIO[nK]);
							if (aPositions && aPositions.length > 0) {
								lb.m_Pos.push(aPositions);
							}
						}
						lb.m_bAligned = false;
					}

				}

			}
			return this.m_Label;
		},

		SwitchPreDataRendering: function(bSetSwitch) {
			if (this.bUsePreData != bSetSwitch) {
				this.bUsePreData = bSetSwitch;
				if (bSetSwitch) {
					this.IsHot = this.PreDataIsHot;
					this.GetEntity = this.PreDataGetEntity;
				} else {
					this.IsHot = this.BaseIsHot;
					this.GetEntity = this.BaseGetEntity;
				}
			}
		},

		GetAnimClusterDistance: function(nLOD, fExactLod) {
			var scene = this.m_Scene;
			var nDist = nLOD - fExactLod;
			if (nDist && scene.m_bNonIntPosStable) {
				var ttarget = 1000 * nDist;
				var tm = Date.now() - scene.m_bNonIntPosStable;
				nDist *= (tm < ttarget ? (ttarget - tm) / ttarget : 0);
			}
			scene.m_bLineAnimationRunning = (nDist > 0);

			return nDist;
		},

		RenderTree: function(node, edges, conf, cI, cnt, lod, nDist, dc, dcs, lodF, xOff, yOff, bOmitLeafs) {
			var currentBB = [
				lodF * node.bo[0] - xOff, lodF * node.bo[1] - yOff, lodF * node.bo[2] - xOff, lodF * node.bo[3] - yOff
			];
			var aIO = this.m_Scene.GetInstanceOffsets(currentBB);

			if (aIO.length) { // if current BB is not on screen, all childs are not on screen either
				if (node.lod < lod) {
					for (var i = 0; i < node.bw.length; ++i) {
						cnt = this.RenderTree(node.bw[i], edges, conf, cI, cnt, lod, nDist, dc, dcs, lodF, xOff, yOff, bOmitLeafs);
					}
				} else if (node.isCl) {
					if (this.RenderThisInstance(node, edges, conf, cI, cnt, node.nJ, dc, dcs, lod, nDist, lodF, xOff, yOff, false)) {
						cnt++;
					}
				} else if (!bOmitLeafs) {
					var myVO = this.m_Scene.m_VOS[node.vo];
					myVO.RenderThisInstance(node, edges, conf, cI, myVO.m_BB.length, node.nJ, dc, dcs, lod, nDist, lodF, xOff, yOff, true);
					myVO.SetClusteredRichTooltip(node);
				}
			}
			return cnt;
		},

		Init4Render: function() {

		},

		StandardInit: function() {
			this.m_BB = [];
			this.m_IO = [];
			this.m_DH = [];
		},

		StandardInitWithLPs: function() {
			this.m_BB = [];
			this.m_IO = [];
			this.m_DH = [];
			this.m_LP = [];
		},

		// .....................................................................//
		// design mode rendering...............................................//

		BaseRender: function(canvas, dc) {
			// when there are no design handles to render, return immediately...//
			var ldh = this.m_DH.length;

			if (!ldh) {
				return; // return immediately, no design handles available......//
			}
			var tmp, tdx, tdy;
			var size = this.m_szHandle, hsize = size / 2, sqdistance = 1.5 * size * size;
			var fs = dc.fillStyle;
			var fillShared = 'rgba(232,205,30,0.7)'; // shared handle
			var fillUnique = 'rgba(188,54,24,0.7)'; // unique handle
			var fillHot = 'rgba(229, 66, 30, 1.0 )'; // hot handle

			var hi = this.m_Scene.m_HotItem;

			// render the design mode handles...................................//
			// only when subsequent handles are near a shared handle is rendered//
			// this is not correct in general due the handles should be arranged//
			// in a quadtree and aggregated there...............................//
			// to be done when the quadtree is working fine.....................//

			var aHandles, xy, bSharedHandle = false;
			for (var nJ = 0; nJ < ldh; ++nJ) {
				if (!(aHandles = this.m_DH[nJ])) {
					continue; // no design handles specified for this instance..//
				}
				// even for design handles respect round world behavior..........//
				for (var nK = 0, lio = this.m_IO[nJ].length; nK < lio; ++nK) {
					// transform to round world...................................//
					dc.setTransform(1.0, 0.0, 0.0, 1.0, this.m_IO[nJ][nK], 0.0);

					if (aHandles.m_EditMode == VBI.EMBox) {
						// render the design box...................................//
						if (aHandles.length == 1) {
							xy = aHandles[0]; // xy must be a box...........//
							VBI.Utilities.DrawDesignRect(dc, this.DesignGetActiveBoxHandles(nJ), xy);
						}
					} else {
						dc.fillStyle = fillUnique;
						dc.lineWidth = 1;

						// render the design handles...............................//
						tmp = null; // reset temp point

						if (bSharedHandle) {
							dc.fillStyle = fillUnique; // reset fill color
							bSharedHandle = false; // rest shared handle state
						}

						for (var nL = 0, lh = aHandles.length; nL < lh; ++nL) {
							xy = aHandles[nL];

							// first check for hot handle...........................//
							var hot = (hi.m_VO == this && hi.m_Index == nJ && hi.m_Design && hi.m_HitObj && hi.m_HitObj.m_Handle == nL);

							// when the distance is too small between projected.....//
							// points skip rendering................................//

							if (tmp && (((tdx = (tmp[0] - xy[0])) * tdx) + ((tdy = (tmp[1] - xy[1])) * tdy)) < sqdistance) {
								// rerender the last handle with a different fill....//
								// style using same coordinates......................//
								if (!bSharedHandle) {
									bSharedHandle = true;

									dc.fillStyle = hot ? fillHot : fillShared;
									dc.fill();
								}
								continue;
							}

							// the last rendered item was a shared handle, reset....//
							// props................................................//
							if (bSharedHandle) {
								dc.fillStyle = fillUnique;
								bSharedHandle = false;
							}

							// first check for hot handle...........................//
							if (hot) {
								dc.fillStyle = fillHot; // reset fill color
							}
							// render it............................................//
							dc.beginPath();
							dc.rect(xy[0] - hsize, xy[1] - hsize, size, size);
							dc.closePath();
							dc.fill();

							if (hot) {
								dc.fillStyle = fillUnique; // reset fill color
							}
							// store the tmp........................................//
							tmp = xy;
						}
					}
				}
			}

			// reset style and transforms.......................................//
			dc.fillStyle = fs;
			dc.setTransform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
		},

		// .....................................................................//
		// design mode mouse processing........................................//

		BaseDesignHitTest: function(nsx, nsy, hi) {
			// hi ( hit info ) gets:
			// m_Index ( vo instance )
			// m_Handle ( handle index )
			// m_NsX ( non scaled x position )
			// m_NsY ( non scaled y position )
			// return true when hit is detected

			if (VBI.m_bTrace) {
				VBI.Trace("BaseDesignHitTest nsx:" + nsx + " nsy:" + nsy + " instance:" + this.m_ID);
			}
			var ldh = this.m_DH.length;
			if (!ldh) {
				return false; // no design handles at all..............//
			}
			var size = this.m_szHandle + 2, hsize = size / 2.0;
			var PtInRect = VBI.Utilities.PtInRect;

			// reset hi.........................................................//
			if (hi.m_Handle) {
				delete hi.m_Handle;
			}
			// check the design mode handles....................................//
			// start from the end, which is the reverse rendering sequence......//
			var aHandles, xy;
			for (var nJ = ldh; nJ >= 0; --nJ) {
				if (!(aHandles = this.m_DH[nJ])) {
					continue;
				}
				for (var nK = 0; nK < this.m_IO[nJ].length; ++nK) {
					var dx = this.m_IO[nJ][nK];

					// check with respect to round world behavior.................//
					if (aHandles.m_EditMode == VBI.EMHandle) {
						if (VBI.m_bTrace) {
							VBI.Trace("BaseDesignHitTest Handle");
						}
						for (var nL = 0, len = aHandles.length; nL < len; ++nL) {
							xy = aHandles[nL];
							if (PtInRect([
								nsx - dx, nsy
							], [
								xy[0] - hsize, xy[1] - hsize, xy[0] + hsize, xy[1] + hsize
							])) {
								if (VBI.m_bTrace) {
									VBI.Trace("BaseDesignHitTest Handle Hit! Index:" + nJ + " Handle: " + nL);
								}
								hi.m_Index = nJ;
								hi.m_Design = true; // flag indicating design handle hit
								hi.m_Hit = VBI.HTHANDLE; // hit on handle
								hi.m_Handle = nL;
								hi.m_NsX = nsx; // store current non scaled x
								hi.m_NsY = nsy; // store current non scaled y
								hi.m_IO = dx;
								return true;
							}
						}
					} else if (aHandles.m_EditMode == VBI.EMBox) {
						if (VBI.m_bTrace && (aHandles.length > 1 || aHandles.length == 0)) {
							VBI.Trace("Error: Box edit mode must fill one rectangle only");
						}
						xy = aHandles[0];
						if (VBI.m_bTrace) {
							VBI.Trace("BaseDesignHitTest Box");
						}
						// check for sizer handles.................................//
						var r2 = 9;
						var w = xy[2] - xy[0];
						var h = xy[3] - xy[1];

						var wh = w / 2;
						var hh = h / 2;

						// determine the active box design handles.................//
						var adh = this.DesignGetActiveBoxHandles(nJ);

						// fill corner arcs........................................//
						for (var x = 0; x < 3; ++x) {
							for (var y = 0; y < 3; ++y) {
								// skip inactive handles.............................//
								if (x == 1 && y == 1) {
									continue;
								}
								if (!adh[y * 3 + x]) {
									continue;
								}
								var ax = xy[0] + x * wh - (nsx - dx);
								var ay = xy[1] + y * hh - (nsy);
								if ((ax * ax + ay * ay) < r2) {
									// 0 1 2 -->y * 3 + x
									// 3 4 5
									// 6 7 8
									hi.m_Index = nJ;
									hi.m_Handle = y * 3 + x;
									hi.m_Design = true; // flag indicating design handle hit
									hi.m_Hit = VBI.HTBOXHANDLE; // it is a box scaling handle
									hi.m_NsX = nsx; // store current non scaled x
									hi.m_NsY = nsy; // store current non scaled y
									hi.m_IO = dx;
									return true;
								}
							}
						}

						// check for content hit...................................//
						if (PtInRect([
							nsx - dx, nsy
						], xy)) {
							if (VBI.m_bTrace) {
								VBI.Trace("BaseDesignHitTest Box Hit! Index:" + nJ);
							}
							hi.m_Index = nJ;
							hi.m_Handle = -1;
							hi.m_Design = true; // flag indicating design handle hit
							hi.m_Hit = VBI.HTBOX; // it the box itself
							hi.m_NsX = nsx; // store current non scaled x
							hi.m_NsY = nsy; // store current non scaled y
							hi.m_IO = dx;
							return true;
						}
					}
				}
			}
			return false;
		},

		// base implementation for all visual objects..........................//
		DesignHandleDrag: function(ocb, event) {
			var scene = this.m_Scene;
			if (VBI.m_bTrace) {
				VBI.Trace("DesignHandleDrag");
			}
			// trace invalid input mode state...................................//
			if (VBI.m_bTrace && (scene.m_nInputMode != VBI.InputModeTrackObject)) {
				VBI.Trace("Error: DesignHandleDrag wrong input mode: " + scene.m_nInputMode);
			}

			if (ocb.m_ClientX != ocb.m_ClientStartX || ocb.m_ClientY != ocb.m_ClientStartY) {
				ocb.m_bDragStart = true;
			}

			if (ocb.m_bDragStart) {
				// select the right datasource element and set the data.............//
				this.m_DataSource.Select(ocb.m_Index);

				// determine the new point information..............................//
				var pos = scene.GetPosFromPoint([
					ocb.m_ClientX - ocb.m_IO, ocb.m_ClientY, 0
				]);
				var posold = scene.GetPosFromPoint([
					ocb.m_ClientStartX - ocb.m_IO, ocb.m_ClientStartY, 0
				]);

				if (this.IsPosChangeable(scene.m_Ctx)) {
					// modify the position or the position array.....................//
					// get the complete data from the context........................//

					// do a clone before modification to get the modified flag in....//
					// data provider set correctly...................................//

					var apos = this.m_Pos.GetValueVector(scene.m_Ctx).slice(0);
					var aposold = ocb.m_PosOrig;
					var idx;
					if (ocb.hasOwnProperty('m_Handle')) {
						if (VBI.m_bTrace) {
							VBI.Trace("DesignHandleDrag Handle");
						}
						// scene.SetToolTip( pos[0] + ";" + pos[1] );
						if (ocb.m_Hit == VBI.HTHANDLE) {
							idx = ocb.m_Handle * 3;
							// only one handle is moved................................//
							apos[idx] = pos[0]; // modify x
							apos[idx + 1] = pos[1]; // modify y
							this.m_Pos.SetValueVector(scene.m_Ctx, apos);
						} else if (ocb.m_Hit == VBI.HTBOXHANDLE) {
							// we are tracking the box handle..........................//
							// 0 1 2
							// 3 4 5
							// 6 7 8

							// do box sizing on the object.............................//
							if (this.DesignBoxSize) {
								this.DesignBoxSize(ocb);
							}
							// scaling is required.....................................//
						} else if (ocb.m_Hit == VBI.HTBOX) {
							if (VBI.m_bTrace) {
								VBI.Trace("DesignHandleDrag Box");
							}
							// calculate the modification in position space............//
							var dposx = (pos[0] - posold[0]);
							var dposy = (pos[1] - posold[1]);

							// all handles should be moved.............................//
							for (var nJ = 0, len = apos.length / 3; nJ < len; ++nJ) {
								// scene.SetToolTip( pos[0] + ";" + pos[1] );

								idx = nJ * 3;
								apos[idx] = aposold[idx] + dposx; // modify x
								apos[idx + 1] = aposold[idx + 1] + dposy; // modify y
							}
							this.m_Pos.SetValueVector(scene.m_Ctx, apos);
						}
					}
				}
			}

			// render again.....................................................//
			scene.RenderAsync(true);
		},

		DesignHandleDrop: function(ocb, event) {
			var scene = this.m_Scene;

			// trace invalid input mode state...................................//
			if (VBI.m_bTrace && scene.m_nInputMode != VBI.InputModeTrackObject) {
				VBI.Trace("Error: DesignHandleDrop wrong input mode: " + scene.m_nInputMode);
			}
			// check for design handle context menu subscription.............//
			var action, actions = scene.m_Ctx.m_Actions;
			if (actions && ocb.m_Design && (ocb.m_Handle > -1 || ocb.m_Hit === VBI.HTBOX)) {
				// the action is raised whenever a design action has stopped..//
				// for the instanced type.....................................//
				// is it a HandleMoved or a HandleClick action ...............//
				var reqAction = (ocb.m_bDragStart) ? "HandleMoved" : "HandleClick";
				// check if action is subscribed..............................//
				if ((action = actions.findAction(reqAction, scene, this))) {
					var ele;
					if ((ele = this.m_DataSource.GetIndexedElement(scene.m_Ctx, ocb.m_Index))) {
						var params = scene.GetEventVPCoordsObj(event);
						params.handle = ocb.m_Handle.toString();
						params.mode = ocb.m_Hit.toString();
						scene.m_Ctx.FireAction(action, scene, this, ele, params);
					}
				}
			}

			// set the input mode back to default mode..........................//
			scene.SetInputMode(VBI.InputModeDefault);
			scene.RenderAsync(true);

			return true; // the base does just nothing yet, maybe fire event
		},

		DesignHandleEnd: function(ocb, event) {
			// tracking has ended...............................................//
			this.m_Track.UnHook();
			this.m_Track = null;
		},

		DesignGetActiveBoxHandles: function(idx) {
			// return the valid box handles in design mode......................//
			return [
				1, 1, 1, 1, 0, 1, 1, 1, 1
			];
		},

		// .....................................................................//
		// event handlers......................................................//

		onsapsecclick: function(event) {
			return this.BaseContextmenu(event);
		},

		onsapclick: function(event) {
			return this.BaseClick(event);
		},

		onsapmove: function(event) {
			return this.BaseMousemove(event);
		},

		onsapup: function(event) {
			if (!this.m_Track) {
				return false;
			}
			// stop tracking and reset tracking object..........................//
			this.m_Track.UnHook();
			this.m_Track = null;
		},

		onsapdrop: function(event) {
			if (VBI.m_bTrace) {
				VBI.Trace("onsapdrop in base " + event.type);
			}
			var hit;
			if ((hit = this.IsDataAccepted(event))) {
				var scene = this.m_Scene;
				var myIndex = this.GetDataIndex(hit.m_Index);
				var ele = this.m_DataSource.GetIndexedElement(scene.m_Ctx, myIndex);

				var action, actions = scene.m_Ctx.m_Actions;

				// check for subscribed action and raise it......................//
				if (actions) {
					// check if action is subscribed..............................//
					if ((action = actions.findAction("Drop", scene, this))) {
						this.m_Scene.m_Ctx.FireAction(action, scene, this, ele, scene.GetEventDropObjWithScene(event));
						event.preventDefault();
						return true;
					}
				}
				return false;
			}
			return false;
		},

		onsapdrag: function(event) {
			if (VBI.m_bTrace) {
				VBI.Trace("onsapdrag in base " + event.type);
			}
			if (this.IsDataAccepted(event)) {
				return true;
			}
			return false;

		},

		onsapdown: function(event) {
			if (VBI.m_bTrace) {
				VBI.Trace("onsapdown in base " + event.type);
			}
			var scene = this.m_Scene;

			// do nothing when tracking is active...............................//
			if (this.m_Track) {
				if (VBI.m_bTrace) {
					VBI.Trace("Error: Track object should be already gone");
				}
				return true;
			}

			if (scene.vbiclass == "3DScene") {
				return false; // check: handle the event
			}

			if (!this.GetHitArray) {
				return false;
			}
			// determine the instances that are hit.............................//
			var hit, hits = this.GetHitArray(event.offsetX, event.offsetY);

			if (hits.length && (hit = hits[0]).m_Design) {
				// and start tracking............................................//
				if (VBI.m_bTrace) {
					VBI.Trace("Start Tracking on " + this.m_ID + " caused by " + event.type);
				}
				this.m_DataSource.Select(hit.m_Index);

				// a design handle is hit........................................//
				// apply additional callbacks and props to the hit object........//
				hit.m_CBDrag = this.DesignHandleDrag.bind(this);
				hit.m_CBDrop = this.DesignHandleDrop.bind(this);
				hit.m_CBEnd = this.DesignHandleEnd.bind(this);
				hit.m_ClientStartX = event.offsetX;
				hit.m_ClientStartY = event.offsetY;
				hit.m_bDragStart = false;

				// store the original position and handles array due only deltas //
				// would cause numerical instabilities...........................//
				hit.m_PosOrig = scene.GetNearestPosArray(this.m_Pos.GetValueVector(scene.m_Ctx).slice(0));

				scene.SetInputMode(VBI.InputModeTrackObject);
				scene.SetCursor(this.DetailCursor(event, hit));

				// notify the control about start of tracking....................//
				// the application can append additional info....................//
				if (this.DesignBeginDrag) {
					this.DesignBeginDrag(hit);
				}
				this.m_Track = new scene.DesignTrack(hit);

				event.stopPropagation();
				event.preventDefault();
				return true;
			}

			if (hits.length) {
				this.m_DataSource.Select(hit.m_Index);
				if (this.m_DragSourceInfo && !this.m_Pos.IsChangeable(scene.m_Ctx)) {
					var ctx = scene.m_Ctx;
					var aDragItems = this.m_DragSourceInfo.getItemArray(ctx);
					if (aDragItems.length) {
						scene.m_DragInfo = {};
						scene.m_DragInfo.aItems = aDragItems;
						scene.m_DragInfo.strInstance = this.m_DataSource.m_Path + "." + this.m_DataSource.GetCurrentElement().GetKeyValue();
						scene.m_DragInfo.strScene = this.m_Scene.m_ID;
						scene.m_DragInfo.strID = this.m_ID;
						scene.m_DragInfo.strExtData = this.m_DragData.GetValueString(scene.m_Ctx);
						scene.m_DragInfo.bDragStart = false;
						return true;
					}
				}
			}
			return false;
		},

		// overridable functions...............................................//
		// that can be overridden in specific situations.......................//

		DetailClick: function(event, ele, hit) {
			return false;
		},

		DetailContextmenu: function(event, ele, hit) {
			return false;
		},

		DetailCursor: function(event, hit) {
			if (hit.m_Design) {
				if (hit.m_Hit == VBI.HTBOXHANDLE) {
					var cursor = [
						'nw-resize', 'n-resize', 'ne-resize', 'w-resize', '', 'e-resize', 'sw-resize', 's-resize', 'se-resize'
					];
					return cursor[hit.m_Handle];
				} else if (hit.m_Hit == VBI.HTBOX) {
					return 'move';
				}
			}
			// check: other cursors..............................................//
			return 'pointer';
		},

		// base helper functions...............................................//
		GetSelectColor: function(ctx, orgColor) {
			var rhls;
			// determine the select color shift.................................//
			if ((rhls = this.m_SelectColor.GetValueString(ctx))) {
				return this.ApplyDeltaColor(ctx, orgColor, rhls);
			} else {
				return orgColor; // return the original color......................//
			}
		},

		GetNonSelectColor: function(ctx, orgColor) {
			var rhls;
			// determine the select color shift.................................//
			if ((rhls = this.m_NonSelectColor.GetValueString(ctx))) {
				return this.ApplyDeltaColor(ctx, orgColor, rhls);
			} else {
				return orgColor; // return the original color......................//
			}
		},

		GetHotColor: function(ctx, orgColor) {
			var rhls;
			// determine the delta color shift..................................//
			if ((rhls = this.m_HotDeltaColor.GetValueString(ctx))) {
				return this.ApplyDeltaColor(ctx, orgColor, rhls);
			} else {
				return this.m_colorHot; // return the default hot color.............//
			}
		},

		GetAltBorderColor: function(ctx, orgColor) {
			var rhls;
			// determine the select color shift.................................//
			if ((rhls = this.m_AltColorBorder.GetValueString(ctx))) {
				return this.ApplyDeltaColor(ctx, orgColor, rhls);
			} else {
				return this.GetHotColor(ctx, orgColor); // no alternative border (delta) color given -> apply default hot (delta) color
			}
		},

		ApplyDeltaColor: function(ctx, orgColor, rhls) {
			var res;

			var key = orgColor + rhls;
			if (ctx.m_deltacolTable[key] == undefined) {
				// try to parse rhls.............................................//
				if ((res = VBI.Types.string2rhls(rhls))) {
					// we need to convert the original color to a number array....//
					var acol;
					if ((acol = VBI.Types.color2array(orgColor))) {
						var hls = VBI.Utilities.RGB2HLS(acol[0], acol[1], acol[2]);
						var rgb = VBI.Utilities.HLS2RGB(hls[0] + res[0], hls[1] * res[1], hls[2] * res[2]);

						// assemble the rgba string and cut range..................//
						ctx.m_deltacolTable[key] = 'rgba(' + Math.min(Math.round(rgb[0]), 255) + "," + Math.min(Math.round(rgb[1]), 255) + "," + Math.min(Math.round(rgb[2]), 255) + "," + Math.min((res[3] * acol[3]).toString(), 1.0) + ')';
					}
				} else {
					// try to parse explicit color...................................//
					ctx.m_deltacolTable[key] = VBI.Types.string2color(rhls);
				}
			}
			return ctx.m_deltacolTable[key];
		},

		GetHotScale: function(ctx) {
			var ret;
			// determine the hot scale multiplicator............................//
			if ((ret = this.m_HotScale.GetValueVector(ctx))) {
				return ret;
			}
			return [
				1.0, 1.0, 1.0
			];
		},

		RectSelect: function(selectionRect, hits, orgHits) {
			var tmp, offSelectionRect, bFound = false;

			for (var nJ = this.m_BB.length - 1; nJ >= 0; --nJ) {
				// loop for data bound instances
				if ((tmp = this.m_BB[nJ])) {
					for (var nK = this.m_IO[nJ].length - 1; nK >= 0; --nK) {
						// loop for round world instances
						var off = this.m_IO[nJ][nK];
						offSelectionRect = [
							selectionRect[0] - off, selectionRect[1], selectionRect[2] - off, selectionRect[3]
						];
						if (tmp[0] >= offSelectionRect[0] && tmp[1] >= offSelectionRect[1] && tmp[2] <= offSelectionRect[2] && tmp[3] <= offSelectionRect[3]) {
							orgHits.push(nJ);
							hits.push(this.GetDataIndex(nJ));
							bFound = true;
						}
					}
				}
			}
			return bFound;
		},

		LassoSelectCircle: function(aPos, hits, orgHits) {
			var circlePt = [];
			var aOff, theta;
			var bFound = false;
			for (var nJ = this.m_BB.length - 1; nJ >= 0; --nJ) {
				var pointList = [];
				var xy = this.m_BB[nJ].m_Pos;
				var r = this.m_BB[nJ].m_Radius;
				var nSlices = 20;
				for (var nK = 0; nK < nSlices; ++nK) {
					theta = nK * 2 * Math.PI / nSlices;
					circlePt = [
						xy[0] + r * Math.sin(theta), xy[1] + r * Math.cos(theta)
					];
					pointList.push(circlePt);
				}
				aOff = this.m_IO[nJ];
				if (VBI.Utilities.polyInPolygon(aPos, pointList, aOff)) {
					hits.push(nJ);
					orgHits.push(nJ);
					bFound = true;
				}
			}
			return bFound;
		},

		LassoSelect: function(aPos, hits, orgHits) {
			var tmp;
			var bHit = false, bFound = false;
			var nK, nM;
			for (var nJ = this.m_BB.length - 1; nJ >= 0; --nJ) {
				// loop for data bound instances
				if ((tmp = this.m_BB[nJ])) {
					bHit = false;
					for (var nI = this.m_IO[nJ].length - 1; nI >= 0 && !bHit; --nI) {
						// loop for round world instances
						var off = this.m_IO[nJ][nI];
						var bbPointList = [
							[
								(tmp[0] + off), tmp[1]
							], [
								(tmp[2] + off), tmp[1]
							], [
								(tmp[2] + off), tmp[3]
							], [
								(tmp[0] + off), tmp[3]
							]
						];
						// check if one point of bounding box lies inside polygon
						if ((VBI.Utilities.pointInPolygon(aPos, bbPointList[0][0], bbPointList[0][1]))) {
							bHit = true;
							// check if bounding box and lasso have no intersection
							for (nK = 0; nK < bbPointList.length && bHit; nK += 2) {
								// outer loop for BB
								var bb1 = bbPointList[nK];
								var bb2 = bbPointList[nK + 1];
								for (nM = 0; nM < aPos.length && bHit; ++nM) {
									var poly1 = aPos[nM];
									var poly2 = (nM + 1 == aPos.length) ? aPos[0] : aPos[nM + 1];
									VBI.Utilities.LineLineIntersection(bb1, bb2, poly1, poly2, true);
									if ((VBI.Utilities.LineLineIntersection(bb1, bb2, poly1, poly2, true))) {
										bHit = false;
									}
								}
							}
						}
					}
					// push if instance found
					if (bHit) {
						orgHits.push(nJ);
						hits.push(this.GetDataIndex(nJ));
						bFound = true;
					}
				}

			}
			return bFound;
		},

		GetLabel: function(ctx) {
			var label = {};
			var text = this.m_Labeltext.GetValueString(ctx);
			var icon = this.m_LabelIcon.GetValueString(ctx);
			if (text || icon) {
				label.text = text;
				label.icon = icon;
				label.icColor = this.m_LabelIcBgrdCol.GetValueColor(ctx);
				label.icTextColor = this.m_LabelIcTextCol.GetValueColor(ctx);
				label.bgColor = this.m_LabelBgCol.GetValueColor(ctx);
				label.brdrCol = this.m_LabelBrdrCol.GetValueColor(ctx);
				label.arrow = this.m_LabelArrow.GetValueBool(ctx);
				label.rounded = this.m_LabelRounded.GetValueBool(ctx);
				label.offset = this.m_LabelOffset.GetValueVector(ctx);
				label.Align = this.m_LabelPos.GetValueLong(ctx);
				return label;
			} else {
				return null;
			}
		},

		RenderShadowDot: function(dcs, node, lodF, xOff, yOff, sz, zzf) {
			if (node.isCl) {
				for (var i = node.bw.length; i--;) {
					this.RenderShadowDot(dcs, node.bw[i], lodF, xOff, yOff, sz, zzf);
				}
			} else {
				dcs.beginPath();
				dcs.moveTo(zzf[0] * (lodF * node[0] - xOff - sz), zzf[1] * (lodF * node[1] - yOff - sz));
				dcs.lineTo(zzf[0] * (lodF * node[0] - xOff + sz), zzf[1] * (lodF * node[1] - yOff - sz));
				dcs.lineTo(zzf[0] * (lodF * node[0] - xOff + sz), zzf[1] * (lodF * node[1] - yOff + sz));
				dcs.lineTo(zzf[0] * (lodF * node[0] - xOff - sz), zzf[1] * (lodF * node[1] - yOff + sz));
				dcs.closePath();
				dcs.stroke();
			}
		},

		GetRefBorders: function(node, refLength, myLod, lodF) {
			var fExactLOD = this.m_Scene.m_Canvas[0].m_nExactLOD;
			var corr = (fExactLOD == Math.floor(fExactLOD) ? 1 : 0.5);
			var xMiddle, yMiddle, length = refLength;
			var lod = myLod;

			if (node.isCl == 1) { // Grid Based Clustering
				var lu = (node.e[0])[0], rl = (node.e[2])[0];

				xMiddle = (lu[0] + rl[0]) / 2;
				yMiddle = (lu[1] + rl[1]) / 2;
				length = 1.2 * lodF * Math.max(rl[0] - lu[0], rl[1] - lu[1]); // we are bigger than the box

			} else {
				xMiddle = (node.bo[0] + node.bo[2]) / 2;
				yMiddle = (node.bo[1] + node.bo[3]) / 2;
			}
			var radius = corr * length / lodF;

			var rv = [
				xMiddle - radius, xMiddle + radius, yMiddle - radius, yMiddle + radius
			];
			var myNode = node;
			while (myNode.c != undefined) {
				length *= (1 << (lod - myNode.c.lod));
				lod = myNode.c.lod;
				myNode = myNode.c;
				xMiddle = (myNode.bo[0] + myNode.bo[2]) / 2;
				yMiddle = (myNode.bo[1] + myNode.bo[3]) / 2;
				radius = length / lodF;
				rv = [
					Math.max(rv[0], xMiddle - radius), Math.min(rv[1], xMiddle + radius), Math.max(rv[2], yMiddle - radius), Math.min(rv[3], yMiddle + radius)
				];
			}

			return rv;
		},

		GetNextPoint: function(p0, p1, borders, xscr, yscr) {
			var perc, yi;
			if (xscr != 0) {
				var xi = xscr < 0 ? 0 : 1;
				perc = (p0[0] - borders[xi]) / (p0[0] - p1[0]);
				var y = p0[1] + perc * (p1[1] - p0[1]);
				if (yscr == 0 || ((y >= borders[2]) && (y <= borders[3]))) {
					return [
						borders[xi], y, true
					];
				}
				yi = yscr < 0 ? 2 : 3;
				perc = (p0[1] - borders[yi]) / (p0[1] - p1[1]);
				return [
					p0[0] + perc * (p1[0] - p0[0]), borders[yi], false
				];

			}

			if (yscr != 0) {
				yi = yscr < 0 ? 2 : 3;
				perc = (p0[1] - borders[yi]) / (p0[1] - p1[1]);
				return [
					p0[0] + perc * (p1[0] - p0[0]), borders[yi], false
				];
			}
		},

		CheckNextLinePoint: function(p0, p1, borders, index) {
			var isX = (index < 2);
			var ti = isX ? 0 : 1;
			var oi = 1 - ti;
			var perc = (p0[ti] - borders[index]) / (p0[ti] - p1[ti]);
			if ((perc <= 0) || (perc > 1)) {
				return undefined;
			}
			var other = p0[oi] + perc * (p1[oi] - p0[oi]);
			if ((other < borders[2 * oi]) || (other > borders[2 * oi + 1])) {
				return undefined;
			}
			return isX ? [
				borders[index], other
			] : [
				other, borders[index]
			];
		},

		paintLineList: function(dcs, pList, lodF, xOff, yOff, zzf) {
			var first;
			for (var j = 0; j < 4; ++j) {
				var pi = pList[j];
				for (var k = 0; k < pi.length; ++k) {
					if (first == undefined) {
						dcs.moveTo(zzf[0] * (lodF * (pi[k])[0] - xOff), zzf[1] * (lodF * (pi[k])[1] - yOff));
						first = true;
					} else {
						dcs.lineTo(zzf[0] * (lodF * (pi[k])[0] - xOff), zzf[1] * (lodF * (pi[k])[1] - yOff));
					}
				}
			}
		},

		GetNextLinePoint: function(p0, p1, borders, scr, isX) {
			var bCornerReached;
			var ti = isX ? 0 : 1;
			var oi = 1 - ti;
			var bi = 2 * ti + (scr < 0 ? 0 : 1);
			var perc = (p0[ti] - borders[bi]) / (p0[ti] - p1[ti]);
			var other = p0[oi] + perc * (p1[oi] - p0[oi]);
			if (isX) {
				bCornerReached = (other < borders[2]) || (other >= borders[3]);
				return [
					borders[bi], Math.max(Math.min(other, borders[3]), borders[2]), !bCornerReached
				];
			}
			bCornerReached = (other < borders[0]) || (other >= borders[1]);
			return [
				Math.max(Math.min(other, borders[1]), borders[0]), borders[bi], bCornerReached
			];
		},

		doCornerConnection: function(dcs, xOff, yOff, lodF, p0, p1, borders, my0, oth0, my1, oth1, isX, zzf) {
			var lastPoint = this.GetNextLinePoint(p0, p1, borders, my0, isX);
			dcs.lineTo(zzf[0] * (lodF * lastPoint[0] - xOff), zzf[1] * (lodF * lastPoint[1] - yOff));
			if (oth1 && (lastPoint[2] == isX)) {
				// axxis has not switched yet
				lastPoint = this.GetNextLinePoint(p0, p1, borders, oth1, !isX);
				dcs.lineTo(zzf[0] * (lodF * lastPoint[0] - xOff), zzf[1] * (lodF * lastPoint[1] - yOff));
			}
			if (my1 && (oth1 == 0 || oth1 == -oth0)) { // we switched completely to the otherside
				lastPoint = this.GetNextLinePoint(p0, p1, borders, my1, isX);
				lastPoint[2] = !lastPoint[2];
				dcs.lineTo(zzf[0] * (lodF * lastPoint[0] - xOff), zzf[1] * (lodF * lastPoint[1] - yOff));
			}
			return lastPoint;
		},

		RenderAreaFromBox: function(dcs, node, edges, borders, lodF, xOff, yOff, zzf) {
			var clustering = this.m_Scene.m_Ctx.m_Clustering;

			var cPt;
			var pList = [
				[
					[
						borders[1], borders[2]
					]
				], [
					[
						borders[1], borders[3]
					]
				], [
					[
						borders[0], borders[3]
					]
				], [
					[
						borders[0], borders[2]
					]
				]
			];
			var deltaX = borders[1] - borders[0], deltaY = borders[3] - borders[2];
			var cMap = [
				3, 1, 0, 2
			];
			var xMap = [
				1, 1, 0, 0
			];
			var yMap = [
				2, 3, 3, 2
			];
			var x, y;
			var atomNode = node; // will be filled with atomic node when required
			for (var i = 0; i < node.e.length; ++i) {
				var elte = clustering.getEdge(node.e[i], edges);
				var xPts = [], ind = [];
				for (var j = 0; j < 4; ++j) {
					if ((cPt = this.CheckNextLinePoint(elte[0], elte[1], borders, j)) != undefined) {
						ind.push(cMap[j]);
						xPts.push(cPt);
					}
				}
				if (xPts.length == 2) {
					while (atomNode.bw != undefined) {
						atomNode = atomNode.bw[0]; // we just need any of the VOs
					}
					var dist = ((4 + ind[1] - ind[0]) % 4);
					if ((dist % 2) == 1) {
						var src = (dist == 1 ? 0 : 1);
						var trg = 1 - src;
						var p1 = pList[ind[src]];
						if (ind[src] % 2) {
							x = (xPts[trg])[0];
							y = (xPts[src])[1];
						} else {
							x = (xPts[src])[0];
							y = (xPts[trg])[1];
						}
						var target = [
							borders[xMap[ind[src]]], borders[yMap[ind[src]]]
						];
						var xDist = Math.abs(target[0] - x);
						var yDist = Math.abs(target[1] - y);

						var axDist = Math.abs(target[0] - atomNode[0]);
						var ayDist = Math.abs(target[1] - atomNode[1]);
						// var tst = (axDist / xDist) + (ayDist / yDist);
						if (!xDist || !yDist || ((axDist / xDist) + (ayDist / yDist) > 1)) {
							p1.splice(p1.length - 1, 1, xPts[src], xPts[trg]);
						} else {
							var pNext = pList[(ind[src] + 1) % 4];
							pNext.splice(pNext.length - 1, 1, xPts[trg]);
							pNext = pList[(ind[src] + 2) % 4];
							pNext.splice(0, 1, xPts[trg]);
							pNext = pList[(ind[src] - 1) % 4];
							pNext.splice(0, 1, xPts[src]);

						}
					}
					if (dist == 2) {
						while (atomNode.bw != undefined) {
							atomNode = atomNode.bw[0]; // we just need any of the VOs
						}
						var perc;
						if (ind[0] % 2) {// uneven, breaking y-axxises
							var rgt = (ind[0] == 1 ? 0 : 1), lft = 1 - rgt;
							perc = (atomNode[0] - borders[0]) / deltaX;
							var yCut = (1 - perc) * (xPts[rgt])[1] + perc * (xPts[lft])[1];
							if (yCut > atomNode[1]) {
								pList[1].splice(pList[1].length - 1, 1, xPts[rgt]);
								pList[2] = [
									xPts[lft]
								];
							} else {
								pList[3].splice(pList[3].length - 1, 1, xPts[lft]);
								pList[0] = [
									xPts[rgt]
								];
							}
						} else { // even, both cutting x-axxises
							var top = (ind[0] == 0 ? 0 : 1), btm = 1 - top;
							perc = (atomNode[1] - borders[2]) / deltaY;
							var xCut = (1 - perc) * (xPts[btm])[0] + perc * (xPts[top])[0];
							if (xCut > atomNode[0]) {
								pList[0].splice(pList[0].length - 1, 1, xPts[top]);
								pList[1] = [
									xPts[btm]
								];
							} else {
								pList[2].splice(pList[2].length - 1, 1, xPts[btm]);
								pList[3] = [
									xPts[top]
								];
							}
						}
					}
				}
			}
			this.paintLineList(dcs, pList, lodF, xOff, yOff, zzf);
		},

		RenderAreaFromEdges: function(dcs, node, p0, pList, borders, lodF, xOff, yOff, zzf) {
			var p1, l0, l1, lastPoint, newPoint, pFirst = p0;
			var xscr0 = 0, yscr0 = 0;

			dcs.moveTo(zzf[0] * (lodF * p0[0] - xOff), zzf[1] * (lodF * p0[1] - yOff));
			var bOutside = false; // first point is always inside
			var yscr1, xscr1;
			var numEdges = node.e.length - 1;
			for (var i = numEdges; i--;) {
				p1 = p0.ot;
				xscr1 = (p1[0] > borders[1]) - (p1[0] < borders[0]);
				yscr1 = (p1[1] > borders[3]) - (p1[1] < borders[2]);
				if (bOutside) {
					if (xscr1 == 0 && yscr1 == 0) {
						if (xscr0 && yscr0) {
							if ((newPoint = this.GetNextLinePoint(p0, pFirst, borders, lastPoint[2] ? xscr0 : yscr0, lastPoint[2]))) {
								dcs.lineTo(zzf[0] * (lodF * newPoint[0] - xOff), zzf[1] * (lodF * newPoint[1] - yOff));
							}
						}
						newPoint = this.GetNextPoint(p1, p0, borders, xscr0, yscr0);
						dcs.lineTo(zzf[0] * (lodF * newPoint[0] - xOff), zzf[1] * (lodF * newPoint[1] - yOff));
						dcs.lineTo(zzf[0] * (lodF * p1[0] - xOff), zzf[1] * (lodF * p1[1] - yOff));
						bOutside = false;
					} else {
						if (lastPoint[2]) {
							if (xscr0 != xscr1) {
								lastPoint = this.doCornerConnection(dcs, xOff, yOff, lodF, p0, p1, borders, xscr0, yscr0, xscr1, yscr1, true, zzf);
							}

						} else if (yscr0 != yscr1) {
							lastPoint = this.doCornerConnection(dcs, xOff, yOff, lodF, p0, p1, borders, yscr0, xscr0, yscr1, xscr1, false, zzf);
						}

						xscr0 = xscr1;
						yscr0 = yscr1;
					}
				} else if (xscr1 == 0 && yscr1 == 0) {
					dcs.lineTo(zzf[0] * (lodF * p1[0] - xOff), zzf[1] * (lodF * p1[1] - yOff));
				} else {
					lastPoint = this.GetNextPoint(p0, p1, borders, xscr1, yscr1);
					dcs.lineTo(zzf[0] * (lodF * lastPoint[0] - xOff), zzf[1] * (lodF * lastPoint[1] - yOff));
					bOutside = true;
				}

				l1 = p1.li;
				l0 = pList[l1.ot];
				p0 = l0.p;
				xscr0 = xscr1;
				yscr0 = yscr1;
			}

			if (bOutside) {
				if (xscr0 && yscr0) {
					if ((newPoint = this.GetNextLinePoint(p0, pFirst, borders, lastPoint[2] ? xscr1 : yscr1, lastPoint[2]))) {
						dcs.lineTo(zzf[0] * (lodF * newPoint[0] - xOff), zzf[1] * (lodF * newPoint[1] - yOff));
					}
				}
				newPoint = this.GetNextPoint(pFirst, p0, borders, xscr0, yscr0);
				dcs.lineTo(zzf[0] * (lodF * newPoint[0] - xOff), zzf[1] * (lodF * newPoint[1] - yOff));
			}
		},

		FindEndPointInBorders: function(node, pList, p0, borders) {
			var cnt = node.e.length;
			var p1, l1, l0;
			while (cnt) {
				if ((p0[0] >= borders[0]) && (p0[0] <= borders[1]) && (p0[1] >= borders[2]) && (p0[1] <= borders[3])) {
					return p0;
				}
				p1 = p0.ot;
				l1 = p1.li;
				l0 = pList[l1.ot];
				p0 = l0.p;
				cnt--;
			}

			return undefined;
		},

// debugPaintEdges: function(dcs,node, lodF, xOff, yOff)
// {
// dcs.strokeStyle = "rgba(0,255,0,1)"
// var pList = node.e;
// for (var i = pList.length; i--;){
// var edge = pList[i];
// var e1 = edge[0], e2 = edge[1];
// dcs.beginPath();
// dcs.moveTo(lodF * e1[0] - xOff, lodF * e1[1] - yOff);
// dcs.lineTo(lodF * e2[0] - xOff, lodF * e2[1] - yOff);
// dcs.stroke();
// }
// };
//
// debugPaintBox: function(dcs, borders, lodF, xOff, yOff)
// {
// dcs.strokeStyle = "rgba(255,255,0,0.5)";
// dcs.beginPath();
// dcs.moveTo(lodF * borders[0] - xOff, lodF * borders[2] - yOff);
// dcs.lineTo(lodF * borders[0] - xOff, lodF * borders[3] - yOff);
// dcs.lineTo(lodF * borders[1] - xOff, lodF * borders[3] - yOff);
// dcs.lineTo(lodF * borders[1] - xOff, lodF * borders[2] - yOff);
// dcs.lineTo(lodF * borders[0] - xOff, lodF * borders[2] - yOff);
// dcs.stroke();
// };

		RenderShadowArea: function(dcs, node, edges, refLength, myLod, bSize, bCol, fCol, lodF, xOff, yOff, zzf, nonFill) {
			// this.debugPaintEdges(dcs,node,lodF,xOff,yOff);
			var clustering = this.m_Scene.m_Ctx.m_Clustering;
			var pList;
			if (node.ei != undefined && !nonFill) { // Render fist original borders and then inner borders to do correct fill
				this.RenderShadowArea(dcs, node, edges, refLength, myLod, bSize, bCol, fCol, lodF, xOff, yOff, zzf, true);
				pList = clustering.createEdgeIndex(edges, node.ei);
				dcs.strokeStyle = "rgba(0,0,0,0)";
			} else {
				pList = clustering.createEdgeIndex(edges, node.e);
				dcs.strokeStyle = bCol;
			}

			var borders = this.GetRefBorders(node, refLength, myLod, lodF);

			dcs.lineWidth = bSize;
			dcs.beginPath();

			var p0 = this.FindEndPointInBorders(node, pList, pList[0].p, borders);

			if (p0 == undefined) {
				// no point is in rectangle, so use box centric approach
				this.RenderAreaFromBox(dcs, node, edges, borders, lodF, xOff, yOff, zzf);
			} else { // use standard approach beginning with found edge end point
				this.RenderAreaFromEdges(dcs, node, p0, pList, borders, lodF, xOff, yOff, zzf);
			}

			dcs.closePath();
			if (!nonFill && fCol != undefined) {
				dcs.fillStyle = fCol;
				dcs.fill();
			}
			dcs.stroke();

		},

		RenderShadow: function(dcs, node, edges, conf, nLod, lodF, xOff, yOff) {
			var zzf = this.m_Scene.GetZoomFactor4Mode();
			if (conf.sCol) {
				dcs.strokeStyle = conf.sCol;
				dcs.lineWidth = 2;
				dcs.lineCap = 'round';

				var sz = conf.sSize;
				if (sz == -1) {
					if (node.cnt > 100) {
						sz = 1;
					} else if (node.cnt > 30) {
						sz = 2;
					} else {
						sz = 3;
					}
				}
				if (sz) {
					this.RenderShadowDot(dcs, node, lodF, xOff, yOff, sz, zzf);
				}
			}

			if ((conf.permArea && (node.grI > 1)) || (node.e == undefined) || (nLod < node.lod - 4 && node.c == undefined)) {
				// father node and too far outside -> too many artefacts
				return;
			}

			if (conf.bCol) {
				var refLength = conf.baseConf.m_ref;
				var myLod = conf.baseConf.m_lod;
				if (conf.bCol3) {
					if (node.c && node.c.lod == myLod - 1) {
						this.RenderShadowArea(dcs, node.c, edges, refLength * 2, myLod - 1, 1, conf.bCol3, conf.fCol3, lodF, xOff, yOff, zzf);
					} else {
						this.RenderShadowArea(dcs, node, edges, refLength * 2, myLod - 1, 1, conf.bCol3, conf.fCol3, lodF, xOff, yOff, zzf);
					}
				}
				this.RenderShadowArea(dcs, node, edges, refLength, myLod, conf.bSize, conf.bCol, conf.fCol, lodF, xOff, yOff, zzf);
				if (conf.bCol2 && node.bw) {
					if (nLod == node.lod) {
						for (var i = 0; i < node.bw.length; i++) {
							var bwNode = node.bw[i];
							if (bwNode.e.length > 0) {
								this.RenderShadowArea(dcs, bwNode, edges, refLength / 2, myLod + 1, 1, conf.bCol2, conf.fCol2, lodF, xOff, yOff, zzf);
							}
						}
					} else {
						this.RenderShadowArea(dcs, node, edges, refLength / 2, myLod + 1, 1, conf.bCol2, conf.fCol2, lodF, xOff, yOff, zzf);
					}
				}
			}
		}

	};

	// ........................................................................//
	// spot object............................................................//

	VBI.VisualObjects.Spot = function() {
		// instance constants..................................................//
		this.m_fHotScale = 1.2;

		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load.call(this, dat, ctx);

			// load bindable properties.........................................//
			this.m_Props.push(this.m_DataSource = new VBI.NodeProperty(dat, 'datasource', null, ctx));
			this.m_Props.push(this.m_Pos = new VBI.AttributeProperty(dat, 'pos', this.m_DataSource, ctx));
			this.m_Props.push(this.m_Image = new VBI.AttributeProperty(dat, 'image', this.m_DataSource, ctx));
			this.m_Props.push(this.m_ImageSelected = new VBI.AttributeProperty(dat, 'imageSelected', this.m_DataSource, ctx, null));
			this.m_Props.push(this.m_Icon = new VBI.AttributeProperty(dat, 'icon', this.m_DataSource, ctx));
			this.m_Props.push(this.m_Text = new VBI.AttributeProperty(dat, 'text', this.m_DataSource, ctx));
			this.m_Props.push(this.m_Tooltip = new VBI.AttributeProperty(dat, 'tooltip', this.m_DataSource, ctx, this.m_defaultTooltip));
			this.m_Props.push(this.m_Scale = new VBI.AttributeProperty(dat, 'scale', this.m_DataSource, ctx, [
				1.0, 1.0, 1.0
			]));
			this.m_Props.push(this.m_Alignment = new VBI.AttributeProperty(dat, 'alignment', this.m_DataSource, ctx, "5"));
			this.m_Props.push(this.m_ContentColor = new VBI.AttributeProperty(dat, 'contentColor', this.m_DataSource, ctx, "rgb(0,0,0)"));
			this.m_Props.push(this.m_ContentOffset = new VBI.AttributeProperty(dat, 'contentOffset', this.m_DataSource, ctx, [
				0, 0, 0
			]));
			this.m_Props.push(this.m_ContentFont = new VBI.AttributeProperty(dat, 'contentFont', this.m_DataSource, ctx, "arial"));
			this.m_Props.push(this.m_ContentSize = new VBI.AttributeProperty(dat, 'contentSize', this.m_DataSource, ctx, null));

			// load shared properties...........................................//
			this.BaseLoad(dat, ctx, this);
		};

		this.DetailHitTest = function(ocb, nIndex, nsx, nsy) {
			var iname, bHot, bSelected;
			var ctx = ocb.m_Ctx;

			var myIndex = nIndex;
			var hotColor = null;
			var selectColor = null;
			bHot = this.IsHot(myIndex, ctx);

			if (this.bUsePreData) {
				var InstancesOfVO = this.m_Scene.m_PreassembledData.base[this.m_nPreDataIndex];
				var oRef = this.m_BBRefs[nIndex];
				if (oRef.cI != undefined) {
					InstancesOfVO = this.m_Scene.m_PreassembledData.clust[oRef.cI];
				}
				var myInst = InstancesOfVO[oRef.i];

				iname = myInst.im;
				if (bHot) {
					hotColor = myInst.hcol;
				}
				bSelected = myInst.s;
			} else {
				this.m_DataSource.Select(myIndex);
				iname = this.m_Image.GetValueString(ctx);
				if (bHot) {
					hotColor = this.m_HotDeltaColor.GetValueString(ctx);
				}
				bSelected = this.IsSelected(ctx);
				if (bSelected) {
					selectColor = this.m_HotDeltaColor.GetValueString(ctx);
				}
			}

			var image, alpha = 0;
			if ((image = ctx.GetResources().GetImageBits(iname, hotColor, selectColor))) {
				var imageData = image[0];
				var rc = this.m_BB[nIndex]; // get bounds rect

				var width = rc[2] - rc[0];
				var height = rc[3] - rc[1];
				var ix = Math.floor((nsx - rc[0]) / width * image[1]);
				var iy = Math.floor((nsy - rc[1]) / height * image[2]);

				alpha = imageData[(iy * image[1] + ix) * 4 + 3];
			}
			return (alpha > 0) ? {
				m_hit: (alpha == 255 ? 1 : 2)
			} : null;
		};

		this.MatchIcon = function(iiconVal) {
			var iicon = {};
			if (iiconVal) {
				switch (iiconVal) {
					case "A8":
						iicon.i = "\ue078";
						iicon.f = "SAP-icons";
						break; // factory / location
					case "7T":
						iicon.i = "\ue075";
						iicon.f = "SAP-icons";
						break; // flight / airplane
					case "7R":
						iicon.i = "\ue08a";
						iicon.f = "SAP-icons";
						break; // cargo-train / train
					case "7Q":
						iicon.i = "\ue0b3";
						iicon.f = "SAP-icons";
						break; // shipping-status / truck
					case "13":
						iicon.i = "\ue1cb";
						iicon.f = "SAP-icons";
						break; // search
					case "89":
						iicon.i = "\ue176";
						iicon.f = "SAP-icons";
						break; // dimension
					case "5X":
						iicon.i = "\ue326";
						iicon.f = "VBI-Icons";
						break; // zone
					case "7S":
						iicon.i = "\ue345";
						iicon.f = "VBI-Icons";
						break; // ship
					default:
						iicon.f = "SAP-icons";
						if (iiconVal.charCodeAt(0) > 255) {
							iicon.i = iiconVal;
						} else {
							var icInfo = IconPool.getIconInfo(iiconVal);
							if (icInfo) {
								iicon.i = icInfo.content;
								iicon.f = icInfo.fontFamily;
							}
						}
						break;
				}

			}
			return iicon;
		};

		this.GetHitArray = function(x, y, all) {
			// determine the array of instances that are hit
			// x and y are the canvas relative coordinates
			// all is set when hit test for all instances needed
			var zsf = this.m_Scene.GetStretchFactor4Mode();
			var nsx = x / zsf[0];
			var nsy = y / zsf[0];

			var ocb = {
				m_cb: this.DetailHitTest.bind(this),
				m_Ctx: this.m_Scene.m_Ctx,
				m_All: all
			};
			// call base function for bounds check..............................//
			return this.BaseHitTest(nsx, nsy, ocb);
		};

		this.GetLabelPos = function(xy, width, height, eal) {
			var al = parseInt(eal != undefined ? eal : "5", 10);

			switch (al) {
				case 0:
					return {
						left: xy[0] - width / 2,
						top: xy[1] - height / 2
					}; // center
				case 8:
					return {
						left: xy[0],
						top: xy[1]
					}; // top left
				case 1:
					return {
						left: xy[0] - width / 2,
						top: xy[1]
					}; // top
				case 2:
					return {
						left: xy[0] - width,
						top: xy[1]
					}; // top right
				case 3:
					return {
						left: xy[0] - width,
						top: xy[1] - height / 2
					}; // right
				case 4:
					return {
						left: xy[0] - width,
						top: xy[1] - height
					}; // bottom right
				case 6:
					return {
						left: xy[0],
						top: xy[1] - height
					}; // bottom left
				case 7:
					return {
						left: xy[0],
						top: xy[1] - height / 2
					}; // left
				case 5:
				default:
					return {
						left: xy[0] - width / 2,
						top: xy[1] - height
					}; // bottom
			}
		};

		// render the single instance..........................................//
		this.RenderThisInstance = function(elem, edges, conf, cI, nIndex, nOrgIndex, dc, dcs, nLod, nDist, lodF, xOff, yOff, bRenderWithLabel) {
			if (VBI.m_bTrace) {
				VBI.Trace("Spot: RenderThisInstance");
			}
			var xy;
			var scene = this.m_Scene;
			var zzf = scene.GetZoomFactor4Mode();

			if (elem.c != undefined && conf.anim && (nLod > conf.animLow) && nDist && elem.c != undefined && elem.c.lod == nLod - 1) {
				var fElem = elem.c;
				var nDist3 = nDist * nDist;

				xy = [
					zzf[0] * (lodF * (elem[0] * (1 - nDist3) + fElem[0] * nDist3) - xOff), zzf[1] * (lodF * (elem[1] * (1 - nDist3) + fElem[1] * nDist3) - yOff)
				];
				if (conf.anim == 2) {
					var xyOrg = [
						zzf[0] * (lodF * fElem[0] - xOff), zzf[1] * (lodF * fElem[1] - yOff)
					];
					var tr = 2 * Math.abs(0.5 - nDist);
					var trans = "" + (1 - tr);
					dc.strokeStyle = "rgba(110,110,110," + trans + ")";
					dc.lineWidth = 2;
					dc.lineCap = 'round';
					dc.beginPath();
					dc.moveTo(xy[0], xy[1]);
					dc.lineTo(xyOrg[0], xyOrg[1]);
					dc.stroke();
				}

			} else {
				xy = [
					zzf[0] * (lodF * elem[0] - xOff), zzf[1] * (lodF * elem[1] - yOff)
				];
			}

			var image = scene.m_Ctx.GetResources().GetImage((elem.s && elem.simag) ? elem.simag : elem.im, elem.s ? elem.scol : null, elem.h ? elem.hcol : null, scene.RenderAsync.bind(scene));
			var scale = elem.sc;
			var text = elem.tx;
			var icon = elem.ic;

			var imgContentFont = elem.ctfont;

			if (!image) {
				return false; // when image is not available do nothing......//
			}
			var clustertext = elem.fs && elem.fz && (elem.cnt != undefined ? "" + elem.cnt : undefined);

			// determine the master box.........................................//
			var zsf = scene.GetStretchFactor4Mode();
			var width = image.naturalWidth * scale[0] / zsf[0];
			var height = image.naturalHeight * scale[1] / zsf[1], originalHeight = height;

			if (elem.h) {
				// determine the hot scale.......................................//
				if (elem.hscale != undefined) {
					width = width * elem.hscale[0];
					height = height * elem.hscale[1];
				}
			}

			var pos = this.GetLabelPos(xy, width, height, elem.al);
			// store the bounding box as a rectangle as array...................//
			// with [left, top, right, bottom]..................................//
			// calc and store the instance offsets..............................//

			var aIO = this.m_IO[nIndex] = scene.GetCorrectedInstanceOffsets(this.m_BB[nIndex] = [
				pos.left, pos.top, pos.left + width, pos.top + height
			], zzf);
			if (!aIO.length) {
				return false;
			}
			this.m_BBRefs.push({
				cI: cI,
				i: nOrgIndex
			});
			if (elem.h) {
				scene.VerifyHotItem(this, this.m_BBRefs.length - 1);
			}

			this.m_BB[nIndex].nI = nOrgIndex;
			// collect design handles...........................................//
			if (this.IsPosChangeable(scene.m_Ctx)) {
				var aDH = this.m_DH[nIndex] = [];
				if (this.IsHandleMode()) {
					aDH.m_EditMode = VBI.EMHandle;
					aDH.push(xy);
				} else if (this.IsBoxMode()) {
					// just push the box points to the design handle array........//
					aDH.m_EditMode = VBI.EMBox;
					aDH.push(this.m_BB[nIndex]);
				}
			}

			// render the images................................................//

			var content, imgContentSize;

			if (text) {
				imgContentSize = Math.floor((elem.ctsz ? elem.ctsz : 12) * height / image.naturalHeight);
				VBI.Utilities.SetTextAttributes(dc, imgContentSize.toString() + "px " + imgContentFont, elem.ctcol, elem.ctcol, "center", "middle");
				content = text;
			} else if (icon) {
				var oIcon = this.MatchIcon(icon);
				if (oIcon && oIcon.i && oIcon.f) {
					imgContentSize = Math.floor((elem.ctsz ? elem.ctsz : 16) * height / image.naturalHeight);
					VBI.Utilities.SetTextAttributes(dc, (imgContentSize ? imgContentSize : 16).toString() + "px " + oIcon.f, elem.ctcol, elem.ctcol, "center", "middle");
					content = oIcon.i;
				}
			}

			var offset, nJ;
			for (nJ = 0; nJ < aIO.length; ++nJ) {
				offset = aIO[nJ];
				if (conf && (elem.h || conf.permArea)) {
					this.RenderShadow(dcs, elem, edges, conf, nLod, lodF, xOff - offset, yOff);
				}
				dc.drawImage(image, pos.left + offset, pos.top, width, height);
				if (content) {
					var off = [
						0, 0, 0
					];
					if (elem.ctoffs && elem.ctoffs.length) {
						off = elem.ctoffs;
					}
					var offsX = off[0] * scale[0] / zsf[0];
					var offsY = off[1] * scale[1] / zsf[1];

					if (elem.h && elem.hscale != undefined) {
						offsX *= elem.hscale[0];
						offsY *= elem.hscale[1];
					}
					dc.fillText(content, pos.left + offset + offsX + width / 2, pos.top + offsY + height / 2);
				}
			}

			if (clustertext) {
				var fontSize = elem.fz ? elem.fz * height / image.naturalHeight : Math.floor(originalHeight / elem.fs);
				VBI.Utilities.SetTextAttributes(dc, (fontSize).toString() + "px " + elem.f, elem.fc, elem.fc, "left", "alphabetic");

				for (nJ = 0; nJ < aIO.length; ++nJ) {
					offset = aIO[nJ];
					dc.fillText(clustertext, width + pos.left + offset + elem.fo / zsf[0], pos.top + elem.foy / zsf[1] + (height + fontSize / 1.5) / 2.0);
				}
			}

			if (bRenderWithLabel == true) {
				if (elem.label && aIO.length) {
					var aLabelPos = {
						pa: [
							xy[0], xy[1], xy[2]
						],
						bb: null
					};
					this.m_Label.push(new VBI.Label(elem.label, nIndex, this.CalculateLabelPos, aLabelPos, this.m_BB[nIndex], aIO));
				}
			}

			return true;
		};

		// render the single instance..........................................//
		this.RenderInstance = function(nIndex, dc, realPos, image, text, scale, hot, label, icon) {
			if (VBI.m_bTrace) {
				VBI.Trace("Spot: RenderInstance");
			}
			if (!image) {
				return; // when image is not available do nothing......//
			}

			var scene = this.m_Scene;
			var zzf = scene.GetZoomFactor4Mode();
			var zsf = scene.GetStretchFactor4Mode();

			// determine the location where to render the main instance.........//
			var xy = scene.GetPointFromPos(realPos, true);
			// determine the master box.........................................//
			var width = image.naturalWidth * scale[0] / zsf[0];
			var height = image.naturalHeight * scale[1] / zsf[1];

			// determine the hot scale.......................................//
			var hs = this.GetHotScale(scene.m_Ctx);
			if (hot) {
				width = Math.round(width * hs[0]);
				height = Math.round(height * hs[1]);
			}

			// adjust left and top according to alignment specified
			var pos = this.GetLabelPos(xy, width, height, this.m_Alignment.GetValueString(scene.m_Ctx));

			// store the bounding box as a rectangle as array...................//
			// with [left, top, right, bottom]..................................//
			// calc and store the instance offsets..............................//
			var aIO = this.m_IO[nIndex] = scene.GetCorrectedInstanceOffsets(this.m_BB[nIndex] = [
				pos.left, pos.top, pos.left + width, pos.top + height
			], zzf);

			// collect design handles...........................................//
			if (this.IsPosChangeable(scene.m_Ctx)) {
				var aDH = this.m_DH[nIndex] = [];
				if (this.IsHandleMode()) {
					aDH.m_EditMode = VBI.EMHandle;
					aDH.push(xy);
				} else if (this.IsBoxMode()) {
					// just push the box points to the design handle array........//
					aDH.m_EditMode = VBI.EMBox;
					aDH.push(this.m_BB[nIndex]);
				}
			}

			// render the images................................................//

			var imgContentCol = this.m_ContentColor.GetValueString(scene.m_Ctx);
			var imgContentOffs = this.m_ContentOffset.GetValueVector(scene.m_Ctx);
			var imgContentFont = this.m_ContentFont.GetValueString(scene.m_Ctx);
			var imgContentSize = this.m_ContentSize.GetValueLong(scene.m_Ctx);

			var content;
			if (text) {
				if (!imgContentSize) {
					// no default and no explicit setting: set size for text
					imgContentSize = 12;
				}
				imgContentSize = imgContentSize * height / image.naturalHeight;
				VBI.Utilities.SetTextAttributes(dc, (Math.floor(imgContentSize)).toString() + "px " + imgContentFont, imgContentCol, imgContentCol, "center", "middle");
				content = text;
			} else if (icon) {
				if (!imgContentSize) {
					// no default and no explicit setting: set size for icon
					imgContentSize = 16;
				}
				imgContentSize = imgContentSize * height / image.naturalHeight;
				var oIcon = this.MatchIcon(icon);
				if (oIcon && oIcon.i && oIcon.f) {
					VBI.Utilities.SetTextAttributes(dc, (Math.floor(imgContentSize)).toString() + "px " + oIcon.f, imgContentCol, imgContentCol, "center", "middle");
					content = oIcon.i;
				}
			}
			for (var nJ = 0; nJ < aIO.length; ++nJ) {
				var offset = aIO[nJ];
				dc.drawImage(image, pos.left + offset, pos.top, width, height);

				if (content) {
					var offsX = imgContentOffs[0] * scale[0] / zsf[0];
					var offsY = imgContentOffs[1] * scale[1] / zsf[1];
					if (hot) {
						offsX *= hs[0];
						offsY *= hs[1];
					}

					dc.fillText(content, pos.left + offset + width / 2 + offsX, pos.top + height / 2 + offsY);
				}
			}
			if (label && aIO.length) {
				var aLabelPos = {
					pa: [
						xy[0], xy[1], xy[2]
					],
					bb: null
				};
				this.m_Label.push(new VBI.Label(label, nIndex, this.CalculateLabelPos, aLabelPos, this.m_BB[nIndex], aIO));
			}

		};

		// Calculate label position for spots
		this.CalculateLabelPos = function(scene, pointarray, instancesOffset) {

			var nLen = Math.floor(pointarray.pa.length / 3) * 3,
				aTmp = [],
				viewportCoord = scene.GetViewport();

			for (var nI = 0; nI < nLen; nI += 3) {
				var pt = [
					pointarray.pa[nI] + instancesOffset, pointarray.pa[nI + 1]
				];
				if (pt[0] > viewportCoord[0] && pt[0] < viewportCoord[2] && pt[1] > viewportCoord[1] && pt[1] < viewportCoord[3]) {
					aTmp.push(pt);
				}
			}

			return aTmp.length ? aTmp : null;
		};

		this.Init4Render = function() {
			this.m_BB = [];
			this.m_IO = [];
			this.m_DH = [];
			this.m_BBRefs = [];
		};

		// Spot.Render with respect to data binding.................................//
		this.Render = function(canvas, dc, preAssembledData, shadow, dcs, bSkipLabel) {
			// clear bounding boxes and instance offsets.......................//

			// get scene .......................................................//
			var scene = this.m_Scene;
			this.SwitchPreDataRendering(preAssembledData != undefined);
			var cntInstances;
			if (this.bUsePreData) {
				if ((preAssembledData.m_nNumIgnore != undefined) && (preAssembledData.m_nNumIgnore == preAssembledData.length)) {
					return 0; // everything to ignore
				}

				var bRenderWithLabel = bSkipLabel ? false : true;
				cntInstances = this.m_BB.length; // might be unequal 0 if entity in a predecessor call
				var fExactLod = scene.m_Canvas[0].m_nExactLOD;
				var xOff = scene.m_Canvas[0].m_nCurrentX * scene.m_MapManager.m_tileWidth;
				var yOff = scene.m_Canvas[0].m_nCurrentY * scene.m_MapManager.m_tileHeight;
				var conf = preAssembledData.config;
				var cI = preAssembledData.cI;
				var fNode = preAssembledData.m_TreeFatherNode;
				var nLOD;
				if (fNode) {
					nLOD = Math.ceil(fExactLod);
					var nDist = this.GetAnimClusterDistance(nLOD, fExactLod);
					cntInstances = this.RenderTree(fNode, preAssembledData.m_edges, conf, cI, cntInstances, nLOD, nDist, dc, dcs, preAssembledData.m_lodOffset, xOff, yOff, false);
				} else {
					nLOD = scene.m_Canvas[0].m_nCurrentLOD;
					var nElements = preAssembledData.length;
					var lodF = preAssembledData.m_lodOffset;
					for (var nL = 0; nL < nElements; ++nL) {
						var elem = preAssembledData[nL];
						if (!elem.b2Ignore) {
							if (this.RenderThisInstance(elem, preAssembledData.m_edges, conf, cI, cntInstances, nL, dc, dcs, nLOD, 0, lodF, xOff, yOff, bRenderWithLabel)) {
								this.SetClusteredRichTooltip(elem);
								cntInstances++;
							}
						}
					}
				}
			} else {
				// determine the binding information................................//
				var ctx = scene.m_Ctx;
				var node, tmp;
				if ((node = this.m_DataSource.GetCurrentNode(ctx))) {
					var len = node.m_dataelements.length;
					// the element count determines the number of rendered instances.//
					for (var nJ = 0; nJ < len; ++nJ) {
						this.m_DataSource.Select(nJ);
						var bHot = this.IsHot(nJ);
						var bSelected = this.IsSelected(ctx);

						// render the instance........................................//
						var ilonlat = this.m_Pos.GetValueVector(ctx);
						var iname = this.m_Image.GetValueString(ctx);

						// when selected we replace the image with the selected image.//
						if (bSelected && (tmp = this.m_ImageSelected.GetValueString(ctx))) {
							iname = tmp;
						}
						var itext = this.m_Text.GetValueString(ctx);
						var iicon = this.m_Icon.GetValueString(ctx);
						var iscale = this.m_Scale.GetValueVector(ctx);

						// it is possible that the image is not loaded, therefore we..//
						// bind the on load function to the renderascyn function of...//
						// the current scene..........................................//
						var image = ctx.GetResources().GetImage(iname, bSelected ? this.m_SelectColor.GetValueString(ctx) : null, bHot ? this.m_HotDeltaColor.GetValueString(ctx) : null, scene.RenderAsync.bind(scene));
						this.RenderInstance(nJ, dc, ilonlat, image, itext, iscale, bHot, this.GetLabel(ctx), iicon);

						// Spot: open or close RichTooltip based on VO instance hotness
						this.SetRichTooltip(bHot);
					}
				}
				// check: do single instance rendering in else branch ...........//

			}

			// call base rendering method.......................................//
			this.BaseRender(canvas, dc);

			return cntInstances; // to increase count of Scaling instances
		};

		this.DesignBeginDrag = function(ocb) {
			// append the original scale to the context.........................//
			ocb.m_ScaleOrig = this.m_Scale.GetValueVector(this.m_Scene.m_Ctx).slice(0);
			ocb.m_DhOrig = this.m_DH[ocb.m_Index].slice(0);
			if (ocb.m_IO) {
				(ocb.m_DhOrig[0])[0] += ocb.m_IO;
				(ocb.m_DhOrig[0])[2] += ocb.m_IO;
			}
		};

		// design overridden members...........................................//
		this.DesignGetActiveBoxHandles = function(idx) {
			// return the valid box handles in design mode......................//
			return [
				1, 1, 1, 1, 0, 1, 0, 0, 0
			];
		};

		this.InternalChangeHotItem = function(nIndex, value, hitItem) {
			if (this.bUsePreData) {
				var oRef = this.m_BBRefs[nIndex];
				if (oRef != undefined) {
					var InstancesOfVO = (oRef.cI != undefined) ? this.m_Scene.m_PreassembledData.clust[oRef.cI] : this.m_Scene.m_PreassembledData.base[this.m_nPreDataIndex];
					if (InstancesOfVO[oRef.i] != undefined) {
						InstancesOfVO[oRef.i].h = value;
						this.m_HotClusterVO = ((value && InstancesOfVO[oRef.i].isCl) ? InstancesOfVO[oRef.i] : undefined);
					}
					if (hitItem) {
						hitItem.cI = value ? oRef.cI : undefined;
						hitItem.nI = value ? oRef.i : undefined;
					}
				}
			}
		};

		this.BaseIsHot = this.IsHot;
		this.PreDataIsHot = function(nIndex, ctx) {
			var oRef = this.m_BBRefs[nIndex];
			var InstancesOfVO = (oRef.cI != undefined) ? this.m_Scene.m_PreassembledData.clust[oRef.cI] : this.m_Scene.m_PreassembledData.base[this.m_nPreDataIndex];
			return InstancesOfVO[oRef.i].h;
		};

		this.BaseGetEntity = this.GetEntity;
		this.PreDataGetEntity = function(nIndex, ctx) {
			this.m_DataSource.Select(nIndex);
			return this.m_Entity.GetValueString(ctx);
		};

		this.SwitchHotItemToStandard = function() {
			var scene = this.m_Scene;

			var oRef = this.m_BBRefs[scene.m_HotItem.m_Index];
			var InstancesOfVO = (oRef.cI != undefined) ? this.m_Scene.m_PreassembledData.clust[oRef.cI] : this.m_Scene.m_PreassembledData.base[this.m_nPreDataIndex];
			var elte = InstancesOfVO[oRef.i];

			if (elte) {
				if (elte.isCl == true) {
					scene.InternalSetHotItem(null, null);
					return elte;
				} else {
					scene.m_HotItem.m_Index = elte.nI;
					if (scene.m_HotItem.m_HitObj) {
						scene.m_HotItem.m_HitObj.m_Index = elte.nI;
					}
					return undefined;
				}
			}
		};

		this.IsClusterable = function() {
			return true;
		};

		this.GetDataIndex = function(BBIndex) {
			if (this.bUsePreData) {
				var oPreData = this.m_BBRefs[BBIndex];
				if (oPreData != undefined) {
					var InstancesOfVO = (oPreData.cI == undefined ? this.m_Scene.m_PreassembledData.base[this.m_nPreDataIndex] : this.m_Scene.m_PreassembledData.clust[oPreData.cI]);
					var elte = InstancesOfVO[oPreData.i];
					if (elte != undefined) {
						return elte.nI;
					}
				}
			}
			return BBIndex;
		};

		this.GetPreassembledElement = function(BBIndex) {
			var oPreData = this.m_BBRefs[BBIndex];
			if (oPreData == undefined) {
				return undefined;
			}
			var InstancesOfVO = (oPreData.cI == undefined ? this.m_Scene.m_PreassembledData.base[this.m_nPreDataIndex] : this.m_Scene.m_PreassembledData.clust[oPreData.cI]);

			return InstancesOfVO[oPreData.i];
		};

		this.GetInternalIndex = function(BBIndex) {
			if (this.bUsePreData) {
				return this.m_BBRefs[BBIndex];
			}
			return BBIndex;
		};

		this.getTooltip = function(ctx, hitObj) {
			this.m_DataSource.Select(this.GetDataIndex(hitObj.m_Index));
			// var test = this.m_DataSource.GetIndexedElement(ctx, this.GetDataIndex(hitObj.m_Index));
			return this.m_Tooltip.GetValueString(ctx);
		};

		this.DesignBoxSize = VBI.Utilities.SceneBindDesignSpotBoxSize.bind(this);
	};
	VBI.VisualObjects.Spot.prototype = VBI.VisualObjects.Base;

	// ........................................................................//
	// route object...........................................................//

	VBI.VisualObjects.Route = function() {
		this.m_LP = []; // array of line point arrays...........//

		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load.call(this, dat, ctx);

			// load bindable properties.........................................//
			this.m_Props.push(this.m_DataSource = new VBI.NodeProperty(dat, 'datasource', null, ctx));
			this.m_Props.push(this.m_Pos = new VBI.AttributeProperty(dat, 'posarray', this.m_DataSource, ctx));
			this.m_Props.push(this.m_Scale = new VBI.AttributeProperty(dat, 'scale', this.m_DataSource, ctx));
			this.m_Props.push(this.m_Color = new VBI.AttributeProperty(dat, 'color', this.m_DataSource, ctx, this.m_defaultColor));
			this.m_Props.push(this.m_Start = new VBI.AttributeProperty(dat, 'start', this.m_DataSource, ctx, 0));
			this.m_Props.push(this.m_End = new VBI.AttributeProperty(dat, 'end', this.m_DataSource, ctx, 0));
			this.m_Props.push(this.m_Tooltip = new VBI.AttributeProperty(dat, 'tooltip', this.m_DataSource, ctx, this.m_defaultTooltip));
			this.m_Props.push(this.m_LineWidth = new VBI.AttributeProperty(dat, 'linewidth', this.m_DataSource, ctx, 6.0));
			this.m_Props.push(this.m_DotColor = new VBI.AttributeProperty(dat, 'dotcolor', this.m_DataSource, ctx, this.m_defaultColor));
			this.m_Props.push(this.m_DotBorderColor = new VBI.AttributeProperty(dat, 'dotbordercolor', this.m_DataSource, ctx, this.m_defaultColor));
			this.m_Props.push(this.m_ColorBorder = new VBI.AttributeProperty(dat, 'colorBorder', this.m_DataSource, ctx, null));
			this.m_Props.push(this.m_LineDash = new VBI.AttributeProperty(dat, 'lineDash', this.m_DataSource, ctx, null));
			this.m_Props.push(this.m_DotWidth = new VBI.AttributeProperty(dat, 'dotwidth', this.m_DataSource, ctx, 0.0));
			this.m_Props.push(this.m_Tri = new VBI.AttributeProperty(dat, 'directionIndicator', this.m_DataSource, ctx, 0));

			// load shared properties...........................................//
			this.BaseLoad(dat, ctx, this);
		};

		this.DrawArrow = function(ctx, a, color, colorBorder, lft, rgt, h) {
			// First we check whether there is at least one vertex on the canvas
			if ((a.length < 3) || (Math.max(a[0][0], a[1][0], a[2][0]) < lft) || (Math.max(a[0][1], a[1][1], a[2][1]) < 0) || (Math.min(a[0][0], a[1][0], a[2][0]) > rgt) || (Math.min(a[0][1], a[1][1], a[2][1]) > h)) {
				return;
			}
			ctx.beginPath();
			ctx.moveTo(a[0][0], a[0][1]);
			ctx.lineTo(a[1][0], a[1][1]);
			ctx.lineTo(a[2][0], a[2][1]);
			ctx.lineTo(a[0][0], a[0][1]);
			ctx.closePath();
			if (colorBorder) {
				ctx.strokeStyle = colorBorder;
				ctx.lineWidth = 2;
				ctx.stroke();
			}
			ctx.fillStyle = color;
			ctx.fill();

		};

		this.CalcTriangle = function(ptStart, ptEnd, arrowlength, arrowwidth, result, bRev, bInter, nLw) {
			var dx = ptEnd[0] - ptStart[0];
			var dy = ptEnd[1] - ptStart[1];

			while ((Math.abs(dx) > 1000.0) && (Math.abs(dy) > 1000.0)) {
				dx /= 1000.0;
				dy /= 1000.0;
			}

			var l = Math.sqrt(dx * dx + dy * dy); // length

			var ldx = (dx * arrowlength) / l; // normalize and scale
			var ldy = (dy * arrowlength) / l;

			var wdx = (dx * arrowwidth / 2) / l; // normalize and scale
			var wdy = (dy * arrowwidth / 2) / l;

			var wInterx, wIntery;
			if (bInter) {
				// we need two additional points to mark the line where the route meets the base point of the triangle
				wInterx = (dx * nLw / 2) / l; // normalize and scale
				wIntery = (dy * nLw / 2) / l;
			}
			// calc first point for array rendering.............................//
			var ptx = ptStart[0] + ldx;
			var pty = ptStart[1] + ldy;

			// we return the first index to render in the line..................//
			if (!bRev) {
				result.ta = [
					[
						ptStart[0], ptStart[1]
					], // first start pos
					[
						ptx + wdy, pty - wdx
					], // top arrow point
					[
						ptx - wdy, pty + wdx
					]
				]; // bottom arrow point

				result.pt = [
					ptx, pty, 0
				]; // base point
				if (bInter) {
					result.int = [
						[
							ptx + wIntery, pty - wInterx
						], [
							ptx - wIntery, pty + wInterx
						]
					];
				}
			} else {
				result.ta = [
					[
						ptx, pty, 0
					], // first start pos
					[
						ptStart[0] + wdy, ptStart[1] - wdx
					], // top arrow point
					[
						ptStart[0] - wdy, ptStart[1] + wdx
					]
				]; // bottom arrow point

				result.pt = [
					ptStart[0], ptStart[1]
				]; // base point
				if (bInter) {
					result.int = [
						[
							ptStart[0] + wIntery, ptStart[1] - wInterx
						], [
							ptStart[0] - wIntery, ptStart[1] + wInterx
						]
					];
				}

			}

		};

		this.getArrowLength = function(lw) {
			return (Math.min(15, lw * 5));
		};
		this.getArrowWidth = function(lw) {
			return (Math.min(Math.max(8, lw * 3), lw + 8));
		};

		this.CalcArrowIntermediate = function(aLinePoints, ptStart, nOffset, linewidth, start, end, bBorder) {
			var pt1 = ptStart;
			var bRet = false;
			var off = nOffset;
			var arrowwidth = this.getArrowWidth(linewidth);
			var arrowlength = this.getArrowLength(linewidth);
			var arrowlengthQ = arrowlength * arrowlength;
			var count = 0;// counters
			var tdx, tdy, dist;
			var ptXyz = [
				0, 0, 0
			];
			var result;
			var nJ;

			dist = 0;
			if (start) {
				result = {};
				count = 0;
				for (nJ = off; nJ < aLinePoints.length; ++nJ) {
					ptXyz = aLinePoints[nJ];
					tdx = pt1[0] - ptXyz[0];
					tdy = pt1[1] - ptXyz[1];
					dist = tdx * tdx + tdy * tdy;
					if (dist > arrowlengthQ) {
						this.CalcTriangle(pt1, ptXyz, arrowlength, arrowwidth, result, false, bBorder, linewidth);
						aLinePoints.m_aArrows.push(result);
						bRet = true;
						break;
					} else {
						count++; // count the points to be removed from the array
					}
				}
				if (result.pt) {
					// finally remove the points between arrow head and base from the array and add the new points ( arrowhead and base )
					aLinePoints.splice(off, count, pt1, result.pt);
					off = off + 2;
					pt1 = result.pt;
				}
			}
			if (end) {
				// calculate the next offset where to start
				var bS = true;
				var tmp1 = pt1;
				var tmp2 = aLinePoints[off];
				var w = this.getArrowWidth(linewidth);
				var tl = 0;
				var l;
				pt1 = [];
				while (bS && off < aLinePoints.length) {
					tdx = (tmp2[0] - tmp1[0]);
					tdy = (tmp2[1] - tmp1[1]);
					l = Math.sqrt(tdx * tdx + tdy * tdy);
					if (tl + l > w) {
						bS = false;
						// calculate intermediate point
						var tx = tdx / (tl + l) * w;
						var ty = tdy / (tl + l) * w;
						pt1 = [
							tmp1[0] + tx, tmp1[1] + ty, 0
						];
					} else {
						tl += l;
						off++;
						tmp1 = tmp2;
						tmp2 = aLinePoints[off];
					}
				}
				if (pt1.length) {
					result = {};
					count = 0;
					for (nJ = off; nJ < aLinePoints.length; ++nJ) {
						ptXyz = aLinePoints[nJ];
						tdx = pt1[0] - ptXyz[0];
						tdy = pt1[1] - ptXyz[1];
						dist = tdx * tdx + tdy * tdy;
						if (dist > arrowlengthQ) {
							this.CalcTriangle(pt1, ptXyz, arrowlength, arrowwidth, result, true, bBorder, linewidth);
							aLinePoints.m_aArrows.push(result);
							bRet = true;
							break;
						} else {
							count++; // count the points to be removed from the array
						}
					}
					if (result.pt) {
						// finally remove the points between arrow head and base from the array and add the new points ( arrowhead and base )
						aLinePoints.splice(off, count, pt1, [
							result.ta[0][0], result.ta[0][1], 0
						]);
						off = off + 2;
					}
				}
			}

			if (bRet) {
				return off - 1;
			}
			return -1;
		};

// this.CalcArrowIntermediate = function(aLinePoints, ptStart, nOffset, linewidth, start, end, bBorder) {
// var pt1 = ptStart;
// var bRet = false;
// var off = nOffset;
// var arrowwidth = this.getArrowWidth(linewidth);
// var arrowlength = this.getArrowLength(linewidth);
// var arrowlengthQ = arrowlength * arrowlength;
// var count = 0;// counters
// var tdx, tdy, dist;
// var ptXyz = [
// 0, 0, 0
// ];
// var result;
//
// dist = 0;
// if (start) {
// result = {};
// count = 0;
// for (var nJ = off; nJ < aLinePoints.length; ++nJ) {
// ptXyz = aLinePoints[nJ];
// tdx = pt1[0] - ptXyz[0];
// tdy = pt1[1] - ptXyz[1];
// dist = tdx * tdx + tdy * tdy;
// if (dist > arrowlengthQ) {
// this.CalcTriangle(pt1, ptXyz, arrowlength, arrowwidth, result, false);
// aLinePoints.m_aArrows.push(result);
// bRet = true;
// break;
// } else {
// count++; // count the points to be removed from the array
// }
// }
// if (result.pt) {
// // finally remove the points between arrow head and base from the array and add the new points ( arrowhead and base )
// aLinePoints.splice(off, count, pt1, result.pt);
// off = off + 2;
// if (end) {
// if (bBorder) {
// // one pixel ahead to adjust the second triangle due to border!!
// tdx = (result.pt[0] - pt1[0]) / arrowlength * (arrowlength + 1);
// tdy = (result.pt[1] - pt1[1]) / arrowlength * (arrowlength + 1);
// pt1[0] += tdx;
// pt1[1] += tdy;
// } else {
// pt1 = result.pt;
// }
// }
// }
// }
// if (end) {
// result = {};
// count = 0;
// for (var nJ = off; nJ < aLinePoints.length; ++nJ) {
// ptXyz = aLinePoints[nJ];
// tdx = pt1[0] - ptXyz[0];
// tdy = pt1[1] - ptXyz[1];
// dist = tdx * tdx + tdy * tdy;
// if (dist > arrowlengthQ) {
// this.CalcTriangle(pt1, ptXyz, arrowlength, arrowwidth, result, true);
// aLinePoints.m_aArrows.push(result);
// bRet = true;
// break;
// } else {
// count++; // count the points to be removed from the array
// }
// }
// if (result.pt) {
// // finally remove the points between arrow head and base from the array and add the new points ( arrowhead and base )
// aLinePoints.splice(off, count, pt1, [
// result.ta[0][0], result.ta[0][1], 0
// ]);
// off = off + 2;
// }
// }
//
// if (bRet) {
// return off - 1;
// }
// return -1;
// };

		this.CalcArrow = function(pointarray, lt, rb, linewidth, reverse, result) {
			var arrowwidth = this.getArrowWidth(linewidth);
			var arrowlength = this.getArrowLength(linewidth);
			var nItems = pointarray.length / 3;

			var tdx, tdy, dist = arrowlength * arrowlength; // quad distance
			// first check bounding box, whether further checks make sense at all
			if (((tdx = (lt[0] - rb[0])) * tdx + (tdy = (lt[1] - rb[1])) * tdy) < dist) {
				return false;
			}

			var nJ, nOffset; // counters
			var start, xyz = [
				0, 0, 0
			]; // positions
			var bFound = false;

			// determine the start point........................................//
			nOffset = reverse ? 3 * (nItems - 1) : 0;
			start = [
				pointarray[nOffset], pointarray[nOffset + 1], 0.0
			];

			// iterate dependent on reverse flag................................//
			var nEnd = 3 * nItems;
			for (nJ = 3; nJ < nEnd; nJ += 3) {
				nOffset = reverse ? nEnd - 3 - nJ : nJ;
				xyz = [
					pointarray[nOffset], pointarray[nOffset + 1], 0.0
				];

				// when the distance is too small between projected points.......//
				// skip rendering................................................//
				if (((tdx = (start[0] - xyz[0])) * tdx + (tdy = (start[1] - xyz[1])) * tdy) > dist) {
					bFound = true;
					break;
				}
			}

			if (!bFound) {
				return false; // makes no sense to render an arrow..//
			}

			this.CalcTriangle(start, xyz, arrowlength, arrowwidth, result, false, false, 0);
			result.idx = nOffset;

			return true;
		};

		this.CalculateLabelPos = function(scene, pointarray, offset) {
			var pts = VBI.Utilities.GetMidpointsForLine(pointarray.pa, offset, scene.GetViewport());
			return pts.aPos;
		};

		this.LassoSelect = function(aPos, hits, orgHits) {
			var pointList, routePt, aOff;
			var bFound = false;
			for (var nJ = this.m_LP.length - 1; nJ >= 0; --nJ) {
				pointList = this.m_LP[nJ];
				aOff = this.m_IO[nJ];
				var bEnclosed = false;
				for (var nL = 0; nL < aOff.length; ++nL) {
					if (bEnclosed) {
						break;
					}
					for (var nK = 0; nK < pointList.length; ++nK) {
						routePt = pointList[nK];
						if (!(bEnclosed = VBI.Utilities.pointInPolygon(aPos, routePt[0] + aOff[nL], routePt[1]))) {
							break;
						}
					}
				}
				if (bEnclosed) {
					hits.push(nJ);
					orgHits.push(nJ);
					bFound = true;
				}
			}
			return bFound;
		};

		this.RenderInstance = function(nIndex, dc, bHot, ctx) {
			var zzf = this.m_Scene.GetZoomFactor4Mode();

			// create a subarray linepoints...............................//
			this.m_LP[nIndex] = [];

			// create design handlearrays.................................//
			// they are filled in the render step.........................//
			var editMode;
			if (this.IsPosChangeable(ctx)) {
				// tag the array with the current mode.....................//
				this.m_DH[nIndex] = [];
				if (this.IsHandleMode()) {
					editMode = VBI.EMHandle;
				} else if (this.IsBoxMode()) {
					editMode = VBI.EMBox;
				}
			}
			var bSelected = this.IsSelected(ctx);

			// render the instance........................................//
			var pa = this.m_Pos.GetValueVector(ctx);

			var scene = this.m_Scene;
			if (pa.cache == undefined) {
				scene.FillPositionCache(pa);
			}

			var col = this.m_Color.GetValueColor(ctx);
			if (bSelected) {
				col = this.GetSelectColor(ctx, col);
			}
			if (bHot) {
				col = this.GetHotColor(ctx, col);
			}
			var start = this.m_Start.GetValueLong(ctx);
			var end = this.m_End.GetValueLong(ctx);
			var tri = this.m_Tri.GetValueLong(ctx);

			var linewidth = this.m_LineWidth.GetValueFloat(ctx);
			if (bHot) {
				linewidth *= (this.GetHotScale(ctx))[0];
			}
			var dotcolor = this.m_DotColor.GetValueColor(ctx);
			if (bSelected) {
				dotcolor = this.GetSelectColor(ctx, dotcolor);
			}
			if (bHot) {
				dotcolor = this.GetHotColor(ctx, dotcolor);
			}
			var dotbordercolor = this.m_DotBorderColor.GetValueColor(ctx);
			var colorBorder = this.m_ColorBorder.GetValueColor(ctx);
			if (bSelected) {
				dotbordercolor = this.GetSelectColor(ctx, dotbordercolor);
				colorBorder = this.GetSelectColor(ctx, colorBorder);
			}
			if (bHot) {
				dotbordercolor = this.GetHotColor(ctx, dotbordercolor);
				colorBorder = this.GetHotColor(ctx, colorBorder);
			}
			var lineDash = this.m_LineDash.GetValueString(ctx);
			var dotwidth = this.m_DotWidth.GetValueFloat(ctx);

			var label = this.GetLabel(ctx);

			// var lt = scene.GetPointFromUCSPoint(pa.cache.lt);
			// var rb = scene.GetPointFromUCSPoint(pa.cache.rb);

			// determine the nearest position array.............................//
			// and the instance ofsets..........................................//
			var apos = scene.GetNearestPosArray(pa);

			// due y maps are positive in top direction there is a cross over of//
			// of min and max values............................................//
			var lt = scene.GetPointFromPos([
				apos.m_MinX, apos.m_MaxY, 0.0
			], false);
			var rb = scene.GetPointFromPos([
				apos.m_MaxX, apos.m_MinY, 0.0
			], false);

			// determine the instance offsets and store bounds..................//
			var border = Math.max(linewidth, dotwidth / 2);
			var aIO = this.m_IO[nIndex] = scene.GetCorrectedInstanceOffsets(this.m_BB[nIndex] = [
				lt[0] - border, lt[1] - border, rb[0] + border, rb[1] + border
			], zzf);
			if (aIO.length) {
				var pointarray = scene.GetPointArrayFromUCSArray(pa.cache.data);
				if (editMode != undefined) {
					this.m_DH[nIndex] = this.FillDesignHandles(pointarray, editMode, nIndex);
				}
				for (var nJ = 0, len = aIO.length; nJ < len; ++nJ) {
					dc.setTransform(1, 0, 0, 1, aIO[nJ], 0);
					this.RenderRoute(nIndex, dc, pointarray, lt, rb, col, start, end, tri, linewidth, dotcolor, dotbordercolor, colorBorder, lineDash, dotwidth, aIO[nJ]);

					// draw the bounding box.........................................//
					if (VBI.m_bTrace) {
						VBI.Utilities.DrawFrameRect(dc, "red", this.m_BB[nIndex]);
					}
				}
				dc.setTransform(1, 0, 0, 1, 0, 0);
				if (label) {
					var positions = {
						pa: pointarray,
						bb: [
							lt, rb
						]
					};
					this.m_Label.push(new VBI.Label(label, nIndex, this.CalculateLabelPos, positions, null, aIO));
				}
			}
		};

		this.FillDesignHandles = function(pointarray, editMode, nIndex) {
			var aHandlePoints = []; // designhandle array...//

			// in design mode we push all points to the design handle array.....//
			// checking the array ensures that we do not add the handles twice..//
			// in round world situation.........................................//
			if (editMode == VBI.EMHandle) {
				var hLen = pointarray.length;
				for (var nJ = 0; nJ < hLen; nJ += 3) {
					aHandlePoints.push([
						pointarray[nJ], pointarray[nJ + 1]
					]);
				}
			} else if (editMode == VBI.EMBox) {
				aHandlePoints.push(this.m_BB[nIndex]);
			}
			aHandlePoints.m_EditMode = editMode;

			return aHandlePoints;
		};

		this.RenderRoute = function(nIndex, dc, pointarray, lt, rb, color, start, end, triangles, linewidth, dotcolor, dotbordercolor, colorBorder, lineDash, dotwidth, iO) {
			if (pointarray.length < 6) {
				return;
			}
			var xMin = -iO, xMax = dc.canvas.m_pixelWidth - iO, yMax = dc.canvas.m_pixelHeight;
			var bRouteCompletelyOnCanvas = ((lt[0] > xMin) && (lt[1] > 0) && (rb[0] < xMax) && (rb[1] < yMax));

			var aLinePoints = this.m_LP[nIndex]; // linepoint array......//
			var nStart = 3, nEnd = pointarray.length - 3;
			var bCollectLPs = aLinePoints.length ? false : true;

			// calculate the triangles at the end...............................//
			var rs = {}, re = {};

			if (linewidth && start && this.CalcArrow(pointarray, lt, rb, linewidth, false, rs)) {
				this.DrawArrow(dc, rs.ta, color, colorBorder, xMin, xMax, yMax);
				nStart = rs.idx;
				if (bCollectLPs) {
					aLinePoints.m_RS = rs; // append start arrow info to linepoints array
				}
			}
			if (linewidth && end && this.CalcArrow(pointarray, lt, rb, linewidth, true, re)) {
				this.DrawArrow(dc, re.ta, color, colorBorder, xMin, xMax, yMax);
				nEnd = re.idx;
				if (bCollectLPs) {
					aLinePoints.m_RE = re; // append end arrow info to linepoints array
				}
			}

			if (bCollectLPs) {
				this.CollectLinePoints(pointarray, aLinePoints, nStart, nEnd, start, end, triangles, rs, re, linewidth, iO, colorBorder ? true : false);
			}

			var bLineDashed = this.CheckLineDashing(lineDash, dc);

			if (linewidth) {
				this.DrawActualRoute(dc, aLinePoints, color, colorBorder, linewidth, bRouteCompletelyOnCanvas, xMin, xMax, yMax);
			}

			if (dotwidth) { // render the dotpoints when required...............................//
				this.DrawRouteDots(dc, aLinePoints, start, end, dotcolor, dotbordercolor, dotwidth / 2.0, bRouteCompletelyOnCanvas, xMin, xMax, yMax);
			}

			if (bLineDashed) {
				dc.setLineDash([]); // reset the dashing again to non dashed lines to not interfere with other object instances
			}

			if (aLinePoints.m_aArrows && aLinePoints.m_aArrows.length) {
				for (var nJ = 0; nJ < aLinePoints.m_aArrows.length; ++nJ) {
					this.DrawArrow(dc, aLinePoints.m_aArrows[nJ].ta, color, colorBorder, xMin, xMax, yMax);
					if (aLinePoints.m_aArrows[nJ].int) {
						var a = aLinePoints.m_aArrows[nJ].int;
						dc.beginPath();
						dc.moveTo(a[0][0], a[0][1]);
						dc.lineTo(a[1][0], a[1][1]);
						dc.strokeStyle = color;
						dc.lineWidth = 2;
						dc.stroke();
					}
				}
			}
		};

		this.CollectLinePoints = function(pointarray, aLinePoints, nStart, nEnd, start, end, triangles, rs, re, linewidth, iO, hasBorderCol) {
			var sqdistance = Math.min(linewidth * linewidth / 2, 4); // limit distance to avoid rendering artefacts with big lines
			// var rc = this.m_Scene.m_Canvas[this.m_Scene.m_nOverlayIndex].getBoundingClientRect();
			var rc = this.m_Scene.GetViewport();

			aLinePoints.m_aArrows = [];
			var s = rs.pt ? [
				rs.pt[0], rs.pt[1], 0.0
			] : [
				pointarray[0], pointarray[1], 0.0
			];
			var e = re.pt ? [
				re.pt[0], re.pt[1], 0.0
			] : [
				pointarray[nEnd], pointarray[nEnd + 1], 0.0
			];
			var tdx, tdy, xyz, tmp = s;
			aLinePoints.push(tmp);

			for (var nJ = nStart; nJ <= nEnd; nJ += 3) {
				xyz = [
					pointarray[nJ], pointarray[nJ + 1], 0.0
				];

				// render only when distance is big enough between projected points.......//
				if (((tdx = (tmp[0] - xyz[0])) * tdx + (tdy = (tmp[1] - xyz[1])) * tdy) > sqdistance) {
					aLinePoints.push(xyz);
					tmp = xyz;
				}
			}
			if (re.pt) {
				aLinePoints.push(re.pt);
			}
			if ((start || end) && triangles && linewidth && this.CheckTriangleRendering()) {
				if (!(s[0] >= rc[0] && s[0] <= rc[2] && s[1] >= rc[1] && s[1] <= rc[3] && e[0] >= rc[0] && e[0] <= rc[2] && e[1] >= rc[1] && e[1] <= rc[3])) {
					this.CalculateRouteArrows(aLinePoints, start, end, linewidth, iO, hasBorderCol);
				}
			}
		};

		this.CheckTriangleRendering = function() {
			var scene = this.m_Scene;
			var eLod = scene.m_Canvas[0].m_nExactLOD;
			return (scene.m_bNonIntPosStable || eLod == Math.floor(eLod) || eLod <= (scene.m_CacheVars.minLOD + 0.01));
		};

		this.CheckLineDashing = function(lineDash, dc) {
			// set non-dashed line first
			var scene = this.m_Scene;
			var eLod = scene.m_Canvas[0].m_nExactLOD;
			if (lineDash && dc.setLineDash && (scene.m_bNonIntPosStable || eLod == Math.floor(eLod) || eLod <= (scene.m_CacheVars.minLOD + 0.01))) {
				var ld = lineDash.split(";");
				dc.setLineDash(ld);
				// dc.lineDashOffset++;
				return true;
			}
			return false;
		};

		this.DrawActualRoute = function(dc, aLinePoints, color, colorBorder, linewidth, bRouteCompletelyOnCanvas, xMin, xMax, yMax) {
			// check if route border => draw the route border first
			if (colorBorder) {
				dc.strokeStyle = colorBorder;
				dc.lineWidth = linewidth + 2;
				dc.lineJoin = 'round';
				dc.lineCap = 'butt';
			} else {
				dc.strokeStyle = color;
				dc.lineWidth = linewidth;
				dc.lineJoin = dc.lineCap = 'round';
			}

			var bPathNotYetBegan = true;

			if (bRouteCompletelyOnCanvas) { // everything on canvas so let's omit all the checks and simply paint

				dc.beginPath();
				bPathNotYetBegan = false;
				dc.moveTo((aLinePoints[0])[0], (aLinePoints[0])[1]);
				for (var nJJ = 1; nJJ < aLinePoints.length; ++nJJ) {
					dc.lineTo((aLinePoints[nJJ])[0], (aLinePoints[nJJ])[1]);
				}

			} else {

				var q0, q1;
				var tr = this.m_Scene.m_TransitionTable;
				var tr_result;
				var bLastNotYetMoved = true;
				var xyz, tmp = aLinePoints[0];

				// Calculate Quarter of predecessor point
				if (tmp[1] < 0) {
					q0 = 3;
				} else {
					q0 = tmp[1] > yMax ? 6 : 0;
				}
				if (tmp[0] < xMin) {
					q0++;
				} else {
					q0 += (tmp[0] > xMax ? 2 : 0);
				}

				for (var nJ = 1; nJ < aLinePoints.length; ++nJ) {
					xyz = aLinePoints[nJ];
					if (xyz[1] < 0) { // calc quarter of current point
						q1 = 3;
					} else {
						q1 = xyz[1] > yMax ? 6 : 0;
					}
					if (xyz[0] < xMin) {
						q1++;
					} else {
						q1 += (xyz[0] > xMax ? 2 : 0);
					}
					tr_result = tr[q0 + 9 * q1]; // line can/must/does not cross canvas?
					if (tr_result == 1 || (tr_result > 1 && this.Check4Intersect(tmp, xyz, tr_result, xMin, xMax, 0, yMax))) {
						if (bPathNotYetBegan) {
							dc.beginPath();
							bPathNotYetBegan = false;
						}
						if (bLastNotYetMoved) {
							dc.moveTo(tmp[0], tmp[1]);
						}
						dc.lineTo(xyz[0], xyz[1]);
						bLastNotYetMoved = false;
					} else {
						bLastNotYetMoved = true;
						tmp = xyz;
					}
					q0 = q1;
				}
			}

			if (!bPathNotYetBegan) {
				dc.stroke();

				// if there is border color => draw the original route on top of the route border
				if (colorBorder) {
					dc.strokeStyle = color;
					dc.lineWidth = linewidth;
					dc.stroke();
				}
			}
		};

		this.Check4Intersect = function(p1, p2, tr_result, xMin, xMax, yMin, yMax) {
			// function checks for intersections of p1->p2 with canvas under
			// certain preconditions pre-evaluated accordint to tr_result
			// (see scene.BuildQuarterTransactionTable for this)
			var xCut, yCut, comp;
			var deltaX = p2[0] - p1[0]; // both values are definitely <> 0
			var deltaY = p2[1] - p1[1]; // as otherwise this Check won't be called

			if (tr_result & 20) { // top edge or bottom edge (but not both)
				comp = (tr_result & 4) ? yMax : yMin;
				yCut = (p2[1] - comp) / deltaY;
				xCut = p2[0] - deltaX * yCut;
				if ((xCut >= xMin) && (xCut <= xMax)) {
					return true;
				}
			}

			if (tr_result & 10) { // left edge or right edge (but not both)
				comp = (tr_result & 2) ? xMin : xMax;
				xCut = (p2[0] - comp) / deltaX;
				yCut = p2[1] - deltaY * xCut;
				if ((yCut >= yMin) && (yCut <= yMax)) {
					return true;
				}
			}

			return false;
		};

		this.DrawRouteDots = function(dc, aLinePoints, start, end, dotcolor, dotbordercolor, r, bRouteCompletelyOnCanvas, xMin, xMax, yMax) {
			dc.fillStyle = dotcolor;
			dc.strokeStyle = dotbordercolor;
			dc.lineWidth = 1;
			var firstDot = start ? 1 : 0;
			var lastDot = aLinePoints.length - (end ? 2 : 1);
			var zwoPi = 2.0 * Math.PI;
			for (var nJ = firstDot; nJ <= lastDot; ++nJ) {
				var xyz = aLinePoints[nJ];
				if (bRouteCompletelyOnCanvas || ((xyz[0] - r > xMin) && (xyz[0] + r < xMax) && (xyz[1] - r > 0) && (xyz[1] + r < yMax))) {
					// fill arc...................................................//
					dc.beginPath();
					dc.arc(xyz[0], xyz[1], r, 0, zwoPi);
					dc.closePath();
					dc.fill();
					dc.stroke();
				}
			}
		};

		this.CalculateRouteArrows = function(aLinePoints, start, end, linewidth, iO, bBorder) {
			// collect linepoints and calculate midarrows
			var intermediateDistArrow = 250; // the distance between intermediate arrows
			var fSegLength = 0;
			var flength = 0;
			var tdx, tdy, nOffset, delta;
			var width = this.m_Scene.m_Canvas[this.m_Scene.m_nOverlayIndex].width;
			var height = this.m_Scene.m_Canvas[this.m_Scene.m_nOverlayIndex].height;
			var rc = [
				-iO, 0, -iO + width, height
			];
			var bRet = false;
			var bLeaving = false;
			var bLoop = true;
			var pt1 = aLinePoints[0];
			var pt2 = aLinePoints[1];
			nOffset = 1;
			while (bLoop) {
				if (pt1 == undefined || pt2 == undefined) {
					if (VBI.m_bTrace) {
						VBI.Trace("Wrong offset in CalculateRouteArrows");
					}
					break;
				}
				bRet = VBI.Utilities.LineIntersectRect(pt1[0], pt1[1], pt2[0], pt2[1], rc);
				if (bRet.bReturn == false) {
					bLeaving = false;
					fSegLength = 0;
					nOffset++;
					if (nOffset < aLinePoints.length) {
						pt1 = pt2;
						pt2 = aLinePoints[nOffset];
					} else {
						bLoop = false;
					}
				} else {
					if (bRet.x0 != pt1[0] || bRet.y0 != pt1[1]) {
						pt1 = [
							bRet.x0, bRet.y0, 0
						];
						aLinePoints.splice(nOffset, 0, pt1);
						nOffset++;
						bLeaving = false;
					}
					if (bRet.x1 != pt2[0] || bRet.y1 != pt2[1]) {
						if (bRet.x1 == pt1[0] && bRet.y1 == pt1[1] && bLeaving) {
							nOffset += 2;
							if (nOffset < aLinePoints.length) {
								pt1 = aLinePoints[nOffset - 1];
								pt2 = aLinePoints[nOffset];
								bLeaving = false;
							} else {
								bLoop = false;
							}
						} else {
							pt2 = [
								bRet.x1, bRet.y1, 0
							];
							aLinePoints.splice(nOffset, 0, pt2);
							bLeaving = true;
						}

					}
					tdx = (pt2[0] - pt1[0]);
					tdy = (pt2[1] - pt1[1]);

					// collect the indices where to place intermediate arrowheads
					delta = Math.sqrt(tdx * tdx + tdy * tdy);
					flength += delta;
					if (fSegLength + delta > intermediateDistArrow) {
						// calculate intermediate point
						var tx = tdx / delta * (intermediateDistArrow - fSegLength);
						var ty = tdy / delta * (intermediateDistArrow - fSegLength);
						var pt = [
							pt1[0] + tx, pt1[1] + ty, 0
						];
						var newOff = this.CalcArrowIntermediate(aLinePoints, pt, nOffset, linewidth, start, end, bBorder);
						if (newOff >= 0) {
							nOffset = newOff + 1;
							pt1 = aLinePoints[newOff];
							pt2 = aLinePoints[nOffset];
							fSegLength = 0;
						} else {
							bLoop = false;
						}
					} else {
						fSegLength += delta;
						nOffset++;
						if (nOffset < aLinePoints.length) {
							pt1 = pt2;
							pt2 = aLinePoints[nOffset];
						} else {
							bLoop = false;
						}
					}
				}
			}
		};

		this.Init4Render = this.StandardInitWithLPs;

		// Route.Render with respect to data binding.................................//
		this.Render = function(canvas, dc, clusterData) {
			// clear bounding boxes and index offsets and linepoints and design.//
			// handles and labels for all instances ............................//

			// get scene and design mode........................................//
			var scene = this.m_Scene;
			var ctx = scene.m_Ctx;

			// determine the binding information................................//
			var node;
			var hotIndex;
			if ((node = this.m_DataSource.GetCurrentNode(ctx))) {
				// the element count determines the number of rendered instances.//
				for (var nJ = 0, len = node.m_dataelements.length; nJ < len; ++nJ) {
					this.m_DataSource.Select(nJ);
					if (this.IsHot(nJ)) {
						hotIndex = nJ;
					} else {
						this.RenderInstance(nJ, dc, false, ctx);
					}
					// Route: open or close RichTooltip based on VO instance hotness
					this.SetRichTooltip(this.IsHot(nJ));
				}
			}
			// check: do single instance rendering in else branch ................//

			if (hotIndex != undefined) {
				this.m_DataSource.Select(hotIndex);
				this.RenderInstance(hotIndex, dc, true, ctx);
			}

			// call base rendering method.......................................//
			this.BaseRender(canvas, dc);
		};

		this.DetailHitDot = function(nsx, nsy, x0, y0, sqrad) {
			// check if distance is fitting..................................//
			var tdx, tdy;
			return (((tdx = (x0 - nsx)) * tdx + (tdy = (y0 - nsy)) * tdy) < sqrad) ? true : false;
		};

		this.DetailHitTest = function(ocb, nIndex, nsx, nsy) {
			var x0, y0, x1, y1;

			this.m_DataSource.Select(nIndex);
			var linerad = this.m_LineWidth.GetValueLong(this.m_Scene.m_Ctx) / 2; // half of the thickness of the line
			var dotrad = this.m_DotWidth.GetValueLong(this.m_Scene.m_Ctx) / 2; // half of the thickness of the line
			var sqlinerad = linerad * linerad; // square of half of the thickness of the line
			var sqdotrad = dotrad * dotrad; // square of dot radius

			var aLP = this.m_LP[nIndex];

			// get first linepoint..............................................//
			x0 = aLP[0][0];
			y0 = aLP[0][1];

			// check first dot..................................................//
			if (sqdotrad && this.DetailHitDot(nsx, nsy, x0, y0, sqdotrad)) {
				return {
					m_hit: 1,
					m_dot: 0
				};
			}

			var nCount = aLP.length;
			var nK;
			for (nK = 1; nK < nCount; ++nK) {
				x1 = aLP[nK][0];
				y1 = aLP[nK][1];

				// check wether a waypoint is hit................................//

				// check if not outside segment box and continue.................//
				if (linerad && !((nsx < (Math.min(x0, x1) - linerad)) || // outside left
				(nsx > (Math.max(x0, x1) + linerad)) || // outside right
				(nsy < (Math.min(y0, y1) - linerad)) || // outside top
				(nsy > (Math.max(y0, y1) + linerad)) // outside bottom
				) && (sqlinerad > VBI.Utilities.sqDistance(x0, y0, x1, y1, nsx, nsy))) {
					if (VBI.m_bTrace) {
						VBI.Trace("VBI.VisualObjects.Route hit line " + nIndex);
					}
					return {
						m_hit: 1
					}; // true hit, todo: diffuse hits
				}

				// check first dot...............................................//
				if (sqdotrad && this.DetailHitDot(nsx, nsy, x1, y1, sqdotrad)) {
					if (VBI.m_bTrace) {
						VBI.Trace("VBI.VisualObjects.Route hit dot " + nIndex);
					}
					return {
						m_hit: 1,
						m_dot: nK
					}; // true hit, todo: diffuse hits
				}

				// set positions for the next iteration..........................//
				x0 = x1;
				y0 = y1;
			}

			// check the arrows.................................................//
			// intermediate triangles
			if (aLP.m_aArrows) {
				nCount = aLP.m_aArrows.length;
				for (nK = 0; nK < nCount; ++nK) {
					if (VBI.Utilities.pointInTriangle(aLP.m_aArrows[nK].ta, [
						nsx, nsy
					])) {
						return {
							m_hit: 1
						};
					}
				}
			}
			if (aLP.m_RS && VBI.Utilities.pointInTriangle(aLP.m_RS.ta, [
				nsx, nsy
			])) {
				return {
					m_hit: 1,
					m_arrow: 0
				}; // true start arrow hit, todo: diffuse hits
			}
			if (aLP.m_RE && VBI.Utilities.pointInTriangle(aLP.m_RE.ta, [
				nsx, nsy
			])) {
				return {
					m_hit: 1,
					m_arrow: 1
				}; // true end arrow is hit, todo: diffuse hits
			}
			return null; // no hit
		};

		this.GetHitArray = function(x, y, all) {
			// determine the array of instances that are hit
			// x and y are the canvas relative coordinates
			// all is set when hit test for all instances needed
			var ocb = {
				m_cb: this.DetailHitTest.bind(this),
				m_All: all
			};
			var zsf = this.m_Scene.GetStretchFactor4Mode();
			// bounding boxes are defined always in non stretched canvas
			// coordinates, therefore transform them
			var nsx = x / zsf[0];
			var nsy = y / zsf[1];
			// call base function for bounds check..............................//
			return this.BaseHitTest(nsx, nsy, ocb);
		};

		// design overridden members...........................................//
		this.DesignBoxSize = VBI.Utilities.SceneBindPosArrayDesignBoxSize.bind(this);
	};
	VBI.VisualObjects.Route.prototype = VBI.VisualObjects.Base;

	// ........................................................................//
	// circle object..........................................................//

	VBI.VisualObjects.Circle = function() {
		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load.call(this, dat, ctx);

			// load circle data.................................................//
			this.m_Props.push(this.m_DataSource = new VBI.NodeProperty(dat, 'datasource', null, ctx));
			this.m_Props.push(this.m_Pos = new VBI.AttributeProperty(dat, 'pos', this.m_DataSource, ctx));
			this.m_Props.push(this.m_ColorBorder = new VBI.AttributeProperty(dat, 'colorBorder', this.m_DataSource, ctx, this.m_defaultColor));
			this.m_Props.push(this.m_Radius = new VBI.AttributeProperty(dat, 'radius', this.m_DataSource, ctx, 5));
			this.m_Props.push(this.m_Tooltip = new VBI.AttributeProperty(dat, 'tooltip', this.m_DataSource, ctx, this.m_defaultTooltip));
			this.m_Props.push(this.m_Color = new VBI.AttributeProperty(dat, 'color', this.m_DataSource, ctx, this.m_defaultColor));
			this.m_Props.push(this.m_Slices = new VBI.AttributeProperty(dat, 'slices', this.m_DataSource, ctx, 10));
			this.m_Props.push(this.m_AltColorBorder = new VBI.AttributeProperty(dat, 'altBorderDeltaColor', this.m_DataSource, ctx, null));

			// load shared properties...........................................//
			this.BaseLoad(dat, ctx, this);
		};

		this.CalculateLabelPos = function(scene, pointarray, offset) {

			var pt = VBI.Utilities.GetMidpointForPolygon(pointarray.pa, pointarray.bb, offset, scene.GetViewport());
			if (pt && pt.aPos) {
				return pt.aPos;
			}
			return null;
		};

		this.LassoSelect = this.LassoSelectCircle;

		// render the single instance..........................................//
		this.RenderInstance = function(nIndex, dc, pos, color, colorBorder, radius, slices, label) {
			var scene = this.m_Scene;
			var nJ;
			// correct zoom factor..............................................//
			var zsf = scene.GetStretchFactor4Mode();
			var zzf = scene.GetZoomFactor4Mode();
			var r = radius / zsf[0];

			// get the center point and calculate the bounds....................//
			var xy = scene.GetPointFromPos(pos, false);

			// determine the instance offsets...................................//
			var bb;
			var aIO = this.m_IO[nIndex] = scene.GetCorrectedInstanceOffsets(bb = this.m_BB[nIndex] = [
				xy[0] - r, xy[1] - r, xy[0] + r, xy[1] + r
			], zzf);
			bb.m_Radius = r; // remember radius at the boundingbox
			bb.m_Pos = xy; // remember position at the boundingbox

			// fill design handle information...................................//
			if (this.IsPosChangeable(scene.m_Ctx)) {
				var aDH = (this.m_DH[nIndex] = []);
				if (this.IsHandleMode()) {
					aDH.m_EditMode = VBI.EMHandle;
					aDH.push(xy);
				} else if (this.IsBoxMode()) {
					aDH.m_EditMode = VBI.EMBox;
					aDH.push(bb);
				}
			}

			// pixel the instance...............................................//
			dc.lineWidth = 1;
			dc.fillStyle = color;

			for (nJ = 0; nJ < aIO.length; ++nJ) {
				dc.setTransform(1, 0, 0, 1, aIO[nJ], 0);

				// fill arc......................................................//
				dc.beginPath();
				dc.arc(xy[0], xy[1], r, 0, 2 * Math.PI);
				dc.closePath();
				dc.fill();

				// draw border line..............................................//
				dc.strokeStyle = colorBorder;
				dc.stroke();

				// draw the bounding box.........................................//
				if (VBI.m_bTrace) {
					VBI.Utilities.DrawFrameRect(dc, "red", this.m_BB[nIndex]);
				}
			}
			dc.setTransform(1, 0, 0, 1, 0, 0);
			// get the points for rendering the label
			// r for radius; xy for vMiddle
// D3DVECTOR4 vPos;
// for( int nJ = 0; nJ < 20; nJ++ )
// {
// double theta = nJ * 2 * Math.PI / 20;
// vPos.x = vMiddle.x + (float)(fRadius * sin( theta ));
// vPos.y = vMiddle.y + (float)(fRadius * cos( theta ));
// vPos.z = vMiddle.z + 0.0f;
// vPos.w = 1.0f;
// vCirclePosList->push_back( vPos );
// }

			if (label && aIO.length) {

				var pta = [];
				var nSlices = 20;
				for (nJ = 0; nJ < nSlices; ++nJ) {
					var theta = nJ * 2 * Math.PI / nSlices;
					var circleX = xy[0] + r * Math.sin(theta);
					var circleY = xy[1] + r * Math.cos(theta);
					pta.push(circleX, circleY);
				}
// var lt = [bb[0],bb[1]];
// var rb = [bb[2],bb[3]];
				var positions = {
					pa: pta,
					bb: [
						[
							bb[0], bb[1]
						], [
							bb[2], bb[3]
						]
					]
				};
				this.m_Label.push(new VBI.Label(label, nIndex, this.CalculateLabelPos, positions, null, aIO));
			}

		};

		this.Init4Render = this.StandardInit;

		// Circle.Render with respect to data binding.................................//
		this.Render = function(canvas, dc, clusterData) {
			// clear bounding boxes and index offsets and design handle array...//

			// get scene .......................................................//
			var ctx = this.m_Scene.m_Ctx;
			var cntInstances = 0;

			// determine the binding information................................//
			var node;
			if ((node = this.m_DataSource.GetCurrentNode(ctx))) {
				cntInstances = node.m_dataelements.length;
				// the element count determines the number of rendered instances.//
				for (var nJ = 0; nJ < cntInstances; ++nJ) {
					this.m_DataSource.Select(nJ);

					var bHot = this.IsHot(nJ);
					var bSelected = this.IsSelected(ctx);

					var p = this.m_Pos.GetValueVector(ctx);
					var col = this.m_Color.GetValueColor(ctx);
					if (bSelected) {
						col = this.GetSelectColor(ctx, col);
					}
					if (bHot) {
						col = this.GetHotColor(ctx, col);
					}
					var cb = this.m_ColorBorder.GetValueColor(ctx);
					if (bSelected) {
						cb = this.GetSelectColor(ctx, cb);
					}
					if (bHot) {
						cb = this.GetAltBorderColor(ctx, cb);
					}
					var r = this.m_Radius.GetValueFloat(ctx);
					if (bHot) {
						r = (this.GetHotScale(ctx))[0] * r;
					}
					var s = this.m_Slices.GetValueLong(ctx);

					this.RenderInstance(nJ, dc, p, col, cb, r, s, this.GetLabel(ctx));

					// Circle: open or close RichTooltip based on VO instance hotness
					this.SetRichTooltip(bHot);
				}
			}
			// check: do single instance rendering in else branch ................//

			// call base rendering method.......................................//
			this.BaseRender(canvas, dc);

			return cntInstances; // to increase count of Scaling instances
		};

		this.DetailHitTest = function(ocb, nIndex, nsx, nsy) {
			var bb = this.m_BB[nIndex];
			var r = bb.m_Radius;
			var xy = bb.m_Pos;
			var tdx, tdy;

			// when hit distance lies within the radius, this is a hit..........//
			if (((tdx = (xy[0] - nsx)) * tdx + (tdy = (xy[1] - nsy)) * tdy) < r * r) {
				return {
					m_hit: 1
				}; // check: do diffuse hits here as well
			}

			return null; // no hit
		};

		this.GetHitArray = function(x, y, all) {
			// determine the array of instances that are hit
			// x and y are the canvas relative coordinates
			// all is set when hit test for all instances needed
			var zsf = this.m_Scene.GetStretchFactor4Mode();
			var ocb = {
				m_cb: this.DetailHitTest.bind(this),
				m_zf: zsf,
				m_All: all
			};
			var nsx = x / zsf[0];
			var nsy = y / zsf[1];
			// call base function for bounds check
			return this.BaseHitTest(nsx, nsy, ocb);
		};

		// design overridden members...........................................//
		this.DesignGetActiveBoxHandles = function(idx) {
			// only when the radius can be changed, handles are active..........//
			var scene = this.m_Scene;
			this.m_DataSource.Select(idx);
			return this.m_Radius.IsChangeable(scene.m_Ctx) ? [
				0, 1, 0, 1, 0, 1, 0, 1, 0
			] : [
				0, 0, 0, 0, 0, 0, 0, 0, 0
			];
		};

		this.DesignBoxSize = VBI.Utilities.SceneBindRadiusDesignBoxSize.bind(this);

		// event handlers......................................................//
	};
	VBI.VisualObjects.Circle.prototype = VBI.VisualObjects.Base;

	// ........................................................................//
	// CircleDist object......................................................//

	VBI.VisualObjects.CircleDist = function() {
		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load.call(this, dat, ctx);

			// load circle data.................................................//
			this.m_Props.push(this.m_DataSource = new VBI.NodeProperty(dat, 'datasource', null, ctx));
			this.m_Props.push(this.m_Pos = new VBI.AttributeProperty(dat, 'midpoint', this.m_DataSource, ctx));
			this.m_Props.push(this.m_ColBorder = new VBI.AttributeProperty(dat, 'colorBorder', this.m_DataSource, ctx, this.m_defaultColor));
			this.m_Props.push(this.m_Radius = new VBI.AttributeProperty(dat, 'radius', this.m_DataSource, ctx, 10));
			this.m_Props.push(this.m_Tooltip = new VBI.AttributeProperty(dat, 'tooltip', this.m_DataSource, ctx, this.m_defaultTooltip));
			this.m_Props.push(this.m_ColFill = new VBI.AttributeProperty(dat, 'color', this.m_DataSource, ctx, this.m_defaultColor));
			this.m_Props.push(this.m_Slices = new VBI.AttributeProperty(dat, 'slices', this.m_DataSource, ctx, 10));
			this.m_Props.push(this.m_AltColorBorder = new VBI.AttributeProperty(dat, 'altBorderDeltaColor', this.m_DataSource, ctx, null));

			// load shared properties...........................................//
			this.BaseLoad(dat, ctx, this);
		};

		this.CalculateLabelPos = function(scene, pointarray, offset) {
			var pt = VBI.Utilities.GetMidpointForPolygon(pointarray.pa, pointarray.bb, offset, scene.GetViewport());
			if (pt && pt.aPos) {
				return pt.aPos;
			}
			return null;
		};

		this.LassoSelect = function(aPos, hits, orgHits) {
			var circlePt = [];
			var aOff, theta;
			var bFound = false;
			for (var nJ = this.m_LP.length - 1; nJ >= 0; --nJ) {
				var pointList = [];
				if (this.m_BB[nJ].m_bArcCircle) {
					// consider as circle
					var xy = this.m_BB[nJ].m_Pos;
					var r = this.m_BB[nJ].m_Radius;
					var nSlices = 20;
					for (var nK = 0; nK < nSlices; ++nK) {
						theta = nK * 2 * Math.PI / nSlices;
						circlePt = [
							xy[0] + r * Math.sin(theta), xy[1] + r * Math.cos(theta)
						];
						pointList.push(circlePt);
					}
				} else {
					// consider as area
					pointList = this.m_LP[nJ];
				}
				aOff = this.m_IO[nJ];
				if (VBI.Utilities.polyInPolygon(aPos, pointList, aOff)) {
					orgHits.push(nJ);
					hits.push(nJ);
					bFound = true;
				}
			}
			return bFound;
		};

		this.RenderCircleDist = function(nIndex, dc, data, colFill, colBorder) {
			var scene = this.m_Scene;

			// get linepoints, when already collected set them to null..........//
			var aLinePoints = this.m_LP[nIndex]; // linepoint array......//
			if (aLinePoints.length) {
				aLinePoints = null;
			}

			// because radians are delivered, GetPointFromGeo must be used......//
			// this accepts radians only........................................//
			var tdx, tdy, xy, tmp = scene.GetPointFromGeo(data[0], false);
			var bArcCircle = false;
			var crC, crRad;

			// if the circle center is within 10 degrees latitude from the equator and the geo radius is small, render it with an Arc
			var ctx = this.m_Scene.m_Ctx;
			var pos = this.m_Pos.GetValueVector(ctx);
			var rad = this.m_Radius.GetValueFloat(ctx);

			// check if an arc circle can be rendered
			// limit the radius because of geo imprecision, and circle dissapear issue (the latter has to do with scene.GetCorrectedInstanceOffsets)
			bArcCircle = (Math.abs(pos[1] - 45) <= 10 && rad <= 10000) ? true : false;

			if (bArcCircle) {
				var crRadSum = 0;
				crC = scene.GetPointFromGeo(VBI.MathLib.DegToRad(pos), false); // circle center

				// find the average radius from all geo segment points
				for (var nJ = 0; nJ < data.length; ++nJ) {
					xy = scene.GetPointFromGeo(data[nJ], false);
					crRadSum += Math.sqrt((xy[0] - crC[0]) * (xy[0] - crC[0]) + (xy[1] - crC[1]) * (xy[1] - crC[1]));
				}
				crRad = crRadSum / data.length;

				// adjust the bounding box for the circle
				var bb = this.m_BB[nIndex];
				bb[1] = crC[1] - crRad;
				bb[3] = crC[1] + crRad;
				bb.m_Radius = crRad;
				bb.m_Pos = crC;
				bb.m_bArcCircle = true;
			}

// var exLod = this.m_Scene.m_Canvas[0].m_nExactLOD;
// var sqrtLod = Math.sqrt(exLod);
// var maxLod = this.m_Scene.GetMaxLOD();
// var lodFactor = (exLod + 1) * (exLod + 1) - (maxLod - exLod);

			// set the colors and styles........................................//
			dc.strokeStyle = colBorder;
			dc.fillStyle = colFill;
			dc.lineWidth = 1;

			// start rendering..................................................//
			dc.beginPath();

			if (!bArcCircle) {
				dc.moveTo(tmp[0], tmp[1]);

				if (aLinePoints) {
					aLinePoints.push(tmp); // add first line point
				}
				for (var nJJ = 1; nJJ < data.length; ++nJJ) {
					xy = scene.GetPointFromGeo(data[nJJ], false);

					// when the distance is too small between projected points.......//
					// skip rendering................................................//
					if (((tdx = (tmp[0] - xy[0])) * tdx + (tdy = (tmp[1] - xy[1])) * tdy) < 9.0) {
						continue;
					}

					if (aLinePoints) {
						aLinePoints.push(xy); // add other line points
					}
					dc.lineTo(xy[0], xy[1]);
					tmp = xy;
				}
				dc.closePath();
			} else {
				dc.arc(crC[0], crC[1], crRad, 0, 2 * Math.PI);
			}

			// stroke and fill..................................................//
			dc.stroke();
			dc.fill();
		};

		// render the single instance..........................................//
		this.RenderInstance = function(nIndex, dc, pos, colFill, colBorder, radius, slices, label) {
			var bb, scene = this.m_Scene;
			var zzf = scene.GetZoomFactor4Mode();

			// determine the positions..........................................//
			// all the math functions deliver radians...........................//

			// make the slices count a function of the circle radius and map lod
			var exLod = this.m_Scene.m_Canvas[0].m_nExactLOD;
			var sqrtLod = Math.sqrt(exLod);
			var lnRad = Math.log(radius);
			var cStep = 1 / lnRad;
			var newSlices = 2 * Math.PI / cStep;
			slices = (newSlices > slices) ? newSlices : slices;
			var finSlices = slices * sqrtLod;
			finSlices = (finSlices < 7) ? 7 : finSlices;
			finSlices = (finSlices > 500) ? 500 : finSlices;

			var data = VBI.MathLib.EquidistantLonLat(VBI.MathLib.DegToRad(pos), radius, finSlices);

			// add the center as a design handle................................//
			if (this.m_Pos.IsChangeable(scene.m_Ctx)) {
				(this.m_DH[nIndex] = [
					scene.GetPointFromPos(pos, false)
				]);
			}

			// due y maps are positive in top direction there is a cross over of//
			// of min and max values............................................//
			var lt = scene.GetPointFromGeo([
				data.m_MinX, data.m_MaxY, 0.0
			], false);
			var rb = scene.GetPointFromGeo([
				data.m_MaxX, data.m_MinY, 0.0
			], false);

			// determine the instance offsets...................................//
			var aIO = this.m_IO[nIndex] = scene.GetCorrectedInstanceOffsets(bb = this.m_BB[nIndex] = [
				lt[0], lt[1], rb[0], rb[1]
			], zzf);

			// add the center as a design handle................................//
			if (this.IsPosChangeable(scene.m_Ctx)) {
				// tag the array with the current mode.....................//
				var aDH = (this.m_DH[nIndex] = []);
				if (this.IsHandleMode()) {
					aDH.m_EditMode = VBI.EMHandle;
					aDH.push(scene.GetPointFromPos(pos, false));
				} else if (this.IsBoxMode()) {
					aDH.m_EditMode = VBI.EMBox;
					aDH.push(bb);
				}
			}

			for (var nK = 0; nK < aIO.length; ++nK) {
				dc.setTransform(1, 0, 0, 1, aIO[nK], 0);

				this.RenderCircleDist(nIndex, dc, data, colFill, colBorder);

				// draw the bounding box.........................................//
				if (VBI.m_bTrace) {
					VBI.Utilities.DrawFrameRect(dc, "red", this.m_BB[nIndex]);
				}
			}

			// reset any transforms.............................................//
			dc.setTransform(1, 0, 0, 1, 0, 0);
			if (label && aIO.length) {

				var pta = [];
				for (var nJ = 0; nJ < this.m_LP[nIndex].length; ++nJ) {
					pta.push(this.m_LP[nIndex][nJ][0], this.m_LP[nIndex][nJ][1]);
				}
				var positions = {
					pa: pta,
					bb: [
						lt, rb
					]
				};
				this.m_Label.push(new VBI.Label(label, nIndex, this.CalculateLabelPos, positions, null, aIO));
			}

		};

		this.Init4Render = this.StandardInitWithLPs;

		// CircleDist.Render with respect to data binding.................................//
		this.Render = function(canvas, dc, clusterData) {
			// clear bounding boxes and index offsets and linepoints and design.//
			// handles..........................................................//

			// get scene........................................................//
			var ctx = this.m_Scene.m_Ctx;

			// determine the binding information................................//
			var node;
			if ((node = this.m_DataSource.GetCurrentNode(ctx))) {
				// the element count determines the number of rendered instances.//
				for (var nJ = 0, len = node.m_dataelements.length; nJ < len; ++nJ) {
					this.m_DataSource.Select(nJ);

					var bHot = this.IsHot(nJ);
					var bSelected = this.IsSelected(ctx);

					var p = this.m_Pos.GetValueVector(ctx);
					var cb = this.m_ColBorder.GetValueColor(ctx);
					if (bSelected) {
						cb = this.GetSelectColor(ctx, cb);
					}
					if (bHot) {
						cb = this.GetAltBorderColor(ctx, cb);
					}
					var r = this.m_Radius.GetValueFloat(ctx);
					if (bHot) {
						r = (this.GetHotScale(ctx))[0] * r;
					}
					var s = this.m_Slices.GetValueLong(ctx);
					var cf = this.m_ColFill.GetValueColor(ctx);

					if (bSelected) {
						cf = this.GetSelectColor(ctx, cf);
					}
					if (bHot) {
						cf = this.GetHotColor(ctx, cf);
					}
					// create a subarray on the index.............................//
					this.m_LP[nJ] = [];

					this.RenderInstance(nJ, dc, p, cf, cb, r, s, this.GetLabel(ctx));

					// CircleDist: open or close RichTooltip based on VO instance hotness
					this.SetRichTooltip(bHot);
				}
			}
			// check: do single instance rendering in else branch ................//

			// call base rendering method.......................................//
			this.BaseRender(canvas, dc);
		};

		this.DetailHitTest = function(ocb, nIndex, nsx, nsy) {
			var bb = this.m_BB[nIndex];

			// check if its an Arc Circle => hit test as a normal circle
			if (bb.m_bArcCircle) {
				var r = bb.m_Radius;
				var xy = bb.m_Pos;
				var tdx, tdy;

				// when hit distance lies within the radius, this is a hit..........//
				if (((tdx = (xy[0] - nsx)) * tdx + (tdy = (xy[1] - nsy)) * tdy) < r * r) {
					return {
						m_hit: 1
					}; // check: do diffuse hits here as well
				}

				return null; // no hit
			} else {
				// check the segmented point geo circle
				// check: check for diffuse hits.....................................//
				return VBI.Utilities.pointInPolygon(this.m_LP[nIndex], nsx, nsy) ? {
					m_hit: 1
				} : null;
			}
		};

		this.GetHitArray = function(x, y, all) {
			// determine the array of instances that are hit
			// x and y are the canvas relative coordinates
			// all is set when hit test for all instances needed
			var zsf = this.m_Scene.GetStretchFactor4Mode();

			var nsx = x / zsf[0];
			var nsy = y / zsf[1];

			var ocb = {
				m_cb: this.DetailHitTest.bind(this),
				m_zf: zsf,
				m_All: all
			};

			// call base function for bounds check..............................//
			return this.BaseHitTest(nsx, nsy, ocb);
		};

		// design handlers.....................................................//
		this.DesignGetActiveBoxHandles = function(idx) {
			// only when the radius can be changed, handles are active..........//
			var scene = this.m_Scene;
			this.m_DataSource.Select(idx);
			return this.m_Radius.IsChangeable(scene.m_Ctx) ? [
				0, 1, 0, 1, 0, 1, 0, 1, 0
			] : [
				0, 0, 0, 0, 0, 0, 0, 0, 0
			];
		};

		this.DesignBoxSize = VBI.Utilities.SceneBindMeterRadiusDesignBoxSize.bind(this);

		// event handlers......................................................//
	};
	VBI.VisualObjects.CircleDist.prototype = VBI.VisualObjects.Base;

	// ........................................................................//
	// pie object.............................................................//

	VBI.VisualObjects.m_AC = // analytic colors........................//
	[
		"rgba(0,143,211,1.0)", "rgba(153,209,1,1.0)", "rgba(243,155,2,1.0)", "rgba(159,207,236,1.0)", "rgba(75,167,7,1.0)", "rgba(246,209,51,1.0)", "rgba(203,77,44,1.0)", "rgba(202,199,186,1.0)", "rgba(13,134,156,1.0)", "rgba(205,215,46,1.0)", "rgba(36,114,48,1.0)", "rgba(108,222,220,1.0)", "rgba(235,115,0,1.0)", "rgba(185,187,209,1.0)", "rgba(0,109,211,1.0)", "rgba(61,185,127,1.0)", "rgba(165,84,148,1.0)", "rgba(1,88,43,1.0)", "rgba(77,182,239,1.0)", "rgba(175,43,23,1.0)", "rgba(212,153,18,1.0)", "rgba(187,204,210,1.0)", "rgba(48,146,13,1.0)", "rgba(29,169,193,1.0)", "rgba(42,71,201,1.0)", "rgba(209,153,194,1.0)", "rgba(204,88,38,1.0)", "rgba(114,191,68,1.0)", "rgba(10,72,157,1.0)", "rgba(151,156,163,1.0)", "rgba(14,145,144,1.0)", "rgba(97,32,154,1.0)"
	];

	VBI.VisualObjects.Pie = function() {
		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load.call(this, dat, ctx);

			// load bindable properties.........................................//
			this.m_Props.push(this.m_DataSource = new VBI.NodeProperty(dat, 'datasource', null, ctx));
			this.m_Props.push(this.m_Series = new VBI.NodeProperty(dat, 'series', this.m_DataSource, ctx));
			this.m_Props.push(this.m_Scale = new VBI.AttributeProperty(dat, 'scale', this.m_DataSource, ctx, [
				1.0, 1.0, 1.0
			]));
			this.m_Props.push(this.m_Pos = new VBI.AttributeProperty(dat, 'pos', this.m_DataSource, ctx));
			this.m_Props.push(this.m_Values = new VBI.AttributeProperty(dat, 'value', this.m_Series, ctx));
			this.m_Props.push(this.m_Texts = new VBI.AttributeProperty(dat, 'text', this.m_Series, ctx));
			this.m_Props.push(this.m_SliceColor = new VBI.AttributeProperty(dat, 'slicecolor', this.m_Series, ctx));
			this.m_Props.push(this.m_Tooltips = new VBI.AttributeProperty(dat, 'extooltip', this.m_Series, ctx, this.m_defaultTooltip));
			this.m_Props.push(this.m_Tooltip = new VBI.AttributeProperty(dat, 'tooltip', this.m_DataSource, ctx, this.m_defaultTooltip));
			this.m_Props.push(this.m_StartColor = new VBI.AttributeProperty(dat, 'startcolor', this.m_DataSource, ctx, 0));

			// load shared properties...........................................//
			this.BaseLoad(dat, ctx, this);
		};

		this.LassoSelect = this.LassoSelectCircle;

		// render the single pie instance......................................//
		this.RenderInstance = function(nIndex, dc, pos, radius, values, texts, colors, nHotSlice, bSelected) {
			var scene = this.m_Scene;
			var zzf = scene.GetZoomFactor4Mode();
			var ctx = scene.m_Ctx;

			// calc sum of values...............................................//
			var nSum = 0;
			var nJ;
			for (nJ = 0; nJ < values.length; ++nJ) {
				nSum += values[nJ];
			}
			this.m_SUM[nIndex] = nSum;

			// determine the location where to render the main instance.........//
			// get the current zoom factors.....................................//
			var xy = scene.GetPointFromPos(pos, false);

			// determine the box and the instance offsets.......................//
			var bb;
			var aIO = this.m_IO[nIndex] = scene.GetCorrectedInstanceOffsets(bb = this.m_BB[nIndex] = [
				xy[0] - radius, xy[1] - radius, xy[0] + radius, xy[1] + radius
			], zzf);
			bb.m_Radius = radius; // remember used radius
			bb.m_Pos = xy; // remember used position

			// collect design handle information................................//
			if (this.IsPosChangeable(ctx)) {
				// tag the array with the current mode...........................//
				var aDH = (this.m_DH[nIndex] = []);
				if (this.IsHandleMode()) {
					aDH.m_EditMode = VBI.EMHandle;
					aDH.push(xy); // center is the design handle
				} else if (this.IsBoxMode()) {
					aDH.m_EditMode = VBI.EMBox;
					aDH.push(bb);
				}
			}
			this.m_ARC[nIndex] = [
				3 * Math.PI / 2
			];

			// get the start color..............................................//
			var startcolor = this.m_StartColor.GetValueLong(ctx);
			var colarraylen = VBI.VisualObjects.m_AC.length;

			for (var nK = 0; nK < aIO.length; ++nK) {
				dc.setTransform(1, 0, 0, 1, aIO[nK], 0);

				var lastPosition = 3 * Math.PI / 2;
				for (nJ = 0; nJ < values.length; ++nJ) {
					var gradient = dc.createRadialGradient(xy[0], xy[1], 0, xy[0], xy[1], radius);
					var col = colors[nJ];
					if (!col) {
						col = VBI.VisualObjects.m_AC[(nJ + startcolor) % colarraylen];
					}
					// determine the hot color....................................//
					if (bSelected) {
						col = this.GetSelectColor(ctx, col);
					}
					if (nJ == nHotSlice) {
						col = this.GetHotColor(ctx, col);
					}
					gradient.addColorStop(0, col);
					gradient.addColorStop(0.95, col);
					gradient.addColorStop(1.0, 'rgba(255,255,255,0.0 )');

					dc.fillStyle = gradient;
					dc.beginPath();
					dc.moveTo(xy[0], xy[1]); // move to center

					var deltaPhi = Math.PI * 2 * (values[nJ] / nSum);

					dc.arc(xy[0], xy[1], radius, lastPosition, lastPosition + deltaPhi, false);
					dc.lineTo(xy[0], xy[1]); // move to center
					dc.closePath();
					dc.fill(); // fill the pie
					lastPosition += deltaPhi;
					if (!nK) {
						// store the angle for the first instance
						this.m_ARC[nIndex].push(lastPosition);
					}

					// check: store segments positions.............................//
				}
			}

			// reset the transformation.........................................//
			dc.setTransform(1, 0, 0, 1, 0, 0);

		};

		this.Init4Render = function() {
			// clear bounding boxes, index offsets and design handles...........//
			this.m_BB = [];
			this.m_IO = [];
			this.m_DH = [];
			this.m_ARC = []; // Angles of the pies for hittest
			this.m_SUM = []; // total sum of values in pie for percentage calculation
		};

		// Pie.Render pie with respect to data binding.............................//
		this.Render = function(canvas, dc, clusterData) {

			// get scene and desin mode.........................................//
			var scene = this.m_Scene;
			var ctx = scene.m_Ctx;
			var cntInstances = 0;

			var node, nSeries;
			if ((node = this.m_DataSource.GetCurrentNode(ctx))) {
				cntInstances = node.m_dataelements.length;
				for (var nJ = 0; nJ < cntInstances; ++nJ) {
					this.m_DataSource.Select(nJ);
					var aPos = this.m_Pos.GetValueVector(ctx);
					var aScale = this.m_Scale.GetValueVector(ctx);

					var radius = 16 * aScale[0];
					var bHot = this.IsHot(nJ);
					var bSelected = this.IsSelected(ctx);

					// determine the hot scale for the pie........................//
					if (bHot) {
						radius = (this.GetHotScale(ctx))[0] * radius;
					}
					// select the series item.....................................//
					var aValue = [], aText = [], aSliceColor = [];
					if ((nSeries = this.m_Series.GetCurrentNode(ctx))) {
						for (var nS = 0; nS < nSeries.m_dataelements.length; ++nS) {
							this.m_Series.Select(nS);
							aValue.push(this.m_Values.GetValueFloat(ctx));
							aText.push(this.m_Texts.GetValueString(ctx));
							var color = this.m_SliceColor.GetValueString(ctx);
							aSliceColor.push(color ? this.m_SliceColor.GetValueColor(ctx) : color);
						}
					}
					var tmp, nHotSlice = (bHot && (tmp = scene.m_HotItem.m_HitObj) && (tmp = tmp.m_Detail)) ? tmp.m_slice : -1;
					this.RenderInstance(nJ, dc, aPos, radius, aValue, aText, aSliceColor, nHotSlice, bSelected);

					// Pie: open or close RichTooltip based on VO instance hotness
					this.SetRichTooltip(bHot);
				}
			}
			// check: do single instance rendering in else branch

			// call base rendering method.......................................//
			this.BaseRender(canvas, dc);

			return cntInstances; // to increase count of Scaling instances
		};

		this.DetailHitTest = function(ocb, nIndex, nsx, nsy) {
			// we can use the box arrays attributes to get the current radius...//
			// and position.....................................................//
			var bb = this.m_BB[nIndex];
			var radius = bb.m_Radius;
			var pos = bb.m_Pos;
			var tdx, tdy;

			// when hit distance lies within the radius, this is a hit..........//
			if (((tdx = (pos[0] - nsx)) * tdx + (tdy = (pos[1] - nsy)) * tdy) < (radius * radius)) {
				// VBI.Trace("pos=["+pos[0]+","+pos[1]+"] nsx="+nsx+", nsy="+nsy+" tdx="+tdx+",tdy="+tdy);
				var angle = Math.acos(tdy / Math.sqrt(tdx * tdx + tdy * tdy));
				var realangle = (tdx <= 0 ? 3 * Math.PI / 2 + angle : 7 * Math.PI / 2 - angle);
				var myArc = this.m_ARC[nIndex];
				var lowVal = 0, highVal = myArc.length - 1, median;
				while (highVal > lowVal + 1) { // binary search
					median = Math.round((lowVal + highVal) / 2);
					if (myArc[median] > realangle) {
						highVal = median;
					} else {
						lowVal = median;
					}
				}

				return {
					m_hit: 1,
					m_slice: lowVal
				}; // check: do diffuse hits here as well
			}

			return null; // no hit
		};

		this.GetHitArray = function(x, y, all) {
			// all is set when hit test for all instances needed
			var zsf = this.m_Scene.GetStretchFactor4Mode();
			// bounding boxes are defined always in non stretched canvas
			// coordinates, therefore transform them
			var nsx = x / zsf[0];
			var nsy = y / zsf[1];

			var ocb = {
				m_cb: this.DetailHitTest.bind(this),
				m_All: all
			};
			// call base function for bounds check
			return this.BaseHitTest(nsx, nsy, ocb);
		};

		this.doFormatedReplaces = function(mytext, startStr, endStr, value) {
			var len = startStr.length;
			var nIndex;
			while ((nIndex = mytext.indexOf(startStr)) >= 0) {
				var nIndex2 = nIndex + mytext.substring(nIndex + len).indexOf(endStr) + len + 1;
				var sFormatStr = mytext.substring(nIndex + len, nIndex2 - 1);
				var bUseKomma = false, nSep;
				if ((nSep = sFormatStr.indexOf(",")) >= 0) {
					bUseKomma = true;
				} else {
					nSep = sFormatStr.indexOf(".");
				}
				var nDigits = Math.min(10, (nSep >= 0 ? parseInt(sFormatStr.substring(nSep + 1), 10) : 0));

				var nCompleteStr = mytext.substring(nIndex, nIndex2);
				var valStr = "" + value.toFixed(nDigits);
				if (bUseKomma) {
					valStr = valStr.replace(".", ",");
				}
				mytext = mytext.replace(nCompleteStr, valStr);
			}

			return mytext;

		};

		this.getTooltip = function(ctx, hitObj) {
			var pIndex = hitObj.m_Index; // which pie?
			var sIndex = hitObj.m_Detail.m_slice; // which slice?

			this.m_DataSource.Select(pIndex);
			this.m_Series.Select(sIndex);
			var tooltip = this.m_Tooltips.GetValueString(ctx);
			if (tooltip == "") {
				tooltip = this.m_Tooltip.GetValueString(ctx);
			}
			if ((tooltip === null) || (tooltip === "")) {
				return "";
			}
			tooltip = tooltip.replace(/%MAIN%/, this.m_Tooltip.GetValueString(ctx));
			tooltip = tooltip.replace(/%NUM%/g, sIndex + 1);
			tooltip = tooltip.replace(/%ONUM%/g, sIndex + 1);
			tooltip = tooltip.replace(/%NAME%/g, this.m_Texts.GetValueString(ctx));

			var val = parseFloat(this.m_Values.GetValueString(ctx));

			tooltip = this.doFormatedReplaces(tooltip, "%VALUE", "%", val);
			tooltip = this.doFormatedReplaces(tooltip, "%PERCENTAGE", "%", 100 * val / this.m_SUM[pIndex]);

			return tooltip;
		};

		// design overridden members...........................................//
		this.DesignBeginDrag = function(ocb) {
			// append the original scale to the context.........................//
			ocb.m_ScaleOrig = this.m_Scale.GetValueVector(this.m_Scene.m_Ctx).slice(0);
			ocb.m_DhOrig = this.m_DH[ocb.m_Index].slice(0);
			if (ocb.m_IO) {
				(ocb.m_DhOrig[0])[0] += ocb.m_IO;
				(ocb.m_DhOrig[0])[2] += ocb.m_IO;
			}
		};

		this.DesignBoxSize = VBI.Utilities.SceneBindDesignBoxBoxSize.bind(this, true);

		// event handlers......................................................//
	};
	VBI.VisualObjects.Pie.prototype = VBI.VisualObjects.Base;

	// ........................................................................//
	// box object.............................................................//

	VBI.VisualObjects.Box = function() {
		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load.call(this, dat, ctx);

			// load bindable properties.........................................//
			this.m_Props.push(this.m_DataSource = new VBI.NodeProperty(dat, 'datasource', null, ctx));
			this.m_Props.push(this.m_Pos = new VBI.AttributeProperty(dat, 'pos', this.m_DataSource, ctx, [
				0.0, 0.0, 0.0
			]));
			this.m_Props.push(this.m_Scale = new VBI.AttributeProperty(dat, 'scale', this.m_DataSource, ctx, [
				1.0, 1.0, 1.0
			]));
			this.m_Props.push(this.m_Tooltip = new VBI.AttributeProperty(dat, 'tooltip', this.m_DataSource, ctx, this.m_defaultTooltip));
			this.m_Props.push(this.m_Color = new VBI.AttributeProperty(dat, 'color', this.m_DataSource, ctx, this.m_defaultColor));
			this.m_Props.push(this.m_ColorBorder = new VBI.AttributeProperty(dat, 'colorBorder', this.m_DataSource, ctx, this.m_defaultColor));
			this.m_Props.push(this.m_AltColorBorder = new VBI.AttributeProperty(dat, 'altBorderDeltaColor', this.m_DataSource, ctx, null));

			// load shared properties...........................................//
			this.BaseLoad(dat, ctx, this);
		};

		// render the single instance..........................................//
		this.RenderInstance = function(nIndex, dc, pos, scale, color, colorBorder, fs) {
			var bb, scene = this.m_Scene;
			var zzf = scene.GetZoomFactor4Mode();
			var zsf = scene.GetStretchFactor4Mode();

			if (!scale) {
				scale = [
					1.0, 1.0, 1.0
				];
			}
			if (!color) {
				color = "#6f6f7a";
			}

			// determine the location where to render the main instance.........//
			// get the current zoom factors.....................................//
			var xy = scene.GetPointFromPos(pos, false);

			var sx = 1.0;
			var sy = 1.0;
			if (this.IsHot(nIndex)) {
				// determine the hot scale.......................................//
				var hs = this.GetHotScale(scene.m_Ctx);
				sx = hs[0];
				sy = hs[1];
			}

			// remark: precise box rendering analog to 3D is not possible.......//
			// due 2D uses parallel projection instead of a perspective.........//
			// projection.......................................................//

			var baseSize = 370;
			var bx = baseSize * scale[0] * sx / zsf[0];
			var by = baseSize * scale[1] * sy / zsf[1];

			if (!fs) {
				// when size is not fixed it scales proportional to the zoom.....//
				// level.........................................................//
				var f = Math.pow(2, scene.GetCurrentZoomlevel()) / 14.6;
				bx *= f;
				by *= f;
			}

			// determine the box dimensions.....................................//
			var l = xy[0] - bx / 2;
			var t = xy[1] - by / 2;
			var r = xy[0] + bx / 2;
			var b = xy[1] + by / 2;

			// determine the instance offsets...................................//
			var aIO = this.m_IO[nIndex] = scene.GetCorrectedInstanceOffsets(bb = this.m_BB[nIndex] = [
				l, t, r, b
			], zzf);

			// push all points to design mode handles array.....................//
			if (this.IsPosChangeable(scene.m_Ctx)) {
				var aDH = (this.m_DH[nIndex] = []);
				if (this.IsHandleMode()) {
					// just push the line points to the design handle array.......//
					aDH.m_EditMode = VBI.EMHandle;
					aDH.push(xy);
				} else if (this.IsBoxMode()) {
					// just push the box points to the design handle array........//
					aDH.m_EditMode = VBI.EMBox;
					aDH.push(bb);
				}
			}

			// pixel the box....................................................//
			for (var nJ = 0; nJ < aIO.length; ++nJ) {
				dc.setTransform(1, 0, 0, 1, aIO[nJ], 0);

				// draw the filled rectangle.....................................//
				dc.fillStyle = color;
				dc.fillRect(l, t, bx, by);

				// daw a border around...........................................//
				dc.lineWidth = 1;
				dc.strokeStyle = colorBorder;
				dc.strokeRect(l, t, bx, by);

				// draw the bounding box.........................................//
				if (VBI.m_bTrace) {
					VBI.Utilities.DrawFrameRect(dc, "red", this.m_BB[nIndex]);
				}
			}

			dc.setTransform(1, 0, 0, 1, 0, 0);
		};

		this.Init4Render = this.StandardInit;

		// Box.Render with respect to data binding.................................//
		this.Render = function(canvas, dc, clusterData) {
			// clear bounding boxes and index offsets and design handles........//

			// get the scene and design mode....................................//
			var scene = this.m_Scene, ctx = scene.m_Ctx;
			var cntInstances = 0;

			var node;
			if ((node = this.m_DataSource.GetCurrentNode(ctx))) {
				cntInstances = node.m_dataelements.length;
				for (var nJ = 0; nJ < cntInstances; ++nJ) {
					this.m_DataSource.Select(nJ);
					var bHot = this.IsHot(nJ);
					var bSelected = this.IsSelected(ctx);

					var aPos = this.m_Pos.GetValueVector(ctx);
					var aScale = this.m_Scale.GetValueVector(ctx);

					var aCol = this.m_Color.GetValueColor(ctx);
					if (bSelected) {
						aCol = this.GetSelectColor(ctx, aCol);
					}
					if (bHot) {
						aCol = this.GetHotColor(ctx, aCol);
					}
					var aColBorder = this.m_ColorBorder.GetValueColor(ctx);
					if (bSelected) {
						aColBorder = this.GetSelectColor(ctx, aColBorder);
					}
					if (bHot) {
						aColBorder = this.GetAltBorderColor(ctx, aColBorder);
					}
					var aFxSize = this.m_FxSize.GetValueBool(ctx);

					this.RenderInstance(nJ, dc, aPos, aScale, aCol, aColBorder, aFxSize);

					// Box: open or close RichTooltip based on VO instance hotness
					this.SetRichTooltip(bHot);
				}
			}
			// check: do single instance rendering in else branch

			// call base rendering method.......................................//
			this.BaseRender(canvas, dc);

			return cntInstances; // to increase count of Scaling instances
		};

		this.DetailHitTest = function(ocb, nIndex, nsx, nsy) {
			return {
				m_hit: 1
			}; // always a hit due bounds is equal to box, todo: diffuse hit
		};

		this.GetHitArray = function(x, y, all) {
			// determine the array of instances that are hit
			// x and y are the canvas relative coordinates
			// all is set when hit test for all instances needed
			var zsf = this.m_Scene.GetStretchFactor4Mode();
			var nsx = x / zsf[0];
			var nsy = y / zsf[1];

			var ocb = {
				m_cb: this.DetailHitTest.bind(this),
				m_All: all
			};
			// call base function for bounds check
			return this.BaseHitTest(nsx, nsy, ocb);
		};

		// design overridden members...........................................//
		this.DesignBeginDrag = function(ocb) {
			// append the original scale to the context.........................//
			ocb.m_ScaleOrig = this.m_Scale.GetValueVector(this.m_Scene.m_Ctx).slice(0);
			ocb.m_DhOrig = this.m_DH[ocb.m_Index].slice(0);
			if (ocb.m_IO) {
				(ocb.m_DhOrig[0])[0] += ocb.m_IO;
				(ocb.m_DhOrig[0])[2] += ocb.m_IO;
			}
		};

		// design overridden members...........................................//
		/*
		 * this.DesignGetActiveBoxHandles = function( idx ) { // return the valid box handles in design mode......................// return [ 1, 1, 1,
		 * 1, 0, 1, 0, 0, 0 ]; };
		 */
		this.DesignBoxSize = VBI.Utilities.SceneBindDesignBoxBoxSize.bind(this, false);

		// event handlers......................................................//
	};
	VBI.VisualObjects.Box.prototype = VBI.VisualObjects.Base;

	// ........................................................................//
	// area object............................................................//

	VBI.VisualObjects.Area = function() {
		this.m_LineWidth = 1;

		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load.call(this, dat, ctx);

			// load bindable properties.........................................//
			this.m_Props.push(this.m_DataSource = new VBI.NodeProperty(dat, 'datasource', null, ctx));
			if (typeof (dat["posarraymulti.bind"]) === "string" || typeof (dat["posarraymulti"]) === "string") {
				this.m_Props.push(this.m_PosM = new VBI.AttributeProperty(dat, 'posarraymulti', this.m_DataSource, ctx));
				this.m_Pos = null;
			} else {
				this.m_Props.push(this.m_Pos = new VBI.AttributeProperty(dat, 'posarray', this.m_DataSource, ctx));
				this.m_PosM = null;
			}
			this.m_Props.push(this.m_Scale = new VBI.AttributeProperty(dat, 'scale', this.m_DataSource, ctx));
			this.m_Props.push(this.m_Color = new VBI.AttributeProperty(dat, 'color', this.m_DataSource, ctx, this.m_defaultColor));
			this.m_Props.push(this.m_ColorBorder = new VBI.AttributeProperty(dat, 'colorBorder', this.m_DataSource, ctx, null));
			this.m_Props.push(this.m_BorderDash = new VBI.AttributeProperty(dat, 'borderDash', this.m_DataSource, ctx, null));
			this.m_Props.push(this.m_Tooltip = new VBI.AttributeProperty(dat, 'tooltip', this.m_DataSource, ctx, this.m_defaultTooltip));
			this.m_Props.push(this.m_AltColorBorder = new VBI.AttributeProperty(dat, 'altBorderDeltaColor', this.m_DataSource, ctx, null));

			// load shared properties...........................................//
			this.BaseLoad(dat, ctx, this);
		};

		this.LassoSelect = function(aPos, hits, orgHits) {
			var bEnclosed = false;
			var shapeList, polygonPts;
			var bFound = false;
			for (var nJ = this.m_LP.length - 1; nJ >= 0; --nJ) {
				shapeList = this.m_LP[nJ];
				bEnclosed = false;
				for (var nK = 0; nK < shapeList.length; ++nK) {
					polygonPts = shapeList[nK];
					if (jQuery.type(polygonPts[0]) == 'array' && jQuery.type(polygonPts[0][0]) == 'array') {
						polygonPts = polygonPts[0];
					}
					if (!(bEnclosed = VBI.Utilities.polyInPolygon(aPos, polygonPts, this.m_IO[nJ]))) {
						break;
					}
				}
				if (bEnclosed) {
					hits.push(nJ);
					orgHits.push(nJ);
					bFound = true;
				}
			}
			return bFound;
		};

		this.RenderArea = function(nIndex, dc, pointarray, color, colorBorder, borderDash, linewidth, hotedge) {

			var sqdistance = linewidth * linewidth / 2;
			var idx, xyz, tdx, tdy;

			var scene = this.m_Scene;
			var n = scene.m_CacheVars;

			// draw lines between the points....................................//
			if (pointarray[0].length < 6) {
				return; // at least 2 points are required..//
			}

			var aLinePoints = this.m_LP[nIndex]; // linepoint array......//

			// linepoints and handle points are only collected for the first.....//
			// world instance...................................................//
			if (aLinePoints.length) {
				aLinePoints = null;
			}

			// set non-dashed line first
			var bLineDashSupported = dc.setLineDash ? true : false;
			var bLineDashSet = false;
			var eLod = this.m_Scene.m_Canvas[0].m_nExactLOD;
			if (bLineDashSupported && borderDash && (VBI.m_bIsIDevice || VBI.m_bIsAndroid || eLod == Math.floor(eLod) || eLod <= (this.m_Scene.m_CacheVars.minLOD + 0.01))) {
				var bd = borderDash.split(";");
				dc.setLineDash(bd);
				// dc.lineDashOffset++;
				bLineDashSet = true;
			}

			dc.strokeStyle = (colorBorder) ? colorBorder : color;
			dc.fillStyle = color;
			dc.lineWidth = hotedge > -1 ? 2 : linewidth;
			dc.lineCap = 'round';

			// Use Premultiplied values for better performance
			var factX = n.factX;
			var factY = n.factY;
			var addX = n.addX;
			var addY = n.addY;

			dc.beginPath();
			// loop on given shapes: base shape + exclusions

			for (var nI = 0, paLen = pointarray.length; nI < paLen; ++nI) {
				var tmp = [
					pointarray[nI][0] * factX + addX, pointarray[nI][1] * factY + addY
				];
				if (aLinePoints) {
					aLinePoints.push([]);
					aLinePoints[nI].push(tmp);
				}

				dc.moveTo(tmp[0], tmp[1]); // move to start............//
				var len = pointarray[nI].length;
				for (idx = 3; idx < len; idx += 3) {
					xyz = [
						pointarray[nI][idx] * factX + addX, pointarray[nI][idx + 1] * factY + addY, 0.0
					];

					// when the distance is too small between projected points.......//
					// skip rendering................................................//
					if (((tdx = (tmp[0] - xyz[0])) * tdx + (tdy = (tmp[1] - xyz[1])) * tdy) < sqdistance) {
						continue;
					}

					dc.lineTo(xyz[0], xyz[1]);
					if (aLinePoints) {
						aLinePoints[nI].push(xyz);
					}
					tmp = xyz;
				}
			}
			dc.closePath();

			// fill and stroke..................................................//
			dc.fill();
			dc.stroke();
			if (bLineDashSet) {
				dc.setLineDash([]); // reset the line dashing
			}
		};

		this.CalculateLabelPos = function(scene, pointarray, offset) {
			var zsf = scene.GetStretchFactor4Mode();
			var rctest = scene.GetInternalDivClientRect();
			var rcWidth = rctest.width / zsf[0];
			var rcHeight = rctest.height / zsf[1];
			var PosXTest = scene.m_Canvas[0].getPixelLeft() / zsf[0];
			var PosYTest = scene.m_Canvas[0].getPixelTop() / zsf[1];

			var rcviewport = [
				-PosXTest, -PosYTest, -PosXTest + rcWidth, -PosYTest + rcHeight
			];

			var pt = VBI.Utilities.GetMidpointsForPolygon(pointarray.pa, pointarray.bb, offset, rcviewport);
			if (pt && pt.aPos) {
				return pt.aPos;
			}
			return null;
		};

		this.ExtendBB = function(tBB, aBB) {
			if (tBB[0] > aBB[0]) {
				tBB[0] = aBB[0];
			}
			if (tBB[1] > aBB[1]) {
				tBB[1] = aBB[1];
			}
			if (tBB[2] < aBB[2]) {
				tBB[2] = aBB[2];
			}
			if (tBB[3] < aBB[3]) {
				tBB[3] = aBB[3];
			}
		};

		this.IsPosChangeable = function(ctx) {
			// no design mode when mouse is not supported
			if (!VBI.m_bMouseSupported) {
				return false;
			}
			// determine if position is changeable..............................//
			if (this.m_PosM) {
				return this.m_PosM.IsChangeable(ctx);
			} else {
				// call prototype...................................................//
				return Object.getPrototypeOf(this).IsPosChangeable.call(this, ctx);
			}
		};

		this.CalcExcludeAreaMinLod = function(scene, myArray, lod, accuracy) {
			var aposexcl = scene.GetNearestPosArray(myArray);
			var lte = scene.GetPointFromPos([
				aposexcl.m_MinX, aposexcl.m_MaxY, 0.0
			], false);
			var rbe = scene.GetPointFromPos([
				aposexcl.m_MaxX, aposexcl.m_MinY, 0.0
			], false);
			return this.CalcAreaMinLod(lte, rbe, lod, accuracy);
		};

		this.RenderShape = function(nIndex, dc, posarrays, color, colorBorder, borderDash, linewidth, hotedge, label, lod) {
			var scene = this.m_Scene;

			var bExcludes = false, baseShape;
			if (typeof (posarrays[0]) === "number") {
				baseShape = posarrays;
			} else {
				baseShape = posarrays[0];
				bExcludes = true;
			}
			var zzf = scene.GetZoomFactor4Mode();
			var n = scene.m_CacheVars;
			if (baseShape.cache == undefined) {
				scene.FillPositionCache(baseShape);
			}
			var accuracy = 2.1; // accuracy finetunes how small painted areas can be
			if (baseShape.cache.minLod > lod - accuracy) {
				return;
			}

			var lt = [
				(baseShape.cache.lt[0] * n.completeX - n.ox) * n.fx, (baseShape.cache.lt[1] * n.completeY - n.oy) * n.fy
			];
			var rb = [
				(baseShape.cache.rb[0] * n.completeX - n.ox) * n.fx, (baseShape.cache.rb[1] * n.completeY - n.oy) * n.fy
			];

			// determine the instance offsets and store the bounds..............//

			var aBB, aIO = scene.GetCorrectedInstanceOffsets(aBB = [
				lt[0] - linewidth, lt[1] - linewidth, rb[0] + linewidth, rb[1] + linewidth
			], zzf);

			if (this.m_BB[nIndex]) {
				// multi part area -> sum up bounding boxes
				this.ExtendBB(this.m_BB[nIndex], aBB);
				this.m_IO[nIndex] = scene.GetCorrectedInstanceOffsets(this.m_BB[nIndex], zzf);
			} else {
				this.m_IO[nIndex] = aIO;
				this.m_BB[nIndex] = aBB;
			}

			// one burst convert to points......................................//
			// for all round world instances....................................//
			var nJ;
			var pointarray = null;
			if (aIO.length) {
				pointarray = [];
				pointarray.push(baseShape.cache.data);
				if (bExcludes) {
					for (var nI = 1, paLen = posarrays.length; nI < paLen; ++nI) {
						var myArray = posarrays[nI];
						if (myArray.cache == undefined) { // calc extension and minLod of hole
							scene.FillPositionCache(myArray);
						}
						if (myArray.cache.minLod <= lod + accuracy) { // only paint if big enough
							pointarray.push(myArray.cache.data);
						}
					}
				}
				// move all points to design mode handles array.....................//
				if (this.IsPosChangeable(scene.m_Ctx)) {
					var aDH = (this.m_DH[nIndex] = []);
					if (this.IsHandleMode()) {
						// just push the line points to the design handle array.......//
						// Note: We use only the base shape so far
						aDH.m_EditMode = VBI.EMHandle;
						var length = pointarray[0].length / 3;
						for (nJ = 0; nJ < length; ++nJ) {
							aDH.push([
								(pointarray[0][nJ * 3] * n.completeX - n.ox) * n.fx, (pointarray[0][nJ * 3 + 1] * n.completeY - n.oy) * n.fy
							]);
						}
					} else if (this.IsBoxMode()) {
						// just push the box points to the design handle array........//
						aDH.m_EditMode = VBI.EMBox;
						aDH.push(this.m_BB[nIndex]);
					}
				}

				// do actual canvas rendering
				for (nJ = 0; nJ < aIO.length; ++nJ) {
					dc.setTransform(1, 0, 0, 1, aIO[nJ], 0);
					this.RenderArea(nIndex, dc, pointarray, color, colorBorder, borderDash, linewidth, hotedge);

					// draw the bounding box.........................................//
					if (VBI.m_bTrace) {
						VBI.Utilities.DrawFrameRect(dc, "red", this.m_BB[nIndex]);
					}
				}
				dc.setTransform(1, 0, 0, 1, 0, 0);

				// draw labels
				if (label) {

					var pta = scene.GetShortPointArrayFromUCSArray(baseShape.cache.data);
					var positions = {
						pa: pta,
						bb: [
							lt, rb
						]
					};
					this.m_Label.push(new VBI.Label(label, nIndex, this.CalculateLabelPos, positions, null, aIO));
				}
			}
		};

		this.RenderInstance = function(nIndex, dc, bHot, ctx, bSelected, lod) {
			// create a subarray on the index.............................//
			this.m_LP[nIndex] = [];

			var scene = this.m_Scene;

			// get the instance attributes................................//
			var hotedge = -1;
			var col = this.m_Color.GetValueColor(ctx);
			var colBorder = this.m_ColorBorder.GetValueColor(ctx);
			var borderDash = this.m_BorderDash.GetValueString(ctx);

			if (bSelected) {
				col = this.GetSelectColor(ctx, col);
				colBorder = this.GetAltBorderColor(ctx, colBorder);
			} else if (this.GetNumActiveSelections(ctx)) {
				col = this.GetNonSelectColor(ctx, col);
				// colBorder = this.GetNonSelectColor( ctx, colBorder );
			}

			// get details of the hot state...............................//
			if (bHot) {
				var detail = scene.m_HotItem.m_HitObj.m_Detail;
				// only when edge events are subscribed the border gets hot//
				if (detail && detail.m_edge >= 0 && (this.BaseFindAction("EdgeClick") || this.BaseFindAction("EdgeContextMenu"))) {
					hotedge = detail.m_edge;
				} else {
					col = this.GetHotColor(ctx, col);
				}
				colBorder = this.GetAltBorderColor(ctx, colBorder);
			}

			// get position array(s)
			var pa;
			if (this.m_Pos) {
				pa = this.m_Pos.GetValueVector(ctx);
				this.RenderShape(nIndex, dc, pa, col, colBorder, borderDash, this.m_LineWidth, hotedge, this.GetLabel(ctx), lod);
			} else if (this.m_PosM) {
				var a = this.m_PosM.GetValueVector(ctx);
				var aMultiLP = [];
				for (var nK = 0, l = a.length; nK < l; ++nK) {
					this.RenderShape(nIndex, dc, a[nK], col, colBorder, borderDash, this.m_LineWidth, hotedge, this.GetLabel(ctx), lod);
					// collect line points for all parts + clear last result, otherwise RenderArea will only fill it once!
					if (this.m_LP[nIndex].length) {
						(aMultiLP.push(this.m_LP[nIndex]));
						this.m_LP[nIndex] = [];
					}
				}
				this.m_LP[nIndex] = aMultiLP;
			}
		};

		this.Init4Render = this.StandardInitWithLPs;

		// Area.Render with respect to data binding.................................//
		this.Render = function(canvas, dc, clusterData) {
			// clear bounding boxes and index offsets and linepoints and design.//
			// handles and labels for all instances ............................//

			var ctx = this.m_Scene.m_Ctx;
			var selected = [];

			// determine the binding information................................//
			var node, len;
			var hotIndex;

			var fExactLod = this.m_Scene.m_Canvas[0].m_nExactLOD;

			if ((node = this.m_DataSource.GetCurrentNode(ctx))) {
				len = node.m_dataelements.length;
				// the element count determines the number of rendered instances.//
				for (var nJ = 0; nJ < len; ++nJ) {
					this.m_DataSource.Select(nJ);
					var bHot = this.IsHot(nJ);
					if (bHot) {
						hotIndex = nJ;
					} else if (this.IsSelected(ctx)) {
						selected.push(nJ);
					} else {
						this.RenderInstance(nJ, dc, false, ctx, false, fExactLod);
					}

					// close RichTooltip if it is open
					this.SetRichTooltip(bHot);
				}
			}

			// check: do single instance rendering in else branch ............//
			len = selected.length;
			for (var i = 0; i < len; i++) {
				this.m_DataSource.Select(selected[i]);
				this.RenderInstance(selected[i], dc, false, ctx, true, fExactLod); // Render all selected non hotties
			}

			if (hotIndex != undefined) {
				this.m_DataSource.Select(hotIndex);
				this.RenderInstance(hotIndex, dc, true, ctx, this.IsSelected(ctx), fExactLod); // Render Hottie
			}

			// call base rendering method.......................................//
			this.BaseRender(canvas, dc);
		};

		this.DetailHitTest = function(ocb, nIndex, nsx, nsy) {
			var bHit = false;
			var len;
			var aLP = this.m_LP[nIndex]; // aLP points to part which is hit
			if (jQuery.type(aLP[0]) == 'array' && jQuery.type(aLP[0][0]) == 'array' && jQuery.type(aLP[0][0][0]) == 'array') { // multipart area
				len = aLP.length;
				for (var nI = 0; !bHit && nI < len; ++nI) {
					// check for a hit on any part
					aLP = this.m_LP[nIndex][nI];
					bHit = VBI.Utilities.pointInPolygon(aLP, nsx, nsy);
				}
			} else { // single part area
				bHit = VBI.Utilities.pointInPolygon(aLP, nsx, nsy);
			}
			if (bHit) {
				var oHit = {
					m_hit: 1
				};

				// line points defined always in non stretched canvas............//
				// So far we test only the border of the base shape!
				var o;
				if ((o = VBI.Utilities.pointOnLine(aLP[0], nsx, nsy, 5, true)) && o.m_edge >= 0) {
					oHit.m_edge = o.m_edge;
					oHit.m_node = o.m_node;
				}

				return oHit;
			}
			return null;
		};

		this.GetHitArray = function(x, y, all) {
			// determine the array of instances that are hit
			// x and y are the canvas relative coordinates
			// all is set when hit test for all instances needed
			var zsf = this.m_Scene.GetStretchFactor4Mode();
			var nsx = x / zsf[0];
			var nsy = y / zsf[1];

			var ocb = {
				m_cb: this.DetailHitTest.bind(this),
				m_All: all
			};
			// call base function for bounds check
			return this.BaseHitTest(nsx, nsy, ocb);
		};

		this.ProcessDetailNodeEdgeEvent = function(event, ele, hit, name) {
			// the detail click is called before a potential click event is.....//
			// fired by the base implementation.................................//

			// check if the edge click is subscribed............................//
			var scene = this.m_Scene, actions = scene.m_Ctx.m_Actions;
			if (actions) {
				var action;
				if ((action = actions.findAction(name, scene, this))) {
					// get basic params........................................//
					var params = scene.GetEventVPCoordsObj(event);

					// append the edge parameter...............................//
					params.edge = hit.m_Detail.m_edge.toString();
					params.node = hit.m_Detail.m_node.toString();
					this.m_Scene.m_Ctx.FireAction(action, scene, this, ele, params);
					return true;
				}
			}
			return false;
		};

		this.DetailClick = function(event, ele, hit) {
			if (hit.m_Detail && (hit.m_Detail.m_edge >= 0)) {
				return this.ProcessDetailNodeEdgeEvent(event, ele, hit, 'EdgeClick');
			}
			return false;
		};

		this.DetailContextmenu = function(event, ele, hit) {
			if (hit.m_Detail && (hit.m_Detail.m_edge >= 0)) {
				return this.ProcessDetailNodeEdgeEvent(event, ele, hit, 'EdgeContextMenu');
			}
			return false;
		};

		// design overridden members...........................................//
		this.DesignBoxSize = VBI.Utilities.SceneBindPosArrayDesignBoxSize.bind(this);
	};
	VBI.VisualObjects.Area.prototype = VBI.VisualObjects.Base;

// ........................................................................//
// heatmap object.........................................................//

	VBI.VisualObjects.HeatMap = function() {
		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load.call(this, dat, ctx);

			// load bindable properties.........................................//
			this.m_Props.push(this.m_DataSource = new VBI.NodeProperty(dat, 'datasource', null, ctx));
			this.m_Props.push(this.m_Pos = new VBI.AttributeProperty(dat, 'pos', this.m_DataSource, ctx));
			this.m_Props.push(this.m_Value = new VBI.AttributeProperty(dat, 'value', this.m_DataSource, ctx, 1));
			this.m_Props.push(this.m_Opacity = new VBI.AttributeProperty(dat, 'opacity', this.m_DataSource, ctx, 0.5));
			this.m_Props.push(this.m_Gradient = new VBI.AttributeProperty(dat, 'gradient', this.m_DataSource, ctx, ""));
			this.m_Props.push(this.m_Radius = new VBI.AttributeProperty(dat, 'radius', this.m_DataSource, ctx, 5));
			this.m_Props.push(this.m_Behavior = new VBI.AttributeProperty(dat, 'behavior', this.m_DataSource, ctx, 2));
			this.m_Props.push(this.m_RScale = new VBI.AttributeProperty(dat, 'radiusScale', this.m_DataSource, ctx, 1.0));
			this.m_Props.push(this.m_VScale = new VBI.AttributeProperty(dat, 'valueScale', this.m_DataSource, ctx, 1.0));
			this.m_Props.push(this.m_AExp = new VBI.AttributeProperty(dat, 'alphaExponent', this.m_DataSource, ctx, 1.0));
			this.m_Props.push(this.m_CExp = new VBI.AttributeProperty(dat, 'colorExponent', this.m_DataSource, ctx, 1.0));

			var genGradient = (jQuery.type(this.m_Gradient.m_Value) == 'array');
			this.GradientImage = new Image();
			this.GradientImage.onload = function() {
				this.GradientImage.IsLoaded = true;
			}.bind(this);
			if (genGradient) {
				this.m_GeneratedGradient = this.GenerateGradient(this.m_Gradient.m_Value);
				this.GradientImage.src = this.m_GeneratedGradient;
			} else {
				this.GradientImage.src = ctx.GetResources().GetData(this.m_Gradient.GetValueString(ctx));
			}
			this.cache = undefined;

			// load shared properties...........................................//
			this.BaseLoad(dat, ctx, this);
		};

		this.SetColor = function(c, pos, mult1, col1, mult2, col2) {
			var j = 4 * pos;
			c[j] = col1[0] * mult1 + col2[0] * mult2;
			c[j + 1] = col1[1] * mult1 + col2[1] * mult2;
			c[j + 2] = col1[2] * mult1 + col2[2] * mult2;
			c[j + 3] = col1[3] * mult1 + col2[3] * mult2;
			// VBI.Trace("Set " + pos + " to [" + c[j] + "," + c[j + 1] + "," + c[j + 2] + "]");
		};

		this.SetColor1 = function(c, pos, col) {
			var j = 4 * pos;
			c[j] = col[0];
			c[j + 1] = col[1];
			c[j + 2] = col[2];
			c[j + 3] = 255;
			// VBI.Trace("Set " + pos + " to [" + c[j] + "," + c[j + 1] + "," + c[j + 2] + "]");
		};

		this.GenerateGradient = function(colGradient) {
			var colStops = colGradient.length / 2;
			var cWidth = colGradient[2 * (colStops - 1)];
			var idPrefix = this.m_Scene.m_TargetName + "-" + this.m_Scene.m_ID + "-";
			var tempCanvas = VBI.Utilities.CreateGeoSceneCanvas(idPrefix + "temporary", cWidth, 1, 0, false);
			var ctx = tempCanvas.getContext("2d");
			var cols = [];
			ctx.lineWidth = 1;
			var i;
			for (i = 0; i < colStops; ++i) {
				ctx.fillStyle = colGradient[2 * i + 1];
				ctx.fillRect(colGradient[2 * i], 0, 1, 1);
				var iData = ctx.getImageData(colGradient[2 * i], 0, 1, 1);
				cols.push(iData.data);
			}
			var wholeLine = ctx.getImageData(0, 0, cWidth, 1);
			for (i = 1; i < colStops; ++i) {
				var col1 = cols[i - 1];
				var col1hls = VBI.Utilities.RGB2HLS(col1[0], col1[1], col1[2]);
				var hue1 = col1hls[0];
				var lum1 = col1hls[1];
				var sat1 = col1hls[2];
				var start = colGradient[2 * (i - 1)], end = colGradient[2 * i], divider = end - start;
				var col2 = cols[i];
				var col2hls = VBI.Utilities.RGB2HLS(col2[0], col2[1], col2[2]);
				var hue2 = col2hls[0];
				var delta = (hue2 - hue1) / divider;
				for (var j = start; j <= end; ++j) {
					var cCol = VBI.Utilities.HLS2RGB(hue1 + (j - start) * delta, lum1, sat1);
					this.SetColor1(wholeLine.data, j, cCol);
				}
			}

			ctx.putImageData(wholeLine, 0, 0);
			return tempCanvas.toDataURL("png");
		};

		this.CollectData = function(ctx) {
			var scene = this.m_Scene;
			var node, aVal = [], aRad = [], aPos = [];
			var myList = [];
			var maxRad = 0;
			if ((node = this.m_DataSource.GetCurrentNode(ctx))) {
				for (var nJ = 0, len = node.m_dataelements.length; nJ < len; ++nJ) {
					this.m_DataSource.Select(nJ);
					var pos = this.m_Pos.GetValueVector(ctx);
					myList.push({
						x: pos[0],
						y: pos[1],
						r: this.m_Radius.GetValueFloat(ctx),
						v: this.m_Value.GetValueFloat(ctx)
					});
				}
				myList.sort(function(a, b) {
					return a.x - b.x;
				});

				for (var nK = 0; nK < myList.length; ++nK) {
					var elte = myList[nK];
					aVal.push(elte.v);
					aRad.push(elte.r);
					aPos.push(elte.x, elte.y, 0);
					if (elte.r > maxRad) {
						maxRad = elte.r;
					}
				}
			}

			scene.FillPositionCache(aPos, true);
			this.cache = aPos.cache;
			this.cache.val = aVal;
			this.cache.rad = aRad;
			this.cache.maxRad = maxRad;
		};

		this.Init4Render = function() {
			this.m_IO = [];
		};

		this.AddPoints2Heatmap = function(heatmap, oVal, eLod, correction, vFactor) {
			// VBI.Trace("Counter: " + (this.mCnt = this.mCnt ? this.mCnt + 1 : 1));
			var heatmpaVals = heatmap.m_V;
			var scene = this.m_Scene;
			heatmap.Clear();
			var val, hsize;
			var hmWidth = heatmap.m_W;
			var hmHeight = heatmap.m_H;
			var maxHSize = (eLod * oVal.maxRad / correction) / 2.0;

			var pos = scene.GetPointArrayFromUCSArray(oVal.data);
			for (var nK = 0; nK < this.m_IO.length; ++nK) {
				// loop for round world instances
				var len = oVal.data.length;
				var offset = this.m_IO[nK];
				var x0 = pos[0] + offset, xl = pos[len - 3] + offset;
				var tp0 = 0, tp1 = len / 3, bt0 = 0, bt1 = 0, mdl;
				if (x0 <= -maxHSize && xl > -maxHSize) {
					tp0 = len / 3;
					while (tp0 > bt0 + 1) {
						mdl = Math.floor((bt0 + tp0) / 2);
						if (pos[3 * mdl] + offset <= -maxHSize) {
							bt0 = mdl;
						} else {
							tp0 = mdl;
						}
					}
				}

				if (x0 > hmHeight + maxHSize && xl <= hmHeight + maxHSize) {
					while (tp1 > bt1 + 1) {
						mdl = Math.floor((bt1 + tp1) / 2);
						if (pos[3 * mdl] + offset <= hmHeight + maxHSize) {
							bt1 = mdl;
						} else {
							tp1 = mdl;
						}
					}
				}
				// VBI.Trace("Rendering with IO = " + this.m_IO[nK] + " from " + tp0 + " to " + (tp1 - 1));
				for (var nJ = 3 * tp0, cnt = tp0; cnt < tp1; nJ += 3, cnt++) {
					var px = pos[nJ] + offset;
					var py = pos[nJ + 1];
					hsize = (eLod * oVal.rad[cnt] / correction) / 2.0;
					if ((py > -hsize) && (px < hmWidth + hsize)) {
						val = vFactor * (oVal.val[cnt]) / 50;
						heatmpaVals.AddPoint(px, py, val, hsize);
					}
				}
			}
			heatmpaVals.m_PointsSet = true;
		};

		// Heatmap.Render with respect to data binding.........................//
		this.Render = function(canvas, dc) {
			// var ts = Date.now();
			// get scene and desin mode.........................................//
			var scene = this.m_Scene;
			var ctx = scene.m_Ctx;
			var actWidth = canvas.clientWidth;
			var actHeight = canvas.clientHeight;
			var width = scene.m_nWidthCanvas;
			var height = scene.m_nHeightCanvas;

			var gradPic = this.m_GeneratedGradient ? this.m_GeneratedGradient : ctx.GetResources().GetData(this.m_Gradient.GetValueString(ctx));
			if (this.HeatmapWidth != width || this.HeatmapHeight != height) {
				var canv = document.createElement("canvas");
				canv.width = 2 * width;
				canv.height = 2 * height;
				this.Heatmap = VBI.CreateHM({
					canvas: canv,
					colorTexture: gradPic,
					colorTex: this.GradientImage,
					alpha: true,
					width: 2 * width, // we use double sizes as the actual canvas might use upto double size
					height: 2 * height,
					scene: this.m_Scene,
					aFunc: this.m_AExp.GetValueFloat(ctx),
					cFunc: this.m_CExp.GetValueFloat(ctx)
				});
				this.HeatmapWidth = width;
				this.HeatmapHeight = height;
			}

			var heatmap = this.Heatmap;
			if (!this.cache) {
				this.CollectData(ctx);
			}
			var lt = scene.GetPointFromUCSPoint([
				this.cache.lt[0], this.cache.lt[1]
			]);
			var rb = scene.GetPointFromUCSPoint([
				this.cache.rb[0], this.cache.rb[1]
			]);
			var zzf = scene.GetZoomFactor4Mode();

			this.m_IO = scene.GetCorrectedInstanceOffsets([
				lt[0], lt[1], rb[0], rb[1]
			], zzf);

			var rFactor = this.m_RScale.GetValueFloat(ctx);
			var vFactor = this.m_VScale.GetValueFloat(ctx);
			var behav = this.m_Behavior.GetValueFloat(ctx);
			var exactLod = scene.m_Canvas[0].m_nExactLOD;
			var integerLod = Math.floor(exactLod);
			var correction = (scene.m_bObjCanvasMode == 0 ? Math.pow(2, exactLod - integerLod) : 1.0) / rFactor;
			var eLod = 1.0;
			if (behav > 0) {
				eLod = 1 + scene.m_Canvas[0].m_nExactLOD;
				if (behav == 2) {
					eLod = Math.pow(2, eLod);
				}
			}
			this.AddPoints2Heatmap(heatmap, this.cache, eLod, correction, vFactor);
			heatmap.Render(); // render

			var a = dc.globalAlpha;
			dc.globalAlpha = this.m_Opacity.GetValueFloat(ctx);
			dc.drawImage(heatmap.m_Canv, 0, 0, actWidth, actHeight, 0, 0, actWidth, actHeight);
			dc.globalAlpha = a;
			// VBI.Trace("Rendering of Heatmap took " + (Date.now() - ts) + " ms");
		};

		this.DetailHitTest = function(ocb, nIndex, nsx, nsy) {
			return null; // no hit
		};

		this.GetHitArray = function(x, y) {
			// determine the array of instances that are hit
			// x and y are the canvas relative coordinates
			var zsf = this.m_Scene.GetStretchFactor4Mode();

			// bounding boxes are defined always in non stretched canvas
			// coordinates, therefore transform them
			var nsx = x / zsf[0];
			var nsy = y / zsf[1];
			var ocb = {
				m_cb: this.DetailHitTest.bind(this)
			};
			// call base function for bounds check
			return this.BaseHitTest(nsx, nsy, ocb);
		};

		// design overridden members...........................................//
		this.DesignBeginDrag = function(ocb) {
			// append the original scale to the context.........................//
			ocb.m_ScaleOrig = this.m_Scale.GetValueVector(this.m_Scene.m_Ctx).slice(0);
			ocb.m_DhOrig = this.m_DH[ocb.m_Index].slice(0);
			if (ocb.m_IO) {
				(ocb.m_DhOrig[0])[0] += ocb.m_IO;
				(ocb.m_DhOrig[0])[2] += ocb.m_IO;
			}
		};

		this.DesignBoxSize = VBI.Utilities.SceneBindDesignBoxBoxSize.bind(this, true);

		// event handlers.........................................................//
	};
	VBI.VisualObjects.HeatMap.prototype = VBI.VisualObjects.Base;

// ...........................................................................//
// container.................................................................//

	VBI.VisualObjects.Container = function() {
		this.m_Sub = []; // subscriptions...............................//
		this.m_bContainer = true;
		this.m_openWin = [];
		this.m_Marker = 1;

		this.load = function(dat, ctx) {
			// call prototype......................................................//
			Object.getPrototypeOf(this).load.call(this, dat, ctx);

			this.m_Props.push(this.m_DataSource = new VBI.NodeProperty(dat, 'datasource', null, ctx));
			this.m_Props.push(this.m_Pos = new VBI.AttributeProperty(dat, 'pos', this.m_DataSource, ctx));
			this.m_Props.push(this.m_Key = new VBI.AttributeProperty(dat, 'key', this.m_DataSource, ctx, ""));
			this.m_Props.push(this.m_Tooltip = new VBI.AttributeProperty(dat, 'tooltip', this.m_DataSource, ctx, ""));
			this.m_Props.push(this.m_Alignment = new VBI.AttributeProperty(dat, 'alignment', this.m_DataSource, ctx, "0"));

			// push the subscriptions..............................................//
			this.m_Sub.push(this.m_Scene.m_EvtCont.subscribe("onMove", this.onLayout.bind(this)));
			// this.m_Sub.push(this.m_Scene.m_EvtCont.subscribe("onZoom", this.onLayout.bind(this)));
			// force update
			this.m_bChanged = true;
		};

		this.clear = function() {
			// unsubscribe events..................................................//
			for (var nJ = 0, len = this.m_Sub.length; nJ < len; ++nJ) {
				this.m_Sub[nJ].unsubscribe();
			}
			this.m_Sub = [];

			// ... and delete container entries
			this.m_Marker++;
			this.sweepContainers(this.m_Scene.m_Ctx);

			// call common prototype impl part.....................................//
			Object.getPrototypeOf(this).clear.call(this);
		};

		// helper functions.......................................................//
		this.getParentDiv = function() {
			return this.m_Scene.m_MapsLayerDiv;
		};

		// mark and sweep.........................................................//

		this.sweepContainers = function(ctx) {
			for ( var key in this.m_openWin) {
				if (this.m_openWin[key].Marker != this.m_Marker) {
					var cont = this.m_openWin[key];
					ctx.onCloseContainer(cont.id, cont);

					var par = this.getParentDiv();
					par.removeChild(cont);
					delete this.m_openWin[key];
				}
			}
		};

		this.updateContainers = function(canvas, scene, ctx) {
			// mark containers for potential deletion..........................//

			var div = this.getParentDiv();
			var oX = canvas.getPixelLeft();
			var oY = canvas.getPixelTop();
			var len, nJ;
			// determine the array of instances that are hit....................//
			// x and y are the canvas relative coordinates......................//
			var node;
			if ((node = this.m_DataSource.GetCurrentNode(ctx))) {
				len = node.m_dataelements.length;
				for (nJ = 0; nJ < len; ++nJ) {
					this.m_DataSource.Select(nJ);

					var pos = this.m_Pos.GetValueVector(ctx);
					var key = this.m_Key.GetValueString(ctx);
					var tt = this.m_Tooltip.GetValueString(ctx);
					var lt = scene.GetPointFromPos(pos, false);

					// when container with a key is found, then use it
					var cont = this.m_openWin[key];
					if (cont) {
						// when we find a container but it has no content (anymore)//
						// ask for content by calling open window..................//
						if (!cont.children.length) {
							ctx.onOpenContainer(key, cont);
						}
					} else {
						// create a new one and add it............................//
						cont = VBI.Utilities.CreateContainer("vbi_" + key, key, oX + (lt[0] | 0), oY + (lt[1] | 0), "50px", "30px", tt);
						cont.addEventListener("mouseover", this.onMouseOverDiv.bind(cont));
						cont.addEventListener("mouseout", this.onMouseOutDiv.bind(cont));
						cont.m_ID = this.m_ID;
						this.m_openWin[key] = cont;
						this.m_openWin[key].index = nJ;
						div.appendChild(cont);

						// call hook...............................................//
						ctx.onOpenContainer(key, cont);
					}
					this.m_openWin[key].Marker = this.m_Marker;
				}
			}
			this.sweepContainers(ctx);
		};

		this.onMouseOverDiv = function() {
			this.bIsHot = true;
		};

		this.onMouseOutDiv = function() {
			this.bIsHot = false;
		};

		this.onLayout = function(o) {
			// there was a move or zoom.........................................//

			// determine the array of instances that are hit....................//
			// x and y are the canvas relative coordinates......................//
			var scene = this.m_Scene;
			var canvas = scene.m_Canvas[scene.m_nOverlayIndex];
			this.clusterParams = this.GetClusterPosParameters();
			var fExactLod = scene.m_Canvas[0].m_nExactLOD;

			if (!this.m_LastCanvasPos || this.m_LastCanvasPos[2] != fExactLod) {
				return;
			}

			var delta = [
				canvas.getPixelLeft() - this.m_LastCanvasPos[0], canvas.getPixelTop() - this.m_LastCanvasPos[1]
			];

			for ( var key in this.m_openWin) {
				var cont = this.m_openWin[key];
				if (delta[0]) {
					var newX = parseFloat(cont.style.left) + delta[0];
					newX += this.findRoundWorldOffset(newX);
					cont.style.left = (newX) + "px";
				}
				if (delta[1]) {
					cont.style.top = (parseInt(cont.style.top, 10) + delta[1]) + "px";
				}
			}

			this.m_LastCanvasPos = [
				canvas.getPixelLeft(), canvas.getPixelTop(), scene.m_Canvas[0].m_nExactLOD
			];
		};

		this.ContainerAlign = function(cont, ctx) {
			var algnmt = this.m_Alignment.GetValueString(ctx);
			var oStyle = cont.style;
			switch (algnmt) {
				case "0":
					oStyle.msTransform = oStyle.transform = oStyle.webkitTransform = "translate( -50%, -50%)";
					break; // center
				case "1":
					oStyle.msTransform = oStyle.transform = oStyle.webkitTransform = "translate( -50%,   0%)";
					break; // top center
				case "2":
					oStyle.msTransform = oStyle.transform = oStyle.webkitTransform = "translate(-100%,   0%)";
					break; // top right
				case "3":
					oStyle.msTransform = oStyle.transform = oStyle.webkitTransform = "translate(-100%, -50%)";
					break; // center right
				case "4":
					oStyle.msTransform = oStyle.transform = oStyle.webkitTransform = "translate(-100%,-100%)";
					break; // bottom right
				case "5":
					oStyle.msTransform = oStyle.transform = oStyle.webkitTransform = "translate( -50%,-100%)";
					break; // bottom center
				case "6":
					oStyle.msTransform = oStyle.transform = oStyle.webkitTransform = "translate(   0%,-100%)";
					break; // bottom left
				case "7":
					oStyle.msTransform = oStyle.transform = oStyle.webkitTransform = "translate(   0%, -50%)";
					break; // center left
				default:
				case "8":
					oStyle.msTransform = oStyle.transform = oStyle.webkitTransform = "translate(0%, 0%)";
					break; // top left
			}
		};

		// render with respect to data binding....................................//
		this.RenderInstances = function(canvas, zsf) {
			var scene = this.m_Scene;
			var ctx = scene.m_Ctx;

			// mark all containers.................................................//
			if (this.m_bChanged) {
				this.updateContainers(canvas, scene, ctx);
				this.m_bChanged = false;
			}

			var oX = canvas.getPixelLeft();
			var oY = canvas.getPixelTop();
			if (this.m_DataSource.GetCurrentNode(ctx)) {
				for ( var key in this.m_openWin) {
					// for (var nJ = 0; nJ < len; ++nJ) {
					var cont = this.m_openWin[key];
					if (cont.index == undefined) {
						continue;
					}
					this.m_DataSource.Select(cont.index);
					var pos = this.m_Pos.GetValueVector(ctx);

					var lt = scene.GetPointFromPos(pos, true);
					var left = Math.round(oX + (lt[0] | 0) * zsf[0]);
					left = left + this.findRoundWorldOffset(left);

					cont.style.left = left + "px";
					cont.style.top = Math.round(oY + (lt[1] | 0) * zsf[1]) + "px";
					this.ContainerAlign(cont, ctx);
				}
			}
		};

		this.GetClusterPosParameters = function() {
			var retVal = {};
			var scene = this.m_Scene;
			var fExactLod = scene.m_Canvas[0].m_nExactLOD;
			retVal.worldPxOnLOD = Math.pow(2, fExactLod) * scene.m_nWidthCanvas / scene.m_nTilesX * scene.m_Proj.m_nXYRatio;
			retVal.nLeftBorder = scene.m_nDivWidth - retVal.worldPxOnLOD;
			retVal.nRightBorder = scene.m_nDivWidth - retVal.nLeftBorder;
			return retVal;
		};

		this.findRoundWorldOffset = function(xVal) {
			var offset = 0;
			var custParams = this.clusterParams;
			while (xVal + offset < custParams.nLeftBorder) {
				offset += custParams.worldPxOnLOD;
			}

			while (xVal + offset > custParams.nRightBorder) {
				offset -= custParams.worldPxOnLOD;
			}

			return offset;
		};

		this.GetClusterPosition = function(dc, elem, conf, nLod, nDist, lodF, xOff, yOff) {
			var lt;
			var scene = this.m_Scene;
			var oX = dc.canvas.getPixelLeft();
			var oY = dc.canvas.getPixelTop();
			var zf = scene.GetCurrentZoomFactors();
			lt = [
				oX + zf[0] * (lodF * elem[0] - xOff), oY + zf[1] * (lodF * elem[1] - yOff)
			];

			var offset = this.findRoundWorldOffset(lt[0]);
			var zzf = this.m_Scene.GetZoomFactor4Mode();
			lt[0] += offset;
			lt[2] = offset / zzf[0];

			if (elem.c != undefined && conf.anim && (nLod > conf.animLow) && nDist && elem.c != undefined && elem.c.lod == nLod - 1) {
				var zsf = this.m_Scene.GetStretchFactor4Mode();
				var fElem = elem.c;
				var nDist3 = nDist * nDist;

				lt = [
					oX + offset + zf[0] * (lodF * (elem[0] * (1 - nDist3) + fElem[0] * nDist3) - xOff), oY + zf[1] * (lodF * (elem[1] * (1 - nDist3) + fElem[1] * nDist3) - yOff), offset / zzf[0]
				];
				if (conf.anim == 2) {
					var xyOrg = [
						offset + zzf[0] * (lodF * fElem[0] - xOff), zzf[1] * (lodF * fElem[1] - yOff)
					];
					var tr = 2 * Math.abs(0.5 - nDist);
					var trans = "" + (1 - tr);
					dc.strokeStyle = "rgba(110,110,110," + trans + ")";
					dc.lineWidth = 2;
					dc.lineCap = 'round';
					dc.beginPath();
					dc.moveTo((lt[0] - oX) / zsf[0], (lt[1] - oY) / zsf[0]);
					dc.lineTo(xyOrg[0], xyOrg[1]);
					dc.stroke();
				}
			}
			return lt;
		};

		this.RenderThisInstance = function(elem, edges, conf, cI, nIndex, nOrgIndex, dc, dcs, nLod, nDist, lodF, xOff, yOff, bRenderWithLabel) {
			var scene = this.m_Scene;
			var ctx = this.m_Scene.m_Ctx;
			var div = this.getParentDiv();

			var lt = this.GetClusterPosition(dc, elem, conf, nLod, nDist, lodF, xOff, yOff);

			var instanceIdent = scene.m_Ctx.m_Clustering.getClusterIdent(scene.m_PreassembledData, cI, nOrgIndex);
			var cont = this.m_openWin[instanceIdent];

			if (cont == undefined) {
				// create a new one and add it............................//
				cont = VBI.Utilities.CreateContainer("vbi_" + instanceIdent, instanceIdent, lt[0], lt[1], "50px", "30px", "", true);
				cont.addEventListener("mouseover", this.onMouseOverDiv.bind(cont));
				cont.addEventListener("mouseout", this.onMouseOutDiv.bind(cont));
				cont.m_ID = this.m_ID;
				cont.index = elem.nJ;

				div.appendChild(cont);
				this.m_openWin[instanceIdent] = cont;

				// call hook...............................................//
				ctx.onOpenContainer(instanceIdent, cont);
				this.ContainerAlign(cont, ctx);

			} else {
				if (cont.bIsHot) {
					this.RenderShadow(dcs, elem, edges, conf, nLod, lodF, xOff - lt[2], yOff);
				}
				cont.style.left = Math.round(lt[0]) + "px";
				cont.style.top = Math.round(lt[1]) + "px";
			}

			this.m_openWin[instanceIdent].Marker = this.m_Marker;
		};

		// Container.Render with respect to data binding....................................//
		this.Render = function(canvas, dc, preAssembledData, shadow, dcs, bCluster) {
			var scene = this.m_Scene;
			var ctx = this.m_Scene.m_Ctx;
			var fExactLod = scene.m_Canvas[0].m_nExactLOD;
			this.m_Marker++;
			this.clusterParams = this.GetClusterPosParameters();

			if (bCluster) {
				var cntInstances = 0;
				var xOff = scene.m_Canvas[0].m_nCurrentX * scene.m_MapManager.m_tileWidth;
				var yOff = scene.m_Canvas[0].m_nCurrentY * scene.m_MapManager.m_tileHeight;
				var conf = preAssembledData.config;
				var cI = preAssembledData.cI;
				var fNode = preAssembledData.m_TreeFatherNode;
				var nLOD = Math.ceil(fExactLod);
				if (fNode) {
					var nDist = this.GetAnimClusterDistance(nLOD, fExactLod);
					cntInstances = this.RenderTree(fNode, preAssembledData.m_edges, conf, cI, cntInstances, nLOD, nDist, dc, dcs, preAssembledData.m_lodOffset, xOff, yOff, false);
				} else {
					var lodF = preAssembledData.m_lodOffset;
					var nElements = preAssembledData.length;
					for (var nL = 0; nL < nElements; ++nL) {
						var elem = preAssembledData[nL];
						if (!elem.b2Ignore) {
							if (this.RenderThisInstance(elem, preAssembledData.m_edges, conf, cI, cntInstances, nL, dc, dcs, nLOD, 0, lodF, xOff, yOff, false)) {
								cntInstances++;
							}
						}
					}
				}
				this.sweepContainers(ctx);

			} else if (this.m_DataSource.GetCurrentNode(ctx)) { // Virtual Node only
				var zsf = this.m_Scene.GetStretchFactor4Mode();
				this.RenderInstances(canvas, [
					zsf[0], zsf[1]
				]);
			}
			var canvas2 = scene.m_Canvas[scene.m_nOverlayIndex];
			this.m_LastCanvasPos = [
				canvas2.getPixelLeft(), canvas2.getPixelTop(), fExactLod
			];
		};

		this.GetHitArray = function(x, y) {
			var hits = [];
			for ( var key in this.m_openWin) {
				// when container with a key is found, then use it
				var cont = this.m_openWin[key];
				if (cont && cont.bIsHot) {
					hits.push({
						m_Index: cont.index,
						m_Entity: null, // this.GetEntity(nJ, this.m_Scene.m_Ctx),
						m_Detail: {
							m_hit: 2
						},
						m_IO: 0
					});
				}
			}
			return hits;
		};

		// event handler..........................................................//
		this.onclick = function(event) {
			// call base implementation for click events...........................//
			return this.BaseClick(event);
		};
	};
	VBI.VisualObjects.Container.prototype = VBI.VisualObjects.Base;

// ........................................................................//
// 2D controls............................................................//
// prototype object of 2D controls........................................//

	VBI.VisualObjects.Base2D = function() {
		this.m_DOMElement = null;

		// we do calculated paddings for our 2D ui elements to get rid of an...//
		// additional container................................................//

		this.m_paddingLeft = 5;
		this.m_paddingTop = 5;
		this.m_paddingRight = 5;
		this.m_paddingBottom = 5;

		// check if the ui element is still valid..............................//
		this.IsValid = function() {
			if (this.m_DOMElement && this.m_Scene.m_Div) {
				// check if everything is still ok...............................//
				if (this.m_DOMElement.parentNode == this.m_Scene.m_Div) {
					return true;
				}
			}
			return false;
		};

		this.load = function(inst, dat, ctx) {
			// call prototype of base class.....................................//
			Object.getPrototypeOf(this).load.call(inst, dat, ctx);

			// load bindable properties.........................................//
			inst.m_Props.push(inst.m_Left = new VBI.AttributeProperty(dat, 'left', null, ctx));
			inst.m_Props.push(inst.m_Top = new VBI.AttributeProperty(dat, 'top', null, ctx));
			inst.m_Props.push(inst.m_Right = new VBI.AttributeProperty(dat, 'right', null, ctx));
			inst.m_Props.push(inst.m_Bottom = new VBI.AttributeProperty(dat, 'bottom', null, ctx));

			// align values left:1, right:2, center:4 ,,,,,,,,,,,,,,,,,,,,,,,,,,//
			inst.m_Props.push(inst.m_Align = new VBI.AttributeProperty(dat, 'align', null, ctx, 1));
		};

		this.clear = function() {
			// call prototype of base class.....................................//
			// Note: This prototype method runs in the scope of the actual object.
			// Thus getPrototypeOf() returns VisualObjects.Base2D and we need to call again to get the VisualObjects.Base impl!
			Object.getPrototypeOf(Object.getPrototypeOf(this)).clear.call(this);

			this.m_DOMElement = null;
		};

		// .....................................................................//
		// overwritten functions...............................................//

		this.BaseClick = function(event) {
			var scene = this.m_Scene;

			// check for subscribed action and fire event.......................//
			var actions;
			if ((actions = scene.m_Ctx.m_Actions)) {
				var action;
				if ((action = actions.findAction("Click", scene, this))) {
					scene.m_Ctx.FireAction(action, scene, this, null, scene.GetEventVPCoordsObj(event));
					event.preventDefault();
					return true; // handled
				}
			}

			return false;
		};
	};
	VBI.VisualObjects.Base2D.prototype = VBI.VisualObjects.Base;

// ........................................................................//
// caption object.........................................................//

	VBI.VisualObjects.Caption = function() {
		this.m_LineWidth = 1;
		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load(this, dat, ctx);

			// load bindable properties.........................................//
			this.m_Props.push(this.m_Text = new VBI.AttributeProperty(dat, 'text', null, ctx, ""));
			this.m_Props.push(this.m_Design = new VBI.AttributeProperty(dat, 'design', null, ctx, "0"));
			this.m_Props.push(this.m_Level = new VBI.AttributeProperty(dat, 'level', null, ctx, 0));
			this.m_Props.push(this.m_Tooltip = new VBI.AttributeProperty(dat, 'tooltip', null, ctx, ""));
		};

		// Caption.Render with respect to data binding.................................//
		this.Render = function(canvas, dc, clusterData) {
			if (this.IsValid()) {
				return; // no update needed.........................//
			}
			// get properties and apply them to the dom element.................//
			var ctx = this.m_Scene.m_Ctx;
			var l = this.m_Left.GetValueLong(ctx);
			var t = this.m_Top.GetValueLong(ctx);
			var r = this.m_Right.GetValueLong(ctx);
			var b = this.m_Bottom.GetValueLong(ctx);
			var align = this.m_Align.GetValueLong(ctx);
			var txt = this.m_Text.GetValueString(ctx);
			var dsn = this.m_Design.GetValueLong(ctx);
			var lev = this.m_Level.GetValueLong(ctx);
			var tt = this.m_Tooltip.GetValueString(ctx);

			this.m_DOMElement = VBI.Utilities.CreateCaption(this.m_ID, txt, l + this.m_paddingLeft, t + this.m_paddingTop, r + this.m_paddingLeft, b + this.m_paddingTop, tt, dsn, lev, align);

			// append the child to the div......................................//
			this.m_Scene.m_Div.appendChild(this.m_DOMElement);
		};
	};

	VBI.VisualObjects.Caption.prototype = new VBI.VisualObjects.Base2D();

// ........................................................................//
// caption object.........................................................//

	VBI.VisualObjects.Label = function() {
		this.m_LineWidth = 1;

		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load(this, dat, ctx);

			// load bindable properties.........................................//
			this.m_Props.push(this.m_Text = new VBI.AttributeProperty(dat, 'text', null, ctx, ""));
			this.m_Props.push(this.m_Design = new VBI.AttributeProperty(dat, 'design', null, ctx, "0"));
		};

		// Label.Render with respect to data binding.................................//
		this.Render = function(canvas, dc, clusterData) {
			if (this.IsValid()) {
				return; // no update needed.........................//
			}
			// get properties and apply them to the dom element.................//
			var ctx = this.m_Scene.m_Ctx;
			var l = this.m_Left.GetValueLong(ctx);
			var t = this.m_Top.GetValueLong(ctx);
			var r = this.m_Right.GetValueLong(ctx);
			var align = this.m_Align.GetValueLong(ctx);
			var b = this.m_Bottom.GetValueLong(ctx);
			var txt = this.m_Text.GetValueString(ctx);
			this.m_DOMElement = VBI.Utilities.CreateLabel(this.m_ID, txt, l + this.m_paddingLeft, t + this.m_paddingTop, r + this.m_paddingLeft, b + this.m_paddingTop, 0, align);

			// append the child to the div......................................//
			this.m_Scene.m_Div.appendChild(this.m_DOMElement);
		};
	};
	VBI.VisualObjects.Label.prototype = new VBI.VisualObjects.Base2D();

// ........................................................................//
// link object............................................................//

	VBI.VisualObjects.Link = function() {
		this.m_LineWidth = 1;

		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load(this, dat, ctx);

			// load bindable properties.........................................//
			this.m_Props.push(this.m_Reference = new VBI.AttributeProperty(dat, 'reference', null, ""));
			this.m_Props.push(this.m_Autoexecute = new VBI.AttributeProperty(dat, 'autoexecute', null, ctx, false));
			this.m_Props.push(this.m_Tooltip = new VBI.AttributeProperty(dat, 'tooltip', null, ctx, ""));
			this.m_Props.push(this.m_Text = new VBI.AttributeProperty(dat, 'text', null, ctx, ""));
		};

		this.clear = function() {
			// unsubscribe events...............................................//
			if (this.m_DOMElement) {
				this.m_DOMElement.onclick = null;
			}
			// call prototype of base class.....................................//
			Object.getPrototypeOf(this).clear.call(this);
		};

		// Link.Render with respect to data binding.................................//
		this.Render = function(canvas, dc, clusterData) {
			if (this.IsValid()) {
				return; // no update needed.........................//
			}
			// get properties and apply them to the dom element.................//
			var ctx = this.m_Scene.m_Ctx;
			var l = this.m_Left.GetValueLong(ctx);
			var t = this.m_Top.GetValueLong(ctx);
			var r = this.m_Right.GetValueLong(ctx);
			var b = this.m_Bottom.GetValueLong(ctx);
			var align = this.m_Align.GetValueLong(ctx);
			var txt = this.m_Text.GetValueString(ctx);
			var ref = this.m_Reference.GetValueString(ctx);
			var ae = this.m_Autoexecute.GetValueBool(ctx);
			var tt = this.m_Tooltip.GetValueString(ctx);

			this.m_DOMElement = VBI.Utilities.CreateLink(this.m_ID, txt, l + this.m_paddingLeft, t + this.m_paddingTop, r + this.m_paddingLeft, b + this.m_paddingTop, ae ? ref : null, tt, align);

			// append the child to the div......................................//
			this.m_Scene.m_Div.appendChild(this.m_DOMElement);

			// subscribe to events..............................................//
			this.m_DOMElement.onclick = this.onclick.bind(this);
		};

		// event handler.......................................................//
		this.onclick = function(event) {
			// call base implementation for click events........................//
			return this.BaseClick(event);
		};
	};
	VBI.VisualObjects.Link.prototype = new VBI.VisualObjects.Base2D();

// ........................................................................//
// image object...........................................................//

	VBI.VisualObjects.Image = function() {
		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load(this, dat, ctx);

			// load bindable properties.........................................//
			this.m_Props.push(this.m_Image = new VBI.AttributeProperty(dat, 'image', null, ctx));
			this.m_Props.push(this.m_Tooltip = new VBI.AttributeProperty(dat, 'tooltip', null, ctx, ""));
		};

		// Image.Render with respect to data binding.................................//
		this.Render = function(canvas, dc, clusterData) {
			if (this.IsValid()) {
				return; // no update needed.........................//
			}
			// get properties and apply them to the dom element.................//
			var ctx = this.m_Scene.m_Ctx;
			var l = this.m_Left.GetValueLong(ctx);
			var t = this.m_Top.GetValueLong(ctx);
			var r = this.m_Right.GetValueLong(ctx);
			var b = this.m_Bottom.GetValueLong(ctx);
			var align = this.m_Align.GetValueLong(ctx);
			var img = this.m_Image.GetValueString(ctx);
			var tt = this.m_Tooltip.GetValueString(ctx);

			var image;
			if ((image = ctx.GetResources().GetImage(img))) {
				this.m_DOMElement = VBI.Utilities.CreateImage(this.m_ID, image, l + this.m_paddingLeft, t + this.m_paddingTop, r + this.m_paddingLeft, b + this.m_paddingTop, tt, align);

				// append the child to the div......................................//
				this.m_Scene.m_Div.appendChild(this.m_DOMElement);
			}
		};
	};
	VBI.VisualObjects.Image.prototype = new VBI.VisualObjects.Base2D();

// ........................................................................//
// button object..........................................................//

	VBI.VisualObjects.Button = function() {
		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load(this, dat, ctx);

			// load bindable properties.........................................//
			this.m_Props.push(this.m_Tooltip = new VBI.AttributeProperty(dat, 'tooltip', null, ctx, ""));
			this.m_Props.push(this.m_Text = new VBI.AttributeProperty(dat, 'text', null, ctx, ""));
		};

		this.clear = function() {
			// unsubscribe events...............................................//
			if (this.m_DOMElement) {
				this.m_DOMElement.onclick = null;
			}
			// call prototype of base class.....................................//
			Object.getPrototypeOf(this).clear.call(this);
		};

		// Button.Render with respect to data binding.................................//
		this.Render = function(canvas, dc, clusterData) {
			if (this.IsValid()) {
				return; // no update needed.........................//
			}

			// get properties and apply them to the dom element.................//
			var ctx = this.m_Scene.m_Ctx;
			var l = this.m_Left.GetValueLong(ctx);
			var t = this.m_Top.GetValueLong(ctx);
			var r = this.m_Right.GetValueLong(ctx);
			var b = this.m_Bottom.GetValueLong(ctx);
			var txt = this.m_Text.GetValueString(ctx);
			var tt = this.m_Tooltip.GetValueString(ctx);

			this.m_DOMElement = VBI.Utilities.CreateButton(this.m_ID, txt, l + this.m_paddingLeft, t + this.m_paddingTop, r + this.m_paddingLeft, b + this.m_paddingTop, tt);

			// append the child to the div......................................//
			this.m_Scene.m_Div.appendChild(this.m_DOMElement);

			// subscribe to events..............................................//
			this.m_DOMElement.onclick = this.onclick.bind(this);
		};

		// event handler.......................................................//
		this.onclick = function(event) {
			// call base implementation for click events........................//
			return this.BaseClick(event);
		};
	};
	VBI.VisualObjects.Button.prototype = new VBI.VisualObjects.Base2D();

// ........................................................................//
// dummy object...........................................................//

	VBI.VisualObjects.Dummy = function() {
		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load.call(this, dat, ctx);
		};

		// render the single instance..........................................//
		this.RenderInstance = function(nIndex, dc, xyz, scale, color) {
		};

		// Dummy.Render with respect to data binding.................................//
		this.Render = function(canvas, dc, clusterData) {
			// call base rendering method.......................................//
			this.BaseRender(canvas, dc);
		};

		this.RenderShadow = function(dcs, node, conf, lodF, xOff, yOff) {
		};

		// return this; automatically returned
	};
	VBI.VisualObjects.Dummy.prototype = VBI.VisualObjects.Base;

// ........................................................................//
// box3D object...........................................................//

	VBI.VisualObjects.Box3D = function() {
		// var m_BoxSceneId = null;

		this.load = function(dat, ctx) {
			// call prototype...................................................//
			Object.getPrototypeOf(this).load.call(this, dat, ctx);

			// load bindable properties.........................................//
			this.m_Props.push(this.m_DataSource = new VBI.NodeProperty(dat, 'datasource', null, ctx));
			this.m_Props.push(this.m_Pos = new VBI.AttributeProperty(dat, 'pos', this.m_DataSource, ctx, [
				0.0, 0.0, 0.0
			]));
			this.m_Props.push(this.m_Scale = new VBI.AttributeProperty(dat, 'scale', this.m_DataSource, ctx, [
				1.0, 1.0, 1.0
			]));
			this.m_Props.push(this.m_Tooltip = new VBI.AttributeProperty(dat, 'tooltip', this.m_DataSource, ctx, this.m_defaultTooltip));
			this.m_Props.push(this.m_Color = new VBI.AttributeProperty(dat, 'color', this.m_DataSource, ctx, this.m_defaultColor));
			this.m_Props.push(this.m_ColorBorder = new VBI.AttributeProperty(dat, 'colorBorder', this.m_DataSource, ctx, this.m_defaultColor));

			// load shared properties...........................................//
			this.BaseLoad(dat, ctx, this);
		};

		// render the single instance..........................................//
		this.RenderInstance = function(nIndex, pos, scale, color, colorBorder, fs) {
			// var scene = this.m_Scene;

			if (!scale) {
				scale = [
					1.0, 1.0, 1.0
				];
			}
			if (!color) {
				color = "#6f6f7a";
			}
			// determine the instance offsets...................................//
			// var aIO = this.m_IO[ nIndex ] = scene.GetInstanceOffsets( bb = this.m_BB[ nIndex ] = [ l, t, r, b ] );
		};

		// Box3D.Render with respect to data binding.................................//
		this.Render = function(canvas) {
			// get the scene and design mode....................................//
			var scene = this.m_Scene;

			if (!scene.m_bMainSceneInitialized) {
				return 0;
			}
			var ctx = scene.m_Ctx;
			var cntInstances = 0;

			var node;
			if ((node = this.m_DataSource.GetCurrentNode(ctx))) {
				cntInstances = node.m_dataelements.length;
				for (var nJ = 0; nJ < cntInstances; ++nJ) {
					this.m_DataSource.Select(nJ);
					var bHot = this.IsHot(nJ);
					var bSelected = this.IsSelected(ctx);

					var aPos = this.m_Pos.GetValueVector(ctx);
					var aScale = this.m_Scale.GetValueVector(ctx);

					var aCol = this.m_Color.GetValueColor(ctx);
					if (bSelected) {
						aCol = this.GetSelectColor(ctx, aCol);
					}
					if (bHot) {
						aCol = this.GetHotColor(ctx, aCol);
					}
					var aColBorder = this.m_ColorBorder.GetValueColor(ctx);
					if (bSelected) {
						aColBorder = this.GetSelectColor(ctx, aColBorder);
					}
					if (bHot) {
						aColBorder = this.GetHotColor(ctx, aColBorder);
					}

					var aFxSize = this.m_FxSize.GetValueBool(ctx);

					this.RenderInstance(nJ, aPos, aScale, aCol, aColBorder, aFxSize);
				}
			} // check: do single instance rendering in else branch

			// call base rendering method.......................................//
			// this.BaseRender( canvas, dc );

			return cntInstances; // to increase count of Scaling instances
		};

		this.DetailHitTest = function(ocb, nIndex, nsx, nsy) {
		};

		this.GetHitArray = function(x, y) {
		};
		// this.DesignBoxSize = VBI.Utilities.SceneBindDesignBoxBoxSize.bind( this, false );
		// event handlers......................................................//
	};
	VBI.VisualObjects.Box3D.prototype = VBI.VisualObjects.Base;
	// return the visual object...............................................//
	return visualobjects;
};

});
