// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/resources",
    "sap/ui/Device"
], function (resources, Device) {
    "use strict";

    /**
     * @name ShellHeader renderer.
     * @static
     * @private
     */
    var ShellHeaderRenderer = {
        apiVersion: 2
    };

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} shellHeader ShellHeader to be rendered
     */
    ShellHeaderRenderer.render = function (rm, shellHeader) {
        var id = shellHeader.getId();
        var oCentralControl = shellHeader.getCentralControl();

        rm.openStart("header", shellHeader);

        if (!shellHeader.getVisible()) {
            rm.style("display", "none");
        }

        rm.class("sapUshellShellHeader");
        rm.class("sapUshellShellCntnt");

        rm.attr("aria-label", resources.i18n.getText("Shell_Header_AriaLabel"));
        rm.attr("data-sap-ui-customfastnavgroup", "true");
        rm.openEnd(); // header - tag

        // Left area
        rm.openStart("div");
        rm.attr("id", id + "-hdr-begin");
        rm.class("sapUshellShellHeadBegin");
        if (oCentralControl) {
            rm.class("sapUshellHeadWithCenter"); // limit the width of the begin area
        }
        rm.openEnd(); // div - tag

        this.renderHeaderItems(rm, shellHeader);
        this.renderLogo(rm, shellHeader);

        // Render AppTitle and (sub)Title
        this.renderTitle(rm, shellHeader);

        rm.close("div");

        // Central container
        if (oCentralControl) {
            rm.openStart("div", oCentralControl);
            rm.attr("id", id + "-hdr-center");
            rm.class("sapUshellShellHeadCenter");
            rm.openEnd(); // div - tag
            rm.renderControl(oCentralControl);
            rm.close("div");
        }

        // Search container
        rm.openStart("div");
        rm.attr("id", id + "-hdr-search-container");
        rm.class("sapUshellShellHeadSearchContainer");
        rm.openEnd(); // div - tag
        // Search field container
        this.renderSearch(rm, shellHeader);
        rm.close("div");

        // Right area
        rm.openStart("div");
        rm.attr("id", id + "-hdr-end");
        rm.class("sapUshellShellHeadEnd");
        rm.openEnd(); // div - tag
        this.renderHeaderEndItems(rm, shellHeader);
        rm.close("div");

        rm.close("header");
    };

    ShellHeaderRenderer.renderSearch = function (rm, shellHeader) {
        var oSearch = shellHeader.getSearch();
        rm.openStart("div");
        rm.attr("id", shellHeader.getId() + "-hdr-search");
        rm.class("sapUshellShellSearch");
        rm.style("max-width", shellHeader.getSearchWidth() + "rem");
        if (shellHeader.getSearchState() === "COL") {
            rm.style("display", "none");
        }
        rm.openEnd(); // div - tag

        if (oSearch) {
            rm.renderControl(oSearch);
        }
        rm.close("div");
    };

    ShellHeaderRenderer.renderTitle = function (rm, shellHeader) {
        var sTitle = shellHeader.getTitle();

        rm.renderControl(shellHeader.getAppTitle());

        if (sTitle && shellHeader.isExtraLargeState()) { // design decision: render subtitle only on XL
            rm.openStart("div");
            rm.attr("id", shellHeader.getId() + "-hdr-shell-title");
            rm.class(shellHeader.getAppTitle() ? "sapUshellShellHeadSubtitle" : "sapUshellShellHeadTitle");
            rm.openEnd(); // div - tag

            rm.openStart("h2");
            rm.class("sapUshellHeadTitle");
            rm.attr("aria-level", "2");
            rm.attr("title", sTitle);
            rm.openEnd(); // span - tag
            rm.text(sTitle);
            rm.close("h2");

            rm.close("div");
        }
    };

    /* Left side buttons */
    ShellHeaderRenderer.renderHeaderItems = function (rm, oHeader) {
        var aItems = oHeader.getHeadItems();
        aItems.forEach(function (oItem) {
            rm.renderControl(oItem);
        });
    };

    /* right side buttons */
    ShellHeaderRenderer.renderHeaderEndItems = function (rm, oHeader) {
        oHeader.getHeadEndItems().forEach(rm.renderControl);
    };

    /* company logo */
    ShellHeaderRenderer.renderLogo = function (rm, oHeader) {

        var sIco = oHeader.getLogo();

        if (!oHeader.getShowLogo() || sIco === undefined) {
            return;
        }

        var bLeanMode = oHeader._getLeanMode(); // In lean mode, do not render <a> link
        var sAriaLabel = resources.i18n.getText("homeBtn_tooltip");
        var sTooltipText = oHeader._bHomeIsRoot ? resources.i18n.getText("homeBtn_tooltip_text") : resources.i18n.getText("lastPage_tooltip");

        rm.openStart(bLeanMode ? "div" : "a");
        rm.attr("id", oHeader.getId() + "-logo");
        rm.class("sapUshellShellIco");

        if (bLeanMode) {
            rm.class("sapUshellLean");
        } else {
            rm.attr("href", oHeader.getHomeUri());
            rm.attr("title", sTooltipText);
            rm.attr("aria-label", sAriaLabel);
            rm.attr("role", "button");
        }

        rm.openEnd();

        rm.voidStart("img");
        rm.attr("id", oHeader.getId() + "-icon");
        rm.attr("alt", oHeader.getLogoAltText(sIco));
        rm.attr("src", sIco);
        rm.voidEnd(); // img - tag
        rm.close(bLeanMode ? "div" : "a");
    };

    return ShellHeaderRenderer;
}, /* bExport= */ true);
