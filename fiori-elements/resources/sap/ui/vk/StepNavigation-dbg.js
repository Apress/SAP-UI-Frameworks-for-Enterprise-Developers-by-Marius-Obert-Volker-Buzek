/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.StepNavigation.
sap.ui.define([
	"sap/ui/core/Control",
	"./library",
	"./Core",
	"./Messages",
	"./DvlException",
	"./ContentConnector",
	"./StepNavigationRenderer",
	"./dvl/GraphicsCoreApi",
	"./dvl/getPointer",
	"./dvl/getJSONObject",
	"./dvl/Scene",
	"./getResourceBundle",
	"sap/base/Log",
	"sap/ui/core/Core"
], function(
	Control,
	vkLibrary,
	vkCore,
	Messages,
	DvlException,
	ContentConnector,
	StepNavigationRenderer,
	GraphicsCoreApi,
	getPointer,
	getJSONObject,
	DvlScene,
	getResourceBundle,
	Log,
	core
) {
	"use strict";

	/**
	 *  Constructor for a new StepNavigation.
	 *
	 * @class
	 * Enables capabilities for navigating and activating procedures and steps contained in a single 3D scene.
	 *
	 * @param {string} [sId] ID for the new control. This ID is generated automatically if no ID is provided.
	 * @param {object} [mSettings] Initial settings for the new Step Navigation control.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.StepNavigation
	 * @deprecated Since version 1.72.0.
	 * @since 1.32.0
	 */
	var StepNavigation = Control.extend("sap.ui.vk.StepNavigation", /** @lends sap.ui.vk.StepNavigation.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Managed settings and properties for Step Navigation events.
				 */
				settings: "object",

				/**
				 * Width of the Step Navigation control.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "100%"
				},

				/**
				 * Height of the Step Navigation control.
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "100%"
				},

				/**
				 * Indicates that the Step Navigation control should display thumbnails.
				 * If set to <code>true</code>, then thumbnails are rendered. If set to <code>false</code>, then thumbnails are hidden.
				 */
				showThumbnails: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},

				/**
				 * Indicates that the Step Navigation control should display a toolbar.
				 * If set to <code>true</code>, then the toolbar is rendered. If set to <code>false</code>, then the toolbar is hidden.
				 */
				showToolbar: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},

				/**
				 * Indicates that the Step Navigation control should display a popup containing information around the step that is playing.
				 * If set to <code>true</code>, then the popup is rendered. If set to <code>false</code>, the popup is hidden.
				 */
				showStepInfo: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				}
			},

			publicMethods: [
				"setScene",
				"playStep",
				"pauseStep",
				"playAllSteps",
				"getStep",
				"getNextStep",
				"getPreviousStep",
				"getProceduresAndSteps",
				"refresh",
				"clear"
			],

			associations: {
				contentConnector: {
					type: "sap.ui.vk.ContentConnector"
				}
			},

			aggregations: {
				/**
				 * Template control for Procedure items.
				 */
				procedureItemTemplate: {
					type: "sap.ui.core.Item",
					multiple: false
				},

				/**
				 * sap.ui.core.Popup used to render step information in a popup.
				 */
				stepInfoPopup: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * sap.m.Toolbar used to render the entire Step Navigation control's content.
				 */
				layout: {
					type: "sap.m.Toolbar",
					multiple: false
				},
				/**
				 * sap.m.ScrollContainer used to render a list of thumbnails for the available steps.
				 */
				thumbnailsContainer: {
					type: "sap.m.ScrollContainer",
					multiple: false
				}
			},

			events: {
				"resize": {
					parameters: {
						oldSize: "object",
						size: "object"
					}
				},

				/**
				 * Raised each time a step starts, changes, or finishes.
				 */
				"stepChanged": {
					parameters: {
						/**
						 * The ID of the rendering client that raised the event.
						 */
						clientId: "object",

						/**
						 * The type of sap.ve.dvl.DVLSTEPEVENT that has been raised; for example, DVLSTEPEVENT_FINISHED, DVLSTEPEVENT_SWITCHED, DVLSTEPEVENT_STARTED, DVLSTEPEVENT_PLAYING.
						 */
						type: "object",

						/**
						 * The ID of the step affected by this stepId event.
						 */
						stepId: "object"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Control.apply(this, arguments);
			vkCore.observeAssociations(this);
		}
	});

	StepNavigation.prototype._onStepEvent = function(parameters) {
		var oSettings = this.getSettings();
		this.instanceSettings.currentStepId = parameters.stepId;
		switch (parameters.type) {
			case sap.ve.dvl.DVLSTEPEVENT.DVLSTEPEVENT_FINISHED:
				oSettings.currentStepFinished = true;
				oSettings.currentStepPaused = false;
				oSettings.playAllActive = false;
				oSettings.isPlaying = false;
				this._togglePlayPause(true);
				break;
			case sap.ve.dvl.DVLSTEPEVENT.DVLSTEPEVENT_SWITCHED: // WARNING
			case sap.ve.dvl.DVLSTEPEVENT.DVLSTEPEVENT_STARTED:
				oSettings.currentStepId = parameters.stepId;
				oSettings.currentStepFinished = false;
				this._highlightStep(parameters.stepId);
				// The user may have attempted to pause the step as it changed.
				// The following attempts to honor the intent by pausing the current step
				if (oSettings.currentStepPaused) {
					this.pauseStep();
				}
				break;
			case sap.ve.dvl.DVLSTEPEVENT.DVLSTEPEVENT_PLAYING:
				if (this.getShowStepInfo() && this.stepMessagePopup && !this.stepMessagePopup.isOpen()) {
					this._highlightStep(parameters.stepId);
				}
				break;
			default:
				Log.error(getResourceBundle().getText(Messages.VIT12.summary), Messages.VIT12.code, "sap.ui.vk.StepNavigation");
		}

		this.fireStepChanged({
			clientId: parameters.clientId,
			type: parameters.type,
			stepId: parameters.stepId
		});
	};

	/**
	 * Attaches a Scene object to the Step Navigation control so that it can access the Scene’s procedures and steps.
	 *
	 * @param {object} scene The Scene object to attach to the Step Navigation control.
	 * @public
	 */
	StepNavigation.prototype.setScene = function(scene) {
		if (this._scene) {
			this.oDvl.Client.detachStepEvent(this._onStepEvent, this);
			this.oDvl = null;
		}

		// temporary fix to prevent crash for non-dvl scene. Need proper fix
		if (scene) {
			var sceneType = scene.getMetadata().getName();
			if (sceneType !== "sap.ui.vk.dvl.Scene") {
				return;
			}
		}

		this._scene = scene;
		this.instanceSettings = {};

		if (this._scene) {
			this.oDvl = scene.getGraphicsCore().getApi(GraphicsCoreApi.LegacyDvl);
			this.oDvl.Client.attachStepEvent(this._onStepEvent, this);
		}

		delete this._procedures;
		var oProcedureList = this.getProcedureList();
		var oSettings = this.getSettings();
		oSettings.reset();
		oProcedureList.unbindItems();
		oProcedureList.setSelectedItem(oProcedureList.getFirstItem()); // oProcedureList.setSelectedItem(null);

		// Destroy the step info popup if it exists
		if (oSettings.stepInfo.stepMessagePopup) {
			if (oSettings.stepInfo.stepMessagePopup.isOpen()) {
				oSettings.stepInfo.stepMessagePopup.close();
			}
			oSettings.stepInfo.stepMessagePopup.destroy();
			oSettings.stepInfo.stepMessagePopup = null;
			this.getShowStepInfoButton().setText(getResourceBundle().getText("STEP_NAV_STEPDESCRIPTIONHEADING"));
		}

		// Get Steps and decide whether to enable/disable controls
		var data = this._getStepThumbnails();
		this.oModel.setData(data);
		this._togglePlayPause(true);
		this._refreshControl();
		this.refresh();
	};

	StepNavigation.prototype.init = function() {
		this._emptyThumbnail = "iVBORw0KGgoAAAANSUhEUgAAAE4AAAA8CAYAAADIQIzXAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDE4LTA2LTA1VDEzOjU1OjAzKzEyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOC0wNi0wNVQxNDowMDo1MCsxMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wNi0wNVQxNDowMDo1MCsxMjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyNGZiYjQ5MS1mNzFkLTRm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";
		if (Control.prototype.init) {
			Control.prototype.init.call(this);
		}

		if (this.getSettings() == undefined) {
			this.setSettings(new this._settings());
		}
		this._scene = null;

		// Create JSON data model
		this.oModel = new sap.ui.model.json.JSONModel();
		this.setModel(this.oModel);

		// Create layout panel
		this._layout = new sap.m.Toolbar({
			design: sap.m.ToolbarDesign.Solid
		});

		// this._layout.addContent();
		this.setAggregation("layout", this._layout);

		if (this.getShowThumbnails()) {
			this._thumbnailsScroller = new sap.m.ScrollContainer(this.getId() + "-scroller", {
				width: "100%",
				horizontal: true,
				vertical: false
			});
			this.setAggregation("thumbnailsContainer", this._thumbnailsScroller);
		}
		// Create the play previous button
		this.playPreviousButton = new sap.m.Button(this.getId() + "-playPreviousButton", {
			type: sap.m.ButtonType.Transparent,
			icon: "sap-icon://slim-arrow-left",
			tooltip: getResourceBundle().getText("STEP_NAV_PREVIOUSSTEPBUTTON"),
			press: function(e) {
				var oSettings = this.getSettings();
				var prevStep = this.getPreviousStep(oSettings.currentProcedureIndex);
				if (prevStep) {
					oSettings.currentStepPaused = false;
					this.playStep(prevStep.id, true, oSettings.playAllActive);
					this._togglePlayPause(false);
				}
			}.bind(this)
		});

		// Create the play next button
		this.playNextButton = new sap.m.Button(this.getId() + "-playNextButton", {
			type: sap.m.ButtonType.Transparent,
			icon: "sap-icon://slim-arrow-right",
			tooltip: getResourceBundle().getText("STEP_NAV_NEXTSTEPBUTTON"),
			press: function(e) {
				var oSettings = this.getSettings();
				var nextStep = this.getNextStep(oSettings.currentProcedureIndex);
				if (nextStep) {
					oSettings.currentStepPaused = false;
					this.playStep(nextStep.id, true, oSettings.playAllActive);
					this._togglePlayPause(false);
				}
			}.bind(this)
		});

		// Create the play next button
		this.playOptionButton = new sap.m.Button(this.getId() + "-playOptionButton", {
			type: sap.m.ButtonType.Transparent,
			icon: "sap-icon://media-play",
			tooltip: getResourceBundle().getText("STEP_NAV_PLAYBUTTON_PLAY"),
			visible: true,
			press: function(e) {
				var key = this.getPlayMenuButton().getSelectedKey(); // e.oSource.getSelectedKey();
				var oSettings = this.getSettings();
				var firstStep = null;
				switch (key) {
					case "0":
						// Play
						if (!oSettings.currentStepId) {
							firstStep = this.getNextStep(oSettings.currentProcedureIndex);
							if (firstStep) {
								oSettings.currentStepId = firstStep.id;
							} else {
								return; // If there is no first step then do nothing
							}

						}
						oSettings.playAllActive = false;
						this.playStep(oSettings.currentStepId, !oSettings.currentStepPaused, oSettings.playAllActive);
						oSettings.isPlaying = true;
						oSettings.currentStepPaused = false;
						this._togglePlayPause(false);
						break;
					case "1":
						oSettings.playAllActive = true;
						oSettings.currentStepPaused = false;
						this.playAllSteps(oSettings.currentProcedureId);
						oSettings.isPlaying = true;
						this._togglePlayPause(false);
						break;
					case "2":
						if (!oSettings.currentStepId) {
							firstStep = this.getNextStep(oSettings.currentProcedureIndex);
							if (firstStep) {
								oSettings.currentStepId = firstStep.id;
							} else {
								return; // If there is no first step then do nothing
							}
						}
						oSettings.playAllActive = true;
						var playFromBeginning = !oSettings.currentStepPaused;
						oSettings.currentStepPaused = false;
						this.playStep(oSettings.currentStepId, playFromBeginning, oSettings.playAllActive);
						oSettings.isPlaying = true;
						this._togglePlayPause(false);
						break;
					default:
						break;
				}
			}.bind(this)
		});


		// Create the procedures dropdown list
		this.procedureList = new sap.m.Select(this.getId() + "-procedureList", {
			tooltip: getResourceBundle().getText("STEP_NAV_PROCEDURESLISTHEADING"),
			selectedKey: "0",
			type: sap.m.SelectType.Default,
			enabled: true,
			width: "30%",
			autoAdjustWidth: true,
			change: function(oControlEvent) {
				// Reset the control info when they change the selected procedure
				var oProcedureList = this.getProcedureList();
				var oSettings = this.getSettings();
				oSettings.currentProcedureIndex = 0; // Set the default to the first procedure
				oSettings.currentProcedureId = this.instanceSettings.currentProcedureId = oProcedureList.getSelectedKey();
				oSettings.currentStepId = this.instanceSettings.currentStepId = null;
				for (var ip = 0; ip < this.oModel.oData.procedures.length; ip++) {
					if (this.oModel.oData.procedures[ip].id == oSettings.currentProcedureId) {
						oSettings.currentProcedureIndex = ip;
						oSettings.currentProcedure = this.oModel.oData.procedures[ip];
						break;
					}
				}

				// Destroy the step info popup if it exists
				if (oSettings.stepInfo.stepMessagePopup) {
					if (oSettings.stepInfo.stepMessagePopup.isOpen()) {
						oSettings.stepInfo.stepMessagePopup.close();
					}
					oSettings.stepInfo.stepMessagePopup.destroy();
					oSettings.stepInfo.stepMessagePopup = null;
				}

				this._refreshItems();
			}.bind(this)
		});

		this.procedureList.addStyleClass("sapVizKitStepNavigationProcedureList");

		// Create the item template for the procedure drop down list
		this.setAggregation("procedureItemTemplate", (
			new sap.ui.core.ListItem()
				.bindProperty("text", "name")
				.bindProperty("key", "id")
				.bindProperty("tooltip", "name")));

		// Create the play menu
		this.playMenuButton = (new sap.m.Select(this.getId() + "-playMenuButtonIcon", {
			selectedKey: "0",
			type: sap.m.SelectType.Default,
			tooltip: getResourceBundle().getText("STEP_NAV_PLAYMENU_PLAYOPTIONS"),
			enabled: true,
			autoAdjustWidth: false,
			items: [
				new sap.ui.core.ListItem({
					key: "0",
					icon: "sap-icon://media-play",
					text: getResourceBundle().getText("STEP_NAV_PLAYMENU_PLAY"),
					tooltip: getResourceBundle().getText("STEP_NAV_PLAYMENU_PLAY")
				}),
				new sap.ui.core.ListItem({
					key: "1",
					icon: "sap-icon://media-play",
					text: getResourceBundle().getText("STEP_NAV_PLAYMENU_PLAYALL"),
					tooltip: getResourceBundle().getText("STEP_NAV_PLAYMENU_PLAYALL")
				}),
				new sap.ui.core.ListItem({
					key: "2",
					icon: "sap-icon://media-play",
					text: getResourceBundle().getText("STEP_NAV_PLAYMENU_PLAYALLREMAINING"),
					tooltip: getResourceBundle().getText("STEP_NAV_PLAYMENU_PLAYALLREMAINING")
				})
			]
		}));

		this.playMenuButton.addStyleClass("sapVizKitStepNavigationPlayOptionsSelect");


		// Create the pause button
		this.pauseButton = new sap.m.Button(this.getId() + "-pauseButton", {
			type: sap.m.ButtonType.Transparent,
			icon: "sap-icon://media-pause",
			visible: false,
			tooltip: getResourceBundle().getText("STEP_NAV_PLAYMENU_PAUSE"),
			press: function(e) {
				var oSettings = this.getSettings();
				this.pauseStep();
				oSettings.currentStepPaused = true;
				oSettings.isPlaying = false;
				this._togglePlayPause(true);
			}.bind(this)
		});

		this.showStepInfoButton = new sap.m.ToggleButton(this.getId() + "-showStepInfoButton", {
			icon: "sap-icon://hide",
			type: sap.m.ButtonType.Transparent,
			pressed: false,
			text: getResourceBundle().getText("STEP_NAV_STEPDESCRIPTIONHEADING"),
			tooltip: getResourceBundle().getText("STEP_NAV_STEPDESCRIPTIONHEADING"),
			press: function(oEvent) {
				var target = oEvent.getSource();
				if (target.getPressed()) {
					this.setShowStepInfo(true);
					target.setIcon("sap-icon://show");
					target.setTooltip(getResourceBundle().getText("STEP_NAV_HIDESTEPDESCRIPTIONBUTTON"));
					var oSettings = this.getSettings();
					if (oSettings.currentStepId) {
						this._highlightStep(oSettings.currentStepId);
					}
				} else {
					this.setShowStepInfo(false);
					target.setIcon("sap-icon://hide");
					target.setTooltip(getResourceBundle().getText("STEP_NAV_SHOWSTEPDESCRIPTIONBUTTON"));
					if (this.stepMessagePopup && this.stepMessagePopup.isOpen()) {
						this.stepMessagePopup.close();
					}
				}
			}.bind(this)
		});


		this._layout.addContent(this.playPreviousButton)
			.addContent(this.playOptionButton)
			.addContent(this.pauseButton)
			.addContent(this.playMenuButton)
			.addContent(this.procedureList)
			.addContent(this.showStepInfoButton)
			.addContent(new sap.m.ToolbarSpacer())
			.addContent(this.playNextButton);
	};


	StepNavigation.prototype.onSetContentConnector = function(contentConnector) {
		contentConnector.attachContentReplaced(this._onContentReplaced, this);
		this._setContent(contentConnector.getContent());
	};

	StepNavigation.prototype.onUnsetContentConnector = function(contentConnector) {
		this._setContent(null);
		contentConnector.detachContentReplaced(this._onContentReplaced, this);
	};

	StepNavigation.prototype._onContentReplaced = function(event) {
		this._setContent(event.getParameter("newContent"));
	};

	StepNavigation.prototype.getScroller = function() {
		return this._thumbnailsScroller;
	};

	StepNavigation.prototype.getProcedureList = function() {
		var id = this.getId() + "-procedureList";
		var ht = this._layout;
		var cnt = core.byId(id);
		return ht.getContent()[ht.indexOfContent(cnt)];
	};

	StepNavigation.prototype.getPlayMenuButton = function() {
		var id = this.getId() + "-playMenuButtonIcon";
		var ht = this._layout;
		var cnt = core.byId(id);
		return ht.getContent()[ht.indexOfContent(cnt)];
	};

	StepNavigation.prototype.getPlayOptionButton = function() {
		var id = this.getId() + "-playOptionButton";
		var ht = this._layout;
		var cnt = core.byId(id);
		return ht.getContent()[ht.indexOfContent(cnt)];
	};

	StepNavigation.prototype.getPauseButton = function() {
		var id = this.getId() + "-pauseButton";
		var ht = this._layout;
		var cnt = core.byId(id);
		return ht.getContent()[ht.indexOfContent(cnt)];
	};

	StepNavigation.prototype.getPlayNextButton = function() {
		var id = this.getId() + "-playNextButton";
		var ht = this._layout;
		var cnt = core.byId(id);
		return ht.getContent()[ht.indexOfContent(cnt)];
	};

	StepNavigation.prototype.getPlayPreviousButton = function() {
		var id = this.getId() + "-playPreviousButton";
		var ht = this._layout;
		var cnt = core.byId(id);
		return ht.getContent()[ht.indexOfContent(cnt)];
	};

	StepNavigation.prototype.getShowStepInfoButton = function() {
		var id = this.getId() + "-showStepInfoButton";
		var ht = this._layout;
		var cnt = core.byId(id);
		return ht.getContent()[ht.indexOfContent(cnt)];
	};

	/**
	 * Control runtime settings (intended as internal/read-only).
	 * @return {object} It returns the control runtime settings.
	 * @private
	 */
	StepNavigation.prototype._settings = function() {
		return {
			enabled: false,
			toggle: {
				addCss: function(key, property, onValue, offValue) {
					if (!this.targets[key]) {
						this.targets[key] = {
							"type": "css",
							"property": property,
							"onValue": onValue,
							"offValue": offValue
						};
					}
				},

				addMethod: function(target, method, onValue, offValue, useJQuery) {
					var key = target.getId();
					if (!this.targets[key]) {
						this.targets[key] = {
							"type": "method",
							"target": target,
							"method": method,
							"onValue": onValue,
							"offValue": offValue,
							"useJQuery": useJQuery
						};
					}
				},

				targets: {}
			},

			currentProcedureIndex: 0,
			currentProcedureId: "",
			currentProcedure: null, // Managed and used by popup step info
			currentStepId: null,
			currentStep: null, // Managed and used by popup step info
			currentStepPaused: false,
			isPlaying: false,
			currentStepFinished: true,
			playAllActive: false,
			showToolbar: true,
			showThumbnails: true,
			portfolioMode: false,
			reset: function() {
				this.currentStep = null;
				this.currentProcedure = null;
				this.currentProcedureIndex = 0;
				this.currentProcedureId = "";
				this.currentStepId = null;
				this.currentStepPaused = false;
				this.currentStepFinished = true;
				this.playAllActive = false;
				this.portfolioMode = false;
			},

			stepInfo: {
				lastTop: null,
				lastLeft: null,
				stepMessagePopup: null,
				openPopup: function(popupTitle, textContent, target, placement) {

					this._customHeaderText = this._customHeaderText || new sap.m.Text({
						width: "100%",
						textAlign: sap.ui.core.TextAlign.Center
					}).addStyleClass("sapVizKitStepNavigationPopoverTitle");
					this._customHeaderText.setText(popupTitle);
					this._customHeaderText.setTooltip(popupTitle);

					// We are creating a custom header for the popup title.
					// If the title is too long, we show only what it fits in the popup,
					// the rest is hidden using ellipsis.
					// If you hover your mouse over the truncated title, a tooltip will be displayed
					// showing the entire title.
					this._customHeader = this._customHeader || new sap.m.Bar({
						contentLeft: [
							this._customHeaderText
						]
					});

					this._textContent = this._textContent || new sap.m.Text({});
					this._textContent.addStyleClass("sapVizKitStepNavigationPopoverContent");
					this._textContent.setText(textContent);

					// If the popup hasn't been created so far,
					// we create a new instance and populate it.
					this.stepMessagePopup = this.stepMessagePopup || new sap.m.ResponsivePopover({
						placement: placement,
						showCloseButton: true,
						verticalScrolling: true,
						contentHeight: "10%",
						contentWidth: "30%",
						content: [
							this._textContent
						],
						customHeader: this._customHeader
					});
					this.stepMessagePopup.addStyleClass("sapVizKitStepNavigationPopoverStepInfo");

					this.stepMessagePopup.openBy(target);
				}
			}
		};
	};

	/**
	 * Rebuilds the content of the Step Navigation control from the current Scene.
	 * @param {object} oScene The scene object to be used.
	 * @return {boolean} Returns <code>true</code> if the content of the Step Navigation control was rebuilt successfully.
	 * @public
	 */
	StepNavigation.prototype.refresh = function(oScene) {
		Log.info("StepNavigation refresh() called.");
		if (this.getVisible() && (this["_getStepThumbnails"] && this._scene != null)) {
			var oProcedureList = this.getProcedureList();
			var oSettings = this.getSettings();
			oSettings.reset();
			oProcedureList.setSelectedItem(oProcedureList.getFirstItem());

			// Get Steps and decide whether to enable/disable controls
			var data = this._getStepThumbnails();

			// Destroy the step info popup if it exists
			if (oSettings.stepInfo.stepMessagePopup) {
				if (oSettings.stepInfo.stepMessagePopup.isOpen()) {
					oSettings.stepInfo.stepMessagePopup.close();
				}
				oSettings.stepInfo.stepMessagePopup.destroy();
				oSettings.stepInfo.stepMessagePopup = null;
			}

			//
			this.oModel.setData(data);
			this._togglePlayPause(true);
			this._refreshControl();
		} else if (this.getVisible()) {
			this._refreshControl();
		}
		return true;
	};

	/**
	 * Clears the content of the Step Navigation control.
	 *
	 * @return {boolean} Returns <code>true</code> if the method was called successfully.
	 * @public
	 */
	StepNavigation.prototype.clear = function() {
		Log.info("StepNavigation clear() called.");
		return true;
	};

	StepNavigation.prototype.onBeforeRendering = function() {
		// **********************************************************************
		// **** CONFIGURE THE DROP DOWN LIST OF PROCEDURES					****
		// **********************************************************************
		if (this.getShowToolbar()) {
			var oProcedureList = this.getProcedureList();
			oProcedureList.setModel(this.oModel);
			var oProcedureItemTemplate = this.getProcedureItemTemplate();
			oProcedureList.bindItems("/procedures", oProcedureItemTemplate);
		}
	};

	StepNavigation.prototype.onAfterRendering = function() {
		// Events like the Toggle Step Info button are causing a re-render. The following workaround
		// ensures that the play/pause button do not get reset to incorrect defaults. This should be handled differently and will be updated in the future.
		var oSettings = this.getSettings();
		this._togglePlayPause(!oSettings.isPlaying);
		if (oSettings.currentStepId) {
			this._highlightStep(oSettings.currentStepId);
		}
	};

	// This delegate is called to set focus on controls that are not rendered yet.
	var deferredFocusDelegate = {
		onAfterRendering: function(event) {
			event.srcControl.focus();
			event.srcControl.removeEventDelegate(this); // Here 'this' equals the delegate itself.
		}
	};

	/**
	 * Toggle Play/Pause button visibility.
	 * @param {boolean} pauseActive Parameter that tells whether the pause is active or not.
	 * @private
	 */
	StepNavigation.prototype._togglePlayPause = function(pauseActive) {
		this.togglePlayPauseActive = true;
		if (this.getSettings().showToolbar) {
			var playOptionButton = this.getPlayOptionButton(),
				pauseButton = this.getPauseButton();
			if (pauseActive) {
				if (core.getCurrentFocusedControlId() === pauseButton.getId()) {
					playOptionButton.addEventDelegate(deferredFocusDelegate); // Do not pass the 'oThis' parameter, so that it would be equal to the delegate itself.
				}
				pauseButton.setVisible(false);
				playOptionButton.setVisible(true);
			} else {
				if (core.getCurrentFocusedControlId() === playOptionButton.getId()) {
					pauseButton.addEventDelegate(deferredFocusDelegate); // Do not pass the 'oThis' parameter, so that it would be equal to the delegate itself.
				}
				playOptionButton.setVisible(false);
				pauseButton.setVisible(true);
			}
		}
	};

	/**
	 * Used internally to refresh and update the controls and their data.
	 *
	 * @private
	 */
	StepNavigation.prototype._refreshControl = function() {

		// temporary fix to prevent crash when scene is not dvl scene
		if (!this.oModel.oData.procedures) {
			return;
		}

		// var that = this;
		var oProcedureList = this.getProcedureList();
		var oProcedureItemTemplate = this.getProcedureItemTemplate();
		var oSettings = this.getSettings();

		// Destroy the step info popup if it exists
		if (oSettings.stepInfo.stepMessagePopup) {
			if (oSettings.stepInfo.stepMessagePopup.isOpen()) {
				oSettings.stepInfo.stepMessagePopup.close();
			}
			oSettings.stepInfo.stepMessagePopup.destroy();
			oSettings.stepInfo.stepMessagePopup = null;
			this.getShowStepInfoButton().setText(getResourceBundle().getText("STEP_NAV_STEPDESCRIPTIONHEADING"));
		}

		oProcedureList.unbindItems();
		if (this.oModel.oData.procedures.length > 0) {
			var first = this.oModel.oData.procedures[0];
			if (this.getShowToolbar()) {
				oProcedureList.bindItems("/procedures", oProcedureItemTemplate);
				oProcedureList.selectedKey = first.id;
				oProcedureList.enabled = true;
			}
			this._refreshItems();
		} else {
			if (this.getShowToolbar()) {
				oProcedureList.bindItems("/procedures", oProcedureItemTemplate);
				oProcedureList.enabled = false;
			}

			if (this.getShowThumbnails()) {
				var oScroller = this.getScroller();
				oScroller.destroyContent();
			}
		}
	};

	/**
	 * Refreshes the step thumbnail list items.
	 *
	 * @private
	 */
	StepNavigation.prototype._refreshItems = function() {
		var that = this;
		var steps = [];
		var oProcedureList = this.getProcedureList();
		var oSettings = that.getSettings();
		var itemLayout = new sap.m.HBox();

		// Get the procedure info
		if (!oSettings.currentProcedure) {
			oSettings.currentProcedure = that.oModel.oData.procedures[oSettings.currentProcedureIndex];
			oProcedureList.setSelectedItem(oProcedureList.getFirstItem());
		}

		if (oSettings.currentProcedureId != "" || that.oModel.oData.procedures.length > 0) {
			if (that.getShowThumbnails()) {
				var oScroller = that.getScroller();
				// Clear the current controller layout
				oScroller.removeAllContent();
				steps = that.oModel.oData.procedures[oSettings.currentProcedureIndex].steps;
				var imagePress = function(ev) {
					oSettings.currentStepPaused = false;
					var cnt = core.byId(ev.getSource().getId());
					that.playStep(cnt.getCustomData()[0].getValue("stepId"));
					oSettings.playAllActive = false;
					that._togglePlayPause(false);
				};

				var imageLoaded = function(event) {
					// Limit image size to 80 pixels per longer side and calculate the shorter side
					var maxSize = 80;
					var img = event.getSource();
					var imgWidth = img.getDomRef().width;
					var imgHeight = img.getDomRef().height;
					var imgAspectRatio = imgWidth / imgHeight;
					if (imgWidth > imgHeight) {
						img.setWidth(maxSize + "px");
						img.setHeight(maxSize / imgAspectRatio + "px");
					} else {
						img.setHeight(maxSize + "px");
						img.setWidth(maxSize * imgAspectRatio + "px");
					}
				};

				for (var i = 0; i < steps.length; i++) {
					var img = new sap.m.Image({
						alt: steps[i].name,
						src: "data:image/" + steps[i].thumbnailType + ";base64," + steps[i].thumbnailData,
						densityAware: false,
						tooltip: steps[i].name,
						press: imagePress.bind(that),
						load: imageLoaded,
						layoutData: new sap.m.FlexItemData({
							shrinkFactor: 0
						})
					});

					img.data("stepId", steps[i].id); // Use for jQuery to change style - possibly refactor to iterate through sap.m.Image objects instead
					img.addCustomData(new sap.ui.core.CustomData({
						key: "stepId",
						value: steps[i].id
					}));
					img.addStyleClass("sapVizKitStepNavigationStepItem");
					itemLayout.addItem(img);
				}
				oScroller.addContent(itemLayout);
			}
		}
	};

	/**
	 * Calculates the distance between the Step Description button and the top of the DOCUMENT.
	 * If there is enough room, place the pop-up at the top.
	 * If there isn't, place it right under the Step Description button.
	 * @param {object} element The DOM element next to which the popup will be placed.
	 * @return {string} It returns the popup position as a string which will be passed to the popup renderer.
	 * @private
	 */
	StepNavigation.prototype._getPopupPlacement = function(element) {
		var placement = null;
		var yPos = 0;
		while (element) {
			yPos += element.offsetTop;
			element = element.offsetParent;
		}
		if (yPos > 200) {
			placement = sap.m.PlacementType.Top;
		} else {
			placement = sap.m.PlacementType.Bottom;
		}
		return placement;
	};

	/**
	 * It checks if it's necessary to scroll the container which holds
	 * the step thumbnails. We only need to scroll when the selected item is close to the margin.
	 * @param {object} item The currently active step navigation thumbnails item.
	 * @param {object} scroller The thumbnail scroller from the step navigation.
	 * @return {boolean} It returns <code>true</code> or <code>false</code> depending on whether the scrolling is necessary or not.
	 * @private
	 */
	StepNavigation.prototype._isScrollingNecessary = function(item, scroller) {
		var isNecessary;
		// if item or scroller are not defined, it means the step navigation
		// is not rendered so we don't need to do any scrolling.
		if (item && scroller) {
			var itemLeftPosition = jQuery(item).offset().left + jQuery(item).width();
			var totalWidth = jQuery(scroller).width();
			if (itemLeftPosition - jQuery(item).width() < 0) {
				// the thumbnail is too much to the left (thumbnail not fully visible)
				isNecessary = true;
			} else if ((totalWidth - itemLeftPosition) < jQuery(item).width()) {
				// the thumbnail is too much to the right
				isNecessary = true;
			} else {
				// the thumbnail is visible, no scrolling needed
				isNecessary = false;
			}
		} else {
			isNecessary = false;
		}
		return isNecessary;
	};

	/**
	 * It moves the scroller for the step thumbnails container
	 * so we can have the current step in sight.
	 * @param {object} item The item that we need to scroll to.
	 * @param {object} scrollableElement The thumbnail scroller from the step navigation.
	 * @private
	 */
	StepNavigation.prototype._scrollToItem = function(item, scrollableElement) {
		var properties = {},
			originalOffset = jQuery(item).offset(),
			containerScrollLeft = jQuery(scrollableElement).scrollLeft();

		properties.scrollLeft = originalOffset.left + (containerScrollLeft - jQuery(scrollableElement).offset().left);
		properties.scrollLeft -= parseInt(jQuery(item).css("marginLeft"), 10) || 0;
		properties.scrollLeft -= parseInt(jQuery(item).css("borderLeftWidth"), 10) || 0;
		// apply the scrolling effect
		jQuery(scrollableElement).animate(properties, 50);
	};

	/**
	 * Highlights a step - used to indicate that a step has recently played or is playing.
	 * @param {string} stepId The ID of the step that we want to highlight.
	 * @private
	 */
	StepNavigation.prototype._highlightStep = function(stepId) {
		var that = this;
		if (that.getVisible()) {
			var oSettings = that.getSettings();

			// Logic for connecting popup to step changed event
			var stepInfo = that.getStep(0, oSettings.currentProcedureIndex, stepId);
			if (!oSettings.currentProcedure) {
				oSettings.currentProcedure = that.oModel.oData.procedures[that.oSettings.currentProcedureIndex];
			}

			var oShowStepInfoButton = that.getShowStepInfoButton();

			// Placement refers to the Popup position in relation to the Step Description button .
			// It can be "Top" (default) or "Bottom" (in case there isn't enough room at the top.
			var placement;
			var stepDescriptionButton = document.getElementById(oShowStepInfoButton.getId());
			placement = that._getPopupPlacement(stepDescriptionButton);

			// oShowStepInfoButton.setText(title);
			if (that.getShowStepInfo()) {
				oSettings.stepInfo.openPopup.call(this, stepInfo.name, stepInfo.description, oShowStepInfoButton, placement);
			} else if (oSettings.stepInfo.stepMessagePopup && oSettings.stepInfo.stepMessagePopup.isOpen()) {
				oSettings.stepInfo.stepMessagePopup.close();
			}

			// Highlight the selected thumbnail
			if (that.getShowThumbnails()) {
				var oScroller = that.getScroller();
				var oThumbnailItems = oScroller.getContent()[0].getItems();
				for (var i = 0; i < oThumbnailItems.length; i++) {
					if (oThumbnailItems[i].getCustomData()[0].getValue("stepId") == stepId) {
						oThumbnailItems[i].addStyleClass("selected");
						if (that._isScrollingNecessary(oThumbnailItems[i].$()[0], jQuery("#" + oScroller.sId)[0])) {
							that._scrollToItem(oThumbnailItems[i].$()[0], jQuery("#" + oScroller.sId)[0]);
						}
					} else {
						oThumbnailItems[i].removeStyleClass("selected");
					}
				}
			}
		}
	};

	/**
	 * Returns the procedures list with steps for the current scene, and appends base64 data as thumbnailData and an
	 * image type as thumbnailType.
	 *
	 * @return {JSON} <this> For example:
	 * <code>{sceneId : string, hasThumbnails : boolean, "procedures" : [id:string, name: string, steps: [{id: string, name: string, thumbnailData: string, thumbnailType: string}], "portfolios": [] }</code>
	 * @public
	 */
	StepNavigation.prototype.getProceduresAndSteps = function() {
		return this._getStepThumbnails();
	};

	/**
	 * Obtains the procedures and portfolios list for the current scene and appends base64 data as thumbnailData and an
	 * image type as thumbnailType.
	 *
	 * @return {JSON} procs
	 * @private
	 */
	StepNavigation.prototype._getStepThumbnails = function() {

		// This function gets passed as argument to forEach when we iterate
		// through all steps from all procedures and all portfolios.
		var processStepThumbnail = function(sceneId, dvl, step) {
			var thumbDataRaw,
				imgType,
				prefix;

			try {
				// Trying to retrieve the thumbnail image for this particular step from DVL
				var thumbnail = dvl.Scene.RetrieveThumbnail(sceneId, step.id);
				if (thumbnail === sap.ve.dvl.DVLRESULT.NOTFOUND) {
					thumbDataRaw = this._emptyThumbnail;
				} else {
					thumbDataRaw = getPointer(thumbnail);
				}
				// Check the prefix to detect whether this is a PNG or JPG
				prefix = thumbDataRaw.substring(0, 3);
				if (prefix === "iVB") {
					imgType = "png";
				} else {
					imgType = "jpg";
				}

				// Mutating the original step object by assigning the thumbnail information
				// that we retrieved from DVL
				step.thumbnailData = thumbDataRaw;
				step.thumbnailType = imgType;
			} catch (error) {
				// If the code is NOTFOUND, it means the step doesn't have a thumbnail
				if (error.code !== sap.ve.dvl.DVLRESULT.NOTFOUND) {
					Log.error(error.message, error.code, "sap.ui.vk.StepNavigation");
				}
				step.thumbnailData = null;
				step.thumbnailType = null;
			}
		};

		var procs = this._retrieveProcedures();
		if (procs.sceneId != null) {
			// Get thumbnails for procedures
			// Iterating through each step from each procedure
			procs.procedures.forEach(function(procedure) {
				procedure.steps.forEach(processStepThumbnail.bind(this, procs.sceneId, this.oDvl));
			}, this);

			// Get thumbnails for portfolios
			// Iterating through each step from each portfolio
			procs.portfolios.forEach(function(portfolio) {
				portfolio.steps.forEach(processStepThumbnail.bind(this, procs.sceneId, this.oDvl));
			}, this);

			procs.hasThumbnails = true;
		}
		this._procedures = procs;
		return procs;
	};

	/**
	 * Returns or retrieves the list of procedures and portfolios for the current scene.
	 *
	 * @param {string} sceneId ID of the scene from which to retrieve procedures and portfolios.
	 * @return {JSON} procs
	 * @private
	 */
	StepNavigation.prototype._retrieveProcedures = function(sceneId) {
		var that = this;
		var procs = {};
		if (!that._procedures) {
			procs = {
				sceneId: null,
				hasThumbnails: false,
				"procedures": [],
				"portfolios": []
			};
		} else {
			procs = that._procedures;
		}

		if (that._scene && (procs.sceneId != (sceneId || that._scene._dvlSceneRef))) {
			var s = sceneId || that._scene._dvlSceneRef;
			if (s != null) {
				procs = {
					sceneId: null,
					hasThumbnails: false,
					"procedures": [],
					"portfolios": []
				};
				try {
					var ps = getJSONObject(that.oDvl.Scene.RetrieveProcedures(s));
					if (ps != null) {
						procs.hasThumbnails = false;
						procs.sceneId = that._scene._dvlSceneRef;
						procs.procedures = ps.procedures;
						procs.portfolios = ps.portfolios;
					}
				} catch (e) {
					if (!(e instanceof DvlException && e.code === sap.ve.dvl.DVLRESULT.NOTIMPLEMENTED)) {
						throw e;
					}
				}
			}
		}

		return procs;
	};

	/**
	 * Gets a step based on a positive or negative integer, which is used as an index relative to the index of the current step.
	 * An index value of <code>0</code> can be used to retrieve the details of the current step.
	 *
	 * @param {number}
	 *          relIndex Positive or negative integer representing the number to add or subtract from the index of the
	 *          current step to return the desired step; for example, //next 1, current 0, previous -1
	 * @param {number} [procedureIndex] Optional integer representing the index of the target procedure in the procedures list.
	 * @param {string} specificStepId The ID of the step that we want to retrieve.
	 * @return {JSON} step
	 * @public
	 */
	StepNavigation.prototype.getStep = function(relIndex, procedureIndex, specificStepId) {
		var that = this;
		var sc = that.oDvl.Settings.LastLoadedSceneId;
		var step = null;
		if (sc != null) {
			procedureIndex = procedureIndex != null ? procedureIndex : 0;
			var curs = specificStepId ? specificStepId : that.instanceSettings.currentStepId;
			var p = that._retrieveProcedures(sc);
			var curProc = p.procedures[procedureIndex];

			// If current or next step requested with no current step requested then return first
			if (curProc && curProc.steps.length > 0) {
				step = curProc.steps[0];
			} else {
				// If curProc is false, we the function returns null; it means there are no steps.
				// If we don't do this, curProc.steps will throw an exception
				return null;
			}

			if (curs != "") {
				// Look for the current step in the specified procedure return the requested relative step
				for (var si = 0; si < curProc.steps.length; si++) {
					var _s = curProc.steps[si];
					if (_s.id == curs) {
						var x = si + relIndex;
						if (x < curProc.steps.length && x >= 0) {
							step = curProc.steps[x];
						} else {
							step = null;
						}
						break;
					}
				}
			}
		}
		return step;
	};

	/**
	 * Pauses the step that is currently playing.
	 *
	 * @return {void}
	 * @public
	 */
	StepNavigation.prototype.pauseStep = function() {
		var that = this;
		var s = that.oDvl.Settings.LastLoadedSceneId;
		if (s != null) {
			that.oDvl.Scene.PauseCurrentStep(s);
		}
	};

	/**
	 * Gets the total number of steps for a specified procedure, or for all procedures.
	 *
	 * @param {string} [procedureId] An optional ID for a procedure for which to retrieve a count.
	 * If a value for <code>procedureId</code> is specified, then get a count of the steps for the specified procedure.
	 * Otherwise, get the total number of steps in all of the procedures for the Scene.
	 * @return {number} The number of steps for the specified procedure.
	 * @private
	 */
	StepNavigation.prototype._stepCount = function(procedureId) {
		var that = this;
		var sc = that.oDvl.Settings.LastLoadedSceneId;
		var stepCount = 0;
		if (sc != null) {
			var p = that._retrieveProcedures(sc);
			for (var pi = 0; pi < p.procedures.length; pi++) {
				if (p.procedures[pi].id == procedureId) {
					stepCount = p.procedures[pi].steps.length;
					break;
				} else if (procedureId == null) {
					stepCount += p.procedures[pi].steps.length;
				}
			}
		}
		return stepCount;
	};

	/**
	 * Cycles through steps and procedures for the last loaded scene (<code>lastLoadedScene</code>), and returns the step preceding the current step (currentStepId.
	 *
	 * @param {number} [procedureIndex] Optional integer representing the index of the target procedure in the procedures list.
	 * @return {JSON} The step preceding the current step.
	 * @public
	 */
	StepNavigation.prototype.getPreviousStep = function(procedureIndex) {
		var that = this;
		return that.getStep(-1, procedureIndex);
	};

	/**
	 * Cycles through steps and procedures for the lastLoadedScene and returns the step that follows after the currentStepId.
	 *
	 * @param {number} [procedureIndex] Optional integer representing the index of the target procedure in the procedures list.
	 * @return {JSON} The step that follows after the current step.
	 * @public
	 */
	StepNavigation.prototype.getNextStep = function(procedureIndex) {
		var that = this;
		return that.getStep(1, procedureIndex);
	};

	/**
	 * Plays the specified procedure step.
	 *
	 * @param {string} stepId The ID of the procedure step to play.
	 * @param {boolean} fromTheBeginning Default: true If <code>true</code>, tells the Viewer to play the step from the first frame.
	 * @param {boolean} continueToTheNext Default: false If <code>true</code>, tells the Viewer to play the next step in sequence.
	 * @return {void}
	 * @public
	 */
	StepNavigation.prototype.playStep = function(stepId, fromTheBeginning, continueToTheNext) {
		var that = this;
		var s = that.oDvl.Settings.LastLoadedSceneId;
		if (s != null) {
			that.instanceSettings.currentStepId = stepId;

			// call ActivateStep(sceneId, dvlid, fromTheBeginning, continueToTheNext)
			that.oDvl.Scene.ActivateStep(s, stepId, fromTheBeginning != null ? fromTheBeginning : true,
				continueToTheNext != null ? continueToTheNext : false);
		}
	};

	/**
	 * Plays all the steps in the specified procedure.
	 *
	 * @param {string} [procedureId] The ID of the procedure for which to play all steps. If <code>procedureId == null</code>, then only the first step is played.
	 * @return {void}
	 * @public
	 */
	StepNavigation.prototype.playAllSteps = function(procedureId) {
		var that = this;
		var sc = that.oDvl.Settings.LastLoadedSceneId;
		if (sc != null) {
			var ps = that._retrieveProcedures(sc);
			var procedureIndex = 0;
			if (procedureId != null && ps.procedures.length > 1) {
				for (var ip = 0; ip < ps.procedures.length; ip++) {
					if (ps.procedures[ip].id == procedureId) {
						procedureIndex = ip;
						break;
					}
				}
			}

			if (ps.procedures.length > 0) {
				var s = ps.procedures[procedureIndex].steps[0];
				if (s) {
					that.instanceSettings.currentStepId = s.id;
					that.oDvl.Scene.ActivateStep(sc, s.id, true, true);
				}
			}
		}
	};

	/**
	 * Sets a DVL scene obtained as content from the associated content connector.
	 *
	 * @param {sap.ui.vk.dvl.Scene} content New content or <code>null</code>.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	StepNavigation.prototype._setContent = function(content) {
		if (this._bIsBeingDestroyed) { // This is workaround for situation when event is fired on already destroyed object)
			return this;
		}
		var scene = null;
		if (content && content instanceof DvlScene) {
			scene = content;
		}
		this.setScene(scene);
		return this;
	};

	return StepNavigation;
});
