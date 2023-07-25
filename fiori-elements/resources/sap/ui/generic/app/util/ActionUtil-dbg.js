/*
 * ! SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"sap/ui/comp/smartform/SmartForm",
	"sap/ui/comp/smartform/Group",
    "sap/ui/comp/smartform/GroupElement",
	"sap/ui/comp/smartfield/SmartField",
	"sap/ui/comp/smartfield/SmartLabel",
	"sap/m/Dialog",
	"sap/ui/generic/app/util/ModelUtil",
	"sap/m/VBox",
	"sap/m/Text",
	"sap/base/strings/formatMessage",
	"sap/base/Log"
], function(
	jQuery,
	ManagedObject,
	MessageBox,
	SmartForm,
	Group, 
	GroupElement,
	SmartField,
	SmartLabel,
	Dialog,
	ModelUtil,
	VBox,
	Text,
	formatMessage,
	Log
) {
	"use strict";

	var ActionUtil = ManagedObject.extend("sap.ui.generic.app.util.ActionUtil", {
		metadata: {
			properties: {
				/**
				 * The view controller (of type sap.ui.core.mvc.Controller). Used e.g. to retrieve
				 * the OData Model and, if available, the special @i18n model (based on a resource bundle
				 * with custom labels).
				 */
				controller: {
					type: "object",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * The used ApplicationController
				 */
				applicationController: {
					type: "object",
					group: "Misc",
					defaultValue: null
				},
				/** TODO Should maybe get an aggregation to reflect that it is an array
				 * The contexts in which the action is called.
				 */
				contexts: {
					type: "object",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * The callback that is called after the action has been successfully executed.
				 */
				successCallback: {
					type: "function",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * The callback that is called after the action has been successfully executed.
				 */
				operationGrouping: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			}
		}
	});

	/**
	 * Get the difference between two objects. Works if both the object has the exact same properties and their values should
	 * be string literals.
	 * @param {object} oFirstObj 
	 * @param {object} oSecondObj 
	 * @returns {array} an array of all the properties which have different values in both the objects
	 * @private
	 */
	ActionUtil.prototype._getObjectsDifference = function (oFirstObj, oSecondObj) {
		var aKeysWithDifferentValues = [];
		var aKeys = Object.keys(oFirstObj);
		for (var i = 0; i < aKeys.length; i++) {
			if (oFirstObj[aKeys[i]] !== oSecondObj[aKeys[i]]) {
				aKeysWithDifferentValues.push(aKeys[i]);
			}
		}
		return aKeysWithDifferentValues;
	};

	/**
	 * Triggers the chain of the action call's preparation, its processing and its result handling.
	 * If there is a critical action, a confirmation dialog is displayed on the UI.
	 * <b>Note</b>: An action is considered as critical if the UI annotation <code>com.sap.vocabularies.Common.v1.IsActionCritical</code> is defined.
	 *
	 * @param {string} sFunctionImportPath The function import that is called
	 * @param {string} [sFunctionImportLabel] Optional parameter for the confirmation popup text
	 * @param {boolean} [bIsDraftEnabled] Used for removing MERGE call for NonDraft apps; true: if draft enabled otherwise false.
	 *
	 * @returns {Promise} There are two cases:
	 * Case 1: Action is triggered immediately w/o further user interaction (i.e. when no further
	 * parameters are needed or expected for processing).
	 * A <code>Promise</code> is returned that resolves immediately and provides as parameter an
	 * <code>Object</code> that contains another promise in the member <code>executionPromise</code>.
	 * Case 2: Action is triggered with a dialog beforehand that could be cancelled by the user.
	 * Same as above with the exception that the returned <code>Promise</code> is rejected directly
	 * when the user decides to cancel the action processing.
	 *
	 * @protected
	 */
	ActionUtil.prototype.call = function (sFunctionImportPath, sFunctionImportLabel, bIsDraftEnabled, oSkipProperties, bIsStrict, mAdditionalParmData, sFunctionImportButtonActionButtonText) {
		var that = this;
		return new Promise(function (resolve, reject) {
			var mActionParams;
			that._oActionPromiseCallback = { resolve: resolve, reject: reject };

			that._sFunctionImportPath = sFunctionImportPath;

			var oController = that.getController();
			if (!oController || !oController.getView()) {
				reject("No View Controller provided");
			}

			that._oMetaModel = oController.getView().getModel().getMetaModel();

			var sFunctionName = sFunctionImportPath.split('/')[1];

			/** TODO Think about removing "global" variables for better readability / debugging */
			that._oFunctionImport = that._oMetaModel.getODataFunctionImport(sFunctionName);
			that._sFunctionImportLabel = sFunctionImportLabel;
			that._sFunctionImportButtonActionButtonText = sFunctionImportButtonActionButtonText || sFunctionImportLabel;
			that._oSkipProperties = oSkipProperties || {};
			var fnPrepareParamAndInvokeAction = function () {
				var aContexts = that.getContexts();
				mActionParams = that._prepareParameters(aContexts, bIsDraftEnabled, mAdditionalParmData);
				mActionParams = mActionParams || [{}];
				mActionParams.expand = mAdditionalParmData ? mAdditionalParmData.expand : undefined;
				var oGetDefaultValuesPromise = that.getApplicationController().getTransactionController().getDefaultValues(aContexts, mActionParams.map(function(oActionParams) { return oActionParams.parameterData; }), undefined, sFunctionName);
				if (oGetDefaultValuesPromise instanceof Promise) {
					var fnGetPredefinedValues = function (aParameterValues) {
						for (var i = 0; i < mActionParams.length; i++) {
							mActionParams[i].propertiesOverridenByDefault = that._getObjectsDifference(mActionParams[i].parameterData, aParameterValues[i]);
							mActionParams[i].parameterData = aParameterValues[i];
						}
						that._initiateCall(mActionParams, bIsDraftEnabled, bIsStrict);
					};
					oGetDefaultValuesPromise.then(fnGetPredefinedValues, fnGetPredefinedValues);
				} else {
					that._initiateCall(mActionParams, bIsDraftEnabled, bIsStrict);
				}
			};

			if (!that._oFunctionImport) {
				reject("Unknown Function Import " + sFunctionName);
			}

			if (that._isActionCritical()) {
				var sCustomMessageKey = "ACTION_CONFIRM|" + sFunctionName; // Key for i18n in application for custom message
				var sMsgBoxText;
				var oResourceBundle = oController.getOwnerComponent().getAppComponent && oController.getOwnerComponent().getAppComponent().getModel("i18n") && oController.getOwnerComponent().getAppComponent().getModel("i18n").getResourceBundle();
				if (oResourceBundle && oResourceBundle.hasText(sCustomMessageKey)) {
					sMsgBoxText = oResourceBundle.getText(sCustomMessageKey);
				} else {
					// Fallback in case key does not exist in i18n file of Application
					sMsgBoxText = sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app").getText("ACTION_CONFIRM");
					sMsgBoxText = formatMessage(sMsgBoxText, that._sFunctionImportLabel);
				}
				MessageBox.confirm(sMsgBoxText, {
					title: that._sFunctionImportLabel,
					onClose: function (oAction) {
						if (oAction === "OK") {
							fnPrepareParamAndInvokeAction();
						} else if (oAction === "CANCEL") {
							that._oActionPromiseCallback.reject();
						}
					},
					sClass: that._getCompactModeStyleClass()
				});
			} else {
				fnPrepareParamAndInvokeAction();
			}
		});

	};

	ActionUtil.prototype._getCompactModeStyleClass = function () {
		if (this.getController().getView().$().closest(".sapUiSizeCompact").length) {
			return "sapUiSizeCompact";
		}
		return "";
	};

	/**
	 * checks if the action is critical
	 *
	 * @private
	 * @returns {boolean} true if the action is critical otherwise false
	 */
	ActionUtil.prototype._isActionCritical = function () {
		var oCritical = this._oFunctionImport["com.sap.vocabularies.Common.v1.IsActionCritical"];

		if (!oCritical) {
			return false;
		}
		if (oCritical.Bool === undefined) {
			return true;
		}

		return this._toBoolean(oCritical.Bool);
	};

	/**
	 * converts a parameter value to a boolean
	 *
	 * @param {object} oParameterValue The value to be converted
	 * @private
	 * @returns {boolean} Boolean value
	 */
	ActionUtil.prototype._toBoolean = function (oParameterValue) {
		if (typeof oParameterValue === "string") {
			var oValue = oParameterValue.toLowerCase();
			return !(oValue == "false" || oValue == "" || oValue == " ");
		}

		return !!oParameterValue;
	};

	/**
	 * Prepares the parameters which are needed as input for the action
	 *
	 * @param {array} 		aContexts Array of contexts used for action processing
	 *
	 * @returns {object} 	mActionParams Parameters that describe the Function Import:
	 * 						mActionParams.parameterData Array with mandatory parameters
	 *						mActionParams.additionalParameters Array with additional parameters
	 *
	 * @private
	 */
	ActionUtil.prototype._prepareParameters = function (aContexts, bIsDraftEnabled, mAdditionalParmData) {
		/**
		 * Without action Context scenario do not preparation action params
		 * Multi action context scenario prepare actions params
		 */
		if (!Array.isArray(aContexts) && !aContexts.length) {
			return undefined;
		}

		var aActionParams = [];

		// Looping through all the selected contexts
		aContexts.forEach(function(oSingleContext) {
			var oEntityType = null;
			var oContextObject = oSingleContext.getObject();
			if (oSingleContext && oSingleContext.getPath()) {
				var sEntitySet = ModelUtil.getEntitySetFromContext(oSingleContext);
				var oEntitySet = oSingleContext.getModel().getMetaModel().getODataEntitySet(sEntitySet, false);
				oEntityType = oSingleContext.getModel().getMetaModel().getODataEntityType(oEntitySet.entityType, false);
			}

			var oKeyProperties = this._getPropertyKeys(oEntityType);
			var oParameterValue;
			var mActionParams = {
				parameterData: {},
				additionalParameters: [],
				isDraftEnabled: bIsDraftEnabled
			};

			// Check to see if Function Import has parameters
			if (this._oFunctionImport.parameter) {
				// Looping through the Function Import parameters for each context to set values
				for (var i = 0; i < this._oFunctionImport.parameter.length; i++) {
					var oParameter = this._oFunctionImport.parameter[i];

					this._addParameterLabel(oParameter, oEntityType);

					var sParameterName = oParameter.name;
					var bIsKey = !!oKeyProperties[sParameterName];
					oParameterValue = undefined;

					//Handling "ResultIsActiveEntity"
					if (sParameterName === "ResultIsActiveEntity") {
						//When the parameter is optional (nullable is true or undefined), omit it 
						if (oParameter.nullable !== "false") {
							continue;
						}
						//Otherwise, set the default value as false
						oParameterValue = false;
					}
					
					if (oContextObject && oContextObject.hasOwnProperty(sParameterName)) {
						oParameterValue = oContextObject[sParameterName];
					} else if (bIsKey && oContextObject && this._oFunctionImport["sap:action-for"]) {
						// parameter is key but not part of the current projection - raise error
						Log.error("Key parameter of action not found in current context: " + sParameterName);
						throw new Error("Key parameter of action not found in current context: " + sParameterName);
					}
					// If mAdditionalParmData is provided, override it.
					if (mAdditionalParmData && (mAdditionalParmData[sParameterName] || mAdditionalParmData[sParameterName] === "")) {
						mActionParams.parameterData[sParameterName] = mAdditionalParmData[sParameterName];
					} else {
						mActionParams.parameterData[sParameterName] = oParameterValue;
					}
					var skip = !!this._oSkipProperties[sParameterName];
					if (!skip && (!bIsKey || !this._oFunctionImport["sap:action-for"]) && oParameter.mode.toUpperCase() == "IN") {
						// offer as optional parameter with default value from context
						mActionParams.additionalParameters.push(oParameter);
					}
				}
				aActionParams.push(mActionParams);
			} else {
				aActionParams.push(mActionParams);
			}
		}.bind(this));

		return aActionParams;
	};

	/**
	 * returns a map containing all keys retrieved for the given entityType
	 *
	 * @param {object} oEntityType - the entity type for which the keys should be retrieved
	 * @private
	 * @returns {object} map containing the properties keys
	 */
	ActionUtil.prototype._getPropertyKeys = function(oEntityType) {
		var oKeyMap = {};

		if (oEntityType && oEntityType.key && oEntityType.key.propertyRef) {
			for (var i = 0; i < oEntityType.key.propertyRef.length; i++) {
				var sKeyName = oEntityType.key.propertyRef[i].name;
				oKeyMap[sKeyName] = true;
			}
		}
		return oKeyMap;
	};

	/**
	 * Sets and passes the additional parameters in case of an action being performed on multiselect mode
	 *
	 * @param {array} aAdditionalParameters - the array containing all the additional parameters and their properties
	 * @param {string} sKey - the string contaning the current parameter of the selected row
	 * @param {array} aParameterData - the array containing all the parameters and their corresponding values
	 * @param {object} ctx - Context object of the triggered action
	 * @param {array} aPropertiesOverridenByDefault - the array containing all the parameters that are overridden by the DefaultValuesFunction
	 */
	 ActionUtil.prototype._setAdditionalParameters = function (aAdditionalParameters, sKey, aParameterData, ctx, aPropertiesOverridenByDefault) {
		aAdditionalParameters.forEach(function (oAdditionalParameter){
			if (sKey === oAdditionalParameter.name) {
				if (oAdditionalParameter.hasOwnProperty("com.sap.vocabularies.UI.v1.Hidden") || (aPropertiesOverridenByDefault && aPropertiesOverridenByDefault.includes(sKey))) {
					ctx.oModel.setProperty(sKey, aParameterData[sKey], ctx);
				} else {
					// set default value(undefined) for multiple selection
					ctx.oModel.setProperty(sKey, undefined, ctx);
				}
			}
		});
	};

	/**
	 * Initiate action call.
	 *
	 * @param {object} [mActionParams] Optional map with parameters that are used in action call.
	 *
	 */
	ActionUtil.prototype._initiateCall = function (mActionParams, bIsDraftEnabled, bIsStrict) {
		var mActionParam = mActionParams[0];
		// Prepare headers based on value of bStrict flag
		var sHandling = bIsStrict ? "strict" : "lenient";
		var mHeaders = {Prefer: "handling=" + sHandling};
		// Check if additionalParameters length is 0 and initiate action call
		if (mActionParam != undefined && mActionParam.additionalParameters && mActionParam.additionalParameters.length == 0) {
			this._call(mActionParam.parameterData, mActionParam.isDraftEnabled, mHeaders);
		} else if (mActionParam != undefined && mActionParam.additionalParameters && mActionParam.additionalParameters.length > 0) {
			// if addtionalParameters exists then Create Dialog
			var that = this;
			var mParameters = {
				urlParameters: {},
				headers: mHeaders,
				expand: mActionParams.expand
			};

			var aEntityContext = this.getContexts();
			var fnChangeSet = this.getApplicationController()._getChangeSetFunc(aEntityContext, this.getOperationGrouping());

			var oFuncHandles = aEntityContext.map(function(oContext, index) {
				mParameters.changeSetId = fnChangeSet(index);
				return this.getApplicationController().getNewActionContext(this._sFunctionImportPath, oContext, mParameters);
			}.bind(this));
			var contexts = oFuncHandles.map(function (oFuncHandle) {
				return oFuncHandle.context;
			});

			Promise.all(contexts).then(function (aActionContexts) {
				var oActionContext = aActionContexts[0];
				// get all additional params keys
				var aAdditionalParametersKeys = mActionParam.additionalParameters.map(function (param) {
					return param.name;
				});

				// set action context value to oModel for single & multiple selection
				aActionContexts.forEach(function (ctx, i) {
					var oParameterData = mActionParams[i].parameterData;
					for (var sKey in oParameterData) {
						if (aActionContexts.length > 1 && aAdditionalParametersKeys.indexOf(sKey) > -1) {	// multiple selection
							that._setAdditionalParameters(mActionParams[i].additionalParameters, sKey, oParameterData, ctx, mActionParams[i].propertiesOverridenByDefault);
						} else {	// single selection
							ctx.oModel.setProperty(sKey, oParameterData[sKey], ctx);
						}
					}
				});

				if (bIsStrict) {
					var mParameterForm = that._buildParametersForm(mActionParam, oActionContext);
					var bActionPromiseDone = false;
					var oParameterDialog = new Dialog({
						title: that._sFunctionImportLabel,
						content: [
							mParameterForm.form
						],
						beginButton: new sap.m.Button({
							text: that._sFunctionImportButtonActionButtonText,
							type: 'Emphasized',
							press: function (oEvent) {
								var oSmartFormCheckPromise = mParameterForm.form ? mParameterForm.form.check() : Promise.resolve();
								oSmartFormCheckPromise.then(function(oResult) {
									if (mParameterForm.hasNoClientErrors()) {
										oParameterDialog.close();
										bActionPromiseDone = that._triggerActionPromise(oFuncHandles, aEntityContext, mActionParam, aActionContexts, bIsStrict);
									}
								});
							}
						}),
						endButton: new sap.m.Button({
							text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app").getText("ACTION_CANCEL"),
							press: function () {
								oFuncHandles[0].abort();
								oParameterDialog.close();
								that._oActionPromiseCallback.reject();
								bActionPromiseDone = true;
							}
						}),
						afterClose: function (oControlEvent) {
							oParameterDialog.destroy();
							// Tidy up at the end: if the action hasn't been triggered, do the same as it was cancelled.
							if (!bActionPromiseDone) {
								that._oActionPromiseCallback.reject();
							}
						}
					}).addStyleClass("sapUiNoContentPadding");

					oParameterDialog.addStyleClass(that._getCompactModeStyleClass());
					// set the default model
					oParameterDialog.setModel(oActionContext.oModel);

					// set a @i18n model if available via the given controller
					if (this.getController().getView().getModel("@i18n")) {
						oParameterDialog.setModel(this.getController().getView().getModel("@i18n"), "@i18n");
					}
					var oForm = oParameterDialog.getAggregation("content")[0].mAggregations["content"];
					var aFormElements = oForm.getFormContainers()[0].getFormElements();
					var bIsEmptyPopup = true;
					for (var i = 0; i < aFormElements.length; i++) {
						var oSmartField = aFormElements[i].getFields()[0];
						if ((oSmartField instanceof SmartField) && oSmartField.getVisible() === true) {
							bIsEmptyPopup = false;
							break;
						}
					}
					if (aFormElements.length === 0 || bIsEmptyPopup){
						that._triggerActionPromise(oFuncHandles, aEntityContext, mActionParam, aActionContexts, bIsStrict);
						oParameterDialog.destroy();
					} else {
						oParameterDialog.open();
					}
				} else {
					that._triggerActionPromise(oFuncHandles, aEntityContext, mActionParam, aActionContexts);
				}
			}.bind(this));

		} else {
			//Take "the old" way -> prepare everything and call then callFunction with complete set of data
			this._call(null, mActionParam != undefined ? mActionParam.isDraftEnabled : bIsDraftEnabled, mHeaders);
		}
	};

	ActionUtil.prototype._triggerActionPromise = function (oFuncHandles, aEntityContext, mActionParam, aActionContexts, bIsStrict) {
		var that = this;
		// Stores the parameter values entered by user in parameter dialog. This is useful when warning occurs in 412 HTTPStatusCode
		// and we want to send caller, all the params that user has entered, so that they can send back these parameters to ActionUtil.
		// Thus user does not need to refill the same parameters.
		var mUserEnteredAdditionalParams = {};
		that._oActionPromiseCallback.resolve({
			// Here we are calling newPromiseAll. Reason being:
			// 1. It basically does not reject if any of the promise which is rejected, which is not the case with Promise.All.
			// 2. It preserve the order of input promises.
			executionPromise: that.getApplicationController()._newPromiseAll(oFuncHandles.map(function (oFuncHandle) {
				return oFuncHandle.result;
			}))
			.then(function (aResults) {
				// If any of the function import is successful, we consider this as success to synchronise it other BOPF action
				// which does not require parameters
				that._bExecutedSuccessfully = that.getApplicationController()._checkAtLeastOneSuccess(aEntityContext, aResults);
				if (bIsStrict) {
					aResults.forEach(function (oResult) {
						// attach userEnteredAdditionalParams with response
						oResult.userEnteredAdditionalParams = mUserEnteredAdditionalParams;
					});
				}
				if (that._bExecutedSuccessfully) {
					return aResults;
				} else {
					return Promise.reject(aResults);
				}
			}, function (aError) {
				that._bExecutedSuccessfully = false;
				//TODO: Think about throwing errors. Maybe not needed in a failing Promise...?
				aError.forEach(function (oError) {
					// attach userEnteredAdditionalParams with error
					oError.userEnteredAdditionalParams = mUserEnteredAdditionalParams;
				});
				throw aError;
			})
		});

		var _dataObject = aActionContexts[0].getObject();

		// update other contexts(from second) model to user input(from dialog)
		mActionParam.additionalParameters.forEach(function (param) {
			var _dataObjectValue = _dataObject[param.name] === null ? "" : _dataObject[param.name]; //Function Import should not return null, otherwise it would fail at Gateway
			// Set default value(false) for boolean type if value is 'undefined'
			if (param.type == "Edm.Boolean" && _dataObjectValue == undefined) {
				_dataObject[param.name] = false;
				_dataObjectValue = false;
			}
			// Capture the value of parameters entered by user
			mUserEnteredAdditionalParams[param.name] = _dataObjectValue;
			aActionContexts.forEach(function (ctx) {
				ctx.oModel.setProperty(param.name, _dataObjectValue, ctx);
			});
		});

		var sFunctionImportName = that._sFunctionImportPath.split('/')[1];
		aEntityContext.forEach(function (ctx, i) {
			that.getApplicationController().submitActionContext(ctx, aActionContexts[i], sFunctionImportName);
		});
		
		if (bIsStrict) {
			return true;
		}	
	};

	ActionUtil.prototype._call = function (mUrlParameters, bIsDraftEnabled, mHeaders) {
		var aCurrentContexts = this.getContexts();
		var mParameters = {
			urlParameters: mUrlParameters,
			operationGrouping: this.getOperationGrouping(),
			triggerChanges: bIsDraftEnabled,
			headers: mHeaders
		};
		var oController = this.getController();
		var oApplicationController = this.getApplicationController() || oController.getApplicationController();
		var that = this;


		that._oActionPromiseCallback.resolve({
			executionPromise: oApplicationController.invokeActions(this._sFunctionImportPath, aCurrentContexts, mParameters).then(function (oResponse) {
				that._bExecutedSuccessfully = true;
				return oResponse;
			}, function (oError) {
				that._bExecutedSuccessfully = false;
				//TODO: Think about throwing errors. Maybe not needed in a failing Promise...?
				throw oError;
			})

		});
	};

	ActionUtil.prototype._getActionParameterData = function (oParameterModel) {
		var aMissingMandatoryParameters = [];

		// raw parameter list contains all action parameters as key/value - no check required
		var oRawParameterData = oParameterModel.getObject('/');
		var oPreparedParameterData = {};
		for (var i = 0; i < this._oFunctionImport.parameter.length; i++) {
			var oParameter = this._oFunctionImport.parameter[i];
			var sParameterName = oParameter.name;
			if (oRawParameterData.hasOwnProperty(sParameterName)) {
				var oValue = oRawParameterData[sParameterName];
				if (oValue === undefined) {
					// if parameter is nullable=true don't pass it at all to function import call
					// TODO check boolean handling - should undefined boolean value be sent as false to backend or not at all
					if (!this._toBoolean(oParameter.nullable)) {
						// defaulting for boolean - set to false - UI state undefined for checkbox
						// all other not null checks should have already been done by smart field - if not throw error - should not happen at all
						if (oParameter.type === 'Edm.Boolean') {
							oPreparedParameterData[sParameterName] = false;
						} else {
							aMissingMandatoryParameters.push(oParameter);
						}
					}
				} else {
					oPreparedParameterData[sParameterName] = oValue;
				}
			} else {
				throw new Error("Unknown parameter: " + sParameterName);
			}
		}

		return {
			preparedParameterData: oPreparedParameterData,
			missingMandatoryParameters: aMissingMandatoryParameters
		};
	};


	/**
	 * Initiate a form with all needed controls to allow providing missing
	 * parameters which are needed by the triggered action.
	 *
	 * @param {object} mParameters Map that contains the parameters - prefilled and additional
	 * @param {object} oContext Context object of the triggered action
	 *
	 * @returns {object} A map with the two members: "form" and "hasNoClientErrors"
	 *
	 * @private
	 */
	ActionUtil.prototype._buildParametersForm = function (mParameters, oContext) {
		var oSmartForm = new SmartForm({
			editable: true,
			validationMode: "Async"
		});

		oSmartForm.setBindingContext(oContext);
		// list of all smart fields for input check
		var oSmartField;
		var aFields = [];
		var oSmartLabel;
		var sValueListType;
		var oGroup = new Group();

		for (var i = 0; i < mParameters.additionalParameters.length; i++) {
			var oParameter = mParameters.additionalParameters[i];

			// Check if field is used only to transport technical data (e.g. Field Control) and if it is therefore hidden
			if (oParameter["com.sap.vocabularies.UI.v1.Hidden"] && !oParameter["com.sap.vocabularies.UI.v1.Hidden"].Path && !(oParameter["com.sap.vocabularies.UI.v1.Hidden"].Bool === "false")) {
				continue;
			}

			sValueListType = oParameter["com.sap.vocabularies.Common.v1.ValueListWithFixedValues"] ? "fixed-values" : undefined;
			if (sValueListType == undefined) {
				sValueListType = oParameter["sap:value-list"] == "fixed-values" ? "fixed-values" : undefined;
			}

			if (!oParameter["com.sap.vocabularies.UI.v1.TextArrangement"]) {
				oParameter["com.sap.vocabularies.UI.v1.TextArrangement"] = {
					"EnumMember": "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly"
				};
			}

			oSmartField = new SmartField("ActionUtil-" + this._sFunctionImportPath.replace("/", "-") + "-" + oParameter.name, {
				value: '{' + oParameter.name + '}',
				textLabel: this._getParameterName(oParameter),
				width: "100%"
			});
			oSmartField.data("configdata", {
				"configdata": {
					isInnerControl: false,
					path: oParameter.name,
					entitySetObject: {},
					annotations: {
						valuelist: oParameter["com.sap.vocabularies.Common.v1.ValueList"],
						valuelistType: sValueListType
					},
					modelObject: oContext.oModel,
					entityType: oParameter.type,
					property: {
						property: oParameter,
						typePath: oParameter.name
					}
				}
			});

			//set statically mandatory if required by metadata
			if (oParameter.nullable == "false") {
				oSmartField.setMandatory(true);
			}

			aFields.push(oSmartField);

			oSmartLabel = new SmartLabel();
			oSmartLabel.setLabelFor(oSmartField);

			var oGroupElement = new GroupElement();

			oGroupElement.addElement(oSmartField);
			oGroup.addGroupElement(oGroupElement);
			
		}

		oSmartForm.addGroup(oGroup);

		// for now: always return false, as smart fields currently do not handle JSON models correctly
		var fnHasNoClientErrors = function () {
			var bNoClientErrors = true;
			for (var i = 0; i < aFields.length; i++) {
				if (aFields[i].getValueState() != "None") {
					bNoClientErrors = false;
					break;
				}
			}
			return bNoClientErrors;
		};

		return {
			form: oSmartForm,
			hasNoClientErrors: fnHasNoClientErrors
		};
	};


	ActionUtil.prototype._getParameterName = function (oParameter) {
		// if no label is set for parameter use parameter name as fallback
		return oParameter["com.sap.vocabularies.Common.v1.Label"] ? oParameter["com.sap.vocabularies.Common.v1.Label"].String : oParameter.name;
	};

	ActionUtil.prototype._addParameterLabel = function (oParameter, oEntityType) {
		if (oEntityType && oParameter && !oParameter["com.sap.vocabularies.Common.v1.Label"]) {

			var oProperty = this._oMetaModel.getODataProperty(oEntityType, oParameter.name, false);
			if (oProperty && oProperty["com.sap.vocabularies.Common.v1.Label"]) {
				// copy label from property to parameter with same name as default if no label is set for function import parameter
				oParameter["com.sap.vocabularies.Common.v1.Label"] = oProperty["com.sap.vocabularies.Common.v1.Label"];
			}
		}
	};


	/**
	 * returns the actions function import label
	 *
	 * @protected
	 * @returns {string} the function import label
	 */
	ActionUtil.prototype.getFunctionImportLabel = function () {
		return this._sFunctionImportLabel;
	};


	/**
	 * returns true if the action has executed successfully
	 *
	 * @protected
	 * @returns {boolean} true if the action has executed successfully
	 */
	ActionUtil.prototype.getExecutedSuccessfully = function () {
		return this._bExecutedSuccessfully;
	};

	return ActionUtil;

});
