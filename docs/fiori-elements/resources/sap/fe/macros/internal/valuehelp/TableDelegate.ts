import { Property } from "@sap-ux/vocabularies-types";
import Log from "sap/base/Log";
import deepEqual from "sap/base/util/deepEqual";
import CommonUtils from "sap/fe/core/CommonUtils";
import { fetchTypeConfig } from "sap/fe/core/converters/controls/ListReport/FilterBar";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import {
	getFilterRestrictionsInfo,
	getSortRestrictionsInfo,
	isMultiValueFilterExpression,
	SortRestrictionsInfoType
} from "sap/fe/core/helpers/MetaModelFunction";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { isProperty } from "sap/fe/core/helpers/TypeGuards";
import { DataModelObjectPath, enhanceDataModelPath, getTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { getDisplayMode } from "sap/fe/core/templating/DisplayModeFormatter";
import {
	getAssociatedCurrencyPropertyPath,
	getAssociatedTextPropertyPath,
	getAssociatedTimezonePropertyPath,
	getAssociatedUnitPropertyPath,
	getLabel
} from "sap/fe/core/templating/PropertyHelper";
import { DefaultTypeForEdmType, isTypeFilterable } from "sap/fe/core/type/EDM";
import TypeUtil from "sap/fe/core/type/TypeUtil";
import MacrosDelegateUtil from "sap/fe/macros/DelegateUtil";
import type Event from "sap/ui/base/Event";
import type ManagedObject from "sap/ui/base/ManagedObject";
import Core from "sap/ui/core/Core";
import TableDelegate from "sap/ui/mdc/odata/v4/TableDelegate";
import DelegateUtil from "sap/ui/mdc/odata/v4/util/DelegateUtil";
import type Table from "sap/ui/mdc/Table";
import FilterUtil from "sap/ui/mdc/util/FilterUtil";
import MDCTable from "sap/ui/mdc/valuehelp/content/MDCTable";
import Context from "sap/ui/model/Context";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Sorter from "sap/ui/model/Sorter";

export type ValueHelpTableColumn = {
	name: string;
	propertyInfos?: string[];
	sortable?: boolean;
	path?: string;
	label?: string;
	filterable?: boolean;
	typeConfig?: Object;
	maxConditions?: number;
};
type ComplexPropertyMap = Record<string, Property>;

/**
 * Test delegate for OData V4.
 */
const ODataTableDelegate = Object.assign({}, TableDelegate);

ODataTableDelegate.fetchProperties = function (table: Table) {
	const model = this._getModel(table);
	let createPropertyInfos;
	if (!model) {
		createPropertyInfos = new Promise((resolve) => {
			table.attachModelContextChange(
				{
					resolver: resolve
				},
				onModelContextChange as any,
				this
			);
		}).then((oSubModel) => {
			return this._createPropertyInfos(table, oSubModel);
		});
	} else {
		createPropertyInfos = this._createPropertyInfos(table, model);
	}

	return createPropertyInfos.then(function (properties: any) {
		MacrosDelegateUtil.setCachedProperties(table, properties);
		(table.getBindingContext("internal") as Context).setProperty("tablePropertiesAvailable", true);
		return properties;
	});
};

ODataTableDelegate.createInternalBindingContext = function (table: Table) {
	let dialog: ManagedObject | null = table;
	while (dialog && !dialog.isA("sap.ui.mdc.valuehelp.Dialog")) {
		dialog = (dialog as ManagedObject).getParent();
	}

	const internalModel = table.getModel("internal");

	if (dialog && internalModel) {
		const newInternalBindingContextPath = dialog.getBindingContext("internal")!.getPath() + `::VHDialog::${dialog.getId()}::table`;
		const newInternalBindingContext = internalModel.bindContext(newInternalBindingContextPath).getBoundContext();
		table.setBindingContext(newInternalBindingContext!, "internal");
	}
};

function onModelContextChange(this: typeof ODataTableDelegate, event: Event, data: any) {
	const table = event.getSource() as Table;
	ODataTableDelegate.createInternalBindingContext(table);
	const model = this._getModel(table);

	if (model) {
		table.detachModelContextChange(onModelContextChange as any);
		data.resolver(model);
	}
}
/**
 * Collect related properties from a property's annotations.
 *
 * @param dataModelPropertyPath The model object path of the property.
 * @returns The related properties that were identified.
 * @private
 */
function collectRelatedProperties(dataModelPropertyPath: DataModelObjectPath) {
	const dataModelAdditionalPropertyPath = getAdditionalProperty(dataModelPropertyPath);
	const relatedProperties: ComplexPropertyMap = {};
	if (dataModelAdditionalPropertyPath?.targetObject) {
		const additionalProperty = dataModelAdditionalPropertyPath.targetObject;
		const additionalPropertyPath = getTargetObjectPath(dataModelAdditionalPropertyPath, true);

		const property = dataModelPropertyPath.targetObject as Property;
		const propertyPath = getTargetObjectPath(dataModelPropertyPath, true);

		const textAnnotation = property.annotations?.Common?.Text,
			textArrangement = textAnnotation?.annotations?.UI?.TextArrangement?.toString(),
			displayMode = textAnnotation && textArrangement && getDisplayMode(property);

		if (displayMode === "Description") {
			relatedProperties[additionalPropertyPath] = additionalProperty;
		} else if ((displayMode && displayMode !== "Value") || !textAnnotation) {
			relatedProperties[propertyPath] = property;
			relatedProperties[additionalPropertyPath] = additionalProperty;
		}
	}
	return relatedProperties;
}

ODataTableDelegate._createPropertyInfos = function (table: any, model: any) {
	const metadataInfo = table.getDelegate().payload;
	const properties: ValueHelpTableColumn[] = [];
	const entitySetPath = `/${metadataInfo.collectionName}`;
	const metaModel = model.getMetaModel();

	return metaModel.requestObject(`${entitySetPath}@`).then(function (entitySetAnnotations: any) {
		const sortRestrictionsInfo = getSortRestrictionsInfo(entitySetAnnotations);
		const filterRestrictions = entitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
		const filterRestrictionsInfo = getFilterRestrictionsInfo(filterRestrictions);

		const customDataForColumns = MacrosDelegateUtil.getCustomData(table, "columns");
		const propertiesToBeCreated: Record<string, Property> = {};
		const dataModelEntityPath = getInvolvedDataModelObjects(table.getModel().getMetaModel().getContext(entitySetPath));
		customDataForColumns.customData.forEach(function (columnDef: any) {
			const propertyInfo: ValueHelpTableColumn = {
				name: columnDef.path,
				label: columnDef.label,
				sortable: isSortableProperty(sortRestrictionsInfo, columnDef),
				filterable: isFilterableProperty(filterRestrictions, columnDef),
				maxConditions: getPropertyMaxConditions(filterRestrictionsInfo, columnDef),
				typeConfig: isTypeFilterable(columnDef.$Type) ? table.getTypeUtil().getTypeConfig(columnDef.$Type) : undefined
			};

			const dataModelPropertyPath = enhanceDataModelPath(dataModelEntityPath, columnDef.path);
			const property = dataModelPropertyPath.targetObject as Property;
			if (property) {
				const targetPropertyPath = getTargetObjectPath(dataModelPropertyPath, true);
				let typeConfig;
				if (isTypeFilterable(property.type as keyof typeof DefaultTypeForEdmType)) {
					const propertyTypeConfig = fetchTypeConfig(property);
					typeConfig =
						TypeUtil.getTypeConfig(propertyTypeConfig.type, propertyTypeConfig.formatOptions, propertyTypeConfig.constraints) ??
						table.getTypeUtil().getTypeConfig(columnDef.$Type);
				}
				//Check if there is an additional property linked to the property as a Unit, Currency, Timezone or textArrangement
				const relatedPropertiesInfo = collectRelatedProperties(dataModelPropertyPath);
				const relatedPropertyPaths: string[] = Object.keys(relatedPropertiesInfo);

				if (relatedPropertyPaths.length) {
					propertyInfo.propertyInfos = relatedPropertyPaths;
					//Complex properties must be hidden for sorting and filtering
					propertyInfo.sortable = false;
					propertyInfo.filterable = false;
					// Collect information of related columns to be created.
					relatedPropertyPaths.forEach((path) => {
						propertiesToBeCreated[path] = relatedPropertiesInfo[path];
					});
					// Also add property for the inOut Parameters on the ValueHelp when textArrangement is set to #TextOnly
					// It will not be linked to the complex Property (BCP 2270141154)
					if (!relatedPropertyPaths.find((path) => relatedPropertiesInfo[path] === property)) {
						propertiesToBeCreated[targetPropertyPath] = property;
					}
				} else {
					propertyInfo.path = columnDef.path;
				}
				propertyInfo.typeConfig = propertyInfo.typeConfig ? typeConfig : undefined;
			} else {
				propertyInfo.path = columnDef.path;
			}
			properties.push(propertyInfo);
		});
		const relatedColumns = createRelatedProperties(propertiesToBeCreated, properties, sortRestrictionsInfo, filterRestrictionsInfo);
		return properties.concat(relatedColumns);
	});
};

/**
 * Updates the binding info with the relevant path and model from the metadata.
 *
 * @param oMDCTable The MDCTable instance
 * @param oBindingInfo The bindingInfo of the table
 */
ODataTableDelegate.updateBindingInfo = function (oMDCTable: any, oBindingInfo: any) {
	TableDelegate.updateBindingInfo.apply(this, [oMDCTable, oBindingInfo]);
	if (!oMDCTable) {
		return;
	}

	const oMetadataInfo = oMDCTable.getDelegate().payload;

	if (oMetadataInfo && oBindingInfo) {
		oBindingInfo.path = oBindingInfo.path || oMetadataInfo.collectionPath || `/${oMetadataInfo.collectionName}`;
		oBindingInfo.model = oBindingInfo.model || oMetadataInfo.model;
	}

	if (!oBindingInfo) {
		oBindingInfo = {};
	}

	const oFilter = Core.byId(oMDCTable.getFilter()) as any,
		bFilterEnabled = oMDCTable.isFilteringEnabled();
	let mConditions: any;
	let oInnerFilterInfo, oOuterFilterInfo: any;
	const aFilters = [];
	const tableProperties = MacrosDelegateUtil.getCachedProperties(oMDCTable);

	//TODO: consider a mechanism ('FilterMergeUtil' or enhance 'FilterUtil') to allow the connection between different filters)
	if (bFilterEnabled) {
		mConditions = oMDCTable.getConditions();
		oInnerFilterInfo = FilterUtil.getFilterInfo(oMDCTable, mConditions, tableProperties!, []) as any;
		if (oInnerFilterInfo.filters) {
			aFilters.push(oInnerFilterInfo.filters);
		}
	}

	if (oFilter) {
		mConditions = oFilter.getConditions();
		if (mConditions) {
			const aParameterNames = DelegateUtil.getParameterNames(oFilter);
			// The table properties needs to updated with the filter field if no Selectionfierlds are annotated and not part as value help parameter
			ODataTableDelegate._updatePropertyInfo(tableProperties, oMDCTable, mConditions, oMetadataInfo);
			oOuterFilterInfo = FilterUtil.getFilterInfo(oFilter, mConditions, tableProperties!, aParameterNames);

			if (oOuterFilterInfo.filters) {
				aFilters.push(oOuterFilterInfo.filters);
			}

			const sParameterPath = DelegateUtil.getParametersInfo(oFilter, mConditions);
			if (sParameterPath) {
				oBindingInfo.path = sParameterPath;
			}
		}

		// get the basic search
		oBindingInfo.parameters.$search = CommonUtils.normalizeSearchTerm(oFilter.getSearch()) || undefined;
	}

	this._applyDefaultSorting(oBindingInfo, oMDCTable.getDelegate().payload);
	// add select to oBindingInfo (BCP 2170163012)
	oBindingInfo.parameters.$select = tableProperties?.reduce(function (sQuery: string, oProperty: any) {
		// Navigation properties (represented by X/Y) should not be added to $select.
		// ToDo : They should be added as $expand=X($select=Y) instead
		if (oProperty.path && oProperty.path.indexOf("/") === -1) {
			sQuery = sQuery ? `${sQuery},${oProperty.path}` : oProperty.path;
		}
		return sQuery;
	}, "");

	// Add $count
	oBindingInfo.parameters.$count = true;

	//If the entity is DraftEnabled add a DraftFilter
	if (ModelHelper.isDraftSupported(oMDCTable.getModel().getMetaModel(), oBindingInfo.path)) {
		aFilters.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));
	}

	oBindingInfo.filters = new Filter(aFilters, true);
};

