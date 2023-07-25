//Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides default renderer for control sap.ushell.ui.shell.SplitContainer
sap.ui.define([
    "sap/ui/core/library",
    "sap/ushell/resources"
], function (coreLibrary, ushellResources) {
    "use strict";

    // shortcut for sap.ui.core.Orientation
    var Orientation = coreLibrary.Orientation;

    /**
     * SplitContainer renderer.
     * @namespace
     */
    var SplitContainerRenderer = {
        apiVersion: 2
    };

    /**
     * Renders the HTML for the SplitContainer, using the provided {@link sap.ui.core.RenderManager}.
     * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
     * @param {sap.ushell.ui.shell.SplitContainer} splitContainer The SplitContainer that should be rendered.
     */
    SplitContainerRenderer.render = function (rm, splitContainer) {
        var sId = splitContainer.getId();
        var bShowSecondaryContent = splitContainer.getShowSecondaryContent();

        rm.openStart("div", splitContainer);
        rm.class("sapUshellSpltCont");
        if (splitContainer.getOrientation() === Orientation.Vertical) {
            rm.class("sapUshellSpltContV");
        } else {
            rm.class("sapUshellSpltContH");
        }

        if (!bShowSecondaryContent) {
            rm.class("sapUshellSpltContPaneHidden");
        }
        rm.openEnd(); // div - tag

        var sSidePaneId = sId + "-pane";
        var sWidth = bShowSecondaryContent ? splitContainer.getSecondaryContentSize() : "0";
        rm.openStart("aside", sSidePaneId);
        rm.class("sapUshellSpltContPane");
        if (!bShowSecondaryContent) {
            rm.class("sapUshellSplitContSecondClosed");
        }
        rm.attr("aria-label", ushellResources.i18n.getText("SecondaryContent_AriaLabel"));
        rm.style("width", sWidth);
        rm.openEnd(); // aside - tag
        this.renderSecondaryContent(rm, sSidePaneId, splitContainer.getSecondaryContent());
        rm.close("aside");

        var sCanvasId = sId + "-canvas";
        rm.openStart("section", sCanvasId);
        rm.class("sapUshellSpltContCanvas");
        rm.openEnd(); // section - tag
        this.renderRootContent(rm, sCanvasId, splitContainer.getContent());
        rm.close("section");
        rm.close("div");
    };

    /**
     * Renders the HTML for the SplitContainer, using the provided {@link sap.ui.core.RenderManager}.
     * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
     * @param {string} id The id of the parent element.
     * @param {sap.ui.core.Control[]} content Controls that should be rendered inside the root content.
     */
    SplitContainerRenderer.renderRootContent = function (rm, id, content) {
        rm.openStart("div", id + "cntnt");
        rm.class("sapUshellSpltContCntnt");
        rm.attr("data-sap-ui-root-content", "true"); // see e.g. sap.m.App#onAfterRendering
        rm.openEnd(); // div - tag

        if (content && content.length) {
            rm.openStart("div", id + "rootContent");
            rm.class("sapUshellSpltContainerContentWrapper");
            rm.openEnd(); // div - tag
            content.forEach(function (contentControl) {
                rm.renderControl(contentControl);
            });
            rm.close("div");
        }
        rm.close("div");
    };

    /**
     * Renders the HTML for the SplitContainer, using the provided {@link sap.ui.core.RenderManager}.
     * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
     * @param {string} id The id of the parent element.
     * @param {sap.ui.core.Control[]} content Controls that should be rendered inside the secondary content.
     */
    SplitContainerRenderer.renderSecondaryContent = function (rm, id, content) {
        rm.openStart("div", id + "cntnt");
        rm.class("sapUshellSpltContCntnt");
        rm.attr("data-sap-ui-root-content", "true"); // see e.g. sap.m.App#onAfterRendering
        rm.openEnd(); // div - tag
        content.forEach(function (oContent) {
            rm.renderControl(oContent);
        });
        rm.close("div");
    };

    return SplitContainerRenderer;
}, /* bExport= */ true);
