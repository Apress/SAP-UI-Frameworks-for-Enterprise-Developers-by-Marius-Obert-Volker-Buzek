import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import Log from "sap/base/Log";
import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import Synchronization from "sap/fe/core/helpers/Synchronization";
import type { IShellServices } from "sap/fe/core/services/ShellServicesFactory";
import BaseObject from "sap/ui/base/Object";
import Core from "sap/ui/core/Core";
import type Router from "sap/ui/core/routing/Router";
import URI from "sap/ui/thirdparty/URI";

const enumState = {
	EQUAL: 0,
	COMPATIBLE: 1,
	ANCESTOR: 2,
	DIFFERENT: 3
};
const enumURLParams = {
	LAYOUTPARAM: "layout",
	IAPPSTATEPARAM: "sap-iapp-state"
};

/**
 * Creates a HashGuard object.
 *
 * @param sGuardHash The hash used for the guard
 * @returns The created hash guard
 */
function createGuardFromHash(sGuardHash: string) {
	return {
		_guardHash: sGuardHash.replace(/\?[^?]*$/, ""), // Remove query part
		check: function (sHash: any) {
			return sHash.indexOf(this._guardHash) === 0;
		}
	};
}
/**
 * Returns the iAppState part from a hash (or null if not found).
 *
 * @param sHash The hash
 * @returns The iAppState part of the hash
 */
function findAppStateInHash(sHash: string): string | null {
	const aAppState = sHash.match(new RegExp(`\\?.*${enumURLParams.IAPPSTATEPARAM}=([^&]*)`));
	return aAppState && aAppState.length > 1 ? aAppState[1] : null;
}
/**
 * Returns a hash without its iAppState part.
 *
 * @param sHash The hash
 * @returns The hash without the iAppState
 */
function removeAppStateInHash(sHash: string) {
	return sHash.replace(new RegExp(`[&?]*${enumURLParams.IAPPSTATEPARAM}=[^&]*`), "");
}
/**
 * Adds an iAppState inside a hash (or replaces an existing one).
 *
 * @param sHash The hash
 * @param sAppStateKey The iAppState to add
 * @returns The hash with the app state
 */
function setAppStateInHash(sHash: any, sAppStateKey: any) {
	let sNewHash;

	if (sHash.indexOf(enumURLParams.IAPPSTATEPARAM) >= 0) {
		// If there's already an iAppState parameter in the hash, replace it
		sNewHash = sHash.replace(new RegExp(`${enumURLParams.IAPPSTATEPARAM}=[^&]*`), `${enumURLParams.IAPPSTATEPARAM}=${sAppStateKey}`);
	} else {
		// Add the iAppState parameter in the hash
		if (sHash.indexOf("?") < 0) {
			sNewHash = `${sHash}?`;
		} else {
			sNewHash = `${sHash}&`;
		}
		sNewHash += `${enumURLParams.IAPPSTATEPARAM}=${sAppStateKey}`;
	}

	return sNewHash;
}

@defineUI5Class("sap.fe.core.RouterProxy")
class RouterProxy extends BaseObject {
	bIsRebuildHistoryRunning = false;

	bIsComputingTitleHierachy = false;

	bIsGuardCrossAllowed = false;

	sIAppStateKey: string | null = null;

	_oShellServices!: IShellServices;

	fclEnabled!: boolean;

	_fnBlockingNavFilter!: Function;

	_fnHashGuard!: Function;

	_bDisableOnHashChange!: boolean;

	_bIgnoreRestore!: boolean;

	_bForceFocus!: boolean;

	_oRouter!: Router;

	_oManagedHistory!: any[];

	_oNavigationGuard: any;

	oResourceBundle?: ResourceBundle;

	_oRouteMatchSynchronization?: Synchronization;

	_bActivateRouteMatchSynchro: boolean = false;

	_bApplyRestore: boolean = false;

	_bDelayedRebuild: boolean = false;

	_pathMappings: { oldPath: string; newPath: string }[] = [];

