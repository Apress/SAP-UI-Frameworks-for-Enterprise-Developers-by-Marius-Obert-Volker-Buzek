/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./ComparisonOperator"],function(r){
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
var e=r["ComparisonOperator"];function a(r,a){if(a===e.Eq){return r}var n=[];var t=r.split(" ");for(var o=0;o<t.length;o++){var i=t[o].trim();if(i.length===0){continue}switch(a){case e.Co:i="*"+i+"*";break;case e.Bw:i=i+"*";break;case e.Ew:i="*"+i;break;default:break}n.push(i)}return n.join(" ")}var n={__esModule:true};n.convertOperator2Wildcards=a;return n})})();