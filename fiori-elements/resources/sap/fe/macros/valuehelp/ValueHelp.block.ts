import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import { isEntitySet } from "sap/fe/core/helpers/TypeGuards";
import type Context from "sap/ui/model/Context";

/**
 * Building block for creating a ValueHelp based on the provided OData V4 metadata.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:ValueHelp
 *   idPrefix="SomePrefix"
 *   property="{someProperty&gt;}"
 *   conditionModel="$filters"
 * /&gt;
 * </pre>
 *
 * @private
 */
@defineBuildingBlock({ name: "ValueHelp", namespace: "sap.fe.macros", fragment: "sap.fe.macros.internal.valuehelp.ValueHelp" })
export default class ValueHelpBlock extends BuildingBlockBase {
	/**
	 * A prefix that is added to the generated ID of the value help.
	 */
	@blockAttribute({ type: "string" })
	idPrefix = "ValueHelp";

	/**
	 * Defines the metadata path to the property.
	 */
	@blockAttribute({ type: "sap.ui.model.Context", required: true, expectedTypes: ["Property"] })
	property!: Context;

	@blockAttribute({ type: "sap.ui.model.Context", required: true })
	contextPath!: Context;

	/**
	 * Indicator whether the value help is for a filter field.
	 */
	@blockAttribute({ type: "string" })
	conditionModel = "";

	/**
	 * Indicates that this is a value help of a filter field. Necessary to decide if a
	 * validation should occur on the back end or already on the client.
	 */
	@blockAttribute({ type: "boolean" })
	filterFieldValueHelp = false;

	/**
	 * Specifies the Sematic Date Range option for the filter field.
	 */
	@blockAttribute({ type: "boolean" })
	useSemanticDateRange = true;

	/**
	 * Specifies whether the ValueHelp can be used with a MultiValueField
	 */
	@blockAttribute({ type: "boolean" })
	useMultiValueField = false;

	@blockAttribute({ type: "string" })
	navigationPrefix?: string;

	@blockAttribute({ type: "boolean" })
	requiresValidation = false;

	@blockAttribute({ type: "string" })
	// eslint-disable-next-line @typescript-eslint/naming-convention
	_flexId?: string;

	requestGroupId = "$auto.Workers";

	collaborationEnabled = false;

	constructor(props: PropertiesOf<ValueHelpBlock>) {
		super(props);

		const contextObject = getInvolvedDataModelObjects(this.contextPath);
		const entitySetOrSingleton = contextObject.targetEntitySet;
		if (isEntitySet(entitySetOrSingleton)) {
			this.collaborationEnabled = entitySetOrSingleton.annotations.Common?.DraftRoot?.ShareAction !== undefined;
		}
	}
}
