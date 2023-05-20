/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Automations namespace
// Author: Juergen Gatter
// helper functions
// automations provider

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

VBI.Automations = function() {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	var automations = {};
	automations.m_automations = []; // array of automations

	automations.clear = function() {
		// clear the data type provider........................................//
		for (var nJ = 0; nJ < automations.m_automations.length; ++nJ) {
			automations.m_automations[nJ].clear();
		}

		// reset array
		automations.m_automations = [];
	};

	automations.load = function(dat, ctx) {
		// load the json delta data............................................//
		if (dat.Call) {
			var automation = {};
			if (jQuery.type(dat.Call) == 'object') {
				automation = new VBI.Automations.Automation();
				automation.load(dat.Call, ctx); // load the automation...//

				automations.m_automations.push(automation);
				/*
				 * TO DO:
				 * load when there is only one object
				 */
			} else if (jQuery.type(dat.Call) == 'array') {
				// load an array of automations
				for (var nJ = 0; nJ < dat.Call.length; ++nJ) {
					automation = new VBI.Automations.Automation();
					automation.load(dat.Call[nJ], ctx); // load the automation...//

					automations.m_automations.push(automation);
				}
			}
		}
	};

	// ........................................................................//
	// automation implementation..............................................//

	VBI.Automations.Automation = function() {
		var automation = {};

		// additional properties array.........................................//
		automation.m_additionalProperties = [];

		automation.clear = function() {
			automation.m_addProperties = null;
		};

		automation.createHandler = function(dat, handler) {
			switch (handler) {
				case "CONTEXTMENUHANDLER":
					return new VBI.ContextMenuHandler(dat);
				case "FLYTOHANDLER":
					return new VBI.FlyToHandler(dat);
				case "OBJECTCREATIONHANDLER":
					return new VBI.ObjectCreationHandler(dat);
				case "LOOPBACKHANDLER":
					return new VBI.LoopBackHandler(dat);
				default:
					return undefined;
			}
		};

		automation.getMainScene = function(ctx) { // in case there is anyway only one scene we use this scene
			if (ctx.m_SceneManager.m_SceneArray.length == 1) {
				return ctx.m_SceneManager.m_SceneArray[0].m_ID;
			}
			return undefined;
		};

		automation.load = function(dat, ctx) {
			automation.m_handlerName = dat.handler;
			automation.m_handler = automation.createHandler(dat.Param, dat.handler);
			if (!automation.m_handler) {
				return;
			}
			automation.m_handler.m_Ctx = ctx;
			automation.m_name = dat.name;
			if (automation.m_handler.m_scene == undefined) {
				automation.m_handler.m_scene = (dat.scene == undefined ? automation.getMainScene(ctx) : dat.scene);
			}
			automation.m_delay = (dat.delay == undefined ? 1 : dat.delay);
			automation.m_earliest = (dat.earliest == undefined ? 1 : dat.earliest);
			automation.m_retryAfterMS = (dat.retryAfterMS == undefined ? 0 : dat.retryAfterMS);
			automation.m_reattempts = (dat.reattempts == undefined ? -1 : dat.reattempts);
			automation.m_handler.m_refID = (dat.refID == undefined ? "" : dat.refID);
			automation.m_handler.m_refObj = (dat.object == undefined ? "" : dat.object);
			automation.m_handler.m_refInstance = (dat.object == undefined ? "" : dat.instance);
			automation.m_handler.m_Name = dat.name; // set the function name to be called
			automation.m_nAttempts = 0;
			var now = new Date();
			var runningTime = now.getTime() - ctx.m_StartupTime;
			var nCurrentDelay = automation.m_delay;
			if (runningTime < automation.m_earliest) {
				nCurrentDelay = Math.max(nCurrentDelay, automation.m_earliest - runningTime);
			}
			automation.m_AnimZoomTimer = window.setInterval(automation.startAutomation, nCurrentDelay);
		};

		automation.startAutomation = function() {
			window.clearInterval(automation.m_AnimZoomTimer);

			if (!automation.m_handler.start() && automation.m_retryAfterMS) {
				automation.m_nAttempts++;
				if ((automation.m_reattempts == -1) || (automation.m_nAttempts < automation.m_reattempts)) {
					automation.m_AnimZoomTimer = window.setInterval(automation.startAutomation, automation.m_retryAfterMS);
				}
			}
		};

		return automation;
	};

	return automations;
};

VBI.FlyToHandler = function(dat) {
	var flyToHandler = {};
	flyToHandler.cnt = 0;
	for (var i = 0; i < dat.length; ++i) {
		if (dat[i].name === "x") {
			flyToHandler.m_x = dat[i]["#"];
		}
		if (dat[i].name === "y") {
			flyToHandler.m_y = dat[i]["#"];
		}
		if (dat[i].name === "lod") {
			flyToHandler.m_lod = dat[i]["#"];
		}
		if (dat[i].name === "mode") {
			flyToHandler.m_mode = dat[i]["#"];
		}
		if (dat[i].name === "velocity") {
			flyToHandler.m_velocity = dat[i]["#"];
		}
		if (dat[i].name === "basetime") {
			flyToHandler.m_basetime = dat[i]["#"];
		}
		if (dat[i].name === "scene") {
			flyToHandler.m_scene = dat[i]["#"];
		}
		if (dat[i].name === "zoomToAll") {
			flyToHandler.m_zoomToAll = dat[i]["#"];
		}
	}

	flyToHandler.start = function() {
		if (VBI.m_bTrace) {
			VBI.m_bTrace && VBI.Trace("FlyTo triggered to " + flyToHandler.m_x + "," + flyToHandler.m_y + "," + flyToHandler.m_lod + " on scene " + flyToHandler.m_scene);
		}
		if (flyToHandler.m_scene == undefined || flyToHandler.m_x == undefined || flyToHandler.m_y == undefined || flyToHandler.m_lod == undefined) {
			return true; // unsuccessful but repeating makes no sense either
		}
		var scene = flyToHandler.m_Ctx.m_SceneManager.GetSceneByName(flyToHandler.m_scene);

		if (scene) {
			if (flyToHandler.m_zoomToAll) {
				scene.ZoomToAll();
			} else {
				var lod = flyToHandler.m_lod;
				var lonlat = VBI.MathLib.DegToRad([parseFloat(flyToHandler.m_x), parseFloat(flyToHandler.m_y)]);
				scene.ZoomToGeoPosition(lonlat, lod);
			}
		}
		return true;
	};

	return flyToHandler;
};

