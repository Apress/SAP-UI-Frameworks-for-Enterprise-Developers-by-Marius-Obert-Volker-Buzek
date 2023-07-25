// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "jquery.sap.global", "sap/m/CustomTileRenderer", "sap/ui/core/Renderer"
], function (jQuery, CustomTileRenderer, Renderer) {
    "use strict";

    /**
     * @class PictureTile renderer.
     * @static
     */

    var PictureTileRenderer = Renderer.extend(CustomTileRenderer);

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
     */

    PictureTileRenderer.render = function (oRm, oControl) {
        jQuery.sap.log.debug("PictureTileRenderer :: begin rendering");

        oRm.write("<div ");
        oRm.writeControlData(oControl);

        oRm.addClass("sapCaUiPictureTile");
        oRm.writeClasses();

        oRm.write(">");

        oRm.write("<div");
        oRm.addClass("sapCaUiPictureTileContent");
        oRm.writeClasses();
        oRm.write(">");

        oRm.write("<div id='" + oControl.getId() + "-wrapper'>");

        oRm.renderControl(oControl._oDeletePictureButton);

        this._renderContent(oRm, oControl);
        oRm.write("</div>");

        oRm.write("</div></div>");
    };

    PictureTileRenderer._renderContent = function (rm, oTile) {
        rm.renderControl(oTile.getContent());
    };

    return PictureTileRenderer;
}, /* bExport= */ true);
