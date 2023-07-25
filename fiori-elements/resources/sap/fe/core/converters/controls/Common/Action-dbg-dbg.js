/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/ID", "sap/fe/core/converters/ManifestSettings", "sap/fe/core/formatters/FPMFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper"], function (Log, BindingHelper, ConfigurableObject, ID, ManifestSettings, fpmFormatter, BindingToolkit, StableIdHelper) {
  "use strict";

  var _exports = {};
  var replaceSpecialChars = StableIdHelper.replaceSpecialChars;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var greaterOrEqual = BindingToolkit.greaterOrEqual;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var ActionType = ManifestSettings.ActionType;
  var getCustomActionID = ID.getCustomActionID;
  var Placement = ConfigurableObject.Placement;
  var bindingContextPathVisitor = BindingHelper.bindingContextPathVisitor;
  let ButtonType;
  (function (ButtonType) {
    ButtonType["Accept"] = "Accept";
    ButtonType["Attention"] = "Attention";
    ButtonType["Back"] = "Back";
    ButtonType["Critical"] = "Critical";
    ButtonType["Default"] = "Default";
    ButtonType["Emphasized"] = "Emphasized";
    ButtonType["Ghost"] = "Ghost";
    ButtonType["Negative"] = "Negative";
    ButtonType["Neutral"] = "Neutral";
    ButtonType["Reject"] = "Reject";
    ButtonType["Success"] = "Success";
    ButtonType["Transparent"] = "Transparent";
    ButtonType["Unstyled"] = "Unstyled";
    ButtonType["Up"] = "Up";
  })(ButtonType || (ButtonType = {}));
  _exports.ButtonType = ButtonType;
  /**
   * Maps an action by its key, based on the given annotation actions and manifest configuration. The result already represents the
   * merged action from both configuration sources.
   *
   * This function also returns an indication whether the action can be a menu item, saying whether it is visible or of a specific type
   * that allows this.
   *
   * @param manifestActions Actions defined in the manifest
   * @param annotationActions Actions defined through annotations
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   * @param actionKey Key to look up
   * @returns Merged action and indicator whether it can be a menu item
   */
  function mapActionByKey(manifestActions, annotationActions, hiddenActions, actionKey) {
    const annotationAction = annotationActions.find(action => action.key === actionKey);
    const manifestAction = manifestActions[actionKey];
    const resultAction = {
      ...(annotationAction ?? manifestAction)
    };

    // Annotation action and manifest configuration already has to be merged here as insertCustomElements only considers top-level actions
    if (annotationAction) {
      // If enabled or visible is not set in the manifest, use the annotation value and hence do not overwrite
      resultAction.enabled = (manifestAction === null || manifestAction === void 0 ? void 0 : manifestAction.enabled) ?? annotationAction.enabled;
      resultAction.visible = (manifestAction === null || manifestAction === void 0 ? void 0 : manifestAction.visible) ?? annotationAction.visible;
      for (const prop in manifestAction || {}) {
        const propKey = prop;
        if (!annotationAction[propKey] && propKey !== "menu") {
          resultAction[propKey] = manifestAction[propKey];
        }
      }
    }
    const canBeMenuItem = ((resultAction === null || resultAction === void 0 ? void 0 : resultAction.visible) || (resultAction === null || resultAction === void 0 ? void 0 : resultAction.type) === ActionType.DataFieldForAction || (resultAction === null || resultAction === void 0 ? void 0 : resultAction.type) === ActionType.DataFieldForIntentBasedNavigation) && !hiddenActions.find(hiddenAction => hiddenAction.key === (resultAction === null || resultAction === void 0 ? void 0 : resultAction.key));
    return {
      action: resultAction,
      canBeMenuItem
    };
  }

  /**
   * Map the default action key of a menu to its actual action configuration and identify whether this default action is a command.
   *
   * @param menuAction Menu action to map the default action for
   * @param manifestActions Actions defined in the manifest
   * @param annotationActions Actions defined through annotations
   * @param commandActions Array of command actions to push the default action to if applicable
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   */
  function mapMenuDefaultAction(menuAction, manifestActions, annotationActions, commandActions, hiddenActions) {
    const {
      action,
      canBeMenuItem
    } = mapActionByKey(manifestActions, annotationActions, hiddenActions, menuAction.defaultAction);
    if (canBeMenuItem) {
      menuAction.defaultAction = action;
    }
    if (action.command) {
      commandActions[action.key] = action;
    }
  }

  /**
   * Map the menu item keys of a menu to their actual action configurations and identify whether they are commands.
   *
   * @param menuAction Menu action to map the menu items for
   * @param manifestActions Actions defined in the manifest
   * @param annotationActions Actions defined through annotations
   * @param commandActions Array of command actions to push the menu item actions to if applicable
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   */
  function mapMenuItems(menuAction, manifestActions, annotationActions, commandActions, hiddenActions) {
    const mappedMenuItems = [];
    for (const menuItemKey of menuAction.menu ?? []) {
      const {
        action,
        canBeMenuItem
      } = mapActionByKey(manifestActions, annotationActions, hiddenActions, menuItemKey);
      if (canBeMenuItem) {
        mappedMenuItems.push(action);
      }
      if (action.command) {
        commandActions[menuItemKey] = action;
      }
    }
    menuAction.menu = mappedMenuItems;

    // If the menu is set to invisible, it should be invisible, otherwise the visibility should be calculated from the items
    const visibleExpressions = mappedMenuItems.map(menuItem => resolveBindingString(menuItem.visible, "boolean"));
    menuAction.visible = compileExpression(and(resolveBindingString(menuAction.visible, "boolean"), or(...visibleExpressions)));
  }

  /**
   * Transforms the flat collection of actions into a nested structures of menus. The result is a record of actions that are either menus or
   * ones that do not appear in menus as menu items. It also returns a list of actions that have an assigned command.
   *
   * Note that menu items are already the merged result of annotation actions and their manifest configuration, as {@link insertCustomElements}
   * only considers root-level actions.
   *
   * @param manifestActions Actions defined in the manifest
   * @param annotationActions Actions defined through annotations
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   * @returns The transformed actions from the manifest and a list of command actions
   */
  function transformMenuActionsAndIdentifyCommands(manifestActions, annotationActions, hiddenActions) {
    const allActions = {};
    const actionKeysToDelete = [];
    const commandActions = {};
    for (const actionKey in manifestActions) {
      const manifestAction = manifestActions[actionKey];
      if (manifestAction.defaultAction !== undefined) {
        mapMenuDefaultAction(manifestAction, manifestActions, annotationActions, commandActions, hiddenActions);
      }
      if (manifestAction.type === ActionType.Menu) {
        var _manifestAction$menu;
        // Menu items should not appear as top-level actions themselves
        actionKeysToDelete.push(...manifestAction.menu);
        mapMenuItems(manifestAction, manifestActions, annotationActions, commandActions, hiddenActions);

        // Menu has no visible items, so remove it
        if (!((_manifestAction$menu = manifestAction.menu) !== null && _manifestAction$menu !== void 0 && _manifestAction$menu.length)) {
          actionKeysToDelete.push(manifestAction.key);
        }
      }
      if (manifestAction.command) {
        commandActions[actionKey] = manifestAction;
      }
      allActions[actionKey] = manifestAction;
    }
    actionKeysToDelete.forEach(actionKey => delete allActions[actionKey]);
    return {
      actions: allActions,
      commandActions: commandActions
    };
  }

  /**
   * Gets the binding expression for the enablement of a manifest action.
   *
   * @param manifestAction The action configured in the manifest
   * @param isAnnotationAction Whether the action, defined in manifest, corresponds to an existing annotation action.
   * @param converterContext
   * @returns Determined property value for the enablement
   */
  const _getManifestEnabled = function (manifestAction, isAnnotationAction, converterContext) {
    if (isAnnotationAction && manifestAction.enabled === undefined) {
      // If annotation action has no property defined in manifest,
      // do not overwrite it with manifest action's default value.
      return undefined;
    }
    const result = getManifestActionBooleanPropertyWithFormatter(manifestAction.enabled, converterContext);

    // Consider requiresSelection property to include selectedContexts in the binding expression
    return compileExpression(ifElse(manifestAction.requiresSelection === true, and(greaterOrEqual(pathInModel("numberOfSelectedContexts", "internal"), 1), result), result));
  };

  /**
   * Gets the binding expression for the visibility of a manifest action.
   *
   * @param manifestAction The action configured in the manifest
   * @param isAnnotationAction Whether the action, defined in manifest, corresponds to an existing annotation action.
   * @param converterContext
   * @returns Determined property value for the visibility
   */
  const _getManifestVisible = function (manifestAction, isAnnotationAction, converterContext) {
    if (isAnnotationAction && manifestAction.visible === undefined) {
      // If annotation action has no property defined in manifest,
      // do not overwrite it with manifest action's default value.
      return undefined;
    }
    const result = getManifestActionBooleanPropertyWithFormatter(manifestAction.visible, converterContext);
    return compileExpression(result);
  };

  /**
   * As some properties should not be overridable by the manifest, make sure that the manifest configuration gets the annotation values for these.
   *
   * @param manifestAction Action defined in the manifest
   * @param annotationAction Action defined through annotations
   */
  function overrideManifestConfigurationWithAnnotation(manifestAction, annotationAction) {
    if (!annotationAction) {
      return;
    }

    // Do not override the 'type' given in an annotation action
    manifestAction.type = annotationAction.type;
    manifestAction.annotationPath = annotationAction.annotationPath;
    manifestAction.press = annotationAction.press;

    // Only use the annotation values for enablement and visibility if not set in the manifest
    manifestAction.enabled = manifestAction.enabled ?? annotationAction.enabled;
    manifestAction.visible = manifestAction.visible ?? annotationAction.visible;
  }

  /**
   * Hide an action if it is a hidden header action.
   *
   * @param action The action to hide
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   */
  function hideActionIfHiddenAction(action, hiddenActions) {
    if (hiddenActions !== null && hiddenActions !== void 0 && hiddenActions.find(hiddenAction => hiddenAction.key === action.key)) {
      action.visible = "false";
    }
  }

  /**
   * Creates the action configuration based on the manifest settings.
   *
   * @param manifestActions The manifest actions
   * @param converterContext The converter context
   * @param annotationActions The annotation actions definition
   * @param navigationSettings The navigation settings
   * @param considerNavigationSettings The navigation settings to be considered
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   * @param facetName The facet where an action is displayed if it is inline
   * @returns The actions from the manifest
   */
  function getActionsFromManifest(manifestActions, converterContext, annotationActions, navigationSettings, considerNavigationSettings, hiddenActions, facetName) {
    const actions = {};
    for (const actionKey in manifestActions) {
      var _manifestAction$press, _manifestAction$posit;
      const manifestAction = manifestActions[actionKey];
      const lastDotIndex = ((_manifestAction$press = manifestAction.press) === null || _manifestAction$press === void 0 ? void 0 : _manifestAction$press.lastIndexOf(".")) || -1;
      const oAnnotationAction = annotationActions === null || annotationActions === void 0 ? void 0 : annotationActions.find(obj => obj.key === actionKey);

      // To identify the annotation action property overwrite via manifest use-case.
      const isAnnotationAction = !!oAnnotationAction;
      if (manifestAction.facetName) {
        facetName = manifestAction.facetName;
      }
      actions[actionKey] = {
        id: oAnnotationAction ? actionKey : getCustomActionID(actionKey),
        type: manifestAction.menu ? ActionType.Menu : ActionType.Default,
        visible: _getManifestVisible(manifestAction, isAnnotationAction, converterContext),
        enabled: _getManifestEnabled(manifestAction, isAnnotationAction, converterContext),
        handlerModule: manifestAction.press && manifestAction.press.substring(0, lastDotIndex).replace(/\./gi, "/"),
        handlerMethod: manifestAction.press && manifestAction.press.substring(lastDotIndex + 1),
        press: manifestAction.press,
        text: manifestAction.text,
        noWrap: manifestAction.__noWrap,
        key: replaceSpecialChars(actionKey),
        enableOnSelect: manifestAction.enableOnSelect,
        defaultValuesExtensionFunction: manifestAction.defaultValuesFunction,
        position: {
          anchor: (_manifestAction$posit = manifestAction.position) === null || _manifestAction$posit === void 0 ? void 0 : _manifestAction$posit.anchor,
          placement: manifestAction.position === undefined ? Placement.After : manifestAction.position.placement
        },
        isNavigable: isActionNavigable(manifestAction, navigationSettings, considerNavigationSettings),
        command: manifestAction.command,
        requiresSelection: manifestAction.requiresSelection === undefined ? false : manifestAction.requiresSelection,
        enableAutoScroll: enableAutoScroll(manifestAction),
        menu: manifestAction.menu ?? [],
        facetName: manifestAction.inline ? facetName : undefined,
        defaultAction: manifestAction.defaultAction
      };
      overrideManifestConfigurationWithAnnotation(actions[actionKey], oAnnotationAction);
      hideActionIfHiddenAction(actions[actionKey], hiddenActions);
    }
    return transformMenuActionsAndIdentifyCommands(actions, annotationActions ?? [], hiddenActions ?? []);
  }

  /**
   * Gets a binding expression representing a Boolean manifest property that can either be represented by a static value, a binding string,
   * or a runtime formatter function.
   *
   * @param propertyValue String representing the configured property value
   * @param converterContext
   * @returns A binding expression representing the property
   */
  _exports.getActionsFromManifest = getActionsFromManifest;
  function getManifestActionBooleanPropertyWithFormatter(propertyValue, converterContext) {
    const resolvedBinding = resolveBindingString(propertyValue, "boolean");
    let result;
    if (isConstant(resolvedBinding) && resolvedBinding.value === undefined) {
      // No property value configured in manifest for the custom action --> default value is true
      result = constant(true);
    } else if (isConstant(resolvedBinding) && typeof resolvedBinding.value === "string") {
      var _converterContext$get;
      // Then it's a module-method reference "sap.xxx.yyy.doSomething"
      const methodPath = resolvedBinding.value;
      // FIXME: The custom "isEnabled" check does not trigger (because none of the bound values changes)
      result = formatResult([pathInModel("/", "$view"), methodPath, pathInModel("selectedContexts", "internal")], fpmFormatter.customBooleanPropertyCheck, ((_converterContext$get = converterContext.getDataModelObjectPath().contextLocation) === null || _converterContext$get === void 0 ? void 0 : _converterContext$get.targetEntityType) || converterContext.getEntityType());
    } else {
      // then it's a binding
      result = resolvedBinding;
    }
    return result;
  }
  const removeDuplicateActions = actions => {
    let oMenuItemKeys = {};
    actions.forEach(action => {
      var _action$menu;
      if (action !== null && action !== void 0 && (_action$menu = action.menu) !== null && _action$menu !== void 0 && _action$menu.length) {
        const actionMenu = action.menu;
        oMenuItemKeys = actionMenu.reduce((item, _ref) => {
          let {
            key
          } = _ref;
          if (key && !item[key]) {
            item[key] = true;
          }
          return item;
        }, oMenuItemKeys);
      }
    });
    return actions.filter(action => !oMenuItemKeys[action.key]);
  };

  /**
   * Method to determine the value of the 'enabled' property of an annotation-based action.
   *
   * @param converterContext The instance of the converter context
   * @param actionTarget The instance of the action
   * @returns The binding expression for the 'enabled' property of the action button.
   */
  _exports.removeDuplicateActions = removeDuplicateActions;
  function getEnabledForAnnotationAction(converterContext, actionTarget) {
    var _actionTarget$paramet, _actionTarget$annotat, _actionTarget$annotat2;
    const bindingParameterFullName = actionTarget !== null && actionTarget !== void 0 && actionTarget.isBound ? actionTarget === null || actionTarget === void 0 ? void 0 : (_actionTarget$paramet = actionTarget.parameters[0]) === null || _actionTarget$paramet === void 0 ? void 0 : _actionTarget$paramet.fullyQualifiedName : undefined;
    const operationAvailableExpression = getExpressionFromAnnotation(actionTarget === null || actionTarget === void 0 ? void 0 : (_actionTarget$annotat = actionTarget.annotations.Core) === null || _actionTarget$annotat === void 0 ? void 0 : _actionTarget$annotat.OperationAvailable, [], undefined, path => bindingContextPathVisitor(path, converterContext, bindingParameterFullName));
    if ((actionTarget === null || actionTarget === void 0 ? void 0 : (_actionTarget$annotat2 = actionTarget.annotations.Core) === null || _actionTarget$annotat2 === void 0 ? void 0 : _actionTarget$annotat2.OperationAvailable) !== undefined) {
      return compileExpression(equal(operationAvailableExpression, true));
    }
    return "true";
  }
  _exports.getEnabledForAnnotationAction = getEnabledForAnnotationAction;
  function getSemanticObjectMapping(mappings) {
    return mappings ? mappings.map(mapping => {
      return {
        LocalProperty: {
          $PropertyPath: mapping.LocalProperty.value
        },
        SemanticObjectProperty: mapping.SemanticObjectProperty
      };
    }) : [];
  }
  _exports.getSemanticObjectMapping = getSemanticObjectMapping;
  function isActionNavigable(action, navigationSettings, considerNavigationSettings) {
    var _action$afterExecutio, _action$afterExecutio2;
    let bIsNavigationConfigured = true;
    if (considerNavigationSettings) {
      const detailOrDisplay = navigationSettings && (navigationSettings.detail || navigationSettings.display);
      bIsNavigationConfigured = detailOrDisplay !== null && detailOrDisplay !== void 0 && detailOrDisplay.route ? true : false;
    }
    // when enableAutoScroll is true the navigateToInstance feature is disabled
    if (action && action.afterExecution && (((_action$afterExecutio = action.afterExecution) === null || _action$afterExecutio === void 0 ? void 0 : _action$afterExecutio.navigateToInstance) === false || ((_action$afterExecutio2 = action.afterExecution) === null || _action$afterExecutio2 === void 0 ? void 0 : _action$afterExecutio2.enableAutoScroll) === true) || !bIsNavigationConfigured) {
      return false;
    }
    return true;
  }
  _exports.isActionNavigable = isActionNavigable;
  function enableAutoScroll(action) {
    var _action$afterExecutio3;
    return (action === null || action === void 0 ? void 0 : (_action$afterExecutio3 = action.afterExecution) === null || _action$afterExecutio3 === void 0 ? void 0 : _action$afterExecutio3.enableAutoScroll) === true;
  }
  _exports.enableAutoScroll = enableAutoScroll;
  function dataFieldIsCopyAction(dataField) {
    var _dataField$annotation, _dataField$annotation2, _dataField$annotation3;
    return ((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.IsCopyAction) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()) === true && dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction";
  }
  _exports.dataFieldIsCopyAction = dataFieldIsCopyAction;
  function getCopyAction(copyDataFields) {
    if (copyDataFields.length === 1) {
      return copyDataFields[0];
    }
    if (copyDataFields.length > 1) {
      Log.error("Multiple actions are annotated with isCopyAction. There can be only one standard copy action.");
    }
    return undefined;
  }
  _exports.getCopyAction = getCopyAction;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdXR0b25UeXBlIiwibWFwQWN0aW9uQnlLZXkiLCJtYW5pZmVzdEFjdGlvbnMiLCJhbm5vdGF0aW9uQWN0aW9ucyIsImhpZGRlbkFjdGlvbnMiLCJhY3Rpb25LZXkiLCJhbm5vdGF0aW9uQWN0aW9uIiwiZmluZCIsImFjdGlvbiIsImtleSIsIm1hbmlmZXN0QWN0aW9uIiwicmVzdWx0QWN0aW9uIiwiZW5hYmxlZCIsInZpc2libGUiLCJwcm9wIiwicHJvcEtleSIsImNhbkJlTWVudUl0ZW0iLCJ0eXBlIiwiQWN0aW9uVHlwZSIsIkRhdGFGaWVsZEZvckFjdGlvbiIsIkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiIsImhpZGRlbkFjdGlvbiIsIm1hcE1lbnVEZWZhdWx0QWN0aW9uIiwibWVudUFjdGlvbiIsImNvbW1hbmRBY3Rpb25zIiwiZGVmYXVsdEFjdGlvbiIsImNvbW1hbmQiLCJtYXBNZW51SXRlbXMiLCJtYXBwZWRNZW51SXRlbXMiLCJtZW51SXRlbUtleSIsIm1lbnUiLCJwdXNoIiwidmlzaWJsZUV4cHJlc3Npb25zIiwibWFwIiwibWVudUl0ZW0iLCJyZXNvbHZlQmluZGluZ1N0cmluZyIsImNvbXBpbGVFeHByZXNzaW9uIiwiYW5kIiwib3IiLCJ0cmFuc2Zvcm1NZW51QWN0aW9uc0FuZElkZW50aWZ5Q29tbWFuZHMiLCJhbGxBY3Rpb25zIiwiYWN0aW9uS2V5c1RvRGVsZXRlIiwidW5kZWZpbmVkIiwiTWVudSIsImxlbmd0aCIsImZvckVhY2giLCJhY3Rpb25zIiwiX2dldE1hbmlmZXN0RW5hYmxlZCIsImlzQW5ub3RhdGlvbkFjdGlvbiIsImNvbnZlcnRlckNvbnRleHQiLCJyZXN1bHQiLCJnZXRNYW5pZmVzdEFjdGlvbkJvb2xlYW5Qcm9wZXJ0eVdpdGhGb3JtYXR0ZXIiLCJpZkVsc2UiLCJyZXF1aXJlc1NlbGVjdGlvbiIsImdyZWF0ZXJPckVxdWFsIiwicGF0aEluTW9kZWwiLCJfZ2V0TWFuaWZlc3RWaXNpYmxlIiwib3ZlcnJpZGVNYW5pZmVzdENvbmZpZ3VyYXRpb25XaXRoQW5ub3RhdGlvbiIsImFubm90YXRpb25QYXRoIiwicHJlc3MiLCJoaWRlQWN0aW9uSWZIaWRkZW5BY3Rpb24iLCJnZXRBY3Rpb25zRnJvbU1hbmlmZXN0IiwibmF2aWdhdGlvblNldHRpbmdzIiwiY29uc2lkZXJOYXZpZ2F0aW9uU2V0dGluZ3MiLCJmYWNldE5hbWUiLCJsYXN0RG90SW5kZXgiLCJsYXN0SW5kZXhPZiIsIm9Bbm5vdGF0aW9uQWN0aW9uIiwib2JqIiwiaWQiLCJnZXRDdXN0b21BY3Rpb25JRCIsIkRlZmF1bHQiLCJoYW5kbGVyTW9kdWxlIiwic3Vic3RyaW5nIiwicmVwbGFjZSIsImhhbmRsZXJNZXRob2QiLCJ0ZXh0Iiwibm9XcmFwIiwiX19ub1dyYXAiLCJyZXBsYWNlU3BlY2lhbENoYXJzIiwiZW5hYmxlT25TZWxlY3QiLCJkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24iLCJkZWZhdWx0VmFsdWVzRnVuY3Rpb24iLCJwb3NpdGlvbiIsImFuY2hvciIsInBsYWNlbWVudCIsIlBsYWNlbWVudCIsIkFmdGVyIiwiaXNOYXZpZ2FibGUiLCJpc0FjdGlvbk5hdmlnYWJsZSIsImVuYWJsZUF1dG9TY3JvbGwiLCJpbmxpbmUiLCJwcm9wZXJ0eVZhbHVlIiwicmVzb2x2ZWRCaW5kaW5nIiwiaXNDb25zdGFudCIsInZhbHVlIiwiY29uc3RhbnQiLCJtZXRob2RQYXRoIiwiZm9ybWF0UmVzdWx0IiwiZnBtRm9ybWF0dGVyIiwiY3VzdG9tQm9vbGVhblByb3BlcnR5Q2hlY2siLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoIiwiY29udGV4dExvY2F0aW9uIiwidGFyZ2V0RW50aXR5VHlwZSIsImdldEVudGl0eVR5cGUiLCJyZW1vdmVEdXBsaWNhdGVBY3Rpb25zIiwib01lbnVJdGVtS2V5cyIsImFjdGlvbk1lbnUiLCJyZWR1Y2UiLCJpdGVtIiwiZmlsdGVyIiwiZ2V0RW5hYmxlZEZvckFubm90YXRpb25BY3Rpb24iLCJhY3Rpb25UYXJnZXQiLCJiaW5kaW5nUGFyYW1ldGVyRnVsbE5hbWUiLCJpc0JvdW5kIiwicGFyYW1ldGVycyIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsIm9wZXJhdGlvbkF2YWlsYWJsZUV4cHJlc3Npb24iLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJhbm5vdGF0aW9ucyIsIkNvcmUiLCJPcGVyYXRpb25BdmFpbGFibGUiLCJwYXRoIiwiYmluZGluZ0NvbnRleHRQYXRoVmlzaXRvciIsImVxdWFsIiwiZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nIiwibWFwcGluZ3MiLCJtYXBwaW5nIiwiTG9jYWxQcm9wZXJ0eSIsIiRQcm9wZXJ0eVBhdGgiLCJTZW1hbnRpY09iamVjdFByb3BlcnR5IiwiYklzTmF2aWdhdGlvbkNvbmZpZ3VyZWQiLCJkZXRhaWxPckRpc3BsYXkiLCJkZXRhaWwiLCJkaXNwbGF5Iiwicm91dGUiLCJhZnRlckV4ZWN1dGlvbiIsIm5hdmlnYXRlVG9JbnN0YW5jZSIsImRhdGFGaWVsZElzQ29weUFjdGlvbiIsImRhdGFGaWVsZCIsIlVJIiwiSXNDb3B5QWN0aW9uIiwidmFsdWVPZiIsIiRUeXBlIiwiZ2V0Q29weUFjdGlvbiIsImNvcHlEYXRhRmllbGRzIiwiTG9nIiwiZXJyb3IiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkFjdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFjdGlvbiB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBTZW1hbnRpY09iamVjdE1hcHBpbmdUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCB0eXBlIHsgRGF0YUZpZWxkRm9yQWN0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgYmluZGluZ0NvbnRleHRQYXRoVmlzaXRvciB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQmluZGluZ0hlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBDb25maWd1cmFibGVPYmplY3QsIEN1c3RvbUVsZW1lbnQsIE92ZXJyaWRlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBQbGFjZW1lbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgZ2V0Q3VzdG9tQWN0aW9uSUQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0lEXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEN1c3RvbURlZmluZWRUYWJsZUNvbHVtbkZvck92ZXJyaWRlLFxuXHRNYW5pZmVzdEFjdGlvbixcblx0TmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvblxufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IGZwbUZvcm1hdHRlciBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9GUE1Gb3JtYXR0ZXJcIjtcbmltcG9ydCB7XG5cdGFuZCxcblx0QmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLFxuXHRDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbixcblx0Y29tcGlsZUV4cHJlc3Npb24sXG5cdGNvbnN0YW50LFxuXHRlcXVhbCxcblx0Zm9ybWF0UmVzdWx0LFxuXHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sXG5cdGdyZWF0ZXJPckVxdWFsLFxuXHRpZkVsc2UsXG5cdGlzQ29uc3RhbnQsXG5cdG9yLFxuXHRwYXRoSW5Nb2RlbCxcblx0cmVzb2x2ZUJpbmRpbmdTdHJpbmdcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IHJlcGxhY2VTcGVjaWFsQ2hhcnMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgeyBNZXRhTW9kZWxUeXBlIH0gZnJvbSBcInR5cGVzL21ldGFtb2RlbF90eXBlc1wiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vLi4vQ29udmVydGVyQ29udGV4dFwiO1xuXG5leHBvcnQgZW51bSBCdXR0b25UeXBlIHtcblx0QWNjZXB0ID0gXCJBY2NlcHRcIixcblx0QXR0ZW50aW9uID0gXCJBdHRlbnRpb25cIixcblx0QmFjayA9IFwiQmFja1wiLFxuXHRDcml0aWNhbCA9IFwiQ3JpdGljYWxcIixcblx0RGVmYXVsdCA9IFwiRGVmYXVsdFwiLFxuXHRFbXBoYXNpemVkID0gXCJFbXBoYXNpemVkXCIsXG5cdEdob3N0ID0gXCJHaG9zdFwiLFxuXHROZWdhdGl2ZSA9IFwiTmVnYXRpdmVcIixcblx0TmV1dHJhbCA9IFwiTmV1dHJhbFwiLFxuXHRSZWplY3QgPSBcIlJlamVjdFwiLFxuXHRTdWNjZXNzID0gXCJTdWNjZXNzXCIsXG5cdFRyYW5zcGFyZW50ID0gXCJUcmFuc3BhcmVudFwiLFxuXHRVbnN0eWxlZCA9IFwiVW5zdHlsZWRcIixcblx0VXAgPSBcIlVwXCJcbn1cblxuZXhwb3J0IHR5cGUgQmFzZUFjdGlvbiA9IENvbmZpZ3VyYWJsZU9iamVjdCAmIHtcblx0aWQ/OiBzdHJpbmc7XG5cdHRleHQ/OiBzdHJpbmc7XG5cdHR5cGU/OiBBY3Rpb25UeXBlO1xuXHRwcmVzcz86IHN0cmluZztcblx0ZW5hYmxlZD86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHR2aXNpYmxlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGVuYWJsZU9uU2VsZWN0Pzogc3RyaW5nO1xuXHRhbm5vdGF0aW9uUGF0aD86IHN0cmluZztcblx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uPzogc3RyaW5nO1xuXHRpc05hdmlnYWJsZT86IGJvb2xlYW47XG5cdGVuYWJsZUF1dG9TY3JvbGw/OiBib29sZWFuO1xuXHRyZXF1aXJlc0RpYWxvZz86IHN0cmluZztcblx0YmluZGluZz86IHN0cmluZztcblx0YnV0dG9uVHlwZT86IEJ1dHRvblR5cGUuR2hvc3QgfCBCdXR0b25UeXBlLlRyYW5zcGFyZW50IHwgc3RyaW5nO1xuXHRwYXJlbnRFbnRpdHlEZWxldGVFbmFibGVkPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdG1lbnU/OiAoc3RyaW5nIHwgQmFzZUFjdGlvbilbXTtcblx0ZmFjZXROYW1lPzogc3RyaW5nO1xuXHRjb21tYW5kPzogc3RyaW5nIHwgdW5kZWZpbmVkO1xufTtcblxuZXhwb3J0IHR5cGUgQW5ub3RhdGlvbkFjdGlvbiA9IEJhc2VBY3Rpb24gJiB7XG5cdHR5cGU6IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIHwgQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JBY3Rpb247XG5cdGFubm90YXRpb25QYXRoOiBzdHJpbmc7XG5cdGlkPzogc3RyaW5nO1xuXHRjdXN0b21EYXRhPzogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBEZWZpbml0aW9uIGZvciBjdXN0b20gYWN0aW9uc1xuICpcbiAqIEB0eXBlZGVmIEN1c3RvbUFjdGlvblxuICovXG5leHBvcnQgdHlwZSBDdXN0b21BY3Rpb24gPSBDdXN0b21FbGVtZW50PFxuXHRCYXNlQWN0aW9uICYge1xuXHRcdGhhbmRsZXJNZXRob2Q/OiBzdHJpbmc7XG5cdFx0aGFuZGxlck1vZHVsZT86IHN0cmluZztcblx0XHRub1dyYXA/OiBib29sZWFuOyAvLyBJbmRpY2F0ZXMgdGhhdCB3ZSB3YW50IHRvIGF2b2lkIHRoZSB3cmFwcGluZyBmcm9tIHRoZSBGUE1IZWxwZXJcblx0XHRyZXF1aXJlc1NlbGVjdGlvbj86IGJvb2xlYW47XG5cdFx0ZGVmYXVsdEFjdGlvbj86IHN0cmluZyB8IEN1c3RvbUFjdGlvbiB8IEJhc2VBY3Rpb247IC8vSW5kaWNhdGVzIHdoZXRoZXIgYSBkZWZhdWx0IGFjdGlvbiBleGlzdHMgaW4gdGhpcyBjb250ZXh0XG5cdH1cbj47XG5cbi8vIFJldXNlIG9mIENvbmZpZ3VyYWJsZU9iamVjdCBhbmQgQ3VzdG9tRWxlbWVudCBpcyBkb25lIGZvciBvcmRlcmluZ1xuZXhwb3J0IHR5cGUgQ29udmVydGVyQWN0aW9uID0gQW5ub3RhdGlvbkFjdGlvbiB8IEN1c3RvbUFjdGlvbjtcblxuZXhwb3J0IHR5cGUgQ29tYmluZWRBY3Rpb24gPSB7XG5cdGFjdGlvbnM6IEJhc2VBY3Rpb25bXTtcblx0Y29tbWFuZEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj47XG59O1xuXG5leHBvcnQgdHlwZSBPdmVycmlkZVR5cGVBY3Rpb24gPSB7XG5cdGVuYWJsZUF1dG9TY3JvbGw/OiBPdmVycmlkZVR5cGUub3ZlcndyaXRlO1xuXHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24/OiBPdmVycmlkZVR5cGUub3ZlcndyaXRlO1xuXHRpc05hdmlnYWJsZT86IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGU7XG5cdGVuYWJsZU9uU2VsZWN0PzogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZTtcblxuXHQvLyBDYW4gYmUgb3ZlcndyaXR0ZW4gYnkgbWFuaWZlc3QgY29uZmlndXJhdGlvbiBhbmQgc2hvdWxkIGJlIGFsaWduZWQgZm9yIGFsbCBhY3Rpb25zXG5cdGVuYWJsZWQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGU7XG5cdHZpc2libGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGU7XG5cdGNvbW1hbmQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGU7XG59O1xuXG4vKipcbiAqIE1hcHMgYW4gYWN0aW9uIGJ5IGl0cyBrZXksIGJhc2VkIG9uIHRoZSBnaXZlbiBhbm5vdGF0aW9uIGFjdGlvbnMgYW5kIG1hbmlmZXN0IGNvbmZpZ3VyYXRpb24uIFRoZSByZXN1bHQgYWxyZWFkeSByZXByZXNlbnRzIHRoZVxuICogbWVyZ2VkIGFjdGlvbiBmcm9tIGJvdGggY29uZmlndXJhdGlvbiBzb3VyY2VzLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gYWxzbyByZXR1cm5zIGFuIGluZGljYXRpb24gd2hldGhlciB0aGUgYWN0aW9uIGNhbiBiZSBhIG1lbnUgaXRlbSwgc2F5aW5nIHdoZXRoZXIgaXQgaXMgdmlzaWJsZSBvciBvZiBhIHNwZWNpZmljIHR5cGVcbiAqIHRoYXQgYWxsb3dzIHRoaXMuXG4gKlxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBBY3Rpb25zIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG4gKiBAcGFyYW0gYW5ub3RhdGlvbkFjdGlvbnMgQWN0aW9ucyBkZWZpbmVkIHRocm91Z2ggYW5ub3RhdGlvbnNcbiAqIEBwYXJhbSBoaWRkZW5BY3Rpb25zIEFjdGlvbnMgdGhhdCBhcmUgY29uZmlndXJlZCBhcyBoaWRkZW4gKGFkZGl0aW9uYWwgdG8gdGhlIHZpc2libGUgcHJvcGVydHkpXG4gKiBAcGFyYW0gYWN0aW9uS2V5IEtleSB0byBsb29rIHVwXG4gKiBAcmV0dXJucyBNZXJnZWQgYWN0aW9uIGFuZCBpbmRpY2F0b3Igd2hldGhlciBpdCBjYW4gYmUgYSBtZW51IGl0ZW1cbiAqL1xuZnVuY3Rpb24gbWFwQWN0aW9uQnlLZXkoXG5cdG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPixcblx0YW5ub3RhdGlvbkFjdGlvbnM6IEJhc2VBY3Rpb25bXSxcblx0aGlkZGVuQWN0aW9uczogQmFzZUFjdGlvbltdLFxuXHRhY3Rpb25LZXk6IHN0cmluZ1xuKSB7XG5cdGNvbnN0IGFubm90YXRpb25BY3Rpb246IEJhc2VBY3Rpb24gfCBDdXN0b21BY3Rpb24gfCB1bmRlZmluZWQgPSBhbm5vdGF0aW9uQWN0aW9ucy5maW5kKFxuXHRcdChhY3Rpb246IEJhc2VBY3Rpb24pID0+IGFjdGlvbi5rZXkgPT09IGFjdGlvbktleVxuXHQpO1xuXHRjb25zdCBtYW5pZmVzdEFjdGlvbiA9IG1hbmlmZXN0QWN0aW9uc1thY3Rpb25LZXldO1xuXHRjb25zdCByZXN1bHRBY3Rpb246IEN1c3RvbUFjdGlvbiB8IEJhc2VBY3Rpb24gPSB7IC4uLihhbm5vdGF0aW9uQWN0aW9uID8/IG1hbmlmZXN0QWN0aW9uKSB9O1xuXG5cdC8vIEFubm90YXRpb24gYWN0aW9uIGFuZCBtYW5pZmVzdCBjb25maWd1cmF0aW9uIGFscmVhZHkgaGFzIHRvIGJlIG1lcmdlZCBoZXJlIGFzIGluc2VydEN1c3RvbUVsZW1lbnRzIG9ubHkgY29uc2lkZXJzIHRvcC1sZXZlbCBhY3Rpb25zXG5cdGlmIChhbm5vdGF0aW9uQWN0aW9uKSB7XG5cdFx0Ly8gSWYgZW5hYmxlZCBvciB2aXNpYmxlIGlzIG5vdCBzZXQgaW4gdGhlIG1hbmlmZXN0LCB1c2UgdGhlIGFubm90YXRpb24gdmFsdWUgYW5kIGhlbmNlIGRvIG5vdCBvdmVyd3JpdGVcblx0XHRyZXN1bHRBY3Rpb24uZW5hYmxlZCA9IG1hbmlmZXN0QWN0aW9uPy5lbmFibGVkID8/IGFubm90YXRpb25BY3Rpb24uZW5hYmxlZDtcblx0XHRyZXN1bHRBY3Rpb24udmlzaWJsZSA9IG1hbmlmZXN0QWN0aW9uPy52aXNpYmxlID8/IGFubm90YXRpb25BY3Rpb24udmlzaWJsZTtcblxuXHRcdGZvciAoY29uc3QgcHJvcCBpbiBtYW5pZmVzdEFjdGlvbiB8fCB7fSkge1xuXHRcdFx0Y29uc3QgcHJvcEtleSA9IHByb3AgYXMga2V5b2YgQmFzZUFjdGlvbjtcblx0XHRcdGlmICghYW5ub3RhdGlvbkFjdGlvbltwcm9wS2V5XSAmJiBwcm9wS2V5ICE9PSBcIm1lbnVcIikge1xuXHRcdFx0XHRyZXN1bHRBY3Rpb25bcHJvcEtleV0gPSBtYW5pZmVzdEFjdGlvbltwcm9wS2V5XSBhcyBuZXZlcjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCBjYW5CZU1lbnVJdGVtID1cblx0XHQocmVzdWx0QWN0aW9uPy52aXNpYmxlIHx8XG5cdFx0XHRyZXN1bHRBY3Rpb24/LnR5cGUgPT09IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9yQWN0aW9uIHx8XG5cdFx0XHRyZXN1bHRBY3Rpb24/LnR5cGUgPT09IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uKSAmJlxuXHRcdCFoaWRkZW5BY3Rpb25zLmZpbmQoKGhpZGRlbkFjdGlvbikgPT4gaGlkZGVuQWN0aW9uLmtleSA9PT0gcmVzdWx0QWN0aW9uPy5rZXkpO1xuXG5cdHJldHVybiB7XG5cdFx0YWN0aW9uOiByZXN1bHRBY3Rpb24sXG5cdFx0Y2FuQmVNZW51SXRlbVxuXHR9O1xufVxuXG4vKipcbiAqIE1hcCB0aGUgZGVmYXVsdCBhY3Rpb24ga2V5IG9mIGEgbWVudSB0byBpdHMgYWN0dWFsIGFjdGlvbiBjb25maWd1cmF0aW9uIGFuZCBpZGVudGlmeSB3aGV0aGVyIHRoaXMgZGVmYXVsdCBhY3Rpb24gaXMgYSBjb21tYW5kLlxuICpcbiAqIEBwYXJhbSBtZW51QWN0aW9uIE1lbnUgYWN0aW9uIHRvIG1hcCB0aGUgZGVmYXVsdCBhY3Rpb24gZm9yXG4gKiBAcGFyYW0gbWFuaWZlc3RBY3Rpb25zIEFjdGlvbnMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3RcbiAqIEBwYXJhbSBhbm5vdGF0aW9uQWN0aW9ucyBBY3Rpb25zIGRlZmluZWQgdGhyb3VnaCBhbm5vdGF0aW9uc1xuICogQHBhcmFtIGNvbW1hbmRBY3Rpb25zIEFycmF5IG9mIGNvbW1hbmQgYWN0aW9ucyB0byBwdXNoIHRoZSBkZWZhdWx0IGFjdGlvbiB0byBpZiBhcHBsaWNhYmxlXG4gKiBAcGFyYW0gaGlkZGVuQWN0aW9ucyBBY3Rpb25zIHRoYXQgYXJlIGNvbmZpZ3VyZWQgYXMgaGlkZGVuIChhZGRpdGlvbmFsIHRvIHRoZSB2aXNpYmxlIHByb3BlcnR5KVxuICovXG5mdW5jdGlvbiBtYXBNZW51RGVmYXVsdEFjdGlvbihcblx0bWVudUFjdGlvbjogQ3VzdG9tQWN0aW9uLFxuXHRtYW5pZmVzdEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4sXG5cdGFubm90YXRpb25BY3Rpb25zOiBCYXNlQWN0aW9uW10sXG5cdGNvbW1hbmRBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24gfCBCYXNlQWN0aW9uPixcblx0aGlkZGVuQWN0aW9uczogQmFzZUFjdGlvbltdXG4pIHtcblx0Y29uc3QgeyBhY3Rpb24sIGNhbkJlTWVudUl0ZW0gfSA9IG1hcEFjdGlvbkJ5S2V5KG1hbmlmZXN0QWN0aW9ucywgYW5ub3RhdGlvbkFjdGlvbnMsIGhpZGRlbkFjdGlvbnMsIG1lbnVBY3Rpb24uZGVmYXVsdEFjdGlvbiBhcyBzdHJpbmcpO1xuXG5cdGlmIChjYW5CZU1lbnVJdGVtKSB7XG5cdFx0bWVudUFjdGlvbi5kZWZhdWx0QWN0aW9uID0gYWN0aW9uO1xuXHR9XG5cblx0aWYgKGFjdGlvbi5jb21tYW5kKSB7XG5cdFx0Y29tbWFuZEFjdGlvbnNbYWN0aW9uLmtleV0gPSBhY3Rpb247XG5cdH1cbn1cblxuLyoqXG4gKiBNYXAgdGhlIG1lbnUgaXRlbSBrZXlzIG9mIGEgbWVudSB0byB0aGVpciBhY3R1YWwgYWN0aW9uIGNvbmZpZ3VyYXRpb25zIGFuZCBpZGVudGlmeSB3aGV0aGVyIHRoZXkgYXJlIGNvbW1hbmRzLlxuICpcbiAqIEBwYXJhbSBtZW51QWN0aW9uIE1lbnUgYWN0aW9uIHRvIG1hcCB0aGUgbWVudSBpdGVtcyBmb3JcbiAqIEBwYXJhbSBtYW5pZmVzdEFjdGlvbnMgQWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHBhcmFtIGFubm90YXRpb25BY3Rpb25zIEFjdGlvbnMgZGVmaW5lZCB0aHJvdWdoIGFubm90YXRpb25zXG4gKiBAcGFyYW0gY29tbWFuZEFjdGlvbnMgQXJyYXkgb2YgY29tbWFuZCBhY3Rpb25zIHRvIHB1c2ggdGhlIG1lbnUgaXRlbSBhY3Rpb25zIHRvIGlmIGFwcGxpY2FibGVcbiAqIEBwYXJhbSBoaWRkZW5BY3Rpb25zIEFjdGlvbnMgdGhhdCBhcmUgY29uZmlndXJlZCBhcyBoaWRkZW4gKGFkZGl0aW9uYWwgdG8gdGhlIHZpc2libGUgcHJvcGVydHkpXG4gKi9cbmZ1bmN0aW9uIG1hcE1lbnVJdGVtcyhcblx0bWVudUFjdGlvbjogQ3VzdG9tQWN0aW9uLFxuXHRtYW5pZmVzdEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4sXG5cdGFubm90YXRpb25BY3Rpb25zOiBCYXNlQWN0aW9uW10sXG5cdGNvbW1hbmRBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBCYXNlQWN0aW9uIHwgQ3VzdG9tQWN0aW9uPixcblx0aGlkZGVuQWN0aW9uczogQmFzZUFjdGlvbltdXG4pIHtcblx0Y29uc3QgbWFwcGVkTWVudUl0ZW1zOiAoQ3VzdG9tQWN0aW9uIHwgQmFzZUFjdGlvbilbXSA9IFtdO1xuXG5cdGZvciAoY29uc3QgbWVudUl0ZW1LZXkgb2YgbWVudUFjdGlvbi5tZW51ID8/IFtdKSB7XG5cdFx0Y29uc3QgeyBhY3Rpb24sIGNhbkJlTWVudUl0ZW0gfSA9IG1hcEFjdGlvbkJ5S2V5KG1hbmlmZXN0QWN0aW9ucywgYW5ub3RhdGlvbkFjdGlvbnMsIGhpZGRlbkFjdGlvbnMsIG1lbnVJdGVtS2V5IGFzIHN0cmluZyk7XG5cblx0XHRpZiAoY2FuQmVNZW51SXRlbSkge1xuXHRcdFx0bWFwcGVkTWVudUl0ZW1zLnB1c2goYWN0aW9uKTtcblx0XHR9XG5cblx0XHRpZiAoYWN0aW9uLmNvbW1hbmQpIHtcblx0XHRcdGNvbW1hbmRBY3Rpb25zW21lbnVJdGVtS2V5IGFzIHN0cmluZ10gPSBhY3Rpb247XG5cdFx0fVxuXHR9XG5cblx0bWVudUFjdGlvbi5tZW51ID0gbWFwcGVkTWVudUl0ZW1zO1xuXG5cdC8vIElmIHRoZSBtZW51IGlzIHNldCB0byBpbnZpc2libGUsIGl0IHNob3VsZCBiZSBpbnZpc2libGUsIG90aGVyd2lzZSB0aGUgdmlzaWJpbGl0eSBzaG91bGQgYmUgY2FsY3VsYXRlZCBmcm9tIHRoZSBpdGVtc1xuXHRjb25zdCB2aXNpYmxlRXhwcmVzc2lvbnM6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPltdID0gbWFwcGVkTWVudUl0ZW1zLm1hcCgobWVudUl0ZW0pID0+XG5cdFx0cmVzb2x2ZUJpbmRpbmdTdHJpbmcobWVudUl0ZW0udmlzaWJsZSBhcyBzdHJpbmcsIFwiYm9vbGVhblwiKVxuXHQpO1xuXHRtZW51QWN0aW9uLnZpc2libGUgPSBjb21waWxlRXhwcmVzc2lvbihhbmQocmVzb2x2ZUJpbmRpbmdTdHJpbmcobWVudUFjdGlvbi52aXNpYmxlIGFzIHN0cmluZywgXCJib29sZWFuXCIpLCBvciguLi52aXNpYmxlRXhwcmVzc2lvbnMpKSk7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgZmxhdCBjb2xsZWN0aW9uIG9mIGFjdGlvbnMgaW50byBhIG5lc3RlZCBzdHJ1Y3R1cmVzIG9mIG1lbnVzLiBUaGUgcmVzdWx0IGlzIGEgcmVjb3JkIG9mIGFjdGlvbnMgdGhhdCBhcmUgZWl0aGVyIG1lbnVzIG9yXG4gKiBvbmVzIHRoYXQgZG8gbm90IGFwcGVhciBpbiBtZW51cyBhcyBtZW51IGl0ZW1zLiBJdCBhbHNvIHJldHVybnMgYSBsaXN0IG9mIGFjdGlvbnMgdGhhdCBoYXZlIGFuIGFzc2lnbmVkIGNvbW1hbmQuXG4gKlxuICogTm90ZSB0aGF0IG1lbnUgaXRlbXMgYXJlIGFscmVhZHkgdGhlIG1lcmdlZCByZXN1bHQgb2YgYW5ub3RhdGlvbiBhY3Rpb25zIGFuZCB0aGVpciBtYW5pZmVzdCBjb25maWd1cmF0aW9uLCBhcyB7QGxpbmsgaW5zZXJ0Q3VzdG9tRWxlbWVudHN9XG4gKiBvbmx5IGNvbnNpZGVycyByb290LWxldmVsIGFjdGlvbnMuXG4gKlxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBBY3Rpb25zIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG4gKiBAcGFyYW0gYW5ub3RhdGlvbkFjdGlvbnMgQWN0aW9ucyBkZWZpbmVkIHRocm91Z2ggYW5ub3RhdGlvbnNcbiAqIEBwYXJhbSBoaWRkZW5BY3Rpb25zIEFjdGlvbnMgdGhhdCBhcmUgY29uZmlndXJlZCBhcyBoaWRkZW4gKGFkZGl0aW9uYWwgdG8gdGhlIHZpc2libGUgcHJvcGVydHkpXG4gKiBAcmV0dXJucyBUaGUgdHJhbnNmb3JtZWQgYWN0aW9ucyBmcm9tIHRoZSBtYW5pZmVzdCBhbmQgYSBsaXN0IG9mIGNvbW1hbmQgYWN0aW9uc1xuICovXG5mdW5jdGlvbiB0cmFuc2Zvcm1NZW51QWN0aW9uc0FuZElkZW50aWZ5Q29tbWFuZHMoXG5cdG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPixcblx0YW5ub3RhdGlvbkFjdGlvbnM6IEJhc2VBY3Rpb25bXSxcblx0aGlkZGVuQWN0aW9uczogQmFzZUFjdGlvbltdXG4pOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+PiB7XG5cdGNvbnN0IGFsbEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4gPSB7fTtcblx0Y29uc3QgYWN0aW9uS2V5c1RvRGVsZXRlOiBzdHJpbmdbXSA9IFtdO1xuXHRjb25zdCBjb21tYW5kQWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPiA9IHt9O1xuXG5cdGZvciAoY29uc3QgYWN0aW9uS2V5IGluIG1hbmlmZXN0QWN0aW9ucykge1xuXHRcdGNvbnN0IG1hbmlmZXN0QWN0aW9uOiBDdXN0b21BY3Rpb24gPSBtYW5pZmVzdEFjdGlvbnNbYWN0aW9uS2V5XTtcblxuXHRcdGlmIChtYW5pZmVzdEFjdGlvbi5kZWZhdWx0QWN0aW9uICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdG1hcE1lbnVEZWZhdWx0QWN0aW9uKG1hbmlmZXN0QWN0aW9uLCBtYW5pZmVzdEFjdGlvbnMsIGFubm90YXRpb25BY3Rpb25zLCBjb21tYW5kQWN0aW9ucywgaGlkZGVuQWN0aW9ucyk7XG5cdFx0fVxuXG5cdFx0aWYgKG1hbmlmZXN0QWN0aW9uLnR5cGUgPT09IEFjdGlvblR5cGUuTWVudSkge1xuXHRcdFx0Ly8gTWVudSBpdGVtcyBzaG91bGQgbm90IGFwcGVhciBhcyB0b3AtbGV2ZWwgYWN0aW9ucyB0aGVtc2VsdmVzXG5cdFx0XHRhY3Rpb25LZXlzVG9EZWxldGUucHVzaCguLi4obWFuaWZlc3RBY3Rpb24ubWVudSBhcyBzdHJpbmdbXSkpO1xuXG5cdFx0XHRtYXBNZW51SXRlbXMobWFuaWZlc3RBY3Rpb24sIG1hbmlmZXN0QWN0aW9ucywgYW5ub3RhdGlvbkFjdGlvbnMsIGNvbW1hbmRBY3Rpb25zLCBoaWRkZW5BY3Rpb25zKTtcblxuXHRcdFx0Ly8gTWVudSBoYXMgbm8gdmlzaWJsZSBpdGVtcywgc28gcmVtb3ZlIGl0XG5cdFx0XHRpZiAoIW1hbmlmZXN0QWN0aW9uLm1lbnU/Lmxlbmd0aCkge1xuXHRcdFx0XHRhY3Rpb25LZXlzVG9EZWxldGUucHVzaChtYW5pZmVzdEFjdGlvbi5rZXkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChtYW5pZmVzdEFjdGlvbi5jb21tYW5kKSB7XG5cdFx0XHRjb21tYW5kQWN0aW9uc1thY3Rpb25LZXldID0gbWFuaWZlc3RBY3Rpb247XG5cdFx0fVxuXG5cdFx0YWxsQWN0aW9uc1thY3Rpb25LZXldID0gbWFuaWZlc3RBY3Rpb247XG5cdH1cblxuXHRhY3Rpb25LZXlzVG9EZWxldGUuZm9yRWFjaCgoYWN0aW9uS2V5OiBzdHJpbmcpID0+IGRlbGV0ZSBhbGxBY3Rpb25zW2FjdGlvbktleV0pO1xuXG5cdHJldHVybiB7XG5cdFx0YWN0aW9uczogYWxsQWN0aW9ucyxcblx0XHRjb21tYW5kQWN0aW9uczogY29tbWFuZEFjdGlvbnNcblx0fTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBlbmFibGVtZW50IG9mIGEgbWFuaWZlc3QgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBtYW5pZmVzdEFjdGlvbiBUaGUgYWN0aW9uIGNvbmZpZ3VyZWQgaW4gdGhlIG1hbmlmZXN0XG4gKiBAcGFyYW0gaXNBbm5vdGF0aW9uQWN0aW9uIFdoZXRoZXIgdGhlIGFjdGlvbiwgZGVmaW5lZCBpbiBtYW5pZmVzdCwgY29ycmVzcG9uZHMgdG8gYW4gZXhpc3RpbmcgYW5ub3RhdGlvbiBhY3Rpb24uXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMgRGV0ZXJtaW5lZCBwcm9wZXJ0eSB2YWx1ZSBmb3IgdGhlIGVuYWJsZW1lbnRcbiAqL1xuY29uc3QgX2dldE1hbmlmZXN0RW5hYmxlZCA9IGZ1bmN0aW9uIChcblx0bWFuaWZlc3RBY3Rpb246IE1hbmlmZXN0QWN0aW9uLFxuXHRpc0Fubm90YXRpb25BY3Rpb246IGJvb2xlYW4sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgdW5kZWZpbmVkIHtcblx0aWYgKGlzQW5ub3RhdGlvbkFjdGlvbiAmJiBtYW5pZmVzdEFjdGlvbi5lbmFibGVkID09PSB1bmRlZmluZWQpIHtcblx0XHQvLyBJZiBhbm5vdGF0aW9uIGFjdGlvbiBoYXMgbm8gcHJvcGVydHkgZGVmaW5lZCBpbiBtYW5pZmVzdCxcblx0XHQvLyBkbyBub3Qgb3ZlcndyaXRlIGl0IHdpdGggbWFuaWZlc3QgYWN0aW9uJ3MgZGVmYXVsdCB2YWx1ZS5cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0Y29uc3QgcmVzdWx0ID0gZ2V0TWFuaWZlc3RBY3Rpb25Cb29sZWFuUHJvcGVydHlXaXRoRm9ybWF0dGVyKG1hbmlmZXN0QWN0aW9uLmVuYWJsZWQsIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdC8vIENvbnNpZGVyIHJlcXVpcmVzU2VsZWN0aW9uIHByb3BlcnR5IHRvIGluY2x1ZGUgc2VsZWN0ZWRDb250ZXh0cyBpbiB0aGUgYmluZGluZyBleHByZXNzaW9uXG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRpZkVsc2UoXG5cdFx0XHRtYW5pZmVzdEFjdGlvbi5yZXF1aXJlc1NlbGVjdGlvbiA9PT0gdHJ1ZSxcblx0XHRcdGFuZChncmVhdGVyT3JFcXVhbChwYXRoSW5Nb2RlbChcIm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c1wiLCBcImludGVybmFsXCIpLCAxKSwgcmVzdWx0KSxcblx0XHRcdHJlc3VsdFxuXHRcdClcblx0KTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgdmlzaWJpbGl0eSBvZiBhIG1hbmlmZXN0IGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gbWFuaWZlc3RBY3Rpb24gVGhlIGFjdGlvbiBjb25maWd1cmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHBhcmFtIGlzQW5ub3RhdGlvbkFjdGlvbiBXaGV0aGVyIHRoZSBhY3Rpb24sIGRlZmluZWQgaW4gbWFuaWZlc3QsIGNvcnJlc3BvbmRzIHRvIGFuIGV4aXN0aW5nIGFubm90YXRpb24gYWN0aW9uLlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIERldGVybWluZWQgcHJvcGVydHkgdmFsdWUgZm9yIHRoZSB2aXNpYmlsaXR5XG4gKi9cbmNvbnN0IF9nZXRNYW5pZmVzdFZpc2libGUgPSBmdW5jdGlvbiAoXG5cdG1hbmlmZXN0QWN0aW9uOiBNYW5pZmVzdEFjdGlvbixcblx0aXNBbm5vdGF0aW9uQWN0aW9uOiBib29sZWFuLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHVuZGVmaW5lZCB7XG5cdGlmIChpc0Fubm90YXRpb25BY3Rpb24gJiYgbWFuaWZlc3RBY3Rpb24udmlzaWJsZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0Ly8gSWYgYW5ub3RhdGlvbiBhY3Rpb24gaGFzIG5vIHByb3BlcnR5IGRlZmluZWQgaW4gbWFuaWZlc3QsXG5cdFx0Ly8gZG8gbm90IG92ZXJ3cml0ZSBpdCB3aXRoIG1hbmlmZXN0IGFjdGlvbidzIGRlZmF1bHQgdmFsdWUuXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdGNvbnN0IHJlc3VsdCA9IGdldE1hbmlmZXN0QWN0aW9uQm9vbGVhblByb3BlcnR5V2l0aEZvcm1hdHRlcihtYW5pZmVzdEFjdGlvbi52aXNpYmxlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKHJlc3VsdCk7XG59O1xuXG4vKipcbiAqIEFzIHNvbWUgcHJvcGVydGllcyBzaG91bGQgbm90IGJlIG92ZXJyaWRhYmxlIGJ5IHRoZSBtYW5pZmVzdCwgbWFrZSBzdXJlIHRoYXQgdGhlIG1hbmlmZXN0IGNvbmZpZ3VyYXRpb24gZ2V0cyB0aGUgYW5ub3RhdGlvbiB2YWx1ZXMgZm9yIHRoZXNlLlxuICpcbiAqIEBwYXJhbSBtYW5pZmVzdEFjdGlvbiBBY3Rpb24gZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3RcbiAqIEBwYXJhbSBhbm5vdGF0aW9uQWN0aW9uIEFjdGlvbiBkZWZpbmVkIHRocm91Z2ggYW5ub3RhdGlvbnNcbiAqL1xuZnVuY3Rpb24gb3ZlcnJpZGVNYW5pZmVzdENvbmZpZ3VyYXRpb25XaXRoQW5ub3RhdGlvbihtYW5pZmVzdEFjdGlvbjogQ3VzdG9tQWN0aW9uLCBhbm5vdGF0aW9uQWN0aW9uPzogQmFzZUFjdGlvbikge1xuXHRpZiAoIWFubm90YXRpb25BY3Rpb24pIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyBEbyBub3Qgb3ZlcnJpZGUgdGhlICd0eXBlJyBnaXZlbiBpbiBhbiBhbm5vdGF0aW9uIGFjdGlvblxuXHRtYW5pZmVzdEFjdGlvbi50eXBlID0gYW5ub3RhdGlvbkFjdGlvbi50eXBlO1xuXHRtYW5pZmVzdEFjdGlvbi5hbm5vdGF0aW9uUGF0aCA9IGFubm90YXRpb25BY3Rpb24uYW5ub3RhdGlvblBhdGg7XG5cdG1hbmlmZXN0QWN0aW9uLnByZXNzID0gYW5ub3RhdGlvbkFjdGlvbi5wcmVzcztcblxuXHQvLyBPbmx5IHVzZSB0aGUgYW5ub3RhdGlvbiB2YWx1ZXMgZm9yIGVuYWJsZW1lbnQgYW5kIHZpc2liaWxpdHkgaWYgbm90IHNldCBpbiB0aGUgbWFuaWZlc3Rcblx0bWFuaWZlc3RBY3Rpb24uZW5hYmxlZCA9IG1hbmlmZXN0QWN0aW9uLmVuYWJsZWQgPz8gYW5ub3RhdGlvbkFjdGlvbi5lbmFibGVkO1xuXHRtYW5pZmVzdEFjdGlvbi52aXNpYmxlID0gbWFuaWZlc3RBY3Rpb24udmlzaWJsZSA/PyBhbm5vdGF0aW9uQWN0aW9uLnZpc2libGU7XG59XG5cbi8qKlxuICogSGlkZSBhbiBhY3Rpb24gaWYgaXQgaXMgYSBoaWRkZW4gaGVhZGVyIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gYWN0aW9uIFRoZSBhY3Rpb24gdG8gaGlkZVxuICogQHBhcmFtIGhpZGRlbkFjdGlvbnMgQWN0aW9ucyB0aGF0IGFyZSBjb25maWd1cmVkIGFzIGhpZGRlbiAoYWRkaXRpb25hbCB0byB0aGUgdmlzaWJsZSBwcm9wZXJ0eSlcbiAqL1xuZnVuY3Rpb24gaGlkZUFjdGlvbklmSGlkZGVuQWN0aW9uKGFjdGlvbjogQ3VzdG9tQWN0aW9uLCBoaWRkZW5BY3Rpb25zPzogQmFzZUFjdGlvbltdKSB7XG5cdGlmIChoaWRkZW5BY3Rpb25zPy5maW5kKChoaWRkZW5BY3Rpb24pID0+IGhpZGRlbkFjdGlvbi5rZXkgPT09IGFjdGlvbi5rZXkpKSB7XG5cdFx0YWN0aW9uLnZpc2libGUgPSBcImZhbHNlXCI7XG5cdH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBhY3Rpb24gY29uZmlndXJhdGlvbiBiYXNlZCBvbiB0aGUgbWFuaWZlc3Qgc2V0dGluZ3MuXG4gKlxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBUaGUgbWFuaWZlc3QgYWN0aW9uc1xuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gYW5ub3RhdGlvbkFjdGlvbnMgVGhlIGFubm90YXRpb24gYWN0aW9ucyBkZWZpbml0aW9uXG4gKiBAcGFyYW0gbmF2aWdhdGlvblNldHRpbmdzIFRoZSBuYXZpZ2F0aW9uIHNldHRpbmdzXG4gKiBAcGFyYW0gY29uc2lkZXJOYXZpZ2F0aW9uU2V0dGluZ3MgVGhlIG5hdmlnYXRpb24gc2V0dGluZ3MgdG8gYmUgY29uc2lkZXJlZFxuICogQHBhcmFtIGhpZGRlbkFjdGlvbnMgQWN0aW9ucyB0aGF0IGFyZSBjb25maWd1cmVkIGFzIGhpZGRlbiAoYWRkaXRpb25hbCB0byB0aGUgdmlzaWJsZSBwcm9wZXJ0eSlcbiAqIEBwYXJhbSBmYWNldE5hbWUgVGhlIGZhY2V0IHdoZXJlIGFuIGFjdGlvbiBpcyBkaXNwbGF5ZWQgaWYgaXQgaXMgaW5saW5lXG4gKiBAcmV0dXJucyBUaGUgYWN0aW9ucyBmcm9tIHRoZSBtYW5pZmVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdChcblx0bWFuaWZlc3RBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBNYW5pZmVzdEFjdGlvbj4gfCB1bmRlZmluZWQsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGFubm90YXRpb25BY3Rpb25zPzogQmFzZUFjdGlvbltdLFxuXHRuYXZpZ2F0aW9uU2V0dGluZ3M/OiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHRjb25zaWRlck5hdmlnYXRpb25TZXR0aW5ncz86IGJvb2xlYW4sXG5cdGhpZGRlbkFjdGlvbnM/OiBCYXNlQWN0aW9uW10sXG5cdGZhY2V0TmFtZT86IHN0cmluZ1xuKTogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPj4ge1xuXHRjb25zdCBhY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+ID0ge307XG5cdGZvciAoY29uc3QgYWN0aW9uS2V5IGluIG1hbmlmZXN0QWN0aW9ucykge1xuXHRcdGNvbnN0IG1hbmlmZXN0QWN0aW9uOiBNYW5pZmVzdEFjdGlvbiA9IG1hbmlmZXN0QWN0aW9uc1thY3Rpb25LZXldO1xuXHRcdGNvbnN0IGxhc3REb3RJbmRleCA9IG1hbmlmZXN0QWN0aW9uLnByZXNzPy5sYXN0SW5kZXhPZihcIi5cIikgfHwgLTE7XG5cdFx0Y29uc3Qgb0Fubm90YXRpb25BY3Rpb24gPSBhbm5vdGF0aW9uQWN0aW9ucz8uZmluZCgob2JqKSA9PiBvYmoua2V5ID09PSBhY3Rpb25LZXkpO1xuXG5cdFx0Ly8gVG8gaWRlbnRpZnkgdGhlIGFubm90YXRpb24gYWN0aW9uIHByb3BlcnR5IG92ZXJ3cml0ZSB2aWEgbWFuaWZlc3QgdXNlLWNhc2UuXG5cdFx0Y29uc3QgaXNBbm5vdGF0aW9uQWN0aW9uID0gISFvQW5ub3RhdGlvbkFjdGlvbjtcblx0XHRpZiAobWFuaWZlc3RBY3Rpb24uZmFjZXROYW1lKSB7XG5cdFx0XHRmYWNldE5hbWUgPSBtYW5pZmVzdEFjdGlvbi5mYWNldE5hbWU7XG5cdFx0fVxuXG5cdFx0YWN0aW9uc1thY3Rpb25LZXldID0ge1xuXHRcdFx0aWQ6IG9Bbm5vdGF0aW9uQWN0aW9uID8gYWN0aW9uS2V5IDogZ2V0Q3VzdG9tQWN0aW9uSUQoYWN0aW9uS2V5KSxcblx0XHRcdHR5cGU6IG1hbmlmZXN0QWN0aW9uLm1lbnUgPyBBY3Rpb25UeXBlLk1lbnUgOiBBY3Rpb25UeXBlLkRlZmF1bHQsXG5cdFx0XHR2aXNpYmxlOiBfZ2V0TWFuaWZlc3RWaXNpYmxlKG1hbmlmZXN0QWN0aW9uLCBpc0Fubm90YXRpb25BY3Rpb24sIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdFx0ZW5hYmxlZDogX2dldE1hbmlmZXN0RW5hYmxlZChtYW5pZmVzdEFjdGlvbiwgaXNBbm5vdGF0aW9uQWN0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdGhhbmRsZXJNb2R1bGU6IG1hbmlmZXN0QWN0aW9uLnByZXNzICYmIG1hbmlmZXN0QWN0aW9uLnByZXNzLnN1YnN0cmluZygwLCBsYXN0RG90SW5kZXgpLnJlcGxhY2UoL1xcLi9naSwgXCIvXCIpLFxuXHRcdFx0aGFuZGxlck1ldGhvZDogbWFuaWZlc3RBY3Rpb24ucHJlc3MgJiYgbWFuaWZlc3RBY3Rpb24ucHJlc3Muc3Vic3RyaW5nKGxhc3REb3RJbmRleCArIDEpLFxuXHRcdFx0cHJlc3M6IG1hbmlmZXN0QWN0aW9uLnByZXNzLFxuXHRcdFx0dGV4dDogbWFuaWZlc3RBY3Rpb24udGV4dCxcblx0XHRcdG5vV3JhcDogbWFuaWZlc3RBY3Rpb24uX19ub1dyYXAsXG5cdFx0XHRrZXk6IHJlcGxhY2VTcGVjaWFsQ2hhcnMoYWN0aW9uS2V5KSxcblx0XHRcdGVuYWJsZU9uU2VsZWN0OiBtYW5pZmVzdEFjdGlvbi5lbmFibGVPblNlbGVjdCxcblx0XHRcdGRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbjogbWFuaWZlc3RBY3Rpb24uZGVmYXVsdFZhbHVlc0Z1bmN0aW9uLFxuXHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0YW5jaG9yOiBtYW5pZmVzdEFjdGlvbi5wb3NpdGlvbj8uYW5jaG9yLFxuXHRcdFx0XHRwbGFjZW1lbnQ6IG1hbmlmZXN0QWN0aW9uLnBvc2l0aW9uID09PSB1bmRlZmluZWQgPyBQbGFjZW1lbnQuQWZ0ZXIgOiBtYW5pZmVzdEFjdGlvbi5wb3NpdGlvbi5wbGFjZW1lbnRcblx0XHRcdH0sXG5cdFx0XHRpc05hdmlnYWJsZTogaXNBY3Rpb25OYXZpZ2FibGUobWFuaWZlc3RBY3Rpb24sIG5hdmlnYXRpb25TZXR0aW5ncywgY29uc2lkZXJOYXZpZ2F0aW9uU2V0dGluZ3MpLFxuXHRcdFx0Y29tbWFuZDogbWFuaWZlc3RBY3Rpb24uY29tbWFuZCxcblx0XHRcdHJlcXVpcmVzU2VsZWN0aW9uOiBtYW5pZmVzdEFjdGlvbi5yZXF1aXJlc1NlbGVjdGlvbiA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBtYW5pZmVzdEFjdGlvbi5yZXF1aXJlc1NlbGVjdGlvbixcblx0XHRcdGVuYWJsZUF1dG9TY3JvbGw6IGVuYWJsZUF1dG9TY3JvbGwobWFuaWZlc3RBY3Rpb24pLFxuXHRcdFx0bWVudTogbWFuaWZlc3RBY3Rpb24ubWVudSA/PyBbXSxcblx0XHRcdGZhY2V0TmFtZTogbWFuaWZlc3RBY3Rpb24uaW5saW5lID8gZmFjZXROYW1lIDogdW5kZWZpbmVkLFxuXHRcdFx0ZGVmYXVsdEFjdGlvbjogbWFuaWZlc3RBY3Rpb24uZGVmYXVsdEFjdGlvblxuXHRcdH07XG5cblx0XHRvdmVycmlkZU1hbmlmZXN0Q29uZmlndXJhdGlvbldpdGhBbm5vdGF0aW9uKGFjdGlvbnNbYWN0aW9uS2V5XSwgb0Fubm90YXRpb25BY3Rpb24pO1xuXHRcdGhpZGVBY3Rpb25JZkhpZGRlbkFjdGlvbihhY3Rpb25zW2FjdGlvbktleV0sIGhpZGRlbkFjdGlvbnMpO1xuXHR9XG5cblx0cmV0dXJuIHRyYW5zZm9ybU1lbnVBY3Rpb25zQW5kSWRlbnRpZnlDb21tYW5kcyhhY3Rpb25zLCBhbm5vdGF0aW9uQWN0aW9ucyA/PyBbXSwgaGlkZGVuQWN0aW9ucyA/PyBbXSk7XG59XG5cbi8qKlxuICogR2V0cyBhIGJpbmRpbmcgZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgYSBCb29sZWFuIG1hbmlmZXN0IHByb3BlcnR5IHRoYXQgY2FuIGVpdGhlciBiZSByZXByZXNlbnRlZCBieSBhIHN0YXRpYyB2YWx1ZSwgYSBiaW5kaW5nIHN0cmluZyxcbiAqIG9yIGEgcnVudGltZSBmb3JtYXR0ZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHByb3BlcnR5VmFsdWUgU3RyaW5nIHJlcHJlc2VudGluZyB0aGUgY29uZmlndXJlZCBwcm9wZXJ0eSB2YWx1ZVxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIEEgYmluZGluZyBleHByZXNzaW9uIHJlcHJlc2VudGluZyB0aGUgcHJvcGVydHlcbiAqL1xuZnVuY3Rpb24gZ2V0TWFuaWZlc3RBY3Rpb25Cb29sZWFuUHJvcGVydHlXaXRoRm9ybWF0dGVyKFxuXHRwcm9wZXJ0eVZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IHJlc29sdmVkQmluZGluZyA9IHJlc29sdmVCaW5kaW5nU3RyaW5nPGJvb2xlYW4+KHByb3BlcnR5VmFsdWUgYXMgc3RyaW5nLCBcImJvb2xlYW5cIik7XG5cdGxldCByZXN1bHQ6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPjtcblx0aWYgKGlzQ29uc3RhbnQocmVzb2x2ZWRCaW5kaW5nKSAmJiByZXNvbHZlZEJpbmRpbmcudmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIE5vIHByb3BlcnR5IHZhbHVlIGNvbmZpZ3VyZWQgaW4gbWFuaWZlc3QgZm9yIHRoZSBjdXN0b20gYWN0aW9uIC0tPiBkZWZhdWx0IHZhbHVlIGlzIHRydWVcblx0XHRyZXN1bHQgPSBjb25zdGFudCh0cnVlKTtcblx0fSBlbHNlIGlmIChpc0NvbnN0YW50KHJlc29sdmVkQmluZGluZykgJiYgdHlwZW9mIHJlc29sdmVkQmluZGluZy52YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdC8vIFRoZW4gaXQncyBhIG1vZHVsZS1tZXRob2QgcmVmZXJlbmNlIFwic2FwLnh4eC55eXkuZG9Tb21ldGhpbmdcIlxuXHRcdGNvbnN0IG1ldGhvZFBhdGggPSByZXNvbHZlZEJpbmRpbmcudmFsdWU7XG5cdFx0Ly8gRklYTUU6IFRoZSBjdXN0b20gXCJpc0VuYWJsZWRcIiBjaGVjayBkb2VzIG5vdCB0cmlnZ2VyIChiZWNhdXNlIG5vbmUgb2YgdGhlIGJvdW5kIHZhbHVlcyBjaGFuZ2VzKVxuXHRcdHJlc3VsdCA9IGZvcm1hdFJlc3VsdChcblx0XHRcdFtwYXRoSW5Nb2RlbDxWaWV3PihcIi9cIiwgXCIkdmlld1wiKSwgbWV0aG9kUGF0aCwgcGF0aEluTW9kZWw8Q29udGV4dFtdPihcInNlbGVjdGVkQ29udGV4dHNcIiwgXCJpbnRlcm5hbFwiKV0sXG5cdFx0XHRmcG1Gb3JtYXR0ZXIuY3VzdG9tQm9vbGVhblByb3BlcnR5Q2hlY2ssXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKS5jb250ZXh0TG9jYXRpb24/LnRhcmdldEVudGl0eVR5cGUgfHwgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKClcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdC8vIHRoZW4gaXQncyBhIGJpbmRpbmdcblx0XHRyZXN1bHQgPSByZXNvbHZlZEJpbmRpbmc7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgY29uc3QgcmVtb3ZlRHVwbGljYXRlQWN0aW9ucyA9IChhY3Rpb25zOiBCYXNlQWN0aW9uW10pOiBCYXNlQWN0aW9uW10gPT4ge1xuXHRsZXQgb01lbnVJdGVtS2V5czogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4gPSB7fTtcblx0YWN0aW9ucy5mb3JFYWNoKChhY3Rpb24pID0+IHtcblx0XHRpZiAoYWN0aW9uPy5tZW51Py5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGFjdGlvbk1lbnU6IChCYXNlQWN0aW9uIHwgQ3VzdG9tQWN0aW9uKVtdID0gYWN0aW9uLm1lbnUgYXMgKEJhc2VBY3Rpb24gfCBDdXN0b21BY3Rpb24pW107XG5cdFx0XHRvTWVudUl0ZW1LZXlzID0gYWN0aW9uTWVudS5yZWR1Y2UoKGl0ZW06IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+LCB7IGtleSB9KSA9PiB7XG5cdFx0XHRcdGlmIChrZXkgJiYgIWl0ZW1ba2V5XSkge1xuXHRcdFx0XHRcdGl0ZW1ba2V5XSA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0XHR9LCBvTWVudUl0ZW1LZXlzKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gYWN0aW9ucy5maWx0ZXIoKGFjdGlvbikgPT4gIW9NZW51SXRlbUtleXNbYWN0aW9uLmtleV0pO1xufTtcblxuLyoqXG4gKiBNZXRob2QgdG8gZGV0ZXJtaW5lIHRoZSB2YWx1ZSBvZiB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIGFuIGFubm90YXRpb24tYmFzZWQgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHRcbiAqIEBwYXJhbSBhY3Rpb25UYXJnZXQgVGhlIGluc3RhbmNlIG9mIHRoZSBhY3Rpb25cbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgb2YgdGhlIGFjdGlvbiBidXR0b24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbmFibGVkRm9yQW5ub3RhdGlvbkFjdGlvbihcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0YWN0aW9uVGFyZ2V0OiBBY3Rpb24gfCB1bmRlZmluZWRcbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0Y29uc3QgYmluZGluZ1BhcmFtZXRlckZ1bGxOYW1lID0gYWN0aW9uVGFyZ2V0Py5pc0JvdW5kID8gYWN0aW9uVGFyZ2V0Py5wYXJhbWV0ZXJzWzBdPy5mdWxseVF1YWxpZmllZE5hbWUgOiB1bmRlZmluZWQ7XG5cdGNvbnN0IG9wZXJhdGlvbkF2YWlsYWJsZUV4cHJlc3Npb24gPSBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0YWN0aW9uVGFyZ2V0Py5hbm5vdGF0aW9ucy5Db3JlPy5PcGVyYXRpb25BdmFpbGFibGUsXG5cdFx0W10sXG5cdFx0dW5kZWZpbmVkLFxuXHRcdChwYXRoOiBzdHJpbmcpID0+IGJpbmRpbmdDb250ZXh0UGF0aFZpc2l0b3IocGF0aCwgY29udmVydGVyQ29udGV4dCwgYmluZGluZ1BhcmFtZXRlckZ1bGxOYW1lKVxuXHQpO1xuXHRpZiAoYWN0aW9uVGFyZ2V0Py5hbm5vdGF0aW9ucy5Db3JlPy5PcGVyYXRpb25BdmFpbGFibGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihlcXVhbChvcGVyYXRpb25BdmFpbGFibGVFeHByZXNzaW9uLCB0cnVlKSk7XG5cdH1cblx0cmV0dXJuIFwidHJ1ZVwiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nKG1hcHBpbmdzPzogU2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZVtdKTogTWV0YU1vZGVsVHlwZTxTZW1hbnRpY09iamVjdE1hcHBpbmdUeXBlPltdIHtcblx0cmV0dXJuIG1hcHBpbmdzXG5cdFx0PyBtYXBwaW5ncy5tYXAoKG1hcHBpbmcpID0+IHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRMb2NhbFByb3BlcnR5OiB7XG5cdFx0XHRcdFx0XHQkUHJvcGVydHlQYXRoOiBtYXBwaW5nLkxvY2FsUHJvcGVydHkudmFsdWVcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFNlbWFudGljT2JqZWN0UHJvcGVydHk6IG1hcHBpbmcuU2VtYW50aWNPYmplY3RQcm9wZXJ0eVxuXHRcdFx0XHR9O1xuXHRcdCAgfSlcblx0XHQ6IFtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBY3Rpb25OYXZpZ2FibGUoXG5cdGFjdGlvbjogTWFuaWZlc3RBY3Rpb24gfCBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW5Gb3JPdmVycmlkZSxcblx0bmF2aWdhdGlvblNldHRpbmdzPzogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0Y29uc2lkZXJOYXZpZ2F0aW9uU2V0dGluZ3M/OiBib29sZWFuXG4pOiBib29sZWFuIHtcblx0bGV0IGJJc05hdmlnYXRpb25Db25maWd1cmVkID0gdHJ1ZTtcblx0aWYgKGNvbnNpZGVyTmF2aWdhdGlvblNldHRpbmdzKSB7XG5cdFx0Y29uc3QgZGV0YWlsT3JEaXNwbGF5ID0gbmF2aWdhdGlvblNldHRpbmdzICYmIChuYXZpZ2F0aW9uU2V0dGluZ3MuZGV0YWlsIHx8IG5hdmlnYXRpb25TZXR0aW5ncy5kaXNwbGF5KTtcblx0XHRiSXNOYXZpZ2F0aW9uQ29uZmlndXJlZCA9IGRldGFpbE9yRGlzcGxheT8ucm91dGUgPyB0cnVlIDogZmFsc2U7XG5cdH1cblx0Ly8gd2hlbiBlbmFibGVBdXRvU2Nyb2xsIGlzIHRydWUgdGhlIG5hdmlnYXRlVG9JbnN0YW5jZSBmZWF0dXJlIGlzIGRpc2FibGVkXG5cdGlmIChcblx0XHQoYWN0aW9uICYmXG5cdFx0XHRhY3Rpb24uYWZ0ZXJFeGVjdXRpb24gJiZcblx0XHRcdChhY3Rpb24uYWZ0ZXJFeGVjdXRpb24/Lm5hdmlnYXRlVG9JbnN0YW5jZSA9PT0gZmFsc2UgfHwgYWN0aW9uLmFmdGVyRXhlY3V0aW9uPy5lbmFibGVBdXRvU2Nyb2xsID09PSB0cnVlKSkgfHxcblx0XHQhYklzTmF2aWdhdGlvbkNvbmZpZ3VyZWRcblx0KSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5hYmxlQXV0b1Njcm9sbChhY3Rpb246IE1hbmlmZXN0QWN0aW9uKTogYm9vbGVhbiB7XG5cdHJldHVybiBhY3Rpb24/LmFmdGVyRXhlY3V0aW9uPy5lbmFibGVBdXRvU2Nyb2xsID09PSB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGF0YUZpZWxkSXNDb3B5QWN0aW9uKGRhdGFGaWVsZDogRGF0YUZpZWxkRm9yQWN0aW9uVHlwZXMpOiBib29sZWFuIHtcblx0cmV0dXJuIGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LklzQ29weUFjdGlvbj8udmFsdWVPZigpID09PSB0cnVlICYmIGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29weUFjdGlvbihjb3B5RGF0YUZpZWxkczogRGF0YUZpZWxkRm9yQWN0aW9uVHlwZXNbXSk6IERhdGFGaWVsZEZvckFjdGlvblR5cGVzIHwgdW5kZWZpbmVkIHtcblx0aWYgKGNvcHlEYXRhRmllbGRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBjb3B5RGF0YUZpZWxkc1swXTtcblx0fVxuXHRpZiAoY29weURhdGFGaWVsZHMubGVuZ3RoID4gMSkge1xuXHRcdExvZy5lcnJvcihcIk11bHRpcGxlIGFjdGlvbnMgYXJlIGFubm90YXRlZCB3aXRoIGlzQ29weUFjdGlvbi4gVGhlcmUgY2FuIGJlIG9ubHkgb25lIHN0YW5kYXJkIGNvcHkgYWN0aW9uLlwiKTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01Bc0NZQSxVQUFVO0VBQUEsV0FBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7RUFBQSxHQUFWQSxVQUFVLEtBQVZBLFVBQVU7RUFBQTtFQWdGdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQyxjQUFjLENBQ3RCQyxlQUE2QyxFQUM3Q0MsaUJBQStCLEVBQy9CQyxhQUEyQixFQUMzQkMsU0FBaUIsRUFDaEI7SUFDRCxNQUFNQyxnQkFBdUQsR0FBR0gsaUJBQWlCLENBQUNJLElBQUksQ0FDcEZDLE1BQWtCLElBQUtBLE1BQU0sQ0FBQ0MsR0FBRyxL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