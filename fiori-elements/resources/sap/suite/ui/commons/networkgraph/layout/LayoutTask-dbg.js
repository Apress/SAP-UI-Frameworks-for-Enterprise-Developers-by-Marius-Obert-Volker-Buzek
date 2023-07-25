/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	/**
	 * Constructor for a new LayoutTask.
	 *
	 * @class
	 * A layout task is a wrapper around Promise which allows the caller to terminate the task. A terminated layout task
	 * should not modify the graph associated with it.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @constructor
	 * @param {function} fnPromiseCallback A function to be called from Promise main body. It gets
	 * @public
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.layout.LayoutTask
	 */
	var LayoutTask = BaseObject.extend("sap.suite.ui.commons.networkgraph.layout.LayoutTask", {
		constructor: function (fnPromiseCallback) {
			BaseObject.apply(this, arguments);
			this._bTerminated = false;
			this._oPromise = new Promise(function (resolve, reject) {
				fnPromiseCallback(resolve, reject, this);
			}.bind(this));
		}
	});

	/**
	 * Exposes then function of an underlining promise.
	 *
	 * @param {function} fnOnFulfilled Callback to be called on success.
	 * @param {function} [fnOnRejected] Callback to be called on failure.
	 * @returns {sap.suite.ui.commons.networkgraph.layout.LayoutTask} Returns self.
	 */
	LayoutTask.prototype.then = function (fnOnFulfilled, fnOnRejected) {
		this._oPromise = this._oPromise.then(fnOnFulfilled, fnOnRejected);
		return this;
	};

	/**
	 * Exposes catch function of an underlining promise.
	 *
	 * @param {function} fnOnRejected Callback to be called on failure.
	 * @returns {sap.suite.ui.commons.networkgraph.layout.LayoutTask} Returns self.
	 */
	LayoutTask.prototype.catch = function (fnOnRejected) {
		this._oPromise = this._oPromise.catch(fnOnRejected);
		return this;
	};

	/**
	 * Sets the terminate flag. This should prevent the layout algorithm from modifying the graph.
	 *
	 * @returns {sap.suite.ui.commons.networkgraph.layout.LayoutTask} Return self.
	 */
	LayoutTask.prototype.terminate = function () {
		this._bTerminated = true;
		return this;
	};

	/**
	 * Checks if the task is terminated.
	 *
	 * @returns {boolean} True if the task is terminated and should net modify the graph, false otherwise.
	 */
	LayoutTask.prototype.isTerminated = function () {
		return this._bTerminated;
	};

	return LayoutTask;
});
