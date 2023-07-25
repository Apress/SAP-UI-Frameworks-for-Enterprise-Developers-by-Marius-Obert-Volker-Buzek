// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The models assosicated with the applciation.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/EventHub",
    "sap/ushell/Config",
    "sap/ushell/utils",
    "sap/ushell/components/HeaderManager",
    "sap/ushell/components/StateHelper",
    "sap/ui/performance/Measurement",
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/base/util/extend",
    "sap/ushell/utils/UrlParsing",
    "sap/ui/core/Core"
], function (
    EventHub,
    Config,
    utils,
    HeaderManager,
    StateHelper,
    Measurement,
    Log,
    deepExtend,
    extend,
    UrlParsing,
    Core
) {
    "use strict";

    var oBaseStates;
    var customStatesDelta;

    function createInitialCustomDeltas () {
        return {
            home:
                { actions: ["ContactSupportBtn"] },
            app:
                { actions: ["ContactSupportBtn", "aboutBtn"] },
            minimal:
                { actions: ["ContactSupportBtn", "aboutBtn"] },
            standalone:
                { actions: ["ContactSupportBtn", "aboutBtn"] },
            embedded:
                { actions: ["ContactSupportBtn", "aboutBtn"] },
            "embedded-home":
                { actions: ["ContactSupportBtn", "aboutBtn"] },
            lean:
                { actions: ["ContactSupportBtn", "aboutBtn"] }
        };
    }

    function createInitialBaseStates () {
        return {
            blank: {
                stateName: "blank",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: true,
                paneContent: [],
                actions: [],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: [],
                search: ""
            },
            "blank-home": {
                stateName: "blank-home",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: true,
                paneContent: [],
                actions: [],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: [],
                search: ""
            },
            home: {
                stateName: "home",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: true,
                search: "",
                paneContent: [],
                actions: ["openCatalogBtn", "userSettingsBtn"],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: []
            },
            app: {
                stateName: "app",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: true,
                paneContent: [],
                search: "",
                actions: ["openCatalogBtn", "userSettingsBtn"],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: []
            },
            minimal: {
                stateName: "minimal",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: true,
                paneContent: [],
                actions: ["openCatalogBtn", "userSettingsBtn"],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: [],
                search: ""
            },
            standalone: {
                stateName: "standalone",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: true,
                paneContent: [],
                actions: [],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: [],
                search: ""
            },
            embedded: {
                stateName: "embedded",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: true,
                paneContent: [],
                actions: [],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: [],
                search: ""
            },
            "embedded-home": {
                stateName: "embedded-home",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: true,
                paneContent: [],
                actions: [],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: [],
                search: ""
            },
            headerless: {
                stateName: "headerless",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: true,
                paneContent: [],
                actions: [],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: [],
                search: ""
            },
            merged: {
                stateName: "merged",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: true,
                paneContent: [],
                actions: [],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: [],
                search: ""
            },
            "headerless-home": {
                stateName: "headerless-home",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: true,
                paneContent: [],
                actions: [],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: [],
                search: ""
            },
            "merged-home": {
                stateName: "merged-home",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: true,
                paneContent: [],
                actions: [],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: [],
                search: ""
            },
            lean: {
                stateName: "lean",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: false,
                paneContent: [],
                search: "",
                actions: [],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: []
            },
            "lean-home": {
                stateName: "lean-home",
                showCurtain: false,
                showCatalog: false,
                showPane: false,
                showRightFloatingContainer: true,
                showRecentActivity: false,
                paneContent: [],
                search: "",
                actions: [],
                floatingActions: [],
                subHeader: [],
                toolAreaItems: [],
                RightFloatingContainerItems: [],
                toolAreaVisible: false,
                floatingContainerContent: []
            }
        };
    }

    function removeObjectKeys (oObject, oKeysToDelete) {
        return Object.keys(oObject).reduce(function (o, sKey) {
            if (!oKeysToDelete[sKey]) {
                o[sKey] = oObject[sKey];
            }
            return o;
        }, {});
    }

    function validateValueIsNotUndefined (aItems, value) {
        return value !== undefined;
    }
    function noValidation () {
        return true;
    }

    function getModelProperty (oCurrentModel, modelPropertyString) {
        var aPath = modelPropertyString.split("/");
        var oModelSoFar = oCurrentModel;
        aPath.shift();
        aPath.forEach(function (sPathPart) {
            if (!oModelSoFar) {
                return;
            }
            oModelSoFar = oModelSoFar[sPathPart];
        });
        return oModelSoFar;
    }

    function updateModelProperty (modelPropertyString, aValue, oCurrentModel) {
        var aPath = modelPropertyString.split("/");
        var oModelSoFar = oCurrentModel;
        aPath.shift();
        var sProperty = aPath.pop();
        aPath.forEach(function (sPathPart) {
            oModelSoFar = oModelSoFar[sPathPart];
        });
        oModelSoFar[sProperty] = aValue;
    }

    function ElementsModel () {
        var oCustomShellStates;
        var oStateModelToUpdate;
        var oCustomShellStateModel;
        var oApplicationShellStates;
        var oManagedElements;
        var bInRenderState;
        var sExtendedShellStateName;
        var bInCreateTemplate;
        var aTriggersToHandleQueue;
        var bEnableRegisterTriggers;

        this.createDefaultTriggers = function (sInitialState) {
            //add trigger to rerender shell state when we have we add the first action item.
            var fnRerenderShellOnFirstAction = function (sSubject, ev, oData) {
                if (oData.sProperty === "actions") {
                    var aActions = getModelProperty(oData.oModel, oData.path);
                    if (aActions && aActions.length === 0 && oData.aIds && oData.aIds.length > 0) {
                        this._renderShellState();
                    }
                }
            }.bind(this);

            var fnAddBackButtonOnFirstNavigation = function (oHashChangeEvent) {
                function hasInnerAppRouteChanged (sOldURL, sNewURL) {
                    var sOldHash = UrlParsing.getHash(sOldURL),
                        sNewHash = UrlParsing.getHash(sNewURL),
                        sOldInnerAppRoute = UrlParsing.parseShellHash(sOldHash).appSpecificRoute,
                        sNewInnerAppRoute = UrlParsing.parseShellHash(sNewHash).appSpecificRoute;

                    return sOldInnerAppRoute !== sNewInnerAppRoute;
                }

                var bInnerAppNavigationOccurred = hasInnerAppRouteChanged(oHashChangeEvent.oldURL, oHashChangeEvent.newURL);
                if (bInnerAppNavigationOccurred) {
                    this.addHeaderItem(["backBtn"], true);
                }
            }.bind(this);

            //trigger when user update shell state
            this.createTriggersOnBaseStates([{
                sName: "onAddFirstAction",
                fnRegister: function () {
                    Core.getEventBus().subscribe("launchpad", "updateShell", fnRerenderShellOnFirstAction, this);
                },
                fnUnRegister: function () {
                    Core.getEventBus().unsubscribe("launchpad", "updateShell", fnRerenderShellOnFirstAction, this);
                }
            }], ["blank", "blank-home"], sInitialState);

            var that = this;
            var oAppRenderedDoable;
            this.createTriggersOnBaseStates([{
                sName: "onAddFirstAction",
                fnRegister: function () {
                    // Show back button on inner-app navigation
                    window.addEventListener("hashchange", fnAddBackButtonOnFirstNavigation);

                    // Show back button on cross-app navigation
                    var iNumRenderings = 0;
                    oAppRenderedDoable = EventHub.on("AppRendered").do(function () {
                        iNumRenderings++;
                        /*
                         * NOTE
                         *
                         * - Use >= because when an inplace navigation is made
                         *   next, the base state (with no back button) is
                         *   applied and we must add the backBtn there again.
                         *
                         * - Use 2, because EventHub calls the doable the first
                         *   time even if the app was already visible, and we
                         *   want to show backBtn during the second app
                         *   rendering.
                         */
                        if (iNumRenderings >= 2) {
                            that.addHeaderItem(["backBtn"], true);
                        }
                    });
                },
                fnUnRegister: function () {
                    window.removeEventListener("hashchange", fnAddBackButtonOnFirstNavigation);
                    if (oAppRenderedDoable) {
                        oAppRenderedDoable.off();
                    }
                }
            }], ["lean", "lean-home"], sInitialState);
        };

        this.init = function (oConfig, oInApplicationRelatedElementsModel) {
            oBaseStates = createInitialBaseStates();
            customStatesDelta = createInitialCustomDeltas();
            oStateModelToUpdate = Config.last("/core/shell/model");
            oCustomShellStates = {};
            oManagedElements = {};
            bInRenderState = false;
            bInCreateTemplate = false;
            aTriggersToHandleQueue = [];
            bEnableRegisterTriggers = true;
            oApplicationShellStates = oInApplicationRelatedElementsModel;

            sExtendedShellStateName = undefined;
            if (oConfig) {
                Measurement.start("FLP:ElementsModel.init", "moveShellHeaderEndItems", "FLP");
                if (oConfig.moveContactSupportActionToShellHeader) {
                    this._removeCustomDataActionBtnFromUserActionsMenu("ContactSupportBtn");
                }
                if (oConfig.moveAppFinderActionToShellHeader) {
                    this._removeActionFromUserActionsMenu("openCatalogBtn");
                }
                if (oConfig.moveUserSettingsActionToShellHeader) {
                    this._removeActionFromUserActionsMenu("userSettingsBtn");
                }
                Measurement.end("FLP:ElementsModel.init");
            }

            var initialState = oConfig && oConfig.appState ? oConfig.appState : "home";
            this.createDefaultTriggers(initialState);
            this.switchState(initialState);
        };

        this.destroy = function () {
            oStateModelToUpdate = undefined;
            oCustomShellStates = undefined;
            oApplicationShellStates = undefined;
            oManagedElements = undefined;
            bInRenderState = undefined;
            bEnableRegisterTriggers = undefined;
            bInCreateTemplate = undefined;
            sExtendedShellStateName = undefined;
            oBaseStates = undefined;
            customStatesDelta = undefined;
        };

        this.getModel = function () {
            var oRenderer = sap.ushell.Container.getRenderer("fiori2");

            /*
             * Guard mainly to avoid breaking FLPD, which used to cope with an
             * undefined value being returned here. The flow is that FLPD tries
             * to instantiate StaticTile.controller, which on init attempts to
             * obtain the shell model just to setup the sizeBehavior property
             * of the tile.
             */
            if (!oRenderer) {
                return undefined;
            }

            return oRenderer._oShellView.getModel();
        };

        //moves the given button from being an action button in me area to a shell end header item
        //The button is added to the shell header in HeaderManager
        this._removeCustomDataActionBtnFromUserActionsMenu = function (btnName) {
            for (var key in customStatesDelta) {
                var oState = customStatesDelta[key];
                var aActions = oState.actions;
                var index = aActions.indexOf(btnName);
                if (index !== -1) {
                    //remove the button from FLP Me Area
                    customStatesDelta[key].actions.splice(index, 1);
                }
            }
        };

        //The button is added to the shell header in HeaderManager
        this._removeActionFromUserActionsMenu = function (sButtonName) {
            var key;
            for (key in oBaseStates) {
                var oState = oBaseStates[key];
                if (key === "blank" || key === "blank-home") {
                    continue;
                }
                var aActions = oState.actions;
                var index = aActions.indexOf(sButtonName);
                if (index !== -1) {
                    //remove the button from FLP Me Area
                    oBaseStates[key].actions.splice(index, 1);
                }
            }
        };

        this.destroyManageQueue = function () {
            this._destroyManageQueue(["home", "embedded-home", "headerless-home", "merged-home", "blank-home", "lean-home"]);
        };

        this.switchState = function (sState/*, bSaveLastState*/) {
            var oState = deepExtend({}, oBaseStates[sState]);

            var oStateWithoutTriggers = removeObjectKeys(oState, {
                aTriggers: true
            });
            Config.emit("/core/shell/model/currentState", oStateWithoutTriggers);
            HeaderManager.switchState(sState);

            //change current state according to the sState.
            oCustomShellStateModel = oApplicationShellStates.customShellState;
            sExtendedShellStateName = undefined;
            this._renderShellState();
            return oState;
        };

        this.setLeftPaneVisibility = function (bVisible, bCurrentState, aStates) {
            this.updateStateProperty("showPane", bVisible, bCurrentState, aStates);
        };

        /**
         * Header hiding animation
         * @deprecated since 1.56. The headerHiding property has been removed.
         */
        this.setHeaderHiding = function () {
            Log.warning("Application Life Cycle model: headerHiding property is deprecated and has no effect");
        };

        // \/ Methods duplicated in the header manager \/

        this._createHeaderEventPayload = function (sPropertyName, vValue, bCurrentState, aStates, bDoNotPropagate, sAction) {
            var oPayload = {
                propertyName: sPropertyName,
                value: vValue,
                aStates: aStates,
                bCurrentState: bCurrentState,
                action: sAction,
                bDoNotPropagate: bDoNotPropagate
            };
            return oPayload;
        };

        this.setHeaderVisibility = function (bVisible, bCurrentState, aStates) {
            var oPayload = this._createHeaderEventPayload("headerVisible", bVisible, bCurrentState, aStates, false);
            HeaderManager.updateStates(oPayload);
        };

        this.showLogo = function (bCurrentState, aStates) {
            this.updateShowLogo(true, bCurrentState, aStates, false);
        };

        this.updateShowLogo = function (bValue, bCurrentState, aStates, bDoNotPropagate) {
            var oPayload = this._createHeaderEventPayload("showLogo", bValue, bCurrentState, aStates, bDoNotPropagate);
            HeaderManager.updateStates(oPayload);
        };

        this.addHeaderItem = function (aIds, bCurrentState, aStates) {
            if (aIds.length) {
                var oPayload = this._createHeaderEventPayload("headItems", aIds, bCurrentState, aStates, false);
                HeaderManager.updateStates(oPayload);
            }
        };

        this.removeHeaderItem = function (aIds, bCurrentState, aStates) {
            var oPayload = this._createHeaderEventPayload("headItems", aIds, bCurrentState, aStates, false, "remove");
            HeaderManager.updateStates(oPayload);
        };

        this.addHeaderEndItem = function (aIds, bCurrentState, aStates, bDoNotPropagate) {
            if (aIds.length) {
                var oPayload = this._createHeaderEventPayload("headEndItems", aIds, bCurrentState, aStates, bDoNotPropagate);
                HeaderManager.updateStates(oPayload);
            }
        };

        this.removeHeaderEndItem = function (aIds, bCurrentState, aStates) {
            var oPayload = this._createHeaderEventPayload("headEndItems", aIds, bCurrentState, aStates, false, "remove");
            HeaderManager.updateStates(oPayload);
        };

        // /\ Methods duplicated in the header manager /\

        this.addSubHeader = function (aIds, bCurrentState, aStates) {
            if (aIds.length) {
                this._addShellItem("subHeader", aIds, bCurrentState, aStates);
            }
        };

        this.removeSubHeader = function (aIds, bCurrentState, aStates) {
            this._removeShellItem("subHeader", aIds, bCurrentState, aStates);
        };

        this.addActionButton = function (aIds, bCurrentState, aStates) {
            this._addActionButton("actions", aIds, bCurrentState, aStates);
        };

        this.removeActionButton = function (aIds, bCurrentState, aStates) {
            this._removeShellItem("actions", aIds, bCurrentState, aStates);
        };

        this.addToolAreaItem = function (sId, bIsVisible, bCurrentState, aStates) {
            if (sId.length) {
                this._addToolAreaItem("toolAreaItems", sId, bIsVisible, bCurrentState, aStates);
            }
        };

        this.removeToolAreaItem = function (aIds, bCurrentState, aStates) {
            this._removeShellItem("toolAreaItems", aIds, bCurrentState, aStates);
        };

        this.addLeftPaneContent = function (aIds, bCurrentState, aStates) {
            if (aIds.length) {
                this._addShellItem("paneContent", aIds, bCurrentState, aStates);
            }
        };

        this.removeLeftPaneContent = function (aIds, bCurrentState, aStates) {
            this._removeShellItem("paneContent", aIds, bCurrentState, aStates);
        };

        this.addRightFloatingContainerItem = function (sId, bCurrentState, aStates) {
            if (sId.length) {
                this._addRightFloatingContainerItem("RightFloatingContainerItems", sId, bCurrentState, aStates);
            }
        };

        this.removeRightFloatingContainerItem = function (aIds, bCurrentState, aStates) {
            this._removeShellItem("RightFloatingContainerItems", aIds, bCurrentState, aStates);
        };

        this.showSettingsButton = function (bCurrentState, aStates) {
            this.addActionButton(["userSettingsBtn"], bCurrentState, aStates, false);
        };

        this.showSignOutButton = function (bCurrentState, aStates) {
            this.addActionButton(["logoutBtn"], bCurrentState, aStates, false);
        };

        this.showRightFloatingContainer = function (bShow) {
            this._showRightFloatingContainer(bShow);
        };

        this.addFloatingActionButton = function (aIds, bCurrentState, aStates) {
            //DO IN FUTURE: Check how to fix the redundant rerendering upon back navigation (caused due to the floatingAction button).
            //Check for itamars commit.
            if (aIds.length) {
                this._addShellItem("floatingActions", aIds, bCurrentState, aStates);
            }
        };

        this.removeFloatingActionButton = function (aIds, bCurrentState, aStates) {
            this._removeShellItem("floatingActions", aIds, bCurrentState, aStates);
        };

        this.updateStateProperty = function (sPropertyString, aValue, bCurrentState, aStates, bDoNotPropagate) {
            if (sPropertyString.startsWith("application")) {
                var oPayload = this._createHeaderEventPayload(sPropertyString, aValue, bCurrentState, aStates, false);
                HeaderManager.updateStates(oPayload);
                return;
            }
            this._setShellItem(sPropertyString, aValue, bCurrentState, aStates, validateValueIsNotUndefined, updateModelProperty, bDoNotPropagate);
        };

        this._handleTriggers = function (oNeededTriggers) {
            var oTriggerToRemove,
                oTriggerToRegister,
                aNewTriggerList = [],
                oAlreadyRegisteredMap = {};

            //prevent registration that invokes fnTrigger.
            bEnableRegisterTriggers = false;

            //remove triggers that we are not going to use.
            while (aTriggersToHandleQueue.length > 0) {
                oTriggerToRemove = aTriggersToHandleQueue.pop();

                //check if we still need it.
                if (oNeededTriggers[oTriggerToRemove.sName]) {
                    //just add it the list of triggers.
                    aNewTriggerList.push(oTriggerToRemove);
                    oAlreadyRegisteredMap[oTriggerToRemove.sName] = oTriggerToRemove;
                } else {
                    //if not needed anymore unregister it.
                    oTriggerToRemove.fnUnRegister(this);
                }
            }

            //add the triggers that are not created yet.
            for (var sTriggerName in oNeededTriggers) {
                if (oNeededTriggers.hasOwnProperty(sTriggerName)) {
                    if (!oAlreadyRegisteredMap[sTriggerName]) {
                        oTriggerToRegister = oNeededTriggers[sTriggerName];
                        oTriggerToRegister.fnRegister(this);
                        aNewTriggerList.push(oTriggerToRegister);
                    }
                }
            }

            //update the current triggered list.
            aTriggersToHandleQueue = aNewTriggerList;

            bEnableRegisterTriggers = true;
        };

        this._registerTriggers = function (aTriggers) {
            // Prevent cyclic trigger registration.
            bEnableRegisterTriggers = false;

            aTriggers.forEach(function (oTrigger) {
                oTrigger.fnRegister(this);
                aTriggersToHandleQueue.push(oTrigger);
            });

            bEnableRegisterTriggers = true;
        };

        function addTriggersToState (aTriggers, oState) {
            var aAddedTriggers = [];

            if (!oState.aTriggers) {
                oState.aTriggers = [];
            }

            aTriggers.forEach(function (oTrigger) {
                var oFilteredTrigger = {
                    sName: oTrigger.sName,
                    fnRegister: oTrigger.fnRegister,
                    fnUnRegister: oTrigger.fnUnRegister
                };

                oState.aTriggers.push(oFilteredTrigger);

                aAddedTriggers.push(oFilteredTrigger);
            });

            return aAddedTriggers;
        }

        this.createTriggersOnState = function (aTriggers/*, oState*/) {
            var aAddedTriggers = addTriggersToState(aTriggers, oBaseStates);

            if (!bInRenderState) {
                this._registerTriggers(aAddedTriggers);
            }
        };

        this.createTriggersOnBaseStates = function (aTriggers, aBaseStateNames, sCurrentStateName) {
            var aAddedTriggers = [];
            aBaseStateNames.forEach(function (sBaseStateName) {
                var oBaseState = oBaseStates[sBaseStateName];

                // safe to assign to aAddedTriggers, because the triggers are
                // the same for all states. We do not use aTriggers directly
                // because addTriggersToState returns another object back.
                aAddedTriggers = addTriggersToState(aTriggers, oBaseState);
            });

            var bBaseOfCurrentStateUpdated = aBaseStateNames.indexOf(sCurrentStateName) >= 0;

            if (bBaseOfCurrentStateUpdated && !bInRenderState) {
                this._registerTriggers(aAddedTriggers);
            }
        };

        this.createTriggers = function (aTriggers, bAddToCurrentState, aBaseStateNames) {
            var oCurrentState = oStateModelToUpdate.currentState;

            if (bAddToCurrentState === true) {
                this.createTriggersOnState(aTriggers, oCurrentState);
                return;
            }

            this.createTriggersOnBaseStates(aTriggers, aBaseStateNames, oCurrentState.stateName);
        };

        this.showShellItem = function (sProperty, sState, bVisible) {
            var aStates = StateHelper.getModelStates(sState),
                sModelCurrentStateProperty = "/currentState" + sProperty,
                sBaseStateName;
            for (var i = 0; i < aStates.length; i++) {
                sBaseStateName = oBaseStates[aStates[i]].stateName;
                oBaseStates[sBaseStateName][sProperty.split("/")[1]] = bVisible;
            }
            if (oStateModelToUpdate.currentState.stateName === sState) {
                updateModelProperty(sModelCurrentStateProperty, bVisible, oStateModelToUpdate);
                if (!bInRenderState) {
                    this._renderShellState();
                }
            }
        };

        this.addCustomItems = function (sStateEntry, aIds, bCurrentState, aStates) {
            if (this._isValidStateEntry(sStateEntry)) {
                this._isValidStateEntry(sStateEntry).fnAdd(aIds, bCurrentState, aStates);
            } else {
                throw new Error("Invalid state entry:" + sStateEntry);
            }
        };

        this.removeCustomItems = function (sStateEntry, aIds, bCurrentState, aStates) {
            if (this._isValidStateEntry(sStateEntry)) {
                this._isValidStateEntry(sStateEntry).fnRemove(aIds, bCurrentState, aStates);
            } else {
                throw new Error("Invalid state entry:" + sStateEntry);
            }
        };

        this.applyExtendedShellState = function (sShellName) {
            sExtendedShellStateName = sShellName;
            this._renderShellState();
        };

        this.addEntryInShellStates = function (sEntry, entrySuffix, fnAdd, fnRemove, oStatesConfiguration) {
            var index,
                sStateName;

            if (!oCustomShellStates[sEntry]) {
                oCustomShellStates[sEntry] = {
                    fnAdd: fnAdd,
                    fnHide: fnRemove
                };

                //add new entry to the model
                var aStates = this._getStatesList();

                for (index = 0; index < aStates.length; index++) {
                    sStateName = aStates[index];
                    oBaseStates[sStateName][sEntry] = oStatesConfiguration[sStateName];
                }

                //create the hook functions
                this["remove" + entrySuffix] = fnRemove;
                this["add" + entrySuffix] = fnAdd;
            } else {
                throw new Error("State entry already exsists:" + sEntry);
            }
        };

        this.addElementToManagedQueue = function (oItem) {
            //update extenstionShell
            //get the current model ref
            var sStateName = Config.last("/core/shell/model/currentState/stateName"),
                oBaseExtensionShellStates,
                sItemId = oItem.getId();

            if (!oApplicationShellStates) {
                oApplicationShellStates = {
                    extendedShellStates: {},
                    aTriggers: [],
                    customShellState: this._createCustomShellState("custom")
                };
            }

            oBaseExtensionShellStates = oApplicationShellStates.extendedShellStates;

            if (!oBaseExtensionShellStates[sStateName]) {
                oBaseExtensionShellStates[sStateName] = {
                    managedObjects: [],
                    customState: undefined
                };
            }

            oBaseExtensionShellStates[sStateName].managedObjects.push(sItemId);
            //Update oManagedElements
            var oManagedElement = oManagedElements[sItemId];

            if (oManagedElement) {
                oManagedElement.nRefCount++;
            } else {
                oManagedElement = {
                    oItem: oItem,
                    nRefCount: 1
                };
                oManagedElements[sItemId] = oManagedElement;
            }
        };

        this.updateNeededTriggersMap = function (oStorage, aTriggers) {
            var index;

            if (!aTriggers) {
                return;
            }
            for (index = 0; index < aTriggers.length; index++) {
                oStorage[aTriggers[index].sName] = aTriggers[index];
            }
        };

        this._renderShellState = function () {
            var sBaseStateName = Config.last("/core/shell/model/currentState/stateName"),
                oExtendedShell, oExtendedState,
                oShellBaseState = deepExtend({}, oBaseStates[sBaseStateName]),
                oExtendedShellStateBase = oApplicationShellStates,
                oCustomState,
                oNeededTriggers = {};

            //This flow can occur, flow: create renderShellState-->Renderer API-->applifeCycle (application related model update)-->renderShellState
            if (bInRenderState) {
                return;
            }

            //Can be undefined, see test "test Shell back button on RTL", validates that when creating the "fiori2" renderer and setting the base states,
            //invokes this "_renderShellState" function, without oExtendedShellStateBase, hence the custom is not defined and no need to merge it with the custom.
            if (oExtendedShellStateBase && oExtendedShellStateBase.customShellState) {
                oCustomState = oExtendedShellStateBase.customShellState.currentState;
            }

            // Change "currentState" property in the model to the new base state
            var oBaseStateClone = {
                currentState: deepExtend({}, oShellBaseState)
            };

            oStateModelToUpdate = oBaseStateClone;
            bInRenderState = true;

            //merge the Extended Shell, if it has one.
            if (sExtendedShellStateName && oExtendedShellStateBase.extendedShellStates && oExtendedShellStateBase.extendedShellStates[sExtendedShellStateName]) {
                oExtendedShell = oExtendedShellStateBase.extendedShellStates[sExtendedShellStateName].customState;
                oExtendedState = oExtendedShell.currentState;
                this._addCustomShellStates(oExtendedState);
            }
            //merge the custom
            if (oCustomState) {
                this._addCustomShellStates(oCustomState);
            }

            oStateModelToUpdate = Config.last("/core/shell/model");

            //list all triggers needed for this shell state..
            if (oShellBaseState && oShellBaseState.aTriggers) {
                this.updateNeededTriggersMap(oNeededTriggers, oShellBaseState.aTriggers);
            }
            if (oExtendedState && oExtendedState.aTriggers) {
                this.updateNeededTriggersMap(oNeededTriggers, oExtendedState.aTriggers);
            }
            if (oCustomState && oCustomState.aTriggers) {
                this.updateNeededTriggersMap(oNeededTriggers, oCustomState.aTriggers);
            }

            //clear all unused registered triggers.
            if (bEnableRegisterTriggers) {
                this._handleTriggers(oNeededTriggers);
            }

            //set to current state.
            delete oBaseStateClone.currentState.aTriggers;
            var oStateWithoutTriggers = removeObjectKeys(oBaseStateClone.currentState, {
                aTriggers: true
            });

            //Because _renderShellState is called directly by RelatedShellElement.js when oApplicationShellStates is changed
            //we need to recalculate header state every time
            HeaderManager.recalculateState(sExtendedShellStateName);
            Config.emit("/core/shell/model/currentState", oStateWithoutTriggers);
            bInRenderState = false;
        };

        this._addCustomShellStates = function (oTemplateStateJSON) {
            this.addToolAreaItem(oTemplateStateJSON.toolAreaItems, false, true);
            this.addSubHeader(oTemplateStateJSON.subHeader, true);
            this.addRightFloatingContainerItem(oTemplateStateJSON.RightFloatingContainerItems, true);
            this.addActionButton(oTemplateStateJSON.actions, true, undefined, false);
            this.addLeftPaneContent(oTemplateStateJSON.paneContent, true);
            this.addFloatingActionButton(oTemplateStateJSON.floatingActions, true);
            this.showRightFloatingContainer(oTemplateStateJSON.showRightFloatingContainer);
        };

        this._createCustomShellState = function (sShellName) {
            var oCustomState = {
                currentState: {
                    stateName: sShellName,
                    headEndItems: [],
                    paneContent: [],
                    headItems: [],
                    actions: [],
                    floatingActions: [],
                    subHeader: [],
                    toolAreaItems: [],
                    RightFloatingContainerItems: [],
                    application: {},
                    showRightFloatingContainer: undefined,
                    headerHeading: undefined
                }
            };
            var shellCustomState = customStatesDelta[sShellName];
            if (shellCustomState) {
                extend(oCustomState.currentState, shellCustomState);
            }

            return oCustomState;
        };

        /*-----------------------------Handlers----------------------------------------------------------------*/

        this._showRightFloatingContainer = function (bShow) {
            this._setShellItem("showRightFloatingContainer", bShow, true, [], validateValueIsNotUndefined, updateModelProperty);
        };

        this._addActionButton = function (sPropertyString, aId, bCurrentState, aStates) {
            function fnUpdate (modelPropertyString, aIds, oCurrentModel) {
                var aActions = getModelProperty(oCurrentModel, modelPropertyString);

                //logoutBtn is at the end
                var iLogoutButtonIndex = aActions.indexOf("logoutBtn");
                if (iLogoutButtonIndex > -1) {
                    aActions.splice.apply(aActions, [iLogoutButtonIndex, 0].concat(aIds));
                } else {
                    aActions = aActions.concat(aIds);
                }

                // remove actions duplicates
                var aFilteredActions = utils.removeDuplicatedActions(aActions);

                function sortActions (aActions) {
                    var aActionButtons = [],
                        aOrderedButtons = [
                            "recentActivitiesBtn",
                            "frequentActivitiesBtn",
                            "openCatalogBtn",
                            "userSettingsBtn",
                            "ActionModeBtn",
                            "EditModeBtn",
                            "ContactSupportBtn"
                        ];

                    for (var i = 0; i < aOrderedButtons.length; i++) {
                        var iItemIndex = aActions.indexOf(aOrderedButtons[i]);
                        if (iItemIndex > -1) {
                            // splice return array, we need the first item from this array
                            aActionButtons.push(aActions.splice(iItemIndex, 1)[0]);
                        }
                    }
                    // add custom buttons to the end
                    aActionButtons = aActionButtons.concat(aActions);
                    return aActionButtons;
                }

                var aNewActionButtons = sortActions(aFilteredActions);
                updateModelProperty(modelPropertyString, aNewActionButtons, oCurrentModel);
            }
            this._setShellItem(sPropertyString, aId, bCurrentState, aStates, noValidation, fnUpdate);
        };

        //TODO check whu we need the prop string as parameter
        this.setFloatingContainerContent = function (sPropertyString, aIds, bCurrentState, aStates) {
            function fnValidation (aItems, aIds, sState) {
                return aIds.length === 1;//aItems.length === 1;
            }
            function fnUpdate (modelPropertyString, aIds, oCurrentModel) {
                updateModelProperty(modelPropertyString, aIds, oCurrentModel);
            }
            this._setShellItem(sPropertyString, aIds, bCurrentState, aStates, fnValidation, fnUpdate);
        };

        this._addShellItem = function (sPropertyString, aId, bCurrentState, aStates) {
            function fnValidation (aItems, aId, sState) {
                if (aItems.length > 0) {
                    Log.warning("You can only add one item. Replacing existing item: " + aItems[0] + " in state: " + sState + ", with the new item: " + aId[0] + ".");
                }
                return true;
            }
            function fnUpdate (modelPropertyString, aIds, oCurrentModel) {
                updateModelProperty(modelPropertyString, aId.slice(0), oCurrentModel);
            }
            this._setShellItem(sPropertyString, aId, bCurrentState, aStates, fnValidation, fnUpdate);
        };

        this._addRightFloatingContainerItem = function (sPropertyString, sId, bCurrentState, aStates) {
            function fnUpdate (modelPropertyString, aId, oCurrentModel) {
                var aItems = getModelProperty(oCurrentModel, modelPropertyString);
                aItems = aItems.concat(aId);

                updateModelProperty(modelPropertyString, aItems, oCurrentModel);
            }

            this._setShellItem(sPropertyString, sId, bCurrentState, aStates, noValidation, fnUpdate);
        };

        this._addToolAreaItem = function (sPropertyString, vIds, bIsVisible, bCurrentState, aStates) {
            function fnUpdate (modelPropertyString, vIds, oCurrentModel) {
                var aItems = getModelProperty(oCurrentModel, modelPropertyString),
                    sId,
                    index;

                if (typeof vIds === "string") {
                    vIds = [vIds];
                }

                for (index = 0; index < vIds.length; index++) {
                    sId = vIds[index];
                    if (aItems.indexOf(sId) < 0) {
                        aItems.push(sId);
                    }
                }

                updateModelProperty(modelPropertyString, aItems, oCurrentModel);
            }

            if (bIsVisible) {
                var index,
                    aPassStates = StateHelper.getPassStates(aStates);

                for (index = 0; index < aPassStates.length; index++) {
                    this.showShellItem("/toolAreaVisible", aPassStates[index], true);
                }
            }

            this._setShellItem(sPropertyString, vIds, bCurrentState, aStates, noValidation, fnUpdate);
        };

        this._removeShellItem = function (sPropertyString, sId, bCurrentState, aStates) {
            function fnValidation (aItems, aIds) {
                var location,
                    sId,
                    index;

                for (index = 0; index < aIds.length; index++) {
                    sId = aIds[index];
                    location = aItems.indexOf(sId);
                    if (location < 0) {
                        Log.warning("You cannot remove Item: " + sId + ", the Item does not exists.");
                        return false;
                    }
                }

                return true;
            }
            function fnUpdate (modelPropertyString, aIds, oCurrentModel) {
                var aItems = getModelProperty(oCurrentModel, modelPropertyString),
                    location,
                    sId,
                    index;

                for (index = 0; index < aIds.length; index++) {
                    sId = aIds[index];
                    location = aItems.indexOf(sId);
                    if (location > -1) {
                        aItems.splice(location, 1);
                    }
                }
                updateModelProperty(modelPropertyString, aItems, oCurrentModel);
            }
            this._setShellItem(sPropertyString, sId, bCurrentState, aStates, fnValidation, fnUpdate);
        };

        this._setShellItem = function (sPropertyString, aOrgIds, bCurrentState, aStates, fnValidation, fnUpdate, bDoNotPropagate) {
            var modelPropertyString,
                aItems;

            //clone the ids, to protect the model.
            var aIds = Array.isArray(aOrgIds) ? aOrgIds.slice(0) : aOrgIds;
            if (bCurrentState === true) {
                modelPropertyString = "/currentState/" + sPropertyString;
                aItems = getModelProperty(oStateModelToUpdate, modelPropertyString);

                //make validations
                if (fnValidation(aItems, aIds, "currentState") === false) {
                    return;
                }

                //also update the oCustomShellStateModel
                //check that we are not pointing to a shadow shell
                if (!bInCreateTemplate && !bInRenderState) {
                    //Update the custom state only if you are called from custom api.
                    fnUpdate(modelPropertyString, aIds, oCustomShellStateModel);
                    Core.getEventBus().publish("launchpad", "updateShell", {
                        oModel: oStateModelToUpdate,
                        path: modelPropertyString,
                        aIds: aIds,
                        sProperty: sPropertyString
                    });
                    this._renderShellState();
                } else {
                    //update the modelToUpdate.
                    fnUpdate(modelPropertyString, aIds, oStateModelToUpdate);
                }
            } else {
                var aPassStates = bDoNotPropagate ? aStates : StateHelper.getPassStates(aStates),
                    i,
                    oCurrentStateName = oStateModelToUpdate.currentState.stateName;

                for (i = 0; i < aPassStates.length; i++) {
                    var sState = aPassStates[i],
                        j;
                    aItems = getModelProperty(oBaseStates[sState], "/" + sPropertyString);

                    //make validations
                    if (fnValidation(aItems, aIds, sState) === false) {
                        continue;
                    }

                    var aModelStates = StateHelper.getModelStates(sState, bDoNotPropagate);
                    for (j = 0; j < aModelStates.length; j++) {
                        modelPropertyString = "/" + aModelStates[j] + "/" + sPropertyString;
                        fnUpdate(modelPropertyString, aIds, oBaseStates);
                        if (oCurrentStateName === aModelStates[j]) {
                            //It was added to the base shell state so after we add it to the base recalculate the shell state.
                            if (!bInRenderState) {
                                this._renderShellState();
                            }
                        }
                    }
                }
            }
        };

        this._getStatesList = function () {
            return Object.keys(oBaseStates);
        };

        this._destroyManageQueue = function (/*aExcludeStates*/) {
            var nExtendedShellStateIndex,
                sElementIdToRelease,
                oManagedElemet,
                oBaseStateExtensionShellStates,
                sBaseExtShellStateKey,
                oStateExtensionShellStates;

            oBaseStateExtensionShellStates = oApplicationShellStates.extendedShellStates;
            //loop over extended shell states
            for (sBaseExtShellStateKey in oBaseStateExtensionShellStates) {
                if (oBaseStateExtensionShellStates.hasOwnProperty(sBaseExtShellStateKey)) {
                    oStateExtensionShellStates = oBaseStateExtensionShellStates[sBaseExtShellStateKey].managedObjects;
                    //loop over the elements in that extension shell state
                    for (nExtendedShellStateIndex = 0; nExtendedShellStateIndex < oStateExtensionShellStates.length; nExtendedShellStateIndex++) {
                        sElementIdToRelease = oStateExtensionShellStates[nExtendedShellStateIndex];
                        oManagedElemet = oManagedElements[sElementIdToRelease];
                        //update the number of references to the element, because the extended shell state ni longer available
                        oManagedElemet.nRefCount--;

                        if (oManagedElemet.nRefCount === 0) {
                            //delete the object
                            oManagedElemet.oItem.destroy();
                            oManagedElements[sElementIdToRelease] = null;
                        }
                    }
                    //remove the base extension for that shell state
                    delete oBaseStateExtensionShellStates[sBaseExtShellStateKey];
                }
            }
        };

        this._isValidStateEntry = function (sName) {
            return !!oCustomShellStates[sName];
        };

        this.getModelToUpdate = function () {
            return oStateModelToUpdate;
        };

        this.setModelToUpdate = function (oModelToUpdate, bCreateTemplate) {
            bInCreateTemplate = bCreateTemplate;
            oStateModelToUpdate = oModelToUpdate;
        };

        this._getManagedElements = function () {
            return oManagedElements;
        };

        this.extendStates = function (oStates) {
            var stateEntryKey;
            for (stateEntryKey in oStates) {
                if (oStates.hasOwnProperty(stateEntryKey)) {
                    utils.updateProperties(oBaseStates[stateEntryKey], oStates[stateEntryKey]);
                }
            }
        };

        this.getBaseStateMember = function (sStateName, sBaseStateMember) {
            return oBaseStates[sStateName][sBaseStateMember];
        };

        this.getCustomStateDeltaMember = function (sStateName, sCustomStateDeltaMember) {
            return customStatesDelta[sStateName][sCustomStateDeltaMember];
        };

        this.getAllStatesInDelta = function () {
            return Object.keys(customStatesDelta);
        };
    }

    var oElementsModel = new ElementsModel();
    return oElementsModel;
}, /* bExport= */ true);
