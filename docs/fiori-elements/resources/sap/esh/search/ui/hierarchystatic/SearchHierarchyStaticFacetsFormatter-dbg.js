/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
sap.ui.define(["./SearchHierarchyStaticFacet"], function (__SearchHierarchyStaticFacet) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
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
   * The SearchHierarchyStaticFacetsFormatter is called from the search model after each search.
   * The formatter assembles the static facets from the sina search result.
   */
  var SearchHierarchyStaticFacet = _interopRequireDefault(__SearchHierarchyStaticFacet);
  var SearchHierarchyStaticFacetsFormatter = /*#__PURE__*/function () {
    function SearchHierarchyStaticFacetsFormatter(model) {
      _classCallCheck(this, SearchHierarchyStaticFacetsFormatter);
      this.model = model;
      this.facetMap = {};
    }
    _createClass(SearchHierarchyStaticFacetsFormatter, [{
      key: "getHierarchyDefinitionDataSource",
      value: function getHierarchyDefinitionDataSource(hierarchyName) {
        var dataSources = this.model.sinaNext.dataSources;
        for (var i = 0; i < dataSources.length; ++i) {
          var dataSource = dataSources[i];
          if (dataSource.type !== this.model.sinaNext.DataSourceType.BusinessObject) {
            continue;
          }
          if (!dataSource.isHierarchyDefinition) {
            continue;
          }
          if (hierarchyName === dataSource.hierarchyName) {
            return dataSource;
          }
        }
      }
    }, {
      key: "getFacetAttributes",
      value: function getFacetAttributes(resultSet) {
        var attributesMetadata = resultSet.query.filter.dataSource.attributesMetadata;
        var facetAttributes = [];
        for (var i = 0; i < attributesMetadata.length; ++i) {
          var attributeMetadata = attributesMetadata[i];
          if (!attributeMetadata.isHierarchy) {
            continue;
          }
          if (attributeMetadata.hierarchyDisplayType !== resultSet.sina.HierarchyDisplayType.StaticHierarchyFacet) {
            continue;
          }
          var dataSource = this.getHierarchyDefinitionDataSource(attributeMetadata.hierarchyName);
          if (!dataSource) {
            continue;
          }
          facetAttributes.push({
            attributeId: attributeMetadata.id,
            dataSource: dataSource
          });
        }
        return facetAttributes;
      }
    }, {
      key: "getFacet",
      value: function getFacet(resultSet, model, facetAttribute, position) {
        try {
          const _this = this;
          var facet = _this.facetMap[facetAttribute.attributeId];
          return _await(_invoke(function () {
            if (!facet) {
              var attributeMetadata = resultSet.query.filter.dataSource.getAttributeMetadata(facetAttribute.attributeId);
              facet = new SearchHierarchyStaticFacet({
                model: model,
                attributeId: facetAttribute.attributeId,
                dataSource: facetAttribute.dataSource,
                filter: model.getProperty("/uiFilter"),
                title: attributeMetadata.label
              });
              _this.facetMap[facetAttribute.attributeId] = facet;
              return _awaitIgnored(facet.initAsync());
            }
          }, function () {
            facet.position = position;
            facet.filter = model.getProperty("/uiFilter");
            facet.updateNodesFromHierarchyNodePaths(resultSet.hierarchyNodePaths);
            return _await(facet.mixinFilterNodes(), function () {
              return facet;
            });
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "getFacets",
      value: function getFacets(resultSet) {
        if (!this.model.config.FF_staticHierarchyFacets) {
          return Promise.resolve([]);
        }
        var facetAttributes = this.getFacetAttributes(resultSet);
        var facetPromises = [];
        for (var i = 0; i < facetAttributes.length; ++i) {
          var facetAttribute = facetAttributes[i];
          var facet = this.getFacet(resultSet, this.model, facetAttribute, 100 + i);
          facetPromises.push(facet);
        }
        return Promise.all(facetPromises);
      }
    }, {
      key: "destroy",
      value: function destroy() {
        for (var facetAttributeId in this.facetMap) {
          var facet = this.facetMap[facetAttributeId];
          facet["delete"]();
        }
        this.facetMap = {};
      }
    }, {
      key: "handleDataSourceChanged",
      value: function handleDataSourceChanged() {
        this.destroy();
      }
    }]);
    return SearchHierarchyStaticFacetsFormatter;
  }();
  return SearchHierarchyStaticFacetsFormatter;
});
})();