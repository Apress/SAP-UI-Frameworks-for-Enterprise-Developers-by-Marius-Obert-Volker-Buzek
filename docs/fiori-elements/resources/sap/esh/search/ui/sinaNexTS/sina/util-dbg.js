/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./ComparisonOperator"], function (___ComparisonOperator) {
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var ComparisonOperator = ___ComparisonOperator["ComparisonOperator"];
  function convertOperator2Wildcards(value, operator) {
    if (operator === ComparisonOperator.Eq) {
      return value;
    }
    var result = [];
    var values = value.split(" ");
    for (var i = 0; i < values.length; i++) {
      var trimedValue = values[i].trim();
      if (trimedValue.length === 0) {
        continue;
      }
      switch (operator) {
        case ComparisonOperator.Co:
          trimedValue = "*" + trimedValue + "*";
          break;
        case ComparisonOperator.Bw:
          trimedValue = trimedValue + "*";
          break;
        case ComparisonOperator.Ew:
          trimedValue = "*" + trimedValue;
          break;
        default:
          break;
      }
      result.push(trimedValue);
    }
    return result.join(" ");
  }
  var __exports = {
    __esModule: true
  };
  __exports.convertOperator2Wildcards = convertOperator2Wildcards;
  return __exports;
});
})();