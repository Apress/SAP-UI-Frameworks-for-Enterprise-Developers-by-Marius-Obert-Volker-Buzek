/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

(function(fClass) {
	'use strict';

	if (typeof sap !== "undefined" && typeof sap.ui.define === 'function') {
		sap.ui.define([], fClass, /* bExport */ true);
	} else {
		var oContext;

		if (typeof window !== "undefined") {
			oContext = window;
		} else if (typeof self !== "undefined") {
			oContext = self;
		} else {
			// eslint-disable-next-line consistent-this
			oContext = this;
		}
		oContext.DataProviderBase = fClass();
	}
})(function() {
	'use strict';

	// eslint-disable-next-line
	/* global URL, XMLHttpRequest */

	/**
	 *	Default DataProviderBase implementation that is capable to handle
	 *	OData V2 as well as OData V4.
	 *
	 * @param {object} mSettings Data service related part of the export configuration
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @class DataProviderBase
	 * @alias sap.ui.export.provider.DataProviderBase
	 * @since 1.77
	 * @private
	 */
	var DataProviderBase = function(mSettings) {

		this.mSettings = mSettings;
		this.bCanceled = false;
		this.iAvailableRows = 0;
		this.mRequest = null;

		this.iTotalRows = Math.min(mSettings.dataSource.count || DataProviderBase.MAX_ROWS, DataProviderBase.MAX_ROWS);
		this.iBatchSize = Math.min(mSettings.dataSource.sizeLimit || DataProviderBase.MAX_ROWS, this.iTotalRows);

		this._prepareDataUrl();
	};

	DataProviderBase.MAX_ROWS = 1048575; // Spreadsheet limit minus 1 for the header row: 1,048,575
	DataProviderBase.HTTP_ERROR_MSG = 'HTTP connection error';
	DataProviderBase.HTTP_WRONG_RESPONSE_MSG = 'Unexpected server response:\n';

	/**
	 * Creates a pseudo random GUID. This algorithm is not suitable for
	 * cryptographic purposes and should not be used therefore.
	 *
	 * @returns {string} - Generated GUID
	 *
	 * @static
	 * @private
	 */
	DataProviderBase._createGuid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, // Bitwise OR is equivalent to Math.floor() but faster
				v = c === 'x' ? r : ((r & 0x3) | 0x8); // In case of c != 'x', the value is always between 0x8 and 0xB

			return v.toString(16);
		});
	};

	/**
	 * The function returns array of columns that need special conversion for values.
	 * E.g. handling data from association/navigationProperty
	 *
	 * @param {Array} aColumns - Configuration object
	 * @returns {Array} - Collection of columns that need special conversion for their values
	 *
	 * @static
	 * @private
	 */
	DataProviderBase.getColumnsToConvert = function(aColumns) {
		return aColumns.reduce(function(result, col) {
			var properties;

			// Handle aggregated properties and single properties
			properties = col.property instanceof Array ? col.property : [col.property];
			// Handle unitProperty which too could be from an association
			if (col.unitProperty) {
				properties.push(col.unitProperty);
			}

			properties.forEach(function(property) {

				// Convert navigation property and date fields
				var aKeys = property.split('/');

				if (aKeys.length > 1) {
					result.push({
						property: property,
						keys: aKeys
					});
				}
			});

			return result;
		}, []);
	};

	/**
	 * The function returns a conversion function for raw data.
	 *
	 * @param {object} mSettings Export settings that are used to create the the converter function
	 * @returns {function} Conversion function
	 *
	 * @static
	 * @since 1.77
	 * @public
	 */
	DataProviderBase.getDataConverter = function(mSettings) {
		var aColumns, aColumnsToConvert;

		aColumns = mSettings.workbook.columns;

		/* Add hierarachyLevel as virtual column for NavigationProperty conversion */
		if (mSettings.workbook.hierarchyLevel) {
			aColumns = aColumns.concat([{
				property: mSettings.workbook.hierarchyLevel
			}]);
		}

		aColumnsToConvert = this.getColumnsToConvert(aColumns);

		return function(aRows) {
			return DataProviderBase._convertData(aRows, aColumnsToConvert);
		};
	};

	/**
	 * Function to process the JSON result array from a ODataService.
	 *
	 * @param {Array} aRows - Data array that contains the received data
	 * @param {Array} aCols - Columns that need to be converted
	 * @returns {Array} - An array of rows
	 *
	 * @static
	 * @private
	 */
	DataProviderBase._convertData = function(aRows, aCols) {
		aCols.forEach(function(col) {
			aRows.forEach(function(row) {
				row[col.property] = DataProviderBase._getValue(row, col);
			});
		});

		return aRows;
	};

	/**
	 * Gets converted property value from raw data.
	 * Navigation properties are parsed.
	 *
	 * @param {object} oRow - Raw data row
	 * @param {object} oCol - Column information
	 * @param {Array} oCol.keys - Property name or key path for navigation properties
	 * @returns {number|string|boolean} - The converted property value
	 *
	 * @static
	 * @private
	 */
	DataProviderBase._getValue = function(oRow, oCol) {

		// Get property value
		var value = oCol.keys.reduce(function(obj, key) {
			return obj && obj[key];
		}, oRow);

		return value;
	};

	/**
	 * The function requests several chunks of data until the maximum
	 * amount of data is fetched.
	 *
	 * @param {function} fnProcessCallback - Callback function that is triggered when data is received
	 * @returns {object} - Object reference that allows to cancel the current processing
	 *
	 * @since 1.77
	 * @public
	 */
	DataProviderBase.prototype.requestData = function(fnProcessCallback) {
		var mDataSource = this.mSettings.dataSource;

		this.fnConvertData = DataProviderBase.getDataConverter(this.mSettings);
		this.fnProcessCallback = fnProcessCallback;

		// Execution
		this.mRequest = {
			serviceUrl: this._cleanUrl(mDataSource.serviceUrl),
			dataUrl: this._getUrl(0, this.iBatchSize),
			method: mDataSource.useBatch ? 'BATCH' : 'GET',
			headers: mDataSource.headers
		};

		this.sendRequest(this.mRequest)
			.then(this.fnOnDataReceived.bind(this))
			.catch(this.fnOnError.bind(this));

		return {
			cancel: function() {
				this.bCanceled = true;

				if (this.oPendingXHR instanceof XMLHttpRequest) {
					this.oPendingXHR.abort();
				}
			}.bind(this)
		};
	};

	/**
	 * Inner function that processes the received data. Processing
	 * the data before executing the callback function allows to
	 * apply transformations to the data.
	 *
	 * @param {object} oResult - The result object that is provided by the Promise resolve.
	 *
	 * @private
	 */
	DataProviderBase.prototype.fnOnDataReceived = function(oResult) {
		var aData, sNextUrl, iFetchedRows, iRemainingRows;
		var mCallbackParams = {};

		this.oPendingXHR = null;

		if (this.bCanceled) {
			return; // Canceled by the application
		}

		/* Check for OData V4 result, if not present check for OData V2 result or apply default */
		aData = (oResult && oResult.value || (oResult.d && (oResult.d.results || oResult.d))) || oResult;
		aData = (Array.isArray(aData)) ? aData : [];
		iFetchedRows = aData.length;

		this.iAvailableRows += iFetchedRows;
		iRemainingRows = this.iTotalRows - this.iAvailableRows;

		mCallbackParams.finished = iFetchedRows === 0 || iRemainingRows <= 0; // Done criteria
		mCallbackParams.progress = this.iTotalRows;
		mCallbackParams.total = this.iTotalRows;
		mCallbackParams.fetched = this.iAvailableRows;

		// Check if next url is provided
		sNextUrl = (oResult && oResult['@odata.nextLink'] || (oResult.d && oResult.d.__next)) || null;

		if (!mCallbackParams.finished) {
			// Trigger next page request before processing received data. Fetch only configured/max limit rows
			this.mRequest.dataUrl = this._getUrl(this.iAvailableRows, Math.min(this.iBatchSize, iRemainingRows), sNextUrl);
			this.sendRequest(this.mRequest)
				.then(this.fnOnDataReceived.bind(this))
				.catch(this.fnOnError.bind(this));
		}

		mCallbackParams.rows = this.fnConvertData(aData); // Normalize data
		this.fnProcessCallback(mCallbackParams); // Return result
	};

	/**
	 * Inner function that processes request handler exceptions.
	 *
	 * @param {string} sMessage - Error message.
	 *
	 * @private
	 */
	DataProviderBase.prototype.fnOnError = function(sMessage) {
		this.fnProcessCallback({
			error: sMessage
		});
	};

	/**
	 * Nested function to remove not used information from the URL
	 *
	 * @param {string} sUrl - A URL that may contain a path, hash and request parameters
	 * @returns {string} - A clean URL
	 *
	 * @private
	 */
	DataProviderBase.prototype._cleanUrl = function(sUrl) {
		var oURL;

		if (!sUrl) {
			return '';
		}

		oURL = new URL(sUrl);

		oURL.hash = oURL.search = '';
		oURL.pathname += oURL.pathname.endsWith('/') ? '' : '/';

		return oURL.toString();
	};

	/**
	 * The function processes the dataURL and adds any missing $skip or $top before initial use.
	 *
	 * @private
	 */
	DataProviderBase.prototype._prepareDataUrl = function() {
		var mDataSource = this.mSettings.dataSource;
		var mDataUrl, reSkip = /\$skip\=[0-9]+/, reTop = /\$top\=[0-9]+/;

		if (!mDataSource.dataUrl) {
			throw 'Unable to load data - no URL provided.';
		}

		mDataUrl = new URL(mDataSource.dataUrl);
		mDataUrl.search = mDataUrl.search || '';

		// Add missing $skip if needed
		if (!reSkip.test(mDataUrl.search)) {
			// Apply $skip with some numeric dummy value that matches the regexp in DataProviderBase#_getUrl
			mDataUrl.search += (mDataUrl.search.length ? '&$skip=' : '$skip=') + 0;
		}
		// Add missing $top if needed
		if (!reTop.test(mDataUrl.search)) {
			// Apply $top with some numeric dummy value that matches the regexp in DataProviderBase#_getUrl
			mDataUrl.search += '&$top=' + 0;
		}

		this.mSettings.dataSource.dataUrl = mDataUrl.toString();
	};

	/**
	 * Creates the download URL for the next query.
	 *
	 * @param {number} iSkip - The amount of items that are already present and will be skipped
	 * @param {number} iTop - The amount of items that should be requested with this query
	 * @param {string} [sNextUrl] - A reference to the next bulk of data that was returned by the previous request
	 * @returns {string} - The URL for the next query
	 *
	 * @private
	 */
	DataProviderBase.prototype._getUrl = function(iSkip, iTop, sNextUrl) {
		var oDataUrl, oNextUrl;

		oDataUrl = new URL(this.mSettings.dataSource.dataUrl);

		/*
		 * Use $skiptoken from response to query the next items.
		 * OData V4 returns a relative path, while OData V2 returns
		 * an absolute path. Therefore we need to use the original
		 * URL to keep possible proxy settings and avoid any issues
		 * between OData V4 and V2
		 */
		if (sNextUrl) {
			// sNextUrl can be relative, therefore we need to apply a base even though it is not used
			oNextUrl = new URL(sNextUrl, oDataUrl.origin);
			oDataUrl.search = oNextUrl.search;
		} else { // Use $skip and $top
			oDataUrl.search = (oDataUrl.search || '')
				.replace(/\$skip\=[0-9]+/g, '$skip=' + iSkip)
				.replace(/\$top\=[0-9]+/g, '$top=' + iTop);
		}

		return oDataUrl.toString();
	};

	/**
	 * This method creates an XMLHttpRequest from the provided
	 * configuration and requests the data from the backend. The
	 * configuration is configured to use OData services.
	 *
	 * @param {object} oRequest - Request configuration object
	 * @param {string} oRequest.method - References the HTTP method that is used (default: GET)
	 * @param {string} oRequest.dataUrl - References the resource URL that gets invoked
	 * @param {string} oRequest.serviceUrl - References the service URL that gets invoked
	 * @return {Promise} Returns a Promise that will be resolve once the requested data was fetched
	 *
	 * @private
	 */
	DataProviderBase.prototype.sendRequest = function(oRequest) {
		var fnSendRequest;

		if (typeof oRequest !== 'object' || oRequest === null || typeof oRequest.dataUrl !== 'string') {
			throw new Error('Unable to send request - Mandatory parameters missing.');
		}

		fnSendRequest = (oRequest.method === 'BATCH' && oRequest.serviceUrl ? this.sendBatchRequest : this.sendGetRequest).bind(this);

		return fnSendRequest(oRequest);
	};

	/**
	 * Creates a $batch request and sends it to the backend service.
	 *
	 * @param {object} oRequest - Request object that contains all necessary information to create the batch request
	 * @returns {Promise} - A Promise that resolves in a JSON object containing the fetched data
	 *
	 * @private
	 */
	DataProviderBase.prototype.sendBatchRequest = function(oRequest) {
		return new Promise(function(fnResolve, fnReject) {
			var xhr = new XMLHttpRequest();
			var boundary = 'batch_' + DataProviderBase._createGuid();
			var getUrl = oRequest.dataUrl.split(oRequest.serviceUrl)[1];
			var body = [];
			var sKey, sValue;

			xhr.onload = function() {
				var responseText, aLines, iEnd, iLength, iStart, sHttpStatus, aMatch;

				aLines = this.responseText.split('\r\n');

				// TBD: check return codes
				iStart = 0;
				iLength = aLines.length;
				iEnd = iLength - 1;

				aLines.forEach(function(sLine) {
					aMatch = sLine.match(/^HTTP\/1\.[0|1] ([1-9][0-9]{2})/);

					if (Array.isArray(aMatch) && aMatch[1]) {
						sHttpStatus = aMatch[1];
					}
				});

				while (iStart < iLength && aLines[iStart].slice(0, 1) !== '{') {
					iStart++;
				}

				while (iEnd > 0 && aLines[iEnd].slice(-1) !== '}') {
					iEnd--;
				}
				aLines = aLines.slice(iStart, iEnd + 1);
				responseText = aLines.join('\r\n');

				if (sHttpStatus && parseInt(sHttpStatus) >= 400) {
					// Provide a fallback in case the responseText is empty
					fnReject(DataProviderBase.HTTP_WRONG_RESPONSE_MSG + responseText);

					return;
				}

				try {
					fnResolve(JSON.parse(responseText));
				} catch (e) {
					fnReject(DataProviderBase.HTTP_WRONG_RESPONSE_MSG + responseText);
				}
			};

			/* Handle technical request errors like timeout, disconnect, etc. */
			xhr.onerror = function() {
				fnReject(this.responseText || DataProviderBase.HTTP_ERROR_MSG);
			};

			// Create request
			xhr.open('POST', oRequest.serviceUrl + '$batch', true);

			xhr.setRequestHeader('Accept', 'multipart/mixed');
			xhr.setRequestHeader('Content-Type', 'multipart/mixed;boundary=' + boundary);

			body.push('--' + boundary);
			body.push('Content-Type: application/http');
			body.push('Content-Transfer-Encoding: binary');
			body.push('');
			body.push('GET ' + getUrl + ' HTTP/1.1');

			/* Set header information on the request as well as on the batch request */
			body.push('Accept:application/json');

			for (sKey in oRequest.headers) {
				sValue = oRequest.headers[sKey];

				if (sKey.toLowerCase() != 'accept') {
					xhr.setRequestHeader(sKey, sValue);
					body.push(sKey + ':' + sValue);
				}
			}

			body.push('');
			body.push('');
			body.push('--' + boundary + '--');
			body.push('');
			body = body.join('\r\n');
			xhr.send(body);

			this.oPendingXHR = xhr;
		}.bind(this));
	};

	/**
	 * Creates and sends a GET request to the backend service.
	 *
	 * @param {object} oRequest - Request object that contains all necessary information to create the batch request
	 * @returns {Promise} - A Promise that resolves in a JSON object containing the fetched data
	 *
	 * @private
	 */
	DataProviderBase.prototype.sendGetRequest = function(oRequest) {
		return new Promise(function(fnResolve, fnReject) {
			var sHeaderKey;
			var xhr = new XMLHttpRequest();

			xhr.onload = function() {
				if (this.status >= 400) {
					// Provide a fallback in case the responseText is empty
					fnReject(this.responseText || this.statusText || DataProviderBase.HTTP_ERROR_MSG);

					return;
				}
				try {
					fnResolve(JSON.parse(this.responseText));
				} catch (e) {
					fnReject(DataProviderBase.HTTP_WRONG_RESPONSE_MSG + this.responseText);
				}
			};

			/* Handle technical request errors like timeout, disconnect, etc. */
			xhr.onerror = function() {
				fnReject(this.responseText || DataProviderBase.HTTP_ERROR_MSG);
			};

			xhr.open('GET', oRequest.dataUrl, true);
			xhr.setRequestHeader('accept', 'application/json');

			/* Set custom header information on the request */
			for (sHeaderKey in oRequest.headers) {
				if (sHeaderKey.toLowerCase() !== 'accept') {
					xhr.setRequestHeader(sHeaderKey, oRequest.headers[sHeaderKey]);
				}
			}

			xhr.send();
			this.oPendingXHR = xhr;
		}.bind(this));
	};

	return DataProviderBase;
});