VBI.ContextMenuHandler = function(dat) {
	var contextMenuHandler = {};
	contextMenuHandler.cnt = 0;
	for (var i = 0; i < dat.length; ++i) {
		if (dat[i].name === "x") {
			contextMenuHandler.m_x = parseInt(dat[i]["#"], 10);
		}
		if (dat[i].name === "y") {
			contextMenuHandler.m_y = parseInt(dat[i]["#"], 10);
		}
		if (dat[i].name === "scene") {
			contextMenuHandler.m_scene = dat[i]["#"];
		}
	}

	contextMenuHandler.start = function() {
		var scene = contextMenuHandler.m_Ctx.m_SceneManager.GetSceneByName(contextMenuHandler.m_scene);
		var ctx = contextMenuHandler.m_Ctx;
		var oMenuObject = ctx.m_Menus.findMenuByID(contextMenuHandler.m_refID);
		if (!scene) {
			return true;
		}

		oMenuObject.vbi_data.scene = contextMenuHandler.m_scene;
		oMenuObject.vbi_data.object = contextMenuHandler.m_refObj;
		oMenuObject.vbi_data.instance = contextMenuHandler.m_refInstance;
		// close any opened menu
		if (ctx.m_strOpenMenu) {
			ctx.m_Menus.findMenuByID(ctx.m_strOpenMenu).close();
		}
		if (ctx.m_HitMenu) {
			ctx.m_HitMenu.close();
			ctx.m_HitMenu.destroy();
		}
		// open new menu and keep it for future reference
		ctx.m_strOpenMenu = contextMenuHandler.m_refID;
		oMenuObject.open(true, 0, "begin top", "begin top", scene.m_Div, "" + contextMenuHandler.m_x + " " + contextMenuHandler.m_y + "", "fit");
	};

	return contextMenuHandler;
};

// ...........................................................................//
// handler for triggering object creations...................................//

VBI.ObjectCreationHandler = function(dat) {
	var handler = {};
	handler.cnt = 0;
	handler.m_Ctx = null;
	handler.m_Name = null;

	if (jQuery.type(dat) == 'object') {
		// expect the id of the action that should be raised...................//
		if (dat.name === "data") {
			handler.m_data = dat["#"];
		}
	} else if (jQuery.type(dat) == 'array') {
		// expect the id of the action that should be raised...................//
		for (var i = 0, len = dat.length; i < len; ++i) {
			if (dat[i].name === "data") {
				handler.m_data = dat[i]["#"];
			}
		}
	}

	handler.start = function() {
		var scene = null;
		if ((scene = handler.m_Ctx.m_SceneManager.GetSceneByName(handler.m_scene))) {
			if (handler.m_Name == "CreateObject") {
				// check if there is CreateeComplete action subscribed...........//
				var action = null, actions = scene.m_Ctx.m_Actions;
				if (actions) {
					action = scene.m_Ctx.m_Actions.findAction("CreateComplete", scene, "General");
				}

				// determine the right callback function for the handler.........//
				var func = null;
				if (action) {
					// bind to a callback that raises the event...................//
					func = function(data) {
						var params = {
							data: data
						};
						scene.m_Ctx.FireAction(action, scene, "General", null, params);
					};
				} else {
					// by default we bind the loader function of the vbi instance.//
					func = scene.m_Ctx.m_Control.load.bind(scene.m_Ctx.m_Control);
				}

				scene.DesignCreateObject(handler.m_data, null, func);
			}
		}
	};

	return handler;
};

// ...........................................................................//
// handler for triggering a roundtrip by raising an action...................//

VBI.LoopBackHandler = function(dat) {
	var handler = {};
	handler.cnt = 0;
	handler.m_Ctx = null;
	handler.m_Name = null;

	if (jQuery.type(dat) == 'object') {
		// expect the id of the action that should be raised...................//
		if (dat.name === "ActionID") {
			handler.m_ActionID = dat["#"];
		}
	} else if (jQuery.type(dat) == 'array') {
		// expect the id of the action that should be raised....................//
		for (var i = 0, len = dat.length; i < len; ++i) {
			if (dat[i].name === "ActionID") {
				handler.m_ActionID = dat[i]["#"];
			}
		}
	}

	handler.start = function() {
		if (handler.m_Name == "TriggerAction") {
			var actions;
			if ((actions = handler.m_Ctx.m_Actions)) {
				// check if action is subscribed....................................//
				var action;
				if ((action = actions.findAction(null, null, null, handler.m_ActionID))) {
					var scene;
					if ((scene = handler.m_Ctx.m_SceneManager.GetSceneByName(action.m_refScene))) {
						var vo = scene.BaseGetVO(action.m_refVO);
						handler.m_Ctx.FireAction(action, scene, vo ? vo : action.m_refVO, null, null);
					}
				}
			}
		}

	};

	return handler;
};

});
