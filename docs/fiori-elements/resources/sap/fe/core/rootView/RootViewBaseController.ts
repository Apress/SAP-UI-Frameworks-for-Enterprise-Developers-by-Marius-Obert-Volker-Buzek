import Log from "sap/base/Log";
import type FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import BaseController from "sap/fe/core/BaseController";
import CommonUtils from "sap/fe/core/CommonUtils";
import Placeholder from "sap/fe/core/controllerextensions/Placeholder";
import ViewState from "sap/fe/core/controllerextensions/ViewState";
import { defineUI5Class, usingExtension } from "sap/fe/core/helpers/ClassSupport";
import SizeHelper from "sap/fe/core/helpers/SizeHelper";
import type FclController from "sap/fe/core/rootView/Fcl.controller";
import type NavContainer from "sap/m/NavContainer";
import BindingParser from "sap/ui/base/BindingParser";
import type XMLView from "sap/ui/core/mvc/XMLView";
import HashChanger from "sap/ui/core/routing/HashChanger";
import type Router from "sap/ui/core/routing/Router";
import JSONModel from "sap/ui/model/json/JSONModel";
import AnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";
import type ResourceModel from "sap/ui/model/resource/ResourceModel";
import type AppComponent from "../AppComponent";

@defineUI5Class("sap.fe.core.rootView.RootViewBaseController")
class RootViewBaseController extends BaseController {
	@usingExtension(Placeholder)
	oPlaceholder!: Placeholder;

	@usingExtension(ViewState)
	viewState!: ViewState;

	private _aHelperModels!: any[];

	private oRouter?: Router;

	private _oRouteMatchedPromise: any;

	private oTitleHierarchyCache: any;

	private bIsComputingTitleHierachy = false;

	onInit() {
		SizeHelper.init();

		this._aHelperModels = [];
	}

	getPlaceholder() {
		return this.oPlaceholder;
	}

	attachRouteMatchers() {
		this.oPlaceholder.attachRouteMatchers();
		this.getAppComponent().getRoutingService().attachAfterRouteMatched(this._onAfterRouteMatched, this);
	}

	onExit() {
		this.getAppComponent().getRoutingService().detachAfterRouteMatched(this._onAfterRouteMatched, this);
		this.oRouter = undefined;

		SizeHelper.exit();

		// Destroy all JSON models created dynamically for the views
		this._aHelperModels.forEach(function (oModel: any) {
			oModel.destroy();
		});
	}

	/**
	 * Convenience method for getting the resource bundle.
	 *
	 * @public
	 * @returns The resourceModel of the component
	 */
	getResourceBundle() {
		return (this.getOwnerComponent().getModel("i18n") as ResourceModel).getResourceBundle();
	}

	getRouter() {
		if (!this.oRouter) {
			this.oRouter = this.getAppComponent().getRouter();
		}

		return this.oRouter;
	}

	_createHelperModel() {
		// We keep a reference on the models created dynamically, as they don't get destroyed
		// automatically when the view is destroyed.
		// This is done during onExit
		const oModel = new JSONModel();
		this._aHelperModels.push(oModel);

		return oModel;
	}

	/**
	 * Function waiting for the Right most view to be ready.
	 *
	 * @memberof sap.fe.core.rootView.BaseController
	 * @param oEvent Reference an Event parameter coming from routeMatched event
	 * @returns A promise indicating when the right most view is ready
	 */
	waitForRightMostViewReady(oEvent: any) {
		return new Promise(function (resolve: (value: any) => void) {
			const aContainers = oEvent.getParameter("views"),
				// There can also be reuse components in the view, remove them before processing.
				aFEContainers: any[] = [];
			aContainers.forEach(function (oContainer: any) {
				let oView = oContainer;
				if (oContainer && oContainer.getComponentInstance) {
					const oComponentInstance = oContainer.getComponentInstance();
					oView = oComponentInstance.getRootControl();
				}
				if (oView && oView.getController() && oView.getController().pageReady) {
					aFEContainers.push(oView);
				}
			});
			const oRightMostFEView = aFEContainers[aFEContainers.length - 1];
			if (oRightMostFEView && oRightMostFEView.getController().pageReady.isPageReady()) {
				resolve(oRightMostFEView);
			} else if (oRightMostFEView) {
				oRightMostFEView.getController().pageReady.attachEventOnce("pageReady", function () {
					resolve(oRightMostFEView);
				});
			}
		});
	}