	init(oAppComponent: any, isfclEnabled: boolean) {
		// Save the name of the app (including startup parameters) for rebuilding full hashes later
		oAppComponent
			.getService("shellServices")
			.then(() => {
				this._oShellServices = oAppComponent.getShellServices();

				this.initRaw(oAppComponent.getRouter());
				// We want to wait until the initial routeMatched is done before doing any navigation
				this.waitForRouteMatchBeforeNavigation();

				// Set feLevel=0 for the first Application page in the history
				history.replaceState(
					Object.assign(
						{
							feLevel: 0
						},
						history.state
					),
					"",
					window.location as any
				);
				this.fclEnabled = isfclEnabled;

				this._fnBlockingNavFilter = this._blockingNavigationFilter.bind(this);
				this._oShellServices.registerNavigationFilter(this._fnBlockingNavFilter);
			})
			.catch(function (oError: any) {
				Log.error("Cannot retrieve the shell services", oError);
			});
		this._fnHashGuard = this.hashGuard.bind(this);
		window.addEventListener("popstate", this._fnHashGuard as any);
		this._bDisableOnHashChange = false;
		this._bIgnoreRestore = false;
		this._bForceFocus = true; // Trigger the focus mechanism for the first view displayed by the app
	}

	destroy() {
		if (this._oShellServices) {
			this._oShellServices.unregisterNavigationFilter(this._fnBlockingNavFilter);
		}
		window.removeEventListener("popstate", this._fnHashGuard as any);
	}

	/**
	 * Raw initialization (for unit tests).
	 *
	 * @param oRouter The router used by this proxy
	 */
	initRaw(oRouter: Router) {
		this._oRouter = oRouter;
		this._oManagedHistory = [];
		this._oNavigationGuard = null;

		const sCurrentAppHash = this.getHash();
		this._oManagedHistory.push(this._extractStateFromHash(sCurrentAppHash));

		// Set the iAppState if the initial hash contains one
		this.sIAppStateKey = findAppStateInHash(sCurrentAppHash);
	}

	getHash() {
		return this._oRouter.getHashChanger().getHash();
	}

	isFocusForced() {
		return this._bForceFocus;
	}

	setFocusForced(bForced: boolean) {
		this._bForceFocus = bForced;
	}

	/**
	 * Resets the internal variable sIAppStateKey.
	 *
	 * @function
	 * @name sap.fe.core.RouterProxy#removeIAppStateKey
	 * @ui5-restricted
	 */
	removeIAppStateKey() {
		this.sIAppStateKey = null;
	}

	/**
	 * Navigates to a specific hash.
	 *
	 * @function
	 * @name sap.fe.core.RouterProxy#navToHash
	 * @memberof sap.fe.core.RouterProxy
	 * @static
	 * @param sHash Hash to be navigated to
	 * @param bPreserveHistory If set to true, non-ancestor entries in history will be retained
	 * @param bDisablePreservationCache If set to true, cache preservation mechanism is disabled for the current navigation
	 * @param bForceFocus If set to true, the logic to set the focus once the navigation is finalized will be triggered (onPageReady)
	 * @param bPreserveShellBackNavigationHandler If not set to false, the back navigation is set to undefined
	 * @returns Promise (resolved when the navigation is finalized) that returns 'true' if a navigation took place, 'false' if the navigation didn't happen
	 * @ui5-restricted
	 */
	navToHash(
		sHash: string | undefined,
		bPreserveHistory?: boolean,
		bDisablePreservationCache?: boolean,
		bForceFocus?: boolean,
		bPreserveShellBackNavigationHandler?: boolean
	): Promise<boolean> {
		if (bPreserveShellBackNavigationHandler !== false) {
			this._oShellServices.setBackNavigation();
		}
		if (this._oRouteMatchSynchronization) {
			return this._oRouteMatchSynchronization.waitFor().then(() => {
				this._oRouteMatchSynchronization = undefined;
				return this._internalNavToHash(sHash, bPreserveHistory, bDisablePreservationCache, bForceFocus);
			});
		} else {
			if (this._bActivateRouteMatchSynchro) {
				this.waitForRouteMatchBeforeNavigation();
			}
			return this._internalNavToHash(sHash, bPreserveHistory, bDisablePreservationCache, bForceFocus);
		}
	}

