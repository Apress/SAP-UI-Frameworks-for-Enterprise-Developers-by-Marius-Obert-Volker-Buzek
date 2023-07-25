/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
sap.ui.define(["../ComparisonOperator", "../ComplexCondition", "../Filter", "../HierarchyDisplayType", "../HierarchyNodePath", "../LogicalOperator", "../SearchQuery", "../SearchResultSetItemAttribute", "../SearchResultSetItemAttributeGroup", "../SimpleCondition", "./Formatter"], function (___ComparisonOperator, ___ComplexCondition, ___Filter, ___HierarchyDisplayType, ___HierarchyNodePath, ___LogicalOperator, ___SearchQuery, ___SearchResultSetItemAttribute, ___SearchResultSetItemAttributeGroup, ___SimpleCondition, ___Formatter) {
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
  }
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
        result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn(this, result);
    };
  }
  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }
    return _assertThisInitialized(self);
  }
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var ComparisonOperator = ___ComparisonOperator["ComparisonOperator"];
  var ComplexCondition = ___ComplexCondition["ComplexCondition"];
  var Filter = ___Filter["Filter"];
  var HierarchyDisplayType = ___HierarchyDisplayType["HierarchyDisplayType"];
  var HierarchyNodePath = ___HierarchyNodePath["HierarchyNodePath"];
  var LogicalOperator = ___LogicalOperator["LogicalOperator"];
  var SearchQuery = ___SearchQuery["SearchQuery"];
  var SearchResultSetItemAttribute = ___SearchResultSetItemAttribute["SearchResultSetItemAttribute"];
  var SearchResultSetItemAttributeGroup = ___SearchResultSetItemAttributeGroup["SearchResultSetItemAttributeGroup"];
  var SimpleCondition = ___SimpleCondition["SimpleCondition"];
  var Formatter = ___Formatter["Formatter"];
  var HierarchyResultSetFormatter = /*#__PURE__*/function (_Formatter) {
    _inherits(HierarchyResultSetFormatter, _Formatter);
    var _super = _createSuper(HierarchyResultSetFormatter);
    function HierarchyResultSetFormatter() {
      _classCallCheck(this, HierarchyResultSetFormatter);
      return _super.apply(this, arguments);
    }
    _createClass(HierarchyResultSetFormatter, [{
      key: "initAsync",
      value:
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      function initAsync() {
        return Promise.resolve();
      }
    }, {
      key: "format",
      value: function format(resultSet) {
        return resultSet;
      }
    }, {
      key: "formatAsync",
      value: function formatAsync(resultSet) {
        try {
          var _constructNavigationTarget, navigationDataSources;
          /*
           * Util functions
           */
          var _getNavigationHierarchyDataSources = function _getNavigationHierarchyDataSources(sina, hierarchyAttrId, hierarchyName, dataSource) {
            var navigationDataSources = [];
            if (hierarchyAttrId !== null && hierarchyAttrId !== void 0 && hierarchyAttrId.length && sina) {
              var boDataSources = sina.getBusinessObjectDataSources();
              boDataSources.forEach(function (boDataSource) {
                if (boDataSource.hierarchyHelperDatasource === dataSource) {
                  navigationDataSources.push(boDataSource);
                } else if (boDataSource.hierarchyName === hierarchyAttrId) {
                  // avoid self reference
                  return;
                } else {
                  boDataSource.attributesMetadata.forEach(function (attribute) {
                    if (attribute.hierarchyName === hierarchyName && attribute.id === hierarchyAttrId && attribute.hierarchyDisplayType === HierarchyDisplayType.HierarchyResultView || attribute.hierarchyDisplayType === HierarchyDisplayType.StaticHierarchyFacet) {
                      navigationDataSources.push(boDataSource);
                    }
                  });
                }
              });
            }
            return navigationDataSources;
          };

          // Prepare title as value label in filter condition
          var _assembleTitle = function _assembleTitle(result) {
            var titleValueArray = [];
            result.titleAttributes.forEach(function (titleAttr) {
              if (titleAttr instanceof SearchResultSetItemAttributeGroup && Array.isArray(titleAttr.attributes)) {
                titleAttr.attributes.forEach(function (subAttributeGroup) {
                  if (subAttributeGroup.attribute && subAttributeGroup.attribute.value.startsWith("sap-icon://") !== true) {
                    titleValueArray.push(subAttributeGroup.attribute.valueFormatted);
                  }
                });
              } else if (titleAttr instanceof SearchResultSetItemAttribute) {
                if (titleAttr.value.startsWith("sap-icon://") !== true) {
                  titleValueArray.push(titleAttr.valueFormatted);
                }
              }
            });
            return titleValueArray.join("; ");
          };

          // Assemble hiearchy down navigation link as title navigation
          var _assembleChildrenNavigation = function _assembleChildrenNavigation(result, attrName, attrValue, attrValueLabel, dataSource) {
            var childrenCondition = new SimpleCondition({
              attribute: attrName,
              operator: ComparisonOperator.ChildOf,
              value: attrValue,
              valueLabel: attrValueLabel
            });
            var wrapComplexConditionFolder = new ComplexCondition({
              operator: LogicalOperator.And,
              conditions: [childrenCondition]
            });
            var rootConditionFolder = new ComplexCondition({
              operator: LogicalOperator.And,
              conditions: [wrapComplexConditionFolder]
            });
            var filterFolder = new Filter({
              dataSource: dataSource,
              searchTerm: "*",
              //navigation mode, ignore content in search input box
              rootCondition: rootConditionFolder,
              sina: result.sina
            });
            result.defaultNavigationTarget = _constructNavigationTarget(filterFolder, result.sina);
          };
          _constructNavigationTarget = function _constructNavigationTarget(filter, sina, label) {
            if (sina.configuration.updateUrl === true) {
              var top = sina.configuration.pageSize || 10;
              var parameters = {
                top: top,
                filter: encodeURIComponent(JSON.stringify(filter.toJson()))
              };
              var urlFolder = sina.configuration.renderSearchUrl(parameters);
              return sina._createNavigationTarget({
                targetUrl: urlFolder,
                label: label || urlFolder,
                target: "_self"
              });
            } else {
              return sina._createNavigationTarget({
                targetFunction: sina.filterBasedSearch,
                label: label || "",
                filter: filter
              });
            }
          }; // Assemble down navigation to related descendants as bottom navigation toolbar link
          var _assembleDecendantsNavigations = function _assembleDecendantsNavigations(result, attrName, attrValue, attrValueLabel) {
            var datasetCondition = new SimpleCondition({
              attribute: attrName,
              operator: ComparisonOperator.DescendantOf,
              value: attrValue,
              valueLabel: attrValueLabel
            });
            var wrapComplexConditionDS = new ComplexCondition({
              operator: LogicalOperator.And,
              conditions: [datasetCondition]
            });
            var rootConditionDS = new ComplexCondition({
              operator: LogicalOperator.And,
              conditions: [wrapComplexConditionDS]
            });
            navigationDataSources.forEach(function (navigationDataSource) {
              var filterDS = new Filter({
                dataSource: navigationDataSource,
                searchTerm: "*",
                //navigation mode, ignore content in search input box
                rootCondition: rootConditionDS,
                sina: result.sina
              });
              result.navigationTargets.push(_constructNavigationTarget(filterDS, result.sina, navigationDataSource.labelPlural));
            });
          };

          /*
           * Body
           */
          // Only reformat search results instead of facet items
          // The second condition is to exclude hierarchy facets which also send SearchQuery
          if (!(resultSet.query instanceof SearchQuery) || resultSet.query.top > 99) {
            return _await(resultSet);
          }
          var dataSource = resultSet.query.filter.dataSource;
          if (resultSet.sina.configuration.FF_hierarchyBreadcrumbs !== true || dataSource.isHierarchyDefinition !== true && !dataSource.hierarchyHelperDatasource) {
            return _await(resultSet);
          }
          var hierarchyAttribute = dataSource.hierarchyAttribute;
          var hierarchyName = dataSource.hierarchyName;
          navigationDataSources = [];
          if (dataSource.hierarchyHelperDatasource) {
            hierarchyAttribute = dataSource.hierarchyHelperDatasource.hierarchyAttribute;
            navigationDataSources.push(dataSource);
          } else {
            navigationDataSources = _getNavigationHierarchyDataSources(dataSource.sina, hierarchyAttribute, hierarchyName, dataSource);
          }
          if (navigationDataSources.length === 0) {
            return _await(resultSet);
          }
          resultSet.items.forEach(function (result) {
            // init
            var attrName = "";
            var attrValue = "";
            var attrValueLabel = "";
            var mergedTitleValues = _assembleTitle(result);

            // find hierarchical attribute
            var hierarchyAttr = result.attributes.find(function (attr) {
              return attr.id === hierarchyAttribute;
            });
            if (hierarchyAttr) {
              var _navigationDataSource, _navigationDataSource2;
              attrName = hierarchyAttr.id;
              attrValue = hierarchyAttr.value;
              attrValueLabel = mergedTitleValues || hierarchyAttr.value;
              if (Array.isArray(result.hierarchyNodePaths) && result.hierarchyNodePaths.length > 0 && result.hierarchyNodePaths[0] instanceof HierarchyNodePath && result.hierarchyNodePaths[0].name === attrName && Array.isArray(result.hierarchyNodePaths[0].path) && result.hierarchyNodePaths[0].path.length > 0) {
                var nodePaths = result.hierarchyNodePaths[0].path;
                var lastNode = nodePaths[nodePaths.length - 1];
                attrValue = lastNode.id;
              }
              _assembleChildrenNavigation(result, attrName, attrValue, attrValueLabel, dataSource);
              // Add new hierarchical navigation target
              // only when navigationDataSource has HierarchyResultView as display type
              if (((_navigationDataSource = navigationDataSources[0]) === null || _navigationDataSource === void 0 ? void 0 : (_navigationDataSource2 = _navigationDataSource.attributeMetadataMap[attrName]) === null || _navigationDataSource2 === void 0 ? void 0 : _navigationDataSource2.hierarchyDisplayType) == HierarchyDisplayType.HierarchyResultView) {
                _assembleDecendantsNavigations(result, attrName, attrValue, attrValueLabel);
              }
            }
          });
          return _await(resultSet);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }]);
    return HierarchyResultSetFormatter;
  }(Formatter);
  var __exports = {
    __esModule: true
  };
  __exports.HierarchyResultSetFormatter = HierarchyResultSetFormatter;
  return __exports;
});
})();