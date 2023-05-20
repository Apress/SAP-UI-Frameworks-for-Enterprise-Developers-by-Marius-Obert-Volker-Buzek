import Log from "sap/base/Log";
import type FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import FlexibleColumnLayoutSemanticHelper from "sap/f/FlexibleColumnLayoutSemanticHelper";
import fLibrary from "sap/f/library";
import type AppComponent from "sap/fe/core/AppComponent";
import type RouterProxy from "sap/fe/core/controllerextensions/routing/RouterProxy";
import ViewState from "sap/fe/core/controllerextensions/ViewState";
import { defineUI5Class, usingExtension } from "sap/fe/core/helpers/ClassSupport";
import KeepAliveHelper from "sap/fe/core/helpers/KeepAliveHelper";
import Link from "sap/m/Link";
import MessageBox, { Action, Icon } from "sap/m/MessageBox";
import MessagePage from "sap/m/MessagePage";
import type Event from "sap/ui/base/Event";
import type Control from "sap/ui/core/Control";
import type XMLView from "sap/ui/core/mvc/XMLView";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/odata/v4/Context";
import PageController from "../PageController";
import BaseController from "./RootViewBaseController";

const LayoutType = fLibrary.LayoutType;

const CONSTANTS = {
	page: {
		names: ["BeginColumn", "MidColumn", "EndColumn"],
		currentGetter: {
			prefix: "getCurrent",
			suffix: "Page"
		},
		getter: {
			prefix: "get",
			suffix: "Pages"
		}
	}
};
const _getViewFromContainer = function (oContainer: any) {
	if (oContainer.isA("sap.ui.core.ComponentContainer")) {
		return oContainer.getComponentInstance().getRootControl();
	} else {
		return oContainer;
	}
};
/**
 * Base controller class for your own root view with an sap.f.FlexibleColumnLayout control.
 *
 * By using or extending this controller, you can use your own root view with the sap.fe.core.AppComponent and
 * you can make use of SAP Fiori elements pages and SAP Fiori elements building blocks.
 *
 * @hideconstructor
 * @public
 * @since 1.110.0
 */
@defineUI5Class("sap.fe.core.rootView.Fcl")
class FclController extends BaseController {
	@usingExtension(
		ViewState.override({
			applyInitialStateOnly: function () {
				return false;
			},
			adaptBindingRefreshControls: function (this: ViewState, aControls: any) {
				(this.getView().getController() as FclController)._getAllVisibleViews().forEach(function (oChildView: any) {
					const pChildView = Promise.resolve(oChildView);
					aControls.push(pChildView);
				});
			},
			adaptStateControls: function (this: ViewState, aStateControls: any) {
				(this.getView().getController() as FclController)._getAllVisibleViews().forEach(function (oChildView: any) {
					const pChildView = Promise.resolve(oChildView);
					aStateControls.push(pChildView);
				});
			},
			onRestore: function (this: ViewState) {
				const fclController = this.getView().getController() as FclController;
				const appContentContainer = fclController.getAppContentContainer();
				const internalModel = appContentContainer.getModel("internal") as JSONModel;
				const pages = internalModel.getProperty("/pages");

				for (const componentId in pages) {
					internalModel.setProperty(`/pages/${componentId}/restoreStatus`, "pending");
				}
				fclController.onContainerReady();
			},
			onSuspend: function (this: ViewState) {
				const oFCLController = this.getView().getController() as FclController;
				const oFCLControl = oFCLController.getFclControl();
				const aBeginColumnPages: Control[] = oFCLControl.getBeginColumnPages() || [];
				const aMidColumnPages: Control[] = oFCLControl.getMidColumnPages() || [];
				const aEndColumnPages: Control[] = oFCLControl.getEndColumnPages() || [];
				const aPages = ([] as Control[]).concat(aBeginColumnPages, aMidColumnPages, aEndColumnPages);

				aPages.forEach(function (oPage: any) {
					const oTargetView = _getViewFromContainer(oPage);

					const oController = oTargetView && oTargetView.getController();
					if (oController && oController.viewState && oController.viewState.onSuspend) {
						oController.viewState.onSuspend();
					}
				});
			}
		})
	)
	viewState!: ViewState;

	protected _oRouterProxy!: RouterProxy;

