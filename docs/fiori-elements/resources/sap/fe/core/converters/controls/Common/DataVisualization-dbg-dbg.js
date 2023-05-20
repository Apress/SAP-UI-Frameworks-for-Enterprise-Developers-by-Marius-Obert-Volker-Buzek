/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/MetaModelConverter", "sap/fe/macros/CommonHelper", "../../ManifestSettings", "./Chart", "./Table"], function (IssueManager, MetaModelConverter, CommonHelper, ManifestSettings, Chart, Table) {
  "use strict";

  var _exports = {};
  var createChartVisualization = Chart.createChartVisualization;
  var createBlankChartVisualization = Chart.createBlankChartVisualization;
  var TemplateType = ManifestSettings.TemplateType;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategory = IssueManager.IssueCategory;
  const getVisualizationsFromPresentationVariant = function (presentationVariantAnnotation, visualizationPath, converterContext, isMacroOrMultipleView) {
    const visualizationAnnotations = [];
    const isALP = isAlpAnnotation(converterContext);
    const baseVisualizationPath = visualizationPath.split("@")[0];
    if ((isMacroOrMultipleView === true || isALP) && !isPresentationCompliant(presentationVariantAnnotation, isALP)) {
      if (!annotationExistsInPresentationVariant(presentationVariantAnnotation, "com.sap.vocabularies.UI.v1.LineItem")) {
        const defaultLineItemAnnotation = prepareDefaultVisualization("com.sap.vocabularies.UI.v1.LineItem", baseVisualizationPath, converterContext);
        if (defaultLineItemAnnotation) {
          visualizationAnnotations.push(defaultLineItemAnnotation);
        }
      }
      if (!annotationExistsInPresentationVariant(presentationVariantAnnotation, "com.sap.vocabularies.UI.v1.Chart")) {
        const defaultChartAnnotation = prepareDefaultVisualization("com.sap.vocabularies.UI.v1.Chart", baseVisualizationPath, converterContext);
        if (defaultChartAnnotation) {
          visualizationAnnotations.push(defaultChartAnnotation);
        }
      }
    }
    const visualizations = presentationVariantAnnotation.Visualizations;
    const pushFirstVizOfType = function (allowedTerms) {
      const firstViz = visualizations === null || visualizations === void 0 ? void 0 : visualizations.find(viz => {
        var _viz$$target;
        return allowedTerms.indexOf((_viz$$target = viz.$target) === null || _viz$$target === void 0 ? void 0 : _viz$$target.term) >= 0;
      });
      if (firstViz) {
        visualizationAnnotations.push({
          visualization: firstViz.$target,
          annotationPath: `${baseVisualizationPath}${firstViz.value}`,
          converterContext: converterContext
        });
      }
    };
    if (isALP) {
      // In case of ALP, we use the first LineItem and the first Chart
      pushFirstVizOfType(["com.sap.vocabularies.UI.v1.LineItem"]);
      pushFirstVizOfType(["com.sap.vocabularies.UI.v1.Chart"]);
    } else {
      // Otherwise, we use the first viz only (Chart or LineItem)
      pushFirstVizOfType(["com.sap.vocabularies.UI.v1.LineItem", "com.sap.vocabularies.UI.v1.Chart"]);
    }
    return visualizationAnnotations;
  };
  _exports.getVisualizationsFromPresentationVariant = getVisualizationsFromPresentationVariant;
  function getSelectionPresentationVariant(entityType, annotationPath, converterContext) {
    if (annotationPath) {
      const resolvedTarget = converterContext.getEntityTypeAnnotation(annotationPath);
      const selectionPresentationVariant = resolvedTarget.annotation;
      if (selectionPresentationVariant) {
        if (selectionPresentationVariant.term === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant") {
          return selectionPresentationVariant;
        }
      } else {
        throw new Error("Annotation Path for the SPV mentioned in the manifest is not found, Please add the SPV in the annotation");
      }
    } else {
      var _entityType$annotatio, _entityType$annotatio2;
      return (_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : _entityType$annotatio2.SelectionPresentationVariant;
    }
  }
  _exports.getSelectionPresentationVariant = getSelectionPresentationVariant;
  function isSelectionPresentationCompliant(selectionPresentationVariant, isALP) {
    const presentationVariant = selectionPresentationVariant && selectionPresentationVariant.PresentationVariant;
    if (presentationVariant) {
      return isPresentationCompliant(presentationVariant, isALP);
    } else {
      throw new Error("Presentation Variant is not present in the SPV annotation");
    }
  }
  _exports.isSelectionPresentationCompliant = isSelectionPresentationCompliant;
  function isPresentationCompliant(presentationVariant) {
    let isALP = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let hasTable = false,
      hasChart = false;
    if (isALP) {
      if (presentationVariant !== null && presentationVariant !== void 0 && presentationVariant.Visualizations) {
        const visualizations = presentationVariant.Visualizations;
        visualizations.forEach(visualization => {
          var _visualization$$targe, _visualization$$targe2;
          if (((_visualization$$targe = visualization.$target) === null || _visualization$$targe === void 0 ? void 0 : _visualization$$targe.term) === "com.sap.vocabularies.UI.v1.LineItem") {
            hasTable = true;
          }
          if (((_visualization$$targe2 = visualization.$target) === null || _visualization$$targe2 === void 0 ? void 0 : _visualization$$targe2.term) === "com.sap.vocabularies.UI.v1.Chart") {
            hasChart = true;
          }
        });
      }
      return hasChart && hasTable;
    } else {
      return (presentationVariant === null || presentationVariant === void 0 ? void 0 : presentationVariant.Visualizations) && !!presentationVariant.Visualizations.find(visualization => {
        var _visualization$$targe3, _visualization$$targe4;
        return ((_visualization$$targe3 = visualization.$target) === null || _visualization$$targe3 === void 0 ? void 0 : _visualization$$targe3.term) === "com.sap.vocabularies.UI.v1.LineItem" || ((_visualization$$targe4 = visualization.$target) === null || _visualization$$targe4 === void 0 ? void 0 : _visualization$$targe4.term) === "com.sap.vocabularies.UI.v1.Chart";
      });
    }
  }
  _exports.isPresentationCompliant = isPresentationCompliant;
  function getDefaultLineItem(entityType) {
    var _entityType$annotatio3;
    return (_entityType$annotatio3 = entityType.annotations.UI) === null || _entityType$annotatio3 === void 0 ? void 0 : _entityType$annotatio3.LineItem;
  }
  _exports.getDefaultLineItem = getDefaultLineItem;
  function getDefaultChart(entityType) {
    var _entityType$annotatio4;
    return (_entityType$annotatio4 = entityType.annotations.UI) === null || _entityType$annotatio4 === void 0 ? void 0 : _entityType$annotatio4.Chart;
  }
  _exports.getDefaultChart = getDefaultChart;
  function getDefaultPresentationVariant(entityType) {
    var _entityType$annotatio5, _entityType$annotatio6;
    return (_entityType$annotatio5 = entityType.annotations) === null || _entityType$annotatio5 === void 0 ? void 0 : (_entityType$annotatio6 = _entityType$annotatio5.UI) === null || _entityType$annotatio6 === void 0 ? void 0 : _entityType$annotatio6.PresentationVariant;
  }
  _exports.getDefaultPresentationVariant = getDefaultPresentationVariant;
  function getDefaultSelectionVariant(entityType) {
    var _entityType$annotatio7, _entityType$annotatio8;
    return (_entityType$annotatio7 = entityType.annotations) === null || _entityType$annotatio7 === void 0 ? void 0 : (_entityType$annotatio8 = _entityType$annotatio7.UI) === null || _entityType$annotatio8 === void 0 ? void 0 : _entityType$annotatio8.SelectionVariant;
  }
  _exports.getDefaultSelectionVariant = getDefaultSelectionVariant;
  function getSelectionVariant(entityType, converterContext) {
    const annotationPath = converterContext.getManifestWrapper().getDefaultTemplateAnnotationPath();
    const selectionPresentationVariant = getSelectionPresentationVariant(entityType, annotationPath, converterContext);
    let selectionVariant;
    if (selectionPresentationVariant) {
      selectionVariant = selectionPresentationVariant.SelectionVariant;
      if (selectionVariant) {
        return selectionVariant;
      }
    } else {
      selectionVariant = getDefaultSelectionVariant(entityType);
      return selectionVariant;
    }
  }
  _exports.getSelectionVariant = getSelectionVariant;
  function getDataVisualizationConfiguration(visualizationPath, isCondensedTableLayoutCompliant, inConverterContext, viewConfiguration, doNotCheckApplySupported, associatedPresentationVariantPath, isMacroOrMultipleView) {
    const resolvedTarget = visualizationPath !== "" ? inConverterContext.getEntityTypeAnnotation(visualizationPath) : {
      annotation: undefined,
      converterContext: inConverterContext
    };
    const resolvedAssociatedPresentationVariant = associatedPresentationVariantPath ? inConverterContext.getEntityTypeAnnotation(associatedPresentationVariantPath) : null;
    const resolvedVisualization = resolvedTarget.annotation;
    inConverterContext = resolvedTarget.converterContext;
    let visualizationAnnotations = [];
    let presentationVariantAnnotation;
    let presentationPath = "";
    let chartVisualization, tableVisualization;
    const term = resolvedVisualization === null || resolvedVisualization === void 0 ? void 0 : resolvedVisualization.term;
    if (term) {
      switch (term) {
        case "com.sap.vocabularies.UI.v1.LineItem":
        case "com.sap.vocabularies.UI.v1.Chart":
          presentationVariantAnnotation = resolvedAssociatedPresentationVariant === null || resolvedAssociatedPresentationVariant === void 0 ? void 0 : resolvedAssociatedPresentationVariant.annotation;
          visualizationAnnotations.push({
            visualization: resolvedVisualization,
            annotationPath: visualizationPath,
            converterContext: inConverterContext
          });
          break;
        case "com.sap.vocabularies.UI.v1.PresentationVariant":
          presentationVariantAnnotation = resolvedVisualization;
          visualizationAnnotations = visualizationAnnotations.concat(getVisualizationsFromPresentationVariant(resolvedVisualization, visualizationPath, inConverterContext, isMacroOrMultipleView));
          break;
        case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
          presentationVariantAnnotation = resolvedVisualization.PresentationVariant;
          // Presentation can be inline or outside the SelectionPresentationVariant
          presentationPath = presentationVariantAnnotation.fullyQualifiedName;
          visualizationAnnotations = visualizationAnnotations.concat(getVisualizationsFromPresentationVariant(presentationVariantAnnotation, visualizationPath, inConverterContext, isMacroOrMultipleView));
          break;
        default:
          break;
      }
      visualizationAnnotations.forEach(visualizationAnnotation => {
        const {
          visualization,
          annotationPath,
          converterContext
        } = visualizationAnnotation;
        switch (visualization.term) {
          case "com.sap.vocabularies.UI.v1.Chart":
            chartVisualization = createChartVisualization(visualization, annotationPath, converterContext, doNotCheckApplySupported, viewConfiguration);
            break;
          case "com.sap.vocabularies.UI.v1.LineItem":
          default:
            tableVisualization = Table.createTableVisualization(visualization, annotationPath, converterContext, presentationVariantAnnotation, isCondensedTableLayoutCompliant, viewConfiguration);
            break;
        }
      });
    }
    const visualizations = [];
    let path = term === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant" ? presentationPath : resolvedVisualization === null || resolvedVisualization === void 0 ? void 0 : resolvedVisualization.fullyQualifiedName;
    if (path === undefined) {
      path = "/";
    }
    const isALP = isAlpAnnotation(inConverterContext);
    if (!term || isALP && tableVisualization === undefined) {
      tableVisualization = Table.createDefaultTableVisualization(inConverterContext, isMacroOrMultipleView !== true);
      inConverterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.MISSING_LINEITEM);
    }
    if (isALP && chartVisualization === undefined) {
      chartVisualization = createBlankChartVisualization(inConverterContext);
      inConverterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.MISSING_CHART);
    }
    if (chartVisualization) {
      visualizations.push(chartVisualization);
    }
    if (tableVisualization) {
      visualizations.push(tableVisualization);
    }
    return {
      visualizations: visualizations,
      annotationPath: inConverterContext.getEntitySetBasedAnnotationPath(path)
    };
  }

  /**
   * Returns the context of the UI controls (either a UI.LineItem, or a UI.Chart).
   *
   * @function
   * @name getUiControl
   * @param presentationContext Object of the presentation context (either a presentation variant, or a UI.LineItem, or a UI.Chart)
   * @param controlPath Control path
   * @returns The context of the control (either a UI.LineItem, or a UI.Chart)
   */
  _exports.getDataVisualizationConfiguration = getDataVisualizationConfiguration;
  function getUiControl(presentationContext, controlPath) {
    CommonHelper.validatePresentationMetaPath(presentationContext.getPath(), controlPath);
    const presentation = MetaModelConverter.convertMetaModelContext(presentationContext),
      presentationVariantPath = CommonHelper.createPresentationPathContext(presentationContext),
      model = presentationContext.getModel();
    if (presentation) {
      if (CommonHelper._isPresentationVariantAnnotation(presentationVariantPath.getPath())) {
        const visualizations = presentation.PresentationVariant ? presentation.PresentationVariant.Visualizations : presentation.Visualizations;
        if (Array.isArray(visualizations)) {
          for (const visualization of visualizations) {
            if (visualization.type == "AnnotationPath" && visualization.value.indexOf(controlPath) !== -1 &&
            // check if object exists for PresentationVariant visualization
            !!model.getMetaContext(presentationContext.getPath().split("@")[0] + visualization.value).getObject()) {
              controlPath = visualization.value;
              break;
            }
          }
        }
      } else {
        return presentationContext;
      }
    }
    return model.getMetaContext(presentationContext.getPath().split("@")[0] + controlPath);
  }
  _exports.getUiControl = getUiControl;
  const annotationExistsInPresentationVariant = function (presentationVariantAnnotation, annotationTerm) {
    var _presentationVariantA;
    return ((_presentationVariantA = presentationVariantAnnotation.Visualizations) === null || _presentationVariantA === void 0 ? void 0 : _presentationVariantA.some(visualization => visualization.value.indexOf(annotationTerm) > -1)) ?? false;
  };
  _exports.annotationExistsInPresentationVariant = annotationExistsInPresentationVariant;
  const prepareDefaultVisualization = function (visualizationType, baseVisualizationPath, converterContext) {
    const entityType = converterContext.getEntityType();
    const defaultAnnotation = visualizationType === "com.sap.vocabularies.UI.v1.LineItem" ? getDefaultLineItem(entityType) : getDefaultChart(entityType);
    if (defaultAnnotation) {
      return {
        visualization: defaultAnnotation,
        annotationPath: `${baseVisualizationPath}${converterContext.getRelativeAnnotationPath(defaultAnnotation.fullyQualifiedName, entityType)}`,
        converterContext: converterContext
      };
    }
    return undefined;
  };
  _exports.prepareDefaultVisualization = prepareDefaultVisualization;
  const isAlpAnnotation = function (converterContext) {
    return converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage;
  };
  _exports.isAlpAnnotation = isAlpAnnotation;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50IiwicHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24iLCJ2aXN1YWxpemF0aW9uUGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJpc01hY3JvT3JNdWx0aXBsZVZpZXciLCJ2aXN1YWxpemF0aW9uQW5ub3RhdGlvbnMiLCJpc0FMUCIsImlzQWxwQW5ub3RhdGlvbiIsImJhc2VWaXN1YWxpemF0aW9uUGF0aCIsInNwbGl0IiwiaXNQcmVzZW50YXRpb25Db21wbGlhbnQiLCJhbm5vdGF0aW9uRXhpc3RzSW5QcmVzZW50YXRpb25WYXJpYW50IiwiZGVmYXVsdExpbmVJdGVtQW5ub3RhdGlvbiIsInByZXBhcmVEZWZhdWx0VmlzdWFsaXphdGlvbiIsInB1c2giLCJkZWZhdWx0Q2hhcnRBbm5vdGF0aW9uIiwidmlzdWFsaXphdGlvbnMiLCJWaXN1YWxpemF0aW9ucyIsInB1c2hGaXJzdFZpek9mVHlwZSIsImFsbG93ZWRUZXJtcyIsImZpcnN0Vml6IiwiZmluZCIsInZpeiIsImluZGV4T2YiLCIkdGFyZ2V0IiwidGVybSIsInZpc3VhbGl6YXRpb24iLCJhbm5vdGF0aW9uUGF0aCIsInZhbHVlIiwiZ2V0U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCIsImVudGl0eVR5cGUiLCJyZXNvbHZlZFRhcmdldCIsImdldEVudGl0eVR5cGVBbm5vdGF0aW9uIiwic2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCIsImFubm90YXRpb24iLCJFcnJvciIsImFubm90YXRpb25zIiwiVUkiLCJTZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50IiwiaXNTZWxlY3Rpb25QcmVzZW50YXRpb25Db21wbGlhbnQiLCJwcmVzZW50YXRpb25WYXJpYW50IiwiUHJlc2VudGF0aW9uVmFyaWFudCIsImhhc1RhYmxlIiwiaGFzQ2hhcnQiLCJmb3JFYWNoIiwiZ2V0RGVmYXVsdExpbmVJdGVtIiwiTGluZUl0ZW0iLCJnZXREZWZhdWx0Q2hhcnQiLCJDaGFydCIsImdldERlZmF1bHRQcmVzZW50YXRpb25WYXJpYW50IiwiZ2V0RGVmYXVsdFNlbGVjdGlvblZhcmlhbnQiLCJTZWxlY3Rpb25WYXJpYW50IiwiZ2V0U2VsZWN0aW9uVmFyaWFudCIsImdldE1hbmlmZXN0V3JhcHBlciIsImdldERlZmF1bHRUZW1wbGF0ZUFubm90YXRpb25QYXRoIiwic2VsZWN0aW9uVmFyaWFudCIsImdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbiIsImlzQ29uZGVuc2VkVGFibGVMYXlvdXRDb21wbGlhbnQiLCJpbkNvbnZlcnRlckNvbnRleHQiLCJ2aWV3Q29uZmlndXJhdGlvbiIsImRvTm90Q2hlY2tBcHBseVN1cHBvcnRlZCIsImFzc29jaWF0ZWRQcmVzZW50YXRpb25WYXJpYW50UGF0aCIsInVuZGVmaW5lZCIsInJlc29sdmVkQXNzb2NpYXRlZFByZXNlbnRhdGlvblZhcmlhbnQiLCJyZXNvbHZlZFZpc3VhbGl6YXRpb24iLCJwcmVzZW50YXRpb25QYXRoIiwiY2hhcnRWaXN1YWxpemF0aW9uIiwidGFibGVWaXN1YWxpemF0aW9uIiwiY29uY2F0IiwiZnVsbHlRdWFsaWZpZWROYW1lIiwidmlzdWFsaXphdGlvbkFubm90YXRpb24iLCJjcmVhdGVDaGFydFZpc3VhbGl6YXRpb24iLCJUYWJsZSIsImNyZWF0ZVRhYmxlVmlzdWFsaXphdGlvbiIsInBhdGgiLCJjcmVhdGVEZWZhdWx0VGFibGVWaXN1YWxpemF0aW9uIiwiZ2V0RGlhZ25vc3RpY3MiLCJhZGRJc3N1ZSIsIklzc3VlQ2F0ZWdvcnkiLCJBbm5vdGF0aW9uIiwiSXNzdWVTZXZlcml0eSIsIk1lZGl1bSIsIklzc3VlVHlwZSIsIk1JU1NJTkdfTElORUlURU0iLCJjcmVhdGVCbGFua0NoYXJ0VmlzdWFsaXphdGlvbiIsIk1JU1NJTkdfQ0hBUlQiLCJnZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoIiwiZ2V0VWlDb250cm9sIiwicHJlc2VudGF0aW9uQ29udGV4dCIsImNvbnRyb2xQYXRoIiwiQ29tbW9uSGVscGVyIiwidmFsaWRhdGVQcmVzZW50YXRpb25NZXRhUGF0aCIsImdldFBhdGgiLCJwcmVzZW50YXRpb24iLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCIsInByZXNlbnRhdGlvblZhcmlhbnRQYXRoIiwiY3JlYXRlUHJlc2VudGF0aW9uUGF0aENvbnRleHQiLCJtb2RlbCIsImdldE1vZGVsIiwiX2lzUHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24iLCJBcnJheSIsImlzQXJyYXkiLCJ0eXBlIiwiZ2V0TWV0YUNvbnRleHQiLCJnZXRPYmplY3QiLCJhbm5vdGF0aW9uVGVybSIsInNvbWUiLCJ2aXN1YWxpemF0aW9uVHlwZSIsImdldEVudGl0eVR5cGUiLCJkZWZhdWx0QW5ub3RhdGlvbiIsImdldFJlbGF0aXZlQW5ub3RhdGlvblBhdGgiLCJoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zIiwiZ2V0VGVtcGxhdGVUeXBlIiwiVGVtcGxhdGVUeXBlIiwiQW5hbHl0aWNhbExpc3RQYWdlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJEYXRhVmlzdWFsaXphdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEVudGl0eVR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHtcblx0Q2hhcnQsXG5cdExpbmVJdGVtLFxuXHRQcmVzZW50YXRpb25WYXJpYW50LFxuXHRQcmVzZW50YXRpb25WYXJpYW50VHlwZSxcblx0U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCxcblx0U2VsZWN0aW9uVmFyaWFudCxcblx0U2VsZWN0aW9uVmFyaWFudFR5cGVcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBJc3N1ZUNhdGVnb3J5LCBJc3N1ZVNldmVyaXR5LCBJc3N1ZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0lzc3VlTWFuYWdlclwiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCIuLi8uLi9Db252ZXJ0ZXJDb250ZXh0XCI7XG5pbXBvcnQgdHlwZSB7IFZpZXdQYXRoQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBUZW1wbGF0ZVR5cGUgfSBmcm9tIFwiLi4vLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHR5cGUgeyBDaGFydFZpc3VhbGl6YXRpb24gfSBmcm9tIFwiLi9DaGFydFwiO1xuaW1wb3J0IHsgY3JlYXRlQmxhbmtDaGFydFZpc3VhbGl6YXRpb24sIGNyZWF0ZUNoYXJ0VmlzdWFsaXphdGlvbiB9IGZyb20gXCIuL0NoYXJ0XCI7XG5pbXBvcnQgdHlwZSB7IFRhYmxlVmlzdWFsaXphdGlvbiB9IGZyb20gXCIuL1RhYmxlXCI7XG5pbXBvcnQgVGFibGUgZnJvbSBcIi4vVGFibGVcIjtcblxuZXhwb3J0IHR5cGUgRGF0YVZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucyA9IExpbmVJdGVtIHwgQ2hhcnQgfCBQcmVzZW50YXRpb25WYXJpYW50IHwgU2VsZWN0aW9uVmFyaWFudCB8IFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ7XG5cbmV4cG9ydCB0eXBlIEFjdHVhbFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucyA9IExpbmVJdGVtIHwgQ2hhcnQ7XG5cbmV4cG9ydCB0eXBlIFByZXNlbnRhdGlvblZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucyA9IFVJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtIHwgVUlBbm5vdGF0aW9uVGVybXMuQ2hhcnQ7XG5cbmV4cG9ydCB0eXBlIFZpc3VhbGl6YXRpb25BbmRQYXRoID0ge1xuXHR2aXN1YWxpemF0aW9uOiBBY3R1YWxWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnM7XG5cdGFubm90YXRpb25QYXRoOiBzdHJpbmc7XG5cdHNlbGVjdGlvblZhcmlhbnRQYXRoPzogc3RyaW5nO1xuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0O1xufTtcblxuZXhwb3J0IHR5cGUgRGF0YVZpc3VhbGl6YXRpb25EZWZpbml0aW9uID0ge1xuXHR2aXN1YWxpemF0aW9uczogKFRhYmxlVmlzdWFsaXphdGlvbiB8IENoYXJ0VmlzdWFsaXphdGlvbilbXTtcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZztcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50ID0gZnVuY3Rpb24gKFxuXHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbjogUHJlc2VudGF0aW9uVmFyaWFudFR5cGUsXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGlzTWFjcm9Pck11bHRpcGxlVmlldz86IGJvb2xlYW5cbik6IFZpc3VhbGl6YXRpb25BbmRQYXRoW10ge1xuXHRjb25zdCB2aXN1YWxpemF0aW9uQW5ub3RhdGlvbnM6IFZpc3VhbGl6YXRpb25BbmRQYXRoW10gPSBbXTtcblxuXHRjb25zdCBpc0FMUCA9IGlzQWxwQW5ub3RhdGlvbihjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRjb25zdCBiYXNlVmlzdWFsaXphdGlvblBhdGggPSB2aXN1YWxpemF0aW9uUGF0aC5zcGxpdChcIkBcIilbMF07XG5cblx0aWYgKChpc01hY3JvT3JNdWx0aXBsZVZpZXcgPT09IHRydWUgfHwgaXNBTFApICYmICFpc1ByZXNlbnRhdGlvbkNvbXBsaWFudChwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiwgaXNBTFApKSB7XG5cdFx0aWYgKCFhbm5vdGF0aW9uRXhpc3RzSW5QcmVzZW50YXRpb25WYXJpYW50KHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLCBVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbSkpIHtcblx0XHRcdGNvbnN0IGRlZmF1bHRMaW5lSXRlbUFubm90YXRpb24gPSBwcmVwYXJlRGVmYXVsdFZpc3VhbGl6YXRpb24oXG5cdFx0XHRcdFVJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtLFxuXHRcdFx0XHRiYXNlVmlzdWFsaXphdGlvblBhdGgsXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHRcblx0XHRcdCk7XG5cblx0XHRcdGlmIChkZWZhdWx0TGluZUl0ZW1Bbm5vdGF0aW9uKSB7XG5cdFx0XHRcdHZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucy5wdXNoKGRlZmF1bHRMaW5lSXRlbUFubm90YXRpb24pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIWFubm90YXRpb25FeGlzdHNJblByZXNlbnRhdGlvblZhcmlhbnQocHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24sIFVJQW5ub3RhdGlvblRlcm1zLkNoYXJ0KSkge1xuXHRcdFx0Y29uc3QgZGVmYXVsdENoYXJ0QW5ub3RhdGlvbiA9IHByZXBhcmVEZWZhdWx0VmlzdWFsaXphdGlvbihVSUFubm90YXRpb25UZXJtcy5DaGFydCwgYmFzZVZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRcdFx0aWYgKGRlZmF1bHRDaGFydEFubm90YXRpb24pIHtcblx0XHRcdFx0dmlzdWFsaXphdGlvbkFubm90YXRpb25zLnB1c2goZGVmYXVsdENoYXJ0QW5ub3RhdGlvbik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgdmlzdWFsaXphdGlvbnMgPSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbi5WaXN1YWxpemF0aW9ucztcblxuXHRjb25zdCBwdXNoRmlyc3RWaXpPZlR5cGUgPSBmdW5jdGlvbiAoYWxsb3dlZFRlcm1zOiBzdHJpbmdbXSkge1xuXHRcdGNvbnN0IGZpcnN0Vml6ID0gdmlzdWFsaXphdGlvbnM/LmZpbmQoKHZpeikgPT4ge1xuXHRcdFx0cmV0dXJuIGFsbG93ZWRUZXJtcy5pbmRleE9mKHZpei4kdGFyZ2V0Py50ZXJtKSA+PSAwO1xuXHRcdH0pO1xuXG5cdFx0aWYgKGZpcnN0Vml6KSB7XG5cdFx0XHR2aXN1YWxpemF0aW9uQW5ub3RhdGlvbnMucHVzaCh7XG5cdFx0XHRcdHZpc3VhbGl6YXRpb246IGZpcnN0Vml6LiR0YXJnZXQgYXMgQWN0dWFsVmlzdWFsaXphdGlvbkFubm90YXRpb25zLFxuXHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogYCR7YmFzZVZpc3VhbGl6YXRpb25QYXRofSR7Zmlyc3RWaXoudmFsdWV9YCxcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogY29udmVydGVyQ29udGV4dFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xuXG5cdGlmIChpc0FMUCkge1xuXHRcdC8vIEluIGNhc2Ugb2YgQUxQLCB3ZSB1c2UgdGhlIGZpcnN0IExpbmVJdGVtIGFuZCB0aGUgZmlyc3QgQ2hhcnRcblx0XHRwdXNoRmlyc3RWaXpPZlR5cGUoW1VJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtXSk7XG5cdFx0cHVzaEZpcnN0Vml6T2ZUeXBlKFtVSUFubm90YXRpb25UZXJtcy5DaGFydF0pO1xuXHR9IGVsc2Uge1xuXHRcdC8vIE90aGVyd2lzZSwgd2UgdXNlIHRoZSBmaXJzdCB2aXogb25seSAoQ2hhcnQgb3IgTGluZUl0ZW0pXG5cdFx0cHVzaEZpcnN0Vml6T2ZUeXBlKFtVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbSwgVUlBbm5vdGF0aW9uVGVybXMuQ2hhcnRdKTtcblx0fVxuXHRyZXR1cm4gdmlzdWFsaXphdGlvbkFubm90YXRpb25zO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQoXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdGFubm90YXRpb25QYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgfCB1bmRlZmluZWQge1xuXHRpZiAoYW5ub3RhdGlvblBhdGgpIHtcblx0XHRjb25zdCByZXNvbHZlZFRhcmdldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24oYW5ub3RhdGlvblBhdGgpO1xuXHRcdGNvbnN0IHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgPSByZXNvbHZlZFRhcmdldC5hbm5vdGF0aW9uIGFzIFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdFx0aWYgKHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRcdGlmIChzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50LnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRcdFx0cmV0dXJuIHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFubm90YXRpb24gUGF0aCBmb3IgdGhlIFNQViBtZW50aW9uZWQgaW4gdGhlIG1hbmlmZXN0IGlzIG5vdCBmb3VuZCwgUGxlYXNlIGFkZCB0aGUgU1BWIGluIHRoZSBhbm5vdGF0aW9uXCIpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2VsZWN0aW9uUHJlc2VudGF0aW9uQ29tcGxpYW50KFxuXHRzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50OiBTZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50LFxuXHRpc0FMUDogYm9vbGVhblxuKTogYm9vbGVhbiB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IHByZXNlbnRhdGlvblZhcmlhbnQgPSBzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50ICYmIHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQuUHJlc2VudGF0aW9uVmFyaWFudDtcblx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRyZXR1cm4gaXNQcmVzZW50YXRpb25Db21wbGlhbnQocHJlc2VudGF0aW9uVmFyaWFudCwgaXNBTFApO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlByZXNlbnRhdGlvbiBWYXJpYW50IGlzIG5vdCBwcmVzZW50IGluIHRoZSBTUFYgYW5ub3RhdGlvblwiKTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcmVzZW50YXRpb25Db21wbGlhbnQocHJlc2VudGF0aW9uVmFyaWFudDogUHJlc2VudGF0aW9uVmFyaWFudFR5cGUsIGlzQUxQID0gZmFsc2UpOiBib29sZWFuIHtcblx0bGV0IGhhc1RhYmxlID0gZmFsc2UsXG5cdFx0aGFzQ2hhcnQgPSBmYWxzZTtcblx0aWYgKGlzQUxQKSB7XG5cdFx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnQ/LlZpc3VhbGl6YXRpb25zKSB7XG5cdFx0XHRjb25zdCB2aXN1YWxpemF0aW9ucyA9IHByZXNlbnRhdGlvblZhcmlhbnQuVmlzdWFsaXphdGlvbnM7XG5cdFx0XHR2aXN1YWxpemF0aW9ucy5mb3JFYWNoKCh2aXN1YWxpemF0aW9uKSA9PiB7XG5cdFx0XHRcdGlmICh2aXN1YWxpemF0aW9uLiR0YXJnZXQ/LnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtKSB7XG5cdFx0XHRcdFx0aGFzVGFibGUgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2aXN1YWxpemF0aW9uLiR0YXJnZXQ/LnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLkNoYXJ0KSB7XG5cdFx0XHRcdFx0aGFzQ2hhcnQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGhhc0NoYXJ0ICYmIGhhc1RhYmxlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiAoXG5cdFx0XHRwcmVzZW50YXRpb25WYXJpYW50Py5WaXN1YWxpemF0aW9ucyAmJlxuXHRcdFx0ISFwcmVzZW50YXRpb25WYXJpYW50LlZpc3VhbGl6YXRpb25zLmZpbmQoKHZpc3VhbGl6YXRpb24pID0+IHtcblx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHR2aXN1YWxpemF0aW9uLiR0YXJnZXQ/LnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtIHx8IHZpc3VhbGl6YXRpb24uJHRhcmdldD8udGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuQ2hhcnRcblx0XHRcdFx0KTtcblx0XHRcdH0pXG5cdFx0KTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdExpbmVJdGVtKGVudGl0eVR5cGU6IEVudGl0eVR5cGUpOiBMaW5lSXRlbSB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBlbnRpdHlUeXBlLmFubm90YXRpb25zLlVJPy5MaW5lSXRlbTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0Q2hhcnQoZW50aXR5VHlwZTogRW50aXR5VHlwZSk6IENoYXJ0IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGVudGl0eVR5cGUuYW5ub3RhdGlvbnMuVUk/LkNoYXJ0O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRQcmVzZW50YXRpb25WYXJpYW50KGVudGl0eVR5cGU6IEVudGl0eVR5cGUpOiBQcmVzZW50YXRpb25WYXJpYW50IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LlVJPy5QcmVzZW50YXRpb25WYXJpYW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdFNlbGVjdGlvblZhcmlhbnQoZW50aXR5VHlwZTogRW50aXR5VHlwZSk6IFNlbGVjdGlvblZhcmlhbnQgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gZW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LlNlbGVjdGlvblZhcmlhbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZWxlY3Rpb25WYXJpYW50KGVudGl0eVR5cGU6IEVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBTZWxlY3Rpb25WYXJpYW50VHlwZSB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IGFubm90YXRpb25QYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5nZXREZWZhdWx0VGVtcGxhdGVBbm5vdGF0aW9uUGF0aCgpO1xuXHRjb25zdCBzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50ID0gZ2V0U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudChlbnRpdHlUeXBlLCBhbm5vdGF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCk7XG5cdGxldCBzZWxlY3Rpb25WYXJpYW50O1xuXHRpZiAoc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCkge1xuXHRcdHNlbGVjdGlvblZhcmlhbnQgPSBzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50LlNlbGVjdGlvblZhcmlhbnQgYXMgU2VsZWN0aW9uVmFyaWFudDtcblx0XHRpZiAoc2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0cmV0dXJuIHNlbGVjdGlvblZhcmlhbnQ7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHNlbGVjdGlvblZhcmlhbnQgPSBnZXREZWZhdWx0U2VsZWN0aW9uVmFyaWFudChlbnRpdHlUeXBlKTtcblx0XHRyZXR1cm4gc2VsZWN0aW9uVmFyaWFudDtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGF0YVZpc3VhbGl6YXRpb25Db25maWd1cmF0aW9uKFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRpc0NvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW50OiBib29sZWFuIHwgdW5kZWZpbmVkLFxuXHRpbkNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHZpZXdDb25maWd1cmF0aW9uPzogVmlld1BhdGhDb25maWd1cmF0aW9uLFxuXHRkb05vdENoZWNrQXBwbHlTdXBwb3J0ZWQ/OiBib29sZWFuIHwgdW5kZWZpbmVkLFxuXHRhc3NvY2lhdGVkUHJlc2VudGF0aW9uVmFyaWFudFBhdGg/OiBzdHJpbmcsXG5cdGlzTWFjcm9Pck11bHRpcGxlVmlldz86IGJvb2xlYW5cbik6IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiB7XG5cdGNvbnN0IHJlc29sdmVkVGFyZ2V0ID1cblx0XHR2aXN1YWxpemF0aW9uUGF0aCAhPT0gXCJcIlxuXHRcdFx0PyBpbkNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24odmlzdWFsaXphdGlvblBhdGgpXG5cdFx0XHQ6IHsgYW5ub3RhdGlvbjogdW5kZWZpbmVkLCBjb252ZXJ0ZXJDb250ZXh0OiBpbkNvbnZlcnRlckNvbnRleHQgfTtcblx0Y29uc3QgcmVzb2x2ZWRBc3NvY2lhdGVkUHJlc2VudGF0aW9uVmFyaWFudCA9IGFzc29jaWF0ZWRQcmVzZW50YXRpb25WYXJpYW50UGF0aFxuXHRcdD8gaW5Db252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKGFzc29jaWF0ZWRQcmVzZW50YXRpb25WYXJpYW50UGF0aClcblx0XHQ6IG51bGw7XG5cdGNvbnN0IHJlc29sdmVkVmlzdWFsaXphdGlvbiA9IHJlc29sdmVkVGFyZ2V0LmFubm90YXRpb24gYXMgRGF0YVZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucztcblx0aW5Db252ZXJ0ZXJDb250ZXh0ID0gcmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dDtcblx0bGV0IHZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uczogVmlzdWFsaXphdGlvbkFuZFBhdGhbXSA9IFtdO1xuXHRsZXQgcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb246IFByZXNlbnRhdGlvblZhcmlhbnRUeXBlO1xuXHRsZXQgcHJlc2VudGF0aW9uUGF0aCA9IFwiXCI7XG5cdGxldCBjaGFydFZpc3VhbGl6YXRpb24sIHRhYmxlVmlzdWFsaXphdGlvbjtcblx0Y29uc3QgdGVybSA9IHJlc29sdmVkVmlzdWFsaXphdGlvbj8udGVybTtcblx0aWYgKHRlcm0pIHtcblx0XHRzd2l0Y2ggKHRlcm0pIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW06XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLkNoYXJ0OlxuXHRcdFx0XHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiA9IHJlc29sdmVkQXNzb2NpYXRlZFByZXNlbnRhdGlvblZhcmlhbnQ/LmFubm90YXRpb247XG5cdFx0XHRcdHZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucy5wdXNoKHtcblx0XHRcdFx0XHR2aXN1YWxpemF0aW9uOiByZXNvbHZlZFZpc3VhbGl6YXRpb24gYXMgQWN0dWFsVmlzdWFsaXphdGlvbkFubm90YXRpb25zLFxuXHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiB2aXN1YWxpemF0aW9uUGF0aCxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0OiBpbkNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiA9IHJlc29sdmVkVmlzdWFsaXphdGlvbjtcblx0XHRcdFx0dmlzdWFsaXphdGlvbkFubm90YXRpb25zID0gdmlzdWFsaXphdGlvbkFubm90YXRpb25zLmNvbmNhdChcblx0XHRcdFx0XHRnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50KFxuXHRcdFx0XHRcdFx0cmVzb2x2ZWRWaXN1YWxpemF0aW9uLFxuXHRcdFx0XHRcdFx0dmlzdWFsaXphdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRpbkNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRpc01hY3JvT3JNdWx0aXBsZVZpZXdcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiA9IHJlc29sdmVkVmlzdWFsaXphdGlvbi5QcmVzZW50YXRpb25WYXJpYW50O1xuXHRcdFx0XHQvLyBQcmVzZW50YXRpb24gY2FuIGJlIGlubGluZSBvciBvdXRzaWRlIHRoZSBTZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50XG5cdFx0XHRcdHByZXNlbnRhdGlvblBhdGggPSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWU7XG5cdFx0XHRcdHZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucyA9IHZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucy5jb25jYXQoXG5cdFx0XHRcdFx0Z2V0VmlzdWFsaXphdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudChcblx0XHRcdFx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLFxuXHRcdFx0XHRcdFx0dmlzdWFsaXphdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRpbkNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRpc01hY3JvT3JNdWx0aXBsZVZpZXdcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0dmlzdWFsaXphdGlvbkFubm90YXRpb25zLmZvckVhY2goKHZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uKSA9PiB7XG5cdFx0XHRjb25zdCB7IHZpc3VhbGl6YXRpb24sIGFubm90YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0IH0gPSB2aXN1YWxpemF0aW9uQW5ub3RhdGlvbjtcblx0XHRcdHN3aXRjaCAodmlzdWFsaXphdGlvbi50ZXJtKSB7XG5cdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuQ2hhcnQ6XG5cdFx0XHRcdFx0Y2hhcnRWaXN1YWxpemF0aW9uID0gY3JlYXRlQ2hhcnRWaXN1YWxpemF0aW9uKFxuXHRcdFx0XHRcdFx0dmlzdWFsaXphdGlvbixcblx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoLFxuXHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRcdGRvTm90Q2hlY2tBcHBseVN1cHBvcnRlZCxcblx0XHRcdFx0XHRcdHZpZXdDb25maWd1cmF0aW9uXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbTpcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24gPSBUYWJsZS5jcmVhdGVUYWJsZVZpc3VhbGl6YXRpb24oXG5cdFx0XHRcdFx0XHR2aXN1YWxpemF0aW9uLFxuXHRcdFx0XHRcdFx0YW5ub3RhdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24sXG5cdFx0XHRcdFx0XHRpc0NvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW50LFxuXHRcdFx0XHRcdFx0dmlld0NvbmZpZ3VyYXRpb25cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Y29uc3QgdmlzdWFsaXphdGlvbnM6IGFueSA9IFtdO1xuXHRsZXQgcGF0aCA9IHRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgPyBwcmVzZW50YXRpb25QYXRoIDogcmVzb2x2ZWRWaXN1YWxpemF0aW9uPy5mdWxseVF1YWxpZmllZE5hbWU7XG5cdGlmIChwYXRoID09PSB1bmRlZmluZWQpIHtcblx0XHRwYXRoID0gXCIvXCI7XG5cdH1cblx0Y29uc3QgaXNBTFAgPSBpc0FscEFubm90YXRpb24oaW5Db252ZXJ0ZXJDb250ZXh0KTtcblxuXHRpZiAoIXRlcm0gfHwgKGlzQUxQICYmIHRhYmxlVmlzdWFsaXphdGlvbiA9PT0gdW5kZWZpbmVkKSkge1xuXHRcdHRhYmxlVmlzdWFsaXphdGlvbiA9IFRhYmxlLmNyZWF0ZURlZmF1bHRUYWJsZVZpc3VhbGl6YXRpb24oaW5Db252ZXJ0ZXJDb250ZXh0LCBpc01hY3JvT3JNdWx0aXBsZVZpZXcgIT09IHRydWUpO1xuXHRcdGluQ29udmVydGVyQ29udGV4dC5nZXREaWFnbm9zdGljcygpLmFkZElzc3VlKElzc3VlQ2F0ZWdvcnkuQW5ub3RhdGlvbiwgSXNzdWVTZXZlcml0eS5NZWRpdW0sIElzc3VlVHlwZS5NSVNTSU5HX0xJTkVJVEVNKTtcblx0fVxuXHRpZiAoaXNBTFAgJiYgY2hhcnRWaXN1YWxpemF0aW9uID09PSB1bmRlZmluZWQpIHtcblx0XHRjaGFydFZpc3VhbGl6YXRpb24gPSBjcmVhdGVCbGFua0NoYXJ0VmlzdWFsaXphdGlvbihpbkNvbnZlcnRlckNvbnRleHQpO1xuXHRcdGluQ29udmVydGVyQ29udGV4dC5nZXREaWFnbm9zdGljcygpLmFkZElzc3VlKElzc3VlQ2F0ZWdvcnkuQW5ub3RhdGlvbiwgSXNzdWVTZXZlcml0eS5NZWRpdW0sIElzc3VlVHlwZS5NSVNTSU5HX0NIQVJUKTtcblx0fVxuXG5cdGlmIChjaGFydFZpc3VhbGl6YXRpb24pIHtcblx0XHR2aXN1YWxpemF0aW9ucy5wdXNoKGNoYXJ0VmlzdWFsaXphdGlvbik7XG5cdH1cblx0aWYgKHRhYmxlVmlzdWFsaXphdGlvbikge1xuXHRcdHZpc3VhbGl6YXRpb25zLnB1c2godGFibGVWaXN1YWxpemF0aW9uKTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdHZpc3VhbGl6YXRpb25zOiB2aXN1YWxpemF0aW9ucyxcblx0XHRhbm5vdGF0aW9uUGF0aDogaW5Db252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgocGF0aClcblx0fTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjb250ZXh0IG9mIHRoZSBVSSBjb250cm9scyAoZWl0aGVyIGEgVUkuTGluZUl0ZW0sIG9yIGEgVUkuQ2hhcnQpLlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgZ2V0VWlDb250cm9sXG4gKiBAcGFyYW0gcHJlc2VudGF0aW9uQ29udGV4dCBPYmplY3Qgb2YgdGhlIHByZXNlbnRhdGlvbiBjb250ZXh0IChlaXRoZXIgYSBwcmVzZW50YXRpb24gdmFyaWFudCwgb3IgYSBVSS5MaW5lSXRlbSwgb3IgYSBVSS5DaGFydClcbiAqIEBwYXJhbSBjb250cm9sUGF0aCBDb250cm9sIHBhdGhcbiAqIEByZXR1cm5zIFRoZSBjb250ZXh0IG9mIHRoZSBjb250cm9sIChlaXRoZXIgYSBVSS5MaW5lSXRlbSwgb3IgYSBVSS5DaGFydClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFVpQ29udHJvbChwcmVzZW50YXRpb25Db250ZXh0OiBDb250ZXh0LCBjb250cm9sUGF0aDogc3RyaW5nKTogQ29udGV4dCB7XG5cdENvbW1vbkhlbHBlci52YWxpZGF0ZVByZXNlbnRhdGlvbk1ldGFQYXRoKHByZXNlbnRhdGlvbkNvbnRleHQuZ2V0UGF0aCgpLCBjb250cm9sUGF0aCk7XG5cblx0Y29uc3QgcHJlc2VudGF0aW9uID0gTWV0YU1vZGVsQ29udmVydGVyLmNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KHByZXNlbnRhdGlvbkNvbnRleHQpLFxuXHRcdHByZXNlbnRhdGlvblZhcmlhbnRQYXRoID0gQ29tbW9uSGVscGVyLmNyZWF0ZVByZXNlbnRhdGlvblBhdGhDb250ZXh0KHByZXNlbnRhdGlvbkNvbnRleHQpLFxuXHRcdG1vZGVsID0gcHJlc2VudGF0aW9uQ29udGV4dC5nZXRNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRpZiAocHJlc2VudGF0aW9uKSB7XG5cdFx0aWYgKENvbW1vbkhlbHBlci5faXNQcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbihwcmVzZW50YXRpb25WYXJpYW50UGF0aC5nZXRQYXRoKCkpKSB7XG5cdFx0XHRjb25zdCB2aXN1YWxpemF0aW9ucyA9IHByZXNlbnRhdGlvbi5QcmVzZW50YXRpb25WYXJpYW50XG5cdFx0XHRcdD8gcHJlc2VudGF0aW9uLlByZXNlbnRhdGlvblZhcmlhbnQuVmlzdWFsaXphdGlvbnNcblx0XHRcdFx0OiBwcmVzZW50YXRpb24uVmlzdWFsaXphdGlvbnM7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2aXN1YWxpemF0aW9ucykpIHtcblx0XHRcdFx0Zm9yIChjb25zdCB2aXN1YWxpemF0aW9uIG9mIHZpc3VhbGl6YXRpb25zKSB7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0dmlzdWFsaXphdGlvbi50eXBlID09IFwiQW5ub3RhdGlvblBhdGhcIiAmJlxuXHRcdFx0XHRcdFx0dmlzdWFsaXphdGlvbi52YWx1ZS5pbmRleE9mKGNvbnRyb2xQYXRoKSAhPT0gLTEgJiZcblx0XHRcdFx0XHRcdC8vIGNoZWNrIGlmIG9iamVjdCBleGlzdHMgZm9yIFByZXNlbnRhdGlvblZhcmlhbnQgdmlzdWFsaXphdGlvblxuXHRcdFx0XHRcdFx0ISFtb2RlbC5nZXRNZXRhQ29udGV4dChwcmVzZW50YXRpb25Db250ZXh0LmdldFBhdGgoKS5zcGxpdChcIkBcIilbMF0gKyB2aXN1YWxpemF0aW9uLnZhbHVlKS5nZXRPYmplY3QoKVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0Y29udHJvbFBhdGggPSB2aXN1YWxpemF0aW9uLnZhbHVlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBwcmVzZW50YXRpb25Db250ZXh0O1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBtb2RlbC5nZXRNZXRhQ29udGV4dChwcmVzZW50YXRpb25Db250ZXh0LmdldFBhdGgoKS5zcGxpdChcIkBcIilbMF0gKyBjb250cm9sUGF0aCk7XG59XG5cbmV4cG9ydCBjb25zdCBhbm5vdGF0aW9uRXhpc3RzSW5QcmVzZW50YXRpb25WYXJpYW50ID0gZnVuY3Rpb24gKFxuXHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbjogUHJlc2VudGF0aW9uVmFyaWFudFR5cGUsXG5cdGFubm90YXRpb25UZXJtOiBQcmVzZW50YXRpb25WaXN1YWxpemF0aW9uQW5ub3RhdGlvbnNcbik6IGJvb2xlYW4ge1xuXHRyZXR1cm4gcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24uVmlzdWFsaXphdGlvbnM/LnNvbWUoKHZpc3VhbGl6YXRpb24pID0+IHZpc3VhbGl6YXRpb24udmFsdWUuaW5kZXhPZihhbm5vdGF0aW9uVGVybSkgPiAtMSkgPz8gZmFsc2U7XG59O1xuXG5leHBvcnQgY29uc3QgcHJlcGFyZURlZmF1bHRWaXN1YWxpemF0aW9uID0gZnVuY3Rpb24gKFxuXHR2aXN1YWxpemF0aW9uVHlwZTogUHJlc2VudGF0aW9uVmlzdWFsaXphdGlvbkFubm90YXRpb25zLFxuXHRiYXNlVmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogVmlzdWFsaXphdGlvbkFuZFBhdGggfCB1bmRlZmluZWQge1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGNvbnN0IGRlZmF1bHRBbm5vdGF0aW9uID1cblx0XHR2aXN1YWxpemF0aW9uVHlwZSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW0gPyBnZXREZWZhdWx0TGluZUl0ZW0oZW50aXR5VHlwZSkgOiBnZXREZWZhdWx0Q2hhcnQoZW50aXR5VHlwZSk7XG5cblx0aWYgKGRlZmF1bHRBbm5vdGF0aW9uKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHZpc3VhbGl6YXRpb246IGRlZmF1bHRBbm5vdGF0aW9uLFxuXHRcdFx0YW5ub3RhdGlvblBhdGg6IGAke2Jhc2VWaXN1YWxpemF0aW9uUGF0aH0ke2NvbnZlcnRlckNvbnRleHQuZ2V0UmVsYXRpdmVBbm5vdGF0aW9uUGF0aChcblx0XHRcdFx0ZGVmYXVsdEFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lLFxuXHRcdFx0XHRlbnRpdHlUeXBlXG5cdFx0XHQpfWAsXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0OiBjb252ZXJ0ZXJDb250ZXh0XG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgY29uc3QgaXNBbHBBbm5vdGF0aW9uID0gZnVuY3Rpb24gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBib29sZWFuIHtcblx0cmV0dXJuIChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMoKSB8fFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2Vcblx0KTtcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7O0VBMENPLE1BQU1BLHdDQUF3QyxHQUFHLFVBQ3ZEQyw2QkFBc0QsRUFDdERDLGlCQUF5QixFQUN6QkMs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