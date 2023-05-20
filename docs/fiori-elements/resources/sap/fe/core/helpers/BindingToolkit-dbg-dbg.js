/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["./AnnotationEnum"], function (AnnotationEnum) {
  "use strict";

  var _exports = {};
  var resolveEnumValue = AnnotationEnum.resolveEnumValue;
  const EDM_TYPE_MAPPING = {
    "Edm.Boolean": {
      type: "sap.ui.model.odata.type.Boolean"
    },
    "Edm.Byte": {
      type: "sap.ui.model.odata.type.Byte"
    },
    "Edm.Date": {
      type: "sap.ui.model.odata.type.Date"
    },
    "Edm.DateTimeOffset": {
      constraints: {
        $Precision: "precision",
        $V4: "V4"
      },
      type: "sap.ui.model.odata.type.DateTimeOffset"
    },
    "Edm.Decimal": {
      constraints: {
        "@Org.OData.Validation.V1.Minimum/$Decimal": "minimum",
        "@Org.OData.Validation.V1.Minimum@Org.OData.Validation.V1.Exclusive": "minimumExclusive",
        "@Org.OData.Validation.V1.Maximum/$Decimal": "maximum",
        "@Org.OData.Validation.V1.Maximum@Org.OData.Validation.V1.Exclusive": "maximumExclusive",
        $Precision: "precision",
        $Scale: "scale"
      },
      type: "sap.ui.model.odata.type.Decimal"
    },
    "Edm.Double": {
      type: "sap.ui.model.odata.type.Double"
    },
    "Edm.Guid": {
      type: "sap.ui.model.odata.type.Guid"
    },
    "Edm.Int16": {
      type: "sap.ui.model.odata.type.Int16"
    },
    "Edm.Int32": {
      type: "sap.ui.model.odata.type.Int32"
    },
    "Edm.Int64": {
      type: "sap.ui.model.odata.type.Int64"
    },
    "Edm.SByte": {
      type: "sap.ui.model.odata.type.SByte"
    },
    "Edm.Single": {
      type: "sap.ui.model.odata.type.Single"
    },
    "Edm.Stream": {
      type: "sap.ui.model.odata.type.Stream"
    },
    "Edm.Binary": {
      type: "sap.ui.model.odata.type.Stream"
    },
    "Edm.String": {
      constraints: {
        "@com.sap.vocabularies.Common.v1.IsDigitSequence": "isDigitSequence",
        $MaxLength: "maxLength",
        $Nullable: "nullable"
      },
      type: "sap.ui.model.odata.type.String"
    },
    "Edm.TimeOfDay": {
      constraints: {
        $Precision: "precision"
      },
      type: "sap.ui.model.odata.type.TimeOfDay"
    }
  };

  /**
   * An expression that evaluates to type T, or a constant value of type T
   */
  _exports.EDM_TYPE_MAPPING = EDM_TYPE_MAPPING;
  const unresolvableExpression = {
    _type: "Unresolvable"
  };
  _exports.unresolvableExpression = unresolvableExpression;
  function escapeXmlAttribute(inputString) {
    return inputString.replace(/'/g, "\\'");
  }
  function hasUnresolvableExpression() {
    for (var _len = arguments.length, expressions = new Array(_len), _key = 0; _key < _len; _key++) {
      expressions[_key] = arguments[_key];
    }
    return expressions.find(expr => expr._type === "Unresolvable") !== undefined;
  }
  /**
   * Check two expressions for (deep) equality.
   *
   * @param a
   * @param b
   * @returns `true` if the two expressions are equal
   * @private
   */
  _exports.hasUnresolvableExpression = hasUnresolvableExpression;
  function _checkExpressionsAreEqual(a, b) {
    if (a._type !== b._type) {
      return false;
    }
    switch (a._type) {
      case "Unresolvable":
        return false;
      // Unresolvable is never equal to anything even itself
      case "Constant":
      case "EmbeddedBinding":
      case "EmbeddedExpressionBinding":
        return a.value === b.value;
      case "Not":
        return _checkExpressionsAreEqual(a.operand, b.operand);
      case "Truthy":
        return _checkExpressionsAreEqual(a.operand, b.operand);
      case "Set":
        return a.operator === b.operator && a.operands.length === b.operands.length && a.operands.every(expression => b.operands.some(otherExpression => _checkExpressionsAreEqual(expression, otherExpression)));
      case "IfElse":
        return _checkExpressionsAreEqual(a.condition, b.condition) && _checkExpressionsAreEqual(a.onTrue, b.onTrue) && _checkExpressionsAreEqual(a.onFalse, b.onFalse);
      case "Comparison":
        return a.operator === b.operator && _checkExpressionsAreEqual(a.operand1, b.operand1) && _checkExpressionsAreEqual(a.operand2, b.operand2);
      case "Concat":
        const aExpressions = a.expressions;
        const bExpressions = b.expressions;
        if (aExpressions.length !== bExpressions.length) {
          return false;
        }
        return aExpressions.every((expression, index) => {
          return _checkExpressionsAreEqual(expression, bExpressions[index]);
        });
      case "Length":
        return _checkExpressionsAreEqual(a.pathInModel, b.pathInModel);
      case "PathInModel":
        return a.modelName === b.modelName && a.path === b.path && a.targetEntitySet === b.targetEntitySet;
      case "Formatter":
        return a.fn === b.fn && a.parameters.length === b.parameters.length && a.parameters.every((value, index) => _checkExpressionsAreEqual(b.parameters[index], value));
      case "ComplexType":
        return a.type === b.type && a.bindingParameters.length === b.bindingParameters.length && a.bindingParameters.every((value, index) => _checkExpressionsAreEqual(b.bindingParameters[index], value));
      case "Function":
        const otherFunction = b;
        if (a.obj === undefined || otherFunction.obj === undefined) {
          return a.obj === otherFunction;
        }
        return a.fn === otherFunction.fn && _checkExpressionsAreEqual(a.obj, otherFunction.obj) && a.parameters.length === otherFunction.parameters.length && a.parameters.every((value, index) => _checkExpressionsAreEqual(otherFunction.parameters[index], value));
      case "Ref":
        return a.ref === b.ref;
    }
    return false;
  }

  /**
   * Converts a nested SetExpression by inlining operands of type SetExpression with the same operator.
   *
   * @param expression The expression to flatten
   * @returns A new SetExpression with the same operator
   */
  _exports._checkExpressionsAreEqual = _checkExpressionsAreEqual;
  function flattenSetExpression(expression) {
    return expression.operands.reduce((result, operand) => {
      const candidatesForFlattening = operand._type === "Set" && operand.operator === expression.operator ? operand.operands : [operand];
      candidatesForFlattening.forEach(candidate => {
        if (result.operands.every(e => !_checkExpressionsAreEqual(e, candidate))) {
          result.operands.push(candidate);
        }
      });
      return result;
    }, {
      _type: "Set",
      operator: expression.operator,
      operands: []
    });
  }

  /**
   * Detects whether an array of boolean expressions contains an expression and its negation.
   *
   * @param expressions Array of expressions
   * @returns `true` if the set of expressions contains an expression and its negation
   */
  function hasOppositeExpressions(expressions) {
    const negatedExpressions = expressions.map(not);
    return expressions.some((expression, index) => {
      for (let i = index + 1; i < negatedExpressions.length; i++) {
        if (_checkExpressionsAreEqual(expression, negatedExpressions[i])) {
          return true;
        }
      }
      return false;
    });
  }

  /**
   * Logical `and` expression.
   *
   * The expression is simplified to false if this can be decided statically (that is, if one operand is a constant
   * false or if the expression contains an operand and its negation).
   *
   * @param operands Expressions to connect by `and`
   * @returns Expression evaluating to boolean
   */
  function and() {
    for (var _len2 = arguments.length, operands = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      operands[_key2] = arguments[_key2];
    }
    const expressions = flattenSetExpression({
      _type: "Set",
      operator: "&&",
      operands: operands.map(wrapPrimitive)
    }).operands;
    if (hasUnresolvableExpression(...expressions)) {
      return unresolvableExpression;
    }
    let isStaticFalse = false;
    const nonTrivialExpression = expressions.filter(expression => {
      if (isFalse(expression)) {
        isStaticFalse = true;
      }
      return !isConstant(expression);
    });
    if (isStaticFalse) {
      return constant(false);
    } else if (nonTrivialExpression.length === 0) {
      // Resolve the constant then
      const isValid = expressions.reduce((result, expression) => result && isTrue(expression), true);
      return constant(isValid);
    } else if (nonTrivialExpression.length === 1) {
      return nonTrivialExpression[0];
    } else if (hasOppositeExpressions(nonTrivialExpression)) {
      return constant(false);
    } else {
      return {
        _type: "Set",
        operator: "&&",
        operands: nonTrivialExpression
      };
    }
  }

  /**
   * Logical `or` expression.
   *
   * The expression is simplified to true if this can be decided statically (that is, if one operand is a constant
   * true or if the expression contains an operand and its negation).
   *
   * @param operands Expressions to connect by `or`
   * @returns Expression evaluating to boolean
   */
  _exports.and = and;
  function or() {
    for (var _len3 = arguments.length, operands = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      operands[_key3] = arguments[_key3];
    }
    const expressions = flattenSetExpression({
      _type: "Set",
      operator: "||",
      operands: operands.map(wrapPrimitive)
    }).operands;
    if (hasUnresolvableExpression(...expressions)) {
      return unresolvableExpression;
    }
    let isStaticTrue = false;
    const nonTrivialExpression = expressions.filter(expression => {
      if (isTrue(expression)) {
        isStaticTrue = true;
      }
      return !isConstant(expression) || expression.value;
    });
    if (isStaticTrue) {
      return constant(true);
    } else if (nonTrivialExpression.length === 0) {
      // Resolve the constant then
      const isValid = expressions.reduce((result, expression) => result && isTrue(expression), true);
      return constant(isValid);
    } else if (nonTrivialExpression.length === 1) {
      return nonTrivialExpression[0];
    } else if (hasOppositeExpressions(nonTrivialExpression)) {
      return constant(true);
    } else {
      return {
        _type: "Set",
        operator: "||",
        operands: nonTrivialExpression
      };
    }
  }

  /**
   * Logical `not` operator.
   *
   * @param operand The expression to reverse
   * @returns The resulting expression that evaluates to boolean
   */
  _exports.or = or;
  function not(operand) {
    operand = wrapPrimitive(operand);
    if (hasUnresolvableExpression(operand)) {
      return unresolvableExpression;
    } else if (isConstant(operand)) {
      return constant(!operand.value);
    } else if (typeof operand === "object" && operand._type === "Set" && operand.operator === "||" && operand.operands.every(expression => isConstant(expression) || isComparison(expression))) {
      return and(...operand.operands.map(expression => not(expression)));
    } else if (typeof operand === "object" && operand._type === "Set" && operand.operator === "&&" && operand.operands.every(expression => isConstant(expression) || isComparison(expression))) {
      return or(...operand.operands.map(expression => not(expression)));
    } else if (isComparison(operand)) {
      // Create the reverse comparison
      switch (operand.operator) {
        case "!==":
          return {
            ...operand,
            operator: "==="
          };
        case "<":
          return {
            ...operand,
            operator: ">="
          };
        case "<=":
          return {
            ...operand,
            operator: ">"
          };
        case "===":
          return {
            ...operand,
            operator: "!=="
          };
        case ">":
          return {
            ...operand,
            operator: "<="
          };
        case ">=":
          return {
            ...operand,
            operator: "<"
          };
      }
    } else if (operand._type === "Not") {
      return operand.operand;
    }
    return {
      _type: "Not",
      operand: operand
    };
  }

  /**
   * Evaluates whether a binding expression is equal to true with a loose equality.
   *
   * @param operand The expression to check
   * @returns The resulting expression that evaluates to boolean
   */
  _exports.not = not;
  function isTruthy(operand) {
    if (isConstant(operand)) {
      return constant(!!operand.value);
    } else {
      return {
        _type: "Truthy",
        operand: operand
      };
    }
  }

  /**
   * Creates a binding expression that will be evaluated by the corresponding model.
   *
   * @param path
   * @param modelName
   * @param visitedNavigationPaths
   * @param pathVisitor
   * @returns An expression representating that path in the model
   * @deprecated use pathInModel instead
   */
  _exports.isTruthy = isTruthy;
  function bindingExpression(path, modelName) {
    let visitedNavigationPaths = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    let pathVisitor = arguments.length > 3 ? arguments[3] : undefined;
    return pathInModel(path, modelName, visitedNavigationPaths, pathVisitor);
  }

  /**
   * Creates a binding expression that will be evaluated by the corresponding model.
   *
   * @template TargetType
   * @param path The path on the model
   * @param [modelName] The name of the model
   * @param [visitedNavigationPaths] The paths from the root entitySet
   * @param [pathVisitor] A function to modify the resulting path
   * @returns An expression representating that path in the model
   */
  _exports.bindingExpression = bindingExpression;
  function pathInModel(path, modelName) {
    let visitedNavigationPaths = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    let pathVisitor = arguments.length > 3 ? arguments[3] : undefined;
    if (path === undefined) {
      return unresolvableExpression;
    }
    let targetPath;
    if (pathVisitor) {
      targetPath = pathVisitor(path);
      if (targetPath === undefined) {
        return unresolvableExpression;
      }
    } else {
      const localPath = visitedNavigationPaths.concat();
      localPath.push(path);
      targetPath = localPath.join("/");
    }
    return {
      _type: "PathInModel",
      modelName: modelName,
      path: targetPath
    };
  }
  _exports.pathInModel = pathInModel;
  /**
   * Creates a constant expression based on a primitive value.
   *
   * @template T
   * @param value The constant to wrap in an expression
   * @returns The constant expression
   */
  function constant(value) {
    let constantValue;
    if (typeof value === "object" && value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        constantValue = value.map(wrapPrimitive);
      } else if (isPrimitiveObject(value)) {
        constantValue = value.valueOf();
      } else {
        constantValue = Object.entries(value).reduce((plainExpression, _ref) => {
          let [key, val] = _ref;
          const wrappedValue = wrapPrimitive(val);
          if (wrappedValue._type !== "Constant" || wrappedValue.value !== undefined) {
            plainExpression[key] = wrappedValue;
          }
          return plainExpression;
        }, {});
      }
    } else {
      constantValue = value;
    }
    return {
      _type: "Constant",
      value: constantValue
    };
  }
  _exports.constant = constant;
  function resolveBindingString(value, targetType) {
    if (value !== undefined && typeof value === "string" && value.startsWith("{")) {
      const pathInModelRegex = /^{(.*)>(.+)}$/; // Matches model paths like "model>path" or ">path" (default model)
      const pathInModelRegexMatch = pathInModelRegex.exec(value);
      if (value.startsWith("{=")) {
        // Expression binding, we can just remove the outer binding things
        return {
          _type: "EmbeddedExpressionBinding",
          value: value
        };
      } else if (pathInModelRegexMatch) {
        return pathInModel(pathInModelRegexMatch[2] || "", pathInModelRegexMatch[1] || undefined);
      } else {
        return {
          _type: "EmbeddedBinding",
          value: value
        };
      }
    } else if (targetType === "boolean" && typeof value === "string" && (value === "true" || value === "false")) {
      return constant(value === "true");
    } else if (targetType === "number" && typeof value === "string" && (!isNaN(Number(value)) || value === "NaN")) {
      return constant(Number(value));
    } else {
      return constant(value);
    }
  }

  /**
   * A named reference.
   *
   * @see fn
   * @param reference Reference
   * @returns The object reference binding part
   */
  _exports.resolveBindingString = resolveBindingString;
  function ref(reference) {
    return {
      _type: "Ref",
      ref: reference
    };
  }

  /**
   * Wrap a primitive into a constant expression if it is not already an expression.
   *
   * @template T
   * @param something The object to wrap in a Constant expression
   * @returns Either the original object or the wrapped one depending on the case
   */
  _exports.ref = ref;
  function wrapPrimitive(something) {
    if (isBindingToolkitExpression(something)) {
      return something;
    }
    return constant(something);
  }

  /**
   * Checks if the expression or value provided is a binding tooling expression or not.
   *
   * Every object having a property named `_type` of some value is considered an expression, even if there is actually
   * no such expression type supported.
   *
   * @param expression
   * @returns `true` if the expression is a binding toolkit expression
   */
  function isBindingToolkitExpression(expression) {
    return (expression === null || expression === void 0 ? void 0 : expression._type) !== undefined;
  }

  /**
   * Checks if the expression or value provided is constant or not.
   *
   * @template T The target type
   * @param  maybeConstant The expression or primitive value that is to be checked
   * @returns `true` if it is constant
   */
  _exports.isBindingToolkitExpression = isBindingToolkitExpression;
  function isConstant(maybeConstant) {
    return typeof maybeConstant !== "object" || maybeConstant._type === "Constant";
  }
  _exports.isConstant = isConstant;
  function isTrue(expression) {
    return isConstant(expression) && expression.value === true;
  }
  function isFalse(expression) {
    return isConstant(expression) && expression.value === false;
  }

  /**
   * Checks if the expression or value provided is a path in model expression or not.
   *
   * @template T The target type
   * @param  maybeBinding The expression or primitive value that is to be checked
   * @returns `true` if it is a path in model expression
   */
  function isPathInModelExpression(maybeBinding) {
    return (maybeBinding === null || maybeBinding === void 0 ? void 0 : maybeBinding._type) === "PathInModel";
  }

  /**
   * Checks if the expression or value provided is a complex type expression.
   *
   * @template T The target type
   * @param  maybeBinding The expression or primitive value that is to be checked
   * @returns `true` if it is a path in model expression
   */
  _exports.isPathInModelExpression = isPathInModelExpression;
  function isComplexTypeExpression(maybeBinding) {
    return (maybeBinding === null || maybeBinding === void 0 ? void 0 : maybeBinding._type) === "ComplexType";
  }

  /**
   * Checks if the expression or value provided is a concat expression or not.
   *
   * @param expression
   * @returns `true` if the expression is a ConcatExpression
   */
  _exports.isComplexTypeExpression = isComplexTypeExpression;
  function isConcatExpression(expression) {
    return (expression === null || expression === void 0 ? void 0 : expression._type) === "Concat";
  }

  /**
   * Checks if the expression provided is a comparison or not.
   *
   * @template T The target type
   * @param expression The expression
   * @returns `true` if the expression is a ComparisonExpression
   */
  function isComparison(expression) {
    return expression._type === "Comparison";
  }

  /**
   * Checks whether the input parameter is a constant expression of type undefined.
   *
   * @param expression The input expression or object in general
   * @returns `true` if the input is constant which has undefined for value
   */
  function isUndefinedExpression(expression) {
    const expressionAsExpression = expression;
    return (expressionAsExpression === null || expressionAsExpression === void 0 ? void 0 : expressionAsExpression._type) === "Constant" && (expressionAsExpression === null || expressionAsExpression === void 0 ? void 0 : expressionAsExpression.value) === undefined;
  }
  _exports.isUndefinedExpression = isUndefinedExpression;
  function isPrimitiveObject(objectType) {
    switch (objectType.constructor.name) {
      case "String":
      case "Number":
      case "Boolean":
        return true;
      default:
        return false;
    }
  }
  /**
   * Check if the passed annotation annotationValue is a ComplexAnnotationExpression.
   *
   * @template T The target type
   * @param  annotationValue The annotation annotationValue to evaluate
   * @returns `true` if the object is a {ComplexAnnotationExpression}
   */
  function isComplexAnnotationExpression(annotationValue) {
    return typeof annotationValue === "object" && !isPrimitiveObject(annotationValue);
  }

  /**
   * Generate the corresponding annotationValue for a given annotation annotationValue.
   *
   * @template T The target type
   * @param annotationValue The source annotation annotationValue
   * @param visitedNavigationPaths The path from the root entity set
   * @param defaultValue Default value if the annotationValue is undefined
   * @param pathVisitor A function to modify the resulting path
   * @returns The annotationValue equivalent to that annotation annotationValue
   * @deprecated use getExpressionFromAnnotation instead
   */
  function annotationExpression(annotationValue) {
    let visitedNavigationPaths = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let defaultValue = arguments.length > 2 ? arguments[2] : undefined;
    let pathVisitor = arguments.length > 3 ? arguments[3] : undefined;
    return getExpressionFromAnnotation(annotationValue, visitedNavigationPaths, defaultValue, pathVisitor);
  }
  /**
   * Generate the corresponding annotationValue for a given annotation annotationValue.
   *
   * @template T The target type
   * @param annotationValue The source annotation annotationValue
   * @param visitedNavigationPaths The path from the root entity set
   * @param defaultValue Default value if the annotationValue is undefined
   * @param pathVisitor A function to modify the resulting path
   * @returns The annotationValue equivalent to that annotation annotationValue
   */
  _exports.annotationExpression = annotationExpression;
  function getExpressionFromAnnotation(annotationValue) {
    var _annotationValue;
    let visitedNavigationPaths = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let defaultValue = arguments.length > 2 ? arguments[2] : undefined;
    let pathVisitor = arguments.length > 3 ? arguments[3] : undefined;
    if (annotationValue === undefined) {
      return wrapPrimitive(defaultValue);
    }
    annotationValue = (_annotationValue = annotationValue) === null || _annotationValue === void 0 ? void 0 : _annotationValue.valueOf();
    if (!isComplexAnnotationExpression(annotationValue)) {
      return constant(annotationValue);
    }
    switch (annotationValue.type) {
      case "Path":
        return pathInModel(annotationValue.path, undefined, visitedNavigationPaths, pathVisitor);
      case "If":
        return annotationIfExpression(annotationValue.If, visitedNavigationPaths, pathVisitor);
      case "Not":
        return not(parseAnnotationCondition(annotationValue.Not, visitedNavigationPaths, pathVisitor));
      case "Eq":
        return equal(parseAnnotationCondition(annotationValue.Eq[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.Eq[1], visitedNavigationPaths, pathVisitor));
      case "Ne":
        return notEqual(parseAnnotationCondition(annotationValue.Ne[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.Ne[1], visitedNavigationPaths, pathVisitor));
      case "Gt":
        return greaterThan(parseAnnotationCondition(annotationValue.Gt[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.Gt[1], visitedNavigationPaths, pathVisitor));
      case "Ge":
        return greaterOrEqual(parseAnnotationCondition(annotationValue.Ge[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.Ge[1], visitedNavigationPaths, pathVisitor));
      case "Lt":
        return lessThan(parseAnnotationCondition(annotationValue.Lt[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.Lt[1], visitedNavigationPaths, pathVisitor));
      case "Le":
        return lessOrEqual(parseAnnotationCondition(annotationValue.Le[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.Le[1], visitedNavigationPaths, pathVisitor));
      case "Or":
        return or(...annotationValue.Or.map(function (orCondition) {
          return parseAnnotationCondition(orCondition, visitedNavigationPaths, pathVisitor);
        }));
      case "And":
        return and(...annotationValue.And.map(function (andCondition) {
          return parseAnnotationCondition(andCondition, visitedNavigationPaths, pathVisitor);
        }));
      case "Apply":
        return annotationApplyExpression(annotationValue, visitedNavigationPaths, pathVisitor);
    }
    return unresolvableExpression;
  }

  /**
   * Parse the annotation condition into an expression.
   *
   * @template T The target type
   * @param annotationValue The condition or value from the annotation
   * @param visitedNavigationPaths The path from the root entity set
   * @param pathVisitor A function to modify the resulting path
   * @returns An equivalent expression
   */
  _exports.getExpressionFromAnnotation = getExpressionFromAnnotation;
  function parseAnnotationCondition(annotationValue) {
    let visitedNavigationPaths = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let pathVisitor = arguments.length > 2 ? arguments[2] : undefined;
    if (annotationValue === null || typeof annotationValue !== "object") {
      return constant(annotationValue);
    } else if (annotationValue.hasOwnProperty("$Or")) {
      return or(...annotationValue.$Or.map(function (orCondition) {
        return parseAnnotationCondition(orCondition, visitedNavigationPaths, pathVisitor);
      }));
    } else if (annotationValue.hasOwnProperty("$And")) {
      return and(...annotationValue.$And.map(function (andCondition) {
        return parseAnnotationCondition(andCondition, visitedNavigationPaths, pathVisitor);
      }));
    } else if (annotationValue.hasOwnProperty("$Not")) {
      return not(parseAnnotationCondition(annotationValue.$Not, visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Eq")) {
      return equal(parseAnnotationCondition(annotationValue.$Eq[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Eq[1], visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Ne")) {
      return notEqual(parseAnnotationCondition(annotationValue.$Ne[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Ne[1], visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Gt")) {
      return greaterThan(parseAnnotationCondition(annotationValue.$Gt[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Gt[1], visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Ge")) {
      return greaterOrEqual(parseAnnotationCondition(annotationValue.$Ge[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Ge[1], visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Lt")) {
      return lessThan(parseAnnotationCondition(annotationValue.$Lt[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Lt[1], visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Le")) {
      return lessOrEqual(parseAnnotationCondition(annotationValue.$Le[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Le[1], visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Path")) {
      return pathInModel(annotationValue.$Path, undefined, visitedNavigationPaths, pathVisitor);
    } else if (annotationValue.hasOwnProperty("$Apply")) {
      return getExpressionFromAnnotation({
        type: "Apply",
        Function: annotationValue.$Function,
        Apply: annotationValue.$Apply
      }, visitedNavigationPaths, undefined, pathVisitor);
    } else if (annotationValue.hasOwnProperty("$If")) {
      return getExpressionFromAnnotation({
        type: "If",
        If: annotationValue.$If
      }, visitedNavigationPaths, undefined, pathVisitor);
    } else if (annotationValue.hasOwnProperty("$EnumMember")) {
      return constant(resolveEnumValue(annotationValue.$EnumMember));
    }
    return constant(false);
  }

  /**
   * Process the {IfAnnotationExpressionValue} into an expression.
   *
   * @template T The target type
   * @param annotationValue An If expression returning the type T
   * @param visitedNavigationPaths The path from the root entity set
   * @param pathVisitor A function to modify the resulting path
   * @returns The equivalent ifElse expression
   */
  function annotationIfExpression(annotationValue) {
    let visitedNavigationPaths = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let pathVisitor = arguments.length > 2 ? arguments[2] : undefined;
    return ifElse(parseAnnotationCondition(annotationValue[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue[1], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue[2], visitedNavigationPaths, pathVisitor));
  }
  _exports.annotationIfExpression = annotationIfExpression;
  function annotationApplyExpression(applyExpression) {
    let visitedNavigationPaths = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let pathVisitor = arguments.length > 2 ? arguments[2] : undefined;
    switch (applyExpression.Function) {
      case "odata.concat":
        return concat(...applyExpression.Apply.map(applyParam => {
          let applyParamConverted = applyParam;
          if (applyParam.hasOwnProperty("$Path")) {
            applyParamConverted = {
              type: "Path",
              path: applyParam.$Path
            };
          } else if (applyParam.hasOwnProperty("$If")) {
            applyParamConverted = {
              type: "If",
              If: applyParam.$If
            };
          } else if (applyParam.hasOwnProperty("$Apply")) {
            applyParamConverted = {
              type: "Apply",
              Function: applyParam.$Function,
              Apply: applyParam.$Apply
            };
          }
          return getExpressionFromAnnotation(applyParamConverted, visitedNavigationPaths, undefined, pathVisitor);
        }));
    }
    return unresolvableExpression;
  }

  /**
   * Generic helper for the comparison operations (equal, notEqual, ...).
   *
   * @template T The target type
   * @param operator The operator to apply
   * @param leftOperand The operand on the left side of the operator
   * @param rightOperand The operand on the right side of the operator
   * @returns An expression representing the comparison
   */
  _exports.annotationApplyExpression = annotationApplyExpression;
  function comparison(operator, leftOperand, rightOperand) {
    const leftExpression = wrapPrimitive(leftOperand);
    const rightExpression = wrapPrimitive(rightOperand);
    if (hasUnresolvableExpression(leftExpression, rightExpression)) {
      return unresolvableExpression;
    }
    if (isConstant(leftExpression) && isConstant(rightExpression)) {
      switch (operator) {
        case "!==":
          return constant(leftExpression.value !== rightExpression.value);
        case "===":
          return constant(leftExpression.value === rightExpression.value);
        case "<":
          return constant(leftExpression.value < rightExpression.value);
        case "<=":
          return constant(leftExpression.value <= rightExpression.value);
        case ">":
          return constant(leftExpression.value > rightExpression.value);
        case ">=":
          return constant(leftExpression.value >= rightExpression.value);
      }
    } else {
      return {
        _type: "Comparison",
        operator: operator,
        operand1: leftExpression,
        operand2: rightExpression
      };
    }
  }
  function length(expression) {
    if (expression._type === "Unresolvable") {
      return expression;
    }
    return {
      _type: "Length",
      pathInModel: expression
    };
  }

  /**
   * Comparison: "equal" (===).
   *
   * @template T The target type
   * @param leftOperand The operand on the left side
   * @param rightOperand The operand on the right side of the comparison
   * @returns An expression representing the comparison
   */
  _exports.length = length;
  function equal(leftOperand, rightOperand) {
    const leftExpression = wrapPrimitive(leftOperand);
    const rightExpression = wrapPrimitive(rightOperand);
    if (hasUnresolvableExpression(leftExpression, rightExpression)) {
      return unresolvableExpression;
    }
    if (_checkExpressionsAreEqual(leftExpression, rightExpression)) {
      return constant(true);
    }
    function reduce(left, right) {
      if (left._type === "Comparison" && isTrue(right)) {
        // compare(a, b) === true ~~> compare(a, b)
        return left;
      } else if (left._type === "Comparison" && isFalse(right)) {
        // compare(a, b) === false ~~> !compare(a, b)
        return not(left);
      } else if (left._type === "IfElse" && _checkExpressionsAreEqual(left.onTrue, right)) {
        // (if (x) { a } else { b }) === a ~~> x || (b === a)
        return or(left.condition, equal(left.onFalse, right));
      } else if (left._type === "IfElse" && _checkExpressionsAreEqual(left.onFalse, right)) {
        // (if (x) { a } else { b }) === b ~~> !x || (a === b)
        return or(not(left.condition), equal(left.onTrue, right));
      } else if (left._type === "IfElse" && isConstant(left.onTrue) && isConstant(left.onFalse) && isConstant(right) && !_checkExpressionsAreEqual(left.onTrue, right) && !_checkExpressionsAreEqual(left.onFalse, right)) {
        return constant(false);
      }
      return undefined;
    }

    // exploit symmetry: a === b <~> b === a
    const reduced = reduce(leftExpression, rightExpression) ?? reduce(rightExpression, leftExpression);
    return reduced ?? comparison("===", leftExpression, rightExpression);
  }

  /**
   * Comparison: "not equal" (!==).
   *
   * @template T The target type
   * @param leftOperand The operand on the left side
   * @param rightOperand The operand on the right side of the comparison
   * @returns An expression representing the comparison
   */
  _exports.equal = equal;
  function notEqual(leftOperand, rightOperand) {
    return not(equal(leftOperand, rightOperand));
  }

  /**
   * Comparison: "greater or equal" (>=).
   *
   * @template T The target type
   * @param leftOperand The operand on the left side
   * @param rightOperand The operand on the right side of the comparison
   * @returns An expression representing the comparison
   */
  _exports.notEqual = notEqual;
  function greaterOrEqual(leftOperand, rightOperand) {
    return comparison(">=", leftOperand, rightOperand);
  }

  /**
   * Comparison: "greater than" (>).
   *
   * @template T The target type
   * @param leftOperand The operand on the left side
   * @param rightOperand The operand on the right side of the comparison
   * @returns An expression representing the comparison
   */
  _exports.greaterOrEqual = greaterOrEqual;
  function greaterThan(leftOperand, rightOperand) {
    return comparison(">", leftOperand, rightOperand);
  }

  /**
   * Comparison: "less or equal" (<=).
   *
   * @template T The target type
   * @param leftOperand The operand on the left side
   * @param rightOperand The operand on the right side of the comparison
   * @returns An expression representing the comparison
   */
  _exports.greaterThan = greaterThan;
  function lessOrEqual(leftOperand, rightOperand) {
    return comparison("<=", leftOperand, rightOperand);
  }

  /**
   * Comparison: "less than" (<).
   *
   * @template T The target type
   * @param leftOperand The operand on the left side
   * @param rightOperand The operand on the right side of the comparison
   * @returns An expression representing the comparison
   */
  _exports.lessOrEqual = lessOrEqual;
  function lessThan(leftOperand, rightOperand) {
    return comparison("<", leftOperand, rightOperand);
  }

  /**
   * If-then-else expression.
   *
   * Evaluates to onTrue if the condition evaluates to true, else evaluates to onFalse.
   *
   * @template T The target type
   * @param condition The condition to evaluate
   * @param onTrue Expression result if the condition evaluates to true
   * @param onFalse Expression result if the condition evaluates to false
   * @returns The expression that represents this conditional check
   */
  _exports.lessThan = lessThan;
  function ifElse(condition, onTrue, onFalse) {
    let conditionExpression = wrapPrimitive(condition);
    let onTrueExpression = wrapPrimitive(onTrue);
    let onFalseExpression = wrapPrimitive(onFalse);
    if (hasUnresolvableExpression(conditionExpression, onTrueExpression, onFalseExpression)) {
      return unresolvableExpression;
    }
    // swap branches if the condition is a negation
    if (conditionExpression._type === "Not") {
      // ifElse(not(X), a, b) --> ifElse(X, b, a)
      [onTrueExpression, onFalseExpression] = [onFalseExpression, onTrueExpression];
      conditionExpression = not(conditionExpression);
    }

    // inline nested if-else expressions: onTrue branch
    // ifElse(X, ifElse(X, a, b), c) ==> ifElse(X, a, c)
    if (onTrueExpression._type === "IfElse" && _checkExpressionsAreEqual(conditionExpression, onTrueExpression.condition)) {
      onTrueExpression = onTrueExpression.onTrue;
    }

    // inline nested if-else expressions: onFalse branch
    // ifElse(X, a, ifElse(X, b, c)) ==> ifElse(X, a, c)
    if (onFalseExpression._type === "IfElse" && _checkExpressionsAreEqual(conditionExpression, onFalseExpression.condition)) {
      onFalseExpression = onFalseExpression.onFalse;
    }

    // (if true then a else b)  ~~> a
    // (if false then a else b) ~~> b
    if (isConstant(conditionExpression)) {
      return conditionExpression.value ? onTrueExpression : onFalseExpression;
    }

    // if (isConstantBoolean(onTrueExpression) || isConstantBoolean(onFalseExpression)) {
    // 	return or(and(condition, onTrueExpression as Expression<boolean>), and(not(condition), onFalseExpression as Expression<boolean>)) as Expression<T>
    // }

    // (if X then a else a) ~~> a
    if (_checkExpressionsAreEqual(onTrueExpression, onFalseExpression)) {
      return onTrueExpression;
    }

    // if X then a else false ~~> X && a
    if (isFalse(onFalseExpression)) {
      return and(conditionExpression, onTrueExpression);
    }

    // if X then a else true ~~> !X || a
    if (isTrue(onFalseExpression)) {
      return or(not(conditionExpression), onTrueExpression);
    }

    // if X then false else a ~~> !X && a
    if (isFalse(onTrueExpression)) {
      return and(not(conditionExpression), onFalseExpression);
    }

    // if X then true else a ~~> X || a
    if (isTrue(onTrueExpression)) {
      return or(conditionExpression, onFalseExpression);
    }
    if (isComplexTypeExpression(condition) || isComplexTypeExpression(onTrue) || isComplexTypeExpression(onFalse)) {
      let pathIdx = 0;
      const myIfElseExpression = formatResult([condition, onTrue, onFalse], "sap.fe.core.formatters.StandardFormatter#ifElse");
      const allParts = [];
      transformRecursively(myIfElseExpression, "PathInModel", constantPath => {
        allParts.push(constantPath);
        return pathInModel(`$${pathIdx++}`, "$");
      }, true);
      allParts.unshift(constant(JSON.stringify(myIfElseExpression)));
      return formatResult(allParts, "sap.fe.core.formatters.StandardFormatter#evaluateComplexExpression", undefined, true);
    }
    return {
      _type: "IfElse",
      condition: conditionExpression,
      onTrue: onTrueExpression,
      onFalse: onFalseExpression
    };
  }

  /**
   * Checks whether the current expression has a reference to the default model (undefined).
   *
   * @param expression The expression to evaluate
   * @returns `true` if there is a reference to the default context
   */
  _exports.ifElse = ifElse;
  function hasReferenceToDefaultContext(expression) {
    switch (expression._type) {
      case "Constant":
      case "Formatter":
      case "ComplexType":
        return false;
      case "Set":
        return expression.operands.some(hasReferenceToDefaultContext);
      case "PathInModel":
        return expression.modelName === undefined;
      case "Comparison":
        return hasReferenceToDefaultContext(expression.operand1) || hasReferenceToDefaultContext(expression.operand2);
      case "IfElse":
        return hasReferenceToDefaultContext(expression.condition) || hasReferenceToDefaultContext(expression.onTrue) || hasReferenceToDefaultContext(expression.onFalse);
      case "Not":
      case "Truthy":
        return hasReferenceToDefaultContext(expression.operand);
      default:
        return false;
    }
  }
  /**
   * Calls a formatter function to process the parameters.
   * If requireContext is set to true and no context is passed a default context will be added automatically.
   *
   * @template T
   * @template U
   * @param parameters The list of parameter that should match the type and number of the formatter function
   * @param formatterFunction The function to call
   * @param [contextEntityType] If no parameter refers to the context then we use this information to add a reference to the keys from the entity type.
   * @param [ignoreComplexType] Whether to ignore the transgformation to the StandardFormatter or not
   * @returns The corresponding expression
   */
  function formatResult(parameters, formatterFunction, contextEntityType) {
    let ignoreComplexType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    const parameterExpressions = parameters.map(wrapPrimitive);
    if (hasUnresolvableExpression(...parameterExpressions)) {
      return unresolvableExpression;
    }
    if (contextEntityType) {
      // Otherwise, if the context is required and no context is provided make sure to add the default binding
      if (!parameterExpressions.some(hasReferenceToDefaultContext)) {
        contextEntityType.keys.forEach(key => parameterExpressions.push(pathInModel(key.name, "")));
      }
    }
    let functionName = "";
    if (typeof formatterFunction === "string") {
      functionName = formatterFunction;
    } else {
      functionName = formatterFunction.__functionName;
    }
    // FormatterName can be of format sap.fe.core.xxx#methodName to have multiple formatter in one class
    const [formatterClass, formatterName] = functionName.split("#");

    // In some case we also cannot call directly a function because of too complex input, in that case we need to convert to a simpler function call
    if (!ignoreComplexType && (parameterExpressions.some(isComplexTypeExpression) || parameterExpressions.some(isConcatExpression))) {
      let pathIdx = 0;
      const myFormatExpression = formatResult(parameterExpressions, functionName, undefined, true);
      const allParts = [];
      transformRecursively(myFormatExpression, "PathInModel", constantPath => {
        allParts.push(constantPath);
        return pathInModel(`$${pathIdx++}`, "$");
      });
      allParts.unshift(constant(JSON.stringify(myFormatExpression)));
      return formatResult(allParts, "sap.fe.core.formatters.StandardFormatter#evaluateComplexExpression", undefined, true);
    } else if (!!formatterName && formatterName.length > 0) {
      parameterExpressions.unshift(constant(formatterName));
    }
    return {
      _type: "Formatter",
      fn: formatterClass,
      parameters: parameterExpressions
    };
  }
  _exports.formatResult = formatResult;
  function setUpConstraints(targetMapping, property) {
    var _targetMapping$constr, _targetMapping$constr2, _targetMapping$constr3, _targetMapping$constr4, _property$annotations, _property$annotations2, _targetMapping$constr5, _property$annotations5, _property$annotations6, _property$annotations9, _property$annotations10, _targetMapping$constr6, _targetMapping$constr7;
    const constraints = {};
    if (targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr = targetMapping.constraints) !== null && _targetMapping$constr !== void 0 && _targetMapping$constr.$Scale && property.scale !== undefined) {
      constraints.scale = property.scale;
    }
    if (targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr2 = targetMapping.constraints) !== null && _targetMapping$constr2 !== void 0 && _targetMapping$constr2.$Precision && property.precision !== undefined) {
      constraints.precision = property.precision;
    }
    if (targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr3 = targetMapping.constraints) !== null && _targetMapping$constr3 !== void 0 && _targetMapping$constr3.$MaxLength && property.maxLength !== undefined) {
      constraints.maxLength = property.maxLength;
    }
    if (property.nullable === false) {
      constraints.nullable = false;
    }
    if (targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr4 = targetMapping.constraints) !== null && _targetMapping$constr4 !== void 0 && _targetMapping$constr4["@Org.OData.Validation.V1.Minimum/$Decimal"] && !isNaN((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Validation) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.Minimum)) {
      var _property$annotations3, _property$annotations4;
      constraints.minimum = `${(_property$annotations3 = property.annotations) === null || _property$annotations3 === void 0 ? void 0 : (_property$annotations4 = _property$annotations3.Validation) === null || _property$annotations4 === void 0 ? void 0 : _property$annotations4.Minimum}`;
    }
    if (targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr5 = targetMapping.constraints) !== null && _targetMapping$constr5 !== void 0 && _targetMapping$constr5["@Org.OData.Validation.V1.Maximum/$Decimal"] && !isNaN((_property$annotations5 = property.annotations) === null || _property$annotations5 === void 0 ? void 0 : (_property$annotations6 = _property$annotations5.Validation) === null || _property$annotations6 === void 0 ? void 0 : _property$annotations6.Maximum)) {
      var _property$annotations7, _property$annotations8;
      constraints.maximum = `${(_property$annotations7 = property.annotations) === null || _property$annotations7 === void 0 ? void 0 : (_property$annotations8 = _property$annotations7.Validation) === null || _property$annotations8 === void 0 ? void 0 : _property$annotations8.Maximum}`;
    }
    if ((_property$annotations9 = property.annotations) !== null && _property$annotations9 !== void 0 && (_property$annotations10 = _property$annotations9.Common) !== null && _property$annotations10 !== void 0 && _property$annotations10.IsDigitSequence && targetMapping.type === "sap.ui.model.odata.type.String" && targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr6 = targetMapping.constraints) !== null && _targetMapping$constr6 !== void 0 && _targetMapping$constr6["@com.sap.vocabularies.Common.v1.IsDigitSequence"]) {
      constraints.isDigitSequence = true;
    }
    if (targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr7 = targetMapping.constraints) !== null && _targetMapping$constr7 !== void 0 && _targetMapping$constr7.$V4) {
      constraints.V4 = true;
    }
    return constraints;
  }

  /**
   * Generates the binding expression for the property, and sets up the formatOptions and constraints.
   *
   * @param property The Property for which we are setting up the binding
   * @param propertyBindingExpression The BindingExpression of the property above. Serves as the basis to which information can be added
   * @param ignoreConstraints Ignore constraints of the property
   * @returns The binding expression for the property with formatOptions and constraints
   */
  _exports.setUpConstraints = setUpConstraints;
  function formatWithTypeInformation(property, propertyBindingExpression) {
    var _outExpression$type;
    let ignoreConstraints = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const outExpression = propertyBindingExpression;
    if (property._type !== "Property") {
      return outExpression;
    }
    const targetMapping = EDM_TYPE_MAPPING[property.type];
    if (!targetMapping) {
      return outExpression;
    }
    if (!outExpression.formatOptions) {
      outExpression.formatOptions = {};
    }
    outExpression.constraints = {};
    outExpression.type = targetMapping.type;
    if (!ignoreConstraints) {
      outExpression.constraints = setUpConstraints(targetMapping, property);
    }
    if ((outExpression === null || outExpression === void 0 ? void 0 : (_outExpression$type = outExpression.type) === null || _outExpression$type === void 0 ? void 0 : _outExpression$type.indexOf("sap.ui.model.odata.type.Int")) === 0 && (outExpression === null || outExpression === void 0 ? void 0 : outExpression.type) !== "sap.ui.model.odata.type.Int64" || (outExpression === null || outExpression === void 0 ? void 0 : outExpression.type) === "sap.ui.model.odata.type.Double") {
      outExpression.formatOptions = Object.assign(outExpression.formatOptions, {
        parseAsString: false
      });
    }
    if (outExpression.type === "sap.ui.model.odata.type.String") {
      outExpression.formatOptions.parseKeepsEmptyString = true;
      const fiscalType = getFiscalType(property);
      if (fiscalType) {
        outExpression.formatOptions.fiscalType = fiscalType;
        outExpression.type = "sap.fe.core.type.FiscalDate";
      }
    }
    if (outExpression.type === "sap.ui.model.odata.type.Decimal" || (outExpression === null || outExpression === void 0 ? void 0 : outExpression.type) === "sap.ui.model.odata.type.Int64") {
      outExpression.formatOptions = Object.assign(outExpression.formatOptions, {
        emptyString: ""
      });
    }
    return outExpression;
  }
  _exports.formatWithTypeInformation = formatWithTypeInformation;
  const getFiscalType = function (property) {
    var _property$annotations11, _property$annotations12, _property$annotations13, _property$annotations14, _property$annotations15, _property$annotations16, _property$annotations17, _property$annotations18, _property$annotations19, _property$annotations20, _property$annotations21, _property$annotations22, _property$annotations23, _property$annotations24, _property$annotations25, _property$annotations26;
    if ((_property$annotations11 = property.annotations) !== null && _property$annotations11 !== void 0 && (_property$annotations12 = _property$annotations11.Common) !== null && _property$annotations12 !== void 0 && _property$annotations12.IsFiscalYear) {
      return "com.sap.vocabularies.Common.v1.IsFiscalYear";
    }
    if ((_property$annotations13 = property.annotations) !== null && _property$annotations13 !== void 0 && (_property$annotations14 = _property$annotations13.Common) !== null && _property$annotations14 !== void 0 && _property$annotations14.IsFiscalPeriod) {
      return "com.sap.vocabularies.Common.v1.IsFiscalPeriod";
    }
    if ((_property$annotations15 = property.annotations) !== null && _property$annotations15 !== void 0 && (_property$annotations16 = _property$annotations15.Common) !== null && _property$annotations16 !== void 0 && _property$annotations16.IsFiscalYearPeriod) {
      return "com.sap.vocabularies.Common.v1.IsFiscalYearPeriod";
    }
    if ((_property$annotations17 = property.annotations) !== null && _property$annotations17 !== void 0 && (_property$annotations18 = _property$annotations17.Common) !== null && _property$annotations18 !== void 0 && _property$annotations18.IsFiscalQuarter) {
      return "com.sap.vocabularies.Common.v1.IsFiscalQuarter";
    }
    if ((_property$annotations19 = property.annotations) !== null && _property$annotations19 !== void 0 && (_property$annotations20 = _property$annotations19.Common) !== null && _property$annotations20 !== void 0 && _property$annotations20.IsFiscalYearQuarter) {
      return "com.sap.vocabularies.Common.v1.IsFiscalYearQuarter";
    }
    if ((_property$annotations21 = property.annotations) !== null && _property$annotations21 !== void 0 && (_property$annotations22 = _property$annotations21.Common) !== null && _property$annotations22 !== void 0 && _property$annotations22.IsFiscalWeek) {
      return "com.sap.vocabularies.Common.v1.IsFiscalWeek";
    }
    if ((_property$annotations23 = property.annotations) !== null && _property$annotations23 !== void 0 && (_property$annotations24 = _property$annotations23.Common) !== null && _property$annotations24 !== void 0 && _property$annotations24.IsFiscalYearWeek) {
      return "com.sap.vocabularies.Common.v1.IsFiscalYearWeek";
    }
    if ((_property$annotations25 = property.annotations) !== null && _property$annotations25 !== void 0 && (_property$annotations26 = _property$annotations25.Common) !== null && _property$annotations26 !== void 0 && _property$annotations26.IsDayOfFiscalYear) {
      return "com.sap.vocabularies.Common.v1.IsDayOfFiscalYear";
    }
  };

  /**
   * Calls a complex type to process the parameters.
   * If requireContext is set to true and no context is passed, a default context will be added automatically.
   *
   * @template T
   * @template U
   * @param parameters The list of parameters that should match the type for the complex type=
   * @param type The complex type to use
   * @param [contextEntityType] The context entity type to consider
   * @param oFormatOptions
   * @returns The corresponding expression
   */
  _exports.getFiscalType = getFiscalType;
  function addTypeInformation(parameters, type, contextEntityType, oFormatOptions) {
    const parameterExpressions = parameters.map(wrapPrimitive);
    if (hasUnresolvableExpression(...parameterExpressions)) {
      return unresolvableExpression;
    }
    // If there is only one parameter and it is a constant and we don't expect the context then return the constant
    if (parameterExpressions.length === 1 && isConstant(parameterExpressions[0]) && !contextEntityType) {
      return parameterExpressions[0];
    } else if (contextEntityType) {
      // Otherwise, if the context is required and no context is provided make sure to add the default binding
      if (!parameterExpressions.some(hasReferenceToDefaultContext)) {
        contextEntityType.keys.forEach(key => parameterExpressions.push(pathInModel(key.name, "")));
      }
    }
    oFormatOptions = _getComplexTypeFormatOptionsFromFirstParam(parameters[0], oFormatOptions);
    if (type === "sap.ui.model.odata.type.Unit") {
      const uomPath = pathInModel("/##@@requestUnitsOfMeasure");
      uomPath.targetType = "any";
      uomPath.mode = "OneTime";
      parameterExpressions.push(uomPath);
    } else if (type === "sap.ui.model.odata.type.Currency") {
      const currencyPath = pathInModel("/##@@requestCurrencyCodes");
      currencyPath.targetType = "any";
      currencyPath.mode = "OneTime";
      parameterExpressions.push(currencyPath);
    }
    return {
      _type: "ComplexType",
      type: type,
      formatOptions: oFormatOptions || {},
      parameters: {},
      bindingParameters: parameterExpressions
    };
  }

  /**
   * Process the formatOptions for a complexType based on the first parameter.
   *
   * @param param The first parameter of the complex type
   * @param formatOptions Initial formatOptions
   * @returns The modified formatOptions
   */
  _exports.addTypeInformation = addTypeInformation;
  function _getComplexTypeFormatOptionsFromFirstParam(param, formatOptions) {
    var _param$type, _param$constraints;
    // if showMeasure is set to false we want to not parse as string to see the 0
    // we do that also for all bindings because otherwise the mdc Field isn't editable
    if (!(formatOptions && formatOptions.showNumber === false) && ((param === null || param === void 0 ? void 0 : (_param$type = param.type) === null || _param$type === void 0 ? void 0 : _param$type.indexOf("sap.ui.model.odata.type.Int")) === 0 || (param === null || param === void 0 ? void 0 : param.type) === "sap.ui.model.odata.type.Decimal" || (param === null || param === void 0 ? void 0 : param.type) === "sap.ui.model.odata.type.Double")) {
      if ((param === null || param === void 0 ? void 0 : param.type) === "sap.ui.model.odata.type.Int64" || (param === null || param === void 0 ? void 0 : param.type) === "sap.ui.model.odata.type.Decimal") {
        var _formatOptions;
        //sap.ui.model.odata.type.Int64 do not support parseAsString false
        formatOptions = ((_formatOptions = formatOptions) === null || _formatOptions === void 0 ? void 0 : _formatOptions.showMeasure) === false ? {
          emptyString: "",
          showMeasure: false
        } : {
          emptyString: ""
        };
      } else {
        var _formatOptions2;
        formatOptions = ((_formatOptions2 = formatOptions) === null || _formatOptions2 === void 0 ? void 0 : _formatOptions2.showMeasure) === false ? {
          parseAsString: false,
          showMeasure: false
        } : {
          parseAsString: false
        };
      }
    }
    if ((param === null || param === void 0 ? void 0 : (_param$constraints = param.constraints) === null || _param$constraints === void 0 ? void 0 : _param$constraints.nullable) !== false) {
      var _formatOptions3;
      (_formatOptions3 = formatOptions) === null || _formatOptions3 === void 0 ? true : delete _formatOptions3.emptyString;
    }
    return formatOptions;
  }
  /**
   * Function call, optionally with arguments.
   *
   * @param func Function name or reference to function
   * @param parameters Arguments
   * @param on Object to call the function on
   * @returns Expression representing the function call (not the result of the function call!)
   */
  function fn(func, parameters, on) {
    const functionName = typeof func === "string" ? func : func.__functionName;
    return {
      _type: "Function",
      obj: on !== undefined ? wrapPrimitive(on) : undefined,
      fn: functionName,
      parameters: parameters.map(wrapPrimitive)
    };
  }

  /**
   * Shortcut function to determine if a binding value is null, undefined or empty.
   *
   * @param expression
   * @returns A Boolean expression evaluating the fact that the current element is empty
   */
  _exports.fn = fn;
  function isEmpty(expression) {
    const aBindings = [];
    transformRecursively(expression, "PathInModel", expr => {
      aBindings.push(or(equal(expr, ""), equal(expr, undefined), equal(expr, null)));
      return expr;
    });
    return and(...aBindings);
  }
  _exports.isEmpty = isEmpty;
  function concat() {
    for (var _len4 = arguments.length, inExpressions = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      inExpressions[_key4] = arguments[_key4];
    }
    const expressions = inExpressions.map(wrapPrimitive);
    if (hasUnresolvableExpression(...expressions)) {
      return unresolvableExpression;
    }
    if (expressions.every(isConstant)) {
      return constant(expressions.reduce((concatenated, value) => {
        if (value.value !== undefined) {
          return concatenated + value.value.toString();
        }
        return concatenated;
      }, ""));
    } else if (expressions.some(isComplexTypeExpression)) {
      let pathIdx = 0;
      const myConcatExpression = formatResult(expressions, "sap.fe.core.formatters.StandardFormatter#concat", undefined, true);
      const allParts = [];
      transformRecursively(myConcatExpression, "PathInModel", constantPath => {
        allParts.push(constantPath);
        return pathInModel(`$${pathIdx++}`, "$");
      });
      allParts.unshift(constant(JSON.stringify(myConcatExpression)));
      return formatResult(allParts, "sap.fe.core.formatters.StandardFormatter#evaluateComplexExpression", undefined, true);
    }
    return {
      _type: "Concat",
      expressions: expressions
    };
  }
  _exports.concat = concat;
  function transformRecursively(inExpression, expressionType, transformFunction) {
    let includeAllExpression = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let expression = inExpression;
    switch (expression._type) {
      case "Function":
      case "Formatter":
        expression.parameters = expression.parameters.map(parameter => transformRecursively(parameter, expressionType, transformFunction, includeAllExpression));
        break;
      case "Concat":
        expression.expressions = expression.expressions.map(subExpression => transformRecursively(subExpression, expressionType, transformFunction, includeAllExpression));
        expression = concat(...expression.expressions);
        break;
      case "ComplexType":
        expression.bindingParameters = expression.bindingParameters.map(bindingParameter => transformRecursively(bindingParameter, expressionType, transformFunction, includeAllExpression));
        break;
      case "IfElse":
        const onTrue = transformRecursively(expression.onTrue, expressionType, transformFunction, includeAllExpression);
        const onFalse = transformRecursively(expression.onFalse, expressionType, transformFunction, includeAllExpression);
        let condition = expression.condition;
        if (includeAllExpression) {
          condition = transformRecursively(expression.condition, expressionType, transformFunction, includeAllExpression);
        }
        expression = ifElse(condition, onTrue, onFalse);
        break;
      case "Not":
        if (includeAllExpression) {
          const operand = transformRecursively(expression.operand, expressionType, transformFunction, includeAllExpression);
          expression = not(operand);
        }
        break;
      case "Truthy":
        break;
      case "Set":
        if (includeAllExpression) {
          const operands = expression.operands.map(operand => transformRecursively(operand, expressionType, transformFunction, includeAllExpression));
          expression = expression.operator === "||" ? or(...operands) : and(...operands);
        }
        break;
      case "Comparison":
        if (includeAllExpression) {
          const operand1 = transformRecursively(expression.operand1, expressionType, transformFunction, includeAllExpression);
          const operand2 = transformRecursively(expression.operand2, expressionType, transformFunction, includeAllExpression);
          expression = comparison(expression.operator, operand1, operand2);
        }
        break;
      case "Ref":
      case "Length":
      case "PathInModel":
      case "Constant":
      case "EmbeddedBinding":
      case "EmbeddedExpressionBinding":
      case "Unresolvable":
        // Do nothing
        break;
    }
    if (expressionType === expression._type) {
      expression = transformFunction(inExpression);
    }
    return expression;
  }
  _exports.transformRecursively = transformRecursively;
  const needParenthesis = function (expr) {
    return !isConstant(expr) && !isPathInModelExpression(expr) && isBindingToolkitExpression(expr) && expr._type !== "IfElse" && expr._type !== "Function";
  };

  /**
   * Compiles a constant object to a string.
   *
   * @param expr
   * @param isNullable
   * @returns The compiled string
   */
  function compileConstantObject(expr) {
    let isNullable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (isNullable && Object.keys(expr.value).length === 0) {
      return "";
    }
    const objects = expr.value;
    const properties = [];
    Object.keys(objects).forEach(key => {
      const value = objects[key];
      const childResult = compileExpression(value, true, false, isNullable);
      if (childResult && childResult.length > 0) {
        properties.push(`${key}: ${childResult}`);
      }
    });
    return `{${properties.join(", ")}}`;
  }

  /**
   * Compiles a Constant Binding Expression.
   *
   * @param expr
   * @param embeddedInBinding
   * @param isNullable
   * @param doNotStringify
   * @returns The compiled string
   */

  function compileConstant(expr, embeddedInBinding) {
    let isNullable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let doNotStringify = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    if (expr.value === null) {
      return doNotStringify ? null : "null";
    }
    if (expr.value === undefined) {
      return doNotStringify ? undefined : "undefined";
    }
    if (typeof expr.value === "object") {
      if (Array.isArray(expr.value)) {
        const entries = expr.value.map(expression => compileExpression(expression, true));
        return `[${entries.join(", ")}]`;
      } else {
        return compileConstantObject(expr, isNullable);
      }
    }
    if (embeddedInBinding) {
      switch (typeof expr.value) {
        case "number":
        case "bigint":
        case "boolean":
          return expr.value.toString();
        case "string":
          return `'${escapeXmlAttribute(expr.value.toString())}'`;
        default:
          return "";
      }
    } else {
      return doNotStringify ? expr.value : expr.value.toString();
    }
  }

  /**
   * Generates the binding string for a Binding expression.
   *
   * @param expressionForBinding The expression to compile
   * @param embeddedInBinding Whether the expression to compile is embedded into another expression
   * @param embeddedSeparator The binding value evaluator ($ or % depending on whether we want to force the type or not)
   * @returns The corresponding expression binding
   */
  _exports.compileConstant = compileConstant;
  function compilePathInModelExpression(expressionForBinding, embeddedInBinding, embeddedSeparator) {
    if (expressionForBinding.type || expressionForBinding.parameters || expressionForBinding.targetType || expressionForBinding.formatOptions || expressionForBinding.constraints) {
      // This is now a complex binding definition, let's prepare for it
      const complexBindingDefinition = {
        path: compilePathInModel(expressionForBinding),
        type: expressionForBinding.type,
        targetType: expressionForBinding.targetType,
        parameters: expressionForBinding.parameters,
        formatOptions: expressionForBinding.formatOptions,
        constraints: expressionForBinding.constraints
      };
      const outBinding = compileExpression(complexBindingDefinition, false, false, true);
      if (embeddedInBinding) {
        return `${embeddedSeparator}${outBinding}`;
      }
      return outBinding;
    } else if (embeddedInBinding) {
      return `${embeddedSeparator}{${compilePathInModel(expressionForBinding)}}`;
    } else {
      return `{${compilePathInModel(expressionForBinding)}}`;
    }
  }
  function compileComplexTypeExpression(expression) {
    if (expression.bindingParameters.length === 1) {
      return `{${compilePathParameter(expression.bindingParameters[0], true)}, type: '${expression.type}'}`;
    }
    let outputEnd = `], type: '${expression.type}'`;
    if (hasElements(expression.formatOptions)) {
      outputEnd += `, formatOptions: ${compileExpression(expression.formatOptions)}`;
    }
    if (hasElements(expression.parameters)) {
      outputEnd += `, parameters: ${compileExpression(expression.parameters)}`;
    }
    outputEnd += "}";
    return `{mode:'TwoWay', parts:[${expression.bindingParameters.map(param => compilePathParameter(param)).join(",")}${outputEnd}`;
  }

  /**
   * Wrap the compiled binding string as required depending on its context.
   *
   * @param expression The compiled expression
   * @param embeddedInBinding True if the compiled expression is to be embedded in a binding
   * @param parenthesisRequired True if the embedded binding needs to be wrapped in parethesis so that it is evaluated as one
   * @returns Finalized compiled expression
   */
  function wrapBindingExpression(expression, embeddedInBinding) {
    let parenthesisRequired = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (embeddedInBinding) {
      if (parenthesisRequired) {
        return `(${expression})`;
      } else {
        return expression;
      }
    } else {
      return `{= ${expression}}`;
    }
  }

  /**
   * Compile an expression into an expression binding.
   *
   * @template T The target type
   * @param expression The expression to compile
   * @param embeddedInBinding Whether the expression to compile is embedded into another expression
   * @param keepTargetType Keep the target type of the embedded bindings instead of casting them to any
   * @param isNullable Whether binding expression can resolve to empty string or not
   * @returns The corresponding expression binding
   */
  _exports.wrapBindingExpression = wrapBindingExpression;
  function compileExpression(expression) {
    let embeddedInBinding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let keepTargetType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let isNullable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    const expr = wrapPrimitive(expression);
    const embeddedSeparator = keepTargetType ? "$" : "%";
    switch (expr._type) {
      case "Unresolvable":
        return undefined;
      case "Constant":
        return compileConstant(expr, embeddedInBinding, isNullable);
      case "Ref":
        return expr.ref || "null";
      case "Function":
        const argumentString = `${expr.parameters.map(arg => compileExpression(arg, true)).join(", ")}`;
        return expr.obj === undefined ? `${expr.fn}(${argumentString})` : `${compileExpression(expr.obj, true)}.${expr.fn}(${argumentString})`;
      case "EmbeddedExpressionBinding":
        return embeddedInBinding ? `(${expr.value.substring(2, expr.value.length - 1)})` : `${expr.value}`;
      case "EmbeddedBinding":
        return embeddedInBinding ? `${embeddedSeparator}${expr.value}` : `${expr.value}`;
      case "PathInModel":
        return compilePathInModelExpression(expr, embeddedInBinding, embeddedSeparator);
      case "Comparison":
        const comparisonExpression = compileComparisonExpression(expr);
        return wrapBindingExpression(comparisonExpression, embeddedInBinding);
      case "IfElse":
        const ifElseExpression = `${compileExpression(expr.condition, true)} ? ${compileExpression(expr.onTrue, true)} : ${compileExpression(expr.onFalse, true)}`;
        return wrapBindingExpression(ifElseExpression, embeddedInBinding, true);
      case "Set":
        const setExpression = expr.operands.map(operand => compileExpression(operand, true)).join(` ${expr.operator} `);
        return wrapBindingExpression(setExpression, embeddedInBinding, true);
      case "Concat":
        const concatExpression = expr.expressions.map(nestedExpression => compileExpression(nestedExpression, true, true)).join(" + ");
        return wrapBindingExpression(concatExpression, embeddedInBinding);
      case "Length":
        const lengthExpression = `${compileExpression(expr.pathInModel, true)}.length`;
        return wrapBindingExpression(lengthExpression, embeddedInBinding);
      case "Not":
        const notExpression = `!${compileExpression(expr.operand, true)}`;
        return wrapBindingExpression(notExpression, embeddedInBinding);
      case "Truthy":
        const truthyExpression = `!!${compileExpression(expr.operand, true)}`;
        return wrapBindingExpression(truthyExpression, embeddedInBinding);
      case "Formatter":
        const formatterExpression = compileFormatterExpression(expr);
        return embeddedInBinding ? `$${formatterExpression}` : formatterExpression;
      case "ComplexType":
        const complexTypeExpression = compileComplexTypeExpression(expr);
        return embeddedInBinding ? `$${complexTypeExpression}` : complexTypeExpression;
      default:
        return "";
    }
  }

  /**
   * Compile a comparison expression.
   *
   * @param expression The comparison expression.
   * @returns The compiled expression. Needs wrapping before it can be used as an expression binding.
   */
  _exports.compileExpression = compileExpression;
  function compileComparisonExpression(expression) {
    function compileOperand(operand) {
      const compiledOperand = compileExpression(operand, true) ?? "undefined";
      return wrapBindingExpression(compiledOperand, true, needParenthesis(operand));
    }
    return `${compileOperand(expression.operand1)} ${expression.operator} ${compileOperand(expression.operand2)}`;
  }

  /**
   * Compile a formatter expression.
   *
   * @param expression The formatter expression.
   * @returns The compiled expression.
   */
  function compileFormatterExpression(expression) {
    if (expression.parameters.length === 1) {
      return `{${compilePathParameter(expression.parameters[0], true)}, formatter: '${expression.fn}'}`;
    } else {
      const parts = expression.parameters.map(param => {
        if (param._type === "ComplexType") {
          return compileComplexTypeExpression(param);
        } else {
          return compilePathParameter(param);
        }
      });
      return `{parts: [${parts.join(", ")}], formatter: '${expression.fn}'}`;
    }
  }

  /**
   * Compile the path parameter of a formatter call.
   *
   * @param expression The binding part to evaluate
   * @param singlePath Whether there is one or multiple path to consider
   * @returns The string snippet to include in the overall binding definition
   */
  function compilePathParameter(expression) {
    let singlePath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let outValue = "";
    if (expression._type === "Constant") {
      if (expression.value === undefined) {
        // Special case otherwise the JSTokenizer complains about incorrect content
        outValue = `value: 'undefined'`;
      } else {
        outValue = `value: ${compileConstant(expression, true)}`;
      }
    } else if (expression._type === "PathInModel") {
      outValue = `path: '${compilePathInModel(expression)}'`;
      outValue += expression.type ? `, type: '${expression.type}'` : `, targetType: 'any'`;
      if (hasElements(expression.mode)) {
        outValue += `, mode: '${compileExpression(expression.mode)}'`;
      }
      if (hasElements(expression.constraints)) {
        outValue += `, constraints: ${compileExpression(expression.constraints)}`;
      }
      if (hasElements(expression.formatOptions)) {
        outValue += `, formatOptions: ${compileExpression(expression.formatOptions)}`;
      }
      if (hasElements(expression.parameters)) {
        outValue += `, parameters: ${compileExpression(expression.parameters)}`;
      }
    } else {
      return "";
    }
    return singlePath ? outValue : `{${outValue}}`;
  }
  function hasElements(obj) {
    return obj && Object.keys(obj).length > 0;
  }

  /**
   * Compile a binding expression path.
   *
   * @param expression The expression to compile.
   * @returns The compiled path.
   */
  function compilePathInModel(expression) {
    return `${expression.modelName ? `${expression.modelName}>` : ""}${expression.path}`;
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFRE1fVFlQRV9NQVBQSU5HIiwidHlwZSIsImNvbnN0cmFpbnRzIiwiJFByZWNpc2lvbiIsIiRWNCIsIiRTY2FsZSIsIiRNYXhMZW5ndGgiLCIkTnVsbGFibGUiLCJ1bnJlc29sdmFibGVFeHByZXNzaW9uIiwiX3R5cGUiLCJlc2NhcGVYbWxBdHRyaWJ1dGUiLCJpbnB1dFN0cmluZyIsInJlcGxhY2UiLCJoYXNVbnJlc29sdmFibGVFeHByZXNzaW9uIiwiZXhwcmVzc2lvbnMiLCJmaW5kIiwiZXhwciIsInVuZGVmaW5lZCIsIl9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwiLCJhIiwiYiIsInZhbHVlIiwib3BlcmFuZCIsIm9wZXJhdG9yIiwib3BlcmFuZHMiLCJsZW5ndGgiLCJldmVyeSIsImV4cHJlc3Npb24iLCJzb21lIiwib3RoZXJFeHByZXNzaW9uIiwiY29uZGl0aW9uIiwib25UcnVlIiwib25GYWxzZSIsIm9wZXJhbmQxIiwib3BlcmFuZDIiLCJhRXhwcmVzc2lvbnMiLCJiRXhwcmVzc2lvbnMiLCJpbmRleCIsInBhdGhJbk1vZGVsIiwibW9kZWxOYW1lIiwicGF0aCIsInRhcmdldEVudGl0eVNldCIsImZuIiwicGFyYW1ldGVycyIsImJpbmRpbmdQYXJhbWV0ZXJzIiwib3RoZXJGdW5jdGlvbiIsIm9iaiIsInJlZiIsImZsYXR0ZW5TZXRFeHByZXNzaW9uIiwicmVkdWNlIiwicmVzdWx0IiwiY2FuZGlkYXRlc0ZvckZsYXR0ZW5pbmciLCJmb3JFYWNoIiwiY2FuZGlkYXRlIiwiZSIsInB1c2giLCJoYXNPcHBvc2l0ZUV4cHJlc3Npb25zIiwibmVnYXRlZEV4cHJlc3Npb25zIiwibWFwIiwibm90IiwiaSIsImFuZCIsIndyYXBQcmltaXRpdmUiLCJpc1N0YXRpY0ZhbHNlIiwibm9uVHJpdmlhbEV4cHJlc3Npb24iLCJmaWx0ZXIiLCJpc0ZhbHNlIiwiaXNDb25zdGFudCIsImNvbnN0YW50IiwiaXNWYWxpZCIsImlzVHJ1ZSIsIm9yIiwiaXNTdGF0aWNUcnVlIiwiaXNDb21wYXJpc29uIiwiaXNUcnV0aHkiLCJiaW5kaW5nRXhwcmVzc2lvbiIsInZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMiLCJwYXRoVmlzaXRvciIsInRhcmdldFBhdGgiLCJsb2NhbFBhdGgiLCJjb25jYXQiLCJqb2luIiwiY29uc3RhbnRWYWx1ZSIsIkFycmF5IiwiaXNBcnJheSIsImlzUHJpbWl0aXZlT2JqZWN0IiwidmFsdWVPZiIsIk9iamVjdCIsImVudHJpZXMiLCJwbGFpbkV4cHJlc3Npb24iLCJrZXkiLCJ2YWwiLCJ3cmFwcGVkVmFsdWUiLCJyZXNvbHZlQmluZGluZ1N0cmluZyIsInRhcmdldFR5cGUiLCJzdGFydHNXaXRoIiwicGF0aEluTW9kZWxSZWdleCIsInBhdGhJbk1vZGVsUmVnZXhNYXRjaCIsImV4ZWMiLCJpc05hTiIsIk51bWJlciIsInJlZmVyZW5jZSIsInNvbWV0aGluZyIsImlzQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIiwibWF5YmVDb25zdGFudCIsImlzUGF0aEluTW9kZWxFeHByZXNzaW9uIiwibWF5YmVCaW5kaW5nIiwiaXNDb21wbGV4VHlwZUV4cHJlc3Npb24iLCJpc0NvbmNhdEV4cHJlc3Npb24iLCJpc1VuZGVmaW5lZEV4cHJlc3Npb24iLCJleHByZXNzaW9uQXNFeHByZXNzaW9uIiwib2JqZWN0VHlwZSIsImNvbnN0cnVjdG9yIiwibmFtZSIsImlzQ29tcGxleEFubm90YXRpb25FeHByZXNzaW9uIiwiYW5ub3RhdGlvblZhbHVlIiwiYW5ub3RhdGlvbkV4cHJlc3Npb24iLCJkZWZhdWx0VmFsdWUiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJhbm5vdGF0aW9uSWZFeHByZXNzaW9uIiwiSWYiLCJwYXJzZUFubm90YXRpb25Db25kaXRpb24iLCJOb3QiLCJlcXVhbCIsIkVxIiwibm90RXF1YWwiLCJOZSIsImdyZWF0ZXJUaGFuIiwiR3QiLCJncmVhdGVyT3JFcXVhbCIsIkdlIiwibGVzc1RoYW4iLCJMdCIsImxlc3NPckVxdWFsIiwiTGUiLCJPciIsIm9yQ29uZGl0aW9uIiwiQW5kIiwiYW5kQ29uZGl0aW9uIiwiYW5ub3RhdGlvbkFwcGx5RXhwcmVzc2lvbiIsImhhc093blByb3BlcnR5IiwiJE9yIiwiJEFuZCIsIiROb3QiLCIkRXEiLCIkTmUiLCIkR3QiLCIkR2UiLCIkTHQiLCIkTGUiLCIkUGF0aCIsIkZ1bmN0aW9uIiwiJEZ1bmN0aW9uIiwiQXBwbHkiLCIkQXBwbHkiLCIkSWYiLCJyZXNvbHZlRW51bVZhbHVlIiwiJEVudW1NZW1iZXIiLCJpZkVsc2UiLCJhcHBseUV4cHJlc3Npb24iLCJhcHBseVBhcmFtIiwiYXBwbHlQYXJhbUNvbnZlcnRlZCIsImNvbXBhcmlzb24iLCJsZWZ0T3BlcmFuZCIsInJpZ2h0T3BlcmFuZCIsImxlZnRFeHByZXNzaW9uIiwicmlnaHRFeHByZXNzaW9uIiwibGVmdCIsInJpZ2h0IiwicmVkdWNlZCIsImNvbmRpdGlvbkV4cHJlc3Npb24iLCJvblRydWVFeHByZXNzaW9uIiwib25GYWxzZUV4cHJlc3Npb24iLCJwYXRoSWR4IiwibXlJZkVsc2VFeHByZXNzaW9uIiwiZm9ybWF0UmVzdWx0IiwiYWxsUGFydHMiLCJ0cmFuc2Zvcm1SZWN1cnNpdmVseSIsImNvbnN0YW50UGF0aCIsInVuc2hpZnQiLCJKU09OIiwic3RyaW5naWZ5IiwiaGFzUmVmZXJlbmNlVG9EZWZhdWx0Q29udGV4dCIsImZvcm1hdHRlckZ1bmN0aW9uIiwiY29udGV4dEVudGl0eVR5cGUiLCJpZ25vcmVDb21wbGV4VHlwZSIsInBhcmFtZXRlckV4cHJlc3Npb25zIiwia2V5cyIsImZ1bmN0aW9uTmFtZSIsIl9fZnVuY3Rpb25OYW1lIiwiZm9ybWF0dGVyQ2xhc3MiLCJmb3JtYXR0ZXJOYW1lIiwic3BsaXQiLCJteUZvcm1hdEV4cHJlc3Npb24iLCJzZXRVcENvbnN0cmFpbnRzIiwidGFyZ2V0TWFwcGluZyIsInByb3BlcnR5Iiwic2NhbGUiLCJwcmVjaXNpb24iLCJtYXhMZW5ndGgiLCJudWxsYWJsZSIsImFubm90YXRpb25zIiwiVmFsaWRhdGlvbiIsIk1pbmltdW0iLCJtaW5pbXVtIiwiTWF4aW11bSIsIm1heGltdW0iLCJDb21tb24iLCJJc0RpZ2l0U2VxdWVuY2UiLCJpc0RpZ2l0U2VxdWVuY2UiLCJWNCIsImZvcm1hdFdpdGhUeXBlSW5mb3JtYXRpb24iLCJwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uIiwiaWdub3JlQ29uc3RyYWludHMiLCJvdXRFeHByZXNzaW9uIiwiZm9ybWF0T3B0aW9ucyIsImluZGV4T2YiLCJhc3NpZ24iLCJwYXJzZUFzU3RyaW5nIiwicGFyc2VLZWVwc0VtcHR5U3RyaW5nIiwiZmlzY2FsVHlwZSIsImdldEZpc2NhbFR5cGUiLCJlbXB0eVN0cmluZyIsIklzRmlzY2FsWWVhciIsIklzRmlzY2FsUGVyaW9kIiwiSXNGaXNjYWxZZWFyUGVyaW9kIiwiSXNGaXNjYWxRdWFydGVyIiwiSXNGaXNjYWxZZWFyUXVhcnRlciIsIklzRmlzY2FsV2VlayIsIklzRmlzY2FsWWVhcldlZWsiLCJJc0RheU9mRmlzY2FsWWVhciIsImFkZFR5cGVJbmZvcm1hdGlvbiIsIm9Gb3JtYXRPcHRpb25zIiwiX2dldENvbXBsZXhUeXBlRm9ybWF0T3B0aW9uc0Zyb21GaXJzdFBhcmFtIiwidW9tUGF0aCIsIm1vZGUiLCJjdXJyZW5jeVBhdGgiLCJwYXJhbSIsInNob3dOdW1iZXIiLCJzaG93TWVhc3VyZSIsImZ1bmMiLCJvbiIsImlzRW1wdHkiLCJhQmluZGluZ3MiLCJpbkV4cHJlc3Npb25zIiwiY29uY2F0ZW5hdGVkIiwidG9TdHJpbmciLCJteUNvbmNhdEV4cHJlc3Npb24iLCJpbkV4cHJlc3Npb24iLCJleHByZXNzaW9uVHlwZSIsInRyYW5zZm9ybUZ1bmN0aW9uIiwiaW5jbHVkZUFsbEV4cHJlc3Npb24iLCJwYXJhbWV0ZXIiLCJzdWJFeHByZXNzaW9uIiwiYmluZGluZ1BhcmFtZXRlciIsIm5lZWRQYXJlbnRoZXNpcyIsImNvbXBpbGVDb25zdGFudE9iamVjdCIsImlzTnVsbGFibGUiLCJvYmplY3RzIiwicHJvcGVydGllcyIsImNoaWxkUmVzdWx0IiwiY29tcGlsZUV4cHJlc3Npb24iLCJjb21waWxlQ29uc3RhbnQiLCJlbWJlZGRlZEluQmluZGluZyIsImRvTm90U3RyaW5naWZ5IiwiY29tcGlsZVBhdGhJbk1vZGVsRXhwcmVzc2lvbiIsImV4cHJlc3Npb25Gb3JCaW5kaW5nIiwiZW1iZWRkZWRTZXBhcmF0b3IiLCJjb21wbGV4QmluZGluZ0RlZmluaXRpb24iLCJjb21waWxlUGF0aEluTW9kZWwiLCJvdXRCaW5kaW5nIiwiY29tcGlsZUNvbXBsZXhUeXBlRXhwcmVzc2lvbiIsImNvbXBpbGVQYXRoUGFyYW1ldGVyIiwib3V0cHV0RW5kIiwiaGFzRWxlbWVudHMiLCJ3cmFwQmluZGluZ0V4cHJlc3Npb24iLCJwYXJlbnRoZXNpc1JlcXVpcmVkIiwia2VlcFRhcmdldFR5cGUiLCJhcmd1bWVudFN0cmluZyIsImFyZyIsInN1YnN0cmluZyIsImNvbXBhcmlzb25FeHByZXNzaW9uIiwiY29tcGlsZUNvbXBhcmlzb25FeHByZXNzaW9uIiwiaWZFbHNlRXhwcmVzc2lvbiIsInNldEV4cHJlc3Npb24iLCJjb25jYXRFeHByZXNzaW9uIiwibmVzdGVkRXhwcmVzc2lvbiIsImxlbmd0aEV4cHJlc3Npb24iLCJub3RFeHByZXNzaW9uIiwidHJ1dGh5RXhwcmVzc2lvbiIsImZvcm1hdHRlckV4cHJlc3Npb24iLCJjb21waWxlRm9ybWF0dGVyRXhwcmVzc2lvbiIsImNvbXBsZXhUeXBlRXhwcmVzc2lvbiIsImNvbXBpbGVPcGVyYW5kIiwiY29tcGlsZWRPcGVyYW5kIiwicGFydHMiLCJzaW5nbGVQYXRoIiwib3V0VmFsdWUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkJpbmRpbmdUb29sa2l0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHtcblx0QW5kQW5ub3RhdGlvbkV4cHJlc3Npb24sXG5cdEFuZENvbmRpdGlvbmFsRXhwcmVzc2lvbixcblx0QXBwbHlBbm5vdGF0aW9uRXhwcmVzc2lvbixcblx0Q29uZGl0aW9uYWxDaGVja09yVmFsdWUsXG5cdEVudGl0eVNldCxcblx0RW50aXR5VHlwZSxcblx0RXFBbm5vdGF0aW9uRXhwcmVzc2lvbixcblx0RXFDb25kaXRpb25hbEV4cHJlc3Npb24sXG5cdEdlQW5ub3RhdGlvbkV4cHJlc3Npb24sXG5cdEdlQ29uZGl0aW9uYWxFeHByZXNzaW9uLFxuXHRHdEFubm90YXRpb25FeHByZXNzaW9uLFxuXHRHdENvbmRpdGlvbmFsRXhwcmVzc2lvbixcblx0SWZBbm5vdGF0aW9uRXhwcmVzc2lvbixcblx0SWZBbm5vdGF0aW9uRXhwcmVzc2lvblZhbHVlLFxuXHRMZUFubm90YXRpb25FeHByZXNzaW9uLFxuXHRMZUNvbmRpdGlvbmFsRXhwcmVzc2lvbixcblx0THRBbm5vdGF0aW9uRXhwcmVzc2lvbixcblx0THRDb25kaXRpb25hbEV4cHJlc3Npb24sXG5cdE5lQW5ub3RhdGlvbkV4cHJlc3Npb24sXG5cdE5lQ29uZGl0aW9uYWxFeHByZXNzaW9uLFxuXHROb3RBbm5vdGF0aW9uRXhwcmVzc2lvbixcblx0Tm90Q29uZGl0aW9uYWxFeHByZXNzaW9uLFxuXHRPckFubm90YXRpb25FeHByZXNzaW9uLFxuXHRPckNvbmRpdGlvbmFsRXhwcmVzc2lvbixcblx0UGF0aEFubm90YXRpb25FeHByZXNzaW9uLFxuXHRQYXRoQ29uZGl0aW9uRXhwcmVzc2lvbixcblx0UHJvcGVydHksXG5cdFByb3BlcnR5QW5ub3RhdGlvblZhbHVlXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHsgQ29tbW9uQW5ub3RhdGlvblRlcm1zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCB7IHJlc29sdmVFbnVtVmFsdWUgfSBmcm9tIFwiLi9Bbm5vdGF0aW9uRW51bVwiO1xuXG50eXBlIFByaW1pdGl2ZVR5cGUgPSBzdHJpbmcgfCBudW1iZXIgfCBiaWdpbnQgfCBib29sZWFuIHwgb2JqZWN0IHwgbnVsbCB8IHVuZGVmaW5lZDtcbnR5cGUgRGVmaW5lZFByaW1pdGl2ZVR5cGUgPSBzdHJpbmcgfCBudW1iZXIgfCBiaWdpbnQgfCBib29sZWFuIHwgb2JqZWN0O1xudHlwZSBQcmltaXRpdmVUeXBlQ2FzdDxQPiA9XG5cdHwgKFAgZXh0ZW5kcyBCb29sZWFuID8gYm9vbGVhbiA6IG5ldmVyKVxuXHR8IChQIGV4dGVuZHMgTnVtYmVyID8gbnVtYmVyIDogbmV2ZXIpXG5cdHwgKFAgZXh0ZW5kcyBTdHJpbmcgPyBzdHJpbmcgOiBuZXZlcilcblx0fCBQO1xudHlwZSBCYXNlRXhwcmVzc2lvbjxfVD4gPSB7XG5cdF90eXBlOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBDb25zdGFudEV4cHJlc3Npb248VD4gPSBCYXNlRXhwcmVzc2lvbjxUPiAmIHtcblx0X3R5cGU6IFwiQ29uc3RhbnRcIjtcblx0dmFsdWU6IFQ7XG59O1xuXG50eXBlIFNldE9wZXJhdG9yID0gXCImJlwiIHwgXCJ8fFwiO1xuZXhwb3J0IHR5cGUgU2V0RXhwcmVzc2lvbiA9IEJhc2VFeHByZXNzaW9uPGJvb2xlYW4+ICYge1xuXHRfdHlwZTogXCJTZXRcIjtcblx0b3BlcmF0b3I6IFNldE9wZXJhdG9yO1xuXHRvcGVyYW5kczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W107XG59O1xuXG5leHBvcnQgdHlwZSBOb3RFeHByZXNzaW9uID0gQmFzZUV4cHJlc3Npb248Ym9vbGVhbj4gJiB7XG5cdF90eXBlOiBcIk5vdFwiO1xuXHRvcGVyYW5kOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG59O1xuXG5leHBvcnQgdHlwZSBUcnV0aHlFeHByZXNzaW9uID0gQmFzZUV4cHJlc3Npb248Ym9vbGVhbj4gJiB7XG5cdF90eXBlOiBcIlRydXRoeVwiO1xuXHRvcGVyYW5kOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPjtcbn07XG5cbmV4cG9ydCB0eXBlIFJlZmVyZW5jZUV4cHJlc3Npb24gPSBCYXNlRXhwcmVzc2lvbjxvYmplY3Q+ICYge1xuXHRfdHlwZTogXCJSZWZcIjtcblx0cmVmOiBzdHJpbmcgfCBudWxsO1xufTtcblxuZXhwb3J0IHR5cGUgRm9ybWF0dGVyRXhwcmVzc2lvbjxUPiA9IEJhc2VFeHByZXNzaW9uPFQ+ICYge1xuXHRfdHlwZTogXCJGb3JtYXR0ZXJcIjtcblx0Zm46IHN0cmluZztcblx0cGFyYW1ldGVyczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT5bXTtcbn07XG5cbnR5cGUgQ29tcGxleFR5cGVFeHByZXNzaW9uPFQ+ID0gQmFzZUV4cHJlc3Npb248VD4gJiB7XG5cdF90eXBlOiBcIkNvbXBsZXhUeXBlXCI7XG5cdHR5cGU6IHN0cmluZztcblx0Zm9ybWF0T3B0aW9uczogYW55O1xuXHRwYXJhbWV0ZXJzOiBvYmplY3Q7XG5cdGJpbmRpbmdQYXJhbWV0ZXJzOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55PltdO1xufTtcblxuZXhwb3J0IHR5cGUgRnVuY3Rpb25FeHByZXNzaW9uPFQ+ID0gQmFzZUV4cHJlc3Npb248VD4gJiB7XG5cdF90eXBlOiBcIkZ1bmN0aW9uXCI7XG5cdG9iaj86IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxvYmplY3Q+O1xuXHRmbjogc3RyaW5nO1xuXHRwYXJhbWV0ZXJzOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55PltdO1xufTtcblxuZXhwb3J0IHR5cGUgQ29uY2F0RXhwcmVzc2lvbiA9IEJhc2VFeHByZXNzaW9uPHN0cmluZz4gJiB7XG5cdF90eXBlOiBcIkNvbmNhdFwiO1xuXHRleHByZXNzaW9uczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz5bXTtcbn07XG5cbmV4cG9ydCB0eXBlIExlbmd0aEV4cHJlc3Npb24gPSBCYXNlRXhwcmVzc2lvbjxzdHJpbmc+ICYge1xuXHRfdHlwZTogXCJMZW5ndGhcIjtcblx0cGF0aEluTW9kZWw6IFBhdGhJbk1vZGVsRXhwcmVzc2lvbjxhbnk+O1xufTtcblxudHlwZSBVbnJlc29sdmFibGVQYXRoRXhwcmVzc2lvbiA9IEJhc2VFeHByZXNzaW9uPHN0cmluZz4gJiB7XG5cdF90eXBlOiBcIlVucmVzb2x2YWJsZVwiO1xufTtcblxuLyoqXG4gKiBAdHlwZWRlZiBQYXRoSW5Nb2RlbEV4cHJlc3Npb25cbiAqL1xuZXhwb3J0IHR5cGUgUGF0aEluTW9kZWxFeHByZXNzaW9uPFQ+ID0gQmFzZUV4cHJlc3Npb248VD4gJiB7XG5cdF90eXBlOiBcIlBhdGhJbk1vZGVsXCI7XG5cdG1vZGVsTmFtZT86IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xuXHR0YXJnZXRFbnRpdHlTZXQ/OiBFbnRpdHlTZXQ7XG5cdHR5cGU/OiBzdHJpbmc7XG5cdGNvbnN0cmFpbnRzPzogYW55O1xuXHRwYXJhbWV0ZXJzPzogYW55O1xuXHR0YXJnZXRUeXBlPzogc3RyaW5nO1xuXHRtb2RlPzogc3RyaW5nO1xuXHRmb3JtYXRPcHRpb25zPzogYW55O1xufTtcblxuZXhwb3J0IHR5cGUgRW1iZWRkZWRVSTVCaW5kaW5nRXhwcmVzc2lvbjxUPiA9IEJhc2VFeHByZXNzaW9uPFQ+ICYge1xuXHRfdHlwZTogXCJFbWJlZGRlZEJpbmRpbmdcIjtcblx0dmFsdWU6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIEVtYmVkZGVkVUk1RXhwcmVzc2lvbkJpbmRpbmdFeHByZXNzaW9uPFQ+ID0gQmFzZUV4cHJlc3Npb248VD4gJiB7XG5cdF90eXBlOiBcIkVtYmVkZGVkRXhwcmVzc2lvbkJpbmRpbmdcIjtcblx0dmFsdWU6IHN0cmluZztcbn07XG5cbnR5cGUgQ29tcGFyaXNvbk9wZXJhdG9yID0gXCI9PT1cIiB8IFwiIT09XCIgfCBcIj49XCIgfCBcIj5cIiB8IFwiPD1cIiB8IFwiPFwiO1xuZXhwb3J0IHR5cGUgQ29tcGFyaXNvbkV4cHJlc3Npb24gPSBCYXNlRXhwcmVzc2lvbjxib29sZWFuPiAmIHtcblx0X3R5cGU6IFwiQ29tcGFyaXNvblwiO1xuXHRvcGVyYXRvcjogQ29tcGFyaXNvbk9wZXJhdG9yO1xuXHRvcGVyYW5kMTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT47XG5cdG9wZXJhbmQyOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55Pjtcbn07XG5cbmV4cG9ydCB0eXBlIElmRWxzZUV4cHJlc3Npb248VD4gPSBCYXNlRXhwcmVzc2lvbjxUPiAmIHtcblx0X3R5cGU6IFwiSWZFbHNlXCI7XG5cdGNvbmRpdGlvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+O1xuXHRvblRydWU6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0b25GYWxzZTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xufTtcblxuLyoqXG4gKiBBbiBleHByZXNzaW9uIHRoYXQgZXZhbHVhdGVzIHRvIHR5cGUgVC5cbiAqXG4gKiBAdHlwZWRlZiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb25cbiAqL1xuZXhwb3J0IHR5cGUgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+ID1cblx0fCBVbnJlc29sdmFibGVQYXRoRXhwcmVzc2lvblxuXHR8IENvbnN0YW50RXhwcmVzc2lvbjxUPlxuXHR8IFNldEV4cHJlc3Npb25cblx0fCBOb3RFeHByZXNzaW9uXG5cdHwgVHJ1dGh5RXhwcmVzc2lvblxuXHR8IENvbmNhdEV4cHJlc3Npb25cblx0fCBMZW5ndGhFeHByZXNzaW9uXG5cdHwgUGF0aEluTW9kZWxFeHByZXNzaW9uPFQ+XG5cdHwgRW1iZWRkZWRVSTVCaW5kaW5nRXhwcmVzc2lvbjxUPlxuXHR8IEVtYmVkZGVkVUk1RXhwcmVzc2lvbkJpbmRpbmdFeHByZXNzaW9uPFQ+XG5cdHwgQ29tcGFyaXNvbkV4cHJlc3Npb25cblx0fCBJZkVsc2VFeHByZXNzaW9uPFQ+XG5cdHwgRm9ybWF0dGVyRXhwcmVzc2lvbjxUPlxuXHR8IENvbXBsZXhUeXBlRXhwcmVzc2lvbjxUPlxuXHR8IFJlZmVyZW5jZUV4cHJlc3Npb25cblx0fCBGdW5jdGlvbkV4cHJlc3Npb248VD47XG5cbmV4cG9ydCBjb25zdCBFRE1fVFlQRV9NQVBQSU5HOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge1xuXHRcIkVkbS5Cb29sZWFuXCI6IHsgdHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5Cb29sZWFuXCIgfSxcblx0XCJFZG0uQnl0ZVwiOiB7IHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuQnl0ZVwiIH0sXG5cdFwiRWRtLkRhdGVcIjogeyB0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRhdGVcIiB9LFxuXHRcIkVkbS5EYXRlVGltZU9mZnNldFwiOiB7XG5cdFx0Y29uc3RyYWludHM6IHtcblx0XHRcdCRQcmVjaXNpb246IFwicHJlY2lzaW9uXCIsXG5cdFx0XHQkVjQ6IFwiVjRcIlxuXHRcdH0sXG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5EYXRlVGltZU9mZnNldFwiXG5cdH0sXG5cdFwiRWRtLkRlY2ltYWxcIjoge1xuXHRcdGNvbnN0cmFpbnRzOiB7XG5cdFx0XHRcIkBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NaW5pbXVtLyREZWNpbWFsXCI6IFwibWluaW11bVwiLFxuXHRcdFx0XCJAT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuTWluaW11bUBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5FeGNsdXNpdmVcIjogXCJtaW5pbXVtRXhjbHVzaXZlXCIsXG5cdFx0XHRcIkBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NYXhpbXVtLyREZWNpbWFsXCI6IFwibWF4aW11bVwiLFxuXHRcdFx0XCJAT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuTWF4aW11bUBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5FeGNsdXNpdmVcIjogXCJtYXhpbXVtRXhjbHVzaXZlXCIsXG5cdFx0XHQkUHJlY2lzaW9uOiBcInByZWNpc2lvblwiLFxuXHRcdFx0JFNjYWxlOiBcInNjYWxlXCJcblx0XHR9LFxuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRGVjaW1hbFwiXG5cdH0sXG5cdFwiRWRtLkRvdWJsZVwiOiB7IHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRG91YmxlXCIgfSxcblx0XCJFZG0uR3VpZFwiOiB7IHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuR3VpZFwiIH0sXG5cdFwiRWRtLkludDE2XCI6IHsgdHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnQxNlwiIH0sXG5cdFwiRWRtLkludDMyXCI6IHsgdHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnQzMlwiIH0sXG5cdFwiRWRtLkludDY0XCI6IHsgdHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnQ2NFwiIH0sXG5cdFwiRWRtLlNCeXRlXCI6IHsgdHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TQnl0ZVwiIH0sXG5cdFwiRWRtLlNpbmdsZVwiOiB7IHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU2luZ2xlXCIgfSxcblx0XCJFZG0uU3RyZWFtXCI6IHsgdHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TdHJlYW1cIiB9LFxuXHRcIkVkbS5CaW5hcnlcIjogeyB0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmVhbVwiIH0sXG5cdFwiRWRtLlN0cmluZ1wiOiB7XG5cdFx0Y29uc3RyYWludHM6IHtcblx0XHRcdFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0RpZ2l0U2VxdWVuY2VcIjogXCJpc0RpZ2l0U2VxdWVuY2VcIixcblx0XHRcdCRNYXhMZW5ndGg6IFwibWF4TGVuZ3RoXCIsXG5cdFx0XHQkTnVsbGFibGU6IFwibnVsbGFibGVcIlxuXHRcdH0sXG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TdHJpbmdcIlxuXHR9LFxuXHRcIkVkbS5UaW1lT2ZEYXlcIjoge1xuXHRcdGNvbnN0cmFpbnRzOiB7XG5cdFx0XHQkUHJlY2lzaW9uOiBcInByZWNpc2lvblwiXG5cdFx0fSxcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlRpbWVPZkRheVwiXG5cdH1cbn07XG5cbi8qKlxuICogQW4gZXhwcmVzc2lvbiB0aGF0IGV2YWx1YXRlcyB0byB0eXBlIFQsIG9yIGEgY29uc3RhbnQgdmFsdWUgb2YgdHlwZSBUXG4gKi9cbnR5cGUgRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPiA9IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPiB8IFQ7XG5cbmV4cG9ydCBjb25zdCB1bnJlc29sdmFibGVFeHByZXNzaW9uOiBVbnJlc29sdmFibGVQYXRoRXhwcmVzc2lvbiA9IHtcblx0X3R5cGU6IFwiVW5yZXNvbHZhYmxlXCJcbn07XG5cbmZ1bmN0aW9uIGVzY2FwZVhtbEF0dHJpYnV0ZShpbnB1dFN0cmluZzogc3RyaW5nKSB7XG5cdHJldHVybiBpbnB1dFN0cmluZy5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNVbnJlc29sdmFibGVFeHByZXNzaW9uKC4uLmV4cHJlc3Npb25zOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55PltdKTogYm9vbGVhbiB7XG5cdHJldHVybiBleHByZXNzaW9ucy5maW5kKChleHByKSA9PiBleHByLl90eXBlID09PSBcIlVucmVzb2x2YWJsZVwiKSAhPT0gdW5kZWZpbmVkO1xufVxuLyoqXG4gKiBDaGVjayB0d28gZXhwcmVzc2lvbnMgZm9yIChkZWVwKSBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0gYVxuICogQHBhcmFtIGJcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgdHdvIGV4cHJlc3Npb25zIGFyZSBlcXVhbFxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWw8VD4oYTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+LCBiOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD4pOiBib29sZWFuIHtcblx0aWYgKGEuX3R5cGUgIT09IGIuX3R5cGUpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRzd2l0Y2ggKGEuX3R5cGUpIHtcblx0XHRjYXNlIFwiVW5yZXNvbHZhYmxlXCI6XG5cdFx0XHRyZXR1cm4gZmFsc2U7IC8vIFVucmVzb2x2YWJsZSBpcyBuZXZlciBlcXVhbCB0byBhbnl0aGluZyBldmVuIGl0c2VsZlxuXHRcdGNhc2UgXCJDb25zdGFudFwiOlxuXHRcdGNhc2UgXCJFbWJlZGRlZEJpbmRpbmdcIjpcblx0XHRjYXNlIFwiRW1iZWRkZWRFeHByZXNzaW9uQmluZGluZ1wiOlxuXHRcdFx0cmV0dXJuIGEudmFsdWUgPT09IChiIGFzIENvbnN0YW50RXhwcmVzc2lvbjxUPikudmFsdWU7XG5cblx0XHRjYXNlIFwiTm90XCI6XG5cdFx0XHRyZXR1cm4gX2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChhLm9wZXJhbmQsIChiIGFzIE5vdEV4cHJlc3Npb24pLm9wZXJhbmQpO1xuXHRcdGNhc2UgXCJUcnV0aHlcIjpcblx0XHRcdHJldHVybiBfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKGEub3BlcmFuZCwgKGIgYXMgVHJ1dGh5RXhwcmVzc2lvbikub3BlcmFuZCk7XG5cdFx0Y2FzZSBcIlNldFwiOlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0YS5vcGVyYXRvciA9PT0gKGIgYXMgU2V0RXhwcmVzc2lvbikub3BlcmF0b3IgJiZcblx0XHRcdFx0YS5vcGVyYW5kcy5sZW5ndGggPT09IChiIGFzIFNldEV4cHJlc3Npb24pLm9wZXJhbmRzLmxlbmd0aCAmJlxuXHRcdFx0XHRhLm9wZXJhbmRzLmV2ZXJ5KChleHByZXNzaW9uKSA9PlxuXHRcdFx0XHRcdChiIGFzIFNldEV4cHJlc3Npb24pLm9wZXJhbmRzLnNvbWUoKG90aGVyRXhwcmVzc2lvbikgPT4gX2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChleHByZXNzaW9uLCBvdGhlckV4cHJlc3Npb24pKVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXG5cdFx0Y2FzZSBcIklmRWxzZVwiOlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0X2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChhLmNvbmRpdGlvbiwgKGIgYXMgSWZFbHNlRXhwcmVzc2lvbjxUPikuY29uZGl0aW9uKSAmJlxuXHRcdFx0XHRfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKGEub25UcnVlLCAoYiBhcyBJZkVsc2VFeHByZXNzaW9uPFQ+KS5vblRydWUpICYmXG5cdFx0XHRcdF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwoYS5vbkZhbHNlLCAoYiBhcyBJZkVsc2VFeHByZXNzaW9uPFQ+KS5vbkZhbHNlKVxuXHRcdFx0KTtcblxuXHRcdGNhc2UgXCJDb21wYXJpc29uXCI6XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRhLm9wZXJhdG9yID09PSAoYiBhcyBDb21wYXJpc29uRXhwcmVzc2lvbikub3BlcmF0b3IgJiZcblx0XHRcdFx0X2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChhLm9wZXJhbmQxLCAoYiBhcyBDb21wYXJpc29uRXhwcmVzc2lvbikub3BlcmFuZDEpICYmXG5cdFx0XHRcdF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwoYS5vcGVyYW5kMiwgKGIgYXMgQ29tcGFyaXNvbkV4cHJlc3Npb24pLm9wZXJhbmQyKVxuXHRcdFx0KTtcblxuXHRcdGNhc2UgXCJDb25jYXRcIjpcblx0XHRcdGNvbnN0IGFFeHByZXNzaW9ucyA9IGEuZXhwcmVzc2lvbnM7XG5cdFx0XHRjb25zdCBiRXhwcmVzc2lvbnMgPSAoYiBhcyBDb25jYXRFeHByZXNzaW9uKS5leHByZXNzaW9ucztcblx0XHRcdGlmIChhRXhwcmVzc2lvbnMubGVuZ3RoICE9PSBiRXhwcmVzc2lvbnMubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBhRXhwcmVzc2lvbnMuZXZlcnkoKGV4cHJlc3Npb24sIGluZGV4KSA9PiB7XG5cdFx0XHRcdHJldHVybiBfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKGV4cHJlc3Npb24sIGJFeHByZXNzaW9uc1tpbmRleF0pO1xuXHRcdFx0fSk7XG5cblx0XHRjYXNlIFwiTGVuZ3RoXCI6XG5cdFx0XHRyZXR1cm4gX2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChhLnBhdGhJbk1vZGVsLCAoYiBhcyBMZW5ndGhFeHByZXNzaW9uKS5wYXRoSW5Nb2RlbCk7XG5cblx0XHRjYXNlIFwiUGF0aEluTW9kZWxcIjpcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdGEubW9kZWxOYW1lID09PSAoYiBhcyBQYXRoSW5Nb2RlbEV4cHJlc3Npb248VD4pLm1vZGVsTmFtZSAmJlxuXHRcdFx0XHRhLnBhdGggPT09IChiIGFzIFBhdGhJbk1vZGVsRXhwcmVzc2lvbjxUPikucGF0aCAmJlxuXHRcdFx0XHRhLnRhcmdldEVudGl0eVNldCA9PT0gKGIgYXMgUGF0aEluTW9kZWxFeHByZXNzaW9uPFQ+KS50YXJnZXRFbnRpdHlTZXRcblx0XHRcdCk7XG5cblx0XHRjYXNlIFwiRm9ybWF0dGVyXCI6XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRhLmZuID09PSAoYiBhcyBGb3JtYXR0ZXJFeHByZXNzaW9uPFQ+KS5mbiAmJlxuXHRcdFx0XHRhLnBhcmFtZXRlcnMubGVuZ3RoID09PSAoYiBhcyBGb3JtYXR0ZXJFeHByZXNzaW9uPFQ+KS5wYXJhbWV0ZXJzLmxlbmd0aCAmJlxuXHRcdFx0XHRhLnBhcmFtZXRlcnMuZXZlcnkoKHZhbHVlLCBpbmRleCkgPT4gX2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbCgoYiBhcyBGb3JtYXR0ZXJFeHByZXNzaW9uPFQ+KS5wYXJhbWV0ZXJzW2luZGV4XSwgdmFsdWUpKVxuXHRcdFx0KTtcblx0XHRjYXNlIFwiQ29tcGxleFR5cGVcIjpcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdGEudHlwZSA9PT0gKGIgYXMgQ29tcGxleFR5cGVFeHByZXNzaW9uPFQ+KS50eXBlICYmXG5cdFx0XHRcdGEuYmluZGluZ1BhcmFtZXRlcnMubGVuZ3RoID09PSAoYiBhcyBDb21wbGV4VHlwZUV4cHJlc3Npb248VD4pLmJpbmRpbmdQYXJhbWV0ZXJzLmxlbmd0aCAmJlxuXHRcdFx0XHRhLmJpbmRpbmdQYXJhbWV0ZXJzLmV2ZXJ5KCh2YWx1ZSwgaW5kZXgpID0+XG5cdFx0XHRcdFx0X2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbCgoYiBhcyBDb21wbGV4VHlwZUV4cHJlc3Npb248VD4pLmJpbmRpbmdQYXJhbWV0ZXJzW2luZGV4XSwgdmFsdWUpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0Y2FzZSBcIkZ1bmN0aW9uXCI6XG5cdFx0XHRjb25zdCBvdGhlckZ1bmN0aW9uID0gYiBhcyBGdW5jdGlvbkV4cHJlc3Npb248VD47XG5cdFx0XHRpZiAoYS5vYmogPT09IHVuZGVmaW5lZCB8fCBvdGhlckZ1bmN0aW9uLm9iaiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiBhLm9iaiA9PT0gb3RoZXJGdW5jdGlvbjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0YS5mbiA9PT0gb3RoZXJGdW5jdGlvbi5mbiAmJlxuXHRcdFx0XHRfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKGEub2JqLCBvdGhlckZ1bmN0aW9uLm9iaikgJiZcblx0XHRcdFx0YS5wYXJhbWV0ZXJzLmxlbmd0aCA9PT0gb3RoZXJGdW5jdGlvbi5wYXJhbWV0ZXJzLmxlbmd0aCAmJlxuXHRcdFx0XHRhLnBhcmFtZXRlcnMuZXZlcnkoKHZhbHVlLCBpbmRleCkgPT4gX2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChvdGhlckZ1bmN0aW9uLnBhcmFtZXRlcnNbaW5kZXhdLCB2YWx1ZSkpXG5cdFx0XHQpO1xuXG5cdFx0Y2FzZSBcIlJlZlwiOlxuXHRcdFx0cmV0dXJuIGEucmVmID09PSAoYiBhcyBSZWZlcmVuY2VFeHByZXNzaW9uKS5yZWY7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgbmVzdGVkIFNldEV4cHJlc3Npb24gYnkgaW5saW5pbmcgb3BlcmFuZHMgb2YgdHlwZSBTZXRFeHByZXNzaW9uIHdpdGggdGhlIHNhbWUgb3BlcmF0b3IuXG4gKlxuICogQHBhcmFtIGV4cHJlc3Npb24gVGhlIGV4cHJlc3Npb24gdG8gZmxhdHRlblxuICogQHJldHVybnMgQSBuZXcgU2V0RXhwcmVzc2lvbiB3aXRoIHRoZSBzYW1lIG9wZXJhdG9yXG4gKi9cbmZ1bmN0aW9uIGZsYXR0ZW5TZXRFeHByZXNzaW9uKGV4cHJlc3Npb246IFNldEV4cHJlc3Npb24pOiBTZXRFeHByZXNzaW9uIHtcblx0cmV0dXJuIGV4cHJlc3Npb24ub3BlcmFuZHMucmVkdWNlKFxuXHRcdChyZXN1bHQ6IFNldEV4cHJlc3Npb24sIG9wZXJhbmQpID0+IHtcblx0XHRcdGNvbnN0IGNhbmRpZGF0ZXNGb3JGbGF0dGVuaW5nID1cblx0XHRcdFx0b3BlcmFuZC5fdHlwZSA9PT0gXCJTZXRcIiAmJiBvcGVyYW5kLm9wZXJhdG9yID09PSBleHByZXNzaW9uLm9wZXJhdG9yID8gb3BlcmFuZC5vcGVyYW5kcyA6IFtvcGVyYW5kXTtcblx0XHRcdGNhbmRpZGF0ZXNGb3JGbGF0dGVuaW5nLmZvckVhY2goKGNhbmRpZGF0ZSkgPT4ge1xuXHRcdFx0XHRpZiAocmVzdWx0Lm9wZXJhbmRzLmV2ZXJ5KChlKSA9PiAhX2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChlLCBjYW5kaWRhdGUpKSkge1xuXHRcdFx0XHRcdHJlc3VsdC5vcGVyYW5kcy5wdXNoKGNhbmRpZGF0ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdHsgX3R5cGU6IFwiU2V0XCIsIG9wZXJhdG9yOiBleHByZXNzaW9uLm9wZXJhdG9yLCBvcGVyYW5kczogW10gfVxuXHQpO1xufVxuXG4vKipcbiAqIERldGVjdHMgd2hldGhlciBhbiBhcnJheSBvZiBib29sZWFuIGV4cHJlc3Npb25zIGNvbnRhaW5zIGFuIGV4cHJlc3Npb24gYW5kIGl0cyBuZWdhdGlvbi5cbiAqXG4gKiBAcGFyYW0gZXhwcmVzc2lvbnMgQXJyYXkgb2YgZXhwcmVzc2lvbnNcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgc2V0IG9mIGV4cHJlc3Npb25zIGNvbnRhaW5zIGFuIGV4cHJlc3Npb24gYW5kIGl0cyBuZWdhdGlvblxuICovXG5mdW5jdGlvbiBoYXNPcHBvc2l0ZUV4cHJlc3Npb25zKGV4cHJlc3Npb25zOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSk6IGJvb2xlYW4ge1xuXHRjb25zdCBuZWdhdGVkRXhwcmVzc2lvbnMgPSBleHByZXNzaW9ucy5tYXAobm90KTtcblx0cmV0dXJuIGV4cHJlc3Npb25zLnNvbWUoKGV4cHJlc3Npb24sIGluZGV4KSA9PiB7XG5cdFx0Zm9yIChsZXQgaSA9IGluZGV4ICsgMTsgaSA8IG5lZ2F0ZWRFeHByZXNzaW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwoZXhwcmVzc2lvbiwgbmVnYXRlZEV4cHJlc3Npb25zW2ldKSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBMb2dpY2FsIGBhbmRgIGV4cHJlc3Npb24uXG4gKlxuICogVGhlIGV4cHJlc3Npb24gaXMgc2ltcGxpZmllZCB0byBmYWxzZSBpZiB0aGlzIGNhbiBiZSBkZWNpZGVkIHN0YXRpY2FsbHkgKHRoYXQgaXMsIGlmIG9uZSBvcGVyYW5kIGlzIGEgY29uc3RhbnRcbiAqIGZhbHNlIG9yIGlmIHRoZSBleHByZXNzaW9uIGNvbnRhaW5zIGFuIG9wZXJhbmQgYW5kIGl0cyBuZWdhdGlvbikuXG4gKlxuICogQHBhcmFtIG9wZXJhbmRzIEV4cHJlc3Npb25zIHRvIGNvbm5lY3QgYnkgYGFuZGBcbiAqIEByZXR1cm5zIEV4cHJlc3Npb24gZXZhbHVhdGluZyB0byBib29sZWFuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmQoLi4ub3BlcmFuZHM6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxib29sZWFuPltdKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0Y29uc3QgZXhwcmVzc2lvbnMgPSBmbGF0dGVuU2V0RXhwcmVzc2lvbih7XG5cdFx0X3R5cGU6IFwiU2V0XCIsXG5cdFx0b3BlcmF0b3I6IFwiJiZcIixcblx0XHRvcGVyYW5kczogb3BlcmFuZHMubWFwKHdyYXBQcmltaXRpdmUpXG5cdH0pLm9wZXJhbmRzO1xuXG5cdGlmIChoYXNVbnJlc29sdmFibGVFeHByZXNzaW9uKC4uLmV4cHJlc3Npb25zKSkge1xuXHRcdHJldHVybiB1bnJlc29sdmFibGVFeHByZXNzaW9uO1xuXHR9XG5cdGxldCBpc1N0YXRpY0ZhbHNlID0gZmFsc2U7XG5cdGNvbnN0IG5vblRyaXZpYWxFeHByZXNzaW9uID0gZXhwcmVzc2lvbnMuZmlsdGVyKChleHByZXNzaW9uKSA9PiB7XG5cdFx0aWYgKGlzRmFsc2UoZXhwcmVzc2lvbikpIHtcblx0XHRcdGlzU3RhdGljRmFsc2UgPSB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gIWlzQ29uc3RhbnQoZXhwcmVzc2lvbik7XG5cdH0pO1xuXHRpZiAoaXNTdGF0aWNGYWxzZSkge1xuXHRcdHJldHVybiBjb25zdGFudChmYWxzZSk7XG5cdH0gZWxzZSBpZiAobm9uVHJpdmlhbEV4cHJlc3Npb24ubGVuZ3RoID09PSAwKSB7XG5cdFx0Ly8gUmVzb2x2ZSB0aGUgY29uc3RhbnQgdGhlblxuXHRcdGNvbnN0IGlzVmFsaWQgPSBleHByZXNzaW9ucy5yZWR1Y2UoKHJlc3VsdCwgZXhwcmVzc2lvbikgPT4gcmVzdWx0ICYmIGlzVHJ1ZShleHByZXNzaW9uKSwgdHJ1ZSk7XG5cdFx0cmV0dXJuIGNvbnN0YW50KGlzVmFsaWQpO1xuXHR9IGVsc2UgaWYgKG5vblRyaXZpYWxFeHByZXNzaW9uLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBub25Ucml2aWFsRXhwcmVzc2lvblswXTtcblx0fSBlbHNlIGlmIChoYXNPcHBvc2l0ZUV4cHJlc3Npb25zKG5vblRyaXZpYWxFeHByZXNzaW9uKSkge1xuXHRcdHJldHVybiBjb25zdGFudChmYWxzZSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdF90eXBlOiBcIlNldFwiLFxuXHRcdFx0b3BlcmF0b3I6IFwiJiZcIixcblx0XHRcdG9wZXJhbmRzOiBub25Ucml2aWFsRXhwcmVzc2lvblxuXHRcdH07XG5cdH1cbn1cblxuLyoqXG4gKiBMb2dpY2FsIGBvcmAgZXhwcmVzc2lvbi5cbiAqXG4gKiBUaGUgZXhwcmVzc2lvbiBpcyBzaW1wbGlmaWVkIHRvIHRydWUgaWYgdGhpcyBjYW4gYmUgZGVjaWRlZCBzdGF0aWNhbGx5ICh0aGF0IGlzLCBpZiBvbmUgb3BlcmFuZCBpcyBhIGNvbnN0YW50XG4gKiB0cnVlIG9yIGlmIHRoZSBleHByZXNzaW9uIGNvbnRhaW5zIGFuIG9wZXJhbmQgYW5kIGl0cyBuZWdhdGlvbikuXG4gKlxuICogQHBhcmFtIG9wZXJhbmRzIEV4cHJlc3Npb25zIHRvIGNvbm5lY3QgYnkgYG9yYFxuICogQHJldHVybnMgRXhwcmVzc2lvbiBldmFsdWF0aW5nIHRvIGJvb2xlYW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9yKC4uLm9wZXJhbmRzOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8Ym9vbGVhbj5bXSk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGV4cHJlc3Npb25zID0gZmxhdHRlblNldEV4cHJlc3Npb24oe1xuXHRcdF90eXBlOiBcIlNldFwiLFxuXHRcdG9wZXJhdG9yOiBcInx8XCIsXG5cdFx0b3BlcmFuZHM6IG9wZXJhbmRzLm1hcCh3cmFwUHJpbWl0aXZlKVxuXHR9KS5vcGVyYW5kcztcblx0aWYgKGhhc1VucmVzb2x2YWJsZUV4cHJlc3Npb24oLi4uZXhwcmVzc2lvbnMpKSB7XG5cdFx0cmV0dXJuIHVucmVzb2x2YWJsZUV4cHJlc3Npb247XG5cdH1cblx0bGV0IGlzU3RhdGljVHJ1ZSA9IGZhbHNlO1xuXHRjb25zdCBub25Ucml2aWFsRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25zLmZpbHRlcigoZXhwcmVzc2lvbikgPT4ge1xuXHRcdGlmIChpc1RydWUoZXhwcmVzc2lvbikpIHtcblx0XHRcdGlzU3RhdGljVHJ1ZSA9IHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiAhaXNDb25zdGFudChleHByZXNzaW9uKSB8fCBleHByZXNzaW9uLnZhbHVlO1xuXHR9KTtcblx0aWYgKGlzU3RhdGljVHJ1ZSkge1xuXHRcdHJldHVybiBjb25zdGFudCh0cnVlKTtcblx0fSBlbHNlIGlmIChub25Ucml2aWFsRXhwcmVzc2lvbi5sZW5ndGggPT09IDApIHtcblx0XHQvLyBSZXNvbHZlIHRoZSBjb25zdGFudCB0aGVuXG5cdFx0Y29uc3QgaXNWYWxpZCA9IGV4cHJlc3Npb25zLnJlZHVjZSgocmVzdWx0LCBleHByZXNzaW9uKSA9PiByZXN1bHQgJiYgaXNUcnVlKGV4cHJlc3Npb24pLCB0cnVlKTtcblx0XHRyZXR1cm4gY29uc3RhbnQoaXNWYWxpZCk7XG5cdH0gZWxzZSBpZiAobm9uVHJpdmlhbEV4cHJlc3Npb24ubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIG5vblRyaXZpYWxFeHByZXNzaW9uWzBdO1xuXHR9IGVsc2UgaWYgKGhhc09wcG9zaXRlRXhwcmVzc2lvbnMobm9uVHJpdmlhbEV4cHJlc3Npb24pKSB7XG5cdFx0cmV0dXJuIGNvbnN0YW50KHRydWUpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB7XG5cdFx0XHRfdHlwZTogXCJTZXRcIixcblx0XHRcdG9wZXJhdG9yOiBcInx8XCIsXG5cdFx0XHRvcGVyYW5kczogbm9uVHJpdmlhbEV4cHJlc3Npb25cblx0XHR9O1xuXHR9XG59XG5cbi8qKlxuICogTG9naWNhbCBgbm90YCBvcGVyYXRvci5cbiAqXG4gKiBAcGFyYW0gb3BlcmFuZCBUaGUgZXhwcmVzc2lvbiB0byByZXZlcnNlXG4gKiBAcmV0dXJucyBUaGUgcmVzdWx0aW5nIGV4cHJlc3Npb24gdGhhdCBldmFsdWF0ZXMgdG8gYm9vbGVhblxuICovXG5leHBvcnQgZnVuY3Rpb24gbm90KG9wZXJhbmQ6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxib29sZWFuPik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdG9wZXJhbmQgPSB3cmFwUHJpbWl0aXZlKG9wZXJhbmQpO1xuXHRpZiAoaGFzVW5yZXNvbHZhYmxlRXhwcmVzc2lvbihvcGVyYW5kKSkge1xuXHRcdHJldHVybiB1bnJlc29sdmFibGVFeHByZXNzaW9uO1xuXHR9IGVsc2UgaWYgKGlzQ29uc3RhbnQob3BlcmFuZCkpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQoIW9wZXJhbmQudmFsdWUpO1xuXHR9IGVsc2UgaWYgKFxuXHRcdHR5cGVvZiBvcGVyYW5kID09PSBcIm9iamVjdFwiICYmXG5cdFx0b3BlcmFuZC5fdHlwZSA9PT0gXCJTZXRcIiAmJlxuXHRcdG9wZXJhbmQub3BlcmF0b3IgPT09IFwifHxcIiAmJlxuXHRcdG9wZXJhbmQub3BlcmFuZHMuZXZlcnkoKGV4cHJlc3Npb24pID0+IGlzQ29uc3RhbnQoZXhwcmVzc2lvbikgfHwgaXNDb21wYXJpc29uKGV4cHJlc3Npb24pKVxuXHQpIHtcblx0XHRyZXR1cm4gYW5kKC4uLm9wZXJhbmQub3BlcmFuZHMubWFwKChleHByZXNzaW9uKSA9PiBub3QoZXhwcmVzc2lvbikpKTtcblx0fSBlbHNlIGlmIChcblx0XHR0eXBlb2Ygb3BlcmFuZCA9PT0gXCJvYmplY3RcIiAmJlxuXHRcdG9wZXJhbmQuX3R5cGUgPT09IFwiU2V0XCIgJiZcblx0XHRvcGVyYW5kLm9wZXJhdG9yID09PSBcIiYmXCIgJiZcblx0XHRvcGVyYW5kLm9wZXJhbmRzLmV2ZXJ5KChleHByZXNzaW9uKSA9PiBpc0NvbnN0YW50KGV4cHJlc3Npb24pIHx8IGlzQ29tcGFyaXNvbihleHByZXNzaW9uKSlcblx0KSB7XG5cdFx0cmV0dXJuIG9yKC4uLm9wZXJhbmQub3BlcmFuZHMubWFwKChleHByZXNzaW9uKSA9PiBub3QoZXhwcmVzc2lvbikpKTtcblx0fSBlbHNlIGlmIChpc0NvbXBhcmlzb24ob3BlcmFuZCkpIHtcblx0XHQvLyBDcmVhdGUgdGhlIHJldmVyc2UgY29tcGFyaXNvblxuXHRcdHN3aXRjaCAob3BlcmFuZC5vcGVyYXRvcikge1xuXHRcdFx0Y2FzZSBcIiE9PVwiOlxuXHRcdFx0XHRyZXR1cm4geyAuLi5vcGVyYW5kLCBvcGVyYXRvcjogXCI9PT1cIiB9O1xuXHRcdFx0Y2FzZSBcIjxcIjpcblx0XHRcdFx0cmV0dXJuIHsgLi4ub3BlcmFuZCwgb3BlcmF0b3I6IFwiPj1cIiB9O1xuXHRcdFx0Y2FzZSBcIjw9XCI6XG5cdFx0XHRcdHJldHVybiB7IC4uLm9wZXJhbmQsIG9wZXJhdG9yOiBcIj5cIiB9O1xuXHRcdFx0Y2FzZSBcIj09PVwiOlxuXHRcdFx0XHRyZXR1cm4geyAuLi5vcGVyYW5kLCBvcGVyYXRvcjogXCIhPT1cIiB9O1xuXHRcdFx0Y2FzZSBcIj5cIjpcblx0XHRcdFx0cmV0dXJuIHsgLi4ub3BlcmFuZCwgb3BlcmF0b3I6IFwiPD1cIiB9O1xuXHRcdFx0Y2FzZSBcIj49XCI6XG5cdFx0XHRcdHJldHVybiB7IC4uLm9wZXJhbmQsIG9wZXJhdG9yOiBcIjxcIiB9O1xuXHRcdH1cblx0fSBlbHNlIGlmIChvcGVyYW5kLl90eXBlID09PSBcIk5vdFwiKSB7XG5cdFx0cmV0dXJuIG9wZXJhbmQub3BlcmFuZDtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0X3R5cGU6IFwiTm90XCIsXG5cdFx0b3BlcmFuZDogb3BlcmFuZFxuXHR9O1xufVxuXG4vKipcbiAqIEV2YWx1YXRlcyB3aGV0aGVyIGEgYmluZGluZyBleHByZXNzaW9uIGlzIGVxdWFsIHRvIHRydWUgd2l0aCBhIGxvb3NlIGVxdWFsaXR5LlxuICpcbiAqIEBwYXJhbSBvcGVyYW5kIFRoZSBleHByZXNzaW9uIHRvIGNoZWNrXG4gKiBAcmV0dXJucyBUaGUgcmVzdWx0aW5nIGV4cHJlc3Npb24gdGhhdCBldmFsdWF0ZXMgdG8gYm9vbGVhblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNUcnV0aHkob3BlcmFuZDogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRpZiAoaXNDb25zdGFudChvcGVyYW5kKSkge1xuXHRcdHJldHVybiBjb25zdGFudCghIW9wZXJhbmQudmFsdWUpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB7XG5cdFx0XHRfdHlwZTogXCJUcnV0aHlcIixcblx0XHRcdG9wZXJhbmQ6IG9wZXJhbmRcblx0XHR9O1xuXHR9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGJpbmRpbmcgZXhwcmVzc2lvbiB0aGF0IHdpbGwgYmUgZXZhbHVhdGVkIGJ5IHRoZSBjb3JyZXNwb25kaW5nIG1vZGVsLlxuICpcbiAqIEBwYXJhbSBwYXRoXG4gKiBAcGFyYW0gbW9kZWxOYW1lXG4gKiBAcGFyYW0gdmlzaXRlZE5hdmlnYXRpb25QYXRoc1xuICogQHBhcmFtIHBhdGhWaXNpdG9yXG4gKiBAcmV0dXJucyBBbiBleHByZXNzaW9uIHJlcHJlc2VudGF0aW5nIHRoYXQgcGF0aCBpbiB0aGUgbW9kZWxcbiAqIEBkZXByZWNhdGVkIHVzZSBwYXRoSW5Nb2RlbCBpbnN0ZWFkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kaW5nRXhwcmVzc2lvbjxUYXJnZXRUeXBlIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdHBhdGg6IGFueSxcblx0bW9kZWxOYW1lPzogc3RyaW5nLFxuXHR2aXNpdGVkTmF2aWdhdGlvblBhdGhzOiBzdHJpbmdbXSA9IFtdLFxuXHRwYXRoVmlzaXRvcj86IEZ1bmN0aW9uXG4pOiBQYXRoSW5Nb2RlbEV4cHJlc3Npb248VGFyZ2V0VHlwZT4gfCBVbnJlc29sdmFibGVQYXRoRXhwcmVzc2lvbiB7XG5cdHJldHVybiBwYXRoSW5Nb2RlbChwYXRoLCBtb2RlbE5hbWUsIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgYmluZGluZyBleHByZXNzaW9uIHRoYXQgd2lsbCBiZSBldmFsdWF0ZWQgYnkgdGhlIGNvcnJlc3BvbmRpbmcgbW9kZWwuXG4gKlxuICogQHRlbXBsYXRlIFRhcmdldFR5cGVcbiAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIG9uIHRoZSBtb2RlbFxuICogQHBhcmFtIFttb2RlbE5hbWVdIFRoZSBuYW1lIG9mIHRoZSBtb2RlbFxuICogQHBhcmFtIFt2aXNpdGVkTmF2aWdhdGlvblBhdGhzXSBUaGUgcGF0aHMgZnJvbSB0aGUgcm9vdCBlbnRpdHlTZXRcbiAqIEBwYXJhbSBbcGF0aFZpc2l0b3JdIEEgZnVuY3Rpb24gdG8gbW9kaWZ5IHRoZSByZXN1bHRpbmcgcGF0aFxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbiByZXByZXNlbnRhdGluZyB0aGF0IHBhdGggaW4gdGhlIG1vZGVsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXRoSW5Nb2RlbChcblx0cGF0aDogdW5kZWZpbmVkLFxuXHRtb2RlbE5hbWU/OiBzdHJpbmcsXG5cdHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHM/OiBzdHJpbmdbXSxcblx0cGF0aFZpc2l0b3I/OiBGdW5jdGlvblxuKTogVW5yZXNvbHZhYmxlUGF0aEV4cHJlc3Npb247XG5leHBvcnQgZnVuY3Rpb24gcGF0aEluTW9kZWw8VGFyZ2V0VHlwZSBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHRwYXRoOiBzdHJpbmcsXG5cdG1vZGVsTmFtZT86IHN0cmluZyxcblx0dmlzaXRlZE5hdmlnYXRpb25QYXRocz86IHN0cmluZ1tdLFxuXHRwYXRoVmlzaXRvcj86IHVuZGVmaW5lZFxuKTogUGF0aEluTW9kZWxFeHByZXNzaW9uPFRhcmdldFR5cGU+O1xuZXhwb3J0IGZ1bmN0aW9uIHBhdGhJbk1vZGVsPFRhcmdldFR5cGUgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihcblx0cGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRtb2RlbE5hbWU/OiBzdHJpbmcsXG5cdHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHM/OiBzdHJpbmdbXSxcblx0cGF0aFZpc2l0b3I/OiBGdW5jdGlvblxuKTogVW5yZXNvbHZhYmxlUGF0aEV4cHJlc3Npb24gfCBQYXRoSW5Nb2RlbEV4cHJlc3Npb248VGFyZ2V0VHlwZT47XG5leHBvcnQgZnVuY3Rpb24gcGF0aEluTW9kZWw8VGFyZ2V0VHlwZSBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHRwYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdG1vZGVsTmFtZT86IHN0cmluZyxcblx0dmlzaXRlZE5hdmlnYXRpb25QYXRoczogc3RyaW5nW10gPSBbXSxcblx0cGF0aFZpc2l0b3I/OiBGdW5jdGlvblxuKTogVW5yZXNvbHZhYmxlUGF0aEV4cHJlc3Npb24gfCBQYXRoSW5Nb2RlbEV4cHJlc3Npb248VGFyZ2V0VHlwZT4ge1xuXHRpZiAocGF0aCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIHVucmVzb2x2YWJsZUV4cHJlc3Npb247XG5cdH1cblx0bGV0IHRhcmdldFBhdGg7XG5cdGlmIChwYXRoVmlzaXRvcikge1xuXHRcdHRhcmdldFBhdGggPSBwYXRoVmlzaXRvcihwYXRoKTtcblx0XHRpZiAodGFyZ2V0UGF0aCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gdW5yZXNvbHZhYmxlRXhwcmVzc2lvbjtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgbG9jYWxQYXRoID0gdmlzaXRlZE5hdmlnYXRpb25QYXRocy5jb25jYXQoKTtcblx0XHRsb2NhbFBhdGgucHVzaChwYXRoKTtcblx0XHR0YXJnZXRQYXRoID0gbG9jYWxQYXRoLmpvaW4oXCIvXCIpO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0X3R5cGU6IFwiUGF0aEluTW9kZWxcIixcblx0XHRtb2RlbE5hbWU6IG1vZGVsTmFtZSxcblx0XHRwYXRoOiB0YXJnZXRQYXRoXG5cdH07XG59XG5cbnR5cGUgUGxhaW5FeHByZXNzaW9uT2JqZWN0ID0geyBbaW5kZXg6IHN0cmluZ106IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+IH07XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNvbnN0YW50IGV4cHJlc3Npb24gYmFzZWQgb24gYSBwcmltaXRpdmUgdmFsdWUuXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgY29uc3RhbnQgdG8gd3JhcCBpbiBhbiBleHByZXNzaW9uXG4gKiBAcmV0dXJucyBUaGUgY29uc3RhbnQgZXhwcmVzc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uc3RhbnQ8VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KHZhbHVlOiBUKTogQ29uc3RhbnRFeHByZXNzaW9uPFQ+IHtcblx0bGV0IGNvbnN0YW50VmFsdWU6IFQ7XG5cblx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRjb25zdGFudFZhbHVlID0gdmFsdWUubWFwKHdyYXBQcmltaXRpdmUpIGFzIFQ7XG5cdFx0fSBlbHNlIGlmIChpc1ByaW1pdGl2ZU9iamVjdCh2YWx1ZSkpIHtcblx0XHRcdGNvbnN0YW50VmFsdWUgPSB2YWx1ZS52YWx1ZU9mKCkgYXMgVDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3RhbnRWYWx1ZSA9IE9iamVjdC5lbnRyaWVzKHZhbHVlKS5yZWR1Y2UoKHBsYWluRXhwcmVzc2lvbiwgW2tleSwgdmFsXSkgPT4ge1xuXHRcdFx0XHRjb25zdCB3cmFwcGVkVmFsdWUgPSB3cmFwUHJpbWl0aXZlKHZhbCk7XG5cdFx0XHRcdGlmICh3cmFwcGVkVmFsdWUuX3R5cGUgIT09IFwiQ29uc3RhbnRcIiB8fCB3cmFwcGVkVmFsdWUudmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHBsYWluRXhwcmVzc2lvbltrZXldID0gd3JhcHBlZFZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBwbGFpbkV4cHJlc3Npb247XG5cdFx0XHR9LCB7fSBhcyBQbGFpbkV4cHJlc3Npb25PYmplY3QpIGFzIFQ7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGNvbnN0YW50VmFsdWUgPSB2YWx1ZTtcblx0fVxuXG5cdHJldHVybiB7IF90eXBlOiBcIkNvbnN0YW50XCIsIHZhbHVlOiBjb25zdGFudFZhbHVlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlQmluZGluZ1N0cmluZzxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdHZhbHVlOiBzdHJpbmcgfCBib29sZWFuIHwgbnVtYmVyLFxuXHR0YXJnZXRUeXBlPzogc3RyaW5nXG4pOiBDb25zdGFudEV4cHJlc3Npb248VD4gfCBQYXRoSW5Nb2RlbEV4cHJlc3Npb248VD4gfCBFbWJlZGRlZFVJNUJpbmRpbmdFeHByZXNzaW9uPFQ+IHwgRW1iZWRkZWRVSTVFeHByZXNzaW9uQmluZGluZ0V4cHJlc3Npb248VD4ge1xuXHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgJiYgdmFsdWUuc3RhcnRzV2l0aChcIntcIikpIHtcblx0XHRjb25zdCBwYXRoSW5Nb2RlbFJlZ2V4ID0gL157KC4qKT4oLispfSQvOyAvLyBNYXRjaGVzIG1vZGVsIHBhdGhzIGxpa2UgXCJtb2RlbD5wYXRoXCIgb3IgXCI+cGF0aFwiIChkZWZhdWx0IG1vZGVsKVxuXHRcdGNvbnN0IHBhdGhJbk1vZGVsUmVnZXhNYXRjaCA9IHBhdGhJbk1vZGVsUmVnZXguZXhlYyh2YWx1ZSk7XG5cblx0XHRpZiAodmFsdWUuc3RhcnRzV2l0aChcIns9XCIpKSB7XG5cdFx0XHQvLyBFeHByZXNzaW9uIGJpbmRpbmcsIHdlIGNhbiBqdXN0IHJlbW92ZSB0aGUgb3V0ZXIgYmluZGluZyB0aGluZ3Ncblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdF90eXBlOiBcIkVtYmVkZGVkRXhwcmVzc2lvbkJpbmRpbmdcIixcblx0XHRcdFx0dmFsdWU6IHZhbHVlXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAocGF0aEluTW9kZWxSZWdleE1hdGNoKSB7XG5cdFx0XHRyZXR1cm4gcGF0aEluTW9kZWwocGF0aEluTW9kZWxSZWdleE1hdGNoWzJdIHx8IFwiXCIsIHBhdGhJbk1vZGVsUmVnZXhNYXRjaFsxXSB8fCB1bmRlZmluZWQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRfdHlwZTogXCJFbWJlZGRlZEJpbmRpbmdcIixcblx0XHRcdFx0dmFsdWU6IHZhbHVlXG5cdFx0XHR9O1xuXHRcdH1cblx0fSBlbHNlIGlmICh0YXJnZXRUeXBlID09PSBcImJvb2xlYW5cIiAmJiB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgJiYgKHZhbHVlID09PSBcInRydWVcIiB8fCB2YWx1ZSA9PT0gXCJmYWxzZVwiKSkge1xuXHRcdHJldHVybiBjb25zdGFudCh2YWx1ZSA9PT0gXCJ0cnVlXCIpIGFzIENvbnN0YW50RXhwcmVzc2lvbjxUPjtcblx0fSBlbHNlIGlmICh0YXJnZXRUeXBlID09PSBcIm51bWJlclwiICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiAoIWlzTmFOKE51bWJlcih2YWx1ZSkpIHx8IHZhbHVlID09PSBcIk5hTlwiKSkge1xuXHRcdHJldHVybiBjb25zdGFudChOdW1iZXIodmFsdWUpKSBhcyBDb25zdGFudEV4cHJlc3Npb248VD47XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGNvbnN0YW50KHZhbHVlKSBhcyBDb25zdGFudEV4cHJlc3Npb248VD47XG5cdH1cbn1cblxuLyoqXG4gKiBBIG5hbWVkIHJlZmVyZW5jZS5cbiAqXG4gKiBAc2VlIGZuXG4gKiBAcGFyYW0gcmVmZXJlbmNlIFJlZmVyZW5jZVxuICogQHJldHVybnMgVGhlIG9iamVjdCByZWZlcmVuY2UgYmluZGluZyBwYXJ0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWYocmVmZXJlbmNlOiBzdHJpbmcgfCBudWxsKTogUmVmZXJlbmNlRXhwcmVzc2lvbiB7XG5cdHJldHVybiB7IF90eXBlOiBcIlJlZlwiLCByZWY6IHJlZmVyZW5jZSB9O1xufVxuXG4vKipcbiAqIFdyYXAgYSBwcmltaXRpdmUgaW50byBhIGNvbnN0YW50IGV4cHJlc3Npb24gaWYgaXQgaXMgbm90IGFscmVhZHkgYW4gZXhwcmVzc2lvbi5cbiAqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHNvbWV0aGluZyBUaGUgb2JqZWN0IHRvIHdyYXAgaW4gYSBDb25zdGFudCBleHByZXNzaW9uXG4gKiBAcmV0dXJucyBFaXRoZXIgdGhlIG9yaWdpbmFsIG9iamVjdCBvciB0aGUgd3JhcHBlZCBvbmUgZGVwZW5kaW5nIG9uIHRoZSBjYXNlXG4gKi9cbmZ1bmN0aW9uIHdyYXBQcmltaXRpdmU8VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KHNvbWV0aGluZzogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+KTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+IHtcblx0aWYgKGlzQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uKHNvbWV0aGluZykpIHtcblx0XHRyZXR1cm4gc29tZXRoaW5nO1xuXHR9XG5cblx0cmV0dXJuIGNvbnN0YW50KHNvbWV0aGluZyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBleHByZXNzaW9uIG9yIHZhbHVlIHByb3ZpZGVkIGlzIGEgYmluZGluZyB0b29saW5nIGV4cHJlc3Npb24gb3Igbm90LlxuICpcbiAqIEV2ZXJ5IG9iamVjdCBoYXZpbmcgYSBwcm9wZXJ0eSBuYW1lZCBgX3R5cGVgIG9mIHNvbWUgdmFsdWUgaXMgY29uc2lkZXJlZCBhbiBleHByZXNzaW9uLCBldmVuIGlmIHRoZXJlIGlzIGFjdHVhbGx5XG4gKiBubyBzdWNoIGV4cHJlc3Npb24gdHlwZSBzdXBwb3J0ZWQuXG4gKlxuICogQHBhcmFtIGV4cHJlc3Npb25cbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgZXhwcmVzc2lvbiBpcyBhIGJpbmRpbmcgdG9vbGtpdCBleHByZXNzaW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0JpbmRpbmdUb29sa2l0RXhwcmVzc2lvbihcblx0ZXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHVua25vd24+IHwgdW5rbm93blxuKTogZXhwcmVzc2lvbiBpcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248dW5rbm93bj4ge1xuXHRyZXR1cm4gKGV4cHJlc3Npb24gYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHVua25vd24+KT8uX3R5cGUgIT09IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGV4cHJlc3Npb24gb3IgdmFsdWUgcHJvdmlkZWQgaXMgY29uc3RhbnQgb3Igbm90LlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0YXJnZXQgdHlwZVxuICogQHBhcmFtICBtYXliZUNvbnN0YW50IFRoZSBleHByZXNzaW9uIG9yIHByaW1pdGl2ZSB2YWx1ZSB0aGF0IGlzIHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBjb25zdGFudFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDb25zdGFudDxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4obWF5YmVDb25zdGFudDogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+KTogbWF5YmVDb25zdGFudCBpcyBDb25zdGFudEV4cHJlc3Npb248VD4ge1xuXHRyZXR1cm4gdHlwZW9mIG1heWJlQ29uc3RhbnQgIT09IFwib2JqZWN0XCIgfHwgKG1heWJlQ29uc3RhbnQgYXMgQmFzZUV4cHJlc3Npb248VD4pLl90eXBlID09PSBcIkNvbnN0YW50XCI7XG59XG5cbmZ1bmN0aW9uIGlzVHJ1ZShleHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248UHJpbWl0aXZlVHlwZT4pIHtcblx0cmV0dXJuIGlzQ29uc3RhbnQoZXhwcmVzc2lvbikgJiYgZXhwcmVzc2lvbi52YWx1ZSA9PT0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gaXNGYWxzZShleHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248UHJpbWl0aXZlVHlwZT4pIHtcblx0cmV0dXJuIGlzQ29uc3RhbnQoZXhwcmVzc2lvbikgJiYgZXhwcmVzc2lvbi52YWx1ZSA9PT0gZmFsc2U7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBleHByZXNzaW9uIG9yIHZhbHVlIHByb3ZpZGVkIGlzIGEgcGF0aCBpbiBtb2RlbCBleHByZXNzaW9uIG9yIG5vdC5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdGFyZ2V0IHR5cGVcbiAqIEBwYXJhbSAgbWF5YmVCaW5kaW5nIFRoZSBleHByZXNzaW9uIG9yIHByaW1pdGl2ZSB2YWx1ZSB0aGF0IGlzIHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBhIHBhdGggaW4gbW9kZWwgZXhwcmVzc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb248VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHRtYXliZUJpbmRpbmc6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPlxuKTogbWF5YmVCaW5kaW5nIGlzIFBhdGhJbk1vZGVsRXhwcmVzc2lvbjxUPiB7XG5cdHJldHVybiAobWF5YmVCaW5kaW5nIGFzIEJhc2VFeHByZXNzaW9uPFQ+KT8uX3R5cGUgPT09IFwiUGF0aEluTW9kZWxcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGV4cHJlc3Npb24gb3IgdmFsdWUgcHJvdmlkZWQgaXMgYSBjb21wbGV4IHR5cGUgZXhwcmVzc2lvbi5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdGFyZ2V0IHR5cGVcbiAqIEBwYXJhbSAgbWF5YmVCaW5kaW5nIFRoZSBleHByZXNzaW9uIG9yIHByaW1pdGl2ZSB2YWx1ZSB0aGF0IGlzIHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBhIHBhdGggaW4gbW9kZWwgZXhwcmVzc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDb21wbGV4VHlwZUV4cHJlc3Npb248VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHRtYXliZUJpbmRpbmc6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPlxuKTogbWF5YmVCaW5kaW5nIGlzIENvbXBsZXhUeXBlRXhwcmVzc2lvbjxUPiB7XG5cdHJldHVybiAobWF5YmVCaW5kaW5nIGFzIEJhc2VFeHByZXNzaW9uPFQ+KT8uX3R5cGUgPT09IFwiQ29tcGxleFR5cGVcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGV4cHJlc3Npb24gb3IgdmFsdWUgcHJvdmlkZWQgaXMgYSBjb25jYXQgZXhwcmVzc2lvbiBvciBub3QuXG4gKlxuICogQHBhcmFtIGV4cHJlc3Npb25cbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgZXhwcmVzc2lvbiBpcyBhIENvbmNhdEV4cHJlc3Npb25cbiAqL1xuZnVuY3Rpb24gaXNDb25jYXRFeHByZXNzaW9uKGV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxQcmltaXRpdmVUeXBlPik6IGV4cHJlc3Npb24gaXMgQ29uY2F0RXhwcmVzc2lvbiB7XG5cdHJldHVybiAoZXhwcmVzc2lvbiBhcyBCYXNlRXhwcmVzc2lvbjxQcmltaXRpdmVUeXBlPik/Ll90eXBlID09PSBcIkNvbmNhdFwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZXhwcmVzc2lvbiBwcm92aWRlZCBpcyBhIGNvbXBhcmlzb24gb3Igbm90LlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0YXJnZXQgdHlwZVxuICogQHBhcmFtIGV4cHJlc3Npb24gVGhlIGV4cHJlc3Npb25cbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgZXhwcmVzc2lvbiBpcyBhIENvbXBhcmlzb25FeHByZXNzaW9uXG4gKi9cbmZ1bmN0aW9uIGlzQ29tcGFyaXNvbjxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oZXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+KTogZXhwcmVzc2lvbiBpcyBDb21wYXJpc29uRXhwcmVzc2lvbiB7XG5cdHJldHVybiBleHByZXNzaW9uLl90eXBlID09PSBcIkNvbXBhcmlzb25cIjtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgaW5wdXQgcGFyYW1ldGVyIGlzIGEgY29uc3RhbnQgZXhwcmVzc2lvbiBvZiB0eXBlIHVuZGVmaW5lZC5cbiAqXG4gKiBAcGFyYW0gZXhwcmVzc2lvbiBUaGUgaW5wdXQgZXhwcmVzc2lvbiBvciBvYmplY3QgaW4gZ2VuZXJhbFxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpbnB1dCBpcyBjb25zdGFudCB3aGljaCBoYXMgdW5kZWZpbmVkIGZvciB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNVbmRlZmluZWRFeHByZXNzaW9uKGV4cHJlc3Npb246IHVua25vd24pOiBib29sZWFuIHtcblx0Y29uc3QgZXhwcmVzc2lvbkFzRXhwcmVzc2lvbiA9IGV4cHJlc3Npb24gYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHVua25vd24+O1xuXHRyZXR1cm4gZXhwcmVzc2lvbkFzRXhwcmVzc2lvbj8uX3R5cGUgPT09IFwiQ29uc3RhbnRcIiAmJiBleHByZXNzaW9uQXNFeHByZXNzaW9uPy52YWx1ZSA9PT0gdW5kZWZpbmVkO1xufVxuXG50eXBlIENvbXBsZXhBbm5vdGF0aW9uRXhwcmVzc2lvbjxQPiA9XG5cdHwgUGF0aEFubm90YXRpb25FeHByZXNzaW9uPFA+XG5cdHwgQXBwbHlBbm5vdGF0aW9uRXhwcmVzc2lvbjxQPlxuXHR8IElmQW5ub3RhdGlvbkV4cHJlc3Npb248UD5cblx0fCBPckFubm90YXRpb25FeHByZXNzaW9uPFA+XG5cdHwgQW5kQW5ub3RhdGlvbkV4cHJlc3Npb248UD5cblx0fCBOZUFubm90YXRpb25FeHByZXNzaW9uPFA+XG5cdHwgRXFBbm5vdGF0aW9uRXhwcmVzc2lvbjxQPlxuXHR8IE5vdEFubm90YXRpb25FeHByZXNzaW9uPFA+XG5cdHwgR3RBbm5vdGF0aW9uRXhwcmVzc2lvbjxQPlxuXHR8IEdlQW5ub3RhdGlvbkV4cHJlc3Npb248UD5cblx0fCBMZUFubm90YXRpb25FeHByZXNzaW9uPFA+XG5cdHwgTHRBbm5vdGF0aW9uRXhwcmVzc2lvbjxQPjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmVPYmplY3Qob2JqZWN0VHlwZTogb2JqZWN0KTogYm9vbGVhbiB7XG5cdHN3aXRjaCAob2JqZWN0VHlwZS5jb25zdHJ1Y3Rvci5uYW1lKSB7XG5cdFx0Y2FzZSBcIlN0cmluZ1wiOlxuXHRcdGNhc2UgXCJOdW1iZXJcIjpcblx0XHRjYXNlIFwiQm9vbGVhblwiOlxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuLyoqXG4gKiBDaGVjayBpZiB0aGUgcGFzc2VkIGFubm90YXRpb24gYW5ub3RhdGlvblZhbHVlIGlzIGEgQ29tcGxleEFubm90YXRpb25FeHByZXNzaW9uLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0YXJnZXQgdHlwZVxuICogQHBhcmFtICBhbm5vdGF0aW9uVmFsdWUgVGhlIGFubm90YXRpb24gYW5ub3RhdGlvblZhbHVlIHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9iamVjdCBpcyBhIHtDb21wbGV4QW5ub3RhdGlvbkV4cHJlc3Npb259XG4gKi9cbmZ1bmN0aW9uIGlzQ29tcGxleEFubm90YXRpb25FeHByZXNzaW9uPFQ+KGFubm90YXRpb25WYWx1ZTogUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8VD4pOiBhbm5vdGF0aW9uVmFsdWUgaXMgQ29tcGxleEFubm90YXRpb25FeHByZXNzaW9uPFQ+IHtcblx0cmV0dXJuIHR5cGVvZiBhbm5vdGF0aW9uVmFsdWUgPT09IFwib2JqZWN0XCIgJiYgIWlzUHJpbWl0aXZlT2JqZWN0KGFubm90YXRpb25WYWx1ZSBhcyBvYmplY3QpO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIHRoZSBjb3JyZXNwb25kaW5nIGFubm90YXRpb25WYWx1ZSBmb3IgYSBnaXZlbiBhbm5vdGF0aW9uIGFubm90YXRpb25WYWx1ZS5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdGFyZ2V0IHR5cGVcbiAqIEBwYXJhbSBhbm5vdGF0aW9uVmFsdWUgVGhlIHNvdXJjZSBhbm5vdGF0aW9uIGFubm90YXRpb25WYWx1ZVxuICogQHBhcmFtIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMgVGhlIHBhdGggZnJvbSB0aGUgcm9vdCBlbnRpdHkgc2V0XG4gKiBAcGFyYW0gZGVmYXVsdFZhbHVlIERlZmF1bHQgdmFsdWUgaWYgdGhlIGFubm90YXRpb25WYWx1ZSBpcyB1bmRlZmluZWRcbiAqIEBwYXJhbSBwYXRoVmlzaXRvciBBIGZ1bmN0aW9uIHRvIG1vZGlmeSB0aGUgcmVzdWx0aW5nIHBhdGhcbiAqIEByZXR1cm5zIFRoZSBhbm5vdGF0aW9uVmFsdWUgZXF1aXZhbGVudCB0byB0aGF0IGFubm90YXRpb24gYW5ub3RhdGlvblZhbHVlXG4gKiBAZGVwcmVjYXRlZCB1c2UgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIGluc3RlYWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFubm90YXRpb25FeHByZXNzaW9uPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihcblx0YW5ub3RhdGlvblZhbHVlOiBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZTxUPixcblx0dmlzaXRlZE5hdmlnYXRpb25QYXRoczogc3RyaW5nW10gPSBbXSxcblx0ZGVmYXVsdFZhbHVlPzogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+LFxuXHRwYXRoVmlzaXRvcj86IEZ1bmN0aW9uXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248UHJpbWl0aXZlVHlwZUNhc3Q8VD4+IHtcblx0cmV0dXJuIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihhbm5vdGF0aW9uVmFsdWUsIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIGRlZmF1bHRWYWx1ZSwgcGF0aFZpc2l0b3IpO1xufVxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgY29ycmVzcG9uZGluZyBhbm5vdGF0aW9uVmFsdWUgZm9yIGEgZ2l2ZW4gYW5ub3RhdGlvbiBhbm5vdGF0aW9uVmFsdWUuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHRhcmdldCB0eXBlXG4gKiBAcGFyYW0gYW5ub3RhdGlvblZhbHVlIFRoZSBzb3VyY2UgYW5ub3RhdGlvbiBhbm5vdGF0aW9uVmFsdWVcbiAqIEBwYXJhbSB2aXNpdGVkTmF2aWdhdGlvblBhdGhzIFRoZSBwYXRoIGZyb20gdGhlIHJvb3QgZW50aXR5IHNldFxuICogQHBhcmFtIGRlZmF1bHRWYWx1ZSBEZWZhdWx0IHZhbHVlIGlmIHRoZSBhbm5vdGF0aW9uVmFsdWUgaXMgdW5kZWZpbmVkXG4gKiBAcGFyYW0gcGF0aFZpc2l0b3IgQSBmdW5jdGlvbiB0byBtb2RpZnkgdGhlIHJlc3VsdGluZyBwYXRoXG4gKiBAcmV0dXJucyBUaGUgYW5ub3RhdGlvblZhbHVlIGVxdWl2YWxlbnQgdG8gdGhhdCBhbm5vdGF0aW9uIGFubm90YXRpb25WYWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihcblx0YW5ub3RhdGlvblZhbHVlOiBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZTxUPixcblx0dmlzaXRlZE5hdmlnYXRpb25QYXRoczogc3RyaW5nW10gPSBbXSxcblx0ZGVmYXVsdFZhbHVlPzogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+LFxuXHRwYXRoVmlzaXRvcj86IEZ1bmN0aW9uXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248UHJpbWl0aXZlVHlwZUNhc3Q8VD4+IHtcblx0aWYgKGFubm90YXRpb25WYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIHdyYXBQcmltaXRpdmUoZGVmYXVsdFZhbHVlIGFzIFQpO1xuXHR9XG5cdGFubm90YXRpb25WYWx1ZSA9IGFubm90YXRpb25WYWx1ZT8udmFsdWVPZigpIGFzIFByb3BlcnR5QW5ub3RhdGlvblZhbHVlPFQ+O1xuXHRpZiAoIWlzQ29tcGxleEFubm90YXRpb25FeHByZXNzaW9uKGFubm90YXRpb25WYWx1ZSkpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQoYW5ub3RhdGlvblZhbHVlKTtcblx0fVxuXG5cdHN3aXRjaCAoYW5ub3RhdGlvblZhbHVlLnR5cGUpIHtcblx0XHRjYXNlIFwiUGF0aFwiOlxuXHRcdFx0cmV0dXJuIHBhdGhJbk1vZGVsKGFubm90YXRpb25WYWx1ZS5wYXRoLCB1bmRlZmluZWQsIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKTtcblx0XHRjYXNlIFwiSWZcIjpcblx0XHRcdHJldHVybiBhbm5vdGF0aW9uSWZFeHByZXNzaW9uKGFubm90YXRpb25WYWx1ZS5JZiwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpO1xuXHRcdGNhc2UgXCJOb3RcIjpcblx0XHRcdHJldHVybiBub3QocGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKGFubm90YXRpb25WYWx1ZS5Ob3QsIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKSkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHRcdGNhc2UgXCJFcVwiOlxuXHRcdFx0cmV0dXJuIGVxdWFsKFxuXHRcdFx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oYW5ub3RhdGlvblZhbHVlLkVxWzBdLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvciksXG5cdFx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbihhbm5vdGF0aW9uVmFsdWUuRXFbMV0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKVxuXHRcdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdFx0Y2FzZSBcIk5lXCI6XG5cdFx0XHRyZXR1cm4gbm90RXF1YWwoXG5cdFx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbihhbm5vdGF0aW9uVmFsdWUuTmVbMF0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKSxcblx0XHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKGFubm90YXRpb25WYWx1ZS5OZVsxXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpXG5cdFx0XHQpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0XHRjYXNlIFwiR3RcIjpcblx0XHRcdHJldHVybiBncmVhdGVyVGhhbihcblx0XHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKGFubm90YXRpb25WYWx1ZS5HdFswXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpLFxuXHRcdFx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oYW5ub3RhdGlvblZhbHVlLkd0WzFdLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvcilcblx0XHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHRcdGNhc2UgXCJHZVwiOlxuXHRcdFx0cmV0dXJuIGdyZWF0ZXJPckVxdWFsKFxuXHRcdFx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oYW5ub3RhdGlvblZhbHVlLkdlWzBdLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvciksXG5cdFx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbihhbm5vdGF0aW9uVmFsdWUuR2VbMV0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKVxuXHRcdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdFx0Y2FzZSBcIkx0XCI6XG5cdFx0XHRyZXR1cm4gbGVzc1RoYW4oXG5cdFx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbihhbm5vdGF0aW9uVmFsdWUuTHRbMF0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKSxcblx0XHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKGFubm90YXRpb25WYWx1ZS5MdFsxXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpXG5cdFx0XHQpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0XHRjYXNlIFwiTGVcIjpcblx0XHRcdHJldHVybiBsZXNzT3JFcXVhbChcblx0XHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKGFubm90YXRpb25WYWx1ZS5MZVswXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpLFxuXHRcdFx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oYW5ub3RhdGlvblZhbHVlLkxlWzFdLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvcilcblx0XHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHRcdGNhc2UgXCJPclwiOlxuXHRcdFx0cmV0dXJuIG9yKFxuXHRcdFx0XHQuLi5hbm5vdGF0aW9uVmFsdWUuT3IubWFwKGZ1bmN0aW9uIChvckNvbmRpdGlvbikge1xuXHRcdFx0XHRcdHJldHVybiBwYXJzZUFubm90YXRpb25Db25kaXRpb248Ym9vbGVhbj4ob3JDb25kaXRpb24sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKTtcblx0XHRcdFx0fSlcblx0XHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHRcdGNhc2UgXCJBbmRcIjpcblx0XHRcdHJldHVybiBhbmQoXG5cdFx0XHRcdC4uLmFubm90YXRpb25WYWx1ZS5BbmQubWFwKGZ1bmN0aW9uIChhbmRDb25kaXRpb24pIHtcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uPGJvb2xlYW4+KGFuZENvbmRpdGlvbiwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpO1xuXHRcdFx0XHR9KVxuXHRcdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdFx0Y2FzZSBcIkFwcGx5XCI6XG5cdFx0XHRyZXR1cm4gYW5ub3RhdGlvbkFwcGx5RXhwcmVzc2lvbihcblx0XHRcdFx0YW5ub3RhdGlvblZhbHVlIGFzIEFwcGx5QW5ub3RhdGlvbkV4cHJlc3Npb248c3RyaW5nPixcblx0XHRcdFx0dmlzaXRlZE5hdmlnYXRpb25QYXRocyxcblx0XHRcdFx0cGF0aFZpc2l0b3Jcblx0XHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHR9XG5cdHJldHVybiB1bnJlc29sdmFibGVFeHByZXNzaW9uO1xufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBhbm5vdGF0aW9uIGNvbmRpdGlvbiBpbnRvIGFuIGV4cHJlc3Npb24uXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHRhcmdldCB0eXBlXG4gKiBAcGFyYW0gYW5ub3RhdGlvblZhbHVlIFRoZSBjb25kaXRpb24gb3IgdmFsdWUgZnJvbSB0aGUgYW5ub3RhdGlvblxuICogQHBhcmFtIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMgVGhlIHBhdGggZnJvbSB0aGUgcm9vdCBlbnRpdHkgc2V0XG4gKiBAcGFyYW0gcGF0aFZpc2l0b3IgQSBmdW5jdGlvbiB0byBtb2RpZnkgdGhlIHJlc3VsdGluZyBwYXRoXG4gKiBAcmV0dXJucyBBbiBlcXVpdmFsZW50IGV4cHJlc3Npb25cbiAqL1xuZnVuY3Rpb24gcGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihcblx0YW5ub3RhdGlvblZhbHVlOiBDb25kaXRpb25hbENoZWNrT3JWYWx1ZSxcblx0dmlzaXRlZE5hdmlnYXRpb25QYXRoczogc3RyaW5nW10gPSBbXSxcblx0cGF0aFZpc2l0b3I/OiBGdW5jdGlvblxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+IHtcblx0aWYgKGFubm90YXRpb25WYWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgYW5ub3RhdGlvblZhbHVlICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0cmV0dXJuIGNvbnN0YW50KGFubm90YXRpb25WYWx1ZSBhcyBUKTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uVmFsdWUuaGFzT3duUHJvcGVydHkoXCIkT3JcIikpIHtcblx0XHRyZXR1cm4gb3IoXG5cdFx0XHQuLi4oKGFubm90YXRpb25WYWx1ZSBhcyBPckNvbmRpdGlvbmFsRXhwcmVzc2lvbikuJE9yLm1hcChmdW5jdGlvbiAob3JDb25kaXRpb24pIHtcblx0XHRcdFx0cmV0dXJuIHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbihvckNvbmRpdGlvbiwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpO1xuXHRcdFx0fSkgYXMgdW5rbm93biBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSlcblx0XHQpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uVmFsdWUuaGFzT3duUHJvcGVydHkoXCIkQW5kXCIpKSB7XG5cdFx0cmV0dXJuIGFuZChcblx0XHRcdC4uLigoYW5ub3RhdGlvblZhbHVlIGFzIEFuZENvbmRpdGlvbmFsRXhwcmVzc2lvbikuJEFuZC5tYXAoZnVuY3Rpb24gKGFuZENvbmRpdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKGFuZENvbmRpdGlvbiwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpO1xuXHRcdFx0fSkgYXMgdW5rbm93biBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSlcblx0XHQpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uVmFsdWUuaGFzT3duUHJvcGVydHkoXCIkTm90XCIpKSB7XG5cdFx0cmV0dXJuIG5vdChcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIE5vdENvbmRpdGlvbmFsRXhwcmVzc2lvbikuJE5vdCwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpXG5cdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJEVxXCIpKSB7XG5cdFx0cmV0dXJuIGVxdWFsKFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgRXFDb25kaXRpb25hbEV4cHJlc3Npb24pLiRFcVswXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpLFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgRXFDb25kaXRpb25hbEV4cHJlc3Npb24pLiRFcVsxXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpXG5cdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJE5lXCIpKSB7XG5cdFx0cmV0dXJuIG5vdEVxdWFsKFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgTmVDb25kaXRpb25hbEV4cHJlc3Npb24pLiROZVswXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpLFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgTmVDb25kaXRpb25hbEV4cHJlc3Npb24pLiROZVsxXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpXG5cdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJEd0XCIpKSB7XG5cdFx0cmV0dXJuIGdyZWF0ZXJUaGFuKFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgR3RDb25kaXRpb25hbEV4cHJlc3Npb24pLiRHdFswXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpLFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgR3RDb25kaXRpb25hbEV4cHJlc3Npb24pLiRHdFsxXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpXG5cdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJEdlXCIpKSB7XG5cdFx0cmV0dXJuIGdyZWF0ZXJPckVxdWFsKFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgR2VDb25kaXRpb25hbEV4cHJlc3Npb24pLiRHZVswXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpLFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgR2VDb25kaXRpb25hbEV4cHJlc3Npb24pLiRHZVsxXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpXG5cdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJEx0XCIpKSB7XG5cdFx0cmV0dXJuIGxlc3NUaGFuKFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgTHRDb25kaXRpb25hbEV4cHJlc3Npb24pLiRMdFswXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpLFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgTHRDb25kaXRpb25hbEV4cHJlc3Npb24pLiRMdFsxXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpXG5cdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJExlXCIpKSB7XG5cdFx0cmV0dXJuIGxlc3NPckVxdWFsKFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgTGVDb25kaXRpb25hbEV4cHJlc3Npb24pLiRMZVswXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpLFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgTGVDb25kaXRpb25hbEV4cHJlc3Npb24pLiRMZVsxXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpXG5cdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJFBhdGhcIikpIHtcblx0XHRyZXR1cm4gcGF0aEluTW9kZWwoKGFubm90YXRpb25WYWx1ZSBhcyBQYXRoQ29uZGl0aW9uRXhwcmVzc2lvbjxUPikuJFBhdGgsIHVuZGVmaW5lZCwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpO1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25WYWx1ZS5oYXNPd25Qcm9wZXJ0eShcIiRBcHBseVwiKSkge1xuXHRcdHJldHVybiBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHR7XG5cdFx0XHRcdHR5cGU6IFwiQXBwbHlcIixcblx0XHRcdFx0RnVuY3Rpb246IChhbm5vdGF0aW9uVmFsdWUgYXMgYW55KS4kRnVuY3Rpb24sXG5cdFx0XHRcdEFwcGx5OiAoYW5ub3RhdGlvblZhbHVlIGFzIGFueSkuJEFwcGx5XG5cdFx0XHR9IGFzIFQsXG5cdFx0XHR2aXNpdGVkTmF2aWdhdGlvblBhdGhzLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0cGF0aFZpc2l0b3Jcblx0XHQpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uVmFsdWUuaGFzT3duUHJvcGVydHkoXCIkSWZcIikpIHtcblx0XHRyZXR1cm4gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKFxuXHRcdFx0e1xuXHRcdFx0XHR0eXBlOiBcIklmXCIsXG5cdFx0XHRcdElmOiAoYW5ub3RhdGlvblZhbHVlIGFzIGFueSkuJElmXG5cdFx0XHR9IGFzIFQsXG5cdFx0XHR2aXNpdGVkTmF2aWdhdGlvblBhdGhzLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0cGF0aFZpc2l0b3Jcblx0XHQpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uVmFsdWUuaGFzT3duUHJvcGVydHkoXCIkRW51bU1lbWJlclwiKSkge1xuXHRcdHJldHVybiBjb25zdGFudChyZXNvbHZlRW51bVZhbHVlKChhbm5vdGF0aW9uVmFsdWUgYXMgYW55KS4kRW51bU1lbWJlcikgYXMgVCk7XG5cdH1cblx0cmV0dXJuIGNvbnN0YW50KGZhbHNlIGFzIFQpO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgdGhlIHtJZkFubm90YXRpb25FeHByZXNzaW9uVmFsdWV9IGludG8gYW4gZXhwcmVzc2lvbi5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdGFyZ2V0IHR5cGVcbiAqIEBwYXJhbSBhbm5vdGF0aW9uVmFsdWUgQW4gSWYgZXhwcmVzc2lvbiByZXR1cm5pbmcgdGhlIHR5cGUgVFxuICogQHBhcmFtIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMgVGhlIHBhdGggZnJvbSB0aGUgcm9vdCBlbnRpdHkgc2V0XG4gKiBAcGFyYW0gcGF0aFZpc2l0b3IgQSBmdW5jdGlvbiB0byBtb2RpZnkgdGhlIHJlc3VsdGluZyBwYXRoXG4gKiBAcmV0dXJucyBUaGUgZXF1aXZhbGVudCBpZkVsc2UgZXhwcmVzc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5ub3RhdGlvbklmRXhwcmVzc2lvbjxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdGFubm90YXRpb25WYWx1ZTogSWZBbm5vdGF0aW9uRXhwcmVzc2lvblZhbHVlPFQ+LFxuXHR2aXNpdGVkTmF2aWdhdGlvblBhdGhzOiBzdHJpbmdbXSA9IFtdLFxuXHRwYXRoVmlzaXRvcj86IEZ1bmN0aW9uXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD4ge1xuXHRyZXR1cm4gaWZFbHNlKFxuXHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbihhbm5vdGF0aW9uVmFsdWVbMF0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKSxcblx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oYW5ub3RhdGlvblZhbHVlWzFdIGFzIGFueSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpLFxuXHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbihhbm5vdGF0aW9uVmFsdWVbMl0gYXMgYW55LCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvcilcblx0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFubm90YXRpb25BcHBseUV4cHJlc3Npb24oXG5cdGFwcGx5RXhwcmVzc2lvbjogQXBwbHlBbm5vdGF0aW9uRXhwcmVzc2lvbjxzdHJpbmc+LFxuXHR2aXNpdGVkTmF2aWdhdGlvblBhdGhzOiBzdHJpbmdbXSA9IFtdLFxuXHRwYXRoVmlzaXRvcj86IEZ1bmN0aW9uXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB7XG5cdHN3aXRjaCAoYXBwbHlFeHByZXNzaW9uLkZ1bmN0aW9uKSB7XG5cdFx0Y2FzZSBcIm9kYXRhLmNvbmNhdFwiOlxuXHRcdFx0cmV0dXJuIGNvbmNhdChcblx0XHRcdFx0Li4uYXBwbHlFeHByZXNzaW9uLkFwcGx5Lm1hcCgoYXBwbHlQYXJhbTogYW55KSA9PiB7XG5cdFx0XHRcdFx0bGV0IGFwcGx5UGFyYW1Db252ZXJ0ZWQgPSBhcHBseVBhcmFtO1xuXHRcdFx0XHRcdGlmIChhcHBseVBhcmFtLmhhc093blByb3BlcnR5KFwiJFBhdGhcIikpIHtcblx0XHRcdFx0XHRcdGFwcGx5UGFyYW1Db252ZXJ0ZWQgPSB7XG5cdFx0XHRcdFx0XHRcdHR5cGU6IFwiUGF0aFwiLFxuXHRcdFx0XHRcdFx0XHRwYXRoOiBhcHBseVBhcmFtLiRQYXRoXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoYXBwbHlQYXJhbS5oYXNPd25Qcm9wZXJ0eShcIiRJZlwiKSkge1xuXHRcdFx0XHRcdFx0YXBwbHlQYXJhbUNvbnZlcnRlZCA9IHtcblx0XHRcdFx0XHRcdFx0dHlwZTogXCJJZlwiLFxuXHRcdFx0XHRcdFx0XHRJZjogYXBwbHlQYXJhbS4kSWZcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChhcHBseVBhcmFtLmhhc093blByb3BlcnR5KFwiJEFwcGx5XCIpKSB7XG5cdFx0XHRcdFx0XHRhcHBseVBhcmFtQ29udmVydGVkID0ge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBcIkFwcGx5XCIsXG5cdFx0XHRcdFx0XHRcdEZ1bmN0aW9uOiBhcHBseVBhcmFtLiRGdW5jdGlvbixcblx0XHRcdFx0XHRcdFx0QXBwbHk6IGFwcGx5UGFyYW0uJEFwcGx5XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGFwcGx5UGFyYW1Db252ZXJ0ZWQsIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHVuZGVmaW5lZCwgcGF0aFZpc2l0b3IpO1xuXHRcdFx0XHR9KVxuXHRcdFx0KTtcblx0fVxuXHRyZXR1cm4gdW5yZXNvbHZhYmxlRXhwcmVzc2lvbjtcbn1cblxuLyoqXG4gKiBHZW5lcmljIGhlbHBlciBmb3IgdGhlIGNvbXBhcmlzb24gb3BlcmF0aW9ucyAoZXF1YWwsIG5vdEVxdWFsLCAuLi4pLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0YXJnZXQgdHlwZVxuICogQHBhcmFtIG9wZXJhdG9yIFRoZSBvcGVyYXRvciB0byBhcHBseVxuICogQHBhcmFtIGxlZnRPcGVyYW5kIFRoZSBvcGVyYW5kIG9uIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIG9wZXJhdG9yXG4gKiBAcGFyYW0gcmlnaHRPcGVyYW5kIFRoZSBvcGVyYW5kIG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSBvcGVyYXRvclxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgdGhlIGNvbXBhcmlzb25cbiAqL1xuZnVuY3Rpb24gY29tcGFyaXNvbjxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdG9wZXJhdG9yOiBDb21wYXJpc29uT3BlcmF0b3IsXG5cdGxlZnRPcGVyYW5kOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8VD4sXG5cdHJpZ2h0T3BlcmFuZDogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRjb25zdCBsZWZ0RXhwcmVzc2lvbiA9IHdyYXBQcmltaXRpdmUobGVmdE9wZXJhbmQpO1xuXHRjb25zdCByaWdodEV4cHJlc3Npb24gPSB3cmFwUHJpbWl0aXZlKHJpZ2h0T3BlcmFuZCk7XG5cdGlmIChoYXNVbnJlc29sdmFibGVFeHByZXNzaW9uKGxlZnRFeHByZXNzaW9uLCByaWdodEV4cHJlc3Npb24pKSB7XG5cdFx0cmV0dXJuIHVucmVzb2x2YWJsZUV4cHJlc3Npb247XG5cdH1cblx0aWYgKGlzQ29uc3RhbnQobGVmdEV4cHJlc3Npb24pICYmIGlzQ29uc3RhbnQocmlnaHRFeHByZXNzaW9uKSkge1xuXHRcdHN3aXRjaCAob3BlcmF0b3IpIHtcblx0XHRcdGNhc2UgXCIhPT1cIjpcblx0XHRcdFx0cmV0dXJuIGNvbnN0YW50KGxlZnRFeHByZXNzaW9uLnZhbHVlICE9PSByaWdodEV4cHJlc3Npb24udmFsdWUpO1xuXHRcdFx0Y2FzZSBcIj09PVwiOlxuXHRcdFx0XHRyZXR1cm4gY29uc3RhbnQobGVmdEV4cHJlc3Npb24udmFsdWUgPT09IHJpZ2h0RXhwcmVzc2lvbi52YWx1ZSk7XG5cdFx0XHRjYXNlIFwiPFwiOlxuXHRcdFx0XHRyZXR1cm4gY29uc3RhbnQobGVmdEV4cHJlc3Npb24udmFsdWUgPCByaWdodEV4cHJlc3Npb24udmFsdWUpO1xuXHRcdFx0Y2FzZSBcIjw9XCI6XG5cdFx0XHRcdHJldHVybiBjb25zdGFudChsZWZ0RXhwcmVzc2lvbi52YWx1ZSA8PSByaWdodEV4cHJlc3Npb24udmFsdWUpO1xuXHRcdFx0Y2FzZSBcIj5cIjpcblx0XHRcdFx0cmV0dXJuIGNvbnN0YW50KGxlZnRFeHByZXNzaW9uLnZhbHVlID4gcmlnaHRFeHByZXNzaW9uLnZhbHVlKTtcblx0XHRcdGNhc2UgXCI+PVwiOlxuXHRcdFx0XHRyZXR1cm4gY29uc3RhbnQobGVmdEV4cHJlc3Npb24udmFsdWUgPj0gcmlnaHRFeHByZXNzaW9uLnZhbHVlKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdF90eXBlOiBcIkNvbXBhcmlzb25cIixcblx0XHRcdG9wZXJhdG9yOiBvcGVyYXRvcixcblx0XHRcdG9wZXJhbmQxOiBsZWZ0RXhwcmVzc2lvbixcblx0XHRcdG9wZXJhbmQyOiByaWdodEV4cHJlc3Npb25cblx0XHR9O1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoZXhwcmVzc2lvbjogUGF0aEluTW9kZWxFeHByZXNzaW9uPGFueT4gfCBVbnJlc29sdmFibGVQYXRoRXhwcmVzc2lvbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxudW1iZXI+IHtcblx0aWYgKGV4cHJlc3Npb24uX3R5cGUgPT09IFwiVW5yZXNvbHZhYmxlXCIpIHtcblx0XHRyZXR1cm4gZXhwcmVzc2lvbjtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdF90eXBlOiBcIkxlbmd0aFwiLFxuXHRcdHBhdGhJbk1vZGVsOiBleHByZXNzaW9uXG5cdH07XG59XG5cbi8qKlxuICogQ29tcGFyaXNvbjogXCJlcXVhbFwiICg9PT0pLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0YXJnZXQgdHlwZVxuICogQHBhcmFtIGxlZnRPcGVyYW5kIFRoZSBvcGVyYW5kIG9uIHRoZSBsZWZ0IHNpZGVcbiAqIEBwYXJhbSByaWdodE9wZXJhbmQgVGhlIG9wZXJhbmQgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGNvbXBhcmlzb25cbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSBjb21wYXJpc29uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbDxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdGxlZnRPcGVyYW5kOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8VD4sXG5cdHJpZ2h0T3BlcmFuZDogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRjb25zdCBsZWZ0RXhwcmVzc2lvbiA9IHdyYXBQcmltaXRpdmUobGVmdE9wZXJhbmQpO1xuXHRjb25zdCByaWdodEV4cHJlc3Npb24gPSB3cmFwUHJpbWl0aXZlKHJpZ2h0T3BlcmFuZCk7XG5cdGlmIChoYXNVbnJlc29sdmFibGVFeHByZXNzaW9uKGxlZnRFeHByZXNzaW9uLCByaWdodEV4cHJlc3Npb24pKSB7XG5cdFx0cmV0dXJuIHVucmVzb2x2YWJsZUV4cHJlc3Npb247XG5cdH1cblx0aWYgKF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwobGVmdEV4cHJlc3Npb24sIHJpZ2h0RXhwcmVzc2lvbikpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQodHJ1ZSk7XG5cdH1cblxuXHRmdW5jdGlvbiByZWR1Y2UobGVmdDogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+LCByaWdodDogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+KSB7XG5cdFx0aWYgKGxlZnQuX3R5cGUgPT09IFwiQ29tcGFyaXNvblwiICYmIGlzVHJ1ZShyaWdodCkpIHtcblx0XHRcdC8vIGNvbXBhcmUoYSwgYikgPT09IHRydWUgfn4+IGNvbXBhcmUoYSwgYilcblx0XHRcdHJldHVybiBsZWZ0O1xuXHRcdH0gZWxzZSBpZiAobGVmdC5fdHlwZSA9PT0gXCJDb21wYXJpc29uXCIgJiYgaXNGYWxzZShyaWdodCkpIHtcblx0XHRcdC8vIGNvbXBhcmUoYSwgYikgPT09IGZhbHNlIH5+PiAhY29tcGFyZShhLCBiKVxuXHRcdFx0cmV0dXJuIG5vdChsZWZ0KTtcblx0XHR9IGVsc2UgaWYgKGxlZnQuX3R5cGUgPT09IFwiSWZFbHNlXCIgJiYgX2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChsZWZ0Lm9uVHJ1ZSwgcmlnaHQpKSB7XG5cdFx0XHQvLyAoaWYgKHgpIHsgYSB9IGVsc2UgeyBiIH0pID09PSBhIH5+PiB4IHx8IChiID09PSBhKVxuXHRcdFx0cmV0dXJuIG9yKGxlZnQuY29uZGl0aW9uLCBlcXVhbChsZWZ0Lm9uRmFsc2UsIHJpZ2h0KSk7XG5cdFx0fSBlbHNlIGlmIChsZWZ0Ll90eXBlID09PSBcIklmRWxzZVwiICYmIF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwobGVmdC5vbkZhbHNlLCByaWdodCkpIHtcblx0XHRcdC8vIChpZiAoeCkgeyBhIH0gZWxzZSB7IGIgfSkgPT09IGIgfn4+ICF4IHx8IChhID09PSBiKVxuXHRcdFx0cmV0dXJuIG9yKG5vdChsZWZ0LmNvbmRpdGlvbiksIGVxdWFsKGxlZnQub25UcnVlLCByaWdodCkpO1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRsZWZ0Ll90eXBlID09PSBcIklmRWxzZVwiICYmXG5cdFx0XHRpc0NvbnN0YW50KGxlZnQub25UcnVlKSAmJlxuXHRcdFx0aXNDb25zdGFudChsZWZ0Lm9uRmFsc2UpICYmXG5cdFx0XHRpc0NvbnN0YW50KHJpZ2h0KSAmJlxuXHRcdFx0IV9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwobGVmdC5vblRydWUsIHJpZ2h0KSAmJlxuXHRcdFx0IV9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwobGVmdC5vbkZhbHNlLCByaWdodClcblx0XHQpIHtcblx0XHRcdHJldHVybiBjb25zdGFudChmYWxzZSk7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvLyBleHBsb2l0IHN5bW1ldHJ5OiBhID09PSBiIDx+PiBiID09PSBhXG5cdGNvbnN0IHJlZHVjZWQgPSByZWR1Y2UobGVmdEV4cHJlc3Npb24sIHJpZ2h0RXhwcmVzc2lvbikgPz8gcmVkdWNlKHJpZ2h0RXhwcmVzc2lvbiwgbGVmdEV4cHJlc3Npb24pO1xuXHRyZXR1cm4gcmVkdWNlZCA/PyBjb21wYXJpc29uKFwiPT09XCIsIGxlZnRFeHByZXNzaW9uLCByaWdodEV4cHJlc3Npb24pO1xufVxuXG4vKipcbiAqIENvbXBhcmlzb246IFwibm90IGVxdWFsXCIgKCE9PSkuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHRhcmdldCB0eXBlXG4gKiBAcGFyYW0gbGVmdE9wZXJhbmQgVGhlIG9wZXJhbmQgb24gdGhlIGxlZnQgc2lkZVxuICogQHBhcmFtIHJpZ2h0T3BlcmFuZCBUaGUgb3BlcmFuZCBvbiB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgY29tcGFyaXNvblxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgdGhlIGNvbXBhcmlzb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vdEVxdWFsPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihcblx0bGVmdE9wZXJhbmQ6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPixcblx0cmlnaHRPcGVyYW5kOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8VD5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdHJldHVybiBub3QoZXF1YWwobGVmdE9wZXJhbmQsIHJpZ2h0T3BlcmFuZCkpO1xufVxuXG4vKipcbiAqIENvbXBhcmlzb246IFwiZ3JlYXRlciBvciBlcXVhbFwiICg+PSkuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHRhcmdldCB0eXBlXG4gKiBAcGFyYW0gbGVmdE9wZXJhbmQgVGhlIG9wZXJhbmQgb24gdGhlIGxlZnQgc2lkZVxuICogQHBhcmFtIHJpZ2h0T3BlcmFuZCBUaGUgb3BlcmFuZCBvbiB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgY29tcGFyaXNvblxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgdGhlIGNvbXBhcmlzb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyZWF0ZXJPckVxdWFsPFQgZXh0ZW5kcyBEZWZpbmVkUHJpbWl0aXZlVHlwZT4oXG5cdGxlZnRPcGVyYW5kOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8VD4sXG5cdHJpZ2h0T3BlcmFuZDogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gY29tcGFyaXNvbihcIj49XCIsIGxlZnRPcGVyYW5kLCByaWdodE9wZXJhbmQpO1xufVxuXG4vKipcbiAqIENvbXBhcmlzb246IFwiZ3JlYXRlciB0aGFuXCIgKD4pLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0YXJnZXQgdHlwZVxuICogQHBhcmFtIGxlZnRPcGVyYW5kIFRoZSBvcGVyYW5kIG9uIHRoZSBsZWZ0IHNpZGVcbiAqIEBwYXJhbSByaWdodE9wZXJhbmQgVGhlIG9wZXJhbmQgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGNvbXBhcmlzb25cbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSBjb21wYXJpc29uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncmVhdGVyVGhhbjxUIGV4dGVuZHMgRGVmaW5lZFByaW1pdGl2ZVR5cGU+KFxuXHRsZWZ0T3BlcmFuZDogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+LFxuXHRyaWdodE9wZXJhbmQ6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPlxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0cmV0dXJuIGNvbXBhcmlzb24oXCI+XCIsIGxlZnRPcGVyYW5kLCByaWdodE9wZXJhbmQpO1xufVxuXG4vKipcbiAqIENvbXBhcmlzb246IFwibGVzcyBvciBlcXVhbFwiICg8PSkuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHRhcmdldCB0eXBlXG4gKiBAcGFyYW0gbGVmdE9wZXJhbmQgVGhlIG9wZXJhbmQgb24gdGhlIGxlZnQgc2lkZVxuICogQHBhcmFtIHJpZ2h0T3BlcmFuZCBUaGUgb3BlcmFuZCBvbiB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgY29tcGFyaXNvblxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgdGhlIGNvbXBhcmlzb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlc3NPckVxdWFsPFQgZXh0ZW5kcyBEZWZpbmVkUHJpbWl0aXZlVHlwZT4oXG5cdGxlZnRPcGVyYW5kOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8VD4sXG5cdHJpZ2h0T3BlcmFuZDogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gY29tcGFyaXNvbihcIjw9XCIsIGxlZnRPcGVyYW5kLCByaWdodE9wZXJhbmQpO1xufVxuXG4vKipcbiAqIENvbXBhcmlzb246IFwibGVzcyB0aGFuXCIgKDwpLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0YXJnZXQgdHlwZVxuICogQHBhcmFtIGxlZnRPcGVyYW5kIFRoZSBvcGVyYW5kIG9uIHRoZSBsZWZ0IHNpZGVcbiAqIEBwYXJhbSByaWdodE9wZXJhbmQgVGhlIG9wZXJhbmQgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGNvbXBhcmlzb25cbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSBjb21wYXJpc29uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXNzVGhhbjxUIGV4dGVuZHMgRGVmaW5lZFByaW1pdGl2ZVR5cGU+KFxuXHRsZWZ0T3BlcmFuZDogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+LFxuXHRyaWdodE9wZXJhbmQ6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPlxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0cmV0dXJuIGNvbXBhcmlzb24oXCI8XCIsIGxlZnRPcGVyYW5kLCByaWdodE9wZXJhbmQpO1xufVxuXG4vKipcbiAqIElmLXRoZW4tZWxzZSBleHByZXNzaW9uLlxuICpcbiAqIEV2YWx1YXRlcyB0byBvblRydWUgaWYgdGhlIGNvbmRpdGlvbiBldmFsdWF0ZXMgdG8gdHJ1ZSwgZWxzZSBldmFsdWF0ZXMgdG8gb25GYWxzZS5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdGFyZ2V0IHR5cGVcbiAqIEBwYXJhbSBjb25kaXRpb24gVGhlIGNvbmRpdGlvbiB0byBldmFsdWF0ZVxuICogQHBhcmFtIG9uVHJ1ZSBFeHByZXNzaW9uIHJlc3VsdCBpZiB0aGUgY29uZGl0aW9uIGV2YWx1YXRlcyB0byB0cnVlXG4gKiBAcGFyYW0gb25GYWxzZSBFeHByZXNzaW9uIHJlc3VsdCBpZiB0aGUgY29uZGl0aW9uIGV2YWx1YXRlcyB0byBmYWxzZVxuICogQHJldHVybnMgVGhlIGV4cHJlc3Npb24gdGhhdCByZXByZXNlbnRzIHRoaXMgY29uZGl0aW9uYWwgY2hlY2tcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlmRWxzZTxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdGNvbmRpdGlvbjogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPGJvb2xlYW4+LFxuXHRvblRydWU6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPixcblx0b25GYWxzZTogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD4ge1xuXHRsZXQgY29uZGl0aW9uRXhwcmVzc2lvbiA9IHdyYXBQcmltaXRpdmUoY29uZGl0aW9uKTtcblx0bGV0IG9uVHJ1ZUV4cHJlc3Npb24gPSB3cmFwUHJpbWl0aXZlKG9uVHJ1ZSk7XG5cdGxldCBvbkZhbHNlRXhwcmVzc2lvbiA9IHdyYXBQcmltaXRpdmUob25GYWxzZSk7XG5cblx0aWYgKGhhc1VucmVzb2x2YWJsZUV4cHJlc3Npb24oY29uZGl0aW9uRXhwcmVzc2lvbiwgb25UcnVlRXhwcmVzc2lvbiwgb25GYWxzZUV4cHJlc3Npb24pKSB7XG5cdFx0cmV0dXJuIHVucmVzb2x2YWJsZUV4cHJlc3Npb247XG5cdH1cblx0Ly8gc3dhcCBicmFuY2hlcyBpZiB0aGUgY29uZGl0aW9uIGlzIGEgbmVnYXRpb25cblx0aWYgKGNvbmRpdGlvbkV4cHJlc3Npb24uX3R5cGUgPT09IFwiTm90XCIpIHtcblx0XHQvLyBpZkVsc2Uobm90KFgpLCBhLCBiKSAtLT4gaWZFbHNlKFgsIGIsIGEpXG5cdFx0W29uVHJ1ZUV4cHJlc3Npb24sIG9uRmFsc2VFeHByZXNzaW9uXSA9IFtvbkZhbHNlRXhwcmVzc2lvbiwgb25UcnVlRXhwcmVzc2lvbl07XG5cdFx0Y29uZGl0aW9uRXhwcmVzc2lvbiA9IG5vdChjb25kaXRpb25FeHByZXNzaW9uKTtcblx0fVxuXG5cdC8vIGlubGluZSBuZXN0ZWQgaWYtZWxzZSBleHByZXNzaW9uczogb25UcnVlIGJyYW5jaFxuXHQvLyBpZkVsc2UoWCwgaWZFbHNlKFgsIGEsIGIpLCBjKSA9PT4gaWZFbHNlKFgsIGEsIGMpXG5cdGlmIChvblRydWVFeHByZXNzaW9uLl90eXBlID09PSBcIklmRWxzZVwiICYmIF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwoY29uZGl0aW9uRXhwcmVzc2lvbiwgb25UcnVlRXhwcmVzc2lvbi5jb25kaXRpb24pKSB7XG5cdFx0b25UcnVlRXhwcmVzc2lvbiA9IG9uVHJ1ZUV4cHJlc3Npb24ub25UcnVlO1xuXHR9XG5cblx0Ly8gaW5saW5lIG5lc3RlZCBpZi1lbHNlIGV4cHJlc3Npb25zOiBvbkZhbHNlIGJyYW5jaFxuXHQvLyBpZkVsc2UoWCwgYSwgaWZFbHNlKFgsIGIsIGMpKSA9PT4gaWZFbHNlKFgsIGEsIGMpXG5cdGlmIChvbkZhbHNlRXhwcmVzc2lvbi5fdHlwZSA9PT0gXCJJZkVsc2VcIiAmJiBfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKGNvbmRpdGlvbkV4cHJlc3Npb24sIG9uRmFsc2VFeHByZXNzaW9uLmNvbmRpdGlvbikpIHtcblx0XHRvbkZhbHNlRXhwcmVzc2lvbiA9IG9uRmFsc2VFeHByZXNzaW9uLm9uRmFsc2U7XG5cdH1cblxuXHQvLyAoaWYgdHJ1ZSB0aGVuIGEgZWxzZSBiKSAgfn4+IGFcblx0Ly8gKGlmIGZhbHNlIHRoZW4gYSBlbHNlIGIpIH5+PiBiXG5cdGlmIChpc0NvbnN0YW50KGNvbmRpdGlvbkV4cHJlc3Npb24pKSB7XG5cdFx0cmV0dXJuIGNvbmRpdGlvbkV4cHJlc3Npb24udmFsdWUgPyBvblRydWVFeHByZXNzaW9uIDogb25GYWxzZUV4cHJlc3Npb247XG5cdH1cblxuXHQvLyBpZiAoaXNDb25zdGFudEJvb2xlYW4ob25UcnVlRXhwcmVzc2lvbikgfHwgaXNDb25zdGFudEJvb2xlYW4ob25GYWxzZUV4cHJlc3Npb24pKSB7XG5cdC8vIFx0cmV0dXJuIG9yKGFuZChjb25kaXRpb24sIG9uVHJ1ZUV4cHJlc3Npb24gYXMgRXhwcmVzc2lvbjxib29sZWFuPiksIGFuZChub3QoY29uZGl0aW9uKSwgb25GYWxzZUV4cHJlc3Npb24gYXMgRXhwcmVzc2lvbjxib29sZWFuPikpIGFzIEV4cHJlc3Npb248VD5cblx0Ly8gfVxuXG5cdC8vIChpZiBYIHRoZW4gYSBlbHNlIGEpIH5+PiBhXG5cdGlmIChfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKG9uVHJ1ZUV4cHJlc3Npb24sIG9uRmFsc2VFeHByZXNzaW9uKSkge1xuXHRcdHJldHVybiBvblRydWVFeHByZXNzaW9uO1xuXHR9XG5cblx0Ly8gaWYgWCB0aGVuIGEgZWxzZSBmYWxzZSB+fj4gWCAmJiBhXG5cdGlmIChpc0ZhbHNlKG9uRmFsc2VFeHByZXNzaW9uKSkge1xuXHRcdHJldHVybiBhbmQoY29uZGl0aW9uRXhwcmVzc2lvbiwgb25UcnVlRXhwcmVzc2lvbiBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4pIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0fVxuXG5cdC8vIGlmIFggdGhlbiBhIGVsc2UgdHJ1ZSB+fj4gIVggfHwgYVxuXHRpZiAoaXNUcnVlKG9uRmFsc2VFeHByZXNzaW9uKSkge1xuXHRcdHJldHVybiBvcihub3QoY29uZGl0aW9uRXhwcmVzc2lvbiksIG9uVHJ1ZUV4cHJlc3Npb24gYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH1cblxuXHQvLyBpZiBYIHRoZW4gZmFsc2UgZWxzZSBhIH5+PiAhWCAmJiBhXG5cdGlmIChpc0ZhbHNlKG9uVHJ1ZUV4cHJlc3Npb24pKSB7XG5cdFx0cmV0dXJuIGFuZChub3QoY29uZGl0aW9uRXhwcmVzc2lvbiksIG9uRmFsc2VFeHByZXNzaW9uIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPikgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHR9XG5cblx0Ly8gaWYgWCB0aGVuIHRydWUgZWxzZSBhIH5+PiBYIHx8IGFcblx0aWYgKGlzVHJ1ZShvblRydWVFeHByZXNzaW9uKSkge1xuXHRcdHJldHVybiBvcihjb25kaXRpb25FeHByZXNzaW9uLCBvbkZhbHNlRXhwcmVzc2lvbiBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4pIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0fVxuXHRpZiAoaXNDb21wbGV4VHlwZUV4cHJlc3Npb24oY29uZGl0aW9uKSB8fCBpc0NvbXBsZXhUeXBlRXhwcmVzc2lvbihvblRydWUpIHx8IGlzQ29tcGxleFR5cGVFeHByZXNzaW9uKG9uRmFsc2UpKSB7XG5cdFx0bGV0IHBhdGhJZHggPSAwO1xuXHRcdGNvbnN0IG15SWZFbHNlRXhwcmVzc2lvbiA9IGZvcm1hdFJlc3VsdChbY29uZGl0aW9uLCBvblRydWUsIG9uRmFsc2VdLCBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuU3RhbmRhcmRGb3JtYXR0ZXIjaWZFbHNlXCIpO1xuXHRcdGNvbnN0IGFsbFBhcnRzID0gW107XG5cdFx0dHJhbnNmb3JtUmVjdXJzaXZlbHkoXG5cdFx0XHRteUlmRWxzZUV4cHJlc3Npb24sXG5cdFx0XHRcIlBhdGhJbk1vZGVsXCIsXG5cdFx0XHQoY29uc3RhbnRQYXRoOiBQYXRoSW5Nb2RlbEV4cHJlc3Npb248YW55PikgPT4ge1xuXHRcdFx0XHRhbGxQYXJ0cy5wdXNoKGNvbnN0YW50UGF0aCk7XG5cdFx0XHRcdHJldHVybiBwYXRoSW5Nb2RlbChgJCR7cGF0aElkeCsrfWAsIFwiJFwiKTtcblx0XHRcdH0sXG5cdFx0XHR0cnVlXG5cdFx0KTtcblx0XHRhbGxQYXJ0cy51bnNoaWZ0KGNvbnN0YW50KEpTT04uc3RyaW5naWZ5KG15SWZFbHNlRXhwcmVzc2lvbikpKTtcblx0XHRyZXR1cm4gZm9ybWF0UmVzdWx0KGFsbFBhcnRzLCBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuU3RhbmRhcmRGb3JtYXR0ZXIjZXZhbHVhdGVDb21wbGV4RXhwcmVzc2lvblwiLCB1bmRlZmluZWQsIHRydWUpO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0X3R5cGU6IFwiSWZFbHNlXCIsXG5cdFx0Y29uZGl0aW9uOiBjb25kaXRpb25FeHByZXNzaW9uLFxuXHRcdG9uVHJ1ZTogb25UcnVlRXhwcmVzc2lvbixcblx0XHRvbkZhbHNlOiBvbkZhbHNlRXhwcmVzc2lvblxuXHR9O1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBjdXJyZW50IGV4cHJlc3Npb24gaGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBkZWZhdWx0IG1vZGVsICh1bmRlZmluZWQpLlxuICpcbiAqIEBwYXJhbSBleHByZXNzaW9uIFRoZSBleHByZXNzaW9uIHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlcmUgaXMgYSByZWZlcmVuY2UgdG8gdGhlIGRlZmF1bHQgY29udGV4dFxuICovXG5mdW5jdGlvbiBoYXNSZWZlcmVuY2VUb0RlZmF1bHRDb250ZXh0KGV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+KTogYm9vbGVhbiB7XG5cdHN3aXRjaCAoZXhwcmVzc2lvbi5fdHlwZSkge1xuXHRcdGNhc2UgXCJDb25zdGFudFwiOlxuXHRcdGNhc2UgXCJGb3JtYXR0ZXJcIjpcblx0XHRjYXNlIFwiQ29tcGxleFR5cGVcIjpcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRjYXNlIFwiU2V0XCI6XG5cdFx0XHRyZXR1cm4gZXhwcmVzc2lvbi5vcGVyYW5kcy5zb21lKGhhc1JlZmVyZW5jZVRvRGVmYXVsdENvbnRleHQpO1xuXHRcdGNhc2UgXCJQYXRoSW5Nb2RlbFwiOlxuXHRcdFx0cmV0dXJuIGV4cHJlc3Npb24ubW9kZWxOYW1lID09PSB1bmRlZmluZWQ7XG5cdFx0Y2FzZSBcIkNvbXBhcmlzb25cIjpcblx0XHRcdHJldHVybiBoYXNSZWZlcmVuY2VUb0RlZmF1bHRDb250ZXh0KGV4cHJlc3Npb24ub3BlcmFuZDEpIHx8IGhhc1JlZmVyZW5jZVRvRGVmYXVsdENvbnRleHQoZXhwcmVzc2lvbi5vcGVyYW5kMik7XG5cdFx0Y2FzZSBcIklmRWxzZVwiOlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0aGFzUmVmZXJlbmNlVG9EZWZhdWx0Q29udGV4dChleHByZXNzaW9uLmNvbmRpdGlvbikgfHxcblx0XHRcdFx0aGFzUmVmZXJlbmNlVG9EZWZhdWx0Q29udGV4dChleHByZXNzaW9uLm9uVHJ1ZSkgfHxcblx0XHRcdFx0aGFzUmVmZXJlbmNlVG9EZWZhdWx0Q29udGV4dChleHByZXNzaW9uLm9uRmFsc2UpXG5cdFx0XHQpO1xuXHRcdGNhc2UgXCJOb3RcIjpcblx0XHRjYXNlIFwiVHJ1dGh5XCI6XG5cdFx0XHRyZXR1cm4gaGFzUmVmZXJlbmNlVG9EZWZhdWx0Q29udGV4dChleHByZXNzaW9uLm9wZXJhbmQpO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxudHlwZSBGbjxUPiA9ICgoLi4ucGFyYW1zOiBhbnkpID0+IFQgfCBQcm9taXNlPFQ+KSAmIHtcblx0X19mdW5jdGlvbk5hbWU6IHN0cmluZztcbn07XG5cbi8qKlxuICogQHR5cGVkZWYgV3JhcHBlZFR1cGxlXG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbi8vIEB0cy1pZ25vcmVcbnR5cGUgV3JhcHBlZFR1cGxlPFQ+ID0geyBbSyBpbiBrZXlvZiBUXTogV3JhcHBlZFR1cGxlPFRbS10+IHwgRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFRbS10+IH07XG5cbi8vIFNvLCB0aGlzIHdvcmtzIGJ1dCBJIGNhbm5vdCBnZXQgaXQgdG8gY29tcGlsZSA6RCwgYnV0IGl0IHN0aWxsIGRvZXMgd2hhdCBpcyBleHBlY3RlZC4uLlxuXG4vKipcbiAqIEEgZnVuY3Rpb24gcmVmZXJlbmNlIG9yIGEgZnVuY3Rpb24gbmFtZS5cbiAqL1xudHlwZSBGdW5jdGlvbk9yTmFtZTxUPiA9IEZuPFQ+IHwgc3RyaW5nO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHBhcmFtZXRlcnMsIGVpdGhlciBkZXJpdmVkIGZyb20gdGhlIGZ1bmN0aW9uIG9yIGFuIHVudHlwZWQgYXJyYXkuXG4gKi9cbnR5cGUgRnVuY3Rpb25QYXJhbWV0ZXJzPFQsIEYgZXh0ZW5kcyBGdW5jdGlvbk9yTmFtZTxUPj4gPSBGIGV4dGVuZHMgRm48VD4gPyBQYXJhbWV0ZXJzPEY+IDogYW55W107XG5cbi8qKlxuICogQ2FsbHMgYSBmb3JtYXR0ZXIgZnVuY3Rpb24gdG8gcHJvY2VzcyB0aGUgcGFyYW1ldGVycy5cbiAqIElmIHJlcXVpcmVDb250ZXh0IGlzIHNldCB0byB0cnVlIGFuZCBubyBjb250ZXh0IGlzIHBhc3NlZCBhIGRlZmF1bHQgY29udGV4dCB3aWxsIGJlIGFkZGVkIGF1dG9tYXRpY2FsbHkuXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEB0ZW1wbGF0ZSBVXG4gKiBAcGFyYW0gcGFyYW1ldGVycyBUaGUgbGlzdCBvZiBwYXJhbWV0ZXIgdGhhdCBzaG91bGQgbWF0Y2ggdGhlIHR5cGUgYW5kIG51bWJlciBvZiB0aGUgZm9ybWF0dGVyIGZ1bmN0aW9uXG4gKiBAcGFyYW0gZm9ybWF0dGVyRnVuY3Rpb24gVGhlIGZ1bmN0aW9uIHRvIGNhbGxcbiAqIEBwYXJhbSBbY29udGV4dEVudGl0eVR5cGVdIElmIG5vIHBhcmFtZXRlciByZWZlcnMgdG8gdGhlIGNvbnRleHQgdGhlbiB3ZSB1c2UgdGhpcyBpbmZvcm1hdGlvbiB0byBhZGQgYSByZWZlcmVuY2UgdG8gdGhlIGtleXMgZnJvbSB0aGUgZW50aXR5IHR5cGUuXG4gKiBAcGFyYW0gW2lnbm9yZUNvbXBsZXhUeXBlXSBXaGV0aGVyIHRvIGlnbm9yZSB0aGUgdHJhbnNnZm9ybWF0aW9uIHRvIHRoZSBTdGFuZGFyZEZvcm1hdHRlciBvciBub3RcbiAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIGV4cHJlc3Npb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFJlc3VsdDxULCBVIGV4dGVuZHMgRm48VD4+KFxuXHRwYXJhbWV0ZXJzOiBXcmFwcGVkVHVwbGU8UGFyYW1ldGVyczxVPj4sXG5cdGZvcm1hdHRlckZ1bmN0aW9uOiBVIHwgc3RyaW5nLFxuXHRjb250ZXh0RW50aXR5VHlwZT86IEVudGl0eVR5cGUsXG5cdGlnbm9yZUNvbXBsZXhUeXBlID0gZmFsc2Vcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPiB7XG5cdGNvbnN0IHBhcmFtZXRlckV4cHJlc3Npb25zID0gKHBhcmFtZXRlcnMgYXMgYW55W10pLm1hcCh3cmFwUHJpbWl0aXZlKTtcblxuXHRpZiAoaGFzVW5yZXNvbHZhYmxlRXhwcmVzc2lvbiguLi5wYXJhbWV0ZXJFeHByZXNzaW9ucykpIHtcblx0XHRyZXR1cm4gdW5yZXNvbHZhYmxlRXhwcmVzc2lvbjtcblx0fVxuXHRpZiAoY29udGV4dEVudGl0eVR5cGUpIHtcblx0XHQvLyBPdGhlcndpc2UsIGlmIHRoZSBjb250ZXh0IGlzIHJlcXVpcmVkIGFuZCBubyBjb250ZXh0IGlzIHByb3ZpZGVkIG1ha2Ugc3VyZSB0byBhZGQgdGhlIGRlZmF1bHQgYmluZGluZ1xuXHRcdGlmICghcGFyYW1ldGVyRXhwcmVzc2lvbnMuc29tZShoYXNSZWZlcmVuY2VUb0RlZmF1bHRDb250ZXh0KSkge1xuXHRcdFx0Y29udGV4dEVudGl0eVR5cGUua2V5cy5mb3JFYWNoKChrZXkpID0+IHBhcmFtZXRlckV4cHJlc3Npb25zLnB1c2gocGF0aEluTW9kZWwoa2V5Lm5hbWUsIFwiXCIpKSk7XG5cdFx0fVxuXHR9XG5cdGxldCBmdW5jdGlvbk5hbWUgPSBcIlwiO1xuXHRpZiAodHlwZW9mIGZvcm1hdHRlckZ1bmN0aW9uID09PSBcInN0cmluZ1wiKSB7XG5cdFx0ZnVuY3Rpb25OYW1lID0gZm9ybWF0dGVyRnVuY3Rpb247XG5cdH0gZWxzZSB7XG5cdFx0ZnVuY3Rpb25OYW1lID0gZm9ybWF0dGVyRnVuY3Rpb24uX19mdW5jdGlvbk5hbWU7XG5cdH1cblx0Ly8gRm9ybWF0dGVyTmFtZSBjYW4gYmUgb2YgZm9ybWF0IHNhcC5mZS5jb3JlLnh4eCNtZXRob2ROYW1lIHRvIGhhdmUgbXVsdGlwbGUgZm9ybWF0dGVyIGluIG9uZSBjbGFzc1xuXHRjb25zdCBbZm9ybWF0dGVyQ2xhc3MsIGZvcm1hdHRlck5hbWVdID0gZnVuY3Rpb25OYW1lLnNwbGl0KFwiI1wiKTtcblxuXHQvLyBJbiBzb21lIGNhc2Ugd2UgYWxzbyBjYW5ub3QgY2FsbCBkaXJlY3RseSBhIGZ1bmN0aW9uIGJlY2F1c2Ugb2YgdG9vIGNvbXBsZXggaW5wdXQsIGluIHRoYXQgY2FzZSB3ZSBuZWVkIHRvIGNvbnZlcnQgdG8gYSBzaW1wbGVyIGZ1bmN0aW9uIGNhbGxcblx0aWYgKCFpZ25vcmVDb21wbGV4VHlwZSAmJiAocGFyYW1ldGVyRXhwcmVzc2lvbnMuc29tZShpc0NvbXBsZXhUeXBlRXhwcmVzc2lvbikgfHwgcGFyYW1ldGVyRXhwcmVzc2lvbnMuc29tZShpc0NvbmNhdEV4cHJlc3Npb24pKSkge1xuXHRcdGxldCBwYXRoSWR4ID0gMDtcblx0XHRjb25zdCBteUZvcm1hdEV4cHJlc3Npb24gPSBmb3JtYXRSZXN1bHQocGFyYW1ldGVyRXhwcmVzc2lvbnMsIGZ1bmN0aW9uTmFtZSwgdW5kZWZpbmVkLCB0cnVlKTtcblx0XHRjb25zdCBhbGxQYXJ0cyA9IFtdO1xuXHRcdHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KG15Rm9ybWF0RXhwcmVzc2lvbiwgXCJQYXRoSW5Nb2RlbFwiLCAoY29uc3RhbnRQYXRoOiBQYXRoSW5Nb2RlbEV4cHJlc3Npb248YW55PikgPT4ge1xuXHRcdFx0YWxsUGFydHMucHVzaChjb25zdGFudFBhdGgpO1xuXHRcdFx0cmV0dXJuIHBhdGhJbk1vZGVsKGAkJHtwYXRoSWR4Kyt9YCwgXCIkXCIpO1xuXHRcdH0pO1xuXHRcdGFsbFBhcnRzLnVuc2hpZnQoY29uc3RhbnQoSlNPTi5zdHJpbmdpZnkobXlGb3JtYXRFeHByZXNzaW9uKSkpO1xuXHRcdHJldHVybiBmb3JtYXRSZXN1bHQoYWxsUGFydHMsIFwic2FwLmZlLmNvcmUuZm9ybWF0dGVycy5TdGFuZGFyZEZvcm1hdHRlciNldmFsdWF0ZUNvbXBsZXhFeHByZXNzaW9uXCIsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdH0gZWxzZSBpZiAoISFmb3JtYXR0ZXJOYW1lICYmIGZvcm1hdHRlck5hbWUubGVuZ3RoID4gMCkge1xuXHRcdHBhcmFtZXRlckV4cHJlc3Npb25zLnVuc2hpZnQoY29uc3RhbnQoZm9ybWF0dGVyTmFtZSkpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRfdHlwZTogXCJGb3JtYXR0ZXJcIixcblx0XHRmbjogZm9ybWF0dGVyQ2xhc3MsXG5cdFx0cGFyYW1ldGVyczogcGFyYW1ldGVyRXhwcmVzc2lvbnNcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFVwQ29uc3RyYWludHModGFyZ2V0TWFwcGluZzogdHlwZW9mIEVETV9UWVBFX01BUFBJTkcsIHByb3BlcnR5OiBQcm9wZXJ0eSkge1xuXHRjb25zdCBjb25zdHJhaW50czoge1xuXHRcdHNjYWxlPzogbnVtYmVyO1xuXHRcdHByZWNpc2lvbj86IG51bWJlcjtcblx0XHRtYXhMZW5ndGg/OiBudW1iZXI7XG5cdFx0bnVsbGFibGU/OiBib29sZWFuO1xuXHRcdG1pbmltdW0/OiBzdHJpbmc7XG5cdFx0bWF4aW11bT86IHN0cmluZztcblx0XHRpc0RpZ2l0U2VxdWVuY2U/OiBib29sZWFuO1xuXHRcdFY0PzogYm9vbGVhbjtcblx0fSA9IHt9O1xuXHRpZiAodGFyZ2V0TWFwcGluZz8uY29uc3RyYWludHM/LiRTY2FsZSAmJiBwcm9wZXJ0eS5zY2FsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Y29uc3RyYWludHMuc2NhbGUgPSBwcm9wZXJ0eS5zY2FsZTtcblx0fVxuXHRpZiAodGFyZ2V0TWFwcGluZz8uY29uc3RyYWludHM/LiRQcmVjaXNpb24gJiYgcHJvcGVydHkucHJlY2lzaW9uICE9PSB1bmRlZmluZWQpIHtcblx0XHRjb25zdHJhaW50cy5wcmVjaXNpb24gPSBwcm9wZXJ0eS5wcmVjaXNpb247XG5cdH1cblx0aWYgKHRhcmdldE1hcHBpbmc/LmNvbnN0cmFpbnRzPy4kTWF4TGVuZ3RoICYmIHByb3BlcnR5Lm1heExlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Y29uc3RyYWludHMubWF4TGVuZ3RoID0gcHJvcGVydHkubWF4TGVuZ3RoO1xuXHR9XG5cdGlmIChwcm9wZXJ0eS5udWxsYWJsZSA9PT0gZmFsc2UpIHtcblx0XHRjb25zdHJhaW50cy5udWxsYWJsZSA9IGZhbHNlO1xuXHR9XG5cdGlmICh0YXJnZXRNYXBwaW5nPy5jb25zdHJhaW50cz8uW1wiQE9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLk1pbmltdW0vJERlY2ltYWxcIl0gJiYgIWlzTmFOKHByb3BlcnR5LmFubm90YXRpb25zPy5WYWxpZGF0aW9uPy5NaW5pbXVtKSkge1xuXHRcdGNvbnN0cmFpbnRzLm1pbmltdW0gPSBgJHtwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVmFsaWRhdGlvbj8uTWluaW11bX1gO1xuXHR9XG5cdGlmICh0YXJnZXRNYXBwaW5nPy5jb25zdHJhaW50cz8uW1wiQE9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLk1heGltdW0vJERlY2ltYWxcIl0gJiYgIWlzTmFOKHByb3BlcnR5LmFubm90YXRpb25zPy5WYWxpZGF0aW9uPy5NYXhpbXVtKSkge1xuXHRcdGNvbnN0cmFpbnRzLm1heGltdW0gPSBgJHtwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVmFsaWRhdGlvbj8uTWF4aW11bX1gO1xuXHR9XG5cdGlmIChcblx0XHRwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5Jc0RpZ2l0U2VxdWVuY2UgJiZcblx0XHR0YXJnZXRNYXBwaW5nLnR5cGUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nXCIgJiZcblx0XHR0YXJnZXRNYXBwaW5nPy5jb25zdHJhaW50cz8uW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0RpZ2l0U2VxdWVuY2VcIl1cblx0KSB7XG5cdFx0Y29uc3RyYWludHMuaXNEaWdpdFNlcXVlbmNlID0gdHJ1ZTtcblx0fVxuXHRpZiAodGFyZ2V0TWFwcGluZz8uY29uc3RyYWludHM/LiRWNCkge1xuXHRcdGNvbnN0cmFpbnRzLlY0ID0gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gY29uc3RyYWludHM7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBwcm9wZXJ0eSwgYW5kIHNldHMgdXAgdGhlIGZvcm1hdE9wdGlvbnMgYW5kIGNvbnN0cmFpbnRzLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgUHJvcGVydHkgZm9yIHdoaWNoIHdlIGFyZSBzZXR0aW5nIHVwIHRoZSBiaW5kaW5nXG4gKiBAcGFyYW0gcHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbiBUaGUgQmluZGluZ0V4cHJlc3Npb24gb2YgdGhlIHByb3BlcnR5IGFib3ZlLiBTZXJ2ZXMgYXMgdGhlIGJhc2lzIHRvIHdoaWNoIGluZm9ybWF0aW9uIGNhbiBiZSBhZGRlZFxuICogQHBhcmFtIGlnbm9yZUNvbnN0cmFpbnRzIElnbm9yZSBjb25zdHJhaW50cyBvZiB0aGUgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBwcm9wZXJ0eSB3aXRoIGZvcm1hdE9wdGlvbnMgYW5kIGNvbnN0cmFpbnRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRXaXRoVHlwZUluZm9ybWF0aW9uPFQ+KFxuXHRwcm9wZXJ0eTogUHJvcGVydHksXG5cdHByb3BlcnR5QmluZGluZ0V4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+LFxuXHRpZ25vcmVDb25zdHJhaW50cyA9IGZhbHNlXG4pOiBQYXRoSW5Nb2RlbEV4cHJlc3Npb248VD4ge1xuXHRjb25zdCBvdXRFeHByZXNzaW9uOiBQYXRoSW5Nb2RlbEV4cHJlc3Npb248YW55PiA9IHByb3BlcnR5QmluZGluZ0V4cHJlc3Npb24gYXMgUGF0aEluTW9kZWxFeHByZXNzaW9uPGFueT47XG5cdGlmIChwcm9wZXJ0eS5fdHlwZSAhPT0gXCJQcm9wZXJ0eVwiKSB7XG5cdFx0cmV0dXJuIG91dEV4cHJlc3Npb247XG5cdH1cblx0Y29uc3QgdGFyZ2V0TWFwcGluZyA9IEVETV9UWVBFX01BUFBJTkdbcHJvcGVydHkudHlwZV07XG5cdGlmICghdGFyZ2V0TWFwcGluZykge1xuXHRcdHJldHVybiBvdXRFeHByZXNzaW9uO1xuXHR9XG5cdGlmICghb3V0RXhwcmVzc2lvbi5mb3JtYXRPcHRpb25zKSB7XG5cdFx0b3V0RXhwcmVzc2lvbi5mb3JtYXRPcHRpb25zID0ge307XG5cdH1cblx0b3V0RXhwcmVzc2lvbi5jb25zdHJhaW50cyA9IHt9O1xuXG5cdG91dEV4cHJlc3Npb24udHlwZSA9IHRhcmdldE1hcHBpbmcudHlwZTtcblx0aWYgKCFpZ25vcmVDb25zdHJhaW50cykge1xuXHRcdG91dEV4cHJlc3Npb24uY29uc3RyYWludHMgPSBzZXRVcENvbnN0cmFpbnRzKHRhcmdldE1hcHBpbmcsIHByb3BlcnR5KTtcblx0fVxuXG5cdGlmIChcblx0XHQob3V0RXhwcmVzc2lvbj8udHlwZT8uaW5kZXhPZihcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkludFwiKSA9PT0gMCAmJiBvdXRFeHByZXNzaW9uPy50eXBlICE9PSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkludDY0XCIpIHx8XG5cdFx0b3V0RXhwcmVzc2lvbj8udHlwZSA9PT0gXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5Eb3VibGVcIlxuXHQpIHtcblx0XHRvdXRFeHByZXNzaW9uLmZvcm1hdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKG91dEV4cHJlc3Npb24uZm9ybWF0T3B0aW9ucywge1xuXHRcdFx0cGFyc2VBc1N0cmluZzogZmFsc2Vcblx0XHR9KTtcblx0fVxuXHRpZiAob3V0RXhwcmVzc2lvbi50eXBlID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmluZ1wiKSB7XG5cdFx0b3V0RXhwcmVzc2lvbi5mb3JtYXRPcHRpb25zLnBhcnNlS2VlcHNFbXB0eVN0cmluZyA9IHRydWU7XG5cdFx0Y29uc3QgZmlzY2FsVHlwZSA9IGdldEZpc2NhbFR5cGUocHJvcGVydHkpO1xuXHRcdGlmIChmaXNjYWxUeXBlKSB7XG5cdFx0XHRvdXRFeHByZXNzaW9uLmZvcm1hdE9wdGlvbnMuZmlzY2FsVHlwZSA9IGZpc2NhbFR5cGU7XG5cdFx0XHRvdXRFeHByZXNzaW9uLnR5cGUgPSBcInNhcC5mZS5jb3JlLnR5cGUuRmlzY2FsRGF0ZVwiO1xuXHRcdH1cblx0fVxuXHRpZiAob3V0RXhwcmVzc2lvbi50eXBlID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRlY2ltYWxcIiB8fCBvdXRFeHByZXNzaW9uPy50eXBlID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkludDY0XCIpIHtcblx0XHRvdXRFeHByZXNzaW9uLmZvcm1hdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKG91dEV4cHJlc3Npb24uZm9ybWF0T3B0aW9ucywge1xuXHRcdFx0ZW1wdHlTdHJpbmc6IFwiXCJcblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiBvdXRFeHByZXNzaW9uO1xufVxuXG5leHBvcnQgY29uc3QgZ2V0RmlzY2FsVHlwZSA9IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRpZiAocHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNGaXNjYWxZZWFyKSB7XG5cdFx0cmV0dXJuIENvbW1vbkFubm90YXRpb25UZXJtcy5Jc0Zpc2NhbFllYXI7XG5cdH1cblx0aWYgKHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LklzRmlzY2FsUGVyaW9kKSB7XG5cdFx0cmV0dXJuIENvbW1vbkFubm90YXRpb25UZXJtcy5Jc0Zpc2NhbFBlcmlvZDtcblx0fVxuXHRpZiAocHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNGaXNjYWxZZWFyUGVyaW9kKSB7XG5cdFx0cmV0dXJuIENvbW1vbkFubm90YXRpb25UZXJtcy5Jc0Zpc2NhbFllYXJQZXJpb2Q7XG5cdH1cblx0aWYgKHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LklzRmlzY2FsUXVhcnRlcikge1xuXHRcdHJldHVybiBDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNGaXNjYWxRdWFydGVyO1xuXHR9XG5cdGlmIChwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5Jc0Zpc2NhbFllYXJRdWFydGVyKSB7XG5cdFx0cmV0dXJuIENvbW1vbkFubm90YXRpb25UZXJtcy5Jc0Zpc2NhbFllYXJRdWFydGVyO1xuXHR9XG5cdGlmIChwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5Jc0Zpc2NhbFdlZWspIHtcblx0XHRyZXR1cm4gQ29tbW9uQW5ub3RhdGlvblRlcm1zLklzRmlzY2FsV2Vlaztcblx0fVxuXHRpZiAocHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNGaXNjYWxZZWFyV2Vlaykge1xuXHRcdHJldHVybiBDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNGaXNjYWxZZWFyV2Vlaztcblx0fVxuXHRpZiAocHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNEYXlPZkZpc2NhbFllYXIpIHtcblx0XHRyZXR1cm4gQ29tbW9uQW5ub3RhdGlvblRlcm1zLklzRGF5T2ZGaXNjYWxZZWFyO1xuXHR9XG59O1xuXG4vKipcbiAqIENhbGxzIGEgY29tcGxleCB0eXBlIHRvIHByb2Nlc3MgdGhlIHBhcmFtZXRlcnMuXG4gKiBJZiByZXF1aXJlQ29udGV4dCBpcyBzZXQgdG8gdHJ1ZSBhbmQgbm8gY29udGV4dCBpcyBwYXNzZWQsIGEgZGVmYXVsdCBjb250ZXh0IHdpbGwgYmUgYWRkZWQgYXV0b21hdGljYWxseS5cbiAqXG4gKiBAdGVtcGxhdGUgVFxuICogQHRlbXBsYXRlIFVcbiAqIEBwYXJhbSBwYXJhbWV0ZXJzIFRoZSBsaXN0IG9mIHBhcmFtZXRlcnMgdGhhdCBzaG91bGQgbWF0Y2ggdGhlIHR5cGUgZm9yIHRoZSBjb21wbGV4IHR5cGU9XG4gKiBAcGFyYW0gdHlwZSBUaGUgY29tcGxleCB0eXBlIHRvIHVzZVxuICogQHBhcmFtIFtjb250ZXh0RW50aXR5VHlwZV0gVGhlIGNvbnRleHQgZW50aXR5IHR5cGUgdG8gY29uc2lkZXJcbiAqIEBwYXJhbSBvRm9ybWF0T3B0aW9uc1xuICogQHJldHVybnMgVGhlIGNvcnJlc3BvbmRpbmcgZXhwcmVzc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVHlwZUluZm9ybWF0aW9uPFQsIFUgZXh0ZW5kcyBGbjxUPj4oXG5cdHBhcmFtZXRlcnM6IFdyYXBwZWRUdXBsZTxQYXJhbWV0ZXJzPFU+Pixcblx0dHlwZTogc3RyaW5nLFxuXHRjb250ZXh0RW50aXR5VHlwZT86IEVudGl0eVR5cGUsXG5cdG9Gb3JtYXRPcHRpb25zPzogYW55XG4pOiBVbnJlc29sdmFibGVQYXRoRXhwcmVzc2lvbiB8IENvbXBsZXhUeXBlRXhwcmVzc2lvbjxUPiB8IENvbnN0YW50RXhwcmVzc2lvbjxUPiB7XG5cdGNvbnN0IHBhcmFtZXRlckV4cHJlc3Npb25zID0gKHBhcmFtZXRlcnMgYXMgYW55W10pLm1hcCh3cmFwUHJpbWl0aXZlKTtcblx0aWYgKGhhc1VucmVzb2x2YWJsZUV4cHJlc3Npb24oLi4ucGFyYW1ldGVyRXhwcmVzc2lvbnMpKSB7XG5cdFx0cmV0dXJuIHVucmVzb2x2YWJsZUV4cHJlc3Npb247XG5cdH1cblx0Ly8gSWYgdGhlcmUgaXMgb25seSBvbmUgcGFyYW1ldGVyIGFuZCBpdCBpcyBhIGNvbnN0YW50IGFuZCB3ZSBkb24ndCBleHBlY3QgdGhlIGNvbnRleHQgdGhlbiByZXR1cm4gdGhlIGNvbnN0YW50XG5cdGlmIChwYXJhbWV0ZXJFeHByZXNzaW9ucy5sZW5ndGggPT09IDEgJiYgaXNDb25zdGFudChwYXJhbWV0ZXJFeHByZXNzaW9uc1swXSkgJiYgIWNvbnRleHRFbnRpdHlUeXBlKSB7XG5cdFx0cmV0dXJuIHBhcmFtZXRlckV4cHJlc3Npb25zWzBdO1xuXHR9IGVsc2UgaWYgKGNvbnRleHRFbnRpdHlUeXBlKSB7XG5cdFx0Ly8gT3RoZXJ3aXNlLCBpZiB0aGUgY29udGV4dCBpcyByZXF1aXJlZCBhbmQgbm8gY29udGV4dCBpcyBwcm92aWRlZCBtYWtlIHN1cmUgdG8gYWRkIHRoZSBkZWZhdWx0IGJpbmRpbmdcblx0XHRpZiAoIXBhcmFtZXRlckV4cHJlc3Npb25zLnNvbWUoaGFzUmVmZXJlbmNlVG9EZWZhdWx0Q29udGV4dCkpIHtcblx0XHRcdGNvbnRleHRFbnRpdHlUeXBlLmtleXMuZm9yRWFjaCgoa2V5KSA9PiBwYXJhbWV0ZXJFeHByZXNzaW9ucy5wdXNoKHBhdGhJbk1vZGVsKGtleS5uYW1lLCBcIlwiKSkpO1xuXHRcdH1cblx0fVxuXHRvRm9ybWF0T3B0aW9ucyA9IF9nZXRDb21wbGV4VHlwZUZvcm1hdE9wdGlvbnNGcm9tRmlyc3RQYXJhbShwYXJhbWV0ZXJzWzBdLCBvRm9ybWF0T3B0aW9ucyk7XG5cblx0aWYgKHR5cGUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuVW5pdFwiKSB7XG5cdFx0Y29uc3QgdW9tUGF0aCA9IHBhdGhJbk1vZGVsKFwiLyMjQEByZXF1ZXN0VW5pdHNPZk1lYXN1cmVcIik7XG5cdFx0dW9tUGF0aC50YXJnZXRUeXBlID0gXCJhbnlcIjtcblx0XHR1b21QYXRoLm1vZGUgPSBcIk9uZVRpbWVcIjtcblx0XHRwYXJhbWV0ZXJFeHByZXNzaW9ucy5wdXNoKHVvbVBhdGgpO1xuXHR9IGVsc2UgaWYgKHR5cGUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuQ3VycmVuY3lcIikge1xuXHRcdGNvbnN0IGN1cnJlbmN5UGF0aCA9IHBhdGhJbk1vZGVsKFwiLyMjQEByZXF1ZXN0Q3VycmVuY3lDb2Rlc1wiKTtcblx0XHRjdXJyZW5jeVBhdGgudGFyZ2V0VHlwZSA9IFwiYW55XCI7XG5cdFx0Y3VycmVuY3lQYXRoLm1vZGUgPSBcIk9uZVRpbWVcIjtcblx0XHRwYXJhbWV0ZXJFeHByZXNzaW9ucy5wdXNoKGN1cnJlbmN5UGF0aCk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdF90eXBlOiBcIkNvbXBsZXhUeXBlXCIsXG5cdFx0dHlwZTogdHlwZSxcblx0XHRmb3JtYXRPcHRpb25zOiBvRm9ybWF0T3B0aW9ucyB8fCB7fSxcblx0XHRwYXJhbWV0ZXJzOiB7fSxcblx0XHRiaW5kaW5nUGFyYW1ldGVyczogcGFyYW1ldGVyRXhwcmVzc2lvbnNcblx0fTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIHRoZSBmb3JtYXRPcHRpb25zIGZvciBhIGNvbXBsZXhUeXBlIGJhc2VkIG9uIHRoZSBmaXJzdCBwYXJhbWV0ZXIuXG4gKlxuICogQHBhcmFtIHBhcmFtIFRoZSBmaXJzdCBwYXJhbWV0ZXIgb2YgdGhlIGNvbXBsZXggdHlwZVxuICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgSW5pdGlhbCBmb3JtYXRPcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgbW9kaWZpZWQgZm9ybWF0T3B0aW9uc1xuICovXG5mdW5jdGlvbiBfZ2V0Q29tcGxleFR5cGVGb3JtYXRPcHRpb25zRnJvbUZpcnN0UGFyYW08VCwgVSBleHRlbmRzIEZuPFQ+Pihcblx0cGFyYW06IFBhcmFtZXRlcnM8VT4sXG5cdGZvcm1hdE9wdGlvbnM6IHVuZGVmaW5lZCB8IFBhcnRpYWw8eyBzaG93TnVtYmVyOiBib29sZWFuOyBzaG93TWVhc3VyZTogYm9vbGVhbjsgcGFyc2VBc1N0cmluZzogYm9vbGVhbjsgZW1wdHlTdHJpbmc6IDAgfCBcIlwiIHwgbnVsbCB9PlxuKSB7XG5cdC8vIGlmIHNob3dNZWFzdXJlIGlzIHNldCB0byBmYWxzZSB3ZSB3YW50IHRvIG5vdCBwYXJzZSBhcyBzdHJpbmcgdG8gc2VlIHRoZSAwXG5cdC8vIHdlIGRvIHRoYXQgYWxzbyBmb3IgYWxsIGJpbmRpbmdzIGJlY2F1c2Ugb3RoZXJ3aXNlIHRoZSBtZGMgRmllbGQgaXNuJ3QgZWRpdGFibGVcblx0aWYgKFxuXHRcdCEoZm9ybWF0T3B0aW9ucyAmJiBmb3JtYXRPcHRpb25zLnNob3dOdW1iZXIgPT09IGZhbHNlKSAmJlxuXHRcdChwYXJhbT8udHlwZT8uaW5kZXhPZihcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkludFwiKSA9PT0gMCB8fFxuXHRcdFx0cGFyYW0/LnR5cGUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRGVjaW1hbFwiIHx8XG5cdFx0XHRwYXJhbT8udHlwZSA9PT0gXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5Eb3VibGVcIilcblx0KSB7XG5cdFx0aWYgKHBhcmFtPy50eXBlID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkludDY0XCIgfHwgcGFyYW0/LnR5cGUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRGVjaW1hbFwiKSB7XG5cdFx0XHQvL3NhcC51aS5tb2RlbC5vZGF0YS50eXBlLkludDY0IGRvIG5vdCBzdXBwb3J0IHBhcnNlQXNTdHJpbmcgZmFsc2Vcblx0XHRcdGZvcm1hdE9wdGlvbnMgPSBmb3JtYXRPcHRpb25zPy5zaG93TWVhc3VyZSA9PT0gZmFsc2UgPyB7IGVtcHR5U3RyaW5nOiBcIlwiLCBzaG93TWVhc3VyZTogZmFsc2UgfSA6IHsgZW1wdHlTdHJpbmc6IFwiXCIgfTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Zm9ybWF0T3B0aW9ucyA9IGZvcm1hdE9wdGlvbnM/LnNob3dNZWFzdXJlID09PSBmYWxzZSA/IHsgcGFyc2VBc1N0cmluZzogZmFsc2UsIHNob3dNZWFzdXJlOiBmYWxzZSB9IDogeyBwYXJzZUFzU3RyaW5nOiBmYWxzZSB9O1xuXHRcdH1cblx0fVxuXHRpZiAocGFyYW0/LmNvbnN0cmFpbnRzPy5udWxsYWJsZSAhPT0gZmFsc2UpIHtcblx0XHRkZWxldGUgZm9ybWF0T3B0aW9ucz8uZW1wdHlTdHJpbmc7XG5cdH1cblx0cmV0dXJuIGZvcm1hdE9wdGlvbnM7XG59XG4vKipcbiAqIEZ1bmN0aW9uIGNhbGwsIG9wdGlvbmFsbHkgd2l0aCBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIGZ1bmMgRnVuY3Rpb24gbmFtZSBvciByZWZlcmVuY2UgdG8gZnVuY3Rpb25cbiAqIEBwYXJhbSBwYXJhbWV0ZXJzIEFyZ3VtZW50c1xuICogQHBhcmFtIG9uIE9iamVjdCB0byBjYWxsIHRoZSBmdW5jdGlvbiBvblxuICogQHJldHVybnMgRXhwcmVzc2lvbiByZXByZXNlbnRpbmcgdGhlIGZ1bmN0aW9uIGNhbGwgKG5vdCB0aGUgcmVzdWx0IG9mIHRoZSBmdW5jdGlvbiBjYWxsISlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZuPFQsIFUgZXh0ZW5kcyBGdW5jdGlvbk9yTmFtZTxUPj4oXG5cdGZ1bmM6IFUsXG5cdHBhcmFtZXRlcnM6IFdyYXBwZWRUdXBsZTxGdW5jdGlvblBhcmFtZXRlcnM8VCwgVT4+LFxuXHRvbj86IEV4cHJlc3Npb25PclByaW1pdGl2ZTxvYmplY3Q+XG4pOiBGdW5jdGlvbkV4cHJlc3Npb248VD4ge1xuXHRjb25zdCBmdW5jdGlvbk5hbWUgPSB0eXBlb2YgZnVuYyA9PT0gXCJzdHJpbmdcIiA/IGZ1bmMgOiBmdW5jLl9fZnVuY3Rpb25OYW1lO1xuXHRyZXR1cm4ge1xuXHRcdF90eXBlOiBcIkZ1bmN0aW9uXCIsXG5cdFx0b2JqOiBvbiAhPT0gdW5kZWZpbmVkID8gd3JhcFByaW1pdGl2ZShvbikgOiB1bmRlZmluZWQsXG5cdFx0Zm46IGZ1bmN0aW9uTmFtZSxcblx0XHRwYXJhbWV0ZXJzOiAocGFyYW1ldGVycyBhcyBhbnlbXSkubWFwKHdyYXBQcmltaXRpdmUpXG5cdH07XG59XG5cbi8qKlxuICogU2hvcnRjdXQgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGEgYmluZGluZyB2YWx1ZSBpcyBudWxsLCB1bmRlZmluZWQgb3IgZW1wdHkuXG4gKlxuICogQHBhcmFtIGV4cHJlc3Npb25cbiAqIEByZXR1cm5zIEEgQm9vbGVhbiBleHByZXNzaW9uIGV2YWx1YXRpbmcgdGhlIGZhY3QgdGhhdCB0aGUgY3VycmVudCBlbGVtZW50IGlzIGVtcHR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5KGV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+KTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0Y29uc3QgYUJpbmRpbmdzOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8Ym9vbGVhbj5bXSA9IFtdO1xuXHR0cmFuc2Zvcm1SZWN1cnNpdmVseShleHByZXNzaW9uLCBcIlBhdGhJbk1vZGVsXCIsIChleHByKSA9PiB7XG5cdFx0YUJpbmRpbmdzLnB1c2gob3IoZXF1YWwoZXhwciwgXCJcIiksIGVxdWFsKGV4cHIsIHVuZGVmaW5lZCksIGVxdWFsKGV4cHIsIG51bGwpKSk7XG5cdFx0cmV0dXJuIGV4cHI7XG5cdH0pO1xuXHRyZXR1cm4gYW5kKC4uLmFCaW5kaW5ncyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25jYXQoLi4uaW5FeHByZXNzaW9uczogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPHN0cmluZz5bXSk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHtcblx0Y29uc3QgZXhwcmVzc2lvbnMgPSBpbkV4cHJlc3Npb25zLm1hcCh3cmFwUHJpbWl0aXZlKTtcblx0aWYgKGhhc1VucmVzb2x2YWJsZUV4cHJlc3Npb24oLi4uZXhwcmVzc2lvbnMpKSB7XG5cdFx0cmV0dXJuIHVucmVzb2x2YWJsZUV4cHJlc3Npb247XG5cdH1cblx0aWYgKGV4cHJlc3Npb25zLmV2ZXJ5KGlzQ29uc3RhbnQpKSB7XG5cdFx0cmV0dXJuIGNvbnN0YW50KFxuXHRcdFx0ZXhwcmVzc2lvbnMucmVkdWNlKChjb25jYXRlbmF0ZWQ6IHN0cmluZywgdmFsdWUpID0+IHtcblx0XHRcdFx0aWYgKHZhbHVlLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gY29uY2F0ZW5hdGVkICsgKHZhbHVlIGFzIENvbnN0YW50RXhwcmVzc2lvbjxhbnk+KS52YWx1ZS50b1N0cmluZygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBjb25jYXRlbmF0ZWQ7XG5cdFx0XHR9LCBcIlwiKVxuXHRcdCk7XG5cdH0gZWxzZSBpZiAoZXhwcmVzc2lvbnMuc29tZShpc0NvbXBsZXhUeXBlRXhwcmVzc2lvbikpIHtcblx0XHRsZXQgcGF0aElkeCA9IDA7XG5cdFx0Y29uc3QgbXlDb25jYXRFeHByZXNzaW9uID0gZm9ybWF0UmVzdWx0KGV4cHJlc3Npb25zLCBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuU3RhbmRhcmRGb3JtYXR0ZXIjY29uY2F0XCIsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdFx0Y29uc3QgYWxsUGFydHMgPSBbXTtcblx0XHR0cmFuc2Zvcm1SZWN1cnNpdmVseShteUNvbmNhdEV4cHJlc3Npb24sIFwiUGF0aEluTW9kZWxcIiwgKGNvbnN0YW50UGF0aDogUGF0aEluTW9kZWxFeHByZXNzaW9uPGFueT4pID0+IHtcblx0XHRcdGFsbFBhcnRzLnB1c2goY29uc3RhbnRQYXRoKTtcblx0XHRcdHJldHVybiBwYXRoSW5Nb2RlbChgJCR7cGF0aElkeCsrfWAsIFwiJFwiKTtcblx0XHR9KTtcblx0XHRhbGxQYXJ0cy51bnNoaWZ0KGNvbnN0YW50KEpTT04uc3RyaW5naWZ5KG15Q29uY2F0RXhwcmVzc2lvbikpKTtcblx0XHRyZXR1cm4gZm9ybWF0UmVzdWx0KGFsbFBhcnRzLCBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuU3RhbmRhcmRGb3JtYXR0ZXIjZXZhbHVhdGVDb21wbGV4RXhwcmVzc2lvblwiLCB1bmRlZmluZWQsIHRydWUpO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0X3R5cGU6IFwiQ29uY2F0XCIsXG5cdFx0ZXhwcmVzc2lvbnM6IGV4cHJlc3Npb25zXG5cdH07XG59XG5cbmV4cG9ydCB0eXBlIFRyYW5zZm9ybUZ1bmN0aW9uID0gPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlIHwgdW5rbm93bj4oZXhwcmVzc2lvblBhcnQ6IGFueSkgPT4gQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuZXhwb3J0IHR5cGUgRXhwcmVzc2lvblR5cGUgPSBQaWNrPEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+LCBcIl90eXBlXCI+W1wiX3R5cGVcIl07XG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtUmVjdXJzaXZlbHk8VCBleHRlbmRzIFByaW1pdGl2ZVR5cGUgfCB1bmtub3duPihcblx0aW5FeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD4sXG5cdGV4cHJlc3Npb25UeXBlOiBFeHByZXNzaW9uVHlwZSxcblx0dHJhbnNmb3JtRnVuY3Rpb246IFRyYW5zZm9ybUZ1bmN0aW9uLFxuXHRpbmNsdWRlQWxsRXhwcmVzc2lvbiA9IGZhbHNlXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD4ge1xuXHRsZXQgZXhwcmVzc2lvbiA9IGluRXhwcmVzc2lvbjtcblx0c3dpdGNoIChleHByZXNzaW9uLl90eXBlKSB7XG5cdFx0Y2FzZSBcIkZ1bmN0aW9uXCI6XG5cdFx0Y2FzZSBcIkZvcm1hdHRlclwiOlxuXHRcdFx0ZXhwcmVzc2lvbi5wYXJhbWV0ZXJzID0gZXhwcmVzc2lvbi5wYXJhbWV0ZXJzLm1hcCgocGFyYW1ldGVyKSA9PlxuXHRcdFx0XHR0cmFuc2Zvcm1SZWN1cnNpdmVseShwYXJhbWV0ZXIsIGV4cHJlc3Npb25UeXBlLCB0cmFuc2Zvcm1GdW5jdGlvbiwgaW5jbHVkZUFsbEV4cHJlc3Npb24pXG5cdFx0XHQpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkNvbmNhdFwiOlxuXHRcdFx0ZXhwcmVzc2lvbi5leHByZXNzaW9ucyA9IGV4cHJlc3Npb24uZXhwcmVzc2lvbnMubWFwKChzdWJFeHByZXNzaW9uKSA9PlxuXHRcdFx0XHR0cmFuc2Zvcm1SZWN1cnNpdmVseShzdWJFeHByZXNzaW9uLCBleHByZXNzaW9uVHlwZSwgdHJhbnNmb3JtRnVuY3Rpb24sIGluY2x1ZGVBbGxFeHByZXNzaW9uKVxuXHRcdFx0KTtcblx0XHRcdGV4cHJlc3Npb24gPSBjb25jYXQoLi4uZXhwcmVzc2lvbi5leHByZXNzaW9ucykgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkNvbXBsZXhUeXBlXCI6XG5cdFx0XHRleHByZXNzaW9uLmJpbmRpbmdQYXJhbWV0ZXJzID0gZXhwcmVzc2lvbi5iaW5kaW5nUGFyYW1ldGVycy5tYXAoKGJpbmRpbmdQYXJhbWV0ZXIpID0+XG5cdFx0XHRcdHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KGJpbmRpbmdQYXJhbWV0ZXIsIGV4cHJlc3Npb25UeXBlLCB0cmFuc2Zvcm1GdW5jdGlvbiwgaW5jbHVkZUFsbEV4cHJlc3Npb24pXG5cdFx0XHQpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIklmRWxzZVwiOlxuXHRcdFx0Y29uc3Qgb25UcnVlID0gdHJhbnNmb3JtUmVjdXJzaXZlbHkoZXhwcmVzc2lvbi5vblRydWUsIGV4cHJlc3Npb25UeXBlLCB0cmFuc2Zvcm1GdW5jdGlvbiwgaW5jbHVkZUFsbEV4cHJlc3Npb24pO1xuXHRcdFx0Y29uc3Qgb25GYWxzZSA9IHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KGV4cHJlc3Npb24ub25GYWxzZSwgZXhwcmVzc2lvblR5cGUsIHRyYW5zZm9ybUZ1bmN0aW9uLCBpbmNsdWRlQWxsRXhwcmVzc2lvbik7XG5cdFx0XHRsZXQgY29uZGl0aW9uID0gZXhwcmVzc2lvbi5jb25kaXRpb247XG5cdFx0XHRpZiAoaW5jbHVkZUFsbEV4cHJlc3Npb24pIHtcblx0XHRcdFx0Y29uZGl0aW9uID0gdHJhbnNmb3JtUmVjdXJzaXZlbHkoZXhwcmVzc2lvbi5jb25kaXRpb24sIGV4cHJlc3Npb25UeXBlLCB0cmFuc2Zvcm1GdW5jdGlvbiwgaW5jbHVkZUFsbEV4cHJlc3Npb24pO1xuXHRcdFx0fVxuXHRcdFx0ZXhwcmVzc2lvbiA9IGlmRWxzZShjb25kaXRpb24sIG9uVHJ1ZSwgb25GYWxzZSkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIk5vdFwiOlxuXHRcdFx0aWYgKGluY2x1ZGVBbGxFeHByZXNzaW9uKSB7XG5cdFx0XHRcdGNvbnN0IG9wZXJhbmQgPSB0cmFuc2Zvcm1SZWN1cnNpdmVseShleHByZXNzaW9uLm9wZXJhbmQsIGV4cHJlc3Npb25UeXBlLCB0cmFuc2Zvcm1GdW5jdGlvbiwgaW5jbHVkZUFsbEV4cHJlc3Npb24pO1xuXHRcdFx0XHRleHByZXNzaW9uID0gbm90KG9wZXJhbmQpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJUcnV0aHlcIjpcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJTZXRcIjpcblx0XHRcdGlmIChpbmNsdWRlQWxsRXhwcmVzc2lvbikge1xuXHRcdFx0XHRjb25zdCBvcGVyYW5kcyA9IGV4cHJlc3Npb24ub3BlcmFuZHMubWFwKChvcGVyYW5kKSA9PlxuXHRcdFx0XHRcdHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KG9wZXJhbmQsIGV4cHJlc3Npb25UeXBlLCB0cmFuc2Zvcm1GdW5jdGlvbiwgaW5jbHVkZUFsbEV4cHJlc3Npb24pXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGV4cHJlc3Npb24gPVxuXHRcdFx0XHRcdGV4cHJlc3Npb24ub3BlcmF0b3IgPT09IFwifHxcIlxuXHRcdFx0XHRcdFx0PyAob3IoLi4ub3BlcmFuZHMpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPilcblx0XHRcdFx0XHRcdDogKGFuZCguLi5vcGVyYW5kcykgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+KTtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJDb21wYXJpc29uXCI6XG5cdFx0XHRpZiAoaW5jbHVkZUFsbEV4cHJlc3Npb24pIHtcblx0XHRcdFx0Y29uc3Qgb3BlcmFuZDEgPSB0cmFuc2Zvcm1SZWN1cnNpdmVseShleHByZXNzaW9uLm9wZXJhbmQxLCBleHByZXNzaW9uVHlwZSwgdHJhbnNmb3JtRnVuY3Rpb24sIGluY2x1ZGVBbGxFeHByZXNzaW9uKTtcblx0XHRcdFx0Y29uc3Qgb3BlcmFuZDIgPSB0cmFuc2Zvcm1SZWN1cnNpdmVseShleHByZXNzaW9uLm9wZXJhbmQyLCBleHByZXNzaW9uVHlwZSwgdHJhbnNmb3JtRnVuY3Rpb24sIGluY2x1ZGVBbGxFeHByZXNzaW9uKTtcblx0XHRcdFx0ZXhwcmVzc2lvbiA9IGNvbXBhcmlzb24oZXhwcmVzc2lvbi5vcGVyYXRvciwgb3BlcmFuZDEsIG9wZXJhbmQyKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiUmVmXCI6XG5cdFx0Y2FzZSBcIkxlbmd0aFwiOlxuXHRcdGNhc2UgXCJQYXRoSW5Nb2RlbFwiOlxuXHRcdGNhc2UgXCJDb25zdGFudFwiOlxuXHRcdGNhc2UgXCJFbWJlZGRlZEJpbmRpbmdcIjpcblx0XHRjYXNlIFwiRW1iZWRkZWRFeHByZXNzaW9uQmluZGluZ1wiOlxuXHRcdGNhc2UgXCJVbnJlc29sdmFibGVcIjpcblx0XHRcdC8vIERvIG5vdGhpbmdcblx0XHRcdGJyZWFrO1xuXHR9XG5cdGlmIChleHByZXNzaW9uVHlwZSA9PT0gZXhwcmVzc2lvbi5fdHlwZSkge1xuXHRcdGV4cHJlc3Npb24gPSB0cmFuc2Zvcm1GdW5jdGlvbihpbkV4cHJlc3Npb24pO1xuXHR9XG5cdHJldHVybiBleHByZXNzaW9uO1xufVxuXG5leHBvcnQgdHlwZSBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiA9IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuY29uc3QgbmVlZFBhcmVudGhlc2lzID0gZnVuY3Rpb24gPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihleHByOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8VD4pOiBib29sZWFuIHtcblx0cmV0dXJuIChcblx0XHQhaXNDb25zdGFudChleHByKSAmJlxuXHRcdCFpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbihleHByKSAmJlxuXHRcdGlzQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uKGV4cHIpICYmXG5cdFx0ZXhwci5fdHlwZSAhPT0gXCJJZkVsc2VcIiAmJlxuXHRcdGV4cHIuX3R5cGUgIT09IFwiRnVuY3Rpb25cIlxuXHQpO1xufTtcblxuLyoqXG4gKiBDb21waWxlcyBhIGNvbnN0YW50IG9iamVjdCB0byBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gZXhwclxuICogQHBhcmFtIGlzTnVsbGFibGVcbiAqIEByZXR1cm5zIFRoZSBjb21waWxlZCBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gY29tcGlsZUNvbnN0YW50T2JqZWN0KGV4cHI6IENvbnN0YW50RXhwcmVzc2lvbjxvYmplY3Q+LCBpc051bGxhYmxlID0gZmFsc2UpIHtcblx0aWYgKGlzTnVsbGFibGUgJiYgT2JqZWN0LmtleXMoZXhwci52YWx1ZSkubGVuZ3RoID09PSAwKSB7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblx0Y29uc3Qgb2JqZWN0cyA9IGV4cHIudmFsdWUgYXMgUGxhaW5FeHByZXNzaW9uT2JqZWN0O1xuXHRjb25zdCBwcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRPYmplY3Qua2V5cyhvYmplY3RzKS5mb3JFYWNoKChrZXkpID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IG9iamVjdHNba2V5XTtcblx0XHRjb25zdCBjaGlsZFJlc3VsdCA9IGNvbXBpbGVFeHByZXNzaW9uKHZhbHVlLCB0cnVlLCBmYWxzZSwgaXNOdWxsYWJsZSk7XG5cdFx0aWYgKGNoaWxkUmVzdWx0ICYmIGNoaWxkUmVzdWx0Lmxlbmd0aCA+IDApIHtcblx0XHRcdHByb3BlcnRpZXMucHVzaChgJHtrZXl9OiAke2NoaWxkUmVzdWx0fWApO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBgeyR7cHJvcGVydGllcy5qb2luKFwiLCBcIil9fWA7XG59XG5cbi8qKlxuICogQ29tcGlsZXMgYSBDb25zdGFudCBCaW5kaW5nIEV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIGV4cHJcbiAqIEBwYXJhbSBlbWJlZGRlZEluQmluZGluZ1xuICogQHBhcmFtIGlzTnVsbGFibGVcbiAqIEBwYXJhbSBkb05vdFN0cmluZ2lmeVxuICogQHJldHVybnMgVGhlIGNvbXBpbGVkIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUNvbnN0YW50PFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihcblx0ZXhwcjogQ29uc3RhbnRFeHByZXNzaW9uPFQ+LFxuXHRlbWJlZGRlZEluQmluZGluZzogYm9vbGVhbixcblx0aXNOdWxsYWJsZT86IGJvb2xlYW4sXG5cdGRvTm90U3RyaW5naWZ5PzogZmFsc2Vcbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVDb25zdGFudDxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdGV4cHI6IENvbnN0YW50RXhwcmVzc2lvbjxUPixcblx0ZW1iZWRkZWRJbkJpbmRpbmc6IGJvb2xlYW4sXG5cdGlzTnVsbGFibGU/OiBib29sZWFuLFxuXHRkb05vdFN0cmluZ2lmeT86IHRydWVcbik6IGFueTtcbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlQ29uc3RhbnQ8VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHRleHByOiBDb25zdGFudEV4cHJlc3Npb248VD4sXG5cdGVtYmVkZGVkSW5CaW5kaW5nOiBib29sZWFuLFxuXHRpc051bGxhYmxlID0gZmFsc2UsXG5cdGRvTm90U3RyaW5naWZ5OiBib29sZWFuID0gZmFsc2Vcbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgYW55IHtcblx0aWYgKGV4cHIudmFsdWUgPT09IG51bGwpIHtcblx0XHRyZXR1cm4gZG9Ob3RTdHJpbmdpZnkgPyBudWxsIDogXCJudWxsXCI7XG5cdH1cblx0aWYgKGV4cHIudmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBkb05vdFN0cmluZ2lmeSA/IHVuZGVmaW5lZCA6IFwidW5kZWZpbmVkXCI7XG5cdH1cblx0aWYgKHR5cGVvZiBleHByLnZhbHVlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoZXhwci52YWx1ZSkpIHtcblx0XHRcdGNvbnN0IGVudHJpZXMgPSBleHByLnZhbHVlLm1hcCgoZXhwcmVzc2lvbikgPT4gY29tcGlsZUV4cHJlc3Npb24oZXhwcmVzc2lvbiwgdHJ1ZSkpO1xuXHRcdFx0cmV0dXJuIGBbJHtlbnRyaWVzLmpvaW4oXCIsIFwiKX1dYDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVDb25zdGFudE9iamVjdChleHByIGFzIENvbnN0YW50RXhwcmVzc2lvbjxvYmplY3Q+LCBpc051bGxhYmxlKTtcblx0XHR9XG5cdH1cblxuXHRpZiAoZW1iZWRkZWRJbkJpbmRpbmcpIHtcblx0XHRzd2l0Y2ggKHR5cGVvZiBleHByLnZhbHVlKSB7XG5cdFx0XHRjYXNlIFwibnVtYmVyXCI6XG5cdFx0XHRjYXNlIFwiYmlnaW50XCI6XG5cdFx0XHRjYXNlIFwiYm9vbGVhblwiOlxuXHRcdFx0XHRyZXR1cm4gZXhwci52YWx1ZS50b1N0cmluZygpO1xuXHRcdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0XHRyZXR1cm4gYCcke2VzY2FwZVhtbEF0dHJpYnV0ZShleHByLnZhbHVlLnRvU3RyaW5nKCkpfSdgO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBkb05vdFN0cmluZ2lmeSA/IGV4cHIudmFsdWUgOiBleHByLnZhbHVlLnRvU3RyaW5nKCk7XG5cdH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIGJpbmRpbmcgc3RyaW5nIGZvciBhIEJpbmRpbmcgZXhwcmVzc2lvbi5cbiAqXG4gKiBAcGFyYW0gZXhwcmVzc2lvbkZvckJpbmRpbmcgVGhlIGV4cHJlc3Npb24gdG8gY29tcGlsZVxuICogQHBhcmFtIGVtYmVkZGVkSW5CaW5kaW5nIFdoZXRoZXIgdGhlIGV4cHJlc3Npb24gdG8gY29tcGlsZSBpcyBlbWJlZGRlZCBpbnRvIGFub3RoZXIgZXhwcmVzc2lvblxuICogQHBhcmFtIGVtYmVkZGVkU2VwYXJhdG9yIFRoZSBiaW5kaW5nIHZhbHVlIGV2YWx1YXRvciAoJCBvciAlIGRlcGVuZGluZyBvbiB3aGV0aGVyIHdlIHdhbnQgdG8gZm9yY2UgdGhlIHR5cGUgb3Igbm90KVxuICogQHJldHVybnMgVGhlIGNvcnJlc3BvbmRpbmcgZXhwcmVzc2lvbiBiaW5kaW5nXG4gKi9cbmZ1bmN0aW9uIGNvbXBpbGVQYXRoSW5Nb2RlbEV4cHJlc3Npb248VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHRleHByZXNzaW9uRm9yQmluZGluZzogUGF0aEluTW9kZWxFeHByZXNzaW9uPFQ+LFxuXHRlbWJlZGRlZEluQmluZGluZzogYm9vbGVhbixcblx0ZW1iZWRkZWRTZXBhcmF0b3I6IHN0cmluZ1xuKSB7XG5cdGlmIChcblx0XHRleHByZXNzaW9uRm9yQmluZGluZy50eXBlIHx8XG5cdFx0ZXhwcmVzc2lvbkZvckJpbmRpbmcucGFyYW1ldGVycyB8fFxuXHRcdGV4cHJlc3Npb25Gb3JCaW5kaW5nLnRhcmdldFR5cGUgfHxcblx0XHRleHByZXNzaW9uRm9yQmluZGluZy5mb3JtYXRPcHRpb25zIHx8XG5cdFx0ZXhwcmVzc2lvbkZvckJpbmRpbmcuY29uc3RyYWludHNcblx0KSB7XG5cdFx0Ly8gVGhpcyBpcyBub3cgYSBjb21wbGV4IGJpbmRpbmcgZGVmaW5pdGlvbiwgbGV0J3MgcHJlcGFyZSBmb3IgaXRcblx0XHRjb25zdCBjb21wbGV4QmluZGluZ0RlZmluaXRpb24gPSB7XG5cdFx0XHRwYXRoOiBjb21waWxlUGF0aEluTW9kZWwoZXhwcmVzc2lvbkZvckJpbmRpbmcpLFxuXHRcdFx0dHlwZTogZXhwcmVzc2lvbkZvckJpbmRpbmcudHlwZSxcblx0XHRcdHRhcmdldFR5cGU6IGV4cHJlc3Npb25Gb3JCaW5kaW5nLnRhcmdldFR5cGUsXG5cdFx0XHRwYXJhbWV0ZXJzOiBleHByZXNzaW9uRm9yQmluZGluZy5wYXJhbWV0ZXJzLFxuXHRcdFx0Zm9ybWF0T3B0aW9uczogZXhwcmVzc2lvbkZvckJpbmRpbmcuZm9ybWF0T3B0aW9ucyxcblx0XHRcdGNvbnN0cmFpbnRzOiBleHByZXNzaW9uRm9yQmluZGluZy5jb25zdHJhaW50c1xuXHRcdH07XG5cdFx0Y29uc3Qgb3V0QmluZGluZyA9IGNvbXBpbGVFeHByZXNzaW9uKGNvbXBsZXhCaW5kaW5nRGVmaW5pdGlvbiwgZmFsc2UsIGZhbHNlLCB0cnVlKTtcblx0XHRpZiAoZW1iZWRkZWRJbkJpbmRpbmcpIHtcblx0XHRcdHJldHVybiBgJHtlbWJlZGRlZFNlcGFyYXRvcn0ke291dEJpbmRpbmd9YDtcblx0XHR9XG5cdFx0cmV0dXJuIG91dEJpbmRpbmc7XG5cdH0gZWxzZSBpZiAoZW1iZWRkZWRJbkJpbmRpbmcpIHtcblx0XHRyZXR1cm4gYCR7ZW1iZWRkZWRTZXBhcmF0b3J9eyR7Y29tcGlsZVBhdGhJbk1vZGVsKGV4cHJlc3Npb25Gb3JCaW5kaW5nKX19YDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gYHske2NvbXBpbGVQYXRoSW5Nb2RlbChleHByZXNzaW9uRm9yQmluZGluZyl9fWA7XG5cdH1cbn1cblxuZnVuY3Rpb24gY29tcGlsZUNvbXBsZXhUeXBlRXhwcmVzc2lvbjxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oZXhwcmVzc2lvbjogQ29tcGxleFR5cGVFeHByZXNzaW9uPFQ+KSB7XG5cdGlmIChleHByZXNzaW9uLmJpbmRpbmdQYXJhbWV0ZXJzLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBgeyR7Y29tcGlsZVBhdGhQYXJhbWV0ZXIoZXhwcmVzc2lvbi5iaW5kaW5nUGFyYW1ldGVyc1swXSwgdHJ1ZSl9LCB0eXBlOiAnJHtleHByZXNzaW9uLnR5cGV9J31gO1xuXHR9XG5cblx0bGV0IG91dHB1dEVuZCA9IGBdLCB0eXBlOiAnJHtleHByZXNzaW9uLnR5cGV9J2A7XG5cdGlmIChoYXNFbGVtZW50cyhleHByZXNzaW9uLmZvcm1hdE9wdGlvbnMpKSB7XG5cdFx0b3V0cHV0RW5kICs9IGAsIGZvcm1hdE9wdGlvbnM6ICR7Y29tcGlsZUV4cHJlc3Npb24oZXhwcmVzc2lvbi5mb3JtYXRPcHRpb25zKX1gO1xuXHR9XG5cdGlmIChoYXNFbGVtZW50cyhleHByZXNzaW9uLnBhcmFtZXRlcnMpKSB7XG5cdFx0b3V0cHV0RW5kICs9IGAsIHBhcmFtZXRlcnM6ICR7Y29tcGlsZUV4cHJlc3Npb24oZXhwcmVzc2lvbi5wYXJhbWV0ZXJzKX1gO1xuXHR9XG5cdG91dHB1dEVuZCArPSBcIn1cIjtcblxuXHRyZXR1cm4gYHttb2RlOidUd29XYXknLCBwYXJ0czpbJHtleHByZXNzaW9uLmJpbmRpbmdQYXJhbWV0ZXJzLm1hcCgocGFyYW06IGFueSkgPT4gY29tcGlsZVBhdGhQYXJhbWV0ZXIocGFyYW0pKS5qb2luKFwiLFwiKX0ke291dHB1dEVuZH1gO1xufVxuXG4vKipcbiAqIFdyYXAgdGhlIGNvbXBpbGVkIGJpbmRpbmcgc3RyaW5nIGFzIHJlcXVpcmVkIGRlcGVuZGluZyBvbiBpdHMgY29udGV4dC5cbiAqXG4gKiBAcGFyYW0gZXhwcmVzc2lvbiBUaGUgY29tcGlsZWQgZXhwcmVzc2lvblxuICogQHBhcmFtIGVtYmVkZGVkSW5CaW5kaW5nIFRydWUgaWYgdGhlIGNvbXBpbGVkIGV4cHJlc3Npb24gaXMgdG8gYmUgZW1iZWRkZWQgaW4gYSBiaW5kaW5nXG4gKiBAcGFyYW0gcGFyZW50aGVzaXNSZXF1aXJlZCBUcnVlIGlmIHRoZSBlbWJlZGRlZCBiaW5kaW5nIG5lZWRzIHRvIGJlIHdyYXBwZWQgaW4gcGFyZXRoZXNpcyBzbyB0aGF0IGl0IGlzIGV2YWx1YXRlZCBhcyBvbmVcbiAqIEByZXR1cm5zIEZpbmFsaXplZCBjb21waWxlZCBleHByZXNzaW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cmFwQmluZGluZ0V4cHJlc3Npb24oXG5cdGV4cHJlc3Npb246IHN0cmluZyxcblx0ZW1iZWRkZWRJbkJpbmRpbmc6IGJvb2xlYW4sXG5cdHBhcmVudGhlc2lzUmVxdWlyZWQgPSBmYWxzZVxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRpZiAoZW1iZWRkZWRJbkJpbmRpbmcpIHtcblx0XHRpZiAocGFyZW50aGVzaXNSZXF1aXJlZCkge1xuXHRcdFx0cmV0dXJuIGAoJHtleHByZXNzaW9ufSlgO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZXhwcmVzc2lvbjtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGB7PSAke2V4cHJlc3Npb259fWA7XG5cdH1cbn1cblxuLyoqXG4gKiBDb21waWxlIGFuIGV4cHJlc3Npb24gaW50byBhbiBleHByZXNzaW9uIGJpbmRpbmcuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHRhcmdldCB0eXBlXG4gKiBAcGFyYW0gZXhwcmVzc2lvbiBUaGUgZXhwcmVzc2lvbiB0byBjb21waWxlXG4gKiBAcGFyYW0gZW1iZWRkZWRJbkJpbmRpbmcgV2hldGhlciB0aGUgZXhwcmVzc2lvbiB0byBjb21waWxlIGlzIGVtYmVkZGVkIGludG8gYW5vdGhlciBleHByZXNzaW9uXG4gKiBAcGFyYW0ga2VlcFRhcmdldFR5cGUgS2VlcCB0aGUgdGFyZ2V0IHR5cGUgb2YgdGhlIGVtYmVkZGVkIGJpbmRpbmdzIGluc3RlYWQgb2YgY2FzdGluZyB0aGVtIHRvIGFueVxuICogQHBhcmFtIGlzTnVsbGFibGUgV2hldGhlciBiaW5kaW5nIGV4cHJlc3Npb24gY2FuIHJlc29sdmUgdG8gZW1wdHkgc3RyaW5nIG9yIG5vdFxuICogQHJldHVybnMgVGhlIGNvcnJlc3BvbmRpbmcgZXhwcmVzc2lvbiBiaW5kaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlRXhwcmVzc2lvbjxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdGV4cHJlc3Npb246IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPixcblx0ZW1iZWRkZWRJbkJpbmRpbmcgPSBmYWxzZSxcblx0a2VlcFRhcmdldFR5cGUgPSBmYWxzZSxcblx0aXNOdWxsYWJsZSA9IGZhbHNlXG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdGNvbnN0IGV4cHIgPSB3cmFwUHJpbWl0aXZlKGV4cHJlc3Npb24pO1xuXHRjb25zdCBlbWJlZGRlZFNlcGFyYXRvciA9IGtlZXBUYXJnZXRUeXBlID8gXCIkXCIgOiBcIiVcIjtcblxuXHRzd2l0Y2ggKGV4cHIuX3R5cGUpIHtcblx0XHRjYXNlIFwiVW5yZXNvbHZhYmxlXCI6XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Y2FzZSBcIkNvbnN0YW50XCI6XG5cdFx0XHRyZXR1cm4gY29tcGlsZUNvbnN0YW50KGV4cHIsIGVtYmVkZGVkSW5CaW5kaW5nLCBpc051bGxhYmxlKTtcblxuXHRcdGNhc2UgXCJSZWZcIjpcblx0XHRcdHJldHVybiBleHByLnJlZiB8fCBcIm51bGxcIjtcblxuXHRcdGNhc2UgXCJGdW5jdGlvblwiOlxuXHRcdFx0Y29uc3QgYXJndW1lbnRTdHJpbmcgPSBgJHtleHByLnBhcmFtZXRlcnMubWFwKChhcmcpID0+IGNvbXBpbGVFeHByZXNzaW9uKGFyZywgdHJ1ZSkpLmpvaW4oXCIsIFwiKX1gO1xuXHRcdFx0cmV0dXJuIGV4cHIub2JqID09PSB1bmRlZmluZWRcblx0XHRcdFx0PyBgJHtleHByLmZufSgke2FyZ3VtZW50U3RyaW5nfSlgXG5cdFx0XHRcdDogYCR7Y29tcGlsZUV4cHJlc3Npb24oZXhwci5vYmosIHRydWUpfS4ke2V4cHIuZm59KCR7YXJndW1lbnRTdHJpbmd9KWA7XG5cblx0XHRjYXNlIFwiRW1iZWRkZWRFeHByZXNzaW9uQmluZGluZ1wiOlxuXHRcdFx0cmV0dXJuIGVtYmVkZGVkSW5CaW5kaW5nID8gYCgke2V4cHIudmFsdWUuc3Vic3RyaW5nKDIsIGV4cHIudmFsdWUubGVuZ3RoIC0gMSl9KWAgOiBgJHtleHByLnZhbHVlfWA7XG5cblx0XHRjYXNlIFwiRW1iZWRkZWRCaW5kaW5nXCI6XG5cdFx0XHRyZXR1cm4gZW1iZWRkZWRJbkJpbmRpbmcgPyBgJHtlbWJlZGRlZFNlcGFyYXRvcn0ke2V4cHIudmFsdWV9YCA6IGAke2V4cHIudmFsdWV9YDtcblxuXHRcdGNhc2UgXCJQYXRoSW5Nb2RlbFwiOlxuXHRcdFx0cmV0dXJuIGNvbXBpbGVQYXRoSW5Nb2RlbEV4cHJlc3Npb24oZXhwciwgZW1iZWRkZWRJbkJpbmRpbmcsIGVtYmVkZGVkU2VwYXJhdG9yKTtcblxuXHRcdGNhc2UgXCJDb21wYXJpc29uXCI6XG5cdFx0XHRjb25zdCBjb21wYXJpc29uRXhwcmVzc2lvbiA9IGNvbXBpbGVDb21wYXJpc29uRXhwcmVzc2lvbihleHByKTtcblx0XHRcdHJldHVybiB3cmFwQmluZGluZ0V4cHJlc3Npb24oY29tcGFyaXNvbkV4cHJlc3Npb24sIGVtYmVkZGVkSW5CaW5kaW5nKTtcblxuXHRcdGNhc2UgXCJJZkVsc2VcIjpcblx0XHRcdGNvbnN0IGlmRWxzZUV4cHJlc3Npb24gPSBgJHtjb21waWxlRXhwcmVzc2lvbihleHByLmNvbmRpdGlvbiwgdHJ1ZSl9ID8gJHtjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0ZXhwci5vblRydWUsXG5cdFx0XHRcdHRydWVcblx0XHRcdCl9IDogJHtjb21waWxlRXhwcmVzc2lvbihleHByLm9uRmFsc2UsIHRydWUpfWA7XG5cdFx0XHRyZXR1cm4gd3JhcEJpbmRpbmdFeHByZXNzaW9uKGlmRWxzZUV4cHJlc3Npb24sIGVtYmVkZGVkSW5CaW5kaW5nLCB0cnVlKTtcblxuXHRcdGNhc2UgXCJTZXRcIjpcblx0XHRcdGNvbnN0IHNldEV4cHJlc3Npb24gPSBleHByLm9wZXJhbmRzLm1hcCgob3BlcmFuZCkgPT4gY29tcGlsZUV4cHJlc3Npb24ob3BlcmFuZCwgdHJ1ZSkpLmpvaW4oYCAke2V4cHIub3BlcmF0b3J9IGApO1xuXHRcdFx0cmV0dXJuIHdyYXBCaW5kaW5nRXhwcmVzc2lvbihzZXRFeHByZXNzaW9uLCBlbWJlZGRlZEluQmluZGluZywgdHJ1ZSk7XG5cblx0XHRjYXNlIFwiQ29uY2F0XCI6XG5cdFx0XHRjb25zdCBjb25jYXRFeHByZXNzaW9uID0gZXhwci5leHByZXNzaW9uc1xuXHRcdFx0XHQubWFwKChuZXN0ZWRFeHByZXNzaW9uKSA9PiBjb21waWxlRXhwcmVzc2lvbihuZXN0ZWRFeHByZXNzaW9uLCB0cnVlLCB0cnVlKSlcblx0XHRcdFx0LmpvaW4oXCIgKyBcIik7XG5cdFx0XHRyZXR1cm4gd3JhcEJpbmRpbmdFeHByZXNzaW9uKGNvbmNhdEV4cHJlc3Npb24sIGVtYmVkZGVkSW5CaW5kaW5nKTtcblxuXHRcdGNhc2UgXCJMZW5ndGhcIjpcblx0XHRcdGNvbnN0IGxlbmd0aEV4cHJlc3Npb24gPSBgJHtjb21waWxlRXhwcmVzc2lvbihleHByLnBhdGhJbk1vZGVsLCB0cnVlKX0ubGVuZ3RoYDtcblx0XHRcdHJldHVybiB3cmFwQmluZGluZ0V4cHJlc3Npb24obGVuZ3RoRXhwcmVzc2lvbiwgZW1iZWRkZWRJbkJpbmRpbmcpO1xuXG5cdFx0Y2FzZSBcIk5vdFwiOlxuXHRcdFx0Y29uc3Qgbm90RXhwcmVzc2lvbiA9IGAhJHtjb21waWxlRXhwcmVzc2lvbihleHByLm9wZXJhbmQsIHRydWUpfWA7XG5cdFx0XHRyZXR1cm4gd3JhcEJpbmRpbmdFeHByZXNzaW9uKG5vdEV4cHJlc3Npb24sIGVtYmVkZGVkSW5CaW5kaW5nKTtcblxuXHRcdGNhc2UgXCJUcnV0aHlcIjpcblx0XHRcdGNvbnN0IHRydXRoeUV4cHJlc3Npb24gPSBgISEke2NvbXBpbGVFeHByZXNzaW9uKGV4cHIub3BlcmFuZCwgdHJ1ZSl9YDtcblx0XHRcdHJldHVybiB3cmFwQmluZGluZ0V4cHJlc3Npb24odHJ1dGh5RXhwcmVzc2lvbiwgZW1iZWRkZWRJbkJpbmRpbmcpO1xuXG5cdFx0Y2FzZSBcIkZvcm1hdHRlclwiOlxuXHRcdFx0Y29uc3QgZm9ybWF0dGVyRXhwcmVzc2lvbiA9IGNvbXBpbGVGb3JtYXR0ZXJFeHByZXNzaW9uKGV4cHIpO1xuXHRcdFx0cmV0dXJuIGVtYmVkZGVkSW5CaW5kaW5nID8gYCQke2Zvcm1hdHRlckV4cHJlc3Npb259YCA6IGZvcm1hdHRlckV4cHJlc3Npb247XG5cblx0XHRjYXNlIFwiQ29tcGxleFR5cGVcIjpcblx0XHRcdGNvbnN0IGNvbXBsZXhUeXBlRXhwcmVzc2lvbiA9IGNvbXBpbGVDb21wbGV4VHlwZUV4cHJlc3Npb24oZXhwcik7XG5cdFx0XHRyZXR1cm4gZW1iZWRkZWRJbkJpbmRpbmcgPyBgJCR7Y29tcGxleFR5cGVFeHByZXNzaW9ufWAgOiBjb21wbGV4VHlwZUV4cHJlc3Npb247XG5cblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdH1cbn1cblxuLyoqXG4gKiBDb21waWxlIGEgY29tcGFyaXNvbiBleHByZXNzaW9uLlxuICpcbiAqIEBwYXJhbSBleHByZXNzaW9uIFRoZSBjb21wYXJpc29uIGV4cHJlc3Npb24uXG4gKiBAcmV0dXJucyBUaGUgY29tcGlsZWQgZXhwcmVzc2lvbi4gTmVlZHMgd3JhcHBpbmcgYmVmb3JlIGl0IGNhbiBiZSB1c2VkIGFzIGFuIGV4cHJlc3Npb24gYmluZGluZy5cbiAqL1xuZnVuY3Rpb24gY29tcGlsZUNvbXBhcmlzb25FeHByZXNzaW9uKGV4cHJlc3Npb246IENvbXBhcmlzb25FeHByZXNzaW9uKSB7XG5cdGZ1bmN0aW9uIGNvbXBpbGVPcGVyYW5kKG9wZXJhbmQ6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+KSB7XG5cdFx0Y29uc3QgY29tcGlsZWRPcGVyYW5kID0gY29tcGlsZUV4cHJlc3Npb24ob3BlcmFuZCwgdHJ1ZSkgPz8gXCJ1bmRlZmluZWRcIjtcblx0XHRyZXR1cm4gd3JhcEJpbmRpbmdFeHByZXNzaW9uKGNvbXBpbGVkT3BlcmFuZCwgdHJ1ZSwgbmVlZFBhcmVudGhlc2lzKG9wZXJhbmQpKTtcblx0fVxuXG5cdHJldHVybiBgJHtjb21waWxlT3BlcmFuZChleHByZXNzaW9uLm9wZXJhbmQxKX0gJHtleHByZXNzaW9uLm9wZXJhdG9yfSAke2NvbXBpbGVPcGVyYW5kKGV4cHJlc3Npb24ub3BlcmFuZDIpfWA7XG59XG5cbi8qKlxuICogQ29tcGlsZSBhIGZvcm1hdHRlciBleHByZXNzaW9uLlxuICpcbiAqIEBwYXJhbSBleHByZXNzaW9uIFRoZSBmb3JtYXR0ZXIgZXhwcmVzc2lvbi5cbiAqIEByZXR1cm5zIFRoZSBjb21waWxlZCBleHByZXNzaW9uLlxuICovXG5mdW5jdGlvbiBjb21waWxlRm9ybWF0dGVyRXhwcmVzc2lvbjxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oZXhwcmVzc2lvbjogRm9ybWF0dGVyRXhwcmVzc2lvbjxUPikge1xuXHRpZiAoZXhwcmVzc2lvbi5wYXJhbWV0ZXJzLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBgeyR7Y29tcGlsZVBhdGhQYXJhbWV0ZXIoZXhwcmVzc2lvbi5wYXJhbWV0ZXJzWzBdLCB0cnVlKX0sIGZvcm1hdHRlcjogJyR7ZXhwcmVzc2lvbi5mbn0nfWA7XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgcGFydHMgPSBleHByZXNzaW9uLnBhcmFtZXRlcnMubWFwKChwYXJhbSkgPT4ge1xuXHRcdFx0aWYgKHBhcmFtLl90eXBlID09PSBcIkNvbXBsZXhUeXBlXCIpIHtcblx0XHRcdFx0cmV0dXJuIGNvbXBpbGVDb21wbGV4VHlwZUV4cHJlc3Npb24ocGFyYW0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGNvbXBpbGVQYXRoUGFyYW1ldGVyKHBhcmFtKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gYHtwYXJ0czogWyR7cGFydHMuam9pbihcIiwgXCIpfV0sIGZvcm1hdHRlcjogJyR7ZXhwcmVzc2lvbi5mbn0nfWA7XG5cdH1cbn1cblxuLyoqXG4gKiBDb21waWxlIHRoZSBwYXRoIHBhcmFtZXRlciBvZiBhIGZvcm1hdHRlciBjYWxsLlxuICpcbiAqIEBwYXJhbSBleHByZXNzaW9uIFRoZSBiaW5kaW5nIHBhcnQgdG8gZXZhbHVhdGVcbiAqIEBwYXJhbSBzaW5nbGVQYXRoIFdoZXRoZXIgdGhlcmUgaXMgb25lIG9yIG11bHRpcGxlIHBhdGggdG8gY29uc2lkZXJcbiAqIEByZXR1cm5zIFRoZSBzdHJpbmcgc25pcHBldCB0byBpbmNsdWRlIGluIHRoZSBvdmVyYWxsIGJpbmRpbmcgZGVmaW5pdGlvblxuICovXG5mdW5jdGlvbiBjb21waWxlUGF0aFBhcmFtZXRlcihleHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55Piwgc2luZ2xlUGF0aCA9IGZhbHNlKTogc3RyaW5nIHtcblx0bGV0IG91dFZhbHVlID0gXCJcIjtcblx0aWYgKGV4cHJlc3Npb24uX3R5cGUgPT09IFwiQ29uc3RhbnRcIikge1xuXHRcdGlmIChleHByZXNzaW9uLnZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIFNwZWNpYWwgY2FzZSBvdGhlcndpc2UgdGhlIEpTVG9rZW5pemVyIGNvbXBsYWlucyBhYm91dCBpbmNvcnJlY3QgY29udGVudFxuXHRcdFx0b3V0VmFsdWUgPSBgdmFsdWU6ICd1bmRlZmluZWQnYDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3V0VmFsdWUgPSBgdmFsdWU6ICR7Y29tcGlsZUNvbnN0YW50KGV4cHJlc3Npb24sIHRydWUpfWA7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGV4cHJlc3Npb24uX3R5cGUgPT09IFwiUGF0aEluTW9kZWxcIikge1xuXHRcdG91dFZhbHVlID0gYHBhdGg6ICcke2NvbXBpbGVQYXRoSW5Nb2RlbChleHByZXNzaW9uKX0nYDtcblxuXHRcdG91dFZhbHVlICs9IGV4cHJlc3Npb24udHlwZSA/IGAsIHR5cGU6ICcke2V4cHJlc3Npb24udHlwZX0nYCA6IGAsIHRhcmdldFR5cGU6ICdhbnknYDtcblx0XHRpZiAoaGFzRWxlbWVudHMoZXhwcmVzc2lvbi5tb2RlKSkge1xuXHRcdFx0b3V0VmFsdWUgKz0gYCwgbW9kZTogJyR7Y29tcGlsZUV4cHJlc3Npb24oZXhwcmVzc2lvbi5tb2RlKX0nYDtcblx0XHR9XG5cdFx0aWYgKGhhc0VsZW1lbnRzKGV4cHJlc3Npb24uY29uc3RyYWludHMpKSB7XG5cdFx0XHRvdXRWYWx1ZSArPSBgLCBjb25zdHJhaW50czogJHtjb21waWxlRXhwcmVzc2lvbihleHByZXNzaW9uLmNvbnN0cmFpbnRzKX1gO1xuXHRcdH1cblx0XHRpZiAoaGFzRWxlbWVudHMoZXhwcmVzc2lvbi5mb3JtYXRPcHRpb25zKSkge1xuXHRcdFx0b3V0VmFsdWUgKz0gYCwgZm9ybWF0T3B0aW9uczogJHtjb21waWxlRXhwcmVzc2lvbihleHByZXNzaW9uLmZvcm1hdE9wdGlvbnMpfWA7XG5cdFx0fVxuXHRcdGlmIChoYXNFbGVtZW50cyhleHByZXNzaW9uLnBhcmFtZXRlcnMpKSB7XG5cdFx0XHRvdXRWYWx1ZSArPSBgLCBwYXJhbWV0ZXJzOiAke2NvbXBpbGVFeHByZXNzaW9uKGV4cHJlc3Npb24ucGFyYW1ldGVycyl9YDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblx0cmV0dXJuIHNpbmdsZVBhdGggPyBvdXRWYWx1ZSA6IGB7JHtvdXRWYWx1ZX19YDtcbn1cblxuZnVuY3Rpb24gaGFzRWxlbWVudHMob2JqOiBhbnkpIHtcblx0cmV0dXJuIG9iaiAmJiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA+IDA7XG59XG5cbi8qKlxuICogQ29tcGlsZSBhIGJpbmRpbmcgZXhwcmVzc2lvbiBwYXRoLlxuICpcbiAqIEBwYXJhbSBleHByZXNzaW9uIFRoZSBleHByZXNzaW9uIHRvIGNvbXBpbGUuXG4gKiBAcmV0dXJucyBUaGUgY29tcGlsZWQgcGF0aC5cbiAqL1xuZnVuY3Rpb24gY29tcGlsZVBhdGhJbk1vZGVsPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihleHByZXNzaW9uOiBQYXRoSW5Nb2RlbEV4cHJlc3Npb248VD4pIHtcblx0cmV0dXJuIGAke2V4cHJlc3Npb24ubW9kZWxOYW1lID8gYCR7ZXhwcmVzc2lvbi5tb2RlbE5hbWV9PmAgOiBcIlwifSR7ZXhwcmVzc2lvbi5wYXRofWA7XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7OztFQTBLTyxNQUFNQSxnQkFBcUMsR0FBRztJQUNwRCxhQUFhLEVBQUU7TUFBRUMsSUFBSSxFQUFFO0lBQWtDLENBQUM7SUFDMUQsVUFBVSxFQUFFO01BQUVBLElBQUksRUFBRTtJQUErQixDQUFDO0lBQ3BELFVBQVUsRUFBRTtNQUFFQSxJQUFJLEVBQUU7SUFBK0IsQ0FBQztJQUNwRCxvQkFBb0IsRUFBRTtNQUNyQkMsV0FBVyxFQUFFO1FBQ1pDLFVBQVUsRUFBRSxXQUFXO1FBQ3ZCQyxHQUFHLEVBQUU7TUFDTixDQUFDO01BQ0RILElBQUksRUFBRTtJQUNQLENBQUM7SUFDRCxhQUFhLEVBQUU7TUFDZEMsV0FBVyxFQUFFO1FBQ1osMkNBQTJDLEVBQUUsU0FBUztRQUN0RCxvRUFBb0UsRUFBRSxrQkFBa0I7UUFDeEYsMkNBQTJD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