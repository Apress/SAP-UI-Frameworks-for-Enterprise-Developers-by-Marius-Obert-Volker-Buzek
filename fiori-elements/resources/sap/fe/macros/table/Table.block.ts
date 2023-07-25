import { ConvertedMetadata, EntitySet, NavigationProperty, PathAnnotationExpression } from "@sap-ux/vocabularies-types";
import {
	DataFieldAbstractTypes,
	DataFieldForAction,
	DataFieldForIntentBasedNavigation,
	UIAnnotationTerms
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAggregation, blockAttribute, blockEvent, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import CommonUtils from "sap/fe/core/CommonUtils";
import { isDataFieldForAnnotation } from "sap/fe/core/converters/annotations/DataField";
import { CustomAction } from "sap/fe/core/converters/controls/Common/Action";
import {
	getDataVisualizationConfiguration,
	getVisualizationsFromPresentationVariant,
	VisualizationAndPath
} from "sap/fe/core/converters/controls/Common/DataVisualization";
import {
	AnnotationTableColumn,
	TableVisualization,
	type CreateBehavior,
	type CreateBehaviorExternal
} from "sap/fe/core/converters/controls/Common/Table";
import ConverterContext from "sap/fe/core/converters/ConverterContext";
import { CreationMode, TemplateType } from "sap/fe/core/converters/ManifestSettings";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import { CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { isSingleton } from "sap/fe/core/helpers/TypeGuards";
import { DataModelObjectPath, getContextRelativeTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { buildExpressionForHeaderVisible } from "sap/fe/macros/internal/helpers/TableTemplating";
import { TitleLevel } from "sap/ui/core/library";
import Context from "sap/ui/model/Context";
import CommonHelper from "../CommonHelper";
import ActionHelper from "../internal/helpers/ActionHelper";
import MacroAPI from "../MacroAPI";
import { Action, ActionGroup, Column } from "./TableAPI";
import TableHelper from "./TableHelper";
type ExtendedActionGroup = ActionGroup & { menuContentActions?: Record<string, Action> };
type ActionOrActionGroup = Record<string, Action | ExtendedActionGroup>;

const setCustomActionProperties = function (childAction: Element) {
	let menuContentActions = null;
	const act = childAction;
	let menuActions: any[] = [];
	const actionKey = act.getAttribute("key")?.replace("InlineXML_", "");
	if (act.children.length && act.localName === "ActionGroup" && act.namespaceURI === "sap.fe.macros") {
		const actionsToAdd = Array.prototype.slice.apply(act.children);
		let actionIdx = 0;
		menuContentActions = actionsToAdd.reduce((acc, actToAdd) => {
			const actionKeyAdd = actToAdd.getAttribute("key")?.replace("InlineXML_", "") || actionKey + "_Menu_" + actionIdx;
			const curOutObject = {
				key: actionKeyAdd,
				text: actToAdd.getAttribute("text"),
				__noWrap: true,
				press: actToAdd.getAttribute("press"),
				requiresSelection: actToAdd.getAttribute("requiresSelection") === "true",
				enabled: actToAdd.getAttribute("enabled") === null ? true : actToAdd.getAttribute("enabled")
			};
			acc[curOutObject.key] = curOutObject;
			actionIdx++;
			return acc;
		}, {});
		menuActions = Object.values(menuContentActions)
			.slice(-act.children.length)
			.map(function (menuItem: any) {
				return menuItem.key;
			});
	}
	return {
		key: actionKey,
		text: act.getAttribute("text"),
		position: {
			placement: act.getAttribute("placement"),
			anchor: act.getAttribute("anchor")
		},
		__noWrap: true,
		press: act.getAttribute("press"),
		requiresSelection: act.getAttribute("requiresSelection") === "true",
		enabled: act.getAttribute("enabled") === null ? true : act.getAttribute("enabled"),
		menu: menuActions.length ? menuActions : null,
		menuContentActions: menuContentActions
	};
};

const setCustomColumnProperties = function (childColumn: Element, aggregationObject: any) {
	aggregationObject.key = aggregationObject.key.replace("InlineXML_", "");
	childColumn.setAttribute("key", aggregationObject.key);
	return {
		// Defaults are to be defined in Table.ts
		key: aggregationObject.key,
		type: "Slot",
		width: childColumn.getAttribute("width"),
		importance: childColumn.getAttribute("importance"),
		horizontalAlign: childColumn.getAttribute("horizontalAlign"),
		availability: childColumn.getAttribute("availability"),
		header: childColumn.getAttribute("header"),
		template: childColumn.children[0]?.outerHTML || "",
		properties: childColumn.getAttribute("properties") ? childColumn.getAttribute("properties")?.split(",") : undefined,
		position: {
			placement: childColumn.getAttribute("placement") || childColumn.getAttribute("positionPlacement"), //positionPlacement is kept for backwards compatibility
			anchor: childColumn.getAttribute("anchor") || childColumn.getAttribute("positionAnchor") //positionAnchor is kept for backwards compatibility
		}
	};
};

@defineBuildingBlock({
	name: "Table",
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros"
})
export default class TableBlock extends BuildingBlockBase {
	//  *************** Public & Required Attributes ********************
	@blockAttribute({ type: "sap.ui.model.Context", isPublic: true, required: true })
	metaPath!: Context;

	//  *************** Public Attributes ********************
	/**
	 *The `busy` mode of table
	 */
	@blockAttribute({ type: "boolean", isPublic: true })
	busy?: boolean;

	@blockAttribute({ type: "sap.ui.model.Context", isPublic: true })
	contextPath?: Context;

	/**
	 * Parameter used to show the fullScreen button on the table.
	 */
	@blockAttribute({ type: "boolean", isPublic: true })
	enableFullScreen?: boolean;

	/**
	 * Enable export to file
	 */
	@blockAttribute({ type: "boolean", isPublic: true })
	enableExport?: boolean;

	/**
	 * Enable export to file
	 */
	@blockAttribute({ type: "boolean", isPublic: true })
	enablePaste?: boolean | CompiledBindingToolkitExpression;

	/**
	 * The control ID of the FilterBar that is used to filter the rows of the table.
	 */
	@blockAttribute({ type: "string", isPublic: true })
	filterBar?: string;

	/**
	 * Specifies header text that is shown in table.
	 */
	@blockAttribute({ type: "string", isPublic: true })
	header?: string;

	/**
	 * Defines the "aria-level" of the table header
	 */
	@blockAttribute({ type: "sap.ui.core.TitleLevel", isPublic: true })
	headerLevel: TitleLevel = TitleLevel.Auto;

	/**
	 * Controls if the header text should be shown or not
	 */
	@blockAttribute({ type: "boolean", isPublic: true })
	headerVisible?: boolean;

	@blockAttribute({ type: "string", isPublic: true })
	id?: string;

	@blockAttribute({ type: "boolean", isPublic: true })
	isSearchable?: boolean;

	/**
	 * Personalization Mode
	 */
	@blockAttribute({ type: "string|boolean", isPublic: true })
	personalization?: string | boolean;

	/**
	 * Specifies whether the table should be read-only or not.
	 */
	@blockAttribute({ type: "boolean", isPublic: true })
	readOnly?: boolean;

	/**
	 * Allows to choose the Table type. Allowed values are `ResponsiveTable` or `GridTable`.
	 */
	@blockAttribute({ type: "string", isPublic: true })
	type?: string;

	/**
	 * Specifies whether the table is displayed with condensed layout (true/false). The default setting is `false`.
	 */
	@blockAttribute({ type: "boolean", isPublic: true })
	useCondensedLayout?: boolean;

	/**
	 * Specifies the selection mode (None,Single,Multi,Auto)
	 */
	@blockAttribute({ type: "string", isPublic: true })
	selectionMode?: string;

	@blockAttribute({ type: "string", isPublic: true })
	variantManagement?: string;

	//  *************** Private & Required Attributes ********************
	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: false,
		required: true,
		expectedTypes: ["EntitySet", "NavigationProperty", "Singleton"]
	})
	collection!: Context;

	//  *************** Private Attributes ********************
	@blockAttribute({ type: "string" })
	_apiId?: string;

	@blockAttribute({ type: "boolean" })
	autoBindOnInit?: boolean;

	@blockAttribute({ type: "EntitySet|NavigationProperty" })
	collectionEntity?: EntitySet | NavigationProperty;

	@blockAttribute({ type: "string" })
	columnEditMode?: string;

	/**
	 * Setting to determine if the new row should be created at the end or beginning
	 */
	@blockAttribute({ type: "boolean" })
	createAtEnd?: boolean;

	@blockAttribute({ type: "string" })
	createNewAction?: string;

	/**
	 * Creation Mode to be passed to the onCreate handler. Values: ["Inline", "NewPage"]
	 */
	@blockAttribute({ type: "string" })
	creationMode?: string;

	@blockAttribute({ type: "string" })
	createOutbound?: string;

	@blockAttribute({ type: "string" })
	createOutboundDetail?: {
		semanticObject: string;
		action: string;
		parameters?: any;
	};

	/**
	 * Specifies the full path and function name of a custom validation function.
	 */
	@blockAttribute({ type: "string" })
	customValidationFunction?: string;

	@blockAttribute({ type: "string" })
	dataStateIndicatorFilter?: string;

	/**
	 * Specifies whether the button is hidden when no data has been entered yet in the row (true/false). The default setting is `false`.
	 */
	@blockAttribute({ type: "boolean" })
	disableAddRowButtonForEmptyData?: boolean;

	@blockAttribute({ type: "boolean" })
	enableAutoColumnWidth?: boolean;

	@blockAttribute({ type: "boolean" })
	enableAutoScroll?: boolean;

	@blockAttribute({ type: "string" })
	fieldMode: string = "";

	/**
	 * The control ID of the FilterBar that is used internally to filter the rows of the table.
	 */
	@blockAttribute({ type: "string" })
	filterBarId?: string;

	@blockAttribute({ type: "number" })
	inlineCreationRowCount?: number;

	@blockAttribute({ type: "boolean" })
	isAlp?: boolean = false;

	@blockAttribute({ type: "boolean" })
	isCompactType?: boolean;

	@blockAttribute({ type: "boolean" })
	isOptimizedForSmallDevice?: boolean;

	/**
	 * ONLY FOR RESPONSIVE TABLE: Setting to define the checkbox in the column header: Allowed values are `Default` or `ClearAll`. If set to `Default`, the sap.m.Table control renders the Select All checkbox, otherwise the Deselect All button is rendered.
	 */
	@blockAttribute({ type: "string" })
	multiSelectMode?: string;

	/**
	 * Used for binding the table to a navigation path. Only the path is used for binding rows.
	 */
	@blockAttribute({ type: "string" })
	navigationPath?: string;

	/**
	 * Parameter which sets the noDataText for the mdc table
	 */
	@blockAttribute({ type: "string" })
	noDataText?: string;

	/**
	 * Specifies the possible actions available on the table row (Navigation,null). The default setting is `undefined`
	 */
	@blockAttribute({ type: "string" })
	rowAction?: string = undefined;

	@blockAttribute({ type: "string" })
	tableType?: string;

	@blockAttribute({ type: "string" })
	updatablePropertyPath?: string;

	@blockAttribute({ type: "boolean" })
	useBasicSearch?: boolean;

	@blockAttribute({ type: "boolean" })
	searchable?: boolean;

	/**
	 * ONLY FOR GRID TABLE: Number of indices which can be selected in a range. If set to 0, the selection limit is disabled, and the Select All checkbox appears instead of the Deselect All button.
	 */
	@blockAttribute({ type: "number" })
	selectionLimit?: number;

	@blockAttribute({ type: "string" })
	showCreate?: string | boolean;

	@blockAttribute({ type: "object", isPublic: true })
	tableDefinition!: TableVisualization; // We require tableDefinition to be there even though it is not formally required

	@blockAttribute({ type: "sap.ui.model.Context" })
	tableDefinitionContext?: Context;

	@blockAttribute({ type: "string" })
	tableDelegate?: string;

	@blockAttribute({ type: "string" })
	tabTitle: string = "";

	@blockAttribute({ type: "boolean" })
	visible?: boolean;

	@blockAggregation({
		type: "sap.fe.macros.internal.table.Action | sap.fe.macros.internal.table.ActionGroup",
		isPublic: true,
		processAggregations: setCustomActionProperties
	})
	actions?: ActionOrActionGroup;

	@blockAggregation({
		type: "sap.fe.macros.internal.table.Column",
		isPublic: true,
		hasVirtualNode: true,
		processAggregations: setCustomColumnProperties
	})
	columns?: Record<string, Column>;

	convertedMetaData: ConvertedMetadata;

	contextObjectPath: DataModelObjectPath;

	pageTemplateType: TemplateType;

	/**
	 * Event handler to react when the user chooses a row
	 */
	@blockEvent()
	rowPress?: string;

	/**
	 * Event handler to react to the contextChange event of the table.
	 */
	@blockEvent()
	onContextChange?: string;

	/**
	 *  Event handler for change event.
	 */
	@blockEvent()
	onChange?: string;

	/**
	 * Event handler called when the user chooses an option of the segmented button in the ALP View
	 */
	@blockEvent()
	onSegmentedButtonPressed?: string;

	@blockEvent()
	variantSaved?: string;

	/**
	 * Event handler to react to the stateChange event of the table.
	 */
	@blockEvent()
	stateChange?: string;

	/**
	 * Event handler to react when the table selection changes
	 */
	@blockEvent()
	selectionChange?: string;

	@blockEvent()
	variantSelected?: string;

	constructor(props: PropertiesOf<TableBlock>, controlConfiguration: any, settings: any) {
		super(props);
		const contextObjectPath = getInvolvedDataModelObjects(this.metaPath, this.contextPath as Context);
		this.contextObjectPath = contextObjectPath;
		const pageContext = settings.bindingContexts.converterContext;
		this.pageTemplateType = pageContext?.getObject("/templateType");

		const tableDefinition = TableBlock.setUpTableDefinition(this, settings);
		this.collection = settings.models.metaModel.createBindingContext(tableDefinition.annotation.collection);
		this.convertedMetaData = this.contextObjectPath.convertedTypes;
		this.collectionEntity = this.convertedMetaData.resolvePath(this.tableDefinition.annotation.collection).target as EntitySet;

		this.setUpId();

		this.selectionMode = this.tableDefinition.annotation.selectionMode;
		this.enableFullScreen = this.tableDefinition.control.enableFullScreen;
		this.enableExport = this.tableDefinition.control.enableExport;
		this.enablePaste = this.tableDefinition.annotation.standardActions.actions.paste.enabled;
		this.updatablePropertyPath = this.tableDefinition.annotation.standardActions.updatablePropertyPath;
		this.type = this.tableDefinition.control.type;
		this.disableAddRowButtonForEmptyData ??= this.tableDefinition.control.disableAddRowButtonForEmptyData;
		this.customValidationFunction ??= this.tableDefinition.control.customValidationFunction;
		this.headerVisible ??= this.tableDefinition.control.headerVisible;
		this.searchable ??= this.tableDefinition.annotation.searchable;
		this.inlineCreationRowCount ??= this.tableDefinition.control.inlineCreationRowCount;
		this.header ??= this.tableDefinition.annotation.title;
		this.selectionLimit ??= this.tableDefinition.control.selectionLimit;
		this.isCompactType ??= this.tableDefinition.control.isCompactType;
		this.creationMode ??= this.tableDefinition.annotation.create.mode;
		this.createAtEnd ??= (this.tableDefinition.annotation.create as CreateBehavior).append;
		this.createOutbound ??= (this.tableDefinition.annotation.create as CreateBehaviorExternal).outbound;
		this.createNewAction ??= (this.tableDefinition.annotation.create as CreateBehavior).newAction;
		this.createOutboundDetail ??= (this.tableDefinition.annotation.create as CreateBehaviorExternal).outboundDetail;

		this.personalization ??= this.tableDefinition.annotation.p13nMode;
		this.variantManagement ??= this.tableDefinition.annotation.variantManagement;
		this.enableAutoColumnWidth ??= true;
		this.dataStateIndicatorFilter ??= this.tableDefinition.control.dataStateIndicatorFilter;
		this.isOptimizedForSmallDevice ??= CommonUtils.isSmallDevice();
		this.navigationPath = tableDefinition.annotation.navigationPath;
		if (tableDefinition.annotation.collection.startsWith("/") && isSingleton(contextObjectPath.startingEntitySet)) {
			tableDefinition.annotation.collection = this.navigationPath;
		}
		this.convertedMetaData = this.contextObjectPath.convertedTypes;
		this.setReadOnly();
		if (this.rowPress) {
			this.rowAction = "Navigation";
		}
		this.rowPress ??= this.tableDefinition.annotation.row?.press;
		this.rowAction ??= this.tableDefinition.annotation.row?.action;

		if (this.personalization === "false") {
			this.personalization = undefined;
		} else if (this.personalization === "true") {
			this.personalization = "Sort,Column,Filter";
		}

		switch (this.personalization) {
			case "false":
				this.personalization = undefined;
				break;
			case "true":
				this.personalization = "Sort,Column,Filter";
				break;
			default:
		}

		if (this.isSearchable === false) {
			this.searchable = false;
		} else {
			this.searchable = this.tableDefinition.annotation.searchable;
		}

		let useBasicSearch = false;

		// Note for the 'filterBar' property:
		// 1. ID relative to the view of the Table.
		// 2. Absolute ID.
		// 3. ID would be considered in association to TableAPI's ID.
		if (!this.filterBar && !this.filterBarId && this.searchable) {
			// filterBar: Public property for building blocks
			// filterBarId: Only used as Internal private property for FE templates
			this.filterBarId = generate([this.id, "StandardAction", "BasicSearch"]);
			useBasicSearch = true;
		}
		// Internal properties
		this.useBasicSearch = useBasicSearch;
		this.tableType = this.type;
		this.showCreate = this.tableDefinition.annotation.standardActions.actions.create.visible || true;
		this.autoBindOnInit = this.tableDefinition.annotation.autoBindOnInit;

		switch (this.readOnly) {
			case true:
				this.columnEditMode = "Display";
				break;
			case false:
				this.columnEditMode = "Editable";
				break;
			default:
				this.columnEditMode = undefined;
		}
	}

	/**
	 * Returns the annotation path pointing to the visualization annotation (LineItem).
	 *
	 * @param contextObjectPath The datamodel object path for the table
	 * @param converterContext The converter context
	 * @returns The annotation path
	 */
	static getVisualizationPath(contextObjectPath: DataModelObjectPath, converterContext: ConverterContext): string {
		const metaPath = getContextRelativeTargetObjectPath(contextObjectPath) as string;

		// fallback to default LineItem if metapath is not set
		if (!metaPath) {
			Log.error(`Missing meta path parameter for LineItem`);
			return `@${UIAnnotationTerms.LineItem}`;
		}

		if (contextObjectPath.targetObject.term === UIAnnotationTerms.LineItem) {
			return metaPath; // MetaPath is already pointing to a LineItem
		}
		//Need to switch to the context related the PV or SPV
		const resolvedTarget = converterContext.getEntityTypeAnnotation(metaPath);

		let visualizations: VisualizationAndPath[] = [];
		switch (contextObjectPath.targetObject.term) {
			case UIAnnotationTerms.SelectionPresentationVariant:
				if (contextObjectPath.targetObject.PresentationVariant) {
					visualizations = getVisualizationsFromPresentationVariant(
						contextObjectPath.targetObject.PresentationVariant,
						metaPath,
						resolvedTarget.converterContext,
						true
					);
				}
				break;

			case UIAnnotationTerms.PresentationVariant:
				visualizations = getVisualizationsFromPresentationVariant(
					contextObjectPath.targetObject,
					metaPath,
					resolvedTarget.converterContext,
					true
				);
				break;

			default:
				Log.error(`Bad metapath parameter for table : ${contextObjectPath.targetObject.term}`);
		}

		const lineItemViz = visualizations.find((viz) => {
			return viz.visualization.term === UIAnnotationTerms.LineItem;
		});

		if (lineItemViz) {
			return lineItemViz.annotationPath;
		} else {
			// fallback to default LineItem if annotation missing in PV
			Log.error(`Bad meta path parameter for LineItem: ${contextObjectPath.targetObject.term}`);
			return `@${UIAnnotationTerms.LineItem}`; // Fallback
		}
	}

	static getPresentationPath(contextObjectPath: DataModelObjectPath): string | undefined {
		let presentationPath;

		switch (contextObjectPath.targetObject?.term) {
			case UIAnnotationTerms.PresentationVariant:
				presentationPath = getContextRelativeTargetObjectPath(contextObjectPath);
				break;
			case UIAnnotationTerms.SelectionPresentationVariant:
				presentationPath = getContextRelativeTargetObjectPath(contextObjectPath) + "/PresentationVariant";
				break;
		}

		return presentationPath;
	}

	static setUpTableDefinition(table: TableBlock, settings: any): TableVisualization {
		let tableDefinition = table.tableDefinition;
		if (!tableDefinition) {
			const initialConverterContext = table.getConverterContext(table.contextObjectPath, table.contextPath?.getPath(), settings);
			const visualizationPath = TableBlock.getVisualizationPath(table.contextObjectPath, initialConverterContext);
			const presentationPath = TableBlock.getPresentationPath(table.contextObjectPath);

			//Check if we have ActionGroup and add nested actions

			const extraParams: any = {};
			const tableSettings = {
				enableExport: table.enableExport,
				enableFullScreen: table.enableFullScreen,
				enablePaste: table.enablePaste,
				selectionMode: table.selectionMode,
				type: table.type
			};

			if (table.actions) {
				Object.values(table.actions)?.forEach((item) => {
					table.actions = { ...table.actions, ...(item as ExtendedActionGroup).menuContentActions };
					delete (item as ExtendedActionGroup).menuContentActions;
				});
			}

			// table actions and columns as {} if not provided to allow merge with manifest settings
			extraParams[visualizationPath] = {
				actions: table.actions || {},
				columns: table.columns || {},
				tableSettings: tableSettings
			};
			const converterContext = table.getConverterContext(
				table.contextObjectPath,
				table.contextPath?.getPath(),
				settings,
				extraParams
			);

			const visualizationDefinition = getDataVisualizationConfiguration(
				visualizationPath,
				table.useCondensedLayout,
				converterContext,
				undefined,
				undefined,
				presentationPath,
				true
			);

			tableDefinition = visualizationDefinition.visualizations[0] as TableVisualization;
			table.tableDefinition = tableDefinition;
		}
		table.tableDefinitionContext = MacroAPI.createBindingContext(table.tableDefinition as object, settings);

		return tableDefinition;
	}

	setUpId() {
		if (this.id) {
			// The given ID shall be assigned to the TableAPI and not to the MDC Table
			this._apiId = this.id;
			this.id = this.getContentId(this.id);
		} else {
			// We generate the ID. Due to compatibility reasons we keep it on the MDC Table but provide assign
			// the ID with a ::Table suffix to the TableAPI
			const tableDefinition = this.tableDefinition;
			this.id ??= tableDefinition.annotation.id;
			this._apiId = generate([tableDefinition.annotation.id, "Table"]);
		}
	}

	setReadOnly() {
		// Special code for readOnly
		// readonly = false -> Force editable
		// readonly = true -> Force display mode
		// readonly = undefined -> Bound to edit flow
		if (this.readOnly === undefined && this.tableDefinition.annotation.displayMode === true) {
			this.readOnly = true;
		}
	}

	getTableType = () => {
		const collection = this.collection.getObject();
		switch (this.tableType) {
			case "GridTable":
				return xml`<mdcTable:GridTableType
                rowCountMode="${this.tableDefinition.control.rowCountMode}"
                rowCount="${this.tableDefinition.control.rowCount}"
                selectionLimit="${this.selectionLimit}"
            />`;
			case "TreeTable":
				return xml`<mdcTable:TreeTableType
                rowCountMode="${this.tableDefinition.control.rowCountMode}"
                rowCount="${this.tableDefinition.control.rowCount}"
            />`;
			default:
				const growingMode = collection.$kind === "EntitySet" ? "Scroll" : undefined;
				return xml`<mdcTable:ResponsiveTableType
                showDetailsButton="true"
                detailsButtonSetting="{=['Low', 'Medium', 'None']}"
                growingMode="${growingMode}"
            />`;
		}
	};

	_getEntityType() {
		return (this.collectionEntity as EntitySet)?.entityType || (this.collectionEntity as NavigationProperty)?.targetType;
	}

	/**
	 * Generates the template string for the valueHelp based on the dataField path.
	 *
	 * @param datFieldPath DatFieldPath to be evaluated
	 * @returns The xml string representation of the valueHelp
	 */
	getValueHelpTemplateFromPath(datFieldPath?: string) {
		return datFieldPath
			? `<macros:ValueHelp
        idPrefix="${generate([this.id, "TableValueHelp"])}"
        property="${datFieldPath}/Value"
    />`
			: "";
	}

	/**
	 * Generates the template string for the valueHelp based on column.
	 *
	 * @param column Column to be evaluated
	 * @returns The xml string representation of the valueHelp
	 */
	getValueHelp(column: AnnotationTableColumn) {
		const dataFieldObject = this.convertedMetaData.resolvePath(column.annotationPath).target as DataFieldAbstractTypes;
		if (isDataFieldForAnnotation(dataFieldObject) && dataFieldObject.Target.$target.term === UIAnnotationTerms.Chart) {
			return ``;
		} else if (isDataFieldForAnnotation(dataFieldObject) && dataFieldObject.Target.$target.term === UIAnnotationTerms.FieldGroup) {
			let template = ``;
			for (const index in dataFieldObject.Target.$target.Data) {
				template += this.getValueHelpTemplateFromPath(column.annotationPath + "/Target/$AnnotationPath/Data/" + index);
			}
			return xml`${template}`;
		} else {
			return xml`${this.getValueHelpTemplateFromPath(column.annotationPath)}`;
		}
	}

	getDependents = () => {
		let dependents = ``;
		if (!this.readOnly && this.tableDefinition?.columns) {
			for (const column of this.tableDefinition.columns) {
				if (column.availability === "Default" && "annotationPath" in column) {
					dependents += this.getValueHelp(column);
				}
			}
		}
		const standardActions = this.tableDefinition.annotation.standardActions.actions;

		if (this.tableDefinition.annotation.standardActions.isInsertUpdateTemplated && standardActions.create.isTemplated === "true") {
			dependents += xml`<control:CommandExecution
                                execute="${TableHelper.pressEventForCreateButton(this, true)}"
                                visible="${standardActions.create.visible}"
                                enabled="${standardActions.create.enabled}"
                                command="Create"
                            />`;
		}
		if (standardActions.delete.isTemplated === "true") {
			const headerInfo = (
				(this.collectionEntity as EntitySet)?.entityType || (this.collectionEntity as NavigationProperty)?.targetType
			)?.annotations?.UI?.HeaderInfo;
			dependents += xml`<control:CommandExecution
                        execute="${TableHelper.pressEventForDeleteButton(
							this,
							this.collectionEntity!.name,
							headerInfo,
							this.contextObjectPath
						)}"
                        visible="${standardActions.delete.visible}"
                        enabled="${standardActions.delete.enabled}"
                        command="DeleteEntry"
                        />`;
		}

		for (const actionName in this.tableDefinition.commandActions) {
			const action = this.tableDefinition.commandActions[actionName];
			dependents += `${this.getActionCommand(actionName, action)}`;
		}
		dependents += `<control:CommandExecution execute="TableRuntime.displayTableSettings" command="TableSettings" />`;
		if (this.variantManagement === "None") {
			dependents += `<!-- Persistence provider offers persisting personalization changes without variant management -->
			<p13n:PersistenceProvider id="${generate([this.id, "PersistenceProvider"])}" for="${this.id}" />`;
		}

		return xml`${dependents}`;
	};

	/**
	 * Generates the template string for the actionCommand.
	 *
	 * @param actionName The name of the action
	 * @param action Action to be evaluated
	 * @returns The xml string representation of the actionCommand
	 */
	getActionCommand(actionName: string, action: CustomAction) {
		const dataField = action.annotationPath
			? (this.convertedMetaData.resolvePath(action.annotationPath).target as DataFieldForAction)
			: undefined;
		const actionContext = action.annotationPath
			? CommonHelper.getActionContext(this.metaPath.getModel().createBindingContext(action.annotationPath + "/Action")!)
			: undefined;
		const isBound = dataField?.ActionTarget?.isBound;
		const isOperationAvailable = dataField?.ActionTarget?.annotations?.Core?.OperationAvailable?.valueOf() !== false;
		const displayCommandAction = action.type === "ForAction" ? isBound !== true || isOperationAvailable : true;
		if (displayCommandAction) {
			return xml`<internalMacro:ActionCommand
							action="{tableDefinition>commandActions/${actionName}}"
							onExecuteAction="${TableHelper.pressEventDataFieldForActionButton(
								this,
								dataField,
								this.collectionEntity!.name,
								this.tableDefinition.operationAvailableMap,
								actionContext,
								action.isNavigable,
								action.enableAutoScroll,
								action.defaultValuesExtensionFunction
							)}"
							onExecuteIBN="${CommonHelper.getPressHandlerForDataFieldForIBN(
								dataField,
								"${internal>selectedContexts}",
								!this.tableDefinition.enableAnalytics
							)}"
							onExecuteManifest="${action.noWrap ? action.press : CommonHelper.buildActionWrapper(action, this)}"
							isIBNEnabled="${
								action.enabled ??
								TableHelper.isDataFieldForIBNEnabled(
									this,
									dataField,
									!!(dataField as any).RequiresContext,
									(dataField as any).NavigationAvailable?.valueOf()
								)
							}"
							isActionEnabled="${
								action.enabled ??
								TableHelper.isDataFieldForActionEnabled(this, dataField, !!isBound, actionContext, action.enableOnSelect)
							}"
							/>`;
		}
		return ``;
	}
	getActions = () => {
		let dependents = "";
		if (this.onSegmentedButtonPressed) {
			dependents = `<mdcat:ActionToolbarAction
            layoutInformation="{
                    aggregationName: 'end',
                    alignment: 'End'
                }"
            visible="{= \${pageInternal>alpContentView} === 'Table' }"
        >
            <SegmentedButton
                id="${generate([this.id, "SegmentedButton", "TemplateContentView"])}"
                select="${this.onSegmentedButtonPressed}"
                selectedKey="{pageInternal>alpContentView}"
            >
                <items>`;

			if (CommonHelper.isDesktop()) {
				dependents += `<SegmentedButtonItem
                            tooltip="{sap.fe.i18n>M_COMMON_HYBRID_SEGMENTED_BUTTON_ITEM_TOOLTIP}"
							key = "Hybrid"
							icon = "sap-icon://chart-table-view"
							/>`;
			}
			dependents += `<SegmentedButtonItem
                        tooltip="{sap.fe.i18n>M_COMMON_CHART_SEGMENTED_BUTTON_ITEM_TOOLTIP}"
                        key="Chart"
                        icon="sap-icon://bar-chart"
                    />
                    <SegmentedButtonItem
                        tooltip="{sap.fe.i18n>M_COMMON_TABLE_SEGMENTED_BUTTON_ITEM_TOOLTIP}"
                        key="Table"
                        icon="sap-icon://table-view"
                    />
                </items>
            </SegmentedButton>
        </mdcat:ActionToolbarAction>`;
		}
		dependents += `<core:Fragment fragmentName="sap.fe.macros.table.Actions" type="XML" />`;
		return xml`${dependents}`;
	};

	/**
	 * Generates the template string for the CreationRow.
	 *
	 * @returns The xml string representation of the CreationRow
	 */
	getCreationRow() {
		if (this.creationMode === "CreationRow") {
			const creationRowAction = this.tableDefinition.annotation.standardActions.actions.creationRow;
			if (creationRowAction.isTemplated) {
				return xml`<mdc:creationRow>
							<mdcTable:CreationRow
								id="${generate([this.id, "CreationRow"])}"
								visible="${creationRowAction.visible}"
								apply="${TableHelper.pressEventForCreateButton(this, false)}"
								applyEnabled="${creationRowAction.enabled}"
								macrodata:disableAddRowButtonForEmptyData="${this.disableAddRowButtonForEmptyData}"
								macrodata:customValidationFunction="${this.customValidationFunction}"
							/>
					   	   </mdc:creationRow>`;
			}
		}
		return "";
	}

	getRowSetting() {
		let rowSettingsTemplate = `<mdcTable:RowSettings
        navigated="${this.tableDefinition.annotation.row?.rowNavigated}"
        highlight="${this.tableDefinition.annotation.row?.rowHighlighting}"
        >`;
		if (this.rowAction === "Navigation") {
			rowSettingsTemplate += `<mdcTable:rowActions>
                <mdcTable:RowActionItem
                    type = "${this.rowAction}"
                    press = "${this.tableType === "ResponsiveTable" ? "" : this.rowPress}"
                    visible = "${this.tableDefinition.annotation.row?.visible}"
                    />
                </mdcTable:rowActions>`;
		}
		rowSettingsTemplate += `</mdcTable:RowSettings>`;
		return xml`${rowSettingsTemplate}`;
	}

	getVariantManagement() {
		if (this.variantManagement === "Control") {
			return xml`<mdc:variant>
                        <variant:VariantManagement
                            id="${generate([this.id, "VM"])}"
                            for="{this>id}"
                            showSetAsDefault="true"
                            select="{this>variantSelected}"
                            headerLevel="${this.headerLevel}"
                            save="${this.variantSaved}"
                        />
                    </mdc:variant>`;
		}
		return "";
	}

	getQuickFilter() {
		if (this.tableDefinition.control.filters?.quickFilters) {
			const quickFilters = this.tableDefinition.control.filters.quickFilters;
			return xml`<template:with path="tableDefinition>control/filters/quickFilters" var="quickFilters">
                        <mdc:quickFilter>
                            <macroTable:QuickFilterContainer
                                id="${generate([this.id, "QuickFilterContainer"])}"
                                entitySet="${CommonHelper.getContextPath(null, { context: this.collection })}"
                                parentEntityType="{contextPath>$Type}"
                                showCounts="${quickFilters.showCounts === true}"
                                macrodata:filters="${TableHelper.formatHiddenFilters(this.tableDefinition.control.filters?.quickFilters)}"
                                batchGroupId="$auto.Workers"
                            />
                        </mdc:quickFilter>
                    </template:with>`;
		}
		return "";
	}
	getEmptyRowsEnabled() {
		return this.creationMode === CreationMode.InlineCreationRows
			? this.tableDefinition.annotation.standardActions.actions.create.enabled
			: undefined;
	}

	getTemplate() {
		const headerBindingExpression = buildExpressionForHeaderVisible(this);
		if (this.rowPress) {
			this.rowAction = "Navigation";
		}
		this.rowPress ??= this.tableDefinition.annotation.row?.press;
		const collectionDeletablePath = (
			(this.collectionEntity as EntitySet).annotations.Capabilities?.DeleteRestrictions
				?.Deletable as PathAnnotationExpression<boolean>
		)?.path;
		const lineItem = TableHelper.getUiLineItemObject(this.metaPath, this.convertedMetaData) as
			| DataFieldForIntentBasedNavigation[]
			| undefined;
		const delegate = TableHelper.getDelegate?.(
			this.tableDefinition,
			(this.isAlp as boolean)?.toString(),
			this.tableDefinition.annotation.entityName
		);
		const selectionChange = `TableRuntime.setContexts(\${$source>/}, '${collectionDeletablePath}', '${
			(this.collectionEntity as EntitySet).annotations.Common?.DraftRoot
		}', '${this.tableDefinition.operationAvailableMap}', '${TableHelper.getNavigationAvailableMap(
			lineItem
		)}', '${ActionHelper.getMultiSelectDisabledActions(lineItem)}', '${this.updatablePropertyPath}')`;

		const entityType = this._getEntityType();
		return xml`
            <macroTable:TableAPI
                xmlns="sap.m"
                xmlns:mdc="sap.ui.mdc"
                xmlns:plugins="sap.m.plugins"
                xmlns:mdcTable="sap.ui.mdc.table"
                xmlns:macroTable="sap.fe.macros.table"
                xmlns:mdcat="sap.ui.mdc.actiontoolbar"
                xmlns:core="sap.ui.core"
                xmlns:control="sap.fe.core.controls"
                xmlns:dt="sap.ui.dt"
                xmlns:fl="sap.ui.fl"
                xmlns:variant="sap.ui.fl.variants"
                xmlns:p13n="sap.ui.mdc.p13n"
                xmlns:internalMacro="sap.fe.macros.internal"
                xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"
                xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
                id="${this._apiId}"
                tableDefinition="{_pageModel>${this.tableDefinitionContext!.getPath()}}"
                entityTypeFullyQualifiedName="${entityType?.fullyQualifiedName}"
                metaPath="${this.metaPath?.getPath()}"
                contextPath="${this.contextPath?.getPath()}"
                stateChange="${this.stateChange}"
                selectionChange="${this.selectionChange}"
                readOnly="${this.readOnly}"
                filterBar="${this.filterBar}"
                macrodata:tableAPILocalId="${this._apiId}"
                emptyRowsEnabled="${this.getEmptyRowsEnabled()}"
                enableAutoColumnWidth="${this.enableAutoColumnWidth}"
                isOptimizedForSmallDevice="${this.isOptimizedForSmallDevice}"
            >
				<template:with path="collection>${CommonHelper.getTargetCollectionPath(this.collection)}" var="targetCollection">
                <macroTable:layoutData>
                    <FlexItemData maxWidth="100%" />
                </macroTable:layoutData>
                <!-- macrodata has to be an expression binding if it needs to be set as attribute via change handler during templating -->
                    <mdc:Table
                        binding="{internal>controls/${this.id}}"
                        unittest:id="TableMacroFragment"
                        core:require="{TableRuntime: 'sap/fe/macros/table/TableRuntime', API: 'sap/fe/macros/table/TableAPI'}"
                        fl:flexibility="{this>fl:flexibility}"
                        sortConditions="${this.tableDefinition.annotation.sortConditions}"
                        groupConditions="${CommonHelper.stringifyObject(this.tableDefinition.annotation.groupConditions as string)}"
                        aggregateConditions="${CommonHelper.stringifyObject(this.tableDefinition.annotation.aggregateConditions as string)}"
                        dt:designtime="${this.variantManagement === "None" ? "not-adaptable" : undefined}"
                        macrodata:kind="${this.collectionEntity!._type}"
                        macrodata:navigationPath="${this.navigationPath}"
                        id="${this.id}"
                        busy="${this.busy}"
                        busyIndicatorDelay="0"
                        enableExport="${this.enableExport}"
                        delegate="${delegate}"
                        rowPress="${this.rowPress}"
                        height="100%"
                        autoBindOnInit="${this.autoBindOnInit && !this.filterBar}"
                        selectionMode="${this.selectionMode || "None"}"
                        selectionChange="${selectionChange}"
                        showRowCount="${this.tableDefinition.control.showRowCount}"
                        ${this.attr("header", this.header)}
                        headerVisible="${headerBindingExpression}"
                        headerLevel="${this.headerLevel}"
                        threshold="${this.tableDefinition.annotation.threshold}"
                        noData="${this.noDataText}"
                        p13nMode="${this.personalization}"
                        filter="${this.filterBarId}"
                        paste="API.onPaste($event, $controller)"
                        beforeExport="API.onBeforeExport($event)"
                        class="${this.tableDefinition.control.useCondensedTableLayout === true ? "sapUiSizeCondensed" : undefined}"
                        multiSelectMode="${this.tableDefinition.control.multiSelectMode}"
                        showPasteButton="${this.tableDefinition.annotation.standardActions.actions.paste.visible}"
                        enablePaste="${this.tableDefinition.annotation.standardActions.actions.paste.enabled}"
                        macrodata:rowsBindingInfo="${TableHelper.getRowsBindingInfo(this)}"
                        macrodata:enableAnalytics="${this.tableDefinition.enableAnalytics}"
                        macrodata:creationMode="${this.creationMode}"
                        macrodata:inlineCreationRowCount="${this.inlineCreationRowCount}"
                        macrodata:showCreate="${this.showCreate}"
                        macrodata:createAtEnd="${this.createAtEnd}"
                        macrodata:enableAutoScroll="${this.enableAutoScroll}"
                        macrodata:displayModePropertyBinding="${this.readOnly}"
                        macrodata:tableType="${this.tableType}"
                        macrodata:targetCollectionPath="${CommonHelper.getContextPath(null, { context: this.collection })}"
                        macrodata:entityType="${CommonHelper.getContextPath(null, { context: this.collection }) + "/"}"
                        macrodata:metaPath="${CommonHelper.getContextPath(null, { context: this.collection })}"
                        macrodata:onChange="${this.onChange}"
                        macrodata:hiddenFilters="${TableHelper.formatHiddenFilters(this.tableDefinition.control.filters?.hiddenFilters)}"
                        macrodata:requestGroupId="$auto.Workers"
                        macrodata:segmentedButtonId="${generate([this.id, "SegmentedButton", "TemplateContentView"])}"
                        macrodata:enablePaste="${this.enablePaste}"
                        macrodata:operationAvailableMap="${CommonHelper.stringifyCustomData(this.tableDefinition.operationAvailableMap)}"
                        visible="${this.visible}"
                    >
                        <mdc:dataStateIndicator>
                            <plugins:DataStateIndicator
                                filter="${this.dataStateIndicatorFilter}"
                                enableFiltering="true"
                                dataStateChange="API.onDataStateChange"
                            />
                        </mdc:dataStateIndicator>
                        <mdc:type>
                            ${this.getTableType()}
                        </mdc:type>
                        <mdc:dependents>
                            ${this.getDependents()}
                        </mdc:dependents>
                        <mdc:actions>
                            ${this.getActions()}
                        </mdc:actions>
                        <mdc:rowSettings>
                        ${this.getRowSetting()}
                        </mdc:rowSettings>
                        <mdc:columns>
                            <core:Fragment fragmentName="sap.fe.macros.table.Columns" type="XML" />
                        </mdc:columns>
                        ${this.getCreationRow()}
                        ${this.getVariantManagement()}
                        ${this.getQuickFilter()}
                    </mdc:Table>
				</template:with>
            </macroTable:TableAPI>
        `;
	}
}
