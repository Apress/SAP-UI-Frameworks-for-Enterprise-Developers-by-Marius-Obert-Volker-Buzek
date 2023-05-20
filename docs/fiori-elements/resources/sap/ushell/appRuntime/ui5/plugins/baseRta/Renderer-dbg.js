/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils"
], function (
	Log,
	AppLifeCycleUtils
) {
	"use strict";

	var Renderer = {

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 * @param {object} oComponent - Object with information about the current application
		 * @returns {promise} Resolves with the renderer instance or rejected with an error message.
		 */
		getRenderer: function (oComponent) {
			var oContainer = AppLifeCycleUtils.getContainer();

			return new Promise(function (resolve, reject) {
				var oRenderer = oContainer.getRenderer();
				if (oRenderer) {
					oComponent.oRenderer = oRenderer;
					resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					oComponent._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oComponent.oRenderer = oRenderer;
							resolve(oRenderer);
						} else {
							reject("Illegal state: shell renderer not available after recieving 'rendererCreated' event.");
						}
					};
					oContainer.attachRendererCreatedEvent(oComponent._onRendererCreated, oComponent);
				}
			});
		},

		createActionButton: function (oComponent, onClickHandler, bIsVisible) {
			return this.getRenderer(oComponent)
				.then(function (oRenderer) {
					//Button will only be added once even when more instances of this component are created
					oRenderer.addActionButton("sap.ushell.ui.launchpad.ActionItem", {
						id: oComponent.mConfig.id,
						text: oComponent.mConfig.i18n.getText(oComponent.mConfig.text),
						icon: oComponent.mConfig.icon,
						press: onClickHandler,
						visible: bIsVisible
					}, true, false, [oRenderer.LaunchpadState.App]);
				})
				.catch(function (sErrorMessage) {
					Log.error(sErrorMessage, undefined, oComponent.mConfig.sComponentName);
				});
		},

		exit: function () {}
	};

	return Renderer;
}, true);
