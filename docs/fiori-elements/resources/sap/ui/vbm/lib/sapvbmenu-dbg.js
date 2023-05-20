/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Menus namespace
// Author: Juergen Gatter
// helper functions
// menus provider

sap.ui.define([
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"./sapvbi"
], function(Menu, MenuItem) {
	"use strict";

VBI.Menus = function() {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	var menus = {};
	menus.m_menus = []; // array of menus

	menus.clear = function() {
		for (var nJ = menus.m_menus.length - 1; nJ >= 0; --nJ) {
			menus.m_menus[nJ].destroy();
			menus.m_menus.pop();
		}

		menus.m_menus = [];
	};

	menus.loadMainMenu = function(dat, ctx) {
		var oMenuObject = new Menu();
		menus.loadMenu(oMenuObject, dat, ctx, oMenuObject.getId());
		oMenuObject.vbi_data = {};
		oMenuObject.vbi_data.menuRef = dat.id;
		oMenuObject.vbi_data.VBIName = dat.name;

		oMenuObject.attachItemSelect(function(e) {
			var retval = {};
			retval.refid = e.mParameters.item.vbi_data.refid;
			retval.menu = oMenuObject;
			menus.OnSelected(retval);
		});
		menus.m_menus.push(oMenuObject);

		return oMenuObject;
	};

	menus.loadMenu = function(oMenu, dat, ctx, id) {
		var isObj = jQuery.type(dat.MenuItem) == 'object';
		var arrLength = (isObj ? 1 : dat.MenuItem.length);
		for (var ii = 0; ii < arrLength; ++ii) {
			var subdat = (isObj ? dat.MenuItem : dat.MenuItem[ii]);
			if (subdat.active == "false") {
				continue;
			}
			var subid;
			subid = id + "_" + ii;
			var sText = subdat.Separator == undefined ? subdat.text : "---------------------------";
			var oMenuItem = new MenuItem("vbimi_" + subid, {
				text: sText
			});
			oMenuItem.vbi_data = {};
			if ((subdat.disabled == "true") || (subdat.Separator != undefined)) {
				oMenuItem.setEnabled(false);
			}
			oMenu.addItem(oMenuItem);
			if (subdat.icon) {
				oMenuItem.setIcon(subdat.icon);
			}
			if (VBI.m_bTrace) {
				VBI.Trace("Adding Menuitem: menuitem_" + subid + " with text " + sText);
			}
			if (subdat.MenuItem != undefined) {
				var oSubMenu = new Menu("vbim_" + subid);
				oMenuItem.setSubmenu(oSubMenu);
				menus.loadMenu(oSubMenu, subdat, ctx, subid);
			} else if (subdat.id != "") {
				oMenuItem.vbi_data.refid = subdat.id;
			}
		}
	};

	menus.deleteMenu = function(menuName) {
		var idx = menus.findMenuIdxByName(menuName);
		if (idx >= 0) {
			var lastIdx = menus.m_menus.length - 1;
			menus.m_menus[idx].destroy();
			if (idx != lastIdx) {
				menus.m_menus[idx] = menus.m_menus[lastIdx];
			}
			menus.m_menus.pop();
			return idx;
		}
		return -1;
	};

	menus.getMainScene = function(ctx) { // in case there is anyway only one scene we use this scene
		if (ctx.m_SceneManager.m_SceneArray.length == 1) {
			return ctx.m_SceneManager.m_SceneArray[0].m_ID;
		}
		return undefined;
	};

	menus.load = function(dat, ctx) {
		// lazy load sap.ui.unified library for using the Menu
		sap.ui.getCore().loadLibrary("sap.ui.unified");

		menus.m_context = ctx;

		// load the json delta data............................................//
		if (dat.Set) {
			if (dat.Set.name != undefined) {
				menus.deleteMenu(dat.Set.name);
			} else {
				menus.clear();
			}

			if (jQuery.type(dat.Set) == 'object') {
				if (dat.Set.Menu) {
					menus.loadMainMenu(dat.Set.Menu, ctx);
				}
			} else if (jQuery.type(dat.Set) == 'array') {
				// load an array of menus
				for (var nJ = 0; nJ < dat.Set.length; ++nJ) {
					if (dat.Set[nJ].Menu) {
						menus.loadMainMenu(dat.Set[nJ].Menu, ctx);
					}
				}
			}
		}
	};

	menus.findMenuByID = function(menuID) {
		if (menus.m_menus) {
			for (var ii = 0; ii < menus.m_menus.length; ++ii) {
				if (menus.m_menus[ii].vbi_data.menuRef == menuID) {
					return menus.m_menus[ii];
				}
			}
		}

		return null;
	};

	menus.findMenuIdxByName = function(menuName) {
		if (menus.m_menus) {
			for (var ii = 0; ii < menus.m_menus.length; ++ii) {
				if (menus.m_menus[ii].vbi_data.VBIName == menuName) {
					return ii;
				}
			}
		}

		return -1;
	};

	menus.OnSelected = function(retval) {
		var refObj = retval.menu.vbi_data.object;
		if (retval.refid == undefined) {
			return;
		}
		var scene = menus.m_context.m_SceneManager.GetSceneByName(retval.menu.vbi_data.scene);
		var actions = menus.m_context.m_Actions;
		if (actions) {
			if (actions.findAction("ContextMenu", scene, refObj)) {
				var action = new VBI.Actions.Action();
				action.m_name = "FCODE_SELECT";
				action.m_id = retval.refid;
				scene.m_Ctx.FireAction(action, scene, refObj, null, null, retval.menu.vbi_data.instance);
			}
		}
	};

	return menus;
};

});
