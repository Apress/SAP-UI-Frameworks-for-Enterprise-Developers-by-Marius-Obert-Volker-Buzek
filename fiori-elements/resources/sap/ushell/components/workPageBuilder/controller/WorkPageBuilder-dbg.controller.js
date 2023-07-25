//Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file WorkPageBuilder controller for WorkPageBuilder view
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/resources",
    "sap/base/Log",
    "sap/ui/core/Core",
    "sap/ui/core/Component",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/utils",
    "sap/ui/integration/widgets/Card",
    "sap/ui/core/Fragment",
    "sap/ui/integration/Host",
    "sap/base/util/ObjectPath",
    "sap/ui/model/json/JSONModel",
    "sap/f/GridContainerItemLayoutData",
    "sap/ushell/EventHub",
    "sap/ushell/Config",
    "sap/ui/core/theming/Parameters",
    "sap/m/library",
    "sap/ushell/services/_VisualizationInstantiation/VizInstanceCdm",
    "sap/ushell/adapters/cdm/v3/utilsCdm",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readUtils",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readVisualizations",
    "sap/ushell/services/VisualizationInstantiation",
    "sap/ui/core/InvisibleMessage",
    "sap/ui/core/library"
], function (
    resources,
    Log,
    Core,
    Component,
    Controller,
    utils,
    Card,
    Fragment,
    Host,
    ObjectPath,
    JSONModel,
    GridContainerItemLayoutData,
    EventHub,
    Config,
    Parameters,
    mLibrary,
    VizInstanceCdm,
    utilsCdm,
    readUtils,
    readVisualizations,
    VisualizationInstantiation,
    InvisibleMessage,
    coreLibrary
) {
    "use strict";

    var MIN_GRID_COLUMN_WIDTH = 4;
    var MAX_GRID_COLUMN_WIDTH = 24;
    var STEP_SIZE = 2;
    var MAX_COLS = 6;

    var LoadState = mLibrary.LoadState;
    var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;

    /**
     * Controller of the WorkPageBuilder view.
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameters
     * @class
     * @assigns sap.ui.core.mvc.Controller
     * @private
     * @since 1.99.0
     * @alias sap.ushell.components.workPageBuilder.controller.WorkPages
     */
    return Controller.extend("sap.ushell.components.workPageBuilder.controller.WorkPageBuilder",
        /** @lends sap.ushell.components.workPageBuilder.controller.WorkPageBuilder.prototype */ {

            onInit: function () {
                this._fnDeleteRowHandler = this.deleteRow.bind(this);

                this.oModel = new JSONModel({
                    editMode: false,
                    loaded: false,
                    navigationDisabled: false,
                    showFooter: false,
                    data: {
                        WorkPage: null,
                        Visualizations: [],
                        UsedVisualizations: []
                    }
                });
                this.oModel.setSizeLimit(Infinity);
                this._saveHost();

                this._oViewSettingsModel = new JSONModel({
                    gridContainerGap: {},
                    gridContainerRowSize: {}
                });
                this.getView().setModel(this._oViewSettingsModel, "viewSettings");

                var fnBoundSetGridContainerSizes = this._setGridContainerSizes.bind(this);
                Config.on("/core/home/sizeBehavior").do(fnBoundSetGridContainerSizes);
                EventHub.on("themeChanged").do(fnBoundSetGridContainerSizes);
                this._setGridContainerSizes();

                this.byId("sapCepWorkPage").bindElement({
                    path: "/data/WorkPage"
                });

                return this.getOwnerComponent().getVizInstantiationPromise()
                    .then(function (oVisualizationInstantiation) {
                        this._oVizInstantiationService = oVisualizationInstantiation;
                        this.getView().setModel(this.oModel);
                    }.bind(this));
            },

            /**
             * Handler for the "addColumn" event of the WorkPageColumn.
             * Creates an empty column on the left or the right of the event source and calculates
             * the new width of the neighboring columns.
             *
             * @param {sap.base.Event} oEvent The "addColumn" event.
             */
            onAddColumn: function (oEvent) {
                var oModel = this.getView().getModel();
                var oColumnControl = oEvent.getSource();
                var oRow = oColumnControl.getParent();
                var iColumnIndex = oRow.indexOfAggregation("columns", oColumnControl);
                var sRowBindingContextPath = oRow.getBindingContext().getPath();
                var sColumnPath = sRowBindingContextPath + "/Columns/";
                var sColumnColumnWidthPath = oColumnControl.getBindingContext().getPath() + "/Descriptor/columnWidth";
                var aColumnsData = oModel.getProperty(sColumnPath);
                var iColumnCount = aColumnsData.length;
                var bAddToLeft = oEvent.getParameter("left");
                if (iColumnCount >= MAX_COLS) {
                    return;
                }
                var iColumnWidth = oColumnControl.getProperty("columnWidth");
                var iColSize = Math.floor(iColumnWidth / 2) >= MIN_GRID_COLUMN_WIDTH ? Math.floor(iColumnWidth / 2) : MIN_GRID_COLUMN_WIDTH;
                var iModulo = iColSize % 2;
                oModel.setProperty(sColumnColumnWidthPath, iColSize + iModulo);

                var iIndex = oRow.indexOfAggregation("columns", oColumnControl) + (bAddToLeft === true ? 0 : 1);
                var oNewColumn = this._createEmptyColumn(iColSize - iModulo);

                // Insert the new column by creating a new array to avoid mutation of the original array.
                var aNewColumnsData = [aColumnsData.slice(0, iIndex), oNewColumn, aColumnsData.slice(iIndex)].flat();

                var iTotalColumns = aNewColumnsData.reduce(function (iAccumulator, oSingleColumn) {
                    return iAccumulator + this._getColumnWidth(oSingleColumn);
                }.bind(this), 0);

                if (iTotalColumns > MAX_GRID_COLUMN_WIDTH) {
                    this._calculateColWidths(aNewColumnsData, iColumnIndex, iTotalColumns);
                }
                oModel.setProperty(sColumnPath, aNewColumnsData);
                this.getOwnerComponent().fireEvent("workPageEdited");
            },

            /**
             * Set the editMode to true or false
             * @param {boolean} bEditMode true or false
             *
             * @private
             * @since 1.109.0
             */
            setEditMode: function (bEditMode) {
                this.oModel.setProperty("/editMode", !!bEditMode);
            },

            /**
             * Get the editMode property from the model
             * @returns {boolean} the editMode property value
             * @private
             * @since 1.109.0
             */
            getEditMode: function () {
                return this.oModel.getProperty("/editMode");
            },

            /**
             * Set the showFooter property to true or false
             * @param {boolean} bVisible true or false
             *
             * @private
             * @since 1.110.0
             */
            setShowFooter: function (bVisible) {
                this.oModel.setProperty("/showFooter", !!bVisible);
            },

            /**
             * Set the model data with the WorkPage data
             * @param {{WorkPage: object, UsedVisualizations: object[]}} oPageData WorkPage data object
             *
             * @private
             * @since 1.109.0
             */
            setPageData: function (oPageData) {
                var oMappedVisualizations = {};
                var aUsedVisualizations = ObjectPath.get("WorkPage.UsedVisualizations.nodes", oPageData);
                var oWorkPageContents = ObjectPath.get("WorkPage.Contents", oPageData);

                if (aUsedVisualizations && aUsedVisualizations.length > 0) {
                    // create a map for the UsedVisualizations using the Id as a key.
                    oMappedVisualizations = aUsedVisualizations.reduce(function (oAcc, oViz) {
                        oAcc[oViz.Id] = oViz;
                        return oAcc;
                    }, {});
                }

                this.oModel.setProperty("/data/UsedVisualizations", oMappedVisualizations);
                this.oModel.setProperty("/data/WorkPage", oWorkPageContents);
                this.oModel.setProperty("/loaded", true);
            },

            /**
             * Get the WorkPage data from the model.
             * It must also include the UsedVisualizations array, because of the reuse scenario.
             * It is necessary that the same data structure is returned that is put into setPageData.
             *
             * @return {{WorkPage: {Contents: object, UsedVisualizations: {nodes: object[]} }}} The WorkPage data to save.
             * @private
             * @since 1.109.0
             */
            getPageData: function () {
                var oMappedVisualizations = this.oModel.getProperty("/data/UsedVisualizations") || {};
                return {
                    WorkPage: {
                        Contents: this.oModel.getProperty("/data/WorkPage"),
                        UsedVisualizations: {
                            nodes: Object.values(oMappedVisualizations)
                        }
                    }
                };
            },

            /**
             * Set the Visualization data for the ContentFinder
             * @param {{Visualizations: {nodes: object[]}}} oVizNodes an Array of Visualizations' objects
             *
             * @private
             * @since 1.109.0
             */

            setVisualizationData: function (oVizNodes) {
                return this.oContentFinderPromise.then(function (oContentFinder) {
                    this.oModel.setProperty("/data/Visualizations", oVizNodes);
                    oContentFinder.setVisualizationData(this.oModel.getProperty("/data/Visualizations"));
                }.bind(this));
            },

            /**
             * Called if the amount of grid columns in the GridContainer of a WorkPageCell changes.
             * Sets all the cards in the cell to the new amount of columns.
             *
             * @param {sap.base.Event} oEvent The gridColumnsChange event.
             */
            onGridColumnsChange: function (oEvent) {
                var iColumnCount = oEvent.getParameter("columns");
                var oCell = oEvent.getSource();

                oCell.getWidgets().filter(function (oItem) {
                    return oItem.isA("sap.ui.integration.widgets.Card");
                }).forEach(function (oCard) {
                    oCard.setLayoutData(new GridContainerItemLayoutData({
                        columns: iColumnCount,
                        minRows: 1
                    }));
                });
            },

            /**
             * Handler for the "removeColumn" event of the WorkPageColumn.
             * Removes the column that issues the event and calculates the width of the remaining columns.
             *
             * @param {sap.base.Event} oEvent The "removeColumn" event.
             */
            onDeleteColumn: function (oEvent) {
                var oModel = this.getView().getModel();
                var oColumn = oEvent.getSource();
                var iColumnWidth = oColumn.getColumnWidth();
                var oRow = oColumn.getParent();
                var iColumnIndex = oRow.indexOfAggregation("columns", oColumn);
                var sRowBindingContextPath = oRow.getBindingContext().getPath();
                var sColumnPath = sRowBindingContextPath + "/Columns/";
                var aColumns = oModel.getProperty(sColumnPath);

                // filter out the column at the iColumnIndex instead of splicing to avoid mutation of the original array.
                var aNewColumns = aColumns.filter(function (oCol, iIndex) {
                    return iIndex !== iColumnIndex;
                });

                // split the columnWidth among remaining cols
                var iLoopCount = (iColumnWidth / 2);
                var iIndex = iColumnIndex - 1 < 0 ? iColumnIndex : iColumnIndex - 1;
                while (iLoopCount > 0) {
                    var oCurrentColumn = aNewColumns[iIndex];
                    this._setColumnWidth(oCurrentColumn, (this._getColumnWidth(oCurrentColumn)) + STEP_SIZE);
                    iIndex = ++iIndex >= aNewColumns.length ? 0 : iIndex++;
                    iLoopCount--;
                }

                oModel.setProperty(sColumnPath, aNewColumns);
                this.getOwnerComponent().fireEvent("workPageEdited");
            },

            /**
             * Handler for the "Add Row" button on an empty WorkPage.
             * Creates an array with an empty row and sets it to the model.
             *
             */
            onAddFirstRow: function () {
                var sRowsPath = "/data/WorkPage/Rows/";
                this.getView().getModel().setProperty(sRowsPath, [this._createEmptyRow()]);
                this.getOwnerComponent().fireEvent("workPageEdited");
            },

            /**
             * Handler for the "Add Row" button on a WorkPageRow.
             * Creates a new empty row and adds it to the existing rows.
             *
             * @param {sap.base.Event} oEvent The "addRow" event.
             */
            onAddRow: function (oEvent) {
                var oModel = this.getView().getModel();
                var oRow = oEvent.getSource();
                var oPage = this.byId("sapCepWorkPage");
                var sRowsPath = "/data/WorkPage/Rows/";
                var aRows = oModel.getProperty(sRowsPath);
                var oNewRow = this._createEmptyRow();

                var iIndex = oPage.indexOfAggregation("rows", oRow) + (oEvent.getParameter("bottom") === true ? 1 : 0);

                // Insert the new row into the array by creating a new array to avoid mutation.
                var aNewRows = [aRows.slice(0, iIndex), oNewRow, aRows.slice(iIndex)].flat();

                oModel.setProperty(sRowsPath, aNewRows);
                this.getOwnerComponent().fireEvent("workPageEdited");
            },

            /**
             * Handler for the "columnResized" event issued by the WorkPageColumn.
             * Calculates the required resize steps left or right and updates the model accordingly.
             *
             * @param {sap.base.Event} oEvent The "columnResized" event.
             */
            onResize: function (oEvent) {
                var iDiff = oEvent.getParameter("posXDiff");
                var oColumn = oEvent.getSource();
                var oRow = oColumn.getParent();
                var iColumnWidth = oRow.getSingleColumnWidth();
                var fDeltaFromOrigin, iColumnsDelta, sDragDirection, iRightColumnIndex, iLeftColumnIndex,
                    iLeftColumnWidth, iRightColumnWidth, oResult;

                if (iColumnWidth === 0) {
                    return;
                }

                fDeltaFromOrigin = iDiff / iColumnWidth;

                if (fDeltaFromOrigin > -1 && fDeltaFromOrigin < 1) {
                    return;
                }

                iColumnsDelta = fDeltaFromOrigin < 0 ? Math.floor(iDiff / iColumnWidth) : Math.ceil(iDiff / iColumnWidth);
                sDragDirection = iColumnsDelta >= 0 ? "right" : "left";
                iRightColumnIndex = oRow.indexOfAggregation("columns", oColumn);
                iLeftColumnIndex = iRightColumnIndex - 1;
                iLeftColumnWidth = this._getCurrentColumnWidth(oRow, iLeftColumnIndex);
                iRightColumnWidth = this._getCurrentColumnWidth(oRow, iRightColumnIndex);

                oResult = this._doColumnResizeStep(oRow, iLeftColumnIndex, iRightColumnIndex, iLeftColumnWidth, iRightColumnWidth, sDragDirection);
                if (oResult) {
                    this._updateModelWithColumnWidths(oRow, iLeftColumnIndex, iRightColumnIndex, oResult.newLeftColumnWidth, oResult.newRightColumnWidth);
                }
            },

            /**
             * Handler for the "columnResizeCompleted" event issued by the WorkPageColumn.
             * Fires the "workPageEdited" event to indicate that there was a data change.
             *
             */
            onResizeCompleted: function () {
                this.getOwnerComponent().fireEvent("workPageEdited");
            },

            /**
             * Deletes the cell from the model.
             *
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageCell} oCell The cell control instance.
             */
            _deleteCell: function (oCell) {
                var oModel = this.getView().getModel();
                var oColumn = oCell.getParent();
                var iCellIndex = oColumn.indexOfAggregation("cells", oCell);
                var sCellsPath = oColumn.getBindingContext().getPath() + "/Cells";
                var aCells = oModel.getProperty(sCellsPath);

                // Filter out the cell at iCellIndex instead of splicing to avoid mutation of the original array.
                var aNewCells = aCells.filter(function (oOriginalCell, iIndex) {
                    return iIndex !== iCellIndex;
                });

                oModel.setProperty(sCellsPath, aNewCells);
                this.getOwnerComponent().fireEvent("workPageEdited");
            },

            /**
             * Called if a cell is deleted.
             *
             * @param {sap.base.Event} oEvent The press event.
             */
            onDeleteCell: function (oEvent) {
                this._deleteCell(oEvent.getSource());
            },

            /**
             * Handler for the "deleteVisualization" event issued by the VizInstance.
             * Deletes the visualization from the model.
             *
             * @param {sap.ushell.ui.launchpad.VizInstanceCdm|sap.ushell.ui.launchpad.VizInstanceLink} oVizInstance the viz instance.
             */
            _deleteVisualization: function (oVizInstance) {
                var oCell = oVizInstance.getParent().getParent();
                var oVizInstanceContext = oVizInstance.getBindingContext();
                var sVizInstancePath = oVizInstanceContext.getPath();
                var oModel = this.getView().getModel();
                var sWidgetsPath = sVizInstancePath.substring(0, sVizInstancePath.lastIndexOf("/"));
                var iWidgetIndex = oCell.indexOfAggregation("widgets", oVizInstance);
                var aWidgets = oModel.getProperty(sWidgetsPath);

                // Filter out the widget at iWidgetIndex instead of splicing to avoid mutation of the original array.
                var aNewWidgets = aWidgets.filter(function (oWidget, iIndex) {
                    return iIndex !== iWidgetIndex;
                });

                oModel.setProperty(sWidgetsPath, aNewWidgets);
                this.getOwnerComponent().fireEvent("workPageEdited");
            },

            /**
             * Handler for the "change" event of the edit title input.
             * Set the dirty flag
             */
            onEditTitle: function () {
                this.getOwnerComponent().fireEvent("workPageEdited");
            },

            /**
             * Handler for the "addWidget" event of the ContentFinderDialog.
             * Set the dirty flag
             */
            onWidgetAdded: function () {
                this.getOwnerComponent().fireEvent("workPageEdited");
            },

            /**
             * Returns an array of WidgetGroups to set then in the Content Finder's widget gallery
             *
             * @since 1.113.0
             * @return {object[]} the WidgetGroups array
             * @private
             */
            _getWidgetGroups: function () {
                var aWidgetGroups = [{
                    id: "applicationWidgets",
                    title: resources.i18n.getText("ContentFinder.Categories.Applications.Title"),
                    widgets: [{
                        id: "widgets-tiles",
                        title: resources.i18n.getText("ContentFinder.Widgets.Tiles.Title"),
                        description: resources.i18n.getText("ContentFinder.Widgets.Tiles.Description"),
                        icon: "sap-icon://header",
                        target: "appSearch_tiles"
                    }, {
                        id: "widgets-cards",
                        title: resources.i18n.getText("ContentFinder.Widgets.Cards.Title"),
                        description: resources.i18n.getText("ContentFinder.Widgets.Cards.Description"),
                        icon: "sap-icon://card",
                        target: "appSearch_cards"
                    }]
                }];

                return aWidgetGroups;
            },


            /**
             * Create the ContentFinder Component
             * @returns {Promise} A Promise that resolves the ContentFinderComponent
             *
             * @since 1.113.0
             * @private
            */
            createContentFinderComponent: function () {
                this.oContentFinderPromise = Component.create({
                    name: "sap.ushell.components.contentFinder"
                }).then(function (oContentFinder) {
                    return oContentFinder;
                });

                return this.oContentFinderPromise;
            },

            /**
             * Open ContentFinder's WidgetGallery view
             * @param {sap.base.Event} oEvent The "addWidget" event.
             * @returns {Promise} Promise that resolves the ContenFinder Component
             *
             * @since 1.113.0
             * @public
            */
            openWidgetGallery: function (oEvent) {
                var oSource = oEvent.getSource(); //WorkPageColumn

                if (!this.oContentFinderPromise) { this.oContentFinderPromise = this.createContentFinderComponent(); }

                this.getOwnerComponent().fireEvent("visualizationFilterApplied");

                return this.oContentFinderPromise.then(function (oContentFinder) {
                    oContentFinder.setWidgetGroups(this._getWidgetGroups());
                    oContentFinder.attachVisualizationsAdded(oSource, this._onAddVisualization, this);
                    oContentFinder.show("widgetGallery");
                }.bind(this));
            },

            /**
             * Open ContentFinder's AppSearch view
             * @param {sap.base.Event} oEvent The "addApplications" event
             * @returns {Promise} Promise that resolves the ContenFinder Component
             *
             * @since 1.113.0
             * @public
            */
            openTilesAppSearch: function (oEvent) {
                var oSource = oEvent.getSource(); //WorkPageCell
                var aFilters = ["sap.ushell.StaticAppLauncher", "sap.ushell.DynamicAppLauncher"];

                if (!this.oContentFinderPromise) { this.oContentFinderPromise = this.createContentFinderComponent(); }

                this.getOwnerComponent().fireEvent("visualizationFilterApplied", {
                    filters: [{ filterKey: "Type", filterValue: aFilters }]
                });

                return this.oContentFinderPromise.then(function (oContentFinder) {
                    oContentFinder.setContextData({ restrictedVisualizations: this._getRestrictedVisualizationIds(oSource) });
                    oContentFinder.setRestrictedMode(true);
                    oContentFinder.attachVisualizationsAdded(oSource, this._onAddVisualization, this);
                    oContentFinder.show("appSearch_tiles");
                }.bind(this));
            },


            /**
             * Returns an array of Widget's VizRefIds. The Widgets are contained in the WorkPageCell
             *
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageCell} oCell The WorkPageCell control.
             * @return {string[]} The VizRefIds array
             *
             * @since 1.113.0
             * @private
             */
            _getRestrictedVisualizationIds: function (oCell) {
                var aRestrictedVizIds = [];
                aRestrictedVizIds = oCell.getWidgets().map(function (oWidget) {
                    if (oWidget.isA("sap.ushell.ui.launchpad.VizInstanceCdm")) {
                        return oWidget.getProperty("vizRefId");
                    }
                });

                return aRestrictedVizIds;
            },

            /**
             * Add Visualization to the WorkPageColum or WorkPageCell
             * @param {sap.base.Event} oEvent The "addApplications" event.
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageCell|sap.ushell.components.workPageBuilder.controls.WorkPageColumn} oSource The WorkPageColumn or WorkPageCell control
             *
             * @since 1.113.0
             * @private
            */
            _onAddVisualization: function (oEvent, oSource) {
                var aSelectedVisualizations = oEvent.getParameter("visualizations");

                if (aSelectedVisualizations.length > 0) {
                    aSelectedVisualizations.forEach(function (oVisualization) {
                        var sVizSelectedItemPath = "/data/UsedVisualizations/" + oVisualization.id;
                        if (!this.oModel.getProperty(sVizSelectedItemPath)) {
                            this.oModel.setProperty(sVizSelectedItemPath, oVisualization.vizData);
                        }
                    }.bind(this));

                    var aWidgetData = this._instantiateWidgetData(aSelectedVisualizations);

                    if (oSource.isA("sap.ushell.components.workPageBuilder.controls.WorkPageCell")) { this._setCellData(oSource, aWidgetData); }
                    if (oSource.isA("sap.ushell.components.workPageBuilder.controls.WorkPageColumn")) { this._setColumnData(oSource, aWidgetData); }
                }

            },

            /**
             * For each selected visualization in the ContentFinder, instantiate the initial WidgetData
             * @param {object[]} aSelectedVisualizations The ContentFinder's selected visualizations
             * @return {object[]} The WidgetData array
             *
             * @since 1.113.0
             * @private
            */
            _instantiateWidgetData: function (aSelectedVisualizations) {
                var aWidgetData = [];
                var aIds = [];
                var sId;

                aWidgetData = aSelectedVisualizations.map(function (oTile) {
                    sId = this._generateUniqueId(aIds);
                    aIds = aIds.concat([sId]);
                    return {
                        Id: sId,
                        DescriptorSchemaVersion: "3.2.0",
                        Descriptor: {},
                        Visualization: {
                            Id: oTile.vizData.Id,
                            Type: oTile.type
                        }
                    };
                }.bind(this));

                return aWidgetData;
            },

            /**
             * Add Widgets into the WorkPageCell's Widgets aggregation
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageCell} oCell The WorkPageCell control.
             * @param {object[]} aWidgetData The WidgetData array
             *
             * @since 1.113.0
             * @private
            */
            _setCellData: function (oCell, aWidgetData) {
                var sCellPath = oCell.getBindingContext().getPath();
                var oCellData = Object.assign({}, this.oModel.getProperty(sCellPath));

                oCellData.Widgets = oCellData.Widgets.concat(aWidgetData);

                this.oModel.setProperty(sCellPath, oCellData);
                this.onWidgetAdded();
            },

            /**
             * Add Widgets into WorkPageColumn's Cell aggregation
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageColumn} oColumn The WorkPageCell control.
             * @param {object[]} aWidgetData The WidgetData array
             *
             * @since 1.113.0
             * @private
            */
            _setColumnData: function (oColumn, aWidgetData) {
                var sColumnPath = oColumn.getBindingContext().getPath();
                var oColumnData = Object.assign({}, this.oModel.getProperty(sColumnPath));

                if (!oColumnData.Cells) { oColumnData.Cells = []; }

                oColumnData.Cells = oColumnData.Cells.concat([{
                    Id: this._generateUniqueId(),
                    DescriptorSchemaVersion: "3.2.0",
                    Descriptor: {},
                    Widgets: aWidgetData.concat([])
                }]);

                this.oModel.setProperty(sColumnPath, oColumnData);
                this.onWidgetAdded();
            },

            /**
             * Handler for the "press" event in the WorkPageRow OverflowToolbar button.
             * Opens a confirmation dialog.
             * @return {Promise} A promise resolving when the dialog was opened.
             * @param {sap.base.Event} oEvent The "deleteRow" event.
             */
            onDeleteRow: function (oEvent) {
                var oRootView = this.getOwnerComponent().getRootControl();
                var oWorkPageRowContext = oEvent.getSource().getBindingContext();

                if (!this.oLoadDeleteDialog) {
                    this.oLoadDeleteDialog = Fragment.load({
                        id: oRootView.createId("rowDeleteDialog"),
                        name: "sap.ushell.components.workPageBuilder.view.WorkPageRowDeleteDialog",
                        controller: this
                    }).then(function (oDialog) {
                        oDialog.setModel(this.getView().getModel("i18n"), "i18n");
                        return oDialog;
                    }.bind(this));
                }

                return this.oLoadDeleteDialog.then(function (oDialog) {
                    oDialog.getBeginButton().detachEvent("press", this._fnDeleteRowHandler);
                    oDialog.getBeginButton().attachEvent("press", {
                        rowContext: oWorkPageRowContext
                    }, this._fnDeleteRowHandler);
                    oDialog.open();
                }.bind(this));
            },

            /**
             * Deletes the row with the context given in oRowData.
             *
             * @returns {Promise} A promise resolving when the row has been deleted.
             *
             * @param {sap.base.Event} oEvent The "press" event.
             * @param {object} oRowData Object containing the WorkPageRow context to delete.
             */
            deleteRow: function (oEvent, oRowData) {
                var oModel = this.getView().getModel();
                var oWorkPageRowContext = oRowData.rowContext;
                var aRows = oModel.getProperty("/data/WorkPage/Rows");
                var oRowContextData = oWorkPageRowContext.getObject();

                // Filter out the row with the given id to avoid mutation of the original array.
                var aFilteredRows = aRows.filter(function (oRow) {
                    return oRow.Id !== oRowContextData.Id;
                });

                oModel.setProperty("/data/WorkPage/Rows", aFilteredRows);
                this.getOwnerComponent().fireEvent("workPageEdited");
                return this.oLoadDeleteDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            /**
             * Called when the "Cancel" button is pressed on the RowDelete dialog.
             * @return {Promise} A promise resolving when the dialog has been closed
             */
            onRowDeleteCancel: function () {
                return this.oLoadDeleteDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            /**
             * Returns a GenericTile control instance to render in error case.
             *
             * @return {sap.m.GenericTile} A GenericTile with state: failed
             * @private
             */
            _createErrorTile: function () {
                return new VizInstanceCdm({
                    state: LoadState.Failed
                })
                    .attachPress(this.onVisualizationPress, this)
                    .bindEditable("/editMode")
                    .setLayoutData(new GridContainerItemLayoutData({
                        columns: 2,
                        rows: 2
                    }));
            },

            /**
             * Creates a widget based on the given widgetContext.
             *
             * @param {string} sWidgetId The id for the widget.
             * @param {object} oWidgetContext The widget context.
             * @return {sap.ushell.ui.launchpad.VizInstance|sap.m.GenericTile|sap.ui.integration.widgets.Card} The resulting control.
             */
            widgetFactory: function (sWidgetId, oWidgetContext) {
                var sVizId = oWidgetContext.getProperty("Visualization/Id");

                if (!sVizId) {
                    Log.error("No vizId found in widget context.");
                    return this._createErrorTile();
                }

                var oVizData = this.getView().getModel().getProperty("/data/UsedVisualizations/" + sVizId);

                if (!oVizData || !oVizData.Type) {
                    Log.error("No viz or vizType found for vizId " + sVizId);
                    return this._createErrorTile();
                }

                switch (oVizData.Type) {
                    case "sap.card":
                        return this._createCard(oVizData);
                    case "sap.ushell.StaticAppLauncher":
                    case "sap.ushell.DynamicAppLauncher":
                        return this._createVizInstance(oVizData);
                    default:
                        Log.error("Unknown type for widget " + oVizData.Type);
                        return this._createErrorTile();
                }
            },

            /**
             * Creates a VizInstance with given vizData using the VizInstantiation service.
             *
             * @since 1.110.0
             * @param {object} oVizData VisualizationData for the visualization.
             * @returns {sap.ushell.ui.launchpad.VizInstance|sap.m.GenericTile} The CDM VizInstance.
             * @private
             */
            _createVizInstance: function (oVizData) {
                var oIndicatorDataSource = ObjectPath.get(["Descriptor", "sap.flp", "indicatorDataSource"], oVizData);
                var sAppId = ObjectPath.get(["Descriptor", "sap.flp", "target", "appId"], oVizData);
                var oApplication = this.getOwnerComponent().getSiteApplication(sAppId);
                var oDataSources = ObjectPath.get(["sap.app", "dataSources"], oApplication);
                var oVizType = this.getOwnerComponent().getSiteVizType(oVizData.Type);
                var oApplicationAsMap = {};
                oApplicationAsMap[sAppId] = oApplication;

                var oInstantiationVizData = {
                    id: oVizData.Id,
                    title: ObjectPath.get(["Descriptor", "sap.app", "title"], oVizData),
                    subtitle: ObjectPath.get(["Descriptor", "sap.app", "subTitle"], oVizData),
                    info: ObjectPath.get(["Descriptor", "sap.app", "info"], oVizData),
                    icon: ObjectPath.get(["Descriptor", "sap.ui", "icons", "icon"], oVizData),
                    keywords: ObjectPath.get(["Descriptor", "sap.app", "tags", "keywords"], oVizData) || [],
                    _instantiationData: {
                        platform: "CDM",
                        vizType: oVizType
                    },
                    indicatorDataSource: oIndicatorDataSource,
                    vizType: ObjectPath.get("Type", oVizData),
                    dataSource: this._getDataSource(oDataSources, oIndicatorDataSource),
                    contentProviderId: ObjectPath.get(["sap.app", "contentProviderId"], oApplication),
                    vizConfig: ObjectPath.get(["Descriptor"], oVizData),
                    supportedDisplayFormats: ObjectPath.get(["Descriptor", "sap.flp", "vizOptions", "displayFormats", "supported"], oVizData),
                    displayFormatHint: ObjectPath.get(["Descriptor", "sap.flp", "vizOptions", "displayFormats", "default"], oVizData),
                    numberUnit: ObjectPath.get(["Descriptor", "sap.flp", "numberUnit"], oVizData),
                    vizId: oVizData.Id,
                    preview: false
                };

                if (!this.oModel.getProperty("/navigationDisabled")) {
                    oInstantiationVizData.target = readUtils.harmonizeTarget(readVisualizations.getTarget(oInstantiationVizData) || {});
                    oInstantiationVizData.targetURL = utilsCdm.toHashFromVizData(oInstantiationVizData, oApplicationAsMap);
                }

                var oVizInstance = this._oVizInstantiationService.instantiateVisualization(oInstantiationVizData);

                if (!oVizInstance) {
                    Log.error("No VizInstance was created.");
                    return this._createErrorTile();
                }

                return oVizInstance
                    .setActive(true)
                    .attachPress(this.onVisualizationPress, this)
                    .bindEditable("/editMode")
                    .bindClickable({ path: "/navigationDisabled", formatter: function (bValue) { return !bValue; } })
                    .setLayoutData(new GridContainerItemLayoutData(oVizInstance.getLayout()));
            },

            /**
             * Seeks the dataSource in the available dataSources.
             *
             * @param {object} oDataSources The available dataSources.
             * @param {object} oIndicatorDataSource The indicator dataSource.
             * @return {object|null} The dataSource if found.
             * @private
             */
            _getDataSource: function (oDataSources, oIndicatorDataSource) {
                if (!oIndicatorDataSource || !oDataSources) { return; }
                return oDataSources[oIndicatorDataSource.dataSource];
            },

            /**
             * Called if a vizInstance was pressed and proceeds to delete it from the data.
             *
             * @param {sap.base.Event} oEvent The press event.
             */
            onVisualizationPress: function (oEvent) {
                var sScope = oEvent.getParameter("scope");
                var sAction = oEvent.getParameter("action");

                if (sScope === "Actions" && sAction === "Remove") {
                    this._deleteVisualization(oEvent.getSource());
                }
            },

            /**
             * Creates a new Card.
             *
             * @since 1.110.0
             * @param {object} oViz The visualization data.
             * @return {sap.ui.integration.widgets.Card} The card instance.
             * @private
             */
            _createCard: function (oViz) {
                var oOptions = {};
                var bHasDescriptor = oViz.Descriptor && oViz.Descriptor["sap.card"];
                var bHasDescriptorResources = oViz.DescriptorResources && (oViz.DescriptorResources.BaseUrl || oViz.DescriptorResources.DescriptorPath);

                if (!bHasDescriptor && !bHasDescriptorResources) {
                    Log.error("No Descriptor or DescriptorResources for Card");
                    return new Card().setLayoutData(new GridContainerItemLayoutData({
                        columns: 2,
                        rows: 2
                    }));
                }

                if (bHasDescriptor) {
                    oOptions.manifest = oViz.Descriptor;

                    if (bHasDescriptorResources) {
                        oOptions.baseUrl = oViz.DescriptorResources.BaseUrl + oViz.DescriptorResources.DescriptorPath;
                    }
                } else if (bHasDescriptorResources) {
                    oOptions.manifest = oViz.DescriptorResources.BaseUrl + oViz.DescriptorResources.DescriptorPath + "/manifest.json";
                }

                // Ensure trailing slash for base url
                if (oOptions.baseUrl && oOptions.baseUrl.substr(-1) !== "/") {
                    oOptions.baseUrl += "/";
                }

                return new Card(oOptions)
                    .addStyleClass("sapCepWidget")
                    .setHost(this.oHost)
                    .setLayoutData(new GridContainerItemLayoutData({
                        columns: 16,
                        minRows: 1
                    }));
            },

            /**
             * executes the Navigation, will open a new window
             * if Event is of type Navigation
             * @param {Object} oEvent Event triggered by the card
             * @returns {Promise} Promise that will resolve if Navigation is succesfull
             */
            executeNavigation: function (oEvent) {
                var oParameters = oEvent.getParameter("parameters");
                if (oEvent.getParameter("type") !== "Navigation" || this.oModel.getProperty("/navigationDisabled")) {
                    return Promise.resolve();
                }
                return this.getOwnerComponent().getUshellContainer().getServiceAsync("CrossApplicationNavigation")
                    .then(function (oCrossAppNavigation) {
                        return oCrossAppNavigation.toExternal({
                            target: {
                                semanticObject: oParameters.ibnTarget.semanticObject,
                                action: oParameters.ibnTarget.action
                            },
                            params: oParameters.ibnParams
                        });
                    });
            },

            /**
             * Close the edit mode and request to save changes by firing the "closeEditMode" event. The edit mode needs to be managed
             * the outer component to also handle the UserAction Menu button for edit mode.´
             */
            saveEditChanges: function () {
                this.getOwnerComponent().fireEvent("closeEditMode", {
                    saveChanges: true
                });
            },

            /**
             * Close the edit mode and request to cancel changes by firing the "closeEditMode" event. The edit mode needs to be managed
             * the outer component to also handle the UserAction Menu button for edit mode.´
             */
            cancelEditChanges: function () {
                this.getOwnerComponent().fireEvent("closeEditMode", {
                    saveChanges: false
                });
            },

            /**
             * Called if a widget is dropped on the WorkPageCell.
             * @since 1.110.0
             * @param {sap.base.Event} oEvent The drop event.
             */
            onCellDrop: function (oEvent) {
                var oDragged = oEvent.getParameter("draggedControl");
                var oSourceCell = oDragged.getParent().getParent();
                var oTargetCell = oEvent.getParameter("droppedControl");
                var iDragPosition = oSourceCell.indexOfAggregation("widgets", oDragged);
                var iDropPosition = oTargetCell.getBindingContext().getProperty("Widgets").length;

                this._moveVisualization(oSourceCell, oTargetCell, iDragPosition, iDropPosition);
            },

            /**
             * Called if a widget is dragged over a cell.
             *
             * @param {sap.base.Event} oEvent The dragenter event.
             */
            onCellDragEnter: function (oEvent) {
                var oCell = oEvent.getParameter("target");
                if (!this.tileEditMode(true, oCell.getBindingContext().getProperty("Widgets"))) {
                    oEvent.preventDefault();
                }
            },

            /**
             * Called if a widget is dropped to a certain position in the GridContainer.
             * @since 1.110.0
             * @param {sap.base.Event} oEvent The drop event.
             */
            onGridDrop: function (oEvent) {
                var oTargetCell = oEvent.getSource();
                var oDragged = oEvent.getParameter("draggedControl");
                var oDropped = oEvent.getParameter("droppedControl");
                var sInsertPosition = oEvent.getParameter("dropPosition");
                var oSourceCell = oDragged.getParent().getParent();

                var iDragPosition = oSourceCell.indexOfAggregation("widgets", oDragged);
                var iDropPosition = oTargetCell.indexOfAggregation("widgets", oDropped);

                var bSameContainer = oTargetCell.getId() === oSourceCell.getId();

                // Increase the drop position if the dragged element is moved to the right.
                if (sInsertPosition === "After") { iDropPosition++; }

                if (bSameContainer) {
                    // Decrease drop position if the dragged element is taken from before the drop position in the same container.
                    if (iDragPosition < iDropPosition) { iDropPosition--; }
                    // Return if the result is the same for drag position and drop position in the same container (and prevent the MessageToast).
                    if (iDragPosition === iDropPosition) { return; }
                }

                this._moveVisualization(oSourceCell, oTargetCell, iDragPosition, iDropPosition);
            },

            /**
             * Updates the model according to the new positions.
             * Removes the widget data from the widgets in the source cell at the drag position.
             * Inserts the object into the widgets array in the target cell at the drop position.
             *
             * @since 1.110.0
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageCell} oSourceCell The cell from which the widget was dragged.
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageCell} oTargetCell The cell into which the widget was dropped.
             * @param {int} iDragPosition The position the widget was dragged from.
             * @param {int} iDropPosition The position the widget was dropped to.
             * @private
             */
            _moveVisualization: function (oSourceCell, oTargetCell, iDragPosition, iDropPosition) {
                var oModel = this.getView().getModel();

                var sDragContainerWidgetsPath = oSourceCell.getBindingContext().getPath() + "/Widgets";
                var sDropContainerWidgetsPath = oTargetCell.getBindingContext().getPath() + "/Widgets";
                var bSameCell = sDragContainerWidgetsPath === sDropContainerWidgetsPath;

                var aDragContainerWidgets = oModel.getProperty(sDragContainerWidgetsPath);
                var aDropContainerWidgets = oModel.getProperty(sDropContainerWidgetsPath);

                var oDraggedObject = aDragContainerWidgets[iDragPosition];

                // Filter the dragged item from the source array instead of splicing to avoid mutation.
                var aNewDragContainerWidgets = aDragContainerWidgets.filter(function (oWidget, iIndex) { return iIndex !== iDragPosition; });

                // If dnd happened in the same cell, the drop widgets become the dragged widgets without the dragged object.
                if (bSameCell) { aDropContainerWidgets = aNewDragContainerWidgets; }

                // Insert the dragged object into a new target array to avoid mutation.
                var aNewDropContainerWidgets = [aDropContainerWidgets.slice(0, iDropPosition), oDraggedObject, aDropContainerWidgets.slice(iDropPosition)].flat();

                oModel.setProperty(sDragContainerWidgetsPath, aNewDragContainerWidgets);
                oModel.setProperty(sDropContainerWidgetsPath, aNewDropContainerWidgets);

                InvisibleMessage.getInstance().announce(this.getView().getModel("i18n").getResourceBundle().getText("WorkPage.Message.WidgetMoved"), InvisibleMessageMode.Assertive);
                this.getOwnerComponent().fireEvent("workPageEdited");
            },

            /**
             * Returns true if editMode is active and if the aWidgets array only contains tiles.
             *
             * @param {boolean} bEditMode The edit mode flag.
             * @param {sap.ui.core.Control[]} aWidgets The array of widget controls.
             * @return {boolean} The result indicating if tileEditMode is active.
             */
            tileEditMode: function (bEditMode, aWidgets) {
                var oModel = this.getView().getModel();
                var oUsedViz;
                return bEditMode && !!aWidgets && !aWidgets.some(function (oWidget) {
                    oUsedViz = oModel.getProperty("/data/UsedVisualizations/" + ObjectPath.get("Visualization.Id", oWidget));
                    return ObjectPath.get("Type", oUsedViz) === "sap.card";
                });
            },

            /**
             * Updates the model with the columnWidths.
             *
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageRow} oRow The surrounding row.
             * @param {int} iLeftColumnIndex The index of the left column to update.
             * @param {int} iRightColumnIndex The index of the right column to update.
             * @param {int} iNewLeftColumnWidth The new columnWidth value for the left column.
             * @param {int} iNewRightColumnWidth The new columnWidth value for the right column.
             * @private
             */
            _updateModelWithColumnWidths: function (oRow, iLeftColumnIndex, iRightColumnIndex, iNewLeftColumnWidth, iNewRightColumnWidth) {
                var oModel = this.getView().getModel();
                var oRowBindingContext = oRow.getBindingContext();
                var sRowBindingContextPath = oRowBindingContext.getPath();
                var sLeftColumnPath = sRowBindingContextPath + "/Columns/" + iLeftColumnIndex + "/Descriptor/columnWidth";
                var sRightColumnPath = sRowBindingContextPath + "/Columns/" + iRightColumnIndex + "/Descriptor/columnWidth";
                oModel.setProperty(sLeftColumnPath, iNewLeftColumnWidth);
                oModel.setProperty(sRightColumnPath, iNewRightColumnWidth);
            },

            /**
             * Updates the DOM classes for the column with the given iColumnIndex.
             *
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageRow} oRow The WorkPageRow instance.
             * @param {int} iColumnIndex The index of the column to update.
             * @param {int} iColumnWidth The new columnWidth.
             * @private
             */
            _updateColumnWidthClass: function (oRow, iColumnIndex, iColumnWidth) {
                oRow.$().find(".sapCepWorkPageColumn").eq(iColumnIndex)
                    .removeClass(function (index, className) {
                        return (className.match(/sapCepColumnWidth.*/g) || []).join(" ");
                    })
                    .addClass("sapCepColumnWidth" + iColumnWidth);
            },

            /**
             * Calculates the step to be taken, based on the input parameters.
             * If the new columnWidths is smaller than MIN_GRID_COLUMN_WIDTH, do nothing.
             * Else, update the columnWidths via DOM manipulation.
             *
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageRow} oRow The WorkPageRow control instance.
             * @param {int} iLeftColumnIndex The index of the left column to update.
             * @param {int} iRightColumnIndex The index of the right column to update.
             * @param {int} iLeftColumnWidth The old columnWidth of the left column.
             * @param {int} iRightColumnWidth The old columnWidth of the right column.
             * @param {string} sDirection The resize direction: "left" or "right"
             * @return {null|{newLeftColumnWidth: int, newRightColumnWidth: int}} The resulting values.
             * @private
             */
            _doColumnResizeStep: function (oRow, iLeftColumnIndex, iRightColumnIndex, iLeftColumnWidth, iRightColumnWidth, sDirection) {
                var bRtl = Core.getConfiguration().getRTL();
                var iStep;

                if (!bRtl) {
                    iStep = sDirection === "right" ? STEP_SIZE : -STEP_SIZE;
                } else {
                    iStep = sDirection === "right" ? -STEP_SIZE : STEP_SIZE;
                }
                var iNewLeftColumnWidth = iLeftColumnWidth + iStep;
                var iNewRightColumnWidth = iRightColumnWidth - iStep;

                if (iNewLeftColumnWidth < MIN_GRID_COLUMN_WIDTH || iNewRightColumnWidth < MIN_GRID_COLUMN_WIDTH) {
                    Log.debug("new column value too small", iNewLeftColumnWidth, iNewRightColumnWidth);
                    return null;
                }

                this._updateColumnWidthClass(oRow, iLeftColumnIndex, iNewLeftColumnWidth);
                this._updateColumnWidthClass(oRow, iRightColumnIndex, iNewRightColumnWidth);

                return {
                    newLeftColumnWidth: iNewLeftColumnWidth,
                    newRightColumnWidth: iNewRightColumnWidth
                };
            },

            /**
             * Retrieves the columnWidth for the column with the given iColumnIndex from the model.
             *
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageRow} oRow The WorkPageRow control instance.
             * @param {int} iLeftColumnIndex The index of the left column.
             * @return {int} The columnWidth.
             * @private
             */
            _getCurrentColumnWidth: function (oRow, iLeftColumnIndex) {
                var sRowBindingContextPath = oRow.getBindingContext().getPath();
                var sColumnPath = sRowBindingContextPath + "/Columns/" + iLeftColumnIndex + "/Descriptor/columnWidth";
                return this.getView().getModel().getProperty(sColumnPath);
            },

            /**
             * Gets the column width from the column descriptor entry, falls back to max column width if the columnWidth is empty.
             *
             * @param {object} oColumn The column data object.
             * @return {int} The column width as an integer.
             * @private
             */
            _getColumnWidth: function (oColumn) {
                return ObjectPath.get("Descriptor.columnWidth", oColumn) || MAX_GRID_COLUMN_WIDTH;
            },

            /**
             * Sets the column width to the column descriptor.
             *
             * @param {object} oColumn The column data object.
             * @param {int} iColumnWidth The column data object.
             * @private
             */
            _setColumnWidth: function (oColumn, iColumnWidth) {
                ObjectPath.set("Descriptor.columnWidth", iColumnWidth, oColumn);
            },

            /**
             *
             * @param {sap.ushell.components.workPageBuilder.controls.WorkPageColumn[]} aColumns An array of WorkPageColumn controls.
             * @param {int} iColumnIndex The column index.
             * @param {int} iTotalColumns The total number of columns.
             * @return {sap.ushell.components.workPageBuilder.controls.WorkPageColumn[]} The updated array of WorkPageColumn controls.
             * @private
             */
            _calculateColWidths: function (aColumns, iColumnIndex, iTotalColumns) {
                var oColumn = aColumns[iColumnIndex];

                if (this._getColumnWidth(oColumn) - STEP_SIZE >= MIN_GRID_COLUMN_WIDTH) {
                    this._setColumnWidth(oColumn, this._getColumnWidth(oColumn) - STEP_SIZE);
                    iTotalColumns = iTotalColumns - STEP_SIZE;
                }

                if (iTotalColumns > MAX_GRID_COLUMN_WIDTH) {
                    var nextIndex = iColumnIndex - 1 >= 0 ? iColumnIndex - 1 : aColumns.length - 1;
                    this._calculateColWidths(aColumns, nextIndex, iTotalColumns);
                }

                return aColumns;
            },

            /**
             * Returns the data representation of an empty WorkPageColumn.
             *
             * @param {int} iColumnWidth The columnWidth for the column.
             * @return {object} The WorkPageColumn data object.
             * @private
             */
            _createEmptyColumn: function (iColumnWidth) {
                return {
                    Id: this._generateUniqueId(),
                    DescriptorSchemaVersion: "3.2.0",
                    Descriptor: {
                        columnWidth: iColumnWidth
                    },
                    Configurations: [],
                    Cells: []
                };
            },

            /**
             * Returns the data representation of an empty WorkPageRow.
             *
             * @return {object} The WorkPageRow data object.
             * @private
             */
            _createEmptyRow: function () {
                return {
                    Id: this._generateUniqueId(),
                    DescriptorSchemaVersion: "3.2.0",
                    Descriptor: {
                        title: "",
                        description: "this is not yet rendered",
                        fillRowHeight: false,
                        fullWidth: false
                    },
                    Columns: [this._createEmptyColumn(MAX_GRID_COLUMN_WIDTH)]
                };
            },

            /**
             * Saves the host in a variable to be attached to a card.
             *
             * @private
             */
            _saveHost: function () {
                this.oHost = Core.byId("sap.shell.host.environment");

                if (!this.oHost) {
                    this.oHost = new Host("sap.shell.host.environment", {
                        resolveDestination: function (sDestinationName) {
                            if (!sDestinationName) {
                                return Promise.reject();
                            }
                            return Promise.resolve("/dynamic_dest/" + sDestinationName);
                        }
                    }).attachAction(this.executeNavigation.bind(this));
                }
            },

            /**
            * Check if Navigation is disabled
            *
            * @private
            * @since 1.109.0
            */

            getNavigationDisabled: function () {
                return this.oModel.getProperty("/navigationDisabled");
            },

            /**
            * Disable the navigation on tiles and widgets
            * @param {boolean} bNavigation true or false
            *
            * @private
            * @since 1.109.0
            */

            setNavigationDisabled: function (bNavigation) {
                this.oModel.setProperty("/navigationDisabled", bNavigation);
            },

            /**
             * Set the section grid container gap and row size for different screen sizes
             */
            _setGridContainerSizes: function () {
                var sSizeBehavior = Config.last("/core/home/sizeBehavior");
                var oViewSettingsModel = this.getView().getModel("viewSettings");

                var sTileGapParam = (sSizeBehavior === "Small")
                    ? "_sap_ushell_Tile_SpacingXS"
                    : "_sap_ushell_Tile_Spacing";

                var sTileGapParamS = (sSizeBehavior === "Small")
                    ? "_sap_ushell_Tile_SpacingXS"
                    : "_sap_ushell_Tile_SpacingS";


                oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGap", this._getNumericThemeParam(sTileGapParam));
                oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapXS", this._getNumericThemeParam("_sap_ushell_Tile_SpacingXS"));
                oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapS", this._getNumericThemeParam(sTileGapParamS));
                oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapM", this._getNumericThemeParam(sTileGapParam));
                oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapL", this._getNumericThemeParam(sTileGapParam));
                oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapXL", this._getNumericThemeParam(sTileGapParam));

                var sTileWidthParam = (sSizeBehavior === "Small")
                    ? "_sap_ushell_Tile_WidthXS"
                    : "_sap_ushell_Tile_Width";

                var sTileWidthParamS = (sSizeBehavior === "Small")
                    ? "_sap_ushell_Tile_WidthXS"
                    : "_sap_ushell_Tile_WidthS";

                oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSize", this._getNumericThemeParam(sTileWidthParam));
                oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeXS", this._getNumericThemeParam("_sap_ushell_Tile_WidthXS"));
                oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeS", this._getNumericThemeParam(sTileWidthParamS));
                oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeM", this._getNumericThemeParam(sTileWidthParam));
                oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeL", this._getNumericThemeParam(sTileWidthParam));
                oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeXL", this._getNumericThemeParam(sTileWidthParam));
            },

            /**
             * Returns a .rem value based on the tile gap or width parameter
             *
             * @param {string} sParam Tile spacing parameter
             * @returns {string} Value in .rem
             */
            _getNumericThemeParam: function (sParam) {
                var sValue = Parameters.get(sParam);
                if (sValue && sValue.indexOf(".") === 0) {
                    sValue = "0" + sValue;
                }
                return sValue;
            },

            /**
             * Returns a unique id which does not yet exist on the WorkPage.
             * Optionally an array of existing IDs can be given as an argument.
             * This can be helpful if new entities are created in a loop but not yet entered into the model.
             *
             * @since 1.112.0
             * @param {string[]} [aExistingIds] An array of existing IDs as strings.
             * @return {string} A unique ID.
             * @private
             */
            _generateUniqueId: function (aExistingIds) {
                // make a copy to not change the passed array.
                var aIds = (aExistingIds || []).concat([]);
                var oWorkPage = this.oModel.getProperty("/data/WorkPage");

                aIds.push(oWorkPage.Id);

                (oWorkPage.Rows || []).forEach(function (oRow) {
                    aIds.push(oRow.Id);
                    (oRow.Columns || []).forEach(function (oColumn) {
                        aIds.push(oColumn.Id);
                        (oColumn.Cells || []).forEach(function (oCell) {
                            aIds.push(oCell.Id);
                            (oCell.Widgets || []).forEach(function (oWidget) {
                                aIds.push(oWidget.Id);
                            });
                        });
                    });
                });

                return utils.generateUniqueId(aIds);
            }
        });
});
