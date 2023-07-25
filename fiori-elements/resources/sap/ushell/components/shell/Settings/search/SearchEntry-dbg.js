// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define(
    [
        "sap/base/Log",
        "sap/ui/core/mvc/XMLView",
        "sap/ushell/resources"
    ],
    function (
        Log,
        XMLView,
        resources
    ) {
        "use strict";

        var searchPrefsModelPromise = null;

        function getSearchPrefsModel () {
            if (searchPrefsModelPromise) {
                return searchPrefsModelPromise;
            }
            searchPrefsModelPromise = sap.ui.getCore().loadLibrary("sap.esh.search.ui", { async: true }).then(function () {
                return new Promise(function (resolve, reject) {
                    sap.ui.require([
                        "sap/esh/search/ui/userpref/SearchPrefsModel",
                        "sap/esh/search/ui/SearchShellHelperAndModuleLoader"],
                        function (SearchPrefsModel, SearchShellHelperAndModuleLoader) {
                            resolve(new SearchPrefsModel());
                        });
                });
            });
            return searchPrefsModelPromise;
        }

        function getEntry () {
            return getSearchPrefsModel().then(function (model) {
                var oViewInstance;
                var oEntry = {
                    id: "search",
                    entryHelpID: "search",
                    title: resources.i18n.getText("searchSetting"),
                    valueResult: null,
                    contentResult: null,
                    icon: "sap-icon://search",
                    isActive: model.isSearchPrefsActive.bind(model),
                    valueArgument: function () {
                        return model.isMultiProvider().then(function (isMultiProvider) {
                            if (isMultiProvider) {
                                return {
                                    value: 1,
                                    displayText: ""
                                };
                            }
                            return model.isPersonalizedSearchActive().then(function (status) {
                                return {
                                    value: 1,
                                    displayText: status ? resources.i18n.getText("sp.persSearchOn") : resources.i18n.getText("sp.persSearchOff")
                                };
                            });
                        });
                    },
                    contentFunc: function () {
                        return model
                            .asyncInit()
                            .then(function () {
                                return XMLView.create({
                                    id: "searchView",
                                    viewName:
                                        "sap.ushell.components.shell.Settings.search.Search"
                                });
                            })
                            .then(function (oView) {
                                oView.setModel(model);
                                oViewInstance = oView;
                                return oView;
                            });
                    },
                    onSave: function () {
                        if (oViewInstance) {
                            return oViewInstance.getController().onSave();
                        }
                        Log.warning(
                            "Save operation for search settings was not executed, because the search view was not initialized"
                        );
                        return Promise.resolve();
                    },
                    onCancel: function () {
                        if (oViewInstance) {
                            oViewInstance.getController().onCancel();
                            return;
                        }
                        Log.warning(
                            "Cancel operation for search settings was not executed, because the search view was not initialized"
                        );
                    },
                    provideEmptyWrapper: false
                };
                return oEntry;
            });
        }

        return {
            getEntry: getEntry
        };
    }
);
