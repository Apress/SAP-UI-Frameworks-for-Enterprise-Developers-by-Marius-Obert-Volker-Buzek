import type * as Edm from "@sap-ux/vocabularies-types/Edm";
import type { FilterRestrictionsType } from "@sap-ux/vocabularies-types/vocabularies/Capabilities";
import type { SemanticObjectMappingType, SemanticObjectUnavailableActions } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import type { TextArrangement } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import uniqueSort from "sap/base/util/array/uniqueSort";
import mergeObjects from "sap/base/util/merge";
import type AppComponent from "sap/fe/core/AppComponent";
import type { ComponentData } from "sap/fe/core/AppComponent";
import ConverterContext from "sap/fe/core/converters/ConverterContext";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import { compileExpression, pathInModel } from "sap/fe/core/helpers/BindingToolkit";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import SemanticDateOperators from "sap/fe/core/helpers/SemanticDateOperators";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import type PageController from "sap/fe/core/PageController";
import type { IShellServices } from "sap/fe/core/services/ShellServicesFactory";
import type Diagnostics from "sap/fe/core/support/Diagnostics";
import TypeUtil from "sap/fe/core/type/TypeUtil";
import type SelectionVariant from "sap/fe/navigation/SelectionVariant";
import type { SelectOption, SemanticDateConfiguration } from "sap/fe/navigation/SelectionVariant";
import type Button from "sap/m/Button";
import type MenuButton from "sap/m/MenuButton";
import type NavContainer from "sap/m/NavContainer";
import type OverflowToolbarButton from "sap/m/OverflowToolbarButton";
import type ManagedObject from "sap/ui/base/ManagedObject";
import Component from "sap/ui/core/Component";
import type ComponentContainer from "sap/ui/core/ComponentContainer";
import type Control from "sap/ui/core/Control";
import type UI5Element from "sap/ui/core/Element";
import Fragment from "sap/ui/core/Fragment";
import type Controller from "sap/ui/core/mvc/Controller";
import type View from "sap/ui/core/mvc/View";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import Device, { system } from "sap/ui/Device";
import type ActionToolbarAction from "sap/ui/mdc/actiontoolbar/ActionToolbarAction";
import type { default as MDCChart } from "sap/ui/mdc/Chart";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import FilterOperatorUtil from "sap/ui/mdc/condition/FilterOperatorUtil";
import RangeOperator from "sap/ui/mdc/condition/RangeOperator";
import type FilterBar from "sap/ui/mdc/FilterBar";
import type Table from "sap/ui/mdc/Table";
import type MDCTable from "sap/ui/mdc/valuehelp/content/MDCTable";
import type Context from "sap/ui/model/Context";
import Filter from "sap/ui/model/Filter";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type ODataV4Context from "sap/ui/model/odata/v4/Context";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type ObjectPageDynamicHeaderTitle from "sap/uxap/ObjectPageDynamicHeaderTitle";
import type ObjectPageLayout from "sap/uxap/ObjectPageLayout";
import type {
	ExpandPathType,
	MetaModelEntityType,
	MetaModelEnum,
	MetaModelNavProperty,
	MetaModelProperty,
	MetaModelType
} from "types/metamodel_types";
import AnyElement from "./controls/AnyElement";
import * as MetaModelFunction from "./helpers/MetaModelFunction";
import { getConditions } from "./templating/FilterHelper";

type ConditionType = {
	operator: string;
	values: Array<unknown> | undefined;
	validated?: string;
};

type MyInboxIntent = {
	semanticObject: string;
	action: string;
};

function normalizeSearchTerm(sSearchTerm: string) {
	if (!sSearchTerm) {
		return undefined;
	}

	return sSearchTerm
		.replace(/"/g, " ")
		.replace(/\\/g, "\\\\") //escape backslash characters. Can be removed if odata/binding handles backend errors responds.
		.split(/\s+/)
		.reduce(function (sNormalized: string | undefined, sCurrentWord: string) {
			if (sCurrentWord !== "") {
				sNormalized = `${sNormalized ? `${sNormalized} ` : ""}"${sCurrentWord}"`;
			}
			return sNormalized;
		}, undefined);
}

async function waitForContextRequested(bindingContext: ODataV4Context) {
	const model = bindingContext.getModel();
	const metaModel = model.getMetaModel();
	const entityPath = metaModel.getMetaPath(bindingContext.getPath());
	const dataModel = MetaModelConverter.getInvolvedDataModelObjects(metaModel.getContext(entityPath));
	await bindingContext.requestProperty(dataModel.targetEntityType.keys[0]?.name);
}

function fnHasTransientContexts(oListBinding: ODataListBinding) {
	let bHasTransientContexts = false;
	if (oListBinding) {
		oListBinding.getCurrentContexts().forEach(function (oContext: ODataV4Context) {
			if (oContext && oContext.isTransient()) {
				bHasTransientContexts = true;
			}
		});
	}
	return bHasTransientContexts;
}

// there is no navigation in entitySet path and property path

async function _getSOIntents(
	oShellServiceHelper: IShellServices,
	oObjectPageLayout: ObjectPageLayout,
	oSemanticObject: unknown,
	oParam: unknown
): Promise<LinkDefinition[]> {
	return oShellServiceHelper.getLinks({
		semanticObject: oSemanticObject,
		params: oParam
	}) as Promise<LinkDefinition[]>;
}

// TO-DO add this as part of applySemanticObjectmappings logic in IntentBasednavigation controller extension
function _createMappings(oMapping: Record<string, unknown>) {
	const aSOMappings = [];
	const aMappingKeys = Object.keys(oMapping);
	let oSemanticMapping;
	for (let i = 0; i < aMappingKeys.length; i++) {
		oSemanticMapping = {
			LocalProperty: {
				$PropertyPath: aMappingKeys[i]
			},
			SemanticObjectProperty: oMapping[aMappingKeys[i]]
		};
		aSOMappings.push(oSemanticMapping);
	}

	return aSOMappings;
}
type LinkDefinition = {
	intent: string;
	text: string;
};
type SemanticItem = {
	text: string;
	targetSemObject: string;
	targetAction: string;
	targetParams: unknown;
};
/**
 * @param aLinks
 * @param aExcludedActions
 * @param oTargetParams
 * @param aItems
 * @param aAllowedActions
 */
function _getRelatedAppsMenuItems(
	aLinks: LinkDefinition[],
	aExcludedActions: unknown[],
	oTargetParams: unknown,
	aItems: SemanticItem[],
	aAllowedActions?: unknown[]
) {
	for (let i = 0; i < aLinks.length; i++) {
		const oLink = aLinks[i];
		const sIntent = oLink.intent;
		const sAction = sIntent.split("-")[1].split("?")[0];
		if (aAllowedActions && aAllowedActions.includes(sAction)) {
			aItems.push({
				text: oLink.text,
				targetSemObject: sIntent.split("#")[1].split("-")[0],
				targetAction: sAction.split("~")[0],
				targetParams: oTargetParams
			});
		} else if (!aAllowedActions && aExcludedActions && aExcludedActions.indexOf(sAction) === -1) {
			aItems.push({
				text: oLink.text,
				targetSemObject: sIntent.split("#")[1].split("-")[0],
				targetAction: sAction.split("~")[0],
				targetParams: oTargetParams
			});
		}
	}
}

type SemanticObject = {
	allowedActions?: unknown[];
	unavailableActions?: unknown[];
	semanticObject: string;
	path: string;
	mapping?: Record<string, string>;
};

function _getRelatedIntents(
	oAdditionalSemanticObjects: SemanticObject,
	oBindingContext: Context,
	aManifestSOItems: SemanticItem[],
	aLinks: LinkDefinition[]
) {
	if (aLinks && aLinks.length > 0) {
		const aAllowedActions = oAdditionalSemanticObjects.allowedActions || undefined;
		const aExcludedActions = oAdditionalSemanticObjects.unavailableActions ? oAdditionalSemanticObjects.unavailableActions : [];
		const aSOMappings = oAdditionalSemanticObjects.mapping ? _createMappings(oAdditionalSemanticObjects.mapping) : [];
		const oTargetParams = { navigationContexts: oBindingContext, semanticObjectMapping: aSOMappings };
		_getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aManifestSOItems, aAllowedActions);
	}
}

/**
 * @description This function fetches the related intents when semantic object and action are passed from feEnvironment.getIntent() only in case of My Inbox integration
 * @param semanticObjectAndAction This specifies the semantic object and action for fetching the intents
 * @param oBindingContext This sepcifies the binding context for updating related apps
 * @param appComponentSOItems This is a list of semantic items used for updating the related apps button
 * @param aLinks This is an array comprising of related intents
 */

function _getRelatedIntentsWithSemanticObjectsAndAction(
	semanticObjectAndAction: MyInboxIntent,
	oBindingContext: Context,
	appComponentSOItems: SemanticItem[],
	aLinks: LinkDefinition[]
) {
	if (aLinks.length > 0) {
		const actions = [semanticObjectAndAction.action];
		const excludedActions: [] = [];
		const soMappings: [] = [];
		const targetParams = { navigationContexts: oBindingContext, semanticObjectMapping: soMappings };
		_getRelatedAppsMenuItems(aLinks, excludedActions, targetParams, appComponentSOItems, actions);
	}
}

