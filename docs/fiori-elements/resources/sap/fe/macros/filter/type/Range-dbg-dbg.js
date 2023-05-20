/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/fe/macros/filter/type/Value"], function (ClassSupport, Value) {
  "use strict";

  var _dec, _class;
  var _exports = {};
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let Range = (
  /**
   * Handle format/parse of range filter values.
   */
  // eslint-disable-next-line new-cap
  _dec = defineUI5Class("sap.fe.macros.filter.type.Range"), _dec(_class = /*#__PURE__*/function (_Value) {
    _inheritsLoose(Range, _Value);
    function Range() {
      return _Value.apply(this, arguments) || this;
    }
    _exports = Range;
    var _proto = Range.prototype;
    /**
     * Returns the default operator name for range filter values ("BT").
     *
     * @returns The default operator name
     * @protected
     */
    _proto.getDefaultOperatorName = function getDefaultOperatorName() {
      return "BT";
    }

    /**
     * Returns the unchanged values.
     *
     * @param values Input condition value
     * @returns Unchanged input condition value
     * @protected
     */;
    _proto.formatConditionValues = function formatConditionValues(values) {
      return values;
    }

    /**
     * Returns the string value parsed to the external value type.
     *
     * @param internalValue The internal string value to be formatted
     * @param externalValueType The external value type, e.g. int, float[], string, etc.
     * @returns The formatted value
     * @protected
     */;
    _proto.formatValue = function formatValue(internalValue, externalValueType) {
      let results = _Value.prototype.formatValue.call(this, internalValue, externalValueType);
      if (!results) {
        const minValue = this.oFormatOptions.min || Number.MIN_SAFE_INTEGER,
          maxValue = this.oFormatOptions.max || Number.MAX_SAFE_INTEGER;
        results = [minValue, maxValue];
      }
      return results;
    };
    return Range;
  }(Value)) || _class);
  _exports = Range;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsImRlZmluZVVJNUNsYXNzIiwiZ2V0RGVmYXVsdE9wZXJhdG9yTmFtZSIsImZvcm1hdENvbmRpdGlvblZhbHVlcyIsInZhbHVlcyIsImZvcm1hdFZhbHVlIiwiaW50ZXJuYWxWYWx1ZSIsImV4dGVybmFsVmFsdWVUeXBlIiwicmVzdWx0cyIsIm1pblZhbHVlIiwib0Zvcm1hdE9wdGlvbnMiLCJtaW4iLCJOdW1iZXIiLCJNSU5fU0FGRV9JTlRFR0VSIiwibWF4VmFsdWUiLCJtYXgiLCJNQVhfU0FGRV9JTlRFR0VSIiwiVmFsdWUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlJhbmdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZVVJNUNsYXNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgVmFsdWUgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL3R5cGUvVmFsdWVcIjtcbmltcG9ydCB0eXBlIFNpbXBsZVR5cGUgZnJvbSBcInNhcC91aS9tb2RlbC9TaW1wbGVUeXBlXCI7XG5cbi8qKlxuICogVHlwZSB1c2VkIHRvIGV4dGVuZCBTaW1wbGVUeXBlIHdpdGggaGlkZGVuIGZpZWxkc1xuICpcbiAqIEB0eXBlZGVmIEF1Z21lbnRlZFNpbXBsZVR5cGVcbiAqL1xudHlwZSBBdWdtZW50ZWRTaW1wbGVUeXBlID0gU2ltcGxlVHlwZSAmIHtcblx0b0Zvcm1hdE9wdGlvbnM/OiBhbnk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSBmb3JtYXQvcGFyc2Ugb2YgcmFuZ2UgZmlsdGVyIHZhbHVlcy5cbiAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5ldy1jYXBcbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3MuZmlsdGVyLnR5cGUuUmFuZ2VcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJhbmdlIGV4dGVuZHMgVmFsdWUge1xuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZGVmYXVsdCBvcGVyYXRvciBuYW1lIGZvciByYW5nZSBmaWx0ZXIgdmFsdWVzIChcIkJUXCIpLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgZGVmYXVsdCBvcGVyYXRvciBuYW1lXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdGdldERlZmF1bHRPcGVyYXRvck5hbWUoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gXCJCVFwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHVuY2hhbmdlZCB2YWx1ZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZXMgSW5wdXQgY29uZGl0aW9uIHZhbHVlXG5cdCAqIEByZXR1cm5zIFVuY2hhbmdlZCBpbnB1dCBjb25kaXRpb24gdmFsdWVcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0Zm9ybWF0Q29uZGl0aW9uVmFsdWVzKHZhbHVlczogc3RyaW5nW10gfCBzdHJpbmcpOiBzdHJpbmdbXSB8IHN0cmluZyB7XG5cdFx0cmV0dXJuIHZhbHVlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzdHJpbmcgdmFsdWUgcGFyc2VkIHRvIHRoZSBleHRlcm5hbCB2YWx1ZSB0eXBlLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW50ZXJuYWxWYWx1ZSBUaGUgaW50ZXJuYWwgc3RyaW5nIHZhbHVlIHRvIGJlIGZvcm1hdHRlZFxuXHQgKiBAcGFyYW0gZXh0ZXJuYWxWYWx1ZVR5cGUgVGhlIGV4dGVybmFsIHZhbHVlIHR5cGUsIGUuZy4gaW50LCBmbG9hdFtdLCBzdHJpbmcsIGV0Yy5cblx0ICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCB2YWx1ZVxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRmb3JtYXRWYWx1ZShpbnRlcm5hbFZhbHVlOiBhbnkgfCB1bmRlZmluZWQsIGV4dGVybmFsVmFsdWVUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBhbnkge1xuXHRcdGxldCByZXN1bHRzID0gc3VwZXIuZm9ybWF0VmFsdWUoaW50ZXJuYWxWYWx1ZSwgZXh0ZXJuYWxWYWx1ZVR5cGUpO1xuXG5cdFx0aWYgKCFyZXN1bHRzKSB7XG5cdFx0XHRjb25zdCBtaW5WYWx1ZSA9ICh0aGlzIGFzIEF1Z21lbnRlZFNpbXBsZVR5cGUpLm9Gb3JtYXRPcHRpb25zLm1pbiB8fCBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUixcblx0XHRcdFx0bWF4VmFsdWUgPSAodGhpcyBhcyBBdWdtZW50ZWRTaW1wbGVUeXBlKS5vRm9ybWF0T3B0aW9ucy5tYXggfHwgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG5cblx0XHRcdHJlc3VsdHMgPSBbbWluVmFsdWUsIG1heFZhbHVlXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0cztcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7TUFrQnFCQSxLQUFLO0VBTDFCO0FBQ0E7QUFDQTtFQUNBO0VBQUEsT0FDQ0MsY0FBYyxDQUFDLGlDQUFpQyxDQUFDO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBRWpEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUxDLE9BTUFDLHNCQUFzQixHQUF0QixrQ0FBaUM7TUFDaEMsT0FBTyxJQUFJO0lBQ1o7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BT0FDLHFCQUFxQixHQUFyQiwrQkFBc0JDLE1BQXlCLEVBQXFCO01BQ25FLE9BQU9BLE1BQU07SUFDZDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BUEM7SUFBQSxPQVFBQyxXQUFXLEdBQVgscUJBQVlDLGFBQThCLEVBQUVDLGlCQUFxQyxFQUFPO01BQ3ZGLElBQUlDLE9BQU8sb0JBQVNILFdBQVcsWUFBQ0MsYUFBYSxFQUFFQyxpQkFBaUIsQ0FBQztNQUVqRSxJQUFJLENBQUNDLE9BQU8sRUFBRTtRQUNiLE1BQU1DLFFBQVEsR0FBSSxJQUFJLENBQXlCQyxjQUFjLENBQUNDLEdBQUcsSUFBSUMsTUFBTSxDQUFDQyxnQkFBZ0I7VUFDM0ZDLFFBQVEsR0FBSSxJQUFJLENBQXlCSixjQUFjLENBQUNLLEdBQUcsSUFBSUgsTUFBTSxDQUFDSSxnQkFBZ0I7UUFFdkZSLE9BQU8sR0FBRyxDQUFDQyxRQUFRLEVBQUVLLFFBQVEsQ0FBQztNQUMvQjtNQUVBLE9BQU9OLE9BQU87SUFDZixDQUFDO0lBQUE7RUFBQSxFQXpDaUNTLEtBQUs7RUFBQTtFQUFBO0FBQUEifQ==