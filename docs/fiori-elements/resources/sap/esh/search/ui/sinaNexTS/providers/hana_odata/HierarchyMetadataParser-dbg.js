/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/HierarchyDisplayType"], function (____sina_HierarchyDisplayType) {
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
  var HierarchyDisplayType = ____sina_HierarchyDisplayType["HierarchyDisplayType"];
  var HierarchyMetadataParser = /*#__PURE__*/function () {
    function HierarchyMetadataParser(jQuery) {
      _classCallCheck(this, HierarchyMetadataParser);
      this.jQuery = jQuery;
    }
    _createClass(HierarchyMetadataParser, [{
      key: "parse",
      value: function parse(entityTypeName, hierarchAnnotationNode) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = this;
        var hierarchyDefinitionsMap = {};
        that.jQuery(hierarchAnnotationNode).find("Collection").each(function () {
          that.jQuery(this).find("Record").each(function () {
            var hierarchyDefinition = that.parseRecord(entityTypeName, this);
            hierarchyDefinitionsMap[hierarchyDefinition.attributeName] = hierarchyDefinition;
          });
        });
        return hierarchyDefinitionsMap;
      }
    }, {
      key: "parseRecord",
      value: function parseRecord(entityTypeName, recordNode) {
        var hierarchyDefinition = {
          name: "",
          // name of hierarchy
          attributeName: "",
          // name of attribute
          displayType: HierarchyDisplayType.DynamicHierarchyFacet,
          isHierarchyDefinition: false,
          // entity set represents the hierarchy (self reference)
          parentAttributeName: "",
          // ??
          childAttributeName: "" // ??
        };
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = this;
        that.jQuery(recordNode).find(">PropertyValue").each(function () {
          switch (that.jQuery(this).attr("Property")) {
            case "Definition":
              hierarchyDefinition.name = that.jQuery(this).attr("String");
              // TODO: dirty trim logic
              // to be removed when model data issue in standalone-hana-vlcspdj7db_5017 is solved
              if (hierarchyDefinition.name && hierarchyDefinition.name.indexOf("com.sap.datahub.app.base.metadata.esh::Folder") > -1) {
                hierarchyDefinition.name.replace(/[.:]/g, "");
              }
              break;
            case "Name":
              hierarchyDefinition.attributeName = that.jQuery(this).attr("String");
              break;
            case "displayType":
              switch (that.jQuery(this).attr("String")) {
                case "TREE":
                  hierarchyDefinition.displayType = HierarchyDisplayType.StaticHierarchyFacet;
                  break;
                case "FLAT":
                  hierarchyDefinition.displayType = HierarchyDisplayType.HierarchyResultView;
                  break;
              }
              break;
            case "Recurse":
              Object.assign(hierarchyDefinition, that.parseRecurse(this));
          }
        });
        hierarchyDefinition.isHierarchyDefinition = that.calculateIsHierarchyDefinition(entityTypeName, hierarchyDefinition.name);
        return hierarchyDefinition;
      }
    }, {
      key: "calculateIsHierarchyDefinition",
      value: function calculateIsHierarchyDefinition(entityTypeName, name) {
        // normalize entityTypeName
        if (entityTypeName.endsWith("Type")) {
          entityTypeName = entityTypeName.slice(0, -4);
        }
        // normalize hierarchy name
        name = name.replace(/[.:]/g, "");
        return entityTypeName === name;
      }
    }, {
      key: "parseRecurse",
      value: function parseRecurse(recurseNode) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = this;
        var result = {
          parentAttributeName: "",
          childAttributeName: ""
        };
        that.jQuery(recurseNode).find(">PropertyValue").each(function () {
          switch (that.jQuery(this).attr("Property")) {
            case "Parent":
              that.jQuery(this).find("Collection").each(function () {
                result.parentAttributeName = that.parseCollection(this);
              });
              break;
            case "Child":
              that.jQuery(this).find(">Collection").each(function () {
                result.childAttributeName = that.parseCollection(this);
              });
          }
        });
        return result;
      }
    }, {
      key: "parseCollection",
      value: function parseCollection(collectionNode) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = this;
        var attributeName;
        that.jQuery(collectionNode).find(">PropertyPath").each(function () {
          attributeName = that.jQuery(this).text();
        });
        return attributeName;
      }
    }]);
    return HierarchyMetadataParser;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.HierarchyMetadataParser = HierarchyMetadataParser;
  return __exports;
});
})();