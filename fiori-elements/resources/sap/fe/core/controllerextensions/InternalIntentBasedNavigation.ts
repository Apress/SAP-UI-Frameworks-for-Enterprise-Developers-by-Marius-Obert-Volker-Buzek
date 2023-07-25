import { EntitySet } from "@sap-ux/vocabularies-types";
import type { PropertyAnnotations } from "@sap-ux/vocabularies-types/vocabularies/Edm_Types";
import Log from "sap/base/Log";
import mergeObjects from "sap/base/util/merge";
import type AppComponent from "sap/fe/core/AppComponent";
import CommonUtils from "sap/fe/core/CommonUtils";
import draft from "sap/fe/core/controllerextensions/editFlow/draft";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import { convertTypes } from "sap/fe/core/converters/MetaModelConverter";
import {
	defineUI5Class,
	extensible,
	finalExtension,
	methodOverride,
	privateExtension,
	publicExtension
} from "sap/fe/core/helpers/ClassSupport";
import KeepAliveHelper from "sap/fe/core/helpers/KeepAliveHelper";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { getResourceModel } from "sap/fe/core/helpers/ResourceModelHelper";
import type PageController from "sap/fe/core/PageController";
import type { NavigationService } from "sap/fe/core/services/NavigationServiceFactory";
import type Diagnostics from "sap/fe/core/support/Diagnostics";
import SelectionVariant from "sap/fe/navigation/SelectionVariant";
import Core from "sap/ui/core/Core";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";
import type View from "sap/ui/core/mvc/View";
import type Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ODataV4Context from "sap/ui/model/odata/v4/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import { AggregationHelper } from "../converters/helpers/Aggregation";
import NotApplicableContextDialog from "./editFlow/NotApplicableContextDialog";

/**
 * Navigation Parameters used during navigation
 */
export type NavigationParameters = {
	/**
	 * Single instance or multiple instances of {@link sap.ui.model.odata.v4.Context}, or alternatively an object or array of objects, to be passed to the intent.
	 */
	navigationContexts?: object | any[] | undefined;
	/**
	 * String representation of SemanticObjectMapping or SemanticObjectMapping that applies to this navigation.
	 */
	semanticObjectMapping?: string | object | undefined;
	defaultRefreshStrategy?: object | undefined;
	refreshStrategies?: any;
	additionalNavigationParameters?: object | undefined;
	/**
	 * Single instance or multiple instances of {@link sap.ui.model.odata.v4.Context}, or alternatively an object or array of objects, to be passed to the intent and for which the IBN button is enabled
	 */
	applicableContexts?: object | any[];
	/**
	 * Single instance or multiple instances of {@link sap.ui.model.odata.v4.Context}, or alternatively an object or array of objects, which cannot be passed to the intent.
	 * 	if an array of contexts is passed the context is used to determine the meta path and accordingly remove the sensitive data
	 * If an array of objects is passed, the following format is expected:
	 * {
	 * 	data: {
	 * 		ProductID: 7634,
	 * 			Name: "Laptop"
	 * 	},
	 * 	metaPath: "/SalesOrderManage"
	 * }
	 * The metaPath is used to remove any sensitive data.
	 */
	notApplicableContexts?: any;

	label?: string;
};
/**
 * {@link sap.ui.core.mvc.ControllerExtension Controller extension}
 *
 * @namespace
 * @alias sap.fe.core.controllerextensions.InternalInternalBasedNavigation
 * @private
 * @since 1.84.0
 */
@defineUI5Class("sap.fe.core.controllerextensions.InternalInternalBasedNavigation")
class InternalIntentBasedNavigation extends ControllerExtension {
	protected base!: PageController;

	private _oAppComponent!: AppComponent;

	private _oMetaModel!: ODataMetaModel;

	private _oNavigationService!: NavigationService;

	private _oView!: View;

	@methodOverride()
	onInit() {
		this._oAppComponent = this.base.getAppComponent();
		this._oMetaModel = this._oAppComponent.getModel().getMetaModel() as ODataMetaModel;
		this._oNavigationService = this._oAppComponent.getNavigationService();
		this._oView = this.base.getView();
	}

