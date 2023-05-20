/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.CloudFilePicker.
sap.ui.define([
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/DialogRenderer",
	"sap/m/HBox",
	"sap/m/Table",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/m/Select",
	"sap/m/Label",
	"sap/m/Input",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/IconPool",
	"sap/ui/core/Icon",
	"sap/m/Page",
	"sap/m/Breadcrumbs",
	"sap/m/Link",
	"sap/m/Text",
	"./CloudFileInfo",
	"./library",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/ui/layout/FixFlex",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Title",
	"sap/m/ColumnPopoverSelectListItem",
	"sap/m/ColumnHeaderPopover",
	"sap/ui/core/CustomData",
	"sap/ui/model/Sorter",
	"sap/m/SearchField",
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/Device",
	"sap/base/Log",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/core/Item",
	"sap/ui/core/SortOrder",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessageSize",
	"sap/ui/core/format/FileSizeFormat"
], function (
	Button,
	Dialog,
	DialogRenderer,
	HBox,
	Table,
	ColumnListItem,
	Column,
	ODataModel,
	Select,
	Label,
	Input,
	SimpleForm,
	IconPool,
	Icon,
	Page,
	Breadcrumbs,
	Link,
	Text,
	CloudFileInfo,
	library,
	mLibrary,
	coreLibrary,
	FixFlex,
	OverflowToolbar,
	ToolbarSpacer,
	Title,
	ColumnPopoverSelectListItem,
	ColumnHeaderPopover,
	CustomData,
	Sorter,
	SearchField,
	OverflowToolbarLayoutData,
	Device,
	Log,
	DateTimeOffset,
	Item,
	SortOrder,
	IllustratedMessage,
	IllustratedMessageType,
	IllustratedMessageSize,
	FileSizeFormat
) {
	"use strict";

	var DialogType = mLibrary.DialogType;
	var ButtonType = mLibrary.ButtonType;
	var ValueState = coreLibrary.ValueState;
	var FilePickerModes = library.FilePickerModes;

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

	/**
	 * Constructor of the CloudFilePicker
         *
         * @extends sap.m.Dialog
         *
	 * @namespace sap.suite.ui.commons.CloudFilePicker
	 * @experimental
	 * @since 1.101
	 * @class
	 * @public
	 * @internal
	 * @version 1.113.0
	*/
	var CloudFilePicker = Dialog.extend("sap.suite.ui.commons.CloudFilePicker", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Url of the FileShare OData V4 service.
				 */
				serviceUrl: {
					type: "sap.ui.core.URI",
					group: "Data",
					defaultValue: ""
				},
				/**
				 * Model shared from export as dialog
				 */
				 sharedModel: {
					type: "object",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * Overwrites the default text for the confirmation button.
				 */
				confirmButtonText: {
					type: "string",
					group: "Data",
					defaultValue: oResourceBundle.getText(
						"CFP_BUTTON_SELECT"
					)
				},
				/**
				 * Allow the type of resources that can be selected.
				 */
				filePickerMode: {
					type: "sap.suite.ui.commons.FilePickerModes",
					group: "Data",
					defaultValue: "All"
				},
				/**
				 * Specifies the text for selectButton.
				 */
				title: {
					type: "string",
					group: "Data",
					defaultValue: oResourceBundle.getText("CFP_TITLE")
				},
				/**
				 * Specifies whether duplicate file check logic is needed.
				 */
				enableDuplicateCheck: {
					type: "boolean",
					group: "Data",
					defaultValue: false
				},
				/**
				 * Overwrites the default text for the duplicate message popup.
				 * It is relevant only if "enableDuplicateCheck" is set to true.
				 */
				duplicateMessage: {
					type: "string",
					group: "Data"
				},
				/**
				 * File name could be provided in case File picker control is
				 * used for Export/Save As scenario for selecting the location.
				 * Value will be displayed in the File Name control on the dialog.
				 */
				suggestedFileName: {
					type: "string",
					group: "Data"
				},
				/**
				 * Specifies whether file name is mandatory to perform confirmation action
				 */
				fileNameMandatory: {
					type: "boolean",
					group: "Data",
					defaultValue: false
				}
			},
			events: {
				/**
				 * Event is fired when the selection is made
				 */
				select: {
					parameters: {
						/**
						 * Specifies whether an existing file is being overwritten in a file share.
						 */
						replaceExistingFile: "boolean",
						/**
						 * Specifies the name of the selected file.
						 */
						selectedFileName: "string",
						/**
						 * Specifies the details of the seleced file.
						 */
						selectedFiles: { type: "sap.suite.ui.commons.CloudFileInfo[]" },
						/**
						 * Specifies the details of the folder of a selected file.
						 */
						selectedFolder: { type: "sap.suite.ui.commons.CloudFileInfo" }
					}
				},

				/**
				 * Event is fired when the cancel button is pressed
				 *
				 *
				 */
				cancel: {}
			}
		},
		constructor: function () {
			Dialog.prototype.constructor.apply(this, arguments);
			this.oTableControl = null;
			this.oSelectControl = null;
			this.oBreadcrumbLinkControl = null;
			this.oFileNameControl = null;
			this.aVisibleLinks = null;
			this.oNavigationMap = null;
			this.oConfirmationButton = null;
			this.oNewFolderButton = null;
			this.oNewFolderColumnListItem = null;
			this.oCurrentParentData = null;
			this.setResizable(true);
			this.setDraggable(true);
			this._createDialogContent();
			this._createButton();

			if (Device.system.phone) {
				this.setStretch(true);
			} else {
				this.setStretch(false);
				this.setContentWidth("780px");
				this.setContentHeight("48.75rem");
			}

			this.setHorizontalScrolling(false);
			this.setVerticalScrolling(false);
			this.setTitle(this.getTitle());
			this.setBusyIndicatorDelay(0);
			this.setBusy(true);
		},
		renderer: DialogRenderer
	});

	CloudFilePicker.prototype._createDialogContent = function () {
		var sServiceURL = this.getServiceUrl(), oModel = this.getSharedModel();
		if (!sServiceURL && !oModel) {
			Log.error("Invalid Configuration");
		}
		if (!oModel && sServiceURL) {
			oModel = new ODataModel({
				serviceUrl: sServiceURL,
				synchronizationMode: "None",
				earlyRequests: true
			});
		}
		if (oModel) {
			oModel.setSizeLimit(200);
		}
		this.setModel(oModel);
		// Adding Select for cloud spaces
		var oSimpleForm = this._createCloudDropdownAndFileNameField();
		// Adding list to show the files and folders
		this.oBreadcrumbLinkControl = this._createBreadcrumbLinks();
		// Adding list to show the files and folders
		var oListContent = this._createTableContent();
		var oFlexContainer = new FixFlex({
			fixContent: [oSimpleForm, this.oBreadcrumbLinkControl],
			flexContent: oListContent
		});
		this.addContent(oFlexContainer);
	};

	CloudFilePicker.prototype._createCloudDropdownAndFileNameField = function () {
		var oLocationLabel = new Label({
			text: oResourceBundle.getText("CFP_LOCATION"),
			showColon: true,
			labelFor: this.getId() + "-cloudSpaceSelect"
		}).addStyleClass(Device.system.desktop ? "sapUiTinyMarginTop" : '');

		this.oSelectControl = new Select({
			id: this.getId() + "-cloudSpaceSelect",
			forceSelection: false,
			change: function (oControlEvent) {
				this.oTableControl.setBusyIndicatorDelay(0);
				this.oTableControl.setNoDataText(" ");
				this.oFileNameControl.setValue(this.getSuggestedFileName());
				// Confirmation button if disabled already should be re enabled if fileNameControl is set with a value during drive location change
				// and the Confirmation button should be kept disabled when drive location changes
				this.oBreadcrumbLinkControl.destroyLinks();
				this._initializeVisibleLinks();

				var oSelectedItem = oControlEvent.getParameters().selectedItem;
				this._loadFileShareRootFolder(oSelectedItem.getKey());
			}.bind(this)
		}).bindItems({
			path: "/FileShares",
			events:{
				dataReceived: function (oEvent) {
					var mParameters = oEvent.getParameters();
					if (mParameters.error || (!Object.keys(mParameters.data).length && !oEvent.getSource().getCurrentContexts().length)) {
						this.setBusy(false);
						var oMessage = new IllustratedMessage({
							illustrationType: IllustratedMessageType.ErrorScreen,
							illustrationSize: IllustratedMessageSize.Spot,
							enableVerticalResponsiveness: true,
							title: oResourceBundle.getText("CFP_NO_FILESHARE_FOUND"),
							description: oResourceBundle.getText("CFP_NO_FILESHARE_FOUND_RELOAD"),
							additionalContent: [
								new Button({
									text: oResourceBundle.getText("CFP_BUTTON_RELOAD"),
									press: function () {
										this.oSelectControl.getBinding("items").refresh();
									}
								})
							]
						});
						this.oTableControl.setNoData(oMessage);
					} else {
						if (oEvent.getSource() && oEvent.getSource().getContexts() && oEvent.getSource().getContexts().length) {
							var sPath = oEvent.getSource().getContexts()[0].sPath;
							var sKey = sPath.split(/[']/)[1];
							this.oSelectControl.setSelectedKey(sKey);
							setTimeout(function(){
								this._initializeVisibleLinks();
							}.bind(this));
							this._loadFileShareRootFolder(this.oSelectControl.getSelectedKey());
						}
					}
				}.bind(this)
			},
			template: new Item({
				key: "{FileShare}",
				text: {
					parts: ["FileShare", "FileShareDescription"],
					formatter: function (
						sFileShare,
						sFileShareDescription
					) {
						return sFileShareDescription ? sFileShareDescription : sFileShare;
					}
				}
			})
		});

		var oSimpleForm = new SimpleForm({
			layout: "ResponsiveGridLayout",
			singleContainerFullSize: false
		});
		oSimpleForm.addContent(oLocationLabel);
		oSimpleForm.addContent(this.oSelectControl);

		var oLabel = new Label({
			text: oResourceBundle.getText("CFP_FILENAME"),
			showColon: true,
			labelFor: this.getId() + "-fileName"
		}).addStyleClass(Device.system.desktop ? "sapUiTinyMarginTop" : '');

		this.oFileNameControl = new Input({
			id: this.getId() + "-fileName",
			liveChange: function (oControlEvent) {
				this.oTableControl.removeSelections();
				var oSelectedFolderInfo = this.oNavigationMap.get(
					this.aVisibleLinks[this.aVisibleLinks.length - 1].fileShareItemId
				);
				this._setConfirmationButtonEnabled(null, oSelectedFolderInfo, true);
			}.bind(this)
		});
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(this.oFileNameControl);

		if (this.getFilePickerMode() === FilePickerModes.FileOnly) {
			this.oFileNameControl.setVisible(false);
		} else {
			this.oFileNameControl.setValue(this.getSuggestedFileName());
		}

		return oSimpleForm;
	};

	CloudFilePicker.prototype._createBreadcrumbLinks = function () {
		this.oBreadcrumbLinkControl = new Breadcrumbs(this.getId() + "-breadcrumbs").addStyleClass(
			"sapUiSmallMarginBegin sapUiSmallMarginEnd"
		);

		this.oNavigationMap = new Map();
		this._initializeVisibleLinks();

		return this.oBreadcrumbLinkControl;
	};

	CloudFilePicker.prototype._initializeVisibleLinks = function () {
		var sCurrentFileShare = this.oSelectControl.getSelectedItem() ? this.oSelectControl.getSelectedItem().getText() : '';
		var oRoot = {
			fileShareItemId: "Root",
			title: sCurrentFileShare
		};
		this.aVisibleLinks = [oRoot];
		this.oBreadcrumbLinkControl.setCurrentLocationText(sCurrentFileShare);
		this.oNavigationMap.clear();
	};

	CloudFilePicker.prototype._createTableContent = function () {
		this.oNewFolderButton = new Button({
			text: oResourceBundle.getText("CFP_TITLE_NEWFOLDER"),
			type: ButtonType.Transparent,
			enabled: false,
			press: function () {
				this._createNewFolderInline();
			}.bind(this)
		});
		this.oTableControl = new Table({
					headerToolbar: new OverflowToolbar({
					content:[
								new Title({text: oResourceBundle.getText("CFP_LIST_HEADER")}),
								new ToolbarSpacer(),
								new SearchField({
									layoutData: new OverflowToolbarLayoutData({
										minWidth: "200px",
										maxWidth: "300px",
										shrinkable: true,
										moveToOverflow: false
									}),
									visible:false
								}),
								this.oNewFolderButton
							],
					design: 'Transparent'
				}),
				columns: [
					new Column({
						header: new Text({text: oResourceBundle.getText("CFP_NAME")}),
						customData: [new CustomData({
							key: "bindingProperty",
							value: 'FileShareItemName'
						})],
						width: "auto",
						importance: "High"
					}),
					new Column({
						hAlign: "Left",
						header: new Text({text: oResourceBundle.getText("CFP_TYPE")}),
						customData: [new CustomData({
							key: "bindingProperty",
							value: 'FileShareItemContentType'
						})],
						width: "17%",
						importance: "High"
					}),
					new Column({
						header: new Text({text: oResourceBundle.getText("CFP_OWNER")}),
						customData: [new CustomData({
							key: "bindingProperty",
							value: 'CreatedByUser'
						})],
						width: "17%",
						importance: "Low",
						visible: Device.system.phone ? false : true
					}),
					new Column({
						hAlign: "End",
						header: new Text({text: oResourceBundle.getText("CFP_TITLE_LAST_CHANGED_ON")}),
						customData: [new CustomData({
							key: "bindingProperty",
							value: 'LastChangeDateTime'
						})],
						width: "17%",
						importance: "Low",
						visible: Device.system.phone ? false : true
					}),
					new Column({
						hAlign: "End",
						header: new Text({text: oResourceBundle.getText("CFP_FILESIZE")}),
						customData: [new CustomData({
							key: "bindingProperty",
							value: 'FileShareItemContentSize'
						})],
						width: "10%",
						importance: "Low",
						visible: Device.system.phone ? false : true
					})
				],
				autoPopinMode: true,
				sticky:["HeaderToolbar","ColumnHeaders"],
				headerDesign:"Plain",
				noDataText: " ", // UX reccomends to show no text and table shows "No Data" by default
				mode: "SingleSelectMaster",
				itemPress: function(oControlEvent){
					this.oTableControl.setBusyIndicatorDelay(0);
					this.oTableControl.setNoDataText(" ");
					var oSelectedItem = oControlEvent.getParameters().listItem;
					var oContext = oSelectedItem.getBindingContext();
					var bIsFolder = oContext.getObject("FileShareItemKind") === "folder";
					if (bIsFolder) {
						var oSelectedFolderInfo = this._createSelectionParameter(oSelectedItem);
						var sFileShareItemId = oSelectedFolderInfo.getFileShareItemId();
						oSelectedFolderInfo.path = oContext.getCanonicalPath();
						this.oCurrentParentData = oSelectedFolderInfo;
						this.oNavigationMap.set(sFileShareItemId, oSelectedFolderInfo);
						var oNewContext = oContext
							.getModel()
							.createBindingContext(oSelectedFolderInfo.path);
						this.aVisibleLinks.push({
							fileShareItemId: sFileShareItemId,
							title: oSelectedItem.getCells()[0].getItems()[1].getText()
						});
						this._updateBreadcrumbLinks();
						this.oTableControl.setBindingContext(oNewContext);
					} else {
						var sFieldValue = oContext.getProperty("FileShareItemName");
						this.oFileNameControl.setValue(sFieldValue);
					}
				}.bind(this),
				items: {
					path : "_Children",
					parameters : {
						$$operationMode : 'Server'
					},
					sorter : [
						new Sorter({
							path : 'FileShareItemKind',
							descending : true
						}),
						new Sorter({
							path : 'FileShareItemName',
							descending : false
						})
					],
					events:{
						dataReceived: function () {
							this.oTableControl.setNoData(null);
							this.oTableControl.setNoDataText(oResourceBundle.getText("CFP_NO_DATA_FILESHARE"));
							this.setBusy(false);
						}.bind(this)
					},
					template : new ColumnListItem({
						cells: [
							new HBox({
								items: [
								new Icon({src:{
									parts: ["FileShareItemKind", "FileShareItemContentType", "isDocumentCreationAllowed"],
									formatter: function (
										sFileShareItemKind,
										sFileShareItemContentType,
										sIsDocumentCreationAllowed
									) {
										if (sFileShareItemKind === "folder") {
											if (sIsDocumentCreationAllowed === "No") {
												return "sap-icon://locked";
											} else {
												return "sap-icon://folder-full";
											}
										} else {
											return IconPool.getIconForMimeType(sFileShareItemContentType);
										}
									}
									}
									}).addStyleClass("sapUiTinyMarginEnd"),
									new Text({text: "{FileShareItemName}"})]
								}),
							new Text({text: "{FileShareItemHumanContentType}"}),
							new Text({text: "{= ${FileShareItemKind} === 'folder' ? '' : ${CreatedByUser}}"}),
							new Text({text:{
								parts: ["FileShareItemKind", "LastChangeDateTime"],
								formatter: function (sFileShareItemKind, sLastChangeDateTime) {
									if (sFileShareItemKind === 'folder') {
										return '';
									} else {
										var oDTOffset = new DateTimeOffset({style: "short"});
										return oDTOffset.formatValue(new Date(sLastChangeDateTime), "string");
									}
								}
								}
							}),
							new Text({text:{
								parts: ["FileShareItemKind", "FileShareItemContentSize"],
								formatter: function (sFileShareItemKind, sFileShareItemContentSize) {
									if (sFileShareItemKind !== "folder") {
										var sFileSize = FileSizeFormat.getInstance({
											binaryFilesize: false,
											maxFractionDigits: 1,
											maxIntegerDigits: 3
										}).format(sFileShareItemContentSize.split(",").join(""));
										return sFileSize;
									} else {
										return '';
									}
								}
							}})
						],
						type: "{= ${FileShareItemKind} === 'folder' ? 'Navigation' : 'Active'}"
					})
				},
				updateFinished: function (oEvent) {
					if (!this.oTableControl.getBusy()) {
						if (this.oCurrentParentData && Object.keys(this.oCurrentParentData).length !== 0) {
							this._setConfirmationButtonEnabled(this.oCurrentParentData.getProperty("isDocumentCreationAllowed"));
							this._enableDisableNewFolderBtn();
						}
					}
				}.bind(this)
		});

		this.oTableControl.bActiveHeaders = true;
		this.oTableControl.attachEvent("columnPress", function(oEvent) {
			var oColumn = oEvent.getParameter("column"), sColumnType = oColumn.getCustomData()[0].getValue();
			if (sColumnType === "CreatedByUser" || sColumnType === "FileShareItemContentSize" || sColumnType === "FileShareItemContentType") {
				return;
			}
			var _aSortButton = [
				new ColumnPopoverSelectListItem({
					icon: "sap-icon://sort-ascending",
					action: function() {
						this._fHandleSorting(oColumn, true);
					}.bind(this)
				}),
				new ColumnPopoverSelectListItem({
					icon: "sap-icon://sort-descending",
					action: function() {
						this._fHandleSorting(oColumn, false);
					}.bind(this)
				})
			];
			var oHeaderPopOver = new ColumnHeaderPopover({
				items: [_aSortButton]
			});
			oHeaderPopOver.openBy(oColumn);
		}.bind(this));

		var oPage = new Page({
			showHeader:false,
			content: [this.oTableControl],
			enableScrolling: true
		});
		return oPage;
	};

	CloudFilePicker.prototype._createNewFolderInline = function () {
		var oNewFolderInput = new Input({
			placeholder: "Enter Folder Name",
			width: "100%",
			visible: true,
			value: oResourceBundle.getText("CFP_TITLE_NEWFOLDER")
		});
		oNewFolderInput.attachBrowserEvent("focusout", function(oEvent) {
			if (this._checkForDuplicateInTable(this.oTableControl, oEvent.target.value.toLowerCase())) {
				oNewFolderInput.setValueState(ValueState.Error);
				oNewFolderInput.setValueStateText(oResourceBundle.getText("CFP_FOLDER_EXIST"));
			} else {
				oNewFolderInput.setValueState(ValueState.None);
				oNewFolderInput.setValueStateText("");
				this._makeNewFolderEntry(oEvent.target.value);
			}
		}.bind(this));
		this.oNewFolderColumnListItem = new ColumnListItem({
			cells: [
					new HBox({
						items: [oNewFolderInput]
					}),
					new Text({text: "{= ${FileShareItemKind} === 'folder' ? '' : ${FileShareItemContentType}}"}),
					new Text({text: "{= ${FileShareItemKind} === 'folder' ? '' : ${CreatedByUser}}"}),
					new Text({text: {
						parts: ["FileShareItemKind", "LastChangeDateTime"],
						formatter: function (sFileShareItemKind, sLastChangeDateTime) {
							if (sFileShareItemKind === 'folder') {
								return '';
							} else {
								if (sLastChangeDateTime) {
									var oDTOffset = new DateTimeOffset({style: "short"});
									return oDTOffset.formatValue(new Date(sLastChangeDateTime), "string");
								}
							}
						}
					}}),
					new Text({text: "{= ${FileShareItemKind} === 'folder' ? '' : ${FileShareItemContentSize}}"})
			]
		});
		this._setConfirmationButtonEnabled(false);
		this.oNewFolderButton.setEnabled(false);
		this.oTableControl.insertItem(this.oNewFolderColumnListItem);
		setTimeout(function () {
			oNewFolderInput.focus();
		});
	};

	CloudFilePicker.prototype._checkForDuplicateInTable = function (oTableControl, sLowerCaseSearchText) {
		var oDuplicateItem = oTableControl.getItems().find(function (oTableItem, index) {
			if (index > 0 && oTableItem.getCells()[0].getItems()[1].getText().toLowerCase() === sLowerCaseSearchText) {
				return true;
			}
			return false;
		});
		return !!oDuplicateItem;
	};

	CloudFilePicker.prototype._enableDisableNewFolderBtn = function () {
		// New folder creation to be allowed only at child level of a particular drive
		if (this.oNavigationMap.size && this.oCurrentParentData.getProperty("isDocumentCreationAllowed")) {
			this.oNewFolderButton.setEnabled(true);
		} else {
			this.oNewFolderButton.setEnabled(false);
		}
	};

	CloudFilePicker.prototype._makeNewFolderEntry = function (sFolderName) {
		this.setBusy(true);
		var oBinding = this.oTableControl.getBinding("items"), fnResolve, oPromise = new Promise(function (resolve) {
				fnResolve = resolve;
			});

		this.oTableControl.removeItem(this.oNewFolderColumnListItem);
		this.oNewFolderColumnListItem.destroy();

		//handle success/failure of GET request triggered for a #create on this binding
		var oNewFolderContext = oBinding.create({
				FileShareItemName: sFolderName,
				FileShareItemKind: 'folder'
		}, true, false, false);

		// handle success/failure of POST request triggered for a #create on this binding
		var fnCreateCompleted = function(oEvent) {
		var oContext = oEvent.getParameter("context"), bSuccess = oEvent.getParameter("success");
		if (oContext === oNewFolderContext) {
				oBinding.detachCreateCompleted(fnCreateCompleted, this); // don't accumulate handlers
				fnResolve(bSuccess);
			}
		};

		oBinding.attachCreateCompleted(fnCreateCompleted, this);

		// Handle error when adding a new item
		var fnSafeContextCreated = function() {
			oNewFolderContext
			.created()
			.then(undefined, function (contextError) {
				Log.trace("transient creation context deleted");
			})
			.catch(function (contextError) {
				Log.trace("transient creation context deletion error", contextError);
			});
		};

		oPromise.then(function(bSuccess) {
			if (!bSuccess) {
				fnSafeContextCreated();
				oBinding.resetChanges();
				this.setBusy(false);
			} else {
				oNewFolderContext.created();
				this.oTableControl.setSelectedItem(this.oTableControl.getItems().length > 0 ? this.oTableControl.getItems()[0] : null);
				this.setBusy(false);
			}
		}.bind(this));
	};

	CloudFilePicker.prototype._warningMessageDialog = function (sDisplayMessage) {
		var oApproveDialog = new Dialog({
			type: DialogType.Message,
			title: oResourceBundle.getText("CFP_TITLE_WARNING"),
			state: ValueState.Warning,
			content: new Text({ text: sDisplayMessage }),
			beginButton: new Button({
				type: ButtonType.Emphasized,
				text: oResourceBundle.getText("CFP_BUTTON_OK"),
				press: function () {
					oApproveDialog.close();
				}
			})
		});
		oApproveDialog.open();
	};

	CloudFilePicker.prototype._fHandleSorting = function(oColumn, bIsAsc) {
		var sNewSort = bIsAsc ? SortOrder.Ascending : SortOrder.Descending;
		if (sNewSort === oColumn.getSortIndicator()) {
			sNewSort = SortOrder.None;
		}
		this.oTableControl.getColumns().forEach(function(oColumn){
			oColumn.setSortIndicator("None");
		});
		oColumn.setSortIndicator(sNewSort);
		var sSortProperty = oColumn.data("bindingProperty");
		var oItemBinding = this.oTableControl.getBinding("items");
		oItemBinding.sort([
			new Sorter("FileShareItemKind", true),
			new Sorter(sSortProperty , !bIsAsc)
		]);
	};

	CloudFilePicker.prototype._resetAndApplyDefaultSorting = function() {
		this.oTableControl.getColumns().forEach(function(oColumn){
			oColumn.setSortIndicator("None");
		});
		var oItemBinding = this.oTableControl.getBinding("items");
		oItemBinding.sort([
			new Sorter("FileShareItemKind", true),
			new Sorter("FileShareItemName" , false)
		]);
	};

	CloudFilePicker.prototype._updateBreadcrumbLinks = function () {
		if (this.aVisibleLinks && this.aVisibleLinks.length > 1) {
			var aVisibleLinksRev = this.aVisibleLinks.slice().reverse();
			var newLinks = [];
			aVisibleLinksRev.forEach(
				function (oVisibleLink, index, array) {
					// Set current drill position in breadcrumb control
					if (index == 0) {
						this.oBreadcrumbLinkControl.setCurrentLocationText(oVisibleLink.title);
					} else {
						var oCrumb = new Link({
							text: oVisibleLink.title,
							press: function (oEvent) {
								if (this.oNewFolderColumnListItem && this.oTableControl.indexOfItem(this.oNewFolderColumnListItem) > -1) {
									this.oTableControl.removeItem(this.oNewFolderColumnListItem);
									this.oNewFolderColumnListItem.destroy();
								}
								var iLinkIndex = this.oBreadcrumbLinkControl.indexOfLink(
									oEvent.getSource()
								);
								var aRemovedLinks = this.aVisibleLinks.splice(iLinkIndex + 1);
								var oSelectedFolderInfo, oNewContext;
								this._updateBreadcrumbLinks();
								if (this.aVisibleLinks.length > 1) {
									// update binding context for the levels below the root
									oSelectedFolderInfo = this.oNavigationMap.get(
										this.aVisibleLinks[this.aVisibleLinks.length - 1].fileShareItemId
									);
									this.oCurrentParentData = oSelectedFolderInfo;
									for (var sKey in aRemovedLinks) {
										this.oNavigationMap.delete(aRemovedLinks[sKey].fileShareItemId);
									}
									this._setConfirmationButtonEnabled(null, oSelectedFolderInfo);
									oNewContext = this.getModel().createBindingContext(oSelectedFolderInfo.path);
									this.oTableControl.setBindingContext(oNewContext);
								} else {
									oSelectedFolderInfo = this.oNavigationMap.get(
										this.aVisibleLinks[this.aVisibleLinks.length - 1].fileShareItemId
									);
									this.oCurrentParentData = oSelectedFolderInfo;
									this._setConfirmationButtonEnabled(null, oSelectedFolderInfo);
									this._loadFileShareRootFolder(this.oSelectControl.getSelectedKey());
								}
							}.bind(this)
						});
						newLinks.push(oCrumb); //note the links are added in an incorrect order need to reverse
					}
				}.bind(this)
			);

			newLinks.reverse();
			// Clear aggregation before we rebuild it
			if (this.oBreadcrumbLinkControl.getLinks()) {
				this.oBreadcrumbLinkControl.removeAllLinks();
			}
			for (var i = 0; i < newLinks.length; i++) {
				this.oBreadcrumbLinkControl.addLink(newLinks[i]);
			}
		} else {
			this.oBreadcrumbLinkControl.destroyLinks();
			this._initializeVisibleLinks();
			this._enableDisableNewFolderBtn();
		}
		this._setConfirmationButtonEnabled(false);
	};

	CloudFilePicker.prototype._loadFileShareRootFolder = function (sFileShareKey) {
		// update binding context for root
		this.oNavigationMap.clear();
		var sPath = "/FileShares(" + "'" + sFileShareKey + "'" + ")/_Root";
		var oContextBinding = this.getModel().bindContext(sPath);
		oContextBinding.requestObject().then(function (oValue) {
			var oSelectedFolderInfo = this._createSelectionParameter(oValue, oContextBinding.getBoundContext(oValue));
			this._setConfirmationButtonEnabled(null, oSelectedFolderInfo);
		}.bind(this));
		var oContext = this.getModel().createBindingContext(sPath);
		this.oTableControl.setBindingContext(oContext);
	};

	CloudFilePicker.prototype._createButton = function () {
		this.oConfirmationButton = new Button({
			text: this.getConfirmButtonText(),
			type: ButtonType.Emphasized,
			enabled: false,
			press: function () {
				var sCurrentItemInInput = this.oFileNameControl.getValue();
				if ((this.getFilePickerMode() === FilePickerModes.FileOnly) || sCurrentItemInInput) {
					if (this.getEnableDuplicateCheck() && this._checkForDuplicate(this.oTableControl, sCurrentItemInInput.toLowerCase())) {
						this._showOverwriteMessage(sCurrentItemInInput);
					} else {
						this._closeDialog();
					}
				} else {
					this._closeDialog();
				}
			}.bind(this)
		});
		this.addButton(
			this.oConfirmationButton
		);
		this.addButton(
			new Button({
				text: oResourceBundle.getText("CFP_BUTTON_CANCEL"),
				press: function () {
					this.fireCancel();
					this.close();
					setTimeout(function () {
						this.destroy();
					}.bind(this));
				}.bind(this)
			})
		);
		this._setConfirmationButtonEnabled(false);
	};

	CloudFilePicker.prototype._setConfirmationButtonEnabled = function (bEnabled, oSelectedFolderInfo, bFileNameEdit) {
		var bIsFileNameExist = false;
		if (this.oFileNameControl && this.oFileNameControl.getValue()) {
			bIsFileNameExist = this.oFileNameControl.getValue() !== '';
		}
		// Document creation not checked, considered only for export scenarios
		if (this.getFilePickerMode() === FilePickerModes.FileOnly) {
			this.oConfirmationButton.setEnabled(bEnabled);
		} else if (oSelectedFolderInfo && oSelectedFolderInfo.getIsDocumentCreationAllowed()) {
			if (this.getFileNameMandatory()) {
				bIsFileNameExist || bEnabled ? this.oConfirmationButton.setEnabled(true) : this.oConfirmationButton.setEnabled(false);
			} else {
				this.oConfirmationButton.setEnabled(true);
			}
		} else if (bFileNameEdit) {
			if (this.getFileNameMandatory()) {
				this.oConfirmationButton.setEnabled((oSelectedFolderInfo && oSelectedFolderInfo.getIsDocumentCreationAllowed()) ? bIsFileNameExist : false);
			}
		} else {
			this.oConfirmationButton.setEnabled(bEnabled ? bEnabled : false);
		}
	};

	CloudFilePicker.prototype._checkForDuplicate = function (oTableControl, sLowerCaseSearchText) {
		var oDuplicateItem = oTableControl.getItems().find(function (oTableItem) {
			if (oTableItem.getCells()[0].getItems()[1].getText().toLowerCase() === sLowerCaseSearchText) {
				oTableControl.setSelectedItem(oTableItem);
				return true;
			}
			return false;
		});
		return !!oDuplicateItem;
	};

	CloudFilePicker.prototype._showOverwriteMessage = function (sFileShareItemName) {
		var sDuplicateMessage = this.getDuplicateMessage();
		if (!sDuplicateMessage) {
			sDuplicateMessage = oResourceBundle.getText("CFP_MESSAGE_DUPLICATE", sFileShareItemName);
		}

		var oApproveDialog = new Dialog({
			type: DialogType.Message,
			title: oResourceBundle.getText("CFP_TITLE_WARNING"),
			state: ValueState.Warning,
			content: new Text({ text: sDuplicateMessage }),
			beginButton: new Button({
				type: ButtonType.Emphasized,
				text: oResourceBundle.getText("CFP_BUTTON_YES"),
				press: function () {
					oApproveDialog.close();
					this._closeDialog(true);
				}.bind(this)
			}),
			endButton: new Button({
				text: oResourceBundle.getText("CFP_BUTTON_NO"),
				press: function () {
					oApproveDialog.close();
				}
			})
		});
		oApproveDialog.open();
	};

	CloudFilePicker.prototype._closeDialog = function (bReplaceExistingFile) {
		var mParameters = {};

		if (this.aVisibleLinks.length > 1) {
			mParameters.selectedFolder = this.oNavigationMap.get(this.aVisibleLinks[this.aVisibleLinks.length - 1].fileShareItemId);
		} else {
			mParameters.selectedFolder = new CloudFileInfo();
			mParameters.selectedFolder.setFileShareId(this.oSelectControl.getSelectedKey());
		}

		mParameters.selectedFileName = this.oFileNameControl.getValue();
		mParameters.replaceExistingFile = !!bReplaceExistingFile;

		mParameters.selectedFiles = [];
		var oSelectedItem = this.oTableControl.getSelectedItem();
		if (oSelectedItem) {
			mParameters.selectedFiles.push(this._createSelectionParameter(oSelectedItem));
		}

		this.fireEvent("select", mParameters);

		this.close();
		setTimeout(function () {
			this.destroy();
		}.bind(this));
	};

	CloudFilePicker.prototype._createSelectionParameter = function (oSelectedItem, oContextBinding) {
		var oCloudFileInfo = new CloudFileInfo();
		var oContext;
		if (!oContextBinding) {
			oContext = oSelectedItem.getBindingContext();
		} else {
			oContext = oContextBinding;
		}
		oCloudFileInfo.setFileShareId(oContext.getObject("FileShare"));
		oCloudFileInfo.setFileShareItemId(oContext.getObject("FileShareItem"));
		oCloudFileInfo.setParentFileShareItemId(
			oContext.getObject("ParentFileShareItem")
		);
		oCloudFileInfo.setIsFolder(
			oContext.getObject("FileShareItemKind") === "folder"
		);
		oCloudFileInfo.setFileShareItemName(
			oContext.getObject("FileShareItemName")
		);
		oCloudFileInfo.setCreatedByUser(oContext.getObject("CreatedByUser"));
		oCloudFileInfo.setCreationDateTime(
			oContext.getObject("CreationDateTime")
		);
		oCloudFileInfo.setLastChangedByUser(
			oContext.getObject("LastChangedByUser")
		);
		oCloudFileInfo.setLastChangeDateTime(
			oContext.getObject("LastChangeDateTime")
		);
		oCloudFileInfo.setFileShareItemContent(
			oContext.getObject("FileShareItemContent")
		);
		oCloudFileInfo.setFileShareItemContentType(
			oContext.getObject("FileShareItemContentType")
		);
		oCloudFileInfo.setFileShareItemContentSize(
			oContext.getObject("FileShareItemContentSize")
		);
		oCloudFileInfo.setFileShareItemContentLink(
			oContext.getObject("FileShareItemContentLink")
		);
		oCloudFileInfo.setIsDocumentCreationAllowed(
			oContext.getObject("isDocumentCreationAllowed")
		);

		return oCloudFileInfo;
	};

	return CloudFilePicker;
});