// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file Exposes a CommonDataModel based site document in a platform neutral format to it's clients
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/services/_CommonDataModel/PersonalizationProcessor",
    "sap/base/util/ObjectPath",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/isPlainObject",
    "sap/ushell/services/_CommonDataModel/SiteConverter",
    "sap/base/util/isEmptyObject",
    "sap/base/util/deepClone",
    "sap/base/util/deepExtend",
    "sap/base/util/extend",
    "sap/base/util/Version",
    "sap/ushell/Config",
    "sap/base/util/includes",
    "sap/base/util/values",
    "sap/ushell/library",
    "sap/ushell/utils",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readApplications",
    "sap/base/Log",
    "sap/ui/core/Manifest"
], function (
    PersonalizationProcessor,
    ObjectPath,
    jQuery,
    isPlainObject,
    SiteConverter,
    isEmptyObject,
    deepClone,
    deepExtend,
    extend,
    Version,
    Config,
    includes,
    objectValues,
    ushellLibrary,
    ushellUtils,
    readApplications,
    Log,
    Manifest
) {
    "use strict";

    // shortcut for sap.ushell.DisplayFormat
    var DisplayFormat = ushellLibrary.DisplayFormat;

    // shortcut for sap.ushell.ContentNodeType
    var ContentNodeType = ushellLibrary.ContentNodeType;

    var S_COMPONENT_NAME = "sap.ushell.services.CommonDataModel";
    var O_STANDARD_VIZ_TYPES = {
        STATIC_LAUNCHER: "sap.ushell.StaticAppLauncher",
        DYNAMIC_LAUNCHER: "sap.ushell.DynamicAppLauncher",
        CARD: "sap.ushell.Card"
    };

    /**
     * @param {object} oAdapter
     *   Adapter, provides an array of Inbounds
     * @param {object} oContainerInterface
     *   Not in use
     * @param {string} sParameters
     *   Parameter string, not in use
     * @param {object} oServiceConfiguration
     *   The service configuration not in use
     *
     * @constructor
     * @class
     * @see {@link sap.ushell.services.Container#getServiceAsync}
     * @since 1.40.0
     */
    function CommonDataModel (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        this._oAdapter = oAdapter;
        this._oPersonalizationProcessor = new PersonalizationProcessor();
        this._oSiteDeferred = new jQuery.Deferred();
        this._oOriginalSite = {};
        this._oPersonalizedSite = {};
        this._oContentProviderIndex = {};
        this._oSiteConverter = new SiteConverter();
        this._oPersonalizationDeltas = {};
        this._bLoadPersonalization = ushellUtils.isFlpHomeIntent();
        this._oManifestCache = {};

        // load site and personalization as early as possible in case of homepage loading
        this._oGetSitePromise = oAdapter.getSite()
            .then(function (oSite) {
                this._oOriginalSite = deepExtend({}, oSite);
                if (this._bLoadPersonalization) {
                    this._loadAndApplyPersonalization(oSite);
                }
                return oSite;
            }.bind(this))
            .fail(function (error) {
                this._oSiteDeferred.reject(error);
                this._bLoadPersonalization = true;
            }.bind(this));
    }

    CommonDataModel.prototype._loadAndApplyPersonalization = function (oSite) {
        var oCDMSiteVersion = new Version(oSite._version);
        if (oCDMSiteVersion.compareTo("3.1.0") < 0) {
            this._oAdapter.getPersonalization(oCDMSiteVersion)
                .then(function (oPers) {
                    if (oPers) {
                        this._oPersonalizationDeltas = deepClone(oPers);
                    } else {
                        this._oPersonalizationDeltas = { version: "3.0.0", _version: "3.0.0" };
                    }
                    this._triggerMixinPersonalisationInSite(oSite, oPers);
                }.bind(this))
                .fail(this._oSiteDeferred.reject); // mixinPersonalization
        } else {
            this._oPersonalizedPages = {};
            this._ensureStandardVizTypesPresent(this._oOriginalSite).then(function (_oOriginalSite) {
                this._oOriginalSite = _oOriginalSite;
                this._oOriginalSite = this._ensureProperDisplayFormats(this._oOriginalSite);
                this._oSiteDeferred.resolve(this._oOriginalSite);
            }.bind(this));
        }
    };

    /**
     * Applies the personalization to the page and stores it
     * @param {object} oPage The page without the personalization
     * @param {object} oPersonalization The personalization object of the CDM site
     * @returns {Promise<object>} Resolves with the personalized page
     *
     * @since 1.78.0
     * @private
     */
    CommonDataModel.prototype._applyPagePersonalization = function (oPage, oPersonalization) {
        var sPageId = oPage.identification.id;

        if (Object.keys(oPersonalization).length) {
            // BCP: 002075129400005034972020
            // Recover old personalization
            var oClassicPers = oPersonalization.classicHomePage;
            if (oClassicPers && oClassicPers.version === "3.1.0") {
                Object.keys(oClassicPers).forEach(function (sPage) {
                    // only recover pages which were not further personalized
                    if (!oPersonalization[sPage]) {
                        oPersonalization[sPage] = oClassicPers[sPage];
                    }
                });
                delete oPersonalization.classicHomePage;
                oPersonalization._version = oPersonalization.version;
            }

            // Migrate classic homepage personalization to pages personalization
            var oVersion = new Version(oPersonalization._version || oPersonalization.version);
            if (oVersion.compareTo("3.1.0") < 0) {
                oPersonalization = {
                    classicHomePage: oPersonalization,
                    _version: "3.1.0",
                    version: "3.1.0"
                };
            }
        }
        this._oPersonalizationDeltas = oPersonalization;

        // clone the page's personalization delta to make sure that it is not changed
        // this is important as the delta might not get extracted again before it is saved
        // which would save the changed delta
        var oPagePersonalization = deepClone(oPersonalization[sPageId], 20) || {};
        var oConvertedPage = this._oSiteConverter.convertTo("3.0.0", deepClone(oPage, 20));

        return this._triggerMixinPersonalisationInSite(oConvertedPage, oPagePersonalization)
            .then(function (oPersonalizedSite) {
                this._oPersonalizedPages[sPageId] = this._oSiteConverter.convertTo("3.1.0", deepClone(oPersonalizedSite, 20));
                return this._oPersonalizedPages[sPageId];
            }.bind(this));
    };

    /**
     * Executes the migration callback in case it is implemented on the adapter
     * and saves afterwards. The adapter implementation is required to migrate the
     * pages in place and resolve an array of pages which are required to be saved.
     * @param {object[]} aPages An array of cdm 3.1 pages
     *
     * @returns {Promise<object[]>} Resolves the migrated and saved pages
     *
     * @private
     * @since 1.98.0
     */
    CommonDataModel.prototype._migratePersonalizedPages = function (aPages) {
        if (typeof this._oAdapter.migratePersonalizedPages !== "function") {
            return Promise.resolve(aPages);
        }

        return this._oAdapter.migratePersonalizedPages(aPages)
            .then(function (aPagesToSave) {
                if (aPagesToSave.length === 0) {
                    return null;
                }

                return this.save(aPagesToSave);
            }.bind(this))
            .then(function () {
                return aPages;
            });
    };

    /**
     * This function is used to trigger the mixing of the personalization into a site object and afterwards
     * checking the personalized site for errors.
     * @param {object} site CDM 3.0 site
     * @param {object} personalization of an individual site object
     * @returns {Promise<object>} resolves when a valid personalized site was generated
     * @private
     * @since 1.76.0
     */
    CommonDataModel.prototype._triggerMixinPersonalisationInSite = function (site, personalization) {
        return new Promise(function (resolve, reject) {
            this._oPersonalizationProcessor.mixinPersonalization(site, personalization)
                .done(function (oPersonalizedSite) {
                    // Apply the Null Object Pattern to prevent errors
                    // e.g.: Avoid errors when accessing links when no links are present
                    // See internal incident BCP: 1780350619
                    this._oPersonalizedSite = this._ensureCompleteSite(oPersonalizedSite);
                    this._oPersonalizedSite = this._ensureGroupsOrder(this._oPersonalizedSite);
                    // add standard vizTypes, as otherwise they would needed to be added by an
                    // admin in the design time tool manually on all platforms...
                    this._ensureStandardVizTypesPresent(this._oPersonalizedSite)
                        .then(function (oSite) {
                            this._oPersonalizedSite = oSite;
                            this._oPersonalizedSite = this._ensureProperDisplayFormats(this._oPersonalizedSite);
                            this._oSiteDeferred.resolve(this._oPersonalizedSite);
                            resolve(this._oPersonalizedSite);
                        }.bind(this))
                        .catch(reject);
                }.bind(this))
                .fail(function (sMessage) {
                    this._oSiteDeferred.reject(sMessage);
                    reject();
                }.bind(this));
        }.bind(this));
    };

    /**
     * TODO to be removed
     * @private
     */
    CommonDataModel.prototype.getHomepageGroups = function () {
        var oDeferred = new jQuery.Deferred();

        this.getSite().then(function (oSite) {
            // the group order was not available in the very first ABAP CDM RT Site
            var aGroupsOrder = (oSite && oSite.site && oSite.site.payload && oSite.site.payload.groupsOrder)
                ? oSite.site.payload.groupsOrder : [];

            oDeferred.resolve(aGroupsOrder);
        });
        return oDeferred.promise();
    };

    /**
     * TODO to be removed
     * @private
     */
    CommonDataModel.prototype.getGroups = function () {
        var oDeferred = new jQuery.Deferred();

        this.getSite().then(function (oSite) {
            var aGroups = [];
            Object.keys(oSite.groups).forEach(function (sKey) {
                aGroups.push(oSite.groups[sKey]);
            });
            oDeferred.resolve(aGroups);
        });
        return oDeferred.promise();
    };

    /**
     * TODO to be removed
     * @private
     */
    CommonDataModel.prototype.getGroup = function (sId) {
        var oDeferred = new jQuery.Deferred();
        this.getSite().then(function (oSite) {
            var oGroup = oSite.groups[sId];
            if (oGroup) {
                oDeferred.resolve(oGroup);
            } else {
                oDeferred.reject("Group " + sId + " not found");
            }
        });
        return oDeferred.promise();
    };

    /**
     * Returns the Common Data Model site with mixed in personalization.
     * The following sections are allowed to be changed:
     *   - site.payload.groupsOrder
     *   - groups
     * Everything else must not be changed.
     *
     * @returns {jQuery.promise}
     *    resolves with the Common Data Model site
     * @private
     *
     * @see #save
     * @since 1.40.0
     */
    CommonDataModel.prototype.getSite = function () {
        //TODO JSDoc: tbd is it allowed to change "personalization" section?
        if (!this._bLoadPersonalization) {
            this.getSiteWithoutPersonalization().then(this._loadAndApplyPersonalization.bind(this));
            this._bLoadPersonalization = true;
        }
        return this._oSiteDeferred.promise();
    };

    /**
     * Returns the Common Data Model site without mixed personalization.
     * In case of the deep link we don't need to load and apply personalization
     * to the origin site, because personalization is used only for homepage
     * @returns {jQuery.promise}
     *    resolves with the Common Data Model site without personalization
     * @private
     *
     * @since 1.89.0
     */
    CommonDataModel.prototype.getSiteWithoutPersonalization = function () {
        return this._oGetSitePromise;
    };

    /**
     * Returns the Common Data Model site of a Page
     * @param {string} sPageId The Id of the page to return
     *
     * @returns {Promise<object>}
     *    Resolves with the Common Data Model site
     * @since 1.72.0
     *
     * @private
     *
     */
    CommonDataModel.prototype.getPage = function (sPageId) {
        var bEnablePersonalization = Config.last("/core/shell/enablePersonalization");
        var bEnableMyHome = Config.last("/core/spaces/myHome/enabled");
        var sMyHomePageId = Config.last("/core/spaces/myHome/myHomePageId");
        var bStableIDsEnabled = Config.last("/core/stableIDs/enabled");
        var bStableIDMigrationEnabled = Config.last("/core/stableIDs/migratePersonalization");

        return Promise.resolve(this._oGetSitePromise)
            .then(function () {
                // Allow multiple fetches without rebuilding the page
                // This enables multiple personalization actions with a single save
                if (this._oPersonalizedPages[sPageId]) {
                    return this._oPersonalizedPages[sPageId];
                }

                if (bEnablePersonalization || (bEnableMyHome && sPageId === sMyHomePageId)) {
                    return Promise.all([
                        this._getPageFromAdapter(sPageId),
                        this._oAdapter.getPersonalization(this._oOriginalSite._version)
                    ])
                        .catch(function () {
                            return Promise.reject("CommonDataModel Service: Cannot get page " + sPageId);
                        })
                        .then(function (aPageAndPersonalization) {
                            return this._applyPagePersonalization(aPageAndPersonalization[0], aPageAndPersonalization[1])
                                .catch(function () {
                                    return Promise.reject("Personalization Processor: Cannot mixin the personalization.");
                                });
                        }.bind(this))
                        .then(function (oPersonalizedPage) {
                            if (bStableIDsEnabled && bStableIDMigrationEnabled) {
                                return this._migratePersonalizedPages([oPersonalizedPage])
                                    .then(function (aMigratedPages) {
                                        return aMigratedPages[0];
                                    });
                            }
                            return oPersonalizedPage;
                        }.bind(this));
                }
                return this._getPageFromAdapter(sPageId);
            }.bind(this));
    };

    /**
     * Returns a specific page and provides a fallback for a missing adapter method.
     * The function also extends the original CDM site with newly retrieved visualizations & vizTypes.
     *
     * @param {string} sPageId The id of the page
     * @returns {Promise<object>} The page
     *
     * @since 1.78.0
     * @private
     */
    CommonDataModel.prototype._getPageFromAdapter = function (sPageId) {
        if (!this._oAdapter.getPage) {
            return Promise.resolve(deepClone(this._oOriginalSite.pages[sPageId], 20));
        }

        return this._oAdapter.getPage(sPageId)
            .then(function (oPage) {
                return Promise.all([
                    this.getCachedVisualizations(),
                    this.getCachedVizTypes()
                ]).then(function (aResults) {
                    var oVisualizations = aResults[0];
                    var oVizTypes = aResults[1];

                    this._oOriginalSite.pages[sPageId] = oPage;
                    this._oOriginalSite.visualizations = oVisualizations;
                    this._oOriginalSite.vizTypes = oVizTypes;
                    return deepClone(oPage, 20);
                }.bind(this));
            }.bind(this));
    };

    /**
     * Returns a filtered array of pages, for a given array of pages
     * Only proper pages that are not undefined or falsy are returned.
     * @param {object[]} aPages Pages to be filtered
     * @returns {object[]} The filtered pages
     */
    CommonDataModel.prototype._filterForProperPages = function (aPages) {
        return aPages.filter(function (oPage) {
            return !!oPage;
        });
    };

    /**
     * Returns the requested pages.
     *
     * @param {string[]} aPageIds The IDs of the requested pages
     * @returns {Promise<object[]>}
     *    The Promise resolves with an array of the requested pages.
     * @since 1.75.0
     *
     * @private
     */
    CommonDataModel.prototype.getPages = function (aPageIds) {
        var bEnablePersonalization = Config.last("/core/shell/enablePersonalization");
        var bEnableMyHome = Config.last("/core/spaces/myHome/enabled");
        var sMyHomePageId = Config.last("/core/spaces/myHome/myHomePageId");
        var bStableIDsEnabled = Config.last("/core/stableIDs/enabled");
        var bStableIDMigrationEnabled = Config.last("/core/stableIDs/migratePersonalization");

        return Promise.resolve(this._oGetSitePromise)
            .then(function () {
                if (bEnablePersonalization || bEnableMyHome) {
                    return Promise.all([
                        this._getPagesFromAdapter(aPageIds),
                        /* jquery promise is ok here*/
                        this._oAdapter.getPersonalization(this._oOriginalSite._version)
                    ])
                        .catch(function () {
                            return Promise.reject("CommonDataModel Service: Cannot get pages");
                        })
                        .then(function (aResults) {
                            var oPages = aResults[0];
                            var oPersonalization = aResults[1];
                            return Promise.all(Object.keys(oPages).map(function (sPageId) {
                                // Allow multiple fetches without rebuilding the page
                                // This enables multiple personalization actions with a single save
                                if (this._oPersonalizedPages[sPageId]) {
                                    return Promise.resolve(this._oPersonalizedPages[sPageId]);
                                }
                                if (!bEnablePersonalization && sPageId !== sMyHomePageId) {
                                    return Promise.resolve(oPages[sPageId]);
                                }
                                return this._applyPagePersonalization(oPages[sPageId], oPersonalization)
                                    .catch(function () {
                                        return Promise.reject("Personalization Processor: Cannot mixin the personalization.");
                                    });
                            }.bind(this)))
                                .then(function (aPersonalizedPages) {
                                    if (bStableIDsEnabled && bStableIDMigrationEnabled) {
                                        return this._migratePersonalizedPages(aPersonalizedPages);
                                    }
                                    return aPersonalizedPages;
                                }.bind(this))
                                .then(function (aPages) {
                                    return this._filterForProperPages(aPages);
                                }.bind(this));
                        }.bind(this));
                }
                return this._getPagesFromAdapter(aPageIds)
                    .then(function (oPages) {
                        return this._filterForProperPages(objectValues(oPages));
                    }.bind(this));
            }.bind(this));
    };

    /**
     * Returns a list of specific pages and provides a fallback for a missing adapter method.
     * The function also extends the original CDM site with newly retrieved visualizations & vizTypes.
     *
     * @param {string[]} aPageIds The array of page ids
     * @returns {Promise<object[]>} The array of pages
     *
     * @since 1.78.0
     * @private
     */
    CommonDataModel.prototype._getPagesFromAdapter = function (aPageIds) {
        if (!this._oAdapter.getPages) {
            var oPagesToReturn = {};
            for (var sPageId in this._oOriginalSite.pages) {
                if (includes(aPageIds, this._oOriginalSite.pages[sPageId].identification.id)) {
                    oPagesToReturn[sPageId] = this._oOriginalSite.pages[sPageId];
                }
            }
            return Promise.resolve(deepClone(oPagesToReturn, 20));
        }

        return this._oAdapter.getPages(aPageIds).then(function (oPages) {
            return Promise.all([
                this.getCachedVisualizations(),
                this.getCachedVizTypes()
            ]).then(function (aResults) {
                var oVisualizations = aResults[0];
                var oVizTypes = aResults[1];

                this._oOriginalSite.visualizations = oVisualizations;
                this._oOriginalSite.vizTypes = oVizTypes;

                Object.keys(oPages).forEach(function (sKey) {
                    this._oOriginalSite.pages[sKey] = oPages[sKey];
                }.bind(this));

                return deepClone(oPages, 20);
            }.bind(this));
        }.bind(this));
    };

    /**
     * Loads all pages
     * @param {object} [oFilter]
     *      Applies a filter before the pages are loaded.
     *      Currently no filter combinations are allowed.
     * @param {boolean} [oFilter.personalizedPages]
     *      When enabled a lookup to the personalization is done
     *      and only personalized pages are loaded.
     * @returns {Promise<object[]>} Resolves with an array of all loaded pages
     *
     * @since 1.77.0
     * @private
     */
    CommonDataModel.prototype.getAllPages = function (oFilter) {
        if (oFilter && oFilter.personalizedPages) {
            return this._getAllPersonalizedPages();
        }
        return this._getAssignedPageIds().then(function (aPageIds) {
            return this.getPages(aPageIds);
        }.bind(this));
    };

    /**
     * Resolves the ID list of the assigned pages
     * @returns {Promise<string[]>} Resolves the list of assigned pageIds
     *
     * @since 1.98.0
     * @private
     */
    CommonDataModel.prototype._getAssignedPageIds = function () {
        return sap.ushell.Container.getServiceAsync("Menu")
            .then(function (oMenuService) {
                return oMenuService.getContentNodes();
            })
            .then(function (aContentNodes) {
                var aPageIds = [];
                aContentNodes.forEach(function (oContentNode) {
                    this._collectPageIds(oContentNode, aPageIds);
                }.bind(this));
                return aPageIds;
            }.bind(this));
    };

    /**
     * Collects the page IDs referenced by a content node.
     * The result contains the page IDs of the content node's children.
     * @param {*} oContentNode Content node
     * @param {*} aPageIds Array with page IDs
     *
     * @since 1.105.0
     * @private
     */
    CommonDataModel.prototype._collectPageIds = function (oContentNode, aPageIds) {
        // Register ID once if content node is a page
        if (oContentNode.type === ContentNodeType.Page) {
            if (aPageIds.indexOf(oContentNode.id) === -1) {
                aPageIds.push(oContentNode.id);
            }
        }

        // Process children recursively
        if (oContentNode.children !== undefined) {
            oContentNode.children.forEach(function (oContentNode) {
                this._collectPageIds(oContentNode, aPageIds);
            }.bind(this));
        }
    };

    /**
     * Loads all pages which have personalization
     * @returns {Promise<object[]>} Resolves the personalized pages
     *
     * @since 1.98.0
     * @private
     */
    CommonDataModel.prototype._getAllPersonalizedPages = function () {
        return Promise.resolve(this._oGetSitePromise)
            .then(function () {
                return Promise.all([
                    this._getAssignedPageIds(),
                    new Promise(function (resolve, reject) {
                        this._oAdapter.getPersonalization(this._oOriginalSite._version)
                            .done(resolve)
                            .catch(reject);
                    }.bind(this))
                ]);
            }.bind(this))
            .then(function (aResults) {
                var aAssignedPages = aResults[0];
                var oPersonalization = aResults[1];
                var aPageIds = [];
                Object.keys(oPersonalization).forEach(function (sPageId) {
                    if (sPageId === "version" || sPageId === "_version") {
                        return;
                    }
                    if (!aAssignedPages.includes(sPageId)) {
                        return; // only load assigned pages
                    }
                    var oPagePersonalization = oPersonalization[sPageId];
                    // _version might be there even after reverting personalization
                    if (Object.keys(oPagePersonalization).length > 1) {
                        aPageIds.push(sPageId);
                    }
                });
                if (aPageIds.length > 0) {
                    return this.getPages(aPageIds);
                }
                return [];
            }.bind(this));
    };

    /**
     * Returns all applications of the Common Data Model.
     *
     * @returns {Promise<object>}
     *  A promise which resolves with all applications
     *  of the Common Data Model
     *
     * @private
     * @since 1.75.0
     */
    CommonDataModel.prototype.getApplications = function () {
        return new Promise(function (resolve, reject) {
            this.getSite()
                .then(function (oSite) {
                    var oApplications = oSite.applications;
                    if (oApplications) {
                        resolve(oApplications);
                    } else {
                        reject("CDM applications not found.");
                    }
                })
                .fail(reject);
        }.bind(this));
    };

    /**
     * Returns all vizTypes of the Common Data Model.
     * The method loads all of the available visualizations lazily from the backend
     * before returning them.
     *
     * @returns {Promise<object>}
     *  A promise which resolves with all vizTypes
     *  of the Common Data Model
     *
     * @private
     * @since 1.78.0
     */
    CommonDataModel.prototype.getVizTypes = function () {
        if (typeof this._oAdapter.getVizTypes === "function") {
            return Promise.all([
                this._getSiteProperty("vizTypes"),
                this._oAdapter.getVizTypes()
            ]).then(function (aResults) {
                var oSiteVizTypes = aResults[0];
                var oAdapterVizTypes = aResults[1];

                return extend(oSiteVizTypes, oAdapterVizTypes);
            });
        }

        // If the adapter doesn't implement #getVizTypes we can rely on the fact that the site
        // already has all of the required vizTypes. Therefore no lazy loading is needed and we return the cached vizTypes.
        return this.getCachedVizTypes();
    };

    /**
     * Returns all vizTypes of the Common Data Model which were
     * already loaded & cached internally in the CDM site.
     *
     * @returns {Promise<object>}
     *  A promise which resolves with all vizTypes
     *  of the Common Data Model
     *
     * @private
     * @since 1.89.0
     */
    CommonDataModel.prototype.getCachedVizTypes = function () {
        var oCachedVizTypesPromise = Promise.resolve();

        if (typeof this._oAdapter.getCachedVizTypes === "function") {
            oCachedVizTypesPromise = this._oAdapter.getCachedVizTypes();
        }

        return Promise.all([this._getSiteProperty("vizTypes"), oCachedVizTypesPromise]).then(function (aResults) {
            var oSiteVizTypes = aResults[0];
            var oCachedVizTypes = aResults[1];

            return extend(oSiteVizTypes, oCachedVizTypes);
        });
    };

    /**
     * Returns a single vizType of the Common Data Model.
     * The method loads it lazily from the backend before returning them.
     *
     * @param {string} sVizType the vizType
     * @returns {Promise<object>} A promise containing the single vizType.
     *
     * @private
     * @since 1.91.0
     */
    CommonDataModel.prototype.getVizType = function (sVizType) {
        var oVizTypePromise = Promise.resolve();

        if (typeof this._oAdapter.getVizType === "function") {
            oVizTypePromise = this._oAdapter.getVizType(sVizType);
        }

        return Promise.all([this._getSiteProperty("vizTypes"), oVizTypePromise]).then(function (aResults) {
            var oSiteVizTypes = aResults[0];
            var oVizType = aResults[1];

            if (oVizType) {
                oSiteVizTypes[sVizType] = oVizType;
            }

            return oSiteVizTypes[sVizType];
        });
    };

    /**
     * Returns all visualizations of the Common Data Model.
     * The method loads all of the available visualizations lazily from the backend
     * before returning them.
     *
     * @returns {Promise<object>}
     *  A promise which resolves with all visualizations
     *  of the Common Data Model
     *
     * @private
     * @since 1.75.0
     */
    CommonDataModel.prototype.getVisualizations = function () {
        if (typeof this._oAdapter.getVisualizations === "function") {
            return Promise.all([
                this._getSiteProperty("visualizations"),
                this._oAdapter.getVisualizations()
            ]).then(function (aResults) {
                var oSiteVisualizations = aResults[0];
                var oAdapterVisualizations = aResults[1];

                return extend(oSiteVisualizations, oAdapterVisualizations);
            });
        }

        // If the adapter doesn't implement #getVisualizations we can rely on the fact that the site
        // already has all of the required vizTypes. Therefore no lazy loading is needed and we return the cached visualizations.
        return this.getCachedVisualizations();
    };

    /**
     * Returns all visualizations of the Common Data Model which were
     * already loaded & cached internally in the CDM site.
     *
     * @returns {Promise<object>}
     *  A promise which resolves with all visualizations
     *  of the Common Data Model
     *
     * @private
     * @since 1.89.0
     */
    CommonDataModel.prototype.getCachedVisualizations = function () {
        var oCachedVisualizationsPromise = Promise.resolve();

        if (typeof this._oAdapter.getCachedVisualizations === "function") {
            oCachedVisualizationsPromise = this._oAdapter.getCachedVisualizations();
        }

        return Promise.all([this._getSiteProperty("visualizations"), oCachedVisualizationsPromise]).then(function (aResults) {
            var oSiteVisualizations = aResults[0];
            var oCachedVisualizations = aResults[1];

            return extend(oSiteVisualizations, oCachedVisualizations);
        });
    };

    /**
     * Returns the value located at the provided object path of the CDM site.
     * The value is returned asynchronously to make sure the site was loaded completely.
     *
     * @param {(string|string[])} vObjectPath Path as string where each name is separated by '.'. Can also be an array of names.
     * @returns {Promise} Returns the value located in the provided path. If the path does not exist completely the promise is rejected with an error message.
     *
     * @private
     * @since 1.89.0
     */
    CommonDataModel.prototype._getSiteProperty = function (vObjectPath) {
        return new Promise(function (resolve, reject) {
            this.getSite()
                .then(function (oSite) {
                    var vProperty = ObjectPath.get(vObjectPath, oSite);
                    if (vProperty) {
                        resolve(vProperty);
                    } else {
                        var sProperty = vObjectPath.toString();
                        reject("CDM " + sProperty + " not found.");
                    }
                })
                .fail(reject);
        }.bind(this));
    };

    /**
     * Returns a given group from the original site.
     *
     * @param {string} sGroupId
     *  Group id
     * @returns {jQuery.promise}
     *  Resolves with the respective group from the original site.
     *  In case the group is not existing in the original site,
     *  a respective error message is passed to the fail handler.
     * @private
     *
     * @since 1.42.0
     */
    CommonDataModel.prototype.getGroupFromOriginalSite = function (sGroupId) {
        var oDeferred = new jQuery.Deferred();

        if (typeof sGroupId === "string" &&
            this._oOriginalSite &&
            this._oOriginalSite.groups &&
            this._oOriginalSite.groups[sGroupId]) {
            oDeferred.resolve(deepExtend({}, this._oOriginalSite.groups[sGroupId]));
        } else {
            oDeferred.reject("Group does not exist in original site.");
        }

        return oDeferred.promise();
    };

    /**
     * Returns the page with the given id of the original site.
     *
     * @param {string} pageId The id of the page to be retrieved.
     *
     * @private
     * @returns {object} The page of the original site.
     *
     * @since 1.75.0
     */
    CommonDataModel.prototype.getOriginalPage = function (pageId) {
        return deepClone(this._oOriginalSite.pages[pageId], 20);
    };

    /**
     * Saves the personalization change together with the collected personalization
     * changes since the last FLP reload.
     *
     * @param {string | string[]} [pageId] The ID of the page or an array of pageIds. Needs to be provided for CDM 3.1.0
     * @returns {jQuery.promise}
     *   The promise's done handler indicates whether the collected personalization has been saved successfully.
     *   In case an error occurred, the promise's fail handler returns an error message.
     * @private
     *
     * @see #getSite
     * @since 1.40.0
     */
    CommonDataModel.prototype.save = function (pageId) {
        var oDeferred = new jQuery.Deferred();

        if (this._oOriginalSite._version === "3.1.0") {
            if (!pageId) {
                return oDeferred.reject("No page id was provided").promise();
            }
            if (typeof pageId === "string") {
                pageId = [pageId];
            }

            this._saveCdmVersion31(pageId)
                .then(oDeferred.resolve)
                .catch(oDeferred.reject);
        } else {
            this._saveCdmVersion30()
                .then(oDeferred.resolve)
                .catch(oDeferred.reject);
        }

        return oDeferred.promise();
    };

    /**
     * Extracts and saves the personalization for a CDM 3.0 site
     * @returns {Promise<void>} Resolves once the personalization was extracted and saved
     *
     * @private
     * @since 1.98.0
     */
    CommonDataModel.prototype._saveCdmVersion30 = function () {
        var oOriginalPage = this._oOriginalSite;
        var oPersonalizedPage = this._oPersonalizedSite;

        return new Promise(function (resolve, reject) {
            this._oPersonalizationProcessor.extractPersonalization(deepClone(oPersonalizedPage, 20), deepClone(oOriginalPage, 20))
                .done(resolve)
                .fail(reject);
        }.bind(this))
            .catch(function () {
                return Promise.reject("Personalization Processor: Cannot extract personalization.");
            })
            .then(function (oPersonalization) {
                if (!isEmptyObject(oPersonalization)) {
                    /* This is a problem based on the ADR which said ".version" but the CDM Adapter checks for "._version".
                    * Now we have to check for both version notations and make sure both have been written so personalization
                    * does not fail the version check.
                    */
                    if (this._oPersonalizationDeltas.version === undefined || this._oPersonalizationDeltas._version === undefined) {
                        this._oPersonalizationDeltas.version = this._oOriginalSite._version;
                        this._oPersonalizationDeltas._version = this._oOriginalSite._version;
                    }

                    this._oPersonalizationDeltas = oPersonalization;
                    return this._setPersonalization(this._oPersonalizationDeltas);
                }
                return Promise.resolve();
            }.bind(this));
    };

    /**
     * Extracts and saves the personalization for a CDM 3.1 site
     * @param {string[]} aPageIds The list of pages which should be saved
     * @returns {Promise<void>} Resolves once the personalization was extracted and saved
     *
     * @private
     * @since 1.98.0
     */
    CommonDataModel.prototype._saveCdmVersion31 = function (aPageIds) {
        // Extract personalization deltas
        var aPersPromises = aPageIds.map(function (sPageId) {
            var oOriginalPage = this._oSiteConverter.convertTo("3.0.0", this._oOriginalSite.pages[sPageId]);
            var oPersonalizedPage = this._oSiteConverter.convertTo("3.0.0", this._oPersonalizedPages[sPageId]);

            return new Promise(function (resolve, reject) {
                this._oPersonalizationProcessor.extractPersonalization(deepClone(oPersonalizedPage, 20), deepClone(oOriginalPage, 20))
                    .done(function (oPersonalization) {
                        resolve({
                            pageId: sPageId,
                            personalization: oPersonalization
                        });
                    })
                    .fail(function (sError) {
                        Log.error("Cannot extract personalization of page " + sPageId + ": " + sError, null, S_COMPONENT_NAME);
                        resolve();
                    });
            }.bind(this));
        }.bind(this));

        // save personalization deltas to internal object
        return Promise.all(aPersPromises)
            .then(function (aPersonalizations) {
                var bShouldSave = false;
                aPersonalizations.forEach(function (oDelta) {
                    if (!oDelta) {
                        return;
                    }
                    if (!isEmptyObject(oDelta.personalization)) {
                        bShouldSave = true;
                        /* This is a problem based on the ADR which said ".version" but the CDM Adapter checks for "._version".
                        * Now we have to check for both version notations and make sure both have been written so personalization
                        * does not fail the version check.
                        */
                        if (this._oPersonalizationDeltas.version === undefined || this._oPersonalizationDeltas._version === undefined) {
                            this._oPersonalizationDeltas.version = this._oOriginalSite._version;
                            this._oPersonalizationDeltas._version = this._oOriginalSite._version;
                        }

                        this._oPersonalizationDeltas[oDelta.pageId] = oDelta.personalization;
                    }
                }.bind(this));

                // Save internal object to personalization
                if (bShouldSave) {
                    return this._setPersonalization(this._oPersonalizationDeltas);
                }
                return Promise.resolve();
            }.bind(this));
    };

    /**
     * Sets the personalization based on the provided delta and page id.
     * Also prevents multiple requests and instead queries a later delta to be persisted until the currently active request is finished.
     * Only the latest delta will be persisted in this manner. If more than one request is queried all promises will be resolved as soon as the latest delta is persisted
     *
     * @param {object} extractedPersonalization The personalization delta to be persisted
     * @param {string} pageId The page ID the personalization belongs to
     * @returns {Promise<void>} A promise that wraps the Deferred of the CDM Adapter to save the personalization
     */
    CommonDataModel.prototype._setPersonalization = function (extractedPersonalization, pageId) {
        if (this._oPendingPersonalizationDeferred) {
            if (!this._oNextPersonalizationQuery) {
                this._oNextPersonalizationQuery = {
                    fnNextCall: null,
                    aPromiseResolvers: []
                };
            }
            return new Promise(function (resolve, reject) {
                this._oNextPersonalizationQuery.fnNextCall = this._setPersonalization.bind(this, extractedPersonalization, pageId);
                this._oNextPersonalizationQuery.aPromiseResolvers.push({
                    resolve: resolve,
                    reject: reject
                });
            }.bind(this));
        }
        this._oPendingPersonalizationDeferred = this._oAdapter.setPersonalization(extractedPersonalization, pageId);
        return new Promise(function (resolve, reject) {
            this._oPendingPersonalizationDeferred
                .then(resolve)
                .fail(reject)
                .always(function () {
                    delete this._oPendingPersonalizationDeferred;
                    if (this._oNextPersonalizationQuery) {
                        var oNextPersonalizationPromise = this._oNextPersonalizationQuery.fnNextCall();
                        this._cleanupPersonalizationQueuePromises(
                            oNextPersonalizationPromise,
                            this._oNextPersonalizationQuery.aPromiseResolvers
                        );
                        delete this._oNextPersonalizationQuery;
                    }
                }.bind(this));
        }.bind(this));
    };

    /**
     * Resolves or rejects the queried promises based on the result of the Adapters setPersonalization call
     *
     * @param {Promise} nextPersonalizationPromise The promise of the Adapter
     * @param {object[]} queuedPromises The pending promises that are waiting to be resolved or rejected
     */
    CommonDataModel.prototype._cleanupPersonalizationQueuePromises = function (nextPersonalizationPromise, queuedPromises) {
        queuedPromises.forEach(function (oPromise) {
            nextPersonalizationPromise
                .then(oPromise.resolve)
                .catch(oPromise.reject);
        });
    };

    /**
     * Registers extension catalogs. The functionality was removed. The function is void.
     *
     * @deprecated
     * @private
     */
    CommonDataModel.prototype.registerContentProvider = function () {
        Log.error("CommonDataModel.registerContentProvider is obsolete and should not be used.");
    };

    /**
     * Applies the Null Object Pattern to make sure that all group payload properties are initialized with empty
     * arrays or objects.
     *
     * Example:
     * Some adapter functions might assume empty arrays which produces errors if the property is undefined instead.
     * To avoid these problems we just add empty properties where they are needed.
     *
     * @param {object} oPersonalizedSite
     *      Site with personalization.
     *
     * @returns {object}
     *   The modified site
     *
     * @private
     */
    CommonDataModel.prototype._ensureCompleteSite = function (oPersonalizedSite) {
        if (oPersonalizedSite.groups) {
            var oGroups = oPersonalizedSite.groups;

            Object.keys(oGroups).forEach(function (sKey) {
                if (!oGroups[sKey]) {
                    // Undefined group detected. Cleaning it up...
                    delete oGroups[sKey];
                } else {
                    if (!oGroups[sKey].payload) {
                        // We need a payload first
                        oGroups[sKey].payload = {};
                    }

                    // Links
                    if (!oGroups[sKey].payload.links) {
                        oGroups[sKey].payload.links = [];
                    }
                    // Tiles
                    if (!oGroups[sKey].payload.tiles) {
                        oGroups[sKey].payload.tiles = [];
                    }
                    // Groups
                    if (!oGroups[sKey].payload.groups) {
                        oGroups[sKey].payload.groups = [];
                    }
                }
            });
        }

        return oPersonalizedSite;
    };

    /**
     * Filters out groups from the groups order that are not available in the site.
     * This prevents that operations that rely on a consistent groups order work incorrectly,
     * like rearranging the groups on the homepage.
     *
     * @param {object} site The site
     * @returns {object} The site with potentially modified groups order
     * @private
     */
    CommonDataModel.prototype._ensureGroupsOrder = function (site) {
        var aGroupsOrder = ObjectPath.get("site.payload.groupsOrder", site);
        var oGroups = site.groups;
        var i = 0;

        if (!aGroupsOrder) {
            return site;
        }

        // we could use Array.filter here but as there is nothing to do in the most cases we avoid copying the array
        while (i < aGroupsOrder.length) {
            var sGroupId = aGroupsOrder[i];
            if (!oGroups[sGroupId]) {
                aGroupsOrder.splice(i, 1);
            } else {
                i++;
            }
        }

        return site;
    };

    /**
     * Gets all plugins of every category in the site.
     *
     * @param {object} [oPluginSetsCache] Cache to use for fetching plugin set.
     * This is useful for testing, if the value is undefined then an internal cache will be used.
     * To invalidate the internal cache, pass null as the value.
     *
     * @returns {jQuery.promise}
     *  A promise which may resolve to the list of plugins on the site.
     *  In the case where the promise gets resolved, it resolves to an immutable
     *  reference.
     *
     * @since 1.48.0
     */
    CommonDataModel.prototype.getPlugins = (function () {
        var fnExtractPluginConfigFromInboundSignature = function (sPluginName, oSignatureInbounds) {
            var iNumInbounds = Object.keys(oSignatureInbounds).length;

            if (iNumInbounds === 0) {
                return {};
            }

            if (!oSignatureInbounds.hasOwnProperty("Shell-plugin")) {
                Log.error(
                    "Cannot find inbound with id 'Shell-plugin' for plugin '" +
                    sPluginName + "'",
                    "plugin startup configuration cannot be determined correctly",
                    S_COMPONENT_NAME
                );
                return {};
            }

            if (iNumInbounds > 1) {
                Log.warning(
                    "Multiple inbounds are defined for plugin '" + sPluginName + "'",
                    "plugin startup configuration will be determined using "
                    + "the signature of 'Shell-plugin' inbound.",
                    S_COMPONENT_NAME
                );
            }

            var oSignatureParams = ObjectPath.get("signature.parameters", oSignatureInbounds["Shell-plugin"]) || {};

            return Object.keys(oSignatureParams).reduce(
                function (oResult, sNextParam) {
                    var sDefaultValue = ObjectPath.get(sNextParam + ".defaultValue.value", oSignatureParams);

                    if (typeof sDefaultValue === "string") {
                        oResult[sNextParam] = sDefaultValue;
                    }

                    return oResult;
                },
                {} /* oResult */
            );
        };

        // Recursively freezes an object.
        var fnDeepFreeze = function (o) {
            Object.keys(o)
                .filter(function (sProperty) {
                    return typeof o[sProperty] === "object";
                })
                .forEach(function (sProperty) {
                    o[sProperty] = fnDeepFreeze(o[sProperty]);
                });

            return Object.freeze(o);
        };

        var oPluginSets;
        return function (oPluginSetsCache) {
            if (oPluginSetsCache !== undefined) {
                oPluginSets = oPluginSetsCache;
            }

            if (oPluginSets) {
                return jQuery.when(oPluginSets);
            }

            oPluginSets = {};

            return this.getSiteWithoutPersonalization().then(function (oSite) {
                var oApplications = oSite.applications || {};

                Object.keys(oApplications).filter(function (sAppName) {
                    return ObjectPath.get("type", this[sAppName]["sap.flp"]) === "plugin";
                }, oApplications).forEach(function (sPluginName) {
                    var oConfigFromInboundSignature;
                    var oPlugin = this[sPluginName];
                    var oComponentProperties = {};

                    if (!isPlainObject(oPlugin["sap.platform.runtime"])) {
                        Log.error("Cannot find 'sap.platform.runtime' section for plugin '"
                            + sPluginName + "'",
                            "plugin might not be started correctly",
                            "sap.ushell.services.CommonDataModel");
                    } else if (!isPlainObject(oPlugin["sap.platform.runtime"].componentProperties)) {
                        Log.error("Cannot find 'sap.platform.runtime/componentProperties' " +
                            "section for plugin '"
                            + sPluginName + "'",
                            "plugin might not be started correctly",
                            "sap.ushell.services.CommonDataModel");
                    } else {
                        oComponentProperties = oPlugin["sap.platform.runtime"].componentProperties;
                    }

                    oPluginSets[sPluginName] = {
                        url: oComponentProperties.url,
                        component: oPlugin["sap.ui5"].componentName
                    };

                    //
                    // define plugin configuration
                    //
                    var oSignatureInbounds = ObjectPath.get(
                        "crossNavigation.inbounds", oPlugin["sap.app"]
                    ) || {};

                    oConfigFromInboundSignature = fnExtractPluginConfigFromInboundSignature(
                        sPluginName,
                        oSignatureInbounds
                    );

                    var oPluginConfig = extend(
                        oComponentProperties.config || {},
                        oConfigFromInboundSignature // has precedence
                    );

                    if (oPluginConfig) {
                        oPluginSets[sPluginName].config = oPluginConfig;
                    }

                    if (oComponentProperties.asyncHints) {
                        oPluginSets[sPluginName].asyncHints = oComponentProperties.asyncHints;
                    }

                    var oDeviceTypes = ObjectPath.get("deviceTypes", oPlugin["sap.ui"]);
                    if (oDeviceTypes) {
                        oPluginSets[sPluginName].deviceTypes = oDeviceTypes;
                    }
                }, oApplications);

                return fnDeepFreeze(oPluginSets);
            }, function (vError) {
                return vError;
            });
        };
    })();

    /**
     * Checks if each of the given display formats is a valid enum entry of {@link sap.ushell.DisplayFormat}.
     * Unsupported values are filtered out from the resulting list.
     *
     * @param {string[]} aDisplayFormats A list of display formats coming from a CDM site. May contain entries that are not part of {@link sap.ushell.DisplayFormat}.
     * @returns {sap.ushell.DisplayFormat[]} A list of supported display formats.
     * @private
     */
    CommonDataModel.prototype._mapDisplayFormats = function (aDisplayFormats) {
        var oDisplayFormatMap = {
            tile: DisplayFormat.Standard,
            standard: DisplayFormat.Standard,
            link: DisplayFormat.Compact,
            compact: DisplayFormat.Compact,
            flat: DisplayFormat.Flat,
            flatWide: DisplayFormat.FlatWide,
            tileWide: DisplayFormat.StandardWide,
            standardWide: DisplayFormat.StandardWide
        };

        var aSupportedFormats = Object.keys(oDisplayFormatMap).filter(function (sDisplayFormat) {
            return aDisplayFormats.indexOf(sDisplayFormat) > -1;
        });

        return aSupportedFormats.map(function (sSupportedFormat) {
            return oDisplayFormatMap[sSupportedFormat];
        });
    };

    CommonDataModel.prototype._ensureProperDisplayFormats = function (oSite) {
        if (oSite.vizTypes) {
            Object.keys(oSite.vizTypes).forEach(function (sKey) {
                if (oSite.vizTypes[sKey]["sap.flp"] && oSite.vizTypes[sKey]["sap.flp"].vizOptions) {
                    var oVizType = oSite.vizTypes[sKey];
                    var aSupportedDisplayFormats = ObjectPath.get("vizOptions.displayFormats.supported", oVizType["sap.flp"]);
                    var sDefaultDisplayFormat = ObjectPath.get("vizOptions.displayFormats.default", oVizType["sap.flp"]);

                    if (aSupportedDisplayFormats) {
                        oSite.vizTypes[sKey]["sap.flp"].vizOptions.displayFormats.supported = this._mapDisplayFormats(aSupportedDisplayFormats);
                    }
                    if (sDefaultDisplayFormat) {
                        oSite.vizTypes[sKey]["sap.flp"].vizOptions.displayFormats.default = this._mapDisplayFormats([sDefaultDisplayFormat])[0];
                    }
                }
            }.bind(this));
        }

        if (oSite.hasOwnProperty("pages")) {
            Object.keys(oSite.pages).forEach(function (sKey) {
                var oPage = oSite.pages[sKey];
                if (oPage.payload && oPage.payload.sections) {
                    var oSections = oPage.payload.sections;
                    Object.keys(oSections).forEach(function (sSectionKey) {
                        var oSection = oSections[sSectionKey];
                        Object.keys(oSection.viz).forEach(function (sVizKey) {
                            var oViz = oSection.viz[sVizKey];
                            if (oViz.displayFormatHint) {
                                var aMappedFormat = this._mapDisplayFormats([oViz.displayFormatHint])[0];
                                oViz.displayFormatHint = aMappedFormat || oViz.displayFormatHint;
                            }
                        }.bind(this));
                    }.bind(this));
                }
            }.bind(this));
        } else if (oSite.hasOwnProperty("groups")) {
            Object.keys(oSite.groups).forEach(function (sGroupKey) {
                var oGroup = oSite.groups[sGroupKey];
                oGroup.payload.tiles.forEach(function (oTile) {
                    if (oTile.displayFormatHint) {
                        var aMappedFormat = this._mapDisplayFormats([oTile.displayFormatHint])[0];
                        oTile.displayFormatHint = aMappedFormat || oTile.displayFormatHint;
                    }
                }.bind(this));
            }.bind(this));
        }

        return oSite;
    };

    /**
     * Adds the standard visualization types if they are not already present in the site.
     *
     * @param {object} oSite
     *  The site
     * @returns {Promise<object>}
     *  The site, including the standard visualization types
     * @private
     */
    CommonDataModel.prototype._ensureStandardVizTypesPresent = function (oSite) {
        if (!(oSite._version && oSite._version.startsWith("3."))) {
            return Promise.resolve(oSite);
        }

        if (!oSite.vizTypes) {
            oSite.vizTypes = {};
        }

        var aPromises = [];

        var oStandardManifests = {};
        oStandardManifests[O_STANDARD_VIZ_TYPES.STATIC_LAUNCHER] = "sap/ushell/components/tiles/cdm/applauncher/manifest.json";
        oStandardManifests[O_STANDARD_VIZ_TYPES.DYNAMIC_LAUNCHER] = "sap/ushell/components/tiles/cdm/applauncherdynamic/manifest.json";
        oStandardManifests[O_STANDARD_VIZ_TYPES.CARD] = "sap/ushell/services/_CommonDataModel/vizTypeDefaults/cardManifest.json";

        Object.keys(oStandardManifests).forEach(function (sVizType) {
            if (!oSite.vizTypes[sVizType]) {
                var sManifestUrl = oStandardManifests[sVizType];

                var oPromise = this._loadManifest(sManifestUrl).then(function (oManifest) {
                    oSite.vizTypes[sVizType] = oManifest;
                });

                aPromises.push(oPromise);
            }
        }.bind(this));

        if (aPromises.length === 0) {
            return Promise.resolve(oSite);
        }
        return Promise.all(aPromises).then(function () {
            return oSite;
        });
    };

    /**
     * Loads the manifest and caches the result
     * @param {string} sUrl
     * path to the manifest e.g. "sap/ushell/components/tiles/cdm/applauncher/manifest.json"
     * @returns {Promise<object>} Resolves the manifest
     *
     * @since 1.98.0
     * @private
     */
    CommonDataModel.prototype._loadManifest = function (sUrl) {
        if (!this._oManifestCache[sUrl]) {
            var sManifestUrl = sap.ui.require.toUrl(sUrl);

            this._oManifestCache[sUrl] = Manifest.load({
                manifestUrl: sManifestUrl,
                async: true
            })
                .then(function (oManifest) {
                    return oManifest.getRawJson();
                });
        }
        return this._oManifestCache[sUrl].then(function (oManifest) {
            // we need to clone the object since the original is read only
            // in addition we want to avoid inconsistencies
            return deepClone(oManifest);
        });
    };

    /**
     * Returns the menu entries for a menu
     * @param {string} sMenuKey key of a menu
     *
     * @returns {Promise<object[]>} A promise which resolves in an array of menu entries
     *
     * @private
     * @since 1.76.0
     */
    CommonDataModel.prototype.getMenuEntries = function (sMenuKey) {
        return new Promise(function (resolve, reject) {
            this.getSite().then(function (oSite) {
                var aMenuEntries = ObjectPath.get("menus." + sMenuKey + ".payload.menuEntries", oSite);
                // return a copy of the menu so that the original site cannot get changed
                resolve(deepClone(aMenuEntries) || []);
            });
        }.bind(this));
    };

    /**
     * Returns the id of all content providers.
     *
     * @returns {Promise<string[]>} A Promise resolving to an array containing the content provider ids
     *
     * @private
     * @since 1.80.0
     */
    CommonDataModel.prototype.getContentProviderIds = function () {
        return new Promise(function (resolve, reject) {
            this.getSite().then(function (oSite) {
                var aSystemAliases = Object.keys(oSite.systemAliases);
                var oContentProviderIds = {};

                objectValues(oSite.applications).forEach(function (oApplication) {
                    var sContentProviderId = readApplications.getContentProviderId(oApplication);

                    if (includes(aSystemAliases, sContentProviderId)) {
                        oContentProviderIds[sContentProviderId] = true;
                    }
                });

                resolve(Object.keys(oContentProviderIds));
            });
        }.bind(this));
    };

    CommonDataModel.hasNoAdapter = false;
    return CommonDataModel;
}, true /* bExport */);
