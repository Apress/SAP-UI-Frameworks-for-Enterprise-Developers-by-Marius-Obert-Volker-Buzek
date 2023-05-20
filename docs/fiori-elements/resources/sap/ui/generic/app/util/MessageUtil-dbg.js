/*
 * ! SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */

sap.ui.define([
	"sap/ui/core/ValueState",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/syncStyleClass",
	"sap/ui/core/Fragment"
],
	function(ValueState, Filter, FilterOperator, JSONModel, MessageToast, syncStyleClass, Fragment) {
		"use strict";

		/**
		 * static Message Util class.
		 * @private
		 * @class This static class contains messages related to transient messages and error handling. There is a
		 * transformation from "transient" to "persistent" in the stack: in the backend messages that are only fired
		 * and returned once are called transient (opposite are state messages that are returned as long as the problem
		 * is not resolved). As the UI needs to take care that those messages are explicitly shown to the user a dialog
		 * is used, once the user closes the dialog the transient messages are removed.
		 * As there's no transient flag yet in the OData message container the target is misused, it's set to
		 * /#TRANSIENT/(target) while (target) contains the real target. The UI5 Message Parser knows this workaround,
		 * removes the /#TRANSIENT/ string, sets/calculates the target correctly and sets this message to persistent.
		 * In the message model this property is not called transient but persistent because the meaning of this
		 * property is that the messages are not automatically be removed from the Message Model (although further data/
		 * messages are read for the same entity type). The messages stay in the model as long as the client removes
		 * them. The methods in this Message connect the term "transient" with the term "persistent" - due to the fact
		 * that the purpose of them is to handle the transient messages from the backend they are still have the term
		 * transient in their names
		 * @author SAP SE
		 * @version 1.113.0
		 * @since 1.30.0
		 * @alias sap.ui.generic.app.util.MessageUtil
		 */

		var httpStatusCodes = {
			badRequest: "400",
			unauthorized: "401",
			forbidden: "403",
			notFound: "404",
			methodNotAllowed: "405",
			preconditionFailed: "428",
			internalServerError: "500",
			notImplemented: "501",
			badGateway: "502",
			serviceUnavailable: "503",
			gatewayTimeout: "504",
			httpVersionNotSupported: "505"
		};

		var operations = {
			callAction: "callAction",
			addEntry: "addEntry",
			saveEntity: "saveEntity",
			deleteEntity: "deleteEntity",
			editEntity: "editEntity",
			modifyEntity: "modifyEntity",
			activateDraftEntity: "activateDraftEntity",
			saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
			getCollection: "getCollection"
		};
		var sMessageErrorPath;

		/**
 			* Function returns all the transisent messages.
 			* @param {Boolean} bConsiderResourceNotFound - consider messages that certain resource which doesnt exist although it doesnt include valuable information
			* Note: this is needed for in case of resource not found messages should be able to clear the MessageManager which contains resource not found messages
 			* @returns {Array} Return description.
 		    */

		function fnGetTransientMessages(bConsiderResourceNotFound) {
			var aTransientMessages = [], oMessage;
			var oMessageManager = sap.ui.getCore().getMessageManager();
			var aMessages = oMessageManager.getMessageModel().getData();
			var aResourceNotFoundMessages = [];

			for (var i = 0; i < aMessages.length; i++) {
				oMessage = aMessages[i];
				var bResourceNotFound = oMessage.technicalDetails && oMessage.technicalDetails.statusCode === "404" && oMessage.type === "Error";
				if (oMessage.persistent) {
					if (bResourceNotFound) {
						aResourceNotFoundMessages.push(oMessage);
					} else {
						aTransientMessages.push(oMessage);
					}
				}
			}	
			return bConsiderResourceNotFound ? aTransientMessages.concat(aResourceNotFoundMessages) : aTransientMessages;
		}


		/**
			 * Default/example implementation for a dialog fragment provider needed for example in function <code>handleTransientMessages</code>
			 *
			 * @param {sap.ui.core.Control} oParentView The view on which the message dialog depends
			 * @param {string} [sContentDensityClass] The name of the style class
			 *
			 * @return {function} Provider function which requires two input parameters: the name of the fragment and the fragment controller.
			 *
			 * @since 1.40
			 * @private
			 */
		function createDialogFragmentProvider(oParentView, sContentDensityClass) {
			var fnDialogFragmentProvider;

			fnDialogFragmentProvider = function (sName, oFragmentController) {
				var oFragment;
				var oDialogFragmentControllerWrapper = {
					onMessageDialogClose: function () {
						oFragmentController.onMessageDialogClose();
						oFragment.destroy();
					},
					onActionButtonPressed: function() {
						oFragmentController.onActionButtonPressed();
						oFragment.destroy();
					}
				};

				return Fragment.load({name: sName, controller: oDialogFragmentControllerWrapper})
				.then(function (oFragment) {
					if (sContentDensityClass) {
						syncStyleClass(sContentDensityClass, oParentView, oFragment);
					}
					oParentView.addDependent(oParentView);
					return oFragment;
				});
			};

			return fnDialogFragmentProvider;
		}

		/**
		 * With this function, all transient messages are taken over from the MessageManager (thereby removed from it) and displayed.
		 *
		 * To show the messages, a custom <code>sap.ui.xmlfragment</code> can be provided via a callback function.
		 *
		 * @param {function|map} vMessageDialogData Either a callback <code>function</code> that returns a message dialog fragment or a
		 * property bag that contains the two parameters <code>owner</code> and <code>contentDensityClass</code>
		 * @param {sap.ui.core.Control} [vMessageDialogData.owner] The owner control on which the message dialog depends
		 * @param {string} [vMessageDialogData.contentDensityClass] The density class which controls the display mode
		 * @param {string} sActionLabel A label for the action
		 * @param {Object} oActionButtonConfig config object, if you want to paas a action and callback for dialog close button. It expects following properties:
		 * oActionButtonConfig.action: function to be executed on click of action button.
		 * oActionButtonConfig.actionLabel: Text to be shown for button.
		 * @returns a Promise that is resolved when the UI is no longer blocked by the message popup.
		 * @param {function} fnCloseCallback A callback which is called on press of close button, when there is an e-Tag error.
		 * @since 1.38
		 *
		 * @experimental
		 * @public
		 */
		function handleTransientMessages(vMessageDialogData, sActionLabel, oActionButtonConfig) {
			var aTransientMessages = fnGetTransientMessages();
			var oLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app");
			if (aTransientMessages.length === 0) { // no transient messages -> immediate return
				return Promise.resolve();
			}
			removeTransientMessages(); // remove transient messages from the message model. We can use aTransientMessages now.
			var sState = ValueState.None; // determines the maximum message severity
			for (var i = 0; i < aTransientMessages.length && sState !== ValueState.Error; i++) {
				var oMessage = aTransientMessages[i];
				switch (oMessage.type) {
					case sap.ui.core.MessageType.Error:
						sState = ValueState.Error;
						break;
					case sap.ui.core.MessageType.Warning:
						sState = ValueState.Warning;
						break;
					case sap.ui.core.MessageType.Success:
						if (sState === sap.ui.core.ValueState.None) {
							sState = ValueState.Success;
						}
						break;
					default:
						break;
				}
			}
			// Only one message which is a success (or info) message -> show as message toast
			if (aTransientMessages.length === 1 && (sState === ValueState.Success || sState === ValueState.None)) {
				MessageToast.show(aTransientMessages[0].message);
				return Promise.resolve(); // message toast does not block the ui
			}
			// Now we know that we need to send a popup -> return a Promise that is resolved when the popup is closed
			// Get a function that is able to retrieve a fragment and prepare it accordingly (set denisty class and owner)
			var fnMessageDialogProvider = (typeof vMessageDialogData === "function") ? vMessageDialogData : createDialogFragmentProvider(vMessageDialogData.owner, vMessageDialogData.contentDensityClass);
			// Now we prepare the controller of the dialog which will display the messages. However, we have to be careful.
			// fnMessageDialogProvider might use a cache of fragments. If a cached fragment is returned, then it will still have the controller which was set, when it was created.
			// As a consequence the dialog controller must only access variables from the closure which are identical for all usages of the dialog.
			// This is ensured for the following variables:
			var oDialog, oMessageView, oSettingModel;
			var fnDialogClose = function () {
				oDialog.close();
				// clean up after close. Note that the dialog might be reused.
				oSettingModel.setProperty("/backButtonVisible", false);
				oSettingModel.setProperty("/messages", []); // ensure that the message can be garbage collected
				oSettingModel.setProperty("/messageToGroupName", Object.create(null));
				oMessageView.navigateBack();
				oSettingModel.getProperty("/resolve")();
			};
			var oDialogFragmentController = {
				onMessageDialogClose: function () {
					fnDialogClose(oSettingModel);
				},
				onActionButtonPressed: function () {
					oSettingModel.getProperty("/actionButtonCallback")();
					fnDialogClose(oSettingModel);
				},
				onBackButtonPress: function () {
					oSettingModel.setProperty("/backButtonVisible", false);
					oMessageView.navigateBack();
				},
				onMessageSelect: function () {
					oSettingModel.setProperty("/backButtonVisible", true);
				}
			};
			return fnMessageDialogProvider("sap.ui.generic.app.fragments.MessageDialog", oDialogFragmentController)
				.then(function (odialog) {
					oDialog = odialog;
					oMessageView = oDialog.getContent()[0];
					// the following code prepares the grouping of messages.
					// Note that grouping will only be done when at least one message is attached to another group then the generic one
					var oModel = oDialog.getModel();
					var oMetaModel = oModel && oModel.getMetaModel();
					var bGroupMessages = false; // do we need to group?
					var bShowActionButton = !!(oActionButtonConfig && oActionButtonConfig.action);
					var mMessageToGroupName = Object.create(null); // maps the ids of the messages to their group header (if this is non-generic)
					if (oMetaModel) {
						aTransientMessages.forEach(function (oMessage) { // loop over all messages, derive group header from their target and put them to mMessageToGroupName
							var sMessageTarget = oMessage.getTarget();
							if (!sMessageTarget) {
								return;
							}
							if (sMessageTarget.lastIndexOf("/") > 0) {
								sMessageTarget = sMessageTarget.substring(0, sMessageTarget.lastIndexOf("/"));
							}
							var sEntitySet = sMessageTarget.substring(1, sMessageTarget.indexOf("("));
							var oEntitySet = sEntitySet && oMetaModel.getODataEntitySet(sEntitySet);
							var oEntityType = oEntitySet && oMetaModel.getODataEntityType(oEntitySet.entityType);
							var oHeaderInfo = oEntityType && oEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"];
							var sTypeName = oHeaderInfo && oHeaderInfo.Title && oHeaderInfo.Title.Value && oHeaderInfo.Title.Value.Path;
							var oEntity = oModel.getProperty(sMessageTarget);
							var sGroupName = oEntity && oEntity[sTypeName];
							if (sGroupName) {
								mMessageToGroupName[oMessage.getId()] = sGroupName;
								bGroupMessages = true; // non generic group header found -> we must group
							}
						});
					}
					oSettingModel = oDialog.getModel("settings"); // Try to reuse existing model. This also ensures that oSettingModel can be used in the fragment controller.
					if (!oSettingModel) { // This is the first time the dialog is displayed -> initialize the model
						oSettingModel = new JSONModel({
							genericGroupName: oLibraryResourceBundle.getText("GENERAL_TITLE"), // the group name used for all messages, for which no group header could be determined (if necessary)
							backButtonVisible: false,
							// Cancel text, which is conditionally shown, when there is other action present. Otherwise, closeButtonText is shown to close the
							// dialog.
							cancelButtonText: oLibraryResourceBundle.getText("DIALOG_CANCEL"),
							closeButtonText: oLibraryResourceBundle.getText("DIALOG_CLOSE")  // don't use i18n model as the resources would then be loaded every time

						});
						oDialog.setModel(oSettingModel, "settings");
					}
					oSettingModel.setProperty("/showActionButton", bShowActionButton);
					if (bShowActionButton) {
						oSettingModel.setProperty("/actionButtonText", oActionButtonConfig.actionLabel);
						// we are setting callback method as a property in model, because fragment is created only 1 time,
						// and thus there is only one controller, with it's function.
						oSettingModel.setProperty("/actionButtonCallback", oActionButtonConfig.action);
					}
					oSettingModel.setProperty("/title", sActionLabel || oLibraryResourceBundle.getText("DIALOG_TITLE"));
					oSettingModel.setProperty("/messages", aTransientMessages);
					oSettingModel.setProperty("/grouping", bGroupMessages);
					oSettingModel.setProperty("/state", sState);
					oSettingModel.setProperty("/resolve", function () { return Promise.resolve(); }); // make the resolve function available to the controller
					oSettingModel.setProperty("/messageToGroupName", mMessageToGroupName); // make the group headers available to the expression binding in the fragment
					oDialog.open();
					return null;
				});
		}

		/**
		 * Remove all transient messages that are currently available in the MessageManager.
		 *
		 * @since 1.38
		 *
		 * @experimental
		 * @public
		 */
		function removeTransientMessages() {
			var oMessageManager = sap.ui.getCore().getMessageManager();
			// need to clear all messages including resourcenotfound hence parameter as true 
			var aTransientMessages = fnGetTransientMessages(true);

			if (aTransientMessages.length > 0) {
				oMessageManager.removeMessages(aTransientMessages);
			}
		}

		/**
		 * add a transient error messages to the MessageManager
		 *
		 * @param {string} sMessage Text of the message to add
		 * @param {string} sDescription Long text of the transient message added
		 *
		 * @since 1.40
		 * @experimental
		 * @public
		 */
		function addTransientErrorMessage(sMessage, sDescription, oModel) {
			// currently still use /#TRANSIENT target, to be replaced with persistent flag
			var oTransientMessage = new sap.ui.core.message.Message({
				message: sMessage,
				description: sDescription,
				type: sap.ui.core.MessageType.Error,
				processor: oModel,
				target: '',
				persistent: true
			});
			sap.ui.getCore().getMessageManager().addMessages(oTransientMessage);
		}

		/**
		 * This function parses an error response and returns information like the status code, leading error text,
		 * description (not yet) and if already transient message exist
		 *
		 * @param {object} oError The error response object
		 *
		 * @since 1.40
		 *
		 * @experimental
		 * @public
		 */
		function parseErrorResponse(oError) {
			var oReturn;

			// BCP 1770144015
			sMessageErrorPath = oError && oError.url;
			if (sMessageErrorPath) {
				sMessageErrorPath = "/" + sMessageErrorPath.substring(0,sMessageErrorPath.indexOf(")") + 1);
			}

			var sMessage = sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app").getText("ERROR_UNKNOWN");
			var iHttpStatusCode;

			if (oError instanceof Error) {
				// promise rejection
				if (oError.message) {
					// TODO differentiate between technical errors and business errors in case of promise rejections
					sMessage = oError.message;
				}
			} else if (oError.response) { // odata error
				if (oError.response.message) {
					// TODO differentiate between technical errors and business errors in case of promise rejections
					sMessage = oError.response.message;
				}

				// check http status code
				var vHttpStatusCode = oError.response.statusCode;
				// httpStatusCode is a string but if you get an error for the complete $batch else the the httpStatusCode is a number
				iHttpStatusCode = !Number.isInteger(vHttpStatusCode) ? Number(vHttpStatusCode) : vHttpStatusCode;

				// check for content type of response - in case of a runtime error on the backend it is xml
				if (oError.response.headers) {
					for (var sHeader in oError.response.headers) {
						if (sHeader.toLowerCase() === "content-type") {
							var sHeaderValue = oError.response.headers[sHeader];
							if (sHeaderValue.toLowerCase().indexOf("application/json") === 0) {
								if (oError.response.responseText) {
									var oODataError = JSON.parse(oError.response.responseText);
									if (oODataError && oODataError.error && oODataError.error.message && oODataError.error.message.value) {
										sMessage = oODataError.error.message.value;
									}
								}
							} else if (oError.message) {
								sMessage = oError.message;
							}
							break;
						} // if content-type is not application/json it is usually an internal server error (status code 500)
					}
				}
			}

			var aTransientMessages = fnGetTransientMessages();

			oReturn = {
				httpStatusCode: iHttpStatusCode,
				messageText: sMessage,
				description: null, // TODO: get description
				containsTransientMessage: (aTransientMessages.length === 0) ? false : true
			};

			return oReturn;
		}

		return {
			operations: operations,
			httpStatusCodes: httpStatusCodes,
			handleTransientMessages: handleTransientMessages,
			removeTransientMessages: removeTransientMessages,
			addTransientErrorMessage: addTransientErrorMessage,
			parseErrorResponse: parseErrorResponse,
			getTransientMessages: fnGetTransientMessages
		};
	}, true);