type SemanticObjectConfig = {
	additionalSemanticObjects: Record<string, SemanticObject>;
};
type RelatedAppsConfig = {
	text: string;
	targetSemObject: string;
	targetAction: string;
};
async function updateRelateAppsModel(
	oBindingContext: Context,
	oEntry: Record<string, unknown> | undefined,
	oObjectPageLayout: ObjectPageLayout,
	aSemKeys: { $PropertyPath: string }[],
	oMetaModel: ODataMetaModel,
	oMetaPath: string,
	appComponent: AppComponent
): Promise<RelatedAppsConfig[]> {
	const oShellServiceHelper: IShellServices = appComponent.getShellServices();
	const oParam: Record<string, unknown> = {};
	let sCurrentSemObj = "",
		sCurrentAction = "";
	let oSemanticObjectAnnotations;
	let aRelatedAppsMenuItems: RelatedAppsConfig[] = [];
	let aExcludedActions: unknown[] = [];
	let aManifestSOKeys: string[];

	async function fnGetParseShellHashAndGetLinks() {
		const oParsedUrl = oShellServiceHelper.parseShellHash(document.location.hash);
		sCurrentSemObj = oParsedUrl.semanticObject; // Current Semantic Object
		sCurrentAction = oParsedUrl.action;
		return _getSOIntents(oShellServiceHelper, oObjectPageLayout, sCurrentSemObj, oParam);
	}

	try {
		if (oEntry) {
			if (aSemKeys && aSemKeys.length > 0) {
				for (let j = 0; j < aSemKeys.length; j++) {
					const sSemKey = aSemKeys[j].$PropertyPath;
					if (!oParam[sSemKey]) {
						oParam[sSemKey] = { value: oEntry[sSemKey] };
					}
				}
			} else {
				// fallback to Technical Keys if no Semantic Key is present
				const aTechnicalKeys = oMetaModel.getObject(`${oMetaPath}/$Type/$Key`);
				for (const key in aTechnicalKeys) {
					const sObjKey = aTechnicalKeys[key];
					if (!oParam[sObjKey]) {
						oParam[sObjKey] = { value: oEntry[sObjKey] };
					}
				}
			}
		}
		// Logic to read additional SO from manifest and updated relatedapps model

		const oManifestData = getTargetView(oObjectPageLayout).getViewData() as SemanticObjectConfig;
		const aManifestSOItems: SemanticItem[] = [];
		let semanticObjectIntents;
		if (oManifestData.additionalSemanticObjects) {
			aManifestSOKeys = Object.keys(oManifestData.additionalSemanticObjects);
			for (let key = 0; key < aManifestSOKeys.length; key++) {
				semanticObjectIntents = await Promise.resolve(
					_getSOIntents(oShellServiceHelper, oObjectPageLayout, aManifestSOKeys[key], oParam)
				);
				_getRelatedIntents(
					oManifestData.additionalSemanticObjects[aManifestSOKeys[key]],
					oBindingContext,
					aManifestSOItems,
					semanticObjectIntents
				);
			}
		}

		// appComponentSOItems is updated in case of My Inbox integration when semantic object and action are passed from feEnvironment.getIntent() method
		// In other cases it remains as an empty list
		// We concat this list towards the end with aManifestSOItems

		const appComponentSOItems: SemanticItem[] = [];
		const componentData: ComponentData = appComponent.getComponentData();
		if (componentData.feEnvironment && componentData.feEnvironment.getIntent()) {
			const intent: MyInboxIntent = componentData.feEnvironment.getIntent();
			semanticObjectIntents = await Promise.resolve(
				_getSOIntents(oShellServiceHelper, oObjectPageLayout, intent.semanticObject, oParam)
			);
			_getRelatedIntentsWithSemanticObjectsAndAction(intent, oBindingContext, appComponentSOItems, semanticObjectIntents);
		}

		const internalModelContext = oObjectPageLayout.getBindingContext("internal") as InternalModelContext;
		const aLinks = await fnGetParseShellHashAndGetLinks();
		if (aLinks) {
			if (aLinks.length > 0) {
				let isSemanticObjectHasSameTargetInManifest = false;
				const oTargetParams: {
					navigationContexts?: Context;
					semanticObjectMapping?: MetaModelType<SemanticObjectMappingType>[];
				} = {};
				const aAnnotationsSOItems: SemanticItem[] = [];
				const sEntitySetPath = `${oMetaPath}@`;
				const sEntityTypePath = `${oMetaPath}/@`;
				const oEntitySetAnnotations = oMetaModel.getObject(sEntitySetPath);
				oSemanticObjectAnnotations = CommonUtils.getSemanticObjectAnnotations(oEntitySetAnnotations, sCurrentSemObj);
				if (!oSemanticObjectAnnotations.bHasEntitySetSO) {
					const oEntityTypeAnnotations = oMetaModel.getObject(sEntityTypePath);
					oSemanticObjectAnnotations = CommonUtils.getSemanticObjectAnnotations(oEntityTypeAnnotations, sCurrentSemObj);
				}
				aExcludedActions = oSemanticObjectAnnotations.aUnavailableActions;
				//Skip same application from Related Apps
				aExcludedActions.push(sCurrentAction);
				oTargetParams.navigationContexts = oBindingContext;
				oTargetParams.semanticObjectMapping = oSemanticObjectAnnotations.aMappings;
				_getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aAnnotationsSOItems);

				aManifestSOItems.forEach(function ({ targetSemObject }) {
					if (aAnnotationsSOItems[0]?.targetSemObject === targetSemObject) {
						isSemanticObjectHasSameTargetInManifest = true;
					}
				});

				// remove all actions from current hash application if manifest contains empty allowedActions
				if (
					oManifestData.additionalSemanticObjects &&
					aAnnotationsSOItems[0] &&
					oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject] &&
					!!oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject].allowedActions
				) {
					isSemanticObjectHasSameTargetInManifest = true;
				}
				const soItems = aManifestSOItems.concat(appComponentSOItems);
				aRelatedAppsMenuItems = isSemanticObjectHasSameTargetInManifest ? soItems : soItems.concat(aAnnotationsSOItems);
				// If no app in list, related apps button will be hidden
				internalModelContext.setProperty("relatedApps/visibility", aRelatedAppsMenuItems.length > 0);
				internalModelContext.setProperty("relatedApps/items", aRelatedAppsMenuItems);
			} else {
				internalModelContext.setProperty("relatedApps/visibility", false);
			}
		} else {
			internalModelContext.setProperty("relatedApps/visibility", false);
		}
	} catch (error: unknown) {
		Log.error("Cannot read links", error as string);
	}
	return aRelatedAppsMenuItems;
}

function _getSemanticObjectAnnotations(oEntityAnnotations: Record<string, unknown>, sCurrentSemObj: string) {
	const oSemanticObjectAnnotations = {
		bHasEntitySetSO: false,
		aAllowedActions: [],
		aUnavailableActions: [] as MetaModelType<SemanticObjectUnavailableActions>[],
		aMappings: [] as MetaModelType<SemanticObjectMappingType>[]
	};
	let sAnnotationMappingTerm, sAnnotationActionTerm;
	let sQualifier;
	for (const key in oEntityAnnotations) {
		if (key.indexOf(CommonAnnotationTerms.SemanticObject) > -1 && oEntityAnnotations[key] === sCurrentSemObj) {
			oSemanticObjectAnnotations.bHasEntitySetSO = true;
			sAnnotationMappingTerm = `@${CommonAnnotationTerms.SemanticObjectMapping}`;
			sAnnotationActionTerm = `@${CommonAnnotationTerms.SemanticObjectUnavailableActions}`;

			if (key.indexOf("#") > -1) {
				sQualifier = key.split("#")[1];
				sAnnotationMappingTerm = `${sAnnotationMappingTerm}#${sQualifier}`;
				sAnnotationActionTerm = `${sAnnotationActionTerm}#${sQualifier}`;
			}
			if (oEntityAnnotations[sAnnotationMappingTerm]) {
				oSemanticObjectAnnotations.aMappings = oSemanticObjectAnnotations.aMappings.concat(
					oEntityAnnotations[sAnnotationMappingTerm] as MetaModelType<SemanticObjectMappingType>
				);
			}

			if (oEntityAnnotations[sAnnotationActionTerm]) {
				oSemanticObjectAnnotations.aUnavailableActions = oSemanticObjectAnnotations.aUnavailableActions.concat(
					oEntityAnnotations[sAnnotationActionTerm] as MetaModelType<SemanticObjectUnavailableActions>
				);
			}

			break;
		}
	}
	return oSemanticObjectAnnotations;
}

function fnUpdateRelatedAppsDetails(oObjectPageLayout: ObjectPageLayout, appComponent: AppComponent) {
	const oMetaModel = oObjectPageLayout.getModel().getMetaModel() as ODataMetaModel;
	const oBindingContext = oObjectPageLayout.getBindingContext() as ODataV4Context;
	const path = (oBindingContext && oBindingContext.getPath()) || "";
	const oMetaPath = oMetaModel.getMetaPath(path);
	// Semantic Key Vocabulary
	const sSemanticKeyVocabulary = `${oMetaPath}/` + `@com.sap.vocabularies.Common.v1.SemanticKey`;
	//Semantic Keys
	const aSemKeys = oMetaModel.getObject(sSemanticKeyVocabulary);
	// Unavailable Actions
	const oEntry = oBindingContext?.getObject();
	if (!oEntry && oBindingContext) {
		oBindingContext
			.requestObject()
			.then(async function (requestedObject: Record<string, unknown> | undefined) {
				return CommonUtils.updateRelateAppsModel(
					oBindingContext,
					requestedObject,
					oObjectPageLayout,
					aSemKeys,
					oMetaModel,
					oMetaPath,
					appComponent
				);
			})
			.catch(function (oError: unknown) {
				Log.error("Cannot update the related app details", oError as string);
			});
	} else {
		return CommonUtils.updateRelateAppsModel(oBindingContext, oEntry, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath, appComponent);
	}
}

/**
 * @param oButton
 */
function fnFireButtonPress(oButton: Control) {
	if (
		oButton &&
		oButton.isA<Button | OverflowToolbarButton>(["sap.m.Button", "sap.m.OverflowToolbarButton"]) &&
		oButton.getVisible() &&
		oButton.getEnabled()
	) {
		oButton.firePress();
	}
}

function getAppComponent(oControl: Control | Component): AppComponent {
	if (oControl.isA<AppComponent>("sap.fe.core.AppComponent")) {
		return oControl;
	}
	const oOwner = Component.getOwnerComponentFor(oControl);
	if (!oOwner) {
		throw new Error("There should be a sap.fe.core.AppComponent as owner of the control");
	} else {
		return getAppComponent(oOwner);
	}
}

function getCurrentPageView(oAppComponent: AppComponent) {
	const rootViewController = oAppComponent.getRootViewController();
	return rootViewController.isFclEnabled()
		? rootViewController.getRightmostView()
		: CommonUtils.getTargetView((oAppComponent.getRootContainer() as NavContainer).getCurrentPage());
}

function getTargetView(oControl: ManagedObject | null): View {
	if (oControl && oControl.isA<ComponentContainer>("sap.ui.core.ComponentContainer")) {
		const oComponent = oControl.getComponentInstance();
		oControl = oComponent && oComponent.getRootControl();
	}
	while (oControl && !oControl.isA<View>("sap.ui.core.mvc.View")) {
		oControl = oControl.getParent();
	}
	return oControl!;
}

function _fnCheckIsMatch(oObject: object, oKeysToCheck: Record<string, unknown>) {
	for (const sKey in oKeysToCheck) {
		if (oKeysToCheck[sKey] !== oObject[sKey as keyof typeof oObject]) {
			return false;
		}
	}
	return true;
}

function fnGetContextPathProperties(
	metaModelContext: ODataMetaModel,
	sContextPath: string,
	oFilter?: Record<string, unknown>
): Record<string, MetaModelProperty> | Record<string, MetaModelNavProperty> {
	const oEntityType: MetaModelEntityType = (metaModelContext.getObject(`${sContextPath}/`) || {}) as MetaModelEntityType,
		oProperties: Record<string, MetaModelProperty> | Record<string, MetaModelNavProperty> = {};

	for (const sKey in oEntityType) {
		if (
			oEntityType.hasOwnProperty(sKey) &&
			!/^\$/i.test(sKey) &&
			oEntityType[sKey].$kind &&
			_fnCheckIsMatch(oEntityType[sKey], oFilter || { $kind: "Property" })
		) {
			oProperties[sKey] = oEntityType[sKey];
		}
	}
	return oProperties;
}

function fnGetMandatoryFilterFields(oMetaModel: ODataMetaModel, sContextPath: string) {
	let aMandatoryFilterFields: ExpandPathType<Edm.PropertyPath>[] = [];
	if (oMetaModel && sContextPath) {
		aMandatoryFilterFields = oMetaModel.getObject(
			`${sContextPath}@Org.OData.Capabilities.V1.FilterRestrictions/RequiredProperties`
		) as ExpandPathType<Edm.PropertyPath>[];
	}
	return aMandatoryFilterFields;
}

function fnGetIBNActions(oControl: Table | ObjectPageDynamicHeaderTitle, aIBNActions: unknown[]) {
	const aActions = oControl && oControl.getActions();
	if (aActions) {
		aActions.forEach(function (oAction) {
			if (oAction.isA<ActionToolbarAction>("sap.ui.mdc.actiontoolbar.ActionToolbarAction")) {
				oAction = oAction.getAction();
			}
			if (oAction.isA<MenuButton>("sap.m.MenuButton")) {
				const oMenu = oAction.getMenu();
				const aItems = oMenu.getItems();
				aItems.forEach((oItem) => {
					if (oItem.data("IBNData")) {
						aIBNActions.push(oItem);
					}
				});
			} else if (oAction.data("IBNData")) {
				aIBNActions.push(oAction);
			}
		});
	}
	return aIBNActions;
}

/**
 * @param aIBNActions
 * @param oView
 */
function fnUpdateDataFieldForIBNButtonsVisibility(aIBNActions: Control[], oView: View) {
	const oParams: Record<string, { value: unknown }> = {};
	const oAppComponent = CommonUtils.getAppComponent(oView);
	const isSticky = ModelHelper.isStickySessionSupported((oView.getModel() as ODataModel).getMetaModel());
	const fnGetLinks = function (oData?: Record<string, unknown> | undefined) {
		if (oData) {
			const aKeys = Object.keys(oData);
			aKeys.forEach(function (sKey: string) {
				if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
					oParams[sKey] = { value: oData[sKey] };
				}
			});
		}
		if (aIBNActions.length) {
			aIBNActions.forEach(function (oIBNAction) {
				const sSemanticObject = oIBNAction.data("IBNData").semanticObject;
				const sAction = oIBNAction.data("IBNData").action;
				oAppComponent
					.getShellServices()
					.getLinks({
						semanticObject: sSemanticObject,
						action: sAction,
						params: oParams
					})
					.then(function (aLink) {
						oIBNAction.setVisible(oIBNAction.getVisible() && aLink && aLink.length === 1);
						if (isSticky) {
							(oIBNAction.getBindingContext("internal") as InternalModelContext).setProperty(
								oIBNAction.getId().split("--")[1],
								{
									shellNavigationNotAvailable: !(aLink && aLink.length === 1)
								}
							);
						}
						return;
					})
					.catch(function (oError: unknown) {
						Log.error("Cannot retrieve the links from the shell service", oError as string);
					});
			});
		}
	};
	if (oView && oView.getBindingContext()) {
		(oView.getBindingContext() as ODataV4Context)
			?.requestObject()
			.then(function (oData: Record<string, unknown> | undefined) {
				return fnGetLinks(oData);
			})
			.catch(function (oError: unknown) {
				Log.error("Cannot retrieve the links from the shell service", oError as string);
			});
	} else {
		fnGetLinks();
	}
}

