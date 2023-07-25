import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import type Share from "sap/fe/core/controllerextensions/Share";
import SemanticDateOperators from "sap/fe/core/helpers/SemanticDateOperators";
import HashChanger from "sap/ui/core/routing/HashChanger";
import JSONModel from "sap/ui/model/json/JSONModel";
import ListReportController from "../ListReportController.controller";
function getCountUrl(oController: ListReportController) {
	const oTable = oController._getTable?.();
	if (!oTable) {
		return "";
	}
	const oBinding = oTable.getRowBinding() || oTable.getBinding("items");
	const sDownloadUrl = (oBinding && (oBinding as any).getDownloadUrl()) || "";
	const aSplitUrl = sDownloadUrl.split("?");
	const baseUrl = `${aSplitUrl[0]}/$count?`;
	// getDownloadUrl() returns url with $select, $expand which is not supported when /$count is used to get the record count. only $apply, $search, $filter is supported
	// ?$count=true returns count in a format which is not supported by FLP yet.
	// currently supported format for v4 is ../count.. only (where tile preview will still not work)
	const aSupportedParams: any[] = [];
	if (aSplitUrl.length > 1) {
		const urlParams = aSplitUrl[1];
		urlParams.split("&").forEach(function (urlParam: any) {
			const aUrlParamParts = urlParam.split("=");
			switch (aUrlParamParts[0]) {
				case "$apply":
				case "$search":
				case "$filter":
					aSupportedParams.push(urlParam);
			}
		});
	}
	return baseUrl + aSupportedParams.join("&");
}

function getShareEmailUrl() {
	const oUShellContainer = sap.ushell && sap.ushell.Container;
	if (oUShellContainer) {
		return oUShellContainer
			.getFLPUrlAsync(true)
			.then(function (sFLPUrl: any) {
				return sFLPUrl;
			})
			.catch(function (sError: any) {
				Log.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)", sError);
			});
	} else {
		return Promise.resolve(document.URL);
	}
}
function getSaveAsTileServiceUrl(oController: any) {
	const oFilterBar = oController._getFilterBarControl();
	if (oFilterBar) {
		const oConditions = oFilterBar.getFilterConditions();
		const bSaveAsTileServiceUrlAllowed = SemanticDateOperators.hasSemanticDateOperations(oConditions);
		if (bSaveAsTileServiceUrlAllowed) {
			return getCountUrl(oController);
		}
	}
	return "";
}
function getJamUrl() {
	const sHash = HashChanger.getInstance().getHash();
	const sBasePath = (HashChanger.getInstance() as any).hrefForAppSpecificHash
		? (HashChanger.getInstance() as any).hrefForAppSpecificHash("")
		: "";
	const sJamUrl = sHash ? sBasePath + sHash : window.location.hash;
	// in case we are in cFLP scenario, the application is running
	// inside an iframe, and there for we need to get the cFLP URL
	// and not 'document.URL' that represents the iframe URL
	if (sap.ushell && sap.ushell.Container && sap.ushell.Container.runningInIframe && sap.ushell.Container.runningInIframe()) {
		sap.ushell.Container.getFLPUrl(true)
			.then(function (sUrl: any) {
				return sUrl.substr(0, sUrl.indexOf("#")) + sJamUrl;
			})
			.catch(function (sError: any) {
				Log.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)", sError);
			});
	} else {
		return window.location.origin + window.location.pathname + sJamUrl;
	}
}

const ShareOverride = {
	adaptShareMetadata: function (this: Share, oShareMetadata: any) {
		Promise.resolve(getJamUrl())
			.then((sJamUrl: string | undefined) => {
				const oAppComponent = CommonUtils.getAppComponent(this.base.getView());
				const oMetadata = oAppComponent.getMetadata();
				const oUIManifest = oMetadata.getManifestEntry("sap.ui");
				const sIcon = (oUIManifest && oUIManifest.icons && oUIManifest.icons.icon) || "";
				const oAppManifest = oMetadata.getManifestEntry("sap.app");
				const sTitle = (oAppManifest && oAppManifest.title) || "";
				// TODO: check if there is any semantic date used before adding serviceURL as BLI:FIORITECHP1-18023
				oShareMetadata.tile = {
					icon: sIcon,
					title: sTitle,
					queryUrl: getSaveAsTileServiceUrl(this.base.getView().getController())
				};
				oShareMetadata.title = document.title;
				oShareMetadata.jam.url = sJamUrl;
				// MS Teams collaboration does not want to allow further changes to the URL
				// so update colloborationInfo model at LR override to ignore further extension changes at multiple levels
				const collaborationInfoModel: JSONModel = this.base.getView().getModel("collaborationInfo") as JSONModel;
				collaborationInfoModel.setProperty("/url", oShareMetadata.url);
				collaborationInfoModel.setProperty("/appTitle", oShareMetadata.title);
			})
			.catch(function (error: any) {
				Log.error(error);
			});

		return Promise.resolve(getShareEmailUrl()).then(function (sFLPUrl: any) {
			oShareMetadata.email.url = sFLPUrl;
			return oShareMetadata;
		});
	}
};

export default ShareOverride;
