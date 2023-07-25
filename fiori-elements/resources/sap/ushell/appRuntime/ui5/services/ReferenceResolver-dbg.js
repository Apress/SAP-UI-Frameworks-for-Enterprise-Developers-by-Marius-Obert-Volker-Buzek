// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/appRuntime/ui5/AppRuntimeService"
], function (AppRuntimeService) {
    "use strict";

    function ReferenceResolverProxy () {
        this.resolveReferences = function (aReferences, oSystemContext) {
            return AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.ReferenceResolver.resolveReferences", {
               aReferences: aReferences
            });
        };
    }

    ReferenceResolverProxy.hasNoAdapter = true;

    return ReferenceResolverProxy;
});
