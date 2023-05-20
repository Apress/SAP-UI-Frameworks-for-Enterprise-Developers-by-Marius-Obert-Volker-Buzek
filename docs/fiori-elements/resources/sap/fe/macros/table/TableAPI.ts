import { EntityType } from "@sap-ux/vocabularies-types";
import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import NotApplicableContextDialog from "sap/fe/core/controllerextensions/editFlow/NotApplicableContextDialog";
import NavigationReason from "sap/fe/core/controllerextensions/routing/NavigationReason";
import type { AnnotationTableColumn, columnExportSettings, TableVisualization } from "sap/fe/core/converters/controls/Common/Table";
import { CreationMode, HorizontalAlign } from "sap/fe/core/converters/ManifestSettings";
import { convertTypes } from "sap/fe/core/converters/MetaModelConverter";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import { aggregation, defineUI5Class, event, property, xmlEventHandler } from "sap/fe/core/helpers/ClassSupport";
import PasteHelper from "sap/fe/core/helpers/PasteHelper";
import { getLocalizedText, getResourceModel } from "sap/fe/core/helpers/ResourceModelHelper";
import type PageController from "sap/fe/core/PageController";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import TableUtils from "sap/fe/macros/table/Utils";
import MessageBox from "sap/m/MessageBox";
import DataStateIndicator from "sap/m/plugins/DataStateIndicator";
import UI5Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import type { MessageType } from "sap/ui/core/library";
import Message from "sap/ui/core/message/Message";
import FilterBar from "sap/ui/mdc/FilterBar";
import Table from "sap/ui/mdc/Table";
import JSONModel from "sap/ui/model/json/JSONModel";
import Context from "sap/ui/model/odata/v4/Context";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import FilterBarAPI from "../filterBar/FilterBarAPI";
import MacroAPI from "../MacroAPI";

/**
 * Definition of a custom action to be used inside the table toolbar
 *
 * @alias sap.fe.macros.table.Action
 * @public
 */
export type Action = {
	/**
	 * Unique identifier of the action
	 *
	 * @public
	 */
	key: string;

	/**
	 * The text that will be displayed for this action
	 *
	 * @public
	 */
	text: string;
	/**
	 * Reference to the key of another action already displayed in the toolbar to properly place this one
	 *
	 * @public
	 */
	anchor?: string;
	/**
	 * Defines where this action should be placed relative to the defined anchor
	 *
	 * Allowed values are `Before` and `After`
	 *
	 * @public
	 */
	placement?: "Before" | "After";

	/**
	 * Event handler to be called when the user chooses the action
	 *
	 * @public
	 */
	press: string;

	/**
	 * Defines if the action requires a selection.
	 *
	 * @public
	 */
	requiresSelection?: boolean;

	/**
	 * Enables or disables the action
	 *
	 * @public
	 */
	enabled?: boolean;
};

/**
 * Definition of a custom ActionGroup to be used inside the table toolbar
 *
 * @alias sap.fe.macros.table.ActionGroup
 * @public
 */
export type ActionGroup = {
	/**
	 * Unique identifier of the ActionGroup
	 *
	 * @public
	 */
	key: string;

	/**
	 * Defines nested actions
	 *
	 * @public
	 */
	actions: Action[];

	/**
	 * The text that will be displayed for this action group
	 *
	 * @public
	 */
	text: string;

	/**
	 * Reference to the key of another action or action group already displayed in the toolbar to properly place this one
	 *
	 * @public
	 */
	anchor?: string;

	/**
	 * Defines where this action group should be placed relative to the defined anchor
	 *
	 * Allowed values are `Before` and `After`
	 *
	 * @public
	 */
	placement?: "Before" | "After";
};

/**
 * Definition of a custom column to be used inside the table.
 *
 * The template for the column has to be provided as the default aggregation
 *
 * @alias sap.fe.macros.table.Column
 * @public
 * @experimental
 */