	/**
	 * Enables intent-based navigation (SemanticObject-Action) with the provided context.
	 * If semantic object mapping is provided, this is also applied to the selection variant after the adaptation by a consumer.
	 * This takes care of removing any technical parameters and determines if an explace or inplace navigation should take place.
	 *
	 * @param sSemanticObject Semantic object for the target app
	 * @param sAction  Action for the target app
	 * @param [mNavigationParameters] Optional parameters to be passed to the external navigation
	 * @param [mNavigationParameters.navigationContexts] Uses one of the following to be passed to the intent:
	 *    a single instance of {@link sap.ui.model.odata.v4.Context}
	 *    multiple instances of {@link sap.ui.model.odata.v4.Context}
	 *    an object or an array of objects
	 *		  If an array of objects is passed, the context is used to determine the metaPath and to remove any sensitive data
	 *		  If an array of objects is passed, the following format ix expected:
	 *		  {
	 *			data: {
	 *	 			ProductID: 7634,
	 *				Name: "Laptop"
	 *			 },
	 *			 metaPath: "/SalesOrderManage"
	 *        }
	 * @param [mNavigationParameters.semanticObjectMapping] String representation of the SemanticObjectMapping or SemanticObjectMapping that applies to this navigation
	 * @param [mNavigationParameters.defaultRefreshStrategy] Default refresh strategy to be used in case no refresh strategy is specified for the intent in the view.
	 * @param [mNavigationParameters.refreshStrategies]
	 * @param [mNavigationParameters.additionalNavigationParameters] Additional navigation parameters configured in the crossAppNavigation outbound parameters.
	 */
	@publicExtension()
	@finalExtension()
	navigate(sSemanticObject: string, sAction: string, mNavigationParameters: NavigationParameters | undefined) {
		const _doNavigate = (oContext?: any) => {
			const vNavigationContexts = mNavigationParameters && mNavigationParameters.navigationContexts,
				aNavigationContexts =
					vNavigationContexts && !Array.isArray(vNavigationContexts) ? [vNavigationContexts] : vNavigationContexts,
				vSemanticObjectMapping = mNavigationParameters && mNavigationParameters.semanticObjectMapping,
				vOutboundParams = mNavigationParameters && mNavigationParameters.additionalNavigationParameters,
				oTargetInfo: any = {
					semanticObject: sSemanticObject,
					action: sAction
				},
				oView = this.base.getView(),
				oController = oView.getController() as PageController;

			if (oContext) {
				this._oView.setBindingContext(oContext);
			}

			if (sSemanticObject && sAction) {
				let aSemanticAttributes: any[] = [],
					oSelectionVariant: any = new SelectionVariant();
				// 1. get SemanticAttributes for navigation
				if (aNavigationContexts && aNavigationContexts.length) {
					aNavigationContexts.forEach((oNavigationContext: any) => {
						// 1.1.a if navigation context is instance of sap.ui.mode.odata.v4.Context
						// else check if navigation context is of type object
						if (oNavigationContext.isA && oNavigationContext.isA("sap.ui.model.odata.v4.Context")) {
							// 1.1.b remove sensitive data
							let oSemanticAttributes = oNavigationContext.getObject();
							const sMetaPath = this._oMetaModel.getMetaPath(oNavigationContext.getPath());
							// TODO: also remove sensitive data from  navigation properties
							oSemanticAttributes = this.removeSensitiveData(oSemanticAttributes, sMetaPath);
							const oNavContext = this.prepareContextForExternalNavigation(oSemanticAttributes, oNavigationContext);
							oTargetInfo["propertiesWithoutConflict"] = oNavContext.propertiesWithoutConflict;
							aSemanticAttributes.push(oNavContext.semanticAttributes);
						} else if (
							!(oNavigationContext && Array.isArray(oNavigationContext.data)) &&
							typeof oNavigationContext === "object"
						) {
							// 1.1.b remove sensitive data from object
							aSemanticAttributes.push(this.removeSensitiveData(oNavigationContext.data, oNavigationContext.metaPath));
						} else if (oNavigationContext && Array.isArray(oNavigationContext.data)) {
							// oNavigationContext.data can be array already ex : [{Customer: "10001"}, {Customer: "10091"}]
							// hence assigning it to the aSemanticAttributes
							aSemanticAttributes = this.removeSensitiveData(oNavigationContext.data, oNavigationContext.metaPath);
						}
					});
				}
				// 2.1 Merge base selection variant and sanitized semantic attributes into one SelectionVariant
				if (aSemanticAttributes && aSemanticAttributes.length) {
					oSelectionVariant = this._oNavigationService.mixAttributesAndSelectionVariant(
						aSemanticAttributes,
						oSelectionVariant.toJSONString()
					);
				}

				// 3. Add filterContextUrl to SV so the NavigationHandler can remove any sensitive data based on view entitySet
				const oModel = this._oView.getModel(),
					sEntitySet = this.getEntitySet(),
					sContextUrl = sEntitySet ? this._oNavigationService.constructContextUrl(sEntitySet, oModel) : undefined;
				if (sContextUrl) {
					oSelectionVariant.setFilterContextUrl(sContextUrl);
				}

				// Apply Outbound Parameters to the SV
				if (vOutboundParams) {
					this._applyOutboundParams(oSelectionVariant, vOutboundParams);
				}

				// 4. give an opportunity for the application to influence the SelectionVariant
				oController.intentBasedNavigation.adaptNavigationContext(oSelectionVariant, oTargetInfo);

				// 5. Apply semantic object mappings to the SV
				if (vSemanticObjectMapping) {
					this._applySemanticObjectMappings(oSelectionVariant, vSemanticObjectMapping);
				}

				// 6. remove technical parameters from Selection Variant
				this._removeTechnicalParameters(oSelectionVariant);

				// 7. check if programming model is sticky and page is editable
				const sNavMode = oController._intentBasedNavigation.getNavigationMode();

				// 8. Updating refresh strategy in internal model
				const mRefreshStrategies = (mNavigationParameters && mNavigationParameters.refreshStrategies) || {},
					oInternalModel = oView.getModel("internal") as JSONModel;
				if (oInternalModel) {
					if ((oView && (oView.getViewData() as any)).refreshStrategyOnAppRestore) {
						const mViewRefreshStrategies = (oView.getViewData() as any).refreshStrategyOnAppRestore || {};
						mergeObjects(mRefreshStrategies, mViewRefreshStrategies);
					}
					const mRefreshStrategy = KeepAliveHelper.getRefreshStrategyForIntent(mRefreshStrategies, sSemanticObject, sAction);
					if (mRefreshStrategy) {
						oInternalModel.setProperty("/refreshStrategyOnAppRestore", mRefreshStrategy);
					}
				}

				// 9. Navigate via NavigationHandler
				const onError = function () {
					sap.ui.require(["sap/m/MessageBox"], function (MessageBox: any) {
						const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
						MessageBox.error(oResourceBundle.getText("C_COMMON_HELPER_NAVIGATION_ERROR_MESSAGE"), {
							title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR")
						});
					});
				};
				this._oNavigationService.navigate(
					sSemanticObject,
					sAction,
					oSelectionVariant.toJSONString(),
					undefined,
					onError,
					undefined,
					sNavMode
				);
			} else {
				throw new Error("Semantic Object/action is not provided");
			}
		};
		const oBindingContext = this.base.getView().getBindingContext();
		const oMetaModel = oBindingContext && (oBindingContext.getModel().getMetaModel() as ODataMetaModel);
		if (
			(this.getView().getViewData() as any).converterType === "ObjectPage" &&
			oMetaModel &&
			!ModelHelper.isStickySessionSupported(oMetaModel)
		) {
			draft.processDataLossOrDraftDiscardConfirmation(
				_doNavigate.bind(this),
				Function.prototype,
				this.base.getView().getBindingContext(),
				this.base.getView().getController(),
				true,
				draft.NavigationType.ForwardNavigation
			);
		} else {
			_doNavigate();
		}
	}

