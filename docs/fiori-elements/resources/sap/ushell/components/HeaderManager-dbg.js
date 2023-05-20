// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/ui/Device",
    "sap/ushell/components/_HeaderManager/PropertyStrategiesFactory",
    "sap/ushell/components/StateHelper",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/utils",
    "sap/ushell/utils/clone"
], function (
    ObjectPath,
    Device,
    _PropertyStrategiesFactory,
    StateHelper,
    Config,
    EventHub,
    ushellUtils,
    ushellClone
) {
    "use strict";

    var oHeaderDefaultProperties = {
        application: {},
        centralAreaElement: null,
        headEndItems: [],
        headItems: [],
        headerVisible: true,
        showLogo: false,
        ShellAppTitleState: undefined,
        rootIntent: Config.last("/core/shellHeader/rootIntent"), // never changes during runtime
        homeUri: Config.last("/core/shellHeader/homeUri"), // might change during runtime; see "handleCurrentSpaceAndPage"
        title: ""
    };

    var oHeaderBaseStates;
    var oApplicationStates;
    var sOverflowID = "endItemsOverflowBtn";
    var sCurrentRangeName; // change it during the resize event only, to enable tests
    var BASE_STATES = {
        blank: {},
        "blank-home": {},
        home: {
            headItems: []
        },
        app: {
            headItems: ["backBtn"]
        },
        minimal: {
            headItems: []
        },
        standalone: {
            headItems: ["backBtn"]
        },
        embedded: {
            headItems: ["backBtn"]
        },
        "embedded-home": {
            headItems: []
        },
        headerless: {
            headItems: ["backBtn"],
            headerVisible: false
        },
        merged: {
            headItems: ["backBtn"]
        },
        "headerless-home": {
            headerVisible: false
        },
        "merged-home": {},
        lean: {
            headItems: []
        },
        "lean-home": {}
    };
    var aDoables = [];

    /**
     * Initialization of the HeaderManager.
     *
     * @param {object} oConfig The shell config.
     * @param {object} oApplicationShellStates The global state from AppLifeCycle.
     */
    function init (oConfig, oApplicationShellStates) {
        var sInitialState = oConfig && oConfig.appState ? oConfig.appState : "home";
        oHeaderBaseStates = _createInitialState(oConfig);
        // custom states are received from the AppLifeCycle;
        // it is a global object, might be changed by AppLifeCycle anytime;
        // we keep the reference to this object and use it for calculation of the current state
        oApplicationStates = oApplicationShellStates;

        sCurrentRangeName = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name;

        validateShowLogo();

        _subscribeToEvents();

        // Emit the initial state of header
        switchState(sInitialState);
        recalculateState();
    }

    /**
     *  Destroys the Header manager.
     *  Destroys header controls created in the HeaderManager.
     */
    function destroy () {
        _unSubscribeFromEvents();
    }

    function _subscribeToEvents () {
        var oDoable = EventHub.on("setHeaderCentralAreaElement").do(function (oParameters) {
            updateStates({
                propertyName: "centralAreaElement",
                value: oParameters.id,
                aStates: StateHelper.getPassStates(oParameters.states), // If no states provided - set for all states
                bCurrentState: !!oParameters.currentState,
                bDoNotPropagate: !!oParameters.bDoNotPropagate
            });
        });
        aDoables.push(oDoable);
        aDoables.push(EventHub.on("updateHeaderOverflowState").do(_handleHeaderResize));
        Device.media.attachHandler(_handleHeaderResize, this, Device.media.RANGESETS.SAP_STANDARD);
        // Overflow must be checked each time when a button is added to the header:
        aDoables.push(Config.on("/core/shellHeader/headEndItems").do(handleEndItemsOverflow));
        aDoables.push(Config.on("/core/shell/model/currentSpaceAndPage").do(handleCurrentSpaceAndPage));
    }

    function _unSubscribeFromEvents () {
        if (aDoables) {
            aDoables.forEach(function (oDoable) {
                oDoable.off();
            });
        }
        Device.media.detachHandler(_handleHeaderResize, this, Device.media.RANGESETS.SAP_STANDARD);
    }

    function _handleHeaderResize (oParams) {
        if (oParams && oParams.name) {
            sCurrentRangeName = oParams.name;
        }
        validateShowLogo();
        handleEndItemsOverflow();
    }

    function validateShowLogo (deviceType) {
        var sCurrentState = Config.last("/core/shell/model/currentState/stateName");
        var bIsHeaderLessState = sCurrentState === "merged" || sCurrentState === "headerless";
        var bShellLogoVisible = !bIsHeaderLessState;

        // Set the arg bDoNotPropagate to true, otherwise changes will be redundantly apply also to other states
        // (e.g. - headerless should always be presented without logo)
        updateStates({
            propertyName: "showLogo",
            value: bShellLogoVisible,
            aStates: ["home", "app", "blank", "blank-home", "minimal", "lean"],
            bCurrentState: false,
            bDoNotPropagate: true
        });
    }

    /**
     * Handles updates of "currentSpaceAndPage", adjusting the header "homeUri" when necessary.
     * The "homeUri" is the URI used as the navigation target of the header Logo.
     * If Spaces is enabled and "homeNavigationTarget" is "origin_page", "currentSpaceAndPage" is used for setting the new "homeUri".
     * If otherwise, the "homeUri" is left unchanged (it initially points to the "rootIntent"; see {@link #_createInitialState}).
     *
     * @param {object} oCurrentSpaceAndPage New property of "currentSpaceAndPage" (from "/core/shell/model/currentSpaceAndPage").
     * @private
     */
    function handleCurrentSpaceAndPage (oCurrentSpaceAndPage) {
        if (Config.last("/core/spaces/enabled") && Config.last("/core/spaces/homeNavigationTarget") === "origin_page") {
            var sNewHash = oCurrentSpaceAndPage ? encodeURI(oCurrentSpaceAndPage.hash) : oHeaderDefaultProperties.rootIntent;

            var fnUpdateStates = (this && this.updateStates) || updateStates; // this check is for testing, to use the stub instead of the closure

            fnUpdateStates({
                propertyName: "homeUri",
                value: "#" + sNewHash
            });
        }
    }

    /**
     * Logic to determine if the headEndItemsOverflow button should be visible.
     * Overflow button is shown only when oParams.name or sCurrentRangeName is "Phone".
     *
     * @param {object} oParams An object containing a device name.
     */
    function handleEndItemsOverflow (oParams) {
        var aEndItems = Config.last("/core/shellHeader/headEndItems");
        var bIsOverflowVisible = aEndItems.indexOf(sOverflowID) > -1;
        var sDeviceType = oParams && oParams.name || sCurrentRangeName;

        if (sDeviceType === "Phone" && !bIsOverflowVisible && aEndItems.length > 2) {
            // Show overflow if more than two buttons are in the header
            addHeaderEndItem([sOverflowID], false, ["home", "app"]);
        } else if (sDeviceType !== "Phone" && bIsOverflowVisible) {
            // Destroy the popover to avoid duplicate elements ids in the DOM
            // and to ensure the endItems are rendered correctly in the header
            var oPopover = sap.ui.getCore().byId("headEndItemsOverflow");
            if (oPopover) {
                oPopover.destroy();
            }
            removeHeaderEndItem([sOverflowID], false, ["home", "app"]);
        }
    }

    function addHeaderEndItem (aIds, bCurrentState, aStates, bDoNotPropagate) {
        updateStates({
            propertyName: "headEndItems",
            value: aIds,
            aStates: aStates,
            bCurrentState: !!bCurrentState,
            bDoNotPropagate: !!bDoNotPropagate
        });
    }

    function removeHeaderEndItem (aIds, bCurrentState, aStates) {
        updateStates({
            propertyName: "headEndItems",
            value: aIds,
            aStates: aStates,
            bCurrentState: !!bCurrentState,
            action: "remove",
            bDoNotPropagate: false
        });
    }

    // Header state methods

    /**
     * Generates a base header state.
     *
     * @param {object} oStateDeltas The state delta.
     * @param {object} oDefaults The defaults.
     * @returns {object} The state.
     */
    function generateBaseHeaderState (oStateDeltas, oDefaults) {
        var oState = {};
        Object.keys(oStateDeltas).forEach(function (sDeltaState) {
            var oDelta = oStateDeltas[sDeltaState];
            oState[sDeltaState] = Object.keys(oDelta).reduce(function (oTarget, sDeltaProperty) {
                oTarget[sDeltaProperty] = oDelta[sDeltaProperty];
                return oTarget;
            }, ushellClone(oDefaults));
        });
        return oState;
    }

    /**
     * Updates states.
     *
     * @param {object} oParameters Parameters used for the update.
     */
    function updateStates (oParameters) {
        var sPropertyName = oParameters.propertyName;
        var aStatesToUpdate = !oParameters.bCurrentState ? StateHelper.getAllStateToUpdate(oParameters.aStates, oParameters.bDoNotPropagate) : [];
        var oCurrentState = Config.last("/core/shellHeader");
        var sCurrentStateName = Config.last("/core/shell/model/currentState/stateName");
        var valueToApply = oParameters.value;

        if (sPropertyName.charAt(0) === "/") {
            sPropertyName = sPropertyName.substring(1);
        }
        var oPropertyStrategy = _PropertyStrategiesFactory(sPropertyName, oParameters.action);

        // If we don't know how to deal with property, don't do any updates
        if (!oPropertyStrategy) {
            return;
        }
        // Don't update any base states if bCurrentState is true
        if (!oParameters.bCurrentState) {
            oHeaderBaseStates = _calculateNewBaseStates(
                oHeaderBaseStates,
                sPropertyName,
                oPropertyStrategy,
                aStatesToUpdate,
                valueToApply);
        }
        // Update current header state in sap/ushell/Config
        if (aStatesToUpdate.indexOf(sCurrentStateName) > -1 || oParameters.bCurrentState) {
            var vCurrentPropertyValue = ObjectPath.get(sPropertyName.split("/"), oCurrentState);
            var vNewPropertyValue = oPropertyStrategy.execute(vCurrentPropertyValue, valueToApply);
            if (vCurrentPropertyValue !== vNewPropertyValue) {
                ObjectPath.set(sPropertyName.split("/"), vNewPropertyValue, oCurrentState);
                _updateConfig(sPropertyName, oCurrentState);
            }
        }
        // In case of the current state we need to update custom model (reference object from AppLifeCycle) as well
        if (oParameters.bCurrentState) {
            _updateCustomModel(sPropertyName, oPropertyStrategy, valueToApply);
        }
    }

    function extendStates (oStates) {
        var stateEntryKey;
        for (stateEntryKey in oStates) {
            if (oStates.hasOwnProperty(stateEntryKey)) {
                ushellUtils.updateProperties(oHeaderBaseStates[stateEntryKey], oStates[stateEntryKey]);
            }
        }
    }

    function switchState (sNewStateName) {
        var oBaseState = oHeaderBaseStates[sNewStateName];
        if (!oBaseState) {
            throw new Error("the state (" + sNewStateName + ") does not exist");
        }

        Config.emit("/core/shellHeader", ushellClone(oBaseState));
    }

    /**
     * Recalculates states.
     * We recalculate states because "customShellState" and "extendedShellStates" are global objects and can be changed by AppLifeCycle.
     *
     * @param {string} sExtendedStateName Name of the extended state.
     */
    function recalculateState (sExtendedStateName) {
        // Take the state from config, because the config save execution with currentState=true
        var oBaseState = Config.last("/core/shellHeader");
        var oCustomState;
        var oExtendedState;

        if (oApplicationStates && oApplicationStates.customShellState) {
            oCustomState = oApplicationStates.customShellState.currentState;
        }
        if (sExtendedStateName && oApplicationStates.extendedShellStates[sExtendedStateName]) {
            oExtendedState = oApplicationStates.extendedShellStates[sExtendedStateName].customState.currentState;
        }
        Config.emit("/core/shellHeader", calculateCurrentHeaderState(oBaseState, oCustomState, oExtendedState));
    }

    /**
     * Calculates current header state.
     *
     * @param {object} oBaseState The base state.
     * @param {object} oCustomState The custom state.
     * @param {object} oExtendedState The extended state.
     * @returns {undefined}
     */
    function calculateCurrentHeaderState (oBaseState, oCustomState, oExtendedState) {
        var oResult = {};
        Object.keys(oBaseState).forEach(function (sPropertyName) {
            var oPropertyStrategy = _PropertyStrategiesFactory(sPropertyName);
            var vPropertyValue = ushellClone(oBaseState[sPropertyName]);
            // when a strategy is available, the property from base state might be overridden
            if (oPropertyStrategy) {
                // Extend state has higher property than custom property
                if (oExtendedState) {
                    vPropertyValue = oPropertyStrategy.execute(vPropertyValue, oExtendedState[sPropertyName]);
                }
                if (oCustomState) {
                    vPropertyValue = oPropertyStrategy.execute(vPropertyValue, oCustomState[sPropertyName]);
                }
            }
            oResult[sPropertyName] = vPropertyValue;
        });

        // Special case: ShellAppTitleState is managed by the ShellAppTitle, keep the current value
        oResult.ShellAppTitleState = Config.last("/core/shellHeader/ShellAppTitleState");

        return oResult;
    }

    /**
     * Creates an initial state.
     *
     * @param {object} oConfig The view configuration.
     * @returns {object} Object containing the initial state.
     */
    function _createInitialState (oConfig) {
        if (oConfig) {
            oHeaderDefaultProperties.rootIntent = oConfig.rootIntent; // never changes during runtime
            oHeaderDefaultProperties.homeUri = "#" + oConfig.rootIntent; // might change during runtime; see "handleCurrentSpaceAndPage"
        }
        var oBaseStates = generateBaseHeaderState(BASE_STATES, oHeaderDefaultProperties);

        function _addEndItemToShellHeader (btnName, oBaseStates) {
            for (var key in oBaseStates) {
                if (key === "blank" || key === "blank-home") {
                    continue;
                }
                if ((btnName === "openCatalogBtn") && (key === "lean" || key === "lean-home")) {
                    continue;
                }
                if (btnName === "ContactSupportBtn") {
                    if (["home", "app", "minimal", "standalone", "embedded", "embedded-home", "lean"].indexOf(key) === -1) {
                        continue;
                    }
                }

                // Add the button to the shell header if not yet exists in this state
                var index = oBaseStates[key].headEndItems.indexOf(btnName);
                if (index === -1) {
                    oBaseStates[key].headEndItems.push(btnName);
                }
            }
        }

        function _updateTitle (sTitle, oBaseStates) {
            var key;
            for (key in oBaseStates) {
                oBaseStates[key].title = sTitle;
            }
        }

        if (oConfig) {
            if (oConfig.moveContactSupportActionToShellHeader) {
                _addEndItemToShellHeader("ContactSupportBtn", oBaseStates);
            }
            if (oConfig.moveAppFinderActionToShellHeader) {
                _addEndItemToShellHeader("openCatalogBtn", oBaseStates);
            }
            if (oConfig.title) {
                _updateTitle(oConfig.title, oBaseStates);
            }
        }

        return oBaseStates;
    }

    function _calculateNewBaseStates (oBaseStates, sPropertyName, oPropertyStrategy, aStates, valueToApply) {
        if (aStates.length === 0) {
            return oBaseStates;
        }
        var oNewState = ushellClone(oBaseStates);
        aStates.forEach(function (sStateName) {
            var oState = oNewState[sStateName];
            if (oState) {
                var vNewValue = oPropertyStrategy.execute(ObjectPath.get(sPropertyName.split("/"), oState), valueToApply);
                ObjectPath.set(sPropertyName.split("/"), vNewValue, oState);
            }
        });
        return oNewState;
    }

    function _updateCustomModel (sPropertyName, oPropertyStrategy, valueToApply) {
        if (!oApplicationStates) {
            return;
        }
        var oCustomState = oApplicationStates.customShellState.currentState;
        var vNewValue = oPropertyStrategy.execute(ObjectPath.get(sPropertyName.split("/"), oCustomState), valueToApply);
        ObjectPath.set(sPropertyName.split("/"), vNewValue, oCustomState);
    }

    function _updateConfig (sPropertyName, oCurrentState) {
        var sRootProperty = sPropertyName.split("/").shift();
        Config.emit("/core/shellHeader/" + sRootProperty, oCurrentState[sRootProperty]);
    }

    function _getBaseState (sState) {
        var result;
        try {
            result = oHeaderBaseStates[sState];
        } catch (ex) {
            result = undefined;
        }
        return result;
    }

    function _getBaseStateMember (sState, sProperty) {
        var result;
        try {
            result = _getBaseState(sState)[sProperty];
        } catch (ex) {
            result = undefined;
        }
        return result;
    }

    function _rewriteBaseStates (oTestBaseState) {
        oHeaderBaseStates = oTestBaseState;
    }

    return {
        init: init,
        destroy: destroy,

        // State methods
        switchState: switchState,
        updateStates: updateStates,
        recalculateState: recalculateState,
        extendStates: extendStates,

        /* for testing */
        handleCurrentSpaceAndPage: handleCurrentSpaceAndPage,
        handleEndItemsOverflow: handleEndItemsOverflow,
        validateShowLogo: validateShowLogo,
        _createInitialState: _createInitialState,
        _generateBaseHeaderState: generateBaseHeaderState,
        _getBaseState: _getBaseState,
        _getBaseStateMember: _getBaseStateMember,
        _resetBaseStates: _rewriteBaseStates
    };
});
