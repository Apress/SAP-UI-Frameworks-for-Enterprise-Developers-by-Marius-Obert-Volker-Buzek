import Log from "sap/base/Log";
import type Share from "sap/fe/core/controllerextensions/Share";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import SemanticKeyHelper from "sap/fe/core/helpers/SemanticKeyHelper";
import type ObjectPageController from "sap/fe/templates/ObjectPage/ObjectPageController.controller";
import HashChanger from "sap/ui/core/routing/HashChanger";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";

let bGlobalIsStickySupported: boolean;

function createFilterToFetchActiveContext(mKeyValues: any, bIsActiveEntityDefined: any) {
	const aKeys = Object.keys(mKeyValues);

	const aFilters = aKeys.map(function (sKey: string) {
		const sValue = mKeyValues[sKey];
		if (sValue !== undefined) {
			return new Filter(sKey, FilterOperator.EQ, sValue);
		}
	});

	if (bIsActiveEntityDefined) {
		const oActiveFilter = new Filter({
			filters: [new Filter("SiblingEntity/IsActiveEntity", FilterOperator.EQ, true)],
			and: false
		});

		aFilters.push(oActiveFilter);
	}

	return new Filter(aFilters as any, true);
}
function getActiveContextPath(oController: any, sPageEntityName: any, oFilter: any) {
	const oListBinding = oController
		.getView()
		.getBindingContext()
		.getModel()
		.bindList(`/${sPageEntityName}`, undefined, undefined, oFilter, { $$groupId: "$auto.Heroes" });
	return oListBinding.requestContexts(0, 2).then(function (oContexts: any) {
		if (oContexts && oContexts.length) {
			return oContexts[0].getPath();
		}
	});
}
function getActiveContextInstances(oContext: any, oController: any, oEntitySet: any) {
	const aActiveContextpromises: any[] = [];
	const aPages: any[] = [];
	let sMetaPath = oContext.getModel().getMetaModel().getMetaPath(oContext.getPath());
	if (sMetaPath.indexOf("/") === 0) {
		sMetaPath = sMetaPath.substring(1);
	}
	const aMetaPathArray = sMetaPath.split("/");
	const sCurrentHashNoParams = HashChanger.getInstance().getHash().split("?")[0];
	const aCurrentHashArray = sCurrentHashNoParams.split("/");

	// oPageMap - creating an object that contains map of metapath name and it's technical details
	// which is required to create a filter to fetch the relavant/correct active context
	// Example: {SalesOrderManage:{technicalID:technicalIDValue}, _Item:{technicalID:technicalIDValue}} etc.,
	const oPageMap: any = {};
	const aPageHashArray: any[] = [];
	aCurrentHashArray.forEach(function (sPageHash: any) {
		const aKeyValues = sPageHash.substring(sPageHash.indexOf("(") + 1, sPageHash.length - 1).split(",");
		const mKeyValues: any = {};
		const sPageHashName = sPageHash.split("(")[0];
		oPageMap[sPageHashName] = {};
		aPageHashArray.push(sPageHashName);
		oPageMap[sPageHashName]["bIsActiveEntityDefined"] = true;
		for (let i = 0; i < aKeyValues.length; i++) {
			const sKeyAssignment = aKeyValues[i];
			const aParts = sKeyAssignment.split("=");
			let sKeyValue = aParts[1];
			let sKey = aParts[0];
			// In case if only one technical key is defined then the url just contains the technicalIDValue but not the technicalID
			// Example: SalesOrderManage(ID=11111129-aaaa-bbbb-cccc-ddddeeeeffff,IsActiveEntity=false)/_Item(11111129-aaaa-bbbb-cccc-ddddeeeeffff)
			// In above example SalesOrderItem has only one technical key defined, hence technicalID info is not present in the url
			// Hence in such cases we get technical key and use them to fetch active context
			if (sKeyAssignment.indexOf("=") === -1) {
				const oMetaModel = oContext.getModel().getMetaModel();
				const aTechnicalKeys = oMetaModel.getObject(`/${aPageHashArray.join("/")}/$Type/$Key`);
				sKeyValue = aParts[0];
				sKey = aTechnicalKeys[0];
				oPageMap[sPageHash.split("(")[0]]["bIsActiveEntityDefined"] = false;
			}

			if (sKey !== "IsActiveEntity") {
				if (sKeyValue.indexOf("'") === 0 && sKeyValue.lastIndexOf("'") === sKeyValue.length - 1) {
					// Remove the quotes from the value and decode special chars
					sKeyValue = decodeURIComponent(sKeyValue.substring(1, sKeyValue.length - 1));
				}
				mKeyValues[sKey] = sKeyValue;
			}
		}
		oPageMap[sPageHashName].mKeyValues = mKeyValues;
	});

	let oPageEntitySet = oEntitySet;
	aMetaPathArray.forEach(function (sNavigationPath: any) {
		const oPageInfo: any = {};
		const sPageEntitySetName = oPageEntitySet.$NavigationPropertyBinding && oPageEntitySet.$NavigationPropertyBinding[sNavigationPath];
		if (sPageEntitySetName) {
			oPageInfo.pageEntityName = oPageEntitySet.$NavigationPropertyBinding[sNavigationPath];
			oPageEntitySet = oContext.getModel().getMetaModel().getObject(`/${sPageEntitySetName}`) || oEntitySet;
		} else {
			oPageInfo.pageEntityName = sNavigationPath;
		}
		oPageInfo.mKeyValues = oPageMap[sNavigationPath].mKeyValues;
		oPageInfo.bIsActiveEntityDefined = oPageMap[sNavigationPath].bIsActiveEntityDefined;
		aPages.push(oPageInfo);
	});

	aPages.forEach(function (oPageInfo: any) {
		const oFilter = createFilterToFetchActiveContext(oPageInfo.mKeyValues, oPageInfo.bIsActiveEntityDefined);
		aActiveContextpromises.push(getActiveContextPath(oController, oPageInfo.pageEntityName, oFilter));
	});

	return aActiveContextpromises;
}

