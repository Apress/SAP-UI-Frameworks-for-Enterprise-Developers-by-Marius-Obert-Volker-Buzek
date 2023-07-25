// Formatters for the Object Page
import { EntitySet } from "@sap-ux/vocabularies-types";
import type { DataFieldForAction, DataFieldTypes, HeaderInfoType } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import type { BaseAction, CustomAction } from "sap/fe/core/converters/controls/Common/Action";
import { DataVisualizationSubSection } from "sap/fe/core/converters/controls/ObjectPage/SubSection";
import { Draft, Entity, UI } from "sap/fe/core/converters/helpers/BindingHelper";
import {
	and,
	BindingToolkitExpression,
	CompiledBindingToolkitExpression,
	compileExpression,
	concat,
	constant,
	equal,
	getExpressionFromAnnotation,
	ifElse,
	isEmpty,
	not,
	or,
	resolveBindingString
} from "sap/fe/core/helpers/BindingToolkit";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { ViewData } from "sap/fe/core/services/TemplatedViewServiceFactory";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { enhanceDataModelPath } from "sap/fe/core/templating/DataModelPathHelper";
import { ComputedAnnotationInterface } from "sap/fe/core/templating/UIFormatters";
import CommonHelper from "sap/fe/macros/CommonHelper";
import { addTextArrangementToBindingExpression, formatValueRecursively } from "sap/fe/macros/field/FieldTemplating";
import { getLabelForConnectedFields } from "sap/fe/macros/internal/form/FormTemplating";
import mLibrary from "sap/m/library";
import ManagedObject from "sap/ui/base/ManagedObject";
import ODataModelAnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";
import type Context from "sap/ui/model/odata/v4/Context";

const ButtonType = mLibrary.ButtonType;

//```mermaid
// graph TD
// A[Object Page Title] -->|Get DataField Value| C{Evaluate Create Mode}
// C -->|In Create Mode| D{Is DataField Value empty}
// D -->|Yes| F{Is there a TypeName}
// F -->|Yes| G[Is there an custom title]
// G -->|Yes| G1[Show the custom title + 'TypeName']
// G -->|No| G2[Display the default title 'New + TypeName']
// F -->|No| H[Is there a custom title]
// H -->|Yes| I[Show the custom title]
// H -->|No| J[Show the default 'Unamned Object']
// D -->|No| E
// C -->|Not in create mode| E[Show DataField Value]
// ```
/**
 * Compute the title for the object page.
 *
 * @param oHeaderInfo The @UI.HeaderInfo annotation content
 * @param oViewData The view data object we're currently on
 * @param fullContextPath The full context path used to reach that object page
 * @param oDraftRoot
 * @returns The binding expression for the object page title
 */
