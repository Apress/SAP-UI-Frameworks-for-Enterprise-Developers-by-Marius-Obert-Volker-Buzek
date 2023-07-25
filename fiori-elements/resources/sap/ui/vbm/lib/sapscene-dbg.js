/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// this module does the label handling
// Author: Martina Gozlinski, extraction by Jürgen

sap.ui.define([
	"./sapvbi",
	"sap/ui/core/Popup"
], function() {
	"use strict";

/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
VBI.InputModeDefault = 0; // standard mode.............................//
VBI.InputModeTrackObject = 1; // objects handles or boxes are tracked
VBI.InputModeTrackMap = 2; // map is tracked
VBI.InputModeTrackDesign = 3; // objects are designed/drawn
VBI.InputModeRectSelect = 4; // rectangular selection mode
VBI.InputModeLassoSelect = 5; // lasso selection mode
VBI.InputModeRectZoom = 6; // rectangular zoom mode

// ...........................................................................//
// the scene manager manages the scene instances in a component context......//
VBI.SceneManager = function() {
	var scenemanager = {};
	scenemanager.vbiclass = "SceneManager";
	scenemanager.m_SceneArray = [];

	// finding................................................................//
	scenemanager.find = function(name) {
		// the scene array.....................................................//
		for (var nJ = 0; nJ < scenemanager.m_SceneArray.length; ++nJ) {
			if (scenemanager.m_SceneArray[nJ].m_ID == name) {
				return scenemanager.m_SceneArray[nJ];
			}
		}
		return null;
	};

	// clearing...............................................................//
	scenemanager.clear = function() {
		// clear the scene array...............................................//
		for (var nJ = 0; nJ < scenemanager.m_SceneArray.length; ++nJ) {
			scenemanager.m_SceneArray[nJ].clear();
		}

		// reset array
		scenemanager.m_SceneArray = [];
	};

	scenemanager.load = function(dat, ctx) {
		if (dat.Set) {
			scenemanager.loadScenes(dat.Set, false, dat, ctx);
		}
		if (dat.Merge) {
			scenemanager.loadScenes(dat.Merge, true, dat, ctx);
		}
	};

	scenemanager.loadScenes = function(setNode, bIsMerge, dat, ctx) {
		if (jQuery.type(setNode) == 'array') {
			for (var nJ = 0; nJ < setNode.length; ++nJ) {
				scenemanager.loadScene(setNode[nJ], bIsMerge, dat, ctx);
			}
		} else {
			scenemanager.loadScene(setNode, bIsMerge, dat, ctx);
		}
	};

	scenemanager.loadScene = function(mainNode, bIsMerge, dat, ctx) {
		// loading from the project file..........................................//
		var scene;
		var bReawakeRequired = false;

		if (mainNode.name) {
			// set a scene by name........................................//
			scene = scenemanager.find(mainNode.name);
			if (scene) {
				// clear the scene before reloading........................//
				if (!bIsMerge) {
					scene.clear();
				}
				// reload the scene........................................//
				if (mainNode.SceneGeo) {
					bReawakeRequired = scene.load(mainNode.SceneGeo, ctx, bIsMerge);
				} else if (mainNode.Scene3D) {
					bReawakeRequired = scene.load(mainNode.Scene3D, ctx, bIsMerge);
				} else {
					bReawakeRequired = scene.load(mainNode.Scene, ctx, bIsMerge);
				}
				if (bReawakeRequired) { // only if layerstack is changed in a GeoScene.Merge
					scene.ReAwake();
				}
				return;
			}
		} else if (!bIsMerge) {
			// clear all scenes...........................................//
			scenemanager.clear();
		}

		if (mainNode.SceneGeo) {
			scenemanager.loadNewScene(mainNode.SceneGeo, 'geo', ctx);
		}
		if (mainNode.Scene3D) {
			scenemanager.loadNewScene(mainNode.Scene3D, '3d', ctx);
		}
		if (mainNode.Scene) {
			scenemanager.loadNewScene(mainNode.Scene, 'default', ctx);
		}

	};

	scenemanager.loadNewScene = function(sceneNode, sceneType, ctx) {
		var scene = null;
		if (jQuery.type(sceneNode) == 'object') {
			// create the new scene load it and add it to the scene manager
			if (sceneType == 'geo') {
				scene = new VBI.GeoScene(null, null, null);
			} else if (sceneType == '3d') {
				scene = new VBI.Scene3D(null);
			} else {
				scene = new VBI.Scene(null, null, null);
			}

			scene.load(sceneNode, ctx);
			scenemanager.Add(scene);
		} else if (jQuery.type(sceneNode) == 'array') {
			// load array of scenes
			for (var nJ = 0; nJ < sceneNode.length; ++nJ) {
				// create the new scene load it and add it to the scene manager
				scene = null;
				if (sceneType == 'geo') {
					scene = new VBI.GeoScene(null, null, null);
				} else if (sceneType == '3d') {
					scene = new VBI.Scene3D(null);
				} else {
					scene = new VBI.Scene(null, null, null);
				}
				scene.load(sceneNode[nJ], ctx);
				scenemanager.Add(scene);
			}
		}
	};

	// functions..............................................................//
	scenemanager.Add = function(scene) {
		scenemanager.m_SceneArray.push(scene);
	};

	// access a specific scene inside vbi.....................................//
	scenemanager.GetScene = function(target) {
		for (var i = 0; i < scenemanager.m_SceneArray.length; ++i) {
			if (scenemanager.m_SceneArray[i].m_TargetName == target) {
				return scenemanager.m_SceneArray[i];
			}
		}
		return null; // scene not known
	};

	// access a specific scene by name........................................//
	scenemanager.GetSceneByName = function(name) {
		for (var i = 0; i < scenemanager.m_SceneArray.length; ++i) {
			if (scenemanager.m_SceneArray[i].m_ID == name) {
				return scenemanager.m_SceneArray[i];
			}
		}
		return null; // scene not known
	};

	return scenemanager;
};

// ..........................................................................//
// Scene object..............................................................//

VBI.Scene = function(target) {
	var scene = {};
	scene.vbiclass = "Scene";
	scene.m_TargetName = target;

	scene.m_EvtCont = new VBI.Events(); // publish subscribe container........//

	scene.m_ID = "";
	scene.m_Ctx = null; // application context of scene
	scene.m_Div = null; // the div dom element associated with the scene
	scene.m_Parent = null; // the window in which the scene is hosted

	scene.m_CaptureVO = null; // the vo that currently captures mouse
	scene.m_DesignVO = null; // the vo that is currently used for design

	// input
	scene.m_VOS = []; // visual objects
	scene.m_Events = null; // event handling instance
	scene.m_Proj = null; // Projection
	scene.m_LastDefinedCenterPos = scene.m_LastZoomArea = undefined; // Only ZoomToGeoPositions defines a concrete CenterPos as long as no
	// Zoom/MoveMap occurs

	scene.m_HotItem = {
		m_VO: null,
		m_Index: null,
		m_Design: null,
		m_HitObj: null
	}; // the hot item in the scene and if it is a design handle //
	scene.m_DragInfo = null;

	// assign members.........................................................//
	scene.m_Target = target;
	//for keyboard events
	scene.m_KeysDown = [];
	scene.m_KeysSkipUp = [];
	scene.m_KeysSkipPress = [];

	// base loading function..................................................//
	// this is called by all kind of scenes...................................//

	scene.LoadSingleVO = function(entity, vos, ctx, bIsMerge) {
		if (jQuery.type(entity) == 'object') {
			// load the single object........................................//
			var vo = null;

			if (scene.vbiclass == "3DScene") {
				vo = vos.Factory3D.CreateInstance(entity.type);
			} else {
				vo = vos.Factory.CreateInstance(entity.type);
			}
			vo.m_Scene = scene;
			vo.load(entity, ctx);
			if (bIsMerge) {
				var newID = vo.m_ID;
				for (var i = scene.m_VOS.length; i--;) {
					if (scene.m_VOS[i].m_ID == newID) {
						scene.m_VOS[i] = vo;
						return;
					}
				}
			}

			scene.m_VOS.push(vo);
		}
	};

	scene.BaseLoad = function(dat, ctx, bIsMerge) {
		if (!bIsMerge) {
			// register a keyboard hook............................................//
			VBI.RegisterKeyboardHook();

			// store the application context in the scene..........................//
			// this is necessary to have access to the application context.........//
			scene.m_Ctx = ctx;

			// loading scene members. todo: enhance loading of scene members.......//
			if (dat.id) {
				scene.m_ID = dat.id;
			}
			// load visual objects, these are usually 2d controls with absolute....//
			// positioning.........................................................//
		}

		if (dat.VO) {
			// create the vo and load...........................................//
			var vos = new VBI.VisualObjects();

			if (jQuery.type(dat.VO) == 'array') {
				// load the vo array.............................................//
				for (var nJ = 0; nJ < dat.VO.length; ++nJ) {
					scene.LoadSingleVO(dat.VO[nJ], vos, ctx, bIsMerge);
				}
			} else {
				scene.LoadSingleVO(dat.VO, vos, ctx, bIsMerge);
			}

		}
	};

	scene.BaseClear = function() {
		// clear the vo array..................................................//
		for (var nJ = 0, nlen = scene.m_VOS.length; nJ < nlen; ++nJ) {
			scene.m_VOS[nJ].clear();
		}

		// reset visual objects array..........................................//
		scene.m_VOS = []; // empty visual objects array......//

		// clear scene members.................................................//
		scene.m_Ctx = null;
		scene.m_CaptureVO = null;
		scene.m_DesignVO = null;

		// clean up windows reference to the scene.............................//
		if (scene.m_Parent) {
			scene.m_Parent.m_refSceneInstance = null;
		}
		// reset the hot item..................................................//
		scene.m_HotItem = null;

		if (scene.m_Events) {
			scene.m_Events.clear();
			scene.m_Events = null;
		}

		// unregister a keyboard hook..........................................//
		VBI.UnRegisterKeyboardHook();
	};

	scene.BaseGetVO = function(id) {
		// clear the vo array..................................................//
		for (var nJ = 0, nlen = scene.m_VOS.length; nJ < nlen; ++nJ) {
			if (scene.m_VOS[nJ].m_ID == id) {
				return scene.m_VOS[nJ];
			}
		}
		return null;
	};

	// scene loading..........................................................//
	scene.load = function(dat, ctx, bIsMerge) {
		// call base function..................................................//
		scene.BaseLoad(dat, ctx, bIsMerge);

		return false;
	};

	scene.clear = function() {
		// call clear function.................................................//
		scene.BaseClear();

		scene.m_Div = null;
	};

	scene.VerifyHotItem = function(vo, BBIndex) {
		// verifies that the index has not changed due to rendering
		var hi = scene.m_HotItem;
		if ((BBIndex != hi.m_Index) && (vo == hi.m_VO)) {
			var oRef = vo.m_BBRefs[BBIndex];
			if ((hi.cI == oRef.cI) && (hi.nI == oRef.i)) {
				hi.m_Index = BBIndex;
			}
		}
		scene.m_LastHotItem = undefined;
	};

	scene.CheckHotItem = function() {
		// checks whether the entity has survived a new clustering
		if (this.m_LastHotItem) {
			var oRef = this.m_LastHotItem;
			var InstancesOfVO = (oRef.cI != undefined) ? scene.m_PreassembledData.clust[oRef.cI] : scene.m_PreassembledData.base[scene.m_LastHotItem.m_VO];
			if (InstancesOfVO.m_nRecalcs != oRef.recalcs) {
				scene.InternalSetHotItem(null, null, true);
				this.m_LastHotItem = undefined;
			}
		}
	};

	scene.SetLastHotItem = function(hotItem) {

		// for clustering we have to remember the last hot item during rendering to
		// a) "unhot" it in case it is no more rendered (scene.InvalidateInvisibleHots)
		// b) change index when bounding box index changes (scene.VerifyHotItem)

		if (hotItem.m_VO && hotItem.m_VO.m_BBRefs != undefined) {
			var oRef = hotItem.m_VO.m_BBRefs[hotItem.m_Index];
			var InstancesOfVO = (oRef.cI != undefined) ? scene.m_PreassembledData.clust[oRef.cI] : scene.m_PreassembledData.base[hotItem.m_VO.m_nPreDataIndex];
			scene.m_LastHotItem = {
				cI: oRef.cI,
				i: oRef.i,
				m_VO: hotItem.m_VO.m_nPreDataIndex,
				recalcs: InstancesOfVO.m_nRecalcs
			};
		}
	};

	scene.InvalidateInvisibleHots = function() {
		if (this.m_LastHotItem != undefined) {
			// LastHotItem was not verified -> a) it was from PreassembledData and b) it is no more visible
			var oRef = this.m_LastHotItem;
			var InstancesOfVO = (oRef.cI != undefined) ? scene.m_PreassembledData.clust[oRef.cI] : scene.m_PreassembledData.base[scene.m_LastHotItem.m_VO];
			if (InstancesOfVO[oRef.i] != undefined) {
				InstancesOfVO[oRef.i].h = false;
				scene.InternalSetHotItem(null, null, true);
			}
			this.m_LastHotItem = undefined;
		}
	};

	scene.InternalSetHotItem = function(vo, hitobj, bUnsetAlreadyDone) {
		var hi = scene.m_HotItem;
		var bModified = false;
		var oldIndex = hi.m_Index;
		var oldVO = hi.m_VO;

		// set hot item index..................................................//
		if (hitobj) {
			// copy index.......................................................//
			if (hi.m_Index != hitobj.m_Index) {
				hi.m_Index = hitobj.m_Index;
				bModified = true;
			}

			// copy parts of the design info to the root........................//
			if (hi.m_Design != hitobj.m_Design) {
				hi.m_Design = hitobj.m_Design;
				bModified = true;
			}

			// copy parts of the entity info to the root........................//
			if (hi.m_Entity != hitobj.m_Entity) {
				hi.m_Entity = hitobj.m_Entity;
				bModified = true;
			}
		} else if (hi.m_Entity || hi.m_Detail) {
			// there is no hit object, reset the entity and detail info.........//
			bModified = true;
			hi.m_Entity = null;
			hi.m_Detail = null;
		}

		// set hot item vo.....................................................//
		if (hi.m_VO != vo) {
			hi.m_VO = vo;
			bModified = true;
		}

		// check if the hit object has changed.................................//
		if (!bModified) {
			var ho;
			if (hitobj && (ho = hi.m_HitObj)) {
				if (!jQuery.sap.equal(ho, hitobj, 2)) {
					bModified = true;
				}
			} else if (hitobj != null || hi.m_HitObj != null) {
				bModified = true;
			}
		}

		// store the detail information........................................//
		hi.m_HitObj = hitobj;

		if (bModified) {
			if (oldVO && !bUnsetAlreadyDone) {
				oldVO.InternalChangeHotItem(oldIndex, false, hi); // using PreData? Update value immediately
			}
			if (vo) {
				vo.InternalChangeHotItem(hi.m_Index, true, hi);
			}
			scene.RenderAsync(false); // trigger async rendering when modified
		}

		return bModified;
	};

	scene.InternalRenderVisualObjects = function(canvas, context) {
		// iterate through objects and render them.............................//

		var ts1 = Date.now();
		var aVO = scene.m_VOS;
		VBI.Utilities.BackupFont(context);
		for (var nJ = 0; nJ < scene.m_VOS.length; ++nJ) {
			aVO[nJ].Render(canvas, context);
		}
		VBI.Utilities.RestoreFont(context);
		scene.m_nLastRenderingTime = Date.now() - ts1;
	};

	scene.Render = function() {
	};

	scene.Awake = function(target) {
		// render the visual objects of the scene..............................//
		scene.InternalRenderVisualObjects(null, scene.m_Ctx);
	};

	scene.NotifyDataChange = function() {
		// notify all vo's about a datacontext change..........................//
		for (var nJ = 0; nJ < scene.m_VOS.length; ++nJ) {
			scene.m_VOS[nJ].NotifyDataChange(scene.m_Ctx);
		}
		scene.m_nDataVersion++;
	};

	scene.GetPointArrayFromPosArray = function(posarray, adjust) {
		// zutun: implementation for non geo scene..............................//
		return posarray;
	};

	scene.GetPosFromPoint = function(pt) {
		// zutun: implementation for non geo scene..............................//
		return pt;
	};

	scene.GetPointFromPos = function(pos, adjust, bIgnoreStretch) {
		// determine the pixel point in the canvas from a position vector......//
		// in the geoscene the GetPointArrayFromPosArray is overwritten so the.//
		// input is expected to be a lon/lat/height while in a 3d/2d scene it..//
		// should be the projected point.......................................//
		return scene.GetPointArrayFromPosArray(pos, adjust, bIgnoreStretch);
	};

	// ........................................................................//
	// helper functions.......................................................//

	scene.GetInternalDivClientRect = function() {
		var rect = scene.m_Div.getBoundingClientRect();
		if (this.m_Ctx.moThumbnail && this.m_Ctx.moThumbnail.nOrgWidth && this.m_Ctx.moThumbnail.nOrgHeight) {
			return {
				left: rect.left,
				top: rect.top,
				width: scene.m_Ctx.moThumbnail.nOrgWidth,
				height: scene.m_Ctx.moThumbnail.nOrgHeight,
				right: rect.left + scene.m_Ctx.moThumbnail.nOrgWidth,
				bottom: rect.top + scene.m_Ctx.moThumbnail.nOrgHeight
			};
		}
		return rect;
	};

	scene.GetEventVPCoords = function(event) {
		// returns the relative pixel coordinates to the viewport of the.......//
		// provided event......................................................//
		if (!event) {
			return [
				0, 0
			];
		}

		var rect = scene.GetInternalDivClientRect();
		if (VBI.m_bIsRtl) {
			return [
				rect.right - event.clientX, event.clientY - rect.top
			];

		} else {
			return [
				event.clientX - rect.left, event.clientY - rect.top
			];
		}
	};

	scene.GetEventVPCoordsObj = function(event) {
		// returns the view port coordinates in an object......................//
		var pos = scene.GetEventVPCoords(event);
		return {
			x: pos[0].toString(),
			y: pos[1].toString()
		};
	};

	scene.GetEventVPCoordsObjWithScene = function(event) {
		// returns the view port coordinates in an object......................//
		var pos = scene.GetEventVPCoords(event);
		return {
			x: pos[0].toString(),
			y: pos[1].toString(),
			scene: scene.m_ID
		};
	};

	scene.GetEventDropObjWithScene = function(event) {
		return {
			strSource: scene.m_DragInfo.strScene + "|" + scene.m_DragInfo.strID + "|" + scene.m_DragInfo.strInstance,
			scene: scene.m_ID
		};

	};

	// .......................................................................//
	// do event dispatching...................................................//
	scene.DispatchEvent = function(event, evName) {
		if (VBI.m_bTrace) {
			VBI.Trace("DispatchEvent " + event.type + " as " + evName + " mode:" + scene.m_nInputMode + (scene.m_Gesture ? " gesture active" : ""));
		}
		// when the input mode is tracking, thhere is no dispatching of events.
		if (scene.m_nInputMode == VBI.InputModeTrackMap) {
			return false;
		}
		var func, eventType = event.type;
		// check for abstract event name
		if (evName) {
			event.m_evName = eventType = evName;
		}
		// dispatch the events to the vos
		event.m_Scene = scene;
		// do some adjustments for offset parameters, usually only done for ff
		// and touch events
		if (event.offsetX == undefined || event.offsetY == undefined) {
			var rect;
			if (event.clientX !== undefined && event.clientY !== undefined) {
				// due to ff, there is no correct offsetX/Y therefore set it now
				rect = event.target.getBoundingClientRect();
				event.offsetX = event.clientX - rect.left;
				event.offsetY = event.clientY - rect.top;
			} else if (event.changedTouches !== undefined && (event.changedTouches.length > 0)) {
				// use the first changed touch as events offset
				// generate clientX and clientY to be able to create submit event
				rect = event.target.getBoundingClientRect();
				event.clientX = event.changedTouches[0].clientX;
				event.clientY = event.changedTouches[0].clientY;
				event.offsetX = event.clientX - rect.left;
				event.offsetY = event.clientY - rect.top;
			}
		}
		// do adjustments on the keyboard state
		if (event.shiftKey == undefined) {
			event.shiftKey = VBI.m_shiftKey;
		}
		if (event.ctrlKey == undefined) {
			event.ctrlKey = VBI.m_ctrlKey;
		}
		// the design vo is the first one that gets events in the loop
		if (scene.m_DesignVO) {
			if (VBI.m_bTrace) {
				VBI.Trace("DispatchEvent to Design VO");
			}
			if ((func = scene.m_DesignVO["on" + eventType]) && typeof (func) == 'function') {
				// call the handler with the context set to corresponded visual object
				if (func.call(scene.m_DesignVO, event)) {
					return true; // handled
				}
			}
		}
		// when a vo wants to have events first it can capture them, events
		// are not further dispatched when the event handler returns true
		if (scene.m_CaptureVO) {
			if ((func = scene.m_CaptureVO["on" + eventType]) && typeof (func) == 'function') {
				// call the handler with the context set to corresponded visual object
				if (func.call(scene.m_CaptureVO, event)) {
					return true; // handled
				}
			}
		}
		// for "click" use two stage approach
		// first stage - collect all potential candidates based on hit test results
		// show menu if number of candidates more than 1 or follow usual flow
		var control = scene.m_Ctx.m_Control;
		if (eventType.indexOf("click") != -1 && (control instanceof sap.ui.vbm.GeoMap) && control.getEnableOverlappingTest()) {
			event.hitTests = []; // setup multi hit test

			for (var i = 0;  i < scene.m_VOS.length; ++i) { //step one, collect all VOs which pass hit test
				if ((func = scene.m_VOS[i]["on" + eventType]) && typeof (func) == 'function') {
					func.call(scene.m_VOS[i], event); // call the handler with the context set to corresponded visual object
				}
			}
			if (event.hitTests.length > 1) { // multiple hit scenario
				// filter out all VOs when:
				// there is no "click" event listener on it
				// VO is not selectable i.e cardinality is set to x:0
				// as there is no point to show them in the menu
				// analytic map regions handled separately
				event.hitTests = event.hitTests.filter(function(hit) {
					var vo = control.getAggregatorContainer(hit.m_Vo.m_ID);
					var isRegion = (hit.m_Vo.m_ID === "Region" && control instanceof sap.ui.vbm.AnalyticMap);

					switch (eventType) {
						case "sapclick":
							if (vo) {
								return vo.isSubscribed("click", hit.m_Index) || vo.isSelectable();
							} else if (isRegion) {
								return control.hasListeners("regionClick") || control.isRegionSubscribed("click", hit.m_Entity); // check both analytic map and region for subscribers
							}
							break;
						case "sapsecclick":
							if (vo) {
								return vo.isSubscribed("contextMenu", hit.m_Index);
							} else if (isRegion) {
								return control.hasListeners("regionContextMenu") || control.isRegionSubscribed("contextMenu", hit.m_Entity); // check both analytic map and region for subscribers
							}
							break;
					}
					return false;
				});
				if (event.hitTests.length > 1) {
					scene.showHitMenu(event, event.hitTests); // show menu to narrow selection to one vo
					delete event.hitTests; //has to be deleted to avoid collecting hits information again
					event.preventDefault();
					return true;
				}
			}
			// standard case - click on single object
			if (event.hitTests.length > 0) {
				event.hitCached = event.hitTests[0]; // cache first hit test
				delete event.hitTests; // has to be deleted to avoid collecting hits information again
				// if there is a VO then pass event to it
				if (event.hitCached.m_Vo) {
					return event.hitCached.m_Vo["on" + eventType].call(event.hitCached.m_Vo, event);
				} else {
					delete event.hitCached; // remove it to keep things going "old" way
				}
			} else {
				return false; // not handled
			}
		}
		// "old" approach -> process from last to first which corresponds to the rendering order (from topmost to last)
		for (var i = scene.m_VOS.length - 1;  i >= 0; --i) {
			if ((func = scene.m_VOS[i]["on" + eventType]) && typeof (func) == 'function') {
				// call the handler with the context set to corresponded visual object
				if (func.call(scene.m_VOS[i], event)) {
					return true; // handled
				}
			}
		}
		return false; //not handled
	};
	return scene;
};

// ..........................................................................//
// 3DScene object............................................................//

VBI.Scene3D = function(target) {
	var scene = new VBI.Scene(target); // create scene and specialize.....//

	scene.vbiclass = "3DScene";

	// persisting members.....................................................//
	scene.m_DivCopyright = null;

	scene.m_bMainSceneInitialized = false;
	scene.m_Events = null;
	scene.m_Canvas = []; // canvas elements

	// see discussion in http://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element
	scene.m_nMaxCanvasDimension = (VBI.m_bIsMobile ? 6144 : 8192); // all desktop browsers support canvas width/height at least up to 8192

	// clear the scene........................................................//
	scene.clear = function() {
		// call base class.....................................................//
		scene.BaseClear();

		scene.clearCanvases();

		// scene.Remove(); // remove the dom elements

		scene.m_TargetName = null;
		scene.m_Proj = null;

		// remove references to DOM elements...................................//
		scene.m_DivCopyright = null;
		scene.m_Target = null;
	};

	scene.clearCanvas = function(nJ) {
		scene.m_Canvas[nJ].m_Scene = null;
		scene.m_Canvas[nJ] = null;
	};

	scene.clearCanvases = function() {
		// clear the canvas-scene references...................................//
		for (var nJ = 0, nLen = scene.m_Canvas.length; nJ < nLen; ++nJ) {
			scene.clearCanvas(nJ);
		}
		scene.m_Canvas = [];
	};

	scene.Init = function() {
		// if (scene.m_Canvas) {

		// var cnv = scene.m_Canvas[0];
		// var canvasId = cnv.attributes.id.value;

		// do something here
		// }
	};

	scene.InitializeCanvas = function(canvas) {
		// set the scene reference..........................................//
		canvas.m_Scene = scene;

		canvas.m_nCurrentX = undefined;
		canvas.m_nCurrentY = undefined;

		canvas.m_bInvalid = false;

		// set the canvas as a child of the div.............................//
		if (!canvas.m_bNotInDOM) {
			scene.m_Div.appendChild(canvas);
		}
	};

	scene.CreateCanvases = function() {
		scene.m_Canvas.push(VBI.Utilities.Create3DSceneCanvas("layer1", scene.m_nWidthCanvas, scene.m_nHeightCanvas, 2)); // first layer

		for (var nJ = 0; nJ < scene.m_Canvas.length; ++nJ) {
			scene.InitializeCanvas(scene.m_Canvas[nJ]);
		}
	};

	scene.Awake = function(target) {
		if (!(scene.m_Target = VBI.Utilities.GetDOMElement(target))) {
			scene.m_Target = VBI.Utilities.CreateDOMElement(target, "1px", "1px");
		}

		// reuse scene parts...................................................//
		if (scene.m_Div) {
			// when the scenes div's parent is still the place holder, then.....//
			// everything is still fine and we can return.......................//
			if (scene.m_Div.parentNode == scene.m_Target) {
				return;
			}

			// the scenes div is already but the parent is no longer the........//
			// placeholder. In this case we add again the div as a child element//
			scene.m_Target.appendChild(scene.m_Div);
			// if ( scene.m_bNavControlVisible && scene.m_NavControl )
			// //scene.m_NavControl.Awake( scene, target );
			// scene.m_NavControl.AttachEvents();
			return;
		}

		// assign scene information............................................//
		scene.m_TargetName = target;

		// create the viewport.................................................//
		scene.m_Div = VBI.Utilities.Create3DSceneDiv(target + "-3Dscene");

		// set the div as a child of the target................................//
		scene.m_Target.appendChild(scene.m_Div);

		// activate

		// the awakening of the canvases requires the div sizes, if they are not provided
		// behvaiour might be strange. To support a future implementation of a lazy awakening
		// when the div sizes come late this part is put into an own function which may be called
		// from resize also.
		scene.DoAwake(target);
	};

	scene.DoAwake = function(target) {
		// create the viewport.................................................//

		scene.CalculateCanvasDimensions();
		scene.CreateCanvases();

		// initialize the 3D scene
		scene.Init();

		// // append copyright
		// scene.AddCopyright();
		// attach overlay canvas to scene handled events.......................//
		var oCanvas = scene.m_Canvas[0];
		// do event subscriptions..............................................//
		// if( scene.m_Events )
		// scene.m_Events.clear();

		scene.m_Events = new VBI.SceneEvent(this, oCanvas);
		//
		// // awake Navigation Control
		// if ( scene.m_bNavControlVisible && scene.m_NavControl ){
		// scene.m_NavControl.Awake( scene, target );
		// }
		//
		// // awake Scale Control
		// if ( scene.m_bScaleVisible && scene.m_Scale ){
		// scene.m_Scale.Awake( scene, target );
		// }
		//
		// scene.GoToInitialStart();
	};

	scene.CalculateCanvasDimensions = function() {
		var nDummy = scene.m_Target.offsetWidth; // to force browser to have consistent state
		var rect = scene.m_Div.getBoundingClientRect();

		var divWidth = rect.width ? rect.width : scene.m_Div.clientWidth;
		var divHeight = rect.height ? rect.height : scene.m_Div.clientHeight;
		if ((divWidth == scene.m_nDivWidth) && (divHeight == scene.m_nDivHeight)) {
			return; // nothing changed
		}
		if (VBI.m_bTrace) {
			VBI.Trace("Calculating Canvas Dimensions to " + divWidth + "," + divHeight + ", Dummy:" + nDummy);
		}

		scene.m_nDivWidth = divWidth;
		scene.m_nDivHeight = divHeight;
		// scene.m_nWidthCanvas = scene.CalcCanvasWidth ( divWidth, mapMan.m_tileWidth );
		// scene.m_nHeightCanvas = scene.CalcCanvasHeight( divHeight, mapMan.m_tileHeight );

		scene.m_nWidthCanvas = divWidth;
		scene.m_nHeightCanvas = divHeight;

		// VBI.m_bTrace && VBI.Trace("Setting Canvas Size to ("+scene.m_nWidthCanvas+","+scene.m_nHeightCanvas+") on div with size
		// ("+divWidth+","+divHeight+")");
	};

	scene.Render = function() {
		var vo = null;
		var cnt = 0;

		for (var i = scene.m_VOS.length; i--;) {
			vo = scene.m_VOS[i];

			cnt += vo.Render(scene.m_Canvas[0]);
		}

	};

	// when a target is already specified, awake the scene to be alive........//
	if (target) {
		scene.Awake(target);
	}
	return scene;
};

// ..........................................................................//
// GeoScene object...........................................................//

VBI.GeoScene = function(target, mapmanager, maplayerstack) {
	var scene = new VBI.Scene(target); // create scene and specialize.....//
	scene.vbiclass = "GeoScene";

	// persisting members.....................................................//
	scene.m_RefMapLayerStack = "";
	scene.m_DivCopyright = null;

	scene.m_Canvas = []; // canvas elements
	scene.m_ZoomFactors = [
		1.0, 1.0
	]; // zoom factors
	scene.m_StretchFactors = [
		1.0, 1.0
	]; // zoom factors

	// store the mapmanager and the maplayerstack that should be used.........//
	scene.m_MapManager = mapmanager;
	scene.m_MapLayerStack = maplayerstack;

	// see discussion in http://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element
	scene.m_nMaxCanvasDimension = (VBI.m_bIsMobile ? 6144 : 8192); // all desktop browsers support canvas width/height at least up to 8192
	// click handler on scene.................................................//
	scene.Click = null;

	// define overlay index...................................................//
	scene.m_nOverlayIndex = 2;
	scene.m_nLabelIndex = 3;
	scene.m_nNonDomIndex = 4;
	scene.m_nTapCount = 0;

	scene.GetHomeLocation = null;

	scene.m_Touches = []; // touches history, used to detect double tap etc.//

	// event handling members.................................................//
	scene.m_currentMouseX = 0;
	scene.m_currentMouseY = 0;
	scene.m_oldMouseX = 0;
	scene.m_oldMouseY = 0;
	scene.m_currentMouseDownX = 0;
	scene.m_currentTouchCount = 0;
	scene.m_currentMouseDownY = 0;
	scene.m_midPointX = 0;
	scene.m_midPointY = 0;

	scene.m_currentTouchDistance = 0;
	scene.m_nInputMode = VBI.InputModeDefault;

	scene.m_AnimZoomTimer = null; // animation zoom timer

	// initial start position
	scene.m_startPointLonLat = [
		0.0, 0.0
	];
	scene.m_startLOD = 0;

	// Navigation Control
	scene.m_bNavControlVisible = true;
	// scene.m_bNavControlVisible = false;
	scene.m_NavControl = null;
	scene.m_RenderRequestID = 0;

	// Suppressed Navigation
	scene.m_SuppressedNavigation = {
		zoom: false,
		move: false
	};

	// Scale
	scene.m_bScaleVisible = true;
	scene.m_Scale = null;

	// tracking modes
	scene.m_nInitialTrackingMode = VBI.InputModeDefault;
	scene.m_nCanvasXOversize = 2.2; // Canvas is sized floor ( viewport + 2.2 tiles ).
	scene.m_nCanvasYOversize = 2.2; // It should be at least 1.2 tiles available outside the viewport
	scene.m_nCanvasStdXPos = scene.m_nCanvasXOversize / 4;
	scene.m_nCanvasStdYPos = scene.m_nCanvasYOversize / 4;

	scene.m_nTicksInALod = VBI.m_bIsMobile ? 6 : 12; // n mouse scroll ticks are needed to scroll to next lod
	// which leads to the following factors for zoom in / out

	scene.m_nLodFactorZoomIn = Math.pow(2, 1 / scene.m_nTicksInALod);
	scene.m_nLodFactorZoomOut = 1 / scene.m_nLodFactorZoomIn;
	scene.m_nLodFactorZoomInHalf = Math.pow(2, 1 / (2 * scene.m_nTicksInALod));
	scene.m_nLodFactorZoomOutHalf = 1 / scene.m_nLodFactorZoomInHalf;

	scene.m_nMaxAnimLodDiff = 3; // when Lod difference on ZoomMap Animations is bigger than this value we skip tile requests

	scene.m_nZoomMode = 1;

	scene.m_nLastRenderingTime = 0; // from 25 ms onwards we begin to skip rendering steps, if
	scene.m_nRenderTimeTarget = 250; // rendering takes more then 250 ms all intermediate steps are ommited.
	scene.m_nNumOfScalingVOInst = 0;

	scene.m_nLastClusteringTime = 0;
	scene.m_nDataVersion = 0;

	scene.m_bObjCanvasMode = 1;
	scene.m_nlstWidth = scene.m_nlstHeight = 0;
	scene.m_nGetImageDataIncidents = 0;

	// .......................................................................//
	// events.................................................................//

	scene.onTileLoaded = null; // raised when a new tile is loaded

	// clear the scene........................................................//
	scene.clear = function() {
		// call base class.....................................................//
		scene.BaseClear();

		// reset touches array.................................................//
		scene.m_Touches = []; // empty touch event queue.........//

		// remove the scene reference in navigation control....................//
		if (scene.m_NavControl) {
			scene.m_NavControl.clear();
			scene.m_NavControl = null;
		}

		// remove the scene reference in scale control.........................//
		if (scene.m_Scale) {
			scene.m_Scale.clear();
			scene.m_Scale = null;
		}

		// clear timers........................................................//
		scene.clearTimers();
		scene.clearCanvases();

		// remove potential event listeners from document......................//
		scene.SetInputMode(VBI.InputModeDefault);

		scene.Remove(); // remove the dom elements

		// reset object references.............................................//
		scene.m_RefMapLayerStack = "";
		scene.m_MapManager = null;
		scene.m_MapLayerStack = null;
		scene.m_TargetName = null;
		scene.m_Proj = null;

		// remove references to DOM elements...................................//
		scene.m_DivCopyright = null;
		scene.m_Target = null;
	};

	scene.loadSingleRemoveOnScene = function(removeNode, ctx) {
		if (jQuery.type(removeNode) == 'object') {
			switch (removeNode.type) {
				case "VO":
					var id = removeNode.id;
					for (var j = scene.m_VOS.length; j--;) {
						if (scene.m_VOS[j].m_ID == id) {
							scene.m_VOS[j].clear();
							scene.m_VOS.splice(j, 1);
							return;
						}
					}
					break;
				default:
					break;
			}
		}
	};

	scene.loadRemoveOnScene = function(removeNode, ctx) {
		if (jQuery.type(removeNode) == 'array') {
			for (var j = 0; j < removeNode.length; ++j) {
				scene.loadSingleRemoveOnScene(removeNode[j], ctx);
			}
		} else {
			scene.loadSingleRemoveOnScene(removeNode, ctx);
		}
	};

	// scene loading..........................................................//
	scene.load = function(dat, ctx, bIsMerge) {
		var bReawakeRequired = false;
		if (bIsMerge && dat.Remove) {
			scene.loadRemoveOnScene(dat.Remove, ctx);
		}
		// call base loading...................................................//
		scene.BaseLoad(dat, ctx, bIsMerge);

		if (dat.refMapLayerStack) {
			var newLayerStack = ctx.m_MapLayerStackManager.GetMapLayerStack(dat.refMapLayerStack);
			if (scene.m_RefMapLayerStack != newLayerStack) {
				scene.m_RefMapLayerStack = newLayerStack;
				bReawakeRequired = true;
			}
		} else if (VBI.m_bTrace) {
			VBI.Trace("no map layer specified in geo scene");
		}

		if (bIsMerge) {
			return bReawakeRequired; // as of now only exchange of map layer stack is supported
		}

		var minX = -1000, maxX = 1000;
		var minY = -90, maxY = 90;
		scene.m_nMinLodVisualBorder = 0;
		scene.m_nMaxLodVisualBorder = 99;
		scene.m_nOffsetMinLod = 0;
		scene.m_bYBorderExists = false;
		if (dat.VisualFrame) {

			if (dat.VisualFrame.minLon != undefined) {
				minX = dat.VisualFrame.minLon;
			} else {
				minX = (dat.VisualFrame.minX != undefined ? dat.VisualFrame.minX : minX);
			}

			if (dat.VisualFrame.maxLon != undefined) {
				maxX = dat.VisualFrame.maxLon;
			} else {
				maxX = (dat.VisualFrame.maxX != undefined ? dat.VisualFrame.maxX : maxX);
			}

			if (dat.VisualFrame.minLat != undefined) {
				minY = dat.VisualFrame.minLat;
			} else {
				minY = (dat.VisualFrame.minY != undefined ? dat.VisualFrame.minY : minY);
			}

			if (dat.VisualFrame.maxLat != undefined) {
				maxY = dat.VisualFrame.maxLat;
			} else {
				maxY = (dat.VisualFrame.maxY != undefined ? dat.VisualFrame.maxY : maxY);
			}

			if (dat.VisualFrame.minLOD != undefined) {
				scene.m_nMinLodVisualBorder = dat.VisualFrame.minLOD;
			}
			if (dat.VisualFrame.maxLOD != undefined) {
				scene.m_nMaxLodVisualBorder = dat.VisualFrame.maxLOD;
			}
			if (dat.VisualFrame.maxFraction != undefined) {
				scene.m_fMaxMinLODFraction = dat.VisualFrame.maxFraction;
			}
			if (dat.VisualFrame.offsetMinLOD != undefined) {
				scene.m_nOffsetMinLod = dat.VisualFrame.offsetMinLOD;
			}
		}

		scene.m_bXBorderExists = (minX != -1000) || (maxX != 1000);
		scene.m_nBorderMinPoint = VBI.MathLib.DegToRad([
			minX, maxY
		]);
		scene.m_nBorderMaxPoint = VBI.MathLib.DegToRad([
			maxX, minY
		]);

		scene.m_Proj = scene.setProjection();

		var uxyMin = [
			1.0, 1.0
		], uxyMax = [
			1.0, 1.0
		];
		scene.m_Proj.LonLatToUCS(scene.m_nBorderMinPoint, uxyMin);
		scene.m_Proj.LonLatToUCS(scene.m_nBorderMaxPoint, uxyMax);
		scene.m_nXSizeVisualBorder = Math.max(0.0, Math.min(1.0, uxyMax[0] - uxyMin[0]));
		scene.m_nYSizeVisualBorder = Math.max(0.0, Math.min(1.0, uxyMax[1] - uxyMin[1]));

		if (dat.initialStartPosition) {
			var array = dat.initialStartPosition.split(';');
			scene.m_startPointLonLat = VBI.MathLib.DegToRad([
				parseFloat(array[0]), parseFloat(array[1])
			]);
		}

		if (dat.initialZoom) {
			scene.m_startLOD = parseInt(dat.initialZoom, 10);
		}

		if (dat.ariaLabel) {
			scene.ariaLabel = dat.ariaLabel;
		}

		// navigation enablement and navigation control visibility
		var SuppressedNavControlVisibility = {
			zoom: false,
			move: false,
			fade: false
		};
		// read properties of navigation enablement
		if (dat.NavigationDisablement) {
			if (dat.NavigationDisablement.zoom) {
				scene.m_SuppressedNavigation.zoom = VBI.Types.string2bool(dat.NavigationDisablement.zoom);
			}
			if (dat.NavigationDisablement.move) {
				scene.m_SuppressedNavigation.move = VBI.Types.string2bool(dat.NavigationDisablement.move);
			}
		}

		// Navigation visibility
		// read properties of NavControl Visibility
		if (dat.navControlVisible) {
			scene.m_bNavControlVisible = VBI.Types.string2bool(dat.navControlVisible);
		}

		SuppressedNavControlVisibility.zoom = scene.m_SuppressedNavigation.zoom;
		SuppressedNavControlVisibility.move = scene.m_SuppressedNavigation.move;

		if (scene.m_SuppressedNavigation.zoom && scene.m_SuppressedNavigation.move) {
			scene.m_bNavControlVisible = false;
		} else if (scene.m_bNavControlVisible) {
			if (dat.SuppressedNavControlVisibility) {
				if (!SuppressedNavControlVisibility.zoom && dat.SuppressedNavControlVisibility.zoom) {
					SuppressedNavControlVisibility.zoom = VBI.Types.string2bool(dat.SuppressedNavControlVisibility.zoom);
				}
				if (!SuppressedNavControlVisibility.move && dat.SuppressedNavControlVisibility.move) {
					SuppressedNavControlVisibility.move = VBI.Types.string2bool(dat.SuppressedNavControlVisibility.move);
				}
				if (dat.SuppressedNavControlVisibility.fade) {
					SuppressedNavControlVisibility.fade = VBI.Types.string2bool(dat.SuppressedNavControlVisibility.fade);
				}
			}
			if (SuppressedNavControlVisibility.move && SuppressedNavControlVisibility.zoom) {
				scene.m_bNavControlVisible = false;
			}
		}

		// Scale
		if (dat.scaleVisible) {
			scene.m_bScaleVisible = VBI.Types.string2bool(dat.scaleVisible);
		}
		if (scene.m_Ctx.moThumbnail) {
			scene.m_SuppressedNavControlVisibility = SuppressedNavControlVisibility;
		} else if (scene.m_bNavControlVisible) {
			scene.m_NavControl = new VBI.NavigationControl(SuppressedNavControlVisibility);
		}
		if (scene.m_bScaleVisible && !scene.m_Ctx.moThumbnail) {
			scene.m_Scale = new VBI.Scale(scene);
		}

		if (dat.rectZoom && VBI.Types.string2bool(dat.rectZoom)) {
			scene.m_nInitialTrackingMode = VBI.InputModeRectZoom;
		} else if (dat.rectSelect && VBI.Types.string2bool(dat.rectSelect)) {
			scene.m_nInitialTrackingMode = VBI.InputModeRectSelect;
		} else if (dat.lassoSelect && VBI.Types.string2bool(dat.lassoSelect)) {
			scene.m_nInitialTrackingMode = VBI.InputModeRectSelect;
		} else {
			scene.m_nInitialTrackingMode = VBI.InputModeDefault;
		}

		return false; // no merge -> no reawake required
	};

	// ........................................................................//
	// scene controlling interface............................................//

	scene.SetInputMode = function(val) {
		// trace current input mode............................................//
		if (VBI.m_bTrace) {
			VBI.Trace("SetInputMode: " + this.m_nInputMode);
		}

		if (this.m_nInputMode == val) {
			return; // input mode did not change..........//
		}
		// process removal of existing input mode..............................//
		switch (this.m_nInputMode) {
			case VBI.InputModeTrackMap:
				scene.SetInputModeTrackMap(false);
				break;
			default:
				break;
		}

		// process setting of new input mode...................................//
		switch (val) {
			case VBI.InputModeTrackMap:
				scene.SetInputModeTrackMap(true);
				break;
			default:
				break;
		}

		// store input mode....................................................//
		this.m_nInputMode = val;
	};

	// ........................................................................//
	// set the tooltip on the canvas..........................................//

	scene.SetToolTip = function(tt, visibility, clientX, clientY) {
		var oCanvas = scene.m_Canvas[scene.m_nLabelIndex];

		if (tt instanceof sap.ui.core.TooltipBase) {
			// In case of RichTooltip, act based on visibility
			if (visibility == true && !tt._getPopup().isOpen()) {
				// open RichTooltip if it is not already open
				var sOffset = (clientX) + " " + (clientY + 20);
				tt.setMyPosition(sap.ui.core.Popup.Dock.BeginTop);
				tt.setAtPosition(sap.ui.core.Popup.Dock.BeginTop);
				tt.setOffset(sOffset);
				tt.setCollision("fit fit");
				tt.openPopup(tt.getParent());
				oCanvas.title = "";
			} else if (visibility == false && tt._getPopup().isOpen()) {
				// close RichTooltip if it is open
				tt.closePopup();
			}
		} else if (oCanvas.title != tt) {
			oCanvas.title = tt;
		}
	};

	scene.SetCursor = function(cc) {
		var oCanvas = scene.m_Canvas[scene.m_nLabelIndex];
		if (oCanvas.style.cursor != cc) {
			oCanvas.style.cursor = cc;
		}
	};

	scene.RenderAsync = function(bForceRecluster) {
		if (bForceRecluster != false) {
			scene.bForceRecluster = true;
		}

		if (!scene.m_RenderRequestID) {
			scene.m_RenderRequestID = window.requestAnimationFrame(scene.DoRender);
		}
	};

	scene.DoRender = function() {
		scene.Render(!scene.bForceRecluster);
	};

	scene.Render = function(suppressReclustering) {
		scene.m_RenderRequestID = 0;
		scene.bForceRecluster = false;
		// render the overlay..................................................//
		if (scene.m_Canvas.length) {
			scene.InternalRenderLayer(scene.m_Canvas[scene.m_nOverlayIndex], false, true, suppressReclustering != true, scene.m_Canvas[0].m_nExactLOD);
		}
	};

	scene.GoToInitialStart = function() {
		if (scene.m_nMaxLodVisualBorder < Math.ceil(scene.GetMinLOD())) {
			scene.m_nMaxLodVisualBorder = Math.ceil(scene.GetMinLOD()); // resolve inconsistant state
		}
		if (!scene.ZoomToGeoPosition(scene.m_startPointLonLat, scene.m_startLOD, true, false, true)) {
			// the target point is outside the allowed are
			var minP = VBI.MathLib.RadToDeg(scene.m_nBorderMinPoint);
			var maxP = VBI.MathLib.RadToDeg(scene.m_nBorderMaxPoint);
			var lons = [
				minP[0], maxP[0]
			];
			var lats = [
				minP[1], maxP[1]
			];

			scene.ZoomToMultiplePositions(lons, lats, 1.1, true);
		}
		scene.RenderAsync(true);
	};

	scene.GetDistance = function(ptStart, ptEnd) {
		var GeoStart = scene.GetPosFromVPPoint(ptStart);
		var GeoEnd = scene.GetPosFromVPPoint(ptEnd);
		return VBI.MathLib.Distance(VBI.MathLib.DegToRad(GeoStart), VBI.MathLib.DegToRad(GeoEnd));

	};
	scene.GetTargetPointForDistance = function(dist, ptStart) {
		var ptGeoStart = VBI.MathLib.DegToRad(scene.GetPosFromVPPoint(ptStart));
		var angle = 90 * Math.PI / 180;

		var lat = Math.asin(Math.sin(ptGeoStart[1]) * Math.cos(dist / VBI.MathLib.earthradius) + Math.cos(ptGeoStart[1]) * Math.sin(dist / VBI.MathLib.earthradius) * Math.cos(angle));
		var lon = ptGeoStart[0] + Math.atan2(Math.sin(angle) * Math.sin(dist / VBI.MathLib.earthradius) * Math.cos(ptGeoStart[1]), Math.cos(dist / VBI.MathLib.earthradius) - Math.sin(ptGeoStart[1]) * Math.sin(lat));
		// double dB_lon = dA_lon + atan2(sin(fYawAngle)*sin(dDistance/EARTH_RADIUS)*cos(dA_lat),
		// cos(dDistance/EARTH_RADIUS)-sin(dA_lat)*sin(dB_lat));
		return (scene.GetPointFromGeo([
			lon, lat
		], false));
	};

	scene.ZoomToMultiplePositions = function(lons, lats, corr, bSuppressRendering) {
		var minMaxX = [];
		var minMaxY = [];
		if (lons.length != lats.length) {
			return;
		}
		var nJ;
		for (nJ = 0; nJ < lons.length; nJ++) {
			var fLon = (parseFloat(lons[nJ]));
			if (fLon < 0) {
				fLon += 360;
			}
			minMaxX.push(fLon);
			minMaxY.push(parseFloat(lats[nJ]));
		}
		if (minMaxX.length != minMaxY.length || !minMaxX.length) {
			return;
		}
		// sort the arrays
		minMaxX.sort(function(a, b) {
			return a - b;
		});
		minMaxY.sort(function(a, b) {
			return a - b;
		});

		var minX = 0, maxX = 0, minY, maxY;
		minY = minMaxY[0];
		maxY = minMaxY[minMaxY.length - 1];
		var dist, from, to, tmp;
		from = minMaxX[minMaxX.length - 1];
		// find the largest distance between two points ( only x-axis )
		for (nJ = 0; nJ < minMaxX.length; nJ++) {
			to = minMaxX[nJ];
			tmp = (to < from ? (to + 360 - from) : (to - from));
			if (dist == undefined || tmp > dist) {
				dist = tmp;
				minX = (to < from ? to + 360 : to);
				maxX = from;
			}
			from = to;
		}
		scene.ZoomToArea(minX, maxX, minY, maxY, corr ? corr : 1.0, true, bSuppressRendering);
	};

	scene.ZoomToAreas = function(areaList, corr) {
		var xLOD = Math.log(scene.m_nDivWidth / (scene.m_MapManager.m_tileWidth * scene.m_nXSizeVisualBorder)) * Math.LOG2E;

		// we call getSurroundingBox with maxXDistShownSeparate == 0, so it adapts to DIV and LOD
		var tg = VBI.MathLib.GetSurroundingBox(areaList, 0, xLOD, scene.CalculateYMinLod, scene.m_bObjCanvasMode == 1 ? 0.5 : 0);

		scene.ZoomToArea(tg[0], tg[1], tg[2], tg[3], corr, true);

		var ts = new Date().getTime(); // overwrite LastZoomArea so ZoomToAreas() may be repeated
		scene.m_LastZoomArea = [
			ts, "Areas", areaList, corr
		];

		return true;
	};

	scene.ZoomTo = function(areaIds, corr) {

		var lat = [], lon = [];

		var zoomToAreaId = function(dataElementValues, vo, lon, lat, areaid) {
			dataElementValues.forEach(getValueofElements.bind(this, areaid, vo, lon, lat));
		 };

		 var getValueofElements = function(areaId, vo, lon, lat, value) {
			 if (areaId === value.m_Value) {
					if (vo.m_Pos) {
						 var pos = vo.m_Pos.GetValueVector(this.m_Ctx);
						 for (var k = 0; k < pos.length / 3; ++k) {
							  lon.push(pos[k * 3 + 0]);
							  lat.push(pos[k * 3 + 1]);
						 }
					}
			   }
		 };

		for (var i = 0; i < this.m_VOS.length; ++i) {
			  var vo = this.m_VOS[i];
			  var node = vo.m_DataSource.GetCurrentNode(this.m_Ctx);
			  if (node && node.m_dataelements.length) {
				   for (var j = 0; j < node.m_dataelements.length; ++j) {

						vo.m_DataSource.Select(j);

						var dataElementValues = node.m_dataelements[j].m_dataattributes;
						areaIds.forEach(zoomToAreaId.bind(this, dataElementValues, vo, lon, lat));
				   }
			  }
		 }
		 if (lon.length) {
			  scene.ZoomToMultiplePositions(lon, lat, corr);
		 }
		 return true;
	};


	//Collects all points from all VO's then calc combined bounding box and then zoome to it
	//corr is the correction factor, if corr is set to 1.0 the bounding box points are exactly on the visible boder of the new area / used for rectangular zoom
	//supressRendering supress the call for async render the map after zoom
	scene.ZoomToAll = function(corr, supressRendering) {
		var lat = [], lon = [];

		for (var i = 0; i < scene.m_VOS.length; ++i) {
			var vo = scene.m_VOS[i];
			var node = vo.m_DataSource ? vo.m_DataSource.GetCurrentNode(scene.m_Ctx) : null; //data provider can be absent

			if (node && node.m_dataelements.length) {
				for (var j = 0; j < node.m_dataelements.length; ++j) {
					vo.m_DataSource.Select(j);

					if (vo.m_Pos) { //array of position(s)
						var pos = vo.m_Pos.GetValueVector(scene.m_Ctx);

						for (var k = 0; k < pos.length / 3; ++k) {
							lon.push(pos[k * 3 + 0]);
							lat.push(pos[k * 3 + 1]);
						}
					} else if (vo.m_PosM) { //multi array of position(s)
						var pos = vo.m_PosM.GetValueVector(scene.m_Ctx);

						for (var k = 0; k < pos.length; ++k) {
							for (var m = 0; m < pos[k].length; ++m) {
								for (var n = 0; n < pos[k][m].length / 3; ++n) {
									lon.push(pos[k][m][n * 3 + 0]);
									lat.push(pos[k][m][n * 3 + 1]);
								}
							}
						}
					}
				}
			}
		}
		if (lon.length) {
			scene.ZoomToMultiplePositions(lon, lat, corr, supressRendering);
		}
	};

	scene.CalculateYMinLod = function(minY, maxY) {
		if (minY == maxY) {
			return 1000;
		}

		var ucsMin = [
			256, 256
		];
		var ucsMax = [
			256, 256
		];

		scene.m_Proj.LonLatToUCS(VBI.MathLib.DegToRad([
			0, minY
		]), ucsMin);
		scene.m_Proj.LonLatToUCS(VBI.MathLib.DegToRad([
			0, maxY
		]), ucsMax);
		var lodY = scene.m_nDivHeight / Math.abs(ucsMax[1] - ucsMin[1]);
		lodY = Math.log(lodY) * Math.LOG2E;

		return lodY;
	};

	scene.ZoomToArea = function(minX, maxX, minY, maxY, corr, bRoundDown, bSuppressRendering) {
		// by standard this method zooms in a way that both points are in the visible area
		// with a distance of 10% to the borders ( corr = 0.9 )
		// if corr is set to 1.0 the points are exactly on the visible boder of the new area / used for rectangular zoom

		var nTileWidth = 256, nTileHeight = 256;
		if (scene.m_MapManager) {
			nTileWidth = scene.m_MapManager.m_tileWidth;
			nTileHeight = scene.m_MapManager.m_tileHeight;
		}

		var theoHeight = scene.m_nDivHeight ? scene.m_nDivHeight : nTileHeight;
		var theoWidth = scene.m_nDivWidth ? scene.m_nDivWidth : nTileWidth;
		var bInsideRectangle;
		var pixelShift;

		if (jQuery.type(corr) == 'array') {
			if (corr.length >= 4) {
				var xCorr = corr[0] + corr[2];
				var yCorr = corr[1] + corr[3];
				if ((xCorr < theoWidth) && (yCorr < theoHeight)) {
					if ((corr[0] != corr[2]) || (corr[1] != corr[3])) {
						pixelShift = [
							(corr[2] - corr[0]) / 2, (corr[3] - corr[1]) / 2
						];
					}
					theoWidth -= xCorr;
					theoHeight -= yCorr;
					bInsideRectangle = ((xCorr < 0) || (yCorr < 0));
				}
			}
		} else {
			theoHeight *= corr;
			theoWidth *= corr;
			bInsideRectangle = (corr > 1.0);
		}
		// calculate midpoint to zoom in
		if (maxX < minX) {
			maxX += 360;
		}

		while (minX > 180) {
			minX -= 360;
		}
		while (maxX > 180) {
			maxX -= 360;
		}

		var min = [
			minX, minY
		];
		var max = [
			maxX, maxY
		];
		min = VBI.MathLib.DegToRad(min);
		max = VBI.MathLib.DegToRad(max);

		var ucsMin = [
			nTileWidth, nTileHeight
		];
		var ucsMax = [
			nTileWidth, nTileHeight
		];
		scene.m_Proj.LonLatToUCS(min, ucsMin);
		scene.m_Proj.LonLatToUCS(max, ucsMax);

		var ucsMiddleX = ucsMin[0] + ucsMax[0] + (ucsMax[0] < ucsMin[0]) * nTileWidth;
		var ucsMiddleY = ucsMin[1] + ucsMax[1];
		var ucsZoomPoint = [
			ucsMiddleX / nTileWidth - 1, ucsMiddleY / nTileHeight - 1
		];
		var zoomPoint = [
			1, 1
		];
		scene.m_Proj.UCSToLonLat(ucsZoomPoint, zoomPoint);

		// calculate the requested lod
		var lodY = 14, lodX = 14; // default value
		if (maxY != minY) {
			lodY = theoHeight / Math.abs(ucsMax[1] - ucsMin[1]);
			lodY = Math.log(lodY) * Math.LOG2E;
		}
		if (maxX != minX) {
			lodX = theoWidth / Math.abs((ucsMax[0] - ucsMin[0]) + (ucsMax[0] <= ucsMin[0]) * nTileWidth);
			lodX = Math.log(lodX) * Math.LOG2E;
		}
		var resultLod = (bInsideRectangle) ? Math.max(lodX, lodY) : Math.min(lodX, lodY);
		if (bRoundDown) {
			resultLod = Math.floor(resultLod);
		}
		scene.ZoomToGeoPosition(zoomPoint, resultLod, false, false, bSuppressRendering, pixelShift);
		if (resultLod != Math.floor(resultLod)) {
			setTimeout(function() {
				scene.AnimateZoomToGeo(zoomPoint, Math.floor(resultLod), 5);
			}, 20);
		}

		var ts = new Date().getTime();
		scene.m_LastZoomArea = [
			ts, "Area", minX, maxX, minY, maxY, corr
		];

	};

	scene.getInfoForCluster = function(ident, type) {
		var params = JSON.parse(ident);
		var clustering = scene.m_Ctx.m_Clustering;

		return clustering.getInfoForCluster(params, type, scene);
	};

	scene.AdaptOtherCanvas = function(uxy, lod, lodDist, nExactLodDist) {
		// adapts the canvas to the new scenario if possible, so we can blend over on filling canvas 1 afterwards and togling
		// if this is not possible, canvas is cleared and 0 is returned so we continue on canvas 0

		var nTarget = lodDist ? 1 : 0; // if stretching fails, target will remain canvas [0]
		var otherCanvas = scene.m_Canvas[1 - nTarget];

		if ((lodDist <= 1) && (lodDist >= -2)) { // we can not stretch the canvas that far to deal with lodDist = 2.
			var otherLodDist = lod - otherCanvas.m_nCurrentLOD;
			var lodFactor = Math.pow(2, -otherLodDist);
			var poslodFactor = Math.max(1, lodFactor);

			var pl = otherCanvas.getPixelLeft(), pt = otherCanvas.getPixelTop();
			var pw = otherCanvas.getPixelWidth(), ph = otherCanvas.getPixelHeight();

			var nOldStretchFactor = pw / scene.m_nWidthCanvas; // equal in other dimension
			var oldUxy = [
				(this.m_MapManager.m_tileWidth * otherCanvas.m_nCurrentX + (scene.m_nDivWidth / 2 - pl) / nOldStretchFactor), (this.m_MapManager.m_tileHeight * otherCanvas.m_nCurrentY + (scene.m_nDivHeight / 2 - pt) / nOldStretchFactor)
			];
			var deltaUxy = [
				oldUxy[0] - lodFactor * uxy[0], oldUxy[1] - lodFactor * uxy[1]
			];

			if ((Math.abs(deltaUxy[0]) < poslodFactor * scene.m_nWidthCanvas) && (Math.abs(deltaUxy[1]) < poslodFactor * scene.m_nHeightCanvas)) {
				var nDistortion = Math.pow(2, nExactLodDist);
				var newpl = nDistortion * (pl - scene.m_nDivWidth / 2 + nOldStretchFactor * deltaUxy[0]) + scene.m_nDivWidth / 2;
				var newpt = nDistortion * (pt - scene.m_nDivHeight / 2 + nOldStretchFactor * deltaUxy[1]) + scene.m_nDivHeight / 2;
				this.MoveCanvas(otherCanvas, newpl, newpt, pw * nDistortion, ph * nDistortion);
				return nTarget;
			}
		}

		return 0; // we target 0 now.
	};

	scene.ZoomToGeoPosition = function(lonlat, lod, doNotCorrectInvalidPositions, bSuppressEvents, bSuppressRendering, pixelShift) {
		if ((lonlat.pixelShift != undefined) && (pixelShift == undefined)) {
			pixelShift = lonlat.pixelShift;
		}
		if (scene.m_Canvas[scene.m_nNonDomIndex].m_bCanvasValid) { // in rare cases the move switch is not yet done so do it
			scene.SwitchTmpCanvasToActive();
		}
		var xShift = 0, yShift = 0;
		var canvas = scene.m_Canvas[0];
		var oldLOD = canvas.m_nExactLOD;
		var nTileWidth = scene.m_MapManager.m_tileWidth;
		var nTileHeight = scene.m_MapManager.m_tileHeight;

		var nExactLod = Math.min(Math.max(lod, scene.GetMinLOD()), scene.GetMaxLOD());
		lod = Math.floor(nExactLod);
		var nRemainingFactor = Math.pow(2, nExactLod - lod);
		var nLodDist = (1 << lod);
		if (pixelShift != undefined) {
			xShift = pixelShift[0] / nRemainingFactor;
			yShift = pixelShift[1] / nRemainingFactor;
		}

		// the zooming position should be in the center of the viewport........//
		// determine the position in pixel space...............................//
		var uxy = [
			nLodDist * nTileWidth, nLodDist * nTileHeight
		];
		scene.m_Proj.LonLatToUCS(lonlat, uxy);

		// determine left upper corner point in pixel space
		var luPoint = [
			uxy[0] - scene.m_nDivWidth / 2 + xShift, uxy[1] - scene.m_nDivHeight / 2 + yShift
		];
		var ucsMinX = scene.m_Proj.m_nUCSMin * nLodDist;

		var nTargetCanvas = scene.AdaptOtherCanvas(uxy, lod, lod - canvas.m_nCurrentLOD, nExactLod - canvas.m_nExactLOD);
		// determine the left top tile number of the canvas....................//
		var newXPos = Math.round(luPoint[0] / nTileWidth - scene.m_nCanvasStdXPos - ucsMinX);
		var newYPos = Math.round(luPoint[1] / nTileHeight - scene.m_nCanvasStdYPos);

		// determine the coordinate in canvas space............................//
		var nUnstretchedLeft = -Math.floor(luPoint[0] - (newXPos + ucsMinX) * nTileWidth);
		var nUnstretchedTop = -Math.floor(luPoint[1] - newYPos * nTileHeight);

		var newLeft = Math.round(nUnstretchedLeft + ((nRemainingFactor - 1) * (nUnstretchedLeft - scene.m_nDivWidth / 2)));
		var newTop = Math.round(nUnstretchedTop + ((nRemainingFactor - 1) * (nUnstretchedTop - scene.m_nDivHeight / 2)));

		var newWidth = Math.round(scene.m_nWidthCanvas * nRemainingFactor);
		var newHeight = Math.round(scene.m_nHeightCanvas * nRemainingFactor);

		// for zoom out we have to check whether we run out of north/south limits. if we would
		// do so we have to adapt newTop and (eventually) newYPos, so we zoom exactly to the limit
		var uxyLU = [
			nLodDist, nLodDist
		];
		var uxyRL = [
			nLodDist, nLodDist
		];
		scene.m_Proj.LonLatToUCS(scene.m_nBorderMinPoint, uxyLU);
		scene.m_Proj.LonLatToUCS(scene.m_nBorderMaxPoint, uxyRL);

		var nNewStretch = newHeight / scene.m_nHeightCanvas;
		var nTargetDistanceToNorthernBorder = nTileHeight * (newYPos - uxyLU[1]) * nNewStretch - newTop;
		var nTargetDistanceToSouthernBorder = nTileHeight * (newYPos - uxyRL[1]) * nNewStretch + scene.m_nDivHeight - newTop;
		var nPosCorrection;

		var bTopChanged = true;
		if (nTargetDistanceToNorthernBorder < -scene.m_nMaxPixelBeyondPoles) {
			newTop = nTileHeight * (newYPos - uxyLU[1]) * nNewStretch + scene.m_nMaxPixelBeyondPoles;
		} else if (nTargetDistanceToSouthernBorder > scene.m_nMaxPixelBeyondPoles) {
			newTop = nTileHeight * (newYPos - uxyRL[1]) * nNewStretch + scene.m_nDivHeight - scene.m_nMaxPixelBeyondPoles;
		} else {
			bTopChanged = false;
		}

		if (bTopChanged) { // Top has changed, but we have to check whether it is still in the allowed range
			// or whether we have to change the position
			if (doNotCorrectInvalidPositions) {
				return false;
			}

			var unstretchedTop = (newTop + (nRemainingFactor - 1) * scene.m_nDivHeight / 2) / nRemainingFactor;
			nPosCorrection = -Math.round(scene.m_nCanvasStdYPos + unstretchedTop / nTileHeight);
			newYPos += nPosCorrection;
			newTop += nRemainingFactor * nPosCorrection * nTileHeight;
		}

		if (scene.m_bXBorderExists) {
			var nTargetDistanceToWestBorder = nTileWidth * (newXPos - uxyLU[0]) * nNewStretch - newLeft;
			var nTargetDistanceToEastBorder = nTileWidth * (newXPos - uxyRL[0]) * nNewStretch + scene.m_nDivWidth - newLeft;

			var bLeftChanged = true;
			if (nTargetDistanceToWestBorder < -scene.m_nMaxPixelBeyondPoles) {
				newLeft = nTileWidth * (newXPos - uxyLU[0]) * nNewStretch + scene.m_nMaxPixelBeyondPoles;
			} else if (nTargetDistanceToEastBorder > scene.m_nMaxPixelBeyondPoles) {
				newLeft = nTileWidth * (newXPos - uxyRL[0]) * nNewStretch + scene.m_nDivWidth - scene.m_nMaxPixelBeyondPoles;
			} else {
				bLeftChanged = false;
			}

			if (bLeftChanged) { // Top has changed, but we have to check whether it is still in the allowed range
				// or whether we have to change the position
				if (doNotCorrectInvalidPositions) {
					return false;
				}

				var unstretchedLeft = (newLeft + (nRemainingFactor - 1) * scene.m_nDivWidth / 2) / nRemainingFactor;
				nPosCorrection = -Math.round(scene.m_nCanvasStdXPos + unstretchedLeft / nTileHeight);
				newXPos += nPosCorrection;
				newLeft += nRemainingFactor * nPosCorrection * nTileWidth;
			}
		}

		var bJustSmallMove = ((canvas.m_nCurrentX == newXPos) && (canvas.m_nCurrentY == newYPos) && (canvas.m_nCurrentLOD == lod));
		if (bJustSmallMove) {
			scene.MoveCanvas(canvas, newLeft, newTop, newWidth, newHeight);
			canvas.m_nExactLOD = nExactLod;
		} else {
			// Clear/Invalidate second canvas as it is outdated anyway
			scene.InvalidateCanvas(scene.m_Canvas[1]);
			if (nTargetCanvas == 0) {
				var context = canvas.getContext("2d");
				context.clearRect(0, 0, canvas.width, canvas.height);
			}

			// we fill canvas 1 in case we can blend over, otherwise canvas 0 directly.
			var canvasNew = scene.m_Canvas[nTargetCanvas];
			// request new tiles into the current canvas...........................//
			scene.MoveCanvas(canvasNew, newLeft, newTop, newWidth, newHeight);
			scene.m_MapManager.RequestTiles(canvasNew, scene.m_MapLayerStack, newXPos, newYPos, scene.m_nTilesX, scene.m_nTilesY, 0, 0, 0, 0, lod, false);

			canvasNew.m_nExactLOD = nExactLod;

			if (nTargetCanvas == 1) {
				scene.ToggleCanvas(scene);
			}
		}
		if (bSuppressRendering != true) {
			scene.InternalRenderLayer(scene.m_Canvas[scene.m_nOverlayIndex], false, !bJustSmallMove, !bJustSmallMove, nExactLod); // if exact lod
		}
		// changed we may
		// re-render

		scene.m_LastDefinedCenterPos = pixelShift ? undefined : lonlat;

		scene.InternalOnMoveLayer(canvas, bSuppressEvents);
		// call internal function to be able to do additional default behavior...//
		if (nExactLod != oldLOD) {
			scene.InternalOnZoomLayer(scene.m_Canvas[scene.m_nOverlayIndex], bSuppressEvents);
		}

		// notify NavControl.................................................//
		if (scene.m_bNavControlVisible && scene.m_NavControl) {
			scene.m_NavControl.AdjustScrollPoint(nExactLod);
		}

		return true;
	};

	scene.RefreshMapLayerStack = function() {
		var name = scene.m_RefMapLayerStack ? scene.m_RefMapLayerStack.m_Name : scene.m_MapLayerStack.m_Name;
		if (name) {
			scene.SetMapLayerStack(name);
			scene.AddCopyright();
		}
	};

	scene.SetMapLayerStack = function(name) {
		var item = scene.m_Ctx.m_MapLayerStackManager.GetMapLayerStack(name);

		if (item == null) {
			return; // do nothing
		}

		if (scene.m_Canvas[scene.m_nNonDomIndex].m_bCanvasValid) {
			scene.SwitchTmpCanvasToActive();
		}
		// set the new layer stack.............................................//
		scene.m_MapLayerStack = item;
		// request new tiles into the current visible canvas...................//
		var canvas = scene.m_Canvas[0];
		scene.m_MapManager.RequestTiles(canvas, scene.m_MapLayerStack, canvas.m_nCurrentX, canvas.m_nCurrentY, scene.m_nTilesX, scene.m_nTilesY, 0, 0, 0, 0, canvas.m_nCurrentLOD, false);
		// set the map layer stack by name.....................................//
		scene.InternalRenderLayer(scene.m_Canvas[scene.m_nOverlayIndex], false, true, true, canvas.m_nCurrentLOD);
	};

	scene.ZoomToZoomlevel = function(lonlat, newZoomLevel, bSuppressEvents) {
		var rectDiv = scene.GetInternalDivClientRect();
		if ((rectDiv.width != scene.m_nDivWidth) || (rectDiv.height != scene.m_nDivHeight)) {
			scene.resizeCanvas(0);
		}

		scene.ZoomToGeoPosition(lonlat, newZoomLevel, false, bSuppressEvents);
	};

	scene.GetMapLayerStack = function() {
		// just return the map layer stack.....................................//
		return scene.m_MapLayerStack;
	};

	scene.GetMinLOD = function() {
		var nSpace = Math.max(scene.m_nDivWidth / (scene.m_MapManager.m_tileWidth * scene.m_nXSizeVisualBorder), scene.m_nDivHeight / (scene.m_MapManager.m_tileHeight * scene.m_nYSizeVisualBorder));
		var nTheoMinimumLod = Math.log(nSpace) * Math.LOG2E;

		var mls = scene.m_MapLayerStack;
		var nCustMinLod = Math.max(scene.m_nMinLodVisualBorder - scene.m_nOffsetMinLod, mls ? mls.GetMinLOD() : 0);

		var act = Math.max(nTheoMinimumLod, nCustMinLod);
		if (scene.m_fMaxMinLODFraction != undefined && (act - Math.floor(act) > scene.m_fMaxMinLODFraction)) {
			return Math.ceil(act);
		}
		return act;

	};

	scene.GetMinLODForWidth = function(width) {
		var nSpace = width / scene.m_MapManager.m_tileWidth;
		var nTheoMinimumLod = Math.log(nSpace) * Math.LOG2E;

		var mls = scene.m_MapLayerStack;
		var nCustMinLod = Math.max(scene.m_nMinLodVisualBorder, mls ? mls.GetMinLOD() : 0) - scene.m_nOffsetMinLod;
		return Math.max(nTheoMinimumLod, nCustMinLod);
	};

	scene.GetMaxLOD = function() {
		var mls = scene.m_MapLayerStack;
		return Math.min(mls ? mls.GetMaxLOD() : 20, scene.m_nMaxLodVisualBorder);
	};

	scene.GetCurrentZoomlevel = function() {
		return scene.m_Canvas[0].m_nExactLOD;
	};

	scene.GetCenterPos = function() {
		// determine the center position on the viewport.......................//
		// in a geo scene this returned in lonlat and radians..................//

		// if available we use the last exact position
		if (scene.m_LastDefinedCenterPos != undefined) {
			return scene.m_LastDefinedCenterPos;
		}
		var cv = scene.getCanvas();
		var point = [
			scene.m_nDivWidth / 2 - cv.getPixelLeft(), scene.m_nDivHeight / 2 - cv.getPixelTop()
		];
		return (scene.GetGeoFromPoint(point));
	};

	// ........................................................................//
	// .internal functions.....................................................//

	scene.InternalRenderVisualObjects = function(canvas, dc, clusterData) {
		// iterate through objects and render them.............................//
		var ts1 = Date.now();
		var aVO = scene.m_VOS;
		var aVOLen = aVO.length;
		var cnt;
		scene.m_nNumOfScalingVOInst = 0;
		VBI.Utilities.BackupFont(dc);
		var shadow, dcs;
		if (clusterData) {
			if (scene.m_nShadowIndex != undefined) {
				shadow = scene.m_Canvas[scene.m_nShadowIndex];
				dcs = shadow.getContext('2d');
				dcs.clearRect(0, 0, shadow.width, shadow.height);
			}
		}
		scene.BuildCacheDataObj();

		for (var nj = 0; nj < aVOLen; ++nj) {
			aVO[nj].Init4Render();
		}

		for (var nJ = 0; nJ < aVOLen; ++nJ) {
			var curVO = aVO[nJ];
			if (curVO.m_Label && curVO.m_Label.length) {
				for (var nK = 0; nK < curVO.m_Label.length; ++nK) {
					curVO.m_Label[nK].clear();
				}
			}
			curVO.m_Label = [];
			if (clusterData) {
				var preData = clusterData.base[nJ];
				curVO.m_nPreDataIndex = nJ;
				cnt = curVO.Render(canvas, dc, preData);
				for (var nC = preData.clusterings.length; nC--;) {
					cnt += curVO.Render(canvas, dc, clusterData.clust[preData.clusterings[nC].i], shadow, dcs, true);
				}
			} else {
				cnt = curVO.Render(canvas, dc);
			}
			if (cnt != undefined) {
				scene.m_nNumOfScalingVOInst += cnt;
			}
		}
		this.InvalidateInvisibleHots();

		// when there is a design vo, we render it on top of everyting else....//
		if (scene.m_DesignVO) {
			scene.m_DesignVO.Render(canvas, dc);
		}
		var labelCanvas = scene.m_Canvas[scene.m_nLabelIndex];
		var dcl = labelCanvas.getContext('2d');
		VBI.Utilities.BackupFont(dcl);
		dcl.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
		scene.InternalRenderLabels(labelCanvas, dcl);

		VBI.Utilities.RestoreFont(dcl);
		VBI.Utilities.RestoreFont(dc);
		scene.DestroyCacheDataObj();
		scene.m_nLastRenderingTime = Date.now() - ts1;
		if (scene.m_Ctx.moThumbnail) {
			scene.Copy2Thumbnail();

		}
		// VBI.Trace("Renderingstep required "+(Date.now()-ts1)+" ms.");
	};

	scene.TriggerReRenderTimer = function(nTime) {
		window.clearInterval(scene.m_ReRenderTimer); // ZooMap is no more guaranteed rendering, so we trigger an asynchronous
		scene.m_ReRenderTimer = window.setInterval( // rendering 100 ms after the last change
		function() {
			window.clearInterval(scene.m_ReRenderTimer);
			scene.m_ReRenderTimer = null;
			if (!scene.m_bNonIntPosStable) {
				scene.m_bNonIntPosStable = Date.now();
			}
			scene.RenderAsync(true);
			if (scene.m_bLineAnimationRunning) {
				scene.TriggerReRenderTimer(15);
			}
		}, nTime);
	};

	scene.AddThumbnailText = function(canvas, thb) {
		var xPos, yPos, xAlign, yAlign;
		var dc = canvas.getContext('2d');
		switch (thb.nFontPos) { // evaluating x-part
			case 2:
			case 3:
			case 4:
				xPos = canvas.width;
				xAlign = "right";
				break;
			case 0:
			case 1:
			case 5:
				xPos = canvas.width / 2;
				xAlign = "center";
				break;
			default: // 6,7,8
				xPos = 0;
				xAlign = "left";
				break;
		}
		switch (thb.nFontPos) { // evaluating y-part
			case 4:
			case 5:
			case 6:
				yPos = canvas.height;
				yAlign = "bottom";
				break;
			case 7:
			case 0:
			case 3:
				yPos = canvas.height / 2;
				yAlign = "middle";
				break;
			default: // case 6 to 8 remains on top
				yPos = 0;
				yAlign = "top";
				break;

		}
		var aCol = VBI.Types.string2rgba(thb.strCol);
		dc.font = thb.strFont;
		dc.fillStyle = dc.strokeStyle = VBI.Utilities.RgbToHex(aCol[0], aCol[1], aCol[2]);
		dc.textAlign = xAlign;
		dc.textBaseline = yAlign;

		dc.fillText(thb.strText, xPos, yPos);
	};

	scene.GetOverlayPicture = function(iMode) {
		var sCanvas;
		var retVal;
		var objCorr = scene.GetStretchFactor4Mode();
		var tmpCanvas = VBI.Utilities.CreateGeoSceneCanvas("temporarynondomlayer", scene.m_nDivWidth, scene.m_nDivHeight, 0, 2);
		var tmpctx = tmpCanvas.getContext("2d");
		if (iMode & 2) { // try to include map canvas
			sCanvas = scene.m_Canvas[0];
			var mapCorr = scene.GetCurrentZoomFactors();
			tmpctx.drawImage(sCanvas, -sCanvas.m_pixelLeft / mapCorr[0], -sCanvas.m_pixelTop / mapCorr[1], scene.m_nDivWidth / mapCorr[0], scene.m_nDivHeight / mapCorr[1], 0, 0, scene.m_nDivWidth, scene.m_nDivHeight);
		}

		sCanvas = scene.m_Canvas[scene.m_nOverlayIndex];
		tmpctx.drawImage(sCanvas, -sCanvas.m_pixelLeft / objCorr[0], -sCanvas.m_pixelTop / objCorr[1], scene.m_nDivWidth / objCorr[0], scene.m_nDivHeight / objCorr[1], 0, 0, scene.m_nDivWidth, scene.m_nDivHeight);

		if (iMode & 1) {
			sCanvas = scene.m_Canvas[scene.m_nLabelIndex];
			tmpctx.drawImage(sCanvas, -sCanvas.m_pixelLeft / objCorr[0], -sCanvas.m_pixelTop / objCorr[1], scene.m_nDivWidth / objCorr[0], scene.m_nDivHeight / objCorr[1], 0, 0, scene.m_nDivWidth, scene.m_nDivHeight);
		}

		try {
			retVal = tmpCanvas.toDataURL("png");
		} catch (e) {
			VBI.Trace(e.message);
			return "";
		}

		return retVal;
	};

	scene.Copy2Thumbnail = function() {
		var thumbnailCanvas = scene.m_Canvas[scene.m_nThumbnailIndex];
		var sCanvas = scene.m_Canvas[0];
		var thctx = thumbnailCanvas.getContext("2d");
		var mapCorr = scene.GetCurrentZoomFactors();
		var objCorr = scene.GetStretchFactor4Mode();
		thctx.clearRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
		thctx.drawImage(sCanvas, -sCanvas.m_pixelLeft / mapCorr[0], -sCanvas.m_pixelTop / mapCorr[1], scene.m_Ctx.moThumbnail.nOrgWidth / mapCorr[0], scene.m_Ctx.moThumbnail.nOrgHeight / mapCorr[1], 0, 0, thumbnailCanvas.clientWidth, thumbnailCanvas.clientHeight);
		sCanvas = scene.m_Canvas[scene.m_nOverlayIndex];
		thctx.drawImage(sCanvas, -sCanvas.m_pixelLeft / objCorr[0], -sCanvas.m_pixelTop / objCorr[1], scene.m_Ctx.moThumbnail.nOrgWidth / objCorr[0], scene.m_Ctx.moThumbnail.nOrgHeight / objCorr[1], 0, 0, thumbnailCanvas.clientWidth, thumbnailCanvas.clientHeight);

		var thb = scene.m_Ctx.moThumbnail;
		if (thb.strFont && thb.nFontPos != undefined && thb.strText) {
			scene.AddThumbnailText(thumbnailCanvas, thb);
		}
		// Labelcanvas not copied to improve visibility
		// sCanvas = scene.m_Canvas[scene.m_nLabelIndex ];
		// thctx.drawImage(sCanvas, -sCanvas.m_pixelLeft/objCorr[0], -sCanvas.m_pixelTop/objCorr[1],
		// parseInt(scene.m_Ctx.moThumbnail.nOrgWidth)/objCorr[0],
		// parseInt(scene.m_Ctx.moThumbnail.nOrgHeight)/objCorr[1], 0, 0, thumbnailCanvas.clientWidth, thumbnailCanvas.clientHeight);
	};

	scene.CopyCanvasAway = function(canvas, target) {
		var labelCanvasDc = target.getContext('2d');
		labelCanvasDc.clearRect(0, 0, target.width, target.height);
		labelCanvasDc.drawImage(canvas, 0, 0, canvas.width, canvas.height);
	};

	scene.UpdatePreData4Selected = function(VOIndex, InstanceIndex) {
		var clustering = scene.m_Ctx.m_Clustering;
		if ((VOIndex != undefined) && clustering) {
			clustering.VerifyCurrentSelection(scene.m_VOS, scene.m_PreassembledData, scene.m_Ctx);
			clustering.AddSingle2Selected(VOIndex, scene.m_VOS, InstanceIndex, scene.m_PreassembledData, scene.m_Ctx);
		}
	};

	scene.UpdatePreData4SelArray = function(selectionArray) {
		var clustering = scene.m_Ctx.m_Clustering;
		if (clustering) {
			clustering.VerifyCurrentSelection(scene.m_VOS, scene.m_PreassembledData, scene.m_Ctx);
			clustering.AddMultiple2Selected(selectionArray, scene.m_VOS, scene.m_PreassembledData, scene.m_Ctx);
		}
	};

	VBI.addSceneLabelFunctions(scene);

	scene.InvalidatePreassembledData = function(clustering, lod) {
		var hotVO = scene.m_HotItem.m_VO;
		var lastHotCluster;
		if (hotVO != undefined && hotVO.IsClusterable()) {
			lastHotCluster = hotVO.SwitchHotItemToStandard();
		}
		scene.m_PreassembledData = undefined;

		if (scene.m_nShadowIndex != undefined) {
			scene.DisableShadowLayer();
		}

		return lastHotCluster;
	};

	scene.DisableShadowLayer = function() {
		var shadow = scene.m_Canvas[scene.m_nShadowIndex];
		var dcs = shadow.getContext('2d');
		dcs.clearRect(0, 0, shadow.width, shadow.height);

		scene.clearCanvas(scene.m_nShadowIndex);
		scene.m_Canvas.splice(scene.m_nShadowIndex, 1);
		scene.m_nShadowIndex = undefined;
	};

	scene.SwitchCanvasSize = function(canvas, newWidth, newHeight) {
		var dims = [
			newWidth, newHeight
		];
		var nSize = dims[0] * dims[1] / 1024;
		if (scene.m_nCanvasMaxPixel < nSize) {
			var fFakt = Math.sqrt(nSize / scene.m_nCanvasMaxPixel);
			dims[0] = Math.floor(dims[0] / fFakt);
			dims[1] = Math.floor(dims[1] / fFakt);
			scene.m_bObjCanvasMode = 2;
		} else {
			scene.m_bObjCanvasMode = 1;
		}

		canvas.width = scene.m_Canvas[scene.m_nLabelIndex].width = dims[0];
		canvas.height = scene.m_Canvas[scene.m_nLabelIndex].height = dims[1];

		if (scene.m_nShadowIndex) {
			scene.m_Canvas[scene.m_nShadowIndex].width = dims[0];
			scene.m_Canvas[scene.m_nShadowIndex].height = dims[1];
		}

		canvas.setPixelWidth(canvas.width);
		canvas.setPixelHeight(canvas.height);

		return dims;
	};

	scene.InternalRenderLayer = function(canvas, bClearLayer, bForceRender, bForceClustering, nNewExactLod, source) {
		var canvas0 = scene.m_Canvas[0];
		var lastHotCluster; // Preserve Info on Hot Item if it is an artifical cluster element
		var clustering = scene.m_Ctx.m_Clustering;
		var clusteringEnabled = ((clustering != undefined) && clustering.m_Clusters.length);
		if ((scene.m_PreassembledData != undefined) && !clusteringEnabled) {
			lastHotCluster = scene.InvalidatePreassembledData(clustering, canvas0.m_nCurrentLOD);
		}
		if ((bForceRender == false) && (nNewExactLod != undefined)) { // we have to check whether rendering is applicable
			var newLOD = Math.floor(nNewExactLod);
			if (nNewExactLod == scene.m_nLastRenderLOD) {
				return; // no zoom step at all -> nothing to be done
			}
			if ((newLOD == Math.floor(scene.m_nLastRenderLOD)) && (nNewExactLod != newLOD && (nNewExactLod > (scene.GetMinLOD() + 0.001)))) {
				var nLodDiff = Math.abs(nNewExactLod - scene.m_nLastRenderLOD);
				if (nLodDiff < scene.m_nLastRenderingTime / scene.m_nRenderTimeTarget) {
					return;
				}
			}
		}
		// whenever the overlay layer is rendered, reset the overlay image data//
		// scene.m_OverlayImageData = null;
		scene.m_OverlayImage = null;

		scene.m_nLastRenderLOD = (nNewExactLod == undefined) ? -1 : nNewExactLod;

		// canvas is the object layer canvas...................................//
		var newX, oldX = canvas.getPixelWidth();
		var newY, oldY = canvas.getPixelHeight();
		if (scene.m_bObjCanvasMode) {
			var newDims = scene.SwitchCanvasSize(canvas, oldX, oldY);
			scene.m_StretchFactors = [
				oldX / newDims[0], oldY / newDims[1]
			];
			scene.m_ZoomFactors = [
				newDims[0] / scene.m_nWidthCanvas, newDims[1] / scene.m_nHeightCanvas
			];
			newX = oldX;
			newY = oldY;
		} else {
			newX = scene.m_nWidthCanvas;
			newY = scene.m_nHeightCanvas;
			canvas.setPixelWidth(newX);
			canvas.setPixelHeight(newY);
			scene.m_ZoomFactors = [
				1, 1
			];
			scene.m_StretchFactors = [
				oldX / scene.m_nWidthCanvas, oldY / scene.m_nHeightCanvas
			];
		}

		var dc = canvas.getContext('2d');

		if (bClearLayer) {
			dc.clearRect(0, 0, canvas.width, canvas.height);

			// resize again.....................................................//
			canvas.setPixelWidth(oldX);
			canvas.setPixelHeight(oldY);
			return;
		}
		var bSwitchOnShadowCanvas = false;
		if (clusteringEnabled) {
			this.SetLastHotItem(scene.m_HotItem);
			var ts1 = Date.now();
			scene.m_PreassembledData = clustering.DoClustering(this, canvas0.m_nCurrentLOD, canvas0.m_nCurrentX, canvas0.m_nCurrentY, scene.m_nTilesX, scene.m_nTilesY, scene.m_VOS, scene.m_Ctx, lastHotCluster, bForceRender, bForceClustering, scene.m_nDataVersion);
			this.CheckHotItem();
			if (scene.m_PreassembledData.config.bNeedsShadowLayer && (scene.m_nShadowIndex == undefined)) {
				scene.m_nShadowIndex = scene.m_Canvas.length;
				scene.m_Canvas.push(VBI.Utilities.CreateGeoSceneCanvas(scene.m_TargetName + "-" + scene.m_ID + "-shadow", newX, newY)); // shadow
				// insert layer
				scene.InitializeCanvas(scene.m_Canvas[scene.m_nShadowIndex], scene.m_Canvas[scene.m_nOverlayIndex]);
				bSwitchOnShadowCanvas = true;
			}
			if (!scene.m_PreassembledData.config.bNeedsShadowLayer && (scene.m_nShadowIndex != undefined)) {
				scene.DisableShadowLayer();
			}

			scene.m_nLastClusteringTime = Date.now() - ts1;
		}
		// render all visual objects in the layer..............................//
		dc.clearRect(0, 0, canvas.width, canvas.height);

		scene.InternalRenderVisualObjects(canvas, dc, scene.m_PreassembledData);
		if (scene.m_bObjCanvasMode != 1) {
			canvas.setPixelWidth(oldX);
			canvas.setPixelHeight(oldY);
		}
		if (bSwitchOnShadowCanvas) {
			scene.MoveCanvas2ObjectCanvas(scene.m_Canvas[scene.m_nShadowIndex]);
		}
		// call event relevant function........................................//
		scene.InternalOnRenderLayer(canvas);
		if (scene.m_Scale) {
			scene.m_Scale.Update();
		}

		if (scene.m_bSwitch2OldCanvasMode && canvas0.m_nExactLOD == Math.round(canvas0.m_nExactLOD)) {
			scene.m_bSwitch2OldCanvasMode = undefined;
			scene.m_bObjCanvasMode = 0;
			VBI.Trace("Switching back to old object canvas rendering style due to performance issues ");
		}
	};

	scene.InternalOnMoveLayer = function(canvas, bSuppressEvents) {
		// a move is done notify windows about the move........................//
		scene.m_Ctx.m_Windows.NotifySceneMove(this);

		// check for subscribed action and raise it............................//
		var actions;
		if ((actions = scene.m_Ctx.m_Actions) && (bSuppressEvents != true)) {
			// check if action is subscribed....................................//
			var action = actions.findAction("CenterChanged", scene, "Map");
			if (action) {
				// determine the boundaries......................................//
				var cv = scene.m_Canvas[scene.m_nOverlayIndex];
				var nPixelWidth = cv.getPixelWidth();
				var nPixelHeight = cv.getPixelHeight();

				// get geo positions of corner points.............................//
				var lt = scene.GetPosFromPoint([
					0, 0
				]);
				var rb = scene.GetPosFromPoint([
					nPixelWidth, nPixelHeight
				]);
				if (!scene.m_Proj.m_bIsIsogonal) { // then we have to check the other corner points also
					var rt = scene.GetPosFromPoint([
						nPixelWidth, 0
					]);
					var lb = scene.GetPosFromPoint([
						0, nPixelHeight
					]);
					lt = [
						Math.min(lt[0], lb[0]), Math.min(lt[1], rt[1])
					];
					rb = [
						Math.max(rt[0], rb[0]), Math.max(lb[1], rb[1])
					];
				}
				// get geo positions for viewport corner points
				var rect = scene.GetInternalDivClientRect();
				var vpOffsetLeft = -cv.getPixelLeft();
				var vpOffsetTop = -cv.getPixelTop();
				var vlt = scene.GetPosFromPoint([
					vpOffsetLeft, vpOffsetTop
				]);
				var vrb = scene.GetPosFromPoint([
					vpOffsetLeft + rect.width, vpOffsetTop + rect.height
				]);

				var params = {
					level: scene.GetCurrentZoomlevel().toString(),
					min: lt[0].toString() + ";" + lt[1].toString() + ";0",
					max: rb[0].toString() + ";" + rb[1].toString() + ";0",
					vpmin: vlt[0].toString() + ";" + vlt[1].toString() + ";0",
					vpmax: vrb[0].toString() + ";" + vrb[1].toString() + ";0"
				};

				scene.m_Ctx.FireAction(action, scene, this, null, params);
			}
		}

		// call into publish subscribe mechanism...............................//
		this.m_EvtCont.fire("onMove", {
			canvas: canvas
		});

		// call into event subscriptions.......................................//
		scene.m_Ctx.onMoveLayer(canvas);
	};

	scene.InternalOnZoomLayer = function(canvas, clickCoords) {
		// a move is done notify windows about the move........................//
		scene.m_Ctx.m_Windows.NotifySceneZoom(this);

		// check if the standard subscription is done and raise the submit.....//
		// event...............................................................//

		// check for subscribed action and raise it............................//
		if (clickCoords != true) { // suppress event mode
			var actions = scene.m_Ctx.m_Actions;
			if (actions) {
				// check if action is subscribed....................................//
				var action = actions.findAction("ZoomChanged", scene, "Map");
				if (action) {
					// determine the boundaries......................................//
					var cv = scene.m_Canvas[scene.m_nOverlayIndex];
					var nPixelWidth = cv.getPixelWidth();
					var nPixelHeight = cv.getPixelHeight();

					// get geo positions of corner points.............................//
					var lt = scene.GetPosFromPoint([
						0, 0
					]);
					var rt = scene.GetPosFromPoint([
						nPixelWidth, 0
					]);
					var lb = scene.GetPosFromPoint([
						0, nPixelHeight
					]);
					var rb = scene.GetPosFromPoint([
						nPixelWidth, nPixelHeight
					]);

					// get geo positions for viewport corner points
					var rect = scene.GetInternalDivClientRect();
					var vpOffsetLeft = -cv.getPixelLeft();
					var vpOffsetTop = -cv.getPixelTop();
					var vlt = scene.GetPosFromPoint([
						vpOffsetLeft, vpOffsetTop
					]);
					var vrb = scene.GetPosFromPoint([
						vpOffsetLeft + rect.width, vpOffsetTop + rect.height
					]);

					var params = {
						level: scene.GetCurrentZoomlevel().toString(),
						min: Math.min(lt[0], lb[0]).toString() + ";" + Math.min(lt[1], rt[1]).toString() + ";0",
						max: Math.max(rb[0], rt[0]).toString() + ";" + Math.max(lb[1], rb[1]).toString() + ";0",
						vpmin: vlt[0].toString() + ";" + vlt[1].toString() + ";0",
						vpmax: vrb[0].toString() + ";" + vrb[1].toString() + ";0"
					};

					if (clickCoords != undefined && clickCoords != false) {
						params.x = clickCoords.x.toString() - rect.left;
						params.y = clickCoords.y.toString() - rect.top;
					}

					scene.m_Ctx.FireAction(action, scene, this, null, params);
				}
			}
		}

		// call into publish subscribe mechanism...............................//
		this.m_EvtCont.fire("onZoom", {
			canvas: canvas
		});

		// call into direct event subscriptions................................//
		scene.m_Ctx.onZoomLayer(canvas);
	};

// .......................................................................//
// scene events and their default implementation..........................//

	scene.InternalOnRenderLayer = function(canvas) {
		// call into event subscriptions.......................................//
		scene.m_Ctx.onRenderLayer(canvas);

		// do some default implementation......................................//
		if (scene.GetHomeLocation) {
			// canvas is the object layer canvas................................//
			var oldX = canvas.getPixelWidth();
			var oldY = canvas.getPixelHeight();

			var lonlat = [
				0, 0
			];
			var homeloc = scene.GetHomeLocation();

			lonlat[0] = homeloc[0];
			lonlat[1] = homeloc[1];

			var xy = scene.GetPointFromGeo(lonlat);

			canvas.setPixelWidth(scene.m_nWidthCanvas);
			canvas.setPixelHeight(scene.m_nHeightCanvas);

			var context = canvas.getContext('2d');
			context.clearRect(0, 0, canvas.width, canvas.height);

			// draw a circle position...........................................//
			context.fillStyle = 'yellow';
			context.beginPath();
			context.arc(xy[0], xy[1], 5, 0, Math.PI * 2, true);
			context.closePath();
			context.fill();

			var image = null;
			if (scene.m_Ctx) {
				image = scene.m_Ctx.GetImage("dummy", scene.RenderAsync.bind());
			}

			if (image) {
				context.drawImage(image, xy[0] - image.naturalWidth / 2, xy[1] - image.naturalHeight);
			}
			// resize again.....................................................//
			canvas.setPixelWidth(oldX);
			canvas.setPixelHeight(oldY);
		}
	};

// .......................................................................//
// helper move functions..................................................//

	scene.MoveObject = function(o, x, y, width, height) {
		o.m_pixelLeft = Math.round(x);
		o.m_pixelTop = Math.round(y);
		o.style.left = o.m_pixelLeft.toString() + "px";
		o.style.top = o.m_pixelTop.toString() + "px";
		if (width !== undefined) {
			o.m_pixelWidth = Math.round(width);
			o.style.width = o.m_pixelWidth.toString() + "px";
		}
		if (height !== undefined) {
			o.m_pixelHeight = Math.round(height);
			o.style.height = o.m_pixelHeight.toString() + "px";
		}
	};

	scene.InvalidateCanvas = function(canvas) {
		var context = canvas.getContext("2d");
		context.fillStyle = 'white';
		context.clearRect(0, 0, canvas.width, canvas.height);
		canvas.m_bInvalid = true;
	};

	scene.MoveCanvas = function(canvas, x, y, width, height) {
		scene.MoveObject(scene.m_Canvas[scene.m_nOverlayIndex], x, y, width, height);
		scene.MoveObject(scene.m_Canvas[scene.m_nLabelIndex], x, y, width, height);
		if (scene.m_nShadowIndex != undefined) {
			scene.MoveObject(scene.m_Canvas[scene.m_nShadowIndex], x, y, width, height);
		}

		scene.MoveObject(canvas, x, y, width, height);
	};

	scene.MoveOnlyThisCanvas = function(canvas, x, y, width, height) {
		scene.MoveObject(canvas, x, y, width, height);
	};

	scene.MoveCanvas2ObjectCanvas = function(canvas) {
		var c2 = scene.m_Canvas[scene.m_nOverlayIndex];
		scene.MoveObject(canvas, c2.m_pixelLeft, c2.m_pixelTop, c2.m_pixelWidth, c2.m_pixelHeight);
	};

	scene.MoveMap = function(dx, dy) {
		if (VBI.m_bTrace) {
			VBI.Trace("MoveMap" + " DX:" + dx + " DY:" + dy);
		}

		var tmpCanvas = scene.m_Canvas[scene.m_nNonDomIndex];
		var canvas = scene.m_Canvas[0];
		var currentCanvas = (tmpCanvas.m_bCanvasValid ? tmpCanvas : canvas);

		var mapMan = scene.m_MapManager;

		var nPixelWidth = currentCanvas.getPixelWidth();
		var nPixelHeight = currentCanvas.getPixelHeight();
		var nPosX = currentCanvas.getPixelLeft() + dx;
		var nPosY = currentCanvas.getPixelTop() + dy;

		var tw = mapMan.m_tileWidth, th = mapMan.m_tileHeight;

		// width of a current tile...........................................//
		var nCurrentTilePixelWidth = nPixelWidth / scene.m_nTilesX;
		var nCurrentTilePixelHeight = nPixelHeight / scene.m_nTilesY;

		var nStretch = nPixelHeight / scene.m_nHeightCanvas;

		// Check whether move goes too far North or too far South
		var nLodDist = (1 << canvas.m_nCurrentLOD);
		var uxyLU = [
			nLodDist, nLodDist
		];
		var uxyRL = [
			nLodDist, nLodDist
		];
		scene.m_Proj.LonLatToUCS(scene.m_nBorderMinPoint, uxyLU);
		scene.m_Proj.LonLatToUCS(scene.m_nBorderMaxPoint, uxyRL);

		if ((dy > 0 && ((th * nStretch * (currentCanvas.m_nCurrentY - uxyLU[1]) - nPosY) < -scene.m_nMaxPixelBeyondPoles)) || (dy < 0 && ((th * nStretch * (currentCanvas.m_nCurrentY - uxyRL[1]) + scene.m_nDivHeight - nPosY) > scene.m_nMaxPixelBeyondPoles))) {
			if (dx == 0) {
				return;
			}
			dy = 0; // on diagonal moves we eliminate just the y-component
			nPosY = currentCanvas.getPixelTop();
		}

		if (scene.m_bXBorderExists && ((dx > 0 && ((tw * nStretch * (currentCanvas.m_nCurrentX - uxyLU[0]) - nPosX) < -scene.m_nMaxPixelBeyondPoles)) || (dx < 0 && ((tw * nStretch * (currentCanvas.m_nCurrentX - uxyRL[0]) + scene.m_nDivWidth - nPosX) > scene.m_nMaxPixelBeyondPoles)))) {
			if (dy == 0) {
				return;
			}
			dx = 0;
			nPosX = currentCanvas.getPixelLeft();
		}

		var nOffsetX = 0;
		var nOffsetY = 0;
		var nTemp;
		//
		// First we determine whether a tile shift is required
		//
		if ((dx > 0) && (nTemp = nPosX + scene.m_nMapMoveXPreLoad) > 0) { // left side is missing tiles, calc number of missed tiles //
			nOffsetX = Math.ceil(nTemp / nCurrentTilePixelWidth);
		} else if ((dx < 0) && ((nTemp = scene.m_nMapMoveXPreLoad + scene.m_nDivWidth - (nPosX + nPixelWidth)) > 0)) { // right side is missing tiles
			// ... //
			nOffsetX = -Math.ceil(nTemp / nCurrentTilePixelWidth);
		}
		var newLeft = currentCanvas.m_nCurrentX - nOffsetX;

		if ((dy > 0) && (nTemp = nPosY + scene.m_nMapMoveYPreLoad) > 0) { // top side is missing tiles ... //
			nOffsetY = Math.ceil(nTemp / nCurrentTilePixelHeight);
		} else if ((dy < 0) && (nTemp = (scene.m_nMapMoveYPreLoad + scene.m_nDivHeight - (nPosY + nPixelHeight))) > 0) { // bottom side is missing
			// tiles ... //
			nOffsetY = -Math.ceil(nTemp / nCurrentTilePixelHeight);
		}
		var newTop = currentCanvas.m_nCurrentY - nOffsetY;

		// then we execute the move
		// to do so we determine one column block and/or one row block which has to be requested newly
		// the remaining part is copied from old position to new position
		// in case of iphone we simply request the tiles as the copy process does not work well on it
		//
		var mls = scene.m_MapLayerStack;
		var bSingleBMP = mls ? mls.m_bSingleBMP : false;
		if (nOffsetX || nOffsetY) {
			var nPendingOffsetX = 0, nPendingOffsetY = 0;
			// if not yet done, invalidate the second canvas as we would have to request here also
			if (!scene.m_Canvas[1].m_bInvalid) {
				scene.InvalidateCanvas(scene.m_Canvas[1]);
			}

			scene.MoveCanvas(canvas, canvas.getPixelLeft() + dx, canvas.getPixelTop() + dy);
			if (tmpCanvas.m_bCanvasValid) {
				if (tmpCanvas.m_nTilesBefSwitch < tmpCanvas.m_nForceSwitchLimit) {
					scene.SwitchTmpCanvasToActive();
				} else {
					nPendingOffsetX = tmpCanvas.m_nOffsetX;
					nPendingOffsetY = tmpCanvas.m_nOffsetY;
				}
			}

			tmpCanvas.m_nTilesBefSwitch = (bSingleBMP || Math.abs(nOffsetX) >= scene.m_nTilesX || Math.abs(nOffsetY) >= scene.m_nTilesY) ? 1 : (scene.m_nTilesX - Math.abs(nOffsetX)) * (scene.m_nTilesY - Math.abs(nOffsetY));
			tmpCanvas.m_nForceSwitchLimit = Math.ceil(tmpCanvas.m_nTilesBefSwitch / 2);
			tmpCanvas.m_nOffsetX = nOffsetX + nPendingOffsetX;
			tmpCanvas.m_nOffsetY = nOffsetY + nPendingOffsetY;
			scene.MoveOnlyThisCanvas(tmpCanvas, nPosX - nOffsetX * nCurrentTilePixelWidth, nPosY - nOffsetY * nCurrentTilePixelHeight, nPixelWidth, nPixelHeight);

			var context = tmpCanvas.getContext("2d");
			context.clearRect(0, 0, canvas.getPixelWidth(), canvas.getPixelHeight());
			if (mapMan.RequestTiles(tmpCanvas, scene.m_MapLayerStack, newLeft, newTop, scene.m_nTilesX, scene.m_nTilesY, 0, 0, 0, 0, canvas.m_nCurrentLOD, false)) {
				tmpCanvas.m_bCanvasValid = true;
			} else {
				scene.SwitchTmpCanvasToActive();
			}
		} else {
			// just set the new positions.......................................//
			scene.MoveCanvas(canvas, canvas.getPixelLeft() + dx, canvas.getPixelTop() + dy);
			scene.MoveObject(scene.m_Canvas[1], scene.m_Canvas[1].getPixelLeft() + dx, scene.m_Canvas[1].getPixelTop() + dy);
			if (tmpCanvas.m_bCanvasValid) {
				scene.MoveOnlyThisCanvas(tmpCanvas, nPosX, nPosY);
			}
		}

		var aVO = scene.m_VOS;
		var bRerender = false;
		for (var nI = 0, len = aVO.length; nI < len; ++nI) {
			if (aVO[nI].m_Label.length > 0 && aVO[nI].CalculateLabelPos) {
				bRerender = true;
				break;
			}

		}
		if (bRerender) {
			var ctx = scene.m_Canvas[scene.m_nLabelIndex].getContext("2d");
			ctx.clearRect(0, 0, scene.m_Canvas[scene.m_nLabelIndex].width, scene.m_Canvas[scene.m_nLabelIndex].height);
			VBI.Utilities.BackupFont(ctx);
			scene.InternalRenderLabels(scene.m_Canvas[scene.m_nLabelIndex], ctx);
			VBI.Utilities.RestoreFont(ctx);
		}

		scene.InternalOnMoveLayer(scene.m_Canvas[scene.m_nOverlayIndex]);
		scene.m_LastDefinedCenterPos = undefined;

	};

	scene.AdaptZoomFactor = function(canvas, factor, xOffset, yOffset, targetedTicks) {
		var result = {};
		result.bZoomNotPossible = true; // set to false if all checks are passed successfully

		var nMaxTiles = (1 << canvas.m_nCurrentLOD);

		if ((canvas.m_nCurrentY < 0) && (yOffset < -canvas.m_nCurrentY * (canvas.getPixelHeight() / scene.m_nTilesY))) {
			return result; // GeoPos is above northpole
		}
		if (((canvas.m_nCurrentY + scene.m_nTilesY) > nMaxTiles) && (yOffset > (nMaxTiles - canvas.m_nCurrentY) * (canvas.getPixelHeight() / scene.m_nTilesY))) {
			return result; // GeoPos is beyond southpole
		}
		if (factor < 1) {
			var nNumberOfVisibleEarths = Math.max((scene.m_nDivWidth / (canvas.getPixelWidth() * scene.m_nXSizeVisualBorder)) * (scene.m_nTilesX / nMaxTiles), (scene.m_nDivHeight / (canvas.getPixelHeight() * scene.m_nYSizeVisualBorder)) * (scene.m_nTilesY / nMaxTiles));
			if (factor < nNumberOfVisibleEarths) { // means NumEarths / factor would have result > 1
				if ((nNumberOfVisibleEarths >= 1) && (factor != 0)) {
					return result; // no zoom or zoom in wrong direction required -> skip
				}
				factor = nNumberOfVisibleEarths; // change factor to max, so that we see exactly one earth.
				// bAdaptToEvenLod = false;
			}
		}
		var bAdaptToEvenLod = targetedTicks && (scene.m_nZoomMode || (factor == scene.m_nLodFactorZoomIn) || (factor == scene.m_nLodFactorZoomOut));
		var exactLod = canvas.m_nExactLOD + Math.log(factor) * Math.LOG2E;
		var minLOD = scene.GetMinLOD();
		if ((minLOD != Math.round(minLOD)) && (factor != 1.0) && (canvas.m_nExactLOD <= Math.ceil(minLOD)) && (Math.round(targetedTicks * exactLod) == Math.round(targetedTicks * minLOD))) { // only
			bAdaptToEvenLod = false;
		}

		if (bAdaptToEvenLod && Math.round(targetedTicks * exactLod) != targetedTicks * exactLod) {
			exactLod = Math.round(targetedTicks * exactLod) / targetedTicks;
			factor = Math.pow(2, exactLod - canvas.m_nExactLOD);
		} else if (exactLod < minLOD) {
			exactLod = minLOD;
			factor = Math.pow(2, exactLod - canvas.m_nExactLOD);
		}
		result.factor = factor;
		result.nNewLod = Math.floor(exactLod);
		result.lodFallsOnInteger = (Math.round(exactLod) == exactLod);

		result.bZoomNotPossible = ((exactLod > scene.GetMaxLOD()) || (exactLod < minLOD));

		return result;
	};

// ........................................................................//
// map zoom occured.......................................................//

	scene.ZoomMap = function(factor, xOffset, yOffset, targetedTicks, bSuppressEvent) {
		scene.m_bNonIntPosStable = false;
		if (scene.m_Canvas[scene.m_nNonDomIndex].m_bCanvasValid) {
			scene.SwitchTmpCanvasToActive();
		}

		var canvas = scene.m_Canvas[0];
		var otherCanvas = scene.m_Canvas[1];
		var mapMan = scene.m_MapManager;
		var tw = mapMan.m_tileWidth, th = mapMan.m_tileHeight;
		var nTilesX, nTilesY, nPosX = 0, nPosY = 0;

		// get old canvas settings
		var oldLeft = canvas.getPixelLeft(), oldTop = canvas.getPixelTop();
		var oldWidth = canvas.getPixelWidth(), oldHeight = canvas.getPixelHeight();
		var otherPixelWidth = otherCanvas.getPixelWidth();

		// Adapt factor to MinimalLod and to even lod if required and check whether we can continue
		var zoomData = scene.AdaptZoomFactor(canvas, factor, xOffset, yOffset, targetedTicks);
		if (zoomData.bZoomNotPossible) {
			return;
		}
		factor = zoomData.factor; // corrected zoom factor
		var nNewLod = zoomData.nNewLod;
		if (VBI.m_bTrace) {
			VBI.Trace("Zoom by " + factor + " to " + xOffset + "/" + yOffset);
		}

		// Moving current canvas accordingly
		var newWidth = Math.round(oldWidth * factor);
		var newHeight = Math.round(newWidth * canvas.height / canvas.width);
		var newLeft = Math.round(oldLeft - ((factor - 1) * xOffset));
		var newTop = Math.round(oldTop - ((factor - 1) * yOffset));

		if (factor < 1) { // for zoom out we have to check whether we run out of north/south limits
			// if we would do so we have to adapt yOffset so we zoom exactly to the limit
			var nLodDist = (1 << canvas.m_nCurrentLOD);

			var uxyLU = [
				nLodDist, nLodDist
			];
			var uxyRL = [
				nLodDist, nLodDist
			];
			scene.m_Proj.LonLatToUCS(scene.m_nBorderMinPoint, uxyLU);
			scene.m_Proj.LonLatToUCS(scene.m_nBorderMaxPoint, uxyRL);

			var nNewStretch = newHeight / scene.m_nHeightCanvas;
			var nTargetDistanceToNorthernBorder = (canvas.m_nCurrentY - uxyLU[1]) * th * nNewStretch - newTop;

			if (nTargetDistanceToNorthernBorder < -scene.m_nMaxPixelBeyondPoles) {
				newTop = Math.round(th * (canvas.m_nCurrentY - uxyLU[1]) * nNewStretch + scene.m_nMaxPixelBeyondPoles);
				yOffset = (oldTop - newTop) / (factor - 1);
			} else { // no zoom out can violate against both conditions as MaxPixelBeyondPoles and MinLod are set accordingly
				var nTargetDistanceToSouthernBorder = th * (canvas.m_nCurrentY - uxyRL[1]) * nNewStretch + scene.m_nDivHeight - newTop;
				if (nTargetDistanceToSouthernBorder > scene.m_nMaxPixelBeyondPoles) {
					newTop = Math.round(th * (canvas.m_nCurrentY - uxyRL[1]) * nNewStretch + scene.m_nDivHeight - scene.m_nMaxPixelBeyondPoles);
					yOffset = (oldTop - newTop) / (factor - 1);
				}
			}
			if (scene.m_bXBorderExists) {
				var nTargetDistanceToWestBorder = (canvas.m_nCurrentX - uxyLU[0]) * tw * nNewStretch - newLeft;
				if (nTargetDistanceToWestBorder < -scene.m_nMaxPixelBeyondPoles) {
					newLeft = Math.round(tw * (canvas.m_nCurrentX - uxyLU[0]) * nNewStretch + scene.m_nMaxPixelBeyondPoles);
					xOffset = (oldLeft - newLeft) / (factor - 1);
				}
				var nTargetDistanceToEastBorder = (canvas.m_nCurrentX - uxyRL[0]) * tw * nNewStretch + scene.m_nDivWidth - newLeft;
				if (nTargetDistanceToEastBorder > scene.m_nMaxPixelBeyondPoles) {
					newLeft = Math.round(tw * (canvas.m_nCurrentX - uxyRL[0]) * nNewStretch + scene.m_nDivWidth - scene.m_nMaxPixelBeyondPoles);
					xOffset = (oldLeft - newLeft) / (factor - 1);
				}
			}
		}

		scene.MoveCanvas(canvas, newLeft, newTop, newWidth, newHeight);

		var newTilePixelWidth = newWidth / scene.m_nTilesX;
		var newTilePixelHeight = newHeight / scene.m_nTilesY;

		// we request new tiles if LOD changes or we run out of viewport
		var bRequestNewTiles = false;
		if (nNewLod == canvas.m_nCurrentLOD) { // no lod switch..........................//
			if (!otherCanvas.m_bInvalid) {
				// we have to correct position of second canvas as it might be visible also
				var otherCanvasWidth = Math.round(otherPixelWidth * factor);
				var otherCanvasHeight = Math.round(otherCanvas.getPixelHeight() * factor);
				// if we have enought memory we can stretch, otherwise we clear
				if ((otherCanvasWidth <= scene.m_nMaxCanvasDimension) && (otherCanvasHeight <= scene.m_nMaxCanvasDimension)) {
					var otherPixelLeft = otherCanvas.getPixelLeft();
					var otherPixelTop = otherCanvas.getPixelTop();

					var otherCanvasLeft = Math.round(otherPixelLeft - ((factor - 1) * (xOffset + oldLeft - otherPixelLeft)));
					var otherCanvasTop = Math.round(otherPixelTop - ((factor - 1) * (yOffset + oldTop - otherPixelTop)));
					scene.MoveObject(otherCanvas, otherCanvasLeft, otherCanvasTop, Math.round(otherPixelWidth * factor), Math.round(otherCanvas.getPixelHeight() * factor));
				} else {
					scene.InvalidateCanvas(scene.m_Canvas[1]);
				}
			}
			canvas.m_nExactLOD = canvas.m_nCurrentLOD + Math.log(newTilePixelWidth / tw) * Math.LOG2E;

			// when we run out of the viewport then correct it..................//
			if (newLeft > 0 || newTop > 0 || (newLeft + newWidth < scene.m_nDivWidth) || (newTop + newHeight < scene.m_nDivHeight)) {
				bRequestNewTiles = true;

				nTilesX = -Math.ceil(newLeft / newTilePixelWidth);
				nTilesY = -Math.ceil(newTop / newTilePixelHeight);

				nPosX = newLeft + nTilesX * newTilePixelWidth;
				nPosY = newTop + nTilesY * newTilePixelHeight;
				newLeft = canvas.m_nCurrentX + nTilesX;
				newTop = canvas.m_nCurrentY + nTilesY;

				if (VBI.m_bTrace) {
					VBI.Trace("run out viewport newTop=" + newTop + " nTilesY=" + nTilesY + " nPosY=" + nPosY + " yOffset=" + yOffset + "\n");
				}
			}
		} else { // LOD changes
			bRequestNewTiles = true;

			var nLodDistance = Math.pow(2, canvas.m_nCurrentLOD - nNewLod);
			var nCurrentStretch = oldHeight / scene.m_nHeightCanvas;

			// Viewport Middle is calculated in unstretched pixels now. We "move" from origin to offset point which remains fix
			// then we go back to origin by zoomed offset followed by zoomed (left + div/2) to new middle point
			var newViewportMidX = xOffset / nCurrentStretch + (nLodDistance * (scene.m_nDivWidth / 2 - oldLeft - xOffset));
			var newViewportMidY = yOffset / nCurrentStretch + (nLodDistance * (scene.m_nDivHeight / 2 - oldTop - yOffset));

			if (nNewLod > canvas.m_nCurrentLOD) { // Zoom in
				nTilesX = Math.round(newViewportMidX / nLodDistance / tw - scene.m_nTilesX / 2);
				nTilesY = Math.round(newViewportMidY / nLodDistance / th - scene.m_nTilesY / 2);

				nPosX = Math.ceil(newLeft + nTilesX * newTilePixelWidth * nLodDistance);
				nPosY = Math.ceil(newTop + nTilesY * newTilePixelHeight * nLodDistance);
			} else { // Zoom Out
				var nOddPartOfX = ((canvas.m_nCurrentX % nLodDistance) + nLodDistance) % nLodDistance;
				var nOddPartOfY = ((canvas.m_nCurrentY % nLodDistance) + nLodDistance) % nLodDistance;

				nTilesX = Math.round((newViewportMidX / tw + nOddPartOfX) / nLodDistance - scene.m_nTilesX / 2);
				nTilesY = Math.round((newViewportMidY / th + nOddPartOfY) / nLodDistance - scene.m_nTilesY / 2);

				// calculate the new position and align when necessary..............//
				nPosX = newLeft + newTilePixelWidth * (nTilesX * nLodDistance - nOddPartOfX);
				nPosY = newTop + newTilePixelHeight * (nTilesY * nLodDistance - nOddPartOfY);
			}

			newLeft = Math.floor(canvas.m_nCurrentX / nLodDistance + nTilesX);
			newTop = Math.floor(canvas.m_nCurrentY / nLodDistance + nTilesY);
			newWidth = zoomData.lodFallsOnInteger ? (tw * scene.m_nTilesX) : Math.ceil(newWidth * nLodDistance);
			newHeight = zoomData.lodFallsOnInteger ? (th * scene.m_nTilesY) : Math.ceil(newHeight * nLodDistance);
		}

		var newExactLod = nNewLod + Math.log(newWidth / scene.m_nWidthCanvas) * Math.LOG2E;
		if (bRequestNewTiles) { // if lod changes or we are running out of viewport, new request is done
			otherCanvas.m_nExactLOD = newExactLod;
			scene.MoveCanvas(otherCanvas, nPosX, nPosY, newWidth, newHeight);

			// set properties of new canvas.....................................//
			scene.m_MapManager.RequestTiles(scene.m_Canvas[1], scene.m_MapLayerStack, newLeft, newTop, scene.m_nTilesX, scene.m_nTilesY, 0, 0, 0, 0, nNewLod, true);
			canvas.m_Scene.ToggleCanvas(canvas.m_Scene);
		}
		scene.InternalRenderLayer(scene.m_Canvas[scene.m_nOverlayIndex], false, bRequestNewTiles, bRequestNewTiles, newExactLod);
		// if new tiles are requested we always render, optherwise its up to the engine

		// update the current lod in the navigation control (for mobile devices)
		if (scene.m_bNavControlVisible && scene.m_NavControl) {
			scene.m_NavControl.AdjustScrollPoint(newExactLod);
		}

		scene.InternalOnMoveLayer(canvas, bSuppressEvent);

		// call internal functionto be able to do additional default behavior...//
		scene.InternalOnZoomLayer(scene.m_Canvas[scene.m_nOverlayIndex], bSuppressEvent);
		scene.m_LastDefinedCenterPos = scene.m_LastZoomArea = undefined;
	};

	scene.ZoomOtherCanvas = function(otherCanvas, canvas, factor, xOffset, yOffset) {

		var newLeft = Math.round(otherCanvas.getPixelLeft() - ((factor - 1) * xOffset));
		var newTop = Math.round(otherCanvas.getPixelTop() - ((factor - 1) * yOffset));

		var otherCanvasWidth = Math.round(otherCanvas.getPixelWidth() * factor);
		var otherCanvasHeight = Math.round(otherCanvas.getPixelHeight() * factor);

		scene.MoveObject(otherCanvas, newLeft, newTop, otherCanvasWidth, otherCanvasHeight);
	};

	scene.AnimationStep = function() {
		var currentLod = scene.m_Canvas[0].m_nExactLOD;
		var rc = scene.m_Canvas[0].getBoundingClientRect();
		if (currentLod != scene.AnimZoomTarget) {
			var animPos = Math.min((Date.now() - scene.AnimZoomTimestamp) / scene.AnimZoomDuration, 1);
			var f = Math.min(animPos * (2 - animPos), 1); // easing out animation
			var zoomFactor = Math.pow(2, scene.AnimZoomOrigin + (scene.AnimZoomTarget - scene.AnimZoomOrigin) * f) / Math.pow(2, currentLod);
			scene.ZoomMap(zoomFactor, scene.AnimZoomClientX - rc.left, scene.AnimZoomClientY - rc.top, animPos < 1 ? 0 : 1, true);

			if (animPos < 1) {// request next animation step
				scene.m_AnimZoomRequestID = window.requestAnimationFrame(scene.AnimationStep);
				return;
			}
		}

		// animation has finished.............................

		scene.ZoomMap(1, scene.AnimZoomClientX - rc.left, scene.AnimZoomClientY - rc.top, 1, true);

		scene.InternalOnMoveLayer(scene.m_Canvas[scene.m_nOverlayIndex], scene.AnimZoomClickCoords);
		scene.InternalOnZoomLayer(scene.m_Canvas[scene.m_nOverlayIndex], scene.AnimZoomClickCoords);

		scene.m_AnimZoomRequestID = 0;
		scene.AnimZoomClientX = scene.AnimZoomClientY = scene.AnimZoomClickCoords = undefined;
		scene.AnimZoomTimestamp = scene.AnimZoomDuration = scene.AnimZoomOrigin = scene.AnimZoomTarget = undefined;
	};

	// do an animated zoom to a specific location.............................//
	scene.AnimateZoom = function(zoomIn, clientX, clientY, interval, event) {
		var clickCoords = ((event != undefined && event.clientX != undefined) ? {
			x: event.clientX,
			y: event.clientY
		} : undefined);

		scene.AnimZoomClientX = clientX;
		scene.AnimZoomClientY = clientY;
		scene.AnimZoomClickCoords = clickCoords;
		scene.AnimZoomOrigin = scene.m_Canvas[0].m_nExactLOD;
		scene.AnimZoomTarget = Math.round(scene.AnimZoomTarget ? scene.AnimZoomTarget : scene.AnimZoomOrigin) + (zoomIn ? 1 : -1);
		scene.AnimZoomTimestamp = Date.now();
		scene.AnimZoomDuration = Math.pow(Math.abs(scene.AnimZoomTarget - scene.AnimZoomOrigin), 0.8) * 300;

		if (scene.m_AnimZoomRequestID) {
			window.cancelAnimationFrame(scene.m_AnimZoomRequestID);
		}
		scene.m_AnimZoomRequestID = window.requestAnimationFrame(scene.AnimationStep);
	};

	scene.AnimationToGeoStep = function(correctedInterval, lonlat, nTargetLod, nSourceLod, targetedTicksInALod) {
		if (--scene.m_nAnimOpenTicks) {
			scene.ZoomToZoomlevel(lonlat, nTargetLod - (scene.m_nAnimOpenTicks - 1) * (nTargetLod - nSourceLod) / (scene.m_nAnimTicks - 1), true);
			var temp = Date.now(), corr = correctedInterval;
			if (scene.m_AnimTimestamp) {
				var delta = Math.max(0, temp - scene.m_AnimTimestamp);
				corr = Math.max(10, 2 * correctedInterval - delta);
			}
			scene.m_AnimTimestamp = temp;
			scene.m_AnimZoomTimer = window.setTimeout(function() {
				scene.AnimationToGeoStep(correctedInterval, lonlat, nTargetLod, nSourceLod, targetedTicksInALod);
			}, corr);
			return;
		}

		scene.InternalOnZoomLayer(scene.m_Canvas[scene.m_nOverlayIndex]);

		// clear the animation zoom timer.............................
		if (scene.m_AnimZoomTimer) {
			scene.m_nAnimOpenTicks = scene.m_nAnimationTicks = undefined;
			window.clearTimeout(scene.m_AnimZoomTimer);
			scene.m_AnimZoomTimer = null;
			scene.InternalRenderLayer(scene.m_Canvas[scene.m_nOverlayIndex], false, false, false, scene.m_Canvas[0].m_nExactLOD);
		}
	};

	scene.AnimateZoomToGeo = function(lonlat, GeoZoomToLOD, interval) {
		var nCurrentLOD = scene.m_Canvas[0].m_nExactLOD;
		if (nCurrentLOD == GeoZoomToLOD) {
			return;
		}
		scene.m_bNonIntPosStable = false;
		var targetedTicksInALod = 2 * scene.m_nTicksInALod;

		if (scene.m_AnimZoomTimer) {
			window.clearTimeout(scene.m_AnimZoomTimer);
		}

		scene.m_nAnimTicks = 2 + Math.abs(Math.round((nCurrentLOD - GeoZoomToLOD) * targetedTicksInALod));
		scene.m_nAnimOpenTicks = scene.m_nAnimTicks;
		var nSourceLod = nCurrentLOD;
		var nTargetLod = GeoZoomToLOD;

		var correctedInterval = interval * targetedTicksInALod / scene.m_nAnimTicks;
		scene.m_AnimZoomTimer = window.setTimeout(function() {
			scene.AnimationToGeoStep(correctedInterval, lonlat, nTargetLod, nSourceLod, targetedTicksInALod);
		}, correctedInterval);
	};

	// ........................................................................//
	// multi selection .......................................................//
	// ........................................................................//

	scene.PerFormMultiSelect = function(e, oTrack) {
		if (scene.m_nInputMode != VBI.InputModeLassoSelect && scene.m_nInputMode != VBI.InputModeRectSelect) {
			return;
		}

		var bShift, bCtrl;
		if ((e.type.indexOf("touch") >= 0) || (e.type.indexOf("pointer") >= 0)) {
			bShift = bCtrl = false;
		} else {
			bCtrl = e.ctrlKey;
			bShift = e.shiftKey;
		}

		var lenVOS = scene.m_VOS.length;
		var selectionChanged = false;
		var hitsPerVO = [], orgHits = [];
		var nK, nM, node, ele, ds, vo;
		var bFound = false;
		for (var nJ = 0; nJ < lenVOS; ++nJ) {
			orgHits[nJ] = [];
			hitsPerVO = [];
			if (scene.m_nInputMode == VBI.InputModeLassoSelect && !scene.m_VOS[nJ].LassoSelect) {
				continue;
			}
			if (scene.m_nInputMode == VBI.InputModeLassoSelect) {
				bFound = scene.m_VOS[nJ].LassoSelect(oTrack.m_PosMoves, hitsPerVO, orgHits[nJ]);
			} else {
				bFound = scene.m_VOS[nJ].RectSelect(oTrack.selectionRect, hitsPerVO, orgHits[nJ]);
			}
			if (bFound) {

				vo = scene.m_VOS[nJ];
				if (!(ds = vo.m_DataSource)) {
					continue;
				}
				if (!bShift && !bCtrl && ds) {
					// selection without key modifier
					if ((node = ds.GetCurrentNode(scene.m_Ctx))) {
						for (nM = 0; nM <= 1; nM++) {
							// do this twice to make sure that a selection or deselection that could not be done in the first loop because of
							// cardinality
							// ( 1:N ) can be done in the second loop!!
							for (nK = 0; nK < node.m_dataelements.length; ++nK) {
								ds.Select(nK);
								if ((ele = ds.GetIndexedElement(scene.m_Ctx, nK))) {
									if (vo.IsSelected(scene.m_Ctx)) {
										if (VBI.IndexOf(hitsPerVO, nK) == -1) {
											vo.Select(ele, scene.m_Ctx, false);
											selectionChanged = true;
										}
									} else if (VBI.IndexOf(hitsPerVO, nK) != -1) {
										vo.Select(ele, scene.m_Ctx, true);
										selectionChanged = true;
									}
								}
							}

						}
					}
				} else if (bShift) {
					// add selection
					for (nK = 0; nK < hitsPerVO.length; nK++) {
						ds.Select(hitsPerVO[nK]);
						if ((ele = ds.GetIndexedElement(scene.m_Ctx, hitsPerVO[nK]))) {
							if (!vo.IsSelected(scene.m_Ctx)) {
								vo.Select(ele, scene.m_Ctx, true);
								selectionChanged = true;
							}
						}
					}
				} else if (bCtrl) {
					var select = [];
					for (nK = 0; nK < hitsPerVO.length; nK++) {
						// collect all items that are affected
						ds.Select(hitsPerVO[nK]);
						var sel = {};
						if (vo.IsSelected(scene.m_Ctx)) {
							sel.toSelect = false;
						} else {
							sel.toSelect = true;
						}
						sel.idx = nK;
						select.push(sel);
					}
					for (nM = 0; nM <= 1; nM++) {
						// do this twice to make sure that a selection or deselection that could not be done in the first loop because of cardinality
						// ( 1:N ) can be done in the second loop!!
						for (nK = 0; nK < select.length; nK++) {
							ds.Select(hitsPerVO[select[nK]]);
							if ((ele = vo.m_DataSource.GetIndexedElement(scene.m_Ctx, hitsPerVO[select[nK].idx]))) {
								if (nM == 0 && select[nK].toSelect) {
									vo.Select(ele, scene.m_Ctx, true);
									selectionChanged = true;
								}
								if (nM == 1 && !select[nK].toSelect) {
									vo.Select(ele, scene.m_Ctx, false);
									selectionChanged = true;
								}
							}
						}
					}
				}
			}
		}
		if (scene.m_PreassembledData && orgHits.length) {
			scene.UpdatePreData4SelArray(orgHits);
		}
		// fire selection event when subscribed.............................//
		var actions;
		if (selectionChanged && (actions = scene.m_Ctx.m_Actions)) {
			var action;
			if ((action = actions.findAction("Select", scene, "General"))) {
				// todo: add event parameters
				scene.m_Ctx.FireAction(action, scene, "General", null, null);

			}
		}

	};

	scene.endTrackingMode = function() {
		if (scene.m_nInputMode == VBI.InputModeRectSelect || scene.m_nInputMode == VBI.InputModeLassoSelect || scene.m_nInputMode == VBI.InputModeRectZoom) {
			scene.m_DesignVO.ExitMode();
		}
	};

// ........................................................................//
// helper functions.......................................................//

	scene.GetViewport = function() {
		var zsf = scene.GetStretchFactor4Mode();
		var rc = scene.GetInternalDivClientRect();
		var rcWidth = rc.width / zsf[0];
		var rcHeight = rc.height / zsf[1];
		var PosX = scene.m_Canvas[0].getPixelLeft() / zsf[0];
		var PosY = scene.m_Canvas[0].getPixelTop() / zsf[1];

		return [
			-PosX, -PosY, -PosX + rcWidth, -PosY + rcHeight
		];

	};

	scene.IsTransparent = function(clientX, clientY) {
		// check if the applied coordinate is on a transparent pixel...........//
		// the coordinates are client relative and are transformed here to.....//
		// canvas relative coords..............................................//
		var oCanvas = scene.m_Canvas[scene.m_nOverlayIndex];
		if (!oCanvas) {
			return false;
		}
		var ctx = oCanvas.getContext("2d");
		var rect = oCanvas.getBoundingClientRect();

		var ts = Date.now();
		var pixelImage = ctx.getImageData(Math.round(clientX - rect.left), Math.round(clientY - rect.top), 1, 1);
		if (scene.m_bObjCanvasMode && VBI.m_bIsMyChromeTest && (oCanvas.width != scene.m_nlstWidth || oCanvas.height != scene.m_nlstHeight)) {
			var delta = Date.now() - ts;
			scene.m_nlstWidth = oCanvas.width;
			scene.m_nlstHeight = oCanvas.height;
			if (delta > 40) {
				scene.m_nGetImageDataIncidents++;
				if (scene.m_nGetImageDataIncidents > 2 || delta > 200) {
					scene.m_bSwitch2OldCanvasMode = true;
				}
			}
		}

		var alpha = pixelImage.data[3];
		return alpha ? false : true;
	};

	scene.GetCurrentZoomFactors = function() {
		// for performance reasons we use the pre calculated factors...........//
		return [
			scene.m_StretchFactors[0] * scene.m_ZoomFactors[0], scene.m_StretchFactors[1] * scene.m_ZoomFactors[1]
		];
	};

	scene.GetStretchFactor4Mode = function() {
		return scene.m_StretchFactors;
	};

	scene.GetZoomFactor4Mode = function() {
		return scene.m_ZoomFactors;
	};

	scene.ToggleCanvas = function(scene) {
		// toggle canvas.......................................................//
		var tmp = scene.m_Canvas[0];
		scene.m_Canvas[0] = scene.m_Canvas[1];
		scene.m_Canvas[1] = tmp;

		// new Canvas 0 becomes active (opacity transition 0 -> 1)
		scene.m_Canvas[0].className = "vbi-geoscenecanvas vbi-map-inactive"; // make new foreground canvas transparent
		//switch order in DOM for right z-order (Canvas 1 behind Canvas 0)
		scene.m_MapsLayerDiv.insertBefore(scene.m_Canvas[1], scene.m_Canvas[0]);
		// make a delayed call to ensure styling is applyed to have a real transition
		jQuery.sap.delayedCall(0, this, function(time) {
			// check that the object exists before using it as there is always a chance that it has been destroyed before delayed call runs
			if (scene.m_Canvas[0]) {
				scene.m_Canvas[0].className = "vbi-geoscenecanvas vbi-map-active"; // make foreground canvas opaque using a transition
			}
		});
	};

	VBI.addScenePositioningFunctions(scene);

	scene.getCanvas = function() {
		return scene.m_Canvas[0];
	};

	scene.SetEdgeTransition = function(myArray, edge, corner1, otherEdge, corner2, nextEdge, edge2test) {
		myArray[edge + 9 * otherEdge] = 1; // to the other edge we must cross the div

		myArray[edge + 9 * corner1] = edge2test;
		myArray[edge + 9 * corner2] = edge2test;
		myArray[corner1 + 9 * edge] = edge2test;
		myArray[corner2 + 9 * edge] = edge2test;

		myArray[edge + 9 * nextEdge] = edge2test;
		myArray[nextEdge + 9 * edge] = edge2test;
	};

	scene.SetCornerTransition = function(myArray, source, target, edges2test) {
		myArray[source + 9 * target] = edges2test;
		myArray[target + 9 * source] = edges2test;
	};

	scene.BuildQuarterTransistionTable = function() {

		// Quarters (Please note: 6 is South, 3 is North as Projection is reversed)
		//
		// 7 | 6 | 8
		// --+---+---
		// 1 | 0 | 2
		// --+---+---
		// 4 | 3 | 5
		//
		// index of transition is "source + 9 * target"
		// 0: no point of route is visible; 1: route must cross 0-area (canvas);
		// Bigger returns the possible edges in a bitarray:
		// edges: 2 : left edge, 4 : top edge, 8 : right edge, 16 : bottom edge

		var result = [];
		var i;
		for (i = 0; i < 81; ++i) {
			result.push(0); // 0 means not visible
		}
		for (i = 0; i < 9; ++i) {
			result[i] = 1; // 1 means definitely visible
			result[9 * i] = 1;
		}

		scene.SetEdgeTransition(result, 3, 7, 6, 8, 2, 16); // bottom edge
		scene.SetEdgeTransition(result, 2, 4, 1, 7, 6, 8); // right edge
		scene.SetEdgeTransition(result, 6, 4, 3, 5, 1, 4); // top edge
		scene.SetEdgeTransition(result, 1, 5, 2, 8, 3, 2); // left edge

		scene.SetCornerTransition(result, 4, 8, 18); // left-bottom <-> right-top, we test bottom & left edge
		scene.SetCornerTransition(result, 5, 7, 24); // right-bottom <> left-top, we test bottom & right edge

		return result;

		// all other connections can not cross the canvas
	};

// .......................................................................//
// the following does the killing and genesis of the scene................//

	scene.clearTimers = function() {
		// clear the animation timer if active.................................//
		if (scene.m_AnimZoomTimer) {
			window.clearTimeout(scene.m_AnimZoomTimer);
			scene.m_AnimZoomTimer = null;
		}
	};

	scene.clearCanvas = function(nJ) {
		scene.m_Canvas[nJ].m_Scene = null;
		scene.m_Canvas[nJ] = null;
	};

	scene.clearCanvases = function() {
		// clear the canvas-scene references...................................//
		for (var nJ = 0, nLen = scene.m_Canvas.length; nJ < nLen; ++nJ) {
			scene.clearCanvas(nJ);
		}
		scene.m_Canvas = [];
	};

	scene.Remove = function() {
		// remove the dom elements.............................................//
		if (scene.m_Div) {
			// remove potential event listeners from document...................//
			scene.SetInputMode(VBI.InputModeDefault);

			// remove all childs of out div.....................................//
			while (scene.m_Div.firstChild) {
				scene.m_Div.removeChild(scene.m_Div.firstChild);
			}

			// reset div reference..............................................//
			if (scene.m_Div.parentElement) {
				scene.m_Div.parentElement.removeChild(scene.m_Div);
			}
			scene.m_Div = null;

			// clear any timers.................................................//
			scene.clearTimers();
			scene.clearCanvases();
		}

		if (scene.m_Target) {
			while (scene.m_Target.firstChild) {
				scene.m_Target.removeChild(scene.m_Target.firstChild);
			}

			scene.m_Target = null;
		}
	};

	scene.AddCopyright = function() {
		// return immediately when the maplayerstack is empty..................//
		if (!scene.m_MapLayerStack) {
			return;
		}

		if (!scene.m_DivCopyright) {
			var CopyrightElement = VBI.Utilities.CreateGeoSceneDivCSS(scene.m_Target.id + "-copyright", "vbi-copyright");
			CopyrightElement.setAttribute("role", sap.ui.core.AccessibleRole.ContentInfo);
			CopyrightElement.m_VBIType = "C";
			scene.m_MapDecoDiv.appendChild(CopyrightElement);
			scene.m_DivCopyright = CopyrightElement;
		}
		var sCopyright = scene.m_MapLayerStack.GetCopyright();
		if (sCopyright) {
			scene.m_DivCopyright.innerHTML = sCopyright;
		} else {
			scene.m_DivCopyright.style.paddingRight = 0;
			scene.m_DivCopyright.style.paddingLeft = 0;
		}
	};

	scene.ReAwake = function() {
		scene.m_MapLayerStack = scene.m_RefMapLayerStack;
		scene.AddCopyright();
		scene.resizeCanvas(0, true);
	};

	scene.Awake = function(target, mapmanager, maplayerstack) {
		scene.m_Target = VBI.Utilities.GetDOMElement(target);
		if (!scene.m_Target) {
			scene.m_Target = VBI.Utilities.CreateDOMElement(target, "1px", "1px");
		}

		// reuse scene parts...................................................//
		if (scene.m_Div) {

			//IE corner case, DOM elements which were removed from DOM tree lost their relative hierarchy
			//so everything in this case have to be recreated!
			if (!scene.m_Div.children || !scene.m_Div.children.length) {
				scene.m_awakeFrame = {
					pos: scene.GetCenterPos(),
					lod: scene.GetCurrentZoomlevel()};
			} else {
				// when the scenes div's parent is still the place holder, then.....//
				// everything is still fine and we can return.......................//
				if (scene.m_Div.parentNode == scene.m_Target) {
					return;
				}
				// the scenes div is already but the parent is no longer the........//
				// placeholder. In this case we add again the div as a child element//
				scene.m_Target.appendChild(scene.m_Div);

				if (scene.m_bNavControlVisible && scene.m_NavControl) {
					// scene.m_NavControl.Awake( scene, target );
					scene.m_NavControl.AttachEvents();
				}
				return;
			}
		}
		// assign scene information............................................//
		scene.m_TargetName = target;

		scene.m_MapManager = typeof mapmanager !== 'undefined' ? mapmanager : VBI.MapManager;
		scene.m_MapLayerStack = typeof maplayerstack !== 'undefined' ? maplayerstack : scene.m_RefMapLayerStack;

		// create the viewport.................................................//
		scene.m_Div = VBI.Utilities.CreateGeoSceneDivCSS(target + "-geoscene-viewport", "vbi-viewport");
		scene.m_Div.setAttribute("role", sap.ui.core.AccessibleRole.Presentation);
		// set the viewport div as a child of the target................................//
		scene.m_Target.appendChild(scene.m_Div);

		// add a moveable layer to the viewport
		scene.m_MoveableLayer = VBI.Utilities.CreateGeoSceneDivCSS(target + "-geoscene-moveable-layer", "vbi-moveable-layer");
		scene.m_MoveableLayer.setAttribute("role", sap.ui.core.AccessibleRole.Group);
		scene.m_MoveableLayer.setAttribute("tabindex", "0");
		scene.m_Div.appendChild(scene.m_MoveableLayer);

		// Populate the moveable layer with the content which should move with it
		// add a layer div for all map elements (maps + VOs)
		scene.m_MapsLayerDiv = VBI.Utilities.CreateGeoSceneDivCSS(target + "-geoscene-mapslayer", "vbi-map-layer");
		scene.m_MapsLayerDiv.setAttribute("role", sap.ui.core.AccessibleRole.Presentation);
		scene.m_MoveableLayer.appendChild(scene.m_MapsLayerDiv);

		// Add viewport content which is either fixed or moves relative to it
		// add a layer div for map deco like scale and copyright
		scene.m_MapDecoDiv = VBI.Utilities.CreateGeoSceneDivCSS(target + "-geoscene-decolayer", "vbi-structure-layer");
		scene.m_MapDecoDiv.setAttribute("role", sap.ui.core.AccessibleRole.Presentation);
		scene.m_Div.appendChild(scene.m_MapDecoDiv);

		// add a layer div for legend windows
		scene.m_LegendLayerDiv = VBI.Utilities.CreateGeoSceneDivCSS(target + "-geoscene-legendlayer", "vbi-structure-layer");
		scene.m_LegendLayerDiv.setAttribute("role", sap.ui.core.AccessibleRole.Group);
		scene.m_LegendLayerDiv.setAttribute("tabindex", "0");
		scene.m_Div.appendChild(scene.m_LegendLayerDiv);

		// add a layer div for VBI detail window elements
		scene.m_WindowLayerDiv = VBI.Utilities.CreateGeoSceneDivCSS(target + "-geoscene-winlayer", "vbi-structure-layer");
		scene.m_WindowLayerDiv.setAttribute("role", sap.ui.core.AccessibleRole.Presentation);

		if (VBI.m_bIsPhone) {
			// on phones the detail window sits statically on the bottom of the screen
			scene.m_Div.appendChild(scene.m_WindowLayerDiv);
		} else {
			// on normal devices detail windows belong to the moveable layer and move with the map
			scene.m_MoveableLayer.appendChild(scene.m_WindowLayerDiv);
		}
		// activate
		// the awakening of the canvases requires the div sizes, if they are not provided
		// behvaiour might be strange. To support a future implementation of a lazy awakening
		// when the div sizes come late this part is put into an own function which may be called
		// from resize also.
		scene.DoAwake(target);
	};

	scene.setProjection = function() {
		if (!scene.m_RefMapLayerStack || !scene.m_RefMapLayerStack.m_MapLayerArray || !scene.m_RefMapLayerStack.m_MapLayerArray.length) {
			return new VBI.MercatorProjection();
		}

		var layerArray = scene.m_RefMapLayerStack.m_MapLayerArray;
		var nProj = layerArray[0].GetMapProvider().m_nProjection;
		for (var i = 2; i < layerArray.length; ++i) {
			if (layerArray[i].GetMapProvider().m_nProjection != nProj) {
				if (VBI.m_bTrace) {
					VBI.Trace("projection of layer " + i + " is inconsistent to base layer. Choosing projection of base layer");
				}
			}
		}

		switch (nProj) {
			case 1:
				return new VBI.MercatorProjection();
			case 2:
				return new VBI.LinearProjection();
			case 3:
				return new VBI.ElliMercatorProjection();
			default:
				return new VBI.MercatorProjection();
		}
	};

	scene.DoAwake = function(target) {
		// create the viewport.................................................//
		scene.CalculateCanvasDimensions();
		scene.CreateCanvases();
		// append copyright
		if (!scene.m_Ctx.moThumbnail) {
			scene.AddCopyright();
		}
		// attach overlay canvas to scene handled events.......................//
		var oCanvas = scene.m_Canvas[scene.m_nLabelIndex];
		// do event subscriptions..............................................//
		if (scene.m_Events) {
			scene.m_Events.clear();
		}

		scene.m_Events = new VBI.SceneEvent(this, oCanvas.parentElement);

		// awake Navigation Control
		if (scene.m_bNavControlVisible && scene.m_NavControl) {
			scene.m_NavControl.Awake(scene, target);
		}

		// awake Scale Control
		if (scene.m_bScaleVisible && scene.m_Scale) {
			scene.m_Scale.Awake(scene, target);
		}

		// now go to StartPosition
		var exactMinLod = scene.GetMinLOD();
		if (scene.m_startLOD < exactMinLod) {
			var firstIntLOD = Math.ceil(exactMinLod);
			scene.m_startLOD = (firstIntLOD - exactMinLod) < 0.6 ? firstIntLOD : exactMinLod;
		}

		if (scene.m_bObjCanvasMode && VBI.m_bIsMyChromeTest && !scene.m_bObjCanvasModeChecked) {
			scene.ChromePerformanceCheck(oCanvas);
		}

		if (scene.m_awakeFrame) {
			scene.ZoomToGeoPosition(scene.m_awakeFrame.pos, scene.m_awakeFrame.lod, true, false, true);
			scene.RenderAsync(true);
			scene.m_awakeFrame = null;
		} else {
			scene.GoToInitialStart();
		}

		if (scene.m_nInitialTrackingMode == VBI.InputModeRectSelect) {
			new scene.RectSelection();
		} else if (scene.m_nInitialTrackingMode == VBI.InputModeLassoSelect) {
			new scene.LassoSelection();
		} else if (scene.m_nInitialTrackingMode == VBI.InputModeRectZoom) {
			new scene.RectangularZoom();
		}
		scene.m_nInitialTrackingMode = VBI.InputModeDefault;
	};

	scene.ChromePerformanceCheck = function(oCanvas) {
		var bTestFailed = false;
		var d = [
			855, 672, 1512, 240, 801, 901, 1222, 1392, 1023, 1024
		]; // just any number
		var oldW = oCanvas.width, oldH = oCanvas.height;
		var somePixel;
		var ctx = oCanvas.getContext("2d");
		oCanvas.width = oCanvas.height = 1024;
		somePixel = ctx.getImageData(500, 500, 1, 1); // exclude first getImage
		var ts1, ts0 = Date.now();
		for (var i = 0; i < 10; ++i) {
			ts1 = Date.now();
			oCanvas.width = oCanvas.height = d[i];
			somePixel = ctx.getImageData(500, 500, 1, 1);
			if (Date.now() - ts1 > 60) {
				bTestFailed = true;
				break;
			}
		}
		oCanvas.width = oldW;
		oCanvas.height = oldH;
		if (bTestFailed || (Date.now() - ts0 > 80)) {
			scene.m_bObjCanvasMode = 0;
			var resStr = bTestFailed ? "(" + (Date.now() - ts1) + " ms peak)" : "(" + ((Date.now() - ts0) / 10) + " ms average)";
			VBI.Trace("Setting Object Canvas Mode to Old Style due to Performance issues " + resStr);
			if (VBI.m_bTrace) {
				VBI.Trace("Some Pixel was " + somePixel);
			}
		} else {
			VBI.Trace("Chrome Performance Test passed with " + ((Date.now() - ts0) / 10) + " ms average time.");
		}
		scene.m_bObjCanvasModeChecked = true;
	};

// canvas dimensions...................................................//
	scene.CalcCanvasWidth = function(width, tileWidth) {
		return (Math.floor(width / tileWidth + scene.m_nCanvasXOversize)) * tileWidth;
	};
	scene.CalcCanvasHeight = function(height, tileHeight) {
		return (Math.floor(height / tileHeight + scene.m_nCanvasYOversize)) * tileHeight;
	};

	scene.GetInternalDivWidth = function() {
		if (this.m_Ctx.moThumbnail && this.m_Ctx.moThumbnail.nOrgWidth) {
			return this.m_Ctx.moThumbnail.nOrgWidth;
		}
		var rect = scene.m_Div.parentNode.getBoundingClientRect();
		return rect.width ? rect.width : scene.m_Div.clientWidth;
	};

	scene.GetInternalDivHeight = function() {
		if (this.m_Ctx.moThumbnail && this.m_Ctx.moThumbnail.nOrgHeight) {
			return this.m_Ctx.moThumbnail.nOrgHeight;
		}
		var rect = scene.m_Div.parentNode.getBoundingClientRect();
		return rect.height ? rect.height : scene.m_Div.clientHeight;
	};

	scene.GetPreviewImage = function(mapLayerStack, callback) {
		var layerStack = mapLayerStack;
		//If the map config consists of preview position then use it's values
		if (layerStack.m_PreviewPosition) {
			scene.m_MapManager.GetPreviewImage(layerStack.m_PreviewPosition.longitude,layerStack.m_PreviewPosition.latitude,layerStack.m_PreviewPosition.lod,layerStack,scene, callback);
		} else {
			//If map config doesn't consist of preview position use initial zoom and initial position.
			var pos = scene.m_Ctx.m_Control.getInitialPosition(); //format 0,0,0:x,y,z. z always = 0.
			var lod = scene.m_Ctx.m_Control.getInitialZoom(); //lod value
			var position = pos.split(";");
			scene.m_MapManager.GetPreviewImage(position[0],position[1],lod,layerStack,scene,callback);
		}
	};

	scene.CalculateCanvasDimensions = function() {
		var nDummy = scene.m_Target.offsetWidth; // to force browser to have consistent state

		var mapMan = scene.m_MapManager;

		var divWidth = scene.GetInternalDivWidth();
		var divHeight = scene.GetInternalDivHeight();
		if ((divWidth == scene.m_nDivWidth) && (divHeight == scene.m_nDivHeight)) {
			return; // nothing changed
		}

		scene.m_nDivWidth = divWidth;
		scene.m_nDivHeight = divHeight;
		scene.m_nWidthCanvas = scene.CalcCanvasWidth(divWidth, mapMan.m_tileWidth);
		scene.m_nHeightCanvas = scene.CalcCanvasHeight(divHeight, mapMan.m_tileHeight);
		scene.m_nTilesX = scene.m_nWidthCanvas / mapMan.m_tileWidth;
		scene.m_nTilesY = scene.m_nHeightCanvas / mapMan.m_tileHeight;

		mapMan.m_requestTileWidth = mapMan.m_tileWidth;
		mapMan.m_requestTileHeight = mapMan.m_tileHeight;

		var layerStack = scene.m_MapLayerStack;
		if (layerStack.m_nMaxSquare && layerStack.m_MapLayerArray.length) {
			var nLowestResolution = 0;
			for (var i = 0; i < layerStack.m_MapLayerArray.length; ++i) {
				if (!i || (layerStack.m_MapLayerArray[i].m_refMapProvider.m_nResolution < nLowestResolution)) {
					nLowestResolution = parseInt(layerStack.m_MapLayerArray[i].m_refMapProvider.m_nResolution, 10);
				}
			}
			var nMaxPixels = layerStack.m_nMaxSquare * nLowestResolution;
			if ((scene.m_nTilesX * mapMan.m_tileWidth > nMaxPixels) || (scene.m_nTilesY * mapMan.m_tileHeight > nMaxPixels)) {
				var newSize = Math.floor(nMaxPixels / Math.max(scene.m_nTilesX, scene.m_nTilesY));
				mapMan.m_requestTileWidth = newSize;
				mapMan.m_requestTileHeight = newSize;
			}
		}

		if (VBI.m_bTrace) {
			VBI.Trace("Setting Canvas Size to (" + scene.m_nWidthCanvas + "," + scene.m_nHeightCanvas + ") on div with size (" + divWidth + "," + divHeight + "). Dummy is " + nDummy);
		}

		// Preload is the number of pixel from the absolute border which triggers a col or row shift in a move
		scene.m_nMapMoveXPreLoad = Math.min(120, mapMan.m_tileWidth * (scene.m_nTilesX - 1) - divWidth);
		scene.m_nMapMoveYPreLoad = Math.min(120, mapMan.m_tileHeight * (scene.m_nTilesY - 1) - divHeight);

		scene.m_nCanvasStdXPos = (scene.m_nWidthCanvas - scene.m_nDivWidth) / mapMan.m_tileWidth / 2;
		scene.m_nCanvasStdYPos = (scene.m_nHeightCanvas - scene.m_nDivHeight) / mapMan.m_tileHeight / 2;

		scene.m_nMaxPixelBeyondPoles = 0;
	};

	scene.SwitchTmpCanvasToActive = function() {
		var dest = scene.m_Canvas[0], source = scene.m_Canvas[scene.m_nNonDomIndex];

		var destCtx = dest.getContext('2d');
		destCtx.clearRect(0, 0, dest.getPixelWidth(), dest.getPixelHeight());
		destCtx.drawImage(scene.m_Canvas[scene.m_nNonDomIndex], 0, 0);
		scene.MoveCanvas(dest, dest.getPixelLeft() - source.m_nOffsetX * dest.getPixelWidth() / scene.m_nTilesX, dest.getPixelTop() - source.m_nOffsetY * dest.getPixelHeight() / scene.m_nTilesY);

		dest.m_nCurrentX = source.m_nCurrentX;
		dest.m_nCurrentY = source.m_nCurrentY;

		source.m_bCanvasValid = false;
		source.m_CanvasRedirect = dest;
		source.m_CanvasRedirRequest = source.m_nRequest;
		source.m_nOffsetX = source.m_nOffsetY = 0;
		source.m_nTilesBefSwitch = undefined;

		scene.InternalRenderLayer(scene.m_Canvas[scene.m_nOverlayIndex], false, true, true, dest.m_nExactLOD);
	};

	scene.InitializeCanvas = function(canvas, nextSibling) {
		// set the scene reference..........................................//
		canvas.m_Scene = scene;

		// set current lod..................................................//
		canvas.m_nCurrentLOD = 2;
		canvas.m_nExactLOD = 2;
		canvas.m_nCurrentX = undefined;
		canvas.m_nCurrentY = undefined;
		canvas.m_nAppliedRequest = 0;

		canvas.m_bInvalid = false;

		// set the canvas as a child of the div.............................//
		if (canvas.m_bNotInDOM != 2) {
			if (!nextSibling) {
				scene.m_MapsLayerDiv.appendChild(canvas);
			} else {
				scene.m_MapsLayerDiv.insertBefore(canvas, nextSibling);
			}
		}
	};

	scene.AttachCanvasesToDOM = function() {
		var thisChild = scene.m_Div.firstChild, nextChild;
		while (thisChild) {
			var childType = thisChild.m_VBIType;
			nextChild = thisChild.nextSibling;
			if (childType == "L" || childType == "N" || childType == "S" || childType == "C") {
				scene.m_Div.removeChild(thisChild);
			} else if (thisChild.m_VBIHidden) {
				thisChild.m_VBIHidden = false;
				thisChild.style.display = thisChild.m_VBIOrgDiplay;
			}
			thisChild = nextChild;
		}
		for (var i = 0; i < scene.m_Canvas.length; ++i) {
			if (scene.m_Canvas[i].m_bNotInDOM != 2) {
				scene.m_Canvas[i].m_bNotInDOM = !scene.m_Canvas[i].m_bNotInDOM;
			}
		}
		scene.m_bThumbnailedCanvases = false;

		if (scene.m_bNavControlVisible) {
			scene.m_NavControl = new VBI.NavigationControl(scene.m_SuppressedNavControlVisibility);
			scene.m_NavControl.AttachEvents();
			scene.m_NavControl.Awake(scene, scene.m_TargetName);
		}

		if (scene.m_bScaleVisible) {
			scene.m_Scale = new VBI.Scale(scene);
			scene.m_Scale.Awake(scene, scene.m_TargetName);
		}
		scene.AddCopyright();

	};

	scene.DetachCanvasesFromDOM = function() {
		for (var i = 0; i < scene.m_Canvas.length; ++i) {
			if (scene.m_Canvas[i].m_bNotInDOM != 2) {
				scene.m_Canvas[i].m_bNotInDOM = !scene.m_Canvas[i].m_bNotInDOM;
			}
		}
		var idPrefix = scene.m_TargetName + "-" + scene.m_ID + "-";

		var thisChild = scene.m_Div.firstChild, nextChild;
		while (thisChild) {
			var childType = thisChild.m_VBIType;
			nextChild = thisChild.nextSibling;
			if (childType == "L" || childType == "N" || childType == "S" || childType == "C") {
				scene.m_Div.removeChild(thisChild);
			} else {
				thisChild.m_VBIHidden = true;
				thisChild.m_VBIOrgDiplay = thisChild.style.display;
				thisChild.style.display = 'none';
			}
			thisChild = nextChild;
		}

		var thumbnailCanvas;
		if (scene.m_nThumbnailIndex) {
			thumbnailCanvas = scene.m_Canvas[scene.m_nThumbnailIndex];
			thumbnailCanvas.width = scene.m_Div.clientWidth;
			thumbnailCanvas.setPixelWidth(thumbnailCanvas.width);
			thumbnailCanvas.height = scene.m_Div.clientHeight;
			thumbnailCanvas.setPixelHeight(thumbnailCanvas.height);

		} else {
			thumbnailCanvas = VBI.Utilities.CreateGeoSceneCanvas(idPrefix + "thumbnail", scene.m_Div.clientWidth, scene.m_Div.clientHeight, 0, false);
			scene.m_ThumbnaiEvents = new VBI.ThumbnailEvent(this, thumbnailCanvas);
			scene.m_Canvas.push(thumbnailCanvas);
			scene.m_nThumbnailIndex = scene.m_Canvas.length - 1;
		}
		scene.m_Div.appendChild(thumbnailCanvas);
		scene.m_bThumbnailedCanvases = true;

		if (scene.m_NavControl) {
			scene.m_SuppressedNavControlVisibility = scene.m_NavControl.suppressedVisibility;
			scene.m_NavControl.clear();
			scene.m_NavControl = null;
		}

		if (scene.m_Scale) {
			scene.m_Scale.clear();
			scene.m_Scale = null;
		}
		scene.m_DivCopyright = null;
	};

	scene.CreateCanvases = function() {
		// create the switchable......................................//
		var idPrefix = scene.m_TargetName + "-" + scene.m_ID + "-";
		var bThumbnailMode = false;

		if (scene.m_Ctx.moThumbnail) {
			bThumbnailMode = true;
			if (!scene.m_Ctx.moThumbnail.bThumbnailed) {
				scene.m_Ctx.DoMinimize(scene);
			}
		}
		scene.clearCanvases(); //remove old canvases first

		// Note: A tabindex of -1 prevents the element from getting the focus
		scene.m_Canvas.push(VBI.Utilities.CreateGeoSceneCanvas(idPrefix + "layer1", scene.m_nWidthCanvas, scene.m_nHeightCanvas, /* tabindex= */-1, bThumbnailMode, "vbi-map-active"));
		// map toggle layer
		scene.m_Canvas.push(VBI.Utilities.CreateGeoSceneCanvas(idPrefix + "layer2", scene.m_nWidthCanvas, scene.m_nHeightCanvas, /* tabindex= */-1, bThumbnailMode, "vbi-map-inactive"));
		// map toggle layer
		// shadow layer is created on demand and inserted before object layer
		scene.m_Canvas.push(VBI.Utilities.CreateGeoSceneCanvas(idPrefix + "objectlayer", scene.m_nWidthCanvas, scene.m_nHeightCanvas, /* tabindex= */-1, bThumbnailMode));
		// object layer
		scene.m_Canvas.push(VBI.Utilities.CreateGeoSceneCanvas(idPrefix + "labellayer", scene.m_nWidthCanvas, scene.m_nHeightCanvas, /* tabindex= */0, bThumbnailMode, undefined ,scene.ariaLabel));
		// label layer
		scene.m_Canvas.push(VBI.Utilities.CreateGeoSceneCanvas(idPrefix + "nondomlayer", scene.m_nWidthCanvas, scene.m_nHeightCanvas, /* tabindex= */-1, 2));
		// nondom layer
		if (bThumbnailMode) {
			scene.m_Canvas.push(VBI.Utilities.CreateGeoSceneCanvas(idPrefix + "thumbnail", scene.m_Div.clientWidth, scene.m_Div.clientHeight, 0, false));
			// map toggle layer
			scene.m_nThumbnailIndex = scene.m_Canvas.length - 1;
			scene.m_ThumbnaiEvents = new VBI.ThumbnailEvent(this, scene.m_Canvas[scene.m_nThumbnailIndex]);
			scene.m_bThumbnailedCanvases = true;
		}
		scene.m_nShadowIndex = undefined;

		for (var nJ = 0; nJ < scene.m_Canvas.length; ++nJ) {
			scene.InitializeCanvas(scene.m_Canvas[nJ]);
		}
		scene.ToggleCanvas(scene);
		if (scene.m_Ctx.moThumbnail) {
			scene.DetachCanvasesFromDOM();
		}
		if (scene.m_nCanvasMaxPixel == undefined) {
			var estimate = 8192; // IE
			if (VBI.m_bIsMyChromeTest) {
				estimate = 32767; // Chrome supports more
			}
			if (VBI.m_bIsIDevice) {
				estimate = 5120;
			}
			if (VBI.m_bIsAndroid) {
				estimate = 16384;
			}
			scene.m_nCanvasMaxPixel = scene.CalculateCanvasMaxPixel(scene.m_Canvas[2], estimate, 16384);
		}
	};

	scene.CalculateCanvasMaxPixel = function(canvas, minVal, maxVal) {
		var oldWidth = canvas.width;
		var oldHeight = canvas.height;
		if (minVal > maxVal - 100) {
			return minVal;
		}
		var ctx = canvas.getContext("2d");
		if (scene.CanvasSizeTest(canvas, ctx, Math.floor(minVal * 1.05))) {
			while (maxVal - minVal > 50) {
				var middleVal = Math.floor((minVal + maxVal) / 2);
				if (scene.CanvasSizeTest(canvas, ctx, middleVal)) {
					minVal = middleVal;
				} else {
					maxVal = middleVal;
				}
			}
		}
		canvas.width = oldWidth;
		canvas.height = oldHeight;

		return minVal;
	};

	scene.CanvasSizeTest = function(canvas, ctx, val) {
		canvas.height = 1024;
		canvas.width = val;
		ctx.fillStyle = "#050000";
		ctx.fillRect(val - 1, 1023, 1, 1);
		var p = ctx.getImageData(val - 1, 1023, 1, 1).data;

		return (p[0] + 256 * (p[1] + 256 * p[2]) == 5);
	};

	scene.DivIsAlive = function() {
		var rect = scene.m_Div.getBoundingClientRect();
		return (rect.width != 0 || rect.height != 0);
	};

	scene.resizeCanvas = function(event, bForce, bSuppressLodAjust) {

		if (!scene.DivIsAlive()) { // suppress resizing when div dimension is 0x0
			return;
		}

		if (!scene.m_Canvas.length) { // no wake done yet, do it now
			scene.DoAwake();
			return;
		}

		if (scene.m_Canvas[scene.m_nNonDomIndex].m_bCanvasValid) {
			scene.SwitchTmpCanvasToActive();
		}

		var mapMan = scene.m_MapManager;
		var canvas = scene.m_Canvas[0];
		var oldWidth = scene.m_nDivWidth;
		var oldHeight = scene.m_nDivHeight;
		var oldMinLod = scene.GetMinLODForWidth(oldWidth);
		var stretchFactor = canvas.getPixelWidth() / scene.m_nWidthCanvas;

		scene.m_nLastRenderLOD = -1; // to force Re-Rendering

		scene.CalculateCanvasDimensions();

		if (scene.m_Ctx.moThumbnail) {
			if (!scene.m_bThumbnailedCanvases) {
				scene.DetachCanvasesFromDOM();
			} else {
				var thumbnailCanvas = scene.m_Canvas[scene.m_nThumbnailIndex];
				thumbnailCanvas.width = scene.m_Div.clientWidth;
				thumbnailCanvas.height = scene.m_Div.clientHeight;
				thumbnailCanvas.setPixelWidth(scene.m_Div.clientWidth);
				thumbnailCanvas.setPixelHeight(scene.m_Div.clientHeight);
			}
		} else if (scene.m_bThumbnailedCanvases) {
			scene.AttachCanvasesToDOM();
		} else if ((!bForce) && (scene.m_nDivWidth == oldWidth) && (scene.m_nDivHeight == oldHeight)) {
			return;
		}

		if (VBI.m_bTrace) {
			VBI.Trace("Resizing (" + (oldWidth) + "," + (oldHeight) + ") to (" + (scene.m_nDivWidth) + "," + (scene.m_nDivHeight) + ")");
		}

		var oldCurrentX = canvas.m_nCurrentX;
		var oldCurrentY = canvas.m_nCurrentY;
		var lod = canvas.m_nCurrentLOD;

		// new dimensions for canvas 0
		var newPixelLeft = canvas.getPixelLeft() + (scene.m_nDivWidth - oldWidth) / 2;
		var xDistToMean = Math.round((-newPixelLeft / mapMan.m_tileWidth - scene.m_nCanvasStdXPos) / stretchFactor);
		newPixelLeft += stretchFactor * xDistToMean * mapMan.m_tileWidth;

		var newPixelTop = canvas.getPixelTop() + (scene.m_nDivHeight - oldHeight) / 2;
		var yDistToMean = Math.round((-newPixelTop / mapMan.m_tileHeight - scene.m_nCanvasStdYPos) / stretchFactor);
		newPixelTop += stretchFactor * yDistToMean * mapMan.m_tileHeight;

		for (var i = 0; i < scene.m_Canvas.length; ++i) {
			if (i != scene.m_nThumbnailIndex) {
				if (scene.m_Canvas[i].width != scene.m_nWidthCanvas) {
					scene.m_Canvas[i].width = scene.m_nWidthCanvas;
				}
				if (scene.m_Canvas[i].height != scene.m_nHeightCanvas) {
					scene.m_Canvas[i].height = scene.m_nHeightCanvas;
				}
			}
		}

		scene.InvalidateCanvas(scene.m_Canvas[1]);
		scene.MoveCanvas(canvas, newPixelLeft, newPixelTop, stretchFactor * scene.m_nWidthCanvas, stretchFactor * scene.m_nHeightCanvas);
		scene.m_MapManager.RequestTiles(canvas, scene.m_MapLayerStack, oldCurrentX + xDistToMean, oldCurrentY + yDistToMean, scene.m_nTilesX, scene.m_nTilesY, 0, 0, 0, 0, lod, true);
		var lza = scene.m_LastZoomArea; // must be stored before ZoomMap may be able to destroy it
		var bAreaZoomExecuted = false;
		if (lza != undefined) {
			var timeNow = new Date().getTime();
			if ((timeNow - lza[0]) < 3000) {
				switch (lza[1]) {
					case "Area":
						scene.ZoomToArea(lza[2], lza[3], lza[4], lza[5], lza[6]);
						bAreaZoomExecuted = true;
						break;
					case "Areas":
						scene.ZoomToAreas(lza[2], lza[3]);
						bAreaZoomExecuted = true;
						break;
					default:
						break;
				}
			}
		}
		if (!bAreaZoomExecuted) {
			var newMinLod = scene.GetMinLOD();
			if (canvas.m_nExactLOD < newMinLod) {
				scene.ZoomMap(Math.pow(2, newMinLod - canvas.m_nExactLOD) * 1.000001, scene.m_nDivWidth / 2 - newPixelLeft, scene.m_nDivHeight / 2 - newPixelTop);
			} else if (!bSuppressLodAjust && canvas.m_nExactLOD != Math.floor(canvas.m_nExactLOD)) {
				scene.AnimateZoomToGeo(scene.GetCenterPos(), Math.floor(canvas.m_nExactLOD), 5);
			} else {
				scene.InternalRenderLayer(scene.m_Canvas[scene.m_nOverlayIndex], false, true, true, canvas.m_nExactLOD);
				scene.InternalOnMoveLayer(scene.m_Canvas[scene.m_nOverlayIndex]);
			}
			var newMaxLod = scene.GetMaxLOD();
			if (canvas.m_nExactLOD > newMaxLod) {
				scene.ZoomMap(Math.pow(2, newMaxLod - canvas.m_nExactLOD), scene.m_nDivWidth / 2 - newPixelLeft, scene.m_nDivHeight / 2 - newPixelTop);
			}
		}

		if ((bForce || (scene.GetMinLOD() != oldMinLod)) && scene.m_NavControl) { // if width has changed and minLOD is not set directly it will
			// change
			scene.m_NavControl.AdaptMinMaxLOD(scene);
		}

		if (scene.m_bNavControlVisible && scene.m_NavControl) {
			scene.m_NavControl.AdjustScrollPoint(scene.m_Canvas[0].m_nExactLOD); // "canvas" might be [1], now so we use scene.m_Canvas[0]
		}

		scene.InternalRenderLayer(scene.m_Canvas[scene.m_nOverlayIndex], false, false, true, scene.m_Canvas[0].m_nExactLOD); // will re-render if
		// none of the above
		// triggered a render
	};

	// show selection narrowing menu when hitting overlapping VOs
	scene.showHitMenu = function(event, hitTests) {
		sap.ui.require(["sap/ui/unified/Menu", "sap/ui/unified/MenuItem"], function(Menu, MenuItem) {
			var ctx = scene.m_Ctx;

			if (ctx.m_strOpenMenu) {
				ctx.m_Menus.findMenuByID(ctx.m_strOpenMenu).close();
				ctx.m_strOpenMenu = undefined;
			}
			if (ctx.m_HitMenu) {
				ctx.m_HitMenu.close();
				ctx.m_HitMenu.destroy();
			}
			var menu = new Menu({maxVisibleItems:5});
			var pos = scene.GetEventVPCoordsObj(event);
			var language = sap.ui.getCore().getConfiguration().getLanguageTag();

			var buildText = function(hit) { // for menu text use following fallbacks: Label -> Tooltip -> data-path.key
				var vo = hit.m_Vo;
				var txt = vo.getLabelText(ctx, hit);

				if (!txt || txt == "") {
					txt = vo.getTooltip(ctx, hit);

					if (!txt || txt == "") {
						txt = vo.m_DataSource.m_Path + "." + vo.m_DataSource.GetCurrentElement(ctx).GetKeyValue();
					}
				}
				return txt;
			};

			hitTests.sort(function(a,b) {
				if (!a.txt) {
					a.txt = buildText(a);
				}
				if (!b.txt) {
					b.txt = buildText(b);
				}
				return a.txt.localeCompare(b.txt, language);
			});

			hitTests.forEach(function(hit) {
				menu.addItem(new MenuItem({
					text: hit.txt,
					select: function() {
						event.hitCached = hit;
						hit.m_Vo["on" + event.m_evName](event);
					}
				}));
			});
			ctx.m_HitMenu = menu;
			menu.open(true, 0, "begin top", "begin top", scene.m_Div, (parseInt(pos.x, 10) + 5) +" " + (parseInt(pos.y, 10) + 5), "fit");
		});
	};

	VBI.addSceneLassoTrackingFunctions(scene);
	VBI.addSceneRectangularTrackingFunctions(scene);
	scene.m_TransitionTable = scene.BuildQuarterTransistionTable();

	// when a target is already specified, awake the scene to be alive........//
	if (target) {
		scene.Awake(target, mapmanager, maplayerstack);
	}
	return scene;
};

});