	_internalNavToHash(sHash: any, bPreserveHistory: any, bDisablePreservationCache: any, bForceFocus?: boolean): Promise<boolean> {
		// Add the app state in the hash if needed
		if (this.fclEnabled && this.sIAppStateKey && !findAppStateInHash(sHash)) {
			sHash = setAppStateInHash(sHash, this.sIAppStateKey);
		}

		if (!this.checkHashWithGuard(sHash)) {
			if (!this.oResourceBundle) {
				this.oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
			}

			// We have to use a confirm here for UI consistency reasons, as with some scenarios
			// in the EditFlow we rely on a UI5 mechanism that displays a confirm dialog.
			// eslint-disable-next-line no-alert
			if (!confirm(this.oResourceBundle.getText("C_ROUTER_PROXY_SAPFE_EXIT_NOTSAVED_MESSAGE"))) {
				// The user clicked on Cancel --> cancel navigation
				return Promise.resolve(false);
			}
			this.bIsGuardCrossAllowed = true;
		}

		// In case the navigation will cause a new view to be displayed, we force the focus
		// I.e. if the keys for the hash we're navigating to is a superset of the current hash keys.
		const oNewState = this._extractStateFromHash(sHash);
		if (!this._bForceFocus) {
			// If the focus was already forced, keep it
			const aCurrentHashKeys = this._extractEntitySetsFromHash(this.getHash());
			this._bForceFocus =
				bForceFocus ||
				(aCurrentHashKeys.length < oNewState.keys.length &&
					aCurrentHashKeys.every(function (key: any, index: any) {
						return key === oNewState.keys[index];
					}));
		}

		const oHistoryAction = this._pushNewState(oNewState, false, bPreserveHistory, bDisablePreservationCache);
		this.storeFocusInfoForCurrentHash();

		return this._rebuildBrowserHistory(oHistoryAction, false);
	}

	/**
	 * Clears browser history if entries have been added without using the RouterProxy.
	 * Updates the internal history accordingly.
	 *
	 * @returns Promise that is resolved once the history is rebuilt
	 */
	restoreHistory() {
		if (this._bApplyRestore) {
			this._bApplyRestore = false;
			let sTargetHash = this.getHash();
			sTargetHash = sTargetHash.replace(/(\?|&)restoreHistory=true/, "");
			const oNewState = this._extractStateFromHash(sTargetHash);

			const oHistoryAction = this._pushNewState(oNewState, true, false, true);

			return this._rebuildBrowserHistory(oHistoryAction, true);
		} else {
			return Promise.resolve();
		}
	}

	/**
	 * Navigates back in the history.
	 *
	 * @returns Promise that is resolved when the navigation is finalized
	 */
	navBack() {
		const sCurrentHash = this.getHash();
		let sPreviousHash;

		// Look for the current hash in the managed history
		for (let i = this._oManagedHistory.length - 1; i > 0; i--) {
			if (this._oManagedHistory[i].hash === sCurrentHash) {
				sPreviousHash = this._oManagedHistory[i - 1].hash;
				break;
			}
		}

		if (sPreviousHash) {
			return this.navToHash(sPreviousHash);
		} else {
			// We couldn't find a previous hash in history
			// This can happen when navigating from a transient hash in a create app, and
			// in that case history.back would go back to the FLP
			window.history.back();
			return Promise.resolve();
		}
	}

	/**
	 * Navigates to a route with parameters.
	 *
	 * @param sRouteName The route name to be navigated to
	 * @param oParameters Parameters for the navigation
	 * @returns Promise that is resolved when the navigation is finalized
	 * @ui5-restricted
	 */
	navTo(sRouteName: string, oParameters: any) {
		const sHash = this._oRouter.getURL(sRouteName, oParameters);
		return this.navToHash(sHash, false, oParameters.noPreservationCache, false, !oParameters.bIsStickyMode);
	}

	/**
	 * Exits the current app by navigating back
	 * to the previous app (if any) or the FLP.
	 *
	 * @returns Promise that is resolved when we exit the app
	 */
	exitFromApp() {
		return this._oShellServices.backToPreviousApp();
	}

