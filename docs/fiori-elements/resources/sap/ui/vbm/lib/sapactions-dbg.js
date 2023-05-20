/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Actions namespace
// Author: Ulrich Roegelein
// helper functions
// actions provider

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

VBI.Actions = function() {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	var actions = {};
	actions.m_actions = []; // array of actions

	actions.clear = function() {
		// clear the data type provider........................................//
		for (var nJ = 0; nJ < actions.m_actions.length; ++nJ) {
			actions.m_actions[nJ].clear();
		}

		// reset array
		actions.m_actions = [];
	};

	actions.Set = function(dat, id, ctx) {
		if (id) {
			// setting a specifivc action.......................................//
			var action;
			if ((action = actions.findById(id))) {
				action.load(dat, ctx); // load the action...//
			} else {
				// create the new action load and push it........................//
				action = new VBI.Actions.Action();
				action.load(dat, ctx);
				actions.m_actions.push(action);
			}
			return;
		}
	};

	actions.Remove = function(dat, id, ctx) {
		if (id) {
			// remove a specific action.........................................//
			var action;
			if ((action = actions.findById(id))) {
				actions.m_actions.splice(action.m_nArrayIndex, 1);
			}

			return;
		}
	};

	actions.load = function(dat, ctx) {
		var nJ;
		// first process all data removes......................................//
		if (dat.Remove) {
			// check if there are multiple sets.................................//
			if (jQuery.type(dat.Remove) == 'array') {
				// remove an array of actions....................................//
				for (nJ = 0; nJ < dat.Remove.length; ++nJ) {
					actions.Remove(dat.Remove[nJ], dat.Remove[nJ].id, ctx);
				}
			}
		}

		// load the json delta data............................................//
		if (dat.Set) {
			// check if there are multiple sets.................................//
			if (jQuery.type(dat.Set) == 'array') {
				// load an array of actions......................................//
				for (nJ = 0; nJ < dat.Set.length; ++nJ) {
					actions.Set(dat.Set[nJ].Action, dat.Set[nJ].id, ctx);
				}
				return;
			}

			// clear all actions when this is not a set by id...................//
			if (!dat.Set.id) {
				actions.clear();
			}

			if (jQuery.type(dat.Set.Action) == 'object') {
				actions.Set(dat.Set.Action, dat.Set.Action.id, ctx);
			} else if (jQuery.type(dat.Set.Action) == 'array') {
				// load an array of actions
				for (nJ = 0; nJ < dat.Set.Action.length; ++nJ) {
					actions.Set(dat.Set.Action[nJ], dat.Set.Action[nJ].id, ctx);
				}
			}
		}
	};

	actions.findById = function(id) {
		// find the action.....................................................//
		var aAction = actions.m_actions, len = aAction.length;
		for (var nJ = 0; nJ < len; ++nJ) {
			var a = aAction[nJ];
			if (a && (a.m_id == id)) {
				a.m_nArrayIndex = nJ; // set the array index................//
				return a;
			}
		}
	};

	actions.findAction = function(evtname, scene, vo, actionID) {
		// the vo can be either a string or an object..........................//
		// for map actions the vo is usually a string..........................//

		var id = null;
		if (jQuery.type(vo) == 'object') {
			id = vo.m_ID;
		} else if (jQuery.type(vo) == 'string') {
			id = vo;
		}

		// find the fitting action.............................................//
		var tmp, len = actions.m_actions.length;
		for (var nJ = 0; nJ < len; ++nJ) {
			tmp = actions.m_actions[nJ];
			if ((evtname ? (tmp.m_refEvent == evtname) : true) && (scene ? (tmp.m_refScene == scene.m_ID) : true) && (vo ? (tmp.m_refVO == id) : true) && (actionID ? (tmp.m_id == actionID) : true)) {
				return tmp;
			}
		}
		return null;
	};

	// ........................................................................//
	// action implementation..................................................//

	VBI.Actions.Action = function() {
		var action = {};

		action.m_id = 0;
		action.m_name = null;
		action.m_refScene = null;
		action.m_refVO = null;
		action.m_refEvent = null;

		// additional properties array.........................................//
		action.m_additionalProperties = [];

		action.clear = function() {
			action.m_addProperties = null;
		};

		action.load = function(dat, ctx) {
			// load the attributes
			action.m_id = dat.id;
			action.m_name = dat.name;
			action.m_refScene = dat.refScene;
			action.m_refVO = dat.refVO;
			action.m_refEvent = dat.refEvent;

			// reset additional properties to be able to reload an existing.....//
			// action...........................................................//
			action.m_additionalProperties = [];

			// check if there are additional properties requested...............//
			if (dat.AddActionProperty) {
				if (jQuery.type(dat.AddActionProperty) == 'object') {
					// load additional properties when it is just an object.......//
					action.m_additionalProperties.push(dat.AddActionProperty.name);
				} else if (jQuery.type(dat.AddActionProperty) == 'array') {
					// load additional properties when specified as an array......//
					for (var nJ = 0; nJ < dat.AddActionProperty.length; ++nJ) {
						action.m_additionalProperties.push(dat.AddActionProperty[nJ].name);
					}
				}
			}
		};

		return action;
	};

	return actions;
};

});
