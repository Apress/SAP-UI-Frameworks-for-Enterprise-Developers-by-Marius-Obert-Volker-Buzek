// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([], function () {
    "use strict";

    /**
     * @name Page renderer.
     * @namespace
     */
    var PageRenderer = {
        apiVersion: 2
    };

    /**
     * Renders the HTML for the given control, using the provided
     * {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} rm
     *            The RenderManager that can be used for writing to the render
     *            output buffer
     * @param {sap.ushell.ui.launchpad.Page} page
     *            Page control that should be rendered
     */
    PageRenderer.render = function (rm, page) {
        var aSections = page.getSections();
        var iNrOfSections = aSections.length;
        var sDataHelpId = page.getDataHelpId();
        var sTitle = page.getTitle();
        var oSection;
        var index;

        rm.openStart("div", page);
        rm.class("sapUshellPage");
        rm.class("sapContrastPlus");
        rm.attr("aria-label", sTitle);
        rm.attr("data-sap-ui-customfastnavgroup", "true");
        if (sDataHelpId) {
            rm.attr("data-help-id", sDataHelpId);
        }
        rm.openEnd(); // div - tag

        if (page.getEdit() && page.getAggregation("messageStrip")) {
            rm.renderControl(page.getAggregation("messageStrip"));
        }

        rm.openStart("h2", page.getId() + "-title");
        rm.class("sapMTitle");
        rm.class("sapUshellPageTitle");
        if (!page.getShowTitle()) {
            rm.class("sapUiPseudoInvisibleText");
        }
        rm.attr("aria-level", "2");
        rm.openEnd(); // h2 - tag
        rm.text(sTitle);
        rm.close("h2");

        if (page.getEdit() && !iNrOfSections) {
            rm.renderControl(page.getAggregation("_addSectionButtons")[0]);
        }

        // render "NoSectionsText" when there are no sections
        if (!iNrOfSections && page.getShowNoSectionsText()) {
            rm.renderControl(page.getAggregation("_noSectionText"));
        }

        for (index = 0; index < iNrOfSections; index++) {
            oSection = aSections[index];
            if (page.getEdit() || (oSection.getShowSection() && oSection.getVisible())) {
                rm.openStart("div");
                rm.class("sapUshellPageSection");
                rm.openEnd(); // div - tag
                rm.renderControl(oSection);
                if (page.getEdit()) {
                    rm.renderControl(page.getAggregation("_addSectionButtons")[index + 1]);
                }
                rm.close("div");
            }
        }

        rm.close("div");
    };

    return PageRenderer;
});