	/**
	 * Prepare attributes to be passed to external navigation.
	 *
	 * @param oSemanticAttributes Context data after removing all sensitive information.
	 * @param oContext Actual context from which the semanticAttributes were derived.
	 * @returns Object of prepared attributes for external navigation and no conflict properties.
	 */
	@publicExtension()
	@finalExtension()
	prepareContextForExternalNavigation(oSemanticAttributes: any, oContext: Context) {
		// 1. Find all distinct keys in the object SemanticAttributes
		// Store meta path for each occurence of the key
		const oDistinctKeys: any = {},
			sContextPath = oContext.getPath(),
			oMetaModel = oContext.getModel().getMetaModel() as ODataMetaModel,
			sMetaPath = oMetaModel.getMetaPath(sContextPath),
			aMetaPathParts = sMetaPath.split("/").filter(Boolean);

		function _findDistinctKeysInObject(LookUpObject: any, sLookUpObjectMetaPath: any) {
			for (const sKey in LookUpObject) {
				// null case??
				if (LookUpObject[sKey] === null || typeof LookUpObject[sKey] !== "object") {
					if (!oDistinctKeys[sKey]) {
						// if key is found for the first time then create array
						oDistinctKeys[sKey] = [];
					}
					// push path to array
					oDistinctKeys[sKey].push(sLookUpObjectMetaPath);
				} else {
					// if a nested object is found
					const oNewLookUpObject = LookUpObject[sKey];
					_findDistinctKeysInObject(oNewLookUpObject, `${sLookUpObjectMetaPath}/${sKey}`);
				}
			}
		}

		_findDistinctKeysInObject(oSemanticAttributes, sMetaPath);

		// 2. Determine distinct key value and add conflicted paths to semantic attributes
		const sMainEntitySetName = aMetaPathParts[0],
			sMainEntityTypeName = oMetaModel.getObject(`/${sMainEntitySetName}/@sapui.name`),
			oPropertiesWithoutConflict: any = {};
		let sMainEntityValuePath, sCurrentValuePath, sLastValuePath;
		for (const sDistinctKey in oDistinctKeys) {
			const aConflictingPaths = oDistinctKeys[sDistinctKey];
			let sWinnerValuePath;
			// Find winner value for each distinct key in case of conflict by the following rule:

			// -> A. if any meta path for a distinct key is the same as main entity take that as the value
			// -> B. if A is not met keep the value from the current context (sMetaPath === path of distince key)
			// -> C. if A, B or C are not met take the last path for value
			if (aConflictingPaths.length > 1) {
				// conflict
				for (let i = 0; i <= aConflictingPaths.length - 1; i++) {
					const sPath = aConflictingPaths[i];
					let sPathInContext = sPath.replace(sPath === sMetaPath ? sMetaPath : `${sMetaPath}/`, "");
					sPathInContext = (sPathInContext === "" ? sPathInContext : `${sPathInContext}/`) + sDistinctKey;
					const sEntityTypeName = oMetaModel.getObject(`${sPath}/@sapui.name`);
					// rule A

					// rule A
					if (sEntityTypeName === sMainEntityTypeName) {
						sMainEntityValuePath = sPathInContext;
					}

					// rule B
					if (sPath === sMetaPath) {
						sCurrentValuePath = sPathInContext;
					}

					// rule C
					sLastValuePath = sPathInContext;

					// add conflicted path to semantic attributes
					// check if the current path points to main entity and prefix attribute names accordingly
					oSemanticAttributes[
						`${sMetaPath}/${sPathInContext}`
							.split("/")
							.filter(function (sValue: string) {
								return sValue != "";
							})
							.join(".")
					] = oContext.getProperty(sPathInContext);
				}
				// A || B || C
				sWinnerValuePath = sMainEntityValuePath || sCurrentValuePath || sLastValuePath;
				oSemanticAttributes[sDistinctKey] = oContext.getProperty(sWinnerValuePath);
				sMainEntityValuePath = undefined;
				sCurrentValuePath = undefined;
				sLastValuePath = undefined;
			} else {
				// no conflict, add distinct key without adding paths
				const sPath = aConflictingPaths[0]; // because there is only one and hence no conflict
				let sPathInContext = sPath.replace(sPath === sMetaPath ? sMetaPath : `${sMetaPath}/`, "");
				sPathInContext = (sPathInContext === "" ? sPathInContext : `${sPathInContext}/`) + sDistinctKey;
				oSemanticAttributes[sDistinctKey] = oContext.getProperty(sPathInContext);
				oPropertiesWithoutConflict[sDistinctKey] = `${sMetaPath}/${sPathInContext}`
					.split("/")
					.filter(function (sValue: string) {
						return sValue != "";
					})
					.join(".");
			}
		}
		// 3. Remove all Navigation properties
		for (const sProperty in oSemanticAttributes) {
			if (oSemanticAttributes[sProperty] !== null && typeof oSemanticAttributes[sProperty] === "object") {
				delete oSemanticAttributes[sProperty];
			}
		}
		return {
			semanticAttributes: oSemanticAttributes,
			propertiesWithoutConflict: oPropertiesWithoutConflict
		};
	}