	private sCurrentRouteName!: string;

	private sCurrentArguments?: any;

	private sPreviousLayout!: string;

	private SQUERYKEYNAME!: string;

	protected _oFCLConfig: any;

	private oAdditionalViewForNavRowsComputation: any;

	private _oTargetsAggregation: any;

	private _oTargetsFromRoutePattern: any;

	private aMessagePages?: any[];
	/**
	 * @private
	 * @name sap.fe.core.rootView.Fcl.getMetadata
	 * @function
	 */

	onInit() {
		super.onInit();

		this._internalInit();
	}

	manageDataReceived(event: Event) {
		if (event.getParameter("error")) {
			const path = event.getParameter("path"),
				targetedView = this._getAllVisibleViews().find((view) => view.getBindingContext()?.getPath() === path);
			// We need to manage error when the request is related to a form  into an ObjectPage
			if (path && (targetedView?.getBindingContext() as Context)?.isKeepAlive()) {
				(targetedView.getController() as PageController)._routing.onDataReceived(event);
			}
		}
	}

	attachRouteMatchers() {
		this.getRouter().attachBeforeRouteMatched(this._getViewForNavigatedRowsComputation, this);
		super.attachRouteMatchers();
		this._internalInit();

		this.getRouter().attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
		this.getRouter().attachRouteMatched(this.onRouteMatched, this);
		this.getFclControl().attachStateChange(this._saveLayout, this);
	}

	_internalInit() {
		if (this._oRouterProxy) {
			return; // Already initialized
		}

		this.sCurrentRouteName = "";
		this.sCurrentArguments = {};
		this.SQUERYKEYNAME = "?query";

		const oAppComponent = this.getAppComponent();

		const oDataModel = this.getAppComponent().getModel();
		oDataModel?.attachEvent("dataReceived", this.manageDataReceived.bind(this));

		this._oRouterProxy = oAppComponent.getRouterProxy();

		// Get FCL configuration in the manifest
		this._oFCLConfig = { maxColumnsCount: 3 };
		const oRoutingConfig = (oAppComponent.getManifest() as any)["sap.ui5"].routing;

		if (oRoutingConfig?.config?.flexibleColumnLayout) {
			const oFCLManifestConfig = oRoutingConfig.config.flexibleColumnLayout;

			// Default layout for 2 columns
			if (oFCLManifestConfig.defaultTwoColumnLayoutType) {
				this._oFCLConfig.defaultTwoColumnLayoutType = oFCLManifestConfig.defaultTwoColumnLayoutType;
			}

			// Default layout for 3 columns
			if (oFCLManifestConfig.defaultThreeColumnLayoutType) {
				this._oFCLConfig.defaultThreeColumnLayoutType = oFCLManifestConfig.defaultThreeColumnLayoutType;
			}

			// Limit FCL to 2 columns ?
			if (oFCLManifestConfig.limitFCLToTwoColumns === true) {
				this._oFCLConfig.maxColumnsCount = 2;
			}
		}
		if (oRoutingConfig?.config?.controlAggregation) {
			this._oFCLConfig.defaultControlAggregation = oRoutingConfig.config.controlAggregation;
		}

		this._initializeTargetAggregation(oAppComponent);
		this._initializeRoutesInformation(oAppComponent);

		this.getFclControl().attachStateChange(this.onStateChanged, this);
		this.getFclControl().attachAfterEndColumnNavigate(this.onStateChanged, this);
	}

	getFclControl() {
		return this.getAppContentContainer() as FlexibleColumnLayout;
	}

	_saveLayout(oEvent: any) {
		this.sPreviousLayout = oEvent.getParameters().layout;
	}

	/**
	 * Get the additional view (on top of the visible views), to be able to compute the latest table navigated rows of
	 * the most right visible view after a nav back or column fullscreen.
	 *
	 * @function
	 * @name sap.fe.core.rootView.Fcl.controller#_getRightMostViewBeforeRouteMatched
	 * @memberof sap.fe.core.rootView.Fcl.controller
	 */

