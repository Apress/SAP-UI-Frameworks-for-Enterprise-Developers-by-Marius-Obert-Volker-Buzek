import type { Property } from "@sap-ux/vocabularies-types";
import { CommonAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/Common";
import type { PresentationVariant } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log, { Level } from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import CommonUtils from "sap/fe/core/CommonUtils";
import type { CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { getSortRestrictionsInfo, isPropertyFilterable } from "sap/fe/core/helpers/MetaModelFunction";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import {
	getAssociatedCurrencyProperty,
	getAssociatedTextProperty,
	getAssociatedTimezoneProperty,
	getAssociatedUnitProperty
} from "sap/fe/core/templating/PropertyHelper";
import { getDisplayMode, getTypeConfig } from "sap/fe/core/templating/UIFormatters";
import type Table from "sap/m/Table";
import Util from "sap/m/table/Util";
import type Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import Rem from "sap/ui/dom/units/Rem";
import type Field from "sap/ui/mdc/Field";
import type FieldBase from "sap/ui/mdc/field/FieldBase";
import type MdcFilterBar from "sap/ui/mdc/filterbar/FilterBarBase";
import type FilterField from "sap/ui/mdc/FilterField";
import type MultiValueField from "sap/ui/mdc/MultiValueField";
import type MdcInnerTable from "sap/ui/mdc/Table";
import type ValueHelp from "sap/ui/mdc/ValueHelp";
import type Container from "sap/ui/mdc/valuehelp/base/Container";
import type Content from "sap/ui/mdc/valuehelp/base/Content";
import Conditions from "sap/ui/mdc/valuehelp/content/Conditions";
import MDCTable, { type $MDCTableSettings } from "sap/ui/mdc/valuehelp/content/MDCTable";
import MTable, { type $MTableSettings } from "sap/ui/mdc/valuehelp/content/MTable";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataType from "sap/ui/model/odata/type/ODataType";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type { MetaModelType } from "types/metamodel_types";
import { MetaModelEntitySetAnnotation } from "types/metamodel_types";

export type AnnotationValueListParameter = {
	$Type: string;
	ValueListProperty: string;
	LocalDataProperty?: {
		$PropertyPath: string;
	};
	Constant?: string;
	InitialValueIsSignificant?: boolean;
};

// com.sap.vocabularies.Common.v1.ValueListType
export type AnnotationValueListType = {
	$Type: string; // CommonAnnotationTypes.ValueListType;
	Label?: string;
	CollectionPath: string;
	CollectionRoot?: string;
	DistinctValuesSupported?: boolean;
	SearchSupported?: boolean;
	FetchValues?: number;
	PresentationVariantQualifier?: string;
	SelectionVariantQualifier?: string;
	Parameters: AnnotationValueListParameter[];
	$model: ODataModel;
};

export type AnnotationValueListTypeByQualifier = Record<string, AnnotationValueListType>;

const columnNotAlreadyDefined = (columnDefs: ColumnDef[], vhKey: string): boolean => !columnDefs.some((column) => column.path === vhKey);

export const AnnotationLabel = "@com.sap.vocabularies.Common.v1.Label",
	AnnotationText = "@com.sap.vocabularies.Common.v1.Text",
	AnnotationTextUITextArrangement = "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement",
	AnnotationValueListParameterIn = "com.sap.vocabularies.Common.v1.ValueListParameterIn",
	AnnotationValueListParameterConstant = "com.sap.vocabularies.Common.v1.ValueListParameterConstant",
	AnnotationValueListParameterOut = "com.sap.vocabularies.Common.v1.ValueListParameterOut",
	AnnotationValueListParameterInOut = "com.sap.vocabularies.Common.v1.ValueListParameterInOut",
	AnnotationValueListWithFixedValues = "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues";

type AnnotationsForProperty = {
	"@com.sap.vocabularies.Common.v1.ValueList"?: {
		SearchSupported?: boolean;
	};
	"@com.sap.vocabularies.Common.v1.Label"?: string; // AnnotationLabel
	"@com.sap.vocabularies.Common.v1.Text"?: {
		// AnnotationText
		$Path: string;
	};
	"@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"?: {
		// AnnotationTextUITextArrangement
		$EnumMember?: string;
	};
	"@com.sap.vocabularies.UI.v1.HiddenFilter"?: boolean;
	"@com.sap.vocabularies.Common.v1.ValueListWithFixedValues"?: boolean; // AnnotationValueListWithFixedValues
	"@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"?: string[];
	"@com.sap.vocabularies.UI.v1.Hidden"?: string;
};

type AnnotationSelectionField = {
	$PropertyPath: string;
};

type AnnotationsForEntityType = {
	"@com.sap.vocabularies.UI.v1.SelectionFields"?: AnnotationSelectionField[];
};

type ColumnProperty = {
	$Type: string;
	$kind: string;
	$isCollection: boolean;
};

export type InOutParameter = {
	parmeterType: string;
	source: string;
	helpPath: string;
	initialValueFilterEmpty: boolean;
	constantValue?: string | boolean;
};

type ValueHelpPayloadInfo = {
	vhKeys?: string[];
	vhParameters?: InOutParameter[];
};

type ValueHelpQualifierMap = Record<string, ValueHelpPayloadInfo>;

export type ValueHelpPayload = {
	propertyPath: string;
	qualifiers: ValueHelpQualifierMap;
	valueHelpQualifier: string;
	conditionModel?: any;
	isActionParameterDialog?: boolean;
	isUnitValueHelp?: boolean;
	requestGroupId?: string;
	useMultiValueField?: boolean;
	isValueListWithFixedValues?: boolean;
};

type ColumnDef = {
	path: string;
	label: string;
	sortable: boolean;
	filterable: boolean | CompiledBindingToolkitExpression;
	$Type: string;
};

export type ValueListInfo = {
	keyPath: string;
	descriptionPath: string;
	fieldPropertyPath: string;
	vhKeys: string[];
	vhParameters: InOutParameter[];
	valueListInfo: AnnotationValueListType;
	columnDefs: ColumnDef[];
	valueHelpQualifier: string;
};

type DisplayFormat = "Description" | "ValueDescription" | "Value" | "DescriptionValue";

type Path = {
	fieldPropertyPath: string;
	descriptionPath: string;
	key: string;
};

type SorterType = {
	ascending?: boolean;
	descending?: boolean;
	path?: string;
	name?: string;
};

function _getDefaultSortPropertyName(valueListInfo: AnnotationValueListType) {
	let sortFieldName: string | undefined;
	const metaModel = valueListInfo.$model.getMetaModel();
	const entitySetAnnotations = metaModel.getObject(`/${valueListInfo.CollectionPath}@`) || {};
	const sortRestrictionsInfo = getSortRestrictionsInfo(entitySetAnnotations);
	const foundElement = valueListInfo.Parameters.find(function (element) {
		return (
			(element.$Type === CommonAnnotationTypes.ValueListParameterInOut ||
				element.$Type === CommonAnnotationTypes.ValueListParameterOut ||
				element.$Type === CommonAnnotationTypes.ValueListParameterDisplayOnly) &&
			!(
				metaModel.getObject(`/${valueListInfo.CollectionPath}/${element.ValueListProperty}@com.sap.vocabularies.UI.v1.Hidden`) ===
				true
			)
		);
	});
	if (foundElement) {
		if (
			metaModel.getObject(
				`/${valueListInfo.CollectionPath}/${foundElement.ValueListProperty}@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement/$EnumMember`
			) === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly"
		) {
			sortFieldName = metaModel.getObject(
				`/${valueListInfo.CollectionPath}/${foundElement.ValueListProperty}@com.sap.vocabularies.Common.v1.Text/$Path`
			);
		} else {
			sortFieldName = foundElement.ValueListProperty;
		}
	}
	if (sortFieldName && (!sortRestrictionsInfo.propertyInfo[sortFieldName] || sortRestrictionsInfo.propertyInfo[sortFieldName].sortable)) {
		return sortFieldName;
	} else {
		return undefined;
	}
}

function _redundantDescription(oVLParameter: any, aColumnInfo: any[]) {
	const oColumnInfo = aColumnInfo.find(function (columnInfo: any) {
		return oVLParameter.ValueListProperty === columnInfo.textColumnName;
	});
	if (
		oVLParameter.ValueListProperty === oColumnInfo?.textColumnName &&
		!oColumnInfo.keyColumnHidden &&
		oColumnInfo.keyColumnDisplayFormat !== "Value"
	) {
		return true;
	}
	return undefined;
}

function _hasImportanceHigh(oValueListContext: any) {
	return oValueListContext.Parameters.some(function (oParameter: any) {
		return (
			oParameter["@com.sap.vocabularies.UI.v1.Importance"] &&
			oParameter["@com.sap.vocabularies.UI.v1.Importance"].$EnumMember === "com.sap.vocabularies.UI.v1.ImportanceType/High"
		);
	});
}

function _build$SelectString(control: any) {
	const oViewData = control.getModel("viewData");
	if (oViewData) {
		const oData = oViewData.getData();
		if (oData) {
			const aColumns = oData.columns;
			if (aColumns) {
				return aColumns.reduce(function (sQuery: any, oProperty: any) {
					// Navigation properties (represented by X/Y) should not be added to $select.
					// TODO : They should be added as $expand=X($select=Y) instead
					if (oProperty.path && oProperty.path.indexOf("/") === -1) {
						sQuery = sQuery ? `${sQuery},${oProperty.path}` : oProperty.path;
					}
					return sQuery;
				}, undefined);
			}
		}
	}
	return undefined;
}

function _getValueHelpColumnDisplayFormat(oPropertyAnnotations: any, isValueHelpWithFixedValues: any) {
	const sDisplayMode = CommonUtils.computeDisplayMode(oPropertyAnnotations, undefined);
	const oTextAnnotation = oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"];
	const oTextArrangementAnnotation =
		oTextAnnotation && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"];
	if (isValueHelpWithFixedValues) {
		return oTextAnnotation && typeof oTextAnnotation !== "string" && oTextAnnotation.$Path ? sDisplayMode : "Value";
	} else {
		// Only explicit defined TextArrangements in a Value Help with Dialog are considered
		return oTextArrangementAnnotation ? sDisplayMode : "Value";
	}
}

const ValueListHelper = {
	getValueListCollectionEntitySet: function (oValueListContext: any) {
		const mValueList = oValueListContext.getObject();
		return mValueList.$model.getMetaModel().createBindingContext(`/${mValueList.CollectionPath}`);
	},

	getTableDelegate: function (oValueList: any) {
		let sDefaultSortPropertyName = _getDefaultSortPropertyName(oValueList);
		if (sDefaultSortPropertyName) {
			sDefaultSortPropertyName = `'${sDefaultSortPropertyName}'`;
		}
		return (
			"{name: 'sap/fe/macros/internal/valuehelp/TableDelegate', payload: {collectionName: '" +
			oValueList.CollectionPath +
			"'" +
			(sDefaultSortPropertyName ? ", defaultSortPropertyName: " + sDefaultSortPropertyName : "") +
			"}}"
		);
	},

	getSortConditionsFromPresentationVariant: function (valueListInfo: AnnotationValueListType, isSuggestion: boolean) {
		if (valueListInfo.PresentationVariantQualifier !== undefined) {
			const presentationVariantQualifier = valueListInfo.PresentationVariantQualifier
					? `#${valueListInfo.PresentationVariantQualifier}`
					: "",
				presentationVariantPath = `/${valueListInfo.CollectionPath}/@com.sap.vocabularies.UI.v1.PresentationVariant${presentationVariantQualifier}`;
			const presentationVariant = valueListInfo.$model.getMetaModel().getObject(presentationVariantPath) as
				| MetaModelType<PresentationVariant>
				| undefined;
			if (presentationVariant?.SortOrder) {
				const sortConditions = {
					sorters: [] as SorterType[]
				};

				presentationVariant.SortOrder.forEach(function (condition) {
					const sorter: SorterType = {},
						propertyPath = condition?.Property?.$PropertyPath;
					if (isSuggestion) {
						sorter.path = propertyPath;
					} else {
						sorter.name = propertyPath;
					}

					if (condition.Descending) {
						sorter.descending = true;
					} else {
						sorter.ascending = true;
					}
					sortConditions.sorters.push(sorter);
				});

				return isSuggestion ? `sorter: ${JSON.stringify(sortConditions.sorters)}` : JSON.stringify(sortConditions);
			}
		}
		return;
	},

	getPropertyPath: function (oParameters: any) {
		return !oParameters.UnboundAction
			? `${oParameters.EntityTypePath}/${oParameters.Action}/${oParameters.Property}`
			: `/${oParameters.Action.substring(oParameters.Action.lastIndexOf(".") + 1)}/${oParameters.Property}`;
	},

	getValueListProperty: function (oPropertyContext: any) {
		const oValueListModel = oPropertyContext.getModel();
		const mValueList = oValueListModel.getObject("/");
		return mValueList.$model.getMetaModel().createBindingContext(`/${mValueList.CollectionPath}/${oPropertyContext.getObject()}`);
	},

	// This function is used for value help m-table and mdc-table
	getColumnVisibility: function (oValueList: any, oVLParameter: any, oSource: any) {
		const isDropDownList = oSource && !!oSource.valueHelpWithFixedValues,
			oColumnInfo = oSource.columnInfo,
			isVisible = !_redundantDescription(oVLParameter, oColumnInfo.columnInfos),
			isDialogTable = oColumnInfo.isDialogTable;

		if (isDropDownList || (!isDropDownList && isDialogTable) || (!isDropDownList && !_hasImportanceHigh(oValueList))) {
			const columnWithHiddenAnnotation = oColumnInfo.columnInfos.find(function (columnInfo: any) {
				return oVLParameter.ValueListProperty === columnInfo.columnName && columnInfo.hasHiddenAnnotation === true;
			});
			return !columnWithHiddenAnnotation ? isVisible : false;
		} else if (!isDropDownList && _hasImportanceHigh(oValueList)) {
			return oVLParameter &&
				oVLParameter["@com.sap.vocabularies.UI.v1.Importance"] &&
				oVLParameter["@com.sap.vocabularies.UI.v1.Importance"].$EnumMember === "com.sap.vocabularies.UI.v1.ImportanceType/High"
				? true
				: false;
		}
		return true;
	},

	getColumnVisibilityInfo: function (oValueList: any, sPropertyFullPath: any, bIsDropDownListe: any, isDialogTable: any) {
		const oMetaModel = oValueList.$model.getMetaModel();
		const aColumnInfos: any[] = [];
		const oColumnInfos = {
			isDialogTable: isDialogTable,
			columnInfos: aColumnInfos
		};

		oValueList.Parameters.forEach(function (oParameter: any) {
			const oPropertyAnnotations = oMetaModel.getObject(`/${oValueList.CollectionPath}/${oParameter.ValueListProperty}@`);
			const oTextAnnotation = oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"];
			let columnInfo: any = {};
			if (oTextAnnotation) {
				columnInfo = {
					keyColumnHidden: oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false,
					keyColumnDisplayFormat: oTextAnnotation && _getValueHelpColumnDisplayFormat(oPropertyAnnotations, bIsDropDownListe),
					textColumnName: oTextAnnotation && oTextAnnotation.$Path,
					columnName: oParameter.ValueListProperty,
					hasHiddenAnnotation: oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false
				};
			} else if (oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"]) {
				columnInfo = {
					columnName: oParameter.ValueListProperty,
					hasHiddenAnnotation: oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false
				};
			}
			oColumnInfos.columnInfos.push(columnInfo);
		});

		return oColumnInfos;
	},

	getTableItemsParameters: function (
		valueListInfo: AnnotationValueListType,
		requestGroupId: string,
		isSuggestion: boolean,
		isValueHelpWithFixedValues: boolean
	) {
		const itemParameters = [`path: '/${valueListInfo.CollectionPath}'`];

		// add select to oBindingInfo (BCP 2180255956 / 2170163012)
		const selectString = _build$SelectString(this);

		if (requestGroupId) {
			const selectStringPart = selectString ? `, '${selectString}'` : "";

			itemParameters.push(`parameters: {$$groupId: '${requestGroupId}'${selectStringPart}}`);
		} else if (selectString) {
			itemParameters.push(`parameters: {$select: '${selectString}'}`);
		}

		const isSuspended = valueListInfo.Parameters.some(function (oParameter) {
			return isSuggestion || oParameter.$Type === CommonAnnotationTypes.ValueListParameterIn;
		});
		itemParameters.push(`suspended: ${isSuspended}`);

		if (!isValueHelpWithFixedValues) {
			itemParameters.push("length: 10");
		}

		const sortConditionsFromPresentationVariant = ValueListHelper.getSortConditionsFromPresentationVariant(valueListInfo, isSuggestion);

		if (sortConditionsFromPresentationVariant) {
			itemParameters.push(sortConditionsFromPresentationVariant);
		} else if (isValueHelpWithFixedValues) {
			const defaultSortPropertyName = _getDefaultSortPropertyName(valueListInfo);

			if (defaultSortPropertyName) {
				itemParameters.push(`sorter: [{path: '${defaultSortPropertyName}', ascending: true}]`);
			}
		}

		return "{" + itemParameters.join(", ") + "}";
	},

	// Is needed for "external" representation in qunit
	hasImportance: function (oValueListContext: any) {
		return _hasImportanceHigh(oValueListContext.getObject()) ? "Importance/High" : "None";
	},

	// Is needed for "external" representation in qunit
	getMinScreenWidth: function (oValueList: any) {
		return _hasImportanceHigh(oValueList) ? "{= ${_VHUI>/minScreenWidth}}" : "416px";
	},

	/**
	 * Retrieves the column width for a given property.
	 *
	 * @param propertyPath The propertyPath
	 * @returns The width as a string.
	 */
	getColumnWidth: function (propertyPath: DataModelObjectPath) {
		const property = propertyPath.targetObject;
		let relatedProperty: Property[] = [property];
		// The additional property could refer to the text, currency, unit or timezone
		const additionalProperty =
				getAssociatedTextProperty(property) ||
				getAssociatedCurrencyProperty(property) ||
				getAssociatedUnitProperty(property) ||
				getAssociatedTimezoneProperty(property),
			textAnnotation = property.annotations?.Common?.Text,
			textArrangement = textAnnotation?.annotations?.UI?.TextArrangement?.toString(),
			label = property.annotations?.Common?.Label?.toString(),
			displayMode = textArrangement && getDisplayMode(propertyPath);
		if (additionalProperty) {
			if (displayMode === "Description") {
				relatedProperty = [additionalProperty];
			} else if (!textAnnotation || (displayMode && displayMode !== "Value")) {
				relatedProperty.push(additionalProperty);
			}
		}

		let size = 0;
		const instances: ODataType[] = [];

		relatedProperty.forEach((prop: Property) => {
			const propertyTypeConfig = getTypeConfig(prop, undefined);
			const PropertyODataConstructor = ObjectPath.get(propertyTypeConfig.type);
			if (PropertyODataConstructor) {
				instances.push(new PropertyODataConstructor(propertyTypeConfig.formatOptions, propertyTypeConfig.constraints));
			}
		});
		const sWidth = Util.calcColumnWidth(instances, label);
		size = sWidth ? parseFloat(sWidth.replace("rem", "")) : 0;

		if (size === 0) {
			Log.error(`Cannot compute the column width for property: ${property.name}`);
		}
		return size <= 20 ? size.toString() + "rem" : "20rem";
	},

	getOutParameterPaths: function (aParameters: any) {
		let sPath = "";
		aParameters.forEach(function (oParameter: any) {
			if (oParameter.$Type.endsWith("Out")) {
				sPath += `{${oParameter.ValueListProperty}}`;
			}
		});
		return sPath;
	},

	entityIsSearchable: function (
		propertyAnnotations: AnnotationsForProperty,
		collectionAnnotations: MetaModelEntitySetAnnotation
	): boolean {
		const searchSupported = propertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"]?.SearchSupported,
			searchable = collectionAnnotations["@Org.OData.Capabilities.V1.SearchRestrictions"]?.Searchable;

		if (
			(searchable === undefined && searchSupported === false) ||
			(searchable === true && searchSupported === false) ||
			searchable === false
		) {
			return false;
		}
		return true;
	},

	/**
	 * Returns the condition path required for the condition model.
	 * For e.g. <1:N-PropertyName>*\/<1:1-PropertyName>/<PropertyName>.
	 *
	 * @param metaModel The metamodel instance
	 * @param entitySet The entity set path
	 * @param propertyPath The property path
	 * @returns The formatted condition path
	 * @private
	 */
	_getConditionPath: function (metaModel: ODataMetaModel, entitySet: string, propertyPath: string): string {
		// (see also: sap/fe/core/converters/controls/ListReport/FilterBar.ts)
		const parts = propertyPath.split("/");
		let conditionPath = "",
			partialPath: string | undefined;

		while (parts.length) {
			let part = parts.shift() as string;
			partialPath = partialPath ? `${partialPath}/${part}` : part;
			const property = metaModel.getObject(`${entitySet}/${partialPath}`);
			if (property && property.$kind === "NavigationProperty" && property.$isCollection) {
				part += "*";
			}
			conditionPath = conditionPath ? `${conditionPath}/${part}` : part;
		}
		return conditionPath;
	},

	/**
	 * Returns array of column definitions corresponding to properties defined as Selection Fields on the CollectionPath entity set in a ValueHelp.
	 *
	 * @param metaModel The metamodel instance
	 * @param entitySet The entity set path
	 * @returns Array of column definitions
	 * @private
	 */
	_getColumnDefinitionFromSelectionFields: function (metaModel: ODataMetaModel, entitySet: string): ColumnDef[] {
		const columnDefs: ColumnDef[] = [],
			entityTypeAnnotations = metaModel.getObject(`${entitySet}/@`) as AnnotationsForEntityType,
			selectionFields = entityTypeAnnotations["@com.sap.vocabularies.UI.v1.SelectionFields"];

		if (selectionFields) {
			selectionFields.forEach(function (selectionField: AnnotationSelectionField) {
				const selectionFieldPath = `${entitySet}/${selectionField.$PropertyPath}`,
					conditionPath = ValueListHelper._getConditionPath(metaModel, entitySet, selectionField.$PropertyPath),
					propertyAnnotations = metaModel.getObject(`${selectionFieldPath}@`) as AnnotationsForProperty,
					columnDef = {
						path: conditionPath,
						label: propertyAnnotations[AnnotationLabel] || selectionFieldPath,
						sortable: true,
						filterable: isPropertyFilterable(metaModel, entitySet, selectionField.$PropertyPath, false),
						$Type: metaModel.getObject(selectionFieldPath)?.$Type
					};
				columnDefs.push(columnDef);
			});
		}

		return columnDefs;
	},

	_mergeColumnDefinitionsFromProperties: function (
		columnDefs: ColumnDef[],
		valueListInfo: AnnotationValueListType,
		valueListProperty: string,
		property: ColumnProperty,
		propertyAnnotations: AnnotationsForProperty
	): void {
		let columnPath = valueListProperty,
			columnPropertyType = property.$Type;
		const label = propertyAnnotations[AnnotationLabel] || columnPath,
			textAnnotation = propertyAnnotations[AnnotationText];

		if (
			textAnnotation &&
			propertyAnnotations[AnnotationTextUITextArrangement]?.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly"
		) {
			// the column property is the one coming from the text annotation
			columnPath = textAnnotation.$Path;
			const textPropertyPath = `/${valueListInfo.CollectionPath}/${columnPath}`;
			columnPropertyType = valueListInfo.$model.getMetaModel().getObject(textPropertyPath).$Type as string;
		}

		if (columnNotAlreadyDefined(columnDefs, columnPath)) {
			const columnDef: ColumnDef = {
				path: columnPath,
				label: label,
				sortable: true,
				filterable: !propertyAnnotations["@com.sap.vocabularies.UI.v1.HiddenFilter"],
				$Type: columnPropertyType
			};
			columnDefs.push(columnDef);
		}
	},

	filterInOutParameters: function (vhParameters: InOutParameter[], typeFilter: string[]) {
		return vhParameters.filter(function (parameter) {
			return typeFilter.indexOf(parameter.parmeterType) > -1;
		});
	},

	getInParameters: function (vhParameters: InOutParameter[]) {
		return ValueListHelper.filterInOutParameters(vhParameters, [
			AnnotationValueListParameterIn,
			AnnotationValueListParameterConstant,
			AnnotationValueListParameterInOut
		]);
	},

	getOutParameters: function (vhParameters: InOutParameter[]) {
		return ValueListHelper.filterInOutParameters(vhParameters, [AnnotationValueListParameterOut, AnnotationValueListParameterInOut]);
	},

	createVHUIModel: function (valueHelp: ValueHelp, propertyPath: string, metaModel: ODataMetaModel): JSONModel {
		// setting the _VHUI model evaluated in the ValueListTable fragment
		const vhUIModel = new JSONModel({}),
			propertyAnnotations = metaModel.getObject(`${propertyPath}@`) as AnnotationsForProperty;

		valueHelp.setModel(vhUIModel, "_VHUI");
		// Identifies the "ContextDependent-Scenario"
		vhUIModel.setProperty(
			"/hasValueListRelevantQualifiers",
			!!propertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"]
		);
		/* Property label for dialog title */
		vhUIModel.setProperty("/propertyLabel", propertyAnnotations[AnnotationLabel]);

		return vhUIModel;
	},

	/**
	 * Returns the title of the value help dialog.
	 * By default, the data field label is used, otherwise either the property label or the value list label is used as a fallback.
	 * For context-dependent value helps, by default the value list label is used, otherwise either the property label or the data field label is used as a fallback.
	 *
	 * @param valueHelp The valueHelp instance
	 * @param valuehelpLabel The label in the value help metadata
	 * @returns The title for the valueHelp dialog
	 * @private
	 */
	_getDialogTitle: function (valueHelp: ValueHelp, valuehelpLabel: string | undefined): string {
		const propertyLabel = valueHelp.getModel("_VHUI").getProperty("/propertyLabel");
		const dataFieldLabel = valueHelp.getControl()?.getProperty("label");
		return valueHelp.getModel("_VHUI").getProperty("/hasValueListRelevantQualifiers")
			? valuehelpLabel || propertyLabel || dataFieldLabel
			: dataFieldLabel || propertyLabel || valuehelpLabel;
	},

	destroyVHContent: function (valueHelp: ValueHelp): void {
		if (valueHelp.getDialog()) {
			valueHelp.getDialog().destroyContent();
		}
		if (valueHelp.getTypeahead()) {
			valueHelp.getTypeahead().destroyContent();
		}
	},

	putDefaultQualifierFirst: function (qualifiers: string[]) {
		const indexDefaultVH = qualifiers.indexOf("");

		// default ValueHelp without qualifier should be the first
		if (indexDefaultVH > 0) {
			qualifiers.unshift(qualifiers[indexDefaultVH]);
			qualifiers.splice(indexDefaultVH + 1, 1);
		}
		return qualifiers;
	},

	_getContextPrefix: function (bindingContext: Context | undefined, propertyBindingParts: string[]) {
		if (bindingContext && bindingContext.getPath()) {
			const bindigContextParts = bindingContext.getPath().split("/");
			if (propertyBindingParts.length - bindigContextParts.length > 1) {
				const contextPrefixParts = [];
				for (let i = bindigContextParts.length; i < propertyBindingParts.length - 1; i++) {
					contextPrefixParts.push(propertyBindingParts[i]);
				}
				return `${contextPrefixParts.join("/")}/`;
			}
		}

		return "";
	},

	_getVhParameter: function (
		conditionModel: string,
		valueHelp: ValueHelp,
		contextPrefix: string,
		parameter: AnnotationValueListParameter,
		vhMetaModel: ODataMetaModel,
		localDataPropertyPath: string
	): InOutParameter {
		let valuePath = "";
		const bindingContext = valueHelp.getBindingContext();
		if (conditionModel && conditionModel.length > 0) {
			if (
				valueHelp.getParent()?.isA("sap.ui.mdc.Table") &&
				bindingContext &&
				ValueListHelper._parameterIsA(parameter, [
					CommonAnnotationTypes.ValueListParameterIn,
					CommonAnnotationTypes.ValueListParameterInOut
				])
			) {
				// Special handling for value help used in filter dialog
				const parts = localDataPropertyPath.split("/");
				if (parts.length > 1) {
					const firstNavigationProperty = parts[0];
					const oBoundEntity = vhMetaModel.getMetaContext(bindingContext.getPath());
					const sPathOfTable = (valueHelp.getParent() as any).getRowBinding().getPath(); //TODO
					if (oBoundEntity.getObject(`${sPathOfTable}/$Partner`) === firstNavigationProperty) {
						// Using the condition model doesn't make any sense in case an in-parameter uses a navigation property
						// referring to the partner. Therefore reducing the path and using the FVH context instead of the condition model
						valuePath = localDataPropertyPath.replace(firstNavigationProperty + "/", "");
					}
				}
			}
			if (!valuePath) {
				valuePath = conditionModel + ">/conditions/" + localDataPropertyPath;
			}
		} else {
			valuePath = contextPrefix + localDataPropertyPath;
		}

		return {
			parmeterType: parameter.$Type,
			source: valuePath,
			helpPath: parameter.ValueListProperty,
			constantValue: parameter.Constant,
			initialValueFilterEmpty: Boolean(parameter.InitialValueIsSignificant)
		};
	},

	_parameterIsA(parameter: AnnotationValueListParameter, parameterTypes: CommonAnnotationTypes[]): boolean {
		return parameterTypes.includes(parameter.$Type as CommonAnnotationTypes);
	},

	_enrichPath: function (
		path: Path,
		propertyPath: string,
		localDataPropertyPath: string,
		parameter: AnnotationValueListParameter,
		propertyName: string | undefined,
		propertyAnnotations: AnnotationsForProperty
	) {
		if (
			!path.key &&
			ValueListHelper._parameterIsA(parameter, [
				CommonAnnotationTypes.ValueListParameterOut,
				CommonAnnotationTypes.ValueListParameterInOut
			]) &&
			localDataPropertyPath === propertyName
		) {
			path.fieldPropertyPath = propertyPath;
			path.key = parameter.ValueListProperty;

			//Only the text annotation of the key can specify the description
			path.descriptionPath = propertyAnnotations[AnnotationText]?.$Path || "";
		}
	},

	_enrichKeys: function (vhKeys: string[], parameter: AnnotationValueListParameter) {
		if (
			ValueListHelper._parameterIsA(parameter, [
				CommonAnnotationTypes.ValueListParameterOut,
				CommonAnnotationTypes.ValueListParameterIn,
				CommonAnnotationTypes.ValueListParameterInOut
			]) &&
			!vhKeys.includes(parameter.ValueListProperty)
		) {
			vhKeys.push(parameter.ValueListProperty);
		}
	},

	_processParameters: function (
		annotationValueListType: AnnotationValueListType,
		propertyName: string | undefined,
		conditionModel: string,
		valueHelp: ValueHelp,
		contextPrefix: string,
		vhMetaModel: ODataMetaModel,
		valueHelpQualifier: string
	) {
		const metaModel = annotationValueListType.$model.getMetaModel(),
			entitySetPath = `/${annotationValueListType.CollectionPath}`,
			entityType = metaModel.getObject(`${entitySetPath}/`);
		if (entityType === undefined) {
			Log.error(`Inconsistent value help metadata: Entity ${entitySetPath} is not defined`);
			return;
		}

		const columnDefs = ValueListHelper._getColumnDefinitionFromSelectionFields(metaModel, entitySetPath),
			vhParameters: InOutParameter[] = [],
			vhKeys: string[] = entityType.$Key ? [...entityType.$Key] : [];

		const path: Path = {
			fieldPropertyPath: "",
			descriptionPath: "",
			key: ""
		};

		for (const parameter of annotationValueListType.Parameters) {
			//All String fields are allowed for filter
			const propertyPath = `/${annotationValueListType.CollectionPath}/${parameter.ValueListProperty}`,
				property = metaModel.getObject(propertyPath),
				propertyAnnotations = (metaModel.getObject(`${propertyPath}@`) || {}) as AnnotationsForProperty,
				localDataPropertyPath = parameter.LocalDataProperty?.$PropertyPath || "";

			// If property is undefined, then the property coming for the entry isn't defined in
			// the metamodel, therefore we don't need to add it in the in/out parameters
			if (property) {
				// Search for the *out Parameter mapped to the local property
				ValueListHelper._enrichPath(path, propertyPath, localDataPropertyPath, parameter, propertyName, propertyAnnotations);

				const valueListProperty = parameter.ValueListProperty;
				ValueListHelper._mergeColumnDefinitionsFromProperties(
					columnDefs,
					annotationValueListType,
					valueListProperty,
					property,
					propertyAnnotations
				);
			}

			//In and InOut and Out
			if (
				ValueListHelper._parameterIsA(parameter, [
					CommonAnnotationTypes.ValueListParameterIn,
					CommonAnnotationTypes.ValueListParameterOut,
					CommonAnnotationTypes.ValueListParameterInOut
				]) &&
				localDataPropertyPath !== propertyName
			) {
				const vhParameter = ValueListHelper._getVhParameter(
					conditionModel,
					valueHelp,
					contextPrefix,
					parameter,
					vhMetaModel,
					localDataPropertyPath
				);
				vhParameters.push(vhParameter);
			}

			//Constant as InParamter for filtering
			if (parameter.$Type === AnnotationValueListParameterConstant) {
				vhParameters.push({
					parmeterType: parameter.$Type,
					source: parameter.ValueListProperty,
					helpPath: parameter.ValueListProperty,
					constantValue: parameter.Constant,
					initialValueFilterEmpty: Boolean(parameter.InitialValueIsSignificant)
				});
			}

			// Enrich keys with out-parameters
			ValueListHelper._enrichKeys(vhKeys, parameter);
		}

		/* Ensure that vhKeys are part of the columnDefs, otherwise it is not considered in $select (BCP 2270141154) */
		for (const vhKey of vhKeys) {
			if (columnNotAlreadyDefined(columnDefs, vhKey)) {
				const columnDef: ColumnDef = {
					path: vhKey,
					$Type: metaModel.getObject(`/${annotationValueListType.CollectionPath}/${path.key}`)?.$Type,
					label: "",
					sortable: false,
					filterable: undefined
				};
				columnDefs.push(columnDef);
			}
		}

		const valuelistInfo: ValueListInfo = {
			keyPath: path.key,
			descriptionPath: path.descriptionPath,
			fieldPropertyPath: path.fieldPropertyPath,
			vhKeys: vhKeys,
			vhParameters: vhParameters,
			valueListInfo: annotationValueListType,
			columnDefs: columnDefs,
			valueHelpQualifier
		};
		return valuelistInfo;
	},

	_logError: function (propertyPath: string, error?: unknown) {
		const status = error ? (error as XMLHttpRequest).status : undefined;
		const message = error instanceof Error ? error.message : String(error);
		const msg = status === 404 ? `Metadata not found (${status}) for value help of property ${propertyPath}` : message;

		Log.error(msg);
	},

	getValueListInfo: async function (valueHelp: ValueHelp, propertyPath: string, payload: ValueHelpPayload): Promise<ValueListInfo[]> {
		const bindingContext = valueHelp.getBindingContext() as Context | undefined,
			conditionModel = payload.conditionModel,
			vhMetaModel = valueHelp.getModel().getMetaModel() as ODataMetaModel,
			valueListInfos: ValueListInfo[] = [],
			propertyPathParts = propertyPath.split("/");
		try {
			const valueListByQualifier = (await vhMetaModel.requestValueListInfo(
				propertyPath,
				true,
				bindingContext
			)) as AnnotationValueListTypeByQualifier;
			const valueHelpQualifiers = ValueListHelper.putDefaultQualifierFirst(Object.keys(valueListByQualifier)),
				propertyName = propertyPathParts.pop();

			const contextPrefix = payload.useMultiValueField ? ValueListHelper._getContextPrefix(bindingContext, propertyPathParts) : "";

			for (const valueHelpQualifier of valueHelpQualifiers) {
				// Add column definitions for properties defined as Selection fields on the CollectionPath entity set.
				const annotationValueListType = valueListByQualifier[valueHelpQualifier];

				const valueListInfo = ValueListHelper._processParameters(
					annotationValueListType,
					propertyName,
					conditionModel,
					valueHelp,
					contextPrefix,
					vhMetaModel,
					valueHelpQualifier
				);
				/* Only consistent value help definitions shall be part of the value help */
				if (valueListInfo) {
					valueListInfos.push(valueListInfo);
				}
			}
		} catch (err) {
			this._logError(propertyPath, err);

			ValueListHelper.destroyVHContent(valueHelp);
		}
		return valueListInfos;
	},

	ALLFRAGMENTS: undefined as any,
	logFragment: undefined as any,

	_logTemplatedFragments: function (propertyPath: string, fragmentName: string, fragmentDefinition: any): void {
		const logInfo = {
			path: propertyPath,
			fragmentName: fragmentName,
			fragment: fragmentDefinition
		};
		if (Log.getLevel() === Level.DEBUG) {
			//In debug mode we log all generated fragments
			ValueListHelper.ALLFRAGMENTS = ValueListHelper.ALLFRAGMENTS || [];
			ValueListHelper.ALLFRAGMENTS.push(logInfo);
		}
		if (ValueListHelper.logFragment) {
			//One Tool Subscriber allowed
			setTimeout(function () {
				ValueListHelper.logFragment(logInfo);
			}, 0);
		}
	},

	_templateFragment: async function <T extends Table | MdcInnerTable | MdcFilterBar>(
		fragmentName: string,
		valueListInfo: ValueListInfo,
		sourceModel: JSONModel,
		propertyPath: string
	): Promise<T> {
		const localValueListInfo = valueListInfo.valueListInfo,
			valueListModel = new JSONModel(localValueListInfo),
			valueListServiceMetaModel = localValueListInfo.$model.getMetaModel(),
			viewData = new JSONModel({
				converterType: "ListReport",
				columns: valueListInfo.columnDefs || null
			});

		const fragmentDefinition = await XMLPreprocessor.process(
			XMLTemplateProcessor.loadTemplate(fragmentName, "fragment"),
			{ name: fragmentName },
			{
				bindingContexts: {
					valueList: valueListModel.createBindingContext("/"),
					contextPath: valueListServiceMetaModel.createBindingContext(`/${localValueListInfo.CollectionPath}/`),
					source: sourceModel.createBindingContext("/")
				},
				models: {
					valueList: valueListModel,
					contextPath: valueListServiceMetaModel,
					source: sourceModel,
					metaModel: valueListServiceMetaModel,
					viewData: viewData
				}
			}
		);
		ValueListHelper._logTemplatedFragments(propertyPath, fragmentName, fragmentDefinition);
		return (await Fragment.load({ definition: fragmentDefinition })) as T;
	},

	_getContentId: function (valueHelpId: string, valueHelpQualifier: string, isTypeahead: boolean): string {
		const contentType = isTypeahead ? "Popover" : "Dialog";

		return `${valueHelpId}::${contentType}::qualifier::${valueHelpQualifier}`;
	},

	_addInOutParametersToPayload: function (payload: ValueHelpPayload, valueListInfo: ValueListInfo): void {
		const valueHelpQualifier = valueListInfo.valueHelpQualifier;

		if (!payload.qualifiers) {
			payload.qualifiers = {};
		}

		if (!payload.qualifiers[valueHelpQualifier]) {
			payload.qualifiers[valueHelpQualifier] = {
				vhKeys: valueListInfo.vhKeys,
				vhParameters: valueListInfo.vhParameters
			};
		}
	},

	_getValueHelpColumnDisplayFormat: function (
		propertyAnnotations: AnnotationsForProperty,
		isValueHelpWithFixedValues: boolean
	): DisplayFormat {
		const displayMode = CommonUtils.computeDisplayMode(propertyAnnotations, undefined),
			textAnnotation = propertyAnnotations && propertyAnnotations[AnnotationText],
			textArrangementAnnotation = textAnnotation && propertyAnnotations[AnnotationTextUITextArrangement];

		if (isValueHelpWithFixedValues) {
			return textAnnotation && typeof textAnnotation !== "string" && textAnnotation.$Path ? displayMode : "Value";
		} else {
			// Only explicit defined TextArrangements in a Value Help with Dialog are considered
			return textArrangementAnnotation ? displayMode : "Value";
		}
	},

	_getWidthInRem: function (control: Control, isUnitValueHelp: boolean): number {
		let width = control.$().width(); // JQuery
		if (isUnitValueHelp && width) {
			width = 0.3 * width;
		}
		const floatWidth = width ? parseFloat(String(Rem.fromPx(width))) : 0;

		return isNaN(floatWidth) ? 0 : floatWidth;
	},

	_getTableWidth: function (table: Table, minWidth: number): string {
		let width: string;
		const columns = table.getColumns(),
			visibleColumns =
				(columns &&
					columns.filter(function (column) {
						return column && column.getVisible && column.getVisible();
					})) ||
				[],
			sumWidth = visibleColumns.reduce(function (sum, column) {
				width = column.getWidth();
				if (width && width.endsWith("px")) {
					width = String(Rem.fromPx(width));
				}
				const floatWidth = parseFloat(width);

				return sum + (isNaN(floatWidth) ? 9 : floatWidth);
			}, visibleColumns.length);
		return `${Math.max(sumWidth, minWidth)}em`;
	},

	_createValueHelpTypeahead: async function (
		propertyPath: string,
		valueHelp: ValueHelp,
		content: MTable,
		valueListInfo: ValueListInfo,
		payload: ValueHelpPayload
	) {
		const contentId = content.getId(),
			propertyAnnotations = valueHelp.getModel().getMetaModel()!.getObject(`${propertyPath}@`) as AnnotationsForProperty,
			valueHelpWithFixedValues = propertyAnnotations[AnnotationValueListWithFixedValues] ?? false,
			isDialogTable = false,
			columnInfo = ValueListHelper.getColumnVisibilityInfo(
				valueListInfo.valueListInfo,
				propertyPath,
				valueHelpWithFixedValues,
				isDialogTable
			),
			sourceModel = new JSONModel({
				id: contentId,
				groupId: payload.requestGroupId || undefined,
				bSuggestion: true,
				propertyPath: propertyPath,
				columnInfo: columnInfo,
				valueHelpWithFixedValues: valueHelpWithFixedValues
			});

		content.setKeyPath(valueListInfo.keyPath);
		content.setDescriptionPath(valueListInfo.descriptionPath);
		payload.isValueListWithFixedValues = valueHelpWithFixedValues;

		const collectionAnnotations =
			valueListInfo.valueListInfo.$model.getMetaModel().getObject(`/${valueListInfo.valueListInfo.CollectionPath}@`) || {};

		content.setFilterFields(ValueListHelper.entityIsSearchable(propertyAnnotations, collectionAnnotations) ? "$search" : "");

		const table = await ValueListHelper._templateFragment<Table>(
			"sap.fe.macros.internal.valuehelp.ValueListTable",
			valueListInfo,
			sourceModel,
			propertyPath
		);

		table.setModel(valueListInfo.valueListInfo.$model);

		Log.info(`Value List- suggest Table XML content created [${propertyPath}]`, table.getMetadata().getName(), "MDC Templating");

		content.setTable(table);

		const field = valueHelp.getControl();

		if (
			field !== undefined &&
			(field.isA<FilterField>("sap.ui.mdc.FilterField") ||
				field.isA<Field>("sap.ui.mdc.Field") ||
				field.isA<MultiValueField>("sap.ui.mdc.MultiValueField"))
		) {
			//Can the filterfield be something else that we need the .isA() check?
			const reduceWidthForUnitValueHelp = Boolean(payload.isUnitValueHelp);
			const tableWidth = ValueListHelper._getTableWidth(table, ValueListHelper._getWidthInRem(field, reduceWidthForUnitValueHelp));
			table.setWidth(tableWidth);

			if (valueHelpWithFixedValues) {
				table.setMode((field as FieldBase).getMaxConditions() === 1 ? "SingleSelectMaster" : "MultiSelect");
			} else {
				table.setMode("SingleSelectMaster");
			}
		}
	},

	_createValueHelpDialog: async function (
		propertyPath: string,
		valueHelp: ValueHelp,
		content: MDCTable,
		valueListInfo: ValueListInfo,
		payload: ValueHelpPayload
	): Promise<void> {
		const propertyAnnotations = valueHelp.getModel().getMetaModel()!.getObject(`${propertyPath}@`) as AnnotationsForProperty,
			isDropDownListe = false,
			isDialogTable = true,
			columnInfo = ValueListHelper.getColumnVisibilityInfo(valueListInfo.valueListInfo, propertyPath, isDropDownListe, isDialogTable),
			sourceModel = new JSONModel({
				id: content.getId(),
				groupId: payload.requestGroupId || undefined,
				bSuggestion: false,
				columnInfo: columnInfo,
				valueHelpWithFixedValues: isDropDownListe
			});

		content.setKeyPath(valueListInfo.keyPath);
		content.setDescriptionPath(valueListInfo.descriptionPath);

		const collectionAnnotations =
			valueListInfo.valueListInfo.$model.getMetaModel().getObject(`/${valueListInfo.valueListInfo.CollectionPath}@`) || {};

		content.setFilterFields(ValueListHelper.entityIsSearchable(propertyAnnotations, collectionAnnotations) ? "$search" : "");

		const tablePromise = ValueListHelper._templateFragment<MdcInnerTable>(
			"sap.fe.macros.internal.valuehelp.ValueListDialogTable",
			valueListInfo,
			sourceModel,
			propertyPath
		);

		const filterBarPromise = ValueListHelper._templateFragment<MdcFilterBar>(
			"sap.fe.macros.internal.valuehelp.ValueListFilterBar",
			valueListInfo,
			sourceModel,
			propertyPath
		);

		const [table, filterBar] = await Promise.all([tablePromise, filterBarPromise]);

		table.setModel(valueListInfo.valueListInfo.$model);
		filterBar.setModel(valueListInfo.valueListInfo.$model);

		content.setFilterBar(filterBar);
		content.setTable(table);

		table.setFilter(filterBar.getId());
		table.initialized();

		const field = valueHelp.getControl();
		if (field !== undefined) {
			table.setSelectionMode((field as FieldBase).getMaxConditions() === 1 ? "SingleMaster" : "Multi");
		}
		table.setWidth("100%");

		//This is a temporary workarround - provided by MDC (see FIORITECHP1-24002)
		const mdcTable = table as any;
		mdcTable._setShowP13nButton(false);
	},

	_getContentById: function <T extends MTable | MDCTable>(contentList: Content[], contentId: string) {
		return contentList.find(function (item) {
			return item.getId() === contentId;
		}) as T | undefined;
	},

	_createPopoverContent: function (contentId: string, caseSensitive: boolean, useAsValueHelp: boolean) {
		return new MTable({
			id: contentId,
			group: "group1",
			caseSensitive: caseSensitive,
			useAsValueHelp: useAsValueHelp
		} as $MTableSettings);
	},

	_createDialogContent: function (contentId: string, caseSensitive: boolean, forceBind: boolean) {
		return new MDCTable({
			id: contentId,
			group: "group1",
			caseSensitive: caseSensitive,
			forceBind: forceBind
		} as $MDCTableSettings);
	},

	_showConditionsContent: function (contentList: Content[], container: Container) {
		let conditionsContent =
			contentList.length && contentList[contentList.length - 1].getMetadata().getName() === "sap.ui.mdc.valuehelp.content.Conditions"
				? contentList[contentList.length - 1]
				: undefined;

		if (conditionsContent) {
			conditionsContent.setVisible(true);
		} else {
			conditionsContent = new Conditions();
			container.addContent(conditionsContent);
		}
	},

	_alignOrCreateContent: function (
		valueListInfo: ValueListInfo,
		contentId: string,
		caseSensitive: boolean,
		showConditionPanel: boolean,
		container: Container
	) {
		const contentList = container.getContent();
		let content = ValueListHelper._getContentById<MDCTable>(contentList, contentId);

		if (!content) {
			const forceBind = valueListInfo.valueListInfo.FetchValues === 2 ? false : true;

			content = ValueListHelper._createDialogContent(contentId, caseSensitive, forceBind);

			if (!showConditionPanel) {
				container.addContent(content);
			} else {
				container.insertContent(content, contentList.length - 1); // insert content before conditions content
			}
		} else {
			content.setVisible(true);
		}

		return content;
	},

	_prepareValueHelpTypeAhead: function (
		valueHelp: ValueHelp,
		container: Container,
		valueListInfos: ValueListInfo[],
		payload: ValueHelpPayload,
		caseSensitive: boolean,
		firstTypeAheadContent: MTable
	) {
		const contentList = container.getContent();
		let qualifierForTypeahead = valueHelp.data("valuelistForValidation") || ""; // can also be null
		if (qualifierForTypeahead === " ") {
			qualifierForTypeahead = "";
		}
		const valueListInfo = qualifierForTypeahead
			? valueListInfos.filter(function (subValueListInfo) {
					return subValueListInfo.valueHelpQualifier === qualifierForTypeahead;
			  })[0]
			: valueListInfos[0];

		ValueListHelper._addInOutParametersToPayload(payload, valueListInfo);

		const contentId = ValueListHelper._getContentId(valueHelp.getId(), valueListInfo.valueHelpQualifier, true);
		let content = ValueListHelper._getContentById<MTable>(contentList, contentId);

		if (!content) {
			const useAsValueHelp = firstTypeAheadContent.getUseAsValueHelp();
			content = ValueListHelper._createPopoverContent(contentId, caseSensitive, useAsValueHelp);

			container.insertContent(content, 0); // insert content as first content
		} else if (contentId !== contentList[0].getId()) {
			// content already available but not as first content?
			container.removeContent(content);
			container.insertContent(content, 0); // move content to first position
		}

		return { valueListInfo, content };
	},

	_prepareValueHelpDialog: function (
		valueHelp: ValueHelp,
		container: Container,
		valueListInfos: ValueListInfo[],
		payload: ValueHelpPayload,
		selectedContentId: string,
		caseSensitive: boolean
	) {
		const showConditionPanel = valueHelp.data("showConditionPanel") && valueHelp.data("showConditionPanel") !== "false";
		const contentList = container.getContent();

		// set all contents to invisible
		for (const contentListItem of contentList) {
			contentListItem.setVisible(false);
		}

		if (showConditionPanel) {
			this._showConditionsContent(contentList, container);
		}

		let selectedInfo: ValueListInfo | undefined, selectedContent: MDCTable | undefined;

		// Create or reuse contents for the current context
		for (const valueListInfo of valueListInfos) {
			const valueHelpQualifier = valueListInfo.valueHelpQualifier;

			ValueListHelper._addInOutParametersToPayload(payload, valueListInfo);

			const contentId = ValueListHelper._getContentId(valueHelp.getId(), valueHelpQualifier, false);

			const content = this._alignOrCreateContent(valueListInfo, contentId, caseSensitive, showConditionPanel, container);

			if (valueListInfo.valueListInfo.Label) {
				const title = CommonUtils.getTranslatedTextFromExpBindingString(valueListInfo.valueListInfo.Label, valueHelp.getControl());
				content.setTitle(title);
			}

			if (!selectedContent || (selectedContentId && selectedContentId === contentId)) {
				selectedContent = content;
				selectedInfo = valueListInfo;
			}
		}

		if (!selectedInfo || !selectedContent) {
			throw new Error("selectedInfo or selectedContent undefined");
		}

		return { selectedInfo, selectedContent };
	},

	showValueList: async function (payload: ValueHelpPayload, container: Container, selectedContentId: string): Promise<void> {
		const valueHelp = container.getParent() as ValueHelp,
			isTypeahead = container.isTypeahead(),
			propertyPath = payload.propertyPath,
			metaModel = valueHelp.getModel().getMetaModel() as ODataMetaModel,
			vhUIModel = (valueHelp.getModel("_VHUI") as JSONModel) || ValueListHelper.createVHUIModel(valueHelp, propertyPath, metaModel);

		if (!payload.qualifiers) {
			payload.qualifiers = {};
		}

		vhUIModel.setProperty("/isSuggestion", isTypeahead);
		vhUIModel.setProperty("/minScreenWidth", !isTypeahead ? "418px" : undefined);

		try {
			const valueListInfos = await ValueListHelper.getValueListInfo(valueHelp, propertyPath, payload);
			const firstTypeAheadContent = valueHelp.getTypeahead().getContent()[0] as MTable,
				caseSensitive = firstTypeAheadContent.getCaseSensitive(); // take caseSensitive from first Typeahead content

			if (isTypeahead) {
				const { valueListInfo, content } = ValueListHelper._prepareValueHelpTypeAhead(
					valueHelp,
					container,
					valueListInfos,
					payload,
					caseSensitive,
					firstTypeAheadContent
				);

				payload.valueHelpQualifier = valueListInfo.valueHelpQualifier;

				if (content.getTable() === undefined || content.getTable() === null) {
					await ValueListHelper._createValueHelpTypeahead(propertyPath, valueHelp, content, valueListInfo, payload);
				}
			} else {
				const { selectedInfo, selectedContent } = ValueListHelper._prepareValueHelpDialog(
					valueHelp,
					container,
					valueListInfos,
					payload,
					selectedContentId,
					caseSensitive
				);

				payload.valueHelpQualifier = selectedInfo.valueHelpQualifier;
				/* For context depentent value helps the value list label is used for the dialog title */
				const title = CommonUtils.getTranslatedTextFromExpBindingString(
					ValueListHelper._getDialogTitle(valueHelp, selectedInfo.valueListInfo?.Label),
					valueHelp.getControl()
				);
				container.setTitle(title);

				if (selectedContent.getTable() === undefined || selectedContent.getTable() === null) {
					await ValueListHelper._createValueHelpDialog(propertyPath, valueHelp, selectedContent, selectedInfo, payload);
				}
			}
		} catch (err) {
			this._logError(propertyPath, err);

			ValueListHelper.destroyVHContent(valueHelp);
		}
	}
};

export default ValueListHelper;
