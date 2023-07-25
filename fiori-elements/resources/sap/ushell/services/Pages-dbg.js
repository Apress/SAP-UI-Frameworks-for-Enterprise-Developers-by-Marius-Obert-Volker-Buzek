// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview This module exposes a model containing the pages hierarchy to its clients.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/utils/RestrictedJSONModel",
    "sap/base/util/deepClone",
    "sap/base/util/extend",
    "sap/base/util/deepExtend",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ushell/Config",
    "sap/ushell/adapters/cdm/v3/utilsCdm",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readUtils",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readVisualizations",
    "sap/base/util/ObjectPath"
], function (
    Log,
    RestrictedJSONModel,
    deepClone,
    extend,
    deepExtend,
    resources,
    ushellUtils,
    Config,
    utilsCdm,
    readUtils,
    readVisualizations,
    ObjectPath
) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getServiceAsync("PageReferencing").then(function (PageReferencing) {});</code>.
     * Constructs a new instance of the page referencing service.
     *
     * @namespace sap.ushell.services.PageReferencing
     *
     * @constructor
     * @class
     * @see {@link sap.ushell.services.Container#getServiceAsync}
     * @since 1.72.0
     *
     * @private
     */
    var Pages = function () {
        this.COMPONENT_NAME = "sap/ushell/services/Pages";
        this._oCdmServicePromise = sap.ushell.Container.getServiceAsync("CommonDataModel");
        this._oCSTRServicePromise = sap.ushell.Container.getServiceAsync("ClientSideTargetResolution");
        this._oPagesModel = new RestrictedJSONModel({
            pages: []
        });
        this._bImplicitSaveEnabled = true;
        this._aPagesToBeSaved = [];
    };

    /**
     * Generates a new id which is unique within a page for sections as well as for visualizations.
     *
     * @param {string} sPageId The ID of the page.
     * @returns {string} A pseudo-unique ID.
     *
     * @since 1.75.0
     * @private
     */
    Pages.prototype._generateId = function (sPageId) {
        var aIds = [];
        var oPage = this.getModel().getProperty(this.getPagePath(sPageId));

        oPage.sections.forEach(function (oSection) {
            aIds.push(oSection.id);
            oSection.visualizations.forEach(function (oVisualization) {
                aIds.push(oVisualization.id);
            });
        });

        return ushellUtils.generateUniqueId(aIds);
    };

    /**
     * Returns the model
     *
     * @returns {object} Read only model
     * @since 1.72.0
     *
     * @private
     */
    Pages.prototype.getModel = function () {
        return this._oPagesModel;
    };

    /**
     * Sets the default for implicit save after a personalization
     * @param {boolean} bEnable Whether to implicitly save
     *
     * @since 1.85.0
     * @private
     */
    Pages.prototype.enableImplicitSave = function (bEnable) {
        this._bImplicitSaveEnabled = bEnable;
    };

    /**
     * Calculates the index of a specific page in the model.
     *
     * @param {string} sPageId The ID of a page.
     * @returns {int|undefined} The index of the page within the model or "undefined" if the page is not in the model.
     *
     * @since 1.75.0
     * @private
     */
    Pages.prototype.getPageIndex = function (sPageId) {
        var aPages = this._oPagesModel.getProperty("/pages");
        for (var iPageIndex = 0; iPageIndex < aPages.length; ++iPageIndex) {
            if (aPages[iPageIndex].id === sPageId) {
                return iPageIndex;
            }
        }
        return undefined;
    };

    /**
     * Calculates the path to a specific page in the model.
     *
     * @param {string} sPageId The ID of a page.
     * @returns {string} Path to the page in the model or an empty string ("") if the page is not in the model.
     * @since 1.72.0
     *
     * @private
     */
    Pages.prototype.getPagePath = function (sPageId) {
        var iPageIndex = this.getPageIndex(sPageId);
        if (typeof iPageIndex === "undefined") {
            return "";
        }
        return "/pages/" + iPageIndex;
    };

    /**
     * Loads a page into the model
     *
     * @param {string} sPageId id of the page
     * @returns {Promise<string>} promise resolves with the path to the page in the model after the page is loaded
     * @since 1.72.0
     *
     * @private
     */
    Pages.prototype.loadPage = function (sPageId) {
        var sPagePath = this.getPagePath(sPageId);

        if (sPagePath) {
            return Promise.resolve(sPagePath);
        }

        ushellUtils.setPerformanceMark(["FLP-Pages-Service-loadPage-start[", sPageId, "]"].join(""));

        return this._oCdmServicePromise
            .catch(function (oError) {
                Log.error("Pages - loadPage: Couldn't resolve CDM Service.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (oCdmService) {
                return Promise.all([
                    oCdmService.getPage(sPageId),
                    oCdmService.getCachedVisualizations(),
                    oCdmService.getApplications(),
                    oCdmService.getCachedVizTypes()
                ]);
            })
            .then(function (aResults) {
                var oPage = aResults[0];
                var oVisualizations = aResults[1];
                var oApplications = aResults[2];
                var oVizTypes = aResults[3];
                return this._getModelForPage(oPage, oVisualizations, oApplications, oVizTypes);
            }.bind(this))
            .then(function (oModelForPage) {
                var iPageCount = this._oPagesModel.getProperty("/pages/").length;
                var sNewPagePath = "/pages/" + iPageCount;
                this._oPagesModel._setProperty(sNewPagePath, oModelForPage);
                ushellUtils.setPerformanceMark(["FLP-Pages-Service-loadPage-end[", sPageId, "]"].join(""));
                return sNewPagePath;
            }.bind(this))
            .catch(function (oError) {
                Log.error("Pages - loadPage: Failed to gather site data.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Loads multiple pages into the model.
     * This causes the pages navContainer to instantiate controls for all the loaded pages.
     *
     * @param {string[]} aPageIds ids of the pages
     * @returns {Promise<object>} promise that resolves with the paths to pages in the model after the pages are loaded
     * @since 1.103.0
     *
     * @private
     */
    Pages.prototype.loadPages = function (aPageIds) {

        return this._oCdmServicePromise
            .then(function (oCdmService) {
                // load and cache all the pages with a single request
                return oCdmService.getPages(aPageIds);
            })
            .then(function () {
                return Promise.all(
                    aPageIds.map(function (sPageId) {
                        // single access is ok here as the data has been loaded before
                        return this.loadPage(sPageId);
                    }.bind(this))
                );
            }.bind(this))
            .then(function (aPagePaths) {
                var oPagePaths = {};
                aPageIds.forEach(function (sPageId, i) {
                    oPagePaths[sPageId] = aPagePaths[i];
                });
                return oPagePaths;
            });
    };

    /**
     * @typedef {object} VisualizationLocation The location of a visualization within a page section.
     * @property {int} pageId The ID of the page where the section is.
     * @property {int} sectionIndex The section index within that page.
     * @property {int[]} vizIndexes The visualization indexes within that section.
     */

    /**
     * Find every index of a visualization within the sections of a page.
     *
     * @param {string} sPageId The "pageId" of the page to be searched on.
     * @param {string} [sSectionId] The "sectionId" of the page to be searched on. The optional parameter.
     *                              If sectionId is set, search is executed within the given section. Otherwise, within all sections.
     * @param {string} [sVizId] The "vizId" of the visualization to look for.
     * @param {string} [sVizRefId] The "vizRefId" of the visualization to look for.
     *
     * @returns {VisualizationLocation[]} An array of {@link VisualizationLocation}, retrieving every index of a visualization within a page.
     */
    Pages.prototype.findVisualization = function (sPageId, sSectionId, sVizId, sVizRefId) {
        return this._oCdmServicePromise
            .catch(function (oError) {
                Log.error("Pages - findVisualization: Personalization cannot be saved: CDM Service cannot be retrieved.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (oCdmService) {
                return Promise.all([
                    this.loadPage(sPageId),
                    oCdmService.getCachedVisualizations(),
                    oCdmService.getApplications()
                ])
                    .then(function (aResults) {
                        var sPagePath = aResults[0];
                        var aPageSections = this.getModel().getProperty(sPagePath + "/sections") || [];
                        return aPageSections.reduce(function (accumulatorSections, section, sectionIndex) {
                            if (sSectionId && section.id !== sSectionId) {
                                return accumulatorSections;
                            }
                            var aVizIndexes = section.visualizations.reduce(function (accumulatorVisualizations, viz, vizIndex) {
                                if (sVizId && viz.vizId === sVizId ||
                                    sVizRefId && viz.id === sVizRefId) {
                                    accumulatorVisualizations.push(vizIndex);
                                }
                                return accumulatorVisualizations;
                            }, []);
                            if (aVizIndexes.length) {
                                accumulatorSections.push({
                                    pageId: sPageId,
                                    sectionIndex: sectionIndex,
                                    vizIndexes: aVizIndexes
                                });
                            }
                            return accumulatorSections;
                        }, []);
                    }.bind(this))
                    .catch(function (oError) {
                        Log.error("Pages - findVisualization: Couldn't load page, get visualizations or applications.", oError, this.COMPONENT_NAME);
                        return Promise.reject(oError);
                    }.bind(this));
            }.bind(this));
    };

    /**
     * Moves a visualization inside the model and updates the CDM site of the CDM service accordingly.
     *
     * @param {int} iPageIndex The index of the page containing the moved visualization.
     * @param {int} iSourceSectionIndex The index of the section from where the visualization is moved.
     * @param {int} iSourceVisualizationIndex The index of the moved visualization.
     * @param {int} iTargetSectionIndex The index of the section to which the visualization should be moved.
     * @param {int} iTargetVisualizationIndex The new index of the moved visualization. If -1 is passed, the visualization is moved to the last position.
     *
     * @returns {Promise<object>} Promise which resolves with an object containing the visualizationIndex after the personalization was saved.
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.moveVisualization = function (iPageIndex, iSourceSectionIndex, iSourceVisualizationIndex, iTargetSectionIndex, iTargetVisualizationIndex) {
        // Do nothing if visualization is moved on itself.
        if (iSourceSectionIndex === iTargetSectionIndex && iSourceVisualizationIndex === iTargetVisualizationIndex) {
            return Promise.resolve({
                visualizationIndex: iTargetVisualizationIndex
            });
        }

        this.setPersonalizationActive(true);
        var oPage = this._oPagesModel.getProperty("/pages/" + iPageIndex);
        var sPageId = oPage.id;
        var aSections = oPage.sections;
        var oSourceSection = aSections[iSourceSectionIndex];
        var oTargetSection = aSections[iTargetSectionIndex];
        var sSourceSectionId = oSourceSection.id;
        var sTargetSectionId = oTargetSection.id;
        var oMovedVisualization = oSourceSection.visualizations[iSourceVisualizationIndex];
        var sMovedVisualizationId = oMovedVisualization.id;

        // Update visualizations reference to enable recalculation of visualizations.length which enables hide of section
        oSourceSection.visualizations = oSourceSection.visualizations.concat([]);
        oTargetSection.visualizations = oTargetSection.visualizations.concat([]);

        // Remove the visualization from the source section
        oSourceSection.visualizations.splice(iSourceVisualizationIndex, 1);

        // Insert the visualization into the target section
        if (iTargetVisualizationIndex === -1) {
            iTargetVisualizationIndex = oTargetSection.visualizations.length;
        }
        oTargetSection.visualizations.splice(iTargetVisualizationIndex, 0, oMovedVisualization);

        var iPreviousVisualizationIndex;
        if (oTargetSection.visualizations[iTargetVisualizationIndex]) {
            iPreviousVisualizationIndex = iTargetVisualizationIndex - 1;
        } else {
            iPreviousVisualizationIndex = oTargetSection.visualizations.length - 2;
        }
        var sPreviousVisualizationId;
        if (oTargetSection.visualizations[iPreviousVisualizationIndex]) {
            sPreviousVisualizationId = oTargetSection.visualizations[iPreviousVisualizationIndex].id;
        }

        // If the default section becomes empty, delete it
        if (oSourceSection.default && !oSourceSection.visualizations.length) {
            aSections.splice(iSourceSectionIndex, 1);
        }

        this._oPagesModel.refresh();

        // Modify the personalized page in the CDM 3.1 site
        return this._oCdmServicePromise
            .then(function (oCdmService) {
                return oCdmService.getPage(sPageId);
            })
            .catch(function (oError) {
                Log.error("Pages - moveVisualization: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (oCdmPage) {
                var oSourceSectionInPage = oCdmPage.payload.sections[sSourceSectionId];
                var aSourceVizOrder = oSourceSectionInPage.layout.vizOrder;
                var oSourceViz = oSourceSectionInPage.viz;

                var oTargetSectionInPage = oCdmPage.payload.sections[sTargetSectionId];
                var aTargetVizOrder = oTargetSectionInPage.layout.vizOrder;
                var oTargetViz = oTargetSectionInPage.viz;

                var oMovedVisualizationClone = deepClone(oSourceViz[sMovedVisualizationId]);

                var iSourceVizOrderIndex = aSourceVizOrder.indexOf(sMovedVisualizationId);
                aSourceVizOrder.splice(iSourceVizOrderIndex, 1);

                // It can happen that the vizOrder array contains visualization ids that are filtered out for the pages model.
                // Therefore, we need to determine the index in the vizOrder array: search for the index of the previous viz and increment by one.
                var iTargetVizOrderIndex = sPreviousVisualizationId ? aTargetVizOrder.indexOf(sPreviousVisualizationId) + 1 : 0;
                aTargetVizOrder.splice(iTargetVizOrderIndex, 0, sMovedVisualizationId);

                if (sSourceSectionId !== sTargetSectionId) {
                    delete oSourceViz[sMovedVisualizationId];
                    oTargetViz[sMovedVisualizationId] = oMovedVisualizationClone;
                }

                // If the default section becomes empty, delete it
                if (oSourceSectionInPage.default && !Object.keys(oSourceViz).length) {
                    delete oCdmPage.payload.sections[sSourceSectionId]; // delete section from sections
                    oCdmPage.payload.layout.sectionOrder.splice(iSourceSectionIndex, 1); // delete index from sectionOrder
                }

                return this._conditionalSavePersonalization(sPageId);
            }.bind(this))
            .then(function () {
                return {
                    visualizationIndex: iTargetVisualizationIndex
                };
            })
            .catch(function (oError) {
                this.setPersonalizationActive(false);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Deletes a visualization inside the model as well as inside the page of the CDM 3.1 site.
     *
     * @param {int} iPageIndex The index of the page containing the deleted visualization.
     * @param {int} iSourceSectionIndex The index of the section from where the visualization is deleted.
     * @param {int} iSourceVisualizationIndex The index of the deleted visualization.
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     * @private
     */
    Pages.prototype.deleteVisualization = function (iPageIndex, iSourceSectionIndex, iSourceVisualizationIndex) {
        var oPageModel = this._oPagesModel.getProperty("/pages/" + iPageIndex);
        var oSectionModel = oPageModel.sections[iSourceSectionIndex];

        // If the default section becomes empty, delete it
        if (oSectionModel.default && oSectionModel.visualizations.length < 2) {
            return this.deleteSection(iPageIndex, iSourceSectionIndex);
        }

        this.setPersonalizationActive(true);
        var aSourceSectionVisualizations = oSectionModel.visualizations;
        var oRemovedVisualization = aSourceSectionVisualizations[iSourceVisualizationIndex];
        aSourceSectionVisualizations.splice(iSourceVisualizationIndex, 1);
        this._oPagesModel.refresh();

        return this._oCdmServicePromise
            .then(function (oCDMService) {
                return oCDMService.getPage(oPageModel.id);
            })
            .catch(function (oError) {
                Log.error("Pages - deleteVisualization: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (oPage) {
                var aSectionVizOrder = oPage.payload.sections[oSectionModel.id].layout.vizOrder;
                var oVizRefs = oPage.payload.sections[oSectionModel.id].viz;
                var iRemovedVisualizationIndex = aSectionVizOrder.indexOf(oRemovedVisualization.id);
                delete oVizRefs[oRemovedVisualization.id];
                if (iRemovedVisualizationIndex > -1) {
                    aSectionVizOrder.splice(iRemovedVisualizationIndex, 1);
                }
                return this._conditionalSavePersonalization(oPage.identification.id);
            }.bind(this))
            .catch(function (oError) {
                this.setPersonalizationActive(false);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Returns the index of the section.
     *
     * @param {string} sPagePath The path of the page the section is on.
     * @param {string} sSectionId The id of the section that we want the index of.
     *
     * @returns {int} The index of the section with the given section id.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype._getSectionIndex = function (sPagePath, sSectionId) {
        var aSections = this.getModel().getProperty(sPagePath + "/sections") || [];
        var i = 0;

        for (; i < aSections.length; i += 1) {
            if (aSections[i].id === sSectionId) {
                return i;
            }
        }
    };

    /**
     * Returns the visualization data for the given visualization id.
     *
     * @param {string} sPageId Id of the Page
     * @param {string} sVizId The visualization id of the visualization data that should be returned.
     * @param {object} oVisualizations A map of all visualization.
     * @param {object} [oAdditionalVizData] Additional visualization data that should overwrite the standard data.
     * @param {object} oApplications A map of all applications.
     * @param {object} oVizTypes The map of vizTypes
     * @param {object} oSystemContext The system context
     *
     * @returns {object} The visualization data for the given visualization id.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype._getVisualizationData = function (sPageId, sVizId, oVisualizations, oAdditionalVizData, oApplications, oVizTypes, oSystemContext) {
        var oVisualizationReference = oAdditionalVizData || {
            vizId: sVizId
        };

        var oSite = {
            applications: oApplications,
            visualizations: oVisualizations,
            vizTypes: oVizTypes
        };
        var oVizData = readUtils.getVizData(oSite, oVisualizationReference, oSystemContext);
        if (!oVizData.id) {
            oVizData.id = this._generateId(sPageId);
        }
        return oVizData;
    };

    /**
     * Adds a new visualization to the model and to the CDM 3.1 site.
     *
     * If no section ID is specified, the visualization is added to the 'Recently Added' section automatically.
     *
     * @param {string} sPageId The id of the page the visualization should be added to.
     * @param {string} [sSectionId] The id of the section the visualization should be added to.
     * @param {string} sVizId The id of the visualization to add.
     * @param {string} sDisplayFormatHint The form factor of the visualization to add.
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @protected
     */
    Pages.prototype.addVisualization = function (sPageId, sSectionId, sVizId, sDisplayFormatHint) {
        return this._oCdmServicePromise
            .catch(function (oError) {
                Log.error("Pages - addVisualization: Personalization cannot be saved: CDM Service cannot be retrieved.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (oCdmService) {
                return Promise.all([
                    this.loadPage(sPageId),
                    oCdmService.getVisualizations(),
                    oCdmService.getApplications(),
                    oCdmService.getVizTypes()
                ])
                    .catch(function (oError) {
                        Log.error("Pages - addVisualization: Personalization cannot be saved: Failed to load page, get visualizations or get applications.", oError, this.COMPONENT_NAME);
                        return Promise.reject(oError);
                    }.bind(this))
                    .then(function (aResult) {
                        var sPagePath = aResult[0];
                        var oVisualizations = aResult[1];
                        var oApplications = aResult[2];
                        var oVizTypes = aResult[3];
                        var iSectionIndex = this._getSectionIndex(sPagePath, sSectionId);
                        var aSection = this.getModel().getProperty(sPagePath + "/sections") || [];
                        var oVisualizationData = this._getVisualizationData(sPageId, sVizId, oVisualizations, null, oApplications, oVizTypes);

                        if (sDisplayFormatHint) { // save with the same displayFormatHint in case of copy (Add to My Home)
                            oVisualizationData.displayFormatHint = sDisplayFormatHint;
                        }

                        // Find default section
                        var iDefaultSectionIndex;
                        for (var i = 0; i < aSection.length; i++) {
                            if (aSection[i].default) {
                                iDefaultSectionIndex = i;
                            }
                        }

                        // Add visualization to existing default section, update model & site, save personalization
                        if (iSectionIndex !== undefined || iDefaultSectionIndex !== undefined) {
                            this.setPersonalizationActive(true);
                            var iSectionPathIndex = iSectionIndex !== undefined ? iSectionIndex : iDefaultSectionIndex || 0;
                            var sVisualizationsPath = sPagePath + "/sections/" + iSectionPathIndex + "/visualizations";

                            this.getModel().getProperty(sVisualizationsPath).push(oVisualizationData);
                            this.getModel().refresh();

                            return oCdmService.getPage(sPageId)
                                .catch(function (oError) {
                                    Log.error("Pages - addVisualization: Personalization cannot be saved: Failed to get page.", oError, this.COMPONENT_NAME);
                                    return Promise.reject(oError);
                                }.bind(this))
                                .then(function (oPage) {
                                    var oSection = oPage.payload.sections[sSectionId || oPage.payload.layout.sectionOrder[0]];

                                    oSection.layout.vizOrder.push(oVisualizationData.id);
                                    oSection.viz[oVisualizationData.id] = {
                                        id: oVisualizationData.id,
                                        vizId: sVizId
                                    };
                                    if (sDisplayFormatHint) {
                                        oSection.viz[oVisualizationData.id].displayFormatHint = sDisplayFormatHint;
                                    }

                                    return this._conditionalSavePersonalization(sPageId);
                                }.bind(this));
                        }

                        // Create a new default section together with the visualization if there is no default section yet
                        var iPageIndex = parseInt(sPagePath.split("/")[2], 10);
                        return this.addSection(iPageIndex, 0, {
                            title: resources.i18n.getText("DefaultSection.Title"),
                            default: true,
                            visualizations: [oVisualizationData]
                        });
                    }.bind(this));
            }.bind(this))
            .catch(function (oError) {
                this.setPersonalizationActive(false);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Copies a visualization to another page.
     *
     * @param {string} sPageId The id of the page the visualization should be added to.
     * @param {string|null} [sSectionId] The id of the section the visualization should be added to. If null is given, the default section is used.
     * @param {object} oVizData An object containing the vizData from the model.
     * @return {Promise<undefined>} A promise resolving when the copy action was completed.
     *
     * @private
     * @since 1.94.0
     */
    Pages.prototype.copyVisualization = function (sPageId, sSectionId, oVizData) {
        var bIsBookmark = oVizData.isBookmark;

        if (!bIsBookmark) {
            return this.addVisualization(sPageId, sSectionId, oVizData.vizId, oVizData.displayFormatHint);
        }

        return this.addBookmarkToPage(sPageId, {
            title: oVizData.title,
            subtitle: oVizData.subtitle,
            url: oVizData.targetURL,
            icon: oVizData.icon,
            info: oVizData.info,
            serviceUrl: oVizData.indicatorDataSource ? oVizData.indicatorDataSource.path : "",
            serviceRefreshInterval: oVizData.indicatorDataSource ? oVizData.indicatorDataSource.refresh : "",
            numberUnit: oVizData.numberUnit,
            vizType: oVizData.vizType,
            vizConfig: oVizData.vizConfig
        }, sSectionId);
    };

    /**
     * Moves a section inside the model
     *
     * @param {int} iPageIndex The index of the page containing the moved section.
     * @param {int} iSourceSectionIndex The index of the moved section.
     * @param {int} iTargetSectionIndex The new index of the moved section.
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.moveSection = function (iPageIndex, iSourceSectionIndex, iTargetSectionIndex) {
        if (iSourceSectionIndex === iTargetSectionIndex) {
            return Promise.resolve();
        }

        this.setPersonalizationActive(true);

        var sPageId = this._oPagesModel.getProperty("/pages/" + iPageIndex + "/id");
        var aSections = this._oPagesModel.getProperty("/pages/" + iPageIndex + "/sections");
        var oMovedSection = this._oPagesModel.getProperty("/pages/" + iPageIndex + "/sections/" + iSourceSectionIndex);
        var sMovedSectionId = oMovedSection.id;

        // Remove the section
        aSections.splice(iSourceSectionIndex, 1);

        // Updates indices because of removing sections
        if (iSourceSectionIndex < iTargetSectionIndex) {
            iTargetSectionIndex--;
        }

        // Insert the section
        aSections.splice(iTargetSectionIndex, 0, oMovedSection);

        this._oPagesModel.refresh();

        return this._oCdmServicePromise
            .then(function (oCdmService) {
                return oCdmService.getPage(sPageId);
            })
            .catch(function (oError) {
                Log.error("Pages - moveSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (oPage) {
                var aSectionOrder = oPage.payload.layout.sectionOrder;

                aSectionOrder.splice(aSectionOrder.indexOf(sMovedSectionId), 1);
                aSectionOrder.splice(iTargetSectionIndex, 0, sMovedSectionId);

                return this._conditionalSavePersonalization(sPageId);
            }.bind(this))
            .catch(function (oError) {
                this.setPersonalizationActive(false);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Adds an empty section to the model
     *
     * @param {int} iPageIndex The index of the page to which the section is added
     * @param {int} iSectionIndex The index of the added section.
     * @param {object} [oSectionProperties] Properties of the added section.
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.addSection = function (iPageIndex, iSectionIndex, oSectionProperties) {
        this.setPersonalizationActive(true);

        var oSectionReference = oSectionProperties || {};
        var aSections = this._oPagesModel.getProperty("/pages/" + iPageIndex + "/sections");
        var sPageId = this._oPagesModel.getProperty("/pages/" + iPageIndex + "/id");

        var oNewSection = {
            id: oSectionReference.id !== undefined ? oSectionReference.id : this._generateId(sPageId),
            title: oSectionReference.title !== undefined ? oSectionReference.title : "",
            visible: oSectionReference.visible !== undefined ? oSectionReference.visible : true,
            preset: oSectionReference.preset !== undefined ? oSectionReference.preset : false,
            locked: oSectionReference.locked !== undefined ? oSectionReference.locked : false,
            default: oSectionReference.default !== undefined ? oSectionReference.default : false,
            visualizations: oSectionReference.visualizations !== undefined ? oSectionReference.visualizations : []
        };

        aSections.splice(iSectionIndex, 0, oNewSection);

        this._oPagesModel.refresh();

        return this._oCdmServicePromise
            .then(function (oCdmService) {
                return oCdmService.getPage(sPageId);
            })
            .catch(function (oError) {
                Log.error("Pages - addSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (oPage) {
                var oSection = {
                    id: oNewSection.id,
                    title: oNewSection.title,
                    visible: oNewSection.visible,
                    preset: oNewSection.preset,
                    locked: oNewSection.locked,
                    default: oNewSection.default,
                    layout: {
                        vizOrder: []
                    },
                    viz: {}
                };

                if (oNewSection.visualizations) {
                    var i = 0;
                    var oVizData;

                    for (; i < oNewSection.visualizations.length; i++) {
                        oVizData = oNewSection.visualizations[i];
                        oSection.layout.vizOrder.push(oVizData.id);
                        if (oVizData.isBookmark) {
                            oSection.viz[oVizData.id] = readUtils.getVizRef(oVizData);
                        } else {
                            oSection.viz[oVizData.id] = {
                                id: oVizData.id,
                                vizId: oVizData.vizId
                            };
                            if (oVizData.displayFormatHint) { // save with the same displayFormatHint in case of copy (Add to My Home)
                                oSection.viz[oVizData.id].displayFormatHint = oVizData.displayFormatHint;
                            }
                        }
                    }
                }

                oPage.payload.layout.sectionOrder.splice(iSectionIndex, 0, oNewSection.id);
                oPage.payload.sections[oNewSection.id] = oSection;

                return this._conditionalSavePersonalization(sPageId);
            }.bind(this))
            .catch(function (oError) {
                this.setPersonalizationActive(false);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Deletes a section out of the model.
     *
     * @param {int} iPageIndex The index of the page containing the deleted section.
     * @param {int} iSectionIndex The index of deleted section.
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.deleteSection = function (iPageIndex, iSectionIndex) {
        this.setPersonalizationActive(true);

        var sPageId = this._oPagesModel.getProperty("/pages/" + iPageIndex + "/id");
        var aSections = this._oPagesModel.getProperty("/pages/" + iPageIndex + "/sections");
        var sSectionId = aSections[iSectionIndex].id;
        aSections.splice(iSectionIndex, 1);
        this._oPagesModel.refresh();

        return this._oCdmServicePromise
            .then(function (oCdmService) {
                return oCdmService.getPage(sPageId);
            })
            .catch(function (oError) {
                Log.error("Pages - deleteSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (oPage) {
                delete oPage.payload.sections[sSectionId];
                oPage.payload.layout.sectionOrder.splice(iSectionIndex, 1);
                return this._conditionalSavePersonalization(sPageId);
            }.bind(this))
            .catch(function (oError) {
                this.setPersonalizationActive(false);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Sets the visibility of a section.
     *
     * @param {int} iPageIndex The index of the page containing the section.
     * @param {int} iSectionIndex The index of the section.
     * @param {bool} bVisibility The new visibility value.
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.setSectionVisibility = function (iPageIndex, iSectionIndex, bVisibility) {
        this.setPersonalizationActive(true);

        var sPageId = this._oPagesModel.getProperty("/pages/" + iPageIndex + "/id");
        var sSectionId = this._oPagesModel.getProperty("/pages/" + iPageIndex + "/sections/" + iSectionIndex + "/id");
        var oSection = this._oPagesModel.getProperty("/pages/" + iPageIndex + "/sections/" + iSectionIndex);

        if (oSection.visible === bVisibility) {
            return Promise.resolve();
        }

        oSection.visible = bVisibility;
        this._oPagesModel.refresh();

        return this._oCdmServicePromise
            .then(function (oCdmService) {
                return oCdmService.getPage(sPageId);
            })
            .catch(function (oError) {
                Log.error("Pages - setSectionVisibility: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (oPage) {
                oPage.payload.sections[sSectionId].visible = bVisibility;
                return this._conditionalSavePersonalization(sPageId);
            }.bind(this))
            .catch(function (oError) {
                this.setPersonalizationActive(false);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Sets the title of a section.
     *
     * @param {int} iPageIndex The index of the page containing the section.
     * @param {int} iSectionIndex The index of the section.
     * @param {string} sNewTitle The new title value.
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     * @private
     */
    Pages.prototype.renameSection = function (iPageIndex, iSectionIndex, sNewTitle) {
        this.setPersonalizationActive(true);

        var oPageModel = this._oPagesModel.getProperty("/pages/" + iPageIndex);
        var oSectionModel = oPageModel.sections[iSectionIndex];
        oSectionModel.title = sNewTitle;
        this._oPagesModel.refresh();

        return this._oCdmServicePromise
            .then(function (oCDMService) {
                return oCDMService.getPage(oPageModel.id);
            })
            .catch(function (oError) {
                Log.error("Pages - renameSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (oPage) {
                oPage.payload.sections[oSectionModel.id].title = sNewTitle;
                return this._conditionalSavePersonalization(oPage.identification.id);
            }.bind(this))
            .catch(function (oError) {
                this.setPersonalizationActive(false);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Resets a section in the pages model as well as inside the page of the CDM 3.1 site.
     *
     * @param {int} iPageIndex The index of the page containing the section.
     * @param {int} iSectionIndex The index of the section.
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.resetSection = function (iPageIndex, iSectionIndex) {
        this.setPersonalizationActive(true);

        var sPageId = this._oPagesModel.getProperty("/pages/" + iPageIndex + "/id");
        var sSectionId = this._oPagesModel.getProperty("/pages/" + iPageIndex + "/sections/" + iSectionIndex + "/id");

        return this._oCdmServicePromise
            .then(function (oCdmService) {
                return Promise.all([
                    oCdmService.getCachedVisualizations(),
                    oCdmService.getApplications(),
                    oCdmService.getPage(sPageId),
                    oCdmService.getOriginalPage(sPageId),
                    oCdmService.getCachedVizTypes()
                ]);
            })
            .catch(function (oError) {
                Log.error("Pages - resetSection: Personalization cannot be saved: Failed to gather data from CDM Service.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (aResults) {
                var oVisualizations = aResults[0];
                var oApplications = aResults[1];
                var oCdmPage = aResults[2];
                var oOriginalCdmPage = aResults[3];
                var oVizTypes = aResults[4];

                return Promise.all([
                    this._getModelForPage(oOriginalCdmPage, oVisualizations, oApplications, oVizTypes),
                    oCdmPage,
                    oOriginalCdmPage
                ]);
            }.bind(this))
            .then(function (aResults) {
                var oOriginalPageModel = aResults[0];
                var oCdmPage = aResults[1];
                var oOriginalCdmPage = aResults[2];

                var oOriginalSectionModel = deepClone(oOriginalPageModel.sections.find(function (section) {
                    return section.id === sSectionId;
                }), 20);

                var aOriginalVizIds = oOriginalSectionModel.visualizations.map(function (oVisualization) {
                    return oVisualization.id;
                });

                // the following loop ensures unique ids for viz references within a page according to adr-1011
                var oCurrentPageModel = this._oPagesModel.getProperty("/pages/" + iPageIndex);
                oCurrentPageModel.sections.forEach(function (oCurrentSectionModel) {
                    // Check in other sections if there is any visualization having a same id as in the reset section, if yes, generate a new id for this visualization.
                    if (oOriginalSectionModel.id !== oCurrentSectionModel.id) {
                        oCurrentSectionModel.visualizations.forEach(function (oVisualization) {
                            if (aOriginalVizIds.indexOf(oVisualization.id) !== -1) {
                                var sNewId = this._generateId(sPageId);

                                var oVizRef = deepClone(oCdmPage.payload.sections[oCurrentSectionModel.id].viz[oVisualization.id]);
                                delete oCdmPage.payload.sections[oCurrentSectionModel.id].viz[oVisualization.id];
                                var iVizOrderIndex = oCdmPage.payload.sections[oCurrentSectionModel.id].layout.vizOrder.indexOf(oVizRef.id);

                                oVizRef.id = sNewId;
                                oCdmPage.payload.sections[oCurrentSectionModel.id].viz[sNewId] = oVizRef;
                                oCdmPage.payload.sections[oCurrentSectionModel.id].layout.vizOrder[iVizOrderIndex] = sNewId;

                                oVisualization.id = sNewId;
                            }
                        }.bind(this));
                    }
                }.bind(this));

                this._oPagesModel._setProperty("/pages/" + iPageIndex + "/sections/" + iSectionIndex, oOriginalSectionModel);

                // Reset the CDM3.1 Site
                oCdmPage.payload.sections[oOriginalSectionModel.id] = oOriginalCdmPage.payload.sections[oOriginalSectionModel.id];
                return this._conditionalSavePersonalization(oCdmPage.identification.id);
            }.bind(this))
            .catch(function (oError) {
                this.setPersonalizationActive(false);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Resets a page in the model as well as inside the CDM 3.1 site.
     *
     * @param {int} iPageIndex The index of the page.
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.resetPage = function (iPageIndex) {
        this.setPersonalizationActive(true);

        var sPageId = this._oPagesModel.getProperty("/pages/" + iPageIndex + "/id");

        return this._oCdmServicePromise
            .then(function (oCdmService) {
                return Promise.all([
                    oCdmService.getCachedVisualizations(),
                    oCdmService.getApplications(),
                    oCdmService.getPage(sPageId),
                    oCdmService.getOriginalPage(sPageId),
                    oCdmService.getCachedVizTypes()
                ]);
            })
            .catch(function (oError) {
                Log.error("Pages - resetPage: Personalization cannot be saved: Failed to gather data from CDM Service.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (aResults) {
                var oVisualizations = aResults[0];
                var oApplications = aResults[1];
                var oCdmPage = aResults[2];
                var oOriginalCdmPage = aResults[3];
                var oVizTypes = aResults[4];
                return Promise.all([
                    this._getModelForPage(oOriginalCdmPage, oVisualizations, oApplications, oVizTypes),
                    oCdmPage,
                    oOriginalCdmPage
                ]);
            }.bind(this))
            .then(function (aResults) {
                var oOriginalPageModel = aResults[0];
                var oCdmPage = aResults[1];
                var oOriginalCdmPage = aResults[2];
                this._oPagesModel._setProperty("/pages/" + iPageIndex, oOriginalPageModel);

                // Reset the CDM3.1 Site
                oCdmPage.payload = deepClone(oOriginalCdmPage.payload);
                return this._conditionalSavePersonalization(oCdmPage.identification.id);
            }.bind(this))
            .catch(function (oError) {
                this.setPersonalizationActive(false);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Handles the personalization state.
     * If set to true, initializes the model data used for personalization if it was not done already
     * If set to false, deletes the pending personalization changes by copying the original model
     *
     * @since 1.76.0
     *
     * @param {bool} bState The new personalization state
     *
     * @private
     */
    Pages.prototype.setPersonalizationActive = function (bState) {
        if (!this._bDirtyState && bState === true) {
            this._bDirtyState = true;
            this._oCopiedModelData = deepClone(this._oPagesModel.getProperty("/"), 20);
        } else if (this._bDirtyState && bState === false) {
            this._oPagesModel._setData(this._oCopiedModelData);
            this._bDirtyState = false;
        }
    };

    /**
     * Saves the personalization and resets the dirty state.
     * In case no page id was provided and if {@link #enableImplicitSave} was set to false, all unsaved modified pages are saved.
     * @param {string} [sPageId] the id of the page which should be saved
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved.
     * @see #enableImplicitSave()
     *
     * @since 1.74.0
     * @private
     */
    Pages.prototype.savePersonalization = function (sPageId) {
        var aPages;
        if (!sPageId) {
            aPages = deepClone(this._aPagesToBeSaved);
        } else {
            aPages = [sPageId];
        }

        return this._oCdmServicePromise
            .then(function (oCdmService) {
                return Promise.all(aPages.map(function (sPage) {
                    // Remove page from list because the current state will be saved
                    var iIndex = this._aPagesToBeSaved.indexOf(sPage);
                    this._aPagesToBeSaved.splice(iIndex, 1);

                    return new Promise(function (resolve, reject) {
                        oCdmService.save(sPage).then(resolve, reject);
                    })
                        .catch(function (oError) {
                            // Add page back to list because it wasn't saved
                            if (this._aPagesToBeSaved.indexOf(sPage) === -1) {
                                this._aPagesToBeSaved.push(sPage);
                            }
                            return Promise.reject(oError);
                        }.bind(this));
                }.bind(this)));
            }.bind(this))
            .then(function () {
                this._bDirtyState = false;
            }.bind(this))
            .catch(function (oError) {
                Log.error("Pages - savePersonalization: Personalization cannot be saved: CDM Service cannot be retrieved or the save process encountered an error.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Saves the personalization depending on the default of the implicit save
     * @param {string} sPageId the id of the page which should be saved
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved.
     *
     * @since 1.85.0
     * @private
     */
    Pages.prototype._conditionalSavePersonalization = function (sPageId) {
        if (this._bImplicitSaveEnabled) {
            return this.savePersonalization(sPageId);
        }

        // remember page ID for later save
        if (this._aPagesToBeSaved.indexOf(sPageId) === -1) {
            this._aPagesToBeSaved.push(sPageId);
        }

        // save disabled, so don't do anything!
        return Promise.resolve();
    };

    /**
     * Returns an object which conforms to the JSON Model structure which is used by the
     * consumers of the Pages service to bind UI5 controls.
     *
     * @param {object} page A CDM 3.1 page
     * @param {object} visualizations All the visualizations of the CDM site
     * @param {object} applications All the applications of the CDM site
     * @param {object} vizTypes All the vizTypes of the CDM site
     * @param {string} [sContentProviderId] The contentProviderId or undefined outside the cFLP
     *
     * @returns {Promise<object>} A promise that resolves to an object which represents the page inside the Pages Service JSON Model
     *
     * @since 1.75.0
     * @private
     */
    Pages.prototype._getModelForPage = function (page, visualizations, applications, vizTypes) {

        var oPage = {
            id: (page && page.identification && page.identification.id) || "",
            title: (page && page.identification && page.identification.title) || "",
            description: "",
            sections: []
        };
        ushellUtils.setPerformanceMark(["FLP-Pages-Service-getModelForPage-start[", oPage.id, "]"].join(""));

        return Promise.all([
            this._oCSTRServicePromise
        ])
            .catch(function (oError) {
                return Promise.reject(oError);
            })
            .then(function (aResults) {
                var oCSTRService = aResults[0];
                var bEnableHiddenGroup = Config.last("/core/catalog/enableHideGroups");

                return Promise.all(page.payload.layout.sectionOrder.map(function (sSectionId) {
                    var oCDMPageSection = page.payload.sections[sSectionId];
                    var oSection = {
                        id: oCDMPageSection.id || "",
                        title: oCDMPageSection.default ? resources.i18n.getText("DefaultSection.Title") : oCDMPageSection.title || "",
                        visualizations: [],
                        visible: !bEnableHiddenGroup || (oCDMPageSection.visible !== undefined ? oCDMPageSection.visible : true),
                        locked: oCDMPageSection.locked !== undefined ? oCDMPageSection.locked : false,
                        preset: oCDMPageSection.preset !== undefined ? oCDMPageSection.preset : true,
                        default: oCDMPageSection.default !== undefined ? oCDMPageSection.default : false
                    };
                    oPage.sections.push(oSection);

                    return Promise.all(oCDMPageSection.layout.vizOrder.map(function (id) {
                        var oVisualizationReference = oCDMPageSection.viz[id];
                        var sVizId = oVisualizationReference.vizId;
                        return oCSTRService.getSystemContext(oVisualizationReference.contentProviderId)
                            .then(function (oSystemContext) {
                                var oVizData = this._getVisualizationData(page.identification.id, sVizId, visualizations, oVisualizationReference, applications, vizTypes, oSystemContext);
                                // In order to keep the order of the visualizations we have to add them first and remove them later asynchronously
                                oSection.visualizations.push(oVizData);

                                return this._isIntentSupported(oVizData, oCSTRService)
                                    .then(function (bIntentIsSupported) {
                                        if (!bIntentIsSupported) {
                                            var iIndex = oSection.visualizations.findIndex(function (oViz) {
                                                return oViz.id === oVizData.id;
                                            });
                                            oSection.visualizations.splice(iIndex, 1);
                                            Log.warning("The visualization " + oVizData.vizId + " is filtered out, because it does not have a supported intent.");
                                        }
                                    });
                            }.bind(this));
                    }.bind(this)));
                }.bind(this)))
                    .then(function () {
                        ushellUtils.setPerformanceMark(["FLP-Pages-Service-getModelForPage-end[", oPage.id, "]"].join(""));
                        return oPage;
                    });
            }.bind(this));
    };

    /**
     * Removes visualizations from a section that do not have a supported indent.
     * Note that this only removes them from the pages model and not from the CDM model.
     *
     * @param {int} pageIndex The index of the page containing the section.
     * @param {int} sectionIndex The index of the section containing the visualizations.
     * @returns {Promise<void>} Promise which resolves after all visualizations have been checked (and removed).
     *
     * @since 1.90.0
     * @private
     */
    Pages.prototype.removeUnsupportedVisualizations = function (pageIndex, sectionIndex) {
        return this._oCSTRServicePromise.then(function (oCSTRService) {
            var aVisualizations = this.getModel().getProperty("/pages/" + pageIndex + "/sections/" + sectionIndex + "/visualizations/");

            var aPromises = [];

            for (var i = aVisualizations.length - 1; i >= 0; --i) {
                aPromises.push(this._isIntentSupported(aVisualizations[i], oCSTRService)
                    .then(function (index, bIntentSupported) {
                        if (!bIntentSupported) {
                            aVisualizations.splice(index, 1);
                        }
                        return bIntentSupported;
                    }.bind(this, i)));
             }

            return Promise.all(aPromises).then(function (aResults) {
                if (aResults.indexOf(false) !== -1) {
                    this.getModel().refresh();
                }
            }.bind(this));
        }.bind(this));
    };

    /**
     * Checks whether a visualization can be resolved in the current context
     * @param {object} oVizData The vizData object which should be checked
     * @param {object} oCSTRService The resolved ClientSideTargetResolution service
     * @returns {Promise<boolean>} A Promise resolving a boolean indicating whether this visualization should be filtered out or not
     *
     * @since 1.78.0
     * @private
     */
    Pages.prototype._isIntentSupported = function (oVizData, oCSTRService) {
        if (oVizData.target === undefined) {
            return Promise.resolve(false);
        }
        if (oVizData.target.type === "URL") {
            if (readVisualizations.isStandardVizType(oVizData.vizType)) {
                // Only check for the target url on standard viz types as custom tiles
                // should still be shown even if they have no target url (e.g News Tile).
                return Promise.resolve(!!oVizData.target.url);
            }
            return Promise.resolve(true);
        }
        return new Promise(function (resolve, reject) {
            oCSTRService.isIntentSupported([oVizData.targetURL])
                .then(function (oSupported) {
                    resolve(oSupported[oVizData.targetURL].supported);
                })
                .fail(function () {
                    resolve(false);
                });
        });
    };

    /**
     * Adds a new bookmark tile to the model and to the CDM 3.1 site.
     *
     * @param {string} pageId The id of the page to which the bookmark should be added.
     * @param {object} bookmark
     *   Bookmark parameters. In addition to title and URL, a bookmark might allow additional
     *   settings, such as an icon or a subtitle. Which settings are supported depends
     *   on the environment in which the application is running. Unsupported parameters will be ignored.
     * @param {string} bookmark.title
     *   The title of the bookmark.
     * @param {string} bookmark.url
     *   The URL of the bookmark. If the target application shall run in the Shell the URL has
     *   to be in the format <code>"#SO-Action~Context?P1=a&P2=x&/route?RPV=1"</code>.
     * @param {string} [bookmark.icon]
     *   The optional icon URL of the bookmark (e.g. <code>"sap-icon://home"</code>).
     * @param {string} [bookmark.info]
     *   The optional information text of the bookmark. This property is not relevant in the CDM context.
     * @param {string} [bookmark.subtitle]
     *   The optional subtitle of the bookmark.
     * @param {string} [bookmark.serviceUrl]
     *   The URL to a REST or OData service that provides some dynamic information for the bookmark.
     * @param {object} [oParameters.dataSource]
     *   Metadata for parameter serviceUrl. Mandatory to specify if parameter serviceURL contains semantic date ranges.
     *   This does not influence the data source of the app itself.
     * @param {string} [oParameters.dataSource.type]
     *   The type of the serviceURL's service. Only "OData" is supported.
     * @param {object} [oParameters.dataSource.settings.odataVersion]
     *   The OData version of parameter serviceURL. Valid values are "2.0" and "4.0".
     * @param {string} [bookmark.serviceRefreshInterval]
     *   The refresh interval for the <code>serviceUrl</code> in seconds.
     * @param {string} [bookmark.numberUnit]
     *   The unit for the number retrieved from <code>serviceUrl</code>.
     *   This property is not relevant in the CDM context.
     * @param {string} [bookmark.vizType]
     *   The vizType of the bookmark.
     *   This is only used for custom bookmarks.
     * @param {object} [bookmark.vizConfig]
     *   The vizConfig of the bookmark.
     *   This is only used for custom bookmarks.
     * @param {string} [sectionId] The id of the section to which the bookmark should be added.
     * @param {string} [sContentProviderId] The contentProviderId or undefined outside the cFLP
     *
     * @returns {Promise<void>} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.addBookmarkToPage = function (pageId, bookmark, sectionId, sContentProviderId) {
        if (!pageId) {
            return Promise.reject("Pages - addBookmarkToPage: Adding bookmark tile failed: No page id is provided.");
        }

        var aVizTypeIds = readUtils.getBookmarkVizTypeIds(bookmark);

        this.setPersonalizationActive(true);

        // Ensure the target page is loaded
        return Promise.all([
            this._oCdmServicePromise,
            this._oCSTRServicePromise
        ])
            .then(function (aServices) {
                var oCdmService = aServices[0];
                var oCSTRService = aServices[1];
                var aVizTypePromises = aVizTypeIds.map(function (sVizType) {
                    return oCdmService.getVizType(sVizType);
                });
                return Promise.all(aVizTypePromises).then(function (aResults) {
                    var oVizTypes = {};
                    aResults.forEach(function (oVizType, iIndex) {
                        oVizTypes[aVizTypeIds[iIndex]] = oVizType;
                        return oVizTypes;
                    });

                    return Promise.all([
                        this.loadPage(pageId),
                        oVizTypes,
                        oCSTRService.getSystemContext(sContentProviderId)
                    ]);
                }.bind(this));
            }.bind(this))
            .catch(function (oError) {
                Log.error("Pages - addBookmarkToPage: Personalization cannot be saved: Could not load page.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (aResults) {
                var pagePath = aResults[0];
                var oVizTypes = aResults[1];
                var oSystemContext = aResults[2];
                // Create visualization data for the model
                var oVizRef = {
                    id: this._generateId(pageId),
                    vizType: bookmark.vizType,
                    title: bookmark.title,
                    subTitle: bookmark.subtitle,
                    icon: bookmark.icon,
                    info: bookmark.info,
                    numberUnit: bookmark.numberUnit,
                    target: utilsCdm.toTargetFromHash(bookmark.url),
                    indicatorDataSource: {
                        path: bookmark.serviceUrl,
                        refresh: bookmark.serviceRefreshInterval
                    },
                    vizConfig: bookmark.vizConfig,
                    isBookmark: true
                };

                if (bookmark.dataSource) {
                    oVizRef.dataSource = {
                        type: bookmark.dataSource.type,
                        settings: {
                            odataVersion: ObjectPath.get(["dataSource", "settings", "odataVersion"], bookmark)
                        }
                    };
                }

                if (sContentProviderId) {
                    oVizRef.contentProviderId = sContentProviderId;
                }

                var oVizData = this._getVisualizationData(pageId, undefined, {}, oVizRef, {}, oVizTypes, oSystemContext);

                // Find page & section
                var iPageIndex = parseInt(/pages\/(\d+)/.exec(pagePath)[1], 10);
                var oPage = this._oPagesModel.getProperty(pagePath);

                var oSectionToAdd;
                if (sectionId) {
                    oSectionToAdd = oPage.sections.find(function (section) {
                        return section.id === sectionId;
                    });
                    if (!oSectionToAdd) {
                        Log.error("Pages - addBookmarkToPage: Adding bookmark tile failed: specified section was not found in the page.");
                        return Promise.reject("Pages - addBookmarkToPage: Adding bookmark tile failed: specified section was not found in the page.");
                    }
                } else {
                    oSectionToAdd = oPage.sections.find(function (section) {
                        return section.default;
                    });
                    // Create a new default section together with the visualization if there is no default section yet
                    if (!oSectionToAdd) {
                        return this.addSection(iPageIndex, 0, {
                            title: resources.i18n.getText("DefaultSection.Title"),
                            default: true,
                            visualizations: [oVizData]
                        });
                    }
                }


                // Add visualization to existing default section, update model & site, save personalization
                oSectionToAdd.visualizations.push(oVizData);
                this._oPagesModel.refresh();
                return this._oCdmServicePromise
                    .then(function (oCdmService) {
                        return oCdmService.getPage(pageId);
                    })
                    .catch(function (oError) {
                        Log.error("Pages - addBookmarkToPage: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
                        return Promise.reject(oError);
                    }.bind(this))
                    .then(function (page) {
                        var oSection = page.payload.sections[oSectionToAdd.id];

                        oSection.layout.vizOrder.push(oVizData.id);
                        oSection.viz[oVizData.id] = readUtils.getVizRef(oVizData);
                        // Save
                        return this._conditionalSavePersonalization(pageId);
                    }.bind(this));
            }.bind(this))
            .catch(function (oError) {
                this.setPersonalizationActive(false);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Calls the visitor function for every page in the CDM site.
     * Currently the returned Promise does not wait for the visitorFunctions to finish asynchronous tasks!
     *
     * @param {function} fnVisitor The visitor function
     * @returns {Promise<void>} A Promise that resolves once all the pages were visited
     *
     * @since 1.82.0
     * @private
     */
    Pages.prototype._visitPages = function (fnVisitor) {
        return this._oCdmServicePromise
            .then(function (oCdmService) {
                return oCdmService.getAllPages();
            })
            .then(function (aPages) {
                aPages = aPages || [];
                aPages.forEach(function (oPage) {
                    fnVisitor(oPage);
                });
            });
    };

    /**
     * Calls the visitor function for every section in the CDM site.
     * Currently the returned Promise does not wait for the visitorFunctions to finish asynchronous tasks!
     *
     * @param {function} fnVisitor The visitor function
     * @returns {Promise<void>} A Promise that resolves once all the pages were visited
     *
     * @since 1.82.0
     * @private
     */
    Pages.prototype._visitSections = function (fnVisitor) {
        return this._visitPages(function (oPage) {
            var oSections = oPage.payload && oPage.payload.sections || {};
            Object.keys(oSections).forEach(function (sKey) {
                fnVisitor(oSections[sKey], oPage);
            });
        });
    };

    /**
     * Calls the visitor function for every vizReference in the CDM site.
     * Currently the returned Promise does not wait for the visitorFunctions to finish asynchronous tasks!
     *
     * @param {function} fnVisitor The visitor function
     * @returns {Promise<void>} A Promise that resolves once all the pages were visited
     *
     * @since 1.82.0
     * @private
     */
    Pages.prototype._visitVizReferences = function (fnVisitor) {
        return this._visitSections(function (oSection, oPage) {
            var oVizReferences = oSection.viz || {};
            Object.keys(oVizReferences).forEach(function (sKey) {
                fnVisitor(oVizReferences[sKey], oSection, oPage);
            });
        });
    };

    /**
     * Returns the location of a bookmark in the CDM site, specified by page ID, section ID and vizRef ID.
     *
     * @param {object} oIdentifier
     *   An object which is used to find the bookmarks by matching the provided properties.
     * @param {string} oIdentifier.url
     *   The target URL of the bookmark
     * @param {string} [oIdentifier.vizType]
     *   The visualization type of the bookmark
     * @returns {Promise<object[]>} The promise resolves to an array of objects containing
     *     pageId, sectionId and vizRefId of the found bookmarks.
     *
     * @since 1.82.0
     * @private
     */
    Pages.prototype._findBookmarks = function (oIdentifier) {
        // for bookmarks it is sufficient to check the vizReferences as the properties of interest
        // don't come from other CDM entities like app or visualization
        var aVizReferences = [];
        return Promise.resolve()
            .then(function () {
                var oTarget = utilsCdm.toTargetFromHash(oIdentifier.url);
                oTarget = readUtils.harmonizeTarget(oTarget);
                return this._visitVizReferences(function (oVizReference, oSection, oPage) {
                    if (oVizReference.isBookmark &&
                        oIdentifier.vizType === oVizReference.vizType &&
                        (oVizReference.contentProviderId || "") === (oIdentifier.contentProviderId || "") &&
                        utilsCdm.isSameTarget(oTarget, oVizReference.target)) {
                        aVizReferences.push({
                            vizRefId: oVizReference.id,
                            sectionId: oSection.id,
                            pageId: oPage.identification.id
                        });
                    }
                })
                .then(function () {
                    return aVizReferences;
                });
            }.bind(this));
    };

    /**
     * Count the bookmarks that match the given URL.
     *
     * @param {object} oIdentifier
     *   An object which is used to find the bookmarks by matching the provided properties.
     * @param {string} oIdentifier.url
     *   The target URL of the bookmark
     * @param {string} [oIdentifier.vizType]
     *   The visualization type of the bookmark
     * @returns {Promise<number>} A Promise that resolves to the number of bookmarks
     *
     * @since 1.82.0
     * @private
     */
    Pages.prototype.countBookmarks = function (oIdentifier) {
        return this._findBookmarks(oIdentifier)
            .then(function (aFoundBookmarks) {
                return aFoundBookmarks.length;
            });
    };

    /**
     * Delete the bookmarks that match the given URL.
     *
     * @param {object} oIdentifier
     *   An object which is used to find the bookmarks by matching the provided properties.
     * @param {string} oIdentifier.url
     *   The target URL of the bookmark
     * @param {string} [oIdentifier.vizType]
     *   The visualization type of the bookmark
     * @param {string} [pageId] The id of the page from which the bookmark should be removed.
     * @param {string} [sectionId] The id of the sectionId in the specified page from which the bookmark should be removed.
     *
     * @returns {Promise<number>} A Promise that resolves to the number of deleted bookmarks
     *
     * @since 1.82.0
     * @private
     */
    Pages.prototype.deleteBookmarks = function (oIdentifier, pageId, sectionId) {
        var iDeletionCounter = 0;
        return this._findBookmarks(oIdentifier)
            .then(function (aVizReferencesToDelete) {
                // the deleteVisualization function is not mass capable so we make sure that the
                // calls are sequentialized so that there can be no race conditions
                return aVizReferencesToDelete.reduce(function (oDeleteChain, oIds) {
                    if (pageId && oIds.pageId !== pageId) {
                        return oDeleteChain;
                    }
                    if (sectionId && oIds.sectionId !== sectionId) {
                        return oDeleteChain;
                    }
                    return oDeleteChain
                        .then(function () {
                            return this.findVisualization(oIds.pageId, oIds.sectionId, null, oIds.vizRefId);
                        }.bind(this))
                        .then(function (aLocation) {
                            // the vizRef ID is unique on a page so there can be only one result
                            var oLocation = aLocation[0];
                            var iPageIndex = this.getPageIndex(oLocation.pageId);
                            return this.deleteVisualization(iPageIndex, oLocation.sectionIndex, oLocation.vizIndexes[0]);
                        }.bind(this))
                        .then(function () {
                            iDeletionCounter = iDeletionCounter + 1;
                        })
                        .catch(function () {
                            // as deleteVisualization is not mass capable it is not possible to implement an all or nothing
                            // error handling therefore only the number of successful deletions is returned
                        });
                }.bind(this), Promise.resolve());
            }.bind(this))
            .then(function () {
                return iDeletionCounter;
            });
    };

    /**
     * Update the bookmarks that match the given URL.
     *
     * @param {object} oIdentifier
     *   An object which is used to find the bookmarks by matching the provided properties.
     * @param {string} oIdentifier.url
     *   The target URL of the bookmark
     * @param {string} [oIdentifier.vizType]
     *   The visualization type of the bookmark
     * @param {object} oParameters The object of parameters to be changed
     *
     * @returns {Promise<number>} A Promise that resolves to the number of updated bookmarks
     *
     * @since 1.83.0
     * @private
     */
    Pages.prototype.updateBookmarks = function (oIdentifier, oParameters) {
        if (!oIdentifier || !oIdentifier.url || typeof oIdentifier.url !== "string") {
            Log.error("Fail to update bookmark. No valid URL");
            return Promise.reject("Invalid URL provided");
        }
        if (!oParameters || typeof oParameters !== "object") {
            Log.error("Fail to update bookmark. No valid parameters, URL is: " + oIdentifier.url);
            return Promise.reject("Missing parameters");
        }
        var iUpdateCounter = 0;
        return Promise.all([
            this._findBookmarks(oIdentifier)
        ])
            .then(function (aResult) {
                var aVizReferencesToUpdate = aResult[0];

                // the updateVisualization function is not mass capable so we make sure that the
                // calls are sequentialized so that there can be no race conditions
                return aVizReferencesToUpdate.reduce(function (oUpdateChain, oIds) {
                    return oUpdateChain
                        .then(function () {
                            return this.findVisualization(oIds.pageId, oIds.sectionId, null, oIds.vizRefId);
                        }.bind(this))
                        .then(function (aLocation) {
                            // the vizRef ID is unique on a page so there can be only one result
                            var oLocation = aLocation[0];
                            var iPageIndex = this.getPageIndex(oLocation.pageId);

                            // map the parameters of the bookmark service API to the properties of a visualization
                            var oVisualizationData = {
                                subtitle: oParameters.subtitle,
                                icon: oParameters.icon,
                                info: oParameters.info,
                                numberUnit: oParameters.numberUnit,
                                indicatorDataSource: {
                                    path: oParameters.serviceUrl,
                                    refresh: oParameters.serviceRefreshInterval
                                },
                                vizConfig: oParameters.vizConfig
                            };
                            // prevent that title and url can be cleared by setting them to "" as they are mandatory
                            if (oParameters.title) {
                                oVisualizationData.title = oParameters.title;
                            }
                            if (oParameters.url) {
                                oVisualizationData.target = readUtils.harmonizeTarget(utilsCdm.toTargetFromHash(oParameters.url));
                            }

                            return this.updateVisualization(iPageIndex, oLocation.sectionIndex, oLocation.vizIndexes[0], oVisualizationData);
                        }.bind(this))
                        .then(function () {
                            iUpdateCounter = iUpdateCounter + 1;
                        })
                        .catch(function () {
                            // as updateVisualization is not mass capable it is not possible to implement an all or nothing
                            // error handling therefore only the number of successful updates is returned
                        });
                }.bind(this), Promise.resolve());
            }.bind(this))
            .then(function () {
                return iUpdateCounter;
            });
    };

    /**
     * @typedef {object} VisualizationIdentifier The identifier of a visualization within a page section.
     * @property {string} pageId The ID of the page where the section is.
     * @property {string} sectionId The section index within that page.
     * @property {string} vizRefId The id of the visualization
     */

    /**
     * Updates the properties of a visualization
     * Properties that are not supplied are not updated.
     *
     * @param {int} iPageIndex The index of the page containing the updated visualization.
     * @param {int} iSourceSectionIndex The index of the section from where the visualization is updated.
     * @param {int} iSourceVisualizationIndex The index of the updated visualization.
     * @param {object} oVisualizationData The updated visualization properties
     * @param {string} [oVisualizationData.title] The title
     * @param {object} [oVisualizationData.target] The target in object format
     * @param {string} [oVisualizationData.subtitle] The subtitle
     * @param {string} [oVisualizationData.icon] The icon
     * @param {string} [oVisualizationData.info] The information text
     * @param {string} [oVisualizationData.numberUnit] The numberUnit
     * @param {string} [oVisualizationData.indicatorDataSource] The indicator data source
     * @param {string} [oVisualizationData.displayFormatHint] The format in which the visualization is displayed
     *
     * @returns {Promise<VisualizationIdentifier>} The promise resolves when the visualization has been updated successfully.
     *
     * @since 1.83
     * @private
     */
    Pages.prototype.updateVisualization = function (iPageIndex, iSourceSectionIndex, iSourceVisualizationIndex, oVisualizationData) {
        return this._oCdmServicePromise
            .then(function (oCdmService) {
                return Promise.all([
                    oCdmService.getCachedVisualizations(),
                    oCdmService.getApplications(),
                    oCdmService.getCachedVizTypes()
                ]);
            })
            .then(function (aResult) {
                var oVisualizations = aResult[0];
                var oApplications = aResult[1];
                var oVizTypes = aResult[2];

                var oPageModel = this._oPagesModel.getProperty("/pages/" + iPageIndex);
                var oSectionModel = oPageModel.sections[iSourceSectionIndex];
                var aSourceSectionVisualizations = oSectionModel.visualizations;
                var oUpdatedVisualization = aSourceSectionVisualizations[iSourceVisualizationIndex];

                // for visualizations that are not bookmarks, only the changed properties must be saved in the vizReference
                // so that the data for unchanged properties can still get through from other CDM levels,
                // like visualization or application
                var oChangedProperties = {};

                this.setPersonalizationActive(true);

                if (this._isPropertyChanged(oUpdatedVisualization.title, oVisualizationData.title)) {
                    oChangedProperties.title = oVisualizationData.title;
                }
                if (oVisualizationData.target && !utilsCdm.isSameTarget(oUpdatedVisualization.target, oVisualizationData.target)) {
                    oChangedProperties.target = oVisualizationData.target;
                }
                if (this._isPropertyChanged(oUpdatedVisualization.subtitle, oVisualizationData.subtitle)) {
                    oChangedProperties.subtitle = oVisualizationData.subtitle;
                }
                if (this._isPropertyChanged(oUpdatedVisualization.icon, oVisualizationData.icon)) {
                    oChangedProperties.icon = oVisualizationData.icon;
                }
                if (this._isPropertyChanged(oUpdatedVisualization.info, oVisualizationData.info)) {
                    oChangedProperties.info = oVisualizationData.info;
                }
                if (this._isPropertyChanged(oUpdatedVisualization.numberUnit, oVisualizationData.numberUnit)) {
                    oChangedProperties.numberUnit = oVisualizationData.numberUnit;
                }
                if (this._isPropertyChanged(oUpdatedVisualization.displayFormatHint, oVisualizationData.displayFormatHint)) {
                    oChangedProperties.displayFormatHint = oVisualizationData.displayFormatHint;
                }
                if (oVisualizationData.indicatorDataSource && oUpdatedVisualization.indicatorDataSource &&
                    (this._isPropertyChanged(oUpdatedVisualization.indicatorDataSource.path, oVisualizationData.indicatorDataSource.path) ||
                        this._isPropertyChanged(oUpdatedVisualization.indicatorDataSource.refresh, oVisualizationData.indicatorDataSource.refresh))) {
                    // the properties of the indicator data source can be updated independently as this is required
                    // by the bookmark service. however, they are saved together in the CDM vizRef
                    oChangedProperties.indicatorDataSource = deepClone(oUpdatedVisualization.indicatorDataSource);
                    extend(oChangedProperties.indicatorDataSource, oVisualizationData.indicatorDataSource);
                }
                if (oVisualizationData.vizConfig) {
                    // merge the vizConfig so that the caller only has to provide the properties that shall be changed
                    oUpdatedVisualization.vizConfig = deepExtend({}, oUpdatedVisualization.vizConfig, oVisualizationData.vizConfig);
                    oChangedProperties.vizConfig = oUpdatedVisualization.vizConfig;
                }

                // update the changed properties in the visualization and
                // recreate the visualization to update properties that depend on the changed properties,
                // like the vizType or the _instantiationData
                extend(oUpdatedVisualization, oChangedProperties);
                var oVizRef = readUtils.getVizRef(oUpdatedVisualization);
                oUpdatedVisualization = this._getVisualizationData(oPageModel.id, oVizRef.vizId, oVisualizations, oVizRef, oApplications, oVizTypes);
                aSourceSectionVisualizations[iSourceVisualizationIndex] = oUpdatedVisualization;

                this._oPagesModel.refresh();

                return this._updateVisualizationCDMData(oPageModel.id, oSectionModel.id, oUpdatedVisualization.id, oChangedProperties)
                    .then(function () {
                        return {
                            pageId: oPageModel.id,
                            sectionId: oSectionModel.id,
                            vizRefId: oUpdatedVisualization.id
                        };
                    });
            }.bind(this));

    };

    /**
     * Updates the data of a CDM vizReference and saves the personalization.
     * The function adds all passed properties that are valid to the vizReference. Whether the property should be added has
     * to be decided by the caller. See also updateVisualization.
     *
     * @param {string} sPageId The page ID
     * @param {string} sSectionId The section ID
     * @param {string} sVizRefId The the vizReference ID
     * @param {object} oUpdatedVisualization The updated visualization properties
     *
     * @returns {Promise<void>} The promise resolves when the personalization was saved successfully
     *
     * @since 1.83
     * @private
     */
    Pages.prototype._updateVisualizationCDMData = function (sPageId, sSectionId, sVizRefId, oUpdatedVisualization) {
        return this._oCdmServicePromise
            .then(function (oCDMService) {
                return oCDMService.getPage(sPageId);
            })
            .catch(function (oError) {
                Log.error("Pages - updateVisualization: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
                return Promise.reject(oError);
            }.bind(this))
            .then(function (oPage) {
                var oVizRef = oPage.payload.sections[sSectionId].viz[sVizRefId];
                // This makes sure that only valid properties end up in the vizReference
                var oUpdatedVizRefProperties = readUtils.getVizRef(oUpdatedVisualization);
                oUpdatedVizRefProperties.vizConfig = oUpdatedVisualization.vizConfig;
                // Add only changed properties to the vizReference. See also updateVisualization.
                extend(oVizRef, oUpdatedVizRefProperties);

                return this._conditionalSavePersonalization(oPage.identification.id);
            }.bind(this))
            .catch(function (oError) {
                this.setPersonalizationActive(false);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Checks if a property is supplied and if so if it has changed.
     *
     * @param {string} oldValue The the old value
     * @param {string} newValue The the new value
     *
     * @returns {boolean} Returns true if the value has changed
     *
     * @since 1.83
     * @private
     */
    Pages.prototype._isPropertyChanged = function (oldValue, newValue) {
        if ((newValue || newValue === "") &&
            oldValue !== newValue) {
            return true;
        }
        return false;
    };

    Pages.hasNoAdapter = true;
    return Pages;
}, /*export=*/ true);
