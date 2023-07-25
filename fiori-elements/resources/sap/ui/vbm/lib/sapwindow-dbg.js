/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// this module does the window handling
// Author: Ulrich Roegelein
// the scene manager manages the scene instances in a component context

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

VBI.Windows = function() {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	var windows = {};
	windows.vbiclass = "Windows";
	windows.m_WindowArray = [];

	// ........................................................................//
	// helper functions.......................................................//

	windows.find = function(name) {
		// find the window by id...............................................//
		for (var nJ = 0, len = windows.m_WindowArray.length; nJ < len; ++nJ) {
			if (windows.m_WindowArray[nJ].m_ID == name) {
				return windows.m_WindowArray[nJ];
			}
		}

		return null;
	};

	windows.clear = function() {
		// clear the windows array.............................................//
		for (var nJ = 0; nJ < windows.m_WindowArray.length; ++nJ) {
			windows.m_WindowArray[nJ].clear();
		}

		// empty the windows array.............................................//
		windows.m_WindowArray = [];
	};

	windows.create = function(desc, ctx) {
		var wnd = null;

		switch (desc.type) {
			case 'callout':
				wnd = new VBI.CalloutWindow();
				break;
			case 'legend':
				wnd = new VBI.LegendWindow();
				break;
			default:
				wnd = new VBI.Window();
				break;
		}
		if (wnd) {
			wnd.load(desc, ctx);
		}
		return wnd;
	};

	// loading from the project file..........................................//
	windows.load = function(dat, ctx) {
		// process removal of windows first....................................//
		var a, nJ, len;
		if (dat.Remove) {
			if (jQuery.type(dat.Remove) == 'object') {
				// this is an object.............................................//
				if (dat.Remove.name) {
					windows.Remove(dat.Remove.name);
				}
			} else if (jQuery.type(dat.Remove) == 'array') {
				for (nJ = 0, len = dat.Remove.length; nJ < len; ++nJ) {
					if (dat.Remove[nJ].name) {
						windows.Remove(dat.Remove[nJ].name);
					}
				}
			}
		}

		// process set command to set new content..............................//
		if (dat.Set) {
			var wnd;

			if (jQuery.type(dat.Set) == 'object') {
				// this is an object.............................................//
				if (dat.Set.name) {
					// set a specific detail window...............................//
					wnd = windows.find(dat.Set.name);
					if (wnd) {
						wnd.load(dat.Set.Window, ctx);
						return;
					} else {
						wnd = windows.create(dat.Set.Window, ctx);
						windows.Add(wnd);
						return;
					}
				}

				// clear windows only when no set of names........................//
				windows.clear();

				if (dat.Set.Window) {
					if (jQuery.type(dat.Set.Window) == 'object') {
						wnd = windows.create(dat.Set.Window, ctx);
						windows.Add(wnd);
					} else if (jQuery.type(dat.Set.Window) == 'array') {
						a = dat.Set.Window;
						for (nJ = 0; nJ < a.length; ++nJ) {
							wnd = windows.create(a[nJ], ctx);
							windows.Add(wnd);
						}
						return;
					}
				}
			} else if (jQuery.type(dat.Set) == 'array') {
				// this is an array..............................................//
				// zutun: this is not yet supported
				a = dat.Set;
				for (nJ = 0; nJ < a.length; ++nJ) {
					var item = a[nJ];

					// this is an object containing name and window..............//
					if (item.name) {
						// set a specific detail window...........................//
						wnd = windows.find(item.name);
						if (wnd) {
							wnd.load(item.Window, ctx);
						} else {
							wnd = windows.create(item.Window, ctx);
							windows.Add(wnd);
						}
					}
				}
			}
		}
	};

	// ........................................................................//
	// functions..............................................................//
	windows.Add = function(wnd) {
		windows.m_WindowArray.push(wnd);
	};

	windows.Remove = function(name) {
		var wnd = null;

		// find the window by id...............................................//
		for (var nJ = 0, len = windows.m_WindowArray.length; nJ < len; ++nJ) {
			if ((wnd = windows.m_WindowArray[nJ]).m_ID == name) {
				// clear the window..............................................//
				wnd.clear();

				// remove it from array..........................................//
				windows.m_WindowArray.splice(nJ, 1);
				break;
			}
		}
	};

	// awake
	windows.Awake = function(target) {
		// zutun: awake the windows in the right parent child sequence..........//
		// current assumtion is, that sequence is right........................//
		for (var nJ = 0; nJ < windows.m_WindowArray.length; ++nJ) {
			windows.m_WindowArray[nJ].Awake(target);
		}
	};

	windows.GetMainWindow = function() {
		// currently first window without a parent is the main.................//
		for (var nJ = 0; nJ < windows.m_WindowArray.length; ++nJ) {
			if (windows.m_WindowArray[nJ].m_refParent == null) {
				return windows.m_WindowArray[nJ];
			}
		}
		return null; // no main window found
	};

	// notifications..........................................................//
	windows.NotifyDataChange = function() {
		// notify all windows about a data change..............................//
		var oA = windows.m_WindowArray;
		for (var nJ = 0; nJ < oA.length; ++nJ) {
			oA[nJ].NotifyDataChange();
		}

		return null;
	};

	windows.NotifyResize = function() {
		// notify all windows about a data change..............................//
		var oA = windows.m_WindowArray;
		for (var nJ = 0; nJ < oA.length; ++nJ) {
			oA[nJ].NotifyResize();
		}

		return null;
	};
	windows.NotifySceneMove = function(scene) {
		// notify all windows about a data change..............................//
		var oA = windows.m_WindowArray;
		for (var nJ = 0, len = oA.length; nJ < len; ++nJ) {
			oA[nJ].NotifySceneMove(scene);
		}

		return null;
	};

	windows.NotifySceneZoom = function(scene) {
		// notify all windows about a data change..............................//
		var oA = windows.m_WindowArray;
		for (var nJ = 0, len = oA.length; nJ < len; ++nJ) {
			oA[nJ].NotifySceneZoom(scene);
		}

		return null;
	};

	windows.Render = function() {
		// iterate through all windows and render them.........................//
		var oA = windows.m_WindowArray;
		for (var nJ = 0; nJ < oA.length; ++nJ) {
			oA[nJ].Render();
		}

		return null; // scene not known
	};

	windows.RenderAsync = function() {
		// iterate through all windows and render them.........................//
		var oA = windows.m_WindowArray;
		for (var nJ = 0; nJ < oA.length; ++nJ) {
			oA[nJ].RenderAsync(true);
		}

		return null; // scene not known
	};

	return windows;
};

