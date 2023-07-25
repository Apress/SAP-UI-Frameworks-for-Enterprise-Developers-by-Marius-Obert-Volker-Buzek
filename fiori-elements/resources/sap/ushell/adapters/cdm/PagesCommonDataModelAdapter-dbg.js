// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's platform independent sap.ushell.adapters.PagesCommonDataModelAdapter.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/ushell/adapters/cdm/util/cdmSiteUtils",
    "sap/base/util/extend",
    "sap/base/util/Version",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Config"
], function (Log, deepExtend, cdmSiteUtils, extend, Version, jQuery, Config) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only.
     * Constructs a new instance of the platform independent PagesCommonDataModelAdapter.
     *
     * @class
     * @constructor
     * @see {@link sap.ushell.adapters.PagesCommonDataModelAdapter}
     *
     * @since 1.69.0
     * @private
     */
    var PagesCommonDataModelAdapter = function () {
        this._oCDMPagesRequests = {};
        this._oUnstableVisualizations = {};
        this._sComponent = "sap/ushell/adapters/cdm/PagesCommonDataModelAdapter";

        this.oSitePromise = new Promise(function (resolve, reject) {
            this.fnSiteResolve = resolve;
            this.fnSiteReject = reject;
        }.bind(this));
    };

    /**
     * Retrieves all available visualizations and applications and builds an initial CDM 3.1 site with them.
     *
     * @returns {jQuery.Deferred.Promise}
     *   The promise's done handler returns the CDM site object.
     *   In case an error occurred, the promise's fail handler returns an error message.
     *
     * @since 1.69.0
     * @private
     */
    PagesCommonDataModelAdapter.prototype.getSite = function () {
        var oDeferred = new jQuery.Deferred();

        sap.ushell.Container.getServiceAsync("NavigationDataProvider")
            .then(function (oNavigationDataProvider) {
                return oNavigationDataProvider.getNavigationData();
            })
            .then(function (oNavigationData) {
                var oNavigationDataHashMap = {};
                var aInbounds = oNavigationData.inbounds;
                for (var i = 0; i < aInbounds.length; i++) {
                    var sInboundPermanentKey = aInbounds[i].permanentKey || aInbounds[i].id;
                    oNavigationDataHashMap[sInboundPermanentKey] = aInbounds[i];
                }

                var oSite = {
                    _version: "3.1.0",
                    site: {},
                    catalogs: {},
                    groups: {},
                    visualizations: {},
                    applications: cdmSiteUtils.getApplications(oNavigationDataHashMap),
                    vizTypes: {},
                    systemAliases: deepExtend({}, oNavigationData.systemAliases),
                    pages: {}
                };

                this.fnSiteResolve(oSite);
                return oSite;
            }.bind(this))
            .then(oDeferred.resolve)
            .catch(function (error) {
                oDeferred.reject(error);
                this.fnSiteReject(error);
            }.bind(this));

        return oDeferred.promise();
    };

    /**
     * Retrieves the CDM Site of a specific page id.
     *
     * @param {string} pageId The ID of the page.
     * @returns {Promise}
     *   The Promise resolves with the CDM site object.
     *   The Promise rejects with an error message.
     * @since 1.72.0
     *
     * @private
     */
    PagesCommonDataModelAdapter.prototype.getPage = function (pageId) {
        if (!pageId) {
            var sErrorMessage = "PagesCommonDataModelAdapter: getPage was called without a pageId";
            Log.fatal(sErrorMessage, null, this._sComponent);
            return Promise.reject(sErrorMessage);
        }
        var bStableIDsEnabled = Config.last("/core/stableIDs/enabled");

        return this.oSitePromise.then(function (oSite) {
            if (oSite.pages[pageId]) {
                return oSite.pages[pageId];
            }

            return Promise.all([
                sap.ushell.Container.getServiceAsync("PagePersistence"),
                sap.ushell.Container.getServiceAsync("NavigationDataProvider")
            ])
                .then(function (aService) {
                    var oPagePersistenceService = aService[0];
                    var oNavigationDataProviderService = aService[1];
                    return Promise.all([
                        oPagePersistenceService.getPage(pageId),
                        oNavigationDataProviderService.getNavigationData()
                    ]);
                })
                .then(function (aResult) {
                    var oPagePersistenceData = aResult[0];
                    var oNavigationData = aResult[1];

                    this._addVisualizationsToSite(oSite, oPagePersistenceData.visualizations);
                    this._addVizTypesToSite(oSite, oPagePersistenceData);
                    this._addPageToSite(oSite, oPagePersistenceData.page, oNavigationData);

                    if (bStableIDsEnabled) {
                        this._storeUnstableVisualizations(oPagePersistenceData.page.id, oPagePersistenceData.unstableVisualizations);
                    }

                    return oSite.pages[oPagePersistenceData.page.id];
                }.bind(this))
                .catch(function (vError) {
                    Log.fatal(
                        "PagesCommonDataModelAdapter encountered an error while fetching required services: ",
                        vError,
                        this._sComponent
                    );
                    return Promise.reject(vError);
                }.bind(this));
        }.bind(this));
    };

    /**
     * Stores the unstable visualizations in an internal map. In case the object is null nothing is stored.
     * @param {string} sPageId The id of the page
     * @param {object} [oUnstableVisualizations] The unstable visualization
     *
     * @private
     * @since 1.98.0
     */
    PagesCommonDataModelAdapter.prototype._storeUnstableVisualizations = function (sPageId, oUnstableVisualizations) {
        if (!oUnstableVisualizations) {
            return;
        }

        this._oUnstableVisualizations[sPageId] = oUnstableVisualizations;
    };

    /**
     * The function extends the provided CDM site with the vizTypes of the provided OData response.
     * In case the vizTypeId is already in use, the incoming vizType will be ignored.
     *
     * @param {object} oSite The CDM adapter site
     * @param {object} oData The OData response object of the pageSet request. See PagePersistenceService#getPage.
     *
     * @since 1.90.0
     * @private
     */
    PagesCommonDataModelAdapter.prototype._addVizTypesToSite = function (oSite, oData) {
        var oVizTypesToAdd = {};
        Object.keys(oData.vizTypes).forEach(function (sVizTypeId) {
            if (!oSite.vizTypes[sVizTypeId]) {
                oVizTypesToAdd[sVizTypeId] = oData.vizTypes[sVizTypeId];
            }
        });
        extend(oSite.vizTypes, cdmSiteUtils.getVizTypes(oVizTypesToAdd));
    };

    /**
     * The function extends the provided CDM site with the provided visualizations.
     *
     * @param {object} oSite The CDM adapter site
     * @param {object} oVisualizations The visualizations returned by PagePersistenceService#getPage()
     * @param {boolean} [bCheckExistence] Check if a visualization is already present before creating it.
     *  This should be used in scenarios where it can be assumed that most of the visualizations are already present.
     *
     * @since 1.90.0
     * @private
     */
    PagesCommonDataModelAdapter.prototype._addVisualizationsToSite = function (oSite, oVisualizations, bCheckExistence) {
        var oVisualizationsToAdd;

        if (bCheckExistence) {
            oVisualizationsToAdd = {};
            Object.keys(oVisualizations).forEach(function (sVizId) {
                if (!oSite.visualizations[sVizId]) {
                    oVisualizationsToAdd[sVizId] = oVisualizations[sVizId];
                }
            });
        } else {
            oVisualizationsToAdd = oVisualizations;
        }

        extend(oSite.visualizations, cdmSiteUtils.getVisualizations(oVisualizationsToAdd));
    };

    /**
     * Inserts the provided page content into the CDM 3.1 site.
     *
     * @param {object} site CDM 3.1 site which should be updated
     * @param {object} page The page which should be inserted
     * @param {object} navigationData Navigation data which is provided by the NavigationDataProvider
     *
     * @since 1.75.0
     * @private
     */
    PagesCommonDataModelAdapter.prototype._addPageToSite = function (site, page, navigationData) {
        var oNavigationDataHashMap = {};
        var aInbounds = navigationData.inbounds;
        for (var i = 0; i < aInbounds.length; i++) {
            var sInboundPermanentKey = aInbounds[i].permanentKey || aInbounds[i].id;
            oNavigationDataHashMap[sInboundPermanentKey] = aInbounds[i];
        }

        // Insert page
        var oPage = site.pages[page.id] = {
            identification: {
                id: page.id,
                title: page.title
            },
            payload: {
                layout: {
                    sectionOrder: page.sections.map(function (section) {
                        return section.id;
                    })
                },
                sections: {}
            }
        };

        // Insert sections
        var oSection;
        var oPageSection;
        for (var j = 0; j < page.sections.length; j++) {
            oSection = page.sections[j];
            oPageSection = oPage.payload.sections[oSection.id] = {
                id: oSection.id,
                title: oSection.title,
                layout: {
                    vizOrder: oSection.viz.map(function (oViz) {
                        return oViz.id;
                    })
                },
                viz: {}
            };

            var oViz, bVisualizationMissing;

            // Insert visualizations
            for (var k = 0; k < oSection.viz.length; k++) {
                oViz = oSection.viz[k];
                // Skip vizRefs with missing visualizations
                bVisualizationMissing = !site.visualizations[oViz.vizId];

                if (bVisualizationMissing) {
                    // Remove the invalid visualization from the vizOrder
                    var aVizOrder = oPageSection.layout.vizOrder;
                    aVizOrder.splice(aVizOrder.indexOf(oViz.id), 1);

                    if (bVisualizationMissing) {
                        Log.error("Tile " + oViz.id + " with vizId " + oViz.vizId + " has no matching visualization. As the tile cannot be used to start an app it is removed from the page.");
                    }

                    continue;
                }
                oPageSection.viz[oViz.id] = {
                    id: oViz.id,
                    vizId: oViz.vizId,
                    displayFormatHint: oViz.displayFormatHint
                };
            }
        }
    };

    /**
     * Triggers loading of all requested pages.
     *
     * @param {array} aPageIds The IDs of the requested pages
     * @returns {Promise}
     *   The Promise resolves with the requested pages.
     *   The Promise rejects with an error message.
     * @since 1.75.0
     *
     * @private
     */
    PagesCommonDataModelAdapter.prototype.getPages = function (aPageIds) {
        if (!(aPageIds && Array.isArray(aPageIds) && aPageIds.length !== 0)) {
            var sErrorMessage = "PagesCommonDataModelAdapter: getPages is not an array or does not contain any Page id";
            Log.fatal(sErrorMessage, null, this._sComponent);
            return Promise.reject(sErrorMessage);
        }

        return this.oSitePromise
            .then(function (oSite) {
                var sPageId;
                var aPageIdsToLoad = [];
                for (var i = 0; i < aPageIds.length; i++) {
                    sPageId = aPageIds[i];
                    if (!oSite.pages[sPageId]) {
                        aPageIdsToLoad.push(aPageIds[i]); // Only check for pages which have not been loaded already
                    }
                }
                // return the existing pages if all the pages in array have already been loaded
                if (aPageIdsToLoad.length === 0) {
                    return oSite.pages;
                }

                return Promise.all([
                    sap.ushell.Container.getServiceAsync("PagePersistence"),
                    sap.ushell.Container.getServiceAsync("NavigationDataProvider")
                ])
                    .then(function (aServices) {
                        var oPagePersistenceService = aServices[0];
                        var oNavigationDataProviderService = aServices[1];
                        return Promise.all([
                            oPagePersistenceService.getPages(aPageIdsToLoad),
                            oNavigationDataProviderService.getNavigationData()
                        ]);
                    })
                    .then(function (aResult) {
                        var aPages = aResult[0];
                        var oNavigationData = aResult[1];

                        for (var j = 0; j < aPages.length; j++) {
                            // add visualizations and vizTypes also from the page data in case a page
                            // contains tiles that are not part of the allCatalogs request
                            this._addVisualizationsToSite(oSite, aPages[j].visualizations, true);
                            this._addVizTypesToSite(oSite, aPages[j]);
                            this._addPageToSite(oSite, aPages[j].page, oNavigationData);

                            if (Config.last("/core/stableIDs/enabled")) {
                                this._storeUnstableVisualizations(aPages[j].page.id, aPages[j].unstableVisualizations);
                            }
                        }

                        return oSite.pages;
                    }.bind(this))
                    .catch(function (vError) {
                        Log.fatal(
                            "PagesCommonDataModelAdapter encountered an error while fetching required services: ",
                            vError,
                            this._sComponent
                        );
                        return Promise.reject(vError);
                    }.bind(this));
        }.bind(this))
        .then(function (oAllLoadedPages) {
            var oRequestedPages = {};
            aPageIds.forEach(function (sPageId) {
                var oPage = oAllLoadedPages[sPageId];
                if (oPage) {
                    oRequestedPages[sPageId] = oPage;
                }
            });
            return oRequestedPages;
        });
    };

    /**
     * Retrieves the personalization part of the CDM site
     *
     * @param {string} CDMVersion The version of the CDM in use
     *
     * @returns {jQuery.Deferred.Promise}
     *   The promise's done handler returns the personalization object of the CDM site.
     *   In case an error occurred, the promise's fail handler returns an error message.
     *
     * @since 1.69.0
     * @private
     */
    PagesCommonDataModelAdapter.prototype.getPersonalization = function (CDMVersion) {
        var oDeferred = new jQuery.Deferred();

        sap.ushell.Container.getServiceAsync("Personalization")
            .then(function (oPersonalizationService) {
                var oPersId;

                var oCDMSiteVersion = new Version(CDMVersion);

                oPersId = {
                    container: "sap.ushell.cdm.personalization",
                    item: "data"
                };

                if (oCDMSiteVersion.inRange("3.1.0", "4.0.0")) {
                    oPersId = {
                        container: "sap.ushell.cdm3-1.personalization",
                        item: "data"
                    };
                }

                var oScope = {
                    validity: "Infinity",
                    keyCategory: oPersonalizationService.constants.keyCategory.GENERATED_KEY,
                    writeFrequency: oPersonalizationService.constants.writeFrequency.HIGH,
                    clientStorageAllowed: false
                };

                oPersonalizationService.getPersonalizer(oPersId, oScope).getPersData()
                    .done(function (oPersonalizationContainer) {
                        oDeferred.resolve(oPersonalizationContainer || {});
                    })
                    .fail(function (oError) {
                        oDeferred.reject(oError);
                    });
            })
            .catch(function () {
                oDeferred.reject("Personalization Service could not be loaded");
            });

        return oDeferred.promise();
    };

    /**
     * Wraps the logic for storing the personalization data.
     *
     * @param {object} personalizationData
     *   Personalization data which should get stored.
     * @returns {jQuery.Deferred.Promise}
     *   The promise's done handler indicates successful storing of personalization data.
     *   In case an error occurred, the promise's fail handler returns an error message.
     *
     * @since 1.69.0
     * @private
     */
    PagesCommonDataModelAdapter.prototype.setPersonalization = function (personalizationData) {
        var oDeferred = new jQuery.Deferred();

        sap.ushell.Container.getServiceAsync("Personalization")
            .then(function (oPersonalizationService) {
                var oPersId;
                var oCDMSiteVersion = new Version(personalizationData.version);

                oPersId = {
                    container: "sap.ushell.cdm.personalization",
                    item: "data"
                };

                if (oCDMSiteVersion.inRange("3.1.0", "4.0.0")) {
                    oPersId = {
                        container: "sap.ushell.cdm3-1.personalization",
                        item: "data"
                    };
                }
                var oScope = {
                    validity: "Infinity",
                    keyCategory: oPersonalizationService.constants.keyCategory.GENERATED_KEY,
                    writeFrequency: oPersonalizationService.constants.writeFrequency.HIGH,
                    clientStorageAllowed: false
                };

                oPersonalizationService.getPersonalizer(oPersId, oScope).setPersData(personalizationData)
                    .done(function () {
                        oDeferred.resolve(personalizationData);
                    })
                    .fail(oDeferred.reject);
            })
            .catch(function () {
                oDeferred.reject("Personalization Service could not be loaded");
            });

        return oDeferred.promise();
    };

    /**
     * The function returns every visualization of the CDM Site. An important difference to #getCachedVisualizations is, that
     * the function doesn't only return the already existing visualizations but also makes sure to load every visualization
     * from the backend using the allCatalogs OData request. Therefore this function should be used to get every visualization available
     * and not only these which were already loaded previously by the pageSet OData request.
     *
     * @since 1.90.0
     * @returns {Promise<object>} Every visualization which was loaded using the allCatalogs requests and added to the CDM site.
     * @private
     */
    PagesCommonDataModelAdapter.prototype.getVisualizations = function () {
        return sap.ushell.Container.getServiceAsync("VisualizationDataProvider").then(function (oVisualizationDataProvider) {
            return Promise.all([
                oVisualizationDataProvider.getVisualizationData(),
                this.oSitePromise
            ]).then(function (aResults) {
                var oVisualizationData = aResults[0];
                var oSite = aResults[1];
                this._addVisualizationsToSite(oSite, oVisualizationData.visualizations);
                return oSite.visualizations;
            }.bind(this));
        }.bind(this));
    };

    /**
     * The function returns every vizType of the CDM Site. An important difference to #getCachedVizTypes is, that
     * the function doesn't only return the already existing vizTypes but also makes sure to load every vizType
     * from the backend using the allCatalogs OData request. Therefore this function should be used to get every vizType available
     * and not only these which were already loaded previously by the pageSet OData request.
     *
     * @since 1.90.0
     * @returns {Promise<object>} Every vizType which was loaded using the allCatalogs requests and added to the CDM site.
     * @private
     */
    PagesCommonDataModelAdapter.prototype.getVizTypes = function () {
        return sap.ushell.Container.getServiceAsync("VisualizationDataProvider").then(function (oVisualizationDataProvider) {
            return Promise.all([
                oVisualizationDataProvider.getVisualizationData(),
                this.oSitePromise
            ]).then(function (aResults) {
                var oVisualizationData = aResults[0];
                var oSite = aResults[1];
                this._addVizTypesToSite(oSite, oVisualizationData);
                return oSite.vizTypes;
            }.bind(this));
        }.bind(this));
    };

    /**
     * It loads the vizType from the backend if it is not already found in the site
     * and adds it to the site.
     *
     * @param {string} sVizType the vizType
     * @returns {object} The single vizType which was loaded.
     * @since 1.91.0
     * @private
     */
    PagesCommonDataModelAdapter.prototype.getVizType = function (sVizType) {
        return this.oSitePromise.then(function (oSite) {
            var oVizType = oSite.vizTypes[sVizType];
            if (oVizType) {
                return oVizType;
            }

            // only chips are available for lazy loading via the VisualizationDataProvider
            if (!sVizType.startsWith("X-SAP-UI2-CHIP:")) {
                return;
            }

            return sap.ushell.Container.getServiceAsync("VisualizationDataProvider")
                .then(function (oVisualizationDataProvider) {
                    return oVisualizationDataProvider.loadVizType(sVizType);
                })
                .then(function (oLoadedVizType) {
                    if (!oLoadedVizType) {
                        return;
                    }

                    var oVizTypes = {};
                    oVizTypes[sVizType] = oLoadedVizType;
                    extend(oSite.vizTypes, cdmSiteUtils.getVizTypes(oVizTypes));
                    return oSite.vizTypes[sVizType];
                });
        });
    };

    /**
     * Returns already loaded visualizations. The function is needed on the adapter
     * because the site object of the CDM service and this adapter is not the same (deepClone).
     * The service is not capable of implementing this without the adapter because the
     * CDM site object of the adapter is not accessible from the outside.
     *
     * The function doesn't check if visualizations are available.
     * To make sure all visualizations are loaded use #getVisualizations.
     *
     * @returns {Promise<object>} CDM visualizations which are already loaded.
     * @private
     *
     * @since 1.89.0
     */
    PagesCommonDataModelAdapter.prototype.getCachedVisualizations = function () {
        return this.oSitePromise.then(function (oSite) {
            return oSite.visualizations;
        });
    };

    /**
     * Returns already loaded vizTypes. The function is needed on the adapter
     * because the site object of the CDM service and this adapter is not the same (deepClone).
     * The service is not capable of implementing this without the adapter because the
     * CDM site object of the adapter is not accessible from the outside.
     *
     * The function doesn't check if vizTypes are available.
     * To make sure all vizTypes are loaded use #getVizTypes.
     *
     * @returns {Promise<object>} CDM vizTypes which are already loaded.
     * @private
     *
     * @since 1.89.0
     */
    PagesCommonDataModelAdapter.prototype.getCachedVizTypes = function () {
        return this.oSitePromise.then(function (oSite) {
            return oSite.vizTypes;
        });
    };

    /**
     * Migrates Pages which use unstable visualizations
     * @param {object[]} aPages The list of cdm 3.1. pages
     *
     * @returns {Promise<string[]>} Resolves a list of pageIds which were migrated
     *
     * @private
     * @since 1.98.0
     */
    PagesCommonDataModelAdapter.prototype.migratePersonalizedPages = function (aPages) {
        var aPagesToSave = [];

        aPages.forEach(function (oPage) {
            var sPageId = oPage.identification.id;
            var oUnstableVisualizations = this._oUnstableVisualizations[sPageId];
            if (!oUnstableVisualizations) {
                return;
            }

            Object.keys(oPage.payload.sections).forEach(function (sSectionId) {
                var oSection = oPage.payload.sections[sSectionId];
                Object.keys(oSection.viz).forEach(function (sVizRefId) {
                    var oVizRef = oSection.viz[sVizRefId];
                    var oUnstableVisualization = oUnstableVisualizations[oVizRef.vizId];
                    if (oUnstableVisualization) {
                        oVizRef.vizId = oUnstableVisualization.vizId;
                        if (!aPagesToSave.includes(sPageId)) {
                            aPagesToSave.push(sPageId);
                        }
                    }
                });
            });

           // clear unstableVisualizations cache for this page
            this._oUnstableVisualizations[sPageId] = null;
        }.bind(this));

        return Promise.resolve(aPagesToSave);
    };

    return PagesCommonDataModelAdapter;
}, false);
