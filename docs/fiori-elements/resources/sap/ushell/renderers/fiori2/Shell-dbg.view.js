// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/library",
    "sap/ushell/library",
    "sap/ui/Device",
    "sap/ushell/components/_HeaderManager/ControlManager",
    "sap/ushell/components/_HeaderManager/ShellHeader.controller",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/XMLView"
], function (
    coreLibrary,
    library,
    Device,
    HeaderControlManager,
    ShellHeaderController,
    AccessibilityCustomData,
    resources,
    utils,
    Config,
    EventHub,
    JSONModel,
    XMLView
) {
    "use strict";
    function fnShellUpdateAggItem (sId, oContext) {
        return sap.ui.getCore().byId(oContext.getObject());
    }

    sap.ui.jsview("sap.ushell.renderers.fiori2.Shell", { // LEGACY API (deprecated)
        /**
         * Most of the following code acts just as placeholder for new Unified Shell Control.
         * Shell.view.js uses deprecated and synchronious APIs. It is replaced by ShellAsync.view.js
         *
         * @param {Object} oController oController
         * @returns {sap.ushell.ui.Shell} oUnifiedShell
         *
         * @deprecated since 1.99. Please use {@link sap.ushell.renderers.fiori2.ShellAsync.view} instead.
         */
        createContent: function (oController) {
            this.oController = oController;
            var oViewData = this.getViewData() || {},
                oConfig = oViewData.config || {};

            this.oConfig = oConfig;
            this.aDanglingControls = [];

            // Change config if more then three buttons moved to the header
            this._allowUpToThreeActionInShellHeader(oConfig);

            var oUnifiedShell = sap.ui.xmlfragment("sap.ushell.ui.ShellLayout", oController), // LEGACY API (deprecated)
                oShellHeader = this.createShellHeader(oConfig, this.getViewData().shellModel);

            oUnifiedShell.setHeader(oShellHeader);
            oShellHeader.setShellLayout(oUnifiedShell);

            // handling of ToolArea lazy creation
            EventHub.once("CreateToolArea").do(function () {
                sap.ui.require(["sap/ushell/ui/shell/ToolArea"], function (ToolArea) {
                    var oShellToolArea = new ToolArea({
                        id: "shell-toolArea",
                        toolAreaItems: {
                            path: "/currentState/toolAreaItems",
                            factory: fnShellUpdateAggItem
                        }
                    });
                    oShellToolArea.updateAggregation = this.updateShellAggregation;
                    oShellToolArea.addEventDelegate({
                        onAfterRendering: function () {
                            oUnifiedShell.applySplitContainerSecondaryContentSize();
                        }
                    });
                    oUnifiedShell.setToolArea(oShellToolArea);
                }.bind(this));
            }.bind(this));

            this.setOUnifiedShell(oUnifiedShell);

            this.setDisplayBlock(true);
            this.addDanglingControl(sap.ui.getCore().byId("viewPortContainer"));

            utils.setPerformanceMark("FLP - Shell.view rendering started!");
            return oUnifiedShell;
        },

        /**
         * allow up to 3 actions in shell header
         * @param {Object} oConfig view configuration
         */
        _allowUpToThreeActionInShellHeader: function (oConfig) {
            // in order to save performance time when these properties are not defined
            if (Object.keys(oConfig).length > 3) {
                var aParameter = [
                        "moveAppFinderActionToShellHeader",
                        "moveUserSettingsActionToShellHeader",
                        "moveContactSupportActionToShellHeader",
                        "moveEditHomePageActionToShellHeader"
                    ],
                    count = 0,
                    sParameter;

                // count the number of "true" values, once get to three, force the other to be "false"
                for (var index = 0; index < 5; index++) {
                    sParameter = aParameter[index];
                    if (count === 3) {
                        // if 3 user actions have allready been moved to the shell header, assign false to every other parameter
                        oConfig[sParameter] = false;
                    } else if (oConfig[sParameter]) {
                        count++;
                    }
                }
            }
        },

        createShellHeader: function (oConfig, oShellModel) {
            // Create own model for the header
            var oShellHeaderModel = Config.createModel("/core/shellHeader", JSONModel),
                oHeaderController = new ShellHeaderController(),
                oShellHeader;
            oHeaderController.onInit();
            oShellHeader = sap.ui.xmlfragment("sap.ushell.ui.ShellHeader", oHeaderController); // LEGACY API (deprecated)
            HeaderControlManager.init(oConfig, oHeaderController, oShellModel);

            if (oConfig.appState === "embedded") {
                oShellHeader.setNoLogo();
            }

            // Assign models to the Shell Header
            oShellHeader.setModel(oShellHeaderModel);
            oShellHeader.setModel(resources.i18nModel, "i18n");
            oShellHeader.createUIArea();

            return oShellHeader;
        },

        /**
         * Begin factory functions for lazy instantiation of Shell Layout controls
         */

        createPostCoreExtControls: function () {
            // In order to minimize core-min we delay the FloatingContainer, ShellFloatingActions creation.
            sap.ui.require([
                "sap/ushell/ui/shell/FloatingContainer",
                "sap/ushell/ui/shell/ShellFloatingActions"
            ], function (FloatingContainer, ShellFloatingActions) {
                var oShell = sap.ui.getCore().byId("shell");

                // qUnit specific: the function may be called after the shell is destroyed
                if (!oShell) {
                    return;
                }

                var oShellFloatingContainer = new FloatingContainer({
                    id: "shell-floatingContainer",
                    content: {
                        path: "/currentState/floatingContainerContent",
                        factory: fnShellUpdateAggItem
                    }
                });
                if (Device.system.desktop) {
                    // add tabindex for the floating container so it can be tab/f6
                    oShellFloatingContainer.addCustomData(new AccessibilityCustomData({
                        key: "tabindex",
                        value: "-1",
                        writeToDom: true
                    }));
                }

                oShellFloatingContainer.setModel(oShell.getModel());

                this.addDanglingControl(oShellFloatingContainer);
                var oShellFloatingActions = new ShellFloatingActions({
                    id: "shell-floatingActions",
                    floatingActions: {
                        path: "/currentState/floatingActions",
                        factory: fnShellUpdateAggItem
                    }
                });

                oShellFloatingActions.updateAggregation = this.updateShellAggregation;

                var oShellLayout = this.getOUnifiedShell();
                oShellLayout.setFloatingContainer(oShellFloatingContainer);
                oShellLayout.setFloatingActionsContainer(oShellFloatingActions);

                this._createAllMyAppsView();
            }.bind(this));
        },

        _createAllMyAppsView: function () {
            var onServiceLoaded = function (oAllMyApps) {
                if (oAllMyApps.isEnabled()) {
                    this._initializeAllMyAppsView();
                }
            }.bind(this);

            sap.ushell.Container.getServiceAsync("AllMyApps").then(onServiceLoaded);
        },

        _initializeAllMyAppsView: function () {
            XMLView.create({
                id: "allMyAppsView",
                viewName: "sap.ushell.renderers.fiori2.allMyApps.AllMyApps"
            }).then(function (allMyAppsView) {
                var oModel = this.getModel();
                allMyAppsView.setModel(oModel);
                allMyAppsView.setModel(resources.i18nModel, "i18n");
                allMyAppsView.addCustomData(new AccessibilityCustomData({
                    key: "aria-label",
                    value: resources.i18n.getText("allMyApps_headerTitle"),
                    writeToDom: true
                }));
                this.getOUnifiedShell().getHeader().getAppTitle().setAllMyApps(allMyAppsView);
            }.bind(this));
        },

        getOUnifiedShell: function () {
            return this.oUnifiedShell;
        },

        setOUnifiedShell: function (oUnifiedShell) {
            this.oUnifiedShell = oUnifiedShell;
        },

        updateShellAggregation: function (sName) {
            var oBindingInfo = this.mBindingInfos[sName],
                oAggregationInfo = this.getMetadata().getJSONKeys()[sName],
                oClone;

            this[oAggregationInfo._sGetter]().forEach(function (v) {
                this[oAggregationInfo._sRemoveMutator](v);
            }.bind(this));
            oBindingInfo.binding.getContexts().forEach(function (v, i) {
                oClone = oBindingInfo.factory(this.getId() + "-" + i, v)
                    ? oBindingInfo.factory(this.getId() + "-" + i, v).setBindingContext(v, oBindingInfo.model)
                    : "";
                this[oAggregationInfo._sMutator](oClone);
            }.bind(this));
        },

        getControllerName: function () {
            return "sap.ushell.renderers.fiori2.Shell";
        },

        addDanglingControl: function (oControl) {
            this.aDanglingControls.push(oControl);
        },

        destroyDanglingControls: function () {
            if (this.aDanglingControls) {
                this.aDanglingControls.forEach(function (oControl) {
                    if (oControl.destroyContent) {
                        oControl.destroyContent();
                    }
                    oControl.destroy();
                });
            }
        }
    });
});
