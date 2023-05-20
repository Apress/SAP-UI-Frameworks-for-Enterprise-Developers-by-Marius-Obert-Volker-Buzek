/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./configurators/CustomFunctionConfigurator","./configurators/ListConfigurator","./configurators/ObjectConfigurator","./configurators/TemplateConfigurator","./configurators/TextResourceConfigurator","./configurators/SimpleValueConfigurator"],function(r,o,n,t,u,e){
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
var i=r["CustomFunctionConfigurator"];var a=o["ListConfigurator"];var f=n["ObjectConfigurator"];var c=t["TemplateConfigurator"];var s=u["TextResourceConfigurator"];var g=e["SimpleValueConfigurator"];var C=[i,a,f,c,s,g];function v(r){r.createConfiguratorAsync=v;for(var o=0;o<C.length;++o){var n=C[o];if(n.prototype.isSuitable(r)){return l(n,r)}}}function l(r,o){var n=new r(o);return Promise.resolve().then(function(){return n.initResourceBundleAsync()}).then(function(){return n.initAsync()}).then(function(){return n})}var m={__esModule:true};m.createConfiguratorAsync=v;return m})})();