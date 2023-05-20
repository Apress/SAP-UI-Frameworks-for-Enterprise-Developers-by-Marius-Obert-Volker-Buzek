// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/generic/app/AppComponent"
], function (AppComponent) {
    "use strict";

    return AppComponent.extend("sap.ushell.plugins.ghostapp.Component", {
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        }
    });
});
