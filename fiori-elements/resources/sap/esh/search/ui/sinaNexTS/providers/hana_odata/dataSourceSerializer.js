/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["../../sina/DataSourceType"],function(e){
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
var a=e["DataSourceType"];function r(e){if(e===e.sina.getAllDataSource()){return{Id:"<All>",Type:"Category"}}var r;switch(e.type){case a.Category:r="Category";break;case a.BusinessObject:r="View";break}return{Id:e.id,Type:r}}var t={__esModule:true};t.serialize=r;return t})})();