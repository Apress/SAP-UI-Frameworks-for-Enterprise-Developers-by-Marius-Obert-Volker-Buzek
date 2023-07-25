// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/library",
    "sap/m/GroupHeaderListItem",
    "sap/ushell/library",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/base/Log",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/m/MessageBox"
], function (
    mobileLibrary,
    GroupHeaderListItem,
    ushellLibrary,
    UIComponent,
    Filter,
    FilterOperator,
    JSONModel,
    Log,
    Config,
    resources,
    MessageBox
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.ushell.ContentNodeType
    var ContentNodeType = ushellLibrary.ContentNodeType;

    /* global Map, Set */

    // visualizationOrganizer Component
    return UIComponent.extend("sap.ushell.components.visualizationOrganizer.Component", {
        metadata: {
            version: "1.113.0",
            library: "sap.ushell",
            dependencies: { libs: ["sap.m"] },
            properties: {
                pressed: { type: "boolean", group: "Misc", defaultValue: false }
            }
        },

        /**
         * Initializes the VisualizationOrganizer and requests the required data.
         */
        init: function () {
            UIComponent.prototype.init.apply(this, arguments); // call the init function of the parent

            this.aPersonalizablePages = []; // the list of all pages which can be personalized
            this.mVizIdInPages = new Map(); // a vizId map of sets of Pages (to check if a vizId is in a Page)
            this.stVizIdInSection = new Set(); // a set of every viz IDs in Section (used if AppFinder starts within section context)
        },

        /**
         * Requests the Spaces, Pages, and Visualizations data.
         * Populates the Maps and Sets to contain this data in a structured way.
         *
         * @returns {Promise<undefined>} A promise that resolves when the data request and processing is done.
         * @see _fillVizIdMaps
         */
        requestData: function () {
            var bOnlyHomePage = !Config.last("/core/shell/enablePersonalization") && Config.last("/core/spaces/myHome/enabled");
            var sMyHomePageId = Config.last("/core/spaces/myHome/myHomePageId");
            return sap.ushell.Container.getServiceAsync("CommonDataModel")
                .then(function (oCommonDataModelService) {
                    return oCommonDataModelService.getAllPages();
                })
                .then(function (aPages) {
                    if (bOnlyHomePage) {
                        aPages = aPages.filter(function (oPage) {
                            return oPage.identification.id === sMyHomePageId;
                        });
                    }
                    this.aPersonalizablePages = aPages.map(function (oPage) {
                        return {
                            id: oPage.identification.id,
                            title: oPage.identification.title
                        };
                    });
                    this._fillVizIdMaps(aPages);
                    return this.aPersonalizablePages;
                }.bind(this));
        },

        /**
         * Collects the data from the given Pages and populates "mVizIdInPages".
         * This is used by {@link requestData}.
         *
         * @param {object[]} aPages The Pages to gather data from.
         * @see requestData
         */
        _fillVizIdMaps: function (aPages) {
            this.mVizIdInPages = new Map();
            aPages.forEach(function (oPage) {
                Object.keys(oPage.payload.sections).forEach(function (sId) {
                    Object.keys(oPage.payload.sections[sId].viz).forEach(function (vId) {
                        var vizId = oPage.payload.sections[sId].viz[vId].vizId;
                        if (this.mVizIdInPages.has(vizId)) {
                            this.mVizIdInPages.get(vizId).add(oPage.identification.id);
                        } else {
                            this.mVizIdInPages.set(vizId, new Set([oPage.identification.id]));
                        }
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        },

        /**
         * Check if a visualization is within any Page.
         *
         * @param {string} vizId The vizId of the visualization to check.
         * @param {boolean} [bSectionContext] The flag if AppFinder is started in section context
         * @returns {boolean} Whether the visualization is within some Page (true) or not (false).
         */
        isVizIdPresent: function (vizId, bSectionContext) {
            if (bSectionContext) {
                return this.stVizIdInSection.has(vizId);
            }
            var stPages = this.mVizIdInPages.get(vizId);
            return !!(stPages && stPages.size);
        },

        /**
         * @param {string} vizId The vizId of a visualization.
         * @param {boolean} [bSectionContext] The flag if AppFinder is started in section context
         * @returns {sap.ui.core.URI} The icon that should be used for that visualization "pin" button.
         * @see isVizIdPresent
         */
        formatPinButtonIcon: function (vizId, bSectionContext) {
            return (this.isVizIdPresent(decodeURIComponent(vizId), bSectionContext) ? "sap-icon://accept" : "sap-icon://add");
        },

        /**
         * @param {string} vizId The vizId of a visualization.
         * @param {boolean} [bSectionContext] The flag if AppFinder is started in section context
         * @returns {sap.m.ButtonType} The type that should be used for that visualization "pin" button.
         * @see isVizIdPresent
         */
        formatPinButtonType: function (vizId, bSectionContext) {
            return (this.isVizIdPresent(decodeURIComponent(vizId), bSectionContext) ? ButtonType.Emphasized : ButtonType.Default);
        },

        /**
         * @param {string} vizId The vizId of a visualization.
         * @param {object} [sectionContext] The section context the AppFinder is started in.
         * @returns {sap.m.ButtonType} The tooltip that should be used for that visualization "pin" button.
         * @see isVizIdPresent
         */
        formatPinButtonTooltip: function (vizId, sectionContext) {
            var bIsVizIdPresent = this.isVizIdPresent(decodeURIComponent(vizId), !!sectionContext);

            //No SectionContext
            if (!sectionContext && bIsVizIdPresent) {
                return resources.i18n.getText("EasyAccessMenu_PinButton_Toggled_Tooltip");
            }

            if (!sectionContext && !bIsVizIdPresent) {
                return resources.i18n.getText("EasyAccessMenu_PinButton_UnToggled_Tooltip");
            }

            //SectionContext with sectionID
            if (sectionContext.sectionID && bIsVizIdPresent) {
                return resources.i18n.getText("VisualizationOrganizer.Button.Tooltip.RemoveFromSection");
            }

            if (sectionContext.sectionID && !bIsVizIdPresent) {
                return resources.i18n.getText("VisualizationOrganizer.Button.Tooltip.AddToSection");
            }

            //SectionContext without sectionID
            if (!sectionContext.sectionID && bIsVizIdPresent) {
                return resources.i18n.getText("VisualizationOrganizer.Button.Tooltip.RemoveFromPage", sectionContext.pageTitle);
            }

            return resources.i18n.getText("VisualizationOrganizer.Button.Tooltip.AddToPage", sectionContext.pageTitle);
        },

        /**
         * @typedef {object} SectionContext Information about page and section if app finder if open in a section scope
         * @property {string} pageID The page ID where a visualization should be changed.
         * @property {string} pageTitle The page title where a visualization should be changed.
         * @property {string} sectionID The section ID where a visualization should be changed.
         * @property {string} sectionTitle The section title where a visualization should be changed.
         */

        /**
         * Collects event data from the given event and calls {@link toggle} with it.
         *
         * @param {sap.ui.base.Event} oEvent The event that raised the "onTilePinButtonClick" handler.
         * @param {SectionContext} [oSectionContext] The section context if the visualization is added to special section.
         * @returns {Promise<undefined>} A promise that resolves when the popover is toggled. Resolves instantly without toggling if the PinButton is busy.
         * @see toggle
         */
        onTilePinButtonClick: function (oEvent, oSectionContext) {
            var oSource = oEvent.getSource();
            var oTileData = oSource.getBindingContext().getProperty();

            if (oSource.getBusy()) {
                return Promise.resolve();
            }

            if (oSectionContext) {
                oSource.setBusy(true);
                return this._applyOrganizationChangeToSection(oSource, oTileData, oSectionContext)
                    .then(function () {
                        oSource.setBusy(false);
                    });
            }

            if (this.aPersonalizablePages.length === 1) {
                oSource.setBusy(true);
                return this._applyChangeToPage(oSource, oTileData, this.aPersonalizablePages[0])
                    .then(function () {
                        oSource.setBusy(false);
                    });
            }

            return this.toggle(oSource, oTileData);
        },

        /**
         * Method to open the visualizationOrganizer popover.
         *
         * @param {sap.ui.core.Control} oOpenBy The ui5 control, the popover should be opened by.
         * @param {object} oVizInfo The information of the visualization, that should be added.
         * @returns {Promise<undefined>} A promise that resolves when the popover opens.
         * @since 1.75.0
         * @protected
         */
        open: function (oOpenBy, oVizInfo) {
            var oPopover = sap.ui.getCore().byId("sapUshellVisualizationOrganizerPopover");
            var oLoadPopover = Promise.resolve();

            if (!oPopover) {
                oLoadPopover = new Promise(function (resolve, reject) {
                    sap.ui.require(["sap/ui/core/Fragment"], function (Fragment) {
                        Fragment.load({
                            name: "sap.ushell.components.visualizationOrganizer.VisualizationOrganizerPopover",
                            type: "XML",
                            controller: this
                        }).then(resolve).catch(reject);
                    }.bind(this));
                }.bind(this)).then(function (popover) {
                    oPopover = popover;
                    oPopover.setModel(new JSONModel({ pages: [], searchTerm: "" }));
                    oPopover.setModel(resources.i18nModel, "i18n");
                });
            }

            return oLoadPopover.then(function () {
                this.oOpenBy = oOpenBy;
                this.sVisualizationId = decodeURIComponent(oVizInfo.id);
                this.sVisualizationTitle = oVizInfo.title;
                this.oVizInfo = oVizInfo;
                this.fnResetPopup = this._resetPopup.bind(this);
                oPopover.attachAfterClose(this.fnResetPopup);

                return Promise.all([
                    sap.ushell.Container.getServiceAsync("Menu"),
                    sap.ushell.Container.getServiceAsync("Pages")
                ]).then(function (aResults) {
                    var oPageAssociation;
                    var oMenuService = aResults[0];
                    var oPagesService = aResults[1];
                    if (oVizInfo.isBookmark) {
                        oPageAssociation = oPagesService._findBookmarks({ url: oVizInfo.url })
                            .then(function (aAssociation) {
                                var aPageIds = aAssociation.map(function (oFoundViz) {
                                    return oFoundViz.pageId;
                                });
                                return Promise.resolve(new Set(aPageIds));
                            });
                    } else {
                        oPageAssociation = this.mVizIdInPages.get(this.sVisualizationId);
                    }

                    return Promise.all([
                        oMenuService.getContentNodes([ContentNodeType.Space, ContentNodeType.Page]),
                        oPageAssociation
                    ]);
                }.bind(this)).then(function (aResults) {
                    var aContentNodes = aResults[0];
                    var oPageIds = aResults[1];

                    var bOnlyHomePage = !Config.last("/core/shell/enablePersonalization") && Config.last("/core/spaces/myHome/enabled");
                    var sMyHomeSpaceId = Config.last("/core/spaces/myHome/myHomeSpaceId");
                    var aPages = [];

                    aContentNodes = this._filterPersonalizableContentNodes(aContentNodes);

                    aContentNodes.forEach(function (oContentNode) {
                        if (bOnlyHomePage && oContentNode.id !== sMyHomeSpaceId) {
                            //In case of disabled personalization and enabled home page we need to show only home page
                            return;
                        }
                        oContentNode.children.forEach(function (oChildNode) {
                            if (!this._isPersonalizablePage(oChildNode.id)) {
                                // We cannot organize visualizations of unknown pages.
                                // So the page is disregarded.
                                return;
                            }
                            aPages.push({
                                id: oChildNode.id,
                                title: oChildNode.label,
                                space: oContentNode.label,
                                spaceId: oContentNode.id,
                                selected: oPageIds && oPageIds.has(oChildNode.id)
                            });
                        }.bind(this));
                    }.bind(this));

                    var oPopoverModel = oPopover.getModel();
                    oPopoverModel.setProperty("/pages", aPages);
                    oPopoverModel.setProperty("/pinnedPages", oPageIds);

                    this._updatePagesList();

                    oPopover.openBy(oOpenBy);
                }.bind(this));
            }.bind(this));
        },

        /**
         * This function assures that only traditional pages which can be personalized are returned.
         * In case a content node shall not be returned because of its type, this node and all of its children get removed from the result.
         * Parent nodes are returned even if they are not of the requested type.
         *
         * @param {ContentNode[]} [aContentNodes] Types of content nodes to be returned.
         *   Defaults to all content node types defined in `sap.ushell.ContentNodeType`.
         * @returns {Promise<ContentNode[]>} Resolves content nodes
         * @private
         * @since 1.107.0
         */
        _filterPersonalizableContentNodes: function (aContentNodes) {
            if (!Array.isArray(aContentNodes)) {
                return [];
            }
            return aContentNodes.reduce(function (aNodes, oContentNode) {
                oContentNode.children = this._filterPersonalizableContentNodes(oContentNode.children);
                if (oContentNode.type === ContentNodeType.HomepageGroup || oContentNode.type === ContentNodeType.Space || (oContentNode.type === ContentNodeType.Page && oContentNode.isContainer)) {
                    aNodes.push(oContentNode);
                }
                return aNodes;
            }.bind(this), []);
        },

        /**
         * Method to close the visualizationOrganizer popover.
         *
         * @since 1.75.0
         * @protected
         */
        cancel: function () {
            var oPopover = sap.ui.getCore().byId("sapUshellVisualizationOrganizerPopover");
            var oChangedItems = this._retrieveChangedPageIds();

            if (oPopover && oChangedItems.deleteFromPageIds.length === 0 && oChangedItems.addToPageIds.length === 0) {
                oPopover.close();
            } else {
                MessageBox.show(
                    resources.i18n.getText("VisualizationOrganizer.MessageBox.Description"),
                    {
                        id: "sapUshellVisualizationOrganizerDiscardDialog",
                        title: resources.i18n.getText("VisualizationOrganizer.MessageBox.Title"),
                        actions: [resources.i18n.getText("VisualizationOrganizer.MessageBox.ActionDiscard"), MessageBox.Action.CANCEL],
                        emphasizedAction: resources.i18n.getText("VisualizationOrganizer.MessageBox.ActionDiscard"),
                        onClose: function (oAction) {
                            if (oAction === resources.i18n.getText("VisualizationOrganizer.MessageBox.ActionDiscard")) {
                                oPopover.close();
                            }
                        }
                    }
                );
            }
        },

        /**
         * Method to handle the toggling of pin button
         *
         * @param {sap.ui.core.Control} oOpenBy The ui5 control, the popover should be toggled by.
         * @param {object} oVizInfo The information of the visualization, that should be added.
         * @returns {Promise<undefined>} A promise that resolves when the popover is toggled.
         * @since 1.75.0
         * @protected
         */
        toggle: function (oOpenBy, oVizInfo) {
            var oPopover = sap.ui.getCore().byId("sapUshellVisualizationOrganizerPopover");
            // To really make the visualizationOrganizer toggleable, we need to know the last openBy control.
            if (oPopover && oPopover.isOpen() && oPopover._oOpenBy && oPopover._oOpenBy.getId() === oOpenBy.getId()) {
                this.cancel();
                return Promise.resolve();
            }
            return this.open(oOpenBy, oVizInfo);
        },

        /**
         * Adds and removes visualizations to the specific section of the page and generates a MessageToast.
         *
         * @param {sap.ui.Control} oOpenBy The ui5 control, the popover should be toggled by.
         * @param {object} oVizInfo The information of the visualization, that should be added.
         * @param {SectionContext} oSectionContext The information used to check where a visualization is.
         * @returns {Promise<undefined>} A promise that resolves when the popover is toggled.
         * @since 1.76.0
         * @private
         */
        _applyOrganizationChangeToSection: function (oOpenBy, oVizInfo, oSectionContext) {
            return sap.ushell.Container.getServiceAsync("Pages").then(function (oPageService) {
                var oVizChangeChain;
                var sVizId = decodeURIComponent(oVizInfo.id);
                var sVisualizationTitle = oVizInfo.title;
                var sPageId = oSectionContext.pageID;
                var sSectionId = oSectionContext.sectionID;
                var sMessageToUser = this._getTextMsgSectionContext(oSectionContext, sVizId, sVisualizationTitle);

                if (this.stVizIdInSection.has(sVizId)) {
                    oVizChangeChain = oPageService.findVisualization(sPageId, sSectionId, sVizId).then(function (aVisualizationLocations) {
                        if (aVisualizationLocations.length === 0) {
                            return Promise.resolve();
                        }
                        var oVizDeleteChain;
                        var iPageIndex = oPageService.getPageIndex(sPageId);

                        var aSortedVisualizationsPerSectionIndexes = aVisualizationLocations.sort(function (a, b) {
                            return b.sectionIndex - a.sectionIndex;
                        });

                        aSortedVisualizationsPerSectionIndexes.forEach(function (oVisualizationLocation) {
                            oVisualizationLocation.vizIndexes.sort(function (a, b) {
                                return b - a;
                            });
                        });

                        aSortedVisualizationsPerSectionIndexes.forEach(function (oVisualizationLocation) {
                            var iSectionIndex = oVisualizationLocation.sectionIndex;
                            oVisualizationLocation.vizIndexes.forEach(function (iVizIndex) {
                                if (!oVizDeleteChain) {
                                    oVizDeleteChain = oPageService.deleteVisualization(iPageIndex, iSectionIndex, iVizIndex);
                                } else {
                                    oVizDeleteChain = oVizDeleteChain.then(function () {
                                        return oPageService.deleteVisualization(iPageIndex, iSectionIndex, iVizIndex);
                                    });
                                }
                            });
                        });
                        return oVizDeleteChain;
                    })
                        .then(function () {
                            this.stVizIdInSection.delete(sVizId);
                        }.bind(this));
                } else {
                    oVizChangeChain = oPageService.addVisualization(sPageId, sSectionId, sVizId).then(function () {
                        this.stVizIdInSection.add(sVizId);
                    }.bind(this));
                }
                return oVizChangeChain.then(function () {
                    oOpenBy.getBinding("icon").refresh(true);
                    oOpenBy.getBinding("type").refresh(true);
                    oOpenBy.getBinding("tooltip").refresh(true);

                    sap.ui.require(["sap/m/MessageToast"], function (MessageToast) {
                        MessageToast.show(sMessageToUser, { offset: "0 -50" });
                    });
                });
            }.bind(this));
        },

        /**
         * Determines what message should be displayed in the MessageToast when a tile is pinned or unpinned.
         *
         * @param {object} oSectionContext The information used to check where a visualization is.
         * @param {string} sVizId The "vizId" of the visualization
         * @param {string} sVisualizationTitle The visualization title
         * @returns {string} A string that contains the message when a tile is pinned or unpinned.
         * @since 1.108
         * @private
         */
        _getTextMsgSectionContext: function (oSectionContext, sVizId, sVisualizationTitle) {
            var sSectionId = oSectionContext.sectionID;
            var sSectionTitle = oSectionContext.sectionTitle;
            var sPageTitle = oSectionContext.pageTitle;

            //sectionID
            if (sSectionId && this.stVizIdInSection.has(sVizId)) {
                return resources.i18n.getText("VisualizationOrganizer.MessageToastSectionContextRemove", [sVisualizationTitle || sVizId, sSectionTitle, sPageTitle]);
            }

            if (sSectionId && !this.stVizIdInSection.has(sVizId)) {
                return resources.i18n.getText("VisualizationOrganizer.MessageToastSectionContextAdd", [sVisualizationTitle || sVizId, sSectionTitle, sPageTitle]);
            }

            //No sectionID
            if (!sSectionId && this.stVizIdInSection.has(sVizId)) {
                return resources.i18n.getText("VisualizationOrganizer.MessageToastPageRemove", [sVisualizationTitle || sVizId, sPageTitle]);
            }

            if (!sSectionId && !this.stVizIdInSection.has(sVizId)) {
                return resources.i18n.getText("VisualizationOrganizer.MessageToastPageAdd", [sVisualizationTitle || sVizId, sPageTitle]);
            }
        },

        /**
         * Adds and removes visualizations to the selected Spaces/Pages and generates a MessageToast.
         *
         * @param {sap.ui.base.Event} oEvent The before close event of the popup.
         * @returns {Promise<undefined>} A promise that resolves when the visualization organization is done.
         * @see _applyOrganizationChange
         * @since 1.75.0
         * @private
         */
        _organizeVisualizations: function () {
            var oChangedItems = this._retrieveChangedPageIds();
            if (this.oVizInfo.isBookmark) {
                return this._applyBookmarkOrganizationChange(oChangedItems, true);
            }
            return this._applyOrganizationChange(oChangedItems, true);
        },

        /**
         * @typedef {object} VisualizationChanges Collected changes done for a visualization in a "sapUshellVisualizationOrganizerPopover".
         * @property {string[]} addToPageIds The page ids of the pages the visualization should be added to.
         * @property {string[]} deleteFromPageIds The page ids of the pages the visualization should be deleted from.
         */

        /**
         * Applies the given visualization organization changes.
         * This is used by {@link _organizeVisualizations}.
         * When done, shows a {@link sap.m.MessageToast} informing the total number of organized visualizations.
         *
         * @param {VisualizationChanges} oVisualizationChanges The items representing where a visualization should be added and deleted.
         * @param {Boolean} bShowMessage If true the MessageToast is shown
         * @return {Promise<undefined>} A promise that resolves after every organization change.
         * @see _organizeVisualizations
         */
        _applyOrganizationChange: function (oVisualizationChanges, bShowMessage) {
            var iChangedVisualizations = (oVisualizationChanges.addToPageIds.length + oVisualizationChanges.deleteFromPageIds.length);
            if (!iChangedVisualizations) {
                return Promise.resolve();
            }
            var sVizId = this.sVisualizationId;
            var oOpenBy = this.oOpenBy;
            var stAlreadyRemovedFromPageId = new Set();
            var oPagesService;
            var oVizChangeChain = sap.ushell.Container.getServiceAsync("Pages").then(function (PagesService) {
                oPagesService = PagesService;
            });

            oVisualizationChanges.deleteFromPageIds.forEach(function (sPageId) {
                if (!stAlreadyRemovedFromPageId.has(sPageId)) {
                    stAlreadyRemovedFromPageId.add(sPageId);
                    oVizChangeChain = oVizChangeChain.then(function () {
                        return oPagesService.findVisualization(sPageId, null, sVizId).then(function (aVizLocations) {
                            var aPromises = [];

                            for (var iNrOfSections = aVizLocations.length - 1; iNrOfSections >= 0; iNrOfSections--) {
                                var oVizLocation = aVizLocations[iNrOfSections];
                                var iPageIndex = oPagesService.getPageIndex(oVizLocation.pageId);
                                for (var iNrOfViz = oVizLocation.vizIndexes.length - 1; iNrOfViz >= 0; iNrOfViz--) {
                                    var iVizIndex = oVizLocation.vizIndexes[iNrOfViz];
                                    aPromises.push(oPagesService.deleteVisualization(iPageIndex, oVizLocation.sectionIndex, iVizIndex));
                                }
                            }

                            return Promise.all(aPromises);
                        });
                    });
                }
                this.mVizIdInPages.get(sVizId).delete(sPageId);
            }.bind(this));

            oVisualizationChanges.addToPageIds.forEach(function (sPageId) {
                oVizChangeChain = oVizChangeChain.then(function () {
                    return oPagesService.addVisualization(sPageId, null, sVizId);
                });
                if (this.mVizIdInPages.has(sVizId)) {
                    this.mVizIdInPages.get(sVizId).add(sPageId);
                } else {
                    this.mVizIdInPages.set(sVizId, new Set([sPageId]));
                }
            }.bind(this));

            return oVizChangeChain.then(function () {
                if (oOpenBy) {
                    oOpenBy.getBinding("icon").refresh(true);
                    oOpenBy.getBinding("type").refresh(true);
                    oOpenBy.getBinding("tooltip").refresh(true);
                }
                if (bShowMessage) {
                    sap.ui.require(["sap/m/MessageToast"], function (MessageToast) {
                        MessageToast.show(resources.i18n.getText("VisualizationOrganizer.MessageToast"));
                    });
                }
            });
        },

        /**
         * Resets the changes to the content of the popover.
         *
         * @param {sap.ui.base.Event} oEvent The after close event of the popup.
         * @since 1.75.0
         * @private
         */
        _resetPopup: function (oEvent) {
            var oPopover = sap.ui.getCore().byId("sapUshellVisualizationOrganizerPopover");
            var oPagesList = sap.ui.getCore().byId("sapUshellVisualizationOrganizerSpacesList");
            var oSearchField = sap.ui.getCore().byId("sapUshellVisualizationOrganizerSearch");
            var oToggleButton = sap.ui.getCore().byId("sapUshellVisualizationOrganizerSelectedPages");

            oPopover.detachAfterClose(this.fnResetPopup);

            oSearchField.setValue("");
            oToggleButton.setType(ButtonType.Default);

            oPagesList.getBinding("items").filter(null);
            oPagesList.removeSelections();

            delete this.fnResetPopup;
            delete this.sVisualizationId;
            delete this.sVisualizationTitle;
        },

        /**
         * Handles the page item press event.
         * On press the page item should toggle its selection.
         * The selection should also change for all items with the same pageId.
         *
         * @param {sap.ui.base.Event} event The press event.
         * @since 1.75.0
         * @private
         */
        pagePressed: function (event) {
            this._changeSelectionForAllPagesWithTheSamePageId(event.getSource());
        },

        /**
         * Handles the List selectionChange event.
         * The selection should also change for all items with the same pageId.
         *
         * @param {sap.ui.base.Event} event The press event.
         * @since 1.82.0
         * @private
         */
        onSelectionChange: function (event) {
            var oSLI = event.getParameter("listItem");
            var bSelected = event.getParameter("selected");
            this._changeSelectionForAllPagesWithTheSamePageId(oSLI, bSelected);
        },

        /**
         * Change the selection of the given page item and all items that have the same pageId.
         *
         * @param {sap.m.StandardListItem} item The selected page item.
         * @param {boolean} [selected] Whether the items should be selected (or deselected);
         *   When this parameter is not given, selection will be toggled (deselected, if selected, and selected if deselected)
         * @since 1.82.0
         * @private
         */
        _changeSelectionForAllPagesWithTheSamePageId: function (item, selected) {
            var oModel = item.getModel();
            var oContext = item.getBindingContext();
            var sId = oContext.getProperty("id");
            var bSelect = (selected !== undefined) ? selected : !oContext.getProperty("selected");

            var aPages = oModel.getProperty("/pages");
            for (var index = 0; index < aPages.length; index++) {
                var oPage = aPages[index];
                if (oPage.id === sId) {
                    oPage.selected = bSelect;
                }
            }
            oModel.setProperty("/pages", aPages);
        },

        /**
         * Filters the list of Spaces.
         *
         * @param {sap.ui.base.Event} oEvent The search event.
         * @since 1.75.0
         * @private
         */
        _onSearch: function (oEvent) {
            var oSelectedPagesButton = sap.ui.getCore().byId("sapUshellVisualizationOrganizerSelectedPages");
            var bPressed = this.getPressed();

            if (oEvent.sId === "press") {
                bPressed = !bPressed;
                this.setPressed(bPressed);
                oSelectedPagesButton.setPressed(bPressed);
            }
            this._updatePagesList();
        },

        _updatePagesList: function () {
            var oPagesList = sap.ui.getCore().byId("sapUshellVisualizationOrganizerSpacesList");
            var oSearchField = sap.ui.getCore().byId("sapUshellVisualizationOrganizerSearch");
            var oBinding = oPagesList.getBinding("items");
            var sSearchValue = oSearchField.getValue();
            var bToggleActive = this.getPressed();

            if (bToggleActive) {
                oBinding.filter(new Filter({
                    filters: [
                        new Filter({
                            filters: [
                                new Filter({
                                    path: "title",
                                    operator: FilterOperator.Contains,
                                    value1: sSearchValue
                                }),
                                new Filter({
                                    path: "selected",
                                    operator: FilterOperator.EQ,
                                    value1: bToggleActive
                                })
                            ],
                            and: true
                        }),
                        new Filter({
                            filters: [
                                new Filter({
                                    path: "space",
                                    operator: FilterOperator.Contains,
                                    value1: sSearchValue
                                }),
                                new Filter({
                                    path: "selected",
                                    operator: FilterOperator.EQ,
                                    value1: bToggleActive
                                })
                            ],
                            and: true
                        })
                    ],
                    and: false
                }));
            } else {
                oBinding.filter(new Filter({
                    filters: [
                        new Filter({
                            path: "title",
                            operator: FilterOperator.Contains,
                            value1: sSearchValue
                        }),
                        new Filter({
                            path: "space",
                            operator: FilterOperator.Contains,
                            value1: sSearchValue
                        })
                    ],
                    and: false
                }));
            }

            if (oBinding.getLength() === 0) { // Adjust empty list of pages message in case all pages are filtered out.
                oPagesList.setNoDataText(resources.i18n.getText(sSearchValue
                    ? "VisualizationOrganizer.PagesList.NoResultsText"
                    : "VisualizationOrganizer.PagesList.NoDataText"
                ));
            }
        },

        /**
         * @typedef {object} NavigationScopeFilter Information used to check where a visualization exists.
         * @property {set} pageID The page IDs where a visualization exists.
         * @property {set} sectionID The section IDs where a visualization exists.
         */

        /**
         * Requests the visualizations data for the given section of the given page and
         * updates the sets with new data or cleans the set if page or section are not found.
         *
         * @param {NavigationScopeFilter} oContext Navigation context. If there is no pageID or sectionID, promise resolves null.
         * @returns {Promise<SectionContext|null>} A promise that resolves when the data request and processing is done.
         * @see _fillVizIdMaps
         */
        loadSectionContext: function (oContext) {
            this.stVizIdInSection.clear();
            if (!oContext || !oContext.pageID) {
                return Promise.resolve(null);
            }

            return sap.ushell.Container.getServiceAsync("Pages").then(function (oPageService) {
                var sPageId = decodeURIComponent(oContext.pageID);
                var sSelectedSectionId = oContext.sectionID ? decodeURIComponent(oContext.sectionID) : "";

                return oPageService.loadPage(sPageId)
                    .then(function (sPagePath) {
                        var oPage = oPageService.getModel().getProperty(sPagePath);
                        var oSectionContext = this._createSectionContext(oPage, sSelectedSectionId);

                        return oSectionContext;
                    }.bind(this))
                    .catch(function () {
                        Log.warning(sPageId + " cannot be loaded. Please, check the id of the page.");
                        return Promise.resolve(null);
                    });
            }.bind(this));
        },

        /**
         * Constructs and returns the section context object based on if the sectionID parameter is set or not in the URL
         *
         * @param {object} oPage The page object.
         * @param {string} sSelectedSectionId the sectionID URL Parameter.
         * @returns {SectionContext} the section context object
         * @since 1.108
         * @private
         */
        _createSectionContext: function (oPage, sSelectedSectionId) {
            var aPageSections = oPage.sections;
            var oSelectedSection;

            if (sSelectedSectionId) {
                //sectionID parameter is set in the URL
                oSelectedSection = aPageSections.find(function (oSection) {
                    return oSection.id === sSelectedSectionId;
                });

                this._initVizIdsInSection(oSelectedSection);

                return {
                    pageID: oPage.id,
                    sectionID: sSelectedSectionId,
                    pageTitle: oPage.title,
                    sectionTitle: oSelectedSection.title
                };
            }

            //sectionID parameter is not set in the URL
            aPageSections.forEach(function (oSection) {
                this._initVizIdsInSection(oSection);
            }.bind(this));

            return {
                pageID: oPage.id,
                sectionID: sSelectedSectionId,
                pageTitle: oPage.title
            };
        },

        /**
         * Add every VizIds contained in the Section into the Set stVizIdInSection
         *
         * @param {object} oSection The section object.
         * @since 1.108
         * @private
         */

        _initVizIdsInSection: function (oSection) {
            oSection.visualizations.forEach(function (oVisualization) {
                this.stVizIdInSection.add(oVisualization.vizId);
            }.bind(this));
        },

        /**
         * Get the list of all personalizable pages
         *
         * @returns {array<pageInfo>} the list of personalizable pages
         */
        getPersonalizablePages: function () {
            return this.aPersonalizablePages;
        },

        /**
         * Check whether a page is personalizable
         *
         * @param {string} sPageId The id of the page
         * @returns {boolean} Whether the page is personalizable
         * @since 1.105.0
         * @private
         */
        _isPersonalizablePage: function (sPageId) {
            var iIndex = this.aPersonalizablePages.findIndex(function (oPage) {
                return oPage.id === sPageId;
            });
            return iIndex > -1;
        },

        _retrieveChangedPageIds: function () {
            var oPagesList = sap.ui.getCore().byId("sapUshellVisualizationOrganizerSpacesList");
            var oSearchField = sap.ui.getCore().byId("sapUshellVisualizationOrganizerSearch");
            var oPopoverModel = oPagesList.getModel();
            var stInitialPages = oPopoverModel.getProperty("/pinnedPages") || new Set();

            // reset the filter, as some selected items might be hidden
            oPagesList.getBinding("items").filter(null);

            // filter groupHeaderItems (spaces) out of the result.
            var aItems = oPagesList.getItems().filter(function (oItem) {
                return oItem.isA("sap.m.StandardListItem");
            });

            // re-apply the filter
            oSearchField.fireSearch();

            // Map to prevent duplicates.
            var mAlreadyOrganizedPageIds = {};
            var aAddToPageIds = [];
            var aDeleteFromPageIds = [];

            aItems.forEach(function (oItem) {
                var sItemId = oItem.getBindingContext().getProperty("id");

                if (!mAlreadyOrganizedPageIds[sItemId]) {
                    mAlreadyOrganizedPageIds[sItemId] = true;
                    if (oItem.getSelected() && !stInitialPages.has(sItemId)) {
                        aAddToPageIds.push(sItemId);
                    } else if (!oItem.getSelected() && stInitialPages.has(sItemId)) {
                        aDeleteFromPageIds.push(sItemId);
                    }
                }
            });

            return {
                addToPageIds: aAddToPageIds,
                deleteFromPageIds: aDeleteFromPageIds
            };
        },

        okay: function () {
            var oPopover = sap.ui.getCore().byId("sapUshellVisualizationOrganizerPopover");
            // Prevent multiple add clicks
            if (oPopover.getBusy()) {
                return;
            }

            oPopover.setBusy(true);

            this._organizeVisualizations()
                .then(function () {
                    oPopover.setBusy(false);
                    oPopover.close();
                })
                .catch(function (oError) {
                    Log.error("Could not save the selected pages on the VisualizationOrganizerPopover", oError);
                });
        },

        /**
         * Collects event data from the given event and calls {@link toggle} with it.
         *
         * @param {sap.ui.base.Event} oEvent The event that raised by click.
         * @param {SectionContext} [oSectionContext] The section context if the visualization is added to special section.
         * @returns {Promise<boolean>} A promise that resolves when the popover is closed.
         *   The promise resolves true if the pin button should be updated.
         *   Resolves instantly without toggling if the PinButton is busy.
         * @see toggle
         */
        onHierarchyAppsPinButtonClick: function (oEvent, oSectionContext) {
            var oSource = oEvent.getSource();
            var oAppInfo = oSource.getParent().getBinding("title").getContext().getObject();

            if (oSource.getBusy()) {
                return Promise.resolve(false);
            }

            oAppInfo.isBookmark = true;
            oAppInfo.title = oAppInfo.text;

            if (oSectionContext) {
                oSource.setBusy(true);
                return this._applyBookmarkTileChangeToSection(oAppInfo, oSectionContext)
                    .then(function () {
                        oSource.setBusy(false);
                        return Promise.resolve(true);
                    });
            }

            if (this.aPersonalizablePages.length === 1) {
                oSource.setBusy(true);
                return this._applyChangeToPage(oSource, oAppInfo, this.aPersonalizablePages[0])
                    .then(function () {
                        oSource.setBusy(false);
                        return Promise.resolve(true);
                    });
            }

            return new Promise(function (fnResolve) {
                this.toggle(oSource, oAppInfo)
                    .then(function () {
                        var oPopover = sap.ui.getCore().byId("sapUshellVisualizationOrganizerPopover");
                        if (oPopover && oPopover.isOpen()) {
                            oPopover.attachEventOnce("afterClose", function () {
                                //update pin button
                                fnResolve(true);
                            });
                        } else {
                            //close the dialog by click
                            fnResolve(false);
                        }
                    });
            }.bind(this));
        },

        /**
         * Applies the given visualization organization changes for bookmark viz.
         * This is used by {@link _organizeVisualizations}.
         * When done, shows a {@link sap.m.MessageToast} informing the total number of organized visualizations.
         *
         * @param {VisualizationChanges} oVisualizationChanges The items representing where a visualization should be added and deleted.
         * @param {Boolean} bShowMessage If true the MessageToast is shown
         * @return {Promise<undefined>} A promise that resolves after every organization change.
         * @see _organizeVisualizations
         */
        _applyBookmarkOrganizationChange: function (oVisualizationChanges, bShowMessage) {
            var iChangedVisualizations = (oVisualizationChanges.addToPageIds.length + oVisualizationChanges.deleteFromPageIds.length);
            if (!iChangedVisualizations) {
                return Promise.resolve();
            }
            var oVizInfo = this.oVizInfo;
            var stAlreadyRemovedFromPageId = new Set();
            var oBookmarkService;
            var oPagesService;
            var oVizChangeChain = Promise.all([
                sap.ushell.Container.getServiceAsync("Bookmark"),
                sap.ushell.Container.getServiceAsync("Pages")
            ]).then(function (aServices) {
                oBookmarkService = aServices[0];
                oPagesService = aServices[1];
                return Promise.resolve();
            });

            // Bookmark service support only deletion of the bookmark tiles for all pages
            // and it is not possible to delete on the specific page.
            // For this reason we need to use Pages service directly.
            oVisualizationChanges.deleteFromPageIds.forEach(function (sPageId) {
                if (!stAlreadyRemovedFromPageId.has(sPageId)) {
                    stAlreadyRemovedFromPageId.add(sPageId);
                    oVizChangeChain = oVizChangeChain.then(function () {
                        return oPagesService.deleteBookmarks({ url: oVizInfo.url }, sPageId);
                    });
                }
            });

            oVisualizationChanges.addToPageIds.forEach(function (sPageId) {
                oVizChangeChain = oVizChangeChain.then(function () {
                    return new Promise(function (fnResolve, fnReject) {
                        var oVisualization = {
                            url: oVizInfo.url,
                            title: oVizInfo.text,
                            subtitle: oVizInfo.subtitle,
                            icon: oVizInfo.icon
                        };
                        var oContainer = {
                            type: ushellLibrary.ContentNodeType.Page,
                            id: sPageId,
                            isContainer: true
                        };
                        oBookmarkService.addBookmark(oVisualization, oContainer)
                            .done(fnResolve)
                            .fail(fnReject);
                    });
                });
            });

            return oVizChangeChain.then(function () {
                if (bShowMessage) {
                    sap.ui.require(["sap/m/MessageToast"], function (MessageToast) {
                        MessageToast.show(resources.i18n.getText("VisualizationOrganizer.MessageToast"));
                    });
                }
            });
        },

        /**
         * Adds and removes bookmark tiles to the specific section of the page and generates a MessageToast.
         *
         * @param {object} oVizInfo The information of the visualization, that should be added.
         * @param {SectionContext} oSectionContext The information used to check where a visualization is.
         * @returns {Promise<undefined>} A promise that resolves when the popover is toggled.
         * @since 1.84.1
         * @private
         */
        _applyBookmarkTileChangeToSection: function (oVizInfo, oSectionContext) {
            return sap.ushell.Container.getServiceAsync("Pages").then(function (oPageService) {
                var oVizChangeChain;
                var sMessageToUser;
                var sUrl = oVizInfo.url;
                var sVisualizationTitle = oVizInfo.title;
                var sPageId = oSectionContext.pageID;
                var sSectionId = oSectionContext.sectionID;

                if (oVizInfo.bookmarkCount > 0) {
                    sMessageToUser = resources.i18n.getText(
                        "VisualizationOrganizer.MessageToastSectionContextRemove",
                        [sVisualizationTitle, oSectionContext.sectionTitle, oSectionContext.pageTitle]
                    );
                    oVizChangeChain = oPageService.deleteBookmarks({ url: sUrl }, sPageId, sSectionId);
                } else {
                    var oVisualization = {
                        url: sUrl,
                        title: oVizInfo.text,
                        subtitle: oVizInfo.subtitle,
                        icon: oVizInfo.icon
                    };
                    sMessageToUser = resources.i18n.getText(
                        "VisualizationOrganizer.MessageToastSectionContextAdd",
                        [sVisualizationTitle, oSectionContext.sectionTitle, oSectionContext.pageTitle]
                    );
                    oVizChangeChain = oPageService.addBookmarkToPage(sPageId, oVisualization, sSectionId);
                }
                return oVizChangeChain.then(function () {
                    sap.ui.require(["sap/m/MessageToast"], function (MessageToast) {
                        MessageToast.show(sMessageToUser, { offset: "0 -50" });
                    });
                });
            });
        },

        /**
         * Calculate the bookmarkCount for the applications in User Menu and SAP Menu
         *
         * @param {object} aAppsData The information of the application, that should be added.
         * @param {SectionContext} oSectionContext The information used to check where a visualization is.
         * @returns {Promise<object>} A promise that resolves updated aAppsData with bookmarkCount.
         * @since 1.84.1
         * @private
         */
        updateBookmarkCount: function (aAppsData, oSectionContext) {
            return sap.ushell.Container.getServiceAsync("Pages")
                .then(function (PagesService) {
                    var aCountPromises = aAppsData.map(function (oAppData) {
                        return PagesService._findBookmarks({ url: oAppData.url })
                            .then(function (aFoundBookmarks) {
                                if (oSectionContext) {
                                    aFoundBookmarks = aFoundBookmarks.filter(function (oBookmark) {
                                        return oSectionContext.pageID === oBookmark.pageId && oSectionContext.sectionID === oBookmark.sectionId;
                                    });
                                }
                                oAppData.bookmarkCount = aFoundBookmarks.length;
                                return oAppData;
                            });
                    });
                    return Promise.all(aCountPromises);
                });
        },

        /**
         * @param {int} bookmarkCount The count of existing bookmarks.
         * @param {object} [sectionContext] The section context the AppFinder is started in.
         * @returns {sap.m.ButtonType} The tooltip that should be used for that visualization "pin" button.
         * @see isVizIdPresent
         */
        formatBookmarkPinButtonTooltip: function (bookmarkCount, sectionContext) {
            var sText;

            if (sectionContext) {
                if (bookmarkCount > 0) {
                    sText = "VisualizationOrganizer.Button.Tooltip.RemoveFromSection";
                } else {
                    sText = "VisualizationOrganizer.Button.Tooltip.AddToSection";
                }
            } else if (bookmarkCount > 0) {
                sText = "EasyAccessMenu_PinButton_Toggled_Tooltip";
            } else {
                sText = "EasyAccessMenu_PinButton_UnToggled_Tooltip";
            }

            return resources.i18n.getText(sText);
        },

        /**
         * @typedef {object} PageInfo Information about a page.
         * @property {set} id The page id.
         * @property {set} title The page title.
         */

        /**
         * Adds or removes visualizations to the specific page and generates a MessageToast.
         *
         * @param {sap.ui.Control} oOpenBy The ui5 control, the popover should be toggled by.
         * @param {object} oVizInfo The information of the visualization, that should be added.
         * @param {PageInfo} oPage The information about the page.
         * @returns {Promise<undefined>} A promise that resolves when the popover is toggled.
         * @since 1.90.0
         * @private
         */
        _applyChangeToPage: function (oOpenBy, oVizInfo, oPage) {
            var sVisualizationId = decodeURIComponent(oVizInfo.id);
            var sVisualizationTitle = oVizInfo.title;
            var sPageId = oPage.id;
            var bIsVizIdPresented = oVizInfo.isBookmark ? oVizInfo.bookmarkCount > 0 : this.isVizIdPresent(sVisualizationId);
            var oVisualizationChanges = {
                addToPageIds: bIsVizIdPresented ? [] : [sPageId],
                deleteFromPageIds: bIsVizIdPresented ? [sPageId] : []
            };
            var sMessageToUser = resources.i18n.getText(
                bIsVizIdPresented ? "VisualizationOrganizer.MessageToastPageRemove" : "VisualizationOrganizer.MessageToastPageAdd",
                [sVisualizationTitle || sVisualizationId, oPage.title]
            );

            this.oVizInfo = oVizInfo;
            this.sVisualizationId = sVisualizationId;
            var oChangePromise;
            if (oVizInfo.isBookmark) {
                oChangePromise = this._applyBookmarkOrganizationChange(oVisualizationChanges, false);
            } else {
                oChangePromise = this._applyOrganizationChange(oVisualizationChanges, false);
            }

            return oChangePromise.then(function () {
                oOpenBy.getBinding("icon").refresh(true);
                oOpenBy.getBinding("type").refresh(true);
                oOpenBy.getBinding("tooltip").refresh(true);

                sap.ui.require(["sap/m/MessageToast"], function (MessageToast) {
                    MessageToast.show(sMessageToUser, { offset: "0 -50" });
                });
            });
        },

        /**
         * Grouper function to group pages by spaceTitle.
         * Since spaces can have the same title, the spaceId needs to be taken into account.
         *
         * @param {object} binding The binding object.
         * @returns {{key: string, title: string}} A map containing key and title.
         */
        groupBySpace: function (binding) {
            return {
                key: binding.getProperty("spaceId"),
                title: binding.getProperty("space")
            };
        },

        /**
         * Get a group header for each space.
         *
         * @param {{key: string, title: string}} spaceProperties A map containing key and title.
         * @returns {sap.m.GroupHeaderListItem} The group header list item.
         */
        getGroupHeader: function (spaceProperties) {
            return new GroupHeaderListItem({
                title: spaceProperties.title
            });
        },

        exit: function () {
            var oPopover = sap.ui.getCore().byId("sapUshellVisualizationOrganizerPopover");
            if (oPopover) {
                oPopover.destroy();
            }
        }
    });
});
