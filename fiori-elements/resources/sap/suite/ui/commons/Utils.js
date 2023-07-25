/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([],function(){"use strict";var e={};e._setupMobileDraggable=function(e){if(sap.ui.getCore().isMobile()){var t=function(e,t){if(e.originalEvent.touches.length>1){return}e.preventDefault();var n=e.originalEvent.changedTouches[0],u=document.createEvent("MouseEvents");u.initMouseEvent(t,true,true,window,1,n.screenX,n.screenY,n.clientX,n.clientY,false,false,false,false,0,null);e.target.dispatchEvent(u)};var n=false;e.bind({touchstart:function(e){if(n){return}n=true;t(e,"mouseover");t(e,"mousemove");t(e,"mousedown")},touchmove:function(e){if(!n){return}t(e,"mousemove")},touchend:function(e){if(!n){return}t(e,"mouseup");t(e,"mouseout");t(e,"click");n=false}})}};return e},true);