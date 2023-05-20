import Log from "sap/base/Log";
import type AppComponent from "sap/fe/core/AppComponent";
import type { ComponentData, ManifestContent } from "sap/fe/core/AppComponent";
import type { ContentDensitiesType, ControlConfiguration } from "sap/fe/core/converters/ManifestSettings";
import { requireDependencies } from "sap/fe/core/helpers/LoaderUtils";
import { applyPageConfigurationChanges } from "sap/fe/core/manifestMerger/ChangePageConfiguration";
import ResourceModel from "sap/fe/core/ResourceModel";
import type { CacheHandlerService } from "sap/fe/core/services/CacheHandlerServiceFactory";
import TemplateModel from "sap/fe/core/TemplateModel";
import Component from "sap/ui/core/Component";
import View from "sap/ui/core/mvc/View";
import Service from "sap/ui/core/service/Service";
import ServiceFactory from "sap/ui/core/service/ServiceFactory";
import ServiceFactoryRegistry from "sap/ui/core/service/ServiceFactoryRegistry";
import Device from "sap/ui/Device";
import ManagedObjectModel from "sap/ui/model/base/ManagedObjectModel";
import JSONModel from "sap/ui/model/json/JSONModel";
import type Model from "sap/ui/model/Model";
import VersionInfo from "sap/ui/VersionInfo";
import type { ServiceContext } from "types/metamodel_types";
import { resolveDynamicExpression } from "../helpers/DynamicAnnotationPathHelper";
import type { ResourceModelService } from "./ResourceModelServiceFactory";

type TemplatedViewServiceSettings = {};
export type ViewData = {
	appComponent: AppComponent;
	navigation: object;
	viewLevel: number;
	stableId: string;
	contentDensities?: ContentDensitiesType;
	resourceModel: ResourceModel;
	fullContextPath: string;
	isDesktop: boolean;
	isPhone: boolean;
	converterType?: string;
	shellContentDensity?: string;
	useNewLazyLoading?: boolean;
	retrieveTextFromValueList?: boolean;
	controlConfiguration?: ControlConfiguration;
	entitySet?: string;
	isShareButtonVisibleForMyInbox?: boolean;
};

class TemplatedViewService extends Service<TemplatedViewServiceSettings> {
	initPromise!: Promise<any>;

	oView!: View;

	oResourceModelService!: ResourceModelService;

	oCacheHandlerService!: CacheHandlerService;

	oFactory!: TemplatedViewServiceFactory;

	resourceModel!: ResourceModel;

	stableId!: string;

	pageId!: string;

	TemplateConverter: any;

	MetaModelConverter: any;