export type Column = {
	/**
	 * Unique identifier of the column
	 *
	 * @public
	 */
	key: string;

	/**
	 * The text that will be displayed for this column header
	 *
	 * @public
	 */
	header: string;

	/**
	 * Defines the column's width.
	 *
	 * Allowed values are `auto`, `value` and `inherit` according to {@link sap.ui.core.CSSSize}
	 *
	 * @public
	 */
	width?: string;

	/**
	 * Defines the column importance.
	 *
	 * You can define which columns should be automatically moved to the pop-in area based on their importance
	 *
	 * @public
	 */
	importance?: string;

	/**
	 * Aligns the header as well as the content horizontally
	 *
	 * @public
	 */
	horizontalAlign?: HorizontalAlign;

	/**
	 * Reference to the key of another column already displayed in the table to properly place this one
	 *
	 * @public
	 */
	anchor?: string;

	/**
	 * Defines where this column should be placed relative to the defined anchor
	 *
	 * Allowed values are `Before` and `After`
	 *
	 * @public
	 */
	placement?: "Before" | "After";
};

type exportColumn = columnExportSettings & {
	property: string | Array<string>;
	label: string;
	columnId?: string;
	width?: number;
	textAlign?: string;
	displayUnit?: boolean;
	trueValue?: string;
	falseValue?: string;
	valueMap?: string;
};

export type exportSettings = {
	dataSource: {
		sizeLimit?: number;
	};
	workbook: {
		columns: exportColumn[];
	};
};

/**
 * Building block used to create a table based on the metadata provided by OData V4.
 * <br>
 * Usually, a LineItem or PresentationVariant annotation is expected, but the Table building block can also be used to display an EntitySet.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:Table id="MyTable" metaPath="@com.sap.vocabularies.UI.v1.LineItem" /&gt;
 * </pre>
 *
 * @alias sap.fe.macros.Table
 * @public
 */
@defineUI5Class("sap.fe.macros.table.TableAPI")
class TableAPI extends MacroAPI {
	creatingEmptyRows?: boolean;

	constructor(mSettings?: PropertiesOf<TableAPI>, ...others: any[]) {
		super(mSettings as any, ...others);

		this.updateFilterBar();

		if (this.content) {
			this.content.attachEvent("selectionChange", {}, this.onTableSelectionChange, this);
		}
	}

	/**
	 * Defines the relative path of the property in the metamodel, based on the current contextPath.
	 *
	 * @public
	 */
	@property({
		type: "string",
		expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
		expectedAnnotations: [
			"com.sap.vocabularies.UI.v1.LineItem",
			"com.sap.vocabularies.UI.v1.PresentationVariant",
			"com.sap.vocabularies.UI.v1.SelectionPresentationVariant"
		]
	})
	metaPath!: string;

	@property({ type: "object" })
	tableDefinition!: TableVisualization;

	@property({ type: "string" })
	entityTypeFullyQualifiedName!: string;

	/**
	 * An expression that allows you to control the 'read-only' state of the table.
	 *
	 * If you do not set any expression, SAP Fiori elements hooks into the standard lifecycle to determine the current state.
	 *
	 * @public
	 */
	@property({ type: "boolean" })
	readOnly!: boolean;

	/**
	 * The identifier of the table control.
	 *
	 * @public
	 */
	@property({ type: "string" })
	id!: string;

	/**
	 * An expression that allows you to control the 'busy' state of the table.
	 *
	 * @public
	 */
	@property({ type: "boolean", defaultValue: false })
	busy!: boolean;

	/**
	 * Defines the type of table that will be used by the building block to render the data.
	 *
	 * Allowed values are `GridTable` and `ResponsiveTable`
	 *
	 * @public
	 */
	@property({ type: "string", defaultValue: "ResponsiveTable", allowedValues: ["GridTable", "ResponsiveTable"] })
	type!: string;

	/**
	 * Controls if the export functionality of the table is enabled or not.
	 *
	 * @public
	 */
	@property({ type: "boolean", defaultValue: true })
	enableExport!: boolean;

	/**
	 * Controls if the paste functionality of the table is enabled or not.
	 *
	 * @public
	 */
	@property({ type: "boolean", defaultValue: false })
	enablePaste!: boolean;

	/**
	 * Controls whether the table can be opened in fullscreen mode or not.
	 *
	 * @public
	 */
	@property({ type: "boolean", defaultValue: false })
	enableFullScreen!: boolean;

	/**
	 * ID of the FilterBar building block associated with the table.
	 *
	 * @public
	 */
	@property({ type: "string" })
	filterBar!: string;

