// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * An invisible container,
 * located (i.e. floats) at the top right side of the shell and can host any <code>sap.ui.core.Control</code> object.<br>
 * Extends <code>sap.ui.core.Control</code>
 */
sap.ui.define([
    "sap/ui/core/Configuration",
    "sap/ui/core/Control",
    "sap/ui/core/Core",
    "sap/ui/Device",
    "sap/ui/performance/Measurement",
    "sap/ui/thirdparty/jquery",
    "sap/ui/util/Storage",
    "sap/ushell/EventHub",
    "sap/ushell/library" // css style dependency
], function (
    Configuration,
    Control,
    Core,
    Device,
    Measurement,
    jQuery,
    Storage,
    EventHub,
    ushellLibrary
) {
    "use strict";

    var FloatingContainer = Control.extend("sap.ushell.ui.shell.FloatingContainer", {
        metadata: {
            library: "sap.ushell",
            properties: {},
            aggregations: {
                content: { type: "sap.ui.core.Control", multiple: true }
            }
        },
        renderer: {
            apiVersion: 2,
            render: function (rm, oContainer) {
                rm.openStart("div", oContainer);
                rm.class("sapUshellFloatingContainer");
                rm.openEnd();

                if (oContainer.getContent() && oContainer.getContent().length) {
                    rm.renderControl(oContainer.getContent()[0]);
                }
                rm.close("div");
            }
        }
    });

    FloatingContainer.prototype.init = function () {
        Device.resize.attachHandler(FloatingContainer.prototype._handleResize, this);
    };

    FloatingContainer.prototype._getWindowHeight = function () {
        return jQuery(window).height();
    };

    FloatingContainer.prototype._setContainerHeight = function (oContainer, iFinalHeight) {
        oContainer.css("max-height", iFinalHeight);
    };

    FloatingContainer.prototype._handleResize = function (oEvent) {
        Measurement.start("FLP:FloatingContainer_handleResize", "resizing floating container", "FLP");
        if (jQuery(".sapUshellFloatingContainer").parent()[0] && (jQuery(".sapUshellContainerDocked").length === 0)) {
            this.oWrapper = jQuery(".sapUshellFloatingContainer").parent()[0];
            this.oWrapper.style.cssText = this.oStorage.get("floatingContainerStyle");
            var bIsSSize = window.matchMedia ? window.matchMedia("(max-width: 417px)").matches : false;
            this.adjustPosition(oEvent, bIsSSize);
        } else if (jQuery(".sapUshellFloatingContainer").parent()[0] && jQuery(".sapUshellContainerDocked").length) {
            // when copilot is docked to the left and window is resized - we need to align his left
            if (jQuery("#canvas").hasClass("sapUshellContainer-Narrow-Right")) {
                var iUpdatedLeft;
                if (Configuration.getRTL()) {
                    jQuery("#sapUshellFloatingContainerWrapper").css("left", (416 / jQuery(window).width() * 100) + "%");
                    iUpdatedLeft = 416 / jQuery(window).width() * 100 + "%;";
                } else {
                    jQuery("#sapUshellFloatingContainerWrapper").css("left", 100 - 416 / jQuery(window).width() * 100 + "%");
                    iUpdatedLeft = 100 - 416 / jQuery(window).width() * 100 + "%;";
                }
                this.oWrapper.style.cssText = "left:" + iUpdatedLeft + this.oWrapper.style.cssText.substring(this.oWrapper.style.cssText.indexOf("top"));

                this.oStorage.put("floatingContainerStyle", this.oWrapper.style.cssText);
            }
        } if (jQuery(".sapUshellContainerDocked").length > 0) {
            Core.getEventBus().publish("launchpad", "shellFloatingContainerDockedIsResize");
            EventHub.emit("ShellFloatingContainerDockedIsResized", Date.now());
        }

        // handle case when co-pilot is dock but screen is less then desktop or landscape tablet
        var sDevice = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD);
        if (sDevice.name !== "Desktop" && (jQuery(".sapUiMedia-Std-Desktop").width() - 416 < sDevice.from) && (jQuery(".sapUshellContainerDocked").length)) {
            jQuery("#canvas, .sapUshellShellHead").removeClass("sapUshellContainerDocked");
            if (jQuery("#canvas").hasClass("sapUshellContainer-Narrow-Right")) {
                jQuery("#canvas").removeClass("sapUshellContainer-Narrow-Right sapUshellMoveCanvasRight");
            } else {
                jQuery("#canvas").removeClass("sapUshellContainer-Narrow-Left sapUshellMoveCanvasLeft");
            }
            jQuery(".sapUshellShellFloatingContainerFullHeight").removeClass("sapUshellShellFloatingContainerFullHeight");
            Core.byId("mainShell").getController()._handleAnimations(false);
            var oStorage = new Storage(Storage.Type.local, "com.sap.ushell.adapters.local.CopilotLastState");
            if (oStorage) {
                oStorage.put("lastState", "floating");
            }
            Core.getEventBus().publish("launchpad", "shellFloatingContainerIsUnDockedOnResize");
            jQuery("#sapUshellFloatingContainerWrapper").removeClass("sapUshellContainerDocked sapUshellContainerDockedMinimizeCoPilot sapUshellContainerDockedExtendCoPilot");
            var oViewPortContainer = Core.byId("viewPortContainer");
            if (oViewPortContainer) {
                oViewPortContainer._handleSizeChange();
            }
        } Measurement.end("FLP:FloatingContainer_handleResize");
    };

    FloatingContainer.prototype.adjustPosition = function (oEvent, bIsSSize) {
        var iWindowCurrentWidth = oEvent ? oEvent.width : jQuery(window).width(),
            iWindowCurrentHeight = oEvent ? oEvent.height : jQuery(window).height(),
            iContainerWidth = this.oContainer.width(),
            iContainerHeight = this.oContainer.height(),
            bContainerPosExceedWindowWidth,
            bContainerPosExceedWindowHeight,
            iLeftPos,
            iTopPos,
            isRTL = Configuration.getRTL();

        bIsSSize = bIsSSize !== undefined ? bIsSSize : false;

        if (this.oWrapper) {
            iLeftPos = this.oWrapper.style.left.replace("%", "");
            iLeftPos = iWindowCurrentWidth * iLeftPos / 100;
            iTopPos = this.oWrapper.style.top.replace("%", "");
            iTopPos = iWindowCurrentHeight * iTopPos / 100;

            //If we are in the S size screen defined as 417 px, then there is a css class applied to  the container
            //And we want to preserve the position before going into S size in case the screen is resized back.
            if (!isNaN(iLeftPos) && !isNaN(iTopPos) && !bIsSSize) { //check if iTopPos or iLeftPos is NaN
                if (isRTL) {
                    bContainerPosExceedWindowWidth = (iLeftPos < iContainerWidth) || (iLeftPos > iWindowCurrentWidth);
                    if (bContainerPosExceedWindowWidth) {
                        iLeftPos = iLeftPos < iContainerWidth ? iContainerWidth : iWindowCurrentWidth;
                    }
                } else {
                    bContainerPosExceedWindowWidth = (iLeftPos < 0) || (iWindowCurrentWidth < (iLeftPos + iContainerWidth));
                    if (bContainerPosExceedWindowWidth) {
                        iLeftPos = iLeftPos < 0 ? 0 : (iWindowCurrentWidth - iContainerWidth);
                    }
                } bContainerPosExceedWindowHeight = (iTopPos < 0) || (iWindowCurrentHeight < (iTopPos + iContainerHeight));

                if (bContainerPosExceedWindowHeight) {
                    iTopPos = iTopPos < 0 ? 0 : (iWindowCurrentHeight - iContainerHeight);
                }

                if (!bContainerPosExceedWindowWidth && !bContainerPosExceedWindowHeight) {
                    this.oWrapper.style.left = iLeftPos * 100 / iWindowCurrentWidth + "%";
                    this.oWrapper.style.top = iTopPos * 100 / iWindowCurrentHeight + "%";
                    this.oWrapper.style.position = "absolute";
                    return;
                }
                this.oWrapper.style.left = iLeftPos * 100 / iWindowCurrentWidth + "%";
                this.oWrapper.style.top = iTopPos * 100 / iWindowCurrentHeight + "%";
                this.oWrapper.style.position = "absolute";
            }
        }
    };

    FloatingContainer.prototype.handleDrop = function () {
        if (this.oWrapper) {
            this.adjustPosition();
            this.oStorage.put("floatingContainerStyle", this.oWrapper.style.cssText);
        }
    };

    FloatingContainer.prototype.setContent = function (aContent) {
        if (this.getDomRef()) {
            var rm = Core.createRenderManager();
            rm.renderControl(aContent);
            rm.flush(this.getDomRef());
            rm.destroy();
        }
        this.setAggregation("content", aContent, true);
    };

    FloatingContainer.prototype.onAfterRendering = function () {
        this.oStorage = this.oStorage || new Storage(Storage.Type.local, "com.sap.ushell.adapters.local.FloatingContainer");
        this.oContainer = jQuery(".sapUshellFloatingContainer");
        this.oWrapper = jQuery(".sapUshellFloatingContainer").parent()[0];
    };

    FloatingContainer.prototype.exit = function () {
        Device.resize.detachHandler(FloatingContainer.prototype._resizeHandler, this);
    };

    return FloatingContainer;
});