	/**
	 * Prepare filter conditions to be passed to external navigation.
	 *
	 * @param oFilterBarConditions Filter conditions.
	 * @param sRootPath Root path of the application.
	 * @param aParameters Names of parameters to be considered.
	 * @returns Object of prepared filter conditions for external navigation and no conflict filters.
	 */
	@publicExtension()
	@finalExtension()
	prepareFiltersForExternalNavigation(oFilterBarConditions: any, sRootPath: string, aParameters?: any[]) {
		let sPath;
		const oDistinctKeys: any = {};
		const oFilterConditionsWithoutConflict: any = {};
		let sMainEntityValuePath, sCurrentValuePath, sFullContextPath, sWinnerValuePath, sPathInContext;

		function _findDistinctKeysInObject(LookUpObject: any) {
			let sLookUpObjectMetaPath;
			for (let sKey in LookUpObject) {
				if (LookUpObject[sKey]) {
					if (sKey.includes("/")) {
						sLookUpObjectMetaPath = sKey; // "/SalesOrdermanage/_Item/Material"
						const aPathParts = sKey.split("/");
						sKey = aPathParts[aPathParts.length - 1];
					} else {
						sLookUpObjectMetaPath = sRootPath;
					}
					if (!oDistinctKeys[sKey]) {
						// if key is found for the first time then create array
						oDistinctKeys[sKey] = [];
					}

					// push path to array
					oDistinctKeys[sKey].push(sLookUpObjectMetaPath);
				}
			}
		}

		_findDistinctKeysInObject(oFilterBarConditions);
		for (const sDistinctKey in oDistinctKeys) {
			const aConflictingPaths = oDistinctKeys[sDistinctKey];

			if (aConflictingPaths.length > 1) {
				// conflict
				for (let i = 0; i <= aConflictingPaths.length - 1; i++) {
					sPath = aConflictingPaths[i];
					if (sPath === sRootPath) {
						sFullContextPath = `${sRootPath}/${sDistinctKey}`;
						sPathInContext = sDistinctKey;
						sMainEntityValuePath = sDistinctKey;
						if (aParameters && aParameters.includes(sDistinctKey)) {
							oFilterBarConditions[`$Parameter.${sDistinctKey}`] = oFilterBarConditions[sDistinctKey];
						}
					} else {
						sPathInContext = sPath;
						sFullContextPath = (`${sRootPath}/${sPath}` as any).replaceAll(/\*/g, "");
						sCurrentValuePath = sPath;
					}
					oFilterBarConditions[
						sFullContextPath
							.split("/")
							.filter(function (sValue: any) {
								return sValue != "";
							})
							.join(".")
					] = oFilterBarConditions[sPathInContext];
					delete oFilterBarConditions[sPath];
				}

				sWinnerValuePath = sMainEntityValuePath || sCurrentValuePath;
				oFilterBarConditions[sDistinctKey] = oFilterBarConditions[sWinnerValuePath];
			} else {
				// no conflict, add distinct key without adding paths
				sPath = aConflictingPaths[0];
				sFullContextPath =
					sPath === sRootPath ? `${sRootPath}/${sDistinctKey}` : (`${sRootPath}/${sPath}` as any).replaceAll("*", "");
				oFilterConditionsWithoutConflict[sDistinctKey] = sFullContextPath
					.split("/")
					.filter(function (sValue: any) {
						return sValue != "";
					})
					.join(".");
				if (aParameters && aParameters.includes(sDistinctKey)) {
					oFilterBarConditions[`$Parameter.${sDistinctKey}`] = oFilterBarConditions[sDistinctKey];
				}
			}
		}

		return {
			filterConditions: oFilterBarConditions,
			filterConditionsWithoutConflict: oFilterConditionsWithoutConflict
		};
	}

