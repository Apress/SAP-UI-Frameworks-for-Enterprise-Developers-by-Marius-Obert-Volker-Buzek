/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
  var tmpDataId = 0;
  var registry = {};
  function createTmpData() {
    var tmpData = {};
    tmpData.tmpDataId = "" + ++tmpDataId;
    registry[tmpData.tmpDataId] = tmpData;
    return tmpData;
  }
  function getTmpData(tmpDataId) {
    var tmpData = registry[tmpDataId];
    if (!tmpData) {
      throw "no tmp data";
    }
    return tmpData;
  }
  function deleteTmpData(tmpDataId) {
    delete registry[tmpDataId];
  }
  function getCountTmpData() {
    return Object.keys(registry).length;
  }
  function isEmptyTmpData() {
    return Object.keys(registry).length === 0;
  }
  var __exports = {
    __esModule: true
  };
  __exports.createTmpData = createTmpData;
  __exports.getTmpData = getTmpData;
  __exports.deleteTmpData = deleteTmpData;
  __exports.getCountTmpData = getCountTmpData;
  __exports.isEmptyTmpData = isEmptyTmpData;
  return __exports;
});
})();