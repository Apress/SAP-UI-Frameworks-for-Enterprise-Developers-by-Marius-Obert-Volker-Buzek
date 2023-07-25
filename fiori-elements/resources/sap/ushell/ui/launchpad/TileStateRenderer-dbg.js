// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([], function () {
    "use strict";

    /**
     * @name TileState renderer.
     * @static
     * @private
     */
    var TileStateRenderer = {
        apiVersion: 2
    };

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
     */
    TileStateRenderer.render = function (rm, oControl) {
        rm.openStart("div", oControl);
        rm.class("sapUshellGT");
        rm.openEnd();

        var sState = oControl.getState();

        rm.openStart("div", oControl.getId() + "-overlay");
        rm.class("sapUshellOverlay");

        if (sState === "Failed") {
            rm.attr("title", oControl._sFailedToLoad);
        }
        rm.openEnd();

        switch (sState) {
            case "Loading":
                var oBusyContainer = oControl._getBusyContainer();
                rm.renderControl(oBusyContainer);
                break;

            case "Failed":
                rm.openStart("div", oControl.getId() + "-failed-ftr");
                rm.class("sapUshellTileStateFtrFld");
                rm.openEnd();

                rm.openStart("div", oControl.getId() + "-failed-icon");
                rm.class("sapUshellTileStateFtrFldIcn");
                rm.openEnd();

                rm.renderControl(oControl._oWarningIcon);

                rm.close("div");

                rm.openStart("div", oControl.getId() + "-failed-text");
                rm.class("sapUshellTileStateFtrFldTxt");
                rm.openEnd();

                rm.text(oControl._sFailedToLoad);

                rm.close("div");
                rm.close("div");
                break;
            default:
        }
        rm.close("div");
        rm.close("div");
    };

    return TileStateRenderer;
}, /* bExport= */ true);