	/**
	 * Get Navigation mode.
	 *
	 * @returns The navigation mode
	 */
	@publicExtension()
	@extensible(OverrideExecution.Instead)
	getNavigationMode() {
		return undefined;
	}

	/**
	 * Allows for navigation to a given intent (SemanticObject-Action) with the provided context, using a dialog that shows the contexts which cannot be passed
	 * If semantic object mapping is provided, this setting is also applied to the selection variant after adaptation by a consumer.
	 * This setting also removes any technical parameters and determines if an inplace or explace navigation should take place.
	 *
	 * @param sSemanticObject Semantic object for the target app
	 * @param sAction  Action for the target app
	 * @param [mNavigationParameters] Optional parameters to be passed to the external navigation
	 */
	@publicExtension()
	@finalExtension()
	async navigateWithConfirmationDialog(sSemanticObject: string, sAction: string, mNavigationParameters?: NavigationParameters) {
		let shouldContinue = true;
		if (mNavigationParameters?.notApplicableContexts && mNavigationParameters.notApplicableContexts?.length >= 1) {
			const metaModel = this.getView().getModel().getMetaModel() as ODataMetaModel;
			const entitySetPath = metaModel.getMetaPath(mNavigationParameters.notApplicableContexts[0].getPath());
			const convertedMetadata = convertTypes(metaModel);
			const entitySet = convertedMetadata.resolvePath<EntitySet>(entitySetPath).target!;
			// Show the contexts that are not applicable and will not therefore be processed
			const notApplicableContextsDialog = new NotApplicableContextDialog({
				title: "",
				entityType: entitySet.entityType,
				resourceModel: getResourceModel(this.getView()),
				notApplicableContexts: mNavigationParameters.notApplicableContexts
			});
			mNavigationParameters.navigationContexts = mNavigationParameters.applicableContexts;
			shouldContinue = await notApplicableContextsDialog.open(this.getView());
		}
		if (shouldContinue) {
			this.navigate(sSemanticObject, sAction, mNavigationParameters);
		}
	}

	_removeTechnicalParameters(oSelectionVariant: any) {
		oSelectionVariant.removeSelectOption("@odata.context");
		oSelectionVariant.removeSelectOption("@odata.metadataEtag");
		oSelectionVariant.removeSelectOption("SAP__Messages");
	}

