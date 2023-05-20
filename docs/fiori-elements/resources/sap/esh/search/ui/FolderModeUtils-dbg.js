/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
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
  var FolderModeResultViewTypeCalculator = /*#__PURE__*/function () {
    function FolderModeResultViewTypeCalculator(model) {
      _classCallCheck(this, FolderModeResultViewTypeCalculator);
      this.model = model;
    }
    _createClass(FolderModeResultViewTypeCalculator, [{
      key: "calculate",
      value: function calculate(resultViewTypes, resultViewType, filter) {
        if (!this.model.config.folderMode || !this.model.config.autoAdjustResultViewTypeInFolderMode) {
          return resultViewType;
        }
        var calculatedResultViewType;
        if (filter.isFolderMode()) {
          calculatedResultViewType = "searchResultTable";
        } else {
          calculatedResultViewType = "searchResultList";
        }
        if (resultViewTypes.indexOf(calculatedResultViewType) < 0) {
          return resultViewType;
        }
        return calculatedResultViewType;
      }
    }]);
    return FolderModeResultViewTypeCalculator;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.FolderModeResultViewTypeCalculator = FolderModeResultViewTypeCalculator;
  return __exports;
});
})();