// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/resources"
], function (resources) {
    "use strict";

    /**
     * @name AnchorNavigationBar renderer.
     * @static
     * @private
     */
    var AnchorNavigationBarRenderer = {
        apiVersion: 2
    };

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
     */
    AnchorNavigationBarRenderer.render = function (oRm, oControl) {
        oRm.openStart("div", oControl);
        oRm.attr("data-sap-ui-customfastnavgroup", "true");
        oRm.class("sapUshellAnchorNavigationBar");
        oRm.openEnd();

        oRm.openStart("div");
        oRm.class("sapUshellAnchorNavigationBarInner");
        oRm.openEnd();

        if (oControl.getGroups().length > 0) {
            oControl._setRenderedCompletely(true);
            //left overflow arrow
            // overflow arrows are aria-hidden: the list items are available for the screen reader anyway
            oRm.openStart("div");
            oRm.class("sapUshellAnchorLeftOverFlowButton");
            oRm.accessibilityState(oControl._getOverflowLeftArrowButton(), { hidden: true });
            oRm.openEnd();
            oRm.renderControl(oControl._getOverflowLeftArrowButton());
            oRm.close("div");

            //anchor items
            oRm.openStart("div");
            oRm.class("sapUshellAnchorNavigationBarItems");
            oRm.openEnd();

            oRm.openStart("ul");
            oRm.class("sapUshellAnchorNavigationBarItemsScroll");
            oRm.accessibilityState(oControl, {
                role: "tablist",
                label: resources.i18n.getText("AnchorNavigationBar_AriaLabel")
            });
            oRm.openEnd();
            this.renderAnchorNavigationItems(oRm, oControl);
            oRm.close("ul");

            oRm.close("div");

            //right overflow arrow
            oRm.openStart("div");
            oRm.class("sapUshellAnchorRightOverFlowButton");
            oRm.accessibilityState(oControl._getOverflowRightArrowButton(), { hidden: true });
            oRm.openEnd();
            oRm.renderControl(oControl._getOverflowRightArrowButton());
            oRm.close("div");

            //overflow popover button
            oRm.openStart("div");
            oRm.class("sapUshellAnchorItemOverFlow");
            oRm.accessibilityState(oControl._getOverflowButton(), { hidden: true });
            oRm.openEnd();
            oRm.renderControl(oControl._getOverflowButton());
            oRm.close("div");
        }

        oRm.close("div");

        oRm.close("div");
    };

    AnchorNavigationBarRenderer.renderAnchorNavigationItems = function (oRm, oControl) {
        oControl.getGroups().forEach(function (oAnchorItem) {
            oRm.renderControl(oAnchorItem);
        });
    };

    AnchorNavigationBarRenderer.shouldAddIBarContext = function () {
        return false;
    };

    return AnchorNavigationBarRenderer;
}, /* bExport= */ true);
