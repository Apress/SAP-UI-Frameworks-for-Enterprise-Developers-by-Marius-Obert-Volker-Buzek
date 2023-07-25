import type ViewState from "sap/fe/core/controllerextensions/ViewState";
import KeepAliveHelper from "sap/fe/core/helpers/KeepAliveHelper";
import CoreLibrary from "sap/fe/core/library";
import type ObjectPageController from "sap/fe/templates/ObjectPage/ObjectPageController.controller";
import type Control from "sap/ui/core/Control";

const VariantManagement = CoreLibrary.VariantManagement;

const ViewStateExtensionOverride = {
	applyInitialStateOnly: function () {
		return false;
	},
	adaptStateControls: function (this: ViewState, aStateControls: any) {
		const oView = this.getView(),
			oController = oView.getController(),
			oViewData = oView.getViewData() as any;
		let bControlVM = false;

		switch (oViewData.variantManagement) {
			case VariantManagement.Control:
				bControlVM = true;
				break;
			case VariantManagement.Page:
			case VariantManagement.None:
				break;
			default:
				throw new Error(`unhandled variant setting: ${oViewData.getVariantManagement()}`);
		}

		(oController as ObjectPageController)._findTables().forEach(function (oTable: any) {
			const oQuickFilter = oTable.getQuickFilter();
			if (oQuickFilter) {
				aStateControls.push(oQuickFilter);
			}
			if (bControlVM) {
				aStateControls.push(oTable.getVariant());
			}
			aStateControls.push(oTable);
		});

		(oController as ObjectPageController)._findCharts().forEach(function (oChart: any) {
			if (bControlVM) {
				aStateControls.push(oChart.getVariant());
			}
			aStateControls.push(oChart);
		});

		aStateControls.push(oView.byId("fe::ObjectPage"));
	},
	adaptBindingRefreshControls: function (this: ViewState, aControls: any) {
		const oView = this.getView(),
			sRefreshStrategy = KeepAliveHelper.getViewRefreshInfo(oView),
			oController = oView.getController();
		let aControlsToRefresh: Control[] = [];

		if (sRefreshStrategy) {
			const oObjectPageControl = (oController as ObjectPageController)._getObjectPageLayoutControl();
			aControlsToRefresh.push(oObjectPageControl);
		}
		if (sRefreshStrategy !== "includingDependents") {
			const aViewControls = (oController as ObjectPageController)._findTables();
			aControlsToRefresh = aControlsToRefresh.concat(KeepAliveHelper.getControlsForRefresh(oView, aViewControls) || []);
		}
		return aControlsToRefresh.reduce(function (aPrevControls: any, oControl: any) {
			if (aPrevControls.indexOf(oControl) === -1) {
				aPrevControls.push(oControl);
			}
			return aPrevControls;
		}, aControls);
	}
};

export default ViewStateExtensionOverride;
