// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define(["sap/ui/core/Renderer", "./TileBaseRenderer"],
	function (Renderer, TileBaseRenderer) {
	"use strict";

    /**
     * @name sap.ushell.ui.tile.ImageTileRenderer
     * @static
     * @private
     */

    var ImageTileRenderer = Renderer.extend(TileBaseRenderer);

    // apiVersion needs to be set explicitly (it is not inherited)
    ImageTileRenderer.apiVersion = 2;

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
     *
     * @private
     */
    ImageTileRenderer.renderPart = function (oRm, oControl) {
        // write the HTML into the render manager
        oRm.voidStart("img");
        oRm.class("sapUshellImageTile");
        oRm.attr("src", oControl.getImageSource());
        oRm.attr("alt", " ");
        oRm.voidEnd();
    };


	return ImageTileRenderer;

});