	/**
	 * Defines the selection mode to be used by the table.
	 *
	 * Allowed values are `None`, `Single`, `Multi` or `Auto`
	 *
	 * @public
	 */
	@property({ type: "string", allowedValues: ["None", "Single", "Multi", "Auto"] })
	selectionMode!: string;

	/**
	 * Specifies the header text that is shown in the table.
	 *
	 * @public
	 */
	@property({ type: "string" })
	header!: string;

	/**
	 * Specifies if the column width is automatically calculated.
	 *
	 * @public
	 */
	@property({ type: "boolean", defaultValue: true })
	enableAutoColumnWidth!: boolean;

	/**
	 * Specifies it the table is designed for a mobile device.
	 *
	 * @private
	 */
	@property({ type: "boolean", defaultValue: false })
	isOptimizedForSmallDevice!: boolean;

	/**
	 * Controls if the header text should be shown or not.
	 *
	 * @public
	 */
	@property({ type: "boolean", defaultValue: true })
	headerVisible!: boolean;

	/**
	 * Aggregate actions of the table.
	 *
	 * @public
	 */
	@aggregation({ type: "sap.fe.macros.table.Action" })
	actions!: Action[];

	/**
	 * Aggregate columns of the table.
	 *
	 * @public
	 */
	@aggregation({ type: "sap.fe.macros.table.Column" })
	columns!: Column[];

	/**
	 *
	 *
	 * @private
	 */
	@property({ type: "boolean", defaultValue: false })
	dataInitialized!: boolean;

	/**
	 *
	 *
	 * @private
	 */
	@property({ type: "boolean", defaultValue: false })
	bindingSuspended!: boolean;

	/**
	 *
	 *
	 * @private
	 */
	@property({ type: "boolean", defaultValue: false })
	outDatedBinding!: boolean;

	/**
	 *
	 *
	 * @private
	 */
	@property({ type: "boolean", defaultValue: false })
	pendingRequest!: boolean;

	/**
	 * Specifies if the empty rows are enabled. This allows to have dynamic enablement of the empty rows via the setter function.
	 *
	 * @private
	 */
	@property({ type: "boolean", defaultValue: false })
	emptyRowsEnabled!: boolean;

	/**
	 * An event is triggered when the user chooses a row; the event contains information about which row is chosen.
	 *
	 * You can set this in order to handle the navigation manually.
	 *
	 * @public
	 */
	@event()
	rowPress!: Function;

	/**
	 * An event triggered when the Table State changes.
	 *
	 * You can set this in order to store the table state in the appstate.
	 *
	 * @private
	 */
	@event()
	stateChange!: Function;

	@event()
	internalDataRequested!: Function;

	/**
	 * Controls which options should be enabled for the table personalization dialog.
	 *
	 * If it is set to `true`, all possible options for this kind of table are enabled.<br/>
	 * If it is set to `false`, personalization is disabled.<br/>
	 *<br/>
	 * You can also provide a more granular control for the personalization by providing a comma-separated list with the options you want to be available.<br/>
	 * Available options are:<br/>
	 *  - Sort<br/>
	 *  - Column<br/>
	 *  - Filter<br/>
	 *
	 * @public
	 */
	@property({ type: "boolean | string", defaultValue: true })
	personalization!: boolean | string;

	/**
	 * Controls the kind of variant management that should be enabled for the table.
	 *
	 * Allowed value is `Control`.<br/>
	 * If set with value `Control`, a variant management control is seen within the table and the table is linked to this.<br/>
	 * If not set with any value, control level variant management is not available for this table.
	 *
	 * @public
	 */
	@property({ type: "string", allowedValues: ["Control"] })
	variantManagement!: string;

	/**
	 * Groups menu actions by key.
	 *
	 * @public
	 */
	@property({ type: "string" })
	menu?: string;

	/**
	 * Defines whether to display the search action.
	 *
	 * @public
	 */
	@property({ type: "boolean", defaultValue: true })
	isSearchable?: boolean;

	/**
	 * Gets contexts from the table that have been selected by the user.
	 *
	 * @returns Contexts of the rows selected by the user
	 * @public
	 */
	getSelectedContexts(): Context[] {
		return (this.content as any).getSelectedContexts();
	}

