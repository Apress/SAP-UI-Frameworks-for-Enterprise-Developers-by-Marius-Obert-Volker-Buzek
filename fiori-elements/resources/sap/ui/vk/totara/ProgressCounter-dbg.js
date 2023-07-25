/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	// for progress
	function Counter() {
		this._count = 0;
		this._total = 0;

		var onValueChangedCallback;
		this.setOnValueChanged = function(callback) {
			onValueChangedCallback = callback;
		};

		this.callOnValueChanged = function() {
			if (onValueChangedCallback) {
				onValueChangedCallback();
			}
		};
	}

	var proto = Counter.prototype;
	Object.defineProperty(proto, "count", {
		get: function() { return this._count; },
		set: function(v) {
			if (v !== this._count) {
				this._count = v;
				this.callOnValueChanged();
			}
		}
	});

	Object.defineProperty(proto, "total", {
		get: function() { return this._total; },
		set: function(v) {
			if (v !== this._total) {
				this._total = v;
				this.callOnValueChanged();
			}
		}
	});

	var ProgressCounter = function() {

		// var that = this;
		var onProgressChanged;

		function onValueChanged() {
			if (onProgressChanged) {
				onProgressChanged(this);
			}
		}

		this.mesh = new Counter();
		this.geometry = new Counter();

		this.mesh.setOnValueChanged(onValueChanged);
		this.geometry.setOnValueChanged(onValueChanged);

		this.setOnProgressChanged = function(callback) {
			onProgressChanged = callback;
		};
	};

	return ProgressCounter;
});
