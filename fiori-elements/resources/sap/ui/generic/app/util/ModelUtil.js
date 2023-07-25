/*
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";var e=function(e){this._oModel=e};e.prototype.getContextFromResponse=function(e){var t="/"+this._oModel.getKey(e);return this._oModel.getContext(t)};e.getEntitySetFromContext=function(e){var t,o;if(!e){throw new Error("No context")}if(e&&e.getPath){t=e.getPath().split("(")[0];o=t.substring(1)}if(o==null){return null}else{return e.getModel().getMetaModel().getODataEntitySet(o)&&e.getModel().getMetaModel().getODataEntitySet(o).name}};e.prototype.hasClientMessages=function(){var e,t,o,r,n=0,s=0;e=sap.ui.getCore().getMessageManager();t=e.getMessageModel();o=t.getData();if(o){s=o.length}for(n=0;n<s;n++){r=o[n];if(r.processor.getMetadata()._sClassName==="sap.ui.core.message.ControlMessageProcessor"){return true}}return false};e.prototype.destroy=function(){this._oModel=null};return e},true);