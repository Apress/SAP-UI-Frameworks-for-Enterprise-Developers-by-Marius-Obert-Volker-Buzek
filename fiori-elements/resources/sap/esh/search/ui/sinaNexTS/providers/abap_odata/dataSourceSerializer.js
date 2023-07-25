/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,t){var a=typeof Symbol!=="undefined"&&e[Symbol.iterator]||e["@@iterator"];if(!a){if(Array.isArray(e)||(a=r(e))||t&&e&&typeof e.length==="number"){if(a)e=a;var n=0;var i=function(){};return{s:i,n:function(){if(n>=e.length)return{done:true};return{done:false,value:e[n++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o=true,u=false,s;return{s:function(){a=a.call(e)},n:function(){var e=a.next();o=e.done;return e},e:function(e){u=true;s=e},f:function(){try{if(!o&&a.return!=null)a.return()}finally{if(u)throw s}}}}function r(e,r){if(!e)return;if(typeof e==="string")return t(e,r);var a=Object.prototype.toString.call(e).slice(8,-1);if(a==="Object"&&e.constructor)a=e.constructor.name;if(a==="Map"||a==="Set")return Array.from(e);if(a==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a))return t(e,r)}function t(e,r){if(r==null||r>e.length)r=e.length;for(var t=0,a=new Array(r);t<r;t++){a[t]=e[t]}return a}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */function a(r){if(r===r.sina.getAllDataSource()){return[{Id:"<All>",Type:"Category"}]}var t;var a=[];var n;switch(r.type){case r.sina.DataSourceType.Category:t="Category";a.push({Id:r.id,Type:t});break;case r.sina.DataSourceType.BusinessObject:t="View";a.push({Id:r.id,Type:t});break;case r.sina.DataSourceType.UserCategory:n=r;if(!n.subDataSources||Array.isArray(n.subDataSources)===false){break}var i=e(n.subDataSources),o;try{for(i.s();!(o=i.n()).done;){var u=o.value;switch(u.type){case u.sina.DataSourceType.Category:t="Category";a.push({Id:u.id,Type:t});break;case u.sina.DataSourceType.BusinessObject:t="View";a.push({Id:u.id,Type:t});break}}}catch(e){i.e(e)}finally{i.f()}}return a}var n={__esModule:true};n.serialize=a;return n})})();