ODataTableDelegate.getTypeUtil = function (/*oPayload*/) {
	return TypeUtil;
};

ODataTableDelegate._getModel = function (oTable: Table) {
	const oMetadataInfo = (oTable.getDelegate() as any).payload;
	return oTable.getModel(oMetadataInfo.model);
};

/**
 * Applies a default sort order if needed. This is only the case if the request is not a $search request
 * (means the parameter $search of the bindingInfo is undefined) and if not already a sort order is set,
 * e.g. via presentation variant or manual by the user.
 *
 * @param oBindingInfo The bindingInfo of the table
 * @param oPayload The payload of the TableDelegate
 */
ODataTableDelegate._applyDefaultSorting = function (oBindingInfo: any, oPayload: any) {
	if (oBindingInfo.parameters && oBindingInfo.parameters.$search == undefined && oBindingInfo.sorter && oBindingInfo.sorter.length == 0) {
		const defaultSortPropertyName = oPayload ? oPayload.defaultSortPropertyName : undefined;
		if (defaultSortPropertyName) {
			oBindingInfo.sorter.push(new Sorter(defaultSortPropertyName, false));
		}
	}
};

/**
 * Updates the table properties with filter field infos.
 *
 * @param aTableProperties Array with table properties
 * @param oMDCTable The MDCTable instance
 * @param mConditions The conditions of the table
 * @param oMetadataInfo The metadata info of the filter field
 */
