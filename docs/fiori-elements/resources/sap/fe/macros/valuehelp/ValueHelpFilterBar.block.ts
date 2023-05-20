import type { EntitySet } from "@sap-ux/vocabularies-types";
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, blockEvent, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import type { TemplateProcessorSettings } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { getExpandFilterFields, getSelectionFields } from "sap/fe/core/converters/controls/ListReport/FilterBar";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import TemplateModel from "sap/fe/core/TemplateModel";
import type { FilterBarP13nMode } from "sap/ui/mdc/library";
import type Context from "sap/ui/model/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

/**
 * Building block for creating a FilterBar based on the metadata provided by OData V4 for the value help dialog.
 *
 * @private
 */
@defineBuildingBlock({
	name: "ValueHelpFilterBar",
	namespace: "sap.fe.macros.valuehelp",
	fragment: "sap.fe.macros.valuehelp.ValueHelpFilterBar"
})
export default class ValueHelpFilterBarBlock extends BuildingBlockBase {
	/**
	 * ID of the FilterBar
	 */
	@blockAttribute({ type: "string" })
	public id?: string;

	@blockAttribute({ type: "sap.ui.model.Context", required: true })
	public contextPath!: Context;

	@blockAttribute({ type: "sap.ui.model.Context" })
	public metaPath?: Context;

	/**
	 * Don't show the basic search field
	 */
	@blockAttribute({ type: "boolean" })
	public hideBasicSearch = false;

	/**
	 * Enables the fallback to show all fields of the EntityType as filter fields if com.sap.vocabularies.UI.v1.SelectionFields are not present
	 */
	@blockAttribute({ type: "boolean" })
	enableFallback = false;

	/**
	 * Specifies the personalization options for the filter bar.
	 */
	@blockAttribute({ type: "sap.ui.mdc.FilterBarP13nMode[]" })
	public p13nMode: FilterBarP13nMode[] = [];

	/**
	 * Specifies the Sematic Date Range option for the filter bar.
	 */
	@blockAttribute({ type: "boolean" })
	public useSemanticDateRange = true;

	/**
	 * If set the search will be automatically triggered, when a filter value was changed.
	 */
	@blockAttribute({ type: "boolean" })
	public liveMode = false;

	/**
	 * Temporary workaround only
	 * path to valuelist
	 */
	@blockAttribute({ type: "sap.ui.model.Context", required: true })
	// eslint-disable-next-line @typescript-eslint/naming-convention
	public _valueList!: Context;

	/**
	 * selectionFields to be displayed
	 */
	@blockAttribute({ type: "sap.ui.model.Context" })
	public selectionFields?: Context;

	/**
	 * Filter conditions to be applied to the filter bar
	 */
	@blockAttribute({ type: "string" })
	public filterConditions?: string;

	/**
	 * If set to <code>true</code>, all search requests are ignored. Once it has been set to <code>false</code>,
	 * a search is triggered immediately if one or more search requests have been triggered in the meantime
	 * but were ignored based on the setting.
	 */
	@blockAttribute({ type: "boolean" })
	public suspendSelection = false;

	/**
	 * Determines whether the Show/Hide Filters button is in the state show or hide.
	 */
	@blockAttribute({ type: "boolean" })
	private expandFilterFields = true;

	/**
	 * Search handler name
	 */
	@blockEvent()
	search?: Function;

	/**
	 * Filters changed handler name
	 */
	@blockEvent()
	filterChanged?: Function;

	constructor(props: PropertiesOf<ValueHelpFilterBarBlock>, controlConfiguration: unknown, settings: TemplateProcessorSettings) {
		super(props);

		const metaModel = this.contextPath.getModel() as ODataMetaModel;

		const metaPathContext = this.metaPath;
		const metaPathPath = metaPathContext?.getPath();
		const dataModelObjectPath = getInvolvedDataModelObjects(this.contextPath);
		const converterContext = this.getConverterContext(dataModelObjectPath, undefined, settings);

		if (!this.selectionFields) {
			const selectionFields = getSelectionFields(converterContext, [], metaPathPath).selectionFields;
			this.selectionFields = new TemplateModel(selectionFields, metaModel).createBindingContext("/");
		}

		const targetEntitySet: EntitySet = dataModelObjectPath.targetEntitySet as EntitySet; // It could be a singleton but the annotaiton are not defined there (yet?)
		this.expandFilterFields = getExpandFilterFields(
			converterContext,
			targetEntitySet.annotations.Capabilities?.FilterRestrictions,
			this._valueList
		);
	}
}
