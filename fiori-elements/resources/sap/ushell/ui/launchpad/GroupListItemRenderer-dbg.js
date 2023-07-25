// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @class GroupListItem renderer.
 * @static
 * @private
 */
sap.ui.define([
    "sap/m/ListItemBaseRenderer",
    "sap/ui/core/Renderer"
], function (ListItemBaseRenderer, Renderer) {
    "use strict";

    /**
     * @class GroupListItem renderer.
     * @static
     */
    var GroupListItemRenderer = Renderer.extend(ListItemBaseRenderer);

    GroupListItemRenderer.apiVersion = 2;

    GroupListItemRenderer.renderLIAttributes = function (rm) {
        rm.class("sapUshellGroupLI");
        rm.class("sapUshellGroupListItem");
    };

    /**
     * Renders the HTML for the list content part of the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oLI an object representation of the list item control that should be rendered
     */
    GroupListItemRenderer.renderLIContent = function (rm, oLI) {
        rm.openStart("div", oLI);
        rm.class("sapMSLIDiv");
        rm.class("sapMSLITitleDiv");

        if (!oLI.getVisible()) {
            rm.style("display", "none");
        }
        rm.openEnd();

        // List item text (also written when no title for keeping the space)
        rm.openStart("div", oLI);
        rm.class("sapMSLITitleOnly");
        rm.openEnd();
        rm.text(oLI.getTitle());
        rm.close("div");

        rm.close("div");
    };

    return GroupListItemRenderer;
}, /* bExport= */ true);
