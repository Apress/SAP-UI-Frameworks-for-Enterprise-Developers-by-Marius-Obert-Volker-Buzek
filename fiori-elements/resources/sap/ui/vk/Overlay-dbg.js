/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Overlay.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/vbm/library",
	"sap/ui/vbm/VBI",
	"sap/ui/unified/Menu",
	"./Messages",
	"./OverlayRenderer",
	"./getResourceBundle",
	"./OverlayArea",
	"sap/base/Log"
], function(
	vkLibrary,
	Control,
	vbmLibrary,
	vbi,
	Menu,
	Messages,
	OverlayRenderer,
	getResourceBundle,
	OverlayArea,
	Log
) {
	"use strict";

	/* global VBI */

	/**
	 * Constructor for a new Overlay.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Constructor for a new Overlay.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.Overlay
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.32.0
	 */
	var Overlay = Control.extend("sap.ui.vk.Overlay", /** @lends sap.ui.vk.Overlay.prototype */ {
		metadata: {

			library: "sap.ui.vk",
			properties: {
				zoomOnResize: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				}
			},
			aggregations: {
				/**
				 * Aggregation of Highlight Areas.
				 */
				areas: {
					type: "sap.ui.vk.OverlayArea",
					multiple: true,
					singularName: "area"
				}
			},
			associations: {
				/**
				 * Aggregation of Highlight Areas.
				 */
				target: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {
				/**
				 * Raised when the Control is clicked.
				 */
				click: {
					parameters: {
						/**
						 * Client coordinate X
						 */
						clientX: {
							type: "int"
						},

						/**
						 * Client coordinate Y
						 */
						clientY: {
							type: "int"
						},

						/**
						 * Coordinates of click position in format "x;y;0"
						 */
						pos: {
							type: "string"
						}
					}
				},

				/**
				 * Raised when the Control is right clicked/longPress(tap and hold).
				 */
				contextMenu: {
					parameters: {

						/**
						 * Coordinates of click position in format "x;y;0"
						 */
						pos: {
							type: "string"
						},

						/**
						 * Menu to open
						 */
						menu: {
							type: "sap.ui.unified.Menu"
						}
					}
				}
			}
		}
	});

	// ...........................................................................//
	// This file defines behavior for the control...............................//
	// ...........................................................................//
	// Public API functions
	// ............................................................................//

	/**
	 * Trigger the interactive creation mode to get a position or position array.
	 *
	 * @param {boolean} bPosArray Indicator if a single position or an array is requested
	 * @param {function} callback Callback function func( sPosArray ) to be called when done. Position(array) sPosArray is provided in format
	 *        "x;y;0;..."
	 * @returns {boolean} Indicator whether the creation mode could be triggered successfully or not.
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Overlay.prototype.getPositionInteractive = function(bPosArray, callback) {
		if (!this.mIACreateCB && callback && typeof (callback) === "function") {
			this.mIACreateCB = callback;

			var sType = "POS";
			if (bPosArray) {
				sType += "ARRAY";
			}
			// trigger interactive creation mode by defining an automation call
			var oLoad = {
				"SAPVB": {
					"Automation": {
						"Call": {
							"handler": "OBJECTCREATIONHANDLER",
							"name": "CreateObject",
							"object": "MainScene",
							"scene": "MainScene",
							"instance": "",
							"Param": {
								"name": "data",
								"#": "{" + sType + "}"
							}
						}
					}
				}
			};
			this._load(oLoad);
			return true;
		} else {
			// callback function registered -> other create still pending!
			return false;
		}
	};

	/**
	 * open the context menu
	 *
	 * @param {object} oMenu the context menu to be opened
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Overlay.prototype.openContextMenu = function(oMenu) {
		this._openContextMenu("Overlay", this, oMenu);
	};

	/**
	 * Pan and Zoom for the Overlay. The offsets <i><code>nDeltaX</code></i> and <i><code>nDeltaY</code></i> are applied to the current center
	 * position. If zooming is involved as well the offsets are applied after the zooming.
	 *
	 * @param {int} nDeltaX the move of the center in x-direction in pixels
	 * @param {int} nDeltaY the move of the center in y-direction in pixels
	 * @param {float} fZoom the zoom factor to apply to the current state
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Overlay.prototype.setPanAndZoom = function(nDeltaX, nDeltaY, fZoom) {
		if (nDeltaX === 0 && nDeltaY === 0 && fZoom === 1) {
			return;
		}
		var scene = this.mVBIContext.GetMainScene();

		// sum up total center offset
		this.totalCenterOffset.dx += nDeltaX;
		this.totalCenterOffset.dy += nDeltaY;

		if (fZoom === 1) {
			// pan
			scene.MoveMap(nDeltaX, nDeltaY);
		} else {
			// zoom to center pos
			var canvas = scene.m_Canvas[0];
			var newLOD = canvas.m_nExactLOD + Math.log(fZoom) * Math.LOG2E;
			scene.ZoomToGeoPosition(VBI.MathLib.DegToRad([
				0.5, 0.5
			]), newLOD);
			scene.MoveMap(this.totalCenterOffset.dx, this.totalCenterOffset.dy);
		}
	};

	/**
	 * Reset the Overlay to its initial size and position.
	 *
	 * @returns {sap.ui.vk.Overlay} This allows method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Overlay.prototype.reset = function() {
		this.totalCenterOffset.dx = this.totalCenterOffset.dy = 0;
		var scene = this.mVBIContext.GetMainScene();
		if (scene) {
			scene.ZoomToGeoPosition(VBI.MathLib.DegToRad([
				0.5, 0.5
			]), this.initialZoom);
		} // else: nothing to reset!
		return this;
	};

	// ........................................................................//
	// Implementation of UI5 Interface functions
	// ........................................................................//

	Overlay.prototype.init = function() {
		this.aLoadQueue = null; // load queue...................//

		this.oTargetDomRef = null;

		// create the vbi control
		// context.........................................//
		this.mVBIContext = new VBI.VBIContext(this);
		this.resizeID = "";
		this.resizeIDTarget = "";

		// initially set dirty state for all elements............................//
		this.bVosDirty = true;
		this.bWindowsDirty = true;
		this.bSceneDirty = true;
		this.bDataDeltaUpdate = false;

		// internal state markers
		this.bHandleDataChangeActive = false;
		this.bForceDataUpdate = false;

		this.mAddMenuItems = [];

		this.totalCenterOffset = {
			dx: 0,
			dy: 0
		};
		this.initialZoom = 10;
	};

	Overlay.prototype.exit = function() {
		if (this.mVBIContext) {
			this.mVBIContext.clear(); // clear the resources...................//
		}

		if (this.resizeID != "") {
			sap.ui.core.ResizeHandler.deregister(this.resizeID);
			this.resizeID = "";
		}
		if (this.resizeIDTarget != "") {
			sap.ui.core.ResizeHandler.deregister(this.resizeIDTarget);
			this.resizeIDTarget = "";
		}

	};

	Overlay.prototype.resize = function(event) {
		var cntrl = (this.oControl != undefined) ? this.oControl : this;

		var ctx = cntrl.mVBIContext;
		if (ctx) {
			var scene = ctx.GetMainScene();
			if (scene) {
				if (cntrl.getZoomOnResize() && event && event.oldSize.width > 0) {
					var zoomChange = Math.log(event.size.width / event.oldSize.width) * Math.LOG2E;
					scene.ZoomToGeoPosition(scene.GetCenterPos(), scene.GetCurrentZoomlevel() + zoomChange, false, true, true);
				}
				scene.resizeCanvas(event, true, true);
			}
		}
	};

	Overlay.prototype.setTarget = function(oTarget) {
		if (!oTarget) {
			return;
		}

		this.setAssociation("target", oTarget);

		this.reset();
		// adapt to target
		if (oTarget instanceof sap.m.Image) {
			// image requires asynchronous adaptation when image file is loaded
			oTarget.addDelegate({
				onAfterRendering: function(oEvent) {
					this.oTargetDomRef = oTarget.getDomRef();
					this.oTargetDomRef.addEventListener("load", jQuery.proxy(this._adaptSizeOfTarget, this));
				}.bind(this)
			});
		} else {
			// the default for arbitrary controls is synchronous adaptation
			oTarget.addDelegate({
				onAfterRendering: function(oEvent) {
					this.oTargetDomRef = oTarget.getDomRef();
					this._adaptSizeOfTarget();
				}.bind(this)
			});
		}

		// set resize Handler on target to observe its size
		if (this.resizeIDTarget != "") {
			sap.ui.core.ResizeHandler.deregister(this.resizeIDTarget);
			this.resizeIDTarget = "";
		}
		this.resizeIDTarget = sap.ui.core.ResizeHandler.register(oTarget, this._adaptSizeOfTarget.bind(this));

	};

	Overlay.prototype._adaptSizeOfTarget = function() {
		var target = this.oTargetDomRef;
		var domref = this.getDomRef();
		if (target) {
			try {
				var jTarget = jQuery(target);
				var placing = {
					top: jTarget.offset().top,
					left: jTarget.offset().left,
					width: jTarget.outerWidth(),
					height: jTarget.outerHeight()
				};
				jQuery(domref).width(placing.width).height(placing.height).css("position", "absolute");

				/*
				 * TO DO:
				 * Find a better solution.
				 */
				// jQuery(domref).css("top", placing.top + "px");
				// jQuery(domref).css("left", placing.left + "px");
				jQuery(domref).css("top", "0px").css("left", "0px").css("visibility", "");
			} catch (e) {

				Log.error(e);
			}
		} else {
			jQuery(domref).css("position", "fixed").width("0px").height("0px").css("top", "0px").css("left", "0px").css("visibility", "hidden");
		}

	};

	// ...........................................................................//
	// once Overlay control is rendered, we attach navigation bar and map it
	// self....//

	Overlay.prototype.onAfterRendering = function() {
		// when there is preserved content restore
		// it.............................//
		if (this.$oldContent.length > 0) {
			this.$().append(this.$oldContent);
		}

		this._adaptSizeOfTarget();

		// process the load
		// queue.................................................//
		if (this.aLoadQueue) {
			var nJ;
			for (nJ = 0; nJ < this.aLoadQueue.length; ++nJ) {
				this._load(this.aLoadQueue[nJ]);
			}
			this.aLoadQueue = null;
		}

		if (this.resizeID == "") {
			this.resize();
			this.resizeID = sap.ui.core.ResizeHandler.register(this, this.resize);
		}

		// do a new adjust of DOM placed
		// elements.................................//
		// the function should do nothing if nothing needs to be
		// done.............//
		var sOverlayId = this.getId();
		if (this.mVBIContext.m_Windows) {
			this.mVBIContext.m_Windows.Awake(sOverlayId);
		}

	};

	Overlay.prototype.onBeforeRendering = function() {
		// this is called before the renderer is
		// called...........................//

		this.$oldContent = sap.ui.core.RenderManager.findPreservedContent(this.getId());
	};

	Overlay.prototype.invalidate = function(oSource) {
		// invalidate scene in any case to trigger updateScene
		this.bSceneDirty = true;
		// set the vos dirty state when the aggregations have changed
		if (oSource instanceof OverlayArea) {
			this.bVosDirty = true;
			// if invalidate results from internal data change we allow delta update for data
			this.bDataDeltaUpdate = this.bHandleDataChangeActive;
		}

		sap.ui.core.Control.prototype.invalidate.apply(this, arguments);
	};

	// ...............................................................................
	// Internal functions
	// ...............................................................................

	Overlay.prototype._load = function(dat) {
		// when the control is not yet rendered, queue the load
		// calls.............//
		if (!this.isRendered()) {
			// create the queue and push load
			// requests.............................//
			if (!this.aLoadQueue) {
				this.aLoadQueue = [];
			}
			this.aLoadQueue.push(dat);
			return;
		}

		// do processing when running as a
		// plugin.................................//
		this._loadHtml(dat);

	};

	Overlay.prototype._loadHtml = function(data) {
		var sOverlayId = this.getId();

		var dat = null;

		// ensure that data is converted to a json
		// object.........................//
		// when this is a string, due ABAP servers sometimes sets a BOM at
		// the....//
		// beginning of the string we try to skip
		// this............................//
		if (typeof data == "string") {
			dat = JSON.parse(data.indexOf("{") ? data.substr(data.indexOf("{")) : data);
		} else if (typeof data == "object") {
			dat = data; // this is already an object
		}
		// return immediately when data can not be
		// interpreted....................//
		if (!dat) {
			return;
		}

		// check for data
		// binding.................................................//
		if (!dat["SAPVB"]) {
			var md;
			if (this.mVBIContext && (md = (new VBI.Adaptor(this.mVBIContext)).CreateLoadData(dat))) {
				this.loadHtml(md);
				return;
			} else {
				return; // this is no valid data..............
			}
		}

		/*
		 * TO DO:
		 * Do correct handling when change flags set
		 */
		// set....................//
		var bModifiedData = false;
		var bModifiedScenes = false;
		var bModifiedWindows = false;

		// the data can be a json
		// object..........................................//
		if (jQuery.type(dat) == "object") {
			if (dat.SAPVB) {
				// process configuration
				// ...........................................//
				if (dat.SAPVB.Config) {
					// load the configuration
					// .......................................//
					this.mVBIContext.GetConfig().load(dat.SAPVB.Config, this.mVBIContext);
				}
				// process
				// resources................................................//
				if (dat.SAPVB.Resources) {
					// load the
					// resources............................................//
					this.mVBIContext.GetResources().load(dat.SAPVB.Resources, this.mVBIContext);
				}
				// process
				// datatypes................................................//
				if (dat.SAPVB.DataTypes) {
					// load the datatype
					// provider....................................//
					if (!this.mVBIContext["m_DataTypeProvider"]) {
						this.mVBIContext["m_DataTypeProvider"] = new VBI.DataTypeProvider();
					}

					this.mVBIContext["m_DataTypeProvider"].load(dat.SAPVB.DataTypes, this.mVBIContext);
				}
				// process
				// datacontext..............................................//
				if (dat.SAPVB.Data) {
					// load the
					// datacontext..........................................//
					// when the datacontext is loaded, provide the datatype
					// info.....//
					if (!this.mVBIContext["m_DataProvider"]) {
						this.mVBIContext["m_DataProvider"] = new VBI.DataProvider();
					}

					this.mVBIContext["m_DataProvider"].load(dat.SAPVB.Data, this.mVBIContext);
					bModifiedData = true;
				}

				// process
				// windows..................................................//
				if (dat.SAPVB.Windows) {
					if (!this.mVBIContext["m_Windows"]) {
						this.mVBIContext["m_Windows"] = new VBI.Windows();
					}
					this.mVBIContext["m_Windows"].load(dat.SAPVB.Windows, this.mVBIContext);
					bModifiedWindows = true;
				}
				// process
				// actions..................................................//
				if (dat.SAPVB.Actions) {
					if (!this.mVBIContext["m_Actions"]) {
						this.mVBIContext["m_Actions"] = new VBI.Actions();
					}
					this.mVBIContext["m_Actions"].load(dat.SAPVB.Actions, this.mVBIContext);
				}
				// process
				// automations..............................................//
				if (dat.SAPVB.Automation) {
					if (!this.mVBIContext["m_Automations"]) {
						this.mVBIContext["m_Automations"] = new VBI.Automations();
					}
					this.mVBIContext["m_Automations"].load(dat.SAPVB.Automation, this.mVBIContext);
				}
				// context menues
				// ..................................................//
				if (dat.SAPVB.Menus) {
					if (!this.mVBIContext["m_Menus"]) {
						this.mVBIContext["m_Menus"] = new VBI.Menus();
					}
					this.mVBIContext["m_Menus"].load(dat.SAPVB.Menus, this.mVBIContext);
				}

				// process
				// scenes...................................................//
				// Note: process scenes last! Since it triggers a re-rendering
				// everything should be updated before
				if (dat.SAPVB.Scenes) {
					if (!this.mVBIContext["m_SceneManager"]) {
						this.mVBIContext["m_SceneManager"] = new VBI.SceneManager();
					}
					this.mVBIContext["m_SceneManager"].load(dat.SAPVB.Scenes, this.mVBIContext);
					bModifiedScenes = true;
				}

			}

			// notify framework about data
			// modifications...........................//
			if (bModifiedData) {
				if (this.mVBIContext["m_Windows"]) {
					this.mVBIContext["m_Windows"].NotifyDataChange();
				}
			}

			// control context is loaded
			if (bModifiedScenes || bModifiedWindows) {
				if (this.mVBIContext["m_Windows"]) {
					this.mVBIContext["m_Windows"].Awake(sOverlayId);
				}
			}

			if (bModifiedScenes || bModifiedData) {
				if (this.mVBIContext["m_Windows"]) {
					this.mVBIContext["m_Windows"].RenderAsync();
				}
			}
		}
	};

	Overlay.prototype._openContextMenu = function(sTyp, oInst, oMenu) {
		if (oMenu && oMenu.vbi_data && oMenu.vbi_data.VBIName == "DynContextMenu") {
			if (!this.mVBIContext["m_Menus"]) {
				this.mVBIContext["m_Menus"] = new window.VBI.Menus();
			}
			// add additional menu items
			for (var nI = 0; nI < this.mAddMenuItems.length; ++nI) {
				oMenu.addItem(this.mAddMenuItems[nI]);
			}
			this.mVBIContext.m_Menus.m_menus.push(oMenu);
			this._loadHtml({
				"SAPVB": {
					"version": "2.0",
					"Automation": {
						"Call": {
							"earliest": "0",
							"handler": "CONTEXTMENUHANDLER",
							"instance": oInst.sId,
							"name": "SHOW",
							"object": sTyp,
							"refID": "CTM",
							"Param": [
								{
									"name": "x",
									"#": oInst.mClickPos[0]
								}, {
									"name": "y",
									"#": oInst.mClickPos[1]
								}, {
									"name": "scene",
									"#": "MainScene"
								}
							]
						}
					}
				}
			});
		}
		this.mAddMenuItems = [];
	};

	Overlay.prototype._update = function() {
		// set the frame
		// application..............................................//
		var oApp = {
			SAPVB: {}
		};

		// update the scene
		// data.....................................................//
		if (this.bSceneDirty) {
			this._updateScene(oApp);
		}
		this._updateWindows(oApp);

		// add non VO related actions
		if (oApp.SAPVB.Actions) {
			Array.prototype.push.apply(oApp.SAPVB.Actions.Set.Action, this._getActionArray());
		}

		// remove unnecessary sections and return application
		// JSON...................//
		return this._minimizeApp(oApp);
	};

	Overlay.prototype._minimizeApp = function(oApp) {
		/*
		 * TO DO:
		 * calculate a hash instead of caching the json string
		 */

		// remove windows section when not necessary..............................//
		var t, s;
		// We use the condition variable as a temporary variable to replace the shortcircuits
		var condition;
		s = null;
		if (!this.bWindowsDirty) {
			condition = (t = oApp) && (t = t.SAPVB) && (t = t.Windows) && (s = JSON.stringify(t)) && (s == this.mCurWindows) && (delete oApp.SAPVB.Windows);
			if (!condition) {
				this.mCurWindows = s ? s : this.mCurWindows;
			}
		} else {
			this.bWindowsDirty = false;
		}

		// remove unmodified scenes...............................................//
		s = null;
		condition = (t = oApp) && (t = t.SAPVB) && (t = t.Scenes) && (s = JSON.stringify(t)) && (s == this.mCurScenes) && (delete oApp.SAPVB.Scenes);
		if (!condition) {
			this.mCurScenes = s ? s : this.mCurScenes;
		}

		// remove unmodified actions..............................................//
		s = null;
		condition = (t = oApp) && (t = t.SAPVB) && (t = t.Actions) && (s = JSON.stringify(t)) && (s == this.mCurActions) && (delete oApp.SAPVB.Actions);
		if (!condition) {
			this.mCurActions = s ? s : this.mCurActions;
		}

		// remove unmodified datatypes............................................//
		s = null;
		condition = (t = oApp) && (t = t.SAPVB) && (t = t.DataTypes) && (s = JSON.stringify(t)) && (s == this.mCurDataTypes) && (delete oApp.SAPVB.DataTypes);
		if (!condition) {
			this.mCurDataTypes = s ? s : this.mCurDataTypes;
		}

		// remove unmodified data.................................................//
		if (!this.bForceDataUpdate) {
			s = null;
			condition = (t = oApp) && (t = t.SAPVB) && (t = t.Data) && (s = JSON.stringify(t)) && (s == this.mCurData) && (delete oApp.SAPVB.Data);
			if (!condition) {
				this.mCurData = s ? s : this.mCurData;
			}
		} else {
			this.bForceDataUpdate = false; // reset
		}

		return oApp;
	};

	Overlay.prototype._updateWindows = function(oApp) {
		// Main window -> needs always to be defined
		oApp.SAPVB.Windows = {
			"Set": [
				{
					"name": "Main",
					"Window": {
						"id": "Main",
						"caption": "MainWindow",
						"type": "geo",
						"refParent": "",
						"refScene": "MainScene",
						"modal": "true"
					}
				}
			]
		};
	};

	Overlay.prototype._updateScene = function(oApp) {
		var saVO = []; // visual object array in the scene..................//
		var saData = []; // data array in the data section....................//
		var saType = []; // type array in the type section ...................//
		var saAction = []; // actions...........................................//

		this._updateVOData(saVO, saData, saType, saAction);

		// check if an update of the scene is
		// necessary...........................//
		// failsafe but data has to be created
		// first..............................//
		var _saVO = JSON.stringify(saVO);
		var bMetaUpdate = true; // might be reset in else part
		if (!this.saVO) { // no prior VO data -> initial scene definition
			((((oApp.SAPVB.Scenes = {}).Set = {}).SceneGeo = {
				id: "MainScene",
				scaleVisible: "false",
				navControlVisible: "false",
				VisualFrame: {
					minLOD: 5
				},
				NavigationDisablement: {
					move: "true",
					zoom: "true"
				},
				initialZoom: this.initialZoom.toString(),
				initialStartPosition: "0.5;0.5;0"
			}).VO = saVO);
		} else if (this.bRefMapLayerStackDirty || !(this.saVO === _saVO)) {
			// prior VO data exists -> calculate delta and preserve scene
			(oApp.SAPVB.Scenes = this._getSceneVOdelta(JSON.parse(this.m_saVO), saVO));
		} else {
			bMetaUpdate = false;
		}
		this.saVO = _saVO;

		// now we should have data, data types and instance
		// information...........//
		// merge it into the
		// app..................................................//
		if (this.bDataDeltaUpdate) {
			oApp.SAPVB.Data = [];
			for (var nI = 0; nI < saData.length; ++nI) {
				oApp.SAPVB.Data.push({
					Set: {
						name: saData[nI].name,
						type: "N",
						N: saData[nI]
					}
				});
			}
		} else {
			((oApp.SAPVB.Data = {}).Set = {}).N = saData;
		}
		if (bMetaUpdate) {
			(((oApp.SAPVB.DataTypes = {}).Set = {}).N = saType);
		}
		// Update Actions always, since handler could be added or removed at any time!
		(((oApp.SAPVB.Actions = {}).Set = {}).Action = saAction);

		// reset dirty states
		this.bSceneDirty = this.bVosDirty = this.bDataDeltaUpdate = false;
	};

	Overlay.prototype._isEventRegistered = function(sAggregation, sEvent) {
		var aAggregation = this.getAggregation(sAggregation);
		if (!aAggregation) {
			return false;
		}

		for (var nJ = 0; nJ < aAggregation.length; ++nJ) {
			// get the element.....................................................//
			var oInstance = aAggregation[nJ];

			// if one registers for an event we can return........................//
			if (oInstance.hasListeners(sEvent)) {
				return true;
			}
		}
		return false;
	};

	Overlay.prototype._getTemplateBindingInfo = function(sAggregation) {
		// read binding info to check what is bound and what is static
		var oBindingInfo = this.getBindingInfo(sAggregation);
		if (oBindingInfo && oBindingInfo.template) {
			return oBindingInfo.template.mBindingInfos;
		}
	};

	Overlay.prototype._getBindInfo = function(sAggregation) {
		var oBindInfo = {};
		var oTemplateBindingInfo = this._getTemplateBindingInfo(sAggregation);

		// Note: Without Template no static properties -> all bound in the sense of VB JSON!
		oBindInfo.C = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("color") : true;
		oBindInfo.CB = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("colorBorder") : true;
		oBindInfo.DCH = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("deltaColorHot") : true;
		oBindInfo.CS = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("colorSelect") : true;
		oBindInfo.CNS = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("colorNonSelect") : true;
		oBindInfo.TT = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("tooltip") : true;
		oBindInfo.M = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("changeable") : true;

		oBindInfo.hasTemplate = (oTemplateBindingInfo) ? true : false;

		return oBindInfo;
	};

	Overlay.prototype._updateVOData = function(saVO, saData, saType, saAction) {
		var oBindInfo, oVoTemplate;

		// Overlay Area
		this.AreaBindInfo = oBindInfo = (this.AreaBindInfo) ? this.AreaBindInfo : this._getBindInfo("areas");
		oVoTemplate = (oBindInfo.hasTemplate) ? this.getBindingInfo("areas").template : null;

		// VO Def
		var oOverlayAreaDef = {
			id: "OverlayArea",
			datasource: "OverlayArea",
			type: "{00100000-2012-0004-B001-F311DE491C77}"
		};
		oOverlayAreaDef["posarray.bind"] = oOverlayAreaDef.id + ".P";
		if (oBindInfo.C) {
			oOverlayAreaDef["color.bind"] = oOverlayAreaDef.id + ".C";
		} else {
			oOverlayAreaDef.color = oVoTemplate.getColor();
		}
		if (oBindInfo.CB) {
			oOverlayAreaDef["colorBorder.bind"] = oOverlayAreaDef.id + ".C";
		} else {
			oOverlayAreaDef.colorBorder = oVoTemplate.getColorBorder();
		}
		if (oBindInfo.DCH) {
			oOverlayAreaDef["hotDeltaColor.bind"] = oOverlayAreaDef.id + ".DCH";
		} else {
			oOverlayAreaDef.hotDeltaColor = oVoTemplate.getDeltaColorHot();
		}
		if (oBindInfo.CS) {
			oOverlayAreaDef["colorSelect.bind"] = oOverlayAreaDef.id + ".C";
		} else {
			oOverlayAreaDef.colorSelect = oVoTemplate.getColorSelect();
		}
		if (oBindInfo.CNS) {
			oOverlayAreaDef["colorNonSelect.bind"] = oOverlayAreaDef.id + ".C";
		} else {
			oOverlayAreaDef.colorNonSelect = oVoTemplate.getColorNonSelect();
		}
		if (!oBindInfo.M) {
			oOverlayAreaDef["VB:c"] = oVoTemplate.getChangeable();
		}
		saVO.push(oOverlayAreaDef);

		// Overlay Area Data Type
		var oOverlayAreaType = {
			name: oOverlayAreaDef.id,
			key: "K"
		};
		// extend the object type.................................................//
		oOverlayAreaType.A = [
			{
				"name": "K", // key
				"alias": "K",
				"type": "string"
			}, {
				"name": "VB:s", // selection flag
				"alias": "VB:s",
				"type": "boolean"
			}, {
				"name": "P", // position array
				"alias": "P",
				"type": "vectorarray",
				"changeable": "true"
			}
		];
		if (oBindInfo.C) {
			oOverlayAreaType.A.push({
				"name": "C", // color
				"alias": "C",
				"type": "color"
			});
		}
		if (oBindInfo.CB) {
			oOverlayAreaType.A.push({
				"name": "CB", // color border
				"alias": "CB",
				"type": "string"
			});
		}
		if (oBindInfo.DCH) {
			oOverlayAreaType.A.push({
				"name": "DCH", // delta color hot
				"alias": "DCH",
				"type": "string"
			});
		}
		if (oBindInfo.CS) {
			oOverlayAreaType.A.push({
				"name": "CS", // color select
				"alias": "CS",
				"type": "string"
			});
		}
		if (oBindInfo.CNS) {
			oOverlayAreaType.A.push({
				"name": "CNS", // Color non select
				"alias": "CNS",
				"type": "string"
			});
		}
		if (oBindInfo.TT) {
			oOverlayAreaType.A.push({
				"name": "TT", // tooltip
				"alias": "TT",
				"type": "string"
			});
		}
		saType.push(oOverlayAreaType);

		// Overlay Area Actions
		// check if the different vo events are registered..............................//
		var id = oOverlayAreaDef.id;

		if (this._isEventRegistered("areas", "click")) {
			saAction.push({
				"id": id + "1",
				"name": "click",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "Click",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
		}
		if (this._isEventRegistered("areas", "contextMenu")) {
			saAction.push({
				"id": id + "2",
				"name": "contextMenu",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "ContextMenu"
			});
		}
		if (this._isEventRegistered("areas", "edgeClick")) {
			saAction.push({
				"id": id + "7",
				"name": "edgeClick",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "EdgeClick"
			});
		}
		// register handleMoved in any case for two way binding
		saAction.push({
			"id": id + "4",
			"name": "handleMoved",
			"refScene": "MainScene",
			"refVO": id,
			"refEvent": "HandleMoved"
		});
		// register edge and handle context menu in any case for build in functions
		saAction.push({
			"id": id + "5",
			"name": "handleContextMenu",
			"refScene": "MainScene",
			"refVO": id,
			"refEvent": "HandleContextMenu"
		});
		saAction.push({
			"id": id + "8",
			"name": "edgeContextMenu",
			"refScene": "MainScene",
			"refVO": id,
			"refEvent": "EdgeContextMenu"
		});
		if (this._isEventRegistered("areas", "handleClick")) {
			saAction.push({
				"id": id + "6",
				"name": "handleClick",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "HandleClick"
			});
		}

		// Overlay Area Data
		var oOverlayAreaData = {
			name: oOverlayAreaDef.id,
			E: []
		};
		var aOverlayAreas = this.getAreas();
		for (var nK = 0; nK < aOverlayAreas.length; ++nK) {
			oOverlayAreaData.E.push(aOverlayAreas[nK].getDataElement());
		}
		saData.push(oOverlayAreaData);
	};

	Overlay.prototype._getSceneVOdelta = function(oCurrent, oNew) {
		var aVO = [];
		var aRemove = [];
		// build map of current VOs
		var oVOMap = {};
		for (var nI = 0, len = oCurrent.length; nI < len; ++nI) {
			oVOMap[oCurrent[nI].id] = oCurrent[nI];
		}
		for (var nJ = 0; nJ < oNew.length; ++nJ) {
			if (oVOMap[oNew[nJ].id]) { // VO already exists ...
				if (JSON.stringify(oNew[nJ]) != JSON.stringify(oVOMap[oNew[nJ].id])) { // ...
					// but
					// is
					// different
					aRemove.push({
						"id": oNew[nJ].id,
						"type": "VO"
					}); // remove old VO version from scene and
					aVO.push(oNew[nJ]); // add new VO version
				} // else {} // nothing to do

			} else { // new VO -> add it
				aVO.push(oNew[nJ]);
			}
			delete oVOMap[oNew[nJ].id]; // remove processed VOs from map
		}
		// remove VOs remaining on map
		for (var id in oVOMap) {
			aRemove.push({
				"id": id,
				"type": "VO"
			});
		}
		var retVal = {
			"Merge": {
				"name": "MainScene",
				"type": "SceneGeo",
				"SceneGeo": {
					"id": "MainScene"
				}
			}
		};
		if (aRemove.length) {
			retVal.Merge.SceneGeo.Remove = aRemove;
		}
		if (aVO.length) {
			retVal.Merge.SceneGeo.VO = aVO;
		}

		return retVal;
	};

	Overlay.prototype._getActionArray = function() {
		var aActions = [];
		// subscribe for map event
		// Note: We register Action only if event are subscribed..............................//
		if (this.mEventRegistry["click"]) {
			aActions.push({
				"id": "Overlay1",
				"name": "click",
				"refScene": "MainScene",
				"refVO": "Map",
				"refEvent": "Click",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["contextMenu"]) {
			aActions.push({
				"id": "Overlay2",
				"name": "contextMenu",
				"refScene": "MainScene",
				"refVO": "Map",
				"refEvent": "ContextMenu",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
		}
		aActions.push({
			"id": "Overlay3",
			"name": "GetPosComplete",
			"refScene": "MainScene",
			"refVO": "General",
			"refEvent": "CreateComplete"
		});

		return aActions;
	};

	Overlay.prototype._handleChangedData = function(aNodes) {
		try {
			this.bHandleDataChangeActive = true;
			if (aNodes && aNodes.length) {
				for (var nI = 0, oNode; nI < aNodes.length; ++nI) {
					oNode = aNodes[nI];
					if (oNode.E && oNode.E.length) {
						for (var nJ = 0, oElement, oInst; nJ < oNode.E.length; ++nJ) {
							oElement = oNode.E[nJ];
							oInst = this._findInstance(oElement.K);
							if (oInst) {
								oInst.handleChangedData(oElement);
							}
						}
					}

				}
			}
			this.bHandleDataChangeActive = false;
		} catch (exc) {
			this.bHandleDataChangeActive = false;
			throw exc;
		}
	};

	Overlay.prototype._findInstance = function(sId) {
		var Id = (sId.indexOf(".") !== -1) ? sId.split(".")[1] : sId;
		var aAreas = this.getAreas();
		for (var nI = 0; nI < aAreas.length; ++nI) {
			var oElem = aAreas[nI];
			if (oElem.getId() === Id) {
				return oElem;
			}
		}
		return null;
	};

	Overlay.prototype._handleAggregationEvent = function(event) {
		var oElem;
		if ((oElem = this._findInstance(event.Action.instance))) {
			try {
				oElem.handleEvent(event);
			} catch (exc) {
				Log.error(getResourceBundle().getText(Messages.VIT11.summary), Messages.VIT11.code, "sap.ui.vk.Overlay");
			}
		}

	};

	// ...........................................................................//
	// diagnostics...............................................................//

	Overlay.prototype.isRendered = function() {
		return this.getDomRef() ? true : false;
	};

	// ..........................................................................//
	// Compatibility functions, needed by VBI context
	/**
	 * @param {object} e Event fired by the VBI context.
	 * @private
	 */
	Overlay.prototype.fireSubmit = function(e) {
		// handle VBI submit data
		// analyze the event......................................................//
		var datEvent = JSON.parse(e.data);

		// write changed data back to aggregated elements
		if (datEvent.Data && datEvent.Data.Merge) {
			this._handleChangedData(datEvent.Data.Merge.N);
		}

		// handle actual event
		if (datEvent.Action.object === "OverlayArea") {
			// Event belongs to an aggregated object -> delegate
			this._handleAggregationEvent(datEvent);
		} else {
			// own event -> handle it
			var sActionName = datEvent.Action.name, clickPos;
			if (sActionName === "click" || sActionName === "contextMenu") {
				clickPos = [
					datEvent.Action.Params.Param[0]["#"], datEvent.Action.Params.Param[1]["#"]
				];
			}
			switch (sActionName) {
				case "GetPosComplete":
					// Interactive Position gathering finished
					if (this.mIACreateCB) {
						try {
							this.mIACreateCB(datEvent.Action.Params.Param[0]["#"]);
							this.mIACreateCB = null;
						} catch (exc) {
							// clear callback function in any case
							this.mIACreateCB = null;
							throw exc;
						}
					}
					break;
				case "click":
					// fire the click..................................................//
					this.fireClick({
						clientX: clickPos[0],
						clientY: clickPos[1],
						pos: datEvent.Action.AddActionProperties.AddActionProperty[0]["#"]
					});
					break;
				case "contextMenu":
					// create an empty menu
					if (this.mVBIContext.m_Menus) {
						this.mVBIContext.m_Menus.deleteMenu("DynContextMenu");
					}
					var oMenuObject = new Menu();
					oMenuObject["vbi_data"] = {};
					oMenuObject["vbi_data"].menuRef = "CTM";
					oMenuObject["vbi_data"].VBIName = "DynContextMenu";
					// store the click pos
					this.mClickPos = clickPos;
					// fire the contextMenu..................................................//
					this.fireContextMenu({
						pos: datEvent.Action.AddActionProperties.AddActionProperty[0]["#"],
						menu: oMenuObject
					});
					break;
				default:
					break;

			}
		}
	};
	/**
	 * @param {object} data Object whose only property is the VBI scene canvas element.
	 * @private
	 */
	Overlay.prototype.fireRender = function(data) {
	};
	/**
	 * @param {object} data Object whose only property is the VBI scene canvas element.
	 * @private
	 */
	Overlay.prototype.fireMove = function(data) {
	};
	/**
	 * @param {object} data Object whose only property is the VBI scene canvas element.
	 * @private
	 */
	Overlay.prototype.fireZoom = function(data) {
	};
	/**
	 * @param {object} data Object whose only property is the VBI scene canvas element.
	 * @private
	 */
	Overlay.prototype.fireOpenWindow = function(data) {
	};
	/**
	 * @param {object} data Object whose only property is the VBI scene canvas element.
	 * @private
	 */
	Overlay.prototype.fireCloseWindow = function(data) {
	};

	return Overlay;

});
