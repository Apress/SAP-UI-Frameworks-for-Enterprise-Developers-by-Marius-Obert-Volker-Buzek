/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  function isContext(potentialContext) {
    var _isA, _ref;
    return potentialContext === null || potentialContext === void 0 ? void 0 : (_isA = (_ref = potentialContext).isA) === null || _isA === void 0 ? void 0 : _isA.call(_ref, "sap.ui.model.Context");
  }
  _exports.isContext = isContext;
  function isFunctionArray(potentialFunctionArray) {
    return Array.isArray(potentialFunctionArray) && potentialFunctionArray.length > 0 && potentialFunctionArray.every(item => typeof item === "function");
  }
  _exports.isFunctionArray = isFunctionArray;
  function isAnnotationOfType(potentialAnnotationType, typeName) {
    return potentialAnnotationType.$Type === typeName;
  }

  /**
   * Checks whether the argument is a {@link ServiceObject}.
   *
   * @param serviceObject The object to be checked.
   * @returns Whether the argument is a {@link ServiceObject}.
   */
  _exports.isAnnotationOfType = isAnnotationOfType;
  function isServiceObject(serviceObject) {
    return (serviceObject === null || serviceObject === void 0 ? void 0 : serviceObject.hasOwnProperty("_type")) ?? false;
  }

  /**
   * Checks whether the argument is a {@link ComplexType}.
   *
   * @param serviceObject The object to be checked.
   * @returns Whether the argument is a {@link ComplexType}.
   */
  _exports.isServiceObject = isServiceObject;
  function isComplexType(serviceObject) {
    return (serviceObject === null || serviceObject === void 0 ? void 0 : serviceObject._type) === "ComplexType";
  }

  /**
   * Checks whether the argument is a {@link TypeDefinition}.
   *
   * @param serviceObject The object to be checked.
   * @returns Whether the argument is a {@link TypeDefinition}.
   */
  _exports.isComplexType = isComplexType;
  function isTypeDefinition(serviceObject) {
    return (serviceObject === null || serviceObject === void 0 ? void 0 : serviceObject._type) === "TypeDefinition";
  }

  /**
   * Checks whether the argument is an {@link EntityContainer}.
   *
   * @param serviceObject The object to be checked.
   * @returns Whether the argument is an {@link EntityContainer}.
   */
  _exports.isTypeDefinition = isTypeDefinition;
  function isEntityContainer(serviceObject) {
    return (serviceObject === null || serviceObject === void 0 ? void 0 : serviceObject._type) === "EntityContainer";
  }

  /**
   * Checks whether the argument is an {@link EntitySet}.
   *
   * @param serviceObject The object to be checked.
   * @returns Whether the argument is an {@link EntitySet}.
   */
  _exports.isEntityContainer = isEntityContainer;
  function isEntitySet(serviceObject) {
    return (serviceObject === null || serviceObject === void 0 ? void 0 : serviceObject._type) === "EntitySet";
  }

  /**
   * Checks whether the argument is a {@link Singleton}.
   *
   * @param serviceObject The object to be checked.
   * @returns Whether the argument is a {@link Singleton}
   */
  _exports.isEntitySet = isEntitySet;
  function isSingleton(serviceObject) {
    return (serviceObject === null || serviceObject === void 0 ? void 0 : serviceObject._type) === "Singleton";
  }

  /**
   * Checks whether the argument is an {@link EntityType}.
   *
   * @param serviceObject The object to be checked.
   * @returns Whether the argument is an {@link EntityType}
   */
  _exports.isSingleton = isSingleton;
  function isEntityType(serviceObject) {
    return (serviceObject === null || serviceObject === void 0 ? void 0 : serviceObject._type) === "EntityType";
  }

  /**
   * Checks whether the argument is a {@link Property}.
   *
   * @param serviceObject The object to be checked.
   * @returns Whether the argument is a {@link Property}.
   */
  _exports.isEntityType = isEntityType;
  function isProperty(serviceObject) {
    return (serviceObject === null || serviceObject === void 0 ? void 0 : serviceObject._type) === "Property";
  }

  /**
   * Checks whether the argument is a {@link NavigationProperty}.
   *
   * Hint: There are also the more specific functions {@link isSingleNavigationProperty} and {@link isMultipleNavigationProperty}. These can be
   * used to check for to-one and to-many navigation properties, respectively.
   *
   * @param serviceObject The object to be checked.
   * @returns Whether the argument is a {@link NavigationProperty}.
   */
  _exports.isProperty = isProperty;
  function isNavigationProperty(serviceObject) {
    return (serviceObject === null || serviceObject === void 0 ? void 0 : serviceObject._type) === "NavigationProperty";
  }

  /**
   * Checks whether the argument is a {@link SingleNavigationProperty}.
   *
   * @param serviceObject The object to be checked.
   * @returns Whether the argument is a {@link SingleNavigationProperty}.
   */
  _exports.isNavigationProperty = isNavigationProperty;
  function isSingleNavigationProperty(serviceObject) {
    return isNavigationProperty(serviceObject) && !serviceObject.isCollection;
  }

  /**
   * Checks whether the argument is a {@link MultipleNavigationProperty}.
   *
   * @param serviceObject The object to be checked.
   * @returns Whether the argument is a {@link MultipleNavigationProperty}.
   */
  _exports.isSingleNavigationProperty = isSingleNavigationProperty;
  function isMultipleNavigationProperty(serviceObject) {
    return isNavigationProperty(serviceObject) && serviceObject.isCollection;
  }

  /**
   * Checks whether the argument is a {@link PathAnnotationExpression}.
   *
   * @param expression The object to be checked.
   * @returns Whether the argument is a {@link PathAnnotationExpression}.
   */
  _exports.isMultipleNavigationProperty = isMultipleNavigationProperty;
  function isPathAnnotationExpression(expression) {
    return (expression === null || expression === void 0 ? void 0 : expression.type) === "Path";
  }

  /**
   * Checks whether the argument is a {@link PropertyPath}.
   *
   * @param expression The object to be checked.
   * @returns Whether the argument is a {@link PropertyPath}.
   */
  _exports.isPathAnnotationExpression = isPathAnnotationExpression;
  function isPropertyPathExpression(expression) {
    return (expression === null || expression === void 0 ? void 0 : expression.type) === "PropertyPath";
  }
  _exports.isPropertyPathExpression = isPropertyPathExpression;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0NvbnRleHQiLCJwb3RlbnRpYWxDb250ZXh0IiwiaXNBIiwiaXNGdW5jdGlvbkFycmF5IiwicG90ZW50aWFsRnVuY3Rpb25BcnJheSIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsImV2ZXJ5IiwiaXRlbSIsImlzQW5ub3RhdGlvbk9mVHlwZSIsInBvdGVudGlhbEFubm90YXRpb25UeXBlIiwidHlwZU5hbWUiLCIkVHlwZSIsImlzU2VydmljZU9iamVjdCIsInNlcnZpY2VPYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsImlzQ29tcGxleFR5cGUiLCJfdHlwZSIsImlzVHlwZURlZmluaXRpb24iLCJpc0VudGl0eUNvbnRhaW5lciIsImlzRW50aXR5U2V0IiwiaXNTaW5nbGV0b24iLCJpc0VudGl0eVR5cGUiLCJpc1Byb3BlcnR5IiwiaXNOYXZpZ2F0aW9uUHJvcGVydHkiLCJpc1NpbmdsZU5hdmlnYXRpb25Qcm9wZXJ0eSIsImlzQ29sbGVjdGlvbiIsImlzTXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHkiLCJpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiIsImV4cHJlc3Npb24iLCJ0eXBlIiwiaXNQcm9wZXJ0eVBhdGhFeHByZXNzaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUeXBlR3VhcmRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHtcblx0QW5ub3RhdGlvblRlcm0sXG5cdENvbXBsZXhUeXBlLFxuXHRFbnRpdHlDb250YWluZXIsXG5cdEVudGl0eVNldCxcblx0RW50aXR5VHlwZSxcblx0TXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHksXG5cdE5hdmlnYXRpb25Qcm9wZXJ0eSxcblx0UGF0aEFubm90YXRpb25FeHByZXNzaW9uLFxuXHRQcm9wZXJ0eSxcblx0UHJvcGVydHlQYXRoLFxuXHRTZXJ2aWNlT2JqZWN0LFxuXHRTZXJ2aWNlT2JqZWN0QW5kQW5ub3RhdGlvbixcblx0U2luZ2xlTmF2aWdhdGlvblByb3BlcnR5LFxuXHRTaW5nbGV0b24sXG5cdFR5cGVEZWZpbml0aW9uXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29udGV4dChwb3RlbnRpYWxDb250ZXh0OiBDb250ZXh0IHwgdW5rbm93biB8IHVuZGVmaW5lZCk6IHBvdGVudGlhbENvbnRleHQgaXMgQ29udGV4dCB7XG5cdHJldHVybiAocG90ZW50aWFsQ29udGV4dCBhcyBDb250ZXh0KT8uaXNBPy48Q29udGV4dD4oXCJzYXAudWkubW9kZWwuQ29udGV4dFwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb25BcnJheShwb3RlbnRpYWxGdW5jdGlvbkFycmF5OiBGdW5jdGlvbltdIHwgdW5rbm93bik6IHBvdGVudGlhbEZ1bmN0aW9uQXJyYXkgaXMgRnVuY3Rpb25bXSB7XG5cdHJldHVybiAoXG5cdFx0QXJyYXkuaXNBcnJheShwb3RlbnRpYWxGdW5jdGlvbkFycmF5KSAmJlxuXHRcdHBvdGVudGlhbEZ1bmN0aW9uQXJyYXkubGVuZ3RoID4gMCAmJlxuXHRcdHBvdGVudGlhbEZ1bmN0aW9uQXJyYXkuZXZlcnkoKGl0ZW0pID0+IHR5cGVvZiBpdGVtID09PSBcImZ1bmN0aW9uXCIpXG5cdCk7XG59XG5cbnR5cGUgQW5ub3RhdGlvblR5cGUgPSB7XG5cdCRUeXBlOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaXNBbm5vdGF0aW9uT2ZUeXBlPFQgZXh0ZW5kcyBvYmplY3QgJiBBbm5vdGF0aW9uVHlwZT4oXG5cdHBvdGVudGlhbEFubm90YXRpb25UeXBlOiBBbm5vdGF0aW9uVGVybTxhbnk+LFxuXHR0eXBlTmFtZTogVFtcIiRUeXBlXCJdXG4pOiBwb3RlbnRpYWxBbm5vdGF0aW9uVHlwZSBpcyBBbm5vdGF0aW9uVGVybTxUPiB7XG5cdHJldHVybiBwb3RlbnRpYWxBbm5vdGF0aW9uVHlwZS4kVHlwZSA9PT0gdHlwZU5hbWU7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEge0BsaW5rIFNlcnZpY2VPYmplY3R9LlxuICpcbiAqIEBwYXJhbSBzZXJ2aWNlT2JqZWN0IFRoZSBvYmplY3QgdG8gYmUgY2hlY2tlZC5cbiAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEge0BsaW5rIFNlcnZpY2VPYmplY3R9LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTZXJ2aWNlT2JqZWN0KHNlcnZpY2VPYmplY3Q6IFNlcnZpY2VPYmplY3RBbmRBbm5vdGF0aW9uIHwgdW5kZWZpbmVkKTogc2VydmljZU9iamVjdCBpcyBTZXJ2aWNlT2JqZWN0IHtcblx0cmV0dXJuIHNlcnZpY2VPYmplY3Q/Lmhhc093blByb3BlcnR5KFwiX3R5cGVcIikgPz8gZmFsc2U7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEge0BsaW5rIENvbXBsZXhUeXBlfS5cbiAqXG4gKiBAcGFyYW0gc2VydmljZU9iamVjdCBUaGUgb2JqZWN0IHRvIGJlIGNoZWNrZWQuXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBhcmd1bWVudCBpcyBhIHtAbGluayBDb21wbGV4VHlwZX0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbXBsZXhUeXBlKHNlcnZpY2VPYmplY3Q6IHVua25vd24pOiBzZXJ2aWNlT2JqZWN0IGlzIENvbXBsZXhUeXBlIHtcblx0cmV0dXJuIChzZXJ2aWNlT2JqZWN0IGFzIENvbXBsZXhUeXBlKT8uX3R5cGUgPT09IFwiQ29tcGxleFR5cGVcIjtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSB7QGxpbmsgVHlwZURlZmluaXRpb259LlxuICpcbiAqIEBwYXJhbSBzZXJ2aWNlT2JqZWN0IFRoZSBvYmplY3QgdG8gYmUgY2hlY2tlZC5cbiAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEge0BsaW5rIFR5cGVEZWZpbml0aW9ufS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVHlwZURlZmluaXRpb24oc2VydmljZU9iamVjdDogdW5rbm93bik6IHNlcnZpY2VPYmplY3QgaXMgVHlwZURlZmluaXRpb24ge1xuXHRyZXR1cm4gKHNlcnZpY2VPYmplY3QgYXMgVHlwZURlZmluaXRpb24pPy5fdHlwZSA9PT0gXCJUeXBlRGVmaW5pdGlvblwiO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBhcmd1bWVudCBpcyBhbiB7QGxpbmsgRW50aXR5Q29udGFpbmVyfS5cbiAqXG4gKiBAcGFyYW0gc2VydmljZU9iamVjdCBUaGUgb2JqZWN0IHRvIGJlIGNoZWNrZWQuXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBhcmd1bWVudCBpcyBhbiB7QGxpbmsgRW50aXR5Q29udGFpbmVyfS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW50aXR5Q29udGFpbmVyKHNlcnZpY2VPYmplY3Q6IHVua25vd24pOiBzZXJ2aWNlT2JqZWN0IGlzIEVudGl0eUNvbnRhaW5lciB7XG5cdHJldHVybiAoc2VydmljZU9iamVjdCBhcyBFbnRpdHlDb250YWluZXIpPy5fdHlwZSA9PT0gXCJFbnRpdHlDb250YWluZXJcIjtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgYXJndW1lbnQgaXMgYW4ge0BsaW5rIEVudGl0eVNldH0uXG4gKlxuICogQHBhcmFtIHNlcnZpY2VPYmplY3QgVGhlIG9iamVjdCB0byBiZSBjaGVja2VkLlxuICogQHJldHVybnMgV2hldGhlciB0aGUgYXJndW1lbnQgaXMgYW4ge0BsaW5rIEVudGl0eVNldH0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VudGl0eVNldChzZXJ2aWNlT2JqZWN0OiB1bmtub3duKTogc2VydmljZU9iamVjdCBpcyBFbnRpdHlTZXQge1xuXHRyZXR1cm4gKHNlcnZpY2VPYmplY3QgYXMgRW50aXR5U2V0KT8uX3R5cGUgPT09IFwiRW50aXR5U2V0XCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEge0BsaW5rIFNpbmdsZXRvbn0uXG4gKlxuICogQHBhcmFtIHNlcnZpY2VPYmplY3QgVGhlIG9iamVjdCB0byBiZSBjaGVja2VkLlxuICogQHJldHVybnMgV2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSB7QGxpbmsgU2luZ2xldG9ufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTaW5nbGV0b24oc2VydmljZU9iamVjdDogdW5rbm93bik6IHNlcnZpY2VPYmplY3QgaXMgU2luZ2xldG9uIHtcblx0cmV0dXJuIChzZXJ2aWNlT2JqZWN0IGFzIFNpbmdsZXRvbik/Ll90eXBlID09PSBcIlNpbmdsZXRvblwiO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBhcmd1bWVudCBpcyBhbiB7QGxpbmsgRW50aXR5VHlwZX0uXG4gKlxuICogQHBhcmFtIHNlcnZpY2VPYmplY3QgVGhlIG9iamVjdCB0byBiZSBjaGVja2VkLlxuICogQHJldHVybnMgV2hldGhlciB0aGUgYXJndW1lbnQgaXMgYW4ge0BsaW5rIEVudGl0eVR5cGV9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VudGl0eVR5cGUoc2VydmljZU9iamVjdDogdW5rbm93bik6IHNlcnZpY2VPYmplY3QgaXMgRW50aXR5VHlwZSB7XG5cdHJldHVybiAoc2VydmljZU9iamVjdCBhcyBFbnRpdHlUeXBlKT8uX3R5cGUgPT09IFwiRW50aXR5VHlwZVwiO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBhcmd1bWVudCBpcyBhIHtAbGluayBQcm9wZXJ0eX0uXG4gKlxuICogQHBhcmFtIHNlcnZpY2VPYmplY3QgVGhlIG9iamVjdCB0byBiZSBjaGVja2VkLlxuICogQHJldHVybnMgV2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSB7QGxpbmsgUHJvcGVydHl9LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eShzZXJ2aWNlT2JqZWN0OiB1bmtub3duKTogc2VydmljZU9iamVjdCBpcyBQcm9wZXJ0eSB7XG5cdHJldHVybiAoc2VydmljZU9iamVjdCBhcyBQcm9wZXJ0eSk/Ll90eXBlID09PSBcIlByb3BlcnR5XCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEge0BsaW5rIE5hdmlnYXRpb25Qcm9wZXJ0eX0uXG4gKlxuICogSGludDogVGhlcmUgYXJlIGFsc28gdGhlIG1vcmUgc3BlY2lmaWMgZnVuY3Rpb25zIHtAbGluayBpc1NpbmdsZU5hdmlnYXRpb25Qcm9wZXJ0eX0gYW5kIHtAbGluayBpc011bHRpcGxlTmF2aWdhdGlvblByb3BlcnR5fS4gVGhlc2UgY2FuIGJlXG4gKiB1c2VkIHRvIGNoZWNrIGZvciB0by1vbmUgYW5kIHRvLW1hbnkgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzLCByZXNwZWN0aXZlbHkuXG4gKlxuICogQHBhcmFtIHNlcnZpY2VPYmplY3QgVGhlIG9iamVjdCB0byBiZSBjaGVja2VkLlxuICogQHJldHVybnMgV2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSB7QGxpbmsgTmF2aWdhdGlvblByb3BlcnR5fS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTmF2aWdhdGlvblByb3BlcnR5KHNlcnZpY2VPYmplY3Q6IHVua25vd24pOiBzZXJ2aWNlT2JqZWN0IGlzIE5hdmlnYXRpb25Qcm9wZXJ0eSB7XG5cdHJldHVybiAoc2VydmljZU9iamVjdCBhcyBOYXZpZ2F0aW9uUHJvcGVydHkpPy5fdHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIjtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSB7QGxpbmsgU2luZ2xlTmF2aWdhdGlvblByb3BlcnR5fS5cbiAqXG4gKiBAcGFyYW0gc2VydmljZU9iamVjdCBUaGUgb2JqZWN0IHRvIGJlIGNoZWNrZWQuXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBhcmd1bWVudCBpcyBhIHtAbGluayBTaW5nbGVOYXZpZ2F0aW9uUHJvcGVydHl9LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTaW5nbGVOYXZpZ2F0aW9uUHJvcGVydHkoc2VydmljZU9iamVjdDogdW5rbm93bik6IHNlcnZpY2VPYmplY3QgaXMgU2luZ2xlTmF2aWdhdGlvblByb3BlcnR5IHtcblx0cmV0dXJuIGlzTmF2aWdhdGlvblByb3BlcnR5KHNlcnZpY2VPYmplY3QpICYmICFzZXJ2aWNlT2JqZWN0LmlzQ29sbGVjdGlvbjtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSB7QGxpbmsgTXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHl9LlxuICpcbiAqIEBwYXJhbSBzZXJ2aWNlT2JqZWN0IFRoZSBvYmplY3QgdG8gYmUgY2hlY2tlZC5cbiAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEge0BsaW5rIE11bHRpcGxlTmF2aWdhdGlvblByb3BlcnR5fS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHkoc2VydmljZU9iamVjdDogdW5rbm93bik6IHNlcnZpY2VPYmplY3QgaXMgTXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHkge1xuXHRyZXR1cm4gaXNOYXZpZ2F0aW9uUHJvcGVydHkoc2VydmljZU9iamVjdCkgJiYgc2VydmljZU9iamVjdC5pc0NvbGxlY3Rpb247XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGEge0BsaW5rIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbn0uXG4gKlxuICogQHBhcmFtIGV4cHJlc3Npb24gVGhlIG9iamVjdCB0byBiZSBjaGVja2VkLlxuICogQHJldHVybnMgV2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSB7QGxpbmsgUGF0aEFubm90YXRpb25FeHByZXNzaW9ufS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uPFQ+KGV4cHJlc3Npb246IHVua25vd24pOiBleHByZXNzaW9uIGlzIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxUPiB7XG5cdHJldHVybiAoZXhwcmVzc2lvbiBhcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248VD4pPy50eXBlID09PSBcIlBhdGhcIjtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSB7QGxpbmsgUHJvcGVydHlQYXRofS5cbiAqXG4gKiBAcGFyYW0gZXhwcmVzc2lvbiBUaGUgb2JqZWN0IHRvIGJlIGNoZWNrZWQuXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBhcmd1bWVudCBpcyBhIHtAbGluayBQcm9wZXJ0eVBhdGh9LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eVBhdGhFeHByZXNzaW9uKGV4cHJlc3Npb246IHVua25vd24pOiBleHByZXNzaW9uIGlzIFByb3BlcnR5UGF0aCB7XG5cdHJldHVybiAoZXhwcmVzc2lvbiBhcyBQcm9wZXJ0eVBhdGgpPy50eXBlID09PSBcIlByb3BlcnR5UGF0aFwiO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQW1CTyxTQUFTQSxTQUFTLENBQUNDLGdCQUErQyxFQUErQjtJQUFBO0lBQ3ZHLE9BQVFBLGdCQUFnQixhQUFoQkEsZ0JBQWdCLCtCQUFqQixRQUFDQSxnQkFBZ0IsRUFBY0MsR0FBRyx5Q0FBbEMsZ0JBQThDLHNCQUFzQixDQUFDO0VBQzdFO0VBQUM7RUFFTSxTQUFTQyxlQUFlLENBQUNDLHNCQUE0QyxFQUF3QztJQUNuSCxPQUNDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0Ysc0JBQXNCLENBQUMsSUFDckNBLHNCQUFzQixDQUFDRyxNQUFNLEdBQUcsQ0FBQyxJQUNqQ0gsc0JBQXNCLENBQUNJLEtBQUssQ0FBRUMsSUFBSSxJQUFLLE9BQU9BLElBQUksS0FBSyxVQUFVLENBQUM7RUFFcEU7RUFBQztFQU1NLFNBQVNDLGtCQUFrQixDQUNqQ0MsdUJBQTRDLEVBQzVDQyxRQUFvQixFQUMyQjtJQUMvQyxPQUFPRCx1QkFBdUIsQ0FBQ0UsS0FBSyxLQUFLRCxRQUFRO0VBQ2xEOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBO0VBTU8sU0FBU0UsZUFBZSxDQUFDQyxhQUFxRCxFQUFrQztJQUN0SCxPQUFPLENBQUFBLGFBQWEsYUFBYkEsYUFBYSx1QkFBYkEsYUFBYSxDQUFFQyxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUksS0FBSztFQUN2RDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQTtFQU1PLFNBQVNDLGFBQWEsQ0FBQ0YsYUFBc0IsRUFBZ0M7SUFDbkYsT0FBTyxDQUFDQSxhQUFhLGFBQWJBLGFBQWEsdUJBQWJBLGFBQWEsQ0FBa0JHLEtBQUssTUFBSyxhQUFhO0VBQy9EOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBO0VBTU8sU0FBU0MsZ0JBQWdCLENBQUNKLGFBQXNCLEVBQW1DO0lBQ3pGLE9BQU8sQ0FBQ0EsYUFBYSxhQUFiQSxhQUFhLHVCQUFiQSxhQUFhLENBQXFCRyxLQUFLLE1BQUssZ0JBQWdCO0VBQ3JFOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBO0VBTU8sU0FBU0UsaUJBQWlCLENBQUNMLGFBQXNCLEVBQW9DO0lBQzNGLE9BQU8sQ0FBQ0EsYUFBYSxhQUFiQSxhQUFhLHVCQUFiQSxhQUFhLENBQXNCRyxLQUFLLE1BQUssaUJBQWlCO0VBQ3ZFOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBO0VBTU8sU0FBU0csV0FBVyxDQUFDTixhQUFzQixFQUE4QjtJQUMvRSxPQUFPLENBQUNBLGFBQWEsYUFBYkEsYUFBYSx1QkFBYkEsYUFBYSxDQUFnQkcsS0FBSyxNQUFLLFdBQVc7RUFDM0Q7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEE7RUFNTyxTQUFTSSxXQUFXLENBQUNQLGFBQXNCLEVBQThCO0lBQy9FLE9BQU8sQ0FBQ0EsYUFBYSxhQUFiQSxhQUFhLHVCQUFiQSxhQUFhLENBQWdCRyxLQUFLLE1BQUssV0FBVztFQUMzRDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQTtFQU1PLFNBQVNLLFlBQVksQ0FBQ1IsYUFBc0IsRUFBK0I7SUFDakYsT0FBTyxDQUFDQSxhQUFhLGFBQWJBLGFBQWEsdUJBQWJBLGFBQWEsQ0FBaUJHLEtBQUssTUFBSyxZQUFZO0VBQzdEOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBO0VBTU8sU0FBU00sVUFBVSxDQUFDVCxhQUFzQixFQUE2QjtJQUM3RSxPQUFPLENBQUNBLGFBQWEsYUFBYkEsYUFBYSx1QkFBYkEsYUFBYSxDQUFlRyxLQUFLLE1BQUssVUFBVTtFQUN6RDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFSQTtFQVNPLFNBQVNPLG9CQUFvQixDQUFDVixhQUFzQixFQUF1QztJQUNqRyxPQUFPLENBQUNBLGFBQWEsYUFBYkEsYUFBYSx1QkFBYkEsYUFBYSxDQUF5QkcsS0FBSyxNQUFLLG9CQUFvQjtFQUM3RTs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQTtFQU1PLFNBQVNRLDBCQUEwQixDQUFDWCxhQUFzQixFQUE2QztJQUM3RyxPQUFPVSxvQkFBb0IsQ0FBQ1YsYUFBYSxDQUFDLElBQUksQ0FBQ0EsYUFBYSxDQUFDWSxZQUFZO0VBQzFFOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBO0VBTU8sU0FBU0MsNEJBQTRCLENBQUNiLGFBQXNCLEVBQStDO0lBQ2pILE9BQU9VLG9CQUFvQixDQUFDVixhQUFhLENBQUMsSUFBSUEsYUFBYSxDQUFDWSxZQUFZO0VBQ3pFOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBO0VBTU8sU0FBU0UsMEJBQTBCLENBQUlDLFVBQW1CLEVBQTZDO0lBQzdHLE9BQU8sQ0FBQ0EsVUFBVSxhQUFWQSxVQUFVLHVCQUFWQSxVQUFVLENBQWtDQyxJQUFJLE1BQUssTUFBTTtFQUNwRTs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQTtFQU1PLFNBQVNDLHdCQUF3QixDQUFDRixVQUFtQixFQUE4QjtJQUN6RixPQUFPLENBQUNBLFVBQVUsYUFBVkEsVUFBVSx1QkFBVkEsVUFBVSxDQUFtQkMsSUFBSSxNQUFLLGNBQWM7RUFDN0Q7RUFBQztFQUFBO0FBQUEifQ==