	_getViewForNavigatedRowsComputation() {
		const aAllVisibleViewsBeforeRouteMatched = this._getAllVisibleViews(this.sPreviousLayout);
		const oRightMostViewBeforeRouteMatched = aAllVisibleViewsBeforeRouteMatched[aAllVisibleViewsBeforeRouteMatched.length - 1];
		let oRightMostView;
		this.getRouter().attachEventOnce("routeMatched", (oEvent: any) => {
			oRightMostView = _getViewFromContainer(oEvent.getParameter("views")[oEvent.getParameter("views").length - 1]);
			if (oRightMostViewBeforeRouteMatched) {
				// Navigation forward from L2 to view level L3 (FullScreenLayout):
				if (oRightMostView.getViewData() && oRightMostView.getViewData().viewLevel === this._oFCLConfig.maxColumnsCount) {
					this.oAdditionalViewForNavRowsComputation = oRightMostView;
				}
				// Navigations backward from L3 down to L2, L1, L0 (ThreeColumn layout):
				if (
					oRightMostView.getViewData() &&
					oRightMostViewBeforeRouteMatched.getViewData() &&
					oRightMostViewBeforeRouteMatched.getViewData().viewLevel < this._oFCLConfig.maxColumnsCount &&
					oRightMostViewBeforeRouteMatched.getViewData() &&
					oRightMostViewBeforeRouteMatched.getViewData().viewLevel > oRightMostView.getViewData().viewLevel &&
					oRightMostView !== oRightMostViewBeforeRouteMatched
				) {
					this.oAdditionalViewForNavRowsComputation = oRightMostViewBeforeRouteMatched;
				}
			}
		});
	}

	getViewForNavigatedRowsComputation() {
		return this.oAdditionalViewForNavRowsComputation;
	}

	onExit() {
		this.getRouter().detachRouteMatched(this.onRouteMatched, this);
		this.getRouter().detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
		this.getFclControl().detachStateChange(this.onStateChanged, this);
		this.getFclControl().detachAfterEndColumnNavigate(this.onStateChanged, this);
		this._oTargetsAggregation = null;
		this._oTargetsFromRoutePattern = null;

		BaseController.prototype.onExit.bind(this)();
	}

	/**
	 * Check if the FCL component is enabled.
	 *
	 * @function
	 * @name sap.fe.core.rootView.Fcl.controller#isFclEnabled
	 * @memberof sap.fe.core.rootView.Fcl.controller
	 * @returns `true` since we are in FCL scenario
	 * @ui5-restricted
	 * @final
	 */
	isFclEnabled() {
		return true;
	}

	/**
	 * Method that creates a new Page to display the IllustratedMessage containing the current error.
	 *
	 * @param sErrorMessage
	 * @param mParameters
	 * @alias sap.fe.core.rootView.Fcl.controller#displayErrorPage
	 * @returns A promise that creates a Page to display the error
	 * @public
	 */
	displayErrorPage(sErrorMessage: any, mParameters: any): Promise<boolean> {
		const oFCLControl = this.getFclControl();

		if (this._oFCLConfig && mParameters.FCLLevel >= this._oFCLConfig.maxColumnsCount) {
			mParameters.FCLLevel = this._oFCLConfig.maxColumnsCount - 1;
		}

		if (!this.aMessagePages) {
			this.aMessagePages = [null, null, null];
		}
		let oMessagePage = this.aMessagePages[mParameters.FCLLevel];
		if (!oMessagePage) {
			oMessagePage = new MessagePage({
				showHeader: false,
				icon: "sap-icon://message-error"
			});
			this.aMessagePages[mParameters.FCLLevel] = oMessagePage;

			switch (mParameters.FCLLevel) {
				case 0:
					oFCLControl.addBeginColumnPage(oMessagePage);
					break;

				case 1:
					oFCLControl.addMidColumnPage(oMessagePage);
					break;

				default:
					oFCLControl.addEndColumnPage(oMessagePage);
			}
		}

		oMessagePage.setText(sErrorMessage);

		if (mParameters.technicalMessage) {
			oMessagePage.setCustomDescription(
				new Link({
					text: mParameters.description || mParameters.technicalMessage,
					press: function () {
						MessageBox.show(mParameters.technicalMessage, {
							icon: Icon.ERROR,
							title: mParameters.title,
							actions: [Action.OK],
							defaultAction: Action.OK,
							details: mParameters.technicalDetails || "",
							contentWidth: "60%"
						} as any);
					}
				})
			);
		} else {
			oMessagePage.setDescription(mParameters.description || "");
		}

		(oFCLControl as any).to(oMessagePage.getId());
		return Promise.resolve(true);
	}

