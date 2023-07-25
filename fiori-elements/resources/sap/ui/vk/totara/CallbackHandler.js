/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var t=function(){this.callbacks=[]};t.prototype.attach=function(t){this.callbacks.push(t)};t.prototype.detach=function(t){var c=this.callbacks.indexOf(t);if(c!==-1){this.callbacks.splice(c,1);return true}return false};t.prototype.execute=function(t){for(var c=0;c<this.callbacks.length;c++){this.callbacks[c](t)}};t.prototype.detachAll=function(){this.callbacks=[]};return t});