function getActionPath(actionContext: Context, bReturnOnlyPath: boolean, inActionName?: string, bCheckStaticValue?: boolean) {
	const sActionName: string = !inActionName ? actionContext.getObject(actionContext.getPath()).toString() : inActionName;
	let sContextPath = actionContext.getPath().split("/@")[0];
	const sEntityTypeName = (actionContext.getObject(sContextPath) as MetaModelEntityType).$Type;
	const sEntityName = getEntitySetName(actionContext.getModel() as ODataMetaModel, sEntityTypeName);
	if (sEntityName) {
		sContextPath = `/${sEntityName}`;
	}
	if (bCheckStaticValue) {
		return actionContext.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable`);
	}
	if (bReturnOnlyPath) {
		return `${sContextPath}/${sActionName}`;
	} else {
		return {
			sContextPath: sContextPath,
			sProperty: actionContext.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable/$Path`),
			sBindingParameter: actionContext.getObject(`${sContextPath}/${sActionName}/@$ui5.overload/0/$Parameter/0/$Name`)
		};
	}
}

function getEntitySetName(oMetaModel: ODataMetaModel, sEntityType: string) {
	const oEntityContainer = oMetaModel.getObject("/");
	for (const key in oEntityContainer) {
		if (typeof oEntityContainer[key] === "object" && oEntityContainer[key].$Type === sEntityType) {
			return key;
		}
	}
}

function computeDisplayMode(oPropertyAnnotations: Record<string, unknown>, oCollectionAnnotations?: Record<string, unknown>) {
	const oTextAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"],
		oTextArrangementAnnotation = (oTextAnnotation &&
			((oPropertyAnnotations &&
				oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]) ||
				(oCollectionAnnotations &&
					oCollectionAnnotations["@com.sap.vocabularies.UI.v1.TextArrangement"]))) as MetaModelEnum<TextArrangement>;

	if (oTextArrangementAnnotation) {
		if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
			return "Description";
		} else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
			return "ValueDescription";
		} else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate") {
			return "Value";
		}
		//Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
		return "DescriptionValue";
	}
	return oTextAnnotation ? "DescriptionValue" : "Value";
}

function _getEntityType(oContext: ODataV4Context) {
	const oMetaModel = oContext.getModel().getMetaModel();
	return oMetaModel.getObject(`${oMetaModel.getMetaPath(oContext.getPath())}/$Type`);
}

async function _requestObject(sAction: string, oSelectedContext: ODataV4Context, sProperty: string) {
	let oContext = oSelectedContext;
	const nBracketIndex = sAction.indexOf("(");

	if (nBracketIndex > -1) {
		const sTargetType = sAction.slice(nBracketIndex + 1, -1);
		let sCurrentType = _getEntityType(oContext);

		while (sCurrentType !== sTargetType) {
			// Find parent binding context and retrieve entity type
			oContext = oContext.getBinding().getContext() as ODataV4Context;
			if (oContext) {
				sCurrentType = _getEntityType(oContext);
			} else {
				Log.warning("Cannot determine target type to request property value for bound action invocation");
				return Promise.resolve(undefined);
			}
		}
	}

	return oContext.requestObject(sProperty);
}

export type _RequestedProperty = {
	vPropertyValue: unknown;
	oSelectedContext: Context;
	sAction: string;
	sDynamicActionEnabledPath: string;
};
async function requestProperty(
	oSelectedContext: ODataV4Context,
	sAction: string,
	sProperty: string,
	sDynamicActionEnabledPath: string
): Promise<_RequestedProperty> {
	const oPromise =
		sProperty && sProperty.indexOf("/") === 0
			? requestSingletonProperty(sProperty, oSelectedContext.getModel())
			: _requestObject(sAction, oSelectedContext, sProperty);

	return oPromise.then(function (vPropertyValue: unknown) {
		return {
			vPropertyValue: vPropertyValue,
			oSelectedContext: oSelectedContext,
			sAction: sAction,
			sDynamicActionEnabledPath: sDynamicActionEnabledPath
		};
	});
}

async function setContextsBasedOnOperationAvailable(
	oInternalModelContext: InternalModelContext,
	aRequestPromises: Promise<_RequestedProperty>[]
) {
	return Promise.all(aRequestPromises)
		.then(function (aResults) {
			if (aResults.length) {
				const aApplicableContexts: unknown[] = [],
					aNotApplicableContexts: unknown[] = [];
				aResults.forEach(function (aResult) {
					if (aResult) {
						if (aResult.vPropertyValue) {
							oInternalModelContext.getModel().setProperty(aResult.sDynamicActionEnabledPath, true);
							aApplicableContexts.push(aResult.oSelectedContext);
						} else {
							aNotApplicableContexts.push(aResult.oSelectedContext);
						}
					}
				});
				setDynamicActionContexts(oInternalModelContext, aResults[0].sAction, aApplicableContexts, aNotApplicableContexts);
			}
			return;
		})
		.catch(function (oError: unknown) {
			Log.trace("Cannot retrieve property value from path", oError as string);
		});
}

/**
 * @param oInternalModelContext
 * @param sAction
 * @param aApplicable
 * @param aNotApplicable
 */
function setDynamicActionContexts(
	oInternalModelContext: InternalModelContext,
	sAction: string,
	aApplicable: unknown[],
	aNotApplicable: unknown[]
) {
	const sDynamicActionPathPrefix = `${oInternalModelContext.getPath()}/dynamicActions/${sAction}`,
		oInternalModel = oInternalModelContext.getModel();
	oInternalModel.setProperty(`${sDynamicActionPathPrefix}/aApplicable`, aApplicable);
	oInternalModel.setProperty(`${sDynamicActionPathPrefix}/aNotApplicable`, aNotApplicable);
}

function _getDefaultOperators(sPropertyType?: string) {
	// mdc defines the full set of operations that are meaningful for each Edm Type
	// TODO Replace with model / internal way of retrieving the actual model type used for the property
	const oDataClass = TypeUtil.getDataTypeClassName(sPropertyType);
	// TODO need to pass proper formatOptions, constraints here
	const oBaseType = TypeUtil.getBaseType(oDataClass, {}, {});
	return FilterOperatorUtil.getOperatorsForType(oBaseType);
}

function _getRestrictions(aDefaultOps: string[], aExpressionOps: string[]): string[] {
	// From the default set of Operators for the Base Type, select those that are defined in the Allowed Value.
	// In case that no operators are found, return undefined so that the default set is used.
	return aDefaultOps.filter(function (sElement) {
		return aExpressionOps.indexOf(sElement) > -1;
	});
}

function getSpecificAllowedExpression(aExpressions: string[]) {
	const aAllowedExpressionsPriority = CommonUtils.AllowedExpressionsPrio;

	aExpressions.sort(function (a: string, b: string) {
		return aAllowedExpressionsPriority.indexOf(a) - aAllowedExpressionsPriority.indexOf(b);
	});

	return aExpressions[0];
}

/**
 * Method to fetch the correct operators based on the filter restrictions that can be annotated on an entity set or a navigation property.
 * We return the correct operators based on the specified restriction and also check for the operators defined in the manifest to include or exclude them.
 *
 * @param sProperty String name of the property
 * @param sEntitySetPath String path to the entity set
 * @param oContext Context used during templating
 * @param sType String data type od the property, for example edm.Date
 * @param bUseSemanticDateRange Boolean passed from the manifest for semantic date range
 * @param sSettings Stringified object of the property settings
 * @returns An array of strings representing operators for filtering
 */
export function getOperatorsForProperty(
	sProperty: string,
	sEntitySetPath: string,
	oContext: ODataMetaModel,
	sType?: string,
	bUseSemanticDateRange?: boolean | string,
	sSettings?: string
): string[] {
	const oFilterRestrictions = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oContext);
	const aEqualsOps = ["EQ"];
	const aSingleRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
	const aSingleRangeDTBasicOps = ["EQ", "BT"];
	const aSingleValueDateOps = [
		"TODAY",
		"TOMORROW",
		"YESTERDAY",
		"DATE",
		"FIRSTDAYWEEK",
		"LASTDAYWEEK",
		"FIRSTDAYMONTH",
		"LASTDAYMONTH",
		"FIRSTDAYQUARTER",
		"LASTDAYQUARTER",
		"FIRSTDAYYEAR",
		"LASTDAYYEAR"
	];
	const aMultiRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
	const aSearchExpressionOps = ["Contains", "NotContains", "StartsWith", "NotStartsWith", "EndsWith", "NotEndsWith"];
	const aSemanticDateOpsExt = SemanticDateOperators.getSupportedOperations();
	const bSemanticDateRange = bUseSemanticDateRange === "true" || bUseSemanticDateRange === true;
	let aSemanticDateOps: string[] = [];
	const oSettings = sSettings && typeof sSettings === "string" ? JSON.parse(sSettings).customData : sSettings;

	if ((oContext.getObject(`${sEntitySetPath}/@com.sap.vocabularies.Common.v1.ResultContext`) as unknown) === true) {
		return aEqualsOps;
	}

	if (oSettings && oSettings.operatorConfiguration && oSettings.operatorConfiguration.length > 0) {
		aSemanticDateOps = SemanticDateOperators.getFilterOperations(oSettings.operatorConfiguration, sType);
	} else {
		aSemanticDateOps = SemanticDateOperators.getSemanticDateOperations(sType);
	}
	// Get the default Operators for this Property Type
	let aDefaultOperators = _getDefaultOperators(sType);
	if (bSemanticDateRange) {
		aDefaultOperators = aSemanticDateOpsExt.concat(aDefaultOperators);
	}
	let restrictions: string[] = [];

	// Is there a Filter Restriction defined for this property?
	if (oFilterRestrictions && oFilterRestrictions.FilterAllowedExpressions && oFilterRestrictions.FilterAllowedExpressions[sProperty]) {
		// Extending the default operators list with Semantic Date options DATERANGE, DATE, FROM and TO
		const sAllowedExpression = CommonUtils.getSpecificAllowedExpression(oFilterRestrictions.FilterAllowedExpressions[sProperty]);
		// In case more than one Allowed Expressions has been defined for a property
		// choose the most restrictive Allowed Expression

		// MultiValue has same Operator as SingleValue, but there can be more than one (maxConditions)
		switch (sAllowedExpression) {
			case "SingleValue":
				const aSingleValueOps = sType === "Edm.Date" && bSemanticDateRange ? aSingleValueDateOps : aEqualsOps;
				restrictions = _getRestrictions(aDefaultOperators, aSingleValueOps);
				break;
			case "MultiValue":
				restrictions = _getRestrictions(aDefaultOperators, aEqualsOps);
				break;
			case "SingleRange":
				let aExpressionOps: string[];
				if (bSemanticDateRange) {
					if (sType === "Edm.Date") {
						aExpressionOps = aSemanticDateOps;
					} else if (sType === "Edm.DateTimeOffset") {
						aExpressionOps = aSemanticDateOps;
					} else {
						aExpressionOps = aSingleRangeOps;
					}
				} else if (sType === "Edm.DateTimeOffset") {
					aExpressionOps = aSingleRangeDTBasicOps;
				} else {
					aExpressionOps = aSingleRangeOps;
				}
				const sOperators = _getRestrictions(aDefaultOperators, aExpressionOps);
				restrictions = sOperators;
				break;
			case "MultiRange":
				restrictions = _getRestrictions(aDefaultOperators, aMultiRangeOps);
				break;
			case "SearchExpression":
				restrictions = _getRestrictions(aDefaultOperators, aSearchExpressionOps);
				break;
			case "MultiRangeOrSearchExpression":
				restrictions = _getRestrictions(aDefaultOperators, aSearchExpressionOps.concat(aMultiRangeOps));
				break;
			default:
				break;
		}
		// In case AllowedExpressions is not recognised, undefined in return results in the default set of
		// operators for the type.
	}
	return restrictions;
}

/**
 * Method to return allowed operators for type Guid.
 *
 * @function
 * @name getOperatorsForGuidProperty
 * @returns Allowed operators for type Guid
 */
function getOperatorsForGuidProperty(): string {
	const allowedOperatorsForGuid = ["EQ", "NE"];
	return allowedOperatorsForGuid.toString();
}

