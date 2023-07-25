/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/Synchronization", "sap/ui/base/Object", "sap/ui/core/Core", "sap/ui/thirdparty/URI"], function (Log, ClassSupport, Synchronization, BaseObject, Core, URI) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
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
  function createGuardFromHash(sGuardHash) {
    return {
      _guardHash: sGuardHash.replace(/\?[^?]*$/, ""),
      // Remove query part
      check: function (sHash) {
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
  function findAppStateInHash(sHash) {
    const aAppState = sHash.match(new RegExp(`\\?.*${enumURLParams.IAPPSTATEPARAM}=([^&]*)`));
    return aAppState && aAppState.length > 1 ? aAppState[1] : null;
  }
  /**
   * Returns a hash without its iAppState part.
   *
   * @param sHash The hash
   * @returns The hash without the iAppState
   */
  function removeAppStateInHash(sHash) {
    return sHash.replace(new RegExp(`[&?]*${enumURLParams.IAPPSTATEPARAM}=[^&]*`), "");
  }
  /**
   * Adds an iAppState inside a hash (or replaces an existing one).
   *
   * @param sHash The hash
   * @param sAppStateKey The iAppState to add
   * @returns The hash with the app state
   */
  function setAppStateInHash(sHash, sAppStateKey) {
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
  let RouterProxy = (_dec = defineUI5Class("sap.fe.core.RouterProxy"), _dec(_class = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(RouterProxy, _BaseObject);
    function RouterProxy() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseObject.call(this, ...args) || this;
      _this.bIsRebuildHistoryRunning = false;
      _this.bIsComputingTitleHierachy = false;
      _this.bIsGuardCrossAllowed = false;
      _this.sIAppStateKey = null;
      _this._bActivateRouteMatchSynchro = false;
      _this._bApplyRestore = false;
      _this._bDelayedRebuild = false;
      _this._pathMappings = [];
      return _this;
    }
    var _proto = RouterProxy.prototype;
    _proto.init = function init(oAppComponent, isfclEnabled) {
      // Save the name of the app (including startup parameters) for rebuilding full hashes later
      oAppComponent.getService("shellServices").then(() => {
        this._oShellServices = oAppComponent.getShellServices();
        this.initRaw(oAppComponent.getRouter());
        // We want to wait until the initial routeMatched is done before doing any navigation
        this.waitForRouteMatchBeforeNavigation();

        // Set feLevel=0 for the first Application page in the history
        history.replaceState(Object.assign({
          feLevel: 0
        }, history.state), "", window.location);
        this.fclEnabled = isfclEnabled;
        this._fnBlockingNavFilter = this._blockingNavigationFilter.bind(this);
        this._oShellServices.registerNavigationFilter(this._fnBlockingNavFilter);
      }).catch(function (oError) {
        Log.error("Cannot retrieve the shell services", oError);
      });
      this._fnHashGuard = this.hashGuard.bind(this);
      window.addEventListener("popstate", this._fnHashGuard);
      this._bDisableOnHashChange = false;
      this._bIgnoreRestore = false;
      this._bForceFocus = true; // Trigger the focus mechanism for the first view displayed by the app
    };
    _proto.destroy = function destroy() {
      if (this._oShellServices) {
        this._oShellServices.unregisterNavigationFilter(this._fnBlockingNavFilter);
      }
      window.removeEventListener("popstate", this._fnHashGuard);
    }

    /**
     * Raw initialization (for unit tests).
     *
     * @param oRouter The router used by this proxy
     */;
    _proto.initRaw = function initRaw(oRouter) {
      this._oRouter = oRouter;
      this._oManagedHistory = [];
      this._oNavigationGuard = null;
      const sCurrentAppHash = this.getHash();
      this._oManagedHistory.push(this._extractStateFromHash(sCurrentAppHash));

      // Set the iAppState if the initial hash contains one
      this.sIAppStateKey = findAppStateInHash(sCurrentAppHash);
    };
    _proto.getHash = function getHash() {
      return this._oRouter.getHashChanger().getHash();
    };
    _proto.isFocusForced = function isFocusForced() {
      return this._bForceFocus;
    };
    _proto.setFocusForced = function setFocusForced(bForced) {
      this._bForceFocus = bForced;
    }

    /**
     * Resets the internal variable sIAppStateKey.
     *
     * @function
     * @name sap.fe.core.RouterProxy#removeIAppStateKey
     * @ui5-restricted
     */;
    _proto.removeIAppStateKey = function removeIAppStateKey() {
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
     */;
    _proto.navToHash = function navToHash(sHash, bPreserveHistory, bDisablePreservationCache, bForceFocus, bPreserveShellBackNavigationHandler) {
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
    };
    _proto._internalNavToHash = function _internalNavToHash(sHash, bPreserveHistory, bDisablePreservationCache, bForceFocus) {
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
        this._bForceFocus = bForceFocus || aCurrentHashKeys.length < oNewState.keys.length && aCurrentHashKeys.every(function (key, index) {
          return key === oNewState.keys[index];
        });
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
     */;
    _proto.restoreHistory = function restoreHistory() {
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
     */;
    _proto.navBack = function navBack() {
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
     */;
    _proto.navTo = function navTo(sRouteName, oParameters) {
      const sHash = this._oRouter.getURL(sRouteName, oParameters);
      return this.navToHash(sHash, false, oParameters.noPreservationCache, false, !oParameters.bIsStickyMode);
    }

    /**
     * Exits the current app by navigating back
     * to the previous app (if any) or the FLP.
     *
     * @returns Promise that is resolved when we exit the app
     */;
    _proto.exitFromApp = function exitFromApp() {
      return this._oShellServices.backToPreviousApp();
    }

    /**
     * Checks whether a given hash can have an impact on the current state
     * i.e. if the hash is equal, compatible or an ancestor of the current state.
     *
     * @param sHash `true` if there is an impact
     * @returns If there is an impact
     */;
    _proto.isCurrentStateImpactedBy = function isCurrentStateImpactedBy(sHash) {
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
     */;
    _proto.isNavigationFinalized = function isNavigationFinalized() {
      return !this.bIsRebuildHistoryRunning && !this._bDelayedRebuild;
    }

    /**
     * Sets the last state as a guard.
     * Each future navigation will be checked against this guard, and a confirmation dialog will
     * be displayed before the navigation crosses the guard (i.e. goes to an ancestor of the guard).
     *
     * @param sHash The hash for the guard
     */;
    _proto.setNavigationGuard = function setNavigationGuard(sHash) {
      this._oNavigationGuard = createGuardFromHash(sHash);
      this.bIsGuardCrossAllowed = false;
    }

    /**
     * Disables the navigation guard.
     */;
    _proto.discardNavigationGuard = function discardNavigationGuard() {
      this._oNavigationGuard = null;
    }

    /**
     * Checks for the availability of the navigation guard.
     *
     * @returns `true` if navigating guard is available
     */;
    _proto.hasNavigationGuard = function hasNavigationGuard() {
      return this._oNavigationGuard !== null;
    }

    /**
     * Tests a hash against the navigation guard.
     *
     * @param sHash The hash to be tested
     * @returns `true` if navigating to the hash doesn't cross the guard
     */;
    _proto.checkHashWithGuard = function checkHashWithGuard(sHash) {
      return this._oNavigationGuard === null || this._oNavigationGuard.check(sHash);
    }

    /**
     * Checks if the user allowed the navigation guard to be crossed.
     *
     * @returns `true` if crossing the guard has been allowed by the user
     */;
    _proto.isGuardCrossAllowedByUser = function isGuardCrossAllowedByUser() {
      return this.bIsGuardCrossAllowed;
    }

    /**
     * Activates the synchronization for routeMatchedEvent.
     * The next NavToHash call will create a Synchronization object that will be resolved
     * by the corresponding onRouteMatched event, preventing another NavToHash to happen in parallel.
     */;
    _proto.activateRouteMatchSynchronization = function activateRouteMatchSynchronization() {
      this._bActivateRouteMatchSynchro = true;
    }

    /**
     * Resolve the routeMatch synchronization object, unlocking potential pending NavToHash calls.
     */;
    _proto.resolveRouteMatch = function resolveRouteMatch() {
      if (this._oRouteMatchSynchronization) {
        this._oRouteMatchSynchronization.resolve();
      }
    }

    /**
     * Makes sure no navigation can happen before a routeMatch happened.
     */;
    _proto.waitForRouteMatchBeforeNavigation = function waitForRouteMatchBeforeNavigation() {
      this._oRouteMatchSynchronization = new Synchronization();
      this._bActivateRouteMatchSynchro = false;
    };
    _proto._extractEntitySetsFromHash = function _extractEntitySetsFromHash(sHash) {
      if (sHash === undefined) {
        sHash = "";
      }
      const sHashNoParams = sHash.split("?")[0]; // remove params
      const aTokens = sHashNoParams.split("/");
      const names = [];
      aTokens.forEach(sToken => {
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
     */;
    _proto._extractStateFromHash = function _extractStateFromHash(sHash) {
      if (sHash === undefined) {
        sHash = "";
      }
      const oState = {
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
     */;
    _proto._pushNewState = function _pushNewState(oNewState, bRebuildOnly, bPreserveHistory, bDisableHistoryPreservation) {
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
          history.replaceState(Object.assign({
            feLevel: 0
          }, history.state), "");
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
        if ((bDisableHistoryPreservation || !oTopState.preserved) && this._compareCacheStates(oTopState, oNewState) !== enumState.ANCESTOR) {
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
        if (!this.sIAppStateKey && sPreviousIAppStateKey && (oComparisonStateResult === enumState.EQUAL || oComparisonStateResult === enumState.COMPATIBLE)) {
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
        return {
          type: "append"
        };
      } else if (iPopCount === 1) {
        // Only 1 state was popped --> replace current hash unless hash is the same (then nothing to do)
        return bHasSameHash ? {
          type: "none"
        } : {
          type: "replace"
        };
      } else {
        // More than 1 state was popped --> go bakc in history and replace hash if necessary
        return bHasSameHash ? {
          type: "back",
          steps: iPopCount - 1
        } : {
          type: "back-replace",
          steps: iPopCount - 1
        };
      }
    };
    _proto._blockingNavigationFilter = function _blockingNavigationFilter() {
      return this._bDisableOnHashChange ? "Custom" : "Continue";
    }

    /**
     * Disable the routing by calling the router stop method.
     *
     * @function
     * @memberof sap.fe.core.RouterProxy
     * @ui5-restricted
     * @final
     */;
    _proto._disableEventOnHashChange = function _disableEventOnHashChange() {
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
     */;
    _proto._enableEventOnHashChange = function _enableEventOnHashChange(bIgnoreCurrentHash) {
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
     */;
    _proto._rebuildBrowserHistory = function _rebuildBrowserHistory(oHistoryAction, bRebuildOnly) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      return new Promise(resolve => {
        this.bIsRebuildHistoryRunning = true;
        const oTargetState = this._oManagedHistory[this._oManagedHistory.length - 1],
          newLevel = this._oManagedHistory.length - 1;
        function replaceAsync() {
          if (!bRebuildOnly) {
            that._enableEventOnHashChange(true);
          }
          that._oRouter.getHashChanger().replaceHash(oTargetState.hash);
          history.replaceState(Object.assign({
            feLevel: newLevel
          }, history.state), "");
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
            that._oRouter.getHashChanger().replaceHash(oTargetState.hash);
            history.replaceState(Object.assign({
              feLevel: newLevel
            }, history.state), "");
            that.bIsRebuildHistoryRunning = false;
            resolve(true); // a navigation occurred
            break;
          case "append":
            that._oRouter.getHashChanger().setHash(oTargetState.hash);
            history.replaceState(Object.assign({
              feLevel: newLevel
            }, history.state), "");
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
            resolve(false);
          // no navigation --> resolve to false
        }
      });
    };
    _proto.getLastHistoryEntry = function getLastHistoryEntry() {
      return this._oManagedHistory[this._oManagedHistory.length - 1];
    };
    _proto.setPathMapping = function setPathMapping(mappings) {
      this._pathMappings = mappings.filter(mapping => {
        return mapping.oldPath !== mapping.newPath;
      });
    };
    _proto.hashGuard = function hashGuard() {
      let sHash = window.location.hash;
      if (sHash.indexOf("restoreHistory=true") !== -1) {
        this._bApplyRestore = true;
      } else if (!this.bIsRebuildHistoryRunning) {
        // Check if the hash needs to be changed (this happens in FCL when switching b/w edit and read-only with 3 columns open)
        const mapping = this._pathMappings.find(m => {
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
     */;
    _proto._compareCacheStates = function _compareCacheStates(oState1, oState2) {
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
     */;
    _proto.checkIfBackIsOutOfGuard = function checkIfBackIsOutOfGuard(sPresentHash) {
      let sPrevHash;
      let sCurrentHash;
      if (sPresentHash === undefined) {
        // We use window.location.hash instead of HashChanger.getInstance().getHash() because the latter
        // replaces characters in the URL (e.g. %24 replaced by $) and it causes issues when comparing
        // with the URLs in the managed history
        const oSplitHash = this._oShellServices.splitHash(window.location.hash);
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
     */;
    _proto.checkIfBackHasSameContext = function checkIfBackHasSameContext() {
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
     */;
    _proto.restoreFocusForCurrentHash = function restoreFocusForCurrentHash() {
      const currentHash = removeAppStateInHash(this.getHash());
      const stateForHash = this._oManagedHistory.find(state => {
        return removeAppStateInHash(state.hash) === currentHash;
      });
      let focusApplied = false;
      if (stateForHash !== null && stateForHash !== void 0 && stateForHash.focusControlId) {
        const focusControl = sap.ui.getCore().byId(stateForHash.focusControlId);
        focusControl === null || focusControl === void 0 ? void 0 : focusControl.focus(stateForHash.focusInfo);
        focusApplied = focusControl !== undefined;
      }
      return focusApplied;
    }

    /**
     * Stores the ID of the currently focused control in the history for the current hash.
     *
     */;
    _proto.storeFocusInfoForCurrentHash = function storeFocusInfoForCurrentHash() {
      const currentHash = removeAppStateInHash(this.getHash());
      const stateForHash = this._oManagedHistory.find(state => {
        return removeAppStateInHash(state.hash) === currentHash;
      });
      if (stateForHash) {
        const focusControlId = sap.ui.getCore().getCurrentFocusedControlId();
        const focusControl = focusControlId ? sap.ui.getCore().byId(focusControlId) : undefined;
        stateForHash.focusControlId = focusControlId;
        stateForHash.focusInfo = focusControl === null || focusControl === void 0 ? void 0 : focusControl.getFocusInfo();
      }
    }

    /**
     * Finds a layout value for a hash in the history.
     *
     * @param hash The hash to look for in the history.
     * @returns A layout value if it could be found, undefined otherwise.
     */;
    _proto.findLayoutForHash = function findLayoutForHash(hash) {
      var _targetState;
      if (!this.fclEnabled) {
        return undefined;
      }

      // Remove all query parameters from the hash
      const hashNoParam = hash.split("?")[0];

      // Look for the state backwards, so that we find the last state in the history (e.g. if we have 2 states with the same hash but 2 different layouts)
      let targetState;
      for (let index = this._oManagedHistory.length - 1; index >= 0 && targetState === undefined; index--) {
        if (this._oManagedHistory[index].hash.split("?")[0] === hashNoParam) {
          targetState = this._oManagedHistory[index];
        }
      }
      return (_targetState = targetState) === null || _targetState === void 0 ? void 0 : _targetState.sLayout;
    };
    return RouterProxy;
  }(BaseObject)) || _class);
  return RouterProxy;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJlbnVtU3RhdGUiLCJFUVVBTCIsIkNPTVBBVElCTEUiLCJBTkNFU1RPUiIsIkRJRkZFUkVOVCIsImVudW1VUkxQYXJhbXMiLCJMQVlPVVRQQVJBTSIsIklBUFBTVEFURVBBUkFNIiwiY3JlYXRlR3VhcmRGcm9tSGFzaCIsInNHdWFyZEhhc2giLCJfZ3VhcmRIYXNoIiwicmVwbGFjZSIsImNoZWNrIiwic0hhc2giLCJpbmRleE9mIiwiZmluZEFwcFN0YXRlSW5IYXNoIiwiYUFwcFN0YXRlIiwibWF0Y2giLCJSZWdFeHAiLCJsZW5ndGgiLCJyZW1vdmVBcHBTdGF0ZUluSGFzaCIsInNldEFwcFN0YXRlSW5IYXNoIiwic0FwcFN0YXRlS2V5Iiwic05ld0hhc2giLCJSb3V0ZXJQcm94eSIsImRlZmluZVVJNUNsYXNzIiwiYklzUmVidWlsZEhpc3RvcnlSdW5uaW5nIiwiYklzQ29tcHV0aW5nVGl0bGVIaWVyYWNoeSIsImJJc0d1YXJkQ3Jvc3NBbGxvd2VkIiwic0lBcHBTdGF0ZUtleSIsIl9iQWN0aXZhdGVSb3V0ZU1hdGNoU3luY2hybyIsIl9iQXBwbHlSZXN0b3JlIiwiX2JEZWxheWVkUmVidWlsZCIsIl9wYXRoTWFwcGluZ3MiLCJpbml0Iiwib0FwcENvbXBvbmVudCIsImlzZmNsRW5hYmxlZCIsImdldFNlcnZpY2UiLCJ0aGVuIiwiX29TaGVsbFNlcnZpY2VzIiwiZ2V0U2hlbGxTZXJ2aWNlcyIsImluaXRSYXciLCJnZXRSb3V0ZXIiLCJ3YWl0Rm9yUm91dGVNYXRjaEJlZm9yZU5hdmlnYXRpb24iLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwiT2JqZWN0IiwiYXNzaWduIiwiZmVMZXZlbCIsInN0YXRlIiwid2luZG93IiwibG9jYXRpb24iLCJmY2xFbmFibGVkIiwiX2ZuQmxvY2tpbmdOYXZGaWx0ZXIiLCJfYmxvY2tpbmdOYXZpZ2F0aW9uRmlsdGVyIiwiYmluZCIsInJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlciIsImNhdGNoIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJfZm5IYXNoR3VhcmQiLCJoYXNoR3VhcmQiLCJhZGRFdmVudExpc3RlbmVyIiwiX2JEaXNhYmxlT25IYXNoQ2hhbmdlIiwiX2JJZ25vcmVSZXN0b3JlIiwiX2JGb3JjZUZvY3VzIiwiZGVzdHJveSIsInVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm9Sb3V0ZXIiLCJfb1JvdXRlciIsIl9vTWFuYWdlZEhpc3RvcnkiLCJfb05hdmlnYXRpb25HdWFyZCIsInNDdXJyZW50QXBwSGFzaCIsImdldEhhc2giLCJwdXNoIiwiX2V4dHJhY3RTdGF0ZUZyb21IYXNoIiwiZ2V0SGFzaENoYW5nZXIiLCJpc0ZvY3VzRm9yY2VkIiwic2V0Rm9jdXNGb3JjZWQiLCJiRm9yY2VkIiwicmVtb3ZlSUFwcFN0YXRlS2V5IiwibmF2VG9IYXNoIiwiYlByZXNlcnZlSGlzdG9yeSIsImJEaXNhYmxlUHJlc2VydmF0aW9uQ2FjaGUiLCJiRm9yY2VGb2N1cyIsImJQcmVzZXJ2ZVNoZWxsQmFja05hdmlnYXRpb25IYW5kbGVyIiwic2V0QmFja05hdmlnYXRpb24iLCJfb1JvdXRlTWF0Y2hTeW5jaHJvbml6YXRpb24iLCJ3YWl0Rm9yIiwidW5kZWZpbmVkIiwiX2ludGVybmFsTmF2VG9IYXNoIiwiY2hlY2tIYXNoV2l0aEd1YXJkIiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImNvbmZpcm0iLCJnZXRUZXh0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJvTmV3U3RhdGUiLCJhQ3VycmVudEhhc2hLZXlzIiwiX2V4dHJhY3RFbnRpdHlTZXRzRnJvbUhhc2giLCJrZXlzIiwiZXZlcnkiLCJrZXkiLCJpbmRleCIsIm9IaXN0b3J5QWN0aW9uIiwiX3B1c2hOZXdTdGF0ZSIsInN0b3JlRm9jdXNJbmZvRm9yQ3VycmVudEhhc2giLCJfcmVidWlsZEJyb3dzZXJIaXN0b3J5IiwicmVzdG9yZUhpc3RvcnkiLCJzVGFyZ2V0SGFzaCIsIm5hdkJhY2siLCJzQ3VycmVudEhhc2giLCJzUHJldmlvdXNIYXNoIiwiaSIsImhhc2giLCJiYWNrIiwibmF2VG8iLCJzUm91dGVOYW1lIiwib1BhcmFtZXRlcnMiLCJnZXRVUkwiLCJub1ByZXNlcnZhdGlvbkNhY2hlIiwiYklzU3RpY2t5TW9kZSIsImV4aXRGcm9tQXBwIiwiYmFja1RvUHJldmlvdXNBcHAiLCJpc0N1cnJlbnRTdGF0ZUltcGFjdGVkQnkiLCJzdWJzdHJpbmciLCJvTG9jYWxHdWFyZCIsImlzTmF2aWdhdGlvbkZpbmFsaXplZCIsInNldE5hdmlnYXRpb25HdWFyZCIsImRpc2NhcmROYXZpZ2F0aW9uR3VhcmQiLCJoYXNOYXZpZ2F0aW9uR3VhcmQiLCJpc0d1YXJkQ3Jvc3NBbGxvd2VkQnlVc2VyIiwiYWN0aXZhdGVSb3V0ZU1hdGNoU3luY2hyb25pemF0aW9uIiwicmVzb2x2ZVJvdXRlTWF0Y2giLCJTeW5jaHJvbml6YXRpb24iLCJzSGFzaE5vUGFyYW1zIiwic3BsaXQiLCJhVG9rZW5zIiwibmFtZXMiLCJmb3JFYWNoIiwic1Rva2VuIiwib1N0YXRlIiwiYUxheW91dCIsInNMYXlvdXQiLCJzY3JlZW5Nb2RlIiwiYlJlYnVpbGRPbmx5IiwiYkRpc2FibGVIaXN0b3J5UHJlc2VydmF0aW9uIiwibGFzdEluZGV4IiwiaVBvcENvdW50IiwicG9wIiwicHJlc2VydmVkIiwib0xhc3RSZW1vdmVkSXRlbSIsIm9Ub3BTdGF0ZSIsIl9jb21wYXJlQ2FjaGVTdGF0ZXMiLCJzUHJldmlvdXNJQXBwU3RhdGVLZXkiLCJvQ29tcGFyaXNvblN0YXRlUmVzdWx0IiwiYkhhc1NhbWVIYXNoIiwiZm9jdXNDb250cm9sSWQiLCJmb2N1c0luZm8iLCJ0eXBlIiwic3RlcHMiLCJfZGlzYWJsZUV2ZW50T25IYXNoQ2hhbmdlIiwic3RvcCIsIl9lbmFibGVFdmVudE9uSGFzaENoYW5nZSIsImJJZ25vcmVDdXJyZW50SGFzaCIsImluaXRpYWxpemUiLCJ0aGF0Iiwib1RhcmdldFN0YXRlIiwibmV3TGV2ZWwiLCJyZXBsYWNlQXN5bmMiLCJyZXBsYWNlSGFzaCIsInNldFRpbWVvdXQiLCJiYWNrUmVwbGFjZUFzeW5jIiwiYmFja0FzeW5jIiwic2V0SGFzaCIsImdvIiwiZ2V0TGFzdEhpc3RvcnlFbnRyeSIsInNldFBhdGhNYXBwaW5nIiwibWFwcGluZ3MiLCJmaWx0ZXIiLCJtYXBwaW5nIiwib2xkUGF0aCIsIm5ld1BhdGgiLCJmaW5kIiwibSIsImFIYXNoU3BsaXQiLCJzQXBwSGFzaCIsIm9TdGF0ZTEiLCJvU3RhdGUyIiwiZXF1YWwiLCJjaGVja0lmQmFja0lzT3V0T2ZHdWFyZCIsInNQcmVzZW50SGFzaCIsInNQcmV2SGFzaCIsIm9TcGxpdEhhc2giLCJzcGxpdEhhc2giLCJhcHBTcGVjaWZpY1JvdXRlIiwiVVJJIiwiZGVjb2RlIiwiY2hlY2tJZkJhY2tIYXNTYW1lQ29udGV4dCIsIm9DdXJyZW50U3RhdGUiLCJvUHJldmlvdXNTdGF0ZSIsInJlc3RvcmVGb2N1c0ZvckN1cnJlbnRIYXNoIiwiY3VycmVudEhhc2giLCJzdGF0ZUZvckhhc2giLCJmb2N1c0FwcGxpZWQiLCJmb2N1c0NvbnRyb2wiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJieUlkIiwiZm9jdXMiLCJnZXRDdXJyZW50Rm9jdXNlZENvbnRyb2xJZCIsImdldEZvY3VzSW5mbyIsImZpbmRMYXlvdXRGb3JIYXNoIiwiaGFzaE5vUGFyYW0iLCJ0YXJnZXRTdGF0ZSIsIkJhc2VPYmplY3QiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlJvdXRlclByb3h5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIFJlc291cmNlQnVuZGxlIGZyb20gXCJzYXAvYmFzZS9pMThuL1Jlc291cmNlQnVuZGxlXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgU3luY2hyb25pemF0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N5bmNocm9uaXphdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBJU2hlbGxTZXJ2aWNlcyB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaGVsbFNlcnZpY2VzRmFjdG9yeVwiO1xuaW1wb3J0IEJhc2VPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL09iamVjdFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCB0eXBlIFJvdXRlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9Sb3V0ZXJcIjtcbmltcG9ydCBVUkkgZnJvbSBcInNhcC91aS90aGlyZHBhcnR5L1VSSVwiO1xuXG5jb25zdCBlbnVtU3RhdGUgPSB7XG5cdEVRVUFMOiAwLFxuXHRDT01QQVRJQkxFOiAxLFxuXHRBTkNFU1RPUjogMixcblx0RElGRkVSRU5UOiAzXG59O1xuY29uc3QgZW51bVVSTFBhcmFtcyA9IHtcblx0TEFZT1VUUEFSQU06IFwibGF5b3V0XCIsXG5cdElBUFBTVEFURVBBUkFNOiBcInNhcC1pYXBwLXN0YXRlXCJcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIEhhc2hHdWFyZCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHNHdWFyZEhhc2ggVGhlIGhhc2ggdXNlZCBmb3IgdGhlIGd1YXJkXG4gKiBAcmV0dXJucyBUaGUgY3JlYXRlZCBoYXNoIGd1YXJkXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUd1YXJkRnJvbUhhc2goc0d1YXJkSGFzaDogc3RyaW5nKSB7XG5cdHJldHVybiB7XG5cdFx0X2d1YXJkSGFzaDogc0d1YXJkSGFzaC5yZXBsYWNlKC9cXD9bXj9dKiQvLCBcIlwiKSwgLy8gUmVtb3ZlIHF1ZXJ5IHBhcnRcblx0XHRjaGVjazogZnVuY3Rpb24gKHNIYXNoOiBhbnkpIHtcblx0XHRcdHJldHVybiBzSGFzaC5pbmRleE9mKHRoaXMuX2d1YXJkSGFzaCkgPT09IDA7XG5cdFx0fVxuXHR9O1xufVxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpQXBwU3RhdGUgcGFydCBmcm9tIGEgaGFzaCAob3IgbnVsbCBpZiBub3QgZm91bmQpLlxuICpcbiAqIEBwYXJhbSBzSGFzaCBUaGUgaGFzaFxuICogQHJldHVybnMgVGhlIGlBcHBTdGF0ZSBwYXJ0IG9mIHRoZSBoYXNoXG4gKi9cbmZ1bmN0aW9uIGZpbmRBcHBTdGF0ZUluSGFzaChzSGFzaDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG5cdGNvbnN0IGFBcHBTdGF0ZSA9IHNIYXNoLm1hdGNoKG5ldyBSZWdFeHAoYFxcXFw/Lioke2VudW1VUkxQYXJhbXMuSUFQUFNUQVRFUEFSQU19PShbXiZdKilgKSk7XG5cdHJldHVybiBhQXBwU3RhdGUgJiYgYUFwcFN0YXRlLmxlbmd0aCA+IDEgPyBhQXBwU3RhdGVbMV0gOiBudWxsO1xufVxuLyoqXG4gKiBSZXR1cm5zIGEgaGFzaCB3aXRob3V0IGl0cyBpQXBwU3RhdGUgcGFydC5cbiAqXG4gKiBAcGFyYW0gc0hhc2ggVGhlIGhhc2hcbiAqIEByZXR1cm5zIFRoZSBoYXNoIHdpdGhvdXQgdGhlIGlBcHBTdGF0ZVxuICovXG5mdW5jdGlvbiByZW1vdmVBcHBTdGF0ZUluSGFzaChzSGFzaDogc3RyaW5nKSB7XG5cdHJldHVybiBzSGFzaC5yZXBsYWNlKG5ldyBSZWdFeHAoYFsmP10qJHtlbnVtVVJMUGFyYW1zLklBUFBTVEFURVBBUkFNfT1bXiZdKmApLCBcIlwiKTtcbn1cbi8qKlxuICogQWRkcyBhbiBpQXBwU3RhdGUgaW5zaWRlIGEgaGFzaCAob3IgcmVwbGFjZXMgYW4gZXhpc3Rpbmcgb25lKS5cbiAqXG4gKiBAcGFyYW0gc0hhc2ggVGhlIGhhc2hcbiAqIEBwYXJhbSBzQXBwU3RhdGVLZXkgVGhlIGlBcHBTdGF0ZSB0byBhZGRcbiAqIEByZXR1cm5zIFRoZSBoYXNoIHdpdGggdGhlIGFwcCBzdGF0ZVxuICovXG5mdW5jdGlvbiBzZXRBcHBTdGF0ZUluSGFzaChzSGFzaDogYW55LCBzQXBwU3RhdGVLZXk6IGFueSkge1xuXHRsZXQgc05ld0hhc2g7XG5cblx0aWYgKHNIYXNoLmluZGV4T2YoZW51bVVSTFBhcmFtcy5JQVBQU1RBVEVQQVJBTSkgPj0gMCkge1xuXHRcdC8vIElmIHRoZXJlJ3MgYWxyZWFkeSBhbiBpQXBwU3RhdGUgcGFyYW1ldGVyIGluIHRoZSBoYXNoLCByZXBsYWNlIGl0XG5cdFx0c05ld0hhc2ggPSBzSGFzaC5yZXBsYWNlKG5ldyBSZWdFeHAoYCR7ZW51bVVSTFBhcmFtcy5JQVBQU1RBVEVQQVJBTX09W14mXSpgKSwgYCR7ZW51bVVSTFBhcmFtcy5JQVBQU1RBVEVQQVJBTX09JHtzQXBwU3RhdGVLZXl9YCk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gQWRkIHRoZSBpQXBwU3RhdGUgcGFyYW1ldGVyIGluIHRoZSBoYXNoXG5cdFx0aWYgKHNIYXNoLmluZGV4T2YoXCI/XCIpIDwgMCkge1xuXHRcdFx0c05ld0hhc2ggPSBgJHtzSGFzaH0/YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c05ld0hhc2ggPSBgJHtzSGFzaH0mYDtcblx0XHR9XG5cdFx0c05ld0hhc2ggKz0gYCR7ZW51bVVSTFBhcmFtcy5JQVBQU1RBVEVQQVJBTX09JHtzQXBwU3RhdGVLZXl9YDtcblx0fVxuXG5cdHJldHVybiBzTmV3SGFzaDtcbn1cblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuUm91dGVyUHJveHlcIilcbmNsYXNzIFJvdXRlclByb3h5IGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cdGJJc1JlYnVpbGRIaXN0b3J5UnVubmluZyA9IGZhbHNlO1xuXG5cdGJJc0NvbXB1dGluZ1RpdGxlSGllcmFjaHkgPSBmYWxzZTtcblxuXHRiSXNHdWFyZENyb3NzQWxsb3dlZCA9IGZhbHNlO1xuXG5cdHNJQXBwU3RhdGVLZXk6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG5cdF9vU2hlbGxTZXJ2aWNlcyE6IElTaGVsbFNlcnZpY2VzO1xuXG5cdGZjbEVuYWJsZWQhOiBib29sZWFuO1xuXG5cdF9mbkJsb2NraW5nTmF2RmlsdGVyITogRnVuY3Rpb247XG5cblx0X2ZuSGFzaEd1YXJkITogRnVuY3Rpb247XG5cblx0X2JEaXNhYmxlT25IYXNoQ2hhbmdlITogYm9vbGVhbjtcblxuXHRfYklnbm9yZVJlc3RvcmUhOiBib29sZWFuO1xuXG5cdF9iRm9yY2VGb2N1cyE6IGJvb2xlYW47XG5cblx0X29Sb3V0ZXIhOiBSb3V0ZXI7XG5cblx0X29NYW5hZ2VkSGlzdG9yeSE6IGFueVtdO1xuXG5cdF9vTmF2aWdhdGlvbkd1YXJkOiBhbnk7XG5cblx0b1Jlc291cmNlQnVuZGxlPzogUmVzb3VyY2VCdW5kbGU7XG5cblx0X29Sb3V0ZU1hdGNoU3luY2hyb25pemF0aW9uPzogU3luY2hyb25pemF0aW9uO1xuXG5cdF9iQWN0aXZhdGVSb3V0ZU1hdGNoU3luY2hybzogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdF9iQXBwbHlSZXN0b3JlOiBib29sZWFuID0gZmFsc2U7XG5cblx0X2JEZWxheWVkUmVidWlsZDogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdF9wYXRoTWFwcGluZ3M6IHsgb2xkUGF0aDogc3RyaW5nOyBuZXdQYXRoOiBzdHJpbmcgfVtdID0gW107XG5cblx0aW5pdChvQXBwQ29tcG9uZW50OiBhbnksIGlzZmNsRW5hYmxlZDogYm9vbGVhbikge1xuXHRcdC8vIFNhdmUgdGhlIG5hbWUgb2YgdGhlIGFwcCAoaW5jbHVkaW5nIHN0YXJ0dXAgcGFyYW1ldGVycykgZm9yIHJlYnVpbGRpbmcgZnVsbCBoYXNoZXMgbGF0ZXJcblx0XHRvQXBwQ29tcG9uZW50XG5cdFx0XHQuZ2V0U2VydmljZShcInNoZWxsU2VydmljZXNcIilcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0dGhpcy5fb1NoZWxsU2VydmljZXMgPSBvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKTtcblxuXHRcdFx0XHR0aGlzLmluaXRSYXcob0FwcENvbXBvbmVudC5nZXRSb3V0ZXIoKSk7XG5cdFx0XHRcdC8vIFdlIHdhbnQgdG8gd2FpdCB1bnRpbCB0aGUgaW5pdGlhbCByb3V0ZU1hdGNoZWQgaXMgZG9uZSBiZWZvcmUgZG9pbmcgYW55IG5hdmlnYXRpb25cblx0XHRcdFx0dGhpcy53YWl0Rm9yUm91dGVNYXRjaEJlZm9yZU5hdmlnYXRpb24oKTtcblxuXHRcdFx0XHQvLyBTZXQgZmVMZXZlbD0wIGZvciB0aGUgZmlyc3QgQXBwbGljYXRpb24gcGFnZSBpbiB0aGUgaGlzdG9yeVxuXHRcdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZShcblx0XHRcdFx0XHRPYmplY3QuYXNzaWduKFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRmZUxldmVsOiAwXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0aGlzdG9yeS5zdGF0ZVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XCJcIixcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24gYXMgYW55XG5cdFx0XHRcdCk7XG5cdFx0XHRcdHRoaXMuZmNsRW5hYmxlZCA9IGlzZmNsRW5hYmxlZDtcblxuXHRcdFx0XHR0aGlzLl9mbkJsb2NraW5nTmF2RmlsdGVyID0gdGhpcy5fYmxvY2tpbmdOYXZpZ2F0aW9uRmlsdGVyLmJpbmQodGhpcyk7XG5cdFx0XHRcdHRoaXMuX29TaGVsbFNlcnZpY2VzLnJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlcih0aGlzLl9mbkJsb2NraW5nTmF2RmlsdGVyKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkNhbm5vdCByZXRyaWV2ZSB0aGUgc2hlbGwgc2VydmljZXNcIiwgb0Vycm9yKTtcblx0XHRcdH0pO1xuXHRcdHRoaXMuX2ZuSGFzaEd1YXJkID0gdGhpcy5oYXNoR3VhcmQuYmluZCh0aGlzKTtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIHRoaXMuX2ZuSGFzaEd1YXJkIGFzIGFueSk7XG5cdFx0dGhpcy5fYkRpc2FibGVPbkhhc2hDaGFuZ2UgPSBmYWxzZTtcblx0XHR0aGlzLl9iSWdub3JlUmVzdG9yZSA9IGZhbHNlO1xuXHRcdHRoaXMuX2JGb3JjZUZvY3VzID0gdHJ1ZTsgLy8gVHJpZ2dlciB0aGUgZm9jdXMgbWVjaGFuaXNtIGZvciB0aGUgZmlyc3QgdmlldyBkaXNwbGF5ZWQgYnkgdGhlIGFwcFxuXHR9XG5cblx0ZGVzdHJveSgpIHtcblx0XHRpZiAodGhpcy5fb1NoZWxsU2VydmljZXMpIHtcblx0XHRcdHRoaXMuX29TaGVsbFNlcnZpY2VzLnVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKHRoaXMuX2ZuQmxvY2tpbmdOYXZGaWx0ZXIpO1xuXHRcdH1cblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIHRoaXMuX2ZuSGFzaEd1YXJkIGFzIGFueSk7XG5cdH1cblxuXHQvKipcblx0ICogUmF3IGluaXRpYWxpemF0aW9uIChmb3IgdW5pdCB0ZXN0cykuXG5cdCAqXG5cdCAqIEBwYXJhbSBvUm91dGVyIFRoZSByb3V0ZXIgdXNlZCBieSB0aGlzIHByb3h5XG5cdCAqL1xuXHRpbml0UmF3KG9Sb3V0ZXI6IFJvdXRlcikge1xuXHRcdHRoaXMuX29Sb3V0ZXIgPSBvUm91dGVyO1xuXHRcdHRoaXMuX29NYW5hZ2VkSGlzdG9yeSA9IFtdO1xuXHRcdHRoaXMuX29OYXZpZ2F0aW9uR3VhcmQgPSBudWxsO1xuXG5cdFx0Y29uc3Qgc0N1cnJlbnRBcHBIYXNoID0gdGhpcy5nZXRIYXNoKCk7XG5cdFx0dGhpcy5fb01hbmFnZWRIaXN0b3J5LnB1c2godGhpcy5fZXh0cmFjdFN0YXRlRnJvbUhhc2goc0N1cnJlbnRBcHBIYXNoKSk7XG5cblx0XHQvLyBTZXQgdGhlIGlBcHBTdGF0ZSBpZiB0aGUgaW5pdGlhbCBoYXNoIGNvbnRhaW5zIG9uZVxuXHRcdHRoaXMuc0lBcHBTdGF0ZUtleSA9IGZpbmRBcHBTdGF0ZUluSGFzaChzQ3VycmVudEFwcEhhc2gpO1xuXHR9XG5cblx0Z2V0SGFzaCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fb1JvdXRlci5nZXRIYXNoQ2hhbmdlcigpLmdldEhhc2goKTtcblx0fVxuXG5cdGlzRm9jdXNGb3JjZWQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2JGb3JjZUZvY3VzO1xuXHR9XG5cblx0c2V0Rm9jdXNGb3JjZWQoYkZvcmNlZDogYm9vbGVhbikge1xuXHRcdHRoaXMuX2JGb3JjZUZvY3VzID0gYkZvcmNlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNldHMgdGhlIGludGVybmFsIHZhcmlhYmxlIHNJQXBwU3RhdGVLZXkuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5Sb3V0ZXJQcm94eSNyZW1vdmVJQXBwU3RhdGVLZXlcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRyZW1vdmVJQXBwU3RhdGVLZXkoKSB7XG5cdFx0dGhpcy5zSUFwcFN0YXRlS2V5ID0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gYSBzcGVjaWZpYyBoYXNoLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuUm91dGVyUHJveHkjbmF2VG9IYXNoXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5Sb3V0ZXJQcm94eVxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBzSGFzaCBIYXNoIHRvIGJlIG5hdmlnYXRlZCB0b1xuXHQgKiBAcGFyYW0gYlByZXNlcnZlSGlzdG9yeSBJZiBzZXQgdG8gdHJ1ZSwgbm9uLWFuY2VzdG9yIGVudHJpZXMgaW4gaGlzdG9yeSB3aWxsIGJlIHJldGFpbmVkXG5cdCAqIEBwYXJhbSBiRGlzYWJsZVByZXNlcnZhdGlvbkNhY2hlIElmIHNldCB0byB0cnVlLCBjYWNoZSBwcmVzZXJ2YXRpb24gbWVjaGFuaXNtIGlzIGRpc2FibGVkIGZvciB0aGUgY3VycmVudCBuYXZpZ2F0aW9uXG5cdCAqIEBwYXJhbSBiRm9yY2VGb2N1cyBJZiBzZXQgdG8gdHJ1ZSwgdGhlIGxvZ2ljIHRvIHNldCB0aGUgZm9jdXMgb25jZSB0aGUgbmF2aWdhdGlvbiBpcyBmaW5hbGl6ZWQgd2lsbCBiZSB0cmlnZ2VyZWQgKG9uUGFnZVJlYWR5KVxuXHQgKiBAcGFyYW0gYlByZXNlcnZlU2hlbGxCYWNrTmF2aWdhdGlvbkhhbmRsZXIgSWYgbm90IHNldCB0byBmYWxzZSwgdGhlIGJhY2sgbmF2aWdhdGlvbiBpcyBzZXQgdG8gdW5kZWZpbmVkXG5cdCAqIEByZXR1cm5zIFByb21pc2UgKHJlc29sdmVkIHdoZW4gdGhlIG5hdmlnYXRpb24gaXMgZmluYWxpemVkKSB0aGF0IHJldHVybnMgJ3RydWUnIGlmIGEgbmF2aWdhdGlvbiB0b29rIHBsYWNlLCAnZmFsc2UnIGlmIHRoZSBuYXZpZ2F0aW9uIGRpZG4ndCBoYXBwZW5cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRuYXZUb0hhc2goXG5cdFx0c0hhc2g6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0XHRiUHJlc2VydmVIaXN0b3J5PzogYm9vbGVhbixcblx0XHRiRGlzYWJsZVByZXNlcnZhdGlvbkNhY2hlPzogYm9vbGVhbixcblx0XHRiRm9yY2VGb2N1cz86IGJvb2xlYW4sXG5cdFx0YlByZXNlcnZlU2hlbGxCYWNrTmF2aWdhdGlvbkhhbmRsZXI/OiBib29sZWFuXG5cdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGlmIChiUHJlc2VydmVTaGVsbEJhY2tOYXZpZ2F0aW9uSGFuZGxlciAhPT0gZmFsc2UpIHtcblx0XHRcdHRoaXMuX29TaGVsbFNlcnZpY2VzLnNldEJhY2tOYXZpZ2F0aW9uKCk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLl9vUm91dGVNYXRjaFN5bmNocm9uaXphdGlvbikge1xuXHRcdFx0cmV0dXJuIHRoaXMuX29Sb3V0ZU1hdGNoU3luY2hyb25pemF0aW9uLndhaXRGb3IoKS50aGVuKCgpID0+IHtcblx0XHRcdFx0dGhpcy5fb1JvdXRlTWF0Y2hTeW5jaHJvbml6YXRpb24gPSB1bmRlZmluZWQ7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9pbnRlcm5hbE5hdlRvSGFzaChzSGFzaCwgYlByZXNlcnZlSGlzdG9yeSwgYkRpc2FibGVQcmVzZXJ2YXRpb25DYWNoZSwgYkZvcmNlRm9jdXMpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0aGlzLl9iQWN0aXZhdGVSb3V0ZU1hdGNoU3luY2hybykge1xuXHRcdFx0XHR0aGlzLndhaXRGb3JSb3V0ZU1hdGNoQmVmb3JlTmF2aWdhdGlvbigpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMuX2ludGVybmFsTmF2VG9IYXNoKHNIYXNoLCBiUHJlc2VydmVIaXN0b3J5LCBiRGlzYWJsZVByZXNlcnZhdGlvbkNhY2hlLCBiRm9yY2VGb2N1cyk7XG5cdFx0fVxuXHR9XG5cblx0X2ludGVybmFsTmF2VG9IYXNoKHNIYXNoOiBhbnksIGJQcmVzZXJ2ZUhpc3Rvcnk6IGFueSwgYkRpc2FibGVQcmVzZXJ2YXRpb25DYWNoZTogYW55LCBiRm9yY2VGb2N1cz86IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHQvLyBBZGQgdGhlIGFwcCBzdGF0ZSBpbiB0aGUgaGFzaCBpZiBuZWVkZWRcblx0XHRpZiAodGhpcy5mY2xFbmFibGVkICYmIHRoaXMuc0lBcHBTdGF0ZUtleSAmJiAhZmluZEFwcFN0YXRlSW5IYXNoKHNIYXNoKSkge1xuXHRcdFx0c0hhc2ggPSBzZXRBcHBTdGF0ZUluSGFzaChzSGFzaCwgdGhpcy5zSUFwcFN0YXRlS2V5KTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuY2hlY2tIYXNoV2l0aEd1YXJkKHNIYXNoKSkge1xuXHRcdFx0aWYgKCF0aGlzLm9SZXNvdXJjZUJ1bmRsZSkge1xuXHRcdFx0XHR0aGlzLm9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFdlIGhhdmUgdG8gdXNlIGEgY29uZmlybSBoZXJlIGZvciBVSSBjb25zaXN0ZW5jeSByZWFzb25zLCBhcyB3aXRoIHNvbWUgc2NlbmFyaW9zXG5cdFx0XHQvLyBpbiB0aGUgRWRpdEZsb3cgd2UgcmVseSBvbiBhIFVJNSBtZWNoYW5pc20gdGhhdCBkaXNwbGF5cyBhIGNvbmZpcm0gZGlhbG9nLlxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWFsZXJ0XG5cdFx0XHRpZiAoIWNvbmZpcm0odGhpcy5vUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfUk9VVEVSX1BST1hZX1NBUEZFX0VYSVRfTk9UU0FWRURfTUVTU0FHRVwiKSkpIHtcblx0XHRcdFx0Ly8gVGhlIHVzZXIgY2xpY2tlZCBvbiBDYW5jZWwgLS0+IGNhbmNlbCBuYXZpZ2F0aW9uXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5iSXNHdWFyZENyb3NzQWxsb3dlZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gSW4gY2FzZSB0aGUgbmF2aWdhdGlvbiB3aWxsIGNhdXNlIGEgbmV3IHZpZXcgdG8gYmUgZGlzcGxheWVkLCB3ZSBmb3JjZSB0aGUgZm9jdXNcblx0XHQvLyBJLmUuIGlmIHRoZSBrZXlzIGZvciB0aGUgaGFzaCB3ZSdyZSBuYXZpZ2F0aW5nIHRvIGlzIGEgc3VwZXJzZXQgb2YgdGhlIGN1cnJlbnQgaGFzaCBrZXlzLlxuXHRcdGNvbnN0IG9OZXdTdGF0ZSA9IHRoaXMuX2V4dHJhY3RTdGF0ZUZyb21IYXNoKHNIYXNoKTtcblx0XHRpZiAoIXRoaXMuX2JGb3JjZUZvY3VzKSB7XG5cdFx0XHQvLyBJZiB0aGUgZm9jdXMgd2FzIGFscmVhZHkgZm9yY2VkLCBrZWVwIGl0XG5cdFx0XHRjb25zdCBhQ3VycmVudEhhc2hLZXlzID0gdGhpcy5fZXh0cmFjdEVudGl0eVNldHNGcm9tSGFzaCh0aGlzLmdldEhhc2goKSk7XG5cdFx0XHR0aGlzLl9iRm9yY2VGb2N1cyA9XG5cdFx0XHRcdGJGb3JjZUZvY3VzIHx8XG5cdFx0XHRcdChhQ3VycmVudEhhc2hLZXlzLmxlbmd0aCA8IG9OZXdTdGF0ZS5rZXlzLmxlbmd0aCAmJlxuXHRcdFx0XHRcdGFDdXJyZW50SGFzaEtleXMuZXZlcnkoZnVuY3Rpb24gKGtleTogYW55LCBpbmRleDogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ga2V5ID09PSBvTmV3U3RhdGUua2V5c1tpbmRleF07XG5cdFx0XHRcdFx0fSkpO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9IaXN0b3J5QWN0aW9uID0gdGhpcy5fcHVzaE5ld1N0YXRlKG9OZXdTdGF0ZSwgZmFsc2UsIGJQcmVzZXJ2ZUhpc3RvcnksIGJEaXNhYmxlUHJlc2VydmF0aW9uQ2FjaGUpO1xuXHRcdHRoaXMuc3RvcmVGb2N1c0luZm9Gb3JDdXJyZW50SGFzaCgpO1xuXG5cdFx0cmV0dXJuIHRoaXMuX3JlYnVpbGRCcm93c2VySGlzdG9yeShvSGlzdG9yeUFjdGlvbiwgZmFsc2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsZWFycyBicm93c2VyIGhpc3RvcnkgaWYgZW50cmllcyBoYXZlIGJlZW4gYWRkZWQgd2l0aG91dCB1c2luZyB0aGUgUm91dGVyUHJveHkuXG5cdCAqIFVwZGF0ZXMgdGhlIGludGVybmFsIGhpc3RvcnkgYWNjb3JkaW5nbHkuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCBvbmNlIHRoZSBoaXN0b3J5IGlzIHJlYnVpbHRcblx0ICovXG5cdHJlc3RvcmVIaXN0b3J5KCkge1xuXHRcdGlmICh0aGlzLl9iQXBwbHlSZXN0b3JlKSB7XG5cdFx0XHR0aGlzLl9iQXBwbHlSZXN0b3JlID0gZmFsc2U7XG5cdFx0XHRsZXQgc1RhcmdldEhhc2ggPSB0aGlzLmdldEhhc2goKTtcblx0XHRcdHNUYXJnZXRIYXNoID0gc1RhcmdldEhhc2gucmVwbGFjZSgvKFxcP3wmKXJlc3RvcmVIaXN0b3J5PXRydWUvLCBcIlwiKTtcblx0XHRcdGNvbnN0IG9OZXdTdGF0ZSA9IHRoaXMuX2V4dHJhY3RTdGF0ZUZyb21IYXNoKHNUYXJnZXRIYXNoKTtcblxuXHRcdFx0Y29uc3Qgb0hpc3RvcnlBY3Rpb24gPSB0aGlzLl9wdXNoTmV3U3RhdGUob05ld1N0YXRlLCB0cnVlLCBmYWxzZSwgdHJ1ZSk7XG5cblx0XHRcdHJldHVybiB0aGlzLl9yZWJ1aWxkQnJvd3Nlckhpc3Rvcnkob0hpc3RvcnlBY3Rpb24sIHRydWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyBiYWNrIGluIHRoZSBoaXN0b3J5LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBpcyBmaW5hbGl6ZWRcblx0ICovXG5cdG5hdkJhY2soKSB7XG5cdFx0Y29uc3Qgc0N1cnJlbnRIYXNoID0gdGhpcy5nZXRIYXNoKCk7XG5cdFx0bGV0IHNQcmV2aW91c0hhc2g7XG5cblx0XHQvLyBMb29rIGZvciB0aGUgY3VycmVudCBoYXNoIGluIHRoZSBtYW5hZ2VkIGhpc3Rvcnlcblx0XHRmb3IgKGxldCBpID0gdGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcblx0XHRcdGlmICh0aGlzLl9vTWFuYWdlZEhpc3RvcnlbaV0uaGFzaCA9PT0gc0N1cnJlbnRIYXNoKSB7XG5cdFx0XHRcdHNQcmV2aW91c0hhc2ggPSB0aGlzLl9vTWFuYWdlZEhpc3RvcnlbaSAtIDFdLmhhc2g7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChzUHJldmlvdXNIYXNoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5uYXZUb0hhc2goc1ByZXZpb3VzSGFzaCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFdlIGNvdWxkbid0IGZpbmQgYSBwcmV2aW91cyBoYXNoIGluIGhpc3Rvcnlcblx0XHRcdC8vIFRoaXMgY2FuIGhhcHBlbiB3aGVuIG5hdmlnYXRpbmcgZnJvbSBhIHRyYW5zaWVudCBoYXNoIGluIGEgY3JlYXRlIGFwcCwgYW5kXG5cdFx0XHQvLyBpbiB0aGF0IGNhc2UgaGlzdG9yeS5iYWNrIHdvdWxkIGdvIGJhY2sgdG8gdGhlIEZMUFxuXHRcdFx0d2luZG93Lmhpc3RvcnkuYmFjaygpO1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gYSByb3V0ZSB3aXRoIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUm91dGVOYW1lIFRoZSByb3V0ZSBuYW1lIHRvIGJlIG5hdmlnYXRlZCB0b1xuXHQgKiBAcGFyYW0gb1BhcmFtZXRlcnMgUGFyYW1ldGVycyBmb3IgdGhlIG5hdmlnYXRpb25cblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIG5hdmlnYXRpb24gaXMgZmluYWxpemVkXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0bmF2VG8oc1JvdXRlTmFtZTogc3RyaW5nLCBvUGFyYW1ldGVyczogYW55KSB7XG5cdFx0Y29uc3Qgc0hhc2ggPSB0aGlzLl9vUm91dGVyLmdldFVSTChzUm91dGVOYW1lLCBvUGFyYW1ldGVycyk7XG5cdFx0cmV0dXJuIHRoaXMubmF2VG9IYXNoKHNIYXNoLCBmYWxzZSwgb1BhcmFtZXRlcnMubm9QcmVzZXJ2YXRpb25DYWNoZSwgZmFsc2UsICFvUGFyYW1ldGVycy5iSXNTdGlja3lNb2RlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFeGl0cyB0aGUgY3VycmVudCBhcHAgYnkgbmF2aWdhdGluZyBiYWNrXG5cdCAqIHRvIHRoZSBwcmV2aW91cyBhcHAgKGlmIGFueSkgb3IgdGhlIEZMUC5cblx0ICpcblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gd2UgZXhpdCB0aGUgYXBwXG5cdCAqL1xuXHRleGl0RnJvbUFwcCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fb1NoZWxsU2VydmljZXMuYmFja1RvUHJldmlvdXNBcHAoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3Mgd2hldGhlciBhIGdpdmVuIGhhc2ggY2FuIGhhdmUgYW4gaW1wYWN0IG9uIHRoZSBjdXJyZW50IHN0YXRlXG5cdCAqIGkuZS4gaWYgdGhlIGhhc2ggaXMgZXF1YWwsIGNvbXBhdGlibGUgb3IgYW4gYW5jZXN0b3Igb2YgdGhlIGN1cnJlbnQgc3RhdGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzSGFzaCBgdHJ1ZWAgaWYgdGhlcmUgaXMgYW4gaW1wYWN0XG5cdCAqIEByZXR1cm5zIElmIHRoZXJlIGlzIGFuIGltcGFjdFxuXHQgKi9cblx0aXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5KHNIYXNoOiBhbnkpIHtcblx0XHRpZiAoc0hhc2hbMF0gPT09IFwiL1wiKSB7XG5cdFx0XHRzSGFzaCA9IHNIYXNoLnN1YnN0cmluZygxKTtcblx0XHR9XG5cdFx0Y29uc3Qgb0xvY2FsR3VhcmQgPSBjcmVhdGVHdWFyZEZyb21IYXNoKHNIYXNoKTtcblx0XHRyZXR1cm4gb0xvY2FsR3VhcmQuY2hlY2sodGhpcy5nZXRIYXNoKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIG5hdmlnYXRpb24gaXMgY3VycmVudGx5IGJlaW5nIHByb2Nlc3NlZC5cblx0ICpcblx0ICogQHJldHVybnMgYGZhbHNlYCBpZiBhIG5hdmlnYXRpb24gaGFzIGJlZW4gdHJpZ2dlcmVkIGluIHRoZSBSb3V0ZXJQcm94eSBhbmQgaXMgbm90IHlldCBmaW5hbGl6ZWRcblx0ICovXG5cdGlzTmF2aWdhdGlvbkZpbmFsaXplZCgpIHtcblx0XHRyZXR1cm4gIXRoaXMuYklzUmVidWlsZEhpc3RvcnlSdW5uaW5nICYmICF0aGlzLl9iRGVsYXllZFJlYnVpbGQ7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgbGFzdCBzdGF0ZSBhcyBhIGd1YXJkLlxuXHQgKiBFYWNoIGZ1dHVyZSBuYXZpZ2F0aW9uIHdpbGwgYmUgY2hlY2tlZCBhZ2FpbnN0IHRoaXMgZ3VhcmQsIGFuZCBhIGNvbmZpcm1hdGlvbiBkaWFsb2cgd2lsbFxuXHQgKiBiZSBkaXNwbGF5ZWQgYmVmb3JlIHRoZSBuYXZpZ2F0aW9uIGNyb3NzZXMgdGhlIGd1YXJkIChpLmUuIGdvZXMgdG8gYW4gYW5jZXN0b3Igb2YgdGhlIGd1YXJkKS5cblx0ICpcblx0ICogQHBhcmFtIHNIYXNoIFRoZSBoYXNoIGZvciB0aGUgZ3VhcmRcblx0ICovXG5cdHNldE5hdmlnYXRpb25HdWFyZChzSGFzaDogc3RyaW5nKSB7XG5cdFx0dGhpcy5fb05hdmlnYXRpb25HdWFyZCA9IGNyZWF0ZUd1YXJkRnJvbUhhc2goc0hhc2gpO1xuXHRcdHRoaXMuYklzR3VhcmRDcm9zc0FsbG93ZWQgPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNhYmxlcyB0aGUgbmF2aWdhdGlvbiBndWFyZC5cblx0ICovXG5cdGRpc2NhcmROYXZpZ2F0aW9uR3VhcmQoKSB7XG5cdFx0dGhpcy5fb05hdmlnYXRpb25HdWFyZCA9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGZvciB0aGUgYXZhaWxhYmlsaXR5IG9mIHRoZSBuYXZpZ2F0aW9uIGd1YXJkLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgbmF2aWdhdGluZyBndWFyZCBpcyBhdmFpbGFibGVcblx0ICovXG5cdGhhc05hdmlnYXRpb25HdWFyZCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fb05hdmlnYXRpb25HdWFyZCAhPT0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUZXN0cyBhIGhhc2ggYWdhaW5zdCB0aGUgbmF2aWdhdGlvbiBndWFyZC5cblx0ICpcblx0ICogQHBhcmFtIHNIYXNoIFRoZSBoYXNoIHRvIGJlIHRlc3RlZFxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgbmF2aWdhdGluZyB0byB0aGUgaGFzaCBkb2Vzbid0IGNyb3NzIHRoZSBndWFyZFxuXHQgKi9cblx0Y2hlY2tIYXNoV2l0aEd1YXJkKHNIYXNoOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gdGhpcy5fb05hdmlnYXRpb25HdWFyZCA9PT0gbnVsbCB8fCB0aGlzLl9vTmF2aWdhdGlvbkd1YXJkLmNoZWNrKHNIYXNoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIHVzZXIgYWxsb3dlZCB0aGUgbmF2aWdhdGlvbiBndWFyZCB0byBiZSBjcm9zc2VkLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgY3Jvc3NpbmcgdGhlIGd1YXJkIGhhcyBiZWVuIGFsbG93ZWQgYnkgdGhlIHVzZXJcblx0ICovXG5cdGlzR3VhcmRDcm9zc0FsbG93ZWRCeVVzZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuYklzR3VhcmRDcm9zc0FsbG93ZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQWN0aXZhdGVzIHRoZSBzeW5jaHJvbml6YXRpb24gZm9yIHJvdXRlTWF0Y2hlZEV2ZW50LlxuXHQgKiBUaGUgbmV4dCBOYXZUb0hhc2ggY2FsbCB3aWxsIGNyZWF0ZSBhIFN5bmNocm9uaXphdGlvbiBvYmplY3QgdGhhdCB3aWxsIGJlIHJlc29sdmVkXG5cdCAqIGJ5IHRoZSBjb3JyZXNwb25kaW5nIG9uUm91dGVNYXRjaGVkIGV2ZW50LCBwcmV2ZW50aW5nIGFub3RoZXIgTmF2VG9IYXNoIHRvIGhhcHBlbiBpbiBwYXJhbGxlbC5cblx0ICovXG5cdGFjdGl2YXRlUm91dGVNYXRjaFN5bmNocm9uaXphdGlvbigpIHtcblx0XHR0aGlzLl9iQWN0aXZhdGVSb3V0ZU1hdGNoU3luY2hybyA9IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZSB0aGUgcm91dGVNYXRjaCBzeW5jaHJvbml6YXRpb24gb2JqZWN0LCB1bmxvY2tpbmcgcG90ZW50aWFsIHBlbmRpbmcgTmF2VG9IYXNoIGNhbGxzLlxuXHQgKi9cblx0cmVzb2x2ZVJvdXRlTWF0Y2goKSB7XG5cdFx0aWYgKHRoaXMuX29Sb3V0ZU1hdGNoU3luY2hyb25pemF0aW9uKSB7XG5cdFx0XHR0aGlzLl9vUm91dGVNYXRjaFN5bmNocm9uaXphdGlvbi5yZXNvbHZlKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1ha2VzIHN1cmUgbm8gbmF2aWdhdGlvbiBjYW4gaGFwcGVuIGJlZm9yZSBhIHJvdXRlTWF0Y2ggaGFwcGVuZWQuXG5cdCAqL1xuXHR3YWl0Rm9yUm91dGVNYXRjaEJlZm9yZU5hdmlnYXRpb24oKSB7XG5cdFx0dGhpcy5fb1JvdXRlTWF0Y2hTeW5jaHJvbml6YXRpb24gPSBuZXcgU3luY2hyb25pemF0aW9uKCk7XG5cdFx0dGhpcy5fYkFjdGl2YXRlUm91dGVNYXRjaFN5bmNocm8gPSBmYWxzZTtcblx0fVxuXG5cdF9leHRyYWN0RW50aXR5U2V0c0Zyb21IYXNoKHNIYXNoOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBzdHJpbmdbXSB7XG5cdFx0aWYgKHNIYXNoID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHNIYXNoID0gXCJcIjtcblx0XHR9XG5cdFx0Y29uc3Qgc0hhc2hOb1BhcmFtcyA9IHNIYXNoLnNwbGl0KFwiP1wiKVswXTsgLy8gcmVtb3ZlIHBhcmFtc1xuXHRcdGNvbnN0IGFUb2tlbnMgPSBzSGFzaE5vUGFyYW1zLnNwbGl0KFwiL1wiKTtcblx0XHRjb25zdCBuYW1lczogc3RyaW5nW10gPSBbXTtcblxuXHRcdGFUb2tlbnMuZm9yRWFjaCgoc1Rva2VuKSA9PiB7XG5cdFx0XHRpZiAoc1Rva2VuLmxlbmd0aCkge1xuXHRcdFx0XHRuYW1lcy5wdXNoKHNUb2tlbi5zcGxpdChcIihcIilbMF0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIG5hbWVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkcyBhIHN0YXRlIGZyb20gYSBoYXNoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0hhc2ggVGhlIGhhc2ggdG8gYmUgdXNlZCBhcyBlbnRyeVxuXHQgKiBAcmV0dXJucyBUaGUgc3RhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfZXh0cmFjdFN0YXRlRnJvbUhhc2goc0hhc2g6IHN0cmluZykge1xuXHRcdGlmIChzSGFzaCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRzSGFzaCA9IFwiXCI7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb1N0YXRlOiBhbnkgPSB7XG5cdFx0XHRrZXlzOiB0aGlzLl9leHRyYWN0RW50aXR5U2V0c0Zyb21IYXNoKHNIYXNoKVxuXHRcdH07XG5cblx0XHQvLyBSZXRyaWV2ZSBsYXlvdXQgKGlmIGFueSlcblx0XHRjb25zdCBhTGF5b3V0ID0gc0hhc2gubWF0Y2gobmV3IFJlZ0V4cChgXFxcXD8uKiR7ZW51bVVSTFBhcmFtcy5MQVlPVVRQQVJBTX09KFteJl0qKWApKTtcblx0XHRvU3RhdGUuc0xheW91dCA9IGFMYXlvdXQgJiYgYUxheW91dC5sZW5ndGggPiAxID8gYUxheW91dFsxXSA6IG51bGw7XG5cdFx0aWYgKG9TdGF0ZS5zTGF5b3V0ID09PSBcIk1pZENvbHVtbkZ1bGxTY3JlZW5cIikge1xuXHRcdFx0b1N0YXRlLnNjcmVlbk1vZGUgPSAxO1xuXHRcdH0gZWxzZSBpZiAob1N0YXRlLnNMYXlvdXQgPT09IFwiRW5kQ29sdW1uRnVsbFNjcmVlblwiKSB7XG5cdFx0XHRvU3RhdGUuc2NyZWVuTW9kZSA9IDI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9TdGF0ZS5zY3JlZW5Nb2RlID0gMDtcblx0XHR9XG5cblx0XHRvU3RhdGUuaGFzaCA9IHNIYXNoO1xuXHRcdHJldHVybiBvU3RhdGU7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIG5ldyBzdGF0ZSBpbnRvIHRoZSBpbnRlcm5hbCBoaXN0b3J5IHN0cnVjdHVyZS5cblx0ICogTWFrZXMgc3VyZSB0aGlzIG5ldyBzdGF0ZSBpcyBhZGRlZCBhZnRlciBhbiBhbmNlc3Rvci5cblx0ICogQWxzbyBzZXRzIHRoZSBpQXBwU3RhdGUga2V5IGluIHRoZSB3aG9sZSBoaXN0b3J5LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuUm91dGVyUHJveHlcblx0ICogQHBhcmFtIG9OZXdTdGF0ZSBUaGUgbmV3IHN0YXRlIHRvIGJlIGFkZGVkXG5cdCAqIEBwYXJhbSBiUmVidWlsZE9ubHkgYHRydWVgIGlmIHdlJ3JlIHJlYnVpbGRpbmcgdGhlIGhpc3RvcnkgYWZ0ZXIgYSBzaGVsbCBtZW51IG5hdmlnYXRpb25cblx0ICogQHBhcmFtIGJQcmVzZXJ2ZUhpc3RvcnkgSWYgc2V0IHRvIHRydWUsIG5vbi1hbmNlc3RvciBlbnRyaWVzIGluIGhpc3Rvcnkgd2lsbCBiZSByZXRhaW5lZFxuXHQgKiBAcGFyYW0gYkRpc2FibGVIaXN0b3J5UHJlc2VydmF0aW9uIERpc2FibGUgdGhlIG1lY2hhbmlzbSB0byByZXRhaW5lZCBtYXJrZWQgZW50cmllcyBpbiBjYWNoZVxuXHQgKiBAcmV0dXJucyBUaGUgbmV3IHN0YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdF9wdXNoTmV3U3RhdGUob05ld1N0YXRlOiBhbnksIGJSZWJ1aWxkT25seTogYm9vbGVhbiwgYlByZXNlcnZlSGlzdG9yeTogYm9vbGVhbiwgYkRpc2FibGVIaXN0b3J5UHJlc2VydmF0aW9uOiBib29sZWFuKSB7XG5cdFx0Y29uc3Qgc0N1cnJlbnRIYXNoID0gdGhpcy5nZXRIYXNoKCk7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMuX29NYW5hZ2VkSGlzdG9yeS5sZW5ndGggLSAxO1xuXHRcdGxldCBpUG9wQ291bnQgPSBiUmVidWlsZE9ubHkgPyAxIDogMDtcblxuXHRcdC8vIDEuIERvIHNvbWUgY2xlYW51cCBpbiB0aGUgbWFuYWdlZCBoaXN0b3J5IDogaW4gY2FzZSB0aGUgdXNlciBoYXMgbmF2aWdhdGVkIGJhY2sgaW4gdGhlIGJyb3dzZXIgaGlzdG9yeSwgd2UgbmVlZCB0byByZW1vdmVcblx0XHQvLyB0aGUgc3RhdGVzIGFoZWFkIGluIGhpc3RvcnkgYW5kIG1ha2Ugc3VyZSB0aGUgdG9wIHN0YXRlIGNvcnJlc3BvbmRzIHRvIHRoZSBjdXJyZW50IHBhZ2Vcblx0XHQvLyBXZSBkb24ndCBkbyB0aGF0IHdoZW4gcmVzdG9yaW5nIHRoZSBoaXN0b3J5LCBhcyB0aGUgY3VycmVudCBzdGF0ZSBoYXMgYmVlbiBhZGRlZCBvbiB0b3Agb2YgdGhlIGJyb3dzZXIgaGlzdG9yeVxuXHRcdC8vIGFuZCBpcyBub3QgcmVmbGVjdGVkIGluIHRoZSBtYW5hZ2VkIGhpc3Rvcnlcblx0XHRpZiAoIWJSZWJ1aWxkT25seSkge1xuXHRcdFx0d2hpbGUgKGxhc3RJbmRleCA+PSAwICYmIHRoaXMuX29NYW5hZ2VkSGlzdG9yeVtsYXN0SW5kZXhdLmhhc2ggIT09IHNDdXJyZW50SGFzaCkge1xuXHRcdFx0XHR0aGlzLl9vTWFuYWdlZEhpc3RvcnkucG9wKCk7XG5cdFx0XHRcdGxhc3RJbmRleC0tO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHQvLyBXZSBjb3VsZG4ndCBmaW5kIHRoZSBjdXJyZW50IGxvY2F0aW9uIGluIHRoZSBoaXN0b3J5LiBUaGlzIGNhbiBoYXBwZW4gaWYgYSBicm93c2VyIHJlbG9hZFxuXHRcdFx0XHQvLyBoYXBwZW5lZCwgY2F1c2luZyBhIHJlaW5pdGlhbGl6YXRpb24gb2YgdGhlIG1hbmFnZWQgaGlzdG9yeS5cblx0XHRcdFx0Ly8gSW4gdGhhdCBjYXNlLCB3ZSB1c2UgdGhlIGN1cnJlbnQgbG9jYXRpb24gYXMgdGhlIG5ldyBzdGFydGluZyBwb2ludCBpbiB0aGUgbWFuYWdlZCBoaXN0b3J5XG5cdFx0XHRcdHRoaXMuX29NYW5hZ2VkSGlzdG9yeS5wdXNoKHRoaXMuX2V4dHJhY3RTdGF0ZUZyb21IYXNoKHNDdXJyZW50SGFzaCkpO1xuXHRcdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZShPYmplY3QuYXNzaWduKHsgZmVMZXZlbDogMCB9LCBoaXN0b3J5LnN0YXRlKSwgXCJcIik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gMi4gTWFyayB0aGUgdG9wIHN0YXRlIGFzIHByZXNlcnZlZCBpZiByZXF1aXJlZFxuXHRcdGlmIChiUHJlc2VydmVIaXN0b3J5ICYmICFiRGlzYWJsZUhpc3RvcnlQcmVzZXJ2YXRpb24pIHtcblx0XHRcdHRoaXMuX29NYW5hZ2VkSGlzdG9yeVt0aGlzLl9vTWFuYWdlZEhpc3RvcnkubGVuZ3RoIC0gMV0ucHJlc2VydmVkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyAzLiBUaGVuIHBvcCBhbGwgc3RhdGVzIHVudGlsIHdlIGZpbmQgYW4gYW5jZXN0b3Igb2YgdGhlIG5ldyBzdGF0ZSwgb3Igd2UgZmluZCBhIHN0YXRlIHRoYXQgbmVlZCB0byBiZSBwcmVzZXJ2ZWRcblx0XHRsZXQgb0xhc3RSZW1vdmVkSXRlbTtcblx0XHR3aGlsZSAodGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IG9Ub3BTdGF0ZSA9IHRoaXMuX29NYW5hZ2VkSGlzdG9yeVt0aGlzLl9vTWFuYWdlZEhpc3RvcnkubGVuZ3RoIC0gMV07XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChiRGlzYWJsZUhpc3RvcnlQcmVzZXJ2YXRpb24gfHwgIW9Ub3BTdGF0ZS5wcmVzZXJ2ZWQpICYmXG5cdFx0XHRcdHRoaXMuX2NvbXBhcmVDYWNoZVN0YXRlcyhvVG9wU3RhdGUsIG9OZXdTdGF0ZSkgIT09IGVudW1TdGF0ZS5BTkNFU1RPUlxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIFRoZSB0b3Agc3RhdGUgaXMgbm90IGFuIGFuY2VzdG9yIG9mIG9OZXdTdGF0ZSBhbmQgaXMgbm90IHByZXNlcnZlZCAtLT4gd2UgY2FuIHBvcCBpdFxuXHRcdFx0XHRvTGFzdFJlbW92ZWRJdGVtID0gdGhpcy5fb01hbmFnZWRIaXN0b3J5LnBvcCgpO1xuXHRcdFx0XHRpUG9wQ291bnQrKztcblx0XHRcdH0gZWxzZSBpZiAob1RvcFN0YXRlLnByZXNlcnZlZCAmJiByZW1vdmVBcHBTdGF0ZUluSGFzaChvVG9wU3RhdGUuaGFzaCkgPT09IHJlbW92ZUFwcFN0YXRlSW5IYXNoKG9OZXdTdGF0ZS5oYXNoKSkge1xuXHRcdFx0XHQvLyBXZSB0cnkgdG8gYWRkIGEgc3RhdGUgdGhhdCBpcyBhbHJlYWR5IGluIGNhY2hlIChkdWUgdG8gcHJlc2VydmVkIGZsYWcpIGJ1dCB3aXRoIGEgZGlmZmVyZW50IGlhcHAtc3RhdGVcblx0XHRcdFx0Ly8gLS0+IHdlIHNob3VsZCBkZWxldGUgdGhlIHByZXZpb3VzIGVudHJ5IChpdCB3aWxsIGJlIGxhdGVyIHJlcGxhY2VkIGJ5IHRoZSBuZXcgb25lKSBhbmQgc3RvcCBwb3BwaW5nXG5cdFx0XHRcdG9MYXN0UmVtb3ZlZEl0ZW0gPSB0aGlzLl9vTWFuYWdlZEhpc3RvcnkucG9wKCk7XG5cdFx0XHRcdGlQb3BDb3VudCsrO1xuXHRcdFx0XHRvTmV3U3RhdGUucHJlc2VydmVkID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRicmVhazsgLy8gQW5jZXN0b3Igb3IgcHJlc2VydmVkIHN0YXRlIGZvdW5kIC0tPiB3ZSBzdG9wIHBvcHBpbmcgb3V0IHN0YXRlc1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIDQuIGlBcHBTdGF0ZSBtYW5hZ2VtZW50XG5cdFx0dGhpcy5zSUFwcFN0YXRlS2V5ID0gZmluZEFwcFN0YXRlSW5IYXNoKG9OZXdTdGF0ZS5oYXNoKTtcblx0XHRpZiAoIXRoaXMuZmNsRW5hYmxlZCAmJiBvTGFzdFJlbW92ZWRJdGVtKSB7XG5cdFx0XHRjb25zdCBzUHJldmlvdXNJQXBwU3RhdGVLZXkgPSBmaW5kQXBwU3RhdGVJbkhhc2gob0xhc3RSZW1vdmVkSXRlbS5oYXNoKTtcblx0XHRcdGNvbnN0IG9Db21wYXJpc29uU3RhdGVSZXN1bHQgPSB0aGlzLl9jb21wYXJlQ2FjaGVTdGF0ZXMob0xhc3RSZW1vdmVkSXRlbSwgb05ld1N0YXRlKTtcblx0XHRcdC8vIGlmIGN1cnJlbnQgc3RhdGUgZG9lc24ndCBjb250YWluIGEgaS1hcHBzdGF0ZSBhbmQgdGhpcyBzdGF0ZSBzaG91bGQgcmVwbGFjZSBhIHN0YXRlIGNvbnRhaW5pbmcgYSBpQXBwU3RhdGVcblx0XHRcdC8vIHRoZW4gdGhlIHByZXZpb3VzIGlBcHBTdGF0ZSBpcyBwcmVzZXJ2ZWRcblx0XHRcdGlmIChcblx0XHRcdFx0IXRoaXMuc0lBcHBTdGF0ZUtleSAmJlxuXHRcdFx0XHRzUHJldmlvdXNJQXBwU3RhdGVLZXkgJiZcblx0XHRcdFx0KG9Db21wYXJpc29uU3RhdGVSZXN1bHQgPT09IGVudW1TdGF0ZS5FUVVBTCB8fCBvQ29tcGFyaXNvblN0YXRlUmVzdWx0ID09PSBlbnVtU3RhdGUuQ09NUEFUSUJMRSlcblx0XHRcdCkge1xuXHRcdFx0XHRvTmV3U3RhdGUuaGFzaCA9IHNldEFwcFN0YXRlSW5IYXNoKG9OZXdTdGF0ZS5oYXNoLCBzUHJldmlvdXNJQXBwU3RhdGVLZXkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIDUuIE5vdyB3ZSBjYW4gcHVzaCB0aGUgc3RhdGUgYXQgdGhlIHRvcCBvZiB0aGUgaW50ZXJuYWwgaGlzdG9yeVxuXHRcdGNvbnN0IGJIYXNTYW1lSGFzaCA9IG9MYXN0UmVtb3ZlZEl0ZW0gJiYgb05ld1N0YXRlLmhhc2ggPT09IG9MYXN0UmVtb3ZlZEl0ZW0uaGFzaDtcblx0XHRpZiAodGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCA9PT0gMCB8fCB0aGlzLl9vTWFuYWdlZEhpc3RvcnlbdGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCAtIDFdLmhhc2ggIT09IG9OZXdTdGF0ZS5oYXNoKSB7XG5cdFx0XHR0aGlzLl9vTWFuYWdlZEhpc3RvcnkucHVzaChvTmV3U3RhdGUpO1xuXHRcdFx0aWYgKG9MYXN0UmVtb3ZlZEl0ZW0gJiYgcmVtb3ZlQXBwU3RhdGVJbkhhc2gob0xhc3RSZW1vdmVkSXRlbS5oYXNoKSA9PT0gcmVtb3ZlQXBwU3RhdGVJbkhhc2gob05ld1N0YXRlLmhhc2gpKSB7XG5cdFx0XHRcdG9OZXdTdGF0ZS5mb2N1c0NvbnRyb2xJZCA9IG9MYXN0UmVtb3ZlZEl0ZW0uZm9jdXNDb250cm9sSWQ7XG5cdFx0XHRcdG9OZXdTdGF0ZS5mb2N1c0luZm8gPSBvTGFzdFJlbW92ZWRJdGVtLmZvY3VzSW5mbztcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyA2LiBEZXRlcm1pbmUgd2hpY2ggYWN0aW9ucyB0byBkbyBvbiB0aGUgaGlzdG9yeVxuXHRcdGlmIChpUG9wQ291bnQgPT09IDApIHtcblx0XHRcdC8vIE5vIHN0YXRlIHdhcyBwb3BwZWQgLS0+IGFwcGVuZFxuXHRcdFx0cmV0dXJuIHsgdHlwZTogXCJhcHBlbmRcIiB9O1xuXHRcdH0gZWxzZSBpZiAoaVBvcENvdW50ID09PSAxKSB7XG5cdFx0XHQvLyBPbmx5IDEgc3RhdGUgd2FzIHBvcHBlZCAtLT4gcmVwbGFjZSBjdXJyZW50IGhhc2ggdW5sZXNzIGhhc2ggaXMgdGhlIHNhbWUgKHRoZW4gbm90aGluZyB0byBkbylcblx0XHRcdHJldHVybiBiSGFzU2FtZUhhc2ggPyB7IHR5cGU6IFwibm9uZVwiIH0gOiB7IHR5cGU6IFwicmVwbGFjZVwiIH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIE1vcmUgdGhhbiAxIHN0YXRlIHdhcyBwb3BwZWQgLS0+IGdvIGJha2MgaW4gaGlzdG9yeSBhbmQgcmVwbGFjZSBoYXNoIGlmIG5lY2Vzc2FyeVxuXHRcdFx0cmV0dXJuIGJIYXNTYW1lSGFzaCA/IHsgdHlwZTogXCJiYWNrXCIsIHN0ZXBzOiBpUG9wQ291bnQgLSAxIH0gOiB7IHR5cGU6IFwiYmFjay1yZXBsYWNlXCIsIHN0ZXBzOiBpUG9wQ291bnQgLSAxIH07XG5cdFx0fVxuXHR9XG5cblx0X2Jsb2NraW5nTmF2aWdhdGlvbkZpbHRlcigpIHtcblx0XHRyZXR1cm4gdGhpcy5fYkRpc2FibGVPbkhhc2hDaGFuZ2UgPyBcIkN1c3RvbVwiIDogXCJDb250aW51ZVwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIERpc2FibGUgdGhlIHJvdXRpbmcgYnkgY2FsbGluZyB0aGUgcm91dGVyIHN0b3AgbWV0aG9kLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlJvdXRlclByb3h5XG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdF9kaXNhYmxlRXZlbnRPbkhhc2hDaGFuZ2UoKSB7XG5cdFx0dGhpcy5fYkRpc2FibGVPbkhhc2hDaGFuZ2UgPSB0cnVlO1xuXHRcdHRoaXMuX29Sb3V0ZXIuc3RvcCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVuYWJsZSB0aGUgcm91dGluZyBieSBjYWxsaW5nIHRoZSByb3V0ZXIgaW5pdGlhbGl6ZSBtZXRob2QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5Sb3V0ZXJQcm94eSNfZW5hYmxlRXZlbnRPbkhhc2hDaGFuZ2Vcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlJvdXRlclByb3h5XG5cdCAqIEBwYXJhbSBbYklnbm9yZUN1cnJlbnRIYXNoXSBJZ25vcmUgdGhlIGxhc3QgaGFzaCBldmVudCB0cmlnZ2VyZWQgYmVmb3JlIHRoZSByb3V0ZXIgaGFzIGluaXRpYWxpemVkXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdF9lbmFibGVFdmVudE9uSGFzaENoYW5nZShiSWdub3JlQ3VycmVudEhhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQpIHtcblx0XHR0aGlzLl9iRGlzYWJsZU9uSGFzaENoYW5nZSA9IGZhbHNlO1xuXHRcdHRoaXMuX29Sb3V0ZXIuaW5pdGlhbGl6ZShiSWdub3JlQ3VycmVudEhhc2gpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN5bmNocm9uaXplcyB0aGUgYnJvd3NlciBoaXN0b3J5IHdpdGggdGhlIGludGVybmFsIGhpc3Rvcnkgb2YgdGhlIHJvdXRlclByb3h5LCBhbmQgdHJpZ2dlcnMgYSBuYXZpZ2F0aW9uIGlmIG5lZWRlZC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlJvdXRlclByb3h5XG5cdCAqIEBwYXJhbSBvSGlzdG9yeUFjdGlvbiBTcGVjaWZpZXMgdGhlIG5hdmlnYXRpb24gYWN0aW9uIHRvIGJlIHBlcmZvcm1lZFxuXHQgKiBAcGFyYW0gYlJlYnVpbGRPbmx5IGB0cnVlYCBpZiBpbnRlcm5hbCBoaXN0b3J5IGlzIGN1cnJlbnRseSBiZWluZyByZWJ1aWx0XG5cdCAqIEByZXR1cm5zIFByb21pc2UgKHJlc29sdmVkIHdoZW4gdGhlIG5hdmlnYXRpb24gaXMgZmluYWxpemVkKSB0aGF0IHJldHVybnMgJ3RydWUnIGlmIGEgbmF2aWdhdGlvbiB0b29rIHBsYWNlLCAnZmFsc2UnIGlmIHRoZSBuYXZpZ2F0aW9uIGRpZG4ndCBoYXBwZW5cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0X3JlYnVpbGRCcm93c2VySGlzdG9yeShvSGlzdG9yeUFjdGlvbjogYW55LCBiUmVidWlsZE9ubHk6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcblx0XHRjb25zdCB0aGF0ID0gdGhpcztcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdHRoaXMuYklzUmVidWlsZEhpc3RvcnlSdW5uaW5nID0gdHJ1ZTtcblx0XHRcdGNvbnN0IG9UYXJnZXRTdGF0ZSA9IHRoaXMuX29NYW5hZ2VkSGlzdG9yeVt0aGlzLl9vTWFuYWdlZEhpc3RvcnkubGVuZ3RoIC0gMV0sXG5cdFx0XHRcdG5ld0xldmVsID0gdGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCAtIDE7XG5cblx0XHRcdGZ1bmN0aW9uIHJlcGxhY2VBc3luYygpIHtcblx0XHRcdFx0aWYgKCFiUmVidWlsZE9ubHkpIHtcblx0XHRcdFx0XHR0aGF0Ll9lbmFibGVFdmVudE9uSGFzaENoYW5nZSh0cnVlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCh0aGF0Ll9vUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkucmVwbGFjZUhhc2ggYXMgYW55KShvVGFyZ2V0U3RhdGUuaGFzaCk7XG5cdFx0XHRcdGhpc3RvcnkucmVwbGFjZVN0YXRlKE9iamVjdC5hc3NpZ24oeyBmZUxldmVsOiBuZXdMZXZlbCB9LCBoaXN0b3J5LnN0YXRlKSwgXCJcIik7XG5cblx0XHRcdFx0aWYgKGJSZWJ1aWxkT25seSkge1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0Ly8gVGltZW91dCB0byBsZXQgJ2hhc2hjaGFuZ2UnIGV2ZW50IGJlIHByb2Nlc3NlZCBiZWZvcmUgYnkgdGhlIEhhc2hDaGFuZ2VyLCBzbyB0aGF0XG5cdFx0XHRcdFx0XHQvLyBvblJvdXRlTWF0Y2hlZCBub3RpZmljYXRpb24gaXNuJ3QgcmFpc2VkXG5cdFx0XHRcdFx0XHR0aGF0Ll9lbmFibGVFdmVudE9uSGFzaENoYW5nZSh0cnVlKTtcblx0XHRcdFx0XHR9LCAwKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoYXQuYklzUmVidWlsZEhpc3RvcnlSdW5uaW5nID0gZmFsc2U7XG5cdFx0XHRcdHJlc29sdmUodHJ1ZSk7IC8vIGEgbmF2aWdhdGlvbiBvY2N1cnJlZFxuXHRcdFx0fVxuXG5cdFx0XHQvLyBBc3luYyBjYWxsYmFja3Mgd2hlbiBuYXZpZ2F0aW5nIGJhY2ssIGluIG9yZGVyIHRvIGxldCBhbGwgbm90aWZpY2F0aW9ucyBhbmQgZXZlbnRzIGdldCBwcm9jZXNzZWRcblx0XHRcdGZ1bmN0aW9uIGJhY2tSZXBsYWNlQXN5bmMoKSB7XG5cdFx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicG9wc3RhdGVcIiwgYmFja1JlcGxhY2VBc3luYyk7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdC8vIFRpbWVvdXQgdG8gbGV0ICdoYXNoY2hhbmdlJyBldmVudCBiZSBwcm9jZXNzZWQgYmVmb3JlIGJ5IHRoZSBIYXNoQ2hhbmdlclxuXHRcdFx0XHRcdHJlcGxhY2VBc3luYygpO1xuXHRcdFx0XHR9LCAwKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gYmFja0FzeW5jKCkge1xuXHRcdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIGJhY2tBc3luYyk7XG5cdFx0XHRcdHRoYXQuYklzUmVidWlsZEhpc3RvcnlSdW5uaW5nID0gZmFsc2U7XG5cdFx0XHRcdHJlc29sdmUodHJ1ZSk7IC8vIGEgbmF2aWdhdGlvbiBvY2N1cnJlZFxuXHRcdFx0fVxuXG5cdFx0XHR0aGF0Ll9iSWdub3JlUmVzdG9yZSA9IHRydWU7XG5cblx0XHRcdHN3aXRjaCAob0hpc3RvcnlBY3Rpb24udHlwZSkge1xuXHRcdFx0XHRjYXNlIFwicmVwbGFjZVwiOlxuXHRcdFx0XHRcdCh0aGF0Ll9vUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkucmVwbGFjZUhhc2ggYXMgYW55KShvVGFyZ2V0U3RhdGUuaGFzaCk7XG5cdFx0XHRcdFx0aGlzdG9yeS5yZXBsYWNlU3RhdGUoT2JqZWN0LmFzc2lnbih7IGZlTGV2ZWw6IG5ld0xldmVsIH0sIGhpc3Rvcnkuc3RhdGUpLCBcIlwiKTtcblx0XHRcdFx0XHR0aGF0LmJJc1JlYnVpbGRIaXN0b3J5UnVubmluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdHJlc29sdmUodHJ1ZSk7IC8vIGEgbmF2aWdhdGlvbiBvY2N1cnJlZFxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJhcHBlbmRcIjpcblx0XHRcdFx0XHR0aGF0Ll9vUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkuc2V0SGFzaChvVGFyZ2V0U3RhdGUuaGFzaCk7XG5cdFx0XHRcdFx0aGlzdG9yeS5yZXBsYWNlU3RhdGUoT2JqZWN0LmFzc2lnbih7IGZlTGV2ZWw6IG5ld0xldmVsIH0sIGhpc3Rvcnkuc3RhdGUpLCBcIlwiKTtcblx0XHRcdFx0XHR0aGF0LmJJc1JlYnVpbGRIaXN0b3J5UnVubmluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdHJlc29sdmUodHJ1ZSk7IC8vIGEgbmF2aWdhdGlvbiBvY2N1cnJlZFxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJiYWNrXCI6XG5cdFx0XHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBiYWNrQXN5bmMpO1xuXHRcdFx0XHRcdGhpc3RvcnkuZ28oLW9IaXN0b3J5QWN0aW9uLnN0ZXBzKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwiYmFjay1yZXBsYWNlXCI6XG5cdFx0XHRcdFx0dGhpcy5fZGlzYWJsZUV2ZW50T25IYXNoQ2hhbmdlKCk7XG5cdFx0XHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBiYWNrUmVwbGFjZUFzeW5jKTtcblx0XHRcdFx0XHRoaXN0b3J5LmdvKC1vSGlzdG9yeUFjdGlvbi5zdGVwcyk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvLyBObyBuYXZpZ2F0aW9uXG5cdFx0XHRcdFx0dGhpcy5iSXNSZWJ1aWxkSGlzdG9yeVJ1bm5pbmcgPSBmYWxzZTtcblx0XHRcdFx0XHRyZXNvbHZlKGZhbHNlKTsgLy8gbm8gbmF2aWdhdGlvbiAtLT4gcmVzb2x2ZSB0byBmYWxzZVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Z2V0TGFzdEhpc3RvcnlFbnRyeSgpIHtcblx0XHRyZXR1cm4gdGhpcy5fb01hbmFnZWRIaXN0b3J5W3RoaXMuX29NYW5hZ2VkSGlzdG9yeS5sZW5ndGggLSAxXTtcblx0fVxuXG5cdHNldFBhdGhNYXBwaW5nKG1hcHBpbmdzOiB7IG9sZFBhdGg6IHN0cmluZzsgbmV3UGF0aDogc3RyaW5nIH1bXSkge1xuXHRcdHRoaXMuX3BhdGhNYXBwaW5ncyA9IG1hcHBpbmdzLmZpbHRlcigobWFwcGluZykgPT4ge1xuXHRcdFx0cmV0dXJuIG1hcHBpbmcub2xkUGF0aCAhPT0gbWFwcGluZy5uZXdQYXRoO1xuXHRcdH0pO1xuXHR9XG5cblx0aGFzaEd1YXJkKCkge1xuXHRcdGxldCBzSGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuXG5cdFx0aWYgKHNIYXNoLmluZGV4T2YoXCJyZXN0b3JlSGlzdG9yeT10cnVlXCIpICE9PSAtMSkge1xuXHRcdFx0dGhpcy5fYkFwcGx5UmVzdG9yZSA9IHRydWU7XG5cdFx0fSBlbHNlIGlmICghdGhpcy5iSXNSZWJ1aWxkSGlzdG9yeVJ1bm5pbmcpIHtcblx0XHRcdC8vIENoZWNrIGlmIHRoZSBoYXNoIG5lZWRzIHRvIGJlIGNoYW5nZWQgKHRoaXMgaGFwcGVucyBpbiBGQ0wgd2hlbiBzd2l0Y2hpbmcgYi93IGVkaXQgYW5kIHJlYWQtb25seSB3aXRoIDMgY29sdW1ucyBvcGVuKVxuXHRcdFx0Y29uc3QgbWFwcGluZyA9IHRoaXMuX3BhdGhNYXBwaW5ncy5maW5kKChtKSA9PiB7XG5cdFx0XHRcdHJldHVybiBzSGFzaC5pbmRleE9mKG0ub2xkUGF0aCkgPj0gMDtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKG1hcHBpbmcpIHtcblx0XHRcdFx0Ly8gUmVwbGFjZSB0aGUgY3VycmVudCBoYXNoXG5cdFx0XHRcdHNIYXNoID0gc0hhc2gucmVwbGFjZShtYXBwaW5nLm9sZFBhdGgsIG1hcHBpbmcubmV3UGF0aCk7XG5cdFx0XHRcdGhpc3RvcnkucmVwbGFjZVN0YXRlKE9iamVjdC5hc3NpZ24oe30sIGhpc3Rvcnkuc3RhdGUpLCBcIlwiLCBzSGFzaCk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGFIYXNoU3BsaXQgPSBzSGFzaC5zcGxpdChcIiYvXCIpO1xuXHRcdFx0Y29uc3Qgc0FwcEhhc2ggPSBhSGFzaFNwbGl0WzFdID8gYUhhc2hTcGxpdFsxXSA6IFwiXCI7XG5cdFx0XHRpZiAodGhpcy5jaGVja0hhc2hXaXRoR3VhcmQoc0FwcEhhc2gpKSB7XG5cdFx0XHRcdHRoaXMuX2JEZWxheWVkUmVidWlsZCA9IHRydWU7XG5cdFx0XHRcdGNvbnN0IG9OZXdTdGF0ZSA9IHRoaXMuX2V4dHJhY3RTdGF0ZUZyb21IYXNoKHNBcHBIYXNoKTtcblx0XHRcdFx0dGhpcy5fcHVzaE5ld1N0YXRlKG9OZXdTdGF0ZSwgZmFsc2UsIGZhbHNlLCB0cnVlKTtcblxuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLl9iRGVsYXllZFJlYnVpbGQgPSBmYWxzZTtcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbXBhcmVzIDIgc3RhdGVzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gb1N0YXRlMVxuXHQgKiBAcGFyYW0ge29iamVjdH0gb1N0YXRlMlxuXHQgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgcmVzdWx0IG9mIHRoZSBjb21wYXJpc29uOlxuXHQgKiAgICAgICAgLSBlbnVtU3RhdGUuRVFVQUwgaWYgb1N0YXRlMSBhbmQgb1N0YXRlMiBhcmUgZXF1YWxcblx0ICogICAgICAgIC0gZW51bVN0YXRlLkNPTVBBVElCTEUgaWYgb1N0YXRlMSBhbmQgb1N0YXRlMiBhcmUgY29tcGF0aWJsZVxuXHQgKiAgICAgICAgLSBlbnVtU3RhdGUuQU5DRVNUT1IgaWYgb1N0YXRlMSBpcyBhbiBhbmNlc3RvciBvZiBvU3RhdGUyXG5cdCAqICAgICAgICAtIGVudW1TdGF0ZS5ESUZGRVJFTlQgaWYgdGhlIDIgc3RhdGVzIGFyZSBkaWZmZXJlbnRcblx0ICovXG5cblx0X2NvbXBhcmVDYWNoZVN0YXRlcyhvU3RhdGUxOiBhbnksIG9TdGF0ZTI6IGFueSkge1xuXHRcdC8vIEZpcnN0IGNvbXBhcmUgb2JqZWN0IGtleXNcblx0XHRpZiAob1N0YXRlMS5rZXlzLmxlbmd0aCA+IG9TdGF0ZTIua2V5cy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBlbnVtU3RhdGUuRElGRkVSRU5UO1xuXHRcdH1cblx0XHRsZXQgZXF1YWwgPSB0cnVlO1xuXHRcdGxldCBpbmRleDtcblx0XHRmb3IgKGluZGV4ID0gMDsgZXF1YWwgJiYgaW5kZXggPCBvU3RhdGUxLmtleXMubGVuZ3RoOyBpbmRleCsrKSB7XG5cdFx0XHRpZiAob1N0YXRlMS5rZXlzW2luZGV4XSAhPT0gb1N0YXRlMi5rZXlzW2luZGV4XSkge1xuXHRcdFx0XHRlcXVhbCA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIWVxdWFsKSB7XG5cdFx0XHQvLyBTb21lIG9iamVjdHMga2V5cyBhcmUgZGlmZmVyZW50XG5cdFx0XHRyZXR1cm4gZW51bVN0YXRlLkRJRkZFUkVOVDtcblx0XHR9XG5cblx0XHQvLyBBbGwga2V5cyBmcm9tIG9TdGF0ZTEgYXJlIGluIG9TdGF0ZTIgLS0+IGNoZWNrIGlmIGFuY2VzdG9yXG5cdFx0aWYgKG9TdGF0ZTEua2V5cy5sZW5ndGggPCBvU3RhdGUyLmtleXMubGVuZ3RoIHx8IG9TdGF0ZTEuc2NyZWVuTW9kZSA8IG9TdGF0ZTIuc2NyZWVuTW9kZSkge1xuXHRcdFx0cmV0dXJuIGVudW1TdGF0ZS5BTkNFU1RPUjtcblx0XHR9XG5cdFx0aWYgKG9TdGF0ZTEuc2NyZWVuTW9kZSA+IG9TdGF0ZTIuc2NyZWVuTW9kZSkge1xuXHRcdFx0cmV0dXJuIGVudW1TdGF0ZS5ESUZGRVJFTlQ7IC8vIE5vdCBzdXJlIHRoaXMgY2FzZSBjYW4gaGFwcGVuLi4uXG5cdFx0fVxuXG5cdFx0Ly8gQXQgdGhpcyBzdGFnZSwgdGhlIDIgc3RhdGVzIGhhdmUgdGhlIHNhbWUgb2JqZWN0IGtleXMgKGluIHRoZSBzYW1lIG9yZGVyKSBhbmQgc2FtZSBzY3JlZW5tb2RlXG5cdFx0Ly8gVGhleSBjYW4gYmUgZWl0aGVyIGNvbXBhdGlibGUgb3IgZXF1YWxcblx0XHRyZXR1cm4gb1N0YXRlMS5zTGF5b3V0ID09PSBvU3RhdGUyLnNMYXlvdXQgPyBlbnVtU3RhdGUuRVFVQUwgOiBlbnVtU3RhdGUuQ09NUEFUSUJMRTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYmFjayBleGl0cyB0aGUgcHJlc2VudCBndWFyZCBzZXQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUHJlc2VudEhhc2ggVGhlIGN1cnJlbnQgaGFzaC4gT25seSB1c2VkIGZvciB1bml0IHRlc3RzLlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYmFjayBleGl0cyB0aGVyZSBpcyBhIGd1YXJkIGV4aXQgb24gYmFja1xuXHQgKi9cblx0Y2hlY2tJZkJhY2tJc091dE9mR3VhcmQoc1ByZXNlbnRIYXNoPzogc3RyaW5nKSB7XG5cdFx0bGV0IHNQcmV2SGFzaDtcblx0XHRsZXQgc0N1cnJlbnRIYXNoOiBzdHJpbmc7XG5cdFx0aWYgKHNQcmVzZW50SGFzaCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBXZSB1c2Ugd2luZG93LmxvY2F0aW9uLmhhc2ggaW5zdGVhZCBvZiBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpLmdldEhhc2goKSBiZWNhdXNlIHRoZSBsYXR0ZXJcblx0XHRcdC8vIHJlcGxhY2VzIGNoYXJhY3RlcnMgaW4gdGhlIFVSTCAoZS5nLiAlMjQgcmVwbGFjZWQgYnkgJCkgYW5kIGl0IGNhdXNlcyBpc3N1ZXMgd2hlbiBjb21wYXJpbmdcblx0XHRcdC8vIHdpdGggdGhlIFVSTHMgaW4gdGhlIG1hbmFnZWQgaGlzdG9yeVxuXHRcdFx0Y29uc3Qgb1NwbGl0SGFzaCA9IHRoaXMuX29TaGVsbFNlcnZpY2VzLnNwbGl0SGFzaCh3aW5kb3cubG9jYXRpb24uaGFzaCkgYXMgYW55O1xuXHRcdFx0aWYgKG9TcGxpdEhhc2ggJiYgb1NwbGl0SGFzaC5hcHBTcGVjaWZpY1JvdXRlKSB7XG5cdFx0XHRcdHNDdXJyZW50SGFzaCA9IG9TcGxpdEhhc2guYXBwU3BlY2lmaWNSb3V0ZTtcblx0XHRcdFx0aWYgKHNDdXJyZW50SGFzaC5pbmRleE9mKFwiJi9cIikgPT09IDApIHtcblx0XHRcdFx0XHRzQ3VycmVudEhhc2ggPSBzQ3VycmVudEhhc2guc3Vic3RyaW5nKDIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzQ3VycmVudEhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSk7IC8vIFRvIHJlbW92ZSB0aGUgJyMnXG5cdFx0XHRcdGlmIChzQ3VycmVudEhhc2hbMF0gPT09IFwiL1wiKSB7XG5cdFx0XHRcdFx0c0N1cnJlbnRIYXNoID0gc0N1cnJlbnRIYXNoLnN1YnN0cmluZygxKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzQ3VycmVudEhhc2ggPSBzUHJlc2VudEhhc2g7XG5cdFx0fVxuXHRcdHNQcmVzZW50SGFzaCA9IFVSSS5kZWNvZGUoc0N1cnJlbnRIYXNoKTtcblx0XHRpZiAodGhpcy5fb05hdmlnYXRpb25HdWFyZCkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IHRoaXMuX29NYW5hZ2VkSGlzdG9yeS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG5cdFx0XHRcdGlmICh0aGlzLl9vTWFuYWdlZEhpc3RvcnlbaV0uaGFzaCA9PT0gc1ByZXNlbnRIYXNoKSB7XG5cdFx0XHRcdFx0c1ByZXZIYXNoID0gdGhpcy5fb01hbmFnZWRIaXN0b3J5W2kgLSAxXS5oYXNoO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAhc1ByZXZIYXNoIHx8ICF0aGlzLmNoZWNrSGFzaFdpdGhHdWFyZChzUHJldkhhc2gpO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBsYXN0IDIgZW50cmllcyBpbiB0aGUgaGlzdG9yeSBzaGFyZSB0aGUgc2FtZSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhleSBzaGFyZSB0aGUgc2FtZSBjb250ZXh0LlxuXHQgKi9cblx0Y2hlY2tJZkJhY2tIYXNTYW1lQ29udGV4dCgpIHtcblx0XHRpZiAodGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCA8IDIpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCBvQ3VycmVudFN0YXRlID0gdGhpcy5fb01hbmFnZWRIaXN0b3J5W3RoaXMuX29NYW5hZ2VkSGlzdG9yeS5sZW5ndGggLSAxXTtcblx0XHRjb25zdCBvUHJldmlvdXNTdGF0ZSA9IHRoaXMuX29NYW5hZ2VkSGlzdG9yeVt0aGlzLl9vTWFuYWdlZEhpc3RvcnkubGVuZ3RoIC0gMl07XG5cblx0XHRyZXR1cm4gb0N1cnJlbnRTdGF0ZS5oYXNoLnNwbGl0KFwiP1wiKVswXSA9PT0gb1ByZXZpb3VzU3RhdGUuaGFzaC5zcGxpdChcIj9cIilbMF07XG5cdH1cblxuXHQvKipcblx0ICogUmVzdG9yZXMgdGhlIGZvY3VzIGZvciB0aGUgY3VycmVudCBoYXNoLCBpZiB3ZSBjYW4gZmluZCBpdCBpbiB0aGUgaGlzdG9yeS5cblx0ICpcblx0ICogQHJldHVybnMgVHJ1ZSBpZiBmb2N1cyB3YXMgc2V0LCBmYWxzZSBvdGhlcndpc2UuXG5cdCAqL1xuXHRyZXN0b3JlRm9jdXNGb3JDdXJyZW50SGFzaCgpOiBib29sZWFuIHtcblx0XHRjb25zdCBjdXJyZW50SGFzaCA9IHJlbW92ZUFwcFN0YXRlSW5IYXNoKHRoaXMuZ2V0SGFzaCgpKTtcblx0XHRjb25zdCBzdGF0ZUZvckhhc2ggPSB0aGlzLl9vTWFuYWdlZEhpc3RvcnkuZmluZCgoc3RhdGUpID0+IHtcblx0XHRcdHJldHVybiByZW1vdmVBcHBTdGF0ZUluSGFzaChzdGF0ZS5oYXNoKSA9PT0gY3VycmVudEhhc2g7XG5cdFx0fSk7XG5cblx0XHRsZXQgZm9jdXNBcHBsaWVkID0gZmFsc2U7XG5cdFx0aWYgKHN0YXRlRm9ySGFzaD8uZm9jdXNDb250cm9sSWQpIHtcblx0XHRcdGNvbnN0IGZvY3VzQ29udHJvbCA9IHNhcC51aS5nZXRDb3JlKCkuYnlJZChzdGF0ZUZvckhhc2guZm9jdXNDb250cm9sSWQpO1xuXHRcdFx0Zm9jdXNDb250cm9sPy5mb2N1cyhzdGF0ZUZvckhhc2guZm9jdXNJbmZvKTtcblx0XHRcdGZvY3VzQXBwbGllZCA9IGZvY3VzQ29udHJvbCAhPT0gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdHJldHVybiBmb2N1c0FwcGxpZWQ7XG5cdH1cblxuXHQvKipcblx0ICogU3RvcmVzIHRoZSBJRCBvZiB0aGUgY3VycmVudGx5IGZvY3VzZWQgY29udHJvbCBpbiB0aGUgaGlzdG9yeSBmb3IgdGhlIGN1cnJlbnQgaGFzaC5cblx0ICpcblx0ICovXG5cdHByaXZhdGUgc3RvcmVGb2N1c0luZm9Gb3JDdXJyZW50SGFzaCgpIHtcblx0XHRjb25zdCBjdXJyZW50SGFzaCA9IHJlbW92ZUFwcFN0YXRlSW5IYXNoKHRoaXMuZ2V0SGFzaCgpKTtcblx0XHRjb25zdCBzdGF0ZUZvckhhc2ggPSB0aGlzLl9vTWFuYWdlZEhpc3RvcnkuZmluZCgoc3RhdGUpID0+IHtcblx0XHRcdHJldHVybiByZW1vdmVBcHBTdGF0ZUluSGFzaChzdGF0ZS5oYXNoKSA9PT0gY3VycmVudEhhc2g7XG5cdFx0fSk7XG5cdFx0aWYgKHN0YXRlRm9ySGFzaCkge1xuXHRcdFx0Y29uc3QgZm9jdXNDb250cm9sSWQgPSBzYXAudWkuZ2V0Q29yZSgpLmdldEN1cnJlbnRGb2N1c2VkQ29udHJvbElkKCk7XG5cdFx0XHRjb25zdCBmb2N1c0NvbnRyb2wgPSBmb2N1c0NvbnRyb2xJZCA/IHNhcC51aS5nZXRDb3JlKCkuYnlJZChmb2N1c0NvbnRyb2xJZCkgOiB1bmRlZmluZWQ7XG5cdFx0XHRzdGF0ZUZvckhhc2guZm9jdXNDb250cm9sSWQgPSBmb2N1c0NvbnRyb2xJZDtcblx0XHRcdHN0YXRlRm9ySGFzaC5mb2N1c0luZm8gPSBmb2N1c0NvbnRyb2w/LmdldEZvY3VzSW5mbygpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhIGxheW91dCB2YWx1ZSBmb3IgYSBoYXNoIGluIHRoZSBoaXN0b3J5LlxuXHQgKlxuXHQgKiBAcGFyYW0gaGFzaCBUaGUgaGFzaCB0byBsb29rIGZvciBpbiB0aGUgaGlzdG9yeS5cblx0ICogQHJldHVybnMgQSBsYXlvdXQgdmFsdWUgaWYgaXQgY291bGQgYmUgZm91bmQsIHVuZGVmaW5lZCBvdGhlcndpc2UuXG5cdCAqL1xuXHRmaW5kTGF5b3V0Rm9ySGFzaChoYXNoOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdGlmICghdGhpcy5mY2xFbmFibGVkKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdC8vIFJlbW92ZSBhbGwgcXVlcnkgcGFyYW1ldGVycyBmcm9tIHRoZSBoYXNoXG5cdFx0Y29uc3QgaGFzaE5vUGFyYW0gPSBoYXNoLnNwbGl0KFwiP1wiKVswXTtcblxuXHRcdC8vIExvb2sgZm9yIHRoZSBzdGF0ZSBiYWNrd2FyZHMsIHNvIHRoYXQgd2UgZmluZCB0aGUgbGFzdCBzdGF0ZSBpbiB0aGUgaGlzdG9yeSAoZS5nLiBpZiB3ZSBoYXZlIDIgc3RhdGVzIHdpdGggdGhlIHNhbWUgaGFzaCBidXQgMiBkaWZmZXJlbnQgbGF5b3V0cylcblx0XHRsZXQgdGFyZ2V0U3RhdGU6IGFueTtcblx0XHRmb3IgKGxldCBpbmRleCA9IHRoaXMuX29NYW5hZ2VkSGlzdG9yeS5sZW5ndGggLSAxOyBpbmRleCA+PSAwICYmIHRhcmdldFN0YXRlID09PSB1bmRlZmluZWQ7IGluZGV4LS0pIHtcblx0XHRcdGlmICh0aGlzLl9vTWFuYWdlZEhpc3RvcnlbaW5kZXhdLmhhc2guc3BsaXQoXCI/XCIpWzBdID09PSBoYXNoTm9QYXJhbSkge1xuXHRcdFx0XHR0YXJnZXRTdGF0ZSA9IHRoaXMuX29NYW5hZ2VkSGlzdG9yeVtpbmRleF07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRhcmdldFN0YXRlPy5zTGF5b3V0O1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJvdXRlclByb3h5O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OztFQVVBLE1BQU1BLFNBQVMsR0FBRztJQUNqQkMsS0FBSyxFQUFFLENBQUM7SUFDUkMsVUFBVSxFQUFFLENBQUM7SUFDYkMsUUFBUSxFQUFFLENBQUM7SUFDWEMsU0FBUyxFQUFFO0VBQ1osQ0FBQztFQUNELE1BQU1DLGFBQWEsR0FBRztJQUNyQkMsV0FBVyxFQUFFLFFBQVE7SUFDckJDLGNBQWMsRUFBRTtFQUNqQixDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNDLG1CQUFtQixDQUFDQyxVQUFr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