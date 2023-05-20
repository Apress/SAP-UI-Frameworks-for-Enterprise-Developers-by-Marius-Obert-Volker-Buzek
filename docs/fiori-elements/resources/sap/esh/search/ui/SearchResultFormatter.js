/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/esh/search/ui/SearchNavigationObject","sap/esh/search/ui/SearchNavigationObjectForSinaNavTarget","./SearchResultBaseFormatter","./sinaNexTS/providers/abap_odata/UserEventLogger","./sinaNexTS/sina/SearchResultSetItemAttribute"],function(e,t,a,i,r){function u(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}function n(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function o(e,t){for(var a=0;a<t.length;a++){var i=t[a];i.enumerable=i.enumerable||false;i.configurable=true;if("value"in i)i.writable=true;Object.defineProperty(e,i.key,i)}}function l(e,t,a){if(t)o(e.prototype,t);if(a)o(e,a);Object.defineProperty(e,"prototype",{writable:false});return e}function s(e,t){if(typeof t!=="function"&&t!==null){throw new TypeError("Super expression must either be null or a function")}e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:true,configurable:true}});Object.defineProperty(e,"prototype",{writable:false});if(t)f(e,t)}function f(e,t){f=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,a){t.__proto__=a;return t};return f(e,t)}function d(e){var t=p();return function a(){var i=b(e),r;if(t){var u=b(this).constructor;r=Reflect.construct(i,arguments,u)}else{r=i.apply(this,arguments)}return v(this,r)}}function v(e,t){if(t&&(typeof t==="object"||typeof t==="function")){return t}else if(t!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return c(e)}function c(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function p(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(e){return false}}function b(e){b=Object.setPrototypeOf?Object.getPrototypeOf.bind():function e(t){return t.__proto__||Object.getPrototypeOf(t)};return b(e)}var h=u(a);var m=i["UserEventType"];var g=r["SearchResultSetItemAttribute"];var y=function(a){s(r,a);var i=d(r);function r(e){var t;n(this,r);t=i.call(this,e);t.model=e;return t}l(r,[{key:"format",value:function e(a,i,r){r=r||{};r.suppressHighlightedValues=r.suppressHighlightedValues||false;var u=a.sina;var n={};var o=[];var l=a.items;for(var s=0;s<l.length;s++){var f=l[s];var d={};var v=[];for(var c=0;c<f.detailAttributes.length;c++){var p=f.detailAttributes[c];var b="";var e="";var h=undefined;if(p instanceof g){b=p.value;e=p.metadata.format;h=p.defaultNavigationTarget}switch(p.metadata.type){case u.AttributeType.ImageBlob:if(b&&b.trim().length>0){b="data:;base64,"+b}break;case u.AttributeType.ImageUrl:d.imageUrl=b;d.imageFormat=e?e.toLowerCase():undefined;if(h){d.imageNavigation=new t(h,this.model)}break;case u.AttributeType.GeoJson:d.geoJson={value:b,label:p.label};break;case u.AttributeType.Group:{var y=this._formatAttributeGroup(p,r,c);v.push(y);break}case u.AttributeType.Double:case u.AttributeType.Integer:case u.AttributeType.String:case u.AttributeType.Date:case u.AttributeType.Time:case u.AttributeType.Timestamp:{var T=this._formatSingleAttribute(p,r,c);v.push(T);break}}}d.key=f.key;d.keystatus=f.keystatus;d.dataSource=f.dataSource;d.dataSourceName=f.dataSource.label;d.attributesMap=f.attributesMap;if(f.titleAttributes){var A=void 0,S=void 0,_=void 0;var w=[];for(var O=0;O<f.titleAttributes.length;O++){A=f.titleAttributes[O];if(A.metadata.type===u.AttributeType.Group){S=this._formatAttributeGroup(A,r,O)}else if(A.metadata.type===u.AttributeType.ImageUrl){S=this._formatSingleAttribute(A,r,O);d.titleIconUrl=A.value;S.value=""}else{S=this._formatSingleAttribute(A,r,O)}if(A.infoIconUrl){d.titleInfoIconUrl=A.infoIconUrl;S.value=""}_=S.value;w.push(_)}d.title=w.join(" ")}else{d.title=r.suppressHighlightedValues?f.title:f.titleHighlighted}if(f.titleDescriptionAttributes&&f.titleDescriptionAttributes.length>0){var R=void 0,I=void 0,x=void 0;var D=[];var F=[];for(var k=0;k<f.titleDescriptionAttributes.length;k++){R=f.titleDescriptionAttributes[k];if(R.metadata.type===u.AttributeType.Group){I=this._formatAttributeGroup(R,r,k)}else{I=this._formatSingleAttribute(R,r,k)}x=I.value;D.push(x);F.push(I.name)}d.titleDescription=D.join(" ");d.titleDescriptionLabel=F.join(" ")}d.itemattributes=v;if(f.defaultNavigationTarget){d.titleNavigation=new t(f.defaultNavigationTarget,this.model);if(!d.title||d.title.length===0){d.title=f.defaultNavigationTarget.label}}if(f.navigationTargets&&f.navigationTargets.length>0){d.navigationObjects=[];for(var j=0;j<f.navigationTargets.length;j++){var N=f.navigationTargets[j];N.parent=f;var W=new t(N,this.model);W.setLoggingType(m.RESULT_LIST_ITEM_NAVIGATE_CONTEXT);d.navigationObjects.push(W)}}var P=n[f.dataSource.id]||{};n[f.dataSource.id]=P;d.layoutCache=P;d.selected=d.selected||false;d.expanded=d.expanded||false;var G={};this._formatResultForDocuments(f,G);this._formatResultForNotes(f,G);d.additionalParameters=G;d.positionInList=s;d.resultSetId=a.id;o.push(d)}return o}},{key:"_formatAttributeGroup",value:function e(t,a,i){if(t.attributes.length===2&&typeof t.attributes[1].attribute.value==="string"&&t.attributes[1].attribute.value.startsWith("sap-icon://")){var r=this._formatSingleAttribute(t.attributes[0].attribute,a,i);r.iconUrl=t.attributes[1].attribute.value;r.key=t.id;r.isTitle=false;r.isSortable=t.metadata.isSortable;r.attributeIndex=i;r.displayOrder=t.metadata.usage.Detail&&t.metadata.usage.Detail.displayOrder;return r}var u={};var n={};u.name=t.label;var o=false;var l=false;var s=t.metadata._private;var f,d;for(var v=0;v<t.attributes.length;v++){var c=t.attributes[v];var p=c.attribute;var b=c.metadata.nameInGroup;var h=void 0;if(p.metadata.type===p.sina.AttributeType.Group){h=this._formatAttributeGroup(p,a,i)}else{h=this._formatSingleAttribute(p,a,i)}if(s){if(s.parentAttribute===p.metadata){f=h}else if(s.childAttribute===p.metadata){d=h}}if(h.value!==undefined&&h.value.length>0){n[b]=h;o=o||h.whyfound;l=l||h.longtext!==undefined}}u.value="";u.valueRaw=undefined;u.valueWithoutWhyfound="";u.whyfound=false;if(Object.keys(n).length>0){var m=true;if(s&&f&&d&&(s.isUnitOfMeasure||s.isCurrency||s.isDescription)){var g=f.value;var y=d.value;g=g!==undefined&&g.trim().length>0?g:undefined;y=y!==undefined&&y.trim().length>0?y:undefined;if(!(g&&y)){if(s.isUnitOfMeasure||s.isCurrency){if(g&&!y){u.value=f.value;u.valueRaw=f.valueRaw;u.valueWithoutWhyfound=f.valueWithoutWhyfound;m=false}}else if(s.isDescription){var T=s.textArrangement;var A=t.sina;if(T===A.AttributeGroupTextArrangement.TextFirst){if(!g&&y){u.value=d.value;u.valueRaw=d.valueRaw;u.valueWithoutWhyfound=d.valueWithoutWhyfound;m=false}}else if(T===A.AttributeGroupTextArrangement.TextLast){if(g&&!y){u.value=f.value;u.valueRaw=f.valueRaw;u.valueWithoutWhyfound=f.valueWithoutWhyfound;m=false}}else if(T===A.AttributeGroupTextArrangement.TextOnly){if(!y){m=false}}}}}if(m){u.value=this._formatBasedOnGroupTemplate(t.template,n,"value");u.valueRaw=this._formatBasedOnGroupTemplate(t.template,n,"valueRaw");u.valueWithoutWhyfound=this._formatBasedOnGroupTemplate(t.template,n,"valueWithoutWhyfound")}u.whyfound=o}u.key=t.id;u.isTitle=false;u.isSortable=t.metadata.isSortable;u.attributeIndex=i;u.displayOrder=t.metadata.usage.Detail&&t.metadata.usage.Detail.displayOrder;if(l){u.longtext=u.value}return u}},{key:"_formatSingleAttribute",value:function e(a,i,r){var u={};var n=a.sina;u.name=a.label;u.valueRaw=a.value;u.value=i.suppressHighlightedValues?a.valueFormatted:a.valueHighlighted;u.valueWithoutWhyfound=a.valueFormatted;u.key=a.id;u.isTitle=false;u.isSortable=a.metadata.isSortable;u.attributeIndex=r;u.displayOrder=a.metadata.usage.Detail&&a.metadata.usage.Detail.displayOrder;u.whyfound=a.isHighlighted;if(a.defaultNavigationTarget){u.defaultNavigationTarget=new t(a.defaultNavigationTarget,this.model)}if(a.metadata.format&&(a.metadata.format===n.AttributeFormatType.MultilineText||a.metadata.format===n.AttributeFormatType.LongText)){u.longtext=a.valueHighlighted}return u}},{key:"_formatBasedOnGroupTemplate",value:function e(t,a,i){if(!(t&&a&&i)){return""}var r=/{\w+}/gi;var u="";var n=0;var o;while((o=r.exec(t))!==null){u+=t.substring(n,o.index);var l=o[0].slice(1,-1);u+=a[l]&&a[l][i]||"";n=r.lastIndex}u+=t.substring(n);return u}},{key:"_formatResultForDocuments",value:function t(a,i){var r="";i.isDocumentConnector=false;var u;for(var n=0;n<a.detailAttributes.length;n++){u=a.detailAttributes[n];if(u.metadata.id==="FILE_PROPERTY"){i.isDocumentConnector=true}if(u.metadata.isKey===true){if(r.length>0){r+=";"}r=r+u.metadata.id+"="+u.value}}if(i.isDocumentConnector===true){var o=";o=sid("+a.dataSource.system+"."+a.dataSource.client+")";var l=a.dataSource.id;i.imageUrl="/sap/opu/odata/SAP/ESH_SEARCH_SRV"+o+"/FileLoaderFiles(ConnectorId='"+l+"',FileType='ThumbNail',SelectionParameters='"+r+"')/$value";i.titleUrl="/sap/opu/odata/SAP/ESH_SEARCH_SRV"+o+"/FileLoaderFiles(ConnectorId='"+l+"',FileType='BinaryContent',SelectionParameters='"+r+"')/$value";var s="/sap/opu/odata/SAP/ESH_SEARCH_SRV"+o+"/FileLoaderFiles(ConnectorId='"+l+"',FileType='SUVFile',SelectionParameters='"+r+"')/$value";i.suvlink="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/fileviewer/viewer/web/viewer.html?file="+encodeURIComponent(s);if(!a.navigationObjects){a.navigationObjects=[]}var f={text:"Show Document",href:i.suvlink,target:"_blank"};var d=new e(f,this.model);a.navigationObjects.push(d);for(var v=0;v<a.detailAttributes.length;v++){u=a.detailAttributes[v];if(u.id==="PHIO_ID_THUMBNAIL"&&u.value){i.containsThumbnail=true}if(u.id==="PHIO_ID_SUV"&&u.value){i.containsSuvFile=true}}}}},{key:"_formatResultForNotes",value:function e(t,a){}}]);return r}(h);return y})})();