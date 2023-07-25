import Log from "sap/base/Log";
import deepEqual from "sap/base/util/deepEqual";
import type AppComponent from "sap/fe/core/AppComponent";
import type { NavigationParameter } from "sap/fe/core/controllerextensions/ViewState";
import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import toES6Promise from "sap/fe/core/helpers/ToES6Promise";
import library from "sap/fe/navigation/library";
import BaseObject from "sap/ui/base/Object";
import type View from "sap/ui/core/mvc/View";
import type Context from "sap/ui/model/odata/v4/Context";
import BusyLocker from "./controllerextensions/BusyLocker";
import ModelHelper from "./helpers/ModelHelper";

const NavType = library.NavType;
type AppState = Record<string, unknown>;
type AppData = {
	oDefaultedSelectionVariant: object;
	oSelectionVariant: object;
	bNavSelVarHasDefaultsOnly: boolean;
	appState: AppState;
};

@defineUI5Class("sap.fe.core.AppStateHandler")
class AppStateHandler extends BaseObject {
	public sId: string;

	public oAppComponent: AppComponent;

	public bNoRouteChange: boolean;

	private _mCurrentAppState?: AppState = {};

	nbSimultaneousCreateRequest: number;

	constructor(oAppComponent: AppComponent) {
		super();
		this.oAppComponent = oAppComponent;
		this.sId = `${oAppComponent.getId()}/AppStateHandler`;
		this.nbSimultaneousCreateRequest = 0;
		this.bNoRouteChange = false;
		Log.info("APPSTATE : Appstate handler initialized");
	}

	getId() {
		return this.sId;
	}

	/**
	 * Creates or updates the appstate.
	 *
	 * @returns A promise resolving the stored data
	 * @ui5-restricted
	 */
	async createAppState(): Promise<void | { appState: object }> {
		if (!this.oAppComponent.getEnvironmentCapabilities().getCapabilities().AppState || BusyLocker.isLocked(this)) {
			return;
		}

		const oNavigationService = this.oAppComponent.getNavigationService(),
			oRouterProxy = this.oAppComponent.getRouterProxy(),
			sHash = oRouterProxy.getHash(),
			oController = this.oAppComponent.getRootControl().getController(),
			bIsStickyMode = ModelHelper.isStickySessionSupported(this.oAppComponent.getMetaModel());

		if (!oController.viewState) {
			throw new Error(`viewState controller extension not available for controller: ${oController.getMetadata().getName()}`);
		}

		const mInnerAppState = await oController.viewState.retrieveViewState();
		const oStoreData = { appState: mInnerAppState };
		if (mInnerAppState && !deepEqual(this._mCurrentAppState, mInnerAppState)) {
			this._mCurrentAppState = mInnerAppState;
			try {
				this.nbSimultaneousCreateRequest++;
				const sAppStateKey = await oNavigationService.storeInnerAppStateAsync(oStoreData, true, true);
				Log.info("APPSTATE: Appstate stored");
				const sNewHash = oNavigationService.replaceInnerAppStateKey(sHash, sAppStateKey);
				this.nbSimultaneousCreateRequest--;
				if (this.nbSimultaneousCreateRequest === 0 && sNewHash !== sHash) {
					oRouterProxy.navToHash(sNewHash, undefined, undefined, undefined, !bIsStickyMode);
					this.bNoRouteChange = true;
				}
				Log.info("APPSTATE: navToHash");
			} catch (oError: unknown) {
				Log.error(oError as string);
			}
		}

		return oStoreData;
	}

	_createNavigationParameters(oAppData: AppData, sNavType: string): NavigationParameter {
		return Object.assign({}, oAppData, {
			selectionVariantDefaults: oAppData.oDefaultedSelectionVariant,
			selectionVariant: oAppData.oSelectionVariant,
			requiresStandardVariant: !oAppData.bNavSelVarHasDefaultsOnly,
			navigationType: sNavType
		});
	}

