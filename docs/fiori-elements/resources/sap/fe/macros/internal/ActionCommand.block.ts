import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, blockEvent, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import type { ConverterAction } from "sap/fe/core/converters/controls/Common/Action";
/**
 * Content of an action command
 *
 * @private
 * @experimental
 */
@defineBuildingBlock({
	name: "ActionCommand",
	namespace: "sap.fe.macros.internal"
})
export default class ActionCommandBlock extends BuildingBlockBase {
	@blockAttribute({ type: "string", required: true })
	public id!: string;

	@blockAttribute({ type: "object", required: true })
	public action!: ConverterAction;

	@blockAttribute({ type: "boolean" })
	public isActionEnabled?: boolean;

	@blockAttribute({ type: "boolean" })
	public isIBNEnabled?: boolean;

	@blockAttribute({ type: "boolean" })
	public visible?: boolean;

	@blockEvent()
	onExecuteAction?: string;

	@blockEvent()
	onExecuteIBN?: string;

	@blockEvent()
	onExecuteManifest?: string;

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string
	 */
	getTemplate() {
		let execute;
		let enabled;
		switch (this.action.type) {
			case "ForAction":
				execute = this.onExecuteAction;
				enabled = this.isActionEnabled !== undefined ? this.isActionEnabled : this.action.enabled;
				break;
			case "ForNavigation":
				execute = this.onExecuteIBN;
				enabled = this.isIBNEnabled !== undefined ? this.isIBNEnabled : this.action.enabled;
				break;
			default:
				execute = this.onExecuteManifest;
				enabled = this.action.enabled;
				break;
		}
		return xml`
		<control:CommandExecution
			xmlns:control="sap.fe.core.controls"
			core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
			execute="${execute}"
			enabled="${enabled}"
			visible="${this.visible !== undefined ? this.visible : this.action.visible}"
			command="${this.action.command}"
		/>`;
	}
}
