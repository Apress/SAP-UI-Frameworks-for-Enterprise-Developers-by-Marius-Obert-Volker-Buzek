/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */

sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/Button",
    "sap/ui/core/dnd/DragInfo",
    "sap/f/dnd/GridDropInfo",
    "sap/f/GridContainer",
    "sap/f/GridContainerSettings",
    "sap/ui/core/library",
    "sap/ushell/ui/launchpad/ExtendedChangeDetection"
], function (
    Control,
    Button,
    DragInfo,
    GridDropInfo,
    GridContainer,
    GridContainerSettings,
    coreLibrary,
    ExtendedChangeDetection
) {
    "use strict";


    // shortcut for sap.ui.core.dnd.DropLayout
    var DropLayout = coreLibrary.dnd.DropLayout;

    // shortcut for sap.ui.core.dnd.DropPosition
    var DropPosition = coreLibrary.dnd.DropPosition;

    /**
     * Constructor for a new WorkPageCell.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * The WorkPageCell represents a collection of WidgetContainers.
     * @extends sap.ui.core.Control
     *
     *
     * @version 1.113.0
     *
     * @private
     * @experimental
     * @alias sap.ushell.components.workPageBuilder.controls.WorkPageCell
     */
    var WorkPageCell = Control.extend("sap.ushell.components.workPageBuilder.controls.WorkPageCell",
        /** @lends sap.ushell.components.workPageBuilder.controls.WorkPageCell.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                /**
                 * Tooltip to display for the "Delete Widget" button
                 */
                deleteWidgetTooltip: { type: "string", defaultValue: "", bindable: true },
                /**
                 * The button text to display
                 */
                addApplicationButtonText: { type: "string", defaultValue: "", bindable: true },
                /**
                 * Flag to show / hide the edit mode controls.
                 */
                editMode: { type: "boolean", defaultValue: false, bindable: true },
                /**
                 * Flag to enable / disable Drag and Drop of Widgets in the widgets aggregation.
                 */
                tileEditMode: { type: "boolean", defaultValue: false, bindable: true },
                /**
                 * Forwarded to GridContainer property "snapToRow". Causes cards to take the full row height
                 */
                snapToRow: { type: "boolean", defaultValue: true, bindable: true },
                /**
                 * Specifies the default value for the grid container's gap property for different screen sizes
                 */
                gridContainerGap: { type: "string", group: "Appearance", defaultValue: "0.5rem", bindable: true },
                gridContainerGapXS: { type: "string", group: "Appearance", defaultValue: "0.475rem", bindable: true },
                gridContainerGapS: { type: "string", group: "Appearance", defaultValue: "0.475rem", bindable: true },
                gridContainerGapM: { type: "string", group: "Appearance", defaultValue: "0.5rem", bindable: true },
                gridContainerGapL: { type: "string", group: "Appearance", defaultValue: "0.5rem", bindable: true },
                gridContainerGapXL: { type: "string", group: "Appearance", defaultValue: "0.5rem", bindable: true },

                /**
                 * Specifies the default value for the row size for different screen sizes
                 */
                gridContainerRowSize: { type: "string", group: "Appearance", defaultValue: "5.25rem", bindable: true },
                gridContainerRowSizeXS: { type: "string", group: "Appearance", defaultValue: "4.375rem", bindable: true },
                gridContainerRowSizeS: { type: "string", group: "Appearance", defaultValue: "5.25rem", bindable: true },
                gridContainerRowSizeM: { type: "string", group: "Appearance", defaultValue: "5.25rem", bindable: true },
                gridContainerRowSizeL: { type: "string", group: "Appearance", defaultValue: "5.25rem", bindable: true },
                gridContainerRowSizeXL: { type: "string", group: "Appearance", defaultValue: "5.25rem", bindable: true }
            },
            defaultAggregation: "widgets",
            aggregations: {
                /**
                 * A set of widgets.
                 */
                widgets: {
                    type: "sap.ui.core.Control",
                    multiple: true,
                    singularName: "widget",
                    bindable: true,
                    dnd: true,
                    forwarding: {
                        getter: "getGridContainer",
                        aggregation: "items"
                    }
                },
                /**
                 * Internal aggregation for the delete button control.
                 */
                _deleteButton: { type: "sap.m.Button", multiple: false, visibility: "hidden" },
                /**
                 * Internal aggregation to hold the grid container
                 */
                _gridContainer: {
                    type: "sap.f.GridContainer",
                    multiple: false,
                    visibility: "hidden"
                },
                /**
                 * A private aggregation for the "Add Applications" button.
                 */
                _addVizInstanceButton: { type: "sap.m.Button", multiple: false, visibility: "hidden" }
            },
            events: {
                /**
                 * Deletes the cell and all of its contents.
                 */
                deleteCell: {},
                /**
                 * Fired when the "Add Applications" button is pressed.
                 */
                addApplications: {},
                /**
                 * Fired when a viz is moved via drag and drop
                 */
                moveVisualization: {},
                /**
                 * Fired when the gridContainer adds or removes grid columns (the grid is resized)
                 */
                gridColumnsChange: {}
            }
        },

        renderer: {
            apiVersion: 2,

            /**
             * Renders the HTML for the WorkPageCell, using the provided {@link sap.ui.core.RenderManager}.
             *
             * @param {sap.ui.core.RenderManager} rm The RenderManager.
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageCell} workPageCell The WorkPageCell to be rendered.
             */
            render: function (rm, workPageCell) {
                rm.openStart("div", workPageCell);
                rm.class("sapCepWorkPageCell");
                rm.openEnd(); // div - tag

                if (workPageCell.getEditMode()) {
                    rm.openStart("div");
                    rm.class("sapCepWidgetToolbar");
                    rm.openEnd(); // div - tag

                    rm.renderControl(workPageCell.getDeleteButton());

                    rm.close("div");
                }

                rm.renderControl(workPageCell.getGridContainer());

                if (workPageCell.getTileEditMode()) {
                    rm.openStart("div");
                    rm.class("sapCepColumnToolbar");
                    rm.openEnd(); // div - tag

                    rm.renderControl(workPageCell.getAddVizInstanceButton());

                    rm.close("div");
                }
                rm.close("div");
            }
        }
    });

    /**
     * Initializes the control
     * Extended Change Detection for the widgets aggregation
     */
    WorkPageCell.prototype.init = function () {
        this._oWidgetsChangeDetection = new ExtendedChangeDetection("widgets", this);
        Control.prototype.init.apply(this, arguments);
    };

    /**
     * Called if the control is destroyed.
     * Detaches event handlers.
     */
    WorkPageCell.prototype.exit = function () {
        this._oWidgetsChangeDetection.destroy();
        Control.prototype.exit.apply(this, arguments);
    };

    /**
     * Creates a new GridContainer if it does not exist yet and saves it to the _gridContainer aggregation.
     * Applies layout data and drag & drop config accordingly.
     *
     * @return {sap.f.GridContainer} The GridContainer control instance.
     */
    WorkPageCell.prototype.getGridContainer = function () {
        var oGridContainer = this.getAggregation("_gridContainer");
        if (!oGridContainer) {
            oGridContainer = this._createGridContainer()
                .attachColumnsChange(function (oEvent) {
                    this.fireEvent("gridColumnsChange", oEvent.getParameters());
                }.bind(this));
            this.setAggregation("_gridContainer", oGridContainer.addStyleClass("sapCepWorkPageGridContainer"));
        }

        // Prevent drop target if we are not in edit mode, if the widgets contain a card inside or if the cell is empty (in this case an Illustrated Message will be shown in the future)
        if (!this.getTileEditMode() || oGridContainer.getItems().length === 0) {
            oGridContainer.removeAllDragDropConfig();
        } else if (oGridContainer.getDragDropConfig().length === 0) {
            oGridContainer
                .addDragDropConfig(new DragInfo({
                    sourceAggregation: "items"
                }))
                .addDragDropConfig(new GridDropInfo({
                    targetAggregation: "items",
                    dropPosition: DropPosition.Between,
                    dropLayout: DropLayout.Horizontal,
                    drop: this.onDrop.bind(this)
                }));
        }

        return oGridContainer
            .setSnapToRow(this.getSnapToRow())
            .setLayoutXL(new GridContainerSettings({
                columnSize: this.getGridContainerRowSizeXL(),
                rowSize: this.getGridContainerRowSizeXL(),
                gap: this.getGridContainerGapXL()
            }))
            .setLayoutL(new GridContainerSettings({
                columnSize: this.getGridContainerRowSizeL(),
                rowSize: this.getGridContainerRowSizeL(),
                gap: this.getGridContainerGapL()
            }))
            .setLayoutM(new GridContainerSettings({
                columnSize: this.getGridContainerRowSizeM(),
                rowSize: this.getGridContainerRowSizeM(),
                gap: this.getGridContainerGapM()
            }))
            .setLayoutS(new GridContainerSettings({
                columnSize: this.getGridContainerRowSizeS(),
                rowSize: this.getGridContainerRowSizeS(),
                gap: this.getGridContainerGapS()
            }))
            .setLayout(new GridContainerSettings({
                columnSize: this.getGridContainerRowSize(),
                rowSize: this.getGridContainerRowSize(),
                gap: this.getGridContainerGap()
            }));
    };

    /**
     * Creates a new GridContainer and saves it to the aggregation.
     * If it already exists, returns the existing instance.
     *
     * @return {sap.f.GridContainer} The GridContainer control instance.
     * @private
     */
    WorkPageCell.prototype._createGridContainer = function () {
        return new GridContainer(this.getId() + "--sapCepWorkPageCellGridContainer", {
            containerQuery: false,
            minHeight: "11rem"
        });
    };

    /**
     * Called when a viz is dropped into the cell.
     * @param {sap.f.dnd.GridDropInfo} oEvent The GridDropInfo
     */
    WorkPageCell.prototype.onDrop = function (oEvent) {
        this.fireEvent("moveVisualization", oEvent.getParameters());
    };

    /**
     * Checks if the aggregation for the delete button exists. If not, create and store it.
     *
     * @return {sap.m.Button} The button control.
     */
    WorkPageCell.prototype.getDeleteButton = function () {
        if (!this.getAggregation("_deleteButton")) {
            this.setAggregation("_deleteButton", new Button({
                icon: "sap-icon://delete",
                tooltip: this.getDeleteWidgetTooltip(),
                press: function () {
                    this.fireEvent("deleteCell");
                }.bind(this)
            }));
        }
        return this.getAggregation("_deleteButton");
    };

    /**
     * Checks if the button control already exists in the aggregation. If not, it will be created and saved in the aggregation.
     *
     * @return {sap.m.Button} The button control.
     */
    WorkPageCell.prototype.getAddVizInstanceButton = function () {
        if (!this.getAggregation("_addVizInstanceButton")) {
            this.setAggregation("_addVizInstanceButton", this._createAddVizInstanceButton());
        }
        return this.getAggregation("_addVizInstanceButton");
    };

    /**
     * Creates the Add Application button for this cell.
     *
     * @return {sap.m.Button} The button control.
     * @private
     */
    WorkPageCell.prototype._createAddVizInstanceButton = function () {
        return new Button({
            text: this.getAddApplicationButtonText(),
            visible: true,
            press: function () {
                this.fireEvent("addApplications");
            }.bind(this)
        });
    };

    return WorkPageCell;
});
