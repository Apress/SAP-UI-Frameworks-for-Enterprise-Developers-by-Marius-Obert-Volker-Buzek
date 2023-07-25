// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * Dummy Implementation for the ShellUIService. This service implementation
 * is used to suppress the interaction with the shell when using the application
 * warmup plugin.
 */
sap.ui.define(["sap/ui/core/service/Service"], function (Service) {
    "use strict";
    return Service.extend("sap.ushell.plugins.appwarmup.ShellUIService", {
        setTitle: function () {
            return;
        },
        setHierarchy: function () {
            return;
        },
        setBackNavigation: function () {
            return;
        },
        getTitle: function () {
            return;
        },
        setRelatedApps: function () {
            return;
        },
        getUxdVersion: function () {
            return 1;
        }
    });
});
