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
sap.ui.define(["sap/m/MessageBox", "./error/errors", "./i18n"], function (MessageBox, __errors, __i18n) {
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
  var MessageBoxIcon = MessageBox["Icon"];
  var MessageBoxAction = MessageBox["Action"];
  var errors = _interopRequireDefault(__errors);
  var i18n = _interopRequireDefault(__i18n);
  function isComplexConditionJSON(conditionJSON) {
    if (conditionJSON && conditionJSON.conditions) {
      return true;
    }
    return false;
  }
  var SearchUrlParserInav2 = /*#__PURE__*/function () {
    function SearchUrlParserInav2(properties) {
      _classCallCheck(this, SearchUrlParserInav2);
      this.model = properties.model;
    }
    _createClass(SearchUrlParserInav2, [{
      key: "parseUrlParameters",
      value: function parseUrlParameters(oParametersLowerCased) {
        try {
          const _this = this;
          // top
          if (oParametersLowerCased.top) {
            var top = parseInt(oParametersLowerCased.top, 10);
            _this.model.setTop(top, false);
          }

          // datasource
          var dataSource = _this.model.sinaNext.allDataSource;
          if (oParametersLowerCased.datasource) {
            var dataSourceJson = JSON.parse(oParametersLowerCased.datasource);
            var dataSourceId = dataSourceJson.ObjectName.value;
            switch (dataSourceJson.Type) {
              case "Category":
                if (dataSourceId === "$$ALL$$") {
                  dataSource = _this.model.sinaNext.allDataSource;
                } else {
                  dataSource = _this.model.sinaNext.getDataSource(dataSourceId);
                  if (!dataSource) {
                    dataSource = _this.model.sinaNext.createDataSource({
                      type: _this.model.sinaNext.DataSourceType.Category,
                      id: dataSourceId,
                      label: dataSourceJson.label,
                      labelPlural: dataSourceJson.labelPlural
                    });
                  }
                }
                break;
              case "BusinessObject":
                dataSource = _this.model.sinaNext.getDataSource(dataSourceId);
                if (!dataSource) {
                  dataSource = _this.model.sinaNext.allDataSource;
                  delete oParametersLowerCased.filter;
                  MessageBox.show(i18n.getText("searchUrlParsingErrorLong") + "\n(Unknow datasource " + dataSourceId + ")", {
                    icon: MessageBoxIcon.ERROR,
                    title: i18n.getText("searchUrlParsingError"),
                    actions: [MessageBoxAction.OK]
                  });
                }
                break;
              default:
                {
                  var internalError = new Error("Unknown datasource type " + dataSourceJson.Type);
                  throw new errors.UnknownDataSourceType(internalError);
                }
            }
          }
          return _await(_this.model.sinaNext.loadMetadata(dataSource), function () {
            // root condition
            var context = {
              dataSource: dataSource
            };
            var rootCondition;
            if (oParametersLowerCased.filter) {
              try {
                var filterJson = JSON.parse(oParametersLowerCased.filter);
                rootCondition = _this.parseCondition(context, filterJson);
              } catch (e) {
                // fallback-filter + send error message
                rootCondition = _this.model.sinaNext.createComplexCondition();
                MessageBox.show(i18n.getText("searchUrlParsingErrorLong") + "\n(" + e.toString() + ")", {
                  icon: MessageBoxIcon.ERROR,
                  title: i18n.getText("searchUrlParsingError"),
                  actions: [MessageBoxAction.OK]
                });
              }
            } else {
              rootCondition = _this.model.sinaNext.createComplexCondition();
            }

            // filter
            var filter = _this.model.sinaNext.createFilter({
              dataSource: dataSource,
              searchTerm: oParametersLowerCased.searchterm,
              rootCondition: rootCondition
            });
            _this.model.setProperty("/uiFilter", filter);
            _this.model.setDataSource(filter.dataSource, false); // explicitely updata datasource (for categories: update ds list in model)
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "parseCondition",
      value: function parseCondition(context, conditionJson) {
        if (isComplexConditionJSON(conditionJson)) {
          return this.parseComplexCondition(context, conditionJson);
        }
        return this.parseSimpleCondition(context, conditionJson);
      }
    }, {
      key: "parseComplexCondition",
      value: function parseComplexCondition(context, conditionJson) {
        var subConditions = [];
        for (var i = 0; i < conditionJson.conditions.length; ++i) {
          var subConditionJson = conditionJson.conditions[i];
          subConditions.push(this.parseCondition(context, subConditionJson));
        }
        return this.model.sinaNext.createComplexCondition({
          operator: conditionJson.operator,
          conditions: subConditions,
          valueLabel: conditionJson.label
        });
      }
    }, {
      key: "parseSimpleCondition",
      value: function parseSimpleCondition(context, conditionJson) {
        context.attribute = conditionJson.attribute;
        return this.model.sinaNext.createSimpleCondition({
          attribute: conditionJson.attribute,
          attributeLabel: conditionJson.attributeLabel,
          value: this.parseValue(context, conditionJson.value),
          valueLabel: conditionJson.valueLabel || conditionJson.label,
          operator: this.parseOperator(context, conditionJson.operator)
        });
      }
    }, {
      key: "parseValue",
      value: function parseValue(context, value) {
        var metadata = context.dataSource.getAttributeMetadata(context.attribute);
        return this.model.sinaNext.inav2TypeConverter.ina2Sina(metadata.type, value);
      }
    }, {
      key: "parseOperator",
      value: function parseOperator(context, operator) {
        switch (operator) {
          case "=":
            return this.model.sinaNext.ComparisonOperator.Eq;
          case ">":
            return this.model.sinaNext.ComparisonOperator.Gt;
          case ">=":
            return this.model.sinaNext.ComparisonOperator.Ge;
          case "<":
            return this.model.sinaNext.ComparisonOperator.Lt;
          case "<=":
            return this.model.sinaNext.ComparisonOperator.Le;
          default:
            throw "Unknown operator " + operator;
        }
      }
    }]);
    return SearchUrlParserInav2;
  }();
  return SearchUrlParserInav2;
});
})();