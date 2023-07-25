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
function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
sap.ui.define(["./FacetItem"], function (__FacetItem) {
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
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  const updateDetailPageforDynamicHierarchy = _async(function (model, dynamicHierarchyFacet, filters) {
    function handleSetFilter(node, set, filterCondition) {
      var facet = node.getData().facet;
      var facetItem = createFilterFacetItemForDynamicHierarchy(facet, filterCondition);
      if (set) {
        model.addFilter(facetItem);
      } else {
        model.removeFilter(facetItem);
      }
    }
    var facetFilter = dynamicHierarchyFacet.sina.createFilter({
      dataSource: model.getDataSource()
    });
    // firstly add static hierachy facets
    var nonFilterByConditions = model.getNonFilterByFilterConditions();
    if (nonFilterByConditions.length > 0) {
      var _iterator = _createForOfIteratorHelper(nonFilterByConditions),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var nonFilterByCondition = _step.value;
          facetFilter.autoInsertCondition(nonFilterByCondition);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
    var _iterator2 = _createForOfIteratorHelper(filters),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var filter = _step2.value;
        facetFilter.autoInsertCondition(filter.filterCondition);
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    dynamicHierarchyFacet.setFilter(facetFilter);
    dynamicHierarchyFacet.setHandleSetFilter(handleSetFilter);
    return _await(dynamicHierarchyFacet.treeNodeFactory.updateRecursively(), function () {
      dynamicHierarchyFacet.updateNodesFromHierarchyNodePaths(model.getProperty("/hierarchyNodePaths"));
      dynamicHierarchyFacet.mixinFilterNodes();
      dynamicHierarchyFacet.treeNodeFactory.updateUI();
    });
  });
  var FacetItem = _interopRequireDefault(__FacetItem);
  function createFilterFacetItemForDynamicHierarchy(facet, condition) {
    return new FacetItem({
      selected: false,
      level: 0,
      filterCondition: condition,
      value: condition.value,
      valueLabel: condition.valueLabel,
      label: facet.title,
      facetTitle: facet.title,
      facetAttribute: facet.attributeId,
      advanced: true,
      listed: true,
      icon: null,
      visible: true
    });
  }
  var __exports = {
    __esModule: true
  };
  __exports.updateDetailPageforDynamicHierarchy = updateDetailPageforDynamicHierarchy;
  __exports.createFilterFacetItemForDynamicHierarchy = createFilterFacetItemForDynamicHierarchy;
  return __exports;
});
})();