	/**
	 * Adds a message to the table.
	 *
	 * The message applies to the whole table and not to an individual table row.
	 *
	 * @param [parameters] The parameters to create the message
	 * @param parameters.type Message type
	 * @param parameters.message Message text
	 * @param parameters.description Message description
	 * @param parameters.persistent True if the message is persistent
	 * @returns The ID of the message
	 * @public
	 */
	addMessage(parameters: { type?: MessageType; message?: string; description?: string; persistent?: boolean }): string {
		const msgManager = this._getMessageManager();

		const oTable = this.content as any as Table;

		const oMessage = new Message({
			target: oTable.getRowBinding().getResolvedPath(),
			type: parameters.type,
			message: parameters.message,
			processor: oTable.getModel(),
			description: parameters.description,
			persistent: parameters.persistent
		});

		msgManager.addMessages(oMessage);
		return oMessage.getId();
	}

	/**
	 * Removes a message from the table.
	 *
	 * @param id The id of the message
	 * @public
	 */
	removeMessage(id: string) {
		const msgManager = this._getMessageManager();
		const messages = msgManager.getMessageModel().getData();
		const result = messages.find((e: any) => e.id === id);
		if (result) {
			msgManager.removeMessages(result);
		}
	}

	_getMessageManager() {
		return sap.ui.getCore().getMessageManager();
	}

	/**
	 * An event triggered when the selection in the table changes.
	 *
	 * @public
	 */
	@event()
	selectionChange!: Function;

	_getRowBinding() {
		const oTable = (this as any).getContent();
		return oTable.getRowBinding();
	}

	getCounts(): Promise<string> {
		const oTable = (this as any).getContent();
		return TableUtils.getListBindingForCount(oTable, oTable.getBindingContext(), {
			batchGroupId: !this.getProperty("bindingSuspended") ? oTable.data("batchGroupId") : "$auto",
			additionalFilters: TableUtils.getHiddenFilters(oTable)
		})
			.then((iValue: any) => {
				return TableUtils.getCountFormatted(iValue);
			})
			.catch(() => {
				return "0";
			});
	}

	@xmlEventHandler()
	onTableRowPress(oEvent: UI5Event, oController: PageController, oContext: Context, mParameters: any) {
		// prevent navigation to an empty row
		if (oContext && oContext.isInactive() && oContext.isTransient()) {
			return false;
		}
		// In the case of an analytical table, if we're trying to navigate to a context corresponding to a visual group or grand total
		// --> Cancel navigation
		if (
			this.getTableDefinition().enableAnalytics &&
			oContext &&
			oContext.isA("sap.ui.model.odata.v4.Context") &&
			typeof oContext.getProperty("@$ui5.node.isExpanded") === "boolean"
		) {
			return false;
		} else {
			const navigationParameters = Object.assign({}, mParameters, { reason: NavigationReason.RowPress });
			(oController as any)._routing.navigateForwardToContext(oContext, navigationParameters);
		}
	}

	@xmlEventHandler()
	onInternalDataReceived(oEvent: UI5Event) {
		if (oEvent.getParameter("error")) {
			this.getController().messageHandler.showMessageDialog();
		}
	}

	@xmlEventHandler()
	onInternalDataRequested(oEvent: UI5Event) {
		this.setProperty("dataInitialized", true);
		(this as any).fireEvent("internalDataRequested", oEvent.getParameters());
	}

	@xmlEventHandler()
	onPaste(oEvent: UI5Event, oController: PageController) {
		// If paste is disable or if we're not in edit mode, we can't paste anything
		if (!this.tableDefinition.control.enablePaste || !this.getModel("ui").getProperty("/isEditable")) {
			return;
		}

		const aRawPastedData = oEvent.getParameter("data"),
			oTable = oEvent.getSource() as Table;

		if (oTable.getEnablePaste() === true) {
			PasteHelper.pasteData(aRawPastedData, oTable, oController);
		} else {
			const oResourceModel = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");
			MessageBox.error(oResourceModel.getText("T_OP_CONTROLLER_SAPFE_PASTE_DISABLED_MESSAGE"), {
				title: oResourceModel.getText("C_COMMON_SAPFE_ERROR")
			});
		}
	}

