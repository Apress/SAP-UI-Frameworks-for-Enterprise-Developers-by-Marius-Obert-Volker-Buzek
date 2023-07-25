/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/annotations/DataField", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "../../../helpers/StableIdHelper", "../../helpers/ConfigurableObject", "../../helpers/DataFieldHelper", "../../helpers/ID", "../../helpers/Key", "../../ManifestSettings"], function (DataField, BindingToolkit, TypeGuards, DataModelPathHelper, StableIdHelper, ConfigurableObject, DataFieldHelper, ID, Key, ManifestSettings) {
  "use strict";

  var _exports = {};
  var ActionType = ManifestSettings.ActionType;
  var KeyHelper = Key.KeyHelper;
  var getFormStandardActionButtonID = ID.getFormStandardActionButtonID;
  var getFormID = ID.getFormID;
  var isReferencePropertyStaticallyHidden = DataFieldHelper.isReferencePropertyStaticallyHidden;
  var Placement = ConfigurableObject.Placement;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var createIdForAnnotation = StableIdHelper.createIdForAnnotation;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getTargetEntitySetPath = DataModelPathHelper.getTargetEntitySetPath;
  var isSingleton = TypeGuards.isSingleton;
  var pathInModel = BindingToolkit.pathInModel;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var getSemanticObjectPath = DataField.getSemanticObjectPath;
  let FormElementType;
  (function (FormElementType) {
    FormElementType["Default"] = "Default";
    FormElementType["Slot"] = "Slot";
    FormElementType["Annotation"] = "Annotation";
  })(FormElementType || (FormElementType = {}));
  _exports.FormElementType = FormElementType;
  /**
   * Returns default format options for text fields on a form.
   *
   * @returns Collection of format options with default values
   */
  function getDefaultFormatOptionsForForm() {
    return {
      textLinesEdit: 4
    };
  }
  function isFieldPartOfPreview(field, formPartOfPreview) {
    var _field$annotations, _field$annotations$UI, _field$annotations2, _field$annotations2$U;
    // Both each form and field can have the PartOfPreview annotation. Only if the form is not hidden (not partOfPreview) we allow toggling on field level
    return (formPartOfPreview === null || formPartOfPreview === void 0 ? void 0 : formPartOfPreview.valueOf()) === false || ((_field$annotations = field.annotations) === null || _field$annotations === void 0 ? void 0 : (_field$annotations$UI = _field$annotations.UI) === null || _field$annotations$UI === void 0 ? void 0 : _field$annotations$UI.PartOfPreview) === undefined || ((_field$annotations2 = field.annotations) === null || _field$annotations2 === void 0 ? void 0 : (_field$annotations2$U = _field$annotations2.UI) === null || _field$annotations2$U === void 0 ? void 0 : _field$annotations2$U.PartOfPreview.valueOf()) === true;
  }
  function getFormElementsFromAnnotations(facetDefinition, converterContext) {
    const formElements = [];
    const resolvedTarget = converterContext.getEntityTypeAnnotation(facetDefinition.Target.value);
    const formAnnotation = resolvedTarget.annotation;
    converterContext = resolvedTarget.converterContext;
    function getDataFieldsFromAnnotations(field, formPartOfPreview) {
      var _field$annotations3, _field$annotations3$U, _field$annotations3$U2;
      const semanticObjectAnnotationPath = getSemanticObjectPath(converterContext, field);
      if (field.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForAction" && field.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && !isReferencePropertyStaticallyHidden(field) && ((_field$annotations3 = field.annotations) === null || _field$annotations3 === void 0 ? void 0 : (_field$annotations3$U = _field$annotations3.UI) === null || _field$annotations3$U === void 0 ? void 0 : (_field$annotations3$U2 = _field$annotations3$U.Hidden) === null || _field$annotations3$U2 === void 0 ? void 0 : _field$annotations3$U2.valueOf()) !== true) {
        const formElement = {
          key: KeyHelper.generateKeyFromDataField(field),
          type: FormElementType.Annotation,
          annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(field.fullyQualifiedName)}/`,
          semanticObjectPath: semanticObjectAnnotationPath,
          formatOptions: getDefaultFormatOptionsForForm(),
          isPartOfPreview: isFieldPartOfPreview(field, formPartOfPreview)
        };
        if (field.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && field.Target.$target.$Type === "com.sap.vocabularies.UI.v1.ConnectedFieldsType") {
          const connectedFields = Object.values(field.Target.$target.Data).filter(connectedField => connectedField === null || connectedField === void 0 ? void 0 : connectedField.hasOwnProperty("Value"));
          formElement.connectedFields = connectedFields.map(connnectedFieldElement => {
            return {
              semanticObjectPath: getSemanticObjectPath(converterContext, connnectedFieldElement)
            };
          });
        }
        formElements.push(formElement);
      }
    }
    switch (formAnnotation === null || formAnnotation === void 0 ? void 0 : formAnnotation.term) {
      case "com.sap.vocabularies.UI.v1.FieldGroup":
        formAnnotation.Data.forEach(field => {
          var _facetDefinition$anno, _facetDefinition$anno2;
          return getDataFieldsFromAnnotations(field, (_facetDefinition$anno = facetDefinition.annotations) === null || _facetDefinition$anno === void 0 ? void 0 : (_facetDefinition$anno2 = _facetDefinition$anno.UI) === null || _facetDefinition$anno2 === void 0 ? void 0 : _facetDefinition$anno2.PartOfPreview);
        });
        break;
      case "com.sap.vocabularies.UI.v1.Identification":
        formAnnotation.forEach(field => {
          var _facetDefinition$anno3, _facetDefinition$anno4;
          return getDataFieldsFromAnnotations(field, (_facetDefinition$anno3 = facetDefinition.annotations) === null || _facetDefinition$anno3 === void 0 ? void 0 : (_facetDefinition$anno4 = _facetDefinition$anno3.UI) === null || _facetDefinition$anno4 === void 0 ? void 0 : _facetDefinition$anno4.PartOfPreview);
        });
        break;
      case "com.sap.vocabularies.UI.v1.DataPoint":
        formElements.push({
          // key: KeyHelper.generateKeyFromDataField(formAnnotation),
          key: `DataPoint::${formAnnotation.qualifier ? formAnnotation.qualifier : ""}`,
          type: FormElementType.Annotation,
          annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(formAnnotation.fullyQualifiedName)}/`
        });
        break;
      case "com.sap.vocabularies.Communication.v1.Contact":
        formElements.push({
          // key: KeyHelper.generateKeyFromDataField(formAnnotation),
          key: `Contact::${formAnnotation.qualifier ? formAnnotation.qualifier : ""}`,
          type: FormElementType.Annotation,
          annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(formAnnotation.fullyQualifiedName)}/`
        });
        break;
      default:
        break;
    }
    return formElements;
  }
  function getFormElementsFromManifest(facetDefinition, converterContext) {
    const manifestWrapper = converterContext.getManifestWrapper();
    const manifestFormContainer = manifestWrapper.getFormContainer(facetDefinition.Target.value);
    const formElements = {};
    if (manifestFormContainer !== null && manifestFormContainer !== void 0 && manifestFormContainer.fields) {
      Object.keys(manifestFormContainer === null || manifestFormContainer === void 0 ? void 0 : manifestFormContainer.fields).forEach(fieldId => {
        formElements[fieldId] = {
          key: fieldId,
          id: `CustomFormElement::${fieldId}`,
          type: manifestFormContainer.fields[fieldId].type || FormElementType.Default,
          template: manifestFormContainer.fields[fieldId].template,
          label: manifestFormContainer.fields[fieldId].label,
          position: manifestFormContainer.fields[fieldId].position || {
            placement: Placement.After
          },
          formatOptions: {
            ...getDefaultFormatOptionsForForm(),
            ...manifestFormContainer.fields[fieldId].formatOptions
          }
        };
      });
    }
    return formElements;
  }
  _exports.getFormElementsFromManifest = getFormElementsFromManifest;
  function getFormContainer(facetDefinition, converterContext, actions) {
    var _facetDefinition$anno5, _facetDefinition$anno6, _resolvedTarget$conve, _facetDefinition$anno7, _facetDefinition$anno8, _facetDefinition$anno9;
    const sFormContainerId = createIdForAnnotation(facetDefinition);
    const sAnnotationPath = converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName);
    const resolvedTarget = converterContext.getEntityTypeAnnotation(facetDefinition.Target.value);
    const isVisible = compileExpression(not(equal(true, getExpressionFromAnnotation((_facetDefinition$anno5 = facetDefinition.annotations) === null || _facetDefinition$anno5 === void 0 ? void 0 : (_facetDefinition$anno6 = _facetDefinition$anno5.UI) === null || _facetDefinition$anno6 === void 0 ? void 0 : _facetDefinition$anno6.Hidden))));
    let sEntitySetPath;
    // resolvedTarget doesn't have a entitySet in case Containments and Paramterized services.
    const entitySet = resolvedTarget.converterContext.getEntitySet();
    if (entitySet && entitySet !== converterContext.getEntitySet()) {
      sEntitySetPath = getTargetEntitySetPath(resolvedTarget.converterContext.getDataModelObjectPath());
    } else if (((_resolvedTarget$conve = resolvedTarget.converterContext.getDataModelObjectPath().targetObject) === null || _resolvedTarget$conve === void 0 ? void 0 : _resolvedTarget$conve.containsTarget) === true) {
      sEntitySetPath = getTargetObjectPath(resolvedTarget.converterContext.getDataModelObjectPath(), false);
    } else if (entitySet && !sEntitySetPath && isSingleton(entitySet)) {
      sEntitySetPath = entitySet.fullyQualifiedName;
    }
    const aFormElements = insertCustomElements(getFormElementsFromAnnotations(facetDefinition, converterContext), getFormElementsFromManifest(facetDefinition, converterContext), {
      formatOptions: OverrideType.overwrite
    });
    actions = actions !== undefined ? actions.filter(action => action.facetName == facetDefinition.fullyQualifiedName) : [];
    if (actions.length === 0) {
      actions = undefined;
    }
    const oActionShowDetails = {
      id: getFormStandardActionButtonID(sFormContainerId, "ShowHideDetails"),
      key: "StandardAction::ShowHideDetails",
      text: compileExpression(ifElse(equal(pathInModel("showDetails", "internal"), true), pathInModel("T_COMMON_OBJECT_PAGE_HIDE_FORM_CONTAINER_DETAILS", "sap.fe.i18n"), pathInModel("T_COMMON_OBJECT_PAGE_SHOW_FORM_CONTAINER_DETAILS", "sap.fe.i18n"))),
      type: ActionType.ShowFormDetails,
      press: "FormContainerRuntime.toggleDetails"
    };
    if (((_facetDefinition$anno7 = facetDefinition.annotations) === null || _facetDefinition$anno7 === void 0 ? void 0 : (_facetDefinition$anno8 = _facetDefinition$anno7.UI) === null || _facetDefinition$anno8 === void 0 ? void 0 : (_facetDefinition$anno9 = _facetDefinition$anno8.PartOfPreview) === null || _facetDefinition$anno9 === void 0 ? void 0 : _facetDefinition$anno9.valueOf()) !== false && aFormElements.some(oFormElement => oFormElement.isPartOfPreview === false)) {
      if (actions !== undefined) {
        actions.push(oActionShowDetails);
      } else {
        actions = [oActionShowDetails];
      }
    }
    return {
      id: sFormContainerId,
      formElements: aFormElements,
      annotationPath: sAnnotationPath,
      isVisible: isVisible,
      entitySet: sEntitySetPath,
      actions: actions
    };
  }
  _exports.getFormContainer = getFormContainer;
  function getFormContainersForCollection(facetDefinition, converterContext, actions) {
    var _facetDefinition$Face;
    const formContainers = [];
    (_facetDefinition$Face = facetDefinition.Facets) === null || _facetDefinition$Face === void 0 ? void 0 : _facetDefinition$Face.forEach(facet => {
      // Ignore level 3 collection facet
      if (facet.$Type === "com.sap.vocabularies.UI.v1.CollectionFacet") {
        return;
      }
      formContainers.push(getFormContainer(facet, converterContext, actions));
    });
    return formContainers;
  }
  function isReferenceFacet(facetDefinition) {
    return facetDefinition.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet";
  }
  _exports.isReferenceFacet = isReferenceFacet;
  function createFormDefinition(facetDefinition, isVisible, converterContext, actions) {
    var _facetDefinition$anno10, _facetDefinition$anno11, _facetDefinition$anno12;
    switch (facetDefinition.$Type) {
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        // Keep only valid children
        return {
          id: getFormID(facetDefinition),
          useFormContainerLabels: true,
          hasFacetsNotPartOfPreview: facetDefinition.Facets.some(childFacet => {
            var _childFacet$annotatio, _childFacet$annotatio2, _childFacet$annotatio3;
            return ((_childFacet$annotatio = childFacet.annotations) === null || _childFacet$annotatio === void 0 ? void 0 : (_childFacet$annotatio2 = _childFacet$annotatio.UI) === null || _childFacet$annotatio2 === void 0 ? void 0 : (_childFacet$annotatio3 = _childFacet$annotatio2.PartOfPreview) === null || _childFacet$annotatio3 === void 0 ? void 0 : _childFacet$annotatio3.valueOf()) === false;
          }),
          formContainers: getFormContainersForCollection(facetDefinition, converterContext, actions),
          isVisible: isVisible
        };
      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        return {
          id: getFormID(facetDefinition),
          useFormContainerLabels: false,
          hasFacetsNotPartOfPreview: ((_facetDefinition$anno10 = facetDefinition.annotations) === null || _facetDefinition$anno10 === void 0 ? void 0 : (_facetDefinition$anno11 = _facetDefinition$anno10.UI) === null || _facetDefinition$anno11 === void 0 ? void 0 : (_facetDefinition$anno12 = _facetDefinition$anno11.PartOfPreview) === null || _facetDefinition$anno12 === void 0 ? void 0 : _facetDefinition$anno12.valueOf()) === false,
          formContainers: [getFormContainer(facetDefinition, converterContext, actions)],
          isVisible: isVisible
        };
      default:
        throw new Error("Cannot create form based on ReferenceURLFacet");
    }
  }
  _exports.createFormDefinition = createFormDefinition;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtRWxlbWVudFR5cGUiLCJnZXREZWZhdWx0Rm9ybWF0T3B0aW9uc0ZvckZvcm0iLCJ0ZXh0TGluZXNFZGl0IiwiaXNGaWVsZFBhcnRPZlByZXZpZXciLCJmaWVsZCIsImZvcm1QYXJ0T2ZQcmV2aWV3IiwidmFsdWVPZiIsImFubm90YXRpb25zIiwiVUkiLCJQYXJ0T2ZQcmV2aWV3IiwidW5kZWZpbmVkIiwiZ2V0Rm9ybUVsZW1lbnRzRnJvbUFubm90YXRpb25zIiwiZmFjZXREZWZpbml0aW9uIiwiY29udmVydGVyQ29udGV4dCIsImZvcm1FbGVtZW50cyIsInJlc29sdmVkVGFyZ2V0IiwiZ2V0RW50aXR5VHlwZUFubm90YXRpb24iLCJUYXJnZXQiLCJ2YWx1ZSIsImZvcm1Bbm5vdGF0aW9uIiwiYW5ub3RhdGlvbiIsImdldERhdGFGaWVsZHNGcm9tQW5ub3RhdGlvbnMiLCJzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoIiwiZ2V0U2VtYW50aWNPYmplY3RQYXRoIiwiJFR5cGUiLCJpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbiIsIkhpZGRlbiIsImZvcm1FbGVtZW50Iiwia2V5IiwiS2V5SGVscGVyIiwiZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkIiwidHlwZSIsIkFubm90YXRpb24iLCJhbm5vdGF0aW9uUGF0aCIsImdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJzZW1hbnRpY09iamVjdFBhdGgiLCJmb3JtYXRPcHRpb25zIiwiaXNQYXJ0T2ZQcmV2aWV3IiwiJHRhcmdldCIsImNvbm5lY3RlZEZpZWxkcyIsIk9iamVjdCIsInZhbHVlcyIsIkRhdGEiLCJmaWx0ZXIiLCJjb25uZWN0ZWRGaWVsZCIsImhhc093blByb3BlcnR5IiwibWFwIiwiY29ubm5lY3RlZEZpZWxkRWxlbWVudCIsInB1c2giLCJ0ZXJtIiwiZm9yRWFjaCIsInF1YWxpZmllciIsImdldEZvcm1FbGVtZW50c0Zyb21NYW5pZmVzdCIsIm1hbmlmZXN0V3JhcHBlciIsImdldE1hbmlmZXN0V3JhcHBlciIsIm1hbmlmZXN0Rm9ybUNvbnRhaW5lciIsImdldEZvcm1Db250YWluZXIiLCJmaWVsZHMiLCJrZXlzIiwiZmllbGRJZCIsImlkIiwiRGVmYXVsdCIsInRlbXBsYXRlIiwibGFiZWwiLCJwb3NpdGlvbiIsInBsYWNlbWVudCIsIlBsYWNlbWVudCIsIkFmdGVyIiwiYWN0aW9ucyIsInNGb3JtQ29udGFpbmVySWQiLCJjcmVhdGVJZEZvckFubm90YXRpb24iLCJzQW5ub3RhdGlvblBhdGgiLCJpc1Zpc2libGUiLCJjb21waWxlRXhwcmVzc2lvbiIsIm5vdCIsImVxdWFsIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwic0VudGl0eVNldFBhdGgiLCJlbnRpdHlTZXQiLCJnZXRFbnRpdHlTZXQiLCJnZXRUYXJnZXRFbnRpdHlTZXRQYXRoIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCIsInRhcmdldE9iamVjdCIsImNvbnRhaW5zVGFyZ2V0IiwiZ2V0VGFyZ2V0T2JqZWN0UGF0aCIsImlzU2luZ2xldG9uIiwiYUZvcm1FbGVtZW50cyIsImluc2VydEN1c3RvbUVsZW1lbnRzIiwiT3ZlcnJpZGVUeXBlIiwib3ZlcndyaXRlIiwiYWN0aW9uIiwiZmFjZXROYW1lIiwibGVuZ3RoIiwib0FjdGlvblNob3dEZXRhaWxzIiwiZ2V0Rm9ybVN0YW5kYXJkQWN0aW9uQnV0dG9uSUQiLCJ0ZXh0IiwiaWZFbHNlIiwicGF0aEluTW9kZWwiLCJBY3Rpb25UeXBlIiwiU2hvd0Zvcm1EZXRhaWxzIiwicHJlc3MiLCJzb21lIiwib0Zvcm1FbGVtZW50IiwiZ2V0Rm9ybUNvbnRhaW5lcnNGb3JDb2xsZWN0aW9uIiwiZm9ybUNvbnRhaW5lcnMiLCJGYWNldHMiLCJmYWNldCIsImlzUmVmZXJlbmNlRmFjZXQiLCJjcmVhdGVGb3JtRGVmaW5pdGlvbiIsImdldEZvcm1JRCIsInVzZUZvcm1Db250YWluZXJMYWJlbHMiLCJoYXNGYWNldHNOb3RQYXJ0T2ZQcmV2aWV3IiwiY2hpbGRGYWNldCIsIkVycm9yIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGb3JtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQ29udGFjdCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbXVuaWNhdGlvblwiO1xuaW1wb3J0IHsgQ29tbXVuaWNhdGlvbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbXVuaWNhdGlvblwiO1xuaW1wb3J0IHR5cGUge1xuXHRDb2xsZWN0aW9uRmFjZXRUeXBlcyxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RGF0YVBvaW50LFxuXHRGYWNldFR5cGVzLFxuXHRGaWVsZEdyb3VwLFxuXHRJZGVudGlmaWNhdGlvbixcblx0UGFydE9mUHJldmlldyxcblx0UmVmZXJlbmNlRmFjZXRUeXBlc1xufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UZXJtcywgVUlBbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBnZXRTZW1hbnRpY09iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9hbm5vdGF0aW9ucy9EYXRhRmllbGRcIjtcbmltcG9ydCB0eXBlIHsgQmFzZUFjdGlvbiwgQ29udmVydGVyQWN0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBjb21waWxlRXhwcmVzc2lvbiwgZXF1YWwsIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiwgaWZFbHNlLCBub3QsIHBhdGhJbk1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGlzU2luZ2xldG9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IHsgZ2V0VGFyZ2V0RW50aXR5U2V0UGF0aCwgZ2V0VGFyZ2V0T2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGNyZWF0ZUlkRm9yQW5ub3RhdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCIuLi8uLi9Db252ZXJ0ZXJDb250ZXh0XCI7XG5pbXBvcnQgdHlwZSB7IENvbmZpZ3VyYWJsZU9iamVjdCwgQ3VzdG9tRWxlbWVudCB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgaW5zZXJ0Q3VzdG9tRWxlbWVudHMsIE92ZXJyaWRlVHlwZSwgUGxhY2VtZW50IH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbiB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0RhdGFGaWVsZEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0Rm9ybUlELCBnZXRGb3JtU3RhbmRhcmRBY3Rpb25CdXR0b25JRCB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0lEXCI7XG5pbXBvcnQgeyBLZXlIZWxwZXIgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9LZXlcIjtcbmltcG9ydCB0eXBlIHsgRm9ybWF0T3B0aW9uc1R5cGUsIEZvcm1NYW5pZmVzdENvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgQWN0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5cbmV4cG9ydCB0eXBlIEZvcm1EZWZpbml0aW9uID0ge1xuXHRpZDogc3RyaW5nO1xuXHR1c2VGb3JtQ29udGFpbmVyTGFiZWxzOiBib29sZWFuO1xuXHRoYXNGYWNldHNOb3RQYXJ0T2ZQcmV2aWV3OiBib29sZWFuO1xuXHRmb3JtQ29udGFpbmVyczogRm9ybUNvbnRhaW5lcltdO1xuXHRpc1Zpc2libGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xufTtcblxuZXhwb3J0IGVudW0gRm9ybUVsZW1lbnRUeXBlIHtcblx0RGVmYXVsdCA9IFwiRGVmYXVsdFwiLFxuXHRTbG90ID0gXCJTbG90XCIsXG5cdEFubm90YXRpb24gPSBcIkFubm90YXRpb25cIlxufVxuXG5leHBvcnQgdHlwZSBCYXNlRm9ybUVsZW1lbnQgPSBDb25maWd1cmFibGVPYmplY3QgJiB7XG5cdGlkPzogc3RyaW5nO1xuXHR0eXBlOiBGb3JtRWxlbWVudFR5cGU7XG5cdGxhYmVsPzogc3RyaW5nO1xuXHR2aXNpYmxlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGZvcm1hdE9wdGlvbnM/OiBGb3JtYXRPcHRpb25zVHlwZTtcbn07XG5cbmV4cG9ydCB0eXBlIEFubm90YXRpb25Gb3JtRWxlbWVudCA9IEJhc2VGb3JtRWxlbWVudCAmIHtcblx0aWRQcmVmaXg/OiBzdHJpbmc7XG5cdGFubm90YXRpb25QYXRoPzogc3RyaW5nO1xuXHRpc1ZhbHVlTXVsdGlsaW5lVGV4dD86IGJvb2xlYW47XG5cdHNlbWFudGljT2JqZWN0UGF0aD86IHN0cmluZztcblx0Y29ubmVjdGVkRmllbGRzPzogeyBzZW1hbnRpY09iamVjdFBhdGg/OiBzdHJpbmcgfVtdO1xuXHRpc1BhcnRPZlByZXZpZXc/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgQ3VzdG9tRm9ybUVsZW1lbnQgPSBDdXN0b21FbGVtZW50PFxuXHRCYXNlRm9ybUVsZW1lbnQgJiB7XG5cdFx0dHlwZTogRm9ybUVsZW1lbnRUeXBlO1xuXHRcdHRlbXBsYXRlOiBzdHJpbmc7XG5cdH1cbj47XG5cbmV4cG9ydCB0eXBlIEZvcm1FbGVtZW50ID0gQ3VzdG9tRm9ybUVsZW1lbnQgfCBBbm5vdGF0aW9uRm9ybUVsZW1lbnQ7XG5cbmV4cG9ydCB0eXBlIEZvcm1Db250YWluZXIgPSB7XG5cdGlkPzogc3RyaW5nO1xuXHRmb3JtRWxlbWVudHM6IEZvcm1FbGVtZW50W107XG5cdGFubm90YXRpb25QYXRoOiBzdHJpbmc7XG5cdGlzVmlzaWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGVudGl0eVNldD86IHN0cmluZztcblx0YWN0aW9ucz86IENvbnZlcnRlckFjdGlvbltdIHwgQmFzZUFjdGlvbltdO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGRlZmF1bHQgZm9ybWF0IG9wdGlvbnMgZm9yIHRleHQgZmllbGRzIG9uIGEgZm9ybS5cbiAqXG4gKiBAcmV0dXJucyBDb2xsZWN0aW9uIG9mIGZvcm1hdCBvcHRpb25zIHdpdGggZGVmYXVsdCB2YWx1ZXNcbiAqL1xuZnVuY3Rpb24gZ2V0RGVmYXVsdEZvcm1hdE9wdGlvbnNGb3JGb3JtKCk6IEZvcm1hdE9wdGlvbnNUeXBlIHtcblx0cmV0dXJuIHtcblx0XHR0ZXh0TGluZXNFZGl0OiA0XG5cdH07XG59XG5cbmZ1bmN0aW9uIGlzRmllbGRQYXJ0T2ZQcmV2aWV3KGZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLCBmb3JtUGFydE9mUHJldmlldz86IFBhcnRPZlByZXZpZXcpOiBib29sZWFuIHtcblx0Ly8gQm90aCBlYWNoIGZvcm0gYW5kIGZpZWxkIGNhbiBoYXZlIHRoZSBQYXJ0T2ZQcmV2aWV3IGFubm90YXRpb24uIE9ubHkgaWYgdGhlIGZvcm0gaXMgbm90IGhpZGRlbiAobm90IHBhcnRPZlByZXZpZXcpIHdlIGFsbG93IHRvZ2dsaW5nIG9uIGZpZWxkIGxldmVsXG5cdHJldHVybiAoXG5cdFx0Zm9ybVBhcnRPZlByZXZpZXc/LnZhbHVlT2YoKSA9PT0gZmFsc2UgfHxcblx0XHRmaWVsZC5hbm5vdGF0aW9ucz8uVUk/LlBhcnRPZlByZXZpZXcgPT09IHVuZGVmaW5lZCB8fFxuXHRcdGZpZWxkLmFubm90YXRpb25zPy5VST8uUGFydE9mUHJldmlldy52YWx1ZU9mKCkgPT09IHRydWVcblx0KTtcbn1cblxuZnVuY3Rpb24gZ2V0Rm9ybUVsZW1lbnRzRnJvbUFubm90YXRpb25zKGZhY2V0RGVmaW5pdGlvbjogUmVmZXJlbmNlRmFjZXRUeXBlcywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IEFubm90YXRpb25Gb3JtRWxlbWVudFtdIHtcblx0Y29uc3QgZm9ybUVsZW1lbnRzOiBBbm5vdGF0aW9uRm9ybUVsZW1lbnRbXSA9IFtdO1xuXHRjb25zdCByZXNvbHZlZFRhcmdldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24oZmFjZXREZWZpbml0aW9uLlRhcmdldC52YWx1ZSk7XG5cdGNvbnN0IGZvcm1Bbm5vdGF0aW9uOiBJZGVudGlmaWNhdGlvbiB8IEZpZWxkR3JvdXAgfCBDb250YWN0IHwgRGF0YVBvaW50ID0gcmVzb2x2ZWRUYXJnZXQuYW5ub3RhdGlvbjtcblx0Y29udmVydGVyQ29udGV4dCA9IHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHQ7XG5cblx0ZnVuY3Rpb24gZ2V0RGF0YUZpZWxkc0Zyb21Bbm5vdGF0aW9ucyhmaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcywgZm9ybVBhcnRPZlByZXZpZXc6IFBhcnRPZlByZXZpZXcgfCB1bmRlZmluZWQpIHtcblx0XHRjb25zdCBzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoID0gZ2V0U2VtYW50aWNPYmplY3RQYXRoKGNvbnZlcnRlckNvbnRleHQsIGZpZWxkKTtcblx0XHRpZiAoXG5cdFx0XHRmaWVsZC4kVHlwZSAhPT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uICYmXG5cdFx0XHRmaWVsZC4kVHlwZSAhPT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uICYmXG5cdFx0XHQhaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4oZmllbGQpICYmXG5cdFx0XHRmaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpICE9PSB0cnVlXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBmb3JtRWxlbWVudCA9IHtcblx0XHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGZpZWxkKSxcblx0XHRcdFx0dHlwZTogRm9ybUVsZW1lbnRUeXBlLkFubm90YXRpb24sXG5cdFx0XHRcdGFubm90YXRpb25QYXRoOiBgJHtjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoZmllbGQuZnVsbHlRdWFsaWZpZWROYW1lKX0vYCxcblx0XHRcdFx0c2VtYW50aWNPYmplY3RQYXRoOiBzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoLFxuXHRcdFx0XHRmb3JtYXRPcHRpb25zOiBnZXREZWZhdWx0Rm9ybWF0T3B0aW9uc0ZvckZvcm0oKSxcblx0XHRcdFx0aXNQYXJ0T2ZQcmV2aWV3OiBpc0ZpZWxkUGFydE9mUHJldmlldyhmaWVsZCwgZm9ybVBhcnRPZlByZXZpZXcpXG5cdFx0XHR9O1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRmaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCIgJiZcblx0XHRcdFx0ZmllbGQuVGFyZ2V0LiR0YXJnZXQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ29ubmVjdGVkRmllbGRzVHlwZVwiXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3QgY29ubmVjdGVkRmllbGRzID0gT2JqZWN0LnZhbHVlcyhmaWVsZC5UYXJnZXQuJHRhcmdldC5EYXRhKS5maWx0ZXIoKGNvbm5lY3RlZEZpZWxkOiB1bmtub3duKSA9PlxuXHRcdFx0XHRcdChjb25uZWN0ZWRGaWVsZCBhcyBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKT8uaGFzT3duUHJvcGVydHkoXCJWYWx1ZVwiKVxuXHRcdFx0XHQpIGFzIERhdGFGaWVsZEFic3RyYWN0VHlwZXNbXTtcblx0XHRcdFx0KGZvcm1FbGVtZW50IGFzIEFubm90YXRpb25Gb3JtRWxlbWVudCkuY29ubmVjdGVkRmllbGRzID0gY29ubmVjdGVkRmllbGRzLm1hcCgoY29ubm5lY3RlZEZpZWxkRWxlbWVudCkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiB7IHNlbWFudGljT2JqZWN0UGF0aDogZ2V0U2VtYW50aWNPYmplY3RQYXRoKGNvbnZlcnRlckNvbnRleHQsIGNvbm5uZWN0ZWRGaWVsZEVsZW1lbnQpIH07XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0Zm9ybUVsZW1lbnRzLnB1c2goZm9ybUVsZW1lbnQpO1xuXHRcdH1cblx0fVxuXG5cdHN3aXRjaCAoZm9ybUFubm90YXRpb24/LnRlcm0pIHtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLkZpZWxkR3JvdXA6XG5cdFx0XHRmb3JtQW5ub3RhdGlvbi5EYXRhLmZvckVhY2goKGZpZWxkKSA9PiBnZXREYXRhRmllbGRzRnJvbUFubm90YXRpb25zKGZpZWxkLCBmYWNldERlZmluaXRpb24uYW5ub3RhdGlvbnM/LlVJPy5QYXJ0T2ZQcmV2aWV3KSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLklkZW50aWZpY2F0aW9uOlxuXHRcdFx0Zm9ybUFubm90YXRpb24uZm9yRWFjaCgoZmllbGQpID0+IGdldERhdGFGaWVsZHNGcm9tQW5ub3RhdGlvbnMoZmllbGQsIGZhY2V0RGVmaW5pdGlvbi5hbm5vdGF0aW9ucz8uVUk/LlBhcnRPZlByZXZpZXcpKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuRGF0YVBvaW50OlxuXHRcdFx0Zm9ybUVsZW1lbnRzLnB1c2goe1xuXHRcdFx0XHQvLyBrZXk6IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZm9ybUFubm90YXRpb24pLFxuXHRcdFx0XHRrZXk6IGBEYXRhUG9pbnQ6OiR7Zm9ybUFubm90YXRpb24ucXVhbGlmaWVyID8gZm9ybUFubm90YXRpb24ucXVhbGlmaWVyIDogXCJcIn1gLFxuXHRcdFx0XHR0eXBlOiBGb3JtRWxlbWVudFR5cGUuQW5ub3RhdGlvbixcblx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGAke2NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChmb3JtQW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWUpfS9gXG5cdFx0XHR9KTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgQ29tbXVuaWNhdGlvbkFubm90YXRpb25UZXJtcy5Db250YWN0OlxuXHRcdFx0Zm9ybUVsZW1lbnRzLnB1c2goe1xuXHRcdFx0XHQvLyBrZXk6IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZm9ybUFubm90YXRpb24pLFxuXHRcdFx0XHRrZXk6IGBDb250YWN0Ojoke2Zvcm1Bbm5vdGF0aW9uLnF1YWxpZmllciA/IGZvcm1Bbm5vdGF0aW9uLnF1YWxpZmllciA6IFwiXCJ9YCxcblx0XHRcdFx0dHlwZTogRm9ybUVsZW1lbnRUeXBlLkFubm90YXRpb24sXG5cdFx0XHRcdGFubm90YXRpb25QYXRoOiBgJHtjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoZm9ybUFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lKX0vYFxuXHRcdFx0fSk7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0YnJlYWs7XG5cdH1cblx0cmV0dXJuIGZvcm1FbGVtZW50cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZvcm1FbGVtZW50c0Zyb21NYW5pZmVzdChcblx0ZmFjZXREZWZpbml0aW9uOiBSZWZlcmVuY2VGYWNldFR5cGVzLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21Gb3JtRWxlbWVudD4ge1xuXHRjb25zdCBtYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCBtYW5pZmVzdEZvcm1Db250YWluZXI6IEZvcm1NYW5pZmVzdENvbmZpZ3VyYXRpb24gPSBtYW5pZmVzdFdyYXBwZXIuZ2V0Rm9ybUNvbnRhaW5lcihmYWNldERlZmluaXRpb24uVGFyZ2V0LnZhbHVlKTtcblx0Y29uc3QgZm9ybUVsZW1lbnRzOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21Gb3JtRWxlbWVudD4gPSB7fTtcblx0aWYgKG1hbmlmZXN0Rm9ybUNvbnRhaW5lcj8uZmllbGRzKSB7XG5cdFx0T2JqZWN0LmtleXMobWFuaWZlc3RGb3JtQ29udGFpbmVyPy5maWVsZHMpLmZvckVhY2goKGZpZWxkSWQpID0+IHtcblx0XHRcdGZvcm1FbGVtZW50c1tmaWVsZElkXSA9IHtcblx0XHRcdFx0a2V5OiBmaWVsZElkLFxuXHRcdFx0XHRpZDogYEN1c3RvbUZvcm1FbGVtZW50Ojoke2ZpZWxkSWR9YCxcblx0XHRcdFx0dHlwZTogbWFuaWZlc3RGb3JtQ29udGFpbmVyLmZpZWxkc1tmaWVsZElkXS50eXBlIHx8IEZvcm1FbGVtZW50VHlwZS5EZWZhdWx0LFxuXHRcdFx0XHR0ZW1wbGF0ZTogbWFuaWZlc3RGb3JtQ29udGFpbmVyLmZpZWxkc1tmaWVsZElkXS50ZW1wbGF0ZSxcblx0XHRcdFx0bGFiZWw6IG1hbmlmZXN0Rm9ybUNvbnRhaW5lci5maWVsZHNbZmllbGRJZF0ubGFiZWwsXG5cdFx0XHRcdHBvc2l0aW9uOiBtYW5pZmVzdEZvcm1Db250YWluZXIuZmllbGRzW2ZpZWxkSWRdLnBvc2l0aW9uIHx8IHtcblx0XHRcdFx0XHRwbGFjZW1lbnQ6IFBsYWNlbWVudC5BZnRlclxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmb3JtYXRPcHRpb25zOiB7XG5cdFx0XHRcdFx0Li4uZ2V0RGVmYXVsdEZvcm1hdE9wdGlvbnNGb3JGb3JtKCksXG5cdFx0XHRcdFx0Li4ubWFuaWZlc3RGb3JtQ29udGFpbmVyLmZpZWxkc1tmaWVsZElkXS5mb3JtYXRPcHRpb25zXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGZvcm1FbGVtZW50cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZvcm1Db250YWluZXIoXG5cdGZhY2V0RGVmaW5pdGlvbjogUmVmZXJlbmNlRmFjZXRUeXBlcyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0YWN0aW9ucz86IEJhc2VBY3Rpb25bXSB8IENvbnZlcnRlckFjdGlvbltdXG4pOiBGb3JtQ29udGFpbmVyIHtcblx0Y29uc3Qgc0Zvcm1Db250YWluZXJJZCA9IGNyZWF0ZUlkRm9yQW5ub3RhdGlvbihmYWNldERlZmluaXRpb24pIGFzIHN0cmluZztcblx0Y29uc3Qgc0Fubm90YXRpb25QYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGZhY2V0RGVmaW5pdGlvbi5mdWxseVF1YWxpZmllZE5hbWUpO1xuXHRjb25zdCByZXNvbHZlZFRhcmdldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24oZmFjZXREZWZpbml0aW9uLlRhcmdldC52YWx1ZSk7XG5cdGNvbnN0IGlzVmlzaWJsZSA9IGNvbXBpbGVFeHByZXNzaW9uKG5vdChlcXVhbCh0cnVlLCBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZmFjZXREZWZpbml0aW9uLmFubm90YXRpb25zPy5VST8uSGlkZGVuKSkpKTtcblx0bGV0IHNFbnRpdHlTZXRQYXRoITogc3RyaW5nO1xuXHQvLyByZXNvbHZlZFRhcmdldCBkb2Vzbid0IGhhdmUgYSBlbnRpdHlTZXQgaW4gY2FzZSBDb250YWlubWVudHMgYW5kIFBhcmFtdGVyaXplZCBzZXJ2aWNlcy5cblx0Y29uc3QgZW50aXR5U2V0ID0gcmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0aWYgKGVudGl0eVNldCAmJiBlbnRpdHlTZXQgIT09IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkpIHtcblx0XHRzRW50aXR5U2V0UGF0aCA9IGdldFRhcmdldEVudGl0eVNldFBhdGgocmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkpO1xuXHR9IGVsc2UgaWYgKHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLnRhcmdldE9iamVjdD8uY29udGFpbnNUYXJnZXQgPT09IHRydWUpIHtcblx0XHRzRW50aXR5U2V0UGF0aCA9IGdldFRhcmdldE9iamVjdFBhdGgocmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCksIGZhbHNlKTtcblx0fSBlbHNlIGlmIChlbnRpdHlTZXQgJiYgIXNFbnRpdHlTZXRQYXRoICYmIGlzU2luZ2xldG9uKGVudGl0eVNldCkpIHtcblx0XHRzRW50aXR5U2V0UGF0aCA9IGVudGl0eVNldC5mdWxseVF1YWxpZmllZE5hbWU7XG5cdH1cblx0Y29uc3QgYUZvcm1FbGVtZW50cyA9IGluc2VydEN1c3RvbUVsZW1lbnRzKFxuXHRcdGdldEZvcm1FbGVtZW50c0Zyb21Bbm5vdGF0aW9ucyhmYWNldERlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdGdldEZvcm1FbGVtZW50c0Zyb21NYW5pZmVzdChmYWNldERlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdHsgZm9ybWF0T3B0aW9uczogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSB9XG5cdCk7XG5cblx0YWN0aW9ucyA9IGFjdGlvbnMgIT09IHVuZGVmaW5lZCA/IGFjdGlvbnMuZmlsdGVyKChhY3Rpb24pID0+IGFjdGlvbi5mYWNldE5hbWUgPT0gZmFjZXREZWZpbml0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSkgOiBbXTtcblx0aWYgKGFjdGlvbnMubGVuZ3RoID09PSAwKSB7XG5cdFx0YWN0aW9ucyA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdGNvbnN0IG9BY3Rpb25TaG93RGV0YWlsczogQmFzZUFjdGlvbiA9IHtcblx0XHRpZDogZ2V0Rm9ybVN0YW5kYXJkQWN0aW9uQnV0dG9uSUQoc0Zvcm1Db250YWluZXJJZCwgXCJTaG93SGlkZURldGFpbHNcIiksXG5cdFx0a2V5OiBcIlN0YW5kYXJkQWN0aW9uOjpTaG93SGlkZURldGFpbHNcIixcblx0XHR0ZXh0OiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdGlmRWxzZShcblx0XHRcdFx0ZXF1YWwocGF0aEluTW9kZWwoXCJzaG93RGV0YWlsc1wiLCBcImludGVybmFsXCIpLCB0cnVlKSxcblx0XHRcdFx0cGF0aEluTW9kZWwoXCJUX0NPTU1PTl9PQkpFQ1RfUEFHRV9ISURFX0ZPUk1fQ09OVEFJTkVSX0RFVEFJTFNcIiwgXCJzYXAuZmUuaTE4blwiKSxcblx0XHRcdFx0cGF0aEluTW9kZWwoXCJUX0NPTU1PTl9PQkpFQ1RfUEFHRV9TSE9XX0ZPUk1fQ09OVEFJTkVSX0RFVEFJTFNcIiwgXCJzYXAuZmUuaTE4blwiKVxuXHRcdFx0KVxuXHRcdCksXG5cdFx0dHlwZTogQWN0aW9uVHlwZS5TaG93Rm9ybURldGFpbHMsXG5cdFx0cHJlc3M6IFwiRm9ybUNvbnRhaW5lclJ1bnRpbWUudG9nZ2xlRGV0YWlsc1wiXG5cdH07XG5cblx0aWYgKFxuXHRcdGZhY2V0RGVmaW5pdGlvbi5hbm5vdGF0aW9ucz8uVUk/LlBhcnRPZlByZXZpZXc/LnZhbHVlT2YoKSAhPT0gZmFsc2UgJiZcblx0XHRhRm9ybUVsZW1lbnRzLnNvbWUoKG9Gb3JtRWxlbWVudCkgPT4gb0Zvcm1FbGVtZW50LmlzUGFydE9mUHJldmlldyA9PT0gZmFsc2UpXG5cdCkge1xuXHRcdGlmIChhY3Rpb25zICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGFjdGlvbnMucHVzaChvQWN0aW9uU2hvd0RldGFpbHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhY3Rpb25zID0gW29BY3Rpb25TaG93RGV0YWlsc107XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRpZDogc0Zvcm1Db250YWluZXJJZCxcblx0XHRmb3JtRWxlbWVudHM6IGFGb3JtRWxlbWVudHMsXG5cdFx0YW5ub3RhdGlvblBhdGg6IHNBbm5vdGF0aW9uUGF0aCxcblx0XHRpc1Zpc2libGU6IGlzVmlzaWJsZSxcblx0XHRlbnRpdHlTZXQ6IHNFbnRpdHlTZXRQYXRoLFxuXHRcdGFjdGlvbnM6IGFjdGlvbnNcblx0fTtcbn1cblxuZnVuY3Rpb24gZ2V0Rm9ybUNvbnRhaW5lcnNGb3JDb2xsZWN0aW9uKFxuXHRmYWNldERlZmluaXRpb246IENvbGxlY3Rpb25GYWNldFR5cGVzLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRhY3Rpb25zPzogQmFzZUFjdGlvbltdIHwgQ29udmVydGVyQWN0aW9uW11cbik6IEZvcm1Db250YWluZXJbXSB7XG5cdGNvbnN0IGZvcm1Db250YWluZXJzOiBGb3JtQ29udGFpbmVyW10gPSBbXTtcblx0ZmFjZXREZWZpbml0aW9uLkZhY2V0cz8uZm9yRWFjaCgoZmFjZXQpID0+IHtcblx0XHQvLyBJZ25vcmUgbGV2ZWwgMyBjb2xsZWN0aW9uIGZhY2V0XG5cdFx0aWYgKGZhY2V0LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5Db2xsZWN0aW9uRmFjZXQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Zm9ybUNvbnRhaW5lcnMucHVzaChnZXRGb3JtQ29udGFpbmVyKGZhY2V0IGFzIFJlZmVyZW5jZUZhY2V0VHlwZXMsIGNvbnZlcnRlckNvbnRleHQsIGFjdGlvbnMpKTtcblx0fSk7XG5cdHJldHVybiBmb3JtQ29udGFpbmVycztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVmZXJlbmNlRmFjZXQoZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzKTogZmFjZXREZWZpbml0aW9uIGlzIFJlZmVyZW5jZUZhY2V0VHlwZXMge1xuXHRyZXR1cm4gZmFjZXREZWZpbml0aW9uLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZvcm1EZWZpbml0aW9uKFxuXHRmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsXG5cdGlzVmlzaWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGFjdGlvbnM/OiBCYXNlQWN0aW9uW10gfCBDb252ZXJ0ZXJBY3Rpb25bXVxuKTogRm9ybURlZmluaXRpb24ge1xuXHRzd2l0Y2ggKGZhY2V0RGVmaW5pdGlvbi4kVHlwZSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0OlxuXHRcdFx0Ly8gS2VlcCBvbmx5IHZhbGlkIGNoaWxkcmVuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRpZDogZ2V0Rm9ybUlEKGZhY2V0RGVmaW5pdGlvbiksXG5cdFx0XHRcdHVzZUZvcm1Db250YWluZXJMYWJlbHM6IHRydWUsXG5cdFx0XHRcdGhhc0ZhY2V0c05vdFBhcnRPZlByZXZpZXc6IGZhY2V0RGVmaW5pdGlvbi5GYWNldHMuc29tZShcblx0XHRcdFx0XHQoY2hpbGRGYWNldCkgPT4gY2hpbGRGYWNldC5hbm5vdGF0aW9ucz8uVUk/LlBhcnRPZlByZXZpZXc/LnZhbHVlT2YoKSA9PT0gZmFsc2Vcblx0XHRcdFx0KSxcblx0XHRcdFx0Zm9ybUNvbnRhaW5lcnM6IGdldEZvcm1Db250YWluZXJzRm9yQ29sbGVjdGlvbihmYWNldERlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQsIGFjdGlvbnMpLFxuXHRcdFx0XHRpc1Zpc2libGU6IGlzVmlzaWJsZVxuXHRcdFx0fTtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0OlxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aWQ6IGdldEZvcm1JRChmYWNldERlZmluaXRpb24pLFxuXHRcdFx0XHR1c2VGb3JtQ29udGFpbmVyTGFiZWxzOiBmYWxzZSxcblx0XHRcdFx0aGFzRmFjZXRzTm90UGFydE9mUHJldmlldzogZmFjZXREZWZpbml0aW9uLmFubm90YXRpb25zPy5VST8uUGFydE9mUHJldmlldz8udmFsdWVPZigpID09PSBmYWxzZSxcblx0XHRcdFx0Zm9ybUNvbnRhaW5lcnM6IFtnZXRGb3JtQ29udGFpbmVyKGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCwgYWN0aW9ucyldLFxuXHRcdFx0XHRpc1Zpc2libGU6IGlzVmlzaWJsZVxuXHRcdFx0fTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNyZWF0ZSBmb3JtIGJhc2VkIG9uIFJlZmVyZW5jZVVSTEZhY2V0XCIpO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQXFDWUEsZUFBZTtFQUFBLFdBQWZBLGVBQWU7SUFBZkEsZUFBZTtJQUFmQSxlQUFlO0lBQWZBLGVBQWU7RUFBQSxHQUFmQSxlQUFlLEtBQWZBLGVBQWU7RUFBQTtFQXlDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNDLDhCQUE4QixHQUFzQjtJQUM1RCxPQUFPO01BQ05DLGFBQWEsRUFBRTtJQUNoQixDQUFDO0VBQ0Y7RUFFQSxTQUFTQyxvQkFBb0IsQ0FBQ0MsS0FBNkIsRUFBRUMsaUJBQWlDLEVBQVc7SUFBQTtJ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