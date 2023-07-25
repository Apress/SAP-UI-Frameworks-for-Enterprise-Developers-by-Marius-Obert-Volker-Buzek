// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define(["sap/ui/core/Renderer", "./TileBaseRenderer"],
	function (Renderer, TileBaseRenderer) {
	"use strict";

    /**
     * @name sap.ushell.ui.tile.StaticTileRenderer
     * @static
     * @private
     */
    var StaticTileRenderer = Renderer.extend(TileBaseRenderer);

    // apiVersion needs to be set explicitly (it is not inherited)
    StaticTileRenderer.apiVersion = 2;

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
     *
     * @private
     */
    StaticTileRenderer.renderPart = function (oRm, oControl) {
        // write the HTML into the base classes' render manager
        oRm.openStart("span");
        oRm.class("sapUshellStaticTile");
        oRm.openEnd();

        // span element
        oRm.close("span");
    };


	return StaticTileRenderer;

});
