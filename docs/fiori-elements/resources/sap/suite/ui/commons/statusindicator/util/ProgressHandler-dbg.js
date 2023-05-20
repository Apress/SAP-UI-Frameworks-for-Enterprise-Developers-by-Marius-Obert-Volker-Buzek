/* globals Promise:true */

sap.ui.define([], function () {
	"use strict";

	var ProgressHandler = function (fnProgress) {
		var that = this;

		this._fnResolveCallback = null;
		this._oPromise = null;
		this._bInProgress = false;
		this._fnProgress = fnProgress;
		this._oInnerProgressHandler = {
			finish: function () {
				that.finish();
			},
			stop: function (oReason) {
				that.stop(oReason);
			},
			isCanceled: function () {
				return that.isCanceled();
			}
		};
	};

	ProgressHandler.prototype.start = function () {
		var that = this;
		if (this._oPromise) {
			return this._oPromise;
		}

		this._oPromise = new Promise(function (resolve, reject) {
			that._fnResolveCallback = resolve;

			that._bInProgress = true;
			that._fnProgress(that._oInnerProgressHandler);
		});

		return this._oPromise;
	};

	ProgressHandler.prototype.finish = function () {
		this._bInProgress = false;
		if (this._fnResolveCallback) {
			this._fnResolveCallback();
			this._fnResolveCallback = null;
		}
	};

	ProgressHandler.prototype.stop = function (oReason) {
		this._bInProgress = false;
		if (this._fnResolveCallback) {
			this._fnResolveCallback(oReason);
			this._fnResolveCallback = null;
		}
	};

	ProgressHandler.prototype.cancel = function () {
		this._bCancelled = true;
	};

	ProgressHandler.prototype.isCanceled = function () {
		return this._bCancelled;
	};

	ProgressHandler.prototype.isInProgress = function () {
		return this._bInProgress;
	};

	return ProgressHandler;
}, true);