	/**
	 * Callback when the navigation is done.
	 *  - update the shell title.
	 *  - update table scroll.
	 *  - call onPageReady on the rightMostView.
	 *
	 * @param oEvent
	 * @name sap.fe.core.rootView.BaseController#_onAfterRouteMatched
	 * @memberof sap.fe.core.rootView.BaseController
	 */
	_onAfterRouteMatched(oEvent: any) {
		if (!this._oRouteMatchedPromise) {
			this._oRouteMatchedPromise = this.waitForRightMostViewReady(oEvent)
				.then((oView: any) => {
					// The autoFocus is initially disabled on the navContainer or the FCL, so that the focus stays on the Shell menu
					// even if the app takes a long time to launch
					// The first time the view is displayed, we need to enable the autofocus so that it's managed properly during navigation
					const oRootControl = this.getView().getContent()[0] as any;
					if (oRootControl && oRootControl.getAutoFocus && !oRootControl.getAutoFocus()) {
						oRootControl.setProperty("autoFocus", true, true); // Do not mark the container as invalid, otherwise it's re-rendered
					}

					const oAppComponent = this.getAppComponent();
					this._scrollTablesToLastNavigatedItems();
					if (oAppComponent.getEnvironmentCapabilities().getCapabilities().UShell) {
						this._computeTitleHierarchy(oView);
					}
					const bForceFocus = oAppComponent.getRouterProxy().isFocusForced();
					oAppComponent.getRouterProxy().setFocusForced(false); // reset
					if (oView.getController() && oView.getController().onPageReady && oView.getParent().onPageReady) {
						oView.getParent().onPageReady({ forceFocus: bForceFocus });
					}
					if (!bForceFocus) {
						// Try to restore the focus on where it was when we last visited the current hash
						oAppComponent.getRouterProxy().restoreFocusForCurrentHash();
					}
					if (this.onContainerReady) {
						this.onContainerReady();
					}
				})
				.catch(function (oError: any) {
					Log.error("An error occurs while computing the title hierarchy and calling focus method", oError);
				})
				.finally(() => {
					this._oRouteMatchedPromise = null;
				});
		}
	}

	/**
	 * This function returns the TitleHierarchy cache ( or initializes it if undefined).
	 *
	 * @name sap.fe.core.rootView.BaseController#_getTitleHierarchyCache
	 * @memberof sap.fe.core.rootView.BaseController
	 * @returns  The TitleHierarchy cache
	 */
	_getTitleHierarchyCache() {
		if (!this.oTitleHierarchyCache) {
			this.oTitleHierarchyCache = {};
		}
		return this.oTitleHierarchyCache;
	}

	/**
	 * This function returns a titleInfo object.
	 *
	 * @memberof sap.fe.core.rootView.BaseController
	 * @param title The application's title
	 * @param subtitle The application's subTitle
	 * @param sIntent The intent path to be redirected to
	 * @param icon The application's icon
	 * @returns The title information
	 */
	_computeTitleInfo(title: any, subtitle: any, sIntent: any, icon = "") {
		const aParts = sIntent.split("/");
		if (aParts[aParts.length - 1].indexOf("?") === -1) {
			sIntent += "?restoreHistory=true";
		} else {
			sIntent += "&restoreHistory=true";
		}
		return {
			title: title,
			subtitle: subtitle,
			intent: sIntent,
			icon: icon
		};
	}

	_formatTitle(displayMode: string, titleValue: string, titleDescription: string): string {
		let formattedTitle = "";
		switch (displayMode) {
			case "Value":
				formattedTitle = `${titleValue}`;
				break;
			case "ValueDescription":
				formattedTitle = `${titleValue} (${titleDescription})`;
				break;
			case "DescriptionValue":
				formattedTitle = `${titleDescription} (${titleValue})`;
				break;
			case "Description":
				formattedTitle = `${titleDescription}`;
				break;
			default:
		}
		return formattedTitle;
	}