function getOperatorsForDateProperty(propertyType: string): string[] {
	// In case AllowedExpressions is not provided for type Edm.Date then all the default
	// operators for the type should be returned excluding semantic operators from the list.
	const aDefaultOperators = _getDefaultOperators(propertyType);
	const aMultiRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
	return _getRestrictions(aDefaultOperators, aMultiRangeOps);
}

type ParameterInfo = {
	contextPath?: string;
	parameterProperties?: Record<string, MetaModelProperty>;
};
function getParameterInfo(metaModelContext: ODataMetaModel, sContextPath: string) {
	const sParameterContextPath = sContextPath.substring(0, sContextPath.lastIndexOf("/"));
	const bResultContext = metaModelContext.getObject(`${sParameterContextPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
	const oParameterInfo: ParameterInfo = {};
	if (bResultContext && sParameterContextPath !== sContextPath) {
		oParameterInfo.contextPath = sParameterContextPath;
		oParameterInfo.parameterProperties = CommonUtils.getContextPathProperties(metaModelContext, sParameterContextPath);
	}
	return oParameterInfo;
}

/**
 * Method to add the select Options to filter conditions.
 *
 * @function
 * @name addSelectOptionToConditions
 * @param oPropertyMetadata Property metadata information
 * @param aValidOperators Operators for all the data types
 * @param aSemanticDateOperators Operators for the Date type
 * @param aCumulativeConditions Filter conditions
 * @param oSelectOption Selectoption of selection variant
 * @returns The filter conditions
 */
function addSelectOptionToConditions(
	oPropertyMetadata: unknown,
	aValidOperators: string[],
	aSemanticDateOperators: string[],
	aCumulativeConditions: ConditionObject[],
	oSelectOption: SelectOption
) {
	const oCondition = getConditions(oSelectOption, oPropertyMetadata);
	if (
		oSelectOption?.SemanticDates &&
		aSemanticDateOperators &&
		aSemanticDateOperators.indexOf(oSelectOption?.SemanticDates?.operator) > -1
	) {
		const semanticDates = CommonUtils.addSemanticDatesToConditions(oSelectOption?.SemanticDates);
		if (semanticDates && Object.keys(semanticDates).length > 0) {
			aCumulativeConditions.push(semanticDates);
		}
	} else if (oCondition) {
		if (aValidOperators.length === 0 || aValidOperators.indexOf(oCondition.operator) > -1) {
			aCumulativeConditions.push(oCondition);
		}
	}
	return aCumulativeConditions;
}

/**
 * Method to add the semantic dates to filter conditions
 *
 * @function
 * @name addSemanticDatesToConditions
 * @param oSemanticDates Semantic date infomation
 * @returns The filter conditions containing semantic dates
 */

function addSemanticDatesToConditions(oSemanticDates: SemanticDateConfiguration): ConditionObject {
	const values: unknown[] = [];
	if (oSemanticDates?.high) {
		values.push(oSemanticDates?.high);
	}
	if (oSemanticDates?.low) {
		values.push(oSemanticDates?.low);
	}
	return {
		values: values,
		operator: oSemanticDates?.operator,
		isEmpty: undefined
	};
}

function addSelectOptionsToConditions(
	sContextPath: string,
	oSelectionVariant: SelectionVariant,
	sSelectOptionProp: string,
	oConditions: Record<string, ConditionObject[]>,
	sConditionPath: string | undefined,
	sConditionProp: string,
	oValidProperties: Record<string, MetaModelProperty>,
	metaModelContext: ODataMetaModel,
	isParameter: boolean,
	bIsFLPValuePresent?: boolean,
	bUseSemanticDateRange?: boolean | string,
	oViewData?: object
) {
	let aConditions: ConditionObject[] = [],
		aSelectOptions: SelectOption[],
		aValidOperators: string[],
		aSemanticDateOperators: string[] = [];

	if (isParameter || MetaModelFunction.isPropertyFilterable(metaModelContext, sContextPath, sConditionProp, true)) {
		const oPropertyMetadata = oValidProperties[sConditionProp];
		aSelectOptions = oSelectionVariant.getSelectOption(sSelectOptionProp) as SelectOption[];
		const settings = getFilterConfigurationSetting(oViewData, sConditionProp);
		aValidOperators = isParameter ? ["EQ"] : CommonUtils.getOperatorsForProperty(sConditionProp, sContextPath, metaModelContext);
		if (bUseSemanticDateRange) {
			aSemanticDateOperators = isParameter
				? ["EQ"]
				: CommonUtils.getOperatorsForProperty(
						sConditionProp,
						sContextPath,
						metaModelContext,
						oPropertyMetadata?.$Type,
						bUseSemanticDateRange,
						settings
				  );
		}
		// Create conditions for all the selectOptions of the property
		aConditions = isParameter
			? CommonUtils.addSelectOptionToConditions(
					oPropertyMetadata,
					aValidOperators,
					aSemanticDateOperators,
					aConditions,
					aSelectOptions[0]
			  )
			: aSelectOptions.reduce(
					CommonUtils.addSelectOptionToConditions.bind(null, oPropertyMetadata, aValidOperators, aSemanticDateOperators),
					aConditions
			  );
		if (aConditions.length) {
			if (sConditionPath) {
				oConditions[sConditionPath + sConditionProp] = oConditions.hasOwnProperty(sConditionPath + sConditionProp)
					? oConditions[sConditionPath + sConditionProp].concat(aConditions)
					: aConditions;
			} else if (bIsFLPValuePresent) {
				// If FLP values are present replace it with FLP values
				aConditions.forEach((element) => {
					element["filtered"] = true;
				});
				if (oConditions.hasOwnProperty(sConditionProp)) {
					oConditions[sConditionProp].forEach((element) => {
						element["filtered"] = false;
					});
					oConditions[sConditionProp] = oConditions[sConditionProp].concat(aConditions);
				} else {
					oConditions[sConditionProp] = aConditions;
				}
			} else {
				oConditions[sConditionProp] = oConditions.hasOwnProperty(sConditionProp)
					? oConditions[sConditionProp].concat(aConditions)
					: aConditions;
			}
		}
	}
}

/**
 * Method to create the semantic dates from filter conditions
 *
 * @function
 * @name createSemanticDatesFromConditions
 * @param oCondition Filter field condition
 * @param sFilterName Filter Field Path
 * @returns The Semantic date conditions
 */

function createSemanticDatesFromConditions(oCondition: ConditionType): SemanticDateConfiguration {
	return {
		high: (oCondition?.values?.[0] as string) || null,
		low: (oCondition?.values?.[1] as string) || null,
		operator: oCondition?.operator
	};
}

/**
 * Method to Return the filter configuration
 *
 * @function
 * @name getFilterConfigurationSetting
 * @param oViewData manifest Configuration
 * @param sProperty Filter Field Path
 * @returns The Filter Field Configuration
 */
type ViewData = {
	controlConfiguration?: Record<string, Record<string, unknown>>;
};
function getFilterConfigurationSetting(oViewData: ViewData = {}, sProperty: string) {
	const oConfig = oViewData?.controlConfiguration;
	const filterConfig =
		oConfig && (oConfig["@com.sap.vocabularies.UI.v1.SelectionFields"]?.filterFields as Record<string, { settings: string }>);
	return filterConfig?.[sProperty] ? filterConfig[sProperty]?.settings : undefined;
}
function addSelectionVariantToConditions(
	oSelectionVariant: SelectionVariant,
	oConditions: Record<string, ConditionObject[]>,
	oMetaModelContext: ODataMetaModel,
	sContextPath: string,
	bIsFLPValues?: boolean,
	bUseSemanticDateRange?: boolean,
	oViewData?: object
) {
	const aSelectOptionsPropertyNames = oSelectionVariant.getSelectOptionsPropertyNames(),
		oValidProperties = CommonUtils.getContextPathProperties(oMetaModelContext, sContextPath),
		aMetadatProperties = Object.keys(oValidProperties),
		oParameterInfo = CommonUtils.getParameterInfo(oMetaModelContext, sContextPath),
		sParameterContextPath = oParameterInfo.contextPath,
		oValidParameterProperties = oParameterInfo.parameterProperties;

	if (sParameterContextPath !== undefined && oValidParameterProperties && Object.keys(oValidParameterProperties).length > 0) {
		const aMetadataParameters = Object.keys(oValidParameterProperties);
		aMetadataParameters.forEach(function (sMetadataParameter: string) {
			let sSelectOptionName;
			if (aSelectOptionsPropertyNames.includes(`$Parameter.${sMetadataParameter}`)) {
				sSelectOptionName = `$Parameter.${sMetadataParameter}`;
			} else if (aSelectOptionsPropertyNames.includes(sMetadataParameter)) {
				sSelectOptionName = sMetadataParameter;
			} else if (
				sMetadataParameter.startsWith("P_") &&
				aSelectOptionsPropertyNames.includes(`$Parameter.${sMetadataParameter.slice(2, sMetadataParameter.length)}`)
			) {
				sSelectOptionName = `$Parameter.${sMetadataParameter.slice(2, sMetadataParameter.length)}`;
			} else if (
				sMetadataParameter.startsWith("P_") &&
				aSelectOptionsPropertyNames.includes(sMetadataParameter.slice(2, sMetadataParameter.length))
			) {
				sSelectOptionName = sMetadataParameter.slice(2, sMetadataParameter.length);
			} else if (aSelectOptionsPropertyNames.includes(`$Parameter.P_${sMetadataParameter}`)) {
				sSelectOptionName = `$Parameter.P_${sMetadataParameter}`;
			} else if (aSelectOptionsPropertyNames.includes(`P_${sMetadataParameter}`)) {
				sSelectOptionName = `P_${sMetadataParameter}`;
			}

			if (sSelectOptionName) {
				addSelectOptionsToConditions(
					sParameterContextPath,
					oSelectionVariant,
					sSelectOptionName,
					oConditions,
					undefined,
					sMetadataParameter,
					oValidParameterProperties,
					oMetaModelContext,
					true,
					bIsFLPValues,
					bUseSemanticDateRange,
					oViewData
				);
			}
		});
	}
	aMetadatProperties.forEach(function (sMetadataProperty: string) {
		let sSelectOptionName;
		if (aSelectOptionsPropertyNames.includes(sMetadataProperty)) {
			sSelectOptionName = sMetadataProperty;
		} else if (
			sMetadataProperty.startsWith("P_") &&
			aSelectOptionsPropertyNames.includes(sMetadataProperty.slice(2, sMetadataProperty.length))
		) {
			sSelectOptionName = sMetadataProperty.slice(2, sMetadataProperty.length);
		} else if (aSelectOptionsPropertyNames.includes(`P_${sMetadataProperty}`)) {
			sSelectOptionName = `P_${sMetadataProperty}`;
		}
		if (sSelectOptionName) {
			addSelectOptionsToConditions(
				sContextPath,
				oSelectionVariant,
				sSelectOptionName,
				oConditions,
				undefined,
				sMetadataProperty,
				oValidProperties,
				oMetaModelContext,
				false,
				bIsFLPValues,
				bUseSemanticDateRange,
				oViewData
			);
		}
	});

	aSelectOptionsPropertyNames.forEach(function (sSelectOption: string) {
		if (sSelectOption.indexOf(".") > 0 && !sSelectOption.includes("$Parameter")) {
			const sReplacedOption = sSelectOption.replaceAll(".", "/");
			const sFullContextPath = `/${sReplacedOption}`.startsWith(sContextPath)
				? `/${sReplacedOption}`
				: `${sContextPath}/${sReplacedOption}`; // check if the full path, eg SalesOrderManage._Item.Material exists in the metamodel
			if (oMetaModelContext.getObject(sFullContextPath.replace("P_", ""))) {
				_createConditionsForNavProperties(
					sFullContextPath,
					sContextPath,
					oSelectionVariant,
					sSelectOption,
					oMetaModelContext,
					oConditions,
					bIsFLPValues,
					bUseSemanticDateRange,
					oViewData
				);
			}
		}
	});
	return oConditions;
}

function _createConditionsForNavProperties(
	sFullContextPath: string,
	sMainEntitySetPath: string,
	oSelectionVariant: SelectionVariant,
	sSelectOption: string,
	oMetaModelContext: ODataMetaModel,
	oConditions: Record<string, ConditionObject[]>,
	bIsFLPValuePresent?: boolean,
	bSemanticDateRange?: boolean,
	oViewData?: object
) {
	let aNavObjectNames = sSelectOption.split(".");
	// Eg: "SalesOrderManage._Item._Material.Material" or "_Item.Material"
	if (`/${sSelectOption.replaceAll(".", "/")}`.startsWith(sMainEntitySetPath)) {
		const sFullPath = `/${sSelectOption}`.replaceAll(".", "/"),
			sNavPath = sFullPath.replace(`${sMainEntitySetPath}/`, "");
		aNavObjectNames = sNavPath.split("/");
	}
	let sConditionPath = "";
	const sPropertyName = aNavObjectNames[aNavObjectNames.length - 1]; // Material from SalesOrderManage._Item.Material
	for (let i = 0; i < aNavObjectNames.length - 1; i++) {
		if (oMetaModelContext.getObject(`${sMainEntitySetPath}/${aNavObjectNames[i].replace("P_", "")}`).$isCollection) {
			sConditionPath = `${sConditionPath + aNavObjectNames[i]}*/`; // _Item*/ in case of 1:n cardinality
		} else {
			sConditionPath = `${sConditionPath + aNavObjectNames[i]}/`; // _Item/ in case of 1:1 cardinality
		}
		sMainEntitySetPath = `${sMainEntitySetPath}/${aNavObjectNames[i]}`;
	}
	const sNavPropertyPath = sFullContextPath.slice(0, sFullContextPath.lastIndexOf("/")),
		oValidProperties = CommonUtils.getContextPathProperties(oMetaModelContext, sNavPropertyPath),
		aSelectOptionsPropertyNames = oSelectionVariant.getSelectOptionsPropertyNames();
	let sSelectOptionName = sPropertyName;
	if (oValidProperties[sPropertyName]) {
		sSelectOptionName = sPropertyName;
	} else if (sPropertyName.startsWith("P_") && oValidProperties[sPropertyName.replace("P_", "")]) {
		sSelectOptionName = sPropertyName.replace("P_", "");
	} else if (oValidProperties[`P_${sPropertyName}`] && aSelectOptionsPropertyNames.includes(`P_${sPropertyName}`)) {
		sSelectOptionName = `P_${sPropertyName}`;
	}
	if (sPropertyName.startsWith("P_") && oConditions[sConditionPath + sSelectOptionName]) {
		// if there is no SalesOrderManage._Item.Material yet in the oConditions
	} else if (!sPropertyName.startsWith("P_") && oConditions[sConditionPath + sSelectOptionName]) {
		delete oConditions[sConditionPath + sSelectOptionName];
		addSelectOptionsToConditions(
			sNavPropertyPath,
			oSelectionVariant,
			sSelectOption,
			oConditions,
			sConditionPath,
			sSelectOptionName,
			oValidProperties,
			oMetaModelContext,
			false,
			bIsFLPValuePresent,
			bSemanticDateRange,
			oViewData
		);
	} else {
		addSelectOptionsToConditions(
			sNavPropertyPath,
			oSelectionVariant,
			sSelectOption,
			oConditions,
			sConditionPath,
			sSelectOptionName,
			oValidProperties,
			oMetaModelContext,
			false,
			bIsFLPValuePresent,
			bSemanticDateRange,
			oViewData
		);
	}
}

function addPageContextToSelectionVariant(oSelectionVariant: SelectionVariant, mPageContext: unknown[], oView: View) {
	const oAppComponent = CommonUtils.getAppComponent(oView);
	const oNavigationService = oAppComponent.getNavigationService();
	return oNavigationService.mixAttributesAndSelectionVariant(mPageContext, oSelectionVariant.toJSONString());
}

function addExternalStateFiltersToSelectionVariant(
	oSelectionVariant: SelectionVariant,
	mFilters: {
		filterConditions: Record<string, Record<string, ConditionObject>>;
		filterConditionsWithoutConflict: Record<string, string>;
	},
	oTargetInfo: {
		propertiesWithoutConflict?: Record<string, string>;
	},
	oFilterBar?: FilterBar
) {
	let sFilter: string;
	const fnGetSignAndOption = function (sOperator: string, sLowValue: string, sHighValue: string) {
		const oSelectOptionState = {
			option: "",
			sign: "I",
			low: sLowValue,
			high: sHighValue
		};
		switch (sOperator) {
			case "Contains":
				oSelectOptionState.option = "CP";
				break;
			case "StartsWith":
				oSelectOptionState.option = "CP";
				oSelectOptionState.low += "*";
				break;
			case "EndsWith":
				oSelectOptionState.option = "CP";
				oSelectOptionState.low = `*${oSelectOptionState.low}`;
				break;
			case "BT":
			case "LE":
			case "LT":
			case "GT":
			case "NE":
			case "EQ":
				oSelectOptionState.option = sOperator;
				break;
			case "DATE":
				oSelectOptionState.option = "EQ";
				break;
			case "DATERANGE":
				oSelectOptionState.option = "BT";
				break;
			case "FROM":
				oSelectOptionState.option = "GE";
				break;
			case "TO":
				oSelectOptionState.option = "LE";
				break;
			case "EEQ":
				oSelectOptionState.option = "EQ";
				break;
			case "Empty":
				oSelectOptionState.option = "EQ";
				oSelectOptionState.low = "";
				break;
			case "NotContains":
				oSelectOptionState.option = "CP";
				oSelectOptionState.sign = "E";
				break;
			case "NOTBT":
				oSelectOptionState.option = "BT";
				oSelectOptionState.sign = "E";
				break;
			case "NotStartsWith":
				oSelectOptionState.option = "CP";
				oSelectOptionState.low += "*";
				oSelectOptionState.sign = "E";
				break;
			case "NotEndsWith":
				oSelectOptionState.option = "CP";
				oSelectOptionState.low = `*${oSelectOptionState.low}`;
				oSelectOptionState.sign = "E";
				break;
			case "NotEmpty":
				oSelectOptionState.option = "NE";
				oSelectOptionState.low = "";
				break;
			case "NOTLE":
				oSelectOptionState.option = "LE";
				oSelectOptionState.sign = "E";
				break;
			case "NOTGE":
				oSelectOptionState.option = "GE";
				oSelectOptionState.sign = "E";
				break;
			case "NOTLT":
				oSelectOptionState.option = "LT";
				oSelectOptionState.sign = "E";
				break;
			case "NOTGT":
				oSelectOptionState.option = "GT";
				oSelectOptionState.sign = "E";
				break;
			default:
				Log.warning(`${sOperator} is not supported. ${sFilter} could not be added to the navigation context`);
		}
		return oSelectOptionState;
	};
	const oFilterConditions = mFilters.filterConditions;
	const oFiltersWithoutConflict = mFilters.filterConditionsWithoutConflict ? mFilters.filterConditionsWithoutConflict : {};
	const oTablePropertiesWithoutConflict = oTargetInfo.propertiesWithoutConflict ? oTargetInfo.propertiesWithoutConflict : {};
	const addFiltersToSelectionVariant = function (selectionVariant: SelectionVariant, sFilterName: string, sPath?: string) {
		const aConditions = oFilterConditions[sFilterName];
		const oPropertyInfo = oFilterBar && oFilterBar.getPropertyHelper().getProperty(sFilterName);
		const oTypeConfig = oPropertyInfo?.typeConfig;
		const oTypeUtil = oFilterBar && oFilterBar.getControlDelegate().getTypeUtil();

		for (const item in aConditions) {
			const oCondition = aConditions[item];

			let option: string | undefined = "",
				sign = "I",
				low = "",
				high = null,
				semanticDates;

			const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			if (oOperator instanceof RangeOperator) {
				semanticDates = CommonUtils.createSemanticDatesFromConditions(oCondition);
				// handling of Date RangeOperators
				const oModelFilter = oOperator.getModelFilter(
					oCondition,
					sFilterName,
					oTypeConfig?.typeInstance,
					false,
					oTypeConfig?.baseType
				);
				if (!oModelFilter?.getFilters() && !oModelFilter?.getFilters()?.length) {
					sign = oOperator.exclude ? "E" : "I";
					low = oTypeUtil.externalizeValue(oModelFilter.getValue1(), oTypeConfig.typeInstance);
					high = oTypeUtil.externalizeValue(oModelFilter.getValue2(), oTypeConfig.typeInstance);
					option = oModelFilter.getOperator();
				}
			} else {
				const aSemanticDateOpsExt = SemanticDateOperators.getSupportedOperations();
				if (aSemanticDateOpsExt.includes(oCondition?.operator)) {
					semanticDates = CommonUtils.createSemanticDatesFromConditions(oCondition);
				}
				const value1 = (oCondition.values[0] && oCondition.values[0].toString()) || "";
				const value2 = (oCondition.values[1] && oCondition.values[1].toString()) || null;
				const oSelectOption = fnGetSignAndOption(oCondition.operator, value1, value2);
				sign = oOperator?.exclude ? "E" : "I";
				low = oSelectOption?.low;
				high = oSelectOption?.high;
				option = oSelectOption?.option;
			}

			if (option && semanticDates) {
				selectionVariant.addSelectOption(sPath ? sPath : sFilterName, sign, option, low, high, undefined, semanticDates);
			} else if (option) {
				selectionVariant.addSelectOption(sPath ? sPath : sFilterName, sign, option, low, high);
			}
		}
	};

	for (sFilter in oFilterConditions) {
		// only add the filter values if it is not already present in the SV already
		if (!oSelectionVariant.getSelectOption(sFilter)) {
			// TODO : custom filters should be ignored more generically
			if (sFilter === "$editState") {
				continue;
			}
			addFiltersToSelectionVariant(oSelectionVariant, sFilter);
		} else {
			if (oTablePropertiesWithoutConflict && sFilter in oTablePropertiesWithoutConflict) {
				addFiltersToSelectionVariant(oSelectionVariant, sFilter, oTablePropertiesWithoutConflict[sFilter]);
			}
			// if property was without conflict in page context then add path from page context to SV
			if (sFilter in oFiltersWithoutConflict) {
				addFiltersToSelectionVariant(oSelectionVariant, sFilter, oFiltersWithoutConflict[sFilter]);
			}
		}
	}
	return oSelectionVariant;
}

function isStickyEditMode(oControl: Control) {
	const bIsStickyMode = ModelHelper.isStickySessionSupported((oControl.getModel() as ODataModel).getMetaModel());
	const bUIEditable = oControl.getModel("ui").getProperty("/isEditable");
	return bIsStickyMode && bUIEditable;
}

/**
 * @param aMandatoryFilterFields
 * @param oSelectionVariant
 * @param oSelectionVariantDefaults
 */
function addDefaultDisplayCurrency(
	aMandatoryFilterFields: ExpandPathType<Edm.PropertyPath>[],
	oSelectionVariant: SelectionVariant,
	oSelectionVariantDefaults: SelectionVariant
) {
	if (oSelectionVariant && aMandatoryFilterFields && aMandatoryFilterFields.length) {
		for (let i = 0; i < aMandatoryFilterFields.length; i++) {
			const aSVOption = oSelectionVariant.getSelectOption("DisplayCurrency"),
				aDefaultSVOption = oSelectionVariantDefaults && oSelectionVariantDefaults.getSelectOption("DisplayCurrency");
			if (
				aMandatoryFilterFields[i].$PropertyPath === "DisplayCurrency" &&
				(!aSVOption || !aSVOption.length) &&
				aDefaultSVOption &&
				aDefaultSVOption.length
			) {
				const displayCurrencySelectOption = aDefaultSVOption[0];
				const sSign = displayCurrencySelectOption["Sign"];
				const sOption = displayCurrencySelectOption["Option"];
				const sLow = displayCurrencySelectOption["Low"];
				const sHigh = displayCurrencySelectOption["High"];
				oSelectionVariant.addSelectOption("DisplayCurrency", sSign, sOption, sLow, sHigh);
			}
		}
	}
}

type UserDefaultParameter = {
	$Name: string;
	getPath?(): string;
};

/**
 * Retrieves the user defaults from the startup app state (if available) or the startup parameter and sets them to a model.
 *
 * @param oAppComponent
 * @param aParameters
 * @param oModel
 * @param bIsAction
 * @param bIsCreate
 * @param oActionDefaultValues
 */
async function setUserDefaults(
	oAppComponent: AppComponent,
	aParameters: UserDefaultParameter[],
	oModel: JSONModel | ODataV4Context,
	bIsAction: boolean,
	bIsCreate?: boolean,
	oActionDefaultValues?: Record<string, string>
): Promise<void> {
	const oComponentData = oAppComponent.getComponentData(),
		oStartupParameters = (oComponentData && oComponentData.startupParameters) || {},
		oShellServices = oAppComponent.getShellServices();
	const oStartupAppState = await oShellServices.getStartupAppState(oAppComponent);
	const oData = oStartupAppState?.getData() || {},
		aExtendedParameters = (oData.selectionVariant && oData.selectionVariant.SelectOptions) || [];
	aParameters.forEach(function (oParameter) {
		const sPropertyName = bIsAction
			? `/${oParameter.$Name}`
			: (oParameter.getPath?.().slice(oParameter.getPath().lastIndexOf("/") + 1) as string);
		const sParameterName = bIsAction ? sPropertyName.slice(1) : sPropertyName;
		if (oActionDefaultValues && bIsCreate) {
			if (oActionDefaultValues[sParameterName]) {
				oModel.setProperty(sPropertyName, oActionDefaultValues[sParameterName]);
			}
		} else if (oStartupParameters[sParameterName]) {
			oModel.setProperty(sPropertyName, oStartupParameters[sParameterName][0]);
		} else if (aExtendedParameters.length > 0) {
			for (const oExtendedParameter of aExtendedParameters) {
				if (oExtendedParameter.PropertyName === sParameterName) {
					const oRange = oExtendedParameter.Ranges.length
						? oExtendedParameter.Ranges[oExtendedParameter.Ranges.length - 1]
						: undefined;
					if (oRange && oRange.Sign === "I" && oRange.Option === "EQ") {
						oModel.setProperty(sPropertyName, oRange.Low); // high is ignored when Option=EQ
					}
				}
			}
		}
	});
}

export type InboundParameter = {
	useForCreate: boolean;
};
function getAdditionalParamsForCreate(
	oStartupParameters: Record<string, unknown[]>,
	oInboundParameters?: Record<string, InboundParameter>
) {
	const oInbounds = oInboundParameters,
		aCreateParameters =
			oInbounds !== undefined
				? Object.keys(oInbounds).filter(function (sParameter: string) {
						return oInbounds[sParameter].useForCreate;
				  })
				: [];
	let oRet;
	for (let i = 0; i < aCreateParameters.length; i++) {
		const sCreateParameter = aCreateParameters[i];
		const aValues = oStartupParameters && oStartupParameters[sCreateParameter];
		if (aValues && aValues.length === 1) {
			oRet = oRet || Object.create(null);
			oRet[sCreateParameter] = aValues[0];
		}
	}
	return oRet;
}
type OutboundParameter = {
	parameters: Record<string, OutboundParameterValue>;
	semanticObject?: string;
	action?: string;
};
type OutboundParameterValue = {
	value?: {
		value?: string;
		format?: string;
	};
};
function getSemanticObjectMapping(oOutbound: OutboundParameter) {
	const aSemanticObjectMapping: MetaModelType<SemanticObjectMappingType>[] = [];
	if (oOutbound.parameters) {
		const aParameters = Object.keys(oOutbound.parameters) || [];
		if (aParameters.length > 0) {
			aParameters.forEach(function (sParam: string) {
				const oMapping = oOutbound.parameters[sParam];
				if (oMapping.value && oMapping.value.value && oMapping.value.format === "binding") {
					// using the format of UI.Mapping
					const oSemanticMapping = {
						LocalProperty: {
							$PropertyPath: oMapping.value.value
						},
						SemanticObjectProperty: sParam
					};

					if (aSemanticObjectMapping.length > 0) {
						// To check if the semanticObject Mapping is done for the same local property more that once then first one will be considered
						for (let i = 0; i < aSemanticObjectMapping.length; i++) {
							if (aSemanticObjectMapping[i].LocalProperty?.$PropertyPath !== oSemanticMapping.LocalProperty.$PropertyPath) {
								aSemanticObjectMapping.push(oSemanticMapping);
							}
						}
					} else {
						aSemanticObjectMapping.push(oSemanticMapping);
					}
				}
			});
		}
	}
	return aSemanticObjectMapping;
}

function getHeaderFacetItemConfigForExternalNavigation(oViewData: ViewData, oCrossNav: Record<string, OutboundParameter>) {
	const oHeaderFacetItems: Record<
		string,
		{
			semanticObject: string;
			action: string;
			semanticObjectMapping: MetaModelType<SemanticObjectMappingType>[];
		}
	> = {};
	let sId;
	const oControlConfig = oViewData.controlConfiguration as Record<
		string,
		{
			navigation?: {
				targetOutbound?: {
					outbound: string;
				};
			};
		}
	>;
	for (const config in oControlConfig) {
		if (config.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 || config.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
			const sOutbound = oControlConfig[config].navigation?.targetOutbound?.outbound;
			if (sOutbound !== undefined) {
				const oOutbound = oCrossNav[sOutbound];
				if (oOutbound.semanticObject && oOutbound.action) {
					if (config.indexOf("Chart") > -1) {
						sId = generate(["fe", "MicroChartLink", config]);
					} else {
						sId = generate(["fe", "HeaderDPLink", config]);
					}
					const aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oOutbound);
					oHeaderFacetItems[sId] = {
						semanticObject: oOutbound.semanticObject,
						action: oOutbound.action,
						semanticObjectMapping: aSemanticObjectMapping
					};
				} else {
					Log.error(`Cross navigation outbound is configured without semantic object and action for ${sOutbound}`);
				}
			}
		}
	}
	return oHeaderFacetItems;
}

function setSemanticObjectMappings(oSelectionVariant: SelectionVariant, vMappings: unknown) {
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

type SemanticObjectFromPath = {
	semanticObjectPath: string;
	semanticObjectForGetLinks: { semanticObject: string }[];
	semanticObject: {
		semanticObject: { $Path: string };
	};
	unavailableActions: string[];
};
async function fnGetSemanticObjectsFromPath(oMetaModel: ODataMetaModel, sPath: string, sQualifier: string) {
	return new Promise<SemanticObjectFromPath>(function (resolve) {
		let sSemanticObject, aSemanticObjectUnavailableActions;
		if (sQualifier === "") {
			sSemanticObject = oMetaModel.getObject(`${sPath}@${CommonAnnotationTerms.SemanticObject}`);
			aSemanticObjectUnavailableActions = oMetaModel.getObject(`${sPath}@${CommonAnnotationTerms.SemanticObjectUnavailableActions}`);
		} else {
			sSemanticObject = oMetaModel.getObject(`${sPath}@${CommonAnnotationTerms.SemanticObject}#${sQualifier}`);
			aSemanticObjectUnavailableActions = oMetaModel.getObject(
				`${sPath}@${CommonAnnotationTerms.SemanticObjectUnavailableActions}#${sQualifier}`
			);
		}

		const aSemanticObjectForGetLinks = [{ semanticObject: sSemanticObject }];
		const oSemanticObject = {
			semanticObject: sSemanticObject
		};
		resolve({
			semanticObjectPath: sPath,
			semanticObjectForGetLinks: aSemanticObjectForGetLinks,
			semanticObject: oSemanticObject,
			unavailableActions: aSemanticObjectUnavailableActions
		});
	});
}

