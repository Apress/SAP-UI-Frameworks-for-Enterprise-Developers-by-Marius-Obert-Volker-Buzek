import type InternalRouting from "sap/fe/core/controllerextensions/InternalRouting";
import { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import type ObjectPageController from "sap/fe/templates/ObjectPage/ObjectPageController.controller";
import Context from "sap/ui/model/odata/v4/Context";

const InternalRoutingExtension = {
	onBeforeBinding: function (this: InternalRouting, oContext: any, mParameters: any) {
		(this.getView().getController() as ObjectPageController)._onBeforeBinding(oContext, mParameters);
	},
	onAfterBinding: function (this: InternalRouting, oContext: any, mParameters: any) {
		(this.getView().getController() as ObjectPageController)._onAfterBinding(oContext, mParameters);
	},
	closeColumn: function (this: InternalRouting) {
		const internalModelContext = this.getView().getBindingContext("internal") as InternalModelContext;
		internalModelContext.setProperty("fclColumnClosed", true);
		const context = this.getView().getBindingContext() as Context;
		const path = (context && context.getPath()) || "";
		const metaModel = context.getModel().getMetaModel();
		const metaPath = metaModel.getMetaPath(path);

		const technicalKeys = metaModel.getObject(`${metaPath}/$Type/$Key`);
		const entry = context?.getObject();
		const technicalKeysObject: Record<string, unknown> = {};
		for (const key in technicalKeys) {
			const objKey = technicalKeys[key];
			if (!technicalKeysObject[objKey]) {
				technicalKeysObject[objKey] = entry[objKey];
			}
		}
		internalModelContext.setProperty("technicalKeysOfLastSeenRecord", technicalKeysObject);
	}
};

export default InternalRoutingExtension;
