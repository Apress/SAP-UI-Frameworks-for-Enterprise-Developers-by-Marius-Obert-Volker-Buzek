/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/navigation/library", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/fl/apply/api/ControlVariantApplyAPI", "sap/ui/mdc/p13n/StateUtil"], function (Log, mergeObjects, CommonUtils, ClassSupport, KeepAliveHelper, ModelHelper, NavLibrary, ControllerExtension, OverrideExecution, ControlVariantApplyAPI, StateUtil) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  // additionalStates are stored next to control IDs, so name clash avoidance needed. Fortunately IDs have restrictions:
  // "Allowed is a sequence of characters (capital/lowercase), digits, underscores, dashes, points and/or colons."
  // Therefore adding a symbol like # or @
  const ADDITIONAL_STATES_KEY = "#additionalStates",
    NavType = NavLibrary.NavType;

  /**
   * Definition of a custom action to be used inside the table toolbar
   *
   * @alias sap.fe.core.controllerextensions.NavigationParameter
   * @public
   */

  ///////////////////////////////////////////////////////////////////
  // methods to retrieve & apply states for the different controls //
  ///////////////////////////////////////////////////////////////////

  const _mControlStateHandlerMap = {
    "sap.ui.fl.variants.VariantManagement": {
      retrieve: function (oVM) {
        return {
          variantId: oVM.getCurrentVariantKey()
        };
      },
      apply: async function (oVM, controlState) {
        try {
          if (controlState && controlState.variantId !== undefined && controlState.variantId !== oVM.getCurrentVariantKey()) {
            const isVariantIdAvailable = this._checkIfVariantIdIsAvailable(oVM, controlState.variantId);
            let sVariantReference;
            if (isVariantIdAvailable) {
              sVariantReference = controlState.variantId;
            } else {
              sVariantReference = oVM.getStandardVariantKey();
              this.controlsVariantIdUnavailable.push(...oVM.getFor());
            }
            try {
              await ControlVariantApplyAPI.activateVariant({
                element: oVM,
                variantReference: sVariantReference
              });
              await this._setInitialStatesForDeltaCompute(oVM);
            } catch (error) {
              Log.error(error);
              this.invalidateInitialStateForApply.push(...oVM.getFor());
              await this._setInitialStatesForDeltaCompute(oVM);
            }
          } else {
            this._setInitialStatesForDeltaCompute(oVM);
          }
        } catch (error) {
          Log.error(error);
        }
      }
    },
    "sap.m.IconTabBar": {
      retrieve: function (oTabBar) {
        return {
          selectedKey: oTabBar.getSelectedKey()
        };
      },
      apply: function (oTabBar, oControlState) {
        if (oControlState && oControlState.selectedKey) {
          const oSelectedItem = oTabBar.getItems().find(function (oItem) {
            return oItem.getKey() === oControlState.selectedKey;
          });
          if (oSelectedItem) {
            oTabBar.setSelectedItem(oSelectedItem);
          }
        }
      }
    },
    "sap.ui.mdc.FilterBar": {
      retrieve: async function (filterBar) {
        const controlStateKey = this.getStateKey(filterBar);
        const filterBarState = await StateUtil.retrieveExternalState(filterBar);
        // remove sensitive or view state irrelevant fields
        const propertiesInfo = filterBar.getPropertyInfoSet();
        const filter = filterBarState.filter || {};
        propertiesInfo.filter(function (PropertyInfo) {
          return Object.keys(filter).length > 0 && PropertyInfo.path && filter[PropertyInfo.path] && (PropertyInfo.removeFromAppState || filter[PropertyInfo.path].length === 0);
        }).forEach(function (PropertyInfo) {
          if (PropertyInfo.path) {
            delete filter[PropertyInfo.path];
          }
        });
        return this._getControlState(controlStateKey, filterBarState);
      },
      apply: async function (filterBar, controlState) {
        try {
          if (controlState) {
            const isInitialStateApplicable = (controlState === null || controlState === void 0 ? void 0 : controlState.initialState) && this.invalidateInitialStateForApply.indexOf(filterBar.getId()) === -1 && this.controlsVariantIdUnavailable.indexOf(filterBar.getId()) === -1;
            if (isInitialStateApplicable) {
              const diffState = await StateUtil.diffState(filterBar, controlState.initialState, controlState.fullState);
              return StateUtil.applyExternalState(filterBar, diffState);
            } else {
              return StateUtil.applyExternalState(filterBar, (controlState === null || controlState === void 0 ? void 0 : controlState.fullState) ?? controlState);
            }
          }
        } catch (error) {
          Log.error(error);
        }
      }
    },
    "sap.ui.mdc.Table": {
      retrieve: async function (table) {
        const controlStateKey = this.getStateKey(table);
        const tableState = await StateUtil.retrieveExternalState(table);
        return this._getControlState(controlStateKey, tableState);
      },
      apply: async function (table, controlState) {
        try {
          if (controlState) {
            // Extra condition added to apply the diff state logic for mdc control
            const isInitialStateApplicable = (controlState === null || controlState === void 0 ? void 0 : controlState.initialState) && this.invalidateInitialStateForApply.indexOf(table.getId()) === -1 && this.controlsVariantIdUnavailable.indexOf(table.getId()) === -1;
            if (isInitialStateApplicable) {
              var _controlState$initial;
              if (controlState.initialState && !((_controlState$initial = controlState.initialState) !== null && _controlState$initial !== void 0 && _controlState$initial.supplementaryConfig)) {
                controlState.initialState.supplementaryConfig = {};
              }
              const oDiffState = await StateUtil.diffState(table, controlState.initialState, controlState.fullState);
              return StateUtil.applyExternalState(table, oDiffState);
            } else {
              if (!controlState.supplementaryConfig) {
                controlState.supplementaryConfig = {};
              }
              return StateUtil.applyExternalState(table, (controlState === null || controlState === void 0 ? void 0 : controlState.fullState) ?? controlState);
            }
          }
        } catch (error) {
          Log.error(error);
        }
      },
      refreshBinding: function (oTable) {
        const oTableBinding = oTable.getRowBinding();
        if (oTableBinding) {
          const oRootBinding = oTableBinding.getRootBinding();
          if (oRootBinding === oTableBinding) {
            // absolute binding
            oTableBinding.refresh();
          } else {
            // relative binding
            const oHeaderContext = oTableBinding.getHeaderContext();
            const sGroupId = oTableBinding.getGroupId();
            if (oHeaderContext) {
              oHeaderContext.requestSideEffects([{
                $NavigationPropertyPath: ""
              }], sGroupId);
            }
          }
        } else {
          Log.info(`Table: ${oTable.getId()} was not refreshed. No binding found!`);
        }
      }
    },
    "sap.ui.mdc.Chart": {
      retrieve: function (oChart) {
        return StateUtil.retrieveExternalState(oChart);
      },
      apply: function (oChart, oControlState) {
        if (oControlState) {
          return StateUtil.applyExternalState(oChart, oControlState);
        }
      }
      // TODO: uncomment after mdc fix is merged
      /* retrieve: async function (chart: Chart) {
      	const controlStateKey = this.getStateKey(chart);
      	const chartState = await StateUtil.retrieveExternalState(chart);
      		return this._getControlState(controlStateKey, chartState);
      },
      apply: async function (chart: Chart, controlState: ControlState) {
      	try {
      		if (controlState) {
      			// Extra condition added to apply the diff state logic for mdc control
      			const isInitialStateApplicable = controlState?.initialState && this.invalidateInitialStateForApply.indexOf(chart.getId()) === -1 && this.controlsVariantIdUnavailable.indexOf(chart.getId()) === -1;
      				if (isInitialStateApplicable) {
      				const diffState = await StateUtil.diffState(
      					chart,
      					controlState.initialState as object,
      					controlState.fullState as object
      				);
      				return await StateUtil.applyExternalState(chart, diffState);
      			} else {
      				return await StateUtil.applyExternalState(chart, controlState?.fullState ?? controlState);
      			}
      		}
      	} catch (error) {
      		Log.error(error as string);
      	}
      } */
    },

    "sap.uxap.ObjectPageLayout": {
      retrieve: function (oOPLayout) {
        return {
          selectedSection: oOPLayout.getSelectedSection()
        };
      },
      apply: function (oOPLayout, oControlState) {
        if (oControlState) {
          oOPLayout.setSelectedSection(oControlState.selectedSection);
        }
      },
      refreshBinding: function (oOPLayout) {
        const oBindingContext = oOPLayout.getBindingContext();
        const oBinding = oBindingContext && oBindingContext.getBinding();
        if (oBinding) {
          const sMetaPath = ModelHelper.getMetaPathForContext(oBindingContext);
          const sStrategy = KeepAliveHelper.getControlRefreshStrategyForContextPath(oOPLayout, sMetaPath);
          if (sStrategy === "self") {
            // Refresh main context and 1-1 navigation properties or OP
            const oModel = oBindingContext.getModel(),
              oMetaModel = oModel.getMetaModel(),
              oNavigationProperties = CommonUtils.getContextPathProperties(oMetaModel, sMetaPath, {
                $kind: "NavigationProperty"
              }) || {},
              aNavPropertiesToRequest = Object.keys(oNavigationProperties).reduce(function (aPrev, sNavProp) {
                if (oNavigationProperties[sNavProp].$isCollection !== true) {
                  aPrev.push({
                    $NavigationPropertyPath: sNavProp
                  });
                }
                return aPrev;
              }, []),
              aProperties = [{
                $PropertyPath: "*"
              }],
              sGroupId = oBinding.getGroupId();
            oBindingContext.requestSideEffects(aProperties.concat(aNavPropertiesToRequest), sGroupId);
          } else if (sStrategy === "includingDependents") {
            // Complete refresh
            oBinding.refresh();
          }
        } else {
          Log.info(`ObjectPage: ${oOPLayout.getId()} was not refreshed. No binding found!`);
        }
      }
    },
    "sap.fe.macros.table.QuickFilterContainer": {
      retrieve: function (oQuickFilter) {
        return {
          selectedKey: oQuickFilter.getSelectorKey()
        };
      },
      apply: function (oQuickFilter, oControlState) {
        if (oControlState !== null && oControlState !== void 0 && oControlState.selectedKey) {
          oQuickFilter.setSelectorKey(oControlState.selectedKey);
        }
      }
    },
    "sap.m.SegmentedButton": {
      retrieve: function (oSegmentedButton) {
        return {
          selectedKey: oSegmentedButton.getSelectedKey()
        };
      },
      apply: function (oSegmentedButton, oControlState) {
        if (oControlState !== null && oControlState !== void 0 && oControlState.selectedKey) {
          oSegmentedButton.setSelectedKey(oControlState.selectedKey);
        }
      }
    },
    "sap.m.Select": {
      retrieve: function (oSelect) {
        return {
          selectedKey: oSelect.getSelectedKey()
        };
      },
      apply: function (oSelect, oControlState) {
        if (oControlState !== null && oControlState !== void 0 && oControlState.selectedKey) {
          oSelect.setSelectedKey(oControlState.selectedKey);
        }
      }
    },
    "sap.f.DynamicPage": {
      retrieve: function (oDynamicPage) {
        return {
          headerExpanded: oDynamicPage.getHeaderExpanded()
        };
      },
      apply: function (oDynamicPage, oControlState) {
        if (oControlState) {
          oDynamicPage.setHeaderExpanded(oControlState.headerExpanded);
        }
      }
    },
    "sap.ui.core.mvc.View": {
      retrieve: function (oView) {
        const oController = oView.getController();
        if (oController && oController.viewState) {
          return oController.viewState.retrieveViewState(oController.viewState);
        }
        return {};
      },
      apply: function (oView, oControlState, oNavParameters) {
        const oController = oView.getController();
        if (oController && oController.viewState) {
          return oController.viewState.applyViewState(oControlState, oNavParameters);
        }
      },
      refreshBinding: function (oView) {
        const oController = oView.getController();
        if (oController && oController.viewState) {
          return oController.viewState.refreshViewBindings();
        }
      }
    },
    "sap.ui.core.ComponentContainer": {
      retrieve: function (oComponentContainer) {
        const oComponent = oComponentContainer.getComponentInstance();
        if (oComponent) {
          return this.retrieveControlState(oComponent.getRootControl());
        }
        return {};
      },
      apply: function (oComponentContainer, oControlState, oNavParameters) {
        const oComponent = oComponentContainer.getComponentInstance();
        if (oComponent) {
          return this.applyControlState(oComponent.getRootControl(), oControlState, oNavParameters);
        }
      }
    }
  };
  /**
   * A controller extension offering hooks for state handling
   *
   * If you need to maintain a specific state for your application, you can use the controller extension.
   *
   * @hideconstructor
   * @public
   * @since 1.85.0
   */
  let ViewState = (_dec = defineUI5Class("sap.fe.core.controllerextensions.ViewState"), _dec2 = publicExtension(), _dec3 = finalExtension(), _dec4 = publicExtension(), _dec5 = extensible(OverrideExecution.After), _dec6 = privateExtension(), _dec7 = finalExtension(), _dec8 = privateExtension(), _dec9 = finalExtension(), _dec10 = publicExtension(), _dec11 = extensible(OverrideExecution.After), _dec12 = publicExtension(), _dec13 = extensible(OverrideExecution.After), _dec14 = publicExtension(), _dec15 = extensible(OverrideExecution.After), _dec16 = privateExtension(), _dec17 = finalExtension(), _dec18 = publicExtension(), _dec19 = extensible(OverrideExecution.After), _dec20 = privateExtension(), _dec21 = finalExtension(), _dec22 = publicExtension(), _dec23 = extensible(OverrideExecution.After), _dec24 = publicExtension(), _dec25 = finalExtension(), _dec26 = publicExtension(), _dec27 = finalExtension(), _dec28 = publicExtension(), _dec29 = extensible(OverrideExecution.After), _dec30 = privateExtension(), _dec31 = finalExtension(), _dec32 = publicExtension(), _dec33 = extensible(OverrideExecution.Instead), _dec34 = publicExtension(), _dec35 = finalExtension(), _dec36 = privateExtension(), _dec37 = publicExtension(), _dec38 = extensible(OverrideExecution.After), _dec39 = publicExtension(), _dec40 = extensible(OverrideExecution.After), _dec41 = publicExtension(), _dec42 = extensible(OverrideExecution.After), _dec43 = privateExtension(), _dec44 = publicExtension(), _dec45 = extensible(OverrideExecution.After), _dec46 = privateExtension(), _dec47 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(ViewState, _ControllerExtension);
    /**
     * Constructor.
     */
    function ViewState() {
      var _this;
      _this = _ControllerExtension.call(this) || this;
      _this.initialControlStatesMapper = {};
      _this.controlsVariantIdUnavailable = [];
      _this.invalidateInitialStateForApply = [];
      _this.viewStateControls = [];
      _this._setInitialStatesForDeltaCompute = async variantManagement => {
        try {
          const adaptControls = _this.viewStateControls;
          const externalStatePromises = [];
          const controlStateKey = [];
          let initialControlStates = [];
          const variantControls = (variantManagement === null || variantManagement === void 0 ? void 0 : variantManagement.getFor()) ?? [];
          adaptControls.filter(function (control) {
            return control && (!variantManagement || variantControls.indexOf(control.getId()) > -1) && (control.isA("sap.ui.mdc.Table") || control.isA("sap.ui.mdc.FilterBar") || control.isA("sap.ui.mdc.Chart"));
          }).forEach(control => {
            if (variantManagement) {
              _this._addEventListenersToVariantManagement(variantManagement, variantControls);
            }
            const externalStatePromise = StateUtil.retrieveExternalState(control);
            externalStatePromises.push(externalStatePromise);
            controlStateKey.push(_this.getStateKey(control));
          });
          initialControlStates = await Promise.all(externalStatePromises);
          initialControlStates.forEach((initialControlState, i) => {
            _this.initialControlStatesMapper[controlStateKey[i]] = initialControlState;
          });
        } catch (e) {
          Log.error(e);
        }
      };
      _this._iRetrievingStateCounter = 0;
      _this._pInitialStateApplied = new Promise(resolve => {
        _this._pInitialStateAppliedResolve = resolve;
      });
      return _this;
    }
    var _proto = ViewState.prototype;
    _proto.refreshViewBindings = async function refreshViewBindings() {
      const aControls = await this.collectResults(this.base.viewState.adaptBindingRefreshControls);
      let oPromiseChain = Promise.resolve();
      aControls.filter(oControl => {
        return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
      }).forEach(oControl => {
        oPromiseChain = oPromiseChain.then(this.refreshControlBinding.bind(this, oControl));
      });
      return oPromiseChain;
    }

    /**
     * This function should add all controls relevant for refreshing to the provided control array.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aCollectedControls The collected controls
     * @alias sap.fe.core.controllerextensions.ViewState#adaptBindingRefreshControls
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptBindingRefreshControls = function adaptBindingRefreshControls(aCollectedControls) {
      // to be overriden
    };
    _proto.refreshControlBinding = function refreshControlBinding(oControl) {
      const oControlRefreshBindingHandler = this.getControlRefreshBindingHandler(oControl);
      let oPromiseChain = Promise.resolve();
      if (typeof oControlRefreshBindingHandler.refreshBinding !== "function") {
        Log.info(`refreshBinding handler for control: ${oControl.getMetadata().getName()} is not provided`);
      } else {
        oPromiseChain = oPromiseChain.then(oControlRefreshBindingHandler.refreshBinding.bind(this, oControl));
      }
      return oPromiseChain;
    }

    /**
     * Returns a map of <code>refreshBinding</code> function for a certain control.
     *
     * @param {sap.ui.base.ManagedObject} oControl The control to get state handler for
     * @returns {object} A plain object with one function: <code>refreshBinding</code>
     */;
    _proto.getControlRefreshBindingHandler = function getControlRefreshBindingHandler(oControl) {
      const oRefreshBindingHandler = {};
      if (oControl) {
        for (const sType in _mControlStateHandlerMap) {
          if (oControl.isA(sType)) {
            // pass only the refreshBinding handler in an object so that :
            // 1. Application has access only to refreshBinding and not apply and reterive at this stage
            // 2. Application modifications to the object will be reflected here (as we pass by reference)
            oRefreshBindingHandler["refreshBinding"] = _mControlStateHandlerMap[sType].refreshBinding || {};
            break;
          }
        }
      }
      this.base.viewState.adaptBindingRefreshHandler(oControl, oRefreshBindingHandler);
      return oRefreshBindingHandler;
    }

    /**
     * Customize the <code>refreshBinding</code> function for a certain control.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oControl The control for which the refresh handler is adapted.
     * @param oControlHandler A plain object which can have one function: <code>refreshBinding</code>
     * @alias sap.fe.core.controllerextensions.ViewState#adaptBindingRefreshHandler
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptBindingRefreshHandler = function adaptBindingRefreshHandler(oControl, oControlHandler) {
      // to be overriden
    }

    /**
     * Called when the application is suspended due to keep-alive mode.
     *
     * @alias sap.fe.core.controllerextensions.ViewState#onSuspend
     * @public
     */;
    _proto.onSuspend = function onSuspend() {
      // to be overriden
    }

    /**
     * Called when the application is restored due to keep-alive mode.
     *
     * @alias sap.fe.core.controllerextensions.ViewState#onRestore
     * @public
     */;
    _proto.onRestore = function onRestore() {
      // to be overriden
    }

    /**
     * Destructor method for objects.
     */;
    _proto.destroy = function destroy() {
      delete this._pInitialStateAppliedResolve;
      _ControllerExtension.prototype.destroy.call(this);
    }

    /**
     * Helper function to enable multi override. It is adding an additional parameter (array) to the provided
     * function (and its parameters), that will be evaluated via <code>Promise.all</code>.
     *
     * @param fnCall The function to be called
     * @param args
     * @returns A promise to be resolved with the result of all overrides
     */;
    _proto.collectResults = function collectResults(fnCall) {
      const aResults = [];
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      args.push(aResults);
      fnCall.apply(this, args);
      return Promise.all(aResults);
    }

    /**
     * Customize the <code>retrieve</code> and <code>apply</code> functions for a certain control.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oControl The control to get state handler for
     * @param aControlHandler A list of plain objects with two functions: <code>retrieve</code> and <code>apply</code>
     * @alias sap.fe.core.controllerextensions.ViewState#adaptControlStateHandler
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptControlStateHandler = function adaptControlStateHandler(oControl, aControlHandler) {
      // to be overridden if needed
    }

    /**
     * Returns a map of <code>retrieve</code> and <code>apply</code> functions for a certain control.
     *
     * @param oControl The control to get state handler for
     * @returns A plain object with two functions: <code>retrieve</code> and <code>apply</code>
     */;
    _proto.getControlStateHandler = function getControlStateHandler(oControl) {
      const aInternalControlStateHandler = [],
        aCustomControlStateHandler = [];
      if (oControl) {
        for (const sType in _mControlStateHandlerMap) {
          if (oControl.isA(sType)) {
            // avoid direct manipulation of internal _mControlStateHandlerMap
            aInternalControlStateHandler.push(Object.assign({}, _mControlStateHandlerMap[sType]));
            break;
          }
        }
      }
      this.base.viewState.adaptControlStateHandler(oControl, aCustomControlStateHandler);
      return aInternalControlStateHandler.concat(aCustomControlStateHandler);
    }

    /**
     * This function should add all controls for given view that should be considered for the state handling to the provided control array.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aCollectedControls The collected controls
     * @alias sap.fe.core.controllerextensions.ViewState#adaptStateControls
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptStateControls = function adaptStateControls(aCollectedControls) {
      // to be overridden if needed
    }

    /**
     * Returns the key to be used for given control.
     *
     * @param oControl The control to get state key for
     * @returns The key to be used for storing the controls state
     */;
    _proto.getStateKey = function getStateKey(oControl) {
      return this.getView().getLocalId(oControl.getId()) || oControl.getId();
    }

    /**
     * Retrieve the view state of this extensions view.
     * When this function is called more than once before finishing, all but the final response will resolve to <code>undefined</code>.
     *
     * @returns A promise resolving the view state
     * @alias sap.fe.core.controllerextensions.ViewState#retrieveViewState
     * @public
     */;
    _proto.retrieveViewState = async function retrieveViewState() {
      ++this._iRetrievingStateCounter;
      let oViewState;
      try {
        await this._pInitialStateApplied;
        const aControls = await this.collectResults(this.base.viewState.adaptStateControls);
        const aResolvedStates = await Promise.all(aControls.filter(function (oControl) {
          return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
        }).map(oControl => {
          return this.retrieveControlState(oControl).then(vResult => {
            return {
              key: this.getStateKey(oControl),
              value: vResult
            };
          });
        }));
        oViewState = aResolvedStates.reduce(function (oStates, mState) {
          const oCurrentState = {};
          oCurrentState[mState.key] = mState.value;
          return mergeObjects(oStates, oCurrentState);
        }, {});
        const mAdditionalStates = await Promise.resolve(this._retrieveAdditionalStates());
        if (mAdditionalStates && Object.keys(mAdditionalStates).length) {
          oViewState[ADDITIONAL_STATES_KEY] = mAdditionalStates;
        }
      } finally {
        --this._iRetrievingStateCounter;
      }
      return this._iRetrievingStateCounter === 0 ? oViewState : undefined;
    }

    /**
     * Extend the map of additional states (not control bound) to be added to the current view state of the given view.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param mAdditionalStates The additional state
     * @alias sap.fe.core.controllerextensions.ViewState#retrieveAdditionalStates
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    retrieveAdditionalStates = function retrieveAdditionalStates(mAdditionalStates) {
      // to be overridden if needed
    }

    /**
     * Returns a map of additional states (not control bound) to be added to the current view state of the given view.
     *
     * @returns Additional view states
     */;
    _proto._retrieveAdditionalStates = function _retrieveAdditionalStates() {
      const mAdditionalStates = {};
      this.base.viewState.retrieveAdditionalStates(mAdditionalStates);
      return mAdditionalStates;
    }

    /**
     * Returns the current state for the given control.
     *
     * @param oControl The object to get the state for
     * @returns The state for the given control
     */;
    _proto.retrieveControlState = function retrieveControlState(oControl) {
      const aControlStateHandlers = this.getControlStateHandler(oControl);
      return Promise.all(aControlStateHandlers.map(mControlStateHandler => {
        if (typeof mControlStateHandler.retrieve !== "function") {
          throw new Error(`controlStateHandler.retrieve is not a function for control: ${oControl.getMetadata().getName()}`);
        }
        return mControlStateHandler.retrieve.call(this, oControl);
      })).then(aStates => {
        return aStates.reduce(function (oFinalState, oCurrentState) {
          return mergeObjects(oFinalState, oCurrentState);
        }, {});
      });
    }

    /**
     * Defines whether the view state should only be applied once initially.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.Instead}.
     *
     * Important:
     * You should only override this method for custom pages and not for the standard ListReportPage and ObjectPage!
     *
     * @returns If <code>true</code>, only the initial view state is applied once,
     * else any new view state is also applied on follow-up calls (default)
     * @alias sap.fe.core.controllerextensions.ViewState#applyInitialStateOnly
     * @protected
     */;
    _proto.applyInitialStateOnly = function applyInitialStateOnly() {
      return true;
    }

    /**
     * Applies the given view state to this extensions view.
     *
     * @param oViewState The view state to apply (can be undefined)
     * @param oNavParameter The current navigation parameter
     * @param oNavParameter.navigationType The actual navigation type
     * @param oNavParameter.selectionVariant The selectionVariant from the navigation
     * @param oNavParameter.selectionVariantDefaults The selectionVariant defaults from the navigation
     * @param oNavParameter.requiresStandardVariant Defines whether the standard variant must be used in variant management
     * @returns Promise for async state handling
     * @alias sap.fe.core.controllerextensions.ViewState#applyViewState
     * @public
     */;
    _proto.applyViewState = async function applyViewState(oViewState, oNavParameter) {
      if (this.base.viewState.applyInitialStateOnly() && this._getInitialStateApplied()) {
        return;
      }
      try {
        await this.collectResults(this.base.viewState.onBeforeStateApplied);
        const aControls = await this.collectResults(this.base.viewState.adaptStateControls);
        this.viewStateControls = aControls;
        let oPromiseChain = Promise.resolve();
        let hasVariantManagement = false;
        /**
         * this ensures that variantManagement control is applied first to calculate initial state for delta logic
         */
        const sortedAdaptStateControls = aControls.reduce((modifiedControls, control) => {
          if (!control) {
            return modifiedControls;
          }
          const isVariantManagementControl = control.isA("sap.ui.fl.variants.VariantManagement");
          if (!hasVariantManagement) {
            hasVariantManagement = isVariantManagementControl;
          }
          modifiedControls = isVariantManagementControl ? [control, ...modifiedControls] : [...modifiedControls, control];
          return modifiedControls;
        }, []);

        // In case of no Variant Management, this ensures that initial states is set
        if (!hasVariantManagement) {
          this._setInitialStatesForDeltaCompute();
        }
        sortedAdaptStateControls.filter(function (oControl) {
          return oControl.isA("sap.ui.base.ManagedObject");
        }).forEach(oControl => {
          const sKey = this.getStateKey(oControl);
          oPromiseChain = oPromiseChain.then(this.applyControlState.bind(this, oControl, oViewState ? oViewState[sKey] : undefined, oNavParameter));
        });
        await oPromiseChain;
        if (oNavParameter.navigationType === NavType.iAppState) {
          await this.collectResults(this.base.viewState.applyAdditionalStates, oViewState ? oViewState[ADDITIONAL_STATES_KEY] : undefined);
        } else {
          await this.collectResults(this.base.viewState.applyNavigationParameters, oNavParameter);
          await this.collectResults(this.base.viewState._applyNavigationParametersToFilterbar, oNavParameter);
        }
      } finally {
        try {
          await this.collectResults(this.base.viewState.onAfterStateApplied);
          this._setInitialStateApplied();
        } catch (e) {
          Log.error(e);
        }
      }
    };
    _proto._checkIfVariantIdIsAvailable = function _checkIfVariantIdIsAvailable(oVM, sVariantId) {
      const aVariants = oVM.getVariants();
      let bIsControlStateVariantAvailable = false;
      aVariants.forEach(function (oVariant) {
        if (oVariant.key === sVariantId) {
          bIsControlStateVariantAvailable = true;
        }
      });
      return bIsControlStateVariantAvailable;
    };
    _proto._setInitialStateApplied = function _setInitialStateApplied() {
      if (this._pInitialStateAppliedResolve) {
        const pInitialStateAppliedResolve = this._pInitialStateAppliedResolve;
        delete this._pInitialStateAppliedResolve;
        pInitialStateAppliedResolve();
      }
    };
    _proto._getInitialStateApplied = function _getInitialStateApplied() {
      return !this._pInitialStateAppliedResolve;
    }

    /**
     * Hook to react before a state for given view is applied.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#onBeforeStateApplied
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeStateApplied = function onBeforeStateApplied(aPromises) {
      // to be overriden
    }

    /**
     * Hook to react when state for given view was applied.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#onAfterStateApplied
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onAfterStateApplied = function onAfterStateApplied(aPromises) {
      // to be overriden
    }

    /**
     * Applying additional, not control related, states - is called only if navigation type is iAppState.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oViewState The current view state
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#applyAdditionalStates
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    applyAdditionalStates = function applyAdditionalStates(oViewState, aPromises) {
      // to be overridden if needed
    };
    _proto._applyNavigationParametersToFilterbar = function _applyNavigationParametersToFilterbar(_oNavParameter, _aPromises) {
      // to be overridden if needed
    }

    /**
     * Apply navigation parameters is not called if the navigation type is iAppState
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oNavParameter The current navigation parameter
     * @param oNavParameter.navigationType The actual navigation type
     * @param [oNavParameter.selectionVariant] The selectionVariant from the navigation
     * @param [oNavParameter.selectionVariantDefaults] The selectionVariant defaults from the navigation
     * @param [oNavParameter.requiresStandardVariant] Defines whether the standard variant must be used in variant management
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#applyNavigationParameters
     * @protected
     */;
    _proto.applyNavigationParameters = function applyNavigationParameters(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    oNavParameter,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    aPromises) {
      // to be overridden if needed
    }

    /**
     * Applying the given state to the given control.
     *
     * @param oControl The object to apply the given state
     * @param oControlState The state for the given control
     * @param [oNavParameters] The current navigation parameters
     * @returns Return a promise for async state handling
     */;
    _proto.applyControlState = function applyControlState(oControl, oControlState, oNavParameters) {
      const aControlStateHandlers = this.getControlStateHandler(oControl);
      let oPromiseChain = Promise.resolve();
      aControlStateHandlers.forEach(mControlStateHandler => {
        if (typeof mControlStateHandler.apply !== "function") {
          throw new Error(`controlStateHandler.apply is not a function for control: ${oControl.getMetadata().getName()}`);
        }
        oPromiseChain = oPromiseChain.then(mControlStateHandler.apply.bind(this, oControl, oControlState, oNavParameters));
      });
      return oPromiseChain;
    };
    _proto.getInterface = function getInterface() {
      return this;
    }

    // method to get the control state for mdc controls applying the delta logic
    ;
    _proto._getControlState = function _getControlState(controlStateKey, controlState) {
      const initialControlStatesMapper = this.initialControlStatesMapper;
      if (Object.keys(initialControlStatesMapper).length > 0 && initialControlStatesMapper[controlStateKey]) {
        if (Object.keys(initialControlStatesMapper[controlStateKey]).length === 0) {
          initialControlStatesMapper[controlStateKey] = {
            ...controlState
          };
        }
        return {
          fullState: controlState,
          initialState: initialControlStatesMapper[controlStateKey]
        };
      }
      return controlState;
    }

    //method to store the initial states for delta computation of mdc controls
    ;
    // Attach event to save and select of Variant Management to update the initial Control States on variant change
    _proto._addEventListenersToVariantManagement = function _addEventListenersToVariantManagement(variantManagement, variantControls) {
      const oPayload = {
        variantManagedControls: variantControls
      };
      const fnEvent = () => {
        this._updateInitialStatesOnVariantChange(variantControls);
      };
      variantManagement.attachSave(oPayload, fnEvent, {});
      variantManagement.attachSelect(oPayload, fnEvent, {});
    };
    _proto._updateInitialStatesOnVariantChange = function _updateInitialStatesOnVariantChange(vmAssociatedControlsToReset) {
      const initialControlStatesMapper = this.initialControlStatesMapper;
      Object.keys(initialControlStatesMapper).forEach(controlKey => {
        for (const vmAssociatedcontrolKey of vmAssociatedControlsToReset) {
          if (vmAssociatedcontrolKey.indexOf(controlKey) > -1) {
            initialControlStatesMapper[controlKey] = {};
          }
        }
      });
    };
    return ViewState;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "refreshViewBindings", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "refreshViewBindings"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptBindingRefreshControls", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptBindingRefreshControls"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "refreshControlBinding", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "refreshControlBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getControlRefreshBindingHandler", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "getControlRefreshBindingHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptBindingRefreshHandler", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptBindingRefreshHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onSuspend", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "onSuspend"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRestore", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onRestore"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "collectResults", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "collectResults"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptControlStateHandler", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptControlStateHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getControlStateHandler", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "getControlStateHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptStateControls", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptStateControls"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getStateKey", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "getStateKey"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "retrieveViewState", [_dec26, _dec27], Object.getOwnPropertyDescriptor(_class2.prototype, "retrieveViewState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "retrieveAdditionalStates", [_dec28, _dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "retrieveAdditionalStates"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "retrieveControlState", [_dec30, _dec31], Object.getOwnPropertyDescriptor(_class2.prototype, "retrieveControlState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyInitialStateOnly", [_dec32, _dec33], Object.getOwnPropertyDescriptor(_class2.prototype, "applyInitialStateOnly"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyViewState", [_dec34, _dec35], Object.getOwnPropertyDescriptor(_class2.prototype, "applyViewState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_checkIfVariantIdIsAvailable", [_dec36], Object.getOwnPropertyDescriptor(_class2.prototype, "_checkIfVariantIdIsAvailable"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeStateApplied", [_dec37, _dec38], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeStateApplied"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterStateApplied", [_dec39, _dec40], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterStateApplied"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyAdditionalStates", [_dec41, _dec42], Object.getOwnPropertyDescriptor(_class2.prototype, "applyAdditionalStates"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_applyNavigationParametersToFilterbar", [_dec43], Object.getOwnPropertyDescriptor(_class2.prototype, "_applyNavigationParametersToFilterbar"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyNavigationParameters", [_dec44, _dec45], Object.getOwnPropertyDescriptor(_class2.prototype, "applyNavigationParameters"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyControlState", [_dec46, _dec47], Object.getOwnPropertyDescriptor(_class2.prototype, "applyControlState"), _class2.prototype)), _class2)) || _class);
  return ViewState;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBRERJVElPTkFMX1NUQVRFU19LRVkiLCJOYXZUeXBlIiwiTmF2TGlicmFyeSIsIl9tQ29udHJvbFN0YXRlSGFuZGxlck1hcCIsInJldHJpZXZlIiwib1ZNIiwidmFyaWFudElkIiwiZ2V0Q3VycmVudFZhcmlhbnRLZXkiLCJhcHBseSIsImNvbnRyb2xTdGF0ZSIsInVuZGVmaW5lZCIsImlzVmFyaWFudElkQXZhaWxhYmxlIiwiX2NoZWNrSWZWYXJpYW50SWRJc0F2YWlsYWJsZSIsInNWYXJpYW50UmVmZXJlbmNlIiwiZ2V0U3RhbmRhcmRWYXJpYW50S2V5IiwiY29udHJvbHNWYXJpYW50SWRVbmF2YWlsYWJsZSIsInB1c2giLCJnZXRGb3IiLCJDb250cm9sVmFyaWFudEFwcGx5QVBJIiwiYWN0aXZhdGVWYXJpYW50IiwiZWxlbWVudCIsInZhcmlhbnRSZWZlcmVuY2UiLCJfc2V0SW5pdGlhbFN0YXRlc0ZvckRlbHRhQ29tcHV0ZSIsImVycm9yIiwiTG9nIiwiaW52YWxpZGF0ZUluaXRpYWxTdGF0ZUZvckFwcGx5Iiwib1RhYkJhciIsInNlbGVjdGVkS2V5IiwiZ2V0U2VsZWN0ZWRLZXkiLCJvQ29udHJvbFN0YXRlIiwib1NlbGVjdGVkSXRlbSIsImdldEl0ZW1zIiwiZmluZCIsIm9JdGVtIiwiZ2V0S2V5Iiwic2V0U2VsZWN0ZWRJdGVtIiwiZmlsdGVyQmFyIiwiY29udHJvbFN0YXRlS2V5IiwiZ2V0U3RhdGVLZXkiLCJmaWx0ZXJCYXJTdGF0ZSIsIlN0YXRlVXRpbCIsInJldHJpZXZlRXh0ZXJuYWxTdGF0ZSIsInByb3BlcnRpZXNJbmZvIiwiZ2V0UHJvcGVydHlJbmZvU2V0IiwiZmlsdGVyIiwiUHJvcGVydHlJbmZvIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsInBhdGgiLCJyZW1vdmVGcm9tQXBwU3RhdGUiLCJmb3JFYWNoIiwiX2dldENvbnRyb2xTdGF0ZSIsImlzSW5pdGlhbFN0YXRlQXBwbGljYWJsZSIsImluaXRpYWxTdGF0ZSIsImluZGV4T2YiLCJnZXRJZCIsImRpZmZTdGF0ZSIsImZ1bGxTdGF0ZSIsImFwcGx5RXh0ZXJuYWxTdGF0ZSIsInRhYmxlIiwidGFibGVTdGF0ZSIsInN1cHBsZW1lbnRhcnlDb25maWciLCJvRGlmZlN0YXRlIiwicmVmcmVzaEJpbmRpbmciLCJvVGFibGUiLCJvVGFibGVCaW5kaW5nIiwiZ2V0Um93QmluZGluZyIsIm9Sb290QmluZGluZyIsImdldFJvb3RCaW5kaW5nIiwicmVmcmVzaCIsIm9IZWFkZXJDb250ZXh0IiwiZ2V0SGVhZGVyQ29udGV4dCIsInNHcm91cElkIiwiZ2V0R3JvdXBJZCIsInJlcXVlc3RTaWRlRWZmZWN0cyIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiaW5mbyIsIm9DaGFydCIsIm9PUExheW91dCIsInNlbGVjdGVkU2VjdGlvbiIsImdldFNlbGVjdGVkU2VjdGlvbiIsInNldFNlbGVjdGVkU2VjdGlvbiIsIm9CaW5kaW5nQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwib0JpbmRpbmciLCJnZXRCaW5kaW5nIiwic01ldGFQYXRoIiwiTW9kZWxIZWxwZXIiLCJnZXRNZXRhUGF0aEZvckNvbnRleHQiLCJzU3RyYXRlZ3kiLCJLZWVwQWxpdmVIZWxwZXIiLCJnZXRDb250cm9sUmVmcmVzaFN0cmF0ZWd5Rm9yQ29udGV4dFBhdGgiLCJvTW9kZWwiLCJnZXRNb2RlbCIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJvTmF2aWdhdGlvblByb3BlcnRpZXMiLCJDb21tb25VdGlscyIsImdldENvbnRleHRQYXRoUHJvcGVydGllcyIsIiRraW5kIiwiYU5hdlByb3BlcnRpZXNUb1JlcXVlc3QiLCJyZWR1Y2UiLCJhUHJldiIsInNOYXZQcm9wIiwiJGlzQ29sbGVjdGlvbiIsImFQcm9wZXJ0aWVzIiwiJFByb3BlcnR5UGF0aCIsImNvbmNhdCIsIm9RdWlja0ZpbHRlciIsImdldFNlbGVjdG9yS2V5Iiwic2V0U2VsZWN0b3JLZXkiLCJvU2VnbWVudGVkQnV0dG9uIiwic2V0U2VsZWN0ZWRLZXkiLCJvU2VsZWN0Iiwib0R5bmFtaWNQYWdlIiwiaGVhZGVyRXhwYW5kZWQiLCJnZXRIZWFkZXJFeHBhbmRlZCIsInNldEhlYWRlckV4cGFuZGVkIiwib1ZpZXciLCJvQ29udHJvbGxlciIsImdldENvbnRyb2xsZXIiLCJ2aWV3U3RhdGUiLCJyZXRyaWV2ZVZpZXdTdGF0ZSIsIm9OYXZQYXJhbWV0ZXJzIiwiYXBwbHlWaWV3U3RhdGUiLCJyZWZyZXNoVmlld0JpbmRpbmdzIiwib0NvbXBvbmVudENvbnRhaW5lciIsIm9Db21wb25lbnQiLCJnZXRDb21wb25lbnRJbnN0YW5jZSIsInJldHJpZXZlQ29udHJvbFN0YXRlIiwiZ2V0Um9vdENvbnRyb2wiLCJhcHBseUNvbnRyb2xTdGF0ZSIsIlZpZXdTdGF0ZSIsImRlZmluZVVJNUNsYXNzIiwicHVibGljRXh0ZW5zaW9uIiwiZmluYWxFeHRlbnNpb24iLCJleHRlbnNpYmxlIiwiT3ZlcnJpZGVFeGVjdXRpb24iLCJBZnRlciIsInByaXZhdGVFeHRlbnNpb24iLCJJbnN0ZWFkIiwiaW5pdGlhbENvbnRyb2xTdGF0ZXNNYXBwZXIiLCJ2aWV3U3RhdGVDb250cm9scyIsInZhcmlhbnRNYW5hZ2VtZW50IiwiYWRhcHRDb250cm9scyIsImV4dGVybmFsU3RhdGVQcm9taXNlcyIsImluaXRpYWxDb250cm9sU3RhdGVzIiwidmFyaWFudENvbnRyb2xzIiwiY29udHJvbCIsImlzQSIsIl9hZGRFdmVudExpc3RlbmVyc1RvVmFyaWFudE1hbmFnZW1lbnQiLCJleHRlcm5hbFN0YXRlUHJvbWlzZSIsIlByb21pc2UiLCJhbGwiLCJpbml0aWFsQ29udHJvbFN0YXRlIiwiaSIsImUiLCJfaVJldHJpZXZpbmdTdGF0ZUNvdW50ZXIiLCJfcEluaXRpYWxTdGF0ZUFwcGxpZWQiLCJyZXNvbHZlIiwiX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZSIsImFDb250cm9scyIsImNvbGxlY3RSZXN1bHRzIiwiYmFzZSIsImFkYXB0QmluZGluZ1JlZnJlc2hDb250cm9scyIsIm9Qcm9taXNlQ2hhaW4iLCJvQ29udHJvbCIsInRoZW4iLCJyZWZyZXNoQ29udHJvbEJpbmRpbmciLCJiaW5kIiwiYUNvbGxlY3RlZENvbnRyb2xzIiwib0NvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIiLCJnZXRDb250cm9sUmVmcmVzaEJpbmRpbmdIYW5kbGVyIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwib1JlZnJlc2hCaW5kaW5nSGFuZGxlciIsInNUeXBlIiwiYWRhcHRCaW5kaW5nUmVmcmVzaEhhbmRsZXIiLCJvQ29udHJvbEhhbmRsZXIiLCJvblN1c3BlbmQiLCJvblJlc3RvcmUiLCJkZXN0cm95IiwiZm5DYWxsIiwiYVJlc3VsdHMiLCJhcmdzIiwiYWRhcHRDb250cm9sU3RhdGVIYW5kbGVyIiwiYUNvbnRyb2xIYW5kbGVyIiwiZ2V0Q29udHJvbFN0YXRlSGFuZGxlciIsImFJbnRlcm5hbENvbnRyb2xTdGF0ZUhhbmRsZXIiLCJhQ3VzdG9tQ29udHJvbFN0YXRlSGFuZGxlciIsImFzc2lnbiIsImFkYXB0U3RhdGVDb250cm9scyIsImdldFZpZXciLCJnZXRMb2NhbElkIiwib1ZpZXdTdGF0ZSIsImFSZXNvbHZlZFN0YXRlcyIsIm1hcCIsInZSZXN1bHQiLCJrZXkiLCJ2YWx1ZSIsIm9TdGF0ZXMiLCJtU3RhdGUiLCJvQ3VycmVudFN0YXRlIiwibWVyZ2VPYmplY3RzIiwibUFkZGl0aW9uYWxTdGF0ZXMiLCJfcmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzIiwicmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzIiwiYUNvbnRyb2xTdGF0ZUhhbmRsZXJzIiwibUNvbnRyb2xTdGF0ZUhhbmRsZXIiLCJFcnJvciIsImNhbGwiLCJhU3RhdGVzIiwib0ZpbmFsU3RhdGUiLCJhcHBseUluaXRpYWxTdGF0ZU9ubHkiLCJvTmF2UGFyYW1ldGVyIiwiX2dldEluaXRpYWxTdGF0ZUFwcGxpZWQiLCJvbkJlZm9yZVN0YXRlQXBwbGllZCIsImhhc1ZhcmlhbnRNYW5hZ2VtZW50Iiwic29ydGVkQWRhcHRTdGF0ZUNvbnRyb2xzIiwibW9kaWZpZWRDb250cm9scyIsImlzVmFyaWFudE1hbmFnZW1lbnRDb250cm9sIiwic0tleSIsIm5hdmlnYXRpb25UeXBlIiwiaUFwcFN0YXRlIiwiYXBwbHlBZGRpdGlvbmFsU3RhdGVzIiwiYXBwbHlOYXZpZ2F0aW9uUGFyYW1ldGVycyIsIl9hcHBseU5hdmlnYXRpb25QYXJhbWV0ZXJzVG9GaWx0ZXJiYXIiLCJvbkFmdGVyU3RhdGVBcHBsaWVkIiwiX3NldEluaXRpYWxTdGF0ZUFwcGxpZWQiLCJzVmFyaWFudElkIiwiYVZhcmlhbnRzIiwiZ2V0VmFyaWFudHMiLCJiSXNDb250cm9sU3RhdGVWYXJpYW50QXZhaWxhYmxlIiwib1ZhcmlhbnQiLCJwSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmUiLCJhUHJvbWlzZXMiLCJfb05hdlBhcmFtZXRlciIsIl9hUHJvbWlzZXMiLCJnZXRJbnRlcmZhY2UiLCJvUGF5bG9hZCIsInZhcmlhbnRNYW5hZ2VkQ29udHJvbHMiLCJmbkV2ZW50IiwiX3VwZGF0ZUluaXRpYWxTdGF0ZXNPblZhcmlhbnRDaGFuZ2UiLCJhdHRhY2hTYXZlIiwiYXR0YWNoU2VsZWN0Iiwidm1Bc3NvY2lhdGVkQ29udHJvbHNUb1Jlc2V0IiwiY29udHJvbEtleSIsInZtQXNzb2NpYXRlZGNvbnRyb2xLZXkiLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJWaWV3U3RhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgbWVyZ2VPYmplY3RzIGZyb20gXCJzYXAvYmFzZS91dGlsL21lcmdlXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXh0ZW5zaWJsZSwgZmluYWxFeHRlbnNpb24sIHByaXZhdGVFeHRlbnNpb24sIHB1YmxpY0V4dGVuc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEtlZXBBbGl2ZUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9LZWVwQWxpdmVIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgTmF2TGlicmFyeSBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgTWFuYWdlZE9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IHR5cGUgQmFzZU9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvT2JqZWN0XCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgQ29udHJvbFZhcmlhbnRBcHBseUFQSSBmcm9tIFwic2FwL3VpL2ZsL2FwcGx5L2FwaS9Db250cm9sVmFyaWFudEFwcGx5QVBJXCI7XG5pbXBvcnQgVmFyaWFudE1hbmFnZW1lbnQgZnJvbSBcInNhcC91aS9mbC92YXJpYW50cy9WYXJpYW50TWFuYWdlbWVudFwiO1xuLy8gaW1wb3J0IENoYXJ0IGZyb20gXCJzYXAvdWkvbWRjL0NoYXJ0XCI7XG5pbXBvcnQgdHlwZSBGaWx0ZXJCYXIgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyXCI7XG5pbXBvcnQgdHlwZSBGaWx0ZXJCYXJCYXNlIGZyb20gXCJzYXAvdWkvbWRjL2ZpbHRlcmJhci9GaWx0ZXJCYXJCYXNlXCI7XG5pbXBvcnQgU3RhdGVVdGlsIGZyb20gXCJzYXAvdWkvbWRjL3AxM24vU3RhdGVVdGlsXCI7XG5pbXBvcnQgdHlwZSBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eUluZm8gfSBmcm9tIFwic2FwL3VpL21kYy91dGlsL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IE1ldGFNb2RlbE5hdlByb3BlcnR5IH0gZnJvbSBcInR5cGVzL21ldGFtb2RlbF90eXBlc1wiO1xuXG4vLyBhZGRpdGlvbmFsU3RhdGVzIGFyZSBzdG9yZWQgbmV4dCB0byBjb250cm9sIElEcywgc28gbmFtZSBjbGFzaCBhdm9pZGFuY2UgbmVlZGVkLiBGb3J0dW5hdGVseSBJRHMgaGF2ZSByZXN0cmljdGlvbnM6XG4vLyBcIkFsbG93ZWQgaXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIChjYXBpdGFsL2xvd2VyY2FzZSksIGRpZ2l0cywgdW5kZXJzY29yZXMsIGRhc2hlcywgcG9pbnRzIGFuZC9vciBjb2xvbnMuXCJcbi8vIFRoZXJlZm9yZSBhZGRpbmcgYSBzeW1ib2wgbGlrZSAjIG9yIEBcbmNvbnN0IEFERElUSU9OQUxfU1RBVEVTX0tFWSA9IFwiI2FkZGl0aW9uYWxTdGF0ZXNcIixcblx0TmF2VHlwZSA9IE5hdkxpYnJhcnkuTmF2VHlwZTtcblxuLyoqXG4gKiBEZWZpbml0aW9uIG9mIGEgY3VzdG9tIGFjdGlvbiB0byBiZSB1c2VkIGluc2lkZSB0aGUgdGFibGUgdG9vbGJhclxuICpcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5OYXZpZ2F0aW9uUGFyYW1ldGVyXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCB0eXBlIE5hdmlnYXRpb25QYXJhbWV0ZXIgPSB7XG5cdC8qKlxuXHQgKiAgVGhlIGFjdHVhbCBuYXZpZ2F0aW9uIHR5cGUuXG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHRuYXZpZ2F0aW9uVHlwZTogc3RyaW5nO1xuXHQvKipcblx0ICogVGhlIHNlbGVjdGlvblZhcmlhbnQgZnJvbSB0aGUgbmF2aWdhdGlvbi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0c2VsZWN0aW9uVmFyaWFudD86IG9iamVjdDtcblx0LyoqXG5cdCAqIFRoZSBzZWxlY3Rpb25WYXJpYW50IGRlZmF1bHRzIGZyb20gdGhlIG5hdmlnYXRpb25cblx0ICpcblx0ICogIEBwdWJsaWNcblx0ICovXG5cdHNlbGVjdGlvblZhcmlhbnREZWZhdWx0cz86IG9iamVjdDtcblx0LyoqXG5cdCAqIERlZmluZXMgd2hldGhlciB0aGUgc3RhbmRhcmQgdmFyaWFudCBtdXN0IGJlIHVzZWQgaW4gdmFyaWFudCBtYW5hZ2VtZW50XG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHRyZXF1aXJlc1N0YW5kYXJkVmFyaWFudD86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBDb250cm9sU3RhdGUgPVxuXHR8ICh7XG5cdFx0XHRpbml0aWFsU3RhdGU/OiB7XG5cdFx0XHRcdHN1cHBsZW1lbnRhcnlDb25maWc6IG9iamVjdCB8IHVuZGVmaW5lZDtcblx0XHRcdH07XG5cdFx0XHRmdWxsU3RhdGU/OiBvYmplY3Q7XG5cdCAgfSAmIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVxuXHR8IHVuZGVmaW5lZDtcblxuZXhwb3J0IHR5cGUgRmlsdGVyQmFyU3RhdGUgPSB7XG5cdGZpbHRlcj86IFJlY29yZDxzdHJpbmcsIEFycmF5PG9iamVjdD4+O1xufSAmIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBtZXRob2RzIHRvIHJldHJpZXZlICYgYXBwbHkgc3RhdGVzIGZvciB0aGUgZGlmZmVyZW50IGNvbnRyb2xzIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmNvbnN0IF9tQ29udHJvbFN0YXRlSGFuZGxlck1hcDogUmVjb3JkPHN0cmluZywgYW55PiA9IHtcblx0XCJzYXAudWkuZmwudmFyaWFudHMuVmFyaWFudE1hbmFnZW1lbnRcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob1ZNOiBWYXJpYW50TWFuYWdlbWVudCk6IHsgdmFyaWFudElkOiBzdHJpbmcgfCBudWxsIH0ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dmFyaWFudElkOiBvVk0uZ2V0Q3VycmVudFZhcmlhbnRLZXkoKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGFwcGx5OiBhc3luYyBmdW5jdGlvbiAob1ZNOiBWYXJpYW50TWFuYWdlbWVudCwgY29udHJvbFN0YXRlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKGNvbnRyb2xTdGF0ZSAmJiBjb250cm9sU3RhdGUudmFyaWFudElkICE9PSB1bmRlZmluZWQgJiYgY29udHJvbFN0YXRlLnZhcmlhbnRJZCAhPT0gb1ZNLmdldEN1cnJlbnRWYXJpYW50S2V5KCkpIHtcblx0XHRcdFx0XHRjb25zdCBpc1ZhcmlhbnRJZEF2YWlsYWJsZSA9IHRoaXMuX2NoZWNrSWZWYXJpYW50SWRJc0F2YWlsYWJsZShvVk0sIGNvbnRyb2xTdGF0ZS52YXJpYW50SWQpO1xuXHRcdFx0XHRcdGxldCBzVmFyaWFudFJlZmVyZW5jZTtcblx0XHRcdFx0XHRpZiAoaXNWYXJpYW50SWRBdmFpbGFibGUpIHtcblx0XHRcdFx0XHRcdHNWYXJpYW50UmVmZXJlbmNlID0gY29udHJvbFN0YXRlLnZhcmlhbnRJZDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c1ZhcmlhbnRSZWZlcmVuY2UgPSBvVk0uZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCk7XG5cdFx0XHRcdFx0XHR0aGlzLmNvbnRyb2xzVmFyaWFudElkVW5hdmFpbGFibGUucHVzaCguLi5vVk0uZ2V0Rm9yKCkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0YXdhaXQgQ29udHJvbFZhcmlhbnRBcHBseUFQSS5hY3RpdmF0ZVZhcmlhbnQoe1xuXHRcdFx0XHRcdFx0XHRlbGVtZW50OiBvVk0sXG5cdFx0XHRcdFx0XHRcdHZhcmlhbnRSZWZlcmVuY2U6IHNWYXJpYW50UmVmZXJlbmNlIGFzIHN0cmluZ1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLl9zZXRJbml0aWFsU3RhdGVzRm9yRGVsdGFDb21wdXRlKG9WTSk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0XHRcdFx0dGhpcy5pbnZhbGlkYXRlSW5pdGlhbFN0YXRlRm9yQXBwbHkucHVzaCguLi5vVk0uZ2V0Rm9yKCkpO1xuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5fc2V0SW5pdGlhbFN0YXRlc0ZvckRlbHRhQ29tcHV0ZShvVk0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLl9zZXRJbml0aWFsU3RhdGVzRm9yRGVsdGFDb21wdXRlKG9WTSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG5cdFx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAubS5JY29uVGFiQmFyXCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9UYWJCYXI6IGFueSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c2VsZWN0ZWRLZXk6IG9UYWJCYXIuZ2V0U2VsZWN0ZWRLZXkoKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGFwcGx5OiBmdW5jdGlvbiAob1RhYkJhcjogYW55LCBvQ29udHJvbFN0YXRlOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udHJvbFN0YXRlICYmIG9Db250cm9sU3RhdGUuc2VsZWN0ZWRLZXkpIHtcblx0XHRcdFx0Y29uc3Qgb1NlbGVjdGVkSXRlbSA9IG9UYWJCYXIuZ2V0SXRlbXMoKS5maW5kKGZ1bmN0aW9uIChvSXRlbTogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9JdGVtLmdldEtleSgpID09PSBvQ29udHJvbFN0YXRlLnNlbGVjdGVkS2V5O1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKG9TZWxlY3RlZEl0ZW0pIHtcblx0XHRcdFx0XHRvVGFiQmFyLnNldFNlbGVjdGVkSXRlbShvU2VsZWN0ZWRJdGVtKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAudWkubWRjLkZpbHRlckJhclwiOiB7XG5cdFx0cmV0cmlldmU6IGFzeW5jIGZ1bmN0aW9uIChmaWx0ZXJCYXI6IEZpbHRlckJhckJhc2UpIHtcblx0XHRcdGNvbnN0IGNvbnRyb2xTdGF0ZUtleSA9IHRoaXMuZ2V0U3RhdGVLZXkoZmlsdGVyQmFyKTtcblx0XHRcdGNvbnN0IGZpbHRlckJhclN0YXRlID0gYXdhaXQgU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZShmaWx0ZXJCYXIpO1xuXHRcdFx0Ly8gcmVtb3ZlIHNlbnNpdGl2ZSBvciB2aWV3IHN0YXRlIGlycmVsZXZhbnQgZmllbGRzXG5cdFx0XHRjb25zdCBwcm9wZXJ0aWVzSW5mbyA9IGZpbHRlckJhci5nZXRQcm9wZXJ0eUluZm9TZXQoKTtcblx0XHRcdGNvbnN0IGZpbHRlciA9IGZpbHRlckJhclN0YXRlLmZpbHRlciB8fCB7fTtcblx0XHRcdHByb3BlcnRpZXNJbmZvXG5cdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKFByb3BlcnR5SW5mbzogUHJvcGVydHlJbmZvKSB7XG5cdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdE9iamVjdC5rZXlzKGZpbHRlcikubGVuZ3RoID4gMCAmJlxuXHRcdFx0XHRcdFx0UHJvcGVydHlJbmZvLnBhdGggJiZcblx0XHRcdFx0XHRcdGZpbHRlcltQcm9wZXJ0eUluZm8ucGF0aF0gJiZcblx0XHRcdFx0XHRcdChQcm9wZXJ0eUluZm8ucmVtb3ZlRnJvbUFwcFN0YXRlIHx8IGZpbHRlcltQcm9wZXJ0eUluZm8ucGF0aF0ubGVuZ3RoID09PSAwKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChQcm9wZXJ0eUluZm86IFByb3BlcnR5SW5mbykge1xuXHRcdFx0XHRcdGlmIChQcm9wZXJ0eUluZm8ucGF0aCkge1xuXHRcdFx0XHRcdFx0ZGVsZXRlIGZpbHRlcltQcm9wZXJ0eUluZm8ucGF0aF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdHJldHVybiB0aGlzLl9nZXRDb250cm9sU3RhdGUoY29udHJvbFN0YXRlS2V5LCBmaWx0ZXJCYXJTdGF0ZSk7XG5cdFx0fSxcblx0XHRhcHBseTogYXN5bmMgZnVuY3Rpb24gKGZpbHRlckJhcjogRmlsdGVyQmFyLCBjb250cm9sU3RhdGU6IENvbnRyb2xTdGF0ZSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKGNvbnRyb2xTdGF0ZSkge1xuXHRcdFx0XHRcdGNvbnN0IGlzSW5pdGlhbFN0YXRlQXBwbGljYWJsZSA9XG5cdFx0XHRcdFx0XHRjb250cm9sU3RhdGU/LmluaXRpYWxTdGF0ZSAmJlxuXHRcdFx0XHRcdFx0dGhpcy5pbnZhbGlkYXRlSW5pdGlhbFN0YXRlRm9yQXBwbHkuaW5kZXhPZihmaWx0ZXJCYXIuZ2V0SWQoKSkgPT09IC0xICYmXG5cdFx0XHRcdFx0XHR0aGlzLmNvbnRyb2xzVmFyaWFudElkVW5hdmFpbGFibGUuaW5kZXhPZihmaWx0ZXJCYXIuZ2V0SWQoKSkgPT09IC0xO1xuXG5cdFx0XHRcdFx0aWYgKGlzSW5pdGlhbFN0YXRlQXBwbGljYWJsZSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgZGlmZlN0YXRlOiBvYmplY3QgPSBhd2FpdCBTdGF0ZVV0aWwuZGlmZlN0YXRlKFxuXHRcdFx0XHRcdFx0XHRmaWx0ZXJCYXIsXG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xTdGF0ZS5pbml0aWFsU3RhdGUgYXMgb2JqZWN0LFxuXHRcdFx0XHRcdFx0XHRjb250cm9sU3RhdGUuZnVsbFN0YXRlIGFzIG9iamVjdFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHJldHVybiBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKGZpbHRlckJhciwgZGlmZlN0YXRlKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUoZmlsdGVyQmFyLCBjb250cm9sU3RhdGU/LmZ1bGxTdGF0ZSA/PyBjb250cm9sU3RhdGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcblx0XHRcdFx0TG9nLmVycm9yKGVycm9yIGFzIHN0cmluZyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcInNhcC51aS5tZGMuVGFibGVcIjoge1xuXHRcdHJldHJpZXZlOiBhc3luYyBmdW5jdGlvbiAodGFibGU6IFRhYmxlKSB7XG5cdFx0XHRjb25zdCBjb250cm9sU3RhdGVLZXkgPSB0aGlzLmdldFN0YXRlS2V5KHRhYmxlKTtcblx0XHRcdGNvbnN0IHRhYmxlU3RhdGUgPSBhd2FpdCBTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKHRhYmxlKTtcblx0XHRcdHJldHVybiB0aGlzLl9nZXRDb250cm9sU3RhdGUoY29udHJvbFN0YXRlS2V5LCB0YWJsZVN0YXRlKTtcblx0XHR9LFxuXHRcdGFwcGx5OiBhc3luYyBmdW5jdGlvbiAodGFibGU6IFRhYmxlLCBjb250cm9sU3RhdGU6IENvbnRyb2xTdGF0ZSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKGNvbnRyb2xTdGF0ZSkge1xuXHRcdFx0XHRcdC8vIEV4dHJhIGNvbmRpdGlvbiBhZGRlZCB0byBhcHBseSB0aGUgZGlmZiBzdGF0ZSBsb2dpYyBmb3IgbWRjIGNvbnRyb2xcblx0XHRcdFx0XHRjb25zdCBpc0luaXRpYWxTdGF0ZUFwcGxpY2FibGUgPVxuXHRcdFx0XHRcdFx0Y29udHJvbFN0YXRlPy5pbml0aWFsU3RhdGUgJiZcblx0XHRcdFx0XHRcdHRoaXMuaW52YWxpZGF0ZUluaXRpYWxTdGF0ZUZvckFwcGx5LmluZGV4T2YodGFibGUuZ2V0SWQoKSkgPT09IC0xICYmXG5cdFx0XHRcdFx0XHR0aGlzLmNvbnRyb2xzVmFyaWFudElkVW5hdmFpbGFibGUuaW5kZXhPZih0YWJsZS5nZXRJZCgpKSA9PT0gLTE7XG5cblx0XHRcdFx0XHRpZiAoaXNJbml0aWFsU3RhdGVBcHBsaWNhYmxlKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29udHJvbFN0YXRlLmluaXRpYWxTdGF0ZSAmJiAhY29udHJvbFN0YXRlLmluaXRpYWxTdGF0ZT8uc3VwcGxlbWVudGFyeUNvbmZpZykge1xuXHRcdFx0XHRcdFx0XHRjb250cm9sU3RhdGUuaW5pdGlhbFN0YXRlLnN1cHBsZW1lbnRhcnlDb25maWcgPSB7fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNvbnN0IG9EaWZmU3RhdGUgPSBhd2FpdCBTdGF0ZVV0aWwuZGlmZlN0YXRlKFxuXHRcdFx0XHRcdFx0XHR0YWJsZSxcblx0XHRcdFx0XHRcdFx0Y29udHJvbFN0YXRlLmluaXRpYWxTdGF0ZSBhcyBvYmplY3QsXG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xTdGF0ZS5mdWxsU3RhdGUgYXMgb2JqZWN0XG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUodGFibGUsIG9EaWZmU3RhdGUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAoIWNvbnRyb2xTdGF0ZS5zdXBwbGVtZW50YXJ5Q29uZmlnKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xTdGF0ZS5zdXBwbGVtZW50YXJ5Q29uZmlnID0ge307XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gU3RhdGVVdGlsLmFwcGx5RXh0ZXJuYWxTdGF0ZSh0YWJsZSwgY29udHJvbFN0YXRlPy5mdWxsU3RhdGUgPz8gY29udHJvbFN0YXRlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cmVmcmVzaEJpbmRpbmc6IGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdFx0Y29uc3Qgb1RhYmxlQmluZGluZyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdFx0XHRpZiAob1RhYmxlQmluZGluZykge1xuXHRcdFx0XHRjb25zdCBvUm9vdEJpbmRpbmcgPSBvVGFibGVCaW5kaW5nLmdldFJvb3RCaW5kaW5nKCk7XG5cdFx0XHRcdGlmIChvUm9vdEJpbmRpbmcgPT09IG9UYWJsZUJpbmRpbmcpIHtcblx0XHRcdFx0XHQvLyBhYnNvbHV0ZSBiaW5kaW5nXG5cdFx0XHRcdFx0b1RhYmxlQmluZGluZy5yZWZyZXNoKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gcmVsYXRpdmUgYmluZGluZ1xuXHRcdFx0XHRcdGNvbnN0IG9IZWFkZXJDb250ZXh0ID0gb1RhYmxlQmluZGluZy5nZXRIZWFkZXJDb250ZXh0KCk7XG5cdFx0XHRcdFx0Y29uc3Qgc0dyb3VwSWQgPSBvVGFibGVCaW5kaW5nLmdldEdyb3VwSWQoKTtcblxuXHRcdFx0XHRcdGlmIChvSGVhZGVyQ29udGV4dCkge1xuXHRcdFx0XHRcdFx0b0hlYWRlckNvbnRleHQucmVxdWVzdFNpZGVFZmZlY3RzKFt7ICROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBcIlwiIH1dLCBzR3JvdXBJZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRMb2cuaW5mbyhgVGFibGU6ICR7b1RhYmxlLmdldElkKCl9IHdhcyBub3QgcmVmcmVzaGVkLiBObyBiaW5kaW5nIGZvdW5kIWApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAudWkubWRjLkNoYXJ0XCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9DaGFydDogYW55KSB7XG5cdFx0XHRyZXR1cm4gU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZShvQ2hhcnQpO1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvQ2hhcnQ6IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55KSB7XG5cdFx0XHRpZiAob0NvbnRyb2xTdGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gU3RhdGVVdGlsLmFwcGx5RXh0ZXJuYWxTdGF0ZShvQ2hhcnQsIG9Db250cm9sU3RhdGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBUT0RPOiB1bmNvbW1lbnQgYWZ0ZXIgbWRjIGZpeCBpcyBtZXJnZWRcblx0XHQvKiByZXRyaWV2ZTogYXN5bmMgZnVuY3Rpb24gKGNoYXJ0OiBDaGFydCkge1xuXHRcdFx0Y29uc3QgY29udHJvbFN0YXRlS2V5ID0gdGhpcy5nZXRTdGF0ZUtleShjaGFydCk7XG5cdFx0XHRjb25zdCBjaGFydFN0YXRlID0gYXdhaXQgU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZShjaGFydCk7XG5cblx0XHRcdHJldHVybiB0aGlzLl9nZXRDb250cm9sU3RhdGUoY29udHJvbFN0YXRlS2V5LCBjaGFydFN0YXRlKTtcblx0XHR9LFxuXHRcdGFwcGx5OiBhc3luYyBmdW5jdGlvbiAoY2hhcnQ6IENoYXJ0LCBjb250cm9sU3RhdGU6IENvbnRyb2xTdGF0ZSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKGNvbnRyb2xTdGF0ZSkge1xuXHRcdFx0XHRcdC8vIEV4dHJhIGNvbmRpdGlvbiBhZGRlZCB0byBhcHBseSB0aGUgZGlmZiBzdGF0ZSBsb2dpYyBmb3IgbWRjIGNvbnRyb2xcblx0XHRcdFx0XHRjb25zdCBpc0luaXRpYWxTdGF0ZUFwcGxpY2FibGUgPSBjb250cm9sU3RhdGU/LmluaXRpYWxTdGF0ZSAmJiB0aGlzLmludmFsaWRhdGVJbml0aWFsU3RhdGVGb3JBcHBseS5pbmRleE9mKGNoYXJ0LmdldElkKCkpID09PSAtMSAmJiB0aGlzLmNvbnRyb2xzVmFyaWFudElkVW5hdmFpbGFibGUuaW5kZXhPZihjaGFydC5nZXRJZCgpKSA9PT0gLTE7XG5cblx0XHRcdFx0XHRpZiAoaXNJbml0aWFsU3RhdGVBcHBsaWNhYmxlKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBkaWZmU3RhdGUgPSBhd2FpdCBTdGF0ZVV0aWwuZGlmZlN0YXRlKFxuXHRcdFx0XHRcdFx0XHRjaGFydCxcblx0XHRcdFx0XHRcdFx0Y29udHJvbFN0YXRlLmluaXRpYWxTdGF0ZSBhcyBvYmplY3QsXG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xTdGF0ZS5mdWxsU3RhdGUgYXMgb2JqZWN0XG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGF3YWl0IFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUoY2hhcnQsIGRpZmZTdGF0ZSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBhd2FpdCBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKGNoYXJ0LCBjb250cm9sU3RhdGU/LmZ1bGxTdGF0ZSA/PyBjb250cm9sU3RhdGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0TG9nLmVycm9yKGVycm9yIGFzIHN0cmluZyk7XG5cdFx0XHR9XG5cdFx0fSAqL1xuXHR9LFxuXHRcInNhcC51eGFwLk9iamVjdFBhZ2VMYXlvdXRcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob09QTGF5b3V0OiBhbnkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHNlbGVjdGVkU2VjdGlvbjogb09QTGF5b3V0LmdldFNlbGVjdGVkU2VjdGlvbigpXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvT1BMYXlvdXQ6IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55KSB7XG5cdFx0XHRpZiAob0NvbnRyb2xTdGF0ZSkge1xuXHRcdFx0XHRvT1BMYXlvdXQuc2V0U2VsZWN0ZWRTZWN0aW9uKG9Db250cm9sU3RhdGUuc2VsZWN0ZWRTZWN0aW9uKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHJlZnJlc2hCaW5kaW5nOiBmdW5jdGlvbiAob09QTGF5b3V0OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IG9PUExheW91dC5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0Y29uc3Qgb0JpbmRpbmcgPSBvQmluZGluZ0NvbnRleHQgJiYgb0JpbmRpbmdDb250ZXh0LmdldEJpbmRpbmcoKTtcblx0XHRcdGlmIChvQmluZGluZykge1xuXHRcdFx0XHRjb25zdCBzTWV0YVBhdGggPSBNb2RlbEhlbHBlci5nZXRNZXRhUGF0aEZvckNvbnRleHQob0JpbmRpbmdDb250ZXh0KTtcblx0XHRcdFx0Y29uc3Qgc1N0cmF0ZWd5ID0gS2VlcEFsaXZlSGVscGVyLmdldENvbnRyb2xSZWZyZXNoU3RyYXRlZ3lGb3JDb250ZXh0UGF0aChvT1BMYXlvdXQsIHNNZXRhUGF0aCk7XG5cdFx0XHRcdGlmIChzU3RyYXRlZ3kgPT09IFwic2VsZlwiKSB7XG5cdFx0XHRcdFx0Ly8gUmVmcmVzaCBtYWluIGNvbnRleHQgYW5kIDEtMSBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgb3IgT1Bcblx0XHRcdFx0XHRjb25zdCBvTW9kZWwgPSBvQmluZGluZ0NvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRcdFx0XHRvTmF2aWdhdGlvblByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIE1ldGFNb2RlbE5hdlByb3BlcnR5PiA9XG5cdFx0XHRcdFx0XHRcdChDb21tb25VdGlscy5nZXRDb250ZXh0UGF0aFByb3BlcnRpZXMob01ldGFNb2RlbCwgc01ldGFQYXRoLCB7XG5cdFx0XHRcdFx0XHRcdFx0JGtpbmQ6IFwiTmF2aWdhdGlvblByb3BlcnR5XCJcblx0XHRcdFx0XHRcdFx0fSkgYXMgUmVjb3JkPHN0cmluZywgTWV0YU1vZGVsTmF2UHJvcGVydHk+KSB8fCB7fSxcblx0XHRcdFx0XHRcdGFOYXZQcm9wZXJ0aWVzVG9SZXF1ZXN0ID0gT2JqZWN0LmtleXMob05hdmlnYXRpb25Qcm9wZXJ0aWVzKS5yZWR1Y2UoZnVuY3Rpb24gKGFQcmV2OiBhbnlbXSwgc05hdlByb3A6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0XHRpZiAob05hdmlnYXRpb25Qcm9wZXJ0aWVzW3NOYXZQcm9wXS4kaXNDb2xsZWN0aW9uICE9PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0YVByZXYucHVzaCh7ICROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBzTmF2UHJvcCB9KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYVByZXY7XG5cdFx0XHRcdFx0XHR9LCBbXSksXG5cdFx0XHRcdFx0XHRhUHJvcGVydGllcyA9IFt7ICRQcm9wZXJ0eVBhdGg6IFwiKlwiIH1dLFxuXHRcdFx0XHRcdFx0c0dyb3VwSWQgPSBvQmluZGluZy5nZXRHcm91cElkKCk7XG5cblx0XHRcdFx0XHRvQmluZGluZ0NvbnRleHQucmVxdWVzdFNpZGVFZmZlY3RzKGFQcm9wZXJ0aWVzLmNvbmNhdChhTmF2UHJvcGVydGllc1RvUmVxdWVzdCksIHNHcm91cElkKTtcblx0XHRcdFx0fSBlbHNlIGlmIChzU3RyYXRlZ3kgPT09IFwiaW5jbHVkaW5nRGVwZW5kZW50c1wiKSB7XG5cdFx0XHRcdFx0Ly8gQ29tcGxldGUgcmVmcmVzaFxuXHRcdFx0XHRcdG9CaW5kaW5nLnJlZnJlc2goKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0TG9nLmluZm8oYE9iamVjdFBhZ2U6ICR7b09QTGF5b3V0LmdldElkKCl9IHdhcyBub3QgcmVmcmVzaGVkLiBObyBiaW5kaW5nIGZvdW5kIWApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAuZmUubWFjcm9zLnRhYmxlLlF1aWNrRmlsdGVyQ29udGFpbmVyXCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9RdWlja0ZpbHRlcjogYW55KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRzZWxlY3RlZEtleTogb1F1aWNrRmlsdGVyLmdldFNlbGVjdG9yS2V5KClcblx0XHRcdH07XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKG9RdWlja0ZpbHRlcjogYW55LCBvQ29udHJvbFN0YXRlOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udHJvbFN0YXRlPy5zZWxlY3RlZEtleSkge1xuXHRcdFx0XHRvUXVpY2tGaWx0ZXIuc2V0U2VsZWN0b3JLZXkob0NvbnRyb2xTdGF0ZS5zZWxlY3RlZEtleSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcInNhcC5tLlNlZ21lbnRlZEJ1dHRvblwiOiB7XG5cdFx0cmV0cmlldmU6IGZ1bmN0aW9uIChvU2VnbWVudGVkQnV0dG9uOiBhbnkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHNlbGVjdGVkS2V5OiBvU2VnbWVudGVkQnV0dG9uLmdldFNlbGVjdGVkS2V5KClcblx0XHRcdH07XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKG9TZWdtZW50ZWRCdXR0b246IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55KSB7XG5cdFx0XHRpZiAob0NvbnRyb2xTdGF0ZT8uc2VsZWN0ZWRLZXkpIHtcblx0XHRcdFx0b1NlZ21lbnRlZEJ1dHRvbi5zZXRTZWxlY3RlZEtleShvQ29udHJvbFN0YXRlLnNlbGVjdGVkS2V5KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFwic2FwLm0uU2VsZWN0XCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9TZWxlY3Q6IGFueSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c2VsZWN0ZWRLZXk6IG9TZWxlY3QuZ2V0U2VsZWN0ZWRLZXkoKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGFwcGx5OiBmdW5jdGlvbiAob1NlbGVjdDogYW55LCBvQ29udHJvbFN0YXRlOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udHJvbFN0YXRlPy5zZWxlY3RlZEtleSkge1xuXHRcdFx0XHRvU2VsZWN0LnNldFNlbGVjdGVkS2V5KG9Db250cm9sU3RhdGUuc2VsZWN0ZWRLZXkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAuZi5EeW5hbWljUGFnZVwiOiB7XG5cdFx0cmV0cmlldmU6IGZ1bmN0aW9uIChvRHluYW1pY1BhZ2U6IGFueSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aGVhZGVyRXhwYW5kZWQ6IG9EeW5hbWljUGFnZS5nZXRIZWFkZXJFeHBhbmRlZCgpXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvRHluYW1pY1BhZ2U6IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55KSB7XG5cdFx0XHRpZiAob0NvbnRyb2xTdGF0ZSkge1xuXHRcdFx0XHRvRHluYW1pY1BhZ2Uuc2V0SGVhZGVyRXhwYW5kZWQob0NvbnRyb2xTdGF0ZS5oZWFkZXJFeHBhbmRlZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcInNhcC51aS5jb3JlLm12Yy5WaWV3XCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9WaWV3OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpO1xuXHRcdFx0aWYgKG9Db250cm9sbGVyICYmIG9Db250cm9sbGVyLnZpZXdTdGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbnRyb2xsZXIudmlld1N0YXRlLnJldHJpZXZlVmlld1N0YXRlKG9Db250cm9sbGVyLnZpZXdTdGF0ZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4ge307XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKG9WaWV3OiBhbnksIG9Db250cm9sU3RhdGU6IGFueSwgb05hdlBhcmFtZXRlcnM6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCk7XG5cdFx0XHRpZiAob0NvbnRyb2xsZXIgJiYgb0NvbnRyb2xsZXIudmlld1N0YXRlKSB7XG5cdFx0XHRcdHJldHVybiBvQ29udHJvbGxlci52aWV3U3RhdGUuYXBwbHlWaWV3U3RhdGUob0NvbnRyb2xTdGF0ZSwgb05hdlBhcmFtZXRlcnMpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cmVmcmVzaEJpbmRpbmc6IGZ1bmN0aW9uIChvVmlldzogYW55KSB7XG5cdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKTtcblx0XHRcdGlmIChvQ29udHJvbGxlciAmJiBvQ29udHJvbGxlci52aWV3U3RhdGUpIHtcblx0XHRcdFx0cmV0dXJuIG9Db250cm9sbGVyLnZpZXdTdGF0ZS5yZWZyZXNoVmlld0JpbmRpbmdzKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcInNhcC51aS5jb3JlLkNvbXBvbmVudENvbnRhaW5lclwiOiB7XG5cdFx0cmV0cmlldmU6IGZ1bmN0aW9uIChvQ29tcG9uZW50Q29udGFpbmVyOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9Db21wb25lbnQgPSBvQ29tcG9uZW50Q29udGFpbmVyLmdldENvbXBvbmVudEluc3RhbmNlKCk7XG5cdFx0XHRpZiAob0NvbXBvbmVudCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5yZXRyaWV2ZUNvbnRyb2xTdGF0ZShvQ29tcG9uZW50LmdldFJvb3RDb250cm9sKCkpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHt9O1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvQ29tcG9uZW50Q29udGFpbmVyOiBhbnksIG9Db250cm9sU3RhdGU6IGFueSwgb05hdlBhcmFtZXRlcnM6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db21wb25lbnRDb250YWluZXIuZ2V0Q29tcG9uZW50SW5zdGFuY2UoKTtcblx0XHRcdGlmIChvQ29tcG9uZW50KSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmFwcGx5Q29udHJvbFN0YXRlKG9Db21wb25lbnQuZ2V0Um9vdENvbnRyb2woKSwgb0NvbnRyb2xTdGF0ZSwgb05hdlBhcmFtZXRlcnMpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcbi8qKlxuICogQSBjb250cm9sbGVyIGV4dGVuc2lvbiBvZmZlcmluZyBob29rcyBmb3Igc3RhdGUgaGFuZGxpbmdcbiAqXG4gKiBJZiB5b3UgbmVlZCB0byBtYWludGFpbiBhIHNwZWNpZmljIHN0YXRlIGZvciB5b3VyIGFwcGxpY2F0aW9uLCB5b3UgY2FuIHVzZSB0aGUgY29udHJvbGxlciBleHRlbnNpb24uXG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICogQHNpbmNlIDEuODUuMFxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGVcIilcbmNsYXNzIFZpZXdTdGF0ZSBleHRlbmRzIENvbnRyb2xsZXJFeHRlbnNpb24ge1xuXHRwcml2YXRlIF9pUmV0cmlldmluZ1N0YXRlQ291bnRlcjogbnVtYmVyO1xuXG5cdHByaXZhdGUgX3BJbml0aWFsU3RhdGVBcHBsaWVkOiBQcm9taXNlPHVua25vd24+O1xuXG5cdHByaXZhdGUgX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZT86IEZ1bmN0aW9uO1xuXG5cdHByaXZhdGUgYmFzZSE6IFBhZ2VDb250cm9sbGVyO1xuXG5cdGluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuXG5cdGNvbnRyb2xzVmFyaWFudElkVW5hdmFpbGFibGU6IHN0cmluZ1tdID0gW107XG5cblx0aW52YWxpZGF0ZUluaXRpYWxTdGF0ZUZvckFwcGx5OiBzdHJpbmdbXSA9IFtdO1xuXG5cdHZpZXdTdGF0ZUNvbnRyb2xzOiBNYW5hZ2VkT2JqZWN0W10gPSBbXTtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3IuXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuX2lSZXRyaWV2aW5nU3RhdGVDb3VudGVyID0gMDtcblx0XHR0aGlzLl9wSW5pdGlhbFN0YXRlQXBwbGllZCA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHR0aGlzLl9wSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmUgPSByZXNvbHZlO1xuXHRcdH0pO1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIHJlZnJlc2hWaWV3QmluZGluZ3MoKSB7XG5cdFx0Y29uc3QgYUNvbnRyb2xzID0gYXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyh0aGlzLmJhc2Uudmlld1N0YXRlLmFkYXB0QmluZGluZ1JlZnJlc2hDb250cm9scyk7XG5cdFx0bGV0IG9Qcm9taXNlQ2hhaW4gPSBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRhQ29udHJvbHNcblx0XHRcdC5maWx0ZXIoKG9Db250cm9sOiBhbnkpID0+IHtcblx0XHRcdFx0cmV0dXJuIG9Db250cm9sICYmIG9Db250cm9sLmlzQSAmJiBvQ29udHJvbC5pc0EoXCJzYXAudWkuYmFzZS5NYW5hZ2VkT2JqZWN0XCIpO1xuXHRcdFx0fSlcblx0XHRcdC5mb3JFYWNoKChvQ29udHJvbDogYW55KSA9PiB7XG5cdFx0XHRcdG9Qcm9taXNlQ2hhaW4gPSBvUHJvbWlzZUNoYWluLnRoZW4odGhpcy5yZWZyZXNoQ29udHJvbEJpbmRpbmcuYmluZCh0aGlzLCBvQ29udHJvbCkpO1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuIG9Qcm9taXNlQ2hhaW47XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBzaG91bGQgYWRkIGFsbCBjb250cm9scyByZWxldmFudCBmb3IgcmVmcmVzaGluZyB0byB0aGUgcHJvdmlkZWQgY29udHJvbCBhcnJheS5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIGFDb2xsZWN0ZWRDb250cm9scyBUaGUgY29sbGVjdGVkIGNvbnRyb2xzXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjYWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRhZGFwdEJpbmRpbmdSZWZyZXNoQ29udHJvbHMoYUNvbGxlY3RlZENvbnRyb2xzOiBNYW5hZ2VkT2JqZWN0W10pIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZW5cblx0fVxuXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cmVmcmVzaENvbnRyb2xCaW5kaW5nKG9Db250cm9sOiBhbnkpIHtcblx0XHRjb25zdCBvQ29udHJvbFJlZnJlc2hCaW5kaW5nSGFuZGxlciA9IHRoaXMuZ2V0Q29udHJvbFJlZnJlc2hCaW5kaW5nSGFuZGxlcihvQ29udHJvbCk7XG5cdFx0bGV0IG9Qcm9taXNlQ2hhaW4gPSBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRpZiAodHlwZW9mIG9Db250cm9sUmVmcmVzaEJpbmRpbmdIYW5kbGVyLnJlZnJlc2hCaW5kaW5nICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdExvZy5pbmZvKGByZWZyZXNoQmluZGluZyBoYW5kbGVyIGZvciBjb250cm9sOiAke29Db250cm9sLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpfSBpcyBub3QgcHJvdmlkZWRgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1Byb21pc2VDaGFpbiA9IG9Qcm9taXNlQ2hhaW4udGhlbihvQ29udHJvbFJlZnJlc2hCaW5kaW5nSGFuZGxlci5yZWZyZXNoQmluZGluZy5iaW5kKHRoaXMsIG9Db250cm9sKSk7XG5cdFx0fVxuXHRcdHJldHVybiBvUHJvbWlzZUNoYWluO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBtYXAgb2YgPGNvZGU+cmVmcmVzaEJpbmRpbmc8L2NvZGU+IGZ1bmN0aW9uIGZvciBhIGNlcnRhaW4gY29udHJvbC5cblx0ICpcblx0ICogQHBhcmFtIHtzYXAudWkuYmFzZS5NYW5hZ2VkT2JqZWN0fSBvQ29udHJvbCBUaGUgY29udHJvbCB0byBnZXQgc3RhdGUgaGFuZGxlciBmb3Jcblx0ICogQHJldHVybnMge29iamVjdH0gQSBwbGFpbiBvYmplY3Qgd2l0aCBvbmUgZnVuY3Rpb246IDxjb2RlPnJlZnJlc2hCaW5kaW5nPC9jb2RlPlxuXHQgKi9cblxuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldENvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIob0NvbnRyb2w6IGFueSk6IGFueSB7XG5cdFx0Y29uc3Qgb1JlZnJlc2hCaW5kaW5nSGFuZGxlcjogYW55ID0ge307XG5cdFx0aWYgKG9Db250cm9sKSB7XG5cdFx0XHRmb3IgKGNvbnN0IHNUeXBlIGluIF9tQ29udHJvbFN0YXRlSGFuZGxlck1hcCkge1xuXHRcdFx0XHRpZiAob0NvbnRyb2wuaXNBKHNUeXBlKSkge1xuXHRcdFx0XHRcdC8vIHBhc3Mgb25seSB0aGUgcmVmcmVzaEJpbmRpbmcgaGFuZGxlciBpbiBhbiBvYmplY3Qgc28gdGhhdCA6XG5cdFx0XHRcdFx0Ly8gMS4gQXBwbGljYXRpb24gaGFzIGFjY2VzcyBvbmx5IHRvIHJlZnJlc2hCaW5kaW5nIGFuZCBub3QgYXBwbHkgYW5kIHJldGVyaXZlIGF0IHRoaXMgc3RhZ2Vcblx0XHRcdFx0XHQvLyAyLiBBcHBsaWNhdGlvbiBtb2RpZmljYXRpb25zIHRvIHRoZSBvYmplY3Qgd2lsbCBiZSByZWZsZWN0ZWQgaGVyZSAoYXMgd2UgcGFzcyBieSByZWZlcmVuY2UpXG5cdFx0XHRcdFx0b1JlZnJlc2hCaW5kaW5nSGFuZGxlcltcInJlZnJlc2hCaW5kaW5nXCJdID0gX21Db250cm9sU3RhdGVIYW5kbGVyTWFwW3NUeXBlXS5yZWZyZXNoQmluZGluZyB8fCB7fTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLmJhc2Uudmlld1N0YXRlLmFkYXB0QmluZGluZ1JlZnJlc2hIYW5kbGVyKG9Db250cm9sLCBvUmVmcmVzaEJpbmRpbmdIYW5kbGVyKTtcblx0XHRyZXR1cm4gb1JlZnJlc2hCaW5kaW5nSGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDdXN0b21pemUgdGhlIDxjb2RlPnJlZnJlc2hCaW5kaW5nPC9jb2RlPiBmdW5jdGlvbiBmb3IgYSBjZXJ0YWluIGNvbnRyb2wuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udHJvbCBUaGUgY29udHJvbCBmb3Igd2hpY2ggdGhlIHJlZnJlc2ggaGFuZGxlciBpcyBhZGFwdGVkLlxuXHQgKiBAcGFyYW0gb0NvbnRyb2xIYW5kbGVyIEEgcGxhaW4gb2JqZWN0IHdoaWNoIGNhbiBoYXZlIG9uZSBmdW5jdGlvbjogPGNvZGU+cmVmcmVzaEJpbmRpbmc8L2NvZGU+XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjYWRhcHRCaW5kaW5nUmVmcmVzaEhhbmRsZXJcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdGFkYXB0QmluZGluZ1JlZnJlc2hIYW5kbGVyKG9Db250cm9sOiBNYW5hZ2VkT2JqZWN0LCBvQ29udHJvbEhhbmRsZXI6IGFueVtdKSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGVuXG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gdGhlIGFwcGxpY2F0aW9uIGlzIHN1c3BlbmRlZCBkdWUgdG8ga2VlcC1hbGl2ZSBtb2RlLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI29uU3VzcGVuZFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uU3VzcGVuZCgpIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZW5cblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxsZWQgd2hlbiB0aGUgYXBwbGljYXRpb24gaXMgcmVzdG9yZWQgZHVlIHRvIGtlZXAtYWxpdmUgbW9kZS5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNvblJlc3RvcmVcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRvblJlc3RvcmUoKSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGVuXG5cdH1cblxuXHQvKipcblx0ICogRGVzdHJ1Y3RvciBtZXRob2QgZm9yIG9iamVjdHMuXG5cdCAqL1xuXHRkZXN0cm95KCkge1xuXHRcdGRlbGV0ZSB0aGlzLl9wSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmU7XG5cdFx0c3VwZXIuZGVzdHJveSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciBmdW5jdGlvbiB0byBlbmFibGUgbXVsdGkgb3ZlcnJpZGUuIEl0IGlzIGFkZGluZyBhbiBhZGRpdGlvbmFsIHBhcmFtZXRlciAoYXJyYXkpIHRvIHRoZSBwcm92aWRlZFxuXHQgKiBmdW5jdGlvbiAoYW5kIGl0cyBwYXJhbWV0ZXJzKSwgdGhhdCB3aWxsIGJlIGV2YWx1YXRlZCB2aWEgPGNvZGU+UHJvbWlzZS5hbGw8L2NvZGU+LlxuXHQgKlxuXHQgKiBAcGFyYW0gZm5DYWxsIFRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWRcblx0ICogQHBhcmFtIGFyZ3Ncblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRvIGJlIHJlc29sdmVkIHdpdGggdGhlIHJlc3VsdCBvZiBhbGwgb3ZlcnJpZGVzXG5cdCAqL1xuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGNvbGxlY3RSZXN1bHRzKGZuQ2FsbDogRnVuY3Rpb24sIC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0Y29uc3QgYVJlc3VsdHM6IGFueVtdID0gW107XG5cdFx0YXJncy5wdXNoKGFSZXN1bHRzKTtcblx0XHRmbkNhbGwuYXBwbHkodGhpcywgYXJncyk7XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFSZXN1bHRzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDdXN0b21pemUgdGhlIDxjb2RlPnJldHJpZXZlPC9jb2RlPiBhbmQgPGNvZGU+YXBwbHk8L2NvZGU+IGZ1bmN0aW9ucyBmb3IgYSBjZXJ0YWluIGNvbnRyb2wuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udHJvbCBUaGUgY29udHJvbCB0byBnZXQgc3RhdGUgaGFuZGxlciBmb3Jcblx0ICogQHBhcmFtIGFDb250cm9sSGFuZGxlciBBIGxpc3Qgb2YgcGxhaW4gb2JqZWN0cyB3aXRoIHR3byBmdW5jdGlvbnM6IDxjb2RlPnJldHJpZXZlPC9jb2RlPiBhbmQgPGNvZGU+YXBwbHk8L2NvZGU+XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjYWRhcHRDb250cm9sU3RhdGVIYW5kbGVyXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRhZGFwdENvbnRyb2xTdGF0ZUhhbmRsZXIob0NvbnRyb2w6IE1hbmFnZWRPYmplY3QsIGFDb250cm9sSGFuZGxlcjogb2JqZWN0W10pIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuIGlmIG5lZWRlZFxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBtYXAgb2YgPGNvZGU+cmV0cmlldmU8L2NvZGU+IGFuZCA8Y29kZT5hcHBseTwvY29kZT4gZnVuY3Rpb25zIGZvciBhIGNlcnRhaW4gY29udHJvbC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250cm9sIFRoZSBjb250cm9sIHRvIGdldCBzdGF0ZSBoYW5kbGVyIGZvclxuXHQgKiBAcmV0dXJucyBBIHBsYWluIG9iamVjdCB3aXRoIHR3byBmdW5jdGlvbnM6IDxjb2RlPnJldHJpZXZlPC9jb2RlPiBhbmQgPGNvZGU+YXBwbHk8L2NvZGU+XG5cdCAqL1xuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldENvbnRyb2xTdGF0ZUhhbmRsZXIob0NvbnRyb2w6IGFueSkge1xuXHRcdGNvbnN0IGFJbnRlcm5hbENvbnRyb2xTdGF0ZUhhbmRsZXIgPSBbXSxcblx0XHRcdGFDdXN0b21Db250cm9sU3RhdGVIYW5kbGVyOiBhbnlbXSA9IFtdO1xuXHRcdGlmIChvQ29udHJvbCkge1xuXHRcdFx0Zm9yIChjb25zdCBzVHlwZSBpbiBfbUNvbnRyb2xTdGF0ZUhhbmRsZXJNYXApIHtcblx0XHRcdFx0aWYgKG9Db250cm9sLmlzQShzVHlwZSkpIHtcblx0XHRcdFx0XHQvLyBhdm9pZCBkaXJlY3QgbWFuaXB1bGF0aW9uIG9mIGludGVybmFsIF9tQ29udHJvbFN0YXRlSGFuZGxlck1hcFxuXHRcdFx0XHRcdGFJbnRlcm5hbENvbnRyb2xTdGF0ZUhhbmRsZXIucHVzaChPYmplY3QuYXNzaWduKHt9LCBfbUNvbnRyb2xTdGF0ZUhhbmRsZXJNYXBbc1R5cGVdKSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5iYXNlLnZpZXdTdGF0ZS5hZGFwdENvbnRyb2xTdGF0ZUhhbmRsZXIob0NvbnRyb2wsIGFDdXN0b21Db250cm9sU3RhdGVIYW5kbGVyKTtcblx0XHRyZXR1cm4gYUludGVybmFsQ29udHJvbFN0YXRlSGFuZGxlci5jb25jYXQoYUN1c3RvbUNvbnRyb2xTdGF0ZUhhbmRsZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIGFkZCBhbGwgY29udHJvbHMgZm9yIGdpdmVuIHZpZXcgdGhhdCBzaG91bGQgYmUgY29uc2lkZXJlZCBmb3IgdGhlIHN0YXRlIGhhbmRsaW5nIHRvIHRoZSBwcm92aWRlZCBjb250cm9sIGFycmF5LlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gYUNvbGxlY3RlZENvbnRyb2xzIFRoZSBjb2xsZWN0ZWQgY29udHJvbHNcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNhZGFwdFN0YXRlQ29udHJvbHNcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdGFkYXB0U3RhdGVDb250cm9scyhhQ29sbGVjdGVkQ29udHJvbHM6IE1hbmFnZWRPYmplY3RbXSkge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW4gaWYgbmVlZGVkXG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUga2V5IHRvIGJlIHVzZWQgZm9yIGdpdmVuIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udHJvbCBUaGUgY29udHJvbCB0byBnZXQgc3RhdGUga2V5IGZvclxuXHQgKiBAcmV0dXJucyBUaGUga2V5IHRvIGJlIHVzZWQgZm9yIHN0b3JpbmcgdGhlIGNvbnRyb2xzIHN0YXRlXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0U3RhdGVLZXkob0NvbnRyb2w6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLmdldFZpZXcoKS5nZXRMb2NhbElkKG9Db250cm9sLmdldElkKCkpIHx8IG9Db250cm9sLmdldElkKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmUgdGhlIHZpZXcgc3RhdGUgb2YgdGhpcyBleHRlbnNpb25zIHZpZXcuXG5cdCAqIFdoZW4gdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgbW9yZSB0aGFuIG9uY2UgYmVmb3JlIGZpbmlzaGluZywgYWxsIGJ1dCB0aGUgZmluYWwgcmVzcG9uc2Ugd2lsbCByZXNvbHZlIHRvIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4uXG5cdCAqXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSByZXNvbHZpbmcgdGhlIHZpZXcgc3RhdGVcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNyZXRyaWV2ZVZpZXdTdGF0ZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgcmV0cmlldmVWaWV3U3RhdGUoKSB7XG5cdFx0Kyt0aGlzLl9pUmV0cmlldmluZ1N0YXRlQ291bnRlcjtcblx0XHRsZXQgb1ZpZXdTdGF0ZTogYW55O1xuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuX3BJbml0aWFsU3RhdGVBcHBsaWVkO1xuXHRcdFx0Y29uc3QgYUNvbnRyb2xzOiAoTWFuYWdlZE9iamVjdCB8IHVuZGVmaW5lZClbXSA9IGF3YWl0IHRoaXMuY29sbGVjdFJlc3VsdHModGhpcy5iYXNlLnZpZXdTdGF0ZS5hZGFwdFN0YXRlQ29udHJvbHMpO1xuXHRcdFx0Y29uc3QgYVJlc29sdmVkU3RhdGVzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG5cdFx0XHRcdGFDb250cm9sc1xuXHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9Db250cm9sOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvQ29udHJvbCAmJiBvQ29udHJvbC5pc0EgJiYgb0NvbnRyb2wuaXNBKFwic2FwLnVpLmJhc2UuTWFuYWdlZE9iamVjdFwiKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5tYXAoKG9Db250cm9sOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLnJldHJpZXZlQ29udHJvbFN0YXRlKG9Db250cm9sKS50aGVuKCh2UmVzdWx0OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRrZXk6IHRoaXMuZ2V0U3RhdGVLZXkob0NvbnRyb2wpLFxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlOiB2UmVzdWx0XG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0KTtcblx0XHRcdG9WaWV3U3RhdGUgPSBhUmVzb2x2ZWRTdGF0ZXMucmVkdWNlKGZ1bmN0aW9uIChvU3RhdGVzOiBhbnksIG1TdGF0ZTogYW55KSB7XG5cdFx0XHRcdGNvbnN0IG9DdXJyZW50U3RhdGU6IGFueSA9IHt9O1xuXHRcdFx0XHRvQ3VycmVudFN0YXRlW21TdGF0ZS5rZXldID0gbVN0YXRlLnZhbHVlO1xuXHRcdFx0XHRyZXR1cm4gbWVyZ2VPYmplY3RzKG9TdGF0ZXMsIG9DdXJyZW50U3RhdGUpO1xuXHRcdFx0fSwge30pO1xuXHRcdFx0Y29uc3QgbUFkZGl0aW9uYWxTdGF0ZXMgPSBhd2FpdCBQcm9taXNlLnJlc29sdmUodGhpcy5fcmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzKCkpO1xuXHRcdFx0aWYgKG1BZGRpdGlvbmFsU3RhdGVzICYmIE9iamVjdC5rZXlzKG1BZGRpdGlvbmFsU3RhdGVzKS5sZW5ndGgpIHtcblx0XHRcdFx0b1ZpZXdTdGF0ZVtBRERJVElPTkFMX1NUQVRFU19LRVldID0gbUFkZGl0aW9uYWxTdGF0ZXM7XG5cdFx0XHR9XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdC0tdGhpcy5faVJldHJpZXZpbmdTdGF0ZUNvdW50ZXI7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2lSZXRyaWV2aW5nU3RhdGVDb3VudGVyID09PSAwID8gb1ZpZXdTdGF0ZSA6IHVuZGVmaW5lZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBFeHRlbmQgdGhlIG1hcCBvZiBhZGRpdGlvbmFsIHN0YXRlcyAobm90IGNvbnRyb2wgYm91bmQpIHRvIGJlIGFkZGVkIHRvIHRoZSBjdXJyZW50IHZpZXcgc3RhdGUgb2YgdGhlIGdpdmVuIHZpZXcuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBtQWRkaXRpb25hbFN0YXRlcyBUaGUgYWRkaXRpb25hbCBzdGF0ZVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI3JldHJpZXZlQWRkaXRpb25hbFN0YXRlc1xuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0cmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzKG1BZGRpdGlvbmFsU3RhdGVzOiBvYmplY3QpIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuIGlmIG5lZWRlZFxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBtYXAgb2YgYWRkaXRpb25hbCBzdGF0ZXMgKG5vdCBjb250cm9sIGJvdW5kKSB0byBiZSBhZGRlZCB0byB0aGUgY3VycmVudCB2aWV3IHN0YXRlIG9mIHRoZSBnaXZlbiB2aWV3LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBZGRpdGlvbmFsIHZpZXcgc3RhdGVzXG5cdCAqL1xuXHRfcmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzKCkge1xuXHRcdGNvbnN0IG1BZGRpdGlvbmFsU3RhdGVzID0ge307XG5cdFx0dGhpcy5iYXNlLnZpZXdTdGF0ZS5yZXRyaWV2ZUFkZGl0aW9uYWxTdGF0ZXMobUFkZGl0aW9uYWxTdGF0ZXMpO1xuXHRcdHJldHVybiBtQWRkaXRpb25hbFN0YXRlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHN0YXRlIGZvciB0aGUgZ2l2ZW4gY29udHJvbC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250cm9sIFRoZSBvYmplY3QgdG8gZ2V0IHRoZSBzdGF0ZSBmb3Jcblx0ICogQHJldHVybnMgVGhlIHN0YXRlIGZvciB0aGUgZ2l2ZW4gY29udHJvbFxuXHQgKi9cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRyZXRyaWV2ZUNvbnRyb2xTdGF0ZShvQ29udHJvbDogYW55KSB7XG5cdFx0Y29uc3QgYUNvbnRyb2xTdGF0ZUhhbmRsZXJzID0gdGhpcy5nZXRDb250cm9sU3RhdGVIYW5kbGVyKG9Db250cm9sKTtcblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoXG5cdFx0XHRhQ29udHJvbFN0YXRlSGFuZGxlcnMubWFwKChtQ29udHJvbFN0YXRlSGFuZGxlcjogYW55KSA9PiB7XG5cdFx0XHRcdGlmICh0eXBlb2YgbUNvbnRyb2xTdGF0ZUhhbmRsZXIucmV0cmlldmUgIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgY29udHJvbFN0YXRlSGFuZGxlci5yZXRyaWV2ZSBpcyBub3QgYSBmdW5jdGlvbiBmb3IgY29udHJvbDogJHtvQ29udHJvbC5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKX1gKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbUNvbnRyb2xTdGF0ZUhhbmRsZXIucmV0cmlldmUuY2FsbCh0aGlzLCBvQ29udHJvbCk7XG5cdFx0XHR9KVxuXHRcdCkudGhlbigoYVN0YXRlczogYW55W10pID0+IHtcblx0XHRcdHJldHVybiBhU3RhdGVzLnJlZHVjZShmdW5jdGlvbiAob0ZpbmFsU3RhdGU6IGFueSwgb0N1cnJlbnRTdGF0ZTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBtZXJnZU9iamVjdHMob0ZpbmFsU3RhdGUsIG9DdXJyZW50U3RhdGUpO1xuXHRcdFx0fSwge30pO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlZmluZXMgd2hldGhlciB0aGUgdmlldyBzdGF0ZSBzaG91bGQgb25seSBiZSBhcHBsaWVkIG9uY2UgaW5pdGlhbGx5LlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uSW5zdGVhZH0uXG5cdCAqXG5cdCAqIEltcG9ydGFudDpcblx0ICogWW91IHNob3VsZCBvbmx5IG92ZXJyaWRlIHRoaXMgbWV0aG9kIGZvciBjdXN0b20gcGFnZXMgYW5kIG5vdCBmb3IgdGhlIHN0YW5kYXJkIExpc3RSZXBvcnRQYWdlIGFuZCBPYmplY3RQYWdlIVxuXHQgKlxuXHQgKiBAcmV0dXJucyBJZiA8Y29kZT50cnVlPC9jb2RlPiwgb25seSB0aGUgaW5pdGlhbCB2aWV3IHN0YXRlIGlzIGFwcGxpZWQgb25jZSxcblx0ICogZWxzZSBhbnkgbmV3IHZpZXcgc3RhdGUgaXMgYWxzbyBhcHBsaWVkIG9uIGZvbGxvdy11cCBjYWxscyAoZGVmYXVsdClcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNhcHBseUluaXRpYWxTdGF0ZU9ubHlcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkluc3RlYWQpXG5cdGFwcGx5SW5pdGlhbFN0YXRlT25seSgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHBsaWVzIHRoZSBnaXZlbiB2aWV3IHN0YXRlIHRvIHRoaXMgZXh0ZW5zaW9ucyB2aWV3LlxuXHQgKlxuXHQgKiBAcGFyYW0gb1ZpZXdTdGF0ZSBUaGUgdmlldyBzdGF0ZSB0byBhcHBseSAoY2FuIGJlIHVuZGVmaW5lZClcblx0ICogQHBhcmFtIG9OYXZQYXJhbWV0ZXIgVGhlIGN1cnJlbnQgbmF2aWdhdGlvbiBwYXJhbWV0ZXJcblx0ICogQHBhcmFtIG9OYXZQYXJhbWV0ZXIubmF2aWdhdGlvblR5cGUgVGhlIGFjdHVhbCBuYXZpZ2F0aW9uIHR5cGVcblx0ICogQHBhcmFtIG9OYXZQYXJhbWV0ZXIuc2VsZWN0aW9uVmFyaWFudCBUaGUgc2VsZWN0aW9uVmFyaWFudCBmcm9tIHRoZSBuYXZpZ2F0aW9uXG5cdCAqIEBwYXJhbSBvTmF2UGFyYW1ldGVyLnNlbGVjdGlvblZhcmlhbnREZWZhdWx0cyBUaGUgc2VsZWN0aW9uVmFyaWFudCBkZWZhdWx0cyBmcm9tIHRoZSBuYXZpZ2F0aW9uXG5cdCAqIEBwYXJhbSBvTmF2UGFyYW1ldGVyLnJlcXVpcmVzU3RhbmRhcmRWYXJpYW50IERlZmluZXMgd2hldGhlciB0aGUgc3RhbmRhcmQgdmFyaWFudCBtdXN0IGJlIHVzZWQgaW4gdmFyaWFudCBtYW5hZ2VtZW50XG5cdCAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFzeW5jIHN0YXRlIGhhbmRsaW5nXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjYXBwbHlWaWV3U3RhdGVcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIGFwcGx5Vmlld1N0YXRlKG9WaWV3U3RhdGU6IGFueSwgb05hdlBhcmFtZXRlcjogTmF2aWdhdGlvblBhcmFtZXRlcik6IFByb21pc2U8YW55PiB7XG5cdFx0aWYgKHRoaXMuYmFzZS52aWV3U3RhdGUuYXBwbHlJbml0aWFsU3RhdGVPbmx5KCkgJiYgdGhpcy5fZ2V0SW5pdGlhbFN0YXRlQXBwbGllZCgpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuY29sbGVjdFJlc3VsdHModGhpcy5iYXNlLnZpZXdTdGF0ZS5vbkJlZm9yZVN0YXRlQXBwbGllZCk7XG5cdFx0XHRjb25zdCBhQ29udHJvbHM6IE1hbmFnZWRPYmplY3RbXSA9IGF3YWl0IHRoaXMuY29sbGVjdFJlc3VsdHModGhpcy5iYXNlLnZpZXdTdGF0ZS5hZGFwdFN0YXRlQ29udHJvbHMpO1xuXHRcdFx0dGhpcy52aWV3U3RhdGVDb250cm9scyA9IGFDb250cm9scztcblx0XHRcdGxldCBvUHJvbWlzZUNoYWluID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHRsZXQgaGFzVmFyaWFudE1hbmFnZW1lbnQgPSBmYWxzZTtcblx0XHRcdC8qKlxuXHRcdFx0ICogdGhpcyBlbnN1cmVzIHRoYXQgdmFyaWFudE1hbmFnZW1lbnQgY29udHJvbCBpcyBhcHBsaWVkIGZpcnN0IHRvIGNhbGN1bGF0ZSBpbml0aWFsIHN0YXRlIGZvciBkZWx0YSBsb2dpY1xuXHRcdFx0ICovXG5cdFx0XHRjb25zdCBzb3J0ZWRBZGFwdFN0YXRlQ29udHJvbHMgPSBhQ29udHJvbHMucmVkdWNlKChtb2RpZmllZENvbnRyb2xzOiBNYW5hZ2VkT2JqZWN0W10sIGNvbnRyb2wpID0+IHtcblx0XHRcdFx0aWYgKCFjb250cm9sKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1vZGlmaWVkQ29udHJvbHM7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgaXNWYXJpYW50TWFuYWdlbWVudENvbnRyb2wgPSBjb250cm9sLmlzQShcInNhcC51aS5mbC52YXJpYW50cy5WYXJpYW50TWFuYWdlbWVudFwiKTtcblx0XHRcdFx0aWYgKCFoYXNWYXJpYW50TWFuYWdlbWVudCkge1xuXHRcdFx0XHRcdGhhc1ZhcmlhbnRNYW5hZ2VtZW50ID0gaXNWYXJpYW50TWFuYWdlbWVudENvbnRyb2w7XG5cdFx0XHRcdH1cblx0XHRcdFx0bW9kaWZpZWRDb250cm9scyA9IGlzVmFyaWFudE1hbmFnZW1lbnRDb250cm9sID8gW2NvbnRyb2wsIC4uLm1vZGlmaWVkQ29udHJvbHNdIDogWy4uLm1vZGlmaWVkQ29udHJvbHMsIGNvbnRyb2xdO1xuXHRcdFx0XHRyZXR1cm4gbW9kaWZpZWRDb250cm9scztcblx0XHRcdH0sIFtdKTtcblxuXHRcdFx0Ly8gSW4gY2FzZSBvZiBubyBWYXJpYW50IE1hbmFnZW1lbnQsIHRoaXMgZW5zdXJlcyB0aGF0IGluaXRpYWwgc3RhdGVzIGlzIHNldFxuXHRcdFx0aWYgKCFoYXNWYXJpYW50TWFuYWdlbWVudCkge1xuXHRcdFx0XHR0aGlzLl9zZXRJbml0aWFsU3RhdGVzRm9yRGVsdGFDb21wdXRlKCk7XG5cdFx0XHR9XG5cblx0XHRcdHNvcnRlZEFkYXB0U3RhdGVDb250cm9sc1xuXHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChvQ29udHJvbCkge1xuXHRcdFx0XHRcdHJldHVybiBvQ29udHJvbC5pc0EoXCJzYXAudWkuYmFzZS5NYW5hZ2VkT2JqZWN0XCIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuZm9yRWFjaCgob0NvbnRyb2wpID0+IHtcblx0XHRcdFx0XHRjb25zdCBzS2V5ID0gdGhpcy5nZXRTdGF0ZUtleShvQ29udHJvbCk7XG5cdFx0XHRcdFx0b1Byb21pc2VDaGFpbiA9IG9Qcm9taXNlQ2hhaW4udGhlbihcblx0XHRcdFx0XHRcdHRoaXMuYXBwbHlDb250cm9sU3RhdGUuYmluZCh0aGlzLCBvQ29udHJvbCwgb1ZpZXdTdGF0ZSA/IG9WaWV3U3RhdGVbc0tleV0gOiB1bmRlZmluZWQsIG9OYXZQYXJhbWV0ZXIpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdGF3YWl0IG9Qcm9taXNlQ2hhaW47XG5cdFx0XHRpZiAob05hdlBhcmFtZXRlci5uYXZpZ2F0aW9uVHlwZSA9PT0gTmF2VHlwZS5pQXBwU3RhdGUpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyhcblx0XHRcdFx0XHR0aGlzLmJhc2Uudmlld1N0YXRlLmFwcGx5QWRkaXRpb25hbFN0YXRlcyxcblx0XHRcdFx0XHRvVmlld1N0YXRlID8gb1ZpZXdTdGF0ZVtBRERJVElPTkFMX1NUQVRFU19LRVldIDogdW5kZWZpbmVkXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhd2FpdCB0aGlzLmNvbGxlY3RSZXN1bHRzKHRoaXMuYmFzZS52aWV3U3RhdGUuYXBwbHlOYXZpZ2F0aW9uUGFyYW1ldGVycywgb05hdlBhcmFtZXRlcik7XG5cdFx0XHRcdGF3YWl0IHRoaXMuY29sbGVjdFJlc3VsdHModGhpcy5iYXNlLnZpZXdTdGF0ZS5fYXBwbHlOYXZpZ2F0aW9uUGFyYW1ldGVyc1RvRmlsdGVyYmFyLCBvTmF2UGFyYW1ldGVyKTtcblx0XHRcdH1cblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0YXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyh0aGlzLmJhc2Uudmlld1N0YXRlLm9uQWZ0ZXJTdGF0ZUFwcGxpZWQpO1xuXHRcdFx0XHR0aGlzLl9zZXRJbml0aWFsU3RhdGVBcHBsaWVkKCk7XG5cdFx0XHR9IGNhdGNoIChlOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0X2NoZWNrSWZWYXJpYW50SWRJc0F2YWlsYWJsZShvVk06IGFueSwgc1ZhcmlhbnRJZDogYW55KSB7XG5cdFx0Y29uc3QgYVZhcmlhbnRzID0gb1ZNLmdldFZhcmlhbnRzKCk7XG5cdFx0bGV0IGJJc0NvbnRyb2xTdGF0ZVZhcmlhbnRBdmFpbGFibGUgPSBmYWxzZTtcblx0XHRhVmFyaWFudHMuZm9yRWFjaChmdW5jdGlvbiAob1ZhcmlhbnQ6IGFueSkge1xuXHRcdFx0aWYgKG9WYXJpYW50LmtleSA9PT0gc1ZhcmlhbnRJZCkge1xuXHRcdFx0XHRiSXNDb250cm9sU3RhdGVWYXJpYW50QXZhaWxhYmxlID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gYklzQ29udHJvbFN0YXRlVmFyaWFudEF2YWlsYWJsZTtcblx0fVxuXG5cdF9zZXRJbml0aWFsU3RhdGVBcHBsaWVkKCkge1xuXHRcdGlmICh0aGlzLl9wSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmUpIHtcblx0XHRcdGNvbnN0IHBJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZSA9IHRoaXMuX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZTtcblx0XHRcdGRlbGV0ZSB0aGlzLl9wSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmU7XG5cdFx0XHRwSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmUoKTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0SW5pdGlhbFN0YXRlQXBwbGllZCgpIHtcblx0XHRyZXR1cm4gIXRoaXMuX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIb29rIHRvIHJlYWN0IGJlZm9yZSBhIHN0YXRlIGZvciBnaXZlbiB2aWV3IGlzIGFwcGxpZWQuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBhUHJvbWlzZXMgRXh0ZW5zaWJsZSBhcnJheSBvZiBwcm9taXNlcyB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZ1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI29uQmVmb3JlU3RhdGVBcHBsaWVkXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRvbkJlZm9yZVN0YXRlQXBwbGllZChhUHJvbWlzZXM6IFByb21pc2U8YW55Pikge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRlblxuXHR9XG5cblx0LyoqXG5cdCAqIEhvb2sgdG8gcmVhY3Qgd2hlbiBzdGF0ZSBmb3IgZ2l2ZW4gdmlldyB3YXMgYXBwbGllZC5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIGFQcm9taXNlcyBFeHRlbnNpYmxlIGFycmF5IG9mIHByb21pc2VzIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBjb250aW51aW5nXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjb25BZnRlclN0YXRlQXBwbGllZFxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0b25BZnRlclN0YXRlQXBwbGllZChhUHJvbWlzZXM6IFByb21pc2U8YW55Pikge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRlblxuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGx5aW5nIGFkZGl0aW9uYWwsIG5vdCBjb250cm9sIHJlbGF0ZWQsIHN0YXRlcyAtIGlzIGNhbGxlZCBvbmx5IGlmIG5hdmlnYXRpb24gdHlwZSBpcyBpQXBwU3RhdGUuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBvVmlld1N0YXRlIFRoZSBjdXJyZW50IHZpZXcgc3RhdGVcblx0ICogQHBhcmFtIGFQcm9taXNlcyBFeHRlbnNpYmxlIGFycmF5IG9mIHByb21pc2VzIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBjb250aW51aW5nXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjYXBwbHlBZGRpdGlvbmFsU3RhdGVzXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRhcHBseUFkZGl0aW9uYWxTdGF0ZXMob1ZpZXdTdGF0ZTogb2JqZWN0LCBhUHJvbWlzZXM6IFByb21pc2U8YW55Pikge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW4gaWYgbmVlZGVkXG5cdH1cblxuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdF9hcHBseU5hdmlnYXRpb25QYXJhbWV0ZXJzVG9GaWx0ZXJiYXIoXG5cdFx0X29OYXZQYXJhbWV0ZXI6IHtcblx0XHRcdG5hdmlnYXRpb25UeXBlOiBhbnk7XG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50Pzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudERlZmF1bHRzPzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdFx0cmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQ/OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXHRcdH0sXG5cdFx0X2FQcm9taXNlczogUHJvbWlzZTxhbnk+XG5cdCkge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW4gaWYgbmVlZGVkXG5cdH1cblxuXHQvKipcblx0ICogQXBwbHkgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzIGlzIG5vdCBjYWxsZWQgaWYgdGhlIG5hdmlnYXRpb24gdHlwZSBpcyBpQXBwU3RhdGVcblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIG9OYXZQYXJhbWV0ZXIgVGhlIGN1cnJlbnQgbmF2aWdhdGlvbiBwYXJhbWV0ZXJcblx0ICogQHBhcmFtIG9OYXZQYXJhbWV0ZXIubmF2aWdhdGlvblR5cGUgVGhlIGFjdHVhbCBuYXZpZ2F0aW9uIHR5cGVcblx0ICogQHBhcmFtIFtvTmF2UGFyYW1ldGVyLnNlbGVjdGlvblZhcmlhbnRdIFRoZSBzZWxlY3Rpb25WYXJpYW50IGZyb20gdGhlIG5hdmlnYXRpb25cblx0ICogQHBhcmFtIFtvTmF2UGFyYW1ldGVyLnNlbGVjdGlvblZhcmlhbnREZWZhdWx0c10gVGhlIHNlbGVjdGlvblZhcmlhbnQgZGVmYXVsdHMgZnJvbSB0aGUgbmF2aWdhdGlvblxuXHQgKiBAcGFyYW0gW29OYXZQYXJhbWV0ZXIucmVxdWlyZXNTdGFuZGFyZFZhcmlhbnRdIERlZmluZXMgd2hldGhlciB0aGUgc3RhbmRhcmQgdmFyaWFudCBtdXN0IGJlIHVzZWQgaW4gdmFyaWFudCBtYW5hZ2VtZW50XG5cdCAqIEBwYXJhbSBhUHJvbWlzZXMgRXh0ZW5zaWJsZSBhcnJheSBvZiBwcm9taXNlcyB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZ1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI2FwcGx5TmF2aWdhdGlvblBhcmFtZXRlcnNcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRhcHBseU5hdmlnYXRpb25QYXJhbWV0ZXJzKFxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0XHRvTmF2UGFyYW1ldGVyOiB7XG5cdFx0XHRuYXZpZ2F0aW9uVHlwZTogYW55O1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudD86IG9iamVjdCB8IHVuZGVmaW5lZDtcblx0XHRcdHNlbGVjdGlvblZhcmlhbnREZWZhdWx0cz86IG9iamVjdCB8IHVuZGVmaW5lZDtcblx0XHRcdHJlcXVpcmVzU3RhbmRhcmRWYXJpYW50PzogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblx0XHR9LFxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0XHRhUHJvbWlzZXM6IFByb21pc2U8YW55PlxuXHQpIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuIGlmIG5lZWRlZFxuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGx5aW5nIHRoZSBnaXZlbiBzdGF0ZSB0byB0aGUgZ2l2ZW4gY29udHJvbC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250cm9sIFRoZSBvYmplY3QgdG8gYXBwbHkgdGhlIGdpdmVuIHN0YXRlXG5cdCAqIEBwYXJhbSBvQ29udHJvbFN0YXRlIFRoZSBzdGF0ZSBmb3IgdGhlIGdpdmVuIGNvbnRyb2xcblx0ICogQHBhcmFtIFtvTmF2UGFyYW1ldGVyc10gVGhlIGN1cnJlbnQgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFJldHVybiBhIHByb21pc2UgZm9yIGFzeW5jIHN0YXRlIGhhbmRsaW5nXG5cdCAqL1xuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFwcGx5Q29udHJvbFN0YXRlKG9Db250cm9sOiBhbnksIG9Db250cm9sU3RhdGU6IG9iamVjdCwgb05hdlBhcmFtZXRlcnM/OiBvYmplY3QpIHtcblx0XHRjb25zdCBhQ29udHJvbFN0YXRlSGFuZGxlcnMgPSB0aGlzLmdldENvbnRyb2xTdGF0ZUhhbmRsZXIob0NvbnRyb2wpO1xuXHRcdGxldCBvUHJvbWlzZUNoYWluID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0YUNvbnRyb2xTdGF0ZUhhbmRsZXJzLmZvckVhY2goKG1Db250cm9sU3RhdGVIYW5kbGVyOiBhbnkpID0+IHtcblx0XHRcdGlmICh0eXBlb2YgbUNvbnRyb2xTdGF0ZUhhbmRsZXIuYXBwbHkgIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYGNvbnRyb2xTdGF0ZUhhbmRsZXIuYXBwbHkgaXMgbm90IGEgZnVuY3Rpb24gZm9yIGNvbnRyb2w6ICR7b0NvbnRyb2wuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCl9YCk7XG5cdFx0XHR9XG5cdFx0XHRvUHJvbWlzZUNoYWluID0gb1Byb21pc2VDaGFpbi50aGVuKG1Db250cm9sU3RhdGVIYW5kbGVyLmFwcGx5LmJpbmQodGhpcywgb0NvbnRyb2wsIG9Db250cm9sU3RhdGUsIG9OYXZQYXJhbWV0ZXJzKSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG9Qcm9taXNlQ2hhaW47XG5cdH1cblxuXHRnZXRJbnRlcmZhY2UoKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvLyBtZXRob2QgdG8gZ2V0IHRoZSBjb250cm9sIHN0YXRlIGZvciBtZGMgY29udHJvbHMgYXBwbHlpbmcgdGhlIGRlbHRhIGxvZ2ljXG5cdF9nZXRDb250cm9sU3RhdGUoY29udHJvbFN0YXRlS2V5OiBzdHJpbmcsIGNvbnRyb2xTdGF0ZTogQ29udHJvbFN0YXRlKSB7XG5cdFx0Y29uc3QgaW5pdGlhbENvbnRyb2xTdGF0ZXNNYXBwZXIgPSB0aGlzLmluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyO1xuXHRcdGlmIChPYmplY3Qua2V5cyhpbml0aWFsQ29udHJvbFN0YXRlc01hcHBlcikubGVuZ3RoID4gMCAmJiBpbml0aWFsQ29udHJvbFN0YXRlc01hcHBlcltjb250cm9sU3RhdGVLZXldKSB7XG5cdFx0XHRpZiAoT2JqZWN0LmtleXMoaW5pdGlhbENvbnRyb2xTdGF0ZXNNYXBwZXJbY29udHJvbFN0YXRlS2V5XSBhcyBvYmplY3QpLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRpbml0aWFsQ29udHJvbFN0YXRlc01hcHBlcltjb250cm9sU3RhdGVLZXldID0geyAuLi5jb250cm9sU3RhdGUgfTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB7IGZ1bGxTdGF0ZTogY29udHJvbFN0YXRlLCBpbml0aWFsU3RhdGU6IGluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyW2NvbnRyb2xTdGF0ZUtleV0gfTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbnRyb2xTdGF0ZTtcblx0fVxuXG5cdC8vbWV0aG9kIHRvIHN0b3JlIHRoZSBpbml0aWFsIHN0YXRlcyBmb3IgZGVsdGEgY29tcHV0YXRpb24gb2YgbWRjIGNvbnRyb2xzXG5cdF9zZXRJbml0aWFsU3RhdGVzRm9yRGVsdGFDb21wdXRlID0gYXN5bmMgKHZhcmlhbnRNYW5hZ2VtZW50PzogVmFyaWFudE1hbmFnZW1lbnQpID0+IHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgYWRhcHRDb250cm9scyA9IHRoaXMudmlld1N0YXRlQ29udHJvbHM7XG5cblx0XHRcdGNvbnN0IGV4dGVybmFsU3RhdGVQcm9taXNlczogUHJvbWlzZTxvYmplY3Q+W10gPSBbXTtcblx0XHRcdGNvbnN0IGNvbnRyb2xTdGF0ZUtleTogc3RyaW5nW10gPSBbXTtcblx0XHRcdGxldCBpbml0aWFsQ29udHJvbFN0YXRlczogb2JqZWN0W10gPSBbXTtcblx0XHRcdGNvbnN0IHZhcmlhbnRDb250cm9sczogc3RyaW5nW10gPSB2YXJpYW50TWFuYWdlbWVudD8uZ2V0Rm9yKCkgPz8gW107XG5cblx0XHRcdGFkYXB0Q29udHJvbHNcblx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAoY29udHJvbCkge1xuXHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRjb250cm9sICYmXG5cdFx0XHRcdFx0XHQoIXZhcmlhbnRNYW5hZ2VtZW50IHx8IHZhcmlhbnRDb250cm9scy5pbmRleE9mKGNvbnRyb2wuZ2V0SWQoKSkgPiAtMSkgJiZcblx0XHRcdFx0XHRcdChjb250cm9sLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikgfHxcblx0XHRcdFx0XHRcdFx0KGNvbnRyb2wgYXMgQmFzZU9iamVjdCkuaXNBKFwic2FwLnVpLm1kYy5GaWx0ZXJCYXJcIikgfHxcblx0XHRcdFx0XHRcdFx0KGNvbnRyb2wgYXMgQmFzZU9iamVjdCkuaXNBKFwic2FwLnVpLm1kYy5DaGFydFwiKSlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuXHRcdFx0XHRcdGlmICh2YXJpYW50TWFuYWdlbWVudCkge1xuXHRcdFx0XHRcdFx0dGhpcy5fYWRkRXZlbnRMaXN0ZW5lcnNUb1ZhcmlhbnRNYW5hZ2VtZW50KHZhcmlhbnRNYW5hZ2VtZW50LCB2YXJpYW50Q29udHJvbHMpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnN0IGV4dGVybmFsU3RhdGVQcm9taXNlID0gU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZShjb250cm9sIGFzIG9iamVjdCk7XG5cdFx0XHRcdFx0ZXh0ZXJuYWxTdGF0ZVByb21pc2VzLnB1c2goZXh0ZXJuYWxTdGF0ZVByb21pc2UpO1xuXHRcdFx0XHRcdGNvbnRyb2xTdGF0ZUtleS5wdXNoKHRoaXMuZ2V0U3RhdGVLZXkoY29udHJvbCkpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0aW5pdGlhbENvbnRyb2xTdGF0ZXMgPSBhd2FpdCBQcm9taXNlLmFsbChleHRlcm5hbFN0YXRlUHJvbWlzZXMpO1xuXHRcdFx0aW5pdGlhbENvbnRyb2xTdGF0ZXMuZm9yRWFjaCgoaW5pdGlhbENvbnRyb2xTdGF0ZTogb2JqZWN0LCBpOiBudW1iZXIpID0+IHtcblx0XHRcdFx0dGhpcy5pbml0aWFsQ29udHJvbFN0YXRlc01hcHBlcltjb250cm9sU3RhdGVLZXlbaV1dID0gaW5pdGlhbENvbnRyb2xTdGF0ZTtcblx0XHRcdH0pO1xuXHRcdH0gY2F0Y2ggKGU6IHVua25vd24pIHtcblx0XHRcdExvZy5lcnJvcihlIGFzIHN0cmluZyk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIEF0dGFjaCBldmVudCB0byBzYXZlIGFuZCBzZWxlY3Qgb2YgVmFyaWFudCBNYW5hZ2VtZW50IHRvIHVwZGF0ZSB0aGUgaW5pdGlhbCBDb250cm9sIFN0YXRlcyBvbiB2YXJpYW50IGNoYW5nZVxuXHRfYWRkRXZlbnRMaXN0ZW5lcnNUb1ZhcmlhbnRNYW5hZ2VtZW50KHZhcmlhbnRNYW5hZ2VtZW50OiBWYXJpYW50TWFuYWdlbWVudCwgdmFyaWFudENvbnRyb2xzOiBzdHJpbmdbXSkge1xuXHRcdGNvbnN0IG9QYXlsb2FkID0geyB2YXJpYW50TWFuYWdlZENvbnRyb2xzOiB2YXJpYW50Q29udHJvbHMgfTtcblx0XHRjb25zdCBmbkV2ZW50ID0gKCkgPT4ge1xuXHRcdFx0dGhpcy5fdXBkYXRlSW5pdGlhbFN0YXRlc09uVmFyaWFudENoYW5nZSh2YXJpYW50Q29udHJvbHMpO1xuXHRcdH07XG5cdFx0dmFyaWFudE1hbmFnZW1lbnQuYXR0YWNoU2F2ZShvUGF5bG9hZCwgZm5FdmVudCwge30pO1xuXHRcdHZhcmlhbnRNYW5hZ2VtZW50LmF0dGFjaFNlbGVjdChvUGF5bG9hZCwgZm5FdmVudCwge30pO1xuXHR9XG5cblx0X3VwZGF0ZUluaXRpYWxTdGF0ZXNPblZhcmlhbnRDaGFuZ2Uodm1Bc3NvY2lhdGVkQ29udHJvbHNUb1Jlc2V0OiBzdHJpbmdbXSkge1xuXHRcdGNvbnN0IGluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyID0gdGhpcy5pbml0aWFsQ29udHJvbFN0YXRlc01hcHBlcjtcblx0XHRPYmplY3Qua2V5cyhpbml0aWFsQ29udHJvbFN0YXRlc01hcHBlcikuZm9yRWFjaCgoY29udHJvbEtleSkgPT4ge1xuXHRcdFx0Zm9yIChjb25zdCB2bUFzc29jaWF0ZWRjb250cm9sS2V5IG9mIHZtQXNzb2NpYXRlZENvbnRyb2xzVG9SZXNldCkge1xuXHRcdFx0XHRpZiAodm1Bc3NvY2lhdGVkY29udHJvbEtleS5pbmRleE9mKGNvbnRyb2xLZXkpID4gLTEpIHtcblx0XHRcdFx0XHRpbml0aWFsQ29udHJvbFN0YXRlc01hcHBlcltjb250cm9sS2V5XSA9IHt9O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVmlld1N0YXRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O0VBc0JBO0VBQ0E7RUFDQTtFQUNBLE1BQU1BLHFCQUFxQixHQUFHLG1CQUFtQjtJQUNoREMsT0FBTyxHQUFHQyxVQUFVLENBQUNELE9BQU87O0VBRTdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUF5Q0E7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