ODataTableDelegate._updatePropertyInfo = function (
	aTableProperties: any[],
	oMDCTable: MDCTable,
	mConditions: Record<string, any>,
	oMetadataInfo: any
) {
	const aConditionKey = Object.keys(mConditions),
		oMetaModel = oMDCTable.getModel().getMetaModel()!;
	aConditionKey.forEach(function (conditionKey: any) {
		if (
			aTableProperties.findIndex(function (tableProperty: any) {
				return tableProperty.path === conditionKey;
			}) === -1
		) {
			const oColumnDef = {
				path: conditionKey,
				typeConfig: oMDCTable
					.getTypeUtil()
					.getTypeConfig(oMetaModel.getObject(`/${oMetadataInfo.collectionName}/${conditionKey}`).$Type)
			};
			aTableProperties.push(oColumnDef);
		}
	});
};

ODataTableDelegate.updateBinding = function (oTable: any, oBindingInfo: any, oBinding: any) {
	let bNeedManualRefresh = false;
	const oInternalBindingContext = oTable.getBindingContext("internal");
	const sManualUpdatePropertyKey = "pendingManualBindingUpdate";
	const bPendingManualUpdate = oInternalBindingContext?.getProperty(sManualUpdatePropertyKey);
	let oRowBinding = oTable.getRowBinding();

	//oBinding=null means that a rebinding needs to be forced via updateBinding in mdc TableDelegate
	TableDelegate.updateBinding.apply(ODataTableDelegate, [oTable, oBindingInfo, oBinding]);
	//get row binding after rebind from TableDelegate.updateBinding in case oBinding was null
	if (!oRowBinding) {
		oRowBinding = oTable.getRowBinding();
	}
	if (oRowBinding) {
		/**
		 * Manual refresh if filters are not changed by binding.refresh() since updating the bindingInfo
		 * is not enough to trigger a batch request.
		 * Removing columns creates one batch request that was not executed before
		 */
		const oldFilters = oRowBinding.getFilters("Application");
		bNeedManualRefresh =
			deepEqual(oBindingInfo.filters, oldFilters[0]) &&
			oRowBinding.getQueryOptionsFromParameters().$search === oBindingInfo.parameters.$search &&
			!bPendingManualUpdate;
	}

	if (bNeedManualRefresh && oTable.getFilter()) {
		oInternalBindingContext?.setProperty(sManualUpdatePropertyKey, true);
		oRowBinding
			.requestRefresh(oRowBinding.getGroupId())
			.finally(function () {
				oInternalBindingContext?.setProperty(sManualUpdatePropertyKey, false);
			})
			.catch(function (oError: any) {
				Log.error("Error while refreshing a filterBar VH table", oError);
			});
	}
	oTable.fireEvent("bindingUpdated");
	//no need to check for semantic targets here since we are in a VH and don't want to allow further navigation
};