	_checkIfLastSeenRecord(view?: View) {
		//getting the internal model context in order to fetch the technicalkeys of last seen record and close column flag set in the internalrouting for retaining settings in persistence mode
		const internalModelContext = view && (view.getBindingContext("internal") as InternalModelContext);
		if (internalModelContext && internalModelContext.getProperty("fclColumnClosed") === true) {
			const technicalKeysObject = internalModelContext && internalModelContext.getProperty("technicalKeysOfLastSeenRecord");
			const bindingContext = view?.getBindingContext() as Context;
			const path = (bindingContext && bindingContext.getPath()) || "";
			const metaModel = bindingContext?.getModel().getMetaModel();
			const metaPath = metaModel?.getMetaPath(path);
			const technicalKeys = metaModel?.getObject(`${metaPath}/$Type/$Key`);
			for (let i = 0; i < technicalKeys.length; i++) {
				const keyValue = bindingContext.getObject()[technicalKeys[i]];
				if (keyValue !== technicalKeysObject[technicalKeys[i]]) {
					internalModelContext.setProperty("fclColumnClosed", false);
					return true;
				}
			}
			//the record opened is not the last seen one : no need to persist the changes, reset to default instead
		}
		return false;
	}

	_getAppStateData(oAppData: AppData, viewId?: string) {
		let key = "",
			i = 0;
		if (oAppData && oAppData.appState) {
			for (i = 0; i < Object.keys(oAppData.appState).length; i++) {
				if (Object.keys(oAppData.appState)[i] === viewId) {
					key = Object.keys(oAppData.appState)[i];
					break;
				}
			}
		}
		if (oAppData.appState) {
			return {
				[Object.keys(oAppData.appState)[i]]: oAppData.appState[key] || {}
			};
		}
	}

	/**
	 * Applies an appstate by fetching appdata and passing it to _applyAppstateToPage.
	 *
	 * @param viewId
	 * @param view
	 * @function
	 * @static
	 * @memberof sap.fe.core.AppStateHandler
	 * @returns A promise for async handling
	 * @private
	 * @ui5-restricted
	 */
	async applyAppState(viewId?: string, view?: View) {
		if (!this.oAppComponent.getEnvironmentCapabilities().getCapabilities().AppState || BusyLocker.isLocked(this)) {
			return Promise.resolve();
		}

		const checkIfLastSeenRecord = this._checkIfLastSeenRecord(view);
		if (checkIfLastSeenRecord === true) {
			return Promise.resolve();
		}

		BusyLocker.lock(this);
		// Done for busy indicator
		BusyLocker.lock(this.oAppComponent.getRootControl());

		const oNavigationService = this.oAppComponent.getNavigationService();
		// TODO oNavigationService.parseNavigation() should return ES6 promise instead jQuery.promise
		return toES6Promise(oNavigationService.parseNavigation())
			.catch(function (aErrorData: unknown[]) {
				if (!aErrorData) {
					aErrorData = [];
				}
				Log.warning("APPSTATE: Parse Navigation failed", aErrorData[0] as string);
				return [
					{
						/* app data */
					},
					aErrorData[1],
					aErrorData[2]
				];
			})
			.then((aResults: unknown[]) => {
				Log.info("APPSTATE: Parse Navigation done");

				// aResults[1] => oStartupParameters (not evaluated)
				const oAppData = (aResults[0] || {}) as AppData,
					sNavType = (aResults[2] as string) || NavType.initial,
					oRootController = this.oAppComponent.getRootControl().getController();
				// apply the appstate depending upon the view (LR/OP)
				const appStateData = this._getAppStateData(oAppData, viewId);

				this._mCurrentAppState = sNavType === NavType.iAppState ? appStateData : undefined;

				if (!oRootController.viewState) {
					throw new Error(`viewState extension required for controller ${oRootController.getMetadata().getName()}`);
				}
				if ((!oAppData || Object.keys(oAppData).length === 0) && sNavType == NavType.iAppState) {
					return {};
				}
				return oRootController.viewState.applyViewState(
					this._mCurrentAppState,
					this._createNavigationParameters(oAppData, sNavType)
				);
			})
			.catch(function (oError: unknown) {
				Log.error("appState could not be applied", oError as string);
				throw oError;
			})
			.finally(() => {
				BusyLocker.unlock(this);
				BusyLocker.unlock(this.oAppComponent.getRootControl());
			});
	}

	/**
	 * To check is route is changed by change in the iAPPState.
	 *
	 * @returns `true` if the route has chnaged
	 */
	checkIfRouteChangedByIApp() {
		return this.bNoRouteChange;
	}

	/**
	 * Reset the route changed by iAPPState.
	 */
	resetRouteChangedByIApp() {
		if (this.bNoRouteChange) {
			this.bNoRouteChange = false;
		}
	}
}

/**
 * @global
 */
export default AppStateHandler;