	// This event will allow us to intercept the export before is triggered to cover specific cases
	// that couldn't be addressed on the propertyInfos for each column.
	// e.g. Fixed Target Value for the datapoints
	@xmlEventHandler()
	onBeforeExport(exportEvent: UI5Event) {
		const isSplitMode = exportEvent.getParameter("userExportSettings").splitCells,
			tableController = exportEvent.getSource() as PageController,
			exportSettings = exportEvent.getParameter("exportSettings"),
			tableDefinition = this.getTableDefinition();

		TableAPI.updateExportSettings(exportSettings, tableDefinition, tableController, isSplitMode);
	}

	/**
	 * Handles the MDC DataStateIndicator plugin to display messageStrip on a table.
	 *
	 * @param oMessage
	 * @param oTable
	 * @name dataStateFilter
	 * @returns Whether to render the messageStrip visible
	 */
	static dataStateIndicatorFilter(oMessage: any, oTable: any): boolean {
		const sTableContextBindingPath = oTable.getBindingContext()?.getPath();
		const sTableRowBinding = (sTableContextBindingPath ? `${sTableContextBindingPath}/` : "") + oTable.getRowBinding().getPath();
		return sTableRowBinding === oMessage.getTarget() ? true : false;
	}

	/**
	 * This event handles the DataState of the DataStateIndicator plugin from MDC on a table.
	 * It's fired when new error messages are sent from the backend to update row highlighting.
	 *
	 * @name onDataStateChange
	 * @param oEvent Event object
	 */
	@xmlEventHandler()
	onDataStateChange(oEvent: UI5Event) {
		const oDataStateIndicator = oEvent.getSource() as DataStateIndicator;
		const aFilteredMessages = oEvent.getParameter("filteredMessages");
		if (aFilteredMessages) {
			const oInternalModel = oDataStateIndicator.getModel("internal") as JSONModel;
			oInternalModel.setProperty("filteredMessages", aFilteredMessages, oDataStateIndicator.getBindingContext("internal") as Context);
		}
	}

	/**
	 * Updates the columns to be exported of a table.
	 *
	 * @param exportSettings The table export settings
	 * @param tableDefinition The table definition from the table converter
	 * @param tableController The table controller
	 * @param isSplitMode Defines if the export has been launched using split mode
	 * @returns The updated columns to be exported
	 */
	static updateExportSettings(
		exportSettings: exportSettings,
		tableDefinition: TableVisualization,
		tableController: PageController,
		isSplitMode: boolean
	): exportSettings {
		//Set static sizeLimit during export
		const columns = tableDefinition.columns;
		if (
			!tableDefinition.enableAnalytics &&
			(tableDefinition.control.type === "ResponsiveTable" || tableDefinition.control.type === "GridTable")
		) {
			exportSettings.dataSource.sizeLimit = 1000;
		}
		const exportColumns = exportSettings.workbook.columns;
		for (let index = exportColumns.length - 1; index >= 0; index--) {
			const exportColumn = exportColumns[index];
			const resourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
			exportColumn.label = getLocalizedText(exportColumn.label, tableController);
			//translate boolean values
			if (exportColumn.type === "Boolean") {
				exportColumn.falseValue = resourceBundle.getText("no");
				exportColumn.trueValue = resourceBundle.getText("yes");
			}
			const targetValueColumn = columns?.find((column) => {
				if (isSplitMode) {
					return this.columnWithTargetValueToBeAdded(column as AnnotationTableColumn, exportColumn);
				} else {
					return false;
				}
			});
			if (targetValueColumn) {
				const columnToBeAdded = {
					label: resourceBundle.getText("TargetValue"),
					property: Array.isArray(exportColumn.property) ? exportColumn.property : [exportColumn.property],
					template: (targetValueColumn as AnnotationTableColumn).exportDataPointTargetValue
				};
				exportColumns.splice(index + 1, 0, columnToBeAdded);
			}
		}
		return exportSettings;
	}

