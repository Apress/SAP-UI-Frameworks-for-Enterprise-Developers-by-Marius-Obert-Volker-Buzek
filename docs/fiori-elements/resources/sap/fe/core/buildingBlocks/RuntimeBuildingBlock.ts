import type AppComponent from "sap/fe/core/AppComponent";
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import type { XMLProcessorTypeValue } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { registerBuildingBlock, xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { storeRuntimeBlock } from "sap/fe/core/buildingBlocks/RuntimeBuildingBlockFragment";
import { isContext } from "sap/fe/core/helpers/TypeGuards";
import type Control from "sap/ui/core/Control";
import type View from "sap/ui/core/mvc/View";

/**
 * Base class for runtime building blocks
 */
export default class RuntimeBuildingBlock extends BuildingBlockBase {
	public static readonly isRuntime = true;

	getContent?(containingView: View, appComponent: AppComponent): Control | undefined;

	static register() {
		registerBuildingBlock(this);
		storeRuntimeBlock(this);
	}

	public getTemplate(oNode?: Element): string | Promise<string | undefined> | undefined {
		const metadata = (this.constructor as typeof BuildingBlockBase).metadata;

		const className = `${metadata.namespace ?? metadata.publicNamespace}.${metadata.name}`;
		const extraProps = [];
		// Function are defined as string but need to be resolved by UI5, as such we store them in an `event` property and will redispatch them later
		const functionHolderDefinition = [];
		const propertiesAssignedToFunction = [];
		const functionStringInOrder = [];
		for (const propertiesKey in metadata.properties) {
			let propertyValue = this[propertiesKey as keyof this] as unknown as XMLProcessorTypeValue;
			if (propertyValue !== undefined && propertyValue !== null) {
				if (isContext(propertyValue)) {
					propertyValue = propertyValue.getPath();
				}
				if (metadata.properties[propertiesKey].type === "function") {
					functionHolderDefinition.push(propertyValue);
					functionStringInOrder.push(propertyValue);
					propertiesAssignedToFunction.push(propertiesKey);
				} else {
					extraProps.push(xml`feBB:${propertiesKey}="${propertyValue}"`);
				}
			}
		}
		if (functionHolderDefinition.length > 0) {
			extraProps.push(xml`functionHolder="${functionHolderDefinition.join(";")}"`);
			extraProps.push(xml`feBB:functionStringInOrder="${functionStringInOrder.join(",")}"`);
			extraProps.push(xml`feBB:propertiesAssignedToFunction="${propertiesAssignedToFunction.join(",")}"`);
		}
		// core:require need to be defined on the node itself to be picked up due to the templating step
		const coreRequire = oNode?.getAttribute("core:require") || undefined;
		if (coreRequire) {
			extraProps.push(xml`core:require="${coreRequire}"`);
		}
		return xml`<feBB:RuntimeBuildingBlockFragment
					xmlns:core="sap.ui.core"
					xmlns:feBB="sap.fe.core.buildingBlocks"
					fragmentName="${className}"

					id="{this>id}"
					type="FE_COMPONENTS"
					${extraProps}
				>
				</feBB:RuntimeBuildingBlockFragment>`;
	}
}