// ...........................................................................//
// Window object.............................................................//

VBI.Window = function() {
	this.vbiclass = "Window";
	this.m_ID = ""; // id of window
	this.m_Caption = ""; // caption of window
	this.m_Type = ""; // type of window
	this.m_bModal = true; // window should be modal
	this.m_refScene = null; // name of the scene that should be shown in the window
	this.m_refSceneInstance = null; // scene instance that should be shown in the window
	this.m_refParent = null; // parent window, null if in scene
	this.m_Width = null;
	this.m_Height = null;
	this.m_Div = null; // div where the window is placed
	this.m_Ctx = null; // reference to context

	// persisting members.....................................................//

	this.BaseLoad = function(inst, dat, ctx) {
		// loading window members
		if (dat.id) {
			inst.m_ID = dat.id;
		}
		if (dat.caption) {
			inst.m_Caption = dat.caption;
		}
		if (dat.refParent) {
			inst.m_refParent = dat.refParent;
		}
		if (dat.modal) {
			inst.m_bModal = (dat.ref == "true") ? true : false;
		}
		if (dat.width) {
			inst.m_Width = parseInt(dat.width, 10);
		}
		if (dat.height) {
			inst.m_Height = parseInt(dat.height, 10);
		}
		// store the context...................................................//
		inst.m_Ctx = ctx;

		// get the position....................................................//

		// zutun: load all properties of window
		if (dat.refScene) {
			inst.m_refScene = dat.refScene;
		} else if (VBI.m_bTrace) {
			VBI.Trace("Error: no scene assigned to window");
		}
	};

	this.BaseClear = function() {
		// delete the backreference of the scene when the window id cleared...//
		var scene = this.GetScene();
		if (scene) {
			scene.m_Parent = null;
		}

		// clear references...................................................//
		this.m_refParent = null;
		this.m_refScene = null;
		this.m_refSceneInstance = null;
		this.m_Ctx = null;
		this.m_Div = null;
	};

	// clear the window.......................................................//
	this.clear = function() {
		this.BaseClear();
	};

	this.load = function(dat, ctx) {
		this.BaseLoad(this, dat, ctx);
	};

	// delivers the scene that is hosted in this window.......................//
	this.GetScene = function() {
		if (this.m_refSceneInstance) {
			return this.m_refSceneInstance;
		}

		// lazy link the scene with the window................................//
		this.m_refSceneInstance = (this.m_Ctx && this.m_Ctx.m_SceneManager) ? this.m_Ctx.m_SceneManager.GetSceneByName(this.m_refScene) : null;

		// a callout with custom content has no associated scene..............//
		if (this.m_refSceneInstance) {
			this.m_refSceneInstance.m_Parent = this;
		}
		return this.m_refSceneInstance;
	};

	// delivers the scene where this window is hosted in......................//
	this.GetHostingScene = function() {
		// assign members......................................................//
		if (!this.m_refParent) {
			return null;
		}

		var wp = this.m_Ctx.m_Windows.find(this.m_refParent);
		if (wp) {
			return wp.GetScene();
		}

		return null;
	};

	// ........................................................................//
	// notifications..........................................................//

	this.NotifyDataChange = function() {
		var scene = this.GetScene();
		if (scene) {
			scene.NotifyDataChange();
		}
	};

	this.NotifyResize = function() {
		return;

	};
	this.NotifySceneMove = function(scene) {
		return;
	};

	this.NotifySceneZoom = function(scene) {
		return;
	};

	this.Render = function() {
		var scene = this.GetScene();
		if (scene) {
			scene.Render();
		}
	};

	this.RenderAsync = function() {
		var scene = this.GetScene();
		if (scene) {
			if (scene.RenderAsync) {
				scene.RenderAsync(true);
			} else {
				scene.Render();
			}
		}
	};

	// awake window...........................................................//
	this.Awake = function(target) {
		// the target is the id of the dom element tat should be used for......//
		// display.............................................................//
		var scene = this.GetScene();
		if (scene) {
			scene.Awake(target);
		} else if (VBI.m_bTrace) {
			VBI.Trace("Error: Awake no scene assigned to window");
		}
	};

	// ........................................................................//
	// internal functions.....................................................//

	this.Create = function(target) {
		// just do nothing.....................................................//
	};

	this.Destroy = function() {
		// if (this.m_Div) {
		// zutun: remove the elements........................................//
		// }
	};
};