export const getExpressionForTitle = function (
	oHeaderInfo: HeaderInfoType | undefined,
	oViewData: ViewData,
	fullContextPath: DataModelObjectPath,
	oDraftRoot: Object | undefined
): CompiledBindingToolkitExpression {
	const titleNoHeaderInfo = oViewData.resourceModel.getText("T_NEW_OBJECT", undefined, oViewData.entitySet);

	const titleWithHeaderInfo = oViewData.resourceModel.getText(
		"T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE",
		undefined,
		oViewData.entitySet
	);

	const oEmptyHeaderInfoTitle =
		oHeaderInfo?.Title === undefined || (oHeaderInfo?.Title as any) === "" || (oHeaderInfo?.Title as DataFieldTypes)?.Value === "";

	const titleForActiveHeaderNoHeaderInfo = !oEmptyHeaderInfoTitle
		? oViewData.resourceModel.getText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO")
		: "";
	let titleValueExpression,
		connectedFieldsPath,
		titleIsEmpty: BindingToolkitExpression<boolean> = constant(true),
		titleBooleanExpression: BindingToolkitExpression<boolean> | boolean;
	if (oHeaderInfo?.Title?.$Type === "com.sap.vocabularies.UI.v1.DataField") {
		titleValueExpression = getExpressionFromAnnotation((oHeaderInfo?.Title as DataFieldTypes)?.Value);
		if ((oHeaderInfo?.Title as DataFieldTypes)?.Value?.$target?.annotations?.Common?.Text?.annotations?.UI?.TextArrangement) {
			// In case an explicit text arrangement was set we make use of it in the description as well
			titleValueExpression = addTextArrangementToBindingExpression(titleValueExpression, fullContextPath);
		}
		titleValueExpression = formatValueRecursively(titleValueExpression, fullContextPath);
		titleIsEmpty = titleValueExpression?._type === "Constant" ? constant(!titleValueExpression?.value) : isEmpty(titleValueExpression);
	} else if (
		oHeaderInfo?.Title?.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" &&
		oHeaderInfo?.Title?.Target.$target.$Type === "com.sap.vocabularies.UI.v1.ConnectedFieldsType"
	) {
		connectedFieldsPath = enhanceDataModelPath(fullContextPath, "$Type/@UI.HeaderInfo/Title/Target/$AnnotationPath");
		titleValueExpression = getLabelForConnectedFields(connectedFieldsPath, false) as BindingToolkitExpression<string>;
		titleBooleanExpression =
			titleValueExpression?._type === "Constant" ? constant(!titleValueExpression?.value) : isEmpty(titleValueExpression);
		titleIsEmpty = titleValueExpression ? titleBooleanExpression : constant(true);
	}

	// If there is a TypeName defined, show the default title 'New + TypeName', otherwise show the custom title or the default 'New object'
	const createModeTitle = oHeaderInfo?.TypeName
		? concat(titleWithHeaderInfo, ": ", resolveBindingString(oHeaderInfo.TypeName.toString()))
		: titleNoHeaderInfo;
	const activeExpression = oDraftRoot ? Entity.IsActive : true;
	return compileExpression(
		ifElse(
			and(UI.IsCreateMode, titleIsEmpty),
			createModeTitle,

			// Otherwise show the default expression
			ifElse(and(activeExpression, titleIsEmpty), titleForActiveHeaderNoHeaderInfo, titleValueExpression)
		)
	);
};

/**
 * Retrieves the expression for the description of an object page.
 *
 * @param oHeaderInfo The @UI.HeaderInfo annotation content
 * @param fullContextPath The full context path used to reach that object page
 * @returns The binding expression for the object page description
 */
export const getExpressionForDescription = function (
	oHeaderInfo: HeaderInfoType | undefined,
	fullContextPath: DataModelObjectPath
): CompiledBindingToolkitExpression {
	let pathInModel = getExpressionFromAnnotation((oHeaderInfo?.Description as DataFieldTypes)?.Value);
	if ((oHeaderInfo?.Description as DataFieldTypes)?.Value?.$target?.annotations?.Common?.Text?.annotations?.UI?.TextArrangement) {
		// In case an explicit text arrangement was set we make use of it in the description as well
		pathInModel = addTextArrangementToBindingExpression(pathInModel, fullContextPath);
	}

	return compileExpression(formatValueRecursively(pathInModel, fullContextPath));
};

/**
 * Return the expression for the save button.
 *
 * @param oViewData The current view data
 * @param fullContextPath The path used up until here
 * @returns The binding expression that shows the right save button text
 */
export const getExpressionForSaveButton = function (
	oViewData: ViewData,
	fullContextPath: DataModelObjectPath
): CompiledBindingToolkitExpression {
	const saveButtonText = oViewData.resourceModel.getText("T_OP_OBJECT_PAGE_SAVE");
	const createButtonText = oViewData.resourceModel.getText("T_OP_OBJECT_PAGE_CREATE");
	let saveExpression;

	if ((fullContextPath.startingEntitySet as EntitySet).annotations.Session?.StickySessionSupported) {
		// If we're in sticky mode AND the ui is in create mode, show Create, else show Save
		saveExpression = ifElse(UI.IsCreateMode, createButtonText, saveButtonText);
	} else {
		// If we're in draft AND the draft is a new object (!IsActiveEntity && !HasActiveEntity), show create, else show save
		saveExpression = ifElse(Draft.IsNewObject, createButtonText, saveButtonText);
	}
	return compileExpression(saveExpression);
};

/**
 * Method returns Whether the action type is manifest or not.
 *
 * @function
 * @name isManifestAction
 * @param oAction The action object
 * @returns `true` if action is coming from manifest, `false` otherwise
 */
export const isManifestAction = function (oAction: any): oAction is CustomAction {
	const aActions = [
		"Primary",
		"DefaultApply",
		"Secondary",
		"ForAction",
		"ForNavigation",
		"SwitchToActiveObject",
		"SwitchToDraftObject",
		"DraftActions",
		"Copy"
	];
	return aActions.indexOf(oAction.type) < 0;
};