	/**
	 * Initialize the object _oTargetsAggregation that defines for each route the relevant aggregation and pattern.
	 *
	 * @name sap.fe.core.rootView.Fcl.controller#_initializeTargetAggregation
	 * @memberof sap.fe.core.rootView.Fcl.controller
	 * @function
	 * @param [oAppComponent] Reference to the AppComponent
	 */
	_initializeTargetAggregation(oAppComponent: AppComponent) {
		const oManifest = oAppComponent.getManifest() as any,
			oTargets = oManifest["sap.ui5"].routing ? oManifest["sap.ui5"].routing.targets : null;

		this._oTargetsAggregation = {};

		if (oTargets) {
			Object.keys(oTargets).forEach((sTargetName: string) => {
				const oTarget = oTargets[sTargetName];
				if (oTarget.controlAggregation) {
					this._oTargetsAggregation[sTargetName] = {
						aggregation: oTarget.controlAggregation,
						pattern: oTarget.contextPattern
					};
				} else {
					this._oTargetsAggregation[sTargetName] = {
						aggregation: "page",
						pattern: null
					};
				}
			});
		}
	}

	/**
	 * Initializes the mapping between a route (identifed as its pattern) and the corresponding targets
	 *
	 * @name sap.fe.core.rootView.Fcl.controller#_initializeRoutesInformation
	 * @memberof sap.fe.core.rootView.Fcl.controller
	 * @function
	 * @param oAppComponent ref to the AppComponent
	 */

	_initializeRoutesInformation(oAppComponent: AppComponent) {
		const oManifest = oAppComponent.getManifest() as any,
			aRoutes = oManifest["sap.ui5"].routing ? oManifest["sap.ui5"].routing.routes : null;

		this._oTargetsFromRoutePattern = {};

		if (aRoutes) {
			aRoutes.forEach((route: any) => {
				this._oTargetsFromRoutePattern[route.pattern] = route.target;
			});
		}
	}

	getCurrentArgument() {
		return this.sCurrentArguments;
	}

	getCurrentRouteName() {
		return this.sCurrentRouteName;
	}

	/**
	 * Get FE FCL constant.
	 *
	 * @memberof sap.fe.core.rootView.Fcl.controller
	 * @returns The constants
	 */
	getConstants() {
		return CONSTANTS;
	}

	/**
	 * Getter for oTargetsAggregation array.
	 *
	 * @name sap.fe.core.rootView.Fcl.controller#getTargetAggregation
	 * @memberof sap.fe.core.rootView.Fcl.controller
	 * @function
	 * @returns The _oTargetsAggregation array
	 * @ui5-restricted
	 */
	getTargetAggregation() {
		return this._oTargetsAggregation;
	}

	/**
	 * Function triggered by the router RouteMatched event.
	 *
	 * @name sap.fe.core.rootView.Fcl.controller#onRouteMatched
	 * @memberof sap.fe.core.rootView.Fcl.controller
	 * @param oEvent
	 */
	onRouteMatched(oEvent: any) {
		const sRouteName = oEvent.getParameter("name");

		// Save the current/previous routes and arguments
		this.sCurrentRouteName = sRouteName;
		this.sCurrentArguments = oEvent.getParameter("arguments");
	}

	/**
	 * This function is triggering the table scroll to the navigated row after each layout change.
	 *
	 * @name sap.fe.core.rootView.Fcl.controller#scrollToLastSelectedItem
	 * @memberof sap.fe.core.rootView.Fcl.controller
	 */

	_scrollTablesToLastNavigatedItems() {
		const aViews = this._getAllVisibleViews();
		//The scrolls are triggered only if the layout is with several columns or when switching the mostRight column in full screen
		if (aViews.length > 1 || aViews[0].getViewData().viewLevel < this._oFCLConfig.maxColumnsCount) {
			let sCurrentViewPath;
			const oAdditionalView = this.getViewForNavigatedRowsComputation();
			if (oAdditionalView && aViews.indexOf(oAdditionalView) === -1) {
				aViews.push(oAdditionalView);
			}
			for (let index = aViews.length - 1; index > 0; index--) {
				const oView = aViews[index],
					oPreviousView = aViews[index - 1];
				if (oView.getBindingContext()) {
					sCurrentViewPath = oView.getBindingContext().getPath();
					oPreviousView.getController()._scrollTablesToRow(sCurrentViewPath);
				}
			}
		}
	}

