// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview handle all the related shell elements of the different applications.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/extend"
], function (Log, extend) {
    "use strict";

    function RelatedShellElements () {
        // handle the history service
        var aDanglingControls = [];
        var ElementsModel;
        var oApplicationRelatedElementsModel; // contains the current application Related Elements
        var customShellState = {};
        var oStateModelToUpdate;
        var bIsInDangling = false;
        var oCheckPoints = {};
        var oAppModel;
        var aTriggers = [];
        var customStatesDelta = {
            home: {
                actions: []
            },
            app: {
                actions: ["aboutBtn"]
            },
            minimal: {
                actions: ["aboutBtn"]
            },
            standalone: {
                actions: ["aboutBtn"]
            },
            embedded: {
                actions: ["aboutBtn"]
            },
            "embedded-home": {
                actions: ["aboutBtn"]
            },
            lean: {
                actions: ["aboutBtn"]
            }
        };

        // actual states conversion map
        var oApplicationTypeToElementModelStateMap = {
            home: {
                NWBC: {
                    headerless: "headerless",
                    default: "minimal"
                },
                TR: {
                    headerless: "minimal",
                    default: "minimal"
                },
                default: {
                    default: "home"
                }
            },
            app: {
                NWBC: {
                    headerless: "headerless",
                    default: "app"
                },
                TR: {
                    headerless: "minimal",
                    default: "app"
                },
                default: {
                    default: "app"
                }
            }
        };

        /**
         * Init related shell elements
         * @param inElementsModel - elements model
         * @param aActions - actions to add to the custom states
         */
        this.init = function (inElementsModel, aActions) {
            ElementsModel = inElementsModel;
            if (aActions && aActions.length > 0) {
                Object.keys(customStatesDelta).forEach(function (sState) {
                    customStatesDelta[sState].actions = aActions.concat(customStatesDelta[sState].actions);

                });
            }
        };

        this.processDangling = function () {
            for (var iDandlingInd = 0; iDandlingInd < aDanglingControls.length; iDandlingInd++) {
                var oDang = aDanglingControls.pop();
                oDang.func.apply(this, oDang.args);
            }
        };


        this.setDangling = function (bIsDangling) {
            bIsInDangling = bIsDangling;
        };

        this.calculateElementsState = function (sNav, sAppType, appState, isExplicit) {
            var oNav = oApplicationTypeToElementModelStateMap[sNav]
                ? oApplicationTypeToElementModelStateMap[sNav]
                : oApplicationTypeToElementModelStateMap.default;
            var oApp = oNav[isExplicit ? undefined : sAppType] ? oNav[sAppType] : oNav.default;

            return oApp[appState] ? oApp[appState] : oApp.default;
        };

        this.createCustomShellState = function (sShellName) {
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

        this.createExtendedShellState = function (sShellName, fnCreationInstructions) {
            var oBaseExtensionShellStates;
            var oCustomStates = this.createCustomShellState(sShellName);

            oBaseExtensionShellStates = oApplicationRelatedElementsModel.extendedShellStates;

            //validate that extension shell state does not already exists.
            if (oBaseExtensionShellStates[sShellName]) {
                return false;
            }

            //change to shadow shell.
            oStateModelToUpdate = oCustomStates;
            //force model
            fnCreationInstructions();
            //store shell state
            if (oBaseExtensionShellStates[sShellName]) {
                oBaseExtensionShellStates[sShellName].customState = oCustomStates;
            } else {
                oBaseExtensionShellStates[sShellName] = {
                    managedObjects: [],
                    customState: oCustomStates
                };
            }

            //restore
            oStateModelToUpdate = oApplicationRelatedElementsModel.customShellState;

            return true;
        };

        this.assignNew = function (sState) {
            customShellState = this.createCustomShellState(sState);
            oApplicationRelatedElementsModel.customShellState = customShellState;
            oApplicationRelatedElementsModel.aTriggers = [];
            oApplicationRelatedElementsModel.extendedShellStates = {};
            oApplicationRelatedElementsModel.oCheckPoints = {};

            this._updateModel();

            oStateModelToUpdate = oApplicationRelatedElementsModel.customShellState;
        };


        this._genericSetItem = function (sAttr, oVal) {
            var aAttrParts = sAttr.split("/");
            var sLastAttr = aAttrParts.pop();
            var oLastModelPart = aAttrParts.reduce(function (oCurrentModelPart, sMember) {
                return oCurrentModelPart[sMember];
            }, oStateModelToUpdate.currentState);

            oLastModelPart[sLastAttr] = oVal;
            ElementsModel._renderShellState();
        };

        this._genericAddItems = function (sAttr, aIds) {
            var oCurrItems = oStateModelToUpdate.currentState[sAttr];

            oStateModelToUpdate.currentState[sAttr] = oCurrItems.concat(aIds);

            ElementsModel._renderShellState();
        };

        this.genericSetItem = function (sAttr, oVal) {
            if (bIsInDangling) {
                aDanglingControls.push({
                    func: this._genericSetItem,
                    args: arguments
                });
            } else {
                this._genericSetItem(sAttr, oVal);
            }
        };

        this.genericAddItems = function (sAttr, aIds) {
            if (bIsInDangling) {
                aDanglingControls.push({
                    func: this.genericAddItems,
                    args: arguments
                });
            } else {
                this._genericAddItems(sAttr, aIds);
            }
        };

        this.setShellModelForApplications = function (sAttr, oValue) {
            var aListOfAvailableAttributes = [
                "paneContent",
                "headItems",
                "RightFloatingContainerItems",
                "toolAreaItems",
                "floatingActions",
                "showRightFloatingContainer",
                "headEndItems",
                "headerVisible",
                "subHeader",
                "actions"
            ];

            if (aListOfAvailableAttributes.indexOf(sAttr) > -1) {
                this.genericSetItem(sAttr, oValue);
            } else {
                Log.error("Not a valid attribute:" + sAttr);
            }
        };

        this.addShellModelForApplications = function (sAttr, aIds) {
            var aListOfAvailableAttributes = [
                "paneContent",
                "headItems",
                "RightFloatingContainerItems",
                "toolAreaItems",
                "floatingActions",
                "showRightFloatingContainer",
                "headEndItems",
                "headerVisible",
                "subHeader",
                "actions"
            ];

            if (aListOfAvailableAttributes.indexOf(sAttr) > -1) {
                this.genericAddItems(sAttr, aIds);
            } else {
                Log.error("Not a valid attribute:" + sAttr);
            }
        };

        this.setStateModelToUpdate = function (oInStateModelToUpdate) {
            oStateModelToUpdate = oInStateModelToUpdate;
        };

        this.getStateModelToUpdate = function () {
            return oStateModelToUpdate;
        };

        this.model = function () {
            if (!oApplicationRelatedElementsModel) {
                this.create();
            }

            oAppModel = {
                customShellState: oApplicationRelatedElementsModel.customShellState,
                aTriggers: oApplicationRelatedElementsModel.aTriggers,
                extendedShellStates: oApplicationRelatedElementsModel.extendedShellStates,
                oCheckPoints: oApplicationRelatedElementsModel.oCheckPoints
            };

            return oAppModel;
        };


        this._updateModel = function () {
            if (oAppModel) {
                oAppModel.customShellState = oApplicationRelatedElementsModel.customShellState;
                oAppModel.aTriggers = oApplicationRelatedElementsModel.aTriggers;
                oAppModel.extendedShellStates = oApplicationRelatedElementsModel.extendedShellStates;
                oAppModel.oCheckPoints = oApplicationRelatedElementsModel.oCheckPoints;
            }
        };

        this.getAppRelatedElement = function () {
            return {
                customShellState: oApplicationRelatedElementsModel.customShellState,
                aTriggers: oApplicationRelatedElementsModel.aTriggers,
                extendedShellStates: oApplicationRelatedElementsModel.extendedShellStates,
                oCheckPoints: oApplicationRelatedElementsModel.oCheckPoints
            };
        };

        this.create = function () {
            oApplicationRelatedElementsModel = {
                extendedShellStates: {},
                oCheckPoints: oCheckPoints,
                aTriggers: aTriggers,
                customShellState: {
                    currentState: {
                        stateName: "app",
                        headEndItems: [],
                        paneContent: [],
                        headItems: [],
                        actions: ["aboutBtn"],
                        floatingActions: [],
                        subHeader: [],
                        toolAreaItems: [],
                        RightFloatingContainerItems: [],
                        application: {},
                        showRightFloatingContainer: undefined,
                        headerHeading: undefined
                    }
                }
            };

            oStateModelToUpdate = oApplicationRelatedElementsModel.customShellState;
            this._updateModel();

            return oApplicationRelatedElementsModel;
        };

        this.restore = function (oStorageEntry) {
            if (oStorageEntry && oStorageEntry.appRelatedElements) {
                var oAppShellModel = oStorageEntry.appRelatedElements;
                oApplicationRelatedElementsModel.aTriggers = oAppShellModel.aTriggers;
                oApplicationRelatedElementsModel.extendedShellStates = oAppShellModel.extendedShellStates;
                oApplicationRelatedElementsModel.oCheckPoints = oAppShellModel.oCheckPoints;
                oApplicationRelatedElementsModel.customShellState = oAppShellModel.customShellState;
            }
            this._updateModel();

            oStateModelToUpdate = oApplicationRelatedElementsModel.customShellState;
        };

        this.store = function (oModel) {
        };

        this.clean = function () {
            oApplicationRelatedElementsModel = undefined;
        };

        this.destroy = function (oModel) {
            //handle destroy of the services
        };
    }


    return new RelatedShellElements();
}, /* bExport= */ true);
