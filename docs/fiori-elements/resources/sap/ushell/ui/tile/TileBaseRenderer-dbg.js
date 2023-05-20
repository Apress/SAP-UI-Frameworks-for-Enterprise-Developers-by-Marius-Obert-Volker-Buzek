// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/base/security/encodeXML",
    "sap/ui/core/Icon"
], function (
    ushellLibrary,
    resources,
    encodeXML,
    Icon
) {
    "use strict";

    // shortcut for sap.ushell.ui.tile.State
    var TileState = ushellLibrary.ui.tile.State;

    /**
     * @name sap.ushell.ui.tile.TileBaseRenderer
     * @static
     * @private
     */
    var TileBaseRenderer = {
        apiVersion: 2
    };
    var translationBundle = resources.i18n;

    /**
     * Searches for occurrences of given searchTerms and substitutes substrings with themselves wrapped in HTML bold tag
     *
     * @param {array} aHighlightTerms an array of strings that will be detected and replaced
     * @param {string} sText contains the text to be highlighted
     * @returns {string} the text with all occurrences wrapped
     * @private
     */
    TileBaseRenderer.highlight = function (aHighlightTerms, sText) {
        var i,
            regexpHighlightTerm,
            // immediately escape string for displaying as HTML
            sEscapedText = encodeXML(sText).replace(/&#xa;/g, "<br>");
        if (aHighlightTerms && aHighlightTerms.length && aHighlightTerms.length > 0) {
            for (i = 0; i < aHighlightTerms.length; i = i + 1) {
                // build regular expression with escaped highlight term (case insensitive + greedy)
                regexpHighlightTerm = new RegExp(
                    "(" + encodeXML(aHighlightTerms[i]).replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1") + ")",
                     "gi");
                // regexp replace occurrence with wrapped self
                sEscapedText = sEscapedText.replace(regexpHighlightTerm, "<b>$1</b>");
            }
        }
        return sEscapedText;
    };

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
     */
    TileBaseRenderer.render = function (oRm, oControl) {
        // is it necessary to wrap the control into a link?
        var sInfoPrefix,
            oIcon;
        oRm.openStart("div", oControl);
        if (oControl.getTargetURL()) {
            oRm.attr("data-targeturl", oControl.getTargetURL());
        }

        oRm.class("sapUshellTileBase");
        oRm.openEnd();

        // plain title + subtitle wrapper
        oRm.openStart("div");
        oRm.class("sapUshellTileBaseHeader");
        oRm.openEnd();

        // title
        oRm.openStart("h3");
        oRm.class("sapUshellTileBaseTitle");

        oRm.accessibilityState(oControl, {
            label: translationBundle.getText("tileTypeListItem")
                + translationBundle.getText("TileDetails_lable")
                + translationBundle.getText("TileTitle_lable")
                + oControl.getTitle(),
            level: "3"
        });
        oRm.openEnd();
        // note: this mustn't be escaped, as highlight already does that
        oRm.unsafeHtml(this.highlight(oControl.getHighlightTerms(), oControl.getTitle() || ""));
        oRm.close("h3");

        // subtitle
        if (oControl.getSubtitle()) {
            oRm.openStart("h4");
            oRm.class("sapUshellTileBaseSubtitle");
            oRm.accessibilityState(oControl, {
                label: translationBundle.getText("TileSubTitle_lable") + oControl.getSubtitle(),
                level: "4"
            });
            oRm.openEnd();
            // note: this mustn't be escaped, as highlight already does that
            oRm.unsafeHtml(this.highlight(oControl.getHighlightTerms(), oControl.getSubtitle()));
            oRm.close("h4");
        }

        oRm.close("div");

        /* render inheriting controls */
        if (typeof (this.renderPart) === "function") {
            this.renderPart(oRm, oControl);
        }

        // icon
        if (oControl.getIcon()) {
            oIcon = new Icon({ src: oControl.getIcon() });
            oIcon.addStyleClass("sapUshellTileBaseIcon");
            oRm.renderControl(oIcon);
        }

        // begin sapUshellTileBaseInfo
        if (oControl.getInfo() || ((typeof (this.getInfoPrefix) === "function")) && this.getInfoPrefix(oControl)) {
            oRm.openStart("div");
            oRm.class("sapUshellTileBaseInfo");
            oRm.class(oControl.getInfoState()
                ? "sapUshellTileBase" + oControl.getInfoState()
                : "sapUshellTileBase" + TileState.Neutral);
            oRm.accessibilityState(oControl, {
                label: translationBundle.getText("TileInfo_lable") + oControl.getInfo()
            });
            oRm.openEnd();

            // it is possible for subclasses to prefix the info with arbitrary information (e.g. unit ex DynamicTiles)
            if (typeof (this.getInfoPrefix) === "function") {
                sInfoPrefix = this.getInfoPrefix(oControl);
                oRm.text(sInfoPrefix);
            }
            // info string
            if (oControl.getInfo()) {
                // number units are separated from info text with a comma
                if (sInfoPrefix) {
                    oRm.text(", ");
                }
                // note: this mustn't be escaped, as highlight already does that
                oRm.unsafeHtml(this.highlight(oControl.getHighlightTerms(), oControl.getInfo()));
            }
            // end sapUshellTileBaseInfo
            oRm.close("div");
        }

        // end control div element
        oRm.close("div");
    };

    return TileBaseRenderer;
});
