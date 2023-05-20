/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/base/ObjectPool",
	"sap/ui/Device"
], function (ObjectPool, Device) {
	"use strict";

	var sKlayModule = "sap.ui.thirdparty";

	function PoolableWorker() {
		var sPath = sap.ui.require.toUrl((sKlayModule).replace(/\./g, "/")) + "/klay.js";
		this._worker = new Worker(sPath);
	}

	PoolableWorker.prototype.getWorker = function () {
		return this._worker;
	};

	PoolableWorker.prototype.init = function () {
	};

	PoolableWorker.prototype.reset = function () {
		this._worker.onmessage = null;
		this._worker.onerror = null;
	};


	/**
	 * A wrapper over klayjs which tries to send the layout job to worker thread if available.
	 *
	 * @static
	 * @private
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.layout.KlayWrapper
	 */
	var KlayWrapper = {},
		// firefox has issues with scripts loaded from different domain (cross domain policy)
		// while other browser throws (caught) error, firefox seems to just crush
		bUseWorker = !Device.browser.firefox;

	KlayWrapper._pool = new ObjectPool(PoolableWorker);

	KlayWrapper.layout = function (oParameters) {
		if (typeof (Worker) !== "undefined" && bUseWorker) {
			try {
				var oPooledWorker = KlayWrapper._pool.borrowObject(),
					oWorker = oPooledWorker.getWorker();
				oWorker.postMessage({
					graph: oParameters.graph,
					options: oParameters.options
				});
				oWorker.onmessage = function (oData) {
					if (oData.data.stacktrace) {
						oParameters.error(oData.data);
					} else {
						oParameters.success(oData.data);
					}
					KlayWrapper._pool.returnObject(oPooledWorker);
				};
				oWorker.onerror = function () {
					KlayWrapper._pool.returnObject(oPooledWorker);
					//In most cases onerror happens because Worker fialed to initialize, so we should try it locally.
					KlayWrapper.run(oParameters);
				};
			} catch (e) {
				KlayWrapper.run(oParameters);
			}
		} else {
			KlayWrapper.run(oParameters);
		}
	};

	KlayWrapper.run = function (oParameters) {
		KlayWrapper.getKlay().then(function (oKlay) {
			oKlay.layout(oParameters);
		});
	};

	KlayWrapper.getKlay = function () {
		if (typeof ($klay) === "undefined") {
			return new Promise(function (resolve) {
				var sModuleName = sKlayModule.replace(/\./g, "/") + "/klay";
				sap.ui.require([sModuleName], function () {
					resolve($klay); // eslint-disable-line no-undef
				});
			});
		} else {
			return Promise.resolve($klay); // eslint-disable-line no-undef
		}
	};

	return KlayWrapper;
}, true);
