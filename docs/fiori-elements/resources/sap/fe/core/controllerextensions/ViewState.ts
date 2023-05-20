import Log from "sap/base/Log";
import mergeObjects from "sap/base/util/merge";
import CommonUtils from "sap/fe/core/CommonUtils";
import { defineUI5Class, extensible, finalExtension, privateExtension, publicExtension } from "sap/fe/core/helpers/ClassSupport";
import KeepAliveHelper from "sap/fe/core/helpers/KeepAliveHelper";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import type PageController from "sap/fe/core/PageController";
import NavLibrary from "sap/fe/navigation/library";
import type ManagedObject from "sap/ui/base/ManagedObject";
import type BaseObject from "sap/ui/base/Object";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";
import ControlVariantApplyAPI from "sap/ui/fl/apply/api/ControlVariantApplyAPI";
import VariantManagement from "sap/ui/fl/variants/VariantManagement";
// import Chart from "sap/ui/mdc/Chart";
import type FilterBar from "sap/ui/mdc/FilterBar";
import type FilterBarBase from "sap/ui/mdc/filterbar/FilterBarBase";
import StateUtil from "sap/ui/mdc/p13n/StateUtil";
import type Table from "sap/ui/mdc/Table";
import type { PropertyInfo } from "sap/ui/mdc/util/PropertyHelper";
import type { MetaModelNavProperty } from "types/metamodel_types";

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
export type NavigationParameter = {
	/**
	 *  The actual navigation type.
	 *
	 *  @public
	 */
	navigationType: string;
	/**
	 * The selectionVariant from the navigation.
	 *
	 * @public
	 */
	selectionVariant?: object;
	/**
	 * The selectionVariant defaults from the navigation
	 *
	 *  @public
	 */
	selectionVariantDefaults?: object;
	/**
	 * Defines whether the standard variant must be used in variant management
	 *
	 *  @public
	 */
	requiresStandardVariant?: boolean;
};

export type ControlState =
	| ({
			initialState?: {
				supplementaryConfig: object | undefined;
			};
			fullState?: object;
	  } & Record<string, unknown>)
	| undefined;

export type FilterBarState = {
	filter?: Record<string, Array<object>>;
} & Record<string, unknown>;

///////////////////////////////////////////////////////////////////
// methods to retrieve & apply states for the different controls //
///////////////////////////////////////////////////////////////////