/**
 * Returns a compiled expression to determine Emphasized  button type based on Criticality across all actions
 * If critical action is rendered, its considered to be the primary action. Hence template's default primary action is set back to Default.
 *
 * @function
 * @static
 * @name sap.fe.templates.ObjectPage.ObjectPageTemplating.buildEmphasizedButtonExpression
 * @memberof sap.fe.templates.ObjectPage.ObjectPageTemplating
 * @param dataContextPath The dataModelObjectPath related to the context
 * @returns An expression to deduce if button type is Default or Emphasized
 * @private
 * @ui5-restricted
 */
export const buildEmphasizedButtonExpression = function (dataContextPath: DataModelObjectPath) {
	const identification = dataContextPath.targetEntityType?.annotations?.UI?.Identification;
	const dataFieldsWithCriticality =
		identification?.filter((dataField) => dataField.$Type === UIAnnotationTypes.DataFieldForAction && dataField.Criticality) || [];

	const dataFieldsBindingExpressions = dataFieldsWithCriticality.length
		? dataFieldsWithCriticality.map((dataField) => {
				const criticalityVisibleBindingExpression = getExpressionFromAnnotation(dataField.Criticality);
				return and(
					not(equal(getExpressionFromAnnotation(dataField.annotations?.UI?.Hidden), true)),
					or(
						equal(criticalityVisibleBindingExpression, "UI.CriticalityType/Negative"),
						equal(criticalityVisibleBindingExpression, "1"),
						equal(criticalityVisibleBindingExpression as BindingToolkitExpression<number>, 1),
						equal(criticalityVisibleBindingExpression, "UI.CriticalityType/Positive"),
						equal(criticalityVisibleBindingExpression, "3"),
						equal(criticalityVisibleBindingExpression as BindingToolkitExpression<number>, 3)
					)
				);
		  })
		: ([constant(false)] as BindingToolkitExpression<boolean>[]);

	// If there is at least one visible dataField with criticality negative or positive, the type is set as Default
	// else it is emphasized
	return compileExpression(ifElse(or(...dataFieldsBindingExpressions), ButtonType.Default, ButtonType.Emphasized));
};

export const getElementBinding = function (sPath: any) {
	const sNavigationPath = ODataModelAnnotationHelper.getNavigationPath(sPath);
	if (sNavigationPath) {
		return "{path:'" + sNavigationPath + "'}";
	} else {
		//no navigation property needs empty object
		return "{path: ''}";
	}
};

/**
 * Function to check if draft pattern is supported.
 *
 * @param oAnnotations Annotations of the current entity set.
 * @returns Returns the Boolean value based on draft state
 */
export const checkDraftState = function (oAnnotations: any) {
	if (
		oAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] &&
		oAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"]["EditAction"]
	) {
		return true;
	} else {
		return false;
	}
};

/**
 * Function to get the visibility for the SwitchToActive button in the object page or subobject page.
 *
 * @param oAnnotations Annotations of the current entity set.
 * @returns Returns expression binding or Boolean value based on the draft state
 */
