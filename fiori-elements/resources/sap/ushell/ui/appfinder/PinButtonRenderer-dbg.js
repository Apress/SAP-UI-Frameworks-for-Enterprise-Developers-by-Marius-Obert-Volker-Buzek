// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides default renderer for control sap.ushell.ui.appfinder.PinButton
sap.ui.define([
    "sap/m/ButtonRenderer",
    "sap/ui/core/Renderer"
], function (ButtonRenderer, Renderer) {
    "use strict";


    /**
     * PinButton renderer.
     * @namespace
     */

    var PinButtonRenderer = Renderer.extend(ButtonRenderer);

    PinButtonRenderer.apiVersion = 2;

    /**
     * Callback for specific rendering of accessibility attributes.
     *
     * @param {sap.ui.core.RenderManager} oRm the RenderManager currently rendering this control
     * @param {sap.ushell.ui.appfinder.PinButton} oPinButton the PinButton that should be rendered
     * @param {object} mAccProps Accessibillity properties
     * @private
     */
    PinButtonRenderer.renderAccessibilityAttributes = function (oRm, oPinButton, mAccProps) {
        mAccProps.pressed = oPinButton.getSelected();
    };

    return PinButtonRenderer;

});
