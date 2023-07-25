// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/*
 * This module provides the bootstrap scripts DOM element.
 */
sap.ui.define([
    "./common.constants"
], function (oConstants) {
    "use strict";

    var oBootstrapScript = document.getElementById(oConstants.bootScriptId);
    if (!oBootstrapScript) {
        // need fallback to old ID until all paackages are regenerated with new HTML
        oBootstrapScript = document.getElementById(oConstants.bwcBootScriptId);
    }

    return oBootstrapScript;
});
