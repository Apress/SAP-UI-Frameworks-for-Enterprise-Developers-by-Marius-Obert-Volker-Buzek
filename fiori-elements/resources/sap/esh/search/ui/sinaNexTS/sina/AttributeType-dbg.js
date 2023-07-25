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

  var AttributeType;
  (function (AttributeType) {
    AttributeType["Double"] = "Double";
    AttributeType["Integer"] = "Integer";
    AttributeType["String"] = "String";
    AttributeType["ImageUrl"] = "ImageUrl";
    AttributeType["ImageBlob"] = "ImageBlob";
    AttributeType["GeoJson"] = "GeoJson";
    AttributeType["Date"] = "Date";
    AttributeType["Time"] = "Time";
    AttributeType["Timestamp"] = "Timestamp";
    AttributeType["Group"] = "Group";
    AttributeType["INAV2_SearchTerms"] = "$$SearchTerms$$";
    AttributeType["INAV2_SuggestionTerms"] = "$$SuggestionTerms$$";
  })(AttributeType || (AttributeType = {}));
  var __exports = {
    __esModule: true
  };
  __exports.AttributeType = AttributeType;
  return __exports;
});
})();