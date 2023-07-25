/*
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */

sap.ui.define(["sap/ui/thirdparty/jquery", "./BaseController", "./DraftContext", "sap/base/Log", "sap/ui/model/Context", "sap/ui/generic/app/util/ActionUtil"
], function(jQuery, BaseController, DraftContext, Log, Context, ActionUtil) {
	"use strict";

	/* global Promise */

	/**
	 * Constructor for a new draft controller instance.
	 *
	 * @public
	 * @class Gives access to runtime draft handling for applications. Assuming state-less communication, each single data modification request (or
	 *        change set in an OData $batch request) is a "mini-transaction", which saves data to the database. The class implements the transactional
	 *        interaction patterns specified for OData services that support draft documents and provides methods for draft-specific actions, for
	 *        example validate, prepare, activate.
	 *
	 *        Additionally, it handles transactional request processing, ensures concurrency control and correct
	 *        ETag handling. It provides access to the simple interaction patterns of runtime handling for drafts according to the draft
	 *        specification. These can be combined as required by client applications. Additionally, error handling is provided to notify client
	 *        implementations of error situations. The event <code>fatalError</code> is thrown, if fatal errors occur during execution of OData
	 *        requests.
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.30.0
	 * @alias sap.ui.generic.app.transaction.DraftController
	 * @param {sap.ui.model.odata.ODataModel} oModel The OData model currently used
	 * @param {sap.ui.generic.app.util.Queue} oQueue Optional HTTP request queue
	 * @param {Object} oDraftMergeTimer Delayed draft timer object
	 * @throws {Error} Throws an error if no model is handed over as input parameter
	 */
	var DraftController = BaseController.extend("sap.ui.generic.app.transaction.DraftController", {
		metadata: {
			publicMethods: [
				"getDraftContext", "getDraftForActiveEntity", "createNewDraftEntity", "createEditDraftEntity", "validateDraftEntity", "validateDraft", "prepareDraft", "prepareDraftEntity", "saveAndPrepareDraftEntity", "activateDraftEntity", "isActiveEntity", "hasActiveEntity", "destroy", "discardDraft"
			]
		},

		constructor: function(oModel, oQueue, oDraftMergeTimer) {
			BaseController.apply(this, [
				oModel, oQueue, oDraftMergeTimer
			]);
			this.sName = "sap.ui.generic.app.transaction.DraftController";
			this._oContext = null;
		}
	});

	/**
	 * Returns the current draft context instance. If no instance exists, it is created lazily.
	 *
	 * @returns {sap.ui.generic.app.transaction.DraftContext} The current draft context instance
	 * @public
	 */
	DraftController.prototype.getDraftContext = function() {
		if (!this._oContext) {
			this._oContext = new DraftContext(this._oModel);
		}

		return this._oContext;
	};

	/**
	 * Creates a new draft instance.
	 *
	 * @param {string} sEntitySet The name of the entity set
	 * @param {string} sPath Path identifying the new entity instance
	 * @param {map} mParameters Parameters to control the behavior of the request
	 * @param {string} mParameters.batchGroupId The ID of the batch group to use
	 * @param {string} mParameters.changeSetId The ID of the change set to use
	 * @param {array | object} [mParameters.predefinedValues] An array that specifies a set of properties or the entry
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @throws {Error} Throws an error if no entity set is handed over as input parameter
	 * @private
	 */
	DraftController.prototype.createDraft = function(sEntitySet, sPath, mParameters) {
		var that = this;

		if (!sEntitySet) {
			throw new Error("No entity set");
		}

		mParameters = mParameters || {};

		return new Promise(function(resolve, reject) {
			var fnSuccess = function(oData, oResponse) {
				resolve({
					responseData: oData,
					httpResponse: oResponse
				});
			};

			var createdContext;
			var fnError = function(oError){
				that._oModel.deleteCreatedEntry(createdContext);
				reject(oError);
			};
			createdContext = that._oModel.createEntry(sPath, {
				properties: mParameters.predefinedValues,
				success: fnSuccess,
				error: fnError,
				batchGroupId: mParameters.batchGroupId,
				changeSetId: mParameters.changeSetId,
				canonicalRequest: !!mParameters.canonicalRequest,
				expand: mParameters.expand
			});
		});
	};

	/**
	 * Validates a draft in the back-end.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {map} mParameters Parameters to control the behavior
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @throws {Error} Throws an error if no context is handed over as input parameter or if the function import does not exist or the action input
	 *         parameters are invalid
	 * @private
	 */
	DraftController.prototype.validateDraft = function(oContext, mParameters) {
		if (!oContext.getModel().getObject(oContext.getPath()).IsActiveEntity) {
			var oImport = this.getDraftContext().getODataDraftFunctionImportName(oContext, "ValidationFunction");
			return this._callAction(oImport, oContext, mParameters);
		} else {
			return Promise.resolve();
		}
	};

	/**
	 * Prepares a draft in the back-end.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {map} mParameters Parameters to control the behavior
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @throws {Error} Throws an error if no context is handed over as input parameter or if the function import does not exist or the action input
	 *         parameters are invalid
	 * @private
	 */
	DraftController.prototype.prepareDraft = function(oContext, mParameters) {
		if (!oContext.getModel().getObject(oContext.getPath()).IsActiveEntity) {
			var oImport;

			mParameters = mParameters || {};
			mParameters.urlParameters = mParameters.urlParameters || {};

			oImport = this.getDraftContext().getODataDraftFunctionImportName(oContext, "PreparationAction");
			return this._callAction(oImport, oContext, mParameters);
		} else {
			return Promise.resolve();
		}

	};

	/**
	 * Activates a draft in the back-end.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {object} oPrepareParameters object controlling the prepare action
	 * @param {object} oActivateParameters object controlling the activate action
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution. This Promise returns an array with the result of the "Prepare" and "Activate" requests
	 * @throws {Error} Throws an error if no context is handed over as input parameter or if the function import does not exist or the action input
	 *         parameters are invalid
	 * @private
	 */
	DraftController.prototype.activateDraft = function(oContext, oPrepareParameters, oActivateParameters) {
		var pPrepare = this.prepareDraft(oContext, oPrepareParameters);

		var oImport = this.getDraftContext().getODataDraftFunctionImportName(oContext, "ActivationAction");
		var pActivate = this._callAction(oImport, oContext, oActivateParameters);

		return Promise.all([pPrepare, pActivate]);
	};

	/**
	 * Creates an edit draft in the back-end.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {map} mParameters Parameters to control the behavior
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @throws {Error} Throws an error if no context is handed over as input parameter or if no EditAction exists
	 *         or if mParameters are invalid
	 * @private
	 */
	DraftController.prototype.editDraft = function(oContext, mParameters) {
		var sImportName = this.getDraftContext().getODataDraftFunctionImportName(oContext, "EditAction");
		if (sImportName){
			return this._callAction(sImportName, oContext, mParameters);
		}
		throw new Error(oContext ? "No Edit action defined for the given context" : "No context provided for the Edit action");
	};

	/**
	 * Removes a draft in the back-end.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {map} mParameters Parameters to control the behavior
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @throws {Error} Throws an error if no context is handed over as input parameter
	 * @private
	 */
	DraftController.prototype.discardDraft = function(oContext, mParam) {
		if (!oContext) {
			throw new Error("No context");
		}
		var mParameters = {};
		jQuery.extend(true, mParameters, mParam);
		var sFunctionImport =  this.getDraftContext().getODataDraftFunctionImportName(oContext, "DiscardAction");
		if (sFunctionImport) {
			return this._callAction(sFunctionImport, oContext, mParameters);
		}
		return this._remove(oContext.getPath(), mParameters);
	};

	/**
	 * Retrieves a possibly existing draft entity for the given active entity using the binding context of the active entity from the back-end.
	 *
	 * @param {sap.ui.model.Context} oContext The binding context of the active entity
	 * @param {map} mParameters Parameters to control the behavior
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @throws {Error} Throws an error if no context is handed over as input parameter
	 * @private
	 * @since 1.32.0
	 */
	DraftController.prototype.getDraftForActive = function(oContext, mParameters) {
		var that = this;

		if (!oContext) {
			throw new Error("No context");
		}

		mParameters = mParameters || {};
		mParameters.urlParameters = {
			"$expand": "SiblingEntity"
		};

		return this._read(oContext.getPath(), mParameters).then(function(oResponse) {
			if (oResponse.responseData && oResponse.responseData.hasOwnProperty("SiblingEntity")) {
				oResponse.context = that._oModel.getContext("/" + that._oModel.getKey(oResponse.responseData.SiblingEntity));
				return oResponse;
			}

			throw new Error("No draft entity could be found");
		});
	};

	/**
	 * Retrieves a possibly existing draft entity for the given active entity using the binding context of the active entity from the back-end.
	 *
	 * @param {sap.ui.model.Context} oContext The binding context of the active entity
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @throws {Error} Throws an error if no context is handed over as input parameter
	 * @public
	 * @since 1.32.0
	 */
	DraftController.prototype.getDraftForActiveEntity = function(oContext) {
		var oPromise, oPromise2, that = this, mParameters = {
			batchGroupId: "Changes",
			changeSetId: "Changes",
			noShowSuccessToast: true,
			forceSubmit: true
		};

		oPromise = this.getDraftForActive(oContext, mParameters).then(function(oResponse) {
			return oResponse;
		}, function(oResponse) {
			throw that._normalizeError(oResponse);
		});
		oPromise2 = this.triggerSubmitChanges(mParameters);

		// continue, if all "sub-ordinate" promises have been resolved.
		return this._returnPromiseAll([
			oPromise, oPromise2
		]);
	};

	/**
	 * Creates a new edit draft on the client and sends it to the back-end. Additionally, possible changes that have been collected on the client are
	 * sent to the back-end.
	 *
	 * @param {string} sEntitySet The name of the entity set
	 * @param {string} sPath Path identifying the new entity instance
	 * @param {array | object} [vPredefinedValues] An array that specifies a set of properties or the entry
	 * @param {boolean} [bCanonicalRequest] information whether the canonicalRequest parameter should be set for the create request
	 * @param {object} [oParameters] parameters to be passed to the function
	 * @param {boolean} [oParameters.sRootExpand] indicates whether root needs to expanded
	 * @param {object} [oParameters.oController] controller object required to create ActionUtil instance
	 * @param {object} [oParameters.oApplicationController] applicationController object required to create ActionUtil instance
	 * @param {boolean} [oParameters.bUseNewActionForCreate] manifest entry indicating whether newAction has to be used for draft  reation
	 * @param {function} [oParameters.fnSetBusy] callback to set the busy indicator
	 * @param {object} [oParameter.oFunctionImportDialogInfo] Object contains FI dialog title and action button text, In fallback case it'll show text provided in denver layer
	 * @param {function} [oParameter.oFunctionImportDialogInfo.getTitleText] return FI dialog title text
	 * @param {function} [oParameter.oFunctionImportDialogInfo.getActionButtonText] return FI dialog action button text
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the request
	 * @public
	 */
	DraftController.prototype.createNewDraftEntity = function(sEntitySet, sPath, vPredefinedValues, bCanonicalRequest, oParameters) {
		var that = this;
		oParameters = oParameters || {};
		oParameters.fnSetBusy = oParameters.fnSetBusy || Function.prototype;
		var sId4BatchGroupAndChangeSet = "Changes";
		var mParameters1 = {
			predefinedValues: vPredefinedValues,
			batchGroupId: sId4BatchGroupAndChangeSet,
			changeSetId: sId4BatchGroupAndChangeSet,
			canonicalRequest: bCanonicalRequest,
			expand: oParameters.sRootExpand
		};

		var oContext = new Context(that._oModel, sPath);
		var sFunctionImport = that.getDraftContext().getODataDraftFunctionImportName(oContext, "NewAction");
		var oFunctionImport = sFunctionImport && that._oMeta.getODataFunctionImport(sFunctionImport);
		var oPromise0;
		if (oParameters.bUseNewActionForCreate && oFunctionImport) {
			var oLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app");
			var sFunctionImportDialogTitleText = (oFunctionImport["com.sap.vocabularies.Common.v1.Label"] && oFunctionImport["com.sap.vocabularies.Common.v1.Label"].String) || (oParameters.oFunctionImportDialogInfo ? oParameters.oFunctionImportDialogInfo.getTitleText() : oLibraryResourceBundle.getText("DIALOG_TITLE_NEW_ACTION_FOR_CREATE"));
			var sFunctionImportDialogActionButtonText = oParameters.oFunctionImportDialogInfo ? oParameters.oFunctionImportDialogInfo.getActionButtonText() : oLibraryResourceBundle.getText("DIALOG_ACTION_BUTTON_NEW_ACTION_FOR_CREATE");
			var oSkipProperties = {ResultIsActiveEntity: true};
			var bIsDraft = that.getDraftContext().isDraftEnabled(sEntitySet);
			var oActionProcessor = new ActionUtil({
				controller: oParameters.oController,
				contexts: [oContext],
				applicationController: oParameters.oApplicationController,
				operationGrouping: undefined
			});
			var mAdditionalParamData = {
				expand: oParameters.sRootExpand
			};
			oPromise0 = oActionProcessor.call(sFunctionImport, sFunctionImportDialogTitleText, bIsDraft, oSkipProperties, true, mAdditionalParamData, sFunctionImportDialogActionButtonText).then(function(oResponse) {
				oParameters.fnSetBusy(oResponse.executionPromise);
				return oResponse.executionPromise;
			});
		} else {
			oPromise0 = this.createDraft(sEntitySet, sPath, mParameters1);
			oParameters.fnSetBusy(oPromise0);
		}
		var oPromise1 = oPromise0.then(function(aResponse) {
			// To handle 412 warning scenarios function import response is nested and user entered parameters are retained
			// For NewAction function import extract the response object which contains the newly created record
			var oResponse = Array.isArray(aResponse) ? aResponse[0] : aResponse;
			return that._normalizeResponse(oResponse.response || oResponse, true);
			}, function(aResponse) {
				// Response object is nested and hence extract the error message
				var oResponse = Array.isArray(aResponse) ? (aResponse[0].error || aResponse[0].response) : aResponse;
				var oResponseOut = oResponse ? that._normalizeError(oResponse) : null;
				throw oResponseOut;
		});
		function fnPromise1Callback(oResponse) {
			var bIsActiveEntity, bHasDraftEntity, oResponseEntity, oResponseOut = that._normalizeResponse(oResponse, true);

			// mind nesting of promises and error situation.
			if (oResponseOut.context) {
				oResponseEntity = oResponseOut.context.getObject();
			}

			if (!oResponseEntity) {
				Log.error("Activate function returned no entity");
				return Promise.reject(new Error("Activate function returned no entity"));
			}
			bIsActiveEntity = that._oDraftUtil.isActiveEntity(oResponseEntity);
			if (bIsActiveEntity) {
				Log.error("New draft entity is not marked as draft - isActiveEntity = " + bIsActiveEntity);
				return Promise.reject("New draft entity is not marked as draft - isActiveEntity = " + bIsActiveEntity);
			}
			bHasDraftEntity = that._oDraftUtil.hasDraftEntity(oResponseEntity);
			if (bHasDraftEntity) {
				Log.error("Wrong value for HasTwin of new draft entity - HasDraftEntity = " + bHasDraftEntity);
				return Promise.reject(new Error("Wrong value for HasTwin of new draft entity - HasDraftEntity = " + bHasDraftEntity));
			}
			return oResponseOut;
		}
		var oPromise2;
		//this.triggerSubmitChanges is not required for ActionUtil.call
		if (oParameters.bUseNewActionForCreate && oFunctionImport) {
			oPromise2 = oPromise1.then(fnPromise1Callback);
		} else {
			var mParameters2 = {
				batchGroupId: sId4BatchGroupAndChangeSet,
				changeSetId: sId4BatchGroupAndChangeSet,
				noShowSuccessToast: true,
				forceSubmit: true,
				failedMsg: "New draft document could not be created"
			};
			oPromise2 = this.triggerSubmitChanges(mParameters2).then(function() {
				return oPromise1.then(fnPromise1Callback);
			});
		}
		// continue, if all "sub-ordinate" promises have been resolved.
		return this._returnPromiseAll([
			oPromise1, oPromise2
		]);
	};

	/**
	 * Creates an edit draft in the back-end. Additionally, possible changes that have been collected on the client are sent to the back-end.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {boolean} [bPreserveChanges] Set to <code>true</code> to avoid the creation of a new draft when unsaved changes exist in the back-end
	 * @param {string} [sRootExpand] indicates whether root needs to expanded
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	DraftController.prototype.createEditDraftEntity = function(oContext, bPreserveChanges, sRootExpand) {
		var oPromise, oPromise2, that = this, mParameters = {
			batchGroupId: "Changes",
			changeSetId: "Changes",
			successMsg: "Draft for document was created",
			failedMsg: "Could not create draft for document",
			forceSubmit: true,
			context: oContext,
			expand: sRootExpand
		};
		if (bPreserveChanges) {
			mParameters.urlParameters = { PreserveChanges: true };
		}

		oPromise = this.editDraft(oContext, mParameters).then(function(oResponse) {
			var bIsActiveEntity, oResponseEntity, oResponseOut;

			oResponseOut = that._normalizeResponse(oResponse, true);

			// mind nesting of promises and error situation.
			if (oResponseOut.context) {
				oResponseEntity = oResponseOut.context.getObject();
			}

			if (!oResponseEntity) {
				Log.error("Activate function returned no entity");
				return Promise.reject(new Error("Activate function returned no entity"));
			}

			bIsActiveEntity = that._oDraftUtil.isActiveEntity(oResponseEntity);
			if (bIsActiveEntity) {
				Log.error("Edit function returned an entity which is not a draft instance - IsActiveEntity = " + bIsActiveEntity);
				return Promise.reject(new Error("Returned entity ist not a draft instance - IsActiveEntity = " + bIsActiveEntity));
			}

			return oResponseOut;
		}, function(oResponse) {
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
	 * Submits changes to the back-end and prepares an existing draft entity in the back-end for later activation by invoking the validation action.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	DraftController.prototype.validateDraftEntity = function(oContext) {
		var oPromise, oPromise2, that = this, mParameters = {
			batchGroupId: "Changes",
			changeSetId: "Changes",
			context: oContext,
			forceSubmit: true
		};

		oPromise = this.validateDraft(oContext, mParameters).then(function(oResponse) {
			return that._normalizeResponse(oResponse, true);
		}, function(oResponse) {
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
	 * Submits changes to the back-end and prepares a draft entity in the back-end for later activation by invoking the preparation action.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {map} mParameters Parameters to control the behavior of the request
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	DraftController.prototype.saveAndPrepareDraftEntity = function(oContext, mParameters) {
		var oPromise, oPromise2, that = this;

		mParameters = mParameters || {};
		mParameters.batchGroupId = "Changes";
		mParameters.changeSetId = "Changes";
		mParameters.successMsg = "Saved";
		mParameters.failedMsg = "Save failed";
		mParameters.context = oContext;
		mParameters.forceSubmit = true;

		oPromise = this.prepareDraft(oContext, mParameters).then(function(oResponse) {
			var bIsActiveEntity, oResponseEntity, oResponseOut;

			// mind nesting of promises and error situation.
			oResponseOut = that._normalizeResponse(oResponse, true);

			if (oResponseOut.context) {
				oResponseEntity = oResponseOut.context.getObject();
			}

			if (!oResponseEntity) {
				Log.error("Activate function returned no entity");
				return Promise.reject(new Error("Activate function returned no entity"));
			}

			bIsActiveEntity = that._oDraftUtil.isActiveEntity(oResponseEntity);
			if (bIsActiveEntity) {
				Log.error("Prepare function returned an entity which is not a draft instance - IsActiveEntity = " + bIsActiveEntity);
				return Promise.reject(new Error("Returned entity ist not a draft instance - IsActiveEntity = " + bIsActiveEntity));
			}

			return oResponseOut;
		}, function(oResponse) {
			var oResponseOut = that._normalizeError(oResponse);
			throw oResponseOut;
		});

		// to make sure that read operations and the prepare action are processed in the same OData request hand in the batch group.
		if (mParameters.binding) {
			mParameters.binding.refresh(true, "Changes");
		}

		oPromise2 = this.triggerSubmitChanges(mParameters);

		// continue, if all "sub-ordinate" promises have been resolved.
		return this._returnPromiseAll([
			oPromise, oPromise2
		]);
	};

	/**
	 * Submits changes to the back-end and prepares an existing draft entity in the back-end for later activation by invoking the preparation action.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	DraftController.prototype.prepareDraftEntity = function(oContext) {
		var that = this;

		return this.prepareDraft(oContext).then(function(oResponse) {
			var oResponseOut, oResponseEntity;

			oResponseOut = that._normalizeResponse(oResponse, true);
			oResponseEntity = oResponseOut.context.getObject();

			if (that._oDraftUtil.isActiveEntity(oResponseEntity)) {
				Log.error("Prepare function returned an entity which is not a draft instance - IsActiveEntity = " + true);
				return Promise.reject(new Error("Returned entity ist not a draft instance - IsActiveEntity = " + true));
			}

			return oResponseOut;
		}, function(oResponse) {
			var oResponseOut = that._normalizeError(oResponse);
			throw oResponseOut;
		});
	};

	/**
	 * Submits changes to the back-end and activates a draft entity in the back-end.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
     * @param {boolean} [bIsLenient] Set to <code>true</code> to activate the draft even if warnings exist
	 * @param {string} sExpand Comma separated navigation properties which needs to be expanded with the root context of the active instance
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	DraftController.prototype.activateDraftEntity = function(oContext, bIsLenient, sExpand) {
		var oActivateDraftPromise, oTriggerSubmitPromise;
		var that = this, oPrepareParameters = {
			batchGroupId: "Changes",
			successMsg: "Document activated",
			failedMsg: "Activation of document failed",
			forceSubmit: true,
			context: oContext
		};
		var oActivateParameters = jQuery.extend({}, oPrepareParameters); // copy the parameters that are identical for preparation and activation
		oPrepareParameters.changeSetId = "Preparation";
		oActivateParameters.changeSetId = "Activation";
		oActivateParameters.expand = sExpand;
		var sHandling = bIsLenient ? "lenient" : "strict";
		oActivateParameters.headers = { Prefer: "handling=" + sHandling};
		var sETag = this._oModel.getETag(oContext.getPath());
		// ETag validation is not required in draft apps with ETag enabled as a single draft object cannot be edited by two different users simultaneously because of locking mechanism
		if (sETag) {
			oPrepareParameters.headers = { "If-Match": "*" };
			oActivateParameters.headers["If-Match"] = "*";
		}
		var oActivationPromise = new Promise(function (fnResolve, fnReject) {
			var fnCallerFunc = function () {
				// IMPORTANT: Detach fCallerFunc from onQueueCompleted event as this method will again adds 
				// triggerSubmitChanges which creates entries in the Queue & result in to cyclic execution 
				that.detachOnQueueCompleted(fnCallerFunc);

				oActivateDraftPromise = that.activateDraft(oContext, oPrepareParameters, oActivateParameters).then(function (aResponses) {
					var bIsActiveEntity, oResponseEntity, oResponseOut;

					//TODO: Check how this logic can be restructured for usage on both results, Prepare and Activate
					var oResponse = aResponses[1];

					// mind nesting of promises and error situation.
					oResponseOut = that._normalizeResponse(oResponse, true);

					if (oResponseOut.context) {
						oResponseEntity = oResponseOut.context.getObject();
					}

					if (!oResponseEntity) {
						Log.error("Activate function returned no entity");
						return Promise.reject(new Error("Activate function returned no entity"));
					}

					bIsActiveEntity = that._oDraftUtil.isActiveEntity(oResponseEntity);
					if (!bIsActiveEntity) {
						Log.error("Activate function returned an entity which is still a draft instance - IsActiveEntity = " + bIsActiveEntity);
						return Promise.reject(new Error("Returned entity is still a draft instance - IsActiveEntity = " + bIsActiveEntity));
					}
					return oResponseOut;
				}, function (oResponse) {
					var oResponseOut = that._normalizeError(oResponse);
					throw oResponseOut;
				});

				// Trigger all changes which still might be in the model together with the prepare action 
				oTriggerSubmitPromise = that.triggerSubmitChanges(oPrepareParameters);
				// resolve _oActivationPromise, if all "sub-ordinate" promises have been resolved.
				fnResolve(that._returnPromiseAll([oActivateDraftPromise, oTriggerSubmitPromise]));
			};

			if (that._oQueue._aQueue.length) {
				// Check the Queue for any merge being executed & if yes wait till the 
				// Queue items are flushed out and completed
				that.attachOnQueueCompleted(fnCallerFunc);
			} else {
				// Queue is empty execute the Preparation & Activation immediately
				fnCallerFunc(this);
			}
		});
		return oActivationPromise;
	};

	/**
	 * Checks whether an entity set is active. The entity set name is derived from the given binding context
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @returns {boolean} <code>true</code>, if a given entity set is active, <code>false</code> otherwise
	 * @throws {Error} Throws an error if no context is handed over as input parameter
	 * @public
	 */
	DraftController.prototype.isActiveEntity = function(oContext) {
		if (this.getDraftContext().hasDraft(oContext)) {
			return this._oDraftUtil.isActiveEntity(oContext.getObject());
		}

		return true;
	};

	/**
	 * Checks whether an entity has an active entity associated.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @returns {boolean} <code>true</code>, if an active entity exists, <code>false</code> otherwise
	 * @public
	 * @since 1.32.0
	 */
	DraftController.prototype.hasActiveEntity = function(oContext) {
		return this._oDraftUtil.hasActiveEntity(oContext.getObject());
	};

	/**
	 * Frees all resources claimed during the life-time of this instance.
	 *
	 * @public
	 */
	DraftController.prototype.destroy = function() {
		if (this._oContext) {
			this._oContext.destroy();
		}

		this._oContext = null;
		this._oModel = null;

		BaseController.prototype.destroy.apply(this, []);
	};

	return DraftController;

}, true);