/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides control sap.ui.comp.smartvariants.VariantManagement.
sap.ui.define([
	"sap/m/VariantManagement",
	"sap/ui/core/Control",
	"sap/ui/core/library",
	"sap/ui/model/base/ManagedObjectModel",
	'sap/base/Log'
], function (
	MVariantManagement,
	Control,
	coreLibrary,
	ManagedObjectModel,
	Log
) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	/**
	 * Constructor for a new <code>SmartVariantManagementBase</code>.
	 * @param {string} [sId] - ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] - Initial settings for the new control
	 * @class
	 *            <h3>Overview</h3>
	 *            The <code>SmartVariantManagementBase</code> control embeds
	 *            {@link sap.m.VariantManagement VariantManagement}
	 *            control and communicates with the flexibility library that
	 *            offers SAPUI5 flexibility to manage the variants for the UI
	 *            Adaptation scenarios.<br>
	 * @see {@link topic:f1430c0337534d469da3a56307ff76af Key User Adaptation: Enable Your App}
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @public
	 * @since 1.56
	 * @alias sap.ui.comp.smartvariants.SmartVariantManagementBase
	 */
	var SmartVariantManagementBase = Control.extend("sap.ui.comp.smartvariants.SmartVariantManagementBase", /** @lends sap.ui.comp.smartvariants.SmartVariantManagementBase.prototype */ {
		metadata: {
			interfaces: [
				"sap.m.IOverflowToolbarContent"
			],
			library: "sap.ui.comp",
			designtime: "sap/ui/comp/designtime/smartvariants/SmartVariantManagementBase.designtime",
			properties: {

				/**
				 * Can be set to true or false depending on whether you want to enable or disable the control.
				 */
				enabled: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Provides a string value to set the default variant. Used for the save dialog. Has no effect on the selected variant.
				 */
				defaultVariantKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The key of the currently selected item.
				 */
				selectionKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Indicates that a Create Tile is visible in the Save As dialog.
				 */
				showCreateTile: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that Execute on Selection is visible in the Save As and the Manage Views dialogs.
				 */
				showExecuteOnSelection: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that the Public checkbox is visible in the Save As and the Manage Views dialogs. Selecting this checkbox allows you to
				 * share variants with other users.
				 */
				showShare: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that set as default is visible in the Save As and the Manage Views dialogs.
				 */
				showSetAsDefault: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Overwrites the default Standard variant title.
				 * <br><b>Note:</b> This property has to be set during the <code>applySettings</code> method; it will be ignored otherwise.
				 *
				 */
				standardItemText: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Indicates that the 'Favorites' feature is used. Only variants marked as favorites will be displayed in the variant list.
				 */
				useFavorites: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that the control is in error state. If set to <code>true</code> error message will be displayed whenever the variant is opened.
				 */
				inErrorState: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that end users are allowed to create variants
				 * <br><b>Note:</b> this property is controlled by the flexibility service.
				 */
				variantCreationByUserAllowed: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Defines the author of the standard variant, for example, the name of the own company.
				 */
				standardItemAuthor: {
					type: "string",
					group: "Misc",
					defaultValue: "SAP"
				},

				/**
				 * Defines the Apply Automatically text for the standard variant in the Manage Views dialog if the application controls this behavior.
				 *
				 * <br><b>Note:</b> the usage of this property is restricted to <code>sap.ui.generic.template</code> components only.
				 */
				displayTextForExecuteOnSelectionForStandardVariant: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
				 * Semantic level of the header.
				 * For more information, see {@link sap.m.Title#setLevel}.
				 *
				 * @since 1.104
				 */
				headerLevel: {
					type: "sap.ui.core.TitleLevel",
					group: "Appearance",
					defaultValue: TitleLevel.Auto
				},

				/**
				 * Defines the style of the title.
				 * For more information, see {@link sap.m.Title#setTitleStyle}.
				 *
				 * @since 1.109
				 */
				titleStyle: {
					type: "sap.ui.core.TitleLevel",
					group: "Appearance",
					defaultValue: TitleLevel.Auto
				},

				/**
				 * Enables the setting of the initially selected variant.
				 * @deprecated Since 1.103.
				 */
				initialSelectionKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Enables the lifecycle support. If set to true, the VariantManagement control handles the transport information for shared variants.
				 * @deprecated Since 1.103.
				 */
				lifecycleSupport: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Sets the maximum width of the control.
				 *
				 * @since 1.109
				 */
				maxWidth: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: "100%"
				}
			},
			events: {
				/**
				 * This event is fired when the Save Variant dialog is closed with OK for a variant.
				 */
				save: {
					parameters: {
						/**
						 * The variant title
						 */
						name: {
							type: "string"
						},

						/**
						 * Indicates if an existing variant is overwritten or if a new variant is created
						 */
						overwrite: {
							type: "boolean"
						},

						/**
						 * The variant key
						 */
						key: {
							type: "string"
						},

						/**
						 * The Execute on Selection indicator
						 */
						exe: {
							type: "boolean"
						},

						/**
						 * The default variant indicator
						 */
						def: {
							type: "boolean"
						},

						/**
						 * The shared variant indicator
						 */
						global: {
							type: "boolean"
						}
					}
				},

				/**
				 * This event is fired when users apply changes to variants in the Manage Variants dialog.
				 */
				manage: {
					parameters: {
						/**
						 * List of changed variants. Each entry contains a 'key' - the variant key and a 'name' - the new title of the variant
						 */
						renamed: {
							type: "object[]"
						},

						/**
						 * List of deleted variant keys
						 */
						deleted: {
							type: "string[]"
						},

						/**
						 * List of variant keys and the associated Execute on Selection indicator
						 */
						exe: {
							type: "object[]"
						},

						/**
						 * The default variant key
						 */
						def: {
							type: "string"
						}
					}
				},

				/**
				 * This event is fired when a new variant is selected.
				 */
				select: {
					parameters: {
						/**
						 * The variant key
						 */
						key: {
							type: "string"
						}
					}
				}
			},
			defaultAggregation: "variantItems",
			aggregations: {
				/**
				 * Used for embedded vm
				 */
				_embeddedVM: {
					type: "sap.m.VariantManagement",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * Variant items displayed by the <code>SmartVariantManagement</code> control.
				 */
				variantItems: {
					type: "sap.ui.comp.variants.VariantItem",
					multiple: true,
					forwarding: {
						getter: "_getEmbeddedVM",
						aggregation: "items"
					}
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.style("max-width", oControl.getMaxWidth());
				oRm.openEnd();
				oRm.renderControl(oControl._oVM);
				oRm.close("div");
			}
		}
	});

	/*
	 * Constructs and initializes the <code>VariantManagement</code> control.
	 */
	SmartVariantManagementBase.prototype.init = function () {

		Control.prototype.init.apply(this); // Call base class
		this.STANDARDVARIANTKEY = "*standard*";
		this._sStdKey = this.STANDARDVARIANTKEY;

		this.addStyleClass("sapUiCompVarMngmt");
		this.oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");

		this._oVM = new MVariantManagement(this.getId() + "-vm");
		this.setAggregation("_embeddedVM", this._oVM, true);

		this._oManagedObjectModel = new ManagedObjectModel(this);
		this.setModel(this._oManagedObjectModel, "$compSmartVariants");

		this._oVM.attachManage(this._fireManage, this);
		this._oVM.attachSave(this._fireSave, this);
		this._oVM.attachSelect(this._fireSelect, this);
		this._oVM.attachCancel(this._fireCancel, this);
		this._oVM.attachManageCancel(this._fireManageCancel, this);

		this.setDefaultVariantKey(this.getStandardVariantKey());
		this.setPopoverTitle(this.oResourceBundle.getText("VARIANT_MANAGEMENT_VARIANTS"));
		this._bindProperties();
	};


	SmartVariantManagementBase.prototype._bindProperties = function (bValue) {
		this._oVM.bindProperty("defaultKey", {
			path: "/defaultVariantKey",
			model: "$compSmartVariants"
		});

		this._oVM.bindProperty("creationAllowed", {
			path: "/variantCreationByUserAllowed",
			model: "$compSmartVariants"
		});

		this._oVM.bindProperty("selectedKey", {
			path: "/selectionKey",
			model: "$compSmartVariants"
		});

		this._oVM.bindProperty("supportPublic", {
			path: "/showShare",
			model: "$compSmartVariants"
		});

		this._oVM.bindProperty("supportDefault", {
			path: "/showSetAsDefault",
			model: "$compSmartVariants"
		});

		this._oVM.bindProperty("supportApplyAutomatically", {
			path: "/showExecuteOnSelection",
			model: "$compSmartVariants"
		});

		this._oVM.bindProperty("supportFavorites", {
			path: "/useFavorites",
			model: "$compSmartVariants"
		});

		this._oVM.bindProperty("displayTextForExecuteOnSelectionForStandardVariant", {
			path: "/displayTextForExecuteOnSelectionForStandardVariant",
			model: "$compSmartVariants"
		});

		this._oVM.bindProperty("level", {
			path: "/headerLevel",
			model: "$compSmartVariants"
		});

		this._oVM.bindProperty("titleStyle", {
			path: "/titleStyle",
			model: "$compSmartVariants"
		});
	};

	SmartVariantManagementBase.prototype._getEmbeddedVM = function () {
		return this._oVM;
	};

	SmartVariantManagementBase.prototype.setShowCreateTile = function (bValue) {
		this.setProperty("showCreateTile", bValue);
		this._oVM._setShowCreateTile(bValue);
		return this;
	};

	SmartVariantManagementBase.prototype.getShowCreateTile = function () {
		return this._oVM._getShowCreateTile();
	};

	SmartVariantManagementBase.prototype._assignUser = function (sKey, sUser) {
		var oItem = this._oVM._getItemByKey(sKey);
		if (oItem && !oItem.getAuthor()) {
			oItem.setAuthor(sUser);
		}
	};

	SmartVariantManagementBase.prototype.setSelectionKey = function (sKey) {
		this.setProperty("selectionKey", sKey);
		return this;
	};

	SmartVariantManagementBase.prototype.setInitialSelectionKey = function (sKey) {
		return this.setSelectionKey(sKey);
	};
	SmartVariantManagementBase.prototype.getInitialSelectionKey = function () {
		return this.getSelectionKey();
	};

	/**
	 * Gets the dirty flag of the current variant.
	 * @public
	 * @returns {boolean} The dirty state of the current variant
	 */
	SmartVariantManagementBase.prototype.currentVariantGetModified = function () {
		return this.getModified();
	};

	/**
	 * Sets the dirty flag of the current variant.
	 * @public
	 * @param {boolean} bFlag The value indicating the dirty state of the current variant
	 */
	SmartVariantManagementBase.prototype.currentVariantSetModified = function (bFlag) {
		this.setModified(bFlag);
	};

	SmartVariantManagementBase.prototype._getIdxSorted = function (sTitle) {

		var aItems = this.getVariantItems();

		var sUpperTitle = sTitle.toUpperCase();
		var nIdx = aItems.findIndex(function (oElement, idx) {
			if (idx > 0) {
				if (oElement.getTitle().toUpperCase() > sUpperTitle) {
					return true;
				}
			}

			return false;
		});

		return nIdx > -1 ? nIdx : aItems.length;
	};

	SmartVariantManagementBase.prototype._reorderList = function (sKey) {
		var oVariant = this.getItemByKey(sKey);
		if (oVariant) {
			this._destroyManageDialog();

			this.removeVariantItem(oVariant);
			var nIdx = this._getIdxSorted(oVariant.getTitle());
			this.insertVariantItem(oVariant, nIdx);
		}
	};

	SmartVariantManagementBase.prototype._getInternalVM = function () {
		return this.getAggregation("_embeddedVM");
	};

	SmartVariantManagementBase.prototype.getItemByKey = function (sKey) {
		var oItems = this.getVariantItems();
		for (var iCount = 0; iCount < oItems.length; iCount++) {
			if (sKey == oItems[iCount].getKey()) {
				return oItems[iCount];
			}
		}
		return null;
	};


	SmartVariantManagementBase.prototype._determineStandardVariantName = function () {

		var sText = this.oResourceBundle.getText("VARIANT_MANAGEMENT_STANDARD");

		if ((this.getStandardVariantKey() === this.STANDARDVARIANTKEY) && this.getStandardItemText()) {
			sText = this.getStandardItemText();
		}

		return sText;
	};

	SmartVariantManagementBase.prototype.setStandardVariantKey = function (sStdKey) {
		this._sStdKey = sStdKey;
	};

	SmartVariantManagementBase.prototype.getStandardVariantKey = function () {
		var sStandardVariantKey = this._oVM.getStandardVariantKey();

		return sStandardVariantKey ? sStandardVariantKey : this._sStdKey;
	};

	/**
	 * Required by the {@link sap.m.IOverflowToolbarContent} interface.
	 * Registers invalidations event which is fired when width of the control is changed.
	 *
	 * @protected
	 * @returns {{canOverflow: boolean, invalidationEvents: string[]}} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface
	 */
	SmartVariantManagementBase.prototype.getOverflowToolbarConfig = function () {
		return {
			canOverflow: false,
			invalidationEvents: ["save", "manage", "select"]
		};
	};

	/// <EVENT FORWARDING>

	SmartVariantManagementBase.prototype._prepareSaveAsKeyUserData = function (mParameters) {
		try {
			this._getContentAsync().then(function (oContent) {
				var mData = {
					"default": mParameters.def,
					executeOnSelection: mParameters.execute,
					type: this._getPersoControllerType(),
					text: mParameters.name,
					contexts: mParameters.contexts,
					content: oContent
				};

				this._fGetDataForKeyUser(mData);
				this._cleanUpSaveForKeyUser();
			}.bind(this));
		} catch (ex) {
			Log.error("'_prepareSaveAsKeyUserData' throws an exception:" + ex.message);
			this._fGetDataForKeyUser();
			this._cleanUpSaveForKeyUser();
		}
	};

	SmartVariantManagementBase.prototype._fireCancel = function (oEvent) {
		if (this._fGetDataForKeyUser) {
			this._fGetDataForKeyUser();
			this._cleanUpSaveForKeyUser();
		}
	};

	SmartVariantManagementBase.prototype._fireManageCancel = function (oEvent) {
		if (this._fGetDataForKeyUser) {
			this._fGetDataForKeyUser();
			this._cleanUpManageViewsForKeyUser();
		}
	};

	SmartVariantManagementBase.prototype._fireSelect = function (oEvent) {
		if (!this._fGetDataForKeyUser) {
			this.setModified(false);
		}

		this.fireSelect(oEvent.getParameters());
	};

	SmartVariantManagementBase.prototype._fireSave = function (oEvent) {

		var mParameters = oEvent.getParameters();
		if (this._fGetDataForKeyUser) {
			this._prepareSaveAsKeyUserData(mParameters);
			return;
		}

		if (mParameters.hasOwnProperty("execute")) {
			mParameters.exe = mParameters.execute;
		}
		if (mParameters.hasOwnProperty("public")) {
			mParameters.global = mParameters.public;
		}

		this.fireSave(mParameters);
	};

	SmartVariantManagementBase.prototype._prepareManageKeyUserData = function (mParameters) {
		var mData = {};
		var bSelectedItemDeleted = false;

		if (mParameters.hasOwnProperty("def")) {
			var sDefault = mParameters.def;
			if (sDefault !== this._oVM._sOriginalDefaultKey) {
				mData.default = sDefault;
			}
		}

		if (mParameters.hasOwnProperty("deleted")) {
			mParameters.deleted.forEach(function (sKey) {
				if (!mData[sKey]) {
					mData[sKey] = {};
				}
				mData[sKey].deleted = true;

				if (this.getSelectionKey() === sKey) {
					bSelectedItemDeleted = true;
				}
			}.bind(this));
		}

		if (mParameters.hasOwnProperty("exe")) {
			mParameters.exe.forEach(function (oEntry) {
				if (!mData[oEntry.key]) {
					mData[oEntry.key] = {};
				}
				mData[oEntry.key].executeOnSelection = oEntry.exe;
			});
		}

		if (mParameters.hasOwnProperty("fav")) {
			mParameters.fav.forEach(function (oEntry) {
				if (!mData[oEntry.key]) {
					mData[oEntry.key] = {};
				}
				mData[oEntry.key].favorite = oEntry.visible;
			});
		}

		if (mParameters.hasOwnProperty("renamed")) {
			mParameters.renamed.forEach(function (oEntry) {
				if (!mData[oEntry.key]) {
					mData[oEntry.key] = {};
				}
				mData[oEntry.key].name = oEntry.name;
			});
		}

		if (mParameters.hasOwnProperty("contexts")) {
			mParameters.contexts.forEach(function (oEntry) {
				if (!mData[oEntry.key]) {
					mData[oEntry.key] = {};
				}
				mData[oEntry.key].contexts = oEntry.contexts;
			});
		}

		if (bSelectedItemDeleted) {
			this.activateVariant(this.getStandardVariantKey());
		}

		this._fGetDataForKeyUser(mData);

		this._cleanUpManageViewsForKeyUser();
	};

	SmartVariantManagementBase.prototype._syncOriginalProperties = function (mParameters) {
		// adapt the original entries
		if (mParameters.fav) {
			mParameters.fav.forEach(function (oEntry) {
				var oItem = this._oVM._getItemByKey(oEntry.key);
				if (oItem) {
					oItem.setOriginalFavorite(oEntry.visible);
				}
			}.bind(this));
		}

		if (mParameters.renamed) {
			mParameters.renamed.forEach(function (oEntry) {
				var oItem = this._oVM._getItemByKey(oEntry.key);
				if (oItem) {
					oItem.setTitle(oEntry.name);
					oItem.setOriginalTitle(oEntry.name);
					oItem.setText(oEntry.name);
				}
			}.bind(this));
		}

		if (mParameters.exe) {
			mParameters.exe.forEach(function (oEntry) {
				var oItem = this._oVM._getItemByKey(oEntry.key);
				if (oItem) {
					oItem.setOriginalExecuteOnSelect(oEntry.exe);
				}
			}.bind(this));
		}

		if (mParameters.contexts) {
			mParameters.contexts.forEach(function (oEntry) {
				var oItem = this._oVM._getItemByKey(oEntry.key);
				if (oItem) {
					oItem.setOriginalContexts(oEntry.contexts);
				}
			}.bind(this));
		}
	};

	SmartVariantManagementBase.prototype._fireManage = function (oEvent) {
		var mParameters = oEvent.getParameters();

		if (this._fGetDataForKeyUser) {
			this._prepareManageKeyUserData(mParameters);
		} else {
			this.fireManage(mParameters);

			this._syncOriginalProperties(mParameters);
		}
	};

	///<OVERWRITES>
	SmartVariantManagementBase.prototype.getFocusDomRef = function () {
		if (this._oVM) {
			return this._oVM.oVariantPopoverTrigger.getFocusDomRef();
		}

		return null;
	};

	SmartVariantManagementBase.prototype.getManageDialog = function () {
		if (this._oVM) {
			return this._oVM.oManagementDialog;
		}

		return null;
	};

	/**
	 * Retrieves all variants.
	 * @public
	 * @returns {array} All variants. In case the model is not yet set, an empty array will be returned.
	 */
	SmartVariantManagementBase.prototype.getVariants = function () {
		return this._oVM.getItems();
	};

	SmartVariantManagementBase.prototype.getTitle = function () {
		return this._oVM.getTitle();
	};

	SmartVariantManagementBase.prototype.setPopoverTitle = function (sTitle) {
		return this._oVM.setPopoverTitle(sTitle);
	};

	SmartVariantManagementBase.prototype.setEditable = function (bValue) {
		this.setProperty("editable", bValue);
		return this._oVM.setShowFooter(bValue);
	};

	SmartVariantManagementBase.prototype.setShowExecuteOnSelection = function (bValue) {
		this.setProperty("showExecuteOnSelection", bValue);
		this._oVM.setSupportApplyAutomatically(bValue);
		return this;
	};

	SmartVariantManagementBase.prototype.setShowSetAsDefault = function (bValue) {
		this.setProperty("showSetAsDefault", bValue);
		this._oVM.setSupportDefault(bValue);
		return this;
	};

	SmartVariantManagementBase.prototype.setExecuteOnSelectionForStandardDefault = function (bValue) {
		this.setProperty("executeOnSelectionForStandardDefault", bValue);
		this._oVM.setExecuteOnSelectionForStandardDefault(bValue);
		return this;
	};

	SmartVariantManagementBase.prototype.setDisplayTextForExecuteOnSelectionForStandardVariant = function (sValue) {
		this.setProperty("displayTextForExecuteOnSelectionForStandardVariant", sValue);
		this._oVM.setDisplayTextForExecuteOnSelectionForStandardVariant(sValue);
		return this;
	};

	SmartVariantManagementBase.prototype.setInErrorState = function (bValue) {
		var oTitle = this._oVM.getTitle();
		if (bValue && oTitle && !oTitle.getText()) {
			oTitle.setText(this._determineStandardVariantName());
		}
		this.setProperty("inErrorState", bValue);
		this._oVM.setInErrorState(bValue);
		return this;
	};

	SmartVariantManagementBase.prototype.getInErrorState = function () {
		return this._oVM.getInErrorState();
	};

	SmartVariantManagementBase.prototype._updateLayerSpecificInformations = function () {
		this.getVariants().forEach(function (oItem) {
			var oVariant = this._getVariantById(oItem.getKey());
			if (oVariant) {
				oItem.setRemove(oVariant.isDeleteEnabled(this._sLayer));
				oItem.setRename(oVariant.isRenameEnabled(this._sLayer));
			}
		}.bind(this));
	};

	SmartVariantManagementBase.prototype.setEditable = function (bValue) {
		this._oVM.setProperty("showFooter", bValue);
		return this;
	};

	/**
	 * Sets the new selected variant.
	 * @public
	 * @param {string} sKey - Key of the variant that should be selected.
	 */
	SmartVariantManagementBase.prototype.setCurrentVariantKey = function (sKey) {
		this._oVM.setSelectedKey(sKey);
	};

	/**
	 * Gets the currently selected variant key.
	 * @public
	 * @returns {string} Key of the currently selected variant. In case the model is not yet set <code>null</code> will be returned.
	 */
	SmartVariantManagementBase.prototype.getCurrentVariantKey = function () {
		return this._oVM.getSelectedKey();
	};

	SmartVariantManagementBase.prototype.getModified = function () {
		return this._oVM.getModified();
	};

	SmartVariantManagementBase.prototype.setModified = function (bFlag) {
		this._oVM.setModified(bFlag);
	};

	SmartVariantManagementBase.prototype._enableManualVariantKey = function (bValue) {
		this._oVM._setShowManualVariantKey(bValue);
	};

	SmartVariantManagementBase.prototype.refreshTitle = function () {
		this._oVM.refreshTitle();
	};

	/// </OVERWRITES>

	/**
	 * Registration of a callback function. The provided callback function is executed to check if apply automatically on standard variant should be considered.
	 * @private
	 * @ui5-restricted sap.fe
	 * @since 1.103
	 * @param {function} fCallBack Called when standard variant must be applied. It determines if apply automatically on standard variant should be considered.
	 * As a convenience the current variant will be passed to the callback. This variant instance may not be changed in any ways. It is only intended to provide certain variant information.
	 * @returns {this} Reference to this in order to allow method chaining.
	 */
	SmartVariantManagementBase.prototype.registerApplyAutomaticallyOnStandardVariant = function (fCallBack) {
		this._fRegisteredApplyAutomaticallyOnStandardVariant = fCallBack;

		return this;
	};

	/**
	 * Retrieves the apply automatically state for a variant.
	 * @private
	 * @ui5-restricted sap.ui.comp
	 * @param {object} oVariant the inner variant object
	 * @returns {boolean} apply automatically state
	 */
	SmartVariantManagementBase.prototype.getApplyAutomaticallyOnVariant = function (oVariant) {
		var bExecuteOnSelection = oVariant.executeOnSelect;

		if (this._fRegisteredApplyAutomaticallyOnStandardVariant && this.getDisplayTextForExecuteOnSelectionForStandardVariant() && (oVariant.key === this._oVM.getStandardVariantKey())) {
			try {
				bExecuteOnSelection = this._fRegisteredApplyAutomaticallyOnStandardVariant(oVariant);
			} catch (ex) {
				Log.error("callback for determination of apply automatically on standard variant failed");
			}
		}

		return bExecuteOnSelection;
	};


	SmartVariantManagementBase.prototype.getPersonalizableControlPersistencyKey = function () {
		if (this.isPageVariant()) {
			return this.getPersistencyKey();
		}

		var aPersoInfo = this._getAllPersonalizableControls();
		if (aPersoInfo && (aPersoInfo.length === 1)) {
			return this._getControlPersKey(aPersoInfo[0]);
		}

		return null;
	};

	SmartVariantManagementBase.prototype.addVariant = function (oVariant, bIsDefault) {
		this._createVariantItem(oVariant);

		if (bIsDefault) {
			this.setDefaultVariantId(oVariant.getVariantId());
		}
	};

	SmartVariantManagementBase.prototype.removeVariant = function (mProperties) {

		if (mProperties.variantId) {
			var oVariantItem = this.getItemByKey(mProperties.variantId);
			if (oVariantItem) {
				this.removeVariantItem(oVariantItem);
				oVariantItem.destroy();
			}

			delete this._mVariants[mProperties.variantId];
		}

		if (mProperties.previousVariantId) {
			this.activateVariant(mProperties.previousVariantId);
		}

		if (mProperties.previousDefault) {
			this.setDefaultVariantId(mProperties.previousDefault);
		}
	};

	SmartVariantManagementBase.prototype.removeWeakVariant = function (mProperties) {

		if (mProperties.variantId) {
			var oVariantItem = this.getItemByKey(mProperties.variantId);
			if (oVariantItem) {
				this.removeVariantItem(oVariantItem);
				oVariantItem.destroy();
			}

			delete this._mVariants[mProperties.variantId];
		}

		if (mProperties.previousVariantId) {
			this.setInitialSelectionKey(mProperties.previousVariantId);
		}

		if (mProperties.previousDirtyFlag) {
			this.setModified(mProperties.previousDirtyFlag);
		}

		if (mProperties.previousDefault) {
			this.setDefaultVariantId(mProperties.previousDefault);
		}
	};

	SmartVariantManagementBase.prototype.updateVariant = function (oVariant) {

		var oVariantItem;

		if (oVariant) {
			oVariantItem = this.getItemByKey(oVariant.getVariantId());
			if (oVariantItem) {

				oVariantItem.setExecuteOnSelection(oVariant.getExecuteOnSelection());
				oVariantItem.setExecuteOnSelect(oVariant.getExecuteOnSelection());
				oVariantItem.setOriginalExecuteOnSelect(oVariant.getExecuteOnSelection());

				oVariantItem.setFavorite(oVariant.getFavorite());
				oVariantItem.setOriginalFavorite(oVariant.getFavorite());

				oVariantItem.setTitle(oVariant.getText("variantName"));
				oVariantItem.setOriginalTitle(oVariant.getText("variantName"));
				oVariantItem.setText(oVariant.getText("variantName"));

				if (oVariant.getContexts) {
					oVariantItem.setContexts(oVariant.getContexts());
					oVariantItem.setOriginalContexts(oVariant.getContexts());
				}
			}
		}
	};

	SmartVariantManagementBase.prototype.activateVariant = function (sVariantId) {
		this.setCurrentVariantKey(sVariantId);

		this.setModified(false);

		this.fireSelect({ key: sVariantId });
	};

	SmartVariantManagementBase.prototype.getAllVariants = function () {

		var aItems = this._oVM.getItems();

		if (!aItems || (aItems.length < 1)) {
			// error case
			return [];
		}

		var aVariantList = [];
		aItems.forEach(function (oItem) {
			if (oItem.getVisible()) {
				aVariantList.push(this._getVariantById(oItem.getKey()));
			}
		}.bind(this));

		return aVariantList;
	};

	SmartVariantManagementBase.prototype.getDefaultVariantId = function () {
		return this.getDefaultVariantKey();
	};
	SmartVariantManagementBase.prototype.setDefaultVariantId = function (sVariantId) {
		this.setDefaultVariantKey(sVariantId);	// inform VM about the new default
	};

	SmartVariantManagementBase.prototype.getPresentVariantId = function () {
		return this.getCurrentVariantId() ? this.getCurrentVariantId() : this.STANDARDVARIANTKEY;
	};

	//deprecated
	SmartVariantManagementBase.prototype.getPresentVariantText = function () {
		return this._oVM.getSelectedVariantText(this.getPresentVariantId());
	};

	SmartVariantManagementBase.prototype.getPresentVariantContent = function () {
		return this._getContentAsync();
	};

	SmartVariantManagementBase.prototype._getPersoController = function () {
		return this._oPersoControl;
	};

	SmartVariantManagementBase.prototype._getPersoControllerType = function () {
		if (this.isPageVariant()) {
			return "page";
		}

		var aPersoInfo = this._getAllPersonalizableControls();
		if (aPersoInfo && (aPersoInfo.length === 1)) {
			return aPersoInfo[0].type;
		}

		return null;
	};


	SmartVariantManagementBase.prototype._getViewByName = function (sViewName) {
		var sText, sTrimName = sViewName.trim();
		var oItems = this.getVariants();
		for (var i = 0; i < oItems.length; i++) {
			sText = oItems[i].getText().trim();
			if (sText === sTrimName) {
				return oItems[i];
			}
		}

		return null;
	};

	/**
	 * Retrieves view id for a given view name.
	 * The first match will be returned.
	 * @protected
	 * @ui5-restricted sap.ui.comp
	 * @param {string} sViewName the look-up view name
	 * @returns {string} view id, if a matching view name was found, <code>null</code> otherwise
	 */
	SmartVariantManagementBase.prototype.getViewIdByName = function (sViewName) {
		var oVariantItem = this._getViewByName(sViewName);
		return oVariantItem ? oVariantItem.getKey() : null;
	};

	SmartVariantManagementBase.prototype._isDuplicateSaveAs = function (sValue) {
		var sTrimName = sValue.trim();
		if (!sTrimName) {
			return true;
		}

		var sText = this._determineStandardVariantName();
		if (sText === sTrimName) {
			return true;
		}

		return this._getViewByName(sTrimName) ? true : false;
	};

	SmartVariantManagementBase.prototype.isNameDuplicate = function (sName) {
		var sValue = sName.trim();
		return this._isDuplicateSaveAs(sValue);
	};

	SmartVariantManagementBase.prototype.isNameTooLong = function (sName) {
		var sValue = sName.trim();
		return (sValue.length > MVariantManagement.MAX_NAME_LEN);
	};

	SmartVariantManagementBase.prototype.setStandardItemText = function (sName) {
		this.setProperty("standardItemText", sName);
		return this;
	};

	SmartVariantManagementBase.prototype._executeOnSelectForStandardVariantByXML = function (bSelect) {
		this.bExecuteOnSelectForStandardViaXML = bSelect;
	};

	SmartVariantManagementBase.prototype.getExecuteOnSelectForStandardVariant = function () {
		var bExecForStandardVariant = false;
		var oStandardVariant = this.getItemByKey(this.getStandardVariantKey());
		if (oStandardVariant) {
			bExecForStandardVariant = oStandardVariant.getExecuteOnSelection();
		}

		return bExecForStandardVariant || this.bExecuteOnSelectForStandardViaXML;
	};

	SmartVariantManagementBase.prototype._reapplyExecuteOnSelectForStandardVariantItem = function (bSelect) {
		var sStdKey = this.getStandardVariantKey();
		if (this._oVM) {
			var oItem = this._oVM._getItemByKey(sStdKey);
			if (oItem) {
				oItem.setExecuteOnSelect(bSelect);
				oItem.setOriginalExecuteOnSelect(bSelect);
			}
		}
	};

	SmartVariantManagementBase.prototype.openManageViewsDialogForKeyUser = function (mProperties, fCallBack, bTesting) {
		this._sLayer = mProperties.layer;
		this._fGetDataForKeyUser = fCallBack;

		this._updateLayerSpecificInformations();

		var bAlwaysDestroy = true;
		if (bTesting) {
			bAlwaysDestroy = false;
		}
		this._oVM.openManagementDialog(bAlwaysDestroy, mProperties.rtaStyleClass, mProperties.contextSharingComponentContainer);
	};

	SmartVariantManagementBase.prototype.openSaveAsDialogForKeyUser = function (sStyleClass, fCallBack, oRolesComponentContainer) {
		this._fGetDataForKeyUser = fCallBack;
		this._oVM.openSaveAsDialog(sStyleClass, oRolesComponentContainer);
	};

	SmartVariantManagementBase.prototype._cleanUpSaveForKeyUser = function () {
		if (this._oRolesComponentContainer) {
			this.oSaveDialog.removeContent(this._oRolesComponentContainer);
		}

		this._cleanUpKeyUser();
	};

	SmartVariantManagementBase.prototype._destroyManageDialog = function () {
		if (this._oVM) {
			this._oVM.destroyManageDialog();
		}
	};

	SmartVariantManagementBase.prototype._cleanUpManageViewsForKeyUser = function () {
		this._destroyManageDialog();

		this._cleanUpKeyUser();
	};

	SmartVariantManagementBase.prototype._cleanUpKeyUser = function () {

		this.setShowShare(this._bShowShare);

		this._fGetDataForKeyUser = null;
		this._sLayer = null;

		this._oRolesComponentContainer = null;
	};

	SmartVariantManagementBase.prototype._getContentAsync = function () {
		return Promise.resolve(this._fetchContentAsync());
	};

	SmartVariantManagementBase.prototype._checkUpdate = function () {
		this._oVM.getModel("$mVariants").checkUpdate(true);
	};

	/**
	 * Indicates the design mode was entered.
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	SmartVariantManagementBase.prototype.enteringDesignMode = function() {
		this.setDesignTimeMode(true);
	};
	/**
	 * Indicates the design mode was left.
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	SmartVariantManagementBase.prototype.leavingDesignMode = function() {
		this.setDesignTimeMode(false);
	};

	SmartVariantManagementBase.prototype.setDesignTimeMode = function (bValue) {
		this._oVM.setDesignMode(bValue);
		return this._oVM.setShowFooter(!bValue);
	};

	// exit destroy all controls created in init
	SmartVariantManagementBase.prototype.exit = function () {
		this._oVM.detachManage(this._fireManage, this);
		this._oVM.detachSelect(this._fireSelect, this);
		this._oVM.detachSave(this._fireSave, this);
		this._oVM.detachCancel(this._fireCancel, this);
		this._oVM.detachManageCancel(this._fireManageCancel, this);

		if (this._oManagedObjectModel) {
			this._oManagedObjectModel.destroy();
			this._oManagedObjectModel = undefined;
		}

		Control.prototype.exit.apply(this, arguments);

		this._oVM = undefined;
		this._fRegisteredApplyAutomaticallyOnStandardVariant = null;
		this.oResourceBundle = undefined;
	};

	return SmartVariantManagementBase;
});