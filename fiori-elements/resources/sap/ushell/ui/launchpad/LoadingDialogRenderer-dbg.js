// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([], function () {
    "use strict";

    /**
     * @class sap.ushell.ui.launchpad.LoadingDialogRenderer
     * @static
     * @private
     */
    var LoadingDialogRenderer = {
        apiVersion: 2,

        /**
         * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
         *
         * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
         * @param {sap.ui.core.Control} loadingDialog an object representation of the control that should be rendered
         * @private
         */
        render: function (rm, loadingDialog) {
            var sTooltip = loadingDialog.getTooltip_AsString();
            rm.openStart("div", loadingDialog);
            rm.class("sapUshellLoadingDialogControl");
            if (sTooltip) {
                rm.attr("title", sTooltip);
            }
            rm.openEnd(); // div - tag

            this.renderAppInfo(rm, loadingDialog);

            rm.close("div");
        },

        renderAppInfo: function (rm, loadingDialog) {
            rm.openStart("div");
            rm.class("sapUshellLoadingDialogAppData");
            rm.openEnd(); // div - tag
            if (loadingDialog.getIconUri()) {
                rm.renderControl(loadingDialog.oIcon);
            }
            rm.openStart("span", loadingDialog.getId() + "-accessibility-helper");
            rm.class("sapUshellAccessibilityHelper");
            rm.attr("aria-live", "rude");
            rm.attr("aria-relevant", "additions text");
            rm.openEnd(); // span - tag
            rm.close("span");
            rm.renderControl(loadingDialog._oLabel);
            rm.close("div");
        }
    };

    return LoadingDialogRenderer;
}, /* bExport= */ true);