async function fnUpdateSemanticTargetsModel(
	aGetLinksPromises: Promise<LinkDefinition[][][]>[],
	aSemanticObjects: SemanticObject[],
	oInternalModelContext: InternalModelContext,
	sCurrentHash: string
) {
	type SemanticObjectInfo = { semanticObject: string; path: string; HasTargets: boolean; HasTargetsNotFiltered: boolean };
	return Promise.all(aGetLinksPromises)
		.then(function (aValues) {
			let aLinks: LinkDefinition[][][],
				_oLink,
				_sLinkIntentAction,
				aFinalLinks: LinkDefinition[][] = [];
			let oFinalSemanticObjects: Record<string, SemanticObjectInfo> = {};
			const bIntentHasActions = function (sIntent: string, aActions?: unknown[]) {
				for (const intent in aActions) {
					if (intent === sIntent) {
						return true;
					} else {
						return false;
					}
				}
			};

			for (let k = 0; k < aValues.length; k++) {
				aLinks = aValues[k];
				if (aLinks && aLinks.length > 0 && aLinks[0] !== undefined) {
					const oSemanticObject: Record<string, Record<string, SemanticObjectInfo>> = {};
					let oTmp: SemanticObjectInfo;
					let sAlternatePath;
					for (let i = 0; i < aLinks.length; i++) {
						aFinalLinks.push([]);
						let hasTargetsNotFiltered = false;
						let hasTargets = false;
						for (let iLinkCount = 0; iLinkCount < aLinks[i][0].length; iLinkCount++) {
							_oLink = aLinks[i][0][iLinkCount];
							_sLinkIntentAction = _oLink && _oLink.intent.split("?")[0].split("-")[1];

							if (!(_oLink && _oLink.intent && _oLink.intent.indexOf(sCurrentHash) === 0)) {
								hasTargetsNotFiltered = true;
								if (!bIntentHasActions(_sLinkIntentAction, aSemanticObjects[k].unavailableActions)) {
									aFinalLinks[i].push(_oLink);
									hasTargets = true;
								}
							}
						}
						oTmp = {
							semanticObject: aSemanticObjects[k].semanticObject,
							path: aSemanticObjects[k].path,
							HasTargets: hasTargets,
							HasTargetsNotFiltered: hasTargetsNotFiltered
						};
						if (oSemanticObject[aSemanticObjects[k].semanticObject] === undefined) {
							oSemanticObject[aSemanticObjects[k].semanticObject] = {};
						}
						sAlternatePath = aSemanticObjects[k].path.replace(/\//g, "_");
						if (oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] === undefined) {
							oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] = {} as SemanticObjectInfo;
						}
						oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] = Object.assign(
							oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath],
							oTmp
						);
					}
					const sSemanticObjectName = Object.keys(oSemanticObject)[0];
					if (Object.keys(oFinalSemanticObjects).includes(sSemanticObjectName)) {
						oFinalSemanticObjects[sSemanticObjectName] = Object.assign(
							oFinalSemanticObjects[sSemanticObjectName],
							oSemanticObject[sSemanticObjectName]
						);
					} else {
						oFinalSemanticObjects = Object.assign(oFinalSemanticObjects, oSemanticObject);
					}
					aFinalLinks = [];
				}
			}
			if (Object.keys(oFinalSemanticObjects).length > 0) {
				oInternalModelContext.setProperty(
					"semanticsTargets",
					mergeObjects(oFinalSemanticObjects, oInternalModelContext.getProperty("semanticsTargets"))
				);
				return oFinalSemanticObjects;
			}
			return;
		})
		.catch(function (oError: unknown) {
			Log.error("fnUpdateSemanticTargetsModel: Cannot read links", oError as string);
		});
}

