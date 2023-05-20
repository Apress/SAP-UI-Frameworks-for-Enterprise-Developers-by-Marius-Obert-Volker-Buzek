/*
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */

sap.ui.define(["sap/ui/thirdparty/jquery"], function(jQuery) {
	"use strict";

	/* global Promise */

	/**
	 * @class
	 * @classdesc Asynchronous queue for JavaScript functions.
	 *
	 * Creates a new queue instance.
	 *
	 * @param {int} [iMaxLength] Maximum queue length
	 *
	 * @alias sap.ui.generic.app.util.Queue
	 * @private
	 *
	 * @since 1.30.0
	 * @author SAP SE
	 * @version 1.113.0
	 */
	var Queue = function(iMaxLength) {
		this._iMaxLength = iMaxLength;
		this._aQueue = [];
		this._aEventHandlerRegistry = [];
	};

	/* Internal functions for attaching, detaching and firing events */
	Queue.prototype._attachEvent = function(sEvent, fnFunction) {
		if (typeof fnFunction !== "function") {
			throw new Error("Event handler must be a function");
		}
		this._aEventHandlerRegistry.push({
			event: sEvent,
			handler: fnFunction
		});
	};
	Queue.prototype._detachEvent = function(sEvent, fnFunction) {
		for (var i = this._aEventHandlerRegistry.length; i--;) {
			if (this._aEventHandlerRegistry[i].handler === fnFunction && this._aEventHandlerRegistry[i].event === sEvent) {
				this._aEventHandlerRegistry.splice(i, 1);
			}
		}
	};
	Queue.prototype._fireEvent = function(sEvent, oEvent) {
		for (var i = 0; i < this._aEventHandlerRegistry.length; i++) {
			if (this._aEventHandlerRegistry[i].event === sEvent) {
				this._aEventHandlerRegistry[i].handler(oEvent);
			}
		}
	};

	/**
	 * Removes the first item from the queue and executes the next item on the queue.
	 *
	 * @private
	 */
	Queue.prototype._execNext = function() {
		var oNext, that = this;

		// the method  is invoked by the OData model at a point in time, when the OData model does not have
		// cleaned up its internal data structures, especially the one to track pending changes.
		// therefore place a timeout to make sure that when the check for the next request is invoked in our queue
		// that the internal data structures are up to date.
		setTimeout(function() {
			that._aQueue.shift();
			oNext = that._aQueue[0];

			if (oNext) {
				that._exec(oNext);
			} else {
				that._fireEvent('onQueueCompleted');
			}
		});
	};

	/**
	 * Executes the given item and defers execution of the next item, if it exists.
	 *
	 * @param {object} oItem The item to be executed
	 * @private
	 */
	Queue.prototype._exec = function(oItem) {
		var that = this, fSuccess = function() {
			that._execNext();
		};

		this._fireEvent('beforeQueueItemProcess', oItem.eventParameters);

		oItem.jqdeferred.resolve();
		oItem.wait.then(function() {
			// wait until other handlers have executed.
			oItem.wait.then(fSuccess);
		}, jQuery.proxy(that._cancel, that));
	};

	/**
	 * Enqueues a function. If the queue has reached its maximum capacity, the function is rejected.
	 *
	 * @param {function} fFunc The function to be enqueued
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the enqueued item
	 * @public
	 */
	Queue.prototype.enqueue = function(fFunc, mEventParameters) {
		var oItem = {
			fn: fFunc,
			eventParameters : mEventParameters
		};

		// build up the item:
		// use jQuery.Deferred to create a pending promise.
		oItem.jqdeferred = jQuery.Deferred();
		oItem.defer = new Promise(function (fulfill, reject) {
			oItem.jqdeferred.then(fulfill, reject);
		});

		// enable consumers to chain to the executed function:
		// function also returns a promise:
		// so implicitly consumers chain to the resolved or rejected promise
		// returned by the function.
		oItem.wait = oItem.defer.then(fFunc);

		if (!(this._iMaxLength === undefined) && this._aQueue.length >= this._iMaxLength) {
			oItem.jqdeferred.reject(new Error("Queue overflow: " + this._aQueue.length));
		} else {
			this._aQueue.push(oItem);

			// if only one item is on the queue, execute it immediately.
			if (this._aQueue.length === 1) {
				this._exec(oItem);
			}
		}

		return oItem.wait.then();
	};

	/**
	 * Cancels the execution of the current queue by rejecting each enqueued item. Additionally all existing items are removed from the queue.
	 *
	 * @private
	 */
	Queue.prototype._cancel = function(oError) {
		var oItem, i, len = this._aQueue.length;

		for (i = 0; i < len; i++) {
			oItem = this._aQueue[i];
			oItem.jqdeferred.reject(oError || new Error("Queue cancellation"));
		}

		this._fireEvent('onQueueFailed');

		this._aQueue = [];
	};

	/**
	 * Frees all resources claimed during the life-time of this instance.
	 *
	 * @public
	 */
	Queue.prototype.destroy = function() {
		this._aQueue = [];
	};

	return Queue;

}, true);