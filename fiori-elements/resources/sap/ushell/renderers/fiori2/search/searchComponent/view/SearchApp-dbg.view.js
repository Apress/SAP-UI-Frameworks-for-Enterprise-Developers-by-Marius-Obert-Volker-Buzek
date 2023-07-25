// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/m/Label",
    "sap/esh/search/ui/SearchCompositeControl"
], function (View, Label, SearchCompositeControl) {
    "use strict";
    return View.extend("sap.ushell.renderers.fiori2.search.searchComponent.view.SearchApp", {

        getControllerName: function () {
            return "sap.ushell.renderers.fiori2.search.searchComponent.controller.SearchApp";
        },

        createContent: function () {
            var model = sap.esh.search.ui.getModelSingleton({}, "flp");
            return new SearchCompositeControl({ model: model });
        }
    });
});