export const getSwitchToActiveVisibility = function (oAnnotations: any): any {
	if (checkDraftState(oAnnotations)) {
		return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( ${ui>/isEditable} && !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
	} else {
		return false;
	}
};

/**
 * Function to get the visibility for the SwitchToDraft button in the object page or subobject page.
 *
 * @param oAnnotations Annotations of the current entity set.
 * @returns Returns expression binding or Boolean value based on the draft state
 */
export const getSwitchToDraftVisibility = function (oAnnotations: any): any {
	if (checkDraftState(oAnnotations)) {
		return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !(${ui>/isEditable}) && !${ui>createMode} && ${HasDraftEntity} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
	} else {
		return false;
	}
};

/**
 * Function to get the visibility for the SwitchDraftAndActive button in the object page or subobject page.
 *
 * @param oAnnotations Annotations of the current entity set.
 * @returns Returns expression binding or Boolean value based on the draft state
 */
export const getSwitchDraftAndActiveVisibility = function (oAnnotations: any): any {
	if (checkDraftState(oAnnotations)) {
		return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
	} else {
		return false;
	}
};

/**
 * Function to find an action from the array of header actions in the converter context.
 *
 * @param aConverterContextHeaderActions Array of 'header' actions on the object page.
 * @param sActionType The action type
 * @returns The action with the matching action type
 * @private
 */
export const _findAction = function (aConverterContextHeaderActions: any[], sActionType: string) {
	let oAction;
	if (aConverterContextHeaderActions && aConverterContextHeaderActions.length) {
		oAction = aConverterContextHeaderActions.find(function (oHeaderAction: any) {
			return oHeaderAction.type === sActionType;
		});
	}
	return oAction;
};

/**
 * Function to format the 'enabled' property for the Delete button on the object page or subobject page in case of a Command Execution.
 *
 * @param aConverterContextHeaderActions Array of header actions on the object page
 * @returns Returns expression binding or Boolean value from the converter output
 */
export const getDeleteCommandExecutionEnabled = function (aConverterContextHeaderActions: any[]) {
	const oDeleteAction = _findAction(aConverterContextHeaderActions, "Secondary");
	return oDeleteAction ? oDeleteAction.enabled : "true";
};

/**
 * Function to format the 'visible' property for the Delete button on the object page or subobject page in case of a Command Execution.
 *
 * @param aConverterContextHeaderActions Array of header actions on the object page
 * @returns Returns expression binding or Boolean value from the converter output
 */
export const getDeleteCommandExecutionVisible = function (aConverterContextHeaderActions: any[]) {
	const oDeleteAction = _findAction(aConverterContextHeaderActions, "Secondary");
	return oDeleteAction ? oDeleteAction.visible : "true";
};

/**
 * Function to format the 'visible' property for the Edit button on the object page or subobject page in case of a Command Execution.
 *
 * @param aConverterContextHeaderActions Array of header actions on the object page
 * @returns Returns expression binding or Boolean value from the converter output
 */
export const getEditCommandExecutionVisible = function (aConverterContextHeaderActions: any[]) {
	const oEditAction = _findAction(aConverterContextHeaderActions, "Primary");
	return oEditAction ? oEditAction.visible : "false";
};

/**
 * Function to format the 'enabled' property for the Edit button on the object page or subobject page in case of a Command Execution.
 *
 * @param aConverterContextHeaderActions Array of header actions on the object page
 * @returns Returns expression binding or Boolean value from the converter output
 */
export const getEditCommandExecutionEnabled = function (aConverterContextHeaderActions: any[]) {
	const oEditAction = _findAction(aConverterContextHeaderActions, "Primary");
	return oEditAction ? oEditAction.enabled : "false";
};

/**
 * Function to get the EditAction from the based on a draft-enabled application or a sticky application.
 *
 * @param [oEntitySet] The value from the expression.
 * @returns Returns expression binding or Boolean value based on vRawValue & oDraftNode
 */
export const getEditAction = function (oEntitySet: Context) {
	const sPath = oEntitySet.getPath();
	const aPaths = sPath.split("/");
	const rootEntitySetPath = "/" + aPaths[1];
	// get the edit action from root entity sets
	const rootEntitySetAnnnotations = oEntitySet.getObject(rootEntitySetPath + "@");
	const bDraftRoot = rootEntitySetAnnnotations.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftRoot");
	const bDraftNode = rootEntitySetAnnnotations.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftNode");
	const bStickySession = rootEntitySetAnnnotations.hasOwnProperty("@com.sap.vocabularies.Session.v1.StickySessionSupported");
	let sActionName;
	if (bDraftRoot) {
		sActionName = oEntitySet.getObject(`${rootEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot/EditAction`);
	} else if (bDraftNode) {
		sActionName = oEntitySet.getObject(`${rootEntitySetPath}@com.sap.vocabularies.Common.v1.DraftNode/EditAction`);
	} else if (bStickySession) {
		sActionName = oEntitySet.getObject(`${rootEntitySetPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/EditAction`);
	}
	return !sActionName ? sActionName : `${rootEntitySetPath}/${sActionName}`;
};

export const isReadOnlyFromStaticAnnotations = function (oAnnotations: any, oFieldControl: any) {
	let bComputed, bImmutable, bReadOnly;
	if (oAnnotations && oAnnotations["@Org.OData.Core.V1.Computed"]) {
		bComputed = oAnnotations["@Org.OData.Core.V1.Computed"].Bool ? oAnnotations["@Org.OData.Core.V1.Computed"].Bool == "true" : true;
	}
	if (oAnnotations && oAnnotations["@Org.OData.Core.V1.Immutable"]) {
		bImmutable = oAnnotations["@Org.OData.Core.V1.Immutable"].Bool ? oAnnotations["@Org.OData.Core.V1.Immutable"].Bool == "true" : true;
	}
	bReadOnly = bComputed || bImmutable;

	if (oFieldControl) {
		bReadOnly = bReadOnly || oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly";
	}
	if (bReadOnly) {
		return true;
	} else {
		return false;
	}
};

export const readOnlyExpressionFromDynamicAnnotations = function (oFieldControl: any) {
	let sIsFieldControlPathReadOnly;
	if (oFieldControl) {
		if ((ManagedObject as any).bindingParser(oFieldControl)) {
			sIsFieldControlPathReadOnly = "%" + oFieldControl + " === 1 ";
		}
	}
	if (sIsFieldControlPathReadOnly) {
		return "{= " + sIsFieldControlPathReadOnly + "? false : true }";
	} else {
		return undefined;
	}
};

/*
 * Function to get the expression for chart Title Press
 *
 * @functionw
 * @param {oConfiguration} [oConfigurations] control configuration from manifest
 *  @param {oManifest} [oManifest] Outbounds from manifest
 * returns {String} [sCollectionName] Collection Name of the Micro Chart
 *
 * returns {String} [Expression] Handler Expression for the title press
 *
 */
export const getExpressionForMicroChartTitlePress = function (oConfiguration: any, oManifestOutbound: any, sCollectionName: any) {
	if (oConfiguration) {
		if (
			(oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"]) ||
			(oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"] && oConfiguration["targetSections"])
		) {
			return (
				".handlers.onDataPointTitlePressed($controller, ${$source>/},'" +
				JSON.stringify(oManifestOutbound) +
				"','" +
				oConfiguration["targetOutbound"]["outbound"] +
				"','" +
				sCollectionName +
				"' )"
			);
		} else if (oConfiguration["targetSections"]) {
			return ".handlers.navigateToSubSection($controller, '" + JSON.stringify(oConfiguration["targetSections"]) + "')";
		} else {
			return undefined;
		}
	}
};

/*
 * Function to render Chart Title as Link
 *
 * @function
 * @param {oControlConfiguration} [oConfigurations] control configuration from manifest
 * returns {String} [sKey] For the TargetOutbound and TargetSection
 *
 */
export const getMicroChartTitleAsLink = function (oControlConfiguration: any) {
	if (
		oControlConfiguration &&
		(oControlConfiguration["targetOutbound"] || (oControlConfiguration["targetOutbound"] && oControlConfiguration["targetSections"]))
	) {
		return "External";
	} else if (oControlConfiguration && oControlConfiguration["targetSections"]) {
		return "InPage";
	} else {
		return "None";
	}
};

/* Get groupId from control configuration
 *
 * @function
 * @param {Object} [oConfigurations] control configuration from manifest
 * @param {String} [sAnnotationPath] Annotation Path for the configuration
 * @description Used to get the groupId for DataPoints and MicroCharts in the Header.
 *
 */
export const getGroupIdFromConfig = function (oConfigurations: any, sAnnotationPath: any, sDefaultGroupId?: any) {
	const oConfiguration = oConfigurations[sAnnotationPath],
		aAutoPatterns = ["Heroes", "Decoration", "Workers", "LongRunners"];
	let sGroupId = sDefaultGroupId;
	if (
		oConfiguration &&
		oConfiguration.requestGroupId &&
		aAutoPatterns.some(function (autoPattern: string) {
			return autoPattern === oConfiguration.requestGroupId;
		})
	) {
		sGroupId = "$auto." + oConfiguration.requestGroupId;
	}
	return sGroupId;
};

/*
 * Get Context Binding with groupId from control configuration
 *
 * @function
 * @param {Object} [oConfigurations] control configuration from manifest
 * @param {String} [sKey] Annotation Path for of the configuration
 * @description Used to get the binding for DataPoints in the Header.
 *
 */
export const getBindingWithGroupIdFromConfig = function (oConfigurations: any, sKey: any) {
	const sGroupId = getGroupIdFromConfig(oConfigurations, sKey);
	let sBinding;
	if (sGroupId) {
		sBinding = "{ path : '', parameters : { $$groupId : '" + sGroupId + "' } }";
	}
	return sBinding;
};

/**
 * Method to check whether a FieldGroup consists of only 1 DataField with MultiLine Text annotation.
 *
 * @param aFormElements A collection of form elements used in the current field group
 * @returns Returns true if only 1 data field with Multiline Text annotation exists.
 */
export const doesFieldGroupContainOnlyOneMultiLineDataField = function (aFormElements: any[]) {
	return aFormElements && aFormElements.length === 1 && !!aFormElements[0].isValueMultilineText;
};

/*
 * Get visiblity of breadcrumbs.
 *
 * @function
 * @param {Object} [oViewData] ViewData model
 * returns {*} Expression or Boolean value
 */
export const getVisibleExpressionForBreadcrumbs = function (oViewData: any) {
	return oViewData.showBreadCrumbs && oViewData.fclEnabled !== undefined ? "{fclhelper>/breadCrumbIsVisible}" : oViewData.showBreadCrumbs;
};

/**
 *
 * @param viewData Specifies the ViewData model
 * @returns Expression or Boolean value
 */
export const getShareButtonVisibility = function (viewData: any) {
	let sShareButtonVisibilityExp = "!${ui>createMode}";
	if (viewData.fclEnabled) {
		sShareButtonVisibilityExp = "${fclhelper>/showShareIcon} && " + sShareButtonVisibilityExp;
	}
	if (viewData.isShareButtonVisibleForMyInbox === false) {
		return "false";
	}
	return "{= " + sShareButtonVisibilityExp + " }";
};

/*
 * Gets the visibility of the header info in edit mode
 *
 * If either the title or description field from the header annotations are editable, then the
 * editable header info is visible.
 *
 * @function
 * @param {object} [oAnnotations] Annotations object for given entity set
 * @param {object} [oFieldControl] field control
 * returns {*}  binding expression or boolean value resolved form funcitons isReadOnlyFromStaticAnnotations and isReadOnlyFromDynamicAnnotations
 */
export const getVisiblityOfHeaderInfo = function (
	oTitleAnnotations: any,
	oDescriptionAnnotations: any,
	oFieldTitleFieldControl: any,
	oFieldDescriptionFieldControl: any
) {
	// Check Annotations for Title Field
	// Set to true and don't take into account, if there are no annotations, i.e. no title exists
	const bIsTitleReadOnly = oTitleAnnotations ? isReadOnlyFromStaticAnnotations(oTitleAnnotations, oFieldTitleFieldControl) : true;
	const titleExpression = readOnlyExpressionFromDynamicAnnotations(oFieldTitleFieldControl);
	// There is no expression and the title is not ready only, this is sufficient for an editable header
	if (!bIsTitleReadOnly && !titleExpression) {
		return true;
	}

	// Check Annotations for Description Field
	// Set to true and don't take into account, if there are no annotations, i.e. no description exists
	const bIsDescriptionReadOnly = oDescriptionAnnotations
		? isReadOnlyFromStaticAnnotations(oDescriptionAnnotations, oFieldDescriptionFieldControl)
		: true;
	const descriptionExpression = readOnlyExpressionFromDynamicAnnotations(oFieldDescriptionFieldControl);
	// There is no expression and the description is not ready only, this is sufficient for an editable header
	if (!bIsDescriptionReadOnly && !descriptionExpression) {
		return true;
	}

	// Both title and description are not editable and there are no dynamic annotations
	if (bIsTitleReadOnly && bIsDescriptionReadOnly && !titleExpression && !descriptionExpression) {
		return false;
	}

	// Now combine expressions
	if (titleExpression && !descriptionExpression) {
		return titleExpression;
	} else if (!titleExpression && descriptionExpression) {
		return descriptionExpression;
	} else {
		return combineTitleAndDescriptionExpression(oFieldTitleFieldControl, oFieldDescriptionFieldControl);
	}
};

export const combineTitleAndDescriptionExpression = function (oTitleFieldControl: any, oDescriptionFieldControl: any) {
	// If both header and title field are based on dynmaic field control, the editable header
	// is visible if at least one of these is not ready only
	return "{= %" + oTitleFieldControl + " === 1 ? ( %" + oDescriptionFieldControl + " === 1 ? false : true ) : true }";
};

/*
 * Get Expression of press event of delete button.
 *
 * @function
 * @param {string} [sEntitySetName] Entity set name
 * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
 */
export const getPressExpressionForDelete = function (entitySet: Object, oInterface: ComputedAnnotationInterface): string {
	const sDeletableContexts = "${$view>/getBindingContext}",
		sTitle = "${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedHeading/getItems/1/getText}",
		sDescription = "${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedContent/0/getItems/0/getText}";
	const esContext = oInterface && oInterface.context;
	const contextPath = esContext.getPath();
	const contextPathParts = contextPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
	const sEntitySetName =
		contextPathParts.length > 1 ? esContext.getModel().getObject(`/${contextPathParts.join("/")}@sapui.name`) : contextPathParts[0];
	const oParams = {
		title: sTitle,
		entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
		description: sDescription
	};
	return CommonHelper.generateFunction(".editFlow.deleteDocument", sDeletableContexts, CommonHelper.objectToString(oParams));
};

getPressExpressionForDelete.requiresIContext = true;

/*
 * Get Expression of press event of Edit button.
 *
 * @function
 * @param {object} [oDataField] Data field object
 * @param {string} [sEntitySetName] Entity set name
 * @param {object} [oHeaderAction] Header action object
 * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
 */
export const getPressExpressionForEdit = function (oDataField: any, sEntitySetName: any, oHeaderAction: any) {
	const sEditableContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
		sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
		sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
	const oParams = {
		contexts: "${$view>/getBindingContext}",
		entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
		invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
		model: "${$source>/}.getModel()",
		label: CommonHelper.addSingleQuotes(oDataField && oDataField.Label, true),
		isNavigable: oHeaderAction && oHeaderAction.isNavigable,
		defaultValuesExtensionFunction:
			oHeaderAction && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
	};
	return CommonHelper.generateFunction(".handlers.onCallAction", "${$view>/}", sEditableContexts, CommonHelper.objectToString(oParams));
};

/*
 * Method to get the expression for the 'press' event for footer annotation actions
 *
 * @function
 * @param {object} [oDataField] Data field object
 * @param {string} [sEntitySetName] Entity set name
 * @param {object} [oHeaderAction] Header action object
 * returns {string}  Binding expression or function string that is generated from the Commonhelper's function generateFunction
 */
export const getPressExpressionForFooterAnnotationAction = function (
	dataField: DataFieldForAction,
	sEntitySetName: any,
	oHeaderAction: any
) {
	const sActionContexts = CommonHelper.addSingleQuotes(dataField.Action as string),
		sDataFieldEnumMember = dataField.InvocationGrouping,
		sInvocationGroup = sDataFieldEnumMember === "UI.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
	const oParams = {
		contexts: "${$view>/#fe::ObjectPage/}.getBindingContext()",
		entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
		invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
		model: "${$source>/}.getModel()",
		label: CommonHelper.addSingleQuotes(dataField.Label as string, true),
		isNavigable: oHeaderAction && oHeaderAction.isNavigable,
		defaultValuesExtensionFunction:
			oHeaderAction && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
	};
	return CommonHelper.generateFunction(".handlers.onCallAction", "${$view>/}", sActionContexts, CommonHelper.objectToString(oParams));
};

/*
 * Get Expression of execute event expression of primary action.
 *
 * @function
 * @param {object} [oDataField] Data field object
 * @param {string} [sEntitySetName] Entity set name
 * @param {object} [oHeaderAction] Header action object
 * @param {CompiledBindingToolkitExpression | string} The visibility of sematic positive action
 * @param {CompiledBindingToolkitExpression | string} The enablement of semantic positive action
 * @param {CompiledBindingToolkitExpression | string} The Edit button visibility
 * @param {CompiledBindingToolkitExpression | string} The enablement of Edit button
 * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
 */
export const getPressExpressionForPrimaryAction = function (
	oDataField: any,
	sEntitySetName: string | undefined,
	oHeaderAction: BaseAction | null,
	positiveActionVisible: CompiledBindingToolkitExpression | string,
	positiveActionEnabled: CompiledBindingToolkitExpression | string,
	editActionVisible: CompiledBindingToolkitExpression | string,
	editActionEnabled: CompiledBindingToolkitExpression | string
) {
	const sActionContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
		sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
		sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
	const oParams = {
		contexts: "${$view>/#fe::ObjectPage/}.getBindingContext()",
		entitySetName: sEntitySetName ? CommonHelper.addSingleQuotes(sEntitySetName) : "",
		invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
		model: "${$source>/}.getModel()",
		label: CommonHelper.addSingleQuotes(oDataField?.Label, true),
		isNavigable: oHeaderAction?.isNavigable,
		defaultValuesExtensionFunction: oHeaderAction?.defaultValuesExtensionFunction
			? `'${oHeaderAction.defaultValuesExtensionFunction}'`
			: undefined
	};
	const oConditions = {
		positiveActionVisible,
		positiveActionEnabled,
		editActionVisible,
		editActionEnabled
	};
	return CommonHelper.generateFunction(
		".handlers.onPrimaryAction",
		"$controller",
		"${$view>/}",
		"${$view>/getBindingContext}",
		sActionContexts,
		CommonHelper.objectToString(oParams),
		CommonHelper.objectToString(oConditions)
	);
};

/*
 * Gets the binding of the container HBox for the header facet.
 *
 * @function
 * @param {object} [oControlConfiguration] The control configuration form of the viewData model
 * @param {object} [oHeaderFacet] The object of the header facet
 * returns {*}  The binding expression from function getBindingWithGroupIdFromConfig or undefined.
 */
export const getStashableHBoxBinding = function (oControlConfiguration: any, oHeaderFacet: any) {
	if (oHeaderFacet && oHeaderFacet.Facet && oHeaderFacet.Facet.targetAnnotationType === "DataPoint") {
		return getBindingWithGroupIdFromConfig(oControlConfiguration, oHeaderFacet.Facet.targetAnnotationValue);
	}
};

/*
 * Gets the 'Press' event expression for the external and internal data point link.
 *
 * @function
 * @param {object} [oConfiguration] Control configuration from manifest
 * @param {object} [oManifestOutbound] Outbounds from manifest
 * returns {string} The runtime binding of the 'Press' event
 */
export const getPressExpressionForLink = function (oConfiguration: any, oManifestOutbound: any) {
	if (oConfiguration) {
		if (oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"]) {
			return (
				".handlers.onDataPointTitlePressed($controller, ${$source>}, " +
				JSON.stringify(oManifestOutbound) +
				"," +
				JSON.stringify(oConfiguration["targetOutbound"]["outbound"]) +
				")"
			);
		} else if (oConfiguration["targetSections"]) {
			return ".handlers.navigateToSubSection($controller, '" + JSON.stringify(oConfiguration["targetSections"]) + "')";
		} else {
			return undefined;
		}
	}
};

export const getHeaderFormHboxRenderType = function (dataField: DataModelObjectPath): string | undefined {
	if (dataField?.targetObject?.$Type === UIAnnotationTypes.DataFieldForAnnotation) {
		return undefined;
	}
	return "Bare";
};

/**
 * The default action group handler that is invoked when adding the menu button handling appropriately.
 *
 * @param oCtx The current context in which the handler is called
 * @param oAction The current action context
 * @param oDataFieldForDefaultAction The current dataField for the default action
 * @param defaultActionContextOrEntitySet The current context for the default action
 * @returns The appropriate expression string
 */
export function getDefaultActionHandler(oCtx: any, oAction: any, oDataFieldForDefaultAction: any, defaultActionContextOrEntitySet: any) {
	if (oAction.defaultAction) {
		try {
			switch (oAction.defaultAction.type) {
				case "ForAction": {
					return getPressExpressionForEdit(oDataFieldForDefaultAction, defaultActionContextOrEntitySet, oAction.defaultAction);
				}
				case "ForNavigation": {
					if (oAction.defaultAction.command) {
						return "cmd:" + oAction.defaultAction.command;
					} else {
						return oAction.defaultAction.press;
					}
				}
				default: {
					if (oAction.defaultAction.command) {
						return "cmd:" + oAction.defaultAction.command;
					}
					if (oAction.defaultAction.noWrap) {
						return oAction.defaultAction.press;
					} else {
						return CommonHelper.buildActionWrapper(oAction.defaultAction, { id: "forTheObjectPage" });
					}
				}
			}
		} catch (ioEx) {
			return "binding for the default action is not working as expected";
		}
	}
	return undefined;
}

/**
 * Check if the sub section visualization is part of preview.
 *
 * @param subSection The sub section visualization
 * @returns A Boolean value
 */
export function isVisualizationIsPartOfPreview(subSection: DataVisualizationSubSection) {
	return subSection.isPartOfPreview === true || subSection.presentation.visualizations[0].type !== "Table";
}
