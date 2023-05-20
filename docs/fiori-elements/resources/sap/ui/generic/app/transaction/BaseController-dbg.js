/*
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */

sap.ui.define(["sap/ui/base/EventProvider", "sap/ui/generic/app/util/ModelUtil", "sap/ui/generic/app/util/DraftUtil", "sap/ui/generic/app/util/Queue", "sap/base/Log"],
	function (EventProvider, ModelUtil, DraftUtil, Queue, Log) {
		"use strict";

		/*global Promise */

		/**
		 * Constructor for base class for controller instances.
		 *
		 * @param {sap.ui.model.odata.ODataModel} oModel The OData model currently used
		 * @param {sap.ui.generic.app.util.Queue} oQueue Optional HTTP request queue
		 * @param {Object} oDraftMergeTimer Delayed draft timer object
		 *
		 * @throws {Error} If no model is handed over as input parameter
		 *
		 * @class Common base class for <code>sap.ui.generic.app.transaction.TransactionController</code> and
		 *        <code>sap.ui.generic.app.transaction.DraftController</code>, which offers basic functionality to invoke OData functions and
		 *        actions as well as OData CRUD functions in general.
		 *
		 * @author SAP SE
		 * @version 1.113.0
		 *
		 * @since 1.30.0
		 * @alias sap.ui.generic.app.transaction.BaseController
		 * @public
		 */
		var BaseController = EventProvider.extend("sap.ui.generic.app.transaction.BaseController", {
			metadata: {
				publicMethods: [
					"hasClientMessages", "triggerSubmitChanges", "attachFatalError", "detachFatalError", "destroy"
				]
			},

			constructor: function (oModel, oQueue, oDraftMergeTimer) {
				// model is a mandatory parameter.
				if (!oModel) {
					throw new Error("No model");
				}

				// Attach global event handler for "non-batch" case, as here the success/error handlers
				// provided during "submitChanges" aren't called.
				if (oModel.bUseBatch == false) {
					Log.error("sap.ui.generic.app.transaction.BaseController: Only ODataModel with batch mode enabled are supported!");
					BaseController.prototype.NonBatchEventHandlers = {};

					oModel.attachRequestCompleted(function(oEvent) {
						var sRequestId = oEvent.getParameters().ID;
						var oEventHandlerObj = BaseController.prototype.NonBatchEventHandlers[sRequestId];

						if (oEventHandlerObj && oEvent.getParameters().success) {
							oEventHandlerObj.success();
							delete BaseController.prototype.NonBatchEventHandlers[sRequestId];
						} else if (oEventHandlerObj && !oEvent.getParameters().success) {
							oEventHandlerObj.error();
							delete BaseController.prototype.NonBatchEventHandlers[sRequestId];
						}
					});
				}

				// inherit from event provider.
				EventProvider.apply(this, arguments);

				this.sName = "sap.ui.generic.app.transaction.BaseController";
				this._oModel = oModel;
				this._oMeta = oModel.getMetaModel();
				this._oDraftUtil = new DraftUtil();
				this._oModelUtil = new ModelUtil(oModel);

				if (oQueue) {
					this._oQueue = oQueue;
				} else {
					this._oQueue = new Queue();
					this._bOwnsQueue = true;
				}
				
				if (oDraftMergeTimer) {
					this._oDraftMergeTimer = oDraftMergeTimer;
				} else {
					this._oDraftMergeTimer = {
						"nTimeoutID": null
					};
				}

				this._initCounts();
			}
		});

		/**
		 * Attaches event handler <code>fnFunction</code> to the <code>fatalError</code> event.
		 *
		 * @param {function} fnFunction The function to call when the event occurs
		 * @param {object} [oListener] Object on which to call the given function
		 * @public
		 */
		BaseController.prototype.attachFatalError = function (fnFunction, oListener) {
			this.attachEvent("fatalError", fnFunction, oListener);
		};

		/**
		 * Detaches event handler <code>fnFunction</code> from the <code>fatalError</code> event.
		 *
		 * @param {function} fnFunction The function to call when the event occurs
		 * @param {object} [oListener] Object on which to call the given function
		 * @public
		 */
		BaseController.prototype.detachFatalError = function (fnFunction, oListener) {
			this.detachEvent("fatalError", fnFunction, oListener);
		};

		/**
		 * Prepares an action invocation, as it checks the existence of the function import and correctness of function import parameters.
		 *
		 * @param {string} sFunctionImportName The name of the function or action
		 * @param {sap.ui.model.Context} oContext The given binding context
		 * @param {map} mParameters Parameters to control the behavior of the action invocation
		 * @returns {map} The parameters used to invoke the action
		 * @throws {Error} Throws an error if the function import does not exist or the action input parameters are invalid
		 * @private
		 */
		BaseController.prototype._prepareCallAction = function (sFunctionImportName, oContext, mParameters) {
			var oEntitySet, oEntityType, oEntity, sEntitySet, aKeyProperties;

			// check the input.
			if (!sFunctionImportName) {
				throw new Error("Invalid Function Import");
			}

			mParameters.urlParameters = mParameters.urlParameters || {};
			mParameters.functionImport = this._oMeta.getODataFunctionImport(sFunctionImportName.split("/")[1]);

			if (!mParameters.functionImport) {
				throw new Error("Unknown Function Import " + sFunctionImportName);
			}

			// retrieve current entity set from binding context
			if (oContext) {
				sEntitySet = ModelUtil.getEntitySetFromContext(oContext);
				oEntitySet = this._oMeta.getODataEntitySet(sEntitySet, false);
				oEntityType = this._oMeta.getODataEntityType(oEntitySet.entityType, false);
				aKeyProperties = oEntityType.key.propertyRef;
				oEntity = oContext.getObject();
			}
			if (oEntity) {
				this._getActionParameters(oEntity, mParameters, aKeyProperties);
				this._getAdditionalActionParameters(oEntity, mParameters, aKeyProperties);
				// etag handling for bound actions
				this._getActionRequestHeaders(oContext, oEntity, mParameters);
			}

			return mParameters;
		};

		/**
		 * Invokes an action with the given name.
		 *
		 * @param {string} sFunctionImportName The name of the function or action
		 * @param {sap.ui.model.Context} oContext The given binding context
		 * @param {map} mParameters Parameters to control the behavior of the action invocation
		 * @param {map} mParameters.urlParameters An optional map containing the parameters that will be passed as query strings
		 * @param {string} mParameters.batchGroupId BatchGroupId for this request
		 * @param {string} mParameters.changeSetId ChangeSetId for this request
		 * @param {string} [mParameters.expand] indicates whether root needs to expanded
		 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the action
		 * @throws {Error} Throws an error if the function import does not exist or the action input parameters are invalid
		 * @private
		 */
		BaseController.prototype._callAction = function (sFunctionImportName, oContext, mParameters) {
			var that = this;

			if (!mParameters.urlParameters || !mParameters.functionImport) {
				mParameters = this._prepareCallAction(sFunctionImportName, oContext, mParameters);
			}

			return new Promise(function (resolve, reject) {
				var sFunctionImport, mCallBacks;

				sFunctionImport = "/" + mParameters.functionImport.name;
				mCallBacks = that._getRequestCallbacks(resolve, reject);

				that._oModel.callFunction(sFunctionImport, {
					method: mParameters.functionImport.httpMethod,
					urlParameters: mParameters.urlParameters,
					success: mCallBacks.success,
					error: mCallBacks.error,
					batchGroupId: mParameters.batchGroupId,
					changeSetId: mParameters.changeSetId,
					headers: mParameters.headers,
					expand: mParameters.expand
				});
			});
		};


		/**
		 * Prepares an action call and returns a handle that grants access to a action-specific model
		 * context.
		 *
		 * @param {sap.ui.model.Context} oContext The given binding context.
		 * @param {map} mParameters Parameters to control the behavior of the action invocation.
		 * @param {map} mParameters.urlParameters An optional map containing the parameters that will be passed as query strings.
		 * @param {string} mParameters.batchGroupId BatchGroupId for this request.
		 * @param {string} mParameters.changeSetId ChangeSetId for this request.
		 * @param {string} mParameters.functionImport <code>Map</code> with information about the function import.
		 * @param {string} mParameters.headers Header fields that shall be sent with the function import.
		 *
		 * @returns {map} A <code>map</code> that contains:
		 *                <code>context</code> A <code>Promise</code> that provides the action-specific model context when it resolves.
		 *                <code>result</code> A <code>Promise</code> that resolves when the success handler is called and rejects when the error handler is called.
		 *                <code>abort</code> A <code>function</code> to cancel the function import call.
		 *
		 *
		 * @throws {Error} Throws an error if the function import does not exist or the action input parameters are invalid
		 *
		 * @private
		 */
		BaseController.prototype._createFunctionContext = function (oContext, mParameters) {
			var mActionHandle = {};
			var mCallbacks;
			var oHandle;
			var that = this;

			mActionHandle.result = new Promise(function (fnResolve, fnReject) {
				mCallbacks = that._getRequestCallbacks(fnResolve, fnReject);
			});

			this._getActionRequestHeaders(oContext, oContext.getObject(), mParameters);

			oHandle = this._oModel.callFunction(
				"/" + mParameters.functionImport.name,
				{
					method: mParameters.functionImport.httpMethod,
					urlParameters: mParameters.urlParameters,
					success: mCallbacks.success,
					error: mCallbacks.error,
					batchGroupId: mParameters.batchGroupId,
					changeSetId: mParameters.changeSetId,
					headers: mParameters.headers,
					eTag: that._oModel.getETag(oContext.getPath()),
					expand: mParameters.expand
				}
			);

			mActionHandle.context = oHandle.contextCreated();
			mActionHandle.abort = oHandle.abort;
			return mActionHandle;
		};


		/**
		 * Calculates the action header parameters - only for ETag so far.
		 *
		 * @param {sap.ui.model.Context} oContext The given binding context
		 * @param {object} oEntity The given entity.
		 * @param {map} mParameters Parameters to control the behavior of the action invocation.
		 * @throws {Error} Throws an error if the function import does not exist or the action input parameters are invalid
		 * @private
		 */
		BaseController.prototype._getActionRequestHeaders = function (oContext, oEntity, mParameters) {
			// bound actions have OData v2 annotation action-for and work on entity level: ETags only for bound actions
			var sETag;

			if (!mParameters.headers) {
				mParameters.headers = {};
			}

			// set ETag only, if it hasn't been set before, e.g. due to an overwrite action on UI -> value = '*'
			if (!mParameters.headers["If-Match"] && mParameters.functionImport["sap:action-for"]) {
				sETag = this._oModel.getETag(null, oContext, oEntity);

				if (sETag) {
					mParameters.headers["If-Match"] = sETag;
				}
			}
		};

		/**
		 * Calculates the action parameters.
		 *
		 * @param {object} oEntity The given entity
		 * @param {map} mParameters Parameters to control the behavior of the action invocation
		 * @param {array} aKeyProperties The key properties
		 * @returns {map} The action parameters
		 * @throws {Error} Throws an error if the function import does not exist or the action input parameters are invalid
		 * @private
		 */
		BaseController.prototype._getActionParameters = function (oEntity, mParameters, aKeyProperties) {
			var i, isFunctionImportParameter, length = aKeyProperties.length, mActionParameters = {}, sActionFor;

			// Bound actions have OData v2 annotation "sap:action-for" and work on entity level -> parameter of function import
			// need to contain all key properties of the corresponding entity type, except the draft properties (IsActiveEntity and DraftUUID).
			// Instance level actions without "sap:action-for" do not need to fulfill the requirement to have all keys of the entity
			// types as parameters -> therefore no hard check for completeness of key parameters.
			sActionFor = mParameters.functionImport["sap:action-for"];

			isFunctionImportParameter = function (sPropertyName) {
				if (mParameters.functionImport.parameter) {
					var j, len = mParameters.functionImport.parameter.length;

					for (j = 0; j < len; j++) {
						if (mParameters.functionImport.parameter[j].name === sPropertyName) {
							return true;
						}
					}
				}

				return false;
			};

			if (!mParameters.functionImport.parameter && sActionFor) {
				Log.error("Action doesn't have any parameters");
				throw new Error("Action doesn't have any parameters");
			}

			// Map action parameters and check whether every key field of the entitytype is represented as action parameter (execption: draft parameters).
			// (based on the assumption that entitytype property and action parameter are named equal)
			for (i = 0; i < length; i++) {
				if (isFunctionImportParameter(aKeyProperties[i].name)) {
					mParameters.urlParameters[aKeyProperties[i].name] = oEntity[aKeyProperties[i].name];
				} else if (sActionFor && (aKeyProperties[i].name != "IsActiveEntity" || aKeyProperties[i].name != "DraftUUID")) {
					// only raise errors for bound actions if key is not part of function import parameters AND key is not technical draft parameter
					Log.error("Action does not contain a equally-named parameter for key property: " + aKeyProperties[i].name);
					throw new Error("Action does not contain a equally-named parameter for key property: " + aKeyProperties[i].name);
				}
			}
			return mActionParameters;
		};

		/**
		 * Calculates the action parameters.
		 *
		 * @param {object} oEntity The given entity
		 * @param {map} mParameters Parameters to control the behavior of the action invocation
		 * @param {array} aKeyProperties The key properties
		 * @throws {Error} Throws an error if the function import does not exist or the action input parameters are invalid
		 * @private
		 */
		BaseController.prototype._getAdditionalActionParameters = function (oEntity, mParameters, aKeyProperties) {
			var j, length = 0, oParameterName;
			var fnIsKeyProperty = function (sParameterName) {
				var i = 0, len = aKeyProperties.length;

				for (i = 0; i < len; i++) {
					if (aKeyProperties[i].name === sParameterName) {
						return true;
					}
				}
				return false;
			};

			if (mParameters.functionImport.parameter) {
				length = mParameters.functionImport.parameter.length;
			}

			if (length > aKeyProperties.length) {
				// additional parameters have to be passed although part of entity
				for (j = 0; j < length; j++) {
					oParameterName = mParameters.functionImport.parameter[j];

					if (!fnIsKeyProperty(oParameterName.name)) {
						// accept also empty parameters e.g. empty string or optional parameters (nullable=true)
						// if nullable is not set -> default is currently false on client - ideally be true
						// reason ->  Gateway rejects requests which do not contain parameters which don't have the nullable attribute at all
						var bNullable = (oParameterName.nullable === "true") ? true : false;
						if (!mParameters.urlParameters.hasOwnProperty(oParameterName.name) && !bNullable) {
							Log.error("Unknown parameter " + oParameterName.name);
							throw new Error("Unknown parameter " + oParameterName.name);
						}
					}
				}
			}
		};

		/**
		 * Triggers a GET request to the OData service that has been specified in the model constructor. The data will be stored in the model. The requested data is returned with the response.
		 *
		 * @param {string} sPath The path to the data that is retrieved
		 * @param {map} mParameters Parameters to control the behavior of the request
		 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the request
		 * @private
		 */
		BaseController.prototype._read = function (sPath, mParameters, bIsSideEffect) {
			var that = this;
			var mCallBacks, urlParams;
			if (mParameters.readParameters) {
				urlParams = mParameters.readParameters;
			} else if (mParameters.urlParameters) {
				urlParams = mParameters.urlParameters;
			}
			if (bIsSideEffect) {
				return that._oModel.requestSideEffects(mParameters.context, {	
					groupId: mParameters.batchGroupId,
					urlParameters: urlParams
				});
			} 
				
			return new Promise(function (resolve, reject) {
				

				

					mCallBacks = that._getRequestCallbacks(resolve, reject);
	
					 
						that._oModel.read(sPath, {
							context: mParameters.context,
							success: mCallBacks.success,
							error: mCallBacks.error,
							batchGroupId: mParameters.batchGroupId,
							changeSetId: mParameters.changeSetId,
							urlParameters: urlParams
						});
					
	
					
				});
			
			
		};

		/**
		 * Triggers a delete request.
		 *
		 * @param {string} sPath The path identifying the entity to be removed
		 * @param {map} mParameters Parameters to control the behavior
		 * @returns {Promise} A <code>Promise</code> for asynchronous execution
		 * @private
		 */
		BaseController.prototype._remove = function (sPath, mParameters) {
			var that = this;

			return new Promise(function (resolve, reject) {
				var mCallBacks = that._getRequestCallbacks(resolve, reject);

				that._oModel.remove(sPath, {
					success: mCallBacks.success,
					error: mCallBacks.error,
					eTag: "*",
					batchGroupId: mParameters.batchGroupId,
					changeSetId: mParameters.changeSetId,
					headers: mParameters.headers

				});
			});
		};

		/**
		 * Triggers a synchronous delete request and calls the given success or error callback function afterwards.
		 *
		 * @param {string} sPath The path identifying the entity to be removed
		 * @param {map} mParameters Parameters that control the behavior
		 * @param {function} fnSuccess A callback function that is called in case of success
		 * @param {function} fnError A callback function that is called in case of error
		 * @returns {object} an object which has an <code>abort</code> function to abort the current request
		 *
		 * @private
		 * @experimental
		 */
		BaseController.prototype._syncRemove = function (sPath, mParameters, fnSuccess, fnError) {
			var mCallBacks = this._getRequestCallbacks(fnSuccess, fnError);

			return this._oModel.remove(sPath, {
				success: mCallBacks.success,
				error: mCallBacks.error,
				eTag: "*",
				batchGroupId: mParameters.batchGroupId,
				changeSetId: mParameters.changeSetId
			});
		};

		/**
		 * Submits all changes that were collected by the currently used model or does nothing,
		 * when submit is not allowed at the moment.
		 *
		 * @param {map} mParameters Parameters to control the submit behavior
		 * @param {string} mParameters.batchGroupId The ID of the batch group to use for the submit
		 * @param {string} mParameters.eTag The ETag to use for the submit
		 * @param {boolean} [mParameters.forceSubmit] Forces a submit to the back-end
		 * @returns {Promise} A <code>Promise</code> for asynchronous execution which resolves either
		 *                      with responseData and httpRequest or empty (when nothing is done)
		 *
		 * @private
		 */
		BaseController.prototype._submitChanges = function (mParameters) {
			var that = this;

			// Just resolve the promise when nothing is done (it's not an error...)
			if (!this._checkSubmit(mParameters)) {
				return Promise.resolve({ context: mParameters && mParameters.context });
			}
			if (this._oModel.bUseBatch == true) {
				return new Promise(function (resolve, reject) {
					var mCallbacks = that._getRequestCallbacks(resolve, reject);
					that._oModel.submitChanges({
						batchGroupId: mParameters.batchGroupId,
						success: mCallbacks.success,
						error: mCallbacks.error,
						eTag: mParameters.eTag
					});
				});

			} else {
				return new Promise(function (resolve, reject) {
					var mCallbacks = that._getRequestCallbacks(resolve, reject);

					//Add event handlers in non-batch mode
					if (mParameters.batchGroupId
						&& this._oModel.mDeferredRequests
						&& this._oModel.mDeferredRequests[mParameters.batchGroupId]
						&& this._oModel.mDeferredRequests[mParameters.batchGroupId].changes) { // .changes contains POSTed values
						// It is not enough to check if deferred requests exist for the given BatchGrouId, as the corresponding requests are maybe already
						// aborted. Therefore, an additional check has to be done:
						// Is there at least one entry in the request section that doesn't have a "_aborted" flag or where this is set to false?
						var aChanges = this._oModel.mDeferredRequests[mParameters.batchGroupId].changes[mParameters.changeSetId]  || [];
						for (var i = 0; i < aChanges.length; i++) {
							if (aChanges[i].request._aborted == undefined || aChanges[i].request._aborted == false) {
								//Register Request for Change Handler:
								BaseController.prototype.NonBatchEventHandlers[aChanges[i].request.requestID] = {
									"success" : mCallbacks.success,
									"error": mCallbacks.error
								};
							}
						}
					}
					if (mParameters.batchGroupId
						&& this._oModel.mDeferredRequests
						&& this._oModel.mDeferredRequests[mParameters.batchGroupId]
						&& this._oModel.mDeferredRequests[mParameters.batchGroupId].requests) { // .requests contains an array GET requests
						// It is not enough to check if deferred requests exist for the given BatchGrouId, as the corresponding requests are maybe already
						// aborted. Therefore, an additional check has to be done:

						var aRequests = this._oModel.mDeferredRequests[mParameters.batchGroupId].requests;

						for (var i = 0; i < aRequests.length; i++) {
							if (aRequests[i].request._aborted == undefined || aRequests[i].request._aborted == false ) {
								//Register Request for Change Handler:
								BaseController.prototype.NonBatchEventHandlers[aRequests[i].request.requestID] = {
									"success" : mCallbacks.success,
									"error": mCallbacks.error
								};
							}
						}
					}

					that._oModel.submitChanges({
						batchGroupId: mParameters.batchGroupId,
						eTag: mParameters.eTag
					});
				}.bind(this));
			}
		};

		/**
		 * Checks whether a request has to be submitted to the back-end.
		 *
		 * @param {map} mParameters parameters to control the submit behavior
		 * @param {string} mParameters.batchGroupId the ID of the batch group to use for the submit
		 * @param {string} mParameters.eTag the eTag to use for the submit
		 * @param {boolean} [mParameters.forceSubmit] forces a submit to the back-end
		 * @returns {boolean} <code>true</code>, if a submit has to be triggered, <code>false</code> otherwise.
		 * @private
		 */
		BaseController.prototype._checkSubmit = function(mParameters) {
			// Take into consideration that no pending changes might exist and that some
			// client just might want to execute some action => forceSubmit.
			// without forceSubmit, interaction would be pending.
			if (this._oModel.hasPendingChanges()) {
				mParameters.pendingChanges = true;
				return true;
			}

			if (mParameters.forceSubmit && mParameters.forceSubmit == true) {
				// This is to avoid blocked Smart Template UIs:
				// Currently multiple logically separate requests can potentially be triggered in one
				// batch. so the result can be that we attempt to submit "empty" batch groups, which
				// will not trigger the success and error handler of the OData model's submitChanges()
				// and therefore ends in blocked UIs, as for example the busy animation is not removed.
				// Here this situation is identified for both, property changes and changing function
				// imports ("changes" array) and read requests and reading function imports
				// ("requests" array):
				if (mParameters.batchGroupId
					&& this._oModel.mDeferredRequests
					&& this._oModel.mDeferredRequests[mParameters.batchGroupId]
					&& this._oModel.mDeferredRequests[mParameters.batchGroupId].changes) { // .changes contains POSTed values

					// It is not enough to check if deferred requests exist for the given BatchGroupId, as the corresponding requests are maybe already
					// aborted. Therefore, an additional check has to be done:
					// Is there at least one entry in the request section that doesn't have a "_aborted" flag or where this is set to false?
					// This needs to be done for all ChangeSetIds below the given BatchGroupId (as "submitChanges()" works with the given BatchGroupId but
					// fires all created and assigned changeSetIds).
					var oChangeGroups = this._oModel.mDeferredRequests[mParameters.batchGroupId].changes;
					var aChangeGroupNames = [];
					var aAllChanges = [];
					var aChanges;
					for (var sKey in oChangeGroups) {
						if (oChangeGroups.hasOwnProperty(sKey)) {
							aChangeGroupNames.push(sKey);
						}
					}

					for (var i = 0; i < aChangeGroupNames.length; i++) {
						aChanges = this._oModel.mDeferredRequests[mParameters.batchGroupId].changes[aChangeGroupNames[i]]  || [];
						aAllChanges = aAllChanges.concat(aChanges);
					}

					for (var i = 0; i < aAllChanges.length; i++) {
						if (aAllChanges[i].request._aborted == undefined || aAllChanges[i].request._aborted == false) {
							return true;
						}
					}
				}

				if (mParameters.batchGroupId
					&& this._oModel.mDeferredRequests
					&& this._oModel.mDeferredRequests[mParameters.batchGroupId]
					&& this._oModel.mDeferredRequests[mParameters.batchGroupId].requests) { // .requests contains an array GET requests
					// It is not enough to check if deferred requests exist for the given BatchGrouId, as the corresponding requests are maybe already
					// aborted. Therefore, an additional check has to be done:
					// Is there at least one entry in the request section that doesn't have a "_aborted" flag or where this is set to false?
					var aRequests = this._oModel.mDeferredRequests[mParameters.batchGroupId].requests || [];

					for (var i = 0; i < aRequests.length; i++) {
						if (aRequests[i].request._aborted == undefined || aRequests[i].request._aborted == false ) {
							return true;
						}
					}
				}
			}
			// Nothing found for submission (although forceSubmit was set nothing will be submitted)
			return false;
		};

		/**
		 * Triggers submitting the currently tracked changes to the back-end.
		 *
		 * @param {map} mParameters Parameters to control the submit behavior
		 * @param {boolean} mParameters.noBlockUI If set to <code>true</code>, the current user interface is not blocked by a busy animation
		 * @param {boolean} mParameters.noShowResponse If set to <code>true</code>, no success and error messages are shown
		 * @param {boolean} mParameters.noShowSuccessToast If set to <code>true</code>, the success message is not shown in a toast
		 * @param {string} mParameters.successMsg An optional success message
		 * @param {string} mParameters.failedMsg An optional error message
		 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the submit
		 * @public
		 */
		BaseController.prototype.triggerSubmitChanges = function (mParameters) {
			var that = this, fFunc,fRaiseError;

			// check and default the input.
			mParameters = mParameters || {};
			mParameters.successMsg = mParameters.successMsg || "Action succeeded";
			mParameters.failedMsg = mParameters.failedMsg || "Action failed";

			fRaiseError = function(oError) {
				// notify possible listeners of the fatal error situation.
				that.fireEvent("fatalError", {
					response: oError
				});

				throw oError;
			};

			if (this._oDraftMergeTimer.nTimeoutID) {
				clearTimeout(this._oDraftMergeTimer.nTimeoutID);
				this._oDraftMergeTimer.nTimeoutID = null;
			}

			fFunc = function() {
				return that._submitChanges(mParameters).then(function(oResponse) {

					var _check = function(oResponse, mParameters) {
						// check for "implicitly" triggered merge requests that failed.
						try {
							that._checkImplicitError({httpResponse: oResponse, responseData: oResponse.data}, mParameters);

							// mind nesting of promises.
							return that._normalizeResponse({httpResponse: oResponse, responseData: oResponse.data}, true);

						} catch (oError) {
							fRaiseError(oError);
						}
					};

					// If a batch request is sent, traversal over the inner structure of the response is needed
					// to check all contained results.
					var oBatchResponse;
					var oChangeResponse;
					var aNormalizedResponses = [];

					if (oResponse && oResponse.responseData && oResponse.responseData.__batchResponses) {
						// Special case: BatchResponse structure there, but only one entry there.
						// Handle like a "single request/response" pair
						if (oResponse.responseData.__batchResponses.length == 1 && oResponse.responseData.__batchResponses[0].__changeResponses && oResponse.responseData.__batchResponses[0].__changeResponses.length == 1) {
							return _check(oResponse.responseData.__batchResponses[0].__changeResponses[0], mParameters);
						}

						for (var i = 0; i < oResponse.responseData.__batchResponses.length; i++) {
							oBatchResponse = oResponse.responseData.__batchResponses[i];


							if (oBatchResponse.__changeResponses) {

								for (var j = 0; j < oBatchResponse.__changeResponses.length; j++) {
									oChangeResponse = oBatchResponse.__changeResponses[j];

									aNormalizedResponses.push(_check(oChangeResponse, mParameters));
								}

							} else {
								// direct data in the batch response
								return _check(oBatchResponse, mParameters);

							}

						}

					} else {
						// No batch response at all - do it as it was until today...
						try {
							that._checkImplicitError(oResponse, mParameters);

							// mind nesting of promises.
							return that._normalizeResponse(oResponse, true);

						} catch (oError) {
							fRaiseError(oError);
						}
					}

					return aNormalizedResponses;

				}, function(oResponse) {
					var oResponseOut = that._normalizeError(oResponse);

					// this call back is only invoked, if the complete request fails.
					// so if an operation in a change set fails, this is technically considered a success;
					// especially failure of individual requests does not lead to invocation of this call back.

					fRaiseError(oResponseOut);
				});
			};

			// enqueue the item to process HTTP requests in sequence.
			return this._oQueue.enqueue(fFunc, {
				draftSave: mParameters.draftSave,
				actionInvokedWithPendingChanges: mParameters.actionInvokedWithPendingChanges
			});
		};

		/**
		 * Triggers updating an active context in backend.
		 * 
		 * @param {string} sContextPath path of the context to be updated.
		 * @param {object} oUpdateData data to be updated in selected context.
		 * @param {integer} iIndex index to create different changeSetIds.
		 *
		 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the update
		 * @private
		 */
		BaseController.prototype._updateEntity = function (sContextPath, oUpdateData, iIndex) {
			var that = this;
			return  new Promise(function (resolve, reject) {
				var mCallbacks = that._getRequestCallbacks(resolve, reject);
				var mParameters = {
					success: mCallbacks.success,
					error: mCallbacks.error,
					batchGroupId: "changes",
					changeSetId: "changes" + iIndex
					};
					that._oModel.update(sContextPath, oUpdateData, mParameters);
			});
		};

		/**
		 * Adds an operation to the Queue
		 * @param {function} fnFunction function that needs to return a <code>Promise</code>.
		 * @param {map} mEventParameters <code>Map</code> with parameters.
		 *
		 * @experimental
		 *
		 * @private
		 */
		BaseController.prototype.addOperationToQueue = function (fnFunction, mEventParameters) {
			this._oQueue.enqueue(fnFunction, mEventParameters);
		};

		/**
		 * Attach to queue event that is fired whenever an item is going to be executed
		 * @param {function} fnFunction event handler function
		 * @experimental
		 */
		BaseController.prototype.attachBeforeQueueItemProcess = function (fnFunction) {
			this._oQueue._attachEvent('beforeQueueItemProcess', fnFunction);
		};
		/**
		 * Detach to queue event that is fired whenever an item is going to be executed
		 * @param {function} fnFunction event handler function
		 * @experimental
		 */
		BaseController.prototype.detachBeforeQueueItemProcess = function (fnFunction) {
			this._oQueue._detachEvent('beforeQueueItemProcess', fnFunction);
		};
		/**
		 * Attach to queue event that is fired once the last item in the queue was processed
		 * @param {function} fnFunction event handler function
		 * @experimental
		 */
		BaseController.prototype.attachOnQueueCompleted = function (fnFunction) {
			this._oQueue._attachEvent('onQueueCompleted', fnFunction);
		};
		/**
		 * Detach to queue event that is fired once the last item in the queue was processed
		 * @param {function} fnFunction event handler function
		 * @experimental
		 */
		BaseController.prototype.detachOnQueueCompleted = function (fnFunction) {
			this._oQueue._detachEvent('onQueueCompleted', fnFunction);
		};
		/**
		 * Attach to queue event that is fired once one item in the queue fails
		 * @param {function} fnFunction event handler function
		 * @experimental
		 */
		BaseController.prototype.attachOnQueueFailed = function (fnFunction) {
			this._oQueue._attachEvent('onQueueFailed', fnFunction);
		};
		/**
		 * Detach to queue event that is fired once one item in the queue fails
		 * @param {function} fnFunction event handler function
		 * @experimental
		 */
		BaseController.prototype.detachOnQueueFailed = function (fnFunction) {
			this._oQueue._detachEvent('onQueueFailed', fnFunction);
		};


		/**
		 * Checks for client messages.
		 *
		 * @returns {Promise} If client-side messages exist a rejected promise is returned, <code>null</code> otherwise
		 * @public
		 */
		BaseController.prototype.hasClientMessages = function () {
			if (this._oModelUtil.hasClientMessages()) {
				return Promise.reject(new Error("Client messages detected"));
			}

			return null;
		};

		/**
		 * Converts the response into an object with three properties: <code>response</code> that represents the response of the HTTP request,
		 * <code>context</code> that is the binding context and <code>data</code> that contains the parsed response data. the <code>data</code> property
		 * can contain also an array with __batchResponses. See APIDoc of ODataModel submitChanges success event handler for details.
		 *
		 * @param {object} oResponse The given response
		 * @param {boolean} bContext Flag indicating whether context has to be added
		 * @returns {object} The response object
		 * @private
		 */
		BaseController.prototype._normalizeResponse = function (oResponse, bContext) {
			if (oResponse && (oResponse.httpResponse || oResponse.responseData)) {
				return {
					data: oResponse.responseData,
					response: oResponse.httpResponse || null,
					context: bContext ? this._oModelUtil.getContextFromResponse(oResponse.responseData) : null
				};
			}

			return oResponse;
		};

		/**
		 * Converts the error response into an object with one property, <code>response</code>, which represents the response of the failed HTTP
		 * request.
		 *
		 * @param {object} oResponse The given response
		 * @returns {object} The response object
		 * @private
		 */
		BaseController.prototype._normalizeError = function (oResponse) {
			if (oResponse && oResponse.message) {
				return {
					response: oResponse
				};
			}

			return oResponse;
		};

		/**
		 * Creates a sync point for using multiple promises and returns a promise to use for chaining.
		 *
		 * @param {array} aPromises The promises
		 * @returns {Promise} A promise for chaining
		 * @private
		 */
		BaseController.prototype._returnPromiseAll = function (aPromises) {
			return Promise.all(aPromises).then(function (oResponse) {
				// on successful execution an array of the collected responses for all sub-ordinate promises is created by Promise.all and returned.
				// so take the first response, as it has a context object.
				if (oResponse.length) {
					return oResponse[0];
				}

				return oResponse;
			});
		};

		/**
		 * Returns a promise which resolves if the given promises have been executed with at least one successfully. It rejects if all given promises were rejected.
		 *
		 * @param {array} aPromises Array containing promises and a flag if the result should be included in the response
		 * @param {boolean} bDropLastResult When set to <code>true</code>, the result of the last <code>Promise</code> is not returned
		 *
		 * @returns {object} A promise which will wait for all given promises to finish.
		 *
		 * @since 1.40
		 * @private
		 */
		BaseController.prototype._atLeastOnePromiseResolved = function (aPromises, bDropLastResult) {
			var aResponses = [];
			var oReadyPromise = Promise.resolve(null);
			var bAtLeastOneSuccess = false;

			var aPromisesLength = aPromises.length;
			var fnResolve = function (oResponse) {
				if (!bDropLastResult) {
					aResponses.push(oResponse);
					bAtLeastOneSuccess = true;
				} else if (aPromisesLength - 1 > aResponses.length && bDropLastResult) {
					aResponses.push(oResponse);
					bAtLeastOneSuccess = true;
				}
			};

			aPromises.forEach(function (oPromise, iIndex) {
				oReadyPromise = oReadyPromise.then(function () {
					return oPromise;
				}).then(fnResolve, function (oError) {
					aResponses.push(oError);
				}, this);
			});

			return oReadyPromise.then(function () {

				if (bAtLeastOneSuccess) {
					return Promise.resolve(aResponses);
				} else {
					return Promise.reject(aResponses);
				}

			});
		};

		/**
		 * Checks a batch response for implicitly triggered patch or merge requests.
		 *
		 * @param {object} oResponse The response of the HTTP request
		 * @param {map} mParameters Parameters to control the submit behavior
		 * @param {boolean} mParameters.noBlockUI If set to <code>true</code> the current user interface is not blocked by a busy animation
		 * @param {boolean} mParameters.noShowResponse If set to <code>true</code> no success and error messages are shown
		 * @param {boolean} mParameters.noShowSuccessToast If set to <code>true</code> the success message is not shown in a toast
		 * @param {string} [mParameters.successMsg] An optional success message
		 * @param {string} [mParameters.failedMsg] An optional error message
		 * @throws {object} Error object, if a requests was triggered that submits implicitly changes to the back-end.
		 * @private
		 */
		BaseController.prototype._checkImplicitError = function (oResponse, mParameters) {
			var oPart, oParsed, iStatus, bCounts = false;

			// check the counters
			if (this._mCounts.requestSent === 1 && this._mCounts.requestCompleted === 1) {
				bCounts = true;
			}

			this._initCounts();

			// If a batch request with one batch containing only changes has been sent to the back-end
			// and fails, the "success" call-back is invoked.
			// so we check for error in such situations.
			if (mParameters.pendingChanges && bCounts) {
				if (oResponse && oResponse.httpResponse) {
					oPart = oResponse.httpResponse;
				}

				if (oPart && oPart.response && oPart.response.statusCode) {
					iStatus = parseInt(oPart.response.statusCode);

					// check whether the request failed and throw in this case an exception.
					if (iStatus < 200 || iStatus > 299) {
						oParsed = this._parseError(oPart);
						throw this._normalizeError(oParsed);
					}
				}
			}
		};

		/**
		 * Converts a batch response part to an error message.
		 *
		 * @param {object} oPart The response part
		 * @returns {object} Error message
		 * @private
		 */
		BaseController.prototype._parseError = function (oPart) {
			var oResult = {};

			if (oPart.message) {
				oResult.message = oPart.message;
			}

			if (oPart.response) {
				oResult.statusCode = oPart.response.statusCode;
				oResult.statusText = oPart.response.statusText;
				oResult.headers = oPart.response.headers;
				oResult.responseText = oPart.response.body;
			}

			return oResult;
		};

		/**
		 * Sets the request counters to their initial state.
		 *
		 * @private
		 */
		BaseController.prototype._initCounts = function () {
			this._mCounts = {
				requestSent: 0,
				requestCompleted: 0
			};
		};

		/**
		 * Returns the call-backs for HTTP response handling.
		 *
		 * @param {function} resolve Callback from <code>Promise</code>
		 * @param {function} reject Callback from <code>Promise</code>
		 * @returns {map} Callback functions for success and error handling of HTTP responses
		 * @private
		 */
		BaseController.prototype._getRequestCallbacks = function (resolve, reject) {
			var that = this;

			// increment request count.
			this._mCounts.requestSent++;

			return {
				success: function (oData, oResponse) {
					// increment request completed count.
					that._mCounts.requestCompleted++;

					// resolve the promise.
					resolve({
						responseData: oData,
						httpResponse: oResponse
					});
				},
				error: function (oResponse) {
					// increment request completed count.
					that._mCounts.requestCompleted++;

					// reject the promise.
					reject(oResponse);
				}
			};
		};

		/**
		 * Frees all resources claimed during the life-time of this instance.
		 *
		 * @public
		 */
		BaseController.prototype.destroy = function () {
			if (this._oModelUtil) {
				this._oModelUtil.destroy();
			}

			if (this._oQueue && this._bOwnsQueue) {
				this._oQueue.destroy();
			}

			this._oModel = null;
			this._oMeta = null;
			this._oDraftUtil = null;
			this._oModelUtil = null;
			this._oDraftMergeTimer = null;
		};

		return BaseController;

	}, true);