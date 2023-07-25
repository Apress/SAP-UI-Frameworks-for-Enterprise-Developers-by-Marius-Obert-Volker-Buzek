/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides control sap.ui.comp.smartvariants.SmartVariantManagementUi2.
sap.ui.define([
	'sap/ui/comp/library', './PersonalizableInfo', 'sap/ui/comp/variants/VariantItem', 'sap/ui/comp/variants/VariantManagement', "sap/base/Log"
], function(library, PersonalizableInfo, VariantItem, VariantManagement, Log) {
	"use strict";

	/**
	 * Constructor for a new SmartVariantManagementUi2.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The SmartVariantManagementUi2 control is a specialization of the {@link sap.ui.comp.variants.VariantManagement VariantManagement}
	 *        control and communicates with the Ui2 personalization layer to manage the variants.
	 *        <b>Note:</b> The <code>sap.ui.comp.smartvariants.SmartVariantManagementUi2</code> control does not support all the functionality of the <code>sap.ui.comp.variants.VariantManagement</code> control.
	 *        Especially these properties are not supported:<br>
	 *        <ul>
	 *            <li><code>showExecuteOnSelection</code></li>
	 *            <li><code>showCreateTile</code></li>
	 *            <li><code>showShare</code></li>
	 *            <li><code>useFavorites</code></li>
	 *            <li><code>lifecycleSupport</code></li>
	 *            <li><code>inErrorState</code></li>
	 *        </ul>
	 * @extends sap.ui.comp.variants.VariantManagement
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartvariants.SmartVariantManagementUi2
	 */
	var SmartVariantManagementUi2 = VariantManagement.extend("sap.ui.comp.smartvariants.SmartVariantManagementUi2", /** @lends sap.ui.comp.smartvariants.SmartVariantManagementUi2.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			aggregations: {

				/**
				 * All controls that rely on variant handling have to be added to this aggregation. The only consumer currently known is the
				 * <code>FilterBar</code> control.
				 */
				personalizableControl: {
					type: "sap.ui.comp.smartvariants.PersonalizableInfo",
					multiple: false
				}
			},
			events: {

				/**
				 * Once the <code>SmartVariantManagementUi2</code> control has been initialized, and especially after retrieving the variants via
				 * the UI2 personalization service, the registered consumer will be notified that this phase has completed
				 */
				initialise: {},

				/**
				 * Fired after a variant is saved. This event can be used to retrieve the id of the saved variant.
				 */
				afterSave: {}
			}
		},
		renderer: {
			apiVersion: 2
		}

	});

	SmartVariantManagementUi2.prototype.init = function() {
		VariantManagement.prototype.init.apply(this); // Call base class

		this._oStandardVariant = null;
		this._oPersController = null;
		this._sKeyName = null;

		this._oContainer = null;
		this._oVariantSet = null;

		if (this.setLifecycleSupport) {
			this.setLifecycleSupport(false);
		}
		this._setBackwardCompatibility(false);
	};

	/**
	 * Determines if the <code>SmartVariantManagementUi3</code> instance is a page variant.
	 * @public
	 * @return {boolean} always returns <code>false</code>
	 */
	SmartVariantManagementUi2.prototype.isPageVariant = function() {
		return false;
	};

	/**
	 * Retrieves the variant content.
	 * @public
	 * @param {sap.ui.core.Control} oControl current control
	 * @param {string} sKey the variant key
	 * @returns {object} json object representing the content of the variant
	 */
	SmartVariantManagementUi2.prototype.getVariantContent = function(oControl, sKey) {
		var oContent = null;

		if (sKey === this.STANDARDVARIANTKEY) {
			oContent = this._getStandardVariant();

		} else {

			/* eslint-disable no-lonely-if */
			if (this._oVariantSet) {
				var oVariant = this._oVariantSet.getVariant(sKey);
				if (oVariant) {
					oContent = this._getContent(oVariant);
				}
			}
			/* eslint-enable no-lonely-if */
		}

		return oContent;
	};

	/**
	 * Retrieves the current variant ID. For a standard variant, an empty string is returned.
	 * @public
	 * @returns {string} Current variant ID
	 */
	SmartVariantManagementUi2.prototype.getCurrentVariantId = function() {
		var sKey = "";
		var oItem = this._getSelectedItem();
		if (oItem) {
			sKey = oItem.getKey();
			if (sKey === this.STANDARDVARIANTKEY) {
				sKey = "";
			}
		}

		return sKey;
	};

	/**
	 * Sets the current variant ID. In case an invalid ID is passed, a standard variant is set.
	 * @public
	 * @param {string} sVariantId ID of the variant
	 * @param {boolean} bDoNotApplyVariant If set to <code>true</code>, the <code>applyVariant</code> method is not executed yet. Relevant during
	 *        navigation, when called before the initialise event has been executed
	 */
	SmartVariantManagementUi2.prototype.setCurrentVariantId = function(sVariantId, bDoNotApplyVariant) {
		var oContent;

		var sId = sVariantId;
		if (!sId) {
			sId = this.STANDARDVARIANTKEY;
		} else {
			/* eslint-disable no-lonely-if */
			if (!this.getItemByKey(sId)) {
				sId = this.STANDARDVARIANTKEY;
			}
			/* eslint-enable no-lonely-if */
		}

		if (this._oVariantSet) {

			oContent = this.getVariantContent(this._oPersController, sId);
			if (oContent) {
				this._setSelectionByKey(sId); // set the current selected variant
				if (bDoNotApplyVariant !== true) {
					this._applyVariantContent(oContent);
				}
			}
		}
	};

	/**
	 * Registers all controls interested and relying on variant handling. Each control has to be registered separately.
	 * @public
	 * @param {sap.ui.comp.smartvariants.PersonalizableInfo} oCurrentControlInfo control providing the required aggregation for flex-layer
	 * @returns {sap.ui.comp.smartvariants.SmartVariantManagementUi2} the current instance
	 */
	SmartVariantManagementUi2.prototype.addPersonalizableControl = function(oCurrentControlInfo) {
		this.setAggregation("personalizableControl", oCurrentControlInfo, true);

		if (oCurrentControlInfo.getControl()) {
			this._oPersController = sap.ui.getCore().byId(oCurrentControlInfo.getControl());
		}

		this._sKeyName = oCurrentControlInfo.getKeyName();
		return this;
	};

	/**
	 * Initializes the UI2 personalization layer by retrieving the list of variants. Once the initialization has been completed, the control for
	 * personalization is informed via the initialise event.
	 * @public
	 */
	SmartVariantManagementUi2.prototype.initialise = function() {

		var sContainerKey = this._getPersistencyKey();

		if (!sContainerKey) {
			Log.warning("PersistencyKey not set");
			this.fireEvent("initialise");

			return;
		}

		if (sap.ushell && sap.ushell.Container) {

			var that = this;
			sap.ushell.Container.getService("Personalization").getContainer(sContainerKey, {
				validity: Infinity
			}).fail(function() {
				Log.error("Loading personalization container failed");
				that._setErrorValueState(that.oResourceBundle.getText("VARIANT_MANAGEMENT_READ_FAILED"));

				that.fireEvent("initialise");
			}).done(function(oContainer) {
				that._readPersonalization(oContainer);
				that.fireEvent("initialise");

				that._setStandardVariant();

				that._setSelectedVariant();
			});

			return;
		}

		Log.error("Could not obtain the personalization container");
		this._setErrorValueState(this.oResourceBundle.getText("VARIANT_MANAGEMENT_READ_FAILED"));

		this.fireEvent("initialise");
	};

	/**
	 * Obtains from the variant management the current selected entry ands applies the corresponding variant. In case nothing was selected variant
	 * management returns null -> no variant will be applied
	 * @private
	 */
	SmartVariantManagementUi2.prototype._setSelectedVariant = function() {
		var oVariant = null;

		if (this._oVariantSet) { // in case a variant is currently selected, re-apply this variant
			var sKey = this.getSelectionKey();
			if (sKey) {
				oVariant = this._oVariantSet.getVariant(sKey);

				if (oVariant) {
					this._applyVariant(oVariant);
				}
			}
		}
	};

	/**
	 * Create the variant items.
	 * @private
	 */
	SmartVariantManagementUi2.prototype._reCreateVariantEntries = function() {

		var n = null;
		var sVariantKey = null;
		var oVariant, oVariantItem;

		this.removeAllVariantItems();

		if (this._oVariantSet) {
			var mVariantList = this._oVariantSet.getVariantNamesAndKeys();
			if (mVariantList) {
				for (n in mVariantList) {
					if (n) {

						oVariantItem = new VariantItem({
							text: n,
							key: mVariantList[n]
						});
						this.addVariantItem(oVariantItem);
					}
				}

				sVariantKey = this._oVariantSet.getCurrentVariantKey();
				oVariant = this._oVariantSet.getVariant(sVariantKey);
				if (oVariant) {
					this.setDefaultVariantKey(sVariantKey); // set the default variant
					this.setInitialSelectionKey(sVariantKey); // set the current selected variant
				}
			}
		}
	};

	SmartVariantManagementUi2.prototype._getVariantSetAdapter = function(oContainer) {
		if (!oContainer) {
			return Promise.resolve(null);
		}
		return new Promise(function(resolve) {
			sap.ui.require(["sap/ushell/services/personalization/VariantSetAdapter"],
					       function(fnVariantSetAdapter) {
				resolve(new fnVariantSetAdapter(oContainer));
			});
		});
	};

	/**
	 * Reads the variant container and create the variant items.
	 * @private
	 */
	SmartVariantManagementUi2.prototype._createVariantEntries = function() {

		return this._getVariantSetAdapter(this._oContainer).then(function(oVariantSetAdapter) {
			if (oVariantSetAdapter) {
				this._oVariantSet = oVariantSetAdapter.getVariantSet("filterBarVariantSet");
				if (this._oVariantSet) {
					this._reCreateVariantEntries();
				} else {
					this._oVariantSet = oVariantSetAdapter.addVariantSet("filterBarVariantSet");
				}
			}
		}.bind(this));
	};

	/**
	 * Reads the personalization.
	 * @private
	 * @param {object} oContainer personalization conmteiner
	 */
	SmartVariantManagementUi2.prototype._readPersonalization = function(oContainer) {

		this._oContainer = oContainer;

		if (this._oContainer) {
			this._createVariantEntries();
		}
	};

	/**
	 * Handling the save of the personalization container.
	 * @private
	 */
	SmartVariantManagementUi2.prototype._savePersonalizationContainer = function() {

		var that = this;

		if (this._oContainer) {

			this._oContainer.save() // save the whole container!
			.fail(function() {
				Log.error("Saving personalization data failed");
				that._setErrorValueState(that.oResourceBundle.getText("VARIANT_MANAGEMENT_SAVE_FAILED"));

			}).done(function() {
				// Before the next save is triggered the last one has to be finished.
				// Could be done by disabling the save button during the save.
				Log.info("Saving personalization data succeeded");
				that.fireEvent("afterSave");
			});
		}
	};

	/**
	 * Eventhandler for the <code>SmartVariantManagementUi2</code> save event.
	 * @private
	 * @param {object} oVariantInfo Describes the variant to be saved
	 */
	SmartVariantManagementUi2.prototype.fireSave = function(oVariantInfo) {

		var oVariant = null, oNewVariant = null;
		var sVariantKey;

		if (!this._oVariantSet) {
			return;
		}

		if (oVariantInfo) {

			if (oVariantInfo.overwrite) {
				if (oVariantInfo.key) {
					oVariant = this._oVariantSet.getVariant(oVariantInfo.key);
				}
			} else {
				/* eslint-disable no-lonely-if */
				if (oVariantInfo.name) {
					oVariant = this._oVariantSet.addVariant(oVariantInfo.name);
					oNewVariant = oVariant; // indicates that we have to adapt the variant management key

					sVariantKey = oNewVariant.getVariantKey();
					this.replaceKey(oVariantInfo.key, sVariantKey);

					this.setInitialSelectionKey(sVariantKey);
				}
				/* eslint-enable no-lonely-if */
			}

			if (oVariant) {

				this.fireEvent("save", oVariantInfo);
				var oVariantContent = this._fetchVariant();
				if (oVariantContent) {

					oVariant.setItemValue("filterBarVariant", oVariantContent.filterBarVariant);
					oVariant.setItemValue("filterbar", oVariantContent.filterbar);
					oVariant.setItemValue("basicSearch", "");
					if (oVariantContent.basicSearch) {
						oVariant.setItemValue("basicSearch", oVariantContent.basicSearch);
					}

					sVariantKey = oVariant.getVariantKey();
					if (oVariantInfo.def) {
						if (sVariantKey) {
							this._oVariantSet.setCurrentVariantKey(sVariantKey);
						}
					} else {
						var sDefaultVariantKey = this._oVariantSet.getCurrentVariantKey();
						if (sVariantKey === sDefaultVariantKey) {
							this._oVariantSet.setCurrentVariantKey(null);
						}
					}
				}

				this._savePersonalizationContainer();
				// if (oNewVariant) {
				// sVariantKey = oNewVariant.getVariantKey();
				// this.replaceKey(oVariantInfo.key, sVariantKey);
				//
				// this.setInitialSelectionKey(sVariantKey);
				// }
			}
		}

	};

	/**
	 * Stores the STANDARD variant.
	 * @private
	 */
	SmartVariantManagementUi2.prototype._setStandardVariant = function() {

		if (this._oPersController && this._oPersController.fireBeforeVariantSave) {
			this._oPersController.fireBeforeVariantSave(VariantManagement.STANDARD_NAME);
		}

		this._oStandardVariant = this._fetchVariant();
	};

	/**
	 * returns a previously stored representation of the standard variant. Only relevant for the UI2 personalization-service
	 * @private
	 * @returns {object} json compatible object representing the standard variant
	 */
	SmartVariantManagementUi2.prototype._getStandardVariant = function() {
		return this._oStandardVariant;
	};
	SmartVariantManagementUi2.prototype.getStandardVariant = function() {
		return this._getStandardVariant();
	};
	/**
	 * Workaround for missing Variant feature 'setVariantName' with U2 < 1.24.0.
	 * @private
	 * @param {object} oVariant the original variant
	 * @param {string} sVariantKey the key of the original variant
	 * @param {string} sNewName the new name of the original variant
	 */
	SmartVariantManagementUi2.prototype._setVariantName = function(oVariant, sVariantKey, sNewName) {

		var sKey;
		var aFieldsAndValues, aFields;

		if (this._oVariantSet) {
			var oNewVariant = this._oVariantSet.addVariant(sNewName);

			aFieldsAndValues = oVariant.getItemValue("filterBarVariant");
			oNewVariant.setItemValue("filterBarVariant", aFieldsAndValues);

			aFields = oVariant.getItemValue("filterbar");
			oNewVariant.setItemValue("filterbar", aFields);

			sKey = this._oVariantSet.getCurrentVariantKey();
			if (sKey === sVariantKey) {
				this._oVariantSet.setCurrentVariantKey(oNewVariant.getVariantKey());
			}
			this._oVariantSet.delVariant(sVariantKey);

			sKey = oNewVariant.getVariantKey();
			this.replaceKey(sVariantKey, sKey);

			this.setInitialSelectionKey(sKey);

		}

	};

	SmartVariantManagementUi2.prototype._getVariantNamesAndKeys = function() {
		return this._oVariantSet.getVariantNamesAndKeys();
	};

	/**
	 * Eventhandler for the <code>SmartVariantManagementUi2</code> manage event.
	 * @private
	 * @param {object} oVariantInfo Describes the variants, which will be deleted/renamed
	 */
	SmartVariantManagementUi2.prototype.fireManage = function(oVariantInfo) {

		var i;
		var renamed = null, deleted = null;
		var oVariant;

		if (!this._oVariantSet) {
			return;
		}

		if (oVariantInfo) {
			renamed = oVariantInfo.renamed;
			deleted = oVariantInfo.deleted;

			if (renamed) {
				for (i = 0; i < renamed.length; i++) {
					oVariant = this._oVariantSet.getVariant(renamed[i].key);
					if (oVariant) {
						if (oVariant.setVariantName) { // available with 1.24.0
							oVariant.setVariantName(renamed[i].name);
						} else {
							this._setVariantName(oVariant, renamed[i].key, renamed[i].name); // workaround for missing variant feature
							// 'setVariantName'
						}
					}
				}
			}

			if (deleted) {
				var sVariantKey = this._oVariantSet.getCurrentVariantKey();
				for (i = 0; i < deleted.length; i++) {
					oVariant = this._oVariantSet.getVariant(deleted[i]);
					if (oVariant) {
						if (sVariantKey && sVariantKey === oVariant.getVariantKey()) {
							this._oVariantSet.setCurrentVariantKey(null);
						}

						this._oVariantSet.delVariant(deleted[i]);
					}
				}
			}

			if (oVariantInfo.def) {
				oVariant = this._oVariantSet.getVariant(oVariantInfo.def);
				if (oVariant || (oVariantInfo.def === this.STANDARDVARIANTKEY)) {
					this._oVariantSet.setCurrentVariantKey(oVariantInfo.def);
				}
			}

			if ((deleted && deleted.length > 0) || (renamed && renamed.length > 0) || (oVariantInfo.def)) {
				this._savePersonalizationContainer();
			}
		}

	};

	/**
	 * Eventhandler for the <code>SmartVariantManagementUi2</code> select event.
	 * @private
	 * @param {object} oVariantInfo Describes the selected variant
	 */
	SmartVariantManagementUi2.prototype.fireSelect = function(oVariantInfo) {

		var oVariant = null;

		if (oVariantInfo && oVariantInfo.key) {

			if (this._oVariantSet) {

				if (oVariantInfo.key === this.STANDARDVARIANTKEY) {
					oVariant = this._getStandardVariant();
				} else {
					oVariant = this._oVariantSet.getVariant(oVariantInfo.key);
				}
			}
		}

		if (oVariant) {
			this._applyVariant(oVariant);
		}
	};

	/**
	 * Retrieves variant content.
	 * @private
	 * @param {object} oVariant json object representing the variant data
	 * @returns {object} the variant content
	 */
	SmartVariantManagementUi2.prototype._getContent = function(oVariant) {
		var oContent = null;

		if (oVariant) {
			if (oVariant.getItemValue) {
				oContent = {
					filterbar: oVariant.getItemValue("filterbar"),
					filterBarVariant: oVariant.getItemValue("filterBarVariant")
				};

				var sBasicSearch = oVariant.getItemValue("basicSearch");
				if (sBasicSearch) {
					oContent.basicSearch = sBasicSearch;
				}
			} else {
				oContent = oVariant; // STANDARD variant
			}
		}

		return oContent;

	};

	/**
	 * Apply a variant.
	 * @private
	 * @param {object} oVariant json object representing the variant data
	 */
	SmartVariantManagementUi2.prototype._applyVariant = function(oVariant) {

		var oContent = this._getContent(oVariant);

		this._applyVariantContent(oContent);
	};

	/**
	 * Apply a variant.
	 * @private
	 * @param {object} oContent json object representing the variant data
	 */
	SmartVariantManagementUi2.prototype._applyVariantContent = function(oContent) {

		if (oContent && this._oPersController && this._oPersController.applyVariant) {
			this._oPersController.applyVariant(oContent);
		}
	};

	/**
	 * Fetch a variant.
	 * @private
	 * @returns {object} json object representing the content of a variant
	 */
	SmartVariantManagementUi2.prototype._fetchVariant = function() {

		if (this._oPersController && this._oPersController.fetchVariant) {
			return this._oPersController.fetchVariant();
		}

		return null;
	};

	/**
	 * Retrieves the persistency key.
	 * @private
	 * @returns {string} persistency key value
	 */
	SmartVariantManagementUi2.prototype._getPersistencyKey = function() {

		if (this._oPersController && this._sKeyName) {
			return this._oPersController.getProperty(this._sKeyName);
		}

		return null;
	};

	/**
	 * Sets an error state on the variant management control.
	 * @private
	 * @param {string} sText describing the error reason
	 */
	SmartVariantManagementUi2.prototype._setErrorValueState = function(sText) {
		this.setEnabled(false);
	};

	SmartVariantManagementUi2.prototype.exit = function() {
		VariantManagement.prototype.exit.apply(this, arguments);

		this._oStandardVariant = null;
		this._oPersController = null;
		this._sKeyName = null;

		this._oContainer = null;
		this._oVariantSet = null;
	};

	// Hide the following sap.ui.comp.variants.VariantManagement functionality in JDoc
	/**
	 * @name sap.ui.comp.variants.VariantsManagement#showExecuteOnSelection
	 * @private
	 */

	/**
	 * @name sap.ui.comp.variants.VariantsManagement#showCreateTile
	 * @private
	 */

	/**
	 * @name sap.ui.comp.variants.VariantsManagement#showShare
	 * @private
	 */

	/**
	 * @name sap.ui.comp.variants.VariantsManagement#useFavorites
	 * @private
	 */

	/**
	 * @name sap.ui.comp.variants.VariantsManagement#lifecycleSupport
	 * @private
	 */

	/**
	 * @name sap.ui.comp.variants.VariantsManagement#inErrorState
	 * @private
	 */

	return SmartVariantManagementUi2;

});