/*
 * ! SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define([
	"sap/fe/navigation/NavigationHandler",
	"sap/fe/navigation/library",
	"./NavError",
	"./SelectionVariant",
	//Add your require statemets above this line
	"sap/ui/generic/app/library"
],
function (FENavHandler, NavLibrary, NavError, SelectionVariant) {
	"use strict";

	/**
	 * @class Creates a new NavigationHandler class by providing the required environment. <br>
	 *        The <code>NavigationHandler</code> supports the verification of sensitive information. All properties that are part of
	 *        <code>selectionVariant</code> and <code>valueTexts</code> will be verified if they are annotated as
	 *        <code>com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive</code> or
	 *        <code>com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext</code> and will be removed before the data is persisted as the app
	 *        state.<br>
	 *        Also, all properties annotated as <code>com.sap.vocabularies.Analytics.v1.Measure</code> will be removed from the data stored as the
	 *        xapp state.<br>
	 *        To verify the information to be removed, the <code>NavigationHandler</code> requires an unnamed model of type
	 *        {@link sap.ui.model.odata.v2.ODataModel} on component level. It is possible to set such a model using the <code>setModel</code>
	 *        method.<br>
	 *        <b>Note:</b> The check for excluded data requires that the OData metadata has already been loaded completely.<br>
	 *        If the OData metadata model has not been loaded completely, all properties are removed from the application context.<br>
	 *        <b>Note:</b> This class requires that the UShell {@link sap.ushell.services.CrossApplicationNavigation} is available and initialized.
	 * @extends sap.fe.navigation.NavigationHandler
	 * @constructor
	 * @public
	 * @deprecated Since version 1.83.0. Please use {@link sap.fe.navigation.NavigationHandler} instead.
	 * @param {object} oController UI5 controller that contains a router and a component; typically the main controller of your application, for
	 *        example, a subclass of the sap.ca.scfld.md.controller.BaseFullscreenController if scaffolding is used
	 * @param {string} [sParamHandlingMode=SelVarWins] Mode to be used to handle conflicts when merging URL parameters and the SelectionVariant class,
	 *        see {@link sap.ui.generic.app.navigation.service.ParamHandlingMode}
	 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of input errors. Valid error codes are: <table>
	 *         <tr>
	 *         <th align="left">Error code</th>
	 *         <th align="left">Description</th>
	 *         </tr>
	 *         <tr>
	 *         <td>NavigationHandler.INVALID_INPUT</td>
	 *         <td>Indicates that the input parameter is invalid</td>
	 *         </tr>
	 *         </table>
	 * @alias sap.ui.generic.app.navigation.service.NavigationHandler
	 */
	var NavigationHandler = FENavHandler.extend("sap.ui.generic.app.navigation.service.NavigationHandler", /** @lends sap.ui.generic.app.navigation.service.NavigationHandler */
	{
		metadata: {
			publicMethods: [
				"navigate", "parseNavigation", "storeInnerAppState", "openSmartLinkPopover", "mixAttributesAndSelectionVariant", "setModel"
			]
		},

		constructor: function(oController, sParamHandlingMode) {
			try {
				FENavHandler.apply(this, [oController, NavLibrary.Mode.ODataV2, sParamHandlingMode]);
			} catch (oError) {
				if (oError) {
					throw new NavError(oError.getErrorCode());
				}
			}
		},

		/**
		 * Triggers a cross-app navigation after saving the inner and the cross-app states. Since 1.52.0 the navigation mode based on
		 * <code>sap-ushell-next-navmode</code> is taken into account. If set to <code>explace</code> the inner app state will not be changed.
		 * <b>Note:</b> The <code>sNavMode</code> argument can be used to overwrite the SAP Fiori launchpad default navigation for opening a URL
		 * in-place or ex-place.
		 * @param {string} sSemanticObject Name of the semantic object of the target app
		 * @param {string} sActionName Name of the action of the target app
		 * @param {object | string } [vNavigationParameters] Navigation parameters as an object with key/value pairs or as a string representation of
		 *        such an object. If passed as an object, the properties are not checked against the <code>IsPotentialSensitive</code> or
		 *        <code>Measure</code> type.
		 * @param {object} [oInnerAppData] Object for storing current state of the app
		 * @param {string} [oInnerAppData.selectionVariant] Stringified JSON object as returned, for example, from getDataSuiteFormat() of the
		 *        SmartFilterBar control
		 * @param {string} [oInnerAppData.tableVariantId] ID of the SmartTable variant
		 * @param {object} [oInnerAppData.customData] Object that can be used to store arbitrary data
		 * @param {object} [oInnerAppData.presentationVariant] Object containing the current ui state of the app
		 * @param {object} [oInnerAppData.valueTexts] Object containing value descriptions
		 * @param {object} [oInnerAppData.semanticDates] Object containing semanticDates filter information
		 * @param {function} [fnOnError] Callback that is called if an error occurs during navigation <br>
		 * @param {object} oExternalAppData Object for storing the state which will be forwarded to the target component.
		 * @param {object} [oExternalAppData.presentationVariant] Object containing the current ui state of the app which will be forwarded to the
		 *        target component.
		 * @param {object} [oExternalAppData.valueTexts] Object containing value descriptions which will be forwarded to the target component.
		 * @param {object} [oExternalAppData.selectionVariant] Stringified JSON object, which will be forwarded to the target component. If not
		 *        provided the selectionVariant will be constructed based on the vNavigationParameters.
		 * @param {string} [sNavMode] Argument is used to overwrite the FLP-configured target for opening a URL. If used, only the
		 *        <code>explace</code> or <code>inplace</code> values are allowed. Any other value will lead to an exception
		 *        <code>NavigationHandler.INVALID_NAV_MODE</code>.
		 * @public
		 * @deprecated Since version 1.83.0 <br>
		 *         <b>Node:</b> If the <code>oExternalAppData</code> parameter is not supplied, the external app data will be calculated based on
		 *         the <code>oInnerAppData</code> data.<br>
		 *         SmartFilterBar control <b>Parameters:</b> <table>
		 *         <tr>
		 *         <td align="center">{object}</td>
		 *         <td><b>oError</b></td>
		 *         <td>Error object (instance of {@link sap.ui.generic.app.navigation.service.NavError}) that describes which kind of error occurred</td>
		 *         <tr>
		 *         <td align="center">{string}</td>
		 *         <td><b>oError.errorCode</b></td>
		 *         <td>Code to identify the error</td>
		 *         <tr>
		 *         <td align="center">{string}</td>
		 *         <td><b>oError.type</b></td>
		 *         <td>Severity of the error (info/warning/error)</td>
		 *         <tr>
		 *         <td align="center">{array}</td>
		 *         <td><b>oError.params</b></td>
		 *         <td>An array of objects (typically strings) that describe additional value parameters required for generating the message</td>
		 *         </table>
		 * @example <code>
		 * sap.ui.define(["sap/ui/generic/app/navigation/service/NavigationHandler", "sap/ui/generic/app/navigation/service/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
		 * 	var oNavigationHandler = new NavigationHandler(oController);
		 * 	var sSemanticObject = "SalesOrder";
		 * 	var sActionName = "create";
		 *
		 * 	//simple parameters as Object
		 * 	var vNavigationParameters = {
		 * 		CompanyCode : "0001",
		 * 		Customer : "C0001"
		 * 	};
		 *
		 * 	//or as selection variant
		 * 	var oSelectionVariant = new SelectionVariant();
		 * 	oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
		 * 	oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
		 * 	vNavigationParameters = oSelectionVariant.toJSONString();
		 *
		 * 	//or directly from SmartFilterBar
		 * 	vNavigationParameters = oSmartFilterBar.getDataSuiteFormat();
		 *
		 * 	//app state for back navigation
		 * 	var oInnerAppData = {
		 * 		selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
		 * 		tableVariantId : oSmartTable.getCurrentVariantId(),
		 * 		customData : oMyCustomData
		 * 	};
		 *
		 * 	// callback function in case of errors
		 * 	var fnOnError = function(oError){
		 * 		var oi18n = oController.getView().getModel("i18n").getResourceBundle();
		 * 		oError.setUIText({oi18n : oi18n, sTextKey : "OUTBOUND_NAV_ERROR"});
		 * 		oError.showMessageBox();
		 * 	};
		 *
		 * 	oNavigationHandler.navigate(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError);
		 * });
		 * </code>
		 */
		navigate: function(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError, oExternalAppData, sNavMode) {
			try {
				var _fnOnError = function(fnOnError, oError) {
					if (oError) {
						var oNavError = new NavError(oError.getErrorCode());
						if (fnOnError) {
							fnOnError(oNavError);
						}
					}
				};
				FENavHandler.prototype.navigate.apply(this, [sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, _fnOnError.bind(this,fnOnError), oExternalAppData, sNavMode]);

			} catch (oError){
				if (oError){
					throw new NavError(oError.getErrorCode());
				}
			}
		},

		/**
		 * Parses the incoming URL and returns a Promise. If this method detects a back navigation, the inner app state is returned in the resolved
		 * Promise. Otherwise startup parameters will be merged into the app state provided by cross app navigation, and a combined app state will be
		 * returned. The conflict resolution can be influenced with sParamHandlingMode defined in the constructor.
		 * @returns {object} A Promise object to monitor when all the actions of the function have been executed. If the execution is successful, the
		 *          extracted app state, the startup parameters, and the type of navigation are returned, see also the example above. The app state is
		 *          an object that contains the following information:
		 *          <ul>
		 *          <li><code>oAppData.oSelectionVariant</code>: An instance of {@link sap.ui.generic.app.navigation.service.SelectionVariant}
		 *          containing only parameters/select options that are related to navigation</li>
		 *          <li><code>oAppData.selectionVariant</code>: The navigation-related selection variant as a JSON-formatted string</li>
		 *          <li><code>oAppData.oDefaultedSelectionVariant</code>: An instance of
		 *          {@link sap.ui.generic.app.navigation.service.SelectionVariant} containing only the parameters/select options that are set by user
		 *          default data</li>
		 *          <li><code>oAppData.bNavSelVarHasDefaultsOnly</code>: A Boolean flag that indicates whether only defaulted parameters and no
		 *          navigation parameters are present.<br>
		 *          <b>Note:</b> If no navigation parameters are available, <code>bNavSelVarHasDefaultsOnly</code> is set to <code>true</code>,
		 *          even though parameters without default might be available as well.</li>
		 *          </ul>
		 *          If the navigation-related selection variant is empty, it is replaced by a copy of the defaulted selection variant.<br>
		 *          The navigation type is an enumeration type of type {@link sap.ui.generic.app.navigation.service.NavType} (possible values are
		 *          initial, URLParams, xAppState, and iAppState).<br>
		 *          <b>Note:</b> If the navigation type is {@link sap.ui.generic.app.navigation.service.NavType.iAppState} oAppData has two
		 *          additional properties
		 *          <ul>
		 *          <li><code>oAppData.tableVariantId</code></li>
		 *          <li><code>oAppData.customData</code></li>
		 *          </ul>
		 *          which return the inner app data as stored in {@link #.navigate navigate} or {@link #.storeInnerAppState storeInnerAppState}.
		 *          <code>oAppData.oDefaultedSelectionVariant</code> is an empty selection variant and
		 *          <code>oAppData.bNavSelVarHasDefaultsOnly</code> is <code>false</code> in this case.<br>
		 *          <b>Note:</b> If the navigation type is {@link sap.ui.generic.app.navigation.service.NavType.initial} oAppData is an empty object!<br>
		 *          If an error occurs, an error object of type {@link sap.ui.generic.app.navigation.service.NavError}, URL parameters (if available)
		 *          and the type of navigation are returned.
		 * @public
		 * @deprecated Since version 1.83.0
		 * @example <code>
		 * sap.ui.define(["sap/ui/generic/app/navigation/service/NavigationHandler"], function (NavigationHandler){
		 * 	var oNavigationHandler = new NavigationHandler(oController);
		 * 	var oParseNavigationPromise = oNavigationHandler.parseNavigation();
		 *
		 * 	oParseNavigationPromise.done(function(oAppData, oStartupParameters, sNavType){
		 * 		oSmartFilterBar.setDataSuiteFormat(oAppData.selectionVariant);
		 * 		// oAppData.oSelectionVariant can be used to manipulate the selection variant
		 * 		// oAppData.oDefaultedSelectionVariant contains the parameters which are set by user defaults
		 * 		// oAppData.bNavSelVarHasDefaultsOnly indicates whether only defaulted parameters and no navigation parameters are present
		 * 	});
		 * 	oParseNavigationPromise.fail(function(oError, oURLParameters, sNavType){
		 * 		// if e.g. the xapp state could not be loaded, nevertheless there may be URL parameters available
		 * 		//some error handling
		 * 	});
		 * });

		 * </code>
		 */
		parseNavigation: function() {
			try {
				var oMyDeferred = jQuery.Deferred();
				var oParseNavigationPromise =  FENavHandler.prototype.parseNavigation.apply(this);
				oParseNavigationPromise.done(function (oAppData, oStartupParameters, sNavType) {
					if (Object.keys(oAppData).length){
						var oSelectionVariant = oAppData.oSelectionVariant;
						var oDefaultedSelectionVariant = oAppData.oDefaultedSelectionVariant;
						oAppData.oSelectionVariant = oSelectionVariant && new SelectionVariant(oSelectionVariant.toJSONObject());
						oAppData.oDefaultedSelectionVariant = oDefaultedSelectionVariant && new SelectionVariant(oDefaultedSelectionVariant.toJSONObject());
						var oDefaultSelVar = oAppData.oDefaultedSelectionVariant;
						if (oDefaultSelVar && oDefaultSelVar.getText() === "Selection Variant with ID " + oDefaultSelVar.getID()) {
							delete oAppData.oDefaultedSelectionVariant.text;
						}
					}
					oMyDeferred.resolve(oAppData, oStartupParameters, sNavType);
				});
				oParseNavigationPromise.fail(function (oError, oStartupParameters, sNavType) {
					var oGenericAppError = new NavError(oError.getErrorCode());
					oMyDeferred.reject(oGenericAppError, oStartupParameters, sNavType);
				});
				return oMyDeferred.promise();
			} catch (oError) {
				if (oError) {
					throw new NavError(oError.getErrorCode());
				}
			}
		},

		/**
		 * Sets the application specific technical parameters. Technical parameters will not be added to the selection variant passed to the
		 * application. As a default the following values are considered as technical parameters:
		 * <ul>
		 * <li><code>sap-system</code></li>
		 * <li><code>sap-ushell-defaultedParameterNames</code></li>
		 * <li><code>"hcpApplicationId"</code></li>
		 * </ul>
		 * @param {array} aTechnicalParameters list of parameter names to be considered as technical parameters. <code>null</code> or
		 *        <code>undefined</code> may be used to reset the complete list.
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		setTechnicalParameters: function(aTechnicalParameters) {
			try {
				FENavHandler.prototype.setTechnicalParameters.apply(this, [aTechnicalParameters]);
			} catch (oError) {
				if (oError) {
					throw new NavError(oError.getErrorCode());
				}
			}
		},

		/**
		 * Gets the application specific technical parameters. Technical parameters will not be added to the selection variant passed to the
		 * application. As a default the following values are considered as technical parameters:
		 * <ul>
		 * <li><code>sap-system</code></li>
		 * <li><code>sap-ushell-defaultedParameterNames</code></li>
		 * <li><code>"hcpApplicationId"</code></li>
		 * </ul>
		 * @returns {array} Containing the technical parameters.
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		getTechnicalParameters: function() {
			return FENavHandler.prototype.getTechnicalParameters.apply(this);
		},

		/**
		 * Changes the URL according to the current sAppStateKey. As an reaction route change event will be triggered.
		 * @param {string} sAppStateKey the new app state key.
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		replaceHash: function(sAppStateKey) {
			FENavHandler.prototype.replaceHash.apply(this,[sAppStateKey]);
		},

		/**
		 * Changes the URL according to the current app state and stores the app state for later retrieval.
		 * @param {object} mInnerAppData Object containing the current state of the app
		 * @param {string} mInnerAppData.selectionVariant Stringified JSON object as returned, for example, from getDataSuiteFormat() of the
		 *        SmartFilterBar control
		 * @param {string} [mInnerAppData.tableVariantId] ID of the SmartTable variant
		 * @param {object} [mInnerAppData.customData] Object that can be used to store additional app-specific data
		 * @param {object} [mInnerAppData.presentationVariant] Object containing the current ui state of the app
		 * @param {object} [mInnerAppData.valueTexts] Object containing value descriptions
		 * @param {object} [mInnerAppData.semanticDates] Object containing semanticDates filter information
		 * @param {boolean} [bImmediateHashReplace=true] If set to false, the inner app hash will not be replaced until storing is successful; do not
		 *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event
		 * @returns {object} A Promise object to monitor when all the actions of the function have been executed; if the execution is successful, the
		 *          app state key is returned; if an error occurs, an object of type {@link sap.ui.generic.app.navigation.service.NavError} is
		 *          returned
		 * @public
		 * @deprecated Since version 1.83.0
		 * @example <code>
		 * sap.ui.define(["sap/ui/generic/app/navigation/service/NavigationHandler"], function (NavigationHandler) {
		 * 	var oNavigationHandler = new NavigationHandler(oController);
		 * 	var mInnerAppData = {
		 * 		selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
		 * 		tableVariantId : oSmartTable.getCurrentVariantId(),
		 * 		customData : oMyCustomData
		 * 	};
		 *
		 * 	var oStoreInnerAppStatePromise = oNavigationHandler.storeInnerAppState(mInnerAppData);
		 *
		 * 	oStoreInnerAppStatePromise.done(function(sAppStateKey){
		 * 	//your inner app state is saved now, sAppStateKey was added to URL
		 * 	//perform actions that must run after save
		 * 	});
		 *
		 * 	oStoreInnerAppStatePromise.fail(function(oError){
		 * 		//some error handling
		 * 	});
		 * });
		 * </code>
		 */
		storeInnerAppState: function(mInnerAppData, bImmediateHashReplace) {
			return FENavHandler.prototype.storeInnerAppState.apply(this, [mInnerAppData, bImmediateHashReplace]);
		},

		/**
		 * Changes the URL according to the current app state and stores the app state for later retrieval.
		 * @param {object} mInnerAppData Object containing the current state of the app
		 * @param {string} mInnerAppData.selectionVariant Stringified JSON object as returned, for example, from getDataSuiteFormat() of the
		 *        SmartFilterBar control
		 * @param {string} [mInnerAppData.tableVariantId] ID of the SmartTable variant
		 * @param {object} [mInnerAppData.customData] Object that can be used to store additional app-specific data
		 * @param {object} [mInnerAppData.presentationVariant] Object containing the current ui state of the app
		 * @param {object} [mInnerAppData.valueTexts] Object containing value descriptions
		 * @param {object} [mInnerAppData.semanticDates] Object containing semanticDates filter information
		 * @param {boolean} [bImmediateHashReplace=false] If set to false, the inner app hash will not be replaced until storing is successful; do not
		 *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event. <b>Note:</b>If
		 *        not provided it will be treated as set to false. <b>Note:</b>If set to true, the calling instance has to ensure that a follow-on
		 *        call to <code>replaceHash</code> will take place!
		 * @returns {Object} An object containing the appStateId and a promise object to monitor when all the actions of the function have been
		 *          executed; Please note that the appStateKey may be undefined or empty.
		 * @example <code>
		 * sap.ui.define(["sap/ui/generic/app/navigation/service/NavigationHandler"], function (NavigationHandler) {
		 * 	var oNavigationHandler = new NavigationHandler(oController);
		 * 	var mInnerAppData = {
		 * 		selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
		 * 		tableVariantId : oSmartTable.getCurrentVariantId(),
		 * 		customData : oMyCustomData
		 * 	};
		 *
		 * 	var oStoreInnerAppState = storeInnerAppStateWithNonDelayedReturn(mInnerAppData);
		 * 	var sAppStateKey = oStoreInnerAppState.appStateKey;
		 * 	if (!sAppStateKey) {
		 *    // no appStateKey obtained...
		 * 	};
		 * 	var oStoreInnerAppStatePromise = oStoreInnerAppState.promise;
		 *
		 * 	oStoreInnerAppStatePromise.done(function(sAppStateKey){
		 * 		//your inner app state is saved now, sAppStateKey was added to URL
		 * 		//perform actions that must run after save
		 * 	});
		 *
		 * 	oStoreInnerAppStatePromise.fail(function(oError){
		 * 		//some error handling
		 * 	});
		 * });
		 * </code>
		 * @public
		 * @deprecated Since version 1.83.0
		 */
		storeInnerAppStateWithImmediateReturn: function(mInnerAppData, bImmediateHashReplace) {
			return FENavHandler.prototype.storeInnerAppStateWithImmediateReturn.apply(this, [mInnerAppData, bImmediateHashReplace]);
		},

		/**
		 * Processes navigation-related tasks related to beforePopoverOpens event handling for the SmartLink control and returns a Promise object. In
		 * particular, the following tasks are performed before the SmartLink popover can be opened:
		 * <ul>
		 * <li>If <code>mInnerAppData</code> is provided, this inner app state is saved for back navigation at a later time.</li>
		 * <li>The table event parameters (semantic attributes) and the selection variant data are combined by calling the method
		 * {@link #.mixAttributesAndSelectionVariant mixAttributesAndSelectionVariant}.</li>
		 * <li>The combined data is saved as the cross app state to be handed over to the target app, and the corresponding sap-xapp-state key is set
		 * in the URL.</li>
		 * <li>All single selections ("including equal") of the combined selection data are passed to the SmartLink popover as semantic attributes.</li>
		 * <li>The method <code>oTableEventParameters.open()</code> is called. Note that this does not really open the popover, but the SmartLink
		 * control proceeds with firing the event <code>navigationTargetsObtained</code>.</li>
		 * </ul>
		 * @param {object} oTableEventParameters The parameters made available by the SmartTable control when the SmartLink control has been clicked,
		 *        an instance of a PopOver object
		 * @param {string} sSelectionVariant Stringified JSON object as returned, for example, from getDataSuiteFormat() of the SmartFilterBar control
		 * @param {object} [mInnerAppData] Object containing the current state of the app. If provided, opening the Popover is deferred until the
		 *        inner app data is saved in a consistent way.
		 * @param {string} [mInnerAppData.selectionVariant] Stringified JSON object as returned, for example, from getDataSuiteFormat() of the the
		 *        SmartFilterBar control; if provided, the selection is merged into the semantic attributes
		 * @param {string} [mInnerAppData.tableVariantId] ID of the SmartTable variant
		 * @param {object} [mInnerAppData.customData] Object that can be used to store additional app-specific data
		 * @param {object} [mInnerAppData.presentationVariant] Object containing the current ui presentationVariantof the app
		 * @param {object} [mInnerAppData.valueTexts] Object containing value descriptions
		 * @param {object} [mInnerAppData.semanticDates] Object containing semanticDates filter information
		 * @param {object} [oExternalAppData] Object containing the state which will be passed to the target screen.
		 * @param {object} [oExternalAppData.selectionVariant] Object containing selectionVariant, which will be passed to the target screen. If not
		 *        set the sSelectionVariant will be used.
		 * @param {object} [oExternalAppData.presentationVariant] Object containing the current ui presentationVariant of the app, which will be
		 *        passed to the target screen
		 * @param {object} [oExternalAppData.valueTexts] Object containing value descriptions, which will be passed to the target screen
		 * @returns {object} A Promise object to monitor when all actions of the function have been executed; if the execution is successful, the
		 *          modified oTableEventParameters is returned; if an error occurs, an error object of type
		 *          {@link sap.ui.generic.app.navigation.service.NavError} is returned
		 * @public
		 * @deprecated Since version 1.83.0 <br>
		 *         <b>Node:</b> If the <code>oExternalAppData</code> parameter is not supplied, the external app data will be calculated based on
		 *         the <code>mInnerAppData</code> data.<br>
		 * @example <code>
		 * sap.ui.define(["sap/ui/generic/app/navigation/service/NavigationHandler", "sap/ui/generic/app/navigation/service/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
		 * 	//event handler for the smart link event "beforePopoverOpens"
		 * 		onBeforePopoverOpens: function(oEvent) {
		 * 			var oTableEventParameters = oEvent.getParameters();
		 *
		 * 			var mInnerAppData = {
		 * 				selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
		 * 				tableVariantId : oSmartTable.getCurrentVariantId(),
		 * 				customData : oMyCustomData
		 * 			};
		 *
		 * 			var oSelectionVariant = new SelectionVariant();
		 * 			oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
		 * 			oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
		 * 			var sSelectionVariant= oSelectionVariant.toJSONString();
		 *
		 * 			var oNavigationHandler = new NavigationHandler(oController);
		 * 			var oSmartLinkPromise = oNavigationHandler.processBeforeSmartLinkPopoverOpens(oTableEventParameters, sSelectionVariant, mInnerAppData);
		 *
		 * 			oSmartLinkPromise.done(function(oTableEventParameters){
		 * 				// here you can add coding that should run after all app states are saved and the semantic attributes are set
		 * 			});
		 *
		 * 			oSmartLinkPromise.fail(function(oError){
		 * 			//some error handling
		 * 			});
		 * 		});
		 * };
		 * </code>
		 */
		processBeforeSmartLinkPopoverOpens: function(oTableEventParameters, sSelectionVariant, mInnerAppData, oExternalAppData) {
			return FENavHandler.prototype.processBeforeSmartLinkPopoverOpens.apply(this, [oTableEventParameters, sSelectionVariant, mInnerAppData, oExternalAppData]);
		},

		/**
		 * Combines the given parameters and selection variant into a new selection variant containing properties from both, with the parameters
		 * overriding existing properties in the selection variant. The new selection variant does not contain any parameters. All parameters are
		 * merged into select options. The output of this function, converted to a JSON string, can be used for the
		 * {@link #.navigate NavigationHandler.navigate} method.
		 * @param {object} mSemanticAttributes Object containing key/value pairs
		 * @param {string} sSelectionVariant The selection variant in string format as provided by the SmartFilterBar control
		 * @param {int} [iSuppressionBehavior=sap.ui.generic.app.navigation.service.SuppressionBehavior.standard] Indicates whether semantic
		 *        attributes with special values (see {@link sap.ui.generic.app.navigation.service.SuppressionBehavior suppression behavior}) must be
		 *        suppressed before they are combined with the selection variant; several
		 *        {@link sap.ui.generic.app.navigation.service.SuppressionBehavior suppression behaviors} can be combined with the bitwise OR operator
		 *        (|)
		 * @returns {object} Instance of {@link sap.ui.generic.app.navigation.service.SelectionVariant}
		 * @public
		 * @deprecated Since version 1.83.0
		 * @example <code>
		 * sap.ui.define(["sap/ui/generic/app/navigation/service/NavigationHandler"], function (NavigationHandler) {
		 * 	var mSemanticAttributes = { "Customer" : "C0001" };
		 * 	var sSelectionVariant = oSmartFilterBar.getDataSuiteFormat();
		 * 	var oNavigationHandler = new NavigationHandler(oController);
		 * 	var sNavigationSelectionVariant = oNavigationHandler.mixAttributesAndSelectionVariant(mSemanticAttributes, sSelectionVariant).toJSONString();
		 * 	// Optionally, you can specify one or several suppression behaviors. Several suppression behaviors are combined with the bitwise OR operator, e.g.
		 * 	// var iSuppressionBehavior = sap.ui.generic.app.navigation.service.SuppressionBehavior.raiseErrorOnNull | sap.ui.generic.app.navigation.service.SuppressionBehavior.raiseErrorOnUndefined;
		 * 	// var sNavigationSelectionVariant = oNavigationHandler.mixAttributesAndSelectionVariant(mSemanticAttributes, sSelectionVariant, iSuppressionBehavior).toJSONString();
		 *
		 * 	oNavigationHandler.navigate("SalesOrder", "create", sNavigationSelectionVariant);
		 * });
		 * </code>
		 */
		mixAttributesAndSelectionVariant: function(mSemanticAttributes, sSelectionVariant, iSuppressionBehavior) {
			try {
				var oSelectionVariant =  FENavHandler.prototype.mixAttributesAndSelectionVariant.apply(this, [mSemanticAttributes, sSelectionVariant, iSuppressionBehavior]);
				return new sap.ui.generic.app.navigation.service.SelectionVariant(oSelectionVariant.toJSONObject());
			} catch (oError) {
				if (oError) {
					throw new NavError(oError.getErrorCode());
				}
			}
		},

		/**
		 * Sets the model that is used for verification of sensitive information. If the model is not set, the unnamed component model is used for the
		 * verification of sensitive information.
		 * @since 1.60.0
		 * @public
		 * @deprecated Since version 1.83.0
		 * @param {sap.ui.model.odata.v2.ODataModel} oModel for checking sensitive information
		 */
		setModel: function(oModel) {
			FENavHandler.prototype.setModel.apply(this, [oModel]);
		},

		/**
		 * The method creates a context url based on provided data. This context url can either be used as
		 * {@link sap.ui.generic.app.navigation.service.NavigationHandler#setParameterContextUrl ParameterContextUrl} or
		 * {@link sap.ui.generic.app.navigation.service.NavigationHandler#setFilterContextUrl FilterContextUrl}
		 * @since 1.60.2
		 * @param {string} sEntitySetName used for url determination
		 * @param {sap.ui.model.odata.v2.ODataModel} [oModel] used for url determination. If omitted, the NavigationHandler model is used.
		 * @throws An instance of {@link sap.ui.generic.app.navigation.service.NavError} in case of missing or wrong passed parameters
		 * @return {string} context url for the given entities
		 * @protected
		 * @deprecated Since version 1.83.0
		 */
		constructContextUrl: function(sEntitySetName, oModel) {
			try {
				return FENavHandler.prototype.constructContextUrl.apply(this, [sEntitySetName, oModel]);
			} catch (oError) {
				if (oError) {
					throw new NavError(oError.getErrorCode());
				}
			}
		}
	});

	return NavigationHandler;

});
