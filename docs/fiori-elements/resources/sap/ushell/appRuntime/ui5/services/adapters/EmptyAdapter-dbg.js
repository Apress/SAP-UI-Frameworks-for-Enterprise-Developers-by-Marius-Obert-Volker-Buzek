// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/thirdparty/jquery"
], function (
    jQuery
) {
    "use strict";

    var EmptyAdapter = function () {
        this.getSite = function() {
            return new jQuery.Deferred().resolve({}).promise();
        };
    };

    return EmptyAdapter;
});
