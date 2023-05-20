/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define(function() {
	"use strict";

	/**
	 * Class to manage a set of pending requests.
	 */
	var PendingRequestsUtil = function() {
		this._aPendingRequests = [];
	};
	/**
	 * Checks if the request is in the set.
	 * @param oRequest - request to use during the check.
	 * @returns true if the set contains the element, false otherwise.
	 */
	PendingRequestsUtil.prototype.contains = function(oRequest) {
		for (var iIndex = 0; iIndex < this._aPendingRequests.length; ++iIndex) {
			if (this._aPendingRequests[iIndex] === oRequest) {
				return true;
			}
			return false;
		}
	};
	/**
	 * @param oRequest - request to add to the set.
	 * @returns true if the set was altered, false otherwise.
	 */
	PendingRequestsUtil.prototype.add = function(oRequest) {
		if (this.contains(oRequest)) {
			return false;
		}
		else {
			this._aPendingRequests.push(oRequest);
			return true;
		}
	};
	/**
	 * @param oRequest - request to remove from the set.
	 * @returns true if the set was altered, false otherwise.
	 */
	PendingRequestsUtil.prototype.remove = function(oRequest) {
		for (var iIndex = 0; iIndex < this._aPendingRequests.length; ++iIndex) {
			if (this._aPendingRequests[iIndex] === oRequest) {
				this._aPendingRequests.splice(iIndex, 1);
				return true;
			}
		}
		return false;
	};
	/**
	 * Aborts every request in the set.
	 */
	PendingRequestsUtil.prototype.abortAll = function() {
		var oRequest;
		while ((oRequest = this._aPendingRequests.pop()) !== undefined) {
			oRequest.abort();
		}
	};

	return PendingRequestsUtil;
}, true);