/**
 * Method to fetch active context path's.
 *
 * @param oContext The Page Context
 * @param oController
 * @returns Promise which is resolved once the active context's are fetched
 */
function getActiveContextPaths(oContext: any, oController: any) {
	const sCurrentHashNoParams = HashChanger.getInstance().getHash().split("?")[0];
	let sRootEntityName = sCurrentHashNoParams && sCurrentHashNoParams.substr(0, sCurrentHashNoParams.indexOf("("));
	if (sRootEntityName.indexOf("/") === 0) {
		sRootEntityName = sRootEntityName.substring(1);
	}
	const oEntitySet = oContext.getModel().getMetaModel().getObject(`/${sRootEntityName}`);
	const oPageContext = oContext;
	const aActiveContextpromises = getActiveContextInstances(oContext, oController, oEntitySet);
	if (aActiveContextpromises.length > 0) {
		return Promise.all(aActiveContextpromises)
			.then(function (aData: any[]) {
				const aActiveContextPaths = [];
				let oPageEntitySet = oEntitySet;
				if (aData[0].indexOf("/") === 0) {
					aActiveContextPaths.push(aData[0].substring(1));
				} else {
					aActiveContextPaths.push(aData[0]);
				}
				// In the active context paths identify and replace the entitySet Name with corresponding navigation property name
				// Required to form the url pointing to active context
				// Example : SalesOrderItem --> _Item, MaterialDetails --> _MaterialDetails etc.,
				for (let i = 1; i < aData.length; i++) {
					let sActiveContextPath = aData[i];
					let sNavigatioProperty = "";
					let sEntitySetName = sActiveContextPath && sActiveContextPath.substr(0, sActiveContextPath.indexOf("("));
					if (sEntitySetName.indexOf("/") === 0) {
						sEntitySetName = sEntitySetName.substring(1);
					}
					if (sActiveContextPath.indexOf("/") === 0) {
						sActiveContextPath = sActiveContextPath.substring(1);
					}
					sNavigatioProperty = Object.keys(oPageEntitySet.$NavigationPropertyBinding)[
						Object.values(oPageEntitySet.$NavigationPropertyBinding).indexOf(sEntitySetName)
					];
					if (sNavigatioProperty) {
						aActiveContextPaths.push(sActiveContextPath.replace(sEntitySetName, sNavigatioProperty));
						oPageEntitySet = oPageContext.getModel().getMetaModel().getObject(`/${sEntitySetName}`) || oEntitySet;
					} else {
						aActiveContextPaths.push(sActiveContextPath);
					}
				}
				return aActiveContextPaths;
			})
			.catch(function (oError: any) {
				Log.info("Failed to retrieve one or more active context path's", oError);
			});
	} else {
		return Promise.resolve();
	}
}
function fetchActiveContextPaths(oContext: any, oController: any) {
	let oPromise, aSemanticKeys;
	const sCurrentHashNoParams = HashChanger.getInstance().getHash().split("?")[0];
	if (oContext) {
		const oModel = oContext.getModel();
		const oMetaModel = oModel.getMetaModel();
		bGlobalIsStickySupported = ModelHelper.isStickySessionSupported(oMetaModel);
		let sRootEntityName = sCurrentHashNoParams && sCurrentHashNoParams.substr(0, sCurrentHashNoParams.indexOf("("));
		if (sRootEntityName.indexOf("/") === 0) {
			sRootEntityName = sRootEntityName.substring(1);
		}
		aSemanticKeys = SemanticKeyHelper.getSemanticKeys(oMetaModel, sRootEntityName);
	}
	// Fetch active context details incase of below scenario's(where page is not sticky supported(we do not have draft instance))
	// 1. In case of draft enabled Object page where semantic key based URL is not possible(like semantic keys are not modeled in the entity set)
	// 2. In case of draft enabled Sub Object Pages (where semantic bookmarking is not supported)
	const oViewData = oController.getView().getViewData();
	if (oContext && !bGlobalIsStickySupported && ((oViewData.viewLevel === 1 && !aSemanticKeys) || oViewData.viewLevel >= 2)) {
		oPromise = getActiveContextPaths(oContext, oController);
		return oPromise;
	} else {
		return Promise.resolve();
	}
}