async function fnGetSemanticObjectPromise(
	oAppComponent: AppComponent,
	oView: View,
	oMetaModel: ODataMetaModel,
	sPath: string,
	sQualifier: string
) {
	return CommonUtils.getSemanticObjectsFromPath(oMetaModel, sPath, sQualifier);
}

function fnPrepareSemanticObjectsPromises(
	_oAppComponent: AppComponent,
	_oView: View,
	_oMetaModel: ODataMetaModel,
	_aSemanticObjectsFound: string[],
	_aSemanticObjectsPromises: Promise<SemanticObjectFromPath>[]
) {
	let _Keys: string[], sPath;
	let sQualifier: string, regexResult;
	for (let i = 0; i < _aSemanticObjectsFound.length; i++) {
		sPath = _aSemanticObjectsFound[i];
		_Keys = Object.keys(_oMetaModel.getObject(sPath + "@"));
		for (let index = 0; index < _Keys.length; index++) {
			if (
				_Keys[index].indexOf(`@${CommonAnnotationTerms.SemanticObject}`) === 0 &&
				_Keys[index].indexOf(`@${CommonAnnotationTerms.SemanticObjectMapping}`) === -1 &&
				_Keys[index].indexOf(`@${CommonAnnotationTerms.SemanticObjectUnavailableActions}`) === -1
			) {
				regexResult = /#(.*)/.exec(_Keys[index]);
				sQualifier = regexResult ? regexResult[1] : "";
				_aSemanticObjectsPromises.push(
					CommonUtils.getSemanticObjectPromise(_oAppComponent, _oView, _oMetaModel, sPath, sQualifier)
				);
			}
		}
	}
}

