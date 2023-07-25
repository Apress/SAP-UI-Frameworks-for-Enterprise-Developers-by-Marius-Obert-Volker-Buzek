/*
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */

sap.ui.define(["sap/ui/thirdparty/jquery", "./BaseController", "./DraftController", "sap/ui/generic/app/util/ModelUtil", "sap/base/util/extend",
	"sap/base/Log"], function (jQuery, BaseController, DraftController, ModelUtil, extend, Log) {
	"use strict";

	/* global Promise */

	/**
	 * Constructor for a new transaction controller instance.
	 *
	 * @public
	 * @class Assuming state-less communication, each single data modification request (or change set in an OData $batch request) is a
	 *        "mini-transaction", which saves data to the database. The class allows you to submit changes, invoke actions, OData CRUD operations in general,
	 *        and trigger client-side validations. It ensures concurrency control and correct ETag handling.
	 *
	 *        The class gives access to runtime draft handling for applications. Additionally error handling capabilities are provided to notify client
	 *        implementations of error situations. The event <code>fatalError</code> is thrown, if fatal errors occur during execution of OData requests.
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.30.0
	 * @alias sap.ui.generic.app.transaction.TransactionController
	 * @param {sap.ui.model.odata.ODataModel} oModel The OData model currently used
	 * @param {sap.ui.generic.app.util.Queue} oQueue Optional HTTP request queue
	 * @param {map} mParams Optional configuration parameters
	 * @param {boolean} mParams.noBatchGroups Suppresses creation of batch groups
	 * @param {Object} oDraftMergeTimer Delayed draft timer object
	 * @throws {Error} Throws an error if no model is handed over as input parameter
	 */
	var TransactionController = BaseController.extend("sap.ui.generic.app.transaction.TransactionController", {
		metadata: {
			publicMethods: [
				"destroy", "setBatchStrategy", "getDraftController", "invokeAction", "editEntity", "deleteEntity", "deleteEntities", "propertyChanged", "hasClientValidationErrors", "resetChanges", "getDefaultValues", "getDefaultValuesFunction", "updateMultipleEntities"
			]
		},

		constructor: function (oModel, oQueue, mParams, oDraftMergeTimer) {
			BaseController.apply(this, [oModel, oQueue, oDraftMergeTimer]);
			this.sName = "sap.ui.generic.app.transaction.TransactionController";
			this._oDraft = null;

			// make sure changes are sent by submitChanges only.
			mParams = mParams || {};

			if (!mParams.noBatchGroups) {
				oModel.setDeferredGroups([
					"Changes"
				]);

				// make sure one change set is used by default for every change.
				oModel.setChangeGroups({
					"*": {
						groupId: "Changes",
						changeSetId: "Changes",
						single: false
					}
				});
			}

			return this.getInterface();
		}
	});

	/**
	 * Sets the strategy for batch handling. Currently all batch operations are sent in one batch group, but alternatively one can
	 * trigger sending all operations in their own batch group.
	 *
	 * @param {boolean} bSingle If set to <code>true</code>, all batch operations are sent in their own batch group, otherwise all operations are
	 *        sent in one batch group
	 * @private
	 * @deprecated Since 1.32.0
	 */
	TransactionController.prototype.setBatchStrategy = function (bSingle) {
		var n, mChangeBatchGroups = this._oModel.getChangeGroups();

		for (n in mChangeBatchGroups) {
			mChangeBatchGroups[n].single = bSingle;
		}

		this._oModel.setChangeGroups(mChangeBatchGroups);
	};

	/**
	 * Returns the current draft controller instance.
	 *
	 * @returns {sap.ui.generic.app.transaction.DraftController} The draft controller instance
	 * @public
	 */
	TransactionController.prototype.getDraftController = function () {
		// create the draft controller lazily.
		if (!this._oDraft) {
			this._oDraft = new DraftController(this._oModel, this._oQueue, this._oDraftMergeTimer);
		}

		return this._oDraft;
	};

	/**
	 * Prepares an entity for editing. If the entity is active and draft enabled, a new draft document is created. If not, the control is
	 * automatically returned to the caller of the method by returning a resolved promise.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {boolean} [bPreserveChanges] Set to <code>true</code> to avoid the creation of a new draft when unsaved changes exist in the back-end
	 * @param {string} [sRootExpand] indicates whether root needs to expanded
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	TransactionController.prototype.editEntity = function (oContext, bPreserveChanges, sRootExpand) {
		var that = this;

		return new Promise(function (resolve) {
			var oDraftContext, sEntitySet;

			oDraftContext = that.getDraftController().getDraftContext();
			sEntitySet = ModelUtil.getEntitySetFromContext(oContext);

			if (oDraftContext.isDraftEnabled(sEntitySet) && that._oDraftUtil.isActiveEntity(oContext.getObject())) {
				return resolve(that.getDraftController().createEditDraftEntity(oContext, bPreserveChanges, sRootExpand));
			}

			return resolve({
				context: oContext
			});
		});
	};

	/**
	 * Submits changes to the backend system and deletes an entity in the backend system.
	 * This entity can be either a draft or an active entity.
	 *
	 * @param {sap.ui.model.Context | string} vEntity Binding context or path of the entity
	 * @param {map} mParameters Parameters that control the behavior of the request
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	TransactionController.prototype.deleteEntity = function (vEntity, mParameters, bIsLenient) {
		var oPromise, oPromise2, that = this,
			sPath, oContext, oDraftController;

		if (typeof vEntity == "string") {
			sPath = vEntity;
		} else if (typeof vEntity == "object" && vEntity instanceof sap.ui.model.Context) {
			oContext = vEntity;
			sPath = oContext.getPath();
		}

		mParameters = mParameters || {};
		jQuery.extend(mParameters, {
			batchGroupId: "Changes",
			changeSetId: "Changes",
			successMsg: "Changes were discarded",
			failedMsg: "Discarding of changes failed",
			forceSubmit: true,
			context: oContext
		});

		var sHandling = bIsLenient ? "lenient" : "strict";
		mParameters.headers = {
			Prefer: "handling=" + sHandling
		};

		if (that._oModel.getObject(sPath) && that._oDraftUtil.isActiveEntity(that._oModel.getObject(sPath)) !== undefined && !that._oDraftUtil.isActiveEntity(that._oModel.getObject(sPath))) {
			if (!oContext) {
				oContext = new sap.ui.model.Context(this._oModel, sPath);
			}
			oDraftController = that.getDraftController();
			oPromise = oDraftController.discardDraft(oContext, mParameters);
		} else {
			oPromise = this._remove(sPath, mParameters);
		}

		oPromise.then(function (oResponse) {
			return that._normalizeResponse(oResponse, true);
		}, function (oResponse) {
			var oResponseOut = that._normalizeError(oResponse);
			throw oResponseOut;
		});
		oPromise2 = this.triggerSubmitChanges(mParameters);

		// continue, if all "sub-ordinate" promises have been resolved.
		return this._returnPromiseAll([
			oPromise, oPromise2
		]);
	};


	/**
	 * Submits changes to the backend system and deletes a group of entities in the backend system.
	 * These entities can be both draft or active entities.
	 *
	 * @param {array} aEntities Binding contexts or paths (strings) which identify the entities
	 * @param {map} mParameters Parameters that control the behavior of the request
	 * @returns {Promise} A <code>Promise</code> that receives an array with the responses of the delete requests.
	 *          The <code>Promise</code> resolves when at least one request was successful and rejects when all
	 *          delete requests have been rejected/aborted.
	 *
	 * @since 1.38
	 * @experimental
	 * @public
	 */
	TransactionController.prototype.deleteEntities = function (aEntities, mParameters) {
		var oPromise, aPromises = [],
			that = this,
			sPath, oContext, oDraftController;
		mParameters = mParameters || {};
		var sHandling = mParameters.bIsStrict ? "strict" : "lenient";
		mParameters.headers = mParameters.headers || {};
		mParameters.headers.Prefer = "handling=" + sHandling;

		jQuery.extend(mParameters, {
			batchGroupId: "Changes",
			changeSetId: "Changes",
			successMsg: "Changes were discarded",
			failedMsg: "Discarding of changes failed",
			forceSubmit: true
		});

		var fnResolve = function (oResponse) {
			return that._normalizeResponse(oResponse, true);
		};

		var fnReject = function (oResponse) {
			var oResponseOut = that._normalizeError(oResponse);
			throw oResponseOut;
		};

		for (var i = 0; i < aEntities.length; i++) {
			oContext = null;
			if (typeof aEntities[i] == "string") {
				sPath = aEntities[i];
			} else if (typeof aEntities[i] == "object" && aEntities[i] instanceof sap.ui.model.Context) {
				oContext = aEntities[i];
				sPath = oContext.getPath();
			}

			if (that._oModel.getObject(sPath) && that._oDraftUtil.isActiveEntity(that._oModel.getObject(sPath)) !== undefined && !that._oDraftUtil.isActiveEntity(that._oModel.getObject(sPath))) {
				mParameters.changeSetId = "Changes";
				if (!oContext) {
					oContext = new sap.ui.model.Context(this._oModel, sPath);
				}
				oDraftController = that.getDraftController();
				oPromise = oDraftController.discardDraft(oContext, mParameters).then(fnResolve, fnReject);
			} else {
				mParameters.changeSetId = "ActiveChanges";
				oPromise = this._remove(sPath, mParameters).then(fnResolve, fnReject);
			}

			aPromises.push(oPromise);
		}

		oPromise = this.triggerSubmitChanges(mParameters);
		aPromises.push(oPromise);

		return this._atLeastOnePromiseResolved(aPromises, true);
	};


	/**
	 * Invokes an action with the given name and submits changes to the backend system.
	 *
	 * @param {string} sFunctionName The name of the function or action
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {map} mParameters Parameters to control the behavior of the request
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the action
	 * @throws {Error} Throws an error if the OData function import does not exist or the action input parameters are invalid
	 * @private
	 * @deprecated Since 1.32.0
	 */
	TransactionController.prototype.invokeAction = function (sFunctionName, oContext, mParameters) {
		var that = this,
			oPromise, oPromise2;

		// check for client message.
		oPromise = this.hasClientMessages();

		if (oPromise) {
			return oPromise;
		}

		mParameters = {
			batchGroupId: "Changes",
			changeSetId: "Changes",
			successMsg: "Call of action succeeded",
			failedMsg: "Call of action failed",
			urlParameters: mParameters.urlParameters,
			forceSubmit: true,
			context: oContext
		};

		oPromise = this._callAction(sFunctionName, oContext, mParameters).then(function (oResponse) {
			return that._normalizeResponse(oResponse, true);
		}, function (oResponse) {
			var oOut = that._normalizeError(oResponse);
			throw oOut;
		});

		// TODO: check for side effects
		// if no side effects are annotated refresh the complete model
		this._oModel.refresh(true, false, "Changes");

		oPromise2 = this.triggerSubmitChanges(mParameters);

		// continue, if all "sub-ordinate" promises have been resolved.
		return this._returnPromiseAll([
			oPromise, oPromise2
		]);
	};

	/**
	 * Resets changes that have been tracked by the current instance of <code>sap.ui.model.odata.v2.ODatatModel</code>. These changes have been
	 * created by invoking the <code>setProperty</code> method of <code>sap.ui.model.odata.v2.ODatatModel</code>.
	 *
	 * @param{array} aKeys Optional array of keys that have to be reset. If no array is passed all changes will be reset.
	 * @public
	 */
	TransactionController.prototype.resetChanges = function (aKeys) {
		this._oModel.resetChanges(aKeys);
	};

	/**
	 * Notifies the transaction controller of a change of a property. Please note that the method is not meant for public use currently.
	 * It is experimental.
	 *
	 * @param {string} sEntitySet The name of the entity set
	 * @param {string} sProperty Path identifying the changed property
	 * @param {object} oBinding The binding associated with the changed property
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the action
	 * @deprecated
	 * @private
	 */
	TransactionController.prototype.propertyChanged = function (sEntitySet, sProperty, oBinding) {
		var oDraftContext, oContext, mParameters = {
			batchGroupId: "Changes",
			changeSetId: "Changes",
			binding: oBinding
		};

		oDraftContext = this.getDraftController().getDraftContext();

		// if (this.hasClientValidationErrors()) {
		// ask core guys how to check for client validation errors.
		// if (bUpdateOnChange) {
		// // what to do? inform user?
		// }
		// } else {
		if (oDraftContext.checkUpdateOnChange(sEntitySet, sProperty)) {
			oContext = oBinding.getBoundContext();

			if (oDraftContext.hasDraftPreparationAction(oContext)) {
				return this.getDraftController().saveAndPrepareDraftEntity(oContext, mParameters);
			}

			mParameters.onlyIfPending = true;
			return this.triggerSubmitChanges(mParameters);
		}

		mParameters.onlyIfPending = true;
		mParameters.noShowResponse = true;
		mParameters.noBlockUI = true;
		return this.triggerSubmitChanges(mParameters);
		// }
	};


	/**
	 * This function checks for the default values function to make a backend call.
	 * The values in oPredefinedValue is overridden by the values of default values function
	 * If DVF is not annotated then oPredefinedValue is returned unmodified.
	 * @param {object} aContexts an array of all the binding context
	 * @param {object} aPredefinedValues an array of all the selected context's existing predefined values
	 * @param {string} sNavigationProperty if the DefaultValueFunction is annotated under a navigation
	 * @param {string} sFunctionImportName if the DefaultValueFunction is annotated under function import action button
	 * @returns {Promise} A <code>Promise</code> if defaultValue function is present
	 * @returns {object} If not, return oPredefinedValue
	 * @private
	 */
	TransactionController.prototype.getDefaultValues = function (aContexts, aPredefinedValues, sNavigationProperty, sFunctionImportName) {
		var oEntityObject, aEntityTypeProperties, oContext = aContexts[0];
		if (!oContext && !(oContext instanceof sap.ui.model.Context)) {
			throw new Error("No context");
		}
		var sEntitySet = ModelUtil.getEntitySetFromContext(oContext);
		if (!sEntitySet && sEntitySet === "") {
			throw new Error("No EntitySet found in the current context");
		}

		var oMetaModel = oContext.getModel().getMetaModel();
		var oEntityType = oMetaModel.getODataEntityType(oMetaModel.getODataEntitySet(sEntitySet).entityType);
		// Navigation property (for OP)
		if (sNavigationProperty) {
			oEntityType['navigationProperty'].forEach(function (oNavProperty) {
				if (oNavProperty.name === sNavigationProperty) {
					oEntityObject = oNavProperty;
				}
			});
			// Get entitytype properties on the item level
			var oChildEntityType = oMetaModel.getODataEntityType(oMetaModel.getODataAssociationEnd(oEntityType, sNavigationProperty).type);
			aEntityTypeProperties = oChildEntityType.property;
		} else if (sFunctionImportName) {
			// Function Import
			oEntityObject = oMetaModel.getODataFunctionImport(sFunctionImportName);
			aEntityTypeProperties = oEntityObject.parameter;
		} else {
			// LR scenario
			oEntityObject = oMetaModel.getODataEntitySet(sEntitySet);
			aEntityTypeProperties = oEntityType.property;
		}

		var sDefaultValueFunctionPath = this.getDefaultValuesFunction(oEntityObject);
		if (sDefaultValueFunctionPath) {
			var sDefaultValuesFunctionImport = sDefaultValueFunctionPath.split("/")[1];
			if (aContexts.length > 1 && oMetaModel.getODataFunctionImport(sDefaultValuesFunctionImport).parameter) {
				Log.error("Parameterised DefaultValuesFunction not to be called with multiple selections");
				throw new Error("Parameterised DefaultValuesFunction not to be called with multiple selections");
			}

			var mParameters = {
				successMsg: "Call of action succeeded",
				failedMsg: "Call of action failed",
				urlParameters: null,
				forceSubmit: true,
				context: oContext,
				headers: {
					"If-Match": "*"
				}
			};
			var oPromise = this._callAction(sDefaultValueFunctionPath, oContext, mParameters).then(function (oResponse) {
				if (oResponse.httpResponse.statusCode === "200") {
					//this logic is added because of the current response type and will be modified if the response type changes.
					var oResult = oResponse.responseData[sDefaultValuesFunctionImport] || oResponse.responseData;
					var oDefaultValue = {};
					//filter only essential fields
					aEntityTypeProperties.forEach(function (oProperty) {
						if (oResult.hasOwnProperty(oProperty.name)) {
							oDefaultValue[oProperty.name] = oResult[oProperty.name];
						}
					});
					var aFinalValues = [];
					aPredefinedValues.forEach(function (oPredefinedValue) {
						var oExistingValues = {};
						for (var sProp in oPredefinedValue) {
							if (oPredefinedValue[sProp] !== "") {
								oExistingValues[sProp] = oPredefinedValue[sProp];
							}
						}
						aFinalValues.push(extend({}, oExistingValues, oDefaultValue));
					});
					return aFinalValues;
				}
			});
			var oPromise2 = this.triggerSubmitChanges(mParameters);
			return this._returnPromiseAll([
				oPromise, oPromise2
			]);
		} else {
			return aPredefinedValues;
		}
	};

	/**
	 * Checks in the entity set whether Default value function Annotation is present 
	 * If yes, returns name of Function Import
	 * Else returns null 
	 * @param {object} oEntitySet The given entity set
	 * @returns {string} of default value function
	 * @private
	 */
	TransactionController.prototype.getDefaultValuesFunction = function (oEntitySet) {
		var oDefaultValue = oEntitySet["com.sap.vocabularies.Common.v1.DefaultValuesFunction"];
		var sDefaultValue = oDefaultValue ? "/" + oDefaultValue.String : null;
		return sDefaultValue;
	};

	/**
	 * Multi edit handling.
	 * 
	 * @param {array} aContextToBeUpdated contains path and data to be updated for all selected contexts.
	 * @public
	 * @returns {Promise} A <code>Promise</code> which resolves if the given promises have been executed with at least one successfully. It rejects if all given promises were rejected.
	 */
	 TransactionController.prototype.updateMultipleEntities = function (aContextToBeUpdated) {
		var aUpdatePromise = [];
		var that = this;
		var fnResolve = function (oResponse) {
			return that._normalizeResponse(oResponse, true);
		};
		var fnReject = function (oResponse) {
			var oResponseOut = that._normalizeError(oResponse);
			throw oResponseOut;
		};
		for (var iIndex = 0; iIndex < aContextToBeUpdated.length; iIndex++) {
			var oUpdatePromise = this._updateEntity(aContextToBeUpdated[iIndex].sContextPath, aContextToBeUpdated[iIndex].oUpdateData, iIndex).then(fnResolve, fnReject);
			aUpdatePromise.push(oUpdatePromise);
		}
		return this._atLeastOnePromiseResolved(aUpdatePromise);
	};

	/**
	 * Frees all resources claimed during the life-time of this instance.
	 *
	 * @public
	 */
	TransactionController.prototype.destroy = function () {
		BaseController.prototype.destroy.apply(this, []);

		if (this._oDraft) {
			this._oDraft.destroy();
		}

		this._oDraft = null;
	};

	return TransactionController;

}, true);