/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory"], function (NavigationHandler, Service, ServiceFactory) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let NavigationService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(NavigationService, _Service);
    function NavigationService() {
      return _Service.apply(this, arguments) || this;
    }
    _exports.NavigationService = NavigationService;
    var _proto = NavigationService.prototype;
    _proto.init = function init() {
      const oContext = this.getContext(),
        oComponent = oContext && oContext.scopeObject;
      this.oNavHandler = new NavigationHandler(oComponent);
      this.oNavHandler.setModel(oComponent.getModel());
      this.initPromise = Promise.resolve(this);
    };
    _proto.exit = function exit() {
      this.oNavHandler.destroy();
    }

    /**
     * Triggers a cross-app navigation after saving the inner and the cross-app states.
     *
     * @private
     * @ui5-restricted
     * @param sSemanticObject Semantic object of the target app
     * @param sActionName Action of the target app
     * @param [vNavigationParameters] Navigation parameters as an object with key/value pairs or as a string representation of
     *        such an object. If passed as an object, the properties are not checked against the <code>IsPotentialSensitive</code> or
     *        <code>Measure</code> type.
     * @param [oInnerAppData] Object for storing current state of the app
     * @param [fnOnError] Callback that is called if an error occurs during navigation <br>
     * @param [oExternalAppData] Object for storing the state which will be forwarded to the target component.
     * @param [sNavMode] Argument is used to overwrite the FLP-configured target for opening a URL. If used, only the
     *        <code>explace</code> or <code>inplace</code> values are allowed. Any other value will lead to an exception
     *        <code>NavigationHandler.INVALID_NAV_MODE</code>.
     */;
    _proto.navigate = function navigate(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError, oExternalAppData, sNavMode) {
      // TODO: Navigation Handler does not handle navigation without a context
      // but in v4 DataFieldForIBN with requiresContext false can trigger a navigation without any context
      // This should be handled
      this.oNavHandler.navigate(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError, oExternalAppData, sNavMode);
    }

    /**
     * Parses the incoming URL and returns a Promise.
     *
     * @returns A Promise object which returns the
     * extracted app state, the startup parameters, and the type of navigation when execution is successful,
     * @private
     * @ui5-restricted
     */;
    _proto.parseNavigation = function parseNavigation() {
      return this.oNavHandler.parseNavigation();
    }

    /**
     * Processes navigation-related tasks related to beforePopoverOpens event handling for the SmartLink control and returns a Promise object.
     *
     * @param oTableEventParameters The parameters made available by the SmartTable control when the SmartLink control has been clicked,
     *        an instance of a PopOver object
     * @param sSelectionVariant Stringified JSON object as returned, for example, from getDataSuiteFormat() of the SmartFilterBar control
     * @param [mInnerAppData] Object containing the current state of the app. If provided, opening the Popover is deferred until the
     *        inner app data is saved in a consistent way.
     * @returns A Promise object to monitor when all actions of the function have been executed; if the execution is successful, the
     *          modified oTableEventParameters is returned; if an error occurs, an error object of type
     *          {@link sap.fe.navigation.NavError} is returned
     * @private
     */;
    _proto._processBeforeSmartLinkPopoverOpens = function _processBeforeSmartLinkPopoverOpens(oTableEventParameters, sSelectionVariant, mInnerAppData) {
      return this.oNavHandler.processBeforeSmartLinkPopoverOpens(oTableEventParameters, sSelectionVariant, mInnerAppData);
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
     *
     * 		var oSelectionVariant = new sap.fe.navigation.SelectionVariant();
     * 		oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
     * 		oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
     * 		var sSelectionVariant= oSelectionVariant.toJSONString();
     *
     * 		var oNavigationHandler = new sap.fe.navigation.NavigationHandler(oController);
     * 		var oPromiseObject = oNavigationHandler._getAppStateKeyAndUrlParameters(sSelectionVariant);
     *
     * 		oPromiseObject.done(function(oSemanticAttributes, sAppStateKey){
     * 			// here you can add coding that should run after all app state and the semantic attributes have been returned.
     * 		});
     *
     * 		oPromiseObject.fail(function(oError){
     * 			//some error handling
     * 		});
     *
     * </code>
     * @private
     * @ui5-restricted
     */;
    _proto.getAppStateKeyAndUrlParameters = function getAppStateKeyAndUrlParameters(sSelectionVariant) {
      return this.oNavHandler._getAppStateKeyAndUrlParameters(sSelectionVariant);
    }

    /**
     * Gets the application specific technical parameters.
     *
     * @returns Containing the technical parameters.
     * @private
     * @ui5-restricted
     */;
    _proto.getTechnicalParameters = function getTechnicalParameters() {
      return this.oNavHandler.getTechnicalParameters();
    }

    /**
     * Sets the application specific technical parameters. Technical parameters will not be added to the selection variant passed to the
     * application.
     * As a default sap-system, sap-ushell-defaultedParameterNames and hcpApplicationId are considered as technical parameters.
     *
     * @param aTechnicalParameters List of parameter names to be considered as technical parameters. <code>null</code> or
     *        <code>undefined</code> may be used to reset the complete list.
     * @private
     * @ui5-restricted
     */;
    _proto.setTechnicalParameters = function setTechnicalParameters(aTechnicalParameters) {
      this.oNavHandler.setTechnicalParameters(aTechnicalParameters);
    }

    /**
     * Sets the model that is used for verification of sensitive information. If the model is not set, the unnamed component model is used for the
     * verification of sensitive information.
     *
     * @private
     * @ui5-restricted
     * @param oModel Model For checking sensitive information
     */;
    _proto.setModel = function setModel(oModel) {
      this.oNavHandler.setModel(oModel);
    }

    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @private
     * @ui5-restricted
     * @param mInnerAppData Object containing the current state of the app
     * @param [bImmediateHashReplace=true] If set to false, the inner app hash will not be replaced until storing is successful; do not
     *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event
     * @param [bSkipHashReplace=false] If set to true, the inner app hash will not be replaced in the storeInnerAppState. Also the bImmediateHashReplace
     * 		  will be ignored.
     * @returns A Promise object to monitor when all the actions of the function have been executed; if the execution is successful, the
     *          app state key is returned; if an error occurs, an object of type {@link sap.fe.navigation.NavError} is
     *          returned
     */;
    _proto.storeInnerAppStateAsync = function storeInnerAppStateAsync(mInnerAppData, bImmediateHashReplace, bSkipHashReplace) {
      // safely converting JQuerry deferred to ES6 promise
      return new Promise((resolve, reject) => this.oNavHandler.storeInnerAppStateAsync(mInnerAppData, bImmediateHashReplace, bSkipHashReplace).then(resolve, reject));
    }

    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @private
     * @ui5-restricted
     * @param mInnerAppData Object containing the current state of the app
     * @param [bImmediateHashReplace=false] If set to false, the inner app hash will not be replaced until storing is successful; do not
     * @returns An object containing the appStateId and a promise object to monitor when all the actions of the function have been
     * executed; Please note that the appStateKey may be undefined or empty.
     */;
    _proto.storeInnerAppStateWithImmediateReturn = function storeInnerAppStateWithImmediateReturn(mInnerAppData, bImmediateHashReplace) {
      return this.oNavHandler.storeInnerAppStateWithImmediateReturn(mInnerAppData, bImmediateHashReplace);
    }

    /**
     * Changes the URL according to the current sAppStateKey. As an reaction route change event will be triggered.
     *
     * @private
     * @ui5-restricted
     * @param sAppStateKey The new app state key.
     */;
    _proto.replaceHash = function replaceHash(sAppStateKey) {
      this.oNavHandler.replaceHash(sAppStateKey);
    };
    _proto.replaceInnerAppStateKey = function replaceInnerAppStateKey(sAppHash, sAppStateKey) {
      return this.oNavHandler._replaceInnerAppStateKey(sAppHash, sAppStateKey);
    }

    /**
     * Get single values from SelectionVariant for url parameters.
     *
     * @private
     * @ui5-restricted
     * @param [vSelectionVariant]
     * @param [vSelectionVariant.oUrlParamaters]
     * @returns The url parameters
     */;
    _proto.getUrlParametersFromSelectionVariant = function getUrlParametersFromSelectionVariant(vSelectionVariant) {
      return this.oNavHandler._getURLParametersFromSelectionVariant(vSelectionVariant);
    }

    /**
     * Save app state and return immediately without waiting for response.
     *
     * @private
     * @ui5-restricted
     * @param oInSelectionVariant Instance of sap.fe.navigation.SelectionVariant
     * @returns AppState key
     */;
    _proto.saveAppStateWithImmediateReturn = function saveAppStateWithImmediateReturn(oInSelectionVariant) {
      if (oInSelectionVariant) {
        const sSelectionVariant = oInSelectionVariant.toJSONString(),
          // create an SV for app state in string format
          oSelectionVariant = JSON.parse(sSelectionVariant),
          // convert string into JSON to store in AppState
          oXAppStateObject = {
            selectionVariant: oSelectionVariant
          },
          oReturn = this.oNavHandler._saveAppStateWithImmediateReturn(oXAppStateObject);
        return oReturn !== null && oReturn !== void 0 && oReturn.appStateKey ? oReturn.appStateKey : "";
      } else {
        return undefined;
      }
    }

    /**
     * Mix Attributes and selectionVariant.
     *
     * @param vSemanticAttributes Object/(Array of Objects) containing key/value pairs
     * @param sSelectionVariant The selection variant in string format as provided by the SmartFilterBar control
     * @param [iSuppressionBehavior=sap.fe.navigation.SuppressionBehavior.standard] Indicates whether semantic
     *        attributes with special values (see {@link sap.fe.navigation.SuppressionBehavior suppression behavior}) must be
     *        suppressed before they are combined with the selection variant; several
     *        {@link sap.fe.navigation.SuppressionBehavior suppression behaviors} can be combined with the bitwise OR operator
     *        (|)
     * @returns Instance of {@link sap.fe.navigation.SelectionVariant}
     */;
    _proto.mixAttributesAndSelectionVariant = function mixAttributesAndSelectionVariant(vSemanticAttributes, sSelectionVariant, iSuppressionBehavior) {
      return this.oNavHandler.mixAttributesAndSelectionVariant(vSemanticAttributes, sSelectionVariant, iSuppressionBehavior);
    }

    /**
     * The method creates a context url based on provided data. This context url can either be used as.
     *
     * @param sEntitySetName Used for url determination
     * @param [oModel] The ODataModel used for url determination. If omitted, the NavigationHandler model is used.
     * @returns The context url for the given entities
     */;
    _proto.constructContextUrl = function constructContextUrl(sEntitySetName, oModel) {
      return this.oNavHandler.constructContextUrl(sEntitySetName, oModel);
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return NavigationService;
  }(Service);
  _exports.NavigationService = NavigationService;
  function fnGetEmptyObject() {
    return {};
  }
  function fnGetPromise() {
    return Promise.resolve({});
  }
  function fnGetJQueryPromise() {
    const oMyDeffered = jQuery.Deferred();
    oMyDeffered.resolve({}, {}, "initial");
    return oMyDeffered.promise();
  }
  function fnGetEmptyString() {
    return "";
  }
  let NavigationServicesMock = /*#__PURE__*/function () {
    function NavigationServicesMock() {
      this.createEmptyAppState = fnGetEmptyObject;
      this.storeInnerAppStateWithImmediateReturn = fnGetEmptyObject;
      this.mixAttributesAndSelectionVariant = fnGetEmptyObject;
      this.getAppState = fnGetPromise;
      this.getStartupAppState = fnGetPromise;
      this.parseNavigation = fnGetJQueryPromise;
      this.constructContextUrl = fnGetEmptyString;
      this.initPromise = Promise.resolve(this);
    }
    _exports.NavigationServicesMock = NavigationServicesMock;
    var _proto2 = NavigationServicesMock.prototype;
    _proto2.getInterface = function getInterface() {
      return this;
    }

    // return empty object
    ;
    _proto2.replaceInnerAppStateKey = function replaceInnerAppStateKey(sAppHash) {
      return sAppHash ? sAppHash : "";
    };
    _proto2.navigate = function navigate() {
      // Don't do anything
    };
    return NavigationServicesMock;
  }();
  _exports.NavigationServicesMock = NavigationServicesMock;
  let NavigationServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(NavigationServiceFactory, _ServiceFactory);
    function NavigationServiceFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto3 = NavigationServiceFactory.prototype;
    _proto3.createInstance = function createInstance(oServiceContext) {
      const oNavigationService = sap.ushell && sap.ushell.Container ? new NavigationService(oServiceContext) : new NavigationServicesMock();
      // Wait For init
      return oNavigationService.initPromise.then(function (oService) {
        return oService;
      });
    };
    return NavigationServiceFactory;
  }(ServiceFactory);
  return NavigationServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZpZ2F0aW9uU2VydmljZSIsImluaXQiLCJvQ29udGV4dCIsImdldENvbnRleHQiLCJvQ29tcG9uZW50Iiwic2NvcGVPYmplY3QiLCJvTmF2SGFuZGxlciIsIk5hdmlnYXRpb25IYW5kbGVyIiwic2V0TW9kZWwiLCJnZXRNb2RlbCIsImluaXRQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJleGl0IiwiZGVzdHJveSIsIm5hdmlnYXRlIiwic1NlbWFudGljT2JqZWN0Iiwic0FjdGlvbk5hbWUiLCJ2TmF2aWdhdGlvblBhcmFtZXRlcnMiLCJvSW5uZXJBcHBEYXRhIiwiZm5PbkVycm9yIiwib0V4dGVybmFsQXBwRGF0YSIsInNOYXZNb2RlIiwicGFyc2VOYXZpZ2F0aW9uIiwiX3Byb2Nlc3NCZWZvcmVTbWFydExpbmtQb3BvdmVyT3BlbnMiLCJvVGFibGVFdmVudFBhcmFtZXRlcnMiLCJzU2VsZWN0aW9uVmFyaWFudCIsIm1Jbm5lckFwcERhdGEiLCJwcm9jZXNzQmVmb3JlU21hcnRMaW5rUG9wb3Zlck9wZW5zIiwiZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzIiwiX2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyIsImdldFRlY2huaWNhbFBhcmFtZXRlcnMiLCJzZXRUZWNobmljYWxQYXJhbWV0ZXJzIiwiYVRlY2huaWNhbFBhcmFtZXRlcnMiLCJvTW9kZWwiLCJzdG9yZUlubmVyQXBwU3RhdGVBc3luYyIsImJJbW1lZGlhdGVIYXNoUmVwbGFjZSIsImJTa2lwSGFzaFJlcGxhY2UiLCJyZWplY3QiLCJ0aGVuIiwic3RvcmVJbm5lckFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybiIsInJlcGxhY2VIYXNoIiwic0FwcFN0YXRlS2V5IiwicmVwbGFjZUlubmVyQXBwU3RhdGVLZXkiLCJzQXBwSGFzaCIsIl9yZXBsYWNlSW5uZXJBcHBTdGF0ZUtleSIsImdldFVybFBhcmFtZXRlcnNGcm9tU2VsZWN0aW9uVmFyaWFudCIsInZTZWxlY3Rpb25WYXJpYW50IiwiX2dldFVSTFBhcmFtZXRlcnNGcm9tU2VsZWN0aW9uVmFyaWFudCIsInNhdmVBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4iLCJvSW5TZWxlY3Rpb25WYXJpYW50IiwidG9KU09OU3RyaW5nIiwib1NlbGVjdGlvblZhcmlhbnQiLCJKU09OIiwicGFyc2UiLCJvWEFwcFN0YXRlT2JqZWN0Iiwic2VsZWN0aW9uVmFyaWFudCIsIm9SZXR1cm4iLCJfc2F2ZUFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybiIsImFwcFN0YXRlS2V5IiwidW5kZWZpbmVkIiwibWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQiLCJ2U2VtYW50aWNBdHRyaWJ1dGVzIiwiaVN1cHByZXNzaW9uQmVoYXZpb3IiLCJjb25zdHJ1Y3RDb250ZXh0VXJsIiwic0VudGl0eVNldE5hbWUiLCJnZXRJbnRlcmZhY2UiLCJTZXJ2aWNlIiwiZm5HZXRFbXB0eU9iamVjdCIsImZuR2V0UHJvbWlzZSIsImZuR2V0SlF1ZXJ5UHJvbWlzZSIsIm9NeURlZmZlcmVkIiwialF1ZXJ5IiwiRGVmZXJyZWQiLCJwcm9taXNlIiwiZm5HZXRFbXB0eVN0cmluZyIsIk5hdmlnYXRpb25TZXJ2aWNlc01vY2siLCJjcmVhdGVFbXB0eUFwcFN0YXRlIiwiZ2V0QXBwU3RhdGUiLCJnZXRTdGFydHVwQXBwU3RhdGUiLCJOYXZpZ2F0aW9uU2VydmljZUZhY3RvcnkiLCJjcmVhdGVJbnN0YW5jZSIsIm9TZXJ2aWNlQ29udGV4dCIsIm9OYXZpZ2F0aW9uU2VydmljZSIsInNhcCIsInVzaGVsbCIsIkNvbnRhaW5lciIsIm9TZXJ2aWNlIiwiU2VydmljZUZhY3RvcnkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk5hdmlnYXRpb25TZXJ2aWNlRmFjdG9yeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IElubmVyQXBwRGF0YSB9IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9OYXZpZ2F0aW9uSGFuZGxlclwiO1xuaW1wb3J0IE5hdmlnYXRpb25IYW5kbGVyIGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9OYXZpZ2F0aW9uSGFuZGxlclwiO1xuaW1wb3J0IHR5cGUgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IHR5cGUgeyBTZXJpYWxpemVkU2VsZWN0aW9uVmFyaWFudCB9IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgU2VydmljZSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlXCI7XG5pbXBvcnQgU2VydmljZUZhY3RvcnkgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIHsgU2VydmljZUNvbnRleHQgfSBmcm9tIFwidHlwZXMvbWV0YW1vZGVsX3R5cGVzXCI7XG5cbnR5cGUgTmF2aWdhdGlvblNlcnZpY2VTZXR0aW5ncyA9IHt9O1xuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25TZXJ2aWNlIGV4dGVuZHMgU2VydmljZTxOYXZpZ2F0aW9uU2VydmljZVNldHRpbmdzPiB7XG5cdGluaXRQcm9taXNlITogUHJvbWlzZTxhbnk+O1xuXG5cdG9OYXZIYW5kbGVyITogTmF2aWdhdGlvbkhhbmRsZXI7XG5cblx0aW5pdCgpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpLFxuXHRcdFx0b0NvbXBvbmVudCA9IG9Db250ZXh0ICYmIG9Db250ZXh0LnNjb3BlT2JqZWN0O1xuXG5cdFx0dGhpcy5vTmF2SGFuZGxlciA9IG5ldyBOYXZpZ2F0aW9uSGFuZGxlcihvQ29tcG9uZW50KTtcblx0XHR0aGlzLm9OYXZIYW5kbGVyLnNldE1vZGVsKG9Db21wb25lbnQuZ2V0TW9kZWwoKSk7XG5cdFx0dGhpcy5pbml0UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSh0aGlzKTtcblx0fVxuXG5cdGV4aXQoKSB7XG5cdFx0dGhpcy5vTmF2SGFuZGxlci5kZXN0cm95KCk7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlcnMgYSBjcm9zcy1hcHAgbmF2aWdhdGlvbiBhZnRlciBzYXZpbmcgdGhlIGlubmVyIGFuZCB0aGUgY3Jvc3MtYXBwIHN0YXRlcy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBzU2VtYW50aWNPYmplY3QgU2VtYW50aWMgb2JqZWN0IG9mIHRoZSB0YXJnZXQgYXBwXG5cdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBBY3Rpb24gb2YgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIFt2TmF2aWdhdGlvblBhcmFtZXRlcnNdIE5hdmlnYXRpb24gcGFyYW1ldGVycyBhcyBhbiBvYmplY3Qgd2l0aCBrZXkvdmFsdWUgcGFpcnMgb3IgYXMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2Zcblx0ICogICAgICAgIHN1Y2ggYW4gb2JqZWN0LiBJZiBwYXNzZWQgYXMgYW4gb2JqZWN0LCB0aGUgcHJvcGVydGllcyBhcmUgbm90IGNoZWNrZWQgYWdhaW5zdCB0aGUgPGNvZGU+SXNQb3RlbnRpYWxTZW5zaXRpdmU8L2NvZGU+IG9yXG5cdCAqICAgICAgICA8Y29kZT5NZWFzdXJlPC9jb2RlPiB0eXBlLlxuXHQgKiBAcGFyYW0gW29Jbm5lckFwcERhdGFdIE9iamVjdCBmb3Igc3RvcmluZyBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHBcblx0ICogQHBhcmFtIFtmbk9uRXJyb3JdIENhbGxiYWNrIHRoYXQgaXMgY2FsbGVkIGlmIGFuIGVycm9yIG9jY3VycyBkdXJpbmcgbmF2aWdhdGlvbiA8YnI+XG5cdCAqIEBwYXJhbSBbb0V4dGVybmFsQXBwRGF0YV0gT2JqZWN0IGZvciBzdG9yaW5nIHRoZSBzdGF0ZSB3aGljaCB3aWxsIGJlIGZvcndhcmRlZCB0byB0aGUgdGFyZ2V0IGNvbXBvbmVudC5cblx0ICogQHBhcmFtIFtzTmF2TW9kZV0gQXJndW1lbnQgaXMgdXNlZCB0byBvdmVyd3JpdGUgdGhlIEZMUC1jb25maWd1cmVkIHRhcmdldCBmb3Igb3BlbmluZyBhIFVSTC4gSWYgdXNlZCwgb25seSB0aGVcblx0ICogICAgICAgIDxjb2RlPmV4cGxhY2U8L2NvZGU+IG9yIDxjb2RlPmlucGxhY2U8L2NvZGU+IHZhbHVlcyBhcmUgYWxsb3dlZC4gQW55IG90aGVyIHZhbHVlIHdpbGwgbGVhZCB0byBhbiBleGNlcHRpb25cblx0ICogICAgICAgIDxjb2RlPk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfTkFWX01PREU8L2NvZGU+LlxuXHQgKi9cblx0bmF2aWdhdGUoXG5cdFx0c1NlbWFudGljT2JqZWN0OiBzdHJpbmcsXG5cdFx0c0FjdGlvbk5hbWU6IHN0cmluZyxcblx0XHR2TmF2aWdhdGlvblBhcmFtZXRlcnM6IHN0cmluZyB8IG9iamVjdCxcblx0XHRvSW5uZXJBcHBEYXRhPzogSW5uZXJBcHBEYXRhLFxuXHRcdGZuT25FcnJvcj86IEZ1bmN0aW9uLFxuXHRcdG9FeHRlcm5hbEFwcERhdGE/OiBhbnksXG5cdFx0c05hdk1vZGU/OiBzdHJpbmdcblx0KSB7XG5cdFx0Ly8gVE9ETzogTmF2aWdhdGlvbiBIYW5kbGVyIGRvZXMgbm90IGhhbmRsZSBuYXZpZ2F0aW9uIHdpdGhvdXQgYSBjb250ZXh0XG5cdFx0Ly8gYnV0IGluIHY0IERhdGFGaWVsZEZvcklCTiB3aXRoIHJlcXVpcmVzQ29udGV4dCBmYWxzZSBjYW4gdHJpZ2dlciBhIG5hdmlnYXRpb24gd2l0aG91dCBhbnkgY29udGV4dFxuXHRcdC8vIFRoaXMgc2hvdWxkIGJlIGhhbmRsZWRcblx0XHR0aGlzLm9OYXZIYW5kbGVyLm5hdmlnYXRlKFxuXHRcdFx0c1NlbWFudGljT2JqZWN0LFxuXHRcdFx0c0FjdGlvbk5hbWUsXG5cdFx0XHR2TmF2aWdhdGlvblBhcmFtZXRlcnMsXG5cdFx0XHRvSW5uZXJBcHBEYXRhLFxuXHRcdFx0Zm5PbkVycm9yLFxuXHRcdFx0b0V4dGVybmFsQXBwRGF0YSxcblx0XHRcdHNOYXZNb2RlXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZXMgdGhlIGluY29taW5nIFVSTCBhbmQgcmV0dXJucyBhIFByb21pc2UuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSBvYmplY3Qgd2hpY2ggcmV0dXJucyB0aGVcblx0ICogZXh0cmFjdGVkIGFwcCBzdGF0ZSwgdGhlIHN0YXJ0dXAgcGFyYW1ldGVycywgYW5kIHRoZSB0eXBlIG9mIG5hdmlnYXRpb24gd2hlbiBleGVjdXRpb24gaXMgc3VjY2Vzc2Z1bCxcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRwYXJzZU5hdmlnYXRpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIucGFyc2VOYXZpZ2F0aW9uKCk7XG5cdH1cblxuXHQvKipcblx0ICogUHJvY2Vzc2VzIG5hdmlnYXRpb24tcmVsYXRlZCB0YXNrcyByZWxhdGVkIHRvIGJlZm9yZVBvcG92ZXJPcGVucyBldmVudCBoYW5kbGluZyBmb3IgdGhlIFNtYXJ0TGluayBjb250cm9sIGFuZCByZXR1cm5zIGEgUHJvbWlzZSBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGFibGVFdmVudFBhcmFtZXRlcnMgVGhlIHBhcmFtZXRlcnMgbWFkZSBhdmFpbGFibGUgYnkgdGhlIFNtYXJ0VGFibGUgY29udHJvbCB3aGVuIHRoZSBTbWFydExpbmsgY29udHJvbCBoYXMgYmVlbiBjbGlja2VkLFxuXHQgKiAgICAgICAgYW4gaW5zdGFuY2Ugb2YgYSBQb3BPdmVyIG9iamVjdFxuXHQgKiBAcGFyYW0gc1NlbGVjdGlvblZhcmlhbnQgU3RyaW5naWZpZWQgSlNPTiBvYmplY3QgYXMgcmV0dXJuZWQsIGZvciBleGFtcGxlLCBmcm9tIGdldERhdGFTdWl0ZUZvcm1hdCgpIG9mIHRoZSBTbWFydEZpbHRlckJhciBjb250cm9sXG5cdCAqIEBwYXJhbSBbbUlubmVyQXBwRGF0YV0gT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGFwcC4gSWYgcHJvdmlkZWQsIG9wZW5pbmcgdGhlIFBvcG92ZXIgaXMgZGVmZXJyZWQgdW50aWwgdGhlXG5cdCAqICAgICAgICBpbm5lciBhcHAgZGF0YSBpcyBzYXZlZCBpbiBhIGNvbnNpc3RlbnQgd2F5LlxuXHQgKiBAcmV0dXJucyBBIFByb21pc2Ugb2JqZWN0IHRvIG1vbml0b3Igd2hlbiBhbGwgYWN0aW9ucyBvZiB0aGUgZnVuY3Rpb24gaGF2ZSBiZWVuIGV4ZWN1dGVkOyBpZiB0aGUgZXhlY3V0aW9uIGlzIHN1Y2Nlc3NmdWwsIHRoZVxuXHQgKiAgICAgICAgICBtb2RpZmllZCBvVGFibGVFdmVudFBhcmFtZXRlcnMgaXMgcmV0dXJuZWQ7IGlmIGFuIGVycm9yIG9jY3VycywgYW4gZXJyb3Igb2JqZWN0IG9mIHR5cGVcblx0ICogICAgICAgICAge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpcyByZXR1cm5lZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3Byb2Nlc3NCZWZvcmVTbWFydExpbmtQb3BvdmVyT3BlbnMob1RhYmxlRXZlbnRQYXJhbWV0ZXJzOiBvYmplY3QsIHNTZWxlY3Rpb25WYXJpYW50OiBzdHJpbmcsIG1Jbm5lckFwcERhdGE/OiBJbm5lckFwcERhdGEpIHtcblx0XHRyZXR1cm4gdGhpcy5vTmF2SGFuZGxlci5wcm9jZXNzQmVmb3JlU21hcnRMaW5rUG9wb3Zlck9wZW5zKG9UYWJsZUV2ZW50UGFyYW1ldGVycywgc1NlbGVjdGlvblZhcmlhbnQsIG1Jbm5lckFwcERhdGEpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb2Nlc3NlcyBzZWxlY3Rpb25WYXJpYW50IHN0cmluZyBhbmQgcmV0dXJucyBhIFByb21pc2Ugb2JqZWN0IChzZW1hbnRpY0F0dHJpYnV0ZXMgYW5kIEFwcFN0YXRlS2V5KS5cblx0ICpcblx0ICogQHBhcmFtIHNTZWxlY3Rpb25WYXJpYW50IFN0cmluZ2lmaWVkIEpTT04gb2JqZWN0XG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSBvYmplY3QgdG8gbW9uaXRvciB3aGVuIGFsbCBhY3Rpb25zIG9mIHRoZSBmdW5jdGlvbiBoYXZlIGJlZW4gZXhlY3V0ZWQ7IGlmIHRoZSBleGVjdXRpb24gaXMgc3VjY2Vzc2Z1bCwgdGhlXG5cdCAqICAgICAgICAgIHNlbWFudGljQXR0cmlidXRlcyBhcyB3ZWxsIGFzIHRoZSBhcHBTdGF0ZUtleSBhcmUgcmV0dXJuZWQ7IGlmIGFuIGVycm9yIG9jY3VycywgYW4gZXJyb3Igb2JqZWN0IG9mIHR5cGVcblx0ICogICAgICAgICAge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpcyByZXR1cm5lZFxuXHQgKiA8YnI+XG5cdCAqIEBleGFtcGxlIDxjb2RlPlxuXHQgKlxuXHQgKiBcdFx0dmFyIG9TZWxlY3Rpb25WYXJpYW50ID0gbmV3IHNhcC5mZS5uYXZpZ2F0aW9uLlNlbGVjdGlvblZhcmlhbnQoKTtcblx0ICogXHRcdG9TZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihcIkNvbXBhbnlDb2RlXCIsIFwiSVwiLCBcIkVRXCIsIFwiMDAwMVwiKTtcblx0ICogXHRcdG9TZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihcIkN1c3RvbWVyXCIsIFwiSVwiLCBcIkVRXCIsIFwiQzAwMDFcIik7XG5cdCAqIFx0XHR2YXIgc1NlbGVjdGlvblZhcmlhbnQ9IG9TZWxlY3Rpb25WYXJpYW50LnRvSlNPTlN0cmluZygpO1xuXHQgKlxuXHQgKiBcdFx0dmFyIG9OYXZpZ2F0aW9uSGFuZGxlciA9IG5ldyBzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlcihvQ29udHJvbGxlcik7XG5cdCAqIFx0XHR2YXIgb1Byb21pc2VPYmplY3QgPSBvTmF2aWdhdGlvbkhhbmRsZXIuX2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyhzU2VsZWN0aW9uVmFyaWFudCk7XG5cdCAqXG5cdCAqIFx0XHRvUHJvbWlzZU9iamVjdC5kb25lKGZ1bmN0aW9uKG9TZW1hbnRpY0F0dHJpYnV0ZXMsIHNBcHBTdGF0ZUtleSl7XG5cdCAqIFx0XHRcdC8vIGhlcmUgeW91IGNhbiBhZGQgY29kaW5nIHRoYXQgc2hvdWxkIHJ1biBhZnRlciBhbGwgYXBwIHN0YXRlIGFuZCB0aGUgc2VtYW50aWMgYXR0cmlidXRlcyBoYXZlIGJlZW4gcmV0dXJuZWQuXG5cdCAqIFx0XHR9KTtcblx0ICpcblx0ICogXHRcdG9Qcm9taXNlT2JqZWN0LmZhaWwoZnVuY3Rpb24ob0Vycm9yKXtcblx0ICogXHRcdFx0Ly9zb21lIGVycm9yIGhhbmRsaW5nXG5cdCAqIFx0XHR9KTtcblx0ICpcblx0ICogPC9jb2RlPlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGdldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyhzU2VsZWN0aW9uVmFyaWFudDogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIuX2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyhzU2VsZWN0aW9uVmFyaWFudCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgYXBwbGljYXRpb24gc3BlY2lmaWMgdGVjaG5pY2FsIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIENvbnRhaW5pbmcgdGhlIHRlY2huaWNhbCBwYXJhbWV0ZXJzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGdldFRlY2huaWNhbFBhcmFtZXRlcnMoKSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIuZ2V0VGVjaG5pY2FsUGFyYW1ldGVycygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGFwcGxpY2F0aW9uIHNwZWNpZmljIHRlY2huaWNhbCBwYXJhbWV0ZXJzLiBUZWNobmljYWwgcGFyYW1ldGVycyB3aWxsIG5vdCBiZSBhZGRlZCB0byB0aGUgc2VsZWN0aW9uIHZhcmlhbnQgcGFzc2VkIHRvIHRoZVxuXHQgKiBhcHBsaWNhdGlvbi5cblx0ICogQXMgYSBkZWZhdWx0IHNhcC1zeXN0ZW0sIHNhcC11c2hlbGwtZGVmYXVsdGVkUGFyYW1ldGVyTmFtZXMgYW5kIGhjcEFwcGxpY2F0aW9uSWQgYXJlIGNvbnNpZGVyZWQgYXMgdGVjaG5pY2FsIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBhVGVjaG5pY2FsUGFyYW1ldGVycyBMaXN0IG9mIHBhcmFtZXRlciBuYW1lcyB0byBiZSBjb25zaWRlcmVkIGFzIHRlY2huaWNhbCBwYXJhbWV0ZXJzLiA8Y29kZT5udWxsPC9jb2RlPiBvclxuXHQgKiAgICAgICAgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiBtYXkgYmUgdXNlZCB0byByZXNldCB0aGUgY29tcGxldGUgbGlzdC5cblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRzZXRUZWNobmljYWxQYXJhbWV0ZXJzKGFUZWNobmljYWxQYXJhbWV0ZXJzOiBhbnlbXSkge1xuXHRcdHRoaXMub05hdkhhbmRsZXIuc2V0VGVjaG5pY2FsUGFyYW1ldGVycyhhVGVjaG5pY2FsUGFyYW1ldGVycyk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgbW9kZWwgdGhhdCBpcyB1c2VkIGZvciB2ZXJpZmljYXRpb24gb2Ygc2Vuc2l0aXZlIGluZm9ybWF0aW9uLiBJZiB0aGUgbW9kZWwgaXMgbm90IHNldCwgdGhlIHVubmFtZWQgY29tcG9uZW50IG1vZGVsIGlzIHVzZWQgZm9yIHRoZVxuXHQgKiB2ZXJpZmljYXRpb24gb2Ygc2Vuc2l0aXZlIGluZm9ybWF0aW9uLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG9Nb2RlbCBNb2RlbCBGb3IgY2hlY2tpbmcgc2Vuc2l0aXZlIGluZm9ybWF0aW9uXG5cdCAqL1xuXHRzZXRNb2RlbChvTW9kZWw6IGFueSkge1xuXHRcdHRoaXMub05hdkhhbmRsZXIuc2V0TW9kZWwob01vZGVsKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2VzIHRoZSBVUkwgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IGFwcCBzdGF0ZSBhbmQgc3RvcmVzIHRoZSBhcHAgc3RhdGUgZm9yIGxhdGVyIHJldHJpZXZhbC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBtSW5uZXJBcHBEYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHBcblx0ICogQHBhcmFtIFtiSW1tZWRpYXRlSGFzaFJlcGxhY2U9dHJ1ZV0gSWYgc2V0IHRvIGZhbHNlLCB0aGUgaW5uZXIgYXBwIGhhc2ggd2lsbCBub3QgYmUgcmVwbGFjZWQgdW50aWwgc3RvcmluZyBpcyBzdWNjZXNzZnVsOyBkbyBub3Rcblx0ICogICAgICAgIHNldCB0byBmYWxzZSBpZiB5b3UgY2Fubm90IHJlYWN0IHRvIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBQcm9taXNlLCBmb3IgZXhhbXBsZSwgd2hlbiBjYWxsaW5nIHRoZSBiZWZvcmVMaW5rUHJlc3NlZCBldmVudFxuXHQgKiBAcGFyYW0gW2JTa2lwSGFzaFJlcGxhY2U9ZmFsc2VdIElmIHNldCB0byB0cnVlLCB0aGUgaW5uZXIgYXBwIGhhc2ggd2lsbCBub3QgYmUgcmVwbGFjZWQgaW4gdGhlIHN0b3JlSW5uZXJBcHBTdGF0ZS4gQWxzbyB0aGUgYkltbWVkaWF0ZUhhc2hSZXBsYWNlXG5cdCAqIFx0XHQgIHdpbGwgYmUgaWdub3JlZC5cblx0ICogQHJldHVybnMgQSBQcm9taXNlIG9iamVjdCB0byBtb25pdG9yIHdoZW4gYWxsIHRoZSBhY3Rpb25zIG9mIHRoZSBmdW5jdGlvbiBoYXZlIGJlZW4gZXhlY3V0ZWQ7IGlmIHRoZSBleGVjdXRpb24gaXMgc3VjY2Vzc2Z1bCwgdGhlXG5cdCAqICAgICAgICAgIGFwcCBzdGF0ZSBrZXkgaXMgcmV0dXJuZWQ7IGlmIGFuIGVycm9yIG9jY3VycywgYW4gb2JqZWN0IG9mIHR5cGUge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpc1xuXHQgKiAgICAgICAgICByZXR1cm5lZFxuXHQgKi9cblx0c3RvcmVJbm5lckFwcFN0YXRlQXN5bmMobUlubmVyQXBwRGF0YTogSW5uZXJBcHBEYXRhLCBiSW1tZWRpYXRlSGFzaFJlcGxhY2U/OiBib29sZWFuLCBiU2tpcEhhc2hSZXBsYWNlPzogYm9vbGVhbik6IFByb21pc2U8c3RyaW5nPiB7XG5cdFx0Ly8gc2FmZWx5IGNvbnZlcnRpbmcgSlF1ZXJyeSBkZWZlcnJlZCB0byBFUzYgcHJvbWlzZVxuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuXHRcdFx0dGhpcy5vTmF2SGFuZGxlci5zdG9yZUlubmVyQXBwU3RhdGVBc3luYyhtSW5uZXJBcHBEYXRhLCBiSW1tZWRpYXRlSGFzaFJlcGxhY2UsIGJTa2lwSGFzaFJlcGxhY2UpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyB0aGUgVVJMIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBhcHAgc3RhdGUgYW5kIHN0b3JlcyB0aGUgYXBwIHN0YXRlIGZvciBsYXRlciByZXRyaWV2YWwuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gbUlubmVyQXBwRGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgYXBwXG5cdCAqIEBwYXJhbSBbYkltbWVkaWF0ZUhhc2hSZXBsYWNlPWZhbHNlXSBJZiBzZXQgdG8gZmFsc2UsIHRoZSBpbm5lciBhcHAgaGFzaCB3aWxsIG5vdCBiZSByZXBsYWNlZCB1bnRpbCBzdG9yaW5nIGlzIHN1Y2Nlc3NmdWw7IGRvIG5vdFxuXHQgKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgYXBwU3RhdGVJZCBhbmQgYSBwcm9taXNlIG9iamVjdCB0byBtb25pdG9yIHdoZW4gYWxsIHRoZSBhY3Rpb25zIG9mIHRoZSBmdW5jdGlvbiBoYXZlIGJlZW5cblx0ICogZXhlY3V0ZWQ7IFBsZWFzZSBub3RlIHRoYXQgdGhlIGFwcFN0YXRlS2V5IG1heSBiZSB1bmRlZmluZWQgb3IgZW1wdHkuXG5cdCAqL1xuXHRzdG9yZUlubmVyQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuKG1Jbm5lckFwcERhdGE6IGFueSwgYkltbWVkaWF0ZUhhc2hSZXBsYWNlOiBib29sZWFuIHwgdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIuc3RvcmVJbm5lckFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybihtSW5uZXJBcHBEYXRhLCBiSW1tZWRpYXRlSGFzaFJlcGxhY2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoYW5nZXMgdGhlIFVSTCBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgc0FwcFN0YXRlS2V5LiBBcyBhbiByZWFjdGlvbiByb3V0ZSBjaGFuZ2UgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gc0FwcFN0YXRlS2V5IFRoZSBuZXcgYXBwIHN0YXRlIGtleS5cblx0ICovXG5cdHJlcGxhY2VIYXNoKHNBcHBTdGF0ZUtleTogc3RyaW5nKSB7XG5cdFx0dGhpcy5vTmF2SGFuZGxlci5yZXBsYWNlSGFzaChzQXBwU3RhdGVLZXkpO1xuXHR9XG5cblx0cmVwbGFjZUlubmVyQXBwU3RhdGVLZXkoc0FwcEhhc2g6IGFueSwgc0FwcFN0YXRlS2V5OiBhbnkpIHtcblx0XHRyZXR1cm4gdGhpcy5vTmF2SGFuZGxlci5fcmVwbGFjZUlubmVyQXBwU3RhdGVLZXkoc0FwcEhhc2gsIHNBcHBTdGF0ZUtleSk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHNpbmdsZSB2YWx1ZXMgZnJvbSBTZWxlY3Rpb25WYXJpYW50IGZvciB1cmwgcGFyYW1ldGVycy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBbdlNlbGVjdGlvblZhcmlhbnRdXG5cdCAqIEBwYXJhbSBbdlNlbGVjdGlvblZhcmlhbnQub1VybFBhcmFtYXRlcnNdXG5cdCAqIEByZXR1cm5zIFRoZSB1cmwgcGFyYW1ldGVyc1xuXHQgKi9cblx0Z2V0VXJsUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50KHZTZWxlY3Rpb25WYXJpYW50OiBzdHJpbmcgfCBvYmplY3QgfCB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gdGhpcy5vTmF2SGFuZGxlci5fZ2V0VVJMUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50KHZTZWxlY3Rpb25WYXJpYW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlIGFwcCBzdGF0ZSBhbmQgcmV0dXJuIGltbWVkaWF0ZWx5IHdpdGhvdXQgd2FpdGluZyBmb3IgcmVzcG9uc2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb0luU2VsZWN0aW9uVmFyaWFudCBJbnN0YW5jZSBvZiBzYXAuZmUubmF2aWdhdGlvbi5TZWxlY3Rpb25WYXJpYW50XG5cdCAqIEByZXR1cm5zIEFwcFN0YXRlIGtleVxuXHQgKi9cblx0c2F2ZUFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybihvSW5TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAob0luU2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0Y29uc3Qgc1NlbGVjdGlvblZhcmlhbnQgPSBvSW5TZWxlY3Rpb25WYXJpYW50LnRvSlNPTlN0cmluZygpLCAvLyBjcmVhdGUgYW4gU1YgZm9yIGFwcCBzdGF0ZSBpbiBzdHJpbmcgZm9ybWF0XG5cdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50ID0gSlNPTi5wYXJzZShzU2VsZWN0aW9uVmFyaWFudCksIC8vIGNvbnZlcnQgc3RyaW5nIGludG8gSlNPTiB0byBzdG9yZSBpbiBBcHBTdGF0ZVxuXHRcdFx0XHRvWEFwcFN0YXRlT2JqZWN0ID0ge1xuXHRcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnQ6IG9TZWxlY3Rpb25WYXJpYW50XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9SZXR1cm4gPSB0aGlzLm9OYXZIYW5kbGVyLl9zYXZlQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuKG9YQXBwU3RhdGVPYmplY3QpO1xuXHRcdFx0cmV0dXJuIG9SZXR1cm4/LmFwcFN0YXRlS2V5ID8gb1JldHVybi5hcHBTdGF0ZUtleSA6IFwiXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1peCBBdHRyaWJ1dGVzIGFuZCBzZWxlY3Rpb25WYXJpYW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gdlNlbWFudGljQXR0cmlidXRlcyBPYmplY3QvKEFycmF5IG9mIE9iamVjdHMpIGNvbnRhaW5pbmcga2V5L3ZhbHVlIHBhaXJzXG5cdCAqIEBwYXJhbSBzU2VsZWN0aW9uVmFyaWFudCBUaGUgc2VsZWN0aW9uIHZhcmlhbnQgaW4gc3RyaW5nIGZvcm1hdCBhcyBwcm92aWRlZCBieSB0aGUgU21hcnRGaWx0ZXJCYXIgY29udHJvbFxuXHQgKiBAcGFyYW0gW2lTdXBwcmVzc2lvbkJlaGF2aW9yPXNhcC5mZS5uYXZpZ2F0aW9uLlN1cHByZXNzaW9uQmVoYXZpb3Iuc3RhbmRhcmRdIEluZGljYXRlcyB3aGV0aGVyIHNlbWFudGljXG5cdCAqICAgICAgICBhdHRyaWJ1dGVzIHdpdGggc3BlY2lhbCB2YWx1ZXMgKHNlZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uU3VwcHJlc3Npb25CZWhhdmlvciBzdXBwcmVzc2lvbiBiZWhhdmlvcn0pIG11c3QgYmVcblx0ICogICAgICAgIHN1cHByZXNzZWQgYmVmb3JlIHRoZXkgYXJlIGNvbWJpbmVkIHdpdGggdGhlIHNlbGVjdGlvbiB2YXJpYW50OyBzZXZlcmFsXG5cdCAqICAgICAgICB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uU3VwcHJlc3Npb25CZWhhdmlvciBzdXBwcmVzc2lvbiBiZWhhdmlvcnN9IGNhbiBiZSBjb21iaW5lZCB3aXRoIHRoZSBiaXR3aXNlIE9SIG9wZXJhdG9yXG5cdCAqICAgICAgICAofClcblx0ICogQHJldHVybnMgSW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlNlbGVjdGlvblZhcmlhbnR9XG5cdCAqL1xuXHRtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudChcblx0XHR2U2VtYW50aWNBdHRyaWJ1dGVzOiBvYmplY3QgfCBhbnlbXSxcblx0XHRzU2VsZWN0aW9uVmFyaWFudDogc3RyaW5nIHwgU2VyaWFsaXplZFNlbGVjdGlvblZhcmlhbnQsXG5cdFx0aVN1cHByZXNzaW9uQmVoYXZpb3I/OiBudW1iZXJcblx0KSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIubWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQodlNlbWFudGljQXR0cmlidXRlcywgc1NlbGVjdGlvblZhcmlhbnQsIGlTdXBwcmVzc2lvbkJlaGF2aW9yKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIGNyZWF0ZXMgYSBjb250ZXh0IHVybCBiYXNlZCBvbiBwcm92aWRlZCBkYXRhLiBUaGlzIGNvbnRleHQgdXJsIGNhbiBlaXRoZXIgYmUgdXNlZCBhcy5cblx0ICpcblx0ICogQHBhcmFtIHNFbnRpdHlTZXROYW1lIFVzZWQgZm9yIHVybCBkZXRlcm1pbmF0aW9uXG5cdCAqIEBwYXJhbSBbb01vZGVsXSBUaGUgT0RhdGFNb2RlbCB1c2VkIGZvciB1cmwgZGV0ZXJtaW5hdGlvbi4gSWYgb21pdHRlZCwgdGhlIE5hdmlnYXRpb25IYW5kbGVyIG1vZGVsIGlzIHVzZWQuXG5cdCAqIEByZXR1cm5zIFRoZSBjb250ZXh0IHVybCBmb3IgdGhlIGdpdmVuIGVudGl0aWVzXG5cdCAqL1xuXHRjb25zdHJ1Y3RDb250ZXh0VXJsKHNFbnRpdHlTZXROYW1lOiBzdHJpbmcsIG9Nb2RlbDogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIuY29uc3RydWN0Q29udGV4dFVybChzRW50aXR5U2V0TmFtZSwgb01vZGVsKTtcblx0fVxuXG5cdGdldEludGVyZmFjZSgpIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuZnVuY3Rpb24gZm5HZXRFbXB0eU9iamVjdCgpIHtcblx0cmV0dXJuIHt9O1xufVxuXG5mdW5jdGlvbiBmbkdldFByb21pc2UoKSB7XG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xufVxuXG5mdW5jdGlvbiBmbkdldEpRdWVyeVByb21pc2UoKSB7XG5cdGNvbnN0IG9NeURlZmZlcmVkID0galF1ZXJ5LkRlZmVycmVkKCk7XG5cdG9NeURlZmZlcmVkLnJlc29sdmUoe30sIHt9LCBcImluaXRpYWxcIik7XG5cdHJldHVybiBvTXlEZWZmZXJlZC5wcm9taXNlKCk7XG59XG5cbmZ1bmN0aW9uIGZuR2V0RW1wdHlTdHJpbmcoKSB7XG5cdHJldHVybiBcIlwiO1xufVxuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25TZXJ2aWNlc01vY2sge1xuXHRpbml0UHJvbWlzZTogUHJvbWlzZTxhbnk+O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuaW5pdFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodGhpcyk7XG5cdH1cblxuXHRnZXRJbnRlcmZhY2UoKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvLyByZXR1cm4gZW1wdHkgb2JqZWN0XG5cdGNyZWF0ZUVtcHR5QXBwU3RhdGUgPSBmbkdldEVtcHR5T2JqZWN0O1xuXG5cdHN0b3JlSW5uZXJBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4gPSBmbkdldEVtcHR5T2JqZWN0O1xuXG5cdG1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50ID0gZm5HZXRFbXB0eU9iamVjdDtcblxuXHQvLyByZXR1cm4gcHJvbWlzZVxuXHRnZXRBcHBTdGF0ZSA9IGZuR2V0UHJvbWlzZTtcblxuXHRnZXRTdGFydHVwQXBwU3RhdGUgPSBmbkdldFByb21pc2U7XG5cblx0cGFyc2VOYXZpZ2F0aW9uID0gZm5HZXRKUXVlcnlQcm9taXNlO1xuXG5cdC8vIHJldHVybiBlbXB0eSBzdHJpbmdcblx0Y29uc3RydWN0Q29udGV4dFVybCA9IGZuR2V0RW1wdHlTdHJpbmc7XG5cblx0cmVwbGFjZUlubmVyQXBwU3RhdGVLZXkoc0FwcEhhc2g6IGFueSkge1xuXHRcdHJldHVybiBzQXBwSGFzaCA/IHNBcHBIYXNoIDogXCJcIjtcblx0fVxuXG5cdG5hdmlnYXRlKCkge1xuXHRcdC8vIERvbid0IGRvIGFueXRoaW5nXG5cdH1cbn1cblxuY2xhc3MgTmF2aWdhdGlvblNlcnZpY2VGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8TmF2aWdhdGlvblNlcnZpY2VTZXR0aW5ncz4ge1xuXHRjcmVhdGVJbnN0YW5jZShvU2VydmljZUNvbnRleHQ6IFNlcnZpY2VDb250ZXh0PE5hdmlnYXRpb25TZXJ2aWNlU2V0dGluZ3M+KSB7XG5cdFx0Y29uc3Qgb05hdmlnYXRpb25TZXJ2aWNlID1cblx0XHRcdHNhcC51c2hlbGwgJiYgc2FwLnVzaGVsbC5Db250YWluZXIgPyBuZXcgTmF2aWdhdGlvblNlcnZpY2Uob1NlcnZpY2VDb250ZXh0KSA6IG5ldyBOYXZpZ2F0aW9uU2VydmljZXNNb2NrKCk7XG5cdFx0Ly8gV2FpdCBGb3IgaW5pdFxuXHRcdHJldHVybiBvTmF2aWdhdGlvblNlcnZpY2UuaW5pdFByb21pc2UudGhlbihmdW5jdGlvbiAob1NlcnZpY2U6IGFueSkge1xuXHRcdFx0cmV0dXJuIG9TZXJ2aWNlO1xuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5hdmlnYXRpb25TZXJ2aWNlRmFjdG9yeTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7OztNQVNhQSxpQkFBaUI7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0lBQUE7SUFBQSxPQUs3QkMsSUFBSSxHQUFKLGdCQUFP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