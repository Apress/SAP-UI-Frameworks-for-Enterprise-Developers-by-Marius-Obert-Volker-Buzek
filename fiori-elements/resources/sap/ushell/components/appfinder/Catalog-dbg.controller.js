// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/extend",
    "sap/ushell/library",
    "sap/ui/core/Core",
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/_HomepageManager/PagingManager",
    "sap/ushell/components/CatalogsManager",
    "sap/ui/core/UIComponent",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/library",
    "sap/ui/Device",
    "sap/ui/core/library",
    "sap/ui/model/Context",
    "sap/m/MessageToast",
    "sap/ushell/Config",
    "sap/ushell/components/appfinder/VisualizationOrganizerHelper",
    "sap/ushell/utils/WindowUtils"
], function (
    extend,
    ushellLibrary,
    Core,
    View,
    Controller,
    PagingManager,
    CatalogsManager,
    UIComponent,
    jQuery,
    resources,
    Filter,
    FilterOperator,
    mobileLibrary,
    Device,
    coreLibrary,
    Context,
    MessageToast,
    Config,
    VisualizationOrganizerHelper,
    WindowUtils
) {
    "use strict";

    // shortcut for sap.m.SplitAppMode
    var SplitAppMode = mobileLibrary.SplitAppMode;

    // shortcut for sap.ushell.AppType
    var AppType = ushellLibrary.AppType;

    /* global hasher */
    return Controller.extend("sap.ushell.components.appfinder.Catalog", {
        oPopover: null,
        onInit: function () {
            sap.ushell.Container.getServiceAsync("LaunchPage").then(function (oLaunchPageService) {
                this.oLaunchPageService = oLaunchPageService;
            }.bind(this));

            // take the sub-header model
            this.categoryFilter = "";
            this.preCategoryFilter = "";

            var oView = this.getView();
            this.oMainModel = oView.getModel();
            this.oSubHeaderModel = oView.getModel("subHeaderModel");
            this.resetPage = false;
            this.bIsInProcess = false;
            this.oVisualizationOrganizerHelper = oView.oVisualizationOrganizerHelper;

            this.oCatalogsContainer = oView.oCatalogsContainer;

            this.timeoutId = 0;

            document.subHeaderModel = this.oSubHeaderModel;
            document.mainModel = this.oMainModel;

            // init listener for the toggle button binding context
            var oToggleButtonModelBinding = this.oSubHeaderModel.bindProperty("/openCloseSplitAppButtonToggled");
            oToggleButtonModelBinding.attachChange(this.handleToggleButtonModelChanged, this);

            oView.oCatalogsContainer.setHandleSearchCallback(this.handleSearchModelChanged.bind(this));
        },

        customRouteMatched: function (oEvent) {
            this.onShow(oEvent);
        },

        onBeforeRendering: function () {
            // Invoking loading of all catalogs here instead of 'onBeforeShow' as it improves the perceived performance.
            // Fix of incident#:1570469901
            Core.getEventBus().publish("renderCatalog");
        },

        onAfterRendering: function () {
            this.wasRendered = true;
            // disable swipe gestures -> never show master in Portrait mode
            if (!this.PagingManager) {
                this._setPagingManager();
            }

            // just the first time
            if (this.PagingManager.currentPageIndex === 0) {
                this.allocateNextPage();
            }

            jQuery(window).resize(function () {
                var windowWidth = jQuery(window).width();
                var windowHeight = jQuery(window).height();

                this.PagingManager.setContainerSize(windowWidth, windowHeight);
            }.bind(this));
            this._handleAppFinderWithDocking();
            Core.getEventBus().subscribe("launchpad", "appFinderWithDocking", this._handleAppFinderWithDocking, this);
            Core.getEventBus().subscribe("sap.ushell", "appFinderAfterNavigate", this._handleAppFinderAfterNavigate, this);
        },

        _setPagingManager: function () {
            this.lastCatalogId = 0;
            this.PagingManager = new PagingManager("catalogPaging", {
                supportedElements: {
                    tile: { className: "sapUshellTile" }
                },
                containerHeight: window.innerHeight,
                containerWidth: window.innerWidth
            });

            // we need PagingManager in CatalogContainer in order to allocate page if catalog is selected.
            this.oCatalogsContainer.setPagingManager(this.PagingManager);
        },

        _decodeUrlFilteringParameters: function (sUrlParameters) {
            var oUrlParameters;
            try {
                oUrlParameters = JSON.parse(sUrlParameters);
            } catch (e) {
                oUrlParameters = sUrlParameters;
            }
            var hashTag = (oUrlParameters && oUrlParameters.tagFilter && oUrlParameters.tagFilter) || [];

            if (hashTag) {
                try {
                    this.tagFilter = JSON.parse(hashTag);
                } catch (e) {
                    this.tagFilter = [];
                }
            } else {
                this.tagFilter = [];
            }

            this.categoryFilter = (oUrlParameters && oUrlParameters.catalogSelector && oUrlParameters.catalogSelector) || this.categoryFilter;
            if (this.categoryFilter) {
                this.categoryFilter = window.decodeURIComponent(this.categoryFilter);
            }
            this.searchFilter = (oUrlParameters && oUrlParameters.tileFilter && oUrlParameters.tileFilter) || null;
            if (this.searchFilter) {
                this.searchFilter = window.decodeURIComponent(this.searchFilter);
            }
        },

        _applyFilters: function (wasRendered) {
            var shouldFocusOnCategory = false;

            if (this.categoryFilter) {
                // If all is selected pass an empty string.
                this.categoryFilter = resources.i18n.getText("all") === this.categoryFilter ? "" : this.categoryFilter;
                if (this.categoryFilter !== this.preCategoryFilter) {
                    shouldFocusOnCategory = true;
                }
                this.oView.setCategoryFilterSelection(this.categoryFilter, shouldFocusOnCategory);
            } else {
                shouldFocusOnCategory = true;
                this.oView.setCategoryFilterSelection("", shouldFocusOnCategory);
            }
            this.preCategoryFilter = this.categoryFilter;

            if (this.searchFilter && this.searchFilter.length) {
                // Remove all asterisks from search query before applying the filter
                this.searchFilter = this.searchFilter.replace(/\*/g, "");
                this.searchFilter = this.searchFilter.trim();
                this.oSubHeaderModel.setProperty("/search", {
                    searchMode: true,
                    searchTerm: this.searchFilter
                });
            } else if (wasRendered) {
                this.oSubHeaderModel.setProperty("/search", {
                    searchMode: false,
                    searchTerm: ""
                });
                this.resetPage = true;
            }

            if (this.tagFilter && this.tagFilter.length) {
                this.oSubHeaderModel.setProperty("/tag", {
                    tagMode: true,
                    selectedTags: this.tagFilter
                });
            } else if (wasRendered) {
                this.oSubHeaderModel.setProperty("/tag", {
                    tagMode: false,
                    selectedTags: []
                });
                this.resetPage = true;
            }

            this.handleSearchModelChanged();
        },

        _handleAppFinderAfterNavigate: function () {
            this.clearFilters();
        },

        clearFilters: function () {
            var shouldFocusOnCategory = false;
            if (this.categoryFilter !== this.preCategoryFilter) {
                shouldFocusOnCategory = true;
            }
            var bSearchMode = this.oSubHeaderModel.getProperty("/search/searchMode");
            var bTagMode = this.oSubHeaderModel.getProperty("/tag/tagMode");

            // if a search was made before
            if (bSearchMode) {
                this.oSubHeaderModel.setProperty("/search", {
                    searchMode: true,
                    searchTerm: ""
                });
            }

            if (bTagMode) {
                this.oSubHeaderModel.setProperty("/tag", {
                    tagMode: true,
                    selectedTags: []
                });
            }

            if (this.categoryFilter && this.categoryFilter !== "") {
                this.selectedCategoryId = undefined;
                this.categoryFilter = undefined;
                this.getView().getModel().setProperty("/categoryFilter", "");
                this.oView.setCategoryFilterSelection("", shouldFocusOnCategory);
            }

            this.preCategoryFilter = this.categoryFilter;
            this.handleSearchModelChanged();
        },

        onShow: function (oEvent) {
            // if the user goes to the catalog directly (not via the homepage) we must close the loading dialog
            var sUrlParameters = oEvent.getParameter("arguments").filters;

            extend(this.getView().getViewData(), oEvent);
            this._decodeUrlFilteringParameters(sUrlParameters);

            // If onAfterRendering was called before and we got here from Home (and not via appfinder inner navigation),
            // then this means we need to reset all filters and present the page as if it's opened for the first time.
            if (this.wasRendered && !sUrlParameters) {
                this.clearFilters();
            } else { // This means we are navigating within the appFinder, or this is the first time the appFinder is opened.
                this._applyFilters(this.wasRendered);
            }
        },

        allocateNextPage: function () {
            if (!this.oCatalogsContainer.nAllocatedUnits || this.oCatalogsContainer.nAllocatedUnits === 0) {
                // calculate the number of tiles in the page.
                this.PagingManager.moveToNextPage();
                this.allocateTiles = this.PagingManager._calcElementsPerPage();
                this.oCatalogsContainer.applyPagingCategoryFilters(this.allocateTiles, this.categoryFilter);
            }
        },

        setTagsFilter: function (aFilter) {
            var oParameterObject = {
                catalogSelector: this.categoryFilter ? this.categoryFilter : "All",
                tileFilter: (this.searchFilter && this.searchFilter.length) ? encodeURIComponent(this.searchFilter) : "",
                tagFilter: aFilter.length ? JSON.stringify(aFilter) : []
            };
            this._addNavigationContextToFilter(oParameterObject);
            this.getView().parentComponent.getRouter().navTo("catalog", {
                filters: JSON.stringify(oParameterObject)
            });
        },

        setCategoryFilter: function (aFilter) {
            var oParameterObject = {
                catalogSelector: aFilter,
                tileFilter: this.searchFilter ? encodeURIComponent(this.searchFilter) : "",
                tagFilter: this.tagFilter.length ? JSON.stringify(this.tagFilter) : []
            };

            this._addNavigationContextToFilter(oParameterObject);
            this.getView().parentComponent.getRouter().navTo("catalog", {
                filters: JSON.stringify(oParameterObject)
            });
        },

        setSearchFilter: function (aFilter) {
            var oParameterObject = {
                catalogSelector: this.categoryFilter ? this.categoryFilter : "All",
                tileFilter: aFilter ? encodeURIComponent(aFilter) : "",
                tagFilter: this.tagFilter.length ? JSON.stringify(this.tagFilter) : []
            };
            this._addNavigationContextToFilter(oParameterObject);
            this.getView().parentComponent.getRouter().navTo("catalog", {
                filters: JSON.stringify(oParameterObject)
            });
        },

        /**
         * Add group or section scope to the navigation filter. If there is no scope,
         * the filter will be not changed.
         * @param {object} oFilter filter to adjust
         * @returns {object} navigation filter for app finder
         *
         * @since 1.76.0
         * @private
         */
        _addNavigationContextToFilter: function (oFilter) {
            var oContext = this.oVisualizationOrganizerHelper.getNavigationContext.apply(this);
            if (oContext) {
                Object.keys(oContext).forEach(function (sKey) {
                    oFilter[sKey] = oContext[sKey];
                });
            }
            return oFilter;
        },

        onSearch: function (searchExp) {
            var sActiveMenu = this.oSubHeaderModel.getProperty("/activeMenu");
            if (this.oView.getId().indexOf(sActiveMenu) !== -1) {
                var searchTerm = searchExp.searchTerm ? searchExp.searchTerm : "";
                this.setSearchFilter(searchTerm);
            } else {
                // For the edge case in which we return to the catalog after exiting search mode in the EAM.
                this._restoreSelectedMasterItem();
            }
        },

        onTag: function (tagExp) {
            var sActiveMenu = this.oSubHeaderModel.getProperty("/activeMenu");
            if (this.oView.getId().indexOf(sActiveMenu) !== -1) {
                var tags = tagExp.selectedTags ? tagExp.selectedTags : [];
                this.setTagsFilter(tags);
            } else {
                // For the edge case in which we return to the catalog after exiting search mode in the EAM.
                this._restoreSelectedMasterItem();
            }
        },

        /**
         * Returns the group context path string as kept in the model
         *
         * @returns {string} Group context
         */
        getGroupContext: function () {
            var oModel = this.getView().getModel();
            var sGroupContext = oModel.getProperty("/groupContext/path");

            return {
                targetGroup: encodeURIComponent(sGroupContext || "")
            };
        },

        _isTagFilteringChanged: function (aSelectedTags) {
            var bSameLength = aSelectedTags.length === this.tagFilter.length;
            var bIntersect = bSameLength;

            // Checks whether there's a symmetric difference between the currently selected tags and those persisted in the URL.
            if (!bIntersect) {
                return true;
            }
            aSelectedTags.some(function (sTag) {
                bIntersect = this.tagFilter && Array.prototype.indexOf.call(this.tagFilter, sTag) !== -1;

                return !bIntersect;
            }.bind(this));

            return bIntersect;
        },

        _setUrlWithTagsAndSearchTerm: function (sSearchTerm, aSelectedTags) {
            var oUrlParameterObject = {
                tileFilter: sSearchTerm && sSearchTerm.length ? encodeURIComponent(sSearchTerm) : "",
                tagFilter: aSelectedTags.length ? JSON.stringify(aSelectedTags) : []
            };
            this._addNavigationContextToFilter(oUrlParameterObject);
            this.getView().parentComponent.getRouter().navTo("catalog", {
                filters: JSON.stringify(oUrlParameterObject)
            });
        },

        handleSearchModelChanged: function () {
            var bSearchMode = this.oSubHeaderModel.getProperty("/search/searchMode");
            var bTagMode = this.oSubHeaderModel.getProperty("/tag/tagMode");
            var sSearchTerm = this.oSubHeaderModel.getProperty("/search/searchTerm");
            var aSelectedTags = this.oSubHeaderModel.getProperty("/tag/selectedTags");
            var aFilters = [];
            var oTagFilterWrapper;
            var oSearchFilterWrapper;
            var oFilters;

            if (!this.PagingManager) {
                this._setPagingManager();
            }
            this.PagingManager.resetCurrentPageIndex();
            this.nAllocatedTiles = 0;
            this.PagingManager.moveToNextPage();
            this.allocateTiles = this.PagingManager._calcElementsPerPage();
            this.oView.oCatalogsContainer.updateAllocatedUnits(this.allocateTiles);
            this.oView.oCatalogsContainer.resetCatalogPagination();

            var oPage = Core.byId("catalogTilesDetailedPage");
            if (oPage) {
                oPage.scrollTo(0, 0);
            }

            // if view ID does not contain the active menu then return

            if (bSearchMode || bTagMode || this.resetPage) {
                if (aSelectedTags && aSelectedTags.length > 0) {
                    var oTagFilter = new Filter("tags", "EQ", "v");
                    oTagFilter.fnTest = function (oTags) {
                        if (aSelectedTags.length === 0) {
                            return true;
                        }

                        for (var ind = 0; ind < aSelectedTags.length; ind++) {
                            var filterByTag = aSelectedTags[ind];
                            if (oTags.indexOf(filterByTag) === -1) {
                                return false;
                            }
                        }
                        return true;
                    };

                    oTagFilterWrapper = new Filter([oTagFilter], true);
                }

                // Remove all asterisks from search query before applying the filter
                sSearchTerm = sSearchTerm ? sSearchTerm.replace(/\*/g, "") : sSearchTerm;

                if (sSearchTerm) {
                    var aSearchTermParts = sSearchTerm.split(/[\s,]+/);
                    // create search filter with all the parts for keywords and apply AND operator ('true' indicates that)
                    var keywordsSearchFilter = new Filter(jQuery.map(aSearchTermParts, function (value) {
                        return (value && new Filter("keywords", FilterOperator.Contains, value));
                    }), true);

                    // create search filter with all the parts for title and apply AND operator ('true' indicates that)
                    var titleSearchFilter = new Filter(jQuery.map(aSearchTermParts, function (value) {
                        return (value && new Filter("title", FilterOperator.Contains, value));
                    }), true);

                    // create search filter with all the parts for subtitle and apply AND operator ('true' indicates that)
                    var subtitleSearchFilter = new Filter(jQuery.map(aSearchTermParts, function (value) {
                        return (value && new Filter("subtitle", FilterOperator.Contains, value));
                    }), true);

                    aFilters.push(keywordsSearchFilter);
                    aFilters.push(titleSearchFilter);
                    aFilters.push(subtitleSearchFilter);
                    oSearchFilterWrapper = new Filter(aFilters, false); // false mean OR between the search filters
                }

                var catalogs = this.oView.oCatalogsContainer.getCatalogs();
                this.oSearchResultsTotal = [];
                var that = this;

                // construct group filter for tag & search
                if (oTagFilterWrapper && oTagFilterWrapper.aFilters.length > 0 && oSearchFilterWrapper) {
                    oFilters = new Filter([oSearchFilterWrapper].concat([oTagFilterWrapper]), true);
                } else if (oTagFilterWrapper && oTagFilterWrapper.aFilters.length > 0) {
                    oFilters = new Filter([oTagFilterWrapper], true);
                } else if (oSearchFilterWrapper && oSearchFilterWrapper.aFilters.length > 0) {
                    oFilters = new Filter([oSearchFilterWrapper], true);
                }

                catalogs.forEach(function (myCatalog) {
                    myCatalog.getBinding("customTilesContainer").filter(oFilters);
                    myCatalog.getBinding("appBoxesContainer").filter(oFilters);
                });
                this.oView.oCatalogsContainer.bSearchResults = false;

                // Before the filtering - there was a paging mechanism that turned bottom catalogs to invisible
                // Now after filtering - there are new AllocatedUnits, so we send them to
                this.oView.oCatalogsContainer.applyPagingCategoryFilters(this.oView.oCatalogsContainer.nAllocatedUnits, this.categoryFilter);
                this.bSearchResults = this.oView.oCatalogsContainer.bSearchResults;

                this.oView.splitApp.toDetail(that.getView()._calculateDetailPageId());

                this.resetPage = false;
            } else {
                this.oView.oCatalogsContainer.applyPagingCategoryFilters(this.oView.oCatalogsContainer.nAllocatedUnits, this.categoryFilter);
            }
            var sPageName = this.getView()._calculateDetailPageId();
            this.oView.splitApp.toDetail(sPageName);
        },

        _handleAppFinderWithDocking: function () {
            // check if docking
            if (jQuery(".sapUshellContainerDocked").length > 0) {
                // 710 is the size of sap.ui.Device.system.phone
                // 1024 docking supported only in L size.
                if (jQuery("#mainShell").width() < 710) {
                    if (window.innerWidth < 1024) {
                        this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible", false);
                        this.oView.splitApp.setMode(SplitAppMode.ShowHideMode);
                    } else {
                        this.oView.splitApp.setMode(SplitAppMode.HideMode);
                        this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible", true);
                    }
                } else {
                    this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible", false);
                    this.oView.splitApp.setMode(SplitAppMode.ShowHideMode);
                }
            }
        },

        _restoreSelectedMasterItem: function () {
            var oCatalogsList = this.oView.splitApp.getMasterPage("catalogSelect");
            var oOrigSelectedListItem = Core.byId(this.selectedCategoryId);

            if (oOrigSelectedListItem) {
                this.categoryFilter = oOrigSelectedListItem.getTitle();
            }
            oCatalogsList.setSelectedItem(oOrigSelectedListItem);
        },

        handleToggleButtonModelChanged: function () {
            var bButtonVisible = this.oSubHeaderModel.getProperty("/openCloseSplitAppButtonVisible");
            var bButtonToggled = this.oSubHeaderModel.getProperty("/openCloseSplitAppButtonToggled");

            // if there was a change in the boolean toggled flag
            // (this can be called via update to subheader model from AppFinder, in such a case we do not need to switch the views)
            if ((bButtonToggled !== this.bCurrentButtonToggled) && bButtonVisible) {
                // for device which is not a Phone
                if (!Device.system.phone) {
                    if (bButtonToggled && !this.oView.splitApp.isMasterShown()) {
                        this.oView.splitApp.showMaster();
                    } else if (this.oView.splitApp.isMasterShown()) {
                        this.oView.splitApp.hideMaster();
                    }
                    // for Phone the split app is behaving differently
                } else if (this.oView.splitApp.isMasterShown()) {
                    // calculate the relevant detailed page to nav to
                    var oDetail = Core.byId(this.getView()._calculateDetailPageId());
                    this.oView.splitApp.toDetail(oDetail);
                } else if (bButtonToggled) {
                    // go to master
                    var oCatalogSelectMaster = Core.byId("catalogSelect");
                    this.oView.splitApp.toMaster(oCatalogSelectMaster, "show");
                }
            }

            this.bCurrentButtonToggled = bButtonToggled;
        },

        _handleCatalogListItemPress: function (oEvent) {
            this.onCategoryFilter(oEvent);
            // eliminate the Search and Tag mode.
            if (this.oSubHeaderModel.getProperty("/search/searchTerm") !== "") {
                this.oSubHeaderModel.setProperty("/search/searchMode", true);
            }

            // on phone, we must make sure the toggle button gets untoggled on every navigation in the master page
            if (Device.system.phone || Device.system.tablet) {
                this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled", !this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled"));
            }
        },

        onCategoryFilter: function (oEvent) {
            var oMasterList = oEvent.getSource();
            var oSelectedCatalog = oMasterList.getSelectedItem();
            var oSelectedCatalogBindingCtx = oSelectedCatalog.getBindingContext();
            var oModel = oSelectedCatalogBindingCtx.getModel();
            if (oModel.getProperty("static", oSelectedCatalogBindingCtx)) { // show all categories
                oModel.setProperty("/showCatalogHeaders", true);
                this.setCategoryFilter();
                this.selectedCategoryId = undefined;
                this.categoryFilter = undefined;
            } else { // filter to category
                oModel.setProperty("/showCatalogHeaders", false);
                this.setCategoryFilter(window.encodeURIComponent(oSelectedCatalog.getBindingContext().getObject().title));
                this.categoryFilter = oSelectedCatalog.getTitle();
                this.selectedCategoryId = oSelectedCatalog.getId();
            }
        },

        onTileAfterRendering: function (oEvent) {
            var oTileElement = oEvent.oSource.getDomRef();
            if (oTileElement) {
                var aGenericTileElements = oTileElement.getElementsByClassName("sapMGT");
                for (var i = 0; i < aGenericTileElements.length; i++) {
                    aGenericTileElements[i].setAttribute("tabindex", "-1");
                }
            }
        },

        catalogTilePress: function (/*oController*/) {
            Core.getEventBus().publish("launchpad", "catalogTileClick");
        },

        onAppBoxPressed: function (oEvent) {
            var oAppBox = oEvent.getSource();
            var oTile = oAppBox.getBindingContext().getObject();
            var fnPressHandler;
            if (oEvent.mParameters.srcControl.$().closest(".sapUshellPinButton").length) {
                return;
            }

            fnPressHandler = this.oLaunchPageService.getAppBoxPressHandler(oTile);

            if (fnPressHandler) {
                fnPressHandler(oTile);
            } else {
                var sUrl = oAppBox.getProperty("url");

                if (sUrl && sUrl.indexOf("#") === 0) {
                    hasher.setHash(sUrl);
                } else {
                    // add the URL to recent activity log
                    var bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
                    if (bLogRecentActivity) {
                        var oRecentEntry = {
                            title: oAppBox.getProperty("title"),
                            appType: AppType.URL,
                            url: sUrl,
                            appId: sUrl
                        };
                        sap.ushell.Container.getRenderer("fiori2").logRecentActivity(oRecentEntry);
                    }

                    WindowUtils.openURL(sUrl, "_blank");
                }
            }
        },

        /**
         * Event handler triggered if tile should be added to the default group.
         *
         * @param {sap.ui.base.Event} oEvent the event object.
         *   It is expected that the binding context of the event source points to the tile to add.
         */
        onTilePinButtonClick: function (oEvent) {
            var oLaunchPageService = this.oLaunchPageService;
            var oDefaultGroupPromise = oLaunchPageService.getDefaultGroup();

            oDefaultGroupPromise.done(function (oDefaultGroup) {
                var oButton = oEvent.getSource();
                var oSourceContext = oButton.getBindingContext();
                var oModel = this.getView().getModel();
                var sGroupModelPath = oModel.getProperty("/groupContext/path");

                // Check if the catalog was opened in the context of a group, according to the groupContext ("/groupContext/path") in the model
                if (sGroupModelPath) {
                    this._handleTileFooterClickInGroupContext(oSourceContext, sGroupModelPath);

                    // If the catalog wasn't opened in the context of a group - the action of clicking a catalog tile should open the groups popover
                } else {
                    var aGroups = oModel.getProperty("/groups");
                    var oCatalogTile = this.getCatalogTileDataFromModel(oSourceContext);
                    var aTileGroups = oCatalogTile.tileData.associatedGroups;
                    var aGroupsInitialState = [];

                    var aRefinedGroups = aGroups.map(function (group) {
                        // Get the group's real ID
                        var sGroupId = oLaunchPageService.getGroupId(group.object);
                        // Check if the group (i.e. real group ID) exists in the array of groups that contain the relevant Tile
                        // if so - the check box that represents this group should be initially selected
                        var bSelected = !((aTileGroups && Array.prototype.indexOf.call(aTileGroups, sGroupId) === -1));

                        // Add the group to the array that keeps the groups initial state mainly whether or not the group included the relevant tile
                        aGroupsInitialState.push({
                            id: sGroupId,
                            title: this._getGroupTitle(oDefaultGroup, group.object),
                            selected: bSelected
                        });

                        return {
                            selected: bSelected,
                            initiallySelected: bSelected,
                            oGroup: group
                        };
                    }.bind(this));

                    // @TODO: Instead of the jQuery, we should maintain the state of the popover (i.e. opened/closed)
                    // using the afterOpen and afterClose events of sap.m.ResponsivePopover
                    var sTileTitle;
                    sTileTitle = oLaunchPageService.getCatalogTilePreviewTitle(oModel.getProperty(oSourceContext.sPath).src);

                    if (!sTileTitle) {
                        sTileTitle = oLaunchPageService.getCatalogTileTitle(oModel.getProperty(oSourceContext.sPath).src);
                    }

                    this.pPopoverView = View.create({
                        id: "sapUshellGroupsPopover",
                        viewName: "module:sap/ushell/components/appfinder/GroupListPopoverView",
                        viewData: {
                            title: sTileTitle,
                            enableHideGroups: oModel.getProperty("/enableHideGroups"),
                            enableHelp: oModel.getProperty("/enableHelp"),
                            sourceContext: oSourceContext,
                            catalogModel: this.getView().getModel(),
                            catalogController: this
                        }
                    }).then(function (GroupListPopover) {
                        GroupListPopover.getController().initializeData({
                            groupData: aRefinedGroups
                        });
                        GroupListPopover
                            .open(oButton)
                            .then(this._handlePopoverResponse.bind(this, oSourceContext, oCatalogTile));

                        this.getView().addDependent(GroupListPopover);
                        return GroupListPopover;
                    }.bind(this));
                }
            }.bind(this));
        },

        _getGroupTitle: function (oDefaultGroup, oGroupObject) {
            var oLaunchPageService = this.oLaunchPageService;
            var sTitle;

            // check if is it a default group- change title to "my home".
            if (oDefaultGroup && (oLaunchPageService.getGroupId(oDefaultGroup) === oLaunchPageService.getGroupId(oGroupObject))) {
                sTitle = resources.i18n.getText("my_group");
            } else {
                sTitle = oLaunchPageService.getGroupTitle(oGroupObject);
            }

            return sTitle;
        },

        _handlePopoverResponse: function (oSourceContext, catalogTile, responseData) {
            if (!responseData.addToGroups.length && !responseData.newGroups.length && !responseData.removeFromGroups.length) {
                return;
            }

            var oModel = this.getView().getModel();
            var aGroups = oModel.getProperty("/groups");
            var aPromises = [];

            responseData.addToGroups.forEach(function (group) {
                var iIndex = aGroups.indexOf(group);
                var oGroupContext = new Context(oModel, "/groups/" + iIndex);

                aPromises.push(this._addTile(oSourceContext, oGroupContext));
            }.bind(this));

            responseData.removeFromGroups.forEach(function (group) {
                var sTileCatalogId = oSourceContext.getModel().getProperty(oSourceContext.getPath()).id;
                var iIndex = aGroups.indexOf(group);

                aPromises.push(this._removeTile(sTileCatalogId, iIndex));
            }.bind(this));

            responseData.newGroups.forEach(function (group) {
                var sNewGroupName = (group.length > 0) ? group : resources.i18n.getText("new_group_name");

                aPromises.push(this._createGroupAndSaveTile(oSourceContext, sNewGroupName));
            }.bind(this));

            jQuery.when.apply(jQuery, aPromises).then(function () {
                var aResults = Array.prototype.slice.call(arguments); // Make array-like arguments a real array

                this._handlePopoverGroupsActionPromises(catalogTile, responseData, aResults);
            }.bind(this));
        },

        _handlePopoverGroupsActionPromises: function (catalogTile, popoverResponse, resultList) {
            var aErrors = resultList.filter(function (result) {
                return !result.status;
            });

            if (aErrors.length) {
                var oErrorMessageObj = this.prepareErrorMessage(aErrors, catalogTile.tileData.title);
                var oCatalogsManager = CatalogsManager.prototype.getInstance();

                oCatalogsManager.resetAssociationOnFailure(oErrorMessageObj.messageId, oErrorMessageObj.parameters);

                return;
            }

            var aTileGroupIds = [];
            var oLaunchPageService = this.oLaunchPageService;
            popoverResponse.allGroups.forEach(function (group) {
                if (group.selected) {
                    var sGroupId = oLaunchPageService.getGroupId(group.oGroup.object);

                    aTileGroupIds.push(sGroupId);
                }
            });

            var oModel = this.getView().getModel();
            if (popoverResponse.newGroups.length) {
                var aDashboardGroups = oModel.getProperty("/groups");
                var aNewDashboardGroups = aDashboardGroups.slice(aDashboardGroups.length - popoverResponse.newGroups.length);

                aNewDashboardGroups.forEach(function (newGroup) {
                    var sGroupId = oLaunchPageService.getGroupId(newGroup.object);

                    aTileGroupIds.push(sGroupId);
                });
            }

            oModel.setProperty(catalogTile.bindingContextPath + "/associatedGroups", aTileGroupIds);

            var sFirstAddedGroupTitle = popoverResponse.addToGroups[0] ? popoverResponse.addToGroups[0].title : "";
            if (sFirstAddedGroupTitle.length === 0 && popoverResponse.newGroups.length) {
                sFirstAddedGroupTitle = popoverResponse.newGroups[0];
            }

            var sFirstRemovedGroupTitle = popoverResponse.removeFromGroups[0] ? popoverResponse.removeFromGroups[0].title : "";
            var iAddedGroups = popoverResponse.addToGroups.length + popoverResponse.newGroups.length;
            var iRemovedGroups = popoverResponse.removeFromGroups.length;
            var sDetailedMessage = this.prepareDetailedMessage(catalogTile.tileData.title, iAddedGroups, iRemovedGroups, sFirstAddedGroupTitle, sFirstRemovedGroupTitle);
            MessageToast.show(sDetailedMessage, {
                duration: 3000, // default
                width: "15em",
                my: "center bottom",
                at: "center bottom",
                of: window,
                offset: "0 -50",
                collision: "fit fit"
            });
        },

        _getCatalogTileIndexInModel: function (oSourceContext) {
            var sTilePath = oSourceContext.sPath;
            var aTilePathParts = sTilePath.split("/");
            var iTileIndex = aTilePathParts[aTilePathParts.length - 1];

            return iTileIndex;
        },

        _handleTileFooterClickInGroupContext: function (oSourceContext, sGroupModelPath) {
            var oLaunchPageService = this.oLaunchPageService;
            var oModel = this.getView().getModel();
            var oCatalogTile = this.getCatalogTileDataFromModel(oSourceContext);
            var aAssociatedGroups = oCatalogTile.tileData.associatedGroups;
            var oGroupModel = oModel.getProperty(sGroupModelPath); // Get the model of the group according to the group's model path (e.g. "groups/4")
            var sGroupId = oLaunchPageService.getGroupId(oGroupModel.object);
            var iCatalogTileInGroup = aAssociatedGroups ? Array.prototype.indexOf.call(aAssociatedGroups, sGroupId) : -1;
            var sTilePath = oCatalogTile.bindingContextPath;

            if (oCatalogTile.isBeingProcessed) {
                return;
            }

            oModel.setProperty(sTilePath + "/isBeingProcessed", true);

            var oTileOperationPromise;
            var bTileAdded;

            if (iCatalogTileInGroup === -1) {
                var oGroupContext = new Context(oSourceContext.getModel(), sGroupModelPath);
                oTileOperationPromise = this._addTile(oSourceContext, oGroupContext);
                bTileAdded = true;
            } else {
                var sTileCatalogId = oSourceContext.getModel().getProperty(oSourceContext.getPath("id"));
                var iGroupIndex = parseInt(sGroupModelPath.split("/")[2], 10);
                oTileOperationPromise = this._removeTile(sTileCatalogId, iGroupIndex);
                bTileAdded = false;
            }

            oTileOperationPromise.done(function (data) {
                if (data.status) {
                    this._groupContextOperationSucceeded(oSourceContext, oCatalogTile, oGroupModel, bTileAdded);
                } else {
                    this._groupContextOperationFailed(oCatalogTile, oGroupModel, bTileAdded);
                }
            }.bind(this));

            oTileOperationPromise.always(function () {
                oModel.setProperty(sTilePath + "/isBeingProcessed", false);
            });
        },

        /**
         * Handles success of add/remove tile action in group context.
         * Updates the model and shows an appropriate message to the user.
         *
         * @param {object} oSourceContext oSourceContext
         * @param {object} oCatalogTileModel - The catalog tile model from /catalogTiles array
         * @param {object} oGroupModel - The model of the relevant group
         * @param {boolean} bTileAdded - Whether the performed action is adding or removing the tile to/from the group
         */
        _groupContextOperationSucceeded: function (oSourceContext, oCatalogTileModel, oGroupModel, bTileAdded) {
            var oLaunchPageService = this.oLaunchPageService;
            var sGroupId = oLaunchPageService.getGroupId(oGroupModel.object);
            var aAssociatedGroups = oCatalogTileModel.tileData.associatedGroups;
            var sDetailedMessage;

            // Check if this is an "add tile to group" action
            if (bTileAdded) {
                // Update the associatedGroups array of the catalog tile
                aAssociatedGroups.push(sGroupId);

                // Update the model of the catalog tile with the updated associatedGroups
                oSourceContext.getModel().setProperty(oCatalogTileModel.bindingContextPath + "/associatedGroups", aAssociatedGroups);

                sDetailedMessage = this.prepareDetailedMessage(oCatalogTileModel.tileData.title, 1, 0, oGroupModel.title, "");
            } else {
                // If this is a "remove tile from group" action

                // Update the associatedGroups array of the catalog tile
                for (var i = 0; i < aAssociatedGroups.length; i++) {
                    if (aAssociatedGroups[i] === sGroupId) {
                        aAssociatedGroups.splice(i, 1);
                        break;
                    }
                }

                // Update the model of the catalog tile with the updated associatedGroups
                oSourceContext.getModel().setProperty(oCatalogTileModel.bindingContextPath + "/associatedGroups", aAssociatedGroups);
                sDetailedMessage = this.prepareDetailedMessage(oCatalogTileModel.tileData.title, 0, 1, "", oGroupModel.title);
            }

            MessageToast.show(sDetailedMessage, {
                duration: 3000, // default
                width: "15em",
                my: "center bottom",
                at: "center bottom",
                of: window,
                offset: "0 -50",
                collision: "fit fit"
            });
        },

        /**
         * Handles failure of add/remove tile action in group context.
         * Shows an appropriate message to the user.
         * Don't need to reload the groups model, because groups update only after success API call.
         *
         * @param {object} oCatalogTileModel - The catalog tile model from /catalogTiles array
         * @param {object} oGroupModel - The model of the relevant group
         * @param {boolean} bTileAdded - Whether the performed action is adding or removing the tile to/from the group
         */
        _groupContextOperationFailed: function (oCatalogTileModel, oGroupModel, bTileAdded) {
            var catalogsMgr = CatalogsManager.prototype.getInstance();
            var oErrorMessage;

            if (bTileAdded) {
                oErrorMessage = resources.i18n.getText({ messageId: "fail_tile_operation_add_to_group", parameters: [oCatalogTileModel.tileData.title, oGroupModel.title] });
            } else {
                oErrorMessage = resources.i18n.getText({ messageId: "fail_tile_operation_remove_from_group", parameters: [oCatalogTileModel.tileData.title, oGroupModel.title] });
            }

            catalogsMgr.notifyOnActionFailure(oErrorMessage.messageId, oErrorMessage.parameters);
        },

        prepareErrorMessage: function (aErroneousActions, sTileTitle) {
            var sFirstErroneousAddGroup;
            var sFirstErroneousRemoveGroup;
            var sMessage;
            var iNumberOfFailAddActions = 0;
            var iNumberOfFailDeleteActions = 0;
            var bCreateNewGroupFailed = false;

            for (var sKey in aErroneousActions) {
                // Get the data of the error (i.e. action name and group object)

                var oGroup = aErroneousActions[sKey].group;
                var sAction = aErroneousActions[sKey].action;

                if (sAction === "add") {
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions === 1) {
                        sFirstErroneousAddGroup = oGroup.title;
                    }
                } else if (sAction === "remove") {
                    iNumberOfFailDeleteActions++;
                    if (iNumberOfFailDeleteActions === 1) {
                        sFirstErroneousRemoveGroup = oGroup.title;
                    }
                } else if (sAction === "addTileToNewGroup") {
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions === 1) {
                        sFirstErroneousAddGroup = oGroup.title;
                    }
                } else {
                    bCreateNewGroupFailed = true;
                }
            }
            // First - Handle bCreateNewGroupFailed
            if (bCreateNewGroupFailed) {
                if (aErroneousActions.length === 1) {
                    sMessage = resources.i18n.getText({ messageId: "fail_tile_operation_create_new_group" });
                } else {
                    sMessage = resources.i18n.getText({ messageId: "fail_tile_operation_some_actions" });
                }
                // Single error - it can be either one add action or one remove action
            } else if (aErroneousActions.length === 1) {
                if (iNumberOfFailAddActions) {
                    sMessage = resources.i18n.getText({ messageId: "fail_tile_operation_add_to_group", parameters: [sTileTitle, sFirstErroneousAddGroup] });
                } else {
                    sMessage = resources.i18n.getText({ messageId: "fail_tile_operation_remove_from_group", parameters: [sTileTitle, sFirstErroneousRemoveGroup] });
                }
                // Many errors (iErrorCount > 1) - it can be several remove actions, or several add actions, or a mix of both
            } else if (iNumberOfFailDeleteActions === 0) {
                sMessage = resources.i18n.getText({ messageId: "fail_tile_operation_add_to_several_groups", parameters: [sTileTitle] });
            } else if (iNumberOfFailAddActions === 0) {
                sMessage = resources.i18n.getText({ messageId: "fail_tile_operation_remove_from_several_groups", parameters: [sTileTitle] });
            } else {
                sMessage = resources.i18n.getText({ messageId: "fail_tile_operation_some_actions" });
            }
            return sMessage;
        },

        prepareDetailedMessage: function (tileTitle, numberOfAddedGroups, numberOfRemovedGroups, firstAddedGroupTitle, firstRemovedGroupTitle) {
            var sMessage;

            if (numberOfAddedGroups === 0) {
                if (numberOfRemovedGroups === 1) {
                    sMessage = resources.i18n.getText("tileRemovedFromSingleGroup", [tileTitle, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    sMessage = resources.i18n.getText("tileRemovedFromSeveralGroups", [tileTitle, numberOfRemovedGroups]);
                }
            } else if (numberOfAddedGroups === 1) {
                if (numberOfRemovedGroups === 0) {
                    sMessage = resources.i18n.getText("tileAddedToSingleGroup", [tileTitle, firstAddedGroupTitle]);
                } else if (numberOfRemovedGroups === 1) {
                    sMessage = resources.i18n.getText("tileAddedToSingleGroupAndRemovedFromSingleGroup", [tileTitle, firstAddedGroupTitle, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    sMessage = resources.i18n.getText("tileAddedToSingleGroupAndRemovedFromSeveralGroups", [tileTitle, firstAddedGroupTitle, numberOfRemovedGroups]);
                }
            } else if (numberOfAddedGroups > 1) {
                if (numberOfRemovedGroups === 0) {
                    sMessage = resources.i18n.getText("tileAddedToSeveralGroups", [tileTitle, numberOfAddedGroups]);
                } else if (numberOfRemovedGroups === 1) {
                    sMessage = resources.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSingleGroup", [tileTitle, numberOfAddedGroups, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    sMessage = resources.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSeveralGroups", [tileTitle, numberOfAddedGroups, numberOfRemovedGroups]);
                }
            }
            return sMessage;
        },

        /**
         * @param {Object} oSourceContext model context
         * @returns {Object} Returns the part of the model that contains the IDs of the groups that contain the relevant Tile
         */
        getCatalogTileDataFromModel: function (oSourceContext) {
            var sBindingCtxPath = oSourceContext.getPath();
            var oModel = oSourceContext.getModel();
            var oTileData = oModel.getProperty(sBindingCtxPath);

            // Return an object containing the Tile in the CatalogTiles Array (in the model) ,its index and whether it's in the middle of add/removal process.
            return {
                tileData: oTileData,
                bindingContextPath: sBindingCtxPath,
                isBeingProcessed: oTileData.isBeingProcessed
            };
        },

        /**
         * Send request to add a tile to a group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param {sap.ui.model.Context} oTileContext the catalog tile to add
         * @param {sap.ui.model.Context} oGroupContext the group where the tile should be added
         * @returns {Object} deferred
         * @private
         */
        _addTile: function (oTileContext, oGroupContext) {
            var oCatalogsManager = CatalogsManager.prototype.getInstance();
            var oDeferred = jQuery.Deferred();
            var oPromise = oCatalogsManager.createTile({
                catalogTileContext: oTileContext,
                groupContext: oGroupContext
            });

            oPromise.done(function (data) {
                oDeferred.resolve(data);
            });

            return oDeferred;
        },

        /**
         * Send request to delete a tile from a group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param {Number} tileCatalogId the id of the tile
         * @param {Number} index the index of the group in the model
         * @returns {Object} deferred
         * @private
         */
        _removeTile: function (tileCatalogId, index) {
            var oCatalogsManager = CatalogsManager.prototype.getInstance();
            var oDeferred = jQuery.Deferred();
            var oPromise = oCatalogsManager.deleteCatalogTileFromGroup({
                tileId: tileCatalogId,
                groupIndex: index
            });

            // The function deleteCatalogTileFromGroup always results in deferred.resolve
            // and the actual result of the action (success/failure) is contained in the data object
            oPromise.done(function (data) {
                oDeferred.resolve(data);
            });

            return oDeferred;
        },

        /**
         * Send request to create a new group and add a tile to this group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param {sap.ui.model.Context} oTileContext the catalog tile to add
         * @param {String} newGroupName the name of the new group where the tile should be added
         * @returns {Object} deferred
         * @private
         */
        _createGroupAndSaveTile: function (oTileContext, newGroupName) {
            var oCatalogsManager = CatalogsManager.prototype.getInstance();
            var oDeferred = jQuery.Deferred();
            var oPromise = oCatalogsManager.createGroupAndSaveTile({
                catalogTileContext: oTileContext,
                newGroupName: newGroupName
            });

            oPromise.done(function (data) {
                oDeferred.resolve(data);
            });

            return oDeferred;
        },

        onExit: function () {
            VisualizationOrganizerHelper.destroy();
            Core.getEventBus().unsubscribe("launchpad", "appFinderWithDocking", this._handleAppFinderWithDocking, this);
            Core.getEventBus().unsubscribe("launchpad", "appFinderAfterNavigate", this._handleAppFinderAfterNavigate, this);
        }
    });
});
