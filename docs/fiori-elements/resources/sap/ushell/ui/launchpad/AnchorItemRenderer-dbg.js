// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define(function () {
    "use strict";

    /**
     * @name AnchorItem renderer.
     * @static
     * @private
     */
    var AnchorItemRenderer = {
        apiVersion: 2,

        /**
         * Renders the HTML for the given AnchorItem, using the provided {@link sap.ui.core.RenderManager}.
         *
         * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer.
         * @param {sap.ushell.ui.launchpad.AnchorItem} anchorItem The AnchorItem control that should be rendered.
         */
        render: function (rm, anchorItem) {
            var sGroupId = anchorItem.getGroupId(),
                bSelected = anchorItem.getSelected();

            rm.openStart("li", anchorItem);
            rm.attr("modelGroupId", sGroupId);
            rm.attr("role", "tab");
            rm.attr("aria-selected", bSelected);
            rm.class("sapUshellAnchorItem");

            if (anchorItem.getSetsize()) {
                rm.attr("aria-posinset", anchorItem.getPosinset());
                rm.attr("aria-setsize", anchorItem.getSetsize());
            }

            // if help-id is specified, write it into the DOM
            if (anchorItem.getHelpId()) {
                if (anchorItem.getDefaultGroup()) {
                    rm.class("help-id-homeAnchorNavigationBarItem");
                } else {
                    rm.class("help-id-anchorNavigationBarItem");
                }
                rm.attr("data-help-id", anchorItem.getHelpId());
            }

            if (bSelected) {
                rm.attr("tabindex", "0");
                rm.class("sapUshellAnchorItemSelected");
            }

            if (!anchorItem.getVisible() || !anchorItem.getIsGroupVisible()) {
                rm.class("sapUshellShellHidden");
            }

            rm.openEnd(); // li -tag

            rm.openStart("div", anchorItem.getId() + "-inner");
            rm.class("sapUshellAnchorItemInner");
            if (anchorItem.getIsGroupDisabled()) {
                rm.class("sapUshellAnchorItemDisabled");
            }
            rm.openEnd(); // div -tag
            rm.text(anchorItem.getTitle());
            rm.close("div");

            rm.close("li");
        }
    };

    return AnchorItemRenderer;
});
