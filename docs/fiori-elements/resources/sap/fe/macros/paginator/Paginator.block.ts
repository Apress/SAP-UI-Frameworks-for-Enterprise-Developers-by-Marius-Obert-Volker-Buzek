import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { or, pathInModel } from "sap/fe/core/helpers/BindingToolkit";
import { generate } from "sap/fe/core/helpers/StableIdHelper";

/**
 * Building block used to create a paginator control.
 *
 * Usage example:
 * <pre>
 * &lt;macro:Paginator /&gt;
 * </pre>
 *
 * @hideconstructor
 * @public
 * @since 1.94.0
 */
@defineBuildingBlock({
	name: "Paginator",
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros"
})
export default class PaginatorBlock extends BuildingBlockBase {
	/**
	 * The identifier of the Paginator control.
	 */
	@blockAttribute({ type: "string", isPublic: true })
	public id = "";

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string
	 */
	getTemplate() {
		// The model name is hardcoded, as this building block can also be used transparently by application developers
		const navUpEnabledExpression = pathInModel("/navUpEnabled", "paginator");
		const navDownEnabledExpression = pathInModel("/navDownEnabled", "paginator");
		const visibleExpression = or(navUpEnabledExpression, navDownEnabledExpression);

		const navUpTooltipExpression = pathInModel("T_PAGINATOR_CONTROL_PAGINATOR_TOOLTIP_UP", "sap.fe.i18n");
		const navDownTooltipExpression = pathInModel("T_PAGINATOR_CONTROL_PAGINATOR_TOOLTIP_DOWN", "sap.fe.i18n");

		return xml`
			<m:HBox displayInline="true" id="${this.id}" visible="${visibleExpression}">
				<uxap:ObjectPageHeaderActionButton
					xmlns:uxap="sap.uxap"
					id="${generate([this.id, "previousItem"])}"
					enabled="${navUpEnabledExpression}"
					tooltip="${navUpTooltipExpression}"
					icon="sap-icon://navigation-up-arrow"
					press=".paginator.updateCurrentContext(-1)"
					type="Transparent"
					importance="High"
				/>
				<uxap:ObjectPageHeaderActionButton
					xmlns:uxap="sap.uxap"
					id="${generate([this.id, "nextItem"])}"
					enabled="${navDownEnabledExpression}"
					tooltip="${navDownTooltipExpression}"
					icon="sap-icon://navigation-down-arrow"
					press=".paginator.updateCurrentContext(1)"
					type="Transparent"
					importance="High"
				/>
			</m:HBox>`;
	}
}