// /**
//  * Get share URL.
//  * @param bIsEditable
//  * @param bIsStickySupported
//  * @param aActiveContextPaths
//  * @returns {string} The share URL
//  * @protected
//  * @static
//  */
function getShareUrl(bIsEditable: any, bIsStickySupported: any, aActiveContextPaths: any) {
	let sShareUrl;
	const sHash = HashChanger.getInstance().getHash();
	const sBasePath = (HashChanger.getInstance() as any).hrefForAppSpecificHash
		? (HashChanger.getInstance() as any).hrefForAppSpecificHash("")
		: "";
	if (bIsEditable && !bIsStickySupported && aActiveContextPaths) {
		sShareUrl = sBasePath + aActiveContextPaths.join("/");
	} else {
		sShareUrl = sHash ? sBasePath + sHash : window.location.hash;
	}
	return window.location.origin + window.location.pathname + window.location.search + sShareUrl;
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

function getJamUrl(bIsEditMode: boolean, bIsStickySupported: any, aActiveContextPaths: any) {
	let sJamUrl: string;
	const sHash = HashChanger.getInstance().getHash();
	const sBasePath = (HashChanger.getInstance() as any).hrefForAppSpecificHash
		? (HashChanger.getInstance() as any).hrefForAppSpecificHash("")
		: "";
	if (bIsEditMode && !bIsStickySupported && aActiveContextPaths) {
		sJamUrl = sBasePath + aActiveContextPaths.join("/");
	} else {
		sJamUrl = sHash ? sBasePath + sHash : window.location.hash;
	}
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
		return Promise.resolve(window.location.origin + window.location.pathname + sJamUrl);
	}
}

const ShareExtensionOverride = {
	adaptShareMetadata: async function (this: Share, oShareMetadata: any) {
		const oContext = this.base.getView().getBindingContext();
		const oUIModel = this.base.getView().getModel("ui");
		const bIsEditable = oUIModel.getProperty("/isEditable");

		try {
			const aActiveContextPaths = await fetchActiveContextPaths(oContext, this.base.getView().getController());
			const oPageTitleInfo = (this.base.getView().getController() as ObjectPageController)._getPageTitleInformation();
			const oData = await Promise.all([
				getJamUrl(bIsEditable, bGlobalIsStickySupported, aActiveContextPaths),
				getShareUrl(bIsEditable, bGlobalIsStickySupported, aActiveContextPaths),
				getShareEmailUrl()
			]);

			let sTitle = oPageTitleInfo.title;
			const sObjectSubtitle = oPageTitleInfo.subtitle ? oPageTitleInfo.subtitle.toString() : "";
			if (sObjectSubtitle) {
				sTitle = `${sTitle} - ${sObjectSubtitle}`;
			}
			oShareMetadata.tile = {
				title: oPageTitleInfo.title,
				subtitle: sObjectSubtitle
			};
			oShareMetadata.email.title = sTitle;
			oShareMetadata.title = sTitle;
			oShareMetadata.jam.url = oData[0];
			oShareMetadata.url = oData[1];
			oShareMetadata.email.url = oData[2];
			// MS Teams collaboration does not want to allow further changes to the URL
			// so update colloborationInfo model at LR override to ignore further extension changes at multiple levels
			const collaborationInfoModel: JSONModel = this.base.getView().getModel("collaborationInfo") as JSONModel;
			collaborationInfoModel.setProperty("/url", oShareMetadata.url);
			collaborationInfoModel.setProperty("/appTitle", oShareMetadata.title);
			collaborationInfoModel.setProperty("/subTitle", sObjectSubtitle);
		} catch (error: any) {
			Log.error(error);
		}

		return oShareMetadata;
	}
};

export default ShareExtensionOverride;
