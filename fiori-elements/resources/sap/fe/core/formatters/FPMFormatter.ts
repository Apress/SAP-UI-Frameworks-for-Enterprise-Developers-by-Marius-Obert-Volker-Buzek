import PageController from "sap/fe/core/PageController";
import type ManagedObject from "sap/ui/base/ManagedObject";
import type View from "sap/ui/core/mvc/View";
import type Context from "sap/ui/model/odata/v4/Context";

const customBooleanPropertyCheck = function (
	this: ManagedObject,
	oView: View,
	modulePath: string,
	aSelectedContexts: Context[]
): Promise<boolean> {
	const oExtensionAPI = (oView.getController() as PageController).getExtensionAPI();
	const parts = modulePath.split(".");
	const methodName = parts.pop() as string;
	const moduleName = parts.join("/");

	return new Promise((resolve) => {
		sap.ui.require([moduleName], (module: any) => {
			resolve(module[methodName].bind(oExtensionAPI)(this.getBindingContext(), aSelectedContexts || []));
		});
	});
};
customBooleanPropertyCheck.__functionName = "sap.fe.core.formatters.FPMFormatter#customBooleanPropertyCheck";

/**
 * Collection of table formatters.
 *
 * @param this The context
 * @param sName The inner function name
 * @param oArgs The inner function parameters
 * @returns The value from the inner function
 */
const fpmFormatter = function (this: object, sName: string, ...oArgs: any[]): any {
	if (fpmFormatter.hasOwnProperty(sName)) {
		return (fpmFormatter as any)[sName].apply(this, oArgs);
	} else {
		return "";
	}
};

fpmFormatter.customBooleanPropertyCheck = customBooleanPropertyCheck;

/**
 * @global
 */
export default fpmFormatter;