	/**
	 * Get targeted Entity set.
	 *
	 * @returns Entity set name
	 */
	@privateExtension()
	getEntitySet() {
		return (this._oView.getViewData() as any).entitySet;
	}

	/**
	 * Removes sensitive data from the semantic attribute with respect to the entitySet.
	 *
	 * @param oAttributes Context data
	 * @param sMetaPath Meta path to reach the entitySet in the MetaModel
	 * @returns Array of semantic Attributes
	 * @private
	 */
	// TO-DO add unit tests for this function in the controller extension qunit.
	@publicExtension()
	@finalExtension()
	removeSensitiveData(oAttributes: any, sMetaPath: string) {
		if (oAttributes) {
			const { transAggregations, customAggregates } = this._getAggregates(
				sMetaPath,
				this.base.getView(),
				this.base.getAppComponent().getDiagnostics()
			);
			const aProperties = Object.keys(oAttributes);
			if (aProperties.length) {
				delete oAttributes["@odata.context"];
				delete oAttributes["@odata.metadataEtag"];
				delete oAttributes["SAP__Messages"];
				for (const element of aProperties) {
					if (oAttributes[element] && typeof oAttributes[element] === "object") {
						this.removeSensitiveData(oAttributes[element], `${sMetaPath}/${element}`);
					}
					if (element.indexOf("@odata.type") > -1) {
						delete oAttributes[element];
						continue;
					}
					this._deleteAggregates([...transAggregations, ...customAggregates], element, oAttributes);
					const aPropertyAnnotations = this._getPropertyAnnotations(element, sMetaPath, oAttributes, this._oMetaModel);
					if (aPropertyAnnotations) {
						if (
							aPropertyAnnotations.PersonalData?.IsPotentiallySensitive ||
							aPropertyAnnotations.UI?.ExcludeFromNavigationContext ||
							aPropertyAnnotations.Analytics?.Measure
						) {
							delete oAttributes[element];
						} else if (aPropertyAnnotations.Common?.FieldControl) {
							const oFieldControl = aPropertyAnnotations.Common.FieldControl as any;
							if (
								(oFieldControl["$EnumMember"] && oFieldControl["$EnumMember"].split("/")[1] === "Inapplicable") ||
								(oFieldControl["$Path"] && this._isFieldControlPathInapplicable(oFieldControl["$Path"], oAttributes))
							) {
								delete oAttributes[element];
							}
						}
					}
				}
			}
		}
		return oAttributes;
	}

	/**
	 * Remove the attribute from navigation data if it is a measure.
	 *
	 * @param aggregates Array of Aggregates
	 * @param sProp Attribute name
	 * @param oAttributes SemanticAttributes
	 */
	_deleteAggregates(aggregates: string[] | undefined, sProp: string, oAttributes: any) {
		if (aggregates && aggregates.indexOf(sProp) > -1) {
			delete oAttributes[sProp];
		}
	}

	/**
	 * Returns the property annotations.
	 *
	 * @param sProp
	 * @param sMetaPath
	 * @param oAttributes
	 * @param oMetaModel
	 * @returns - The property annotations
	 */
	_getPropertyAnnotations(sProp: string, sMetaPath: string, oAttributes: any, oMetaModel: ODataMetaModel) {
		if (oAttributes[sProp] && sMetaPath && !sMetaPath.includes("undefined")) {
			const oContext = oMetaModel.createBindingContext(`${sMetaPath}/${sProp}`) as ODataV4Context;
			const oFullContext = MetaModelConverter.getInvolvedDataModelObjects(oContext);
			return oFullContext?.targetObject?.annotations as PropertyAnnotations | undefined;
		}
		return null;
	}

	/**
	 * Returns the aggregates part of the EntitySet or EntityType.
	 *
	 * @param sMetaPath
	 * @param oView
	 * @param oDiagnostics
	 * @returns - The aggregates
	 */
	_getAggregates(sMetaPath: string, oView: View, oDiagnostics: Diagnostics) {
		const converterContext = this._getConverterContext(sMetaPath, oView, oDiagnostics);
		const aggregationHelper = new AggregationHelper(converterContext.getEntityType(), converterContext);
		const isAnalyticsSupported = aggregationHelper.isAnalyticsSupported();
		let transAggregations, customAggregates;
		if (isAnalyticsSupported) {
			transAggregations = aggregationHelper.getTransAggregations();
			if (transAggregations?.length) {
				transAggregations = transAggregations.map((transAgg: any) => {
					return transAgg.Name || transAgg.Value;
				});
			}
			customAggregates = aggregationHelper.getCustomAggregateDefinitions();
			if (customAggregates?.length) {
				customAggregates = customAggregates.map((customAggregate: any) => {
					return customAggregate.qualifier;
				});
			}
		}
		transAggregations = transAggregations ? transAggregations : [];
		customAggregates = customAggregates ? customAggregates : [];
		return { transAggregations, customAggregates };
	}

