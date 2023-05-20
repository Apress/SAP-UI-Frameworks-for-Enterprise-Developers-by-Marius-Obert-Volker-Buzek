// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @name sap.ushell.ui.launchpad.CatalogsContainer
 * @private
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Control",
    "sap/ui/performance/Measurement",
    "sap/ushell/library", // css style dependency
    "sap/ushell/ui/launchpad/TileContainerUtils"
], function (
    Log,
    Control,
    Measurement,
    ushellLibrary,
    TileContainerUtils
) {
    "use strict";

    var CatalogsContainer = Control.extend("sap.ushell.ui.launchpad.CatalogsContainer", {
        metadata: {
            library: "sap.ushell",
            properties: {
                categoryFilter: { type: "string", defaultValue: "ALL" },
                categoryAllocateTiles: { type: "int", defaultValue: "0" }
            },
            aggregations: {
                catalogs: { type: "sap.ushell.ui.launchpad.CatalogEntryContainer", multiple: true }
            }
        },
        renderer: {
            apiVersion: 2,
            render: function (oRm, oControl) {
                var aCatalogs = oControl.getCatalogs();

                oRm.openStart("div", oControl);
                oRm.class("sapUshellCatalogsContainer");
                oRm.openEnd(); // div - tag

                for (var i = 0, len = aCatalogs.length; i < len; ++i) {
                    oRm.renderControl(aCatalogs[i]);
                }

                oRm.close("div");
            }
        }
    });

    CatalogsContainer.prototype.onBeforeRendering = function () {
        if (this.getCatalogs().length) {
            this.setBusy(false);
        }
    };

    CatalogsContainer.prototype.setPagingManager = function (oPagingManager) {
        Measurement.start("FLP:DashboardManager.CatalogsRendering", "CatalogsRendering", "FLP");
        Measurement.pause("FLP:DashboardManager.CatalogsRendering");

        this.oPagingManager = oPagingManager;
    };

    CatalogsContainer.prototype.updateAllocatedUnits = function (nAllocatedUnits) {
        this.nAllocatedUnits = nAllocatedUnits;
    };

    CatalogsContainer.prototype.applyPagingCategoryFilters = function (nAllocatedUnits, sCatalog) {
        var aItems = this.getCatalogs();

        this.nAllocatedUnits = nAllocatedUnits;
        if (sCatalog && sCatalog !== "All") {
            this.sCatalogTerm = sCatalog;
        } else {
            this.sCatalogTerm = "";
        }

        if (!this.filters) {
            this.filters = {};
        }

        if (!this.filters.catalogEntry) {
            this.filters.catalogEntry = function (entry) {
                var sPath = entry.getPath(),
                    bIsSelectedCatalog = entry.getProperty("title") === this.sCatalogTerm,
                    indexEntry;

                if (!this.sCatalogTerm) {
                    // Do not filter catalogs when Catalogs All is selected.
                    return;
                }

                // we need to check if this catalog was fully loadded or event not loaded, and if so to load it.
                indexEntry = this.indexingMaps.onScreenPathIndexMap[sPath];

                // mark the selected catalog as visible.
                if (indexEntry) {
                    indexEntry.isVisible = bIsSelectedCatalog;
                }
            }.bind(this);
        }

        if (!this.filters.pagination) {
            this.filters.pagination = function (entry) {
                var sPath = entry.getPath(),
                    indexEntry;

                indexEntry = this.indexingMaps.onScreenPathIndexMap[sPath];

                if (!this.nAllocatedUnits) {
                    // If we do not have allocated units for this catalog
                    // (OR we have a catalog that's invisible due to another filter mechanism, like the category)
                    // so its visibility will be false.
                    indexEntry.isVisible = false;
                }
            }.bind(this);
        }

        // now that we have allocation lets render the next bulk.
        // check that we have indexed that catalogs.
        if (!this.indexingMaps) {
            return;
        }

        this.indexingMaps = TileContainerUtils.indexOnScreenElements(aItems);

        TileContainerUtils.applyFilterOnAllItems(this.mBindingInfos.catalogs, this.filters, this.processFiltering.bind(this));

        if (this.indexingMaps) {
            TileContainerUtils.showHideTilesAndHeaders(this.indexingMaps, this.getCatalogs());
        }
    };

    CatalogsContainer.prototype.processFiltering = function (entry) {
        var aCatalogs = this.getCatalogs(),
            sPath = entry.getPath(),
            indexEntry = this.indexingMaps.onScreenPathIndexMap[sPath],
            oCatlalogEntry = aCatalogs[indexEntry.aItemsRefrenceIndex],
            prevAllocatedUnits;

        // if after the pagination and catalog filtering - the entry is set to visible, we process the catalog with search and tag filters
        if (indexEntry.isVisible && (!this.catalogPagination[sPath] || this.catalogPagination[sPath] === "start")) {
            if (this.catalogPagination[sPath] === undefined) {
                this.catalogPagination[sPath] = "start";
                oCatlalogEntry.catalogState = {};
            } else if (this.catalogPagination[sPath] === "start") {
                var numOfVisibleElementsInCatalog = oCatlalogEntry.nNumberOfVisibileElements;
                this.nAllocatedUnits += (numOfVisibleElementsInCatalog.appBoxesContainer + numOfVisibleElementsInCatalog.customTilesContainer);
            }

            prevAllocatedUnits = this.nAllocatedUnits;

            // process search and tags filtering for this catalog
            oCatlalogEntry.handleElements("appBoxesContainer");
            oCatlalogEntry.handleElements("customTilesContainer");

            if (oCatlalogEntry.catalogState.appBoxesContainer === "full" && oCatlalogEntry.catalogState.customTilesContainer === "full") {
                this.catalogPagination[sPath] = "full";
            }

            // If there were allocatedUnits used after processing this catalog - we mark that there are at least one search result.
            // Therefore the page displayed will not be an "empty page" message page later on.
            if (prevAllocatedUnits - this.nAllocatedUnits > 0) {
                this.bSearchResults = true;
            } else { // If after the handleElements there were no allocatedUnits used - this catalog should not be seen at all (including its title)
                indexEntry.isVisible = false;
            }
        } else if (indexEntry.isVisible && this.catalogPagination[sPath] === "full") {
            var numsOfVisibleElementsInCatalog = oCatlalogEntry.nNumberOfVisibileElements;
            var fullNumOfVisibleElementsInCatalog = numsOfVisibleElementsInCatalog.appBoxesContainer + numsOfVisibleElementsInCatalog.customTilesContainer;
            if (fullNumOfVisibleElementsInCatalog === 0) {
                indexEntry.isVisible = false;
            }
        }
    };

    CatalogsContainer.prototype.resetCatalogPagination = function () {
        this.catalogPagination = {};
    };

    CatalogsContainer.prototype.updateAggregation = function (sReason) {
        Log.debug("Updating TileContainer. Reason: ", sReason);

        try {
            // may fail if filter broadens after non-filter update
            Measurement.resume("FLP:DashboardManager.CatalogsRendering");
            this.filterElements();
            Measurement.pause("FLP:DashboardManager.CatalogsRendering");
        } catch (ex) {
            Control.prototype.updateAggregation.apply(this, arguments);
        }
    };

    CatalogsContainer.prototype.addNewItem = function (elementToDisplay, sName) {
        var oNewCatalog,
            ntileSizeInUnits,
            aItems,
            sPath = elementToDisplay.getPath();

        oNewCatalog = TileContainerUtils.createNewItem.bind(this)(elementToDisplay, sName);

        if (!oNewCatalog.filters) {
            oNewCatalog.filters = {};
            oNewCatalog.filters.appBoxesContainer = {};
            oNewCatalog.filters.customTilesContainer = {};

            oNewCatalog.filters.appBoxesContainer.pagination = function (entry) {
                var indexEntry = this.indexingMaps.appBoxesContainer.onScreenPathIndexMap[entry.getPath()];

                if (this.getAllocatedUnits) {
                    // If we do not have allocated units for this catalog
                    // (OR we have a catalog that's invisible due to another filter mechanism, like the category)
                    // so its visibility will be false.
                    indexEntry.isVisible = !!this.getAllocatedUnits();
                }
            }.bind(oNewCatalog);

            oNewCatalog.filters.customTilesContainer.pagination = function (entry) {
                var indexEntry = this.indexingMaps.customTilesContainer.onScreenPathIndexMap[entry.getPath()];

                if (this.getAllocatedUnits) {
                    // If we do not have allocated units for this catalog
                    // (OR we have a catalog that's invisible due to another filter mechanism, like the category)
                    // so its visibility will be false.
                    indexEntry.isVisible = !!this.getAllocatedUnits();
                }
            }.bind(oNewCatalog);
        }
        oNewCatalog.nAllocatedUnits = this.nAllocatedUnits;

        oNewCatalog.getAllocatedUnits = function () {
            return this.nAllocatedUnits;
        }.bind(this);

        // this function will realoc units, in the case when elements are filtered.
        oNewCatalog.elementFiltered = function (nNumberFilteredElements) {
            // according to the sElementType ask the paging manager how much units to substruct.
            ntileSizeInUnits = this.oPagingManager.getSizeofSupportedElementInUnits("tile");
            this.nAllocatedUnits += nNumberFilteredElements * ntileSizeInUnits;

            if (this.nAllocatedUnits <= 0) {
                this.nAllocatedUnits = 0;
            }
        }.bind(this);

        oNewCatalog.elementsVisible = function (nNumberVisibleElements) {
            // according to the sElementType ask the paging manager how much units to substruct.
            ntileSizeInUnits = this.oPagingManager.getSizeofSupportedElementInUnits("tile");
            this.nAllocatedUnits -= nNumberVisibleElements * ntileSizeInUnits;

            if (this.nAllocatedUnits <= 0) {
                this.nAllocatedUnits = 0;
            }
        }.bind(this);

        oNewCatalog.newElementCreated = function (sElementType, oCatalog) {
            // according to the sElementType ask the paging manager how much units to substruct.
            this.nAllocatedUnits -= this.oPagingManager.getSizeofSupportedElementInUnits("tile");

            if (this.nAllocatedUnits <= 0) {
                this.nAllocatedUnits = 0;
            }
        }.bind(this);

        oNewCatalog.currElementVisible = function () {
            // according to the sElementType ask the paging manager how much units to substruct.
            this.nAllocatedUnits -= this.oPagingManager.getSizeofSupportedElementInUnits("tile");

            if (this.nAllocatedUnits <= 0) {
                this.nAllocatedUnits = 0;
            }
        }.bind(this);

        TileContainerUtils.addNewItem.bind(this)(oNewCatalog, sName);
        aItems = this.getCatalogs();

        this.indexingMaps.onScreenPathIndexMap[sPath] = { aItemsRefrenceIndex: aItems.length - 1, isVisible: true };

        // pass the allocated tiles attributes to the CatalogEntryContainer.
        return true;
    };

    CatalogsContainer.prototype.handleFilters = function () {
        if (!this.catalogPagination) {
            this.catalogPagination = {};
        }

        if (!this.catalogsElementsMap) {
            this.catalogsElementsMap = {};
        }

        if (!this.filters) {
            this.filters = {};
        }
    };

    CatalogsContainer.prototype.setHandleSearchCallback = function (handleSearchCallback) {
        this.handleSearchCallback = handleSearchCallback;
    };

    CatalogsContainer.prototype.filterElements = function () {
        var sName = "catalogs",
            oBinding = this.mBindingInfos[sName].binding,
            aBindingContexts = oBinding.getContexts(),
            aItems = this.getCatalogs(),
            indexSearchMissingFilteredElem;

        // index the on screen elements according to the path
        if (!this.indexingMaps) {
            this.indexingMaps = TileContainerUtils.indexOnScreenElements(aItems);
        }

        this.handleFilters();

        // search for the missing filtered elements
        indexSearchMissingFilteredElem = TileContainerUtils.markVisibleOnScreenElements(aBindingContexts, this.indexingMaps, false);

        // validate data is still can be added to the screen object and still the ordering will be ok else call refresh.
        if (!TileContainerUtils.validateOrder(aBindingContexts, aItems, indexSearchMissingFilteredElem)) {
            throw true;
        }

        // add the missing elements and check if there is a need for header.
        TileContainerUtils.createMissingElementsInOnScreenElements(this.indexingMaps, aBindingContexts, indexSearchMissingFilteredElem, this.addNewItem.bind(this), aItems, this.filters, sName);

        aItems = this.getCatalogs();

        // show/hide all the tiles ...
        TileContainerUtils.showHideTilesAndHeaders(this.indexingMaps, aItems);

        if (this.handleSearchCallback) {
            this.handleSearchCallback();
        }
    };

    return CatalogsContainer;
});
