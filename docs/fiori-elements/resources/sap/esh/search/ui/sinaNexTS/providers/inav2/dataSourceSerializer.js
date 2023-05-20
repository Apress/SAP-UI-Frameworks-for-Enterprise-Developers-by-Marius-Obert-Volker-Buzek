/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
function e(e){if(e.id==="All"&&e.type===e.sina.DataSourceType.Category){return{ObjectName:"$$ALL$$",PackageName:"ABAP",SchemaName:"",Type:"Category"}}var a;switch(e.type){case e.sina.DataSourceType.Category:a="Category";break;case e.sina.DataSourceType.BusinessObject:a="Connector";break}return{ObjectName:e.id,PackageName:"ABAP",SchemaName:"",Type:a}}var a={__esModule:true};a.serialize=e;return a})})();