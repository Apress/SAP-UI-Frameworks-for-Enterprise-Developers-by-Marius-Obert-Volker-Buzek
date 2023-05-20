// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
    "sap/ushell/resources",
    "sap/ui/core/library",
    "sap/ui/thirdparty/hasher"
], function (
    Controller,
    Log,
    resources,
    coreLibrary,
    hasher
) {
    "use strict";

    // shortcut for sap.ui.core.ValueState
    var ValueState = coreLibrary.ValueState;

    return Controller.extend("sap.ushell.ui.footerbar.SaveAsTile", {
        onInit: function () {
            var oView = this.getView();

            oView.getTitleInput().attachLiveChange(function () {
                if (this.getValue() === "") {
                    this.setValueStateText(resources.i18n.getText("bookmarkTitleInputError"));
                    this.setValueState(ValueState.Error);
                } else {
                    this.setValueState(ValueState.None);
                }
            });
        },

        /**
         * Loads the list of possible targets offered for bookmark placement into the SaveAsTile view model:
         * e.g. personalized groups in launchpad homepage mode.
         *
         * @private
         *
         * @returns {Promise} Promise that resolves, once the possible targets have been loaded into the model.
         */
        loadPersonalizedGroups: function () {
            // Determine targets for bookmark placement
            return sap.ushell.Container.getServiceAsync("LaunchPage")
                .then(function (LaunchPageService) {
                    return new Promise(function (resolve, reject) {
                        LaunchPageService.getGroupsForBookmarks()
                            .done(resolve)
                            .fail(reject);
                    });
                })
                .then(function (aBookmarkTargets) {
                    // Store them into the groups model property
                    var oModel = this.getView().getModel();
                    oModel.setProperty("/groups", aBookmarkTargets);
                    oModel.setProperty("/groups/length", aBookmarkTargets.length);
                }.bind(this))
                .catch(function () {
                    Log.error("SaveAsTile controller: Unable to determine targets for bookmark placement.");
                });
        },

        getLocalizedText: function (sMsgId, aParams) {
            return aParams ? resources.i18n.getText(sMsgId, aParams) : resources.i18n.getText(sMsgId);
        },

        getBookmarkTileData: function () {
            var oView = this.getView();
            var oModel = oView.getModel();
            var oViewData = oView.getViewData();

            var selectedGroupData;
            if (oView.oGroupsSelect && oView.oGroupsSelect.getSelectedItem()) {
                selectedGroupData = oView.oGroupsSelect.getSelectedItem().getBindingContext().getObject();
            }

            var sURL;
            if (oViewData.customUrl) {
                if (typeof (oViewData.customUrl) === "function") {
                    sURL = oViewData.customUrl();
                } else {
                    // In case customURL will be provided (as a string) containing an hash part, it must be supplied non-encoded,
                    // or it will be resolved with duplicate encoding and can cause nav errors.
                    sURL = oViewData.customUrl;
                }
            } else {
                // In case a hash exists, hasher.setHash() is used for navigation. It also adds encoding.
                sURL = hasher.getHash() ? ("#" + hasher.getHash()) : window.location.href;
            }

            var oData = {
                title: oModel.getProperty("/title") || "",
                subtitle: oModel.getProperty("/subtitle") || "",
                url: sURL,
                icon: oModel.getProperty("/icon") || "",
                info: oModel.getProperty("/info") || "",
                numberUnit: oModel.getProperty("/numberUnit") || "",
                serviceUrl: typeof (oViewData.serviceUrl) === "function" ? oViewData.serviceUrl() : oViewData.serviceUrl,
                dataSource: oModel.getProperty("/dataSource"),
                serviceRefreshInterval: oModel.getProperty("/serviceRefreshInterval"),
                group: selectedGroupData,
                keywords: oModel.getProperty("/keywords") || ""
            };

            oData.title = oData.title.substring(0, 256).trim();
            oData.subtitle = oData.subtitle.substring(0, 256).trim();
            oData.info = oData.info.substring(0, 256).trim();
            if (oData.serviceUrl === undefined) {
                delete oData["serviceUrl"];
                delete oData["serviceRefreshInterval"];
            }

            return oData;
        },

        onExit: function () {
            var oView = this.getView();
            var oTileView = oView.getTileView();
            oTileView.destroy();
        }
    });
});
