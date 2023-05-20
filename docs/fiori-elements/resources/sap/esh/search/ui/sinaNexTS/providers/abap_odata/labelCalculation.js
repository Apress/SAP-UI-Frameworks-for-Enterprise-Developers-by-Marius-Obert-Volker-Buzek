/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["../../core/LabelCalculator"],function(l){
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
var a=l["LabelCalculator"];function e(){return new a({key:function l(a){return[a.labelPlural,a.system.id]},data:function l(a){return{label:a.label,labelPlural:a.labelPlural}},setLabel:function l(a,e,u){e[0]=u.label;a.label=e.join(" ");e[0]=u.labelPlural;a.labelPlural=e.join(" ")},setFallbackLabel:function l(a,e){a.label=e.labelPlural+" duplicate "+a.id;a.labelPlural=a.label}})}var u={__esModule:true};u.createLabelCalculator=e;return u})})();