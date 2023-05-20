/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/thirdparty/URI"],function(t){"use strict";var i={};i.absoluteUri=function(i){var r=new t(sap.ui.require.toUrl(i));if(r.is("relative")){r=r.absoluteTo(new t(document.baseURI))}return r};i.loadScript=function(t,i){var r=this.absoluteUri(t);var e=[];if(i&&i.length>0){i.forEach(function(t){e.push("'"+this.absoluteUri(t)+"'")},this)}e.push("'"+r.toString()+"'");return new Worker((window.URL||window.webkitURL).createObjectURL(new Blob(["importScripts("+e.join()+");"],{type:"application/javascript"})))};return i});