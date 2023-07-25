/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/SearchQuery", "./typeConverter", "../../sina/LogicalOperator", "../../sina/ComparisonOperator", "../../core/Log", "../../core/errors", "./HierarchyParser"], function (____sina_SearchQuery, typeConverter, ____sina_LogicalOperator, ____sina_ComparisonOperator, ____core_Log, ____core_errors, ___HierarchyParser) {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var SearchQuery = ____sina_SearchQuery["SearchQuery"];
  var LogicalOperator = ____sina_LogicalOperator["LogicalOperator"];
  var ComparisonOperator = ____sina_ComparisonOperator["ComparisonOperator"];
  var Log = ____core_Log["Log"];
  var FacetsParseError = ____core_errors["FacetsParseError"];
  var InternalServerError = ____core_errors["InternalServerError"];
  var HierarchyParser = ___HierarchyParser["HierarchyParser"];
  var FacetParser = /*#__PURE__*/function () {
    function FacetParser(provider) {
      _classCallCheck(this, FacetParser);
      this.provider = provider;
      this.sina = provider.sina;
      this.log = new Log("hana_odata facet parser");
    }
    _createClass(FacetParser, [{
      key: "parse",
      value: function parse(query, data) {
        try {
          const _this = this;
          var hierarchyParser = new HierarchyParser();
          var value = data["@com.sap.vocabularies.Search.v1.Facets"];
          if (data.error && !value) {
            return Promise.reject(new InternalServerError(data.error.message));
          }
          if (!value) {
            return Promise.resolve([]);
          }
          if (data.error) {
            _this.log.warn("Server-side Warning: " + data.error.message);
          }
          var facets = [];
          for (var i = 0; i < value.length; i++) {
            var facetData = value[i];

            // var dimension = '';
            // if (query.dimension) {
            //     dimension = query.dimension;
            // } else if (facetData["@com.sap.vocabularies.Search.v1.Facet"] && facetData["@com.sap.vocabularies.Search.v1.Facet"].Dimensions && facetData["@com.sap.vocabularies.Search.v1.Facet"].Dimensions[0] && facetData["@com.sap.vocabularies.Search.v1.Facet"].Dimensions[0].PropertyName) {
            //     dimension = facetData["@com.sap.vocabularies.Search.v1.Facet"]["Dimensions"][0].PropertyName;
            // }

            var resultSet = void 0;
            if (query.filter.dataSource === query.sina.getAllDataSource()) {
              try {
                resultSet = _this.parseDataSourceFacet(query, facetData);
              } catch (e1) {
                _this.log.warn("Error occurred by parsing dataource item number " + i + ": " + e1.message);
                continue;
              }
            } else {
              if (query.filter.dataSource.type === query.sina.DataSourceType.Category) {
                continue; // ignore common attributes facets
              }

              if (facetData["@com.sap.vocabularies.Search.v1.Facet"].Dimensions[0].PropertyType === "GeometryPolygonFacet") {
                continue;
              }
              try {
                var attributeMetadata = _this.parseFacetAttribute(query, facetData);
                if (attributeMetadata.isHierarchy) {
                  resultSet = hierarchyParser.parseHierarchyFacet(query, attributeMetadata, facetData);
                } else {
                  resultSet = _this.parseChartFacet(query, attributeMetadata, facetData);
                }
              } catch (e1) {
                var itemsInString = "";
                if (facetData.Items && Array.isArray(facetData.Items)) {
                  itemsInString = JSON.stringify(facetData);
                }
                _this.log.warn("Error occurred by parsing facet " + (facetData["@com.sap.vocabularies.Common.v1.Label"] || "") + "', facet position: " + i + ": " + e1.message + "; item data: " + itemsInString);
                continue;
              }
            }
            facets.push(resultSet);
          }
          return Promise.all(facets);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "parseDataSourceFacet",
      value: function parseDataSourceFacet(query, facetData) {
        // for search query with datasource facet: create corresponding datasource query
        var dataSourceQuery = query;
        if (query instanceof SearchQuery) {
          dataSourceQuery = this.sina.createDataSourceQuery({
            dataSource: query.filter.dataSource,
            filter: query.filter.clone()
          });
        }

        // assemble results set items
        var items = [];
        for (var i = 0; i < facetData.Items.length; i++) {
          var cell = facetData.Items[i];

          // create filter (used when clicking on the item)
          var dataSource = this.sina.getDataSource(cell.scope);
          if (!dataSource) {
            dataSource = this.sina.createDataSource({
              type: this.sina.DataSourceType.Category,
              id: cell.ValueLow,
              label: cell.Description
            });
          }

          // create item
          items.push(this.sina._createDataSourceResultSetItem({
            dataSource: dataSource,
            dimensionValueFormatted: dataSource.labelPlural,
            measureValue: cell._Count,
            measureValueFormatted: cell._Count.toString()
          }));
        }

        // create result set
        var resultSet = this.sina._createDataSourceResultSet({
          title: query.filter.dataSource.label,
          items: items,
          query: dataSourceQuery
        });

        // init query with result set
        if (query instanceof SearchQuery) {
          return dataSourceQuery._setResultSet(resultSet);
        }
        return resultSet;
      }
    }, {
      key: "createAttributeFilterCondition",
      value: function createAttributeFilterCondition(attributeId, metadata, cell) {
        if (_typeof(cell[attributeId]) === "object" && (Object.prototype.hasOwnProperty.call(cell[attributeId], "From") || Object.prototype.hasOwnProperty.call(cell[attributeId], "From"))) {
          // Range Condition
          var finalCondition = this.sina.createComplexCondition({
            attributeLabel: metadata.label,
            valueLabel: this.formatFacetValue(cell[attributeId]),
            operator: LogicalOperator.And,
            conditions: []
          });
          var lowBoundCondition, upperBoundCondition;
          if (!cell[attributeId].From) {
            upperBoundCondition = this.sina.createSimpleCondition({
              attribute: attributeId,
              operator: ComparisonOperator.Le,
              value: typeConverter.odata2Sina(metadata.type, cell[attributeId].To)
            });
            finalCondition.conditions.push(upperBoundCondition);
          } else if (!cell[attributeId].To) {
            lowBoundCondition = this.sina.createSimpleCondition({
              attribute: attributeId,
              operator: ComparisonOperator.Ge,
              value: typeConverter.odata2Sina(metadata.type, cell[attributeId].From)
            });
            finalCondition.conditions.push(lowBoundCondition);
          } else {
            lowBoundCondition = this.sina.createSimpleCondition({
              attribute: attributeId,
              operator: ComparisonOperator.Ge,
              value: typeConverter.odata2Sina(metadata.type, cell[attributeId].From)
            });
            finalCondition.conditions.push(lowBoundCondition);
            upperBoundCondition = this.sina.createSimpleCondition({
              attribute: attributeId,
              operator: ComparisonOperator.Le,
              value: typeConverter.odata2Sina(metadata.type, cell[attributeId].To)
            });
            finalCondition.conditions.push(upperBoundCondition);
          }
          return finalCondition;
        }
        // Single Condition
        var valueLabel = typeConverter.odata2Sina(metadata.type, cell[attributeId]);
        var textElementValue = cell[attributeId + "@com.sap.vocabularies.Common.v1.Text"];
        if (typeof textElementValue === "string" && textElementValue.length > 0) {
          if (textElementValue.startsWith("sap-icon://") === false) {
            valueLabel = textElementValue;
          }
        }
        return this.sina.createSimpleCondition({
          attributeLabel: metadata.label,
          attribute: attributeId,
          value: cell[attributeId],
          valueLabel: valueLabel
        });
      }
    }, {
      key: "formatFacetValue",
      value: function formatFacetValue(value /**metadata*/) {
        var initialValue = "";
        // if (metadata.type === 'Double' || metadata.type === 'Integer') {
        //     initialValue = 0;
        // }

        if (value["@com.sap.vocabularies.Common.v1.Label"]) {
          return value["@com.sap.vocabularies.Common.v1.Label"];
        }
        if (_typeof(value) === "object" && (Object.prototype.hasOwnProperty.call(value, "From") || Object.prototype.hasOwnProperty.call(value, "To"))) {
          value = (value.From || initialValue) + "..." + (value.To || initialValue);
        }
        return value;
      }
    }, {
      key: "parseFacetAttribute",
      value: function parseFacetAttribute(query, facetData) {
        var dataSource = query.filter.dataSource;
        var attributeId = "";
        if (query.dimension) {
          attributeId = query.dimension;
        } else {
          if (facetData["@com.sap.vocabularies.Search.v1.Facet"] && facetData["@com.sap.vocabularies.Search.v1.Facet"].Dimensions && facetData["@com.sap.vocabularies.Search.v1.Facet"].Dimensions[0] && facetData["@com.sap.vocabularies.Search.v1.Facet"].Dimensions[0].PropertyName) {
            attributeId = facetData["@com.sap.vocabularies.Search.v1.Facet"].Dimensions[0].PropertyName;
          } else {
            throw new FacetsParseError("parse error facets");
          }
        }
        var metadata = dataSource.getAttributeMetadata(attributeId);
        return metadata;
      }
    }, {
      key: "parseChartFacet",
      value: function parseChartFacet(query, attributeMetadata, facetData) {
        var _attributeMetadata$us, _attributeMetadata$us2;
        var dataSource = query.filter.dataSource;
        var items = [];
        // for search query with attribute facet: create corresponding chart query
        var chartQuery = query;
        var filter = query.filter.clone();
        filter.setDataSource(dataSource); // relevant only for common attribute facets
        filter.setRootCondition(query.filter.rootCondition.clone()); // changing ds removes condition
        chartQuery = this.sina.createChartQuery({
          filter: filter,
          dimension: attributeMetadata.id
        });
        // Check whether items contains at least one icon
        // If yes, placeholder sap-icon://none shall be applied for items that have no icon in this facet

        // TODO: attributeMetadata.id + "@com.sap.vocabularies.Common.v1.Text" for facet icon is used in repo as a workaround
        // and will be replaced by attributeMetadata.usage?.AdvancedSearch?.iconUrlAttributeName
        // Facet doesn't need to be checked becaused Facet is always AdvancedSearch
        var iconPropertyName = ((_attributeMetadata$us = attributeMetadata.usage) === null || _attributeMetadata$us === void 0 ? void 0 : (_attributeMetadata$us2 = _attributeMetadata$us.AdvancedSearch) === null || _attributeMetadata$us2 === void 0 ? void 0 : _attributeMetadata$us2.iconUrlAttributeName) || attributeMetadata.id + "@com.sap.vocabularies.Common.v1.Text";
        var isIconContained = facetData.Items.findIndex(function (item) {
          var _item$iconPropertyNam;
          return (_item$iconPropertyNam = item[iconPropertyName]) === null || _item$iconPropertyNam === void 0 ? void 0 : _item$iconPropertyNam.startsWith("sap-icon://");
        }) > -1;
        // create result set items
        for (var i = 0; i < facetData.Items.length; i++) {
          var cell = facetData.Items[i];
          var textElementValue = cell[attributeMetadata.id + "@com.sap.vocabularies.Common.v1.Text"];
          var icon = "";
          if (isIconContained === true) {
            icon = "sap-icon://none";
          }
          var dimensionValueFormatted = this.formatFacetValue(cell[attributeMetadata.id]);
          if (typeof textElementValue === "string" && textElementValue.length > 0) {
            if (textElementValue.startsWith("sap-icon://")) {
              icon = textElementValue;
            } else {
              var _attributeMetadata$us3, _attributeMetadata$us4;
              dimensionValueFormatted = textElementValue;
              icon = cell[(_attributeMetadata$us3 = attributeMetadata.usage) === null || _attributeMetadata$us3 === void 0 ? void 0 : (_attributeMetadata$us4 = _attributeMetadata$us3.AdvancedSearch) === null || _attributeMetadata$us4 === void 0 ? void 0 : _attributeMetadata$us4.iconUrlAttributeName] || icon;
            }
          } else {
            var _attributeMetadata$us5, _attributeMetadata$us6;
            icon = cell[(_attributeMetadata$us5 = attributeMetadata.usage) === null || _attributeMetadata$us5 === void 0 ? void 0 : (_attributeMetadata$us6 = _attributeMetadata$us5.AdvancedSearch) === null || _attributeMetadata$us6 === void 0 ? void 0 : _attributeMetadata$us6.iconUrlAttributeName] || icon;
          }
          items.push(this.sina._createChartResultSetItem({
            filterCondition: this.createAttributeFilterCondition(attributeMetadata.id, attributeMetadata, cell),
            dimensionValueFormatted: dimensionValueFormatted,
            measureValue: cell._Count,
            measureValueFormatted: cell._Count,
            icon: icon
          }));
        }

        // create result set
        var resultSet = this.sina._createChartResultSet({
          title: attributeMetadata.label,
          items: items,
          query: chartQuery
        });

        // init query with result set
        if (query instanceof SearchQuery) {
          return chartQuery._setResultSet(resultSet);
        }
        return resultSet;
      }
    }]);
    return FacetParser;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.FacetParser = FacetParser;
  return __exports;
});
})();