// ...........................................................................//
// callout window............................................................//

VBI.CalloutWindow = function() {
	var callout = new VBI.Window();

	// the callout object.....................................................//
	callout.m_oCallout = null; // callout object created in the utilities..//

	// ........................................................................//
	// overloaded members.....................................................//

	callout.load = function(dat, ctx) {
		callout.BaseLoad(callout, dat, ctx); // call base function...........//

		// load the position information.......................................//
		callout.m_Pos = new VBI.AttributeProperty(dat, 'pos', null, ctx);
		callout.m_OffsetX = new VBI.AttributeProperty(dat, 'offsetX', null, ctx, 0);
		callout.m_OffsetY = new VBI.AttributeProperty(dat, 'offsetY', null, ctx, 0);
	};

	callout.clear = function() {
		// unregister events...................................................//
		callout.UnRegisterEvents();

		// remove from dom.....................................................//
		callout.Remove();

		// call base function..................................................//
		callout.BaseClear();

		callout.m_oCallout = null;
	};

	// ........................................................................//
	// event handlers.........................................................//

	callout.processclosebuttonclick = function(event) {
		// call hook...........................................................//
		callout.m_Ctx.onCloseWindow(callout.m_ID, callout.m_oCallout.m_Content);

		// clear the callout...................................................//
		callout.clear();

		// no further routing should takes place................................//
		event.preventDefault();
		event.stopPropagation();
	};

	// ........................................................................//
	// helper functions.......................................................//

	callout.IsValid = function() {
		// the callout is valid when the object is there and the inner div.....//
		// is valid............................................................//
		return (callout.m_oCallout && callout.m_oCallout.m_Div) ? true : false;
	};

	callout.NotifySceneMove = function(scene) {
		callout.UpdatePosition();
	};

	callout.NotifySceneZoom = function(scene) {
		callout.UpdatePosition();
	};

	callout.CalcDivPosition = function() {
		if (!callout.IsValid()) {
			return undefined; // return immediately when callout is not valid............//
		}

		var bPhone = VBI.m_bIsPhone;
		if (bPhone) {
			return undefined;
		}
		// determine the pixel offset the detail window should have from the...//
		// position coordinate.................................................//

		var ox = callout.m_OffsetX.GetValueLong();
		var oy = callout.m_OffsetY.GetValueLong();

		var pos = callout.m_Pos.GetValueVector(callout.m_Ctx);
		var hs = callout.GetHostingScene();

		// we need the div relative position...................................//
		// therefore correct it here...........................................//
		var cv = hs.m_Canvas[hs.m_nOverlayIndex];
		var dx = cv.getPixelLeft();
		var dy = cv.getPixelTop();

		var fExactLod = hs.m_Canvas[0].m_nExactLOD;
		var worldPxOnLOD = parseInt(Math.pow(2, fExactLod) * hs.m_nWidthCanvas / hs.m_nTilesX * hs.m_Proj.m_nXYRatio, 10);
		var nLeftBorder = (hs.m_nDivWidth - worldPxOnLOD) / 2;
		var nRightBorder = hs.m_nDivWidth - nLeftBorder;

		// determine the position in the canvas for the coordinate.............//
		var tmppos = [];
		var nJ, len;
		var aOffsets;

		if (pos.length > 5) {
			var oldX = cv.getPixelWidth();
			var oldY = cv.getPixelHeight();
			cv.setPixelWidth(hs.m_nWidthCanvas);
			cv.setPixelHeight(hs.m_nHeightCanvas);
			hs.m_ZoomFactors[0] = oldX / hs.m_nWidthCanvas;
			hs.m_ZoomFactors[1] = oldY / hs.m_nHeightCanvas;

			var apos = hs.GetNearestPosArray(pos);

			var lt = hs.GetPointFromPos([
				apos.m_MinX, apos.m_MaxY, 0.0
			], false);
			var rb = hs.GetPointFromPos([
				apos.m_MaxX, apos.m_MinY, 0.0
			], false);

			aOffsets = hs.GetInstanceOffsets([
				lt[0], lt[1], rb[0], rb[1]
			]);
			var pointarray = aOffsets.length ? hs.GetPointArrayFromPosArray(apos, false) : null;
			var result;
			var rctest = hs.GetInternalDivClientRect();
			var rcWidth = rctest.width / hs.m_ZoomFactors[0];
			var rcHeight = rctest.height / hs.m_ZoomFactors[1];
			var PosXTest = dx / hs.m_ZoomFactors[0];
			var PosYTest = dy / hs.m_ZoomFactors[1];
			var rcviewport = [
				-PosXTest, -PosYTest, -PosXTest + rcWidth, -PosYTest + rcHeight
			];

			for (nJ = 0, len = aOffsets.length; nJ < len; ++nJ) {
				result = VBI.Utilities.GetMidpointsForLine(pointarray, aOffsets[nJ], rcviewport);
				if (result.aPos.length > result.max) {
					tmppos = result.aPos[result.max];
					tmppos[0] *= hs.m_ZoomFactors[0];
					tmppos[1] *= hs.m_ZoomFactors[1];
					break;
				}

			}
			cv.setPixelWidth(oldX);
			cv.setPixelHeight(oldY);
		} else {
			tmppos = hs.GetPointFromPos(pos, true);

			if (tmppos[0] + dx < nLeftBorder) {
				while (tmppos[0] + dx < nLeftBorder) {
					tmppos[0] += worldPxOnLOD;
				}
			} else if (tmppos[0] + dx > nRightBorder) {
				while (tmppos[0] + dx > nRightBorder) {
					tmppos[0] -= worldPxOnLOD;
				}
			}

		}

		// we need the div relative position...................................//
		// therefore correct it here...........................................//

		if (tmppos.length > 1) {

			tmppos[0] += dx;
			tmppos[1] += dy;

			// offset the callout..................................................//
			// using the specified values..........................................//
			tmppos[0] += ox;
			tmppos[1] += oy;

			// correct due to insets
			var ap = callout.m_oCallout.GetAnchorPoint();
			tmppos[0] -= ap[0];
			tmppos[1] -= ap[1];
		} else {
			tmppos.push(-1000, -1000);
		}
		return tmppos;
	};

	callout.UpdatePosition = function() {
		if (!callout.IsValid()) {
			return;
		}
		// calculate the callout position......................................//
		var pos = callout.CalcDivPosition();

		if (pos) {
			// move it there.......................................................//
			callout.m_oCallout.m_Div.style.left = Math.round(pos[0]) + "px";
			callout.m_oCallout.m_Div.style.top = Math.round(pos[1]) + "px";
			// console.log("CalcDivPosition; pt=" + pos[0] + "/ " + pos[1]);
		} else {
			callout.m_oCallout.m_Div.style.top = "";
			callout.m_oCallout.m_Div.style.left = "0px";
			callout.m_oCallout.m_Div.style.bottom = "0px";
		}
		callout.m_oCallout.m_Div.style.visibility = 'visible';
	};

	// ........................................................................//
	// internal functions.....................................................//

	callout.Create = function(target) {
		// assign members......................................................//
		if (callout.m_refParent && !callout.m_oCallout) {
			// get the hosting scene............................................//
			var hs = callout.GetHostingScene();
			if (hs) {
				// create the detail window......................................//
				// the id is mangled using the control id plus the window id.....//
				callout.m_oCallout = VBI.Utilities.CreateDetail(target + "-" + callout.m_ID, 0, 0, callout.m_Width, callout.m_Height, callout.m_Caption, 5);
				callout.m_oCallout.m_Div.style.visibility = 'hidden';

				// register event handlers.......................................//
				callout.RegisterEvents();

				// try to show it................................................//
				hs.m_WindowLayerDiv.appendChild(callout.m_oCallout.m_Div);

				// call hook.....................................................//
				callout.m_Ctx.onOpenWindow(callout.m_ID, callout.m_oCallout.m_Content);

				// update the callouts position..................................//
				callout.UpdatePosition();
			}
		}
	};

	callout.RegisterEvents = function() {
		// register event handlers that event context is the callout...........//
		var func = callout.processclosebuttonclick.bind(callout);
		//
		callout.m_oCallout.m_CloseButton.onclick = func;
		callout.m_oCallout.m_CloseButton.ontouchend = func;
	};

	callout.UnRegisterEvents = function() {
		// unregister event handlers...........................................//
		if (!callout.m_oCallout || !callout.m_oCallout.m_CloseButton) {
			return;
		}
		callout.m_oCallout.m_CloseButton.onclick = null;
		callout.m_oCallout.m_CloseButton.ontouchend = null;
	};

	callout.Remove = function() {
		var co = callout.m_oCallout;
		if (!co || !co.m_Div) {
			return; // nothing to remove.......................................//
		}

		// remove the callout from dom.........................................//
		var cd = co.m_Div;
		while (cd.firstChild) {
			cd.removeChild(cd.firstChild);
		}

		// reset div reference.................................................//
		if (cd.parentElement) {
			cd.parentElement.removeChild(cd);
		}
		callout.m_oCallout = null;
	};

	// awake window...........................................................//
	callout.Awake = function(target) {
		if (this.m_refParent) {
			this.Create(target);
		}
		// the target is the id of the dom element tat should be used for......//
		// display.............................................................//
		var scene = this.GetScene();
		if (scene) {
			scene.m_Div = callout.m_oCallout.m_Content;
			scene.Awake(target);
		} else if (VBI.m_bTrace) {
			VBI.Trace("Error: Awake no scene assigned to window");
		}
	};

	return callout;
};

