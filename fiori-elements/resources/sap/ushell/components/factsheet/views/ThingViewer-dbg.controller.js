// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview sap.ushell.components.factsheet.views.ThingViewer
 * @deprecated
 */
sap.ui.define([
    "sap/ui/model/odata/ODataModel"
], function (ODataModel) {
    "use strict";

    sap.ui.controller("sap.ushell.components.factsheet.views.ThingViewer", {
        setService: function (sUri) {
            this.getView().setModel(new ODataModel(sUri));
        }
    });
});
