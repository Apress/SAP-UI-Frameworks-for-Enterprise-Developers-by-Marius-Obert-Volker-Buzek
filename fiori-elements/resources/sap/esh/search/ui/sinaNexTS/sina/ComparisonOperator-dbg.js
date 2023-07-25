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

  var ComparisonOperator;
  (function (ComparisonOperator) {
    ComparisonOperator["Eq"] = "Eq";
    ComparisonOperator["Ne"] = "Ne";
    ComparisonOperator["Gt"] = "Gt";
    ComparisonOperator["Lt"] = "Lt";
    ComparisonOperator["Ge"] = "Ge";
    ComparisonOperator["Le"] = "Le";
    ComparisonOperator["Co"] = "Co";
    ComparisonOperator["Bw"] = "Bw";
    ComparisonOperator["Ew"] = "Ew";
    ComparisonOperator["ChildOf"] = "ChildOf";
    ComparisonOperator["DescendantOf"] = "DescendantOf";
  })(ComparisonOperator || (ComparisonOperator = {}));
  var __exports = {
    __esModule: true
  };
  __exports.ComparisonOperator = ComparisonOperator;
  return __exports;
});
})();