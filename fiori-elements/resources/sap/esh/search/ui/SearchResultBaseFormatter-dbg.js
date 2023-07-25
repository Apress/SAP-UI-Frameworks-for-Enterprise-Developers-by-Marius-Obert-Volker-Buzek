/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./i18n"], function (__i18n) {
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
  var i18n = _interopRequireDefault(__i18n);
  var SearchResultBaseFormatter = /*#__PURE__*/function () {
    function SearchResultBaseFormatter(model) {
      _classCallCheck(this, SearchResultBaseFormatter);
      this.model = model;
    }

    /*
     * ===================================
     * format attributes for search result sort dialog
     * ===================================
     */
    _createClass(SearchResultBaseFormatter, [{
      key: "formatSortAttributes",
      value: function formatSortAttributes() {
        var sortAttributes = [];
        var sina = this.model.sinaNext;
        var datasource = this.model.getDataSource();
        var attributesMetadata = sina.dataSourceMap[datasource.id].attributesMetadata;
        if (!Array.isArray(attributesMetadata) || attributesMetadata.length === 0) {
          return [];
        }

        // sortable attributes
        for (var i = 0; i < attributesMetadata.length; i++) {
          var attribute = attributesMetadata[i];
          if (attribute.isSortable) {
            sortAttributes.push({
              name: attribute.label,
              key: "searchSortAttributeKey" + i,
              attributeId: attribute.id
            });
          }
        }
        var compareAttributes = function compareAttributes(a, b) {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        };
        sortAttributes.sort(compareAttributes);

        // default sort attribute, server ranking
        sortAttributes.unshift({
          name: i18n.getText("defaultRank"),
          key: "searchSortAttributeKeyDefault",
          attributeId: "DEFAULT_SORT_ATTRIBUTE"
        });

        // set selected
        var orderBy = this.model.getOrderBy().orderBy;
        if (typeof orderBy === "undefined") {
          orderBy = "DEFAULT_SORT_ATTRIBUTE";
        }
        for (var _i = 0; _i < sortAttributes.length; _i++) {
          if (sortAttributes[_i].attributeId === orderBy) {
            sortAttributes[_i].selected = true;
          } else {
            sortAttributes[_i].selected = false;
          }
        }
        return sortAttributes;
      }
    }]);
    return SearchResultBaseFormatter;
  }();
  return SearchResultBaseFormatter;
});
})();