/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */
// Provides control sap.ushell.ui.shell.ShellLayout.

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Control",
    "sap/ui/core/Core",
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery",
    "sap/ui/util/Storage",
    "sap/ushell/Config",
    "sap/ui/core/Configuration",
    "sap/ushell/ui/shell/ShellLayoutRenderer",
    "sap/ushell/library", // css style dependency
    "sap/ushell/ui/shell/ToolArea"
], function (
    Log,
    Control,
    Core,
    Device,
    jQuery,
    Storage,
    Config,
    Configuration,
    ShellLayoutRenderer
) {
    "use strict";

    /**
     * Constructor for a new ShellLayout.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class
     * The shell layout is the base for the shell control which is meant as root control (full-screen) of an application.
     * It was build as root control of the Fiori Launchpad application and provides the basic capabilities
     * for this purpose. Do not use this control within applications which run inside the Fiori Lauchpad and
     * do not use it for other scenarios than the root control usecase.
     * @extends sap.ui.core.Control
     *
     * @author SAP SE
     * @version 1.113.0
     *
     * @constructor
     * @private
     * @since 1.25.0
     * @alias sap.ushell.ui.shell.ShellLayout
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var ShellLayout = Control.extend("sap.ushell.ui.shell.ShellLayout", /** @lends sap.ushell.ui.shell.ShellLayout.prototype */
        {
            metadata: {
                library: "sap.ushell",
                properties: {
                    /**
                     * Whether the header can be hidden (manually or automatically). This feature is only available when touch events are supported.
                     * @deprecated since 1.56. This setting has been discontinued.
                     */
                    headerHiding: { type: "boolean", group: "Appearance", defaultValue: false, deprecated: true },

                    /**
                     * If set to false, no header (and no items, search, ...) is shown.
                     */
                    headerVisible: { type: "boolean", group: "Appearance", defaultValue: true },

                    toolAreaVisible: { type: "boolean", group: "Appearance", defaultValue: false },

                    floatingContainerVisible: { type: "boolean", group: "Appearance", defaultValue: false },

                    /**
                     * @deprecated since 1.68. This setting has been discontinued.
                     */
                    backgroundColorForce: { type: "boolean", group: "Appearance", defaultValue: true, deprecated: true },

                    /**
                     * @deprecated since 1.65. This setting has been discontinued.
                     */
                    showBrandLine: { type: "boolean", group: "Appearance", defaultValue: true, deprecated: true },

                    /**
                     * @deprecated since 1.68. This setting has been discontinued.
                     */
                    showAnimation: { type: "boolean", group: "Appearance", defaultValue: true, deprecated: true },

                    enableCanvasShapes: { type: "boolean", group: "Appearance", defaultValue: false }
                },
                aggregations: {
                    /**
                     * The control to appear in the sidebar (left) area.
                     */
                    toolArea: { type: "sap.ushell.ui.shell.ToolArea", multiple: false },

                    /**
                     * The control to appear in the (right) area for the alerts.
                     */
                    rightFloatingContainer: { type: "sap.ushell.ui.shell.RightFloatingContainer", multiple: false },

                    /**
                     * Private storage for the internal split container for the canvas.
                     */
                    canvasSplitContainer: { type: "sap.ushell.ui.shell.SplitContainer", multiple: false },

                    /**
                     * The action button which is rendered floating in the shell content area.
                     * If a custom header is set this aggregation has no effect.
                     */
                    floatingActionsContainer: { type: "sap.ushell.ui.shell.ShellFloatingActions", multiple: false },

                    /**
                     * Optional shell footer
                     * @since 1.56
                     * @private
                     */
                    footer: { type: "sap.ui.core.Control", multiple: false }
                },
                associations: {
                    /**
                     * The shell header control.
                     */
                    header: { type: "sap.ushell.ui.shell.ShellHeader", multiple: false },
                    floatingContainer: { type: "sap.ushell.ui.shell.FloatingContainer", multiple: false }
                }
            },
            renderer: ShellLayoutRenderer
        });

    ShellLayout._SIDEPANE_WIDTH_PHONE = 13;
    ShellLayout._SIDEPANE_WIDTH_TABLET = 13;
    ShellLayout._SIDEPANE_WIDTH_DESKTOP = 15;

    ShellLayout.prototype.getHeader = function () {
        return Core.byId(this.getAssociation("header"));
    };

    ShellLayout.prototype.init = function () {
        this._rtl = Configuration.getRTL();
        this._showHeader = true;
        this._useStrongBG = false;

        Device.media.attachHandler(this._handleMediaChange, this, Device.media.RANGESETS.SAP_STANDARD);

        // Manage the headerless state:
        this._oDoable = Config.on("/core/shellHeader/headerVisible").do(this.setHeaderVisible.bind(this));
        this._oStorage = new Storage(Storage.Type.local, "com.sap.ushell.adapters.local.FloatingContainer");
    };

    ShellLayout.prototype.destroy = function () {
        Device.media.detachHandler(this._handleMediaChange, this, Device.media.RANGESETS.SAP_STANDARD);

        if (this._oDoable) {
            this._oDoable.off();
            this._oDoable = null;
        }
        if (this._oRm) {
            this._oRm.destroy();
            this._oRm = null;
        }
        Control.prototype.destroy.apply(this, arguments);
    };

    ShellLayout.prototype.onAfterRendering = function () {
        this._setSidePaneWidth();
        if (this.getEnableCanvasShapes()) {
            sap.ui.require(["sap/ushell/CanvasShapesManager"], function (CanvasShapesManager) {
                if (Core.isThemeApplied()) {
                    CanvasShapesManager.drawShapes();
                }
            });
        }
    };

    ShellLayout.prototype.renderFloatingContainerWrapper = function () {
        this._oFloatingContainerWrapper = document.getElementById("sapUshellFloatingContainerWrapper");

        if (!this._oFloatingContainerWrapper) {
            this._oFloatingContainerWrapper = document.createElement("DIV");
            this._oFloatingContainerWrapper.setAttribute("id", "sapUshellFloatingContainerWrapper");
            this._oFloatingContainerWrapper.classList.add("sapUshellShellFloatingContainerWrapper");
            this._oFloatingContainerWrapper.classList.add("sapUshellShellHidden");
            window.document.body.appendChild(this._oFloatingContainerWrapper);
        }

        if (this._oStorage && this._oStorage.get("floatingContainerStyle")) {
            this._oFloatingContainerWrapper.style.cssText = this._oStorage.get("floatingContainerStyle");
        }
    };

    ShellLayout.prototype.renderFloatingContainer = function (oFloatingContainer) {
        this.renderFloatingContainerWrapper();

        if (oFloatingContainer && !oFloatingContainer.getDomRef()) {
            if (!this._oFloatingContainerWrapper.classList.contains("sapUshellShellHidden")) {
                this._oFloatingContainerWrapper.classList.add("sapUshellShellHidden");
            }
            oFloatingContainer.placeAt("sapUshellFloatingContainerWrapper");
        }
    };

    ShellLayout.prototype.onThemeChanged = function () {
        return !!this.getDomRef();
    };

    //***************** API / Overridden generated API *****************
    ShellLayout.prototype.setToolAreaVisible = function (bVisible) {
        this.setProperty("toolAreaVisible", !!bVisible, true);
        if (this.getToolArea()) {
            this.getToolArea().toggleStyleClass("sapUshellShellHidden", !bVisible);
            this.applySplitContainerSecondaryContentSize();
            return this;
        }

        if (bVisible) {
            sap.ui.require(["sap/ushell/EventHub"], function (EventHub) {
                EventHub.emit("CreateToolArea");
            });
            return this;
        }

        Log.debug("Tool area not created but visibility updated", null, "sap.ushell.ShellLayout");
        return this;
    };

    ShellLayout.prototype.getToolAreaSize = function () {
        if (this.getToolAreaVisible()) {
            if (this.getToolArea().hasItemsWithText()) {
                return "15rem";
            }

            return "3.0625rem";
        }

        return "0";
    };

    /**
     * Override method to circumvent the renderer. This is done to avoid re-rendering when a new footer is set,
     * which causes problems for applications in iFrames.
     * @param {sap.ui.core.Control|null} footer The footer control to render, null if the footer should be removed.
     */
    ShellLayout.prototype.setFooter = function (footer) {
        this.setAggregation("footer", footer, true);
        this._renderFooter(footer);
    };

    /**
     * Applies the current status to the content areas (CSS left and width properties).
     *
     * @protected
     */
    ShellLayout.prototype.applySplitContainerSecondaryContentSize = function () {
        var sToolAreaSize = this.getToolAreaSize();
        this.getCanvasSplitContainer().applySecondaryContentSize(sToolAreaSize);
    };

    ShellLayout.prototype.setFloatingContainer = function (oContainer) {
        this.setAssociation("floatingContainer", oContainer, true);
        this.renderFloatingContainer(oContainer);
    };

    ShellLayout.prototype.setFloatingContainerVisible = function (bVisible) {
        // setting the actual ShellLayout property
        this.setProperty("floatingContainerVisible", !!bVisible, true);
        if (this.getDomRef()) {
            var oFloatingContainerWrapper = window.document.getElementById("sapUshellFloatingContainerWrapper");
            // Only in case this is first time the container is opened and there is no style for it in local storage
            if (bVisible && this._oStorage && !this._oStorage.get("floatingContainerStyle")) {
                // TO-DO: global jquery call found
                var emSize = jQuery(".sapUshellShellHeadItm").position() ? jQuery(".sapUshellShellHeadItm").position().left : 0;
                var iLeftPos = (jQuery(window).width() - jQuery("#shell-floatingContainer").width() - emSize) * 100 / jQuery(window).width();
                var iTopPos = jQuery(".sapUshellShellHeader").height() * 100 / jQuery(window).height();
                oFloatingContainerWrapper.style.left = iLeftPos + "%";
                oFloatingContainerWrapper.style.top = iTopPos + "%";
                oFloatingContainerWrapper.style.position = "absolute";
                this._oStorage.put("floatingContainerStyle", oFloatingContainerWrapper.style.cssText);
            }

            var oSFCW = window.document.querySelector(".sapUshellShellFloatingContainerWrapper");
            if (oSFCW && bVisible === oSFCW.classList.contains("sapUshellShellHidden")) {
                oSFCW.classList.toggle("sapUshellShellHidden");
            }
        }
        return this;
    };

    ShellLayout.prototype.setFloatingActionsContainer = function (oContainer) {
        this.setAggregation("floatingActionsContainer", oContainer, true);
    };

    ShellLayout.prototype.setHeaderVisible = function (value) {
        this.setProperty("headerVisible", value, true);
        var domRef = this.getDomRef();
        if (domRef) {
            if (value === true) {
                domRef.classList.remove("sapUshellShellNoHead");
            } else {
                domRef.classList.add("sapUshellShellNoHead");
            }
        }
    };

    //***************** Private Helpers *****************

    ShellLayout.prototype._setSidePaneWidth = function (sRange) {
        var oSplitContainer = this.getCanvasSplitContainer();
        if (oSplitContainer) {
            if (!sRange) {
                sRange = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name;
            }

            var w = ShellLayout["_SIDEPANE_WIDTH_" + sRange.toUpperCase()] + "rem";
            oSplitContainer.setSecondaryContentSize(w);
        }
    };

    /**
     * Hides the footer container.
     *
     * @param {HTMLElement} domRef The ShellLayout dom node.
     * @param {HTMLElement} footerContainer The footer container dom node.
     * @private
     */
    ShellLayout.prototype._hideFooter = function (domRef, footerContainer) {
        domRef.classList.remove("sapUshellShellFooterVisible");
        footerContainer.classList.add("sapUiHidden");
    };

    /**
     * Makes the footer container visible and renders the given control inside.
     *
     * @param {HTMLElement} domRef The ShellLayout dom node.
     * @param {HTMLElement} footerContainer The footer container dom node.
     * @param {sap.ui.core.Control} footer The footer control.
     * @private
     */
    ShellLayout.prototype._showFooter = function (domRef, footerContainer, footer) {
        if (footer._applyContextClassFor) {
            footer._applyContextClassFor("footer");
        }

        this._oRm = this._oRm || Core.createRenderManager();
        domRef.classList.add("sapUshellShellFooterVisible");
        footerContainer.classList.remove("sapUiHidden");

        this._oRm.render(footer, footerContainer);
    };

    /**
     * Renders the given footer control inside the footer container element.
     * This circumvents the renderer in order to avoid re-rendering when a new footer is set.
     *
     * @param {sap.ui.core.Control|null} footer The footer control to render inside the footer container element,
     * null if the footer should be removed.
     * @private
     */
    ShellLayout.prototype._renderFooter = function (footer) {
        // ShellLayout.setFooter might be called before the initial rendering
        var oDomRef = this.getDomRef();
        if (!oDomRef) {
            return;
        }

        var oFooterContainer = oDomRef.querySelector("#" + this.getId() + "-footer");

        oFooterContainer.innerHTML = "";

        if (!footer) {
            this._hideFooter(oDomRef, oFooterContainer);
            return;
        }

        this._showFooter(oDomRef, oFooterContainer, footer);
    };

    ShellLayout.prototype._handleMediaChange = function (mParams) {
        if (!this.getDomRef()) {
            return;
        }
        this._setSidePaneWidth(mParams.name);
    };

    return ShellLayout;

});
