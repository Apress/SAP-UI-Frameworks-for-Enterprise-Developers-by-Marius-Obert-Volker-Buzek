// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @name sap.ushell.ui.appfinder.PinButton
 *
 * @private
 */
sap.ui.define([
    "sap/m/Button",
    "sap/ushell/library", // css style dependency
    "sap/ushell/ui/appfinder/PinButtonRenderer"
], function (Button, ushellLibrary, PinButtonRenderer) {
    "use strict";

    var PinButton = Button.extend("sap.ushell.ui.appfinder.PinButton", {
        metadata: {
            library: "sap.ushell",
            properties: {
                /**
                 * Defines whether the button should be highlighted or not.
                 * @since 1.42
                 */
                selected: {
                    type: "boolean",
                    group: "Appearance",
                    defaultValue: false
                }
            }
        },
        renderer: PinButtonRenderer
    });

    PinButton.prototype.onAfterRendering = function () {
        this.$("inner").toggleClass("sapUshellPinSelected", this.getSelected());
    };

    return PinButton;
});
