// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/UriParameters",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Component",
    "sap/ui/fl/Utils",
    "sap/ui/fl/apply/_internal/preprocessors/EventHistory",
    "sap/ushell/plugins/BaseRTAPlugin",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/CheckConditions",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/Renderer"
], function (
    UriParameters,
    MessageBox,
    MessageToast,
    Component,
    FlexUtils,
    EventHistory,
    BaseRTAPlugin,
    CheckConditions,
    Renderer
) {
    "use strict";

    var sButtonId = "PERSONALIZE_Plugin_ActionButton";

    var RTAPlugin = BaseRTAPlugin.extend("sap.ushell.plugins.rta-personalize.Component", {
        sType: "rta-personalize",

        metadata: {
            manifest: "json",
            library: "sap.ushell"
        },

        init: function () {
            var oConfig = {
                sComponentName: "sap.ushell.plugins.rta-personalize",
                layer: "USER",
                developerMode: false,
                id: sButtonId,
                text: "PERSONALIZE_BUTTON_TEXT",
                icon: "sap-icon://edit",
                visible: false,
                checkRestartRTA: false
            };

            BaseRTAPlugin.prototype.init.call(this, oConfig);
            CheckConditions.checkUI5App()
                .then(function (bIsUI5App) {
                    var bButtonIsVisible = this.mConfig.visible && bIsUI5App;
                    return Renderer.createActionButton(this, this._onAdapt.bind(this), bButtonIsVisible);
                }.bind(this))
                .then(this._checkForEnabledControls.bind(this));
        },

        removePersonalizableControl: function (oControl) {
            var iIndex = this._aPersonalizableControls.indexOf(oControl);
            this._aPersonalizableControls.splice(iIndex, 1);
            this._aOriginalFooterVisibility.splice(iIndex, 1);
            if (this._aPersonalizableControls.length === 0) {
                this._oObserver.disconnect();
                delete this._oObserver;
                this._adaptButtonVisibility(sButtonId, false);
            }
        },

        _checkForEnabledControls: function () {
            this._aPersonalizableControls = [];
            this._aOriginalFooterVisibility = [];

            function addPersonalizableControl (oControl) {
                if (this._aPersonalizableControls.indexOf(oControl) === -1) {
                    this._aPersonalizableControls.push(oControl);
                    CheckConditions.checkUI5App()
                        .then(function (bIsUI5App) {
                            this._adaptButtonVisibility(sButtonId, bIsUI5App);
                        }.bind(this));
                }
            }

            function onPersonalizableControlRendered (sChannelId, sEventId, vControl) {
                if (FlexUtils.checkControlId(vControl)) {
                    var oControl = this._getControlInstance(vControl);
                    addPersonalizableControl.call(this, oControl);
                    if (!this._oObserver) {
                        this._oObserver = new MutationObserver(function (mutations) {
                            this._aPersonalizableControls.forEach(function (oPersonalizableControl) {
                                if (!oPersonalizableControl.getDomRef()) {
                                    this.removePersonalizableControl(oPersonalizableControl);
                                }
                            }.bind(this));
                        }.bind(this));
                        var oObserverConfig = {
                            attributes: true,
                            childList: true,
                            characterData: false,
                            subtree: true,
                            attributeFilter: ["style", "class"]
                        };
                        this._oObserver.observe(window.document, oObserverConfig);
                    }
                }
            }

            sap.ui.getCore().getEventBus().subscribe("sap.ui", "ControlForPersonalizationRendered", onPersonalizableControlRendered, this);
            var aEvents = EventHistory.getHistoryAndStop("ControlForPersonalizationRendered");
            aEvents.forEach(function (oEvent) {
                onPersonalizableControlRendered.call(this, oEvent.channelId, oEvent.eventId, oEvent.parameters);
            }.bind(this));
        },

        _getControlInstance: function (vElement) {
            if (typeof vElement === "string") {
                var oElement = sap.ui.getCore().byId(vElement);
                return oElement || Component.get(vElement);
            }
            return vElement;
        },

        _onAppLoaded: function () {
            // remove all personalizable controls if a new app is loaded and hide the button
            // the listener for such controls is already active at this point
            var iLength = this._aPersonalizableControls.length;
            for (var i = iLength; i > 0; i--) {
                this.removePersonalizableControl(this._aPersonalizableControls[i - 1]);
            }
        },

        /**
         * This function is called when the start event of RTA was fired
         *
         * @param {sap.ui.base.Event} oEvent the RTA start event
         * @private
         * @override
         */
        _onStartHandler: function (oEvent) {
            var iEditablePlugins = oEvent.getParameter("editablePluginsCount");
            if (iEditablePlugins !== undefined && iEditablePlugins <= 0) {
                MessageBox.information(this.mConfig.i18n.getText("MSG_STARTUP_NO_OVERLAYS"), {
                    onClose: function () {
                        this.oTrigger.triggerStopRta(/*bSkipSave = */true, /*bSkipRestart = */true);
                    }.bind(this)
                });
            }
        },

        /**
         * This function should be used when custom plugins are needed
         *
         * @param {sap.ui.rta.RuntimeAuthoring} oRTA Instance of RuntimeAuthoring
         * @private
         * @override
         */
        _loadPlugins: function (oRTA) {
            // only require the needed plugins when RTA is started
            var oPromise = new Promise(function (resolve) {
                sap.ui.require([
                    "sap/ui/rta/plugin/EasyAdd",
                    "sap/ui/rta/plugin/EasyRemove"
                ], function (EasyAddPlugin, EasyRemovePlugin) {
                    var mPlugins = oRTA.getDefaultPlugins(),
                        oRemovePlugin = mPlugins.remove;
                    mPlugins.remove = new EasyRemovePlugin({ commandFactory: oRemovePlugin.getCommandFactory() });

                    var oAdditionalElementsPlugin = mPlugins.additionalElements;
                    mPlugins.additionalElements = new EasyAddPlugin({
                        commandFactory: oAdditionalElementsPlugin.getCommandFactory()
                    });

                    mPlugins.contextMenu.setOpenOnClick(false);

                    oRTA.setPlugins(mPlugins);
                    resolve();
                });
            });
            return oPromise;
        },

        /**
         * Event handler for the "Adapt" button of the RTA FLP Plugin
         *
         * @param {sap.ui.base.Event} oEvent the button click event
         * @private
         * @override
         */
        _onAdapt: function (oEvent) {
            var oSource = oEvent.getSource();
            if (oSource.getText() === this.mConfig.i18n.getText("PERSONALIZE_BUTTON_TEXT")) {
                var oUriParams = UriParameters.fromURL(window.location.href),
                    sSapUiLayer = oUriParams.mParams["sap-ui-layer"] && oUriParams.mParams["sap-ui-layer"][0];
                if (!sSapUiLayer || sSapUiLayer === "USER") {
                    oSource.setText(this.mConfig.i18n.getText("END_PERSONALIZE_BUTTON_TEXT"));

                    this._adaptButtonVisibility("RTA_Plugin_ActionButton", false);

                    // Store the original values for the Footer Visibility
                    this._aPersonalizableControls.forEach(function (oControl) {
                        if (oControl.setShowFooter) {
                            this._aOriginalFooterVisibility.push(oControl.getShowFooter());
                        } else {
                            this._aOriginalFooterVisibility.push(undefined);
                        }
                    }.bind(this));

                    this._adaptFooterVisibility(false);

                    var oSearchButton = this._getFlpSearchButton();
                    this._bOriginalSearchButtonVisibility = oSearchButton && oSearchButton.getVisible();
                    if (this._bOriginalSearchButtonVisibility) {
                        this._adaptButtonVisibility(oSearchButton, false);
                    }

                    BaseRTAPlugin.prototype._onAdapt.call(this);
                } else {
                    MessageBox.information(this.mConfig.i18n.getText("MSG_STARTUP_WRONG_LAYER"));
                }
            } else {
                this.oTrigger.triggerStopRta(/*bSkipSave = */false, /*bSkipRestart = */true);
            }
            return Promise.resolve();
        },

        /**
         * Leaves the personalization mode
         * @private
         * @override
         */
        _switchToDefaultMode: function () {
            sap.ui.getCore().byId(sButtonId).setText(this.mConfig.i18n.getText("PERSONALIZE_BUTTON_TEXT"));

            this._adaptButtonVisibility("RTA_Plugin_ActionButton", true);
            this._adaptFooterVisibility(true);

            if (this._bOriginalSearchButtonVisibility !== undefined) {
                this._adaptButtonVisibility(this._getFlpSearchButton(), this._bOriginalSearchButtonVisibility);
                delete this._bOriginalSearchButtonVisibility;
            }

            MessageToast.show(this.mConfig.i18n.getText("SAVE_SUCCESSFUL"), {
                duration: 4000,
                offset: "0 -50"
            });
        },

        /**
         * Sets the Footer visibility of the personalizable Controls
         *
         * @param {boolean} bVisible new visibility of the Footer
         * @private
         */
        _adaptFooterVisibility: function (bVisible) {
            this._aPersonalizableControls.forEach(function (oControl, iIndex) {
                if (this._aOriginalFooterVisibility[iIndex]) {
                    oControl.setShowFooter(bVisible);
                }
            }.bind(this));
        },

        _getFlpSearchButton: function () {
            return this.oRenderer.getRootControl().getOUnifiedShell().getHeader().getHeadEndItems()[0];
        },

        _getFLPViewPort: function () {
            return sap.ui.getCore().byId("viewPortContainer");
        }
    });

    return RTAPlugin;
});
