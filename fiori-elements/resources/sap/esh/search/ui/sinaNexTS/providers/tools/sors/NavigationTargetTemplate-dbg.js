/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
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
  var NavigationTargetTemplate = /*#__PURE__*/function () {
    function NavigationTargetTemplate(properties) {
      _classCallCheck(this, NavigationTargetTemplate);
      this.sina = properties.sina;
      this.navigationTargetGenerator = properties.navigationTargetGenerator;
      this.label = properties.label;
      this.sourceObjectType = properties.sourceObjectType;
      this.targetObjectType = properties.targetObjectType;
      this.conditions = properties.conditions;
    }
    _createClass(NavigationTargetTemplate, [{
      key: "generate",
      value: function generate(data) {
        var dataSource = this.sina.getDataSource(this.targetObjectType);
        var filter = this.sina.createFilter({
          dataSource: dataSource,
          searchTerm: "*"
        });
        for (var i = 0; i < this.conditions.length; ++i) {
          var condition = this.conditions[i];
          var filterCondition = this.sina.createSimpleCondition({
            attribute: condition.targetPropertyName,
            attributeLabel: dataSource.getAttributeMetadata(condition.targetPropertyName).label,
            operator: this.sina.ComparisonOperator.Eq,
            value: data[condition.sourcePropertyName].value,
            valueLabel: data[condition.sourcePropertyName].valueFormatted
          });
          filter.autoInsertCondition(filterCondition);
        }
        return this.sina._createNavigationTarget({
          label: this.label,
          targetUrl: this.navigationTargetGenerator.urlPrefix + encodeURIComponent(JSON.stringify(filter.toJson()))
        });
      }
    }]);
    return NavigationTargetTemplate;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.NavigationTargetTemplate = NavigationTargetTemplate;
  return __exports;
});
})();