// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "jquery.sap.global", "sap/m/TileContainerRenderer"
], function (jQuery, TileContainerRenderer) {
    "use strict";

    /**
     * @class PictureViewer renderer.
     * @static
     */
    var PictureViewerRenderer = {};

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
     */
    PictureViewerRenderer.render = function (oRm, oControl) {
        // write the HTML into the render manager
        jQuery.sap.log.debug("PictureViewerRenderer :: begin rendering");

        TileContainerRenderer.render(oRm, oControl);

        jQuery.sap.log.debug("PictureViewerRenderer :: end rendering");
    };

    return PictureViewerRenderer;
}, /* bExport= */ true);
