/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function t(e,t){for(var a=0;a<t.length;a++){var r=t[a];r.enumerable=r.enumerable||false;r.configurable=true;if("value"in r)r.writable=true;Object.defineProperty(e,r.key,r)}}function a(e,a,r){if(a)t(e.prototype,a);if(r)t(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var r=function(){function t(a){e(this,t);this.sina=a.sina;this.navigationTargetGenerator=a.navigationTargetGenerator;this.label=a.label;this.sourceObjectType=a.sourceObjectType;this.targetObjectType=a.targetObjectType;this.conditions=a.conditions}a(t,[{key:"generate",value:function e(t){var a=this.sina.getDataSource(this.targetObjectType);var r=this.sina.createFilter({dataSource:a,searchTerm:"*"});for(var i=0;i<this.conditions.length;++i){var n=this.conditions[i];var o=this.sina.createSimpleCondition({attribute:n.targetPropertyName,attributeLabel:a.getAttributeMetadata(n.targetPropertyName).label,operator:this.sina.ComparisonOperator.Eq,value:t[n.sourcePropertyName].value,valueLabel:t[n.sourcePropertyName].valueFormatted});r.autoInsertCondition(o)}return this.sina._createNavigationTarget({label:this.label,targetUrl:this.navigationTargetGenerator.urlPrefix+encodeURIComponent(JSON.stringify(r.toJson()))})}}]);return t}();var i={__esModule:true};i.NavigationTargetTemplate=r;return i})})();