	/**
	 * Defines if a column that is to be exported and contains a DataPoint with a fixed target value needs to be added.
	 *
	 * @param column The column from the annotations column
	 * @param columnExport The column to be exported
	 * @returns `true` if the referenced column has defined a targetValue for the dataPoint, false else
	 * @private
	 */
	static columnWithTargetValueToBeAdded(column: AnnotationTableColumn, columnExport: exportColumn): boolean {
		let columnNeedsToBeAdded = false;
		if (column.exportDataPointTargetValue && column.propertyInfos?.length === 1) {
			//Add TargetValue column when exporting on split mode
			if (
				column.relativePath === columnExport.property ||
				columnExport.property[0] === column.propertyInfos[0] ||
				columnExport.property.includes(column.relativePath) ||
				columnExport.property.includes(column.name)
			) {
				// part of a FieldGroup or from a lineItem or from a column on the entitySet
				delete columnExport.template;
				columnNeedsToBeAdded = true;
			}
		}
		return columnNeedsToBeAdded;
	}

	resumeBinding(bRequestIfNotInitialized: boolean) {
		this.setProperty("bindingSuspended", false);
		if ((bRequestIfNotInitialized && !(this as any).getDataInitialized()) || this.getProperty("outDatedBinding")) {
			this.setProperty("outDatedBinding", false);
			(this as any).getContent()?.rebind();
		}
	}

	refreshNotApplicableFields(oFilterControl: Control): any[] {
		const oTable = (this as any).getContent();
		return FilterUtils.getNotApplicableFilters(oFilterControl, oTable);
	}

	suspendBinding() {
		this.setProperty("bindingSuspended", true);
	}

	invalidateContent() {
		this.setProperty("dataInitialized", false);
		this.setProperty("outDatedBinding", false);
	}

	@xmlEventHandler()
	onMassEditButtonPressed(oEvent: UI5Event, pageController: any) {
		const oTable = this.content;
		if (pageController && pageController.massEdit) {
			pageController.massEdit.openMassEditDialog(oTable);
		} else {
			Log.warning("The Controller is not enhanced with Mass Edit functionality");
		}
	}

	@xmlEventHandler()
	onTableSelectionChange(oEvent: UI5Event) {
		this.fireEvent("selectionChange", oEvent.getParameters());
	}

	@xmlEventHandler()
	async onActionPress(oEvent: UI5Event, pageController: PageController, actionName: string, parameters: any) {
		parameters.model = (oEvent.getSource() as Control).getModel();
		let executeAction = true;
		if (parameters.notApplicableContexts && parameters.notApplicableContexts.length > 0) {
			// If we have non applicable contexts, we need to open a dialog to ask the user if he wants to continue
			const convertedMetadata = convertTypes(parameters.model.getMetaModel());
			const entityType = convertedMetadata.resolvePath<EntityType>(this.entityTypeFullyQualifiedName, true).target!;
			const myUnapplicableContextDialog = new NotApplicableContextDialog({
				entityType: entityType,
				notApplicableContexts: parameters.notApplicableContexts,
				title: parameters.label,
				resourceModel: getResourceModel(this)
			});
			parameters.contexts = parameters.applicableContexts;
			executeAction = await myUnapplicableContextDialog.open(this);
		}
		if (executeAction) {
			// Direct execution of the action
			try {
				return await pageController.editFlow.invokeAction(actionName, parameters);
			} catch (e) {
				Log.info(e as string);
			}
		}
	}

	/**
	 * Expose the internal table definition for external usage in delegate.
	 *
	 * @returns The tableDefinition
	 */
	getTableDefinition() {
		return this.tableDefinition;
	}

	/**
	 * connect the filter to the tableAPI if required
	 *
	 * @private
	 * @alias sap.fe.macros.TableAPI
	 */

	updateFilterBar() {
		const table = (this as any).getContent();
		const filterBarRefId = (this as any).getFilterBar();
		if (table && filterBarRefId && table.getFilter() !== filterBarRefId) {
			this._setFilterBar(filterBarRefId);
		}
	}

