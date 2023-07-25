/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["../../core/LabelCalculator"],function(l){
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
var e=l["LabelCalculator"];var a=function l(e){if(e[6]!=="~"){return{system:"__DUMMY",client:"__DUMMY"}}return{system:e.slice(0,3),client:e.slice(3,6)}};function n(){return new e({key:function l(e){var n=a(e.id);return[e.labelPlural,n.system,n.client]},data:function l(e){return{label:e.label,labelPlural:e.labelPlural}},setLabel:function l(e,a,n){a[0]=n.label;e.label=a.join(" ");a[0]=n.labelPlural;e.labelPlural=a.join(" ")},setFallbackLabel:function l(e,a){e.label=a.labelPlural+" duplicate "+e.id;e.labelPlural=e.label}})}var r={__esModule:true};r.createLabelCalculator=n;return r})})();