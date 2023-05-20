/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/form/FormTemplating", "sap/m/library", "sap/ui/base/ManagedObject", "sap/ui/model/odata/v4/AnnotationHelper"], function (BindingHelper, BindingToolkit, ModelHelper, DataModelPathHelper, CommonHelper, FieldTemplating, FormTemplating, mLibrary, ManagedObject, ODataModelAnnotationHelper) {
  "use strict";

  var _exports = {};
  var getLabelForConnectedFields = FormTemplating.getLabelForConnectedFields;
  var formatValueRecursively = FieldTemplating.formatValueRecursively;
  var addTextArrangementToBindingExpression = FieldTemplating.addTextArrangementToBindingExpression;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isEmpty = BindingToolkit.isEmpty;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var concat = BindingToolkit.concat;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var Draft = BindingHelper.Draft;
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
  const getExpressionForTitle = function (oHeaderInfo, oViewData, fullContextPath, oDraftRoot) {
    var _oHeaderInfo$Title, _oHeaderInfo$Title2, _oHeaderInfo$Title5, _oHeaderInfo$Title6;
    const titleNoHeaderInfo = oViewData.resourceModel.getText("T_NEW_OBJECT", undefined, oViewData.entitySet);
    const titleWithHeaderInfo = oViewData.resourceModel.getText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE", undefined, oViewData.entitySet);
    const oEmptyHeaderInfoTitle = (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : oHeaderInfo.Title) === undefined || (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : oHeaderInfo.Title) === "" || (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title = oHeaderInfo.Title) === null || _oHeaderInfo$Title === void 0 ? void 0 : _oHeaderInfo$Title.Value) === "";
    const titleForActiveHeaderNoHeaderInfo = !oEmptyHeaderInfoTitle ? oViewData.resourceModel.getText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO") : "";
    let titleValueExpression,
      connectedFieldsPath,
      titleIsEmpty = constant(true),
      titleBooleanExpression;
    if ((oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title2 = oHeaderInfo.Title) === null || _oHeaderInfo$Title2 === void 0 ? void 0 : _oHeaderInfo$Title2.$Type) === "com.sap.vocabularies.UI.v1.DataField") {
      var _oHeaderInfo$Title3, _oHeaderInfo$Title4, _oHeaderInfo$Title4$V, _oHeaderInfo$Title4$V2, _oHeaderInfo$Title4$V3, _oHeaderInfo$Title4$V4, _oHeaderInfo$Title4$V5, _oHeaderInfo$Title4$V6, _oHeaderInfo$Title4$V7, _titleValueExpression, _titleValueExpression2;
      titleValueExpression = getExpressionFromAnnotation(oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title3 = oHeaderInfo.Title) === null || _oHeaderInfo$Title3 === void 0 ? void 0 : _oHeaderInfo$Title3.Value);
      if (oHeaderInfo !== null && oHeaderInfo !== void 0 && (_oHeaderInfo$Title4 = oHeaderInfo.Title) !== null && _oHeaderInfo$Title4 !== void 0 && (_oHeaderInfo$Title4$V = _oHeaderInfo$Title4.Value) !== null && _oHeaderInfo$Title4$V !== void 0 && (_oHeaderInfo$Title4$V2 = _oHeaderInfo$Title4$V.$target) !== null && _oHeaderInfo$Title4$V2 !== void 0 && (_oHeaderInfo$Title4$V3 = _oHeaderInfo$Title4$V2.annotations) !== null && _oHeaderInfo$Title4$V3 !== void 0 && (_oHeaderInfo$Title4$V4 = _oHeaderInfo$Title4$V3.Common) !== null && _oHeaderInfo$Title4$V4 !== void 0 && (_oHeaderInfo$Title4$V5 = _oHeaderInfo$Title4$V4.Text) !== null && _oHeaderInfo$Title4$V5 !== void 0 && (_oHeaderInfo$Title4$V6 = _oHeaderInfo$Title4$V5.annotations) !== null && _oHeaderInfo$Title4$V6 !== void 0 && (_oHeaderInfo$Title4$V7 = _oHeaderInfo$Title4$V6.UI) !== null && _oHeaderInfo$Title4$V7 !== void 0 && _oHeaderInfo$Title4$V7.TextArrangement) {
        // In case an explicit text arrangement was set we make use of it in the description as well
        titleValueExpression = addTextArrangementToBindingExpression(titleValueExpression, fullContextPath);
      }
      titleValueExpression = formatValueRecursively(titleValueExpression, fullContextPath);
      titleIsEmpty = ((_titleValueExpression = titleValueExpression) === null || _titleValueExpression === void 0 ? void 0 : _titleValueExpression._type) === "Constant" ? constant(!((_titleValueExpression2 = titleValueExpression) !== null && _titleValueExpression2 !== void 0 && _titleValueExpression2.value)) : isEmpty(titleValueExpression);
    } else if ((oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title5 = oHeaderInfo.Title) === null || _oHeaderInfo$Title5 === void 0 ? void 0 : _oHeaderInfo$Title5.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title6 = oHeaderInfo.Title) === null || _oHeaderInfo$Title6 === void 0 ? void 0 : _oHeaderInfo$Title6.Target.$target.$Type) === "com.sap.vocabularies.UI.v1.ConnectedFieldsType") {
      var _titleValueExpression3, _titleValueExpression4;
      connectedFieldsPath = enhanceDataModelPath(fullContextPath, "$Type/@UI.HeaderInfo/Title/Target/$AnnotationPath");
      titleValueExpression = getLabelForConnectedFields(connectedFieldsPath, false);
      titleBooleanExpression = ((_titleValueExpression3 = titleValueExpression) === null || _titleValueExpression3 === void 0 ? void 0 : _titleValueExpression3._type) === "Constant" ? constant(!((_titleValueExpression4 = titleValueExpression) !== null && _titleValueExpression4 !== void 0 && _titleValueExpression4.value)) : isEmpty(titleValueExpression);
      titleIsEmpty = titleValueExpression ? titleBooleanExpression : constant(true);
    }

    // If there is a TypeName defined, show the default title 'New + TypeName', otherwise show the custom title or the default 'New object'
    const createModeTitle = oHeaderInfo !== null && oHeaderInfo !== void 0 && oHeaderInfo.TypeName ? concat(titleWithHeaderInfo, ": ", resolveBindingString(oHeaderInfo.TypeName.toString())) : titleNoHeaderInfo;
    const activeExpression = oDraftRoot ? Entity.IsActive : true;
    return compileExpression(ifElse(and(UI.IsCreateMode, titleIsEmpty), createModeTitle,
    // Otherwise show the default expression
    ifElse(and(activeExpression, titleIsEmpty), titleForActiveHeaderNoHeaderInfo, titleValueExpression)));
  };

  /**
   * Retrieves the expression for the description of an object page.
   *
   * @param oHeaderInfo The @UI.HeaderInfo annotation content
   * @param fullContextPath The full context path used to reach that object page
   * @returns The binding expression for the object page description
   */
  _exports.getExpressionForTitle = getExpressionForTitle;
  const getExpressionForDescription = function (oHeaderInfo, fullContextPath) {
    var _oHeaderInfo$Descript, _oHeaderInfo$Descript2, _oHeaderInfo$Descript3, _oHeaderInfo$Descript4, _oHeaderInfo$Descript5, _oHeaderInfo$Descript6, _oHeaderInfo$Descript7, _oHeaderInfo$Descript8, _oHeaderInfo$Descript9;
    let pathInModel = getExpressionFromAnnotation(oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Descript = oHeaderInfo.Description) === null || _oHeaderInfo$Descript === void 0 ? void 0 : _oHeaderInfo$Descript.Value);
    if (oHeaderInfo !== null && oHeaderInfo !== void 0 && (_oHeaderInfo$Descript2 = oHeaderInfo.Description) !== null && _oHeaderInfo$Descript2 !== void 0 && (_oHeaderInfo$Descript3 = _oHeaderInfo$Descript2.Value) !== null && _oHeaderInfo$Descript3 !== void 0 && (_oHeaderInfo$Descript4 = _oHeaderInfo$Descript3.$target) !== null && _oHeaderInfo$Descript4 !== void 0 && (_oHeaderInfo$Descript5 = _oHeaderInfo$Descript4.annotations) !== null && _oHeaderInfo$Descript5 !== void 0 && (_oHeaderInfo$Descript6 = _oHeaderInfo$Descript5.Common) !== null && _oHeaderInfo$Descript6 !== void 0 && (_oHeaderInfo$Descript7 = _oHeaderInfo$Descript6.Text) !== null && _oHeaderInfo$Descript7 !== void 0 && (_oHeaderInfo$Descript8 = _oHeaderInfo$Descript7.annotations) !== null && _oHeaderInfo$Descript8 !== void 0 && (_oHeaderInfo$Descript9 = _oHeaderInfo$Descript8.UI) !== null && _oHeaderInfo$Descript9 !== void 0 && _oHeaderInfo$Descript9.TextArrangement) {
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
  _exports.getExpressionForDescription = getExpressionForDescription;
  const getExpressionForSaveButton = function (oViewData, fullContextPath) {
    var _annotations$Session;
    const saveButtonText = oViewData.resourceModel.getText("T_OP_OBJECT_PAGE_SAVE");
    const createButtonText = oViewData.resourceModel.getText("T_OP_OBJECT_PAGE_CREATE");
    let saveExpression;
    if ((_annotations$Session = fullContextPath.startingEntitySet.annotations.Session) !== null && _annotations$Session !== void 0 && _annotations$Session.StickySessionSupported) {
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
  _exports.getExpressionForSaveButton = getExpressionForSaveButton;
  const isManifestAction = function (oAction) {
    const aActions = ["Primary", "DefaultApply", "Secondary", "ForAction", "ForNavigation", "SwitchToActiveObject", "SwitchToDraftObject", "DraftActions", "Copy"];
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
  _exports.isManifestAction = isManifestAction;
  const buildEmphasizedButtonExpression = function (dataContextPath) {
    var _dataContextPath$targ, _dataContextPath$targ2, _dataContextPath$targ3;
    const identification = (_dataContextPath$targ = dataContextPath.targetEntityType) === null || _dataContextPath$targ === void 0 ? void 0 : (_dataContextPath$targ2 = _dataContextPath$targ.annotations) === null || _dataContextPath$targ2 === void 0 ? void 0 : (_dataContextPath$targ3 = _dataContextPath$targ2.UI) === null || _dataContextPath$targ3 === void 0 ? void 0 : _dataContextPath$targ3.Identification;
    const dataFieldsWithCriticality = (identification === null || identification === void 0 ? void 0 : identification.filter(dataField => dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" && dataField.Criticality)) || [];
    const dataFieldsBindingExpressions = dataFieldsWithCriticality.length ? dataFieldsWithCriticality.map(dataField => {
      var _dataField$annotation, _dataField$annotation2;
      const criticalityVisibleBindingExpression = getExpressionFromAnnotation(dataField.Criticality);
      return and(not(equal(getExpressionFromAnnotation((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : _dataField$annotation2.Hidden), true)), or(equal(criticalityVisibleBindingExpression, "UI.CriticalityType/Negative"), equal(criticalityVisibleBindingExpression, "1"), equal(criticalityVisibleBindingExpression, 1), equal(criticalityVisibleBindingExpression, "UI.CriticalityType/Positive"), equal(criticalityVisibleBindingExpression, "3"), equal(criticalityVisibleBindingExpression, 3)));
    }) : [constant(false)];

    // If there is at least one visible dataField with criticality negative or positive, the type is set as Default
    // else it is emphasized
    return compileExpression(ifElse(or(...dataFieldsBindingExpressions), ButtonType.Default, ButtonType.Emphasized));
  };
  _exports.buildEmphasizedButtonExpression = buildEmphasizedButtonExpression;
  const getElementBinding = function (sPath) {
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
  _exports.getElementBinding = getElementBinding;
  const checkDraftState = function (oAnnotations) {
    if (oAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] && oAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"]["EditAction"]) {
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
  _exports.checkDraftState = checkDraftState;
  const getSwitchToActiveVisibility = function (oAnnotations) {
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
  _exports.getSwitchToActiveVisibility = getSwitchToActiveVisibility;
  const getSwitchToDraftVisibility = function (oAnnotations) {
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
  _exports.getSwitchToDraftVisibility = getSwitchToDraftVisibility;
  const getSwitchDraftAndActiveVisibility = function (oAnnotations) {
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
  _exports.getSwitchDraftAndActiveVisibility = getSwitchDraftAndActiveVisibility;
  const _findAction = function (aConverterContextHeaderActions, sActionType) {
    let oAction;
    if (aConverterContextHeaderActions && aConverterContextHeaderActions.length) {
      oAction = aConverterContextHeaderActions.find(function (oHeaderAction) {
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
  _exports._findAction = _findAction;
  const getDeleteCommandExecutionEnabled = function (aConverterContextHeaderActions) {
    const oDeleteAction = _findAction(aConverterContextHeaderActions, "Secondary");
    return oDeleteAction ? oDeleteAction.enabled : "true";
  };

  /**
   * Function to format the 'visible' property for the Delete button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getDeleteCommandExecutionEnabled = getDeleteCommandExecutionEnabled;
  const getDeleteCommandExecutionVisible = function (aConverterContextHeaderActions) {
    const oDeleteAction = _findAction(aConverterContextHeaderActions, "Secondary");
    return oDeleteAction ? oDeleteAction.visible : "true";
  };

  /**
   * Function to format the 'visible' property for the Edit button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getDeleteCommandExecutionVisible = getDeleteCommandExecutionVisible;
  const getEditCommandExecutionVisible = function (aConverterContextHeaderActions) {
    const oEditAction = _findAction(aConverterContextHeaderActions, "Primary");
    return oEditAction ? oEditAction.visible : "false";
  };

  /**
   * Function to format the 'enabled' property for the Edit button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getEditCommandExecutionVisible = getEditCommandExecutionVisible;
  const getEditCommandExecutionEnabled = function (aConverterContextHeaderActions) {
    const oEditAction = _findAction(aConverterContextHeaderActions, "Primary");
    return oEditAction ? oEditAction.enabled : "false";
  };

  /**
   * Function to get the EditAction from the based on a draft-enabled application or a sticky application.
   *
   * @param [oEntitySet] The value from the expression.
   * @returns Returns expression binding or Boolean value based on vRawValue & oDraftNode
   */
  _exports.getEditCommandExecutionEnabled = getEditCommandExecutionEnabled;
  const getEditAction = function (oEntitySet) {
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
  _exports.getEditAction = getEditAction;
  const isReadOnlyFromStaticAnnotations = function (oAnnotations, oFieldControl) {
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
  _exports.isReadOnlyFromStaticAnnotations = isReadOnlyFromStaticAnnotations;
  const readOnlyExpressionFromDynamicAnnotations = function (oFieldControl) {
    let sIsFieldControlPathReadOnly;
    if (oFieldControl) {
      if (ManagedObject.bindingParser(oFieldControl)) {
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
  _exports.readOnlyExpressionFromDynamicAnnotations = readOnlyExpressionFromDynamicAnnotations;
  const getExpressionForMicroChartTitlePress = function (oConfiguration, oManifestOutbound, sCollectionName) {
    if (oConfiguration) {
      if (oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"] || oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"] && oConfiguration["targetSections"]) {
        return ".handlers.onDataPointTitlePressed($controller, ${$source>/},'" + JSON.stringify(oManifestOutbound) + "','" + oConfiguration["targetOutbound"]["outbound"] + "','" + sCollectionName + "' )";
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
  _exports.getExpressionForMicroChartTitlePress = getExpressionForMicroChartTitlePress;
  const getMicroChartTitleAsLink = function (oControlConfiguration) {
    if (oControlConfiguration && (oControlConfiguration["targetOutbound"] || oControlConfiguration["targetOutbound"] && oControlConfiguration["targetSections"])) {
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
  _exports.getMicroChartTitleAsLink = getMicroChartTitleAsLink;
  const getGroupIdFromConfig = function (oConfigurations, sAnnotationPath, sDefaultGroupId) {
    const oConfiguration = oConfigurations[sAnnotationPath],
      aAutoPatterns = ["Heroes", "Decoration", "Workers", "LongRunners"];
    let sGroupId = sDefaultGroupId;
    if (oConfiguration && oConfiguration.requestGroupId && aAutoPatterns.some(function (autoPattern) {
      return autoPattern === oConfiguration.requestGroupId;
    })) {
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
  _exports.getGroupIdFromConfig = getGroupIdFromConfig;
  const getBindingWithGroupIdFromConfig = function (oConfigurations, sKey) {
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
  _exports.getBindingWithGroupIdFromConfig = getBindingWithGroupIdFromConfig;
  const doesFieldGroupContainOnlyOneMultiLineDataField = function (aFormElements) {
    return aFormElements && aFormElements.length === 1 && !!aFormElements[0].isValueMultilineText;
  };

  /*
   * Get visiblity of breadcrumbs.
   *
   * @function
   * @param {Object} [oViewData] ViewData model
   * returns {*} Expression or Boolean value
   */
  _exports.doesFieldGroupContainOnlyOneMultiLineDataField = doesFieldGroupContainOnlyOneMultiLineDataField;
  const getVisibleExpressionForBreadcrumbs = function (oViewData) {
    return oViewData.showBreadCrumbs && oViewData.fclEnabled !== undefined ? "{fclhelper>/breadCrumbIsVisible}" : oViewData.showBreadCrumbs;
  };

  /**
   *
   * @param viewData Specifies the ViewData model
   * @returns Expression or Boolean value
   */
  _exports.getVisibleExpressionForBreadcrumbs = getVisibleExpressionForBreadcrumbs;
  const getShareButtonVisibility = function (viewData) {
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
  _exports.getShareButtonVisibility = getShareButtonVisibility;
  const getVisiblityOfHeaderInfo = function (oTitleAnnotations, oDescriptionAnnotations, oFieldTitleFieldControl, oFieldDescriptionFieldControl) {
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
    const bIsDescriptionReadOnly = oDescriptionAnnotations ? isReadOnlyFromStaticAnnotations(oDescriptionAnnotations, oFieldDescriptionFieldControl) : true;
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
  _exports.getVisiblityOfHeaderInfo = getVisiblityOfHeaderInfo;
  const combineTitleAndDescriptionExpression = function (oTitleFieldControl, oDescriptionFieldControl) {
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
  _exports.combineTitleAndDescriptionExpression = combineTitleAndDescriptionExpression;
  const getPressExpressionForDelete = function (entitySet, oInterface) {
    const sDeletableContexts = "${$view>/getBindingContext}",
      sTitle = "${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedHeading/getItems/1/getText}",
      sDescription = "${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedContent/0/getItems/0/getText}";
    const esContext = oInterface && oInterface.context;
    const contextPath = esContext.getPath();
    const contextPathParts = contextPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    const sEntitySetName = contextPathParts.length > 1 ? esContext.getModel().getObject(`/${contextPathParts.join("/")}@sapui.name`) : contextPathParts[0];
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
  _exports.getPressExpressionForDelete = getPressExpressionForDelete;
  const getPressExpressionForEdit = function (oDataField, sEntitySetName, oHeaderAction) {
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
      defaultValuesExtensionFunction: oHeaderAction && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
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
  _exports.getPressExpressionForEdit = getPressExpressionForEdit;
  const getPressExpressionForFooterAnnotationAction = function (dataField, sEntitySetName, oHeaderAction) {
    const sActionContexts = CommonHelper.addSingleQuotes(dataField.Action),
      sDataFieldEnumMember = dataField.InvocationGrouping,
      sInvocationGroup = sDataFieldEnumMember === "UI.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    const oParams = {
      contexts: "${$view>/#fe::ObjectPage/}.getBindingContext()",
      entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(dataField.Label, true),
      isNavigable: oHeaderAction && oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
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
  _exports.getPressExpressionForFooterAnnotationAction = getPressExpressionForFooterAnnotationAction;
  const getPressExpressionForPrimaryAction = function (oDataField, sEntitySetName, oHeaderAction, positiveActionVisible, positiveActionEnabled, editActionVisible, editActionEnabled) {
    const sActionContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
      sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
      sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    const oParams = {
      contexts: "${$view>/#fe::ObjectPage/}.getBindingContext()",
      entitySetName: sEntitySetName ? CommonHelper.addSingleQuotes(sEntitySetName) : "",
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(oDataField === null || oDataField === void 0 ? void 0 : oDataField.Label, true),
      isNavigable: oHeaderAction === null || oHeaderAction === void 0 ? void 0 : oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction !== null && oHeaderAction !== void 0 && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
    };
    const oConditions = {
      positiveActionVisible,
      positiveActionEnabled,
      editActionVisible,
      editActionEnabled
    };
    return CommonHelper.generateFunction(".handlers.onPrimaryAction", "$controller", "${$view>/}", "${$view>/getBindingContext}", sActionContexts, CommonHelper.objectToString(oParams), CommonHelper.objectToString(oConditions));
  };

  /*
   * Gets the binding of the container HBox for the header facet.
   *
   * @function
   * @param {object} [oControlConfiguration] The control configuration form of the viewData model
   * @param {object} [oHeaderFacet] The object of the header facet
   * returns {*}  The binding expression from function getBindingWithGroupIdFromConfig or undefined.
   */
  _exports.getPressExpressionForPrimaryAction = getPressExpressionForPrimaryAction;
  const getStashableHBoxBinding = function (oControlConfiguration, oHeaderFacet) {
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
  _exports.getStashableHBoxBinding = getStashableHBoxBinding;
  const getPressExpressionForLink = function (oConfiguration, oManifestOutbound) {
    if (oConfiguration) {
      if (oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"]) {
        return ".handlers.onDataPointTitlePressed($controller, ${$source>}, " + JSON.stringify(oManifestOutbound) + "," + JSON.stringify(oConfiguration["targetOutbound"]["outbound"]) + ")";
      } else if (oConfiguration["targetSections"]) {
        return ".handlers.navigateToSubSection($controller, '" + JSON.stringify(oConfiguration["targetSections"]) + "')";
      } else {
        return undefined;
      }
    }
  };
  _exports.getPressExpressionForLink = getPressExpressionForLink;
  const getHeaderFormHboxRenderType = function (dataField) {
    var _dataField$targetObje;
    if ((dataField === null || dataField === void 0 ? void 0 : (_dataField$targetObje = dataField.targetObject) === null || _dataField$targetObje === void 0 ? void 0 : _dataField$targetObje.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
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
  _exports.getHeaderFormHboxRenderType = getHeaderFormHboxRenderType;
  function getDefaultActionHandler(oCtx, oAction, oDataFieldForDefaultAction, defaultActionContextOrEntitySet) {
    if (oAction.defaultAction) {
      try {
        switch (oAction.defaultAction.type) {
          case "ForAction":
            {
              return getPressExpressionForEdit(oDataFieldForDefaultAction, defaultActionContextOrEntitySet, oAction.defaultAction);
            }
          case "ForNavigation":
            {
              if (oAction.defaultAction.command) {
                return "cmd:" + oAction.defaultAction.command;
              } else {
                return oAction.defaultAction.press;
              }
            }
          default:
            {
              if (oAction.defaultAction.command) {
                return "cmd:" + oAction.defaultAction.command;
              }
              if (oAction.defaultAction.noWrap) {
                return oAction.defaultAction.press;
              } else {
                return CommonHelper.buildActionWrapper(oAction.defaultAction, {
                  id: "forTheObjectPage"
                });
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
  _exports.getDefaultActionHandler = getDefaultActionHandler;
  function isVisualizationIsPartOfPreview(subSection) {
    return subSection.isPartOfPreview === true || subSection.presentation.visualizations[0].type !== "Table";
  }
  _exports.isVisualizationIsPartOfPreview = isVisualizationIsPartOfPreview;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdXR0b25UeXBlIiwibUxpYnJhcnkiLCJnZXRFeHByZXNzaW9uRm9yVGl0bGUiLCJvSGVhZGVySW5mbyIsIm9WaWV3RGF0YSIsImZ1bGxDb250ZXh0UGF0aCIsIm9EcmFmdFJvb3QiLCJ0aXRsZU5vSGVhZGVySW5mbyIsInJlc291cmNlTW9kZWwiLCJnZXRUZXh0IiwidW5kZWZpbmVkIiwiZW50aXR5U2V0IiwidGl0bGVXaXRoSGVhZGVySW5mbyIsIm9FbXB0eUhlYWRlckluZm9UaXRsZSIsIlRpdGxlIiwiVmFsdWUiLCJ0aXRsZUZvckFjdGl2ZUhlYWRlck5vSGVhZGVySW5mbyIsInRpdGxlVmFsdWVFeHByZXNzaW9uIiwiY29ubmVjdGVkRmllbGRzUGF0aCIsInRpdGxlSXNFbXB0eSIsImNvbnN0YW50IiwidGl0bGVCb29sZWFuRXhwcmVzc2lvbiIsIiRUeXBlIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiJHRhcmdldCIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiVGV4dCIsIlVJIiwiVGV4dEFycmFuZ2VtZW50IiwiYWRkVGV4dEFycmFuZ2VtZW50VG9CaW5kaW5nRXhwcmVzc2lvbiIsImZvcm1hdFZhbHVlUmVjdXJzaXZlbHkiLCJfdHlwZSIsInZhbHVlIiwiaXNFbXB0eSIsIlRhcmdldCIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwiZ2V0TGFiZWxGb3JDb25uZWN0ZWRGaWVsZHMiLCJjcmVhdGVNb2RlVGl0bGUiLCJUeXBlTmFtZSIsImNvbmNhdCIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwidG9TdHJpbmciLCJhY3RpdmVFeHByZXNzaW9uIiwiRW50aXR5IiwiSXNBY3RpdmUiLCJjb21waWxlRXhwcmVzc2lvbiIsImlmRWxzZSIsImFuZCIsIklzQ3JlYXRlTW9kZSIsImdldEV4cHJlc3Npb25Gb3JEZXNjcmlwdGlvbiIsInBhdGhJbk1vZGVsIiwiRGVzY3JpcHRpb24iLCJnZXRFeHByZXNzaW9uRm9yU2F2ZUJ1dHRvbiIsInNhdmVCdXR0b25UZXh0IiwiY3JlYXRlQnV0dG9uVGV4dCIsInNhdmVFeHByZXNzaW9uIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJTZXNzaW9uIiwiU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsIkRyYWZ0IiwiSXNOZXdPYmplY3QiLCJpc01hbmlmZXN0QWN0aW9uIiwib0FjdGlvbiIsImFBY3Rpb25zIiwiaW5kZXhPZiIsInR5cGUiLCJidWlsZEVtcGhhc2l6ZWRCdXR0b25FeHByZXNzaW9uIiwiZGF0YUNvbnRleHRQYXRoIiwiaWRlbnRpZmljYXRpb24iLCJ0YXJnZXRFbnRpdHlUeXBlIiwiSWRlbnRpZmljYXRpb24iLCJkYXRhRmllbGRzV2l0aENyaXRpY2FsaXR5IiwiZmlsdGVyIiwiZGF0YUZpZWxkIiwiQ3JpdGljYWxpdHkiLCJkYXRhRmllbGRzQmluZGluZ0V4cHJlc3Npb25zIiwibGVuZ3RoIiwibWFwIiwiY3JpdGljYWxpdHlWaXNpYmxlQmluZGluZ0V4cHJlc3Npb24iLCJub3QiLCJlcXVhbCIsIkhpZGRlbiIsIm9yIiwiRGVmYXVsdCIsIkVtcGhhc2l6ZWQiLCJnZXRFbGVtZW50QmluZGluZyIsInNQYXRoIiwic05hdmlnYXRpb25QYXRoIiwiT0RhdGFNb2RlbEFubm90YXRpb25IZWxwZXIiLCJnZXROYXZpZ2F0aW9uUGF0aCIsImNoZWNrRHJhZnRTdGF0ZSIsIm9Bbm5vdGF0aW9ucyIsImdldFN3aXRjaFRvQWN0aXZlVmlzaWJpbGl0eSIsImdldFN3aXRjaFRvRHJhZnRWaXNpYmlsaXR5IiwiZ2V0U3dpdGNoRHJhZnRBbmRBY3RpdmVWaXNpYmlsaXR5IiwiX2ZpbmRBY3Rpb24iLCJhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMiLCJzQWN0aW9uVHlwZSIsImZpbmQiLCJvSGVhZGVyQWN0aW9uIiwiZ2V0RGVsZXRlQ29tbWFuZEV4ZWN1dGlvbkVuYWJsZWQiLCJvRGVsZXRlQWN0aW9uIiwiZW5hYmxlZCIsImdldERlbGV0ZUNvbW1hbmRFeGVjdXRpb25WaXNpYmxlIiwidmlzaWJsZSIsImdldEVkaXRDb21tYW5kRXhlY3V0aW9uVmlzaWJsZSIsIm9FZGl0QWN0aW9uIiwiZ2V0RWRpdENvbW1hbmRFeGVjdXRpb25FbmFibGVkIiwiZ2V0RWRpdEFjdGlvbiIsIm9FbnRpdHlTZXQiLCJnZXRQYXRoIiwiYVBhdGhzIiwic3BsaXQiLCJyb290RW50aXR5U2V0UGF0aCIsInJvb3RFbnRpdHlTZXRBbm5ub3RhdGlvbnMiLCJnZXRPYmplY3QiLCJiRHJhZnRSb290IiwiaGFzT3duUHJvcGVydHkiLCJiRHJhZnROb2RlIiwiYlN0aWNreVNlc3Npb24iLCJzQWN0aW9uTmFtZSIsImlzUmVhZE9ubHlGcm9tU3RhdGljQW5ub3RhdGlvbnMiLCJvRmllbGRDb250cm9sIiwiYkNvbXB1dGVkIiwiYkltbXV0YWJsZSIsImJSZWFkT25seSIsIkJvb2wiLCJyZWFkT25seUV4cHJlc3Npb25Gcm9tRHluYW1pY0Fubm90YXRpb25zIiwic0lzRmllbGRDb250cm9sUGF0aFJlYWRPbmx5IiwiTWFuYWdlZE9iamVjdCIsImJpbmRpbmdQYXJzZXIiLCJnZXRFeHByZXNzaW9uRm9yTWljcm9DaGFydFRpdGxlUHJlc3MiLCJvQ29uZmlndXJhdGlvbiIsIm9NYW5pZmVzdE91dGJvdW5kIiwic0NvbGxlY3Rpb25OYW1lIiwiSlNPTiIsInN0cmluZ2lmeSIsImdldE1pY3JvQ2hhcnRUaXRsZUFzTGluayIsIm9Db250cm9sQ29uZmlndXJhdGlvbiIsImdldEdyb3VwSWRGcm9tQ29uZmlnIiwib0NvbmZpZ3VyYXRpb25zIiwic0Fubm90YXRpb25QYXRoIiwic0RlZmF1bHRHcm91cElkIiwiYUF1dG9QYXR0ZXJucyIsInNHcm91cElkIiwicmVxdWVzdEdyb3VwSWQiLCJzb21lIiwiYXV0b1BhdHRlcm4iLCJnZXRCaW5kaW5nV2l0aEdyb3VwSWRGcm9tQ29uZmlnIiwic0tleSIsInNCaW5kaW5nIiwiZG9lc0ZpZWxkR3JvdXBDb250YWluT25seU9uZU11bHRpTGluZURhdGFGaWVsZCIsImFGb3JtRWxlbWVudHMiLCJpc1ZhbHVlTXVsdGlsaW5lVGV4dCIsImdldFZpc2libGVFeHByZXNzaW9uRm9yQnJlYWRjcnVtYnMiLCJzaG93QnJlYWRDcnVtYnMiLCJmY2xFbmFibGVkIiwiZ2V0U2hhcmVCdXR0b25WaXNpYmlsaXR5Iiwidmlld0RhdGEiLCJzU2hhcmVCdXR0b25WaXNpYmlsaXR5RXhwIiwiaXNTaGFyZUJ1dHRvblZpc2libGVGb3JNeUluYm94IiwiZ2V0VmlzaWJsaXR5T2ZIZWFkZXJJbmZvIiwib1RpdGxlQW5ub3RhdGlvbnMiLCJvRGVzY3JpcHRpb25Bbm5vdGF0aW9ucyIsIm9GaWVsZFRpdGxlRmllbGRDb250cm9sIiwib0ZpZWxkRGVzY3JpcHRpb25GaWVsZENvbnRyb2wiLCJiSXNUaXRsZVJlYWRPbmx5IiwidGl0bGVFeHByZXNzaW9uIiwiYklzRGVzY3JpcHRpb25SZWFkT25seSIsImRlc2NyaXB0aW9uRXhwcmVzc2lvbiIsImNvbWJpbmVUaXRsZUFuZERlc2NyaXB0aW9uRXhwcmVzc2lvbiIsIm9UaXRsZUZpZWxkQ29udHJvbCIsIm9EZXNjcmlwdGlvbkZpZWxkQ29udHJvbCIsImdldFByZXNzRXhwcmVzc2lvbkZvckRlbGV0ZSIsIm9JbnRlcmZhY2UiLCJzRGVsZXRhYmxlQ29udGV4dHMiLCJzVGl0bGUiLCJzRGVzY3JpcHRpb24iLCJlc0NvbnRleHQiLCJjb250ZXh0IiwiY29udGV4dFBhdGgiLCJjb250ZXh0UGF0aFBhcnRzIiwiTW9kZWxIZWxwZXIiLCJmaWx0ZXJPdXROYXZQcm9wQmluZGluZyIsInNFbnRpdHlTZXROYW1lIiwiZ2V0TW9kZWwiLCJqb2luIiwib1BhcmFtcyIsInRpdGxlIiwiZW50aXR5U2V0TmFtZSIsIkNvbW1vbkhlbHBlciIsImFkZFNpbmdsZVF1b3RlcyIsImRlc2NyaXB0aW9uIiwiZ2VuZXJhdGVGdW5jdGlvbiIsIm9iamVjdFRvU3RyaW5nIiwicmVxdWlyZXNJQ29udGV4dCIsImdldFByZXNzRXhwcmVzc2lvbkZvckVkaXQiLCJvRGF0YUZpZWxkIiwic0VkaXRhYmxlQ29udGV4dHMiLCJBY3Rpb24iLCJzRGF0YUZpZWxkRW51bU1lbWJlciIsIkludm9jYXRpb25Hcm91cGluZyIsInNJbnZvY2F0aW9uR3JvdXAiLCJjb250ZXh0cyIsImludm9jYXRpb25Hcm91cGluZyIsIm1vZGVsIiwibGFiZWwiLCJMYWJlbCIsImlzTmF2aWdhYmxlIiwiZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uIiwiZ2V0UHJlc3NFeHByZXNzaW9uRm9yRm9vdGVyQW5ub3RhdGlvbkFjdGlvbiIsInNBY3Rpb25Db250ZXh0cyIsImdldFByZXNzRXhwcmVzc2lvbkZvclByaW1hcnlBY3Rpb24iLCJwb3NpdGl2ZUFjdGlvblZpc2libGUiLCJwb3NpdGl2ZUFjdGlvbkVuYWJsZWQiLCJlZGl0QWN0aW9uVmlzaWJsZSIsImVkaXRBY3Rpb25FbmFibGVkIiwib0NvbmRpdGlvbnMiLCJnZXRTdGFzaGFibGVIQm94QmluZGluZyIsIm9IZWFkZXJGYWNldCIsIkZhY2V0IiwidGFyZ2V0QW5ub3RhdGlvblR5cGUiLCJ0YXJnZXRBbm5vdGF0aW9uVmFsdWUiLCJnZXRQcmVzc0V4cHJlc3Npb25Gb3JMaW5rIiwiZ2V0SGVhZGVyRm9ybUhib3hSZW5kZXJUeXBlIiwidGFyZ2V0T2JqZWN0IiwiZ2V0RGVmYXVsdEFjdGlvbkhhbmRsZXIiLCJvQ3R4Iiwib0RhdGFGaWVsZEZvckRlZmF1bHRBY3Rpb24iLCJkZWZhdWx0QWN0aW9uQ29udGV4dE9yRW50aXR5U2V0IiwiZGVmYXVsdEFjdGlvbiIsImNvbW1hbmQiLCJwcmVzcyIsIm5vV3JhcCIsImJ1aWxkQWN0aW9uV3JhcHBlciIsImlkIiwiaW9FeCIsImlzVmlzdWFsaXphdGlvbklzUGFydE9mUHJldmlldyIsInN1YlNlY3Rpb24iLCJpc1BhcnRPZlByZXZpZXciLCJwcmVzZW50YXRpb24iLCJ2aXN1YWxpemF0aW9ucyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiT2JqZWN0UGFnZVRlbXBsYXRpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gRm9ybWF0dGVycyBmb3IgdGhlIE9iamVjdCBQYWdlXG5pbXBvcnQgeyBFbnRpdHlTZXQgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgRGF0YUZpZWxkRm9yQWN0aW9uLCBEYXRhRmllbGRUeXBlcywgSGVhZGVySW5mb1R5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB0eXBlIHsgQmFzZUFjdGlvbiwgQ3VzdG9tQWN0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHsgRGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvT2JqZWN0UGFnZS9TdWJTZWN0aW9uXCI7XG5pbXBvcnQgeyBEcmFmdCwgRW50aXR5LCBVSSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQmluZGluZ0hlbHBlclwiO1xuaW1wb3J0IHtcblx0YW5kLFxuXHRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sXG5cdENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Y29uY2F0LFxuXHRjb25zdGFudCxcblx0ZXF1YWwsXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRpc0VtcHR5LFxuXHRub3QsXG5cdG9yLFxuXHRyZXNvbHZlQmluZGluZ1N0cmluZ1xufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBWaWV3RGF0YSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9UZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGVuaGFuY2VEYXRhTW9kZWxQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgQ29tcHV0ZWRBbm5vdGF0aW9uSW50ZXJmYWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IHsgYWRkVGV4dEFycmFuZ2VtZW50VG9CaW5kaW5nRXhwcmVzc2lvbiwgZm9ybWF0VmFsdWVSZWN1cnNpdmVseSB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVGVtcGxhdGluZ1wiO1xuaW1wb3J0IHsgZ2V0TGFiZWxGb3JDb25uZWN0ZWRGaWVsZHMgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC9mb3JtL0Zvcm1UZW1wbGF0aW5nXCI7XG5pbXBvcnQgbUxpYnJhcnkgZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgT0RhdGFNb2RlbEFubm90YXRpb25IZWxwZXIgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Bbm5vdGF0aW9uSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuXG5jb25zdCBCdXR0b25UeXBlID0gbUxpYnJhcnkuQnV0dG9uVHlwZTtcblxuLy9gYGBtZXJtYWlkXG4vLyBncmFwaCBURFxuLy8gQVtPYmplY3QgUGFnZSBUaXRsZV0gLS0+fEdldCBEYXRhRmllbGQgVmFsdWV8IEN7RXZhbHVhdGUgQ3JlYXRlIE1vZGV9XG4vLyBDIC0tPnxJbiBDcmVhdGUgTW9kZXwgRHtJcyBEYXRhRmllbGQgVmFsdWUgZW1wdHl9XG4vLyBEIC0tPnxZZXN8IEZ7SXMgdGhlcmUgYSBUeXBlTmFtZX1cbi8vIEYgLS0+fFllc3wgR1tJcyB0aGVyZSBhbiBjdXN0b20gdGl0bGVdXG4vLyBHIC0tPnxZZXN8IEcxW1Nob3cgdGhlIGN1c3RvbSB0aXRsZSArICdUeXBlTmFtZSddXG4vLyBHIC0tPnxOb3wgRzJbRGlzcGxheSB0aGUgZGVmYXVsdCB0aXRsZSAnTmV3ICsgVHlwZU5hbWUnXVxuLy8gRiAtLT58Tm98IEhbSXMgdGhlcmUgYSBjdXN0b20gdGl0bGVdXG4vLyBIIC0tPnxZZXN8IElbU2hvdyB0aGUgY3VzdG9tIHRpdGxlXVxuLy8gSCAtLT58Tm98IEpbU2hvdyB0aGUgZGVmYXVsdCAnVW5hbW5lZCBPYmplY3QnXVxuLy8gRCAtLT58Tm98IEVcbi8vIEMgLS0+fE5vdCBpbiBjcmVhdGUgbW9kZXwgRVtTaG93IERhdGFGaWVsZCBWYWx1ZV1cbi8vIGBgYFxuLyoqXG4gKiBDb21wdXRlIHRoZSB0aXRsZSBmb3IgdGhlIG9iamVjdCBwYWdlLlxuICpcbiAqIEBwYXJhbSBvSGVhZGVySW5mbyBUaGUgQFVJLkhlYWRlckluZm8gYW5ub3RhdGlvbiBjb250ZW50XG4gKiBAcGFyYW0gb1ZpZXdEYXRhIFRoZSB2aWV3IGRhdGEgb2JqZWN0IHdlJ3JlIGN1cnJlbnRseSBvblxuICogQHBhcmFtIGZ1bGxDb250ZXh0UGF0aCBUaGUgZnVsbCBjb250ZXh0IHBhdGggdXNlZCB0byByZWFjaCB0aGF0IG9iamVjdCBwYWdlXG4gKiBAcGFyYW0gb0RyYWZ0Um9vdFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIG9iamVjdCBwYWdlIHRpdGxlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeHByZXNzaW9uRm9yVGl0bGUgPSBmdW5jdGlvbiAoXG5cdG9IZWFkZXJJbmZvOiBIZWFkZXJJbmZvVHlwZSB8IHVuZGVmaW5lZCxcblx0b1ZpZXdEYXRhOiBWaWV3RGF0YSxcblx0ZnVsbENvbnRleHRQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRvRHJhZnRSb290OiBPYmplY3QgfCB1bmRlZmluZWRcbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0Y29uc3QgdGl0bGVOb0hlYWRlckluZm8gPSBvVmlld0RhdGEucmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9ORVdfT0JKRUNUXCIsIHVuZGVmaW5lZCwgb1ZpZXdEYXRhLmVudGl0eVNldCk7XG5cblx0Y29uc3QgdGl0bGVXaXRoSGVhZGVySW5mbyA9IG9WaWV3RGF0YS5yZXNvdXJjZU1vZGVsLmdldFRleHQoXG5cdFx0XCJUX0FOTk9UQVRJT05fSEVMUEVSX0RFRkFVTFRfT0JKRUNUX1BBR0VfSEVBREVSX1RJVExFXCIsXG5cdFx0dW5kZWZpbmVkLFxuXHRcdG9WaWV3RGF0YS5lbnRpdHlTZXRcblx0KTtcblxuXHRjb25zdCBvRW1wdHlIZWFkZXJJbmZvVGl0bGUgPVxuXHRcdG9IZWFkZXJJbmZvPy5UaXRsZSA9PT0gdW5kZWZpbmVkIHx8IChvSGVhZGVySW5mbz8uVGl0bGUgYXMgYW55KSA9PT0gXCJcIiB8fCAob0hlYWRlckluZm8/LlRpdGxlIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWUgPT09IFwiXCI7XG5cblx0Y29uc3QgdGl0bGVGb3JBY3RpdmVIZWFkZXJOb0hlYWRlckluZm8gPSAhb0VtcHR5SGVhZGVySW5mb1RpdGxlXG5cdFx0PyBvVmlld0RhdGEucmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9BTk5PVEFUSU9OX0hFTFBFUl9ERUZBVUxUX09CSkVDVF9QQUdFX0hFQURFUl9USVRMRV9OT19IRUFERVJfSU5GT1wiKVxuXHRcdDogXCJcIjtcblx0bGV0IHRpdGxlVmFsdWVFeHByZXNzaW9uLFxuXHRcdGNvbm5lY3RlZEZpZWxkc1BhdGgsXG5cdFx0dGl0bGVJc0VtcHR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4gPSBjb25zdGFudCh0cnVlKSxcblx0XHR0aXRsZUJvb2xlYW5FeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4gfCBib29sZWFuO1xuXHRpZiAob0hlYWRlckluZm8/LlRpdGxlPy4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIikge1xuXHRcdHRpdGxlVmFsdWVFeHByZXNzaW9uID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKChvSGVhZGVySW5mbz8uVGl0bGUgYXMgRGF0YUZpZWxkVHlwZXMpPy5WYWx1ZSk7XG5cdFx0aWYgKChvSGVhZGVySW5mbz8uVGl0bGUgYXMgRGF0YUZpZWxkVHlwZXMpPy5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dD8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQpIHtcblx0XHRcdC8vIEluIGNhc2UgYW4gZXhwbGljaXQgdGV4dCBhcnJhbmdlbWVudCB3YXMgc2V0IHdlIG1ha2UgdXNlIG9mIGl0IGluIHRoZSBkZXNjcmlwdGlvbiBhcyB3ZWxsXG5cdFx0XHR0aXRsZVZhbHVlRXhwcmVzc2lvbiA9IGFkZFRleHRBcnJhbmdlbWVudFRvQmluZGluZ0V4cHJlc3Npb24odGl0bGVWYWx1ZUV4cHJlc3Npb24sIGZ1bGxDb250ZXh0UGF0aCk7XG5cdFx0fVxuXHRcdHRpdGxlVmFsdWVFeHByZXNzaW9uID0gZm9ybWF0VmFsdWVSZWN1cnNpdmVseSh0aXRsZVZhbHVlRXhwcmVzc2lvbiwgZnVsbENvbnRleHRQYXRoKTtcblx0XHR0aXRsZUlzRW1wdHkgPSB0aXRsZVZhbHVlRXhwcmVzc2lvbj8uX3R5cGUgPT09IFwiQ29uc3RhbnRcIiA/IGNvbnN0YW50KCF0aXRsZVZhbHVlRXhwcmVzc2lvbj8udmFsdWUpIDogaXNFbXB0eSh0aXRsZVZhbHVlRXhwcmVzc2lvbik7XG5cdH0gZWxzZSBpZiAoXG5cdFx0b0hlYWRlckluZm8/LlRpdGxlPy4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCIgJiZcblx0XHRvSGVhZGVySW5mbz8uVGl0bGU/LlRhcmdldC4kdGFyZ2V0LiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNvbm5lY3RlZEZpZWxkc1R5cGVcIlxuXHQpIHtcblx0XHRjb25uZWN0ZWRGaWVsZHNQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoZnVsbENvbnRleHRQYXRoLCBcIiRUeXBlL0BVSS5IZWFkZXJJbmZvL1RpdGxlL1RhcmdldC8kQW5ub3RhdGlvblBhdGhcIik7XG5cdFx0dGl0bGVWYWx1ZUV4cHJlc3Npb24gPSBnZXRMYWJlbEZvckNvbm5lY3RlZEZpZWxkcyhjb25uZWN0ZWRGaWVsZHNQYXRoLCBmYWxzZSkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz47XG5cdFx0dGl0bGVCb29sZWFuRXhwcmVzc2lvbiA9XG5cdFx0XHR0aXRsZVZhbHVlRXhwcmVzc2lvbj8uX3R5cGUgPT09IFwiQ29uc3RhbnRcIiA/IGNvbnN0YW50KCF0aXRsZVZhbHVlRXhwcmVzc2lvbj8udmFsdWUpIDogaXNFbXB0eSh0aXRsZVZhbHVlRXhwcmVzc2lvbik7XG5cdFx0dGl0bGVJc0VtcHR5ID0gdGl0bGVWYWx1ZUV4cHJlc3Npb24gPyB0aXRsZUJvb2xlYW5FeHByZXNzaW9uIDogY29uc3RhbnQodHJ1ZSk7XG5cdH1cblxuXHQvLyBJZiB0aGVyZSBpcyBhIFR5cGVOYW1lIGRlZmluZWQsIHNob3cgdGhlIGRlZmF1bHQgdGl0bGUgJ05ldyArIFR5cGVOYW1lJywgb3RoZXJ3aXNlIHNob3cgdGhlIGN1c3RvbSB0aXRsZSBvciB0aGUgZGVmYXVsdCAnTmV3IG9iamVjdCdcblx0Y29uc3QgY3JlYXRlTW9kZVRpdGxlID0gb0hlYWRlckluZm8/LlR5cGVOYW1lXG5cdFx0PyBjb25jYXQodGl0bGVXaXRoSGVhZGVySW5mbywgXCI6IFwiLCByZXNvbHZlQmluZGluZ1N0cmluZyhvSGVhZGVySW5mby5UeXBlTmFtZS50b1N0cmluZygpKSlcblx0XHQ6IHRpdGxlTm9IZWFkZXJJbmZvO1xuXHRjb25zdCBhY3RpdmVFeHByZXNzaW9uID0gb0RyYWZ0Um9vdCA/IEVudGl0eS5Jc0FjdGl2ZSA6IHRydWU7XG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRpZkVsc2UoXG5cdFx0XHRhbmQoVUkuSXNDcmVhdGVNb2RlLCB0aXRsZUlzRW1wdHkpLFxuXHRcdFx0Y3JlYXRlTW9kZVRpdGxlLFxuXG5cdFx0XHQvLyBPdGhlcndpc2Ugc2hvdyB0aGUgZGVmYXVsdCBleHByZXNzaW9uXG5cdFx0XHRpZkVsc2UoYW5kKGFjdGl2ZUV4cHJlc3Npb24sIHRpdGxlSXNFbXB0eSksIHRpdGxlRm9yQWN0aXZlSGVhZGVyTm9IZWFkZXJJbmZvLCB0aXRsZVZhbHVlRXhwcmVzc2lvbilcblx0XHQpXG5cdCk7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgZXhwcmVzc2lvbiBmb3IgdGhlIGRlc2NyaXB0aW9uIG9mIGFuIG9iamVjdCBwYWdlLlxuICpcbiAqIEBwYXJhbSBvSGVhZGVySW5mbyBUaGUgQFVJLkhlYWRlckluZm8gYW5ub3RhdGlvbiBjb250ZW50XG4gKiBAcGFyYW0gZnVsbENvbnRleHRQYXRoIFRoZSBmdWxsIGNvbnRleHQgcGF0aCB1c2VkIHRvIHJlYWNoIHRoYXQgb2JqZWN0IHBhZ2VcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBvYmplY3QgcGFnZSBkZXNjcmlwdGlvblxuICovXG5leHBvcnQgY29uc3QgZ2V0RXhwcmVzc2lvbkZvckRlc2NyaXB0aW9uID0gZnVuY3Rpb24gKFxuXHRvSGVhZGVySW5mbzogSGVhZGVySW5mb1R5cGUgfCB1bmRlZmluZWQsXG5cdGZ1bGxDb250ZXh0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aFxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRsZXQgcGF0aEluTW9kZWwgPSBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oKG9IZWFkZXJJbmZvPy5EZXNjcmlwdGlvbiBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlKTtcblx0aWYgKChvSGVhZGVySW5mbz8uRGVzY3JpcHRpb24gYXMgRGF0YUZpZWxkVHlwZXMpPy5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dD8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQpIHtcblx0XHQvLyBJbiBjYXNlIGFuIGV4cGxpY2l0IHRleHQgYXJyYW5nZW1lbnQgd2FzIHNldCB3ZSBtYWtlIHVzZSBvZiBpdCBpbiB0aGUgZGVzY3JpcHRpb24gYXMgd2VsbFxuXHRcdHBhdGhJbk1vZGVsID0gYWRkVGV4dEFycmFuZ2VtZW50VG9CaW5kaW5nRXhwcmVzc2lvbihwYXRoSW5Nb2RlbCwgZnVsbENvbnRleHRQYXRoKTtcblx0fVxuXG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihmb3JtYXRWYWx1ZVJlY3Vyc2l2ZWx5KHBhdGhJbk1vZGVsLCBmdWxsQ29udGV4dFBhdGgpKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBleHByZXNzaW9uIGZvciB0aGUgc2F2ZSBidXR0b24uXG4gKlxuICogQHBhcmFtIG9WaWV3RGF0YSBUaGUgY3VycmVudCB2aWV3IGRhdGFcbiAqIEBwYXJhbSBmdWxsQ29udGV4dFBhdGggVGhlIHBhdGggdXNlZCB1cCB1bnRpbCBoZXJlXG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIHRoYXQgc2hvd3MgdGhlIHJpZ2h0IHNhdmUgYnV0dG9uIHRleHRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEV4cHJlc3Npb25Gb3JTYXZlQnV0dG9uID0gZnVuY3Rpb24gKFxuXHRvVmlld0RhdGE6IFZpZXdEYXRhLFxuXHRmdWxsQ29udGV4dFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGhcbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0Y29uc3Qgc2F2ZUJ1dHRvblRleHQgPSBvVmlld0RhdGEucmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9PUF9PQkpFQ1RfUEFHRV9TQVZFXCIpO1xuXHRjb25zdCBjcmVhdGVCdXR0b25UZXh0ID0gb1ZpZXdEYXRhLnJlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfT1BfT0JKRUNUX1BBR0VfQ1JFQVRFXCIpO1xuXHRsZXQgc2F2ZUV4cHJlc3Npb247XG5cblx0aWYgKChmdWxsQ29udGV4dFBhdGguc3RhcnRpbmdFbnRpdHlTZXQgYXMgRW50aXR5U2V0KS5hbm5vdGF0aW9ucy5TZXNzaW9uPy5TdGlja3lTZXNzaW9uU3VwcG9ydGVkKSB7XG5cdFx0Ly8gSWYgd2UncmUgaW4gc3RpY2t5IG1vZGUgQU5EIHRoZSB1aSBpcyBpbiBjcmVhdGUgbW9kZSwgc2hvdyBDcmVhdGUsIGVsc2Ugc2hvdyBTYXZlXG5cdFx0c2F2ZUV4cHJlc3Npb24gPSBpZkVsc2UoVUkuSXNDcmVhdGVNb2RlLCBjcmVhdGVCdXR0b25UZXh0LCBzYXZlQnV0dG9uVGV4dCk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gSWYgd2UncmUgaW4gZHJhZnQgQU5EIHRoZSBkcmFmdCBpcyBhIG5ldyBvYmplY3QgKCFJc0FjdGl2ZUVudGl0eSAmJiAhSGFzQWN0aXZlRW50aXR5KSwgc2hvdyBjcmVhdGUsIGVsc2Ugc2hvdyBzYXZlXG5cdFx0c2F2ZUV4cHJlc3Npb24gPSBpZkVsc2UoRHJhZnQuSXNOZXdPYmplY3QsIGNyZWF0ZUJ1dHRvblRleHQsIHNhdmVCdXR0b25UZXh0KTtcblx0fVxuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oc2F2ZUV4cHJlc3Npb24pO1xufTtcblxuLyoqXG4gKiBNZXRob2QgcmV0dXJucyBXaGV0aGVyIHRoZSBhY3Rpb24gdHlwZSBpcyBtYW5pZmVzdCBvciBub3QuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBpc01hbmlmZXN0QWN0aW9uXG4gKiBAcGFyYW0gb0FjdGlvbiBUaGUgYWN0aW9uIG9iamVjdFxuICogQHJldHVybnMgYHRydWVgIGlmIGFjdGlvbiBpcyBjb21pbmcgZnJvbSBtYW5pZmVzdCwgYGZhbHNlYCBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGNvbnN0IGlzTWFuaWZlc3RBY3Rpb24gPSBmdW5jdGlvbiAob0FjdGlvbjogYW55KTogb0FjdGlvbiBpcyBDdXN0b21BY3Rpb24ge1xuXHRjb25zdCBhQWN0aW9ucyA9IFtcblx0XHRcIlByaW1hcnlcIixcblx0XHRcIkRlZmF1bHRBcHBseVwiLFxuXHRcdFwiU2Vjb25kYXJ5XCIsXG5cdFx0XCJGb3JBY3Rpb25cIixcblx0XHRcIkZvck5hdmlnYXRpb25cIixcblx0XHRcIlN3aXRjaFRvQWN0aXZlT2JqZWN0XCIsXG5cdFx0XCJTd2l0Y2hUb0RyYWZ0T2JqZWN0XCIsXG5cdFx0XCJEcmFmdEFjdGlvbnNcIixcblx0XHRcIkNvcHlcIlxuXHRdO1xuXHRyZXR1cm4gYUFjdGlvbnMuaW5kZXhPZihvQWN0aW9uLnR5cGUpIDwgMDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIGNvbXBpbGVkIGV4cHJlc3Npb24gdG8gZGV0ZXJtaW5lIEVtcGhhc2l6ZWQgIGJ1dHRvbiB0eXBlIGJhc2VkIG9uIENyaXRpY2FsaXR5IGFjcm9zcyBhbGwgYWN0aW9uc1xuICogSWYgY3JpdGljYWwgYWN0aW9uIGlzIHJlbmRlcmVkLCBpdHMgY29uc2lkZXJlZCB0byBiZSB0aGUgcHJpbWFyeSBhY3Rpb24uIEhlbmNlIHRlbXBsYXRlJ3MgZGVmYXVsdCBwcmltYXJ5IGFjdGlvbiBpcyBzZXQgYmFjayB0byBEZWZhdWx0LlxuICpcbiAqIEBmdW5jdGlvblxuICogQHN0YXRpY1xuICogQG5hbWUgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLk9iamVjdFBhZ2VUZW1wbGF0aW5nLmJ1aWxkRW1waGFzaXplZEJ1dHRvbkV4cHJlc3Npb25cbiAqIEBtZW1iZXJvZiBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuT2JqZWN0UGFnZVRlbXBsYXRpbmdcbiAqIEBwYXJhbSBkYXRhQ29udGV4dFBhdGggVGhlIGRhdGFNb2RlbE9iamVjdFBhdGggcmVsYXRlZCB0byB0aGUgY29udGV4dFxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbiB0byBkZWR1Y2UgaWYgYnV0dG9uIHR5cGUgaXMgRGVmYXVsdCBvciBFbXBoYXNpemVkXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmV4cG9ydCBjb25zdCBidWlsZEVtcGhhc2l6ZWRCdXR0b25FeHByZXNzaW9uID0gZnVuY3Rpb24gKGRhdGFDb250ZXh0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRjb25zdCBpZGVudGlmaWNhdGlvbiA9IGRhdGFDb250ZXh0UGF0aC50YXJnZXRFbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uVUk/LklkZW50aWZpY2F0aW9uO1xuXHRjb25zdCBkYXRhRmllbGRzV2l0aENyaXRpY2FsaXR5ID1cblx0XHRpZGVudGlmaWNhdGlvbj8uZmlsdGVyKChkYXRhRmllbGQpID0+IGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uICYmIGRhdGFGaWVsZC5Dcml0aWNhbGl0eSkgfHwgW107XG5cblx0Y29uc3QgZGF0YUZpZWxkc0JpbmRpbmdFeHByZXNzaW9ucyA9IGRhdGFGaWVsZHNXaXRoQ3JpdGljYWxpdHkubGVuZ3RoXG5cdFx0PyBkYXRhRmllbGRzV2l0aENyaXRpY2FsaXR5Lm1hcCgoZGF0YUZpZWxkKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGNyaXRpY2FsaXR5VmlzaWJsZUJpbmRpbmdFeHByZXNzaW9uID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFGaWVsZC5Dcml0aWNhbGl0eSk7XG5cdFx0XHRcdHJldHVybiBhbmQoXG5cdFx0XHRcdFx0bm90KGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4pLCB0cnVlKSksXG5cdFx0XHRcdFx0b3IoXG5cdFx0XHRcdFx0XHRlcXVhbChjcml0aWNhbGl0eVZpc2libGVCaW5kaW5nRXhwcmVzc2lvbiwgXCJVSS5Dcml0aWNhbGl0eVR5cGUvTmVnYXRpdmVcIiksXG5cdFx0XHRcdFx0XHRlcXVhbChjcml0aWNhbGl0eVZpc2libGVCaW5kaW5nRXhwcmVzc2lvbiwgXCIxXCIpLFxuXHRcdFx0XHRcdFx0ZXF1YWwoY3JpdGljYWxpdHlWaXNpYmxlQmluZGluZ0V4cHJlc3Npb24gYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPG51bWJlcj4sIDEpLFxuXHRcdFx0XHRcdFx0ZXF1YWwoY3JpdGljYWxpdHlWaXNpYmxlQmluZGluZ0V4cHJlc3Npb24sIFwiVUkuQ3JpdGljYWxpdHlUeXBlL1Bvc2l0aXZlXCIpLFxuXHRcdFx0XHRcdFx0ZXF1YWwoY3JpdGljYWxpdHlWaXNpYmxlQmluZGluZ0V4cHJlc3Npb24sIFwiM1wiKSxcblx0XHRcdFx0XHRcdGVxdWFsKGNyaXRpY2FsaXR5VmlzaWJsZUJpbmRpbmdFeHByZXNzaW9uIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxudW1iZXI+LCAzKVxuXHRcdFx0XHRcdClcblx0XHRcdFx0KTtcblx0XHQgIH0pXG5cdFx0OiAoW2NvbnN0YW50KGZhbHNlKV0gYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W10pO1xuXG5cdC8vIElmIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSB2aXNpYmxlIGRhdGFGaWVsZCB3aXRoIGNyaXRpY2FsaXR5IG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCB0aGUgdHlwZSBpcyBzZXQgYXMgRGVmYXVsdFxuXHQvLyBlbHNlIGl0IGlzIGVtcGhhc2l6ZWRcblx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGlmRWxzZShvciguLi5kYXRhRmllbGRzQmluZGluZ0V4cHJlc3Npb25zKSwgQnV0dG9uVHlwZS5EZWZhdWx0LCBCdXR0b25UeXBlLkVtcGhhc2l6ZWQpKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRFbGVtZW50QmluZGluZyA9IGZ1bmN0aW9uIChzUGF0aDogYW55KSB7XG5cdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IE9EYXRhTW9kZWxBbm5vdGF0aW9uSGVscGVyLmdldE5hdmlnYXRpb25QYXRoKHNQYXRoKTtcblx0aWYgKHNOYXZpZ2F0aW9uUGF0aCkge1xuXHRcdHJldHVybiBcIntwYXRoOidcIiArIHNOYXZpZ2F0aW9uUGF0aCArIFwiJ31cIjtcblx0fSBlbHNlIHtcblx0XHQvL25vIG5hdmlnYXRpb24gcHJvcGVydHkgbmVlZHMgZW1wdHkgb2JqZWN0XG5cdFx0cmV0dXJuIFwie3BhdGg6ICcnfVwiO1xuXHR9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIGRyYWZ0IHBhdHRlcm4gaXMgc3VwcG9ydGVkLlxuICpcbiAqIEBwYXJhbSBvQW5ub3RhdGlvbnMgQW5ub3RhdGlvbnMgb2YgdGhlIGN1cnJlbnQgZW50aXR5IHNldC5cbiAqIEByZXR1cm5zIFJldHVybnMgdGhlIEJvb2xlYW4gdmFsdWUgYmFzZWQgb24gZHJhZnQgc3RhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IGNoZWNrRHJhZnRTdGF0ZSA9IGZ1bmN0aW9uIChvQW5ub3RhdGlvbnM6IGFueSkge1xuXHRpZiAoXG5cdFx0b0Fubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3RcIl0gJiZcblx0XHRvQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdFwiXVtcIkVkaXRBY3Rpb25cIl1cblx0KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGdldCB0aGUgdmlzaWJpbGl0eSBmb3IgdGhlIFN3aXRjaFRvQWN0aXZlIGJ1dHRvbiBpbiB0aGUgb2JqZWN0IHBhZ2Ugb3Igc3Vib2JqZWN0IHBhZ2UuXG4gKlxuICogQHBhcmFtIG9Bbm5vdGF0aW9ucyBBbm5vdGF0aW9ucyBvZiB0aGUgY3VycmVudCBlbnRpdHkgc2V0LlxuICogQHJldHVybnMgUmV0dXJucyBleHByZXNzaW9uIGJpbmRpbmcgb3IgQm9vbGVhbiB2YWx1ZSBiYXNlZCBvbiB0aGUgZHJhZnQgc3RhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFN3aXRjaFRvQWN0aXZlVmlzaWJpbGl0eSA9IGZ1bmN0aW9uIChvQW5ub3RhdGlvbnM6IGFueSk6IGFueSB7XG5cdGlmIChjaGVja0RyYWZ0U3RhdGUob0Fubm90YXRpb25zKSkge1xuXHRcdHJldHVybiBcIns9ICgle0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0RyYWZ0SXNDcmVhdGVkQnlNZX0pID8gKCAke3VpPi9pc0VkaXRhYmxlfSAmJiAhJHt1aT5jcmVhdGVNb2RlfSAmJiAle0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0RyYWZ0SXNDcmVhdGVkQnlNZX0gKSA6IGZhbHNlIH1cIjtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZ2V0IHRoZSB2aXNpYmlsaXR5IGZvciB0aGUgU3dpdGNoVG9EcmFmdCBidXR0b24gaW4gdGhlIG9iamVjdCBwYWdlIG9yIHN1Ym9iamVjdCBwYWdlLlxuICpcbiAqIEBwYXJhbSBvQW5ub3RhdGlvbnMgQW5ub3RhdGlvbnMgb2YgdGhlIGN1cnJlbnQgZW50aXR5IHNldC5cbiAqIEByZXR1cm5zIFJldHVybnMgZXhwcmVzc2lvbiBiaW5kaW5nIG9yIEJvb2xlYW4gdmFsdWUgYmFzZWQgb24gdGhlIGRyYWZ0IHN0YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTd2l0Y2hUb0RyYWZ0VmlzaWJpbGl0eSA9IGZ1bmN0aW9uIChvQW5ub3RhdGlvbnM6IGFueSk6IGFueSB7XG5cdGlmIChjaGVja0RyYWZ0U3RhdGUob0Fubm90YXRpb25zKSkge1xuXHRcdHJldHVybiBcIns9ICgle0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0RyYWZ0SXNDcmVhdGVkQnlNZX0pID8gKCAhKCR7dWk+L2lzRWRpdGFibGV9KSAmJiAhJHt1aT5jcmVhdGVNb2RlfSAmJiAke0hhc0RyYWZ0RW50aXR5fSAmJiAle0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0RyYWZ0SXNDcmVhdGVkQnlNZX0gKSA6IGZhbHNlIH1cIjtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZ2V0IHRoZSB2aXNpYmlsaXR5IGZvciB0aGUgU3dpdGNoRHJhZnRBbmRBY3RpdmUgYnV0dG9uIGluIHRoZSBvYmplY3QgcGFnZSBvciBzdWJvYmplY3QgcGFnZS5cbiAqXG4gKiBAcGFyYW0gb0Fubm90YXRpb25zIEFubm90YXRpb25zIG9mIHRoZSBjdXJyZW50IGVudGl0eSBzZXQuXG4gKiBAcmV0dXJucyBSZXR1cm5zIGV4cHJlc3Npb24gYmluZGluZyBvciBCb29sZWFuIHZhbHVlIGJhc2VkIG9uIHRoZSBkcmFmdCBzdGF0ZVxuICovXG5leHBvcnQgY29uc3QgZ2V0U3dpdGNoRHJhZnRBbmRBY3RpdmVWaXNpYmlsaXR5ID0gZnVuY3Rpb24gKG9Bbm5vdGF0aW9uczogYW55KTogYW55IHtcblx0aWYgKGNoZWNrRHJhZnRTdGF0ZShvQW5ub3RhdGlvbnMpKSB7XG5cdFx0cmV0dXJuIFwiez0gKCV7RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvRHJhZnRJc0NyZWF0ZWRCeU1lfSkgPyAoICEke3VpPmNyZWF0ZU1vZGV9ICYmICV7RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvRHJhZnRJc0NyZWF0ZWRCeU1lfSApIDogZmFsc2UgfVwiO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBmaW5kIGFuIGFjdGlvbiBmcm9tIHRoZSBhcnJheSBvZiBoZWFkZXIgYWN0aW9ucyBpbiB0aGUgY29udmVydGVyIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucyBBcnJheSBvZiAnaGVhZGVyJyBhY3Rpb25zIG9uIHRoZSBvYmplY3QgcGFnZS5cbiAqIEBwYXJhbSBzQWN0aW9uVHlwZSBUaGUgYWN0aW9uIHR5cGVcbiAqIEByZXR1cm5zIFRoZSBhY3Rpb24gd2l0aCB0aGUgbWF0Y2hpbmcgYWN0aW9uIHR5cGVcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBfZmluZEFjdGlvbiA9IGZ1bmN0aW9uIChhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnM6IGFueVtdLCBzQWN0aW9uVHlwZTogc3RyaW5nKSB7XG5cdGxldCBvQWN0aW9uO1xuXHRpZiAoYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zICYmIGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucy5sZW5ndGgpIHtcblx0XHRvQWN0aW9uID0gYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zLmZpbmQoZnVuY3Rpb24gKG9IZWFkZXJBY3Rpb246IGFueSkge1xuXHRcdFx0cmV0dXJuIG9IZWFkZXJBY3Rpb24udHlwZSA9PT0gc0FjdGlvblR5cGU7XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIG9BY3Rpb247XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGZvcm1hdCB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IGZvciB0aGUgRGVsZXRlIGJ1dHRvbiBvbiB0aGUgb2JqZWN0IHBhZ2Ugb3Igc3Vib2JqZWN0IHBhZ2UgaW4gY2FzZSBvZiBhIENvbW1hbmQgRXhlY3V0aW9uLlxuICpcbiAqIEBwYXJhbSBhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMgQXJyYXkgb2YgaGVhZGVyIGFjdGlvbnMgb24gdGhlIG9iamVjdCBwYWdlXG4gKiBAcmV0dXJucyBSZXR1cm5zIGV4cHJlc3Npb24gYmluZGluZyBvciBCb29sZWFuIHZhbHVlIGZyb20gdGhlIGNvbnZlcnRlciBvdXRwdXRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldERlbGV0ZUNvbW1hbmRFeGVjdXRpb25FbmFibGVkID0gZnVuY3Rpb24gKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9uczogYW55W10pIHtcblx0Y29uc3Qgb0RlbGV0ZUFjdGlvbiA9IF9maW5kQWN0aW9uKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucywgXCJTZWNvbmRhcnlcIik7XG5cdHJldHVybiBvRGVsZXRlQWN0aW9uID8gb0RlbGV0ZUFjdGlvbi5lbmFibGVkIDogXCJ0cnVlXCI7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGZvcm1hdCB0aGUgJ3Zpc2libGUnIHByb3BlcnR5IGZvciB0aGUgRGVsZXRlIGJ1dHRvbiBvbiB0aGUgb2JqZWN0IHBhZ2Ugb3Igc3Vib2JqZWN0IHBhZ2UgaW4gY2FzZSBvZiBhIENvbW1hbmQgRXhlY3V0aW9uLlxuICpcbiAqIEBwYXJhbSBhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMgQXJyYXkgb2YgaGVhZGVyIGFjdGlvbnMgb24gdGhlIG9iamVjdCBwYWdlXG4gKiBAcmV0dXJucyBSZXR1cm5zIGV4cHJlc3Npb24gYmluZGluZyBvciBCb29sZWFuIHZhbHVlIGZyb20gdGhlIGNvbnZlcnRlciBvdXRwdXRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldERlbGV0ZUNvbW1hbmRFeGVjdXRpb25WaXNpYmxlID0gZnVuY3Rpb24gKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9uczogYW55W10pIHtcblx0Y29uc3Qgb0RlbGV0ZUFjdGlvbiA9IF9maW5kQWN0aW9uKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucywgXCJTZWNvbmRhcnlcIik7XG5cdHJldHVybiBvRGVsZXRlQWN0aW9uID8gb0RlbGV0ZUFjdGlvbi52aXNpYmxlIDogXCJ0cnVlXCI7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGZvcm1hdCB0aGUgJ3Zpc2libGUnIHByb3BlcnR5IGZvciB0aGUgRWRpdCBidXR0b24gb24gdGhlIG9iamVjdCBwYWdlIG9yIHN1Ym9iamVjdCBwYWdlIGluIGNhc2Ugb2YgYSBDb21tYW5kIEV4ZWN1dGlvbi5cbiAqXG4gKiBAcGFyYW0gYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zIEFycmF5IG9mIGhlYWRlciBhY3Rpb25zIG9uIHRoZSBvYmplY3QgcGFnZVxuICogQHJldHVybnMgUmV0dXJucyBleHByZXNzaW9uIGJpbmRpbmcgb3IgQm9vbGVhbiB2YWx1ZSBmcm9tIHRoZSBjb252ZXJ0ZXIgb3V0cHV0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFZGl0Q29tbWFuZEV4ZWN1dGlvblZpc2libGUgPSBmdW5jdGlvbiAoYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zOiBhbnlbXSkge1xuXHRjb25zdCBvRWRpdEFjdGlvbiA9IF9maW5kQWN0aW9uKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucywgXCJQcmltYXJ5XCIpO1xuXHRyZXR1cm4gb0VkaXRBY3Rpb24gPyBvRWRpdEFjdGlvbi52aXNpYmxlIDogXCJmYWxzZVwiO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBmb3JtYXQgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBmb3IgdGhlIEVkaXQgYnV0dG9uIG9uIHRoZSBvYmplY3QgcGFnZSBvciBzdWJvYmplY3QgcGFnZSBpbiBjYXNlIG9mIGEgQ29tbWFuZCBFeGVjdXRpb24uXG4gKlxuICogQHBhcmFtIGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucyBBcnJheSBvZiBoZWFkZXIgYWN0aW9ucyBvbiB0aGUgb2JqZWN0IHBhZ2VcbiAqIEByZXR1cm5zIFJldHVybnMgZXhwcmVzc2lvbiBiaW5kaW5nIG9yIEJvb2xlYW4gdmFsdWUgZnJvbSB0aGUgY29udmVydGVyIG91dHB1dFxuICovXG5leHBvcnQgY29uc3QgZ2V0RWRpdENvbW1hbmRFeGVjdXRpb25FbmFibGVkID0gZnVuY3Rpb24gKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9uczogYW55W10pIHtcblx0Y29uc3Qgb0VkaXRBY3Rpb24gPSBfZmluZEFjdGlvbihhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMsIFwiUHJpbWFyeVwiKTtcblx0cmV0dXJuIG9FZGl0QWN0aW9uID8gb0VkaXRBY3Rpb24uZW5hYmxlZCA6IFwiZmFsc2VcIjtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZ2V0IHRoZSBFZGl0QWN0aW9uIGZyb20gdGhlIGJhc2VkIG9uIGEgZHJhZnQtZW5hYmxlZCBhcHBsaWNhdGlvbiBvciBhIHN0aWNreSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAcGFyYW0gW29FbnRpdHlTZXRdIFRoZSB2YWx1ZSBmcm9tIHRoZSBleHByZXNzaW9uLlxuICogQHJldHVybnMgUmV0dXJucyBleHByZXNzaW9uIGJpbmRpbmcgb3IgQm9vbGVhbiB2YWx1ZSBiYXNlZCBvbiB2UmF3VmFsdWUgJiBvRHJhZnROb2RlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFZGl0QWN0aW9uID0gZnVuY3Rpb24gKG9FbnRpdHlTZXQ6IENvbnRleHQpIHtcblx0Y29uc3Qgc1BhdGggPSBvRW50aXR5U2V0LmdldFBhdGgoKTtcblx0Y29uc3QgYVBhdGhzID0gc1BhdGguc3BsaXQoXCIvXCIpO1xuXHRjb25zdCByb290RW50aXR5U2V0UGF0aCA9IFwiL1wiICsgYVBhdGhzWzFdO1xuXHQvLyBnZXQgdGhlIGVkaXQgYWN0aW9uIGZyb20gcm9vdCBlbnRpdHkgc2V0c1xuXHRjb25zdCByb290RW50aXR5U2V0QW5ubm90YXRpb25zID0gb0VudGl0eVNldC5nZXRPYmplY3Qocm9vdEVudGl0eVNldFBhdGggKyBcIkBcIik7XG5cdGNvbnN0IGJEcmFmdFJvb3QgPSByb290RW50aXR5U2V0QW5ubm90YXRpb25zLmhhc093blByb3BlcnR5KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3RcIik7XG5cdGNvbnN0IGJEcmFmdE5vZGUgPSByb290RW50aXR5U2V0QW5ubm90YXRpb25zLmhhc093blByb3BlcnR5KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVcIik7XG5cdGNvbnN0IGJTdGlja3lTZXNzaW9uID0gcm9vdEVudGl0eVNldEFubm5vdGF0aW9ucy5oYXNPd25Qcm9wZXJ0eShcIkBjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxLlN0aWNreVNlc3Npb25TdXBwb3J0ZWRcIik7XG5cdGxldCBzQWN0aW9uTmFtZTtcblx0aWYgKGJEcmFmdFJvb3QpIHtcblx0XHRzQWN0aW9uTmFtZSA9IG9FbnRpdHlTZXQuZ2V0T2JqZWN0KGAke3Jvb3RFbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290L0VkaXRBY3Rpb25gKTtcblx0fSBlbHNlIGlmIChiRHJhZnROb2RlKSB7XG5cdFx0c0FjdGlvbk5hbWUgPSBvRW50aXR5U2V0LmdldE9iamVjdChgJHtyb290RW50aXR5U2V0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZS9FZGl0QWN0aW9uYCk7XG5cdH0gZWxzZSBpZiAoYlN0aWNreVNlc3Npb24pIHtcblx0XHRzQWN0aW9uTmFtZSA9IG9FbnRpdHlTZXQuZ2V0T2JqZWN0KGAke3Jvb3RFbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxLlN0aWNreVNlc3Npb25TdXBwb3J0ZWQvRWRpdEFjdGlvbmApO1xuXHR9XG5cdHJldHVybiAhc0FjdGlvbk5hbWUgPyBzQWN0aW9uTmFtZSA6IGAke3Jvb3RFbnRpdHlTZXRQYXRofS8ke3NBY3Rpb25OYW1lfWA7XG59O1xuXG5leHBvcnQgY29uc3QgaXNSZWFkT25seUZyb21TdGF0aWNBbm5vdGF0aW9ucyA9IGZ1bmN0aW9uIChvQW5ub3RhdGlvbnM6IGFueSwgb0ZpZWxkQ29udHJvbDogYW55KSB7XG5cdGxldCBiQ29tcHV0ZWQsIGJJbW11dGFibGUsIGJSZWFkT25seTtcblx0aWYgKG9Bbm5vdGF0aW9ucyAmJiBvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWRcIl0pIHtcblx0XHRiQ29tcHV0ZWQgPSBvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWRcIl0uQm9vbCA/IG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5Db21wdXRlZFwiXS5Cb29sID09IFwidHJ1ZVwiIDogdHJ1ZTtcblx0fVxuXHRpZiAob0Fubm90YXRpb25zICYmIG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5JbW11dGFibGVcIl0pIHtcblx0XHRiSW1tdXRhYmxlID0gb0Fubm90YXRpb25zW1wiQE9yZy5PRGF0YS5Db3JlLlYxLkltbXV0YWJsZVwiXS5Cb29sID8gb0Fubm90YXRpb25zW1wiQE9yZy5PRGF0YS5Db3JlLlYxLkltbXV0YWJsZVwiXS5Cb29sID09IFwidHJ1ZVwiIDogdHJ1ZTtcblx0fVxuXHRiUmVhZE9ubHkgPSBiQ29tcHV0ZWQgfHwgYkltbXV0YWJsZTtcblxuXHRpZiAob0ZpZWxkQ29udHJvbCkge1xuXHRcdGJSZWFkT25seSA9IGJSZWFkT25seSB8fCBvRmllbGRDb250cm9sID09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbFR5cGUvUmVhZE9ubHlcIjtcblx0fVxuXHRpZiAoYlJlYWRPbmx5KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG5leHBvcnQgY29uc3QgcmVhZE9ubHlFeHByZXNzaW9uRnJvbUR5bmFtaWNBbm5vdGF0aW9ucyA9IGZ1bmN0aW9uIChvRmllbGRDb250cm9sOiBhbnkpIHtcblx0bGV0IHNJc0ZpZWxkQ29udHJvbFBhdGhSZWFkT25seTtcblx0aWYgKG9GaWVsZENvbnRyb2wpIHtcblx0XHRpZiAoKE1hbmFnZWRPYmplY3QgYXMgYW55KS5iaW5kaW5nUGFyc2VyKG9GaWVsZENvbnRyb2wpKSB7XG5cdFx0XHRzSXNGaWVsZENvbnRyb2xQYXRoUmVhZE9ubHkgPSBcIiVcIiArIG9GaWVsZENvbnRyb2wgKyBcIiA9PT0gMSBcIjtcblx0XHR9XG5cdH1cblx0aWYgKHNJc0ZpZWxkQ29udHJvbFBhdGhSZWFkT25seSkge1xuXHRcdHJldHVybiBcIns9IFwiICsgc0lzRmllbGRDb250cm9sUGF0aFJlYWRPbmx5ICsgXCI/IGZhbHNlIDogdHJ1ZSB9XCI7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcblxuLypcbiAqIEZ1bmN0aW9uIHRvIGdldCB0aGUgZXhwcmVzc2lvbiBmb3IgY2hhcnQgVGl0bGUgUHJlc3NcbiAqXG4gKiBAZnVuY3Rpb253XG4gKiBAcGFyYW0ge29Db25maWd1cmF0aW9ufSBbb0NvbmZpZ3VyYXRpb25zXSBjb250cm9sIGNvbmZpZ3VyYXRpb24gZnJvbSBtYW5pZmVzdFxuICogIEBwYXJhbSB7b01hbmlmZXN0fSBbb01hbmlmZXN0XSBPdXRib3VuZHMgZnJvbSBtYW5pZmVzdFxuICogcmV0dXJucyB7U3RyaW5nfSBbc0NvbGxlY3Rpb25OYW1lXSBDb2xsZWN0aW9uIE5hbWUgb2YgdGhlIE1pY3JvIENoYXJ0XG4gKlxuICogcmV0dXJucyB7U3RyaW5nfSBbRXhwcmVzc2lvbl0gSGFuZGxlciBFeHByZXNzaW9uIGZvciB0aGUgdGl0bGUgcHJlc3NcbiAqXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeHByZXNzaW9uRm9yTWljcm9DaGFydFRpdGxlUHJlc3MgPSBmdW5jdGlvbiAob0NvbmZpZ3VyYXRpb246IGFueSwgb01hbmlmZXN0T3V0Ym91bmQ6IGFueSwgc0NvbGxlY3Rpb25OYW1lOiBhbnkpIHtcblx0aWYgKG9Db25maWd1cmF0aW9uKSB7XG5cdFx0aWYgKFxuXHRcdFx0KG9Db25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl0gJiYgb0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXVtcIm91dGJvdW5kXCJdKSB8fFxuXHRcdFx0KG9Db25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl0gJiYgb0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXVtcIm91dGJvdW5kXCJdICYmIG9Db25maWd1cmF0aW9uW1widGFyZ2V0U2VjdGlvbnNcIl0pXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcIi5oYW5kbGVycy5vbkRhdGFQb2ludFRpdGxlUHJlc3NlZCgkY29udHJvbGxlciwgJHskc291cmNlPi99LCdcIiArXG5cdFx0XHRcdEpTT04uc3RyaW5naWZ5KG9NYW5pZmVzdE91dGJvdW5kKSArXG5cdFx0XHRcdFwiJywnXCIgK1xuXHRcdFx0XHRvQ29uZmlndXJhdGlvbltcInRhcmdldE91dGJvdW5kXCJdW1wib3V0Ym91bmRcIl0gK1xuXHRcdFx0XHRcIicsJ1wiICtcblx0XHRcdFx0c0NvbGxlY3Rpb25OYW1lICtcblx0XHRcdFx0XCInIClcIlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKG9Db25maWd1cmF0aW9uW1widGFyZ2V0U2VjdGlvbnNcIl0pIHtcblx0XHRcdHJldHVybiBcIi5oYW5kbGVycy5uYXZpZ2F0ZVRvU3ViU2VjdGlvbigkY29udHJvbGxlciwgJ1wiICsgSlNPTi5zdHJpbmdpZnkob0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRTZWN0aW9uc1wiXSkgKyBcIicpXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG59O1xuXG4vKlxuICogRnVuY3Rpb24gdG8gcmVuZGVyIENoYXJ0IFRpdGxlIGFzIExpbmtcbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7b0NvbnRyb2xDb25maWd1cmF0aW9ufSBbb0NvbmZpZ3VyYXRpb25zXSBjb250cm9sIGNvbmZpZ3VyYXRpb24gZnJvbSBtYW5pZmVzdFxuICogcmV0dXJucyB7U3RyaW5nfSBbc0tleV0gRm9yIHRoZSBUYXJnZXRPdXRib3VuZCBhbmQgVGFyZ2V0U2VjdGlvblxuICpcbiAqL1xuZXhwb3J0IGNvbnN0IGdldE1pY3JvQ2hhcnRUaXRsZUFzTGluayA9IGZ1bmN0aW9uIChvQ29udHJvbENvbmZpZ3VyYXRpb246IGFueSkge1xuXHRpZiAoXG5cdFx0b0NvbnRyb2xDb25maWd1cmF0aW9uICYmXG5cdFx0KG9Db250cm9sQ29uZmlndXJhdGlvbltcInRhcmdldE91dGJvdW5kXCJdIHx8IChvQ29udHJvbENvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXSAmJiBvQ29udHJvbENvbmZpZ3VyYXRpb25bXCJ0YXJnZXRTZWN0aW9uc1wiXSkpXG5cdCkge1xuXHRcdHJldHVybiBcIkV4dGVybmFsXCI7XG5cdH0gZWxzZSBpZiAob0NvbnRyb2xDb25maWd1cmF0aW9uICYmIG9Db250cm9sQ29uZmlndXJhdGlvbltcInRhcmdldFNlY3Rpb25zXCJdKSB7XG5cdFx0cmV0dXJuIFwiSW5QYWdlXCI7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFwiTm9uZVwiO1xuXHR9XG59O1xuXG4vKiBHZXQgZ3JvdXBJZCBmcm9tIGNvbnRyb2wgY29uZmlndXJhdGlvblxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtPYmplY3R9IFtvQ29uZmlndXJhdGlvbnNdIGNvbnRyb2wgY29uZmlndXJhdGlvbiBmcm9tIG1hbmlmZXN0XG4gKiBAcGFyYW0ge1N0cmluZ30gW3NBbm5vdGF0aW9uUGF0aF0gQW5ub3RhdGlvbiBQYXRoIGZvciB0aGUgY29uZmlndXJhdGlvblxuICogQGRlc2NyaXB0aW9uIFVzZWQgdG8gZ2V0IHRoZSBncm91cElkIGZvciBEYXRhUG9pbnRzIGFuZCBNaWNyb0NoYXJ0cyBpbiB0aGUgSGVhZGVyLlxuICpcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEdyb3VwSWRGcm9tQ29uZmlnID0gZnVuY3Rpb24gKG9Db25maWd1cmF0aW9uczogYW55LCBzQW5ub3RhdGlvblBhdGg6IGFueSwgc0RlZmF1bHRHcm91cElkPzogYW55KSB7XG5cdGNvbnN0IG9Db25maWd1cmF0aW9uID0gb0NvbmZpZ3VyYXRpb25zW3NBbm5vdGF0aW9uUGF0aF0sXG5cdFx0YUF1dG9QYXR0ZXJucyA9IFtcIkhlcm9lc1wiLCBcIkRlY29yYXRpb25cIiwgXCJXb3JrZXJzXCIsIFwiTG9uZ1J1bm5lcnNcIl07XG5cdGxldCBzR3JvdXBJZCA9IHNEZWZhdWx0R3JvdXBJZDtcblx0aWYgKFxuXHRcdG9Db25maWd1cmF0aW9uICYmXG5cdFx0b0NvbmZpZ3VyYXRpb24ucmVxdWVzdEdyb3VwSWQgJiZcblx0XHRhQXV0b1BhdHRlcm5zLnNvbWUoZnVuY3Rpb24gKGF1dG9QYXR0ZXJuOiBzdHJpbmcpIHtcblx0XHRcdHJldHVybiBhdXRvUGF0dGVybiA9PT0gb0NvbmZpZ3VyYXRpb24ucmVxdWVzdEdyb3VwSWQ7XG5cdFx0fSlcblx0KSB7XG5cdFx0c0dyb3VwSWQgPSBcIiRhdXRvLlwiICsgb0NvbmZpZ3VyYXRpb24ucmVxdWVzdEdyb3VwSWQ7XG5cdH1cblx0cmV0dXJuIHNHcm91cElkO1xufTtcblxuLypcbiAqIEdldCBDb250ZXh0IEJpbmRpbmcgd2l0aCBncm91cElkIGZyb20gY29udHJvbCBjb25maWd1cmF0aW9uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gW29Db25maWd1cmF0aW9uc10gY29udHJvbCBjb25maWd1cmF0aW9uIGZyb20gbWFuaWZlc3RcbiAqIEBwYXJhbSB7U3RyaW5nfSBbc0tleV0gQW5ub3RhdGlvbiBQYXRoIGZvciBvZiB0aGUgY29uZmlndXJhdGlvblxuICogQGRlc2NyaXB0aW9uIFVzZWQgdG8gZ2V0IHRoZSBiaW5kaW5nIGZvciBEYXRhUG9pbnRzIGluIHRoZSBIZWFkZXIuXG4gKlxuICovXG5leHBvcnQgY29uc3QgZ2V0QmluZGluZ1dpdGhHcm91cElkRnJvbUNvbmZpZyA9IGZ1bmN0aW9uIChvQ29uZmlndXJhdGlvbnM6IGFueSwgc0tleTogYW55KSB7XG5cdGNvbnN0IHNHcm91cElkID0gZ2V0R3JvdXBJZEZyb21Db25maWcob0NvbmZpZ3VyYXRpb25zLCBzS2V5KTtcblx0bGV0IHNCaW5kaW5nO1xuXHRpZiAoc0dyb3VwSWQpIHtcblx0XHRzQmluZGluZyA9IFwieyBwYXRoIDogJycsIHBhcmFtZXRlcnMgOiB7ICQkZ3JvdXBJZCA6ICdcIiArIHNHcm91cElkICsgXCInIH0gfVwiO1xuXHR9XG5cdHJldHVybiBzQmluZGluZztcbn07XG5cbi8qKlxuICogTWV0aG9kIHRvIGNoZWNrIHdoZXRoZXIgYSBGaWVsZEdyb3VwIGNvbnNpc3RzIG9mIG9ubHkgMSBEYXRhRmllbGQgd2l0aCBNdWx0aUxpbmUgVGV4dCBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSBhRm9ybUVsZW1lbnRzIEEgY29sbGVjdGlvbiBvZiBmb3JtIGVsZW1lbnRzIHVzZWQgaW4gdGhlIGN1cnJlbnQgZmllbGQgZ3JvdXBcbiAqIEByZXR1cm5zIFJldHVybnMgdHJ1ZSBpZiBvbmx5IDEgZGF0YSBmaWVsZCB3aXRoIE11bHRpbGluZSBUZXh0IGFubm90YXRpb24gZXhpc3RzLlxuICovXG5leHBvcnQgY29uc3QgZG9lc0ZpZWxkR3JvdXBDb250YWluT25seU9uZU11bHRpTGluZURhdGFGaWVsZCA9IGZ1bmN0aW9uIChhRm9ybUVsZW1lbnRzOiBhbnlbXSkge1xuXHRyZXR1cm4gYUZvcm1FbGVtZW50cyAmJiBhRm9ybUVsZW1lbnRzLmxlbmd0aCA9PT0gMSAmJiAhIWFGb3JtRWxlbWVudHNbMF0uaXNWYWx1ZU11bHRpbGluZVRleHQ7XG59O1xuXG4vKlxuICogR2V0IHZpc2libGl0eSBvZiBicmVhZGNydW1icy5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb1ZpZXdEYXRhXSBWaWV3RGF0YSBtb2RlbFxuICogcmV0dXJucyB7Kn0gRXhwcmVzc2lvbiBvciBCb29sZWFuIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRWaXNpYmxlRXhwcmVzc2lvbkZvckJyZWFkY3J1bWJzID0gZnVuY3Rpb24gKG9WaWV3RGF0YTogYW55KSB7XG5cdHJldHVybiBvVmlld0RhdGEuc2hvd0JyZWFkQ3J1bWJzICYmIG9WaWV3RGF0YS5mY2xFbmFibGVkICE9PSB1bmRlZmluZWQgPyBcIntmY2xoZWxwZXI+L2JyZWFkQ3J1bWJJc1Zpc2libGV9XCIgOiBvVmlld0RhdGEuc2hvd0JyZWFkQ3J1bWJzO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHZpZXdEYXRhIFNwZWNpZmllcyB0aGUgVmlld0RhdGEgbW9kZWxcbiAqIEByZXR1cm5zIEV4cHJlc3Npb24gb3IgQm9vbGVhbiB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZ2V0U2hhcmVCdXR0b25WaXNpYmlsaXR5ID0gZnVuY3Rpb24gKHZpZXdEYXRhOiBhbnkpIHtcblx0bGV0IHNTaGFyZUJ1dHRvblZpc2liaWxpdHlFeHAgPSBcIiEke3VpPmNyZWF0ZU1vZGV9XCI7XG5cdGlmICh2aWV3RGF0YS5mY2xFbmFibGVkKSB7XG5cdFx0c1NoYXJlQnV0dG9uVmlzaWJpbGl0eUV4cCA9IFwiJHtmY2xoZWxwZXI+L3Nob3dTaGFyZUljb259ICYmIFwiICsgc1NoYXJlQnV0dG9uVmlzaWJpbGl0eUV4cDtcblx0fVxuXHRpZiAodmlld0RhdGEuaXNTaGFyZUJ1dHRvblZpc2libGVGb3JNeUluYm94ID09PSBmYWxzZSkge1xuXHRcdHJldHVybiBcImZhbHNlXCI7XG5cdH1cblx0cmV0dXJuIFwiez0gXCIgKyBzU2hhcmVCdXR0b25WaXNpYmlsaXR5RXhwICsgXCIgfVwiO1xufTtcblxuLypcbiAqIEdldHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGhlYWRlciBpbmZvIGluIGVkaXQgbW9kZVxuICpcbiAqIElmIGVpdGhlciB0aGUgdGl0bGUgb3IgZGVzY3JpcHRpb24gZmllbGQgZnJvbSB0aGUgaGVhZGVyIGFubm90YXRpb25zIGFyZSBlZGl0YWJsZSwgdGhlbiB0aGVcbiAqIGVkaXRhYmxlIGhlYWRlciBpbmZvIGlzIHZpc2libGUuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gW29Bbm5vdGF0aW9uc10gQW5ub3RhdGlvbnMgb2JqZWN0IGZvciBnaXZlbiBlbnRpdHkgc2V0XG4gKiBAcGFyYW0ge29iamVjdH0gW29GaWVsZENvbnRyb2xdIGZpZWxkIGNvbnRyb2xcbiAqIHJldHVybnMgeyp9ICBiaW5kaW5nIGV4cHJlc3Npb24gb3IgYm9vbGVhbiB2YWx1ZSByZXNvbHZlZCBmb3JtIGZ1bmNpdG9ucyBpc1JlYWRPbmx5RnJvbVN0YXRpY0Fubm90YXRpb25zIGFuZCBpc1JlYWRPbmx5RnJvbUR5bmFtaWNBbm5vdGF0aW9uc1xuICovXG5leHBvcnQgY29uc3QgZ2V0VmlzaWJsaXR5T2ZIZWFkZXJJbmZvID0gZnVuY3Rpb24gKFxuXHRvVGl0bGVBbm5vdGF0aW9uczogYW55LFxuXHRvRGVzY3JpcHRpb25Bbm5vdGF0aW9uczogYW55LFxuXHRvRmllbGRUaXRsZUZpZWxkQ29udHJvbDogYW55LFxuXHRvRmllbGREZXNjcmlwdGlvbkZpZWxkQ29udHJvbDogYW55XG4pIHtcblx0Ly8gQ2hlY2sgQW5ub3RhdGlvbnMgZm9yIFRpdGxlIEZpZWxkXG5cdC8vIFNldCB0byB0cnVlIGFuZCBkb24ndCB0YWtlIGludG8gYWNjb3VudCwgaWYgdGhlcmUgYXJlIG5vIGFubm90YXRpb25zLCBpLmUuIG5vIHRpdGxlIGV4aXN0c1xuXHRjb25zdCBiSXNUaXRsZVJlYWRPbmx5ID0gb1RpdGxlQW5ub3RhdGlvbnMgPyBpc1JlYWRPbmx5RnJvbVN0YXRpY0Fubm90YXRpb25zKG9UaXRsZUFubm90YXRpb25zLCBvRmllbGRUaXRsZUZpZWxkQ29udHJvbCkgOiB0cnVlO1xuXHRjb25zdCB0aXRsZUV4cHJlc3Npb24gPSByZWFkT25seUV4cHJlc3Npb25Gcm9tRHluYW1pY0Fubm90YXRpb25zKG9GaWVsZFRpdGxlRmllbGRDb250cm9sKTtcblx0Ly8gVGhlcmUgaXMgbm8gZXhwcmVzc2lvbiBhbmQgdGhlIHRpdGxlIGlzIG5vdCByZWFkeSBvbmx5LCB0aGlzIGlzIHN1ZmZpY2llbnQgZm9yIGFuIGVkaXRhYmxlIGhlYWRlclxuXHRpZiAoIWJJc1RpdGxlUmVhZE9ubHkgJiYgIXRpdGxlRXhwcmVzc2lvbikge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Ly8gQ2hlY2sgQW5ub3RhdGlvbnMgZm9yIERlc2NyaXB0aW9uIEZpZWxkXG5cdC8vIFNldCB0byB0cnVlIGFuZCBkb24ndCB0YWtlIGludG8gYWNjb3VudCwgaWYgdGhlcmUgYXJlIG5vIGFubm90YXRpb25zLCBpLmUuIG5vIGRlc2NyaXB0aW9uIGV4aXN0c1xuXHRjb25zdCBiSXNEZXNjcmlwdGlvblJlYWRPbmx5ID0gb0Rlc2NyaXB0aW9uQW5ub3RhdGlvbnNcblx0XHQ/IGlzUmVhZE9ubHlGcm9tU3RhdGljQW5ub3RhdGlvbnMob0Rlc2NyaXB0aW9uQW5ub3RhdGlvbnMsIG9GaWVsZERlc2NyaXB0aW9uRmllbGRDb250cm9sKVxuXHRcdDogdHJ1ZTtcblx0Y29uc3QgZGVzY3JpcHRpb25FeHByZXNzaW9uID0gcmVhZE9ubHlFeHByZXNzaW9uRnJvbUR5bmFtaWNBbm5vdGF0aW9ucyhvRmllbGREZXNjcmlwdGlvbkZpZWxkQ29udHJvbCk7XG5cdC8vIFRoZXJlIGlzIG5vIGV4cHJlc3Npb24gYW5kIHRoZSBkZXNjcmlwdGlvbiBpcyBub3QgcmVhZHkgb25seSwgdGhpcyBpcyBzdWZmaWNpZW50IGZvciBhbiBlZGl0YWJsZSBoZWFkZXJcblx0aWYgKCFiSXNEZXNjcmlwdGlvblJlYWRPbmx5ICYmICFkZXNjcmlwdGlvbkV4cHJlc3Npb24pIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8vIEJvdGggdGl0bGUgYW5kIGRlc2NyaXB0aW9uIGFyZSBub3QgZWRpdGFibGUgYW5kIHRoZXJlIGFyZSBubyBkeW5hbWljIGFubm90YXRpb25zXG5cdGlmIChiSXNUaXRsZVJlYWRPbmx5ICYmIGJJc0Rlc2NyaXB0aW9uUmVhZE9ubHkgJiYgIXRpdGxlRXhwcmVzc2lvbiAmJiAhZGVzY3JpcHRpb25FeHByZXNzaW9uKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gTm93IGNvbWJpbmUgZXhwcmVzc2lvbnNcblx0aWYgKHRpdGxlRXhwcmVzc2lvbiAmJiAhZGVzY3JpcHRpb25FeHByZXNzaW9uKSB7XG5cdFx0cmV0dXJuIHRpdGxlRXhwcmVzc2lvbjtcblx0fSBlbHNlIGlmICghdGl0bGVFeHByZXNzaW9uICYmIGRlc2NyaXB0aW9uRXhwcmVzc2lvbikge1xuXHRcdHJldHVybiBkZXNjcmlwdGlvbkV4cHJlc3Npb247XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGNvbWJpbmVUaXRsZUFuZERlc2NyaXB0aW9uRXhwcmVzc2lvbihvRmllbGRUaXRsZUZpZWxkQ29udHJvbCwgb0ZpZWxkRGVzY3JpcHRpb25GaWVsZENvbnRyb2wpO1xuXHR9XG59O1xuXG5leHBvcnQgY29uc3QgY29tYmluZVRpdGxlQW5kRGVzY3JpcHRpb25FeHByZXNzaW9uID0gZnVuY3Rpb24gKG9UaXRsZUZpZWxkQ29udHJvbDogYW55LCBvRGVzY3JpcHRpb25GaWVsZENvbnRyb2w6IGFueSkge1xuXHQvLyBJZiBib3RoIGhlYWRlciBhbmQgdGl0bGUgZmllbGQgYXJlIGJhc2VkIG9uIGR5bm1haWMgZmllbGQgY29udHJvbCwgdGhlIGVkaXRhYmxlIGhlYWRlclxuXHQvLyBpcyB2aXNpYmxlIGlmIGF0IGxlYXN0IG9uZSBvZiB0aGVzZSBpcyBub3QgcmVhZHkgb25seVxuXHRyZXR1cm4gXCJ7PSAlXCIgKyBvVGl0bGVGaWVsZENvbnRyb2wgKyBcIiA9PT0gMSA/ICggJVwiICsgb0Rlc2NyaXB0aW9uRmllbGRDb250cm9sICsgXCIgPT09IDEgPyBmYWxzZSA6IHRydWUgKSA6IHRydWUgfVwiO1xufTtcblxuLypcbiAqIEdldCBFeHByZXNzaW9uIG9mIHByZXNzIGV2ZW50IG9mIGRlbGV0ZSBidXR0b24uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gW3NFbnRpdHlTZXROYW1lXSBFbnRpdHkgc2V0IG5hbWVcbiAqIHJldHVybnMge3N0cmluZ30gIGJpbmRpbmcgZXhwcmVzc2lvbiAvIGZ1bmN0aW9uIHN0cmluZyBnZW5lcmF0ZWQgZnJvbSBjb21tYW5oZWxwZXIncyBmdW5jdGlvbiBnZW5lcmF0ZUZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQcmVzc0V4cHJlc3Npb25Gb3JEZWxldGUgPSBmdW5jdGlvbiAoZW50aXR5U2V0OiBPYmplY3QsIG9JbnRlcmZhY2U6IENvbXB1dGVkQW5ub3RhdGlvbkludGVyZmFjZSk6IHN0cmluZyB7XG5cdGNvbnN0IHNEZWxldGFibGVDb250ZXh0cyA9IFwiJHskdmlldz4vZ2V0QmluZGluZ0NvbnRleHR9XCIsXG5cdFx0c1RpdGxlID0gXCIkeyR2aWV3Pi8jZmU6Ok9iamVjdFBhZ2UvZ2V0SGVhZGVyVGl0bGUvZ2V0RXhwYW5kZWRIZWFkaW5nL2dldEl0ZW1zLzEvZ2V0VGV4dH1cIixcblx0XHRzRGVzY3JpcHRpb24gPSBcIiR7JHZpZXc+LyNmZTo6T2JqZWN0UGFnZS9nZXRIZWFkZXJUaXRsZS9nZXRFeHBhbmRlZENvbnRlbnQvMC9nZXRJdGVtcy8wL2dldFRleHR9XCI7XG5cdGNvbnN0IGVzQ29udGV4dCA9IG9JbnRlcmZhY2UgJiYgb0ludGVyZmFjZS5jb250ZXh0O1xuXHRjb25zdCBjb250ZXh0UGF0aCA9IGVzQ29udGV4dC5nZXRQYXRoKCk7XG5cdGNvbnN0IGNvbnRleHRQYXRoUGFydHMgPSBjb250ZXh0UGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKE1vZGVsSGVscGVyLmZpbHRlck91dE5hdlByb3BCaW5kaW5nKTtcblx0Y29uc3Qgc0VudGl0eVNldE5hbWUgPVxuXHRcdGNvbnRleHRQYXRoUGFydHMubGVuZ3RoID4gMSA/IGVzQ29udGV4dC5nZXRNb2RlbCgpLmdldE9iamVjdChgLyR7Y29udGV4dFBhdGhQYXJ0cy5qb2luKFwiL1wiKX1Ac2FwdWkubmFtZWApIDogY29udGV4dFBhdGhQYXJ0c1swXTtcblx0Y29uc3Qgb1BhcmFtcyA9IHtcblx0XHR0aXRsZTogc1RpdGxlLFxuXHRcdGVudGl0eVNldE5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0VudGl0eVNldE5hbWUpLFxuXHRcdGRlc2NyaXB0aW9uOiBzRGVzY3JpcHRpb25cblx0fTtcblx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFwiLmVkaXRGbG93LmRlbGV0ZURvY3VtZW50XCIsIHNEZWxldGFibGVDb250ZXh0cywgQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9QYXJhbXMpKTtcbn07XG5cbmdldFByZXNzRXhwcmVzc2lvbkZvckRlbGV0ZS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcblxuLypcbiAqIEdldCBFeHByZXNzaW9uIG9mIHByZXNzIGV2ZW50IG9mIEVkaXQgYnV0dG9uLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IFtvRGF0YUZpZWxkXSBEYXRhIGZpZWxkIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IFtzRW50aXR5U2V0TmFtZV0gRW50aXR5IHNldCBuYW1lXG4gKiBAcGFyYW0ge29iamVjdH0gW29IZWFkZXJBY3Rpb25dIEhlYWRlciBhY3Rpb24gb2JqZWN0XG4gKiByZXR1cm5zIHtzdHJpbmd9ICBiaW5kaW5nIGV4cHJlc3Npb24gLyBmdW5jdGlvbiBzdHJpbmcgZ2VuZXJhdGVkIGZyb20gY29tbWFuaGVscGVyJ3MgZnVuY3Rpb24gZ2VuZXJhdGVGdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZ2V0UHJlc3NFeHByZXNzaW9uRm9yRWRpdCA9IGZ1bmN0aW9uIChvRGF0YUZpZWxkOiBhbnksIHNFbnRpdHlTZXROYW1lOiBhbnksIG9IZWFkZXJBY3Rpb246IGFueSkge1xuXHRjb25zdCBzRWRpdGFibGVDb250ZXh0cyA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob0RhdGFGaWVsZCAmJiBvRGF0YUZpZWxkLkFjdGlvbiksXG5cdFx0c0RhdGFGaWVsZEVudW1NZW1iZXIgPSBvRGF0YUZpZWxkICYmIG9EYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nICYmIG9EYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nW1wiJEVudW1NZW1iZXJcIl0sXG5cdFx0c0ludm9jYXRpb25Hcm91cCA9IHNEYXRhRmllbGRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLk9wZXJhdGlvbkdyb3VwaW5nVHlwZS9DaGFuZ2VTZXRcIiA/IFwiQ2hhbmdlU2V0XCIgOiBcIklzb2xhdGVkXCI7XG5cdGNvbnN0IG9QYXJhbXMgPSB7XG5cdFx0Y29udGV4dHM6IFwiJHskdmlldz4vZ2V0QmluZGluZ0NvbnRleHR9XCIsXG5cdFx0ZW50aXR5U2V0TmFtZTogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzRW50aXR5U2V0TmFtZSksXG5cdFx0aW52b2NhdGlvbkdyb3VwaW5nOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNJbnZvY2F0aW9uR3JvdXApLFxuXHRcdG1vZGVsOiBcIiR7JHNvdXJjZT4vfS5nZXRNb2RlbCgpXCIsXG5cdFx0bGFiZWw6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob0RhdGFGaWVsZCAmJiBvRGF0YUZpZWxkLkxhYmVsLCB0cnVlKSxcblx0XHRpc05hdmlnYWJsZTogb0hlYWRlckFjdGlvbiAmJiBvSGVhZGVyQWN0aW9uLmlzTmF2aWdhYmxlLFxuXHRcdGRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbjpcblx0XHRcdG9IZWFkZXJBY3Rpb24gJiYgb0hlYWRlckFjdGlvbi5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24gPyBgJyR7b0hlYWRlckFjdGlvbi5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb259J2AgOiB1bmRlZmluZWRcblx0fTtcblx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFwiLmhhbmRsZXJzLm9uQ2FsbEFjdGlvblwiLCBcIiR7JHZpZXc+L31cIiwgc0VkaXRhYmxlQ29udGV4dHMsIENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvUGFyYW1zKSk7XG59O1xuXG4vKlxuICogTWV0aG9kIHRvIGdldCB0aGUgZXhwcmVzc2lvbiBmb3IgdGhlICdwcmVzcycgZXZlbnQgZm9yIGZvb3RlciBhbm5vdGF0aW9uIGFjdGlvbnNcbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb0RhdGFGaWVsZF0gRGF0YSBmaWVsZCBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc0VudGl0eVNldE5hbWVdIEVudGl0eSBzZXQgbmFtZVxuICogQHBhcmFtIHtvYmplY3R9IFtvSGVhZGVyQWN0aW9uXSBIZWFkZXIgYWN0aW9uIG9iamVjdFxuICogcmV0dXJucyB7c3RyaW5nfSAgQmluZGluZyBleHByZXNzaW9uIG9yIGZ1bmN0aW9uIHN0cmluZyB0aGF0IGlzIGdlbmVyYXRlZCBmcm9tIHRoZSBDb21tb25oZWxwZXIncyBmdW5jdGlvbiBnZW5lcmF0ZUZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQcmVzc0V4cHJlc3Npb25Gb3JGb290ZXJBbm5vdGF0aW9uQWN0aW9uID0gZnVuY3Rpb24gKFxuXHRkYXRhRmllbGQ6IERhdGFGaWVsZEZvckFjdGlvbixcblx0c0VudGl0eVNldE5hbWU6IGFueSxcblx0b0hlYWRlckFjdGlvbjogYW55XG4pIHtcblx0Y29uc3Qgc0FjdGlvbkNvbnRleHRzID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhkYXRhRmllbGQuQWN0aW9uIGFzIHN0cmluZyksXG5cdFx0c0RhdGFGaWVsZEVudW1NZW1iZXIgPSBkYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nLFxuXHRcdHNJbnZvY2F0aW9uR3JvdXAgPSBzRGF0YUZpZWxkRW51bU1lbWJlciA9PT0gXCJVSS5PcGVyYXRpb25Hcm91cGluZ1R5cGUvQ2hhbmdlU2V0XCIgPyBcIkNoYW5nZVNldFwiIDogXCJJc29sYXRlZFwiO1xuXHRjb25zdCBvUGFyYW1zID0ge1xuXHRcdGNvbnRleHRzOiBcIiR7JHZpZXc+LyNmZTo6T2JqZWN0UGFnZS99LmdldEJpbmRpbmdDb250ZXh0KClcIixcblx0XHRlbnRpdHlTZXROYW1lOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNFbnRpdHlTZXROYW1lKSxcblx0XHRpbnZvY2F0aW9uR3JvdXBpbmc6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0ludm9jYXRpb25Hcm91cCksXG5cdFx0bW9kZWw6IFwiJHskc291cmNlPi99LmdldE1vZGVsKClcIixcblx0XHRsYWJlbDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhkYXRhRmllbGQuTGFiZWwgYXMgc3RyaW5nLCB0cnVlKSxcblx0XHRpc05hdmlnYWJsZTogb0hlYWRlckFjdGlvbiAmJiBvSGVhZGVyQWN0aW9uLmlzTmF2aWdhYmxlLFxuXHRcdGRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbjpcblx0XHRcdG9IZWFkZXJBY3Rpb24gJiYgb0hlYWRlckFjdGlvbi5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24gPyBgJyR7b0hlYWRlckFjdGlvbi5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb259J2AgOiB1bmRlZmluZWRcblx0fTtcblx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFwiLmhhbmRsZXJzLm9uQ2FsbEFjdGlvblwiLCBcIiR7JHZpZXc+L31cIiwgc0FjdGlvbkNvbnRleHRzLCBDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcob1BhcmFtcykpO1xufTtcblxuLypcbiAqIEdldCBFeHByZXNzaW9uIG9mIGV4ZWN1dGUgZXZlbnQgZXhwcmVzc2lvbiBvZiBwcmltYXJ5IGFjdGlvbi5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb0RhdGFGaWVsZF0gRGF0YSBmaWVsZCBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc0VudGl0eVNldE5hbWVdIEVudGl0eSBzZXQgbmFtZVxuICogQHBhcmFtIHtvYmplY3R9IFtvSGVhZGVyQWN0aW9uXSBIZWFkZXIgYWN0aW9uIG9iamVjdFxuICogQHBhcmFtIHtDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHN0cmluZ30gVGhlIHZpc2liaWxpdHkgb2Ygc2VtYXRpYyBwb3NpdGl2ZSBhY3Rpb25cbiAqIEBwYXJhbSB7Q29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCBzdHJpbmd9IFRoZSBlbmFibGVtZW50IG9mIHNlbWFudGljIHBvc2l0aXZlIGFjdGlvblxuICogQHBhcmFtIHtDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHN0cmluZ30gVGhlIEVkaXQgYnV0dG9uIHZpc2liaWxpdHlcbiAqIEBwYXJhbSB7Q29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCBzdHJpbmd9IFRoZSBlbmFibGVtZW50IG9mIEVkaXQgYnV0dG9uXG4gKiByZXR1cm5zIHtzdHJpbmd9ICBiaW5kaW5nIGV4cHJlc3Npb24gLyBmdW5jdGlvbiBzdHJpbmcgZ2VuZXJhdGVkIGZyb20gY29tbWFuaGVscGVyJ3MgZnVuY3Rpb24gZ2VuZXJhdGVGdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZ2V0UHJlc3NFeHByZXNzaW9uRm9yUHJpbWFyeUFjdGlvbiA9IGZ1bmN0aW9uIChcblx0b0RhdGFGaWVsZDogYW55LFxuXHRzRW50aXR5U2V0TmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRvSGVhZGVyQWN0aW9uOiBCYXNlQWN0aW9uIHwgbnVsbCxcblx0cG9zaXRpdmVBY3Rpb25WaXNpYmxlOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHN0cmluZyxcblx0cG9zaXRpdmVBY3Rpb25FbmFibGVkOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHN0cmluZyxcblx0ZWRpdEFjdGlvblZpc2libGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgc3RyaW5nLFxuXHRlZGl0QWN0aW9uRW5hYmxlZDogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCBzdHJpbmdcbikge1xuXHRjb25zdCBzQWN0aW9uQ29udGV4dHMgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQgJiYgb0RhdGFGaWVsZC5BY3Rpb24pLFxuXHRcdHNEYXRhRmllbGRFbnVtTWVtYmVyID0gb0RhdGFGaWVsZCAmJiBvRGF0YUZpZWxkLkludm9jYXRpb25Hcm91cGluZyAmJiBvRGF0YUZpZWxkLkludm9jYXRpb25Hcm91cGluZ1tcIiRFbnVtTWVtYmVyXCJdLFxuXHRcdHNJbnZvY2F0aW9uR3JvdXAgPSBzRGF0YUZpZWxkRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5PcGVyYXRpb25Hcm91cGluZ1R5cGUvQ2hhbmdlU2V0XCIgPyBcIkNoYW5nZVNldFwiIDogXCJJc29sYXRlZFwiO1xuXHRjb25zdCBvUGFyYW1zID0ge1xuXHRcdGNvbnRleHRzOiBcIiR7JHZpZXc+LyNmZTo6T2JqZWN0UGFnZS99LmdldEJpbmRpbmdDb250ZXh0KClcIixcblx0XHRlbnRpdHlTZXROYW1lOiBzRW50aXR5U2V0TmFtZSA/IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0VudGl0eVNldE5hbWUpIDogXCJcIixcblx0XHRpbnZvY2F0aW9uR3JvdXBpbmc6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0ludm9jYXRpb25Hcm91cCksXG5cdFx0bW9kZWw6IFwiJHskc291cmNlPi99LmdldE1vZGVsKClcIixcblx0XHRsYWJlbDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvRGF0YUZpZWxkPy5MYWJlbCwgdHJ1ZSksXG5cdFx0aXNOYXZpZ2FibGU6IG9IZWFkZXJBY3Rpb24/LmlzTmF2aWdhYmxlLFxuXHRcdGRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbjogb0hlYWRlckFjdGlvbj8uZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uXG5cdFx0XHQ/IGAnJHtvSGVhZGVyQWN0aW9uLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbn0nYFxuXHRcdFx0OiB1bmRlZmluZWRcblx0fTtcblx0Y29uc3Qgb0NvbmRpdGlvbnMgPSB7XG5cdFx0cG9zaXRpdmVBY3Rpb25WaXNpYmxlLFxuXHRcdHBvc2l0aXZlQWN0aW9uRW5hYmxlZCxcblx0XHRlZGl0QWN0aW9uVmlzaWJsZSxcblx0XHRlZGl0QWN0aW9uRW5hYmxlZFxuXHR9O1xuXHRyZXR1cm4gQ29tbW9uSGVscGVyLmdlbmVyYXRlRnVuY3Rpb24oXG5cdFx0XCIuaGFuZGxlcnMub25QcmltYXJ5QWN0aW9uXCIsXG5cdFx0XCIkY29udHJvbGxlclwiLFxuXHRcdFwiJHskdmlldz4vfVwiLFxuXHRcdFwiJHskdmlldz4vZ2V0QmluZGluZ0NvbnRleHR9XCIsXG5cdFx0c0FjdGlvbkNvbnRleHRzLFxuXHRcdENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvUGFyYW1zKSxcblx0XHRDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcob0NvbmRpdGlvbnMpXG5cdCk7XG59O1xuXG4vKlxuICogR2V0cyB0aGUgYmluZGluZyBvZiB0aGUgY29udGFpbmVyIEhCb3ggZm9yIHRoZSBoZWFkZXIgZmFjZXQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gW29Db250cm9sQ29uZmlndXJhdGlvbl0gVGhlIGNvbnRyb2wgY29uZmlndXJhdGlvbiBmb3JtIG9mIHRoZSB2aWV3RGF0YSBtb2RlbFxuICogQHBhcmFtIHtvYmplY3R9IFtvSGVhZGVyRmFjZXRdIFRoZSBvYmplY3Qgb2YgdGhlIGhlYWRlciBmYWNldFxuICogcmV0dXJucyB7Kn0gIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZnJvbSBmdW5jdGlvbiBnZXRCaW5kaW5nV2l0aEdyb3VwSWRGcm9tQ29uZmlnIG9yIHVuZGVmaW5lZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFN0YXNoYWJsZUhCb3hCaW5kaW5nID0gZnVuY3Rpb24gKG9Db250cm9sQ29uZmlndXJhdGlvbjogYW55LCBvSGVhZGVyRmFjZXQ6IGFueSkge1xuXHRpZiAob0hlYWRlckZhY2V0ICYmIG9IZWFkZXJGYWNldC5GYWNldCAmJiBvSGVhZGVyRmFjZXQuRmFjZXQudGFyZ2V0QW5ub3RhdGlvblR5cGUgPT09IFwiRGF0YVBvaW50XCIpIHtcblx0XHRyZXR1cm4gZ2V0QmluZGluZ1dpdGhHcm91cElkRnJvbUNvbmZpZyhvQ29udHJvbENvbmZpZ3VyYXRpb24sIG9IZWFkZXJGYWNldC5GYWNldC50YXJnZXRBbm5vdGF0aW9uVmFsdWUpO1xuXHR9XG59O1xuXG4vKlxuICogR2V0cyB0aGUgJ1ByZXNzJyBldmVudCBleHByZXNzaW9uIGZvciB0aGUgZXh0ZXJuYWwgYW5kIGludGVybmFsIGRhdGEgcG9pbnQgbGluay5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb0NvbmZpZ3VyYXRpb25dIENvbnRyb2wgY29uZmlndXJhdGlvbiBmcm9tIG1hbmlmZXN0XG4gKiBAcGFyYW0ge29iamVjdH0gW29NYW5pZmVzdE91dGJvdW5kXSBPdXRib3VuZHMgZnJvbSBtYW5pZmVzdFxuICogcmV0dXJucyB7c3RyaW5nfSBUaGUgcnVudGltZSBiaW5kaW5nIG9mIHRoZSAnUHJlc3MnIGV2ZW50XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQcmVzc0V4cHJlc3Npb25Gb3JMaW5rID0gZnVuY3Rpb24gKG9Db25maWd1cmF0aW9uOiBhbnksIG9NYW5pZmVzdE91dGJvdW5kOiBhbnkpIHtcblx0aWYgKG9Db25maWd1cmF0aW9uKSB7XG5cdFx0aWYgKG9Db25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl0gJiYgb0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXVtcIm91dGJvdW5kXCJdKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcIi5oYW5kbGVycy5vbkRhdGFQb2ludFRpdGxlUHJlc3NlZCgkY29udHJvbGxlciwgJHskc291cmNlPn0sIFwiICtcblx0XHRcdFx0SlNPTi5zdHJpbmdpZnkob01hbmlmZXN0T3V0Ym91bmQpICtcblx0XHRcdFx0XCIsXCIgK1xuXHRcdFx0XHRKU09OLnN0cmluZ2lmeShvQ29uZmlndXJhdGlvbltcInRhcmdldE91dGJvdW5kXCJdW1wib3V0Ym91bmRcIl0pICtcblx0XHRcdFx0XCIpXCJcblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChvQ29uZmlndXJhdGlvbltcInRhcmdldFNlY3Rpb25zXCJdKSB7XG5cdFx0XHRyZXR1cm4gXCIuaGFuZGxlcnMubmF2aWdhdGVUb1N1YlNlY3Rpb24oJGNvbnRyb2xsZXIsICdcIiArIEpTT04uc3RyaW5naWZ5KG9Db25maWd1cmF0aW9uW1widGFyZ2V0U2VjdGlvbnNcIl0pICsgXCInKVwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IGdldEhlYWRlckZvcm1IYm94UmVuZGVyVHlwZSA9IGZ1bmN0aW9uIChkYXRhRmllbGQ6IERhdGFNb2RlbE9iamVjdFBhdGgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRpZiAoZGF0YUZpZWxkPy50YXJnZXRPYmplY3Q/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRyZXR1cm4gXCJCYXJlXCI7XG59O1xuXG4vKipcbiAqIFRoZSBkZWZhdWx0IGFjdGlvbiBncm91cCBoYW5kbGVyIHRoYXQgaXMgaW52b2tlZCB3aGVuIGFkZGluZyB0aGUgbWVudSBidXR0b24gaGFuZGxpbmcgYXBwcm9wcmlhdGVseS5cbiAqXG4gKiBAcGFyYW0gb0N0eCBUaGUgY3VycmVudCBjb250ZXh0IGluIHdoaWNoIHRoZSBoYW5kbGVyIGlzIGNhbGxlZFxuICogQHBhcmFtIG9BY3Rpb24gVGhlIGN1cnJlbnQgYWN0aW9uIGNvbnRleHRcbiAqIEBwYXJhbSBvRGF0YUZpZWxkRm9yRGVmYXVsdEFjdGlvbiBUaGUgY3VycmVudCBkYXRhRmllbGQgZm9yIHRoZSBkZWZhdWx0IGFjdGlvblxuICogQHBhcmFtIGRlZmF1bHRBY3Rpb25Db250ZXh0T3JFbnRpdHlTZXQgVGhlIGN1cnJlbnQgY29udGV4dCBmb3IgdGhlIGRlZmF1bHQgYWN0aW9uXG4gKiBAcmV0dXJucyBUaGUgYXBwcm9wcmlhdGUgZXhwcmVzc2lvbiBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRBY3Rpb25IYW5kbGVyKG9DdHg6IGFueSwgb0FjdGlvbjogYW55LCBvRGF0YUZpZWxkRm9yRGVmYXVsdEFjdGlvbjogYW55LCBkZWZhdWx0QWN0aW9uQ29udGV4dE9yRW50aXR5U2V0OiBhbnkpIHtcblx0aWYgKG9BY3Rpb24uZGVmYXVsdEFjdGlvbikge1xuXHRcdHRyeSB7XG5cdFx0XHRzd2l0Y2ggKG9BY3Rpb24uZGVmYXVsdEFjdGlvbi50eXBlKSB7XG5cdFx0XHRcdGNhc2UgXCJGb3JBY3Rpb25cIjoge1xuXHRcdFx0XHRcdHJldHVybiBnZXRQcmVzc0V4cHJlc3Npb25Gb3JFZGl0KG9EYXRhRmllbGRGb3JEZWZhdWx0QWN0aW9uLCBkZWZhdWx0QWN0aW9uQ29udGV4dE9yRW50aXR5U2V0LCBvQWN0aW9uLmRlZmF1bHRBY3Rpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgXCJGb3JOYXZpZ2F0aW9uXCI6IHtcblx0XHRcdFx0XHRpZiAob0FjdGlvbi5kZWZhdWx0QWN0aW9uLmNvbW1hbmQpIHtcblx0XHRcdFx0XHRcdHJldHVybiBcImNtZDpcIiArIG9BY3Rpb24uZGVmYXVsdEFjdGlvbi5jb21tYW5kO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0FjdGlvbi5kZWZhdWx0QWN0aW9uLnByZXNzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdFx0aWYgKG9BY3Rpb24uZGVmYXVsdEFjdGlvbi5jb21tYW5kKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJjbWQ6XCIgKyBvQWN0aW9uLmRlZmF1bHRBY3Rpb24uY29tbWFuZDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKG9BY3Rpb24uZGVmYXVsdEFjdGlvbi5ub1dyYXApIHtcblx0XHRcdFx0XHRcdHJldHVybiBvQWN0aW9uLmRlZmF1bHRBY3Rpb24ucHJlc3M7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBDb21tb25IZWxwZXIuYnVpbGRBY3Rpb25XcmFwcGVyKG9BY3Rpb24uZGVmYXVsdEFjdGlvbiwgeyBpZDogXCJmb3JUaGVPYmplY3RQYWdlXCIgfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoaW9FeCkge1xuXHRcdFx0cmV0dXJuIFwiYmluZGluZyBmb3IgdGhlIGRlZmF1bHQgYWN0aW9uIGlzIG5vdCB3b3JraW5nIGFzIGV4cGVjdGVkXCI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHN1YiBzZWN0aW9uIHZpc3VhbGl6YXRpb24gaXMgcGFydCBvZiBwcmV2aWV3LlxuICpcbiAqIEBwYXJhbSBzdWJTZWN0aW9uIFRoZSBzdWIgc2VjdGlvbiB2aXN1YWxpemF0aW9uXG4gKiBAcmV0dXJucyBBIEJvb2xlYW4gdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmlzdWFsaXphdGlvbklzUGFydE9mUHJldmlldyhzdWJTZWN0aW9uOiBEYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24pIHtcblx0cmV0dXJuIHN1YlNlY3Rpb24uaXNQYXJ0T2ZQcmV2aWV3ID09PSB0cnVlIHx8IHN1YlNlY3Rpb24ucHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zWzBdLnR5cGUgIT09IFwiVGFibGVcIjtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFtQ0EsTUFBTUEsVUFBVSxHQUFHQyxR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