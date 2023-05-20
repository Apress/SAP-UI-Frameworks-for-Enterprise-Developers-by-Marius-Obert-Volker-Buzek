// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/utils"
], function (utils) {
    "use strict";

    /**
     * @name DashboardGroupsContainer renderer.
     * @static
     * @private
     */
    var DashboardGroupsContainerRenderer = {
        apiVersion: 2
    };

    /**
     * Renders the HTML for the given control, using the provided
     * {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render
     *            output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be
     *            rendered
     */
    DashboardGroupsContainerRenderer.render = function (oRm, oControl) {
        oRm.openStart("div", oControl);
        oRm.attr("data-sap-ui-customfastnavgroup", "true");
        oRm.class("sapUshellDashboardGroupsContainer");

        if (oControl.getAccessibilityLabel()) {
            oRm.accessibilityState(oControl, {
                role: "navigation",
                label: oControl.getAccessibilityLabel()
            });
        }
        oRm.openEnd();

        var aGroups = oControl.getGroups();
        var oGroup;
        for (var i = 0; i < aGroups.length; i++) {
            oGroup = aGroups[i];
            oRm.openStart("div");
            oRm.class("sapUshellDashboardGroupsContainerItem");
            if (oGroup.getIsGroupLocked() || oGroup.getDefaultGroup()) {
                oRm.class("sapUshellDisableDragAndDrop");
            }
            oRm.openEnd();

            oRm.renderControl(oGroup);

            oRm.close("div");
        }

        oRm.close("div");
        utils.setPerformanceMark("FLP -- dashboardgroupscontainer renderer");
    };


	return DashboardGroupsContainerRenderer;

}, /* bExport= */ true);
