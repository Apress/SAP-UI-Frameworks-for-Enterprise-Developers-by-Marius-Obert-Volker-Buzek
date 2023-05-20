/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */

  var DataSourceType;
  (function (DataSourceType) {
    DataSourceType["BusinessObject"] = "BusinessObject";
    DataSourceType["Category"] = "Category";
    DataSourceType["UserCategory"] = "UserCategory";
  })(DataSourceType || (DataSourceType = {}));
  var DataSourceSubType;
  (function (DataSourceSubType) {
    DataSourceSubType["Filtered"] = "Filtered";
  })(DataSourceSubType || (DataSourceSubType = {}));
  var __exports = {
    __esModule: true
  };
  __exports.DataSourceType = DataSourceType;
  __exports.DataSourceSubType = DataSourceSubType;
  return __exports;
});
})();