const _mControlStateHandlerMap: Record<string, any> = {
	"sap.ui.fl.variants.VariantManagement": {
		retrieve: function (oVM: VariantManagement): { variantId: string | null } {
			return {
				variantId: oVM.getCurrentVariantKey()
			};
		},
		apply: async function (oVM: VariantManagement, controlState: Record<string, unknown> | undefined): Promise<void> {
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
							variantReference: sVariantReference as string
						});
						await this._setInitialStatesForDeltaCompute(oVM);
					} catch (error: unknown) {
						Log.error(error as string);
						this.invalidateInitialStateForApply.push(...oVM.getFor());
						await this._setInitialStatesForDeltaCompute(oVM);
					}
				} else {
					this._setInitialStatesForDeltaCompute(oVM);
				}
			} catch (error: unknown) {
				Log.error(error as string);
			}
		}
	},
	"sap.m.IconTabBar": {
		retrieve: function (oTabBar: any) {
			return {
				selectedKey: oTabBar.getSelectedKey()
			};
		},
		apply: function (oTabBar: any, oControlState: any) {
			if (oControlState && oControlState.selectedKey) {
				const oSelectedItem = oTabBar.getItems().find(function (oItem: any) {
					return oItem.getKey() === oControlState.selectedKey;
				});
				if (oSelectedItem) {
					oTabBar.setSelectedItem(oSelectedItem);
				}
			}
		}
	},
	"sap.ui.mdc.FilterBar": {
		retrieve: async function (filterBar: FilterBarBase) {
			const controlStateKey = this.getStateKey(filterBar);
			const filterBarState = await StateUtil.retrieveExternalState(filterBar);
			// remove sensitive or view state irrelevant fields
			const propertiesInfo = filterBar.getPropertyInfoSet();
			const filter = filterBarState.filter || {};
			propertiesInfo
				.filter(function (PropertyInfo: PropertyInfo) {
					return (
						Object.keys(filter).length > 0 &&
						PropertyInfo.path &&
						filter[PropertyInfo.path] &&
						(PropertyInfo.removeFromAppState || filter[PropertyInfo.path].length === 0)
					);
				})
				.forEach(function (PropertyInfo: PropertyInfo) {
					if (PropertyInfo.path) {
						delete filter[PropertyInfo.path];
					}
				});
			return this._getControlState(controlStateKey, filterBarState);
		},
		apply: async function (filterBar: FilterBar, controlState: ControlState) {
			try {
				if (controlState) {
					const isInitialStateApplicable =
						controlState?.initialState &&
						this.invalidateInitialStateForApply.indexOf(filterBar.getId()) === -1 &&
						this.controlsVariantIdUnavailable.indexOf(filterBar.getId()) === -1;

					if (isInitialStateApplicable) {
						const diffState: object = await StateUtil.diffState(
							filterBar,
							controlState.initialState as object,
							controlState.fullState as object
						);
						return StateUtil.applyExternalState(filterBar, diffState);
					} else {
						return StateUtil.applyExternalState(filterBar, controlState?.fullState ?? controlState);
					}
				}
			} catch (error: unknown) {
				Log.error(error as string);
			}
		}
	},
	"sap.ui.mdc.Table": {
		retrieve: async function (table: Table) {
			const controlStateKey = this.getStateKey(table);
			const tableState = await StateUtil.retrieveExternalState(table);
			return this._getControlState(controlStateKey, tableState);
		},
		apply: async function (table: Table, controlState: ControlState) {
			try {
				if (controlState) {
					// Extra condition added to apply the diff state logic for mdc control
					const isInitialStateApplicable =
						controlState?.initialState &&
						this.invalidateInitialStateForApply.indexOf(table.getId()) === -1 &&
						this.controlsVariantIdUnavailable.indexOf(table.getId()) === -1;

					if (isInitialStateApplicable) {
						if (controlState.initialState && !controlState.initialState?.supplementaryConfig) {
							controlState.initialState.supplementaryConfig = {};
						}
						const oDiffState = await StateUtil.diffState(
							table,
							controlState.initialState as object,
							controlState.fullState as object
						);
						return StateUtil.applyExternalState(table, oDiffState);
					} else {
						if (!controlState.supplementaryConfig) {
							controlState.supplementaryConfig = {};
						}
						return StateUtil.applyExternalState(table, controlState?.fullState ?? controlState);
					}
				}
			} catch (error) {
				Log.error(error as string);
			}
		},
		refreshBinding: function (oTable: any) {
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
						oHeaderContext.requestSideEffects([{ $NavigationPropertyPath: "" }], sGroupId);
					}
				}
			} else {
				Log.info(`Table: ${oTable.getId()} was not refreshed. No binding found!`);
			}
		}
	},
	"sap.ui.mdc.Chart": {
		retrieve: function (oChart: any) {
			return StateUtil.retrieveExternalState(oChart);
		},
		apply: function (oChart: any, oControlState: any) {
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
		retrieve: function (oOPLayout: any) {
			return {
				selectedSection: oOPLayout.getSelectedSection()
			};
		},
		apply: function (oOPLayout: any, oControlState: any) {
			if (oControlState) {
				oOPLayout.setSelectedSection(oControlState.selectedSection);
			}
		},
		refreshBinding: function (oOPLayout: any) {
			const oBindingContext = oOPLayout.getBindingContext();
			const oBinding = oBindingContext && oBindingContext.getBinding();
			if (oBinding) {
				const sMetaPath = ModelHelper.getMetaPathForContext(oBindingContext);
				const sStrategy = KeepAliveHelper.getControlRefreshStrategyForContextPath(oOPLayout, sMetaPath);
				if (sStrategy === "self") {
					// Refresh main context and 1-1 navigation properties or OP
					const oModel = oBindingContext.getModel(),
						oMetaModel = oModel.getMetaModel(),
						oNavigationProperties: Record<string, MetaModelNavProperty> =
							(CommonUtils.getContextPathProperties(oMetaModel, sMetaPath, {
								$kind: "NavigationProperty"
							}) as Record<string, MetaModelNavProperty>) || {},
						aNavPropertiesToRequest = Object.keys(oNavigationProperties).reduce(function (aPrev: any[], sNavProp: string) {
							if (oNavigationProperties[sNavProp].$isCollection !== true) {
								aPrev.push({ $NavigationPropertyPath: sNavProp });
							}
							return aPrev;
						}, []),
						aProperties = [{ $PropertyPath: "*" }],
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
		retrieve: function (oQuickFilter: any) {
			return {
				selectedKey: oQuickFilter.getSelectorKey()
			};
		},
		apply: function (oQuickFilter: any, oControlState: any) {
			if (oControlState?.selectedKey) {
				oQuickFilter.setSelectorKey(oControlState.selectedKey);
			}
		}
	},
	"sap.m.SegmentedButton": {
		retrieve: function (oSegmentedButton: any) {
			return {
				selectedKey: oSegmentedButton.getSelectedKey()
			};
		},
		apply: function (oSegmentedButton: any, oControlState: any) {
			if (oControlState?.selectedKey) {
				oSegmentedButton.setSelectedKey(oControlState.selectedKey);
			}
		}
	},
	"sap.m.Select": {
		retrieve: function (oSelect: any) {
			return {
				selectedKey: oSelect.getSelectedKey()
			};
		},
		apply: function (oSelect: any, oControlState: any) {
			if (oControlState?.selectedKey) {
				oSelect.setSelectedKey(oControlState.selectedKey);
			}
		}
	},
	"sap.f.DynamicPage": {
		retrieve: function (oDynamicPage: any) {
			return {
				headerExpanded: oDynamicPage.getHeaderExpanded()
			};
		},
		apply: function (oDynamicPage: any, oControlState: any) {
			if (oControlState) {
				oDynamicPage.setHeaderExpanded(oControlState.headerExpanded);
			}
		}
	},
	"sap.ui.core.mvc.View": {
		retrieve: function (oView: any) {
			const oController = oView.getController();
			if (oController && oController.viewState) {
				return oController.viewState.retrieveViewState(oController.viewState);
			}
			return {};
		},
		apply: function (oView: any, oControlState: any, oNavParameters: any) {
			const oController = oView.getController();
			if (oController && oController.viewState) {
				return oController.viewState.applyViewState(oControlState, oNavParameters);
			}
		},
		refreshBinding: function (oView: any) {
			const oController = oView.getController();
			if (oController && oController.viewState) {
				return oController.viewState.refreshViewBindings();
			}
		}
	},
	"sap.ui.core.ComponentContainer": {
		retrieve: function (oComponentContainer: any) {
			const oComponent = oComponentContainer.getComponentInstance();
			if (oComponent) {
				return this.retrieveControlState(oComponent.getRootControl());
			}
			return {};
		},
		apply: function (oComponentContainer: any, oControlState: any, oNavParameters: any) {
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
@defineUI5Class("sap.fe.core.controllerextensions.ViewState")
class ViewState extends ControllerExtension {
	private _iRetrievingStateCounter: number;

	private _pInitialStateApplied: Promise<unknown>;

	private _pInitialStateAppliedResolve?: Function;

	private base!: PageController;

	initialControlStatesMapper: Record<string, unknown> = {};

	controlsVariantIdUnavailable: string[] = [];

	invalidateInitialStateForApply: string[] = [];

	viewStateControls: ManagedObject[] = [];

	/**
	 * Constructor.
	 */
	constructor() {
		super();
		this._iRetrievingStateCounter = 0;
		this._pInitialStateApplied = new Promise((resolve) => {
			this._pInitialStateAppliedResolve = resolve;
		});
	}

	@publicExtension()
	@finalExtension()
	async refreshViewBindings() {
		const aControls = await this.collectResults(this.base.viewState.adaptBindingRefreshControls);
		let oPromiseChain = Promise.resolve();
		aControls
			.filter((oControl: any) => {
				return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
			})
			.forEach((oControl: any) => {
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
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	adaptBindingRefreshControls(aCollectedControls: ManagedObject[]) {
		// to be overriden
	}

	@privateExtension()
	@finalExtension()
	refreshControlBinding(oControl: any) {
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
	 */

	@privateExtension()
	@finalExtension()
	getControlRefreshBindingHandler(oControl: any): any {
		const oRefreshBindingHandler: any = {};
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
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	adaptBindingRefreshHandler(oControl: ManagedObject, oControlHandler: any[]) {
		// to be overriden
	}

	/**
	 * Called when the application is suspended due to keep-alive mode.
	 *
	 * @alias sap.fe.core.controllerextensions.ViewState#onSuspend
	 * @public
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	onSuspend() {
		// to be overriden
	}

	/**
	 * Called when the application is restored due to keep-alive mode.
	 *
	 * @alias sap.fe.core.controllerextensions.ViewState#onRestore
	 * @public
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	onRestore() {
		// to be overriden
	}

	/**
	 * Destructor method for objects.
	 */
	destroy() {
		delete this._pInitialStateAppliedResolve;
		super.destroy();
	}

	/**
	 * Helper function to enable multi override. It is adding an additional parameter (array) to the provided
	 * function (and its parameters), that will be evaluated via <code>Promise.all</code>.
	 *
	 * @param fnCall The function to be called
	 * @param args
	 * @returns A promise to be resolved with the result of all overrides
	 */
	@privateExtension()
	@finalExtension()
	collectResults(fnCall: Function, ...args: any[]) {
		const aResults: any[] = [];
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
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	adaptControlStateHandler(oControl: ManagedObject, aControlHandler: object[]) {
		// to be overridden if needed
	}

	/**
	 * Returns a map of <code>retrieve</code> and <code>apply</code> functions for a certain control.
	 *
	 * @param oControl The control to get state handler for
	 * @returns A plain object with two functions: <code>retrieve</code> and <code>apply</code>
	 */
	@privateExtension()
	@finalExtension()
	getControlStateHandler(oControl: any) {
		const aInternalControlStateHandler = [],
			aCustomControlStateHandler: any[] = [];
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
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	adaptStateControls(aCollectedControls: ManagedObject[]) {
		// to be overridden if needed
	}

	/**
	 * Returns the key to be used for given control.
	 *
	 * @param oControl The control to get state key for
	 * @returns The key to be used for storing the controls state
	 */
	@publicExtension()
	@finalExtension()
	getStateKey(oControl: any) {
		return this.getView().getLocalId(oControl.getId()) || oControl.getId();
	}

	/**
	 * Retrieve the view state of this extensions view.
	 * When this function is called more than once before finishing, all but the final response will resolve to <code>undefined</code>.
	 *
	 * @returns A promise resolving the view state
	 * @alias sap.fe.core.controllerextensions.ViewState#retrieveViewState
	 * @public
	 */
	@publicExtension()
	@finalExtension()
	async retrieveViewState() {
		++this._iRetrievingStateCounter;
		let oViewState: any;

		try {
			await this._pInitialStateApplied;
			const aControls: (ManagedObject | undefined)[] = await this.collectResults(this.base.viewState.adaptStateControls);
			const aResolvedStates = await Promise.all(
				aControls
					.filter(function (oControl: any) {
						return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
					})
					.map((oControl: any) => {
						return this.retrieveControlState(oControl).then((vResult: any) => {
							return {
								key: this.getStateKey(oControl),
								value: vResult
							};
						});
					})
			);
			oViewState = aResolvedStates.reduce(function (oStates: any, mState: any) {
				const oCurrentState: any = {};
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
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	retrieveAdditionalStates(mAdditionalStates: object) {
		// to be overridden if needed
	}

	/**
	 * Returns a map of additional states (not control bound) to be added to the current view state of the given view.
	 *
	 * @returns Additional view states
	 */
	_retrieveAdditionalStates() {
		const mAdditionalStates = {};
		this.base.viewState.retrieveAdditionalStates(mAdditionalStates);
		return mAdditionalStates;
	}

	/**
	 * Returns the current state for the given control.
	 *
	 * @param oControl The object to get the state for
	 * @returns The state for the given control
	 */
	@privateExtension()
	@finalExtension()
	retrieveControlState(oControl: any) {
		const aControlStateHandlers = this.getControlStateHandler(oControl);
		return Promise.all(
			aControlStateHandlers.map((mControlStateHandler: any) => {
				if (typeof mControlStateHandler.retrieve !== "function") {
					throw new Error(`controlStateHandler.retrieve is not a function for control: ${oControl.getMetadata().getName()}`);
				}
				return mControlStateHandler.retrieve.call(this, oControl);
			})
		).then((aStates: any[]) => {
			return aStates.reduce(function (oFinalState: any, oCurrentState: any) {
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
	 */
	@publicExtension()
	@extensible(OverrideExecution.Instead)
	applyInitialStateOnly() {
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
	 */
	@publicExtension()
	@finalExtension()
	async applyViewState(oViewState: any, oNavParameter: NavigationParameter): Promise<any> {
		if (this.base.viewState.applyInitialStateOnly() && this._getInitialStateApplied()) {
			return;
		}

		try {
			await this.collectResults(this.base.viewState.onBeforeStateApplied);
			const aControls: ManagedObject[] = await this.collectResults(this.base.viewState.adaptStateControls);
			this.viewStateControls = aControls;
			let oPromiseChain = Promise.resolve();
			let hasVariantManagement = false;
			/**
			 * this ensures that variantManagement control is applied first to calculate initial state for delta logic
			 */
			const sortedAdaptStateControls = aControls.reduce((modifiedControls: ManagedObject[], control) => {
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

			sortedAdaptStateControls
				.filter(function (oControl) {
					return oControl.isA("sap.ui.base.ManagedObject");
				})
				.forEach((oControl) => {
					const sKey = this.getStateKey(oControl);
					oPromiseChain = oPromiseChain.then(
						this.applyControlState.bind(this, oControl, oViewState ? oViewState[sKey] : undefined, oNavParameter)
					);
				});

			await oPromiseChain;
			if (oNavParameter.navigationType === NavType.iAppState) {
				await this.collectResults(
					this.base.viewState.applyAdditionalStates,
					oViewState ? oViewState[ADDITIONAL_STATES_KEY] : undefined
				);
			} else {
				await this.collectResults(this.base.viewState.applyNavigationParameters, oNavParameter);
				await this.collectResults(this.base.viewState._applyNavigationParametersToFilterbar, oNavParameter);
			}
		} finally {
			try {
				await this.collectResults(this.base.viewState.onAfterStateApplied);
				this._setInitialStateApplied();
			} catch (e: any) {
				Log.error(e);
			}
		}
	}

	@privateExtension()
	_checkIfVariantIdIsAvailable(oVM: any, sVariantId: any) {
		const aVariants = oVM.getVariants();
		let bIsControlStateVariantAvailable = false;
		aVariants.forEach(function (oVariant: any) {
			if (oVariant.key === sVariantId) {
				bIsControlStateVariantAvailable = true;
			}
		});
		return bIsControlStateVariantAvailable;
	}

	_setInitialStateApplied() {
		if (this._pInitialStateAppliedResolve) {
			const pInitialStateAppliedResolve = this._pInitialStateAppliedResolve;
			delete this._pInitialStateAppliedResolve;
			pInitialStateAppliedResolve();
		}
	}

	_getInitialStateApplied() {
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
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onBeforeStateApplied(aPromises: Promise<any>) {
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
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onAfterStateApplied(aPromises: Promise<any>) {
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
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	applyAdditionalStates(oViewState: object, aPromises: Promise<any>) {
		// to be overridden if needed
	}

	@privateExtension()
	_applyNavigationParametersToFilterbar(
		_oNavParameter: {
			navigationType: any;
			selectionVariant?: object | undefined;
			selectionVariantDefaults?: object | undefined;
			requiresStandardVariant?: boolean | undefined;
		},
		_aPromises: Promise<any>
	) {
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
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	applyNavigationParameters(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		oNavParameter: {
			navigationType: any;
			selectionVariant?: object | undefined;
			selectionVariantDefaults?: object | undefined;
			requiresStandardVariant?: boolean | undefined;
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		aPromises: Promise<any>
	) {
		// to be overridden if needed
	}

	/**
	 * Applying the given state to the given control.
	 *
	 * @param oControl The object to apply the given state
	 * @param oControlState The state for the given control
	 * @param [oNavParameters] The current navigation parameters
	 * @returns Return a promise for async state handling
	 */
	@privateExtension()
	@finalExtension()
	applyControlState(oControl: any, oControlState: object, oNavParameters?: object) {
		const aControlStateHandlers = this.getControlStateHandler(oControl);
		let oPromiseChain = Promise.resolve();
		aControlStateHandlers.forEach((mControlStateHandler: any) => {
			if (typeof mControlStateHandler.apply !== "function") {
				throw new Error(`controlStateHandler.apply is not a function for control: ${oControl.getMetadata().getName()}`);
			}
			oPromiseChain = oPromiseChain.then(mControlStateHandler.apply.bind(this, oControl, oControlState, oNavParameters));
		});
		return oPromiseChain;
	}

	getInterface() {
		return this;
	}

	// method to get the control state for mdc controls applying the delta logic
	_getControlState(controlStateKey: string, controlState: ControlState) {
		const initialControlStatesMapper = this.initialControlStatesMapper;
		if (Object.keys(initialControlStatesMapper).length > 0 && initialControlStatesMapper[controlStateKey]) {
			if (Object.keys(initialControlStatesMapper[controlStateKey] as object).length === 0) {
				initialControlStatesMapper[controlStateKey] = { ...controlState };
			}
			return { fullState: controlState, initialState: initialControlStatesMapper[controlStateKey] };
		}
		return controlState;
	}

	//method to store the initial states for delta computation of mdc controls
	_setInitialStatesForDeltaCompute = async (variantManagement?: VariantManagement) => {
		try {
			const adaptControls = this.viewStateControls;

			const externalStatePromises: Promise<object>[] = [];
			const controlStateKey: string[] = [];
			let initialControlStates: object[] = [];
			const variantControls: string[] = variantManagement?.getFor() ?? [];

			adaptControls
				.filter(function (control) {
					return (
						control &&
						(!variantManagement || variantControls.indexOf(control.getId()) > -1) &&
						(control.isA("sap.ui.mdc.Table") ||
							(control as BaseObject).isA("sap.ui.mdc.FilterBar") ||
							(control as BaseObject).isA("sap.ui.mdc.Chart"))
					);
				})
				.forEach((control) => {
					if (variantManagement) {
						this._addEventListenersToVariantManagement(variantManagement, variantControls);
					}

					const externalStatePromise = StateUtil.retrieveExternalState(control as object);
					externalStatePromises.push(externalStatePromise);
					controlStateKey.push(this.getStateKey(control));
				});

			initialControlStates = await Promise.all(externalStatePromises);
			initialControlStates.forEach((initialControlState: object, i: number) => {
				this.initialControlStatesMapper[controlStateKey[i]] = initialControlState;
			});
		} catch (e: unknown) {
			Log.error(e as string);
		}
	};

	// Attach event to save and select of Variant Management to update the initial Control States on variant change
	_addEventListenersToVariantManagement(variantManagement: VariantManagement, variantControls: string[]) {
		const oPayload = { variantManagedControls: variantControls };
		const fnEvent = () => {
			this._updateInitialStatesOnVariantChange(variantControls);
		};
		variantManagement.attachSave(oPayload, fnEvent, {});
		variantManagement.attachSelect(oPayload, fnEvent, {});
	}

	_updateInitialStatesOnVariantChange(vmAssociatedControlsToReset: string[]) {
		const initialControlStatesMapper = this.initialControlStatesMapper;
		Object.keys(initialControlStatesMapper).forEach((controlKey) => {
			for (const vmAssociatedcontrolKey of vmAssociatedControlsToReset) {
				if (vmAssociatedcontrolKey.indexOf(controlKey) > -1) {
					initialControlStatesMapper[controlKey] = {};
				}
			}
		});
	}
}

export default ViewState;