type InternalJSONModel = {
	_getObject(val: string, context?: Context): object;
};
function fnGetSemanticTargetsFromPageModel(oController: PageController, sPageModel: string) {
	const _fnfindValuesHelper = function (
		obj: undefined | null | Record<string, string>[] | Record<string, unknown>,
		key: string,
		list: string[]
	) {
		if (!obj) {
			return list;
		}
		if (obj instanceof Array) {
			obj.forEach((item) => {
				list = list.concat(_fnfindValuesHelper(item, key, []));
			});
			return list;
		}
		if (obj[key]) {
			list.push(obj[key] as string);
		}

		if (typeof obj == "object" && obj !== null) {
			const children = Object.keys(obj);
			if (children.length > 0) {
				for (let i = 0; i < children.length; i++) {
					list = list.concat(_fnfindValuesHelper(obj[children[i]] as Record<string, unknown>, key, []));
				}
			}
		}
		return list;
	};
	const _fnfindValues = function (obj: undefined | null | Record<string, string>[] | Record<string, unknown>, key: string) {
		return _fnfindValuesHelper(obj, key, []);
	};
	const _fnDeleteDuplicateSemanticObjects = function (aSemanticObjectPath: string[]) {
		return aSemanticObjectPath.filter(function (value: string, index: number) {
			return aSemanticObjectPath.indexOf(value) === index;
		});
	};
	const oView = oController.getView();
	const oInternalModelContext = oView.getBindingContext("internal") as InternalModelContext;

	if (oInternalModelContext) {
		const aSemanticObjectsPromises: Promise<SemanticObjectFromPath>[] = [];
		const oComponent = oController.getOwnerComponent();
		const oAppComponent = Component.getOwnerComponentFor(oComponent) as AppComponent;
		const oMetaModel = oAppComponent.getMetaModel();
		let oPageModel = (oComponent.getModel(sPageModel) as JSONModel).getData();
		if (JSON.stringify(oPageModel) === "{}") {
			oPageModel = (oComponent.getModel(sPageModel) as unknown as InternalJSONModel)._getObject("/", undefined);
		}
		let aSemanticObjectsFound = _fnfindValues(oPageModel, "semanticObjectPath");
		aSemanticObjectsFound = _fnDeleteDuplicateSemanticObjects(aSemanticObjectsFound);
		const oShellServiceHelper = oAppComponent.getShellServices();
		let sCurrentHash = oShellServiceHelper.getHash();
		const aSemanticObjectsForGetLinks = [];
		const aSemanticObjects: SemanticObject[] = [];
		let _oSemanticObject;

		if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
			// sCurrentHash can contain query string, cut it off!
			sCurrentHash = sCurrentHash.split("?")[0];
		}

		fnPrepareSemanticObjectsPromises(oAppComponent, oView, oMetaModel, aSemanticObjectsFound, aSemanticObjectsPromises);

		if (aSemanticObjectsPromises.length === 0) {
			return Promise.resolve();
		} else {
			Promise.all(aSemanticObjectsPromises)
				.then(async function (aValues) {
					const aGetLinksPromises = [];
					let sSemObjExpression;
					type SemanticObjectResolved = {
						semanticObjectPath: string;
						semanticObjectForGetLinks: { semanticObject: string }[];
						semanticObject: {
							semanticObject: string;
						};
						unavailableActions: string[];
					};
					const aSemanticObjectsResolved: SemanticObjectResolved[] = aValues.filter(function (element) {
						if (
							element.semanticObject !== undefined &&
							element.semanticObject.semanticObject &&
							typeof element.semanticObject.semanticObject === "object"
						) {
							sSemObjExpression = compileExpression(pathInModel(element.semanticObject.semanticObject.$Path))!;
							(element as unknown as SemanticObjectResolved).semanticObject.semanticObject = sSemObjExpression;
							element.semanticObjectForGetLinks[0].semanticObject = sSemObjExpression;
							return true;
						} else if (element) {
							return element.semanticObject !== undefined;
						} else {
							return false;
						}
					}) as unknown as SemanticObjectResolved[];
					for (let j = 0; j < aSemanticObjectsResolved.length; j++) {
						_oSemanticObject = aSemanticObjectsResolved[j];
						if (
							_oSemanticObject &&
							_oSemanticObject.semanticObject &&
							!(_oSemanticObject.semanticObject.semanticObject.indexOf("{") === 0)
						) {
							aSemanticObjectsForGetLinks.push(_oSemanticObject.semanticObjectForGetLinks);
							aSemanticObjects.push({
								semanticObject: _oSemanticObject.semanticObject.semanticObject,
								unavailableActions: _oSemanticObject.unavailableActions,
								path: aSemanticObjectsResolved[j].semanticObjectPath
							});
							aGetLinksPromises.push(oShellServiceHelper.getLinksWithCache([_oSemanticObject.semanticObjectForGetLinks]));
						}
					}
					return CommonUtils.updateSemanticTargets(aGetLinksPromises, aSemanticObjects, oInternalModelContext, sCurrentHash);
				})
				.catch(function (oError: unknown) {
					Log.error("fnGetSemanticTargetsFromTable: Cannot get Semantic Objects", oError as string);
				});
		}
	} else {
		return Promise.resolve();
	}
}

function getFilterAllowedExpression(oFilterRestrictionsAnnotation?: MetaModelType<FilterRestrictionsType>) {
	const mAllowedExpressions: _FilterAllowedExpressions = {};
	if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation.FilterExpressionRestrictions !== undefined) {
		oFilterRestrictionsAnnotation.FilterExpressionRestrictions.forEach(function (oProperty) {
			if (oProperty.Property && oProperty.AllowedExpressions !== undefined) {
				//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
				if (mAllowedExpressions[oProperty.Property.$PropertyPath] !== undefined) {
					mAllowedExpressions[oProperty.Property.$PropertyPath].push(oProperty.AllowedExpressions as string);
				} else {
					mAllowedExpressions[oProperty.Property.$PropertyPath] = [oProperty.AllowedExpressions as string];
				}
			}
		});
	}
	return mAllowedExpressions;
}
function getFilterRestrictions(
	oFilterRestrictionsAnnotation?: MetaModelType<FilterRestrictionsType>,
	sRestriction?: "RequiredProperties" | "NonFilterableProperties"
) {
	let aProps: string[] = [];
	if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation[sRestriction as keyof MetaModelType<FilterRestrictionsType>]) {
		aProps = (
			oFilterRestrictionsAnnotation[sRestriction as keyof MetaModelType<FilterRestrictionsType>] as ExpandPathType<Edm.PropertyPath>[]
		).map(function (oProperty: ExpandPathType<Edm.PropertyPath>) {
			return oProperty.$PropertyPath;
		});
	}
	return aProps;
}

function _fetchPropertiesForNavPath(paths: string[], navPath: string, props: string[]) {
	const navPathPrefix = navPath + "/";
	return paths.reduce((outPaths: string[], pathToCheck: string) => {
		if (pathToCheck.startsWith(navPathPrefix)) {
			const outPath = pathToCheck.replace(navPathPrefix, "");
			if (outPaths.indexOf(outPath) === -1) {
				outPaths.push(outPath);
			}
		}
		return outPaths;
	}, props);
}
type _FilterAllowedExpressions = Record<string, string[]>;
type _FilterRestrictions = {
	RequiredProperties: string[];
	NonFilterableProperties: string[];
	FilterAllowedExpressions: _FilterAllowedExpressions;
};
function getFilterRestrictionsByPath(entityPath: string, oContext: ODataMetaModel) {
	const oRet: _FilterRestrictions = {
		RequiredProperties: [],
		NonFilterableProperties: [],
		FilterAllowedExpressions: {}
	};
	let oFilterRestrictions;
	const navigationText = "$NavigationPropertyBinding";
	const frTerm = "@Org.OData.Capabilities.V1.FilterRestrictions";
	const entityTypePathParts = entityPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
	const entityTypePath = `/${entityTypePathParts.join("/")}/`;
	const entitySetPath = ModelHelper.getEntitySetPath(entityPath, oContext);
	const entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
	const isContainment = oContext.getObject(`${entityTypePath}$ContainsTarget`);
	const containmentNavPath = !!isContainment && entityTypePathParts[entityTypePathParts.length - 1];

	//LEAST PRIORITY - Filter restrictions directly at Entity Set
	//e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
	if (!isContainment) {
		oFilterRestrictions = oContext.getObject(`${entitySetPath}${frTerm}`) as MetaModelType<FilterRestrictionsType> | undefined;
		oRet.RequiredProperties = getFilterRestrictions(oFilterRestrictions, "RequiredProperties") || [];
		const resultContextCheck = oContext.getObject(`${entityTypePath}@com.sap.vocabularies.Common.v1.ResultContext`);
		if (!resultContextCheck) {
			oRet.NonFilterableProperties = getFilterRestrictions(oFilterRestrictions, "NonFilterableProperties") || [];
		}
		//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
		oRet.FilterAllowedExpressions = getFilterAllowedExpression(oFilterRestrictions) || {};
	}

	if (entityTypePathParts.length > 1) {
		const navPath = isContainment ? (containmentNavPath as string) : entitySetPathParts[entitySetPathParts.length - 1];
		// In case of containment we take entitySet provided as parent. And in case of normal we would remove the last navigation from entitySetPath.
		const parentEntitySetPath = isContainment ? entitySetPath : `/${entitySetPathParts.slice(0, -1).join(`/${navigationText}/`)}`;
		//THIRD HIGHEST PRIORITY - Reading property path restrictions - Annotation at main entity but directly on navigation property path
		//e.g. Parent Customer with PropertyPath="Set/CityName" ContextPath: Customer/Set
		const oParentRet: _FilterRestrictions = {
			RequiredProperties: [],
			NonFilterableProperties: [],
			FilterAllowedExpressions: {}
		};
		if (!navPath.includes("%2F")) {
			const oParentFR = oContext.getObject(`${parentEntitySetPath}${frTerm}`) as MetaModelType<FilterRestrictionsType> | undefined;
			oRet.RequiredProperties = _fetchPropertiesForNavPath(
				getFilterRestrictions(oParentFR, "RequiredProperties") || [],
				navPath,
				oRet.RequiredProperties || []
			);
			oRet.NonFilterableProperties = _fetchPropertiesForNavPath(
				getFilterRestrictions(oParentFR, "NonFilterableProperties") || [],
				navPath,
				oRet.NonFilterableProperties || []
			);
			//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
			const completeAllowedExps = getFilterAllowedExpression(oParentFR) || {};
			oParentRet.FilterAllowedExpressions = Object.keys(completeAllowedExps).reduce(
				(outProp: Record<string, string[]>, propPath: string) => {
					if (propPath.startsWith(navPath + "/")) {
						const outPropPath = propPath.replace(navPath + "/", "");
						outProp[outPropPath] = completeAllowedExps[propPath];
					}
					return outProp;
				},
				{} as Record<string, string[]>
			);
		}

		//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
		oRet.FilterAllowedExpressions = mergeObjects(
			{},
			oRet.FilterAllowedExpressions || {},
			oParentRet.FilterAllowedExpressions || {}
		) as Record<string, string[]>;

		//SECOND HIGHEST priority - Navigation restrictions
		//e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
		const oNavRestrictions = MetaModelFunction.getNavigationRestrictions(oContext, parentEntitySetPath, navPath.replaceAll("%2F", "/"));
		const oNavFilterRest = oNavRestrictions && (oNavRestrictions["FilterRestrictions"] as MetaModelType<FilterRestrictionsType>);
		const navResReqProps = getFilterRestrictions(oNavFilterRest, "RequiredProperties") || [];
		oRet.RequiredProperties = uniqueSort(oRet.RequiredProperties.concat(navResReqProps));
		const navNonFilterProps = getFilterRestrictions(oNavFilterRest, "NonFilterableProperties") || [];
		oRet.NonFilterableProperties = uniqueSort(oRet.NonFilterableProperties.concat(navNonFilterProps));
		//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
		oRet.FilterAllowedExpressions = mergeObjects(
			{},
			oRet.FilterAllowedExpressions || {},
			getFilterAllowedExpression(oNavFilterRest) || {}
		) as Record<string, string[]>;

		//HIGHEST priority - Restrictions having target with navigation association entity
		// e.g. FR in "CustomerParameters/Set" ContextPath: "Customer/Set"
		const navAssociationEntityRest = oContext.getObject(
			`/${entityTypePathParts.join("/")}${frTerm}`
		) as MetaModelType<FilterRestrictionsType>;
		const navAssocReqProps = getFilterRestrictions(navAssociationEntityRest, "RequiredProperties") || [];
		oRet.RequiredProperties = uniqueSort(oRet.RequiredProperties.concat(navAssocReqProps));
		const navAssocNonFilterProps = getFilterRestrictions(navAssociationEntityRest, "NonFilterableProperties") || [];
		oRet.NonFilterableProperties = uniqueSort(oRet.NonFilterableProperties.concat(navAssocNonFilterProps));
		//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
		oRet.FilterAllowedExpressions = mergeObjects(
			{},
			oRet.FilterAllowedExpressions,
			getFilterAllowedExpression(navAssociationEntityRest) || {}
		) as _FilterAllowedExpressions;
	}
	return oRet;
}

