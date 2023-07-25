/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../core/errors", "../../sina/AttributeType", "../../sina/ComparisonOperator", "../../sina/ComplexCondition", "./typeConverter"], function (____core_errors, ____sina_AttributeType, ____sina_ComparisonOperator, ____sina_ComplexCondition, typeConverter) {
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
  var UnknownComparisonOperatorError = ____core_errors["UnknownComparisonOperatorError"];
  var AttributeType = ____sina_AttributeType["AttributeType"];
  var ComparisonOperator = ____sina_ComparisonOperator["ComparisonOperator"];
  var ComplexCondition = ____sina_ComplexCondition["ComplexCondition"];
  var ConditionSerializer = /*#__PURE__*/function () {
    function ConditionSerializer(dataSource) {
      _classCallCheck(this, ConditionSerializer);
      this.dataSource = dataSource;
    }
    _createClass(ConditionSerializer, [{
      key: "convertSinaToInaOperator",
      value: function convertSinaToInaOperator(sinaOperator) {
        switch (sinaOperator) {
          case ComparisonOperator.Eq:
            return "=";
          case ComparisonOperator.Lt:
            return "<";
          case ComparisonOperator.Gt:
            return ">";
          case ComparisonOperator.Le:
            return "<=";
          case ComparisonOperator.Ge:
            return ">=";
          case ComparisonOperator.Co:
            return "=";
          case ComparisonOperator.Bw:
            return "=";
          case ComparisonOperator.Ew:
            return "=";
          default:
            throw new UnknownComparisonOperatorError("unknow comparison operator " + sinaOperator);
        }
      }
    }, {
      key: "serializeComplexCondition",
      value: function serializeComplexCondition(condition) {
        var result = {
          Selection: {
            Operator: {
              Code: condition.operator,
              SubSelections: []
            }
          }
        };
        var subConditions = condition.conditions;
        for (var i = 0; i < subConditions.length; ++i) {
          var subCondition = subConditions[i];
          result.Selection.Operator.SubSelections.push(this.serialize(subCondition));
        }
        return result;
      }
    }, {
      key: "serializeSimpleCondition",
      value: function serializeSimpleCondition(condition) {
        if (!condition.value) {
          return undefined;
        }

        // get type of attribute in condition
        var attributeId = condition.attribute;
        var type;
        if (attributeId.slice(0, 2) === "$$") {
          type = AttributeType.String;
        } else {
          var metadata = this.dataSource.getAttributeMetadata(attributeId);
          type = metadata.type;
        }

        // set operand
        var operand = "MemberOperand";
        if (attributeId === "$$SuggestionTerms$$" || attributeId === "$$SearchTerms$$") {
          operand = "SearchOperand";
        }

        // assemble condition
        var result = {};
        result[operand] = {
          AttributeName: attributeId,
          Comparison: this.convertSinaToInaOperator(condition.operator),
          Value: typeConverter.sina2Ina(type, condition.value, {
            operator: condition.operator
          })
        };
        return result;
      }
    }, {
      key: "serialize",
      value: function serialize(condition) {
        if (condition instanceof ComplexCondition) {
          return this.serializeComplexCondition(condition);
        }
        return this.serializeSimpleCondition(condition);
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