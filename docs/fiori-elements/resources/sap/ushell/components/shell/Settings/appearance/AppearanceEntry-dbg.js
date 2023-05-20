// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/XMLView",
    "sap/base/Log",
    "sap/ushell/resources"
], function (
    XMLView,
    Log,
    resources
) {
    "use strict";

    var aThemeList;

    function _loadThemeList () {
        if (aThemeList) {
            return Promise.resolve(aThemeList);
        }

        return sap.ushell.Container.getServiceAsync("UserInfo").then(function (oUserInfoService) {
            return new Promise(function (fnResolve) {
                oUserInfoService.getThemeList()
                    .done(function (oData) {
                        aThemeList = oData.options || [];
                        fnResolve(aThemeList);
                    })
                    .fail(function () {
                        //retrigger request the next time
                        Log.error("Failed to load theme list.");
                        fnResolve([]);
                    });
            });
        });
    }

    function getEntry () {

        var oViewInstance;
        var oEntry = {
            id: "themes",
            entryHelpID: "themes",
            title: resources.i18n.getText("Appearance"),
            valueResult: null,
            contentResult: null,
            icon: "sap-icon://palette",
            valueArgument: function () {
                return _loadThemeList().then(function (aThemes) {
                    var sUserThemeId = sap.ushell.Container.getUser().getTheme(),
                        sThemeName = "";

                    for (var i = 0; i < aThemes.length; i++) {
                        if (aThemes[i].id === sUserThemeId) {
                            sThemeName = aThemes[i].name || "";
                            break;
                        }
                    }
                    return sThemeName;
                });
            },
            contentFunc: function () {
                return _loadThemeList()
                    .then(function (aThemes) {
                        return XMLView.create({
                            id: "userPrefThemeSelector",
                            viewName: "sap.ushell.components.shell.Settings.appearance.Appearance",
                            viewData: {
                                themeList: aThemes
                            }
                        });
                    }).then(function (oView) {
                        oViewInstance = oView;
                        return oView;
                    });
            },
            onSave: function (fnUpdateUserPreferences) {
                if (oViewInstance) {
                    return oViewInstance.getController().onSave(fnUpdateUserPreferences);
                }
                Log.warning("Save operation for appearance settings was not executed, because the userPrefThemeSelector view was not initialized");
                return Promise.resolve();

            },
            onCancel: function () {
                if (oViewInstance) {
                    oViewInstance.getController().onCancel();
                    return;
                }
                Log.warning(
                    "Cancel operation for appearance settings was not executed, because the userPrefThemeSelector view was not initialized"
                );
            }
        };

        return oEntry;
    }

    return {
        getEntry: getEntry
    };

});
