/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/formatters/TableFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "../../../helpers/BindingHelper", "../../../ManifestSettings"], function (tableFormatters, BindingToolkit, ModelHelper, TypeGuards, DataModelPathHelper, BindingHelper, ManifestSettings) {
  "use strict";

  var _exports = {};
  var TemplateType = ManifestSettings.TemplateType;
  var CreationMode = ManifestSettings.CreationMode;
  var UI = BindingHelper.UI;
  var singletonPathVisitor = BindingHelper.singletonPathVisitor;
  var isPathUpdatable = DataModelPathHelper.isPathUpdatable;
  var isPathInsertable = DataModelPathHelper.isPathInsertable;
  var isPathDeletable = DataModelPathHelper.isPathDeletable;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var isNavigationProperty = TypeGuards.isNavigationProperty;
  var isEntitySet = TypeGuards.isEntitySet;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var notEqual = BindingToolkit.notEqual;
  var not = BindingToolkit.not;
  var length = BindingToolkit.length;
  var isPathInModelExpression = BindingToolkit.isPathInModelExpression;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var greaterThan = BindingToolkit.greaterThan;
  var greaterOrEqual = BindingToolkit.greaterOrEqual;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var AnnotationHiddenProperty;
  (function (AnnotationHiddenProperty) {
    AnnotationHiddenProperty["CreateHidden"] = "CreateHidden";
    AnnotationHiddenProperty["DeleteHidden"] = "DeleteHidden";
    AnnotationHiddenProperty["UpdateHidden"] = "UpdateHidden";
  })(AnnotationHiddenProperty || (AnnotationHiddenProperty = {}));
  /**
   * Generates the context for the standard actions.
   *
   * @param converterContext
   * @param creationMode
   * @param tableManifestConfiguration
   * @param viewConfiguration
   * @returns  The context for table actions
   */
  function generateStandardActionsContext(converterContext, creationMode, tableManifestConfiguration, viewConfiguration) {
    return {
      collectionPath: getTargetObjectPath(converterContext.getDataModelObjectPath()),
      hiddenAnnotation: {
        create: isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.CreateHidden),
        delete: isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.DeleteHidden),
        update: isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.UpdateHidden)
      },
      creationMode: creationMode,
      isDraftOrStickySupported: isDraftOrStickySupported(converterContext),
      isViewWithMultipleVisualizations: viewConfiguration ? converterContext.getManifestWrapper().hasMultipleVisualizations(viewConfiguration) : false,
      newAction: getNewAction(converterContext),
      tableManifestConfiguration: tableManifestConfiguration,
      restrictions: getRestrictions(converterContext)
    };
  }

  /**
   * Checks if sticky or draft is supported.
   *
   * @param converterContext
   * @returns `true` if it is supported
   */
  _exports.generateStandardActionsContext = generateStandardActionsContext;
  function isDraftOrStickySupported(converterContext) {
    var _dataModelObjectPath$, _dataModelObjectPath$2, _dataModelObjectPath$3;
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    const bIsDraftSupported = ModelHelper.isObjectPathDraftSupported(dataModelObjectPath);
    const bIsStickySessionSupported = (_dataModelObjectPath$ = dataModelObjectPath.startingEntitySet) !== null && _dataModelObjectPath$ !== void 0 && (_dataModelObjectPath$2 = _dataModelObjectPath$.annotations) !== null && _dataModelObjectPath$2 !== void 0 && (_dataModelObjectPath$3 = _dataModelObjectPath$2.Session) !== null && _dataModelObjectPath$3 !== void 0 && _dataModelObjectPath$3.StickySessionSupported ? true : false;
    return bIsDraftSupported || bIsStickySessionSupported;
  }

  /**
   * Gets the configured newAction into annotation.
   *
   * @param converterContext
   * @returns The new action info
   */
  _exports.isDraftOrStickySupported = isDraftOrStickySupported;
  function getNewAction(converterContext) {
    var _currentEntitySet$ann, _currentEntitySet$ann2, _currentEntitySet$ann3, _currentEntitySet$ann4;
    const currentEntitySet = converterContext.getEntitySet();
    const newAction = isEntitySet(currentEntitySet) ? ((_currentEntitySet$ann = currentEntitySet.annotations.Common) === null || _currentEntitySet$ann === void 0 ? void 0 : (_currentEntitySet$ann2 = _currentEntitySet$ann.DraftRoot) === null || _currentEntitySet$ann2 === void 0 ? void 0 : _currentEntitySet$ann2.NewAction) ?? ((_currentEntitySet$ann3 = currentEntitySet.annotations.Session) === null || _currentEntitySet$ann3 === void 0 ? void 0 : (_currentEntitySet$ann4 = _currentEntitySet$ann3.StickySessionSupported) === null || _currentEntitySet$ann4 === void 0 ? void 0 : _currentEntitySet$ann4.NewAction) : undefined;
    const newActionName = newAction === null || newAction === void 0 ? void 0 : newAction.toString();
    if (newActionName) {
      var _converterContext$get, _converterContext$get2, _converterContext$get3, _converterContext$get4;
      let availableProperty = converterContext === null || converterContext === void 0 ? void 0 : (_converterContext$get = converterContext.getEntityType().actions[newActionName]) === null || _converterContext$get === void 0 ? void 0 : (_converterContext$get2 = _converterContext$get.annotations) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.Core) === null || _converterContext$get3 === void 0 ? void 0 : (_converterContext$get4 = _converterContext$get3.OperationAvailable) === null || _converterContext$get4 === void 0 ? void 0 : _converterContext$get4.valueOf();
      availableProperty = availableProperty !== undefined ? availableProperty : true;
      return {
        name: newActionName,
        available: getExpressionFromAnnotation(availableProperty)
      };
    }
    return undefined;
  }

  /**
   * Gets the binding expression for the action visibility configured into annotation.
   *
   * @param converterContext
   * @param sAnnotationTerm
   * @param bWithNavigationPath
   * @returns The binding expression for the action visibility
   */
  _exports.getNewAction = getNewAction;
  function isActionAnnotatedHidden(converterContext, sAnnotationTerm) {
    var _currentEntitySet$ann5;
    let bWithNavigationPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    const currentEntitySet = converterContext.getEntitySet();
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    // Consider only the last level of navigation. The others are already considered in the element binding of the page.
    const visitedNavigationPaths = dataModelObjectPath.navigationProperties.length > 0 && bWithNavigationPath ? [dataModelObjectPath.navigationProperties[dataModelObjectPath.navigationProperties.length - 1].name] : [];
    const actionAnnotationValue = (currentEntitySet === null || currentEntitySet === void 0 ? void 0 : (_currentEntitySet$ann5 = currentEntitySet.annotations.UI) === null || _currentEntitySet$ann5 === void 0 ? void 0 : _currentEntitySet$ann5[sAnnotationTerm]) || false;
    return currentEntitySet ? getExpressionFromAnnotation(actionAnnotationValue, visitedNavigationPaths, undefined, path => singletonPathVisitor(path, converterContext.getConvertedTypes(), visitedNavigationPaths)) : constant(false);
  }

  /**
   * Gets the annotated restrictions for the actions.
   *
   * @param converterContext
   * @returns The restriction information
   */
  _exports.isActionAnnotatedHidden = isActionAnnotatedHidden;
  function getRestrictions(converterContext) {
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    const restrictionsDef = [{
      key: "isInsertable",
      function: isPathInsertable
    }, {
      key: "isUpdatable",
      function: isPathUpdatable
    }, {
      key: "isDeletable",
      function: isPathDeletable
    }];
    const result = {};
    restrictionsDef.forEach(function (def) {
      const defFunction = def["function"];
      result[def.key] = {
        expression: defFunction.apply(null, [dataModelObjectPath, {
          pathVisitor: (path, navigationPaths) => singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths)
        }]),
        navigationExpression: defFunction.apply(null, [dataModelObjectPath, {
          ignoreTargetCollection: true,
          authorizeUnresolvable: true,
          pathVisitor: (path, navigationPaths) => singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths)
        }])
      };
    });
    return result;
  }

  /**
   * Checks if templating for insert/update actions is mandatory.
   *
   * @param standardActionsContext
   * @param isDraftOrSticky
   * @returns True if we need to template insert or update actions, false otherwise
   */
  _exports.getRestrictions = getRestrictions;
  function getInsertUpdateActionsTemplating(standardActionsContext, isDraftOrSticky) {
    return isDraftOrSticky || standardActionsContext.creationMode === CreationMode.External;
  }

  /**
   * Gets the binding expressions for the properties of the 'Create' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The standard action info
   */
  _exports.getInsertUpdateActionsTemplating = getInsertUpdateActionsTemplating;
  function getStandardActionCreate(converterContext, standardActionsContext) {
    const createVisibility = getCreateVisibility(converterContext, standardActionsContext);
    return {
      isTemplated: compileExpression(getCreateTemplating(standardActionsContext, createVisibility)),
      visible: compileExpression(createVisibility),
      enabled: compileExpression(getCreateEnablement(converterContext, standardActionsContext, createVisibility))
    };
  }

  /**
   * Gets the binding expressions for the properties of the 'Delete' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The binding expressions for the properties of the 'Delete' action.
   */
  _exports.getStandardActionCreate = getStandardActionCreate;
  function getStandardActionDelete(converterContext, standardActionsContext) {
    const deleteVisibility = getDeleteVisibility(converterContext, standardActionsContext);
    return {
      isTemplated: compileExpression(getDefaultTemplating(deleteVisibility)),
      visible: compileExpression(deleteVisibility),
      enabled: compileExpression(getDeleteEnablement(converterContext, standardActionsContext, deleteVisibility))
    };
  }

  /**
   * @param converterContext
   * @param standardActionsContext
   * @returns StandardActionConfigType
   */
  _exports.getStandardActionDelete = getStandardActionDelete;
  function getCreationRow(converterContext, standardActionsContext) {
    const creationRowVisibility = getCreateVisibility(converterContext, standardActionsContext, true);
    return {
      isTemplated: compileExpression(getCreateTemplating(standardActionsContext, creationRowVisibility, true)),
      visible: compileExpression(creationRowVisibility),
      enabled: compileExpression(getCreationRowEnablement(converterContext, standardActionsContext, creationRowVisibility))
    };
  }

  /**
   * Gets the binding expressions for the properties of the 'Paste' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param isInsertUpdateActionsTemplated
   * @returns The binding expressions for the properties of the 'Paste' action.
   */
  _exports.getCreationRow = getCreationRow;
  function getStandardActionPaste(converterContext, standardActionsContext, isInsertUpdateActionsTemplated) {
    const createVisibility = getCreateVisibility(converterContext, standardActionsContext);
    const createEnablement = getCreateEnablement(converterContext, standardActionsContext, createVisibility);
    const pasteVisibility = getPasteVisibility(converterContext, standardActionsContext, createVisibility, isInsertUpdateActionsTemplated);
    return {
      visible: compileExpression(pasteVisibility),
      enabled: compileExpression(getPasteEnablement(pasteVisibility, createEnablement))
    };
  }

  /**
   * Gets the binding expressions for the properties of the 'MassEdit' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The binding expressions for the properties of the 'MassEdit' action.
   */
  _exports.getStandardActionPaste = getStandardActionPaste;
  function getStandardActionMassEdit(converterContext, standardActionsContext) {
    const massEditVisibility = getMassEditVisibility(converterContext, standardActionsContext);
    return {
      isTemplated: compileExpression(getDefaultTemplating(massEditVisibility)),
      visible: compileExpression(massEditVisibility),
      enabled: compileExpression(getMassEditEnablement(converterContext, standardActionsContext, massEditVisibility))
    };
  }

  /**
   * Gets the binding expression for the templating of the 'Create' action.
   *
   * @param standardActionsContext
   * @param createVisibility
   * @param isForCreationRow
   * @returns The create binding expression
   */
  _exports.getStandardActionMassEdit = getStandardActionMassEdit;
  function getCreateTemplating(standardActionsContext, createVisibility) {
    let isForCreationRow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    //Templating of Create Button is not done:
    // 	 - If Button is never visible(covered the External create button, new Action)
    //	 - or CreationMode is on CreationRow for Create Button
    //	 - or CreationMode is not on CreationRow for CreationRow Button

    return and(
    //XNOR gate
    or(and(isForCreationRow, standardActionsContext.creationMode === CreationMode.CreationRow), and(!isForCreationRow, standardActionsContext.creationMode !== CreationMode.CreationRow)), or(not(isConstant(createVisibility)), createVisibility));
  }

  /**
   * Gets the binding expression for the templating of the non-Create actions.
   *
   * @param actionVisibility
   * @returns The binding expression for the templating of the non-Create actions.
   */
  _exports.getCreateTemplating = getCreateTemplating;
  function getDefaultTemplating(actionVisibility) {
    return or(not(isConstant(actionVisibility)), actionVisibility);
  }

  /**
   * Gets the binding expression for the 'visible' property of the 'Create' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param isForCreationRow
   * @returns The binding expression for the 'visible' property of the 'Create' action.
   */
  _exports.getDefaultTemplating = getDefaultTemplating;
  function getCreateVisibility(converterContext, standardActionsContext) {
    var _standardActionsConte, _standardActionsConte2;
    let isForCreationRow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const isInsertable = standardActionsContext.restrictions.isInsertable.expression;
    const isCreateHidden = isForCreationRow ? isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.CreateHidden, false) : standardActionsContext.hiddenAnnotation.create;
    const newAction = standardActionsContext.newAction;
    //Create Button is visible:
    // 	 - If the creation mode is external
    //      - If we're on the list report and create is not hidden
    //		- Otherwise this depends on the value of the UI.IsEditable
    //	 - Otherwise
    //		- If any of the following conditions is valid then create button isn't visible
    //			- no newAction available
    //			- It's not insertable and there is not a new action
    //			- create is hidden
    //			- There are multiple visualizations
    //			- It's an Analytical List Page
    //			- Uses InlineCreationRows mode and a Responsive table type, with the parameter inlineCreationRowsHiddenInEditMode to true while not in create mode
    //   - Otherwise
    // 	 	- If we're on the list report ->
    // 	 		- If UI.CreateHidden points to a property path -> provide a negated binding to this path
    // 	 		- Otherwise, create is visible
    // 	 	- Otherwise
    // 	  	 - This depends on the value of the UI.IsEditable
    return ifElse(standardActionsContext.creationMode === CreationMode.External, and(not(isCreateHidden), or(converterContext.getTemplateType() === TemplateType.ListReport, UI.IsEditable)), ifElse(or(and(isConstant(newAction === null || newAction === void 0 ? void 0 : newAction.available), equal(newAction === null || newAction === void 0 ? void 0 : newAction.available, false)), and(isConstant(isInsertable), equal(isInsertable, false), !newAction), and(isConstant(isCreateHidden), equal(isCreateHidden, true)), and(standardActionsContext.creationMode === CreationMode.InlineCreationRows, ((_standardActionsConte = standardActionsContext.tableManifestConfiguration) === null || _standardActionsConte === void 0 ? void 0 : _standardActionsConte.type) === "ResponsiveTable", ifElse((standardActionsContext === null || standardActionsContext === void 0 ? void 0 : (_standardActionsConte2 = standardActionsContext.tableManifestConfiguration) === null || _standardActionsConte2 === void 0 ? void 0 : _standardActionsConte2.inlineCreationRowsHiddenInEditMode) === false, true, UI.IsCreateMode))), false, ifElse(converterContext.getTemplateType() === TemplateType.ListReport, or(not(isPathInModelExpression(isCreateHidden)), not(isCreateHidden)), and(not(isCreateHidden), UI.IsEditable))));
  }

  /**
   * Gets the binding expression for the 'visible' property of the 'Delete' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The binding expression for the 'visible' property of the 'Delete' action.
   */
  _exports.getCreateVisibility = getCreateVisibility;
  function getDeleteVisibility(converterContext, standardActionsContext) {
    const isDeleteHidden = standardActionsContext.hiddenAnnotation.delete;
    const pathDeletableExpression = standardActionsContext.restrictions.isDeletable.expression;

    //Delete Button is visible:
    // 	 Prerequisites:
    //	 - If we're not on ALP
    //   - If restrictions on deletable set to false -> not visible
    //   - Otherwise
    //			- If UI.DeleteHidden is true -> not visible
    //			- Otherwise
    // 	 			- If we're on OP -> depending if UI is editable and restrictions on deletable
    //				- Otherwise
    //				 	- If UI.DeleteHidden points to a property path -> provide a negated binding to this path
    //	 	 		 	- Otherwise, delete is visible

    return ifElse(converterContext.getTemplateType() === TemplateType.AnalyticalListPage, false, ifElse(and(isConstant(pathDeletableExpression), equal(pathDeletableExpression, false)), false, ifElse(and(isConstant(isDeleteHidden), equal(isDeleteHidden, constant(true))), false, ifElse(converterContext.getTemplateType() !== TemplateType.ListReport, and(not(isDeleteHidden), UI.IsEditable), not(and(isPathInModelExpression(isDeleteHidden), isDeleteHidden))))));
  }

  /**
   * Gets the binding expression for the 'visible' property of the 'Paste' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param createVisibility
   * @param isInsertUpdateActionsTemplated
   * @returns The binding expression for the 'visible' property of the 'Paste' action.
   */
  _exports.getDeleteVisibility = getDeleteVisibility;
  function getPasteVisibility(converterContext, standardActionsContext, createVisibility, isInsertUpdateActionsTemplated) {
    // If Create is visible, enablePaste is not disabled into manifest and we are on OP/blocks outside Fiori elements templates
    // Then button will be visible according to insertable restrictions and create visibility
    // Otherwise it's not visible
    return and(notEqual(standardActionsContext.tableManifestConfiguration.enablePaste, false), createVisibility, isInsertUpdateActionsTemplated, [TemplateType.ListReport, TemplateType.AnalyticalListPage].indexOf(converterContext.getTemplateType()) === -1, standardActionsContext.restrictions.isInsertable.expression);
  }

  /**
   * Gets the binding expression for the 'visible' property of the 'MassEdit' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The binding expression for the 'visible' property of the 'MassEdit' action.
   */
  _exports.getPasteVisibility = getPasteVisibility;
  function getMassEditVisibility(converterContext, standardActionsContext) {
    var _standardActionsConte3;
    const isUpdateHidden = standardActionsContext.hiddenAnnotation.update,
      pathUpdatableExpression = standardActionsContext.restrictions.isUpdatable.expression,
      bMassEditEnabledInManifest = ((_standardActionsConte3 = standardActionsContext.tableManifestConfiguration) === null || _standardActionsConte3 === void 0 ? void 0 : _standardActionsConte3.enableMassEdit) || false;
    const templateBindingExpression = converterContext.getTemplateType() === TemplateType.ObjectPage ? UI.IsEditable : converterContext.getTemplateType() === TemplateType.ListReport;
    //MassEdit is visible
    // If
    //		- there is no static restrictions set to false
    //		- and enableMassEdit is not set to false into the manifest
    //		- and the selectionMode is relevant
    //	Then MassEdit is always visible in LR or dynamically visible in OP according to ui>Editable and hiddenAnnotation
    //  Button is hidden for all other cases
    return and(not(and(isConstant(pathUpdatableExpression), equal(pathUpdatableExpression, false))), bMassEditEnabledInManifest, templateBindingExpression, not(isUpdateHidden));
  }

  /**
   * Gets the binding expression for the 'enabled' property of the creationRow.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param creationRowVisibility
   * @returns The binding expression for the 'enabled' property of the creationRow.
   */
  _exports.getMassEditVisibility = getMassEditVisibility;
  function getCreationRowEnablement(converterContext, standardActionsContext, creationRowVisibility) {
    const restrictionsInsertable = isPathInsertable(converterContext.getDataModelObjectPath(), {
      ignoreTargetCollection: true,
      authorizeUnresolvable: true,
      pathVisitor: (path, navigationPaths) => {
        if (path.indexOf("/") === 0) {
          path = singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths);
          return path;
        }
        const navigationProperties = converterContext.getDataModelObjectPath().navigationProperties;
        if (navigationProperties) {
          const lastNav = navigationProperties[navigationProperties.length - 1];
          const partner = isNavigationProperty(lastNav) && lastNav.partner;
          if (partner) {
            path = `${partner}/${path}`;
          }
        }
        return path;
      }
    });
    const isInsertable = restrictionsInsertable._type === "Unresolvable" ? isPathInsertable(converterContext.getDataModelObjectPath(), {
      pathVisitor: path => singletonPathVisitor(path, converterContext.getConvertedTypes(), [])
    }) : restrictionsInsertable;
    return and(creationRowVisibility, isInsertable, or(!standardActionsContext.tableManifestConfiguration.disableAddRowButtonForEmptyData, formatResult([pathInModel("creationRowFieldValidity", "internal")], tableFormatters.validateCreationRowFields)));
  }

  /**
   * Gets the binding expression for the 'enabled' property of the 'Create' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param createVisibility
   * @returns The binding expression for the 'enabled' property of the 'Create' action.
   */
  _exports.getCreationRowEnablement = getCreationRowEnablement;
  function getCreateEnablement(converterContext, standardActionsContext, createVisibility) {
    let condition;
    if (standardActionsContext.creationMode === CreationMode.InlineCreationRows) {
      // for Inline creation rows create can be hidden via manifest and this should not impact its enablement
      condition = not(standardActionsContext.hiddenAnnotation.create);
    } else {
      condition = createVisibility;
    }
    const isInsertable = standardActionsContext.restrictions.isInsertable.expression;
    const CollectionType = converterContext.resolveAbsolutePath(standardActionsContext.collectionPath).target;
    return and(condition, or(isEntitySet(CollectionType), and(isInsertable, or(converterContext.getTemplateType() !== TemplateType.ObjectPage, UI.IsEditable))));
  }

  /**
   * Gets the binding expression for the 'enabled' property of the 'Delete' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param deleteVisibility
   * @returns The binding expression for the 'enabled' property of the 'Delete' action.
   */
  _exports.getCreateEnablement = getCreateEnablement;
  function getDeleteEnablement(converterContext, standardActionsContext, deleteVisibility) {
    const deletableContexts = pathInModel("deletableContexts", "internal");
    const unSavedContexts = pathInModel("unSavedContexts", "internal");
    const draftsWithDeletableActive = pathInModel("draftsWithDeletableActive", "internal");
    const draftsWithNonDeletableActive = pathInModel("draftsWithNonDeletableActive", "internal");
    return and(deleteVisibility, ifElse(converterContext.getTemplateType() === TemplateType.ObjectPage, or(and(notEqual(deletableContexts, undefined), greaterThan(length(deletableContexts), 0)), and(notEqual(draftsWithDeletableActive, undefined), greaterThan(length(draftsWithDeletableActive), 0))), or(and(notEqual(deletableContexts, undefined), greaterThan(length(deletableContexts), 0)), and(notEqual(draftsWithDeletableActive, undefined), greaterThan(length(draftsWithDeletableActive), 0)),
    // on LR, also enable delete button to cancel drafts
    and(notEqual(draftsWithNonDeletableActive, undefined), greaterThan(length(draftsWithNonDeletableActive), 0)),
    // deletable contexts with unsaved changes are counted separately (LR only)
    and(notEqual(unSavedContexts, undefined), greaterThan(length(unSavedContexts), 0)))));
  }

  /**
   * Gets the binding expression for the 'enabled' property of the 'Paste' action.
   *
   * @param pasteVisibility
   * @param createEnablement
   * @returns The binding expression for the 'enabled' property of the 'Paste' action.
   */
  _exports.getDeleteEnablement = getDeleteEnablement;
  function getPasteEnablement(pasteVisibility, createEnablement) {
    return and(pasteVisibility, createEnablement);
  }

  /**
   * Gets the binding expression for the 'enabled' property of the 'MassEdit' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param massEditVisibility
   * @returns The binding expression for the 'enabled' property of the 'MassEdit' action.
   */
  _exports.getPasteEnablement = getPasteEnablement;
  function getMassEditEnablement(converterContext, standardActionsContext, massEditVisibility) {
    const pathUpdatableExpression = standardActionsContext.restrictions.isUpdatable.expression;
    const isOnlyDynamicOnCurrentEntity = !isConstant(pathUpdatableExpression) && standardActionsContext.restrictions.isUpdatable.navigationExpression._type === "Unresolvable";
    const numberOfSelectedContexts = greaterOrEqual(pathInModel("numberOfSelectedContexts", "internal"), 1);
    const numberOfUpdatableContexts = greaterOrEqual(length(pathInModel("updatableContexts", "internal")), 1);
    const bIsDraftSupported = ModelHelper.isObjectPathDraftSupported(converterContext.getDataModelObjectPath());
    const bDisplayMode = isInDisplayMode(converterContext);

    // numberOfUpdatableContexts needs to be added to the binding in case
    // 1. Update is dependent on current entity property (isOnlyDynamicOnCurrentEntity is true).
    // 2. The table is read only and draft enabled(like LR), in this case only active contexts can be mass edited.
    //    So, update depends on 'IsActiveEntity' value which needs to be checked runtime.
    const runtimeBinding = ifElse(or(and(bDisplayMode, bIsDraftSupported), isOnlyDynamicOnCurrentEntity), and(numberOfSelectedContexts, numberOfUpdatableContexts), and(numberOfSelectedContexts));
    return and(massEditVisibility, ifElse(isOnlyDynamicOnCurrentEntity, runtimeBinding, and(runtimeBinding, pathUpdatableExpression)));
  }

  /**
   * Tells if the table in template is in display mode.
   *
   * @param converterContext
   * @param viewConfiguration
   * @returns `true` if the table is in display mode
   */
  _exports.getMassEditEnablement = getMassEditEnablement;
  function isInDisplayMode(converterContext, viewConfiguration) {
    const templateType = converterContext.getTemplateType();
    if (templateType === TemplateType.ListReport || templateType === TemplateType.AnalyticalListPage || viewConfiguration && converterContext.getManifestWrapper().hasMultipleVisualizations(viewConfiguration)) {
      return true;
    }
    // updatable will be handled at the property level
    return false;
  }
  _exports.isInDisplayMode = isInDisplayMode;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbm5vdGF0aW9uSGlkZGVuUHJvcGVydHkiLCJnZW5lcmF0ZVN0YW5kYXJkQWN0aW9uc0NvbnRleHQiLCJjb252ZXJ0ZXJDb250ZXh0IiwiY3JlYXRpb25Nb2RlIiwidGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24iLCJ2aWV3Q29uZmlndXJhdGlvbiIsImNvbGxlY3Rpb25QYXRoIiwiZ2V0VGFyZ2V0T2JqZWN0UGF0aCIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJoaWRkZW5Bbm5vdGF0aW9uIiwiY3JlYXRlIiwiaXNBY3Rpb25Bbm5vdGF0ZWRIaWRkZW4iLCJDcmVhdGVIaWRkZW4iLCJkZWxldGUiLCJEZWxldGVIaWRkZW4iLCJ1cGRhdGUiLCJVcGRhdGVIaWRkZW4iLCJpc0RyYWZ0T3JTdGlja3lTdXBwb3J0ZWQiLCJpc1ZpZXdXaXRoTXVsdGlwbGVWaXN1YWxpemF0aW9ucyIsImdldE1hbmlmZXN0V3JhcHBlciIsImhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMiLCJuZXdBY3Rpb24iLCJnZXROZXdBY3Rpb24iLCJyZXN0cmljdGlvbnMiLCJnZXRSZXN0cmljdGlvbnMiLCJkYXRhTW9kZWxPYmplY3RQYXRoIiwiYklzRHJhZnRTdXBwb3J0ZWQiLCJNb2RlbEhlbHBlciIsImlzT2JqZWN0UGF0aERyYWZ0U3VwcG9ydGVkIiwiYklzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsInN0YXJ0aW5nRW50aXR5U2V0IiwiYW5ub3RhdGlvbnMiLCJTZXNzaW9uIiwiU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsImN1cnJlbnRFbnRpdHlTZXQiLCJnZXRFbnRpdHlTZXQiLCJpc0VudGl0eVNldCIsIkNvbW1vbiIsIkRyYWZ0Um9vdCIsIk5ld0FjdGlvbiIsInVuZGVmaW5lZCIsIm5ld0FjdGlvbk5hbWUiLCJ0b1N0cmluZyIsImF2YWlsYWJsZVByb3BlcnR5IiwiZ2V0RW50aXR5VHlwZSIsImFjdGlvbnMiLCJDb3JlIiwiT3BlcmF0aW9uQXZhaWxhYmxlIiwidmFsdWVPZiIsIm5hbWUiLCJhdmFpbGFibGUiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJzQW5ub3RhdGlvblRlcm0iLCJiV2l0aE5hdmlnYXRpb25QYXRoIiwidmlzaXRlZE5hdmlnYXRpb25QYXRocyIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibGVuZ3RoIiwiYWN0aW9uQW5ub3RhdGlvblZhbHVlIiwiVUkiLCJwYXRoIiwic2luZ2xldG9uUGF0aFZpc2l0b3IiLCJnZXRDb252ZXJ0ZWRUeXBlcyIsImNvbnN0YW50IiwicmVzdHJpY3Rpb25zRGVmIiwia2V5IiwiZnVuY3Rpb24iLCJpc1BhdGhJbnNlcnRhYmxlIiwiaXNQYXRoVXBkYXRhYmxlIiwiaXNQYXRoRGVsZXRhYmxlIiwicmVzdWx0IiwiZm9yRWFjaCIsImRlZiIsImRlZkZ1bmN0aW9uIiwiZXhwcmVzc2lvbiIsImFwcGx5IiwicGF0aFZpc2l0b3IiLCJuYXZpZ2F0aW9uUGF0aHMiLCJuYXZpZ2F0aW9uRXhwcmVzc2lvbiIsImlnbm9yZVRhcmdldENvbGxlY3Rpb24iLCJhdXRob3JpemVVbnJlc29sdmFibGUiLCJnZXRJbnNlcnRVcGRhdGVBY3Rpb25zVGVtcGxhdGluZyIsInN0YW5kYXJkQWN0aW9uc0NvbnRleHQiLCJpc0RyYWZ0T3JTdGlja3kiLCJDcmVhdGlvbk1vZGUiLCJFeHRlcm5hbCIsImdldFN0YW5kYXJkQWN0aW9uQ3JlYXRlIiwiY3JlYXRlVmlzaWJpbGl0eSIsImdldENyZWF0ZVZpc2liaWxpdHkiLCJpc1RlbXBsYXRlZCIsImNvbXBpbGVFeHByZXNzaW9uIiwiZ2V0Q3JlYXRlVGVtcGxhdGluZyIsInZpc2libGUiLCJlbmFibGVkIiwiZ2V0Q3JlYXRlRW5hYmxlbWVudCIsImdldFN0YW5kYXJkQWN0aW9uRGVsZXRlIiwiZGVsZXRlVmlzaWJpbGl0eSIsImdldERlbGV0ZVZpc2liaWxpdHkiLCJnZXREZWZhdWx0VGVtcGxhdGluZyIsImdldERlbGV0ZUVuYWJsZW1lbnQiLCJnZXRDcmVhdGlvblJvdyIsImNyZWF0aW9uUm93VmlzaWJpbGl0eSIsImdldENyZWF0aW9uUm93RW5hYmxlbWVudCIsImdldFN0YW5kYXJkQWN0aW9uUGFzdGUiLCJpc0luc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0ZWQiLCJjcmVhdGVFbmFibGVtZW50IiwicGFzdGVWaXNpYmlsaXR5IiwiZ2V0UGFzdGVWaXNpYmlsaXR5IiwiZ2V0UGFzdGVFbmFibGVtZW50IiwiZ2V0U3RhbmRhcmRBY3Rpb25NYXNzRWRpdCIsIm1hc3NFZGl0VmlzaWJpbGl0eSIsImdldE1hc3NFZGl0VmlzaWJpbGl0eSIsImdldE1hc3NFZGl0RW5hYmxlbWVudCIsImlzRm9yQ3JlYXRpb25Sb3ciLCJhbmQiLCJvciIsIkNyZWF0aW9uUm93Iiwibm90IiwiaXNDb25zdGFudCIsImFjdGlvblZpc2liaWxpdHkiLCJpc0luc2VydGFibGUiLCJpc0NyZWF0ZUhpZGRlbiIsImlmRWxzZSIsImdldFRlbXBsYXRlVHlwZSIsIlRlbXBsYXRlVHlwZSIsIkxpc3RSZXBvcnQiLCJJc0VkaXRhYmxlIiwiZXF1YWwiLCJJbmxpbmVDcmVhdGlvblJvd3MiLCJ0eXBlIiwiaW5saW5lQ3JlYXRpb25Sb3dzSGlkZGVuSW5FZGl0TW9kZSIsIklzQ3JlYXRlTW9kZSIsImlzUGF0aEluTW9kZWxFeHByZXNzaW9uIiwiaXNEZWxldGVIaWRkZW4iLCJwYXRoRGVsZXRhYmxlRXhwcmVzc2lvbiIsImlzRGVsZXRhYmxlIiwiQW5hbHl0aWNhbExpc3RQYWdlIiwibm90RXF1YWwiLCJlbmFibGVQYXN0ZSIsImluZGV4T2YiLCJpc1VwZGF0ZUhpZGRlbiIsInBhdGhVcGRhdGFibGVFeHByZXNzaW9uIiwiaXNVcGRhdGFibGUiLCJiTWFzc0VkaXRFbmFibGVkSW5NYW5pZmVzdCIsImVuYWJsZU1hc3NFZGl0IiwidGVtcGxhdGVCaW5kaW5nRXhwcmVzc2lvbiIsIk9iamVjdFBhZ2UiLCJyZXN0cmljdGlvbnNJbnNlcnRhYmxlIiwibGFzdE5hdiIsInBhcnRuZXIiLCJpc05hdmlnYXRpb25Qcm9wZXJ0eSIsIl90eXBlIiwiZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YSIsImZvcm1hdFJlc3VsdCIsInBhdGhJbk1vZGVsIiwidGFibGVGb3JtYXR0ZXJzIiwidmFsaWRhdGVDcmVhdGlvblJvd0ZpZWxkcyIsImNvbmRpdGlvbiIsIkNvbGxlY3Rpb25UeXBlIiwicmVzb2x2ZUFic29sdXRlUGF0aCIsInRhcmdldCIsImRlbGV0YWJsZUNvbnRleHRzIiwidW5TYXZlZENvbnRleHRzIiwiZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSIsImRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUiLCJncmVhdGVyVGhhbiIsImlzT25seUR5bmFtaWNPbkN1cnJlbnRFbnRpdHkiLCJudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMiLCJncmVhdGVyT3JFcXVhbCIsIm51bWJlck9mVXBkYXRhYmxlQ29udGV4dHMiLCJiRGlzcGxheU1vZGUiLCJpc0luRGlzcGxheU1vZGUiLCJydW50aW1lQmluZGluZyIsInRlbXBsYXRlVHlwZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU3RhbmRhcmRBY3Rpb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRW50aXR5U2V0LCBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBFbnRpdHlTZXRBbm5vdGF0aW9uc19VSSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlfRWRtXCI7XG5pbXBvcnQgdGFibGVGb3JtYXR0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL1RhYmxlRm9ybWF0dGVyXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHtcblx0YW5kLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Y29uc3RhbnQsXG5cdGVxdWFsLFxuXHRmb3JtYXRSZXN1bHQsXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0Z3JlYXRlck9yRXF1YWwsXG5cdGdyZWF0ZXJUaGFuLFxuXHRpZkVsc2UsXG5cdGlzQ29uc3RhbnQsXG5cdGlzUGF0aEluTW9kZWxFeHByZXNzaW9uLFxuXHRsZW5ndGgsXG5cdG5vdCxcblx0bm90RXF1YWwsXG5cdG9yLFxuXHRwYXRoSW5Nb2RlbFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBpc0VudGl0eVNldCwgaXNOYXZpZ2F0aW9uUHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9UeXBlR3VhcmRzXCI7XG5pbXBvcnQgeyBnZXRUYXJnZXRPYmplY3RQYXRoLCBpc1BhdGhEZWxldGFibGUsIGlzUGF0aEluc2VydGFibGUsIGlzUGF0aFVwZGF0YWJsZSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcIi4uLy4uLy4uL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IHNpbmdsZXRvblBhdGhWaXNpdG9yLCBVSSB9IGZyb20gXCIuLi8uLi8uLi9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgVmlld1BhdGhDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IENyZWF0aW9uTW9kZSwgVGVtcGxhdGVUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB0eXBlIHsgVGFibGVDb250cm9sQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9UYWJsZVwiO1xuXG5lbnVtIEFubm90YXRpb25IaWRkZW5Qcm9wZXJ0eSB7XG5cdENyZWF0ZUhpZGRlbiA9IFwiQ3JlYXRlSGlkZGVuXCIsXG5cdERlbGV0ZUhpZGRlbiA9IFwiRGVsZXRlSGlkZGVuXCIsXG5cdFVwZGF0ZUhpZGRlbiA9IFwiVXBkYXRlSGlkZGVuXCJcbn1cblxuZXhwb3J0IHR5cGUgU3RhbmRhcmRBY3Rpb25Db25maWdUeXBlID0ge1xuXHRpc1RlbXBsYXRlZD86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHR2aXNpYmxlOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0ZW5hYmxlZDogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG59O1xuXG50eXBlIEV4cHJlc3Npb25SZXN0cmljdGlvbnNUeXBlID0ge1xuXHRleHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdG5hdmlnYXRpb25FeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG59O1xudHlwZSBTdGFuZGFyZEFjdGlvbnNSZXN0cmljdGlvbnNUeXBlID0gUmVjb3JkPHN0cmluZywgRXhwcmVzc2lvblJlc3RyaWN0aW9uc1R5cGU+O1xuXG5leHBvcnQgdHlwZSBTdGFuZGFyZEFjdGlvbnNDb250ZXh0ID0ge1xuXHRjb2xsZWN0aW9uUGF0aDogc3RyaW5nO1xuXHRoaWRkZW5Bbm5vdGF0aW9uOiB7XG5cdFx0Y3JlYXRlOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdFx0ZGVsZXRlOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdFx0dXBkYXRlOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdH07XG5cdGNyZWF0aW9uTW9kZTogQ3JlYXRpb25Nb2RlO1xuXHRpc0RyYWZ0T3JTdGlja3lTdXBwb3J0ZWQ6IGJvb2xlYW47XG5cdGlzVmlld1dpdGhNdWx0aXBsZVZpc3VhbGl6YXRpb25zOiBib29sZWFuO1xuXHRuZXdBY3Rpb24/OiB7XG5cdFx0bmFtZTogc3RyaW5nO1xuXHRcdGF2YWlsYWJsZTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+O1xuXHR9O1xuXHR0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbjogVGFibGVDb250cm9sQ29uZmlndXJhdGlvbjtcblx0cmVzdHJpY3Rpb25zOiBTdGFuZGFyZEFjdGlvbnNSZXN0cmljdGlvbnNUeXBlO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIGNvbnRleHQgZm9yIHRoZSBzdGFuZGFyZCBhY3Rpb25zLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gY3JlYXRpb25Nb2RlXG4gKiBAcGFyYW0gdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSB2aWV3Q29uZmlndXJhdGlvblxuICogQHJldHVybnMgIFRoZSBjb250ZXh0IGZvciB0YWJsZSBhY3Rpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVN0YW5kYXJkQWN0aW9uc0NvbnRleHQoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGNyZWF0aW9uTW9kZTogQ3JlYXRpb25Nb2RlLFxuXHR0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbjogVGFibGVDb250cm9sQ29uZmlndXJhdGlvbixcblx0dmlld0NvbmZpZ3VyYXRpb24/OiBWaWV3UGF0aENvbmZpZ3VyYXRpb25cbik6IFN0YW5kYXJkQWN0aW9uc0NvbnRleHQge1xuXHRyZXR1cm4ge1xuXHRcdGNvbGxlY3Rpb25QYXRoOiBnZXRUYXJnZXRPYmplY3RQYXRoKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpKSxcblx0XHRoaWRkZW5Bbm5vdGF0aW9uOiB7XG5cdFx0XHRjcmVhdGU6IGlzQWN0aW9uQW5ub3RhdGVkSGlkZGVuKGNvbnZlcnRlckNvbnRleHQsIEFubm90YXRpb25IaWRkZW5Qcm9wZXJ0eS5DcmVhdGVIaWRkZW4pLFxuXHRcdFx0ZGVsZXRlOiBpc0FjdGlvbkFubm90YXRlZEhpZGRlbihjb252ZXJ0ZXJDb250ZXh0LCBBbm5vdGF0aW9uSGlkZGVuUHJvcGVydHkuRGVsZXRlSGlkZGVuKSxcblx0XHRcdHVwZGF0ZTogaXNBY3Rpb25Bbm5vdGF0ZWRIaWRkZW4oY29udmVydGVyQ29udGV4dCwgQW5ub3RhdGlvbkhpZGRlblByb3BlcnR5LlVwZGF0ZUhpZGRlbilcblx0XHR9LFxuXHRcdGNyZWF0aW9uTW9kZTogY3JlYXRpb25Nb2RlLFxuXHRcdGlzRHJhZnRPclN0aWNreVN1cHBvcnRlZDogaXNEcmFmdE9yU3RpY2t5U3VwcG9ydGVkKGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdGlzVmlld1dpdGhNdWx0aXBsZVZpc3VhbGl6YXRpb25zOiB2aWV3Q29uZmlndXJhdGlvblxuXHRcdFx0PyBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnModmlld0NvbmZpZ3VyYXRpb24pXG5cdFx0XHQ6IGZhbHNlLFxuXHRcdG5ld0FjdGlvbjogZ2V0TmV3QWN0aW9uKGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uOiB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbixcblx0XHRyZXN0cmljdGlvbnM6IGdldFJlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KVxuXHR9O1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBzdGlja3kgb3IgZHJhZnQgaXMgc3VwcG9ydGVkLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaXMgc3VwcG9ydGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RyYWZ0T3JTdGlja3lTdXBwb3J0ZWQoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IGJvb2xlYW4ge1xuXHRjb25zdCBkYXRhTW9kZWxPYmplY3RQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCk7XG5cdGNvbnN0IGJJc0RyYWZ0U3VwcG9ydGVkID0gTW9kZWxIZWxwZXIuaXNPYmplY3RQYXRoRHJhZnRTdXBwb3J0ZWQoZGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdGNvbnN0IGJJc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQgPSAoZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldCBhcyBFbnRpdHlTZXQpPy5hbm5vdGF0aW9ucz8uU2Vzc2lvbj8uU3RpY2t5U2Vzc2lvblN1cHBvcnRlZFxuXHRcdD8gdHJ1ZVxuXHRcdDogZmFsc2U7XG5cblx0cmV0dXJuIGJJc0RyYWZ0U3VwcG9ydGVkIHx8IGJJc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQ7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgY29uZmlndXJlZCBuZXdBY3Rpb24gaW50byBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgbmV3IGFjdGlvbiBpbmZvXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROZXdBY3Rpb24oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCkge1xuXHRjb25zdCBjdXJyZW50RW50aXR5U2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0Y29uc3QgbmV3QWN0aW9uID0gaXNFbnRpdHlTZXQoY3VycmVudEVudGl0eVNldClcblx0XHQ/IGN1cnJlbnRFbnRpdHlTZXQuYW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdFJvb3Q/Lk5ld0FjdGlvbiA/P1xuXHRcdCAgY3VycmVudEVudGl0eVNldC5hbm5vdGF0aW9ucy5TZXNzaW9uPy5TdGlja3lTZXNzaW9uU3VwcG9ydGVkPy5OZXdBY3Rpb25cblx0XHQ6IHVuZGVmaW5lZDtcblx0Y29uc3QgbmV3QWN0aW9uTmFtZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gPSBuZXdBY3Rpb24/LnRvU3RyaW5nKCk7XG5cdGlmIChuZXdBY3Rpb25OYW1lKSB7XG5cdFx0bGV0IGF2YWlsYWJsZVByb3BlcnR5ID0gY29udmVydGVyQ29udGV4dD8uZ2V0RW50aXR5VHlwZSgpLmFjdGlvbnNbbmV3QWN0aW9uTmFtZV0/LmFubm90YXRpb25zPy5Db3JlPy5PcGVyYXRpb25BdmFpbGFibGU/LnZhbHVlT2YoKTtcblx0XHRhdmFpbGFibGVQcm9wZXJ0eSA9IGF2YWlsYWJsZVByb3BlcnR5ICE9PSB1bmRlZmluZWQgPyBhdmFpbGFibGVQcm9wZXJ0eSA6IHRydWU7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG5hbWU6IG5ld0FjdGlvbk5hbWUsXG5cdFx0XHRhdmFpbGFibGU6IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbjxib29sZWFuPihhdmFpbGFibGVQcm9wZXJ0eSBhcyB1bmtub3duIGFzIFByb3BlcnR5QW5ub3RhdGlvblZhbHVlPGJvb2xlYW4+KVxuXHRcdH07XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBhY3Rpb24gdmlzaWJpbGl0eSBjb25maWd1cmVkIGludG8gYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHNBbm5vdGF0aW9uVGVybVxuICogQHBhcmFtIGJXaXRoTmF2aWdhdGlvblBhdGhcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBhY3Rpb24gdmlzaWJpbGl0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNBY3Rpb25Bbm5vdGF0ZWRIaWRkZW4oXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHNBbm5vdGF0aW9uVGVybToga2V5b2YgRW50aXR5U2V0QW5ub3RhdGlvbnNfVUksXG5cdGJXaXRoTmF2aWdhdGlvblBhdGggPSB0cnVlXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRjb25zdCBjdXJyZW50RW50aXR5U2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0Y29uc3QgZGF0YU1vZGVsT2JqZWN0UGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpO1xuXHQvLyBDb25zaWRlciBvbmx5IHRoZSBsYXN0IGxldmVsIG9mIG5hdmlnYXRpb24uIFRoZSBvdGhlcnMgYXJlIGFscmVhZHkgY29uc2lkZXJlZCBpbiB0aGUgZWxlbWVudCBiaW5kaW5nIG9mIHRoZSBwYWdlLlxuXHRjb25zdCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzID1cblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmxlbmd0aCA+IDAgJiYgYldpdGhOYXZpZ2F0aW9uUGF0aFxuXHRcdFx0PyBbZGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllc1tkYXRhTW9kZWxPYmplY3RQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmxlbmd0aCAtIDFdLm5hbWVdXG5cdFx0XHQ6IFtdO1xuXHRjb25zdCBhY3Rpb25Bbm5vdGF0aW9uVmFsdWUgPVxuXHRcdCgoY3VycmVudEVudGl0eVNldD8uYW5ub3RhdGlvbnMuVUkgYXMgRW50aXR5U2V0QW5ub3RhdGlvbnNfVUkpPy5bc0Fubm90YXRpb25UZXJtXSBhcyBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZTxib29sZWFuPikgfHwgZmFsc2U7XG5cblx0cmV0dXJuIGN1cnJlbnRFbnRpdHlTZXRcblx0XHQ/IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihhY3Rpb25Bbm5vdGF0aW9uVmFsdWUsIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHVuZGVmaW5lZCwgKHBhdGg6IHN0cmluZykgPT5cblx0XHRcdFx0c2luZ2xldG9uUGF0aFZpc2l0b3IocGF0aCwgY29udmVydGVyQ29udGV4dC5nZXRDb252ZXJ0ZWRUeXBlcygpLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzKVxuXHRcdCAgKVxuXHRcdDogY29uc3RhbnQoZmFsc2UpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGFubm90YXRlZCByZXN0cmljdGlvbnMgZm9yIHRoZSBhY3Rpb25zLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgcmVzdHJpY3Rpb24gaW5mb3JtYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogU3RhbmRhcmRBY3Rpb25zUmVzdHJpY3Rpb25zVHlwZSB7XG5cdGNvbnN0IGRhdGFNb2RlbE9iamVjdFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKTtcblx0Y29uc3QgcmVzdHJpY3Rpb25zRGVmID0gW1xuXHRcdHtcblx0XHRcdGtleTogXCJpc0luc2VydGFibGVcIixcblx0XHRcdGZ1bmN0aW9uOiBpc1BhdGhJbnNlcnRhYmxlXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRrZXk6IFwiaXNVcGRhdGFibGVcIixcblx0XHRcdGZ1bmN0aW9uOiBpc1BhdGhVcGRhdGFibGVcblx0XHR9LFxuXHRcdHtcblx0XHRcdGtleTogXCJpc0RlbGV0YWJsZVwiLFxuXHRcdFx0ZnVuY3Rpb246IGlzUGF0aERlbGV0YWJsZVxuXHRcdH1cblx0XTtcblx0Y29uc3QgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBFeHByZXNzaW9uUmVzdHJpY3Rpb25zVHlwZT4gPSB7fTtcblx0cmVzdHJpY3Rpb25zRGVmLmZvckVhY2goZnVuY3Rpb24gKGRlZikge1xuXHRcdGNvbnN0IGRlZkZ1bmN0aW9uID0gZGVmW1wiZnVuY3Rpb25cIl07XG5cdFx0cmVzdWx0W2RlZi5rZXldID0ge1xuXHRcdFx0ZXhwcmVzc2lvbjogZGVmRnVuY3Rpb24uYXBwbHkobnVsbCwgW1xuXHRcdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cGF0aFZpc2l0b3I6IChwYXRoOiBzdHJpbmcsIG5hdmlnYXRpb25QYXRoczogc3RyaW5nW10pID0+XG5cdFx0XHRcdFx0XHRzaW5nbGV0b25QYXRoVmlzaXRvcihwYXRoLCBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlZFR5cGVzKCksIG5hdmlnYXRpb25QYXRocylcblx0XHRcdFx0fVxuXHRcdFx0XSksXG5cdFx0XHRuYXZpZ2F0aW9uRXhwcmVzc2lvbjogZGVmRnVuY3Rpb24uYXBwbHkobnVsbCwgW1xuXHRcdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWdub3JlVGFyZ2V0Q29sbGVjdGlvbjogdHJ1ZSxcblx0XHRcdFx0XHRhdXRob3JpemVVbnJlc29sdmFibGU6IHRydWUsXG5cdFx0XHRcdFx0cGF0aFZpc2l0b3I6IChwYXRoOiBzdHJpbmcsIG5hdmlnYXRpb25QYXRoczogc3RyaW5nW10pID0+XG5cdFx0XHRcdFx0XHRzaW5nbGV0b25QYXRoVmlzaXRvcihwYXRoLCBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlZFR5cGVzKCksIG5hdmlnYXRpb25QYXRocylcblx0XHRcdFx0fVxuXHRcdFx0XSlcblx0XHR9O1xuXHR9KTtcblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGVtcGxhdGluZyBmb3IgaW5zZXJ0L3VwZGF0ZSBhY3Rpb25zIGlzIG1hbmRhdG9yeS5cbiAqXG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHBhcmFtIGlzRHJhZnRPclN0aWNreVxuICogQHJldHVybnMgVHJ1ZSBpZiB3ZSBuZWVkIHRvIHRlbXBsYXRlIGluc2VydCBvciB1cGRhdGUgYWN0aW9ucywgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnNlcnRVcGRhdGVBY3Rpb25zVGVtcGxhdGluZyhzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBpc0RyYWZ0T3JTdGlja3k6IGJvb2xlYW4pOiBib29sZWFuIHtcblx0cmV0dXJuIGlzRHJhZnRPclN0aWNreSB8fCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LmNyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLkV4dGVybmFsO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbnMgZm9yIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSAnQ3JlYXRlJyBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgc3RhbmRhcmQgYWN0aW9uIGluZm9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFN0YW5kYXJkQWN0aW9uQ3JlYXRlKFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4pOiBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGUge1xuXHRjb25zdCBjcmVhdGVWaXNpYmlsaXR5ID0gZ2V0Q3JlYXRlVmlzaWJpbGl0eShjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KTtcblx0cmV0dXJuIHtcblx0XHRpc1RlbXBsYXRlZDogY29tcGlsZUV4cHJlc3Npb24oZ2V0Q3JlYXRlVGVtcGxhdGluZyhzdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBjcmVhdGVWaXNpYmlsaXR5KSksXG5cdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24oY3JlYXRlVmlzaWJpbGl0eSksXG5cdFx0ZW5hYmxlZDogY29tcGlsZUV4cHJlc3Npb24oZ2V0Q3JlYXRlRW5hYmxlbWVudChjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBjcmVhdGVWaXNpYmlsaXR5KSlcblx0fTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb25zIGZvciB0aGUgcHJvcGVydGllcyBvZiB0aGUgJ0RlbGV0ZScgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbnMgZm9yIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSAnRGVsZXRlJyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdGFuZGFyZEFjdGlvbkRlbGV0ZShcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuKTogU3RhbmRhcmRBY3Rpb25Db25maWdUeXBlIHtcblx0Y29uc3QgZGVsZXRlVmlzaWJpbGl0eSA9IGdldERlbGV0ZVZpc2liaWxpdHkoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCk7XG5cblx0cmV0dXJuIHtcblx0XHRpc1RlbXBsYXRlZDogY29tcGlsZUV4cHJlc3Npb24oZ2V0RGVmYXVsdFRlbXBsYXRpbmcoZGVsZXRlVmlzaWJpbGl0eSkpLFxuXHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKGRlbGV0ZVZpc2liaWxpdHkpLFxuXHRcdGVuYWJsZWQ6IGNvbXBpbGVFeHByZXNzaW9uKGdldERlbGV0ZUVuYWJsZW1lbnQoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCwgZGVsZXRlVmlzaWJpbGl0eSkpXG5cdH07XG59XG5cbi8qKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcmV0dXJucyBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENyZWF0aW9uUm93KFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4pOiBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGUge1xuXHRjb25zdCBjcmVhdGlvblJvd1Zpc2liaWxpdHkgPSBnZXRDcmVhdGVWaXNpYmlsaXR5KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQsIHRydWUpO1xuXG5cdHJldHVybiB7XG5cdFx0aXNUZW1wbGF0ZWQ6IGNvbXBpbGVFeHByZXNzaW9uKGdldENyZWF0ZVRlbXBsYXRpbmcoc3RhbmRhcmRBY3Rpb25zQ29udGV4dCwgY3JlYXRpb25Sb3dWaXNpYmlsaXR5LCB0cnVlKSksXG5cdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24oY3JlYXRpb25Sb3dWaXNpYmlsaXR5KSxcblx0XHRlbmFibGVkOiBjb21waWxlRXhwcmVzc2lvbihnZXRDcmVhdGlvblJvd0VuYWJsZW1lbnQoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCwgY3JlYXRpb25Sb3dWaXNpYmlsaXR5KSlcblx0fTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb25zIGZvciB0aGUgcHJvcGVydGllcyBvZiB0aGUgJ1Bhc3RlJyBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcGFyYW0gaXNJbnNlcnRVcGRhdGVBY3Rpb25zVGVtcGxhdGVkXG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9ucyBmb3IgdGhlIHByb3BlcnRpZXMgb2YgdGhlICdQYXN0ZScgYWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3RhbmRhcmRBY3Rpb25QYXN0ZShcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0aXNJbnNlcnRVcGRhdGVBY3Rpb25zVGVtcGxhdGVkOiBib29sZWFuXG4pOiBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGUge1xuXHRjb25zdCBjcmVhdGVWaXNpYmlsaXR5ID0gZ2V0Q3JlYXRlVmlzaWJpbGl0eShjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KTtcblx0Y29uc3QgY3JlYXRlRW5hYmxlbWVudCA9IGdldENyZWF0ZUVuYWJsZW1lbnQoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCwgY3JlYXRlVmlzaWJpbGl0eSk7XG5cdGNvbnN0IHBhc3RlVmlzaWJpbGl0eSA9IGdldFBhc3RlVmlzaWJpbGl0eShjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBjcmVhdGVWaXNpYmlsaXR5LCBpc0luc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0ZWQpO1xuXHRyZXR1cm4ge1xuXHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKHBhc3RlVmlzaWJpbGl0eSksXG5cdFx0ZW5hYmxlZDogY29tcGlsZUV4cHJlc3Npb24oZ2V0UGFzdGVFbmFibGVtZW50KHBhc3RlVmlzaWJpbGl0eSwgY3JlYXRlRW5hYmxlbWVudCkpXG5cdH07XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9ucyBmb3IgdGhlIHByb3BlcnRpZXMgb2YgdGhlICdNYXNzRWRpdCcgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbnMgZm9yIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSAnTWFzc0VkaXQnIGFjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFN0YW5kYXJkQWN0aW9uTWFzc0VkaXQoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQ6IFN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbik6IFN0YW5kYXJkQWN0aW9uQ29uZmlnVHlwZSB7XG5cdGNvbnN0IG1hc3NFZGl0VmlzaWJpbGl0eSA9IGdldE1hc3NFZGl0VmlzaWJpbGl0eShjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KTtcblxuXHRyZXR1cm4ge1xuXHRcdGlzVGVtcGxhdGVkOiBjb21waWxlRXhwcmVzc2lvbihnZXREZWZhdWx0VGVtcGxhdGluZyhtYXNzRWRpdFZpc2liaWxpdHkpKSxcblx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihtYXNzRWRpdFZpc2liaWxpdHkpLFxuXHRcdGVuYWJsZWQ6IGNvbXBpbGVFeHByZXNzaW9uKGdldE1hc3NFZGl0RW5hYmxlbWVudChjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBtYXNzRWRpdFZpc2liaWxpdHkpKVxuXHR9O1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIHRlbXBsYXRpbmcgb2YgdGhlICdDcmVhdGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHBhcmFtIGNyZWF0ZVZpc2liaWxpdHlcbiAqIEBwYXJhbSBpc0ZvckNyZWF0aW9uUm93XG4gKiBAcmV0dXJucyBUaGUgY3JlYXRlIGJpbmRpbmcgZXhwcmVzc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3JlYXRlVGVtcGxhdGluZyhcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0Y3JlYXRlVmlzaWJpbGl0eTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+LFxuXHRpc0ZvckNyZWF0aW9uUm93ID0gZmFsc2Vcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdC8vVGVtcGxhdGluZyBvZiBDcmVhdGUgQnV0dG9uIGlzIG5vdCBkb25lOlxuXHQvLyBcdCAtIElmIEJ1dHRvbiBpcyBuZXZlciB2aXNpYmxlKGNvdmVyZWQgdGhlIEV4dGVybmFsIGNyZWF0ZSBidXR0b24sIG5ldyBBY3Rpb24pXG5cdC8vXHQgLSBvciBDcmVhdGlvbk1vZGUgaXMgb24gQ3JlYXRpb25Sb3cgZm9yIENyZWF0ZSBCdXR0b25cblx0Ly9cdCAtIG9yIENyZWF0aW9uTW9kZSBpcyBub3Qgb24gQ3JlYXRpb25Sb3cgZm9yIENyZWF0aW9uUm93IEJ1dHRvblxuXG5cdHJldHVybiBhbmQoXG5cdFx0Ly9YTk9SIGdhdGVcblx0XHRvcihcblx0XHRcdGFuZChpc0ZvckNyZWF0aW9uUm93LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LmNyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93KSxcblx0XHRcdGFuZCghaXNGb3JDcmVhdGlvblJvdywgc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5jcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdylcblx0XHQpLFxuXHRcdG9yKG5vdChpc0NvbnN0YW50KGNyZWF0ZVZpc2liaWxpdHkpKSwgY3JlYXRlVmlzaWJpbGl0eSlcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSB0ZW1wbGF0aW5nIG9mIHRoZSBub24tQ3JlYXRlIGFjdGlvbnMuXG4gKlxuICogQHBhcmFtIGFjdGlvblZpc2liaWxpdHlcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSB0ZW1wbGF0aW5nIG9mIHRoZSBub24tQ3JlYXRlIGFjdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0VGVtcGxhdGluZyhhY3Rpb25WaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gb3Iobm90KGlzQ29uc3RhbnQoYWN0aW9uVmlzaWJpbGl0eSkpLCBhY3Rpb25WaXNpYmlsaXR5KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdDcmVhdGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbiAqIEBwYXJhbSBpc0ZvckNyZWF0aW9uUm93XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ3Zpc2libGUnIHByb3BlcnR5IG9mIHRoZSAnQ3JlYXRlJyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDcmVhdGVWaXNpYmlsaXR5KFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0LFxuXHRpc0ZvckNyZWF0aW9uUm93ID0gZmFsc2Vcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGlzSW5zZXJ0YWJsZSA9IHN0YW5kYXJkQWN0aW9uc0NvbnRleHQucmVzdHJpY3Rpb25zLmlzSW5zZXJ0YWJsZS5leHByZXNzaW9uO1xuXHRjb25zdCBpc0NyZWF0ZUhpZGRlbiA9IGlzRm9yQ3JlYXRpb25Sb3dcblx0XHQ/IGlzQWN0aW9uQW5ub3RhdGVkSGlkZGVuKGNvbnZlcnRlckNvbnRleHQsIEFubm90YXRpb25IaWRkZW5Qcm9wZXJ0eS5DcmVhdGVIaWRkZW4sIGZhbHNlKVxuXHRcdDogc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5oaWRkZW5Bbm5vdGF0aW9uLmNyZWF0ZTtcblx0Y29uc3QgbmV3QWN0aW9uID0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5uZXdBY3Rpb247XG5cdC8vQ3JlYXRlIEJ1dHRvbiBpcyB2aXNpYmxlOlxuXHQvLyBcdCAtIElmIHRoZSBjcmVhdGlvbiBtb2RlIGlzIGV4dGVybmFsXG5cdC8vICAgICAgLSBJZiB3ZSdyZSBvbiB0aGUgbGlzdCByZXBvcnQgYW5kIGNyZWF0ZSBpcyBub3QgaGlkZGVuXG5cdC8vXHRcdC0gT3RoZXJ3aXNlIHRoaXMgZGVwZW5kcyBvbiB0aGUgdmFsdWUgb2YgdGhlIFVJLklzRWRpdGFibGVcblx0Ly9cdCAtIE90aGVyd2lzZVxuXHQvL1x0XHQtIElmIGFueSBvZiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgaXMgdmFsaWQgdGhlbiBjcmVhdGUgYnV0dG9uIGlzbid0IHZpc2libGVcblx0Ly9cdFx0XHQtIG5vIG5ld0FjdGlvbiBhdmFpbGFibGVcblx0Ly9cdFx0XHQtIEl0J3Mgbm90IGluc2VydGFibGUgYW5kIHRoZXJlIGlzIG5vdCBhIG5ldyBhY3Rpb25cblx0Ly9cdFx0XHQtIGNyZWF0ZSBpcyBoaWRkZW5cblx0Ly9cdFx0XHQtIFRoZXJlIGFyZSBtdWx0aXBsZSB2aXN1YWxpemF0aW9uc1xuXHQvL1x0XHRcdC0gSXQncyBhbiBBbmFseXRpY2FsIExpc3QgUGFnZVxuXHQvL1x0XHRcdC0gVXNlcyBJbmxpbmVDcmVhdGlvblJvd3MgbW9kZSBhbmQgYSBSZXNwb25zaXZlIHRhYmxlIHR5cGUsIHdpdGggdGhlIHBhcmFtZXRlciBpbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlIHRvIHRydWUgd2hpbGUgbm90IGluIGNyZWF0ZSBtb2RlXG5cdC8vICAgLSBPdGhlcndpc2Vcblx0Ly8gXHQgXHQtIElmIHdlJ3JlIG9uIHRoZSBsaXN0IHJlcG9ydCAtPlxuXHQvLyBcdCBcdFx0LSBJZiBVSS5DcmVhdGVIaWRkZW4gcG9pbnRzIHRvIGEgcHJvcGVydHkgcGF0aCAtPiBwcm92aWRlIGEgbmVnYXRlZCBiaW5kaW5nIHRvIHRoaXMgcGF0aFxuXHQvLyBcdCBcdFx0LSBPdGhlcndpc2UsIGNyZWF0ZSBpcyB2aXNpYmxlXG5cdC8vIFx0IFx0LSBPdGhlcndpc2Vcblx0Ly8gXHQgIFx0IC0gVGhpcyBkZXBlbmRzIG9uIHRoZSB2YWx1ZSBvZiB0aGUgVUkuSXNFZGl0YWJsZVxuXHRyZXR1cm4gaWZFbHNlKFxuXHRcdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuRXh0ZXJuYWwsXG5cdFx0YW5kKG5vdChpc0NyZWF0ZUhpZGRlbiksIG9yKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0LCBVSS5Jc0VkaXRhYmxlKSksXG5cdFx0aWZFbHNlKFxuXHRcdFx0b3IoXG5cdFx0XHRcdGFuZChpc0NvbnN0YW50KG5ld0FjdGlvbj8uYXZhaWxhYmxlKSwgZXF1YWwobmV3QWN0aW9uPy5hdmFpbGFibGUsIGZhbHNlKSksXG5cdFx0XHRcdGFuZChpc0NvbnN0YW50KGlzSW5zZXJ0YWJsZSksIGVxdWFsKGlzSW5zZXJ0YWJsZSwgZmFsc2UpLCAhbmV3QWN0aW9uKSxcblx0XHRcdFx0YW5kKGlzQ29uc3RhbnQoaXNDcmVhdGVIaWRkZW4pLCBlcXVhbChpc0NyZWF0ZUhpZGRlbiwgdHJ1ZSkpLFxuXHRcdFx0XHRhbmQoXG5cdFx0XHRcdFx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dC5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5JbmxpbmVDcmVhdGlvblJvd3MsXG5cdFx0XHRcdFx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dC50YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbj8udHlwZSA9PT0gXCJSZXNwb25zaXZlVGFibGVcIixcblx0XHRcdFx0XHRpZkVsc2UoXG5cdFx0XHRcdFx0XHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0Py50YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbj8uaW5saW5lQ3JlYXRpb25Sb3dzSGlkZGVuSW5FZGl0TW9kZSA9PT0gZmFsc2UsXG5cdFx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdFx0VUkuSXNDcmVhdGVNb2RlXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpLFxuXHRcdFx0ZmFsc2UsXG5cdFx0XHRpZkVsc2UoXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0LFxuXHRcdFx0XHRvcihub3QoaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24oaXNDcmVhdGVIaWRkZW4pKSwgbm90KGlzQ3JlYXRlSGlkZGVuKSksXG5cdFx0XHRcdGFuZChub3QoaXNDcmVhdGVIaWRkZW4pLCBVSS5Jc0VkaXRhYmxlKVxuXHRcdFx0KVxuXHRcdClcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdEZWxldGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdEZWxldGUnIGFjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlbGV0ZVZpc2liaWxpdHkoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQ6IFN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGlzRGVsZXRlSGlkZGVuID0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5oaWRkZW5Bbm5vdGF0aW9uLmRlbGV0ZTtcblx0Y29uc3QgcGF0aERlbGV0YWJsZUV4cHJlc3Npb24gPSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LnJlc3RyaWN0aW9ucy5pc0RlbGV0YWJsZS5leHByZXNzaW9uO1xuXG5cdC8vRGVsZXRlIEJ1dHRvbiBpcyB2aXNpYmxlOlxuXHQvLyBcdCBQcmVyZXF1aXNpdGVzOlxuXHQvL1x0IC0gSWYgd2UncmUgbm90IG9uIEFMUFxuXHQvLyAgIC0gSWYgcmVzdHJpY3Rpb25zIG9uIGRlbGV0YWJsZSBzZXQgdG8gZmFsc2UgLT4gbm90IHZpc2libGVcblx0Ly8gICAtIE90aGVyd2lzZVxuXHQvL1x0XHRcdC0gSWYgVUkuRGVsZXRlSGlkZGVuIGlzIHRydWUgLT4gbm90IHZpc2libGVcblx0Ly9cdFx0XHQtIE90aGVyd2lzZVxuXHQvLyBcdCBcdFx0XHQtIElmIHdlJ3JlIG9uIE9QIC0+IGRlcGVuZGluZyBpZiBVSSBpcyBlZGl0YWJsZSBhbmQgcmVzdHJpY3Rpb25zIG9uIGRlbGV0YWJsZVxuXHQvL1x0XHRcdFx0LSBPdGhlcndpc2Vcblx0Ly9cdFx0XHRcdCBcdC0gSWYgVUkuRGVsZXRlSGlkZGVuIHBvaW50cyB0byBhIHByb3BlcnR5IHBhdGggLT4gcHJvdmlkZSBhIG5lZ2F0ZWQgYmluZGluZyB0byB0aGlzIHBhdGhcblx0Ly9cdCBcdCBcdFx0IFx0LSBPdGhlcndpc2UsIGRlbGV0ZSBpcyB2aXNpYmxlXG5cblx0cmV0dXJuIGlmRWxzZShcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlLFxuXHRcdGZhbHNlLFxuXHRcdGlmRWxzZShcblx0XHRcdGFuZChpc0NvbnN0YW50KHBhdGhEZWxldGFibGVFeHByZXNzaW9uKSwgZXF1YWwocGF0aERlbGV0YWJsZUV4cHJlc3Npb24sIGZhbHNlKSksXG5cdFx0XHRmYWxzZSxcblx0XHRcdGlmRWxzZShcblx0XHRcdFx0YW5kKGlzQ29uc3RhbnQoaXNEZWxldGVIaWRkZW4pLCBlcXVhbChpc0RlbGV0ZUhpZGRlbiwgY29uc3RhbnQodHJ1ZSkpKSxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdGlmRWxzZShcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpICE9PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCxcblx0XHRcdFx0XHRhbmQobm90KGlzRGVsZXRlSGlkZGVuKSwgVUkuSXNFZGl0YWJsZSksXG5cdFx0XHRcdFx0bm90KGFuZChpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbihpc0RlbGV0ZUhpZGRlbiksIGlzRGVsZXRlSGlkZGVuKSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdClcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdQYXN0ZScgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHBhcmFtIGNyZWF0ZVZpc2liaWxpdHlcbiAqIEBwYXJhbSBpc0luc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0ZWRcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdQYXN0ZScgYWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFzdGVWaXNpYmlsaXR5KFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0LFxuXHRjcmVhdGVWaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4sXG5cdGlzSW5zZXJ0VXBkYXRlQWN0aW9uc1RlbXBsYXRlZDogYm9vbGVhblxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0Ly8gSWYgQ3JlYXRlIGlzIHZpc2libGUsIGVuYWJsZVBhc3RlIGlzIG5vdCBkaXNhYmxlZCBpbnRvIG1hbmlmZXN0IGFuZCB3ZSBhcmUgb24gT1AvYmxvY2tzIG91dHNpZGUgRmlvcmkgZWxlbWVudHMgdGVtcGxhdGVzXG5cdC8vIFRoZW4gYnV0dG9uIHdpbGwgYmUgdmlzaWJsZSBhY2NvcmRpbmcgdG8gaW5zZXJ0YWJsZSByZXN0cmljdGlvbnMgYW5kIGNyZWF0ZSB2aXNpYmlsaXR5XG5cdC8vIE90aGVyd2lzZSBpdCdzIG5vdCB2aXNpYmxlXG5cdHJldHVybiBhbmQoXG5cdFx0bm90RXF1YWwoc3RhbmRhcmRBY3Rpb25zQ29udGV4dC50YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5lbmFibGVQYXN0ZSwgZmFsc2UpLFxuXHRcdGNyZWF0ZVZpc2liaWxpdHksXG5cdFx0aXNJbnNlcnRVcGRhdGVBY3Rpb25zVGVtcGxhdGVkLFxuXHRcdFtUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCwgVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZV0uaW5kZXhPZihjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpKSA9PT0gLTEsXG5cdFx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dC5yZXN0cmljdGlvbnMuaXNJbnNlcnRhYmxlLmV4cHJlc3Npb25cblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdNYXNzRWRpdCcgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICd2aXNpYmxlJyBwcm9wZXJ0eSBvZiB0aGUgJ01hc3NFZGl0JyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXNzRWRpdFZpc2liaWxpdHkoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQ6IFN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGlzVXBkYXRlSGlkZGVuID0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5oaWRkZW5Bbm5vdGF0aW9uLnVwZGF0ZSxcblx0XHRwYXRoVXBkYXRhYmxlRXhwcmVzc2lvbiA9IHN0YW5kYXJkQWN0aW9uc0NvbnRleHQucmVzdHJpY3Rpb25zLmlzVXBkYXRhYmxlLmV4cHJlc3Npb24sXG5cdFx0Yk1hc3NFZGl0RW5hYmxlZEluTWFuaWZlc3Q6IGJvb2xlYW4gPSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LnRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uPy5lbmFibGVNYXNzRWRpdCB8fCBmYWxzZTtcblx0Y29uc3QgdGVtcGxhdGVCaW5kaW5nRXhwcmVzc2lvbiA9XG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLk9iamVjdFBhZ2Vcblx0XHRcdD8gVUkuSXNFZGl0YWJsZVxuXHRcdFx0OiBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydDtcblx0Ly9NYXNzRWRpdCBpcyB2aXNpYmxlXG5cdC8vIElmXG5cdC8vXHRcdC0gdGhlcmUgaXMgbm8gc3RhdGljIHJlc3RyaWN0aW9ucyBzZXQgdG8gZmFsc2Vcblx0Ly9cdFx0LSBhbmQgZW5hYmxlTWFzc0VkaXQgaXMgbm90IHNldCB0byBmYWxzZSBpbnRvIHRoZSBtYW5pZmVzdFxuXHQvL1x0XHQtIGFuZCB0aGUgc2VsZWN0aW9uTW9kZSBpcyByZWxldmFudFxuXHQvL1x0VGhlbiBNYXNzRWRpdCBpcyBhbHdheXMgdmlzaWJsZSBpbiBMUiBvciBkeW5hbWljYWxseSB2aXNpYmxlIGluIE9QIGFjY29yZGluZyB0byB1aT5FZGl0YWJsZSBhbmQgaGlkZGVuQW5ub3RhdGlvblxuXHQvLyAgQnV0dG9uIGlzIGhpZGRlbiBmb3IgYWxsIG90aGVyIGNhc2VzXG5cdHJldHVybiBhbmQoXG5cdFx0bm90KGFuZChpc0NvbnN0YW50KHBhdGhVcGRhdGFibGVFeHByZXNzaW9uKSwgZXF1YWwocGF0aFVwZGF0YWJsZUV4cHJlc3Npb24sIGZhbHNlKSkpLFxuXHRcdGJNYXNzRWRpdEVuYWJsZWRJbk1hbmlmZXN0LFxuXHRcdHRlbXBsYXRlQmluZGluZ0V4cHJlc3Npb24sXG5cdFx0bm90KGlzVXBkYXRlSGlkZGVuKVxuXHQpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiB0aGUgY3JlYXRpb25Sb3cuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcGFyYW0gY3JlYXRpb25Sb3dWaXNpYmlsaXR5XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSBjcmVhdGlvblJvdy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENyZWF0aW9uUm93RW5hYmxlbWVudChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0Y3JlYXRpb25Sb3dWaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IHJlc3RyaWN0aW9uc0luc2VydGFibGUgPSBpc1BhdGhJbnNlcnRhYmxlKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLCB7XG5cdFx0aWdub3JlVGFyZ2V0Q29sbGVjdGlvbjogdHJ1ZSxcblx0XHRhdXRob3JpemVVbnJlc29sdmFibGU6IHRydWUsXG5cdFx0cGF0aFZpc2l0b3I6IChwYXRoOiBzdHJpbmcsIG5hdmlnYXRpb25QYXRoczogc3RyaW5nW10pID0+IHtcblx0XHRcdGlmIChwYXRoLmluZGV4T2YoXCIvXCIpID09PSAwKSB7XG5cdFx0XHRcdHBhdGggPSBzaW5nbGV0b25QYXRoVmlzaXRvcihwYXRoLCBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlZFR5cGVzKCksIG5hdmlnYXRpb25QYXRocyk7XG5cdFx0XHRcdHJldHVybiBwYXRoO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnRpZXMgPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKS5uYXZpZ2F0aW9uUHJvcGVydGllcztcblx0XHRcdGlmIChuYXZpZ2F0aW9uUHJvcGVydGllcykge1xuXHRcdFx0XHRjb25zdCBsYXN0TmF2ID0gbmF2aWdhdGlvblByb3BlcnRpZXNbbmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoIC0gMV07XG5cdFx0XHRcdGNvbnN0IHBhcnRuZXIgPSBpc05hdmlnYXRpb25Qcm9wZXJ0eShsYXN0TmF2KSAmJiBsYXN0TmF2LnBhcnRuZXI7XG5cdFx0XHRcdGlmIChwYXJ0bmVyKSB7XG5cdFx0XHRcdFx0cGF0aCA9IGAke3BhcnRuZXJ9LyR7cGF0aH1gO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcGF0aDtcblx0XHR9XG5cdH0pO1xuXHRjb25zdCBpc0luc2VydGFibGUgPVxuXHRcdHJlc3RyaWN0aW9uc0luc2VydGFibGUuX3R5cGUgPT09IFwiVW5yZXNvbHZhYmxlXCJcblx0XHRcdD8gaXNQYXRoSW5zZXJ0YWJsZShjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSwge1xuXHRcdFx0XHRcdHBhdGhWaXNpdG9yOiAocGF0aDogc3RyaW5nKSA9PiBzaW5nbGV0b25QYXRoVmlzaXRvcihwYXRoLCBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlZFR5cGVzKCksIFtdKVxuXHRcdFx0ICB9KVxuXHRcdFx0OiByZXN0cmljdGlvbnNJbnNlcnRhYmxlO1xuXG5cdHJldHVybiBhbmQoXG5cdFx0Y3JlYXRpb25Sb3dWaXNpYmlsaXR5LFxuXHRcdGlzSW5zZXJ0YWJsZSxcblx0XHRvcihcblx0XHRcdCFzdGFuZGFyZEFjdGlvbnNDb250ZXh0LnRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGEsXG5cdFx0XHRmb3JtYXRSZXN1bHQoW3BhdGhJbk1vZGVsKFwiY3JlYXRpb25Sb3dGaWVsZFZhbGlkaXR5XCIsIFwiaW50ZXJuYWxcIildLCB0YWJsZUZvcm1hdHRlcnMudmFsaWRhdGVDcmVhdGlvblJvd0ZpZWxkcylcblx0XHQpXG5cdCk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSAnQ3JlYXRlJyBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcGFyYW0gY3JlYXRlVmlzaWJpbGl0eVxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiB0aGUgJ0NyZWF0ZScgYWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3JlYXRlRW5hYmxlbWVudChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0Y3JlYXRlVmlzaWJpbGl0eTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRsZXQgY29uZGl0aW9uO1xuXHRpZiAoc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5JbmxpbmVDcmVhdGlvblJvd3MpIHtcblx0XHQvLyBmb3IgSW5saW5lIGNyZWF0aW9uIHJvd3MgY3JlYXRlIGNhbiBiZSBoaWRkZW4gdmlhIG1hbmlmZXN0IGFuZCB0aGlzIHNob3VsZCBub3QgaW1wYWN0IGl0cyBlbmFibGVtZW50XG5cdFx0Y29uZGl0aW9uID0gbm90KHN0YW5kYXJkQWN0aW9uc0NvbnRleHQuaGlkZGVuQW5ub3RhdGlvbi5jcmVhdGUpO1xuXHR9IGVsc2Uge1xuXHRcdGNvbmRpdGlvbiA9IGNyZWF0ZVZpc2liaWxpdHk7XG5cdH1cblx0Y29uc3QgaXNJbnNlcnRhYmxlID0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5yZXN0cmljdGlvbnMuaXNJbnNlcnRhYmxlLmV4cHJlc3Npb247XG5cdGNvbnN0IENvbGxlY3Rpb25UeXBlID0gY29udmVydGVyQ29udGV4dC5yZXNvbHZlQWJzb2x1dGVQYXRoPEVudGl0eVNldD4oc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5jb2xsZWN0aW9uUGF0aCkudGFyZ2V0O1xuXHRyZXR1cm4gYW5kKFxuXHRcdGNvbmRpdGlvbixcblx0XHRvcihcblx0XHRcdGlzRW50aXR5U2V0KENvbGxlY3Rpb25UeXBlKSxcblx0XHRcdGFuZChpc0luc2VydGFibGUsIG9yKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgIT09IFRlbXBsYXRlVHlwZS5PYmplY3RQYWdlLCBVSS5Jc0VkaXRhYmxlKSlcblx0XHQpXG5cdCk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSAnRGVsZXRlJyBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcGFyYW0gZGVsZXRlVmlzaWJpbGl0eVxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiB0aGUgJ0RlbGV0ZScgYWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVsZXRlRW5hYmxlbWVudChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0ZGVsZXRlVmlzaWJpbGl0eTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRjb25zdCBkZWxldGFibGVDb250ZXh0cyA9IHBhdGhJbk1vZGVsKFwiZGVsZXRhYmxlQ29udGV4dHNcIiwgXCJpbnRlcm5hbFwiKTtcblx0Y29uc3QgdW5TYXZlZENvbnRleHRzID0gcGF0aEluTW9kZWwoXCJ1blNhdmVkQ29udGV4dHNcIiwgXCJpbnRlcm5hbFwiKTtcblx0Y29uc3QgZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSA9IHBhdGhJbk1vZGVsKFwiZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZVwiLCBcImludGVybmFsXCIpO1xuXHRjb25zdCBkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlID0gcGF0aEluTW9kZWwoXCJkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlXCIsIFwiaW50ZXJuYWxcIik7XG5cblx0cmV0dXJuIGFuZChcblx0XHRkZWxldGVWaXNpYmlsaXR5LFxuXHRcdGlmRWxzZShcblx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5PYmplY3RQYWdlLFxuXHRcdFx0b3IoXG5cdFx0XHRcdGFuZChub3RFcXVhbChkZWxldGFibGVDb250ZXh0cywgdW5kZWZpbmVkKSwgZ3JlYXRlclRoYW4obGVuZ3RoKGRlbGV0YWJsZUNvbnRleHRzKSwgMCkpLFxuXHRcdFx0XHRhbmQobm90RXF1YWwoZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSwgdW5kZWZpbmVkKSwgZ3JlYXRlclRoYW4obGVuZ3RoKGRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUpLCAwKSlcblx0XHRcdCksXG5cdFx0XHRvcihcblx0XHRcdFx0YW5kKG5vdEVxdWFsKGRlbGV0YWJsZUNvbnRleHRzLCB1bmRlZmluZWQpLCBncmVhdGVyVGhhbihsZW5ndGgoZGVsZXRhYmxlQ29udGV4dHMpLCAwKSksXG5cdFx0XHRcdGFuZChub3RFcXVhbChkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlLCB1bmRlZmluZWQpLCBncmVhdGVyVGhhbihsZW5ndGgoZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSksIDApKSxcblx0XHRcdFx0Ly8gb24gTFIsIGFsc28gZW5hYmxlIGRlbGV0ZSBidXR0b24gdG8gY2FuY2VsIGRyYWZ0c1xuXHRcdFx0XHRhbmQobm90RXF1YWwoZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZSwgdW5kZWZpbmVkKSwgZ3JlYXRlclRoYW4obGVuZ3RoKGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUpLCAwKSksXG5cdFx0XHRcdC8vIGRlbGV0YWJsZSBjb250ZXh0cyB3aXRoIHVuc2F2ZWQgY2hhbmdlcyBhcmUgY291bnRlZCBzZXBhcmF0ZWx5IChMUiBvbmx5KVxuXHRcdFx0XHRhbmQobm90RXF1YWwodW5TYXZlZENvbnRleHRzLCB1bmRlZmluZWQpLCBncmVhdGVyVGhhbihsZW5ndGgodW5TYXZlZENvbnRleHRzKSwgMCkpXG5cdFx0XHQpXG5cdFx0KVxuXHQpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiB0aGUgJ1Bhc3RlJyBhY3Rpb24uXG4gKlxuICogQHBhcmFtIHBhc3RlVmlzaWJpbGl0eVxuICogQHBhcmFtIGNyZWF0ZUVuYWJsZW1lbnRcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgb2YgdGhlICdQYXN0ZScgYWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFzdGVFbmFibGVtZW50KFxuXHRwYXN0ZVZpc2liaWxpdHk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPixcblx0Y3JlYXRlRW5hYmxlbWVudDogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gYW5kKHBhc3RlVmlzaWJpbGl0eSwgY3JlYXRlRW5hYmxlbWVudCk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSAnTWFzc0VkaXQnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbiAqIEBwYXJhbSBtYXNzRWRpdFZpc2liaWxpdHlcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgb2YgdGhlICdNYXNzRWRpdCcgYWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWFzc0VkaXRFbmFibGVtZW50KFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0LFxuXHRtYXNzRWRpdFZpc2liaWxpdHk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPlxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0Y29uc3QgcGF0aFVwZGF0YWJsZUV4cHJlc3Npb24gPSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LnJlc3RyaWN0aW9ucy5pc1VwZGF0YWJsZS5leHByZXNzaW9uO1xuXHRjb25zdCBpc09ubHlEeW5hbWljT25DdXJyZW50RW50aXR5ID1cblx0XHQhaXNDb25zdGFudChwYXRoVXBkYXRhYmxlRXhwcmVzc2lvbikgJiZcblx0XHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0LnJlc3RyaWN0aW9ucy5pc1VwZGF0YWJsZS5uYXZpZ2F0aW9uRXhwcmVzc2lvbi5fdHlwZSA9PT0gXCJVbnJlc29sdmFibGVcIjtcblx0Y29uc3QgbnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzID0gZ3JlYXRlck9yRXF1YWwocGF0aEluTW9kZWwoXCJudW1iZXJPZlNlbGVjdGVkQ29udGV4dHNcIiwgXCJpbnRlcm5hbFwiKSwgMSk7XG5cdGNvbnN0IG51bWJlck9mVXBkYXRhYmxlQ29udGV4dHMgPSBncmVhdGVyT3JFcXVhbChsZW5ndGgocGF0aEluTW9kZWwoXCJ1cGRhdGFibGVDb250ZXh0c1wiLCBcImludGVybmFsXCIpKSwgMSk7XG5cdGNvbnN0IGJJc0RyYWZ0U3VwcG9ydGVkID0gTW9kZWxIZWxwZXIuaXNPYmplY3RQYXRoRHJhZnRTdXBwb3J0ZWQoY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkpO1xuXHRjb25zdCBiRGlzcGxheU1vZGUgPSBpc0luRGlzcGxheU1vZGUoY29udmVydGVyQ29udGV4dCk7XG5cblx0Ly8gbnVtYmVyT2ZVcGRhdGFibGVDb250ZXh0cyBuZWVkcyB0byBiZSBhZGRlZCB0byB0aGUgYmluZGluZyBpbiBjYXNlXG5cdC8vIDEuIFVwZGF0ZSBpcyBkZXBlbmRlbnQgb24gY3VycmVudCBlbnRpdHkgcHJvcGVydHkgKGlzT25seUR5bmFtaWNPbkN1cnJlbnRFbnRpdHkgaXMgdHJ1ZSkuXG5cdC8vIDIuIFRoZSB0YWJsZSBpcyByZWFkIG9ubHkgYW5kIGRyYWZ0IGVuYWJsZWQobGlrZSBMUiksIGluIHRoaXMgY2FzZSBvbmx5IGFjdGl2ZSBjb250ZXh0cyBjYW4gYmUgbWFzcyBlZGl0ZWQuXG5cdC8vICAgIFNvLCB1cGRhdGUgZGVwZW5kcyBvbiAnSXNBY3RpdmVFbnRpdHknIHZhbHVlIHdoaWNoIG5lZWRzIHRvIGJlIGNoZWNrZWQgcnVudGltZS5cblx0Y29uc3QgcnVudGltZUJpbmRpbmcgPSBpZkVsc2UoXG5cdFx0b3IoYW5kKGJEaXNwbGF5TW9kZSwgYklzRHJhZnRTdXBwb3J0ZWQpLCBpc09ubHlEeW5hbWljT25DdXJyZW50RW50aXR5KSxcblx0XHRhbmQobnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzLCBudW1iZXJPZlVwZGF0YWJsZUNvbnRleHRzKSxcblx0XHRhbmQobnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzKVxuXHQpO1xuXG5cdHJldHVybiBhbmQobWFzc0VkaXRWaXNpYmlsaXR5LCBpZkVsc2UoaXNPbmx5RHluYW1pY09uQ3VycmVudEVudGl0eSwgcnVudGltZUJpbmRpbmcsIGFuZChydW50aW1lQmluZGluZywgcGF0aFVwZGF0YWJsZUV4cHJlc3Npb24pKSk7XG59XG5cbi8qKlxuICogVGVsbHMgaWYgdGhlIHRhYmxlIGluIHRlbXBsYXRlIGlzIGluIGRpc3BsYXkgbW9kZS5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHZpZXdDb25maWd1cmF0aW9uXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHRhYmxlIGlzIGluIGRpc3BsYXkgbW9kZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNJbkRpc3BsYXlNb2RlKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIHZpZXdDb25maWd1cmF0aW9uPzogVmlld1BhdGhDb25maWd1cmF0aW9uKTogYm9vbGVhbiB7XG5cdGNvbnN0IHRlbXBsYXRlVHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCk7XG5cdGlmIChcblx0XHR0ZW1wbGF0ZVR5cGUgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0IHx8XG5cdFx0dGVtcGxhdGVUeXBlID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlIHx8XG5cdFx0KHZpZXdDb25maWd1cmF0aW9uICYmIGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyh2aWV3Q29uZmlndXJhdGlvbikpXG5cdCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdC8vIHVwZGF0YWJsZSB3aWxsIGJlIGhhbmRsZWQgYXQgdGhlIHByb3BlcnR5IGxldmVsXG5cdHJldHVybiBmYWxzZTtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQStCS0Esd0JBQXdCO0VBQUEsV0FBeEJBLHdCQUF3QjtJQUF4QkEsd0JBQXdCO0lBQXhCQSx3QkFBd0I7SUFBeEJBLHdCQUF3QjtFQUFBLEdBQXhCQSx3QkFBd0IsS0FBeEJBLHdCQUF3QjtFQW9DN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sU0FBU0MsOEJBQThCLENBQzdDQyxnQkFBa0MsRUFDbENDLFlBQTBCLEVBQzFCQywwQkFBcUQsRUFDckRDLGlCQUF5QyxFQUNoQjtJQUN6QixPQUFPO01BQ05DLGNBQWMsRUFBRUMsbUJBQW1CLENBQUNMLGdCQUFnQixDQUFDTSxzQkFBc0IsRUFBRSxDQUFDO01BQzlFQyxnQkFBZ0IsRUFBRTtRQUNqQkMsTUFBTSxFQUFFQyx1QkFBdUIsQ0FBQ1QsZ0JBQWdCLEVBQUVGLHdCQUF3QixDQUFDWSxZQUFZLENBQUM7UUFDeEZDLE1BQU0sRUFBRUYsdUJBQXVCLENBQUNULGdCQUFnQixFQUFFRix3QkFBd0IsQ0FBQ2MsWUFBWSxDQUFDO1FBQ3hGQyxNQUFNLEVBQUVKLHVCQUF1QixDQUFDVCxnQkFBZ0IsRUFBRUYsd0JBQXdCLENBQUNnQixZQUFZO01BQ3hGLENBQUM7TUFDRGIsWUFBWSxFQUFFQSxZQUFZO01BQzFCYyx3QkFBd0IsRUFBRUEsd0JBQXdCLENBQUNmLGdCQUFnQixDQUFDO01BQ3BFZ0IsZ0NBQWdDLEVBQUViLGlCQUFpQixHQUNoREgsZ0JBQWdCLENBQUNpQixrQkFBa0IsRUFBRSxDQUFDQyx5QkFBeUIsQ0FBQ2YsaUJB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