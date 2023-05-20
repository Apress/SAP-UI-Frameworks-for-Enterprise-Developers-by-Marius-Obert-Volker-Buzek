/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */

sap.ui.define([
	"sap/ui/thirdparty/hasher",
	"sap/ui/core/BusyIndicator",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/BaseRTAPluginStatus",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils"
], function (
	hasher,
	BusyIndicator,
	PluginStatus,
	AppLifeCycleUtils
) {
	"use strict";
	var STATUS_STARTING = PluginStatus.STATUS_STARTING;
	var STATUS_STARTED = PluginStatus.STATUS_STARTED;
	var STATUS_STOPPING = PluginStatus.STATUS_STOPPING;
	var STATUS_STOPPED = PluginStatus.STATUS_STOPPED;

	var Trigger = function (mConfig) {
		this.mConfig = mConfig;
		this.sStatus = PluginStatus.STATUS_STOPPED;
		this.oStartingPromise = null;
		this.oStoppingPromise = null;
		var oContainer = AppLifeCycleUtils.getContainer();
		oContainer.registerDirtyStateProvider(this._dirtyStateProvider.bind(this));
		this.oInitPromise = oContainer.getServiceAsync("URLParsing")
			.then(function (oURLParsingService) {
				this.oURLParsingService = oURLParsingService;
			}.bind(this))
			.catch(function (vError) {
				throw new Error("Error during retrieval of URLParsing ushell service: " + vError);
			});
	};

	function requireStartAdaptation () {
		return new Promise(function (resolve, reject) {
			sap.ui.require(["sap/ui/rta/api/startAdaptation"], resolve, reject);
		});
	}

	function getRootControl () {
		return AppLifeCycleUtils.getCurrentRunningApplication()
			.then(function (oCurrentRunningApp) {
				return oCurrentRunningApp.componentInstance;
			});
	}

	function showStartError (vError, oResourceBundle) {
		var sMessage;
		if (vError instanceof Error) {
			sMessage = oResourceBundle.getText("TECHNICAL_ERROR");
		} else if (typeof vError === "string") {
			sMessage = vError;
		}

		sap.ui.require([
			"sap/ui/rta/Utils",
			"sap/m/MessageBox"
		], function (
			Utils,
			MessageBox
		) {
			MessageBox.error(
				sMessage,
				{
					title: oResourceBundle.getText("ERROR_TITLE"),
					onClose: null,
					styleClass: Utils.getRtaStyleClassName()
				}
			);
		});
	}

	Trigger.prototype.getInitPromise = function () {
		return this.oInitPromise;
	};

	// if the failed event is fired, RuntimeAuthoring couldn't properly start
	// and startAdaptation does not return the RuntimeAuthoring instance
	// so the instance has to be saved and the error handler has to stop rta
	Trigger.prototype._onRtaFailed = function (oEvent) {
		BusyIndicator.hide();
		this._oRTA = oEvent.getSource();
		this.mConfig.onErrorHandler();
		showStartError(oEvent.getParameter("error"), this.mConfig.i18n);
	};

	Trigger.prototype._startRta = function () {
		this.sStatus = STATUS_STARTING;
		sap.ui.getCore().getEventBus().subscribe(
			"sap.ushell.renderers.fiori2.Renderer",
			"appClosed",
			this._onAppClosed,
			this
		);
		sap.ui.getCore().getEventBus().subscribe(
			"sap.ushell",
			"appKeepAliveDeactivate",
			this._onAppClosed,
			this
		);
		BusyIndicator.show(0);

		var oRootControl;
		return getRootControl()
			.then(function (oReturnedRootControl) {
				oRootControl = oReturnedRootControl;
				return sap.ui.getCore().loadLibrary("sap.ui.rta", { async: true });
			})
			.then(requireStartAdaptation.bind(this))
			.then(function (startAdaptation) {
				// when RTA gets started we have to save the current hash to compare on navigation
				this.sOldHash = hasher.getHash();

				var mOptions = {
					rootControl: oRootControl,
					flexSettings: {
						layer: this.mConfig.layer,
						developerMode: this.mConfig.developerMode
					}
				};

				return startAdaptation(
					mOptions,
					this.mConfig.loadPlugins,
					this.mConfig.onStartHandler,
					this._onRtaFailed.bind(this),
					this.mConfig.onStopHandler
				);
			}.bind(this))
			.then(function (oRTA) {
				BusyIndicator.hide();
				this._oRTA = oRTA;
				this.sStatus = STATUS_STARTED;
			}.bind(this))
			.catch(function (vError) {
				BusyIndicator.hide();
				if (vError.reason === "flexEnabled") {
					this.handleFlexDisabledOnStart();
				} else if (vError === "Reload triggered") {
					this.sStatus = STATUS_STOPPED;
				}
			}.bind(this));
	};

	Trigger.prototype._stopRta = function () {
		this.sStatus = STATUS_STOPPING;
		return this._oRTA.stop.apply(this._oRTA, arguments).then(function () {
			this.exitRta();
		}.bind(this));
	};

	/**
	 * Turns on the adaption mode of the RTA FLP plugin.
	 * @returns {promise} Resolves when runtime adaptation has started
	 * @private
	 */
	Trigger.prototype.triggerStartRta = function () {
		var sStatus = this.sStatus;

		switch (sStatus) {
			case STATUS_STARTING:
				break;
			case STATUS_STARTED:
				this.oStartingPromise = Promise.resolve();
				break;
			case STATUS_STOPPING:
				this.oStartingPromise = this.oStoppingPromise
					.then(function () {
						return this._startRta();
					}.bind(this));
				break;
			case STATUS_STOPPED:
				this.oStartingPromise = this._startRta();
				break;
			default:
		}

		if (sStatus !== STATUS_STARTING) {
			this.oStartingPromise.then(function () {
				this.oStartingPromise = null;
			}.bind(this));
		}
		return this.oStartingPromise;
	};

	/**
	 * Stopps the adaption mode of the RTA FLP plugin.
	 * @returns {promise} Resolves when runtime adaptation has stopped
	 * @private
	 */
	Trigger.prototype.triggerStopRta = function () {
		var sStatus = this.sStatus;
		switch (sStatus) {
			case STATUS_STARTING:
				this.oStoppingPromise = this.oStartingPromise.then(function () {
					return this._stopRta.apply(this, arguments);
				}.bind(this));
				break;
			case STATUS_STARTED:
				this.oStoppingPromise = this._stopRta.apply(this, arguments);
				break;
			case STATUS_STOPPING:
				break;
			case STATUS_STOPPED:
				this.oStoppingPromise = Promise.resolve();
				break;
			default:
		}

		if (sStatus !== STATUS_STOPPING) {
			this.oStoppingPromise.then(function () {
				this.oStoppingPromise = null;
			}.bind(this));
		}
		return this.oStoppingPromise;
	};

	/**
	 * Triggers a Message when flex is disabled on FLP start.
	 * @private
	 */
	Trigger.prototype.handleFlexDisabledOnStart = function () {
		sap.ui.require([
			"sap/ui/rta/util/showMessageBox",
			"sap/m/MessageBox"
		], function (
			showMessageBox,
			MessageBox
		) {
			showMessageBox(
					this.mConfig.i18n.getText("MSG_FLEX_DISABLED"),
				{
					icon: MessageBox.Icon.INFORMATION,
					title: this.mConfig.i18n.getText("HEADER_FLEX_DISABLED"),
					actions: [MessageBox.Action.OK],
					initialFocus: null,
					isCustomAction: false
				}
			);
		}.bind(this));
	};

	Trigger.prototype._dirtyStateProvider = function () {
		if (this._oRTA && this.sStatus === STATUS_STARTED) {
			var sHash = hasher.getHash();
			var oParsedNew = this.oURLParsingService.parseShellHash(sHash);
			var oParsedOld = this.oURLParsingService.parseShellHash(this.sOldHash);
			this.sOldHash = sHash;

			if (
				oParsedNew.semanticObject === oParsedOld.semanticObject &&
				oParsedNew.action === oParsedOld.action &&
				oParsedNew.appSpecificRoute !== oParsedOld.appSpecificRoute
			) {
				return false;
			}
			return this._oRTA.canUndo();
		}
		return false;
	};

	Trigger.prototype.exitRta = function () {
		if (this._oRTA) {
			this._oRTA.destroy();
			this.sStatus = STATUS_STOPPED;
			this.oStartingPromise = null;
			this.oStoppingPromise = null;
			this._oRTA = null;
		}
		sap.ui.getCore().getEventBus().unsubscribe("sap.ushell.renderers.fiori2.Renderer", "appClosed", this._onAppClosed, this);
		sap.ui.getCore().getEventBus().unsubscribe("sap.ushell", "appKeepAliveDeactivate", this._onAppClosed, this);
	};

	Trigger.prototype._onAppClosed = function () {
		// If the app gets closed (or navigated away from), RTA should be stopped without saving changes
		// or checking personalization changes (as the app should not be reloaded in this case)
		this.triggerStopRta(/*bDontSaveChanges = */true, /*bSkipCheckPersChanges = */true);
	};

	return Trigger;
}, true);