	init() {
		const aServiceDependencies = [];
		const oContext = this.getContext();
		const oComponent = oContext.scopeObject;
		const oAppComponent = Component.getOwnerComponentFor(oComponent) as AppComponent;
		const oMetaModel = oAppComponent.getMetaModel();
		this.pageId = oAppComponent.getLocalId(oComponent.getId()) as string;
		const sStableId = `${oAppComponent.getMetadata().getComponentName()}::${this.pageId}`;
		const aEnhanceI18n = oComponent.getEnhanceI18n() || [];
		let sAppNamespace;
		this.oFactory = oContext.factory;
		if (aEnhanceI18n) {
			sAppNamespace = oAppComponent.getMetadata().getComponentName();
			for (let i = 0; i < aEnhanceI18n.length; i++) {
				// In order to support text-verticalization applications can also passs a resource model defined in the manifest
				// UI5 takes care of text-verticalization for resource models defined in the manifest
				// Hence check if the given key is a resource model defined in the manifest
				// if so this model should be used to enhance the sap.fe resource model so pass it as it is
				const oResourceModel = oAppComponent.getModel(aEnhanceI18n[i]);
				if (oResourceModel && oResourceModel.isA("sap.ui.model.resource.ResourceModel")) {
					aEnhanceI18n[i] = oResourceModel;
				} else {
					aEnhanceI18n[i] = `${sAppNamespace}.${aEnhanceI18n[i].replace(".properties", "")}`;
				}
			}
		}

		const sCacheIdentifier = `${oAppComponent.getMetadata().getName()}_${sStableId}_${sap.ui
			.getCore()
			.getConfiguration()
			.getLanguageTag()}`;
		aServiceDependencies.push(
			ServiceFactoryRegistry.get("sap.fe.core.services.ResourceModelService")
				.createInstance({
					scopeType: "component",
					scopeObject: oComponent,
					settings: {
						bundles: ["sap.fe.core.messagebundle", "sap.fe.macros.messagebundle", "sap.fe.templates.messagebundle"],
						enhanceI18n: aEnhanceI18n,
						modelName: "sap.fe.i18n"
					}
				})
				.then((oResourceModelService: ResourceModelService) => {
					this.oResourceModelService = oResourceModelService;
					return oResourceModelService.getResourceModel();
				})
		);

		aServiceDependencies.push(
			ServiceFactoryRegistry.get("sap.fe.core.services.CacheHandlerService")
				.createInstance({
					settings: {
						metaModel: oMetaModel,
						appComponent: oAppComponent,
						component: oComponent
					}
				})
				.then((oCacheHandlerService: any) => {
					this.oCacheHandlerService = oCacheHandlerService;
					return oCacheHandlerService.validateCacheKey(sCacheIdentifier, oComponent);
				})
		);
		aServiceDependencies.push(
			(VersionInfo as any)
				.load()
				.then(function (oInfo: any) {
					let sTimestamp = "";
					if (!oInfo.libraries) {
						sTimestamp = (sap.ui as any).buildinfo.buildtime;
					} else {
						oInfo.libraries.forEach(function (oLibrary: any) {
							sTimestamp += oLibrary.buildTimestamp;
						});
					}
					return sTimestamp;
				})
				.catch(function () {
					return "<NOVALUE>";
				})
		);

		this.initPromise = Promise.all(aServiceDependencies)
			.then(async (aDependenciesResult: any[]) => {
				const oResourceModel = aDependenciesResult[0] as ResourceModel;
				const sCacheKey = aDependenciesResult[1];
				const oSideEffectsServices = oAppComponent.getSideEffectsService();
				oSideEffectsServices.initializeSideEffects(oAppComponent.getEnvironmentCapabilities().getCapabilities());

				const [TemplateConverter, MetaModelConverter] = await requireDependencies([
					"sap/fe/core/converters/TemplateConverter",
					"sap/fe/core/converters/MetaModelConverter"
				]);
				return this.createView(oResourceModel, sStableId, sCacheKey, TemplateConverter, MetaModelConverter);
			})
			.then(function (sCacheKey: any) {
				const oCacheHandlerService = ServiceFactoryRegistry.get("sap.fe.core.services.CacheHandlerService").getInstance(oMetaModel);
				oCacheHandlerService.invalidateIfNeeded(sCacheKey, sCacheIdentifier, oComponent);
			});
	}

	/**
	 * Refresh the current view using the same configuration as before.
	 *
	 * @param oComponent
	 * @returns A promise indicating when the view is refreshed
	 * @private
	 */
	refreshView(oComponent: any) {
		const oRootView = oComponent.getRootControl();
		if (oRootView) {
			oRootView.destroy();
		} else if (this.oView) {
			this.oView.destroy();
		}
		return this.createView(this.resourceModel, this.stableId, "", this.TemplateConverter, this.MetaModelConverter)
			.then(function () {
				oComponent.oContainer.invalidate();
			})
			.catch(function (oError: any) {
				oComponent.oContainer.invalidate();
				Log.error(oError);
			});
	}

