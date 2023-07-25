// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/assert"
], function (assert) {
    "use strict";

    function AppRuntimeContext () {
        var _bIsScube = false,
            _sRemoteSystemId = "",
            _AppLifeCycleAgent;

        this.setAppLifeCycleAgent = function (AppLifeCycleAgent) {
            _AppLifeCycleAgent = AppLifeCycleAgent;
        };

        this.setIsScube = function (bIsScube) {
            _bIsScube = bIsScube;
        };

        this.getIsScube = function () {
            return _bIsScube;
        };

        this.setRemoteSystemId = function (sRemoteSystemId) {
            _sRemoteSystemId = sRemoteSystemId;
        };

        this.getRemoteSystemId = function () {
            return _sRemoteSystemId;
        };

        this.checkDataLossAndContinue = function () {
            return (_AppLifeCycleAgent ? _AppLifeCycleAgent.checkDataLossAndContinue() : true);
        };
    }

    return new AppRuntimeContext();
});
