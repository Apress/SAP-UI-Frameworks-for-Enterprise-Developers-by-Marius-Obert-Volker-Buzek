// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define(function () {
    "use strict";

    // application context
    var Ui5ComponentHandle = function (oComponent) {
        this._oComponent = oComponent;
    };

    Ui5ComponentHandle.onBeforeApplicationInstanceCreated = function (/*oComponentConfig*/) {
        sap.ui.require([
            "sap/ushell/Fiori20AdapterTest"
        ], function () { });
    };

    Ui5ComponentHandle.prototype.getInstance = function () {
        return this._oComponent;
    };

    Ui5ComponentHandle.prototype.getMetadata = function () {
        return this._oComponent.getMetadata();
    };

    return Ui5ComponentHandle;
});
