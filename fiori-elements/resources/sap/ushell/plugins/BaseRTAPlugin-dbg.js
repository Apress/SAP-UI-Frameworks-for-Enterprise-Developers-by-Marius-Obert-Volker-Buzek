// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
	"sap/ui/core/Component",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/CheckConditions",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/Trigger"
],
function (
	Component,
	AppLifeCycleUtils,
	CheckConditions,
	Trigger
) {
	"use strict";

	var BaseRTAPlugin = Component.extend("sap.ushell.plugins.BaseRTAPlugin", {
		sType: null,

		init: function (mConfig) {
			this.mConfig = mConfig;
			this.mConfig.i18n = this.getModel("i18n").getResourceBundle();
			this.mConfig.loadPlugins = this._loadPlugins.bind(this);
			this.mConfig.onStartHandler = this._onStartHandler.bind(this);
			this.mConfig.onErrorHandler = this._onErrorHandler.bind(this);
			this.mConfig.onStopHandler = this._onStopHandler.bind(this);

			this.oTrigger = new Trigger(this.mConfig);

			this._oPluginPromise = this.oTrigger.getInitPromise()
				.then(CheckConditions.checkUI5App.bind(CheckConditions))
				.then(function (bIsUI5App) {
					if (
						this.mConfig.checkRestartRTA
						&& bIsUI5App
						&& CheckConditions.checkRestartRTA(this.mConfig.layer)
					) {
						return this.oTrigger.triggerStartRta(this);
					}
					return undefined;
				}.bind(this))

				.then(function () {
					return AppLifeCycleUtils.getAppLifeCycleService();
				})

				.then(function (oAppLifeCycleService) {
					oAppLifeCycleService.attachAppLoaded(this._onAppLoaded, this);
				}.bind(this));
		},

		getPluginPromise: function () {
			return this._oPluginPromise;
		},

		exit: function () {
			this._oPluginPromise = this._oPluginPromise
				.then(AppLifeCycleUtils.getAppLifeCycleService)
				.then(function (oAppLifeCycleService) {
					oAppLifeCycleService.detachAppLoaded(this._onAppLoaded, this);
					if (this._onRendererCreated) {
						var oContainer = AppLifeCycleUtils.getContainer();
						oContainer.detachRendererCreatedEvent(this._onRendererCreated, this);
					}
				}.bind(this));
		},

		_onAppLoaded: function () {
			return CheckConditions.checkUI5App()
				.then(function (bIsUI5App) {
					if (bIsUI5App) {
						if (CheckConditions.checkRestartRTA(this.mConfig.layer)) {
							this.oTrigger.triggerStartRta(this);
						}
						this._adaptButtonVisibility(this.mConfig.id, true);
					} else {
						this._adaptButtonVisibility(this.mConfig.id, false);
					}
				}.bind(this));
		},

		/**
		 * Event handler for the "Adapt" button of the RTA FLP Plugin
		 * Checks the supported browsers and starts the RTA
		 * @returns {Promise} Resolves when rta is triggered
		 * @private
		 */
		_onAdapt: function () {
			return this.oTrigger.triggerStartRta(this);
		},

		_adaptButtonVisibility: function (vControl, bVisible) {
			if (typeof vControl === "string") {
				vControl = sap.ui.getCore().byId(vControl);
			}
			if (!vControl) {
				return;
			}
			vControl.setVisible(bVisible);
		},

		/**
		 * Leaves the RTA adaptation mode
		 * @private
		 */
		_exitAdaptation: function () {
			if (this._switchToDefaultMode) {
				this._switchToDefaultMode();
			}
			this.oTrigger.exitRta();
		},

		/**
		 * This function is called when the start event of RTA was fired
		 * @private
		 */
		_onStartHandler: function () {},

		/**
		 * This function is called when the failed event of RTA was fired
		 * @private
		 */
		_onErrorHandler: function () {
			this._exitAdaptation();
		},

		/**
		 * This function is called when the stop event of RTA was fired
		 * @private
		 */
		_onStopHandler: function () {
			this._exitAdaptation();
		},

		/**
		 * This function should be overridden when custom plugins are needed
		 *
		 * @private
		 * @returns {Promise} Returns a resolved Promise
		 */
		_loadPlugins: function () {
			return Promise.resolve();
		}

	});
	return BaseRTAPlugin;

}, true /* bExport */);