/**
 * Creates a simple property for each identified complex property.
 *
 * @param propertiesToBeCreated Identified properties.
 * @param existingColumns The list of columns created for properties defined on the Value List.
 * @param sortRestrictionsInfo An object containing the sort restriction information
 * @param filterRestrictionsInfo An object containing the filter restriction information
 * @returns The array of properties created.
 * @private
 */
function createRelatedProperties(
	propertiesToBeCreated: Record<string, Property>,
	existingColumns: ValueHelpTableColumn[],
	sortRestrictionsInfo: SortRestrictionsInfoType,
	filterRestrictionsInfo: any
): ValueHelpTableColumn[] {
	const relatedPropertyNameMap: Record<string, string> = {},
		relatedColumns: ValueHelpTableColumn[] = [];
	Object.keys(propertiesToBeCreated).forEach((path) => {
		const property = propertiesToBeCreated[path],
			relatedColumn = existingColumns.find((column) => column.path === path); // Complex properties doesn't get path so only simple column are found
		if (!relatedColumn) {
			const newName = `Property::${path}`;
			relatedPropertyNameMap[path] = newName;
			const valueHelpTableColumn: ValueHelpTableColumn = {
				name: newName,
				label: getLabel(property),
				path: path,
				sortable: isSortableProperty(sortRestrictionsInfo, property),
				filterable: isFilterableProperty(filterRestrictionsInfo, property)
			};
			valueHelpTableColumn.maxConditions = getPropertyMaxConditions(filterRestrictionsInfo, valueHelpTableColumn);
			if (isTypeFilterable(property.type as keyof typeof DefaultTypeForEdmType)) {
				const propertyTypeConfig = fetchTypeConfig(property);
				valueHelpTableColumn.typeConfig = TypeUtil.getTypeConfig(
					propertyTypeConfig.type,
					propertyTypeConfig.formatOptions,
					propertyTypeConfig.constraints
				);
			}
			relatedColumns.push(valueHelpTableColumn);
		}
	});
	// The property 'name' has been prefixed with 'Property::' for uniqueness.
	// Update the same in other propertyInfos[] references which point to this property.
	existingColumns.forEach((column) => {
		if (column.propertyInfos) {
			column.propertyInfos = column.propertyInfos?.map((columnName) => relatedPropertyNameMap[columnName] ?? columnName);
		}
	});
	return relatedColumns;
}

