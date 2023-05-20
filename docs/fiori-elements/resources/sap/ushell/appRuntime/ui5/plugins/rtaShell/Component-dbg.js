// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
	"sap/ui/core/Component",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/Renderer",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils",
	"sap/ui/thirdparty/jquery"
],
function (
	Component,
	Renderer,
	AppLifeCycleUtils,
	jQuery
) {
	"use strict";

	var oPostMessageInterface;

	function getInitialConfiguration () {
		return {
			sComponentName: "sap.ushell.appRuntime.ui5.plugins.rtaShell",
			layer: "CUSTOMER",
			id: "RTA_AppRuntime_Plugin_ActionButton",
			text: "RTA_BUTTON_TEXT",
			icon: "sap-icon://wrench",
			visible: false
		};
	}

	function switchToolbarVisibility (oRenderer, bVisible) {
		if (oRenderer) {
			oRenderer.setHeaderVisibility(bVisible, false);
		}
	}

	function postStartUIAdaptationToApp (oRenderer) {
		return new Promise(function (resolve, reject) {
			switchToolbarVisibility(oRenderer, false);
			oPostMessageInterface.postMessageToApp(
				"user.postapi.rtaPlugin",
				"startUIAdaptation"
			).done(resolve).fail(reject);
		});
	}

	return Component.extend("sap.ushell.appRuntime.ui5.plugins.rtaShell.Component", {
		metadata: {
			manifest: "json",
            library: "sap.ushell"
		},

		init: function () {
			this.mConfig = getInitialConfiguration();

			oPostMessageInterface = this.getComponentData().oPostMessageInterface;

			this._registerPostMessages();
		},

		_registerPostMessages: function () {
			oPostMessageInterface.registerPostMessageAPIs({
				"user.postapi.rtaPlugin": {
					inCalls: {
						activatePlugin: {
							executeServiceCallFn: function () {
								return oPostMessageInterface.createPostMessageResult(this._initPlugin());
							}.bind(this)
						},
						showAdaptUI: {
							executeServiceCallFn: function () {
								this._changeActionButtonVisibility(true/*bVisible*/);
								return oPostMessageInterface.createPostMessageResult();
							}.bind(this)
						},
						switchToolbarVisibility: {
							executeServiceCallFn: function (oServiceParams) {
								var bVisible = oServiceParams.oMessageData.body.visible;
								switchToolbarVisibility(this.oRenderer, bVisible);
								return oPostMessageInterface.createPostMessageResult();
							}.bind(this)
						}
					},
					outCalls: {
						startUIAdaptation: {}
					}
				}
			});
		},

		_initPlugin: function () {
			if (this.bIsInitialized) {
				return new jQuery.Deferred().resolve();
			}
			this.bIsInitialized = true;
			this.mConfig.i18n = this.getModel("i18n").getResourceBundle();

			return new jQuery.Deferred(function (oDeffered) {
				Renderer.getRenderer(this)
				.then(function (oRenderer) {
					this.oRenderer = oRenderer;
				}.bind(this))
				.then(function () {
					return Renderer.createActionButton(
						this,
						postStartUIAdaptationToApp.bind(undefined, this.oRenderer),
						this.mConfig.visible
					);
				}.bind(this))
				.then(function () {
					return AppLifeCycleUtils.getAppLifeCycleService();
				})
				.then(function (oAppLifeCycleService) {
					oAppLifeCycleService.attachAppLoaded(this._onAppLoaded, this);
				}.bind(this))
				.catch(function (vError) {
					this.bIsInitialized = false;
					return Promise.reject(vError);
				}.bind(this))
				.then(oDeffered.resolve, oDeffered.reject);
			}.bind(this)).promise();
		},

		_changeActionButtonVisibility: function (bVisible) {
			var vControl = sap.ui.getCore().byId(this.mConfig.id);
			if (vControl) {
				vControl.setVisible(bVisible);
			}
		},

		_onAppLoaded: function () {
			// check for restart adaptation happens is on rtaAgent site
			// the visibility of the action button is also triggert by the rtaAgent

			this._changeActionButtonVisibility(false/*bVisible*/);
		},

		exit: function () {
			if (this.oRenderer) {
				switchToolbarVisibility(this.oRenderer, false);
			}
			return AppLifeCycleUtils.getAppLifeCycleService()
				.then(function (oAppLifeCycleService) {
					oAppLifeCycleService.detachAppLoaded(this._onAppLoaded, this);
					if (this._onRendererCreated) {
						var oContainer = AppLifeCycleUtils.getContainer();
						oContainer.detachRendererCreatedEvent(this._onRendererCreated, this);
					}
				}.bind(this));
		}
	});
});
