/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/formatters/TableFormatterTypes", "sap/m/Popover", "sap/ui/core/Core", "sap/ui/core/format/DateFormat", "sap/ui/core/format/NumberFormat", "sap/ui/core/Locale", "sap/ui/core/mvc/ControllerExtension", "sap/ui/model/Filter", "sap/ui/model/json/JSONModel", "sap/ui/model/Sorter", "../helpers/ClassSupport"], function (Log, TableFormatterTypes, Popover, Core, DateFormat, NumberFormat, Locale, ControllerExtension, Filter, JSONModel, Sorter, ClassSupport) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var methodOverride = ClassSupport.methodOverride;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var MessageType = TableFormatterTypes.MessageType;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  const MessageTypeFromCriticality = {
    "1": MessageType.Error,
    "2": MessageType.Warning,
    "3": MessageType.Success,
    "5": MessageType.Information
  };
  const ValueColorFromMessageType = {
    Error: "Error",
    Warning: "Critical",
    Success: "Good",
    Information: "None",
    None: "None"
  };

  /**
   * Function to get a message state from a calculated criticality of type 'Target'.
   *
   * @param kpiValue The value of the KPI to be tested against.
   * @param aThresholds Thresholds to be used [DeviationRangeLowValue,ToleranceRangeLowValue,AcceptanceRangeLowValue,AcceptanceRangeHighValue,ToleranceRangeHighValue,DeviationRangeHighValue].
   * @returns The corresponding MessageType
   */
  function messageTypeFromTargetCalculation(kpiValue, aThresholds) {
    let criticalityProperty;
    if (aThresholds[0] !== undefined && aThresholds[0] !== null && kpiValue < aThresholds[0]) {
      criticalityProperty = MessageType.Error;
    } else if (aThresholds[1] !== undefined && aThresholds[1] !== null && kpiValue < aThresholds[1]) {
      criticalityProperty = MessageType.Warning;
    } else if (aThresholds[2] !== undefined && aThresholds[2] !== null && kpiValue < aThresholds[2]) {
      criticalityProperty = MessageType.None;
    } else if (aThresholds[5] !== undefined && aThresholds[5] !== null && kpiValue > aThresholds[5]) {
      criticalityProperty = MessageType.Error;
    } else if (aThresholds[4] !== undefined && aThresholds[4] !== null && kpiValue > aThresholds[4]) {
      criticalityProperty = MessageType.Warning;
    } else if (aThresholds[3] !== undefined && aThresholds[3] !== null && kpiValue > aThresholds[3]) {
      criticalityProperty = MessageType.None;
    } else {
      criticalityProperty = MessageType.Success;
    }
    return criticalityProperty;
  }

  /**
   * Function to get a message state from a calculated criticality of type 'Minimize'.
   *
   * @param kpiValue The value of the KPI to be tested against.
   * @param aThresholds Thresholds to be used [AcceptanceRangeHighValue,ToleranceRangeHighValue,DeviationRangeHighValue].
   * @returns The corresponding MessageType
   */
  function messageTypeFromMinimizeCalculation(kpiValue, aThresholds) {
    let criticalityProperty;
    if (aThresholds[2] !== undefined && aThresholds[2] !== null && kpiValue > aThresholds[2]) {
      criticalityProperty = MessageType.Error;
    } else if (aThresholds[1] !== undefined && aThresholds[1] !== null && kpiValue > aThresholds[1]) {
      criticalityProperty = MessageType.Warning;
    } else if (aThresholds[0] !== undefined && aThresholds[0] !== null && kpiValue > aThresholds[0]) {
      criticalityProperty = MessageType.None;
    } else {
      criticalityProperty = MessageType.Success;
    }
    return criticalityProperty;
  }

  /**
   * Function to get a message state from a calculated criticality of type 'Maximize'.
   *
   * @param kpiValue The value of the KPI to be tested against.
   * @param aThresholds Thresholds to be used [DeviationRangeLowValue,ToleranceRangeLowValue,AcceptanceRangeLowValue].
   * @returns The corresponding MessageType
   */
  function messageTypeFromMaximizeCalculation(kpiValue, aThresholds) {
    let criticalityProperty;
    if (aThresholds[0] !== undefined && aThresholds[0] !== null && kpiValue < aThresholds[0]) {
      criticalityProperty = MessageType.Error;
    } else if (aThresholds[1] !== undefined && aThresholds[1] !== null && kpiValue < aThresholds[1]) {
      criticalityProperty = MessageType.Warning;
    } else if (aThresholds[2] !== undefined && aThresholds[2] !== null && kpiValue < aThresholds[2]) {
      criticalityProperty = MessageType.None;
    } else {
      criticalityProperty = MessageType.Success;
    }
    return criticalityProperty;
  }

  /**
   * Function to calculate a DeviationIndicator value from a trend value.
   *
   * @param trendValue The criticality values.
   * @returns The corresponding DeviationIndicator value
   */
  function deviationIndicatorFromTrendType(trendValue) {
    let deviationIndicator;
    switch (trendValue) {
      case 1: // StrongUp
      case "1":
      case 2: // Up
      case "2":
        deviationIndicator = "Up";
        break;
      case 4: // Down
      case "4":
      case 5: // StrongDown
      case "5":
        deviationIndicator = "Down";
        break;
      default:
        deviationIndicator = "None";
    }
    return deviationIndicator;
  }

  /**
   * Function to calculate a DeviationIndicator from a TrendCalculation.
   *
   * @param kpiValue The value of the KPI
   * @param referenceValue The reference value to compare with
   * @param isRelative True is the comparison is relative
   * @param aThresholds Array of thresholds [StrongDownDifference, DownDifference, UpDifference, StrongUpDifference]
   * @returns The corresponding DeviationIndicator value
   */
  function deviationIndicatorFromCalculation(kpiValue, referenceValue, isRelative, aThresholds) {
    let deviationIndicator;
    if (!aThresholds || isRelative && !referenceValue) {
      return "None";
    }
    const compValue = isRelative ? (kpiValue - referenceValue) / referenceValue : kpiValue - referenceValue;
    if (aThresholds[0] !== undefined && aThresholds[0] !== null && compValue <= aThresholds[0]) {
      // StrongDown --> Down
      deviationIndicator = "Down";
    } else if (aThresholds[1] !== undefined && aThresholds[1] !== null && compValue <= aThresholds[1]) {
      // Down --> Down
      deviationIndicator = "Down";
    } else if (aThresholds[3] !== undefined && aThresholds[3] !== null && compValue >= aThresholds[3]) {
      // StrongUp --> Up
      deviationIndicator = "Up";
    } else if (aThresholds[2] !== undefined && aThresholds[2] !== null && compValue >= aThresholds[2]) {
      // Up --> Up
      deviationIndicator = "Up";
    } else {
      // Sideways --> None
      deviationIndicator = "None";
    }
    return deviationIndicator;
  }

  /**
   * Creates a sap.ui.model.Filter from a filter definition.
   *
   * @param filterDefinition The filter definition
   * @returns Returns a sap.ui.model.Filter from the definition, or undefined if the definition is empty (no ranges)
   */
  function createFilterFromDefinition(filterDefinition) {
    if (filterDefinition.ranges.length === 0) {
      return undefined;
    } else if (filterDefinition.ranges.length === 1) {
      return new Filter(filterDefinition.propertyPath, filterDefinition.ranges[0].operator, filterDefinition.ranges[0].rangeLow, filterDefinition.ranges[0].rangeHigh);
    } else {
      const aRangeFilters = filterDefinition.ranges.map(range => {
        return new Filter(filterDefinition.propertyPath, range.operator, range.rangeLow, range.rangeHigh);
      });
      return new Filter({
        filters: aRangeFilters,
        and: false
      });
    }
  }
  function getFilterStringFromDefinition(filterDefinition) {
    const currentLocale = new Locale(sap.ui.getCore().getConfiguration().getLanguage());
    const resBundle = Core.getLibraryResourceBundle("sap.fe.core");
    const dateFormat = DateFormat.getDateInstance({
      style: "medium"
    }, currentLocale);
    function formatRange(range) {
      const valueLow = filterDefinition.propertyType.indexOf("Edm.Date") === 0 ? dateFormat.format(new Date(range.rangeLow)) : range.rangeLow;
      const valueHigh = filterDefinition.propertyType.indexOf("Edm.Date") === 0 ? dateFormat.format(new Date(range.rangeHigh)) : range.rangeHigh;
      switch (range.operator) {
        case "BT":
          return `[${valueLow} - ${valueHigh}]`;
        case "Contains":
          return `*${valueLow}*`;
        case "GE":
          return `\u2265${valueLow}`;
        case "GT":
          return `>${valueLow}`;
        case "LE":
          return `\u2264${valueLow}`;
        case "LT":
          return `<${valueLow}`;
        case "NB":
          return resBundle.getText("C_KPICARD_FILTERSTRING_NOT", [`[${valueLow} - ${valueHigh}]`]);
        case "NE":
          return `\u2260${valueLow}`;
        case "NotContains":
          return resBundle.getText("C_KPICARD_FILTERSTRING_NOT", [`*${valueLow}*`]);
        case "EQ":
        default:
          return valueLow;
      }
    }
    if (filterDefinition.ranges.length === 0) {
      return "";
    } else if (filterDefinition.ranges.length === 1) {
      return formatRange(filterDefinition.ranges[0]);
    } else {
      return `(${filterDefinition.ranges.map(formatRange).join(",")})`;
    }
  }
  function formatChartTitle(kpiDef) {
    const resBundle = Core.getLibraryResourceBundle("sap.fe.core");
    function formatList(items) {
      if (items.length === 0) {
        return "";
      } else if (items.length === 1) {
        return items[0].label;
      } else {
        let res = items[0].label;
        for (let I = 1; I < items.length - 1; I++) {
          res += `, ${items[I].label}`;
        }
        return resBundle.getText("C_KPICARD_ITEMSLIST", [res, items[items.length - 1].label]);
      }
    }
    return resBundle.getText("C_KPICARD_CHARTTITLE", [formatList(kpiDef.chart.measures), formatList(kpiDef.chart.dimensions)]);
  }
  function updateChartLabelSettings(chartDefinition, oChartProperties) {
    switch (chartDefinition.chartType) {
      case "Donut":
        // Show data labels, do not show axis titles
        oChartProperties.categoryAxis = {
          title: {
            visible: false
          }
        };
        oChartProperties.valueAxis = {
          title: {
            visible: false
          },
          label: {
            formatString: "ShortFloat"
          }
        };
        oChartProperties.plotArea.dataLabel = {
          visible: true,
          type: "value",
          formatString: "ShortFloat_MFD2"
        };
        break;
      case "bubble":
        // Show axis title, bubble size legend, do not show data labels
        oChartProperties.valueAxis = {
          title: {
            visible: true
          },
          label: {
            formatString: "ShortFloat"
          }
        };
        oChartProperties.valueAxis2 = {
          title: {
            visible: true
          },
          label: {
            formatString: "ShortFloat"
          }
        };
        oChartProperties.legendGroup = {
          layout: {
            position: "bottom",
            alignment: "topLeft"
          }
        };
        oChartProperties.sizeLegend = {
          visible: true
        };
        oChartProperties.plotArea.dataLabel = {
          visible: false
        };
        break;
      case "scatter":
        // Do not show data labels and axis titles
        oChartProperties.valueAxis = {
          title: {
            visible: false
          },
          label: {
            formatString: "ShortFloat"
          }
        };
        oChartProperties.valueAxis2 = {
          title: {
            visible: false
          },
          label: {
            formatString: "ShortFloat"
          }
        };
        oChartProperties.plotArea.dataLabel = {
          visible: false
        };
        break;
      default:
        // Do not show data labels and axis titles
        oChartProperties.categoryAxis = {
          title: {
            visible: false
          }
        };
        oChartProperties.valueAxis = {
          title: {
            visible: false
          },
          label: {
            formatString: "ShortFloat"
          }
        };
        oChartProperties.plotArea.dataLabel = {
          visible: false
        };
    }
  }
  function filterMap(aObjects, aRoles) {
    if (aRoles && aRoles.length) {
      return aObjects.filter(dimension => {
        return aRoles.indexOf(dimension.role) >= 0;
      }).map(dimension => {
        return dimension.label;
      });
    } else {
      return aObjects.map(dimension => {
        return dimension.label;
      });
    }
  }
  function getScatterBubbleChartFeeds(chartDefinition) {
    const axis1Measures = filterMap(chartDefinition.measures, ["Axis1"]);
    const axis2Measures = filterMap(chartDefinition.measures, ["Axis2"]);
    const axis3Measures = filterMap(chartDefinition.measures, ["Axis3"]);
    const otherMeasures = filterMap(chartDefinition.measures, [undefined]);
    const seriesDimensions = filterMap(chartDefinition.dimensions, ["Series"]);

    // Get the first dimension with role "Category" for the shape
    const shapeDimension = chartDefinition.dimensions.find(dimension => {
      return dimension.role === "Category";
    });

    // Measure for the x-Axis : first measure for Axis1, or for Axis2 if not found, or for Axis3 if not found
    const xMeasure = axis1Measures.shift() || axis2Measures.shift() || axis3Measures.shift() || otherMeasures.shift() || "";
    // Measure for the y-Axis : first measure for Axis2, or second measure for Axis1 if not found, or first measure for Axis3 if not found
    const yMeasure = axis2Measures.shift() || axis1Measures.shift() || axis3Measures.shift() || otherMeasures.shift() || "";
    const res = [{
      uid: "valueAxis",
      type: "Measure",
      values: [xMeasure]
    }, {
      uid: "valueAxis2",
      type: "Measure",
      values: [yMeasure]
    }];
    if (chartDefinition.chartType === "bubble") {
      // Measure for the size of the bubble: first measure for Axis3, or remaining measure for Axis1/Axis2 if not found
      const sizeMeasure = axis3Measures.shift() || axis1Measures.shift() || axis2Measures.shift() || otherMeasures.shift() || "";
      res.push({
        uid: "bubbleWidth",
        type: "Measure",
        values: [sizeMeasure]
      });
    }

    // Color (optional)
    if (seriesDimensions.length) {
      res.push({
        uid: "color",
        type: "Dimension",
        values: seriesDimensions
      });
    }
    // Shape (optional)
    if (shapeDimension) {
      res.push({
        uid: "shape",
        type: "Dimension",
        values: [shapeDimension.label]
      });
    }
    return res;
  }
  function getChartFeeds(chartDefinition) {
    let res;
    switch (chartDefinition.chartType) {
      case "Donut":
        res = [{
          uid: "size",
          type: "Measure",
          values: filterMap(chartDefinition.measures)
        }, {
          uid: "color",
          type: "Dimension",
          values: filterMap(chartDefinition.dimensions)
        }];
        break;
      case "bubble":
      case "scatter":
        res = getScatterBubbleChartFeeds(chartDefinition);
        break;
      case "vertical_bullet":
        res = [{
          uid: "actualValues",
          type: "Measure",
          values: filterMap(chartDefinition.measures, [undefined, "Axis1"])
        }, {
          uid: "targetValues",
          type: "Measure",
          values: filterMap(chartDefinition.measures, ["Axis2"])
        }, {
          uid: "categoryAxis",
          type: "Dimension",
          values: filterMap(chartDefinition.dimensions, [undefined, "Category"])
        }, {
          uid: "color",
          type: "Dimension",
          values: filterMap(chartDefinition.dimensions, ["Series"])
        }];
        break;
      default:
        res = [{
          uid: "valueAxis",
          type: "Measure",
          values: filterMap(chartDefinition.measures)
        }, {
          uid: "categoryAxis",
          type: "Dimension",
          values: filterMap(chartDefinition.dimensions, [undefined, "Category"])
        }, {
          uid: "color",
          type: "Dimension",
          values: filterMap(chartDefinition.dimensions, ["Series"])
        }];
    }
    return res;
  }
  function getNavigationParameters(navInfo, oShellService) {
    if (navInfo.semanticObject) {
      if (navInfo.action) {
        // Action is already specified: check if it's available in the shell
        return oShellService.getLinks({
          semanticObject: navInfo.semanticObject,
          action: navInfo.action
        }).then(aLinks => {
          return aLinks.length ? {
            semanticObject: navInfo.semanticObject,
            action: navInfo.action
          } : undefined;
        });
      } else {
        // We get the primary intent from the shell
        return oShellService.getPrimaryIntent(navInfo.semanticObject).then(oLink => {
          if (!oLink) {
            // No primary intent...
            return undefined;
          }

          // Check that the primary intent is not part of the unavailable actions
          const oInfo = oShellService.parseShellHash(oLink.intent);
          return navInfo.unavailableActions && navInfo.unavailableActions.indexOf(oInfo.action) >= 0 ? undefined : {
            semanticObject: oInfo.semanticObject,
            action: oInfo.action
          };
        });
      }
    } else {
      // Outbound navigation specified in the manifest
      return navInfo.outboundNavigation ? Promise.resolve({
        outbound: navInfo.outboundNavigation
      }) : Promise.resolve(undefined);
    }
  }

  /**
   * @class A controller extension for managing the KPIs in an analytical list page
   * @name sap.fe.core.controllerextensions.KPIManagement
   * @hideconstructor
   * @private
   * @since 1.93.0
   */
  let KPIManagementControllerExtension = (_dec = defineUI5Class("sap.fe.core.controllerextensions.KPIManagement"), _dec2 = methodOverride(), _dec3 = methodOverride(), _dec4 = publicExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(KPIManagementControllerExtension, _ControllerExtension);
    function KPIManagementControllerExtension() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = KPIManagementControllerExtension.prototype;
    /**
     * Creates the card manifest for a KPI definition and stores it in a JSON model.
     *
     * @param kpiDefinition The KPI definition
     * @param oKPIModel The JSON model in which the manifest will be stored
     */
    _proto.initCardManifest = function initCardManifest(kpiDefinition, oKPIModel) {
      var _kpiDefinition$select;
      const oCardManifest = {
        "sap.app": {
          id: "sap.fe",
          type: "card"
        },
        "sap.ui": {
          technology: "UI5"
        },
        "sap.card": {
          type: "Analytical",
          data: {
            json: {}
          },
          header: {
            type: "Numeric",
            title: kpiDefinition.datapoint.title,
            subTitle: kpiDefinition.datapoint.description,
            unitOfMeasurement: "{mainUnit}",
            mainIndicator: {
              number: "{mainValueNoScale}",
              unit: "{mainValueScale}",
              state: "{mainState}",
              trend: "{trend}"
            }
          },
          content: {
            minHeight: "25rem",
            chartProperties: {
              plotArea: {},
              title: {
                visible: true,
                alignment: "left"
              }
            },
            data: {
              path: "/chartData"
            }
          }
        }
      };

      // Add side indicators in the card header if a target is defined for the KPI
      if (kpiDefinition.datapoint.targetPath || kpiDefinition.datapoint.targetValue !== undefined) {
        const resBundle = Core.getLibraryResourceBundle("sap.fe.core");
        oCardManifest["sap.card"].header.sideIndicators = [{
          title: resBundle.getText("C_KPICARD_INDICATOR_TARGET"),
          number: "{targetNumber}",
          unit: "{targetUnit}"
        }, {
          title: resBundle.getText("C_KPICARD_INDICATOR_DEVIATION"),
          number: "{deviationNumber}",
          unit: "%"
        }];
      }

      // Details of the card: filter descriptions
      if ((_kpiDefinition$select = kpiDefinition.selectionVariantFilterDefinitions) !== null && _kpiDefinition$select !== void 0 && _kpiDefinition$select.length) {
        const aDescriptions = [];
        kpiDefinition.selectionVariantFilterDefinitions.forEach(filterDefinition => {
          const desc = getFilterStringFromDefinition(filterDefinition);
          if (desc) {
            aDescriptions.push(desc);
          }
        });
        if (aDescriptions.length) {
          oCardManifest["sap.card"].header.details = aDescriptions.join(", ");
        }
      }

      // Chart settings: type, title, dimensions and measures in the manifest
      oCardManifest["sap.card"].content.chartType = kpiDefinition.chart.chartType;
      updateChartLabelSettings(kpiDefinition.chart, oCardManifest["sap.card"].content.chartProperties);
      oCardManifest["sap.card"].content.chartProperties.title.text = formatChartTitle(kpiDefinition);
      oCardManifest["sap.card"].content.dimensions = kpiDefinition.chart.dimensions.map(dimension => {
        return {
          label: dimension.label,
          value: `{${dimension.name}}`
        };
      });
      oCardManifest["sap.card"].content.measures = kpiDefinition.chart.measures.map(measure => {
        return {
          label: measure.label,
          value: `{${measure.name}}`
        };
      });
      oCardManifest["sap.card"].content.feeds = getChartFeeds(kpiDefinition.chart);
      oKPIModel.setProperty(`/${kpiDefinition.id}`, {
        manifest: oCardManifest
      });
    };
    _proto.initNavigationInfo = function initNavigationInfo(kpiDefinition, oKPIModel, oShellService) {
      // Add navigation
      if (kpiDefinition.navigation) {
        return getNavigationParameters(kpiDefinition.navigation, oShellService).then(oNavInfo => {
          if (oNavInfo) {
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/header/actions`, [{
              type: "Navigation",
              parameters: oNavInfo
            }]);
          }
        });
      } else {
        return Promise.resolve();
      }
    };
    _proto.onInit = function onInit() {
      var _getPageModel;
      this.aKPIDefinitions = (_getPageModel = this.getView().getController()._getPageModel()) === null || _getPageModel === void 0 ? void 0 : _getPageModel.getProperty("/kpiDefinitions");
      if (this.aKPIDefinitions && this.aKPIDefinitions.length) {
        const oView = this.getView();
        const oAppComponent = oView.getController().getAppComponent();

        // Create a JSON model to store KPI data
        const oKPIModel = new JSONModel();
        oView.setModel(oKPIModel, "kpiModel");
        this.aKPIDefinitions.forEach(kpiDefinition => {
          // Create the manifest for the KPI card and store it in the KPI model
          this.initCardManifest(kpiDefinition, oKPIModel);

          // Set the navigation information in the manifest
          this.initNavigationInfo(kpiDefinition, oKPIModel, oAppComponent.getShellServices()).catch(function (err) {
            Log.error(err);
          });

          // Load tag data for the KPI
          this.loadKPITagData(kpiDefinition, oAppComponent.getModel(), oKPIModel).catch(function (err) {
            Log.error(err);
          });
        });
      }
    };
    _proto.onExit = function onExit() {
      const oKPIModel = this.getView().getModel("kpiModel");
      if (oKPIModel) {
        oKPIModel.destroy();
      }
    };
    _proto.updateDatapointValueAndCurrency = function updateDatapointValueAndCurrency(kpiDefinition, kpiContext, oKPIModel) {
      var _kpiDefinition$datapo, _kpiDefinition$datapo2, _kpiDefinition$datapo3;
      const currentLocale = new Locale(sap.ui.getCore().getConfiguration().getLanguage());
      const rawUnit = (_kpiDefinition$datapo = kpiDefinition.datapoint.unit) !== null && _kpiDefinition$datapo !== void 0 && _kpiDefinition$datapo.isPath ? kpiContext.getProperty(kpiDefinition.datapoint.unit.value) : (_kpiDefinition$datapo2 = kpiDefinition.datapoint.unit) === null || _kpiDefinition$datapo2 === void 0 ? void 0 : _kpiDefinition$datapo2.value;
      const isPercentage = ((_kpiDefinition$datapo3 = kpiDefinition.datapoint.unit) === null || _kpiDefinition$datapo3 === void 0 ? void 0 : _kpiDefinition$datapo3.isCurrency) === false && rawUnit === "%";

      // /////////////////////
      // Main KPI value
      const rawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.propertyPath));

      // Value formatted with a scale
      const kpiValue = NumberFormat.getFloatInstance({
        style: isPercentage ? undefined : "short",
        minFractionDigits: 0,
        maxFractionDigits: 1,
        showScale: !isPercentage
      }, currentLocale).format(rawValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValue`, kpiValue);

      // Value without a scale
      const kpiValueUnscaled = NumberFormat.getFloatInstance({
        maxFractionDigits: 2,
        showScale: false,
        groupingEnabled: true
      }, currentLocale).format(rawValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueUnscaled`, kpiValueUnscaled);

      // Value formatted with the scale omitted
      const kpiValueNoScale = NumberFormat.getFloatInstance({
        style: isPercentage ? undefined : "short",
        minFractionDigits: 0,
        maxFractionDigits: 1,
        showScale: false
      }, currentLocale).format(rawValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueNoScale`, kpiValueNoScale);

      // Scale of the value
      const kpiValueScale = NumberFormat.getFloatInstance({
        style: isPercentage ? undefined : "short",
        decimals: 0,
        maxIntegerDigits: 0,
        showScale: true
      }, currentLocale).format(rawValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueScale`, kpiValueScale);

      // /////////////////////
      // Unit or currency
      if (kpiDefinition.datapoint.unit && rawUnit) {
        if (kpiDefinition.datapoint.unit.isCurrency) {
          oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainUnit`, rawUnit);
        } else {
          // In case of unit of measure, we have to format it properly
          const kpiUnit = NumberFormat.getUnitInstance({
            showNumber: false
          }, currentLocale).format(rawValue, rawUnit);
          oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainUnit`, kpiUnit);
        }
      }
    };
    _proto.updateDatapointCriticality = function updateDatapointCriticality(kpiDefinition, kpiContext, oKPIModel) {
      const rawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.propertyPath));
      let criticalityValue = MessageType.None;
      if (kpiDefinition.datapoint.criticalityValue) {
        // Criticality is a fixed value
        criticalityValue = kpiDefinition.datapoint.criticalityValue;
      } else if (kpiDefinition.datapoint.criticalityPath) {
        // Criticality comes from another property (via a path)
        criticalityValue = MessageTypeFromCriticality[kpiContext.getProperty(kpiDefinition.datapoint.criticalityPath)] || MessageType.None;
      } else if (kpiDefinition.datapoint.criticalityCalculationThresholds && kpiDefinition.datapoint.criticalityCalculationMode) {
        // Criticality calculation
        switch (kpiDefinition.datapoint.criticalityCalculationMode) {
          case "UI.ImprovementDirectionType/Target":
            criticalityValue = messageTypeFromTargetCalculation(rawValue, kpiDefinition.datapoint.criticalityCalculationThresholds);
            break;
          case "UI.ImprovementDirectionType/Minimize":
            criticalityValue = messageTypeFromMinimizeCalculation(rawValue, kpiDefinition.datapoint.criticalityCalculationThresholds);
            break;
          case "UI.ImprovementDirectionType/Maximize":
          default:
            criticalityValue = messageTypeFromMaximizeCalculation(rawValue, kpiDefinition.datapoint.criticalityCalculationThresholds);
            break;
        }
      }
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainCriticality`, criticalityValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainState`, ValueColorFromMessageType[criticalityValue] || "None");
    };
    _proto.updateDatapointTrend = function updateDatapointTrend(kpiDefinition, kpiContext, oKPIModel) {
      const rawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.propertyPath));
      let trendValue = "None";
      if (kpiDefinition.datapoint.trendValue) {
        // Trend is a fixed value
        trendValue = kpiDefinition.datapoint.trendValue;
      } else if (kpiDefinition.datapoint.trendPath) {
        // Trend comes from another property via a path
        trendValue = deviationIndicatorFromTrendType(kpiContext.getProperty(kpiDefinition.datapoint.trendPath));
      } else if (kpiDefinition.datapoint.trendCalculationReferenceValue !== undefined || kpiDefinition.datapoint.trendCalculationReferencePath) {
        // Calculated trend
        let trendReferenceValue;
        if (kpiDefinition.datapoint.trendCalculationReferenceValue !== undefined) {
          trendReferenceValue = kpiDefinition.datapoint.trendCalculationReferenceValue;
        } else {
          trendReferenceValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.trendCalculationReferencePath || ""));
        }
        trendValue = deviationIndicatorFromCalculation(rawValue, trendReferenceValue, !!kpiDefinition.datapoint.trendCalculationIsRelative, kpiDefinition.datapoint.trendCalculationTresholds);
      }
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/trend`, trendValue);
    };
    _proto.updateTargetValue = function updateTargetValue(kpiDefinition, kpiContext, oKPIModel) {
      if (kpiDefinition.datapoint.targetValue === undefined && kpiDefinition.datapoint.targetPath === undefined) {
        return; // No target set for the KPI
      }

      const rawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.propertyPath));
      const currentLocale = new Locale(sap.ui.getCore().getConfiguration().getLanguage());
      let targetRawValue;
      if (kpiDefinition.datapoint.targetValue !== undefined) {
        targetRawValue = kpiDefinition.datapoint.targetValue;
      } else {
        targetRawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.targetPath || ""));
      }
      const deviationRawValue = targetRawValue !== 0 ? (rawValue - targetRawValue) / targetRawValue * 100 : undefined;

      // Formatting
      const targetValue = NumberFormat.getFloatInstance({
        style: "short",
        minFractionDigits: 0,
        maxFractionDigits: 1,
        showScale: false
      }, currentLocale).format(targetRawValue);
      const targetScale = NumberFormat.getFloatInstance({
        style: "short",
        decimals: 0,
        maxIntegerDigits: 0,
        showScale: true
      }, currentLocale).format(targetRawValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/targetNumber`, targetValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/targetUnit`, targetScale);
      if (deviationRawValue !== undefined) {
        const deviationValue = NumberFormat.getFloatInstance({
          minFractionDigits: 0,
          maxFractionDigits: 1,
          showScale: false
        }, currentLocale).format(deviationRawValue);
        oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/deviationNumber`, deviationValue);
      } else {
        oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/deviationNumber`, "N/A");
      }
    }

    /**
     * Loads tag data for a KPI, and stores it in the JSON KPI model.
     *
     * @param kpiDefinition The definition of the KPI.
     * @param oMainModel The model used to load the data.
     * @param oKPIModel The JSON model where the data will be stored
     * @param loadFull If not true, loads only data for the KPI tag
     * @returns The promise that is resolved when data is loaded.
     */;
    _proto.loadKPITagData = function loadKPITagData(kpiDefinition, oMainModel, oKPIModel, loadFull) {
      var _kpiDefinition$datapo4, _kpiDefinition$select2;
      // If loadFull=false, then we're just loading data for the tag and we use the "$auto.LongRunners" groupID
      // If loadFull=true, we're loading data for the whole KPI (tag + card) and we use the "$auto.Workers" groupID
      const oListBinding = loadFull ? oMainModel.bindList(`/${kpiDefinition.entitySet}`, undefined, undefined, undefined, {
        $$groupId: "$auto.Workers"
      }) : oMainModel.bindList(`/${kpiDefinition.entitySet}`, undefined, undefined, undefined, {
        $$groupId: "$auto.LongRunners"
      });
      const oAggregate = {};

      // Main value + currency/unit
      if ((_kpiDefinition$datapo4 = kpiDefinition.datapoint.unit) !== null && _kpiDefinition$datapo4 !== void 0 && _kpiDefinition$datapo4.isPath) {
        oAggregate[kpiDefinition.datapoint.propertyPath] = {
          unit: kpiDefinition.datapoint.unit.value
        };
      } else {
        oAggregate[kpiDefinition.datapoint.propertyPath] = {};
      }

      // Property for criticality
      if (kpiDefinition.datapoint.criticalityPath) {
        oAggregate[kpiDefinition.datapoint.criticalityPath] = {};
      }

      // Properties for trend and trend calculation
      if (loadFull) {
        if (kpiDefinition.datapoint.trendPath) {
          oAggregate[kpiDefinition.datapoint.trendPath] = {};
        }
        if (kpiDefinition.datapoint.trendCalculationReferencePath) {
          oAggregate[kpiDefinition.datapoint.trendCalculationReferencePath] = {};
        }
        if (kpiDefinition.datapoint.targetPath) {
          oAggregate[kpiDefinition.datapoint.targetPath] = {};
        }
      }
      oListBinding.setAggregation({
        aggregate: oAggregate
      });

      // Manage SelectionVariant filters
      if ((_kpiDefinition$select2 = kpiDefinition.selectionVariantFilterDefinitions) !== null && _kpiDefinition$select2 !== void 0 && _kpiDefinition$select2.length) {
        const aFilters = kpiDefinition.selectionVariantFilterDefinitions.map(createFilterFromDefinition).filter(filter => {
          return filter !== undefined;
        });
        oListBinding.filter(aFilters);
      }
      return oListBinding.requestContexts(0, 1).then(aContexts => {
        if (aContexts.length) {
          var _kpiDefinition$datapo5, _kpiDefinition$datapo6;
          const rawUnit = (_kpiDefinition$datapo5 = kpiDefinition.datapoint.unit) !== null && _kpiDefinition$datapo5 !== void 0 && _kpiDefinition$datapo5.isPath ? aContexts[0].getProperty(kpiDefinition.datapoint.unit.value) : (_kpiDefinition$datapo6 = kpiDefinition.datapoint.unit) === null || _kpiDefinition$datapo6 === void 0 ? void 0 : _kpiDefinition$datapo6.value;
          if (kpiDefinition.datapoint.unit && !rawUnit) {
            // A unit/currency is defined, but its value is undefined --> multi-unit situation
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValue`, "*");
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueUnscaled`, "*");
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueNoScale`, "*");
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueScale`, "");
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainUnit`, undefined);
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainCriticality`, MessageType.None);
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainState`, "None");
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/trend`, "None");
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/targetNumber`, undefined);
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/targetUnit`, undefined);
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/deviationNumber`, undefined);
          } else {
            this.updateDatapointValueAndCurrency(kpiDefinition, aContexts[0], oKPIModel);
            this.updateDatapointCriticality(kpiDefinition, aContexts[0], oKPIModel);
            if (loadFull) {
              this.updateDatapointTrend(kpiDefinition, aContexts[0], oKPIModel);
              this.updateTargetValue(kpiDefinition, aContexts[0], oKPIModel);
            }
          }
        }
      });
    }

    /**
     * Loads card data for a KPI, and stores it in the JSON KPI model.
     *
     * @param kpiDefinition The definition of the KPI.
     * @param oMainModel The model used to load the data.
     * @param oKPIModel The JSON model where the data will be stored
     * @returns The promise that is resolved when data is loaded.
     */;
    _proto.loadKPICardData = function loadKPICardData(kpiDefinition, oMainModel, oKPIModel) {
      var _kpiDefinition$select3;
      const oListBinding = oMainModel.bindList(`/${kpiDefinition.entitySet}`, undefined, undefined, undefined, {
        $$groupId: "$auto.Workers"
      });
      const oGroup = {};
      const oAggregate = {};
      kpiDefinition.chart.dimensions.forEach(dimension => {
        oGroup[dimension.name] = {};
      });
      kpiDefinition.chart.measures.forEach(measure => {
        oAggregate[measure.name] = {};
      });
      oListBinding.setAggregation({
        group: oGroup,
        aggregate: oAggregate
      });

      // Manage SelectionVariant filters
      if ((_kpiDefinition$select3 = kpiDefinition.selectionVariantFilterDefinitions) !== null && _kpiDefinition$select3 !== void 0 && _kpiDefinition$select3.length) {
        const aFilters = kpiDefinition.selectionVariantFilterDefinitions.map(createFilterFromDefinition).filter(filter => {
          return filter !== undefined;
        });
        oListBinding.filter(aFilters);
      }

      // Sorting
      if (kpiDefinition.chart.sortOrder) {
        oListBinding.sort(kpiDefinition.chart.sortOrder.map(sortInfo => {
          return new Sorter(sortInfo.name, sortInfo.descending);
        }));
      }
      return oListBinding.requestContexts(0, kpiDefinition.chart.maxItems).then(aContexts => {
        const chartData = aContexts.map(function (oContext) {
          const oData = {};
          kpiDefinition.chart.dimensions.forEach(dimension => {
            oData[dimension.name] = oContext.getProperty(dimension.name);
          });
          kpiDefinition.chart.measures.forEach(measure => {
            oData[measure.name] = oContext.getProperty(measure.name);
          });
          return oData;
        });
        oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/chartData`, chartData);
      });
    }

    /**
     * Gets the popover to display the KPI card
     * The popover and the contained card for the KPIs are created if necessary.
     * The popover is shared between all KPIs, so it's created only once.
     *
     * @param oKPITag The tag that triggered the popover opening.
     * @returns The shared popover as a promise.
     */;
    _proto.getPopover = function getPopover(oKPITag) {
      if (!this.oPopover) {
        return new Promise((resolve, reject) => {
          Core.loadLibrary("sap/ui/integration", {
            async: true
          }).then(() => {
            sap.ui.require(["sap/ui/integration/widgets/Card", "sap/ui/integration/Host"], (Card, Host) => {
              const oHost = new Host();
              oHost.attachAction(oEvent => {
                const sType = oEvent.getParameter("type");
                const oParams = oEvent.getParameter("parameters");
                if (sType === "Navigation") {
                  if (oParams.semanticObject) {
                    this.getView().getController()._intentBasedNavigation.navigate(oParams.semanticObject, oParams.action);
                  } else {
                    this.getView().getController()._intentBasedNavigation.navigateOutbound(oParams.outbound);
                  }
                }
              });
              this.oCard = new Card({
                width: "25rem",
                height: "auto"
              });
              this.oCard.setHost(oHost);
              this.oPopover = new Popover("kpi-Popover", {
                showHeader: false,
                placement: "Auto",
                content: [this.oCard]
              });
              oKPITag.addDependent(this.oPopover); // The first clicked tag gets the popover as dependent

              resolve(this.oPopover);
            });
          }).catch(function () {
            reject();
          });
        });
      } else {
        return Promise.resolve(this.oPopover);
      }
    };
    _proto.onKPIPressed = function onKPIPressed(oKPITag, kpiID) {
      const oKPIModel = oKPITag.getModel("kpiModel");
      if (this.aKPIDefinitions && this.aKPIDefinitions.length) {
        const kpiDefinition = this.aKPIDefinitions.find(function (oDef) {
          return oDef.id === kpiID;
        });
        if (kpiDefinition) {
          const oModel = oKPITag.getModel();
          const aPromises = [this.loadKPITagData(kpiDefinition, oModel, oKPIModel, true), this.loadKPICardData(kpiDefinition, oModel, oKPIModel), this.getPopover(oKPITag)];
          Promise.all(aPromises).then(aResults => {
            this.oCard.setManifest(oKPIModel.getProperty(`/${kpiID}/manifest`));
            this.oCard.refresh();
            const oPopover = aResults[2];
            oPopover.openBy(oKPITag, false);
          }).catch(err => {
            Log.error(err);
          });
        }
      }
    };
    return KPIManagementControllerExtension;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onExit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onExit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onKPIPressed", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "onKPIPressed"), _class2.prototype)), _class2)) || _class);
  return KPIManagementControllerExtension;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eSIsIk1lc3NhZ2VUeXBlIiwiRXJyb3IiLCJXYXJuaW5nIiwiU3VjY2VzcyIsIkluZm9ybWF0aW9uIiwiVmFsdWVDb2xvckZyb21NZXNzYWdlVHlwZSIsIk5vbmUiLCJtZXNzYWdlVHlwZUZyb21UYXJnZXRDYWxjdWxhdGlvbiIsImtwaVZhbHVlIiwiYVRocmVzaG9sZHMiLCJjcml0aWNhbGl0eVByb3BlcnR5IiwidW5kZWZpbmVkIiwibWVzc2FnZVR5cGVGcm9tTWluaW1pemVDYWxjdWxhdGlvbiIsIm1lc3NhZ2VUeXBlRnJvbU1heGltaXplQ2FsY3VsYXRpb24iLCJkZXZpYXRpb25JbmRpY2F0b3JGcm9tVHJlbmRUeXBlIiwidHJlbmRWYWx1ZSIsImRldmlhdGlvbkluZGljYXRvciIsImRldmlhdGlvbkluZGljYXRvckZyb21DYWxjdWxhdGlvbiIsInJlZmVyZW5jZVZhbHVlIiwiaXNSZWxhdGl2ZSIsImNvbXBWYWx1ZSIsImNyZWF0ZUZpbHRlckZyb21EZWZpbml0aW9uIiwiZmlsdGVyRGVmaW5pdGlvbiIsInJhbmdlcyIsImxlbmd0aCIsIkZpbHRlciIsInByb3BlcnR5UGF0aCIsIm9wZXJhdG9yIiwicmFuZ2VMb3ciLCJyYW5nZUhpZ2giLCJhUmFuZ2VGaWx0ZXJzIiwibWFwIiwicmFuZ2UiLCJmaWx0ZXJzIiwiYW5kIiwiZ2V0RmlsdGVyU3RyaW5nRnJvbURlZmluaXRpb24iLCJjdXJyZW50TG9jYWxlIiwiTG9jYWxlIiwic2FwIiwidWkiLCJnZXRDb3JlIiwiZ2V0Q29uZmlndXJhdGlvbiIsImdldExhbmd1YWdlIiwicmVzQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImRhdGVGb3JtYXQiLCJEYXRlRm9ybWF0IiwiZ2V0RGF0ZUluc3RhbmNlIiwic3R5bGUiLCJmb3JtYXRSYW5nZSIsInZhbHVlTG93IiwicHJvcGVydHlUeXBlIiwiaW5kZXhPZiIsImZvcm1hdCIsIkRhdGUiLCJ2YWx1ZUhpZ2giLCJnZXRUZXh0Iiwiam9pbiIsImZvcm1hdENoYXJ0VGl0bGUiLCJrcGlEZWYiLCJmb3JtYXRMaXN0IiwiaXRlbXMiLCJsYWJlbCIsInJlcyIsIkkiLCJjaGFydCIsIm1lYXN1cmVzIiwiZGltZW5zaW9ucyIsInVwZGF0ZUNoYXJ0TGFiZWxTZXR0aW5ncyIsImNoYXJ0RGVmaW5pdGlvbiIsIm9DaGFydFByb3BlcnRpZXMiLCJjaGFydFR5cGUiLCJjYXRlZ29yeUF4aXMiLCJ0aXRsZSIsInZpc2libGUiLCJ2YWx1ZUF4aXMiLCJmb3JtYXRTdHJpbmciLCJwbG90QXJlYSIsImRhdGFMYWJlbCIsInR5cGUiLCJ2YWx1ZUF4aXMyIiwibGVnZW5kR3JvdXAiLCJsYXlvdXQiLCJwb3NpdGlvbiIsImFsaWdubWVudCIsInNpemVMZWdlbmQiLCJmaWx0ZXJNYXAiLCJhT2JqZWN0cyIsImFSb2xlcyIsImZpbHRlciIsImRpbWVuc2lvbiIsInJvbGUiLCJnZXRTY2F0dGVyQnViYmxlQ2hhcnRGZWVkcyIsImF4aXMxTWVhc3VyZXMiLCJheGlzMk1lYXN1cmVzIiwiYXhpczNNZWFzdXJlcyIsIm90aGVyTWVhc3VyZXMiLCJzZXJpZXNEaW1lbnNpb25zIiwic2hhcGVEaW1lbnNpb24iLCJmaW5kIiwieE1lYXN1cmUiLCJzaGlmdCIsInlNZWFzdXJlIiwidWlkIiwidmFsdWVzIiwic2l6ZU1lYXN1cmUiLCJwdXNoIiwiZ2V0Q2hhcnRGZWVkcyIsImdldE5hdmlnYXRpb25QYXJhbWV0ZXJzIiwibmF2SW5mbyIsIm9TaGVsbFNlcnZpY2UiLCJzZW1hbnRpY09iamVjdCIsImFjdGlvbiIsImdldExpbmtzIiwidGhlbiIsImFMaW5rcyIsImdldFByaW1hcnlJbnRlbnQiLCJvTGluayIsIm9JbmZvIiwicGFyc2VTaGVsbEhhc2giLCJpbnRlbnQiLCJ1bmF2YWlsYWJsZUFjdGlvbnMiLCJvdXRib3VuZE5hdmlnYXRpb24iLCJQcm9taXNlIiwicmVzb2x2ZSIsIm91dGJvdW5kIiwiS1BJTWFuYWdlbWVudENvbnRyb2xsZXJFeHRlbnNpb24iLCJkZWZpbmVVSTVDbGFzcyIsIm1ldGhvZE92ZXJyaWRlIiwicHVibGljRXh0ZW5zaW9uIiwiaW5pdENhcmRNYW5pZmVzdCIsImtwaURlZmluaXRpb24iLCJvS1BJTW9kZWwiLCJvQ2FyZE1hbmlmZXN0IiwiaWQiLCJ0ZWNobm9sb2d5IiwiZGF0YSIsImpzb24iLCJoZWFkZXIiLCJkYXRhcG9pbnQiLCJzdWJUaXRsZSIsImRlc2NyaXB0aW9uIiwidW5pdE9mTWVhc3VyZW1lbnQiLCJtYWluSW5kaWNhdG9yIiwibnVtYmVyIiwidW5pdCIsInN0YXRlIiwidHJlbmQiLCJjb250ZW50IiwibWluSGVpZ2h0IiwiY2hhcnRQcm9wZXJ0aWVzIiwicGF0aCIsInRhcmdldFBhdGgiLCJ0YXJnZXRWYWx1ZSIsInNpZGVJbmRpY2F0b3JzIiwic2VsZWN0aW9uVmFyaWFudEZpbHRlckRlZmluaXRpb25zIiwiYURlc2NyaXB0aW9ucyIsImZvckVhY2giLCJkZXNjIiwiZGV0YWlscyIsInRleHQiLCJ2YWx1ZSIsIm5hbWUiLCJtZWFzdXJlIiwiZmVlZHMiLCJzZXRQcm9wZXJ0eSIsIm1hbmlmZXN0IiwiaW5pdE5hdmlnYXRpb25JbmZvIiwibmF2aWdhdGlvbiIsIm9OYXZJbmZvIiwicGFyYW1ldGVycyIsIm9uSW5pdCIsImFLUElEZWZpbml0aW9ucyIsImdldFZpZXciLCJnZXRDb250cm9sbGVyIiwiX2dldFBhZ2VNb2RlbCIsImdldFByb3BlcnR5Iiwib1ZpZXciLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50IiwiSlNPTk1vZGVsIiwic2V0TW9kZWwiLCJnZXRTaGVsbFNlcnZpY2VzIiwiY2F0Y2giLCJlcnIiLCJMb2ciLCJlcnJvciIsImxvYWRLUElUYWdEYXRhIiwiZ2V0TW9kZWwiLCJvbkV4aXQiLCJkZXN0cm95IiwidXBkYXRlRGF0YXBvaW50VmFsdWVBbmRDdXJyZW5jeSIsImtwaUNvbnRleHQiLCJyYXdVbml0IiwiaXNQYXRoIiwiaXNQZXJjZW50YWdlIiwiaXNDdXJyZW5jeSIsInJhd1ZhbHVlIiwiTnVtYmVyIiwicGFyc2VGbG9hdCIsIk51bWJlckZvcm1hdCIsImdldEZsb2F0SW5zdGFuY2UiLCJtaW5GcmFjdGlvbkRpZ2l0cyIsIm1heEZyYWN0aW9uRGlnaXRzIiwic2hvd1NjYWxlIiwia3BpVmFsdWVVbnNjYWxlZCIsImdyb3VwaW5nRW5hYmxlZCIsImtwaVZhbHVlTm9TY2FsZSIsImtwaVZhbHVlU2NhbGUiLCJkZWNpbWFscyIsIm1heEludGVnZXJEaWdpdHMiLCJrcGlVbml0IiwiZ2V0VW5pdEluc3RhbmNlIiwic2hvd051bWJlciIsInVwZGF0ZURhdGFwb2ludENyaXRpY2FsaXR5IiwiY3JpdGljYWxpdHlWYWx1ZSIsImNyaXRpY2FsaXR5UGF0aCIsImNyaXRpY2FsaXR5Q2FsY3VsYXRpb25UaHJlc2hvbGRzIiwiY3JpdGljYWxpdHlDYWxjdWxhdGlvbk1vZGUiLCJ1cGRhdGVEYXRhcG9pbnRUcmVuZCIsInRyZW5kUGF0aCIsInRyZW5kQ2FsY3VsYXRpb25SZWZlcmVuY2VWYWx1ZSIsInRyZW5kQ2FsY3VsYXRpb25SZWZlcmVuY2VQYXRoIiwidHJlbmRSZWZlcmVuY2VWYWx1ZSIsInRyZW5kQ2FsY3VsYXRpb25Jc1JlbGF0aXZlIiwidHJlbmRDYWxjdWxhdGlvblRyZXNob2xkcyIsInVwZGF0ZVRhcmdldFZhbHVlIiwidGFyZ2V0UmF3VmFsdWUiLCJkZXZpYXRpb25SYXdWYWx1ZSIsInRhcmdldFNjYWxlIiwiZGV2aWF0aW9uVmFsdWUiLCJvTWFpbk1vZGVsIiwibG9hZEZ1bGwiLCJvTGlzdEJpbmRpbmciLCJiaW5kTGlzdCIsImVudGl0eVNldCIsIiQkZ3JvdXBJZCIsIm9BZ2dyZWdhdGUiLCJzZXRBZ2dyZWdhdGlvbiIsImFnZ3JlZ2F0ZSIsImFGaWx0ZXJzIiwicmVxdWVzdENvbnRleHRzIiwiYUNvbnRleHRzIiwibG9hZEtQSUNhcmREYXRhIiwib0dyb3VwIiwiZ3JvdXAiLCJzb3J0T3JkZXIiLCJzb3J0Iiwic29ydEluZm8iLCJTb3J0ZXIiLCJkZXNjZW5kaW5nIiwibWF4SXRlbXMiLCJjaGFydERhdGEiLCJvQ29udGV4dCIsIm9EYXRhIiwiZ2V0UG9wb3ZlciIsIm9LUElUYWciLCJvUG9wb3ZlciIsInJlamVjdCIsImxvYWRMaWJyYXJ5IiwiYXN5bmMiLCJyZXF1aXJlIiwiQ2FyZCIsIkhvc3QiLCJvSG9zdCIsImF0dGFjaEFjdGlvbiIsIm9FdmVudCIsInNUeXBlIiwiZ2V0UGFyYW1ldGVyIiwib1BhcmFtcyIsIl9pbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJuYXZpZ2F0ZSIsIm5hdmlnYXRlT3V0Ym91bmQiLCJvQ2FyZCIsIndpZHRoIiwiaGVpZ2h0Iiwic2V0SG9zdCIsIlBvcG92ZXIiLCJzaG93SGVhZGVyIiwicGxhY2VtZW50IiwiYWRkRGVwZW5kZW50Iiwib25LUElQcmVzc2VkIiwia3BpSUQiLCJvRGVmIiwib01vZGVsIiwiYVByb21pc2VzIiwiYWxsIiwiYVJlc3VsdHMiLCJzZXRNYW5pZmVzdCIsInJlZnJlc2giLCJvcGVuQnkiLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJLUElNYW5hZ2VtZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQmFzZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL0Jhc2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSB7IEtQSUNoYXJ0RGVmaW5pdGlvbiwgS1BJRGVmaW5pdGlvbiwgTmF2aWdhdGlvbkluZm8gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vS1BJXCI7XG5pbXBvcnQgdHlwZSB7IEZpbHRlckRlZmluaXRpb24sIFJhbmdlRGVmaW5pdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvU2VsZWN0aW9uVmFyaWFudEhlbHBlclwiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9UYWJsZUZvcm1hdHRlclR5cGVzXCI7XG5pbXBvcnQgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSBHZW5lcmljVGFnIGZyb20gXCJzYXAvbS9HZW5lcmljVGFnXCI7XG5pbXBvcnQgUG9wb3ZlciBmcm9tIFwic2FwL20vUG9wb3ZlclwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBEYXRlRm9ybWF0IGZyb20gXCJzYXAvdWkvY29yZS9mb3JtYXQvRGF0ZUZvcm1hdFwiO1xuaW1wb3J0IE51bWJlckZvcm1hdCBmcm9tIFwic2FwL3VpL2NvcmUvZm9ybWF0L051bWJlckZvcm1hdFwiO1xuaW1wb3J0IExvY2FsZSBmcm9tIFwic2FwL3VpL2NvcmUvTG9jYWxlXCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCB0eXBlIEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgU29ydGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvU29ydGVyXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgbWV0aG9kT3ZlcnJpZGUsIHB1YmxpY0V4dGVuc2lvbiB9IGZyb20gXCIuLi9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuXG5jb25zdCBNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eTogUmVjb3JkPHN0cmluZywgTWVzc2FnZVR5cGU+ID0ge1xuXHRcIjFcIjogTWVzc2FnZVR5cGUuRXJyb3IsXG5cdFwiMlwiOiBNZXNzYWdlVHlwZS5XYXJuaW5nLFxuXHRcIjNcIjogTWVzc2FnZVR5cGUuU3VjY2Vzcyxcblx0XCI1XCI6IE1lc3NhZ2VUeXBlLkluZm9ybWF0aW9uXG59O1xuXG5jb25zdCBWYWx1ZUNvbG9yRnJvbU1lc3NhZ2VUeXBlOiBSZWNvcmQ8TWVzc2FnZVR5cGUsIHN0cmluZz4gPSB7XG5cdEVycm9yOiBcIkVycm9yXCIsXG5cdFdhcm5pbmc6IFwiQ3JpdGljYWxcIixcblx0U3VjY2VzczogXCJHb29kXCIsXG5cdEluZm9ybWF0aW9uOiBcIk5vbmVcIixcblx0Tm9uZTogXCJOb25lXCJcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZ2V0IGEgbWVzc2FnZSBzdGF0ZSBmcm9tIGEgY2FsY3VsYXRlZCBjcml0aWNhbGl0eSBvZiB0eXBlICdUYXJnZXQnLlxuICpcbiAqIEBwYXJhbSBrcGlWYWx1ZSBUaGUgdmFsdWUgb2YgdGhlIEtQSSB0byBiZSB0ZXN0ZWQgYWdhaW5zdC5cbiAqIEBwYXJhbSBhVGhyZXNob2xkcyBUaHJlc2hvbGRzIHRvIGJlIHVzZWQgW0RldmlhdGlvblJhbmdlTG93VmFsdWUsVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZSxBY2NlcHRhbmNlUmFuZ2VMb3dWYWx1ZSxBY2NlcHRhbmNlUmFuZ2VIaWdoVmFsdWUsVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUsRGV2aWF0aW9uUmFuZ2VIaWdoVmFsdWVdLlxuICogQHJldHVybnMgVGhlIGNvcnJlc3BvbmRpbmcgTWVzc2FnZVR5cGVcbiAqL1xuZnVuY3Rpb24gbWVzc2FnZVR5cGVGcm9tVGFyZ2V0Q2FsY3VsYXRpb24oa3BpVmFsdWU6IG51bWJlciwgYVRocmVzaG9sZHM6IChudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsKVtdKTogTWVzc2FnZVR5cGUge1xuXHRsZXQgY3JpdGljYWxpdHlQcm9wZXJ0eTogTWVzc2FnZVR5cGU7XG5cblx0aWYgKGFUaHJlc2hvbGRzWzBdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMF0gIT09IG51bGwgJiYga3BpVmFsdWUgPCBhVGhyZXNob2xkc1swXSkge1xuXHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5FcnJvcjtcblx0fSBlbHNlIGlmIChhVGhyZXNob2xkc1sxXSAhPT0gdW5kZWZpbmVkICYmIGFUaHJlc2hvbGRzWzFdICE9PSBudWxsICYmIGtwaVZhbHVlIDwgYVRocmVzaG9sZHNbMV0pIHtcblx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuV2FybmluZztcblx0fSBlbHNlIGlmIChhVGhyZXNob2xkc1syXSAhPT0gdW5kZWZpbmVkICYmIGFUaHJlc2hvbGRzWzJdICE9PSBudWxsICYmIGtwaVZhbHVlIDwgYVRocmVzaG9sZHNbMl0pIHtcblx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuTm9uZTtcblx0fSBlbHNlIGlmIChhVGhyZXNob2xkc1s1XSAhPT0gdW5kZWZpbmVkICYmIGFUaHJlc2hvbGRzWzVdICE9PSBudWxsICYmIGtwaVZhbHVlID4gYVRocmVzaG9sZHNbNV0pIHtcblx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuRXJyb3I7XG5cdH0gZWxzZSBpZiAoYVRocmVzaG9sZHNbNF0gIT09IHVuZGVmaW5lZCAmJiBhVGhyZXNob2xkc1s0XSAhPT0gbnVsbCAmJiBrcGlWYWx1ZSA+IGFUaHJlc2hvbGRzWzRdKSB7XG5cdFx0Y3JpdGljYWxpdHlQcm9wZXJ0eSA9IE1lc3NhZ2VUeXBlLldhcm5pbmc7XG5cdH0gZWxzZSBpZiAoYVRocmVzaG9sZHNbM10gIT09IHVuZGVmaW5lZCAmJiBhVGhyZXNob2xkc1szXSAhPT0gbnVsbCAmJiBrcGlWYWx1ZSA+IGFUaHJlc2hvbGRzWzNdKSB7XG5cdFx0Y3JpdGljYWxpdHlQcm9wZXJ0eSA9IE1lc3NhZ2VUeXBlLk5vbmU7XG5cdH0gZWxzZSB7XG5cdFx0Y3JpdGljYWxpdHlQcm9wZXJ0eSA9IE1lc3NhZ2VUeXBlLlN1Y2Nlc3M7XG5cdH1cblxuXHRyZXR1cm4gY3JpdGljYWxpdHlQcm9wZXJ0eTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBnZXQgYSBtZXNzYWdlIHN0YXRlIGZyb20gYSBjYWxjdWxhdGVkIGNyaXRpY2FsaXR5IG9mIHR5cGUgJ01pbmltaXplJy5cbiAqXG4gKiBAcGFyYW0ga3BpVmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBLUEkgdG8gYmUgdGVzdGVkIGFnYWluc3QuXG4gKiBAcGFyYW0gYVRocmVzaG9sZHMgVGhyZXNob2xkcyB0byBiZSB1c2VkIFtBY2NlcHRhbmNlUmFuZ2VIaWdoVmFsdWUsVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUsRGV2aWF0aW9uUmFuZ2VIaWdoVmFsdWVdLlxuICogQHJldHVybnMgVGhlIGNvcnJlc3BvbmRpbmcgTWVzc2FnZVR5cGVcbiAqL1xuZnVuY3Rpb24gbWVzc2FnZVR5cGVGcm9tTWluaW1pemVDYWxjdWxhdGlvbihrcGlWYWx1ZTogbnVtYmVyLCBhVGhyZXNob2xkczogKG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwpW10pOiBNZXNzYWdlVHlwZSB7XG5cdGxldCBjcml0aWNhbGl0eVByb3BlcnR5OiBNZXNzYWdlVHlwZTtcblxuXHRpZiAoYVRocmVzaG9sZHNbMl0gIT09IHVuZGVmaW5lZCAmJiBhVGhyZXNob2xkc1syXSAhPT0gbnVsbCAmJiBrcGlWYWx1ZSA+IGFUaHJlc2hvbGRzWzJdKSB7XG5cdFx0Y3JpdGljYWxpdHlQcm9wZXJ0eSA9IE1lc3NhZ2VUeXBlLkVycm9yO1xuXHR9IGVsc2UgaWYgKGFUaHJlc2hvbGRzWzFdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMV0gIT09IG51bGwgJiYga3BpVmFsdWUgPiBhVGhyZXNob2xkc1sxXSkge1xuXHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5XYXJuaW5nO1xuXHR9IGVsc2UgaWYgKGFUaHJlc2hvbGRzWzBdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMF0gIT09IG51bGwgJiYga3BpVmFsdWUgPiBhVGhyZXNob2xkc1swXSkge1xuXHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5Ob25lO1xuXHR9IGVsc2Uge1xuXHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5TdWNjZXNzO1xuXHR9XG5cblx0cmV0dXJuIGNyaXRpY2FsaXR5UHJvcGVydHk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZ2V0IGEgbWVzc2FnZSBzdGF0ZSBmcm9tIGEgY2FsY3VsYXRlZCBjcml0aWNhbGl0eSBvZiB0eXBlICdNYXhpbWl6ZScuXG4gKlxuICogQHBhcmFtIGtwaVZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgS1BJIHRvIGJlIHRlc3RlZCBhZ2FpbnN0LlxuICogQHBhcmFtIGFUaHJlc2hvbGRzIFRocmVzaG9sZHMgdG8gYmUgdXNlZCBbRGV2aWF0aW9uUmFuZ2VMb3dWYWx1ZSxUb2xlcmFuY2VSYW5nZUxvd1ZhbHVlLEFjY2VwdGFuY2VSYW5nZUxvd1ZhbHVlXS5cbiAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIE1lc3NhZ2VUeXBlXG4gKi9cbmZ1bmN0aW9uIG1lc3NhZ2VUeXBlRnJvbU1heGltaXplQ2FsY3VsYXRpb24oa3BpVmFsdWU6IG51bWJlciwgYVRocmVzaG9sZHM6IChudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsKVtdKTogTWVzc2FnZVR5cGUge1xuXHRsZXQgY3JpdGljYWxpdHlQcm9wZXJ0eTogTWVzc2FnZVR5cGU7XG5cblx0aWYgKGFUaHJlc2hvbGRzWzBdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMF0gIT09IG51bGwgJiYga3BpVmFsdWUgPCBhVGhyZXNob2xkc1swXSkge1xuXHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5FcnJvcjtcblx0fSBlbHNlIGlmIChhVGhyZXNob2xkc1sxXSAhPT0gdW5kZWZpbmVkICYmIGFUaHJlc2hvbGRzWzFdICE9PSBudWxsICYmIGtwaVZhbHVlIDwgYVRocmVzaG9sZHNbMV0pIHtcblx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuV2FybmluZztcblx0fSBlbHNlIGlmIChhVGhyZXNob2xkc1syXSAhPT0gdW5kZWZpbmVkICYmIGFUaHJlc2hvbGRzWzJdICE9PSBudWxsICYmIGtwaVZhbHVlIDwgYVRocmVzaG9sZHNbMl0pIHtcblx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuTm9uZTtcblx0fSBlbHNlIHtcblx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuU3VjY2Vzcztcblx0fVxuXG5cdHJldHVybiBjcml0aWNhbGl0eVByb3BlcnR5O1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNhbGN1bGF0ZSBhIERldmlhdGlvbkluZGljYXRvciB2YWx1ZSBmcm9tIGEgdHJlbmQgdmFsdWUuXG4gKlxuICogQHBhcmFtIHRyZW5kVmFsdWUgVGhlIGNyaXRpY2FsaXR5IHZhbHVlcy5cbiAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIERldmlhdGlvbkluZGljYXRvciB2YWx1ZVxuICovXG5mdW5jdGlvbiBkZXZpYXRpb25JbmRpY2F0b3JGcm9tVHJlbmRUeXBlKHRyZW5kVmFsdWU6IG51bWJlciB8IHN0cmluZyk6IHN0cmluZyB7XG5cdGxldCBkZXZpYXRpb25JbmRpY2F0b3I6IHN0cmluZztcblxuXHRzd2l0Y2ggKHRyZW5kVmFsdWUpIHtcblx0XHRjYXNlIDE6IC8vIFN0cm9uZ1VwXG5cdFx0Y2FzZSBcIjFcIjpcblx0XHRjYXNlIDI6IC8vIFVwXG5cdFx0Y2FzZSBcIjJcIjpcblx0XHRcdGRldmlhdGlvbkluZGljYXRvciA9IFwiVXBcIjtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSA0OiAvLyBEb3duXG5cdFx0Y2FzZSBcIjRcIjpcblx0XHRjYXNlIDU6IC8vIFN0cm9uZ0Rvd25cblx0XHRjYXNlIFwiNVwiOlxuXHRcdFx0ZGV2aWF0aW9uSW5kaWNhdG9yID0gXCJEb3duXCI7XG5cdFx0XHRicmVhaztcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRkZXZpYXRpb25JbmRpY2F0b3IgPSBcIk5vbmVcIjtcblx0fVxuXG5cdHJldHVybiBkZXZpYXRpb25JbmRpY2F0b3I7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2FsY3VsYXRlIGEgRGV2aWF0aW9uSW5kaWNhdG9yIGZyb20gYSBUcmVuZENhbGN1bGF0aW9uLlxuICpcbiAqIEBwYXJhbSBrcGlWYWx1ZSBUaGUgdmFsdWUgb2YgdGhlIEtQSVxuICogQHBhcmFtIHJlZmVyZW5jZVZhbHVlIFRoZSByZWZlcmVuY2UgdmFsdWUgdG8gY29tcGFyZSB3aXRoXG4gKiBAcGFyYW0gaXNSZWxhdGl2ZSBUcnVlIGlzIHRoZSBjb21wYXJpc29uIGlzIHJlbGF0aXZlXG4gKiBAcGFyYW0gYVRocmVzaG9sZHMgQXJyYXkgb2YgdGhyZXNob2xkcyBbU3Ryb25nRG93bkRpZmZlcmVuY2UsIERvd25EaWZmZXJlbmNlLCBVcERpZmZlcmVuY2UsIFN0cm9uZ1VwRGlmZmVyZW5jZV1cbiAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIERldmlhdGlvbkluZGljYXRvciB2YWx1ZVxuICovXG5mdW5jdGlvbiBkZXZpYXRpb25JbmRpY2F0b3JGcm9tQ2FsY3VsYXRpb24oXG5cdGtwaVZhbHVlOiBudW1iZXIsXG5cdHJlZmVyZW5jZVZhbHVlOiBudW1iZXIsXG5cdGlzUmVsYXRpdmU6IGJvb2xlYW4sXG5cdGFUaHJlc2hvbGRzOiAobnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbClbXSB8IHVuZGVmaW5lZFxuKTogc3RyaW5nIHtcblx0bGV0IGRldmlhdGlvbkluZGljYXRvcjogc3RyaW5nO1xuXG5cdGlmICghYVRocmVzaG9sZHMgfHwgKGlzUmVsYXRpdmUgJiYgIXJlZmVyZW5jZVZhbHVlKSkge1xuXHRcdHJldHVybiBcIk5vbmVcIjtcblx0fVxuXG5cdGNvbnN0IGNvbXBWYWx1ZSA9IGlzUmVsYXRpdmUgPyAoa3BpVmFsdWUgLSByZWZlcmVuY2VWYWx1ZSkgLyByZWZlcmVuY2VWYWx1ZSA6IGtwaVZhbHVlIC0gcmVmZXJlbmNlVmFsdWU7XG5cblx0aWYgKGFUaHJlc2hvbGRzWzBdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMF0gIT09IG51bGwgJiYgY29tcFZhbHVlIDw9IGFUaHJlc2hvbGRzWzBdKSB7XG5cdFx0Ly8gU3Ryb25nRG93biAtLT4gRG93blxuXHRcdGRldmlhdGlvbkluZGljYXRvciA9IFwiRG93blwiO1xuXHR9IGVsc2UgaWYgKGFUaHJlc2hvbGRzWzFdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMV0gIT09IG51bGwgJiYgY29tcFZhbHVlIDw9IGFUaHJlc2hvbGRzWzFdKSB7XG5cdFx0Ly8gRG93biAtLT4gRG93blxuXHRcdGRldmlhdGlvbkluZGljYXRvciA9IFwiRG93blwiO1xuXHR9IGVsc2UgaWYgKGFUaHJlc2hvbGRzWzNdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbM10gIT09IG51bGwgJiYgY29tcFZhbHVlID49IGFUaHJlc2hvbGRzWzNdKSB7XG5cdFx0Ly8gU3Ryb25nVXAgLS0+IFVwXG5cdFx0ZGV2aWF0aW9uSW5kaWNhdG9yID0gXCJVcFwiO1xuXHR9IGVsc2UgaWYgKGFUaHJlc2hvbGRzWzJdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMl0gIT09IG51bGwgJiYgY29tcFZhbHVlID49IGFUaHJlc2hvbGRzWzJdKSB7XG5cdFx0Ly8gVXAgLS0+IFVwXG5cdFx0ZGV2aWF0aW9uSW5kaWNhdG9yID0gXCJVcFwiO1xuXHR9IGVsc2Uge1xuXHRcdC8vIFNpZGV3YXlzIC0tPiBOb25lXG5cdFx0ZGV2aWF0aW9uSW5kaWNhdG9yID0gXCJOb25lXCI7XG5cdH1cblxuXHRyZXR1cm4gZGV2aWF0aW9uSW5kaWNhdG9yO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBzYXAudWkubW9kZWwuRmlsdGVyIGZyb20gYSBmaWx0ZXIgZGVmaW5pdGlvbi5cbiAqXG4gKiBAcGFyYW0gZmlsdGVyRGVmaW5pdGlvbiBUaGUgZmlsdGVyIGRlZmluaXRpb25cbiAqIEByZXR1cm5zIFJldHVybnMgYSBzYXAudWkubW9kZWwuRmlsdGVyIGZyb20gdGhlIGRlZmluaXRpb24sIG9yIHVuZGVmaW5lZCBpZiB0aGUgZGVmaW5pdGlvbiBpcyBlbXB0eSAobm8gcmFuZ2VzKVxuICovXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJGcm9tRGVmaW5pdGlvbihmaWx0ZXJEZWZpbml0aW9uOiBGaWx0ZXJEZWZpbml0aW9uKTogRmlsdGVyIHwgdW5kZWZpbmVkIHtcblx0aWYgKGZpbHRlckRlZmluaXRpb24ucmFuZ2VzLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0gZWxzZSBpZiAoZmlsdGVyRGVmaW5pdGlvbi5yYW5nZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIG5ldyBGaWx0ZXIoXG5cdFx0XHRmaWx0ZXJEZWZpbml0aW9uLnByb3BlcnR5UGF0aCxcblx0XHRcdGZpbHRlckRlZmluaXRpb24ucmFuZ2VzWzBdLm9wZXJhdG9yIGFzIEZpbHRlck9wZXJhdG9yLFxuXHRcdFx0ZmlsdGVyRGVmaW5pdGlvbi5yYW5nZXNbMF0ucmFuZ2VMb3csXG5cdFx0XHRmaWx0ZXJEZWZpbml0aW9uLnJhbmdlc1swXS5yYW5nZUhpZ2hcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IGFSYW5nZUZpbHRlcnMgPSBmaWx0ZXJEZWZpbml0aW9uLnJhbmdlcy5tYXAoKHJhbmdlKSA9PiB7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbHRlcihmaWx0ZXJEZWZpbml0aW9uLnByb3BlcnR5UGF0aCwgcmFuZ2Uub3BlcmF0b3IgYXMgRmlsdGVyT3BlcmF0b3IsIHJhbmdlLnJhbmdlTG93LCByYW5nZS5yYW5nZUhpZ2gpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBuZXcgRmlsdGVyKHtcblx0XHRcdGZpbHRlcnM6IGFSYW5nZUZpbHRlcnMsXG5cdFx0XHRhbmQ6IGZhbHNlXG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RmlsdGVyU3RyaW5nRnJvbURlZmluaXRpb24oZmlsdGVyRGVmaW5pdGlvbjogRmlsdGVyRGVmaW5pdGlvbik6IHN0cmluZyB7XG5cdGNvbnN0IGN1cnJlbnRMb2NhbGUgPSBuZXcgTG9jYWxlKHNhcC51aS5nZXRDb3JlKCkuZ2V0Q29uZmlndXJhdGlvbigpLmdldExhbmd1YWdlKCkpO1xuXHRjb25zdCByZXNCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRjb25zdCBkYXRlRm9ybWF0ID0gRGF0ZUZvcm1hdC5nZXREYXRlSW5zdGFuY2UoeyBzdHlsZTogXCJtZWRpdW1cIiB9LCBjdXJyZW50TG9jYWxlKTtcblxuXHRmdW5jdGlvbiBmb3JtYXRSYW5nZShyYW5nZTogUmFuZ2VEZWZpbml0aW9uKTogc3RyaW5nIHtcblx0XHRjb25zdCB2YWx1ZUxvdyA9XG5cdFx0XHRmaWx0ZXJEZWZpbml0aW9uLnByb3BlcnR5VHlwZS5pbmRleE9mKFwiRWRtLkRhdGVcIikgPT09IDAgPyBkYXRlRm9ybWF0LmZvcm1hdChuZXcgRGF0ZShyYW5nZS5yYW5nZUxvdykpIDogcmFuZ2UucmFuZ2VMb3c7XG5cdFx0Y29uc3QgdmFsdWVIaWdoID1cblx0XHRcdGZpbHRlckRlZmluaXRpb24ucHJvcGVydHlUeXBlLmluZGV4T2YoXCJFZG0uRGF0ZVwiKSA9PT0gMCA/IGRhdGVGb3JtYXQuZm9ybWF0KG5ldyBEYXRlKHJhbmdlLnJhbmdlSGlnaCkpIDogcmFuZ2UucmFuZ2VIaWdoO1xuXG5cdFx0c3dpdGNoIChyYW5nZS5vcGVyYXRvcikge1xuXHRcdFx0Y2FzZSBcIkJUXCI6XG5cdFx0XHRcdHJldHVybiBgWyR7dmFsdWVMb3d9IC0gJHt2YWx1ZUhpZ2h9XWA7XG5cblx0XHRcdGNhc2UgXCJDb250YWluc1wiOlxuXHRcdFx0XHRyZXR1cm4gYCoke3ZhbHVlTG93fSpgO1xuXG5cdFx0XHRjYXNlIFwiR0VcIjpcblx0XHRcdFx0cmV0dXJuIGBcXHUyMjY1JHt2YWx1ZUxvd31gO1xuXG5cdFx0XHRjYXNlIFwiR1RcIjpcblx0XHRcdFx0cmV0dXJuIGA+JHt2YWx1ZUxvd31gO1xuXG5cdFx0XHRjYXNlIFwiTEVcIjpcblx0XHRcdFx0cmV0dXJuIGBcXHUyMjY0JHt2YWx1ZUxvd31gO1xuXG5cdFx0XHRjYXNlIFwiTFRcIjpcblx0XHRcdFx0cmV0dXJuIGA8JHt2YWx1ZUxvd31gO1xuXG5cdFx0XHRjYXNlIFwiTkJcIjpcblx0XHRcdFx0cmV0dXJuIHJlc0J1bmRsZS5nZXRUZXh0KFwiQ19LUElDQVJEX0ZJTFRFUlNUUklOR19OT1RcIiwgW2BbJHt2YWx1ZUxvd30gLSAke3ZhbHVlSGlnaH1dYF0pO1xuXG5cdFx0XHRjYXNlIFwiTkVcIjpcblx0XHRcdFx0cmV0dXJuIGBcXHUyMjYwJHt2YWx1ZUxvd31gO1xuXG5cdFx0XHRjYXNlIFwiTm90Q29udGFpbnNcIjpcblx0XHRcdFx0cmV0dXJuIHJlc0J1bmRsZS5nZXRUZXh0KFwiQ19LUElDQVJEX0ZJTFRFUlNUUklOR19OT1RcIiwgW2AqJHt2YWx1ZUxvd30qYF0pO1xuXG5cdFx0XHRjYXNlIFwiRVFcIjpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiB2YWx1ZUxvdztcblx0XHR9XG5cdH1cblx0aWYgKGZpbHRlckRlZmluaXRpb24ucmFuZ2VzLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9IGVsc2UgaWYgKGZpbHRlckRlZmluaXRpb24ucmFuZ2VzLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBmb3JtYXRSYW5nZShmaWx0ZXJEZWZpbml0aW9uLnJhbmdlc1swXSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGAoJHtmaWx0ZXJEZWZpbml0aW9uLnJhbmdlcy5tYXAoZm9ybWF0UmFuZ2UpLmpvaW4oXCIsXCIpfSlgO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGZvcm1hdENoYXJ0VGl0bGUoa3BpRGVmOiBLUElEZWZpbml0aW9uKTogc3RyaW5nIHtcblx0Y29uc3QgcmVzQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblxuXHRmdW5jdGlvbiBmb3JtYXRMaXN0KGl0ZW1zOiB7IG5hbWU6IHN0cmluZzsgbGFiZWw6IHN0cmluZyB9W10pIHtcblx0XHRpZiAoaXRlbXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9IGVsc2UgaWYgKGl0ZW1zLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIGl0ZW1zWzBdLmxhYmVsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgcmVzID0gaXRlbXNbMF0ubGFiZWw7XG5cdFx0XHRmb3IgKGxldCBJID0gMTsgSSA8IGl0ZW1zLmxlbmd0aCAtIDE7IEkrKykge1xuXHRcdFx0XHRyZXMgKz0gYCwgJHtpdGVtc1tJXS5sYWJlbH1gO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzQnVuZGxlLmdldFRleHQoXCJDX0tQSUNBUkRfSVRFTVNMSVNUXCIsIFtyZXMsIGl0ZW1zW2l0ZW1zLmxlbmd0aCAtIDFdLmxhYmVsXSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHJlc0J1bmRsZS5nZXRUZXh0KFwiQ19LUElDQVJEX0NIQVJUVElUTEVcIiwgW2Zvcm1hdExpc3Qoa3BpRGVmLmNoYXJ0Lm1lYXN1cmVzKSwgZm9ybWF0TGlzdChrcGlEZWYuY2hhcnQuZGltZW5zaW9ucyldKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ2hhcnRMYWJlbFNldHRpbmdzKGNoYXJ0RGVmaW5pdGlvbjogS1BJQ2hhcnREZWZpbml0aW9uLCBvQ2hhcnRQcm9wZXJ0aWVzOiBhbnkpOiB2b2lkIHtcblx0c3dpdGNoIChjaGFydERlZmluaXRpb24uY2hhcnRUeXBlKSB7XG5cdFx0Y2FzZSBcIkRvbnV0XCI6XG5cdFx0XHQvLyBTaG93IGRhdGEgbGFiZWxzLCBkbyBub3Qgc2hvdyBheGlzIHRpdGxlc1xuXHRcdFx0b0NoYXJ0UHJvcGVydGllcy5jYXRlZ29yeUF4aXMgPSB7XG5cdFx0XHRcdHRpdGxlOiB7XG5cdFx0XHRcdFx0dmlzaWJsZTogZmFsc2Vcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdG9DaGFydFByb3BlcnRpZXMudmFsdWVBeGlzID0ge1xuXHRcdFx0XHR0aXRsZToge1xuXHRcdFx0XHRcdHZpc2libGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGxhYmVsOiB7XG5cdFx0XHRcdFx0Zm9ybWF0U3RyaW5nOiBcIlNob3J0RmxvYXRcIlxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0b0NoYXJ0UHJvcGVydGllcy5wbG90QXJlYS5kYXRhTGFiZWwgPSB7XG5cdFx0XHRcdHZpc2libGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6IFwidmFsdWVcIixcblx0XHRcdFx0Zm9ybWF0U3RyaW5nOiBcIlNob3J0RmxvYXRfTUZEMlwiXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFwiYnViYmxlXCI6XG5cdFx0XHQvLyBTaG93IGF4aXMgdGl0bGUsIGJ1YmJsZSBzaXplIGxlZ2VuZCwgZG8gbm90IHNob3cgZGF0YSBsYWJlbHNcblx0XHRcdG9DaGFydFByb3BlcnRpZXMudmFsdWVBeGlzID0ge1xuXHRcdFx0XHR0aXRsZToge1xuXHRcdFx0XHRcdHZpc2libGU6IHRydWVcblx0XHRcdFx0fSxcblx0XHRcdFx0bGFiZWw6IHtcblx0XHRcdFx0XHRmb3JtYXRTdHJpbmc6IFwiU2hvcnRGbG9hdFwiXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRvQ2hhcnRQcm9wZXJ0aWVzLnZhbHVlQXhpczIgPSB7XG5cdFx0XHRcdHRpdGxlOiB7XG5cdFx0XHRcdFx0dmlzaWJsZTogdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRsYWJlbDoge1xuXHRcdFx0XHRcdGZvcm1hdFN0cmluZzogXCJTaG9ydEZsb2F0XCJcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdG9DaGFydFByb3BlcnRpZXMubGVnZW5kR3JvdXAgPSB7XG5cdFx0XHRcdGxheW91dDoge1xuXHRcdFx0XHRcdHBvc2l0aW9uOiBcImJvdHRvbVwiLFxuXHRcdFx0XHRcdGFsaWdubWVudDogXCJ0b3BMZWZ0XCJcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdG9DaGFydFByb3BlcnRpZXMuc2l6ZUxlZ2VuZCA9IHtcblx0XHRcdFx0dmlzaWJsZTogdHJ1ZVxuXHRcdFx0fTtcblx0XHRcdG9DaGFydFByb3BlcnRpZXMucGxvdEFyZWEuZGF0YUxhYmVsID0geyB2aXNpYmxlOiBmYWxzZSB9O1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFwic2NhdHRlclwiOlxuXHRcdFx0Ly8gRG8gbm90IHNob3cgZGF0YSBsYWJlbHMgYW5kIGF4aXMgdGl0bGVzXG5cdFx0XHRvQ2hhcnRQcm9wZXJ0aWVzLnZhbHVlQXhpcyA9IHtcblx0XHRcdFx0dGl0bGU6IHtcblx0XHRcdFx0XHR2aXNpYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRsYWJlbDoge1xuXHRcdFx0XHRcdGZvcm1hdFN0cmluZzogXCJTaG9ydEZsb2F0XCJcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdG9DaGFydFByb3BlcnRpZXMudmFsdWVBeGlzMiA9IHtcblx0XHRcdFx0dGl0bGU6IHtcblx0XHRcdFx0XHR2aXNpYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRsYWJlbDoge1xuXHRcdFx0XHRcdGZvcm1hdFN0cmluZzogXCJTaG9ydEZsb2F0XCJcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdG9DaGFydFByb3BlcnRpZXMucGxvdEFyZWEuZGF0YUxhYmVsID0geyB2aXNpYmxlOiBmYWxzZSB9O1xuXHRcdFx0YnJlYWs7XG5cblx0XHRkZWZhdWx0OlxuXHRcdFx0Ly8gRG8gbm90IHNob3cgZGF0YSBsYWJlbHMgYW5kIGF4aXMgdGl0bGVzXG5cdFx0XHRvQ2hhcnRQcm9wZXJ0aWVzLmNhdGVnb3J5QXhpcyA9IHtcblx0XHRcdFx0dGl0bGU6IHtcblx0XHRcdFx0XHR2aXNpYmxlOiBmYWxzZVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0b0NoYXJ0UHJvcGVydGllcy52YWx1ZUF4aXMgPSB7XG5cdFx0XHRcdHRpdGxlOiB7XG5cdFx0XHRcdFx0dmlzaWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0bGFiZWw6IHtcblx0XHRcdFx0XHRmb3JtYXRTdHJpbmc6IFwiU2hvcnRGbG9hdFwiXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRvQ2hhcnRQcm9wZXJ0aWVzLnBsb3RBcmVhLmRhdGFMYWJlbCA9IHsgdmlzaWJsZTogZmFsc2UgfTtcblx0fVxufVxuZnVuY3Rpb24gZmlsdGVyTWFwKGFPYmplY3RzOiB7IG5hbWU6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgcm9sZT86IHN0cmluZyB9W10sIGFSb2xlcz86IChzdHJpbmcgfCB1bmRlZmluZWQpW10pOiBzdHJpbmdbXSB7XG5cdGlmIChhUm9sZXMgJiYgYVJvbGVzLmxlbmd0aCkge1xuXHRcdHJldHVybiBhT2JqZWN0c1xuXHRcdFx0LmZpbHRlcigoZGltZW5zaW9uKSA9PiB7XG5cdFx0XHRcdHJldHVybiBhUm9sZXMuaW5kZXhPZihkaW1lbnNpb24ucm9sZSkgPj0gMDtcblx0XHRcdH0pXG5cdFx0XHQubWFwKChkaW1lbnNpb24pID0+IHtcblx0XHRcdFx0cmV0dXJuIGRpbWVuc2lvbi5sYWJlbDtcblx0XHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBhT2JqZWN0cy5tYXAoKGRpbWVuc2lvbikgPT4ge1xuXHRcdFx0cmV0dXJuIGRpbWVuc2lvbi5sYWJlbDtcblx0XHR9KTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRTY2F0dGVyQnViYmxlQ2hhcnRGZWVkcyhjaGFydERlZmluaXRpb246IEtQSUNoYXJ0RGVmaW5pdGlvbik6IHsgdWlkOiBzdHJpbmc7IHR5cGU6IHN0cmluZzsgdmFsdWVzOiBzdHJpbmdbXSB9W10ge1xuXHRjb25zdCBheGlzMU1lYXN1cmVzID0gZmlsdGVyTWFwKGNoYXJ0RGVmaW5pdGlvbi5tZWFzdXJlcywgW1wiQXhpczFcIl0pO1xuXHRjb25zdCBheGlzMk1lYXN1cmVzID0gZmlsdGVyTWFwKGNoYXJ0RGVmaW5pdGlvbi5tZWFzdXJlcywgW1wiQXhpczJcIl0pO1xuXHRjb25zdCBheGlzM01lYXN1cmVzID0gZmlsdGVyTWFwKGNoYXJ0RGVmaW5pdGlvbi5tZWFzdXJlcywgW1wiQXhpczNcIl0pO1xuXHRjb25zdCBvdGhlck1lYXN1cmVzID0gZmlsdGVyTWFwKGNoYXJ0RGVmaW5pdGlvbi5tZWFzdXJlcywgW3VuZGVmaW5lZF0pO1xuXHRjb25zdCBzZXJpZXNEaW1lbnNpb25zID0gZmlsdGVyTWFwKGNoYXJ0RGVmaW5pdGlvbi5kaW1lbnNpb25zLCBbXCJTZXJpZXNcIl0pO1xuXG5cdC8vIEdldCB0aGUgZmlyc3QgZGltZW5zaW9uIHdpdGggcm9sZSBcIkNhdGVnb3J5XCIgZm9yIHRoZSBzaGFwZVxuXHRjb25zdCBzaGFwZURpbWVuc2lvbiA9IGNoYXJ0RGVmaW5pdGlvbi5kaW1lbnNpb25zLmZpbmQoKGRpbWVuc2lvbikgPT4ge1xuXHRcdHJldHVybiBkaW1lbnNpb24ucm9sZSA9PT0gXCJDYXRlZ29yeVwiO1xuXHR9KTtcblxuXHQvLyBNZWFzdXJlIGZvciB0aGUgeC1BeGlzIDogZmlyc3QgbWVhc3VyZSBmb3IgQXhpczEsIG9yIGZvciBBeGlzMiBpZiBub3QgZm91bmQsIG9yIGZvciBBeGlzMyBpZiBub3QgZm91bmRcblx0Y29uc3QgeE1lYXN1cmUgPSBheGlzMU1lYXN1cmVzLnNoaWZ0KCkgfHwgYXhpczJNZWFzdXJlcy5zaGlmdCgpIHx8IGF4aXMzTWVhc3VyZXMuc2hpZnQoKSB8fCBvdGhlck1lYXN1cmVzLnNoaWZ0KCkgfHwgXCJcIjtcblx0Ly8gTWVhc3VyZSBmb3IgdGhlIHktQXhpcyA6IGZpcnN0IG1lYXN1cmUgZm9yIEF4aXMyLCBvciBzZWNvbmQgbWVhc3VyZSBmb3IgQXhpczEgaWYgbm90IGZvdW5kLCBvciBmaXJzdCBtZWFzdXJlIGZvciBBeGlzMyBpZiBub3QgZm91bmRcblx0Y29uc3QgeU1lYXN1cmUgPSBheGlzMk1lYXN1cmVzLnNoaWZ0KCkgfHwgYXhpczFNZWFzdXJlcy5zaGlmdCgpIHx8IGF4aXMzTWVhc3VyZXMuc2hpZnQoKSB8fCBvdGhlck1lYXN1cmVzLnNoaWZ0KCkgfHwgXCJcIjtcblx0Y29uc3QgcmVzID0gW1xuXHRcdHtcblx0XHRcdHVpZDogXCJ2YWx1ZUF4aXNcIixcblx0XHRcdHR5cGU6IFwiTWVhc3VyZVwiLFxuXHRcdFx0dmFsdWVzOiBbeE1lYXN1cmVdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHR1aWQ6IFwidmFsdWVBeGlzMlwiLFxuXHRcdFx0dHlwZTogXCJNZWFzdXJlXCIsXG5cdFx0XHR2YWx1ZXM6IFt5TWVhc3VyZV1cblx0XHR9XG5cdF07XG5cblx0aWYgKGNoYXJ0RGVmaW5pdGlvbi5jaGFydFR5cGUgPT09IFwiYnViYmxlXCIpIHtcblx0XHQvLyBNZWFzdXJlIGZvciB0aGUgc2l6ZSBvZiB0aGUgYnViYmxlOiBmaXJzdCBtZWFzdXJlIGZvciBBeGlzMywgb3IgcmVtYWluaW5nIG1lYXN1cmUgZm9yIEF4aXMxL0F4aXMyIGlmIG5vdCBmb3VuZFxuXHRcdGNvbnN0IHNpemVNZWFzdXJlID0gYXhpczNNZWFzdXJlcy5zaGlmdCgpIHx8IGF4aXMxTWVhc3VyZXMuc2hpZnQoKSB8fCBheGlzMk1lYXN1cmVzLnNoaWZ0KCkgfHwgb3RoZXJNZWFzdXJlcy5zaGlmdCgpIHx8IFwiXCI7XG5cdFx0cmVzLnB1c2goe1xuXHRcdFx0dWlkOiBcImJ1YmJsZVdpZHRoXCIsXG5cdFx0XHR0eXBlOiBcIk1lYXN1cmVcIixcblx0XHRcdHZhbHVlczogW3NpemVNZWFzdXJlXVxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gQ29sb3IgKG9wdGlvbmFsKVxuXHRpZiAoc2VyaWVzRGltZW5zaW9ucy5sZW5ndGgpIHtcblx0XHRyZXMucHVzaCh7XG5cdFx0XHR1aWQ6IFwiY29sb3JcIixcblx0XHRcdHR5cGU6IFwiRGltZW5zaW9uXCIsXG5cdFx0XHR2YWx1ZXM6IHNlcmllc0RpbWVuc2lvbnNcblx0XHR9KTtcblx0fVxuXHQvLyBTaGFwZSAob3B0aW9uYWwpXG5cdGlmIChzaGFwZURpbWVuc2lvbikge1xuXHRcdHJlcy5wdXNoKHtcblx0XHRcdHVpZDogXCJzaGFwZVwiLFxuXHRcdFx0dHlwZTogXCJEaW1lbnNpb25cIixcblx0XHRcdHZhbHVlczogW3NoYXBlRGltZW5zaW9uLmxhYmVsXVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIGdldENoYXJ0RmVlZHMoY2hhcnREZWZpbml0aW9uOiBLUElDaGFydERlZmluaXRpb24pOiB7IHVpZDogc3RyaW5nOyB0eXBlOiBzdHJpbmc7IHZhbHVlczogc3RyaW5nW10gfVtdIHtcblx0bGV0IHJlczogeyB1aWQ6IHN0cmluZzsgdHlwZTogc3RyaW5nOyB2YWx1ZXM6IHN0cmluZ1tdIH1bXTtcblxuXHRzd2l0Y2ggKGNoYXJ0RGVmaW5pdGlvbi5jaGFydFR5cGUpIHtcblx0XHRjYXNlIFwiRG9udXRcIjpcblx0XHRcdHJlcyA9IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHVpZDogXCJzaXplXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJNZWFzdXJlXCIsXG5cdFx0XHRcdFx0dmFsdWVzOiBmaWx0ZXJNYXAoY2hhcnREZWZpbml0aW9uLm1lYXN1cmVzKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dWlkOiBcImNvbG9yXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJEaW1lbnNpb25cIixcblx0XHRcdFx0XHR2YWx1ZXM6IGZpbHRlck1hcChjaGFydERlZmluaXRpb24uZGltZW5zaW9ucylcblx0XHRcdFx0fVxuXHRcdFx0XTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBcImJ1YmJsZVwiOlxuXHRcdGNhc2UgXCJzY2F0dGVyXCI6XG5cdFx0XHRyZXMgPSBnZXRTY2F0dGVyQnViYmxlQ2hhcnRGZWVkcyhjaGFydERlZmluaXRpb24pO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFwidmVydGljYWxfYnVsbGV0XCI6XG5cdFx0XHRyZXMgPSBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR1aWQ6IFwiYWN0dWFsVmFsdWVzXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJNZWFzdXJlXCIsXG5cdFx0XHRcdFx0dmFsdWVzOiBmaWx0ZXJNYXAoY2hhcnREZWZpbml0aW9uLm1lYXN1cmVzLCBbdW5kZWZpbmVkLCBcIkF4aXMxXCJdKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dWlkOiBcInRhcmdldFZhbHVlc1wiLFxuXHRcdFx0XHRcdHR5cGU6IFwiTWVhc3VyZVwiLFxuXHRcdFx0XHRcdHZhbHVlczogZmlsdGVyTWFwKGNoYXJ0RGVmaW5pdGlvbi5tZWFzdXJlcywgW1wiQXhpczJcIl0pXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR1aWQ6IFwiY2F0ZWdvcnlBeGlzXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJEaW1lbnNpb25cIixcblx0XHRcdFx0XHR2YWx1ZXM6IGZpbHRlck1hcChjaGFydERlZmluaXRpb24uZGltZW5zaW9ucywgW3VuZGVmaW5lZCwgXCJDYXRlZ29yeVwiXSlcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHVpZDogXCJjb2xvclwiLFxuXHRcdFx0XHRcdHR5cGU6IFwiRGltZW5zaW9uXCIsXG5cdFx0XHRcdFx0dmFsdWVzOiBmaWx0ZXJNYXAoY2hhcnREZWZpbml0aW9uLmRpbWVuc2lvbnMsIFtcIlNlcmllc1wiXSlcblx0XHRcdFx0fVxuXHRcdFx0XTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJlcyA9IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHVpZDogXCJ2YWx1ZUF4aXNcIixcblx0XHRcdFx0XHR0eXBlOiBcIk1lYXN1cmVcIixcblx0XHRcdFx0XHR2YWx1ZXM6IGZpbHRlck1hcChjaGFydERlZmluaXRpb24ubWVhc3VyZXMpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR1aWQ6IFwiY2F0ZWdvcnlBeGlzXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJEaW1lbnNpb25cIixcblx0XHRcdFx0XHR2YWx1ZXM6IGZpbHRlck1hcChjaGFydERlZmluaXRpb24uZGltZW5zaW9ucywgW3VuZGVmaW5lZCwgXCJDYXRlZ29yeVwiXSlcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHVpZDogXCJjb2xvclwiLFxuXHRcdFx0XHRcdHR5cGU6IFwiRGltZW5zaW9uXCIsXG5cdFx0XHRcdFx0dmFsdWVzOiBmaWx0ZXJNYXAoY2hhcnREZWZpbml0aW9uLmRpbWVuc2lvbnMsIFtcIlNlcmllc1wiXSlcblx0XHRcdFx0fVxuXHRcdFx0XTtcblx0fVxuXG5cdHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIGdldE5hdmlnYXRpb25QYXJhbWV0ZXJzKFxuXHRuYXZJbmZvOiBOYXZpZ2F0aW9uSW5mbyxcblx0b1NoZWxsU2VydmljZTogYW55XG4pOiBQcm9taXNlPHsgc2VtYW50aWNPYmplY3Q/OiBzdHJpbmc7IGFjdGlvbj86IHN0cmluZzsgb3V0Ym91bmQ/OiBzdHJpbmcgfSB8IHVuZGVmaW5lZD4ge1xuXHRpZiAobmF2SW5mby5zZW1hbnRpY09iamVjdCkge1xuXHRcdGlmIChuYXZJbmZvLmFjdGlvbikge1xuXHRcdFx0Ly8gQWN0aW9uIGlzIGFscmVhZHkgc3BlY2lmaWVkOiBjaGVjayBpZiBpdCdzIGF2YWlsYWJsZSBpbiB0aGUgc2hlbGxcblx0XHRcdHJldHVybiBvU2hlbGxTZXJ2aWNlLmdldExpbmtzKHsgc2VtYW50aWNPYmplY3Q6IG5hdkluZm8uc2VtYW50aWNPYmplY3QsIGFjdGlvbjogbmF2SW5mby5hY3Rpb24gfSkudGhlbigoYUxpbmtzOiBhbnlbXSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gYUxpbmtzLmxlbmd0aCA/IHsgc2VtYW50aWNPYmplY3Q6IG5hdkluZm8uc2VtYW50aWNPYmplY3QsIGFjdGlvbjogbmF2SW5mby5hY3Rpb24gfSA6IHVuZGVmaW5lZDtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBXZSBnZXQgdGhlIHByaW1hcnkgaW50ZW50IGZyb20gdGhlIHNoZWxsXG5cdFx0XHRyZXR1cm4gb1NoZWxsU2VydmljZS5nZXRQcmltYXJ5SW50ZW50KG5hdkluZm8uc2VtYW50aWNPYmplY3QpLnRoZW4oKG9MaW5rOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKCFvTGluaykge1xuXHRcdFx0XHRcdC8vIE5vIHByaW1hcnkgaW50ZW50Li4uXG5cdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIENoZWNrIHRoYXQgdGhlIHByaW1hcnkgaW50ZW50IGlzIG5vdCBwYXJ0IG9mIHRoZSB1bmF2YWlsYWJsZSBhY3Rpb25zXG5cdFx0XHRcdGNvbnN0IG9JbmZvID0gb1NoZWxsU2VydmljZS5wYXJzZVNoZWxsSGFzaChvTGluay5pbnRlbnQpO1xuXHRcdFx0XHRyZXR1cm4gbmF2SW5mby51bmF2YWlsYWJsZUFjdGlvbnMgJiYgbmF2SW5mby51bmF2YWlsYWJsZUFjdGlvbnMuaW5kZXhPZihvSW5mby5hY3Rpb24pID49IDBcblx0XHRcdFx0XHQ/IHVuZGVmaW5lZFxuXHRcdFx0XHRcdDogeyBzZW1hbnRpY09iamVjdDogb0luZm8uc2VtYW50aWNPYmplY3QsIGFjdGlvbjogb0luZm8uYWN0aW9uIH07XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gT3V0Ym91bmQgbmF2aWdhdGlvbiBzcGVjaWZpZWQgaW4gdGhlIG1hbmlmZXN0XG5cdFx0cmV0dXJuIG5hdkluZm8ub3V0Ym91bmROYXZpZ2F0aW9uID8gUHJvbWlzZS5yZXNvbHZlKHsgb3V0Ym91bmQ6IG5hdkluZm8ub3V0Ym91bmROYXZpZ2F0aW9uIH0pIDogUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7XG5cdH1cbn1cblxuLyoqXG4gKiBAY2xhc3MgQSBjb250cm9sbGVyIGV4dGVuc2lvbiBmb3IgbWFuYWdpbmcgdGhlIEtQSXMgaW4gYW4gYW5hbHl0aWNhbCBsaXN0IHBhZ2VcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLktQSU1hbmFnZW1lbnRcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKiBAc2luY2UgMS45My4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLktQSU1hbmFnZW1lbnRcIilcbmNsYXNzIEtQSU1hbmFnZW1lbnRDb250cm9sbGVyRXh0ZW5zaW9uIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByb3RlY3RlZCBhS1BJRGVmaW5pdGlvbnM/OiBLUElEZWZpbml0aW9uW107XG5cblx0cHJvdGVjdGVkIG9DYXJkOiBhbnk7XG5cblx0cHJvdGVjdGVkIG9Qb3BvdmVyITogUG9wb3ZlcjtcblxuXHQvKipcblx0ICogQ3JlYXRlcyB0aGUgY2FyZCBtYW5pZmVzdCBmb3IgYSBLUEkgZGVmaW5pdGlvbiBhbmQgc3RvcmVzIGl0IGluIGEgSlNPTiBtb2RlbC5cblx0ICpcblx0ICogQHBhcmFtIGtwaURlZmluaXRpb24gVGhlIEtQSSBkZWZpbml0aW9uXG5cdCAqIEBwYXJhbSBvS1BJTW9kZWwgVGhlIEpTT04gbW9kZWwgaW4gd2hpY2ggdGhlIG1hbmlmZXN0IHdpbGwgYmUgc3RvcmVkXG5cdCAqL1xuXHRwcm90ZWN0ZWQgaW5pdENhcmRNYW5pZmVzdChrcGlEZWZpbml0aW9uOiBLUElEZWZpbml0aW9uLCBvS1BJTW9kZWw6IEpTT05Nb2RlbCk6IHZvaWQge1xuXHRcdGNvbnN0IG9DYXJkTWFuaWZlc3Q6IGFueSA9IHtcblx0XHRcdFwic2FwLmFwcFwiOiB7XG5cdFx0XHRcdGlkOiBcInNhcC5mZVwiLFxuXHRcdFx0XHR0eXBlOiBcImNhcmRcIlxuXHRcdFx0fSxcblx0XHRcdFwic2FwLnVpXCI6IHtcblx0XHRcdFx0dGVjaG5vbG9neTogXCJVSTVcIlxuXHRcdFx0fSxcblx0XHRcdFwic2FwLmNhcmRcIjoge1xuXHRcdFx0XHR0eXBlOiBcIkFuYWx5dGljYWxcIixcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGpzb246IHt9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhlYWRlcjoge1xuXHRcdFx0XHRcdHR5cGU6IFwiTnVtZXJpY1wiLFxuXHRcdFx0XHRcdHRpdGxlOiBrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50aXRsZSxcblx0XHRcdFx0XHRzdWJUaXRsZToga3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQuZGVzY3JpcHRpb24sXG5cdFx0XHRcdFx0dW5pdE9mTWVhc3VyZW1lbnQ6IFwie21haW5Vbml0fVwiLFxuXHRcdFx0XHRcdG1haW5JbmRpY2F0b3I6IHtcblx0XHRcdFx0XHRcdG51bWJlcjogXCJ7bWFpblZhbHVlTm9TY2FsZX1cIixcblx0XHRcdFx0XHRcdHVuaXQ6IFwie21haW5WYWx1ZVNjYWxlfVwiLFxuXHRcdFx0XHRcdFx0c3RhdGU6IFwie21haW5TdGF0ZX1cIixcblx0XHRcdFx0XHRcdHRyZW5kOiBcInt0cmVuZH1cIlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0Y29udGVudDoge1xuXHRcdFx0XHRcdG1pbkhlaWdodDogXCIyNXJlbVwiLFxuXHRcdFx0XHRcdGNoYXJ0UHJvcGVydGllczoge1xuXHRcdFx0XHRcdFx0cGxvdEFyZWE6IHt9LFxuXHRcdFx0XHRcdFx0dGl0bGU6IHtcblx0XHRcdFx0XHRcdFx0dmlzaWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0YWxpZ25tZW50OiBcImxlZnRcIlxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0cGF0aDogXCIvY2hhcnREYXRhXCJcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly8gQWRkIHNpZGUgaW5kaWNhdG9ycyBpbiB0aGUgY2FyZCBoZWFkZXIgaWYgYSB0YXJnZXQgaXMgZGVmaW5lZCBmb3IgdGhlIEtQSVxuXHRcdGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50YXJnZXRQYXRoIHx8IGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRhcmdldFZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnN0IHJlc0J1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0XHRvQ2FyZE1hbmlmZXN0W1wic2FwLmNhcmRcIl0uaGVhZGVyLnNpZGVJbmRpY2F0b3JzID0gW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGl0bGU6IHJlc0J1bmRsZS5nZXRUZXh0KFwiQ19LUElDQVJEX0lORElDQVRPUl9UQVJHRVRcIiksXG5cdFx0XHRcdFx0bnVtYmVyOiBcInt0YXJnZXROdW1iZXJ9XCIsXG5cdFx0XHRcdFx0dW5pdDogXCJ7dGFyZ2V0VW5pdH1cIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGl0bGU6IHJlc0J1bmRsZS5nZXRUZXh0KFwiQ19LUElDQVJEX0lORElDQVRPUl9ERVZJQVRJT05cIiksXG5cdFx0XHRcdFx0bnVtYmVyOiBcIntkZXZpYXRpb25OdW1iZXJ9XCIsXG5cdFx0XHRcdFx0dW5pdDogXCIlXCJcblx0XHRcdFx0fVxuXHRcdFx0XTtcblx0XHR9XG5cblx0XHQvLyBEZXRhaWxzIG9mIHRoZSBjYXJkOiBmaWx0ZXIgZGVzY3JpcHRpb25zXG5cdFx0aWYgKGtwaURlZmluaXRpb24uc2VsZWN0aW9uVmFyaWFudEZpbHRlckRlZmluaXRpb25zPy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGFEZXNjcmlwdGlvbnM6IHN0cmluZ1tdID0gW107XG5cdFx0XHRrcGlEZWZpbml0aW9uLnNlbGVjdGlvblZhcmlhbnRGaWx0ZXJEZWZpbml0aW9ucy5mb3JFYWNoKChmaWx0ZXJEZWZpbml0aW9uKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGRlc2MgPSBnZXRGaWx0ZXJTdHJpbmdGcm9tRGVmaW5pdGlvbihmaWx0ZXJEZWZpbml0aW9uKTtcblx0XHRcdFx0aWYgKGRlc2MpIHtcblx0XHRcdFx0XHRhRGVzY3JpcHRpb25zLnB1c2goZGVzYyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoYURlc2NyaXB0aW9ucy5sZW5ndGgpIHtcblx0XHRcdFx0b0NhcmRNYW5pZmVzdFtcInNhcC5jYXJkXCJdLmhlYWRlci5kZXRhaWxzID0gYURlc2NyaXB0aW9ucy5qb2luKFwiLCBcIik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQ2hhcnQgc2V0dGluZ3M6IHR5cGUsIHRpdGxlLCBkaW1lbnNpb25zIGFuZCBtZWFzdXJlcyBpbiB0aGUgbWFuaWZlc3Rcblx0XHRvQ2FyZE1hbmlmZXN0W1wic2FwLmNhcmRcIl0uY29udGVudC5jaGFydFR5cGUgPSBrcGlEZWZpbml0aW9uLmNoYXJ0LmNoYXJ0VHlwZTtcblx0XHR1cGRhdGVDaGFydExhYmVsU2V0dGluZ3Moa3BpRGVmaW5pdGlvbi5jaGFydCwgb0NhcmRNYW5pZmVzdFtcInNhcC5jYXJkXCJdLmNvbnRlbnQuY2hhcnRQcm9wZXJ0aWVzKTtcblx0XHRvQ2FyZE1hbmlmZXN0W1wic2FwLmNhcmRcIl0uY29udGVudC5jaGFydFByb3BlcnRpZXMudGl0bGUudGV4dCA9IGZvcm1hdENoYXJ0VGl0bGUoa3BpRGVmaW5pdGlvbik7XG5cdFx0b0NhcmRNYW5pZmVzdFtcInNhcC5jYXJkXCJdLmNvbnRlbnQuZGltZW5zaW9ucyA9IGtwaURlZmluaXRpb24uY2hhcnQuZGltZW5zaW9ucy5tYXAoKGRpbWVuc2lvbikgPT4ge1xuXHRcdFx0cmV0dXJuIHsgbGFiZWw6IGRpbWVuc2lvbi5sYWJlbCwgdmFsdWU6IGB7JHtkaW1lbnNpb24ubmFtZX19YCB9O1xuXHRcdH0pO1xuXHRcdG9DYXJkTWFuaWZlc3RbXCJzYXAuY2FyZFwiXS5jb250ZW50Lm1lYXN1cmVzID0ga3BpRGVmaW5pdGlvbi5jaGFydC5tZWFzdXJlcy5tYXAoKG1lYXN1cmUpID0+IHtcblx0XHRcdHJldHVybiB7IGxhYmVsOiBtZWFzdXJlLmxhYmVsLCB2YWx1ZTogYHske21lYXN1cmUubmFtZX19YCB9O1xuXHRcdH0pO1xuXHRcdG9DYXJkTWFuaWZlc3RbXCJzYXAuY2FyZFwiXS5jb250ZW50LmZlZWRzID0gZ2V0Q2hhcnRGZWVkcyhrcGlEZWZpbml0aW9uLmNoYXJ0KTtcblxuXHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH1gLCB7XG5cdFx0XHRtYW5pZmVzdDogb0NhcmRNYW5pZmVzdFxuXHRcdH0pO1xuXHR9XG5cblx0cHJvdGVjdGVkIGluaXROYXZpZ2F0aW9uSW5mbyhrcGlEZWZpbml0aW9uOiBLUElEZWZpbml0aW9uLCBvS1BJTW9kZWw6IEpTT05Nb2RlbCwgb1NoZWxsU2VydmljZTogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gQWRkIG5hdmlnYXRpb25cblx0XHRpZiAoa3BpRGVmaW5pdGlvbi5uYXZpZ2F0aW9uKSB7XG5cdFx0XHRyZXR1cm4gZ2V0TmF2aWdhdGlvblBhcmFtZXRlcnMoa3BpRGVmaW5pdGlvbi5uYXZpZ2F0aW9uLCBvU2hlbGxTZXJ2aWNlKS50aGVuKChvTmF2SW5mbykgPT4ge1xuXHRcdFx0XHRpZiAob05hdkluZm8pIHtcblx0XHRcdFx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2hlYWRlci9hY3Rpb25zYCwgW1xuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBcIk5hdmlnYXRpb25cIixcblx0XHRcdFx0XHRcdFx0cGFyYW1ldGVyczogb05hdkluZm9cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRdKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9XG5cdH1cblxuXHRAbWV0aG9kT3ZlcnJpZGUoKVxuXHRwdWJsaWMgb25Jbml0KCk6IHZvaWQge1xuXHRcdHRoaXMuYUtQSURlZmluaXRpb25zID0gKHRoaXMuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX2dldFBhZ2VNb2RlbCgpPy5nZXRQcm9wZXJ0eShcIi9rcGlEZWZpbml0aW9uc1wiKTtcblxuXHRcdGlmICh0aGlzLmFLUElEZWZpbml0aW9ucyAmJiB0aGlzLmFLUElEZWZpbml0aW9ucy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCk7XG5cdFx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gKG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBCYXNlQ29udHJvbGxlcikuZ2V0QXBwQ29tcG9uZW50KCkgYXMgYW55O1xuXG5cdFx0XHQvLyBDcmVhdGUgYSBKU09OIG1vZGVsIHRvIHN0b3JlIEtQSSBkYXRhXG5cdFx0XHRjb25zdCBvS1BJTW9kZWwgPSBuZXcgSlNPTk1vZGVsKCk7XG5cdFx0XHRvVmlldy5zZXRNb2RlbChvS1BJTW9kZWwsIFwia3BpTW9kZWxcIik7XG5cblx0XHRcdHRoaXMuYUtQSURlZmluaXRpb25zLmZvckVhY2goKGtwaURlZmluaXRpb24pID0+IHtcblx0XHRcdFx0Ly8gQ3JlYXRlIHRoZSBtYW5pZmVzdCBmb3IgdGhlIEtQSSBjYXJkIGFuZCBzdG9yZSBpdCBpbiB0aGUgS1BJIG1vZGVsXG5cdFx0XHRcdHRoaXMuaW5pdENhcmRNYW5pZmVzdChrcGlEZWZpbml0aW9uLCBvS1BJTW9kZWwpO1xuXG5cdFx0XHRcdC8vIFNldCB0aGUgbmF2aWdhdGlvbiBpbmZvcm1hdGlvbiBpbiB0aGUgbWFuaWZlc3Rcblx0XHRcdFx0dGhpcy5pbml0TmF2aWdhdGlvbkluZm8oa3BpRGVmaW5pdGlvbiwgb0tQSU1vZGVsLCBvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKSkuY2F0Y2goZnVuY3Rpb24gKGVycjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKGVycik7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIExvYWQgdGFnIGRhdGEgZm9yIHRoZSBLUElcblx0XHRcdFx0dGhpcy5sb2FkS1BJVGFnRGF0YShrcGlEZWZpbml0aW9uLCBvQXBwQ29tcG9uZW50LmdldE1vZGVsKCkgYXMgT0RhdGFNb2RlbCwgb0tQSU1vZGVsKS5jYXRjaChmdW5jdGlvbiAoZXJyOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoZXJyKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRAbWV0aG9kT3ZlcnJpZGUoKVxuXHRwdWJsaWMgb25FeGl0KCk6IHZvaWQge1xuXHRcdGNvbnN0IG9LUElNb2RlbCA9IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwia3BpTW9kZWxcIikgYXMgSlNPTk1vZGVsO1xuXG5cdFx0aWYgKG9LUElNb2RlbCkge1xuXHRcdFx0b0tQSU1vZGVsLmRlc3Ryb3koKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHVwZGF0ZURhdGFwb2ludFZhbHVlQW5kQ3VycmVuY3koa3BpRGVmaW5pdGlvbjogS1BJRGVmaW5pdGlvbiwga3BpQ29udGV4dDogQ29udGV4dCwgb0tQSU1vZGVsOiBKU09OTW9kZWwpIHtcblx0XHRjb25zdCBjdXJyZW50TG9jYWxlID0gbmV3IExvY2FsZShzYXAudWkuZ2V0Q29yZSgpLmdldENvbmZpZ3VyYXRpb24oKS5nZXRMYW5ndWFnZSgpKTtcblx0XHRjb25zdCByYXdVbml0ID0ga3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudW5pdD8uaXNQYXRoXG5cdFx0XHQ/IGtwaUNvbnRleHQuZ2V0UHJvcGVydHkoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudW5pdC52YWx1ZSlcblx0XHRcdDoga3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudW5pdD8udmFsdWU7XG5cblx0XHRjb25zdCBpc1BlcmNlbnRhZ2UgPSBrcGlEZWZpbml0aW9uLmRhdGFwb2ludC51bml0Py5pc0N1cnJlbmN5ID09PSBmYWxzZSAmJiByYXdVbml0ID09PSBcIiVcIjtcblxuXHRcdC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIE1haW4gS1BJIHZhbHVlXG5cdFx0Y29uc3QgcmF3VmFsdWUgPSBOdW1iZXIucGFyc2VGbG9hdChrcGlDb250ZXh0LmdldFByb3BlcnR5KGtwaURlZmluaXRpb24uZGF0YXBvaW50LnByb3BlcnR5UGF0aCkpO1xuXG5cdFx0Ly8gVmFsdWUgZm9ybWF0dGVkIHdpdGggYSBzY2FsZVxuXHRcdGNvbnN0IGtwaVZhbHVlID0gTnVtYmVyRm9ybWF0LmdldEZsb2F0SW5zdGFuY2UoXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiBpc1BlcmNlbnRhZ2UgPyB1bmRlZmluZWQgOiBcInNob3J0XCIsXG5cdFx0XHRcdG1pbkZyYWN0aW9uRGlnaXRzOiAwLFxuXHRcdFx0XHRtYXhGcmFjdGlvbkRpZ2l0czogMSxcblx0XHRcdFx0c2hvd1NjYWxlOiAhaXNQZXJjZW50YWdlXG5cdFx0XHR9LFxuXHRcdFx0Y3VycmVudExvY2FsZVxuXHRcdCkuZm9ybWF0KHJhd1ZhbHVlKTtcblx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi9tYWluVmFsdWVgLCBrcGlWYWx1ZSk7XG5cblx0XHQvLyBWYWx1ZSB3aXRob3V0IGEgc2NhbGVcblx0XHRjb25zdCBrcGlWYWx1ZVVuc2NhbGVkID0gTnVtYmVyRm9ybWF0LmdldEZsb2F0SW5zdGFuY2UoXG5cdFx0XHR7XG5cdFx0XHRcdG1heEZyYWN0aW9uRGlnaXRzOiAyLFxuXHRcdFx0XHRzaG93U2NhbGU6IGZhbHNlLFxuXHRcdFx0XHRncm91cGluZ0VuYWJsZWQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRjdXJyZW50TG9jYWxlXG5cdFx0KS5mb3JtYXQocmF3VmFsdWUpO1xuXHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5WYWx1ZVVuc2NhbGVkYCwga3BpVmFsdWVVbnNjYWxlZCk7XG5cblx0XHQvLyBWYWx1ZSBmb3JtYXR0ZWQgd2l0aCB0aGUgc2NhbGUgb21pdHRlZFxuXHRcdGNvbnN0IGtwaVZhbHVlTm9TY2FsZSA9IE51bWJlckZvcm1hdC5nZXRGbG9hdEluc3RhbmNlKFxuXHRcdFx0e1xuXHRcdFx0XHRzdHlsZTogaXNQZXJjZW50YWdlID8gdW5kZWZpbmVkIDogXCJzaG9ydFwiLFxuXHRcdFx0XHRtaW5GcmFjdGlvbkRpZ2l0czogMCxcblx0XHRcdFx0bWF4RnJhY3Rpb25EaWdpdHM6IDEsXG5cdFx0XHRcdHNob3dTY2FsZTogZmFsc2Vcblx0XHRcdH0sXG5cdFx0XHRjdXJyZW50TG9jYWxlXG5cdFx0KS5mb3JtYXQocmF3VmFsdWUpO1xuXHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5WYWx1ZU5vU2NhbGVgLCBrcGlWYWx1ZU5vU2NhbGUpO1xuXG5cdFx0Ly8gU2NhbGUgb2YgdGhlIHZhbHVlXG5cdFx0Y29uc3Qga3BpVmFsdWVTY2FsZSA9IE51bWJlckZvcm1hdC5nZXRGbG9hdEluc3RhbmNlKFxuXHRcdFx0e1xuXHRcdFx0XHRzdHlsZTogaXNQZXJjZW50YWdlID8gdW5kZWZpbmVkIDogXCJzaG9ydFwiLFxuXHRcdFx0XHRkZWNpbWFsczogMCxcblx0XHRcdFx0bWF4SW50ZWdlckRpZ2l0czogMCxcblx0XHRcdFx0c2hvd1NjYWxlOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0Y3VycmVudExvY2FsZVxuXHRcdCkuZm9ybWF0KHJhd1ZhbHVlKTtcblx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi9tYWluVmFsdWVTY2FsZWAsIGtwaVZhbHVlU2NhbGUpO1xuXG5cdFx0Ly8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gVW5pdCBvciBjdXJyZW5jeVxuXHRcdGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC51bml0ICYmIHJhd1VuaXQpIHtcblx0XHRcdGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC51bml0LmlzQ3VycmVuY3kpIHtcblx0XHRcdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vbWFpblVuaXRgLCByYXdVbml0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIEluIGNhc2Ugb2YgdW5pdCBvZiBtZWFzdXJlLCB3ZSBoYXZlIHRvIGZvcm1hdCBpdCBwcm9wZXJseVxuXHRcdFx0XHRjb25zdCBrcGlVbml0ID0gTnVtYmVyRm9ybWF0LmdldFVuaXRJbnN0YW5jZSh7IHNob3dOdW1iZXI6IGZhbHNlIH0sIGN1cnJlbnRMb2NhbGUpLmZvcm1hdChyYXdWYWx1ZSwgcmF3VW5pdCk7XG5cdFx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5Vbml0YCwga3BpVW5pdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVEYXRhcG9pbnRDcml0aWNhbGl0eShrcGlEZWZpbml0aW9uOiBLUElEZWZpbml0aW9uLCBrcGlDb250ZXh0OiBDb250ZXh0LCBvS1BJTW9kZWw6IEpTT05Nb2RlbCkge1xuXHRcdGNvbnN0IHJhd1ZhbHVlID0gTnVtYmVyLnBhcnNlRmxvYXQoa3BpQ29udGV4dC5nZXRQcm9wZXJ0eShrcGlEZWZpbml0aW9uLmRhdGFwb2ludC5wcm9wZXJ0eVBhdGgpKTtcblxuXHRcdGxldCBjcml0aWNhbGl0eVZhbHVlID0gTWVzc2FnZVR5cGUuTm9uZTtcblx0XHRpZiAoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQuY3JpdGljYWxpdHlWYWx1ZSkge1xuXHRcdFx0Ly8gQ3JpdGljYWxpdHkgaXMgYSBmaXhlZCB2YWx1ZVxuXHRcdFx0Y3JpdGljYWxpdHlWYWx1ZSA9IGtwaURlZmluaXRpb24uZGF0YXBvaW50LmNyaXRpY2FsaXR5VmFsdWU7XG5cdFx0fSBlbHNlIGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC5jcml0aWNhbGl0eVBhdGgpIHtcblx0XHRcdC8vIENyaXRpY2FsaXR5IGNvbWVzIGZyb20gYW5vdGhlciBwcm9wZXJ0eSAodmlhIGEgcGF0aClcblx0XHRcdGNyaXRpY2FsaXR5VmFsdWUgPVxuXHRcdFx0XHRNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eVtrcGlDb250ZXh0LmdldFByb3BlcnR5KGtwaURlZmluaXRpb24uZGF0YXBvaW50LmNyaXRpY2FsaXR5UGF0aCldIHx8IE1lc3NhZ2VUeXBlLk5vbmU7XG5cdFx0fSBlbHNlIGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC5jcml0aWNhbGl0eUNhbGN1bGF0aW9uVGhyZXNob2xkcyAmJiBrcGlEZWZpbml0aW9uLmRhdGFwb2ludC5jcml0aWNhbGl0eUNhbGN1bGF0aW9uTW9kZSkge1xuXHRcdFx0Ly8gQ3JpdGljYWxpdHkgY2FsY3VsYXRpb25cblx0XHRcdHN3aXRjaCAoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQuY3JpdGljYWxpdHlDYWxjdWxhdGlvbk1vZGUpIHtcblx0XHRcdFx0Y2FzZSBcIlVJLkltcHJvdmVtZW50RGlyZWN0aW9uVHlwZS9UYXJnZXRcIjpcblx0XHRcdFx0XHRjcml0aWNhbGl0eVZhbHVlID0gbWVzc2FnZVR5cGVGcm9tVGFyZ2V0Q2FsY3VsYXRpb24ocmF3VmFsdWUsIGtwaURlZmluaXRpb24uZGF0YXBvaW50LmNyaXRpY2FsaXR5Q2FsY3VsYXRpb25UaHJlc2hvbGRzKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwiVUkuSW1wcm92ZW1lbnREaXJlY3Rpb25UeXBlL01pbmltaXplXCI6XG5cdFx0XHRcdFx0Y3JpdGljYWxpdHlWYWx1ZSA9IG1lc3NhZ2VUeXBlRnJvbU1pbmltaXplQ2FsY3VsYXRpb24oXG5cdFx0XHRcdFx0XHRyYXdWYWx1ZSxcblx0XHRcdFx0XHRcdGtwaURlZmluaXRpb24uZGF0YXBvaW50LmNyaXRpY2FsaXR5Q2FsY3VsYXRpb25UaHJlc2hvbGRzXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwiVUkuSW1wcm92ZW1lbnREaXJlY3Rpb25UeXBlL01heGltaXplXCI6XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Y3JpdGljYWxpdHlWYWx1ZSA9IG1lc3NhZ2VUeXBlRnJvbU1heGltaXplQ2FsY3VsYXRpb24oXG5cdFx0XHRcdFx0XHRyYXdWYWx1ZSxcblx0XHRcdFx0XHRcdGtwaURlZmluaXRpb24uZGF0YXBvaW50LmNyaXRpY2FsaXR5Q2FsY3VsYXRpb25UaHJlc2hvbGRzXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi9tYWluQ3JpdGljYWxpdHlgLCBjcml0aWNhbGl0eVZhbHVlKTtcblx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoXG5cdFx0XHRgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5TdGF0ZWAsXG5cdFx0XHRWYWx1ZUNvbG9yRnJvbU1lc3NhZ2VUeXBlW2NyaXRpY2FsaXR5VmFsdWVdIHx8IFwiTm9uZVwiXG5cdFx0KTtcblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlRGF0YXBvaW50VHJlbmQoa3BpRGVmaW5pdGlvbjogS1BJRGVmaW5pdGlvbiwga3BpQ29udGV4dDogQ29udGV4dCwgb0tQSU1vZGVsOiBKU09OTW9kZWwpIHtcblx0XHRjb25zdCByYXdWYWx1ZSA9IE51bWJlci5wYXJzZUZsb2F0KGtwaUNvbnRleHQuZ2V0UHJvcGVydHkoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQucHJvcGVydHlQYXRoKSk7XG5cblx0XHRsZXQgdHJlbmRWYWx1ZSA9IFwiTm9uZVwiO1xuXG5cdFx0aWYgKGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRyZW5kVmFsdWUpIHtcblx0XHRcdC8vIFRyZW5kIGlzIGEgZml4ZWQgdmFsdWVcblx0XHRcdHRyZW5kVmFsdWUgPSBrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50cmVuZFZhbHVlO1xuXHRcdH0gZWxzZSBpZiAoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudHJlbmRQYXRoKSB7XG5cdFx0XHQvLyBUcmVuZCBjb21lcyBmcm9tIGFub3RoZXIgcHJvcGVydHkgdmlhIGEgcGF0aFxuXHRcdFx0dHJlbmRWYWx1ZSA9IGRldmlhdGlvbkluZGljYXRvckZyb21UcmVuZFR5cGUoa3BpQ29udGV4dC5nZXRQcm9wZXJ0eShrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50cmVuZFBhdGgpKTtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0a3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudHJlbmRDYWxjdWxhdGlvblJlZmVyZW5jZVZhbHVlICE9PSB1bmRlZmluZWQgfHxcblx0XHRcdGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRyZW5kQ2FsY3VsYXRpb25SZWZlcmVuY2VQYXRoXG5cdFx0KSB7XG5cdFx0XHQvLyBDYWxjdWxhdGVkIHRyZW5kXG5cdFx0XHRsZXQgdHJlbmRSZWZlcmVuY2VWYWx1ZTogbnVtYmVyO1xuXHRcdFx0aWYgKGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRyZW5kQ2FsY3VsYXRpb25SZWZlcmVuY2VWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHRyZW5kUmVmZXJlbmNlVmFsdWUgPSBrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50cmVuZENhbGN1bGF0aW9uUmVmZXJlbmNlVmFsdWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0cmVuZFJlZmVyZW5jZVZhbHVlID0gTnVtYmVyLnBhcnNlRmxvYXQoXG5cdFx0XHRcdFx0a3BpQ29udGV4dC5nZXRQcm9wZXJ0eShrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50cmVuZENhbGN1bGF0aW9uUmVmZXJlbmNlUGF0aCB8fCBcIlwiKVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0dHJlbmRWYWx1ZSA9IGRldmlhdGlvbkluZGljYXRvckZyb21DYWxjdWxhdGlvbihcblx0XHRcdFx0cmF3VmFsdWUsXG5cdFx0XHRcdHRyZW5kUmVmZXJlbmNlVmFsdWUsXG5cdFx0XHRcdCEha3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudHJlbmRDYWxjdWxhdGlvbklzUmVsYXRpdmUsXG5cdFx0XHRcdGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRyZW5kQ2FsY3VsYXRpb25UcmVzaG9sZHNcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vdHJlbmRgLCB0cmVuZFZhbHVlKTtcblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlVGFyZ2V0VmFsdWUoa3BpRGVmaW5pdGlvbjogS1BJRGVmaW5pdGlvbiwga3BpQ29udGV4dDogQ29udGV4dCwgb0tQSU1vZGVsOiBKU09OTW9kZWwpIHtcblx0XHRpZiAoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudGFyZ2V0VmFsdWUgPT09IHVuZGVmaW5lZCAmJiBrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50YXJnZXRQYXRoID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybjsgLy8gTm8gdGFyZ2V0IHNldCBmb3IgdGhlIEtQSVxuXHRcdH1cblx0XHRjb25zdCByYXdWYWx1ZSA9IE51bWJlci5wYXJzZUZsb2F0KGtwaUNvbnRleHQuZ2V0UHJvcGVydHkoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQucHJvcGVydHlQYXRoKSk7XG5cdFx0Y29uc3QgY3VycmVudExvY2FsZSA9IG5ldyBMb2NhbGUoc2FwLnVpLmdldENvcmUoKS5nZXRDb25maWd1cmF0aW9uKCkuZ2V0TGFuZ3VhZ2UoKSk7XG5cblx0XHRsZXQgdGFyZ2V0UmF3VmFsdWU6IG51bWJlcjtcblx0XHRpZiAoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudGFyZ2V0VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGFyZ2V0UmF3VmFsdWUgPSBrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50YXJnZXRWYWx1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFyZ2V0UmF3VmFsdWUgPSBOdW1iZXIucGFyc2VGbG9hdChrcGlDb250ZXh0LmdldFByb3BlcnR5KGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRhcmdldFBhdGggfHwgXCJcIikpO1xuXHRcdH1cblx0XHRjb25zdCBkZXZpYXRpb25SYXdWYWx1ZSA9IHRhcmdldFJhd1ZhbHVlICE9PSAwID8gKChyYXdWYWx1ZSAtIHRhcmdldFJhd1ZhbHVlKSAvIHRhcmdldFJhd1ZhbHVlKSAqIDEwMCA6IHVuZGVmaW5lZDtcblxuXHRcdC8vIEZvcm1hdHRpbmdcblx0XHRjb25zdCB0YXJnZXRWYWx1ZSA9IE51bWJlckZvcm1hdC5nZXRGbG9hdEluc3RhbmNlKFxuXHRcdFx0e1xuXHRcdFx0XHRzdHlsZTogXCJzaG9ydFwiLFxuXHRcdFx0XHRtaW5GcmFjdGlvbkRpZ2l0czogMCxcblx0XHRcdFx0bWF4RnJhY3Rpb25EaWdpdHM6IDEsXG5cdFx0XHRcdHNob3dTY2FsZTogZmFsc2Vcblx0XHRcdH0sXG5cdFx0XHRjdXJyZW50TG9jYWxlXG5cdFx0KS5mb3JtYXQodGFyZ2V0UmF3VmFsdWUpO1xuXHRcdGNvbnN0IHRhcmdldFNjYWxlID0gTnVtYmVyRm9ybWF0LmdldEZsb2F0SW5zdGFuY2UoXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiBcInNob3J0XCIsXG5cdFx0XHRcdGRlY2ltYWxzOiAwLFxuXHRcdFx0XHRtYXhJbnRlZ2VyRGlnaXRzOiAwLFxuXHRcdFx0XHRzaG93U2NhbGU6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRjdXJyZW50TG9jYWxlXG5cdFx0KS5mb3JtYXQodGFyZ2V0UmF3VmFsdWUpO1xuXG5cdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vdGFyZ2V0TnVtYmVyYCwgdGFyZ2V0VmFsdWUpO1xuXHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL3RhcmdldFVuaXRgLCB0YXJnZXRTY2FsZSk7XG5cblx0XHRpZiAoZGV2aWF0aW9uUmF3VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgZGV2aWF0aW9uVmFsdWUgPSBOdW1iZXJGb3JtYXQuZ2V0RmxvYXRJbnN0YW5jZShcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1pbkZyYWN0aW9uRGlnaXRzOiAwLFxuXHRcdFx0XHRcdG1heEZyYWN0aW9uRGlnaXRzOiAxLFxuXHRcdFx0XHRcdHNob3dTY2FsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0Y3VycmVudExvY2FsZVxuXHRcdFx0KS5mb3JtYXQoZGV2aWF0aW9uUmF3VmFsdWUpO1xuXHRcdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vZGV2aWF0aW9uTnVtYmVyYCwgZGV2aWF0aW9uVmFsdWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi9kZXZpYXRpb25OdW1iZXJgLCBcIk4vQVwiKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTG9hZHMgdGFnIGRhdGEgZm9yIGEgS1BJLCBhbmQgc3RvcmVzIGl0IGluIHRoZSBKU09OIEtQSSBtb2RlbC5cblx0ICpcblx0ICogQHBhcmFtIGtwaURlZmluaXRpb24gVGhlIGRlZmluaXRpb24gb2YgdGhlIEtQSS5cblx0ICogQHBhcmFtIG9NYWluTW9kZWwgVGhlIG1vZGVsIHVzZWQgdG8gbG9hZCB0aGUgZGF0YS5cblx0ICogQHBhcmFtIG9LUElNb2RlbCBUaGUgSlNPTiBtb2RlbCB3aGVyZSB0aGUgZGF0YSB3aWxsIGJlIHN0b3JlZFxuXHQgKiBAcGFyYW0gbG9hZEZ1bGwgSWYgbm90IHRydWUsIGxvYWRzIG9ubHkgZGF0YSBmb3IgdGhlIEtQSSB0YWdcblx0ICogQHJldHVybnMgVGhlIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIGRhdGEgaXMgbG9hZGVkLlxuXHQgKi9cblx0cHJvdGVjdGVkIGxvYWRLUElUYWdEYXRhKGtwaURlZmluaXRpb246IEtQSURlZmluaXRpb24sIG9NYWluTW9kZWw6IE9EYXRhTW9kZWwsIG9LUElNb2RlbDogSlNPTk1vZGVsLCBsb2FkRnVsbD86IGJvb2xlYW4pOiBhbnkge1xuXHRcdC8vIElmIGxvYWRGdWxsPWZhbHNlLCB0aGVuIHdlJ3JlIGp1c3QgbG9hZGluZyBkYXRhIGZvciB0aGUgdGFnIGFuZCB3ZSB1c2UgdGhlIFwiJGF1dG8uTG9uZ1J1bm5lcnNcIiBncm91cElEXG5cdFx0Ly8gSWYgbG9hZEZ1bGw9dHJ1ZSwgd2UncmUgbG9hZGluZyBkYXRhIGZvciB0aGUgd2hvbGUgS1BJICh0YWcgKyBjYXJkKSBhbmQgd2UgdXNlIHRoZSBcIiRhdXRvLldvcmtlcnNcIiBncm91cElEXG5cdFx0Y29uc3Qgb0xpc3RCaW5kaW5nID0gbG9hZEZ1bGxcblx0XHRcdD8gb01haW5Nb2RlbC5iaW5kTGlzdChgLyR7a3BpRGVmaW5pdGlvbi5lbnRpdHlTZXR9YCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgeyAkJGdyb3VwSWQ6IFwiJGF1dG8uV29ya2Vyc1wiIH0pXG5cdFx0XHQ6IG9NYWluTW9kZWwuYmluZExpc3QoYC8ke2twaURlZmluaXRpb24uZW50aXR5U2V0fWAsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHsgJCRncm91cElkOiBcIiRhdXRvLkxvbmdSdW5uZXJzXCIgfSk7XG5cdFx0Y29uc3Qgb0FnZ3JlZ2F0ZTogUmVjb3JkPHN0cmluZywgeyB1bml0Pzogc3RyaW5nIH0+ID0ge307XG5cblx0XHQvLyBNYWluIHZhbHVlICsgY3VycmVuY3kvdW5pdFxuXHRcdGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC51bml0Py5pc1BhdGgpIHtcblx0XHRcdG9BZ2dyZWdhdGVba3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQucHJvcGVydHlQYXRoXSA9IHsgdW5pdDoga3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudW5pdC52YWx1ZSB9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvQWdncmVnYXRlW2twaURlZmluaXRpb24uZGF0YXBvaW50LnByb3BlcnR5UGF0aF0gPSB7fTtcblx0XHR9XG5cblx0XHQvLyBQcm9wZXJ0eSBmb3IgY3JpdGljYWxpdHlcblx0XHRpZiAoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQuY3JpdGljYWxpdHlQYXRoKSB7XG5cdFx0XHRvQWdncmVnYXRlW2twaURlZmluaXRpb24uZGF0YXBvaW50LmNyaXRpY2FsaXR5UGF0aF0gPSB7fTtcblx0XHR9XG5cblx0XHQvLyBQcm9wZXJ0aWVzIGZvciB0cmVuZCBhbmQgdHJlbmQgY2FsY3VsYXRpb25cblx0XHRpZiAobG9hZEZ1bGwpIHtcblx0XHRcdGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50cmVuZFBhdGgpIHtcblx0XHRcdFx0b0FnZ3JlZ2F0ZVtrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50cmVuZFBhdGhdID0ge307XG5cdFx0XHR9XG5cdFx0XHRpZiAoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudHJlbmRDYWxjdWxhdGlvblJlZmVyZW5jZVBhdGgpIHtcblx0XHRcdFx0b0FnZ3JlZ2F0ZVtrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50cmVuZENhbGN1bGF0aW9uUmVmZXJlbmNlUGF0aF0gPSB7fTtcblx0XHRcdH1cblx0XHRcdGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50YXJnZXRQYXRoKSB7XG5cdFx0XHRcdG9BZ2dyZWdhdGVba3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudGFyZ2V0UGF0aF0gPSB7fTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRvTGlzdEJpbmRpbmcuc2V0QWdncmVnYXRpb24oeyBhZ2dyZWdhdGU6IG9BZ2dyZWdhdGUgfSk7XG5cblx0XHQvLyBNYW5hZ2UgU2VsZWN0aW9uVmFyaWFudCBmaWx0ZXJzXG5cdFx0aWYgKGtwaURlZmluaXRpb24uc2VsZWN0aW9uVmFyaWFudEZpbHRlckRlZmluaXRpb25zPy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGFGaWx0ZXJzID0ga3BpRGVmaW5pdGlvbi5zZWxlY3Rpb25WYXJpYW50RmlsdGVyRGVmaW5pdGlvbnMubWFwKGNyZWF0ZUZpbHRlckZyb21EZWZpbml0aW9uKS5maWx0ZXIoKGZpbHRlcikgPT4ge1xuXHRcdFx0XHRyZXR1cm4gZmlsdGVyICE9PSB1bmRlZmluZWQ7XG5cdFx0XHR9KSBhcyBGaWx0ZXJbXTtcblx0XHRcdG9MaXN0QmluZGluZy5maWx0ZXIoYUZpbHRlcnMpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvTGlzdEJpbmRpbmcucmVxdWVzdENvbnRleHRzKDAsIDEpLnRoZW4oKGFDb250ZXh0czogQ29udGV4dFtdKSA9PiB7XG5cdFx0XHRpZiAoYUNvbnRleHRzLmxlbmd0aCkge1xuXHRcdFx0XHRjb25zdCByYXdVbml0ID0ga3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudW5pdD8uaXNQYXRoXG5cdFx0XHRcdFx0PyBhQ29udGV4dHNbMF0uZ2V0UHJvcGVydHkoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudW5pdC52YWx1ZSlcblx0XHRcdFx0XHQ6IGtwaURlZmluaXRpb24uZGF0YXBvaW50LnVuaXQ/LnZhbHVlO1xuXG5cdFx0XHRcdGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC51bml0ICYmICFyYXdVbml0KSB7XG5cdFx0XHRcdFx0Ly8gQSB1bml0L2N1cnJlbmN5IGlzIGRlZmluZWQsIGJ1dCBpdHMgdmFsdWUgaXMgdW5kZWZpbmVkIC0tPiBtdWx0aS11bml0IHNpdHVhdGlvblxuXHRcdFx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5WYWx1ZWAsIFwiKlwiKTtcblx0XHRcdFx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi9tYWluVmFsdWVVbnNjYWxlZGAsIFwiKlwiKTtcblx0XHRcdFx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi9tYWluVmFsdWVOb1NjYWxlYCwgXCIqXCIpO1xuXHRcdFx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5WYWx1ZVNjYWxlYCwgXCJcIik7XG5cdFx0XHRcdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vbWFpblVuaXRgLCB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5Dcml0aWNhbGl0eWAsIE1lc3NhZ2VUeXBlLk5vbmUpO1xuXHRcdFx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5TdGF0ZWAsIFwiTm9uZVwiKTtcblx0XHRcdFx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi90cmVuZGAsIFwiTm9uZVwiKTtcblx0XHRcdFx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi90YXJnZXROdW1iZXJgLCB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL3RhcmdldFVuaXRgLCB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL2RldmlhdGlvbk51bWJlcmAsIHVuZGVmaW5lZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy51cGRhdGVEYXRhcG9pbnRWYWx1ZUFuZEN1cnJlbmN5KGtwaURlZmluaXRpb24sIGFDb250ZXh0c1swXSwgb0tQSU1vZGVsKTtcblx0XHRcdFx0XHR0aGlzLnVwZGF0ZURhdGFwb2ludENyaXRpY2FsaXR5KGtwaURlZmluaXRpb24sIGFDb250ZXh0c1swXSwgb0tQSU1vZGVsKTtcblxuXHRcdFx0XHRcdGlmIChsb2FkRnVsbCkge1xuXHRcdFx0XHRcdFx0dGhpcy51cGRhdGVEYXRhcG9pbnRUcmVuZChrcGlEZWZpbml0aW9uLCBhQ29udGV4dHNbMF0sIG9LUElNb2RlbCk7XG5cdFx0XHRcdFx0XHR0aGlzLnVwZGF0ZVRhcmdldFZhbHVlKGtwaURlZmluaXRpb24sIGFDb250ZXh0c1swXSwgb0tQSU1vZGVsKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBjYXJkIGRhdGEgZm9yIGEgS1BJLCBhbmQgc3RvcmVzIGl0IGluIHRoZSBKU09OIEtQSSBtb2RlbC5cblx0ICpcblx0ICogQHBhcmFtIGtwaURlZmluaXRpb24gVGhlIGRlZmluaXRpb24gb2YgdGhlIEtQSS5cblx0ICogQHBhcmFtIG9NYWluTW9kZWwgVGhlIG1vZGVsIHVzZWQgdG8gbG9hZCB0aGUgZGF0YS5cblx0ICogQHBhcmFtIG9LUElNb2RlbCBUaGUgSlNPTiBtb2RlbCB3aGVyZSB0aGUgZGF0YSB3aWxsIGJlIHN0b3JlZFxuXHQgKiBAcmV0dXJucyBUaGUgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gZGF0YSBpcyBsb2FkZWQuXG5cdCAqL1xuXHRwcm90ZWN0ZWQgbG9hZEtQSUNhcmREYXRhKGtwaURlZmluaXRpb246IEtQSURlZmluaXRpb24sIG9NYWluTW9kZWw6IE9EYXRhTW9kZWwsIG9LUElNb2RlbDogSlNPTk1vZGVsKTogYW55IHtcblx0XHRjb25zdCBvTGlzdEJpbmRpbmcgPSBvTWFpbk1vZGVsLmJpbmRMaXN0KGAvJHtrcGlEZWZpbml0aW9uLmVudGl0eVNldH1gLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB7XG5cdFx0XHQkJGdyb3VwSWQ6IFwiJGF1dG8uV29ya2Vyc1wiXG5cdFx0fSk7XG5cdFx0Y29uc3Qgb0dyb3VwOiBSZWNvcmQ8c3RyaW5nLCBPYmplY3Q+ID0ge307XG5cdFx0Y29uc3Qgb0FnZ3JlZ2F0ZTogUmVjb3JkPHN0cmluZywgT2JqZWN0PiA9IHt9O1xuXG5cdFx0a3BpRGVmaW5pdGlvbi5jaGFydC5kaW1lbnNpb25zLmZvckVhY2goKGRpbWVuc2lvbikgPT4ge1xuXHRcdFx0b0dyb3VwW2RpbWVuc2lvbi5uYW1lXSA9IHt9O1xuXHRcdH0pO1xuXHRcdGtwaURlZmluaXRpb24uY2hhcnQubWVhc3VyZXMuZm9yRWFjaCgobWVhc3VyZSkgPT4ge1xuXHRcdFx0b0FnZ3JlZ2F0ZVttZWFzdXJlLm5hbWVdID0ge307XG5cdFx0fSk7XG5cdFx0b0xpc3RCaW5kaW5nLnNldEFnZ3JlZ2F0aW9uKHtcblx0XHRcdGdyb3VwOiBvR3JvdXAsXG5cdFx0XHRhZ2dyZWdhdGU6IG9BZ2dyZWdhdGVcblx0XHR9KTtcblxuXHRcdC8vIE1hbmFnZSBTZWxlY3Rpb25WYXJpYW50IGZpbHRlcnNcblx0XHRpZiAoa3BpRGVmaW5pdGlvbi5zZWxlY3Rpb25WYXJpYW50RmlsdGVyRGVmaW5pdGlvbnM/Lmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgYUZpbHRlcnMgPSBrcGlEZWZpbml0aW9uLnNlbGVjdGlvblZhcmlhbnRGaWx0ZXJEZWZpbml0aW9ucy5tYXAoY3JlYXRlRmlsdGVyRnJvbURlZmluaXRpb24pLmZpbHRlcigoZmlsdGVyKSA9PiB7XG5cdFx0XHRcdHJldHVybiBmaWx0ZXIgIT09IHVuZGVmaW5lZDtcblx0XHRcdH0pIGFzIEZpbHRlcltdO1xuXHRcdFx0b0xpc3RCaW5kaW5nLmZpbHRlcihhRmlsdGVycyk7XG5cdFx0fVxuXG5cdFx0Ly8gU29ydGluZ1xuXHRcdGlmIChrcGlEZWZpbml0aW9uLmNoYXJ0LnNvcnRPcmRlcikge1xuXHRcdFx0b0xpc3RCaW5kaW5nLnNvcnQoXG5cdFx0XHRcdGtwaURlZmluaXRpb24uY2hhcnQuc29ydE9yZGVyLm1hcCgoc29ydEluZm8pID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFNvcnRlcihzb3J0SW5mby5uYW1lLCBzb3J0SW5mby5kZXNjZW5kaW5nKTtcblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9MaXN0QmluZGluZy5yZXF1ZXN0Q29udGV4dHMoMCwga3BpRGVmaW5pdGlvbi5jaGFydC5tYXhJdGVtcykudGhlbigoYUNvbnRleHRzOiBDb250ZXh0W10pID0+IHtcblx0XHRcdGNvbnN0IGNoYXJ0RGF0YSA9IGFDb250ZXh0cy5tYXAoZnVuY3Rpb24gKG9Db250ZXh0KSB7XG5cdFx0XHRcdGNvbnN0IG9EYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cdFx0XHRcdGtwaURlZmluaXRpb24uY2hhcnQuZGltZW5zaW9ucy5mb3JFYWNoKChkaW1lbnNpb24pID0+IHtcblx0XHRcdFx0XHRvRGF0YVtkaW1lbnNpb24ubmFtZV0gPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShkaW1lbnNpb24ubmFtZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRrcGlEZWZpbml0aW9uLmNoYXJ0Lm1lYXN1cmVzLmZvckVhY2goKG1lYXN1cmUpID0+IHtcblx0XHRcdFx0XHRvRGF0YVttZWFzdXJlLm5hbWVdID0gb0NvbnRleHQuZ2V0UHJvcGVydHkobWVhc3VyZS5uYW1lKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0dXJuIG9EYXRhO1xuXHRcdFx0fSk7XG5cblx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL2NoYXJ0RGF0YWAsIGNoYXJ0RGF0YSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgcG9wb3ZlciB0byBkaXNwbGF5IHRoZSBLUEkgY2FyZFxuXHQgKiBUaGUgcG9wb3ZlciBhbmQgdGhlIGNvbnRhaW5lZCBjYXJkIGZvciB0aGUgS1BJcyBhcmUgY3JlYXRlZCBpZiBuZWNlc3NhcnkuXG5cdCAqIFRoZSBwb3BvdmVyIGlzIHNoYXJlZCBiZXR3ZWVuIGFsbCBLUElzLCBzbyBpdCdzIGNyZWF0ZWQgb25seSBvbmNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0tQSVRhZyBUaGUgdGFnIHRoYXQgdHJpZ2dlcmVkIHRoZSBwb3BvdmVyIG9wZW5pbmcuXG5cdCAqIEByZXR1cm5zIFRoZSBzaGFyZWQgcG9wb3ZlciBhcyBhIHByb21pc2UuXG5cdCAqL1xuXHRwcm90ZWN0ZWQgZ2V0UG9wb3ZlcihvS1BJVGFnOiBHZW5lcmljVGFnKTogUHJvbWlzZTxQb3BvdmVyPiB7XG5cdFx0aWYgKCF0aGlzLm9Qb3BvdmVyKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0XHRDb3JlLmxvYWRMaWJyYXJ5KFwic2FwL3VpL2ludGVncmF0aW9uXCIsIHsgYXN5bmM6IHRydWUgfSlcblx0XHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRzYXAudWkucmVxdWlyZShbXCJzYXAvdWkvaW50ZWdyYXRpb24vd2lkZ2V0cy9DYXJkXCIsIFwic2FwL3VpL2ludGVncmF0aW9uL0hvc3RcIl0sIChDYXJkOiBhbnksIEhvc3Q6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvSG9zdCA9IG5ldyBIb3N0KCk7XG5cblx0XHRcdFx0XHRcdFx0b0hvc3QuYXR0YWNoQWN0aW9uKChvRXZlbnQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNUeXBlID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInR5cGVcIik7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb1BhcmFtcyA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJwYXJhbWV0ZXJzXCIpO1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHNUeXBlID09PSBcIk5hdmlnYXRpb25cIikge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9QYXJhbXMuc2VtYW50aWNPYmplY3QpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0KHRoaXMuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ubmF2aWdhdGUoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b1BhcmFtcy5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvUGFyYW1zLmFjdGlvblxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0KHRoaXMuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ubmF2aWdhdGVPdXRib3VuZChvUGFyYW1zLm91dGJvdW5kKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdHRoaXMub0NhcmQgPSBuZXcgQ2FyZCh7XG5cdFx0XHRcdFx0XHRcdFx0d2lkdGg6IFwiMjVyZW1cIixcblx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6IFwiYXV0b1wiXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR0aGlzLm9DYXJkLnNldEhvc3Qob0hvc3QpO1xuXG5cdFx0XHRcdFx0XHRcdHRoaXMub1BvcG92ZXIgPSBuZXcgUG9wb3ZlcihcImtwaS1Qb3BvdmVyXCIsIHtcblx0XHRcdFx0XHRcdFx0XHRzaG93SGVhZGVyOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0XHRwbGFjZW1lbnQ6IFwiQXV0b1wiLFxuXHRcdFx0XHRcdFx0XHRcdGNvbnRlbnQ6IFt0aGlzLm9DYXJkXVxuXHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRvS1BJVGFnLmFkZERlcGVuZGVudCh0aGlzLm9Qb3BvdmVyKTsgLy8gVGhlIGZpcnN0IGNsaWNrZWQgdGFnIGdldHMgdGhlIHBvcG92ZXIgYXMgZGVwZW5kZW50XG5cblx0XHRcdFx0XHRcdFx0cmVzb2x2ZSh0aGlzLm9Qb3BvdmVyKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJlamVjdCgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5vUG9wb3Zlcik7XG5cdFx0fVxuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdHB1YmxpYyBvbktQSVByZXNzZWQob0tQSVRhZzogYW55LCBrcGlJRDogc3RyaW5nKTogdm9pZCB7XG5cdFx0Y29uc3Qgb0tQSU1vZGVsID0gb0tQSVRhZy5nZXRNb2RlbChcImtwaU1vZGVsXCIpIGFzIEpTT05Nb2RlbDtcblxuXHRcdGlmICh0aGlzLmFLUElEZWZpbml0aW9ucyAmJiB0aGlzLmFLUElEZWZpbml0aW9ucy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGtwaURlZmluaXRpb24gPSB0aGlzLmFLUElEZWZpbml0aW9ucy5maW5kKGZ1bmN0aW9uIChvRGVmKSB7XG5cdFx0XHRcdHJldHVybiBvRGVmLmlkID09PSBrcGlJRDtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoa3BpRGVmaW5pdGlvbikge1xuXHRcdFx0XHRjb25zdCBvTW9kZWwgPSBvS1BJVGFnLmdldE1vZGVsKCk7XG5cdFx0XHRcdGNvbnN0IGFQcm9taXNlcyA9IFtcblx0XHRcdFx0XHR0aGlzLmxvYWRLUElUYWdEYXRhKGtwaURlZmluaXRpb24sIG9Nb2RlbCwgb0tQSU1vZGVsLCB0cnVlKSxcblx0XHRcdFx0XHR0aGlzLmxvYWRLUElDYXJkRGF0YShrcGlEZWZpbml0aW9uLCBvTW9kZWwsIG9LUElNb2RlbCksXG5cdFx0XHRcdFx0dGhpcy5nZXRQb3BvdmVyKG9LUElUYWcpXG5cdFx0XHRcdF07XG5cblx0XHRcdFx0UHJvbWlzZS5hbGwoYVByb21pc2VzKVxuXHRcdFx0XHRcdC50aGVuKChhUmVzdWx0cykgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5vQ2FyZC5zZXRNYW5pZmVzdChvS1BJTW9kZWwuZ2V0UHJvcGVydHkoYC8ke2twaUlEfS9tYW5pZmVzdGApKTtcblx0XHRcdFx0XHRcdHRoaXMub0NhcmQucmVmcmVzaCgpO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBvUG9wb3ZlciA9IGFSZXN1bHRzWzJdO1xuXHRcdFx0XHRcdFx0b1BvcG92ZXIub3BlbkJ5KG9LUElUYWcsIGZhbHNlKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaCgoZXJyKSA9PiB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoZXJyKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS1BJTWFuYWdlbWVudENvbnRyb2xsZXJFeHRlbnNpb247XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7OztFQXFCQSxNQUFNQSwwQkFBdUQsR0FBRztJQUMvRCxH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