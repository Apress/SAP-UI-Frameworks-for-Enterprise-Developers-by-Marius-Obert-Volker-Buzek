// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/services/CommonDataModel",
    "sap/ushell/appRuntime/ui5/AppRuntimeService"
], function (CommonDataModel, AppRuntimeService) {
    "use strict";

    function CommonDataModelProxy (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        CommonDataModel.call(this, oAdapter, oContainerInterface, sParameters, oServiceConfiguration);

        this.getAllPages = function () {
            return new Promise(function (fnResolve) {
                AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.CommonDataModel.getAllPages").done(fnResolve);
            });
        };
    }

    CommonDataModelProxy.prototype = CommonDataModel.prototype;
    CommonDataModelProxy.hasNoAdapter = CommonDataModel.hasNoAdapter;

    return CommonDataModelProxy;
});
