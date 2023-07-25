// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/deepExtend"
], function (deepExtend) {
    "use strict";

    function execute (currentValue, valueToAdjust) {
        if (!valueToAdjust) {
            valueToAdjust = {};
        }
        return deepExtend({}, currentValue, valueToAdjust);
    }

    return {
        execute: execute
    };
});