	/**
	 * Fetches the value of the HeaderInfo title for a given path.
	 *
	 * @param sPath The path to the entity
	 * @returns A promise containing the formatted title, or an empty string if no HeaderInfo title annotation is available
	 */
	async _fetchTitleValue(sPath: string) {
		const oAppComponent = this.getAppComponent(),
			oModel = this.getView().getModel(),
			oMetaModel = oAppComponent.getMetaModel(),
			sMetaPath = oMetaModel.getMetaPath(sPath),
			oBindingViewContext = oModel.createBindingContext(sPath),
			sValueExpression = AnnotationHelper.format(
				oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value`),
				{ context: oMetaModel.createBindingContext("/") }
			);
		if (!sValueExpression) {
			return Promise.resolve("");
		}
		const sTextExpression = AnnotationHelper.format(
				oMetaModel.getObject(
					`${sMetaPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value/$Path@com.sap.vocabularies.Common.v1.Text`
				),
				{ context: oMetaModel.createBindingContext("/") }
			),
			oPropertyContext = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value/$Path@`),
			aPromises: Promise<void>[] = [],
			oValueExpression = BindingParser.complexParser(sValueExpression),
			oPromiseForDisplayMode = new Promise(function (resolve: (value: any) => void) {
				const displayMode = CommonUtils.computeDisplayMode(oPropertyContext);
				resolve(displayMode);
			});
		aPromises.push(oPromiseForDisplayMode);
		const sValuePath = oValueExpression.parts ? oValueExpression.parts[0].path : oValueExpression.path,
			fnValueFormatter = oValueExpression.formatter,
			oValueBinding = oModel.bindProperty(sValuePath, oBindingViewContext);
		oValueBinding.initialize();
		const oPromiseForTitleValue = new Promise(function (resolve: (value: any) => void) {
			const fnChange = function (oEvent: any) {
				const sTargetValue = fnValueFormatter ? fnValueFormatter(oEvent.getSource().getValue()) : oEvent.getSource().getValue();

				oValueBinding.detachChange(fnChange);
				resolve(sTargetValue);
			};
			oValueBinding.attachChange(fnChange);
		});
		aPromises.push(oPromiseForTitleValue);

		if (sTextExpression) {
			const oTextExpression = BindingParser.complexParser(sTextExpression);
			let sTextPath = oTextExpression.parts ? oTextExpression.parts[0].path : oTextExpression.path;
			sTextPath = sValuePath.lastIndexOf("/") > -1 ? `${sValuePath.slice(0, sValuePath.lastIndexOf("/"))}/${sTextPath}` : sTextPath;

			const fnTextFormatter = oTextExpression.formatter,
				oTextBinding = oModel.bindProperty(sTextPath, oBindingViewContext);
			oTextBinding.initialize();
			const oPromiseForTitleText = new Promise(function (resolve: (description: any) => void) {
				const fnChange = function (oEvent: any) {
					const sTargetText = fnTextFormatter ? fnTextFormatter(oEvent.getSource().getValue()) : oEvent.getSource().getValue();

					oTextBinding.detachChange(fnChange);
					resolve(sTargetText);
				};

				oTextBinding.attachChange(fnChange);
			});
			aPromises.push(oPromiseForTitleText);
		}
		try {
			const titleInfo: any[] = await Promise.all(aPromises);
			let formattedTitle = "";
			if (typeof titleInfo !== "string") {
				formattedTitle = this._formatTitle(titleInfo[0], titleInfo[1], titleInfo[2]);
			}
			return formattedTitle;
		} catch (error: any) {
			Log.error("Error while fetching the title from the header info :" + error);
		}
		return "";
	}

	_getAppSpecificHash() {
		// HashChanged isShellNavigationHashChanger
		const hashChanger = HashChanger.getInstance() as HashChanger | (HashChanger & { hrefForAppSpecificHash: Function });
		return "hrefForAppSpecificHash" in hashChanger ? hashChanger.hrefForAppSpecificHash("") : "#/";
	}

	_getHash() {
		return HashChanger.getInstance().getHash();
	}

	/**
	 * This function returns titleInformation from a path.
	 * It updates the cache to store title information if necessary
	 *
	 * @name sap.fe.core.rootView.BaseController#getTitleInfoFromPath
	 * @memberof sap.fe.core.rootView.BaseController
	 * @param {*} sPath path of the context to retrieve title information from MetaModel
	 * @returns {Promise}  oTitleinformation returned as promise
	 */

	getTitleInfoFromPath(sPath: any) {
		const oTitleHierarchyCache = this._getTitleHierarchyCache();

		if (oTitleHierarchyCache[sPath]) {
			// The title info is already stored in the cache
			return Promise.resolve(oTitleHierarchyCache[sPath]);
		}

		const oMetaModel = this.getAppComponent().getMetaModel();
		const sEntityPath = oMetaModel.getMetaPath(sPath);
		const sTypeName = oMetaModel.getObject(`${sEntityPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/TypeName`);
		const sAppSpecificHash = this._getAppSpecificHash();
		const sIntent = sAppSpecificHash + sPath.slice(1);
		return this._fetchTitleValue(sPath).then((sTitle: any) => {
			const oTitleInfo = this._computeTitleInfo(sTypeName, sTitle, sIntent);
			oTitleHierarchyCache[sPath] = oTitleInfo;
			return oTitleInfo;
		});
	}

	/**
	 * Ensure that the ushell service receives all elements
	 * (title, subtitle, intent, icon) as strings.
	 *
	 * Annotation HeaderInfo allows for binding of title and description
	 * (which are used here as title and subtitle) to any element in the entity
	 * (being possibly types like boolean, timestamp, double, etc.)
	 *
	 * Creates a new hierarchy and converts non-string types to string.
	 *
	 * @param aHierarchy Shell title hierarchy
	 * @returns Copy of shell title hierarchy containing all elements as strings
	 */
	_ensureHierarchyElementsAreStrings(aHierarchy: any) {
		const aHierarchyShell = [];
		for (const level in aHierarchy) {
			const oHierarchy = aHierarchy[level];
			const oShellHierarchy: any = {};
			for (const key in oHierarchy) {
				oShellHierarchy[key] = typeof oHierarchy[key] !== "string" ? String(oHierarchy[key]) : oHierarchy[key];
			}
			aHierarchyShell.push(oShellHierarchy);
		}
		return aHierarchyShell;
	}

	_getTargetTypeFromHash(sHash: any) {
		const oAppComponent = this.getAppComponent();
		let sTargetType = "";

		const aRoutes = oAppComponent.getManifestEntry("sap.ui5").routing?.routes ?? [];
		for (const route of aRoutes) {
			const oRoute = oAppComponent.getRouter().getRoute(route.name);
			if (oRoute?.match(sHash)) {
				const sTarget = Array.isArray(route.target) ? route.target[0] : route.target;
				sTargetType = (oAppComponent.getRouter().getTarget(sTarget) as any)._oOptions.name;
				break;
			}
		}

		return sTargetType;
	}

	/**
	 * This function updates the shell title after each navigation.
	 *
	 * @memberof sap.fe.core.rootView.BaseController
	 * @param oView The current view
	 * @returns A Promise that is resolved when the menu is filled properly
	 */
	_computeTitleHierarchy(oView: any) {
		const oAppComponent = this.getAppComponent(),
			oContext = oView.getBindingContext(),
			oCurrentPage = oView.getParent(),
			aTitleInformationPromises = [],
			sAppSpecificHash = this._getAppSpecificHash(),
			manifestAppSettings = oAppComponent.getManifestEntry("sap.app"),
			sAppTitle = manifestAppSettings.title || "",
			sAppSubTitle = manifestAppSettings.subTitle || "",
			appIcon = manifestAppSettings.icon || "";
		let oPageTitleInformation: any, sNewPath;

		if (oCurrentPage && oCurrentPage._getPageTitleInformation) {
			if (oContext) {
				// If the first page of the application is a LR, use the title and subtitle from the manifest
				if (this._getTargetTypeFromHash("") === "sap.fe.templates.ListReport") {
					aTitleInformationPromises.push(
						Promise.resolve(this._computeTitleInfo(sAppTitle, sAppSubTitle, sAppSpecificHash, appIcon))
					);
				}

				// Then manage other pages
				sNewPath = oContext.getPath();
				const aPathParts = sNewPath.split("/");
				let sPath = "";

				aPathParts.shift(); // Remove the first segment (empty string) as it has been managed above
				aPathParts.pop(); // Remove the last segment as it corresponds to the current page and shouldn't appear in the menu

				aPathParts.forEach((sPathPart: any) => {
					sPath += `/${sPathPart}`;
					const oMetaModel = oAppComponent.getMetaModel(),
						sParameterPath = oMetaModel.getMetaPath(sPath),
						bIsParameterized = oMetaModel.getObject(`${sParameterPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
					if (!bIsParameterized) {
						aTitleInformationPromises.push(this.getTitleInfoFromPath(sPath));
					}
				});
			}

			// Current page
			oPageTitleInformation = oCurrentPage._getPageTitleInformation();
			oPageTitleInformation = this._computeTitleInfo(
				oPageTitleInformation.title,
				oPageTitleInformation.subtitle,
				sAppSpecificHash + this._getHash()
			);

			if (oContext) {
				this._getTitleHierarchyCache()[sNewPath] = oPageTitleInformation;
			} else {
				this._getTitleHierarchyCache()[sAppSpecificHash] = oPageTitleInformation;
			}
		} else {
			aTitleInformationPromises.push(Promise.reject("Title information missing in HeaderInfo"));
		}
		return Promise.all(aTitleInformationPromises)
			.then((aTitleInfoHierarchy: any[]) => {
				// workaround for shell which is expecting all elements being of type string
				const aTitleInfoHierarchyShell = this._ensureHierarchyElementsAreStrings(aTitleInfoHierarchy),
					sTitle = oPageTitleInformation.title;
				aTitleInfoHierarchyShell.reverse();
				oAppComponent.getShellServices().setHierarchy(aTitleInfoHierarchyShell);

				this._setShellMenuTitle(oAppComponent, sTitle, sAppTitle);
			})
			.catch(function (sErrorMessage: any) {
				Log.error(sErrorMessage);
			})
			.finally(() => {
				this.bIsComputingTitleHierachy = false;
			})
			.catch(function (sErrorMessage: any) {
				Log.error(sErrorMessage);
			});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	calculateLayout(iNextFCLLevel: number, sHash: string, sProposedLayout: string | undefined, keepCurrentLayout = false) {
		return null;
	}

	/**
	 * Callback after a view has been bound to a context.
	 *
	 * @param oContext The context that has been bound to a view
	 */
	onContextBoundToView(oContext: any) {
		if (oContext) {
			const sDeepestPath = this.getView().getModel("internal").getProperty("/deepestPath"),
				sViewContextPath = oContext.getPath();

			if (!sDeepestPath || sDeepestPath.indexOf(sViewContextPath) !== 0) {
				// There was no previous value for the deepest reached path, or the path
				// for the view isn't a subpath of the previous deepest path --> update
				(this.getView().getModel("internal") as JSONModel).setProperty("/deepestPath", sViewContextPath, undefined, true);
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	displayErrorPage(sErrorMessage: any, mParameters: any): Promise<boolean> {
		// To be overridden
		return Promise.resolve(true);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	updateUIStateForView(oView: any, FCLLevel: any) {
		// To be overriden
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getInstancedViews(): XMLView[] {
		return [];
		// To be overriden
	}

	_scrollTablesToLastNavigatedItems(): void {
		// To be overriden
	}

	isFclEnabled(): this is FclController {
		return false;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_setShellMenuTitle(oAppComponent: AppComponent, sTitle: string, sAppTitle: string): void {
		// To be overriden by FclController
		oAppComponent.getShellServices().setTitle(sTitle);
	}

	getAppContentContainer(): NavContainer | FlexibleColumnLayout {
		const oAppComponent = this.getAppComponent();
		const appContentId = oAppComponent.getManifestEntry("sap.ui5").routing?.config?.controlId ?? "appContent";
		return this.getView().byId(appContentId) as NavContainer | FlexibleColumnLayout;
	}
}
interface RootViewBaseController {
	onContainerReady?(): void;
}

export default RootViewBaseController;
