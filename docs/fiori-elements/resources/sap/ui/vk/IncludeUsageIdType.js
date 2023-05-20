/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/base/DataType"],function(e){"use strict";var r=e.createType("sap.ui.vk.IncludeUsageIdType",{isValid:function(e){if(typeof e==="boolean"){return true}if(typeof e==="string"){return e.trim().length>0}if(Array.isArray(e)){return e.every(function(e){return typeof e==="string"&&e.trim().length>0})}return false}},e.getType("any"));r.to$expandQueryParameter=function(e){function r(e){e=e.replaceAll("'","''");return e.indexOf(".")!==-1||e.indexOf(",")!==-1?"'"+e+"'":e}if(Array.isArray(e)){return e.map(function(e){return"usageId."+r(e)})}else if(typeof e==="string"){return["usageId."+r(e)]}else if(e){return["usageId"]}else{return[]}};return r},true);