	/**
	 * Function triggered by the FCL StateChanged event.
	 *
	 * @name sap.fe.core.rootView.Fcl.controller#onStateChanged
	 * @memberof sap.fe.core.rootView.Fcl.controller
	 * @param oEvent
	 */
	onStateChanged(oEvent: any) {
		const bIsNavigationArrow = oEvent.getParameter("isNavigationArrow");
		if (this.sCurrentArguments !== undefined) {
			if (!this.sCurrentArguments[this.SQUERYKEYNAME]) {
				this.sCurrentArguments[this.SQUERYKEYNAME] = {};
			}
			this.sCurrentArguments[this.SQUERYKEYNAME].layout = oEvent.getParameter("layout");
		}
		this._forceModelContextChangeOnBreadCrumbs(oEvent);

		// Replace the URL with the new layout if a navigation arrow was used
		if (bIsNavigationArrow) {
			this._oRouterProxy.navTo(this.sCurrentRouteName, this.sCurrentArguments);
		}

		const oView = this.getRightmostView();
		if (oView) {
			this._computeTitleHierarchy(oView);
		}
	}

	/**
	 * Function to fire ModelContextChange event on all breadcrumbs ( on each ObjectPages).
	 *
	 * @name sap.fe.core.rootView.Fcl.controller#_forceModelContextChangeOnBreadCrumbs
	 * @memberof sap.fe.core.rootView.Fcl.controller
	 * @param oEvent
	 */
	_forceModelContextChangeOnBreadCrumbs(oEvent: any) {
		//force modelcontextchange on ObjectPages to refresh the breadcrumbs link hrefs
		const oFcl = oEvent.getSource();
		let oPages: any[] = [];
		oPages = oPages.concat(oFcl.getBeginColumnPages()).concat(oFcl.getMidColumnPages()).concat(oFcl.getEndColumnPages());
		oPages.forEach(function (oPage: any) {
			const oView = _getViewFromContainer(oPage);
			const oBreadCrumbs = oView.byId && oView.byId("breadcrumbs");
			if (oBreadCrumbs) {
				oBreadCrumbs.fireModelContextChange();
			}
		});
	}

	/**
	 * Function triggered to update the Share button Visibility.
	 *
	 * @memberof sap.fe.core.rootView.Fcl.controller
	 * @param viewColumn Name of the current column ("beginColumn", "midColumn", "endColumn")
	 * @param sLayout The current layout used by the FCL
	 * @returns The share button visibility
	 */
	_updateShareButtonVisibility(viewColumn: string, sLayout: string) {
		let bShowShareIcon;
		switch (sLayout) {
			case "OneColumn":
				bShowShareIcon = viewColumn === "beginColumn";
				break;
			case "MidColumnFullScreen":
			case "ThreeColumnsBeginExpandedEndHidden":
			case "ThreeColumnsMidExpandedEndHidden":
			case "TwoColumnsBeginExpanded":
			case "TwoColumnsMidExpanded":
				bShowShareIcon = viewColumn === "midColumn";
				break;
			case "EndColumnFullScreen":
			case "ThreeColumnsEndExpanded":
			case "ThreeColumnsMidExpanded":
				bShowShareIcon = viewColumn === "endColumn";
				break;
			default:
				bShowShareIcon = false;
		}
		return bShowShareIcon;
	}

	_updateEditButtonVisiblity(viewColumn: string, sLayout: string) {
		let bEditButtonVisible = true;
		switch (viewColumn) {
			case "midColumn":
				switch (sLayout) {
					case "TwoColumnsMidExpanded":
					case "ThreeColumnsMidExpanded":
					case "ThreeColumnsEndExpanded":
						bEditButtonVisible = false;
						break;
				}
				break;
			case "endColumn":
				switch (sLayout) {
					case "ThreeColumnsMidExpanded":
					case "ThreeColumnsEndExpanded":
						bEditButtonVisible = false;
				}
				break;
		}
		return bEditButtonVisible;
	}

