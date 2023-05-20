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
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
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
sap.ui.define(["../sinaNexTS/sina/HierarchyDisplayType", "./SearchHierarchyDynamicFacet"], function (___sinaNexTS_sina_HierarchyDisplayType, __SearchHierarchyDynamicFacet) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
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
   * The SearchHierarchyDynamicFacetsFormatter is called from the search model after each search.
   * The formatter assembles the dynamic facets from the sina search result.
   */
  var HierarchyDisplayType = ___sinaNexTS_sina_HierarchyDisplayType["HierarchyDisplayType"];
  var SearchHierarchyDynamicFacet = _interopRequireDefault(__SearchHierarchyDynamicFacet);
  var SearchHierarchyDynamicFacetsFormatter = /*#__PURE__*/function () {
    function SearchHierarchyDynamicFacetsFormatter(model) {
      _classCallCheck(this, SearchHierarchyDynamicFacetsFormatter);
      this.testCounter = 0;
      this.facetMap = {};
      this.facetFromMetadataMap = {};
      this.model = model;
    }
    _createClass(SearchHierarchyDynamicFacetsFormatter, [{
      key: "getFacetAttributes",
      value: function getFacetAttributes(resultSet) {
        // display facets which are included in the server response
        var facetAttributes = [];
        for (var i = 0; i < resultSet.facets.length; ++i) {
          var facetResultSet = resultSet.facets[i];
          if (facetResultSet.type !== resultSet.sina.FacetType.Hierarchy) {
            continue;
          }
          if (!facetResultSet["node"]) {
            // ToDo
            continue; // TODO: server error?
          }

          var facetAttribute = facetResultSet.query.attributeId; // ToDo
          if (facetAttributes.indexOf(facetAttribute) >= 0) {
            continue;
          }
          facetAttributes.push(facetAttribute);
        }

        // display facet for which filters are set
        var filterFacetAttributes = resultSet.query.filter.rootCondition.getAttributes();
        for (var j = 0; j < filterFacetAttributes.length; ++j) {
          var filterFacetAttribute = filterFacetAttributes[j];
          var filterFacetAttributeMetadata = resultSet.query.filter.dataSource.getAttributeMetadata(filterFacetAttribute);
          if (!(filterFacetAttributeMetadata.isHierarchy && filterFacetAttributeMetadata.usage && filterFacetAttributeMetadata.usage.Facet && typeof filterFacetAttributeMetadata.usage.Facet.displayOrder === "number")) {
            continue;
          }
          if (!filterFacetAttributeMetadata.usage || !filterFacetAttributeMetadata.usage.Facet) {
            continue;
          }
          if (facetAttributes.indexOf(filterFacetAttribute) >= 0) {
            continue;
          }
          facetAttributes.push(filterFacetAttribute);
        }
        return facetAttributes;
      }
    }, {
      key: "getFacetFromResultSet",
      value: function getFacetFromResultSet(resultSet, attributeId) {
        for (var i = 0; i < resultSet.facets.length; ++i) {
          var facetResultSet = resultSet.facets[i];
          if (attributeId === facetResultSet.query.attributeId) {
            // ToDo
            return facetResultSet;
          }
        }
      }
    }, {
      key: "getFacet",
      value: function getFacet(resultSet, searchModel, attributeId) {
        try {
          const _this = this;
          var attributeMetadata = resultSet.query.filter.dataSource.getAttributeMetadata(attributeId);
          var facet = _this.facetMap[attributeId];
          if (!facet) {
            facet = new SearchHierarchyDynamicFacet({
              model: searchModel,
              sina: resultSet.sina,
              dataSource: resultSet.query.filter.dataSource,
              attributeId: attributeId,
              title: attributeMetadata.label,
              filter: _this.model.getProperty("/uiFilter"),
              modelPathPrefix: "/facets",
              isShowMoreDialog: false
            });
            _this.facetMap[attributeId] = facet;
          }
          facet.setFilter(_this.model.getProperty("/uiFilter"));
          var containsAttribute = resultSet.query.filter.rootCondition.containsAttribute(attributeId);
          var hasExpandedChildNode = facet.rootTreeNode && facet.rootTreeNode.hasExpandedChildNode();
          return _await(_invoke(function () {
            if (containsAttribute || hasExpandedChildNode) {
              return _awaitIgnored(facet.treeNodeFactory.updateRecursively());
            } else {
              var facetResultSet = _this.getFacetFromResultSet(resultSet, attributeId);
              facet.updateFromResultSet(facetResultSet);
            }
          }, function () {
            facet.updateNodesFromHierarchyNodePaths(resultSet.hierarchyNodePaths);
            facet.mixinFilterNodes();
            return facet;
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "getFacets",
      value: function getFacets(resultSet, searchModel) {
        if (!this.model.config.FF_dynamicHierarchyFacets) {
          return Promise.resolve([]);
        }
        // determine which facets to be displayed
        var facetAttributes = this.getFacetAttributes(resultSet);
        // create/update facets
        var facets = [];
        for (var i = 0; i < facetAttributes.length; ++i) {
          var facetAttribute = facetAttributes[i];
          var facetPromise = this.getFacet(resultSet, searchModel, facetAttribute);
          facets.push(facetPromise);
        }
        return Promise.all(facets).then(function (result) {
          return Array.from(result);
        });
      }
    }, {
      key: "destroy",
      value: function destroy() {
        for (var facetAttributeId in this.facetMap) {
          var facet = this.facetMap[facetAttributeId];
          facet["delete"]();
        }
        this.facetMap = {};
        for (var _facetAttributeId in this.facetFromMetadataMap) {
          var _facet = this.facetFromMetadataMap[_facetAttributeId];
          _facet["delete"]();
        }
        this.facetFromMetadataMap = {};
      }
    }, {
      key: "handleDataSourceChanged",
      value: function handleDataSourceChanged() {
        this.destroy();
      }
    }, {
      key: "getFacetFromMetadata",
      value: function getFacetFromMetadata(attributeId, dataSource, searchFacetDialogModel) {
        var facet = this.facetFromMetadataMap[attributeId];
        if (facet) {
          return facet;
        }
        var attributeMetadata = dataSource.getAttributeMetadata(attributeId);
        facet = new SearchHierarchyDynamicFacet({
          model: searchFacetDialogModel,
          sina: dataSource.sina,
          dataSource: dataSource,
          attributeId: attributeId,
          title: attributeMetadata.label,
          filter: this.model.getProperty("/uiFilter"),
          modelPathPrefix: "/facetDialog",
          isShowMoreDialog: true
        });
        this.facetFromMetadataMap[attributeId] = facet;
        return facet;
      }
    }, {
      key: "getFacetsFromMetadata",
      value: function getFacetsFromMetadata(dataSource, searchFacetDialogModel) {
        var facets = [];
        if (!searchFacetDialogModel.config.FF_dynamicHierarchyFacetsInShowMore) {
          return facets;
        }
        var _iterator = _createForOfIteratorHelper(dataSource.attributesMetadata),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var attributeMetadata = _step.value;
            if (attributeMetadata.isHierarchy && attributeMetadata.hierarchyDisplayType === HierarchyDisplayType.DynamicHierarchyFacet) {
              facets.push(this.getFacetFromMetadata(attributeMetadata.id, dataSource, searchFacetDialogModel));
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return facets;
      }
    }]);
    return SearchHierarchyDynamicFacetsFormatter;
  }();
  return SearchHierarchyDynamicFacetsFormatter;
});
})();