//Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Core",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/library",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/utils/AppType"
], function (
    Core,
    Fragment,
    Device,
    JSONModel,
    ushellLibrary,
    Config,
    resources,
    utils,
    WindowUtils,
    AppTypeUtils
) {
    "use strict";

    // shortcut for sap.ushell.AppType
    var AppType = ushellLibrary.AppType;

    var oQuickAccess = {
        oModel: new JSONModel({
            recentActivities: [],
            frequentActivities: []
        }),

        /**
         * Creates the Quick Access dialog and sets the models.
         *
         * @param {string} [sFocusIdAfterClose] the DOM id of the element to focus after close
         * @returns {Promise<object>} that resolves with the created Dialog
         * @private
         */
        _createQuickAccessDialog: function (sFocusIdAfterClose) {
            return Fragment.load({
                name: "sap.ushell.ui.QuickAccess",
                type: "XML",
                controller: this
            }).then(function (oFragment) {
                this.oQuickAccessDialog = oFragment;
                this.oQuickAccessDialog.setModel(this.oModel);
                this.oQuickAccessDialog.attachAfterClose(function () {
                    this.oQuickAccessDialog.destroy();

                    if (Device.system.desktop) {
                        var oFocusElement = Core.byId(sFocusIdAfterClose);

                        if (oFocusElement) {
                            oFocusElement.focus();
                        } else {
                            sap.ui.require(["sap/ushell/components/ComponentKeysHandler"], function (ComponentKeysHandler) {
                                ComponentKeysHandler.getInstance().then(function (ComponentKeysHandlerInstance) {
                                    ComponentKeysHandlerInstance.goToLastVisitedTile();
                                });
                            });
                        }
                    }
                }.bind(this));
                Core.byId("shell").addDependent(this.oQuickAccessDialog);
                return this.oQuickAccessDialog;
            }.bind(this));
        },

        /**
         * Updates the Quick Access dialog.
         *
         * @param {object} oDialog the Quick Access dialog.
         * @returns {Promise<void>} an empty Promise
         * @private
         */
        _updateQuickAccessDialog: function (oDialog) {
            var oIconTabBar = oDialog.getContent()[0];
            oIconTabBar.setBusy(true);
            return sap.ushell.Container.getServiceAsync("UserRecents").then(function (oUserRecentsService) {
                return Promise.all([
                    new Promise(function (resolve) {
                        oUserRecentsService.getRecentActivity().then(
                            function (aActivities) {
                                resolve(aActivities.map(function (oActivity) {
                                    oActivity.timestamp = utils.formatDate(oActivity.timestamp);
                                    return oActivity;
                                }));
                            },
                            function () {
                                resolve([]);
                            }
                        );
                    }),
                    new Promise(function (resolve) {
                        oUserRecentsService.getFrequentActivity().then(
                            function (aActivity) {
                                resolve(aActivity);
                            },
                            function () {
                                resolve([]);
                            }
                        );
                    })
                ]);
            }).then(function (aResults) {
                var aRecentActivities = aResults[0];
                var aFrequentActivities = aResults[1];
                this.oModel.setData({
                    recentActivities: aRecentActivities,
                    frequentActivities: aFrequentActivities
                });
                this._setDialogContentHeight(oDialog, Math.max(aRecentActivities.length, aFrequentActivities.length));
                oIconTabBar.setBusy(false);
            }.bind(this));
        },

        _setDialogContentHeight: function (oDialog, iItems) {
            // 4rem is the height of the 1 item
            // For the calculation we assume that we need more space as half of the item
            // 2.75 is the header of IconTabBar
            var iHeight = (iItems + 0.5) * 4 + 2.75;

            if (iHeight < 18) {
                iHeight = 18;
            } else if (iHeight > 42) {
                iHeight = 42;
            }
            oDialog.setContentHeight(iHeight + "rem");
        },

        /**
         * Closes and destroys the Quick Access dialog.
         *
         * @private
         */
        _closeDialog: function () {
            this.oQuickAccessDialog.close();
        },

        /**
         * Formats a title string based on the app type.
         *
         * @param {string} sTitle Title to be formatted.
         * @param {string} sAppType The app type.
         * @returns {string} The formatted title.
         *
         * @private
         */
        _titleFormatter: function (sTitle, sAppType) {
            if (sAppType === AppType.SEARCH) {
                sTitle = "\"" + sTitle + "\"";
            }
            return sTitle;
        },

        /**
         * Formats the description based on the app type.
         *
         * @param {string} sAppType The app type.
         * @returns {string} The formatted description.
         *
         * @private
         */
        _descriptionFormatter: function (sAppType) {
            if (sAppType === AppType.SEARCH) {
                return resources.i18n.getText("recentActivitiesSearchDescription");
            }
            return AppTypeUtils.getDisplayName(sAppType);
        },

        /**
         * Navigates to the given item hash or url.
         *
         * @param {object} oEvent the press event
         * @private
         */
        _itemPress: function (oEvent) {
            var sPath = oEvent.getParameter("listItem").getBindingContextPath();
            var oItemModel = this.oModel.getProperty(sPath);

            if (oItemModel.url[0] === "#") {
                window.hasher.setHash(oItemModel.url);
                this._closeDialog();
            } else {
                var bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
                if (bLogRecentActivity) {
                    var oRecentEntry = {
                        title: oItemModel.title,
                        appType: AppType.URL,
                        url: oItemModel.url,
                        appId: oItemModel.url
                    };
                    sap.ushell.Container.getRenderer("fiori2").logRecentActivity(oRecentEntry);
                }

                WindowUtils.openURL(oItemModel.url, "_blank");
            }
        }
    };

    return {
        /**
         * Opens and updates the Quick Access dialog and sets the given filter id as active.
         *
         * @param {string} sFilterId the id of the IconTabFilter that should be active
         * @param {string} [sFocusIdAfterClose] the DOM id of the element to focus after close
         * @returns {Promise<void>} after the fragment was loaded.
         * @since 1.65.0
         * @private
         */
        openQuickAccessDialog: function (sFilterId, sFocusIdAfterClose) {
            return oQuickAccess._createQuickAccessDialog(sFocusIdAfterClose).then(function (oDialog) {
                var oIconTabBar = oDialog.getContent()[0];
                oQuickAccess._updateQuickAccessDialog(oDialog);
                oIconTabBar.setSelectedKey(sFilterId);
                oDialog.open();
            });
        },
        // Used for qunit tests
        _getQuickAccess: function () {
            return oQuickAccess;
        }
    };
});
