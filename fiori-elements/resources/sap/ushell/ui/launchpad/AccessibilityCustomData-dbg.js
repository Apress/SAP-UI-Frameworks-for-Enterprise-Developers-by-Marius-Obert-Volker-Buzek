// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/CustomData",
    "sap/ui/core/Configuration"
], function (CustomData, Configuration) {
    "use strict";

    var AccessibilityCustomData = CustomData.extend("sap.ushell.ui.launchpad.AccessibilityCustomData", {
        metadata: {
            library: "sap.ushell"
        }
    });

    AccessibilityCustomData.prototype._checkWriteToDom = function () {
        var bIsAccessibilityOn = Configuration.getAccessibility();
        if (!bIsAccessibilityOn) {
            return null;
        }

        var sKey = this.getKey();
        var oCheckResult = CustomData.prototype._checkWriteToDom.apply(this, arguments);
        if (oCheckResult && (sKey.indexOf("aria-") === 0 || sKey === "role" || sKey === "tabindex")) {
            oCheckResult.key = oCheckResult.key.replace(/^data-/, "");
        }
        return oCheckResult;
    };

    return AccessibilityCustomData;
});
