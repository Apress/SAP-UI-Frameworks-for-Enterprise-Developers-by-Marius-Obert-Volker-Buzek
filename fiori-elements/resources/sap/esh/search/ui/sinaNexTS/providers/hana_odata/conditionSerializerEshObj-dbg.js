/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/DataSource", "../../sina/ComparisonOperator", "../../sina/LogicalOperator", "../../sina/ComplexCondition", "../../sina/AttributeType", "./typeConverter", "./eshObjects/src/index", "../../core/errors"], function (____sina_DataSource, ____sina_ComparisonOperator, ____sina_LogicalOperator, ____sina_ComplexCondition, ____sina_AttributeType, typeConverter, ___eshObjects_src_index, ____core_errors) {
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
  var DataSource = ____sina_DataSource["DataSource"];
  var ComparisonOperator = ____sina_ComparisonOperator["ComparisonOperator"];
  var LogicalOperator = ____sina_LogicalOperator["LogicalOperator"];
  var ComplexCondition = ____sina_ComplexCondition["ComplexCondition"];
  var AttributeType = ____sina_AttributeType["AttributeType"];
  var EshObjComparisonOperator = ___eshObjects_src_index["SearchQueryComparisonOperator"];
  var SearchQueryLogicalOperator = ___eshObjects_src_index["SearchQueryLogicalOperator"];
  var Expression = ___eshObjects_src_index["Expression"];
  var Comparison = ___eshObjects_src_index["Comparison"];
  var Phrase = ___eshObjects_src_index["Phrase"];
  var StringValue = ___eshObjects_src_index["StringValue"]; // import * as eshObjectsQL from "./eshObjects/src/index";
  var UnknownComparisonOperatorError = ____core_errors["UnknownComparisonOperatorError"];
  var UnknownLogicalOperatorError = ____core_errors["UnknownLogicalOperatorError"];
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
            return EshObjComparisonOperator.EqualCaseSensitive;
          case ComparisonOperator.Ne:
            return EshObjComparisonOperator.NotEqualCaseSensitive;
          case ComparisonOperator.Lt:
            return EshObjComparisonOperator.LessThanCaseInsensitive;
          case ComparisonOperator.Gt:
            return EshObjComparisonOperator.GreaterThanCaseInsensitive;
          case ComparisonOperator.Le:
            return EshObjComparisonOperator.LessThanOrEqualCaseInsensitive;
          case ComparisonOperator.Ge:
            return EshObjComparisonOperator.GreaterThanOrEqualCaseInsensitive;
          case ComparisonOperator.Co:
            // Contains only
            return EshObjComparisonOperator.EqualCaseInsensitive;
          case ComparisonOperator.Bw:
            // Begin with
            return EshObjComparisonOperator.EqualCaseInsensitive;
          case ComparisonOperator.Ew:
            // End with
            return EshObjComparisonOperator.EqualCaseInsensitive;
          case ComparisonOperator.DescendantOf:
            return EshObjComparisonOperator.DescendantOf;
          case ComparisonOperator.ChildOf:
            return EshObjComparisonOperator.ChildOf;
          default:
            throw new UnknownComparisonOperatorError("Unknow comparison operator " + sinaOperator);
        }
      }
    }, {
      key: "convertSinaToOdataLogicalOperator",
      value: function convertSinaToOdataLogicalOperator(sinaOperator) {
        switch (sinaOperator) {
          case LogicalOperator.And:
            return SearchQueryLogicalOperator.AND;
          case LogicalOperator.Or:
            return SearchQueryLogicalOperator.OR;
          default:
            throw new UnknownLogicalOperatorError("Unknow logical operator " + sinaOperator);
        }
      }
    }, {
      key: "serializeComplexCondition",
      value: function serializeComplexCondition(condition) {
        var result = new Expression({
          operator: this.convertSinaToOdataLogicalOperator(condition.operator),
          items: []
        });
        var subConditions = condition.conditions;
        for (var i = 0; i < subConditions.length; ++i) {
          var subCondition = subConditions[i];
          result.items.push(this.serialize(subCondition));
        }
        return result;
      }
    }, {
      key: "serializeSimpleCondition",
      value: function serializeSimpleCondition(condition) {
        var type = AttributeType.String;
        var metadata;
        if (this.dataSource instanceof DataSource) {
          metadata = this.dataSource.getAttributeMetadata(condition.attribute);
          if (metadata && metadata.type) {
            type = metadata.type;
          }
        }
        var conditionValue = typeConverter.sina2Odata(type, condition.value, {
          operator: condition.operator
        });
        var conditionOperator = this.convertSinaToOdataOperator(condition.operator);
        return new Comparison({
          property: condition.attribute,
          operator: conditionOperator,
          value: new Phrase({
            phrase: conditionValue
          })
        });
      }
    }, {
      key: "serializeBetweenCondition",
      value: function serializeBetweenCondition(condition) {
        var lowCondition = condition.conditions[0];
        var highCondition = condition.conditions[1];
        var type = AttributeType.String;
        if (this.dataSource instanceof DataSource) {
          var metadata = this.dataSource.getAttributeMetadata(lowCondition.attribute);
          type = metadata.type || AttributeType.String;
        }
        var lowValue = typeConverter.sina2Odata(type, lowCondition.value, {
          operator: lowCondition.operator
        });
        var highValue = typeConverter.sina2Odata(type, highCondition.value, {
          operator: highCondition.operator
        });
        return new Expression({
          operator: SearchQueryLogicalOperator.AND,
          items: [new Comparison({
            property: lowCondition.attribute,
            operator: EshObjComparisonOperator.GreaterThanOrEqualCaseInsensitive,
            value: new StringValue({
              value: lowValue,
              isQuoted: true
            })
          }), new Comparison({
            property: lowCondition.attribute,
            operator: EshObjComparisonOperator.LessThanOrEqualCaseInsensitive,
            value: new StringValue({
              value: highValue,
              isQuoted: true
            })
          })]
        });

        // return new Comparison({
        //     property: lowCondition.attribute,
        //     operator: EshObjComparisonOperator.BetweenCaseInsensitive,
        //     value: new RangeValues({
        //         start: lowValue, // currently only support simple types of string and number, will be improved
        //         end: highValue,
        //     }),
        // });
      }
    }, {
      key: "serialize",
      value: function serialize(condition) {
        if (condition instanceof ComplexCondition) {
          if (condition.operator === LogicalOperator.And && condition.conditions.length > 1 &&
          // TODO: Enum
          condition.conditions[0] && (condition.conditions[0].operator === ComparisonOperator.Ge || condition.conditions[0].operator === ComparisonOperator.Gt || condition.conditions[0].operator === ComparisonOperator.Le || condition.conditions[0].operator === ComparisonOperator.Lt)) {
            return this.serializeBetweenCondition(condition);
          }
          return this.serializeComplexCondition(condition);
        }
        return this.serializeSimpleCondition(condition);
      }
    }]);
    return ConditionSerializer;
  }();
  function serialize(dataSource, condition) {
    var serializer = new ConditionSerializer(dataSource);
    var result = serializer.serialize(condition);
    if (result instanceof Comparison) {
      result = new Expression({
        operator: SearchQueryLogicalOperator.TIGHT_AND,
        items: [result]
      });
    }
    return result;
  }
  var __exports = {
    __esModule: true
  };
  __exports.ConditionSerializer = ConditionSerializer;
  __exports.serialize = serialize;
  return __exports;
});
})();