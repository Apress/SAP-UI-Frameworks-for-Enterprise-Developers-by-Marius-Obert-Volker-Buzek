/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
		'sap/ui/core/Core',
		'./ExportDialog',
		'sap/ui/export/ExportBase',
		'sap/ui/Device',
		'sap/ui/export/SpreadsheetExport',
		'sap/base/Log',
		'sap/ui/export/ExportUtils',
		'sap/ui/export/library'
	],
	function(Core, ExportDialog, ExportBase, Device, SpreadsheetExport, Log, ExportUtils, Library) {
		'use strict';

		// eslint-disable-next-line
		/* global Blob */

		var CLASS_NAME = 'sap.ui.export.Spreadsheet';

		/**
		 * Creates a new spreadsheet export object. Use this object to build and download a spreadsheet file in Office Open XML Spreadsheet format from tabular data.
		 * This functionality is normally used together with UI5 tables.
		 *
		 *
		 * <h3>Overview</h3>
		 * The class builds a spreadsheet in an Office Open XML Spreadsheet format using tabular data from a specified data source.
		 * Data is retrieved and the document is built asynchronously in a worker thread of the browser.
		 * The status of the process is visually presented to the user in a progress dialog that can be suppressed.
		 * The user can cancel the process with the Cancel button of the dialog.
		 *
		 *
		 * This class provides a low level API for spreadsheet export. The {@link sap.ui.comp.smarttable.SmartTable} control implements it internally and provides the export
		 * functionality out of the box. For special cases, please refer to details below.
		 *
		 *
		 * Optional features:
		 * <ul>
		 *   <li>Suppress the progress dialog.</li>
		 *   <li>Suppress worker and run the document generation process in a main thread.</li>
		 *   <li>Configure the exported file name.</li>
		 * </ul>
		 *
		 *
		 * <h3>Export settings object</h3>
		 * Export settings should be provided in the constructor as an <code>mSettings</code> property map with the following fields:
		 * <ul>
		 *   <li><code>workbook</code> - Spreadsheet properties object
		 *   <ul>
		 *       <li><code>workbook.columns</code> - Array of column configurations. Each column configuration is an object with the following fields:
		 *       <ul>
		 *         <li><code>label</code> (string) - Column header text</li>
		 *         <li><code>property</code> (string) - Field name or Array of field names in the data source feed</li>
		 *         <li><code>type</code> (string) - Optional data type of the field. See {@link sap.ui.export.EdmType} for the list of supported types.
		 *             If this property is omitted, the property is processed as a string field.</li>
		 *         <li><code>width</code> (number) - Optional width of the column in characters. There is no 1:1 correspondence between
		 *           character widths in the exported spreadsheet and CSS units.The width of one character
		 *           is approximately 0.5em in CSS units, depending on the fonts that are
		 *           used in the table and in the resulting spreadsheet. The default value is 10 characters.</li>
		 *         <li><code>textAlign</code> (string) - Horizontal alignment of cell contents. The following values of the CSS <code>text-align</code>
		 *           property are accepted: <code>[left, right, center, begin, end]</code>. If not specified, the columns are
		 *           horizontally aligned based on the property type.</li>
		 *         <li><code>scale</code> (number) - Number of digits after decimal point for numeric values</li>
		 *         <li><code>delimiter</code> (boolean) - Set to <code>true</code> to display thousands separators in numeric values.
		 *           The default value is <code>false</code>.</li>
		 *         <li><code>unit</code> (string) - Text to display as the unit of measurement or currency next to the numeric value.
		 *           It is treated as a string and has no influence on the value itself. For example, a value of 150 with the unit "%" is still 150
		 *           and not 1.5, as a user may expect.</li>
		 *         <li><code>unitProperty</code> (string) - Name of the data source field that contains the unit/currency text</li>
		 *         <li><code>displayUnit</code> (boolean) - The property applies to currency values only and defines if the currency is shown in the column.
		 *           The default value is <code>true</code>.</li>
		 *         <li><code>trueValue</code> (string) - Textual representation of a boolean type that has the value <code>true</code></li>
		 *         <li><code>falseValue</code> (string) - Textual representation of a boolean type that has the value <code>false</code></li>
		 *         <li><code>template</code> (string) - Formatting template that supports indexed placeholders within curly brackets</li>
		 *         <li><code>inputFormat</code> (string) - Formatting template for string formatted dates</li>
		 *         <li><code>utc</code> (boolean) - Defines whether the <code>DateTime</code> is displayed as UTC or local time</li>
		 *         <li><code>valueMap</code> (string) - Mapping object or Map containing the values that should be mapped to a particular key</li>
		 *         <li><code>wrap</code> (boolean) - Indicates if wrapping is enabled for this particular column</li>
		 *      </ul>
		 *      </li>
		 *      <li><code>workbook.context</code> - Context object that will be applied to the generated file. It may contain the following fields:</li>
		 *      <ul>
		 *          <li><code>application</code> (string) - The application that creates the XLSX document (default: "SAP UI5")</li>
		 *          <li><code>version</code> (string) - Application version that creates the XLSX document (default: "1.113.0")</li>
		 *          <li><code>title</code> (string) - Title of the XLSX document (NOT the filename)</li>
		 *          <li><code>modifiedBy</code> (string) - User context for the XLSX document</li>
		 *          <li><code>sheetName</code> (string) - The label of the data sheet</li>
		 *          <li><code>metaSheetName</code> (string) - The label of the metadata sheet. The sheet will not be shown unless metadata entries are provided</li>
		 *          <li><code>metainfo</code> (Array) - An Array of metadata groups. Each group has a name property and an items Array which contains key/value pairs</li>
		 *      </ul>
		 *      <li><code>workbook.hierarchyLevel</code> - Name of the property that contains the hierarchy level information of each line item</li>
		 *   </ul>
		 *   <li><code>dataSource</code> - Source of spreadsheet data. It can be a JSON array with row data,
		 *      an URL or an OData properties object with the following fields:
		 *      <ul>
		 *         <li><code>type</code> (string) - Type of the data source. Currently, only OData is supported and the value have to be set to <code>"odata"</code>.</li>
		 *         <li><code>dataUrl</code> (string) - URL to table data on the server, including all select, filter, and search query parameters</li>
		 *         <li><code>serviceUrl</code> (string) - URL to the OData service. The parameter is required for OData batch requests.</li>
		 *         <li><code>count</code> (number) - Count of available records on the server</li>
		 *         <li><code>useBatch</code> (boolean) - Set to <code>true</code> if OData batch requests are used to fetch the spreadsheet data.
		 *            In this case, <code>serviceUrl</code> and <code>headers</code> have to be specified, too.</li>
		 *         <li><code>headers</code> (object) - Map of HTTP request header properties. They should correspond to the HTTP request headers that are
		 *            used to obtain table data for display in the browser.</li>
		 *         <li><code>sizeLimit</code> (number) - Maximal allowed number of records that can be obtained from the service in a single request</li>
		 *      </ul>
		 *   </li>
		 *   <li><code>count</code> (number) - The maximal number of records to export. If not specified, all data from the data source is fetched.</li>
		 *   <li><code>worker</code> (boolean) - Run export process in a worker thread. Set to <code>false</code> to disable worker and run export
		 *        in a main thread. This is needed, for example, if a mock server is used to provide spreadsheet data.<br>
		 *        <b>Note:</b> In case of a strict content security policy, it is not always possible to create an export worker.
		 *        In this case, export runs in a main thread disregarding the <code>worker</code> value.</li>
		 *   <li><code>fileName</code> (string) - Optional file name for the exported file. If not specified, the spreadsheet is exported as <code>export.xlsx</code>.</li>
		 *   <li><code>showProgress</code> (boolean) - Set to <code>false</code> to suppress the progress dialog</li>
		 * </ul>
		 *
		 *
		 * <h3>Usage</h3>
		 * To start export, create a new <code>sap.ui.export.Spreadsheet</code> object and call the <code>build</code> method.
		 * Column configuration, data source, and export settings must be provided in the constructor.
		 * The <code>build</code> method opens a progress dialog and starts an asynchronous export process.
		 * The export process fetches data rows from the data source, builds a spreadsheet in-browser in a worker thread, and finally downloads the document
		 * to the client.
		 *
		 *
		 * Example:
		 * <pre>
		 *   var oSpreadsheet = new sap.ui.export.Spreadsheet(mSettings);
		 *   oSpreadsheet.build();
		 * </pre>
		 *
		 *
		 * Optionally, you can attach <code>onprogress</code> event listeners to be notified about the
		 * export progress and follow the completion status of the returned <code>Promise</code>.
		 *
		 *
		 * Example:
		 * <pre>
		 *   var oSpreadsheet = new sap.ui.export.Spreadsheet(mSettings);
		 *   oSpreadsheet.onprogress = function(iValue) {
		 *   	{@link sap.base.Log#debug Log.debug}("Export: %" + iValue + " completed");
		 *   };
		 *   oSpreadsheet.build()
		 *     .then( function() { {@link sap.base.Log#debug Log.debug}("Export is finished"); })
		 *     .catch( function(sMessage) { {@link sap.base.Log#error Log.error}("Export error: " + sMessage); });
		 * </pre>
		 *
		 *
		 * Example of column configuration:
		 * <pre>
		 *   var aColumns = [];
		 *   aColumns.push({
		 *   	label: "Name",
		 *   	property: "name"
		 *   });
		 *   aColumns.push({
		 *     label: "Salary",
		 *     property: "salary",
		 *     type: "number",
		 *     scale: 2
		 *   });
		 *
		 *   var mSettings = {
		 *     workbook: {
		 *       columns: aColumns,
		 *       context: {
		 *         application: 'Debug Test Application',
		 *         version: '1.113.0',
		 *         title: 'Some random title',
		 *         modifiedBy: 'John Doe',
		 *         metaSheetName: 'Custom metadata',
		 *         metainfo: [
		 *           {
		 *             name: 'Grouped Properties',
		 *             items: [
		 *               { key: 'administrator', value: 'Foo Bar' },
		 *               { key: 'user', value: 'John Doe' },
		 *               { key: 'server', value: 'server.domain.local' }
		 *             ]
		 *           },
		 *           {
		 *             name: 'Another Group',
		 *             items: [
		 *               { key: 'property', value: 'value' },
		 *               { key: 'some', value: 'text' },
		 *               { key: 'fu', value: 'bar' }
		 *             ]
		 *           }
		 *         ]
		 *       },
		 *       hierarchyLevel: 'level'
		 *     },
		 *     dataSource: mDataSource,
		 *     fileName: "salary.xlsx"
		 *   };
		 *   var oSpreadsheet = new sap.ui.export.Spreadsheet(mSettings);
		 *   oSpreadsheet.build();
		 * </pre>

		 *
		 * <h3>Restrictions</h3>
		 * For a complete list of restrictions, see:
		 * {@link topic:2c641481649f44de9c1c22c9c3c49d13 Spreadsheet Export Restrictions}
		 *
		 *
		 * You can export only the primitive cell data types that are listed in {@link sap.ui.export.EdmType}.
		 * Icons, images, check boxes, and complex controls in UI5 table cells are not supported.
		 *
		 *
		 * Custom formatters in data binding are not supported.
		 *
		 *
		 * The size of an exported table is limited by available browser
		 * memory. Export of large data sets can lead to memory overflow
		 * errors. Therefore, do not use <code>sap.ui.export.Spreadsheet</code>
		 * with data tables containing more than 2,000,000 table cells
		 * on desktop computers and more than 100,000 cells on mobile
		 * devices. Consider a specialized export solution in such cases.
		 * For example, MS Excel® can import spreadsheets from an OData
		 * services directly, without any UI.
		 *
		 *
		 * The export process runs in a worker thread whenever possible.
		 * However, code injection to native XMLHttpRequest events is not
		 * available in the worker environment. Therefore, the
		 * <code>worker</code> parameter in export settings should be set
		 * to <code>false</code> if the application uses a mock server to
		 * fetch table data.
		 *
		 *
		 * For exporting hierarchy level information, the maximum
		 * hierarchy depth is 8. This restriction results from the Office
		 * Open XML standard and the programs that can open such files.
		 * The sap.ui.export.Spreadsheet allows you to export more
		 * hierarchy levels although they might not be displayed
		 * correctly when opening the generated file if the hierarchy
		 * depth exceeds the value of 8.
		 *
		 * The column configuration must contain at least one column to
		 * execute the export process. If there is no column configured,
		 * the export will be canceled.
		 *
		 * If the export is used within a table, any row that is showing
		 * aggregated data (i.E. sum row) will not be exported.
		 *
		 * The properties sheetName and metaSheetName on the workbook.context
		 * object are limited to 31 characters each. If their value exceeds
		 * this maximum length, the value will be truncated.
		 *
		 * @param {object} mSettings - Export settings
		 * @param {object} mSettings.workbook - Spreadsheet properties
		 * @param {Array} mSettings.workbook.columns - Column configuration
		 * @param {object} [mSettings.workbook.context] - Export context that will be applied to the exported file
		 * @param {string} [mSettings.workbook.context.application] - Application that created this XLSX
		 * @param {string} [mSettings.workbook.context.version] - Application version that was used to create this XLSX
		 * @param {string} [mSettings.workbook.context.title] - Title of the XLSX document (NOT the file name)
		 * @param {string} [mSettings.workbook.context.modifiedBy] - User context for the exported document
		 * @param {string} [mSettings.workbook.context.sheetName] - The name of the data sheet that will be shown in Excel
		 * @param {string} [mSettings.workbook.context.metaSheetName] - The name of the metadata sheet that will be shown in Excel
		 * @param {Array} [mSettings.workbook.context.metainfo] - Optional Metadata that will be displayed in the additional Metadata Sheet
		 * @param {string} [mSettings.workbook.hierarchyLevel] - Optional name of the property that contains hierarchy level information
		 * @param {string | Object | Array | sap.ui.model.ListBinding | sap.ui.model.TreeBinding} mSettings.dataSource - Source of spreadsheet data.
		 * 	      A JSON array, data source properties map, <code>sap.ui.model.ListBinding</code>, <code>sap.ui.model.TreeBinding</code> or
		 *        URL to an OData source can be provided. For example, <code>"someUrl"</code> is an equivalent to
		 *        <code>{dataUrl:"someUrl", type:"OData"}</code>. An instance of <code>sap.ui.model.ListBinding</code> or
		 *        <code>sap.ui.model.TreeBinding</code> either has to implement a <code>#getDownloadUrl</code> function or needs to be a ClientListBinding.
		 *        <b>Note:</b> <code>sap.ui.model.ClientTreeBinding</code> is not supported.
		 * @param {int} mSettings.dataSource.sizeLimit - Maximal allowed number of records that can be obtained from the service in a single request
		 * @param {int} [mSettings.count] - The maximal number of records to export
		 * @param {boolean} [mSettings.worker=true] - Run export process in a worker thread. Set to <code>false</code> to disable worker and run export
		 *        in a main thread. This is needed, for example, if a mock server is used to provide spreadsheet data.<br>
		 *        <b>Note:</b> In case of a strict content security policy, it is not always possible to create an export worker.
		 *        In this case, export runs in a main thread disregarding the <code>worker</code> value.
		 * @param {string} [mSettings.fileName="export.xlsx"] - Optional file name for the exported file
		 * @param {boolean} [mSettings.showProgress=true] - Set to <code>false</code> to suppress the progress dialog
		 *
		 * @class The <code>sap.ui.export.Spreadsheet</code> class allows you to export table data from a UI5 application to a spreadsheet file.
		 *
		 * @author SAP SE
		 * @version 1.113.0
		 *
		 * @since 1.50
		 * @alias sap.ui.export.Spreadsheet
		 * @extends sap.ui.export.ExportBase
		 * @see {@link topic:2691788a08fc43f7bf269ea7c6336caf Spreadsheet}
		 * @public
		 */
		var Spreadsheet = ExportBase.extend(CLASS_NAME, {

			constructor: function(mSettings) {
				ExportBase.call(this, mSettings);

				/* Spreadsheet default settings */
				this._mSettings.customizing = {};
				this._mSettings.showProgress = true;
				this._mSettings.worker = true;

				/* Only apply supported properties */
				// IMPORTANT: keep count before dataSource to ensure that the expected count can be used for dataSource string
				['showProgress', 'worker'].forEach(function(sProperty) {
					if (typeof mSettings[sProperty] !== 'undefined') {
						this._mSettings[sProperty] = mSettings[sProperty];
					}
				}.bind(this));

				this.codeListsPromise = this.codeListsPromise instanceof Promise ? this.codeListsPromise : Promise.resolve();
			}
		});

		function addUnit(sCurrencyCode, oCurrency, mCurrencies) {
			if (!(mCurrencies[sCurrencyCode] instanceof Object)) {
				mCurrencies[sCurrencyCode] = {};
			}

			if (!isNaN(oCurrency.digits)) {
				mCurrencies[sCurrencyCode].scale = oCurrency.digits;
			}

			if (!isNaN(oCurrency.UnitSpecificScale)) {
				mCurrencies[sCurrencyCode].scale = oCurrency.UnitSpecificScale;
			}

			if (isNaN(mCurrencies[sCurrencyCode].scale)) {
				delete mCurrencies[sCurrencyCode];
			}
		}

		/**
		 * Sets the default document title and sheet name to the export parameters object.
		 *
		 * @param {object} mParameters - Export parameters object
		 * @returns {Promise} Promise object
		 *
		 * @private
		 */
		Spreadsheet.prototype.setDefaultExportSettings = function(mParameters) {
			var sCurrencyCode, mCurrencySettings, mUnitSettings;

			/* Initialize currency customizing for custom currencies and currency code list */
			mCurrencySettings = mParameters.customizing.currency = {};

			/* Attach custom currency configuration */
			var oCustomCurrencies = Core.getConfiguration().getFormatSettings().getCustomCurrencies();

			if (oCustomCurrencies) {
				for (sCurrencyCode in oCustomCurrencies) {
					addUnit(sCurrencyCode, oCustomCurrencies[sCurrencyCode], mCurrencySettings);
				}
			}

			return this.codeListsPromise.then(function(aCodeLists) {
				var mCurrencyCodes, mUnitsOfMeasure, sUnitCode;

				if (!Array.isArray(aCodeLists)) {
					return;
				}

				mUnitSettings = mParameters.customizing.unit = {};
				mCurrencyCodes = aCodeLists[0];
				mUnitsOfMeasure = aCodeLists[1];

				for (sUnitCode in mCurrencyCodes) {
					addUnit(sUnitCode, mCurrencyCodes[sUnitCode], mCurrencySettings);
				}

				for (sUnitCode in mUnitsOfMeasure) {
					addUnit(sUnitCode, mUnitsOfMeasure[sUnitCode], mUnitSettings);
				}
			}).then(function() {

				/* Async call to resource bundle */
				return Core.getLibraryResourceBundle('sap.ui.export', true);
			}).then(function(oResourceBundle) {
				var oWorkbookContext = mParameters.workbook.context;

				/**
				 * Check if a document title and a sheet name have been defined in the 'context' settings.
				 * Otherwise use default resource bundle properties
				 */
				if (!(oWorkbookContext instanceof Object)) {
					oWorkbookContext = mParameters.workbook.context = {};
				}
				if (!oWorkbookContext.title) {
					oWorkbookContext.title = oResourceBundle.getText('XLSX_DEFAULT_TITLE');
				}
				if (!oWorkbookContext.sheetName) {
					oWorkbookContext.sheetName = oResourceBundle.getText('XLSX_DEFAULT_SHEETNAME');
				}
			});
		};

		/**
		 * Requests the unit and currency specific code lists from
		 * the ODataMetaModel and attaches it to the export settings.
		 *
		 * @param {sap.ui.model.odata.ODataMetaModel} oMetaModel - ODataMetaModel instance that is used to request service specific code lists.
		 * @param {object} mSettings - Export settings that will receive the code lists
		 * @returns {Promise} The returned Promise will always resolve with an Array
		 *
		 * @private
		 */
		Spreadsheet.requestCodeLists = function(oMetaModel) {
			if (!oMetaModel.isA(['sap.ui.model.odata.ODataMetaModel', 'sap.ui.model.odata.v4.ODataMetaModel'])) {
				return Promise.resolve([null, null]);
			}

			return Promise.all([
				oMetaModel.requestCurrencyCodes(),
				oMetaModel.requestUnitsOfMeasure()
			]).catch(function(oError) {
				Log.warning(CLASS_NAME + ': Code lists cannot be processed due to the following error - ' + oError);
				return Promise.resolve([null, null]);
			});
		};

		/**
		 * The <code>beforeSave</code> event is fired just before the generated file is saved to the file system.
		 * This event allows you to prevent the default action that closes the <code>ExportDialog</code> and
		 * saves the file to your local device. If the default is prevented, the event handler is responsible
		 * for closing and destroying the <code>Dialog</code>.
		 *

		 * @param {sap.ui.base.Event} oEvent
		 * @param {sap.ui.base.EventProvider} oEvent.getSource
		 * @param {object} oEvent.getParameters
		 * @param {ArrayBuffer} oEvent.getParameter.data The data parameter contains the generated file
		 * @param {sap.ui.export.ExportDialog} oEvent.getParameter.exportDialog The export dialog instance
		 *
		 * @name sap.ui.export.Spreadsheet#beforeSave
		 * @event
		 * @since 1.61
		 * @public
		 */

		/**
		 * Attaches event handler <code>fnFunction</code> to the {@link sap.ui.export.Spreadsheet#event:beforeSave}
		 * event of this <code>sap.ui.export.Spreadsheet</code>.</br>
		 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified,
		 * otherwise it will be bound to this <code>sap.ui.export.Spreadsheet</code> itself.</br>
		 * This event is fired just before the generated file is saved to the file system.
		 *
		 * @param {object} [oData] An application-specific payload object that will be passed to the event handler along with the event object when firing the event
		 * @param {function} fnHandler The function to be called when the event occurs
		 * @param {object} [oListener] Context object to call the event handler with. Defaults to this <code>sap.ui.export.Spreadsheet</code> itself
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 *
		 * @since 1.61
		 * @public
		 */
		Spreadsheet.prototype.attachBeforeSave = function(oData, fnHandler, oListener) {
			return this.attachEvent('beforeSave', oData, fnHandler, oListener);
		};

		/**
		 * Detaches event handler <code>fnFunction</code> from the {@link sap.ui.export.Spreadsheet beforeSave}
		 * event of this <code>sap.ui.export.Spreadsheet</code>.</br>
		 * The passed function and listener object must match the ones used for event registration.
		 *
		 * @param {function} fnHandler The function to be called, when the event occurs
		 * @param {object} [oListener] Context object on which the given function had to be called
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 *
		 * @since 1.61
		 * @public
		 */
		Spreadsheet.prototype.detachBeforeSave = function(fnHandler, oListener) {
			return this.detachEvent('beforeSave', fnHandler, oListener);
		};

		/**
		 * Cancels a running export process. This method does nothing if no export is running.
		 *
		 * @returns {this} - Reference to <code>this</code> in order to allow method chaining
		 *
		 * @since 1.52
		 * @public
		 */
		Spreadsheet.prototype.cancel = function() {
			if (this.process) {
				this.process.cancel();
				this.process = null;
			}

			return this;
		};

		/**
		 * Returns the specific MIME type
		 *
		 * @returns {string} MIME type for Office Open XML Spreadsheet
		 *
		 * @since 1.112
		 * @public
		 */
		Spreadsheet.prototype.getMimeType = function() {
			return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
		};

		/**
		 * Progress callback. The function is called when the progress status changes.
		 *
		 * @param {number} iFetched - Number of items that are already fetched
		 * @param {number} iTotal - Total amount of items that will be fetched
		 *
		 * @private
		 */
		Spreadsheet.prototype.onprogress = function(iFetched, iTotal) {
			var iProgress;

			if (isNaN(iFetched) || isNaN(iTotal)) {
				return;
			}

			iProgress = Math.round(iFetched / iTotal * 100);
			Log.debug('Spreadsheet export: ' + iProgress + '% loaded.');
		};

		/**
		 * Creates a valid dataSource configuration
		 *
		 * @param {sap.ui.model.ListBinding|sap.ui.model.TreeBinding} oBinding - A subclass of <code>sap.ui.model.ListBinding</code> or <code>sap.ui.model.TreeBinding</code>
		 * @returns {object} - Valid data source configuration built upon the ListBinding
		 *
		 * @private
		 */
		Spreadsheet.prototype.createDataSourceFromBinding = function(oBinding) {
			/**
			 * Use empty array as default in case of <code>ListBinding</code> is not of type
			 * ClientListBinding and does not provide a getDownloadUrl function
			 */
			var oDataSource = [];

			/**
			 * If <code>ClientListBinding</code>, we use the binding path to receive the data from the underlying model
			 */
			if (oBinding.isA('sap.ui.model.ClientListBinding')) {
				var aData = [];

				oBinding.getAllCurrentContexts().forEach(function(oContext) {
					aData.push(oContext.getObject());
				});

				oDataSource = {
					data: aData,
					type: 'array'
				};
			}

			if (oBinding.isA('sap.ui.model.ClientTreeBinding')) {
				Log.error('Unable to create dataSource configuration due to not supported Binding: ' + oBinding.getMetadata().getName());
			}

			/**
			 * All other <code>Bindings</code> need to provide a downloadUrl
			 */
			if (typeof oBinding.getDownloadUrl === 'function') {
				var oModel = oBinding.getModel(),
					sDataUrl = oBinding.getDownloadUrl('json'),
					sServiceUrl = oModel.sServiceUrl,
					bV4ODataModel = oModel.isA('sap.ui.model.odata.v4.ODataModel');

				sDataUrl = ExportUtils.interceptUrl(sDataUrl);
				sServiceUrl = ExportUtils.interceptUrl(sServiceUrl);

				oDataSource = {
					type: 'odata',
					dataUrl: sDataUrl,
					serviceUrl: sServiceUrl,
					headers: bV4ODataModel ?  oModel.getHttpHeaders(true) : oModel.getHeaders(),
					count: ExportUtils.getCountFromBinding(oBinding),
					useBatch: bV4ODataModel || oModel.bUseBatch
				};

				/* Obtain CodeLists from ODataMetaModel */
				if (oModel.getMetaModel()
					&& typeof oModel.getMetaModel().requestCurrencyCodes === 'function'
					&& typeof oModel.getMetaModel().requestUnitsOfMeasure === 'function') {

					this.codeListsPromise = Spreadsheet.requestCodeLists(oModel.getMetaModel(), this._mSettings);
				}
			}

			return oDataSource;
		};

		/**
		 * Sets the data source configuration that will be used for exporting the data. If the passed parameter is null,
		 * the call will be ignored.
		 *
		 * @param {string|Array|Object|sap.ui.model.ListBinding|sap.ui.model.TreeBinding} oDataSource Possible types are a plain
		 *        string that contains an URL of an OData service, an array of JSON objects, a data source configuration,
		 *        a <code>sap.ui.model.ListBinding</code> or <code>sap.ui.model.TreeBinding</code>
		 * @returns {object|null} - Valid dataSource object or null in case the dataSource configuration is not supported
		 *
		 * @since 1.73
		 * @public
		 */
		Spreadsheet.prototype.processDataSource = function(oDataSource) {
			var mDataSource = null;
			var sDataSourceType = typeof oDataSource;

			if (!oDataSource) {
				return null;
			}

			if (sDataSourceType == 'string') {
				return {
					count: this._mSettings.count,
					dataUrl: oDataSource,
					type: 'odata',
					useBatch: false
				};
			}

			if (sDataSourceType != 'object') {
				Log.error('Spreadsheet#processDataSource: Unable to apply data source of type ' + sDataSourceType);

				return null;
			}

			if (oDataSource instanceof Array ) {
				mDataSource = {data: oDataSource, type: 'array'};
			}

			if (oDataSource.dataUrl) {
				mDataSource = oDataSource;
			}

			if (oDataSource.isA && oDataSource.isA(['sap.ui.model.ListBinding', 'sap.ui.model.TreeBinding'])) {
				mDataSource = this.createDataSourceFromBinding(oDataSource);
			}

			return mDataSource;
		};

		/**
		 * Creates and returns a new Promise object that triggers the export process for the given {@link sap.ui.export.Spreadsheet}.
		 *
		 * @param {object} mParameters - Export parameters object
		 * @returns {Promise} Promise object
		 *
		 * @private
		 */
		Spreadsheet.prototype.createBuildPromise = function(mParameters) {
			var that = this;

			return new Promise(function(fnResolve, fnReject) {

				var progressDialog;
				var MAX_ROWS = 1048576; // Maximum allowed Rows per sheet
				var nSizeLimit = Device.system.desktop ? 2000000 : 100000; // 2.000.000 cells on desktop and 100.000 otherwise
				var nRows = mParameters.dataSource.type == 'array' ? mParameters.dataSource.data.length : mParameters.dataSource.count;
				var nColumns = mParameters.workbook.columns.length;

				function onmessage(oMessage) {

					if (oMessage.progress) {
						if (progressDialog) {
							progressDialog.updateStatus(oMessage.fetched, oMessage.total);
						}
						that.onprogress(oMessage.fetched, oMessage.total);
					}

					/*
					 * It is important to check if the process is still assigned, this allows to cancel the export
					 * even though all rows have been appended to the Spreadsheet but the file has not been saved yet
					 */
					if (oMessage.finished && that.process !== null) {
						that.process = null;

						if (!oMessage.spreadsheet) {
							fnReject();
							return;
						}

						var executeDefaultAction = that.fireEvent('beforeSave', {
							data: oMessage.spreadsheet,
							exportDialog: progressDialog
						}, true, true);

						if (executeDefaultAction) {
							/*
							* Keep the progress dialog open for 1 second to avoid
							* screen flickering in case of extremely fast exports
							*/
							if (progressDialog) {
								window.setTimeout(progressDialog.finish, 1000);
							}

							ExportUtils.saveAsFile(new Blob([oMessage.spreadsheet], {
								type: that.getMimeType()
							}), mParameters.fileName);
						}

						fnResolve();
					}

					if (typeof oMessage.error != 'undefined') {
						var sError = oMessage.error.message || oMessage.error;
						that.process = null;

						if (progressDialog) {
							progressDialog.finish();
						}

						fnReject(sError);
						ExportDialog.showErrorMessage(sError);
					}
				}

				function startExport() {
					if (!mParameters.showProgress) {
						if (that.process) {
							fnReject('Cannot start export: the process is already running');
							return;
						}

						that.process = SpreadsheetExport.execute(mParameters, onmessage);
						return;
					}

					// Show progress dialog
					ExportDialog.getProgressDialog().then(function(oDialogResolve) {
						progressDialog = oDialogResolve;

						if (that.process) {
							fnReject('Cannot start export: the process is already running');
							return;
						}

						progressDialog.oncancel = function() {
							return that.process && that.process.cancel();
						};

						progressDialog.open();

						// Set initial status
						progressDialog.updateStatus(0, mParameters.dataSource.count);

						// Start export once the dialog is present and the code lists have been loaded
						that.process = SpreadsheetExport.execute(mParameters, onmessage);
					});
				}

				// When there are no columns --> don't trigger the export
				if (nColumns <= 0) {
					// Consider showing a dialog to the end users instead of just this error!
					fnReject('No columns to export.');
				} else if (nRows * nColumns > nSizeLimit || !nRows || nRows >= MAX_ROWS) { // Amount of rows need to be less than maximum amount because of column header
					var oDialogSettings = {
						rows: nRows,
						columns: nColumns,
						sizeLimit: nRows * nColumns > nSizeLimit,
						cutOff: MAX_ROWS,
						fileType: Library.FileType.XLSX
					};

					// Show warning and execute
					ExportDialog.showWarningDialog(oDialogSettings)
						.then(startExport)
						.catch(function() {
							fnReject('Export cancelled by the user.');
						});
				} else {
					startExport();
				}

			});
		};

		return Spreadsheet;
	});
