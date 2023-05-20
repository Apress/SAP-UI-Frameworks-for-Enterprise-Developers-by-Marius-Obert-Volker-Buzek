// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/resources",
    "sap/ushell/Config"
], function (resources, Config) {
    "use strict";

    /**
     * PlusTile renderer.
     *
     * @class
     * @static
     * @private
     */
    var PlusTileRenderer = {
        apiVersion: 2,

        /**
         * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
         *
         * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer.
         * @param {sap.ui.core.Control} plusTile The control that should be rendered.
         */
        render: function (rm, plusTile) {
            rm.openStart("li", plusTile);
            rm.attr("tabindex", "-1");
            rm.class("sapUshellTile");
            rm.class("sapUshellPlusTile");
            rm.class("sapContrastPlus");
            rm.class("sapMGT");

            if (Config.last("/core/home/sizeBehavior") === "Small") {
                rm.class("sapUshellSmall");
            }

            if (plusTile.getEnableHelp()) {
                rm.class("help-id-plusTile"); // xRay help ID
            }

            rm.attr("aria-label", resources.i18n.getText("TilePlus_label"));
            rm.openEnd(); // li - tag
            rm.renderControl(plusTile.oIcon);
            rm.close("li");
        }
    };

    return PlusTileRenderer;
}, /* bExport= */ true);
