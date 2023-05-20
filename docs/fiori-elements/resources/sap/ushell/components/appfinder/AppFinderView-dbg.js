// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/ui/thirdparty/jquery",
    "sap/ui/core/InvisibleText",
    "sap/ui/core/ListItem",
    "sap/ui/model/Sorter",
    "sap/m/MultiComboBox",
    "sap/ui/model/BindingMode",
    "sap/m/SearchField",
    "sap/m/FlexBox",
    "sap/m/SegmentedButton",
    "sap/m/SegmentedButtonItem",
    "sap/m/ToggleButton",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/m/Toolbar",
    "sap/m/Page",
    "sap/ushell/resources",
    "sap/ui/Device"
], function (
    View,
    jQuery,
    InvisibleText,
    ListItem,
    Sorter,
    MultiComboBox,
    BindingMode,
    SearchField,
    FlexBox,
    SegmentedButton,
    SegmentedButtonItem,
    ToggleButton,
    AccessibilityCustomData,
    Toolbar,
    Page,
    resources,
    Device
) {
    "use strict";

    return View.extend("sap.ushell.components.appfinder.AppFinderView", {
        createContent: function () {
            var oResourceBundle = resources.i18n;

            this.oPage = new Page("appFinderPage", {
                showHeader: false,
                showSubHeader: false,
                showFooter: false,
                showNavButton: false,
                enableScrolling: false,
                title: {
                    parts: ["/groupContext/title"],
                    formatter: function (title) {
                        return !title ? oResourceBundle.getText("appFinderTitle") : oResourceBundle.getText("appFinder_group_context_title", title);
                    }
                }
            });

            return this.oPage;
        },

        /*
         * This method checks according to the menu id if search is enabled according to the configuration.
         * Empty menu id is treated as 'catalog' as when loading the appFinder if no menu
         * identified as a routing parameter then we load catalog by default
         */
        _showSearch: function (sMenu) {
            var sModelProperty = "enableCatalogSearch";
            if (sMenu === "userMenu") {
                sModelProperty = "enableEasyAccessUserMenuSearch";
            } else if (sMenu === "sapMenu") {
                sModelProperty = "enableEasyAccessSAPMenuSearch";
            }

            return this.getModel().getProperty("/" + sModelProperty);
        },

        /*
         * This method checks according to the menu id if tags is enabled according to the configuration.
         * Empty menu id is treated as 'catalog' as when loading the appFinder if no menu
         * identified as a routing parameter then we load catalog by default
         */
        _showSearchTag: function (sMenu) {
            if (sMenu === "userMenu" || sMenu === "sapMenu") {
                return false;
            }
            return this.getModel().getProperty("/enableCatalogTagFilter");
        },

        createSubHeader: function () {
            this.oToolbar = new Toolbar("appFinderSubHeader", {
            });

            if (Device.system.desktop) {
                this.oToolbar.addEventDelegate({
                    onAfterRendering: function () {
                        var oCatalogButton = document.getElementById("catalog-button");
                        if (oCatalogButton) {
                            oCatalogButton.setAttribute("accesskey", "a");
                        }
                    }
                });
            }

            this.oToolbar.addStyleClass("sapUshellAppFinderHeader");
            this.oPage.setSubHeader(this.oToolbar);
            this.oPage.setShowSubHeader(true);

            if (!this.openCloseSplitAppButton) {
                // create toggle button for open/close the master part of the splitApp control
                this.openCloseSplitAppButton = new ToggleButton("openCloseButtonAppFinderSubheader", {
                    icon: "sap-icon://menu2",
                    visible: "{/openCloseSplitAppButtonVisible}",
                    pressed: "{/openCloseSplitAppButtonToggled}",
                    press: function (oEvent) {
                        this.getController().oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled", oEvent.getSource().getPressed());
                        this.openCloseSplitAppButton.setTooltip(oEvent.getParameter("pressed") ?
                            resources.i18n.getText("ToggleButtonHide") :
                            resources.i18n.getText("ToggleButtonShow"));
                    }.bind(this),
                    tooltip: resources.i18n.getText("ToggleButtonShow")
                });

                this.openCloseSplitAppButton.setModel(this.getController().oSubHeaderModel);
                this.oToolbar.addContent(this.openCloseSplitAppButton);
            }
        },

        updateSubHeader: function (sMenu, bEasyAccess) {
            var oSegmentedButton,
                oSearchInput;

            // clear content from toolbar
            this.oToolbar.removeAllContent();
            this.oToolbar.addContent(this.openCloseSplitAppButton);

            // bEasyAccess means that we need the segmented button easy access menu entries
            if (bEasyAccess) {
                oSegmentedButton = this.createSegmentedButtons(sMenu);
                this.oPage.addStyleClass("sapUshellAppFinderWithEasyAccess");
                this.oToolbar.addContent(oSegmentedButton);
            }

            // render the search control in the sub-header
            if (this._showSearch(sMenu)) {
                oSearchInput = this.createSearchControl(sMenu);
                this.oToolbar.addContent(oSearchInput);
            }
            // make sure we always update the current menu when updating the sub header
            this.getController()._updateCurrentMenuName(sMenu);
        },

        createSegmentedButtons: function (sMenu) {
            if (this.segmentedButton) {
                this.segmentedButton.setSelectedKey(sMenu);
                return this.segmentedButton;
            }

            var oController = this.getController();
            var oResourceBundle = resources.i18n;

            var oCatalogSBIInvisibleText = new InvisibleText({
                text: resources.i18n.getText("AppFinder.SegmentedButton.Catalog.Describedby")
            }).toStatic();
            this.addDependent(oCatalogSBIInvisibleText);
            this.segmentedButton = new SegmentedButton("appFinderSegmentedButtons", {
                items: [
                    new SegmentedButtonItem("catalog", {
                        text: oResourceBundle.getText("appFinderCatalogTitle"),
                        key: "catalog",
                        press: function (oEvent) {
                            oController.onSegmentButtonClick(oEvent);
                        },
                        customData: [
                            new AccessibilityCustomData({
                                key: "aria-controls",
                                value: "catalogView",
                                writeToDom: true
                            }),
                            new AccessibilityCustomData({
                                key: "aria-describedby",
                                value: oCatalogSBIInvisibleText.getId(),
                                writeToDom: true
                            })
                        ]
                    })
                ]
            });

            if (oController.bEnableEasyAccessUserMenu) {
                var oUserMenuSBIInvisibleText = new InvisibleText({
                    text: resources.i18n.getText("AppFinder.SegmentedButton.UserMenu.Describedby")
                }).toStatic();
                this.addDependent(oUserMenuSBIInvisibleText);
                this.segmentedButton.addItem(new SegmentedButtonItem("userMenu", {
                    text: oResourceBundle.getText("appFinderUserMenuTitle"),
                    key: "userMenu",
                    press: function (oEvent) {
                        oController.onSegmentButtonClick(oEvent);
                    },
                    customData: [
                        new AccessibilityCustomData({
                            key: "aria-controls",
                            value: "userMenuView",
                            writeToDom: true
                        }),
                        new AccessibilityCustomData({
                            key: "aria-describedby",
                            value: oUserMenuSBIInvisibleText.getId(),
                            writeToDom: true
                        })
                    ]
                }));
            }
            if (oController.bEnableEasyAccessSAPMenu) {
                var oSAPMenuSBIInvisibleText = new InvisibleText({
                    text: resources.i18n.getText("AppFinder.SegmentedButton.SAPMenu.Describedby")
                }).toStatic();
                this.addDependent(oSAPMenuSBIInvisibleText);
                this.segmentedButton.addItem(new SegmentedButtonItem("sapMenu", {
                    text: oResourceBundle.getText("appFinderSapMenuTitle"),
                    key: "sapMenu",
                    press: function (oEvent) {
                        oController.onSegmentButtonClick(oEvent);
                    },
                    customData: [
                        new AccessibilityCustomData({
                            key: "aria-controls",
                            value: "sapMenuView",
                            writeToDom: true
                        }),
                        new AccessibilityCustomData({
                            key: "aria-describedby",
                            value: oSAPMenuSBIInvisibleText.getId(),
                            writeToDom: true
                        })
                    ]
                }));
            }

            this.segmentedButton.setSelectedKey(sMenu);

            return this.segmentedButton;
        },

        _handleSearch: function () {
            // invoke the search handler on the controller
            this.getController().searchHandler.apply(this.getController(), arguments);
            // select text right after search executed
            jQuery("#appFinderSearch input").select();
        },

        createSearchControl: function (sMenu) {
            if (!this.oAppFinderSearchContainer) {
                this.oAppFinderSearchContainer = new FlexBox("appFinderSearchContainer");
            }

            this.oAppFinderSearchContainer.removeAllItems();

            if (sMenu === "catalog" && this._showSearchTag("catalog")) {
                this.oAppFinderSearchContainer.addItem(this.createTagControl());
            }

            if (!this.oAppFinderSearchControl) {
                this.oAppFinderSearchControl = new SearchField("appFinderSearch", {
                    search: this._handleSearch.bind(this),
                    value: {
                        path: "subHeaderModel>/search/searchTerm",
                        mode: BindingMode.OneWay
                    }
                }).addStyleClass("help-id-catalogSearch"); // xRay help ID;

                this.oAppFinderSearchControl.addCustomData(new AccessibilityCustomData({
                    key: "aria-controls",
                    value: "",
                    writeToDom: true
                }));

                if (Device.system.desktop) {
                    sap.ui.require([
                        "sap/ushell/components/ComponentKeysHandler",
                        "sap/ushell/renderers/fiori2/AccessKeysHandler"
                    ], function (ComponentKeysHandler, AccessKeysHandler) {
                        ComponentKeysHandler.getInstance().then(function (ComponentKeysHandlerInstance) {
                            this.oAppFinderSearchControl.addEventDelegate({
                                onsaptabnext: function (oEvent) {
                                    var openCloseSplitAppButton = sap.ui.getCore().byId("openCloseButtonAppFinderSubheader");
                                    if (openCloseSplitAppButton.getVisible() && !openCloseSplitAppButton.getPressed()) {
                                        oEvent.preventDefault();
                                        AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                                        ComponentKeysHandlerInstance.setFocusOnCatalogTile();
                                    }
                                }
                            });
                        }.bind(this));
                    }.bind(this));
                }
            }
            this.oAppFinderSearchContainer.addItem(this.oAppFinderSearchControl);

            this._updateSearchWithPlaceHolder(sMenu);
            return this.oAppFinderSearchContainer;
        },

        _updateSearchWithPlaceHolder: function (sMenu) {
            var sSearchPlaceHolderKey = "";
            if (sMenu === "catalog") {
                sSearchPlaceHolderKey = "EasyAccessMenu_SearchPlaceHolder_Catalog";
            } else if (sMenu === "userMenu") {
                sSearchPlaceHolderKey = "EasyAccessMenu_SearchPlaceHolder_UserMenu";
            } else if (sMenu === "sapMenu") {
                sSearchPlaceHolderKey = "EasyAccessMenu_SearchPlaceHolder_SAPMenu";
            }

            if (sSearchPlaceHolderKey && this.oAppFinderSearchControl) {
                this.oAppFinderSearchControl.setPlaceholder(resources.i18n.getText(sSearchPlaceHolderKey));
                this.oAppFinderSearchControl.setTooltip(resources.i18n.getText(sSearchPlaceHolderKey));
            }
        },

        createTagControl: function () {
            if (this.oAppFinderTagFilter) {
                return this.oAppFinderTagFilter;
            }

            var oController = this.getController();

            this.oAppFinderTagFilter = new MultiComboBox("appFinderTagFilter", {
                selectedKeys: {
                    path: "subHeaderModel>/tag/selectedTags"
                },
                tooltip: "{i18n>catalogTilesTagfilter_tooltip}",
                placeholder: "{i18n>catalogTilesTagfilter_HintText}",
                visible: {
                    path: "/tagList",
                    formatter: function (aTagList) {
                        return aTagList.length > 0;
                    }
                },
                // Use catalogs model as a demo content until the real model is implemented
                items: {
                    path: "/tagList",
                    sorter: new Sorter("tag", false, false),
                    template: new ListItem({
                        text: "{tag}",
                        key: "{tag}"
                    })
                },
                selectionChange: [ oController.onTagsFilter, oController ]
            }).addStyleClass("help-id-catalogTagFilter"); // xRay help ID;

            return this.oAppFinderTagFilter;
        },

        getControllerName: function () {
            return "sap.ushell.components.appfinder.AppFinder";
        }
    });
});
