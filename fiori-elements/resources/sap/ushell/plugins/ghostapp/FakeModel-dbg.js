// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/model/odata/v2/ODataModel"
], function (
    ODataModel
) {
    "use strict";

    var FakeModel = ODataModel.extend("sap.ushell.plugins.ghostapp.FakeModel", {
        constructor: function (sServiceUrl, mParameters) {
            ODataModel.apply(this, arguments);
            //set default group as deferred to suppress requests
            this.setDeferredGroups(["undefined", this.sDefaultChangeGroup]);
        },
        // make the default group deferred to prevent outgoing requests
        // intercept all calls as sap.suite.ui.generic.template sets deferred groups without merging them with already deferred groups
        setDeferredGroups: function () {
            ODataModel.prototype.setDeferredGroups.apply(this, arguments);
            this.mDeferredGroups.undefined = "undefined";
        }
    });
    //AnalyticalVersionInfo checks for hard-coded model names, thus we return a known one.
    FakeModel.getMetadata().getName = function () {
        return "sap.ui.model.odata.v2.ODataModel";
    };
    return FakeModel;
});
