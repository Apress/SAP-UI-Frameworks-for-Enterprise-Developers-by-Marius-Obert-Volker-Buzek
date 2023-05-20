/*
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */

sap.ui.define(["sap/ui/base/Object", "sap/ui/generic/app/util/ModelUtil"], function(BaseObject, ModelUtil) {
	"use strict";

	/**
	 * Constructor for meta-model access class.
	 *
	 * @public
	 * @class The class provides access to information on draft handling that is available in the
	 *        OData service's metadata as it interprets draft-specific annotations.
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.30.0
	 * @alias sap.ui.generic.app.transaction.DraftContext
	 * @param {sap.ui.model.odata.ODataModel} oModel The OData model currently used
	 * @throws {Error} If no model is handed over as input parameter
	 */
	var DraftContext = BaseObject.extend("sap.ui.generic.app.transaction.DraftContext", {
		metadata: {
			publicMethods: [
				"isDraftEnabled", "isDraftRoot", "hasDraft", "hasDraftRoot", "hasDraftValidationFunction", "hasDraftPreparationAction", "isTechnicalKey", "isSemanticKey", "getSemanticKey", "checkUpdateOnChange",
				"getODataDraftFunctionImportName", "hasDraftAdministrativeData", "hasSiblingEntity", "destroy", "hasPreserveChanges"
			]
		},

		constructor: function(oModel) {
			// model is a mandatory parameter.
			if (!oModel) {
				throw new Error("No model");
			}

			this._oModel = oModel;
			this._oMeta = oModel.getMetaModel();
			this._oModelUtil = new ModelUtil(oModel);

			return this.getInterface();
		}
	});

	/**
	 * Checks whether a given entity set is draft-enabled.
	 *
	 * @param {string} sEntitySet The name of the entity set
	 * @returns {boolean} <code>true</code>, if a given entity set is draft-enabled, <code>false</code> otherwise
	 * @throws {Error} If no entity set is handed over as input parameter
	 * @public
	 */
	DraftContext.prototype.isDraftEnabled = function(sEntitySet) {
		var oDraftEntitySet = this._getODataDraftEntitySet(sEntitySet);
		return !!(oDraftEntitySet && oDraftEntitySet.isDraft);
	};

	/**
	 * Checks whether a given entity set is a draft root.
	 *
	 * @param {string} sEntitySet The name of the entity set
	 * @returns {boolean} <code>true</code>, if a given entity set is draft root, <code>false</code> otherwise
	 * @throws {Error} If no entity set is handed over as input parameter
	 * @public
	 */
	DraftContext.prototype.isDraftRoot = function(sEntitySet) {
		var oDraftEntitySet = this._getODataDraftEntitySet(sEntitySet);
		return !!(oDraftEntitySet && oDraftEntitySet.isRoot);
	};

	/**
	 * Checks whether an entity set is draft-enabled. The entity set name is derived from the given binding context
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @returns {boolean} <code>true</code>, if a given entity set is draft-enabled, <code>false</code> otherwise
	 * @throws {Error} If no context is handed over as input parameter
	 * @public
	 */
	DraftContext.prototype.hasDraft = function(oContext) {
		var sEntitySet = ModelUtil.getEntitySetFromContext(oContext);
		if (sEntitySet == null) {
			return false;
		}
		return this.isDraftEnabled(sEntitySet);
	};

	/**
	 * Checks whether an entity set is draft root. The entity set name is derived from the given binding context.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @returns {boolean} <code>true</code>, if a given entity set is draft root, <code>false</code> otherwise
	 * @throws {Error} If no context is handed over as input parameter
	 * @public
	 */
	DraftContext.prototype.hasDraftRoot = function(oContext) {
		var sEntitySet = ModelUtil.getEntitySetFromContext(oContext);
		return this.isDraftRoot(sEntitySet);
	};

	/**
	 * Checks whether an entity set has a draft validation function. The entity set name is derived from the given binding context.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @returns {boolean} <code>true</code>, if a given entity set has a draft validation function, <code>false</code> otherwise
	 * @throws {Error} If no context is handed over as input parameter
	 * @public
	 */
	DraftContext.prototype.hasDraftValidationFunction = function(oContext) {
		return !!this.getODataDraftFunctionImportName(oContext, "ValidationFunction");
	};

	/**
	 * Checks whether an entity set has a draft preparation action. The entity set name is derived from the given binding context.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @returns {boolean} <code>true</code>, if a given entity set has a draft preparation action, <code>false</code> otherwise
	 * @throws {Error} If no context is handed over as input parameter
	 * @public
	 */
	DraftContext.prototype.hasDraftPreparationAction = function(oContext) {
		return !!this.getODataDraftFunctionImportName(oContext, "PreparationAction");
	};

	/**
	 * Checks whether a given key is a technical key.
	 *
	 * @param {string} sEntitySet The name of the entity set
	 * @param {object} oKeys The given key
	 * @returns {boolean} <code>true</code>, if a given key is a technical key, <code>false</code> otherwise
	 * @throws {Error} If no entity set is handed over as input parameter
	 * @public
	 */
	DraftContext.prototype.isTechnicalKey = function(sEntitySet, oKeys) {
		var oEntitySet, oEntityType, iKeys, i, sKey;

		if (!sEntitySet) {
			throw new Error("No entity set");
		}

		oEntitySet = this._oMeta.getODataEntitySet(sEntitySet);
		oEntityType = this._oMeta.getODataEntityType(oEntitySet.entityType);
		iKeys = oEntityType.key.propertyRef.length;

		// different amount of keys
		if (Object.keys(oKeys).length !== iKeys) {
			return false;
		}

		for (i = 0; i < iKeys; i++) {
			sKey = oEntityType.key.propertyRef[i].name;

			if (!oKeys[sKey]) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Checks whether a given key is a semantic key.
	 *
	 * @param {string} sEntitySet The name of the entity set
	 * @param {object} oKeys The given key
	 * @returns {boolean} <code>true</code>, if a given key is a semantic key, <code>false</code> otherwise
	 * @throws {Error} If no entity set is handed over as input parameter
	 * @public
	 */
	DraftContext.prototype.isSemanticKey = function(sEntitySet, oKeys) {
		var aSemanticKeyProperties, i, len;

		if (this.isDraftEnabled(sEntitySet)) {
			aSemanticKeyProperties = this.getSemanticKey(sEntitySet);
			len = aSemanticKeyProperties.length;

			for (i = 0; i < len; i++) {
				if (!oKeys[aSemanticKeyProperties[i].name]) {
					return false;
				}
			}

			return true;
		}

		return false;
	};

	/**
	 * Returns the semantic keys for a given entity set.
	 *
	 * @param {string} sEntitySet The given entity set
	 * @returns {array} The semantic keys
	 * @throws {Error} If no entity set is handed over as input parameter
	 * @public
	 */
	DraftContext.prototype.getSemanticKey = function(sEntitySet) {
		var oEntitySet, oEntityType, aSemanticKeys, aSemanticKey = [], i, len;

		if (!sEntitySet) {
			throw new Error("No entity set");
		}

		oEntitySet = this._oMeta.getODataEntitySet(sEntitySet);
		oEntityType = this._oMeta.getODataEntityType(oEntitySet.entityType);
		aSemanticKeys = oEntityType["com.sap.vocabularies.Common.v1.SemanticKey"];

		if (aSemanticKeys) {
			len = aSemanticKeys.length;

			for (i = 0; i < len; i++) {
				// to be conform to property-reference of keys -> name : value
				aSemanticKey.push({name : aSemanticKeys[i].PropertyPath});
			}
		}

		return aSemanticKey;
	};

	/**
	 * Returns the name of the function import to be used.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {string} sDraftFunctionImport The draft function import
	 * @returns {string} The name of the function import to be used
	 * @throws {Error} If no context is handed over as input parameter
	 * @public
	 */
	DraftContext.prototype.getODataDraftFunctionImportName = function(oContext, sDraftFunctionImport) {
		var sEntitySet, oDraftEntitySet;

		sEntitySet = ModelUtil.getEntitySetFromContext(oContext);
		oDraftEntitySet = this._getODataDraftEntitySet(sEntitySet);

		if (oDraftEntitySet.oDraft[sDraftFunctionImport] && oDraftEntitySet.oDraft[sDraftFunctionImport].String) {
			return oDraftEntitySet.oDraft[sDraftFunctionImport].String;
		}

		return null;
	};

	/**
	 * Calculates the description of an entity set with regards to draft enablement.
	 *
	 * @param {string} sEntitySet The name of the entity set
	 * @returns {object} The description of an entity set
	 * @throws {Error} If no entity set is handed over as input parameter
	 * @private
	 */
	DraftContext.prototype._getODataDraftEntitySet = function(sEntitySet) {
		var oODataDraftEntitySet = {}, oEntitySet;

		if (!sEntitySet) {
			throw new Error("No entity set");
		}

		oEntitySet = this._oMeta.getODataEntitySet(sEntitySet);
		oODataDraftEntitySet.ODataEntitySet = oEntitySet;

		if (oEntitySet["com.sap.vocabularies.Common.v1.DraftRoot"]) {
			oODataDraftEntitySet.isDraft = true;
			oODataDraftEntitySet.isRoot = true;
			oODataDraftEntitySet.oDraft = oEntitySet["com.sap.vocabularies.Common.v1.DraftRoot"];
		} else if (oEntitySet["com.sap.vocabularies.Common.v1.DraftNode"]) {
			oODataDraftEntitySet.isDraft = true;
			oODataDraftEntitySet.isRoot = false;
			oODataDraftEntitySet.oDraft = oEntitySet["com.sap.vocabularies.Common.v1.DraftNode"];
		}

		return oODataDraftEntitySet;
	};

	/**
	 * Checks whether administrative data for a given draft is available.
	 *
	 * @param {string} sEntitySet The name of the entity set
	 * @returns {boolean} <code>true</code>, if administrative data is available, <code>false</code> otherwise
	 * @public
	 */
	DraftContext.prototype.hasDraftAdministrativeData = function(sEntitySet) {
		return this._hasNavigationProperty(sEntitySet, "DraftAdministrativeData");
	};

	/**
	 * Checks whether a sibling entity for a given entity set is available.
	 *
	 * @param {string} sEntitySet The name of the entity set
	 * @returns {boolean} <code>true</code>, if sibling entity is available, <code>false</code> otherwise
	 * @public
	 */
	DraftContext.prototype.hasSiblingEntity = function(sEntitySet) {
		return this._hasNavigationProperty(sEntitySet, "SiblingEntity");
	};

	/**
	 * Checks whether entity type of given entity set has the navigation property.
	 *
	 * @param {string} sEntitySet The name of the entity set
	 * @param {string} sNavigationProperty The name of the navigation property
	 * @returns {boolean} <code>true</code>, if navigation property exists, <code>false</code> otherwise
	 * @private
	 */
	DraftContext.prototype._hasNavigationProperty = function(sEntitySet, sNavigationProperty) {
		var oEntitySet, oEntityType, i, len;

		oEntitySet = this._oMeta.getODataEntitySet(sEntitySet);
		oEntityType = this._oMeta.getODataEntityType(oEntitySet.entityType);

		if (oEntityType.navigationProperty) {
			len = oEntityType.navigationProperty.length;

			for (i = 0; i < len; i++) {
				if (oEntityType.navigationProperty[i].name === sNavigationProperty) {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * Checks whether an OData property is annotated with UpdateOnChange. The method is used in context of a validation success event.
	 *
	 * @param {string} sEntitySet The name of the entity set
	 * @param {string} sProperty The name of the property
	 * @return {boolean} <code>true</code>, if the property is annotated with UpdateOnChange, <code>false</code> otherwise
	 * @throws {Error} If no entity set is handed over as input parameter
	 * @public
	 * @deprecated Since 1.32.0
	 */
	DraftContext.prototype.checkUpdateOnChange = function(sEntitySet, sProperty) {
		var sProp, oEntitySet, oSideEffect;

		if (!sEntitySet) {
			throw new Error("No entity set");
		}

		oEntitySet = this._oMeta.getODataEntitySet(sEntitySet);

		for (sProp in oEntitySet) {
			if (sProp.indexOf && sProp.indexOf("com.sap.vocabularies.Common.v1.SideEffects") === 0) {
				oSideEffect = oEntitySet[sProp];

				if (oSideEffect.SourceProperties && oSideEffect.SourceProperties.length) {
					if (oSideEffect.SourceProperties.length === 1 && oSideEffect.SourceProperties[0].PropertyPath) {
						if (oSideEffect.SourceProperties[0].PropertyPath === sProperty) {
							return true;
						}
					}
				}
			}
		}
		return false;
	};

	/**
	 * Checks if the parameter "PreserveChanges" is supported by the edit function.
	 * If the edit action is triggered with the parameter set to <code>true</code> the
	 * ABAP application infrastructure will respond with HTTP response code 409 if unsaved
	 * changes (from another user) exist.
	 *
	 * @returns {boolean} <code>true</code>, if "PreserveChanges" is supported
	 *
	 * @throws {Error} If no context is handed over as input parameter
	 *
	 * @since 1.38
	 * @public
	 */
	DraftContext.prototype.hasPreserveChanges = function(oContext) {
		var oEditFunction = this._oMeta.getODataFunctionImport(this.getODataDraftFunctionImportName(oContext, "EditAction"));
		if (oEditFunction && oEditFunction.parameter) {
			for (var i = 0; i < oEditFunction.parameter.length; i++) {
				var oParameter = oEditFunction.parameter[i];
				if (oParameter.mode === 'In' && oParameter.name === "PreserveChanges") {
					return true;
				}
			}
		}
		return false;
	};

	/**
	 * Frees all resources claimed during the life-time of this instance.
	 *
	 * @public
	 */
	DraftContext.prototype.destroy = function() {
		if (this._oModelUtil) {
			this._oModelUtil.destroy();
		}

		this._oModelUtil = null;
		this._oModel = null;
		this._oMeta = null;
	};

	return DraftContext;

}, true);