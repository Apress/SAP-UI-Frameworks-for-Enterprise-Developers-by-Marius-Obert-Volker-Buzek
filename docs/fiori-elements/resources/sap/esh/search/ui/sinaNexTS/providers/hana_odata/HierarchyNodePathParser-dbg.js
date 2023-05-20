/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
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
  /* eslint-disable @typescript-eslint/no-explicit-any */
  var HierarchyNodePathParser = /*#__PURE__*/function () {
    function HierarchyNodePathParser(sina) {
      _classCallCheck(this, HierarchyNodePathParser);
      this.sina = sina;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    _createClass(HierarchyNodePathParser, [{
      key: "parse",
      value: function parse(response, query) {
        var _this = this;
        var searchResponse = response;
        var hierarchyNodePaths = [];
        if (!searchResponse.data["@com.sap.vocabularies.Search.v1.ParentHierarchies"]) {
          return hierarchyNodePaths;
        }
        var _iterator = _createForOfIteratorHelper(searchResponse.data["@com.sap.vocabularies.Search.v1.ParentHierarchies"]),
          _step;
        try {
          var _loop = function _loop() {
            var parentHierarchy = _step.value;
            var hierarchyAttributeId = parentHierarchy.scope;
            var hierarchyAttributeLabel = "node_value";
            var hierarchyAttributeIcon = "";
            var hierarchyAttributeMeta = query.filter.dataSource.attributeMetadataMap[hierarchyAttributeId];
            if (Array.isArray(hierarchyAttributeMeta === null || hierarchyAttributeMeta === void 0 ? void 0 : hierarchyAttributeMeta.groups) && hierarchyAttributeMeta.groups.length > 0 && hierarchyAttributeMeta.groups[0].nameInGroup === hierarchyAttributeId && hierarchyAttributeMeta.groups[0].group && Array.isArray(hierarchyAttributeMeta.groups[0].group.attributes) && hierarchyAttributeMeta.groups[0].group.attributes.length > 1) {
              for (var i = 0; i < hierarchyAttributeMeta.groups[0].group.attributes.length; i++) {
                var attr = hierarchyAttributeMeta.groups[0].group.attributes[i];
                if (attr.attribute.id !== hierarchyAttributeId) {
                  hierarchyAttributeLabel = attr.attribute.id;
                }
              }
              hierarchyAttributeIcon = hierarchyAttributeMeta.iconUrlAttributeName;
            }
            var length = parentHierarchy.hierarchy.length;
            var hierarchyNodes = [];
            parentHierarchy.hierarchy.forEach(function (node, index) {
              var isFirstPath = false;
              var isLastPath = false;
              var icon = node[hierarchyAttributeIcon] || node["icon"] || "sap-icon://folder";
              var label = node[hierarchyAttributeLabel] || node["node_value"] || node[hierarchyAttributeId] || node["node_id"];
              if (index === 0) {
                isFirstPath = true;
                icon = query.filter.dataSource.icon || "sap-icon://home";
                label = query.filter.dataSource.labelPlural || query.filter.dataSource.label || label;
              } else if (index === length - 1) {
                isLastPath = true;
                icon = node[hierarchyAttributeIcon] || node["icon"] || "sap-icon://open-folder";
              }
              hierarchyNodes.push(_this.sina.createHierarchyNode({
                id: node[hierarchyAttributeId] || node["node_id"],
                label: label,
                isFirst: isFirstPath,
                isLast: isLastPath,
                icon: icon
              }));
            });
            hierarchyNodePaths.push(_this.sina.createHierarchyNodePath({
              name: parentHierarchy.scope,
              path: hierarchyNodes
            }));
          };
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            _loop();
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return hierarchyNodePaths;
      }
    }]);
    return HierarchyNodePathParser;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.HierarchyNodePathParser = HierarchyNodePathParser;
  return __exports;
});
})();