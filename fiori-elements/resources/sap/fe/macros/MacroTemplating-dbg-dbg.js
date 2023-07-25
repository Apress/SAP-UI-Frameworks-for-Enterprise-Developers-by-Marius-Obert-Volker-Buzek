/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  const getPath = function (oContext, oInterface) {
    if (oInterface && oInterface.context) {
      return oInterface.context.getPath();
    }
    return "";
  };
  getPath.requiresIContext = true;
  _exports.getPath = getPath;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRQYXRoIiwib0NvbnRleHQiLCJvSW50ZXJmYWNlIiwiY29udGV4dCIsInJlcXVpcmVzSUNvbnRleHQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk1hY3JvVGVtcGxhdGluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbXB1dGVkQW5ub3RhdGlvbkludGVyZmFjZSwgTWV0YU1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuXG5leHBvcnQgY29uc3QgZ2V0UGF0aCA9IGZ1bmN0aW9uIChvQ29udGV4dDogTWV0YU1vZGVsQ29udGV4dCwgb0ludGVyZmFjZTogQ29tcHV0ZWRBbm5vdGF0aW9uSW50ZXJmYWNlKTogc3RyaW5nIHtcblx0aWYgKG9JbnRlcmZhY2UgJiYgb0ludGVyZmFjZS5jb250ZXh0KSB7XG5cdFx0cmV0dXJuIG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCk7XG5cdH1cblx0cmV0dXJuIFwiXCI7XG59O1xuZ2V0UGF0aC5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFFTyxNQUFNQSxPQUFPLEdBQUcsVUFBVUMsUUFBMEIsRUFBRUMsVUFBdUMsRUFBVTtJQUM3RyxJQUFJQSxVQUFVLElBQUlBLFVBQVUsQ0FBQ0MsT0FBTyxFQUFFO01BQ3JDLE9BQU9ELFVBQVUsQ0FBQ0MsT0FBTyxDQUFDSCxPQUFPLEVBQUU7SUFDcEM7SUFDQSxPQUFPLEVBQUU7RUFDVixDQUFDO0VBQ0RBLE9BQU8sQ0FBQ0ksZ0JBQWdCLEdBQUcsSUFBSTtFQUFDO0VBQUE7QUFBQSJ9