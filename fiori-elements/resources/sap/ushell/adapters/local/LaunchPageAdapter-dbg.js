// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's page builder adapter for the 'demo' platform.
 *
 * @deprecated since 1.100
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/base/util/ObjectPath",
    "sap/m/GenericTile",
    "sap/m/ImageContent",
    "sap/m/library",
    "sap/m/NumericContent",
    "sap/m/TileContent",
    "sap/ui/core/ComponentContainer",
    "sap/ui/core/Configuration",
    "sap/ui/core/Core",
    "sap/ui/core/library",
    "sap/ui/core/mvc/View",
    "sap/ui/Device",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/thirdparty/datajs",
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Config",
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ushell/utils/WindowUtils"
], function (
    Log,
    deepExtend,
    ObjectPath,
    GenericTile,
    ImageContent,
    mobileLibrary,
    NumericContent,
    TileContent,
    ComponentContainer,
    Configuration,
    Core,
    coreLibrary,
    View,
    Device,
    ResourceModel,
    OData,
    hasher,
    jQuery,
    Config,
    ushellLibrary,
    resources,
    ushellUtils,
    WindowUtils
) {
    "use strict";

    // shortcut for sap.ui.core.mvc.ViewType
    var ViewType = coreLibrary.mvc.ViewType;

    // shortcut for sap.m.GenericTileMode
    var GenericTileMode = mobileLibrary.GenericTileMode;

    // shortcut for sap.ushell.AppType
    var AppType = ushellLibrary.AppType;

    function _registerModulePath (oTileData) {
        var paths = {};
        paths[oTileData.namespace.replace(/\./g, "/")] = oTileData.path || ".";
        sap.ui.loader.config({ paths: paths });
    }

    /**
     * The Unified Shell's page builder adapter for the 'demo' platform.
     * This method MUST be called by the Unified Shell's container only.
     * Constructs a new instance of the page builder adapter for the 'demo' platform.
     *
     * @param {object} oUnused
     *     the system served by the adapter
     * @param {string} sParameter
     *     parameter as string (legacy, was used before oAdapterConfiguration was added)
     * @param {oject} oAdapterConfiguration
     *     configuration for the adapter.
     *
     * @class
     * @constructor
     *
     * @since 1.15.0
     * @deprecated since 1.100
     */
    var LaunchPageAdapter = function (oUnused, sParameter, oAdapterConfiguration) {
        var aConfigGroups = deepExtend([], oAdapterConfiguration.config.groups);
        // possibility to fail in percent
        var iFailRate = 0;
        // getTileView async rate
        var iGetTileViewAsyncRate = 10;
        // artificial minimal time needed for request in ms
        var iMinRequestTime = 10;
        // artificial maximum of additional time for request in ms (random)
        var iMaxRequestTime = 10;
        var defaultGroup;

        var oMapUiToModel = {};

        for (var iIndex = 0; iIndex < aConfigGroups.length; iIndex++) {
            if (aConfigGroups[iIndex].isDefaultGroup === true) {
                defaultGroup = aConfigGroups[iIndex];
                break;
            }
        }
        if (!defaultGroup && aConfigGroups.length > 0) {
            // mark first group as defaultGroup
            defaultGroup = aConfigGroups[0];
            defaultGroup.isDefaultGroup = true;
        }

        this.translationBundle = resources.i18n;
        this.TileType = {
            Tile: "tile",
            Link: "link",
            Card: "card"
        };

        var i18n;
        if (oAdapterConfiguration.config.pathToLocalizedContentResources) {
            var i18nModel = new ResourceModel({
                bundleUrl: oAdapterConfiguration.config.pathToLocalizedContentResources,
                bundleLocale: Configuration.getLanguage()
            });
            i18n = i18nModel.getResourceBundle();
        }

        function _getTextLocalized (sKey) {
            if (i18n) {
                return i18n.getText(sKey);
            }

            return sKey;
        }

        var aConfigCatalogs = oAdapterConfiguration.config.catalogs || [];
        aConfigCatalogs.forEach(function (oCatTiles) {
            if (i18n) {
                oCatTiles.title = _getTextLocalized(oCatTiles.title);
            }
            oCatTiles.tiles.forEach(function (oTile) {
                oTile.getTitle = function () {
                    return oTile.title;
                };
                oTile.getChip = function () {
                    return {
                        getBaseChipId: function () {
                            return oTile.chipId;
                        }
                    };
                };
            });
        });

        aConfigGroups.forEach(function (oGroup) {
            if (i18n) {
                oGroup.title = _getTextLocalized(oGroup.title);
            }
            oGroup.tiles.forEach(function (oTile) {
                handleTileServiceCall(oTile, true);
            });
        });

        function getSimulateFail () {
            return (100 * Math.random()) < iFailRate;
        }

        function getTileViewAsync () {
            return (100 * Math.random()) < iGetTileViewAsyncRate;
        }

        function getRequestTime () {
            return iMinRequestTime + iMaxRequestTime * Math.random();
        }

        function indexOfTile (oGroup, oTile) {
            var index;
            for (index = 0; index < oGroup.tiles.length; index = index + 1) {
                if (oTile.id === oGroup.tiles[index].id) {
                    return index;
                }
            }
            return -1;
        }

        function indexOfGroup (aGroups, oGroup) {
            var index;
            for (index = 0; index < aGroups.length; index = index + 1) {
                if (oGroup.id === aGroups[index].id) {
                    return index;
                }
            }
            return -1;
        }

        /**
         * Reloads an existing group in order to get its existing state in the backend
         *
         * @param {object} the group that should be reloaded
         * @return {jQuery.promise}
         */
        function reloadGroup (oGroup) {
            var oDfd = new jQuery.Deferred();

            //Simulate an async function
            window.setTimeout(function () {
                // Simulates a success call (the done function of the promise will be called).
                // Return the given group
                oDfd.resolve(oGroup);

                // TODO: simulate a failure (which will trigger the fail function of the promise)
                //oDfd.reject();
            }, getRequestTime());

            return oDfd.promise();
        }

        function handleTileServiceCall (oTile, bNewVisible) {
            if (oTile.tileType !== "sap.ushell.ui.tile.DynamicTile"
                || !oTile.properties || !oTile.properties.serviceUrl) {
                return;
            }

            if (oTile.intervalTimer) {
                window.clearInterval(oTile.intervalTimer);
                oTile.intervalTimer = undefined;
            }

            if (bNewVisible) {
                var serviceRefreshInterval = oTile.serviceRefreshInterval;
                if (serviceRefreshInterval) {
                    // interval is configured in seconds, therefore we need to convert it to milliseconds
                    serviceRefreshInterval = serviceRefreshInterval * 1000;
                } else {
                    // default interval is 10 seconds
                    serviceRefreshInterval = 10000;
                }
                oTile.intervalTimer = window.setInterval(function () {
                    OData.read(
                        oTile.properties.serviceUrl + "?id=" + oTile.id + "&t=" + new Date().getTime(),
                        function () {
                            Log.debug("Dynamic tile service call succeed for tile " + oTile.id);
                        },
                        function (sMessage) {
                            Log.debug("Dynamic tile service call failed for tile " + oTile.id + ", error message:" + sMessage);
                        });
                }, ushellUtils.sanitizeTimeoutDelay(serviceRefreshInterval));
            }
        }

        this.getGroups = function () {
            var oDfd = new jQuery.Deferred();

            //Simulate an async function
            window.setTimeout(function () {
                // Simulates a success call (the done function of the promise will be called)
                // do not pass a reference to the local array of groups
                oDfd.resolve(aConfigGroups.slice(0));

                // TODO: simulate a failure (which will trigger the fail function of the promise)
                //oDfd.reject();
            }, getRequestTime());

            return oDfd.promise();
        };

        /**
         * Returns the default group. This is an asynchronous function using a jQuery.Promise.
         * In case of success its <code>done</code> function is called and gets the
         * <code>sap.ushell_abap.pbServices.ui2.Page</code> object representing the default group.
         *
         * In case of error the promise's <code>fail</code> function is called.
         *
         * @returns {object} jQuery.Promise object.
         * @since 1.11.0
         * @public
         */
        this.getDefaultGroup = function () {
            var oDeferred = new jQuery.Deferred();
            oDeferred.resolve(defaultGroup);
            return oDeferred.promise();
        };

        this.addGroup = function (sTitle) {
            var oDfd = new jQuery.Deferred();
            var bFail = getSimulateFail();

            // Simulate an async function
            window.setTimeout(function () {
                if (!bFail) {
                    var newGroup = {
                        id: "group_" + aConfigGroups.length,
                        title: sTitle,
                        tiles: []
                    };
                    aConfigGroups.push(newGroup);
                    // Simulates a success call (the done function of the promise will be called)
                    oDfd.resolve(newGroup);
                } else {
                    // In case adding a new group fails, load the existing groups from the server
                    this.getGroups()
                        .done(function (oExistingGroups) {
                            // Use the reject function in order to specify that an error has occurred.
                            // Pass the existing groups that we got from the server to the reject function
                            oDfd.reject(oExistingGroups);
                        })
                        .fail(function () {
                            // In case loading the existing groups also fails, call the reject function with no parameters.
                            // TODO: what should the UI do in that case? leave the groups as is or delete all groups from page?
                            oDfd.reject();
                        });
                }
            }.bind(this), getRequestTime());

            return oDfd.promise();
        };

        this.getGroupTitle = function (oGroup) {
            return oGroup.title;
        };

        this.setGroupTitle = function (oGroup, sNewTitle) {
            var oDfd = new jQuery.Deferred();
            var bFail = getSimulateFail();

            // Simulate an async function
            window.setTimeout(function () {
                if (!bFail) {
                    // Simulates a success call (the done function of the promise will be called)
                    oGroup.title = sNewTitle;
                    oDfd.resolve();
                } else {
                    // In case setting group's title fails, reload the existing groups from the server
                    reloadGroup(oGroup)
                        .done(function (oExistingGroup) {
                            // Use the reject function in order to specify that an error has occurred.
                            // Pass the existing group's title that we got from the server to the reject function
                            oDfd.reject(oExistingGroup.title);
                        })
                        .fail(function () {
                            // In case loading the existing group also fails, call the reject function with no parameters.
                            // TODO: what should the UI do in that case? leave the group as is or pass the title that we have from the oGroup parameter?
                            oDfd.reject();
                        });
                }
            }, getRequestTime());
            return oDfd.promise();
        };

        this.getGroupId = function (oGroup) {
            return oGroup.id;
        };

        this.hideGroups = function (aHiddenGroupsIDs) {
            if (aHiddenGroupsIDs && aConfigGroups) {
                for (var i = 0; i < aConfigGroups.length; i++) {
                    if (aHiddenGroupsIDs.indexOf(aConfigGroups[i].id) !== -1) {
                        aConfigGroups[i].isVisible = false;
                    } else {
                        aConfigGroups[i].isVisible = true;
                    }
                }
            }
            return new jQuery.Deferred().resolve();
        };

        this.isGroupVisible = function (oGroup) {
            return oGroup && (oGroup.isVisible === undefined ? true : oGroup.isVisible); //Add default value for newly created group, otherwise it will be hidden by default.
        };

        this.moveGroup = function (oGroup, newIndex) {
            var oDfd = new jQuery.Deferred();
            var bFail = getSimulateFail();

            // Simulate an async function
            window.setTimeout(function () {
                if (!bFail) {
                    // Simulates a success call (the done function of the promise will be called)
                    aConfigGroups.splice(newIndex, 0, aConfigGroups.splice(indexOfGroup(aConfigGroups, oGroup), 1)[0]);
                    oDfd.resolve();
                } else {
                    // TODO: simulate a failure (which will trigger the fail function of the promise)
                    // In case moving a group fails, load the existing groups from the server
                    this.getGroups()
                        .done(function (oExistingGroups) {
                            // Use the reject function in order to specify that an error has occurred.
                            // Pass the existing groups that we got from the server to the reject function
                            oDfd.reject(oExistingGroups);
                        })
                        .fail(function () {
                            // In case loading the existing groups also fails, call the reject function with no parameters.
                            // TODO: what should the UI do in that case? leave the groups as is or delete all groups from page?
                            oDfd.reject();
                        });
                }
            }.bind(this), getRequestTime());

            return oDfd.promise();
        };

        this.removeGroup = function (oGroup) {
            var oDfd = new jQuery.Deferred();
            var bFail = getSimulateFail();

            // Simulate an async function
            window.setTimeout(function () {
                if (!bFail) {
                    // Simulates a success call (the done function of the promise will be called)
                    aConfigGroups.splice(indexOfGroup(aConfigGroups, oGroup), 1);
                    oGroup.tiles.forEach(function (oTile) {
                        handleTileServiceCall(oTile, false);
                    });
                    oDfd.resolve();
                } else {
                    // In case removing a group fails, load the existing groups from the server
                    this.getGroups()
                        .done(function (oExistingGroups) {
                            // Use the reject function in order to specify that an error has occurred.
                            // Pass the existing groups that we got from the server to the reject function
                            oDfd.reject(oExistingGroups);
                        })
                        .fail(function () {
                            // In case loading the existing groups also fails, call the reject function with no parameters.
                            // TODO: what should the UI do in that case? leave the groups as is or delete all groups from page?
                            oDfd.reject();
                        });
                }
            }.bind(this), getRequestTime());

            return oDfd.promise();
        };

        this.resetGroup = function (oGroup) {
            var oDfd = new jQuery.Deferred();
            var bFail = getSimulateFail();

            // Simulate an async function
            window.setTimeout(function () {
                if (!bFail) {
                    oGroup.tiles.forEach(function (oTile) {
                        handleTileServiceCall(oTile, false);
                    });
                    // Simulates a success call (the done function of the promise will be called)
                    // get the preset definition of the group
                    oGroup = deepExtend({}, oAdapterConfiguration.config.groups[indexOfGroup(oAdapterConfiguration.config.groups, oGroup)]);
                    // replace the old group => indexOfGroup compares IDs, so use of original oGroup is valid
                    aConfigGroups.splice(indexOfGroup(aConfigGroups, oGroup), 1, oGroup);

                    oGroup.tiles.forEach(function (oTile) {
                        handleTileServiceCall(oTile, true);
                    });
                    oDfd.resolve(oGroup);
                } else {
                    // In case removing a group fails, load the existing groups from the server
                    this.getGroups()
                        .done(function (oExistingGroups) {
                            // Use the reject function in order to specify that an error has occurred.
                            // Pass the existing groups that we got from the server to the reject function
                            oDfd.reject(oExistingGroups);
                        })
                        .fail(function () {
                            // In case loading the existing groups also fails, call the reject function with no parameters.
                            // TODO: what should the UI do in that case? leave the groups as is or delete all groups from page?
                            oDfd.reject();
                        });
                }
            }.bind(this), getRequestTime());

            return oDfd.promise();
        };

        this.isGroupRemovable = function (oGroup) {
            return oGroup && !oGroup.isPreset;
        };

        this.isGroupLocked = function (oGroup) {
            return oGroup.isGroupLocked;
        };

        this.isGroupFeatured = function (oGroup) {
            return oGroup.isFeatured;
        };

        this.getGroupTiles = function (oGroup) {
            return oGroup.tiles;
        };

        this.getLinkTiles = function (oGroup) {
            return oGroup.links;
        };

        this.getTileTitle = function (oTile) {
            return oTile.title;
        };

        this.getTileType = function (oTile) {
            if (oTile.isLink) {
                return this.TileType.Link;
            }
            if (oTile.isCard) {
                return this.TileType.Card;
            }
            return this.TileType.Tile;
        };

        this.getTileId = function (oTile) {
            return oTile.id;
        };

        this.getTileSize = function (oTile) {
            return oTile.size;
        };

        this.getTileTarget = function (oTile) {
            var sUrlFromTileProperties;
            if (oTile.properties) {
                sUrlFromTileProperties = oTile.properties.href || oTile.properties.targetURL;
            }
            return oTile.target_url || sUrlFromTileProperties || "";
        };

        this.isTileIntentSupported = function (oTile) {
            if (oTile && oTile.formFactor) {
                var currentDevice;
                var formFactor = oTile.formFactor;
                var oSystem = Device.system;
                if (oSystem.desktop) {
                    currentDevice = "Desktop";
                } else if (oSystem.tablet) {
                    currentDevice = "Tablet";
                } else if (oSystem.phone) {
                    currentDevice = "Phone";
                }
                if (formFactor.indexOf(currentDevice) === -1) {
                    return false;
                }
            }
            return true;
        };

        this.isLinkPersonalizationSupported = function (oTile) {
            if (oTile) {
                return oTile.isLinkPersonalizationSupported;
            }
            return true;
        };

        this.getTileView = function (oTile) {
            var oDfd = new jQuery.Deferred();
            var bFail = getSimulateFail();

            if (getTileViewAsync()) {
                // Simulate an async function
                window.setTimeout(function () {
                    if (!bFail) {
                        this._getTileView(oTile).done(function (oTileView) {
                            oDfd.resolve(oTileView);
                        });
                    } else {
                        oDfd.reject();
                    }
                }.bind(this), getRequestTime());
            } else if (!bFail) {
                this._getTileView(oTile).done(function (oTileView) {
                    oDfd.resolve(oTileView);
                });
            } else {
                oDfd.reject();
            }

            return oDfd.promise();
        };

        this._getTileView = function (oTileData) {
            var oTileUI;
            var sError = "unknown error";
            var bIsLink = this.getTileType(oTileData) === "link";
            var oDfd = new jQuery.Deferred();

            this._translateTileProperties(oTileData);
            if (oTileData.namespace && oTileData.path && oTileData.moduleType) {
                _registerModulePath(oTileData);
                if (oTileData.moduleType === "UIComponent") {
                    oTileUI = new ComponentContainer({
                        component: Core.createComponent({
                            componentData: { properties: oTileData.properties },
                            name: oTileData.moduleName
                        }),
                        height: "100%",
                        width: "100%"
                    });
                    oDfd.resolve(oTileUI);
                } else {
                    //XML, JSON, JS, HTML view
                    View.create({
                        viewName: oTileData.moduleName,
                        type: ViewType[oTileData.moduleType],
                        viewData: { properties: oTileData.properties },
                        height: "100%"
                    })
                        .then(function (oView) {
                            oDfd.resolve(oView);
                        });
                }

                return oDfd.promise();
            } else if (oTileData.tileType) {
                // SAPUI5 Control for the standard Static or dynamic tiles
                var sTileType = bIsLink ? "Link" : oTileData.tileType;
                if (sTileType) {
                    try {
                        this._createTileInstance(oTileData, sTileType).done(function (oTile) {
                            oTileUI = oTile;
                            this._handleTilePress(oTileUI);
                            this._applyDynamicTileIfoState(oTileUI);

                            oDfd.resolve(oTileUI);
                        }.bind(this));

                        return oDfd.promise();
                    } catch (e) {
                        oDfd.resolve(new GenericTile({
                            header: e && (e.name + ": " + e.message) || this.translationBundle.getText("failedTileCreationMsg"),
                            frameType: this._parseTileSizeToGenericTileFormat(oTileData.size)
                        }));
                        return oDfd.promise();
                    }
                } else {
                    sError = "TileType: " + oTileData.tileType + " not found!";
                }
            } else {
                sError = "No TileType defined!";
            }
            oDfd.resolve(new GenericTile({
                header: sError,
                frameType: this._parseTileSizeToGenericTileFormat(oTileData.size)
            }));
            return oDfd.promise();
        };

        this._getCatalogTileViewAsync = function (oTileData) {
            var oDeferred = new jQuery.Deferred();
            var oCatalogTileInstancePromise;
            var sError = "unknown error";
            var bIsLink = this.getTileType(oTileData) === "link";

            this._translateTileProperties(oTileData);
            if (oTileData.namespace && oTileData.path && oTileData.moduleType) {
                _registerModulePath(oTileData);
                if (oTileData.moduleType === "UIComponent") {
                    var oTileUI = new ComponentContainer({
                        component: Core.createComponent({
                            componentData: { properties: oTileData.properties },
                            name: oTileData.moduleName
                        }),
                        height: "100%",
                        width: "100%"
                    });
                    oDeferred.resolve(oTileUI);
                } else {
                    //XML, JSON, JS, HTML view
                    View.create({
                        viewName: oTileData.moduleName,
                        type: ViewType[oTileData.moduleType],
                        viewData: { properties: oTileData.properties },
                        height: "100%"
                    })
                        .then(function (oView) {
                            oDeferred.resolve(oView);
                        });
                }
                return oDeferred.promise();
            } else if (oTileData.tileType) {
                // SAPUI5 Control for the standard Static or dynamic tiles
                var sTileType = bIsLink ? "Link" : oTileData.tileType;
                if (sTileType) {
                    try {
                        oCatalogTileInstancePromise = this._createCatalogTileInstanceAsync(oTileData, sTileType);
                        oCatalogTileInstancePromise.done(function (oCatalogTileUI) {
                            this._handleTilePress(oCatalogTileUI);
                            this._applyDynamicTileIfoState(oCatalogTileUI);
                            oDeferred.resolve(oCatalogTileUI);
                        }.bind(this));
                    } catch (e) {
                        oDeferred.resolve(new GenericTile({
                            header: e && (e.name + ": " + e.message) || this.translationBundle.getText("failedTileCreationMsg"),
                            frameType: this._parseTileSizeToGenericTileFormat(oTileData.size)
                        }));
                    }
                } else {
                    sError = "TileType: " + oTileData.tileType + " not found!";
                }
                return oDeferred.promise();
            }

            sError = "No TileType defined!";
            oDeferred.resolve(new GenericTile({
                header: sError,
                frameType: this._parseTileSizeToGenericTileFormat(oTileData.size)
            }));
            return oDeferred.promise();
        };

        this._createTileInstance = function (oTileData, sTileType) {
            var oTileUI;
            var oDfd = new jQuery.Deferred();
            var oTileImage = this._getImageContent({ src: oTileData.properties.icon });

            oTileImage.addStyleClass("sapUshellFullWidth");

            switch (sTileType) {
                case "sap.ushell.ui.tile.DynamicTile":
                    oTileUI = new GenericTile({
                        header: oTileData.properties.title,
                        subheader: oTileData.properties.subtitle,
                        frameType: this._parseTileSizeToGenericTileFormat(oTileData.size),
                        url: WindowUtils.getLeanURL(oTileData.properties.targetURL),
                        tileContent: new TileContent({
                            frameType: this._parseTileSizeToGenericTileFormat(oTileData.size),
                            footer: oTileData.properties.info,
                            unit: oTileData.properties.numberUnit,
                            // We'll utilize NumericContent for the "Dynamic" content.
                            content: new NumericContent({
                                scale: oTileData.properties.numberFactor,
                                value: oTileData.properties.numberValue,
                                truncateValueTo: 5, // Otherwise, The default value is 4.
                                indicator: oTileData.properties.stateArrow,
                                valueColor: this._parseTileValueColor(oTileData.properties.numberState),
                                icon: oTileData.properties.icon,
                                width: "100%"
                            })
                        }),
                        press: this._genericTilePressHandler.bind(this, oTileData)
                    });
                    oMapUiToModel[oTileData.id] = oTileUI;
                    oDfd.resolve(oTileUI);
                    break;

                case "sap.ushell.ui.tile.StaticTile":
                    oTileUI = new GenericTile({
                        mode: oTileData.mode || (oTileData.properties.icon ? GenericTileMode.ContentMode : GenericTileMode.HeaderMode),
                        header: oTileData.properties.title,
                        subheader: oTileData.properties.subtitle,
                        frameType: this._parseTileSizeToGenericTileFormat(oTileData.size),
                        url: WindowUtils.getLeanURL(oTileData.properties.targetURL),
                        tileContent: new TileContent({
                            frameType: this._parseTileSizeToGenericTileFormat(oTileData.size),
                            footer: oTileData.properties.info,
                            content: oTileImage
                        }),
                        press: this._genericTilePressHandler.bind(this, oTileData)
                    });
                    oMapUiToModel[oTileData.id] = oTileUI;
                    oDfd.resolve(oTileUI);
                    break;

                case "Link":
                    oTileUI = new GenericTile({
                        mode: GenericTileMode.LineMode,
                        subheader: oTileData.properties.subtitle,
                        header: oTileData.properties.title,
                        url: WindowUtils.getLeanURL(oTileData.properties.targetURL, oTileData.properties.href),
                        // TODO: The below code is for POC only, should be removed once UI5 provide action buttons for line mode
                        press: function (oEvent) {
                            this._genericTilePressHandler(oTileData, oEvent);
                        }.bind(this)
                    });
                    oMapUiToModel[oTileData.id] = oTileUI;
                    oDfd.resolve(oTileUI);
                    break;

                default:
                    var sNewTileType = oTileData.tileType.replace(/\./g, "/");
                    sap.ui.require([sNewTileType], function () {
                        var TilePrototype = ObjectPath.get(oTileData.tileType);
                        oTileUI = new TilePrototype(oTileData.properties || {});
                        oMapUiToModel[oTileData.id] = oTileUI;
                        oDfd.resolve(oTileUI);
                    });
            }

            return oDfd.promise();
        };

        /**
         * @param {object} oGroupCard A group card object
         * @returns {object} The card's manifest
         * @private
         */
        this.getCardManifest = function (oGroupCard) {
            var oManifestCopy = JSON.parse(JSON.stringify(oGroupCard.manifest));

            return oManifestCopy;
        };

        this._createCatalogTileInstanceAsync = function (oTileData, sTileType) {
            var oDeferred = new jQuery.Deferred();
            var oTileUI;
            var oTileImage = this._getImageContent({ src: oTileData.properties.icon });

            oTileImage.addStyleClass("sapUshellFullWidth");

            switch (sTileType) {
                case "sap.ushell.ui.tile.DynamicTile":
                    oTileUI = new GenericTile({
                        header: oTileData.properties.title,
                        subheader: oTileData.properties.subtitle,
                        frameType: this._parseTileSizeToGenericTileFormat(oTileData.size),
                        url: WindowUtils.getLeanURL(oTileData.properties.targetURL),
                        tileContent: new TileContent({
                            frameType: this._parseTileSizeToGenericTileFormat(oTileData.size),
                            footer: oTileData.properties.info,
                            unit: oTileData.properties.numberUnit,
                            // We'll utilize NumericContent for the "Dynamic" content.
                            content: new NumericContent({
                                scale: oTileData.properties.numberFactor,
                                value: oTileData.properties.numberValue,
                                truncateValueTo: 5, // Otherwise, The default value is 4.
                                indicator: oTileData.properties.stateArrow,
                                valueColor: this._parseTileValueColor(oTileData.properties.numberState),
                                icon: oTileData.properties.icon,
                                width: "100%"
                            })
                        }),
                        press: function (oEvent) {
                            this._genericTilePressHandler(oTileData, oEvent);
                        }.bind(this)
                    });
                    break;

                case "sap.ushell.ui.tile.StaticTile":
                    oTileUI = new GenericTile({
                        mode: oTileData.mode || (oTileData.properties.icon ? GenericTileMode.ContentMode : GenericTileMode.HeaderMode),
                        header: oTileData.properties.title,
                        subheader: oTileData.properties.subtitle,
                        frameType: this._parseTileSizeToGenericTileFormat(oTileData.size),
                        url: WindowUtils.getLeanURL(oTileData.properties.targetURL),
                        tileContent: new TileContent({
                            frameType: this._parseTileSizeToGenericTileFormat(oTileData.size),
                            footer: oTileData.properties.info,
                            content: oTileImage
                        }),
                        press: function (oEvent) {
                            this._genericTilePressHandler(oTileData, oEvent);
                        }.bind(this)
                    });
                    break;

                case "Link":
                    oTileUI = new GenericTile({
                        mode: GenericTileMode.LineMode,
                        subheader: oTileData.properties.subtitle,
                        header: oTileData.properties.title,
                        url: WindowUtils.getLeanURL(oTileData.properties.targetURL, oTileData.properties.href),
                        // TODO: The below code is for POC only, should be removed once UI5 provide action buttons for line mode
                        press: function (oEvent) {
                            this._genericTilePressHandler(oTileData, oEvent);
                        }.bind(this)
                    });
                    break;

                default:
                    sTileType = oTileData.tileType && oTileData.tileType.replace(/\./g, "/");

                    sap.ui.require([sTileType],
                        function (oTilePrototype) {
                            oTileUI = new oTilePrototype(oTileData.properties || {});
                            oDeferred.resolve(oTileUI);
                        });
            }
            oDeferred.resolve(oTileUI);
            return oDeferred.promise();
        };

        this._createCatalogTileInstance = function (oTileData, sTileType) {
            var oTileUI;
            var sTileResource;
            var oTileObject;
            var oTileImage = this._getImageContent({ src: oTileData.properties.icon });

            oTileImage.addStyleClass("sapUshellFullWidth");

            switch (sTileType) {
                case "sap.ushell.ui.tile.DynamicTile":
                    oTileUI = new GenericTile({
                        header: oTileData.properties.title,
                        subheader: oTileData.properties.subtitle,
                        frameType: this._parseTileSizeToGenericTileFormat(oTileData.size),
                        url: WindowUtils.getLeanURL(oTileData.properties.targetURL),
                        tileContent: new TileContent({
                            frameType: this._parseTileSizeToGenericTileFormat(oTileData.size),
                            footer: oTileData.properties.info,
                            unit: oTileData.properties.numberUnit,
                            // We'll utilize NumericContent for the "Dynamic" content.
                            content: new NumericContent({
                                scale: oTileData.properties.numberFactor,
                                value: oTileData.properties.numberValue,
                                truncateValueTo: 5, // Otherwise, The default value is 4.
                                indicator: oTileData.properties.stateArrow,
                                valueColor: this._parseTileValueColor(oTileData.properties.numberState),
                                icon: oTileData.properties.icon,
                                width: "100%"
                            })
                        }),
                        press: function (oEvent) {
                            this._genericTilePressHandler(oTileData, oEvent);
                        }.bind(this)
                    });
                    break;

                case "sap.ushell.ui.tile.StaticTile":
                    oTileUI = new GenericTile({
                        mode: oTileData.mode || (oTileData.properties.icon ? GenericTileMode.ContentMode : GenericTileMode.HeaderMode),
                        header: oTileData.properties.title,
                        subheader: oTileData.properties.subtitle,
                        frameType: this._parseTileSizeToGenericTileFormat(oTileData.size),
                        url: WindowUtils.getLeanURL(oTileData.properties.targetURL),
                        tileContent: new TileContent({
                            frameType: this._parseTileSizeToGenericTileFormat(oTileData.size),
                            footer: oTileData.properties.info,
                            content: oTileImage
                        }),
                        press: function (oEvent) {
                            this._genericTilePressHandler(oTileData, oEvent);
                        }.bind(this)
                    });
                    break;

                case "Link":
                    oTileUI = new GenericTile({
                        mode: GenericTileMode.LineMode,
                        subheader: oTileData.properties.subtitle,
                        header: oTileData.properties.title,
                        url: WindowUtils.getLeanURL(oTileData.properties.targetURL, oTileData.properties.href),
                        // TODO: The below code is for POC only, should be removed once UI5 provide action buttons for line mode
                        press: function (oEvent) {
                            this._genericTilePressHandler(oTileData, oEvent);
                        }.bind(this)
                    });
                    break;

                default: // This does not occur in our internal dev but may occur in third party usage for some custom tiles.
                    sTileResource = oTileData.tileType.replace(/\./g, "/");
                    oTileObject = sap.ui.require(sTileResource);
                    if (!oTileObject) {
                        if (!ObjectPath.get(oTileData.tileType)) {
                            Log.error("FLP: local LaunchPageAdapter. The resource is used before being loaded: " + sTileResource);
                            sap.ui.requireSync(sTileResource); // LEGACY API (deprecated)
                        }
                        oTileObject = ObjectPath.get(oTileData.tileType);
                    }
                    oTileUI = new oTileObject(oTileData.properties || {});
            }
            return oTileUI;
        };

        this._genericTilePressHandler = function (oTileData, oEvent) {
            if (oEvent.getSource().getScope && oEvent.getSource().getScope() === "Display") {
                if (oTileData.properties.targetURL) {
                    if (oTileData.properties.targetURL[0] === "#") {
                        hasher.setHash(oTileData.properties.targetURL);
                    } else {
                        // add the URL to recent activity log
                        var bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
                        if (bLogRecentActivity) {
                            var oRecentEntry = {
                                title: oTileData.properties.title,
                                appType: AppType.URL,
                                url: oTileData.properties.targetURL,
                                appId: oTileData.properties.targetURL
                            };
                            sap.ushell.Container.getRenderer("fiori2").logRecentActivity(oRecentEntry);
                        }

                        WindowUtils.openURL(oTileData.properties.targetURL, "_blank");
                    }
                }
            }
        };

        // Adapts the tile size according to the format of the Generic tile (Used only to test the layout).
        this._parseTileSizeToGenericTileFormat = function (tileSize) {
            return tileSize === "1x2" ? "TwoByOne" : "OneByOne";
        };

        this._parseTileValueColor = function (tileValueColor) {
            var returnValue = tileValueColor;

            switch (tileValueColor) {
                case "Positive":
                    returnValue = "Good";
                    break;
                case "Negative":
                    returnValue = "Critical";
                    break;
            }

            return returnValue;
        };

        /*
         * We should change the color of the text in the footer ("info") to be as received in the tile data in the property (infostate).
         * We used to have this functionality when we used the BaseTile. (we added a class which change the text color).
         * Today The GenericTile doesn't support this feature, and it is impossible to change the text color.
         * Since this feature is documented, we should support it - See BCP:1780008386.
         */
        this._applyDynamicTileIfoState = function (oTileControl) {
            var fnOrigAfterRendering = oTileControl.onAfterRendering;

            oTileControl.onAfterRendering = function () {
                if (fnOrigAfterRendering) {
                    fnOrigAfterRendering.apply(this, arguments);
                }

                var oModel = this.getModel();
                if (!oModel) {
                    return;
                }

                var sDisplayInfoState = oModel.getProperty("/data/display_info_state");
                var elDomRef = this.getDomRef();
                var elFooterInfo = elDomRef.getElementsByClassName("sapMTileCntFtrTxt")[0];

                switch (sDisplayInfoState) {
                    case "Negative":
                        // add class for Negative.
                        elFooterInfo.classList.add("sapUshellTileFooterInfoNegative");
                        break;
                    case "Neutral":
                        // add class for Neutral.
                        elFooterInfo.classList.add("sapUshellTileFooterInfoNeutral");
                        break;
                    case "Positive":
                        // add class for Positive.
                        elFooterInfo.classList.add("sapUshellTileFooterInfoPositive");
                        break;
                    case "Critical":
                        // add class for Critical.
                        elFooterInfo.classList.add("sapUshellTileFooterInfoCritical");
                        break;
                    default:
                        return;
                }
            };
        };

        this._handleTilePress = function (oTileControl) {
            if (typeof oTileControl.attachPress === "function") {
                oTileControl.attachPress(function () {
                    if (typeof oTileControl.getTargetURL === "function") {
                        var sTargetURL = oTileControl.getTargetURL();
                        if (sTargetURL) {
                            if (sTargetURL[0] === "#") {
                                hasher.setHash(sTargetURL);
                            } else {
                                WindowUtils.openURL(sTargetURL, "_blank");
                            }
                        }
                    }
                });
            }
        };

        this._translateTileProperties = function (oTileData) {
            if (this.translationBundle && i18n && !oTileData._isTranslated) {
                var properties = oTileData.properties;
                var keywords = oTileData.keywords;
                properties.title = _getTextLocalized(properties.title);
                properties.subtitle = _getTextLocalized(properties.subtitle);
                properties.info = _getTextLocalized(properties.info);

                if (keywords) {
                    for (var keyIdex = 0; keyIdex < keywords.length; keyIdex++) {
                        keywords[keyIdex] = _getTextLocalized(keywords[keyIdex]);
                    }
                }
                oTileData._isTranslated = true;
            }
        };

        this.refreshTile = function (/*oTile*/) {
            // nothing to do here for the moment as we don't have dynamic data
        };

        this.setTileVisible = function (oTile, bNewVisible) {
            handleTileServiceCall(oTile, bNewVisible);
        };

        this.addTile = function (oCatalogTile, oGroup) {
            if (!oGroup) {
                oGroup = defaultGroup;
            }

            var oDfd = new jQuery.Deferred();
            var bFail = getSimulateFail();

            // Simulate an async function
            window.setTimeout(function () {
                if (!bFail) {
                    var newTile = deepExtend(
                        {
                            title: "A new tile was added",
                            size: "1x1"
                        },
                        oCatalogTile,
                        { id: "tile_0" + oCatalogTile.chipId }
                    );

                    oGroup.tiles.push(newTile);
                    handleTileServiceCall(newTile, true);
                    // Simulates a success call (the done function of the promise will be called)
                    oDfd.resolve(newTile);
                } else {
                    // In case adding a tile fails, load the existing groups from the server
                    this.getGroups()
                        .done(function (oExistingGroups) {
                            // Use the reject function in order to specify that an error has occurred.
                            // Pass the existing groups that we got from the server to the reject function
                            oDfd.reject(oExistingGroups);
                        })
                        .fail(function () {
                            // In case loading the existing group also fails, call the reject function with no parameters.
                            // TODO: what should the UI do in that case?
                            oDfd.reject();
                        });
                }
            }.bind(this), getRequestTime());

            return oDfd.promise();
        };

        this.removeTile = function (oGroup, oTile) {
            var oDfd = new jQuery.Deferred();
            var bFail = getSimulateFail();

            // Simulate an async function
            window.setTimeout(function () {
                if (!bFail) {
                    // Simulates a success call (the done function of the promise will be called)
                    oGroup.tiles.splice(indexOfTile(oGroup, oTile), 1);
                    handleTileServiceCall(oTile, false);
                    oDfd.resolve();
                } else {
                    // In case removing a tile fails, load the existing groups from the server
                    this.getGroups()
                        .done(function (oExistingGroups) {
                            // Use the reject function in order to specify that an error has occurred.
                            // Pass the existing groups that we got from the server to the reject function
                            oDfd.reject(oExistingGroups);
                        })
                        .fail(function () {
                            // In case loading the existing group also fails, call the reject function with no parameters.
                            // TODO: what should the UI do in that case?
                            oDfd.reject();
                        });
                }
            }.bind(this), getRequestTime());

            return oDfd.promise();
        };

        this.moveTile = function (oTile, sourceIndex, targetIndex, oSourceGroup, oTargetGroup, newTileType) {
            var oDfd = new jQuery.Deferred();
            var bFail = getSimulateFail();

            // Simulate an async function
            window.setTimeout(function () {
                if (!bFail) {
                    if (oTargetGroup === undefined) {
                        // Move a tile in the same group
                        oTargetGroup = oSourceGroup;
                    }

                    oTile.isLink = newTileType ? (newTileType === this.TileType.Link) : oTile.isLink;

                    oSourceGroup.tiles.splice(sourceIndex, 1);
                    oTargetGroup.tiles.splice(targetIndex, 0, oTile);

                    // Simulates a success call (the done function of the promise will be called)
                    oDfd.resolve(oTile);
                } else {
                    // In case moving a tile fails, reload the groups from the server
                    this.getGroups()
                        .done(function (oExistingGroups) {
                            // Use the reject function in order to specify that an error has occurred.
                            // Pass the existing groups that we got from the server to the reject function
                            oDfd.reject(oExistingGroups);
                        })
                        .fail(function () {
                            // In case loading the existing group also fails, call the reject function with no parameters.
                            // TODO: what should the UI do in that case?
                            oDfd.reject();
                        });
                }
            }.bind(this), getRequestTime());

            return oDfd.promise();
        };

        this.getTile = function (/*sSemanticObject, sAction*/) {
            var oDfd = new jQuery.Deferred();
            // TODO: return a oTile async
            return oDfd.promise();
        };

        this.getCatalogs = function () {
            var oDfd = new jQuery.Deferred();

            // Simulate an async function with a loading delay of up to 5 sec
            // Simulates a progress call (the progress function of the promise will be called)
            aConfigCatalogs.forEach(function (oCatalog) {
                window.setTimeout(function () {
                    oDfd.notify(oCatalog);
                }, 300);
            });
            // TODO: simulate a failure (which will trigger the fail function of the promise)
            //oDfd.reject();

            window.setTimeout(function () {
                oDfd.resolve(aConfigCatalogs);
            }, 1500);

            return oDfd.promise();
        };

        this.isCatalogsValid = function () {
            // TODO
            return true;
        };

        this.getCatalogError = function (/*oCatalog*/) {
            return;
        };

        this.getCatalogId = function (oCatalog) {
            return oCatalog.id;
        };

        this.getCatalogTitle = function (oCatalog) {
            return oCatalog.title;
        };

        this.getCatalogTiles = function (oCatalog) {
            var oDfd = new jQuery.Deferred();

            // Simulate an async function with a loading delay of up to 5 sec
            window.setTimeout(function () {
                // Simulates a success call (the done function of the promise will be called)
                oDfd.resolve(oCatalog.tiles);

                // TODO: simulate a failure (which will trigger the fail function of the promise)
                //oDfd.reject();
            }, getRequestTime());

            return oDfd.promise();
        };

        this.getCatalogTileId = function (oCatalogTile) {
            if (oCatalogTile.chipId) {
                return oCatalogTile.chipId;
            }
            return "UnknownCatalogTileId";
        };

        this.getStableCatalogTileId = function (oCatalogTile) {
            if (oCatalogTile.referenceChipId) {
                return oCatalogTile.referenceChipId;
            }
            if (oCatalogTile.chipId) {
                return oCatalogTile.chipId;
            }
            return "UnknownCatalogTileId";
        };

        this.getCatalogTileTitle = function (oCatalogTile) {
            return oCatalogTile.title;
        };

        this.getCatalogTileSize = function (oCatalogTile) {
            return oCatalogTile.size;
        };

        this.getCatalogTileViewControl = function (oCatalogTile) {
            return this._getCatalogTileViewAsync(oCatalogTile);
        };

        this.getCatalogTileTargetURL = function (oCatalogTile) {
            return (oCatalogTile.properties && oCatalogTile.properties.targetURL) || null;
        };

        this.getCatalogTilePreviewTitle = function (oCatalogTile) {
            return (oCatalogTile.properties && oCatalogTile.properties.title) || null;
        };

        this.getCatalogTilePreviewInfo = function (oCatalogTile) {
            return (oCatalogTile.properties && oCatalogTile.properties.info) || null;
        };

        this.getCatalogTilePreviewIndicatorDataSource = function (oCatalogTile) {
            var oIndicatorDataSource;
            if (oCatalogTile.properties && oCatalogTile.properties.serviceUrl) {
                oIndicatorDataSource = {
                    path: oCatalogTile.properties.serviceUrl,
                    refresh: oCatalogTile.properties.serviceRefreshInterval
                };
            }
            return oIndicatorDataSource;
        };

        this.getCatalogTilePreviewSubtitle = function (oCatalogTile) {
            return (oCatalogTile.properties && oCatalogTile.properties.subtitle) || null;
        };

        this.getCatalogTilePreviewIcon = function (oCatalogTile) {
            return (oCatalogTile.properties && oCatalogTile.properties.icon) || null;
        };

        this.getCatalogTileKeywords = function (oCatalogTile) {
            return [
                oCatalogTile.title,
                oCatalogTile.properties && oCatalogTile.properties.subtitle,
                oCatalogTile.properties && oCatalogTile.properties.info,
                oCatalogTile.keywords // might be an array or undefined
            ]
                .flat()
                .filter(function (element) {
                    // remove undefined values and empty strings from array
                    return element;
                });
        };

        this.getCatalogTileTags = function (oCatalogTile) {
            return (oCatalogTile && oCatalogTile.tags) || [];
        };

        /**
         * Adds a bookmark to the user's home page.
         *
         * @param {object} oParameters bookmark parameters. In addition to title and URL,
         *   a bookmark might allow additional settings, such as an icon or a subtitle.
         *   Which settings are supported depends on the environment in which the application is running.
         *   Unsupported parameters will be ignored.
         * @param {string} oParameters.title The title of the bookmark.
         * @param {string} oParameters.url The URL of the bookmark.
         *   If the target application shall run in the Shell the URL has to be in the format <code>"#SO-Action~Context?P1=a&P2=x&/route?RPV=1"</code>
         * @param {string} [oParameters.icon] The optional icon URL of the bookmark (e.g. <code>"sap-icon://home"</code>).
         * @param {string} [oParameters.info] The optional information text of the bookmark.
         * @param {string} [oParameters.subtitle] The optional subtitle of the bookmark.
         * @param {string} [oParameters.serviceUrl] The URL to a REST or OData service that provides some dynamic information for the bookmark.
         * @param {string} [oParameters.serviceRefreshInterval] The refresh interval for the <code>serviceUrl</code> in seconds.
         * @param {string} [oParameters.numberUnit] The unit for the number retrieved from <code>serviceUrl</code>.
         * @returns {object} a jQuery promise.
         * @see sap.ushell.services.URLParsing#getShellHash
         * @since 1.11.0
         * @public
         */
        this.addBookmark = function (oParameters, oGroupParam) {
            var oGroup = oGroupParam || defaultGroup;
            var oDfd = new jQuery.Deferred();
            var bFail = getSimulateFail();
            var title = oParameters.title;
            var subtitle = oParameters.subtitle;
            var info = oParameters.info;
            var url = oParameters.url;
            var bIsLinkPersonalizationSupported = this.isLinkPersonalizationSupported();

            // Simulate an async function
            window.setTimeout(function () {
                if (!bFail) {
                    var newTile = {
                        title: title,
                        size: "1x1",
                        chipId: "tile_0" + oGroup.tiles.length,
                        tileType: "sap.ushell.ui.tile.StaticTile",
                        id: "tile_0" + oGroup.tiles.length,
                        isLinkPersonalizationSupported: bIsLinkPersonalizationSupported,
                        keywords: [],
                        properties: {
                            icon: "sap-icon://time-entry-request",
                            info: info,
                            subtitle: subtitle,
                            title: title,
                            targetURL: url
                        }
                    };

                    oGroup.tiles.push(newTile);
                    handleTileServiceCall(newTile, true);
                    // Simulates a success call (the done function of the promise will be called)
                    oDfd.resolve(newTile);
                } else {
                    // In case adding a tile fails, load the existing groups from the server
                    this.getGroups()
                        .done(function (oExistingGroups) {
                            // Use the reject function in order to specify that an error has occurred.
                            // Pass the existing groups that we got from the server to the reject function
                            oDfd.reject(oExistingGroups);
                        })
                        .fail(function () {
                            // In case loading the existing group also fails, call the reject function with no parameters.
                            // TODO: what should the UI do in that case?
                            oDfd.reject();
                        });
                }
            }.bind(this), getRequestTime());
            return oDfd.promise();
        };

        this.updateBookmarks = function (sUrl, oParameters) {
            var oDeferred = new jQuery.Deferred();
            var iCount = 0;
            var oGetGroupsPromise = this.getGroups();

            oGetGroupsPromise.done(function (aRetrievedGroups) {
                aRetrievedGroups.forEach(function (oGroup) {
                    oGroup.tiles.forEach(function (oTileData) {
                        if (oTileData.properties && oTileData.properties.targetURL === sUrl) {
                            for (var property in oParameters) {
                                if (oParameters.hasOwnProperty(property)) {
                                    oTileData.properties[property] = oParameters[property];
                                }
                            }
                            var oTileUI = oMapUiToModel[oTileData.id];
                            if (oTileUI !== undefined) {
                                oTileUI.setHeader(oTileData.properties.title);
                                oTileUI.setSubheader(oTileData.properties.subtitle);
                            }
                            iCount++;
                        }
                    });
                });
                oDeferred.resolve(iCount);
            });
            oGetGroupsPromise.fail(function () {
                oDeferred.reject();
            });

            return oDeferred.promise();
        };

        this.deleteBookmarks = function (sUrl) {
            var oDfd = new jQuery.Deferred();
            var iCount = 0;
            var oGroup;
            var oTile;
            for (var iGroupIndex = 0; iGroupIndex < aConfigGroups.length; iGroupIndex++) {
                oGroup = aConfigGroups[iGroupIndex];
                for (var iTileIndex = oGroup.tiles.length - 1; iTileIndex >= 0; iTileIndex--) {
                    oTile = oGroup.tiles[iTileIndex];
                    if (oTile.properties.targetURL === sUrl) {
                        oGroup.tiles.splice(iTileIndex, 1);
                        iCount++;
                    }
                }
            }
            oDfd.resolve(iCount);
            return oDfd.promise();
        };

        /**
         * Counts <b>all</b> bookmarks pointing to the given URL from all of the user's pages.
         * You can use this method to check if a bookmark already exists.
         * <p>
         * This is a potentially asynchronous operation in case the user's pages have not yet been loaded completely!
         *
         * @param {string} sUrl The URL of the bookmarks to be counted, exactly as specified to {@link #addBookmark}.
         * @returns {object} A <code>jQuery.Deferred</code> object's promise which informs about success or failure of this asynchronous operation.
         *   In case of success, the count of existing bookmarks is provided (which might be zero).
         *   In case of failure, an error message is passed.
         * @see #addBookmark
         * @private
         */
        this.countBookmarks = function (sUrl) {
            var oDfd = new jQuery.Deferred();

            var iCount = 0;
            var oGroup;
            var oTile;
            for (var iGroupIndex = 0; iGroupIndex < aConfigGroups.length; iGroupIndex++) {
                oGroup = aConfigGroups[iGroupIndex];
                for (var iTileIndex = 0; iTileIndex < oGroup.tiles.length; iTileIndex++) {
                    oTile = oGroup.tiles[iTileIndex];
                    if (oTile.properties.targetURL === sUrl) {
                        iCount++;
                    }
                }
            }
            oDfd.resolve(iCount);

            return oDfd.promise();
        };

        this._getImageContent = function (oData) {
            return new ImageContent(oData);
        };

        /**
         * This method is called to notify that the given tile has been added to some remote catalog which is not specified further.
         *
         * @param {string} sTileId the ID of the tile that has been added to the catalog (as returned by that OData POST operation)
         * @private
         * @since 1.16.4
         */
        this.onCatalogTileAdded = function (/*sTileId*/) {
            // TODO
        };

        this.getTileActions = function (oTile) {
            return (oTile && oTile.actions) || null;
        };

        /**
         * Returns raw catalog tile data that can be used to instantiate the tile
         * In the local adapter always a promise resolving to an empty object will be returned
         *
         * @returns {Promise<object>} A promise resolving to an empty object
         * @since 1.78.0
         * @private
         */
        LaunchPageAdapter.prototype._getCatalogTileIndex = function () {
            var oCatalogTileIndex = {};
            return Promise.resolve(oCatalogTileIndex);
        };

        /**
         * Get numberUnit for a catalog tile.
         *
         * @param {sap.ui2.ChipInstance} oCatalogTile the catalog tile
         * @returns {string} the numberUnit for the catalog tile provided via the tileConfiguration
         * @since 1.84.0
         */
        this.getCatalogTileNumberUnit = function (oCatalogTile) {
            return (oCatalogTile.properties ? oCatalogTile.properties.numberUnit : undefined);
        };
    };

    return LaunchPageAdapter;
});
