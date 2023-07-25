import CommonHelper from "sap/fe/macros/CommonHelper";
import Table from "sap/fe/macros/table/TableHelper";
import { MenuButtonMode } from "sap/m/library";

const DefaultActionHandler = {
	/**
	 * The default action group handler that is invoked when adding the menu button handling appropriately.
	 *
	 * @param oCtx The current context in which the handler is called
	 * @param oAction The current action context
	 * @param oDataFieldForDefaultAction The current dataField for the default action
	 * @param defaultActionContextOrEntitySet The current context for the default action
	 * @param mode The optional parameter for the handler mode; default setting is Table
	 * @returns The appropriate expression string
	 */
	getDefaultActionHandler: function (
		oCtx: any,
		oAction: any,
		oDataFieldForDefaultAction: any,
		defaultActionContextOrEntitySet: any,
		mode = "Table"
	) {
		if (oAction.defaultAction) {
			try {
				switch (oAction.defaultAction.type) {
					case "ForAction": {
						if (mode === "Table") {
							return Table.pressEventDataFieldForActionButton(
								oCtx,
								oDataFieldForDefaultAction,
								oCtx.collection.getObject("@sapui.name"),
								oCtx.tableDefinition.operationAvailableMap,
								defaultActionContextOrEntitySet,
								oAction.isNavigable,
								oAction.enableAutoScroll,
								oAction.defaultValuesExtensionFunction
							);
						}
						return undefined;
					}
					case "ForNavigation": {
						if (mode === "Table") {
							return CommonHelper.getPressHandlerForDataFieldForIBN(
								oDataFieldForDefaultAction,
								"${internal>selectedContexts}",
								!oCtx.tableDefinition.enableAnalytics
							);
						}
						return undefined;
					}
					default: {
						if (oAction.defaultAction.command) {
							return "cmd:" + oAction.defaultAction.command;
						}
						if (oAction.defaultAction.noWrap) {
							return oAction.defaultAction.press;
						} else {
							switch (mode) {
								case "Table": {
									return CommonHelper.buildActionWrapper(oAction.defaultAction, oCtx);
								}
								case "Form": {
									return CommonHelper.buildActionWrapper(oAction.defaultAction, { id: "forTheForm" });
								}
							}
						}
					}
				}
			} catch (ioEx) {
				return "binding for the default action is not working as expected";
			}
		}
		return undefined;
	},

	/**
	 * The function determines during templating whether to use the defaultActionOnly
	 * setting for the sap.m.MenuButton control in case a defaultAction is provided.
	 *
	 * @param oAction The current action context
	 * @returns A Boolean value
	 */
	getUseDefaultActionOnly: function (oAction: any) {
		if (oAction.defaultAction) {
			return true;
		} else {
			return false;
		}
	},

	/**
	 * The function determines during templating whether to use the 'Split'
	 * or 'Regular' MenuButtonMode for the sap.m.MenuButton control
	 * in case a defaultAction is available.
	 *
	 * @param oAction The current action context
	 * @returns The MenuButtonMode
	 */
	getButtonMode: function (oAction: any) {
		if (oAction.defaultAction) {
			return MenuButtonMode.Split;
		} else {
			return MenuButtonMode.Regular;
		}
	}
};

export default DefaultActionHandler;
