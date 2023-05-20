// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define(["sap/ui/core/mvc/View", "sap/ui/core/mvc/Controller"], function (View, Controller) {
    "use strict";

    return Controller.extend(
        "sap.ushell.components.shell.Settings.search.Search",
        {
            onInit: function () {
                this._loadContent();
            },

            _loadContent: function () {
                var oVBox = this.getView().byId("searchContent");

                View.create({
                    id: "searchPrefsDialogView",
                    viewName: "module:sap/esh/search/ui/userpref/SearchPrefsDialog.view"
                  }).then(function (oView) {
                    oVBox.addItem(oView);
                  });
            },

            onCancel: function () {
                this.oView.getModel().cancelPreferences();
            },

            onSave: function () {
                return this.oView.getModel().savePreferences();
            }
        }
    );
});
