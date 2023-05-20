import type { ConvertedMetadata, EntitySet, NavigationProperty, PathAnnotationExpression } from "@sap-ux/vocabularies-types";
import {
	DataField,
	DataFieldAbstractTypes,
	DataFieldForAction,
	DataFieldForAnnotation,
	DataFieldForIntentBasedNavigation,
	FieldGroup,
	LineItem,
	PresentationVariant,
	PresentationVariantType,
	UIAnnotationTerms,
	UIAnnotationTypes
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import { getUiControl } from "sap/fe/core/converters/controls/Common/DataVisualization";
import {
	AnnotationTableColumn,
	TableColumn,
	TableFiltersConfiguration,
	TableVisualization
} from "sap/fe/core/converters/controls/Common/Table";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import TableFormatter from "sap/fe/core/formatters/TableFormatter";
import {
	CompiledBindingToolkitExpression,
	compileExpression,
	constant,
	fn,
	formatResult,
	getExpressionFromAnnotation,
	ifElse,
	isConstant,
	isPathInModelExpression,
	pathInModel,
	ref
} from "sap/fe/core/helpers/BindingToolkit";
import SizeHelper from "sap/fe/core/helpers/SizeHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { isPathAnnotationExpression } from "sap/fe/core/helpers/TypeGuards";
import FELibrary from "sap/fe/core/library";
import { DataModelObjectPath, getContextRelativeTargetObjectPath, getTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { hasText, isImageURL } from "sap/fe/core/templating/PropertyHelper";
import { getEditMode } from "sap/fe/core/templating/UIFormatters";
import CommonHelper from "sap/fe/macros/CommonHelper";
import type { tableDelegateModel } from "sap/fe/macros/DelegateUtil";
import { formatValueRecursively } from "sap/fe/macros/field/FieldTemplating";
import ActionHelper from "sap/fe/macros/internal/helpers/ActionHelper";
import TableBlock from "sap/fe/macros/table/Table.block";
import TableSizeHelper from "sap/fe/macros/table/TableSizeHelper";
import EditMode from "sap/ui/mdc/enum/EditMode";
import Context from "sap/ui/model/Context";
import v4Context from "sap/ui/model/odata/v4/Context";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";

type Hidden = { "@com.sap.vocabularies.UI.v1.Hidden": boolean | { $Path?: string } };

const CreationMode = FELibrary.CreationMode;

/**
 * Helper class used by the control library for OData-specific handling (OData V4)
 *
 * @private
 * @experimental This module is only for internal/experimental use!
 */
const TableHelper = {
	/**
	 * Check if a given action is static.
	 *
	 * @param oActionContext The instance of the action
	 * @param sActionName The name of the action
	 * @returns Returns 'true' if action is static, else 'false'
	 * @private
	 * @ui5-restricted
	 */
	_isStaticAction: function (oActionContext: Context | undefined, sActionName: string | String) {
		let oAction;
		if (oActionContext) {
			if (Array.isArray(oActionContext)) {
				const sEntityType = this._getActionOverloadEntityType(sActionName);
				if (sEntityType) {
					oAction = oActionContext.find(function (action: any) {
						return action.$IsBound && action.$Parameter[0].$Type === sEntityType;
					});
				} else {
					// if this is just one - OK we take it. If it's more it's actually a wrong usage by the app
					// as we used the first one all the time we keep it as it is
					oAction = oActionContext[0];
				}
			} else {
				oAction = oActionContext;
			}
		}

		return !!oAction && oAction.$IsBound && oAction.$Parameter[0].$isCollection;
	},

	/**
	 * Get the entity type of an action overload.
	 *
	 * @param sActionName The name of the action.
	 * @returns The entity type used in the action overload.
	 * @private
	 */
	_getActionOverloadEntityType: function (sActionName: any) {
		if (sActionName && sActionName.indexOf("(") > -1) {
			const aParts = sActionName.split("(");
			return aParts[aParts.length - 1].replaceAll(")", "");
		}
		return undefined;
	},

	/**
	 * Checks whether the action is overloaded on a different entity type.
	 *
	 * @param sActionName The name of the action.
	 * @param sAnnotationTargetEntityType The entity type of the annotation target.
	 * @returns Returns 'true' if the action is overloaded with a different entity type, else 'false'.
	 * @private
	 */
	_isActionOverloadOnDifferentType: function (sActionName: any, sAnnotationTargetEntityType: any) {
		const sEntityType = this._getActionOverloadEntityType(sActionName);
		return !!sEntityType && sAnnotationTargetEntityType !== sEntityType;
	},

	/**
	 * Returns an array of the fields listed by the property RequestAtLeast in the PresentationVariant .
	 *
	 * @param oPresentationVariant The annotation related to com.sap.vocabularies.UI.v1.PresentationVariant.
	 * @returns The fields.
	 * @private
	 * @ui5-restricted
	 */
	getFieldsRequestedByPresentationVariant: function (oPresentationVariant: PresentationVariantType): string[] {
		return oPresentationVariant.RequestAtLeast?.map((oRequested) => oRequested.value) || [];
	},
	getNavigationAvailableFieldsFromLineItem: function (aLineItemContext: Context): string[] {
		const aSelectedFieldsArray: string[] = [];
		((aLineItemContext.getObject() as Array<any>) || []).forEach(function (oRecord: any) {
			if (
				oRecord.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation &&
				!oRecord.Inline &&
				!oRecord.Determining &&
				oRecord.NavigationAvailable?.$Path
			) {
				aSelectedFieldsArray.push(oRecord.NavigationAvailable.$Path);
			}
		});
		return aSelectedFieldsArray;
	},

	getNavigationAvailableMap: function (lineItemCollection: DataFieldAbstractTypes[] | undefined) {
		const oIBNNavigationAvailableMap: any = {};
		lineItemCollection?.forEach((record) => {
			if ("SemanticObject" in record) {
				const sKey = `${record.SemanticObject}-${record.Action}`;
				if (record.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation && !record.Inline && record.RequiresContext) {
					if (record.NavigationAvailable !== undefined) {
						oIBNNavigationAvailableMap[sKey] = isPathAnnotationExpression(record.NavigationAvailable)
							? (record.NavigationAvailable as PathAnnotationExpression<boolean>).path
							: record.NavigationAvailable;
					}
				}
			}
		});

		return JSON.stringify(oIBNNavigationAvailableMap);
	},

	/**
	 * Returns the context of the UI.LineItem.
	 *
	 * @param presentationContext The presentation context (either a presentation variant or a UI.LineItem)
	 * @returns The context of the UI.LineItem
	 */
	getUiLineItem: function (presentationContext: Context) {
		return getUiControl(presentationContext, `@${UIAnnotationTerms.LineItem}`);
	},

	getUiLineItemObject: function (
		lineItemOrPresentationContext: Context,
		convertedMetaData: ConvertedMetadata
	): DataFieldAbstractTypes[] | undefined {
		const lineItemOrPresentationObject = convertedMetaData.resolvePath(lineItemOrPresentationContext.getPath()).target as
			| PresentationVariant
			| LineItem;
		if (!lineItemOrPresentationObject) return undefined;
		const visualizations = (convertedMetaData.resolvePath(lineItemOrPresentationContext.getPath()).target as PresentationVariantType)
			.Visualizations;

		const lineItemObject = (
			visualizations
				? visualizations?.find((item) => item.value.indexOf("@" + UIAnnotationTerms.LineItem) === 0)?.$target
				: lineItemOrPresentationObject
		) as LineItem;
		return lineItemObject?.term === UIAnnotationTerms.LineItem ? lineItemObject : undefined;
	},

	/**
	 * Creates and returns a select query with the selected fields from the parameters that were passed.
	 *
	 * @param table The instance of the inner model of the table building block
	 * @returns The 'select' query that has the selected fields from the parameters that were passed
	 */
	create$Select: function (table: TableBlock) {
		const selectedFields: string[] = [];
		const lineItemContext = TableHelper.getUiLineItem(table.metaPath);
		function pushField(field: string) {
			if (field && !selectedFields.includes(field) && field.indexOf("/") !== 0) {
				// Do not add singleton property (with absolute path) to $select
				selectedFields.push(field);
			}
		}

		function pushFieldList(fields: string[]) {
			if (fields?.length) {
				fields.forEach(pushField);
			}
		}
		const columns = table.tableDefinition.columns;
		const propertiesFromCustomColumns = this.getPropertiesFromCustomColumns(columns);
		if (propertiesFromCustomColumns?.length) {
			pushFieldList(propertiesFromCustomColumns);
		}

		if (lineItemContext.getPath().indexOf(`@${UIAnnotationTerms.LineItem}`) > -1) {
			// Don't process EntityType without LineItem
			const presentationAnnotation = getInvolvedDataModelObjects(table.metaPath).targetObject;
			const operationAvailableProperties = (table.tableDefinition.operationAvailableProperties || "").split(",");
			const applicableProperties = TableHelper._filterNonApplicableProperties(operationAvailableProperties, table.collection);
			const targetCollection =
				(table.collectionEntity as EntitySet).entityType || (table.collectionEntity as NavigationProperty).targetType;
			const aSemanticKeys: string[] = (targetCollection.annotations.Common?.SemanticKey || []).map(
				(oSemanticKey: any) => oSemanticKey.value as string
			);

			if (presentationAnnotation?.$Type === UIAnnotationTypes.PresentationVariantType) {
				pushFieldList(TableHelper.getFieldsRequestedByPresentationVariant(presentationAnnotation));
			}

			pushFieldList(TableHelper.getNavigationAvailableFieldsFromLineItem(lineItemContext));
			pushFieldList(applicableProperties);
			pushFieldList(aSemanticKeys);
			pushField(
				(
					(table.contextObjectPath.targetEntitySet as EntitySet)?.annotations?.Capabilities?.DeleteRestrictions
						?.Deletable as PathAnnotationExpression<boolean>
				)?.path
			);
			pushField(
				(
					(table.contextObjectPath.targetEntitySet as EntitySet)?.annotations?.Capabilities?.UpdateRestrictions
						?.Updatable as PathAnnotationExpression<boolean>
				)?.path
			);
		}
		return selectedFields.join(",");
	},

	/**
	 * Method to get column's width if defined from manifest or from customization via annotations.
	 *
	 * @function
	 * @name getColumnWidth
	 * @param oThis The instance of the inner model of the Table building block
	 * @param column Defined width of the column, which is taken with priority if not null, undefined or empty
	 * @param dataField DataField definition object
	 * @param dataFieldActionText DataField's text from button
	 * @param dataModelObjectPath The object path of the data model
	 * @param useRemUnit Indicates if the rem unit must be concatenated with the column width result
	 * @param microChartTitle The object containing title and description of the MicroChart
	 * @returns - Column width if defined, otherwise width is set to auto
	 */
	getColumnWidth: function (
		oThis: tableDelegateModel,
		column: AnnotationTableColumn,
		dataField: DataField | DataFieldForAnnotation | DataFieldForAction | DataFieldForIntentBasedNavigation,
		dataFieldActionText: string,
		dataModelObjectPath: DataModelObjectPath,
		useRemUnit: boolean,
		microChartTitle?: any
	) {
		if (column.width) {
			return column.width;
		}
		if (oThis.enableAutoColumnWidth === true) {
			let width;
			width =
				this.getColumnWidthForImage(dataModelObjectPath) ||
				this.getColumnWidthForDataField(oThis, column, dataField, dataFieldActionText, dataModelObjectPath, microChartTitle) ||
				undefined;
			if (width) {
				return useRemUnit ? `${width}rem` : width;
			}
			width = compileExpression(
				formatResult(
					[pathInModel("/editMode", "ui"), pathInModel("tablePropertiesAvailable", "internal"), column.name, useRemUnit],
					TableFormatter.getColumnWidth
				)
			);
			return width;
		}
		return undefined;
	},

	/**
	 * Method to get the width of the column containing an image.
	 *
	 * @function
	 * @name getColumnWidthForImage
	 * @param dataModelObjectPath The data model object path
	 * @returns - Column width if defined, otherwise null (the width is treated as a rem value)
	 */
	getColumnWidthForImage: function (dataModelObjectPath: DataModelObjectPath): number | null {
		let width: number | null = null;
		const annotations = dataModelObjectPath.targetObject?.Value?.$target?.annotations;
		const dataType = dataModelObjectPath.targetObject?.Value?.$target?.type;
		if (
			dataModelObjectPath.targetObject?.Value &&
			getEditMode(
				dataModelObjectPath.targetObject.Value?.$target,
				dataModelObjectPath,
				false,
				false,
				dataModelObjectPath.targetObject
			) === EditMode.Display
		) {
			const hasTextAnnotation = hasText(dataModelObjectPath.targetObject.Value.$target);
			if (dataType === "Edm.Stream" && !hasTextAnnotation && annotations?.Core?.MediaType?.includes("image/")) {
				width = 6.2;
			}
		} else if (
			annotations &&
			(isImageURL(dataModelObjectPath.targetObject?.Value?.$target) || annotations?.Core?.MediaType?.includes("image/"))
		) {
			width = 6.2;
		}
		return width;
	},

	/**
	 * Method to get the width of the column containing the DataField.
	 *
	 * @function
	 * @name getColumnWidthForDataField
	 * @param oThis The instance of the inner model of the Table building block
	 * @param column Defined width of the column, which is taken with priority if not null, undefined or empty
	 * @param dataField Data Field
	 * @param dataFieldActionText DataField's text from button
	 * @param dataModelObjectPath The data model object path
	 * @param oMicroChartTitle The object containing the title and description of the MicroChart
	 * @returns - Column width if defined, otherwise null ( the width is treated as a rem value)
	 */
	getColumnWidthForDataField: function (
		oThis: tableDelegateModel,
		column: AnnotationTableColumn,
		dataField: DataField | DataFieldForAnnotation | DataFieldForAction | DataFieldForIntentBasedNavigation,
		dataFieldActionText: string,
		dataModelObjectPath: DataModelObjectPath,
		oMicroChartTitle?: any
	): number | null {
		const annotations = dataModelObjectPath.targetObject?.annotations;
		const dataType = dataModelObjectPath.targetObject?.$Type;
		let width: number | null = null;
		if (
			dataType === UIAnnotationTypes.DataFieldForAction ||
			dataType === UIAnnotationTypes.DataFieldForIntentBasedNavigation ||
			(dataType === UIAnnotationTypes.DataFieldForAnnotation &&
				((dataField as DataFieldForAnnotation).Target as any).$AnnotationPath.indexOf(`@${UIAnnotationTerms.FieldGroup}`) === -1)
		) {
			let nTmpTextWidth;
			nTmpTextWidth =
				SizeHelper.getButtonWidth(dataFieldActionText) ||
				SizeHelper.getButtonWidth(dataField?.Label?.toString()) ||
				SizeHelper.getButtonWidth(annotations?.Label);

			// get width for rating or progress bar datafield
			const nTmpVisualizationWidth = TableSizeHelper.getWidthForDataFieldForAnnotation(
				dataModelObjectPath.targetObject
			).propertyWidth;

			if (nTmpVisualizationWidth > nTmpTextWidth) {
				width = nTmpVisualizationWidth;
			} else if (
				dataFieldActionText ||
				(annotations &&
					(annotations.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation ||
						annotations.$Type === UIAnnotationTypes.DataFieldForAction))
			) {
				// Add additional 1.8 rem to avoid showing ellipsis in some cases.
				nTmpTextWidth += 1.8;
				width = nTmpTextWidth;
			}
			width = width || this.getColumnWidthForChart(oThis, column, dataField, nTmpTextWidth, oMicroChartTitle);
		}
		return width;
	},

	/**
	 * Method to get the width of the column containing the Chart.
	 *
	 * @function
	 * @name getColumnWidthForChart
	 * @param oThis The instance of the inner model of the Table building block
	 * @param column Defined width of the column, which is taken with priority if not null, undefined or empty
	 * @param dataField Data Field
	 * @param columnLabelWidth The width of the column label or button label
	 * @param microChartTitle The object containing the title and the description of the MicroChart
	 * @returns - Column width if defined, otherwise null (the width is treated as a rem value)
	 */
	getColumnWidthForChart(oThis: any, column: any, dataField: any, columnLabelWidth: number, microChartTitle: any): number | null {
		let chartSize,
			width: number | null = null;
		if (dataField.Target?.$AnnotationPath?.indexOf(`@${UIAnnotationTerms.Chart}`) !== -1) {
			switch (this.getChartSize(oThis, column)) {
				case "XS":
					chartSize = 4.4;
					break;
				case "S":
					chartSize = 4.6;
					break;
				case "M":
					chartSize = 5.5;
					break;
				case "L":
					chartSize = 6.9;
					break;
				default:
					chartSize = 5.3;
			}
			columnLabelWidth += 1.8;
			if (
				!this.getShowOnlyChart(oThis, column) &&
				microChartTitle &&
				(microChartTitle.Title.length || microChartTitle.Description.length)
			) {
				const tmpText =
					microChartTitle.Title.length > microChartTitle.Description.length ? microChartTitle.Title : microChartTitle.Description;
				const titleSize = SizeHelper.getButtonWidth(tmpText) + 7;
				const tmpWidth = titleSize > columnLabelWidth ? titleSize : columnLabelWidth;
				width = tmpWidth;
			} else if (columnLabelWidth > chartSize) {
				width = columnLabelWidth;
			} else {
				width = chartSize;
			}
		}
		return width;
	},
	/**
	 * Method to add a margin class at the control.
	 *
	 * @function
	 * @name getMarginClass
	 * @param oCollection Title of the DataPoint
	 * @param oDataField Value of the DataPoint
	 * @param sVisualization
	 * @param sFieldGroupHiddenExpressions Hidden expression contained in FieldGroup
	 * @returns Adjusting the margin
	 */
	getMarginClass: function (oCollection: any, oDataField: any, sVisualization: any, sFieldGroupHiddenExpressions: any) {
		let sBindingExpression,
			sClass = "";
		if (JSON.stringify(oCollection[oCollection.length - 1]) == JSON.stringify(oDataField)) {
			//If rating indicator is last element in fieldgroup, then the 0.5rem margin added by sapMRI class of interactive rating indicator on top and bottom must be nullified.
			if (sVisualization == "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
				sClass = "sapUiNoMarginBottom sapUiNoMarginTop";
			}
		} else if (sVisualization === "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
			//If rating indicator is NOT the last element in fieldgroup, then to maintain the 0.5rem spacing between cogetMarginClassntrols (as per UX spec),
			//only the top margin added by sapMRI class of interactive rating indicator must be nullified.

			sClass = "sapUiNoMarginTop";
		} else {
			sClass = "sapUiTinyMarginBottom";
		}

		if (sFieldGroupHiddenExpressions && sFieldGroupHiddenExpressions !== "true" && sFieldGroupHiddenExpressions !== "false") {
			const sHiddenExpressionResult = sFieldGroupHiddenExpressions.substring(
				sFieldGroupHiddenExpressions.indexOf("{=") + 2,
				sFieldGroupHiddenExpressions.lastIndexOf("}")
			);
			sBindingExpression = "{= " + sHiddenExpressionResult + " ? '" + sClass + "' : " + "''" + " }";
			return sBindingExpression;
		} else {
			return sClass;
		}
	},

	/**
	 * Method to get VBox visibility.
	 *
	 * @param collection Collection of data fields in VBox
	 * @param fieldGroupHiddenExpressions Hidden expression contained in FieldGroup
	 * @param fieldGroup Data field containing the VBox
	 * @returns Visibility expression
	 */
	getVBoxVisibility: function (
		collection: Array<DataFieldForAnnotation & Hidden>,
		fieldGroupHiddenExpressions: CompiledBindingToolkitExpression,
		fieldGroup: FieldGroup & Hidden
	): CompiledBindingToolkitExpression {
		let allStatic = true;
		const hiddenPaths = [];

		if (fieldGroup[`@${UIAnnotationTerms.Hidden}`]) {
			return fieldGroupHiddenExpressions;
		}

		for (const dataField of collection) {
			const hiddenAnnotationValue = dataField[`@${UIAnnotationTerms.Hidden}`];
			if (hiddenAnnotationValue === undefined || hiddenAnnotationValue === false) {
				hiddenPaths.push(false);
				continue;
			}
			if (hiddenAnnotationValue === true) {
				hiddenPaths.push(true);
				continue;
			}
			if (hiddenAnnotationValue.$Path) {
				hiddenPaths.push(pathInModel(hiddenAnnotationValue.$Path));
				allStatic = false;
				continue;
			}
			if (typeof hiddenAnnotationValue === "object") {
				// Dynamic expression found in a field
				return fieldGroupHiddenExpressions;
			}
		}

		const hasAnyPathExpressions = constant(hiddenPaths.length > 0 && allStatic !== true);
		const hasAllHiddenStaticExpressions = constant(hiddenPaths.length > 0 && hiddenPaths.indexOf(false) === -1 && allStatic);

		return compileExpression(
			ifElse(
				hasAnyPathExpressions,
				formatResult(hiddenPaths, TableFormatter.getVBoxVisibility),
				ifElse(hasAllHiddenStaticExpressions, constant(false), constant(true))
			)
		);
	},

	/**
	 * Method to provide hidden filters to the table.
	 *
	 * @function
	 * @name formatHiddenFilters
	 * @param oHiddenFilter The hiddenFilters via context named filters (and key hiddenFilters) passed to Macro Table
	 * @returns The string representation of the hidden filters
	 */
	formatHiddenFilters: function (oHiddenFilter: TableFiltersConfiguration | undefined) {
		if (oHiddenFilter) {
			try {
				return JSON.stringify(oHiddenFilter);
			} catch (ex) {
				return undefined;
			}
		}
		return undefined;
	},

	/**
	 * Method to get the stable ID of a table element (column or FieldGroup label).
	 *
	 * @function
	 * @name getElementStableId
	 * @param tableId Current object ID
	 * @param elementId Element Id or suffix
	 * @param dataModelObjectPath DataModelObjectPath of the dataField
	 * @returns The stable ID for a given column
	 */
	getElementStableId: function (tableId: string | undefined, elementId: string, dataModelObjectPath: DataModelObjectPath) {
		if (!tableId) {
			return undefined;
		}
		const dataField = dataModelObjectPath.targetObject as DataFieldAbstractTypes;
		let dataFieldPart: string | DataFieldAbstractTypes;
		switch (dataField.$Type) {
			case UIAnnotationTypes.DataFieldForAnnotation:
				dataFieldPart = dataField.Target.value;
				break;
			case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
			case UIAnnotationTypes.DataFieldForAction:
				dataFieldPart = dataField;
				break;
			default:
				dataFieldPart = (dataField as DataField).Value?.path ?? "";
				break;
		}
		return generate([tableId, elementId, dataFieldPart]);
	},

	/**
	 * Method to get the stable ID of the column.
	 *
	 * @function
	 * @name getColumnStableId
	 * @param id Current object ID
	 * @param dataModelObjectPath DataModelObjectPath of the dataField
	 * @returns The stable ID for a given column
	 */
	getColumnStableId: function (id: string, dataModelObjectPath: DataModelObjectPath) {
		return TableHelper.getElementStableId(id, "C", dataModelObjectPath);
	},

	getFieldGroupLabelStableId: function (id: string, dataModelObjectPath: DataModelObjectPath) {
		return TableHelper.getElementStableId(id, "FGLabel", dataModelObjectPath);
	},

	/**
	 * Method filters out properties which do not belong to the collection.
	 *
	 * @param properties The array of properties to be checked.
	 * @param collectionContext The collection context to be used.
	 * @returns The array of applicable properties.
	 * @private
	 */
	_filterNonApplicableProperties: function (properties: string[], collectionContext: Context) {
		return (
			properties &&
			properties.filter(function (sPropertyPath: any) {
				return collectionContext.getObject(`./${sPropertyPath}`);
			})
		);
	},

	/**
	 * Method to retreive the listed properties from the custom columns
	 *
	 * @param columns The table columns
	 * @returns The list of available properties from the custom columns
	 * @private
	 */

	getPropertiesFromCustomColumns: function (columns: TableColumn[]) {
		// Add properties from the custom columns, this is required for the export of all the properties listed on a custom column
		if (!columns?.length) {
			return;
		}
		const propertiesFromCustomColumns: string[] = [];
		for (const column of columns) {
			if ("properties" in column && column.properties?.length) {
				for (const property of column.properties) {
					if (propertiesFromCustomColumns.indexOf(property) === -1) {
						// only add property if it doesn't exist
						propertiesFromCustomColumns.push(property);
					}
				}
			}
		}
		return propertiesFromCustomColumns;
	},
	/**
	 * Method to generate the binding information for a table row.
	 *
	 * @param table The instance of the inner model of the table building block
	 * @returns - Returns the binding information of a table row
	 */
	getRowsBindingInfo: function (table: TableBlock) {
		const dataModelPath = getInvolvedDataModelObjects(table.collection, table.contextPath);
		const path = getContextRelativeTargetObjectPath(dataModelPath) || getTargetObjectPath(dataModelPath);
		const oRowBinding = {
			ui5object: true,
			suspended: false,
			path: CommonHelper.addSingleQuotes(path),
			parameters: {
				$count: true
			} as any,
			events: {} as any
		};

		if (table.tableDefinition.enable$select) {
			// Don't add $select parameter in case of an analytical query, this isn't supported by the model
			const sSelect = TableHelper.create$Select(table);
			if (sSelect) {
				oRowBinding.parameters.$select = `'${sSelect}'`;
			}
		}

		if (table.tableDefinition.enable$$getKeepAliveContext) {
			// we later ensure in the delegate only one list binding for a given targetCollectionPath has the flag $$getKeepAliveContext
			oRowBinding.parameters.$$getKeepAliveContext = true;
		}

		oRowBinding.parameters.$$groupId = CommonHelper.addSingleQuotes("$auto.Workers");
		oRowBinding.parameters.$$updateGroupId = CommonHelper.addSingleQuotes("$auto");
		oRowBinding.parameters.$$ownRequest = true;
		oRowBinding.parameters.$$patchWithoutSideEffects = true;

		oRowBinding.events.patchSent = CommonHelper.addSingleQuotes(".editFlow.handlePatchSent");
		oRowBinding.events.dataReceived = CommonHelper.addSingleQuotes("API.onInternalDataReceived");
		oRowBinding.events.dataRequested = CommonHelper.addSingleQuotes("API.onInternalDataRequested");
		// recreate an empty row when one is activated
		oRowBinding.events.createActivate = CommonHelper.addSingleQuotes(".editFlow.handleCreateActivate");

		if (table.onContextChange) {
			oRowBinding.events.change = CommonHelper.addSingleQuotes(table.onContextChange);
		}
		return CommonHelper.objectToString(oRowBinding);
	},
	/**
	 * Method to check the validity of the fields in the creation row.
	 *
	 * @function
	 * @name validateCreationRowFields
	 * @param oFieldValidityObject Current Object holding the fields
	 * @returns `true` if all the fields in the creation row are valid, `false` otherwise
	 */
	validateCreationRowFields: function (oFieldValidityObject: any) {
		if (!oFieldValidityObject) {
			return false;
		}
		return (
			Object.keys(oFieldValidityObject).length > 0 &&
			Object.keys(oFieldValidityObject).every(function (key: string) {
				return oFieldValidityObject[key]["validity"];
			})
		);
	},
	/**
	 * Method to get the expression for the 'press' event for the DataFieldForActionButton.
	 *
	 * @function
	 * @name pressEventDataFieldForActionButton
	 * @param table Current object
	 * @param dataField Value of the DataPoint
	 * @param entitySetName Name of the EntitySet
	 * @param operationAvailableMap OperationAvailableMap as stringified JSON object
	 * @param actionContext Action object
	 * @param isNavigable Action either triggers navigation or not
	 * @param enableAutoScroll Action either triggers scrolling to the newly created items in the related table or not
	 * @param defaultValuesExtensionFunction Function name to prefill dialog parameters
	 * @returns The binding expression
	 */
	pressEventDataFieldForActionButton: function (
		table: TableBlock,
		dataField: DataFieldForAction | undefined,
		entitySetName: string,
		operationAvailableMap: string,
		actionContext: Context | undefined,
		isNavigable = false,
		enableAutoScroll: boolean | undefined,
		defaultValuesExtensionFunction?: string
	) {
		if (!dataField) return undefined;
		const sActionName = dataField.Action,
			targetEntityTypeName = table.contextObjectPath.targetEntityType.fullyQualifiedName,
			staticAction =
				this._isStaticAction(actionContext, sActionName) ||
				this._isActionOverloadOnDifferentType(sActionName, targetEntityTypeName),
			params: any = {
				contexts: !staticAction ? pathInModel("selectedContexts", "internal") : null,
				bStaticAction: staticAction ? staticAction : undefined,
				entitySetName: entitySetName,
				applicableContexts: !staticAction ? pathInModel(`dynamicActions/${dataField.Action}/aApplicable/`, "internal") : null,
				notApplicableContexts: !staticAction ? pathInModel(`dynamicActions/${dataField.Action}/aNotApplicable/`, "internal") : null,
				isNavigable: isNavigable,
				enableAutoScroll: enableAutoScroll,
				defaultValuesExtensionFunction: defaultValuesExtensionFunction
			};
		params.invocationGrouping =
			(dataField.InvocationGrouping && (dataField.InvocationGrouping as any).$EnumMember) ===
			"com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet"
				? "ChangeSet"
				: "Isolated";

		params.controlId = table.id;
		params.operationAvailableMap = operationAvailableMap;
		params.label = dataField.Label;
		return compileExpression(fn("API.onActionPress", [ref("$event"), ref("$controller"), dataField.Action, params]));
		//return ActionHelper.getPressEventDataFieldForActionButton(table.id!, dataField, params, operationAvailableMap);
	},
	/**
	 * Method to determine the binding expression for 'enabled' property of DataFieldForAction actions.
	 *
	 * @function
	 * @name isDataFieldForActionEnabled
	 * @param table The instance of the table control
	 * @param dataField The value of the data field
	 * @param requiresContext RequiresContext for IBN
	 * @param actionContext The instance of the action
	 * @param enableOnSelect Define the enabling of the action (single or multiselect)
	 * @returns A binding expression to define the 'enabled' property of the action
	 */
	isDataFieldForActionEnabled: function (
		table: TableBlock,
		dataField: any,
		requiresContext: boolean,
		actionContext: Context | undefined,
		enableOnSelect?: string
	) {
		const actionName = dataField.Action,
			annotationTargetEntityType = table?.collection.getObject("$Type"),
			isStaticAction = this._isStaticAction(actionContext, actionName);

		// Check for action overload on a different Entity type.
		// If yes, table row selection is not required to enable this action.
		if (this._isActionOverloadOnDifferentType(actionName, annotationTargetEntityType)) {
			// Action overload defined on different entity type
			const oOperationAvailableMap = table.tableDefinition && JSON.parse(table.tableDefinition.operationAvailableMap);
			if (oOperationAvailableMap?.hasOwnProperty(actionName)) {
				// Core.OperationAvailable annotation defined for the action.
				// Need to refer to internal model for enabled property of the dynamic action.
				// return compileBinding(bindingExpression("dynamicActions/" + sActionName + "/bEnabled", "internal"), true);
				return `{= \${internal>dynamicActions/${actionName}/bEnabled} }`;
			}
			// Consider the action just like any other static DataFieldForAction.
			return true;
		}
		if (!requiresContext || isStaticAction) {
			return true;
		}

		let dataFieldForActionEnabledExpression = "";

		const numberOfSelectedContexts = ActionHelper.getNumberOfContextsExpression(enableOnSelect ?? "multiselect");
		const action = `\${internal>dynamicActions/${dataField.Action}/bEnabled}`;
		dataFieldForActionEnabledExpression = numberOfSelectedContexts + " && " + action;

		return "{= " + dataFieldForActionEnabledExpression + "}";
	},
	/**
	 * Method to determine the binding expression for 'enabled' property of DataFieldForIBN actions.
	 *
	 * @function
	 * @name isDataFieldForIBNEnabled
	 * @param table The instance of the table control
	 * @param dataField The value of the data field
	 * @param requiresContext RequiresContext for IBN
	 * @param isNavigationAvailable Define if the navigation is available
	 * @returns A binding expression to define the 'enabled' property of the action
	 */
	isDataFieldForIBNEnabled: function (table: TableBlock, dataField: any, requiresContext: boolean, isNavigationAvailable?: string) {
		const isAnalyticalTable = table?.tableDefinition?.enableAnalytics;

		if (!requiresContext) {
			const entitySet = table.collection.getPath();
			const metaModel = table.collection.getModel();
			if (isNavigationAvailable === "false" && !isAnalyticalTable) {
				Log.warning("NavigationAvailable as false is incorrect usage");
				return false;
			} else if (
				isNavigationAvailable &&
				!isAnalyticalTable &&
				dataField?.NavigationAvailable?.$Path &&
				metaModel.getObject(entitySet + "/$Partner") === dataField.NavigationAvailable.$Path.split("/")[0]
			) {
				return `{= \${${isNavigationAvailable.substring(isNavigationAvailable.indexOf("/") + 1, isNavigationAvailable.length)}}`;
			}
			return true;
		}

		let dataFieldForIBNEnabledExpression = "",
			numberOfSelectedContexts,
			action;

		if (isNavigationAvailable === "true" || isAnalyticalTable) {
			dataFieldForIBNEnabledExpression = "%{internal>numberOfSelectedContexts} >= 1";
		} else if (isNavigationAvailable === "false") {
			Log.warning("NavigationAvailable as false is incorrect usage");
			return false;
		} else {
			numberOfSelectedContexts = "%{internal>numberOfSelectedContexts} >= 1";
			action = `\${internal>ibn/${dataField.SemanticObject}-${dataField.Action}/bEnabled}`;
			dataFieldForIBNEnabledExpression = numberOfSelectedContexts + " && " + action;
		}

		return `{= ${dataFieldForIBNEnabledExpression}}`;
	},
	/**
	 * Method to get press event expression for CreateButton.
	 *
	 * @function
	 * @name pressEventForCreateButton
	 * @param oThis Current Object
	 * @param bCmdExecutionFlag Flag to indicate that the function is called from CMD Execution
	 * @returns The binding expression for the press event of the create button
	 */
	pressEventForCreateButton: function (oThis: any, bCmdExecutionFlag: boolean) {
		const sCreationMode = oThis.creationMode;
		let oParams: any;
		const sMdcTable = bCmdExecutionFlag ? "${$source>}.getParent()" : "${$source>}.getParent().getParent().getParent()";
		let sRowBinding = sMdcTable + ".getRowBinding() || " + sMdcTable + ".data('rowsBindingInfo').path";

		switch (sCreationMode) {
			case CreationMode.External:
				// navigate to external target for creating new entries
				// TODO: Add required parameters
				oParams = {
					creationMode: CommonHelper.addSingleQuotes(CreationMode.External),
					outbound: CommonHelper.addSingleQuotes(oThis.createOutbound)
				};
				break;

			case CreationMode.CreationRow:
				oParams = {
					creationMode: CommonHelper.addSingleQuotes(CreationMode.CreationRow),
					creationRow: "${$source>}",
					createAtEnd: oThis.createAtEnd !== undefined ? oThis.createAtEnd : false
				};

				sRowBinding = "${$source>}.getParent().getRowBinding()";
				break;

			case CreationMode.NewPage:
			case CreationMode.Inline:
				oParams = {
					creationMode: CommonHelper.addSingleQuotes(sCreationMode),
					createAtEnd: oThis.createAtEnd !== undefined ? oThis.createAtEnd : false,
					tableId: CommonHelper.addSingleQuotes(oThis.id)
				};

				if (oThis.createNewAction) {
					oParams.newAction = CommonHelper.addSingleQuotes(oThis.createNewAction);
				}
				break;

			case CreationMode.InlineCreationRows:
				return CommonHelper.generateFunction(".editFlow.createEmptyRowsAndFocus", sMdcTable);
			default:
				// unsupported
				return undefined;
		}
		return CommonHelper.generateFunction(".editFlow.createDocument", sRowBinding, CommonHelper.objectToString(oParams));
	},

	getIBNData: function (oThis: any) {
		const outboundDetail = oThis.createOutboundDetail;
		if (outboundDetail) {
			const oIBNData = {
				semanticObject: CommonHelper.addSingleQuotes(outboundDetail.semanticObject),
				action: CommonHelper.addSingleQuotes(outboundDetail.action)
			};
			return CommonHelper.objectToString(oIBNData);
		}
	},

	_getExpressionForDeleteButton: function (value: any, fullContextPath: DataModelObjectPath): string | CompiledBindingToolkitExpression {
		if (typeof value === "string") {
			return CommonHelper.addSingleQuotes(value, true);
		} else {
			const expression = getExpressionFromAnnotation(value);
			if (isConstant(expression) || isPathInModelExpression(expression)) {
				const valueExpression = formatValueRecursively(expression, fullContextPath);
				return compileExpression(valueExpression);
			}
		}
	},

	/**
	 * Method to get press event expression for 'Delete' button.
	 *
	 * @function
	 * @name pressEventForDeleteButton
	 * @param oThis Current Object
	 * @param sEntitySetName EntitySet name
	 * @param oHeaderInfo Header Info
	 * @param fullcontextPath Context Path
	 * @returns The binding expression for the press event of the 'Delete' button
	 */
	pressEventForDeleteButton: function (oThis: any, sEntitySetName: string, oHeaderInfo: any, fullcontextPath: any) {
		const sDeletableContexts = "${internal>deletableContexts}";
		let sTitleExpression, sDescriptionExpression;

		if (oHeaderInfo?.Title) {
			sTitleExpression = this._getExpressionForDeleteButton(oHeaderInfo.Title.Value, fullcontextPath);
		}
		if (oHeaderInfo?.Description) {
			sDescriptionExpression = this._getExpressionForDeleteButton(oHeaderInfo.Description.Value, fullcontextPath);
		}

		const oParams = {
			id: CommonHelper.addSingleQuotes(oThis.id),
			entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
			numberOfSelectedContexts: "${internal>selectedContexts}.length",
			unSavedContexts: "${internal>unSavedContexts}",
			lockedContexts: "${internal>lockedContexts}",
			createModeContexts: "${internal>createModeContexts}",
			draftsWithDeletableActive: "${internal>draftsWithDeletableActive}",
			draftsWithNonDeletableActive: "${internal>draftsWithNonDeletableActive}",
			controlId: "${internal>controlId}",
			title: sTitleExpression,
			description: sDescriptionExpression,
			selectedContexts: "${internal>selectedContexts}"
		};

		return CommonHelper.generateFunction(".editFlow.deleteMultipleDocuments", sDeletableContexts, CommonHelper.objectToString(oParams));
	},

	/**
	 * Method to set the visibility of the label for the column header.
	 *
	 * @function
	 * @name setHeaderLabelVisibility
	 * @param datafield DataField
	 * @param dataFieldCollection List of items inside a fieldgroup (if any)
	 * @returns `true` if the header label needs to be visible else false.
	 */
	setHeaderLabelVisibility: function (datafield: any, dataFieldCollection: any[]) {
		// If Inline button/navigation action, return false, else true;
		if (!dataFieldCollection) {
			if (datafield.$Type.indexOf("DataFieldForAction") > -1 && datafield.Inline) {
				return false;
			}
			if (datafield.$Type.indexOf("DataFieldForIntentBasedNavigation") > -1 && datafield.Inline) {
				return false;
			}
			return true;
		}

		// In Fieldgroup, If NOT all datafield/datafieldForAnnotation exists with hidden, return true;
		return dataFieldCollection.some(function (oDC: any) {
			if (
				(oDC.$Type === UIAnnotationTypes.DataField || oDC.$Type === UIAnnotationTypes.DataFieldForAnnotation) &&
				oDC[`@${UIAnnotationTerms.Hidden}`] !== true
			) {
				return true;
			}
		});
	},

	/**
	 * Method to get the text from the DataFieldForAnnotation into the column.
	 *
	 * @function
	 * @name getTextOnActionField
	 * @param oDataField DataPoint's Value
	 * @param oContext Context object of the LineItem
	 * @returns String from label referring to action text
	 */
	getTextOnActionField: function (oDataField: any, oContext: any): string | undefined {
		if (
			oDataField.$Type === UIAnnotationTypes.DataFieldForAction ||
			oDataField.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation
		) {
			return oDataField.Label;
		}
		// for FieldGroup containing DataFieldForAnnotation
		if (
			oDataField.$Type === UIAnnotationTypes.DataFieldForAnnotation &&
			oContext.context.getObject("Target/$AnnotationPath").indexOf("@" + UIAnnotationTerms.FieldGroup) > -1
		) {
			const sPathDataFields = "Target/$AnnotationPath/Data/";
			const aMultipleLabels = [];
			for (const i in oContext.context.getObject(sPathDataFields)) {
				if (
					oContext.context.getObject(`${sPathDataFields + i}/$Type`) === UIAnnotationTypes.DataFieldForAction ||
					oContext.context.getObject(`${sPathDataFields + i}/$Type`) === UIAnnotationTypes.DataFieldForIntentBasedNavigation
				) {
					aMultipleLabels.push(oContext.context.getObject(`${sPathDataFields + i}/Label`));
				}
			}
			// In case there are multiple actions inside a Field Group select the largest Action Label
			if (aMultipleLabels.length > 1) {
				return aMultipleLabels.reduce(function (a: any, b: any) {
					return a.length > b.length ? a : b;
				});
			} else {
				return aMultipleLabels.length === 0 ? undefined : aMultipleLabels.toString();
			}
		}
		return undefined;
	},
	_getResponsiveTableColumnSettings: function (oThis: any, oColumn: any) {
		if (oThis.tableType === "ResponsiveTable") {
			return oColumn.settings;
		}
		return null;
	},

	getChartSize: function (oThis: any, oColumn: any) {
		const settings = this._getResponsiveTableColumnSettings(oThis, oColumn);
		if (settings && settings.microChartSize) {
			return settings.microChartSize;
		}
		return "XS";
	},
	getShowOnlyChart: function (oThis: any, oColumn: any) {
		const settings = this._getResponsiveTableColumnSettings(oThis, oColumn);
		if (settings && settings.showMicroChartLabel) {
			return !settings.showMicroChartLabel;
		}
		return true;
	},
	getDelegate: function (table: TableVisualization, isALP: string, entityName: string) {
		let oDelegate;
		if (isALP === "true") {
			// We don't support TreeTable in ALP
			if (table.control.type === "TreeTable") {
				throw new Error("TreeTable not supported in Analytical ListPage");
			}
			oDelegate = {
				name: "sap/fe/macros/table/delegates/ALPTableDelegate",
				payload: {
					collectionName: entityName
				}
			};
		} else if (table.control.type === "TreeTable") {
			oDelegate = {
				name: "sap/fe/macros/table/delegates/TreeTableDelegate",
				payload: {
					hierarchyQualifier: table.control.hierarchyQualifier,
					initialExpansionLevel: table.annotation.initialExpansionLevel
				}
			};
		} else {
			oDelegate = {
				name: "sap/fe/macros/table/delegates/TableDelegate"
			};
		}

		return JSON.stringify(oDelegate);
	},
	setIBNEnablement: function (oInternalModelContext: any, oNavigationAvailableMap: any, aSelectedContexts: any) {
		for (const sKey in oNavigationAvailableMap) {
			oInternalModelContext.setProperty(`ibn/${sKey}`, {
				bEnabled: false,
				aApplicable: [],
				aNotApplicable: []
			});
			const aApplicable = [],
				aNotApplicable = [];
			const sProperty = oNavigationAvailableMap[sKey];
			for (let i = 0; i < aSelectedContexts.length; i++) {
				const oSelectedContext = aSelectedContexts[i];
				if (oSelectedContext.getObject(sProperty)) {
					oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/bEnabled`, true);
					aApplicable.push(oSelectedContext);
				} else {
					aNotApplicable.push(oSelectedContext);
				}
			}
			oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/aApplicable`, aApplicable);
			oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/aNotApplicable`, aNotApplicable);
		}
	},

	/**
	 * @param oFastCreationRow
	 * @param sPath
	 * @param oContext
	 * @param oModel
	 * @param oFinalUIState
	 */
	enableFastCreationRow: async function (
		oFastCreationRow: any,
		sPath: string,
		oContext: v4Context,
		oModel: ODataModel,
		oFinalUIState: Promise<any>
	) {
		let oFastCreationListBinding, oFastCreationContext;

		if (oFastCreationRow) {
			try {
				await oFinalUIState;
				// If a draft is discarded while a message strip filter is active on the table there is a table rebind caused by the DataStateIndicator
				// To prevent a new creation row binding being created at that moment we check if the context is already deleted
				if (oFastCreationRow.getModel("ui").getProperty("/isEditable") && !oContext.isDeleted()) {
					oFastCreationListBinding = oModel.bindList(sPath, oContext, [], [], {
						$$updateGroupId: "doNotSubmit",
						$$groupId: "doNotSubmit"
					});
					// Workaround suggested by OData model v4 colleagues
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					oFastCreationListBinding.refreshInternal = function () {
						/* do nothing */
					};
					oFastCreationContext = oFastCreationListBinding.create();
					oFastCreationRow.setBindingContext(oFastCreationContext);

					// this is needed to avoid console error
					try {
						await oFastCreationContext.created();
					} catch (e) {
						Log.trace("transient fast creation context deleted");
					}
				}
			} catch (oError: any) {
				Log.error("Error while computing the final UI state", oError);
			}
		}
	}
};
(TableHelper.getNavigationAvailableMap as any).requiresIContext = true;
(TableHelper.getTextOnActionField as any).requiresIContext = true;

export default TableHelper;
