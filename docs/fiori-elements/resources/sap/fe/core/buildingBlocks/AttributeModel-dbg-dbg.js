/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/ObjectPath", "sap/ui/model/json/JSONModel"], function (Log, ObjectPath, JSONModel) {
  "use strict";

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Special JSONModel that is used to store the attribute model for the building block.
   * It has specific handling for undefinedValue mapping
   */
  let AttributeModel = /*#__PURE__*/function (_JSONModel) {
    _inheritsLoose(AttributeModel, _JSONModel);
    function AttributeModel(oNode, oProps, BuildingBlockClass) {
      var _this;
      _this = _JSONModel.call(this) || this;
      _this.oNode = oNode;
      _this.oProps = oProps;
      _this.BuildingBlockClass = BuildingBlockClass;
      _this.$$valueAsPromise = true;
      return _this;
    }
    var _proto = AttributeModel.prototype;
    _proto._getObject = function _getObject(sPath, oContext) {
      if (sPath === undefined || sPath === "") {
        if (oContext !== undefined && oContext.getPath() !== "/") {
          return this._getObject(oContext.getPath(sPath));
        }
        return this.oProps;
      }
      if (sPath === "/undefinedValue" || sPath === "undefinedValue") {
        return undefined;
      }
      // just return the attribute - we can't validate them, and we don't support aggregations for now
      const oValue = ObjectPath.get(sPath.replace(/\//g, "."), this.oProps);
      if (oValue !== undefined) {
        return oValue;
      }
      // Deal with undefined properties
      if (this.oProps.hasOwnProperty(sPath)) {
        return this.oProps[sPath];
      }
      if (sPath.indexOf(":") === -1 && sPath.indexOf("/") === -1) {
        // Gloves are off, if you have this error you forgot to decorate your property with @blockAttribute but are still using it in underlying templating
        Log.error(`Missing property ${sPath} on building block metadata ${this.BuildingBlockClass.name}`);
      }
      return this.oNode.getAttribute(sPath);
    };
    return AttributeModel;
  }(JSONModel);
  return AttributeModel;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdHRyaWJ1dGVNb2RlbCIsIm9Ob2RlIiwib1Byb3BzIiwiQnVpbGRpbmdCbG9ja0NsYXNzIiwiJCR2YWx1ZUFzUHJvbWlzZSIsIl9nZXRPYmplY3QiLCJzUGF0aCIsIm9Db250ZXh0IiwidW5kZWZpbmVkIiwiZ2V0UGF0aCIsIm9WYWx1ZSIsIk9iamVjdFBhdGgiLCJnZXQiLCJyZXBsYWNlIiwiaGFzT3duUHJvcGVydHkiLCJpbmRleE9mIiwiTG9nIiwiZXJyb3IiLCJuYW1lIiwiZ2V0QXR0cmlidXRlIiwiSlNPTk1vZGVsIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBdHRyaWJ1dGVNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBPYmplY3RQYXRoIGZyb20gXCJzYXAvYmFzZS91dGlsL09iamVjdFBhdGhcIjtcbmltcG9ydCB0eXBlIEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuXG4vKipcbiAqIFNwZWNpYWwgSlNPTk1vZGVsIHRoYXQgaXMgdXNlZCB0byBzdG9yZSB0aGUgYXR0cmlidXRlIG1vZGVsIGZvciB0aGUgYnVpbGRpbmcgYmxvY2suXG4gKiBJdCBoYXMgc3BlY2lmaWMgaGFuZGxpbmcgZm9yIHVuZGVmaW5lZFZhbHVlIG1hcHBpbmdcbiAqL1xuY2xhc3MgQXR0cmlidXRlTW9kZWwgZXh0ZW5kcyBKU09OTW9kZWwge1xuXHRwdWJsaWMgJCR2YWx1ZUFzUHJvbWlzZTogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIHJlYWRvbmx5IG9Ob2RlOiBFbGVtZW50LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgb1Byb3BzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcblx0XHRwcml2YXRlIHJlYWRvbmx5IEJ1aWxkaW5nQmxvY2tDbGFzczogdHlwZW9mIEJ1aWxkaW5nQmxvY2tCYXNlXG5cdCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy4kJHZhbHVlQXNQcm9taXNlID0gdHJ1ZTtcblx0fVxuXG5cdF9nZXRPYmplY3Qoc1BhdGg6IHN0cmluZywgb0NvbnRleHQ/OiBDb250ZXh0KTogdW5rbm93biB7XG5cdFx0aWYgKHNQYXRoID09PSB1bmRlZmluZWQgfHwgc1BhdGggPT09IFwiXCIpIHtcblx0XHRcdGlmIChvQ29udGV4dCAhPT0gdW5kZWZpbmVkICYmIG9Db250ZXh0LmdldFBhdGgoKSAhPT0gXCIvXCIpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2dldE9iamVjdChvQ29udGV4dC5nZXRQYXRoKHNQYXRoKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5vUHJvcHM7XG5cdFx0fVxuXHRcdGlmIChzUGF0aCA9PT0gXCIvdW5kZWZpbmVkVmFsdWVcIiB8fCBzUGF0aCA9PT0gXCJ1bmRlZmluZWRWYWx1ZVwiKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHQvLyBqdXN0IHJldHVybiB0aGUgYXR0cmlidXRlIC0gd2UgY2FuJ3QgdmFsaWRhdGUgdGhlbSwgYW5kIHdlIGRvbid0IHN1cHBvcnQgYWdncmVnYXRpb25zIGZvciBub3dcblx0XHRjb25zdCBvVmFsdWUgPSBPYmplY3RQYXRoLmdldChzUGF0aC5yZXBsYWNlKC9cXC8vZywgXCIuXCIpLCB0aGlzLm9Qcm9wcyk7XG5cdFx0aWYgKG9WYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gb1ZhbHVlO1xuXHRcdH1cblx0XHQvLyBEZWFsIHdpdGggdW5kZWZpbmVkIHByb3BlcnRpZXNcblx0XHRpZiAodGhpcy5vUHJvcHMuaGFzT3duUHJvcGVydHkoc1BhdGgpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vUHJvcHNbc1BhdGhdO1xuXHRcdH1cblx0XHRpZiAoc1BhdGguaW5kZXhPZihcIjpcIikgPT09IC0xICYmIHNQYXRoLmluZGV4T2YoXCIvXCIpID09PSAtMSkge1xuXHRcdFx0Ly8gR2xvdmVzIGFyZSBvZmYsIGlmIHlvdSBoYXZlIHRoaXMgZXJyb3IgeW91IGZvcmdvdCB0byBkZWNvcmF0ZSB5b3VyIHByb3BlcnR5IHdpdGggQGJsb2NrQXR0cmlidXRlIGJ1dCBhcmUgc3RpbGwgdXNpbmcgaXQgaW4gdW5kZXJseWluZyB0ZW1wbGF0aW5nXG5cdFx0XHRMb2cuZXJyb3IoYE1pc3NpbmcgcHJvcGVydHkgJHtzUGF0aH0gb24gYnVpbGRpbmcgYmxvY2sgbWV0YWRhdGEgJHt0aGlzLkJ1aWxkaW5nQmxvY2tDbGFzcy5uYW1lfWApO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5vTm9kZS5nZXRBdHRyaWJ1dGUoc1BhdGgpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEF0dHJpYnV0ZU1vZGVsO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7RUFNQTtBQUNBO0FBQ0E7QUFDQTtFQUhBLElBSU1BLGNBQWM7SUFBQTtJQUduQix3QkFDa0JDLEtBQWMsRUFDZEMsTUFBK0IsRUFDL0JDLGtCQUE0QyxFQUM1RDtNQUFBO01BQ0QsNkJBQU87TUFBQyxNQUpTRixLQUFjLEdBQWRBLEtBQWM7TUFBQSxNQUNkQyxNQUErQixHQUEvQkEsTUFBK0I7TUFBQSxNQUMvQkMsa0JBQTRDLEdBQTVDQSxrQkFBNEM7TUFHN0QsTUFBS0MsZ0JBQWdCLEdBQUcsSUFBSTtNQUFDO0lBQzlCO0lBQUM7SUFBQSxPQUVEQyxVQUFVLEdBQVYsb0JBQVdDLEtBQWEsRUFBRUMsUUFBa0IsRUFBVztNQUN0RCxJQUFJRCxLQUFLLEtBQUtFLFNBQVMsSUFBSUYsS0FBSyxLQUFLLEVBQUUsRUFBRTtRQUN4QyxJQUFJQyxRQUFRLEtBQUtDLFNBQVMsSUFBSUQsUUFBUSxDQUFDRSxPQUFPLEVBQUUsS0FBSyxHQUFHLEVBQUU7VUFDekQsT0FBTyxJQUFJLENBQUNKLFVBQVUsQ0FBQ0UsUUFBUSxDQUFDRSxPQUFPLENBQUNILEtBQUssQ0FBQyxDQUFDO1FBQ2hEO1FBQ0EsT0FBTyxJQUFJLENBQUNKLE1BQU07TUFDbkI7TUFDQSxJQUFJSSxLQUFLLEtBQUssaUJBQWlCLElBQUlBLEtBQUssS0FBSyxnQkFBZ0IsRUFBRTtRQUM5RCxPQUFPRSxTQUFTO01BQ2pCO01BQ0E7TUFDQSxNQUFNRSxNQUFNLEdBQUdDLFVBQVUsQ0FBQ0MsR0FBRyxDQUFDTixLQUFLLENBQUNPLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDWCxNQUFNLENBQUM7TUFDckUsSUFBSVEsTUFBTSxLQUFLRixTQUFTLEVBQUU7UUFDekIsT0FBT0UsTUFBTTtNQUNkO01BQ0E7TUFDQSxJQUFJLElBQUksQ0FBQ1IsTUFBTSxDQUFDWSxjQUFjLENBQUNSLEtBQUssQ0FBQyxFQUFFO1FBQ3RDLE9BQU8sSUFBSSxDQUFDSixNQUFNLENBQUNJLEtBQUssQ0FBQztNQUMxQjtNQUNBLElBQUlBLEtBQUssQ0FBQ1MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJVCxLQUFLLENBQUNTLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUMzRDtRQUNBQyxHQUFHLENBQUNDLEtBQUssQ0FBRSxvQkFBbUJYLEtBQU0sK0JBQThCLElBQUksQ0FBQ0gsa0JBQWtCLENBQUNlLElBQUssRUFBQyxDQUFDO01BQ2xHO01BQ0EsT0FBTyxJQUFJLENBQUNqQixLQUFLLENBQUNrQixZQUFZLENBQUNiLEtBQUssQ0FBQztJQUN0QyxDQUFDO0lBQUE7RUFBQSxFQXBDMkJjLFNBQVM7RUFBQSxPQXVDdkJwQixjQUFjO0FBQUEifQ==