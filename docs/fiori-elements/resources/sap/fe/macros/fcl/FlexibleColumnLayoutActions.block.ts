import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";

@defineBuildingBlock({ name: "FlexibleColumnLayoutActions", namespace: "sap.fe.macros.fcl", publicNamespace: "sap.fe.macros" })
export default class FlexibleColumnLayoutActionsBlock extends BuildingBlockBase {
	getTemplate() {
		return xml`
            <m:OverflowToolbarButton
                id="fe::FCLStandardAction::FullScreen"
                type="Transparent"
                icon="{fclhelper>/actionButtonsInfo/switchIcon}"
                visible="{fclhelper>/actionButtonsInfo/switchVisible}"
                press="._routing.switchFullScreen()"
            />
            <m:OverflowToolbarButton
                id="fe::FCLStandardAction::Close"
                type="Transparent"
                icon="sap-icon://decline"
                tooltip="{sap.fe.i18n>C_COMMON_SAPFE_CLOSE}"
                visible="{fclhelper>/actionButtonsInfo/closeVisible}"
                press="._routing.closeColumn()"
            />`;
	}
}