	/**
	 * Checks whether a given hash can have an impact on the current state
	 * i.e. if the hash is equal, compatible or an ancestor of the current state.
	 *
	 * @param sHash `true` if there is an impact
	 * @returns If there is an impact
	 */
	isCurrentStateImpactedBy(sHash: any) {
		if (sHash[0] === "/") {
			sHash = sHash.substring(1);
		}
		const oLocalGuard = createGuardFromHash(sHash);
		return oLocalGuard.check(this.getHash());
	}

	/**
	 * Checks if a navigation is currently being processed.
	 *
	 * @returns `false` if a navigation has been triggered in the RouterProxy and is not yet finalized
	 */
	isNavigationFinalized() {
		return !this.bIsRebuildHistoryRunning && !this._bDelayedRebuild;
	}

	/**
	 * Sets the last state as a guard.
	 * Each future navigation will be checked against this guard, and a confirmation dialog will
	 * be displayed before the navigation crosses the guard (i.e. goes to an ancestor of the guard).
	 *
	 * @param sHash The hash for the guard
	 */
	setNavigationGuard(sHash: string) {
		this._oNavigationGuard = createGuardFromHash(sHash);
		this.bIsGuardCrossAllowed = false;
	}

	/**
	 * Disables the navigation guard.
	 */
	discardNavigationGuard() {
		this._oNavigationGuard = null;
	}

	/**
	 * Checks for the availability of the navigation guard.
	 *
	 * @returns `true` if navigating guard is available
	 */
	hasNavigationGuard() {
		return this._oNavigationGuard !== null;
	}

	/**
	 * Tests a hash against the navigation guard.
	 *
	 * @param sHash The hash to be tested
	 * @returns `true` if navigating to the hash doesn't cross the guard
	 */
	checkHashWithGuard(sHash: string) {
		return this._oNavigationGuard === null || this._oNavigationGuard.check(sHash);
	}

	/**
	 * Checks if the user allowed the navigation guard to be crossed.
	 *
	 * @returns `true` if crossing the guard has been allowed by the user
	 */
	isGuardCrossAllowedByUser() {
		return this.bIsGuardCrossAllowed;
	}

	/**
	 * Activates the synchronization for routeMatchedEvent.
	 * The next NavToHash call will create a Synchronization object that will be resolved
	 * by the corresponding onRouteMatched event, preventing another NavToHash to happen in parallel.
	 */
	activateRouteMatchSynchronization() {
		this._bActivateRouteMatchSynchro = true;
	}

	/**
	 * Resolve the routeMatch synchronization object, unlocking potential pending NavToHash calls.
	 */
	resolveRouteMatch() {
		if (this._oRouteMatchSynchronization) {
			this._oRouteMatchSynchronization.resolve();
		}
	}

	/**
	 * Makes sure no navigation can happen before a routeMatch happened.
	 */
	waitForRouteMatchBeforeNavigation() {
		this._oRouteMatchSynchronization = new Synchronization();
		this._bActivateRouteMatchSynchro = false;
	}

	_extractEntitySetsFromHash(sHash: string | undefined): string[] {
		if (sHash === undefined) {
			sHash = "";
		}
		const sHashNoParams = sHash.split("?")[0]; // remove params
		const aTokens = sHashNoParams.split("/");
		const names: string[] = [];

		aTokens.forEach((sToken) => {
			if (sToken.length) {
				names.push(sToken.split("(")[0]);
			}
		});

		return names;
	}

	/**
	 * Builds a state from a hash.
	 *
	 * @param sHash The hash to be used as entry
	 * @returns The state
	 * @ui5-restricted
	 */
	_extractStateFromHash(sHash: string) {
		if (sHash === undefined) {
			sHash = "";
		}

		const oState: any = {
			keys: this._extractEntitySetsFromHash(sHash)
		};

		// Retrieve layout (if any)
		const aLayout = sHash.match(new RegExp(`\\?.*${enumURLParams.LAYOUTPARAM}=([^&]*)`));
		oState.sLayout = aLayout && aLayout.length > 1 ? aLayout[1] : null;
		if (oState.sLayout === "MidColumnFullScreen") {
			oState.screenMode = 1;
		} else if (oState.sLayout === "EndColumnFullScreen") {
			oState.screenMode = 2;
		} else {
			oState.screenMode = 0;
		}

		oState.hash = sHash;
		return oState;
	}