	/**
	 * Sets the filter depending on the type of filterBar.
	 *
	 * @param filterBarRefId Id of the filter bar
	 * @private
	 * @alias sap.fe.macros.TableAPI
	 */
	_setFilterBar(filterBarRefId: string): void {
		const table = (this as any).getContent();

		// 'filterBar' property of macro:Table(passed as customData) might be
		// 1. A localId wrt View(FPM explorer example).
		// 2. Absolute Id(this was not supported in older versions).
		// 3. A localId wrt FragmentId(when an XMLComposite or Fragment is independently processed) instead of ViewId.
		//    'filterBar' was supported earlier as an 'association' to the 'mdc:Table' control inside 'macro:Table' in prior versions.
		//    In newer versions 'filterBar' is used like an association to 'macro:TableAPI'.
		//    This means that the Id is relative to 'macro:TableAPI'.
		//    This scenario happens in case of FilterBar and Table in a custom sections in OP of FEV4.

		const tableAPIId = this?.getId();
		const tableAPILocalId = this.data("tableAPILocalId");
		const potentialfilterBarId =
			tableAPILocalId && filterBarRefId && tableAPIId && tableAPIId.replace(new RegExp(tableAPILocalId + "$"), filterBarRefId); // 3

		const filterBar =
			CommonUtils.getTargetView(this)?.byId(filterBarRefId) || Core.byId(filterBarRefId) || Core.byId(potentialfilterBarId);

		if (filterBar) {
			if (filterBar.isA<FilterBarAPI>("sap.fe.macros.filterBar.FilterBarAPI")) {
				table.setFilter(`${filterBar.getId()}-content`);
			} else if (filterBar.isA<FilterBar>("sap.ui.mdc.FilterBar")) {
				table.setFilter(filterBar.getId());
			}
		}
	}

	checkIfColumnExists(aFilteredColummns: any, columnName: any) {
		return aFilteredColummns.some(function (oColumn: any) {
			if (
				(oColumn?.columnName === columnName && oColumn?.sColumnNameVisible) ||
				(oColumn?.sTextArrangement !== undefined && oColumn?.sTextArrangement === columnName)
			) {
				return columnName;
			}
		});
	}

