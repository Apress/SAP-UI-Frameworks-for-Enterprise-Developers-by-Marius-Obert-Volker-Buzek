/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
	'sap/ui/core/Core',
	'sap/ui/base/EventProvider',
	'sap/base/Log',
	'sap/ui/export/ExportUtils'
], function(Core, EventProvider, Log, ExportUtils) {
	'use strict';

	/**
	 * Base class for specific SAPUI5 export implementations. This class contains abstract functions that need to be implemented.
	 *
	 * @param {object} mSettings - Export settings
	 * @param {object} mSettings.workbook - Data and formatting related export settings
	 * @param {object|sap.ui.model.ListBinding} mSettings.dataSource - Source of export data.
	 * 	      A data source properties map or <code>sap.ui.model.ListBinding</code> can be provided.
	 * 	      An instance of <code>sap.ui.model.ListBinding</code> has to implement a
	 * 	      <code>#getDownloadUrl</code> function.
	 * @param {int} [mSettings.count] - The maximal number of records to export
	 * @param {string} [mSettings.fileName] - Optional file name for the exported file
	 * @param {sap.ui.export.FileType} [mSettings.fileType] - <code>FileType</code> that is used to identify the file-ending and MIME-type of the file
	 *
	 * @class The <code>sap.ui.export.ExportBase</code> class allows you to export table data from a UI5 application to certain formats. This class is an abstract class that requires specific implementations for each file format.
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @since 1.96
	 * @alias sap.ui.export.ExportBase
	 * @extends sap.ui.base.EventProvider
	 * @public
	 */
	var ExportBase = EventProvider.extend('sap.ui.export.ExportBase', {

		constructor: function(mSettings, mCapabilities) {
			EventProvider.call(this, mSettings);

			this._mCapabilities = mCapabilities || {};

			/* Default settings */
			this._mSettings = {
				fileName: 'Export'
			};

			/* Only apply supported properties */
			// IMPORTANT: keep count before dataSource to ensure that the expected count can be used for dataSource string
			['count', 'dataSource', 'fileName', 'fileType', 'workbook'].forEach(function(sProperty) {
				if (typeof mSettings[sProperty] !== 'undefined') {
					this._mSettings[sProperty] = sProperty !== 'dataSource' ? mSettings[sProperty] : this.processDataSource(mSettings[sProperty]);
				}
			}.bind(this));

			/* Pre-process dataSource related settings */
			if (this._mSettings.workbook) {
				this._mSettings.workbook.hierarchyLevel = ExportUtils.getHierarchyLevelProperty(mSettings.dataSource);
				this._mSettings.workbook.drillState = ExportUtils.getHierarchyDrillStateProperty(mSettings.dataSource);
			}
		}
	});

	/**
	 * The <code>beforeExport</code> event is fired just before the export process is started.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {object} oEvent.getParameter.exportSettings - Contains export-related configuration
	 *
	 * @name sap.ui.export.ExportBase#beforeExport
	 * @event
	 * @since 1.96
	 * @public
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link sap.ui.export.ExportBase#event:beforeExport}
	 * event of this <code>sap.ui.export.ExportBase</code>.</br>
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified,
	 * otherwise it will be bound to this <code>sap.ui.export.ExportBase</code> itself.</br>
	 * This event is fired just before the export process is started.
	 *
	 * @param {object} [oData] An application-specific payload object that will be passed to the event handler along with the event object when firing the event
	 * @param {function} fnHandler The function to be called when the event occurs
	 * @param {object} [oListener] Context object to call the event handler with. Defaults to the <code>sap.ui.export.ExportBase</code> instance itself
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 *
	 * @since 1.96
	 * @public
	 */
	 ExportBase.prototype.attachBeforeExport = function(oData, fnHandler, oListener) {
		return this.attachEvent('beforeExport', oData, fnHandler, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link sap.ui.export.ExportBase#event:beforeExport}
	 * event of this <code>sap.ui.export.ExportBase</code>.</br>
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function} fnHandler The function to be called when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 *
	 * @since 1.96
	 * @public
	 */
	 ExportBase.prototype.detachBeforeExport = function(fnHandler, oListener) {
		return this.detachEvent('beforeExport', fnHandler, oListener);
	};

	/**
	 * Cleans up the internal structures and removes all event handlers.
	 *
	 * The object must not be used anymore after destroy was called.
	 *
	 * @see sap.ui.base.Object#destroy
	 * @public
	 */
	 ExportBase.prototype.destroy = function() {
		EventProvider.prototype.destroy.apply(this, arguments);

		this.cancel();
		this._mSettings = null;
		this._mCapabilities = null;
		this.bIsDestroyed = true;
	};

	/**
	 * Cancels the current export process.
	 *
	 * @abstract
	 * @public
	 */
	ExportBase.prototype.cancel = function() {
		throw new Error('Abstract function not implemented');
	};

	/**
	 * Sets the data source configuration that will be used for exporting the data. If the passed parameter is null,
	 * the call will be ignored.
	 *
	 * @param {object|sap.ui.model.ListBinding|sap.ui.model.TreeBinding} oDataSource Possible types are a data
	 * source configuration, a <code>sap.ui.model.ListBinding</code> or <code>sap.ui.model.TreeBinding</code>
	 * @returns {object|null} - Valid dataSource object or null in case the dataSource configuration is not supported
	 *
	 * @abstract
	 * @public
	 */
	ExportBase.prototype.processDataSource = function(oDataSource) {
		throw new Error('Abstract function not implemented');
	};

	/**
	 * Applies default settings to the export configuration.
	 *
	 * @param {object} mSettings Export settings that will be adjusted
	 *
	 * @abstract
	 * @private
	 */
	ExportBase.prototype.setDefaultExportSettings = function(mSettings) {
		throw new Error('Abstract function not implemented');
	};

	/**
	 * Creates a Promise that will be resolved after the export has been finished.
	 *
	 * @param {object} mSettings Validated export configuration
	 *
	 * @abstract
	 * @private
	 */
	ExportBase.prototype.createBuildPromise = function(mSettings) {
		throw new Error('Abstract function not implemented');
	};

	/**
	 * Returns the specific MIME type
	 *
	 * @abstract
	 * @since 1.112
	 * @public
	 */
	ExportBase.prototype.getMimeType = function() {
		throw new Error('Abstract function not implemented');
	};

	/**
	 * Triggers the export process of the specific format.
	 *
	 * @returns {Promise} Promise that gets resolved once the data has been exported
	 *
	 * @public
	 */
	 ExportBase.prototype.build = function() {
		var mParameters = this._mSettings;

		if (this.bIsDestroyed) {
			var sMessage = this.getMetadata().getName() + ': Cannot trigger build - the object has been destroyed';

			Log.error(sMessage);
			return Promise.reject(sMessage);
		}

		return this.setDefaultExportSettings(mParameters).then(function() {
			this.fireEvent('beforeExport', {exportSettings: mParameters}, false, false);

			ExportUtils.validateSettings(mParameters);

			return this.createBuildPromise(mParameters);
		}.bind(this));
	};

    return ExportBase;
});