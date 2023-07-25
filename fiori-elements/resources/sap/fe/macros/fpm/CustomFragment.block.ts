import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import Context from "sap/ui/model/Context";

/**
 * Content of a custom fragment
 *
 * @private
 * @experimental
 */
@defineBuildingBlock({
	name: "CustomFragment",
	namespace: "sap.fe.macros.fpm"
})
export default class CustomFragmentBlock extends BuildingBlockBase {
	/**
	 * ID of the custom fragment
	 */
	@blockAttribute({ type: "string", required: true })
	public id!: string;

	/**
	 * Context Path
	 */
	@blockAttribute({ type: "sap.ui.model.Context", required: false })
	public contextPath?: Context;

	/**
	 *  Name of the custom fragment
	 */
	@blockAttribute({ type: "string", required: true })
	public fragmentName!: string;

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string
	 */
	getTemplate() {
		const fragmentInstanceName = this.fragmentName + "-JS".replace(/\//g, ".");

		return xml`<core:Fragment
			xmlns:compo="http://schemas.sap.com/sapui5/extension/sap.ui.core.xmlcomposite/1"
			fragmentName="${fragmentInstanceName}"
			id="${this.id}"
			type="CUSTOM"
		>
			<compo:fragmentContent>
				<core:FragmentDefinition>
					<core:Fragment fragmentName="${this.fragmentName}" type="XML" />
				</core:FragmentDefinition>
			</compo:fragmentContent>
		</core:Fragment>`;
	}
}
