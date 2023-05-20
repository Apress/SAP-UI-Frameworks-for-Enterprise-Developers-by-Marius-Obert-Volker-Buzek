// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/CheckConditions",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/Renderer",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/Trigger",
	"sap/base/Log"
], function (
	Component,
	FeaturesAPI,
	CheckConditions,
	AppLifeCycleUtils,
	Renderer,
	Trigger,
	Log
) {
	"use strict";

	var oPostMessageInterface;

	function getInitialConfiguration () {
		return {
			sComponentName: "sap.ushell.appRuntime.ui5.plugins.rtaAgent",
			layer: "CUSTOMER",
			developerMode: false
		};
	}

	function postSwitchToolbarVisibilityMessageToFLP (bVisible) {
		return new Promise(function (resolve, reject) {
			oPostMessageInterface.postMessageToFlp(
				"user.postapi.rtaPlugin",
				"switchToolbarVisibility",
				{ visible: bVisible }
			).done(resolve).fail(reject);
		});
	}

	function postActivatePluginMessageToFLP () {
		return new Promise(function (resolve, reject) {
			oPostMessageInterface.postMessageToFlp(
				"user.postapi.rtaPlugin",
				"activatePlugin"
			).done(resolve).fail(reject);
		});
	}

	function postShowAdaptUIMessageToFLP () {
		return CheckConditions.checkUI5App()
			.then(function (bIsUI5App) {
				if (bIsUI5App) {
					oPostMessageInterface.postMessageToFlp(
						"user.postapi.rtaPlugin",
						"showAdaptUI"
					).fail(function (vError) {
						throw new Error(vError);
					});
				}
			});
	}

	function onAppClosed () {
		// If the app gets closed (or navigated away from), RTA should be stopped without saving changes
		// or checking personalization changes (as the app should not be reloaded in this case)
		this.oTrigger.triggerStopRta(/*bDontSaveChanges = */true, /*bSkipCheckPersChanges = */true);
	}

	return Component.extend("sap.ushell.appRuntime.ui5.plugins.rtaAgent.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			this.mConfig = getInitialConfiguration();
			this._oPluginPromise = Promise.resolve();

			oPostMessageInterface = this.getComponentData().oPostMessageInterface;

			return FeaturesAPI.isKeyUser()

			.then(function (bIsKeyUser) {
				if (bIsKeyUser) {
					return postActivatePluginMessageToFLP();
				}
				// step over the next 'then' steps
				return Promise.reject();
			})

			.then(function () {
				this.mConfig.i18n = this.getModel("i18n").getResourceBundle();
				this.mConfig.onStartHandler = this._onStartHandler.bind(this);
				this.mConfig.onErrorHandler = this._onErrorHandler.bind(this);
				this.mConfig.onStopHandler = this._onStopHandler.bind(this);

				this.oTrigger = new Trigger(this.mConfig);
				return this.oTrigger.getInitPromise();
			}.bind(this))

			.then(function () {
				this._registerPostMessages();
				return this._restartRtaIfRequired();
			}.bind(this))

			.then(function () {
				return AppLifeCycleUtils.getAppLifeCycleService();
			})

			.then(function (oAppLifeCycleService) {
				oAppLifeCycleService.attachAppLoaded(this._onAppLoaded, this);
				return Renderer.getRenderer(this);
			}.bind(this))

			.then(function (oRenderer) {
				this.oRenderer = oRenderer;
			}.bind(this))

			.then(postShowAdaptUIMessageToFLP)

			.catch(function (vError) {
				if (vError) {
					Log.error(vError);
				}
			});
		},

		getPluginPromise: function () {
			return this._oPluginPromise;
		},

		_registerPostMessages: function () {
			oPostMessageInterface.registerPostMessageAPIs({
				"user.postapi.rtaPlugin": {
					inCalls: {
						startUIAdaptation: {
							executeServiceCallFn: function () {
								sap.ui.getCore().getEventBus().subscribe(
									"sap.ushell",
									"appClosed",
									onAppClosed.bind(this)
								);
								this.oRenderer.addTopHeaderPlaceHolder();
								this.oTrigger.triggerStartRta(this);
								return oPostMessageInterface.createPostMessageResult();
							}.bind(this)
						}
					},
					outCalls: {
						activatePlugin: {},
						showAdaptUI: {}
					}
				}
			});
		},

		_restartRtaIfRequired: function () {
			return CheckConditions.checkUI5App()
				.then(function (bIsUI5App) {
					if (bIsUI5App) {
						if (CheckConditions.checkRestartRTA(this.mConfig.layer)) {
							return postSwitchToolbarVisibilityMessageToFLP(false)
								.then(function () {
									this.oRenderer.addTopHeaderPlaceHolder();
									return this.oTrigger.triggerStartRta(this);
								}.bind(this));
						}
					}
					return undefined;
				}.bind(this));
		},

		_onAppLoaded: function () {
			CheckConditions.checkUI5App()
				.then(function (bIsUI5App) {
					if (bIsUI5App) {
						this._restartRtaIfRequired()
							.then(function () {
								return postShowAdaptUIMessageToFLP();
							});
					}
				}.bind(this));
		},

		_onStopHandler: function () {
			this._exitAdaptation();
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

		_exitAdaptation: function () {
			sap.ui.getCore().getEventBus().unsubscribe("sap.ushell", "appClosed", onAppClosed.bind(this));
			postSwitchToolbarVisibilityMessageToFLP(true);
			this.oTrigger.exitRta();
			this.oRenderer.removeTopHeaderPlaceHolder();
		},

		exit: function () {
			sap.ui.getCore().getEventBus().unsubscribe("sap.ushell", "appClosed", onAppClosed.bind(this));
			postSwitchToolbarVisibilityMessageToFLP(true);
			this._oPluginPromise = this._oPluginPromise
				.then(AppLifeCycleUtils.getAppLifeCycleService.bind(AppLifeCycleUtils))
				.then(function (oAppLifeCycleService) {
					oAppLifeCycleService.detachAppLoaded(this._onAppLoaded, this);
				}.bind(this));
		}
	});
});