	/**
	 * Adds a new state into the internal history structure.
	 * Makes sure this new state is added after an ancestor.
	 * Also sets the iAppState key in the whole history.
	 *
	 * @memberof sap.fe.core.RouterProxy
	 * @param oNewState The new state to be added
	 * @param bRebuildOnly `true` if we're rebuilding the history after a shell menu navigation
	 * @param bPreserveHistory If set to true, non-ancestor entries in history will be retained
	 * @param bDisableHistoryPreservation Disable the mechanism to retained marked entries in cache
	 * @returns The new state
	 * @ui5-restricted
	 * @final
	 */
	_pushNewState(oNewState: any, bRebuildOnly: boolean, bPreserveHistory: boolean, bDisableHistoryPreservation: boolean) {
		const sCurrentHash = this.getHash();
		let lastIndex = this._oManagedHistory.length - 1;
		let iPopCount = bRebuildOnly ? 1 : 0;

		// 1. Do some cleanup in the managed history : in case the user has navigated back in the browser history, we need to remove
		// the states ahead in history and make sure the top state corresponds to the current page
		// We don't do that when restoring the history, as the current state has been added on top of the browser history
		// and is not reflected in the managed history
		if (!bRebuildOnly) {
			while (lastIndex >= 0 && this._oManagedHistory[lastIndex].hash !== sCurrentHash) {
				this._oManagedHistory.pop();
				lastIndex--;
			}

			if (this._oManagedHistory.length === 0) {
				// We couldn't find the current location in the history. This can happen if a browser reload
				// happened, causing a reinitialization of the managed history.
				// In that case, we use the current location as the new starting point in the managed history
				this._oManagedHistory.push(this._extractStateFromHash(sCurrentHash));
				history.replaceState(Object.assign({ feLevel: 0 }, history.state), "");
			}
		}

		// 2. Mark the top state as preserved if required
		if (bPreserveHistory && !bDisableHistoryPreservation) {
			this._oManagedHistory[this._oManagedHistory.length - 1].preserved = true;
		}

		// 3. Then pop all states until we find an ancestor of the new state, or we find a state that need to be preserved
		let oLastRemovedItem;
		while (this._oManagedHistory.length > 0) {
			const oTopState = this._oManagedHistory[this._oManagedHistory.length - 1];
			if (
				(bDisableHistoryPreservation || !oTopState.preserved) &&
				this._compareCacheStates(oTopState, oNewState) !== enumState.ANCESTOR
			) {
				// The top state is not an ancestor of oNewState and is not preserved --> we can pop it
				oLastRemovedItem = this._oManagedHistory.pop();
				iPopCount++;
			} else if (oTopState.preserved && removeAppStateInHash(oTopState.hash) === removeAppStateInHash(oNewState.hash)) {
				// We try to add a state that is already in cache (due to preserved flag) but with a different iapp-state
				// --> we should delete the previous entry (it will be later replaced by the new one) and stop popping
				oLastRemovedItem = this._oManagedHistory.pop();
				iPopCount++;
				oNewState.preserved = true;
				break;
			} else {
				break; // Ancestor or preserved state found --> we stop popping out states
			}
		}

		// 4. iAppState management
		this.sIAppStateKey = findAppStateInHash(oNewState.hash);
		if (!this.fclEnabled && oLastRemovedItem) {
			const sPreviousIAppStateKey = findAppStateInHash(oLastRemovedItem.hash);
			const oComparisonStateResult = this._compareCacheStates(oLastRemovedItem, oNewState);
			// if current state doesn't contain a i-appstate and this state should replace a state containing a iAppState
			// then the previous iAppState is preserved
			if (
				!this.sIAppStateKey &&
				sPreviousIAppStateKey &&
				(oComparisonStateResult === enumState.EQUAL || oComparisonStateResult === enumState.COMPATIBLE)
			) {
				oNewState.hash = setAppStateInHash(oNewState.hash, sPreviousIAppStateKey);
			}
		}

		// 5. Now we can push the state at the top of the internal history
		const bHasSameHash = oLastRemovedItem && oNewState.hash === oLastRemovedItem.hash;
		if (this._oManagedHistory.length === 0 || this._oManagedHistory[this._oManagedHistory.length - 1].hash !== oNewState.hash) {
			this._oManagedHistory.push(oNewState);
			if (oLastRemovedItem && removeAppStateInHash(oLastRemovedItem.hash) === removeAppStateInHash(oNewState.hash)) {
				oNewState.focusControlId = oLastRemovedItem.focusControlId;
				oNewState.focusInfo = oLastRemovedItem.focusInfo;
			}
		}

		// 6. Determine which actions to do on the history
		if (iPopCount === 0) {
			// No state was popped --> append
			return { type: "append" };
		} else if (iPopCount === 1) {
			// Only 1 state was popped --> replace current hash unless hash is the same (then nothing to do)
			return bHasSameHash ? { type: "none" } : { type: "replace" };
		} else {
			// More than 1 state was popped --> go bakc in history and replace hash if necessary
			return bHasSameHash ? { type: "back", steps: iPopCount - 1 } : { type: "back-replace", steps: iPopCount - 1 };
		}
	}

