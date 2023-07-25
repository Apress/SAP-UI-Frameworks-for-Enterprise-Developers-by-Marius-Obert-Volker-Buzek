// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Bar",
    "sap/m/Page",
    "sap/m/library",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Text",
    "sap/ushell/resources"
], function (
    View,
    Button,
    Label,
    Bar,
    Page,
    mobileLibrary,
    List,
    StandardListItem,
    Text,
    resources
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.ListSeparators
    var ListSeparators = mobileLibrary.ListSeparators;

    return View.extend("sap.ushell.components.appfinder.HierarchyFoldersView", {
        createContent: function (oController) {
            var that = this;
            this.translationBundle = resources.i18n;

            this.treePath = "";

            // Used to find the element to be focused on when moving between pages.
            this.lastFocusID = document.URL.substring(document.URL.lastIndexOf("&/") + 2) + "-button";

            this.systemSelectorText = new Text({
                text: {
                    path: "easyAccessSystemsModel>/systemSelected",
                    formatter: oController.systemSelectorTextFormatter.bind(oController)
                }
            });

            this.oItemTemplate = new StandardListItem({
                title: "{easyAccess>text}",
                type: "Navigation",
                press: function () {
                    var backButton = that.pageMenu.$().find(".sapMBarLeft button");
                    // If the back button is not displayed change the lastFocus element.
                    if (!backButton.length) {
                        that.lastFocusID = document.activeElement.getAttribute("id");
                    }
                    var path = this.getBindingContextPath();
                    that.getViewData().navigateHierarchy(path, true);
                }
            });

            this.oList = new List({
                showSeparators: ListSeparators.None,
                items: {
                    path: "easyAccess>" + this.treePath + "/folders",
                    template: this.oItemTemplate
                },
                updateFinished: function () {
                    var aListItems = this.getItems();

                    that.finishEasyAccessAnimation(true);
                    aListItems.forEach(function (oListItem) {
                        //UI5 Doesn't support 'space' and 'enter' press behavior alignment while it is required by UX defentions.
                        oListItem.onsapspace = oListItem.onsapenter;
                    });
                },
                noDataText: {
                    path: "easyAccessSystemsModel>/systemSelected",
                    formatter: function (oSystemSelected) {
                        if (oSystemSelected) {
                            return that.translationBundle.getText("easyAccessFolderWithNoItems");
                        }
                    }
                }
            });

            this._navBackButton = new Button({
                tooltip: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("PAGE_NAVBUTTON_TEXT"),
                type: ButtonType.Back,
                visible: false,
                press: function () {
                    var pathChunks = this.treePath.split("/");
                    var newPathChunks = pathChunks.slice(0, pathChunks.length - 2);
                    this.getViewData().navigateHierarchy(newPathChunks.join("/"), false);
                }.bind(this)
            });

            this.pageMenu = new Page({
                enableScrolling: true,
                headerContent: new Bar({
                    contentLeft: [
                        this._navBackButton,
                        new Label({
                            text: {
                                parts: ["easyAccessSystemsModel>/systemSelected"],
                                formatter: oController.systemSelectorTextFormatter.bind(oController)
                            }
                        })
                    ],
                    contentRight: [new Button({
                        text: this.translationBundle.getText("easyAccessSelectSystemDialogTitle"),
                        type: ButtonType.Transparent,
                        visible: {
                            path: "easyAccessSystemsModel>/systemsList",
                            formatter: function (systemsList) {
                                return systemsList.length > 1;
                            }
                        },
                        press: [oController.onSystemSelectionPress, oController]
                    })]
                }).addStyleClass("sapUshellEasyAccessMasterPageHeader"),
                content: this.oList
            });

            return this.pageMenu;
        },

        getControllerName: function () {
            return "sap.ushell.components.appfinder.HierarchyFolders";
        },

        finishEasyAccessAnimation: function () {
            if (!this.jqFolderClone) {
                return;
            }

            if (this.forwardAnimation) {
                this.pageMenu.$().addClass("forwardToViewAnimation");
                this.jqFolderClone.addClass("forwardOutOfViewAnimation");
            } else {
                this.pageMenu.$().addClass("backToViewAnimation");
                this.jqFolderClone.addClass("backOutOfViewAnimation");
            }
            this.jqFolderClone.on("animationend", function () {
                this.pageMenu.$().removeClass("forwardToViewAnimation backToViewAnimation");
                var backButton = this.pageMenu.$().find(".sapMBarLeft button");
                // If back button is displayed set the focus on it.
                if (backButton.length) {
                    backButton.focus();
                } else {
                    // If the back button is not displayed set focus on lastFocus element.
                    // timeout needed because firefox hides menu without it
                    setTimeout(function () {
                        document.querySelector("#" + this.lastFocusID).focus();
                    }.bind(this));
                }
                if (this.jqFolderClone) {
                    this.jqFolderClone.remove();
                }
            }.bind(this));
        },

        prepareEasyAccessAnimation: function (forward) {
            this.forwardAnimation = forward;
            this.jqFolderClone = this.pageMenu.$().clone().removeAttr("data-sap-ui").css("z-index", "1");
            this.jqFolderClone.find("*").removeAttr("id");
            this.pageMenu.$().parent().append(this.jqFolderClone);
        },

        updatePageBindings: function (path, forwardAnimation) {
            var bShowBack = path.split("/").length > 2;
            this.treePath = path;
            this._navBackButton.setVisible(bShowBack);
            this.pageMenu.setShowSubHeader(!bShowBack);
            this.prepareEasyAccessAnimation(forwardAnimation);
            this.oList.bindItems("easyAccess>" + path + "/folders", this.oItemTemplate);
        }
    });
}, /* bExport= */ true);
