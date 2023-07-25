/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	var CallbackHandler = function() {
		this.callbacks = [];
	};

	CallbackHandler.prototype.attach = function(callback) {
		this.callbacks.push(callback);
	};

	CallbackHandler.prototype.detach = function(callback) {
		var idx = this.callbacks.indexOf(callback);
		if (idx !== -1) {
			this.callbacks.splice(idx, 1);
			return true;
		}
		return false;
	};

	CallbackHandler.prototype.execute = function(arg) {
		for (var i = 0; i < this.callbacks.length; i++) {
			this.callbacks[i](arg);
		}
	};

	CallbackHandler.prototype.detachAll = function() {
		this.callbacks = [];
	};

	return CallbackHandler;
});