type PreprocessorSettings = {
	bindingContexts: object;
	models: object;
};
type BaseTreeModifier = {
	templateControlFragment(
		sFragmentName: string,
		mPreprocessorSettings: PreprocessorSettings,
		oView?: View
	): Promise<UI5Element[] | Element[]>;
	targets: string;
};

async function templateControlFragment(
	sFragmentName: string,
	oPreprocessorSettings: PreprocessorSettings,
	oOptions: { view?: View; isXML?: boolean; id: string; controller: Controller },
	oModifier?: BaseTreeModifier
): Promise<Element | UI5Element | Element[] | UI5Element[]> {
	oOptions = oOptions || {};
	if (oModifier) {
		return oModifier.templateControlFragment(sFragmentName, oPreprocessorSettings, oOptions.view).then(function (oFragment) {
			// This is required as Flex returns an HTMLCollection as templating result in XML time.
			return oModifier.targets === "xmlTree" && oFragment.length > 0 ? oFragment[0] : oFragment;
		});
	} else {
		const oFragment = await XMLPreprocessor.process(
			XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"),
			{ name: sFragmentName },
			oPreprocessorSettings
		);
		const oControl = oFragment.firstElementChild;
		if (!!oOptions.isXML && oControl) {
			return oControl;
		}
		return Fragment.load({
			id: oOptions.id,
			definition: oFragment as unknown as string,
			controller: oOptions.controller
		});
	}
}

function getSingletonPath(path: string, metaModel: ODataMetaModel): string | undefined {
	const parts = path.split("/").filter(Boolean),
		propertyName = parts.pop()!,
		navigationPath = parts.join("/"),
		entitySet = navigationPath && metaModel.getObject(`/${navigationPath}`);
	if (entitySet?.$kind === "Singleton") {
		const singletonName = parts[parts.length - 1];
		return `/${singletonName}/${propertyName}`;
	}
	return undefined;
}

async function requestSingletonProperty(path: string, model: ODataModel) {
	if (!path || !model) {
		return Promise.resolve(null);
	}
	const metaModel = model.getMetaModel();
	// Find the underlying entity set from the property path and check whether it is a singleton.
	const resolvedPath = getSingletonPath(path, metaModel);
	if (resolvedPath) {
		const propertyBinding = model.bindProperty(resolvedPath);
		return propertyBinding.requestValue();
	}

	return Promise.resolve(null);
}

// Get the path for action parameters that is needed to read the annotations
function getParameterPath(sPath: string, sParameter: string) {
	let sContext;
	if (sPath.indexOf("@$ui5.overload") > -1) {
		sContext = sPath.split("@$ui5.overload")[0];
	} else {
		// For Unbound Actions in Action Parameter Dialogs
		const aAction = sPath.split("/0")[0].split(".");
		sContext = `/${aAction[aAction.length - 1]}/`;
	}
	return sContext + sParameter;
}

/**
 * Get resolved expression binding used for texts at runtime.
 *
 * @param expBinding
 * @param control
 * @function
 * @static
 * @memberof sap.fe.core.CommonUtils
 * @returns A string after resolution.
 * @ui5-restricted
 */
function _fntranslatedTextFromExpBindingString(expBinding: string, control: Control) {
	// The idea here is to create dummy element with the expresion binding.
	// Adding it as dependent to the view/control would propagate all the models to the dummy element and resolve the binding.
	// We remove the dummy element after that and destroy it.

	const anyResourceText = new AnyElement({ anyText: expBinding });
	control.addDependent(anyResourceText);
	const resultText = anyResourceText.getAnyText();
	control.removeDependent(anyResourceText);
	anyResourceText.destroy();

	return resultText;
}
/**
 * Check if the current device has a small screen.
 *
 * @returns A Boolean.
 * @private
 */
function isSmallDevice() {
	return !system.desktop || Device.resize.width <= 320;
}
/**
 * Get filter information for a SelectionVariant annotation.
 *
 * @param oControl The table/chart instance
 * @param selectionVariantPath Relative SelectionVariant annotation path
 * @param isChart
 * @returns Information on filters
 *  filters: array of sap.ui.model.filters
 * text: Text property of the SelectionVariant
 * @private
 * @ui5-restricted
 */
interface ISelectionOption {
	PropertyName: { $PropertyPath: string };
	Ranges: {
		[key: string]: {
			Option: { $EnumMember: String };
			Low: unknown;
			High: unknown;
		};
	};
}
function getFiltersInfoForSV(oControl: Control | MDCChart | MDCTable, selectionVariantPath: string, isChart?: boolean) {
	const sEntityTypePath = oControl.data("entityType"),
		oMetaModel = CommonUtils.getAppComponent(oControl as Control).getMetaModel(),
		mPropertyFilters: Record<string, Filter[]> = {},
		aFilters = [],
		aPaths: string[] = [];
	let sText = "";
	let oSelectionVariant = oMetaModel.getObject(`${sEntityTypePath}${selectionVariantPath}`);
	// for chart the structure varies hence read it from main object
	if (isChart) {
		oSelectionVariant = oSelectionVariant.SelectionVariant;
	}
	if (oSelectionVariant) {
		sText = oSelectionVariant.Text;
		(oSelectionVariant.SelectOptions || [])
			.filter(function (oSelectOption: ISelectionOption) {
				return oSelectOption && oSelectOption.PropertyName && oSelectOption.PropertyName.$PropertyPath;
			})
			.forEach(function (oSelectOption: ISelectionOption) {
				const sPath = oSelectOption.PropertyName.$PropertyPath;
				if (!aPaths.includes(sPath)) {
					aPaths.push(sPath);
				}
				for (const j in oSelectOption.Ranges) {
					const oRange = oSelectOption.Ranges[j];
					mPropertyFilters[sPath] = (mPropertyFilters[sPath] || []).concat(
						new Filter(sPath, oRange.Option?.$EnumMember?.split("/").pop() as undefined, oRange.Low, oRange.High)
					);
				}
			});

		for (const sPropertyPath in mPropertyFilters) {
			aFilters.push(
				new Filter({
					filters: mPropertyFilters[sPropertyPath],
					and: false
				})
			);
		}
	}

	return {
		properties: aPaths,
		filters: aFilters,
		text: sText
	};
}

function getConverterContextForPath(sMetaPath: string, oMetaModel: ODataMetaModel, sEntitySet: string, oDiagnostics: Diagnostics) {
	const oContext = oMetaModel.createBindingContext(sMetaPath) as ODataV4Context;
	return ConverterContext?.createConverterContextForMacro(sEntitySet, oContext || oMetaModel, oDiagnostics, mergeObjects, undefined);
}

/**
 * This function returns an ID which should be used in the internal chart for the measure or dimension.
 * For standard cases, this is just the ID of the property.
 * If it is necessary to use another ID internally inside the chart (e.g. on duplicate property IDs) this method can be overwritten.
 * In this case, <code>getPropertyFromNameAndKind</code> needs to be overwritten as well.
 *
 * @param name ID of the property
 * @param kind Type of the property (measure or dimension)
 * @returns Internal ID for the sap.chart.Chart
 * @private
 * @ui5-restricted
 */
function getInternalChartNameFromPropertyNameAndKind(name: string, kind: string) {
	return name.replace("_fe_" + kind + "_", "");
}

/**
 * This function returns an array of chart properties by remvoing _fe_groupable prefix.
 *
 * @param {Array} aFilters Chart filter properties
 * @returns Chart properties without prefixes
 * @private
 * @ui5-restricted
 */
interface IFilterProp {
	sPath: string;
}
function getChartPropertiesWithoutPrefixes(aFilters: IFilterProp[]) {
	aFilters.forEach((element: IFilterProp) => {
		if (element.sPath && element.sPath.includes("fe_groupable")) {
			element.sPath = CommonUtils.getInternalChartNameFromPropertyNameAndKind(element.sPath, "groupable");
		}
	});
	return aFilters;
}

const CommonUtils = {
	fireButtonPress: fnFireButtonPress,
	getTargetView: getTargetView,
	getCurrentPageView: getCurrentPageView,
	hasTransientContext: fnHasTransientContexts,
	updateRelatedAppsDetails: fnUpdateRelatedAppsDetails,
	getAppComponent: getAppComponent,
	getMandatoryFilterFields: fnGetMandatoryFilterFields,
	getContextPathProperties: fnGetContextPathProperties,
	getParameterInfo: getParameterInfo,
	updateDataFieldForIBNButtonsVisibility: fnUpdateDataFieldForIBNButtonsVisibility,
	getEntitySetName: getEntitySetName,
	getActionPath: getActionPath,
	computeDisplayMode: computeDisplayMode,
	isStickyEditMode: isStickyEditMode,
	getOperatorsForProperty: getOperatorsForProperty,
	getOperatorsForDateProperty: getOperatorsForDateProperty,
	getOperatorsForGuidProperty: getOperatorsForGuidProperty,
	addSelectionVariantToConditions: addSelectionVariantToConditions,
	addExternalStateFiltersToSelectionVariant: addExternalStateFiltersToSelectionVariant,
	addPageContextToSelectionVariant: addPageContextToSelectionVariant,
	addDefaultDisplayCurrency: addDefaultDisplayCurrency,
	setUserDefaults: setUserDefaults,
	getIBNActions: fnGetIBNActions,
	getHeaderFacetItemConfigForExternalNavigation: getHeaderFacetItemConfigForExternalNavigation,
	getSemanticObjectMapping: getSemanticObjectMapping,
	setSemanticObjectMappings: setSemanticObjectMappings,
	getSemanticObjectPromise: fnGetSemanticObjectPromise,
	getSemanticTargetsFromPageModel: fnGetSemanticTargetsFromPageModel,
	getSemanticObjectsFromPath: fnGetSemanticObjectsFromPath,
	updateSemanticTargets: fnUpdateSemanticTargetsModel,
	waitForContextRequested: waitForContextRequested,
	getFilterRestrictionsByPath: getFilterRestrictionsByPath,
	getSpecificAllowedExpression: getSpecificAllowedExpression,
	getAdditionalParamsForCreate: getAdditionalParamsForCreate,
	requestSingletonProperty: requestSingletonProperty,
	templateControlFragment: templateControlFragment,
	FilterRestrictions: {
		REQUIRED_PROPERTIES: "RequiredProperties",
		NON_FILTERABLE_PROPERTIES: "NonFilterableProperties",
		ALLOWED_EXPRESSIONS: "FilterAllowedExpressions"
	},
	AllowedExpressionsPrio: ["SingleValue", "MultiValue", "SingleRange", "MultiRange", "SearchExpression", "MultiRangeOrSearchExpression"],
	normalizeSearchTerm: normalizeSearchTerm,
	setContextsBasedOnOperationAvailable: setContextsBasedOnOperationAvailable,
	setDynamicActionContexts: setDynamicActionContexts,
	requestProperty: requestProperty,
	getParameterPath: getParameterPath,
	getRelatedAppsMenuItems: _getRelatedAppsMenuItems,
	getTranslatedTextFromExpBindingString: _fntranslatedTextFromExpBindingString,
	addSemanticDatesToConditions: addSemanticDatesToConditions,
	addSelectOptionToConditions: addSelectOptionToConditions,
	createSemanticDatesFromConditions: createSemanticDatesFromConditions,
	updateRelateAppsModel: updateRelateAppsModel,
	getSemanticObjectAnnotations: _getSemanticObjectAnnotations,
	getFiltersInfoForSV: getFiltersInfoForSV,
	getInternalChartNameFromPropertyNameAndKind: getInternalChartNameFromPropertyNameAndKind,
	getChartPropertiesWithoutPrefixes: getChartPropertiesWithoutPrefixes,
	isSmallDevice,
	getConverterContextForPath
};

export default CommonUtils;
