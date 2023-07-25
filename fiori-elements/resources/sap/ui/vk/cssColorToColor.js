/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var e=function(){var e=false;var r=document.createElement("div");r.id="sap.ui.vk.colorConverter";r.style.setProperty("display","none","important");return function(t){if(!e){if(document.body){document.body.appendChild(r);e=true}else{return{red:0,green:0,blue:0,alpha:1}}}r.style.setProperty("color","rgba(0, 0, 0, 0)","important");r.style.setProperty("color",t,"important");var n=window.getComputedStyle(r).color;if(n==="transparent"){return{red:0,green:0,blue:0,alpha:0}}else{var a=n.split("(")[1].split(")")[0].split(",");return{red:parseInt(a[0],10),green:parseInt(a[1],10),blue:parseInt(a[2],10),alpha:a.length===4?parseFloat(a[3]):1}}}}();return e},true);