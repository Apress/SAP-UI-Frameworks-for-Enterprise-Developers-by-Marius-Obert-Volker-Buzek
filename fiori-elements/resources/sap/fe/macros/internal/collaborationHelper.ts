import CommonUtils from "sap/fe/core/CommonUtils";
import CollaborationActivitySync from "sap/fe/core/controllerextensions/collaboration/ActivitySync";
import { Activity } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import Field from "sap/ui/mdc/Field";
import ValueHelp from "sap/ui/mdc/ValueHelp";

function getRelatedFieldFromValueHelp(oValueHelp: any): Field {
	const oView = CommonUtils.getTargetView(oValueHelp);
	return oView.findElements(true, function (oElem: Control) {
		return !!((oElem as Field).getFieldHelp && oElem.getDomRef() && (oElem as Field).getFieldHelp() === oValueHelp.getId());
	})[0] as Field;
}

function onValueHelpOpenDialog(oEvent: any) {
	const oValueHelp = oEvent.getSource();
	const oField = collaborationHelper.getRelatedFieldFromValueHelp(oValueHelp);
	const bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
	if (bCollaborationEnabled && oField.getBinding("value")) {
		const sFullPath = oField.getBinding("value")?.isA("sap.ui.model.CompositeBinding")
			? // for the compositeBinding, we just send a message containing the path of the first element
			  // it is enough to lock the entire field
			  `${oField.getBindingContext()?.getPath()}/${(oField.getBinding("value") as any)?.getBindings()[0].getPath()}`
			: `${oField.getBindingContext()?.getPath()}/${oField.getBinding("value")?.getPath()}`;
		CollaborationActivitySync.send(oField, Activity.LiveChange, sFullPath);
	}
}

function onValueHelpCloseDialog(oEvent: Event): Promise<void> {
	const oValueHelp = oEvent.getSource() as ValueHelp;
	const oField = collaborationHelper.getRelatedFieldFromValueHelp(oValueHelp);
	const bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
	const isCompositeBinding = oField.getBinding("value")?.isA("sap.ui.model.CompositeBinding");
	const oValueBeforeUpdate = isCompositeBinding ? oField.getValue()[1] : oField.getValue();

	return new Promise((resolve) => {
		setTimeout(function () {
			const value = isCompositeBinding
				? (oValueHelp.getConditions()[0] as any).values[0]
				: (oField.getBinding("value") as any)?.getValue();
			if (bCollaborationEnabled && oValueBeforeUpdate === value) {
				const sFullPath = isCompositeBinding
					? `${oField.getBindingContext()?.getPath()}/${(oField.getBinding("value") as any).getBindings()[0].getPath()}`
					: `${oField.getBindingContext()?.getPath()}/${oField.getBinding("value")?.getPath()}`;

				CollaborationActivitySync.send(oField, Activity.Undo, sFullPath);
			}
			resolve();
		}, 0);
	});
}

const collaborationHelper = {
	getRelatedFieldFromValueHelp,
	onValueHelpOpenDialog,
	onValueHelpCloseDialog
};

export default collaborationHelper;