	/**
	 * Returns converterContext.
	 *
	 * @param sMetaPath
	 * @param oView
	 * @param oDiagnostics
	 * @returns - ConverterContext
	 */
	_getConverterContext(sMetaPath: string, oView: View, oDiagnostics: Diagnostics) {
		const oViewData: any = oView.getViewData();
		let sEntitySet = oViewData.entitySet;
		const sContextPath = oViewData.contextPath;
		if (sContextPath && (!sEntitySet || sEntitySet.includes("/"))) {
			sEntitySet = oViewData?.fullContextPath.split("/")[1];
		}
		return CommonUtils.getConverterContextForPath(
			sMetaPath,
			oView.getModel().getMetaModel() as ODataMetaModel,
			sEntitySet,
			oDiagnostics
		);
	}

	/**
	 * Check if path-based FieldControl evaluates to inapplicable.
	 *
	 * @param sFieldControlPath Field control path
	 * @param oAttribute SemanticAttributes
	 * @returns `true` if inapplicable
	 */
	_isFieldControlPathInapplicable(sFieldControlPath: string, oAttribute: any) {
		let bInapplicable = false;
		const aParts = sFieldControlPath.split("/");
		// sensitive data is removed only if the path has already been resolved.
		if (aParts.length > 1) {
			bInapplicable =
				oAttribute[aParts[0]] && oAttribute[aParts[0]].hasOwnProperty(aParts[1]) && oAttribute[aParts[0]][aParts[1]] === 0;
		} else {
			bInapplicable = oAttribute[sFieldControlPath] === 0;
		}
		return bInapplicable;
	}

