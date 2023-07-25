// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/resources"
], function (oResources) {
    "use strict";

    /**
     * Shell Layout renderer.
     * @namespace
     */
    var ShellLayoutRenderer = {
        apiVersion: 2
    };

    /**
     * Renders the HTML for the given shellLayout, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer.
     * @param {sap.ui.core.Control} shellLayout ShellLayout to be rendered.
     */
    ShellLayoutRenderer.render = function (rm, shellLayout) {
        var id = shellLayout.getId();

        rm.openStart("div", shellLayout);
        rm.class("sapUshellShell");
        if (!shellLayout.getHeaderVisible()) {
            rm.class("sapUshellShellNoHead");
        }
        rm.class("sapUshellShellHead" + (shellLayout._showHeader ? "Visible" : "Hidden"));
        rm.openEnd(); // div - tag

        // Background
        rm.openStart("div");
        rm.style("z-index", "-2");
        rm.class("sapUiShellBackgroundImage");
        rm.class("sapUiGlobalBackgroundImageForce");
        rm.class("sapUshellShellBG");
        rm.class("sapContrastPlus");
        rm.openEnd(); // div - tag
        rm.close("div");
        if (shellLayout.getEnableCanvasShapes()) {
            rm.openStart("canvas", id + "-shapes");
            rm.attr("height", (window.innerHeight > 0) ? window.innerHeight : screen.height);
            rm.attr("width", (window.innerWidth > 0) ? window.innerWidth : screen.width);
            rm.attr("role", "presentation");
            rm.style("position", "absolute");
            rm.style("z-index", "-1");
            rm.openEnd(); // canvas - tag
            rm.close("canvas");
        }

        if (shellLayout.getToolArea()) {
            rm.openStart("aside");
            rm.attr("aria-label", oResources.i18n.getText("ToolArea_AriaLabel"));
            rm.openEnd(); // aside - tag
            rm.renderControl(shellLayout.getToolArea());
            rm.close("aside");
        }

        if (shellLayout.getRightFloatingContainer()) {
            rm.openStart("aside");
            rm.attr("aria-label", oResources.i18n.getText("FloatingContainer_AriaLabel"));
            rm.openEnd(); // aside - tag
            rm.renderControl(shellLayout.getRightFloatingContainer());
            rm.close("aside");
        }

        rm.openStart("main", id + "-cntnt");
        rm.attr("role", "main");
        rm.attr("aria-label", oResources.i18n.getText("ShellLayout.AriaLabel"));
        rm.class("sapUshellShellCntnt");
        rm.class("sapUshellShellCanvas");
        rm.openEnd(); // main - tag
        rm.renderControl(shellLayout.getCanvasSplitContainer());
        rm.close("main");

        rm.renderControl(shellLayout.getFloatingActionsContainer());

        // Render the footer container
        var oFooter = shellLayout.getFooter();
        rm.openStart("footer", id + "-footer");
        rm.class("sapMPageFooter");
        if (!oFooter) {
            rm.class("sapUiHidden");
        }
        rm.openEnd(); // footer - tag

        if (oFooter) {
            if (oFooter._applyContextClassFor) {
                oFooter._applyContextClassFor("footer");
            }
            rm.renderControl(oFooter);
        }

        rm.close("footer");

        rm.close("div");
    };

    return ShellLayoutRenderer;
}, /* bExport= */ true);
