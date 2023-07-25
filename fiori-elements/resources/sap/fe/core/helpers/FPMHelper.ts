import ObjectPath from "sap/base/util/ObjectPath";
import CommonUtils from "sap/fe/core/CommonUtils";
import type ExtensionAPI from "sap/fe/core/ExtensionAPI";
import type PageController from "sap/fe/core/PageController";
import type Context from "sap/ui/model/Context";

const FPMHelper = {
	actionWrapper: function (oEvent: any, sModule: any, sMethod: any, oParameters: any) {
		return new Promise(function (resolve: (value: any) => void) {
			//The source would be command execution, in case a command is defined for the action in the manifest.
			const oSource = oEvent.getSource ? oEvent.getSource() : oEvent.oSource,
				oView = CommonUtils.getTargetView(oSource),
				oBindingContext = oSource.getBindingContext();
			let oExtensionAPI: ExtensionAPI | undefined;
			let aSelectedContexts: Context[];

			if (oParameters !== undefined) {
				aSelectedContexts = oParameters.contexts || [];
			} else if (oBindingContext !== undefined) {
				aSelectedContexts = [oBindingContext];
			} else {
				aSelectedContexts = [];
			}

			if (
				oView.getControllerName() === "sap.fe.templates.ObjectPage.ObjectPageController" ||
				oView.getControllerName() === "sap.fe.templates.ListReport.ListReportController"
			) {
				oExtensionAPI = (oView.getController() as PageController).getExtensionAPI();
			}

			if (sModule.startsWith("/extension/")) {
				const fnTarget = ObjectPath.get(sModule.replace(/\//g, ".").substr(1), oExtensionAPI);
				resolve(fnTarget[sMethod](oBindingContext, aSelectedContexts));
			} else {
				sap.ui.require([sModule], function (module: any) {
					// - we bind the action to the extensionAPI of the controller so it has the same scope as a custom section
					// - we provide the context as API, maybe if needed further properties
					resolve(module[sMethod].bind(oExtensionAPI)(oBindingContext, aSelectedContexts));
				});
			}
		});
	},
	validationWrapper: function (sModule: any, sMethod: any, oValidationContexts: any, oView: any, oBindingContext: any) {
		return new Promise(function (resolve: (value: any) => void) {
			let oExtensionAPI: ExtensionAPI;

			if (
				oView.getControllerName() === "sap.fe.templates.ObjectPage.ObjectPageController" ||
				oView.getControllerName() === "sap.fe.templates.ListReport.ListReportController"
			) {
				oExtensionAPI = oView.getController().getExtensionAPI();
			}

			sap.ui.require([sModule], function (module: any) {
				// - we bind the action to the extensionAPI of the controller so it has the same scope as a custom section
				// - we provide the context as API, maybe if needed further properties
				resolve(module[sMethod].bind(oExtensionAPI)(oBindingContext, oValidationContexts));
			});
		});
	}
};

export default FPMHelper;
