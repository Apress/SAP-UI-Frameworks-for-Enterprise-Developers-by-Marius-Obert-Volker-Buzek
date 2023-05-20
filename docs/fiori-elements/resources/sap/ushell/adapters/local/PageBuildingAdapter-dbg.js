// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's page builder adapter for the 'demo' platform.
 * It creates chip instances from chip raw data. Compared to the other platforms this adapter has restricted functionality.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ui/core/ComponentContainer",
    "sap/ui/core/Component"
], function (ComponentContainer, Component) {
    "use strict";

    var PageBuildingAdapter = function (oSystem, sParameter, oConfig) {
        this.oCache = (oConfig && oConfig.config && oConfig.config.tiles) || {};
    };

    PageBuildingAdapter.prototype.getFactory = function () {
        return this;
    };

    PageBuildingAdapter.prototype.createChipInstance = function (oChipRawData) {
        var oImplementation = this.oCache[oChipRawData.chipId];
        var oSimplifiedChip = oChipRawData;
        oSimplifiedChip.configuration = oSimplifiedChip.configuration ? JSON.parse(oSimplifiedChip.configuration) : {};
        oSimplifiedChip.bags = oSimplifiedChip.bags ? oSimplifiedChip.bags : {};

        // Prepare contract with restricted functionality
        // we assume that there is only a single handler per tile
        var fnSetTypeHandler = function () { };
        var oContracts = {
            types: {
                setType: function (sValue) {
                    fnSetTypeHandler(sValue);
                },
                attachSetType: function (fnHandler) {
                    fnSetTypeHandler = fnHandler;
                }
            },
            visible: {
                setVisible: function () { }
            },
            url: {
                getApplicationSystem: function () { }
            },
            configurationUi: {
                isEnabled: function () {
                    return false;
                }
            },
            configuration: {
                getParameterValueAsString: function (sParameterName) {
                    return oSimplifiedChip.configuration[sParameterName];
                }
            },
            bag: {
                getBag: function (sBagName) {
                    var oBag = oSimplifiedChip.bags[sBagName];
                    if (!oBag) {
                        oBag = {};
                        oSimplifiedChip.bags[sBagName] = oBag;
                    }
                    oBag.properties = oBag.properties ? oBag.properties : {};
                    oBag.texts = oBag.texts ? oBag.texts : {};

                    return {
                        getPropertyNames: function () {
                            return Object.keys(oBag.properties);
                        },
                        getProperty: function (sPropertyName) {
                            return oBag.properties[sPropertyName];
                        },
                        setProperty: function (sPropertyName, sValue) {
                            oBag.properties[sPropertyName] = sValue;
                        },
                        getTextNames: function () {
                            return Object.keys(oBag.texts);
                        },
                        getText: function (sTextName) {
                            return oBag.texts[sTextName];
                        },
                        setText: function (sTextName, sValue) {
                            oBag.texts[sTextName] = sValue;
                        }
                    };
                }
            }
        };

        // Return chip instance with restricted functionality
        return {
            load: function (resolve, reject) {
                resolve();
            },
            isStub: function () {
                return false;
            },
            refresh: function () { },
            getBag: oContracts.bag.getBag,
            getContract: function (sContract) {
                return oContracts[sContract] || {};
            },
            configurationUi: oContracts.configurationUi,
            configuration: oContracts.configuration,
            bag: oContracts.bag,
            url: oContracts.url,
            types: oContracts.types,
            getImplementationAsSapui5Async: function () {
                var oData = { chip: this };

                // Custom tiles on the local platform expose a UI component; access to a view is not supported as deprecated.
                return Component.create({
                    componentData: oData,
                    name: oImplementation.componentName
                }).then(function (oComponent) {
                    return (new ComponentContainer({ component: oComponent }));
                });

            }
        };
    };

    return PageBuildingAdapter;
}, /* bExport= */ false);
