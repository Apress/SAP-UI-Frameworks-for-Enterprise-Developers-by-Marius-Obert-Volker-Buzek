/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

/**
 * Spreadsheet export utility
 * @private
 */
sap.ui.define(['sap/base/Log', 'sap/ui/export/ExportUtils'], function(Log, ExportUtils) {
	'use strict';

	// eslint-disable-next-line
	/* global Blob, URL, Worker, MessageEvent */

	var LIB_PROVIDER = 'sap/ui/export/provider/DataProviderBase',
		LIB_BUILDER = 'sap/ui/export/js/XLSXBuilder',
		LIB_JSZIP3 = 'sap/ui/export/js/libs/JSZip3';

	/**
	 * Utility class to perform spreadsheet export.
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @alias sap.ui.export.SpreadsheetExport
	 * @private
	 * @since 1.50.0
	 */
	var SpreadsheetExport = {

		execute: function(mParams, fnCallback) {

			function postMessage(oMessage) {

				// Harmonize message handling between worker and in process export
				if (oMessage instanceof MessageEvent && oMessage.data) {
					oMessage = oMessage.data;
				}

				if (typeof fnCallback === 'function') {
					fnCallback(oMessage);
				}
			}

			function onProgress(iFetched, iTotal) {
				postMessage({
					progress: true,
					fetched: iFetched || 0,
					total: iTotal || 0
				});
			}

			function onError(error) {
				postMessage({ error: error.message || error });
			}

			function onFinish(oArrayBuffer) {
				postMessage({ finished: true, spreadsheet: oArrayBuffer });
			}

			// Export directly from an array in memory.
			// TBD: convert dates as in exportUtils
			function exportArray() {
				var oSpreadsheet;
				var fnConvertData;

				function start(DataProvider, XLSXBuilder) {
					fnConvertData = DataProvider.getDataConverter(mParams);
					oSpreadsheet =
						new XLSXBuilder(mParams.workbook.columns, mParams.workbook.context, mParams.workbook.hierarchyLevel, mParams.customizing);

					var aData = mParams.dataSource.data || [];
					var iCount = aData.length;
					var aRows = fnConvertData(aData.slice());
					oSpreadsheet.append(aRows);
					onProgress(iCount, iCount);
					oSpreadsheet.build().then(onFinish);
				}

				// Load libraries and start export
				sap.ui.require([LIB_PROVIDER, LIB_BUILDER, LIB_JSZIP3], start);

				return {cancel: onFinish};
			}

			function exportInProcess() {
				var oSpreadsheet, oRequest;

				function start(DataProvider, XLSXBuilder) {
					var provider = new DataProvider(mParams);

					oSpreadsheet =
						new XLSXBuilder(mParams.workbook.columns, mParams.workbook.context, mParams.workbook.hierarchyLevel, mParams.customizing);
					oRequest = provider.requestData(processCallback);
				}

				function processCallback(oMessage) {

					if (oMessage.error || typeof oMessage.error === 'string') {
						onError(oMessage.error);
						return;
					}

					oSpreadsheet.append(oMessage.rows);
					onProgress(oMessage.fetched, oMessage.total);

					if (oMessage.finished) {
						oSpreadsheet.build().then(onFinish);
					}
				}

				function cancel() {
					oRequest.cancel();
					onFinish();
				}

				// Load libraries and start export
				sap.ui.require([LIB_PROVIDER, LIB_BUILDER, LIB_JSZIP3], start);

				return {cancel: cancel};
			}

			function exportInWorker() {
				var spreadsheetWorker;
				var workerParams = {};

				var fnCancel = function() {
					spreadsheetWorker.postMessage({ cancel: true });
					onFinish();
				};

				function createWorker(url) {
					var worker = new Worker(url);
					worker.onmessage = postMessage;

					// Skips error handling if fired in Firefox with cross origin
					if (navigator.userAgent.indexOf("Firefox") === -1 || isSameOrigin(url)) {
						worker.onerror = onError;
					}

					worker.postMessage(mParams);

					return worker;
				}

				function isSameOrigin(url) {
					return url.indexOf(window.location.host) > 0
						|| /^[^/]+\/[^/].*$|^\/[^/].*$/i.test(url); //check for relative address
				}

				function blobWorker() {
					var sBlobCode, oBlobURL;

					Log.warning('Direct worker is not allowed. Load the worker via blob.');

					sBlobCode = 'self.origin = "' + workerParams.base + '"; ' + 'importScripts("' + workerParams.src + '")';
					oBlobURL = window.URL.createObjectURL(new Blob([sBlobCode]));

					return createWorker(oBlobURL);
				}

				function noWorker() {
					Log.warning('Blob worker is not allowed. Use in-process export.');
					fnCancel = exportInProcess(mParams).cancel;
				}

				function start() {
					try {
						spreadsheetWorker = createWorker(workerParams.src);
						spreadsheetWorker.addEventListener('error', function (e) { // Firefox fires an error event instead of a security exception
							spreadsheetWorker = blobWorker();
							spreadsheetWorker.addEventListener('error', function (e) {
								noWorker();
								e.preventDefault();
							});
							e.preventDefault();
						});
					} catch (err1) {
						try {
							spreadsheetWorker = blobWorker();
						} catch (err2) {
							noWorker();
						}
					}
				}

				// worker settings
				workerParams.base = ExportUtils.normalizeUrl(sap.ui.require.toUrl('sap/ui/export/js/'));
				workerParams.src = workerParams.base + 'SpreadsheetWorker.js';

				start();

				// fnCancel may be overwritten asynchronously after return, therefore it should be wrapped into a closure
				return {cancel: function() {fnCancel();}};
			}

			if (mParams.dataSource.type === 'array') {
				return exportArray();
			} else if (mParams.worker === false) {
				return exportInProcess();
			} else {
				return exportInWorker();
			}
		}
	};

	return SpreadsheetExport;

}, /* bExport= */ true);