	/**
	 * Method to replace Local Properties with Semantic Object mappings.
	 *
	 * @param oSelectionVariant SelectionVariant consisting of filterbar, Table and Page Context
	 * @param vMappings A string representation of semantic object mapping
	 * @returns - Modified SelectionVariant with LocalProperty replaced with SemanticObjectProperties.
	 */
	_applySemanticObjectMappings(oSelectionVariant: SelectionVariant, vMappings: object | string) {
		const oMappings = typeof vMappings === "string" ? JSON.parse(vMappings) : vMappings;
		for (let i = 0; i < oMappings.length; i++) {
			const sLocalProperty =
				(oMappings[i]["LocalProperty"] && oMappings[i]["LocalProperty"]["$PropertyPath"]) ||
				(oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"] &&
					oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"]["$Path"]);
			const sSemanticObjectProperty =
				oMappings[i]["SemanticObjectProperty"] || oMappings[i]["@com.sap.vocabularies.Common.v1.SemanticObjectProperty"];
			const oSelectOption = oSelectionVariant.getSelectOption(sLocalProperty);
			if (oSelectOption) {
				//Create a new SelectOption with sSemanticObjectProperty as the property Name and remove the older one
				oSelectionVariant.removeSelectOption(sLocalProperty);
				oSelectionVariant.massAddSelectOption(sSemanticObjectProperty, oSelectOption);
			}
		}
		return oSelectionVariant;
	}

	/**
	 * Navigates to an Outbound provided in the manifest.
	 *
	 * @function
	 * @param sOutbound Identifier to location the outbound in the manifest
	 * @param mNavigationParameters Optional map containing key/value pairs to be passed to the intent
	 * @alias sap.fe.core.controllerextensions.IntentBasedNavigation#navigateOutbound
	 * @since 1.86.0
	 */
	@publicExtension()
	@finalExtension()
	navigateOutbound(sOutbound: string, mNavigationParameters: any) {
		let aNavParams: any[] | undefined;
		const oManifestEntry = this.base.getAppComponent().getManifestEntry("sap.app"),
			oOutbound = oManifestEntry.crossNavigation?.outbounds?.[sOutbound];
		if (!oOutbound) {
			Log.error("Outbound is not defined in manifest!!");
			return;
		}
		const sSemanticObject = oOutbound.semanticObject,
			sAction = oOutbound.action,
			outboundParams = oOutbound.parameters && this.getOutboundParams(oOutbound.parameters);

		if (mNavigationParameters) {
			aNavParams = [];
			Object.keys(mNavigationParameters).forEach(function (key: string) {
				let oParams: any;
				if (Array.isArray(mNavigationParameters[key])) {
					const aValues = mNavigationParameters[key];
					for (let i = 0; i < aValues.length; i++) {
						oParams = {};
						oParams[key] = aValues[i];
						aNavParams?.push(oParams);
					}
				} else {
					oParams = {};
					oParams[key] = mNavigationParameters[key];
					aNavParams?.push(oParams);
				}
			});
		}
		if (aNavParams || outboundParams) {
			mNavigationParameters = {
				navigationContexts: {
					data: aNavParams || outboundParams
				}
			};
		}
		this.base._intentBasedNavigation.navigate(sSemanticObject, sAction, mNavigationParameters);
	}

	/**
	 * Method to apply outbound parameters defined in the manifest.
	 *
	 * @param oSelectionVariant SelectionVariant consisting of a filter bar, a table, and a page context
	 * @param vOutboundParams Outbound Properties defined in the manifest
	 * @returns - The modified SelectionVariant with outbound parameters.
	 */
	_applyOutboundParams(oSelectionVariant: SelectionVariant, vOutboundParams: any) {
		const aParameters = Object.keys(vOutboundParams);
		const aSelectProperties = oSelectionVariant.getSelectOptionsPropertyNames();
		aParameters.forEach(function (key: string) {
			if (!aSelectProperties.includes(key)) {
				oSelectionVariant.addSelectOption(key, "I", "EQ", vOutboundParams[key]);
			}
		});
		return oSelectionVariant;
	}

	/**
	 * Method to get the outbound parameters defined in the manifest.
	 *
	 * @function
	 * @param oOutboundParams Parameters defined in the outbounds. Only "plain" is supported
	 * @returns Parameters with the key-Value pair
	 */
	@publicExtension()
	@finalExtension()
	getOutboundParams(oOutboundParams: any) {
		const oParamsMapping: any = {};
		if (oOutboundParams) {
			const aParameters = Object.keys(oOutboundParams) || [];
			if (aParameters.length > 0) {
				aParameters.forEach(function (key: string) {
					const oMapping = oOutboundParams[key];
					if (oMapping.value && oMapping.value.value && oMapping.value.format === "plain") {
						if (!oParamsMapping[key]) {
							oParamsMapping[key] = oMapping.value.value;
						}
					}
				});
			}
		}
		return oParamsMapping;
	}

	/**
	 * Triggers an outbound navigation when a user chooses the chevron.
	 *
	 * @param {object} oController
	 * @param {string} sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
	 * @param {sap.ui.model.odata.v4.Context} oContext The context that contains the data for the target app
	 * @param {string} sCreatePath Create path when the chevron is created.
	 * @returns {Promise} Promise which is resolved once the navigation is triggered
	 */

	@publicExtension()
	@finalExtension()
	onChevronPressNavigateOutBound(oController: PageController, sOutboundTarget: string, oContext: any, sCreatePath: string) {
		const oOutbounds = (oController.getAppComponent() as any).getRoutingService().getOutbounds();
		const oDisplayOutbound = oOutbounds[sOutboundTarget];
		let additionalNavigationParameters;
		if (oDisplayOutbound && oDisplayOutbound.semanticObject && oDisplayOutbound.action) {
			const oRefreshStrategies: any = {
				intents: {}
			};
			const oDefaultRefreshStrategy: any = {};
			let sMetaPath;

			if (oContext) {
				if (oContext.isA && oContext.isA("sap.ui.model.odata.v4.Context")) {
					sMetaPath = ModelHelper.getMetaPathForContext(oContext);
					oContext = [oContext];
				} else {
					sMetaPath = ModelHelper.getMetaPathForContext(oContext[0]);
				}
				oDefaultRefreshStrategy[sMetaPath] = "self";
				oRefreshStrategies["_feDefault"] = oDefaultRefreshStrategy;
			}

			if (sCreatePath) {
				const sKey = `${oDisplayOutbound.semanticObject}-${oDisplayOutbound.action}`;
				oRefreshStrategies.intents[sKey] = {};
				oRefreshStrategies.intents[sKey][sCreatePath] = "self";
			}
			if (oDisplayOutbound && oDisplayOutbound.parameters) {
				const oParams = oDisplayOutbound.parameters && this.getOutboundParams(oDisplayOutbound.parameters);
				if (Object.keys(oParams).length > 0) {
					additionalNavigationParameters = oParams;
				}
			}

			oController._intentBasedNavigation.navigate(oDisplayOutbound.semanticObject, oDisplayOutbound.action, {
				navigationContexts: oContext,
				refreshStrategies: oRefreshStrategies,
				additionalNavigationParameters: additionalNavigationParameters
			});

			//TODO: check why returning a promise is required
			return Promise.resolve();
		} else {
			throw new Error(`outbound target ${sOutboundTarget} not found in cross navigation definition of manifest`);
		}
	}
}

export default InternalIntentBasedNavigation;