	updateUIStateForView(oView: any, FCLLevel: any) {
		const oUIState = this.getHelper().getCurrentUIState() as any,
			oFclColName = ["beginColumn", "midColumn", "endColumn"],
			sLayout = this.getFclControl().getLayout();
		let viewColumn;

		if (!oView.getModel("fclhelper")) {
			oView.setModel(this._createHelperModel(), "fclhelper");
		}
		if (FCLLevel >= this._oFCLConfig.maxColumnsCount) {
			// The view is on a level > max number of columns. It's always fullscreen without close/exit buttons
			viewColumn = oFclColName[this._oFCLConfig.maxColumnsCount - 1];
			oUIState.actionButtonsInfo.midColumn.fullScreen = null;
			oUIState.actionButtonsInfo.midColumn.exitFullScreen = null;
			oUIState.actionButtonsInfo.midColumn.closeColumn = null;
			oUIState.actionButtonsInfo.endColumn.exitFullScreen = null;
			oUIState.actionButtonsInfo.endColumn.fullScreen = null;
			oUIState.actionButtonsInfo.endColumn.closeColumn = null;
		} else {
			viewColumn = oFclColName[FCLLevel];
		}

		if (
			FCLLevel >= this._oFCLConfig.maxColumnsCount ||
			sLayout === "EndColumnFullScreen" ||
			sLayout === "MidColumnFullScreen" ||
			sLayout === "OneColumn"
		) {
			oView.getModel("fclhelper").setProperty("/breadCrumbIsVisible", true);
		} else {
			oView.getModel("fclhelper").setProperty("/breadCrumbIsVisible", false);
		}
		// Unfortunately, the FCLHelper doesn't provide actionButton values for the first column
		// so we have to add this info manually
		oUIState.actionButtonsInfo.beginColumn = { fullScreen: null, exitFullScreen: null, closeColumn: null };

		const oActionButtonInfos = Object.assign({}, oUIState.actionButtonsInfo[viewColumn]);
		oActionButtonInfos.switchVisible = oActionButtonInfos.fullScreen !== null || oActionButtonInfos.exitFullScreen !== null;
		oActionButtonInfos.switchIcon = oActionButtonInfos.fullScreen !== null ? "sap-icon://full-screen" : "sap-icon://exit-full-screen";
		oActionButtonInfos.isFullScreen = oActionButtonInfos.fullScreen === null;
		oActionButtonInfos.closeVisible = oActionButtonInfos.closeColumn !== null;

		oView.getModel("fclhelper").setProperty("/actionButtonsInfo", oActionButtonInfos);

		oView.getModel("fclhelper").setProperty("/showEditButton", this._updateEditButtonVisiblity(viewColumn, sLayout));

		oView.getModel("fclhelper").setProperty("/showShareIcon", this._updateShareButtonVisibility(viewColumn, sLayout));
	}

