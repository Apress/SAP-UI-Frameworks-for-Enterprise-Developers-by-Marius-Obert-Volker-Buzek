// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/ui/core/UIComponent"
], function (View, UIComponent) {
    "use strict";

    return UIComponent.extend("sap.ushell.components.tiles.applauncherdynamic", {
        metadata: {
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        createContent: function () {
            var oComponentData = this.getComponentData();

            // We use a copy of the StaticTile view to temporarily support older versions of the CHIP XML.
            // This needs to be done since the view-based approach to build CHIPs does not work with typed views
            // At a later point in time, when we can be sure the new XML version has been delivered, we can delete
            // the copied view and always use the original one as a typed view
            return View.create({
                viewName: "module:sap/ushell/components/tiles/applauncherdynamic/DynamicTileTmp.view",
                viewData: oComponentData
            });
        }
    });
});
