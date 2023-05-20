import CommonUtils from "sap/fe/core/CommonUtils";
import type IntentBasedNavigation from "sap/fe/core/controllerextensions/IntentBasedNavigation";
import type ListReportController from "sap/fe/templates/ListReport/ListReportController.controller";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

const IntentBasedNavigationOverride = {
	adaptNavigationContext: function (this: IntentBasedNavigation, oSelectionVariant: any, oTargetInfo: any) {
		const oView = this.getView(),
			oController = oView.getController() as ListReportController,
			oFilterBar = oController._getFilterBarControl();
		// Adding filter bar values to the navigation does not make sense if no context has been selected.
		// Hence only consider filter bar values when SelectionVariant is not empty
		if (oFilterBar && !oSelectionVariant.isEmpty()) {
			const oViewData = oView.getViewData() as any,
				sRootPath = oViewData.fullContextPath;
			let oFilterBarConditions = Object.assign({}, (this.base.getView().getController() as any).filterBarConditions);
			let aParameters: any[] = [];

			if (oViewData.contextPath) {
				const oMetaModel = oView.getModel().getMetaModel() as ODataMetaModel,
					oParameterInfo = CommonUtils.getParameterInfo(oMetaModel, oViewData.contextPath),
					oParamProperties = oParameterInfo.parameterProperties;
				aParameters = (oParamProperties && Object.keys(oParamProperties)) || [];
			}

			oFilterBarConditions = oController._intentBasedNavigation.prepareFiltersForExternalNavigation(
				oFilterBarConditions,
				sRootPath,
				aParameters
			);

			const oMultipleModeControl = oController._getMultiModeControl();
			if (oMultipleModeControl) {
				// Do we need to exclude Fields (multi tables mode with multi entity sets)?
				const oTabsModel = oMultipleModeControl.getTabsModel();
				if (oTabsModel) {
					const aIgnoredFieldsForTab = oTabsModel.getProperty(
						`/${oMultipleModeControl.content?.getSelectedKey()}/notApplicable/fields`
					);
					if (Array.isArray(aIgnoredFieldsForTab) && aIgnoredFieldsForTab.length > 0) {
						aIgnoredFieldsForTab.forEach(function (sProperty: any) {
							delete oFilterBarConditions.filterConditions[sProperty];
						});
					}
				}
			}

			// TODO: move this also into the intent based navigation controller extension
			CommonUtils.addExternalStateFiltersToSelectionVariant(oSelectionVariant, oFilterBarConditions, oTargetInfo, oFilterBar);
			delete oTargetInfo.propertiesWithoutConflict;
		}
	},
	getEntitySet: function (this: IntentBasedNavigation) {
		return (this.base as any).getCurrentEntitySet();
	}
};

export default IntentBasedNavigationOverride;