	_blockingNavigationFilter() {
		return this._bDisableOnHashChange ? "Custom" : "Continue";
	}

	/**
	 * Disable the routing by calling the router stop method.
	 *
	 * @function
	 * @memberof sap.fe.core.RouterProxy
	 * @ui5-restricted
	 * @final
	 */
	_disableEventOnHashChange() {
		this._bDisableOnHashChange = true;
		this._oRouter.stop();
	}

	/**
	 * Enable the routing by calling the router initialize method.
	 *
	 * @function
	 * @name sap.fe.core.RouterProxy#_enableEventOnHashChange
	 * @memberof sap.fe.core.RouterProxy
	 * @param [bIgnoreCurrentHash] Ignore the last hash event triggered before the router has initialized
	 * @ui5-restricted
	 * @final
	 */
	_enableEventOnHashChange(bIgnoreCurrentHash: boolean | undefined) {
		this._bDisableOnHashChange = false;
		this._oRouter.initialize(bIgnoreCurrentHash);
	}

	/**
	 * Synchronizes the browser history with the internal history of the routerProxy, and triggers a navigation if needed.
	 *
	 * @memberof sap.fe.core.RouterProxy
	 * @param oHistoryAction Specifies the navigation action to be performed
	 * @param bRebuildOnly `true` if internal history is currently being rebuilt
	 * @returns Promise (resolved when the navigation is finalized) that returns 'true' if a navigation took place, 'false' if the navigation didn't happen
	 * @ui5-restricted
	 * @final
	 */
	_rebuildBrowserHistory(oHistoryAction: any, bRebuildOnly: boolean): Promise<boolean> {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		return new Promise((resolve) => {
			this.bIsRebuildHistoryRunning = true;
			const oTargetState = this._oManagedHistory[this._oManagedHistory.length - 1],
				newLevel = this._oManagedHistory.length - 1;

			function replaceAsync() {
				if (!bRebuildOnly) {
					that._enableEventOnHashChange(true);
				}

				(that._oRouter.getHashChanger().replaceHash as any)(oTargetState.hash);
				history.replaceState(Object.assign({ feLevel: newLevel }, history.state), "");

				if (bRebuildOnly) {
					setTimeout(function () {
						// Timeout to let 'hashchange' event be processed before by the HashChanger, so that
						// onRouteMatched notification isn't raised
						that._enableEventOnHashChange(true);
					}, 0);
				}

				that.bIsRebuildHistoryRunning = false;
				resolve(true); // a navigation occurred
			}

			// Async callbacks when navigating back, in order to let all notifications and events get processed
			function backReplaceAsync() {
				window.removeEventListener("popstate", backReplaceAsync);
				setTimeout(function () {
					// Timeout to let 'hashchange' event be processed before by the HashChanger
					replaceAsync();
				}, 0);
			}

			function backAsync() {
				window.removeEventListener("popstate", backAsync);
				that.bIsRebuildHistoryRunning = false;
				resolve(true); // a navigation occurred
			}

			that._bIgnoreRestore = true;

			switch (oHistoryAction.type) {
				case "replace":
					(that._oRouter.getHashChanger().replaceHash as any)(oTargetState.hash);
					history.replaceState(Object.assign({ feLevel: newLevel }, history.state), "");
					that.bIsRebuildHistoryRunning = false;
					resolve(true); // a navigation occurred
					break;

				case "append":
					that._oRouter.getHashChanger().setHash(oTargetState.hash);
					history.replaceState(Object.assign({ feLevel: newLevel }, history.state), "");
					that.bIsRebuildHistoryRunning = false;
					resolve(true); // a navigation occurred
					break;

				case "back":
					window.addEventListener("popstate", backAsync);
					history.go(-oHistoryAction.steps);
					break;

				case "back-replace":
					this._disableEventOnHashChange();
					window.addEventListener("popstate", backReplaceAsync);
					history.go(-oHistoryAction.steps);
					break;

				default:
					// No navigation
					this.bIsRebuildHistoryRunning = false;
					resolve(false); // no navigation --> resolve to false
			}
		});
	}

