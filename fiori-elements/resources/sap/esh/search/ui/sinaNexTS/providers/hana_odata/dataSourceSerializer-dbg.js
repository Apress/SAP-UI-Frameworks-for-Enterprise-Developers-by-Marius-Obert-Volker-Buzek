/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/DataSourceType"], function (____sina_DataSourceType) {
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var DataSourceType = ____sina_DataSourceType["DataSourceType"];
  function serialize(dataSource) {
    // handle all ds
    if (dataSource === dataSource.sina.getAllDataSource()) {
      return {
        Id: "<All>",
        Type: "Category"
      };
    }

    // convert sina type to abap_odata type
    var type;
    switch (dataSource.type) {
      case DataSourceType.Category:
        type = "Category";
        break;
      case DataSourceType.BusinessObject:
        type = "View";
        break;
    }
    return {
      Id: dataSource.id,
      Type: type
    };
  }
  var __exports = {
    __esModule: true
  };
  __exports.serialize = serialize;
  return __exports;
});
})();