	getIdentifierColumn(): any {
		const oTable = (this as any).getContent();
		const headerInfoTitlePath = this.getTableDefinition().headerInfoTitle;
		const oMetaModel = oTable && oTable.getModel().getMetaModel(),
			sCurrentEntitySetName = oTable.data("metaPath");
		const aTechnicalKeys = oMetaModel.getObject(`${sCurrentEntitySetName}/$Type/$Key`);
		const aFilteredTechnicalKeys: string[] = [];

		if (aTechnicalKeys && aTechnicalKeys.length > 0) {
			aTechnicalKeys.forEach(function (technicalKey: string) {
				if (technicalKey !== "IsActiveEntity") {
					aFilteredTechnicalKeys.push(technicalKey);
				}
			});
		}
		const semanticKeyColumns = this.getTableDefinition().semanticKeys;

		const aVisibleColumns: any = [];
		const aFilteredColummns: any = [];
		const aTableColumns = oTable.getColumns();
		aTableColumns.forEach(function (oColumn: any) {
			const column = oColumn?.getDataProperty();
			aVisibleColumns.push(column);
		});

		aVisibleColumns.forEach(function (oColumn: any) {
			const oTextArrangement = oMetaModel.getObject(`${sCurrentEntitySetName}/$Type/${oColumn}@`);
			const sTextArrangement = oTextArrangement && oTextArrangement["@com.sap.vocabularies.Common.v1.Text"]?.$Path;
			const sTextPlacement =
				oTextArrangement &&
				oTextArrangement["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]?.$EnumMember;
			aFilteredColummns.push({
				columnName: oColumn,
				sTextArrangement: sTextArrangement,
				sColumnNameVisible: !(sTextPlacement === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly")
			});
		});
		let column: any;

		if (headerInfoTitlePath !== undefined && this.checkIfColumnExists(aFilteredColummns, headerInfoTitlePath)) {
			column = headerInfoTitlePath;
		} else if (
			semanticKeyColumns !== undefined &&
			semanticKeyColumns.length === 1 &&
			this.checkIfColumnExists(aFilteredColummns, semanticKeyColumns[0])
		) {
			column = semanticKeyColumns[0];
		} else if (
			aFilteredTechnicalKeys !== undefined &&
			aFilteredTechnicalKeys.length === 1 &&
			this.checkIfColumnExists(aFilteredColummns, aFilteredTechnicalKeys[0])
		) {
			column = aFilteredTechnicalKeys[0];
		}
		return column;
	}

	/**
	 * EmptyRowsEnabled setter.
	 *
	 * @param enablement
	 */
	setEmptyRowsEnabled(enablement: boolean) {
		this.setProperty("emptyRowsEnabled", enablement);
		if (enablement) {
			this.setUpEmptyRows(this.content as Table);
		} else {
			// creation is no longer possible we need to delete empty rows
			this.deleteEmptyRows(this.content as Table);
		}
	}

	async setUpEmptyRows(table: Table, createButtonWasPressed: boolean = false) {
		if (this.tableDefinition.control?.creationMode !== CreationMode.InlineCreationRows) {
			return;
		}
		if (
			this.tableDefinition.control?.inlineCreationRowsHiddenInEditMode &&
			!table.getBindingContext("ui")?.getProperty("createMode") &&
			!createButtonWasPressed
		) {
			return;
		}
		if (!this.emptyRowsEnabled) {
			return;
		}
		const waitTableRendered = new Promise<void>((resolve) => {
			if (table.getDomRef()) {
				resolve();
			} else {
				const delegate = {
					onAfterRendering: function () {
						table.removeEventDelegate(delegate);
						resolve();
					}
				};
				table.addEventDelegate(delegate, this);
			}
		});
		await waitTableRendered;

		const uiModel = table.getModel("ui");
		if (uiModel.getProperty("/isEditablePending")) {
			// The edit mode is still being computed, so we wait until this computation is done before checking its value
			const watchBinding = uiModel.bindProperty("/isEditablePending");
			await new Promise<void>((resolve) => {
				const fnHandler = () => {
					watchBinding.detachChange(fnHandler);
					watchBinding.destroy();
					resolve();
				};
				watchBinding.attachChange(fnHandler);
			});
		}
		const isInEditMode = uiModel.getProperty("/isEditable");
		if (!isInEditMode) {
			return;
		}
		const binding = table.getRowBinding() as ODataListBinding;
		if (binding.isResolved() && binding.isLengthFinal()) {
			const contextPath = binding.getContext().getPath();
			const inactiveContext = binding.getAllCurrentContexts().find(function (context) {
				// when this is called from controller code we need to check that inactive contexts are still relative to the current table context
				return context.isInactive() && context.getPath().startsWith(contextPath);
			});
			if (!inactiveContext) {
				await this._createEmptyRow(binding, table);
			}
		}
	}

	/**
	 * Deletes inactive rows from the table listBinding.
	 *
	 * @param table
	 */
	deleteEmptyRows(table: Table) {
		const binding = table.getRowBinding() as ODataListBinding;
		if (binding?.isResolved() && binding?.isLengthFinal()) {
			const contextPath = binding.getContext().getPath();
			for (const context of binding.getAllCurrentContexts()) {
				if (context.isInactive() && context.getPath().startsWith(contextPath)) {
					context.delete();
				}
			}
		}
	}

	async _createEmptyRow(oBinding: ODataListBinding, oTable: Table) {
		const iInlineCreationRowCount = this.tableDefinition.control?.inlineCreationRowCount || 2;
		const aData = [];
		for (let i = 0; i < iInlineCreationRowCount; i += 1) {
			aData.push({});
		}
		const bAtEnd = oTable.data("tableType") !== "ResponsiveTable";
		const bInactive = true;
		const oView = CommonUtils.getTargetView(oTable);
		const oController = oView.getController() as PageController;
		const editFlow = oController.editFlow;
		if (!this.creatingEmptyRows) {
			this.creatingEmptyRows = true;
			try {
				const aContexts = await editFlow.createMultipleDocuments(
					oBinding,
					aData,
					bAtEnd,
					false,
					oController.editFlow.onBeforeCreate,
					bInactive
				);
				aContexts?.forEach(function (oContext: any) {
					oContext.created().catch(function (oError: any) {
						if (!oError.canceled) {
							throw oError;
						}
					});
				});
			} catch (e) {
				Log.error(e as any);
			} finally {
				this.creatingEmptyRows = false;
			}
		}
	}
}

export default TableAPI;
