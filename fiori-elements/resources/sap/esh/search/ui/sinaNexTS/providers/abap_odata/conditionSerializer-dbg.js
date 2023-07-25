/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/ComparisonOperator", "./typeConverter", "../../sina/ComplexCondition", "../../sina/SimpleCondition", "../../core/errors", "./ComparisonOperator", "../../sina/LogicalOperator"], function (____sina_ComparisonOperator, typeConverter, ____sina_ComplexCondition, ____sina_SimpleCondition, ____core_errors, ___ComparisonOperator, ____sina_LogicalOperator) {
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
  var ComplexCondition = ____sina_ComplexCondition["ComplexCondition"];
  var SimpleCondition = ____sina_SimpleCondition["SimpleCondition"];
  var InBetweenConditionInConsistent = ____core_errors["InBetweenConditionInConsistent"];
  var UnknownComparisonOperatorError = ____core_errors["UnknownComparisonOperatorError"];
  var ABAPODataComparisonOperator = ___ComparisonOperator["ABAPODataComparisonOperator"];
  var LogicalOperator = ____sina_LogicalOperator["LogicalOperator"];
  var ConditionSerializer = /*#__PURE__*/function () {
    function ConditionSerializer(dataSource) {
      _classCallCheck(this, ConditionSerializer);
      this.dataSource = dataSource;
    }
    _createClass(ConditionSerializer, [{
      key: "convertSinaToOdataOperator",
      value: function convertSinaToOdataOperator(sinaOperator) {
        switch (sinaOperator) {
          case ComparisonOperator.Eq:
            return "EQ";
          case ComparisonOperator.Lt:
            return "LT";
          case ComparisonOperator.Gt:
            return "GT";
          case ComparisonOperator.Le:
            return "LE";
          case ComparisonOperator.Ge:
            return "GE";
          case ComparisonOperator.Co:
            return "EQ";
          case ComparisonOperator.Bw:
            return "EQ";
          case ComparisonOperator.Ew:
            return "EQ";
          case LogicalOperator.And:
            return "AND";
          case LogicalOperator.Or:
            return "OR";
          default:
            throw new UnknownComparisonOperatorError("Unknown comparison operator " + sinaOperator);
        }
      }
    }, {
      key: "serializeComplexCondition",
      value: function serializeComplexCondition(condition) {
        var result = {
          ActAsQueryPart: false,
          Id: 1,
          OperatorType: this.convertSinaToOdataOperator(condition.operator),
          SubFilters: []
        };
        var actAsQueryPartPath = "Schema[Namespace=ESH_SEARCH_SRV]>EntityType[Name=SearchFilter]>Property[Name=ActAsQueryPart]";
        if (condition.sina.provider.isQueryPropertySupported(actAsQueryPartPath)) {
          result.ActAsQueryPart = true;
        }
        var subConditions = condition.conditions;
        for (var i = 0; i < subConditions.length; ++i) {
          var subCondition = subConditions[i];
          result.SubFilters.push(this.serialize(subCondition));
        }
        return result;
      }
    }, {
      key: "serializeSimpleCondition",
      value: function serializeSimpleCondition(condition) {
        var metadata = this.dataSource.getAttributeMetadata(condition.attribute);
        var type = metadata.type;
        var conditionObj = {
          ConditionAttribute: condition.attribute,
          ConditionOperator: this.convertSinaToOdataOperator(condition.operator),
          ConditionValue: condition.isDynamicValue ? condition.value : typeConverter.sina2Odata(type, condition.value, {
            operator: condition.operator
          }),
          SubFilters: []
        };
        return conditionObj;
      }
    }, {
      key: "serializeBetweenCondition",
      value: function serializeBetweenCondition(condition) {
        var valueLow;
        var valueHigh;
        var rangeStartCondition = condition.conditions[0];
        var rangeEndCondition = condition.conditions[1];
        if (rangeStartCondition instanceof SimpleCondition && rangeEndCondition instanceof SimpleCondition) {
          var metadata = this.dataSource.getAttributeMetadata(rangeStartCondition.attribute);
          var type = metadata.type;
          if (rangeStartCondition.operator === ComparisonOperator.Ge) {
            valueLow = rangeStartCondition.value;
            valueHigh = rangeEndCondition.value;
          } else {
            valueLow = rangeEndCondition.value;
            valueHigh = rangeStartCondition.value;
          }
          var conditionObj = {
            ConditionAttribute: rangeStartCondition.attribute,
            ConditionOperator: ABAPODataComparisonOperator.Bt,
            ConditionValue: typeConverter.sina2Odata(type, valueLow),
            ConditionValueHigh: typeConverter.sina2Odata(type, valueHigh),
            SubFilters: []
          };
          return conditionObj;
        }
        throw new InBetweenConditionInConsistent();
      }
    }, {
      key: "serialize",
      value: function serialize(condition) {
        if (condition instanceof ComplexCondition) {
          if (condition.operator === LogicalOperator.And && condition.conditions[0] && (condition.conditions[0].operator === ComparisonOperator.Ge || condition.conditions[0].operator === ComparisonOperator.Gt || condition.conditions[0].operator === ComparisonOperator.Le || condition.conditions[0].operator === ComparisonOperator.Lt)) {
            if (condition.conditions.length === 1) {
              // condition example: "" ... "100"
              return this.serializeSimpleCondition(condition.conditions[0]);
            }
            // condition example: "10" ... "100"
            return this.serializeBetweenCondition(condition);
          }
          return this.serializeComplexCondition(condition);
        }
        // condition example: "USA"
        if (condition instanceof SimpleCondition) {
          return this.serializeSimpleCondition(condition);
        }
      }
    }]);
    return ConditionSerializer;
  }();
  function serialize(dataSource, condition) {
    var serializer = new ConditionSerializer(dataSource);
    return serializer.serialize(condition);
  }
  var __exports = {
    __esModule: true
  };
  __exports.serialize = serialize;
  return __exports;
});
})();