	/**
	 * Function triggered by the router BeforeRouteMatched event.
	 *
	 * @name sap.fe.core.rootView.Fcl.controller#onBeforeRouteMatched
	 * @memberof sap.fe.core.rootView.Fcl.controller
	 * @param oEvent
	 */
	onBeforeRouteMatched(oEvent: any) {
		if (oEvent) {
			const oQueryParams = oEvent.getParameters().arguments[this.SQUERYKEYNAME];
			let sLayout = oQueryParams ? oQueryParams.layout : null;

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				const oNextUIState = this.getHelper().getNextUIState(0);
				sLayout = oNextUIState.layout;
			}

			// Check if the layout if compatible with the number of targets
			// This should always be the case for normal navigation, just needed in case
			// the URL has been manually modified
			const aTargets = oEvent.getParameter("config").target;
			sLayout = this._correctLayoutForTargets(sLayout, aTargets);

			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				this.getFclControl().setLayout(sLayout);
			}
		}
	}

	/**
	 * Helper for the FCL Component.
	 *
	 * @name sap.fe.core.rootView.Fcl.controller#getHelper
	 * @memberof sap.fe.core.rootView.Fcl.controller
	 * @returns Instance of a semantic helper
	 */
	getHelper() {
		return FlexibleColumnLayoutSemanticHelper.getInstanceFor(this.getFclControl(), this._oFCLConfig);
	}

	/**
	 * Calculates the FCL layout for a given FCL level and a target hash.
	 *
	 * @param iNextFCLLevel FCL level to be navigated to
	 * @param sHash The hash to be navigated to
	 * @param sProposedLayout The proposed layout
	 * @param keepCurrentLayout True if we want to keep the current layout if possible
	 * @returns The calculated layout
	 */
	calculateLayout(iNextFCLLevel: number, sHash: string, sProposedLayout: string | undefined, keepCurrentLayout = false) {
		// First, ask the FCL helper to calculate the layout if nothing is proposed
		if (!sProposedLayout) {
			sProposedLayout = keepCurrentLayout ? this.getFclControl().getLayout() : this.getHelper().getNextUIState(iNextFCLLevel).layout;
		}

		// Then change this value if necessary, based on the number of targets
		const oRoute = (this.getRouter() as any).getRouteByHash(`${sHash}?layout=${sProposedLayout}`);
		const aTargets = this._oTargetsFromRoutePattern[oRoute.getPattern()];

		return this._correctLayoutForTargets(sProposedLayout, aTargets);
	}

	/**
	 * Checks whether a given FCL layout is compatible with an array of targets.
	 *
	 * @param sProposedLayout Proposed value for the FCL layout
	 * @param aTargets Array of target names used for checking
	 * @returns The corrected layout
	 */
	_correctLayoutForTargets(sProposedLayout: any, aTargets: any) {
		const allAllowedLayouts: any = {
			"2": ["TwoColumnsMidExpanded", "TwoColumnsBeginExpanded", "MidColumnFullScreen"],
			"3": [
				"ThreeColumnsMidExpanded",
				"ThreeColumnsEndExpanded",
				"ThreeColumnsMidExpandedEndHidden",
				"ThreeColumnsBeginExpandedEndHidden",
				"MidColumnFullScreen",
				"EndColumnFullScreen"
			]
		};

		if (aTargets && !Array.isArray(aTargets)) {
			// To support single target as a string in the manifest
			aTargets = [aTargets];
		}

		if (!aTargets) {
			// Defensive, just in case...
			return sProposedLayout;
		} else if (aTargets.length > 1) {
			// More than 1 target: just simply check from the allowed values
			const aLayouts = allAllowedLayouts[aTargets.length];
			if (aLayouts.indexOf(sProposedLayout) < 0) {
				// The proposed layout isn't compatible with the number of columns
				// --> Ask the helper for the default layout for the number of columns
				sProposedLayout = aLayouts[0];
			}
		} else {
			// Only one target
			const sTargetAggregation = this.getTargetAggregation()[aTargets[0]].aggregation || this._oFCLConfig.defaultControlAggregation;
			switch (sTargetAggregation) {
				case "beginColumnPages":
					sProposedLayout = "OneColumn";
					break;
				case "midColumnPages":
					sProposedLayout = "MidColumnFullScreen";
					break;
				case "endColumnPages":
					sProposedLayout = "EndColumnFullScreen";
					break;
				// no default
			}
		}

		return sProposedLayout;
	}

	/**
	 * Gets the instanced views in the FCL component.
	 *
	 * @returns {Array} Return the views.
	 */
	getInstancedViews(): XMLView[] {
		const fclControl = this.getFclControl();
		const componentContainers: Control[] = [
			...fclControl.getBeginColumnPages(),
			...fclControl.getMidColumnPages(),
			...fclControl.getEndColumnPages()
		];
		return componentContainers.map((oPage) => (oPage as any).getComponentInstance().getRootControl());
	}

	/**
	 * get all visible views in the FCL component.
	 * sLayout optional parameter is very specific as part of the calculation of the latest navigated row
	 *
	 * @param {*} sLayout Layout that was applied just before the current navigation
	 * @returns {Array} return views
	 */

	_getAllVisibleViews(sLayout?: any) {
		const aViews = [];
		sLayout = sLayout ? sLayout : this.getFclControl().getLayout();
		switch (sLayout) {
			case LayoutType.EndColumnFullScreen:
				if (this.getFclControl().getCurrentEndColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
				}
				break;

			case LayoutType.MidColumnFullScreen:
				if (this.getFclControl().getCurrentMidColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
				}
				break;

			case LayoutType.OneColumn:
				if (this.getFclControl().getCurrentBeginColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
				}
				break;

			case LayoutType.ThreeColumnsEndExpanded:
			case LayoutType.ThreeColumnsMidExpanded:
				if (this.getFclControl().getCurrentBeginColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
				}
				if (this.getFclControl().getCurrentMidColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
				}
				if (this.getFclControl().getCurrentEndColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
				}
				break;

			case LayoutType.TwoColumnsBeginExpanded:
			case LayoutType.TwoColumnsMidExpanded:
			case LayoutType.ThreeColumnsMidExpandedEndHidden:
			case LayoutType.ThreeColumnsBeginExpandedEndHidden:
				if (this.getFclControl().getCurrentBeginColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
				}
				if (this.getFclControl().getCurrentMidColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
				}
				break;

			default:
				Log.error(`Unhandled switch case for ${this.getFclControl().getLayout()}`);
		}

		return aViews;
	}

	_getAllViews(sLayout?: any) {
		const aViews = [];
		sLayout = sLayout ? sLayout : this.getFclControl().getLayout();
		switch (sLayout) {
			case LayoutType.OneColumn:
				if (this.getFclControl().getCurrentBeginColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
				}
				break;
			case LayoutType.ThreeColumnsEndExpanded:
			case LayoutType.ThreeColumnsMidExpanded:
			case LayoutType.ThreeColumnsMidExpandedEndHidden:
			case LayoutType.ThreeColumnsBeginExpandedEndHidden:
			case LayoutType.EndColumnFullScreen:
				if (this.getFclControl().getCurrentBeginColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
				}
				if (this.getFclControl().getCurrentMidColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
				}
				if (this.getFclControl().getCurrentEndColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
				}
				break;

			case LayoutType.TwoColumnsBeginExpanded:
			case LayoutType.TwoColumnsMidExpanded:
				if (this.getFclControl().getCurrentBeginColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
				}
				if (this.getFclControl().getCurrentMidColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
				}
				break;

			case LayoutType.MidColumnFullScreen:
				// In this case we need to determine if this mid column fullscreen comes from a 2 or a 3 column layout
				const sLayoutWhenExitFullScreen = (this.getHelper().getCurrentUIState() as any).actionButtonsInfo.midColumn.exitFullScreen;
				if (this.getFclControl().getCurrentBeginColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
				}
				if (this.getFclControl().getCurrentMidColumnPage()) {
					aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
				}
				if (sLayoutWhenExitFullScreen.indexOf("ThreeColumn") >= 0) {
					// We come from a 3 column layout
					if (this.getFclControl().getCurrentEndColumnPage()) {
						aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
					}
				}
				break;

			default:
				Log.error(`Unhandled switch case for ${this.getFclControl().getLayout()}`);
		}
		return aViews;
	}

	onContainerReady() {
		// Restore views if neccessary.
		const aViews = this._getAllVisibleViews();
		const aRestorePromises: any[] = aViews.reduce(function (aPromises: any, oTargetView: any) {
			aPromises.push(KeepAliveHelper.restoreView(oTargetView));
			return aPromises;
		}, []);
		return Promise.all(aRestorePromises);
	}

	getRightmostContext(): Context | undefined {
		const oView = this.getRightmostView();
		return oView && oView.getBindingContext();
	}

	getRightmostView() {
		return this._getAllViews().pop();
	}

	isContextUsedInPages(oContext: Context): boolean {
		if (!this.getFclControl()) {
			return false;
		}
		const aAllVisibleViews = this._getAllViews();
		for (const view of aAllVisibleViews) {
			if (view) {
				if (view.getBindingContext() === oContext) {
					return true;
				}
			} else {
				// A view has been destroyed --> app is currently being destroyed
				return false;
			}
		}
		return false;
	}

	_setShellMenuTitle(oAppComponent: AppComponent, sTitle: string, sAppTitle: string): void {
		if (this.getHelper().getCurrentUIState().isFullScreen !== true) {
			oAppComponent.getShellServices().setTitle(sAppTitle);
		} else {
			oAppComponent.getShellServices().setTitle(sTitle);
		}
	}
}

export default FclController;
