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

  function serialize(dataSource) {
    // handle all ds
    //            if (dataSource === dataSource.sina.getAllDataSource()) {
    if (dataSource.id === "All" && dataSource.type === dataSource.sina.DataSourceType.Category) {
      return {
        ObjectName: "$$ALL$$",
        PackageName: "ABAP",
        SchemaName: "",
        Type: "Category"
      };
    }

    // convert sina type to ina type
    var type;
    switch (dataSource.type) {
      case dataSource.sina.DataSourceType.Category:
        type = "Category";
        break;
      case dataSource.sina.DataSourceType.BusinessObject:
        type = "Connector";
        break;
    }

    // assemble ina ds
    return {
      ObjectName: dataSource.id,
      PackageName: "ABAP",
      SchemaName: "",
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