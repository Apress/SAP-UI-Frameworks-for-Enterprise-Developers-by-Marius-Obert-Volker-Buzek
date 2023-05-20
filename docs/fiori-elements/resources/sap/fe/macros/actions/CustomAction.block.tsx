import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import RuntimeBuildingBlock from "sap/fe/core/buildingBlocks/RuntimeBuildingBlock";
import CommandExecution from "sap/fe/core/controls/CommandExecution";
import type { CustomAction } from "sap/fe/core/converters/controls/Common/Action";
import FPMHelper from "sap/fe/core/helpers/FPMHelper";
import Button from "sap/m/Button";

@defineBuildingBlock({ name: "CustomAction", namespace: "sap.fe.macros.actions" })
export default class CustomActionBlock extends RuntimeBuildingBlock {
	@blockAttribute({ type: "object", required: true })
	action!: CustomAction;

	@blockAttribute({
		type: "string",
		required: true
	})
	id!: string;

	getContent() {
		return (
			<Button
				id={this.id}
				text={this.action.text ?? ""}
				press={
					this.action.command
						? CommandExecution.executeCommand(this.action.command)
						: async (event) => FPMHelper.actionWrapper(event, this.action.handlerModule, this.action.handlerMethod, {})
				}
				type="Transparent"
				visible={this.action.visible}
				enabled={this.action.enabled}
			/>
		) as Button;
	}
}
