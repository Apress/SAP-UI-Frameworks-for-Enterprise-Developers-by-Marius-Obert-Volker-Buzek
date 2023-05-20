/**
 * Spreadsheet Worker - Document Export Services
 */
var spreadsheet;
var provider;
var request;
var origin = self.origin || "";

/* global XLSXBuilder, importScripts, DataProviderBase */

importScripts(origin + 'XLSXBuilder.js');
importScripts(origin + '../provider/DataProviderBase.js');
importScripts(origin + 'libs/JSZip3.js');

self.onmessage = function(oMessage) {
	'use strict';

	if (oMessage.data.cancel) {
		if (request) {
			request.cancel();
		}
		close();
		return;
	}

	var mSettings = oMessage.data;
	spreadsheet =
		new XLSXBuilder(mSettings.workbook.columns, mSettings.workbook.context, mSettings.workbook.hierarchyLevel, mSettings.customizing);

	provider = new DataProviderBase(mSettings);

	if (!(provider instanceof DataProviderBase)) {
		processCallback({
			error: 'Invalid DataProvider - Export aborted'
		});
	}

	request = provider.requestData(processCallback);
};

function processCallback(oMessage) {
	'use strict';

	if (oMessage.error) {
		postMessage({
			error: oMessage.error
		});
		close(); // Terminate the Worker and prevent further processing
	}

	spreadsheet.append(oMessage.rows);

	postMessage({
		progress: true,
		fetched: oMessage.fetched,
		total: oMessage.total
	}); // Send status update

	oMessage.finished && spreadsheet.build().then(saveSpreadsheet);
}

function saveSpreadsheet(oArraybuffer) {
	'use strict';

	var oMessageData = {
		finished: true,
		spreadsheet: oArraybuffer
	};

	postMessage(oMessageData, [oMessageData.spreadsheet]);
	close(); // Terminate the Worker
}
