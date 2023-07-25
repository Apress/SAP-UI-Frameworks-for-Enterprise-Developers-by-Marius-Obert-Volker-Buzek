/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// this module does the vbicontext handling
// Author: Ulrich Roegelein
// the scene manager manages the scene instances in a component context

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

VBI.VBIContext = function(control) {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	var vbcx = {};
	vbcx.vbiclass = "VBIContext";

	vbcx.m_bLoaded = false;
	vbcx.m_Resources = null;
	vbcx.m_Config = null;
	vbcx.m_DataTypeProvider = null;
	vbcx.m_DataProvider = null;
	vbcx.m_SceneManager = null;
	vbcx.m_MapProviders = null;
	vbcx.m_MapLayerStackManager = null;
	vbcx.m_Windows = null;
	vbcx.m_Actions = null;
	vbcx.m_Automations = null;
	vbcx.m_Menus = null;
	vbcx.m_Control = control;
	vbcx.m_deltacolTable = [];

	var now = new Date();
	vbcx.m_StartupTime = now.getTime();

	vbcx.clear = function() {
		// clear inner objects.................................................//
		if (vbcx.m_Resources) {
			vbcx.m_Resources.clear();
		}
		if (vbcx.m_Config) {
			vbcx.m_Config.clear();
		}
		if (vbcx.m_DataTypeProvider) {
			vbcx.m_DataTypeProvider.clear();
		}
		if (vbcx.m_DataProvider) {
			vbcx.m_DataProvider.clear();
		}
		if (vbcx.m_SceneManager) {
			vbcx.m_SceneManager.clear();
		}
		if (vbcx.m_MapProviders) {
			vbcx.m_MapProviders.clear();
		}
		if (vbcx.m_MapLayerStackManager) {
			vbcx.m_MapLayerStackManager.clear();
		}
		if (vbcx.m_Windows) {
			vbcx.m_Windows.clear();
		}
		if (vbcx.m_Actions) {
			vbcx.m_Actions.clear();
		}
		if (vbcx.m_Automations) {
			vbcx.m_Automations.clear();
		}
		if (vbcx.m_Menus) {
			vbcx.m_Menus.clear();
		}

		// reset back reference................................................//
		vbcx.m_Control = null;

		// zutun: reset inner references........................................//
		vbcx.m_Resources = null;
		vbcx.m_Config = null;
		vbcx.m_DataTypeProvider = null;
		vbcx.m_DataProvider = null;
		vbcx.m_SceneManager = null;
		vbcx.m_MapProviders = null;
		vbcx.m_MapLayerStackManager = null;
		vbcx.m_Windows = null;
		vbcx.m_Actions = null;
		vbcx.m_Automations = null;
		vbcx.m_Menus = null;
	};

	// helper functions.......................................................//
	vbcx.GetResources = function() {
		if (!vbcx.m_Resources) {
			vbcx.m_Resources = new VBI.Resources();
		}
		return (vbcx.m_Resources);
	};

	vbcx.GetConfig = function() {
		if (!vbcx.m_Config) {
			vbcx.m_Config = new VBI.Configurations();
		}
		return (vbcx.m_Config);
	};

	vbcx.GetMainScene = function() {
		// the main scene is the one that is displayed in the main window......//
		if (vbcx.m_Windows) {
			var wnd = vbcx.m_Windows.GetMainWindow();
			if (wnd) {
				var scene = wnd.GetScene();
				if (scene) {
					return scene;
				}
			}
		}

		return null; // no scene available...................................//
	};

	vbcx.FireAction = function(action, scene, vo, de, params, instanceDirect, allowPreventDefault, hit) {
		// fire the submit data................................................//
		// zutun: create the xml or json dependent, on the subscription.........//
		// and fire the submit event, providing a valid json/xml string........//

		// the vo can be a string or an object.................................//
		// usually when the event is fired by the map, a string is specified...//
		var id = null;
		if (jQuery.type(vo) == 'object') {
			id = vo.m_ID;
		} else if (jQuery.type(vo) == 'string') {
			id = vo;
		}

		// create a new json object and fill it with data......................//

		var o = {};
		var oRoot = (o["SAPVB"] = {});
		oRoot["version"] = "2.0";
		oRoot["xmlns:VB"] = "VB";

		// store action........................................................//
		var oAction = (oRoot["Action"] = {});
		oAction.name = action.m_name; // name of action
		oAction.object = id; // id of the vo
		oAction.id = action.m_id; // id of the action

		// add the instance information to the event...........................//
		if (instanceDirect != undefined) {
			oAction.instance = instanceDirect;
		} else if (de) {
			oAction.instance = de.GetPath();
		}
		// event coordinates...................................................//
		// these are needed for the additional properties......................//
		var x = 0.0;
		var y = 0.0;
		var bMousePosAvailable = false;

		// add the parameters..................................................//
		if (params) {
			oAction.Params = {};
			oAction.Params.Param = [];

			// add the attributes and put them into an array....................//
			for ( var a in params) {
				var tmp = {};
				tmp["name"] = a;
				tmp["#"] = params[a];
				oAction.Params.Param.push(tmp);

				// get the coordinates from the parameters.......................//
				if (a == 'x') {
					x = params[a];
					bMousePosAvailable = true;
				}
				if (a == 'y') {
					y = params[a];
					bMousePosAvailable = true;
				}
			}
		}

		if (vo == "Thumbnail") {
			x *= (scene.GetInternalDivWidth() / scene.m_Div.clientWidth);
			y *= (scene.GetInternalDivHeight() / scene.m_Div.clientHeight);
		}

		// add modified datacontext data.......................................//
		if (vbcx.m_DataProvider) {
			vbcx.m_DataProvider.store(oRoot);
		}

		// add additional properties, this is done to be compatible to the c++.//
		// implementation......................................................//

		var len;
		if (action.m_additionalProperties && (len = action.m_additionalProperties.length)) {
			var apo = oAction.AddActionProperties = {}; // action properties object
			var apa = apo.AddActionProperty = []; // action property array

			for (var nJ = 0; nJ < len; ++nJ) {
				var pos, bws;
				switch (action.m_additionalProperties[nJ]) {
					case 'zoom':
						// add the current zoom level..............................//
						apa.push({
							name: 'zoom',
							'#': scene.GetCurrentZoomlevel().toString()
						});
						break;
					// add pie index information...................................//
					case 'pieitem':
						if (vo instanceof VBI.VisualObjects.Pie && hit) {
							apa.push({
								name: 'pieitem',
								'#': hit.m_Detail.m_slice
							});
						}
						break;
					case 'centerpoint':
						// add the center position.................................//
						pos = VBI.MathLib.RadToDeg(scene.GetCenterPos());
						apa.push({
							name: 'centerpoint',
							'#': pos[0].toString() + ';' + pos[1].toString() + ';0.0'
						});
						break;
					case 'vos':
						// add the count of objects inside the cluster............//
						apa.push({
							name: 'vos',
							'#': de.cnt
						});
						break;
					case 'subclusters':
						// add the count of objects inside the cluster............//
						bws = (de.isCl == 4 && de.bw != undefined ? de.bw.length : -1);
						apa.push({
							name: 'subclusters',
							'#': bws
						});
						break;
					case 'clustersnextlod':
						if (de.isCl == 4 && de.bw != undefined) {
							bws = (scene.GetCurrentZoomlevel() == de.lod ? de.bw.length : 1);
						} else {
							bws = -1;
						}
						apa.push({
							name: 'clustersnextlod',
							'#': bws
						});
						break;
					case 'clusterarea':
						var bb = "";
						if (de.isCl == 4 && de.bo != undefined) {
							bb = this.m_Clustering.getClusterArea(scene, de);
						}
						apa.push({
							name: 'clusterarea',
							'#': bb
						});
						break;
					case 'pos':
						// add the current click position..........................//
						if (bMousePosAvailable) {
							pos = scene.GetPosFromVPPoint([
								x, y, 0
							]);
							apa.push({
								name: 'pos',
								'#': pos[0].toString() + ';' + pos[1].toString() + ';0.0'
							});
						}
						break;
					case 'pitch':
						// pitch is always 0 in flat scenes........................//
						apa.push({
							name: 'pitch',
							'#': '0.0'
						});
						break;
					case 'yaw':
						// yaw is always 0 in flat scenes..........................//
						apa.push({
							name: 'yaw',
							'#': '0.0'
						});
						break;
					default:
						break;
				}
			}
		}
		// convert to a json string............................................//
		var txt = JSON.stringify(oRoot, null, '  ');

		// raise the submit....................................................//
		if (vbcx.m_Control) {
			if (allowPreventDefault) {
				return vbcx.m_Control.fireEvent("submit", {data: txt}, true);
			}
			vbcx.m_Control.fireSubmit({data: txt});
		}
	};

	// ........................................................................//
	// low level event delegates..............................................//

	vbcx.onRenderLayer = function(canvas) {
		// this function is called when the overlay canvas can be rendered by..//
		// the application.....................................................//
		vbcx.m_Control.fireRender({
			canvas: canvas
		});
	};

	vbcx.onMoveLayer = function(canvas) {
		// this function is called when the overlay canvas is moved............//
		vbcx.m_Control.fireMove({
			canvas: canvas
		});
	};

	vbcx.onZoomLayer = function(canvas) {
		// this function is called when the overlay canvas is zoomed...........//
		vbcx.m_Control.fireZoom({
			canvas: canvas
		});
	};

	vbcx.onOpenWindow = function(id, div) {
		// this function is called when a new window is opened.................//
		vbcx.m_Control.fireOpenWindow({
			id: id,
			contentarea: div
		});
	};

	vbcx.onCloseWindow = function(id, div) {
		// this function is called when a window is closed.................//
		vbcx.m_Control.fireCloseWindow({
			id: id,
			contentarea: div
		});
	};

	vbcx.onOpenContainer = function(id, div) {
		// this function is called when a new container is opened.................//
		vbcx.m_Control.fireContainerCreated({
			id: id,
			contentarea: div
		});
	};

	vbcx.onCloseContainer = function(id, div) {
		// this function is called when a container is closed.................//
		vbcx.m_Control.fireContainerDestroyed({
			id: id,
			contentarea: div
		});
	};

	vbcx.onChangeTrackingMode = function(mode, bSet) {
		// this function is called when a tracking mode has changed .................//
		vbcx.m_Control.fireChangeTrackingMode({
			mode: mode,
			bSet: bSet
		});
	};

	vbcx.DoMinimize = function(scene) {
		var thumbObj = vbcx.moThumbnail;
		var ctrl = this.m_Control;

		var bSizeNotChanged;
		if (!thumbObj.bThumbnailed) {
			thumbObj.strOrgWidth = this.m_Control.getWidth();
			thumbObj.strOrgHeight = this.m_Control.getHeight();
			thumbObj.nOrgWidth = thumbObj.nFullWidth ? thumbObj.nFullWidth : scene.m_nDivWidth;
			thumbObj.nOrgHeight = thumbObj.nFullHeight ? thumbObj.nFullHeight : scene.m_nDivHeight;
			thumbObj.bThumbnailed = true;
			bSizeNotChanged = ((thumbObj.nThumbWidth === scene.m_nDivWidth) && (thumbObj.nThumbHeight === scene.m_nDivHeight));
		} else {
			bSizeNotChanged = ((thumbObj.nThumbWidth === parseInt(ctrl.getWidth(), 10)) && (thumbObj.nThumbHeight === parseInt(ctrl.getHeight(), 10)));
			if (thumbObj.nFullWidth && thumbObj.nOrgWidth != thumbObj.nFullWidth) {
				thumbObj.nOrgWidth = thumbObj.nFullWidth;
				bSizeNotChanged = true;
			}
			if (thumbObj.nFullHeight && thumbObj.nOrgHeight != thumbObj.nFullHeight) {
				thumbObj.nOrgHeight = thumbObj.nFullHeight;
				bSizeNotChanged = true;
			}
		}

		if (thumbObj.nThumbWidth <= 0 && thumbObj.nOrgHeight > 0) {
			thumbObj.nThumbWidth = thumbObj.nOrgWidth / thumbObj.nOrgHeight * thumbObj.nThumbHeight;
		}

		if (thumbObj.nThumbHeight <= 0 && thumbObj.nOrgWidth > 0) {
			thumbObj.nThumbHeight = thumbObj.nOrgHeight / thumbObj.nOrgWidth * thumbObj.nThumbWidth;
		}

		ctrl.setWidth(thumbObj.nThumbWidth);
		ctrl.setHeight(thumbObj.nThumbHeight);

		if (bSizeNotChanged) {
			scene.resizeCanvas(0);
		} // otherwise ResizeHandler will trigger resize process
	};

	return vbcx;
};

});
