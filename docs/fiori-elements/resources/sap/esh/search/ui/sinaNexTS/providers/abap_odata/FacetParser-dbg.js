/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/ComparisonOperator", "../../sina/LogicalOperator", "../../sina/SearchQuery", "./typeConverter"], function (____sina_ComparisonOperator, ____sina_LogicalOperator, ____sina_SearchQuery, typeConverter) {
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
  var ComparisonOperator = ____sina_ComparisonOperator["ComparisonOperator"];
  var LogicalOperator = ____sina_LogicalOperator["LogicalOperator"];
  var SearchQuery = ____sina_SearchQuery["SearchQuery"];
  var FacetParser = /*#__PURE__*/function () {
    function FacetParser(provider) {
      _classCallCheck(this, FacetParser);
      this.provider = provider;
      this.sina = provider.sina;
    }
    _createClass(FacetParser, [{
      key: "parse",
      value: function parse(query, data) {
        if (data.ValueHelp) {
          this.prepareValueHelpFacet(query, data);
        }
        var facets = [];
        if (!data.Facets || !data.Facets.results) {
          return [];
        }
        for (var i = 0; i < data.Facets.results.length; i++) {
          var facetData = data.Facets.results[i];
          var dimension = facetData.Type;
          if (dimension === "DataSource") {
            facets.push(this.parseDataSourceFacet(query, facetData));
          } else {
            if (query.filter.dataSource.type === query.sina.DataSourceType.Category ||
            // ignore common attributes facets
            query.filter.dataSource.type === query.sina.DataSourceType.UserCategory // ignore attributes facets
            ) {
              continue;
            }
            facets.push(this.parseChartFacet(query, facetData));
          }
        }
        return Promise.all(facets);
      }
    }, {
      key: "prepareValueHelpFacet",
      value: function prepareValueHelpFacet(query, data) {
        var sourceFacetItems = data.ValueHelp.results;
        var dataSource = this.sina.getDataSource(query.filter.dataSource.id);
        var attributeId = data.ValueHelpAttribute;
        var metadata = dataSource.getAttributeMetadata(attributeId);
        var targetFacet = {
          Id: data.ValueHelpAttribute,
          Name: metadata.label,
          Type: "AttributeValue",
          Values: {
            results: []
          }
        };
        var results = [];
        for (var i = 0; i < sourceFacetItems.length; i++) {
          var item = sourceFacetItems[i];
          results.push({
            Description: item.ValueFormatted,
            NumberOfObjects: item.NumberOfInstances,
            Type: "AttributeValue",
            ValueLow: item.Value,
            ValueLowFormatted: item.ValueFormatted,
            ValueHigh: "",
            ValueHighFormatted: ""
          });
        }
        targetFacet.Values.results = results;
        data.Facets = {};
        data.Facets.results = [];
        data.Facets.results[0] = targetFacet;
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
        for (var i = 0; i < facetData.Values.results.length; i++) {
          var cell = facetData.Values.results[i];

          // create filter (used when clicking on the item)
          var dataSource = this.sina.getDataSource(cell.ValueLow);
          if (!dataSource) {
            dataSource = this.sina._createDataSource({
              type: this.sina.DataSourceType.Category,
              id: cell.ValueLow,
              label: cell.Description
            });
          }

          // create item
          items.push(this.sina._createDataSourceResultSetItem({
            dataSource: dataSource,
            dimensionValueFormatted: dataSource.labelPlural,
            measureValue: cell.NumberOfObjects,
            measureValueFormatted: cell.NumberOfObjects.toString()
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
        if (cell.Type === "AttributeRange") {
          // Between Condition
          var conditions = [];
          if (cell.ValueLow && cell.ValueLow.length !== 0) {
            var isDynamicValueLow = cell.Type === "AttributeConstant";
            conditions.push(this.sina.createSimpleCondition({
              attribute: attributeId,
              operator: ComparisonOperator.Ge,
              value: isDynamicValueLow ? cell.ValueLow : typeConverter.odata2Sina(metadata.type, cell.ValueLow),
              isDynamicValue: isDynamicValueLow
            }));
          }
          if (cell.ValueHigh && cell.ValueHigh.length !== 0) {
            var isDynamicValueHigh = cell.Type === "AttributeConstant";
            conditions.push(this.sina.createSimpleCondition({
              attribute: attributeId,
              operator: ComparisonOperator.Le,
              value: isDynamicValueHigh ? cell.ValueHigh : typeConverter.odata2Sina(metadata.type, cell.ValueHigh),
              isDynamicValue: isDynamicValueHigh
            }));
          }
          return this.sina.createComplexCondition({
            attributeLabel: metadata.label,
            valueLabel: cell.Description,
            operator: LogicalOperator.And,
            conditions: conditions
          });
        }
        // Single Condition
        var isDynamicValue = cell.Type === "AttributeConstant";
        return this.sina.createSimpleCondition({
          attributeLabel: metadata.label,
          attribute: attributeId,
          value: isDynamicValue ? cell.ValueLow : typeConverter.odata2Sina(metadata.type, cell.ValueLow),
          valueLabel: cell.Description,
          isDynamicValue: isDynamicValue
        });
      }
    }, {
      key: "parseChartFacet",
      value: function parseChartFacet(query, facetData) {
        var dataSource = this.sina.getDataSource(query.filter.dataSource.id);
        var attributeId = facetData.Id;
        var metadata = dataSource.getAttributeMetadata(attributeId);

        // for search query with attribute facet: create corresponding chart query
        var filter,
          chartQuery = query;
        if (query instanceof SearchQuery) {
          filter = query.filter.clone();
          filter.setDataSource(dataSource); // relevant only for common attribute facets
          filter.setRootCondition(query.filter.rootCondition.clone()); // changing ds removes condition
          chartQuery = this.sina.createChartQuery({
            filter: filter,
            dimension: facetData.Id
          });
        }

        // create result set items
        var items = [];
        for (var i = 0; i < facetData.Values.results.length; i++) {
          var cell = facetData.Values.results[i];
          items.push(this.sina._createChartResultSetItem({
            filterCondition: this.createAttributeFilterCondition(attributeId, metadata, cell),
            dimensionValueFormatted: cell.Description,
            measureValue: cell.NumberOfObjects,
            measureValueFormatted: cell.ValueLowFormatted
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