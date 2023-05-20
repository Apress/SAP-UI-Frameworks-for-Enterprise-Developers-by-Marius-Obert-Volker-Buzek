import { SelectionFields } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAggregation, blockAttribute, blockEvent, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { getSelectionVariant } from "sap/fe/core/converters/controls/Common/DataVisualization";
import { getSelectionFields } from "sap/fe/core/converters/controls/ListReport/FilterBar";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import { getSearchRestrictions } from "sap/fe/core/helpers/MetaModelFunction";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import TemplateModel from "sap/fe/core/TemplateModel";
import { FilterConditions, getFilterConditions } from "sap/fe/core/templating/FilterHelper";
import CommonHelper from "sap/fe/macros/CommonHelper";
import Context from "sap/ui/model/Context";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import { PropertyInfo } from "../DelegateUtil";
import { FilterField } from "./FilterBarAPI";

const setCustomFilterFieldProperties = function (childFilterField: Element, aggregationObject: any): FilterField {
	aggregationObject.slotName = aggregationObject.key;
	aggregationObject.key = aggregationObject.key.replace("InlineXML_", "");
	aggregationObject.label = childFilterField.getAttribute("label");
	aggregationObject.required = childFilterField.getAttribute("required") === "true";
	return aggregationObject;
};

/**
 * Building block for creating a FilterBar based on the metadata provided by OData V4.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:FilterBar
 *   id="SomeID"
 *   showAdaptFiltersButton="true"
 *   p13nMode=["Item","Value"]
 *   listBindingNames = "sap.fe.tableBinding"
 *   liveMode="true"
 *   search=".handlers.onSearch"
 *   filterChanged=".handlers.onFiltersChanged"
 * /&gt;
 * </pre>
 *
 * Building block for creating a FilterBar based on the metadata provided by OData V4.
 *
 * @since 1.94.0
 */
@defineBuildingBlock({
	name: "FilterBar",
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros"
})
export default class FilterBarBlock extends BuildingBlockBase {
	/**
	 * ID of the FilterBar
	 */
	@blockAttribute({
		type: "string",
		isPublic: true
	})
	id?: string;

	@blockAttribute({
		type: "boolean",
		isPublic: true
	})
	visible?: string;

	/**
	 * selectionFields to be displayed
	 */
	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	selectionFields?: SelectionFields | Context;

