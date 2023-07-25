/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */

sap.ui.define([
    "sap/ui/core/Control"
], function (
    Control
) {
    "use strict";
    /**
     * Constructor for a new WorkPageColumnResizer.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * The WorkPageColumnResizer is used to resize a WorkPageColumn.
     * @extends sap.ui.core.Control
     *
     *
     * @version 1.113.0
     *
     * @private
     * @experimental
     * @alias sap.ushell.components.workPageBuilder.controls.WorkPageColumnResizer
     */
    var WorkPageColumnResizer = Control.extend("sap.ushell.components.workPageBuilder.controls.WorkPageColumnResizer",
        /** @lends sap.ushell.components.workPageBuilder.controls.WorkPageColumnResizer.prototype */ {
        metadata: {
            library: "sap.ushell",
            events: {
                /**
                 * Called if the resizer was dragged.
                 */
                resizerMoved: {
                    parameters: {
                        /**
                         * The difference between the currently dragged x-position and the resizer control position.
                         */
                        posXDiff: { type: "float" }
                    }
                },
                /**
                 * Called if the resizer was released.
                 */
                resizerReleased: {}
            }
        },
        renderer: {
            apiVersion: 2,

            /**
             * Renders the HTML for the WorkPageColumnResizer, using the provided {@link sap.ui.core.RenderManager}.
             *
             * @param {sap.ui.core.RenderManager} rm The RenderManager.
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageColumnResizer} workPageColumnResizer The WorkPageColumnResizer to be rendered.
             */
            render: function (rm, workPageColumnResizer) {
                rm.openStart("div", workPageColumnResizer);
                rm.class("sapCepDivider");
                rm.attr("tabindex", "0");
                rm.openEnd(); // div - tag

                rm.openStart("div");
                rm.class("sapCepDividerInner");
                rm.openEnd(); // div - tag

                rm.close("div");
                rm.close("div");
            }
        }
    });

    /**
     * Initializes the Resizer control. Binds the required event handlers.
     */
    WorkPageColumnResizer.prototype.init = function () {
        this._fnMouseMove = this.mouseMove.bind(this);
        this._fnMouseUp = this.mouseUp.bind(this);
    };

    /**
     * Called if the control is destroyed. Detaches the event handlers.
     */
    WorkPageColumnResizer.prototype.exit = function () {
        window.document.removeEventListener("mousemove", this._fnMouseMove);
        window.document.removeEventListener("mouseup", this._fnMouseUp);
    };

    /**
     * Called if the mouse is released.
     * Removes the listeners that were used to determine the x-position delta.
     */
    WorkPageColumnResizer.prototype.mouseUp = function () {
        window.document.removeEventListener("mouseup", this._fnMouseUp);
        window.document.removeEventListener("mousemove", this._fnMouseMove);

        this.fireEvent("resizerReleased");
    };

    /**
     * Called on mouse move. Fires the "resizerMoved" event.
     * The posXDiff parameter indicates the delta between mouse x-position and the middle of the resizer control.
     *
     * @param {Event} event The native HTML event.
     */
    WorkPageColumnResizer.prototype.mouseMove = function (event) {
        this.fireEvent("resizerMoved", {
          posXDiff: event.pageX - this.getXOrigin()
        });
    };

    /**
     * Called if the mouse button is pressed on this control. Attaches the event listeners to determine the x-position delta.
     */
    WorkPageColumnResizer.prototype.onmousedown = function () {
        window.document.addEventListener("mousemove", this._fnMouseMove);
        window.document.addEventListener("mouseup", this._fnMouseUp);
    };

    /**
     * Keyboard handling
     * @param {Event} oEvent The native HTML event.
     */
    WorkPageColumnResizer.prototype.onkeydown = function (oEvent) {
        // only handle arrow-left or arrow-right keycodes
        if ([37, 39].indexOf(oEvent.keyCode) === -1) { return; }
        var oParentRowControl = this.getParent().getParent();
        var iSingleColumnWidth = oParentRowControl.getSingleColumnWidth();

        // arrow left
        if (oEvent.keyCode === 37) { iSingleColumnWidth = -iSingleColumnWidth; }

        this.fireEvent("resizerMoved", { posXDiff: iSingleColumnWidth });
        this.fireEvent("resizerReleased");
    };

    /**
     * Returns the horizontal center position of the current control instance.
     *
     * @return {number} The result.
     */
    WorkPageColumnResizer.prototype.getXOrigin = function () {
        var oBoundingClientRect = this.$().get(0).getBoundingClientRect();
        return oBoundingClientRect.x + (oBoundingClientRect.width / 2);
    };

    return WorkPageColumnResizer;

});
