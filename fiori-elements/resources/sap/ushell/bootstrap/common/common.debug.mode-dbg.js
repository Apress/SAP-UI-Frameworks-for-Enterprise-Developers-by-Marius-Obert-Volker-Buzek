// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/*
 * This module provides a flag to indicate whether debug sources are loaded or not.
 */
sap.ui.define([
    "./common.constants"
], function (oConstants) {
    "use strict";

    var sStoredSapUiDebugValue;
    var bDebugSources = /[?&]sap-ui-debug=(true|x|X)(&|$)/.test(window.location.search);

    if (!bDebugSources) {
        try {
            sStoredSapUiDebugValue = window.localStorage.getItem(oConstants.uiDebugKey);
            bDebugSources = !!sStoredSapUiDebugValue && /^(true|x|X)$/.test(sStoredSapUiDebugValue);
        } catch (e) {
            // comment just to benefit eslint
        }
    }

    return {
        isDebug: function () {
            return bDebugSources;
        }
    };
});
