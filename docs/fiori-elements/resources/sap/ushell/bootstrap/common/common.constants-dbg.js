// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/*
 * This module provides a collection of constant values.
 */
sap.ui.define([], function () {
    "use strict";

    return {
        // Name of debug mode parameter flag
        uiDebugKey: "sap-ui-debug",

        // ID of the boot script - needs to be sap-ui-bootstrap as ui5 also searches
        // for this script by ID (e.g. for loading debug resources)
        bootScriptId: "sap-ui-bootstrap",

        // for backwards compatibility, we also look for the script sap-ushell-bootstrap
        bwcBootScriptId: "sap-ushell-bootstrap",

        // Common prefix used in name attribute of meta elements containing
        // ushell configuration
        configMetaPrefix: "sap.ushellConfig",

        ushellConfigNamespace: "sap-ushell-config"
    };
});
