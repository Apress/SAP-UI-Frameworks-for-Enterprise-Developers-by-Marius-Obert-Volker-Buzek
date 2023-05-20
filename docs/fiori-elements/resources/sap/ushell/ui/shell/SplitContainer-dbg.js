// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.shell.SplitContainer.
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Control",
    "sap/ui/core/library",
    "sap/ushell/library", // css style dependency
    "sap/ushell/ui/shell/ContentRenderer",
    "sap/ui/core/Configuration",
    "sap/ushell/ui/shell/SplitContainerRenderer"
], function (
    Log,
    Control,
    coreLibrary,
    ushellLibrary,
    ContentRenderer,
    Configuration,
    SplitContainerRenderer
) {
    "use strict";

    // shortcut for sap.ui.core.Orientation
    var Orientation = coreLibrary.Orientation;

    /**
     * Constructor for a new SplitContainer.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     * @class Provides a main content and a secondary content area
     * @extends sap.ui.core.Control
     * @author SAP SE
     * @version 1.113.0
     * @constructor
     * @private
     * @since 1.15.0
     * @experimental Since version 1.15.0.
     * API is not yet finished and might change completely
     * @alias sap.ushell.ui.shell.SplitContainer
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var SplitContainer = Control.extend("sap.ushell.ui.shell.SplitContainer", /** @lends sap.ushell.ui.shell.SplitContainer.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                // shows / hides the secondary area
                showSecondaryContent: { type: "boolean", group: "Appearance", defaultValue: false },

                // the width if the secondary content. The height is always 100%.
                secondaryContentSize: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "250px" },

                /**
                 * Do not use.
                 * Only available for backwards compatibility.
                 * @deprecated since 1.22. Please use {@link #secondaryContentSize} instead.
                 */
                secondaryContentWidth: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "250px", deprecated: true },

                /**
                 * Whether to show the secondary content on the left ("Horizontal", default) or on the top ("Vertical").
                 * @since 1.22.0
                 */
                orientation: { type: "sap.ui.core.Orientation", group: "Appearance", defaultValue: Orientation.Horizontal }
            },
            defaultAggregation: "content",
            aggregations: {
                // the content to appear in the main area
                content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" },

                // the secondary content to appear in the secondary area
                secondaryContent: { type: "sap.ui.core.Control", multiple: true, singularName: "secondaryContent" },

                // the sub header to appear in the main area
                subHeader: { type: "sap.ui.core.Control", multiple: true, singularName: "subHeader" }
            }
        },
        renderer: SplitContainerRenderer
    });

    (function () {
        ////////////////////////////////////////// Public Methods //////////////////////////////////////////

        SplitContainer.prototype.init = function () {
            this._paneRenderer = new ContentRenderer(this, this.getId() + "-panecntnt", "secondaryContent");
            this._canvasRenderer = new ContentRenderer(this, this.getId() + "-canvasrootContent", "content");

            this.aSubHeaders = []; // Aggregation cannot be used, as is triggers rerenderings. Therefore a separate array is used.
            this.sTopOfShellContent = undefined; // Calculated, new "top" value for shell-cntnt when subheader is used (based on subheader's height).
        };

        SplitContainer.prototype.exit = function () {
            this._paneRenderer.destroy();
            delete this._paneRenderer;
            this._canvasRenderer.destroy();
            delete this._canvasRenderer;
            this.destroySubHeader();
            delete this.aSubHeaders;
            delete this.sTopOfShellContent;
        };

        ////////////////////////////////////////// onEvent Methods /////////////////////////////////////////

        SplitContainer.prototype.onAfterRendering = function () {
            var sToolAreaSize = this.getParent() ? this.getParent().getToolAreaSize() : "0";
            this.applySecondaryContentSize(sToolAreaSize);
        };

        ///////////////////////////////////////// Protected Methods ////////////////////////////////////////
        /**
         * Applies the current status to the content areas (CSS left and width properties).
         *
         * @param {string} sToolAreaSize the size of the current toolArea
         * @protected
         */
        SplitContainer.prototype.applySecondaryContentSize = function (sToolAreaSize) {
            // Only set if rendered...
            if (this.getDomRef()) {
                var sSizeValue = this.getSecondaryContentSize(),
                    bShow = this.getShowSecondaryContent(),
                    sRTL = Configuration.getRTL() ? "right" : "left",
                    oSecondaryContentContainer = this.getDomRef("pane"),
                    sDir,
                    sOtherDir;

                if (this.getOrientation() === Orientation.Vertical) {
                    // Vertical mode
                    sDir = "top";
                    sOtherDir = sRTL;
                    oSecondaryContentContainer.style.height = sSizeValue;
                    oSecondaryContentContainer.style.width = "";
                } else {
                    // Horizontal mode
                    sDir = sRTL;
                    sOtherDir = "top";
                    oSecondaryContentContainer.style.height = "";
                    oSecondaryContentContainer.style.width = sSizeValue;
                }

                oSecondaryContentContainer.style[sDir] = bShow ? sToolAreaSize : "-" + sSizeValue;
                oSecondaryContentContainer.style[sOtherDir] = "";
                this.$("pane").toggleClass("sapUshellSplitContSecondClosed", !bShow);

                sSizeValue = parseFloat(sSizeValue) + parseFloat(sToolAreaSize) + "rem";
                this.getDomRef("canvas").style[sDir] = bShow ? sSizeValue : sToolAreaSize;
            }
        };

        ////////////////////////////////////////// Private Methods /////////////////////////////////////////

        /**
         * Optimization method that prevents the normal render from rerendering the whole control.
         * See _ContentRenderer in file shared.js for details.
         *
         * @param {function} fMod Method that is called to perform the requested change
         * @param {sap.ui.core.Renderer} oDoIfRendered Renderer Instance
         * @returns {any} the return value from the first parameter
         * @private
         */
        SplitContainer.prototype._modifyAggregationOrProperty = function (fMod, oDoIfRendered) {
            var bRendered = !!this.getDomRef();
            var res = fMod.apply(this, [bRendered]);
            if (bRendered && oDoIfRendered) {
                oDoIfRendered.render();
            }
            return res;
        };

        //////////////////////////////////////// Overridden Methods ////////////////////////////////////////

        // Backwards compatibility with old property name

        SplitContainer.prototype.getSecondaryContentWidth = function () {
            Log.warning(
                "SplitContainer: Use of deprecated property \"SecondaryContentWidth\", please use " +
                "\"SecondaryContentSize\" instead."
            );
            return this.getSecondaryContentSize.apply(this, arguments);
        };

        SplitContainer.prototype.setSecondaryContentWidth = function () {
            Log.warning(
                "SplitContainer: Use of deprecated property \"SecondaryContentWidth\", please use " +
                "\"SecondaryContentSize\" instead."
            );
            return this.setSecondaryContentSize.apply(this, arguments);
        };

        /////////////////////////////////// Aggregation "content" //////////////////////////////////

        SplitContainer.prototype.insertContent = function (oContent, iIndex) {
            return this._modifyAggregationOrProperty(function (bRendered) {
                return this.insertAggregation("content", oContent, iIndex, bRendered);
            }, this._canvasRenderer);
        };

        SplitContainer.prototype.addContent = function (oContent) {
            return this._modifyAggregationOrProperty(function (bRendered) {
                return this.addAggregation("content", oContent, bRendered);
            }, this._canvasRenderer);
        };

        SplitContainer.prototype.removeContent = function (vIndex) {
            return this._modifyAggregationOrProperty(function (bRendered) {
                return this.removeAggregation("content", vIndex, bRendered);
            }, this._canvasRenderer);
        };

        SplitContainer.prototype.removeAllContent = function () {
            return this._modifyAggregationOrProperty(function (bRendered) {
                return this.removeAllAggregation("content", bRendered);
            }, this._canvasRenderer);
        };

        SplitContainer.prototype.destroyContent = function () {
            return this._modifyAggregationOrProperty(function (bRendered) {
                return this.destroyAggregation("content", bRendered);
            }, this._canvasRenderer);
        };

        ////////////////////////////// Aggregation "secondaryContent" //////////////////////////////

        SplitContainer.prototype.insertSecondaryContent = function (oContent, iIndex) {
            return this._modifyAggregationOrProperty(function (bRendered) {
                return this.insertAggregation("secondaryContent", oContent, iIndex, bRendered);
            }, this._paneRenderer);
        };

        SplitContainer.prototype.addSecondaryContent = function (oContent) {
            return this._modifyAggregationOrProperty(function (bRendered) {
                return this.addAggregation("secondaryContent", oContent, bRendered);
            }, this._paneRenderer);
        };

        SplitContainer.prototype.removeSecondaryContent = function (vIndex) {
            return this._modifyAggregationOrProperty(function (bRendered) {
                return this.removeAggregation("secondaryContent", vIndex, bRendered);
            }, this._paneRenderer);
        };

        SplitContainer.prototype.removeAllSecondaryContent = function () {
            return this._modifyAggregationOrProperty(function (bRendered) {
                return this.removeAllAggregation("secondaryContent", bRendered);
            }, this._paneRenderer);
        };

        SplitContainer.prototype.destroySecondaryContent = function () {
            return this._modifyAggregationOrProperty(function (bRendered) {
                return this.destroyAggregation("secondaryContent", bRendered);
            }, this._paneRenderer);
        };

        ////////////////////////////// Aggregation "subHeader" //////////////////////////////

        SplitContainer.prototype.addSubHeader = function (oContent) {

            var sShellId = this.getParent() && this.getParent().getId();
            if (!sShellId || !window.document.getElementById(sShellId + "-subhdr")) {
                // Add DIV to DOM
                var iShellHeaderTop = document.getElementById("shell-header") ? document.getElementById("shell-header").offsetHeight : 0;
                window.document.getElementById("canvas").insertAdjacentHTML(
                    "beforebegin",
                    "<div id=\"" + sShellId + "-subhdr\" class=\"sapUshellSpltContainerSubHeader\"></div>"
                );
                document.getElementById(sShellId + "-subhdr").style.top = iShellHeaderTop + "px";

                // Adapt shell-content
                if (this.getParent()) {
                    this.getParent().addEventDelegate({
                        onAfterRendering: function () {
                            if (this.sTopOfShellContent) {
                                var oShellContentElement = document.getElementById(this.getParent().getId() + "-cntnt");
                                oShellContentElement.style.top = this.sTopOfShellContent;
                            }
                        }.bind(this)
                    });
                }
            }

            // Store all subheaders, however, render always the first one.
            this.aSubHeaders.push(oContent);

            // Adapt shell-cntnt in canvas to make space for the subheader
            this.sOriginalTopOfShellContent = (sShellId && document.getElementById(sShellId + "-cntnt")) ? document.getElementById(sShellId + "-cntnt").offsetTop : 0;
            oContent.addEventDelegate({
                onAfterRendering: function (oEvent) {
                    if (document.getElementById(this.getParent().getId() + "-cntnt")) {
                        var oShellContentElement = document.getElementById(this.getParent().getId() + "-cntnt");
                        this.sTopOfShellContent = oShellContentElement.style.top = (this.sOriginalTopOfShellContent + this.aSubHeaders[0].getDomRef().offsetHeight) + "px";
                    }
                }.bind(this)
            });


            window.document.getElementById(sShellId + "-subhdr").style.display = "block";
            oContent.placeAt(sShellId + "-subhdr", "only");
        };


        SplitContainer.prototype.removeSubHeader = function () {
            var aSubHeaders = this.aSubHeaders;
            this.aSubHeaders = [];

            var oShellContentElement = document.getElementById(this.getParent().getId() + "-cntnt");
            oShellContentElement.style.top = this.sOriginalTopOfShellContent + "px";

            var sShellId = this.getParent() && this.getParent().getId();
            window.document.getElementById(sShellId + "-subhdr").style.display = "none";

            return aSubHeaders;
        };


        SplitContainer.prototype.getSubHeader = function () {
            return this.aSubHeaders;
        };


        SplitContainer.prototype.destroySubHeader = function () {
            for (var i = 0; this.aSubHeaders.length > i; i++) {
                this.aSubHeaders[i].destroy();
                delete this.aSubHeaders[i];
            }
            this.aSubHeaders = [];
        };


        // Do not re-render the Split Container after the secondary content size chane
        SplitContainer.prototype.setSecondaryContentSize = function (sContentSize) {
            this.setProperty("secondaryContentSize", sContentSize, true);
            this.onAfterRendering();
        };

        // Show mobile menu "close" animation
        SplitContainer.prototype.setShowSecondaryContent = function (bShow) {
            this.setProperty("showSecondaryContent", !!bShow, !!this.getDomRef());
            this.onAfterRendering();
            return this;
        };
    })();

    return SplitContainer;
});
