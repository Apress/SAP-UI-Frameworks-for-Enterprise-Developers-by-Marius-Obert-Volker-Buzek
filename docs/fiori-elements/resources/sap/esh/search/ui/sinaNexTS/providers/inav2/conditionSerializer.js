/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["../../core/errors","../../sina/AttributeType","../../sina/ComparisonOperator","../../sina/ComplexCondition","./typeConverter"],function(e,r,t,n,a){function i(e,r){if(!(e instanceof r)){throw new TypeError("Cannot call a class as a function")}}function o(e,r){for(var t=0;t<r.length;t++){var n=r[t];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function u(e,r,t){if(r)o(e.prototype,r);if(t)o(e,t);Object.defineProperty(e,"prototype",{writable:false});return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var s=e["UnknownComparisonOperatorError"];var c=r["AttributeType"];var l=t["ComparisonOperator"];var p=n["ComplexCondition"];var f=function(){function e(r){i(this,e);this.dataSource=r}u(e,[{key:"convertSinaToInaOperator",value:function e(r){switch(r){case l.Eq:return"=";case l.Lt:return"<";case l.Gt:return">";case l.Le:return"<=";case l.Ge:return">=";case l.Co:return"=";case l.Bw:return"=";case l.Ew:return"=";default:throw new s("unknow comparison operator "+r)}}},{key:"serializeComplexCondition",value:function e(r){var t={Selection:{Operator:{Code:r.operator,SubSelections:[]}}};var n=r.conditions;for(var a=0;a<n.length;++a){var i=n[a];t.Selection.Operator.SubSelections.push(this.serialize(i))}return t}},{key:"serializeSimpleCondition",value:function e(r){if(!r.value){return undefined}var t=r.attribute;var n;if(t.slice(0,2)==="$$"){n=c.String}else{var i=this.dataSource.getAttributeMetadata(t);n=i.type}var o="MemberOperand";if(t==="$$SuggestionTerms$$"||t==="$$SearchTerms$$"){o="SearchOperand"}var u={};u[o]={AttributeName:t,Comparison:this.convertSinaToInaOperator(r.operator),Value:a.sina2Ina(n,r.value,{operator:r.operator})};return u}},{key:"serialize",value:function e(r){if(r instanceof p){return this.serializeComplexCondition(r)}return this.serializeSimpleCondition(r)}}]);return e}();function v(e,r){var t=new f(e);return t.serialize(r)}var d={__esModule:true};d.serialize=v;return d})})();