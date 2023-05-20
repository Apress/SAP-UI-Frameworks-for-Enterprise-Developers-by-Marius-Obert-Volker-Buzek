import CommonUtils from "sap/fe/core/CommonUtils";
import type IntentBasedNavigation from "sap/fe/core/controllerextensions/IntentBasedNavigation";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import type PageController from "sap/fe/core/PageController";
import SelectionVariant from "sap/fe/navigation/SelectionVariant";
import type Context from "sap/ui/model/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

const IntentBasedNavigationOverride = {
	adaptNavigationContext: function (this: IntentBasedNavigation, oSelectionVariant: any, oTargetInfo: any) {
		const oView = this.getView(),
			oController = oView.getController() as PageController,
			sMergeContext: String = oController.intentBasedNavigation.adaptContextPreparationStrategy(oTargetInfo),
			oInternalModelContext = this.getView().getBindingContext("internal") as InternalModelContext,
			oExternalNavigationContext = oInternalModelContext.getProperty("externalNavigationContext");
		const oAppComponent = CommonUtils.getAppComponent(oView);
		const oMetaModel = oAppComponent.getModel().getMetaModel() as ODataMetaModel;
		if (oExternalNavigationContext.page && sMergeContext === "default") {
			const oPageContext = oView.getBindingContext() as Context,
				sMetaPath = oMetaModel.getMetaPath(oPageContext.getPath());
			const oPageContextData = oController._intentBasedNavigation.removeSensitiveData(oPageContext.getObject(), sMetaPath),
				oPageData = oController._intentBasedNavigation.prepareContextForExternalNavigation(oPageContextData, oPageContext),
				oPagePropertiesWithoutConflict = oPageData.propertiesWithoutConflict,
				// TODO: move this also into the intent based navigation controller extension
				oPageSV: any = CommonUtils.addPageContextToSelectionVariant(new SelectionVariant(), oPageData.semanticAttributes, oView),
				oPropertiesWithoutConflict = oTargetInfo.propertiesWithoutConflict;
			const aSelectOptionPropertyNames = oPageSV.getSelectOptionsPropertyNames();
			aSelectOptionPropertyNames.forEach(function (sPropertyName: any) {
				if (!oSelectionVariant.getSelectOption(sPropertyName)) {
					oSelectionVariant.massAddSelectOption(sPropertyName, oPageSV.getSelectOption(sPropertyName));
				} else {
					// Only when there is no conflict do we need to add something
					// in all other case the conflicted paths are already added in prepareContextForExternalNavigation
					// if property was without conflict in incoming context then add path from incoming context to SV
					// TO-DO. Remove the check for oPropertiesWithoutConflict once semantic links functionality is covered
					if (oPropertiesWithoutConflict && sPropertyName in oPropertiesWithoutConflict) {
						oSelectionVariant.massAddSelectOption(
							oPropertiesWithoutConflict[sPropertyName],
							oSelectionVariant.getSelectOption(sPropertyName)
						);
					}
					// if property was without conflict in page context then add path from page context to SV
					if (sPropertyName in oPagePropertiesWithoutConflict) {
						oSelectionVariant.massAddSelectOption(
							oPagePropertiesWithoutConflict[sPropertyName],
							oPageSV.getSelectOption(sPropertyName)
						);
					}
				}
			});
			// remove non public properties from targetInfo
			delete oTargetInfo.propertiesWithoutConflict;
		}
		oInternalModelContext.setProperty("externalNavigationContext", { page: true });
	}
};

export default IntentBasedNavigationOverride;
