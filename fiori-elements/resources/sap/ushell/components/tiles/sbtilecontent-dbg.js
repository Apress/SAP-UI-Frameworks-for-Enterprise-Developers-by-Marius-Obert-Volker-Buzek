// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Smart Business Tile Content
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/m/TileContent",
    "sap/m/TileContentRenderer",
    "sap/ui/core/Control"
], function (TileContent, Renderer, Control) {
    "use strict";

    var timestamp = Control.extend("numeric.TileContent_Timestamp", {
        ontap: function (e) {
            if (this.getParent().getRefreshOption()) {
                e.preventDefault();
                e.cancelBubble = true;
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                this.getParent().fireRefresh();
            }
        },
        renderer: function (r, c) {
            r.write("<div");
            r.writeElementData(c);
            r.addClass("sapMTileCntFtrTxt");
            if (c.getParent().getRefreshOption()) {
                r.addClass("sapMLnk");
            }
            r.writeClasses();
            r.addStyle("position", "absolute");
            r.addStyle("z-index", "2");
            r.addStyle(r.getConfiguration().getRTL() ? "left" : "right", "auto");
            r.writeStyles();
            r.write(">");
            var ts = c.getParent().getTimestamp();
            if (ts) {
                if (!c.getParent().getRefreshOption()) {
                    r.writeEscaped(ts);
                } else if (r.getConfiguration().getRTL()) {
                    r.writeEscaped(ts + "\u2009");
                    r.writeIcon("sap-icon://refresh", "sapMCmpTileUnitInner");
                } else {
                    r.writeIcon("sap-icon://refresh", "sapMCmpTileUnitInner");
                    r.writeEscaped("\u2009" + ts);
                }
            }
            r.write("</div>");
        }
    });

    return TileContent.extend("sap.ushell.components.tiles.sbtilecontent", {
        metadata: {
            properties: {
                timestamp: { type: "string" },
                refreshOption: { type: "boolean" }
            },
            events: {
                refresh: {}
            }
        },
        init: function () {
            this.addDependent(this._oTimestamp = new timestamp());
        },
        getAltText: function () {
            var a = TileContent.prototype.getAltText.apply(this, arguments);
            if (this.getTimestamp()) {
                a += (a === "" ? "" : "\n") + this.getTimestamp();
            }
            return a;
        },
        renderer: {
            _renderFooter: function (r, c) {
                Renderer._renderFooter.apply(this, arguments);
                r.renderControl(c._oTimestamp);
            }
        }
    });
}, true);