// / legend
// ...........................................................................//
// legend window ............................................................//

VBI.LegendWindow = function() {
	var legend = new VBI.Window();

// the legend object.....................................................//
	legend.m_oLegend = null; // legend object created in the utilities..//
	legend.m_Props = [];
	legend.m_Data = [];
	legend.m_bRenew = false;
	legend.m_Position = [];
	legend.m_bCreated = false;

// ........................................................................//
// overloaded members.....................................................//

	legend.load = function(dat, ctx) {
		legend.BaseLoad(legend, dat, ctx); // call base function...........//

		legend.m_Props.push(legend.m_DataSource = new VBI.NodeProperty(dat, 'datasource', null, ctx));
		legend.m_Props.push(legend.m_Colors = new VBI.AttributeProperty(dat, 'colors', legend.m_DataSource, ctx));
		legend.m_Props.push(legend.m_Images = new VBI.AttributeProperty(dat, 'images', legend.m_DataSource, ctx));
		legend.m_Props.push(legend.m_Texts = new VBI.AttributeProperty(dat, 'texts', legend.m_DataSource, ctx));
		legend.m_Props.push(legend.m_Tooltips = new VBI.AttributeProperty(dat, 'tooltips', legend.m_DataSource, ctx));
		legend.m_Position = [];
		if (dat.top && dat.right) {
			legend.m_Position.push(parseInt(dat.right, 10));
			legend.m_Position.push(parseInt(dat.top, 10));
		}
	};

	legend.clear = function() {
		// unregister events...................................................//
		legend.UnRegisterEvents();

		// remove from dom.....................................................//
		legend.Remove();

		// call base function..................................................//
		legend.BaseClear();

		legend.m_oLegend = null;
		// call the clear on the properties.................................//
		if (legend.m_Props) {
			for (var nJ = 0; nJ < legend.m_Props.length; ++nJ) {
				legend.m_Props[nJ].clear();
			}
			// destroy the props array.......................................//
			legend.m_Props = [];
		}

		legend.m_Data = [];

	};

	legend.invalidate = function() {
		legend.m_bRenew = true;
	};

// ........................................................................//
// helper functions.......................................................//

	legend.IsValid = function() {
		// the legend is valid when the object is there and the inner div.....//
		// is valid............................................................//
		return (legend.m_oLegend && legend.m_oLegend.m_Div) ? true : false;
	};

	legend.NotifySceneMove = function(scene) {
	};

	legend.NotifySceneZoom = function(scene) {
	};

	legend.LegendChanged = function() {
		// var hs = legend.GetHostingScene();
		var node = legend.m_DataSource.GetCurrentNode(legend.m_Ctx);
		if (node) {
			var l = node.m_dataelements.length;
			if (l != legend.m_Data.length) {
				return true;
			}
			for (var nJ = 0; nJ < l; ++nJ) {
				legend.m_DataSource.Select(nJ);
				var text = legend.m_Texts.GetValueString(legend.m_Ctx);
				if (text != legend.m_Data[nJ].text) {
					return true;
				}
				if (legend.m_Data[nJ].type == 1) { // image
					if (legend.m_Data[nJ].value != legend.m_Images.GetValueString(legend.m_Ctx)) {
						return true;
					}
				} else if (legend.m_Data[nJ].type == 2) { // color
					if (legend.m_Data[nJ].value != legend.m_Colors.GetValueColor(legend.m_Ctx)) {
						return true;
					}
				}
			}
		} else {
			return true;
		}
		return false;
	};

	legend.ApplyData = function() {
		// var hs = legend.GetHostingScene();
		var node = legend.m_DataSource.GetCurrentNode(legend.m_Ctx);
		if (node) {
			var l = node.m_dataelements.length;
			for (var nJ = 0; nJ < l; ++nJ) {
				var col;
				var imageName;

				var obj = {};
				legend.m_DataSource.Select(nJ);
				obj.text = legend.m_Texts.GetValueString(legend.m_Ctx);
				if (obj.text) {
					obj.type = 0; // 0 = text; 1 = image; 2 = color
					imageName = legend.m_Images.GetValueString(legend.m_Ctx);
					if (imageName) {
						obj.type = 1;
						obj.value = imageName;
					} else {
						col = legend.m_Colors.GetValueColor(legend.m_Ctx);
						if (col) {
							obj.type = 2;
							obj.value = col;
						}
					}
					legend.m_Data.push(obj);
				}

			}
		}
	};

	legend.NotifyResize = function() {
		if (legend.m_bCreated) {
			legend.calcMaxHeight();
		}

	};

	legend.NotifyDataChange = function() {

		if (legend.m_Props) {
			for (var nJ = 0, len = legend.m_Props.length; nJ < len; ++nJ) {
				legend.m_Props[nJ].NotifyDataChange(legend.m_Ctx);
			}
		}

		if (legend.LegendChanged()) {
			legend.m_Data = [];

			if (legend.m_oLegend && legend.m_oLegend.m_Table) {
				while (legend.m_oLegend.m_Table.rows.length > 0) {
					legend.m_oLegend.m_Table.deleteRow(-1);
				}
				legend.ApplyData();
				legend.FillContent();
				legend.calcMaxHeight();
			}
		}
	};

	legend.Create = function(target) {
		//IE corner case: where we need to recreate DOM structure, but keep legend data unchanged
		//happens when map is placed in changing tabs for instance (DOM relative hierarchy gets lost in IE only)
		//looks like legend was properly created but parent DOM node is null!
		var updateDomOnly = (legend.m_oLegend && !legend.m_oLegend.m_Div.parentNode);

		if (legend.m_bRenew) {
			legend.m_Data = [];

			if (legend.m_oLegend && legend.m_oLegend.m_Table) {
				while (legend.m_oLegend.m_Table.rows.length > 0) {
					legend.m_oLegend.m_Table.deleteRow(-1);
				}
				legend.ApplyData();
				legend.FillContent();
			}
			legend.m_bRenew = false;
			// assign members......................................................//
		} else if (legend.m_refParent && !legend.m_oLegend || updateDomOnly) {
			// get the hosting scene............................................//
			var hs = legend.GetHostingScene();
			if (hs) {
				// create the legend window......................................//
				// the id is mangled using the control id plus the window id.....//

				var bClickRow = (this.m_Ctx.m_Actions.findAction("Click", hs, legend.m_ID)) ? true : false;
				legend.m_oLegend = VBI.Utilities.CreateLegend(target + "-" + legend.m_ID, 0, legend.m_Caption, 5, bClickRow);

				if (!updateDomOnly) {
					legend.ApplyData();
				}
				legend.FillContent();
				legend.m_Expanded = true;

				// register event handlers.......................................//
				legend.RegisterEvents();

				// try to show it................................................//
				legend.m_oLegend.m_Div = hs.m_LegendLayerDiv.appendChild(legend.m_oLegend.m_Div);
				if (legend.m_Position.length == 2) {
					if (!isNaN(legend.m_Position[0])) {
						legend.m_oLegend.m_Div.style.right = legend.m_Position[0] + "px";
						legend.m_oLegend.m_Div.style.left = '';
					}
					if (!isNaN(legend.m_Position[1])) {
						legend.m_oLegend.m_Div.style.top = legend.m_Position[1] + "px";
					}
				}
				legend.calcMaxHeight();
			}
		}
		legend.m_bCreated = true;
	};

	legend.getId = function(a, b) {
		return legend.m_oLegend.m_Table.id + '-' + b + '-' + a;
	};

	legend.FillContent = function() {
		if (!legend.m_Data.length) {
			return;
		}

		// var hs = legend.GetHostingScene();
		for (var nJ = 0; nJ < legend.m_Data.length; ++nJ) {
			var row = legend.m_oLegend.m_Table.insertRow(-1);
			row.id = legend.getId(nJ, 'content-tablerow');
			row.setAttribute("role", sap.ui.core.AccessibleRole.Row);
			row.setAttribute("tabindex", "-1");

			var cell_0 = row.insertCell(0);
			cell_0.setAttribute("role", sap.ui.core.AccessibleRole.GridCell);
			cell_0.setAttribute("tabindex", "-1");
			var obj = legend.m_Data[nJ];
			if (obj.type == 2) { // color
				var newdiv = VBI.Utilities.CreateGeoSceneDivCSS(legend.getId(nJ, 'content-celldiv'), 'vbi-legend-content-celldiv-square');
				newdiv.setAttribute("role", sap.ui.core.AccessibleRole.GridCell);
				newdiv.setAttribute("tabindex", "-1");
				newdiv.style.backgroundColor = obj.value;
				cell_0.appendChild(newdiv);
			} else if (obj.type == 1) { // image
				var image = legend.m_Ctx.GetResources().GetImage(obj.value, null, null, legend.invalidate.bind());
				if (image) {
					var img = image.cloneNode(true);
					img.setAttribute("role", sap.ui.core.AccessibleRole.Img);
					img.setAttribute("tabindex", "-1");
					img.className = 'vbi-legend-content-celldiv';
					img.id = legend.getId(nJ, 'content-celldiv');
					cell_0.appendChild(img);
				}
			} else {
				cell_0.className = "vbi-legend-content-celltext-group";
				cell_0.setAttribute("role", sap.ui.core.AccessibleRole.ColumnHeader);
				cell_0.setAttribute("tabindex", "0");
				cell_0.colSpan = 2;
				// cell_0.style.paddingLeft = "1rem";
				cell_0.innerHTML = jQuery.sap.encodeHTML(obj.text);
			}
			if (obj.type > 0) {
				var cell_1 = row.insertCell(1);
				cell_1.setAttribute("role", sap.ui.core.AccessibleRole.GridCell);
				cell_1.setAttribute("tabindex", "-1");
				cell_1.className = "vbi-legend-content-celltext";
				cell_1.id = legend.getId(nJ, 'content-celltext');
				cell_1.innerHTML = jQuery.sap.encodeHTML(obj.text);
			}
		}
	};

	legend.processtouchend = function(e) {
		document.removeEventListener('touchend', legend.processtouchend, true);
		document.removeEventListener('touchmove', legend.processtouchmove, true);
	};

	legend.processmouseup = function(e) {
		document.removeEventListener('mouseup', legend.processmouseup, true);
		document.removeEventListener('mousemove', legend.processmousemove, true);
	};

	legend.movelegend = function(pos) {
		var newpos = pos.slice(0);

		var hs = legend.GetHostingScene();

		if (newpos[0] < hs.m_Div.clientLeft) {
			newpos[0] = hs.m_Div.clientLeft;
		}

		if (newpos[0] + legend.m_oLegend.m_Div.clientWidth > hs.m_Div.clientLeft + hs.m_Div.clientWidth) {
			newpos[0] = hs.m_Div.clientLeft + hs.m_Div.clientWidth - legend.m_oLegend.m_Div.clientWidth;
		}

		if (newpos[1] < hs.m_Div.clientTop) {
			newpos[1] = hs.m_Div.clientTop;
		}

		if (newpos[1] + legend.m_oLegend.m_Header.clientHeight > hs.m_Div.clientTop + hs.m_Div.clientHeight) {
			newpos[1] = hs.m_Div.clientTop + hs.m_Div.clientHeight - legend.m_oLegend.m_Header.clientHeight;
		}

		jQuery(legend.m_oLegend.m_Div).css('top', newpos[1] + 'px');
		jQuery(legend.m_oLegend.m_Div).css('right', hs.m_Div.clientWidth - legend.m_oLegend.m_Div.clientWidth - newpos[0] + 'px');
		jQuery(legend.m_oLegend.m_Div).css('left', '');
		legend.calcMaxHeight();

	};

	legend.processtouchmove = function(e) {

		var touchobj = e.changedTouches[0]; // reference first touch point for this event
		var x = parseInt(touchobj.pageX, 10);
		var y = parseInt(touchobj.pageY, 10);
		var newpos = [
			x - legend.m_offset[0], y - legend.m_offset[1]
		];
		legend.movelegend(newpos);

	};

	legend.processmousemove = function(e) {
		if (e.which == 1) {
			var newmousepos = [
				e.pageX - legend.m_offset[0], e.pageY - legend.m_offset[1]
			];
			// check if legend is inside scene div
			legend.movelegend(newmousepos);
		}
	};

	legend.processmousedragstart = function(e) {
		if (e.which == 1) {
			legend.m_offset = [
				e.pageX - legend.m_oLegend.m_Div.offsetLeft, e.pageY - legend.m_oLegend.m_Div.offsetTop
			];
			document.addEventListener('mouseup', legend.processmouseup, true);
			document.addEventListener('mousemove', legend.processmousemove, true);

			e.preventDefault();
			e.stopPropagation();
		}
	};

	legend.processtouchdragstart = function(e) {

		var touchobj = e.changedTouches[0]; // reference first touch point
		var startx = parseInt(touchobj.pageX, 10); // get x coord of touch point
		var starty = parseInt(touchobj.pageY, 10); // get y coord of touch point
		legend.m_offset = [
			startx - legend.m_oLegend.m_Div.offsetLeft, starty - legend.m_oLegend.m_Div.offsetTop
		];
		document.addEventListener('touchend', legend.processtouchend, true);
		document.addEventListener('touchmove', legend.processtouchmove, true);

		e.preventDefault();
		e.stopPropagation();

	};

	legend.collapse = function(e) {
		if (legend.m_Expanded) {
			legend.m_oLegend.m_ButtonCol.style.visibility = 'hidden';
			legend.m_oLegend.m_ButtonExp.style.visibility = '';
			legend.m_oLegend.m_Content.style.display = 'none';
			legend.m_Expanded = false;
		}
	};

	legend.calcMaxHeight = function() {
		var scHeight = legend.GetHostingScene().m_Div.clientHeight;
		if (scHeight) {
			var lgHeaderHeight = legend.m_oLegend.m_Header.clientHeight;
			var lgTop = parseInt(legend.m_oLegend.m_Div.style.top, 10);
			var y1 = lgTop + lgHeaderHeight;
			// var scHeight = legend.GetHostingScene().m_Div.clientHeight;
			var diff = scHeight - y1;
			legend.m_oLegend.m_Content.style.maxHeight = diff + "px";
		}
	};

	legend.expand = function(e) {
		if (!legend.m_Expanded) {
			legend.m_oLegend.m_ButtonCol.style.visibility = '';
			legend.m_oLegend.m_ButtonExp.style.visibility = 'hidden';
			legend.m_oLegend.m_Content.style.display = '';
			legend.m_Expanded = true;

		}
	};

	legend.clickTable = function(e) {

		var sourceElement = e.target || e.srcElement;
		var rowNumber;

		var matches = sourceElement.id.match(/\d+/g);
		if (matches && matches.length) {
			rowNumber = matches[matches.length - 1];
		} else {
			matches = sourceElement.parentNode.id.match(/\d+/g);
			if (matches && matches.length) {
				rowNumber = matches[matches.length - 1];
			}

		}

		if (rowNumber) {
			var hs = legend.GetHostingScene();

			var params = {
				row: rowNumber,
				ctrlKey: e.ctrlKey,
				shiftKey: e.shiftKey,
				metaKey: e.metaKey,
				altKey: e.altKey
			};

			var action = null, actions = this.m_Ctx.m_Actions;
			if (hs && actions) {
				action = this.m_Ctx.m_Actions.findAction("Click", hs, legend.m_ID);
			}
			if (action) {
				this.m_Ctx.FireAction(action, hs.m_ID, action.m_refVO, null, params);
			}
		}
	};

	legend.RegisterEvents = function() {
		// register event handlers that event context is the legend...........//
		var funcDragMouse = legend.processmousedragstart.bind(legend);
		legend.m_oLegend.m_Header.onmousedown = funcDragMouse;

		var funcDragTouch = legend.processtouchdragstart.bind(legend);
		legend.m_oLegend.m_Header.ontouchstart = funcDragTouch;

		var funcCollapse = legend.collapse.bind(legend);
		legend.m_oLegend.m_ButtonCol.onclick = funcCollapse;

		var funcExpand = legend.expand.bind(legend);
		legend.m_oLegend.m_ButtonExp.onclick = funcExpand;

		var funcClickTable = legend.clickTable.bind(legend);
		legend.m_oLegend.m_Table.onclick = funcClickTable;

		legend.m_oLegend.m_Header.style.cursor = legend.m_oLegend.m_Table.style.cursor = 'pointer';
	};

	legend.UnRegisterEvents = function() {
		// unregister event handlers...........................................//
		if (!legend.m_oLegend) {
			return;
		}
		if (legend.m_oLegend.m_Header) {
			legend.m_oLegend.m_Header.onmousedown = null;
			legend.m_oLegend.m_Header.ontouchstart = null;
		}

		if (legend.m_oLegend.m_ButtonCol) {
			legend.m_oLegend.m_ButtonCol.onclick = null;
		}
		if (legend.m_oLegend.m_ButtonExp) {
			legend.m_oLegend.m_ButtonExp.onclick = null;
		}
		if (legend.m_oLegend.m_Table) {
			legend.m_oLegend.m_Table.onclick = null;
		}
	};

	legend.Remove = function() {
		var co = legend.m_oLegend;
		if (!co || !co.m_Div) {
			return; // nothing to remove.......................................//
		}

		// remove the legend from dom.........................................//
		var cd = co.m_Div;
		while (cd.firstChild) {
			cd.removeChild(cd.firstChild);
		}

		// reset div reference.................................................//
		if (cd.parentElement) {
			cd.parentElement.removeChild(cd);
		}
		legend.m_oLegend = null;
	};

	// awake window...........................................................//
	legend.Awake = function(target) {
		if (legend.m_refParent) {
			legend.Create(target);
		}
		// the target is the id of the dom element tat should be used for......//
		// display.............................................................//
		var scene = this.GetScene();
		if (scene) {
			// this.m_refScene.m_Div = legend.m_oLegend.m_Content;
			scene.Awake(target);
		} else if (VBI.m_bTrace) {
			VBI.Trace("Error: Awake no scene assigned to window");
		}
	};

	return legend;
};

});
