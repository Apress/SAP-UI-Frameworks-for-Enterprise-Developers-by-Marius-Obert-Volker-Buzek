/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./pivotTableParser", "./typeConverter", "../../sina/ComparisonOperator", "../../sina/SearchQuery", "../../sina/LogicalOperator", "../../core/errors"], function (pivotTableParser, typeConverter, ____sina_ComparisonOperator, ____sina_SearchQuery, ____sina_LogicalOperator, ____core_errors) {
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
  var ComparisonOperator = ____sina_ComparisonOperator["ComparisonOperator"];
  var SearchQuery = ____sina_SearchQuery["SearchQuery"];
  var LogicalOperator = ____sina_LogicalOperator["LogicalOperator"];
  var FacetsParseError = ____core_errors["FacetsParseError"]; // sinaDefine(['../../core/core', './pivotTableParser', '../../sina/SearchQuery', './typeConverter'], function (core, pivotTableParser, SearchQuery, typeConverter) {
  var FacetParser = /*#__PURE__*/function () {
    function FacetParser(provider) {
      _classCallCheck(this, FacetParser);
      this.provider = provider;
      this.sina = provider.sina;
    }
    _createClass(FacetParser, [{
      key: "parse",
      value: function parse(query, data) {
        var facets = [];
        if (!data.ResultsetFacets || !data.ResultsetFacets.Elements) {
          return [];
        }
        for (var i = 0; i < data.ResultsetFacets.Elements.length; i++) {
          var facetData = data.ResultsetFacets.Elements[i];
          var dimension = facetData.Metadata.Cube.ObjectName;
          if (dimension === "$$DataSources$$") {
            facets.push(this.parseDataSourceFacet(query, facetData));
          } else {
            if (query.filter.dataSource.type === query.sina.DataSourceType.Category) {
              continue; // ignore common attributes facets
            }

            facets.push(this.parseChartFacet(query, facetData));
          }
        }
        return Promise.all(facets);
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
        var facet = pivotTableParser.parse(facetData.ResultSet);
        var items = [];
        for (var i = 0; i < facet.cells.length; i++) {
          var cell = facet.cells[i];

          // create filter (used when clicking on the item)
          var dataSource = this.sina.getDataSource(cell.$$DataSource$$[0].Value);
          if (!dataSource) {
            dataSource = this.sina._createDataSource({
              type: this.sina.DataSourceType.Category,
              id: cell.$$DataSource$$[0].Value,
              label: cell.$$DataSource$$[0].ValueFormatted
            });
          }

          // create item
          items.push(this.sina._createDataSourceResultSetItem({
            dataSource: dataSource,
            dimensionValueFormatted: cell.$$DataSource$$[0].ValueFormatted,
            measureValue: cell.Value,
            measureValueFormatted: cell.ValueFormatted
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
        switch (cell.$$AttributeValue$$.length) {
          case 2:
            return this.sina.createSimpleCondition({
              attribute: attributeId,
              value: typeConverter.ina2Sina(metadata.type, cell.$$AttributeValue$$[0].Value),
              attributeLabel: metadata.label,
              valueLabel: cell.$$AttributeValue$$[0].ValueFormatted
            });
          case 3:
            {
              var complexCondition = this.sina.createComplexCondition({
                attributeLabel: metadata.label,
                valueLabel: cell.$$AttributeValue$$[0].ValueFormatted,
                operator: LogicalOperator.And
              });
              var conditions = [];
              if (cell.$$AttributeValue$$[1].Value) {
                conditions.push(this.sina.createSimpleCondition({
                  attribute: attributeId,
                  operator: ComparisonOperator.Ge,
                  value: typeConverter.ina2Sina(metadata.type, cell.$$AttributeValue$$[1].Value)
                }));
              }
              if (cell.$$AttributeValue$$[2].Value) {
                conditions.push(this.sina.createSimpleCondition({
                  attribute: attributeId,
                  operator: ComparisonOperator.Le,
                  value: typeConverter.ina2Sina(metadata.type, cell.$$AttributeValue$$[2].Value)
                }));
              }
              complexCondition.conditions = conditions;
              return complexCondition;
            }
          default:
            throw new FacetsParseError("parse error facets");
        }
      }
    }, {
      key: "parseChartFacet",
      value: function parseChartFacet(query, facetData) {
        var dataSource = this.sina.getDataSource(facetData.Metadata.Cube.DataSource.ObjectName);
        var attributeId = facetData.Metadata.Cube.ObjectName;
        var metadata = dataSource.getAttributeMetadata(attributeId);

        // for search query with attribute facet: create corresponding chart query
        var chartQuery = query;
        if (query instanceof SearchQuery) {
          var filter = query.filter.clone();
          filter.setDataSource(dataSource); // relevant only for common attribute facets
          filter.setRootCondition(query.filter.rootCondition.clone()); // changing ds removes condition
          chartQuery = this.sina.createChartQuery({
            filter: filter,
            dimension: facetData.Metadata.Cube.ObjectName
          });
        }

        // create result set items
        var facet = pivotTableParser.parse(facetData.ResultSet);
        var items = [];
        for (var i = 0; i < facet.cells.length; i++) {
          var cell = facet.cells[i];
          items.push(this.sina._createChartResultSetItem({
            filterCondition: this.createAttributeFilterCondition(attributeId, metadata, cell),
            dimensionValueFormatted: cell.$$AttributeValue$$[0].ValueFormatted || cell.$$AttributeValue$$[0].Value,
            measureValue: cell.Value,
            measureValueFormatted: cell.ValueFormatted
          }));
        }

        // create result set
        var resultSet = this.sina._createChartResultSet({
          title: metadata.label,
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