/**
 * Identifies if the given property is sortable based on the sort restriction information.
 *
 * @param sortRestrictionsInfo The sort restriction information from the restriction annotation.
 * @param property The target property.
 * @returns `true` if the given property is sortable.
 * @private
 */
function isSortableProperty(
	sortRestrictionsInfo: SortRestrictionsInfoType,
	property: ValueHelpTableColumn | Property
): boolean | undefined {
	const propertyPath = getPath(property);
	return propertyPath && sortRestrictionsInfo.propertyInfo[propertyPath]
		? sortRestrictionsInfo.propertyInfo[propertyPath].sortable
		: (property as ValueHelpTableColumn).sortable ?? true;
}

/**
 * Identifies if the given property is filterable based on the sort restriction information.
 *
 * @param filterRestrictionsInfo The filter restriction information from the restriction annotation.
 * @param property The target property.
 * @returns `true` if the given property is filterable.
 * @private
 */
function isFilterableProperty(filterRestrictionsInfo: any, property: ValueHelpTableColumn | Property): boolean | undefined {
	const propertyPath = getPath(property);
	return propertyPath && filterRestrictionsInfo?.propertyInfo.hasOwnProperty(propertyPath)
		? filterRestrictionsInfo.propertyInfo[propertyPath].filterable
		: (property as ValueHelpTableColumn).filterable ?? true;
}

/**
 * Identifies the maxConditions for a given property.
 *
 * @param filterRestrictionsInfo The filter restriction information from the restriction annotation.
 * @param property The target property.
 * @returns `-1` or `1` if the property is a MultiValueFilterExpression.
 * @private
 */

function getPropertyMaxConditions(filterRestrictionsInfo: any, property: ValueHelpTableColumn | Property): number {
	const propertyPath = getPath(property);
	return filterRestrictionsInfo.propertyInfo?.hasOwnProperty(propertyPath) &&
		propertyPath &&
		isMultiValueFilterExpression(filterRestrictionsInfo.propertyInfo[propertyPath])
		? -1
		: 1;
}

/**
 * Provides the property path of a given property or custom data from the ValueHelp.
 *
 * @param property The target property or custom data from the ValueHelp.
 * @returns The property path.
 */
function getPath(property: ValueHelpTableColumn | Property): string | undefined {
	return isProperty(property) ? property.name : property.path;
}

/**
 * Identifies the additional property which references to the unit, timezone, textArrangement or currency.
 *
 * @param dataModelPropertyPath The model object path of the property.
 * @returns The additional property.
 * @private
 */
function getAdditionalProperty(dataModelPropertyPath: DataModelObjectPath): DataModelObjectPath | undefined {
	const property = dataModelPropertyPath.targetObject;
	const additionalPropertyPath =
		getAssociatedTextPropertyPath(property) ||
		getAssociatedCurrencyPropertyPath(property) ||
		getAssociatedUnitPropertyPath(property) ||
		getAssociatedTimezonePropertyPath(property);
	if (!additionalPropertyPath) {
		return undefined;
	}
	const dataModelAdditionalProperty = enhanceDataModelPath(dataModelPropertyPath, additionalPropertyPath);

	//Additional Property could refer to a navigation property, keep the name and path as navigation property
	const additionalProperty = dataModelAdditionalProperty.targetObject;
	if (!additionalProperty) {
		return undefined;
	}
	return dataModelAdditionalProperty;
}

export default ODataTableDelegate;
