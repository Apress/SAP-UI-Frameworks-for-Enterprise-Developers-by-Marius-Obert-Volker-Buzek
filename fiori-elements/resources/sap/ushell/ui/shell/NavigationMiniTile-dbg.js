// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * Provides control sap.ushell.ui.shell.ShellNavigationMenu
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/IconPool",
    "sap/ushell/library" // css style dependency
], function (Control, IconPool) {
    "use strict";

    var NavigationMiniTile = Control.extend("sap.ushell.ui.shell.NavigationMiniTile", {
        metadata: {
            library: "sap.ushell",
            properties: {
                title:
                    { type: "string", group: "Misc", defaultValue: null },
                subtitle:
                    { type: "string", group: "Misc", defaultValue: null },
                icon:
                    { type: "sap.ui.core.URI", group: "Appearance", defaultValue: null },
                intent:
                    { type: "string", group: "Misc", defaultValue: null }
            },
            aggregations: {},
            events: { press: {} }
        },

        renderer: {
            apiVersion: 2,
            render: function (oRm, oControl) {
                var sTitle = oControl.getTitle();
                var sSubtitle = oControl.getSubtitle();
                var sIcon = oControl.getIcon();
                var oIcon = IconPool.createControlByURI(sIcon);

                oRm.openStart("div", oControl);
                oRm.attr("tabindex", "-1");
                oRm.class("sapUshellNavMiniTile");
                oRm.attr("role", "listitem");
                oRm.attr("aria-label", sSubtitle ? sTitle + " " + sSubtitle : sTitle);
                oRm.openEnd();

                oRm.openStart("div");
                oRm.openEnd();

                oRm.openStart("span");
                oRm.class("sapUshellNavMiniTileTitle");
                oRm.openEnd();

                if (sTitle) {
                    oRm.text(sTitle);
                }
                oRm.close("span");
                oRm.close("div");

                oRm.openStart("div");
                oRm.openEnd();
                if (oIcon) {
                    oRm.openStart("span");
                    oRm.class("sapUshellNavMiniTileIcon");
                    oRm.openEnd();
                    oRm.renderControl(oIcon);
                    oRm.close("span");
                } else {
                    oRm.openStart("span");
                    oRm.class("sapUshellNavMiniTileSubtitle");
                    oRm.openEnd();
                    oRm.text(sSubtitle || "");
                    oRm.close("span");
                }
                oRm.close("div");
                oRm.close("div");
            }
        }
    });

    NavigationMiniTile.prototype.ontap = function () {
        this.firePress({});
    };

    NavigationMiniTile.prototype.onsapenter = function () {
        this.firePress({});
    };

    NavigationMiniTile.prototype.onsapspace = function () {
        this.firePress({});
    };

    return NavigationMiniTile;
});
