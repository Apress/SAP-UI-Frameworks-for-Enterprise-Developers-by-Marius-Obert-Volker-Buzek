/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */

sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/Icon"
], function (
    Control,
    Icon
) {
    "use strict";

    /**
     * Constructor for a new WorkPageButton.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * The WorkPageButton is used for "Add Row / Column" actions.
     * @extends sap.ui.core.Control
     *
     *
     * @version 1.113.0
     *
     * @private
     * @experimental
     * @alias sap.ushell.components.workPageBuilder.controls.WorkPageButton
     */
    var WorkPageButton = Control.extend("sap.ushell.components.workPageBuilder.controls.WorkPageButton",
        /** @lends sap.ushell.components.workPageBuilder.controls.WorkPageButton.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                /**
                 * Icon to be displayed on the button.
                 */
                icon: { type: "sap.ui.core.URI", defaultValue: "", bindable: true },
                /**
                 * Tooltip to show on button hover.
                 */
                tooltip: { type: "string", defaultValue: "", bindable: true }
            },
            aggregations: {
                /**
                 * Private aggregation to store the icon control.
                 * @private
                 */
                _icon: { type: "sap.ui.core.Icon", multiple: false, defaultValue: null, visibility: "hidden" }
            },
            events: {
                /**
                 * Fired if the button is pressed.
                 */
                press: {}
            }
        },
        renderer: {
            apiVersion: 2,

            /**
             * Renders the HTML for the WorkPageButton, using the provided {@link sap.ui.core.RenderManager}.
             *
             * @param {sap.ui.core.RenderManager} rm The RenderManager.
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageButton} workPageButton The WorkPageButton to be rendered.
             */
            render: function (rm, workPageButton) {
                rm.openStart("button", workPageButton);
                rm.class("sapCepAddButton");
                rm.attr("title", workPageButton.getTooltip());
                rm.openEnd(); // button tag

                rm.openStart("span");
                rm.class("sapCepAddButtonInner");
                rm.openEnd(); // span tag
                rm.renderControl(workPageButton.getIconControl());
                rm.close("span");

                rm.close("button");
            }
        }
    });

    /**
     * Initialize the control and bind the click listener function.
     */
    WorkPageButton.prototype.init = function () {
        this._fnHandleClick = this.onClick.bind(this);
        Control.prototype.init.apply(this, arguments);
    };

    /**
     * Called if the button click event is fired.
     * Suppresses the native dom event and fires a UI5 "press" event.
     *
     * @param {PointerEvent} oDomEvent The DOM event.
     */
    WorkPageButton.prototype.onClick = function (oDomEvent) {
        oDomEvent.preventDefault();
        oDomEvent.stopPropagation();
        this.fireEvent("press");
    };

    /**
     * Lifecycle method. Removes the click listener from the button DOM element.
     */
    WorkPageButton.prototype.onBeforeRendering = function () {
        if (this.getDomRef()) {
            this.getDomRef().removeEventListener("click", this._fnHandleClick);
        }
    };

    /**
     * Lifecycle method. Adds the click listener to the button DOM element.
     */
    WorkPageButton.prototype.onAfterRendering = function () {
        this.getDomRef().addEventListener("click", this._fnHandleClick);
    };

    /**
     * Returns the icon control. If the aggregation exists,
     * the icon is taken from the aggregation, otherwise it is created.
     *
     * @return {sap.ui.core.Icon} The icon control.
     */
    WorkPageButton.prototype.getIconControl = function () {
        if (!this.getAggregation("_icon")) {
            this.setAggregation("_icon", new Icon({
                src: this.getIcon(),
                tooltip: this.getTooltip()
            }).addStyleClass("sapCepAddButtonIcon"));
        }
        return this.getAggregation("_icon");
    };

    return WorkPageButton;

});
