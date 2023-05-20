/*
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./transaction/BaseController",
	"./transaction/TransactionController",
	"sap/ui/generic/app/util/ModelUtil",
	"sap/base/Log"
], function(jQuery, BaseController, TransactionController, ModelUtil, Log) {
	"use strict";

	/* global Promise */

	/**
	 * Constructor for application controller.
	 *
	 * @param {sap.ui.model.odata.v2.ODataModel} oModel The OData model currently used
	 * @param {sap.ui.core.mvc.View} oView The current view
	 *
	 * @throws {Error} If no model is handed over as input parameter
	 *
	 * @class Application Controller.
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @public
	 * @experimental Since 1.32.0
	 * @since 1.32.0
	 * @alias sap.ui.generic.app.ApplicationController
	 */
	var ApplicationController = BaseController.extend("sap.ui.generic.app.ApplicationController", {

		constructor: function (oModel, oView) {
			BaseController.apply(this, [
				oModel
			]);

			this._oGroupChanges = {};
			this.sName = "sap.ui.generic.app.ApplicationController";
			this.oPropertyChangedResolve;
			this.oPropertyChangedReject;
			this._initModel(oModel);
			this.registerView(oView);
		}
	});

	/**
	 * Notifies the application controller of a change of a property. Please note that the method is not meant for
	 * productive use currently. It is experimental.
	 *
	 * @param {string} sPath The path to the changed property
	 * @param {object} oContext The binding context in which the change occurred
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the action
	 * @experimental Since 1.32.0
	 * @public
	 */
	ApplicationController.prototype.propertyChanged = function (sPath, oContext, nIntervalInSeconds) {
		/* nIntervalInSeconds is intentionally left from the JSDoc as its meant to be consumed for Fiori Elements V2 library only
		   and not to be exposed externally. */
		var that = this, mParameters = {
			batchGroupId: "Changes",
			changeSetId: "Changes",
			onlyIfPending: true,
			noShowResponse: true,
			noBlockUI: true,
			draftSave: true // propertyChanged is currently only called for drafts therefore set this statically
		}, oSideEffect, oEntityType = {};

		// check if this change is part of a side effects group
		if (oContext && oContext instanceof sap.ui.model.Context) {
			var sEntitySet = ModelUtil.getEntitySetFromContext(oContext);
			var oMetaModel = oContext.getModel().getMetaModel();
			var sEntityType = oMetaModel.getODataEntitySet(sEntitySet).entityType;
			oEntityType = oMetaModel.getODataEntityType(sEntityType);
		}
		
		for (var sEntityTypeAttribute in oEntityType) {
			if (sEntityTypeAttribute.startsWith("com.sap.vocabularies.Common.v1.SideEffects")) {
				oSideEffect = oEntityType[sEntityTypeAttribute];
				if (oSideEffect.SourceProperties && oSideEffect.SourceProperties.length) {
					for (var i = 0; i < oSideEffect.SourceProperties.length; i++) {
						if (oSideEffect.SourceProperties[i].PropertyPath === sPath) {
							that.registerGroupChange(that._getSideEffectsQualifier(sEntityTypeAttribute));
						}
					}
				}
			}
		}

		if (!that._oDraftMergeTimer.nTimeoutID) {
			that.oResultPromise = new Promise(function (resolve, reject) {
				that.oPropertyChangedResolve = resolve;
				that.oPropertyChangedReject = reject;
				// queue the propertyChanged event in order to synchronize it correctly
				// with the sideEffects validateFieldGroup event
				that._oDraftMergeTimer.nTimeoutID = setTimeout(function () {
					that._oDraftMergeTimer.nTimeoutID = null;
					that.triggerSubmitChanges(mParameters).then(function (oResponse) {
						resolve(oResponse);
					}, function (oError) {
						reject(oError);
					});
				}, (oContext.isTransient() || !nIntervalInSeconds) ? 0 : (nIntervalInSeconds * 1000));
			});
		} else if (oContext.isTransient()) {	// for empty creation rows 
			that.triggerSubmitChanges(mParameters).then(function (oResponse) {
				that.oPropertyChangedResolve(oResponse);
			}, function (oError) {
				that.oPropertyChangedReject(oError);
			});
		}

		return that.oResultPromise;
	};

	/**
	 * Registers a change for the given group id.
	 *
	 * @param {string} sGroupId The group id where changes were done
	 * @experimental Since 1.32.0
	 * @public
	 */
	ApplicationController.prototype.registerGroupChange = function (sGroupId) {
		this._oGroupChanges[sGroupId] = true;
	};

	/**
	 * Registers the given view with the Application Controller.
	 *
	 * @param {sap.ui.core.mvc.View} oView The view to be registered
	 * @experimental Since 1.32.0
	 * @public
	 */
	ApplicationController.prototype.registerView = function (oView) {
		var that = this;

		if (oView) {
			// attach to the field group validation event.
			this._fnAttachValidateFieldGroup = function (oEvent) {
				var sID, oID, len, i, aIDs = [];

				var oBindingContext = this.getBindingContext();
				if (!oBindingContext) {
					return false;
				}

				if (!that.getTransactionController().getDraftController().getDraftContext().hasDraft(oBindingContext)) {
					// in case of non-draft do not immediately execute side effect, detach event
					this.detachValidateFieldGroup(that._fnAttachValidateFieldGroup);
					return false;
				}

				if (oEvent.mParameters.fieldGroupIds) {
					len = oEvent.mParameters.fieldGroupIds.length;
				}

				for (i = 0; i < len; i++) {
					sID = oEvent.mParameters.fieldGroupIds[i];
					oID = oView.data(sID);

					// make sure it is one of our IDs.
					if (oID) {
						aIDs.push({
							uuid: sID,
							objid: oID
						});
					}
				}

				that._onValidateFieldGroup(aIDs, oView);
			};
			oView.attachValidateFieldGroup(this._fnAttachValidateFieldGroup);
		}
	};

	/**
	 * Parametrizes the OData model.
	 *
	 * @param {sap.ui.model.odata.ODataModel} oModel The OData model currently used
	 * @private
	 */
	ApplicationController.prototype._initModel = function (oModel) {
		// set binding mode and refresh after change.

		if (oModel.getDefaultBindingMode() !== sap.ui.model.BindingMode.TwoWay) {
			Log.error("ApplicationController: The model's DefaultBindingMode wasn't but is now set to 'TwoWay'.");
			oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		}

		if (oModel.getRefreshAfterChange() !== false) {
			Log.error("ApplicationController: The model's setting 'RefreshAfterChange' wasn't but is now set to 'false'.");
			oModel.setRefreshAfterChange(false);
		}



		// set the batch groups:
		// it should be deferred, as it is for batching actions
		oModel.setDeferredBatchGroups([
			"Changes"
		]);
		oModel.setChangeBatchGroups({
			"*": {
				batchGroupId: "Changes",
				changeSetId: "Changes",
				single: false
			}
		});
	};

	/**
	 * Event handler for field-group-validation event of the view.
	 *
	 * @param {array} aGroups Field group IDs
	 * @param {object} oView reference to the view
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the submit
	 * @private
	 */
	ApplicationController.prototype._onValidateFieldGroup = function (aGroups, oView) {
		var i, len = aGroups.length, fRequest, mRequests = {
			bGlobal: false,
			aRequests: [],
			bHasTargets: true
		}, aValidityPromises = [], that = this;
		// calculate the requests to be triggered.
		//  the return response of _executeFieldGroup is transferred to promises that get resolved in order to wait for all promises to be settled before triggering the submit 
		for (i = 0; i < len; i++) {
			aValidityPromises.push(this._executeFieldGroup(aGroups[i], mRequests, oView).then(
				function() {
					return true;
				},
				function() {
					return false;
				})
			);
		}
		var fnValidityPromisesCallback = function(aResults) {
			// execute the requests to be triggered.
			if (aResults.find(function(bResult){
			    return bResult;
			    })){


					len = mRequests.aRequests.length;

					for (i = 0; i < len; i++) {
						fRequest = mRequests.aRequests[i];
						fRequest(mRequests.bGlobal);
					}

					// global side effect: so execute refresh of the complete model.
					if (mRequests.bGlobal) {
						that._oModel.refresh(true, false, "Changes");
					}

					// trigger flush.
					var oPromise = that.triggerSubmitChanges({
						batchGroupId: "Changes",
						noShowSuccessToast: true,
						forceSubmit: true,
						noBlockUI: true,
						urlParameters: {},
						draftSave: that._oModel.hasPendingChanges(true)
					});

					that.fireEvent("beforeSideEffectExecution", {
						promise: oPromise
					});

					return oPromise;
				}
		};
		return Promise.all(aValidityPromises).then(fnValidityPromisesCallback);
	};

	/**
	 * Executes the side effects for a single field group.
	 *
	 * @param {object} oGroup The given field group
	 * @param {map} mRequests Collection of all requests
	 * @param {object} oView Reference to the view
	 * @returns {Promise} resolved if any existing side effects have been executed, rejected when there are client errors or if side effects are skipped
	 * @private
	 */
	ApplicationController.prototype._executeFieldGroup = function (oGroup, mRequests, oView) {
		var sSideEffectsQualifier, oContext, oSideEffect, mParams = {
			batchGroupId: "Changes",
			changeSetId: "SideEffects",
			noShowSuccessToast: true,
			forceSubmit: true,
			noBlockUI: true,
			urlParameters: {}
		}, that = this;
		sSideEffectsQualifier = this._getSideEffectsQualifier(oGroup.objid.name);

		// set the side effects qualifier as action input.
		mParams.urlParameters.SideEffectsQualifier = sSideEffectsQualifier;

		oContext = oGroup.objid.contextObject;
		oSideEffect = this._getSideEffect(oGroup.objid);

		return this._hasClientErrors(oGroup.uuid, oView).then(function () {
			// if no errors proceed with side effect execution
			if (!that._oGroupChanges[sSideEffectsQualifier]) {
				return Promise.reject();
			}

			// set changes tracking to false.
			that._oGroupChanges[sSideEffectsQualifier] = false;

			// execute the side effect.
			that._executeSideEffects(oSideEffect, oContext, mParams, mRequests);

		});
	};

	/**
	 * Determines the side effect qualifier
	 *
	 * @param {string} sAnnotation The annotation path
	 * @returns {string} the side effect qualifier or empty in case of no qualifier
	 *
	 * @private
	 */
	ApplicationController.prototype._getSideEffectsQualifier = function (sAnnotation) {
		var sSideEffectQualifier = sAnnotation.replace("com.sap.vocabularies.Common.v1.SideEffects", "");
		if (sSideEffectQualifier.indexOf("#") === 0) {
			sSideEffectQualifier = sSideEffectQualifier.replace("#", "");
		}
		return sSideEffectQualifier;
	};


	/**
	 * Executes a side effects for given action contexts
	 *
	 * @param {object} oSideEffect The side effects annotation
	 * @param {sap.ui.model.Context} aContexts The given contexts
	 * @param {boolean} bTriggerChanges determines batchGroupId for non-draft applications
	 *
	 * @private
	 */
	ApplicationController.prototype._executeSideEffectsForActions = function (oSideEffect, aContexts, bTriggerChanges) {
		var fnRequest;
		var sConstantForBoundEntity = "_it/";
		var mRequests = {
			bGlobal: false,
			aRequests: [],
			bHasTargets: true
		};
		var mParams = {
			batchGroupId: "Changes",
			changeSetId: "SideEffects",
			noShowSuccessToast: true,
			forceSubmit: true,
			noBlockUI: true,
			urlParameters: {}
		};
		var i = 0;

		// For Non-draft applications, the call for invokeActions has batchGroupId as "NonDraftChanges"
		if (bTriggerChanges === false) {
			mParams.batchGroupId = "NonDraftChanges";
		}

		/*
		 As agreed with SAP consumption team in OData V2 we use the constant _it to define that the targets are relative
		 to the instance for which the action is executed for (bound action) - we remove this strings as the internal
		 _executeSideEffect method already requires a context (= the action context) and executes all side effects
		 relative from this context.
		 */

		if (oSideEffect.TargetEntities && oSideEffect.TargetEntities.length) {
			for (i = 0; i < oSideEffect.TargetEntities.length; i++) {
				if (oSideEffect.TargetEntities[i].NavigationPropertyPath.indexOf(sConstantForBoundEntity) === 0) {
					oSideEffect.TargetEntities[i].NavigationPropertyPath = oSideEffect.TargetEntities[i].NavigationPropertyPath.substr(4);
				}
			}
		}

		var fnAdjustTargetPropertiesProp = function(oTargetProperty, sProp) {
			var sTargetPropertyProp = oTargetProperty[sProp];
			if (sTargetPropertyProp && sTargetPropertyProp.startsWith(sConstantForBoundEntity)) {
				// removes "_it/"
				oTargetProperty[sProp] = sTargetPropertyProp.substr(4);
			}
		};
		(oSideEffect.TargetProperties || []).forEach(function(oTargetProperty) {
			["PropertyPath", "String"].forEach(fnAdjustTargetPropertiesProp.bind(null, oTargetProperty));
		});

		for (i = 0; i < aContexts.length; i++) {
			this._executeSideEffects(oSideEffect, aContexts[i], mParams, mRequests);

			if (mRequests.aRequests[0]) {
				fnRequest = mRequests.aRequests[0];
				fnRequest(mRequests.bGlobal);
				mRequests.aRequests = [];
			}
		}

		if (mRequests.bGlobal) {
			this._oModel.refresh(true, false, mParams.batchGroupId);
		}
	};


	/**
	 * Executes a side effects annotation and PreparationAction for draft on press of ENTER
	 *
	 * @param {object} oSideEffects The side effects annotation
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {map} mParameters Parameters to control the behavior of the request
	 * @param {map} mRequests Collection of all requests
	 *
	 * @private
	 */
	ApplicationController.prototype._executeSideEffects = function (oSideEffects, oContext, mParameters, mRequests) {
		var that = this, fFunction, sTriggerAction, bHasTargets;
		var oDraftController = that.getTransactionController().getDraftController();
		var bIsDraft = oDraftController.getDraftContext().hasDraft(oContext);

		if (oSideEffects.TriggerAction && oSideEffects.TriggerAction.String && bIsDraft) {
			sTriggerAction = oSideEffects.TriggerAction.String;
		}

		// collect URL parameters and check for global prepare.
		this._setSelect(oSideEffects, mParameters, mRequests, oContext);
		bHasTargets = mRequests.bHasTargets;
		// set the function to be executed to create the request.
		fFunction = function (bGlobal, mAdditionalParameters) {
			// For field control no preparation or validation action shall be executed.
			if (sTriggerAction) {
				/**
				 * ETag validation is not required for trigger action for ETag enabled draft apps
				 * as a single draft object cannot be edited by two different users simultaneously
				 * because of locking mechanism in the backend
				 */
				var sETag = that._oModel.getETag(oContext.getPath());
				if (sETag) {
					mParameters.headers = { "If-Match": "*" };
				}
				that._callAction(sTriggerAction, oContext , mParameters);
			} else if ( mAdditionalParameters && mAdditionalParameters.callPreparationOnDraftRoot && bIsDraft ) {
				// Always call preparationAction on the draft root for now
				delete mParameters.urlParameters.SideEffectsQualifier;
				oDraftController.prepareDraft(mAdditionalParameters.draftRootContext, mParameters);
			}

			if (!bGlobal && bHasTargets) {
				var mReadParameters = jQuery.extend({}, mParameters); // defensive copy
				mReadParameters.context = oContext;
				that._read("", mReadParameters, true);
			}
		};
		mRequests.aRequests.push(fFunction);
	};

	/**
	 * Checks the controls of the given group for client errors.
	 *
	 * @param {string} sGroupId The Id of the group.
	 * @param {object} oView Reference to the view
	 * @returns {Promise} <code>Promise</code> for validity check that is resolved when their are no errors and rejected if any error found.
	 * @private
	 */
	ApplicationController.prototype._hasClientErrors = function (sGroupId, oView) {
		var aControls, aCheckValidityPromise = [];

		aControls = oView.getControlsByFieldGroupId(sGroupId);
		aControls.forEach(function(oControl){
			var oParentControl = oControl.getParent(); // get parental SmartField
			var oSettings = {
				handleSuccess: false
			}; // by default checkValuesValidity function resets the value state of smartField to none, handleSuccess = false prevents the reset
			aCheckValidityPromise.push(oParentControl && oParentControl.checkValuesValidity && oParentControl.checkValuesValidity(oSettings));
		});
		return Promise.all(aCheckValidityPromise);

	};

	/**
	 * Creates a $select statement for rereading an entity based upon the side effects annotation.
	 *
	 * @param {object} oSideEffects The side effects annotation
	 * @param {map} mParameters Parameters to control the behavior of the request
	 * @param {map} mRequests Collection of all requests
	 * @param {sap.ui.model.Context} oContext The given binding context
	 *
	 * @private
	 */
	ApplicationController.prototype._setSelect = function (oSideEffects, mParameters, mRequests, oContext) {
		var i, len = 0, oTarget, aSelect = [], aExpand = [], aTargetEntities = [], sNavigationPath;

		if (!mRequests.bGlobal) {
			if ((!oSideEffects.TargetEntities || oSideEffects.TargetEntities.length === 0) && (!oSideEffects.TargetProperties || oSideEffects.TargetProperties.length === 0)) {
				mRequests.bHasTargets = false;
				return;
			}

			if (oSideEffects.TargetEntities) {
				len = oSideEffects.TargetEntities.length;

				if (len > 0) {
					for (i = 0; i < len; i++) {
						oTarget = oSideEffects.TargetEntities[i];

						if (oTarget.NavigationPropertyPath === "") {
							aSelect.push('*');
						} else {
							aSelect.push(oTarget.NavigationPropertyPath);
							if (aExpand.indexOf(oTarget.NavigationPropertyPath) === -1) {
								aExpand.push(oTarget.NavigationPropertyPath);
							}
						}
						aTargetEntities.push(oTarget.NavigationPropertyPath);
					}
				}
			}

			if (oSideEffects.TargetProperties) {
				len = oSideEffects.TargetProperties.length;

				if (len > 0) {
					for (i = 0; i < len; i++) {
						oTarget = oSideEffects.TargetProperties[i];
						sNavigationPath = "";

						if (oTarget.PropertyPath ? oTarget.PropertyPath.indexOf("/") !== -1 : oTarget.String.indexOf("/") !== -1) {
							var sEntitySet = ModelUtil.getEntitySetFromContext(oContext);
							var oMetaModel = this._oModel.getMetaModel();
							var sEntityType = oMetaModel.getODataEntitySet(sEntitySet).entityType;
							var oEntityType = oMetaModel.getODataEntityType(sEntityType);
							var aParts = oTarget.PropertyPath ? oTarget.PropertyPath.split("/") : oTarget.String.split("/");
							var oAssociationEnd;

							if (aParts.length > 1) {
								for (var j = 0; j < (aParts.length - 1); j++) {
									oAssociationEnd = oMetaModel.getODataAssociationEnd(oEntityType, aParts[j]);
									if (oAssociationEnd) {
										oEntityType = oMetaModel.getODataEntityType(oAssociationEnd.type);
										if (sNavigationPath) {
											sNavigationPath = sNavigationPath + "/";
										}
										sNavigationPath = sNavigationPath + aParts[j];
									} else {
										// we reached a complex type
										break;
									}
								}
							}
						}

						if (aTargetEntities.indexOf(sNavigationPath) === -1) {
							// only in case not complete entity is read use $select for this entity
							if (sNavigationPath && aExpand.indexOf(sNavigationPath) === -1) {
								aExpand.push(sNavigationPath);
							}

							aSelect.push(oTarget.PropertyPath || oTarget.String);
						}
					}
				}
			}
		}

		if (aSelect.length > 0) {
			mParameters.readParameters = {
				"$select" : aSelect.join(",")
			};
			if (aExpand.length > 0) {
				mParameters.readParameters["$expand"] = aExpand.join(',');
			}
		}
	};

	/**
	 * Returns the side effect annotation for a given field group ID.
	 *
	 * @param {object} oID Field group ID
	 * @returns {object} The side effect annotation for a given ID
	 * @private
	 */
	ApplicationController.prototype._getSideEffect = function (oID) {
		var oMeta, oResult, sMethod, sFullname;

		oMeta = this._oModel.getMetaModel();
		sMethod = "getOData" + oID.originType.substring(0, 1).toUpperCase() + oID.originType.substring(1);

		if (oID.originNamespace) {
			sFullname = oID.originNamespace + "." + oID.originName;
		} else {
			sFullname = oID.originName;
		}

		if (oMeta[sMethod]) {
			oResult = oMeta[sMethod](sFullname);

			if (oResult) {
				return oResult[oID.name];
			}
		}

		throw "Unknown SideEffect originType: " + oID.originType;
	};

	/**
	 * Returns the current transaction controller instance.
	 *
	 * @returns {sap.ui.generic.app.transaction.TransactionController} The transaction controller instance
	 *
	 * @public
	 */
	ApplicationController.prototype.getTransactionController = function () {
		// create the transaction controller lazily.
		if (!this._oTransaction) {
			this._oTransaction = new TransactionController(this._oModel, this._oQueue, {
				noBatchGroups: true
			}, this._oDraftMergeTimer);
		}

		return this._oTransaction;
	};

	/**
	 * Invokes an action for every provided context where the properties are taken as input from.
	 * The changes are submitted directly to the back-end.
	 *
	 * @param {string} sFunctionName The name of the function or action that shall be triggered.
	 * @param {array} aContexts The given binding contexts where the parameters of the action shall be filled from.
	 * @param {map} mParameters Parameters to control the behavior of the request.
	 * @param {string} mParameters.operationGrouping Property denotes how invocations of the same action on multiple instances 
	 * are grouped. This is an optional parameter. If parameter set to "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" 
	 * every action call is sent in same changeset else a new changeset. Default value of this property is set to
	 * "com.sap.vocabularies.UI.v1.OperationGroupingType/Isolated".
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the action
	 * @throws {Error} Throws an error if the OData function import does not exist or the action input parameters are invalid
	 *
	 * @public
	 */
	ApplicationController.prototype.invokeActions = function (sFunctionName, aContexts, mParameters) {
		var oContext, i, len, fnChanges, aPromises = [], oSideEffect, bTimeOutIDExists = false;
		mParameters = mParameters || {};
		
		if (this._oDraftMergeTimer.nTimeoutID) {
			bTimeOutIDExists = true;
			if (mParameters.triggerChanges) {
				aPromises.push(this.triggerSubmitChanges({
					batchGroupId: "Changes",
					successMsg: "Call of action succeeded",
					failedMsg: "Call of action failed",
					forceSubmit: true,
					context: oContext,
					actionInvokedWithPendingChanges: this._oModel.hasPendingChanges()
				}));
			}
		}

		len = aContexts.length;
		fnChanges = this._getChangeSetFunc(aContexts, mParameters.operationGrouping);

		if (len === 0) {
			aPromises.push(this._invokeAction(sFunctionName, null, null, mParameters));
		} else {
			// Fire all Actions and bring them in order
			for (i = 0; i < len; i++) {
				aPromises.push(this._invokeAction(sFunctionName, aContexts[i], fnChanges(i), mParameters));
			}
		}

		// check if side effect is annotated and if a validate or prepare shall be sent
		var oFunctionImport = this._oModel.getMetaModel().getODataFunctionImport(sFunctionName.split("/")[1]);
		for (var p in oFunctionImport) {
			if (p.startsWith("com.sap.vocabularies.Common.v1.SideEffects")) {
				oSideEffect = oFunctionImport[p];
				break;
			}
		}

		if (oSideEffect) {
			this._executeSideEffectsForActions(oSideEffect, aContexts, mParameters.triggerChanges);
		}

		// Trigger submitting batch only for Draft apps, will trigger MERGE and POST call for the invoked Action
		if (mParameters.triggerChanges !== false && !bTimeOutIDExists) {
			// trigger submitting the batch.
			mParameters = {
				batchGroupId: "Changes",
				changeSetId: "Action" + fnChanges(i + 1),
				successMsg: "Call of action succeeded",
				failedMsg: "Call of action failed",
				forceSubmit: true,
				context: oContext
			};

			aPromises.push(this.triggerSubmitChanges(mParameters));
		}
		var that = this;

		return this._newPromiseAll(aPromises).then(function (aResponses) {
			var bAtLeastOneSuccess = false;

			if (aResponses && mParameters.triggerChanges !== false && aResponses.length > aContexts.length) {
				aResponses.pop(); //last response from triggerSubmitChanges, remove to the outside world
			}

			bAtLeastOneSuccess = that._checkAtLeastOneSuccess(aContexts, aResponses);
			if (bAtLeastOneSuccess) {
				if (bTimeOutIDExists) {
					that.oPropertyChangedResolve(aResponses);
				}
				return aResponses;
			} else {
				if (bTimeOutIDExists) {
					that.oPropertyChangedReject(aResponses);
				}
				return Promise.reject(aResponses);
			}
		});
	};


	/**
	 * Executes annotated side effects for properties/navigation properties or navigation entities. If no properties
	 * or entities are passed then the global side effect (the one without source properties and source entities) will be executed.
	 * PreparationAction will be called if there is no global side effect annotation available or if no trigger action
	 * is configured in the global side effect.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {array} aSourceProperties An array of properties of the given context or properties in a 1:1 association
	 *                                  for those side effects shall be executed. Can be <code>undefined</code>.
	 * @param {array} aSourceEntities An array of entities (navigation properties) with the side effects that
	 *                                shall be executed. Can be <code>undefined</code>.
	 * @param {boolean} bForceGlobalRefresh If not explicitly set to <code>false</code> a global model refresh is triggered.
	 * @param {map} mAdditionalParameters Parameters to control the draft preparation
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the action. The promise is either already
	 *                    resolved (when nothing needs to be processed) or resolves when the <code>triggerSubmitChanges()</code>
         *                    has been executed.
	 *
	 * @public
	 */
	ApplicationController.prototype.executeSideEffects = function (oContext, aSourceProperties, aSourceEntities, bForceGlobalRefresh, mAdditionalParameters) {
		var oSideEffect, sNavigationPath, sProperty, bExecuteSideEffect, fnRequest, sQualifier;
		var bSubmitNeeded = false; // set to true when something model-relevant has been done
		var bGlobal = !aSourceProperties && !aSourceEntities; // if bGlobal = true then follow global side effect flow
		var mRequests = {
			bGlobal: false,
			aRequests: [],
			bHasTargets: true
		};
		var mParams = {
			batchGroupId: "Changes",
			changeSetId: "SideEffects",
			noShowSuccessToast: true,
			forceSubmit: true,
			noBlockUI: true,
			urlParameters: {}
		};
		var sEntitySet = ModelUtil.getEntitySetFromContext(oContext);
		var oMetaModel = oContext.getModel().getMetaModel();
		var sEntityType = oMetaModel.getODataEntitySet(sEntitySet).entityType;
		var oEntityType = oMetaModel.getODataEntityType(sEntityType);
		var i = 0;

		bForceGlobalRefresh = !(bForceGlobalRefresh === false);

		aSourceEntities = aSourceEntities || [];
		aSourceProperties = aSourceProperties || [];

		var fnExecuteSideEffect = function (oSideEffect) {

			// set the side effects qualifier as action input.
			if (sQualifier) {
				mParams.urlParameters.SideEffectsQualifier = sQualifier;
			} else {
				delete mParams.urlParameters.SideEffectsQualifier;
			}

			this._executeSideEffects(oSideEffect, oContext, mParams, mRequests);
			if (mRequests.aRequests[0]) {
				fnRequest = mRequests.aRequests[0];
				fnRequest(mRequests.bGlobal, mAdditionalParameters);
				mRequests.aRequests = [];
			}
		}.bind(this);

		for (var p in oEntityType) {
			if (p.startsWith("com.sap.vocabularies.Common.v1.SideEffects")) {
				oSideEffect = oEntityType[p];
				bExecuteSideEffect = false;

				sQualifier = this._getSideEffectsQualifier(p);

				if (bGlobal) {
					if (!oSideEffect.SourceProperties && !oSideEffect.SourceEntities) {
						fnExecuteSideEffect(oSideEffect); // Global side effect
						bExecuteSideEffect = true;
						bSubmitNeeded = true;
						break;
					}
				} else {
					if (oSideEffect.SourceEntities && oSideEffect.SourceEntities.length) {
						for (i = 0; i < oSideEffect.SourceEntities.length; i++) {
							sNavigationPath = oSideEffect.SourceEntities[i].NavigationPropertyPath;
							if (aSourceEntities.indexOf(sNavigationPath) !== -1) {
								bExecuteSideEffect = true;
							}
						}
					}
					if (!bExecuteSideEffect && oSideEffect.SourceProperties && oSideEffect.SourceProperties.length) {
						for (i = 0; i < oSideEffect.SourceProperties.length; i++) {
							sProperty = oSideEffect.SourceProperties[i].PropertyPath;
							if (aSourceProperties.indexOf(sProperty) !== -1) {
								bExecuteSideEffect = true;
							}
						}
					}
					if (bExecuteSideEffect) {
						fnExecuteSideEffect(oSideEffect); // Local side effects
						bSubmitNeeded = true;
					}
				}
			}
		}

		// On ENTER if no global side effect is annotated then call PreparationAction
		// If Global sideeffect is available without trigger action then the Preparation Action is already called
		if (bGlobal && !bExecuteSideEffect) {
			fnExecuteSideEffect({});
			bSubmitNeeded = true;
		}
		// Refresh the model only if no target is defined for global side effect
		if (bForceGlobalRefresh && !mRequests.bHasTargets) {
			this._oModel.refresh(true, false, "Changes");
			bSubmitNeeded = true;
		}
		// trigger flush.
		var oPromise = null;
		if (bSubmitNeeded) {
			oPromise = this.triggerSubmitChanges({
				batchGroupId: "Changes",
				noShowSuccessToast: true,
				forceSubmit: true,
				noBlockUI: true,
				urlParameters: {},
				draftSave: this._oModel.hasPendingChanges(true)
			});
		} else {
			oPromise = Promise.resolve();
		}

		this.fireEvent("beforeSideEffectExecution", {
			promise: oPromise
		});

		return oPromise;
	};
	ApplicationController.prototype._checkAtLeastOneSuccess = function (aContexts, aResponses) {
		var i, bAtLeastOneSuccess = false;
		if (aContexts.length <= aResponses.length) {
			for (i = 0; i < aContexts.length; i++) {
				aResponses[i].actionContext = aContexts[i];
				if (!aResponses[i].error) {
					bAtLeastOneSuccess = true;
				}
			}
			if (aContexts.length === 0) {
				for (i = 0; i < aResponses.length; i++) {
					if (!aResponses[i].error) {
						bAtLeastOneSuccess = true;
					}
				}
			}
		}
		return bAtLeastOneSuccess;
	};

	/**
	 * Returns a promise which resolves if the given promises have been executed with at least one successfully. It rejects if all given promises were rejected.
	 *
	 * @param {array} aPromises Array containing promises and a flag if the result should be included in the response
	 * @returns {object} A promise which will wait for all given promises to finish
	 *
	 * @private
	 */
	ApplicationController.prototype._newPromiseAll = function (aPromises) {
		var aResponses = [];
		var oReadyPromise = Promise.resolve(null);

		aPromises.forEach(function (oPromise) {
			oReadyPromise = oReadyPromise.then(function () {
				return oPromise;
			}).then(function (oResponse) {
				aResponses.push({ response: oResponse });
			}, function (oError) {
				aResponses.push({ error: oError });
			});
		});

		return oReadyPromise.then(function () {
			return Promise.resolve(aResponses);
		});
	};

	/**
	 * Returns a function to calculate the changeset ID (used in action processing). If only
	 * one context instance is supplied, only one changeset is created, which contains the action
	 * invocation and possibly existing changes. When two or more contexts are provided there are
	 * two possible ways to handle:
	 * - one changeset for property/entity changes and one changeset per action invocation could be created
	 * or
	 * - possible changes and all the action invocations could be put into the same change set.
	 *
	 * Which way of processing is used depends on the action's annotations.
	 *
	 * @param {array} aContexts The given binding contexts.
	 * @param {string} sOperationGrouping If this is set to "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" single contexts are used.
	 * @returns {function} A function to calculate the change set ID.
	 *
	 * @private
	 */
	ApplicationController.prototype._getChangeSetFunc = function (aContexts, sOperationGrouping) {
		var len = aContexts.length;
		var fnSingle = function () {
			return "Changes";
		};

		// make sure that always the same change set is used, if the action is executed for one context instance only.
		if (len === 1) {
			return fnSingle;
		}

		// OperationGrouping ChangeSet results that all action calls are put into one changeSet
		if (sOperationGrouping === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet") {
			return fnSingle;
		}

		// return as default different change set IDs for multiple contexts - at least for the time being.
		return function (i) {
			return "Changes" + i;
		};
	};

	/**
	 * Creates a context for an action call (OData function import)
	 *
	 * @param {string} sFunctionName Name of the function import that shall be triggered.
	 * @param {object} oEntityContext The given binding context of the object on which the action is called.
	 * @param {map} mParameters Parameters to control the behavior of the request.
	 *
	 * @returns {map} A <code>map</code> that contains two Promises:
	 *                <code>context</code> which provides the action-specific model context to the resolve function
	 *                <code>result</code> which resolves when the success handler is called and rejects when the error handler is called;
	 * 				  The result of the promises is normalized in both cases, error and success.
	 *
	 * @since 1.38
	 * @experimental
	 * @public
	 */
	ApplicationController.prototype.getNewActionContext = function (sFunctionName, oEntityContext, mParameters) {

		var that = this;
		mParameters = jQuery.extend({
			batchGroupId: "Changes",
			changeSetId: "SingleAction",
			successMsg: "Call of action succeeded",
			failedMsg: "Call of action failed",
			forceSubmit: true,
			context: oEntityContext,
			functionImport: this._oMeta.getODataFunctionImport(sFunctionName.split("/")[1])
		}, mParameters);

		var oFuncHandle = this._createFunctionContext(oEntityContext, mParameters);

		// Add "formatters" for error and success messages
		oFuncHandle.result = oFuncHandle.result.then(function (oResponse) {
			return that._normalizeResponse(oResponse, true);
		}, function (oResponse) {
			var oOut = that._normalizeError(oResponse);
			throw oOut;
		});

		return oFuncHandle;
	};

	/**
	 * Builds a consistent chain for all given actions and their implicit dependencies (e.g. side effects)
	 * and submits the changes to the back-end.
	 *
	 * @param {object} oEntityContext the context of the entity the function import is called on
	 * @param {object} oActionContext Either one or an array of action context objects
	 *        created by {@link sap.ui.generic.app.ApplicationController#createActionContext}
	 * @param {string} sFunctionName The name of the function or action
	 *
	 * @since 1.38
	 * @private
	 */
	ApplicationController.prototype.submitActionContext = function (oEntityContext, oActionContext, sFunctionName) {
		var oSideEffect;

		// check if side effect is annotated and if a validate or prepare shall be sent
		var oFunctionImport = this._oModel.getMetaModel().getODataFunctionImport(sFunctionName);
		for (var p in oFunctionImport) {
			if (p.startsWith("com.sap.vocabularies.Common.v1.SideEffects")) {
				oSideEffect = oFunctionImport[p];
				break;
			}
		}

		if (oSideEffect) {
			//execute side effect on entity
			this._executeSideEffectsForActions(oSideEffect, [oEntityContext]);
		}


		this.triggerSubmitChanges({
			batchGroupId: "Changes",
			successMsg: "Call of action succeeded",
			failedMsg: "Call of action failed",
			//urlParameters: mParameters.urlParameters,
			forceSubmit: true,
			context: oActionContext
		});
	};

	/**
	 * Invokes an action with the given name and submits changes to the back-end.
	 *
	 * @param {string} sFunctionName The name of the function or action.
	 * @param {sap.ui.model.Context} oContext The given binding context.
	 * @param {string} sChangeSetID the ID of the change set to place the action invocation in.
	 * @param {map} mParams Parameter map with additional URL parameters.
	 *
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the action.
	 * @throws {Error} Throws an error if the OData function import does not exist or the action input parameters are invalid.
	 *
	 * @private
	 */
	ApplicationController.prototype._invokeAction = function (sFunctionName, oContext, sChangeSetID, mParams) {
		var that = this;
		// make a copy of headers and url params, otherwise, this will modify original headers and urlPrams
		var mHeaders = Object.assign({}, mParams.headers);
		var mUrlParams = Object.assign({}, mParams.urlParameters);
		var mParameters = {
			batchGroupId: "Changes",
			changeSetId: sChangeSetID,
			successMsg: "Call of action succeeded",
			failedMsg: "Call of action failed",
			urlParameters: mUrlParams,
			forceSubmit: true,
			context: oContext,
			headers: mHeaders
		};

		// For non-draft apps, change the batchGroupId to not trigger the MERGE call for invokeActions
		if (mParams.triggerChanges === false) {
			mParameters.batchGroupId = "NonDraftChanges";
		}

		return this._callAction(sFunctionName, oContext, mParameters).then(function (oResponse) {
			return that._normalizeResponse(oResponse, true);
		}, function (oResponse) {
			var oOut = that._normalizeError(oResponse);
			throw oOut;
		});
	};
	
	/**
	 * Synchronizes the draft by submitting the pending changes on the UI to the backend.
	 * Meant only for Fiori Elements V2 library consumption.
	 * @returns {Promise} A Promise for asynchronous execution of the submit.
	 */
	ApplicationController.prototype.synchronizeDraftAsync = function() {
		var oParameters = {
			batchGroupId: "Changes",
			changeSetId: "Changes",
			onlyIfPending: true,
			noShowResponse: true,
			noBlockUI: true,
			draftSave: this._oModel.hasPendingChanges()
		};

		return this.triggerSubmitChanges(oParameters);
	};
	
	/**
	 * Frees all resources claimed during the life-time of this instance.
	 *
	 * @experimental Since 1.32.0
	 * @public
	 */
	ApplicationController.prototype.destroy = function () {
		BaseController.prototype.destroy.apply(this, []);

		if (this._oTransaction) {
			this._oTransaction.destroy();
		}

		this._oModel = null;
		this._oTransaction = null;
		this._oGroupChanges = null;
	};
	
	return ApplicationController;

}, true);
