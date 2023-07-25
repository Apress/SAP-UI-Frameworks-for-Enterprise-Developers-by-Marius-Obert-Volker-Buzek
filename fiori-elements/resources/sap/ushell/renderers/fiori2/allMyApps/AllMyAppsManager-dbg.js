// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/ushell/library"
], function (
    jQuery,
    resources,
    ushellLibrary
) {
    "use strict";

    var AllMyAppsProviderType = ushellLibrary.AllMyAppsProviderType;

    /**
     * Reading apps data from all the data_sources/providers and updating AllMyApps model.
     *
     * loadAppsData is the main function that is responsible for reading apps data from all data_sources/providers,
     * using the following functionality:
     *   - _handleGroupsData - Reading groups data
     *   - _handleExternalProvidersData - Reading external_providers data
     *   - _addCatalogToModel - Reading catalogs data
     */
    var AllMyAppsManager = function () { };

    AllMyAppsManager.prototype.loadAppsData = function (oModel, oPopoverObject, loadCatalogs) {
        return sap.ushell.Container.getServiceAsync("AllMyApps")
            .then(function (AllMyApps) {
                this.oPopover = oPopoverObject;

                if (!AllMyApps.isEnabled()) {
                    return;
                }

                this.iNumberOfProviders = 0;
                this.oModel = oModel;

                if (AllMyApps.isHomePageAppsEnabled()) {
                    this._handleGroupsData();
                }

                if (AllMyApps.isExternalProviderAppsEnabled()) {
                    this._handleExternalProvidersData(oModel);
                }

                if (AllMyApps.isCatalogAppsEnabled()) {
                    this._handleCatalogs(loadCatalogs);
                }

                if (!AllMyApps.isCatalogAppsEnabled() || (AllMyApps.isCatalogAppsEnabled() && loadCatalogs)) {
                    // Publish event all my apps finished loading.
                    var oEventBus = sap.ui.getCore().getEventBus();
                    oEventBus.publish("launchpad", "allMyAppsMasterLoaded");
                }
            }.bind(this));
    };

    AllMyAppsManager.prototype._handleGroupsData = function () {
        var oGroupsDataPromise = this._getGroupsData();
        var oHomeModelEntry = { title: resources.i18n.getText("allMyApps_homeEntryTitle") };
        var aProvidersArray;

        // Get groups apps
        return new Promise(function (resolve, reject) {
            oGroupsDataPromise.done(resolve).fail(reject);
        })
            .then(function (oGroupsArray) {
                oHomeModelEntry.groups = oGroupsArray;
                oHomeModelEntry.type = AllMyAppsProviderType.HOME;

                if (oGroupsArray.length === 0) {
                    return;
                }

                // Home (groups) provider should be at the 1st place in the providers list,
                // hence we use array unshift in order to put it at index 0
                aProvidersArray = this.oModel.getProperty("/AppsData");
                if (aProvidersArray) {
                    var index = this._getIndexByType(aProvidersArray, oHomeModelEntry.type);
                    if (index !== undefined) {
                        aProvidersArray[index] = oHomeModelEntry;
                    } else {
                        aProvidersArray.unshift(oHomeModelEntry);
                    }
                }

                this.oModel.setProperty("/AppsData", aProvidersArray);
                this.iNumberOfProviders += 1;
            }.bind(this));
    };

    AllMyAppsManager.prototype._getIndexByType = function (providersArray, providerType) {
        if (providersArray.length <= 0) {
            return 0;
        }

        for (var i = 0; i < providersArray.length; i++) {
            if (providersArray[i].type === providerType) {
                return i;
            }
        }
    };

    AllMyAppsManager.prototype._getGroupsData = function () {
        var oDeferred = new jQuery.Deferred();
        sap.ushell.Container.getServiceAsync("LaunchPage")
            .then(function (LaunchPage) {
                return Promise.all([
                    LaunchPage.getDefaultGroup(),
                    LaunchPage.getGroups()
                ]);
            })
            .then(function (aResults) {
                this.oDefaultGroup = aResults[0];
                var aGroups = aResults[1];
                var aPromises = [];
                aGroups.forEach(function (oGroup) {
                    aPromises.push(this._getFormattedGroup(oGroup));
                }.bind(this));
                return Promise.all(aPromises);
            }.bind(this))
            .then(function (aFormattedGroups) {
                var aFilteredGroups = aFormattedGroups.filter(function (oFormattedGroup) {
                    return oFormattedGroup && (oFormattedGroup.apps.length > 0 || oFormattedGroup.numberCustomTiles > 0);
                });
                oDeferred.resolve(aFilteredGroups);
            });

        return oDeferred.promise();
    };

    AllMyAppsManager.prototype._getFormattedGroup = function (oGroup) {
        var oFormattedGroup;
        var sGroupTitle;
        var aTiles;

        return sap.ushell.Container.getServiceAsync("LaunchPage")
            .then(function (LaunchPage) {
                // @TODO What about hidden groups?  => isGroupVisible(group) === true
                if (LaunchPage.isGroupVisible(oGroup) === false) {
                    return;
                }
                // The default group gets "My Home" title
                if (LaunchPage.getGroupId(oGroup) === LaunchPage.getGroupId(this.oDefaultGroup)) {
                    sGroupTitle = resources.i18n.getText("my_group");
                } else {
                    sGroupTitle = LaunchPage.getGroupTitle(oGroup);
                }
                oFormattedGroup = {};
                oFormattedGroup.title = sGroupTitle;
                oFormattedGroup.apps = [];

                aTiles = LaunchPage.getGroupTiles(oGroup);
                return this._getFormattedGroupApps(aTiles);
            }.bind(this))
            .then(function (oResult) {
                if (!oResult) {
                    return;
                }
                oFormattedGroup.apps = oResult.aFormattedApps;
                oFormattedGroup.numberCustomTiles = oResult.iNumberOfCustomTiles;
                if (oResult.iNumberOfCustomTiles === 1) {
                    oFormattedGroup.sCustomLabel = resources.i18n.getText("allMyApps_customStringSingle");
                    oFormattedGroup.sCustomLink = resources.i18n.getText("allMyApps_customLinkHomePageSingle");
                } else {
                    oFormattedGroup.sCustomLabel = resources.i18n.getText("allMyApps_customString", [oResult.iNumberOfCustomTiles]);
                    oFormattedGroup.sCustomLink = resources.i18n.getText("allMyApps_customLinkHomePage");
                }
                oFormattedGroup.handlePress = this._onHandleGroupPress;
                return oFormattedGroup;
            }.bind(this));
    };

    AllMyAppsManager.prototype._getFormattedGroupApps = function (oApps) {
        var aFormattedApps = [];
        var iNumberOfCustomTiles = 0;
        return sap.ushell.Container.getServiceAsync("LaunchPage")
            .then(function (LaunchPage) {
                var aPromises = [];
                oApps.forEach(function (oTile) {
                    if (LaunchPage.isTileIntentSupported(oTile)) {
                        var oGetAppEntityFromTilePromise = this._getAppEntityFromTile(oTile)
                            .then(function (oApp) {
                                if (oApp) {
                                    aFormattedApps.push(oApp);
                                } else {
                                    // if this is not an app this is a custom tile.
                                    iNumberOfCustomTiles++;
                                }
                            });
                        aPromises.push(oGetAppEntityFromTilePromise);
                    }
                }.bind(this));
                return Promise.all(aPromises);
            }.bind(this))
            .then(function () {
                return {
                    iNumberOfCustomTiles: iNumberOfCustomTiles,
                    aFormattedApps: aFormattedApps
                };
            });
    };

    AllMyAppsManager.prototype._onHandleGroupPress = function (ev, oData) {
        window.hasher.setHash("#Shell-home");
        // Close the popover on navigation (it should be explicitly closed when navigating with the same hash)
        this.oPopover.close();
        var oBus = sap.ui.getCore().getEventBus();

        // This is in the case of cold start
        oBus.subscribe("launchpad", "dashboardModelContentLoaded", function () {
            oBus.publish("launchpad", "scrollToGroupByName", {
                groupName: oData.title,
                isInEditTitle: false
            });
        }, this);

        // Try to open in case we are not in cold start
        oBus.publish("launchpad", "scrollToGroupByName", {
            groupName: oData.title,
            isInEditTitle: false
        });
    };

    AllMyAppsManager.prototype._handleExternalProvidersData = function () {
        var that = this;
        return sap.ushell.Container.getServiceAsync("AllMyApps")
            .then(function (AllMyApps) {
                var oExternalProviders = AllMyApps.getDataProviders();
                var aExternalProvidersIDs = Object.keys(oExternalProviders);
                var sExternalProviderId;
                var oExternalProvider;
                var sExternalProviderTitle;
                var oExternalProviderModelEntry;
                var index;
                var oExternalProviderPromise;

                // Get external providers apps
                if (aExternalProvidersIDs.length > 0) {
                    for (index = 0; index < aExternalProvidersIDs.length; index++) {
                        sExternalProviderId = aExternalProvidersIDs[index];
                        oExternalProvider = oExternalProviders[sExternalProviderId];
                        sExternalProviderTitle = oExternalProvider.getTitle();
                        oExternalProviderModelEntry = {};
                        oExternalProviderModelEntry.title = sExternalProviderTitle;
                        oExternalProviderPromise = oExternalProvider.getData();
                        oExternalProviderPromise.done(function (aProviderDataArray) {
                            // If the promise for data is resolved valid array of at least one group
                            if (aProviderDataArray && (aProviderDataArray.length > 0)) {
                                this.groups = aProviderDataArray;
                                this.type = AllMyAppsProviderType.EXTERNAL;
                                that.oModel.setProperty("/AppsData/" + that.iNumberOfProviders, this);
                                that.iNumberOfProviders += 1;
                                // Publish event all my apps finished loading.
                                var oEventBus = sap.ui.getCore().getEventBus();
                                oEventBus.publish("launchpad", "allMyAppsMasterLoaded");
                            }
                        }.bind(oExternalProviderModelEntry));
                    }
                }
            });
    };

    AllMyAppsManager.prototype._handleNotFirstCatalogsLoad = function () {
        var oModel = this.oModel.getProperty("/AppsData");
        var sCatalogProvider = AllMyAppsProviderType.CATALOG;
        if (oModel.length && oModel[oModel.length - 1].type === sCatalogProvider) {
            this.bFirstCatalogLoaded = true;
            sap.ui.getCore().getEventBus().publish("launchpad", "allMyAppsFirstCatalogLoaded", { bFirstCatalogLoadedEvent: true });
        }
    };

    AllMyAppsManager.prototype._handleCatalogs = function (loadCatalogs) {
        if (!loadCatalogs) {
            this._handleNotFirstCatalogsLoad();
            return Promise.resolve();
        }
        this.bFirstCatalogLoaded = false;
        // Array of promise objects that are generated inside addCatalogToModel (the "progress" function of getCatalogs)
        this.aPromises = [];
        // Get catalog apps
        return sap.ushell.Container.getServiceAsync("LaunchPage")
            .then(function (LaunchPage) {
                LaunchPage.getCatalogs()
                    // There's a need to make sure that onDoneLoadingCatalogs is called only after all catalogs are loaded
                    // (i.e. all calls to addCatalogToModel are finished).
                    // For this, all the promise objects that are generated inside addCatalogToModel are generated into this.aPromises,
                    // and jQuery.when calls onDoneLoadingCatalogs only after all the promises are resolved
                    .done(function (/*catalogs*/) {
                        jQuery.when.apply(jQuery, this.aPromises).then(this._onDoneLoadingCatalogs.bind(this));
                    }.bind(this))
                    // in case of a severe error, show an error message
                    .fail(function (/*args*/) {
                        this._onGetCatalogsFail(resources.i18n.getText("fail_to_load_catalog_msg"));
                    }.bind(this))
                    // for each loaded catalog, add it to the model
                    .progress(this._addCatalogToModel.bind(this));
            }.bind(this));
    };

    AllMyAppsManager.prototype._addCatalogToModel = function (oCatalog) {
        var LaunchPage;
        var oProviderModelEntry = {
            apps: [],
            numberCustomTiles: 0,
            type: null
        };
        var iProvidersIndex;
        var aPromises = [
            sap.ushell.Container.getServiceAsync("LaunchPage")
        ];

        // Even though the code is asynchronous now there might be severe race conditions if this method gets called multiple times in a short timeframe.
        // Therefore we ensure the calls are handled synchronously
        if (this._oAddCatalogToModelPromise) {
            aPromises.push(this._oAddCatalogToModelPromise);
        }

        this._oAddCatalogToModelPromise = Promise.all(aPromises)
            .then(function (aValues) {
                LaunchPage = aValues[0];
                oProviderModelEntry.type = AllMyAppsProviderType.CATALOG;

                var oCatalogTilesPromise = LaunchPage.getCatalogTiles(oCatalog);
                this.aPromises.push(oCatalogTilesPromise);
                return oCatalogTilesPromise;
            }.bind(this))
            .then(function (aCatalogTiles) {
                var aProviders;
                if (aCatalogTiles.length === 0) {
                    return;
                }
                // find if catalog with the same name already exists.
                var sCatalogName = LaunchPage.getCatalogTitle(oCatalog);

                aProviders = this.oModel.getProperty("/AppsData");
                for (iProvidersIndex = 0; iProvidersIndex < aProviders.length; iProvidersIndex++) {
                    if ((aProviders[iProvidersIndex].type === AllMyAppsProviderType.CATALOG) && (aProviders[iProvidersIndex].title === sCatalogName)) {
                        // if not create a new catalog entry.
                        oProviderModelEntry = aProviders[iProvidersIndex];
                        break;
                    }
                }

                // add the attributes and tile for the catalog.
                oProviderModelEntry.title = LaunchPage.getCatalogTitle(oCatalog);
                return this._getFormattedGroupApps(aCatalogTiles);
            }.bind(this))
            .then(function (oResult) {
                if (!oResult) {
                    return;
                }
                // Extend the array since we might have found an existing ProviderModelEntry with included apps
                Array.prototype.push.apply(oProviderModelEntry.apps, oResult.aFormattedApps);
                oProviderModelEntry.numberCustomTiles = oResult.iNumberOfCustomTiles;
                if (oProviderModelEntry.numberCustomTiles === 1) {
                    oProviderModelEntry.sCustomLabel = resources.i18n.getText("allMyApps_customStringSingle");
                    oProviderModelEntry.sCustomLink = resources.i18n.getText("allMyApps_customLinkAppFinderSingle");
                } else {
                    oProviderModelEntry.sCustomLabel = resources.i18n.getText("allMyApps_customString", [oProviderModelEntry.numberCustomTiles]);
                    oProviderModelEntry.sCustomLink = resources.i18n.getText("allMyApps_customLinkAppFinder");
                }

                oProviderModelEntry.handlePress = function (ev, oData) {
                    // Close the popover on navigation (it should be explicitly closed when navigating with the same hash)
                    this.oPopover.close();
                    window.hasher.setHash("#Shell-home&/appFinder/catalog/" + JSON.stringify({
                        catalogSelector: oData.title,
                        tileFilter: "",
                        tagFilter: "[]",
                        targetGroup: ""
                    }));
                }.bind(this);

                // Add the catalog to the model as a data-source/provider only if it includes at least one app
                if (oProviderModelEntry.apps.length > 0 || oProviderModelEntry.numberCustomTiles > 0) {
                    this.oModel.setProperty("/AppsData/" + iProvidersIndex, oProviderModelEntry);
                    if (this.bFirstCatalogLoaded === false) {
                        sap.ui.getCore().getEventBus().publish("launchpad", "allMyAppsFirstCatalogLoaded", { bFirstCatalogLoadedEvent: true });
                        this.bFirstCatalogLoaded = true;
                    }
                    this.iNumberOfProviders += 1;
                }
            }.bind(this));
            return this._oAddCatalogToModelPromise;
    };

    AllMyAppsManager.prototype._onGetCatalogsFail = function (sMessage) {
        return sap.ushell.Container.getServiceAsync("Message")
            .then(function (Message) {
                Message.info(sMessage);
            });
    };

    AllMyAppsManager.prototype._onDoneLoadingCatalogs = function () {
        // Sort the catalogs alphabetically for continuity reasons
        var oModel = this.oModel.getProperty("/AppsData");
        oModel.sort(function (a, b) {
            var nameA = a.title.toUpperCase();
            var nameB = b.title.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        this.oModel.setProperty("/AppsData", oModel);

        var oEventBus = sap.ui.getCore().getEventBus();

        if (!this.bFirstCatalogLoaded) {
            oEventBus.publish("launchpad", "allMyAppsNoCatalogsLoaded");
        }
    };

    AllMyAppsManager.prototype._getAppEntityFromTile = function (oCatalogTile) {
        return sap.ushell.Container.getServiceAsync("LaunchPage")
            .then(function (LaunchPage) {
                var oApp;
                var sTileTitle = LaunchPage.getCatalogTilePreviewTitle(oCatalogTile);
                var sTileSubTitle = LaunchPage.getCatalogTilePreviewSubtitle(oCatalogTile);
                var sTileUrl = LaunchPage.getCatalogTileTargetURL(oCatalogTile);

                // If the tile has a valid url and either title or subtitle
                if (sTileUrl && (sTileTitle || sTileSubTitle)) {
                    oApp = {};
                    oApp.url = sTileUrl;
                    if (sTileTitle) {
                        oApp.title = sTileTitle;
                        oApp.subTitle = sTileSubTitle;
                    } else {
                        oApp.title = sTileSubTitle;
                    }
                    return oApp;
                }
            });
    };

    return new AllMyAppsManager();
}, /* bExport= */ true);
