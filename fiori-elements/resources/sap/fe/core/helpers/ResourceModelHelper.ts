import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Log from "sap/base/Log";
import AppComponent from "sap/fe/core/AppComponent";
import PageController from "sap/fe/core/PageController";
import ResourceModel from "sap/fe/core/ResourceModel";
import Control from "sap/ui/core/Control";
import Controller from "sap/ui/core/mvc/Controller";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";

/**
 * Determines the resource model for a given control, view, controller or appComponent.
 *
 * @param scope The control, view, controller or appComponent for which the resource model should be determined.
 * @returns The resource model
 */
export function getResourceModel(scope: Control | AppComponent | Controller | ControllerExtension): ResourceModel {
	if (scope.isA<Controller>("sap.ui.core.mvc.Controller") || scope.isA<ControllerExtension>("sap.ui.core.mvc.ControllerExtension")) {
		return scope.getView()?.getModel("sap.fe.i18n") as ResourceModel;
	} else {
		return scope.getModel("sap.fe.i18n") as ResourceModel;
	}
}

export function getLocalizedText(textOrToken: string, control: Control | AppComponent | PageController) {
	const matches = /{([A-Za-z0-9_.|@]+)>([A-Za-z0-9_.|]+)}/.exec(textOrToken);
	if (matches) {
		try {
			const resourceBundle = (control.getModel(matches[1]) as ResourceModel).getResourceBundle() as ResourceBundle;
			return resourceBundle.getText(matches[2]);
		} catch (e) {
			Log.info(`Unable to retrieve localized text ${textOrToken}`);
		}
	}
	return textOrToken;
}
