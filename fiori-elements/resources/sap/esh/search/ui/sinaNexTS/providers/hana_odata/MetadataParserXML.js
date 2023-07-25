/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){function e(e,t,r){if(r){return t?t(e):e}if(!e||!e.then){e=Promise.resolve(e)}return t?e.then(t):e}sap.ui.define(["../../sina/DataSourceType","./MetadataParser","./HierarchyMetadataParser"],function(t,r,n){function a(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function i(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function o(e,t,r){if(t)i(e.prototype,t);if(r)i(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function s(e,t){if(typeof t!=="function"&&t!==null){throw new TypeError("Super expression must either be null or a function")}e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:true,configurable:true}});Object.defineProperty(e,"prototype",{writable:false});if(t)u(e,t)}function u(e,t){u=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return u(e,t)}function c(e){var t=E();return function r(){var n=d(e),a;if(t){var i=d(this).constructor;a=Reflect.construct(n,arguments,i)}else{a=n.apply(this,arguments)}return f(this,a)}}function f(e,t){if(t&&(typeof t==="object"||typeof t==="function")){return t}else if(t!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return l(e)}function l(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function E(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(e){return false}}function d(e){d=Object.setPrototypeOf?Object.getPrototypeOf.bind():function e(t){return t.__proto__||Object.getPrototypeOf(t)};return d(e)}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var h=t["DataSourceType"];var p=r["MetadataParser"];var y=n["HierarchyMetadataParser"];var R=function(t){s(n,t);var r=c(n);function n(e){a(this,n);return r.call(this,e)}o(n,[{key:"_getWindow",value:function t(){try{const t=this;if(typeof window==="undefined"){if(typeof t.jsDOMWindow==="undefined"){var r=require("jsdom");var n=require("fs");var a=n.readFileSync("./node_modules/jquery/dist/jquery.js","utf-8");var i=new r.JSDOM("<html><script>"+a+"<\/script><body></body></html>",{runScripts:"dangerously"});t.jsDOMWindow=i.window;i.window.$=i.window.jQuery}return e(t.jsDOMWindow)}return e(window)}catch(e){return Promise.reject(e)}}},{key:"fireRequest",value:function t(r,n){try{return e(r.getXML(n))}catch(e){return Promise.reject(e)}}},{key:"parseResponse",value:function t(r){try{const t=this;var n=t;var a={businessObjectMap:{},businessObjectList:[],dataSourceMap:{},dataSourcesList:[]};return e(t._getWindow(),function(e){var t=e.$.parseXML(r);e.$(t).find("Schema").each(function(){var t=e.$(this);var r=n._parseEntityType(t,e);n._parseEntityContainer(t,r,a,e)});return a})}catch(e){return Promise.reject(e)}}},{key:"_parseEntityType",value:function e(t,r){var n=this;var a={};t=r.$(t);var i=new y(r.$);t.find("EntityType").each(function(){var e=r.$(this).attr("Name");var o={schema:t.attr("Namespace"),keys:[],attributeMap:{},resourceBundle:"",labelResourceBundle:"",label:"",labelPlural:"",annotations:{},hierarchyDefinitionsMap:{},icon:""};a[e]=o;r.$(this).find("Key>PropertyRef").each(function(){o.keys.push(r.$(this).attr("Name"))});r.$(this).find('>Annotation[Term="EnterpriseSearch.hierarchy.parentChild"]').each(function(){o.hierarchyDefinitionsMap=i.parse(e,this)});r.$(this).find('Annotation[Term="Search.searchable"]').each(function(){r.$(this).siblings("Annotation").each(function(){var t=r.$(this);var a=t.attr("Term");if(a!==undefined&&a.length>0){a=a.toUpperCase();var i=n._getValueFromElement(this,r);if(a==="ENTERPRISESEARCHHANA.UIRESOURCE.LABEL.BUNDLE"){var s=i;try{o.resourceBundle=r.jQuery.sap.resources({url:s,language:r.sap.ui.getCore().getConfiguration().getLanguage()})}catch(t){n.log.error("Resource bundle of "+e+" '"+s+"' can't be found:"+t.toString())}}else if(a==="ENTERPRISESEARCHHANA.UIRESOURCE.LABEL.KEY"){var u=i;if(u&&o.resourceBundle){var c=o.resourceBundle.getText(u);if(c){o.labelResourceBundle=c}}}else if(a==="UI.HEADERINFO.TYPENAME"){o.label=i}else if(a==="UI.HEADERINFO.TYPENAMEPLURAL"){o.labelPlural=i}else if(a==="UI.HEADERINFO.TITLE.TYPE"){n._setAnnotationValue(o.annotations,a,i)}else if(a==="UI.HEADERINFO.TITLE.VALUEQUALIFIER"){n._setAnnotationValue(o.annotations,a,i)}else if(a==="UI.HEADERINFO.TYPEIMAGEURL"){o.icon=i}else{n._setAnnotationValue(o.annotations,a,i)}}})});r.$(this).find("Property").each(function(e){var t=r.$(this).attr("Name");var a={labelRaw:t,label:null,type:r.$(this).attr("Type"),presentationUsage:[],isFacet:false,isSortable:false,supportsTextSearch:false,displayOrder:e,annotationsAttr:{},unknownAnnotation:[],hierarchyDefinition:o.hierarchyDefinitionsMap[t]};o.attributeMap[t]=a;r.$(this).find("Annotation").each(function(){var e=r.$(this).attr("Term");if(e!==undefined&&e.length>0){e=e.toUpperCase();var t=n._getValueFromElement(this,r);if(t==undefined){r.$(this).children("Collection").children("Record").each(function(){t=t||[];var e={};t.push(e);r.$(this).children("PropertyValue").each(function(){var t=r.$(this).attr("Property");if(t!==undefined&&t.length>0){t=t.toUpperCase();var a=n._getValueFromElement(this,r);if(a!==undefined){e[t]=a}}})})}if(t!==undefined){switch(e){case"SAP.COMMON.LABEL":if(!a.label){a.label=t}break;case"ENTERPRISESEARCHHANA.UIRESOURCE.LABEL.KEY":if(t&&o.resourceBundle){var i=o.resourceBundle.getText(t);if(i){a.label=i}}break;case"ENTERPRISESEARCH.KEY":a.isKey=t;break;case"ENTERPRISESEARCH.PRESENTATIONMODE":r.$(this).find("Collection>String").each(function(){var e=n._getValueFromElement(this,r);if(e){a.presentationUsage.push(e)}});break;case"ENTERPRISESEARCHHANA.ISSORTABLE":a.isSortable=t;break;case"ENTERPRISESEARCHHANA.SUPPORTSTEXTSEARCH":a.supportsTextSearch=t;break;case"ENTERPRISESEARCH.FILTERINGFACET.DEFAULT":a.isFacet=t;break;case"ENTERPRISESEARCH.FILTERINGFACET.DISPLAYPOSITION":a.facetPosition=t;break;case"ENTERPRISESEARCH.FILTERINGFACET.ICONURL":a.facetIconUrlAttributeName=t;break;case"ENTERPRISESEARCH.FILTERINGATTRIBUTE.DEFAULT":a.isFilteringAttribute=t;break;case"ENTERPRISESEARCH.FILTERINGATTRIBUTE.DISPLAYPOSITION":a.facetPosition=t;break;case"ENTERPRISESEARCH.FILTERINGATTRIBUTE.ICONURL":a.facetIconUrlAttributeName=t;break;case"ENTERPRISESEARCH.DISPLAYORDER":a.displayOrder=t;break;default:if(e.startsWith("UI")||e.startsWith("OBJECTMODEL")||e.startsWith("SEMANTICS")){n._setAnnotationValue(a.annotationsAttr,e,t)}else{a.unknownAnnotation.push(r.$(this))}}}}});var i=a.annotationsAttr.UI&&a.annotationsAttr.UI.IDENTIFICATION;if(i){if(i.POSITION!==undefined){a.displayOrder=i.POSITION}else if(Array.isArray(i)){for(var s=0;s<i.length;s++){if(i[s].TYPE==undefined&&i[s].POSITION!==undefined){a.displayOrder=i[s].POSITION;break}}}}})});return a}},{key:"_getValueFromElement",value:function e(t,r){var n=r.$(t);var a=n.text();if(!a||a.trim().length==0){a=undefined;if(n.attr("String")!==undefined){a=n.attr("String")}else if(n.attr("Decimal")!==undefined){try{a=Number.parseFloat(n.attr("Decimal"));if(isNaN(a)){a=undefined}}catch(e){a=undefined}}else if(n.attr("Int")!==undefined){try{a=Number.parseInt(n.attr("Int"),10);if(isNaN(a)){a=undefined}}catch(e){a=undefined}}else if(n.attr("Bool")!==undefined){a=n.attr("Bool")=="true"}}return a}},{key:"_parseEntityContainer",value:function e(t,r,n,a){var i=this;t.find("EntityContainer>EntitySet").each(function(){if(a.$(this).attr("Name")&&a.$(this).attr("EntityType")){var e=a.$(this).attr("Name");var t=a.$(this).attr("EntityType");var o=t.slice(t.lastIndexOf(".")+1);var s=r[o];if(s===undefined){throw"EntityType "+o+" has no corresponding meta data!"}var u=i.sina._createDataSource({id:e,label:s.labelResourceBundle||s.label||e,labelPlural:s.labelResourceBundle||s.labelPlural||s.label||e,icon:s.icon||"",type:h.BusinessObject,attributesMetadata:[{id:"dummy"}]});u.annotations=s.annotations;n.dataSourceMap[u.id]=u;n.dataSourcesList.push(u);s.name=e;s.dataSource=u;n.businessObjectMap[e]=s;n.businessObjectList.push(s)}})}}]);return n}(p);var b={__esModule:true};b.MetadataParserXML=R;return b})})();