	getLastHistoryEntry() {
		return this._oManagedHistory[this._oManagedHistory.length - 1];
	}

	setPathMapping(mappings: { oldPath: string; newPath: string }[]) {
		this._pathMappings = mappings.filter((mapping) => {
			return mapping.oldPath !== mapping.newPath;
		});
	}

	hashGuard() {
		let sHash = window.location.hash;

		if (sHash.indexOf("restoreHistory=true") !== -1) {
			this._bApplyRestore = true;
		} else if (!this.bIsRebuildHistoryRunning) {
			// Check if the hash needs to be changed (this happens in FCL when switching b/w edit and read-only with 3 columns open)
			const mapping = this._pathMappings.find((m) => {
				return sHash.indexOf(m.oldPath) >= 0;
			});
			if (mapping) {
				// Replace the current hash
				sHash = sHash.replace(mapping.oldPath, mapping.newPath);
				history.replaceState(Object.assign({}, history.state), "", sHash);
			}

			const aHashSplit = sHash.split("&/");
			const sAppHash = aHashSplit[1] ? aHashSplit[1] : "";
			if (this.checkHashWithGuard(sAppHash)) {
				this._bDelayedRebuild = true;
				const oNewState = this._extractStateFromHash(sAppHash);
				this._pushNewState(oNewState, false, false, true);

				setTimeout(() => {
					this._bDelayedRebuild = false;
				}, 0);
			}
		}
	}

	/**
	 * Compares 2 states.
	 *
	 * @param {object} oState1
	 * @param {object} oState2
	 * @returns {number} The result of the comparison:
	 *        - enumState.EQUAL if oState1 and oState2 are equal
	 *        - enumState.COMPATIBLE if oState1 and oState2 are compatible
	 *        - enumState.ANCESTOR if oState1 is an ancestor of oState2
	 *        - enumState.DIFFERENT if the 2 states are different
	 */

	_compareCacheStates(oState1: any, oState2: any) {
		// First compare object keys
		if (oState1.keys.length > oState2.keys.length) {
			return enumState.DIFFERENT;
		}
		let equal = true;
		let index;
		for (index = 0; equal && index < oState1.keys.length; index++) {
			if (oState1.keys[index] !== oState2.keys[index]) {
				equal = false;
			}
		}
		if (!equal) {
			// Some objects keys are different
			return enumState.DIFFERENT;
		}

		// All keys from oState1 are in oState2 --> check if ancestor
		if (oState1.keys.length < oState2.keys.length || oState1.screenMode < oState2.screenMode) {
			return enumState.ANCESTOR;
		}
		if (oState1.screenMode > oState2.screenMode) {
			return enumState.DIFFERENT; // Not sure this case can happen...
		}

		// At this stage, the 2 states have the same object keys (in the same order) and same screenmode
		// They can be either compatible or equal
		return oState1.sLayout === oState2.sLayout ? enumState.EQUAL : enumState.COMPATIBLE;
	}

