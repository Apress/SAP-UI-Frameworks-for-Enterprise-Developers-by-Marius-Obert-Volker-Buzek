/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/helpers/BindingToolkit", "../controls/Common/DataVisualization", "../controls/Common/KPI", "../helpers/ID", "../ManifestSettings"], function (Action, FilterBar, ConfigurableObject, BindingToolkit, DataVisualization, KPI, ID, ManifestSettings) {
  "use strict";

  var _exports = {};
  var VisualizationType = ManifestSettings.VisualizationType;
  var VariantManagementType = ManifestSettings.VariantManagementType;
  var TemplateType = ManifestSettings.TemplateType;
  var getTableID = ID.getTableID;
  var getIconTabBarID = ID.getIconTabBarID;
  var getFilterVariantManagementID = ID.getFilterVariantManagementID;
  var getFilterBarID = ID.getFilterBarID;
  var getDynamicListReportID = ID.getDynamicListReportID;
  var getCustomTabID = ID.getCustomTabID;
  var getChartID = ID.getChartID;
  var getKPIDefinitions = KPI.getKPIDefinitions;
  var isSelectionPresentationCompliant = DataVisualization.isSelectionPresentationCompliant;
  var isPresentationCompliant = DataVisualization.isPresentationCompliant;
  var getSelectionVariant = DataVisualization.getSelectionVariant;
  var getSelectionPresentationVariant = DataVisualization.getSelectionPresentationVariant;
  var getDefaultPresentationVariant = DataVisualization.getDefaultPresentationVariant;
  var getDefaultLineItem = DataVisualization.getDefaultLineItem;
  var getDefaultChart = DataVisualization.getDefaultChart;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getSelectionFields = FilterBar.getSelectionFields;
  var getManifestFilterFields = FilterBar.getManifestFilterFields;
  var getFilterBarHideBasicSearch = FilterBar.getFilterBarHideBasicSearch;
  var getActionsFromManifest = Action.getActionsFromManifest;
  /**
   * Retrieves all list report tables.
   *
   * @param views The list report views configured in the manifest
   * @returns The list report table
   */
  function getTableVisualizations(views) {
    const tables = [];
    views.forEach(function (view) {
      if (!view.type) {
        const visualizations = view.secondaryVisualization ? view.secondaryVisualization.visualizations : view.presentation.visualizations;
        visualizations.forEach(function (visualization) {
          if (visualization.type === VisualizationType.Table) {
            tables.push(visualization);
          }
        });
      }
    });
    return tables;
  }
  function getChartVisualizations(views) {
    const charts = [];
    views.forEach(function (view) {
      if (!view.type) {
        const visualizations = view.primaryVisualization ? view.primaryVisualization.visualizations : view.presentation.visualizations;
        visualizations.forEach(function (visualization) {
          if (visualization.type === VisualizationType.Chart) {
            charts.push(visualization);
          }
        });
      }
    });
    return charts;
  }
  const getDefaultSemanticDates = function (filterFields) {
    const defaultSemanticDates = {};
    for (const filterField in filterFields) {
      var _filterFields$filterF, _filterFields$filterF2, _filterFields$filterF3;
      if ((_filterFields$filterF = filterFields[filterField]) !== null && _filterFields$filterF !== void 0 && (_filterFields$filterF2 = _filterFields$filterF.settings) !== null && _filterFields$filterF2 !== void 0 && (_filterFields$filterF3 = _filterFields$filterF2.defaultValues) !== null && _filterFields$filterF3 !== void 0 && _filterFields$filterF3.length) {
        var _filterFields$filterF4, _filterFields$filterF5;
        defaultSemanticDates[filterField] = (_filterFields$filterF4 = filterFields[filterField]) === null || _filterFields$filterF4 === void 0 ? void 0 : (_filterFields$filterF5 = _filterFields$filterF4.settings) === null || _filterFields$filterF5 === void 0 ? void 0 : _filterFields$filterF5.defaultValues;
      }
    }
    return defaultSemanticDates;
  };

  /**
   * Find a visualization annotation that can be used for rendering the list report.
   *
   * @param entityType The current EntityType
   * @param converterContext
   * @param isALP
   * @returns A compliant annotation for rendering the list report
   */
  function getCompliantVisualizationAnnotation(entityType, converterContext, isALP) {
    const annotationPath = converterContext.getManifestWrapper().getDefaultTemplateAnnotationPath();
    const selectionPresentationVariant = getSelectionPresentationVariant(entityType, annotationPath, converterContext);
    const errorMessageForALP = "ALP flavor needs both chart and table to load the application";
    if (selectionPresentationVariant) {
      if (annotationPath) {
        const presentationVariant = selectionPresentationVariant.PresentationVariant;
        if (!presentationVariant) {
          throw new Error("Presentation Variant is not configured in the SPV mentioned in the manifest");
        }
        if (!isPresentationCompliant(presentationVariant, isALP)) {
          if (isALP) {
            throw new Error(errorMessageForALP);
          }
          return undefined;
        }
      }
      if (isSelectionPresentationCompliant(selectionPresentationVariant, isALP) === true) {
        return selectionPresentationVariant;
      } else if (isALP) {
        throw new Error(errorMessageForALP);
      }
    }
    const presentationVariant = getDefaultPresentationVariant(entityType);
    if (presentationVariant) {
      if (isPresentationCompliant(presentationVariant, isALP)) {
        return presentationVariant;
      } else if (isALP) {
        throw new Error(errorMessageForALP);
      }
    }
    if (!isALP) {
      return getDefaultLineItem(entityType);
    }
    return undefined;
  }
  const getView = function (viewConverterConfiguration) {
    let config = viewConverterConfiguration;
    if (config.converterContext) {
      var _presentation, _presentation$visuali;
      let converterContext = config.converterContext;
      config = config;
      const isMultipleViewConfiguration = function (currentConfig) {
        return currentConfig.key !== undefined;
      };
      let presentation = getDataVisualizationConfiguration(config.annotation ? converterContext.getRelativeAnnotationPath(config.annotation.fullyQualifiedName, converterContext.getEntityType()) : "", true, converterContext, config, undefined, undefined, isMultipleViewConfiguration(config));
      let tableControlId = "";
      let chartControlId = "";
      let title = "";
      let selectionVariantPath = "";
      const createVisualization = function (currentPresentation, isPrimary) {
        let defaultVisualization;
        for (const visualization of currentPresentation.visualizations) {
          if (isPrimary && visualization.type === VisualizationType.Chart) {
            defaultVisualization = visualization;
            break;
          }
          if (!isPrimary && visualization.type === VisualizationType.Table) {
            defaultVisualization = visualization;
            break;
          }
        }
        const presentationCreated = Object.assign({}, currentPresentation);
        if (defaultVisualization) {
          presentationCreated.visualizations = [defaultVisualization];
        } else {
          throw new Error((isPrimary ? "Primary" : "Secondary") + " visualisation needs valid " + (isPrimary ? "chart" : "table"));
        }
        return presentationCreated;
      };
      const getPresentation = function (item, isPrimary) {
        const resolvedTarget = converterContext.getEntityTypeAnnotation(item.annotationPath);
        const targetAnnotation = resolvedTarget.annotation;
        converterContext = resolvedTarget.converterContext;
        const annotation = targetAnnotation;
        if (annotation || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
          presentation = getDataVisualizationConfiguration(annotation ? converterContext.getRelativeAnnotationPath(annotation.fullyQualifiedName, converterContext.getEntityType()) : "", true, converterContext, config);
          return presentation;
        } else {
          const sError = "Annotation Path for the " + (isPrimary ? "primary" : "secondary") + " visualisation mentioned in the manifest is not found";
          throw new Error(sError);
        }
      };
      const createAlpView = function (presentations, defaultPath) {
        var _primaryVisualization, _secondaryVisualizati, _secondaryVisualizati2;
        const primaryVisualization = createVisualization(presentations[0], true);
        chartControlId = primaryVisualization === null || primaryVisualization === void 0 ? void 0 : (_primaryVisualization = primaryVisualization.visualizations[0]) === null || _primaryVisualization === void 0 ? void 0 : _primaryVisualization.id;
        const secondaryVisualization = createVisualization(presentations[1] ? presentations[1] : presentations[0], false);
        tableControlId = secondaryVisualization === null || secondaryVisualization === void 0 ? void 0 : (_secondaryVisualizati = secondaryVisualization.visualizations[0]) === null || _secondaryVisualizati === void 0 ? void 0 : (_secondaryVisualizati2 = _secondaryVisualizati.annotation) === null || _secondaryVisualizati2 === void 0 ? void 0 : _secondaryVisualizati2.id;
        if (primaryVisualization && secondaryVisualization) {
          config = config;
          const visible = config.visible;
          const view = {
            primaryVisualization,
            secondaryVisualization,
            tableControlId,
            chartControlId,
            defaultPath,
            visible
          };
          return view;
        }
      };
      if (!converterContext.getManifestWrapper().hasMultipleVisualizations(config) && ((_presentation = presentation) === null || _presentation === void 0 ? void 0 : (_presentation$visuali = _presentation.visualizations) === null || _presentation$visuali === void 0 ? void 0 : _presentation$visuali.length) === 2 && converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
        const view = createAlpView([presentation], "both");
        if (view) {
          return view;
        }
      } else if (converterContext.getManifestWrapper().hasMultipleVisualizations(config) || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
        const {
          primary,
          secondary
        } = config;
        if (primary && primary.length && secondary && secondary.length) {
          const view = createAlpView([getPresentation(primary[0], true), getPresentation(secondary[0], false)], config.defaultPath);
          if (view) {
            return view;
          }
        } else {
          throw new Error("SecondaryItems in the Views is not present");
        }
      } else if (isMultipleViewConfiguration(config)) {
        // key exists only on multi tables mode
        const resolvedTarget = converterContext.getEntityTypeAnnotation(config.annotationPath);
        const viewAnnotation = resolvedTarget.annotation;
        converterContext = resolvedTarget.converterContext;
        title = compileExpression(getExpressionFromAnnotation(viewAnnotation.Text));
        // Need to loop on table into views since multi table mode get specific configuration (hidden filters or Table Id)
        presentation.visualizations.forEach((visualizationDefinition, index) => {
          var _config$annotation;
          switch (visualizationDefinition.type) {
            case VisualizationType.Table:
              const tableVisualization = presentation.visualizations[index];
              const filters = tableVisualization.control.filters || {};
              filters.hiddenFilters = filters.hiddenFilters || {
                paths: []
              };
              if (!config.keepPreviousPersonalization) {
                // Need to override Table Id to match with Tab Key (currently only table is managed in multiple view mode)
                tableVisualization.annotation.id = getTableID(config.key || "", "LineItem");
              }
              config = config;
              if (((_config$annotation = config.annotation) === null || _config$annotation === void 0 ? void 0 : _config$annotation.term) === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant") {
                var _config$annotation$Se;
                if (!config.annotation.SelectionVariant) {
                  throw new Error(`The Selection Variant is missing for the Selection Presentation Variant ${config.annotation.fullyQualifiedName}`);
                }
                selectionVariantPath = `@${(_config$annotation$Se = config.annotation.SelectionVariant) === null || _config$annotation$Se === void 0 ? void 0 : _config$annotation$Se.fullyQualifiedName.split("@")[1]}`;
              } else {
                selectionVariantPath = config.annotationPath;
              }
              //Provide Selection Variant to hiddenFilters in order to set the SV filters to the table.
              //MDC Table overrides binding Filter and from SAP FE the only method where we are able to add
              //additional filter is 'rebindTable' into Table delegate.
              //To avoid implementing specific LR feature to SAP FE Macro Table, the filter(s) related to the Tab (multi table mode)
              //can be passed to macro table via parameter/context named filters and key hiddenFilters.
              filters.hiddenFilters.paths.push({
                annotationPath: selectionVariantPath
              });
              tableVisualization.control.filters = filters;
              break;
            case VisualizationType.Chart:
              const chartVisualization = presentation.visualizations[index];
              chartVisualization.id = getChartID(config.key || "", "Chart");
              chartVisualization.multiViews = true;
              break;
            default:
              break;
          }
        });
      }
      presentation.visualizations.forEach(visualizationDefinition => {
        if (visualizationDefinition.type === VisualizationType.Table) {
          tableControlId = visualizationDefinition.annotation.id;
        } else if (visualizationDefinition.type === VisualizationType.Chart) {
          chartControlId = visualizationDefinition.id;
        }
      });
      config = config;
      const visible = config.visible;
      return {
        presentation,
        tableControlId,
        chartControlId,
        title,
        selectionVariantPath,
        visible
      };
    } else {
      config = config;
      const title = config.label,
        fragment = config.template,
        type = config.type,
        customTabId = getCustomTabID(config.key || ""),
        visible = config.visible;
      return {
        title,
        fragment,
        type,
        customTabId,
        visible
      };
    }
  };
  const getViews = function (converterContext, settingsViews) {
    let viewConverterConfigs = [];
    if (settingsViews) {
      settingsViews.paths.forEach(path => {
        if (converterContext.getManifestWrapper().hasMultipleVisualizations(path)) {
          if (settingsViews.paths.length > 1) {
            throw new Error("ALP flavor cannot have multiple views");
          } else {
            path = path;
            viewConverterConfigs.push({
              converterContext: converterContext,
              primary: path.primary,
              secondary: path.secondary,
              defaultPath: path.defaultPath
            });
          }
        } else if (path.template) {
          path = path;
          viewConverterConfigs.push({
            key: path.key,
            label: path.label,
            template: path.template,
            type: "Custom",
            visible: path.visible
          });
        } else {
          path = path;
          const viewConverterContext = converterContext.getConverterContextFor(path.contextPath || path.entitySet && `/${path.entitySet}` || converterContext.getContextPath()),
            entityType = viewConverterContext.getEntityType();
          if (entityType && viewConverterContext) {
            let annotation;
            const resolvedTarget = viewConverterContext.getEntityTypeAnnotation(path.annotationPath);
            const targetAnnotation = resolvedTarget.annotation;
            if (targetAnnotation) {
              annotation = targetAnnotation.term === "com.sap.vocabularies.UI.v1.SelectionVariant" ? getCompliantVisualizationAnnotation(entityType, viewConverterContext, false) : targetAnnotation;
              viewConverterConfigs.push({
                converterContext: viewConverterContext,
                annotation,
                annotationPath: path.annotationPath,
                keepPreviousPersonalization: path.keepPreviousPersonalization,
                key: path.key,
                visible: path.visible
              });
            }
          } else {
            // TODO Diagnostics message
          }
        }
      });
    } else {
      const entityType = converterContext.getEntityType();
      if (converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
        viewConverterConfigs = getAlpViewConfig(converterContext, viewConverterConfigs);
      } else {
        viewConverterConfigs.push({
          annotation: getCompliantVisualizationAnnotation(entityType, converterContext, false),
          converterContext: converterContext
        });
      }
    }
    return viewConverterConfigs.map(viewConverterConfig => {
      return getView(viewConverterConfig);
    });
  };
  const getMultiViewsControl = function (converterContext, views) {
    const manifestWrapper = converterContext.getManifestWrapper();
    const viewsDefinition = manifestWrapper.getViewConfiguration();
    if (views.length > 1 && !hasMultiVisualizations(converterContext)) {
      return {
        showTabCounts: viewsDefinition ? (viewsDefinition === null || viewsDefinition === void 0 ? void 0 : viewsDefinition.showCounts) || manifestWrapper.hasMultipleEntitySets() : undefined,
        // with multi EntitySets, tab counts are displayed by default
        id: getIconTabBarID()
      };
    }
    return undefined;
  };
  function getAlpViewConfig(converterContext, viewConfigs) {
    const entityType = converterContext.getEntityType();
    const annotation = getCompliantVisualizationAnnotation(entityType, converterContext, true);
    let chart, table;
    if (annotation) {
      viewConfigs.push({
        annotation: annotation,
        converterContext
      });
    } else {
      chart = getDefaultChart(entityType);
      table = getDefaultLineItem(entityType);
      if (chart && table) {
        const primary = [{
          annotationPath: "@" + chart.term
        }];
        const secondary = [{
          annotationPath: "@" + table.term
        }];
        viewConfigs.push({
          converterContext: converterContext,
          primary: primary,
          secondary: secondary,
          defaultPath: "both"
        });
      } else {
        throw new Error("ALP flavor needs both chart and table to load the application");
      }
    }
    return viewConfigs;
  }
  function hasMultiVisualizations(converterContext) {
    return converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage;
  }
  const getHeaderActions = function (converterContext) {
    const manifestWrapper = converterContext.getManifestWrapper();
    return insertCustomElements([], getActionsFromManifest(manifestWrapper.getHeaderActions(), converterContext).actions);
  };
  _exports.getHeaderActions = getHeaderActions;
  const checkChartFilterBarId = function (views, filterBarId) {
    views.forEach(view => {
      if (!view.type) {
        const presentation = view.presentation;
        presentation.visualizations.forEach(visualizationDefinition => {
          if (visualizationDefinition.type === VisualizationType.Chart && visualizationDefinition.filterId !== filterBarId) {
            visualizationDefinition.filterId = filterBarId;
          }
        });
      }
    });
  };

  /**
   * Creates the ListReportDefinition for multiple entity sets (multiple table mode).
   *
   * @param converterContext The converter context
   * @returns The list report definition based on annotation + manifest
   */
  _exports.checkChartFilterBarId = checkChartFilterBarId;
  const convertPage = function (converterContext) {
    const entityType = converterContext.getEntityType();
    const sContextPath = converterContext.getContextPath();
    if (!sContextPath) {
      // If we don't have an entitySet at this point we have an issue I'd say
      throw new Error("An EntitySet is required to be able to display a ListReport, please adjust your `entitySet` property to point to one.");
    }
    const manifestWrapper = converterContext.getManifestWrapper();
    const viewsDefinition = manifestWrapper.getViewConfiguration();
    const hasMultipleEntitySets = manifestWrapper.hasMultipleEntitySets();
    const views = getViews(converterContext, viewsDefinition);
    const lrTableVisualizations = getTableVisualizations(views);
    const lrChartVisualizations = getChartVisualizations(views);
    const showPinnableToggle = lrTableVisualizations.some(table => table.control.type === "ResponsiveTable");
    let singleTableId = "";
    let singleChartId = "";
    const dynamicListReportId = getDynamicListReportID();
    const filterBarId = getFilterBarID(sContextPath);
    const filterVariantManagementID = getFilterVariantManagementID(filterBarId);
    const fbConfig = manifestWrapper.getFilterConfiguration();
    const filterInitialLayout = (fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.initialLayout) !== undefined ? fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.initialLayout.toLowerCase() : "compact";
    const filterLayout = (fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.layout) !== undefined ? fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.layout.toLowerCase() : "compact";
    const useSemanticDateRange = fbConfig.useSemanticDateRange !== undefined ? fbConfig.useSemanticDateRange : true;
    const showClearButton = fbConfig.showClearButton !== undefined ? fbConfig.showClearButton : false;
    const oConfig = getContentAreaId(converterContext, views);
    if (oConfig) {
      singleChartId = oConfig.chartId;
      singleTableId = oConfig.tableId;
    }
    const useHiddenFilterBar = manifestWrapper.useHiddenFilterBar();
    // Chart has a dependency to filter bar (issue with loading data). Once resolved, the check for chart should be removed here.
    // Until then, hiding filter bar is now allowed if a chart is being used on LR.
    const hideFilterBar = (manifestWrapper.isFilterBarHidden() || useHiddenFilterBar) && singleChartId === "";
    const lrFilterProperties = getSelectionFields(converterContext, lrTableVisualizations);
    const selectionFields = lrFilterProperties.selectionFields;
    const propertyInfoFields = lrFilterProperties.sPropertyInfo;
    const hideBasicSearch = getFilterBarHideBasicSearch(lrTableVisualizations, lrChartVisualizations, converterContext);
    const multiViewControl = getMultiViewsControl(converterContext, views);
    const selectionVariant = multiViewControl ? undefined : getSelectionVariant(entityType, converterContext);
    const defaultSemanticDates = useSemanticDateRange ? getDefaultSemanticDates(getManifestFilterFields(entityType, converterContext)) : {};

    // Sort header actions according to position attributes in manifest
    const headerActions = getHeaderActions(converterContext);
    if (hasMultipleEntitySets) {
      checkChartFilterBarId(views, filterBarId);
    }
    const visualizationIds = lrTableVisualizations.map(visualization => {
      return visualization.annotation.id;
    }).concat(lrChartVisualizations.map(visualization => {
      return visualization.id;
    }));
    const targetControlIds = [...(hideFilterBar && !useHiddenFilterBar ? [] : [filterBarId]), ...(manifestWrapper.getVariantManagement() !== VariantManagementType.Control ? visualizationIds : []), ...(multiViewControl ? [multiViewControl.id] : [])];
    const stickySubheaderProvider = multiViewControl && manifestWrapper.getStickyMultiTabHeaderConfiguration() ? multiViewControl.id : undefined;
    return {
      mainEntitySet: sContextPath,
      mainEntityType: `${sContextPath}/`,
      multiViewsControl: multiViewControl,
      stickySubheaderProvider,
      singleTableId,
      singleChartId,
      dynamicListReportId,
      headerActions,
      showPinnableToggle: showPinnableToggle,
      filterBar: {
        propertyInfo: propertyInfoFields,
        selectionFields,
        hideBasicSearch,
        showClearButton
      },
      views: views,
      filterBarId: hideFilterBar && !useHiddenFilterBar ? "" : filterBarId,
      filterConditions: {
        selectionVariant: selectionVariant,
        defaultSemanticDates: defaultSemanticDates
      },
      variantManagement: {
        id: filterVariantManagementID,
        targetControlIds: targetControlIds.join(",")
      },
      hasMultiVisualizations: hasMultiVisualizations(converterContext),
      templateType: manifestWrapper.getTemplateType(),
      useSemanticDateRange,
      filterInitialLayout,
      filterLayout,
      kpiDefinitions: getKPIDefinitions(converterContext),
      hideFilterBar,
      useHiddenFilterBar
    };
  };
  _exports.convertPage = convertPage;
  function getContentAreaId(converterContext, views) {
    let singleTableId = "",
      singleChartId = "";
    if (converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
      for (let view of views) {
        view = view;
        if (view.chartControlId && view.tableControlId) {
          singleChartId = view.chartControlId;
          singleTableId = view.tableControlId;
          break;
        }
      }
    } else {
      for (let view of views) {
        view = view;
        if (!singleTableId && view.tableControlId) {
          singleTableId = view.tableControlId || "";
        }
        if (!singleChartId && view.chartControlId) {
          singleChartId = view.chartControlId || "";
        }
        if (singleChartId && singleTableId) {
          break;
        }
      }
    }
    if (singleTableId || singleChartId) {
      return {
        chartId: singleChartId,
        tableId: singleTableId
      };
    }
    return undefined;
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRUYWJsZVZpc3VhbGl6YXRpb25zIiwidmlld3MiLCJ0YWJsZXMiLCJmb3JFYWNoIiwidmlldyIsInR5cGUiLCJ2aXN1YWxpemF0aW9ucyIsInNlY29uZGFyeVZpc3VhbGl6YXRpb24iLCJwcmVzZW50YXRpb24iLCJ2aXN1YWxpemF0aW9uIiwiVmlzdWFsaXphdGlvblR5cGUiLCJUYWJsZSIsInB1c2giLCJnZXRDaGFydFZpc3VhbGl6YXRpb25zIiwiY2hhcnRzIiwicHJpbWFyeVZpc3VhbGl6YXRpb24iLCJDaGFydCIsImdldERlZmF1bHRTZW1hbnRpY0RhdGVzIiwiZmlsdGVyRmllbGRzIiwiZGVmYXVsdFNlbWFudGljRGF0ZXMiLCJmaWx0ZXJGaWVsZCIsInNldHRpbmdzIiwiZGVmYXVsdFZhbHVlcyIsImxlbmd0aCIsImdldENvbXBsaWFudFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uIiwiZW50aXR5VHlwZSIsImNvbnZlcnRlckNvbnRleHQiLCJpc0FMUCIsImFubm90YXRpb25QYXRoIiwiZ2V0TWFuaWZlc3RXcmFwcGVyIiwiZ2V0RGVmYXVsdFRlbXBsYXRlQW5ub3RhdGlvblBhdGgiLCJzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50IiwiZ2V0U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCIsImVycm9yTWVzc2FnZUZvckFMUCIsInByZXNlbnRhdGlvblZhcmlhbnQiLCJQcmVzZW50YXRpb25WYXJpYW50IiwiRXJyb3IiLCJpc1ByZXNlbnRhdGlvbkNvbXBsaWFudCIsInVuZGVmaW5lZCIsImlzU2VsZWN0aW9uUHJlc2VudGF0aW9uQ29tcGxpYW50IiwiZ2V0RGVmYXVsdFByZXNlbnRhdGlvblZhcmlhbnQiLCJnZXREZWZhdWx0TGluZUl0ZW0iLCJnZXRWaWV3Iiwidmlld0NvbnZlcnRlckNvbmZpZ3VyYXRpb24iLCJjb25maWciLCJpc011bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24iLCJjdXJyZW50Q29uZmlnIiwia2V5IiwiZ2V0RGF0YVZpc3VhbGl6YXRpb25Db25maWd1cmF0aW9uIiwiYW5ub3RhdGlvbiIsImdldFJlbGF0aXZlQW5ub3RhdGlvblBhdGgiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJnZXRFbnRpdHlUeXBlIiwidGFibGVDb250cm9sSWQiLCJjaGFydENvbnRyb2xJZCIsInRpdGxlIiwic2VsZWN0aW9uVmFyaWFudFBhdGgiLCJjcmVhdGVWaXN1YWxpemF0aW9uIiwiY3VycmVudFByZXNlbnRhdGlvbiIsImlzUHJpbWFyeSIsImRlZmF1bHRWaXN1YWxpemF0aW9uIiwicHJlc2VudGF0aW9uQ3JlYXRlZCIsIk9iamVjdCIsImFzc2lnbiIsImdldFByZXNlbnRhdGlvbiIsIml0ZW0iLCJyZXNvbHZlZFRhcmdldCIsImdldEVudGl0eVR5cGVBbm5vdGF0aW9uIiwidGFyZ2V0QW5ub3RhdGlvbiIsImdldFRlbXBsYXRlVHlwZSIsIlRlbXBsYXRlVHlwZSIsIkFuYWx5dGljYWxMaXN0UGFnZSIsInNFcnJvciIsImNyZWF0ZUFscFZpZXciLCJwcmVzZW50YXRpb25zIiwiZGVmYXVsdFBhdGgiLCJpZCIsInZpc2libGUiLCJoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zIiwicHJpbWFyeSIsInNlY29uZGFyeSIsInZpZXdBbm5vdGF0aW9uIiwiY29tcGlsZUV4cHJlc3Npb24iLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJUZXh0IiwidmlzdWFsaXphdGlvbkRlZmluaXRpb24iLCJpbmRleCIsInRhYmxlVmlzdWFsaXphdGlvbiIsImZpbHRlcnMiLCJjb250cm9sIiwiaGlkZGVuRmlsdGVycyIsInBhdGhzIiwia2VlcFByZXZpb3VzUGVyc29uYWxpemF0aW9uIiwiZ2V0VGFibGVJRCIsInRlcm0iLCJTZWxlY3Rpb25WYXJpYW50Iiwic3BsaXQiLCJjaGFydFZpc3VhbGl6YXRpb24iLCJnZXRDaGFydElEIiwibXVsdGlWaWV3cyIsImxhYmVsIiwiZnJhZ21lbnQiLCJ0ZW1wbGF0ZSIsImN1c3RvbVRhYklkIiwiZ2V0Q3VzdG9tVGFiSUQiLCJnZXRWaWV3cyIsInNldHRpbmdzVmlld3MiLCJ2aWV3Q29udmVydGVyQ29uZmlncyIsInBhdGgiLCJ2aWV3Q29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHRGb3IiLCJjb250ZXh0UGF0aCIsImVudGl0eVNldCIsImdldENvbnRleHRQYXRoIiwiZ2V0QWxwVmlld0NvbmZpZyIsIm1hcCIsInZpZXdDb252ZXJ0ZXJDb25maWciLCJnZXRNdWx0aVZpZXdzQ29udHJvbCIsIm1hbmlmZXN0V3JhcHBlciIsInZpZXdzRGVmaW5pdGlvbiIsImdldFZpZXdDb25maWd1cmF0aW9uIiwiaGFzTXVsdGlWaXN1YWxpemF0aW9ucyIsInNob3dUYWJDb3VudHMiLCJzaG93Q291bnRzIiwiaGFzTXVsdGlwbGVFbnRpdHlTZXRzIiwiZ2V0SWNvblRhYkJhcklEIiwidmlld0NvbmZpZ3MiLCJjaGFydCIsInRhYmxlIiwiZ2V0RGVmYXVsdENoYXJ0IiwiZ2V0SGVhZGVyQWN0aW9ucyIsImluc2VydEN1c3RvbUVsZW1lbnRzIiwiZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdCIsImFjdGlvbnMiLCJjaGVja0NoYXJ0RmlsdGVyQmFySWQiLCJmaWx0ZXJCYXJJZCIsImZpbHRlcklkIiwiY29udmVydFBhZ2UiLCJzQ29udGV4dFBhdGgiLCJsclRhYmxlVmlzdWFsaXphdGlvbnMiLCJsckNoYXJ0VmlzdWFsaXphdGlvbnMiLCJzaG93UGlubmFibGVUb2dnbGUiLCJzb21lIiwic2luZ2xlVGFibGVJZCIsInNpbmdsZUNoYXJ0SWQiLCJkeW5hbWljTGlzdFJlcG9ydElkIiwiZ2V0RHluYW1pY0xpc3RSZXBvcnRJRCIsImdldEZpbHRlckJhcklEIiwiZmlsdGVyVmFyaWFudE1hbmFnZW1lbnRJRCIsImdldEZpbHRlclZhcmlhbnRNYW5hZ2VtZW50SUQiLCJmYkNvbmZpZyIsImdldEZpbHRlckNvbmZpZ3VyYXRpb24iLCJmaWx0ZXJJbml0aWFsTGF5b3V0IiwiaW5pdGlhbExheW91dCIsInRvTG93ZXJDYXNlIiwiZmlsdGVyTGF5b3V0IiwibGF5b3V0IiwidXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJzaG93Q2xlYXJCdXR0b24iLCJvQ29uZmlnIiwiZ2V0Q29udGVudEFyZWFJZCIsImNoYXJ0SWQiLCJ0YWJsZUlkIiwidXNlSGlkZGVuRmlsdGVyQmFyIiwiaGlkZUZpbHRlckJhciIsImlzRmlsdGVyQmFySGlkZGVuIiwibHJGaWx0ZXJQcm9wZXJ0aWVzIiwiZ2V0U2VsZWN0aW9uRmllbGRzIiwic2VsZWN0aW9uRmllbGRzIiwicHJvcGVydHlJbmZvRmllbGRzIiwic1Byb3BlcnR5SW5mbyIsImhpZGVCYXNpY1NlYXJjaCIsImdldEZpbHRlckJhckhpZGVCYXNpY1NlYXJjaCIsIm11bHRpVmlld0NvbnRyb2wiLCJzZWxlY3Rpb25WYXJpYW50IiwiZ2V0U2VsZWN0aW9uVmFyaWFudCIsImdldE1hbmlmZXN0RmlsdGVyRmllbGRzIiwiaGVhZGVyQWN0aW9ucyIsInZpc3VhbGl6YXRpb25JZHMiLCJjb25jYXQiLCJ0YXJnZXRDb250cm9sSWRzIiwiZ2V0VmFyaWFudE1hbmFnZW1lbnQiLCJWYXJpYW50TWFuYWdlbWVudFR5cGUiLCJDb250cm9sIiwic3RpY2t5U3ViaGVhZGVyUHJvdmlkZXIiLCJnZXRTdGlja3lNdWx0aVRhYkhlYWRlckNvbmZpZ3VyYXRpb24iLCJtYWluRW50aXR5U2V0IiwibWFpbkVudGl0eVR5cGUiLCJtdWx0aVZpZXdzQ29udHJvbCIsImZpbHRlckJhciIsInByb3BlcnR5SW5mbyIsImZpbHRlckNvbmRpdGlvbnMiLCJ2YXJpYW50TWFuYWdlbWVudCIsImpvaW4iLCJ0ZW1wbGF0ZVR5cGUiLCJrcGlEZWZpbml0aW9ucyIsImdldEtQSURlZmluaXRpb25zIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJMaXN0UmVwb3J0Q29udmVydGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRW50aXR5VHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUge1xuXHRMaW5lSXRlbSxcblx0UHJlc2VudGF0aW9uVmFyaWFudCxcblx0U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCxcblx0U2VsZWN0aW9uVmFyaWFudCxcblx0U2VsZWN0aW9uVmFyaWFudFR5cGVcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgdHlwZSB7IEJhc2VBY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBDaGFydFZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQ2hhcnRcIjtcbmltcG9ydCB0eXBlIHsgVGFibGVWaXN1YWxpemF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSB7IEN1c3RvbUVsZW1lbnRGaWx0ZXJGaWVsZCwgRmlsdGVyRmllbGQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L0ZpbHRlckJhclwiO1xuaW1wb3J0IHtcblx0Z2V0RmlsdGVyQmFySGlkZUJhc2ljU2VhcmNoLFxuXHRnZXRNYW5pZmVzdEZpbHRlckZpZWxkcyxcblx0Z2V0U2VsZWN0aW9uRmllbGRzXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvRmlsdGVyQmFyXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB0eXBlIHsgQ29uZmlndXJhYmxlT2JqZWN0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGluc2VydEN1c3RvbUVsZW1lbnRzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBEYXRhVmlzdWFsaXphdGlvbkFubm90YXRpb25zLCBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb24gfSBmcm9tIFwiLi4vY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQge1xuXHRnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24sXG5cdGdldERlZmF1bHRDaGFydCxcblx0Z2V0RGVmYXVsdExpbmVJdGVtLFxuXHRnZXREZWZhdWx0UHJlc2VudGF0aW9uVmFyaWFudCxcblx0Z2V0U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCxcblx0Z2V0U2VsZWN0aW9uVmFyaWFudCxcblx0aXNQcmVzZW50YXRpb25Db21wbGlhbnQsXG5cdGlzU2VsZWN0aW9uUHJlc2VudGF0aW9uQ29tcGxpYW50XG59IGZyb20gXCIuLi9jb250cm9scy9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB0eXBlIHsgS1BJRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9jb250cm9scy9Db21tb24vS1BJXCI7XG5pbXBvcnQgeyBnZXRLUElEZWZpbml0aW9ucyB9IGZyb20gXCIuLi9jb250cm9scy9Db21tb24vS1BJXCI7XG5pbXBvcnQge1xuXHRnZXRDaGFydElELFxuXHRnZXRDdXN0b21UYWJJRCxcblx0Z2V0RHluYW1pY0xpc3RSZXBvcnRJRCxcblx0Z2V0RmlsdGVyQmFySUQsXG5cdGdldEZpbHRlclZhcmlhbnRNYW5hZ2VtZW50SUQsXG5cdGdldEljb25UYWJCYXJJRCxcblx0Z2V0VGFibGVJRFxufSBmcm9tIFwiLi4vaGVscGVycy9JRFwiO1xuaW1wb3J0IHR5cGUge1xuXHRDb21iaW5lZFZpZXdQYXRoQ29uZmlndXJhdGlvbixcblx0Q3VzdG9tVmlld1RlbXBsYXRlQ29uZmlndXJhdGlvbixcblx0TXVsdGlwbGVWaWV3c0NvbmZpZ3VyYXRpb24sXG5cdFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbixcblx0Vmlld1BhdGhDb25maWd1cmF0aW9uXG59IGZyb20gXCIuLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBUZW1wbGF0ZVR5cGUsIFZhcmlhbnRNYW5hZ2VtZW50VHlwZSwgVmlzdWFsaXphdGlvblR5cGUgfSBmcm9tIFwiLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuXG50eXBlIFZpZXdBbm5vdGF0aW9ucyA9IFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgfCBTZWxlY3Rpb25WYXJpYW50O1xudHlwZSBWYXJpYW50TWFuYWdlbWVudERlZmluaXRpb24gPSB7XG5cdGlkOiBzdHJpbmc7XG5cdHRhcmdldENvbnRyb2xJZHM6IHN0cmluZztcbn07XG5cbnR5cGUgTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbiA9IFZpZXdQYXRoQ29uZmlndXJhdGlvbiAmIHtcblx0YW5ub3RhdGlvbj86IERhdGFWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnM7XG59O1xuXG50eXBlIFNpbmdsZVZpZXdDb25maWd1cmF0aW9uID0ge1xuXHRhbm5vdGF0aW9uPzogRGF0YVZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucztcbn07XG5cbnR5cGUgQ3VzdG9tVmlld0NvbmZpZ3VyYXRpb24gPSBDdXN0b21WaWV3VGVtcGxhdGVDb25maWd1cmF0aW9uICYge1xuXHR0eXBlOiBzdHJpbmc7XG59O1xuXG50eXBlIFZpZXdDb25maWd1cmF0aW9uID0gTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbiB8IFNpbmdsZVZpZXdDb25maWd1cmF0aW9uIHwgQ3VzdG9tVmlld0NvbmZpZ3VyYXRpb247XG50eXBlIFZpZXdBbm5vdGF0aW9uQ29uZmlndXJhdGlvbiA9IE11bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24gfCBTaW5nbGVWaWV3Q29uZmlndXJhdGlvbjtcblxudHlwZSBWaWV3Q29udmVydGVyU2V0dGluZ3MgPSBWaWV3Q29uZmlndXJhdGlvbiAmIHtcblx0Y29udmVydGVyQ29udGV4dD86IENvbnZlcnRlckNvbnRleHQ7XG59O1xuXG50eXBlIERlZmF1bHRTZW1hbnRpY0RhdGUgPSBDb25maWd1cmFibGVPYmplY3QgJiB7XG5cdG9wZXJhdG9yOiBzdHJpbmc7XG59O1xuXG50eXBlIE11bHRpVmlld3NDb250cm9sQ29uZmlndXJhdGlvbiA9IHtcblx0aWQ6IHN0cmluZztcblx0c2hvd1RhYkNvdW50cz86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBMaXN0UmVwb3J0RGVmaW5pdGlvbiA9IHtcblx0bWFpbkVudGl0eVNldDogc3RyaW5nO1xuXHRtYWluRW50aXR5VHlwZTogc3RyaW5nOyAvLyBlbnRpdHlUeXBlPiBhdCB0aGUgc3RhcnQgb2YgTFIgdGVtcGxhdGluZ1xuXHRzaW5nbGVUYWJsZUlkPzogc3RyaW5nOyAvLyBvbmx5IHdpdGggc2luZ2xlIFRhYmxlIG1vZGVcblx0c2luZ2xlQ2hhcnRJZD86IHN0cmluZzsgLy8gb25seSB3aXRoIHNpbmdsZSBUYWJsZSBtb2RlXG5cdGR5bmFtaWNMaXN0UmVwb3J0SWQ6IHN0cmluZztcblx0c3RpY2t5U3ViaGVhZGVyUHJvdmlkZXI/OiBzdHJpbmc7XG5cdG11bHRpVmlld3NDb250cm9sPzogTXVsdGlWaWV3c0NvbnRyb2xDb25maWd1cmF0aW9uOyAvLyBvbmx5IHdpdGggbXVsdGkgVGFibGUgbW9kZVxuXHRoZWFkZXJBY3Rpb25zOiBCYXNlQWN0aW9uW107XG5cdHNob3dQaW5uYWJsZVRvZ2dsZT86IGJvb2xlYW47XG5cdGZpbHRlckJhcjoge1xuXHRcdHByb3BlcnR5SW5mbzogYW55O1xuXHRcdHNlbGVjdGlvbkZpZWxkczogRmlsdGVyRmllbGRbXTtcblx0XHRoaWRlQmFzaWNTZWFyY2g6IGJvb2xlYW47XG5cdFx0c2hvd0NsZWFyQnV0dG9uPzogYm9vbGVhbjtcblx0fTtcblx0dmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdO1xuXHRmaWx0ZXJDb25kaXRpb25zOiB7XG5cdFx0c2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudFR5cGUgfCB1bmRlZmluZWQ7XG5cdFx0ZGVmYXVsdFNlbWFudGljRGF0ZXM6IFJlY29yZDxzdHJpbmcsIERlZmF1bHRTZW1hbnRpY0RhdGU+IHwge307XG5cdH07XG5cdGZpbHRlckJhcklkOiBzdHJpbmc7XG5cdHZhcmlhbnRNYW5hZ2VtZW50OiBWYXJpYW50TWFuYWdlbWVudERlZmluaXRpb247XG5cdGhhc011bHRpVmlzdWFsaXphdGlvbnM6IGJvb2xlYW47XG5cdHRlbXBsYXRlVHlwZTogVGVtcGxhdGVUeXBlO1xuXHR1c2VTZW1hbnRpY0RhdGVSYW5nZT86IGJvb2xlYW47XG5cdGZpbHRlckluaXRpYWxMYXlvdXQ/OiBzdHJpbmc7XG5cdGZpbHRlckxheW91dD86IHN0cmluZztcblx0a3BpRGVmaW5pdGlvbnM6IEtQSURlZmluaXRpb25bXTtcblx0aGlkZUZpbHRlckJhcjogYm9vbGVhbjtcblx0dXNlSGlkZGVuRmlsdGVyQmFyOiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uID0gU2luZ2xlVmlld0RlZmluaXRpb24gfCBDdXN0b21WaWV3RGVmaW5pdGlvbiB8IENvbWJpbmVkVmlld0RlZmluaXRpb247XG5cbmV4cG9ydCB0eXBlIENvbWJpbmVkVmlld0RlZmluaXRpb24gPSB7XG5cdHNlbGVjdGlvblZhcmlhbnRQYXRoPzogc3RyaW5nOyAvLyBvbmx5IHdpdGggb24gbXVsdGkgVGFibGUgbW9kZVxuXHR0aXRsZT86IHN0cmluZzsgLy8gb25seSB3aXRoIG11bHRpIFRhYmxlIG1vZGVcblx0cHJpbWFyeVZpc3VhbGl6YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbjtcblx0c2Vjb25kYXJ5VmlzdWFsaXphdGlvbjogRGF0YVZpc3VhbGl6YXRpb25EZWZpbml0aW9uO1xuXHR0YWJsZUNvbnRyb2xJZDogc3RyaW5nO1xuXHRjaGFydENvbnRyb2xJZDogc3RyaW5nO1xuXHRkZWZhdWx0UGF0aD86IHN0cmluZztcblx0dmlzaWJsZT86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIEN1c3RvbVZpZXdEZWZpbml0aW9uID0ge1xuXHR0aXRsZT86IHN0cmluZzsgLy8gb25seSB3aXRoIG11bHRpIFRhYmxlIG1vZGVcblx0ZnJhZ21lbnQ6IHN0cmluZztcblx0dHlwZTogc3RyaW5nO1xuXHRjdXN0b21UYWJJZDogc3RyaW5nO1xuXHR2aXNpYmxlPzogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIFNpbmdsZVZpZXdEZWZpbml0aW9uID0gU2luZ2xlVGFibGVWaWV3RGVmaW5pdGlvbiB8IFNpbmdsZUNoYXJ0Vmlld0RlZmluaXRpb247XG5cbmV4cG9ydCB0eXBlIEJhc2VTaW5nbGVWaWV3RGVmaW5pdGlvbiA9IHtcblx0c2VsZWN0aW9uVmFyaWFudFBhdGg/OiBzdHJpbmc7IC8vIG9ubHkgd2l0aCBvbiBtdWx0aSBUYWJsZSBtb2RlXG5cdHRpdGxlPzogc3RyaW5nOyAvLyBvbmx5IHdpdGggbXVsdGkgVGFibGUgbW9kZVxuXHRwcmVzZW50YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbjtcbn07XG5cbmV4cG9ydCB0eXBlIFNpbmdsZVRhYmxlVmlld0RlZmluaXRpb24gPSBCYXNlU2luZ2xlVmlld0RlZmluaXRpb24gJiB7XG5cdHRhYmxlQ29udHJvbElkPzogc3RyaW5nO1xuXHR2aXNpYmxlPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgU2luZ2xlQ2hhcnRWaWV3RGVmaW5pdGlvbiA9IEJhc2VTaW5nbGVWaWV3RGVmaW5pdGlvbiAmIHtcblx0Y2hhcnRDb250cm9sSWQ/OiBzdHJpbmc7XG5cdHZpc2libGU/OiBzdHJpbmc7XG59O1xuXG50eXBlIENvbnRlbnRBcmVhSUQgPSB7XG5cdGNoYXJ0SWQ6IHN0cmluZztcblx0dGFibGVJZDogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgYWxsIGxpc3QgcmVwb3J0IHRhYmxlcy5cbiAqXG4gKiBAcGFyYW0gdmlld3MgVGhlIGxpc3QgcmVwb3J0IHZpZXdzIGNvbmZpZ3VyZWQgaW4gdGhlIG1hbmlmZXN0XG4gKiBAcmV0dXJucyBUaGUgbGlzdCByZXBvcnQgdGFibGVcbiAqL1xuZnVuY3Rpb24gZ2V0VGFibGVWaXN1YWxpemF0aW9ucyh2aWV3czogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uW10pOiBUYWJsZVZpc3VhbGl6YXRpb25bXSB7XG5cdGNvbnN0IHRhYmxlczogVGFibGVWaXN1YWxpemF0aW9uW10gPSBbXTtcblx0dmlld3MuZm9yRWFjaChmdW5jdGlvbiAodmlldykge1xuXHRcdGlmICghKHZpZXcgYXMgQ3VzdG9tVmlld0RlZmluaXRpb24pLnR5cGUpIHtcblx0XHRcdGNvbnN0IHZpc3VhbGl6YXRpb25zID0gKHZpZXcgYXMgQ29tYmluZWRWaWV3RGVmaW5pdGlvbikuc2Vjb25kYXJ5VmlzdWFsaXphdGlvblxuXHRcdFx0XHQ/ICh2aWV3IGFzIENvbWJpbmVkVmlld0RlZmluaXRpb24pLnNlY29uZGFyeVZpc3VhbGl6YXRpb24udmlzdWFsaXphdGlvbnNcblx0XHRcdFx0OiAodmlldyBhcyBTaW5nbGVWaWV3RGVmaW5pdGlvbikucHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zO1xuXG5cdFx0XHR2aXN1YWxpemF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uICh2aXN1YWxpemF0aW9uKSB7XG5cdFx0XHRcdGlmICh2aXN1YWxpemF0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLlRhYmxlKSB7XG5cdFx0XHRcdFx0dGFibGVzLnB1c2godmlzdWFsaXphdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiB0YWJsZXM7XG59XG5cbmZ1bmN0aW9uIGdldENoYXJ0VmlzdWFsaXphdGlvbnModmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdKTogQ2hhcnRWaXN1YWxpemF0aW9uW10ge1xuXHRjb25zdCBjaGFydHM6IENoYXJ0VmlzdWFsaXphdGlvbltdID0gW107XG5cdHZpZXdzLmZvckVhY2goZnVuY3Rpb24gKHZpZXcpIHtcblx0XHRpZiAoISh2aWV3IGFzIEN1c3RvbVZpZXdEZWZpbml0aW9uKS50eXBlKSB7XG5cdFx0XHRjb25zdCB2aXN1YWxpemF0aW9ucyA9ICh2aWV3IGFzIENvbWJpbmVkVmlld0RlZmluaXRpb24pLnByaW1hcnlWaXN1YWxpemF0aW9uXG5cdFx0XHRcdD8gKHZpZXcgYXMgQ29tYmluZWRWaWV3RGVmaW5pdGlvbikucHJpbWFyeVZpc3VhbGl6YXRpb24udmlzdWFsaXphdGlvbnNcblx0XHRcdFx0OiAodmlldyBhcyBTaW5nbGVWaWV3RGVmaW5pdGlvbikucHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zO1xuXG5cdFx0XHR2aXN1YWxpemF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uICh2aXN1YWxpemF0aW9uKSB7XG5cdFx0XHRcdGlmICh2aXN1YWxpemF0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLkNoYXJ0KSB7XG5cdFx0XHRcdFx0Y2hhcnRzLnB1c2godmlzdWFsaXphdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBjaGFydHM7XG59XG5cbmNvbnN0IGdldERlZmF1bHRTZW1hbnRpY0RhdGVzID0gZnVuY3Rpb24gKGZpbHRlckZpZWxkczogUmVjb3JkPHN0cmluZywgQ3VzdG9tRWxlbWVudEZpbHRlckZpZWxkPik6IFJlY29yZDxzdHJpbmcsIERlZmF1bHRTZW1hbnRpY0RhdGU+IHtcblx0Y29uc3QgZGVmYXVsdFNlbWFudGljRGF0ZXM6IGFueSA9IHt9O1xuXHRmb3IgKGNvbnN0IGZpbHRlckZpZWxkIGluIGZpbHRlckZpZWxkcykge1xuXHRcdGlmIChmaWx0ZXJGaWVsZHNbZmlsdGVyRmllbGRdPy5zZXR0aW5ncz8uZGVmYXVsdFZhbHVlcz8ubGVuZ3RoKSB7XG5cdFx0XHRkZWZhdWx0U2VtYW50aWNEYXRlc1tmaWx0ZXJGaWVsZF0gPSBmaWx0ZXJGaWVsZHNbZmlsdGVyRmllbGRdPy5zZXR0aW5ncz8uZGVmYXVsdFZhbHVlcztcblx0XHR9XG5cdH1cblx0cmV0dXJuIGRlZmF1bHRTZW1hbnRpY0RhdGVzO1xufTtcblxuLyoqXG4gKiBGaW5kIGEgdmlzdWFsaXphdGlvbiBhbm5vdGF0aW9uIHRoYXQgY2FuIGJlIHVzZWQgZm9yIHJlbmRlcmluZyB0aGUgbGlzdCByZXBvcnQuXG4gKlxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIGN1cnJlbnQgRW50aXR5VHlwZVxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBpc0FMUFxuICogQHJldHVybnMgQSBjb21wbGlhbnQgYW5ub3RhdGlvbiBmb3IgcmVuZGVyaW5nIHRoZSBsaXN0IHJlcG9ydFxuICovXG5mdW5jdGlvbiBnZXRDb21wbGlhbnRWaXN1YWxpemF0aW9uQW5ub3RhdGlvbihcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0aXNBTFA6IGJvb2xlYW5cbik6IExpbmVJdGVtIHwgUHJlc2VudGF0aW9uVmFyaWFudCB8IFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgfCB1bmRlZmluZWQge1xuXHRjb25zdCBhbm5vdGF0aW9uUGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuZ2V0RGVmYXVsdFRlbXBsYXRlQW5ub3RhdGlvblBhdGgoKTtcblx0Y29uc3Qgc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCA9IGdldFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQoZW50aXR5VHlwZSwgYW5ub3RhdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBlcnJvck1lc3NhZ2VGb3JBTFAgPSBcIkFMUCBmbGF2b3IgbmVlZHMgYm90aCBjaGFydCBhbmQgdGFibGUgdG8gbG9hZCB0aGUgYXBwbGljYXRpb25cIjtcblxuXHRpZiAoc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCkge1xuXHRcdGlmIChhbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0Y29uc3QgcHJlc2VudGF0aW9uVmFyaWFudCA9IHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQuUHJlc2VudGF0aW9uVmFyaWFudDtcblx0XHRcdGlmICghcHJlc2VudGF0aW9uVmFyaWFudCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJQcmVzZW50YXRpb24gVmFyaWFudCBpcyBub3QgY29uZmlndXJlZCBpbiB0aGUgU1BWIG1lbnRpb25lZCBpbiB0aGUgbWFuaWZlc3RcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIWlzUHJlc2VudGF0aW9uQ29tcGxpYW50KHByZXNlbnRhdGlvblZhcmlhbnQsIGlzQUxQKSkge1xuXHRcdFx0XHRpZiAoaXNBTFApIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlRm9yQUxQKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoaXNTZWxlY3Rpb25QcmVzZW50YXRpb25Db21wbGlhbnQoc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCwgaXNBTFApID09PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudDtcblx0XHR9IGVsc2UgaWYgKGlzQUxQKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlRm9yQUxQKTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBwcmVzZW50YXRpb25WYXJpYW50ID0gZ2V0RGVmYXVsdFByZXNlbnRhdGlvblZhcmlhbnQoZW50aXR5VHlwZSk7XG5cdGlmIChwcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0aWYgKGlzUHJlc2VudGF0aW9uQ29tcGxpYW50KHByZXNlbnRhdGlvblZhcmlhbnQsIGlzQUxQKSkge1xuXHRcdFx0cmV0dXJuIHByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdFx0fSBlbHNlIGlmIChpc0FMUCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZUZvckFMUCk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKCFpc0FMUCkge1xuXHRcdHJldHVybiBnZXREZWZhdWx0TGluZUl0ZW0oZW50aXR5VHlwZSk7XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuY29uc3QgZ2V0VmlldyA9IGZ1bmN0aW9uICh2aWV3Q29udmVydGVyQ29uZmlndXJhdGlvbjogVmlld0NvbnZlcnRlclNldHRpbmdzKTogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uIHtcblx0bGV0IGNvbmZpZyA9IHZpZXdDb252ZXJ0ZXJDb25maWd1cmF0aW9uO1xuXHRpZiAoY29uZmlnLmNvbnZlcnRlckNvbnRleHQpIHtcblx0XHRsZXQgY29udmVydGVyQ29udGV4dCA9IGNvbmZpZy5jb252ZXJ0ZXJDb250ZXh0O1xuXHRcdGNvbmZpZyA9IGNvbmZpZyBhcyBWaWV3QW5ub3RhdGlvbkNvbmZpZ3VyYXRpb247XG5cdFx0Y29uc3QgaXNNdWx0aXBsZVZpZXdDb25maWd1cmF0aW9uID0gZnVuY3Rpb24gKGN1cnJlbnRDb25maWc6IFZpZXdDb25maWd1cmF0aW9uKTogY3VycmVudENvbmZpZyBpcyBNdWx0aXBsZVZpZXdDb25maWd1cmF0aW9uIHtcblx0XHRcdHJldHVybiAoY3VycmVudENvbmZpZyBhcyBNdWx0aXBsZVZpZXdDb25maWd1cmF0aW9uKS5rZXkgIT09IHVuZGVmaW5lZDtcblx0XHR9O1xuXHRcdGxldCBwcmVzZW50YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiA9IGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbihcblx0XHRcdGNvbmZpZy5hbm5vdGF0aW9uXG5cdFx0XHRcdD8gY29udmVydGVyQ29udGV4dC5nZXRSZWxhdGl2ZUFubm90YXRpb25QYXRoKGNvbmZpZy5hbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSwgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkpXG5cdFx0XHRcdDogXCJcIixcblx0XHRcdHRydWUsXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0Y29uZmlnIGFzIFZpZXdQYXRoQ29uZmlndXJhdGlvbixcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdGlzTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbihjb25maWcpXG5cdFx0KTtcblx0XHRsZXQgdGFibGVDb250cm9sSWQgPSBcIlwiO1xuXHRcdGxldCBjaGFydENvbnRyb2xJZCA9IFwiXCI7XG5cdFx0bGV0IHRpdGxlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBcIlwiO1xuXHRcdGxldCBzZWxlY3Rpb25WYXJpYW50UGF0aCA9IFwiXCI7XG5cdFx0Y29uc3QgY3JlYXRlVmlzdWFsaXphdGlvbiA9IGZ1bmN0aW9uIChjdXJyZW50UHJlc2VudGF0aW9uOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb24sIGlzUHJpbWFyeT86IGJvb2xlYW4pIHtcblx0XHRcdGxldCBkZWZhdWx0VmlzdWFsaXphdGlvbjtcblx0XHRcdGZvciAoY29uc3QgdmlzdWFsaXphdGlvbiBvZiBjdXJyZW50UHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zKSB7XG5cdFx0XHRcdGlmIChpc1ByaW1hcnkgJiYgdmlzdWFsaXphdGlvbi50eXBlID09PSBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCkge1xuXHRcdFx0XHRcdGRlZmF1bHRWaXN1YWxpemF0aW9uID0gdmlzdWFsaXphdGlvbjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIWlzUHJpbWFyeSAmJiB2aXN1YWxpemF0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLlRhYmxlKSB7XG5cdFx0XHRcdFx0ZGVmYXVsdFZpc3VhbGl6YXRpb24gPSB2aXN1YWxpemF0aW9uO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBwcmVzZW50YXRpb25DcmVhdGVkID0gT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFByZXNlbnRhdGlvbik7XG5cdFx0XHRpZiAoZGVmYXVsdFZpc3VhbGl6YXRpb24pIHtcblx0XHRcdFx0cHJlc2VudGF0aW9uQ3JlYXRlZC52aXN1YWxpemF0aW9ucyA9IFtkZWZhdWx0VmlzdWFsaXphdGlvbl07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKGlzUHJpbWFyeSA/IFwiUHJpbWFyeVwiIDogXCJTZWNvbmRhcnlcIikgKyBcIiB2aXN1YWxpc2F0aW9uIG5lZWRzIHZhbGlkIFwiICsgKGlzUHJpbWFyeSA/IFwiY2hhcnRcIiA6IFwidGFibGVcIikpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHByZXNlbnRhdGlvbkNyZWF0ZWQ7XG5cdFx0fTtcblx0XHRjb25zdCBnZXRQcmVzZW50YXRpb24gPSBmdW5jdGlvbiAoaXRlbTogU2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uLCBpc1ByaW1hcnk6IGJvb2xlYW4pIHtcblx0XHRcdGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihpdGVtLmFubm90YXRpb25QYXRoKTtcblx0XHRcdGNvbnN0IHRhcmdldEFubm90YXRpb24gPSByZXNvbHZlZFRhcmdldC5hbm5vdGF0aW9uIGFzIERhdGFWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnM7XG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0ID0gcmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dDtcblx0XHRcdGNvbnN0IGFubm90YXRpb24gPSB0YXJnZXRBbm5vdGF0aW9uO1xuXHRcdFx0aWYgKGFubm90YXRpb24gfHwgY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZSkge1xuXHRcdFx0XHRwcmVzZW50YXRpb24gPSBnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24oXG5cdFx0XHRcdFx0YW5ub3RhdGlvblxuXHRcdFx0XHRcdFx0PyBjb252ZXJ0ZXJDb250ZXh0LmdldFJlbGF0aXZlQW5ub3RhdGlvblBhdGgoYW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWUsIGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpKVxuXHRcdFx0XHRcdFx0OiBcIlwiLFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRjb25maWcgYXMgVmlld1BhdGhDb25maWd1cmF0aW9uXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBwcmVzZW50YXRpb247XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBzRXJyb3IgPVxuXHRcdFx0XHRcdFwiQW5ub3RhdGlvbiBQYXRoIGZvciB0aGUgXCIgK1xuXHRcdFx0XHRcdChpc1ByaW1hcnkgPyBcInByaW1hcnlcIiA6IFwic2Vjb25kYXJ5XCIpICtcblx0XHRcdFx0XHRcIiB2aXN1YWxpc2F0aW9uIG1lbnRpb25lZCBpbiB0aGUgbWFuaWZlc3QgaXMgbm90IGZvdW5kXCI7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihzRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0Y29uc3QgY3JlYXRlQWxwVmlldyA9IGZ1bmN0aW9uIChcblx0XHRcdHByZXNlbnRhdGlvbnM6IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbltdLFxuXHRcdFx0ZGVmYXVsdFBhdGg6IFwiYm90aFwiIHwgXCJwcmltYXJ5XCIgfCBcInNlY29uZGFyeVwiIHwgdW5kZWZpbmVkXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBwcmltYXJ5VmlzdWFsaXphdGlvbjogRGF0YVZpc3VhbGl6YXRpb25EZWZpbml0aW9uIHwgdW5kZWZpbmVkID0gY3JlYXRlVmlzdWFsaXphdGlvbihwcmVzZW50YXRpb25zWzBdLCB0cnVlKTtcblx0XHRcdGNoYXJ0Q29udHJvbElkID0gKHByaW1hcnlWaXN1YWxpemF0aW9uPy52aXN1YWxpemF0aW9uc1swXSBhcyBDaGFydFZpc3VhbGl6YXRpb24pPy5pZDtcblx0XHRcdGNvbnN0IHNlY29uZGFyeVZpc3VhbGl6YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCA9IGNyZWF0ZVZpc3VhbGl6YXRpb24oXG5cdFx0XHRcdHByZXNlbnRhdGlvbnNbMV0gPyBwcmVzZW50YXRpb25zWzFdIDogcHJlc2VudGF0aW9uc1swXSxcblx0XHRcdFx0ZmFsc2Vcblx0XHRcdCk7XG5cdFx0XHR0YWJsZUNvbnRyb2xJZCA9IChzZWNvbmRhcnlWaXN1YWxpemF0aW9uPy52aXN1YWxpemF0aW9uc1swXSBhcyBUYWJsZVZpc3VhbGl6YXRpb24pPy5hbm5vdGF0aW9uPy5pZDtcblx0XHRcdGlmIChwcmltYXJ5VmlzdWFsaXphdGlvbiAmJiBzZWNvbmRhcnlWaXN1YWxpemF0aW9uKSB7XG5cdFx0XHRcdGNvbmZpZyA9IGNvbmZpZyBhcyBWaWV3UGF0aENvbmZpZ3VyYXRpb247XG5cdFx0XHRcdGNvbnN0IHZpc2libGUgPSBjb25maWcudmlzaWJsZTtcblx0XHRcdFx0Y29uc3QgdmlldzogQ29tYmluZWRWaWV3RGVmaW5pdGlvbiA9IHtcblx0XHRcdFx0XHRwcmltYXJ5VmlzdWFsaXphdGlvbixcblx0XHRcdFx0XHRzZWNvbmRhcnlWaXN1YWxpemF0aW9uLFxuXHRcdFx0XHRcdHRhYmxlQ29udHJvbElkLFxuXHRcdFx0XHRcdGNoYXJ0Q29udHJvbElkLFxuXHRcdFx0XHRcdGRlZmF1bHRQYXRoLFxuXHRcdFx0XHRcdHZpc2libGVcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIHZpZXc7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRpZiAoXG5cdFx0XHQhY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKGNvbmZpZyBhcyBWaWV3UGF0aENvbmZpZ3VyYXRpb24pICYmXG5cdFx0XHRwcmVzZW50YXRpb24/LnZpc3VhbGl6YXRpb25zPy5sZW5ndGggPT09IDIgJiZcblx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2Vcblx0XHQpIHtcblx0XHRcdGNvbnN0IHZpZXc6IENvbWJpbmVkVmlld0RlZmluaXRpb24gfCB1bmRlZmluZWQgPSBjcmVhdGVBbHBWaWV3KFtwcmVzZW50YXRpb25dLCBcImJvdGhcIik7XG5cdFx0XHRpZiAodmlldykge1xuXHRcdFx0XHRyZXR1cm4gdmlldztcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKGNvbmZpZyBhcyBWaWV3UGF0aENvbmZpZ3VyYXRpb24pIHx8XG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlXG5cdFx0KSB7XG5cdFx0XHRjb25zdCB7IHByaW1hcnksIHNlY29uZGFyeSB9ID0gY29uZmlnIGFzIENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uO1xuXHRcdFx0aWYgKHByaW1hcnkgJiYgcHJpbWFyeS5sZW5ndGggJiYgc2Vjb25kYXJ5ICYmIHNlY29uZGFyeS5sZW5ndGgpIHtcblx0XHRcdFx0Y29uc3QgdmlldzogQ29tYmluZWRWaWV3RGVmaW5pdGlvbiB8IHVuZGVmaW5lZCA9IGNyZWF0ZUFscFZpZXcoXG5cdFx0XHRcdFx0W2dldFByZXNlbnRhdGlvbihwcmltYXJ5WzBdLCB0cnVlKSwgZ2V0UHJlc2VudGF0aW9uKHNlY29uZGFyeVswXSwgZmFsc2UpXSxcblx0XHRcdFx0XHQoY29uZmlnIGFzIENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uKS5kZWZhdWx0UGF0aFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAodmlldykge1xuXHRcdFx0XHRcdHJldHVybiB2aWV3O1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTZWNvbmRhcnlJdGVtcyBpbiB0aGUgVmlld3MgaXMgbm90IHByZXNlbnRcIik7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChpc011bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24oY29uZmlnKSkge1xuXHRcdFx0Ly8ga2V5IGV4aXN0cyBvbmx5IG9uIG11bHRpIHRhYmxlcyBtb2RlXG5cdFx0XHRjb25zdCByZXNvbHZlZFRhcmdldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24oKGNvbmZpZyBhcyBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb24pLmFubm90YXRpb25QYXRoKTtcblx0XHRcdGNvbnN0IHZpZXdBbm5vdGF0aW9uOiBWaWV3QW5ub3RhdGlvbnMgPSByZXNvbHZlZFRhcmdldC5hbm5vdGF0aW9uO1xuXHRcdFx0Y29udmVydGVyQ29udGV4dCA9IHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHQ7XG5cdFx0XHR0aXRsZSA9IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbih2aWV3QW5ub3RhdGlvbi5UZXh0KSk7XG5cdFx0XHQvLyBOZWVkIHRvIGxvb3Agb24gdGFibGUgaW50byB2aWV3cyBzaW5jZSBtdWx0aSB0YWJsZSBtb2RlIGdldCBzcGVjaWZpYyBjb25maWd1cmF0aW9uIChoaWRkZW4gZmlsdGVycyBvciBUYWJsZSBJZClcblx0XHRcdHByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9ucy5mb3JFYWNoKCh2aXN1YWxpemF0aW9uRGVmaW5pdGlvbiwgaW5kZXgpID0+IHtcblx0XHRcdFx0c3dpdGNoICh2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi50eXBlKSB7XG5cdFx0XHRcdFx0Y2FzZSBWaXN1YWxpemF0aW9uVHlwZS5UYWJsZTpcblx0XHRcdFx0XHRcdGNvbnN0IHRhYmxlVmlzdWFsaXphdGlvbiA9IHByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9uc1tpbmRleF0gYXMgVGFibGVWaXN1YWxpemF0aW9uO1xuXHRcdFx0XHRcdFx0Y29uc3QgZmlsdGVycyA9IHRhYmxlVmlzdWFsaXphdGlvbi5jb250cm9sLmZpbHRlcnMgfHwge307XG5cdFx0XHRcdFx0XHRmaWx0ZXJzLmhpZGRlbkZpbHRlcnMgPSBmaWx0ZXJzLmhpZGRlbkZpbHRlcnMgfHwgeyBwYXRoczogW10gfTtcblx0XHRcdFx0XHRcdGlmICghKGNvbmZpZyBhcyBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb24pLmtlZXBQcmV2aW91c1BlcnNvbmFsaXphdGlvbikge1xuXHRcdFx0XHRcdFx0XHQvLyBOZWVkIHRvIG92ZXJyaWRlIFRhYmxlIElkIHRvIG1hdGNoIHdpdGggVGFiIEtleSAoY3VycmVudGx5IG9ubHkgdGFibGUgaXMgbWFuYWdlZCBpbiBtdWx0aXBsZSB2aWV3IG1vZGUpXG5cdFx0XHRcdFx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5hbm5vdGF0aW9uLmlkID0gZ2V0VGFibGVJRCgoY29uZmlnIGFzIFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbikua2V5IHx8IFwiXCIsIFwiTGluZUl0ZW1cIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjb25maWcgPSBjb25maWcgYXMgVmlld0Fubm90YXRpb25Db25maWd1cmF0aW9uO1xuXHRcdFx0XHRcdFx0aWYgKGNvbmZpZy5hbm5vdGF0aW9uPy50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0XHRcdFx0XHRcdGlmICghY29uZmlnLmFubm90YXRpb24uU2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHRcdFx0XHRcdGBUaGUgU2VsZWN0aW9uIFZhcmlhbnQgaXMgbWlzc2luZyBmb3IgdGhlIFNlbGVjdGlvbiBQcmVzZW50YXRpb24gVmFyaWFudCAke2NvbmZpZy5hbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZX1gXG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50UGF0aCA9IGBAJHtjb25maWcuYW5ub3RhdGlvbi5TZWxlY3Rpb25WYXJpYW50Py5mdWxseVF1YWxpZmllZE5hbWUuc3BsaXQoXCJAXCIpWzFdfWA7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50UGF0aCA9IChjb25maWcgYXMgU2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uKS5hbm5vdGF0aW9uUGF0aDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vUHJvdmlkZSBTZWxlY3Rpb24gVmFyaWFudCB0byBoaWRkZW5GaWx0ZXJzIGluIG9yZGVyIHRvIHNldCB0aGUgU1YgZmlsdGVycyB0byB0aGUgdGFibGUuXG5cdFx0XHRcdFx0XHQvL01EQyBUYWJsZSBvdmVycmlkZXMgYmluZGluZyBGaWx0ZXIgYW5kIGZyb20gU0FQIEZFIHRoZSBvbmx5IG1ldGhvZCB3aGVyZSB3ZSBhcmUgYWJsZSB0byBhZGRcblx0XHRcdFx0XHRcdC8vYWRkaXRpb25hbCBmaWx0ZXIgaXMgJ3JlYmluZFRhYmxlJyBpbnRvIFRhYmxlIGRlbGVnYXRlLlxuXHRcdFx0XHRcdFx0Ly9UbyBhdm9pZCBpbXBsZW1lbnRpbmcgc3BlY2lmaWMgTFIgZmVhdHVyZSB0byBTQVAgRkUgTWFjcm8gVGFibGUsIHRoZSBmaWx0ZXIocykgcmVsYXRlZCB0byB0aGUgVGFiIChtdWx0aSB0YWJsZSBtb2RlKVxuXHRcdFx0XHRcdFx0Ly9jYW4gYmUgcGFzc2VkIHRvIG1hY3JvIHRhYmxlIHZpYSBwYXJhbWV0ZXIvY29udGV4dCBuYW1lZCBmaWx0ZXJzIGFuZCBrZXkgaGlkZGVuRmlsdGVycy5cblx0XHRcdFx0XHRcdGZpbHRlcnMuaGlkZGVuRmlsdGVycy5wYXRocy5wdXNoKHsgYW5ub3RhdGlvblBhdGg6IHNlbGVjdGlvblZhcmlhbnRQYXRoIH0pO1xuXHRcdFx0XHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmNvbnRyb2wuZmlsdGVycyA9IGZpbHRlcnM7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFZpc3VhbGl6YXRpb25UeXBlLkNoYXJ0OlxuXHRcdFx0XHRcdFx0Y29uc3QgY2hhcnRWaXN1YWxpemF0aW9uID0gcHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zW2luZGV4XSBhcyBDaGFydFZpc3VhbGl6YXRpb247XG5cdFx0XHRcdFx0XHRjaGFydFZpc3VhbGl6YXRpb24uaWQgPSBnZXRDaGFydElEKChjb25maWcgYXMgU2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uKS5rZXkgfHwgXCJcIiwgXCJDaGFydFwiKTtcblx0XHRcdFx0XHRcdGNoYXJ0VmlzdWFsaXphdGlvbi5tdWx0aVZpZXdzID0gdHJ1ZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9ucy5mb3JFYWNoKCh2aXN1YWxpemF0aW9uRGVmaW5pdGlvbikgPT4ge1xuXHRcdFx0aWYgKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLlRhYmxlKSB7XG5cdFx0XHRcdHRhYmxlQ29udHJvbElkID0gdmlzdWFsaXphdGlvbkRlZmluaXRpb24uYW5ub3RhdGlvbi5pZDtcblx0XHRcdH0gZWxzZSBpZiAodmlzdWFsaXphdGlvbkRlZmluaXRpb24udHlwZSA9PT0gVmlzdWFsaXphdGlvblR5cGUuQ2hhcnQpIHtcblx0XHRcdFx0Y2hhcnRDb250cm9sSWQgPSB2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi5pZDtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRjb25maWcgPSBjb25maWcgYXMgVmlld1BhdGhDb25maWd1cmF0aW9uO1xuXHRcdGNvbnN0IHZpc2libGUgPSBjb25maWcudmlzaWJsZTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0cHJlc2VudGF0aW9uLFxuXHRcdFx0dGFibGVDb250cm9sSWQsXG5cdFx0XHRjaGFydENvbnRyb2xJZCxcblx0XHRcdHRpdGxlLFxuXHRcdFx0c2VsZWN0aW9uVmFyaWFudFBhdGgsXG5cdFx0XHR2aXNpYmxlXG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHRjb25maWcgPSBjb25maWcgYXMgQ3VzdG9tVmlld0NvbmZpZ3VyYXRpb247XG5cdFx0Y29uc3QgdGl0bGUgPSBjb25maWcubGFiZWwsXG5cdFx0XHRmcmFnbWVudCA9IGNvbmZpZy50ZW1wbGF0ZSxcblx0XHRcdHR5cGUgPSBjb25maWcudHlwZSxcblx0XHRcdGN1c3RvbVRhYklkID0gZ2V0Q3VzdG9tVGFiSUQoY29uZmlnLmtleSB8fCBcIlwiKSxcblx0XHRcdHZpc2libGUgPSBjb25maWcudmlzaWJsZTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dGl0bGUsXG5cdFx0XHRmcmFnbWVudCxcblx0XHRcdHR5cGUsXG5cdFx0XHRjdXN0b21UYWJJZCxcblx0XHRcdHZpc2libGVcblx0XHR9O1xuXHR9XG59O1xuXG5jb25zdCBnZXRWaWV3cyA9IGZ1bmN0aW9uIChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c2V0dGluZ3NWaWV3czogTXVsdGlwbGVWaWV3c0NvbmZpZ3VyYXRpb24gfCB1bmRlZmluZWRcbik6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdIHtcblx0bGV0IHZpZXdDb252ZXJ0ZXJDb25maWdzOiBWaWV3Q29udmVydGVyU2V0dGluZ3NbXSA9IFtdO1xuXHRpZiAoc2V0dGluZ3NWaWV3cykge1xuXHRcdHNldHRpbmdzVmlld3MucGF0aHMuZm9yRWFjaCgocGF0aDogVmlld1BhdGhDb25maWd1cmF0aW9uIHwgQ3VzdG9tVmlld1RlbXBsYXRlQ29uZmlndXJhdGlvbikgPT4ge1xuXHRcdFx0aWYgKGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyhwYXRoIGFzIFZpZXdQYXRoQ29uZmlndXJhdGlvbikpIHtcblx0XHRcdFx0aWYgKHNldHRpbmdzVmlld3MucGF0aHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFMUCBmbGF2b3IgY2Fubm90IGhhdmUgbXVsdGlwbGUgdmlld3NcIik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cGF0aCA9IHBhdGggYXMgQ29tYmluZWRWaWV3UGF0aENvbmZpZ3VyYXRpb247XG5cdFx0XHRcdFx0dmlld0NvbnZlcnRlckNvbmZpZ3MucHVzaCh7XG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0OiBjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0cHJpbWFyeTogcGF0aC5wcmltYXJ5LFxuXHRcdFx0XHRcdFx0c2Vjb25kYXJ5OiBwYXRoLnNlY29uZGFyeSxcblx0XHRcdFx0XHRcdGRlZmF1bHRQYXRoOiBwYXRoLmRlZmF1bHRQYXRoXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoKHBhdGggYXMgQ3VzdG9tVmlld0NvbmZpZ3VyYXRpb24pLnRlbXBsYXRlKSB7XG5cdFx0XHRcdHBhdGggPSBwYXRoIGFzIEN1c3RvbVZpZXdDb25maWd1cmF0aW9uO1xuXHRcdFx0XHR2aWV3Q29udmVydGVyQ29uZmlncy5wdXNoKHtcblx0XHRcdFx0XHRrZXk6IHBhdGgua2V5LFxuXHRcdFx0XHRcdGxhYmVsOiBwYXRoLmxhYmVsLFxuXHRcdFx0XHRcdHRlbXBsYXRlOiBwYXRoLnRlbXBsYXRlLFxuXHRcdFx0XHRcdHR5cGU6IFwiQ3VzdG9tXCIsXG5cdFx0XHRcdFx0dmlzaWJsZTogcGF0aC52aXNpYmxlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cGF0aCA9IHBhdGggYXMgU2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uO1xuXHRcdFx0XHRjb25zdCB2aWV3Q29udmVydGVyQ29udGV4dCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVyQ29udGV4dEZvcihcblx0XHRcdFx0XHRcdHBhdGguY29udGV4dFBhdGggfHwgKHBhdGguZW50aXR5U2V0ICYmIGAvJHtwYXRoLmVudGl0eVNldH1gKSB8fCBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnRleHRQYXRoKClcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdGVudGl0eVR5cGUgPSB2aWV3Q29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cblx0XHRcdFx0aWYgKGVudGl0eVR5cGUgJiYgdmlld0NvbnZlcnRlckNvbnRleHQpIHtcblx0XHRcdFx0XHRsZXQgYW5ub3RhdGlvbjtcblx0XHRcdFx0XHRjb25zdCByZXNvbHZlZFRhcmdldCA9IHZpZXdDb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKHBhdGguYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0XHRcdGNvbnN0IHRhcmdldEFubm90YXRpb24gPSByZXNvbHZlZFRhcmdldC5hbm5vdGF0aW9uIGFzIERhdGFWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnM7XG5cdFx0XHRcdFx0aWYgKHRhcmdldEFubm90YXRpb24pIHtcblx0XHRcdFx0XHRcdGFubm90YXRpb24gPVxuXHRcdFx0XHRcdFx0XHR0YXJnZXRBbm5vdGF0aW9uLnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblZhcmlhbnRcblx0XHRcdFx0XHRcdFx0XHQ/IGdldENvbXBsaWFudFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uKGVudGl0eVR5cGUsIHZpZXdDb252ZXJ0ZXJDb250ZXh0LCBmYWxzZSlcblx0XHRcdFx0XHRcdFx0XHQ6IHRhcmdldEFubm90YXRpb247XG5cdFx0XHRcdFx0XHR2aWV3Q29udmVydGVyQ29uZmlncy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogdmlld0NvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb24sXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBwYXRoLmFubm90YXRpb25QYXRoLFxuXHRcdFx0XHRcdFx0XHRrZWVwUHJldmlvdXNQZXJzb25hbGl6YXRpb246IHBhdGgua2VlcFByZXZpb3VzUGVyc29uYWxpemF0aW9uLFxuXHRcdFx0XHRcdFx0XHRrZXk6IHBhdGgua2V5LFxuXHRcdFx0XHRcdFx0XHR2aXNpYmxlOiBwYXRoLnZpc2libGVcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBUT0RPIERpYWdub3N0aWNzIG1lc3NhZ2Vcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0XHRpZiAoY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZSkge1xuXHRcdFx0dmlld0NvbnZlcnRlckNvbmZpZ3MgPSBnZXRBbHBWaWV3Q29uZmlnKGNvbnZlcnRlckNvbnRleHQsIHZpZXdDb252ZXJ0ZXJDb25maWdzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmlld0NvbnZlcnRlckNvbmZpZ3MucHVzaCh7XG5cdFx0XHRcdGFubm90YXRpb246IGdldENvbXBsaWFudFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQsIGZhbHNlKSxcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogY29udmVydGVyQ29udGV4dFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB2aWV3Q29udmVydGVyQ29uZmlncy5tYXAoKHZpZXdDb252ZXJ0ZXJDb25maWcpID0+IHtcblx0XHRyZXR1cm4gZ2V0Vmlldyh2aWV3Q29udmVydGVyQ29uZmlnKTtcblx0fSk7XG59O1xuXG5jb25zdCBnZXRNdWx0aVZpZXdzQ29udHJvbCA9IGZ1bmN0aW9uIChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0dmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdXG4pOiBNdWx0aVZpZXdzQ29udHJvbENvbmZpZ3VyYXRpb24gfCB1bmRlZmluZWQge1xuXHRjb25zdCBtYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCB2aWV3c0RlZmluaXRpb246IE11bHRpcGxlVmlld3NDb25maWd1cmF0aW9uIHwgdW5kZWZpbmVkID0gbWFuaWZlc3RXcmFwcGVyLmdldFZpZXdDb25maWd1cmF0aW9uKCk7XG5cdGlmICh2aWV3cy5sZW5ndGggPiAxICYmICFoYXNNdWx0aVZpc3VhbGl6YXRpb25zKGNvbnZlcnRlckNvbnRleHQpKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNob3dUYWJDb3VudHM6IHZpZXdzRGVmaW5pdGlvbiA/IHZpZXdzRGVmaW5pdGlvbj8uc2hvd0NvdW50cyB8fCBtYW5pZmVzdFdyYXBwZXIuaGFzTXVsdGlwbGVFbnRpdHlTZXRzKCkgOiB1bmRlZmluZWQsIC8vIHdpdGggbXVsdGkgRW50aXR5U2V0cywgdGFiIGNvdW50cyBhcmUgZGlzcGxheWVkIGJ5IGRlZmF1bHRcblx0XHRcdGlkOiBnZXRJY29uVGFiQmFySUQoKVxuXHRcdH07XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbmZ1bmN0aW9uIGdldEFscFZpZXdDb25maWcoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCwgdmlld0NvbmZpZ3M6IFZpZXdDb252ZXJ0ZXJTZXR0aW5nc1tdKTogVmlld0NvbnZlcnRlclNldHRpbmdzW10ge1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGNvbnN0IGFubm90YXRpb24gPSBnZXRDb21wbGlhbnRWaXN1YWxpemF0aW9uQW5ub3RhdGlvbihlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0LCB0cnVlKTtcblx0bGV0IGNoYXJ0LCB0YWJsZTtcblx0aWYgKGFubm90YXRpb24pIHtcblx0XHR2aWV3Q29uZmlncy5wdXNoKHtcblx0XHRcdGFubm90YXRpb246IGFubm90YXRpb24sXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0Y2hhcnQgPSBnZXREZWZhdWx0Q2hhcnQoZW50aXR5VHlwZSk7XG5cdFx0dGFibGUgPSBnZXREZWZhdWx0TGluZUl0ZW0oZW50aXR5VHlwZSk7XG5cdFx0aWYgKGNoYXJ0ICYmIHRhYmxlKSB7XG5cdFx0XHRjb25zdCBwcmltYXJ5OiBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb25bXSA9IFt7IGFubm90YXRpb25QYXRoOiBcIkBcIiArIGNoYXJ0LnRlcm0gfV07XG5cdFx0XHRjb25zdCBzZWNvbmRhcnk6IFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbltdID0gW3sgYW5ub3RhdGlvblBhdGg6IFwiQFwiICsgdGFibGUudGVybSB9XTtcblx0XHRcdHZpZXdDb25maWdzLnB1c2goe1xuXHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0OiBjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRwcmltYXJ5OiBwcmltYXJ5LFxuXHRcdFx0XHRzZWNvbmRhcnk6IHNlY29uZGFyeSxcblx0XHRcdFx0ZGVmYXVsdFBhdGg6IFwiYm90aFwiXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQUxQIGZsYXZvciBuZWVkcyBib3RoIGNoYXJ0IGFuZCB0YWJsZSB0byBsb2FkIHRoZSBhcHBsaWNhdGlvblwiKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHZpZXdDb25maWdzO1xufVxuXG5mdW5jdGlvbiBoYXNNdWx0aVZpc3VhbGl6YXRpb25zKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBib29sZWFuIHtcblx0cmV0dXJuIChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMoKSB8fFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2Vcblx0KTtcbn1cblxuZXhwb3J0IGNvbnN0IGdldEhlYWRlckFjdGlvbnMgPSBmdW5jdGlvbiAoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IEJhc2VBY3Rpb25bXSB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdHJldHVybiBpbnNlcnRDdXN0b21FbGVtZW50czxCYXNlQWN0aW9uPihbXSwgZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdChtYW5pZmVzdFdyYXBwZXIuZ2V0SGVhZGVyQWN0aW9ucygpLCBjb252ZXJ0ZXJDb250ZXh0KS5hY3Rpb25zKTtcbn07XG5cbmV4cG9ydCBjb25zdCBjaGVja0NoYXJ0RmlsdGVyQmFySWQgPSBmdW5jdGlvbiAodmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdLCBmaWx0ZXJCYXJJZDogc3RyaW5nKSB7XG5cdHZpZXdzLmZvckVhY2goKHZpZXcpID0+IHtcblx0XHRpZiAoISh2aWV3IGFzIEN1c3RvbVZpZXdEZWZpbml0aW9uKS50eXBlKSB7XG5cdFx0XHRjb25zdCBwcmVzZW50YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiA9ICh2aWV3IGFzIFNpbmdsZVZpZXdEZWZpbml0aW9uKS5wcmVzZW50YXRpb247XG5cdFx0XHRwcmVzZW50YXRpb24udmlzdWFsaXphdGlvbnMuZm9yRWFjaCgodmlzdWFsaXphdGlvbkRlZmluaXRpb24pID0+IHtcblx0XHRcdFx0aWYgKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLkNoYXJ0ICYmIHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLmZpbHRlcklkICE9PSBmaWx0ZXJCYXJJZCkge1xuXHRcdFx0XHRcdHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLmZpbHRlcklkID0gZmlsdGVyQmFySWQ7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIExpc3RSZXBvcnREZWZpbml0aW9uIGZvciBtdWx0aXBsZSBlbnRpdHkgc2V0cyAobXVsdGlwbGUgdGFibGUgbW9kZSkuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgbGlzdCByZXBvcnQgZGVmaW5pdGlvbiBiYXNlZCBvbiBhbm5vdGF0aW9uICsgbWFuaWZlc3RcbiAqL1xuZXhwb3J0IGNvbnN0IGNvbnZlcnRQYWdlID0gZnVuY3Rpb24gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBMaXN0UmVwb3J0RGVmaW5pdGlvbiB7XG5cdGNvbnN0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0Y29uc3Qgc0NvbnRleHRQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRDb250ZXh0UGF0aCgpO1xuXG5cdGlmICghc0NvbnRleHRQYXRoKSB7XG5cdFx0Ly8gSWYgd2UgZG9uJ3QgaGF2ZSBhbiBlbnRpdHlTZXQgYXQgdGhpcyBwb2ludCB3ZSBoYXZlIGFuIGlzc3VlIEknZCBzYXlcblx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcIkFuIEVudGl0eVNldCBpcyByZXF1aXJlZCB0byBiZSBhYmxlIHRvIGRpc3BsYXkgYSBMaXN0UmVwb3J0LCBwbGVhc2UgYWRqdXN0IHlvdXIgYGVudGl0eVNldGAgcHJvcGVydHkgdG8gcG9pbnQgdG8gb25lLlwiXG5cdFx0KTtcblx0fVxuXHRjb25zdCBtYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCB2aWV3c0RlZmluaXRpb246IE11bHRpcGxlVmlld3NDb25maWd1cmF0aW9uIHwgdW5kZWZpbmVkID0gbWFuaWZlc3RXcmFwcGVyLmdldFZpZXdDb25maWd1cmF0aW9uKCk7XG5cdGNvbnN0IGhhc011bHRpcGxlRW50aXR5U2V0cyA9IG1hbmlmZXN0V3JhcHBlci5oYXNNdWx0aXBsZUVudGl0eVNldHMoKTtcblx0Y29uc3Qgdmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdID0gZ2V0Vmlld3MoY29udmVydGVyQ29udGV4dCwgdmlld3NEZWZpbml0aW9uKTtcblx0Y29uc3QgbHJUYWJsZVZpc3VhbGl6YXRpb25zID0gZ2V0VGFibGVWaXN1YWxpemF0aW9ucyh2aWV3cyk7XG5cdGNvbnN0IGxyQ2hhcnRWaXN1YWxpemF0aW9ucyA9IGdldENoYXJ0VmlzdWFsaXphdGlvbnModmlld3MpO1xuXHRjb25zdCBzaG93UGlubmFibGVUb2dnbGUgPSBsclRhYmxlVmlzdWFsaXphdGlvbnMuc29tZSgodGFibGUpID0+IHRhYmxlLmNvbnRyb2wudHlwZSA9PT0gXCJSZXNwb25zaXZlVGFibGVcIik7XG5cdGxldCBzaW5nbGVUYWJsZUlkID0gXCJcIjtcblx0bGV0IHNpbmdsZUNoYXJ0SWQgPSBcIlwiO1xuXHRjb25zdCBkeW5hbWljTGlzdFJlcG9ydElkID0gZ2V0RHluYW1pY0xpc3RSZXBvcnRJRCgpO1xuXHRjb25zdCBmaWx0ZXJCYXJJZCA9IGdldEZpbHRlckJhcklEKHNDb250ZXh0UGF0aCk7XG5cdGNvbnN0IGZpbHRlclZhcmlhbnRNYW5hZ2VtZW50SUQgPSBnZXRGaWx0ZXJWYXJpYW50TWFuYWdlbWVudElEKGZpbHRlckJhcklkKTtcblx0Y29uc3QgZmJDb25maWcgPSBtYW5pZmVzdFdyYXBwZXIuZ2V0RmlsdGVyQ29uZmlndXJhdGlvbigpO1xuXHRjb25zdCBmaWx0ZXJJbml0aWFsTGF5b3V0ID0gZmJDb25maWc/LmluaXRpYWxMYXlvdXQgIT09IHVuZGVmaW5lZCA/IGZiQ29uZmlnPy5pbml0aWFsTGF5b3V0LnRvTG93ZXJDYXNlKCkgOiBcImNvbXBhY3RcIjtcblx0Y29uc3QgZmlsdGVyTGF5b3V0ID0gZmJDb25maWc/LmxheW91dCAhPT0gdW5kZWZpbmVkID8gZmJDb25maWc/LmxheW91dC50b0xvd2VyQ2FzZSgpIDogXCJjb21wYWN0XCI7XG5cdGNvbnN0IHVzZVNlbWFudGljRGF0ZVJhbmdlID0gZmJDb25maWcudXNlU2VtYW50aWNEYXRlUmFuZ2UgIT09IHVuZGVmaW5lZCA/IGZiQ29uZmlnLnVzZVNlbWFudGljRGF0ZVJhbmdlIDogdHJ1ZTtcblx0Y29uc3Qgc2hvd0NsZWFyQnV0dG9uID0gZmJDb25maWcuc2hvd0NsZWFyQnV0dG9uICE9PSB1bmRlZmluZWQgPyBmYkNvbmZpZy5zaG93Q2xlYXJCdXR0b24gOiBmYWxzZTtcblxuXHRjb25zdCBvQ29uZmlnID0gZ2V0Q29udGVudEFyZWFJZChjb252ZXJ0ZXJDb250ZXh0LCB2aWV3cyk7XG5cdGlmIChvQ29uZmlnKSB7XG5cdFx0c2luZ2xlQ2hhcnRJZCA9IG9Db25maWcuY2hhcnRJZDtcblx0XHRzaW5nbGVUYWJsZUlkID0gb0NvbmZpZy50YWJsZUlkO1xuXHR9XG5cblx0Y29uc3QgdXNlSGlkZGVuRmlsdGVyQmFyID0gbWFuaWZlc3RXcmFwcGVyLnVzZUhpZGRlbkZpbHRlckJhcigpO1xuXHQvLyBDaGFydCBoYXMgYSBkZXBlbmRlbmN5IHRvIGZpbHRlciBiYXIgKGlzc3VlIHdpdGggbG9hZGluZyBkYXRhKS4gT25jZSByZXNvbHZlZCwgdGhlIGNoZWNrIGZvciBjaGFydCBzaG91bGQgYmUgcmVtb3ZlZCBoZXJlLlxuXHQvLyBVbnRpbCB0aGVuLCBoaWRpbmcgZmlsdGVyIGJhciBpcyBub3cgYWxsb3dlZCBpZiBhIGNoYXJ0IGlzIGJlaW5nIHVzZWQgb24gTFIuXG5cdGNvbnN0IGhpZGVGaWx0ZXJCYXIgPSAobWFuaWZlc3RXcmFwcGVyLmlzRmlsdGVyQmFySGlkZGVuKCkgfHwgdXNlSGlkZGVuRmlsdGVyQmFyKSAmJiBzaW5nbGVDaGFydElkID09PSBcIlwiO1xuXHRjb25zdCBsckZpbHRlclByb3BlcnRpZXMgPSBnZXRTZWxlY3Rpb25GaWVsZHMoY29udmVydGVyQ29udGV4dCwgbHJUYWJsZVZpc3VhbGl6YXRpb25zKTtcblx0Y29uc3Qgc2VsZWN0aW9uRmllbGRzID0gbHJGaWx0ZXJQcm9wZXJ0aWVzLnNlbGVjdGlvbkZpZWxkcztcblx0Y29uc3QgcHJvcGVydHlJbmZvRmllbGRzID0gbHJGaWx0ZXJQcm9wZXJ0aWVzLnNQcm9wZXJ0eUluZm87XG5cdGNvbnN0IGhpZGVCYXNpY1NlYXJjaCA9IGdldEZpbHRlckJhckhpZGVCYXNpY1NlYXJjaChsclRhYmxlVmlzdWFsaXphdGlvbnMsIGxyQ2hhcnRWaXN1YWxpemF0aW9ucywgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IG11bHRpVmlld0NvbnRyb2wgPSBnZXRNdWx0aVZpZXdzQ29udHJvbChjb252ZXJ0ZXJDb250ZXh0LCB2aWV3cyk7XG5cblx0Y29uc3Qgc2VsZWN0aW9uVmFyaWFudCA9IG11bHRpVmlld0NvbnRyb2wgPyB1bmRlZmluZWQgOiBnZXRTZWxlY3Rpb25WYXJpYW50KGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBkZWZhdWx0U2VtYW50aWNEYXRlcyA9IHVzZVNlbWFudGljRGF0ZVJhbmdlID8gZ2V0RGVmYXVsdFNlbWFudGljRGF0ZXMoZ2V0TWFuaWZlc3RGaWx0ZXJGaWVsZHMoZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCkpIDoge307XG5cblx0Ly8gU29ydCBoZWFkZXIgYWN0aW9ucyBhY2NvcmRpbmcgdG8gcG9zaXRpb24gYXR0cmlidXRlcyBpbiBtYW5pZmVzdFxuXHRjb25zdCBoZWFkZXJBY3Rpb25zID0gZ2V0SGVhZGVyQWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0aWYgKGhhc011bHRpcGxlRW50aXR5U2V0cykge1xuXHRcdGNoZWNrQ2hhcnRGaWx0ZXJCYXJJZCh2aWV3cywgZmlsdGVyQmFySWQpO1xuXHR9XG5cblx0Y29uc3QgdmlzdWFsaXphdGlvbklkcyA9IGxyVGFibGVWaXN1YWxpemF0aW9uc1xuXHRcdC5tYXAoKHZpc3VhbGl6YXRpb24pID0+IHtcblx0XHRcdHJldHVybiB2aXN1YWxpemF0aW9uLmFubm90YXRpb24uaWQ7XG5cdFx0fSlcblx0XHQuY29uY2F0KFxuXHRcdFx0bHJDaGFydFZpc3VhbGl6YXRpb25zLm1hcCgodmlzdWFsaXphdGlvbikgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmlzdWFsaXphdGlvbi5pZDtcblx0XHRcdH0pXG5cdFx0KTtcblx0Y29uc3QgdGFyZ2V0Q29udHJvbElkcyA9IFtcblx0XHQuLi4oaGlkZUZpbHRlckJhciAmJiAhdXNlSGlkZGVuRmlsdGVyQmFyID8gW10gOiBbZmlsdGVyQmFySWRdKSxcblx0XHQuLi4obWFuaWZlc3RXcmFwcGVyLmdldFZhcmlhbnRNYW5hZ2VtZW50KCkgIT09IFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5Db250cm9sID8gdmlzdWFsaXphdGlvbklkcyA6IFtdKSxcblx0XHQuLi4obXVsdGlWaWV3Q29udHJvbCA/IFttdWx0aVZpZXdDb250cm9sLmlkXSA6IFtdKVxuXHRdO1xuXG5cdGNvbnN0IHN0aWNreVN1YmhlYWRlclByb3ZpZGVyID1cblx0XHRtdWx0aVZpZXdDb250cm9sICYmIG1hbmlmZXN0V3JhcHBlci5nZXRTdGlja3lNdWx0aVRhYkhlYWRlckNvbmZpZ3VyYXRpb24oKSA/IG11bHRpVmlld0NvbnRyb2wuaWQgOiB1bmRlZmluZWQ7XG5cblx0cmV0dXJuIHtcblx0XHRtYWluRW50aXR5U2V0OiBzQ29udGV4dFBhdGgsXG5cdFx0bWFpbkVudGl0eVR5cGU6IGAke3NDb250ZXh0UGF0aH0vYCxcblx0XHRtdWx0aVZpZXdzQ29udHJvbDogbXVsdGlWaWV3Q29udHJvbCxcblx0XHRzdGlja3lTdWJoZWFkZXJQcm92aWRlcixcblx0XHRzaW5nbGVUYWJsZUlkLFxuXHRcdHNpbmdsZUNoYXJ0SWQsXG5cdFx0ZHluYW1pY0xpc3RSZXBvcnRJZCxcblx0XHRoZWFkZXJBY3Rpb25zLFxuXHRcdHNob3dQaW5uYWJsZVRvZ2dsZTogc2hvd1Bpbm5hYmxlVG9nZ2xlLFxuXHRcdGZpbHRlckJhcjoge1xuXHRcdFx0cHJvcGVydHlJbmZvOiBwcm9wZXJ0eUluZm9GaWVsZHMsXG5cdFx0XHRzZWxlY3Rpb25GaWVsZHMsXG5cdFx0XHRoaWRlQmFzaWNTZWFyY2gsXG5cdFx0XHRzaG93Q2xlYXJCdXR0b25cblx0XHR9LFxuXHRcdHZpZXdzOiB2aWV3cyxcblx0XHRmaWx0ZXJCYXJJZDogaGlkZUZpbHRlckJhciAmJiAhdXNlSGlkZGVuRmlsdGVyQmFyID8gXCJcIiA6IGZpbHRlckJhcklkLFxuXHRcdGZpbHRlckNvbmRpdGlvbnM6IHtcblx0XHRcdHNlbGVjdGlvblZhcmlhbnQ6IHNlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRkZWZhdWx0U2VtYW50aWNEYXRlczogZGVmYXVsdFNlbWFudGljRGF0ZXNcblx0XHR9LFxuXHRcdHZhcmlhbnRNYW5hZ2VtZW50OiB7XG5cdFx0XHRpZDogZmlsdGVyVmFyaWFudE1hbmFnZW1lbnRJRCxcblx0XHRcdHRhcmdldENvbnRyb2xJZHM6IHRhcmdldENvbnRyb2xJZHMuam9pbihcIixcIilcblx0XHR9LFxuXHRcdGhhc011bHRpVmlzdWFsaXphdGlvbnM6IGhhc011bHRpVmlzdWFsaXphdGlvbnMoY29udmVydGVyQ29udGV4dCksXG5cdFx0dGVtcGxhdGVUeXBlOiBtYW5pZmVzdFdyYXBwZXIuZ2V0VGVtcGxhdGVUeXBlKCksXG5cdFx0dXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0ZmlsdGVySW5pdGlhbExheW91dCxcblx0XHRmaWx0ZXJMYXlvdXQsXG5cdFx0a3BpRGVmaW5pdGlvbnM6IGdldEtQSURlZmluaXRpb25zKGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdGhpZGVGaWx0ZXJCYXIsXG5cdFx0dXNlSGlkZGVuRmlsdGVyQmFyXG5cdH07XG59O1xuXG5mdW5jdGlvbiBnZXRDb250ZW50QXJlYUlkKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIHZpZXdzOiBMaXN0UmVwb3J0Vmlld0RlZmluaXRpb25bXSk6IENvbnRlbnRBcmVhSUQgfCB1bmRlZmluZWQge1xuXHRsZXQgc2luZ2xlVGFibGVJZCA9IFwiXCIsXG5cdFx0c2luZ2xlQ2hhcnRJZCA9IFwiXCI7XG5cdGlmIChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMoKSB8fFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2Vcblx0KSB7XG5cdFx0Zm9yIChsZXQgdmlldyBvZiB2aWV3cykge1xuXHRcdFx0dmlldyA9IHZpZXcgYXMgQ29tYmluZWRWaWV3RGVmaW5pdGlvbjtcblx0XHRcdGlmICh2aWV3LmNoYXJ0Q29udHJvbElkICYmIHZpZXcudGFibGVDb250cm9sSWQpIHtcblx0XHRcdFx0c2luZ2xlQ2hhcnRJZCA9IHZpZXcuY2hhcnRDb250cm9sSWQ7XG5cdFx0XHRcdHNpbmdsZVRhYmxlSWQgPSB2aWV3LnRhYmxlQ29udHJvbElkO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Zm9yIChsZXQgdmlldyBvZiB2aWV3cykge1xuXHRcdFx0dmlldyA9IHZpZXcgYXMgU2luZ2xlVmlld0RlZmluaXRpb247XG5cdFx0XHRpZiAoIXNpbmdsZVRhYmxlSWQgJiYgKHZpZXcgYXMgU2luZ2xlVGFibGVWaWV3RGVmaW5pdGlvbikudGFibGVDb250cm9sSWQpIHtcblx0XHRcdFx0c2luZ2xlVGFibGVJZCA9ICh2aWV3IGFzIFNpbmdsZVRhYmxlVmlld0RlZmluaXRpb24pLnRhYmxlQ29udHJvbElkIHx8IFwiXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXNpbmdsZUNoYXJ0SWQgJiYgKHZpZXcgYXMgU2luZ2xlQ2hhcnRWaWV3RGVmaW5pdGlvbikuY2hhcnRDb250cm9sSWQpIHtcblx0XHRcdFx0c2luZ2xlQ2hhcnRJZCA9ICh2aWV3IGFzIFNpbmdsZUNoYXJ0Vmlld0RlZmluaXRpb24pLmNoYXJ0Q29udHJvbElkIHx8IFwiXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAoc2luZ2xlQ2hhcnRJZCAmJiBzaW5nbGVUYWJsZUlkKSB7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRpZiAoc2luZ2xlVGFibGVJZCB8fCBzaW5nbGVDaGFydElkKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGNoYXJ0SWQ6IHNpbmdsZUNoYXJ0SWQsXG5cdFx0XHR0YWJsZUlkOiBzaW5nbGVUYWJsZUlkXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBb0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNBLHNCQUFzQixDQUFDQyxLQUFpQyxFQUF3QjtJQUN4RixNQUFNQyxNQUE0QixHQUFHLEVBQUU7SUFDdkNELEtBQUssQ0FBQ0UsT0FBTyxDQUFDLFVBQVVDLElBQUksRUFBRTtNQUM3QixJQUFJLENBQUVBLElBQUksQ0FBMEJDLElBQUksRUFBRTtRQUN6QyxNQUFNQyxjQUFjLEdBQUlGLElBQUksQ0FBNEJHLHNCQUFzQixHQUMxRUgsSUFBSSxDQUE0Qkcsc0JBQXNCLENBQUNELGNBQWMsR0FDckVGLElBQUksQ0FBMEJJLFlBQVksQ0FBQ0YsY0FBYztRQUU3REEsY0FBYyxDQUFDSCxPQUFPLENBQUMsVUFBVU0sYUFBYSxFQUFFO1VBQy9DLElBQUlBLGFBQWEsQ0FBQ0osSUFBSSxLQUFLSyxpQkFBaUIsQ0FBQ0MsS0FBSyxFQUFFO1lBQ25EVCxNQUFNLENBQUNVLElBQUksQ0FBQ0gsYUFBYSxDQUFDO1VBQzNCO1FBQ0QsQ0FBQyxDQUFDO01BQ0g7SUFDRCxDQUFDLENBQUM7SUFDRixPQUFPUCxNQUFNO0VBQ2Q7RUFFQSxTQUFTVyxzQkFBc0IsQ0FBQ1osS0FBaUMsRUFBd0I7SUFDeEYsTUFBTWEsTUFBNEIsR0FBRyxFQUFFO0lBQ3ZDYixLQUFLLENBQUNFLE9BQU8sQ0FBQyxVQUFVQyxJQUFJLEVBQUU7TUFDN0IsSUFBSSxDQUFFQSxJQUFJLENBQTBCQyxJQUFJLEVBQUU7UUFDekMsTUFBTUMsY0FBYyxHQUFJRixJQUFJLENBQTRCVyxvQkFBb0IsR0FDeEVYLElBQUksQ0FBNEJXLG9CQUFvQixDQUFDVCxjQUFjLEdBQ25FRixJQUFJLENBQTBCSSxZQUFZLENBQUNGLGNBQWM7UUFFN0RBLGNBQWMsQ0FBQ0gsT0FBTyxDQUFDLFVBQVVNLGFBQWEsRUFBRTtVQUMvQyxJQUFJQSxhQUFhLENBQUNKLElBQUksS0FBS0ssaUJBQWlCLENBQUNNLEtBQUssRUFBRTtZQUNuREYsTUFBTSxDQUFDRixJQUFJLENBQUNILGFBQWEsQ0FBQztVQUMzQjtRQUNELENBQUMsQ0FBQztNQUNIO0lBQ0QsQ0FBQyxDQUFDO0lBQ0YsT0FBT0ssTUFBTTtFQUNkO0VBRUEsTUFBTUcsdUJBQXVCLEdBQUcsVUFBVUMsWUFBc0QsRUFBdUM7SUFDdEksTUFBTUMsb0JBQXlCLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLEtBQUssTUFBTUMsV0FBVyxJQUFJRixZQUFZLEVBQUU7TUFBQTtNQUN2Qyw2QkFBSUEsWUFBWSxDQUFDRSxXQUFXLENBQUMsNEVBQXpCLHNCQUEyQkMsUUFBUSw2RUFBbkMsdUJBQXFDQyxhQUFhLG1EQUFsRCx1QkFBb0RDLE1BQU0sRUFBRTtRQUFBO1FBQy9ESixvQkFBb0IsQ0FBQ0MsV0FBVyxDQUFDLDZCQUFHRixZQUFZLENBQUNFLFdBQVcsQ0FBQyxxRkFBekIsdUJBQTJCQyxRQUFRLDJEQUFuQyx1QkFBcUNDLGFBQWE7TUFDdkY7SUFDRDtJQUNBLE9BQU9ILG9CQUFvQjtFQUM1QixDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTSyxtQ0FBbUMsQ0FDM0NDLFVBQXNCLEVBQ3RCQyxnQkFBa0MsRUFDbENDLEtBQWMsRUFDOEQ7SUFDNUUsTUFBTUMsY0FBYyxHQUFHRixnQkFBZ0IsQ0FBQ0csa0JBQWtCLEVBQUUsQ0FBQ0MsZ0NBQWdDLEVBQUU7SUFDL0YsTUFBTUMsNEJBQTRCLEdBQUdDLCtCQUErQixDQUFDUCxVQUFVLEVBQUVHLGNBQWMsRUFBRUYsZ0JBQWdCLENBQUM7SUFDbEgsTUFBTU8sa0JBQWtCLEdBQUcsK0RBQStEO0lBRTFGLElBQUlGLDRCQUE0QixFQUFFO01BQ2pDLElBQUlILGNBQWMsRUFBRTtRQUNuQixNQUFNTSxtQkFBbUIsR0FBR0gsNEJBQTRCLENBQUNJLG1CQUFtQjtRQUM1RSxJQUFJLENBQUNELG1CQUFtQixFQUFFO1VBQ3pCLE1BQU0sSUFBSUUsS0FBSyxDQUFDLDZFQUE2RSxDQUFDO1FBQy9GO1FBQ0EsSUFBSSxDQUFDQyx1QkFBdUIsQ0FBQ0gsbUJBQW1CLEVBQUVQLEtBQUssQ0FBQyxFQUFFO1VBQ3pELElBQUlBLEtBQUssRUFBRTtZQUNWLE1BQU0sSUFBSVMsS0FBSyxDQUFDSCxrQkFBa0IsQ0FBQztVQUNwQztVQUNBLE9BQU9LLFNBQVM7UUFDakI7TUFDRDtNQUNBLElBQUlDLGdDQUFnQyxDQUFDUiw0QkFBNEIsRUFBRUosS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ25GLE9BQU9JLDRCQUE0QjtNQUNwQyxDQUFDLE1BQU0sSUFBSUosS0FBSyxFQUFFO1FBQ2pCLE1BQU0sSUFBSVMsS0FBSyxDQUFDSCxrQkFBa0IsQ0FBQztNQUNwQztJQUNEO0lBRUEsTUFBTUMsbUJBQW1CLEdBQUdNLDZCQUE2QixDQUFDZixVQUFVLENBQUM7SUFDckUsSUFBSVMsbUJBQW1CLEVBQUU7TUFDeEIsSUFBSUcsdUJBQXVCLENBQUNILG1CQUFtQixFQUFFUCxLQUFLLENBQUMsRUFBRTtRQUN4RCxPQUFPTyxtQkFBbUI7TUFDM0IsQ0FBQyxNQUFNLElBQUlQLEtBQUssRUFBRTtRQUNqQixNQUFNLElBQUlTLEtBQUssQ0FBQ0gsa0JBQWtCLENBQUM7TUFDcEM7SUFDRDtJQUVBLElBQUksQ0FBQ04sS0FBSyxFQUFFO01BQ1gsT0FBT2Msa0JBQWtCLENBQUNoQixVQUFVLENBQUM7SUFDdEM7SUFDQSxPQUFPYSxTQUFTO0VBQ2pCO0VBRUEsTUFBTUksT0FBTyxHQUFHLFVBQVVDLDBCQUFpRCxFQUE0QjtJQUN0RyxJQUFJQyxNQUFNLEdBQUdELDBCQUEwQjtJQUN2QyxJQUFJQyxNQUFNLENBQUNsQixnQkFBZ0IsRUFBRTtNQUFBO01BQzVCLElBQUlBLGdCQUFnQixHQUFHa0IsTUFBTSxDQUFDbEIsZ0JBQWdCO01BQzlDa0IsTUFBTSxHQUFHQSxNQUFxQztNQUM5QyxNQUFNQywyQkFBMkIsR0FBRyxVQUFVQyxhQUFnQyxFQUE4QztRQUMzSCxPQUFRQSxhQUFhLENBQStCQyxHQUFHLEtBQUtULFNBQVM7TUFDdEUsQ0FBQztNQUNELElBQUk5QixZQUF5QyxHQUFHd0MsaUNBQWlDLENBQ2hGSixNQUFNLENBQUNLLFVBQVUsR0FDZHZCLGdCQUFnQixDQUFDd0IseUJBQXlCLENBQUNOLE1BQU0sQ0FBQ0ssVUFBVSxDQUFDRSxrQkFBa0IsRUFBRXpCLGdCQUFnQixDQUFDMEIsYUFBYSxFQUFFLENBQUMsR0FDbEgsRUFBRSxFQUNMLElBQUksRUFDSjFCLGdCQUFnQixFQUNoQmtCLE1BQU0sRUFDTk4sU0FBUyxFQUNUQSxTQUFTLEVBQ1RPLDJCQUEyQixDQUFDRCxNQUFNLENBQUMsQ0FDbkM7TUFDRCxJQUFJUyxjQUFjLEdBQUcsRUFBRTtNQUN2QixJQUFJQyxjQUFjLEdBQUcsRUFBRTtNQUN2QixJQUFJQyxLQUF5QixHQUFHLEVBQUU7TUFDbEMsSUFBSUMsb0JBQW9CLEdBQUcsRUFBRTtNQUM3QixNQUFNQyxtQkFBbUIsR0FBRyxVQUFVQyxtQkFBZ0QsRUFBRUMsU0FBbUIsRUFBRTtRQUM1RyxJQUFJQyxvQkFBb0I7UUFDeEIsS0FBSyxNQUFNbkQsYUFBYSxJQUFJaUQsbUJBQW1CLENBQUNwRCxjQUFjLEVBQUU7VUFDL0QsSUFBSXFELFNBQVMsSUFBSWxELGFBQWEsQ0FBQ0osSUFBSSxLQUFLSyxpQkFBaUIsQ0FBQ00sS0FBSyxFQUFFO1lBQ2hFNEMsb0JBQW9CLEdBQUduRCxhQUFhO1lBQ3BDO1VBQ0Q7VUFDQSxJQUFJLENBQUNrRCxTQUFTLElBQUlsRCxhQUFhLENBQUNKLElBQUksS0FBS0ssaUJBQWlCLENBQUNDLEtBQUssRUFBRTtZQUNqRWlELG9CQUFvQixHQUFHbkQsYUFBYTtZQUNwQztVQUNEO1FBQ0Q7UUFDQSxNQUFNb0QsbUJBQW1CLEdBQUdDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFTCxtQkFBbUIsQ0FBQztRQUNsRSxJQUFJRSxvQkFBb0IsRUFBRTtVQUN6QkMsbUJBQW1CLENBQUN2RCxjQUFjLEdBQUcsQ0FBQ3NELG9CQUFvQixDQUFDO1FBQzVELENBQUMsTUFBTTtVQUNOLE1BQU0sSUFBSXhCLEtBQUssQ0FBQyxDQUFDdUIsU0FBUyxHQUFHLFNBQVMsR0FBRyxXQUFXLElBQUksNkJBQTZCLElBQUlBLFNBQVMsR0FBRyxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFDekg7UUFDQSxPQUFPRSxtQkFBbUI7TUFDM0IsQ0FBQztNQUNELE1BQU1HLGVBQWUsR0FBRyxVQUFVQyxJQUFpQyxFQUFFTixTQUFrQixFQUFFO1FBQ3hGLE1BQU1PLGNBQWMsR0FBR3hDLGdCQUFnQixDQUFDeUMsdUJBQXVCLENBQUNGLElBQUksQ0FBQ3JDLGNBQWMsQ0FBQztRQUNwRixNQUFNd0MsZ0JBQWdCLEdBQUdGLGNBQWMsQ0FBQ2pCLFVBQTBDO1FBQ2xGdkIsZ0JBQWdCLEdBQUd3QyxjQUFjLENBQUN4QyxnQkFBZ0I7UUFDbEQsTUFBTXVCLFVBQVUsR0FBR21CLGdCQUFnQjtRQUNuQyxJQUFJbkIsVUFBVSxJQUFJdkIsZ0JBQWdCLENBQUMyQyxlQUFlLEVBQUUsS0FBS0MsWUFBWSxDQUFDQyxrQkFBa0IsRUFBRTtVQUN6Ri9ELFlBQVksR0FBR3dDLGlDQUFpQyxDQUMvQ0MsVUFBVSxHQUNQdkIsZ0JBQWdCLENBQUN3Qix5QkFBeUIsQ0FBQ0QsVUFBVSxDQUFDRSxrQkFBa0IsRUFBRXpCLGdCQUFnQixDQUFDMEIsYUFBYSxFQUFFLENBQUMsR0FDM0csRUFBRSxFQUNMLElBQUksRUFDSjFCLGdCQUFnQixFQUNoQmtCLE1BQU0sQ0FDTjtVQUNELE9BQU9wQyxZQUFZO1FBQ3BCLENBQUMsTUFBTTtVQUNOLE1BQU1nRSxNQUFNLEdBQ1gsMEJBQTBCLElBQ3pCYixTQUFTLEdBQUcsU0FBUyxHQUFHLFdBQVcsQ0FBQyxHQUNyQyx1REFBdUQ7VUFDeEQsTUFBTSxJQUFJdkIsS0FBSyxDQUFDb0MsTUFBTSxDQUFDO1FBQ3hCO01BQ0QsQ0FBQztNQUNELE1BQU1DLGFBQWEsR0FBRyxVQUNyQkMsYUFBNEMsRUFDNUNDLFdBQXlELEVBQ3hEO1FBQUE7UUFDRCxNQUFNNUQsb0JBQTZELEdBQUcwQyxtQkFBbUIsQ0FBQ2lCLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7UUFDakhwQixjQUFjLEdBQUl2QyxvQkFBb0IsYUFBcEJBLG9CQUFvQixnREFBcEJBLG9CQUFvQixDQUFFVCxjQUFjLENBQUMsQ0FBQyxDQUFDLDBEQUF4QyxzQkFBaUVzRSxFQUFFO1FBQ3BGLE1BQU1yRSxzQkFBK0QsR0FBR2tELG1CQUFtQixDQUMxRmlCLGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBR0EsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHQSxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQ3RELEtBQUssQ0FDTDtRQUNEckIsY0FBYyxHQUFJOUMsc0JBQXNCLGFBQXRCQSxzQkFBc0IsZ0RBQXRCQSxzQkFBc0IsQ0FBRUQsY0FBYyxDQUFDLENBQUMsQ0FBQyxvRkFBMUMsc0JBQW1FMkMsVUFBVSwyREFBN0UsdUJBQStFMkIsRUFBRTtRQUNsRyxJQUFJN0Qsb0JBQW9CLElBQUlSLHNCQUFzQixFQUFFO1VBQ25EcUMsTUFBTSxHQUFHQSxNQUErQjtVQUN4QyxNQUFNaUMsT0FBTyxHQUFHakMsTUFBTSxDQUFDaUMsT0FBTztVQUM5QixNQUFNekUsSUFBNEIsR0FBRztZQUNwQ1csb0JBQW9CO1lBQ3BCUixzQkFBc0I7WUFDdEI4QyxjQUFjO1lBQ2RDLGNBQWM7WUFDZHFCLFdBQVc7WUFDWEU7VUFDRCxDQUFDO1VBQ0QsT0FBT3pFLElBQUk7UUFDWjtNQUNELENBQUM7TUFDRCxJQUNDLENBQUNzQixnQkFBZ0IsQ0FBQ0csa0JBQWtCLEVBQUUsQ0FBQ2lELHlCQUF5QixDQUFDbEMsTUFBTSxDQUEwQixJQUNqRyxrQkFBQXBDLFlBQVksMkVBQVosY0FBY0YsY0FBYywwREFBNUIsc0JBQThCaUIsTUFBTSxNQUFLLENBQUMsSUFDMUNHLGdCQUFnQixDQUFDMkMsZUFBZSxFQUFFLEtBQUtDLFlBQVksQ0FBQ0Msa0JBQWtCLEVBQ3JFO1FBQ0QsTUFBTW5FLElBQXdDLEdBQUdxRSxhQUFhLENBQUMsQ0FBQ2pFLFlBQVksQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUN0RixJQUFJSixJQUFJLEVBQUU7VUFDVCxPQUFPQSxJQUFJO1FBQ1o7TUFDRCxDQUFDLE1BQU0sSUFDTnNCLGdCQUFnQixDQUFDRyxrQkFBa0IsRUFBRSxDQUFDaUQseUJBQXlCLENBQUNsQyxNQUFNLENBQTBCLElBQ2hHbEIsZ0JBQWdCLENBQUMyQyxlQUFlLEVBQUUsS0FBS0MsWUFBWSxDQUFDQyxrQkFBa0IsRUFDckU7UUFDRCxNQUFNO1VBQUVRLE9BQU87VUFBRUM7UUFBVSxDQUFDLEdBQUdwQyxNQUF1QztRQUN0RSxJQUFJbUMsT0FBTyxJQUFJQSxPQUFPLENBQUN4RCxNQUFNLElBQUl5RCxTQUFTLElBQUlBLFNBQVMsQ0FBQ3pELE1BQU0sRUFBRTtVQUMvRCxNQUFNbkIsSUFBd0MsR0FBR3FFLGFBQWEsQ0FDN0QsQ0FBQ1QsZUFBZSxDQUFDZSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUVmLGVBQWUsQ0FBQ2dCLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUN4RXBDLE1BQU0sQ0FBbUMrQixXQUFXLENBQ3JEO1VBQ0QsSUFBSXZFLElBQUksRUFBRTtZQUNULE9BQU9BLElBQUk7VUFDWjtRQUNELENBQUMsTUFBTTtVQUNOLE1BQU0sSUFBSWdDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQztRQUM5RDtNQUNELENBQUMsTUFBTSxJQUFJUywyQkFBMkIsQ0FBQ0QsTUFBTSxDQUFDLEVBQUU7UUFDL0M7UUFDQSxNQUFNc0IsY0FBYyxHQUFHeEMsZ0JBQWdCLENBQUN5Qyx1QkFBdUIsQ0FBRXZCLE1BQU0sQ0FBaUNoQixjQUFjLENBQUM7UUFDdkgsTUFBTXFELGNBQStCLEdBQUdmLGNBQWMsQ0FBQ2pCLFVBQVU7UUFDakV2QixnQkFBZ0IsR0FBR3dDLGNBQWMsQ0FBQ3hDLGdCQUFnQjtRQUNsRDZCLEtBQUssR0FBRzJCLGlCQUFpQixDQUFDQywyQkFBMkIsQ0FBQ0YsY0FBYyxDQUFDRyxJQUFJLENBQUMsQ0FBQztRQUMzRTtRQUNBNUUsWUFBWSxDQUFDRixjQUFjLENBQUNILE9BQU8sQ0FBQyxDQUFDa0YsdUJBQXVCLEVBQUVDLEtBQUssS0FBSztVQUFBO1VBQ3ZFLFFBQVFELHVCQUF1QixDQUFDaEYsSUFBSTtZQUNuQyxLQUFLSyxpQkFBaUIsQ0FBQ0MsS0FBSztjQUMzQixNQUFNNEUsa0JBQWtCLEdBQUcvRSxZQUFZLENBQUNGLGNBQWMsQ0FBQ2dGLEtBQUssQ0FBdUI7Y0FDbkYsTUFBTUUsT0FBTyxHQUFHRCxrQkFBa0IsQ0FBQ0UsT0FBTyxDQUFDRCxPQUFPLElBQUksQ0FBQyxDQUFDO2NBQ3hEQSxPQUFPLENBQUNFLGFBQWEsR0FBR0YsT0FBTyxDQUFDRSxhQUFhLElBQUk7Z0JBQUVDLEtBQUssRUFBRTtjQUFHLENBQUM7Y0FDOUQsSUFBSSxDQUFFL0MsTUFBTSxDQUFpQ2dELDJCQUEyQixFQUFFO2dCQUN6RTtnQkFDQUwsa0JBQWtCLENBQUN0QyxVQUFVLENBQUMyQixFQUFFLEdBQUdpQixVQUFVLENBQUVqRCxNQUFNLENBQWlDRyxHQUFHLElBQUksRUFBRSxFQUFFLFVBQVUsQ0FBQztjQUM3RztjQUNBSCxNQUFNLEdBQUdBLE1BQXFDO2NBQzlDLElBQUksdUJBQUFBLE1BQU0sQ0FBQ0ssVUFBVSx1REFBakIsbUJBQW1CNkMsSUFBSSwrREFBbUQsRUFBRTtnQkFBQTtnQkFDL0UsSUFBSSxDQUFDbEQsTUFBTSxDQUFDSyxVQUFVLENBQUM4QyxnQkFBZ0IsRUFBRTtrQkFDeEMsTUFBTSxJQUFJM0QsS0FBSyxDQUNiLDJFQUEwRVEsTUFBTSxDQUFDSyxVQUFVLENBQUNFLGtCQUFtQixFQUFDLENBQ2pIO2dCQUNGO2dCQUNBSyxvQkFBb0IsR0FBSSxJQUFDLHlCQUFFWixNQUFNLENBQUNLLFVBQVUsQ0FBQzhDLGdCQUFnQiwwREFBbEMsc0JBQW9DNUMsa0JBQWtCLENBQUM2QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFLEVBQUM7Y0FDbEcsQ0FBQyxNQUFNO2dCQUNOeEMsb0JBQW9CLEdBQUlaLE1BQU0sQ0FBaUNoQixjQUFjO2NBQzlFO2NBQ0E7Y0FDQTtjQUNBO2NBQ0E7Y0FDQTtjQUNBNEQsT0FBTyxDQUFDRSxhQUFhLENBQUNDLEtBQUssQ0FBQy9FLElBQUksQ0FBQztnQkFBRWdCLGNBQWMsRUFBRTRCO2NBQXFCLENBQUMsQ0FBQztjQUMxRStCLGtCQUFrQixDQUFDRSxPQUFPLENBQUNELE9BQU8sR0FBR0EsT0FBTztjQUM1QztZQUNELEtBQUs5RSxpQkFBaUIsQ0FBQ00sS0FBSztjQUMzQixNQUFNaUYsa0JBQWtCLEdBQUd6RixZQUFZLENBQUNGLGNBQWMsQ0FBQ2dGLEtBQUssQ0FBdUI7Y0FDbkZXLGtCQUFrQixDQUFDckIsRUFBRSxHQUFHc0IsVUFBVSxDQUFFdEQsTUFBTSxDQUFpQ0csR0FBRyxJQUFJLEVBQUUsRUFBRSxPQUFPLENBQUM7Y0FDOUZrRCxrQkFBa0IsQ0FBQ0UsVUFBVSxHQUFHLElBQUk7Y0FDcEM7WUFDRDtjQUNDO1VBQU07UUFFVCxDQUFDLENBQUM7TUFDSDtNQUNBM0YsWUFBWSxDQUFDRixjQUFjLENBQUNILE9BQU8sQ0FBRWtGLHVCQUF1QixJQUFLO1FBQ2hFLElBQUlBLHVCQUF1QixDQUFDaEYsSUFBSSxLQUFLSyxpQkFBaUIsQ0FBQ0MsS0FBSyxFQUFFO1VBQzdEMEMsY0FBYyxHQUFHZ0MsdUJBQXVCLENBQUNwQyxVQUFVLENBQUMyQixFQUFFO1FBQ3ZELENBQUMsTUFBTSxJQUFJUyx1QkFBdUIsQ0FBQ2hGLElBQUksS0FBS0ssaUJBQWlCLENBQUNNLEtBQUssRUFBRTtVQUNwRXNDLGNBQWMsR0FBRytCLHVCQUF1QixDQUFDVCxFQUFFO1FBQzVDO01BQ0QsQ0FBQyxDQUFDO01BQ0ZoQyxNQUFNLEdBQUdBLE1BQStCO01BQ3hDLE1BQU1pQyxPQUFPLEdBQUdqQyxNQUFNLENBQUNpQyxPQUFPO01BQzlCLE9BQU87UUFDTnJFLFlBQVk7UUFDWjZDLGNBQWM7UUFDZEMsY0FBYztRQUNkQyxLQUFLO1FBQ0xDLG9CQUFvQjtRQUNwQnFCO01BQ0QsQ0FBQztJQUNGLENBQUMsTUFBTTtNQUNOakMsTUFBTSxHQUFHQSxNQUFpQztNQUMxQyxNQUFNVyxLQUFLLEdBQUdYLE1BQU0sQ0FBQ3dELEtBQUs7UUFDekJDLFFBQVEsR0FBR3pELE1BQU0sQ0FBQzBELFFBQVE7UUFDMUJqRyxJQUFJLEdBQUd1QyxNQUFNLENBQUN2QyxJQUFJO1FBQ2xCa0csV0FBVyxHQUFHQyxjQUFjLENBQUM1RCxNQUFNLENBQUNHLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDOUM4QixPQUFPLEdBQUdqQyxNQUFNLENBQUNpQyxPQUFPO01BQ3pCLE9BQU87UUFDTnRCLEtBQUs7UUFDTDhDLFFBQVE7UUFDUmhHLElBQUk7UUFDSmtHLFdBQVc7UUFDWDFCO01BQ0QsQ0FBQztJQUNGO0VBQ0QsQ0FBQztFQUVELE1BQU00QixRQUFRLEdBQUcsVUFDaEIvRSxnQkFBa0MsRUFDbENnRixhQUFxRCxFQUN4QjtJQUM3QixJQUFJQyxvQkFBNkMsR0FBRyxFQUFFO0lBQ3RELElBQUlELGFBQWEsRUFBRTtNQUNsQkEsYUFBYSxDQUFDZixLQUFLLENBQUN4RixPQUFPLENBQUV5RyxJQUE2RCxJQUFLO1FBQzlGLElBQUlsRixnQkFBZ0IsQ0FBQ0csa0JBQWtCLEVBQUUsQ0FBQ2lELHlCQUF5QixDQUFDOEIsSUFBSSxDQUEwQixFQUFFO1VBQ25HLElBQUlGLGFBQWEsQ0FBQ2YsS0FBSyxDQUFDcEUsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuQyxNQUFNLElBQUlhLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQztVQUN6RCxDQUFDLE1BQU07WUFDTndFLElBQUksR0FBR0EsSUFBcUM7WUFDNUNELG9CQUFvQixDQUFDL0YsSUFBSSxDQUFDO2NBQ3pCYyxnQkFBZ0IsRUFBRUEsZ0JBQWdCO2NBQ2xDcUQsT0FBTyxFQUFFNkIsSUFBSSxDQUFDN0IsT0FBTztjQUNyQkMsU0FBUyxFQUFFNEIsSUFBSSxDQUFDNUIsU0FBUztjQUN6QkwsV0FBVyxFQUFFaUMsSUFBSSxDQUFDakM7WUFDbkIsQ0FBQyxDQUFDO1VBQ0g7UUFDRCxDQUFDLE1BQU0sSUFBS2lDLElBQUksQ0FBNkJOLFFBQVEsRUFBRTtVQUN0RE0sSUFBSSxHQUFHQSxJQUErQjtVQUN0Q0Qsb0JBQW9CLENBQUMvRixJQUFJLENBQUM7WUFDekJtQyxHQUFHLEVBQUU2RCxJQUFJLENBQUM3RCxHQUFHO1lBQ2JxRCxLQUFLLEVBQUVRLElBQUksQ0FBQ1IsS0FBSztZQUNqQkUsUUFBUSxFQUFFTSxJQUFJLENBQUNOLFFBQVE7WUFDdkJqRyxJQUFJLEVBQUUsUUFBUTtZQUNkd0UsT0FBTyxFQUFFK0IsSUFBSSxDQUFDL0I7VUFDZixDQUFDLENBQUM7UUFDSCxDQUFDLE1BQU07VUFDTitCLElBQUksR0FBR0EsSUFBbUM7VUFDMUMsTUFBTUMsb0JBQW9CLEdBQUduRixnQkFBZ0IsQ0FBQ29GLHNCQUFzQixDQUNsRUYsSUFBSSxDQUFDRyxXQUFXLElBQUtILElBQUksQ0FBQ0ksU0FBUyxJQUFLLElBQUdKLElBQUksQ0FBQ0ksU0FBVSxFQUFFLElBQUl0RixnQkFBZ0IsQ0FBQ3VGLGNBQWMsRUFBRSxDQUNqRztZQUNEeEYsVUFBVSxHQUFHb0Ysb0JBQW9CLENBQUN6RCxhQUFhLEVBQUU7VUFFbEQsSUFBSTNCLFVBQVUsSUFBSW9GLG9CQUFvQixFQUFFO1lBQ3ZDLElBQUk1RCxVQUFVO1lBQ2QsTUFBTWlCLGNBQWMsR0FBRzJDLG9CQUFvQixDQUFDMUMsdUJBQXVCLENBQUN5QyxJQUFJLENBQUNoRixjQUFjLENBQUM7WUFDeEYsTUFBTXdDLGdCQUFnQixHQUFHRixjQUFjLENBQUNqQixVQUEwQztZQUNsRixJQUFJbUIsZ0JBQWdCLEVBQUU7Y0FDckJuQixVQUFVLEdBQ1RtQixnQkFBZ0IsQ0FBQzBCLElBQUksa0RBQXVDLEdBQ3pEdEUsbUNBQW1DLENBQUNDLFVBQVUsRUFBRW9GLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxHQUM1RXpDLGdCQUFnQjtjQUNwQnVDLG9CQUFvQixDQUFDL0YsSUFBSSxDQUFDO2dCQUN6QmMsZ0JBQWdCLEVBQUVtRixvQkFBb0I7Z0JBQ3RDNUQsVUFBVTtnQkFDVnJCLGNBQWMsRUFBRWdGLElBQUksQ0FBQ2hGLGNBQWM7Z0JBQ25DZ0UsMkJBQTJCLEVBQUVnQixJQUFJLENBQUNoQiwyQkFBMkI7Z0JBQzdEN0MsR0FBRyxFQUFFNkQsSUFBSSxDQUFDN0QsR0FBRztnQkFDYjhCLE9BQU8sRUFBRStCLElBQUksQ0FBQy9CO2NBQ2YsQ0FBQyxDQUFDO1lBQ0g7VUFDRCxDQUFDLE1BQU07WUFDTjtVQUFBO1FBRUY7TUFDRCxDQUFDLENBQUM7SUFDSCxDQUFDLE1BQU07TUFDTixNQUFNcEQsVUFBVSxHQUFHQyxnQkFBZ0IsQ0FBQzBCLGFBQWEsRUFBRTtNQUNuRCxJQUFJMUIsZ0JBQWdCLENBQUMyQyxlQUFlLEVBQUUsS0FBS0MsWUFBWSxDQUFDQyxrQkFBa0IsRUFBRTtRQUMzRW9DLG9CQUFvQixHQUFHTyxnQkFBZ0IsQ0FBQ3hGLGdCQUFnQixFQUFFaUYsb0JBQW9CLENBQUM7TUFDaEYsQ0FBQyxNQUFNO1FBQ05BLG9CQUFvQixDQUFDL0YsSUFBSSxDQUFDO1VBQ3pCcUMsVUFBVSxFQUFFekIsbUNBQW1DLENBQUNDLFVBQVUsRUFBRUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDO1VBQ3BGQSxnQkFBZ0IsRUFBRUE7UUFDbkIsQ0FBQyxDQUFDO01BQ0g7SUFDRDtJQUNBLE9BQU9pRixvQkFBb0IsQ0FBQ1EsR0FBRyxDQUFFQyxtQkFBbUIsSUFBSztNQUN4RCxPQUFPMUUsT0FBTyxDQUFDMEUsbUJBQW1CLENBQUM7SUFDcEMsQ0FBQyxDQUFDO0VBQ0gsQ0FBQztFQUVELE1BQU1DLG9CQUFvQixHQUFHLFVBQzVCM0YsZ0JBQWtDLEVBQ2xDekIsS0FBaUMsRUFDWTtJQUM3QyxNQUFNcUgsZUFBZSxHQUFHNUYsZ0JBQWdCLENBQUNHLGtCQUFrQixFQUFFO0lBQzdELE1BQU0wRixlQUF1RCxHQUFHRCxlQUFlLENBQUNFLG9CQUFvQixFQUFFO0lBQ3RHLElBQUl2SCxLQUFLLENBQUNzQixNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUNrRyxzQkFBc0IsQ0FBQy9GLGdCQUFnQixDQUFDLEVBQUU7TUFDbEUsT0FBTztRQUNOZ0csYUFBYSxFQUFFSCxlQUFlLEdBQUcsQ0FBQUEsZUFBZSxhQUFmQSxlQUFlLHVCQUFmQSxlQUFlLENBQUVJLFVBQVUsS0FBSUwsZUFBZSxDQUFDTSxxQkFBcUIsRUFBRSxHQUFHdEYsU0FBUztRQUFFO1FBQ3JIc0MsRUFBRSxFQUFFaUQsZUFBZTtNQUNwQixDQUFDO0lBQ0Y7SUFDQSxPQUFPdkYsU0FBUztFQUNqQixDQUFDO0VBRUQsU0FBUzRFLGdCQUFnQixDQUFDeEYsZ0JBQWtDLEVBQUVvRyxXQUFvQyxFQUEyQjtJQUM1SCxNQUFNckcsVUFBVSxHQUFHQyxnQkFBZ0IsQ0FBQzBCLGFBQWEsRUFBRTtJQUNuRCxNQUFNSCxVQUFVLEdBQUd6QixtQ0FBbUMsQ0FBQ0MsVUFBVSxFQUFFQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUM7SUFDMUYsSUFBSXFHLEtBQUssRUFBRUMsS0FBSztJQUNoQixJQUFJL0UsVUFBVSxFQUFFO01BQ2Y2RSxXQUFXLENBQUNsSCxJQUFJLENBQUM7UUFDaEJxQyxVQUFVLEVBQUVBLFVBQVU7UUFDdEJ2QjtNQUNELENBQUMsQ0FBQztJQUNILENBQUMsTUFBTTtNQUNOcUcsS0FBSyxHQUFHRSxlQUFlLENBQUN4RyxVQUFVLENBQUM7TUFDbkN1RyxLQUFLLEdBQUd2RixrQkFBa0IsQ0FBQ2hCLFVBQVUsQ0FBQztNQUN0QyxJQUFJc0csS0FBSyxJQUFJQyxLQUFLLEVBQUU7UUFDbkIsTUFBTWpELE9BQXNDLEdBQUcsQ0FBQztVQUFFbkQsY0FBYyxFQUFFLEdBQUcsR0FBR21HLEtBQUssQ0FBQ2pDO1FBQUssQ0FBQyxDQUFDO1FBQ3JGLE1BQU1kLFNBQXdDLEdBQUcsQ0FBQztVQUFFcEQsY0FBYyxFQUFFLEdBQUcsR0FBR29HLEtBQUssQ0FBQ2xDO1FBQUssQ0FBQyxDQUFDO1FBQ3ZGZ0MsV0FBVyxDQUFDbEgsSUFBSSxDQUFDO1VBQ2hCYyxnQkFBZ0IsRUFBRUEsZ0JBQWdCO1VBQ2xDcUQsT0FBTyxFQUFFQSxPQUFPO1VBQ2hCQyxTQUFTLEVBQUVBLFNBQVM7VUFDcEJMLFdBQVcsRUFBRTtRQUNkLENBQUMsQ0FBQztNQUNILENBQUMsTUFBTTtRQUNOLE1BQU0sSUFBSXZDLEtBQUssQ0FBQywrREFBK0QsQ0FBQztNQUNqRjtJQUNEO0lBQ0EsT0FBTzBGLFdBQVc7RUFDbkI7RUFFQSxTQUFTTCxzQkFBc0IsQ0FBQy9GLGdCQUFrQyxFQUFXO0lBQzVFLE9BQ0NBLGdCQUFnQixDQUFDRyxrQkFBa0IsRUFBRSxDQUFDaUQseUJBQXlCLEVBQUUsSUFDakVwRCxnQkFBZ0IsQ0FBQzJDLGVBQWUsRUFBRSxLQUFLQyxZQUFZLENBQUNDLGtCQUFrQjtFQUV4RTtFQUVPLE1BQU0yRCxnQkFBZ0IsR0FBRyxVQUFVeEcsZ0JBQWtDLEVBQWdCO0lBQzNGLE1BQU00RixlQUFlLEdBQUc1RixnQkFBZ0IsQ0FBQ0csa0JBQWtCLEVBQUU7SUFDN0QsT0FBT3NHLG9CQUFvQixDQUFhLEVBQUUsRUFBRUMsc0JBQXNCLENBQUNkLGVBQWUsQ0FBQ1ksZ0JBQWdCLEVBQUUsRUFBRXhHLGdCQUFnQixDQUFDLENBQUMyRyxPQUFPLENBQUM7RUFDbEksQ0FBQztFQUFDO0VBRUssTUFBTUMscUJBQXFCLEdBQUcsVUFBVXJJLEtBQWlDLEVBQUVzSSxXQUFtQixFQUFFO0lBQ3RHdEksS0FBSyxDQUFDRSxPQUFPLENBQUVDLElBQUksSUFBSztNQUN2QixJQUFJLENBQUVBLElBQUksQ0FBMEJDLElBQUksRUFBRTtRQUN6QyxNQUFNRyxZQUF5QyxHQUFJSixJQUFJLENBQTBCSSxZQUFZO1FBQzdGQSxZQUFZLENBQUNGLGNBQWMsQ0FBQ0gsT0FBTyxDQUFFa0YsdUJBQXVCLElBQUs7VUFDaEUsSUFBSUEsdUJBQXVCLENBQUNoRixJQUFJLEtBQUtLLGlCQUFpQixDQUFDTSxLQUFLLElBQUlxRSx1QkFBdUIsQ0FBQ21ELFFBQVEsS0FBS0QsV0FBVyxFQUFFO1lBQ2pIbEQsdUJBQXVCLENBQUNtRCxRQUFRLEdBQUdELFdBQVc7VUFDL0M7UUFDRCxDQUFDLENBQUM7TUFDSDtJQUNELENBQUMsQ0FBQztFQUNILENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEE7RUFNTyxNQUFNRSxXQUFXLEdBQUcsVUFBVS9HLGdCQUFrQyxFQUF3QjtJQUM5RixNQUFNRCxVQUFVLEdBQUdDLGdCQUFnQixDQUFDMEIsYUFBYSxFQUFFO0lBQ25ELE1BQU1zRixZQUFZLEdBQUdoSCxnQkFBZ0IsQ0FBQ3VGLGNBQWMsRUFBRTtJQUV0RCxJQUFJLENBQUN5QixZQUFZLEVBQUU7TUFDbEI7TUFDQSxNQUFNLElBQUl0RyxLQUFLLENBQ2QsdUhBQXVILENBQ3ZIO0lBQ0Y7SUFDQSxNQUFNa0YsZUFBZSxHQUFHNUYsZ0JBQWdCLENBQUNHLGtCQUFrQixFQUFFO0lBQzdELE1BQU0wRixlQUF1RCxHQUFHRCxlQUFlLENBQUNFLG9CQUFvQixFQUFFO0lBQ3RHLE1BQU1JLHFCQUFxQixHQUFHTixlQUFlLENBQUNNLHFCQUFxQixFQUFFO0lBQ3JFLE1BQU0zSCxLQUFpQyxHQUFHd0csUUFBUSxDQUFDL0UsZ0JBQWdCLEVBQUU2RixlQUFlLENBQUM7SUFDckYsTUFBTW9CLHFCQUFxQixHQUFHM0ksc0JBQXNCLENBQUNDLEtBQUssQ0FBQztJQUMzRCxNQUFNMkkscUJBQXFCLEdBQUcvSCxzQkFBc0IsQ0FBQ1osS0FBSyxDQUFDO0lBQzNELE1BQU00SSxrQkFBa0IsR0FBR0YscUJBQXFCLENBQUNHLElBQUksQ0FBRWQsS0FBSyxJQUFLQSxLQUFLLENBQUN2QyxPQUFPLENBQUNwRixJQUFJLEtBQUssaUJBQWlCLENBQUM7SUFDMUcsSUFBSTBJLGFBQWEsR0FBRyxFQUFFO0lBQ3RCLElBQUlDLGFBQWEsR0FBRyxFQUFFO0lBQ3RCLE1BQU1DLG1CQUFtQixHQUFHQyxzQkFBc0IsRUFBRTtJQUNwRCxNQUFNWCxXQUFXLEdBQUdZLGNBQWMsQ0FBQ1QsWUFBWSxDQUFDO0lBQ2hELE1BQU1VLHlCQUF5QixHQUFHQyw0QkFBNEIsQ0FBQ2QsV0FBVyxDQUFDO0lBQzNFLE1BQU1lLFFBQVEsR0FBR2hDLGVBQWUsQ0FBQ2lDLHNCQUFzQixFQUFFO0lBQ3pELE1BQU1DLG1CQUFtQixHQUFHLENBQUFGLFFBQVEsYUFBUkEsUUFBUSx1QkFBUkEsUUFBUSxDQUFFRyxhQUFhLE1BQUtuSCxTQUFTLEdBQUdnSCxRQUFRLGFBQVJBLFFBQVEsdUJBQVJBLFFBQVEsQ0FBRUcsYUFBYSxDQUFDQyxXQUFXLEVBQUUsR0FBRyxTQUFTO0lBQ3JILE1BQU1DLFlBQVksR0FBRyxDQUFBTCxRQUFRLGFBQVJBLFFBQVEsdUJBQVJBLFFBQVEsQ0FBRU0sTUFBTSxNQUFLdEgsU0FBUyxHQUFHZ0gsUUFBUSxhQUFSQSxRQUFRLHVCQUFSQSxRQUFRLENBQUVNLE1BQU0sQ0FBQ0YsV0FBVyxFQUFFLEdBQUcsU0FBUztJQUNoRyxNQUFNRyxvQkFBb0IsR0FBR1AsUUFBUSxDQUFDTyxvQkFBb0IsS0FBS3ZILFNBQVMsR0FBR2dILFFBQVEsQ0FBQ08sb0JBQW9CLEdBQUcsSUFBSTtJQUMvRyxNQUFNQyxlQUFlLEdBQUdSLFFBQVEsQ0FBQ1EsZUFBZSxLQUFLeEgsU0FBUyxHQUFHZ0gsUUFBUSxDQUFDUSxlQUFlLEdBQUcsS0FBSztJQUVqRyxNQUFNQyxPQUFPLEdBQUdDLGdCQUFnQixDQUFDdEksZ0JBQWdCLEVBQUV6QixLQUFLLENBQUM7SUFDekQsSUFBSThKLE9BQU8sRUFBRTtNQUNaZixhQUFhLEdBQUdlLE9BQU8sQ0FBQ0UsT0FBTztNQUMvQmxCLGFBQWEsR0FBR2dCLE9BQU8sQ0FBQ0csT0FBTztJQUNoQztJQUVBLE1BQU1DLGtCQUFrQixHQUFHN0MsZUFBZSxDQUFDNkMsa0JBQWtCLEVBQUU7SUFDL0Q7SUFDQTtJQUNBLE1BQU1DLGFBQWEsR0FBRyxDQUFDOUMsZUFBZSxDQUFDK0MsaUJBQWlCLEVBQUUsSUFBSUYsa0JBQWtCLEtBQUtuQixhQUFhLEtBQUssRUFBRTtJQUN6RyxNQUFNc0Isa0JBQWtCLEdBQUdDLGtCQUFrQixDQUFDN0ksZ0JBQWdCLEVBQUVpSCxxQkFBcUIsQ0FBQztJQUN0RixNQUFNNkIsZUFBZSxHQUFHRixrQkFBa0IsQ0FBQ0UsZUFBZTtJQUMxRCxNQUFNQyxrQkFBa0IsR0FBR0gsa0JBQWtCLENBQUNJLGFBQWE7SUFDM0QsTUFBTUMsZUFBZSxHQUFHQywyQkFBMkIsQ0FBQ2pDLHFCQUFxQixFQUFFQyxxQkFBcUIsRUFBRWxILGdCQUFnQixDQUFDO0lBQ25ILE1BQU1tSixnQkFBZ0IsR0FBR3hELG9CQUFvQixDQUFDM0YsZ0JBQWdCLEVBQUV6QixLQUFLLENBQUM7SUFFdEUsTUFBTTZLLGdCQUFnQixHQUFHRCxnQkFBZ0IsR0FBR3ZJLFNBQVMsR0FBR3lJLG1CQUFtQixDQUFDdEosVUFBVSxFQUFFQyxnQkFBZ0IsQ0FBQztJQUN6RyxNQUFNUCxvQkFBb0IsR0FBRzBJLG9CQUFvQixHQUFHNUksdUJBQXVCLENBQUMrSix1QkFBdUIsQ0FBQ3ZKLFVBQVUsRUFBRUMsZ0JBQWdCLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFdkk7SUFDQSxNQUFNdUosYUFBYSxHQUFHL0MsZ0JBQWdCLENBQUN4RyxnQkFBZ0IsQ0FBQztJQUN4RCxJQUFJa0cscUJBQXFCLEVBQUU7TUFDMUJVLHFCQUFxQixDQUFDckksS0FBSyxFQUFFc0ksV0FBVyxDQUFDO0lBQzFDO0lBRUEsTUFBTTJDLGdCQUFnQixHQUFHdkMscUJBQXFCLENBQzVDeEIsR0FBRyxDQUFFMUcsYUFBYSxJQUFLO01BQ3ZCLE9BQU9BLGFBQWEsQ0FBQ3dDLFVBQVUsQ0FBQzJCLEVBQUU7SUFDbkMsQ0FBQyxDQUFDLENBQ0R1RyxNQUFNLENBQ052QyxxQkFBcUIsQ0FBQ3pCLEdBQUcsQ0FBRTFHLGFBQWEsSUFBSztNQUM1QyxPQUFPQSxhQUFhLENBQUNtRSxFQUFFO0lBQ3hCLENBQUMsQ0FBQyxDQUNGO0lBQ0YsTUFBTXdHLGdCQUFnQixHQUFHLENBQ3hCLElBQUloQixhQUFhLElBQUksQ0FBQ0Qsa0JBQWtCLEdBQUcsRUFBRSxHQUFHLENBQUM1QixXQUFXLENBQUMsQ0FBQyxFQUM5RCxJQUFJakIsZUFBZSxDQUFDK0Qsb0JBQW9CLEVBQUUsS0FBS0MscUJBQXFCLENBQUNDLE9BQU8sR0FBR0wsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLEVBQ3JHLElBQUlMLGdCQUFnQixHQUFHLENBQUNBLGdCQUFnQixDQUFDakcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQ2xEO0lBRUQsTUFBTTRHLHVCQUF1QixHQUM1QlgsZ0JBQWdCLElBQUl2RCxlQUFlLENBQUNtRSxvQ0FBb0MsRUFBRSxHQUFHWixnQkFBZ0IsQ0FBQ2pHLEVBQUUsR0FBR3RDLFNBQVM7SUFFN0csT0FBTztNQUNOb0osYUFBYSxFQUFFaEQsWUFBWTtNQUMzQmlELGNBQWMsRUFBRyxHQUFFakQsWUFBYSxHQUFFO01BQ2xDa0QsaUJBQWlCLEVBQUVmLGdCQUFnQjtNQUNuQ1csdUJBQXVCO01BQ3ZCekMsYUFBYTtNQUNiQyxhQUFhO01BQ2JDLG1CQUFtQjtNQUNuQmdDLGFBQWE7TUFDYnBDLGtCQUFrQixFQUFFQSxrQkFBa0I7TUFDdENnRCxTQUFTLEVBQUU7UUFDVkMsWUFBWSxFQUFFckIsa0JBQWtCO1FBQ2hDRCxlQUFlO1FBQ2ZHLGVBQWU7UUFDZmI7TUFDRCxDQUFDO01BQ0Q3SixLQUFLLEVBQUVBLEtBQUs7TUFDWnNJLFdBQVcsRUFBRTZCLGFBQWEsSUFBSSxDQUFDRCxrQkFBa0IsR0FBRyxFQUFFLEdBQUc1QixXQUFXO01BQ3BFd0QsZ0JBQWdCLEVBQUU7UUFDakJqQixnQkFBZ0IsRUFBRUEsZ0JBQWdCO1FBQ2xDM0osb0JBQW9CLEVBQUVBO01BQ3ZCLENBQUM7TUFDRDZLLGlCQUFpQixFQUFFO1FBQ2xCcEgsRUFBRSxFQUFFd0UseUJBQXlCO1FBQzdCZ0MsZ0JBQWdCLEVBQUVBLGdCQUFnQixDQUFDYSxJQUFJLENBQUMsR0FBRztNQUM1QyxDQUFDO01BQ0R4RSxzQkFBc0IsRUFBRUEsc0JBQXNCLENBQUMvRixnQkFBZ0IsQ0FBQztNQUNoRXdLLFlBQVksRUFBRTVFLGVBQWUsQ0FBQ2pELGVBQWUsRUFBRTtNQUMvQ3dGLG9CQUFvQjtNQUNwQkwsbUJBQW1CO01BQ25CRyxZQUFZO01BQ1p3QyxjQUFjLEVBQUVDLGlCQUFpQixDQUFDMUssZ0JBQWdCLENBQUM7TUFDbkQwSSxhQUFhO01BQ2JEO0lBQ0QsQ0FBQztFQUNGLENBQUM7RUFBQztFQUVGLFNBQVNILGdCQUFnQixDQUFDdEksZ0JBQWtDLEVBQUV6QixLQUFpQyxFQUE2QjtJQUMzSCxJQUFJOEksYUFBYSxHQUFHLEVBQUU7TUFDckJDLGFBQWEsR0FBRyxFQUFFO0lBQ25CLElBQ0N0SCxnQkFBZ0IsQ0FBQ0csa0JBQWtCLEVBQUUsQ0FBQ2lELHlCQUF5QixFQUFFLElBQ2pFcEQsZ0JBQWdCLENBQUMyQyxlQUFlLEVBQUUsS0FBS0MsWUFBWSxDQUFDQyxrQkFBa0IsRUFDckU7TUFDRCxLQUFLLElBQUluRSxJQUFJLElBQUlILEtBQUssRUFBRTtRQUN2QkcsSUFBSSxHQUFHQSxJQUE4QjtRQUNyQyxJQUFJQSxJQUFJLENBQUNrRCxjQUFjLElBQUlsRCxJQUFJLENBQUNpRCxjQUFjLEVBQUU7VUFDL0MyRixhQUFhLEdBQUc1SSxJQUFJLENBQUNrRCxjQUFjO1VBQ25DeUYsYUFBYSxHQUFHM0ksSUFBSSxDQUFDaUQsY0FBYztVQUNuQztRQUNEO01BQ0Q7SUFDRCxDQUFDLE1BQU07TUFDTixLQUFLLElBQUlqRCxJQUFJLElBQUlILEtBQUssRUFBRTtRQUN2QkcsSUFBSSxHQUFHQSxJQUE0QjtRQUNuQyxJQUFJLENBQUMySSxhQUFhLElBQUszSSxJQUFJLENBQStCaUQsY0FBYyxFQUFFO1VBQ3pFMEYsYUFBYSxHQUFJM0ksSUFBSSxDQUErQmlELGNBQWMsSUFBSSxFQUFFO1FBQ3pFO1FBQ0EsSUFBSSxDQUFDMkYsYUFBYSxJQUFLNUksSUFBSSxDQUErQmtELGNBQWMsRUFBRTtVQUN6RTBGLGFBQWEsR0FBSTVJLElBQUksQ0FBK0JrRCxjQUFjLElBQUksRUFBRTtRQUN6RTtRQUNBLElBQUkwRixhQUFhLElBQUlELGFBQWEsRUFBRTtVQUNuQztRQUNEO01BQ0Q7SUFDRDtJQUNBLElBQUlBLGFBQWEsSUFBSUMsYUFBYSxFQUFFO01BQ25DLE9BQU87UUFDTmlCLE9BQU8sRUFBRWpCLGFBQWE7UUFDdEJrQixPQUFPLEVBQUVuQjtNQUNWLENBQUM7SUFDRjtJQUNBLE9BQU96RyxTQUFTO0VBQ2pCO0VBQUM7QUFBQSJ9