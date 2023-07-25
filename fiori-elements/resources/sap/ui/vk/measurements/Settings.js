/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var e="sap.ui.vk.measurements.Settings";var t={color:0,precision:1,units:"mm",featureVertex:true,featureEdge:true,featureFace:true};var r={};r.load=function(){var r=self.localStorage.getItem(e);if(r==null){r={}}else{try{r=JSON.parse(r)}catch(e){r={}}}return Object.assign(Object.assign({},t),r)};r.save=function(t){var r;if("scale"in t){r=t.scale;delete t.scale}self.localStorage.setItem(e,JSON.stringify(t));if(r!=null){t.scale=r}return this};return r});