	/**
	 * Checks if back exits the present guard set.
	 *
	 * @param sPresentHash The current hash. Only used for unit tests.
	 * @returns `true` if back exits there is a guard exit on back
	 */
	checkIfBackIsOutOfGuard(sPresentHash?: string) {
		let sPrevHash;
		let sCurrentHash: string;
		if (sPresentHash === undefined) {
			// We use window.location.hash instead of HashChanger.getInstance().getHash() because the latter
			// replaces characters in the URL (e.g. %24 replaced by $) and it causes issues when comparing
			// with the URLs in the managed history
			const oSplitHash = this._oShellServices.splitHash(window.location.hash) as any;
			if (oSplitHash && oSplitHash.appSpecificRoute) {
				sCurrentHash = oSplitHash.appSpecificRoute;
				if (sCurrentHash.indexOf("&/") === 0) {
					sCurrentHash = sCurrentHash.substring(2);
				}
			} else {
				sCurrentHash = window.location.hash.substring(1); // To remove the '#'
				if (sCurrentHash[0] === "/") {
					sCurrentHash = sCurrentHash.substring(1);
				}
			}
		} else {
			sCurrentHash = sPresentHash;
		}
		sPresentHash = URI.decode(sCurrentHash);
		if (this._oNavigationGuard) {
			for (let i = this._oManagedHistory.length - 1; i > 0; i--) {
				if (this._oManagedHistory[i].hash === sPresentHash) {
					sPrevHash = this._oManagedHistory[i - 1].hash;
					break;
				}
			}

			return !sPrevHash || !this.checkHashWithGuard(sPrevHash);
		}
		return false;
	}

	/**
	 * Checks if the last 2 entries in the history share the same context.
	 *
	 * @returns `true` if they share the same context.
	 */
	checkIfBackHasSameContext() {
		if (this._oManagedHistory.length < 2) {
			return false;
		}

		const oCurrentState = this._oManagedHistory[this._oManagedHistory.length - 1];
		const oPreviousState = this._oManagedHistory[this._oManagedHistory.length - 2];

		return oCurrentState.hash.split("?")[0] === oPreviousState.hash.split("?")[0];
	}

	/**
	 * Restores the focus for the current hash, if we can find it in the history.
	 *
	 * @returns True if focus was set, false otherwise.
	 */
	restoreFocusForCurrentHash(): boolean {
		const currentHash = removeAppStateInHash(this.getHash());
		const stateForHash = this._oManagedHistory.find((state) => {
			return removeAppStateInHash(state.hash) === currentHash;
		});

		let focusApplied = false;
		if (stateForHash?.focusControlId) {
			const focusControl = sap.ui.getCore().byId(stateForHash.focusControlId);
			focusControl?.focus(stateForHash.focusInfo);
			focusApplied = focusControl !== undefined;
		}

		return focusApplied;
	}

	/**
	 * Stores the ID of the currently focused control in the history for the current hash.
	 *
	 */
	private storeFocusInfoForCurrentHash() {
		const currentHash = removeAppStateInHash(this.getHash());
		const stateForHash = this._oManagedHistory.find((state) => {
			return removeAppStateInHash(state.hash) === currentHash;
		});
		if (stateForHash) {
			const focusControlId = sap.ui.getCore().getCurrentFocusedControlId();
			const focusControl = focusControlId ? sap.ui.getCore().byId(focusControlId) : undefined;
			stateForHash.focusControlId = focusControlId;
			stateForHash.focusInfo = focusControl?.getFocusInfo();
		}
	}

	/**
	 * Finds a layout value for a hash in the history.
	 *
	 * @param hash The hash to look for in the history.
	 * @returns A layout value if it could be found, undefined otherwise.
	 */
	findLayoutForHash(hash: string): string | undefined {
		if (!this.fclEnabled) {
			return undefined;
		}

		// Remove all query parameters from the hash
		const hashNoParam = hash.split("?")[0];

		// Look for the state backwards, so that we find the last state in the history (e.g. if we have 2 states with the same hash but 2 different layouts)
		let targetState: any;
		for (let index = this._oManagedHistory.length - 1; index >= 0 && targetState === undefined; index--) {
			if (this._oManagedHistory[index].hash.split("?")[0] === hashNoParam) {
				targetState = this._oManagedHistory[index];
			}
		}

		return targetState?.sLayout;
	}
}

export default RouterProxy;