	@blockAttribute({ type: "string" })
	filterBarDelegate?: string;

	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true
	})
	metaPath?: Context;

	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true
	})
	contextPath?: Context;

	/**
	 * Displays possible errors during the search in a message box
	 */
	@blockAttribute({
		type: "boolean",
		isPublic: true
	})
	showMessages: boolean = false;

	/**
	 * ID of the assigned variant management
	 */
	@blockAttribute({
		type: "string"
	})
	variantBackreference?: string;

	/**
	 * Don't show the basic search field
	 */
	@blockAttribute({
		type: "boolean"
	})
	hideBasicSearch?: boolean;

	/**
	 * Enables the fallback to show all fields of the EntityType as filter fields if com.sap.vocabularies.UI.v1.SelectionFields are not present
	 */
	@blockAttribute({
		type: "boolean"
	})
	enableFallback: boolean = false;

	/**
	 * Handles visibility of the 'Adapt Filters' button on the FilterBar
	 */
	@blockAttribute({
		type: "boolean"
	})
	showAdaptFiltersButton: boolean = true;

	/**
	 * Specifies the personalization options for the filter bar.
	 */
	@blockAttribute({
		type: "sap.ui.mdc.FilterBarP13nMode[]"
	})
	p13nMode: string = "Item,Value";

	@blockAttribute({
		type: "string"
	})
	propertyInfo?: string;

	/**
	 * Specifies the Sematic Date Range option for the filter bar.
	 */
	@blockAttribute({
		type: "boolean"
	})
	useSemanticDateRange: boolean = true;

	/**
	 * If set the search will be automatically triggered, when a filter value was changed.
	 */
	@blockAttribute({
		type: "boolean",
		isPublic: true
	})
	liveMode: boolean = false;

	/**
	 * Filter conditions to be applied to the filter bar
	 */
	@blockAttribute({
		type: "string",
		required: false
	})
	filterConditions?: Record<string, FilterConditions[]>;

	/**
	 * If set to <code>true</code>, all search requests are ignored. Once it has been set to <code>false</code>,
	 * a search is triggered immediately if one or more search requests have been triggered in the meantime
	 * but were ignored based on the setting.
	 */
	@blockAttribute({
		type: "boolean"
	})
	suspendSelection: boolean = false;

	@blockAttribute({
		type: "boolean"
	})
	showDraftEditState: boolean = false;

	@blockAttribute({
		type: "boolean"
	})
	isDraftCollaborative: boolean = false;

	/**
	 * Id of control that will allow for switching between normal and visual filter
	 */
	@blockAttribute({
		type: "string"
	})
	toggleControlId?: string;

	@blockAttribute({
		type: "string"
	})
	initialLayout: string = "compact";

	/**
	 * Handles the visibility of the 'Clear' button on the FilterBar.
	 */
	@blockAttribute({
		type: "boolean",
		isPublic: true
	})
	showClearButton: boolean = false;

	@blockAttribute({
		type: "boolean"
	})
	_applyIdToContent: boolean = false;

	/**
	 * Temporary workaround only
	 * path to contextPath to be used by child filterfields
	 */
	_internalContextPath!: Context;

	_parameters: string | undefined;

	/**
	 * Event handler to react to the search event of the FilterBar
	 */
	@blockEvent()
	search?: string;

	/**
	 * Event handler to react to the filterChange event of the FilterBar
	 */
	@blockEvent()
	filterChanged?: string;

	/**
	 * Event handler to react to the stateChange event of the FilterBar.
	 */
	@blockEvent()
	stateChange?: string;

	/**
	 * Event handler to react to the filterChanged event of the FilterBar. Exposes parameters from the MDC filter bar
	 */
	@blockEvent()
	internalFilterChanged?: string;

	/**
	 * Event handler to react to the search event of the FilterBar. Exposes parameteres from the MDC filter bar
	 */
	@blockEvent()
	internalSearch?: string;

	/**
	 * Event handler to react to the afterClear event of the FilterBar
	 */
	@blockEvent()
	afterClear?: string;

	@blockAggregation({
		type: "sap.fe.macros.FilterField",
		isPublic: true,
		hasVirtualNode: true,
		processAggregations: setCustomFilterFieldProperties
	})
	filterFields?: FilterField;

	_apiId: string | undefined;

	_contentId: string | undefined;

	_valueHelps: Array<string> | "" | undefined;

	_filterFields: Array<string> | "" | undefined;

	constructor(props: PropertiesOf<FilterBarBlock>, configuration: any, mSettings: any) {
		super(props, configuration, mSettings);
		const oContext = this.contextPath;
		const oMetaPathContext = this.metaPath;
		if (!oMetaPathContext) {
			Log.error("Context Path not available for FilterBar Macro.");
			return;
		}
		const sMetaPath = oMetaPathContext?.getPath();
		let entityTypePath = "";
		const metaPathParts = sMetaPath?.split("/@com.sap.vocabularies.UI.v1.SelectionFields") || []; // [0]: entityTypePath, [1]: SF Qualifier.
		if (metaPathParts.length > 0) {
			entityTypePath = this.getEntityTypePath(metaPathParts);
		}
		const sEntitySetPath = ModelHelper.getEntitySetPath(entityTypePath);
		const oMetaModel = oContext?.getModel();
		this._internalContextPath = oMetaModel?.createBindingContext(entityTypePath) as Context;
		const sObjectPath = "@com.sap.vocabularies.UI.v1.SelectionFields";
		const annotationPath: string = "@com.sap.vocabularies.UI.v1.SelectionFields" + ((metaPathParts.length && metaPathParts[1]) || "");
		const oExtraParams: any = {};
		oExtraParams[sObjectPath] = {
			filterFields: this.filterFields
		};
		const oVisualizationObjectPath = getInvolvedDataModelObjects(this._internalContextPath);
		const oConverterContext = this.getConverterContext(oVisualizationObjectPath, undefined, mSettings, oExtraParams);
		if (!this.propertyInfo) {
			this.propertyInfo = getSelectionFields(oConverterContext, [], annotationPath).sPropertyInfo;
		}

		//Filter Fields and values to the field are filled based on the selectionFields and this would be empty in case of macro outside the FE template
		if (!this.selectionFields) {
			const oSelectionFields = getSelectionFields(oConverterContext, [], annotationPath).selectionFields;
			this.selectionFields = new TemplateModel(oSelectionFields, oMetaModel as ODataMetaModel).createBindingContext("/");
			const oEntityType = oConverterContext.getEntityType(),
				oSelectionVariant = getSelectionVariant(oEntityType, oConverterContext),
				oEntitySetContext = (oMetaModel as ODataMetaModel).getContext(sEntitySetPath),
				oFilterConditions = getFilterConditions(oEntitySetContext, { selectionVariant: oSelectionVariant });
			this.filterConditions = oFilterConditions;
		}
		this._processPropertyInfos(this.propertyInfo);

		const targetDataModelObject = getInvolvedDataModelObjects(oContext!).targetObject;
		if (targetDataModelObject.annotations?.Common?.DraftRoot || targetDataModelObject.annotations?.Common?.DraftNode) {
			this.showDraftEditState = true;
			this.checkIfCollaborationDraftSupported(oMetaModel as ODataMetaModel);
		}

		if (this._applyIdToContent) {
			this._apiId = this.id + "::FilterBar";
			this._contentId = this.id;
		} else {
			this._apiId = this.id;
			this._contentId = this.getContentId(this.id + "");
		}

		if (this.hideBasicSearch !== true) {
			const oSearchRestrictionAnnotation = getSearchRestrictions(sEntitySetPath, oMetaModel as ODataMetaModel);
			this.hideBasicSearch = Boolean(oSearchRestrictionAnnotation && !oSearchRestrictionAnnotation.Searchable);
		}
		this.processSelectionFields();
	}

	_processPropertyInfos(propertyInfo: string) {
		const aParameterFields: string[] = [];
		if (propertyInfo) {
			const sFetchedProperties = propertyInfo.replace(/\\{/g, "{").replace(/\\}/g, "}");
			const aFetchedProperties = JSON.parse(sFetchedProperties);
			const editStateLabel = this.getTranslatedText("FILTERBAR_EDITING_STATUS");
			aFetchedProperties.forEach(function (propInfo: PropertyInfo) {
				if (propInfo.isParameter) {
					aParameterFields.push(propInfo.name);
				}
				if (propInfo.path === "$editState") {
					propInfo.label = editStateLabel;
				}
			});

			this.propertyInfo = JSON.stringify(aFetchedProperties).replace(/\{/g, "\\{").replace(/\}/g, "\\}");
		}
		this._parameters = JSON.stringify(aParameterFields);
	}

	checkIfCollaborationDraftSupported = (oMetaModel: ODataMetaModel | undefined) => {
		if (ModelHelper.isCollaborationDraftSupported(oMetaModel)) {
			this.isDraftCollaborative = true;
		}
	};

	getEntityTypePath = (metaPathParts: string[]) => {
		return metaPathParts[0].endsWith("/") ? metaPathParts[0] : metaPathParts[0] + "/";
	};

	getSearch = () => {
		if (!this.hideBasicSearch) {
			return xml`<control:basicSearchField>
			<mdc:FilterField
				id="${generate([this.id, "BasicSearchField"])}"
				placeholder="{sap.fe.i18n>M_FILTERBAR_SEARCH}"
				conditions="{$filters>/conditions/$search}"
				dataType="sap.ui.model.odata.type.String"
				maxConditions="1"
			/>
		</control:basicSearchField>`;
		}
		return xml``;
	};

	processSelectionFields = () => {
		let draftEditState = xml``;
		if (this.showDraftEditState) {
			draftEditState = `<core:Fragment fragmentName="sap.fe.macros.filter.DraftEditState" type="XML" />`;
		}
		this._valueHelps = [];
		this._filterFields = [];
		this._filterFields?.push(draftEditState);
		if (!Array.isArray(this.selectionFields)) {
			this.selectionFields = this.selectionFields!.getObject() as SelectionFields;
		}
		this.selectionFields?.forEach((selectionField: any, selectionFieldIdx) => {
			if (selectionField.availability === "Default") {
				this.setFilterFieldsAndValueHelps(selectionField, selectionFieldIdx);
			}
		});
		this._filterFields = this._filterFields?.length > 0 ? this._filterFields : "";
		this._valueHelps = this._valueHelps?.length > 0 ? this._valueHelps : "";
	};

	setFilterFieldsAndValueHelps = (selectionField: any, selectionFieldIdx: number) => {
		if (selectionField.template === undefined && selectionField.type !== "Slot") {
			this.pushFilterFieldsAndValueHelps(selectionField);
		} else if (Array.isArray(this._filterFields)) {
			this._filterFields?.push(
				xml`<template:with path="selectionFields>${selectionFieldIdx}" var="item">
					<core:Fragment fragmentName="sap.fe.macros.filter.CustomFilter" type="XML" />
				</template:with>`
			);
		}
	};

	_getContextPathForFilterField(selectionField: any, filterBarContextPath: Context): string | Context {
		let contextPath: string | Context = filterBarContextPath;
		if (selectionField.isParameter) {
			// Example:
			// FilterBarContextPath: /Customer/Set
			// ParameterPropertyPath: /Customer/P_CC
			// ContextPathForFilterField: /Customer
			const annoPath = selectionField.annotationPath;
			contextPath = annoPath.substring(0, annoPath.lastIndexOf("/") + 1);
		}
		return contextPath;
	}

	pushFilterFieldsAndValueHelps = (selectionField: any) => {
		if (Array.isArray(this._filterFields)) {
			this._filterFields?.push(
				xml`<internalMacro:FilterField
			idPrefix="${generate([this.id, "FilterField", CommonHelper.getNavigationPath(selectionField.annotationPath)])}"
			vhIdPrefix="${generate([this.id, "FilterFieldValueHelp"])}"
			property="${selectionField.annotationPath}"
			contextPath="${this._getContextPathForFilterField(selectionField, this._internalContextPath)}"
			useSemanticDateRange="${this.useSemanticDateRange}"
			settings="${CommonHelper.stringifyCustomData(selectionField.settings)}"
			visualFilter="${selectionField.visualFilter}"
			/>`
			);
		}
		if (Array.isArray(this._valueHelps)) {
			this._valueHelps?.push(
				xml`<macro:ValueHelp
			idPrefix="${generate([this.id, "FilterFieldValueHelp"])}"
			conditionModel="$filters"
			property="${selectionField.annotationPath}"
			contextPath="${this._getContextPathForFilterField(selectionField, this._internalContextPath)}"
			filterFieldValueHelp="true"
			useSemanticDateRange="${this.useSemanticDateRange}"
		/>`
			);
		}
	};

	getTemplate() {
		const internalContextPath = this._internalContextPath?.getPath();
		let filterDelegate = "";
		if (this.filterBarDelegate) {
			filterDelegate = this.filterBarDelegate;
		} else {
			filterDelegate = "{name:'sap/fe/macros/filterBar/FilterBarDelegate', payload: {entityTypePath: '" + internalContextPath + "'}}";
		}
		return xml`<macroFilterBar:FilterBarAPI
        xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
        xmlns:core="sap.ui.core"
        xmlns:mdc="sap.ui.mdc"
        xmlns:control="sap.fe.core.controls"
        xmlns:macroFilterBar="sap.fe.macros.filterBar"
        xmlns:macro="sap.fe.macros"
        xmlns:internalMacro="sap.fe.macros.internal"
        xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		id="${this._apiId}"
		search="${this.search}"
		filterChanged="${this.filterChanged}"
		afterClear="${this.afterClear}"
		internalSearch="${this.internalSearch}"
		internalFilterChanged="${this.internalFilterChanged}"
		stateChange="${this.stateChange}"
	>
		<control:FilterBar
			core:require="{API: 'sap/fe/macros/filterBar/FilterBarAPI'}"
			id="${this._contentId}"
			liveMode="${this.liveMode}"
			delegate="${filterDelegate}"
			variantBackreference="${this.variantBackreference}"
			showAdaptFiltersButton="${this.showAdaptFiltersButton}"
			showClearButton="${this.showClearButton}"
			p13nMode="${this.p13nMode}"
			search="API.handleSearch($event)"
			filtersChanged="API.handleFilterChanged($event)"
			filterConditions="${this.filterConditions}"
			suspendSelection="${this.suspendSelection}"
			showMessages="${this.showMessages}"
			toggleControl="${this.toggleControlId}"
			initialLayout="${this.initialLayout}"
			propertyInfo="${this.propertyInfo}"
			customData:localId="${this.id}"
			visible="${this.visible}"
			customData:hideBasicSearch="${this.hideBasicSearch}"
			customData:showDraftEditState="${this.showDraftEditState}"
			customData:useSemanticDateRange="${this.useSemanticDateRange}"
			customData:entityType="${internalContextPath}"
			customData:parameters="${this._parameters}"
		>
			<control:dependents>
				${this._valueHelps}
			</control:dependents>
			${this.getSearch()}
			<control:filterItems>
				${this._filterFields}
			</control:filterItems>
		</control:FilterBar>
	</macroFilterBar:FilterBarAPI>`;
	}
}
