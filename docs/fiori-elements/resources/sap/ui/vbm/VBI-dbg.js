/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
// Provides control sap.ui.vbm.VBI.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/RenderManager",
	"jquery.sap.global",
	"sap/base/Log",
	"./library",
	"./VBIRenderer",
	"./lib/sapvbi",
	"./lib/saputilities", 		// utility functions
	"./lib/sapvbicontext", 		// control context
	"./lib/sapdataprovider",	// data provider
	"./lib/sapresources",		// resources
	"./lib/sapgeomath",			// geo math functions
	"./lib/sapmaplayer",
	"./lib/sapmapprovider",
	"./lib/sapmapmanager",		// map support
	"./lib/sapvoutils",
	"./lib/sapvobase",			// visual objects base and vo implementation
	"./lib/sapevents",			// event subscription
	"./lib/saplabels",			// labels
	"./lib/sappositioning",		// GetPosFrom/// and co
	"./lib/sapscene",			// scene handling, scenes
	"./lib/sapwindow",			// window handling, detail and so on
	"./lib/sapactions",			// actions handling, framework event subscription
	"./lib/sapautomations",
	"./lib/sapgeolocation",
	"./lib/sapgeotool",			// geo tools for VBI namespace
	"./lib/sapscale",
	"./lib/sapnavigation",
	"./lib/sapvbmenu",			// context menu
	"./lib/sapprojection",		// map projection (mercator, linear)
	"./lib/sapvbcluster",		// VO clustering
	"./lib/sapparsing",			// expression evaluation
	"./lib/sapconfig",
	"./lib/saplassotrack",
	"./lib/saprecttrack",
	"./lib/sapheatmap"
], function(Control, RenderManager, jQuery, Log, library, VBIRenderer) {
	"use strict";

	var thisModule = "sap.ui.vbm.VBI";

	VBI.Utilities.GetTransparentImage();

	/**
	 * Constructor for a new VBI.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The VBI control. This is the Visual Business base control, which is mainly intended to communicate directly with the Visual Business
	 *        Backend API in a proprietary JSON format. This control should not be used directly in a client side application. For this the control
	 *        extension <a href="sap.ui.vbm.GeoMap.html">sap.ui.vbm.GeoMap</a> is recommended.<br>
	 *        The main or high level API of the VBI control is made of
	 *        <ul>
	 *        <li>method <i>load</i> for sending JSON to the control for processing, and</li>
	 *        <li>event <i>submit</i> returning a result JSON as parameter data containing actual event information and changed data.</li>
	 *        </ul>
	 *        Further the high level API provides the thumbnail support.<br>
	 *        Additionally the control offers a low level API made of several events, like render, zoom, move and so on, which allow to render
	 *        application specific content directly on the controls canvas.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.VBI
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var VBI1 = Control.extend("sap.ui.vbm.VBI", /** @lends sap.ui.vbm.VBI.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {
				/**
				 * Set the width of the control.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Misc",
					defaultValue: '800px'
				},

				/**
				 * Set the height of the control.
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					group: "Misc",
					defaultValue: '600px'
				},

				/**
				 * @deprecated since version 1.31 This property should not longer be used. Its functionality is covered by method <code>load</code>.
				 */
				config: {
					type: "object",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * When true, the ActiveX plugin version of Visual Business will be used for rendering. For that the plugin needs to be installed on
				 * the client. Default (false) the control renders on canvas.
				 */
				plugin: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Defines whether the rectangular selection mode is active or not
				 */
				rectangularSelection: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Defines whether the lasso selection mode is active or not
				 */
				lassoSelection: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Defines whether the rectangular zoom mode is active or not
				 */
				rectZoom: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				/**
				 * Allow repeating of keyboard events when key is pressed and hold.
				 */
				allowKeyEventRepeat: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},
				/**
				 * Miminum delay between keyboard events. Used to reduce frequency of keyboard events.
				 */
				keyEventDelay: {
					type: "int",
					group: "Behavior",
					defaultValue: 250
				},
				/**
				 * Enable Test for Overlapped Objects for selection and context menu
				 */
				enableOverlappingTest: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},
				/**
				 * Text to be read out for the Control when used in accessibility mode (Screen reader)
				 */
				ariaLabel: {
					type: "string",
					group: "Misc"
				}
			},
			associations: {
				/**
				* Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
				*/
			   ariaDescribedBy : { type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy" },

			   /**
				* Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledBy).
				*/
			   ariaLabelledBy: { type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy" }
			},
			events: {

				/**
				 * High level API. Submit event is raised.
				 */
				submit: {
					parameters: {

						/**
						 * JSON (or possibly XML and case the plugin is used) string describing the delta state of Visual Business and the information
						 * about the event.
						 */
						data: {
							type: "string"
						}
					}
				},

				/**
				 * High level API. ThumbnailClick event is raised.
				 */
				thumbnailClick: {
					parameters: {

						/**
						 * Geo coordinates in format "lon;lat;0"
						 */
						pos: {
							type: "string"
						},

						/**
						 * Level of detail.
						 */
						zoomLevel: {
							type: "int"
						}
					}
				},

				/**
				 * Low level API. Rendering of the canvas content is reqested. This event can be used to do custom rendering into the Visual Business
				 * overlay canvas. This function is not supported in plugin mode.
				 */
				render: {
					parameters: {

						/**
						 * Canvas object to render into.
						 */
						canvas: {
							type: "object"
						}
					}
				},

				/**
				 * Low level API. Tracking mode is set or reset. This function is not supported in plugin mode.
				 */
				changeTrackingMode: {
					parameters: {

						/**
						 * tracking mode to set or reset
						 */
						mode: {
							type: "int"
						},

						/**
						 * set or reset the mode
						 */
						bSet: {
							type: "boolean"
						}

					}
				},

				/**
				 * Low level API. The canvas is zoomed. This function is not supported in plugin mode.
				 */
				zoom: {
					parameters: {

						/**
						 * Canvas object to render into
						 */
						canvas: {
							type: "object"
						}
					}
				},

				/**
				 * Low level API. The canvas was moved. This function is not supported in plugin mode.
				 */
				move: {
					parameters: {

						/**
						 * Canvas object to render into.
						 */
						canvas: {
							type: "object"
						}
					}
				},

				/**
				 * The event is raised before a Visual Business window is opened. It is intended to be used to place arbitrary content in e.g. a
				 * Detail Window. This event is not supported in plugin mode.
				 */
				openWindow: {
					parameters: {

						/**
						 * DomRef of placeholder Div to render into.
						 */
						contentarea: {
							type: "object"
						},

						/**
						 * ID of the window that is opened.
						 */
						id: {
							type: "string"
						}
					}
				},

				/**
				 * The event is raised before a Visual Business window is closed. This function is not supported in plugin mode.
				 */
				closeWindow: {
					parameters: {

						/**
						 * DomRef of placeholder Div for content.
						 */
						contentarea: {
							type: "object"
						},

						/**
						 * ID of the window that is closed.
						 */
						id: {
							type: "string"
						}
					}
				},

				/**
				 * The event is raised when a Visual Business container VO instance is created. It is intended to be used to place arbitrary content
				 * in e.g. other controls. This event is not supported in plugin mode.
				 */
				containerCreated: {
					parameters: {

						/**
						 * DomRef of placeholder Div to render into.
						 */
						contentarea: {
							type: "object"
						},

						/**
						 * ID of the container that was created.
						 */
						id: {
							type: "string"
						}
					}
				},

				/**
				 * The event is raised before a Visual Business container VO instance is destroyed. This function is not supported in plugin mode.
				 */
				containerDestroyed: {
					parameters: {

						/**
						 * DomRef of placeholder Div of content.
						 */
						contentarea: {
							type: "object"
						},

						/**
						 * ID of the container that is destroyed.
						 */
						id: {
							type: "string"
						}
					}
				}
			}
		},

		renderer: VBIRenderer
	});

	// ...........................................................................//
	// This file defines behavior for the control,...............................//
	// ...........................................................................//
	// Map used for storing RichTooltips
	VBI1.RttMap = {};

	VBI1.prototype.exit = function() {
		// create the vbi control context.........................................//
		// alert( "destroy" );
//		this.detachChangeTrackingMode(this.onVBIChangeTrackingMode, this);

		// destroy the vbi control context........................................//
		// or plugin keept resources..............................................//

		if (this.getPlugin()) {
			var pi = this.getPlugInControl();
			if (pi) {
				pi.OnSubmit = null; // unsubscribe event............//
			}
		} else if (this.mVBIContext) {
			this.mVBIContext.clear(); // clear the resources...................//
		}

		if (this.resizeID != "") {
			sap.ui.core.ResizeHandler.deregister(this.resizeID);
			this.resizeID = "";
		}

	};

	VBI1.prototype.resize = function(event) {
		var cntrl = (this.oControl != undefined) ? this.oControl : this;

		var ctx = cntrl.mVBIContext;
		if (ctx) {
			var scene = ctx.GetMainScene();
			if (scene) {
				scene.resizeCanvas(event);
			}
			if (ctx.m_Windows) {
				ctx.m_Windows.NotifyResize();
			}
		}
	};

	VBI1.prototype.init = function() {
		this.m_aLoadQueue = null; // load queue...................//
//		this.attachChangeTrackingMode(this.onVBIChangeTrackingMode, this);
		// create the vbi control context.........................................//
		if (!this.getPlugin()) {
			// just create the context.............................................//
			this.mVBIContext = new VBI.VBIContext(this);
		}
		this.resizeID = "";

		this.m_renderList = [];
	};

	/**
	 * Load application JSON for plugin
	 * @param {string | object} dat Application JSON
	 * @private
	 */
	VBI1.prototype.loadNative = function(dat) {
		var l_vbiId = this.getId();
		var elem = document.getElementById('VBI' + l_vbiId);

		if (!elem) {
			return; // element not found.......................................//
		}
		var sf = function(strVal) {
			// to be compatible with the html version, we skip the root object.....//
			// definition..........................................................//
			try {
				var oD;
				if ((oD = JSON.parse(strVal))) {
					var vb = oD.SAPVB;
					var txt = JSON.stringify(vb, null, '  ');

					// fire the submit..................................................//
					this.fireSubmit({
						data: txt
					});
				}
			} catch (e) {
				if (VBI.m_bTrace) {
					VBI.Trace("Error submitting plugin event");
				}
			}
		};

		if (jQuery.type(dat) == 'object') {
			// input is a json object, convert to sting and load...................//
			var txt = JSON.stringify(dat, null, '  ');
			try {
				elem.Load(txt);
				elem.OnSubmit = sf.bind(this);
			} catch (e) {
				Log.error("Error loading vbiJSON from object", "", thisModule);
			}
		} else if (jQuery.type(dat) == 'string') {
			try {
				elem.Load(dat);
				elem.OnSubmit = sf.bind(this);
			} catch (e) {
				Log.error("Error loading vbiJSON from string", "", thisModule);
			}
		}
	};

	/**
	 * Load application JSON for HTML5 version
	 * @param {string | object} data Application JSON
	 * @private
	 */
	VBI1.prototype.loadHtml = function(data) {
		var l_vbiId = this.getId();

		var dat = null;

		// ensure that data is converted to a json object.........................//
		// when this is a string, due ABAP servers sometimes sets a BOM at the....//
		// beginning of the string we try to skip this............................//
		if (typeof data === 'string') {
			dat = JSON.parse(data.indexOf('{') ? data.substr(data.indexOf('{')) : data);
		} else if (typeof data === 'object') {
			dat = data; // this is already an object
		}
		// return immediately when data can not be interpreted....................//
		if (!dat) {
			return;
		}

		// check for data binding.................................................//
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
		 * do correct handling when change flags get set
		 */
		var bModifiedData = false;
		var bModifiedScenes = false;
		var bModifiedWindows = false;
		var bModifiedResources = false;
		var bModifiedClustering = false;
		var bModifiedMapConfig = false;

		// the data can be a json object..........................................//
		if (jQuery.type(dat) === 'object') {
			if (dat.SAPVB) {
				// process configuration ...........................................//
				if (dat.SAPVB.Config) {
					// load the configuraiont .......................................//
					this.mVBIContext.GetConfig().load(dat.SAPVB.Config, this.mVBIContext);
				}
				// process resources................................................//
				if (dat.SAPVB.Resources) {
					// load the resources............................................//
					this.mVBIContext.GetResources().load(dat.SAPVB.Resources, this.mVBIContext);
					bModifiedResources = true;
				}
				// process datatypes................................................//
				if (dat.SAPVB.DataTypes) {
					// load the datatype provider....................................//
					if (!this.mVBIContext.m_DataTypeProvider) {
						this.mVBIContext.m_DataTypeProvider = new VBI.DataTypeProvider();
					}

					this.mVBIContext.m_DataTypeProvider.load(dat.SAPVB.DataTypes, this.mVBIContext);
				}
				// process datacontext..............................................//
				if (dat.SAPVB.Data) {
					// load the datacontext..........................................//
					// when the datacontext is loaded, provide the datatype info.....//
					if (!this.mVBIContext.m_DataProvider) {
						this.mVBIContext.m_DataProvider = new VBI.DataProvider();
					}

					this.mVBIContext.m_DataProvider.load(dat.SAPVB.Data, this.mVBIContext);
					bModifiedData = true;
				}
				// process mapproviders.............................................//
				if (dat.SAPVB.MapProviders) {
					// load the mapproviders.........................................//
					if (!this.mVBIContext.m_MapProviders) {
						this.mVBIContext.m_MapProviders = new VBI.MapProviders();
					}
					this.mVBIContext.m_MapProviders.load(dat.SAPVB.MapProviders, this.mVBIContext);
					bModifiedMapConfig = true;
				}
				// process maplayerstacks...........................................//
				if (dat.SAPVB.MapLayerStacks) {
					// load the mapproviders.........................................//
					if (!this.mVBIContext.m_MapLayerStackManager) {
						this.mVBIContext.m_MapLayerStackManager = new VBI.MapLayerStackManager(this.mVBIContext);
					}
					this.mVBIContext.m_MapLayerStackManager.load(dat.SAPVB.MapLayerStacks, this.mVBIContext);
					bModifiedMapConfig = true;
				}
				// process windows..................................................//
				if (dat.SAPVB.Windows) {
					if (!this.mVBIContext.m_Windows) {
						this.mVBIContext.m_Windows = new VBI.Windows();
					}
					this.mVBIContext.m_Windows.load(dat.SAPVB.Windows, this.mVBIContext);
					bModifiedWindows = true;
				}
				// process actions..................................................//
				if (dat.SAPVB.Actions) {
					if (!this.mVBIContext.m_Actions) {
						this.mVBIContext.m_Actions = new VBI.Actions();
					}
					this.mVBIContext.m_Actions.load(dat.SAPVB.Actions, this.mVBIContext);
				}
				// process automations..............................................//
				if (dat.SAPVB.Automation) {
					if (!this.mVBIContext.m_Automations) {
						this.mVBIContext.m_Automations = new VBI.Automations();
					}
					this.mVBIContext.m_Automations.load(dat.SAPVB.Automation, this.mVBIContext);
				}
				// context menues ..................................................//
				if (dat.SAPVB.Menus) {
					if (!this.mVBIContext.m_Menus) {
						this.mVBIContext.m_Menus = new VBI.Menus();
					}
					this.mVBIContext.m_Menus.load(dat.SAPVB.Menus, this.mVBIContext);
				}
				// clustering definition............................................//

				if (dat.SAPVB.Clustering) {
					if (!this.mVBIContext.m_Clustering) {
						this.mVBIContext.m_Clustering = new VBI.Clustering();
					}
					this.mVBIContext.m_Clustering.load(dat.SAPVB.Clustering, this.mVBIContext);
					bModifiedClustering = true;
				}

				// process scenes...................................................//
				// Note: process scenes last! Since it triggers a re-rendering everything should be updated before
				if (dat.SAPVB.Scenes) {
					if (!this.mVBIContext.m_SceneManager) {
						this.mVBIContext.m_SceneManager = new VBI.SceneManager();
					}
					this.mVBIContext.m_SceneManager.load(dat.SAPVB.Scenes, this.mVBIContext);
					bModifiedScenes = true;
				} else if (bModifiedMapConfig) {
					// update GeoScenes only, to refresh internal variables
					var scenes = this.mVBIContext.m_SceneManager.m_SceneArray;
					for (var i = 0; i < scenes.length; ++i) {
						if (scenes[i].RefreshMapLayerStack) {
							scenes[i].RefreshMapLayerStack();
						}
					}
				}
			}

			// notify framework about data modifications...........................//
			if (bModifiedData) {
				if (this.mVBIContext.m_Windows) {
					this.mVBIContext.m_Windows.NotifyDataChange();
				}
			}

			// control context is loaded
			if (bModifiedScenes || bModifiedWindows) {
				if (this.mVBIContext.m_Windows) {
					this.mVBIContext.m_Windows.Awake(l_vbiId);
				}
			}

			if (bModifiedScenes || bModifiedData || bModifiedClustering || bModifiedResources) {
				if (this.mVBIContext.m_Windows) {
					this.mVBIContext.m_Windows.RenderAsync();
				}
			}
		}
	};

	// high level function interface implementation..............................//
	// interface function implementation.........................................//

	/**
	 * High level load function. The function accepts a json string or an already parsed json object. This can be a Visual Business application, any
	 * delta operations on the application or other hierachical data that can be mapped by the Visual Business data provider to the inner Visual
	 * Business data context.
	 *
	 * @param {string} dat Application JSON to process
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.load = function(dat) {
		// If no data is passed to the load function then do nothing.
		if (!dat) {
			return;
		}

		// when the control is not yet rendered, queue the load calls.............//
		if (!this.isRendered()) {
			// create the queue and push load requests.............................//
			if (!this.m_aLoadQueue) {
				this.m_aLoadQueue = [];
			}

			/**
			 * Scene settings can take effect broadly in three phases
			 * 	- Before initialization
			 *  - After initialization but before rendering
			 *  - After rendering
			 *
			 * The verb SceneGeo.Set usually indicates settings used at the time of initialization.
			 * The verb SceneGeo.Merge indicates updation of settings of an already initialized screen.
			 *
			 * For scene settings as CenterPosition and Zoom, dependending upon whether they are being set before or after rendering,
			 * different APIs are to be used.
			 *
			 * However, for some settings like InitialStartPosition and InitialZoom, if they are being set before rendering, they can be SET
			 * only at the time of initialization and they cannot be updated(MERGED). But this is now valid use case with Adapter.
			 *
			 * If the map isn't rendered yet loadQueue will still contain the entry for setting the InitialStartPosition and InitialZoom (with
			 * probably default values). If a SceneGeo.Merge is received with valid values for InitialStartPosition and InitialZoom, the
			 * the below searches for the already present entry with default values and updates them so that when the scene is initialized,
			 * it is initialized with the non-default values. BUT THIS SHOULD HAPPEN ONLY BEFORE THE FIRST RENDER.
			 *
			 * There shouldn't be an else block to this since entry should still be pushed into the LoadQueue - for it is known for sure that
			 * Merge.SceneGeo.initialStartPosition and Merge.SceneGeo.initialZoom are simply ignored. However, there could be other attributes that
			 * would need to be continued to be handled the way they were being handled.
			 */
			if (dat.SAPVB && dat.SAPVB.Scenes && dat.SAPVB.Scenes.Merge && dat.SAPVB.Scenes.Merge.SceneGeo) {
				var pos = dat.SAPVB.Scenes.Merge.SceneGeo.initialStartPosition;
				var zoom = dat.SAPVB.Scenes.Merge.SceneGeo.initialZoom;

				if (pos || zoom) {
					var arr = this.m_aLoadQueue;
					for (var i = 0; i < arr.length; ++i) {
						if (arr[i].SAPVB && arr[i].SAPVB.Scenes && arr[i].SAPVB.Scenes.Set && arr[i].SAPVB.Scenes.Set.SceneGeo) {
							var el = arr[i].SAPVB.Scenes.Set.SceneGeo;
							el.initialStartPosition = pos || el.initialStartPosition;
							el.initialZoom = zoom || el.initialZoom;
							break;
						}
					}
				}
			}

			this.m_aLoadQueue.push(dat);
			return;
		}

		// do processing when running as a plugin.................................//
		if (this.getPlugin()) {
			this.loadNative(dat);
		} else {
			this.loadHtml(dat);
		}

		if (this.resizeID == "" && this.mVBIContext.GetMainScene()) {
			this.resize();
			this.resizeID = sap.ui.core.ResizeHandler.register(this, this.resize);
		}
	};

	/**
	 * Returns a Screenshot of the Overlay. Please note that the map cannot be included due to browser restrictions. Function returns the visible part
	 * of the Canvas excluding map, copyright info, navigation control, scaler, legend, detail windows, container elements. Analytic Maps are returned
	 * as they are not treated as "maps" internally. Modes 2 & 3 are experimental, trying to load the map (this may work on inhouse servers with
	 * adapted settings, standard configurations should fail)
	 *
	 * @param {int} [iMode] 0: Overlay only; 1 (default) and 3: include Labels; 2 and 3: try to include maps (will return "" if not possible)
	 * @returns {string} Base64 encoded picture (PNG format) on success, "" otherwise
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.getPicOfOverlay = function(iMode) {

		var scene = this.mVBIContext.GetMainScene();
		if (!(scene && scene.GetOverlayPicture)) {
			return "";
		}
		return scene.GetOverlayPicture(iMode);
	};

	/**
	 * Minimize to Thumbnail.
	 *
	 * @param {int} iNewWidth Width of the thumbnail
	 * @param {int} iNewHeight Height of the thumbnail
	 * @param {int} [iFullWidth] Width of the underlying VBI control. If ommitted or zero, current width is taken
	 * @param {int} [iFullHeight] Height of the underlying control. If ommitted or zero, current width is taken
	 * @param {string} [font] Font to be used for text added to the thumbnail
	 * @param {string} [fontCol] Color for the thumbnailtext
	 * @param {int} [fontPos] Position (0 - 8) of the text within the thumbnail
	 * @param {string} [text] text to be shown
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.minimize = function(iNewWidth, iNewHeight, iFullWidth, iFullHeight, font, fontCol, fontPos, text) {
		var vbictx = this.mVBIContext;
		if (!vbictx.moThumbnail) {
			vbictx.moThumbnail = {
				bThumbnailed: false
			};
		}
		var thb = vbictx.moThumbnail;
		thb.nThumbWidth = iNewWidth;
		thb.nThumbHeight = iNewHeight;
		thb.strFont = font;
		thb.strCol = fontCol;
		thb.nFontPos = fontPos;
		thb.strText = text;
		if (iFullWidth) {
			thb.nFullWidth = iFullWidth;
		}
		if (iFullHeight) {
			thb.nFullHeight = iFullHeight;
		}
		var scene = vbictx.GetMainScene();
		if (scene) {
			vbictx.DoMinimize(scene);
		}
	};

	/**
	 * Maximize from Thumbnail.
	 *
	 * @param {int} [iFullWidth] Width of the underlying VBI control. If ommitted current width is taken
	 * @param {int} [iFullHeight] Height of the underlying control. If ommitted current width is taken
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.maximize = function(iFullWidth, iFullHeight) {

		var scene = this.mVBIContext.GetMainScene();
		if (scene && this.mVBIContext.moThumbnail) {
			var newWidth, newHeight;
			if (iFullWidth) {
				newWidth = String(iFullWidth) + "px";
			} else {
				newWidth = this.mVBIContext.moThumbnail.strOrgWidth ? this.mVBIContext.moThumbnail.strOrgWidth : this.getWidth();
			}
			if (iFullHeight) {
				newHeight = String(iFullHeight) + "px";
			} else {
				newHeight = this.mVBIContext.moThumbnail.strOrgHeight ? this.mVBIContext.moThumbnail.strOrgHeight : this.getHeight();
			}
			this.mVBIContext.m_bThumbnail = false;

			this.setWidth(newWidth);
			this.setHeight(newHeight);
			scene.m_Ctx.moThumbnail = undefined;

			// we trigger resizing always as we cannot rely on Resize Handler as the size might not change
			scene.resizeCanvas(0);
		}
	};

	/**
	 * Zoom to one or multiple geo positions. This function works only for the main geo scene in the Visual Business control.
	 *
	 * @param {float} fLon Longitude in degrees. This can also be an array of longitude values.
	 * @param {float} fLat Latitude in degrees. This can also be an array of latitude values.
	 * @param {int} iLod Level of detail, usually between 0 and 20. This will be limited by the map provider capabilities.
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.zoomToGeoPosition = function(fLon, fLat, iLod) {
		// the project must be loaded already
		var scene = null;
		if ((scene = this.mVBIContext.GetMainScene())) {
			if (jQuery.type(fLon) == 'array' && jQuery.type(fLat) == 'array') {
				if (fLon.length > 1 && fLat.length > 1) {
					scene.ZoomToMultiplePositions(fLon, fLat);
				} else {
					scene.ZoomToGeoPosition(VBI.MathLib.DegToRad([
						parseFloat(fLon[0]), parseFloat(fLat[0])
					]), parseFloat(iLod));
				}
			} else {
				scene.ZoomToGeoPosition(VBI.MathLib.DegToRad([
					parseFloat(fLon), parseFloat(fLat)
				]), parseFloat(iLod));
			}
		}
	};

	/**
	 * Zoom to one or multiple Areas. This function works only for the main geo scene in the Visual Business control.
	 *
	 * @param {array} aAreaList List of Area Ids to zoom to.
	 * @param {float} corr . This correction factor deals with the space which is reserved to the div borders. The Correction factor can be expressed
	 *        either in a fracture (e.g. 0.9, this means 10% space to the borders) or array of pixel values (order left, top, right, bottom) for the
	 *        added margin of the calculated zoom area, e.g. [450,150,0,0] which keeps a left border of 450 pixels and a top border of 150 pixels.
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.zoomToAreas = function(aAreaList, corr) {
		// the project must be loaded already
		var scene = null;
		if ((scene = this.mVBIContext.GetMainScene())) {
			scene.ZoomToAreas(aAreaList, corr);
		}
	};

	/**
	 * Retrieve information on a specific cluster object.
	 *
	 * Type :
	 * <ul>
	 * <li>0 : contained VOs</li>
	 * <li>1 : child clusters (tree clustering only)</li>
	 * <li>2 : parent Node (tree clustering only)</li>
	 * <li>10 : Information on Node</li>
	 * <li>11 : Edges of the Voronoi Area (tree clustering only, not merged with rectangle)</li>
	 * </ul>
	 *
	 * @param {string} sIdent Cluster Id
	 * @param {sap.ui.vbm.ClusterInfoType} iType Type of information which should be returned
	 * @returns {Object} Cluster Info Object with requested info according to given Cluster Info Type
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.getInfoForCluster = function(sIdent, iType) {
		var scene = null;
		if ((scene = this.mVBIContext.GetMainScene())) {
			return scene.getInfoForCluster(sIdent, iType);
		}
		return null;
	};


	/**
	 * Set Tracking Mode for Rectangular Selection on/off.
	 *
	 * @param { boolean	} bSet to start or stop tracking mode
	 * @returns {sap.ui.vbm.VBI} This allows method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.setRectangularSelection = function(bSet) {
		var scene = this.mVBIContext.GetMainScene();
		if (scene) {
			if (!(bSet && scene.m_nInputMode == window.VBI.InputModeRectSelect)) {
				scene.endTrackingMode();
				if (bSet) {
					this.setProperty("lassoSelection", false, /* bSuppressInvalidate= */true);
					this.setProperty("rectZoom", false, /* bSuppressInvalidate= */true);
					new scene.RectSelection();
					scene.m_Ctx.onChangeTrackingMode(VBI.InputModeRectSelect, true);
				}
			}
		}
		this.setProperty("rectangularSelection", bSet, /* bSuppressInvalidate= */true);
		return this;
	};

	/**
	 * Set Tracking Mode for Lasso Selection on/off.
	 *
	 * @param {boolean} bSet to start or stop tracking mode
	 * @returns {sap.ui.vbm.VBI} This allows method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.setLassoSelection = function(bSet) {
		var scene = this.mVBIContext.GetMainScene();
		if (scene) {
			if (!(bSet && scene.m_nInputMode == window.VBI.InputModeLassoSelect)) {
				scene.endTrackingMode();
				if (bSet) {
					this.setProperty("rectangularSelection", false, /* bSuppressInvalidate= */true);
					this.setProperty("rectZoom", false, /* bSuppressInvalidate= */true);
					new scene.LassoSelection();
					scene.m_Ctx.onChangeTrackingMode(VBI.InputModeLassoSelect, true);
				}
			}
		}
		this.setProperty("lassoSelection", bSet, /* bSuppressInvalidate= */true);
		return this;
	};

	/**
	 * Set Tracking Mode for Rectangular Zoom on/off.
	 *
	 * @param {boolean} bSet to start or stop tracking mode
	 * @returns {sap.ui.vbm.VBI} This allows method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.setRectZoom = function(bSet) {
		var scene = this.mVBIContext.GetMainScene();
		if (scene) {
			if (!(bSet && scene.m_nInputMode == window.VBI.InputModeRectZoom)) {
				scene.endTrackingMode();
				if (bSet) {
					this.setProperty("lassoSelection", false, /* bSuppressInvalidate= */true);
					this.setProperty("rectangularSelection", false, /* bSuppressInvalidate= */true);
					new scene.RectangularZoom();
					scene.m_Ctx.onChangeTrackingMode(VBI.InputModeRectZoom, true);
				}
			}
		}
		this.setProperty("rectZoom", bSet, /* bSuppressInvalidate= */true);
		return this;
	};

	// ...........................................................................//
	// once VBI control is rendered, we attach navigation bar and map it self....//

	VBI1.prototype.onAfterRendering = function() {

		// when there is preserved content restore it.............................//
		if (this.$oldContent.length > 0) {
			// insert preserved control DOM content
			this.$().append(this.$oldContent);
		}

		// process the load queue.................................................//
		if (this.m_aLoadQueue) {
			var nJ;
			for (nJ = 0; nJ < this.m_aLoadQueue.length; ++nJ) {
				this.load(this.m_aLoadQueue[nJ]);
			}
			this.m_aLoadQueue = null;
		}

		if (this.resizeID == "" && this.mVBIContext.GetMainScene()) {
			this.resize();
			this.resizeID = sap.ui.core.ResizeHandler.register(this, this.resize);
		}

		// do a new adjust of DOM placed elements.................................//
		// the function should do nothing if nothing needs to be done.............//
		var l_vbiId = this.getId();
		if (this.mVBIContext.m_Windows) {
			this.mVBIContext.m_Windows.Awake(l_vbiId);
		}

		// move elements from hidden area to there final location
		var aElems = jQuery(this.getDomRef()).children(".vbi-hidden").children();
		for (var i = 0, oEntry; i < aElems.length; ++i) {
			oEntry = aElems[i];
			// Note: We cannot use a jQuery selector, since it fails with the artifical ID for cluster objects
			// jQuery("#" + oEntry.attributes.getNamedItem("data").nodeValue).append(oEntry.firstChild);
			var oDomref = document.getElementById(oEntry.attributes.getNamedItem("data").nodeValue);
			if (oDomref) {
				if (oEntry.firstChild) {
					oDomref.appendChild(oEntry.firstChild);
				}
				oEntry.parentNode.removeChild(oEntry);
			}

		}
	};

	VBI1.prototype.onBeforeRendering = function() {
		// this is called before the renderer is called...........................//
		// make sure to preserve the content if not preserved yet
		var oDomRef = this.getDomRef();
		if (oDomRef && !RenderManager.isPreservedContent(oDomRef)) {
			RenderManager.preserveContent(oDomRef, true, false);
		}
		this.$oldContent = RenderManager.findPreservedContent(this.getId());
	};

	// ...........................................................................//
	// diagnostics...............................................................//

	VBI1.prototype.isRendered = function() {
		return this.getDomRef() ? true : false;
	};

	// ...........................................................................//
	// helpers...................................................................//

	VBI1.prototype.getPlugInControl = function() {
		var l_vbiId = this.getId();
		var elem = document.getElementById('VBI' + l_vbiId);
		return elem ? elem : null;
	};

	// ...........................................................................//
	// re implement property setters.............................................//

	VBI1.prototype.setConfig = function(config) {
		if (config) {
			// just call the load function............................................//
			// this will execute once and discard the config..........................//
			return this.load(config);
		}
	};

	VBI1.prototype.setWidth = function(val) {
		if (typeof val === 'number') {
			this.setProperty("width", parseInt(val, 10).toString() + "px");
		} else {
			this.setProperty("width", val);
		}
	};

	VBI1.prototype.setHeight = function(val) {
		if (typeof val === 'number') {
			this.setProperty("height", parseInt(val, 10).toString() + "px");
		} else {
			this.setProperty("height", val);
		}
	};

	/**
	 * Add dependant child control for rendering.
	 *
	 * @param {object} oControl Child control to render
	 * @param {string} targetElemId ID of DOM element the child to append to
	 * @protected
	 */
	VBI1.prototype.addRenderItem = function(oControl, targetElemId) {
		this.m_renderList.push({
			control: oControl,
			data: targetElemId
		});
		this.invalidate();
	};

	return VBI1;

});
