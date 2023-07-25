/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/assert", "sap/base/Log", "sap/base/util/extend", "sap/base/util/isEmptyObject", "sap/base/util/merge", "sap/ui/base/Object", "sap/ui/core/routing/HashChanger", "sap/ui/core/UIComponent", "sap/ui/thirdparty/URI", "sap/ui/util/openWindow", "./library", "./NavError", "./SelectionVariant"], function (assert, Log, extend, isEmptyObject, merge, BaseObject, HashChanger, UIComponent, URI, openWindow, NavLibrary, NavError, SelectionVariant) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  // shortcuts for sap.ui.generic.app enums
  const NavType = NavLibrary.NavType;
  const ParamHandlingMode = NavLibrary.ParamHandlingMode;
  const SuppressionBehavior = NavLibrary.SuppressionBehavior;
  const Mode = NavLibrary.Mode;
  const IAPP_STATE = "sap-iapp-state";
  const DEFAULTED_PARAMETER_PROPERTY = "sap-ushell-defaultedParameterNames";

  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.NavigationHandler}.<br> Creates a new NavigationHandler class by providing the required environment. <br>
   * The <code>NavigationHandler</code> supports the verification of sensitive information. All properties that are part of
   * <code>selectionVariant</code> and <code>valueTexts</code> will be verified if they are annotated as
   * <code>com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive</code> or
   * <code>com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext</code> and will be removed before the data is persisted as the app
   * state.<br>
   * Also, all properties annotated as <code>com.sap.vocabularies.Analytics.v1.Measure</code> will be removed from the data stored as the
   * xapp state.<br>
   * To verify the information to be removed, the <code>NavigationHandler</code> requires an unnamed model of type
   * {@link sap.ui.model.odata.v2.ODataModel} on component level. It is possible to set such a model using the <code>setModel</code>
   * method.<br>
   * <b>Note:</b> The check for excluded data requires that the OData metadata has already been loaded completely.<br>
   * If the OData metadata model has not been loaded completely, all properties are removed from the application context.<br>
   * <b>Note:</b> This class requires that the UShell {@link sap.ushell.services.CrossApplicationNavigation} is available and initialized.
   *
   * @public
   * @class
   * @extends sap.ui.base.Object
   * @since 1.83.0
   * @name sap.fe.navigation.NavigationHandler
   */
  let NavigationHandler = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(NavigationHandler, _BaseObject);
    // list of technical parameters

    /*
     * There exists a generation of "old" sap-iapp-states which are based on the following URL schema:
     * #SemObj-action&/route/sap-iapp-state=ABC12345678 The new URL schema is: #SemObj-action&/route?sap-iapp-state=ABC12345678 (mind the
     * difference between / and ? above), i.e. the sap-iapp-state has become a parameter of the query parameter section in the AppHash string.
     * Yet, this tool shall be able to deal even with old sap-iapp-states. Therefore, we use two Regular Expressions (rIAppStateOld and
     * rIAppStateOldAtStart) as defined below to scan for these old variants. The new variant is being scanned using rIAppStateNew as Regular
     * Expression search string. Compatibility is centrally ensured by the two methods _getInnerAppStateKey and _replaceInnerAppStateKey (see
     * below). Never use these RegExp in a method on your own, as it typically indicates that you will fall into the compatibility trap!
     */
    // Warning! Do not use GLOBAL flags here; RegExp in GLOBAL mode store the lastIndex value
    // Therefore, repeated calls to the RegExp will then only start beginning with that stored
    // lastIndex. Thus, multiple calls therefore could yield strange results.
    // Moreover, there shall only be exactly one IAPP_STATE per RegExp in an AppHash.
    // Therefore, GLOBAL search should be superfluous.

    /*
     * Regular Expression in words: Search for something that either starts with ? or &, followed by the term "sap-iapp-state". That one is
     * followed by an equal sign (=). The stuff that is after the equal sign forms the first regexp group. This group consists of at least one
     * (or arbitrary many) characters, as long as it is not an ampersand sign (&). Characters after such an ampersand would be ignored and do
     * not belong to the group. Alternatively, the string also may end.
     */

    /**
     * Temporarily added again because an application was (illegially) relying on it. Should be removed again, once the app is corrected
     */

    /**
     * Constructor requiring a controller/component owning the navigation handler.
     *
     * @param {object} oController UI5 controller that contains a router and a component; typically the main controller of your application, for
     *        example, a subclass of the sap.ca.scfld.md.controller.BaseFullscreenController if scaffolding is used
     * @param {string} [sMode=sap.fe.navigation.Mode.ODataV4] Mode to be used to indicates the Odata version used for runnning the Navigation Handler,
     *        see {@link sap.fe.navigation.Mode}.<br>
     * 		  Note: Mode has to be sap.fe.navigation.Mode.ODataV2 whenever this constructor is used to initialize a OData V2 based service.
     * @param {string} [sParamHandlingMode=SelVarWins] Mode to be used to handle conflicts when merging URL parameters and the SelectionVariant class,
     *        see {@link sap.fe.navigation.ParamHandlingMode}
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are: <table>
     *         <tr>
     *         <th align="left">NavError code</th>
     *         <th align="left">Description</th>
     *         </tr>
     *         <tr>
     *         <td>NavigationHandler.INVALID_INPUT</td>
     *         <td>Indicates that the input parameter is invalid</td>
     *         </tr>
     *         </table>
     */
    function NavigationHandler(oController, sMode, sParamHandlingMode) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _this._aTechnicalParamaters = ["hcpApplicationId"];
      _this._oLastSavedInnerAppData = {
        sAppStateKey: "",
        oAppData: {},
        iCacheHit: 0,
        iCacheMiss: 0
      };
      _this._rIAppStateOld = new RegExp("/" + IAPP_STATE + "=([^/?]+)");
      _this._rIAppStateOldAtStart = new RegExp("^" + IAPP_STATE + "=([^/?]+)");
      _this._rIAppStateNew = new RegExp("[?&]" + IAPP_STATE + "=([^&]+)");
      _this.IAPP_STATE = IAPP_STATE;
      if (!oController) {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      if (oController instanceof UIComponent) {
        _this.oRouter = oController.getRouter();
        _this.oComponent = oController;
      } else {
        if (typeof oController.getOwnerComponent !== "function") {
          throw new NavError("NavigationHandler.INVALID_INPUT");
        }
        _this.oRouter = _this._getRouter(oController);
        _this.oComponent = oController.getOwnerComponent();
      }

      // special handling for SmartTemplates
      if (_this.oComponent && _this.oComponent.getAppComponent) {
        _this.oComponent = _this.oComponent.getAppComponent();
      }
      if (typeof _this.oRouter === "undefined" || typeof _this.oComponent === "undefined" || typeof _this.oComponent.getComponentData !== "function") {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      if (sParamHandlingMode === ParamHandlingMode.URLParamWins || sParamHandlingMode === ParamHandlingMode.InsertInSelOpt) {
        _this.sParamHandlingMode = sParamHandlingMode;
      } else {
        _this.sParamHandlingMode = ParamHandlingMode.SelVarWins; // default
      }

      if (sMode === Mode.ODataV2) {
        _this._sMode = sMode;
      }
      return _this;
    }

    /**
     * Retrieves the shell navigation service.
     *
     * @returns The Navigation service
     * @private
     */
    _exports.NavigationHandler = NavigationHandler;
    var _proto = NavigationHandler.prototype;
    _proto._getAppNavigationService = function _getAppNavigationService() {
      return sap.ushell.Container.getService("CrossApplicationNavigation");
    }

    /**
     * Retrieves the shell navigation service.
     *
     * @returns The Navigation service
     * @private
     */;
    _proto._getAppNavigationServiceAsync = function _getAppNavigationServiceAsync() {
      return sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
        return oCrossAppNavService;
      }).catch(function () {
        Log.error("NavigationHandler: CrossApplicationNavigation is not available.");
        throw new NavError("NavigationHandler.NO.XAPPSERVICE");
      });
    }

    /**
     * Retrieves the reference to the router object for navigation for this given Controller.
     *
     * @param oController The reference to the Controller for which the Router instance shall be determined.
     * @returns The Router for the given Controller
     * @private
     */;
    _proto._getRouter = function _getRouter(oController) {
      return UIComponent.getRouterFor(oController);
    }

    /**
     * This method is to be used only by FE V2 to get access to toExternal promise.
     *
     * @param fnCallback Callback to be called by 'navigate' method in case of toExternal is used to navigate.
     * @private
     */;
    _proto.registerNavigateCallback = function registerNavigateCallback(fnCallback) {
      this._navigateCallback = fnCallback;
    }

    /**
     * Triggers a cross-app navigation after saving the inner and the cross-app states. The navigation mode based on
     * <code>sap-ushell-next-navmode</code> is taken into account. If set to <code>explace</code> the inner app state will not be changed.
     * <b>Note:</b> The <code>sNavMode</code> argument can be used to overwrite the SAP Fiori launchpad default navigation for opening a URL
     * in-place or ex-place.
     * <br>
     * <b>Node:</b> If the <code>oExternalAppData</code> parameter is not supplied, the external app data will be calculated based on
     * the <code>oInnerAppData</code> data.<br>
     * SmartFilterBar control <b>Parameters:</b> <table>
     * <tr>
     * <td align="center">{object}</td>
     * <td><b>oError</b></td>
     * <td>NavError object (instance of {@link sap.fe.navigation.NavError}) that describes which kind of error occurred</td>
     * <tr>
     * <td align="center">{string}</td>
     * <td><b>oError.errorCode</b></td>
     * <td>Code to identify the error</td>
     * <tr>
     * <td align="center">{string}</td>
     * <td><b>oError.type</b></td>
     * <td>Severity of the error (info/warning/error)</td>
     * <tr>
     * <td align="center">{array}</td>
     * <td><b>oError.params</b></td>
     * <td>An array of objects (typically strings) that describe additional value parameters required for generating the message</td>
     * </table>.
     *
     * @public
     * @function navigate
     * @memberof sap.fe.navigation.NavigationHandler.prototype
     * @param sSemanticObject Name of the semantic object of the target app
     * @param sActionName Name of the action of the target app
     * @param vNavigationParameters Navigation parameters as an object with key/value pairs or as a string representation of such an object. If passed as an object, the properties are not checked against the <code>IsPotentialSensitive</code> or <code>Measure</code> type.
     * @param oInnerAppData Object for storing current state of the app
     * @param fnOnError Callback that is called if an error occurs during navigation <br>
     * @param oExternalAppData Object for storing the state which will be forwarded to the target component.
     * @param oExternalAppData.presentationVariant Object containing the current ui state of the app which will be forwarded to the
     *        target component.
     * @param oExternalAppData.valueTexts Object containing value descriptions which will be forwarded to the target component.
     * @param oExternalAppData.selectionVariant Stringified JSON object, which will be forwarded to the target component. If not
     *        provided the selectionVariant will be constructed based on the vNavigationParameters.
     * @param sNavMode Argument is used to overwrite the FLP-configured target for opening a URL. If used, only the
     *        <code>explace</code> or <code>inplace</code> values are allowed. Any other value will lead to an exception
     *        <code>NavigationHandler.INVALID_NAV_MODE</code>.
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/fe/navigation/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
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
     *	 oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
     * 	oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
     * 	vNavigationParameters = oSelectionVariant.toJSONString();
     *
     * 	//or directly from SmartFilterBar
     * 	vNavigationParameters = oSmartFilterBar.getDataSuiteFormat();
     *
     * 	//app state for back navigation
     *	 var oInnerAppData = {
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
     */;
    _proto.navigate = function navigate(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError, oExternalAppData, sNavMode) {
      let sSelectionVariant,
        mParameters,
        oXAppDataObj,
        oStartupParameters,
        bExPlace = false,
        oTmpData = {};
      const oNavHandler = this;
      const oComponentData = this.oComponent.getComponentData();
      /*
       * There are some race conditions where the oComponentData may not be set, for example in case the UShell was not initialized properly. To
       * make sure that we do not dump here with an exception, we take this special error handling behavior:
       */
      if (oComponentData) {
        oStartupParameters = oComponentData.startupParameters;
        if (oStartupParameters && oStartupParameters["sap-ushell-next-navmode"] && oStartupParameters["sap-ushell-next-navmode"].length > 0) {
          // bExPlace = (JSON.parse(oStartupParameters["sap-ushell-next-navmode"][0]) === "explace");
          bExPlace = oStartupParameters["sap-ushell-next-navmode"][0] === "explace";
        }
      }

      // only nav-mode 'inplace' or 'explace' are supported. Any other value will lead to an exception.
      if (sNavMode && (sNavMode === "inplace" || sNavMode === "explace")) {
        bExPlace = sNavMode === "explace";
      } else if (sNavMode) {
        throw new NavError("NavigationHandler.INVALID_NAV_MODE");
      }
      if (oExternalAppData === undefined || oExternalAppData === null) {
        oXAppDataObj = {};
      } else {
        oXAppDataObj = oExternalAppData;
      }

      // for navigation we need URL parameters (legacy navigation) and sap-xapp-state, therefore we need to create the missing one from the
      // passed one
      if (typeof vNavigationParameters === "string") {
        sSelectionVariant = vNavigationParameters;
      } else if (typeof vNavigationParameters === "object") {
        const oEnrichedSelVar = this._splitInboundNavigationParameters(new SelectionVariant(), vNavigationParameters, []).oNavigationSelVar;
        sSelectionVariant = oEnrichedSelVar.toJSONString();
      } else {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      oTmpData.selectionVariant = new SelectionVariant(sSelectionVariant);
      if (typeof vNavigationParameters === "string") {
        oTmpData.selectionVariant = this._removeTechnicalParameters(oTmpData.selectionVariant);
      }
      oTmpData.selectionVariant = oTmpData.selectionVariant && oTmpData.selectionVariant.toJSONObject();
      oTmpData = this._removeMeasureBasedInformation(oTmpData); // remove eventual measures
      oTmpData = this._checkIsPotentiallySensitive(oTmpData); // remove eventual sensitive data

      if (oTmpData.selectionVariant) {
        mParameters = this._getURLParametersFromSelectionVariant(new SelectionVariant(oTmpData.selectionVariant));
        sSelectionVariant = new SelectionVariant(oTmpData.selectionVariant).toJSONString();
      } else {
        mParameters = {};
        sSelectionVariant = null;
      }
      const oNavArguments = {
        target: {
          semanticObject: sSemanticObject,
          action: sActionName
        },
        params: mParameters || {}
      };
      const fnNavigate = function (oCrossAppNavService) {
        if (!oXAppDataObj.selectionVariant) {
          oXAppDataObj.selectionVariant = sSelectionVariant;
        }
        const fnNavExplace = function () {
          const sNewHrefPromise = oCrossAppNavService.hrefForExternalAsync(oNavArguments, oNavHandler.oComponent);
          sNewHrefPromise.then(function (sNewHref) {
            openWindow(sNewHref);
          }).catch(function (oError) {
            Log.error("Error while retireving hrefForExternal : " + oError);
          });
        };
        oXAppDataObj = oNavHandler._removeMeasureBasedInformation(oXAppDataObj);
        return oNavHandler._fnSaveAppStateAsync(oXAppDataObj, fnOnError).then(function (oSaveAppStateReturn) {
          if (oSaveAppStateReturn) {
            oNavArguments.appStateKey = oSaveAppStateReturn.appStateKey;

            // Remark:
            // The Cross App Service takes care of encoding parameter keys and values. Example:
            // mParams = { "$@%" : "&/=" } results in the URL parameter %2524%2540%2525=%2526%252F%253D
            // Note the double encoding, this is correct.

            // toExternal sets sap-xapp-state in the URL if appStateKey is provided in oNavArguments
            // toExternal has issues on sticky apps FIORITECHP1-14400, temp fix using hrefForExternal
            if (sNavMode == "explace") {
              fnNavExplace();
            } else {
              const ptoExt = oCrossAppNavService.toExternal(oNavArguments, oNavHandler.oComponent);
              // TODO: This is just a temporary solution to allow FE V2 to use toExternal promise.
              if (oNavHandler._navigateCallback) {
                oNavHandler._navigateCallback(ptoExt);
              }
            }
          } // else : error was already reported
        });
      };

      const fnStoreAndNavigate = function (oCrossAppNavService) {
        oNavHandler.storeInnerAppStateAsync(oInnerAppData, true).then(function (sAppStateKey) {
          if (sAppStateKey) {
            oNavHandler.replaceHash(sAppStateKey);
          }
          return fnNavigate(oCrossAppNavService);
        }).catch(function (oError) {
          if (fnOnError) {
            fnOnError(oError);
          }
        });
      };
      if (sNavMode) {
        oNavArguments.params["sap-ushell-navmode"] = bExPlace ? "explace" : "inplace";
      }
      oNavHandler._getAppNavigationServiceAsync().then(function (oCrossAppNavService) {
        const oSupportedPromise = oCrossAppNavService.isNavigationSupported([oNavArguments], oNavHandler.oComponent);
        oSupportedPromise.done(function (oTargets) {
          if (oTargets[0].supported) {
            if (!bExPlace) {
              fnStoreAndNavigate(oCrossAppNavService);
            } else {
              fnNavigate(oCrossAppNavService);
            }
          } else if (fnOnError) {
            // intent is not supported
            const oError = new NavError("NavigationHandler.isIntentSupported.notSupported");
            fnOnError(oError);
          }
        });
        if (fnOnError) {
          oSupportedPromise.fail(function () {
            // technical error: could not determine if intent is supported
            const oError = oNavHandler._createTechnicalError("NavigationHandler.isIntentSupported.failed");
            fnOnError(oError);
          });
        }
      }).catch(function (oError) {
        if (fnOnError) {
          fnOnError(oError);
        }
      });
    }

    /**
     * Parses the incoming URL and returns a Promise. If this method detects a back navigation, the inner app state is returned in the resolved
     * Promise. Otherwise startup parameters will be merged into the app state provided by cross app navigation, and a combined app state will be
     * returned. The conflict resolution can be influenced with sParamHandlingMode defined in the constructor.
     *
     * @returns A Promise object to monitor when all the actions of the function have been executed. If the execution is successful, the
     *          extracted app state, the startup parameters, and the type of navigation are returned, see also the example above. The app state is
     *          an object that contains the following information:
     *          <ul>
     *          <li><code>oAppData.oSelectionVariant</code>: An instance of {@link sap.fe.navigation.SelectionVariant}
     *          containing only parameters/select options that are related to navigation</li>
     *          <li><code>oAppData.selectionVariant</code>: The navigation-related selection variant as a JSON-formatted string</li>
     *          <li><code>oAppData.oDefaultedSelectionVariant</code>: An instance of
     *          {@link sap.fe.navigation.SelectionVariant} containing only the parameters/select options that are set by user
     *          default data</li>
     *          <li><code>oAppData.bNavSelVarHasDefaultsOnly</code>: A Boolean flag that indicates whether only defaulted parameters and no
     *          navigation parameters are present.<br>
     *          <b>Note:</b> If no navigation parameters are available, <code>bNavSelVarHasDefaultsOnly</code> is set to <code>true</code>,
     *          even though parameters without default might be available as well.</li>
     *          </ul>
     *          If the navigation-related selection variant is empty, it is replaced by a copy of the defaulted selection variant.<br>
     *          The navigation type is an enumeration type of type {@link sap.fe.navigation.NavType} (possible values are
     *          initial, URLParams, xAppState, and iAppState).<br>
     *          <b>Note:</b> If the navigation type is {@link sap.fe.navigation.NavType.iAppState} oAppData has two
     *          additional properties
     *          <ul>
     *          <li><code>oAppData.tableVariantId</code></li>
     *          <li><code>oAppData.customData</code></li>
     *          </ul>
     *          which return the inner app data as stored in {@link #.navigate navigate} or {@link #.storeInnerAppStateAsync storeInnerAppStateAsync}.
     *          <code>oAppData.oDefaultedSelectionVariant</code> is an empty selection variant and
     *          <code>oAppData.bNavSelVarHasDefaultsOnly</code> is <code>false</code> in this case.<br>
     *          <b>Note:</b> If the navigation type is {@link sap.fe.navigation.NavType.initial} oAppData is an empty object!<br>
     *          If an error occurs, an error object of type {@link sap.fe.navigation.NavError}, URL parameters (if available)
     *          and the type of navigation are returned.
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler"], function (NavigationHandler) {
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var oParseNavigationPromise = oNavigationHandler.parseNavigation();
     *
     * 	oParseNavigationPromise.done(function(oAppData, oStartupParameters, sNavType){
     * 			oSmartFilterBar.setDataSuiteFormat(oAppData.selectionVariant);
     * 			// oAppData.oSelectionVariant can be used to manipulate the selection variant
     * 			// oAppData.oDefaultedSelectionVariant contains the parameters which are set by user defaults
     * 			// oAppData.bNavSelVarHasDefaultsOnly indicates whether only defaulted parameters and no navigation parameters are present
     * 	});
     * 	oParseNavigationPromise.fail(function(oError, oURLParameters, sNavType){
     * 		// if e.g. the xapp state could not be loaded, nevertheless there may be URL parameters available
     * 		//some error handling
     * 	});
     * });
     * </code>
     */;
    _proto.parseNavigation = function parseNavigation() {
      const sAppHash = HashChanger.getInstance().getHash();
      /*
       * use .getHash() here instead of .getAppHash() to also be able dealing with environments where only SAPUI5 is loaded and the UShell is
       * not initialized properly.
       */
      const sIAppState = this._getInnerAppStateKey(sAppHash);
      let oComponentData = this.oComponent.getComponentData();
      /*
       * There are some race conditions where the oComponentData may not be set, for example in case the UShell was not initialized properly. To
       * make sure that we do not dump here with an exception, we take this special error handling behavior:
       */
      if (oComponentData === undefined) {
        Log.warning("The navigation Component's data was not set properly; assuming instead that no parameters are provided.");
        oComponentData = {};
      }

      // Remark:
      // The startup parameters are already decoded. Example:
      // The original URL parameter %2524%2540%2525=%2526%252F%253D results in oStartupParameters = { "$@%" : "&/=" }
      // Note the double encoding in the URL, this is correct. An URL parameter like xyz=%25 causes an "URI malformed" error.
      // If the decoded value should be e.g. "%25", the parameter in the URL needs to be: xyz=%252525
      const oStartupParameters = oComponentData.startupParameters;
      let aDefaultedParameters = [];
      if (oStartupParameters && oStartupParameters[DEFAULTED_PARAMETER_PROPERTY] && oStartupParameters[DEFAULTED_PARAMETER_PROPERTY].length > 0) {
        aDefaultedParameters = JSON.parse(oStartupParameters[DEFAULTED_PARAMETER_PROPERTY][0]);
      }
      const oMyDeferred = jQuery.Deferred();
      const oNavHandler = this;
      const parseUrlParams = function (oSubStartupParameters, aSubDefaultedParameters, oSubMyDeferred, sNavType) {
        // standard URL navigation
        const oSelVars = oNavHandler._splitInboundNavigationParameters(new SelectionVariant(), oSubStartupParameters, aSubDefaultedParameters);
        if (oSelVars.oNavigationSelVar.isEmpty() && oSelVars.oDefaultedSelVar.isEmpty()) {
          // Startup parameters contain only technical parameters (SAP system) which were filtered out.
          // oNavigationSelVar and oDefaultedSelVar are empty.
          // Thus, consider this type of navigation as an initial navigation.
          if (sNavType === NavType.xAppState) {
            const oError = oNavHandler._createTechnicalError("NavigationHandler.getDataFromAppState.failed");
            oSubMyDeferred.reject(oError, oSubStartupParameters || {}, NavType.xAppState);
          } else {
            oSubMyDeferred.resolve({}, oSubStartupParameters, NavType.initial);
          }
        } else {
          const oAppStateData = {};
          oAppStateData.selectionVariant = oSelVars.oNavigationSelVar.toJSONString();
          oAppStateData.oSelectionVariant = oSelVars.oNavigationSelVar;
          oAppStateData.oDefaultedSelectionVariant = oSelVars.oDefaultedSelVar;
          oAppStateData.bNavSelVarHasDefaultsOnly = oSelVars.bNavSelVarHasDefaultsOnly;
          oSubMyDeferred.resolve(oAppStateData, oSubStartupParameters, sNavType);
        }
      };
      if (sIAppState) {
        // inner app state is available in the AppHash (back navigation); extract the parameter value
        this._loadAppState(sIAppState, oMyDeferred);
      } else {
        // no back navigation
        const bIsXappStateNavigation = oComponentData["sap-xapp-state"] !== undefined;
        if (bIsXappStateNavigation) {
          const that = this;
          // inner app state was not found in the AppHash, but xapp state => try to read the xapp state
          this._getAppNavigationServiceAsync().then(function (oCrossAppNavService) {
            const oStartupPromise = oCrossAppNavService.getStartupAppState(that.oComponent);
            oStartupPromise.done(function (oAppState) {
              // get app state from sap-xapp-state,
              // create a copy, not only a reference, because we want to modify the object
              let oAppStateData = oAppState.getData();
              let oError;
              if (oAppStateData) {
                try {
                  oAppStateData = JSON.parse(JSON.stringify(oAppStateData));
                } catch (x) {
                  oError = oNavHandler._createTechnicalError("NavigationHandler.AppStateData.parseError");
                  oMyDeferred.reject(oError, oStartupParameters, NavType.xAppState);
                  return oMyDeferred.promise();
                }
              }
              if (oAppStateData) {
                const oSelVar = new SelectionVariant(oAppStateData.selectionVariant);
                const oSelVars = oNavHandler._splitInboundNavigationParameters(oSelVar, oStartupParameters, aDefaultedParameters);
                oAppStateData.selectionVariant = oSelVars.oNavigationSelVar.toJSONString();
                oAppStateData.oSelectionVariant = oSelVars.oNavigationSelVar;
                oAppStateData.oDefaultedSelectionVariant = oSelVars.oDefaultedSelVar;
                oAppStateData.bNavSelVarHasDefaultsOnly = oSelVars.bNavSelVarHasDefaultsOnly;
                oMyDeferred.resolve(oAppStateData, oStartupParameters, NavType.xAppState);
              } else if (oStartupParameters) {
                parseUrlParams(oStartupParameters, aDefaultedParameters, oMyDeferred, NavType.xAppState);
              } else {
                // sap-xapp-state navigation, but ID has already expired, but URL parameters available
                oError = oNavHandler._createTechnicalError("NavigationHandler.getDataFromAppState.failed");
                oMyDeferred.reject(oError, oStartupParameters || {}, NavType.xAppState);
              }
            });
            oStartupPromise.fail(function () {
              const oError = oNavHandler._createTechnicalError("NavigationHandler.getStartupState.failed");
              oMyDeferred.reject(oError, {}, NavType.xAppState);
            });
          }).catch(function () {
            const oError = oNavHandler._createTechnicalError("NavigationHandler._getAppNavigationServiceAsync.failed");
            oMyDeferred.reject(oError, {}, NavType.xAppState);
          });
        } else if (oStartupParameters) {
          // no sap-xapp-state
          parseUrlParams(oStartupParameters, aDefaultedParameters, oMyDeferred, NavType.URLParams);
        } else {
          // initial navigation
          oMyDeferred.resolve({}, {}, NavType.initial);
        }
      }
      return oMyDeferred.promise();
    }

    /**
     * Sets the application specific technical parameters. Technical parameters will not be added to the selection variant passed to the
     * application. As a default the following values are considered as technical parameters:
     * <ul>
     * <li><code>sap-system</code></li>
     * <li><code>sap-ushell-defaultedParameterNames</code></li>
     * <li><code>"hcpApplicationId"</code></li>
     * </ul>.
     *
     * @public
     * @function setTechnicalParameters
     * @memberof sap.fe.navigation.NavigationHandler.prototype
     * @param {Array} aTechnicalParameters List of parameter names to be considered as technical parameters. <code>null</code> or
     *        <code>undefined</code> may be used to reset the complete list.
     */;
    _proto.setTechnicalParameters = function setTechnicalParameters(aTechnicalParameters) {
      if (!aTechnicalParameters) {
        aTechnicalParameters = [];
      }
      if (!Array.isArray(aTechnicalParameters)) {
        Log.error("NavigationHandler: parameter incorrect, array of strings expected");
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      this._aTechnicalParamaters = aTechnicalParameters;
    }

    /**
     * Gets the application specific technical parameters. Technical parameters will not be added to the selection variant passed to the
     * application. As a default the following values are considered as technical parameters:
     * <ul>
     * <li><code>sap-system</code></li>
     * <li><code>sap-ushell-defaultedParameterNames</code></li>
     * <li><code>"hcpApplicationId"</code></li>
     * </ul>.
     *
     * @public
     * @function getTechnicalParameters
     * @memberof sap.fe.navigation.NavigationHandler.prototype
     * @returns {Array} Containing the technical parameters.
     */;
    _proto.getTechnicalParameters = function getTechnicalParameters() {
      return this._aTechnicalParamaters.concat([]);
    }

    /**
     * Checks if the passed parameter is considered as technical parameter.
     *
     * @param sParameterName Name of a request parameter, considered as technical parameter.
     * @returns Indicates if the parameter is considered as technical parameter or not.
     * @private
     */;
    _proto._isTechnicalParameter = function _isTechnicalParameter(sParameterName) {
      if (sParameterName) {
        if (!(sParameterName === "sap-ui-fe-variant-id" || sParameterName === "sap-ui-fe-table-variant-id" || sParameterName === "sap-ui-fe-chart-variant-id" || sParameterName === "sap-ui-fe-filterbar-variant-id")) {
          if (sParameterName.toLowerCase().indexOf("sap-") === 0) {
            return true;
          } else if (this._aTechnicalParamaters.indexOf(sParameterName) >= 0) {
            return true;
          }
        }
      }
      return false;
    };
    _proto._isFEParameter = function _isFEParameter(sParameterName) {
      return sParameterName.toLowerCase().indexOf("sap-ui-fe") === 0;
    }

    /**
     * Rmoves if the passed parameter is considered as technical parameter.
     *
     * @param oSelectionVariant Selection Variant which consists of technical Parameters.
     * @returns Selection Variant without technical Parameters.
     * @private
     */;
    _proto._removeTechnicalParameters = function _removeTechnicalParameters(oSelectionVariant) {
      let sPropName, i;
      const aSelVarPropNames = oSelectionVariant.getSelectOptionsPropertyNames();
      for (i = 0; i < aSelVarPropNames.length; i++) {
        sPropName = aSelVarPropNames[i];
        if (this._isTechnicalParameter(sPropName)) {
          oSelectionVariant.removeSelectOption(sPropName);
        }
      }
      return oSelectionVariant;
    }

    /**
     * Splits the parameters provided during inbound navigation and separates the contextual information between defaulted parameter values and
     * navigation parameters.
     *
     * @param oSelectionVariant Instance of {@link sap.fe.navigation.SelectionVariant} containing navigation data of
     *        the app
     * @param oStartupParameters Object containing startup parameters of the app (derived from the component)
     * @param aDefaultedParameters Array containing defaulted parameter names
     * @returns Object containing two SelectionVariants, one for navigation (oNavigationSelVar) and one for defaulted startup parameters
     *          (oDefaultedSelVar), and a flag (bNavSelVarHasDefaultsOnly) indicating whether all parameters were defaulted. The function is
     *          handed two objects containing parameters (names and their corresponding values), oSelectionVariant and oStartupParameters. A
     *          parameter could be stored in just one of these two objects or in both of them simultaneously. Because of the latter case a
     *          parameter could be associated with conflicting values and it is the job of this function to resolve any such conflict. Parameters
     *          are assigned to the two returned SelectionVariants, oNavigationSelVar and oDefaultedSelVar, as follows: | parameter NOT in |
     *          parameter in | oSelectionVariant | oSelectionVariant ---------------------------------------|------------------ parameter NOT in |
     *          nothing to do | Add parameter oStartupParameters | here | (see below) ----------------------------------------------------------
     *          parameter in | Add parameter | Conflict resolution oStartupParameters | (see below) | (see below) Add parameter: if parameter in
     *          aDefaultedParameters: add parameter to oDefaultedSelVar else: add parameter to oNavigationSelVar Conflict resolution: if parameter
     *          in aDefaultedParameters: add parameter value from oSelectionVariant to oNavigationSelVar add parameter value from
     *          oStartupParameters to oDefaultedSelVar Note: This case only occurs in UI5 1.32. In later versions UShell stores any defaulted
     *          parameter either in oSelectionVariant or oStartupParameters but never simultaneously in both. else: Choose 1 of the following
     *          options based on given handling mode (this.sParamHandlingMode). -> add parameter value from oStartupParameters to
     *          oNavigationSelVar | -> add parameter value from oAppState.selectionVariant to oNavigationSelVar -> add both parameter values to
     *          navigationSelVar If navigationSelVar is still empty at the end of execution, navigationSelVar is replaced by a copy of
     *          oDefaultedSelVar and the flag bNavSelVarHasDefaultsOnly is set to true. The selection variant oDefaultedSelVar itself is always
     *          returned as is.
     * @private
     */;
    _proto._splitInboundNavigationParameters = function _splitInboundNavigationParameters(oSelectionVariant, oStartupParameters, aDefaultedParameters) {
      if (!Array.isArray(aDefaultedParameters)) {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      let sPropName, i;
      // First we do some parsing of the StartUp Parameters.
      const oStartupParametersAdjusted = {};
      for (sPropName in oStartupParameters) {
        if (!oStartupParameters.hasOwnProperty(sPropName)) {
          continue;
        }

        // if (sPropName === SAP_SYSTEM_PROPERTY || sPropName === DEFAULTED_PARAMETER_PROPERTY) {
        if (this._isTechnicalParameter(sPropName) || this._isFEParameter(sPropName)) {
          // Do not add the SAP system parameter to the selection variant as it is a technical parameter
          // not relevant for the selection variant.
          // Do not add the startup parameter for default values to the selection variant. The information, which parameters
          // are defaulted, is available in the defaulted selection variant.
          // In case, FE Parameters we shall skip it.(the application needs to fetch it from URL params)
          continue;
        }

        // We support parameters as a map with strings and as a map with value arrays
        if (typeof oStartupParameters[sPropName] === "string") {
          oStartupParametersAdjusted[sPropName] = oStartupParameters[sPropName];
        } else if (Array.isArray(oStartupParameters[sPropName]) && oStartupParameters[sPropName].length === 1) {
          oStartupParametersAdjusted[sPropName] = oStartupParameters[sPropName][0]; // single-valued parameters
        } else if (Array.isArray(oStartupParameters[sPropName]) && oStartupParameters[sPropName].length > 1) {
          oStartupParametersAdjusted[sPropName] = oStartupParameters[sPropName]; // multi-valued parameters
        } else {
          throw new NavError("NavigationHandler.INVALID_INPUT");
        }
      }

      // Construct two selection variants for defaults and navigation to be returned by the function.
      const oDefaultedSelVar = new SelectionVariant();
      const oNavigationSelVar = new SelectionVariant();
      const aSelVarPropNames = oSelectionVariant.getParameterNames().concat(oSelectionVariant.getSelectOptionsPropertyNames());
      for (i = 0; i < aSelVarPropNames.length; i++) {
        sPropName = aSelVarPropNames[i];
        if (sPropName in oStartupParametersAdjusted) {
          // Resolve conflict.
          if (aDefaultedParameters.indexOf(sPropName) > -1) {
            oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
            this._addParameterValues(oDefaultedSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
          } else {
            switch (this.sParamHandlingMode) {
              case ParamHandlingMode.SelVarWins:
                oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
                break;
              case ParamHandlingMode.URLParamWins:
                this._addParameterValues(oNavigationSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
                break;
              case ParamHandlingMode.InsertInSelOpt:
                oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
                this._addParameterValues(oNavigationSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
                break;
              default:
                throw new NavError("NavigationHandler.INVALID_INPUT");
            }
          }
        } else if (aDefaultedParameters.indexOf(sPropName) > -1) {
          // parameter only in SelVar
          oDefaultedSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
        } else {
          oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
        }
      }
      for (sPropName in oStartupParametersAdjusted) {
        // The case where the parameter appears twice has already been taken care of above so we skip it here.
        if (aSelVarPropNames.indexOf(sPropName) > -1) {
          continue;
        }
        if (aDefaultedParameters.indexOf(sPropName) > -1) {
          this._addParameterValues(oDefaultedSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
        } else {
          this._addParameterValues(oNavigationSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
        }
      }

      // the selection variant used for navigation should be filled with defaults in case that only defaults exist
      let bNavSelVarHasDefaultsOnly = false;
      if (oNavigationSelVar.isEmpty()) {
        bNavSelVarHasDefaultsOnly = true;
        const aPropNames = oDefaultedSelVar.getSelectOptionsPropertyNames();
        for (i = 0; i < aPropNames.length; i++) {
          oNavigationSelVar.massAddSelectOption(aPropNames[i], oDefaultedSelVar.getValue(aPropNames[i]));
        }
      }
      return {
        oNavigationSelVar: oNavigationSelVar,
        oDefaultedSelVar: oDefaultedSelVar,
        bNavSelVarHasDefaultsOnly: bNavSelVarHasDefaultsOnly
      };
    };
    _proto._addParameterValues = function _addParameterValues(oSelVariant, sPropName, sSign, sOption, oValues) {
      if (Array.isArray(oValues)) {
        for (let i = 0; i < oValues.length; i++) {
          oSelVariant.addSelectOption(sPropName, sSign, sOption, oValues[i]);
        }
      } else {
        oSelVariant.addSelectOption(sPropName, sSign, sOption, oValues);
      }
    }

    /**
     * Changes the URL according to the current sAppStateKey. As an reaction route change event will be triggered.
     *
     * @param sAppStateKey The new app state key.
     * @public
     */;
    _proto.replaceHash = function replaceHash(sAppStateKey) {
      const oHashChanger = this.oRouter.oHashChanger ? this.oRouter.oHashChanger : HashChanger.getInstance();
      const sAppHashOld = oHashChanger.getHash();
      /*
       * use .getHash() here instead of .getAppHash() to also be able dealing with environments where only SAPUI5 is loaded and the UShell is
       * not initialized properly.
       */
      const sAppHashNew = this._replaceInnerAppStateKey(sAppHashOld, sAppStateKey);
      oHashChanger.replaceHash(sAppHashNew);
    }

    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @param mInnerAppData Object containing the current state of the app
     * @param bImmediateHashReplace If set to false, the inner app hash will not be replaced until storing is successful; do not
     *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event
     * @param bSkipHashReplace If set to true, the inner app hash will not be replaced in the storeInnerAppStateAsync. Also the bImmediateHashReplace
     * 		  will be ignored.
     * @returns A Promise object to monitor when all the actions of the function have been executed; if the execution is successful, the
     *          app state key is returned; if an error occurs, an object of type {@link sap.fe.navigation.NavError} is
     *          returned
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler"], function (NavigationHandler) {
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var mInnerAppData = {
     * 		selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
     * 		tableVariantId : oSmartTable.getCurrentVariantId(),
     * 		customData : oMyCustomData
     * 	};
     *
     * 	var oStoreInnerAppStatePromise = oNavigationHandler.storeInnerAppStateAsync(mInnerAppData);
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
     */;
    _proto.storeInnerAppStateAsync = function storeInnerAppStateAsync(mInnerAppData, bImmediateHashReplace, bSkipHashReplace) {
      if (typeof bImmediateHashReplace !== "boolean") {
        bImmediateHashReplace = true; // default
      }

      const oNavHandler = this;
      const oMyDeferred = jQuery.Deferred();
      const fnReplaceHash = function (sAppStateKey) {
        const oHashChanger = oNavHandler.oRouter.oHashChanger ? oNavHandler.oRouter.oHashChanger : HashChanger.getInstance();
        const sAppHashOld = oHashChanger.getHash();
        /*
         * use .getHash() here instead of .getAppHash() to also be able dealing with environments where only SAPUI5 is loaded and the UShell
         * is not initialized properly.
         */
        const sAppHashNew = oNavHandler._replaceInnerAppStateKey(sAppHashOld, sAppStateKey);
        oHashChanger.replaceHash(sAppHashNew);
      };

      // in case mInnerAppState is empty, do not overwrite the last saved state
      if (isEmptyObject(mInnerAppData)) {
        oMyDeferred.resolve("");
        return oMyDeferred.promise();
      }

      // check if we already saved the same data
      const sAppStateKeyCached = this._oLastSavedInnerAppData.sAppStateKey;
      const bInnerAppDataEqual = JSON.stringify(mInnerAppData) === JSON.stringify(this._oLastSavedInnerAppData.oAppData);
      if (bInnerAppDataEqual && sAppStateKeyCached) {
        // passed inner app state found in cache
        this._oLastSavedInnerAppData.iCacheHit++;

        // replace inner app hash with cached appStateKey in url (just in case the app has changed the hash in meantime)
        fnReplaceHash(sAppStateKeyCached);
        oMyDeferred.resolve(sAppStateKeyCached);
        return oMyDeferred.promise();
      }

      // passed inner app state not found in cache
      this._oLastSavedInnerAppData.iCacheMiss++;
      const fnOnAfterSave = function (sAppStateKey) {
        // replace inner app hash with new appStateKey in url
        if (!bSkipHashReplace && !bImmediateHashReplace) {
          fnReplaceHash(sAppStateKey);
        }

        // remember last saved state
        oNavHandler._oLastSavedInnerAppData.oAppData = mInnerAppData;
        oNavHandler._oLastSavedInnerAppData.sAppStateKey = sAppStateKey;
        oMyDeferred.resolve(sAppStateKey);
      };
      const fnOnError = function (oError) {
        oMyDeferred.reject(oError);
      };
      this._saveAppStateAsync(mInnerAppData, fnOnAfterSave, fnOnError).then(function (sAppStateKey) {
        /* Note that _sapAppState may return 'undefined' in case that the parsing has failed. In this case, we should not trigger the replacement
         * of the App Hash with the generated key, as the container was not written before. Note as well that the error handling has already
         * happened before by making the oMyDeferred promise fail (see fnOnError above).
         */
        if (sAppStateKey !== undefined) {
          // replace inner app hash with new appStateKey in url
          // note: we do not wait for the save to be completed: this asynchronously behaviour is necessary if
          // this method is called e.g. in a onLinkPressed event with no possibility to wait for the promise resolution
          if (!bSkipHashReplace && bImmediateHashReplace) {
            fnReplaceHash(sAppStateKey);
          }
        }
      }).catch(function () {
        Log.error("NavigationHandler._saveAppStateAsync failed");
      });
      return oMyDeferred.promise();
    }

    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @param mInnerAppData Object containing the current state of the app
     * @param bImmediateHashReplace If set to false, the inner app hash will not be replaced until storing is successful; do not
     *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event
     * @returns A Promise object to monitor when all the actions of the function have been executed; if the execution is successful, the
     *          app state key is returned; if an error occurs, an object of type {@link sap.fe.navigation.NavError} is
     *          returned
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler"], function (NavigationHandler) {
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
     * 		//your inner app state is saved now, sAppStateKey was added to URL
     * 		//perform actions that must run after save
     * 	});
     *
     * 	oStoreInnerAppStatePromise.fail(function(oError){
     * 		//some error handling
     * 	});
     * });
     * </code>
     * @deprecated as of version 1.104. Use the {@link sap.fe.navigation.NavigationHandler.storeInnerAppStateAsync} instead.
     */;
    _proto.storeInnerAppState = function storeInnerAppState(mInnerAppData, bImmediateHashReplace) {
      Log.error("Deprecated API call of 'sap.fe.navigation.NavigationHandler.storeInnerAppState'. Please use 'storeInnerAppStateAsync' instead", undefined, "sap.fe.navigation.NavigationHandler");
      if (typeof bImmediateHashReplace !== "boolean") {
        bImmediateHashReplace = true; // default
      }

      const oNavHandler = this;
      const oMyDeferred = jQuery.Deferred();
      const fnReplaceHash = function (sAppStateKey) {
        const oHashChanger = oNavHandler.oRouter.oHashChanger ? oNavHandler.oRouter.oHashChanger : HashChanger.getInstance();
        const sAppHashOld = oHashChanger.getHash();
        /*
         * use .getHash() here instead of .getAppHash() to also be able dealing with environments where only SAPUI5 is loaded and the UShell
         * is not initialized properly.
         */
        const sAppHashNew = oNavHandler._replaceInnerAppStateKey(sAppHashOld, sAppStateKey);
        oHashChanger.replaceHash(sAppHashNew);
      };

      // in case mInnerAppState is empty, do not overwrite the last saved state
      if (isEmptyObject(mInnerAppData)) {
        oMyDeferred.resolve("");
        return oMyDeferred.promise();
      }

      // check if we already saved the same data
      const sAppStateKeyCached = this._oLastSavedInnerAppData.sAppStateKey;
      const bInnerAppDataEqual = JSON.stringify(mInnerAppData) === JSON.stringify(this._oLastSavedInnerAppData.oAppData);
      if (bInnerAppDataEqual && sAppStateKeyCached) {
        // passed inner app state found in cache
        this._oLastSavedInnerAppData.iCacheHit++;

        // replace inner app hash with cached appStateKey in url (just in case the app has changed the hash in meantime)
        fnReplaceHash(sAppStateKeyCached);
        oMyDeferred.resolve(sAppStateKeyCached);
        return oMyDeferred.promise();
      }

      // passed inner app state not found in cache
      this._oLastSavedInnerAppData.iCacheMiss++;
      const fnOnAfterSave = function (sAppStateKey) {
        // replace inner app hash with new appStateKey in url
        if (!bImmediateHashReplace) {
          fnReplaceHash(sAppStateKey);
        }

        // remember last saved state
        oNavHandler._oLastSavedInnerAppData.oAppData = mInnerAppData;
        oNavHandler._oLastSavedInnerAppData.sAppStateKey = sAppStateKey;
        oMyDeferred.resolve(sAppStateKey);
      };
      const fnOnError = function (oError) {
        oMyDeferred.reject(oError);
      };
      const sAppStateKey = this._saveAppState(mInnerAppData, fnOnAfterSave, fnOnError);
      /*
       * Note that _sapAppState may return 'undefined' in case that the parsing has failed. In this case, we should not trigger the replacement
       * of the App Hash with the generated key, as the container was not written before. Note as well that the error handling has already
       * happened before by making the oMyDeferred promise fail (see fnOnError above).
       */
      if (sAppStateKey !== undefined) {
        // replace inner app hash with new appStateKey in url
        // note: we do not wait for the save to be completed: this asynchronously behaviour is necessary if
        // this method is called e.g. in a onLinkPressed event with no possibility to wait for the promise resolution
        if (bImmediateHashReplace) {
          fnReplaceHash(sAppStateKey);
        }
      }
      return oMyDeferred.promise();
    }

    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @param mInnerAppData Object containing the current state of the app
     * @param bImmediateHashReplace If set to false, the inner app hash will not be replaced until storing is successful; do not
     *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event. <b>Note:</b>If
     *        not provided it will be treated as set to false. <b>Note:</b>If set to true, the calling instance has to ensure that a follow-on
     *        call to <code>replaceHash</code> will take place!
     * @returns An object containing the appStateId and a promise object to monitor when all the actions of the function have been
     *          executed; Please note that the appStateKey may be undefined or empty.
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler"], function (NavigationHandler) {
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
     * @deprecated as of version 1.104. Use the {@link sap.fe.navigation.NavigationHandler.storeInnerAppStateAsync} instead.
     */;
    _proto.storeInnerAppStateWithImmediateReturn = function storeInnerAppStateWithImmediateReturn(mInnerAppData, bImmediateHashReplace) {
      Log.error("Deprecated API call of 'sap.fe.navigation.NavigationHandler.storeInnerAppStateWithImmediateReturn'. Please use 'storeInnerAppStateAsync' instead", undefined, "sap.fe.navigation.NavigationHandler");
      if (typeof bImmediateHashReplace !== "boolean") {
        bImmediateHashReplace = false; // default
      }

      const oNavHandler = this;
      const oAppStatePromise = jQuery.Deferred();

      // in case mInnerAppState is empty, do not overwrite the last saved state
      if (isEmptyObject(mInnerAppData)) {
        return {
          appStateKey: "",
          promise: oAppStatePromise.resolve("")
        };
      }

      // check if we already saved the same data
      const sAppStateKeyCached = this._oLastSavedInnerAppData.sAppStateKey;
      const bInnerAppDataEqual = JSON.stringify(mInnerAppData) === JSON.stringify(this._oLastSavedInnerAppData.oAppData);
      if (bInnerAppDataEqual && sAppStateKeyCached) {
        // passed inner app state found in cache
        this._oLastSavedInnerAppData.iCacheHit++;
        return {
          appStateKey: sAppStateKeyCached,
          promise: oAppStatePromise.resolve(sAppStateKeyCached)
        };
      }

      // passed inner app state not found in cache
      this._oLastSavedInnerAppData.iCacheMiss++;
      const fnOnAfterSave = function (sAppStateKey) {
        // replace inner app hash with new appStateKey in url
        if (!bImmediateHashReplace) {
          oNavHandler.replaceHash(sAppStateKey);
        }

        // remember last saved state
        oNavHandler._oLastSavedInnerAppData.oAppData = mInnerAppData;
        oNavHandler._oLastSavedInnerAppData.sAppStateKey = sAppStateKey;
        oAppStatePromise.resolve(sAppStateKey);
      };
      const fnOnError = function (oError) {
        oAppStatePromise.reject(oError);
      };
      const sAppStateKey = this._saveAppState(mInnerAppData, fnOnAfterSave, fnOnError);
      /*
       * Note that _sapAppState may return 'undefined' in case that the parsing has failed. In this case, we should not trigger the replacement
       * of the App Hash with the generated key, as the container was not written before. Note as well that the error handling has already
       * happened before by making the oMyDeferred promise fail (see fnOnError above).
       */
      // if (sAppStateKey !== undefined) {
      // //replace inner app hash with new appStateKey in url
      // //note: we do not wait for the save to be completed: this asynchronously behaviour is necessary if
      // //this method is called e.g. in a onLinkPressed event with no possibility to wait for the promise resolution
      // if (bImmediateHashReplace) {
      // fnReplaceHash(sAppStateKey);
      // }
      // }
      return {
        appStateKey: sAppStateKey,
        promise: oAppStatePromise.promise()
      };
    }

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
     * </ul>.
     * <br>
     * <b>Node:</b> If the <code>oExternalAppData</code> parameter is not supplied, the external app data will be calculated based on
     * the <code>mInnerAppData</code> data.<br>.
     *
     * @param oTableEventParameters The parameters made available by the SmartTable control when the SmartLink control has been clicked,
     *        an instance of a PopOver object
     * @param sSelectionVariant Stringified JSON object as returned, for example, from getDataSuiteFormat() of the SmartFilterBar control
     * @param mInnerAppData Object containing the current state of the app. If provided, opening the Popover is deferred until the
     *        inner app data is saved in a consistent way.
     * @param oExternalAppData Object containing the state which will be passed to the target screen.
     * @param oExternalAppData.selectionVariant Object containing selectionVariant, which will be passed to the target screen. If not
     *        set the sSelectionVariant will be used.
     * @param oExternalAppData.presentationVariant Object containing the current ui presentationVariant of the app, which will be
     *        passed to the target screen
     * @param oExternalAppData.valueTexts Object containing value descriptions, which will be passed to the target screen
     * @returns A Promise object to monitor when all actions of the function have been executed; if the execution is successful, the
     *          modified oTableEventParameters is returned; if an error occurs, an error object of type
     *          {@link sap.fe.navigation.NavError} is returned
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/fe/navigation/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
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
     * 		};
     * 	});
     * </code>
     */;
    _proto.processBeforeSmartLinkPopoverOpens = function processBeforeSmartLinkPopoverOpens(oTableEventParameters, sSelectionVariant, mInnerAppData, oExternalAppData) {
      const oMyDeferred = jQuery.Deferred();
      let mSemanticAttributes;
      if (oTableEventParameters != undefined) {
        mSemanticAttributes = oTableEventParameters.semanticAttributes;
      }
      let oXAppDataObj;
      const oNavHandler = this;
      if (oExternalAppData === undefined) {
        oXAppDataObj = {};
      } else {
        oXAppDataObj = oExternalAppData;
      }
      const fnStoreXappAndCallOpen = function (mSubSemanticAttributes, sSubSelectionVariant) {
        // mix the semantic attributes (e.g. from the row line) with the selection variant (e.g. from the filter bar)
        sSubSelectionVariant = oXAppDataObj.selectionVariant || sSubSelectionVariant || "{}";
        const iSuppressionBehavior = SuppressionBehavior.raiseErrorOnNull | SuppressionBehavior.raiseErrorOnUndefined;
        /*
         * compatiblity: Until SAPUI5 1.28.5 (or even later) the Smart Link in a Smart Table is filtering all null- and undefined values.
         * Therefore, mSemanticAttributes are already reduced appropriately -- this does not need to be done by
         * mixAttributesAndSelectionVariant again. To ensure that we still have the old behaviour (i.e. an NavError is raised in case that
         * behaviour of the Smart Link control has changed), the "old" Suppression Behaviour is retained.
         */

        const oMixedSelVar = oNavHandler.mixAttributesAndSelectionVariant(mSubSemanticAttributes, sSubSelectionVariant, iSuppressionBehavior);
        sSubSelectionVariant = oMixedSelVar.toJSONString();

        // enrich the semantic attributes with single selections from the selection variant
        let oTmpData = {};
        oTmpData.selectionVariant = oMixedSelVar.toJSONObject();
        oTmpData = oNavHandler._removeMeasureBasedInformation(oTmpData);
        oTmpData = oNavHandler._checkIsPotentiallySensitive(oTmpData);
        mSubSemanticAttributes = oTmpData.selectionVariant ? oNavHandler._getURLParametersFromSelectionVariant(new SelectionVariant(oTmpData.selectionVariant)) : {};
        const fnOnContainerSave = function (sAppStateKey) {
          if (oTableEventParameters === undefined) {
            // If oTableEventParameters is undefined, return both semanticAttributes and appStatekey
            oMyDeferred.resolve(mSubSemanticAttributes, sAppStateKey);
          } else {
            // set the stored data in popover and call open()
            oTableEventParameters.setSemanticAttributes(mSubSemanticAttributes);
            oTableEventParameters.setAppStateKey(sAppStateKey);
            oTableEventParameters.open(); // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Note that "open" does not open the popover, but proceeds
            // with firing the onNavTargetsObtained event.
            oMyDeferred.resolve(oTableEventParameters);
          }
        };
        const fnOnError = function (oError) {
          oMyDeferred.reject(oError);
        };
        oXAppDataObj.selectionVariant = sSubSelectionVariant;
        oXAppDataObj = oNavHandler._removeMeasureBasedInformation(oXAppDataObj);
        oNavHandler._saveAppStateAsync(oXAppDataObj, fnOnContainerSave, fnOnError);
      };
      if (mInnerAppData) {
        const oStoreInnerAppStatePromise = this.storeInnerAppStateAsync(mInnerAppData, true);

        // if the inner app state was successfully stored, store also the xapp-state
        oStoreInnerAppStatePromise.done(function () {
          fnStoreXappAndCallOpen(mSemanticAttributes, sSelectionVariant);
        });
        oStoreInnerAppStatePromise.fail(function (oError) {
          oMyDeferred.reject(oError);
        });
      } else {
        // there is no inner app state to save, just put the parameters into xapp-state
        fnStoreXappAndCallOpen(mSemanticAttributes, sSelectionVariant);
      }
      return oMyDeferred.promise();
    }

    /**
     * Processes selectionVariant string and returns a Promise object (semanticAttributes and AppStateKey).
     *
     * @param sSelectionVariant Stringified JSON object
     * @returns A Promise object to monitor when all actions of the function have been executed; if the execution is successful, the
     *          semanticAttributes as well as the appStateKey are returned; if an error occurs, an error object of type
     *          {@link sap.fe.navigation.NavError} is returned
     * <br>
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/fe/navigation/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
     * 		var oSelectionVariant = new SelectionVariant();
     * 		oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
     * 		oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
     * 		var sSelectionVariant= oSelectionVariant.toJSONString();
     *
     * 		var oNavigationHandler = new NavigationHandler(oController);
     * 		var oPromiseObject = oNavigationHandler._getAppStateKeyAndUrlParameters(sSelectionVariant);
     *
     * 		oPromiseObject.done(function(oSemanticAttributes, sAppStateKey){
     * 			// here you can add coding that should run after all app state and the semantic attributes have been returned.
     * 		});
     *
     * 		oPromiseObject.fail(function(oError){
     * 			//some error handling
     * 		});
     *	});
     * </code>
     * @private
     * @ui5-restricted
     */;
    _proto._getAppStateKeyAndUrlParameters = function _getAppStateKeyAndUrlParameters(sSelectionVariant) {
      return this.processBeforeSmartLinkPopoverOpens(undefined, sSelectionVariant, undefined, undefined);
    };
    _proto._mixAttributesToSelVariant = function _mixAttributesToSelVariant(mSemanticAttributes, oSelVariant, iSuppressionBehavior) {
      // add all semantic attributes to the mixed selection variant
      for (const sPropertyName in mSemanticAttributes) {
        if (mSemanticAttributes.hasOwnProperty(sPropertyName)) {
          // A value of a semantic attribute may not be a string, but can be e.g. a date.
          // Since the selection variant accepts only a string, we have to convert it in dependence of the type.
          let vSemanticAttributeValue = mSemanticAttributes[sPropertyName];
          if (vSemanticAttributeValue instanceof Date) {
            // use the same conversion method for dates as the SmartFilterBar: toJSON()
            vSemanticAttributeValue = vSemanticAttributeValue.toJSON();
          } else if (Array.isArray(vSemanticAttributeValue) || vSemanticAttributeValue && typeof vSemanticAttributeValue === "object") {
            vSemanticAttributeValue = JSON.stringify(vSemanticAttributeValue);
          } else if (typeof vSemanticAttributeValue === "number" || typeof vSemanticAttributeValue === "boolean") {
            vSemanticAttributeValue = vSemanticAttributeValue.toString();
          }
          if (vSemanticAttributeValue === "") {
            if (iSuppressionBehavior & SuppressionBehavior.ignoreEmptyString) {
              Log.info("Semantic attribute " + sPropertyName + " is an empty string and due to the chosen Suppression Behiavour is being ignored.");
              continue;
            }
          }
          if (vSemanticAttributeValue === null) {
            if (iSuppressionBehavior & SuppressionBehavior.raiseErrorOnNull) {
              throw new NavError("NavigationHandler.INVALID_INPUT");
            } else {
              Log.warning("Semantic attribute " + sPropertyName + " is null and ignored for mix in to selection variant");
              continue; // ignore!
            }
          }

          if (vSemanticAttributeValue === undefined) {
            if (iSuppressionBehavior & SuppressionBehavior.raiseErrorOnUndefined) {
              throw new NavError("NavigationHandler.INVALID_INPUT");
            } else {
              Log.warning("Semantic attribute " + sPropertyName + " is undefined and ignored for mix in to selection variant");
              continue;
            }
          }
          if (typeof vSemanticAttributeValue === "string" || vSemanticAttributeValue instanceof String) {
            oSelVariant.addSelectOption(sPropertyName, "I", "EQ", vSemanticAttributeValue);
          } else {
            throw new NavError("NavigationHandler.INVALID_INPUT");
          }
        }
      }
      return oSelVariant;
    }

    /**
     * Combines the given parameters and selection variant into a new selection variant containing properties from both, with the parameters
     * overriding existing properties in the selection variant. The new selection variant does not contain any parameters. All parameters are
     * merged into select options. The output of this function, converted to a JSON string, can be used for the
     * {@link #.navigate NavigationHandler.navigate} method.
     *
     * @param vSemanticAttributes Object/(Array of Objects) containing key/value pairs
     * @param sSelectionVariant The selection variant in string format as provided by the SmartFilterBar control
     * @param [iSuppressionBehavior=sap.fe.navigation.SuppressionBehavior.standard] Indicates whether semantic
     *        attributes with special values (see {@link sap.fe.navigation.SuppressionBehavior suppression behavior}) must be
     *        suppressed before they are combined with the selection variant; several
     *        {@link sap.fe.navigation.SuppressionBehavior suppression behaviors} can be combined with the bitwise OR operator
     *        (|)
     * @returns Instance of {@link sap.fe.navigation.SelectionVariant}
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/fe/navigation/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
     * 	var vSemanticAttributes = { "Customer" : "C0001" };
     * 	or
     * 	var vSemanticAttributes = [{ "Customer" : "C0001" },{ "Customer" : "C0002" }];
     * 	var sSelectionVariant = oSmartFilterBar.getDataSuiteFormat();
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var sNavigationSelectionVariant = oNavigationHandler.mixAttributesAndSelectionVariant(vSemanticAttributes, sSelectionVariant).toJSONString();
     * 	// In case of an vSemanticAttributes being an array, the semanticAttributes are merged to a single SV and compared against the sSelectionVariant(second agrument).
     * 	// Optionally, you can specify one or several suppression behaviors. Several suppression behaviors are combined with the bitwise OR operator, e.g.
     * 	// var iSuppressionBehavior = sap.fe.navigation.SuppressionBehavior.raiseErrorOnNull | sap.fe.navigation.SuppressionBehavior.raiseErrorOnUndefined;
     * 	// var sNavigationSelectionVariant = oNavigationHandler.mixAttributesAndSelectionVariant(mSemanticAttributes, sSelectionVariant, iSuppressionBehavior).toJSONString();
     *
     * 	oNavigationHandler.navigate("SalesOrder", "create", sNavigationSelectionVariant);
     * });
     * </code>
     */;
    _proto.mixAttributesAndSelectionVariant = function mixAttributesAndSelectionVariant(vSemanticAttributes, sSelectionVariant, iSuppressionBehavior) {
      const oSelectionVariant = new SelectionVariant(sSelectionVariant);
      const oNewSelVariant = new SelectionVariant();
      const oNavHandler = this;
      const filterUrl = oSelectionVariant.getFilterContextUrl();
      if (filterUrl) {
        oNewSelVariant.setFilterContextUrl(filterUrl);
      }
      const contextUrl = oSelectionVariant.getParameterContextUrl();
      if (contextUrl) {
        oNewSelVariant.setParameterContextUrl(contextUrl);
      }
      if (Array.isArray(vSemanticAttributes)) {
        vSemanticAttributes.forEach(function (mSemanticAttributes) {
          oNavHandler._mixAttributesToSelVariant(mSemanticAttributes, oNewSelVariant, iSuppressionBehavior);
        });
      } else {
        this._mixAttributesToSelVariant(vSemanticAttributes, oNewSelVariant, iSuppressionBehavior);
      }

      // add parameters that are not part of the oNewSelVariant yet
      const aParameters = oSelectionVariant.getParameterNames();
      let i;
      for (i = 0; i < aParameters.length; i++) {
        if (!oNewSelVariant.getSelectOption(aParameters[i])) {
          oNewSelVariant.addSelectOption(aParameters[i], "I", "EQ", oSelectionVariant.getParameter(aParameters[i]));
        }
      }

      // add selOptions that are not part of the oNewSelVariant yet
      const aSelOptionNames = oSelectionVariant.getSelectOptionsPropertyNames();
      for (i = 0; i < aSelOptionNames.length; i++) {
        // add selOptions that are not part of the oNewSelVariant yet
        const aSelectOption = oSelectionVariant.getSelectOption(aSelOptionNames[i]);
        if (!oNewSelVariant.getSelectOption(aSelOptionNames[i])) {
          for (let j = 0; j < aSelectOption.length; j++) {
            oNewSelVariant.addSelectOption(aSelOptionNames[i], aSelectOption[j].Sign, aSelectOption[j].Option, aSelectOption[j].Low, aSelectOption[j].High);
          }
        }
      }
      return oNewSelVariant;
    };
    _proto._ensureSelectionVariantFormatString = function _ensureSelectionVariantFormatString(vSelectionVariant) {
      /*
       * There are legacy AppStates where the SelectionVariant is being stored as a string. However, that is not compliant to the specification,
       * which states that a standard JS object shall be provided. Internally, however, the selectionVariant is always of type string. Situation
       * Persistency internal API ---------------- ------------------ --------------------- legacy string string new approach (JSON) object
       * string
       */

      if (vSelectionVariant === undefined) {
        return undefined;
      }
      let vConvertedSelectionVariant = vSelectionVariant;
      if (typeof vSelectionVariant === "object") {
        vConvertedSelectionVariant = JSON.stringify(vSelectionVariant);
      }
      return vConvertedSelectionVariant;
    };
    _proto._fnHandleAppStatePromise = function _fnHandleAppStatePromise(oReturn, fnOnAfterSave, fnOnError) {
      oReturn.promise.done(function () {
        if (fnOnAfterSave) {
          fnOnAfterSave(oReturn.appStateKey);
        }
      });
      if (fnOnError) {
        const oNavHandler = this;
        oReturn.promise.fail(function () {
          const oError = oNavHandler._createTechnicalError("NavigationHandler.AppStateSave.failed");
          fnOnError(oError);
        });
      }
    };
    _proto._saveAppStateAsync = function _saveAppStateAsync(oAppData, fnOnAfterSave, fnOnError) {
      const oNavHandler = this;
      return this._fnSaveAppStateAsync(oAppData, fnOnError).then(function (oReturn) {
        if (oReturn) {
          oNavHandler._fnHandleAppStatePromise(oReturn, fnOnAfterSave, fnOnError);
          return oReturn.appStateKey;
        }
        return undefined;
      });
    };
    _proto._saveAppState = function _saveAppState(oAppData, fnOnAfterSave, fnOnError) {
      const oReturn = this._saveAppStateWithImmediateReturn(oAppData, fnOnError);
      if (oReturn) {
        this._fnHandleAppStatePromise(oReturn, fnOnAfterSave, fnOnError);
        return oReturn.appStateKey;
      }
      return undefined;
    };
    _proto._fnSaveAppStateWithImmediateReturn = function _fnSaveAppStateWithImmediateReturn(oAppData, oAppState, fnOnError) {
      const sAppStateKey = oAppState.getKey();
      const oAppDataForSave = this._fetchAppDataForSave(oAppData, fnOnError);
      if (!oAppDataForSave) {
        return undefined;
      }
      oAppState.setData(oAppDataForSave);
      const oSavePromise = oAppState.save();
      return {
        appStateKey: sAppStateKey,
        promise: oSavePromise.promise()
      };
    };
    _proto._fetchAppDataForSave = function _fetchAppDataForSave(oAppData, fnOnError) {
      let oAppDataForSave = {};
      if (oAppData.hasOwnProperty("selectionVariant")) {
        oAppDataForSave.selectionVariant = oAppData.selectionVariant;
        if (oAppData.selectionVariant) {
          /*
           * The specification states that Selection Variants need to be JSON objects. However, internally, we work with strings for
           * "selectionVariant". Therefore, in case that this is a string, we need to JSON-parse the data.
           */
          if (typeof oAppData.selectionVariant === "string") {
            try {
              oAppDataForSave.selectionVariant = JSON.parse(oAppData.selectionVariant);
            } catch (x) {
              const oError = this._createTechnicalError("NavigationHandler.AppStateSave.parseError");
              if (fnOnError) {
                fnOnError(oError);
              }
              return undefined;
            }
          }
        }
      }
      if (this._sMode === Mode.ODataV2) {
        oAppDataForSave = extend({
          selectionVariant: {},
          tableVariantId: "",
          customData: {}
        }, oAppDataForSave);
        if (oAppData.tableVariantId) {
          oAppDataForSave.tableVariantId = oAppData.tableVariantId;
        }
        if (oAppData.customData) {
          oAppDataForSave.customData = oAppData.customData;
        }
        if (oAppData.presentationVariant) {
          oAppDataForSave.presentationVariant = oAppData.presentationVariant;
        }
        if (oAppData.valueTexts) {
          oAppDataForSave.valueTexts = oAppData.valueTexts;
        }
        if (oAppData.semanticDates) {
          oAppDataForSave.semanticDates = oAppData.semanticDates;
        }
      } else {
        const oAppDataClone = Object.assign({}, oAppData);
        oAppDataForSave = merge(oAppDataClone, oAppDataForSave);
      }
      oAppDataForSave = this._checkIsPotentiallySensitive(oAppDataForSave);
      return oAppDataForSave;
    };
    _proto._fnSaveAppStateAsync = function _fnSaveAppStateAsync(oAppData, fnOnError) {
      const oNavHandler = this;
      return this._getAppNavigationServiceAsync().then(function (oCrossAppNavService) {
        return oCrossAppNavService.createEmptyAppStateAsync(oNavHandler.oComponent);
      }).then(function (oAppState) {
        return oNavHandler._fnSaveAppStateWithImmediateReturn(oAppData, oAppState, fnOnError);
      }).catch(function (oError) {
        if (fnOnError) {
          fnOnError(oError);
        }
      });
    };
    _proto._saveAppStateWithImmediateReturn = function _saveAppStateWithImmediateReturn(oAppData, fnOnError) {
      const oAppState = this._getAppNavigationService().createEmptyAppState(this.oComponent);
      return this._fnSaveAppStateWithImmediateReturn(oAppData, oAppState, fnOnError);
    };
    _proto._loadAppState = function _loadAppState(sAppStateKey, oDeferred) {
      const oNavHandler = this;
      this._getAppNavigationServiceAsync().then(function (oCrossAppNavService) {
        const oAppStatePromise = oCrossAppNavService.getAppState(oNavHandler.oComponent, sAppStateKey);
        oAppStatePromise.done(function (oAppState) {
          let oAppData = {};
          const oAppDataLoaded = oAppState.getData();
          if (typeof oAppDataLoaded === "undefined") {
            const oError = oNavHandler._createTechnicalError("NavigationHandler.getDataFromAppState.failed");
            oDeferred.reject(oError, {}, NavType.iAppState);
          } else if (oNavHandler._sMode === Mode.ODataV2) {
            oAppData = {
              selectionVariant: "{}",
              oSelectionVariant: new SelectionVariant(),
              oDefaultedSelectionVariant: new SelectionVariant(),
              bNavSelVarHasDefaultsOnly: false,
              tableVariantId: "",
              customData: {},
              appStateKey: sAppStateKey,
              presentationVariant: {},
              valueTexts: {},
              semanticDates: {}
            };
            if (oAppDataLoaded.selectionVariant) {
              /*
               * In case that we get an object from the stored AppData (=persistency), we need to stringify the JSON object.
               */
              oAppData.selectionVariant = oNavHandler._ensureSelectionVariantFormatString(oAppDataLoaded.selectionVariant);
              oAppData.oSelectionVariant = new SelectionVariant(oAppData.selectionVariant);
            }
            if (oAppDataLoaded.tableVariantId) {
              oAppData.tableVariantId = oAppDataLoaded.tableVariantId;
            }
            if (oAppDataLoaded.customData) {
              oAppData.customData = oAppDataLoaded.customData;
            }
            if (oAppDataLoaded.presentationVariant) {
              oAppData.presentationVariant = oAppDataLoaded.presentationVariant;
            }
            if (oAppDataLoaded.valueTexts) {
              oAppData.valueTexts = oAppDataLoaded.valueTexts;
            }
            if (oAppDataLoaded.semanticDates) {
              oAppData.semanticDates = oAppDataLoaded.semanticDates;
            }
          } else {
            oAppData = merge(oAppData, oAppDataLoaded);
            if (oAppDataLoaded.selectionVariant) {
              /*
               * In case that we get an object from the stored AppData (=persistency), we need to stringify the JSON object.
               */
              oAppData.selectionVariant = oNavHandler._ensureSelectionVariantFormatString(oAppDataLoaded.selectionVariant);
              oAppData.oSelectionVariant = new SelectionVariant(oAppData.selectionVariant);
            }
          }

          // resolve is called on passed Deferred object to trigger a call of the done method, if implemented
          // the done method will receive the loaded appState and the navigation type as parameters
          oDeferred.resolve(oAppData, {}, NavType.iAppState);
        });
        oAppStatePromise.fail(function () {
          const oError = oNavHandler._createTechnicalError("NavigationHandler.getAppState.failed");
          oDeferred.reject(oError, {}, NavType.iAppState);
        });
      }).catch(function () {
        const oError = oNavHandler._createTechnicalError("NavigationHandler._getAppNavigationServiceAsync.failed");
        oDeferred.reject(oError, {}, NavType.iAppState);
      });
    }

    /**
     * Retrieves the parameter value of the sap-iapp-state (the internal apps) from the AppHash string. It automatically takes care about
     * compatibility between the old and the new approach of the sap-iapp-state. Precedence is that the new approach is favoured against the old
     * approach.
     *
     * @param sAppHash The AppHash, which may contain a sap-iapp-state parameter (both old and/or new approach)
     * @returns The value of sap-iapp-state (i.e. the name of the container to retrieve the parameters), or <code>undefined</code> in
     *         case that no sap-iapp-state was found in <code>sAppHash</code>.
     * @private
     */;
    _proto._getInnerAppStateKey = function _getInnerAppStateKey(sAppHash) {
      // trivial case: no app hash available at all.
      if (!sAppHash) {
        return undefined;
      }

      /* new approach: separated via question mark / part of the query parameter of the AppHash */
      let aMatches = this._rIAppStateNew.exec(sAppHash);

      /* old approach: spearated via slashes / i.e. part of the route itself */
      if (aMatches === null) {
        aMatches = this._rIAppStateOld.exec(sAppHash);
      }

      /*
       * old approach: special case: if there is no deep route/key defined, the sap-iapp-state may be at the beginning of the string, without
       * any separation with the slashes
       */
      if (aMatches === null) {
        aMatches = this._rIAppStateOldAtStart.exec(sAppHash);
      }
      if (aMatches === null) {
        // there is no (valid) sap-iapp-state in the App Hash
        return undefined;
      }
      return aMatches[1];
    }

    /**
     * Replaces (or inserts) a parameter value (an AppStateKey) for the sap-iapp-state into an existing AppHash string. Other routes/parameters
     * are ignored and returned without modification ("environmental agnostic" property). Only the new approach (sap-iapp-state as query parameter
     * in the AppHash) is being issued.
     *
     * @param sAppHash The AppHash into which the sap-iapp-state parameter shall be made available
     * @param sAppStateKey The key value of the AppState which shall be stored as parameter value of the sap-iapp-state property.
     * @returns The modified sAppHash string, such that the sap-iapp-state has been set based on the new (query option-based)
     *         sap-iapp-state. If a sap-iapp-state has been specified before, the key is replaced. If <code>sAppHash</code> was of the old
     *         format (sap-iapp-state as part of the keys/route), the format is converted to the new format before the result is returned.
     * @private
     */;
    _proto._replaceInnerAppStateKey = function _replaceInnerAppStateKey(sAppHash, sAppStateKey) {
      const sNewIAppState = IAPP_STATE + "=" + sAppStateKey;

      /*
       * generate sap-iapp-states with the new way
       */
      if (!sAppHash) {
        // there's no sAppHash key yet
        return "?" + sNewIAppState;
      }
      const fnAppendToQueryParameter = function (sSubAppHash) {
        // there is an AppHash available, but it does not contain a sap-iapp-state parameter yet - we need to append one

        // new approach: we need to check, if a set of query parameters is already available
        if (sSubAppHash.indexOf("?") !== -1) {
          // there are already query parameters available - append it as another parameter
          return sSubAppHash + "&" + sNewIAppState;
        }
        // there are no a query parameters available yet; create a set with a single parameter
        return sSubAppHash + "?" + sNewIAppState;
      };
      if (!this._getInnerAppStateKey(sAppHash)) {
        return fnAppendToQueryParameter(sAppHash);
      }
      // There is an AppHash available and there is already an sap-iapp-state in the AppHash

      if (this._rIAppStateNew.test(sAppHash)) {
        // the new approach is being used
        return sAppHash.replace(this._rIAppStateNew, function (sNeedle) {
          return sNeedle.replace(/[=].*/gi, "=" + sAppStateKey);
        });
      }

      // we need to remove the old AppHash entirely and replace it with a new one.

      const fnReplaceOldApproach = function (rOldApproach, sSubAppHash) {
        sSubAppHash = sSubAppHash.replace(rOldApproach, "");
        return fnAppendToQueryParameter(sSubAppHash);
      };
      if (this._rIAppStateOld.test(sAppHash)) {
        return fnReplaceOldApproach(this._rIAppStateOld, sAppHash);
      }
      if (this._rIAppStateOldAtStart.test(sAppHash)) {
        return fnReplaceOldApproach(this._rIAppStateOldAtStart, sAppHash);
      }
      assert(false, "internal inconsistency: Approach of sap-iapp-state not known, but _getInnerAppStateKey returned it");
      return undefined;
    };
    _proto._getURLParametersFromSelectionVariant = function _getURLParametersFromSelectionVariant(vSelectionVariant) {
      const mURLParameters = {};
      let i = 0;
      let oSelectionVariant;
      if (typeof vSelectionVariant === "string") {
        oSelectionVariant = new SelectionVariant(vSelectionVariant);
      } else if (typeof vSelectionVariant === "object") {
        oSelectionVariant = vSelectionVariant;
      } else {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }

      // add URLs parameters from SelectionVariant.SelectOptions (if single value)
      const aSelectProperties = oSelectionVariant.getSelectOptionsPropertyNames();
      for (i = 0; i < aSelectProperties.length; i++) {
        const aSelectOptions = oSelectionVariant.getSelectOption(aSelectProperties[i]);
        if (aSelectOptions.length === 1 && aSelectOptions[0].Sign === "I" && aSelectOptions[0].Option === "EQ") {
          mURLParameters[aSelectProperties[i]] = aSelectOptions[0].Low;
        }
      }

      // add parameters from SelectionVariant.Parameters
      const aParameterNames = oSelectionVariant.getParameterNames();
      for (i = 0; i < aParameterNames.length; i++) {
        const sParameterValue = oSelectionVariant.getParameter(aParameterNames[i]);
        mURLParameters[aParameterNames[i]] = sParameterValue;
      }
      return mURLParameters;
    };
    _proto._createTechnicalError = function _createTechnicalError(sErrorCode) {
      return new NavError(sErrorCode);
    }

    /**
     * Sets the model that is used for verification of sensitive information. If the model is not set, the unnamed component model is used for the
     * verification of sensitive information.
     *
     * @public
     * @param oModel For checking sensitive information
     */;
    _proto.setModel = function setModel(oModel) {
      this._oModel = oModel;
    };
    _proto._getModel = function _getModel() {
      return this._oModel || this.oComponent.getModel();
    };
    _proto._removeAllProperties = function _removeAllProperties(oData) {
      if (oData) {
        if (oData.selectionVariant) {
          oData.selectionVariant = null;
        }
        if (oData.valueTexts) {
          oData.valueTexts = null;
        }
        if (oData.semanticDates) {
          oData.semanticDates = null;
        }
      }
    };
    _proto._removeProperties = function _removeProperties(aFilterName, aParameterName, oData) {
      if (aFilterName.length && oData && (oData.selectionVariant || oData.valueTexts || oData.semanticDates)) {
        aFilterName.forEach(function (sName) {
          if (oData.selectionVariant.SelectOptions) {
            oData.selectionVariant.SelectOptions.some(function (oValue, nIdx) {
              if (sName === oValue.PropertyName) {
                oData.selectionVariant.SelectOptions.splice(nIdx, 1);
                return true;
              }
              return false;
            });
          }
          if (oData.valueTexts && oData.valueTexts.Texts) {
            oData.valueTexts.Texts.forEach(function (oTexts) {
              if (oTexts.PropertyTexts) {
                oTexts.PropertyTexts.some(function (oValue, nIdx) {
                  if (sName === oValue.PropertyName) {
                    oTexts.PropertyTexts.splice(nIdx, 1);
                    return true;
                  }
                  return false;
                });
              }
            });
          }
          if (oData.semanticDates && oData.semanticDates.Dates) {
            oData.semanticDates.Dates.forEach(function (oDates, nIdx) {
              if (sName === oDates.PropertyName) {
                oData.semanticDates.Dates.splice(nIdx, 1);
              }
            });
          }
        });
      }
      if (aParameterName.length && oData && oData.selectionVariant && oData.selectionVariant.Parameters) {
        aParameterName.forEach(function (sName) {
          oData.selectionVariant.Parameters.some(function (oValue, nIdx) {
            if (sName === oValue.PropertyName || "$Parameter." + sName === oValue.PropertyName) {
              oData.selectionVariant.Parameters.splice(nIdx, 1);
              return true;
            }
            return false;
          });
        });
      }
    };
    _proto._isTermTrue = function _isTermTrue(oProperty, sTerm) {
      const fIsTermDefaultTrue = function (oTerm) {
        if (oTerm) {
          return oTerm.Bool ? oTerm.Bool !== "false" : true;
        }
        return false;
      };
      return !!oProperty[sTerm] && fIsTermDefaultTrue(oProperty[sTerm]);
    };
    _proto._isExcludedFromNavigationContext = function _isExcludedFromNavigationContext(oProperty) {
      return this._isTermTrue(oProperty, "com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext");
    };
    _proto._isPotentiallySensitive = function _isPotentiallySensitive(oProperty) {
      return this._isTermTrue(oProperty, "com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive");
    };
    _proto._isMeasureProperty = function _isMeasureProperty(oProperty) {
      return this._isTermTrue(oProperty, "com.sap.vocabularies.Analytics.v1.Measure");
    };
    _proto._isToBeExcluded = function _isToBeExcluded(oProperty) {
      return this._isPotentiallySensitive(oProperty) || this._isExcludedFromNavigationContext(oProperty);
    }

    /**
     * The method creates a context url based on provided data. This context url can either be used as
     * {@link sap.fe.navigation.NavigationHandler#setParameterContextUrl ParameterContextUrl} or
     * {@link sap.fe.navigation.NavigationHandler#setFilterContextUrl FilterContextUrl}.
     *
     * @param sEntitySetName Used for url determination
     * @param [oModel] Used for url determination. If omitted, the NavigationHandler model is used.
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of missing or wrong passed parameters
     * @returns The context url for the given entities
     * @protected
     */;
    _proto.constructContextUrl = function constructContextUrl(sEntitySetName, oModel) {
      if (!sEntitySetName) {
        throw new NavError("NavigationHandler.NO_ENTITY_SET_PROVIDED");
      }
      if (oModel === undefined) {
        oModel = this._getModel();
      }
      return this._constructContextUrl(oModel) + "#" + sEntitySetName;
    };
    _proto._constructContextUrl = function _constructContextUrl(oModel) {
      let sServerUrl;
      if (oModel.isA("sap.ui.model.odata.v2.ODataModel")) {
        sServerUrl = oModel._getServerUrl();
      } else if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
        const oServiceURI = new URI(oModel.sServiceUrl).absoluteTo(document.baseURI);
        sServerUrl = new URI("/").absoluteTo(oServiceURI).toString();
      }
      if (sServerUrl && sServerUrl.lastIndexOf("/") === sServerUrl.length - 1) {
        sServerUrl = sServerUrl.substr(0, sServerUrl.length - 1);
      }
      return sServerUrl + oModel.sServiceUrl + "/$metadata";
    }

    /**
     * The method verifies, if any of the passed parameters/filters are marked as sensitive, and if this is the case remove those from the app
     * data. <b>Note:</b> To use this method, the metadata must be loaded first.
     *
     * @param oData With potential sensitive information (for OData, external representation using
     * <code>oSelectionVariant.toJSONObject()</code> must be used), with the <code>FilterContextUrl</code> or
     * <code>ParameterContextUrl</code> property.
     * @returns Data without properties marked as sensitive or an empty object if the OData metadata is not fully loaded yet
     * @private
     */;
    _proto._checkIsPotentiallySensitive = function _checkIsPotentiallySensitive(oData) {
      let oAdaptedData = oData;
      if (oData && oData.selectionVariant && (oData.selectionVariant.FilterContextUrl && oData.selectionVariant.SelectOptions || oData.selectionVariant.ParameterContextUrl && oData.selectionVariant.Parameters)) {
        const oModel = this._getModel();
        if (this.oComponent && oModel && oModel.isA("sap.ui.model.odata.v2.ODataModel")) {
          const aSensitiveFilterName = [];
          const aSensitiveParameterName = [];
          let i,
            oEntitySet,
            oEntityDef,
            oSubEntityDef,
            oEndRole,
            aFilterContextPart = [],
            aParamContextPart = [];
          const oMetaModel = oModel.getMetaModel();
          if (oModel.getServiceMetadata() && oMetaModel !== null && oMetaModel !== void 0 && oMetaModel.oModel) {
            if (oData.selectionVariant.FilterContextUrl) {
              aFilterContextPart = oData.selectionVariant.FilterContextUrl.split("#");
            }
            if (aFilterContextPart.length === 2 && oData.selectionVariant.SelectOptions && this._constructContextUrl(oModel).indexOf(aFilterContextPart[0]) === 0) {
              oEntitySet = oMetaModel.getODataEntitySet(aFilterContextPart[1]);
              if (oEntitySet) {
                oEntityDef = oMetaModel.getODataEntityType(oEntitySet.entityType);
              } else {
                oEntityDef = oMetaModel.getODataEntityType(aFilterContextPart[1]);
              }
              if (oEntityDef) {
                if (oEntityDef && oEntityDef.property) {
                  for (i = 0; i < oEntityDef.property.length; i++) {
                    if (this._isToBeExcluded(oEntityDef.property[i])) {
                      aSensitiveFilterName.push(oEntityDef.property[i].name);
                    }
                  }
                }
                if (oEntityDef.navigationProperty) {
                  for (i = 0; i < oEntityDef.navigationProperty.length; i++) {
                    oEndRole = oMetaModel.getODataAssociationEnd(oEntityDef, oEntityDef.navigationProperty[i].name);
                    if (!oEndRole || oEndRole.type === oData.selectionVariant.FilterContextUrl) {
                      continue;
                    }
                    // check if the end role has cardinality 0..1 or 1
                    if (oEndRole.multiplicity === "1" || oEndRole.multiplicity === "0..1") {
                      oSubEntityDef = oMetaModel.getODataEntityType(oEndRole.type);
                      if (oSubEntityDef && oSubEntityDef.property) {
                        for (let j = 0; j < oSubEntityDef.property.length; j++) {
                          if (this._isToBeExcluded(oSubEntityDef.property[j])) {
                            aSensitiveFilterName.push(oEntityDef.navigationProperty[i].name + "." + oSubEntityDef.property[j].name);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            if (oData.selectionVariant.ParameterContextUrl) {
              aParamContextPart = oData.selectionVariant.ParameterContextUrl.split("#");
            }
            if (aParamContextPart.length === 2 && oData.selectionVariant.Parameters && this._constructContextUrl(oModel).indexOf(aParamContextPart[0]) === 0) {
              oEntitySet = oMetaModel.getODataEntitySet(aParamContextPart[1]);
              if (oEntitySet) {
                oEntityDef = oMetaModel.getODataEntityType(oEntitySet.entityType);
              } else {
                oEntityDef = oMetaModel.getODataEntityType(aFilterContextPart[1]);
              }
              if (oEntityDef) {
                if (oEntityDef.property) {
                  for (i = 0; i < oEntityDef.property.length; i++) {
                    if (this._isToBeExcluded(oEntityDef.property[i])) {
                      aSensitiveParameterName.push(oEntityDef.property[i].name);
                    }
                  }
                }
              }
            }
            if (aSensitiveFilterName.length || aSensitiveParameterName.length) {
              oAdaptedData = extend(true, {}, oAdaptedData);
              this._removeProperties(aSensitiveFilterName, aSensitiveParameterName, oAdaptedData);
            }
          } else {
            // annotations are not loaded

            this._removeAllProperties(oAdaptedData);
            Log.error("NavigationHandler: oMetadata are not fully loaded!");
          }
        } else if (this.oComponent && oModel && oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
          return this._removeSensitiveDataForODataV4(oAdaptedData);
        }
      }
      return oAdaptedData;
    };
    _proto._removeMeasureBasedInformation = function _removeMeasureBasedInformation(oAppData) {
      let oAppDataForSave = oAppData;
      if (oAppData.selectionVariant) {
        /*
         * The specification states that Selection Variants need to be JSON objects. However, internally, we work with strings for
         * "selectionVariant". Therefore, in case that this is a string, we need to JSON-parse the data.
         */
        if (typeof oAppData.selectionVariant === "string") {
          try {
            oAppDataForSave.selectionVariant = JSON.parse(oAppData.selectionVariant);
          } catch (x) {
            Log.error("NavigationHandler: _removeMeasureBasedInformation parse error");
          }
        }
        oAppDataForSave = this._removeMeasureBasedProperties(oAppDataForSave);
      }
      return oAppDataForSave;
    }

    /**
     * The method verifies if any of the passed parameters/filters are marked as a measure. If this is the case, they are removed from the xapp
     * app data. <b>Note:</b> To use this method, the metadata must be loaded first.
     *
     * @param oData With potential sensitive information (for OData, external representation using
     * <code>oSelectionVariant.toJSONObject()</code> must be used), with the <code>FilterContextUrl</code> or
     * <code>ParameterContextUrl</code> property.
     * @returns Data without properties marked as measures or an empty object if the OData metadata is not fully loaded yet
     * @private
     */;
    _proto._removeMeasureBasedProperties = function _removeMeasureBasedProperties(oData) {
      let oAdaptedData = oData;
      const aMeasureFilterName = [];
      const aMeasureParameterName = [];
      let i,
        oModel,
        oMetaModel,
        oEntitySet,
        oEntityDef,
        oSubEntityDef,
        oEndRole,
        aFilterContextPart = [],
        aParamContextPart = [];
      if (oData && oData.selectionVariant && (oData.selectionVariant.FilterContextUrl && oData.selectionVariant.SelectOptions || oData.selectionVariant.ParameterContextUrl && oData.selectionVariant.Parameters)) {
        oModel = this._getModel();
        if (this.oComponent && oModel && oModel.isA("sap.ui.model.odata.v2.ODataModel")) {
          oMetaModel = oModel.getMetaModel();
          if (oModel.getServiceMetadata() && oMetaModel && oMetaModel.oModel) {
            if (oData.selectionVariant.FilterContextUrl) {
              aFilterContextPart = oData.selectionVariant.FilterContextUrl.split("#");
            }
            if (aFilterContextPart.length === 2 && oData.selectionVariant.SelectOptions && this._constructContextUrl(oModel).indexOf(aFilterContextPart[0]) === 0) {
              oEntitySet = oMetaModel.getODataEntitySet(aFilterContextPart[1]);
              if (oEntitySet) {
                oEntityDef = oMetaModel.getODataEntityType(oEntitySet.entityType);
              } else {
                oEntityDef = oMetaModel.getODataEntityType(aFilterContextPart[1]);
              }
              if (oEntityDef) {
                if (oEntityDef && oEntityDef.property) {
                  for (i = 0; i < oEntityDef.property.length; i++) {
                    if (this._isMeasureProperty(oEntityDef.property[i])) {
                      aMeasureFilterName.push(oEntityDef.property[i].name);
                    }
                  }
                }
                if (oEntityDef.navigationProperty) {
                  for (i = 0; i < oEntityDef.navigationProperty.length; i++) {
                    oEndRole = oMetaModel.getODataAssociationEnd(oEntityDef, oEntityDef.navigationProperty[i].name);
                    if (!oEndRole || oEndRole.type === oData.selectionVariant.FilterContextUrl) {
                      continue;
                    }
                    // check if the end role has cardinality 0..1 or 1
                    if (oEndRole.multiplicity === "1" || oEndRole.multiplicity === "0..1") {
                      oSubEntityDef = oMetaModel.getODataEntityType(oEndRole.type);
                      if (oSubEntityDef && oSubEntityDef.property) {
                        for (let j = 0; j < oSubEntityDef.property.length; j++) {
                          if (this._isMeasureProperty(oSubEntityDef.property[j])) {
                            aMeasureFilterName.push(oEntityDef.navigationProperty[i].name + "." + oSubEntityDef.property[j].name);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            if (oData.selectionVariant.ParameterContextUrl) {
              aParamContextPart = oData.selectionVariant.ParameterContextUrl.split("#");
            }
            if (aParamContextPart.length === 2 && oData.selectionVariant.Parameters && this._constructContextUrl(oModel).indexOf(aParamContextPart[0]) === 0) {
              oEntitySet = oMetaModel.getODataEntitySet(aParamContextPart[1]);
              if (oEntitySet) {
                oEntityDef = oMetaModel.getODataEntityType(oEntitySet.entityType);
              } else {
                oEntityDef = oMetaModel.getODataEntityType(aFilterContextPart[1]);
              }
              if (oEntityDef) {
                if (oEntityDef.property) {
                  for (i = 0; i < oEntityDef.property.length; i++) {
                    if (this._isMeasureProperty(oEntityDef.property[i])) {
                      aMeasureParameterName.push(oEntityDef.property[i].name);
                    }
                  }
                }
              }
            }
            if (aMeasureFilterName.length || aMeasureParameterName.length) {
              // TQ: needs attention
              oAdaptedData = extend(true, {}, oAdaptedData);
              this._removeProperties(aMeasureFilterName, aMeasureParameterName, oAdaptedData);
            }
          } else {
            // annotations are not loaded

            this._removeAllProperties(oAdaptedData);
            Log.error("NavigationHandler: oMetadata are not fully loaded!");
          }
        } else if (this.oComponent && oModel && oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
          return this._removeSensitiveDataForODataV4(oAdaptedData, true);
        }
      }
      return oAdaptedData;
    }

    /**
     * Removes sensitive data from the navigation context.
     *
     * @param oData Selection variant
     * @param bMeasure Should measures be removed
     * @returns The selection variant after sensitive data has been removed
     */;
    _proto._removeSensitiveDataForODataV4 = function _removeSensitiveDataForODataV4(oData, bMeasure) {
      var _aFilterContextPart;
      const oNavHandler = this,
        oSV = new SelectionVariant(oData.selectionVariant),
        oModel = this._getModel();
      let aFilterContextPart;
      if (!oModel.getMetaModel().getObject("/")) {
        // annotations are not loaded
        this._removeAllProperties(oData);
        Log.error("NavigationHandler: oMetadata are not fully loaded!");
        return oData;
      }
      if (oData.selectionVariant.FilterContextUrl) {
        aFilterContextPart = oData.selectionVariant.FilterContextUrl.split("#");
      }
      if (((_aFilterContextPart = aFilterContextPart) === null || _aFilterContextPart === void 0 ? void 0 : _aFilterContextPart.length) === 2 && oData.selectionVariant.SelectOptions && this._constructContextUrl(oModel).indexOf(aFilterContextPart[0]) === 0) {
        oSV.removeSelectOption("@odata.context");
        oSV.removeSelectOption("@odata.metadataEtag");
        oSV.removeSelectOption("SAP__Messages");
        const sEntitySet = aFilterContextPart[1],
          oMetaModel = oModel.getMetaModel(),
          aPropertyNames = oSV.getPropertyNames() || [],
          fnIsSensitiveData = function (sProp, esName) {
            esName = esName || sEntitySet;
            const aPropertyAnnotations = oMetaModel.getObject("/" + esName + "/" + sProp + "@");
            if (aPropertyAnnotations) {
              if (bMeasure && aPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"] || oNavHandler._checkPropertyAnnotationsForSensitiveData(aPropertyAnnotations)) {
                return true;
              } else if (aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"]) {
                const oFieldControl = aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
                if (oFieldControl["$EnumMember"] && oFieldControl["$EnumMember"].split("/")[1] === "Inapplicable") {
                  return true;
                }
              }
            }
            return false;
          };
        for (let k = 0; k < aPropertyNames.length; k++) {
          const sProperty = aPropertyNames[k];
          // properties of the entity set
          if (fnIsSensitiveData(sProperty, sEntitySet)) {
            oSV.removeSelectOption(sProperty);
          }
        }
        oData.selectionVariant = oSV.toJSONObject();
      }
      return oData;
    };
    _proto._checkPropertyAnnotationsForSensitiveData = function _checkPropertyAnnotationsForSensitiveData(aPropertyAnnotations) {
      return aPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] || aPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"];
    };
    return NavigationHandler;
  }(BaseObject); // Exporting the class as properly typed UI5Class
  _exports.NavigationHandler = NavigationHandler;
  const NavigationHandlerUI5Class = BaseObject.extend("sap.fe.navigation.NavigationHandler", NavigationHandler.prototype);
  return NavigationHandlerUI5Class;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZUeXBlIiwiTmF2TGlicmFyeSIsIlBhcmFtSGFuZGxpbmdNb2RlIiwiU3VwcHJlc3Npb25CZWhhdmlvciIsIk1vZGUiLCJJQVBQX1NUQVRFIiwiREVGQVVMVEVEX1BBUkFNRVRFUl9QUk9QRVJUWSIsIk5hdmlnYXRpb25IYW5kbGVyIiwib0NvbnRyb2xsZXIiLCJzTW9kZSIsInNQYXJhbUhhbmRsaW5nTW9kZSIsIl9hVGVjaG5pY2FsUGFyYW1hdGVycyIsIl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhIiwic0FwcFN0YXRlS2V5Iiwib0FwcERhdGEiLCJpQ2FjaGVIaXQiLCJpQ2FjaGVNaXNzIiwiX3JJQXBwU3RhdGVPbGQiLCJSZWdFeHAiLCJfcklBcHBTdGF0ZU9sZEF0U3RhcnQiLCJfcklBcHBTdGF0ZU5ldyIsIk5hdkVycm9yIiwiVUlDb21wb25lbnQiLCJvUm91dGVyIiwiZ2V0Um91dGVyIiwib0NvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50IiwiX2dldFJvdXRlciIsImdldEFwcENvbXBvbmVudCIsImdldENvbXBvbmVudERhdGEiLCJVUkxQYXJhbVdpbnMiLCJJbnNlcnRJblNlbE9wdCIsIlNlbFZhcldpbnMiLCJPRGF0YVYyIiwiX3NNb2RlIiwiX2dldEFwcE5hdmlnYXRpb25TZXJ2aWNlIiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwiZ2V0U2VydmljZSIsIl9nZXRBcHBOYXZpZ2F0aW9uU2VydmljZUFzeW5jIiwiZ2V0U2VydmljZUFzeW5jIiwidGhlbiIsIm9Dcm9zc0FwcE5hdlNlcnZpY2UiLCJjYXRjaCIsIkxvZyIsImVycm9yIiwiZ2V0Um91dGVyRm9yIiwicmVnaXN0ZXJOYXZpZ2F0ZUNhbGxiYWNrIiwiZm5DYWxsYmFjayIsIl9uYXZpZ2F0ZUNhbGxiYWNrIiwibmF2aWdhdGUiLCJzU2VtYW50aWNPYmplY3QiLCJzQWN0aW9uTmFtZSIsInZOYXZpZ2F0aW9uUGFyYW1ldGVycyIsIm9Jbm5lckFwcERhdGEiLCJmbk9uRXJyb3IiLCJvRXh0ZXJuYWxBcHBEYXRhIiwic05hdk1vZGUiLCJzU2VsZWN0aW9uVmFyaWFudCIsIm1QYXJhbWV0ZXJzIiwib1hBcHBEYXRhT2JqIiwib1N0YXJ0dXBQYXJhbWV0ZXJzIiwiYkV4UGxhY2UiLCJvVG1wRGF0YSIsIm9OYXZIYW5kbGVyIiwib0NvbXBvbmVudERhdGEiLCJzdGFydHVwUGFyYW1ldGVycyIsImxlbmd0aCIsInVuZGVmaW5lZCIsIm9FbnJpY2hlZFNlbFZhciIsIl9zcGxpdEluYm91bmROYXZpZ2F0aW9uUGFyYW1ldGVycyIsIlNlbGVjdGlvblZhcmlhbnQiLCJvTmF2aWdhdGlvblNlbFZhciIsInRvSlNPTlN0cmluZyIsInNlbGVjdGlvblZhcmlhbnQiLCJfcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyIsInRvSlNPTk9iamVjdCIsIl9yZW1vdmVNZWFzdXJlQmFzZWRJbmZvcm1hdGlvbiIsIl9jaGVja0lzUG90ZW50aWFsbHlTZW5zaXRpdmUiLCJfZ2V0VVJMUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50Iiwib05hdkFyZ3VtZW50cyIsInRhcmdldCIsInNlbWFudGljT2JqZWN0IiwiYWN0aW9uIiwicGFyYW1zIiwiZm5OYXZpZ2F0ZSIsImZuTmF2RXhwbGFjZSIsInNOZXdIcmVmUHJvbWlzZSIsImhyZWZGb3JFeHRlcm5hbEFzeW5jIiwic05ld0hyZWYiLCJvcGVuV2luZG93Iiwib0Vycm9yIiwiX2ZuU2F2ZUFwcFN0YXRlQXN5bmMiLCJvU2F2ZUFwcFN0YXRlUmV0dXJuIiwiYXBwU3RhdGVLZXkiLCJwdG9FeHQiLCJ0b0V4dGVybmFsIiwiZm5TdG9yZUFuZE5hdmlnYXRlIiwic3RvcmVJbm5lckFwcFN0YXRlQXN5bmMiLCJyZXBsYWNlSGFzaCIsIm9TdXBwb3J0ZWRQcm9taXNlIiwiaXNOYXZpZ2F0aW9uU3VwcG9ydGVkIiwiZG9uZSIsIm9UYXJnZXRzIiwic3VwcG9ydGVkIiwiZmFpbCIsIl9jcmVhdGVUZWNobmljYWxFcnJvciIsInBhcnNlTmF2aWdhdGlvbiIsInNBcHBIYXNoIiwiSGFzaENoYW5nZXIiLCJnZXRJbnN0YW5jZSIsImdldEhhc2giLCJzSUFwcFN0YXRlIiwiX2dldElubmVyQXBwU3RhdGVLZXkiLCJ3YXJuaW5nIiwiYURlZmF1bHRlZFBhcmFtZXRlcnMiLCJKU09OIiwicGFyc2UiLCJvTXlEZWZlcnJlZCIsImpRdWVyeSIsIkRlZmVycmVkIiwicGFyc2VVcmxQYXJhbXMiLCJvU3ViU3RhcnR1cFBhcmFtZXRlcnMiLCJhU3ViRGVmYXVsdGVkUGFyYW1ldGVycyIsIm9TdWJNeURlZmVycmVkIiwic05hdlR5cGUiLCJvU2VsVmFycyIsImlzRW1wdHkiLCJvRGVmYXVsdGVkU2VsVmFyIiwieEFwcFN0YXRlIiwicmVqZWN0IiwicmVzb2x2ZSIsImluaXRpYWwiLCJvQXBwU3RhdGVEYXRhIiwib1NlbGVjdGlvblZhcmlhbnQiLCJvRGVmYXVsdGVkU2VsZWN0aW9uVmFyaWFudCIsImJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHkiLCJfbG9hZEFwcFN0YXRlIiwiYklzWGFwcFN0YXRlTmF2aWdhdGlvbiIsInRoYXQiLCJvU3RhcnR1cFByb21pc2UiLCJnZXRTdGFydHVwQXBwU3RhdGUiLCJvQXBwU3RhdGUiLCJnZXREYXRhIiwic3RyaW5naWZ5IiwieCIsInByb21pc2UiLCJvU2VsVmFyIiwiVVJMUGFyYW1zIiwic2V0VGVjaG5pY2FsUGFyYW1ldGVycyIsImFUZWNobmljYWxQYXJhbWV0ZXJzIiwiQXJyYXkiLCJpc0FycmF5IiwiZ2V0VGVjaG5pY2FsUGFyYW1ldGVycyIsImNvbmNhdCIsIl9pc1RlY2huaWNhbFBhcmFtZXRlciIsInNQYXJhbWV0ZXJOYW1lIiwidG9Mb3dlckNhc2UiLCJpbmRleE9mIiwiX2lzRkVQYXJhbWV0ZXIiLCJzUHJvcE5hbWUiLCJpIiwiYVNlbFZhclByb3BOYW1lcyIsImdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzIiwicmVtb3ZlU2VsZWN0T3B0aW9uIiwib1N0YXJ0dXBQYXJhbWV0ZXJzQWRqdXN0ZWQiLCJoYXNPd25Qcm9wZXJ0eSIsImdldFBhcmFtZXRlck5hbWVzIiwibWFzc0FkZFNlbGVjdE9wdGlvbiIsImdldFZhbHVlIiwiX2FkZFBhcmFtZXRlclZhbHVlcyIsImFQcm9wTmFtZXMiLCJvU2VsVmFyaWFudCIsInNTaWduIiwic09wdGlvbiIsIm9WYWx1ZXMiLCJhZGRTZWxlY3RPcHRpb24iLCJvSGFzaENoYW5nZXIiLCJzQXBwSGFzaE9sZCIsInNBcHBIYXNoTmV3IiwiX3JlcGxhY2VJbm5lckFwcFN0YXRlS2V5IiwibUlubmVyQXBwRGF0YSIsImJJbW1lZGlhdGVIYXNoUmVwbGFjZSIsImJTa2lwSGFzaFJlcGxhY2UiLCJmblJlcGxhY2VIYXNoIiwiaXNFbXB0eU9iamVjdCIsInNBcHBTdGF0ZUtleUNhY2hlZCIsImJJbm5lckFwcERhdGFFcXVhbCIsImZuT25BZnRlclNhdmUiLCJfc2F2ZUFwcFN0YXRlQXN5bmMiLCJzdG9yZUlubmVyQXBwU3RhdGUiLCJfc2F2ZUFwcFN0YXRlIiwic3RvcmVJbm5lckFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybiIsIm9BcHBTdGF0ZVByb21pc2UiLCJwcm9jZXNzQmVmb3JlU21hcnRMaW5rUG9wb3Zlck9wZW5zIiwib1RhYmxlRXZlbnRQYXJhbWV0ZXJzIiwibVNlbWFudGljQXR0cmlidXRlcyIsInNlbWFudGljQXR0cmlidXRlcyIsImZuU3RvcmVYYXBwQW5kQ2FsbE9wZW4iLCJtU3ViU2VtYW50aWNBdHRyaWJ1dGVzIiwic1N1YlNlbGVjdGlvblZhcmlhbnQiLCJpU3VwcHJlc3Npb25CZWhhdmlvciIsInJhaXNlRXJyb3JPbk51bGwiLCJyYWlzZUVycm9yT25VbmRlZmluZWQiLCJvTWl4ZWRTZWxWYXIiLCJtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudCIsImZuT25Db250YWluZXJTYXZlIiwic2V0U2VtYW50aWNBdHRyaWJ1dGVzIiwic2V0QXBwU3RhdGVLZXkiLCJvcGVuIiwib1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UiLCJfZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzIiwiX21peEF0dHJpYnV0ZXNUb1NlbFZhcmlhbnQiLCJzUHJvcGVydHlOYW1lIiwidlNlbWFudGljQXR0cmlidXRlVmFsdWUiLCJEYXRlIiwidG9KU09OIiwidG9TdHJpbmciLCJpZ25vcmVFbXB0eVN0cmluZyIsImluZm8iLCJTdHJpbmciLCJ2U2VtYW50aWNBdHRyaWJ1dGVzIiwib05ld1NlbFZhcmlhbnQiLCJmaWx0ZXJVcmwiLCJnZXRGaWx0ZXJDb250ZXh0VXJsIiwic2V0RmlsdGVyQ29udGV4dFVybCIsImNvbnRleHRVcmwiLCJnZXRQYXJhbWV0ZXJDb250ZXh0VXJsIiwic2V0UGFyYW1ldGVyQ29udGV4dFVybCIsImZvckVhY2giLCJhUGFyYW1ldGVycyIsImdldFNlbGVjdE9wdGlvbiIsImdldFBhcmFtZXRlciIsImFTZWxPcHRpb25OYW1lcyIsImFTZWxlY3RPcHRpb24iLCJqIiwiU2lnbiIsIk9wdGlvbiIsIkxvdyIsIkhpZ2giLCJfZW5zdXJlU2VsZWN0aW9uVmFyaWFudEZvcm1hdFN0cmluZyIsInZTZWxlY3Rpb25WYXJpYW50IiwidkNvbnZlcnRlZFNlbGVjdGlvblZhcmlhbnQiLCJfZm5IYW5kbGVBcHBTdGF0ZVByb21pc2UiLCJvUmV0dXJuIiwiX3NhdmVBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4iLCJfZm5TYXZlQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuIiwiZ2V0S2V5Iiwib0FwcERhdGFGb3JTYXZlIiwiX2ZldGNoQXBwRGF0YUZvclNhdmUiLCJzZXREYXRhIiwib1NhdmVQcm9taXNlIiwic2F2ZSIsImV4dGVuZCIsInRhYmxlVmFyaWFudElkIiwiY3VzdG9tRGF0YSIsInByZXNlbnRhdGlvblZhcmlhbnQiLCJ2YWx1ZVRleHRzIiwic2VtYW50aWNEYXRlcyIsIm9BcHBEYXRhQ2xvbmUiLCJPYmplY3QiLCJhc3NpZ24iLCJtZXJnZSIsImNyZWF0ZUVtcHR5QXBwU3RhdGVBc3luYyIsImNyZWF0ZUVtcHR5QXBwU3RhdGUiLCJvRGVmZXJyZWQiLCJnZXRBcHBTdGF0ZSIsIm9BcHBEYXRhTG9hZGVkIiwiaUFwcFN0YXRlIiwiYU1hdGNoZXMiLCJleGVjIiwic05ld0lBcHBTdGF0ZSIsImZuQXBwZW5kVG9RdWVyeVBhcmFtZXRlciIsInNTdWJBcHBIYXNoIiwidGVzdCIsInJlcGxhY2UiLCJzTmVlZGxlIiwiZm5SZXBsYWNlT2xkQXBwcm9hY2giLCJyT2xkQXBwcm9hY2giLCJhc3NlcnQiLCJtVVJMUGFyYW1ldGVycyIsImFTZWxlY3RQcm9wZXJ0aWVzIiwiYVNlbGVjdE9wdGlvbnMiLCJhUGFyYW1ldGVyTmFtZXMiLCJzUGFyYW1ldGVyVmFsdWUiLCJzRXJyb3JDb2RlIiwic2V0TW9kZWwiLCJvTW9kZWwiLCJfb01vZGVsIiwiX2dldE1vZGVsIiwiZ2V0TW9kZWwiLCJfcmVtb3ZlQWxsUHJvcGVydGllcyIsIm9EYXRhIiwiX3JlbW92ZVByb3BlcnRpZXMiLCJhRmlsdGVyTmFtZSIsImFQYXJhbWV0ZXJOYW1lIiwic05hbWUiLCJTZWxlY3RPcHRpb25zIiwic29tZSIsIm9WYWx1ZSIsIm5JZHgiLCJQcm9wZXJ0eU5hbWUiLCJzcGxpY2UiLCJUZXh0cyIsIm9UZXh0cyIsIlByb3BlcnR5VGV4dHMiLCJEYXRlcyIsIm9EYXRlcyIsIlBhcmFtZXRlcnMiLCJfaXNUZXJtVHJ1ZSIsIm9Qcm9wZXJ0eSIsInNUZXJtIiwiZklzVGVybURlZmF1bHRUcnVlIiwib1Rlcm0iLCJCb29sIiwiX2lzRXhjbHVkZWRGcm9tTmF2aWdhdGlvbkNvbnRleHQiLCJfaXNQb3RlbnRpYWxseVNlbnNpdGl2ZSIsIl9pc01lYXN1cmVQcm9wZXJ0eSIsIl9pc1RvQmVFeGNsdWRlZCIsImNvbnN0cnVjdENvbnRleHRVcmwiLCJzRW50aXR5U2V0TmFtZSIsIl9jb25zdHJ1Y3RDb250ZXh0VXJsIiwic1NlcnZlclVybCIsImlzQSIsIl9nZXRTZXJ2ZXJVcmwiLCJvU2VydmljZVVSSSIsIlVSSSIsInNTZXJ2aWNlVXJsIiwiYWJzb2x1dGVUbyIsImRvY3VtZW50IiwiYmFzZVVSSSIsImxhc3RJbmRleE9mIiwic3Vic3RyIiwib0FkYXB0ZWREYXRhIiwiRmlsdGVyQ29udGV4dFVybCIsIlBhcmFtZXRlckNvbnRleHRVcmwiLCJhU2Vuc2l0aXZlRmlsdGVyTmFtZSIsImFTZW5zaXRpdmVQYXJhbWV0ZXJOYW1lIiwib0VudGl0eVNldCIsIm9FbnRpdHlEZWYiLCJvU3ViRW50aXR5RGVmIiwib0VuZFJvbGUiLCJhRmlsdGVyQ29udGV4dFBhcnQiLCJhUGFyYW1Db250ZXh0UGFydCIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJnZXRTZXJ2aWNlTWV0YWRhdGEiLCJzcGxpdCIsImdldE9EYXRhRW50aXR5U2V0IiwiZ2V0T0RhdGFFbnRpdHlUeXBlIiwiZW50aXR5VHlwZSIsInByb3BlcnR5IiwicHVzaCIsIm5hbWUiLCJuYXZpZ2F0aW9uUHJvcGVydHkiLCJnZXRPRGF0YUFzc29jaWF0aW9uRW5kIiwidHlwZSIsIm11bHRpcGxpY2l0eSIsIl9yZW1vdmVTZW5zaXRpdmVEYXRhRm9yT0RhdGFWNCIsIl9yZW1vdmVNZWFzdXJlQmFzZWRQcm9wZXJ0aWVzIiwiYU1lYXN1cmVGaWx0ZXJOYW1lIiwiYU1lYXN1cmVQYXJhbWV0ZXJOYW1lIiwiYk1lYXN1cmUiLCJvU1YiLCJnZXRPYmplY3QiLCJzRW50aXR5U2V0IiwiYVByb3BlcnR5TmFtZXMiLCJnZXRQcm9wZXJ0eU5hbWVzIiwiZm5Jc1NlbnNpdGl2ZURhdGEiLCJzUHJvcCIsImVzTmFtZSIsImFQcm9wZXJ0eUFubm90YXRpb25zIiwiX2NoZWNrUHJvcGVydHlBbm5vdGF0aW9uc0ZvclNlbnNpdGl2ZURhdGEiLCJvRmllbGRDb250cm9sIiwiayIsInNQcm9wZXJ0eSIsIkJhc2VPYmplY3QiLCJOYXZpZ2F0aW9uSGFuZGxlclVJNUNsYXNzIiwicHJvdG90eXBlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJOYXZpZ2F0aW9uSGFuZGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXNzZXJ0IGZyb20gXCJzYXAvYmFzZS9hc3NlcnRcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IGV4dGVuZCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9leHRlbmRcIjtcbmltcG9ydCBpc0VtcHR5T2JqZWN0IGZyb20gXCJzYXAvYmFzZS91dGlsL2lzRW1wdHlPYmplY3RcIjtcbmltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IEJhc2VPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL09iamVjdFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbGxlciBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJcIjtcbmltcG9ydCBIYXNoQ2hhbmdlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9IYXNoQ2hhbmdlclwiO1xuaW1wb3J0IFVJQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9VSUNvbXBvbmVudFwiO1xuaW1wb3J0IFYyT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3YyL09EYXRhTW9kZWxcIjtcbmltcG9ydCBWNE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgVVJJIGZyb20gXCJzYXAvdWkvdGhpcmRwYXJ0eS9VUklcIjtcbmltcG9ydCBvcGVuV2luZG93IGZyb20gXCJzYXAvdWkvdXRpbC9vcGVuV2luZG93XCI7XG5pbXBvcnQgTmF2TGlicmFyeSBmcm9tIFwiLi9saWJyYXJ5XCI7XG5pbXBvcnQgTmF2RXJyb3IgZnJvbSBcIi4vTmF2RXJyb3JcIjtcbmltcG9ydCB0eXBlIHsgU2VyaWFsaXplZFNlbGVjdGlvblZhcmlhbnQgfSBmcm9tIFwiLi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwiLi9TZWxlY3Rpb25WYXJpYW50XCI7XG5cbi8qKlxuICogU3RydWN0dXJlIG9mIHN0b3JlZCBhcHAgc3RhdGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW5uZXJBcHBEYXRhIHtcblx0W2tleTogc3RyaW5nXTogdW5rbm93bjtcblx0LyoqXG5cdCAqIFNyaW5naWZpZWQgSlNPTiBvYmplY3QgYXMgcmV0dXJuZWQsIGZvciBleGFtcGxlLCBmcm9tIGdldERhdGFTdWl0ZUZvcm1hdCgpIG9mIHRoZSBTbWFydEZpbHRlckJhciBjb250cm9sXG5cdCAqL1xuXHRzZWxlY3Rpb25WYXJpYW50Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgU21hcnRUYWJsZSB2YXJpYW50LlxuXHQgKi9cblx0dGFibGVWYXJpYW50SWQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIE9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHN0b3JlIGFyYml0cmFyeSBkYXRhLlxuXHQgKi9cblx0Y3VzdG9tRGF0YT86IG9iamVjdDtcblxuXHQvKipcblx0ICogT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgdWkgc3RhdGUgb2YgdGhlIGFwcC5cblx0ICovXG5cdHByZXNlbnRhdGlvblZhcmlhbnQ/OiBvYmplY3Q7XG5cblx0LyoqXG5cdCAqIE9iamVjdCBjb250YWluaW5nIHZhbHVlIGRlc2NyaXB0aW9ucy5cblx0ICovXG5cdHZhbHVlVGV4dHM/OiBvYmplY3Q7XG5cblx0LyoqXG5cdCAqIE9iamVjdCBjb250YWluaW5nIHNlbWFudGljRGF0ZXMgZmlsdGVyIGluZm9ybWF0aW9uLlxuXHQgKi9cblx0c2VtYW50aWNEYXRlcz86IG9iamVjdDtcbn1cblxuLy8gc2hvcnRjdXRzIGZvciBzYXAudWkuZ2VuZXJpYy5hcHAgZW51bXNcbmNvbnN0IE5hdlR5cGUgPSBOYXZMaWJyYXJ5Lk5hdlR5cGU7XG5jb25zdCBQYXJhbUhhbmRsaW5nTW9kZSA9IE5hdkxpYnJhcnkuUGFyYW1IYW5kbGluZ01vZGU7XG5jb25zdCBTdXBwcmVzc2lvbkJlaGF2aW9yID0gTmF2TGlicmFyeS5TdXBwcmVzc2lvbkJlaGF2aW9yO1xuY29uc3QgTW9kZSA9IE5hdkxpYnJhcnkuTW9kZTtcblxuY29uc3QgSUFQUF9TVEFURSA9IFwic2FwLWlhcHAtc3RhdGVcIjtcbmNvbnN0IERFRkFVTFRFRF9QQVJBTUVURVJfUFJPUEVSVFkgPSBcInNhcC11c2hlbGwtZGVmYXVsdGVkUGFyYW1ldGVyTmFtZXNcIjtcblxuLyoqXG4gKiBUaGlzIGlzIHRoZSBzdWNjZXNzb3Igb2Yge0BsaW5rIHNhcC51aS5nZW5lcmljLmFwcC5uYXZpZ2F0aW9uLnNlcnZpY2UuTmF2aWdhdGlvbkhhbmRsZXJ9Ljxicj4gQ3JlYXRlcyBhIG5ldyBOYXZpZ2F0aW9uSGFuZGxlciBjbGFzcyBieSBwcm92aWRpbmcgdGhlIHJlcXVpcmVkIGVudmlyb25tZW50LiA8YnI+XG4gKiBUaGUgPGNvZGU+TmF2aWdhdGlvbkhhbmRsZXI8L2NvZGU+IHN1cHBvcnRzIHRoZSB2ZXJpZmljYXRpb24gb2Ygc2Vuc2l0aXZlIGluZm9ybWF0aW9uLiBBbGwgcHJvcGVydGllcyB0aGF0IGFyZSBwYXJ0IG9mXG4gKiA8Y29kZT5zZWxlY3Rpb25WYXJpYW50PC9jb2RlPiBhbmQgPGNvZGU+dmFsdWVUZXh0czwvY29kZT4gd2lsbCBiZSB2ZXJpZmllZCBpZiB0aGV5IGFyZSBhbm5vdGF0ZWQgYXNcbiAqIDxjb2RlPmNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5Jc1BvdGVudGlhbGx5U2Vuc2l0aXZlPC9jb2RlPiBvclxuICogPGNvZGU+Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRXhjbHVkZUZyb21OYXZpZ2F0aW9uQ29udGV4dDwvY29kZT4gYW5kIHdpbGwgYmUgcmVtb3ZlZCBiZWZvcmUgdGhlIGRhdGEgaXMgcGVyc2lzdGVkIGFzIHRoZSBhcHBcbiAqIHN0YXRlLjxicj5cbiAqIEFsc28sIGFsbCBwcm9wZXJ0aWVzIGFubm90YXRlZCBhcyA8Y29kZT5jb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuTWVhc3VyZTwvY29kZT4gd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGRhdGEgc3RvcmVkIGFzIHRoZVxuICogeGFwcCBzdGF0ZS48YnI+XG4gKiBUbyB2ZXJpZnkgdGhlIGluZm9ybWF0aW9uIHRvIGJlIHJlbW92ZWQsIHRoZSA8Y29kZT5OYXZpZ2F0aW9uSGFuZGxlcjwvY29kZT4gcmVxdWlyZXMgYW4gdW5uYW1lZCBtb2RlbCBvZiB0eXBlXG4gKiB7QGxpbmsgc2FwLnVpLm1vZGVsLm9kYXRhLnYyLk9EYXRhTW9kZWx9IG9uIGNvbXBvbmVudCBsZXZlbC4gSXQgaXMgcG9zc2libGUgdG8gc2V0IHN1Y2ggYSBtb2RlbCB1c2luZyB0aGUgPGNvZGU+c2V0TW9kZWw8L2NvZGU+XG4gKiBtZXRob2QuPGJyPlxuICogPGI+Tm90ZTo8L2I+IFRoZSBjaGVjayBmb3IgZXhjbHVkZWQgZGF0YSByZXF1aXJlcyB0aGF0IHRoZSBPRGF0YSBtZXRhZGF0YSBoYXMgYWxyZWFkeSBiZWVuIGxvYWRlZCBjb21wbGV0ZWx5Ljxicj5cbiAqIElmIHRoZSBPRGF0YSBtZXRhZGF0YSBtb2RlbCBoYXMgbm90IGJlZW4gbG9hZGVkIGNvbXBsZXRlbHksIGFsbCBwcm9wZXJ0aWVzIGFyZSByZW1vdmVkIGZyb20gdGhlIGFwcGxpY2F0aW9uIGNvbnRleHQuPGJyPlxuICogPGI+Tm90ZTo8L2I+IFRoaXMgY2xhc3MgcmVxdWlyZXMgdGhhdCB0aGUgVVNoZWxsIHtAbGluayBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9ufSBpcyBhdmFpbGFibGUgYW5kIGluaXRpYWxpemVkLlxuICpcbiAqIEBwdWJsaWNcbiAqIEBjbGFzc1xuICogQGV4dGVuZHMgc2FwLnVpLmJhc2UuT2JqZWN0XG4gKiBAc2luY2UgMS44My4wXG4gKiBAbmFtZSBzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlclxuICovXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvbkhhbmRsZXIgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcblx0cHJpdmF0ZSBvUm91dGVyOiBhbnk7XG5cblx0cHJpdmF0ZSBvQ29tcG9uZW50OiBhbnk7XG5cblx0cHJpdmF0ZSBfb01vZGVsOiBhbnk7XG5cblx0cHJpdmF0ZSBzUGFyYW1IYW5kbGluZ01vZGU6IHN0cmluZztcblxuXHRwcml2YXRlIF9zTW9kZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdC8vIGxpc3Qgb2YgdGVjaG5pY2FsIHBhcmFtZXRlcnNcblx0cHJpdmF0ZSBfYVRlY2huaWNhbFBhcmFtYXRlcnMgPSBbXCJoY3BBcHBsaWNhdGlvbklkXCJdO1xuXG5cdHByaXZhdGUgX29MYXN0U2F2ZWRJbm5lckFwcERhdGE6IGFueSA9IHtcblx0XHRzQXBwU3RhdGVLZXk6IFwiXCIsXG5cdFx0b0FwcERhdGE6IHt9LFxuXHRcdGlDYWNoZUhpdDogMCxcblx0XHRpQ2FjaGVNaXNzOiAwXG5cdH07XG5cblx0Lypcblx0ICogVGhlcmUgZXhpc3RzIGEgZ2VuZXJhdGlvbiBvZiBcIm9sZFwiIHNhcC1pYXBwLXN0YXRlcyB3aGljaCBhcmUgYmFzZWQgb24gdGhlIGZvbGxvd2luZyBVUkwgc2NoZW1hOlxuXHQgKiAjU2VtT2JqLWFjdGlvbiYvcm91dGUvc2FwLWlhcHAtc3RhdGU9QUJDMTIzNDU2NzggVGhlIG5ldyBVUkwgc2NoZW1hIGlzOiAjU2VtT2JqLWFjdGlvbiYvcm91dGU/c2FwLWlhcHAtc3RhdGU9QUJDMTIzNDU2NzggKG1pbmQgdGhlXG5cdCAqIGRpZmZlcmVuY2UgYmV0d2VlbiAvIGFuZCA/IGFib3ZlKSwgaS5lLiB0aGUgc2FwLWlhcHAtc3RhdGUgaGFzIGJlY29tZSBhIHBhcmFtZXRlciBvZiB0aGUgcXVlcnkgcGFyYW1ldGVyIHNlY3Rpb24gaW4gdGhlIEFwcEhhc2ggc3RyaW5nLlxuXHQgKiBZZXQsIHRoaXMgdG9vbCBzaGFsbCBiZSBhYmxlIHRvIGRlYWwgZXZlbiB3aXRoIG9sZCBzYXAtaWFwcC1zdGF0ZXMuIFRoZXJlZm9yZSwgd2UgdXNlIHR3byBSZWd1bGFyIEV4cHJlc3Npb25zIChySUFwcFN0YXRlT2xkIGFuZFxuXHQgKiBySUFwcFN0YXRlT2xkQXRTdGFydCkgYXMgZGVmaW5lZCBiZWxvdyB0byBzY2FuIGZvciB0aGVzZSBvbGQgdmFyaWFudHMuIFRoZSBuZXcgdmFyaWFudCBpcyBiZWluZyBzY2FubmVkIHVzaW5nIHJJQXBwU3RhdGVOZXcgYXMgUmVndWxhclxuXHQgKiBFeHByZXNzaW9uIHNlYXJjaCBzdHJpbmcuIENvbXBhdGliaWxpdHkgaXMgY2VudHJhbGx5IGVuc3VyZWQgYnkgdGhlIHR3byBtZXRob2RzIF9nZXRJbm5lckFwcFN0YXRlS2V5IGFuZCBfcmVwbGFjZUlubmVyQXBwU3RhdGVLZXkgKHNlZVxuXHQgKiBiZWxvdykuIE5ldmVyIHVzZSB0aGVzZSBSZWdFeHAgaW4gYSBtZXRob2Qgb24geW91ciBvd24sIGFzIGl0IHR5cGljYWxseSBpbmRpY2F0ZXMgdGhhdCB5b3Ugd2lsbCBmYWxsIGludG8gdGhlIGNvbXBhdGliaWxpdHkgdHJhcCFcblx0ICovXG5cdC8vIFdhcm5pbmchIERvIG5vdCB1c2UgR0xPQkFMIGZsYWdzIGhlcmU7IFJlZ0V4cCBpbiBHTE9CQUwgbW9kZSBzdG9yZSB0aGUgbGFzdEluZGV4IHZhbHVlXG5cdC8vIFRoZXJlZm9yZSwgcmVwZWF0ZWQgY2FsbHMgdG8gdGhlIFJlZ0V4cCB3aWxsIHRoZW4gb25seSBzdGFydCBiZWdpbm5pbmcgd2l0aCB0aGF0IHN0b3JlZFxuXHQvLyBsYXN0SW5kZXguIFRodXMsIG11bHRpcGxlIGNhbGxzIHRoZXJlZm9yZSBjb3VsZCB5aWVsZCBzdHJhbmdlIHJlc3VsdHMuXG5cdC8vIE1vcmVvdmVyLCB0aGVyZSBzaGFsbCBvbmx5IGJlIGV4YWN0bHkgb25lIElBUFBfU1RBVEUgcGVyIFJlZ0V4cCBpbiBhbiBBcHBIYXNoLlxuXHQvLyBUaGVyZWZvcmUsIEdMT0JBTCBzZWFyY2ggc2hvdWxkIGJlIHN1cGVyZmx1b3VzLlxuXHRwcml2YXRlIF9ySUFwcFN0YXRlT2xkID0gbmV3IFJlZ0V4cChcIi9cIiArIElBUFBfU1RBVEUgKyBcIj0oW14vP10rKVwiKTtcblxuXHRwcml2YXRlIF9ySUFwcFN0YXRlT2xkQXRTdGFydCA9IG5ldyBSZWdFeHAoXCJeXCIgKyBJQVBQX1NUQVRFICsgXCI9KFteLz9dKylcIik7XG5cblx0Lypcblx0ICogUmVndWxhciBFeHByZXNzaW9uIGluIHdvcmRzOiBTZWFyY2ggZm9yIHNvbWV0aGluZyB0aGF0IGVpdGhlciBzdGFydHMgd2l0aCA/IG9yICYsIGZvbGxvd2VkIGJ5IHRoZSB0ZXJtIFwic2FwLWlhcHAtc3RhdGVcIi4gVGhhdCBvbmUgaXNcblx0ICogZm9sbG93ZWQgYnkgYW4gZXF1YWwgc2lnbiAoPSkuIFRoZSBzdHVmZiB0aGF0IGlzIGFmdGVyIHRoZSBlcXVhbCBzaWduIGZvcm1zIHRoZSBmaXJzdCByZWdleHAgZ3JvdXAuIFRoaXMgZ3JvdXAgY29uc2lzdHMgb2YgYXQgbGVhc3Qgb25lXG5cdCAqIChvciBhcmJpdHJhcnkgbWFueSkgY2hhcmFjdGVycywgYXMgbG9uZyBhcyBpdCBpcyBub3QgYW4gYW1wZXJzYW5kIHNpZ24gKCYpLiBDaGFyYWN0ZXJzIGFmdGVyIHN1Y2ggYW4gYW1wZXJzYW5kIHdvdWxkIGJlIGlnbm9yZWQgYW5kIGRvXG5cdCAqIG5vdCBiZWxvbmcgdG8gdGhlIGdyb3VwLiBBbHRlcm5hdGl2ZWx5LCB0aGUgc3RyaW5nIGFsc28gbWF5IGVuZC5cblx0ICovXG5cdHByaXZhdGUgX3JJQXBwU3RhdGVOZXcgPSBuZXcgUmVnRXhwKFwiWz8mXVwiICsgSUFQUF9TVEFURSArIFwiPShbXiZdKylcIik7XG5cblx0cHJpdmF0ZSBfbmF2aWdhdGVDYWxsYmFjazogRnVuY3Rpb24gfCB1bmRlZmluZWQ7XG5cblx0LyoqXG5cdCAqIFRlbXBvcmFyaWx5IGFkZGVkIGFnYWluIGJlY2F1c2UgYW4gYXBwbGljYXRpb24gd2FzIChpbGxlZ2lhbGx5KSByZWx5aW5nIG9uIGl0LiBTaG91bGQgYmUgcmVtb3ZlZCBhZ2Fpbiwgb25jZSB0aGUgYXBwIGlzIGNvcnJlY3RlZFxuXHQgKi9cblx0cHJpdmF0ZSBJQVBQX1NUQVRFID0gSUFQUF9TVEFURTtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3IgcmVxdWlyaW5nIGEgY29udHJvbGxlci9jb21wb25lbnQgb3duaW5nIHRoZSBuYXZpZ2F0aW9uIGhhbmRsZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvQ29udHJvbGxlciBVSTUgY29udHJvbGxlciB0aGF0IGNvbnRhaW5zIGEgcm91dGVyIGFuZCBhIGNvbXBvbmVudDsgdHlwaWNhbGx5IHRoZSBtYWluIGNvbnRyb2xsZXIgb2YgeW91ciBhcHBsaWNhdGlvbiwgZm9yXG5cdCAqICAgICAgICBleGFtcGxlLCBhIHN1YmNsYXNzIG9mIHRoZSBzYXAuY2Euc2NmbGQubWQuY29udHJvbGxlci5CYXNlRnVsbHNjcmVlbkNvbnRyb2xsZXIgaWYgc2NhZmZvbGRpbmcgaXMgdXNlZFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW3NNb2RlPXNhcC5mZS5uYXZpZ2F0aW9uLk1vZGUuT0RhdGFWNF0gTW9kZSB0byBiZSB1c2VkIHRvIGluZGljYXRlcyB0aGUgT2RhdGEgdmVyc2lvbiB1c2VkIGZvciBydW5ubmluZyB0aGUgTmF2aWdhdGlvbiBIYW5kbGVyLFxuXHQgKiAgICAgICAgc2VlIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5Nb2RlfS48YnI+XG5cdCAqIFx0XHQgIE5vdGU6IE1vZGUgaGFzIHRvIGJlIHNhcC5mZS5uYXZpZ2F0aW9uLk1vZGUuT0RhdGFWMiB3aGVuZXZlciB0aGlzIGNvbnN0cnVjdG9yIGlzIHVzZWQgdG8gaW5pdGlhbGl6ZSBhIE9EYXRhIFYyIGJhc2VkIHNlcnZpY2UuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBbc1BhcmFtSGFuZGxpbmdNb2RlPVNlbFZhcldpbnNdIE1vZGUgdG8gYmUgdXNlZCB0byBoYW5kbGUgY29uZmxpY3RzIHdoZW4gbWVyZ2luZyBVUkwgcGFyYW1ldGVycyBhbmQgdGhlIFNlbGVjdGlvblZhcmlhbnQgY2xhc3MsXG5cdCAqICAgICAgICBzZWUge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlBhcmFtSGFuZGxpbmdNb2RlfVxuXHQgKiBAdGhyb3dzIEFuIGluc3RhbmNlIG9mIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZFcnJvcn0gaW4gY2FzZSBvZiBpbnB1dCBlcnJvcnMuIFZhbGlkIGVycm9yIGNvZGVzIGFyZTogPHRhYmxlPlxuXHQgKiAgICAgICAgIDx0cj5cblx0ICogICAgICAgICA8dGggYWxpZ249XCJsZWZ0XCI+TmF2RXJyb3IgY29kZTwvdGg+XG5cdCAqICAgICAgICAgPHRoIGFsaWduPVwibGVmdFwiPkRlc2NyaXB0aW9uPC90aD5cblx0ICogICAgICAgICA8L3RyPlxuXHQgKiAgICAgICAgIDx0cj5cblx0ICogICAgICAgICA8dGQ+TmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9JTlBVVDwvdGQ+XG5cdCAqICAgICAgICAgPHRkPkluZGljYXRlcyB0aGF0IHRoZSBpbnB1dCBwYXJhbWV0ZXIgaXMgaW52YWxpZDwvdGQ+XG5cdCAqICAgICAgICAgPC90cj5cblx0ICogICAgICAgICA8L3RhYmxlPlxuXHQgKi9cblx0Y29uc3RydWN0b3Iob0NvbnRyb2xsZXI6IENvbnRyb2xsZXIgfCBVSUNvbXBvbmVudCwgc01vZGU/OiBzdHJpbmcsIHNQYXJhbUhhbmRsaW5nTW9kZT86IHN0cmluZykge1xuXHRcdHN1cGVyKCk7XG5cdFx0aWYgKCFvQ29udHJvbGxlcikge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9JTlBVVFwiKTtcblx0XHR9XG5cblx0XHRpZiAob0NvbnRyb2xsZXIgaW5zdGFuY2VvZiBVSUNvbXBvbmVudCkge1xuXHRcdFx0dGhpcy5vUm91dGVyID0gb0NvbnRyb2xsZXIuZ2V0Um91dGVyKCk7XG5cdFx0XHR0aGlzLm9Db21wb25lbnQgPSBvQ29udHJvbGxlcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHR5cGVvZiBvQ29udHJvbGxlci5nZXRPd25lckNvbXBvbmVudCAhPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVRcIik7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMub1JvdXRlciA9IHRoaXMuX2dldFJvdXRlcihvQ29udHJvbGxlcik7XG5cdFx0XHR0aGlzLm9Db21wb25lbnQgPSBvQ29udHJvbGxlci5nZXRPd25lckNvbXBvbmVudCgpO1xuXHRcdH1cblxuXHRcdC8vIHNwZWNpYWwgaGFuZGxpbmcgZm9yIFNtYXJ0VGVtcGxhdGVzXG5cdFx0aWYgKHRoaXMub0NvbXBvbmVudCAmJiB0aGlzLm9Db21wb25lbnQuZ2V0QXBwQ29tcG9uZW50KSB7XG5cdFx0XHR0aGlzLm9Db21wb25lbnQgPSB0aGlzLm9Db21wb25lbnQuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0fVxuXG5cdFx0aWYgKFxuXHRcdFx0dHlwZW9mIHRoaXMub1JvdXRlciA9PT0gXCJ1bmRlZmluZWRcIiB8fFxuXHRcdFx0dHlwZW9mIHRoaXMub0NvbXBvbmVudCA9PT0gXCJ1bmRlZmluZWRcIiB8fFxuXHRcdFx0dHlwZW9mIHRoaXMub0NvbXBvbmVudC5nZXRDb21wb25lbnREYXRhICE9PSBcImZ1bmN0aW9uXCJcblx0XHQpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVRcIik7XG5cdFx0fVxuXG5cdFx0aWYgKHNQYXJhbUhhbmRsaW5nTW9kZSA9PT0gUGFyYW1IYW5kbGluZ01vZGUuVVJMUGFyYW1XaW5zIHx8IHNQYXJhbUhhbmRsaW5nTW9kZSA9PT0gUGFyYW1IYW5kbGluZ01vZGUuSW5zZXJ0SW5TZWxPcHQpIHtcblx0XHRcdHRoaXMuc1BhcmFtSGFuZGxpbmdNb2RlID0gc1BhcmFtSGFuZGxpbmdNb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNQYXJhbUhhbmRsaW5nTW9kZSA9IFBhcmFtSGFuZGxpbmdNb2RlLlNlbFZhcldpbnM7IC8vIGRlZmF1bHRcblx0XHR9XG5cdFx0aWYgKHNNb2RlID09PSBNb2RlLk9EYXRhVjIpIHtcblx0XHRcdHRoaXMuX3NNb2RlID0gc01vZGU7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgc2hlbGwgbmF2aWdhdGlvbiBzZXJ2aWNlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgTmF2aWdhdGlvbiBzZXJ2aWNlXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0QXBwTmF2aWdhdGlvblNlcnZpY2UoKSB7XG5cdFx0cmV0dXJuIHNhcC51c2hlbGwuQ29udGFpbmVyLmdldFNlcnZpY2UoXCJDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvblwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHNoZWxsIG5hdmlnYXRpb24gc2VydmljZS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIE5hdmlnYXRpb24gc2VydmljZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldEFwcE5hdmlnYXRpb25TZXJ2aWNlQXN5bmMoKSB7XG5cdFx0cmV0dXJuIHNhcC51c2hlbGwuQ29udGFpbmVyLmdldFNlcnZpY2VBc3luYyhcIkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uXCIpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAob0Nyb3NzQXBwTmF2U2VydmljZTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvQ3Jvc3NBcHBOYXZTZXJ2aWNlO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyOiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBpcyBub3QgYXZhaWxhYmxlLlwiKTtcblx0XHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuTk8uWEFQUFNFUlZJQ0VcIik7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHJlZmVyZW5jZSB0byB0aGUgcm91dGVyIG9iamVjdCBmb3IgbmF2aWdhdGlvbiBmb3IgdGhpcyBnaXZlbiBDb250cm9sbGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRyb2xsZXIgVGhlIHJlZmVyZW5jZSB0byB0aGUgQ29udHJvbGxlciBmb3Igd2hpY2ggdGhlIFJvdXRlciBpbnN0YW5jZSBzaGFsbCBiZSBkZXRlcm1pbmVkLlxuXHQgKiBAcmV0dXJucyBUaGUgUm91dGVyIGZvciB0aGUgZ2l2ZW4gQ29udHJvbGxlclxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldFJvdXRlcihvQ29udHJvbGxlcjogQ29udHJvbGxlcikge1xuXHRcdHJldHVybiBVSUNvbXBvbmVudC5nZXRSb3V0ZXJGb3Iob0NvbnRyb2xsZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgbWV0aG9kIGlzIHRvIGJlIHVzZWQgb25seSBieSBGRSBWMiB0byBnZXQgYWNjZXNzIHRvIHRvRXh0ZXJuYWwgcHJvbWlzZS5cblx0ICpcblx0ICogQHBhcmFtIGZuQ2FsbGJhY2sgQ2FsbGJhY2sgdG8gYmUgY2FsbGVkIGJ5ICduYXZpZ2F0ZScgbWV0aG9kIGluIGNhc2Ugb2YgdG9FeHRlcm5hbCBpcyB1c2VkIHRvIG5hdmlnYXRlLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cmVnaXN0ZXJOYXZpZ2F0ZUNhbGxiYWNrKGZuQ2FsbGJhY2s6IEZ1bmN0aW9uKSB7XG5cdFx0dGhpcy5fbmF2aWdhdGVDYWxsYmFjayA9IGZuQ2FsbGJhY2s7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlcnMgYSBjcm9zcy1hcHAgbmF2aWdhdGlvbiBhZnRlciBzYXZpbmcgdGhlIGlubmVyIGFuZCB0aGUgY3Jvc3MtYXBwIHN0YXRlcy4gVGhlIG5hdmlnYXRpb24gbW9kZSBiYXNlZCBvblxuXHQgKiA8Y29kZT5zYXAtdXNoZWxsLW5leHQtbmF2bW9kZTwvY29kZT4gaXMgdGFrZW4gaW50byBhY2NvdW50LiBJZiBzZXQgdG8gPGNvZGU+ZXhwbGFjZTwvY29kZT4gdGhlIGlubmVyIGFwcCBzdGF0ZSB3aWxsIG5vdCBiZSBjaGFuZ2VkLlxuXHQgKiA8Yj5Ob3RlOjwvYj4gVGhlIDxjb2RlPnNOYXZNb2RlPC9jb2RlPiBhcmd1bWVudCBjYW4gYmUgdXNlZCB0byBvdmVyd3JpdGUgdGhlIFNBUCBGaW9yaSBsYXVuY2hwYWQgZGVmYXVsdCBuYXZpZ2F0aW9uIGZvciBvcGVuaW5nIGEgVVJMXG5cdCAqIGluLXBsYWNlIG9yIGV4LXBsYWNlLlxuXHQgKiA8YnI+XG5cdCAqIDxiPk5vZGU6PC9iPiBJZiB0aGUgPGNvZGU+b0V4dGVybmFsQXBwRGF0YTwvY29kZT4gcGFyYW1ldGVyIGlzIG5vdCBzdXBwbGllZCwgdGhlIGV4dGVybmFsIGFwcCBkYXRhIHdpbGwgYmUgY2FsY3VsYXRlZCBiYXNlZCBvblxuXHQgKiB0aGUgPGNvZGU+b0lubmVyQXBwRGF0YTwvY29kZT4gZGF0YS48YnI+XG5cdCAqIFNtYXJ0RmlsdGVyQmFyIGNvbnRyb2wgPGI+UGFyYW1ldGVyczo8L2I+IDx0YWJsZT5cblx0ICogPHRyPlxuXHQgKiA8dGQgYWxpZ249XCJjZW50ZXJcIj57b2JqZWN0fTwvdGQ+XG5cdCAqIDx0ZD48Yj5vRXJyb3I8L2I+PC90ZD5cblx0ICogPHRkPk5hdkVycm9yIG9iamVjdCAoaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSkgdGhhdCBkZXNjcmliZXMgd2hpY2gga2luZCBvZiBlcnJvciBvY2N1cnJlZDwvdGQ+XG5cdCAqIDx0cj5cblx0ICogPHRkIGFsaWduPVwiY2VudGVyXCI+e3N0cmluZ308L3RkPlxuXHQgKiA8dGQ+PGI+b0Vycm9yLmVycm9yQ29kZTwvYj48L3RkPlxuXHQgKiA8dGQ+Q29kZSB0byBpZGVudGlmeSB0aGUgZXJyb3I8L3RkPlxuXHQgKiA8dHI+XG5cdCAqIDx0ZCBhbGlnbj1cImNlbnRlclwiPntzdHJpbmd9PC90ZD5cblx0ICogPHRkPjxiPm9FcnJvci50eXBlPC9iPjwvdGQ+XG5cdCAqIDx0ZD5TZXZlcml0eSBvZiB0aGUgZXJyb3IgKGluZm8vd2FybmluZy9lcnJvcik8L3RkPlxuXHQgKiA8dHI+XG5cdCAqIDx0ZCBhbGlnbj1cImNlbnRlclwiPnthcnJheX08L3RkPlxuXHQgKiA8dGQ+PGI+b0Vycm9yLnBhcmFtczwvYj48L3RkPlxuXHQgKiA8dGQ+QW4gYXJyYXkgb2Ygb2JqZWN0cyAodHlwaWNhbGx5IHN0cmluZ3MpIHRoYXQgZGVzY3JpYmUgYWRkaXRpb25hbCB2YWx1ZSBwYXJhbWV0ZXJzIHJlcXVpcmVkIGZvciBnZW5lcmF0aW5nIHRoZSBtZXNzYWdlPC90ZD5cblx0ICogPC90YWJsZT4uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQGZ1bmN0aW9uIG5hdmlnYXRlXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlci5wcm90b3R5cGVcblx0ICogQHBhcmFtIHNTZW1hbnRpY09iamVjdCBOYW1lIG9mIHRoZSBzZW1hbnRpYyBvYmplY3Qgb2YgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIE5hbWUgb2YgdGhlIGFjdGlvbiBvZiB0aGUgdGFyZ2V0IGFwcFxuXHQgKiBAcGFyYW0gdk5hdmlnYXRpb25QYXJhbWV0ZXJzIE5hdmlnYXRpb24gcGFyYW1ldGVycyBhcyBhbiBvYmplY3Qgd2l0aCBrZXkvdmFsdWUgcGFpcnMgb3IgYXMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2Ygc3VjaCBhbiBvYmplY3QuIElmIHBhc3NlZCBhcyBhbiBvYmplY3QsIHRoZSBwcm9wZXJ0aWVzIGFyZSBub3QgY2hlY2tlZCBhZ2FpbnN0IHRoZSA8Y29kZT5Jc1BvdGVudGlhbFNlbnNpdGl2ZTwvY29kZT4gb3IgPGNvZGU+TWVhc3VyZTwvY29kZT4gdHlwZS5cblx0ICogQHBhcmFtIG9Jbm5lckFwcERhdGEgT2JqZWN0IGZvciBzdG9yaW5nIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGFwcFxuXHQgKiBAcGFyYW0gZm5PbkVycm9yIENhbGxiYWNrIHRoYXQgaXMgY2FsbGVkIGlmIGFuIGVycm9yIG9jY3VycyBkdXJpbmcgbmF2aWdhdGlvbiA8YnI+XG5cdCAqIEBwYXJhbSBvRXh0ZXJuYWxBcHBEYXRhIE9iamVjdCBmb3Igc3RvcmluZyB0aGUgc3RhdGUgd2hpY2ggd2lsbCBiZSBmb3J3YXJkZWQgdG8gdGhlIHRhcmdldCBjb21wb25lbnQuXG5cdCAqIEBwYXJhbSBvRXh0ZXJuYWxBcHBEYXRhLnByZXNlbnRhdGlvblZhcmlhbnQgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgdWkgc3RhdGUgb2YgdGhlIGFwcCB3aGljaCB3aWxsIGJlIGZvcndhcmRlZCB0byB0aGVcblx0ICogICAgICAgIHRhcmdldCBjb21wb25lbnQuXG5cdCAqIEBwYXJhbSBvRXh0ZXJuYWxBcHBEYXRhLnZhbHVlVGV4dHMgT2JqZWN0IGNvbnRhaW5pbmcgdmFsdWUgZGVzY3JpcHRpb25zIHdoaWNoIHdpbGwgYmUgZm9yd2FyZGVkIHRvIHRoZSB0YXJnZXQgY29tcG9uZW50LlxuXHQgKiBAcGFyYW0gb0V4dGVybmFsQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50IFN0cmluZ2lmaWVkIEpTT04gb2JqZWN0LCB3aGljaCB3aWxsIGJlIGZvcndhcmRlZCB0byB0aGUgdGFyZ2V0IGNvbXBvbmVudC4gSWYgbm90XG5cdCAqICAgICAgICBwcm92aWRlZCB0aGUgc2VsZWN0aW9uVmFyaWFudCB3aWxsIGJlIGNvbnN0cnVjdGVkIGJhc2VkIG9uIHRoZSB2TmF2aWdhdGlvblBhcmFtZXRlcnMuXG5cdCAqIEBwYXJhbSBzTmF2TW9kZSBBcmd1bWVudCBpcyB1c2VkIHRvIG92ZXJ3cml0ZSB0aGUgRkxQLWNvbmZpZ3VyZWQgdGFyZ2V0IGZvciBvcGVuaW5nIGEgVVJMLiBJZiB1c2VkLCBvbmx5IHRoZVxuXHQgKiAgICAgICAgPGNvZGU+ZXhwbGFjZTwvY29kZT4gb3IgPGNvZGU+aW5wbGFjZTwvY29kZT4gdmFsdWVzIGFyZSBhbGxvd2VkLiBBbnkgb3RoZXIgdmFsdWUgd2lsbCBsZWFkIHRvIGFuIGV4Y2VwdGlvblxuXHQgKiAgICAgICAgPGNvZGU+TmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9OQVZfTU9ERTwvY29kZT4uXG5cdCAqIEBleGFtcGxlIDxjb2RlPlxuXHQgKiBzYXAudWkuZGVmaW5lKFtcInNhcC9mZS9uYXZpZ2F0aW9uL05hdmlnYXRpb25IYW5kbGVyXCIsIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiXSwgZnVuY3Rpb24gKE5hdmlnYXRpb25IYW5kbGVyLCBTZWxlY3Rpb25WYXJpYW50KSB7XG5cdCAqIFx0dmFyIG9OYXZpZ2F0aW9uSGFuZGxlciA9IG5ldyBOYXZpZ2F0aW9uSGFuZGxlcihvQ29udHJvbGxlcik7XG5cdCAqIFx0dmFyIHNTZW1hbnRpY09iamVjdCA9IFwiU2FsZXNPcmRlclwiO1xuXHQgKiBcdHZhciBzQWN0aW9uTmFtZSA9IFwiY3JlYXRlXCI7XG5cdCAqXG5cdCAqIFx0Ly9zaW1wbGUgcGFyYW1ldGVycyBhcyBPYmplY3Rcblx0ICogXHR2YXIgdk5hdmlnYXRpb25QYXJhbWV0ZXJzID0ge1xuXHQgKiBcdFx0Q29tcGFueUNvZGUgOiBcIjAwMDFcIixcblx0ICogXHRcdEN1c3RvbWVyIDogXCJDMDAwMVwiXG5cdCAqIFx0fTtcblx0ICpcblx0ICogXHQvL29yIGFzIHNlbGVjdGlvbiB2YXJpYW50XG5cdCAqIFx0dmFyIG9TZWxlY3Rpb25WYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQoKTtcblx0ICpcdCBvU2VsZWN0aW9uVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oXCJDb21wYW55Q29kZVwiLCBcIklcIiwgXCJFUVwiLCBcIjAwMDFcIik7XG5cdCAqIFx0b1NlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKFwiQ3VzdG9tZXJcIiwgXCJJXCIsIFwiRVFcIiwgXCJDMDAwMVwiKTtcblx0ICogXHR2TmF2aWdhdGlvblBhcmFtZXRlcnMgPSBvU2VsZWN0aW9uVmFyaWFudC50b0pTT05TdHJpbmcoKTtcblx0ICpcblx0ICogXHQvL29yIGRpcmVjdGx5IGZyb20gU21hcnRGaWx0ZXJCYXJcblx0ICogXHR2TmF2aWdhdGlvblBhcmFtZXRlcnMgPSBvU21hcnRGaWx0ZXJCYXIuZ2V0RGF0YVN1aXRlRm9ybWF0KCk7XG5cdCAqXG5cdCAqIFx0Ly9hcHAgc3RhdGUgZm9yIGJhY2sgbmF2aWdhdGlvblxuXHQgKlx0IHZhciBvSW5uZXJBcHBEYXRhID0ge1xuXHQgKiBcdFx0c2VsZWN0aW9uVmFyaWFudCA6IG9TbWFydEZpbHRlckJhci5nZXREYXRhU3VpdGVGb3JtYXQoKSxcblx0ICogXHRcdHRhYmxlVmFyaWFudElkIDogb1NtYXJ0VGFibGUuZ2V0Q3VycmVudFZhcmlhbnRJZCgpLFxuXHQgKiBcdFx0Y3VzdG9tRGF0YSA6IG9NeUN1c3RvbURhdGFcblx0ICogXHR9O1xuXHQgKlxuXHQgKiBcdC8vIGNhbGxiYWNrIGZ1bmN0aW9uIGluIGNhc2Ugb2YgZXJyb3JzXG5cdCAqIFx0dmFyIGZuT25FcnJvciA9IGZ1bmN0aW9uKG9FcnJvcil7XG5cdCAqIFx0XHR2YXIgb2kxOG4gPSBvQ29udHJvbGxlci5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJpMThuXCIpLmdldFJlc291cmNlQnVuZGxlKCk7XG5cdCAqIFx0XHRvRXJyb3Iuc2V0VUlUZXh0KHtvaTE4biA6IG9pMThuLCBzVGV4dEtleSA6IFwiT1VUQk9VTkRfTkFWX0VSUk9SXCJ9KTtcblx0ICogXHRcdG9FcnJvci5zaG93TWVzc2FnZUJveCgpO1xuXHQgKiBcdH07XG5cdCAqXG5cdCAqIFx0b05hdmlnYXRpb25IYW5kbGVyLm5hdmlnYXRlKHNTZW1hbnRpY09iamVjdCwgc0FjdGlvbk5hbWUsIHZOYXZpZ2F0aW9uUGFyYW1ldGVycywgb0lubmVyQXBwRGF0YSwgZm5PbkVycm9yKTtcblx0ICogfSk7XG5cdCAqIDwvY29kZT5cblx0ICovXG5cdG5hdmlnYXRlKFxuXHRcdHNTZW1hbnRpY09iamVjdDogc3RyaW5nLFxuXHRcdHNBY3Rpb25OYW1lOiBzdHJpbmcsXG5cdFx0dk5hdmlnYXRpb25QYXJhbWV0ZXJzOiBvYmplY3QgfCBzdHJpbmcsXG5cdFx0b0lubmVyQXBwRGF0YT86IElubmVyQXBwRGF0YSxcblx0XHRmbk9uRXJyb3I/OiBGdW5jdGlvbixcblx0XHRvRXh0ZXJuYWxBcHBEYXRhPzoge1xuXHRcdFx0dmFsdWVUZXh0cz86IG9iamVjdCB8IHVuZGVmaW5lZDtcblx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnQ/OiBvYmplY3QgfCB1bmRlZmluZWQ7XG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50Pzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdH0sXG5cdFx0c05hdk1vZGU/OiBzdHJpbmdcblx0KSB7XG5cdFx0bGV0IHNTZWxlY3Rpb25WYXJpYW50OiBhbnksXG5cdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdG9YQXBwRGF0YU9iajogYW55LFxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzLFxuXHRcdFx0YkV4UGxhY2UgPSBmYWxzZSxcblx0XHRcdG9UbXBEYXRhOiBhbnkgPSB7fTtcblx0XHRjb25zdCBvTmF2SGFuZGxlcjogTmF2aWdhdGlvbkhhbmRsZXIgPSB0aGlzO1xuXG5cdFx0Y29uc3Qgb0NvbXBvbmVudERhdGEgPSB0aGlzLm9Db21wb25lbnQuZ2V0Q29tcG9uZW50RGF0YSgpO1xuXHRcdC8qXG5cdFx0ICogVGhlcmUgYXJlIHNvbWUgcmFjZSBjb25kaXRpb25zIHdoZXJlIHRoZSBvQ29tcG9uZW50RGF0YSBtYXkgbm90IGJlIHNldCwgZm9yIGV4YW1wbGUgaW4gY2FzZSB0aGUgVVNoZWxsIHdhcyBub3QgaW5pdGlhbGl6ZWQgcHJvcGVybHkuIFRvXG5cdFx0ICogbWFrZSBzdXJlIHRoYXQgd2UgZG8gbm90IGR1bXAgaGVyZSB3aXRoIGFuIGV4Y2VwdGlvbiwgd2UgdGFrZSB0aGlzIHNwZWNpYWwgZXJyb3IgaGFuZGxpbmcgYmVoYXZpb3I6XG5cdFx0ICovXG5cdFx0aWYgKG9Db21wb25lbnREYXRhKSB7XG5cdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnMgPSBvQ29tcG9uZW50RGF0YS5zdGFydHVwUGFyYW1ldGVycztcblxuXHRcdFx0aWYgKFxuXHRcdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnMgJiZcblx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzW1wic2FwLXVzaGVsbC1uZXh0LW5hdm1vZGVcIl0gJiZcblx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzW1wic2FwLXVzaGVsbC1uZXh0LW5hdm1vZGVcIl0ubGVuZ3RoID4gMFxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIGJFeFBsYWNlID0gKEpTT04ucGFyc2Uob1N0YXJ0dXBQYXJhbWV0ZXJzW1wic2FwLXVzaGVsbC1uZXh0LW5hdm1vZGVcIl1bMF0pID09PSBcImV4cGxhY2VcIik7XG5cdFx0XHRcdGJFeFBsYWNlID0gb1N0YXJ0dXBQYXJhbWV0ZXJzW1wic2FwLXVzaGVsbC1uZXh0LW5hdm1vZGVcIl1bMF0gPT09IFwiZXhwbGFjZVwiO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIG9ubHkgbmF2LW1vZGUgJ2lucGxhY2UnIG9yICdleHBsYWNlJyBhcmUgc3VwcG9ydGVkLiBBbnkgb3RoZXIgdmFsdWUgd2lsbCBsZWFkIHRvIGFuIGV4Y2VwdGlvbi5cblx0XHRpZiAoc05hdk1vZGUgJiYgKHNOYXZNb2RlID09PSBcImlucGxhY2VcIiB8fCBzTmF2TW9kZSA9PT0gXCJleHBsYWNlXCIpKSB7XG5cdFx0XHRiRXhQbGFjZSA9IHNOYXZNb2RlID09PSBcImV4cGxhY2VcIjtcblx0XHR9IGVsc2UgaWYgKHNOYXZNb2RlKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX05BVl9NT0RFXCIpO1xuXHRcdH1cblxuXHRcdGlmIChvRXh0ZXJuYWxBcHBEYXRhID09PSB1bmRlZmluZWQgfHwgb0V4dGVybmFsQXBwRGF0YSA9PT0gbnVsbCkge1xuXHRcdFx0b1hBcHBEYXRhT2JqID0ge307XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9YQXBwRGF0YU9iaiA9IG9FeHRlcm5hbEFwcERhdGE7XG5cdFx0fVxuXG5cdFx0Ly8gZm9yIG5hdmlnYXRpb24gd2UgbmVlZCBVUkwgcGFyYW1ldGVycyAobGVnYWN5IG5hdmlnYXRpb24pIGFuZCBzYXAteGFwcC1zdGF0ZSwgdGhlcmVmb3JlIHdlIG5lZWQgdG8gY3JlYXRlIHRoZSBtaXNzaW5nIG9uZSBmcm9tIHRoZVxuXHRcdC8vIHBhc3NlZCBvbmVcblx0XHRpZiAodHlwZW9mIHZOYXZpZ2F0aW9uUGFyYW1ldGVycyA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0c1NlbGVjdGlvblZhcmlhbnQgPSB2TmF2aWdhdGlvblBhcmFtZXRlcnM7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2Ygdk5hdmlnYXRpb25QYXJhbWV0ZXJzID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRjb25zdCBvRW5yaWNoZWRTZWxWYXIgPSB0aGlzLl9zcGxpdEluYm91bmROYXZpZ2F0aW9uUGFyYW1ldGVycyhcblx0XHRcdFx0bmV3IFNlbGVjdGlvblZhcmlhbnQoKSxcblx0XHRcdFx0dk5hdmlnYXRpb25QYXJhbWV0ZXJzLFxuXHRcdFx0XHRbXVxuXHRcdFx0KS5vTmF2aWdhdGlvblNlbFZhcjtcblx0XHRcdHNTZWxlY3Rpb25WYXJpYW50ID0gb0VucmljaGVkU2VsVmFyLnRvSlNPTlN0cmluZygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdH1cblxuXHRcdG9UbXBEYXRhLnNlbGVjdGlvblZhcmlhbnQgPSBuZXcgU2VsZWN0aW9uVmFyaWFudChzU2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0aWYgKHR5cGVvZiB2TmF2aWdhdGlvblBhcmFtZXRlcnMgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdG9UbXBEYXRhLnNlbGVjdGlvblZhcmlhbnQgPSB0aGlzLl9yZW1vdmVUZWNobmljYWxQYXJhbWV0ZXJzKG9UbXBEYXRhLnNlbGVjdGlvblZhcmlhbnQpO1xuXHRcdH1cblx0XHRvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50ID0gb1RtcERhdGEuc2VsZWN0aW9uVmFyaWFudCAmJiBvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50LnRvSlNPTk9iamVjdCgpO1xuXHRcdG9UbXBEYXRhID0gdGhpcy5fcmVtb3ZlTWVhc3VyZUJhc2VkSW5mb3JtYXRpb24ob1RtcERhdGEpOyAvLyByZW1vdmUgZXZlbnR1YWwgbWVhc3VyZXNcblx0XHRvVG1wRGF0YSA9IHRoaXMuX2NoZWNrSXNQb3RlbnRpYWxseVNlbnNpdGl2ZShvVG1wRGF0YSk7IC8vIHJlbW92ZSBldmVudHVhbCBzZW5zaXRpdmUgZGF0YVxuXG5cdFx0aWYgKG9UbXBEYXRhLnNlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRcdG1QYXJhbWV0ZXJzID0gdGhpcy5fZ2V0VVJMUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50KG5ldyBTZWxlY3Rpb25WYXJpYW50KG9UbXBEYXRhLnNlbGVjdGlvblZhcmlhbnQpKTtcblx0XHRcdHNTZWxlY3Rpb25WYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQob1RtcERhdGEuc2VsZWN0aW9uVmFyaWFudCkudG9KU09OU3RyaW5nKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1QYXJhbWV0ZXJzID0ge307XG5cdFx0XHRzU2VsZWN0aW9uVmFyaWFudCA9IG51bGw7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb05hdkFyZ3VtZW50czogYW55ID0ge1xuXHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdHNlbWFudGljT2JqZWN0OiBzU2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdGFjdGlvbjogc0FjdGlvbk5hbWVcblx0XHRcdH0sXG5cdFx0XHRwYXJhbXM6IG1QYXJhbWV0ZXJzIHx8IHt9XG5cdFx0fTtcblxuXHRcdGNvbnN0IGZuTmF2aWdhdGUgPSBmdW5jdGlvbiAob0Nyb3NzQXBwTmF2U2VydmljZTogYW55KSB7XG5cdFx0XHRpZiAoIW9YQXBwRGF0YU9iai5zZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0XHRcdG9YQXBwRGF0YU9iai5zZWxlY3Rpb25WYXJpYW50ID0gc1NlbGVjdGlvblZhcmlhbnQ7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGZuTmF2RXhwbGFjZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Y29uc3Qgc05ld0hyZWZQcm9taXNlID0gb0Nyb3NzQXBwTmF2U2VydmljZS5ocmVmRm9yRXh0ZXJuYWxBc3luYyhvTmF2QXJndW1lbnRzLCBvTmF2SGFuZGxlci5vQ29tcG9uZW50KTtcblx0XHRcdFx0c05ld0hyZWZQcm9taXNlXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHNOZXdIcmVmOiBhbnkpIHtcblx0XHRcdFx0XHRcdG9wZW5XaW5kb3coc05ld0hyZWYpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmV0aXJldmluZyBocmVmRm9yRXh0ZXJuYWwgOiBcIiArIG9FcnJvcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXG5cdFx0XHRvWEFwcERhdGFPYmogPSBvTmF2SGFuZGxlci5fcmVtb3ZlTWVhc3VyZUJhc2VkSW5mb3JtYXRpb24ob1hBcHBEYXRhT2JqKTtcblx0XHRcdHJldHVybiBvTmF2SGFuZGxlci5fZm5TYXZlQXBwU3RhdGVBc3luYyhvWEFwcERhdGFPYmosIGZuT25FcnJvcikudGhlbihmdW5jdGlvbiAob1NhdmVBcHBTdGF0ZVJldHVybjogYW55KSB7XG5cdFx0XHRcdGlmIChvU2F2ZUFwcFN0YXRlUmV0dXJuKSB7XG5cdFx0XHRcdFx0b05hdkFyZ3VtZW50cy5hcHBTdGF0ZUtleSA9IG9TYXZlQXBwU3RhdGVSZXR1cm4uYXBwU3RhdGVLZXk7XG5cblx0XHRcdFx0XHQvLyBSZW1hcms6XG5cdFx0XHRcdFx0Ly8gVGhlIENyb3NzIEFwcCBTZXJ2aWNlIHRha2VzIGNhcmUgb2YgZW5jb2RpbmcgcGFyYW1ldGVyIGtleXMgYW5kIHZhbHVlcy4gRXhhbXBsZTpcblx0XHRcdFx0XHQvLyBtUGFyYW1zID0geyBcIiRAJVwiIDogXCImLz1cIiB9IHJlc3VsdHMgaW4gdGhlIFVSTCBwYXJhbWV0ZXIgJTI1MjQlMjU0MCUyNTI1PSUyNTI2JTI1MkYlMjUzRFxuXHRcdFx0XHRcdC8vIE5vdGUgdGhlIGRvdWJsZSBlbmNvZGluZywgdGhpcyBpcyBjb3JyZWN0LlxuXG5cdFx0XHRcdFx0Ly8gdG9FeHRlcm5hbCBzZXRzIHNhcC14YXBwLXN0YXRlIGluIHRoZSBVUkwgaWYgYXBwU3RhdGVLZXkgaXMgcHJvdmlkZWQgaW4gb05hdkFyZ3VtZW50c1xuXHRcdFx0XHRcdC8vIHRvRXh0ZXJuYWwgaGFzIGlzc3VlcyBvbiBzdGlja3kgYXBwcyBGSU9SSVRFQ0hQMS0xNDQwMCwgdGVtcCBmaXggdXNpbmcgaHJlZkZvckV4dGVybmFsXG5cdFx0XHRcdFx0aWYgKHNOYXZNb2RlID09IFwiZXhwbGFjZVwiKSB7XG5cdFx0XHRcdFx0XHRmbk5hdkV4cGxhY2UoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgcHRvRXh0ID0gb0Nyb3NzQXBwTmF2U2VydmljZS50b0V4dGVybmFsKG9OYXZBcmd1bWVudHMsIG9OYXZIYW5kbGVyLm9Db21wb25lbnQpO1xuXHRcdFx0XHRcdFx0Ly8gVE9ETzogVGhpcyBpcyBqdXN0IGEgdGVtcG9yYXJ5IHNvbHV0aW9uIHRvIGFsbG93IEZFIFYyIHRvIHVzZSB0b0V4dGVybmFsIHByb21pc2UuXG5cdFx0XHRcdFx0XHRpZiAob05hdkhhbmRsZXIuX25hdmlnYXRlQ2FsbGJhY2spIHtcblx0XHRcdFx0XHRcdFx0b05hdkhhbmRsZXIuX25hdmlnYXRlQ2FsbGJhY2socHRvRXh0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gLy8gZWxzZSA6IGVycm9yIHdhcyBhbHJlYWR5IHJlcG9ydGVkXG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdGNvbnN0IGZuU3RvcmVBbmROYXZpZ2F0ZSA9IGZ1bmN0aW9uIChvQ3Jvc3NBcHBOYXZTZXJ2aWNlOiBhbnkpIHtcblx0XHRcdG9OYXZIYW5kbGVyXG5cdFx0XHRcdC5zdG9yZUlubmVyQXBwU3RhdGVBc3luYyhvSW5uZXJBcHBEYXRhIGFzIGFueSwgdHJ1ZSlcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHNBcHBTdGF0ZUtleTogYW55KSB7XG5cdFx0XHRcdFx0aWYgKHNBcHBTdGF0ZUtleSkge1xuXHRcdFx0XHRcdFx0b05hdkhhbmRsZXIucmVwbGFjZUhhc2goc0FwcFN0YXRlS2V5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIGZuTmF2aWdhdGUob0Nyb3NzQXBwTmF2U2VydmljZSk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAoZm5PbkVycm9yKSB7XG5cdFx0XHRcdFx0XHRmbk9uRXJyb3Iob0Vycm9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdH07XG5cdFx0aWYgKHNOYXZNb2RlKSB7XG5cdFx0XHRvTmF2QXJndW1lbnRzLnBhcmFtc1tcInNhcC11c2hlbGwtbmF2bW9kZVwiXSA9IGJFeFBsYWNlID8gXCJleHBsYWNlXCIgOiBcImlucGxhY2VcIjtcblx0XHR9XG5cdFx0b05hdkhhbmRsZXJcblx0XHRcdC5fZ2V0QXBwTmF2aWdhdGlvblNlcnZpY2VBc3luYygpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAob0Nyb3NzQXBwTmF2U2VydmljZTogYW55KSB7XG5cdFx0XHRcdGNvbnN0IG9TdXBwb3J0ZWRQcm9taXNlID0gb0Nyb3NzQXBwTmF2U2VydmljZS5pc05hdmlnYXRpb25TdXBwb3J0ZWQoW29OYXZBcmd1bWVudHNdLCBvTmF2SGFuZGxlci5vQ29tcG9uZW50KTtcblx0XHRcdFx0b1N1cHBvcnRlZFByb21pc2UuZG9uZShmdW5jdGlvbiAob1RhcmdldHM6IGFueSkge1xuXHRcdFx0XHRcdGlmIChvVGFyZ2V0c1swXS5zdXBwb3J0ZWQpIHtcblx0XHRcdFx0XHRcdGlmICghYkV4UGxhY2UpIHtcblx0XHRcdFx0XHRcdFx0Zm5TdG9yZUFuZE5hdmlnYXRlKG9Dcm9zc0FwcE5hdlNlcnZpY2UpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Zm5OYXZpZ2F0ZShvQ3Jvc3NBcHBOYXZTZXJ2aWNlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2UgaWYgKGZuT25FcnJvcikge1xuXHRcdFx0XHRcdFx0Ly8gaW50ZW50IGlzIG5vdCBzdXBwb3J0ZWRcblx0XHRcdFx0XHRcdGNvbnN0IG9FcnJvciA9IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLmlzSW50ZW50U3VwcG9ydGVkLm5vdFN1cHBvcnRlZFwiKTtcblx0XHRcdFx0XHRcdGZuT25FcnJvcihvRXJyb3IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKGZuT25FcnJvcikge1xuXHRcdFx0XHRcdG9TdXBwb3J0ZWRQcm9taXNlLmZhaWwoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0Ly8gdGVjaG5pY2FsIGVycm9yOiBjb3VsZCBub3QgZGV0ZXJtaW5lIGlmIGludGVudCBpcyBzdXBwb3J0ZWRcblx0XHRcdFx0XHRcdGNvbnN0IG9FcnJvciA9IG9OYXZIYW5kbGVyLl9jcmVhdGVUZWNobmljYWxFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLmlzSW50ZW50U3VwcG9ydGVkLmZhaWxlZFwiKTtcblx0XHRcdFx0XHRcdGZuT25FcnJvcihvRXJyb3IpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRpZiAoZm5PbkVycm9yKSB7XG5cdFx0XHRcdFx0Zm5PbkVycm9yKG9FcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgaW5jb21pbmcgVVJMIGFuZCByZXR1cm5zIGEgUHJvbWlzZS4gSWYgdGhpcyBtZXRob2QgZGV0ZWN0cyBhIGJhY2sgbmF2aWdhdGlvbiwgdGhlIGlubmVyIGFwcCBzdGF0ZSBpcyByZXR1cm5lZCBpbiB0aGUgcmVzb2x2ZWRcblx0ICogUHJvbWlzZS4gT3RoZXJ3aXNlIHN0YXJ0dXAgcGFyYW1ldGVycyB3aWxsIGJlIG1lcmdlZCBpbnRvIHRoZSBhcHAgc3RhdGUgcHJvdmlkZWQgYnkgY3Jvc3MgYXBwIG5hdmlnYXRpb24sIGFuZCBhIGNvbWJpbmVkIGFwcCBzdGF0ZSB3aWxsIGJlXG5cdCAqIHJldHVybmVkLiBUaGUgY29uZmxpY3QgcmVzb2x1dGlvbiBjYW4gYmUgaW5mbHVlbmNlZCB3aXRoIHNQYXJhbUhhbmRsaW5nTW9kZSBkZWZpbmVkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICpcblx0ICogQHJldHVybnMgQSBQcm9taXNlIG9iamVjdCB0byBtb25pdG9yIHdoZW4gYWxsIHRoZSBhY3Rpb25zIG9mIHRoZSBmdW5jdGlvbiBoYXZlIGJlZW4gZXhlY3V0ZWQuIElmIHRoZSBleGVjdXRpb24gaXMgc3VjY2Vzc2Z1bCwgdGhlXG5cdCAqICAgICAgICAgIGV4dHJhY3RlZCBhcHAgc3RhdGUsIHRoZSBzdGFydHVwIHBhcmFtZXRlcnMsIGFuZCB0aGUgdHlwZSBvZiBuYXZpZ2F0aW9uIGFyZSByZXR1cm5lZCwgc2VlIGFsc28gdGhlIGV4YW1wbGUgYWJvdmUuIFRoZSBhcHAgc3RhdGUgaXNcblx0ICogICAgICAgICAgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGZvbGxvd2luZyBpbmZvcm1hdGlvbjpcblx0ICogICAgICAgICAgPHVsPlxuXHQgKiAgICAgICAgICA8bGk+PGNvZGU+b0FwcERhdGEub1NlbGVjdGlvblZhcmlhbnQ8L2NvZGU+OiBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uU2VsZWN0aW9uVmFyaWFudH1cblx0ICogICAgICAgICAgY29udGFpbmluZyBvbmx5IHBhcmFtZXRlcnMvc2VsZWN0IG9wdGlvbnMgdGhhdCBhcmUgcmVsYXRlZCB0byBuYXZpZ2F0aW9uPC9saT5cblx0ICogICAgICAgICAgPGxpPjxjb2RlPm9BcHBEYXRhLnNlbGVjdGlvblZhcmlhbnQ8L2NvZGU+OiBUaGUgbmF2aWdhdGlvbi1yZWxhdGVkIHNlbGVjdGlvbiB2YXJpYW50IGFzIGEgSlNPTi1mb3JtYXR0ZWQgc3RyaW5nPC9saT5cblx0ICogICAgICAgICAgPGxpPjxjb2RlPm9BcHBEYXRhLm9EZWZhdWx0ZWRTZWxlY3Rpb25WYXJpYW50PC9jb2RlPjogQW4gaW5zdGFuY2Ugb2Zcblx0ICogICAgICAgICAge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlNlbGVjdGlvblZhcmlhbnR9IGNvbnRhaW5pbmcgb25seSB0aGUgcGFyYW1ldGVycy9zZWxlY3Qgb3B0aW9ucyB0aGF0IGFyZSBzZXQgYnkgdXNlclxuXHQgKiAgICAgICAgICBkZWZhdWx0IGRhdGE8L2xpPlxuXHQgKiAgICAgICAgICA8bGk+PGNvZGU+b0FwcERhdGEuYk5hdlNlbFZhckhhc0RlZmF1bHRzT25seTwvY29kZT46IEEgQm9vbGVhbiBmbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgb25seSBkZWZhdWx0ZWQgcGFyYW1ldGVycyBhbmQgbm9cblx0ICogICAgICAgICAgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzIGFyZSBwcmVzZW50Ljxicj5cblx0ICogICAgICAgICAgPGI+Tm90ZTo8L2I+IElmIG5vIG5hdmlnYXRpb24gcGFyYW1ldGVycyBhcmUgYXZhaWxhYmxlLCA8Y29kZT5iTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5PC9jb2RlPiBpcyBzZXQgdG8gPGNvZGU+dHJ1ZTwvY29kZT4sXG5cdCAqICAgICAgICAgIGV2ZW4gdGhvdWdoIHBhcmFtZXRlcnMgd2l0aG91dCBkZWZhdWx0IG1pZ2h0IGJlIGF2YWlsYWJsZSBhcyB3ZWxsLjwvbGk+XG5cdCAqICAgICAgICAgIDwvdWw+XG5cdCAqICAgICAgICAgIElmIHRoZSBuYXZpZ2F0aW9uLXJlbGF0ZWQgc2VsZWN0aW9uIHZhcmlhbnQgaXMgZW1wdHksIGl0IGlzIHJlcGxhY2VkIGJ5IGEgY29weSBvZiB0aGUgZGVmYXVsdGVkIHNlbGVjdGlvbiB2YXJpYW50Ljxicj5cblx0ICogICAgICAgICAgVGhlIG5hdmlnYXRpb24gdHlwZSBpcyBhbiBlbnVtZXJhdGlvbiB0eXBlIG9mIHR5cGUge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdlR5cGV9IChwb3NzaWJsZSB2YWx1ZXMgYXJlXG5cdCAqICAgICAgICAgIGluaXRpYWwsIFVSTFBhcmFtcywgeEFwcFN0YXRlLCBhbmQgaUFwcFN0YXRlKS48YnI+XG5cdCAqICAgICAgICAgIDxiPk5vdGU6PC9iPiBJZiB0aGUgbmF2aWdhdGlvbiB0eXBlIGlzIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZUeXBlLmlBcHBTdGF0ZX0gb0FwcERhdGEgaGFzIHR3b1xuXHQgKiAgICAgICAgICBhZGRpdGlvbmFsIHByb3BlcnRpZXNcblx0ICogICAgICAgICAgPHVsPlxuXHQgKiAgICAgICAgICA8bGk+PGNvZGU+b0FwcERhdGEudGFibGVWYXJpYW50SWQ8L2NvZGU+PC9saT5cblx0ICogICAgICAgICAgPGxpPjxjb2RlPm9BcHBEYXRhLmN1c3RvbURhdGE8L2NvZGU+PC9saT5cblx0ICogICAgICAgICAgPC91bD5cblx0ICogICAgICAgICAgd2hpY2ggcmV0dXJuIHRoZSBpbm5lciBhcHAgZGF0YSBhcyBzdG9yZWQgaW4ge0BsaW5rICMubmF2aWdhdGUgbmF2aWdhdGV9IG9yIHtAbGluayAjLnN0b3JlSW5uZXJBcHBTdGF0ZUFzeW5jIHN0b3JlSW5uZXJBcHBTdGF0ZUFzeW5jfS5cblx0ICogICAgICAgICAgPGNvZGU+b0FwcERhdGEub0RlZmF1bHRlZFNlbGVjdGlvblZhcmlhbnQ8L2NvZGU+IGlzIGFuIGVtcHR5IHNlbGVjdGlvbiB2YXJpYW50IGFuZFxuXHQgKiAgICAgICAgICA8Y29kZT5vQXBwRGF0YS5iTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5PC9jb2RlPiBpcyA8Y29kZT5mYWxzZTwvY29kZT4gaW4gdGhpcyBjYXNlLjxicj5cblx0ICogICAgICAgICAgPGI+Tm90ZTo8L2I+IElmIHRoZSBuYXZpZ2F0aW9uIHR5cGUgaXMge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdlR5cGUuaW5pdGlhbH0gb0FwcERhdGEgaXMgYW4gZW1wdHkgb2JqZWN0ITxicj5cblx0ICogICAgICAgICAgSWYgYW4gZXJyb3Igb2NjdXJzLCBhbiBlcnJvciBvYmplY3Qgb2YgdHlwZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9LCBVUkwgcGFyYW1ldGVycyAoaWYgYXZhaWxhYmxlKVxuXHQgKiAgICAgICAgICBhbmQgdGhlIHR5cGUgb2YgbmF2aWdhdGlvbiBhcmUgcmV0dXJuZWQuXG5cdCAqIEBwdWJsaWNcblx0ICogQGV4YW1wbGUgPGNvZGU+XG5cdCAqIHNhcC51aS5kZWZpbmUoW1wic2FwL2ZlL25hdmlnYXRpb24vTmF2aWdhdGlvbkhhbmRsZXJcIl0sIGZ1bmN0aW9uIChOYXZpZ2F0aW9uSGFuZGxlcikge1xuXHQgKiBcdHZhciBvTmF2aWdhdGlvbkhhbmRsZXIgPSBuZXcgTmF2aWdhdGlvbkhhbmRsZXIob0NvbnRyb2xsZXIpO1xuXHQgKiBcdHZhciBvUGFyc2VOYXZpZ2F0aW9uUHJvbWlzZSA9IG9OYXZpZ2F0aW9uSGFuZGxlci5wYXJzZU5hdmlnYXRpb24oKTtcblx0ICpcblx0ICogXHRvUGFyc2VOYXZpZ2F0aW9uUHJvbWlzZS5kb25lKGZ1bmN0aW9uKG9BcHBEYXRhLCBvU3RhcnR1cFBhcmFtZXRlcnMsIHNOYXZUeXBlKXtcblx0ICogXHRcdFx0b1NtYXJ0RmlsdGVyQmFyLnNldERhdGFTdWl0ZUZvcm1hdChvQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50KTtcblx0ICogXHRcdFx0Ly8gb0FwcERhdGEub1NlbGVjdGlvblZhcmlhbnQgY2FuIGJlIHVzZWQgdG8gbWFuaXB1bGF0ZSB0aGUgc2VsZWN0aW9uIHZhcmlhbnRcblx0ICogXHRcdFx0Ly8gb0FwcERhdGEub0RlZmF1bHRlZFNlbGVjdGlvblZhcmlhbnQgY29udGFpbnMgdGhlIHBhcmFtZXRlcnMgd2hpY2ggYXJlIHNldCBieSB1c2VyIGRlZmF1bHRzXG5cdCAqIFx0XHRcdC8vIG9BcHBEYXRhLmJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHkgaW5kaWNhdGVzIHdoZXRoZXIgb25seSBkZWZhdWx0ZWQgcGFyYW1ldGVycyBhbmQgbm8gbmF2aWdhdGlvbiBwYXJhbWV0ZXJzIGFyZSBwcmVzZW50XG5cdCAqIFx0fSk7XG5cdCAqIFx0b1BhcnNlTmF2aWdhdGlvblByb21pc2UuZmFpbChmdW5jdGlvbihvRXJyb3IsIG9VUkxQYXJhbWV0ZXJzLCBzTmF2VHlwZSl7XG5cdCAqIFx0XHQvLyBpZiBlLmcuIHRoZSB4YXBwIHN0YXRlIGNvdWxkIG5vdCBiZSBsb2FkZWQsIG5ldmVydGhlbGVzcyB0aGVyZSBtYXkgYmUgVVJMIHBhcmFtZXRlcnMgYXZhaWxhYmxlXG5cdCAqIFx0XHQvL3NvbWUgZXJyb3IgaGFuZGxpbmdcblx0ICogXHR9KTtcblx0ICogfSk7XG5cdCAqIDwvY29kZT5cblx0ICovXG5cdHBhcnNlTmF2aWdhdGlvbigpIHtcblx0XHRjb25zdCBzQXBwSGFzaCA9IEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkuZ2V0SGFzaCgpO1xuXHRcdC8qXG5cdFx0ICogdXNlIC5nZXRIYXNoKCkgaGVyZSBpbnN0ZWFkIG9mIC5nZXRBcHBIYXNoKCkgdG8gYWxzbyBiZSBhYmxlIGRlYWxpbmcgd2l0aCBlbnZpcm9ubWVudHMgd2hlcmUgb25seSBTQVBVSTUgaXMgbG9hZGVkIGFuZCB0aGUgVVNoZWxsIGlzXG5cdFx0ICogbm90IGluaXRpYWxpemVkIHByb3Blcmx5LlxuXHRcdCAqL1xuXHRcdGNvbnN0IHNJQXBwU3RhdGUgPSB0aGlzLl9nZXRJbm5lckFwcFN0YXRlS2V5KHNBcHBIYXNoKTtcblxuXHRcdGxldCBvQ29tcG9uZW50RGF0YSA9IHRoaXMub0NvbXBvbmVudC5nZXRDb21wb25lbnREYXRhKCk7XG5cdFx0Lypcblx0XHQgKiBUaGVyZSBhcmUgc29tZSByYWNlIGNvbmRpdGlvbnMgd2hlcmUgdGhlIG9Db21wb25lbnREYXRhIG1heSBub3QgYmUgc2V0LCBmb3IgZXhhbXBsZSBpbiBjYXNlIHRoZSBVU2hlbGwgd2FzIG5vdCBpbml0aWFsaXplZCBwcm9wZXJseS4gVG9cblx0XHQgKiBtYWtlIHN1cmUgdGhhdCB3ZSBkbyBub3QgZHVtcCBoZXJlIHdpdGggYW4gZXhjZXB0aW9uLCB3ZSB0YWtlIHRoaXMgc3BlY2lhbCBlcnJvciBoYW5kbGluZyBiZWhhdmlvcjpcblx0XHQgKi9cblx0XHRpZiAob0NvbXBvbmVudERhdGEgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJUaGUgbmF2aWdhdGlvbiBDb21wb25lbnQncyBkYXRhIHdhcyBub3Qgc2V0IHByb3Blcmx5OyBhc3N1bWluZyBpbnN0ZWFkIHRoYXQgbm8gcGFyYW1ldGVycyBhcmUgcHJvdmlkZWQuXCIpO1xuXHRcdFx0b0NvbXBvbmVudERhdGEgPSB7fTtcblx0XHR9XG5cblx0XHQvLyBSZW1hcms6XG5cdFx0Ly8gVGhlIHN0YXJ0dXAgcGFyYW1ldGVycyBhcmUgYWxyZWFkeSBkZWNvZGVkLiBFeGFtcGxlOlxuXHRcdC8vIFRoZSBvcmlnaW5hbCBVUkwgcGFyYW1ldGVyICUyNTI0JTI1NDAlMjUyNT0lMjUyNiUyNTJGJTI1M0QgcmVzdWx0cyBpbiBvU3RhcnR1cFBhcmFtZXRlcnMgPSB7IFwiJEAlXCIgOiBcIiYvPVwiIH1cblx0XHQvLyBOb3RlIHRoZSBkb3VibGUgZW5jb2RpbmcgaW4gdGhlIFVSTCwgdGhpcyBpcyBjb3JyZWN0LiBBbiBVUkwgcGFyYW1ldGVyIGxpa2UgeHl6PSUyNSBjYXVzZXMgYW4gXCJVUkkgbWFsZm9ybWVkXCIgZXJyb3IuXG5cdFx0Ly8gSWYgdGhlIGRlY29kZWQgdmFsdWUgc2hvdWxkIGJlIGUuZy4gXCIlMjVcIiwgdGhlIHBhcmFtZXRlciBpbiB0aGUgVVJMIG5lZWRzIHRvIGJlOiB4eXo9JTI1MjUyNVxuXHRcdGNvbnN0IG9TdGFydHVwUGFyYW1ldGVycyA9IG9Db21wb25lbnREYXRhLnN0YXJ0dXBQYXJhbWV0ZXJzO1xuXG5cdFx0bGV0IGFEZWZhdWx0ZWRQYXJhbWV0ZXJzOiBhbnkgPSBbXTtcblx0XHRpZiAoXG5cdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnMgJiZcblx0XHRcdG9TdGFydHVwUGFyYW1ldGVyc1tERUZBVUxURURfUEFSQU1FVEVSX1BST1BFUlRZXSAmJlxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzW0RFRkFVTFRFRF9QQVJBTUVURVJfUFJPUEVSVFldLmxlbmd0aCA+IDBcblx0XHQpIHtcblx0XHRcdGFEZWZhdWx0ZWRQYXJhbWV0ZXJzID0gSlNPTi5wYXJzZShvU3RhcnR1cFBhcmFtZXRlcnNbREVGQVVMVEVEX1BBUkFNRVRFUl9QUk9QRVJUWV1bMF0pO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9NeURlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCk7XG5cdFx0Y29uc3Qgb05hdkhhbmRsZXIgPSB0aGlzO1xuXHRcdGNvbnN0IHBhcnNlVXJsUGFyYW1zID0gZnVuY3Rpb24gKG9TdWJTdGFydHVwUGFyYW1ldGVyczogYW55LCBhU3ViRGVmYXVsdGVkUGFyYW1ldGVyczogYW55LCBvU3ViTXlEZWZlcnJlZDogYW55LCBzTmF2VHlwZTogYW55KSB7XG5cdFx0XHQvLyBzdGFuZGFyZCBVUkwgbmF2aWdhdGlvblxuXHRcdFx0Y29uc3Qgb1NlbFZhcnMgPSBvTmF2SGFuZGxlci5fc3BsaXRJbmJvdW5kTmF2aWdhdGlvblBhcmFtZXRlcnMoXG5cdFx0XHRcdG5ldyBTZWxlY3Rpb25WYXJpYW50KCksXG5cdFx0XHRcdG9TdWJTdGFydHVwUGFyYW1ldGVycyxcblx0XHRcdFx0YVN1YkRlZmF1bHRlZFBhcmFtZXRlcnNcblx0XHRcdCk7XG5cdFx0XHRpZiAob1NlbFZhcnMub05hdmlnYXRpb25TZWxWYXIuaXNFbXB0eSgpICYmIG9TZWxWYXJzLm9EZWZhdWx0ZWRTZWxWYXIuaXNFbXB0eSgpKSB7XG5cdFx0XHRcdC8vIFN0YXJ0dXAgcGFyYW1ldGVycyBjb250YWluIG9ubHkgdGVjaG5pY2FsIHBhcmFtZXRlcnMgKFNBUCBzeXN0ZW0pIHdoaWNoIHdlcmUgZmlsdGVyZWQgb3V0LlxuXHRcdFx0XHQvLyBvTmF2aWdhdGlvblNlbFZhciBhbmQgb0RlZmF1bHRlZFNlbFZhciBhcmUgZW1wdHkuXG5cdFx0XHRcdC8vIFRodXMsIGNvbnNpZGVyIHRoaXMgdHlwZSBvZiBuYXZpZ2F0aW9uIGFzIGFuIGluaXRpYWwgbmF2aWdhdGlvbi5cblx0XHRcdFx0aWYgKHNOYXZUeXBlID09PSBOYXZUeXBlLnhBcHBTdGF0ZSkge1xuXHRcdFx0XHRcdGNvbnN0IG9FcnJvciA9IG9OYXZIYW5kbGVyLl9jcmVhdGVUZWNobmljYWxFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLmdldERhdGFGcm9tQXBwU3RhdGUuZmFpbGVkXCIpO1xuXHRcdFx0XHRcdG9TdWJNeURlZmVycmVkLnJlamVjdChvRXJyb3IsIG9TdWJTdGFydHVwUGFyYW1ldGVycyB8fCB7fSwgTmF2VHlwZS54QXBwU3RhdGUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9TdWJNeURlZmVycmVkLnJlc29sdmUoe30sIG9TdWJTdGFydHVwUGFyYW1ldGVycywgTmF2VHlwZS5pbml0aWFsKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgb0FwcFN0YXRlRGF0YTogYW55ID0ge307XG5cdFx0XHRcdG9BcHBTdGF0ZURhdGEuc2VsZWN0aW9uVmFyaWFudCA9IG9TZWxWYXJzLm9OYXZpZ2F0aW9uU2VsVmFyLnRvSlNPTlN0cmluZygpO1xuXHRcdFx0XHRvQXBwU3RhdGVEYXRhLm9TZWxlY3Rpb25WYXJpYW50ID0gb1NlbFZhcnMub05hdmlnYXRpb25TZWxWYXI7XG5cdFx0XHRcdG9BcHBTdGF0ZURhdGEub0RlZmF1bHRlZFNlbGVjdGlvblZhcmlhbnQgPSBvU2VsVmFycy5vRGVmYXVsdGVkU2VsVmFyO1xuXHRcdFx0XHRvQXBwU3RhdGVEYXRhLmJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHkgPSBvU2VsVmFycy5iTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5O1xuXHRcdFx0XHRvU3ViTXlEZWZlcnJlZC5yZXNvbHZlKG9BcHBTdGF0ZURhdGEsIG9TdWJTdGFydHVwUGFyYW1ldGVycywgc05hdlR5cGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0aWYgKHNJQXBwU3RhdGUpIHtcblx0XHRcdC8vIGlubmVyIGFwcCBzdGF0ZSBpcyBhdmFpbGFibGUgaW4gdGhlIEFwcEhhc2ggKGJhY2sgbmF2aWdhdGlvbik7IGV4dHJhY3QgdGhlIHBhcmFtZXRlciB2YWx1ZVxuXHRcdFx0dGhpcy5fbG9hZEFwcFN0YXRlKHNJQXBwU3RhdGUsIG9NeURlZmVycmVkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gbm8gYmFjayBuYXZpZ2F0aW9uXG5cdFx0XHRjb25zdCBiSXNYYXBwU3RhdGVOYXZpZ2F0aW9uID0gb0NvbXBvbmVudERhdGFbXCJzYXAteGFwcC1zdGF0ZVwiXSAhPT0gdW5kZWZpbmVkO1xuXHRcdFx0aWYgKGJJc1hhcHBTdGF0ZU5hdmlnYXRpb24pIHtcblx0XHRcdFx0Y29uc3QgdGhhdCA9IHRoaXM7XG5cdFx0XHRcdC8vIGlubmVyIGFwcCBzdGF0ZSB3YXMgbm90IGZvdW5kIGluIHRoZSBBcHBIYXNoLCBidXQgeGFwcCBzdGF0ZSA9PiB0cnkgdG8gcmVhZCB0aGUgeGFwcCBzdGF0ZVxuXHRcdFx0XHR0aGlzLl9nZXRBcHBOYXZpZ2F0aW9uU2VydmljZUFzeW5jKClcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAob0Nyb3NzQXBwTmF2U2VydmljZTogYW55KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvU3RhcnR1cFByb21pc2UgPSBvQ3Jvc3NBcHBOYXZTZXJ2aWNlLmdldFN0YXJ0dXBBcHBTdGF0ZSh0aGF0Lm9Db21wb25lbnQpO1xuXHRcdFx0XHRcdFx0b1N0YXJ0dXBQcm9taXNlLmRvbmUoZnVuY3Rpb24gKG9BcHBTdGF0ZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdC8vIGdldCBhcHAgc3RhdGUgZnJvbSBzYXAteGFwcC1zdGF0ZSxcblx0XHRcdFx0XHRcdFx0Ly8gY3JlYXRlIGEgY29weSwgbm90IG9ubHkgYSByZWZlcmVuY2UsIGJlY2F1c2Ugd2Ugd2FudCB0byBtb2RpZnkgdGhlIG9iamVjdFxuXHRcdFx0XHRcdFx0XHRsZXQgb0FwcFN0YXRlRGF0YSA9IG9BcHBTdGF0ZS5nZXREYXRhKCk7XG5cdFx0XHRcdFx0XHRcdGxldCBvRXJyb3I7XG5cdFx0XHRcdFx0XHRcdGlmIChvQXBwU3RhdGVEYXRhKSB7XG5cdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdG9BcHBTdGF0ZURhdGEgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9BcHBTdGF0ZURhdGEpKTtcblx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoICh4KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvRXJyb3IgPSBvTmF2SGFuZGxlci5fY3JlYXRlVGVjaG5pY2FsRXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5BcHBTdGF0ZURhdGEucGFyc2VFcnJvclwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdG9NeURlZmVycmVkLnJlamVjdChvRXJyb3IsIG9TdGFydHVwUGFyYW1ldGVycywgTmF2VHlwZS54QXBwU3RhdGUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9NeURlZmVycmVkLnByb21pc2UoKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAob0FwcFN0YXRlRGF0YSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9TZWxWYXIgPSBuZXcgU2VsZWN0aW9uVmFyaWFudChvQXBwU3RhdGVEYXRhLnNlbGVjdGlvblZhcmlhbnQpO1xuXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb1NlbFZhcnMgPSBvTmF2SGFuZGxlci5fc3BsaXRJbmJvdW5kTmF2aWdhdGlvblBhcmFtZXRlcnMoXG5cdFx0XHRcdFx0XHRcdFx0XHRvU2VsVmFyLFxuXHRcdFx0XHRcdFx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRcdFx0YURlZmF1bHRlZFBhcmFtZXRlcnNcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdG9BcHBTdGF0ZURhdGEuc2VsZWN0aW9uVmFyaWFudCA9IG9TZWxWYXJzLm9OYXZpZ2F0aW9uU2VsVmFyLnRvSlNPTlN0cmluZygpO1xuXHRcdFx0XHRcdFx0XHRcdG9BcHBTdGF0ZURhdGEub1NlbGVjdGlvblZhcmlhbnQgPSBvU2VsVmFycy5vTmF2aWdhdGlvblNlbFZhcjtcblx0XHRcdFx0XHRcdFx0XHRvQXBwU3RhdGVEYXRhLm9EZWZhdWx0ZWRTZWxlY3Rpb25WYXJpYW50ID0gb1NlbFZhcnMub0RlZmF1bHRlZFNlbFZhcjtcblx0XHRcdFx0XHRcdFx0XHRvQXBwU3RhdGVEYXRhLmJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHkgPSBvU2VsVmFycy5iTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5O1xuXHRcdFx0XHRcdFx0XHRcdG9NeURlZmVycmVkLnJlc29sdmUob0FwcFN0YXRlRGF0YSwgb1N0YXJ0dXBQYXJhbWV0ZXJzLCBOYXZUeXBlLnhBcHBTdGF0ZSk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAob1N0YXJ0dXBQYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0XHRcdFx0cGFyc2VVcmxQYXJhbXMob1N0YXJ0dXBQYXJhbWV0ZXJzLCBhRGVmYXVsdGVkUGFyYW1ldGVycywgb015RGVmZXJyZWQsIE5hdlR5cGUueEFwcFN0YXRlKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBzYXAteGFwcC1zdGF0ZSBuYXZpZ2F0aW9uLCBidXQgSUQgaGFzIGFscmVhZHkgZXhwaXJlZCwgYnV0IFVSTCBwYXJhbWV0ZXJzIGF2YWlsYWJsZVxuXHRcdFx0XHRcdFx0XHRcdG9FcnJvciA9IG9OYXZIYW5kbGVyLl9jcmVhdGVUZWNobmljYWxFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLmdldERhdGFGcm9tQXBwU3RhdGUuZmFpbGVkXCIpO1xuXHRcdFx0XHRcdFx0XHRcdG9NeURlZmVycmVkLnJlamVjdChvRXJyb3IsIG9TdGFydHVwUGFyYW1ldGVycyB8fCB7fSwgTmF2VHlwZS54QXBwU3RhdGUpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdG9TdGFydHVwUHJvbWlzZS5mYWlsKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb0Vycm9yID0gb05hdkhhbmRsZXIuX2NyZWF0ZVRlY2huaWNhbEVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuZ2V0U3RhcnR1cFN0YXRlLmZhaWxlZFwiKTtcblx0XHRcdFx0XHRcdFx0b015RGVmZXJyZWQucmVqZWN0KG9FcnJvciwge30sIE5hdlR5cGUueEFwcFN0YXRlKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9FcnJvciA9IG9OYXZIYW5kbGVyLl9jcmVhdGVUZWNobmljYWxFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLl9nZXRBcHBOYXZpZ2F0aW9uU2VydmljZUFzeW5jLmZhaWxlZFwiKTtcblx0XHRcdFx0XHRcdG9NeURlZmVycmVkLnJlamVjdChvRXJyb3IsIHt9LCBOYXZUeXBlLnhBcHBTdGF0ZSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2UgaWYgKG9TdGFydHVwUGFyYW1ldGVycykge1xuXHRcdFx0XHQvLyBubyBzYXAteGFwcC1zdGF0ZVxuXHRcdFx0XHRwYXJzZVVybFBhcmFtcyhvU3RhcnR1cFBhcmFtZXRlcnMsIGFEZWZhdWx0ZWRQYXJhbWV0ZXJzLCBvTXlEZWZlcnJlZCwgTmF2VHlwZS5VUkxQYXJhbXMpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gaW5pdGlhbCBuYXZpZ2F0aW9uXG5cdFx0XHRcdG9NeURlZmVycmVkLnJlc29sdmUoe30sIHt9LCBOYXZUeXBlLmluaXRpYWwpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBvTXlEZWZlcnJlZC5wcm9taXNlKCk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgYXBwbGljYXRpb24gc3BlY2lmaWMgdGVjaG5pY2FsIHBhcmFtZXRlcnMuIFRlY2huaWNhbCBwYXJhbWV0ZXJzIHdpbGwgbm90IGJlIGFkZGVkIHRvIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBwYXNzZWQgdG8gdGhlXG5cdCAqIGFwcGxpY2F0aW9uLiBBcyBhIGRlZmF1bHQgdGhlIGZvbGxvd2luZyB2YWx1ZXMgYXJlIGNvbnNpZGVyZWQgYXMgdGVjaG5pY2FsIHBhcmFtZXRlcnM6XG5cdCAqIDx1bD5cblx0ICogPGxpPjxjb2RlPnNhcC1zeXN0ZW08L2NvZGU+PC9saT5cblx0ICogPGxpPjxjb2RlPnNhcC11c2hlbGwtZGVmYXVsdGVkUGFyYW1ldGVyTmFtZXM8L2NvZGU+PC9saT5cblx0ICogPGxpPjxjb2RlPlwiaGNwQXBwbGljYXRpb25JZFwiPC9jb2RlPjwvbGk+XG5cdCAqIDwvdWw+LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqIEBmdW5jdGlvbiBzZXRUZWNobmljYWxQYXJhbWV0ZXJzXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlci5wcm90b3R5cGVcblx0ICogQHBhcmFtIHtBcnJheX0gYVRlY2huaWNhbFBhcmFtZXRlcnMgTGlzdCBvZiBwYXJhbWV0ZXIgbmFtZXMgdG8gYmUgY29uc2lkZXJlZCBhcyB0ZWNobmljYWwgcGFyYW1ldGVycy4gPGNvZGU+bnVsbDwvY29kZT4gb3Jcblx0ICogICAgICAgIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gbWF5IGJlIHVzZWQgdG8gcmVzZXQgdGhlIGNvbXBsZXRlIGxpc3QuXG5cdCAqL1xuXHRzZXRUZWNobmljYWxQYXJhbWV0ZXJzKGFUZWNobmljYWxQYXJhbWV0ZXJzPzogYW55W10pIHtcblx0XHRpZiAoIWFUZWNobmljYWxQYXJhbWV0ZXJzKSB7XG5cdFx0XHRhVGVjaG5pY2FsUGFyYW1ldGVycyA9IFtdO1xuXHRcdH1cblxuXHRcdGlmICghQXJyYXkuaXNBcnJheShhVGVjaG5pY2FsUGFyYW1ldGVycykpIHtcblx0XHRcdExvZy5lcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyOiBwYXJhbWV0ZXIgaW5jb3JyZWN0LCBhcnJheSBvZiBzdHJpbmdzIGV4cGVjdGVkXCIpO1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9JTlBVVFwiKTtcblx0XHR9XG5cblx0XHR0aGlzLl9hVGVjaG5pY2FsUGFyYW1hdGVycyA9IGFUZWNobmljYWxQYXJhbWV0ZXJzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGFwcGxpY2F0aW9uIHNwZWNpZmljIHRlY2huaWNhbCBwYXJhbWV0ZXJzLiBUZWNobmljYWwgcGFyYW1ldGVycyB3aWxsIG5vdCBiZSBhZGRlZCB0byB0aGUgc2VsZWN0aW9uIHZhcmlhbnQgcGFzc2VkIHRvIHRoZVxuXHQgKiBhcHBsaWNhdGlvbi4gQXMgYSBkZWZhdWx0IHRoZSBmb2xsb3dpbmcgdmFsdWVzIGFyZSBjb25zaWRlcmVkIGFzIHRlY2huaWNhbCBwYXJhbWV0ZXJzOlxuXHQgKiA8dWw+XG5cdCAqIDxsaT48Y29kZT5zYXAtc3lzdGVtPC9jb2RlPjwvbGk+XG5cdCAqIDxsaT48Y29kZT5zYXAtdXNoZWxsLWRlZmF1bHRlZFBhcmFtZXRlck5hbWVzPC9jb2RlPjwvbGk+XG5cdCAqIDxsaT48Y29kZT5cImhjcEFwcGxpY2F0aW9uSWRcIjwvY29kZT48L2xpPlxuXHQgKiA8L3VsPi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAZnVuY3Rpb24gZ2V0VGVjaG5pY2FsUGFyYW1ldGVyc1xuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXIucHJvdG90eXBlXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQ29udGFpbmluZyB0aGUgdGVjaG5pY2FsIHBhcmFtZXRlcnMuXG5cdCAqL1xuXHRnZXRUZWNobmljYWxQYXJhbWV0ZXJzKCkge1xuXHRcdHJldHVybiB0aGlzLl9hVGVjaG5pY2FsUGFyYW1hdGVycy5jb25jYXQoW10pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgcGFzc2VkIHBhcmFtZXRlciBpcyBjb25zaWRlcmVkIGFzIHRlY2huaWNhbCBwYXJhbWV0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUGFyYW1ldGVyTmFtZSBOYW1lIG9mIGEgcmVxdWVzdCBwYXJhbWV0ZXIsIGNvbnNpZGVyZWQgYXMgdGVjaG5pY2FsIHBhcmFtZXRlci5cblx0ICogQHJldHVybnMgSW5kaWNhdGVzIGlmIHRoZSBwYXJhbWV0ZXIgaXMgY29uc2lkZXJlZCBhcyB0ZWNobmljYWwgcGFyYW1ldGVyIG9yIG5vdC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9pc1RlY2huaWNhbFBhcmFtZXRlcihzUGFyYW1ldGVyTmFtZTogc3RyaW5nKSB7XG5cdFx0aWYgKHNQYXJhbWV0ZXJOYW1lKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdCEoXG5cdFx0XHRcdFx0c1BhcmFtZXRlck5hbWUgPT09IFwic2FwLXVpLWZlLXZhcmlhbnQtaWRcIiB8fFxuXHRcdFx0XHRcdHNQYXJhbWV0ZXJOYW1lID09PSBcInNhcC11aS1mZS10YWJsZS12YXJpYW50LWlkXCIgfHxcblx0XHRcdFx0XHRzUGFyYW1ldGVyTmFtZSA9PT0gXCJzYXAtdWktZmUtY2hhcnQtdmFyaWFudC1pZFwiIHx8XG5cdFx0XHRcdFx0c1BhcmFtZXRlck5hbWUgPT09IFwic2FwLXVpLWZlLWZpbHRlcmJhci12YXJpYW50LWlkXCJcblx0XHRcdFx0KVxuXHRcdFx0KSB7XG5cdFx0XHRcdGlmIChzUGFyYW1ldGVyTmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJzYXAtXCIpID09PSAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5fYVRlY2huaWNhbFBhcmFtYXRlcnMuaW5kZXhPZihzUGFyYW1ldGVyTmFtZSkgPj0gMCkge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdF9pc0ZFUGFyYW1ldGVyKHNQYXJhbWV0ZXJOYW1lOiBhbnkpIHtcblx0XHRyZXR1cm4gc1BhcmFtZXRlck5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKFwic2FwLXVpLWZlXCIpID09PSAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJtb3ZlcyBpZiB0aGUgcGFzc2VkIHBhcmFtZXRlciBpcyBjb25zaWRlcmVkIGFzIHRlY2huaWNhbCBwYXJhbWV0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBvU2VsZWN0aW9uVmFyaWFudCBTZWxlY3Rpb24gVmFyaWFudCB3aGljaCBjb25zaXN0cyBvZiB0ZWNobmljYWwgUGFyYW1ldGVycy5cblx0ICogQHJldHVybnMgU2VsZWN0aW9uIFZhcmlhbnQgd2l0aG91dCB0ZWNobmljYWwgUGFyYW1ldGVycy5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9yZW1vdmVUZWNobmljYWxQYXJhbWV0ZXJzKG9TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0bGV0IHNQcm9wTmFtZSwgaTtcblx0XHRjb25zdCBhU2VsVmFyUHJvcE5hbWVzID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMoKTtcblx0XHRmb3IgKGkgPSAwOyBpIDwgYVNlbFZhclByb3BOYW1lcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0c1Byb3BOYW1lID0gYVNlbFZhclByb3BOYW1lc1tpXTtcblx0XHRcdGlmICh0aGlzLl9pc1RlY2huaWNhbFBhcmFtZXRlcihzUHJvcE5hbWUpKSB7XG5cdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihzUHJvcE5hbWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb1NlbGVjdGlvblZhcmlhbnQ7XG5cdH1cblxuXHQvKipcblx0ICogU3BsaXRzIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIGR1cmluZyBpbmJvdW5kIG5hdmlnYXRpb24gYW5kIHNlcGFyYXRlcyB0aGUgY29udGV4dHVhbCBpbmZvcm1hdGlvbiBiZXR3ZWVuIGRlZmF1bHRlZCBwYXJhbWV0ZXIgdmFsdWVzIGFuZFxuXHQgKiBuYXZpZ2F0aW9uIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvU2VsZWN0aW9uVmFyaWFudCBJbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uU2VsZWN0aW9uVmFyaWFudH0gY29udGFpbmluZyBuYXZpZ2F0aW9uIGRhdGEgb2Zcblx0ICogICAgICAgIHRoZSBhcHBcblx0ICogQHBhcmFtIG9TdGFydHVwUGFyYW1ldGVycyBPYmplY3QgY29udGFpbmluZyBzdGFydHVwIHBhcmFtZXRlcnMgb2YgdGhlIGFwcCAoZGVyaXZlZCBmcm9tIHRoZSBjb21wb25lbnQpXG5cdCAqIEBwYXJhbSBhRGVmYXVsdGVkUGFyYW1ldGVycyBBcnJheSBjb250YWluaW5nIGRlZmF1bHRlZCBwYXJhbWV0ZXIgbmFtZXNcblx0ICogQHJldHVybnMgT2JqZWN0IGNvbnRhaW5pbmcgdHdvIFNlbGVjdGlvblZhcmlhbnRzLCBvbmUgZm9yIG5hdmlnYXRpb24gKG9OYXZpZ2F0aW9uU2VsVmFyKSBhbmQgb25lIGZvciBkZWZhdWx0ZWQgc3RhcnR1cCBwYXJhbWV0ZXJzXG5cdCAqICAgICAgICAgIChvRGVmYXVsdGVkU2VsVmFyKSwgYW5kIGEgZmxhZyAoYk5hdlNlbFZhckhhc0RlZmF1bHRzT25seSkgaW5kaWNhdGluZyB3aGV0aGVyIGFsbCBwYXJhbWV0ZXJzIHdlcmUgZGVmYXVsdGVkLiBUaGUgZnVuY3Rpb24gaXNcblx0ICogICAgICAgICAgaGFuZGVkIHR3byBvYmplY3RzIGNvbnRhaW5pbmcgcGFyYW1ldGVycyAobmFtZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgdmFsdWVzKSwgb1NlbGVjdGlvblZhcmlhbnQgYW5kIG9TdGFydHVwUGFyYW1ldGVycy4gQVxuXHQgKiAgICAgICAgICBwYXJhbWV0ZXIgY291bGQgYmUgc3RvcmVkIGluIGp1c3Qgb25lIG9mIHRoZXNlIHR3byBvYmplY3RzIG9yIGluIGJvdGggb2YgdGhlbSBzaW11bHRhbmVvdXNseS4gQmVjYXVzZSBvZiB0aGUgbGF0dGVyIGNhc2UgYVxuXHQgKiAgICAgICAgICBwYXJhbWV0ZXIgY291bGQgYmUgYXNzb2NpYXRlZCB3aXRoIGNvbmZsaWN0aW5nIHZhbHVlcyBhbmQgaXQgaXMgdGhlIGpvYiBvZiB0aGlzIGZ1bmN0aW9uIHRvIHJlc29sdmUgYW55IHN1Y2ggY29uZmxpY3QuIFBhcmFtZXRlcnNcblx0ICogICAgICAgICAgYXJlIGFzc2lnbmVkIHRvIHRoZSB0d28gcmV0dXJuZWQgU2VsZWN0aW9uVmFyaWFudHMsIG9OYXZpZ2F0aW9uU2VsVmFyIGFuZCBvRGVmYXVsdGVkU2VsVmFyLCBhcyBmb2xsb3dzOiB8IHBhcmFtZXRlciBOT1QgaW4gfFxuXHQgKiAgICAgICAgICBwYXJhbWV0ZXIgaW4gfCBvU2VsZWN0aW9uVmFyaWFudCB8IG9TZWxlY3Rpb25WYXJpYW50IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLS0gcGFyYW1ldGVyIE5PVCBpbiB8XG5cdCAqICAgICAgICAgIG5vdGhpbmcgdG8gZG8gfCBBZGQgcGFyYW1ldGVyIG9TdGFydHVwUGFyYW1ldGVycyB8IGhlcmUgfCAoc2VlIGJlbG93KSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdCAqICAgICAgICAgIHBhcmFtZXRlciBpbiB8IEFkZCBwYXJhbWV0ZXIgfCBDb25mbGljdCByZXNvbHV0aW9uIG9TdGFydHVwUGFyYW1ldGVycyB8IChzZWUgYmVsb3cpIHwgKHNlZSBiZWxvdykgQWRkIHBhcmFtZXRlcjogaWYgcGFyYW1ldGVyIGluXG5cdCAqICAgICAgICAgIGFEZWZhdWx0ZWRQYXJhbWV0ZXJzOiBhZGQgcGFyYW1ldGVyIHRvIG9EZWZhdWx0ZWRTZWxWYXIgZWxzZTogYWRkIHBhcmFtZXRlciB0byBvTmF2aWdhdGlvblNlbFZhciBDb25mbGljdCByZXNvbHV0aW9uOiBpZiBwYXJhbWV0ZXJcblx0ICogICAgICAgICAgaW4gYURlZmF1bHRlZFBhcmFtZXRlcnM6IGFkZCBwYXJhbWV0ZXIgdmFsdWUgZnJvbSBvU2VsZWN0aW9uVmFyaWFudCB0byBvTmF2aWdhdGlvblNlbFZhciBhZGQgcGFyYW1ldGVyIHZhbHVlIGZyb21cblx0ICogICAgICAgICAgb1N0YXJ0dXBQYXJhbWV0ZXJzIHRvIG9EZWZhdWx0ZWRTZWxWYXIgTm90ZTogVGhpcyBjYXNlIG9ubHkgb2NjdXJzIGluIFVJNSAxLjMyLiBJbiBsYXRlciB2ZXJzaW9ucyBVU2hlbGwgc3RvcmVzIGFueSBkZWZhdWx0ZWRcblx0ICogICAgICAgICAgcGFyYW1ldGVyIGVpdGhlciBpbiBvU2VsZWN0aW9uVmFyaWFudCBvciBvU3RhcnR1cFBhcmFtZXRlcnMgYnV0IG5ldmVyIHNpbXVsdGFuZW91c2x5IGluIGJvdGguIGVsc2U6IENob29zZSAxIG9mIHRoZSBmb2xsb3dpbmdcblx0ICogICAgICAgICAgb3B0aW9ucyBiYXNlZCBvbiBnaXZlbiBoYW5kbGluZyBtb2RlICh0aGlzLnNQYXJhbUhhbmRsaW5nTW9kZSkuIC0+IGFkZCBwYXJhbWV0ZXIgdmFsdWUgZnJvbSBvU3RhcnR1cFBhcmFtZXRlcnMgdG9cblx0ICogICAgICAgICAgb05hdmlnYXRpb25TZWxWYXIgfCAtPiBhZGQgcGFyYW1ldGVyIHZhbHVlIGZyb20gb0FwcFN0YXRlLnNlbGVjdGlvblZhcmlhbnQgdG8gb05hdmlnYXRpb25TZWxWYXIgLT4gYWRkIGJvdGggcGFyYW1ldGVyIHZhbHVlcyB0b1xuXHQgKiAgICAgICAgICBuYXZpZ2F0aW9uU2VsVmFyIElmIG5hdmlnYXRpb25TZWxWYXIgaXMgc3RpbGwgZW1wdHkgYXQgdGhlIGVuZCBvZiBleGVjdXRpb24sIG5hdmlnYXRpb25TZWxWYXIgaXMgcmVwbGFjZWQgYnkgYSBjb3B5IG9mXG5cdCAqICAgICAgICAgIG9EZWZhdWx0ZWRTZWxWYXIgYW5kIHRoZSBmbGFnIGJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHkgaXMgc2V0IHRvIHRydWUuIFRoZSBzZWxlY3Rpb24gdmFyaWFudCBvRGVmYXVsdGVkU2VsVmFyIGl0c2VsZiBpcyBhbHdheXNcblx0ICogICAgICAgICAgcmV0dXJuZWQgYXMgaXMuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfc3BsaXRJbmJvdW5kTmF2aWdhdGlvblBhcmFtZXRlcnMoXG5cdFx0b1NlbGVjdGlvblZhcmlhbnQ6IEluc3RhbmNlVHlwZTx0eXBlb2YgU2VsZWN0aW9uVmFyaWFudD4sXG5cdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9LFxuXHRcdGFEZWZhdWx0ZWRQYXJhbWV0ZXJzOiBhbnlbXVxuXHQpIHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkoYURlZmF1bHRlZFBhcmFtZXRlcnMpKSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdH1cblxuXHRcdGxldCBzUHJvcE5hbWUsIGk7XG5cdFx0Ly8gRmlyc3Qgd2UgZG8gc29tZSBwYXJzaW5nIG9mIHRoZSBTdGFydFVwIFBhcmFtZXRlcnMuXG5cdFx0Y29uc3Qgb1N0YXJ0dXBQYXJhbWV0ZXJzQWRqdXN0ZWQ6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcblx0XHRmb3IgKHNQcm9wTmFtZSBpbiBvU3RhcnR1cFBhcmFtZXRlcnMpIHtcblx0XHRcdGlmICghb1N0YXJ0dXBQYXJhbWV0ZXJzLmhhc093blByb3BlcnR5KHNQcm9wTmFtZSkpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGlmIChzUHJvcE5hbWUgPT09IFNBUF9TWVNURU1fUFJPUEVSVFkgfHwgc1Byb3BOYW1lID09PSBERUZBVUxURURfUEFSQU1FVEVSX1BST1BFUlRZKSB7XG5cdFx0XHRpZiAodGhpcy5faXNUZWNobmljYWxQYXJhbWV0ZXIoc1Byb3BOYW1lKSB8fCB0aGlzLl9pc0ZFUGFyYW1ldGVyKHNQcm9wTmFtZSkpIHtcblx0XHRcdFx0Ly8gRG8gbm90IGFkZCB0aGUgU0FQIHN5c3RlbSBwYXJhbWV0ZXIgdG8gdGhlIHNlbGVjdGlvbiB2YXJpYW50IGFzIGl0IGlzIGEgdGVjaG5pY2FsIHBhcmFtZXRlclxuXHRcdFx0XHQvLyBub3QgcmVsZXZhbnQgZm9yIHRoZSBzZWxlY3Rpb24gdmFyaWFudC5cblx0XHRcdFx0Ly8gRG8gbm90IGFkZCB0aGUgc3RhcnR1cCBwYXJhbWV0ZXIgZm9yIGRlZmF1bHQgdmFsdWVzIHRvIHRoZSBzZWxlY3Rpb24gdmFyaWFudC4gVGhlIGluZm9ybWF0aW9uLCB3aGljaCBwYXJhbWV0ZXJzXG5cdFx0XHRcdC8vIGFyZSBkZWZhdWx0ZWQsIGlzIGF2YWlsYWJsZSBpbiB0aGUgZGVmYXVsdGVkIHNlbGVjdGlvbiB2YXJpYW50LlxuXHRcdFx0XHQvLyBJbiBjYXNlLCBGRSBQYXJhbWV0ZXJzIHdlIHNoYWxsIHNraXAgaXQuKHRoZSBhcHBsaWNhdGlvbiBuZWVkcyB0byBmZXRjaCBpdCBmcm9tIFVSTCBwYXJhbXMpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXZSBzdXBwb3J0IHBhcmFtZXRlcnMgYXMgYSBtYXAgd2l0aCBzdHJpbmdzIGFuZCBhcyBhIG1hcCB3aXRoIHZhbHVlIGFycmF5c1xuXHRcdFx0aWYgKHR5cGVvZiBvU3RhcnR1cFBhcmFtZXRlcnNbc1Byb3BOYW1lXSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnNBZGp1c3RlZFtzUHJvcE5hbWVdID0gb1N0YXJ0dXBQYXJhbWV0ZXJzW3NQcm9wTmFtZV07XG5cdFx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob1N0YXJ0dXBQYXJhbWV0ZXJzW3NQcm9wTmFtZV0pICYmIG9TdGFydHVwUGFyYW1ldGVyc1tzUHJvcE5hbWVdLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnNBZGp1c3RlZFtzUHJvcE5hbWVdID0gb1N0YXJ0dXBQYXJhbWV0ZXJzW3NQcm9wTmFtZV1bMF07IC8vIHNpbmdsZS12YWx1ZWQgcGFyYW1ldGVyc1xuXHRcdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9TdGFydHVwUGFyYW1ldGVyc1tzUHJvcE5hbWVdKSAmJiBvU3RhcnR1cFBhcmFtZXRlcnNbc1Byb3BOYW1lXS5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkW3NQcm9wTmFtZV0gPSBvU3RhcnR1cFBhcmFtZXRlcnNbc1Byb3BOYW1lXTsgLy8gbXVsdGktdmFsdWVkIHBhcmFtZXRlcnNcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVRcIik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQ29uc3RydWN0IHR3byBzZWxlY3Rpb24gdmFyaWFudHMgZm9yIGRlZmF1bHRzIGFuZCBuYXZpZ2F0aW9uIHRvIGJlIHJldHVybmVkIGJ5IHRoZSBmdW5jdGlvbi5cblx0XHRjb25zdCBvRGVmYXVsdGVkU2VsVmFyID0gbmV3IFNlbGVjdGlvblZhcmlhbnQoKTtcblx0XHRjb25zdCBvTmF2aWdhdGlvblNlbFZhciA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KCk7XG5cblx0XHRjb25zdCBhU2VsVmFyUHJvcE5hbWVzID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0UGFyYW1ldGVyTmFtZXMoKS5jb25jYXQob1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMoKSk7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGFTZWxWYXJQcm9wTmFtZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHNQcm9wTmFtZSA9IGFTZWxWYXJQcm9wTmFtZXNbaV07XG5cdFx0XHRpZiAoc1Byb3BOYW1lIGluIG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkKSB7XG5cdFx0XHRcdC8vIFJlc29sdmUgY29uZmxpY3QuXG5cdFx0XHRcdGlmIChhRGVmYXVsdGVkUGFyYW1ldGVycy5pbmRleE9mKHNQcm9wTmFtZSkgPiAtMSkge1xuXHRcdFx0XHRcdG9OYXZpZ2F0aW9uU2VsVmFyLm1hc3NBZGRTZWxlY3RPcHRpb24oc1Byb3BOYW1lLCBvU2VsZWN0aW9uVmFyaWFudC5nZXRWYWx1ZShzUHJvcE5hbWUpISk7XG5cdFx0XHRcdFx0dGhpcy5fYWRkUGFyYW1ldGVyVmFsdWVzKG9EZWZhdWx0ZWRTZWxWYXIsIHNQcm9wTmFtZSwgXCJJXCIsIFwiRVFcIiwgb1N0YXJ0dXBQYXJhbWV0ZXJzQWRqdXN0ZWRbc1Byb3BOYW1lXSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c3dpdGNoICh0aGlzLnNQYXJhbUhhbmRsaW5nTW9kZSkge1xuXHRcdFx0XHRcdFx0Y2FzZSBQYXJhbUhhbmRsaW5nTW9kZS5TZWxWYXJXaW5zOlxuXHRcdFx0XHRcdFx0XHRvTmF2aWdhdGlvblNlbFZhci5tYXNzQWRkU2VsZWN0T3B0aW9uKHNQcm9wTmFtZSwgb1NlbGVjdGlvblZhcmlhbnQuZ2V0VmFsdWUoc1Byb3BOYW1lKSEpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgUGFyYW1IYW5kbGluZ01vZGUuVVJMUGFyYW1XaW5zOlxuXHRcdFx0XHRcdFx0XHR0aGlzLl9hZGRQYXJhbWV0ZXJWYWx1ZXMob05hdmlnYXRpb25TZWxWYXIsIHNQcm9wTmFtZSwgXCJJXCIsIFwiRVFcIiwgb1N0YXJ0dXBQYXJhbWV0ZXJzQWRqdXN0ZWRbc1Byb3BOYW1lXSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBQYXJhbUhhbmRsaW5nTW9kZS5JbnNlcnRJblNlbE9wdDpcblx0XHRcdFx0XHRcdFx0b05hdmlnYXRpb25TZWxWYXIubWFzc0FkZFNlbGVjdE9wdGlvbihzUHJvcE5hbWUsIG9TZWxlY3Rpb25WYXJpYW50LmdldFZhbHVlKHNQcm9wTmFtZSkhKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5fYWRkUGFyYW1ldGVyVmFsdWVzKG9OYXZpZ2F0aW9uU2VsVmFyLCBzUHJvcE5hbWUsIFwiSVwiLCBcIkVRXCIsIG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkW3NQcm9wTmFtZV0pO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVRcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGFEZWZhdWx0ZWRQYXJhbWV0ZXJzLmluZGV4T2Yoc1Byb3BOYW1lKSA+IC0xKSB7XG5cdFx0XHRcdC8vIHBhcmFtZXRlciBvbmx5IGluIFNlbFZhclxuXHRcdFx0XHRvRGVmYXVsdGVkU2VsVmFyLm1hc3NBZGRTZWxlY3RPcHRpb24oc1Byb3BOYW1lLCBvU2VsZWN0aW9uVmFyaWFudC5nZXRWYWx1ZShzUHJvcE5hbWUpISk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvTmF2aWdhdGlvblNlbFZhci5tYXNzQWRkU2VsZWN0T3B0aW9uKHNQcm9wTmFtZSwgb1NlbGVjdGlvblZhcmlhbnQuZ2V0VmFsdWUoc1Byb3BOYW1lKSEpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvciAoc1Byb3BOYW1lIGluIG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkKSB7XG5cdFx0XHQvLyBUaGUgY2FzZSB3aGVyZSB0aGUgcGFyYW1ldGVyIGFwcGVhcnMgdHdpY2UgaGFzIGFscmVhZHkgYmVlbiB0YWtlbiBjYXJlIG9mIGFib3ZlIHNvIHdlIHNraXAgaXQgaGVyZS5cblx0XHRcdGlmIChhU2VsVmFyUHJvcE5hbWVzLmluZGV4T2Yoc1Byb3BOYW1lKSA+IC0xKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYURlZmF1bHRlZFBhcmFtZXRlcnMuaW5kZXhPZihzUHJvcE5hbWUpID4gLTEpIHtcblx0XHRcdFx0dGhpcy5fYWRkUGFyYW1ldGVyVmFsdWVzKG9EZWZhdWx0ZWRTZWxWYXIsIHNQcm9wTmFtZSwgXCJJXCIsIFwiRVFcIiwgb1N0YXJ0dXBQYXJhbWV0ZXJzQWRqdXN0ZWRbc1Byb3BOYW1lXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLl9hZGRQYXJhbWV0ZXJWYWx1ZXMob05hdmlnYXRpb25TZWxWYXIsIHNQcm9wTmFtZSwgXCJJXCIsIFwiRVFcIiwgb1N0YXJ0dXBQYXJhbWV0ZXJzQWRqdXN0ZWRbc1Byb3BOYW1lXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gdGhlIHNlbGVjdGlvbiB2YXJpYW50IHVzZWQgZm9yIG5hdmlnYXRpb24gc2hvdWxkIGJlIGZpbGxlZCB3aXRoIGRlZmF1bHRzIGluIGNhc2UgdGhhdCBvbmx5IGRlZmF1bHRzIGV4aXN0XG5cdFx0bGV0IGJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHkgPSBmYWxzZTtcblx0XHRpZiAob05hdmlnYXRpb25TZWxWYXIuaXNFbXB0eSgpKSB7XG5cdFx0XHRiTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5ID0gdHJ1ZTtcblx0XHRcdGNvbnN0IGFQcm9wTmFtZXMgPSBvRGVmYXVsdGVkU2VsVmFyLmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCk7XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgYVByb3BOYW1lcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRvTmF2aWdhdGlvblNlbFZhci5tYXNzQWRkU2VsZWN0T3B0aW9uKGFQcm9wTmFtZXNbaV0sIG9EZWZhdWx0ZWRTZWxWYXIuZ2V0VmFsdWUoYVByb3BOYW1lc1tpXSkhKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0b05hdmlnYXRpb25TZWxWYXI6IG9OYXZpZ2F0aW9uU2VsVmFyLFxuXHRcdFx0b0RlZmF1bHRlZFNlbFZhcjogb0RlZmF1bHRlZFNlbFZhcixcblx0XHRcdGJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHk6IGJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHlcblx0XHR9O1xuXHR9XG5cblx0X2FkZFBhcmFtZXRlclZhbHVlcyhvU2VsVmFyaWFudDogYW55LCBzUHJvcE5hbWU6IGFueSwgc1NpZ246IGFueSwgc09wdGlvbjogYW55LCBvVmFsdWVzOiBhbnkpIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShvVmFsdWVzKSkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBvVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdG9TZWxWYXJpYW50LmFkZFNlbGVjdE9wdGlvbihzUHJvcE5hbWUsIHNTaWduLCBzT3B0aW9uLCBvVmFsdWVzW2ldKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0b1NlbFZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKHNQcm9wTmFtZSwgc1NpZ24sIHNPcHRpb24sIG9WYWx1ZXMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2VzIHRoZSBVUkwgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHNBcHBTdGF0ZUtleS4gQXMgYW4gcmVhY3Rpb24gcm91dGUgY2hhbmdlIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0FwcFN0YXRlS2V5IFRoZSBuZXcgYXBwIHN0YXRlIGtleS5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cmVwbGFjZUhhc2goc0FwcFN0YXRlS2V5OiBzdHJpbmcpIHtcblx0XHRjb25zdCBvSGFzaENoYW5nZXIgPSB0aGlzLm9Sb3V0ZXIub0hhc2hDaGFuZ2VyID8gdGhpcy5vUm91dGVyLm9IYXNoQ2hhbmdlciA6IEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCk7XG5cdFx0Y29uc3Qgc0FwcEhhc2hPbGQgPSBvSGFzaENoYW5nZXIuZ2V0SGFzaCgpO1xuXHRcdC8qXG5cdFx0ICogdXNlIC5nZXRIYXNoKCkgaGVyZSBpbnN0ZWFkIG9mIC5nZXRBcHBIYXNoKCkgdG8gYWxzbyBiZSBhYmxlIGRlYWxpbmcgd2l0aCBlbnZpcm9ubWVudHMgd2hlcmUgb25seSBTQVBVSTUgaXMgbG9hZGVkIGFuZCB0aGUgVVNoZWxsIGlzXG5cdFx0ICogbm90IGluaXRpYWxpemVkIHByb3Blcmx5LlxuXHRcdCAqL1xuXHRcdGNvbnN0IHNBcHBIYXNoTmV3ID0gdGhpcy5fcmVwbGFjZUlubmVyQXBwU3RhdGVLZXkoc0FwcEhhc2hPbGQsIHNBcHBTdGF0ZUtleSk7XG5cdFx0b0hhc2hDaGFuZ2VyLnJlcGxhY2VIYXNoKHNBcHBIYXNoTmV3KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2VzIHRoZSBVUkwgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IGFwcCBzdGF0ZSBhbmQgc3RvcmVzIHRoZSBhcHAgc3RhdGUgZm9yIGxhdGVyIHJldHJpZXZhbC5cblx0ICpcblx0ICogQHBhcmFtIG1Jbm5lckFwcERhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGFwcFxuXHQgKiBAcGFyYW0gYkltbWVkaWF0ZUhhc2hSZXBsYWNlIElmIHNldCB0byBmYWxzZSwgdGhlIGlubmVyIGFwcCBoYXNoIHdpbGwgbm90IGJlIHJlcGxhY2VkIHVudGlsIHN0b3JpbmcgaXMgc3VjY2Vzc2Z1bDsgZG8gbm90XG5cdCAqICAgICAgICBzZXQgdG8gZmFsc2UgaWYgeW91IGNhbm5vdCByZWFjdCB0byB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgUHJvbWlzZSwgZm9yIGV4YW1wbGUsIHdoZW4gY2FsbGluZyB0aGUgYmVmb3JlTGlua1ByZXNzZWQgZXZlbnRcblx0ICogQHBhcmFtIGJTa2lwSGFzaFJlcGxhY2UgSWYgc2V0IHRvIHRydWUsIHRoZSBpbm5lciBhcHAgaGFzaCB3aWxsIG5vdCBiZSByZXBsYWNlZCBpbiB0aGUgc3RvcmVJbm5lckFwcFN0YXRlQXN5bmMuIEFsc28gdGhlIGJJbW1lZGlhdGVIYXNoUmVwbGFjZVxuXHQgKiBcdFx0ICB3aWxsIGJlIGlnbm9yZWQuXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSBvYmplY3QgdG8gbW9uaXRvciB3aGVuIGFsbCB0aGUgYWN0aW9ucyBvZiB0aGUgZnVuY3Rpb24gaGF2ZSBiZWVuIGV4ZWN1dGVkOyBpZiB0aGUgZXhlY3V0aW9uIGlzIHN1Y2Nlc3NmdWwsIHRoZVxuXHQgKiAgICAgICAgICBhcHAgc3RhdGUga2V5IGlzIHJldHVybmVkOyBpZiBhbiBlcnJvciBvY2N1cnMsIGFuIG9iamVjdCBvZiB0eXBlIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZFcnJvcn0gaXNcblx0ICogICAgICAgICAgcmV0dXJuZWRcblx0ICogQHB1YmxpY1xuXHQgKiBAZXhhbXBsZSA8Y29kZT5cblx0ICogc2FwLnVpLmRlZmluZShbXCJzYXAvZmUvbmF2aWdhdGlvbi9OYXZpZ2F0aW9uSGFuZGxlclwiXSwgZnVuY3Rpb24gKE5hdmlnYXRpb25IYW5kbGVyKSB7XG5cdCAqIFx0dmFyIG9OYXZpZ2F0aW9uSGFuZGxlciA9IG5ldyBOYXZpZ2F0aW9uSGFuZGxlcihvQ29udHJvbGxlcik7XG5cdCAqIFx0dmFyIG1Jbm5lckFwcERhdGEgPSB7XG5cdCAqIFx0XHRzZWxlY3Rpb25WYXJpYW50IDogb1NtYXJ0RmlsdGVyQmFyLmdldERhdGFTdWl0ZUZvcm1hdCgpLFxuXHQgKiBcdFx0dGFibGVWYXJpYW50SWQgOiBvU21hcnRUYWJsZS5nZXRDdXJyZW50VmFyaWFudElkKCksXG5cdCAqIFx0XHRjdXN0b21EYXRhIDogb015Q3VzdG9tRGF0YVxuXHQgKiBcdH07XG5cdCAqXG5cdCAqIFx0dmFyIG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlID0gb05hdmlnYXRpb25IYW5kbGVyLnN0b3JlSW5uZXJBcHBTdGF0ZUFzeW5jKG1Jbm5lckFwcERhdGEpO1xuXHQgKlxuXHQgKiBcdG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlLmRvbmUoZnVuY3Rpb24oc0FwcFN0YXRlS2V5KXtcblx0ICogXHRcdC8veW91ciBpbm5lciBhcHAgc3RhdGUgaXMgc2F2ZWQgbm93LCBzQXBwU3RhdGVLZXkgd2FzIGFkZGVkIHRvIFVSTFxuXHQgKiBcdFx0Ly9wZXJmb3JtIGFjdGlvbnMgdGhhdCBtdXN0IHJ1biBhZnRlciBzYXZlXG5cdCAqIFx0fSk7XG5cdCAqXG5cdCAqIFx0b1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UuZmFpbChmdW5jdGlvbihvRXJyb3Ipe1xuXHQgKiBcdFx0Ly9zb21lIGVycm9yIGhhbmRsaW5nXG5cdCAqIFx0fSk7XG5cdCAqIH0pO1xuXHQgKiA8L2NvZGU+XG5cdCAqL1xuXHRzdG9yZUlubmVyQXBwU3RhdGVBc3luYyhcblx0XHRtSW5uZXJBcHBEYXRhOiBJbm5lckFwcERhdGEsXG5cdFx0YkltbWVkaWF0ZUhhc2hSZXBsYWNlPzogYm9vbGVhbixcblx0XHRiU2tpcEhhc2hSZXBsYWNlPzogYm9vbGVhblxuXHQpOiBqUXVlcnkuUHJvbWlzZTxzdHJpbmc+IHtcblx0XHRpZiAodHlwZW9mIGJJbW1lZGlhdGVIYXNoUmVwbGFjZSAhPT0gXCJib29sZWFuXCIpIHtcblx0XHRcdGJJbW1lZGlhdGVIYXNoUmVwbGFjZSA9IHRydWU7IC8vIGRlZmF1bHRcblx0XHR9XG5cdFx0Y29uc3Qgb05hdkhhbmRsZXIgPSB0aGlzO1xuXHRcdGNvbnN0IG9NeURlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkPHN0cmluZz4oKTtcblxuXHRcdGNvbnN0IGZuUmVwbGFjZUhhc2ggPSBmdW5jdGlvbiAoc0FwcFN0YXRlS2V5OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9IYXNoQ2hhbmdlciA9IG9OYXZIYW5kbGVyLm9Sb3V0ZXIub0hhc2hDaGFuZ2VyID8gb05hdkhhbmRsZXIub1JvdXRlci5vSGFzaENoYW5nZXIgOiBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpO1xuXHRcdFx0Y29uc3Qgc0FwcEhhc2hPbGQgPSBvSGFzaENoYW5nZXIuZ2V0SGFzaCgpO1xuXHRcdFx0Lypcblx0XHRcdCAqIHVzZSAuZ2V0SGFzaCgpIGhlcmUgaW5zdGVhZCBvZiAuZ2V0QXBwSGFzaCgpIHRvIGFsc28gYmUgYWJsZSBkZWFsaW5nIHdpdGggZW52aXJvbm1lbnRzIHdoZXJlIG9ubHkgU0FQVUk1IGlzIGxvYWRlZCBhbmQgdGhlIFVTaGVsbFxuXHRcdFx0ICogaXMgbm90IGluaXRpYWxpemVkIHByb3Blcmx5LlxuXHRcdFx0ICovXG5cdFx0XHRjb25zdCBzQXBwSGFzaE5ldyA9IG9OYXZIYW5kbGVyLl9yZXBsYWNlSW5uZXJBcHBTdGF0ZUtleShzQXBwSGFzaE9sZCwgc0FwcFN0YXRlS2V5KTtcblx0XHRcdG9IYXNoQ2hhbmdlci5yZXBsYWNlSGFzaChzQXBwSGFzaE5ldyk7XG5cdFx0fTtcblxuXHRcdC8vIGluIGNhc2UgbUlubmVyQXBwU3RhdGUgaXMgZW1wdHksIGRvIG5vdCBvdmVyd3JpdGUgdGhlIGxhc3Qgc2F2ZWQgc3RhdGVcblx0XHRpZiAoaXNFbXB0eU9iamVjdChtSW5uZXJBcHBEYXRhIGFzIG9iamVjdCkpIHtcblx0XHRcdG9NeURlZmVycmVkLnJlc29sdmUoXCJcIik7XG5cdFx0XHRyZXR1cm4gb015RGVmZXJyZWQucHJvbWlzZSgpO1xuXHRcdH1cblxuXHRcdC8vIGNoZWNrIGlmIHdlIGFscmVhZHkgc2F2ZWQgdGhlIHNhbWUgZGF0YVxuXHRcdGNvbnN0IHNBcHBTdGF0ZUtleUNhY2hlZCA9IHRoaXMuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuc0FwcFN0YXRlS2V5O1xuXG5cdFx0Y29uc3QgYklubmVyQXBwRGF0YUVxdWFsID0gSlNPTi5zdHJpbmdpZnkobUlubmVyQXBwRGF0YSkgPT09IEpTT04uc3RyaW5naWZ5KHRoaXMuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEub0FwcERhdGEpO1xuXHRcdGlmIChiSW5uZXJBcHBEYXRhRXF1YWwgJiYgc0FwcFN0YXRlS2V5Q2FjaGVkKSB7XG5cdFx0XHQvLyBwYXNzZWQgaW5uZXIgYXBwIHN0YXRlIGZvdW5kIGluIGNhY2hlXG5cdFx0XHR0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLmlDYWNoZUhpdCsrO1xuXG5cdFx0XHQvLyByZXBsYWNlIGlubmVyIGFwcCBoYXNoIHdpdGggY2FjaGVkIGFwcFN0YXRlS2V5IGluIHVybCAoanVzdCBpbiBjYXNlIHRoZSBhcHAgaGFzIGNoYW5nZWQgdGhlIGhhc2ggaW4gbWVhbnRpbWUpXG5cdFx0XHRmblJlcGxhY2VIYXNoKHNBcHBTdGF0ZUtleUNhY2hlZCk7XG5cdFx0XHRvTXlEZWZlcnJlZC5yZXNvbHZlKHNBcHBTdGF0ZUtleUNhY2hlZCk7XG5cdFx0XHRyZXR1cm4gb015RGVmZXJyZWQucHJvbWlzZSgpO1xuXHRcdH1cblxuXHRcdC8vIHBhc3NlZCBpbm5lciBhcHAgc3RhdGUgbm90IGZvdW5kIGluIGNhY2hlXG5cdFx0dGhpcy5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5pQ2FjaGVNaXNzKys7XG5cblx0XHRjb25zdCBmbk9uQWZ0ZXJTYXZlID0gZnVuY3Rpb24gKHNBcHBTdGF0ZUtleTogYW55KSB7XG5cdFx0XHQvLyByZXBsYWNlIGlubmVyIGFwcCBoYXNoIHdpdGggbmV3IGFwcFN0YXRlS2V5IGluIHVybFxuXHRcdFx0aWYgKCFiU2tpcEhhc2hSZXBsYWNlICYmICFiSW1tZWRpYXRlSGFzaFJlcGxhY2UpIHtcblx0XHRcdFx0Zm5SZXBsYWNlSGFzaChzQXBwU3RhdGVLZXkpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyByZW1lbWJlciBsYXN0IHNhdmVkIHN0YXRlXG5cdFx0XHRvTmF2SGFuZGxlci5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5vQXBwRGF0YSA9IG1Jbm5lckFwcERhdGE7XG5cdFx0XHRvTmF2SGFuZGxlci5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5zQXBwU3RhdGVLZXkgPSBzQXBwU3RhdGVLZXk7XG5cdFx0XHRvTXlEZWZlcnJlZC5yZXNvbHZlKHNBcHBTdGF0ZUtleSk7XG5cdFx0fTtcblxuXHRcdGNvbnN0IGZuT25FcnJvciA9IGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0b015RGVmZXJyZWQucmVqZWN0KG9FcnJvcik7XG5cdFx0fTtcblxuXHRcdHRoaXMuX3NhdmVBcHBTdGF0ZUFzeW5jKG1Jbm5lckFwcERhdGEsIGZuT25BZnRlclNhdmUsIGZuT25FcnJvcilcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChzQXBwU3RhdGVLZXk6IGFueSkge1xuXHRcdFx0XHQvKiBOb3RlIHRoYXQgX3NhcEFwcFN0YXRlIG1heSByZXR1cm4gJ3VuZGVmaW5lZCcgaW4gY2FzZSB0aGF0IHRoZSBwYXJzaW5nIGhhcyBmYWlsZWQuIEluIHRoaXMgY2FzZSwgd2Ugc2hvdWxkIG5vdCB0cmlnZ2VyIHRoZSByZXBsYWNlbWVudFxuXHRcdFx0XHQgKiBvZiB0aGUgQXBwIEhhc2ggd2l0aCB0aGUgZ2VuZXJhdGVkIGtleSwgYXMgdGhlIGNvbnRhaW5lciB3YXMgbm90IHdyaXR0ZW4gYmVmb3JlLiBOb3RlIGFzIHdlbGwgdGhhdCB0aGUgZXJyb3IgaGFuZGxpbmcgaGFzIGFscmVhZHlcblx0XHRcdFx0ICogaGFwcGVuZWQgYmVmb3JlIGJ5IG1ha2luZyB0aGUgb015RGVmZXJyZWQgcHJvbWlzZSBmYWlsIChzZWUgZm5PbkVycm9yIGFib3ZlKS5cblx0XHRcdFx0ICovXG5cdFx0XHRcdGlmIChzQXBwU3RhdGVLZXkgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdC8vIHJlcGxhY2UgaW5uZXIgYXBwIGhhc2ggd2l0aCBuZXcgYXBwU3RhdGVLZXkgaW4gdXJsXG5cdFx0XHRcdFx0Ly8gbm90ZTogd2UgZG8gbm90IHdhaXQgZm9yIHRoZSBzYXZlIHRvIGJlIGNvbXBsZXRlZDogdGhpcyBhc3luY2hyb25vdXNseSBiZWhhdmlvdXIgaXMgbmVjZXNzYXJ5IGlmXG5cdFx0XHRcdFx0Ly8gdGhpcyBtZXRob2QgaXMgY2FsbGVkIGUuZy4gaW4gYSBvbkxpbmtQcmVzc2VkIGV2ZW50IHdpdGggbm8gcG9zc2liaWxpdHkgdG8gd2FpdCBmb3IgdGhlIHByb21pc2UgcmVzb2x1dGlvblxuXHRcdFx0XHRcdGlmICghYlNraXBIYXNoUmVwbGFjZSAmJiBiSW1tZWRpYXRlSGFzaFJlcGxhY2UpIHtcblx0XHRcdFx0XHRcdGZuUmVwbGFjZUhhc2goc0FwcFN0YXRlS2V5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5fc2F2ZUFwcFN0YXRlQXN5bmMgZmFpbGVkXCIpO1xuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gb015RGVmZXJyZWQucHJvbWlzZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoYW5nZXMgdGhlIFVSTCBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgYXBwIHN0YXRlIGFuZCBzdG9yZXMgdGhlIGFwcCBzdGF0ZSBmb3IgbGF0ZXIgcmV0cmlldmFsLlxuXHQgKlxuXHQgKiBAcGFyYW0gbUlubmVyQXBwRGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgYXBwXG5cdCAqIEBwYXJhbSBiSW1tZWRpYXRlSGFzaFJlcGxhY2UgSWYgc2V0IHRvIGZhbHNlLCB0aGUgaW5uZXIgYXBwIGhhc2ggd2lsbCBub3QgYmUgcmVwbGFjZWQgdW50aWwgc3RvcmluZyBpcyBzdWNjZXNzZnVsOyBkbyBub3Rcblx0ICogICAgICAgIHNldCB0byBmYWxzZSBpZiB5b3UgY2Fubm90IHJlYWN0IHRvIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBQcm9taXNlLCBmb3IgZXhhbXBsZSwgd2hlbiBjYWxsaW5nIHRoZSBiZWZvcmVMaW5rUHJlc3NlZCBldmVudFxuXHQgKiBAcmV0dXJucyBBIFByb21pc2Ugb2JqZWN0IHRvIG1vbml0b3Igd2hlbiBhbGwgdGhlIGFjdGlvbnMgb2YgdGhlIGZ1bmN0aW9uIGhhdmUgYmVlbiBleGVjdXRlZDsgaWYgdGhlIGV4ZWN1dGlvbiBpcyBzdWNjZXNzZnVsLCB0aGVcblx0ICogICAgICAgICAgYXBwIHN0YXRlIGtleSBpcyByZXR1cm5lZDsgaWYgYW4gZXJyb3Igb2NjdXJzLCBhbiBvYmplY3Qgb2YgdHlwZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGlzXG5cdCAqICAgICAgICAgIHJldHVybmVkXG5cdCAqIEBwdWJsaWNcblx0ICogQGV4YW1wbGUgPGNvZGU+XG5cdCAqIHNhcC51aS5kZWZpbmUoW1wic2FwL2ZlL25hdmlnYXRpb24vTmF2aWdhdGlvbkhhbmRsZXJcIl0sIGZ1bmN0aW9uIChOYXZpZ2F0aW9uSGFuZGxlcikge1xuXHQgKiBcdHZhciBvTmF2aWdhdGlvbkhhbmRsZXIgPSBuZXcgTmF2aWdhdGlvbkhhbmRsZXIob0NvbnRyb2xsZXIpO1xuXHQgKiBcdHZhciBtSW5uZXJBcHBEYXRhID0ge1xuXHQgKiBcdFx0c2VsZWN0aW9uVmFyaWFudCA6IG9TbWFydEZpbHRlckJhci5nZXREYXRhU3VpdGVGb3JtYXQoKSxcblx0ICogXHRcdHRhYmxlVmFyaWFudElkIDogb1NtYXJ0VGFibGUuZ2V0Q3VycmVudFZhcmlhbnRJZCgpLFxuXHQgKiBcdFx0Y3VzdG9tRGF0YSA6IG9NeUN1c3RvbURhdGFcblx0ICogXHR9O1xuXHQgKlxuXHQgKiBcdHZhciBvU3RvcmVJbm5lckFwcFN0YXRlUHJvbWlzZSA9IG9OYXZpZ2F0aW9uSGFuZGxlci5zdG9yZUlubmVyQXBwU3RhdGUobUlubmVyQXBwRGF0YSk7XG5cdCAqXG5cdCAqIFx0b1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UuZG9uZShmdW5jdGlvbihzQXBwU3RhdGVLZXkpe1xuXHQgKiBcdFx0Ly95b3VyIGlubmVyIGFwcCBzdGF0ZSBpcyBzYXZlZCBub3csIHNBcHBTdGF0ZUtleSB3YXMgYWRkZWQgdG8gVVJMXG5cdCAqIFx0XHQvL3BlcmZvcm0gYWN0aW9ucyB0aGF0IG11c3QgcnVuIGFmdGVyIHNhdmVcblx0ICogXHR9KTtcblx0ICpcblx0ICogXHRvU3RvcmVJbm5lckFwcFN0YXRlUHJvbWlzZS5mYWlsKGZ1bmN0aW9uKG9FcnJvcil7XG5cdCAqIFx0XHQvL3NvbWUgZXJyb3IgaGFuZGxpbmdcblx0ICogXHR9KTtcblx0ICogfSk7XG5cdCAqIDwvY29kZT5cblx0ICogQGRlcHJlY2F0ZWQgYXMgb2YgdmVyc2lvbiAxLjEwNC4gVXNlIHRoZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXIuc3RvcmVJbm5lckFwcFN0YXRlQXN5bmN9IGluc3RlYWQuXG5cdCAqL1xuXHRzdG9yZUlubmVyQXBwU3RhdGUobUlubmVyQXBwRGF0YTogSW5uZXJBcHBEYXRhLCBiSW1tZWRpYXRlSGFzaFJlcGxhY2U/OiBib29sZWFuKTogalF1ZXJ5LlByb21pc2U8c3RyaW5nPiB7XG5cdFx0TG9nLmVycm9yKFxuXHRcdFx0XCJEZXByZWNhdGVkIEFQSSBjYWxsIG9mICdzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlci5zdG9yZUlubmVyQXBwU3RhdGUnLiBQbGVhc2UgdXNlICdzdG9yZUlubmVyQXBwU3RhdGVBc3luYycgaW5zdGVhZFwiLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XCJzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlclwiXG5cdFx0KTtcblx0XHRpZiAodHlwZW9mIGJJbW1lZGlhdGVIYXNoUmVwbGFjZSAhPT0gXCJib29sZWFuXCIpIHtcblx0XHRcdGJJbW1lZGlhdGVIYXNoUmVwbGFjZSA9IHRydWU7IC8vIGRlZmF1bHRcblx0XHR9XG5cdFx0Y29uc3Qgb05hdkhhbmRsZXIgPSB0aGlzO1xuXHRcdGNvbnN0IG9NeURlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCk7XG5cblx0XHRjb25zdCBmblJlcGxhY2VIYXNoID0gZnVuY3Rpb24gKHNBcHBTdGF0ZUtleTogYW55KSB7XG5cdFx0XHRjb25zdCBvSGFzaENoYW5nZXIgPSBvTmF2SGFuZGxlci5vUm91dGVyLm9IYXNoQ2hhbmdlciA/IG9OYXZIYW5kbGVyLm9Sb3V0ZXIub0hhc2hDaGFuZ2VyIDogSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKTtcblx0XHRcdGNvbnN0IHNBcHBIYXNoT2xkID0gb0hhc2hDaGFuZ2VyLmdldEhhc2goKTtcblx0XHRcdC8qXG5cdFx0XHQgKiB1c2UgLmdldEhhc2goKSBoZXJlIGluc3RlYWQgb2YgLmdldEFwcEhhc2goKSB0byBhbHNvIGJlIGFibGUgZGVhbGluZyB3aXRoIGVudmlyb25tZW50cyB3aGVyZSBvbmx5IFNBUFVJNSBpcyBsb2FkZWQgYW5kIHRoZSBVU2hlbGxcblx0XHRcdCAqIGlzIG5vdCBpbml0aWFsaXplZCBwcm9wZXJseS5cblx0XHRcdCAqL1xuXHRcdFx0Y29uc3Qgc0FwcEhhc2hOZXcgPSBvTmF2SGFuZGxlci5fcmVwbGFjZUlubmVyQXBwU3RhdGVLZXkoc0FwcEhhc2hPbGQsIHNBcHBTdGF0ZUtleSk7XG5cdFx0XHRvSGFzaENoYW5nZXIucmVwbGFjZUhhc2goc0FwcEhhc2hOZXcpO1xuXHRcdH07XG5cblx0XHQvLyBpbiBjYXNlIG1Jbm5lckFwcFN0YXRlIGlzIGVtcHR5LCBkbyBub3Qgb3ZlcndyaXRlIHRoZSBsYXN0IHNhdmVkIHN0YXRlXG5cdFx0aWYgKGlzRW1wdHlPYmplY3QobUlubmVyQXBwRGF0YSBhcyBvYmplY3QpKSB7XG5cdFx0XHRvTXlEZWZlcnJlZC5yZXNvbHZlKFwiXCIpO1xuXHRcdFx0cmV0dXJuIG9NeURlZmVycmVkLnByb21pc2UoKTtcblx0XHR9XG5cblx0XHQvLyBjaGVjayBpZiB3ZSBhbHJlYWR5IHNhdmVkIHRoZSBzYW1lIGRhdGFcblx0XHRjb25zdCBzQXBwU3RhdGVLZXlDYWNoZWQgPSB0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLnNBcHBTdGF0ZUtleTtcblxuXHRcdGNvbnN0IGJJbm5lckFwcERhdGFFcXVhbCA9IEpTT04uc3RyaW5naWZ5KG1Jbm5lckFwcERhdGEpID09PSBKU09OLnN0cmluZ2lmeSh0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLm9BcHBEYXRhKTtcblx0XHRpZiAoYklubmVyQXBwRGF0YUVxdWFsICYmIHNBcHBTdGF0ZUtleUNhY2hlZCkge1xuXHRcdFx0Ly8gcGFzc2VkIGlubmVyIGFwcCBzdGF0ZSBmb3VuZCBpbiBjYWNoZVxuXHRcdFx0dGhpcy5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5pQ2FjaGVIaXQrKztcblxuXHRcdFx0Ly8gcmVwbGFjZSBpbm5lciBhcHAgaGFzaCB3aXRoIGNhY2hlZCBhcHBTdGF0ZUtleSBpbiB1cmwgKGp1c3QgaW4gY2FzZSB0aGUgYXBwIGhhcyBjaGFuZ2VkIHRoZSBoYXNoIGluIG1lYW50aW1lKVxuXHRcdFx0Zm5SZXBsYWNlSGFzaChzQXBwU3RhdGVLZXlDYWNoZWQpO1xuXHRcdFx0b015RGVmZXJyZWQucmVzb2x2ZShzQXBwU3RhdGVLZXlDYWNoZWQpO1xuXHRcdFx0cmV0dXJuIG9NeURlZmVycmVkLnByb21pc2UoKTtcblx0XHR9XG5cblx0XHQvLyBwYXNzZWQgaW5uZXIgYXBwIHN0YXRlIG5vdCBmb3VuZCBpbiBjYWNoZVxuXHRcdHRoaXMuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuaUNhY2hlTWlzcysrO1xuXG5cdFx0Y29uc3QgZm5PbkFmdGVyU2F2ZSA9IGZ1bmN0aW9uIChzQXBwU3RhdGVLZXk6IGFueSkge1xuXHRcdFx0Ly8gcmVwbGFjZSBpbm5lciBhcHAgaGFzaCB3aXRoIG5ldyBhcHBTdGF0ZUtleSBpbiB1cmxcblx0XHRcdGlmICghYkltbWVkaWF0ZUhhc2hSZXBsYWNlKSB7XG5cdFx0XHRcdGZuUmVwbGFjZUhhc2goc0FwcFN0YXRlS2V5KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcmVtZW1iZXIgbGFzdCBzYXZlZCBzdGF0ZVxuXHRcdFx0b05hdkhhbmRsZXIuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEub0FwcERhdGEgPSBtSW5uZXJBcHBEYXRhO1xuXHRcdFx0b05hdkhhbmRsZXIuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuc0FwcFN0YXRlS2V5ID0gc0FwcFN0YXRlS2V5O1xuXHRcdFx0b015RGVmZXJyZWQucmVzb2x2ZShzQXBwU3RhdGVLZXkpO1xuXHRcdH07XG5cblx0XHRjb25zdCBmbk9uRXJyb3IgPSBmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdG9NeURlZmVycmVkLnJlamVjdChvRXJyb3IpO1xuXHRcdH07XG5cblx0XHRjb25zdCBzQXBwU3RhdGVLZXkgPSB0aGlzLl9zYXZlQXBwU3RhdGUobUlubmVyQXBwRGF0YSwgZm5PbkFmdGVyU2F2ZSwgZm5PbkVycm9yKTtcblx0XHQvKlxuXHRcdCAqIE5vdGUgdGhhdCBfc2FwQXBwU3RhdGUgbWF5IHJldHVybiAndW5kZWZpbmVkJyBpbiBjYXNlIHRoYXQgdGhlIHBhcnNpbmcgaGFzIGZhaWxlZC4gSW4gdGhpcyBjYXNlLCB3ZSBzaG91bGQgbm90IHRyaWdnZXIgdGhlIHJlcGxhY2VtZW50XG5cdFx0ICogb2YgdGhlIEFwcCBIYXNoIHdpdGggdGhlIGdlbmVyYXRlZCBrZXksIGFzIHRoZSBjb250YWluZXIgd2FzIG5vdCB3cml0dGVuIGJlZm9yZS4gTm90ZSBhcyB3ZWxsIHRoYXQgdGhlIGVycm9yIGhhbmRsaW5nIGhhcyBhbHJlYWR5XG5cdFx0ICogaGFwcGVuZWQgYmVmb3JlIGJ5IG1ha2luZyB0aGUgb015RGVmZXJyZWQgcHJvbWlzZSBmYWlsIChzZWUgZm5PbkVycm9yIGFib3ZlKS5cblx0XHQgKi9cblx0XHRpZiAoc0FwcFN0YXRlS2V5ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIHJlcGxhY2UgaW5uZXIgYXBwIGhhc2ggd2l0aCBuZXcgYXBwU3RhdGVLZXkgaW4gdXJsXG5cdFx0XHQvLyBub3RlOiB3ZSBkbyBub3Qgd2FpdCBmb3IgdGhlIHNhdmUgdG8gYmUgY29tcGxldGVkOiB0aGlzIGFzeW5jaHJvbm91c2x5IGJlaGF2aW91ciBpcyBuZWNlc3NhcnkgaWZcblx0XHRcdC8vIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCBlLmcuIGluIGEgb25MaW5rUHJlc3NlZCBldmVudCB3aXRoIG5vIHBvc3NpYmlsaXR5IHRvIHdhaXQgZm9yIHRoZSBwcm9taXNlIHJlc29sdXRpb25cblx0XHRcdGlmIChiSW1tZWRpYXRlSGFzaFJlcGxhY2UpIHtcblx0XHRcdFx0Zm5SZXBsYWNlSGFzaChzQXBwU3RhdGVLZXkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBvTXlEZWZlcnJlZC5wcm9taXNlKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyB0aGUgVVJMIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBhcHAgc3RhdGUgYW5kIHN0b3JlcyB0aGUgYXBwIHN0YXRlIGZvciBsYXRlciByZXRyaWV2YWwuXG5cdCAqXG5cdCAqIEBwYXJhbSBtSW5uZXJBcHBEYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHBcblx0ICogQHBhcmFtIGJJbW1lZGlhdGVIYXNoUmVwbGFjZSBJZiBzZXQgdG8gZmFsc2UsIHRoZSBpbm5lciBhcHAgaGFzaCB3aWxsIG5vdCBiZSByZXBsYWNlZCB1bnRpbCBzdG9yaW5nIGlzIHN1Y2Nlc3NmdWw7IGRvIG5vdFxuXHQgKiAgICAgICAgc2V0IHRvIGZhbHNlIGlmIHlvdSBjYW5ub3QgcmVhY3QgdG8gdGhlIHJlc29sdXRpb24gb2YgdGhlIFByb21pc2UsIGZvciBleGFtcGxlLCB3aGVuIGNhbGxpbmcgdGhlIGJlZm9yZUxpbmtQcmVzc2VkIGV2ZW50LiA8Yj5Ob3RlOjwvYj5JZlxuXHQgKiAgICAgICAgbm90IHByb3ZpZGVkIGl0IHdpbGwgYmUgdHJlYXRlZCBhcyBzZXQgdG8gZmFsc2UuIDxiPk5vdGU6PC9iPklmIHNldCB0byB0cnVlLCB0aGUgY2FsbGluZyBpbnN0YW5jZSBoYXMgdG8gZW5zdXJlIHRoYXQgYSBmb2xsb3ctb25cblx0ICogICAgICAgIGNhbGwgdG8gPGNvZGU+cmVwbGFjZUhhc2g8L2NvZGU+IHdpbGwgdGFrZSBwbGFjZSFcblx0ICogQHJldHVybnMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGFwcFN0YXRlSWQgYW5kIGEgcHJvbWlzZSBvYmplY3QgdG8gbW9uaXRvciB3aGVuIGFsbCB0aGUgYWN0aW9ucyBvZiB0aGUgZnVuY3Rpb24gaGF2ZSBiZWVuXG5cdCAqICAgICAgICAgIGV4ZWN1dGVkOyBQbGVhc2Ugbm90ZSB0aGF0IHRoZSBhcHBTdGF0ZUtleSBtYXkgYmUgdW5kZWZpbmVkIG9yIGVtcHR5LlxuXHQgKiBAZXhhbXBsZSA8Y29kZT5cblx0ICogc2FwLnVpLmRlZmluZShbXCJzYXAvZmUvbmF2aWdhdGlvbi9OYXZpZ2F0aW9uSGFuZGxlclwiXSwgZnVuY3Rpb24gKE5hdmlnYXRpb25IYW5kbGVyKSB7XG5cdCAqIFx0dmFyIG9OYXZpZ2F0aW9uSGFuZGxlciA9IG5ldyBOYXZpZ2F0aW9uSGFuZGxlcihvQ29udHJvbGxlcik7XG5cdCAqIFx0dmFyIG1Jbm5lckFwcERhdGEgPSB7XG5cdCAqIFx0XHRzZWxlY3Rpb25WYXJpYW50IDogb1NtYXJ0RmlsdGVyQmFyLmdldERhdGFTdWl0ZUZvcm1hdCgpLFxuXHQgKiBcdFx0dGFibGVWYXJpYW50SWQgOiBvU21hcnRUYWJsZS5nZXRDdXJyZW50VmFyaWFudElkKCksXG5cdCAqIFx0XHRjdXN0b21EYXRhIDogb015Q3VzdG9tRGF0YVxuXHQgKiBcdH07XG5cdCAqXG5cdCAqIFx0dmFyIG9TdG9yZUlubmVyQXBwU3RhdGUgPSBzdG9yZUlubmVyQXBwU3RhdGVXaXRoTm9uRGVsYXllZFJldHVybihtSW5uZXJBcHBEYXRhKTtcblx0ICogXHR2YXIgc0FwcFN0YXRlS2V5ID0gb1N0b3JlSW5uZXJBcHBTdGF0ZS5hcHBTdGF0ZUtleTtcblx0ICogXHRpZiAoIXNBcHBTdGF0ZUtleSkge1xuXHQgKiAgICAvLyBubyBhcHBTdGF0ZUtleSBvYnRhaW5lZC4uLlxuXHQgKiBcdH07XG5cdCAqIFx0dmFyIG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlID0gb1N0b3JlSW5uZXJBcHBTdGF0ZS5wcm9taXNlO1xuXHQgKlxuXHQgKiBcdG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlLmRvbmUoZnVuY3Rpb24oc0FwcFN0YXRlS2V5KXtcblx0ICogXHRcdC8veW91ciBpbm5lciBhcHAgc3RhdGUgaXMgc2F2ZWQgbm93LCBzQXBwU3RhdGVLZXkgd2FzIGFkZGVkIHRvIFVSTFxuXHQgKiBcdFx0Ly9wZXJmb3JtIGFjdGlvbnMgdGhhdCBtdXN0IHJ1biBhZnRlciBzYXZlXG5cdCAqIFx0fSk7XG5cdCAqXG5cdCAqIFx0b1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UuZmFpbChmdW5jdGlvbihvRXJyb3Ipe1xuXHQgKiBcdFx0Ly9zb21lIGVycm9yIGhhbmRsaW5nXG5cdCAqIFx0fSk7XG5cdCAqIH0pO1xuXHQgKiA8L2NvZGU+XG5cdCAqIEBwdWJsaWNcblx0ICogQGRlcHJlY2F0ZWQgYXMgb2YgdmVyc2lvbiAxLjEwNC4gVXNlIHRoZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXIuc3RvcmVJbm5lckFwcFN0YXRlQXN5bmN9IGluc3RlYWQuXG5cdCAqL1xuXHRzdG9yZUlubmVyQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuKG1Jbm5lckFwcERhdGE6IElubmVyQXBwRGF0YSwgYkltbWVkaWF0ZUhhc2hSZXBsYWNlPzogYm9vbGVhbikge1xuXHRcdExvZy5lcnJvcihcblx0XHRcdFwiRGVwcmVjYXRlZCBBUEkgY2FsbCBvZiAnc2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXIuc3RvcmVJbm5lckFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybicuIFBsZWFzZSB1c2UgJ3N0b3JlSW5uZXJBcHBTdGF0ZUFzeW5jJyBpbnN0ZWFkXCIsXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcInNhcC5mZS5uYXZpZ2F0aW9uLk5hdmlnYXRpb25IYW5kbGVyXCJcblx0XHQpO1xuXHRcdGlmICh0eXBlb2YgYkltbWVkaWF0ZUhhc2hSZXBsYWNlICE9PSBcImJvb2xlYW5cIikge1xuXHRcdFx0YkltbWVkaWF0ZUhhc2hSZXBsYWNlID0gZmFsc2U7IC8vIGRlZmF1bHRcblx0XHR9XG5cblx0XHRjb25zdCBvTmF2SGFuZGxlciA9IHRoaXM7XG5cdFx0Y29uc3Qgb0FwcFN0YXRlUHJvbWlzZSA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuXG5cdFx0Ly8gaW4gY2FzZSBtSW5uZXJBcHBTdGF0ZSBpcyBlbXB0eSwgZG8gbm90IG92ZXJ3cml0ZSB0aGUgbGFzdCBzYXZlZCBzdGF0ZVxuXHRcdGlmIChpc0VtcHR5T2JqZWN0KG1Jbm5lckFwcERhdGEpKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhcHBTdGF0ZUtleTogXCJcIixcblx0XHRcdFx0cHJvbWlzZTogb0FwcFN0YXRlUHJvbWlzZS5yZXNvbHZlKFwiXCIpXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8vIGNoZWNrIGlmIHdlIGFscmVhZHkgc2F2ZWQgdGhlIHNhbWUgZGF0YVxuXHRcdGNvbnN0IHNBcHBTdGF0ZUtleUNhY2hlZCA9IHRoaXMuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuc0FwcFN0YXRlS2V5O1xuXG5cdFx0Y29uc3QgYklubmVyQXBwRGF0YUVxdWFsID0gSlNPTi5zdHJpbmdpZnkobUlubmVyQXBwRGF0YSkgPT09IEpTT04uc3RyaW5naWZ5KHRoaXMuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEub0FwcERhdGEpO1xuXHRcdGlmIChiSW5uZXJBcHBEYXRhRXF1YWwgJiYgc0FwcFN0YXRlS2V5Q2FjaGVkKSB7XG5cdFx0XHQvLyBwYXNzZWQgaW5uZXIgYXBwIHN0YXRlIGZvdW5kIGluIGNhY2hlXG5cdFx0XHR0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLmlDYWNoZUhpdCsrO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0YXBwU3RhdGVLZXk6IHNBcHBTdGF0ZUtleUNhY2hlZCxcblx0XHRcdFx0cHJvbWlzZTogb0FwcFN0YXRlUHJvbWlzZS5yZXNvbHZlKHNBcHBTdGF0ZUtleUNhY2hlZClcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Ly8gcGFzc2VkIGlubmVyIGFwcCBzdGF0ZSBub3QgZm91bmQgaW4gY2FjaGVcblx0XHR0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLmlDYWNoZU1pc3MrKztcblxuXHRcdGNvbnN0IGZuT25BZnRlclNhdmUgPSBmdW5jdGlvbiAoc0FwcFN0YXRlS2V5OiBhbnkpIHtcblx0XHRcdC8vIHJlcGxhY2UgaW5uZXIgYXBwIGhhc2ggd2l0aCBuZXcgYXBwU3RhdGVLZXkgaW4gdXJsXG5cdFx0XHRpZiAoIWJJbW1lZGlhdGVIYXNoUmVwbGFjZSkge1xuXHRcdFx0XHRvTmF2SGFuZGxlci5yZXBsYWNlSGFzaChzQXBwU3RhdGVLZXkpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyByZW1lbWJlciBsYXN0IHNhdmVkIHN0YXRlXG5cdFx0XHRvTmF2SGFuZGxlci5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5vQXBwRGF0YSA9IG1Jbm5lckFwcERhdGE7XG5cdFx0XHRvTmF2SGFuZGxlci5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5zQXBwU3RhdGVLZXkgPSBzQXBwU3RhdGVLZXk7XG5cdFx0XHRvQXBwU3RhdGVQcm9taXNlLnJlc29sdmUoc0FwcFN0YXRlS2V5KTtcblx0XHR9O1xuXG5cdFx0Y29uc3QgZm5PbkVycm9yID0gZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRvQXBwU3RhdGVQcm9taXNlLnJlamVjdChvRXJyb3IpO1xuXHRcdH07XG5cblx0XHRjb25zdCBzQXBwU3RhdGVLZXkgPSB0aGlzLl9zYXZlQXBwU3RhdGUobUlubmVyQXBwRGF0YSwgZm5PbkFmdGVyU2F2ZSwgZm5PbkVycm9yKTtcblx0XHQvKlxuXHRcdCAqIE5vdGUgdGhhdCBfc2FwQXBwU3RhdGUgbWF5IHJldHVybiAndW5kZWZpbmVkJyBpbiBjYXNlIHRoYXQgdGhlIHBhcnNpbmcgaGFzIGZhaWxlZC4gSW4gdGhpcyBjYXNlLCB3ZSBzaG91bGQgbm90IHRyaWdnZXIgdGhlIHJlcGxhY2VtZW50XG5cdFx0ICogb2YgdGhlIEFwcCBIYXNoIHdpdGggdGhlIGdlbmVyYXRlZCBrZXksIGFzIHRoZSBjb250YWluZXIgd2FzIG5vdCB3cml0dGVuIGJlZm9yZS4gTm90ZSBhcyB3ZWxsIHRoYXQgdGhlIGVycm9yIGhhbmRsaW5nIGhhcyBhbHJlYWR5XG5cdFx0ICogaGFwcGVuZWQgYmVmb3JlIGJ5IG1ha2luZyB0aGUgb015RGVmZXJyZWQgcHJvbWlzZSBmYWlsIChzZWUgZm5PbkVycm9yIGFib3ZlKS5cblx0XHQgKi9cblx0XHQvLyBpZiAoc0FwcFN0YXRlS2V5ICE9PSB1bmRlZmluZWQpIHtcblx0XHQvLyAvL3JlcGxhY2UgaW5uZXIgYXBwIGhhc2ggd2l0aCBuZXcgYXBwU3RhdGVLZXkgaW4gdXJsXG5cdFx0Ly8gLy9ub3RlOiB3ZSBkbyBub3Qgd2FpdCBmb3IgdGhlIHNhdmUgdG8gYmUgY29tcGxldGVkOiB0aGlzIGFzeW5jaHJvbm91c2x5IGJlaGF2aW91ciBpcyBuZWNlc3NhcnkgaWZcblx0XHQvLyAvL3RoaXMgbWV0aG9kIGlzIGNhbGxlZCBlLmcuIGluIGEgb25MaW5rUHJlc3NlZCBldmVudCB3aXRoIG5vIHBvc3NpYmlsaXR5IHRvIHdhaXQgZm9yIHRoZSBwcm9taXNlIHJlc29sdXRpb25cblx0XHQvLyBpZiAoYkltbWVkaWF0ZUhhc2hSZXBsYWNlKSB7XG5cdFx0Ly8gZm5SZXBsYWNlSGFzaChzQXBwU3RhdGVLZXkpO1xuXHRcdC8vIH1cblx0XHQvLyB9XG5cdFx0cmV0dXJuIHtcblx0XHRcdGFwcFN0YXRlS2V5OiBzQXBwU3RhdGVLZXksXG5cdFx0XHRwcm9taXNlOiBvQXBwU3RhdGVQcm9taXNlLnByb21pc2UoKVxuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogUHJvY2Vzc2VzIG5hdmlnYXRpb24tcmVsYXRlZCB0YXNrcyByZWxhdGVkIHRvIGJlZm9yZVBvcG92ZXJPcGVucyBldmVudCBoYW5kbGluZyBmb3IgdGhlIFNtYXJ0TGluayBjb250cm9sIGFuZCByZXR1cm5zIGEgUHJvbWlzZSBvYmplY3QuIEluXG5cdCAqIHBhcnRpY3VsYXIsIHRoZSBmb2xsb3dpbmcgdGFza3MgYXJlIHBlcmZvcm1lZCBiZWZvcmUgdGhlIFNtYXJ0TGluayBwb3BvdmVyIGNhbiBiZSBvcGVuZWQ6XG5cdCAqIDx1bD5cblx0ICogPGxpPklmIDxjb2RlPm1Jbm5lckFwcERhdGE8L2NvZGU+IGlzIHByb3ZpZGVkLCB0aGlzIGlubmVyIGFwcCBzdGF0ZSBpcyBzYXZlZCBmb3IgYmFjayBuYXZpZ2F0aW9uIGF0IGEgbGF0ZXIgdGltZS48L2xpPlxuXHQgKiA8bGk+VGhlIHRhYmxlIGV2ZW50IHBhcmFtZXRlcnMgKHNlbWFudGljIGF0dHJpYnV0ZXMpIGFuZCB0aGUgc2VsZWN0aW9uIHZhcmlhbnQgZGF0YSBhcmUgY29tYmluZWQgYnkgY2FsbGluZyB0aGUgbWV0aG9kXG5cdCAqIHtAbGluayAjLm1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50IG1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50fS48L2xpPlxuXHQgKiA8bGk+VGhlIGNvbWJpbmVkIGRhdGEgaXMgc2F2ZWQgYXMgdGhlIGNyb3NzIGFwcCBzdGF0ZSB0byBiZSBoYW5kZWQgb3ZlciB0byB0aGUgdGFyZ2V0IGFwcCwgYW5kIHRoZSBjb3JyZXNwb25kaW5nIHNhcC14YXBwLXN0YXRlIGtleSBpcyBzZXRcblx0ICogaW4gdGhlIFVSTC48L2xpPlxuXHQgKiA8bGk+QWxsIHNpbmdsZSBzZWxlY3Rpb25zIChcImluY2x1ZGluZyBlcXVhbFwiKSBvZiB0aGUgY29tYmluZWQgc2VsZWN0aW9uIGRhdGEgYXJlIHBhc3NlZCB0byB0aGUgU21hcnRMaW5rIHBvcG92ZXIgYXMgc2VtYW50aWMgYXR0cmlidXRlcy48L2xpPlxuXHQgKiA8bGk+VGhlIG1ldGhvZCA8Y29kZT5vVGFibGVFdmVudFBhcmFtZXRlcnMub3BlbigpPC9jb2RlPiBpcyBjYWxsZWQuIE5vdGUgdGhhdCB0aGlzIGRvZXMgbm90IHJlYWxseSBvcGVuIHRoZSBwb3BvdmVyLCBidXQgdGhlIFNtYXJ0TGlua1xuXHQgKiBjb250cm9sIHByb2NlZWRzIHdpdGggZmlyaW5nIHRoZSBldmVudCA8Y29kZT5uYXZpZ2F0aW9uVGFyZ2V0c09idGFpbmVkPC9jb2RlPi48L2xpPlxuXHQgKiA8L3VsPi5cblx0ICogPGJyPlxuXHQgKiA8Yj5Ob2RlOjwvYj4gSWYgdGhlIDxjb2RlPm9FeHRlcm5hbEFwcERhdGE8L2NvZGU+IHBhcmFtZXRlciBpcyBub3Qgc3VwcGxpZWQsIHRoZSBleHRlcm5hbCBhcHAgZGF0YSB3aWxsIGJlIGNhbGN1bGF0ZWQgYmFzZWQgb25cblx0ICogdGhlIDxjb2RlPm1Jbm5lckFwcERhdGE8L2NvZGU+IGRhdGEuPGJyPi5cblx0ICpcblx0ICogQHBhcmFtIG9UYWJsZUV2ZW50UGFyYW1ldGVycyBUaGUgcGFyYW1ldGVycyBtYWRlIGF2YWlsYWJsZSBieSB0aGUgU21hcnRUYWJsZSBjb250cm9sIHdoZW4gdGhlIFNtYXJ0TGluayBjb250cm9sIGhhcyBiZWVuIGNsaWNrZWQsXG5cdCAqICAgICAgICBhbiBpbnN0YW5jZSBvZiBhIFBvcE92ZXIgb2JqZWN0XG5cdCAqIEBwYXJhbSBzU2VsZWN0aW9uVmFyaWFudCBTdHJpbmdpZmllZCBKU09OIG9iamVjdCBhcyByZXR1cm5lZCwgZm9yIGV4YW1wbGUsIGZyb20gZ2V0RGF0YVN1aXRlRm9ybWF0KCkgb2YgdGhlIFNtYXJ0RmlsdGVyQmFyIGNvbnRyb2xcblx0ICogQHBhcmFtIG1Jbm5lckFwcERhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGFwcC4gSWYgcHJvdmlkZWQsIG9wZW5pbmcgdGhlIFBvcG92ZXIgaXMgZGVmZXJyZWQgdW50aWwgdGhlXG5cdCAqICAgICAgICBpbm5lciBhcHAgZGF0YSBpcyBzYXZlZCBpbiBhIGNvbnNpc3RlbnQgd2F5LlxuXHQgKiBAcGFyYW0gb0V4dGVybmFsQXBwRGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUgc3RhdGUgd2hpY2ggd2lsbCBiZSBwYXNzZWQgdG8gdGhlIHRhcmdldCBzY3JlZW4uXG5cdCAqIEBwYXJhbSBvRXh0ZXJuYWxBcHBEYXRhLnNlbGVjdGlvblZhcmlhbnQgT2JqZWN0IGNvbnRhaW5pbmcgc2VsZWN0aW9uVmFyaWFudCwgd2hpY2ggd2lsbCBiZSBwYXNzZWQgdG8gdGhlIHRhcmdldCBzY3JlZW4uIElmIG5vdFxuXHQgKiAgICAgICAgc2V0IHRoZSBzU2VsZWN0aW9uVmFyaWFudCB3aWxsIGJlIHVzZWQuXG5cdCAqIEBwYXJhbSBvRXh0ZXJuYWxBcHBEYXRhLnByZXNlbnRhdGlvblZhcmlhbnQgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgdWkgcHJlc2VudGF0aW9uVmFyaWFudCBvZiB0aGUgYXBwLCB3aGljaCB3aWxsIGJlXG5cdCAqICAgICAgICBwYXNzZWQgdG8gdGhlIHRhcmdldCBzY3JlZW5cblx0ICogQHBhcmFtIG9FeHRlcm5hbEFwcERhdGEudmFsdWVUZXh0cyBPYmplY3QgY29udGFpbmluZyB2YWx1ZSBkZXNjcmlwdGlvbnMsIHdoaWNoIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSB0YXJnZXQgc2NyZWVuXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSBvYmplY3QgdG8gbW9uaXRvciB3aGVuIGFsbCBhY3Rpb25zIG9mIHRoZSBmdW5jdGlvbiBoYXZlIGJlZW4gZXhlY3V0ZWQ7IGlmIHRoZSBleGVjdXRpb24gaXMgc3VjY2Vzc2Z1bCwgdGhlXG5cdCAqICAgICAgICAgIG1vZGlmaWVkIG9UYWJsZUV2ZW50UGFyYW1ldGVycyBpcyByZXR1cm5lZDsgaWYgYW4gZXJyb3Igb2NjdXJzLCBhbiBlcnJvciBvYmplY3Qgb2YgdHlwZVxuXHQgKiAgICAgICAgICB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGlzIHJldHVybmVkXG5cdCAqIEBwdWJsaWNcblx0ICogQGV4YW1wbGUgPGNvZGU+XG5cdCAqIHNhcC51aS5kZWZpbmUoW1wic2FwL2ZlL25hdmlnYXRpb24vTmF2aWdhdGlvbkhhbmRsZXJcIiwgXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCJdLCBmdW5jdGlvbiAoTmF2aWdhdGlvbkhhbmRsZXIsIFNlbGVjdGlvblZhcmlhbnQpIHtcblx0ICogXHQvL2V2ZW50IGhhbmRsZXIgZm9yIHRoZSBzbWFydCBsaW5rIGV2ZW50IFwiYmVmb3JlUG9wb3Zlck9wZW5zXCJcblx0ICogXHRcdG9uQmVmb3JlUG9wb3Zlck9wZW5zOiBmdW5jdGlvbihvRXZlbnQpIHtcblx0ICogXHRcdFx0dmFyIG9UYWJsZUV2ZW50UGFyYW1ldGVycyA9IG9FdmVudC5nZXRQYXJhbWV0ZXJzKCk7XG5cdCAqXG5cdCAqIFx0XHRcdHZhciBtSW5uZXJBcHBEYXRhID0ge1xuXHQgKiBcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnQgOiBvU21hcnRGaWx0ZXJCYXIuZ2V0RGF0YVN1aXRlRm9ybWF0KCksXG5cdCAqIFx0XHRcdFx0dGFibGVWYXJpYW50SWQgOiBvU21hcnRUYWJsZS5nZXRDdXJyZW50VmFyaWFudElkKCksXG5cdCAqIFx0XHRcdFx0Y3VzdG9tRGF0YSA6IG9NeUN1c3RvbURhdGFcblx0ICogXHRcdFx0fTtcblx0ICpcblx0ICogXHRcdFx0dmFyIG9TZWxlY3Rpb25WYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQoKTtcblx0ICogXHRcdFx0b1NlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKFwiQ29tcGFueUNvZGVcIiwgXCJJXCIsIFwiRVFcIiwgXCIwMDAxXCIpO1xuXHQgKiBcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oXCJDdXN0b21lclwiLCBcIklcIiwgXCJFUVwiLCBcIkMwMDAxXCIpO1xuXHQgKiBcdFx0XHR2YXIgc1NlbGVjdGlvblZhcmlhbnQ9IG9TZWxlY3Rpb25WYXJpYW50LnRvSlNPTlN0cmluZygpO1xuXHQgKlxuXHQgKiBcdFx0XHR2YXIgb05hdmlnYXRpb25IYW5kbGVyID0gbmV3IE5hdmlnYXRpb25IYW5kbGVyKG9Db250cm9sbGVyKTtcblx0ICogXHRcdFx0dmFyIG9TbWFydExpbmtQcm9taXNlID0gb05hdmlnYXRpb25IYW5kbGVyLnByb2Nlc3NCZWZvcmVTbWFydExpbmtQb3BvdmVyT3BlbnMob1RhYmxlRXZlbnRQYXJhbWV0ZXJzLCBzU2VsZWN0aW9uVmFyaWFudCwgbUlubmVyQXBwRGF0YSk7XG5cdCAqXG5cdCAqIFx0XHRcdG9TbWFydExpbmtQcm9taXNlLmRvbmUoZnVuY3Rpb24ob1RhYmxlRXZlbnRQYXJhbWV0ZXJzKXtcblx0ICogXHRcdFx0XHQvLyBoZXJlIHlvdSBjYW4gYWRkIGNvZGluZyB0aGF0IHNob3VsZCBydW4gYWZ0ZXIgYWxsIGFwcCBzdGF0ZXMgYXJlIHNhdmVkIGFuZCB0aGUgc2VtYW50aWMgYXR0cmlidXRlcyBhcmUgc2V0XG5cdCAqIFx0XHRcdH0pO1xuXHQgKlxuXHQgKiBcdFx0XHRvU21hcnRMaW5rUHJvbWlzZS5mYWlsKGZ1bmN0aW9uKG9FcnJvcil7XG5cdCAqIFx0XHRcdC8vc29tZSBlcnJvciBoYW5kbGluZ1xuXHQgKiBcdFx0XHR9KTtcblx0ICogXHRcdH07XG5cdCAqIFx0fSk7XG5cdCAqIDwvY29kZT5cblx0ICovXG5cdHByb2Nlc3NCZWZvcmVTbWFydExpbmtQb3BvdmVyT3BlbnMoXG5cdFx0b1RhYmxlRXZlbnRQYXJhbWV0ZXJzOiBhbnksXG5cdFx0c1NlbGVjdGlvblZhcmlhbnQ6IHN0cmluZyxcblx0XHRtSW5uZXJBcHBEYXRhPzogSW5uZXJBcHBEYXRhLFxuXHRcdG9FeHRlcm5hbEFwcERhdGE/OiB7XG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50Pzogb2JqZWN0O1xuXHRcdFx0cHJlc2VudGF0aW9uVmFyaWFudD86IG9iamVjdDtcblx0XHRcdHZhbHVlVGV4dHM/OiBvYmplY3Q7XG5cdFx0fVxuXHQpIHtcblx0XHRjb25zdCBvTXlEZWZlcnJlZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuXHRcdGxldCBtU2VtYW50aWNBdHRyaWJ1dGVzOiBhbnk7XG5cdFx0aWYgKG9UYWJsZUV2ZW50UGFyYW1ldGVycyAhPSB1bmRlZmluZWQpIHtcblx0XHRcdG1TZW1hbnRpY0F0dHJpYnV0ZXMgPSBvVGFibGVFdmVudFBhcmFtZXRlcnMuc2VtYW50aWNBdHRyaWJ1dGVzO1xuXHRcdH1cblxuXHRcdGxldCBvWEFwcERhdGFPYmo6IGFueTtcblx0XHRjb25zdCBvTmF2SGFuZGxlcjogTmF2aWdhdGlvbkhhbmRsZXIgPSB0aGlzO1xuXG5cdFx0aWYgKG9FeHRlcm5hbEFwcERhdGEgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0b1hBcHBEYXRhT2JqID0ge307XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9YQXBwRGF0YU9iaiA9IG9FeHRlcm5hbEFwcERhdGE7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZm5TdG9yZVhhcHBBbmRDYWxsT3BlbiA9IGZ1bmN0aW9uIChtU3ViU2VtYW50aWNBdHRyaWJ1dGVzOiBhbnksIHNTdWJTZWxlY3Rpb25WYXJpYW50OiBhbnkpIHtcblx0XHRcdC8vIG1peCB0aGUgc2VtYW50aWMgYXR0cmlidXRlcyAoZS5nLiBmcm9tIHRoZSByb3cgbGluZSkgd2l0aCB0aGUgc2VsZWN0aW9uIHZhcmlhbnQgKGUuZy4gZnJvbSB0aGUgZmlsdGVyIGJhcilcblx0XHRcdHNTdWJTZWxlY3Rpb25WYXJpYW50ID0gb1hBcHBEYXRhT2JqLnNlbGVjdGlvblZhcmlhbnQgfHwgc1N1YlNlbGVjdGlvblZhcmlhbnQgfHwgXCJ7fVwiO1xuXG5cdFx0XHRjb25zdCBpU3VwcHJlc3Npb25CZWhhdmlvciA9IFN1cHByZXNzaW9uQmVoYXZpb3IucmFpc2VFcnJvck9uTnVsbCB8IFN1cHByZXNzaW9uQmVoYXZpb3IucmFpc2VFcnJvck9uVW5kZWZpbmVkO1xuXHRcdFx0Lypcblx0XHRcdCAqIGNvbXBhdGlibGl0eTogVW50aWwgU0FQVUk1IDEuMjguNSAob3IgZXZlbiBsYXRlcikgdGhlIFNtYXJ0IExpbmsgaW4gYSBTbWFydCBUYWJsZSBpcyBmaWx0ZXJpbmcgYWxsIG51bGwtIGFuZCB1bmRlZmluZWQgdmFsdWVzLlxuXHRcdFx0ICogVGhlcmVmb3JlLCBtU2VtYW50aWNBdHRyaWJ1dGVzIGFyZSBhbHJlYWR5IHJlZHVjZWQgYXBwcm9wcmlhdGVseSAtLSB0aGlzIGRvZXMgbm90IG5lZWQgdG8gYmUgZG9uZSBieVxuXHRcdFx0ICogbWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQgYWdhaW4uIFRvIGVuc3VyZSB0aGF0IHdlIHN0aWxsIGhhdmUgdGhlIG9sZCBiZWhhdmlvdXIgKGkuZS4gYW4gTmF2RXJyb3IgaXMgcmFpc2VkIGluIGNhc2UgdGhhdFxuXHRcdFx0ICogYmVoYXZpb3VyIG9mIHRoZSBTbWFydCBMaW5rIGNvbnRyb2wgaGFzIGNoYW5nZWQpLCB0aGUgXCJvbGRcIiBTdXBwcmVzc2lvbiBCZWhhdmlvdXIgaXMgcmV0YWluZWQuXG5cdFx0XHQgKi9cblxuXHRcdFx0Y29uc3Qgb01peGVkU2VsVmFyID0gb05hdkhhbmRsZXIubWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQoXG5cdFx0XHRcdG1TdWJTZW1hbnRpY0F0dHJpYnV0ZXMsXG5cdFx0XHRcdHNTdWJTZWxlY3Rpb25WYXJpYW50LFxuXHRcdFx0XHRpU3VwcHJlc3Npb25CZWhhdmlvclxuXHRcdFx0KTtcblx0XHRcdHNTdWJTZWxlY3Rpb25WYXJpYW50ID0gb01peGVkU2VsVmFyLnRvSlNPTlN0cmluZygpO1xuXG5cdFx0XHQvLyBlbnJpY2ggdGhlIHNlbWFudGljIGF0dHJpYnV0ZXMgd2l0aCBzaW5nbGUgc2VsZWN0aW9ucyBmcm9tIHRoZSBzZWxlY3Rpb24gdmFyaWFudFxuXHRcdFx0bGV0IG9UbXBEYXRhOiBhbnkgPSB7fTtcblx0XHRcdG9UbXBEYXRhLnNlbGVjdGlvblZhcmlhbnQgPSBvTWl4ZWRTZWxWYXIudG9KU09OT2JqZWN0KCk7XG5cblx0XHRcdG9UbXBEYXRhID0gb05hdkhhbmRsZXIuX3JlbW92ZU1lYXN1cmVCYXNlZEluZm9ybWF0aW9uKG9UbXBEYXRhKTtcblxuXHRcdFx0b1RtcERhdGEgPSBvTmF2SGFuZGxlci5fY2hlY2tJc1BvdGVudGlhbGx5U2Vuc2l0aXZlKG9UbXBEYXRhKTtcblxuXHRcdFx0bVN1YlNlbWFudGljQXR0cmlidXRlcyA9IG9UbXBEYXRhLnNlbGVjdGlvblZhcmlhbnRcblx0XHRcdFx0PyBvTmF2SGFuZGxlci5fZ2V0VVJMUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50KG5ldyBTZWxlY3Rpb25WYXJpYW50KG9UbXBEYXRhLnNlbGVjdGlvblZhcmlhbnQpKVxuXHRcdFx0XHQ6IHt9O1xuXG5cdFx0XHRjb25zdCBmbk9uQ29udGFpbmVyU2F2ZSA9IGZ1bmN0aW9uIChzQXBwU3RhdGVLZXk6IGFueSkge1xuXHRcdFx0XHRpZiAob1RhYmxlRXZlbnRQYXJhbWV0ZXJzID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHQvLyBJZiBvVGFibGVFdmVudFBhcmFtZXRlcnMgaXMgdW5kZWZpbmVkLCByZXR1cm4gYm90aCBzZW1hbnRpY0F0dHJpYnV0ZXMgYW5kIGFwcFN0YXRla2V5XG5cdFx0XHRcdFx0b015RGVmZXJyZWQucmVzb2x2ZShtU3ViU2VtYW50aWNBdHRyaWJ1dGVzLCBzQXBwU3RhdGVLZXkpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHNldCB0aGUgc3RvcmVkIGRhdGEgaW4gcG9wb3ZlciBhbmQgY2FsbCBvcGVuKClcblx0XHRcdFx0XHRvVGFibGVFdmVudFBhcmFtZXRlcnMuc2V0U2VtYW50aWNBdHRyaWJ1dGVzKG1TdWJTZW1hbnRpY0F0dHJpYnV0ZXMpO1xuXHRcdFx0XHRcdG9UYWJsZUV2ZW50UGFyYW1ldGVycy5zZXRBcHBTdGF0ZUtleShzQXBwU3RhdGVLZXkpO1xuXHRcdFx0XHRcdG9UYWJsZUV2ZW50UGFyYW1ldGVycy5vcGVuKCk7IC8vID4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+IE5vdGUgdGhhdCBcIm9wZW5cIiBkb2VzIG5vdCBvcGVuIHRoZSBwb3BvdmVyLCBidXQgcHJvY2VlZHNcblx0XHRcdFx0XHQvLyB3aXRoIGZpcmluZyB0aGUgb25OYXZUYXJnZXRzT2J0YWluZWQgZXZlbnQuXG5cdFx0XHRcdFx0b015RGVmZXJyZWQucmVzb2x2ZShvVGFibGVFdmVudFBhcmFtZXRlcnMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRjb25zdCBmbk9uRXJyb3IgPSBmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0b015RGVmZXJyZWQucmVqZWN0KG9FcnJvcik7XG5cdFx0XHR9O1xuXG5cdFx0XHRvWEFwcERhdGFPYmouc2VsZWN0aW9uVmFyaWFudCA9IHNTdWJTZWxlY3Rpb25WYXJpYW50O1xuXG5cdFx0XHRvWEFwcERhdGFPYmogPSBvTmF2SGFuZGxlci5fcmVtb3ZlTWVhc3VyZUJhc2VkSW5mb3JtYXRpb24ob1hBcHBEYXRhT2JqKTtcblxuXHRcdFx0b05hdkhhbmRsZXIuX3NhdmVBcHBTdGF0ZUFzeW5jKG9YQXBwRGF0YU9iaiwgZm5PbkNvbnRhaW5lclNhdmUsIGZuT25FcnJvcik7XG5cdFx0fTtcblxuXHRcdGlmIChtSW5uZXJBcHBEYXRhKSB7XG5cdFx0XHRjb25zdCBvU3RvcmVJbm5lckFwcFN0YXRlUHJvbWlzZSA9IHRoaXMuc3RvcmVJbm5lckFwcFN0YXRlQXN5bmMobUlubmVyQXBwRGF0YSwgdHJ1ZSk7XG5cblx0XHRcdC8vIGlmIHRoZSBpbm5lciBhcHAgc3RhdGUgd2FzIHN1Y2Nlc3NmdWxseSBzdG9yZWQsIHN0b3JlIGFsc28gdGhlIHhhcHAtc3RhdGVcblx0XHRcdG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlLmRvbmUoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRmblN0b3JlWGFwcEFuZENhbGxPcGVuKG1TZW1hbnRpY0F0dHJpYnV0ZXMsIHNTZWxlY3Rpb25WYXJpYW50KTtcblx0XHRcdH0pO1xuXG5cdFx0XHRvU3RvcmVJbm5lckFwcFN0YXRlUHJvbWlzZS5mYWlsKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRvTXlEZWZlcnJlZC5yZWplY3Qob0Vycm9yKTtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyB0aGVyZSBpcyBubyBpbm5lciBhcHAgc3RhdGUgdG8gc2F2ZSwganVzdCBwdXQgdGhlIHBhcmFtZXRlcnMgaW50byB4YXBwLXN0YXRlXG5cdFx0XHRmblN0b3JlWGFwcEFuZENhbGxPcGVuKG1TZW1hbnRpY0F0dHJpYnV0ZXMsIHNTZWxlY3Rpb25WYXJpYW50KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb015RGVmZXJyZWQucHJvbWlzZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb2Nlc3NlcyBzZWxlY3Rpb25WYXJpYW50IHN0cmluZyBhbmQgcmV0dXJucyBhIFByb21pc2Ugb2JqZWN0IChzZW1hbnRpY0F0dHJpYnV0ZXMgYW5kIEFwcFN0YXRlS2V5KS5cblx0ICpcblx0ICogQHBhcmFtIHNTZWxlY3Rpb25WYXJpYW50IFN0cmluZ2lmaWVkIEpTT04gb2JqZWN0XG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSBvYmplY3QgdG8gbW9uaXRvciB3aGVuIGFsbCBhY3Rpb25zIG9mIHRoZSBmdW5jdGlvbiBoYXZlIGJlZW4gZXhlY3V0ZWQ7IGlmIHRoZSBleGVjdXRpb24gaXMgc3VjY2Vzc2Z1bCwgdGhlXG5cdCAqICAgICAgICAgIHNlbWFudGljQXR0cmlidXRlcyBhcyB3ZWxsIGFzIHRoZSBhcHBTdGF0ZUtleSBhcmUgcmV0dXJuZWQ7IGlmIGFuIGVycm9yIG9jY3VycywgYW4gZXJyb3Igb2JqZWN0IG9mIHR5cGVcblx0ICogICAgICAgICAge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpcyByZXR1cm5lZFxuXHQgKiA8YnI+XG5cdCAqIEBleGFtcGxlIDxjb2RlPlxuXHQgKiBzYXAudWkuZGVmaW5lKFtcInNhcC9mZS9uYXZpZ2F0aW9uL05hdmlnYXRpb25IYW5kbGVyXCIsIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiXSwgZnVuY3Rpb24gKE5hdmlnYXRpb25IYW5kbGVyLCBTZWxlY3Rpb25WYXJpYW50KSB7XG5cdCAqIFx0XHR2YXIgb1NlbGVjdGlvblZhcmlhbnQgPSBuZXcgU2VsZWN0aW9uVmFyaWFudCgpO1xuXHQgKiBcdFx0b1NlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKFwiQ29tcGFueUNvZGVcIiwgXCJJXCIsIFwiRVFcIiwgXCIwMDAxXCIpO1xuXHQgKiBcdFx0b1NlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKFwiQ3VzdG9tZXJcIiwgXCJJXCIsIFwiRVFcIiwgXCJDMDAwMVwiKTtcblx0ICogXHRcdHZhciBzU2VsZWN0aW9uVmFyaWFudD0gb1NlbGVjdGlvblZhcmlhbnQudG9KU09OU3RyaW5nKCk7XG5cdCAqXG5cdCAqIFx0XHR2YXIgb05hdmlnYXRpb25IYW5kbGVyID0gbmV3IE5hdmlnYXRpb25IYW5kbGVyKG9Db250cm9sbGVyKTtcblx0ICogXHRcdHZhciBvUHJvbWlzZU9iamVjdCA9IG9OYXZpZ2F0aW9uSGFuZGxlci5fZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzKHNTZWxlY3Rpb25WYXJpYW50KTtcblx0ICpcblx0ICogXHRcdG9Qcm9taXNlT2JqZWN0LmRvbmUoZnVuY3Rpb24ob1NlbWFudGljQXR0cmlidXRlcywgc0FwcFN0YXRlS2V5KXtcblx0ICogXHRcdFx0Ly8gaGVyZSB5b3UgY2FuIGFkZCBjb2RpbmcgdGhhdCBzaG91bGQgcnVuIGFmdGVyIGFsbCBhcHAgc3RhdGUgYW5kIHRoZSBzZW1hbnRpYyBhdHRyaWJ1dGVzIGhhdmUgYmVlbiByZXR1cm5lZC5cblx0ICogXHRcdH0pO1xuXHQgKlxuXHQgKiBcdFx0b1Byb21pc2VPYmplY3QuZmFpbChmdW5jdGlvbihvRXJyb3Ipe1xuXHQgKiBcdFx0XHQvL3NvbWUgZXJyb3IgaGFuZGxpbmdcblx0ICogXHRcdH0pO1xuXHQgKlx0fSk7XG5cdCAqIDwvY29kZT5cblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzKHNTZWxlY3Rpb25WYXJpYW50OiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gdGhpcy5wcm9jZXNzQmVmb3JlU21hcnRMaW5rUG9wb3Zlck9wZW5zKHVuZGVmaW5lZCwgc1NlbGVjdGlvblZhcmlhbnQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcblx0fVxuXG5cdF9taXhBdHRyaWJ1dGVzVG9TZWxWYXJpYW50KG1TZW1hbnRpY0F0dHJpYnV0ZXM6IGFueSwgb1NlbFZhcmlhbnQ6IGFueSwgaVN1cHByZXNzaW9uQmVoYXZpb3I6IGFueSkge1xuXHRcdC8vIGFkZCBhbGwgc2VtYW50aWMgYXR0cmlidXRlcyB0byB0aGUgbWl4ZWQgc2VsZWN0aW9uIHZhcmlhbnRcblx0XHRmb3IgKGNvbnN0IHNQcm9wZXJ0eU5hbWUgaW4gbVNlbWFudGljQXR0cmlidXRlcykge1xuXHRcdFx0aWYgKG1TZW1hbnRpY0F0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoc1Byb3BlcnR5TmFtZSkpIHtcblx0XHRcdFx0Ly8gQSB2YWx1ZSBvZiBhIHNlbWFudGljIGF0dHJpYnV0ZSBtYXkgbm90IGJlIGEgc3RyaW5nLCBidXQgY2FuIGJlIGUuZy4gYSBkYXRlLlxuXHRcdFx0XHQvLyBTaW5jZSB0aGUgc2VsZWN0aW9uIHZhcmlhbnQgYWNjZXB0cyBvbmx5IGEgc3RyaW5nLCB3ZSBoYXZlIHRvIGNvbnZlcnQgaXQgaW4gZGVwZW5kZW5jZSBvZiB0aGUgdHlwZS5cblx0XHRcdFx0bGV0IHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlID0gbVNlbWFudGljQXR0cmlidXRlc1tzUHJvcGVydHlOYW1lXTtcblx0XHRcdFx0aWYgKHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuXHRcdFx0XHRcdC8vIHVzZSB0aGUgc2FtZSBjb252ZXJzaW9uIG1ldGhvZCBmb3IgZGF0ZXMgYXMgdGhlIFNtYXJ0RmlsdGVyQmFyOiB0b0pTT04oKVxuXHRcdFx0XHRcdHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlID0gdlNlbWFudGljQXR0cmlidXRlVmFsdWUudG9KU09OKCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdFx0QXJyYXkuaXNBcnJheSh2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSkgfHxcblx0XHRcdFx0XHQodlNlbWFudGljQXR0cmlidXRlVmFsdWUgJiYgdHlwZW9mIHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlID09PSBcIm9iamVjdFwiKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHR2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSA9IEpTT04uc3RyaW5naWZ5KHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlKTtcblx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgdlNlbWFudGljQXR0cmlidXRlVmFsdWUgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0XHRcdHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlID0gdlNlbWFudGljQXR0cmlidXRlVmFsdWUudG9TdHJpbmcoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICh2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSA9PT0gXCJcIikge1xuXHRcdFx0XHRcdGlmIChpU3VwcHJlc3Npb25CZWhhdmlvciAmIFN1cHByZXNzaW9uQmVoYXZpb3IuaWdub3JlRW1wdHlTdHJpbmcpIHtcblx0XHRcdFx0XHRcdExvZy5pbmZvKFxuXHRcdFx0XHRcdFx0XHRcIlNlbWFudGljIGF0dHJpYnV0ZSBcIiArXG5cdFx0XHRcdFx0XHRcdFx0c1Byb3BlcnR5TmFtZSArXG5cdFx0XHRcdFx0XHRcdFx0XCIgaXMgYW4gZW1wdHkgc3RyaW5nIGFuZCBkdWUgdG8gdGhlIGNob3NlbiBTdXBwcmVzc2lvbiBCZWhpYXZvdXIgaXMgYmVpbmcgaWdub3JlZC5cIlxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICh2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdGlmIChpU3VwcHJlc3Npb25CZWhhdmlvciAmIFN1cHByZXNzaW9uQmVoYXZpb3IucmFpc2VFcnJvck9uTnVsbCkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9JTlBVVFwiKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0TG9nLndhcm5pbmcoXCJTZW1hbnRpYyBhdHRyaWJ1dGUgXCIgKyBzUHJvcGVydHlOYW1lICsgXCIgaXMgbnVsbCBhbmQgaWdub3JlZCBmb3IgbWl4IGluIHRvIHNlbGVjdGlvbiB2YXJpYW50XCIpO1xuXHRcdFx0XHRcdFx0Y29udGludWU7IC8vIGlnbm9yZSFcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodlNlbWFudGljQXR0cmlidXRlVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGlmIChpU3VwcHJlc3Npb25CZWhhdmlvciAmIFN1cHByZXNzaW9uQmVoYXZpb3IucmFpc2VFcnJvck9uVW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRMb2cud2FybmluZyhcIlNlbWFudGljIGF0dHJpYnV0ZSBcIiArIHNQcm9wZXJ0eU5hbWUgKyBcIiBpcyB1bmRlZmluZWQgYW5kIGlnbm9yZWQgZm9yIG1peCBpbiB0byBzZWxlY3Rpb24gdmFyaWFudFwiKTtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICh0eXBlb2YgdlNlbWFudGljQXR0cmlidXRlVmFsdWUgPT09IFwic3RyaW5nXCIgfHwgdlNlbWFudGljQXR0cmlidXRlVmFsdWUgaW5zdGFuY2VvZiBTdHJpbmcpIHtcblx0XHRcdFx0XHRvU2VsVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oc1Byb3BlcnR5TmFtZSwgXCJJXCIsIFwiRVFcIiwgdlNlbWFudGljQXR0cmlidXRlVmFsdWUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVRcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9TZWxWYXJpYW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbWJpbmVzIHRoZSBnaXZlbiBwYXJhbWV0ZXJzIGFuZCBzZWxlY3Rpb24gdmFyaWFudCBpbnRvIGEgbmV3IHNlbGVjdGlvbiB2YXJpYW50IGNvbnRhaW5pbmcgcHJvcGVydGllcyBmcm9tIGJvdGgsIHdpdGggdGhlIHBhcmFtZXRlcnNcblx0ICogb3ZlcnJpZGluZyBleGlzdGluZyBwcm9wZXJ0aWVzIGluIHRoZSBzZWxlY3Rpb24gdmFyaWFudC4gVGhlIG5ldyBzZWxlY3Rpb24gdmFyaWFudCBkb2VzIG5vdCBjb250YWluIGFueSBwYXJhbWV0ZXJzLiBBbGwgcGFyYW1ldGVycyBhcmVcblx0ICogbWVyZ2VkIGludG8gc2VsZWN0IG9wdGlvbnMuIFRoZSBvdXRwdXQgb2YgdGhpcyBmdW5jdGlvbiwgY29udmVydGVkIHRvIGEgSlNPTiBzdHJpbmcsIGNhbiBiZSB1c2VkIGZvciB0aGVcblx0ICoge0BsaW5rICMubmF2aWdhdGUgTmF2aWdhdGlvbkhhbmRsZXIubmF2aWdhdGV9IG1ldGhvZC5cblx0ICpcblx0ICogQHBhcmFtIHZTZW1hbnRpY0F0dHJpYnV0ZXMgT2JqZWN0LyhBcnJheSBvZiBPYmplY3RzKSBjb250YWluaW5nIGtleS92YWx1ZSBwYWlyc1xuXHQgKiBAcGFyYW0gc1NlbGVjdGlvblZhcmlhbnQgVGhlIHNlbGVjdGlvbiB2YXJpYW50IGluIHN0cmluZyBmb3JtYXQgYXMgcHJvdmlkZWQgYnkgdGhlIFNtYXJ0RmlsdGVyQmFyIGNvbnRyb2xcblx0ICogQHBhcmFtIFtpU3VwcHJlc3Npb25CZWhhdmlvcj1zYXAuZmUubmF2aWdhdGlvbi5TdXBwcmVzc2lvbkJlaGF2aW9yLnN0YW5kYXJkXSBJbmRpY2F0ZXMgd2hldGhlciBzZW1hbnRpY1xuXHQgKiAgICAgICAgYXR0cmlidXRlcyB3aXRoIHNwZWNpYWwgdmFsdWVzIChzZWUge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlN1cHByZXNzaW9uQmVoYXZpb3Igc3VwcHJlc3Npb24gYmVoYXZpb3J9KSBtdXN0IGJlXG5cdCAqICAgICAgICBzdXBwcmVzc2VkIGJlZm9yZSB0aGV5IGFyZSBjb21iaW5lZCB3aXRoIHRoZSBzZWxlY3Rpb24gdmFyaWFudDsgc2V2ZXJhbFxuXHQgKiAgICAgICAge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlN1cHByZXNzaW9uQmVoYXZpb3Igc3VwcHJlc3Npb24gYmVoYXZpb3JzfSBjYW4gYmUgY29tYmluZWQgd2l0aCB0aGUgYml0d2lzZSBPUiBvcGVyYXRvclxuXHQgKiAgICAgICAgKHwpXG5cdCAqIEByZXR1cm5zIEluc3RhbmNlIG9mIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5TZWxlY3Rpb25WYXJpYW50fVxuXHQgKiBAcHVibGljXG5cdCAqIEBleGFtcGxlIDxjb2RlPlxuXHQgKiBzYXAudWkuZGVmaW5lKFtcInNhcC9mZS9uYXZpZ2F0aW9uL05hdmlnYXRpb25IYW5kbGVyXCIsIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiXSwgZnVuY3Rpb24gKE5hdmlnYXRpb25IYW5kbGVyLCBTZWxlY3Rpb25WYXJpYW50KSB7XG5cdCAqIFx0dmFyIHZTZW1hbnRpY0F0dHJpYnV0ZXMgPSB7IFwiQ3VzdG9tZXJcIiA6IFwiQzAwMDFcIiB9O1xuXHQgKiBcdG9yXG5cdCAqIFx0dmFyIHZTZW1hbnRpY0F0dHJpYnV0ZXMgPSBbeyBcIkN1c3RvbWVyXCIgOiBcIkMwMDAxXCIgfSx7IFwiQ3VzdG9tZXJcIiA6IFwiQzAwMDJcIiB9XTtcblx0ICogXHR2YXIgc1NlbGVjdGlvblZhcmlhbnQgPSBvU21hcnRGaWx0ZXJCYXIuZ2V0RGF0YVN1aXRlRm9ybWF0KCk7XG5cdCAqIFx0dmFyIG9OYXZpZ2F0aW9uSGFuZGxlciA9IG5ldyBOYXZpZ2F0aW9uSGFuZGxlcihvQ29udHJvbGxlcik7XG5cdCAqIFx0dmFyIHNOYXZpZ2F0aW9uU2VsZWN0aW9uVmFyaWFudCA9IG9OYXZpZ2F0aW9uSGFuZGxlci5taXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudCh2U2VtYW50aWNBdHRyaWJ1dGVzLCBzU2VsZWN0aW9uVmFyaWFudCkudG9KU09OU3RyaW5nKCk7XG5cdCAqIFx0Ly8gSW4gY2FzZSBvZiBhbiB2U2VtYW50aWNBdHRyaWJ1dGVzIGJlaW5nIGFuIGFycmF5LCB0aGUgc2VtYW50aWNBdHRyaWJ1dGVzIGFyZSBtZXJnZWQgdG8gYSBzaW5nbGUgU1YgYW5kIGNvbXBhcmVkIGFnYWluc3QgdGhlIHNTZWxlY3Rpb25WYXJpYW50KHNlY29uZCBhZ3J1bWVudCkuXG5cdCAqIFx0Ly8gT3B0aW9uYWxseSwgeW91IGNhbiBzcGVjaWZ5IG9uZSBvciBzZXZlcmFsIHN1cHByZXNzaW9uIGJlaGF2aW9ycy4gU2V2ZXJhbCBzdXBwcmVzc2lvbiBiZWhhdmlvcnMgYXJlIGNvbWJpbmVkIHdpdGggdGhlIGJpdHdpc2UgT1Igb3BlcmF0b3IsIGUuZy5cblx0ICogXHQvLyB2YXIgaVN1cHByZXNzaW9uQmVoYXZpb3IgPSBzYXAuZmUubmF2aWdhdGlvbi5TdXBwcmVzc2lvbkJlaGF2aW9yLnJhaXNlRXJyb3JPbk51bGwgfCBzYXAuZmUubmF2aWdhdGlvbi5TdXBwcmVzc2lvbkJlaGF2aW9yLnJhaXNlRXJyb3JPblVuZGVmaW5lZDtcblx0ICogXHQvLyB2YXIgc05hdmlnYXRpb25TZWxlY3Rpb25WYXJpYW50ID0gb05hdmlnYXRpb25IYW5kbGVyLm1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50KG1TZW1hbnRpY0F0dHJpYnV0ZXMsIHNTZWxlY3Rpb25WYXJpYW50LCBpU3VwcHJlc3Npb25CZWhhdmlvcikudG9KU09OU3RyaW5nKCk7XG5cdCAqXG5cdCAqIFx0b05hdmlnYXRpb25IYW5kbGVyLm5hdmlnYXRlKFwiU2FsZXNPcmRlclwiLCBcImNyZWF0ZVwiLCBzTmF2aWdhdGlvblNlbGVjdGlvblZhcmlhbnQpO1xuXHQgKiB9KTtcblx0ICogPC9jb2RlPlxuXHQgKi9cblx0bWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQoXG5cdFx0dlNlbWFudGljQXR0cmlidXRlczogb2JqZWN0IHwgYW55W10sXG5cdFx0c1NlbGVjdGlvblZhcmlhbnQ6IHN0cmluZyB8IFNlcmlhbGl6ZWRTZWxlY3Rpb25WYXJpYW50LFxuXHRcdGlTdXBwcmVzc2lvbkJlaGF2aW9yPzogbnVtYmVyXG5cdCk6IFNlbGVjdGlvblZhcmlhbnQge1xuXHRcdGNvbnN0IG9TZWxlY3Rpb25WYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQoc1NlbGVjdGlvblZhcmlhbnQpO1xuXHRcdGNvbnN0IG9OZXdTZWxWYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQoKTtcblx0XHRjb25zdCBvTmF2SGFuZGxlciA9IHRoaXM7XG5cblx0XHRjb25zdCBmaWx0ZXJVcmwgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRGaWx0ZXJDb250ZXh0VXJsKCk7XG5cdFx0aWYgKGZpbHRlclVybCkge1xuXHRcdFx0b05ld1NlbFZhcmlhbnQuc2V0RmlsdGVyQ29udGV4dFVybChmaWx0ZXJVcmwpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGNvbnRleHRVcmwgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRQYXJhbWV0ZXJDb250ZXh0VXJsKCk7XG5cdFx0aWYgKGNvbnRleHRVcmwpIHtcblx0XHRcdG9OZXdTZWxWYXJpYW50LnNldFBhcmFtZXRlckNvbnRleHRVcmwoY29udGV4dFVybCk7XG5cdFx0fVxuXHRcdGlmIChBcnJheS5pc0FycmF5KHZTZW1hbnRpY0F0dHJpYnV0ZXMpKSB7XG5cdFx0XHR2U2VtYW50aWNBdHRyaWJ1dGVzLmZvckVhY2goZnVuY3Rpb24gKG1TZW1hbnRpY0F0dHJpYnV0ZXM6IGFueSkge1xuXHRcdFx0XHRvTmF2SGFuZGxlci5fbWl4QXR0cmlidXRlc1RvU2VsVmFyaWFudChtU2VtYW50aWNBdHRyaWJ1dGVzLCBvTmV3U2VsVmFyaWFudCwgaVN1cHByZXNzaW9uQmVoYXZpb3IpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX21peEF0dHJpYnV0ZXNUb1NlbFZhcmlhbnQodlNlbWFudGljQXR0cmlidXRlcywgb05ld1NlbFZhcmlhbnQsIGlTdXBwcmVzc2lvbkJlaGF2aW9yKTtcblx0XHR9XG5cblx0XHQvLyBhZGQgcGFyYW1ldGVycyB0aGF0IGFyZSBub3QgcGFydCBvZiB0aGUgb05ld1NlbFZhcmlhbnQgeWV0XG5cdFx0Y29uc3QgYVBhcmFtZXRlcnMgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRQYXJhbWV0ZXJOYW1lcygpO1xuXHRcdGxldCBpO1xuXHRcdGZvciAoaSA9IDA7IGkgPCBhUGFyYW1ldGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKCFvTmV3U2VsVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oYVBhcmFtZXRlcnNbaV0pKSB7XG5cdFx0XHRcdG9OZXdTZWxWYXJpYW50LmFkZFNlbGVjdE9wdGlvbihhUGFyYW1ldGVyc1tpXSwgXCJJXCIsIFwiRVFcIiwgb1NlbGVjdGlvblZhcmlhbnQuZ2V0UGFyYW1ldGVyKGFQYXJhbWV0ZXJzW2ldKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gYWRkIHNlbE9wdGlvbnMgdGhhdCBhcmUgbm90IHBhcnQgb2YgdGhlIG9OZXdTZWxWYXJpYW50IHlldFxuXHRcdGNvbnN0IGFTZWxPcHRpb25OYW1lcyA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCk7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGFTZWxPcHRpb25OYW1lcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Ly8gYWRkIHNlbE9wdGlvbnMgdGhhdCBhcmUgbm90IHBhcnQgb2YgdGhlIG9OZXdTZWxWYXJpYW50IHlldFxuXHRcdFx0Y29uc3QgYVNlbGVjdE9wdGlvbjogYW55W10gPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oYVNlbE9wdGlvbk5hbWVzW2ldKSE7XG5cdFx0XHRpZiAoIW9OZXdTZWxWYXJpYW50LmdldFNlbGVjdE9wdGlvbihhU2VsT3B0aW9uTmFtZXNbaV0pKSB7XG5cdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgYVNlbGVjdE9wdGlvbi5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdG9OZXdTZWxWYXJpYW50LmFkZFNlbGVjdE9wdGlvbihcblx0XHRcdFx0XHRcdGFTZWxPcHRpb25OYW1lc1tpXSxcblx0XHRcdFx0XHRcdGFTZWxlY3RPcHRpb25bal0uU2lnbixcblx0XHRcdFx0XHRcdGFTZWxlY3RPcHRpb25bal0uT3B0aW9uLFxuXHRcdFx0XHRcdFx0YVNlbGVjdE9wdGlvbltqXS5Mb3csXG5cdFx0XHRcdFx0XHRhU2VsZWN0T3B0aW9uW2pdLkhpZ2hcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9OZXdTZWxWYXJpYW50O1xuXHR9XG5cblx0X2Vuc3VyZVNlbGVjdGlvblZhcmlhbnRGb3JtYXRTdHJpbmcodlNlbGVjdGlvblZhcmlhbnQ6IGFueSkge1xuXHRcdC8qXG5cdFx0ICogVGhlcmUgYXJlIGxlZ2FjeSBBcHBTdGF0ZXMgd2hlcmUgdGhlIFNlbGVjdGlvblZhcmlhbnQgaXMgYmVpbmcgc3RvcmVkIGFzIGEgc3RyaW5nLiBIb3dldmVyLCB0aGF0IGlzIG5vdCBjb21wbGlhbnQgdG8gdGhlIHNwZWNpZmljYXRpb24sXG5cdFx0ICogd2hpY2ggc3RhdGVzIHRoYXQgYSBzdGFuZGFyZCBKUyBvYmplY3Qgc2hhbGwgYmUgcHJvdmlkZWQuIEludGVybmFsbHksIGhvd2V2ZXIsIHRoZSBzZWxlY3Rpb25WYXJpYW50IGlzIGFsd2F5cyBvZiB0eXBlIHN0cmluZy4gU2l0dWF0aW9uXG5cdFx0ICogUGVyc2lzdGVuY3kgaW50ZXJuYWwgQVBJIC0tLS0tLS0tLS0tLS0tLS0gLS0tLS0tLS0tLS0tLS0tLS0tIC0tLS0tLS0tLS0tLS0tLS0tLS0tLSBsZWdhY3kgc3RyaW5nIHN0cmluZyBuZXcgYXBwcm9hY2ggKEpTT04pIG9iamVjdFxuXHRcdCAqIHN0cmluZ1xuXHRcdCAqL1xuXG5cdFx0aWYgKHZTZWxlY3Rpb25WYXJpYW50ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0bGV0IHZDb252ZXJ0ZWRTZWxlY3Rpb25WYXJpYW50ID0gdlNlbGVjdGlvblZhcmlhbnQ7XG5cblx0XHRpZiAodHlwZW9mIHZTZWxlY3Rpb25WYXJpYW50ID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHR2Q29udmVydGVkU2VsZWN0aW9uVmFyaWFudCA9IEpTT04uc3RyaW5naWZ5KHZTZWxlY3Rpb25WYXJpYW50KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdkNvbnZlcnRlZFNlbGVjdGlvblZhcmlhbnQ7XG5cdH1cblxuXHRfZm5IYW5kbGVBcHBTdGF0ZVByb21pc2Uob1JldHVybjogYW55LCBmbk9uQWZ0ZXJTYXZlOiBhbnksIGZuT25FcnJvcjogYW55KSB7XG5cdFx0b1JldHVybi5wcm9taXNlLmRvbmUoZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKGZuT25BZnRlclNhdmUpIHtcblx0XHRcdFx0Zm5PbkFmdGVyU2F2ZShvUmV0dXJuLmFwcFN0YXRlS2V5KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGlmIChmbk9uRXJyb3IpIHtcblx0XHRcdGNvbnN0IG9OYXZIYW5kbGVyID0gdGhpcztcblx0XHRcdG9SZXR1cm4ucHJvbWlzZS5mYWlsKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Y29uc3Qgb0Vycm9yID0gb05hdkhhbmRsZXIuX2NyZWF0ZVRlY2huaWNhbEVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuQXBwU3RhdGVTYXZlLmZhaWxlZFwiKTtcblx0XHRcdFx0Zm5PbkVycm9yKG9FcnJvcik7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRfc2F2ZUFwcFN0YXRlQXN5bmMob0FwcERhdGE6IGFueSwgZm5PbkFmdGVyU2F2ZTogYW55LCBmbk9uRXJyb3I6IGFueSkge1xuXHRcdGNvbnN0IG9OYXZIYW5kbGVyID0gdGhpcztcblx0XHRyZXR1cm4gdGhpcy5fZm5TYXZlQXBwU3RhdGVBc3luYyhvQXBwRGF0YSwgZm5PbkVycm9yKS50aGVuKGZ1bmN0aW9uIChvUmV0dXJuOiBhbnkpIHtcblx0XHRcdGlmIChvUmV0dXJuKSB7XG5cdFx0XHRcdG9OYXZIYW5kbGVyLl9mbkhhbmRsZUFwcFN0YXRlUHJvbWlzZShvUmV0dXJuLCBmbk9uQWZ0ZXJTYXZlLCBmbk9uRXJyb3IpO1xuXHRcdFx0XHRyZXR1cm4gb1JldHVybi5hcHBTdGF0ZUtleTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9KTtcblx0fVxuXG5cdF9zYXZlQXBwU3RhdGUob0FwcERhdGE6IGFueSwgZm5PbkFmdGVyU2F2ZTogYW55LCBmbk9uRXJyb3I6IGFueSkge1xuXHRcdGNvbnN0IG9SZXR1cm4gPSB0aGlzLl9zYXZlQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuKG9BcHBEYXRhLCBmbk9uRXJyb3IpO1xuXHRcdGlmIChvUmV0dXJuKSB7XG5cdFx0XHR0aGlzLl9mbkhhbmRsZUFwcFN0YXRlUHJvbWlzZShvUmV0dXJuLCBmbk9uQWZ0ZXJTYXZlLCBmbk9uRXJyb3IpO1xuXHRcdFx0cmV0dXJuIG9SZXR1cm4uYXBwU3RhdGVLZXk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdF9mblNhdmVBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4ob0FwcERhdGE6IGFueSwgb0FwcFN0YXRlOiBhbnksIGZuT25FcnJvcjogYW55KSB7XG5cdFx0Y29uc3Qgc0FwcFN0YXRlS2V5ID0gb0FwcFN0YXRlLmdldEtleSgpO1xuXHRcdGNvbnN0IG9BcHBEYXRhRm9yU2F2ZSA9IHRoaXMuX2ZldGNoQXBwRGF0YUZvclNhdmUob0FwcERhdGEsIGZuT25FcnJvcik7XG5cdFx0aWYgKCFvQXBwRGF0YUZvclNhdmUpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdG9BcHBTdGF0ZS5zZXREYXRhKG9BcHBEYXRhRm9yU2F2ZSk7XG5cdFx0Y29uc3Qgb1NhdmVQcm9taXNlID0gb0FwcFN0YXRlLnNhdmUoKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRhcHBTdGF0ZUtleTogc0FwcFN0YXRlS2V5LFxuXHRcdFx0cHJvbWlzZTogb1NhdmVQcm9taXNlLnByb21pc2UoKVxuXHRcdH07XG5cdH1cblxuXHRfZmV0Y2hBcHBEYXRhRm9yU2F2ZShvQXBwRGF0YTogSW5uZXJBcHBEYXRhLCBmbk9uRXJyb3I6IGFueSkge1xuXHRcdGxldCBvQXBwRGF0YUZvclNhdmU6IFBhcnRpYWw8SW5uZXJBcHBEYXRhPiA9IHt9O1xuXG5cdFx0aWYgKG9BcHBEYXRhLmhhc093blByb3BlcnR5KFwic2VsZWN0aW9uVmFyaWFudFwiKSkge1xuXHRcdFx0b0FwcERhdGFGb3JTYXZlLnNlbGVjdGlvblZhcmlhbnQgPSBvQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50O1xuXG5cdFx0XHRpZiAob0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0XHQvKlxuXHRcdFx0XHQgKiBUaGUgc3BlY2lmaWNhdGlvbiBzdGF0ZXMgdGhhdCBTZWxlY3Rpb24gVmFyaWFudHMgbmVlZCB0byBiZSBKU09OIG9iamVjdHMuIEhvd2V2ZXIsIGludGVybmFsbHksIHdlIHdvcmsgd2l0aCBzdHJpbmdzIGZvclxuXHRcdFx0XHQgKiBcInNlbGVjdGlvblZhcmlhbnRcIi4gVGhlcmVmb3JlLCBpbiBjYXNlIHRoYXQgdGhpcyBpcyBhIHN0cmluZywgd2UgbmVlZCB0byBKU09OLXBhcnNlIHRoZSBkYXRhLlxuXHRcdFx0XHQgKi9cblx0XHRcdFx0aWYgKHR5cGVvZiBvQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdG9BcHBEYXRhRm9yU2F2ZS5zZWxlY3Rpb25WYXJpYW50ID0gSlNPTi5wYXJzZShvQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50KTtcblx0XHRcdFx0XHR9IGNhdGNoICh4KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvRXJyb3IgPSB0aGlzLl9jcmVhdGVUZWNobmljYWxFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLkFwcFN0YXRlU2F2ZS5wYXJzZUVycm9yXCIpO1xuXHRcdFx0XHRcdFx0aWYgKGZuT25FcnJvcikge1xuXHRcdFx0XHRcdFx0XHRmbk9uRXJyb3Iob0Vycm9yKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX3NNb2RlID09PSBNb2RlLk9EYXRhVjIpIHtcblx0XHRcdG9BcHBEYXRhRm9yU2F2ZSA9IGV4dGVuZChcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnQ6IHt9LFxuXHRcdFx0XHRcdHRhYmxlVmFyaWFudElkOiBcIlwiLFxuXHRcdFx0XHRcdGN1c3RvbURhdGE6IHt9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9BcHBEYXRhRm9yU2F2ZVxuXHRcdFx0KSBhcyBJbm5lckFwcERhdGE7XG5cblx0XHRcdGlmIChvQXBwRGF0YS50YWJsZVZhcmlhbnRJZCkge1xuXHRcdFx0XHRvQXBwRGF0YUZvclNhdmUudGFibGVWYXJpYW50SWQgPSBvQXBwRGF0YS50YWJsZVZhcmlhbnRJZDtcblx0XHRcdH1cblx0XHRcdGlmIChvQXBwRGF0YS5jdXN0b21EYXRhKSB7XG5cdFx0XHRcdG9BcHBEYXRhRm9yU2F2ZS5jdXN0b21EYXRhID0gb0FwcERhdGEuY3VzdG9tRGF0YTtcblx0XHRcdH1cblx0XHRcdGlmIChvQXBwRGF0YS5wcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0XHRcdG9BcHBEYXRhRm9yU2F2ZS5wcmVzZW50YXRpb25WYXJpYW50ID0gb0FwcERhdGEucHJlc2VudGF0aW9uVmFyaWFudDtcblx0XHRcdH1cblx0XHRcdGlmIChvQXBwRGF0YS52YWx1ZVRleHRzKSB7XG5cdFx0XHRcdG9BcHBEYXRhRm9yU2F2ZS52YWx1ZVRleHRzID0gb0FwcERhdGEudmFsdWVUZXh0cztcblx0XHRcdH1cblx0XHRcdGlmIChvQXBwRGF0YS5zZW1hbnRpY0RhdGVzKSB7XG5cdFx0XHRcdG9BcHBEYXRhRm9yU2F2ZS5zZW1hbnRpY0RhdGVzID0gb0FwcERhdGEuc2VtYW50aWNEYXRlcztcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgb0FwcERhdGFDbG9uZSA9IE9iamVjdC5hc3NpZ24oe30sIG9BcHBEYXRhKTtcblx0XHRcdG9BcHBEYXRhRm9yU2F2ZSA9IG1lcmdlKG9BcHBEYXRhQ2xvbmUsIG9BcHBEYXRhRm9yU2F2ZSk7XG5cdFx0fVxuXHRcdG9BcHBEYXRhRm9yU2F2ZSA9IHRoaXMuX2NoZWNrSXNQb3RlbnRpYWxseVNlbnNpdGl2ZShvQXBwRGF0YUZvclNhdmUpO1xuXHRcdHJldHVybiBvQXBwRGF0YUZvclNhdmU7XG5cdH1cblxuXHRfZm5TYXZlQXBwU3RhdGVBc3luYyhvQXBwRGF0YTogYW55LCBmbk9uRXJyb3I/OiBhbnkpIHtcblx0XHRjb25zdCBvTmF2SGFuZGxlciA9IHRoaXM7XG5cdFx0cmV0dXJuIHRoaXMuX2dldEFwcE5hdmlnYXRpb25TZXJ2aWNlQXN5bmMoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9Dcm9zc0FwcE5hdlNlcnZpY2U6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0Nyb3NzQXBwTmF2U2VydmljZS5jcmVhdGVFbXB0eUFwcFN0YXRlQXN5bmMob05hdkhhbmRsZXIub0NvbXBvbmVudCk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9BcHBTdGF0ZTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvTmF2SGFuZGxlci5fZm5TYXZlQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuKG9BcHBEYXRhLCBvQXBwU3RhdGUsIGZuT25FcnJvcik7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRpZiAoZm5PbkVycm9yKSB7XG5cdFx0XHRcdFx0Zm5PbkVycm9yKG9FcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHR9XG5cblx0X3NhdmVBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4ob0FwcERhdGE6IGFueSwgZm5PbkVycm9yPzogYW55KSB7XG5cdFx0Y29uc3Qgb0FwcFN0YXRlID0gdGhpcy5fZ2V0QXBwTmF2aWdhdGlvblNlcnZpY2UoKS5jcmVhdGVFbXB0eUFwcFN0YXRlKHRoaXMub0NvbXBvbmVudCk7XG5cdFx0cmV0dXJuIHRoaXMuX2ZuU2F2ZUFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybihvQXBwRGF0YSwgb0FwcFN0YXRlLCBmbk9uRXJyb3IpO1xuXHR9XG5cblx0X2xvYWRBcHBTdGF0ZShzQXBwU3RhdGVLZXk6IGFueSwgb0RlZmVycmVkOiBhbnkpIHtcblx0XHRjb25zdCBvTmF2SGFuZGxlciA9IHRoaXM7XG5cdFx0dGhpcy5fZ2V0QXBwTmF2aWdhdGlvblNlcnZpY2VBc3luYygpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAob0Nyb3NzQXBwTmF2U2VydmljZTogYW55KSB7XG5cdFx0XHRcdGNvbnN0IG9BcHBTdGF0ZVByb21pc2UgPSBvQ3Jvc3NBcHBOYXZTZXJ2aWNlLmdldEFwcFN0YXRlKG9OYXZIYW5kbGVyLm9Db21wb25lbnQsIHNBcHBTdGF0ZUtleSk7XG5cdFx0XHRcdG9BcHBTdGF0ZVByb21pc2UuZG9uZShmdW5jdGlvbiAob0FwcFN0YXRlOiBhbnkpIHtcblx0XHRcdFx0XHRsZXQgb0FwcERhdGE6IGFueSA9IHt9O1xuXHRcdFx0XHRcdGNvbnN0IG9BcHBEYXRhTG9hZGVkID0gb0FwcFN0YXRlLmdldERhdGEoKTtcblxuXHRcdFx0XHRcdGlmICh0eXBlb2Ygb0FwcERhdGFMb2FkZWQgPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9FcnJvciA9IG9OYXZIYW5kbGVyLl9jcmVhdGVUZWNobmljYWxFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLmdldERhdGFGcm9tQXBwU3RhdGUuZmFpbGVkXCIpO1xuXHRcdFx0XHRcdFx0b0RlZmVycmVkLnJlamVjdChvRXJyb3IsIHt9LCBOYXZUeXBlLmlBcHBTdGF0ZSk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChvTmF2SGFuZGxlci5fc01vZGUgPT09IE1vZGUuT0RhdGFWMikge1xuXHRcdFx0XHRcdFx0b0FwcERhdGEgPSB7XG5cdFx0XHRcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnQ6IFwie31cIixcblx0XHRcdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQ6IG5ldyBTZWxlY3Rpb25WYXJpYW50KCksXG5cdFx0XHRcdFx0XHRcdG9EZWZhdWx0ZWRTZWxlY3Rpb25WYXJpYW50OiBuZXcgU2VsZWN0aW9uVmFyaWFudCgpLFxuXHRcdFx0XHRcdFx0XHRiTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5OiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0dGFibGVWYXJpYW50SWQ6IFwiXCIsXG5cdFx0XHRcdFx0XHRcdGN1c3RvbURhdGE6IHt9LFxuXHRcdFx0XHRcdFx0XHRhcHBTdGF0ZUtleTogc0FwcFN0YXRlS2V5LFxuXHRcdFx0XHRcdFx0XHRwcmVzZW50YXRpb25WYXJpYW50OiB7fSxcblx0XHRcdFx0XHRcdFx0dmFsdWVUZXh0czoge30sXG5cdFx0XHRcdFx0XHRcdHNlbWFudGljRGF0ZXM6IHt9XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0aWYgKG9BcHBEYXRhTG9hZGVkLnNlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0ICogSW4gY2FzZSB0aGF0IHdlIGdldCBhbiBvYmplY3QgZnJvbSB0aGUgc3RvcmVkIEFwcERhdGEgKD1wZXJzaXN0ZW5jeSksIHdlIG5lZWQgdG8gc3RyaW5naWZ5IHRoZSBKU09OIG9iamVjdC5cblx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdG9BcHBEYXRhLnNlbGVjdGlvblZhcmlhbnQgPSBvTmF2SGFuZGxlci5fZW5zdXJlU2VsZWN0aW9uVmFyaWFudEZvcm1hdFN0cmluZyhvQXBwRGF0YUxvYWRlZC5zZWxlY3Rpb25WYXJpYW50KTtcblx0XHRcdFx0XHRcdFx0b0FwcERhdGEub1NlbGVjdGlvblZhcmlhbnQgPSBuZXcgU2VsZWN0aW9uVmFyaWFudChvQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChvQXBwRGF0YUxvYWRlZC50YWJsZVZhcmlhbnRJZCkge1xuXHRcdFx0XHRcdFx0XHRvQXBwRGF0YS50YWJsZVZhcmlhbnRJZCA9IG9BcHBEYXRhTG9hZGVkLnRhYmxlVmFyaWFudElkO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKG9BcHBEYXRhTG9hZGVkLmN1c3RvbURhdGEpIHtcblx0XHRcdFx0XHRcdFx0b0FwcERhdGEuY3VzdG9tRGF0YSA9IG9BcHBEYXRhTG9hZGVkLmN1c3RvbURhdGE7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAob0FwcERhdGFMb2FkZWQucHJlc2VudGF0aW9uVmFyaWFudCkge1xuXHRcdFx0XHRcdFx0XHRvQXBwRGF0YS5wcmVzZW50YXRpb25WYXJpYW50ID0gb0FwcERhdGFMb2FkZWQucHJlc2VudGF0aW9uVmFyaWFudDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChvQXBwRGF0YUxvYWRlZC52YWx1ZVRleHRzKSB7XG5cdFx0XHRcdFx0XHRcdG9BcHBEYXRhLnZhbHVlVGV4dHMgPSBvQXBwRGF0YUxvYWRlZC52YWx1ZVRleHRzO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKG9BcHBEYXRhTG9hZGVkLnNlbWFudGljRGF0ZXMpIHtcblx0XHRcdFx0XHRcdFx0b0FwcERhdGEuc2VtYW50aWNEYXRlcyA9IG9BcHBEYXRhTG9hZGVkLnNlbWFudGljRGF0ZXM7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9BcHBEYXRhID0gbWVyZ2Uob0FwcERhdGEsIG9BcHBEYXRhTG9hZGVkKTtcblx0XHRcdFx0XHRcdGlmIChvQXBwRGF0YUxvYWRlZC5zZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdCAqIEluIGNhc2UgdGhhdCB3ZSBnZXQgYW4gb2JqZWN0IGZyb20gdGhlIHN0b3JlZCBBcHBEYXRhICg9cGVyc2lzdGVuY3kpLCB3ZSBuZWVkIHRvIHN0cmluZ2lmeSB0aGUgSlNPTiBvYmplY3QuXG5cdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRvQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50ID0gb05hdkhhbmRsZXIuX2Vuc3VyZVNlbGVjdGlvblZhcmlhbnRGb3JtYXRTdHJpbmcob0FwcERhdGFMb2FkZWQuc2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0XHRcdFx0XHRcdG9BcHBEYXRhLm9TZWxlY3Rpb25WYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQob0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcmVzb2x2ZSBpcyBjYWxsZWQgb24gcGFzc2VkIERlZmVycmVkIG9iamVjdCB0byB0cmlnZ2VyIGEgY2FsbCBvZiB0aGUgZG9uZSBtZXRob2QsIGlmIGltcGxlbWVudGVkXG5cdFx0XHRcdFx0Ly8gdGhlIGRvbmUgbWV0aG9kIHdpbGwgcmVjZWl2ZSB0aGUgbG9hZGVkIGFwcFN0YXRlIGFuZCB0aGUgbmF2aWdhdGlvbiB0eXBlIGFzIHBhcmFtZXRlcnNcblx0XHRcdFx0XHRvRGVmZXJyZWQucmVzb2x2ZShvQXBwRGF0YSwge30sIE5hdlR5cGUuaUFwcFN0YXRlKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdG9BcHBTdGF0ZVByb21pc2UuZmFpbChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0Vycm9yID0gb05hdkhhbmRsZXIuX2NyZWF0ZVRlY2huaWNhbEVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuZ2V0QXBwU3RhdGUuZmFpbGVkXCIpO1xuXHRcdFx0XHRcdG9EZWZlcnJlZC5yZWplY3Qob0Vycm9yLCB7fSwgTmF2VHlwZS5pQXBwU3RhdGUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25zdCBvRXJyb3IgPSBvTmF2SGFuZGxlci5fY3JlYXRlVGVjaG5pY2FsRXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5fZ2V0QXBwTmF2aWdhdGlvblNlcnZpY2VBc3luYy5mYWlsZWRcIik7XG5cdFx0XHRcdG9EZWZlcnJlZC5yZWplY3Qob0Vycm9yLCB7fSwgTmF2VHlwZS5pQXBwU3RhdGUpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBwYXJhbWV0ZXIgdmFsdWUgb2YgdGhlIHNhcC1pYXBwLXN0YXRlICh0aGUgaW50ZXJuYWwgYXBwcykgZnJvbSB0aGUgQXBwSGFzaCBzdHJpbmcuIEl0IGF1dG9tYXRpY2FsbHkgdGFrZXMgY2FyZSBhYm91dFxuXHQgKiBjb21wYXRpYmlsaXR5IGJldHdlZW4gdGhlIG9sZCBhbmQgdGhlIG5ldyBhcHByb2FjaCBvZiB0aGUgc2FwLWlhcHAtc3RhdGUuIFByZWNlZGVuY2UgaXMgdGhhdCB0aGUgbmV3IGFwcHJvYWNoIGlzIGZhdm91cmVkIGFnYWluc3QgdGhlIG9sZFxuXHQgKiBhcHByb2FjaC5cblx0ICpcblx0ICogQHBhcmFtIHNBcHBIYXNoIFRoZSBBcHBIYXNoLCB3aGljaCBtYXkgY29udGFpbiBhIHNhcC1pYXBwLXN0YXRlIHBhcmFtZXRlciAoYm90aCBvbGQgYW5kL29yIG5ldyBhcHByb2FjaClcblx0ICogQHJldHVybnMgVGhlIHZhbHVlIG9mIHNhcC1pYXBwLXN0YXRlIChpLmUuIHRoZSBuYW1lIG9mIHRoZSBjb250YWluZXIgdG8gcmV0cmlldmUgdGhlIHBhcmFtZXRlcnMpLCBvciA8Y29kZT51bmRlZmluZWQ8L2NvZGU+IGluXG5cdCAqICAgICAgICAgY2FzZSB0aGF0IG5vIHNhcC1pYXBwLXN0YXRlIHdhcyBmb3VuZCBpbiA8Y29kZT5zQXBwSGFzaDwvY29kZT4uXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0SW5uZXJBcHBTdGF0ZUtleShzQXBwSGFzaDogc3RyaW5nKSB7XG5cdFx0Ly8gdHJpdmlhbCBjYXNlOiBubyBhcHAgaGFzaCBhdmFpbGFibGUgYXQgYWxsLlxuXHRcdGlmICghc0FwcEhhc2gpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0LyogbmV3IGFwcHJvYWNoOiBzZXBhcmF0ZWQgdmlhIHF1ZXN0aW9uIG1hcmsgLyBwYXJ0IG9mIHRoZSBxdWVyeSBwYXJhbWV0ZXIgb2YgdGhlIEFwcEhhc2ggKi9cblx0XHRsZXQgYU1hdGNoZXMgPSB0aGlzLl9ySUFwcFN0YXRlTmV3LmV4ZWMoc0FwcEhhc2gpO1xuXG5cdFx0Lyogb2xkIGFwcHJvYWNoOiBzcGVhcmF0ZWQgdmlhIHNsYXNoZXMgLyBpLmUuIHBhcnQgb2YgdGhlIHJvdXRlIGl0c2VsZiAqL1xuXHRcdGlmIChhTWF0Y2hlcyA9PT0gbnVsbCkge1xuXHRcdFx0YU1hdGNoZXMgPSB0aGlzLl9ySUFwcFN0YXRlT2xkLmV4ZWMoc0FwcEhhc2gpO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0ICogb2xkIGFwcHJvYWNoOiBzcGVjaWFsIGNhc2U6IGlmIHRoZXJlIGlzIG5vIGRlZXAgcm91dGUva2V5IGRlZmluZWQsIHRoZSBzYXAtaWFwcC1zdGF0ZSBtYXkgYmUgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgc3RyaW5nLCB3aXRob3V0XG5cdFx0ICogYW55IHNlcGFyYXRpb24gd2l0aCB0aGUgc2xhc2hlc1xuXHRcdCAqL1xuXHRcdGlmIChhTWF0Y2hlcyA9PT0gbnVsbCkge1xuXHRcdFx0YU1hdGNoZXMgPSB0aGlzLl9ySUFwcFN0YXRlT2xkQXRTdGFydC5leGVjKHNBcHBIYXNoKTtcblx0XHR9XG5cblx0XHRpZiAoYU1hdGNoZXMgPT09IG51bGwpIHtcblx0XHRcdC8vIHRoZXJlIGlzIG5vICh2YWxpZCkgc2FwLWlhcHAtc3RhdGUgaW4gdGhlIEFwcCBIYXNoXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdHJldHVybiBhTWF0Y2hlc1sxXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXBsYWNlcyAob3IgaW5zZXJ0cykgYSBwYXJhbWV0ZXIgdmFsdWUgKGFuIEFwcFN0YXRlS2V5KSBmb3IgdGhlIHNhcC1pYXBwLXN0YXRlIGludG8gYW4gZXhpc3RpbmcgQXBwSGFzaCBzdHJpbmcuIE90aGVyIHJvdXRlcy9wYXJhbWV0ZXJzXG5cdCAqIGFyZSBpZ25vcmVkIGFuZCByZXR1cm5lZCB3aXRob3V0IG1vZGlmaWNhdGlvbiAoXCJlbnZpcm9ubWVudGFsIGFnbm9zdGljXCIgcHJvcGVydHkpLiBPbmx5IHRoZSBuZXcgYXBwcm9hY2ggKHNhcC1pYXBwLXN0YXRlIGFzIHF1ZXJ5IHBhcmFtZXRlclxuXHQgKiBpbiB0aGUgQXBwSGFzaCkgaXMgYmVpbmcgaXNzdWVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0FwcEhhc2ggVGhlIEFwcEhhc2ggaW50byB3aGljaCB0aGUgc2FwLWlhcHAtc3RhdGUgcGFyYW1ldGVyIHNoYWxsIGJlIG1hZGUgYXZhaWxhYmxlXG5cdCAqIEBwYXJhbSBzQXBwU3RhdGVLZXkgVGhlIGtleSB2YWx1ZSBvZiB0aGUgQXBwU3RhdGUgd2hpY2ggc2hhbGwgYmUgc3RvcmVkIGFzIHBhcmFtZXRlciB2YWx1ZSBvZiB0aGUgc2FwLWlhcHAtc3RhdGUgcHJvcGVydHkuXG5cdCAqIEByZXR1cm5zIFRoZSBtb2RpZmllZCBzQXBwSGFzaCBzdHJpbmcsIHN1Y2ggdGhhdCB0aGUgc2FwLWlhcHAtc3RhdGUgaGFzIGJlZW4gc2V0IGJhc2VkIG9uIHRoZSBuZXcgKHF1ZXJ5IG9wdGlvbi1iYXNlZClcblx0ICogICAgICAgICBzYXAtaWFwcC1zdGF0ZS4gSWYgYSBzYXAtaWFwcC1zdGF0ZSBoYXMgYmVlbiBzcGVjaWZpZWQgYmVmb3JlLCB0aGUga2V5IGlzIHJlcGxhY2VkLiBJZiA8Y29kZT5zQXBwSGFzaDwvY29kZT4gd2FzIG9mIHRoZSBvbGRcblx0ICogICAgICAgICBmb3JtYXQgKHNhcC1pYXBwLXN0YXRlIGFzIHBhcnQgb2YgdGhlIGtleXMvcm91dGUpLCB0aGUgZm9ybWF0IGlzIGNvbnZlcnRlZCB0byB0aGUgbmV3IGZvcm1hdCBiZWZvcmUgdGhlIHJlc3VsdCBpcyByZXR1cm5lZC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9yZXBsYWNlSW5uZXJBcHBTdGF0ZUtleShzQXBwSGFzaDogc3RyaW5nLCBzQXBwU3RhdGVLZXk6IHN0cmluZykge1xuXHRcdGNvbnN0IHNOZXdJQXBwU3RhdGUgPSBJQVBQX1NUQVRFICsgXCI9XCIgKyBzQXBwU3RhdGVLZXk7XG5cblx0XHQvKlxuXHRcdCAqIGdlbmVyYXRlIHNhcC1pYXBwLXN0YXRlcyB3aXRoIHRoZSBuZXcgd2F5XG5cdFx0ICovXG5cdFx0aWYgKCFzQXBwSGFzaCkge1xuXHRcdFx0Ly8gdGhlcmUncyBubyBzQXBwSGFzaCBrZXkgeWV0XG5cdFx0XHRyZXR1cm4gXCI/XCIgKyBzTmV3SUFwcFN0YXRlO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZuQXBwZW5kVG9RdWVyeVBhcmFtZXRlciA9IGZ1bmN0aW9uIChzU3ViQXBwSGFzaDogYW55KSB7XG5cdFx0XHQvLyB0aGVyZSBpcyBhbiBBcHBIYXNoIGF2YWlsYWJsZSwgYnV0IGl0IGRvZXMgbm90IGNvbnRhaW4gYSBzYXAtaWFwcC1zdGF0ZSBwYXJhbWV0ZXIgeWV0IC0gd2UgbmVlZCB0byBhcHBlbmQgb25lXG5cblx0XHRcdC8vIG5ldyBhcHByb2FjaDogd2UgbmVlZCB0byBjaGVjaywgaWYgYSBzZXQgb2YgcXVlcnkgcGFyYW1ldGVycyBpcyBhbHJlYWR5IGF2YWlsYWJsZVxuXHRcdFx0aWYgKHNTdWJBcHBIYXNoLmluZGV4T2YoXCI/XCIpICE9PSAtMSkge1xuXHRcdFx0XHQvLyB0aGVyZSBhcmUgYWxyZWFkeSBxdWVyeSBwYXJhbWV0ZXJzIGF2YWlsYWJsZSAtIGFwcGVuZCBpdCBhcyBhbm90aGVyIHBhcmFtZXRlclxuXHRcdFx0XHRyZXR1cm4gc1N1YkFwcEhhc2ggKyBcIiZcIiArIHNOZXdJQXBwU3RhdGU7XG5cdFx0XHR9XG5cdFx0XHQvLyB0aGVyZSBhcmUgbm8gYSBxdWVyeSBwYXJhbWV0ZXJzIGF2YWlsYWJsZSB5ZXQ7IGNyZWF0ZSBhIHNldCB3aXRoIGEgc2luZ2xlIHBhcmFtZXRlclxuXHRcdFx0cmV0dXJuIHNTdWJBcHBIYXNoICsgXCI/XCIgKyBzTmV3SUFwcFN0YXRlO1xuXHRcdH07XG5cblx0XHRpZiAoIXRoaXMuX2dldElubmVyQXBwU3RhdGVLZXkoc0FwcEhhc2gpKSB7XG5cdFx0XHRyZXR1cm4gZm5BcHBlbmRUb1F1ZXJ5UGFyYW1ldGVyKHNBcHBIYXNoKTtcblx0XHR9XG5cdFx0Ly8gVGhlcmUgaXMgYW4gQXBwSGFzaCBhdmFpbGFibGUgYW5kIHRoZXJlIGlzIGFscmVhZHkgYW4gc2FwLWlhcHAtc3RhdGUgaW4gdGhlIEFwcEhhc2hcblxuXHRcdGlmICh0aGlzLl9ySUFwcFN0YXRlTmV3LnRlc3Qoc0FwcEhhc2gpKSB7XG5cdFx0XHQvLyB0aGUgbmV3IGFwcHJvYWNoIGlzIGJlaW5nIHVzZWRcblx0XHRcdHJldHVybiBzQXBwSGFzaC5yZXBsYWNlKHRoaXMuX3JJQXBwU3RhdGVOZXcsIGZ1bmN0aW9uIChzTmVlZGxlOiBzdHJpbmcpIHtcblx0XHRcdFx0cmV0dXJuIHNOZWVkbGUucmVwbGFjZSgvWz1dLiovZ2ksIFwiPVwiICsgc0FwcFN0YXRlS2V5KTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZSBvbGQgQXBwSGFzaCBlbnRpcmVseSBhbmQgcmVwbGFjZSBpdCB3aXRoIGEgbmV3IG9uZS5cblxuXHRcdGNvbnN0IGZuUmVwbGFjZU9sZEFwcHJvYWNoID0gZnVuY3Rpb24gKHJPbGRBcHByb2FjaDogYW55LCBzU3ViQXBwSGFzaDogYW55KSB7XG5cdFx0XHRzU3ViQXBwSGFzaCA9IHNTdWJBcHBIYXNoLnJlcGxhY2Uock9sZEFwcHJvYWNoLCBcIlwiKTtcblx0XHRcdHJldHVybiBmbkFwcGVuZFRvUXVlcnlQYXJhbWV0ZXIoc1N1YkFwcEhhc2gpO1xuXHRcdH07XG5cblx0XHRpZiAodGhpcy5fcklBcHBTdGF0ZU9sZC50ZXN0KHNBcHBIYXNoKSkge1xuXHRcdFx0cmV0dXJuIGZuUmVwbGFjZU9sZEFwcHJvYWNoKHRoaXMuX3JJQXBwU3RhdGVPbGQsIHNBcHBIYXNoKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fcklBcHBTdGF0ZU9sZEF0U3RhcnQudGVzdChzQXBwSGFzaCkpIHtcblx0XHRcdHJldHVybiBmblJlcGxhY2VPbGRBcHByb2FjaCh0aGlzLl9ySUFwcFN0YXRlT2xkQXRTdGFydCwgc0FwcEhhc2gpO1xuXHRcdH1cblxuXHRcdGFzc2VydChmYWxzZSwgXCJpbnRlcm5hbCBpbmNvbnNpc3RlbmN5OiBBcHByb2FjaCBvZiBzYXAtaWFwcC1zdGF0ZSBub3Qga25vd24sIGJ1dCBfZ2V0SW5uZXJBcHBTdGF0ZUtleSByZXR1cm5lZCBpdFwiKTtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0X2dldFVSTFBhcmFtZXRlcnNGcm9tU2VsZWN0aW9uVmFyaWFudCh2U2VsZWN0aW9uVmFyaWFudDogYW55KSB7XG5cdFx0Y29uc3QgbVVSTFBhcmFtZXRlcnM6IGFueSA9IHt9O1xuXHRcdGxldCBpID0gMDtcblx0XHRsZXQgb1NlbGVjdGlvblZhcmlhbnQ7XG5cblx0XHRpZiAodHlwZW9mIHZTZWxlY3Rpb25WYXJpYW50ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KHZTZWxlY3Rpb25WYXJpYW50KTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2U2VsZWN0aW9uVmFyaWFudCA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0b1NlbGVjdGlvblZhcmlhbnQgPSB2U2VsZWN0aW9uVmFyaWFudDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9JTlBVVFwiKTtcblx0XHR9XG5cblx0XHQvLyBhZGQgVVJMcyBwYXJhbWV0ZXJzIGZyb20gU2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zIChpZiBzaW5nbGUgdmFsdWUpXG5cdFx0Y29uc3QgYVNlbGVjdFByb3BlcnRpZXMgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcygpO1xuXHRcdGZvciAoaSA9IDA7IGkgPCBhU2VsZWN0UHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3QgYVNlbGVjdE9wdGlvbnMgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oYVNlbGVjdFByb3BlcnRpZXNbaV0pO1xuXHRcdFx0aWYgKGFTZWxlY3RPcHRpb25zLmxlbmd0aCA9PT0gMSAmJiBhU2VsZWN0T3B0aW9uc1swXS5TaWduID09PSBcIklcIiAmJiBhU2VsZWN0T3B0aW9uc1swXS5PcHRpb24gPT09IFwiRVFcIikge1xuXHRcdFx0XHRtVVJMUGFyYW1ldGVyc1thU2VsZWN0UHJvcGVydGllc1tpXV0gPSBhU2VsZWN0T3B0aW9uc1swXS5Mb3c7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gYWRkIHBhcmFtZXRlcnMgZnJvbSBTZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlcnNcblx0XHRjb25zdCBhUGFyYW1ldGVyTmFtZXMgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRQYXJhbWV0ZXJOYW1lcygpO1xuXHRcdGZvciAoaSA9IDA7IGkgPCBhUGFyYW1ldGVyTmFtZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IHNQYXJhbWV0ZXJWYWx1ZSA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFBhcmFtZXRlcihhUGFyYW1ldGVyTmFtZXNbaV0pO1xuXG5cdFx0XHRtVVJMUGFyYW1ldGVyc1thUGFyYW1ldGVyTmFtZXNbaV1dID0gc1BhcmFtZXRlclZhbHVlO1xuXHRcdH1cblx0XHRyZXR1cm4gbVVSTFBhcmFtZXRlcnM7XG5cdH1cblxuXHRfY3JlYXRlVGVjaG5pY2FsRXJyb3Ioc0Vycm9yQ29kZTogYW55KSB7XG5cdFx0cmV0dXJuIG5ldyBOYXZFcnJvcihzRXJyb3JDb2RlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBtb2RlbCB0aGF0IGlzIHVzZWQgZm9yIHZlcmlmaWNhdGlvbiBvZiBzZW5zaXRpdmUgaW5mb3JtYXRpb24uIElmIHRoZSBtb2RlbCBpcyBub3Qgc2V0LCB0aGUgdW5uYW1lZCBjb21wb25lbnQgbW9kZWwgaXMgdXNlZCBmb3IgdGhlXG5cdCAqIHZlcmlmaWNhdGlvbiBvZiBzZW5zaXRpdmUgaW5mb3JtYXRpb24uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHBhcmFtIG9Nb2RlbCBGb3IgY2hlY2tpbmcgc2Vuc2l0aXZlIGluZm9ybWF0aW9uXG5cdCAqL1xuXHRzZXRNb2RlbChvTW9kZWw6IFYyT0RhdGFNb2RlbCB8IFY0T0RhdGFNb2RlbCkge1xuXHRcdHRoaXMuX29Nb2RlbCA9IG9Nb2RlbDtcblx0fVxuXG5cdF9nZXRNb2RlbCgpOiBWMk9EYXRhTW9kZWwgfCBWNE9EYXRhTW9kZWwge1xuXHRcdHJldHVybiB0aGlzLl9vTW9kZWwgfHwgdGhpcy5vQ29tcG9uZW50LmdldE1vZGVsKCk7XG5cdH1cblxuXHRfcmVtb3ZlQWxsUHJvcGVydGllcyhvRGF0YTogYW55KSB7XG5cdFx0aWYgKG9EYXRhKSB7XG5cdFx0XHRpZiAob0RhdGEuc2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0XHRvRGF0YS5zZWxlY3Rpb25WYXJpYW50ID0gbnVsbDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9EYXRhLnZhbHVlVGV4dHMpIHtcblx0XHRcdFx0b0RhdGEudmFsdWVUZXh0cyA9IG51bGw7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChvRGF0YS5zZW1hbnRpY0RhdGVzKSB7XG5cdFx0XHRcdG9EYXRhLnNlbWFudGljRGF0ZXMgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdF9yZW1vdmVQcm9wZXJ0aWVzKGFGaWx0ZXJOYW1lOiBhbnksIGFQYXJhbWV0ZXJOYW1lOiBhbnksIG9EYXRhOiBhbnkpIHtcblx0XHRpZiAoYUZpbHRlck5hbWUubGVuZ3RoICYmIG9EYXRhICYmIChvRGF0YS5zZWxlY3Rpb25WYXJpYW50IHx8IG9EYXRhLnZhbHVlVGV4dHMgfHwgb0RhdGEuc2VtYW50aWNEYXRlcykpIHtcblx0XHRcdGFGaWx0ZXJOYW1lLmZvckVhY2goZnVuY3Rpb24gKHNOYW1lOiBhbnkpIHtcblx0XHRcdFx0aWYgKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucykge1xuXHRcdFx0XHRcdG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucy5zb21lKGZ1bmN0aW9uIChvVmFsdWU6IGFueSwgbklkeDogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAoc05hbWUgPT09IG9WYWx1ZS5Qcm9wZXJ0eU5hbWUpIHtcblx0XHRcdFx0XHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zLnNwbGljZShuSWR4LCAxKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvRGF0YS52YWx1ZVRleHRzICYmIG9EYXRhLnZhbHVlVGV4dHMuVGV4dHMpIHtcblx0XHRcdFx0XHRvRGF0YS52YWx1ZVRleHRzLlRleHRzLmZvckVhY2goZnVuY3Rpb24gKG9UZXh0czogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAob1RleHRzLlByb3BlcnR5VGV4dHMpIHtcblx0XHRcdFx0XHRcdFx0b1RleHRzLlByb3BlcnR5VGV4dHMuc29tZShmdW5jdGlvbiAob1ZhbHVlOiBhbnksIG5JZHg6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChzTmFtZSA9PT0gb1ZhbHVlLlByb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b1RleHRzLlByb3BlcnR5VGV4dHMuc3BsaWNlKG5JZHgsIDEpO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvRGF0YS5zZW1hbnRpY0RhdGVzICYmIG9EYXRhLnNlbWFudGljRGF0ZXMuRGF0ZXMpIHtcblx0XHRcdFx0XHRvRGF0YS5zZW1hbnRpY0RhdGVzLkRhdGVzLmZvckVhY2goZnVuY3Rpb24gKG9EYXRlczogYW55LCBuSWR4OiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmIChzTmFtZSA9PT0gb0RhdGVzLlByb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRcdFx0XHRvRGF0YS5zZW1hbnRpY0RhdGVzLkRhdGVzLnNwbGljZShuSWR4LCAxKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKGFQYXJhbWV0ZXJOYW1lLmxlbmd0aCAmJiBvRGF0YSAmJiBvRGF0YS5zZWxlY3Rpb25WYXJpYW50ICYmIG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVycykge1xuXHRcdFx0YVBhcmFtZXRlck5hbWUuZm9yRWFjaChmdW5jdGlvbiAoc05hbWU6IGFueSkge1xuXHRcdFx0XHRvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlcnMuc29tZShmdW5jdGlvbiAob1ZhbHVlOiBhbnksIG5JZHg6IGFueSkge1xuXHRcdFx0XHRcdGlmIChzTmFtZSA9PT0gb1ZhbHVlLlByb3BlcnR5TmFtZSB8fCBcIiRQYXJhbWV0ZXIuXCIgKyBzTmFtZSA9PT0gb1ZhbHVlLlByb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJzLnNwbGljZShuSWR4LCAxKTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRfaXNUZXJtVHJ1ZShvUHJvcGVydHk6IGFueSwgc1Rlcm06IGFueSkge1xuXHRcdGNvbnN0IGZJc1Rlcm1EZWZhdWx0VHJ1ZSA9IGZ1bmN0aW9uIChvVGVybTogYW55KSB7XG5cdFx0XHRpZiAob1Rlcm0pIHtcblx0XHRcdFx0cmV0dXJuIG9UZXJtLkJvb2wgPyBvVGVybS5Cb29sICE9PSBcImZhbHNlXCIgOiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH07XG5cblx0XHRyZXR1cm4gISFvUHJvcGVydHlbc1Rlcm1dICYmIGZJc1Rlcm1EZWZhdWx0VHJ1ZShvUHJvcGVydHlbc1Rlcm1dKTtcblx0fVxuXG5cdF9pc0V4Y2x1ZGVkRnJvbU5hdmlnYXRpb25Db250ZXh0KG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMuX2lzVGVybVRydWUob1Byb3BlcnR5LCBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkV4Y2x1ZGVGcm9tTmF2aWdhdGlvbkNvbnRleHRcIik7XG5cdH1cblxuXHRfaXNQb3RlbnRpYWxseVNlbnNpdGl2ZShvUHJvcGVydHk6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLl9pc1Rlcm1UcnVlKG9Qcm9wZXJ0eSwgXCJjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEuSXNQb3RlbnRpYWxseVNlbnNpdGl2ZVwiKTtcblx0fVxuXG5cdF9pc01lYXN1cmVQcm9wZXJ0eShvUHJvcGVydHk6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLl9pc1Rlcm1UcnVlKG9Qcm9wZXJ0eSwgXCJjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuTWVhc3VyZVwiKTtcblx0fVxuXG5cdF9pc1RvQmVFeGNsdWRlZChvUHJvcGVydHk6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLl9pc1BvdGVudGlhbGx5U2Vuc2l0aXZlKG9Qcm9wZXJ0eSkgfHwgdGhpcy5faXNFeGNsdWRlZEZyb21OYXZpZ2F0aW9uQ29udGV4dChvUHJvcGVydHkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgY3JlYXRlcyBhIGNvbnRleHQgdXJsIGJhc2VkIG9uIHByb3ZpZGVkIGRhdGEuIFRoaXMgY29udGV4dCB1cmwgY2FuIGVpdGhlciBiZSB1c2VkIGFzXG5cdCAqIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlciNzZXRQYXJhbWV0ZXJDb250ZXh0VXJsIFBhcmFtZXRlckNvbnRleHRVcmx9IG9yXG5cdCAqIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlciNzZXRGaWx0ZXJDb250ZXh0VXJsIEZpbHRlckNvbnRleHRVcmx9LlxuXHQgKlxuXHQgKiBAcGFyYW0gc0VudGl0eVNldE5hbWUgVXNlZCBmb3IgdXJsIGRldGVybWluYXRpb25cblx0ICogQHBhcmFtIFtvTW9kZWxdIFVzZWQgZm9yIHVybCBkZXRlcm1pbmF0aW9uLiBJZiBvbWl0dGVkLCB0aGUgTmF2aWdhdGlvbkhhbmRsZXIgbW9kZWwgaXMgdXNlZC5cblx0ICogQHRocm93cyBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGluIGNhc2Ugb2YgbWlzc2luZyBvciB3cm9uZyBwYXNzZWQgcGFyYW1ldGVyc1xuXHQgKiBAcmV0dXJucyBUaGUgY29udGV4dCB1cmwgZm9yIHRoZSBnaXZlbiBlbnRpdGllc1xuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRjb25zdHJ1Y3RDb250ZXh0VXJsKHNFbnRpdHlTZXROYW1lOiBzdHJpbmcsIG9Nb2RlbD86IFYyT0RhdGFNb2RlbCB8IFY0T0RhdGFNb2RlbCkge1xuXHRcdGlmICghc0VudGl0eVNldE5hbWUpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLk5PX0VOVElUWV9TRVRfUFJPVklERURcIik7XG5cdFx0fVxuXG5cdFx0aWYgKG9Nb2RlbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRvTW9kZWwgPSB0aGlzLl9nZXRNb2RlbCgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9jb25zdHJ1Y3RDb250ZXh0VXJsKG9Nb2RlbCkgKyBcIiNcIiArIHNFbnRpdHlTZXROYW1lO1xuXHR9XG5cblx0X2NvbnN0cnVjdENvbnRleHRVcmwob01vZGVsOiBWMk9EYXRhTW9kZWwgfCBWNE9EYXRhTW9kZWwpIHtcblx0XHRsZXQgc1NlcnZlclVybDtcblxuXHRcdGlmIChvTW9kZWwuaXNBPFYyT0RhdGFNb2RlbD4oXCJzYXAudWkubW9kZWwub2RhdGEudjIuT0RhdGFNb2RlbFwiKSkge1xuXHRcdFx0c1NlcnZlclVybCA9IG9Nb2RlbC5fZ2V0U2VydmVyVXJsKCk7XG5cdFx0fSBlbHNlIGlmIChvTW9kZWwuaXNBPFY0T0RhdGFNb2RlbD4oXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFNb2RlbFwiKSkge1xuXHRcdFx0Y29uc3Qgb1NlcnZpY2VVUkkgPSBuZXcgVVJJKG9Nb2RlbC5zU2VydmljZVVybCkuYWJzb2x1dGVUbyhkb2N1bWVudC5iYXNlVVJJKTtcblx0XHRcdHNTZXJ2ZXJVcmwgPSBuZXcgVVJJKFwiL1wiKS5hYnNvbHV0ZVRvKG9TZXJ2aWNlVVJJKS50b1N0cmluZygpO1xuXHRcdH1cblxuXHRcdGlmIChzU2VydmVyVXJsICYmIHNTZXJ2ZXJVcmwubGFzdEluZGV4T2YoXCIvXCIpID09PSBzU2VydmVyVXJsLmxlbmd0aCAtIDEpIHtcblx0XHRcdHNTZXJ2ZXJVcmwgPSBzU2VydmVyVXJsLnN1YnN0cigwLCBzU2VydmVyVXJsLmxlbmd0aCAtIDEpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzU2VydmVyVXJsICsgb01vZGVsLnNTZXJ2aWNlVXJsICsgXCIvJG1ldGFkYXRhXCI7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB2ZXJpZmllcywgaWYgYW55IG9mIHRoZSBwYXNzZWQgcGFyYW1ldGVycy9maWx0ZXJzIGFyZSBtYXJrZWQgYXMgc2Vuc2l0aXZlLCBhbmQgaWYgdGhpcyBpcyB0aGUgY2FzZSByZW1vdmUgdGhvc2UgZnJvbSB0aGUgYXBwXG5cdCAqIGRhdGEuIDxiPk5vdGU6PC9iPiBUbyB1c2UgdGhpcyBtZXRob2QsIHRoZSBtZXRhZGF0YSBtdXN0IGJlIGxvYWRlZCBmaXJzdC5cblx0ICpcblx0ICogQHBhcmFtIG9EYXRhIFdpdGggcG90ZW50aWFsIHNlbnNpdGl2ZSBpbmZvcm1hdGlvbiAoZm9yIE9EYXRhLCBleHRlcm5hbCByZXByZXNlbnRhdGlvbiB1c2luZ1xuXHQgKiA8Y29kZT5vU2VsZWN0aW9uVmFyaWFudC50b0pTT05PYmplY3QoKTwvY29kZT4gbXVzdCBiZSB1c2VkKSwgd2l0aCB0aGUgPGNvZGU+RmlsdGVyQ29udGV4dFVybDwvY29kZT4gb3Jcblx0ICogPGNvZGU+UGFyYW1ldGVyQ29udGV4dFVybDwvY29kZT4gcHJvcGVydHkuXG5cdCAqIEByZXR1cm5zIERhdGEgd2l0aG91dCBwcm9wZXJ0aWVzIG1hcmtlZCBhcyBzZW5zaXRpdmUgb3IgYW4gZW1wdHkgb2JqZWN0IGlmIHRoZSBPRGF0YSBtZXRhZGF0YSBpcyBub3QgZnVsbHkgbG9hZGVkIHlldFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2NoZWNrSXNQb3RlbnRpYWxseVNlbnNpdGl2ZShvRGF0YTogYW55KSB7XG5cdFx0bGV0IG9BZGFwdGVkRGF0YSA9IG9EYXRhO1xuXHRcdGlmIChcblx0XHRcdG9EYXRhICYmXG5cdFx0XHRvRGF0YS5zZWxlY3Rpb25WYXJpYW50ICYmXG5cdFx0XHQoKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuRmlsdGVyQ29udGV4dFVybCAmJiBvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMpIHx8XG5cdFx0XHRcdChvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlckNvbnRleHRVcmwgJiYgb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJzKSlcblx0XHQpIHtcblx0XHRcdGNvbnN0IG9Nb2RlbCA9IHRoaXMuX2dldE1vZGVsKCk7XG5cdFx0XHRpZiAodGhpcy5vQ29tcG9uZW50ICYmIG9Nb2RlbCAmJiBvTW9kZWwuaXNBPFYyT0RhdGFNb2RlbD4oXCJzYXAudWkubW9kZWwub2RhdGEudjIuT0RhdGFNb2RlbFwiKSkge1xuXHRcdFx0XHRjb25zdCBhU2Vuc2l0aXZlRmlsdGVyTmFtZSA9IFtdO1xuXHRcdFx0XHRjb25zdCBhU2Vuc2l0aXZlUGFyYW1ldGVyTmFtZSA9IFtdO1xuXHRcdFx0XHRsZXQgaSxcblx0XHRcdFx0XHRvRW50aXR5U2V0OiBhbnksXG5cdFx0XHRcdFx0b0VudGl0eURlZjogYW55LFxuXHRcdFx0XHRcdG9TdWJFbnRpdHlEZWY6IGFueSxcblx0XHRcdFx0XHRvRW5kUm9sZTogYW55LFxuXHRcdFx0XHRcdGFGaWx0ZXJDb250ZXh0UGFydCA9IFtdLFxuXHRcdFx0XHRcdGFQYXJhbUNvbnRleHRQYXJ0ID0gW107XG5cblx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdFx0aWYgKG9Nb2RlbC5nZXRTZXJ2aWNlTWV0YWRhdGEoKSAmJiBvTWV0YU1vZGVsPy5vTW9kZWwpIHtcblx0XHRcdFx0XHRpZiAob0RhdGEuc2VsZWN0aW9uVmFyaWFudC5GaWx0ZXJDb250ZXh0VXJsKSB7XG5cdFx0XHRcdFx0XHRhRmlsdGVyQ29udGV4dFBhcnQgPSBvRGF0YS5zZWxlY3Rpb25WYXJpYW50LkZpbHRlckNvbnRleHRVcmwuc3BsaXQoXCIjXCIpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdGFGaWx0ZXJDb250ZXh0UGFydC5sZW5ndGggPT09IDIgJiZcblx0XHRcdFx0XHRcdG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucyAmJlxuXHRcdFx0XHRcdFx0dGhpcy5fY29uc3RydWN0Q29udGV4dFVybChvTW9kZWwpLmluZGV4T2YoYUZpbHRlckNvbnRleHRQYXJ0WzBdKSA9PT0gMFxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0b0VudGl0eVNldCA9IG9NZXRhTW9kZWwuZ2V0T0RhdGFFbnRpdHlTZXQoYUZpbHRlckNvbnRleHRQYXJ0WzFdKTtcblx0XHRcdFx0XHRcdGlmIChvRW50aXR5U2V0KSB7XG5cdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShvRW50aXR5U2V0LmVudGl0eVR5cGUpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0b0VudGl0eURlZiA9IG9NZXRhTW9kZWwuZ2V0T0RhdGFFbnRpdHlUeXBlKGFGaWx0ZXJDb250ZXh0UGFydFsxXSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmIChvRW50aXR5RGVmKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvRW50aXR5RGVmICYmIG9FbnRpdHlEZWYucHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgb0VudGl0eURlZi5wcm9wZXJ0eS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuX2lzVG9CZUV4Y2x1ZGVkKG9FbnRpdHlEZWYucHJvcGVydHlbaV0pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFTZW5zaXRpdmVGaWx0ZXJOYW1lLnB1c2gob0VudGl0eURlZi5wcm9wZXJ0eVtpXS5uYW1lKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZi5uYXZpZ2F0aW9uUHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgb0VudGl0eURlZi5uYXZpZ2F0aW9uUHJvcGVydHkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9FbmRSb2xlID0gb01ldGFNb2RlbC5nZXRPRGF0YUFzc29jaWF0aW9uRW5kKG9FbnRpdHlEZWYsIG9FbnRpdHlEZWYubmF2aWdhdGlvblByb3BlcnR5W2ldLm5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFvRW5kUm9sZSB8fCBvRW5kUm9sZS50eXBlID09PSBvRGF0YS5zZWxlY3Rpb25WYXJpYW50LkZpbHRlckNvbnRleHRVcmwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBjaGVjayBpZiB0aGUgZW5kIHJvbGUgaGFzIGNhcmRpbmFsaXR5IDAuLjEgb3IgMVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9FbmRSb2xlLm11bHRpcGxpY2l0eSA9PT0gXCIxXCIgfHwgb0VuZFJvbGUubXVsdGlwbGljaXR5ID09PSBcIjAuLjFcIikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRvU3ViRW50aXR5RGVmID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVR5cGUob0VuZFJvbGUudHlwZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChvU3ViRW50aXR5RGVmICYmIG9TdWJFbnRpdHlEZWYucHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IG9TdWJFbnRpdHlEZWYucHJvcGVydHkubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLl9pc1RvQmVFeGNsdWRlZChvU3ViRW50aXR5RGVmLnByb3BlcnR5W2pdKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhU2Vuc2l0aXZlRmlsdGVyTmFtZS5wdXNoKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYubmF2aWdhdGlvblByb3BlcnR5W2ldLm5hbWUgKyBcIi5cIiArIG9TdWJFbnRpdHlEZWYucHJvcGVydHlbal0ubmFtZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlckNvbnRleHRVcmwpIHtcblx0XHRcdFx0XHRcdGFQYXJhbUNvbnRleHRQYXJ0ID0gb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJDb250ZXh0VXJsLnNwbGl0KFwiI1wiKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRhUGFyYW1Db250ZXh0UGFydC5sZW5ndGggPT09IDIgJiZcblx0XHRcdFx0XHRcdG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVycyAmJlxuXHRcdFx0XHRcdFx0dGhpcy5fY29uc3RydWN0Q29udGV4dFVybChvTW9kZWwpLmluZGV4T2YoYVBhcmFtQ29udGV4dFBhcnRbMF0pID09PSAwXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRvRW50aXR5U2V0ID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVNldChhUGFyYW1Db250ZXh0UGFydFsxXSk7XG5cdFx0XHRcdFx0XHRpZiAob0VudGl0eVNldCkge1xuXHRcdFx0XHRcdFx0XHRvRW50aXR5RGVmID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVR5cGUob0VudGl0eVNldC5lbnRpdHlUeXBlKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShhRmlsdGVyQ29udGV4dFBhcnRbMV0pO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZikge1xuXHRcdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZi5wcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBvRW50aXR5RGVmLnByb3BlcnR5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGhpcy5faXNUb0JlRXhjbHVkZWQob0VudGl0eURlZi5wcm9wZXJ0eVtpXSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YVNlbnNpdGl2ZVBhcmFtZXRlck5hbWUucHVzaChvRW50aXR5RGVmLnByb3BlcnR5W2ldLm5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChhU2Vuc2l0aXZlRmlsdGVyTmFtZS5sZW5ndGggfHwgYVNlbnNpdGl2ZVBhcmFtZXRlck5hbWUubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRvQWRhcHRlZERhdGEgPSBleHRlbmQodHJ1ZSBhcyBhbnksIHt9LCBvQWRhcHRlZERhdGEpO1xuXG5cdFx0XHRcdFx0XHR0aGlzLl9yZW1vdmVQcm9wZXJ0aWVzKGFTZW5zaXRpdmVGaWx0ZXJOYW1lLCBhU2Vuc2l0aXZlUGFyYW1ldGVyTmFtZSwgb0FkYXB0ZWREYXRhKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gYW5ub3RhdGlvbnMgYXJlIG5vdCBsb2FkZWRcblxuXHRcdFx0XHRcdHRoaXMuX3JlbW92ZUFsbFByb3BlcnRpZXMob0FkYXB0ZWREYXRhKTtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlcjogb01ldGFkYXRhIGFyZSBub3QgZnVsbHkgbG9hZGVkIVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLm9Db21wb25lbnQgJiYgb01vZGVsICYmIG9Nb2RlbC5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFNb2RlbFwiKSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fcmVtb3ZlU2Vuc2l0aXZlRGF0YUZvck9EYXRhVjQob0FkYXB0ZWREYXRhKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb0FkYXB0ZWREYXRhO1xuXHR9XG5cblx0X3JlbW92ZU1lYXN1cmVCYXNlZEluZm9ybWF0aW9uKG9BcHBEYXRhOiBhbnkpIHtcblx0XHRsZXQgb0FwcERhdGFGb3JTYXZlID0gb0FwcERhdGE7XG5cblx0XHRpZiAob0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0Lypcblx0XHRcdCAqIFRoZSBzcGVjaWZpY2F0aW9uIHN0YXRlcyB0aGF0IFNlbGVjdGlvbiBWYXJpYW50cyBuZWVkIHRvIGJlIEpTT04gb2JqZWN0cy4gSG93ZXZlciwgaW50ZXJuYWxseSwgd2Ugd29yayB3aXRoIHN0cmluZ3MgZm9yXG5cdFx0XHQgKiBcInNlbGVjdGlvblZhcmlhbnRcIi4gVGhlcmVmb3JlLCBpbiBjYXNlIHRoYXQgdGhpcyBpcyBhIHN0cmluZywgd2UgbmVlZCB0byBKU09OLXBhcnNlIHRoZSBkYXRhLlxuXHRcdFx0ICovXG5cdFx0XHRpZiAodHlwZW9mIG9BcHBEYXRhLnNlbGVjdGlvblZhcmlhbnQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRvQXBwRGF0YUZvclNhdmUuc2VsZWN0aW9uVmFyaWFudCA9IEpTT04ucGFyc2Uob0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0XHRcdH0gY2F0Y2ggKHgpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlcjogX3JlbW92ZU1lYXN1cmVCYXNlZEluZm9ybWF0aW9uIHBhcnNlIGVycm9yXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdG9BcHBEYXRhRm9yU2F2ZSA9IHRoaXMuX3JlbW92ZU1lYXN1cmVCYXNlZFByb3BlcnRpZXMob0FwcERhdGFGb3JTYXZlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb0FwcERhdGFGb3JTYXZlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdmVyaWZpZXMgaWYgYW55IG9mIHRoZSBwYXNzZWQgcGFyYW1ldGVycy9maWx0ZXJzIGFyZSBtYXJrZWQgYXMgYSBtZWFzdXJlLiBJZiB0aGlzIGlzIHRoZSBjYXNlLCB0aGV5IGFyZSByZW1vdmVkIGZyb20gdGhlIHhhcHBcblx0ICogYXBwIGRhdGEuIDxiPk5vdGU6PC9iPiBUbyB1c2UgdGhpcyBtZXRob2QsIHRoZSBtZXRhZGF0YSBtdXN0IGJlIGxvYWRlZCBmaXJzdC5cblx0ICpcblx0ICogQHBhcmFtIG9EYXRhIFdpdGggcG90ZW50aWFsIHNlbnNpdGl2ZSBpbmZvcm1hdGlvbiAoZm9yIE9EYXRhLCBleHRlcm5hbCByZXByZXNlbnRhdGlvbiB1c2luZ1xuXHQgKiA8Y29kZT5vU2VsZWN0aW9uVmFyaWFudC50b0pTT05PYmplY3QoKTwvY29kZT4gbXVzdCBiZSB1c2VkKSwgd2l0aCB0aGUgPGNvZGU+RmlsdGVyQ29udGV4dFVybDwvY29kZT4gb3Jcblx0ICogPGNvZGU+UGFyYW1ldGVyQ29udGV4dFVybDwvY29kZT4gcHJvcGVydHkuXG5cdCAqIEByZXR1cm5zIERhdGEgd2l0aG91dCBwcm9wZXJ0aWVzIG1hcmtlZCBhcyBtZWFzdXJlcyBvciBhbiBlbXB0eSBvYmplY3QgaWYgdGhlIE9EYXRhIG1ldGFkYXRhIGlzIG5vdCBmdWxseSBsb2FkZWQgeWV0XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfcmVtb3ZlTWVhc3VyZUJhc2VkUHJvcGVydGllcyhvRGF0YTogYW55KSB7XG5cdFx0bGV0IG9BZGFwdGVkRGF0YSA9IG9EYXRhO1xuXHRcdGNvbnN0IGFNZWFzdXJlRmlsdGVyTmFtZSA9IFtdO1xuXHRcdGNvbnN0IGFNZWFzdXJlUGFyYW1ldGVyTmFtZSA9IFtdO1xuXHRcdGxldCBpLFxuXHRcdFx0b01vZGVsLFxuXHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdG9FbnRpdHlTZXQ6IGFueSxcblx0XHRcdG9FbnRpdHlEZWY6IGFueSxcblx0XHRcdG9TdWJFbnRpdHlEZWY6IGFueSxcblx0XHRcdG9FbmRSb2xlOiBhbnksXG5cdFx0XHRhRmlsdGVyQ29udGV4dFBhcnQgPSBbXSxcblx0XHRcdGFQYXJhbUNvbnRleHRQYXJ0ID0gW107XG5cblx0XHRpZiAoXG5cdFx0XHRvRGF0YSAmJlxuXHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudCAmJlxuXHRcdFx0KChvRGF0YS5zZWxlY3Rpb25WYXJpYW50LkZpbHRlckNvbnRleHRVcmwgJiYgb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zKSB8fFxuXHRcdFx0XHQob0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJDb250ZXh0VXJsICYmIG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVycykpXG5cdFx0KSB7XG5cdFx0XHRvTW9kZWwgPSB0aGlzLl9nZXRNb2RlbCgpO1xuXHRcdFx0aWYgKHRoaXMub0NvbXBvbmVudCAmJiBvTW9kZWwgJiYgb01vZGVsLmlzQTxWMk9EYXRhTW9kZWw+KFwic2FwLnVpLm1vZGVsLm9kYXRhLnYyLk9EYXRhTW9kZWxcIikpIHtcblx0XHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdFx0aWYgKG9Nb2RlbC5nZXRTZXJ2aWNlTWV0YWRhdGEoKSAmJiBvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwub01vZGVsKSB7XG5cdFx0XHRcdFx0aWYgKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuRmlsdGVyQ29udGV4dFVybCkge1xuXHRcdFx0XHRcdFx0YUZpbHRlckNvbnRleHRQYXJ0ID0gb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5GaWx0ZXJDb250ZXh0VXJsLnNwbGl0KFwiI1wiKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRhRmlsdGVyQ29udGV4dFBhcnQubGVuZ3RoID09PSAyICYmXG5cdFx0XHRcdFx0XHRvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMgJiZcblx0XHRcdFx0XHRcdHRoaXMuX2NvbnN0cnVjdENvbnRleHRVcmwob01vZGVsKS5pbmRleE9mKGFGaWx0ZXJDb250ZXh0UGFydFswXSkgPT09IDBcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdG9FbnRpdHlTZXQgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5U2V0KGFGaWx0ZXJDb250ZXh0UGFydFsxXSk7XG5cdFx0XHRcdFx0XHRpZiAob0VudGl0eVNldCkge1xuXHRcdFx0XHRcdFx0XHRvRW50aXR5RGVmID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVR5cGUob0VudGl0eVNldC5lbnRpdHlUeXBlKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShhRmlsdGVyQ29udGV4dFBhcnRbMV0pO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZikge1xuXHRcdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZiAmJiBvRW50aXR5RGVmLnByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IG9FbnRpdHlEZWYucHJvcGVydHkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLl9pc01lYXN1cmVQcm9wZXJ0eShvRW50aXR5RGVmLnByb3BlcnR5W2ldKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRhTWVhc3VyZUZpbHRlck5hbWUucHVzaChvRW50aXR5RGVmLnByb3BlcnR5W2ldLm5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChvRW50aXR5RGVmLm5hdmlnYXRpb25Qcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBvRW50aXR5RGVmLm5hdmlnYXRpb25Qcm9wZXJ0eS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0b0VuZFJvbGUgPSBvTWV0YU1vZGVsLmdldE9EYXRhQXNzb2NpYXRpb25FbmQob0VudGl0eURlZiwgb0VudGl0eURlZi5uYXZpZ2F0aW9uUHJvcGVydHlbaV0ubmFtZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIW9FbmRSb2xlIHx8IG9FbmRSb2xlLnR5cGUgPT09IG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuRmlsdGVyQ29udGV4dFVybCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoZWNrIGlmIHRoZSBlbmQgcm9sZSBoYXMgY2FyZGluYWxpdHkgMC4uMSBvciAxXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAob0VuZFJvbGUubXVsdGlwbGljaXR5ID09PSBcIjFcIiB8fCBvRW5kUm9sZS5tdWx0aXBsaWNpdHkgPT09IFwiMC4uMVwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9TdWJFbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShvRW5kUm9sZS50eXBlKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9TdWJFbnRpdHlEZWYgJiYgb1N1YkVudGl0eURlZi5wcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgb1N1YkVudGl0eURlZi5wcm9wZXJ0eS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuX2lzTWVhc3VyZVByb3BlcnR5KG9TdWJFbnRpdHlEZWYucHJvcGVydHlbal0pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFNZWFzdXJlRmlsdGVyTmFtZS5wdXNoKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYubmF2aWdhdGlvblByb3BlcnR5W2ldLm5hbWUgKyBcIi5cIiArIG9TdWJFbnRpdHlEZWYucHJvcGVydHlbal0ubmFtZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlckNvbnRleHRVcmwpIHtcblx0XHRcdFx0XHRcdGFQYXJhbUNvbnRleHRQYXJ0ID0gb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJDb250ZXh0VXJsLnNwbGl0KFwiI1wiKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRhUGFyYW1Db250ZXh0UGFydC5sZW5ndGggPT09IDIgJiZcblx0XHRcdFx0XHRcdG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVycyAmJlxuXHRcdFx0XHRcdFx0dGhpcy5fY29uc3RydWN0Q29udGV4dFVybChvTW9kZWwpLmluZGV4T2YoYVBhcmFtQ29udGV4dFBhcnRbMF0pID09PSAwXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRvRW50aXR5U2V0ID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVNldChhUGFyYW1Db250ZXh0UGFydFsxXSk7XG5cdFx0XHRcdFx0XHRpZiAob0VudGl0eVNldCkge1xuXHRcdFx0XHRcdFx0XHRvRW50aXR5RGVmID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVR5cGUob0VudGl0eVNldC5lbnRpdHlUeXBlKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShhRmlsdGVyQ29udGV4dFBhcnRbMV0pO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZikge1xuXHRcdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZi5wcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBvRW50aXR5RGVmLnByb3BlcnR5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGhpcy5faXNNZWFzdXJlUHJvcGVydHkob0VudGl0eURlZi5wcm9wZXJ0eVtpXSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YU1lYXN1cmVQYXJhbWV0ZXJOYW1lLnB1c2gob0VudGl0eURlZi5wcm9wZXJ0eVtpXS5uYW1lKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoYU1lYXN1cmVGaWx0ZXJOYW1lLmxlbmd0aCB8fCBhTWVhc3VyZVBhcmFtZXRlck5hbWUubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHQvLyBUUTogbmVlZHMgYXR0ZW50aW9uXG5cdFx0XHRcdFx0XHRvQWRhcHRlZERhdGEgPSBleHRlbmQodHJ1ZSBhcyBhbnksIHt9LCBvQWRhcHRlZERhdGEpO1xuXG5cdFx0XHRcdFx0XHR0aGlzLl9yZW1vdmVQcm9wZXJ0aWVzKGFNZWFzdXJlRmlsdGVyTmFtZSwgYU1lYXN1cmVQYXJhbWV0ZXJOYW1lLCBvQWRhcHRlZERhdGEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBhbm5vdGF0aW9ucyBhcmUgbm90IGxvYWRlZFxuXG5cdFx0XHRcdFx0dGhpcy5fcmVtb3ZlQWxsUHJvcGVydGllcyhvQWRhcHRlZERhdGEpO1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyOiBvTWV0YWRhdGEgYXJlIG5vdCBmdWxseSBsb2FkZWQhXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMub0NvbXBvbmVudCAmJiBvTW9kZWwgJiYgb01vZGVsLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YU1vZGVsXCIpKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9yZW1vdmVTZW5zaXRpdmVEYXRhRm9yT0RhdGFWNChvQWRhcHRlZERhdGEsIHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb0FkYXB0ZWREYXRhO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgc2Vuc2l0aXZlIGRhdGEgZnJvbSB0aGUgbmF2aWdhdGlvbiBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RhdGEgU2VsZWN0aW9uIHZhcmlhbnRcblx0ICogQHBhcmFtIGJNZWFzdXJlIFNob3VsZCBtZWFzdXJlcyBiZSByZW1vdmVkXG5cdCAqIEByZXR1cm5zIFRoZSBzZWxlY3Rpb24gdmFyaWFudCBhZnRlciBzZW5zaXRpdmUgZGF0YSBoYXMgYmVlbiByZW1vdmVkXG5cdCAqL1xuXHRfcmVtb3ZlU2Vuc2l0aXZlRGF0YUZvck9EYXRhVjQob0RhdGE6IGFueSwgYk1lYXN1cmU/OiBib29sZWFuKSB7XG5cdFx0Y29uc3Qgb05hdkhhbmRsZXIgPSB0aGlzLFxuXHRcdFx0b1NWID0gbmV3IFNlbGVjdGlvblZhcmlhbnQob0RhdGEuc2VsZWN0aW9uVmFyaWFudCksXG5cdFx0XHRvTW9kZWwgPSB0aGlzLl9nZXRNb2RlbCgpO1xuXHRcdGxldCBhRmlsdGVyQ29udGV4dFBhcnQ6IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xuXG5cdFx0aWYgKCFvTW9kZWwuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KFwiL1wiKSkge1xuXHRcdFx0Ly8gYW5ub3RhdGlvbnMgYXJlIG5vdCBsb2FkZWRcblx0XHRcdHRoaXMuX3JlbW92ZUFsbFByb3BlcnRpZXMob0RhdGEpO1xuXHRcdFx0TG9nLmVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXI6IG9NZXRhZGF0YSBhcmUgbm90IGZ1bGx5IGxvYWRlZCFcIik7XG5cdFx0XHRyZXR1cm4gb0RhdGE7XG5cdFx0fVxuXG5cdFx0aWYgKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuRmlsdGVyQ29udGV4dFVybCkge1xuXHRcdFx0YUZpbHRlckNvbnRleHRQYXJ0ID0gb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5GaWx0ZXJDb250ZXh0VXJsLnNwbGl0KFwiI1wiKTtcblx0XHR9XG5cblx0XHRpZiAoXG5cdFx0XHRhRmlsdGVyQ29udGV4dFBhcnQ/Lmxlbmd0aCA9PT0gMiAmJlxuXHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zICYmXG5cdFx0XHR0aGlzLl9jb25zdHJ1Y3RDb250ZXh0VXJsKG9Nb2RlbCkuaW5kZXhPZihhRmlsdGVyQ29udGV4dFBhcnRbMF0pID09PSAwXG5cdFx0KSB7XG5cdFx0XHRvU1YucmVtb3ZlU2VsZWN0T3B0aW9uKFwiQG9kYXRhLmNvbnRleHRcIik7XG5cdFx0XHRvU1YucmVtb3ZlU2VsZWN0T3B0aW9uKFwiQG9kYXRhLm1ldGFkYXRhRXRhZ1wiKTtcblx0XHRcdG9TVi5yZW1vdmVTZWxlY3RPcHRpb24oXCJTQVBfX01lc3NhZ2VzXCIpO1xuXG5cdFx0XHRjb25zdCBzRW50aXR5U2V0ID0gYUZpbHRlckNvbnRleHRQYXJ0WzFdLFxuXHRcdFx0XHRvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0XHRhUHJvcGVydHlOYW1lcyA9IG9TVi5nZXRQcm9wZXJ0eU5hbWVzKCkgfHwgW10sXG5cdFx0XHRcdGZuSXNTZW5zaXRpdmVEYXRhID0gZnVuY3Rpb24gKHNQcm9wOiBhbnksIGVzTmFtZTogYW55KSB7XG5cdFx0XHRcdFx0ZXNOYW1lID0gZXNOYW1lIHx8IHNFbnRpdHlTZXQ7XG5cdFx0XHRcdFx0Y29uc3QgYVByb3BlcnR5QW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChcIi9cIiArIGVzTmFtZSArIFwiL1wiICsgc1Byb3AgKyBcIkBcIik7XG5cdFx0XHRcdFx0aWYgKGFQcm9wZXJ0eUFubm90YXRpb25zKSB7XG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdChiTWVhc3VyZSAmJiBhUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuTWVhc3VyZVwiXSkgfHxcblx0XHRcdFx0XHRcdFx0b05hdkhhbmRsZXIuX2NoZWNrUHJvcGVydHlBbm5vdGF0aW9uc0ZvclNlbnNpdGl2ZURhdGEoYVByb3BlcnR5QW5ub3RhdGlvbnMpXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xcIl0pIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb0ZpZWxkQ29udHJvbCA9IGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xcIl07XG5cdFx0XHRcdFx0XHRcdGlmIChvRmllbGRDb250cm9sW1wiJEVudW1NZW1iZXJcIl0gJiYgb0ZpZWxkQ29udHJvbFtcIiRFbnVtTWVtYmVyXCJdLnNwbGl0KFwiL1wiKVsxXSA9PT0gXCJJbmFwcGxpY2FibGVcIikge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fTtcblxuXHRcdFx0Zm9yIChsZXQgayA9IDA7IGsgPCBhUHJvcGVydHlOYW1lcy5sZW5ndGg7IGsrKykge1xuXHRcdFx0XHRjb25zdCBzUHJvcGVydHkgPSBhUHJvcGVydHlOYW1lc1trXTtcblx0XHRcdFx0Ly8gcHJvcGVydGllcyBvZiB0aGUgZW50aXR5IHNldFxuXHRcdFx0XHRpZiAoZm5Jc1NlbnNpdGl2ZURhdGEoc1Byb3BlcnR5LCBzRW50aXR5U2V0KSkge1xuXHRcdFx0XHRcdG9TVi5yZW1vdmVTZWxlY3RPcHRpb24oc1Byb3BlcnR5KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudCA9IG9TVi50b0pTT05PYmplY3QoKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9EYXRhO1xuXHR9XG5cblx0X2NoZWNrUHJvcGVydHlBbm5vdGF0aW9uc0ZvclNlbnNpdGl2ZURhdGEoYVByb3BlcnR5QW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdHJldHVybiAoXG5cdFx0XHRhUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEuSXNQb3RlbnRpYWxseVNlbnNpdGl2ZVwiXSB8fFxuXHRcdFx0YVByb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRXhjbHVkZUZyb21OYXZpZ2F0aW9uQ29udGV4dFwiXVxuXHRcdCk7XG5cdH1cbn1cblxuLy8gRXhwb3J0aW5nIHRoZSBjbGFzcyBhcyBwcm9wZXJseSB0eXBlZCBVSTVDbGFzc1xuXG5jb25zdCBOYXZpZ2F0aW9uSGFuZGxlclVJNUNsYXNzID0gQmFzZU9iamVjdC5leHRlbmQoXG5cdFwic2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXJcIixcblx0TmF2aWdhdGlvbkhhbmRsZXIucHJvdG90eXBlIGFzIGFueVxuKSBhcyB0eXBlb2YgTmF2aWdhdGlvbkhhbmRsZXI7XG50eXBlIE5hdmlnYXRpb25IYW5kbGVyVUk1Q2xhc3MgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIE5hdmlnYXRpb25IYW5kbGVyPjtcbmV4cG9ydCBkZWZhdWx0IE5hdmln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