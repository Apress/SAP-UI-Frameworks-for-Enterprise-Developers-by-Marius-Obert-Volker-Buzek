// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define(["sap/ushell/resources"], function (resources) {
    "use strict";

    /**
     * @name CompactArea renderer.
     * @static
     * @private
     */
    var CompactAreaRenderer = {
        apiVersion: 2
    };

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} compactArea CompactArea to be rendered
     */
    CompactAreaRenderer.render = function (rm, compactArea) {
        rm.openStart("div", compactArea);
        if (!compactArea.getVisible()) {
            rm.style("display", "none");
        }
        rm.attr("role", "group");
        rm.attr("aria-label", resources.i18n.getText("Section.CompactArea.Description"));
        rm.style("width", "100%");
        rm.class("sapUshellSectionCompactArea");
        rm.openEnd(); // div - tag

        // render items
        compactArea.getItems().forEach(rm.renderControl);

        rm.close("div");
    };

    return CompactAreaRenderer;
}, /* bExport= */ true);
