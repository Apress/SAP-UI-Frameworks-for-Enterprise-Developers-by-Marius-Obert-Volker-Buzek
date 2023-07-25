// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/library",
    "sap/ui/core/mvc/View",
    "sap/ushell/ui/appfinder/AppBox",
    "sap/ushell/ui/appfinder/PinButton",
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/m/FlexBox",
    "sap/m/library",
    "sap/m/Page",
    "sap/m/PageAccessibleLandmarkInfo",
    "sap/m/MessagePage",
    "sap/ui/model/json/JSONModel",
    "sap/m/Link",
    "sap/m/Breadcrumbs",
    "sap/m/Text",
    "sap/m/Title",
    "sap/m/Button",
    "sap/ushell/components/appfinder/VisualizationOrganizerHelper"
], function (
    coreLibrary,
    View,
    AppBox,
    PinButton,
    resources,
    AccessibilityCustomData,
    FlexBox,
    mobileLibrary,
    Page,
    PageAccessibleLandmarkInfo,
    MessagePage,
    JSONModel,
    Link,
    Breadcrumbs,
    Text,
    Title,
    Button,
    VisualizationOrganizerHelper
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.FlexWrap
    var FlexWrap = mobileLibrary.FlexWrap;

    var TitleLevel = coreLibrary.TitleLevel;
    var AccessibleLandmarkRole = coreLibrary.AccessibleLandmarkRole;

    return View.extend("sap.ushell.components.appfinder.HierarchyAppsView", {
        oVisualizationOrganizerHelper: VisualizationOrganizerHelper.getInstance(),

        createContent: function (oController) {
            this.oController = oController;

            var oPinButton = new PinButton({
                icon: { path: "easyAccess>bookmarkCount", formatter: this.oVisualizationOrganizerHelper.formatBookmarkPinButtonIcon },
                type: { path: "easyAccess>bookmarkCount", formatter: this.oVisualizationOrganizerHelper.formatBookmarkPinButtonType },
                selected: {
                    path: "easyAccess>bookmarkCount",
                    formatter: this.oVisualizationOrganizerHelper.formatBookmarkPinButtonSelectState.bind(this)
                },
                tooltip: {
                    parts: ["associatedGroups", "easyAccess>bookmarkCount", "/groupContext/path", "/groupContext/id", "/groupContext/title"],
                    formatter: this.oVisualizationOrganizerHelper.formatBookmarkPinButtonTooltip.bind(this)
                },
                press: oController.showSaveAppPopover.bind(oController)
            });
            oPinButton.addCustomData(new AccessibilityCustomData({
                key: "tabindex",
                value: "-1",
                writeToDom: true
            }));
            oPinButton.addStyleClass("sapUshellPinButton");

            this.oItemTemplate = new AppBox({
                title: "{easyAccess>text}",
                subtitle: "{easyAccess>subtitle}",
                url: "{easyAccess>url}",
                icon: "{easyAccess>icon}",
                pinButton: oPinButton,
                press: [oController.onAppBoxPressed, oController]
            });
            this.oItemTemplate.addCustomData(new AccessibilityCustomData({
                key: "tabindex",
                value: "-1",
                writeToDom: true
            }));


            this.layout = new FlexBox(this.getId() + "_hierarchyAppsLayout", {
                items: {
                    path: "easyAccess>/apps",
                    template: this.oItemTemplate
                },
                wrap: FlexWrap.Wrap
            });

            this.layout.addDelegate({
                onAfterRendering: function () {
                    var items = this.getItems();
                    var updateTabindex = function (customData) {
                        if (customData.getKey() === "tabindex") {
                            customData.setValue("0");
                        }
                    };
                    if (items.length) {
                        items[0].getCustomData().forEach(updateTabindex);
                        items[0].getPinButton().getCustomData().forEach(updateTabindex);
                    }
                }.bind(this.layout)
            });

            // create message-page as invisible by default
            this.oMessagePage = new MessagePage({
                visible: false,
                showHeader: false,
                text: resources.i18n.getText("EasyAccessMenu_NoAppsToDisplayMessagePage_Text"),
                description: ""
            });

            var oViewData = this.getViewData();
            var sMenuNameI18nKey = oViewData.menuName === "USER_MENU" ? "appFinderUserMenuTitle" : "appFinderSapMenuTitle";

            var oPage = new Page({
                showHeader: false,
                landmarkInfo: new PageAccessibleLandmarkInfo({
                    contentLabel: resources.i18n.getText(sMenuNameI18nKey),
                    contentRole: AccessibleLandmarkRole.Region
                })
            }).addStyleClass("sapUshellAppsView sapUiContentPadding");

            // if it is not a search result view - e.g. this is a regular hierarchy Apps content view
            if (oViewData && oViewData.navigateHierarchy) {
                this.crumbsModel = new JSONModel({ crumbs: [] });

                this.linkTemplate = new Link({
                    text: "{crumbs>text}",
                    press: function (e) {
                        var crumbData = e.oSource.getBinding("text").getContext().getObject();
                        oViewData.navigateHierarchy(crumbData.path, false);
                    }
                });

                this.breadcrumbs = new Breadcrumbs({
                    links: {
                        path: "crumbs>/crumbs",
                        template: this.linkTemplate
                    },
                    currentLocationText: "{/text}"
                });

                this.breadcrumbs.setModel(this.crumbsModel, "crumbs");
                oPage.addContent(this.breadcrumbs);
            } else {
                // else we are in search results content view
                this.resultText = new Title({
                    text: {
                        parts: [
                            { path: "easyAccessSystemsModel>/systemSelected" },
                            { path: "easyAccess>/total" }
                        ],
                        formatter: oController.resultTextFormatter.bind(oController)
                    },
                    level: TitleLevel.H3
                }).addStyleClass("sapUiTinyMarginTop sapUiSmallMarginBottom sapUshellEasyAccessSearchResultText");

                oPage.addContent(this.resultText);

                this.showMoreResultsLink = new Button({
                    text: {
                        parts: [
                            { path: "easyAccess>/apps" },
                            { path: "easyAccess>/total" }
                        ],
                        formatter: oController.showMoreResultsTextFormatter.bind(oController)
                    },
                    press: oViewData.getMoreSearchResults,
                    visible: {
                        parts: [
                            { path: "easyAccess>/apps" },
                            { path: "easyAccess>/total" }
                        ],
                        formatter: oController.showMoreResultsVisibilityFormatter.bind(oController)
                    },
                    type: ButtonType.Transparent
                });
            }

            oPage.addContent(this.oMessagePage);
            oPage.addContent(this.layout);

            if (this.showMoreResultsLink) {
                oPage.addContent(this.showMoreResultsLink);
            }

            return oPage;
        },

        formatPinButtonTooltip: function (aGroupsIDs, bookmarkCount, sGroupContextModelPath, sGroupContextId, sGroupContextTitle) {
            var oResourceBundle = resources.i18n,
                sTooltip;

            if (sGroupContextModelPath) {
                var iCatalogTileInGroup = aGroupsIDs ? Array.prototype.indexOf.call(aGroupsIDs, sGroupContextId) : -1;

                var sTooltipKey = iCatalogTileInGroup !== -1
                    ? "removeAssociatedTileFromContextGroup"
                    : "addAssociatedTileToContextGroup";

                sTooltip = oResourceBundle.getText(sTooltipKey, sGroupContextTitle);
            } else {
                sTooltip = bookmarkCount
                    ? oResourceBundle.getText("EasyAccessMenu_PinButton_Toggled_Tooltip")
                    : oResourceBundle.getText("EasyAccessMenu_PinButton_UnToggled_Tooltip");
            }
            return sTooltip;
        },

        /*
         * updates the text-field OR the messagePage according to
         *   - if items exist we update the text-field, otherwise show message page
         *   - if bIsSearchResults we use different text then if is not (e.g. standard empty folder navigation)
         */
        updateResultSetMessage: function (bItemsExist, bIsSearchResults) {

            var sEmptyContentMessageKey;
            if (bIsSearchResults) {
                sEmptyContentMessageKey = "noFilteredItems";
            } else {
                sEmptyContentMessageKey = "EasyAccessMenu_NoAppsToDisplayMessagePage_Text";
            }

            // if there are items in the results
            if (bItemsExist) {

                // if this is search results --> update the result-text which we display at the top of page when there are results
                if (bIsSearchResults) {
                    this.resultText.updateProperty("text");
                    this.resultText.setVisible(true);
                }

                // set layout visible, hide the message page
                this.layout.setVisible(true);
                this.oMessagePage.setVisible(false);
            } else {
                // in case this is search results --> hide the result-text which we display at the top of page as there are no results.
                // we will display the message page instaed
                if (bIsSearchResults) {
                    this.resultText.setVisible(false);
                }

                this.layout.setVisible(false);
                this.oMessagePage.setVisible(true);

                var sEmptyContentMessageText = resources.i18n.getText(sEmptyContentMessageKey);
                this.oMessagePage.setText(sEmptyContentMessageText);
            }
        },

        setShowMoreResultsBusy: function (bBusy) {
            if (this.showMoreResultsLink) {
                this.showMoreResultsLink.setBusy(bBusy);
            }
        },

        getControllerName: function () {
            return "sap.ushell.components.appfinder.HierarchyApps";
        }
    });
}, /* bExport= */ true);
