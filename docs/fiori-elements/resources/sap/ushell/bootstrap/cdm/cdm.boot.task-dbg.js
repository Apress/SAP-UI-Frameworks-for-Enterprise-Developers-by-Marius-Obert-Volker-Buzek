// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/*
 * This module provides the task to be executed after the UI5 library has loaded.
 */
sap.ui.define([
    "../common/common.constants",
    "../common/common.configure.ui5language",
    "../common/common.configure.ui5theme",
    "../common/common.configure.ui5datetimeformat"
], function (
    oConstants,
    fnConfigureUI5Language,
    fnConfigureUI5Theme,
    fnConfigureUI5DateTimeFormat
) {
    "use strict";

    /**
     * This function should be called after the UI5 library has loaded.
     *
     * @param {function} fnContinueUI5Boot The function to execute to continue booting the UI5 framework.
     *
     * @private
     */
    function bootTask (fnContinueUI5Boot) {
        var oUshellConfig = window[oConstants.ushellConfigNamespace];

        // We need to set the langauge first in order to evaluate it when
        // setting the theme as we need to identify the RTL relvevant langauges then
        // Therefore the following sequence needs to be kept.
        fnConfigureUI5Language(oUshellConfig);
        fnConfigureUI5Theme(oUshellConfig);
        fnConfigureUI5DateTimeFormat(oUshellConfig);

        fnContinueUI5Boot();
    }

    return bootTask;
});
