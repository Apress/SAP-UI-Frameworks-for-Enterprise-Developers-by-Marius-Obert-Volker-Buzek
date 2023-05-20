/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */

sap.ui.define([
    "sap/ui/core/Control",
    "sap/ushell/components/workPageBuilder/controls/WorkPageButton",
    "sap/ushell/ui/launchpad/ExtendedChangeDetection",
    "sap/ushell/components/workPageBuilder/controls/WorkPageRowRenderer"
], function (
    Control,
    WorkPageButton,
    ExtendedChangeDetection,
    Renderer
) {
    "use strict";
    /**
     * Constructor for a new WorkPageRow.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * The WorkPageRow represents a title and a collection of WorkPageColumns.
     * In edit mode, there are "Add Row" buttons rendered, additionally.
     * @extends sap.ui.core.Control
     *
     *
     * @version 1.113.0
     *
     * @private
     * @experimental
     * @alias sap.ushell.components.workPageBuilder.controls.WorkPageRow
     */
    var WorkPageRow = Control.extend("sap.ushell.components.workPageBuilder.controls.WorkPageRow", /** @lends sap.ushell.components.workPageBuilder.controls.WorkPageRow.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                /**
                 * Indicating if the WorkPageRow should render itself in edit mode.
                 */
                editMode: { type: "boolean", group: "Misc", defaultValue: false, bindable: true },
                /**
                 * The tooltip text to display for the "Add Row" button
                 */
                addRowButtonTooltip: { type: "string", group: "Misc", defaultValue: "", bindable: true }
            },
            defaultAggregation: "columns",
            aggregations: {
                /**
                 * A set of WorkPage Columns which are rendered horizontally in the WorkPageRow.
                 */
                columns: { type: "sap.ushell.components.workPageBuilder.controls.WorkPageColumn", multiple: true, singularName: "column" },
                /**
                 * The header toolbar that displays the title
                 */
                headerBar: { type: "sap.m.IBar", multiple: false },
                /**
                 * The buttons for row editing, such as delete or config
                 */
                controlButtons: { type: "sap.m.Button", multiple: true, singularName: "controlButton" },
                /**
                 * The title of the row shown in display mode.
                 */
                title: { type: "sap.m.Title", multiple: false },
                /**
                 * Private aggregation to store the "Add Row" button.
                 * @private
                 */
                _addButtonBottom: { type: "sap.ushell.components.workPageBuilder.controls.WorkPageButton", multiple: false, visibility: "hidden" },
                /**
                 * Private aggregation to store the "Add Row" button.
                 * @private
                 */
                _addButtonTop: { type: "sap.ushell.components.workPageBuilder.controls.WorkPageButton", multiple: false, visibility: "hidden" }
            },
            events: {
                /**
                 * Fired if an "Add Row" button was pressed.
                 */
                addRow: {
                    parameters: {
                        /**
                         * Indicates if the new WorkPageRow should be added after or before the current one.
                         */
                        bottom: { type: "boolean" }
                    }
                }
            }
        },
        renderer: Renderer
    });

    /**
     * Initializes the control.
     * Extended Change Detection for the columns aggregation
     */
    WorkPageRow.prototype.init = function () {
        this._oColumnsChangeDetection = new ExtendedChangeDetection("columns", this);
        Control.prototype.init.apply(this, arguments);
    };

    /**
     * Called if the control is destroyed.
     * Detaches the listeners
     */
    WorkPageRow.prototype.exit = function () {
        this._oColumnsChangeDetection.destroy();
        Control.prototype.exit.apply(this, arguments);
    };

    /**
     * Returns the width of one single column in the row.
     * There are max. 24 columns.
     *
     * @return {number} The value.
     */
    WorkPageRow.prototype.getSingleColumnWidth = function () {
        return this.$().width() / 24;
    };

    /**
     * Called when the control or any child element of the control gains focus.
     * Adds focused class to control.
     */
    WorkPageRow.prototype.onfocusin = function () {
        if (!this.hasStyleClass("sapCepWorkPageRowFocused")) {
            this.addStyleClass("sapCepWorkPageRowFocused");
        }
    };

    /**
     * Called when focus leaves the control and any child element of the control.
     * Removes focused class from control.
     */
    WorkPageRow.prototype.onfocusout = function () {
        if (this.hasStyleClass("sapCepWorkPageRowFocused")) {
            this.removeStyleClass("sapCepWorkPageRowFocused");
        }
    };

    /**
     * Creates a new "Add Row" button at the given position.
     * @param {string} sPosition The position of the button ("top"|"bottom").
     * @return {sap.ushell.components.workPageBuilder.controls.WorkPageButton} The WorkPageButton control.
     * @private
     */
    WorkPageRow.prototype._createAddButton = function (sPosition) {
        var sClass = sPosition === "bottom" ? "sapCepRowButtonBottom" : "sapCepRowButtonTop";

        return new WorkPageButton({
            icon: "sap-icon://add",
            tooltip: this.getAddRowButtonTooltip(),
            press: function () {
                this.fireEvent("addRow", {
                    bottom: sPosition === "bottom"
                });
            }.bind(this)
        }).addStyleClass("sapCepRowButton " + sClass);
    };

    /**
     * Checks if the "Add Row" button for the given position already exists in the aggregation. If not, a new
     * button is created and stored.
     *
     * @param {string} sPosition The button position.
     * @return {sap.ushell.components.workPageBuilder.controls.WorkPageButton} The WorkPageButton control.
     */
    WorkPageRow.prototype.getAddButton = function (sPosition) {
        if (sPosition === "bottom") {
            if (!this.getAggregation("_addButtonBottom")) {
                this.setAggregation("_addButtonBottom", this._createAddButton(sPosition));
            }
            return this.getAggregation("_addButtonBottom");
        } else if (!this.getAggregation("_addButtonTop")) {
            this.setAggregation("_addButtonTop", this._createAddButton(sPosition));
        }
        return this.getAggregation("_addButtonTop");
    };

    return WorkPageRow;

});
