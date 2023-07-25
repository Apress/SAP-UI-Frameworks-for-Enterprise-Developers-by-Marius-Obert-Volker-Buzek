// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file Provides functionality for "sap/ushell/components/pages/view/ImportDialog.fragment.xml"
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/components/pages/MyHomeImport",
    "sap/ushell/Config",
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/utils/WindowUtils"
], function (
    Log,
    Controller,
    Fragment,
    JSONModel,
    MyHomeImport,
    Config,
    ushellLibrary,
    resources,
    WindowUtils
) {
    "use strict";

    // shortcut for sap.ushell.DisplayFormat
    var DisplayFormat = ushellLibrary.DisplayFormat;

    var mCustomTypeMapping = {
        "X-SAP-UI2-CHIP:SSB_NUMERIC": "ssuite/smartbusiness/tiles/numeric",
        "X-SAP-UI2-CHIP:SSB_CONTRIBUTION": "ssuite/smartbusiness/tiles/contribution",
        "X-SAP-UI2-CHIP:SSB_TREND": "ssuite/smartbusiness/tiles/trend",
        "X-SAP-UI2-CHIP:SSB_DEVIATION": "ssuite/smartbusiness/tiles/deviation",
        "X-SAP-UI2-CHIP:SSB_COMPARISON": "ssuite/smartbusiness/tiles/comparison",
        "X-SAP-UI2-CHIP:SSB_BLANK": "ssuite/smartbusiness/tiles/blank",
        "X-SAP-UI2-CHIP:SSB_DUAL": "ssuite/smartbusiness/tiles/dual"
    };

    return Controller.extend("sap.ushell.components.pages.controller.ImportDialog", {

        /**
         * Opens the dialog
         * @returns {Promise<sap.m.Dialog>} A promise resolving to the dialog control.
         * @private
         */
        open: function () {
            if (!this._pFragmentLoad) {
                this._pFragmentLoad = Fragment.load({
                    name: "sap.ushell.components.pages.view.ImportDialog",
                    controller: this
                }).then(function (fragment) {
                    this._oDialog = fragment;
                    this._oDialog.setModel(resources.i18nModel, "i18n");
                    this._oDialog.setModel(new JSONModel({
                        busy: true,
                        groups: [],
                        PersonalizedGroups: []
                    }));

                    // Get PageSet request and fill the model with its data
                    MyHomeImport.getData()
                        .then(function (groups) {
                            fragment.getModel().setData({
                                busy: false,
                                groups: groups,
                                PersonalizedGroups: groups.map(function (group) {
                                    return {
                                        title: group.isDefault ? resources.i18n.getText("my_group") : group.title,
                                        description: group.id,
                                        selected: true
                                    };
                                })
                            });
                        })
                        .catch(function (vError) {
                            return sap.ushell.Container.getServiceAsync("Message").then(function (oMessageService) {
                                oMessageService.error(vError);
                            });
                        });

                    return this._oDialog;
                }.bind(this));
            }

            return Promise.all([
                sap.ushell.Container.getServiceAsync("URLParsing").then(function (oURLParsingService) {
                    this._oURLParsingService = oURLParsingService;
                }.bind(this)),
                this._pFragmentLoad
            ]).then(function () {
                this._oDialog.open();
                return this._oDialog;
            }.bind(this));
        },

        /**
         * Closes the dialog.
         * @private
         */
        close: function () {
            if (this._oDialog) {
                this._oDialog.close();
            }
        },

        /**
         * Performs the import.
         *
         * @private
         */
        doImport: function () {
            var oModel = this._oDialog.getModel();
            var aSelectedGroupIds = [];
            oModel.getProperty("/PersonalizedGroups").forEach(function (group) {
                if (group.selected) {
                    aSelectedGroupIds.push(group.description);
                }
            });
            var aGroups = this._prepareImport(aSelectedGroupIds);
            this._saveImport(aGroups);
        },

        /**
         * Moves the visualization at the given vizIndex from the default section ('Recently added') to the preset section ('My Apps').
         *
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @param {object} group The group to which the visualization is added.
         * @param {number} index the index of the section, the new visualization should be added to.
         * @param {number} iTargetVizIndex The target visualization index.
         * @param {boolean} defaultGroupImported Indicates if the default group has already been imported.
         * @returns {Promise} A promise resolving when the visualization has been moved.
         * @private
         */
        _moveVisualization: function (pagesService, group, index, iTargetVizIndex, defaultGroupImported) {
            var iTargetSectionIndex = this._getSectionIndex(pagesService, group, index, defaultGroupImported);
            var iDefaultSectionIndex = this._getDefaultSectionIndex(pagesService);
            var oDefaultSection = this._getDefaultSection(pagesService);
            var iSrcVizIndex = 0;
            if (oDefaultSection && oDefaultSection.visualizations && oDefaultSection.visualizations.length) {
                iSrcVizIndex = oDefaultSection.visualizations.length - 1;
            }
            return pagesService.moveVisualization(this.iPageIndex, iDefaultSectionIndex, iSrcVizIndex, iTargetSectionIndex, iTargetVizIndex);
        },

        /**
         * Updates the visualization at the given index. with the given tileData.
         *
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @param {object} group The group to which the visualization is added.
         * @param {object} tileData The tile data to update.
         * @param {number} index the index of the section, the new visualization should be added to.
         * @param {number} vizIndex The visualization index.
         * @returns {Promise} A promise resolving when the update is done.
         * @param {boolean} defaultGroupImported Indicates if the default group has already been imported.
         * @private
         */
        _updateVisualization: function (pagesService, group, tileData, index, vizIndex, defaultGroupImported) {
            if (tileData.bUpdateNeeded) {
                var iSectionIndex = this._getSectionIndex(pagesService, group, index, defaultGroupImported);
                var oVisualizationData = this._filterNonSupportedProperties(tileData, [
                    "title",
                    "target",
                    "subtitle",
                    "icon",
                    "info",
                    "numberUnit",
                    "indicatorDataSource",
                    "displayFormatHint"
                ]);
                return pagesService.updateVisualization(this.iPageIndex, iSectionIndex, vizIndex, oVisualizationData);
            }
            return Promise.resolve();
        },

        /**
         * Generates a new visualization.
         *
         * @param {object} group The group to which the visualization is added.
         * @param {object} tile contains important information on how the visualization should be created.
         * @param {number} vizIndex the index of the new visualization.
         * @param {number} index the index of the section, the new visualization should be added to.
         * @param {object} services Ushell services that are need to add the bookmarks and the visualizations.
         * @param {object} contentNode of the current page.
         * @param {boolean} defaultGroupImported Indicates if the default group has already been imported.
         *
         * @private
         */
        _addVisualization: function (group, tile, vizIndex, index, services, contentNode, defaultGroupImported) {
            var oBookmarkConfig;
            if (tile.isABookmark) {
                if (tile.isCustomBookmark) {
                    this.aPromiseChain.push(function () {
                        oBookmarkConfig = this._filterNonSupportedProperties(tile, [
                            "title",
                            "url",
                            "subtitle",
                            "icon",
                            "info",
                            "vizConfig",
                            "loadManifest",
                            "chipConfig"
                        ]);
                        return services.bookmark.addCustomBookmark(tile.vizType, oBookmarkConfig, contentNode)
                            .then(this._moveVisualization.bind(this, services.pages, group, index, vizIndex, defaultGroupImported))
                            .then(this._updateVisualization.bind(this, services.pages, group, tile, index, vizIndex, defaultGroupImported));
                    }.bind(this));
                } else {
                    this.aPromiseChain.push(function () {
                        oBookmarkConfig = this._filterNonSupportedProperties(tile, [
                            "title",
                            "url",
                            "icon",
                            "info",
                            "subtitle",
                            "serviceUrl",
                            "serviceRefreshInterval",
                            "numberUnit"
                        ]);
                        return services.bookmark.addBookmark(oBookmarkConfig, contentNode)
                            .then(this._moveVisualization.bind(this, services.pages, group, index, vizIndex, defaultGroupImported))
                            .then(this._updateVisualization.bind(this, services.pages, group, tile, index, vizIndex, defaultGroupImported));
                    }.bind(this));
                }
            } else {
                this.aPromiseChain.push(function () {
                    var iSectionIndex = this._getSectionIndex(services.pages, group, index, defaultGroupImported);
                    var sSectionId = services.pages.getModel().getProperty("/pages/" + this.iPageIndex + "/sections/" + iSectionIndex + "/id");
                    return services.pages.addVisualization(this.sPageId, sSectionId, tile.vizId)
                        .then(this._updateVisualization.bind(this, services.pages, group, tile, index, vizIndex, defaultGroupImported));
                }.bind(this));
            }
        },

        /**
         * Adds visualizations to the existing preset section ('My Apps').
         *
         * @param {object} group contains important information on how the section should be created.
         * @param {number} index the index of the current iteration.
         * @param {object} services Ushell services that are needed to add the sections and the visualizations.
         * @param {object} contentNode of the current page.
         * @param {boolean} defaultGroupImported Indicates if the default group has already been imported.
         *
         * @private
         *
         */
        _addToPresetSection: function (group, index, services, contentNode, defaultGroupImported) {
            var oPresetSection = this._getPresetSection(services.pages);
            var iExistingTilesLength = oPresetSection.visualizations.filter(function (viz) { return viz.displayFormatHint !== DisplayFormat.Compact; }).length;
            var iExistingLinksLength = oPresetSection.visualizations.filter(function (viz) { return viz.displayFormatHint === DisplayFormat.Compact; }).length;

            // Add Tiles
            for (var i = 0; i < group.tiles.length; ++i) {
                this._addVisualization(group, group.tiles[i], i + iExistingTilesLength, index, services, contentNode, defaultGroupImported);
            }
            // Add Links
            for (var j = 0; j < group.links.length; ++j) {
                this._addVisualization(group, group.links[j], j + iExistingLinksLength + iExistingTilesLength + group.tiles.length, index, services, contentNode, defaultGroupImported);
            }
        },

        /**
         * Generates a new section with all its visualizations.
         *
         * @param {object} group contains important information on how the section should be created.
         * @param {number} index the index of the current iteration.
         * @param {object} services Ushell services that are needed to add the sections and the visualizations.
         * @param {object} contentNode of the current page.
         * @param {boolean} defaultGroupImported Indicates if the default group has already been imported.
         *
         * @private
         *
         */
        _addSection: function (group, index, services, contentNode, defaultGroupImported) {
            this.aPromiseChain.push(function () {
                var iUpdatedSectionIndex = this._getSectionIndex(services.pages, group, index, defaultGroupImported);
                return services.pages.addSection(this.iPageIndex, iUpdatedSectionIndex, { title: group.title });
            }.bind(this));

            // Add Tiles
            for (var i = 0, len = group.tiles.length; i < len; ++i) {
                this._addVisualization(group, group.tiles[i], i, index, services, contentNode, defaultGroupImported);
            }
            // Add Links
            for (var j = 0, len2 = group.links.length; j < len2; ++j) {
                this._addVisualization(group, group.links[j], j + group.tiles.length, index, services, contentNode, defaultGroupImported);
            }
        },

        /**
         * Finds and returns the 'My Home' page contentNode
         * @param {sap.ushell.services.Bookmark} bookmarkService The Bookmark service instance.
         * @returns {Promise<sap.ushell.services.Bookmark.ContentNode>|null} The contentNode if found, else null.
         * @private
         */
        _getMyHomeContentNode: function (bookmarkService) {
            var sSpaceId = Config.last("/core/spaces/myHome/myHomeSpaceId");

            return bookmarkService.getContentNodes().then(function (aContentNodes) {
                var oMyHomeSpace = aContentNodes.find(function (contentNode) {
                    return contentNode.id === sSpaceId;
                });

                if (!oMyHomeSpace) {
                    return null;
                }

                return oMyHomeSpace.children.find(function (contentNode) {
                    return contentNode.id === this.sPageId;
                }.bind(this));
            }.bind(this));
        },

        /**
         * Generates sections for each given groupId, from the classic homepage.
         *
         * @param {object[]} groups an array of groupIds from the classic homepage.
         * @returns {Promise<undefined>} when all calculations are completed.
         * @private
         */
        _saveImport: function (groups) {
            this._oDialog.setBusy(true);

            var oServices;
            this.sPageId = Config.last("/core/spaces/myHome/myHomePageId");

            // Initialize the promise chain
            this.aPromiseChain = [];

            return Promise.all([
                sap.ushell.Container.getServiceAsync("Bookmark"),
                sap.ushell.Container.getServiceAsync("Message"),
                sap.ushell.Container.getServiceAsync("Pages"),
                sap.ushell.Container.getServiceAsync("UserInfo")
            ])
                .then(function (aServices) {
                    oServices = {
                        bookmark: aServices[0],
                        message: aServices[1],
                        pages: aServices[2],
                        userInfo: aServices[3]
                    };

                    // Needed for bookmark tiles
                    return this._getMyHomeContentNode(oServices.bookmark);
                }.bind(this))
                .then(function (oMyHomeContentNode) {
                    this.iPageIndex = oServices.pages.getPageIndex(this.sPageId);
                    // Turn off implicit saving
                    oServices.pages.enableImplicitSave(false);
                    this._performImportOperations(groups, oServices, oMyHomeContentNode);

                    // Sequentially execute the promise chain
                    return this._executeSequentially(this.aPromiseChain);
                }.bind(this))
                .then(function () {
                    return this._savePersonalizations(oServices.pages);
                }.bind(this))
                .then(function () {
                    // Send message toast
                    oServices.message.info(resources.i18n.getText("MyHome.InitialPage.Message.ImportSuccessful"));

                    // Set user import setting to "done"
                    oServices.userInfo.getUser().setImportBookmarksFlag("done");
                    return oServices.userInfo.updateUserPreferences();
                })
                .then(function () {
                    // This reload is required to display the personalizations
                    WindowUtils.refreshBrowser();
                })
                .catch(function (vError) {
                    oServices.message.error(vError);
                })
                .finally(function () {
                    this._oDialog.setBusy(false);
                    this.close();
                }.bind(this));
        },

        /**
         * Save groups, tiles, links, and (custom) bookmarks.
         * The resulting promises are stored in the promise chain.
         *
         * @param {object[]} groups The array of groups to import.
         * @param {object} services A map of the service instances required.
         * @param {sap.ushell.services.Bookmark.ContentNode} myHomeContentNode The contentNode for the 'My Home' page.
         * @private
         */
        _performImportOperations: function (groups, services, myHomeContentNode) {
            var oGroup;
            var bDefaultGroupIsImported = false;

            for (var i = 0, len = groups.length; i < len; ++i) {
                oGroup = groups[i];
                if (oGroup.isDefault) {
                    this._addToPresetSection(oGroup, i, services, myHomeContentNode, bDefaultGroupIsImported);
                    bDefaultGroupIsImported = true;
                } else {
                    this._addSection(oGroup, i, services, myHomeContentNode, bDefaultGroupIsImported);
                }
            }
        },

        /**
         * Executes the given array of promises sequentially.
         * @param {Array<Promise<undefined>>} aPromises The Array of promises.
         * @returns {Promise<undefined>} A promise that resolves when the whole chain is resolved.
         * @private
         */
        _executeSequentially: function (aPromises) {
            return aPromises.reduce(function (chain, current) {
                return chain
                    .then(function () {
                        return current();
                    })
                    .catch(function (vError) {
                        Log.error(vError);
                    });
            }, Promise.resolve());
        },
        /**
         * Determine the section index.
         * Default section already exists, in case default group is not imported the section index needs to skip the default section.
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @param {object} group The group.
         * @param {number} current The current index.
         * @param {boolean} defaultGroupImported Indicates if the default group has been imported.
         * @returns {number} The section index.
         * @private
         */
        _getSectionIndex: function (pagesService, group, current, defaultGroupImported) {
            var iOffset = this._getPresetSectionIndex(pagesService);
            if (!group.isDefault && !group.isLocked && !defaultGroupImported) {
                return iOffset + current + 1;
            }
            return iOffset + current;
        },
        /**
         * Determine the index of the 'My Home' preset section ('My Apps').
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @returns {number} The section index.
         * @private
         */
        _getPresetSectionIndex: function (pagesService) {
            var aSections = pagesService.getModel().getProperty("/pages/" + this.iPageIndex + "/sections/");
            return aSections.findIndex(function (section) {
                return section.id === Config.last("/core/spaces/myHome/presetSectionId");
            });
        },

        /**
         * Determine the index of the 'My Home' default section ('Recently added apps').
         *
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @returns {number} The section index.
         * @private
         */
        _getDefaultSectionIndex: function (pagesService) {
            var aSections = pagesService.getModel().getProperty("/pages/" + this.iPageIndex + "/sections/");
            return aSections.findIndex(function (section) {
                return section.default;
            });
        },

        /**
         * Returns the preset section of the 'My Home' page ('My Apps').
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @returns {object} The section object.
         * @private
         */
        _getPresetSection: function (pagesService) {
            var aSections = pagesService.getModel().getProperty("/pages/" + this.iPageIndex + "/sections/");
            return aSections.find(function (section) {
                return section.id === Config.last("/core/spaces/myHome/presetSectionId");
            });
        },

        /**
         * Returns the default section of the 'My Home' page ('Recently Added Apps')
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @returns {object} The section object.
         * @private
         */
        _getDefaultSection: function (pagesService) {
            var aSections = pagesService.getModel().getProperty("/pages/" + this.iPageIndex + "/sections/");
            return aSections.find(function (section) {
                return section.default;
            });
        },
        /**
         * Converts the chip instance into a visualization data object.
         * @param {object} oChipInstance chip instance that gets imported.
         * @returns {object} visualization data.
         *
         */
        _gatherVizDataObjectFromChipInstance: function (oChipInstance) {
            var oTileConfiguration;
            var aChipInstanceBags;
            var oVizData = {
                vizId: oChipInstance.chipId,
                isABookmark: !!oChipInstance.configuration
            };

            var bStableIDsEnabled = Config.last("/core/stableIDs/enabled");
            if (bStableIDsEnabled) {
                // Use the referenceChipId/ stableId for the import
                var sReferenceChipId = oChipInstance.Chip && oChipInstance.Chip.referenceChipId;
                if (sReferenceChipId && sReferenceChipId !== "O") {
                    oVizData.vizId = oChipInstance.Chip.referenceChipId;
                }
            }

            if (oVizData.isABookmark) {
                oVizData.isCustomBookmark = [
                    "X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER",
                    "X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER"
                ].indexOf(oChipInstance.chipId) === -1;

                oTileConfiguration = JSON.parse(JSON.parse(oChipInstance.configuration).tileConfiguration);
                oVizData.title = oTileConfiguration.display_title_text;
                oVizData.url = oTileConfiguration.navigation_target_url;
                oVizData.icon = oTileConfiguration.display_icon_url;
                oVizData.info = oTileConfiguration.display_info_text;
                oVizData.subtitle = oTileConfiguration.display_subtitle_text;
                oVizData.serviceUrl = oTileConfiguration.service_url;
                oVizData.serviceRefreshInterval = oTileConfiguration.service_refresh_interval;
                oVizData.numberUnit = oTileConfiguration.display_number_unit;
            }

            if (oVizData.isCustomBookmark) {
                // It is possible that the URL is not provided for some older custom bookmarks (e.g. SSB Tiles).
                // When the URL is not available, it is created dynamically if the TILE_PROPERTIES are available and
                // contains the semanticObject, semanticAction and evaluationId.
                if (oTileConfiguration.TILE_PROPERTIES) {
                    try {
                        var oTileProperties = JSON.parse(oTileConfiguration.TILE_PROPERTIES);
                        if (!oVizData.url && oTileProperties.semanticObject && oTileProperties.semanticAction) {
                            var oURLParsingParams = {};
                            if (oTileProperties.evaluationId) {
                                oURLParsingParams.EvaluationId = oTileProperties.evaluationId;
                            }
                            oVizData.url = "#" + this._oURLParsingService.constructShellHash({
                                target: {
                                    semanticObject: oTileProperties.semanticObject,
                                    action: oTileProperties.semanticAction
                                },
                                params: oURLParsingParams
                            });
                        }
                        if (oTileProperties.title) {
                            oVizData.title = oTileProperties.title;
                        }
                        if (oTileProperties.subtitle) {
                            oVizData.subtitle = oTileProperties.subtitle;
                        }
                    } catch (oError) {
                        Log.error("Could not create URL for custom bookmark with title: " + oVizData.title
                            + ", Error Message: " + oError.message);
                    }
                }

                oVizData.vizConfig = {};
                oVizData.loadManifest = true;
                oVizData.vizType = mCustomTypeMapping[oChipInstance.chipId];
                oVizData.chipConfig = {
                    chipId: oChipInstance.chipId,
                    bags: {},
                    configuration: JSON.parse(oChipInstance.configuration)
                };
            }

            aChipInstanceBags = oChipInstance.ChipInstanceBags.results;
            // if texts are personalized there are chip instance bags
            // else the pages service gets only the id in the api
            if (aChipInstanceBags.length) {
                oVizData.bUpdateNeeded = !oVizData.isABookmark;

                if (oVizData.isCustomBookmark) {
                    // Fill bags
                    aChipInstanceBags.forEach(function (oBag) {
                        oVizData.chipConfig.bags[oBag.id] = {
                            properties: {},
                            texts: {}
                        };
                        oBag.ChipInstanceProperties.results.forEach(function (oProp) {
                            if (oProp.translatable === "X") {
                                oVizData.chipConfig.bags[oBag.id].texts[oProp.name] = oProp.value;
                            } else {
                                oVizData.chipConfig.bags[oBag.id].properties[oProp.name] = oProp.value;
                            }
                        });
                    });
                }

                // Map tileProperties bags to text properties
                aChipInstanceBags
                    .filter(function filterOutBagWithTextsForTile (bag) {
                        return bag.id === "tileProperties";
                    })
                    .forEach(function (oBagWithTextsForTile) {
                        oBagWithTextsForTile.ChipInstanceProperties.results.forEach(function (oTextProperty) {
                            switch (oTextProperty.name) {
                                case "display_title_text":
                                    oVizData.title = oTextProperty.value;
                                    break;
                                case "display_subtitle_text":
                                    oVizData.subtitle = oTextProperty.value;
                                    break;
                                case "display_info_text":
                                    oVizData.info = oTextProperty.value;
                                    break;
                                case "display_search_keywords":
                                    oVizData.searchKeyword = oTextProperty.value;
                                    break;
                                default:
                                    break;
                            }
                        });
                    });

                // Required for custom tiles
                aChipInstanceBags
                    .filter(function filterOutBagWithTextsForTile (bag) {
                        return bag.id === "sb_tileProperties";
                    })
                    .forEach(function (oBagWithTextsForTile) {
                        oBagWithTextsForTile.ChipInstanceProperties.results.forEach(function (oTextProperty) {
                            switch (oTextProperty.name) {
                                case "title":
                                    oVizData.title = oTextProperty.value;
                                    break;
                                case "description":
                                    oVizData.subtitle = oTextProperty.value;
                                    break;
                                default:
                                    break;
                            }
                        });
                    });
            }
            return oVizData;
        },

        /**
         * Saves the currently applied personalizations.
         *
         * @param {sap.ushell.services.Pages} pagesService The pages service instance.
         * @returns {Promise<undefined>} A promise resolving when the personalizations have been saved.
         * @private
         */
        _savePersonalizations: function (pagesService) {
            pagesService.enableImplicitSave(true);
            return pagesService.savePersonalization(this.sPageId).then(function () {
                pagesService.enableImplicitSave(false);
            });
        },

        /**
         * Matches groups to the given array of group ids, by only providing the necessary information for section creation.
         *
         * @param {string[]} groupIds is an array of groupIds from the classic homepage.
         * @returns {object[]} an array of groupInformation objects that contain all necessary data.
         * @private
         */
        _prepareImport: function (groupIds) {
            var mGroups = {};
            var oModel = this._oDialog.getModel();
            var aModelGroups = oModel.getProperty("/groups");
            var mVizData;
            var oVizData;

            aModelGroups.forEach(function (oGroup) {
                if (groupIds.indexOf(oGroup.id) === -1) {
                    return;
                }

                mVizData = {};
                oGroup.chips.forEach(function (oChipInstance) {
                    oVizData = this._gatherVizDataObjectFromChipInstance(oChipInstance);
                    mVizData[oChipInstance.instanceId] = oVizData;
                }.bind(this));

                oGroup.tiles = [];
                oGroup.tileOrder.forEach(function (sTileId) {
                    oVizData = mVizData[sTileId];
                    // Filters Tiles that have no reference chip
                    if (oVizData) {
                        delete mVizData[sTileId];
                        oGroup.tiles.push(oVizData);
                    }
                });
                oGroup.links = [];
                oGroup.linkOrder.forEach(function (sTileId) {
                    oVizData = mVizData[sTileId];
                    // Filters Links that have no reference chip
                    if (oVizData) {
                        delete mVizData[sTileId];
                        oVizData.displayFormatHint = DisplayFormat.Compact;
                        oVizData.bUpdateNeeded = true;
                        oGroup.links.push(oVizData);
                    }
                });

                // Layout does not always contain all tiles in a group
                Object.keys(mVizData).map(function (sKey) {
                    oGroup.tiles.push(mVizData[sKey]);
                });

                mGroups[oGroup.id] = oGroup;
            }.bind(this));

            var aGroups = [];
            var oGroup;

            groupIds.forEach(function (sGroupId) {
                oGroup = mGroups[sGroupId];
                if (oGroup) {
                    aGroups.push(oGroup);
                }
            });

            return aGroups;
        },

        /**
         * Creates a shallow copy of the object which only contains supported keys
         * @param {object} oInput The input object
         * @param {string[]} aSupportedProperties a list of supported keys
         * @returns {object} An object which only contains supported properties
         *
         * @since 1.110
         * @private
         */
        _filterNonSupportedProperties: function (oInput, aSupportedProperties) {
            var oResult = {};
            Object.keys(oInput).forEach(function (sKey) {
                if (aSupportedProperties.includes(sKey)) {
                    oResult[sKey] = oInput[sKey];
                }
            });
            return oResult;
        }
    });
});