	async createView(
		oResourceModel: ResourceModel,
		sStableId: any,
		sCacheKey: any,
		TemplateConverter: any,
		MetaModelConverter: any
	): Promise<any | void> {
		this.resourceModel = oResourceModel; // TODO: get rid, kept it for the time being
		this.stableId = sStableId;
		this.TemplateConverter = TemplateConverter;
		this.MetaModelConverter = MetaModelConverter;
		const oContext = this.getContext();
		const mServiceSettings = oContext.settings;
		const sConverterType = mServiceSettings.converterType;
		const oComponent = oContext.scopeObject;
		const oAppComponent: AppComponent = Component.getOwnerComponentFor(oComponent) as AppComponent;
		const sFullContextPath = oAppComponent.getRoutingService().getTargetInformationFor(oComponent).options.settings.fullContextPath;
		const oMetaModel = oAppComponent.getMetaModel();
		const oManifestContent: ManifestContent = oAppComponent.getManifest();
		const oDeviceModel = new JSONModel(Device).setDefaultBindingMode("OneWay");
		const oManifestModel = new JSONModel(oManifestContent);
		const bError = false;
		let oPageModel: TemplateModel, oViewDataModel: Model, oViewSettings: any, mViewData: ViewData;

		// Load the index for the additional building blocks which is responsible for initializing them
		function getViewSettings() {
			const aSplitPath = sFullContextPath.split("/");
			const sEntitySetPath = aSplitPath.reduce(function (sPathSoFar: any, sNextPathPart: any) {
				if (sNextPathPart === "") {
					return sPathSoFar;
				}
				if (sPathSoFar === "") {
					sPathSoFar = `/${sNextPathPart}`;
				} else {
					const oTarget = oMetaModel.getObject(`${sPathSoFar}/$NavigationPropertyBinding/${sNextPathPart}`);
					if (oTarget && Object.keys(oTarget).length > 0) {
						sPathSoFar += "/$NavigationPropertyBinding";
					}
					sPathSoFar += `/${sNextPathPart}`;
				}
				return sPathSoFar;
			}, "");
			let viewType = mServiceSettings.viewType || oComponent.getViewType() || "XML";
			if (viewType !== "XML") {
				viewType = undefined;
			}
			return {
				type: viewType,
				preprocessors: {
					xml: {
						bindingContexts: {
							entitySet: sEntitySetPath ? oMetaModel.createBindingContext(sEntitySetPath) : null,
							fullContextPath: sFullContextPath ? oMetaModel.createBindingContext(sFullContextPath) : null,
							contextPath: sFullContextPath ? oMetaModel.createBindingContext(sFullContextPath) : null,
							converterContext: oPageModel.createBindingContext("/", undefined, { noResolve: true }),
							viewData: mViewData ? oViewDataModel.createBindingContext("/") : null
						},
						models: {
							entitySet: oMetaModel,
							fullContextPath: oMetaModel,
							contextPath: oMetaModel,
							"sap.fe.i18n": oResourceModel,
							metaModel: oMetaModel,
							device: oDeviceModel,
							manifest: oManifestModel,
							converterContext: oPageModel,
							viewData: oViewDataModel
						},
						appComponent: oAppComponent
					}
				},
				id: sStableId,
				viewName: mServiceSettings.viewName || oComponent.getViewName(),
				viewData: mViewData,
				cache: {
					keys: [sCacheKey],
					additionalData: {
						// We store the page model data in the `additionalData` of the view cache, this way it is always in sync
						getAdditionalCacheData: () => {
							return (oPageModel as unknown as JSONModel).getData();
						},
						setAdditionalCacheData: (value: object) => {
							(oPageModel as unknown as JSONModel).setData(value);
						}
					}
				},
				models: {
					"sap.fe.i18n": oResourceModel
				},
				height: "100%"
			};
		}
		const createErrorPage = (reason: any) => {
			// just replace the view name and add an additional model containing the reason, but
			// keep the other settings
			Log.error(reason.message, reason);
			oViewSettings.viewName = mServiceSettings.errorViewName || "sap.fe.core.services.view.TemplatingErrorPage";
			oViewSettings.preprocessors.xml.models["error"] = new JSONModel(reason);

			return oComponent.runAsOwner(() => {
				return View.create(oViewSettings).then((oView: any) => {
					this.oView = oView;
					this.oView.setModel(new ManagedObjectModel(this.oView), "$view");
					oComponent.setAggregation("rootControl", this.oView);
					return sCacheKey;
				});
			});
		};

		try {
			const oRoutingService = await oAppComponent.getService("routingService");
			// Retrieve the viewLevel for the component
			const oTargetInfo = oRoutingService.getTargetInformationFor(oComponent);
			const mOutbounds =
				(oManifestContent["sap.app"] &&
					oManifestContent["sap.app"].crossNavigation &&
					oManifestContent["sap.app"].crossNavigation.outbounds) ||
				{};
			const mNavigation = oComponent.getNavigation() || {};
			Object.keys(mNavigation).forEach(function (navigationObjectKey: string) {
				const navigationObject = mNavigation[navigationObjectKey];
				let outboundConfig;
				if (navigationObject.detail && navigationObject.detail.outbound && mOutbounds[navigationObject.detail.outbound]) {
					outboundConfig = mOutbounds[navigationObject.detail.outbound];
					navigationObject.detail.outboundDetail = {
						semanticObject: outboundConfig.semanticObject,
						action: outboundConfig.action,
						parameters: outboundConfig.parameters
					};
				}
				if (navigationObject.create && navigationObject.create.outbound && mOutbounds[navigationObject.create.outbound]) {
					outboundConfig = mOutbounds[navigationObject.create.outbound];
					navigationObject.create.outboundDetail = {
						semanticObject: outboundConfig.semanticObject,
						action: outboundConfig.action,
						parameters: outboundConfig.parameters
					};
				}
			});

			mViewData = {
				appComponent: oAppComponent,
				navigation: mNavigation,
				viewLevel: oTargetInfo.viewLevel,
				stableId: sStableId,
				contentDensities: oManifestContent["sap.ui5"]?.contentDensities,
				resourceModel: oResourceModel,
				fullContextPath: sFullContextPath,
				isDesktop: (Device as any).system.desktop,
				isPhone: (Device as any).system.phone
			};

			if (oComponent.getViewData) {
				Object.assign(mViewData, oComponent.getViewData());

				const actualSettings = oManifestContent?.["sap.ui5"]?.routing?.targets?.[this.pageId]?.options?.settings || {};
				mViewData = applyPageConfigurationChanges(actualSettings, mViewData, oAppComponent, this.pageId);
			}

			mViewData.isShareButtonVisibleForMyInbox = TemplatedViewServiceFactory.getShareButtonVisibilityForMyInbox(oAppComponent);
			const oShellServices = oAppComponent.getShellServices();
			mViewData.converterType = sConverterType;
			mViewData.shellContentDensity = oShellServices.getContentDensity();
			mViewData.retrieveTextFromValueList =
				oManifestContent["sap.fe"] && oManifestContent["sap.fe"].form
					? oManifestContent["sap.fe"].form.retrieveTextFromValueList
					: undefined;
			oViewDataModel = new JSONModel(mViewData);
			if (mViewData.controlConfiguration) {
				for (const sAnnotationPath in mViewData.controlConfiguration) {
					if (sAnnotationPath.indexOf("[") !== -1) {
						const sTargetAnnotationPath = resolveDynamicExpression(sAnnotationPath, oMetaModel);
						mViewData.controlConfiguration[sTargetAnnotationPath] = mViewData.controlConfiguration[sAnnotationPath];
					}
				}
			}
			MetaModelConverter.convertTypes(oMetaModel, oAppComponent.getEnvironmentCapabilities().getCapabilities());
			oPageModel = new TemplateModel(() => {
				try {
					const oDiagnostics = oAppComponent.getDiagnostics();
					const iIssueCount = oDiagnostics.getIssues().length;
					const oConverterPageModel = TemplateConverter.convertPage(
						sConverterType,
						oMetaModel,
						mViewData,
						oDiagnostics,
						sFullContextPath,
						oAppComponent.getEnvironmentCapabilities().getCapabilities(),
						oComponent
					);

					const aIssues = oDiagnostics.getIssues();
					const aAddedIssues = aIssues.slice(iIssueCount);
					if (aAddedIssues.length > 0) {
						Log.warning(
							"Some issues have been detected in your project, please check the UI5 support assistant rule for sap.fe.core"
						);
					}
					return oConverterPageModel;
				} catch (error) {
					Log.error(error as any, error as any);
					return {};
				}
			}, oMetaModel);

			if (!bError) {
				oViewSettings = getViewSettings();
				// Setting the pageModel on the component for potential reuse
				oComponent.setModel(oPageModel, "_pageModel");
				return oComponent.runAsOwner(() => {
					return View.create(oViewSettings)
						.catch(createErrorPage)
						.then((oView: any) => {
							this.oView = oView;
							this.oView.setModel(new ManagedObjectModel(this.oView), "$view");
							this.oView.setModel(oViewDataModel, "viewData");
							oComponent.setAggregation("rootControl", this.oView);
							return sCacheKey;
						})
						.catch((e) => Log.error(e.message, e));
				});
			}
		} catch (error: any) {
			Log.error(error.message, error);
			throw new Error(`Error while creating view : ${error}`);
		}
	}

