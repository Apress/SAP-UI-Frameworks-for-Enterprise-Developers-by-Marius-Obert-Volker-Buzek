// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ushell/components/shell/SearchCEP/SearchProviders/SearchProvider",
    "sap/ushell/components/shell/SearchCEP/SearchProviders/NavigationSvcSearchProvider",
    "sap/ushell/components/shell/SearchCEP/SearchProviders/FrequentActivityProvider",
    "sap/ushell/components/shell/SearchCEP/SearchProviders/RecentSearchProvider",
    "sap/base/Log",
    "sap/ushell/utils/WindowUtils",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/ushell/utils/UrlParsing",
    "sap/ui/Device",
    "sap/ui/core/Configuration",
    "sap/base/util/UriParameters",
    "sap/ui/core/Core"
], function (
    Controller,
    JSONModel,
    Fragment,
    SearchProvider,
    NavigationSvcSearchProvider,
    FrequentActivityProvider,
    RecentSearchProvider,
    Log,
    WindowUtils,
    jQuery,
    resources,
    UrlParsing,
    Device,
    Configuration,
    UriParameters,
    Core
) {
    "use strict";
    return Controller.extend("sap.ushell.components.shell.SearchCEP.SearchCEP", {

        onInit: function () {
            this._bEscPressed = false;
            this._toggleSearchPopover(false);
            this._oPlaceHolderSF = Core.byId("PlaceHolderSearchField");
            this._oPlaceHolderSF.oParent.getDomRef().firstChild.lastChild.setAttribute("tabindex", "0");
            this._bIsMyHome = false;
            var sPlatform = sap.ushell.Container.getFLPPlatform(true),
                urlParams = UriParameters.fromURL(document.URL);
            this._bOnInit = true;
            this.bNavigateToNewResultPage = urlParams.get("cep-search-result-app") === "true";
            if (sPlatform === "MYHOME") {
                this._bIsMyHome = true;
            }
        },

        onSuggest: function (event) {
            if (this._bEscPressed) {
                return;
            }
            var sUrl = sap.ushell.Container.getFLPUrl(true);
            var sHash = UrlParsing.getHash(sUrl),
                sIntent = sHash.split("&/")[0];

            if (this.bOnNavigationToResultPage === true && (sIntent === "Action-search" || sIntent === "WorkZoneSearchResult-display")) {
                if (this._oPopover.isOpen()) {
                    this._oPopover.close();
                }
                return;
            }
            this.bOnNavigationToResultPage = false;
            var sValue = event.getParameter("suggestValue");
            this.oSF.focus();

            if (this._recentSearchTermSelected === true) {
                this._recentSearchTermSelected = false;
                return;
            }
            if (this.bOpeningPopOver === true && this._oPopover.isOpen() === true) {
                this.bOpeningPopOver = false;
                return;
            }
            this.testProviders(sValue);
        },

        onfocusin: function (event) {
            if (this.oSF.getEnableSuggestions() && Device.system.phone) {
                // eslint-disable-next-line no-undef
                jQuery(this.oSF.getDomRef()).find("input").attr("inputmode", "search");
                // eslint-disable-next-line no-undef
                jQuery(this._oPlaceHolderSF.getDomRef()).find("input").attr("inputmode", "search");
            }
        },

        getHomePageApps: function () {
            var that = this;
            NavigationSvcSearchProvider.execSearch().then(function (oResult) {
                var sGroupName = "homePageApplications";
                if (Array.isArray(oResult[sGroupName]) && oResult[sGroupName].length > 0) {
                    that.oProducts = oResult[sGroupName].slice(0, 12);
                }
            });
        },

        getScreenSize: function () {
            var oScreenSize = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
            if (oScreenSize.from >= 1440) {
                return "XL";
            } else if (oScreenSize.from >= 1024) {
                return "L";
            } else if (oScreenSize.from >= 600) {
                return "M";
            } else if (oScreenSize.from >= 0) {
                return "S";
            }
        },

        onSearch: function (event) {
            if (this._bEscPressed) {
                return;
            }
            var sSearchTerm = event.getParameter("query"),
                bClearButtonPressed = event.getParameter("clearButtonPressed");
            if (bClearButtonPressed === true) {
                this.oSF.setValue("");
                this._oPlaceHolderSF.setValue("");
                this.bOpeningPopOver = false;
                this.testProviders();
                if (this._oSearchHistoryList.getItems().length === 0 && this._oFrequentlyUsedAppsList.getItems().length === 0 && this._oProductsList.getItems().length === 0) {
                    this._oPopover.close();
                }
                return;
            }

            if (sSearchTerm) {
                // sync inputs in case esc was pressed and value was entered, cleared and another one entered
                this._oPlaceHolderSF.setValue(this.oSF.getValue());

                this._saveSearchTerm(sSearchTerm);
                if (this._bIsMyHome === true) {
                    if (this._oSearchResultList.getItems().length > 0) {
                        this._oSearchResultList.getItems()[0].focus();
                        var sBindingContext = "searchResults";
                        var sSemanticObject = this._oSearchResultList.getItems()[0].getBindingContext(sBindingContext).getObject().semanticObject;
                        var sAction = this._oSearchResultList.getItems()[0].getBindingContext(sBindingContext).getObject().semanticObjectAction;
                        this._navigateApp(sSemanticObject, sAction);
                    }
                } else {
                    this._navigateToResultPage(sSearchTerm);
                }
            }
        },

        onBeforeOpen: function () {
            this._oPopover.addStyleClass("sapUshellCEPSearchFieldPopover");
            var sSearchState = Core.byId("shell-header").getSearchState();
            var bCollapse = false;
            if (sSearchState === "COL") {
                bCollapse = true;
            }
            Core.byId("shell-header").setSearchState("EXP", 35, false); // intermediate state to force shell to show overlay
            Core.byId("shell-header").setSearchState("EXP_S", 35, true);
            if (bCollapse === true) {
                Core.byId("shell-header").setSearchState("COL", 35, false);
            }
        },

        onAfterOpen: function () {
            if (Core.byId("SearchHistoryList-trigger")) {
                Core.byId("SearchHistoryList-trigger").addEventDelegate({
                    onkeydown: this._keyDownSearchHistoryListMoreTrigger.bind(this),
                    onmousedown: this._mouseDownSearchHistoryListMoreTrigger.bind(this)
                });
            }
            if (Core.byId("FrequentlyUsedAppsList-trigger")) {
                Core.byId("FrequentlyUsedAppsList-trigger").addEventDelegate({
                    onkeydown: this._keyDownFrequentlyUsedAppsListMoreTrigger.bind(this)
                });
            }
            if (Core.byId("ProductsList-trigger")) {
                Core.byId("ProductsList-trigger").addEventDelegate({
                    onkeydown: this._keyDownProductsListMoreTrigger.bind(this)
                });
            }

            // set handlers for screen reader to announce relevant list name
            if (this._oFrequentlyUsedAppsList.getItems().length > 0) {
                this._oFrequentlyUsedAppsList.getItems()[0].addEventDelegate({
                    onkeyup: this._keyUpFrequentlyUsedAppsListMoreTrigger.bind(this)
                });
            }
            if (this._oProductsList.getItems().length > 0) {
                this._oProductsList.getItems()[0].addEventDelegate({
                    onkeyup: this._keyUpProductsListMoreTrigger.bind(this)
                });
            }

            var nPlaceHolderSFHeight = document.getElementById("PlaceHolderSearchField").clientHeight;
            document.getElementById("CEPSearchField").style.height = nPlaceHolderSFHeight + "px";

            // add tooltip to CEP Search icon
            jQuery(this.oSF.getDomRef()).find("#CEPSearchField-search").attr("title", resources.i18n.getText("search"));
        },

        onAfterClose: function () {
            this._oPlaceHolderSF.setValue(this.oSF.getValue());
            if (this._bEscPressed) {
                this._bEscPressed = false;
                this._oPlaceHolderSF.focus();
            }

            var sScreenSize = this.getScreenSize();
            if (sScreenSize !== "XL" && this.oSF.getValue() === "") {
                Core.byId("shell-header").setSearchState("COL", 35, false);
                Core.byId("sf").setVisible();
            } else {
                Core.byId("shell-header").setSearchState("EXP", 35, false); // intermediate state to force shell to disable overlay
                Core.byId("shell-header").setSearchState("EXP_S", 35, false);
            }
        },

        onGrowingStarted: function (event) {
            var nActualItems = event.getParameter("actual");
            if (nActualItems > 0) {
                this._oSearchHistoryList.setGrowingThreshold(8);
            }
        },

        onGrowingFinishedResults: function () {
            this._boldResults(this._oSearchResultList, this.oSF.getValue());
        },

        onExit: function () {
        },

        testProviders: function (sQuery) {
            var arrProviders,
                idx,
                that = this,
                bIsSearch = false,
                bRecentActivity = false;
            if (sQuery !== undefined && sQuery !== "" && sQuery.trim().length !== 0) {
                this._setListsVisible(false, this._oSearchHistoryList);
                this._setListsVisible(false, this._oFrequentlyUsedAppsList);
                this._setListsVisible(false, this._oProductsList);
                arrProviders = [NavigationSvcSearchProvider];
                bIsSearch = true;
            } else {
                this._setListsVisible(false, this._oSearchResultList);
                this._setListsVisible(false, this._oExternalSearchResultList);
                if (this._bOnInit !== true) {
                    arrProviders = [FrequentActivityProvider, RecentSearchProvider];
                    if (this._oProductsList.getItems().length > 0) {
                        this._setListsVisible(true, this._oProductsList);
                        bRecentActivity = true;
                    }
                } else {
                    if (Array.isArray(this.oProducts) && this.oProducts.length > 0) {
                        bRecentActivity = true;
                        this._setListsVisible(true, this._oProductsList);
                        this._oProductsList.setModel(new JSONModel(this.oProducts), "productsResults");
                        arrProviders = [FrequentActivityProvider, RecentSearchProvider];
                    } else {
                        arrProviders = [NavigationSvcSearchProvider, FrequentActivityProvider, RecentSearchProvider];
                    }
                    this._bOnInit = false;
                }
            }
            for (idx = 0; idx < arrProviders.length; idx++) {
                (function (oProvider) {
                    oProvider.execSearch(sQuery).then(function (oResult) {
                        for (var groupId in SearchProvider.GROUP_TYPE) {
                            var sGroupName = SearchProvider.GROUP_TYPE[groupId];
                            if (Array.isArray(oResult[sGroupName]) && oResult[sGroupName].length > 0) {
                                if (sGroupName === "recentSearches") {
                                    bRecentActivity = true;
                                    that._setListsVisible(true, that._oSearchHistoryList);
                                    that._oSearchHistoryList.setGrowingThreshold(2);
                                    that._oSearchHistoryList.setModel(new JSONModel(oResult[sGroupName].slice(0, 10)), "searchTerms");
                                } else if (sGroupName === "frequentApplications") {
                                    bRecentActivity = true;
                                    that._setListsVisible(true, that._oFrequentlyUsedAppsList);
                                    that._oFrequentlyUsedAppsList.setModel(new JSONModel(oResult[sGroupName].slice(0, 12)), "freqUsedApps");
                                } else if (bIsSearch !== true && sGroupName === "homePageApplications") {
                                    bRecentActivity = true;
                                    that._setListsVisible(true, that._oProductsList);
                                    that._oProductsList.setModel(new JSONModel(oResult[sGroupName].slice(0, 12)), "productsResults");
                                } else if (bIsSearch === true && sGroupName === "applications") {
                                    that._setListsVisible(true, that._oSearchResultList);
                                    that._oSearchResultList.setModel(new JSONModel(oResult[sGroupName].slice(0, 12)), "searchResults");
                                    that._applyResultsAcc(oResult[sGroupName].length);
                                    setTimeout(function () {
                                        that._boldResults(that._oSearchResultList, sQuery);
                                        if (Core.byId("SearchResultList-trigger")) {
                                            Core.byId("SearchResultList-trigger").addEventDelegate({
                                                onkeydown: that._keyDownSearchResultListMoreTrigger.bind(that)
                                            });
                                        }
                                    }, 50);
                                } else if (bIsSearch === true && sGroupName === "externalSearchApplications") {
                                    that._setListsVisible(true, that._oExternalSearchResultList);
                                    that._oExternalSearchResultList.setModel(new JSONModel(oResult[sGroupName].slice(0, 12)), "externalSearchResults");
                                }
                                if (!that._oPopover.isOpen() && (bRecentActivity === true || bIsSearch === true)) {
                                    that._toggleSearchPopover(true);
                                }
                                that.oSF.focus();
                            } else if (!that._oPopover.isOpen() && bRecentActivity === true && that._oProductsList.getItems().length > 0) {
                                that._toggleSearchPopover(true);
                            } else if (bIsSearch === true && sGroupName === "applications") {
                                if (!oResult[sGroupName] || oResult[sGroupName].length === 0) {
                                    that._setListsVisible(true, that._oSearchResultList);
                                    that._oSearchResultList.setModel(new JSONModel({}), "searchResults");
                                    that._applyResultsAcc(0);
                                    var sNoResults = resources.i18n.getText("no_apps_found", [sQuery]);
                                    that._oSearchResultList.setNoDataText(sNoResults);
                                    if (!that._oPopover.isOpen()) {
                                        that._toggleSearchPopover(true);
                                    }
                                }
                            }
                        }
                    });
                })(arrProviders[idx]);
            }
        },

        _applyResultsAcc: function (iNumOfItems) {
            var sAriaText = "";
            // add items to list
            if (iNumOfItems === 1) {
                sAriaText = resources.i18n.getText("one_result_search_aria", iNumOfItems);
            } else if (iNumOfItems > 1) {
                sAriaText = resources.i18n.getText("multiple_results_search_aria", iNumOfItems);
            } else {
                sAriaText = resources.i18n.getText("no_results_search_aria");
            }
            // update Accessibility text for suggestion
            this.oSF.$("SuggDescr").text(sAriaText);
        },

        _boldResults: function (oList, sQuery) {
            var oItems = oList.getItems(),
                inputText = oList.$().find(".sapMSLITitleOnly");
            jQuery.each(inputText, function (i) {
                var sTitle = oItems[i].getTitle(),
                    reg = new RegExp(sQuery, 'gi');
                var sBoldTitle = sTitle;
                sBoldTitle = sBoldTitle.replace(reg, function (str) {
                    return '</b>' + str + '<b>';
                });
                sBoldTitle = '<b>' + sBoldTitle + '</b>';
                inputText[i].innerHTML = sBoldTitle;
            });
        },

        _toggleSearchPopover: function (bOpen) {
            if (!this._oPopover) {
                Fragment.load({
                    name: "sap.ushell.components.shell.SearchCEP.SearchFieldFragment",
                    type: "XML",
                    controller: this
                }).then(function (popover) {
                    this._oPopover = popover;
                    var sScreenSize = this.getScreenSize();
                    var nPlaceHolderSFWidth = document.getElementById("PlaceHolderSearchField").clientWidth;
                    if (sScreenSize === "S") {
                        nPlaceHolderSFWidth = 1.1 * nPlaceHolderSFWidth;
                    } else {
                        nPlaceHolderSFWidth = 1.05 * nPlaceHolderSFWidth;
                    }
                    this._oPopover.setContentWidth(nPlaceHolderSFWidth + "px");
                    if (Configuration.getRTL() === true) {
                        var nOffsetX = this._oPopover.getOffsetX();
                        this._oPopover.setOffsetX(-1 * nOffsetX);
                    }

                    this._initializeSearchField();
                    this._initializeSearchHistoryList();
                    this._initializeFrequentlyUsedAppsList();
                    this._initializeSearchResultList();
                    this._initializeProductsList();
                    this._initializeExternalSearchResultList();
                    if (!Device.support.touch) {
                        this._sContentDensityClass = "sapUiSizeCompact";
                    } else {
                        this._sContentDensityClass = "sapUiSizeCozy";
                    }
                    this._oSearchHistoryList.addStyleClass(this._sContentDensityClass);
                    this._oFrequentlyUsedAppsList.addStyleClass(this._sContentDensityClass);
                    this._oSearchResultList.addStyleClass(this._sContentDensityClass);
                    this._oProductsList.addStyleClass(this._sContentDensityClass);
                    this._oExternalSearchResultList.addStyleClass(this._sContentDensityClass);
                    this.testProviders();
                    this._toggleSearchPopover(bOpen);
                }.bind(this));
            } else if (bOpen) {
                this._oPopover.openBy(this._oPlaceHolderSF);
                this.bOpeningPopOver = true;
                if (this._oPlaceHolderSF.getValue() !== "") {
                    this.oSF.setValue(this._oPlaceHolderSF.getValue());
                }
            }
        },

        _keyDownSearchField: function (event) {
            if (event.code === 40 || event.code === "ArrowDown") {
                this.oSF.focus();
                if (!this._oPopover.isOpen()) {
                    this._toggleSearchPopover(true);
                }
                if (this._oSearchHistoryList.getVisible() === true && this._oSearchHistoryList.getItems().length > 0) {
                    this._oSearchHistoryList.getItems()[0].focus();
                } else if (this._oFrequentlyUsedAppsList.getVisible() === true && this._oFrequentlyUsedAppsList.getItems().length > 0) {
                    this._oFrequentlyUsedAppsList.getItems()[0].focus();
                } else if (this._oProductsList.getVisible() === true && this._oProductsList.getItems().length > 0) {
                    this._oProductsList.getItems()[0].focus();
                } else if (this._oSearchResultList.getVisible() === true && this._oSearchResultList.getItems().length > 0) {
                    this._oSearchResultList.getItems()[0].focus();
                } else if (this._oExternalSearchResultList.getVisible() === true && this._oExternalSearchResultList.getItems().length > 0) {
                    this._oExternalSearchResultList.getItems()[0].focus();
                }
            } else if (event.code === 116 || event.code === "F5") {
                window.location.reload();
            } else if (event.code === 9 || event.code === "Tab") {
                var element;
                if (event.shiftKey) {
                    element = this._oPlaceHolderSF.oParent.getDomRef().firstChild.lastChild.firstChild;
                } else {
                    element = this._oPlaceHolderSF.oParent.getDomRef().lastChild.firstChild;
                    if (element && getComputedStyle(element).display === "none") {
                        element = this._oPlaceHolderSF.oParent.getDomRef().lastChild.firstChild.nextSibling;
                    }
                }
                setTimeout(function () {
                    if (this.getScreenSize() === "S" || this.getScreenSize() === "M") {
                        Core.byId("shell-header").setSearchState("COL", 35, false);
                        Core.byId("sf").setVisible(true);
                    }
                    if (element !== null) {
                        element.focus();
                    }
                }.bind(this), 0);
            } else if (event.code === 27 || event.code === "Escape") {
                this.oSF.setValue("");
                this._oPlaceHolderSF.setValue("");
                this._bEscPressed = true;
            }
        },

        _keyDownSearchHistoryList: function (event) {
            var nNumOfItemsHistoryList = this._oSearchHistoryList.getItems().length;
            if (event.code === 40 || event.code === "ArrowDown") {
                if (nNumOfItemsHistoryList > 0 && this._oSearchHistoryList.getItems()[nNumOfItemsHistoryList - 1] === event.srcControl) {
                    var searchHistoryStyle = window.getComputedStyle(document.getElementById("SearchHistoryList-triggerList"), "");
                    if (searchHistoryStyle.display === "none") {
                        if (this._oFrequentlyUsedAppsList.getVisible() === true && this._oFrequentlyUsedAppsList.getItems().length > 0) {
                            this._oFrequentlyUsedAppsList.getItems()[0].focus();
                        } else if (this._oProductsList.getVisible() === true && this._oProductsList.getItems().length > 0) {
                            this._oProductsList.getItems()[0].focus();
                        }
                    } else {
                        Core.byId("SearchHistoryList-trigger").focus();
                    }
                }
            } else if (event.code === 38 || event.code === "ArrowUp") {
                if (nNumOfItemsHistoryList > 0 && this._oSearchHistoryList.getItems()[0] === event.srcControl) {
                    this.oSF.focus();
                }
            }
        },

        _keyDownFrequentlyUsedAppsList: function (event) {
            var frequentlyUsedStyle,
                nNumOfItemsFreqUsedAppsList = this._oFrequentlyUsedAppsList.getItems().length;
            if (event.code === 40 || event.code === "ArrowDown") {
                if (nNumOfItemsFreqUsedAppsList > 0 && this._oFrequentlyUsedAppsList.getItems()[nNumOfItemsFreqUsedAppsList - 1] === event.srcControl) {
                    frequentlyUsedStyle = window.getComputedStyle(document.getElementById("FrequentlyUsedAppsList-triggerList"), "");
                    if (frequentlyUsedStyle.display === "none") {
                        if (this._oProductsList.getVisible() === true && this._oProductsList.getItems().length > 0) {
                            this._oProductsList.getItems()[0].focus();
                        }
                    } else {
                        Core.byId("FrequentlyUsedAppsList-trigger").focus();
                    }
                }
            } else if (event.code === 38 || event.code === "ArrowUp") {
                if (nNumOfItemsFreqUsedAppsList > 0 && this._oFrequentlyUsedAppsList.getItems()[0] === event.srcControl) {
                    var nNumOfItemsHistoryList = this._oSearchHistoryList.getItems().length;
                    if (this._oSearchHistoryList.getVisible() === true && nNumOfItemsHistoryList > 0) {
                        var sSearchHistoryListStyle = window.getComputedStyle(document.getElementById("SearchHistoryList-triggerList"), "");
                        if (sSearchHistoryListStyle.display === "none") {
                            if (nNumOfItemsHistoryList > 0) {
                                this._oSearchHistoryList.getItems()[nNumOfItemsHistoryList - 1].focus();
                            }
                        } else {
                            Core.byId("SearchHistoryList-trigger").focus();
                        }
                    } else {
                        this.oSF.focus();
                    }
                }
            } else if (event.code === 13 || event.code === "Enter") {
                var sAppId = event.srcControl.getBindingContext("freqUsedApps").getObject().appId;
                var sSemanticObj = sAppId.split("-")[0];
                sSemanticObj = sSemanticObj.split("#")[1];
                var sAction = sAppId.split("-")[1];
                this._navigateApp(sSemanticObj, sAction);
            }
        },

        _keyDownProductsList: function (event) {
            var style,
                nNumOfItemsProducts = this._oProductsList.getItems().length,
                nNumOfItemsFreqUsedApps = this._oFrequentlyUsedAppsList.getItems().length,
                nNumOfItemsHistoryList = this._oSearchHistoryList.getItems().length;
            if (event.code === 40 || event.code === "ArrowDown") {
                if (nNumOfItemsProducts > 0 && this._oProductsList.getItems()[nNumOfItemsProducts - 1] === event.srcControl) {
                    style = window.getComputedStyle(document.getElementById("ProductsList-triggerList"), "");
                    if (style.display !== "none") {
                        Core.byId("ProductsList-trigger").focus();
                    }
                }
            } else if (event.code === 38 || event.code === "ArrowUp") {
                if (nNumOfItemsProducts > 0 && this._oProductsList.getItems()[0] === event.srcControl) {
                    if (this._oFrequentlyUsedAppsList.getVisible() === true && nNumOfItemsFreqUsedApps > 0) {
                        style = window.getComputedStyle(document.getElementById("FrequentlyUsedAppsList-triggerList"), "");
                        if (style.display === "none") {
                            this._oFrequentlyUsedAppsList.getItems()[nNumOfItemsFreqUsedApps - 1].focus();
                        } else {
                            Core.byId("FrequentlyUsedAppsList-trigger").focus();
                        }
                    } else if (this._oSearchHistoryList.getVisible() === true && nNumOfItemsHistoryList > 0) {
                        style = window.getComputedStyle(document.getElementById("SearchHistoryList-triggerList"), "");
                        if (style.display === "none") {
                            this._oSearchHistoryList.getItems()[nNumOfItemsHistoryList - 1].focus();
                        } else {
                            Core.byId("SearchHistoryList-trigger").focus();
                        }
                    } else {
                        this.oSF.focus();
                    }
                }
            } else if (event.code === 13 || event.code === "Enter") {
                this.onProductsPress(event);
            }
        },

        _keyUpFrequentlyUsedAppsListMoreTrigger: function (event) {
            var oCurrentControl = event.srcControl.getDomRef(),
                sHiddenSpanId = oCurrentControl.getAttribute("aria-labelledby"),
                sText = Core.byId(sHiddenSpanId).getProperty("text"),
                sNewText = resources.i18n.getText("frequentAppsCEPSearch");

            jQuery(Core.byId(sHiddenSpanId).getDomRef()).text(sNewText + ". " + sText);
        },

        _keyUpProductsListMoreTrigger: function (event) {
            var oCurrentControl = event.srcControl.getDomRef(),
                sHiddenSpanId = oCurrentControl.getAttribute("aria-labelledby"),
                sText = Core.byId(sHiddenSpanId).getProperty("text"),
                sNewText = resources.i18n.getText("products");

            jQuery(Core.byId(sHiddenSpanId).getDomRef()).text(sNewText + ". " + sText);
        },

        _keyDownSearchHistoryListMoreTrigger: function (event) {
            if (event.code === 40 || event.code === "ArrowDown") {
                if (this._oFrequentlyUsedAppsList.getVisible() === true && this._oFrequentlyUsedAppsList.getItems().length > 0) {
                    this._oFrequentlyUsedAppsList.getItems()[0].focus();
                } else if (this._oProductsList.getVisible() === true && this._oProductsList.getItems().length > 0) {
                    this._oProductsList.getItems()[0].focus();
                }
            } else if (event.code === 38 || event.code === "ArrowUp") {
                var nNumOfItemsHistoryList = this._oSearchHistoryList.getItems().length;
                if (nNumOfItemsHistoryList > 0) {
                    this._oSearchHistoryList.getItems()[nNumOfItemsHistoryList - 1].focus();
                }
            } else if (event.code === 13 || event.code === "Enter") {
                this._oSearchHistoryList.setGrowingThreshold(8);
            }
        },

        _mouseDownSearchHistoryListMoreTrigger: function (event) {
            this._oSearchHistoryList.setGrowingThreshold(8);
        },

        _keyDownFrequentlyUsedAppsListMoreTrigger: function (event) {
            if (event.code === 38 || event.code === "ArrowUp") {
                var nNumOfItemsFreqUsedAppsList = this._oFrequentlyUsedAppsList.getItems().length;
                if (nNumOfItemsFreqUsedAppsList > 0) {
                    this._oFrequentlyUsedAppsList.getItems()[nNumOfItemsFreqUsedAppsList - 1].focus();
                }
            } else if (event.code === 40 || event.code === "ArrowDown") {
                if (this._oProductsList.getVisible() === true && this._oProductsList.getItems().length > 0) {
                    this._oProductsList.getItems()[0].focus();
                }
            }
        },

        _keyDownProductsListMoreTrigger: function (event) {
            if (event.code === 38 || event.code === "ArrowUp") {
                var nNumOfItemsProductsList = this._oProductsList.getItems().length;
                if (nNumOfItemsProductsList > 0) {
                    this._oProductsList.getItems()[nNumOfItemsProductsList - 1].focus();
                }
            }
        },

        _keyDownSearchResultListMoreTrigger: function (event) {
            if (event.code === 38 || event.code === "ArrowUp") {
                var nNumOfItemsSearchResultList = this._oSearchResultList.getItems().length;
                if (nNumOfItemsSearchResultList > 0) {
                    this._oSearchResultList.getItems()[nNumOfItemsSearchResultList - 1].focus();
                }
            } else if (event.code === 40 || event.code === "ArrowDown") {
                if (this._oExternalSearchResultList.getVisible() === true && this._oExternalSearchResultList.getItems().length > 0) {
                    this._oExternalSearchResultList.getItems()[0].focus();
                }
            }
        },

        _keyDownSearchResultList: function (event) {
            var nNumOfItemsSearchResultList = this._oSearchResultList.getItems().length;
            if (event.code === 40 || event.code === "ArrowDown") {
                if (nNumOfItemsSearchResultList > 0 && this._oSearchResultList.getItems()[nNumOfItemsSearchResultList - 1] === event.srcControl) {
                    var style = window.getComputedStyle(document.getElementById("SearchResultList-triggerList"), "");
                    if (style.display !== "none") {
                        Core.byId("SearchResultList-trigger").focus();
                    } else if (this._oExternalSearchResultList.getVisible() === true && this._oExternalSearchResultList.getItems().length > 0) {
                        this._oExternalSearchResultList.getItems()[0].focus();
                    }
                }
            } else if (event.code === 38 || event.code === "ArrowUp") {
                if (nNumOfItemsSearchResultList > 0 && this._oSearchResultList.getItems()[0] === event.srcControl) {
                    this.oSF.focus();
                }
            }
        },

        _keyDownExternalSearchResultList: function (event) {
            var nNumOfItemsExternal = this._oExternalSearchResultList.getItems().length,
                nNumOfAppsResultList = this._oSearchResultList.getItems().length,
                style = "";
            if (event.code === 38 || event.code === "ArrowUp") {
                if (nNumOfItemsExternal > 0 && this._oExternalSearchResultList.getItems()[0] === event.srcControl) {
                    if (this._oSearchResultList.getVisible() === true && nNumOfAppsResultList > 0) {
                        style = window.getComputedStyle(document.getElementById("SearchResultList-triggerList"), "");
                        if (style.display === "none") {
                            this._oSearchResultList.getItems()[nNumOfAppsResultList - 1].focus();
                        } else {
                            Core.byId("SearchResultList-trigger").focus();
                        }
                    } else {
                        this.oSF.focus();
                    }
                }
            }
        },

        _initializeSearchField: function () {
            this.oSF = Core.byId("CEPSearchField");
            var nPlaceHolderSFWidth = document.getElementById("PlaceHolderSearchField").clientWidth;
            this.oSF.setWidth(nPlaceHolderSFWidth + "px");
            this.oSF.addEventDelegate({
                onkeydown: this._keyDownSearchField.bind(this),
                onfocusin: this.onfocusin.bind(this)
            });
        },

        _initializeSearchHistoryList: function () {
            this._oSearchHistoryList = Core.byId("SearchHistoryList");
            this._oSearchHistoryList.addEventDelegate({
                onkeydown: this._keyDownSearchHistoryList.bind(this),
                onsapdown: this._keyDownSearchHistoryList.bind(this)
            });
        },

        _initializeFrequentlyUsedAppsList: function () {
            this._oFrequentlyUsedAppsList = Core.byId("FrequentlyUsedAppsList");
            this._oFrequentlyUsedAppsList.setHeaderText(resources.i18n.getText("frequentAppsCEPSearch"));
            this._oFrequentlyUsedAppsList.addEventDelegate({
                onkeydown: this._keyDownFrequentlyUsedAppsList.bind(this),
                onsapdown: this._keyDownFrequentlyUsedAppsList.bind(this)
            });
        },

        _initializeSearchResultList: function () {
            this._oSearchResultList = Core.byId("SearchResultList");
            this._oSearchResultList.addEventDelegate({
                onkeydown: this._keyDownSearchResultList.bind(this),
                onsapdown: this._keyDownSearchResultList.bind(this)
            });
        },

        _initializeProductsList: function () {
            this._oProductsList = Core.byId("ProductsList");
            this._oProductsList.setHeaderText(resources.i18n.getText("products"));
            this._oProductsList.addEventDelegate({
                onkeydown: this._keyDownProductsList.bind(this),
                onsapdown: this._keyDownProductsList.bind(this)
            });
        },

        _initializeExternalSearchResultList: function () {
            this._oExternalSearchResultList = Core.byId("ExternalSearchAppsList");
            this._oExternalSearchResultList.setHeaderText(resources.i18n.getText("searchWithin"));
            this._oExternalSearchResultList.addEventDelegate({
                onkeydown: this._keyDownExternalSearchResultList.bind(this)
            });
        },

        _saveSearchTerm: function (sTerm) {
            if (sTerm) {
                sap.ushell.Container.getServiceAsync("UserRecents")
                    .then(function (UserRecentsService) {
                        UserRecentsService.addSearchActivity({
                            sTerm: sTerm
                        }).then(function () {
                            return;
                        });
                    });
            }
        },

        onRecentSearchPress: function (event) {
            var searchTerm = event.getParameter("listItem").getProperty("title");
            this._recentSearchTermSelected = true;
            this.oSF.setValue(searchTerm);
            this.testProviders(searchTerm);
        },

        onSearchResultPress: function (event) {
            var sSearchTerm = this.oSF.getValue();
            this._saveSearchTerm(sSearchTerm);
            var sBindingContext = "searchResults";
            var sSemanticObject = event.getParameter("listItem").getBindingContext(sBindingContext).getObject().semanticObject;
            var sAction = event.getParameter("listItem").getBindingContext(sBindingContext).getObject().semanticObjectAction;
            this._navigateApp(sSemanticObject, sAction);
        },

        onProductsPress: function (event) {
            var sSearchTerm = this.oSF.getValue();
            this._saveSearchTerm(sSearchTerm);
            var sBindingContext = "productsResults";
            var sSemanticObject = event.getParameter("listItem").getBindingContext(sBindingContext).getObject().semanticObject;
            var sAction = event.getParameter("listItem").getBindingContext(sBindingContext).getObject().semanticObjectAction;
            this._navigateApp(sSemanticObject, sAction);
        },

        onExternalSearchResultPress: function (event) {
            var sSearchTerm = this.oSF.getValue();
            this._saveSearchTerm(sSearchTerm);
            // Navigate to ES from search within list
            if (event.getParameter("listItem").getBindingContext("externalSearchResults").getObject().isEnterpriseSearch === true) {
                this._navigateToResultPage(sSearchTerm, true);
            } else {
                var sUrl = event.getParameter("listItem").getBindingContext("externalSearchResults").getObject().url;
                if (sUrl !== undefined && sUrl !== null) {
                    this._navigateURL(sUrl);
                }
            }
        },

        onFreqUsedAppsPress: function (event) {
            var sAppId = event.getParameter("listItem").getBindingContext("freqUsedApps").getObject().appId;
            var sSemanticObj = sAppId.split("-")[0];
            sSemanticObj = sSemanticObj.split("#")[1];
            var sAction = sAppId.split("-")[1];
            this._navigateApp(sSemanticObj, sAction);
            if (this._oPopover.isOpen()) {
                this._oPopover.close();
            }
        },

        onFreqUsedProductsPress: function (event) {
            var sAppId = event.getParameter("listItem").getBindingContext("freqUsedProducts").getObject().appId;
            var sSemanticObj = sAppId.split("-")[0];
            sSemanticObj = sSemanticObj.split("#")[1];
            var sAction = sAppId.split("-")[1];
            this._navigateApp(sSemanticObj, sAction);
            if (this._oPopover.isOpen()) {
                this._oPopover.close();
            }
        },

        _setListsVisible: function (bVisible, oList) {
            oList.setVisible(bVisible);
            if (this._oSearchHistoryList.getVisible() === true) {
                if (this._oFrequentlyUsedAppsList.getVisible() === true || this._oProductsList.getVisible() === true) {
                    this._oSearchHistoryList.addStyleClass("sapUshellCEPListDivider");
                }
            }
            if (this._oFrequentlyUsedAppsList.getVisible() === true) {
                if (this._oProductsList.getVisible() === true) {
                    this._oFrequentlyUsedAppsList.addStyleClass("sapUshellCEPListDivider");
                }
            }
            if (this._oSearchResultList.getVisible() === true) {
                if (this._oExternalSearchResultList.getVisible() === true) {
                    this._oSearchResultList.addStyleClass("sapUshellCEPListDivider");
                }
            }
        },

        _navigateURL: function (sUrl) {
            WindowUtils.openURL(sUrl);
            this.oSF.setValue("");
            setTimeout(function () {
                if (this._oPopover.isOpen()) {
                    this._oPopover.close();
                }
            }.bind(this), 500);
        },

        _navigateApp: function (sSemanticObject, sAction) {
            var oParams = {};
            sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                oCrossAppNavService.toExternal({
                    target: {
                        semanticObject: sSemanticObject,
                        action: sAction
                    },
                    params: oParams
                });
            });
            if (this.oSF.getValue() !== "") {
                this.oSF.setValue("");
            }
            setTimeout(function () {
                if (this._oPopover.isOpen()) {
                    this._oPopover.close();
                }
            }.bind(this), 500);
        },

        _navigateToResultPage: function (sTerm, bAll) {
            var sHash;
            if (sTerm === "") {
                return;
            }
            if (bAll === true) {
                sHash = "#Action-search&/top=20&filter={\"dataSource\":{\"type\":\"Category\",\"id\":\"All\",\"label\":\"All\",\"labelPlural\":\"All\"},\"searchTerm\":\"" +
                    sTerm + "\",\"rootCondition\":{\"type\":\"Complex\",\"operator\":\"And\",\"conditions\":[]}}";
            } else if (this.bNavigateToNewResultPage === true) {
                sHash = "#WorkZoneSearchResult-display?searchTerm=" + sTerm + "&category=app";
            } else {
                sHash = "#Action-search&/top=20&filter={\"dataSource\":{\"type\":\"Category\",\"id\":\"$$APPS$$\",\"label\":\"Apps\",\"labelPlural\":\"Apps\"},\"searchTerm\":\"" +
                    sTerm + "\",\"rootCondition\":{\"type\":\"Complex\",\"operator\":\"And\",\"conditions\":[]}}";
            }
            this.bOnNavigationToResultPage = true;
            sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                oCrossAppNavService.toExternal({
                    target: {
                        shellHash: sHash
                    }
                });
            });
            if (this.bNavigateToNewResultPage === true) {
                setTimeout(function () {
                    if (this._oPopover.isOpen()) {
                        this._oPopover.close();
                    }
                }.bind(this), 500);
                }
            setTimeout(function () {
                this.bOnNavigationToResultPage = false;
            }.bind(this), 3000);
        }
    });
});
