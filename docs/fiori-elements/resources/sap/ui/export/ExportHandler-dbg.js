/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(['./library', './ExportUtils', './ExportDialog', 'sap/m/MessageToast', 'sap/ui/core/Core', 'sap/ui/base/EventProvider', 'sap/ui/model/odata/v4/ODataModel', 'sap/ui/util/openWindow'], function(library, ExportUtils, ExportDialog, MessageToast, Core, EventProvider, ODataModel, openWindow) {
	'use strict';

	var Destination = library.Destination;
	var FileType = library.FileType;

	/**
	 * Any export related functionality is encapsuled in the <code>ExportHandler</code> which also stores user settings throughout the session.
	 *
	 * @param {object} [mCapabilities] Mapping object which references certain export capabilities
	 * @class The <code>sap.ui.export.ExportHandler</code> class allows you to export table data from a UI5 application.
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @since 1.102
	 * @alias sap.ui.export.ExportHandler
	 * @extends sap.ui.base.EventProvider
	 * @private
	 * @ui5-restricted sap.ui.comp.smarttable.SmartTable, sap.ui.mdc.Table
	 */
	var ExportHandler = EventProvider.extend('sap.ui.export.ExportHandler', {
		constructor: function(mCapabilities) {
			var that = this;
			EventProvider.call(this);

			/* Apply default capabilities if nothing is provided */
			this._mCapabilities = mCapabilities instanceof Object ? mCapabilities : { XLSX: {} };

			/* Activate Google Sheet support */
			this._initialized = new Promise(function(fnResolve) {
				that.isGoogleSheetSupported().then(function(bSupported) {
					if (bSupported) {
						that._mCapabilities[FileType.GSHEET] = {};

						/* Set cloud default settings */
						that._mDialogSettings = {
							destination: Destination.REMOTE,
							fileType: FileType.GSHEET
						};
					}
				}).finally(fnResolve);
			});
		}
	});

	/**
	 * The <code>beforeExport</code> event is fired just before the export process is started.
	 *

	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {object} oEvent.getParameters.exportSettings Contains export-related configuration
	 * @param {object} oEvent.getParameters.userExportSettings User specific settings from the "Export As" dialog
	 * @param {sap.ui.export.util.Filter[]} oEvent.getParameters.filterSettings Array of filter settings for the exported data
	 *
	 * @name sap.ui.export.ExportHandler#beforeExport
	 * @event
	 * @since 1.102
	 * @public
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link sap.ui.export.ExportHandler#event:beforeExport}
	 * event of this <code>sap.ui.export.ExportHandler</code>.</br>
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified,
	 * otherwise it will be bound to this <code>sap.ui.export.ExportHandler</code> itself.</br>
	 * This event is fired just before the export process is started.
	 *
	 * @param {object} [oData] An application-specific payload object that will be passed to the event handler along with the event object when firing the event
	 * @param {function} fnHandler The function to be called when the event occurs
	 * @param {object} [oListener] Context object to call the event handler with. Defaults to the <code>sap.ui.export.ExportHandler</code> instance itself
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 *
	 * @since 1.102
	 * @public
	 */
	ExportHandler.prototype.attachBeforeExport = function(oData, fnHandler, oListener) {
		return this.attachEvent('beforeExport', oData, fnHandler, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link sap.ui.export.ExportHandler#event:beforeExport}
	 * event of this <code>sap.ui.export.ExportHandler</code>.</br>
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function} fnHandler The function to be called when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 *
	 * @since 1.102
	 * @public
	 */
	ExportHandler.prototype.detachBeforeExport = function(fnHandler, oListener) {
		return this.detachEvent('beforeExport', fnHandler, oListener);
	};

	/**
	 * Returns a Promise that gets resolved as soon as the initialization
	 * of the <code>ExportHandler</code> has been finished.
	 *
	 * @returns {Promise} Initialization finished
	 *
	 * @private
	 */
	ExportHandler.prototype.initialized = function() {
		return this._initialized;
	};

	/**
	 * Cleans up the internal structures and removes all event handlers.
	 *
	 * The object must not be used anymore after destroy was called.
	 *
	 * @see sap.ui.base.Object#destroy
	 * @public
	 */
	ExportHandler.prototype.destroy = function() {
		EventProvider.prototype.destroy.apply(this, arguments);

		if (this._oModel) {
			this._oModel.destroy();
		}

		if (this._oFileShareBinding) {
			this._oFileShareBinding.destroy();
		}

		if (this._oExportDialog) {
			this._oExportDialog.destroy();
		}

		if (this._oFilePicker) {
			this._oFilePicker.destroy();
		}

		this._mCapabilities = null;
		this._oDataSource = null;
		this._mDialogSettings = null;
		this._oModel = null;
		this._oFileShareBinding = null;
		this.bIsDestroyed = true;
	};

	/**
	 * Requests available FileShares and returns a <code>Promise</code> that
	 * resolves with their Contexts. If the underlying <code>ODataModel</code>
	 * could not be instantiated the <code>Promise</code> resolves with an
	 * empty array.
	 *
	 * @returns {Promise<sap.ui.model.odata.v4.Context[]>} <code>Promise</code> that gets resolved with the requested FileShare <code>Context</code> <code>Array</code>
	 *
	 * @private
	 */
	ExportHandler.prototype.getFileShareContexts = function() {
		return this.getFileShareModel().then(function(oModel) {
			if (!oModel) {
				return Promise.resolve([]);
			}

			if (!this._oFileShareBinding) {
				this._oFileShareBinding = oModel.bindList('/FileShares');
			}

			return this._oFileShareBinding.requestContexts(0);
		}.bind(this));
	};

	/**
	 * Opens the <code>CloudFilePicker</code> control and
	 * returns a <code>Promise</code> that gets resolved
	 * when the user selected a particular location for
	 * the file that should be created.
	 *
	 * @param {string} [sFileName] Suggested name of the file including file extension
	 * @returns {Promise} Resolves with the file location selected in the <code>CloudFilePicker</code>
	 *
	 * @private
	 */
	ExportHandler.prototype.getRemoteFileLocation = function(sFileName) {
		var that = this;

		return new Promise(function(fnResolve, fnReject) {
			Promise.all([
				ExportUtils.getResourceBundle(),
				that.getFileShareModel()
			]).then(function(aResolve) {
				var oResourceBundle = aResolve[0];
				var oModel = aResolve[1];

				sap.ui.require(['sap/suite/ui/commons/CloudFilePicker'], function(CloudFilePicker) {
					var oFilePicker;

					that._oFilePicker = oFilePicker = new CloudFilePicker({
						sharedModel: oModel,
						suggestedFileName: sFileName,
						enableDuplicateCheck: true,
						fileNameMandatory: true,
						confirmButtonText: oResourceBundle.getText('EXPORT_BUTTON'),
						title: oResourceBundle.getText('DESTINATION_DIALOG_TITLE')
					});

					oFilePicker.attachSelect(function(oEvent) {
						var aSelectedFiles, oSelectedFolder, bReplaceFile, mCloudFileInfo = {};

						aSelectedFiles = oEvent.getParameter('selectedFiles');
						oSelectedFolder = oEvent.getParameter('selectedFolder');
						bReplaceFile = oEvent.getParameter('replaceExistingFile');

						mCloudFileInfo = {};
						mCloudFileInfo['FileShare'] = oSelectedFolder.getFileShareId();
						mCloudFileInfo['FileShareItemKind'] = 'document';
						mCloudFileInfo['FileShareItemName'] = oEvent.getParameter('selectedFileName');
						mCloudFileInfo['ParentFileShareItem'] = oSelectedFolder.getFileShareItemId();

						if (bReplaceFile && Array.isArray(aSelectedFiles) && aSelectedFiles.length > 0) {
							var oCloudFile = aSelectedFiles.shift();

							mCloudFileInfo['FileShareItem'] = oCloudFile.getFileShareItemId();
						}

						/* Check whether the user has selected a valid FileShare */
						if (!mCloudFileInfo['FileShare']) {
							fnReject(oResourceBundle.getText('DESTINATION_SELECTION_INCOMPLETE'));
						}

						fnResolve(mCloudFileInfo);
					});

					oFilePicker.open();
				});
			});
		});
	};

	/**
	 * Creates an export instance according to the given file type
	 * and adds default event handlers.
	 *
	 * @param {object} mExportSettings mExportSettings ExportSettings that are used for the export
	 * @param {object} mCustomSettings Additional settings that are passed into the event
	 * @param {boolean} [mCustomSettings.includeFilterSettings] Defines whether the filter settings on the binding should be included in the exported file
	 * @param {object} mCloudFileInfo FileShareItem representation of the file
	 * @returns {Promise} A <code>Promise</code> that resolves with the desired export instance
	 *
	 * @private
	 */
	ExportHandler.prototype.getExportInstance = function(mExportSettings, mCustomSettings, mCloudFileInfo) {
		var that = this;

		return Promise.all([
			ExportUtils.getResourceBundle(),
			ExportUtils.getExportInstance(mExportSettings, this._mCapabilities)
		]).then(function(aResolve) {
			var oResourceBundle = aResolve[0];
			var oExportInstance = aResolve[1];
			var aFilters = [];
			var oFilterConfig;

			if (mCustomSettings && mCustomSettings.includeFilterSettings) {
				var oContext = mExportSettings.workbook.context;

				if (!oContext) {
					oContext = mExportSettings.workbook.context = {
						metainfo: []
					};
				}

				oFilterConfig = {
					name: oResourceBundle.getText('FILTER_HEADER'),
					items: []
				};
				aFilters = mCustomSettings.includeFilterSettings ? ExportUtils.getFilters(mExportSettings.dataSource) : [];
				oContext.metaSheetName = oFilterConfig.name;

				oContext.metainfo.push(oFilterConfig);
			}

			oExportInstance.attachBeforeExport(function(oEvent) {
				var mEventExportSettings = oEvent.getParameter('exportSettings');

				that.fireEvent('beforeExport', {
					exportSettings: mEventExportSettings,
					userExportSettings: mCustomSettings || {},
					filterSettings: aFilters
				}, false, false);

				/* Sort filterSettings and write to metainfo */
				aFilters.filter(function(oFilter) {
					return oFilter && typeof oFilter.isA === 'function' && oFilter.isA('sap.ui.export.util.Filter');
				}).sort(function(firstElement, secondElement) {
					var sFirst = firstElement.getLabel().toLowerCase();
					var sSecond = secondElement.getLabel().toLowerCase();

					if (sFirst > sSecond) {
						return 1;
					}

					if (sFirst < sSecond) {
						return -1;
					}

					return 0;
				}).forEach(function(oFilter) {
					oFilterConfig.items.push({
						key: oFilter.getLabel(),
						value: oFilter.getValue()
					});
				});
			});

			if (mCloudFileInfo && typeof oExportInstance.attachBeforeSave === 'function') {
				oExportInstance.attachBeforeSave(function(oEvent) {
					var aArrayBuffer, oExportDialog;

					aArrayBuffer = oEvent.getParameter('data');
					oExportDialog = oEvent.getParameter('exportDialog');
					mCloudFileInfo['FileShareItemContentType'] = oExportInstance.getMimeType();
					mCloudFileInfo['FileShareItemConvertToMimeType'] = oExportInstance.getMimeType();

					/* Enforce file conversion for Google Sheet */
					if (mExportSettings.fileType === FileType.GSHEET) {
						mCloudFileInfo['FileShareItemConvertToMimeType'] = 'application/vnd.google-apps.spreadsheet';
					}

					var uInt8Array = new Uint8Array(aArrayBuffer);
					var stringArray = new Array(uInt8Array.length);
					for (var i = 0; i < uInt8Array.length; i++) {
						stringArray[i] = String.fromCharCode(uInt8Array[i]); // often a bit faster, especially with huge files, than string concatenation
					}
					mCloudFileInfo['FileShareItemContent'] = btoa(stringArray.join(""));

					oExportDialog.updateStatus(oResourceBundle.getText('DESTINATION_DIALOG_STATUS'));
					oEvent.preventDefault();

					that.uploadFile(mCloudFileInfo).then(function() {
						MessageToast.show(oResourceBundle.getText('DESTINATION_TRANSFER_SUCCESS'));
					}).catch(function() {
						ExportDialog.showErrorMessage(oResourceBundle.getText('DESTINATION_TRANSFER_ERROR'));
					}).finally(function() {
						oExportDialog.finish();
					});
				});
			}

			return oExportInstance;
		});
	};

	/**
	 * Uploads the file to the FileShareSupport OData service.
	 *
	 * @param {object} mCloudFileInfo FileShareItem representation of the file
	 * @returns {Promise} A <code>Promise</code> that gets resolved after the generated file has been transferred to the FileShareSupport OData service
	 *
	 * @private
	 */
	ExportHandler.prototype.uploadFile = function(mCloudFileInfo) {
		return this.getFileShareModel().then(function(oModel) {
			var oBinding, oContext, sContentProperty, sTypeProperty, sPath;

			sContentProperty = 'FileShareItemContent';
			sTypeProperty = 'FileShareItemContentType';

			/* Overwrite existing file */
			if (mCloudFileInfo['FileShareItem']) {
				oContext = oModel.getKeepAliveContext("/FileShareItems(FileShare='" + mCloudFileInfo.FileShare + "',FileShareItem='" + mCloudFileInfo.FileShareItem + "')");

				/*
				 * We have to set the FileShareItemContentLink as well
				 * as the FileShareItemContentType property explicitly
				 * to ensure that the properties will be filled with
				 * the content of the PATCH response when updating the
				 * FileShareItemContent. Adding the <code>null</code>
				 * prevents an additional PATCH for the link. It is also
				 * important to set all properties without waiting for
				 * the <code>Promise</code> to resolve. This allows the
				 * binding to bundle multiple PATCH requests into a
				 * single $batch.
				 */
				oContext.setProperty('FileShareItemContentLink', '', null);
				oContext.setProperty(sTypeProperty, mCloudFileInfo[sTypeProperty]);
				return oContext.setProperty(sContentProperty, mCloudFileInfo[sContentProperty]).then(function() {
					return oContext.getProperty('FileShareItemContentLink');
				});
			}

			/* Creating new file in specific folder or _Root */
			if (mCloudFileInfo.ParentFileShareItem) {
				sPath = "/FileShareItems(FileShare='" + mCloudFileInfo.FileShare + "',FileShareItem='" + mCloudFileInfo.ParentFileShareItem + "')/_Children";
			} else {
				sPath = "/FileShares(FileShare='" + mCloudFileInfo.FileShare + "')/_Root/_Children";
			}

			oBinding = oModel.bindList(sPath);
			return this._createFile(oBinding, mCloudFileInfo);
		}.bind(this)).then(function(sUrl) {
			if (sUrl) {
				openWindow(sUrl);
			}
		});
	};

	/**
	 * Creates a new file via the <code>ODataListBinding</code> based
	 * on the FileShareItem representation.
	 *
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oBinding ListBinding that is bound to the desired folder
	 * @param {object} mCloudFileInfo FileShareItem representation of the file
	 * @returns {Promise} <code>Promise</code> that resolves with a Link to the created file
	 *
	 * @private
	 */
	ExportHandler.prototype._createFile = function(oBinding, mCloudFileInfo) {
		return new Promise(function(fnResolve, fnReject) {
			function fnCreateCompleted(oEvent) {
				var bSuccess, oContext;

				bSuccess = oEvent.getParameter('success');
				oContext = oEvent.getParameter('context');

				if (bSuccess) {
					oBinding.detachCreateCompleted(fnCreateCompleted);
					fnResolve(oContext.getProperty('FileShareItemContentLink'));
				} else {
					oContext.destroy();
					fnReject();
				}
			}

			oBinding.attachCreateCompleted(fnCreateCompleted);
			oBinding.create(mCloudFileInfo, /* bSkipRefresh */ true);
		});
	};

	/**
	 * Exports the data as defined via parameter. The function
	 * returns a <code>Promise</code> that will be resolved
	 * after the export process has been finished. In case of
	 * an error, its message will be shown in a <code>Dialog</code>
	 * and the <code>Promise</code> will be rejected.
	 *
	 * @param {object} mExportSettings Export settings that are used for the export
	 * @returns {Promise} A <code>Promise</code> that gets resolved after the export process has been finished
	 *
	 * @since 1.102
	 * @public
	 */
	ExportHandler.prototype.export = function(mExportSettings) {
		if (this.bIsDestroyed) {
			Promise.reject('ExportHandler must not be used after calling #destroy');
		}

		return this.getExportInstance(mExportSettings).then(function(oExportInstance) {
			return oExportInstance.build().finally(function() {
				oExportInstance.destroy();
			});
		});
	};

	/**
	 * Exports the data as defined by the user. This function will
	 * show an export settings dialog where the user can define
	 * certain settings that influence the output of the export
	 * functionality.
	 *
	 * @param {object} oSettings General export settings containing workbook and dataSource information
	 * @param {function} [fnResolveColumnLabel] Resolves the label for a particular column that is not directly contained in the export settings
	 * @returns {Promise} A <code>Promise</code> that resolves once the data has been exported
	 *
	 * @since 1.102
	 * @public
	 */
	ExportHandler.prototype.exportAs = function(oSettings, fnResolveColumnLabel) {
		var that = this;
		var mExportSettings;
		var mUserSettings = {};

		if (this.bIsDestroyed) {
			return Promise.reject('ExportHandler must not be used after calling #destroy');
		}

		return this.initialized().then(function() {
			mExportSettings = Object.assign({}, oSettings, that._mDialogSettings);

			return that.getFileShareContexts();
		}).then(function(aContexts) {
			return ExportUtils.getExportSettingsViaDialog(mExportSettings, that._mCapabilities, aContexts.length > 0, function(oDialog) { that._oExportDialog = oDialog; });
		}).then(function(mDialogSettings) {

			/* Cache settings dialog settings */
			that._mDialogSettings = mDialogSettings;

			/* Merge export settings with user settings from the dialog */
			Object.assign(mExportSettings, mDialogSettings);

			ExportUtils.validateFileSettings(mExportSettings);

			mUserSettings.splitCells = mDialogSettings.splitCells;
			mUserSettings.includeFilterSettings = mDialogSettings.includeFilterSettings;

			/* Enforce split cells option for fileType PDF without persisting the value in the settings dialog */
			if (mExportSettings.fileType === FileType.PDF || mDialogSettings.splitCells) {
				mExportSettings.workbook.columns = ExportUtils.splitColumns(mExportSettings.workbook.columns, fnResolveColumnLabel);
			}
			if (mExportSettings.includeFilterSettings) {
				return ExportUtils.parseTechnicalConfiguration();
			}

			return Promise.resolve();
		}).then(function(oUserConfig) {
			if (oUserConfig) {
				var oContext = mExportSettings.workbook.context;

				if (!oContext) {
					oContext = mExportSettings.workbook.context = {};
				}

				oContext.metainfo = Array.isArray(oContext.metainfo) ? oContext.metainfo.push(oUserConfig) : [oUserConfig];
			}
		}).then(function() {
			if (mExportSettings.destination === Destination.LOCAL) {
				return Promise.resolve();
			}

			return that.getRemoteFileLocation(mExportSettings.fileName);
		}).then(function(mCloudFileInfo) {

			/* Validate file name only if file does not exist */
			if (mCloudFileInfo && !mCloudFileInfo['FileShareItem']) {
				mCloudFileInfo.FileShareItemName = ExportUtils.validateFileName(mCloudFileInfo.FileShareItemName, mExportSettings.fileType);
			}

			/* Verify that selected FileShare is a Google Workspace */
			if (mExportSettings.fileType === FileType.GSHEET) {
				return that.validateFileShare(mCloudFileInfo);
			}

			return mCloudFileInfo;
		}).then(function(mCloudFileInfo) {
			return that.getExportInstance(mExportSettings, mUserSettings, mCloudFileInfo).then(function(oExportInstance) {
				return oExportInstance.build().finally(function() {
					oExportInstance.destroy();
				});
			});
		}).catch(ExportDialog.showErrorMessage);
	};

	/**
	 * Ensures that the referenced FileShare is of vendor Google. This
	 * temporary function is required as long as the FileShare OData
	 * service does not provide filter capabilities via $filter.
	 *
	 * @param {object} mCloudFileInfo FileShareItem representation that contains the reference to the FileShare
	 * @returns {Promise} Returns a <code>Promise</code> that either resolves with the current CloudFileInfo or rejects with an error message
	 *
	 * @private
	 */
	 ExportHandler.prototype.validateFileShare = function(mCloudFileInfo) {
		return Promise.all([
			ExportUtils.getResourceBundle(),
			this.getFileShareContexts()
		]).then(function(aResolve) {
			var oResourceBundle = aResolve[0];
			var aContexts = aResolve[1];

			var oFileShareContext = aContexts.find(function(oContext) {
				return oContext.getProperty('FileShare') === mCloudFileInfo.FileShare;
			});

			return this.isGoogleWorkspace(oFileShareContext) ? mCloudFileInfo : Promise.reject(oResourceBundle.getText('DESTINATION_ERROR_NOT_GOOGLE'));
		}.bind(this));
	};

	/**
	 * Returns a <code>Promise</code> that resolves with an <code>ODataModel</code> in case
	 * the FileShareSupport is available and a DataSource can be obtained.
	 *
	 * @returns {Promise<sap.ui.model.odata.v4.ODataModel>} ODataModel for the FileShareSupport service
	 *
	 * @private
	 */
	ExportHandler.prototype.getFileShareModel = function() {

		if (this._oModel) {
			return Promise.resolve(this._oModel);
		}

		return ExportUtils.fetchDataSource().then(function(oDataSource) {
			if (oDataSource) {
				this._oModel = new ODataModel({
					serviceUrl: oDataSource.uri,
					synchronizationMode: 'None',
					autoExpandSelect: true
				});
			}

			return this._oModel;
		}.bind(this));
	};

	/**
	 * Evaluates whether there is any FileShare with vendor Google
	 *
	 * @returns {Promise<boolean>} Indicates whether there is a FileShare with vendor Google
	 *
	 * @private
	 */
	ExportHandler.prototype.isGoogleSheetSupported = function() {
		return this.getFileShareContexts().then(function(aContexts) {
			return aContexts.some(this.isGoogleWorkspace);
		}.bind(this));
	};

	/**
	 * Evaluates whether the given FileShare vendor is Google
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext The OData <code>Context</code> of the FileShare
	 * @returns {boolean} Indicates whether the FileShare vendor is Google
	 *
	 * @private
	 */
	ExportHandler.prototype.isGoogleWorkspace = function(oContext) {
		var sDescription, sVendorType;

		sVendorType = oContext.getProperty('FileShareVendorType');

		if (new URL(window.location.href).search.indexOf("sap-ui-xx-enableGoogleSheets=true") === -1) {
			return sVendorType === 'GOOGLE';
		}

		sDescription = oContext.getProperty('FileShareDescription');

		return sVendorType === 'GOOGLE'
			|| (typeof sDescription === 'string' && sDescription.indexOf('Google') > -1);
	};

	return ExportHandler;
}, /* bExports */ true);
