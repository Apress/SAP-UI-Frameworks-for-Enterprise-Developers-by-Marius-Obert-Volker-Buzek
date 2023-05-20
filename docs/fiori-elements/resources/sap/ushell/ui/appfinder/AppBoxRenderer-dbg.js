// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/resources"
], function (resources) {
    "use strict";

    /**
     * AppBox renderer.
     * @namespace
     */
    var AppBoxRenderer = {
        apiVersion: 2
    };

    /**
     * Renders the HTML for the given AppBox control, using the provided
     * {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} rm
     *            the RenderManager that can be used for writing to
     *            the Render-Output-Buffer
     * @param {sap.ui.core.Control} oAppBox
     *            the AppBox to be rendered
     */
    AppBoxRenderer.render = function (rm, oAppBox) {
        rm.openStart("li", oAppBox);
        rm.class("sapUshellAppBox");
        rm.attr("aria-label", oAppBox._getAriaLabel());
        rm.attr("aria-roledescription", resources.i18n.getText("tile"));
        rm.attr("aria-describedby", oAppBox.getId());
        rm.openEnd(); // li - tag

        rm.openStart("div");
        rm.class("sapUshellAppBoxInner");
        rm.openEnd(); // div - tag

        // icon
        var bHasIcon = oAppBox.getIcon();
        if (bHasIcon) {
            rm.renderControl(oAppBox._oIcon);
        }

        rm.openStart("div");
        if (bHasIcon) {
            rm.class("sapUshellAppBoxHeader");
        } else {
            rm.class("sapUshellAppBoxHeaderNoIcon");
        }
        rm.openEnd(); // div - tag

        // title
        rm.openStart("div", oAppBox.getId() + "-title");
        rm.class("sapUshellAppBoxTitle");
        rm.openEnd(); // div - tag
        rm.text(oAppBox.getTitle());
        rm.close("div");

        // subtitle
        if (oAppBox.getSubtitle()) {
            rm.openStart("div", oAppBox.getId() + "-subTitle");
            rm.class("sapUshellAppBoxSubtitle");
            rm.openEnd(); // div - tag
            rm.text(oAppBox.getSubtitle());
            rm.close("div");
        }

        rm.close("div");
        rm.close("div");

        rm.openStart("div");
        rm.class("sapUshellAppBoxActionsArea");
        if (oAppBox.getTitle) {
            rm.attr("role", "toolbar");
            rm.attr("aria-label", oAppBox.getTitle());
        }
        rm.openEnd(); // div - tag

        rm.renderControl(oAppBox.getPinButton());

        rm.close("div");
        rm.close("li");
    };


    return AppBoxRenderer;

}, /* bExport= */ true);