	getView() {
		return this.oView;
	}

	getInterface(): any {
		return this;
	}

	exit() {
		// Deregister global instance
		if (this.oResourceModelService) {
			this.oResourceModelService.destroy();
		}
		if (this.oCacheHandlerService) {
			this.oCacheHandlerService.destroy();
		}
		this.oFactory.removeGlobalInstance();
	}
}

class TemplatedViewServiceFactory extends ServiceFactory<TemplatedViewServiceSettings> {
	_oInstanceRegistry: Record<string, TemplatedViewService> = {};

	static iCreatingViews: 0;

	createInstance(oServiceContext: ServiceContext<TemplatedViewServiceSettings>) {
		TemplatedViewServiceFactory.iCreatingViews++;

		const oTemplatedViewService = new TemplatedViewService(Object.assign({ factory: this }, oServiceContext));
		return oTemplatedViewService.initPromise.then(function () {
			TemplatedViewServiceFactory.iCreatingViews--;
			return oTemplatedViewService;
		});
	}

	removeGlobalInstance() {
		this._oInstanceRegistry = {};
	}

	/**
	 * @description This function checks if the component data specifies the visibility of the 'Share' button and returns true or false based on the visibility
	 * @param appComponent Specifies the app component
	 * @returns Boolean value as true or false based whether the 'Share' button should be visible or not
	 */
	static getShareButtonVisibilityForMyInbox(appComponent: AppComponent) {
		const componentData: ComponentData = appComponent.getComponentData();
		if (componentData !== undefined && componentData.feEnvironment) {
			return componentData.feEnvironment.getShareControlVisibility();
		}
		return undefined;
	}

	static getNumberOfViewsInCreationState() {
		return TemplatedViewServiceFactory.iCreatingViews;
	}
}

export default TemplatedViewServiceFactory;
