import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import kpiFormatters from "sap/fe/core/formatters/KPIFormatter";
import { formatResult, pathInModel, resolveBindingString } from "sap/fe/core/helpers/BindingToolkit";
import type Context from "sap/ui/model/odata/v4/Context";

/**
 * A building block used to display a KPI in the Analytical List Page
 *
 * @private
 * @experimental
 */
@defineBuildingBlock({
	name: "KPITag",
	namespace: "sap.fe.macros"
})
export default class KPITagBlock extends BuildingBlockBase {
	/**
	 * The ID of the KPI
	 */
	@blockAttribute({ type: "string", required: true })
	public id!: string;

	/**
	 * Path to the DataPoint annotation of the KPI
	 */
	@blockAttribute({ type: "sap.ui.model.Context", required: true })
	public metaPath!: Context;

	/**
	 * The name of the runtime model to get KPI properties from
	 */
	@blockAttribute({ type: "string", required: true })
	public kpiModelName!: string;

	/**
	 * Shall be true if the KPI value has an associated currency or unit of measure
	 */
	@blockAttribute({ type: "boolean", required: false })
	public hasUnit?: boolean;

	/**
	 * Creates a binding expression for a specific property in the KPI model.
	 *
	 * @param propertyName The property to bind to in the KPI model
	 * @returns A binding expression
	 */
	getKpiPropertyExpression(propertyName: string) {
		return pathInModel(`/${this.id}/manifest/sap.card/data/json/${propertyName}`, this.kpiModelName);
	}

	/**
	 * Creates binding expressions for the KPITag's text and tooltip.
	 *
	 * @returns Object containing the binding expressions for the text and the tooltip
	 */
	getBindingExpressions() {
		const kpiTitle = this.metaPath.getProperty("Title");

		if (!kpiTitle) {
			return { text: undefined, tooltip: undefined };
		}

		const titleExpression = resolveBindingString<string>(kpiTitle);
		return {
			text: formatResult([titleExpression], kpiFormatters.labelFormat),
			tooltip: formatResult(
				[
					titleExpression,
					this.getKpiPropertyExpression("mainValueUnscaled"),
					this.getKpiPropertyExpression("mainUnit"),
					this.getKpiPropertyExpression("mainCriticality"),
					String(this.hasUnit)
				],
				kpiFormatters.tooltipFormat
			)
		};
	}

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string
	 */
	getTemplate() {
		const { text, tooltip } = this.getBindingExpressions();

		return xml`<m:GenericTag
			id="kpiTag-${this.id}"
			text="${text}"
			design="StatusIconHidden"
			status="${this.getKpiPropertyExpression("mainCriticality")}"
			class="sapUiTinyMarginBegin"
			tooltip="${tooltip}"
			press=".kpiManagement.onKPIPressed(\${$source>},'${this.id}')"
		>
			<m:ObjectNumber
				state="${this.getKpiPropertyExpression("mainCriticality")}"
				emphasized="false"
				number="${this.getKpiPropertyExpression("mainValue")}"
				unit="${this.getKpiPropertyExpression("mainUnit")}"

			/>
		</m:GenericTag>`;
	}
}
