/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/base/Object"], function (BaseObject) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.NavError}.<br> An object that provides error handling information during runtime.
   *
   * @public
   * @class
   * @param {string} errorCode The code for an internal error of a consumer that allows you to track the source locations
   * @extends sap.ui.base.Object
   * @since 1.83.0
   * @name sap.fe.navigation.NavError
   */
  let NavError = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(NavError, _BaseObject);
    /**
     * Constructor requiring the error code as input.
     *
     * @param errorCode String based error code.
     */
    function NavError(errorCode) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _this._sErrorCode = errorCode;
      return _this;
    }

    /**
     * Returns the error code with which the instance has been created.
     *
     * @public
     * @returns {string} The error code of the error
     */
    _exports.NavError = NavError;
    var _proto = NavError.prototype;
    _proto.getErrorCode = function getErrorCode() {
      return this._sErrorCode;
    };
    return NavError;
  }(BaseObject); // Exporting the class as properly typed UI5Class
  _exports.NavError = NavError;
  const UI5Class = BaseObject.extend("sap.fe.navigation.NavError", NavError.prototype);
  return UI5Class;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZFcnJvciIsImVycm9yQ29kZSIsIl9zRXJyb3JDb2RlIiwiZ2V0RXJyb3JDb2RlIiwiQmFzZU9iamVjdCIsIlVJNUNsYXNzIiwiZXh0ZW5kIiwicHJvdG90eXBlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJOYXZFcnJvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZU9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvT2JqZWN0XCI7XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgc3VjY2Vzc29yIG9mIHtAbGluayBzYXAudWkuZ2VuZXJpYy5hcHAubmF2aWdhdGlvbi5zZXJ2aWNlLk5hdkVycm9yfS48YnI+IEFuIG9iamVjdCB0aGF0IHByb3ZpZGVzIGVycm9yIGhhbmRsaW5nIGluZm9ybWF0aW9uIGR1cmluZyBydW50aW1lLlxuICpcbiAqIEBwdWJsaWNcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmd9IGVycm9yQ29kZSBUaGUgY29kZSBmb3IgYW4gaW50ZXJuYWwgZXJyb3Igb2YgYSBjb25zdW1lciB0aGF0IGFsbG93cyB5b3UgdG8gdHJhY2sgdGhlIHNvdXJjZSBsb2NhdGlvbnNcbiAqIEBleHRlbmRzIHNhcC51aS5iYXNlLk9iamVjdFxuICogQHNpbmNlIDEuODMuMFxuICogQG5hbWUgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3JcbiAqL1xuZXhwb3J0IGNsYXNzIE5hdkVycm9yIGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cdHByaXZhdGUgX3NFcnJvckNvZGU6IHN0cmluZztcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3IgcmVxdWlyaW5nIHRoZSBlcnJvciBjb2RlIGFzIGlucHV0LlxuXHQgKlxuXHQgKiBAcGFyYW0gZXJyb3JDb2RlIFN0cmluZyBiYXNlZCBlcnJvciBjb2RlLlxuXHQgKi9cblx0cHVibGljIGNvbnN0cnVjdG9yKGVycm9yQ29kZTogc3RyaW5nKSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLl9zRXJyb3JDb2RlID0gZXJyb3JDb2RlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGVycm9yIGNvZGUgd2l0aCB3aGljaCB0aGUgaW5zdGFuY2UgaGFzIGJlZW4gY3JlYXRlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZXJyb3IgY29kZSBvZiB0aGUgZXJyb3Jcblx0ICovXG5cdHB1YmxpYyBnZXRFcnJvckNvZGUoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fc0Vycm9yQ29kZTtcblx0fVxufVxuXG4vLyBFeHBvcnRpbmcgdGhlIGNsYXNzIGFzIHByb3Blcmx5IHR5cGVkIFVJNUNsYXNzXG5jb25zdCBVSTVDbGFzcyA9IEJhc2VPYmplY3QuZXh0ZW5kKFwic2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3JcIiwgTmF2RXJyb3IucHJvdG90eXBlIGFzIGFueSkgYXMgdHlwZW9mIE5hdkVycm9yO1xudHlwZSBVSTVDbGFzcyA9IEluc3RhbmNlVHlwZTx0eXBlb2YgTmF2RXJyb3I+O1xuZXhwb3J0IGRlZmF1bHQgVUk1Q2xhc3M7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVRBLElBVWFBLFFBQVE7SUFBQTtJQUdwQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0Msa0JBQW1CQyxTQUFpQixFQUFFO01BQUE7TUFDckMsOEJBQU87TUFDUCxNQUFLQyxXQUFXLEdBQUdELFNBQVM7TUFBQztJQUM5Qjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFMQztJQUFBO0lBQUEsT0FNT0UsWUFBWSxHQUFuQix3QkFBOEI7TUFDN0IsT0FBTyxJQUFJLENBQUNELFdBQVc7SUFDeEIsQ0FBQztJQUFBO0VBQUEsRUFyQjRCRSxVQUFVLEdBd0J4QztFQUFBO0VBQ0EsTUFBTUMsUUFBUSxHQUFHRCxVQUFVLENBQUNFLE1BQU0sQ0FBQyw0QkFBNEIsRUFBRU4sUUFBUSxDQUFDTyxTQUFTLENBQTJCO0VBQUMsT0FFaEdGLFFBQVE7QUFBQSJ9