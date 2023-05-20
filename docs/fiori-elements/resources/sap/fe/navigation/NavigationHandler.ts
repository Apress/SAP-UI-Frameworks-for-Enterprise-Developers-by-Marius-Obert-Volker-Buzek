import assert from "sap/base/assert";
import Log from "sap/base/Log";
import extend from "sap/base/util/extend";
import isEmptyObject from "sap/base/util/isEmptyObject";
import merge from "sap/base/util/merge";
import BaseObject from "sap/ui/base/Object";
import type Controller from "sap/ui/core/mvc/Controller";
import HashChanger from "sap/ui/core/routing/HashChanger";
import UIComponent from "sap/ui/core/UIComponent";
import V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
import V4ODataModel from "sap/ui/model/odata/v4/ODataModel";
import URI from "sap/ui/thirdparty/URI";
import openWindow from "sap/ui/util/openWindow";
import NavLibrary from "./library";
import NavError from "./NavError";
import type { SerializedSelectionVariant } from "./SelectionVariant";
import SelectionVariant from "./SelectionVariant";

/**
 * Structure of stored app state.
 */
export interface InnerAppData {
	[key: string]: unknown;
	/**
	 * Sringified JSON object as returned, for example, from getDataSuiteFormat() of the SmartFilterBar control
	 */
	selectionVariant?: string;

	/**
	 * ID of the SmartTable variant.
	 */
	tableVariantId?: string;

	/**
	 * Object that can be used to store arbitrary data.
	 */
	customData?: object;

	/**
	 * Object containing the current ui state of the app.
	 */
	presentationVariant?: object;

	/**
	 * Object containing value descriptions.
	 */
	valueTexts?: object;

	/**
	 * Object containing semanticDates filter information.
	 */
	semanticDates?: object;
}

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
export class NavigationHandler extends BaseObject {
	private oRouter: any;

	private oComponent: any;

	private _oModel: any;

	private sParamHandlingMode: string;

	private _sMode: string | undefined;

	// list of technical parameters
	private _aTechnicalParamaters = ["hcpApplicationId"];

	private _oLastSavedInnerAppData: any = {
		sAppStateKey: "",
		oAppData: {},
		iCacheHit: 0,
		iCacheMiss: 0
	};

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
	private _rIAppStateOld = new RegExp("/" + IAPP_STATE + "=([^/?]+)");

	private _rIAppStateOldAtStart = new RegExp("^" + IAPP_STATE + "=([^/?]+)");

	/*
	 * Regular Expression in words: Search for something that either starts with ? or &, followed by the term "sap-iapp-state". That one is
	 * followed by an equal sign (=). The stuff that is after the equal sign forms the first regexp group. This group consists of at least one
	 * (or arbitrary many) characters, as long as it is not an ampersand sign (&). Characters after such an ampersand would be ignored and do
	 * not belong to the group. Alternatively, the string also may end.
	 */
	private _rIAppStateNew = new RegExp("[?&]" + IAPP_STATE + "=([^&]+)");

	private _navigateCallback: Function | undefined;

	/**
	 * Temporarily added again because an application was (illegially) relying on it. Should be removed again, once the app is corrected
	 */
	private IAPP_STATE = IAPP_STATE;

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
	constructor(oController: Controller | UIComponent, sMode?: string, sParamHandlingMode?: string) {
		super();
		if (!oController) {
			throw new NavError("NavigationHandler.INVALID_INPUT");
		}

		if (oController instanceof UIComponent) {
			this.oRouter = oController.getRouter();
			this.oComponent = oController;
		} else {
			if (typeof oController.getOwnerComponent !== "function") {
				throw new NavError("NavigationHandler.INVALID_INPUT");
			}

			this.oRouter = this._getRouter(oController);
			this.oComponent = oController.getOwnerComponent();
		}

		// special handling for SmartTemplates
		if (this.oComponent && this.oComponent.getAppComponent) {
			this.oComponent = this.oComponent.getAppComponent();
		}

		if (
			typeof this.oRouter === "undefined" ||
			typeof this.oComponent === "undefined" ||
			typeof this.oComponent.getComponentData !== "function"
		) {
			throw new NavError("NavigationHandler.INVALID_INPUT");
		}

		if (sParamHandlingMode === ParamHandlingMode.URLParamWins || sParamHandlingMode === ParamHandlingMode.InsertInSelOpt) {
			this.sParamHandlingMode = sParamHandlingMode;
		} else {
			this.sParamHandlingMode = ParamHandlingMode.SelVarWins; // default
		}
		if (sMode === Mode.ODataV2) {
			this._sMode = sMode;
		}
	}

	/**
	 * Retrieves the shell navigation service.
	 *
	 * @returns The Navigation service
	 * @private
	 */
	_getAppNavigationService() {
		return sap.ushell.Container.getService("CrossApplicationNavigation");
	}

	/**
	 * Retrieves the shell navigation service.
	 *
	 * @returns The Navigation service
	 * @private
	 */
	_getAppNavigationServiceAsync() {
		return sap.ushell.Container.getServiceAsync("CrossApplicationNavigation")
			.then(function (oCrossAppNavService: any) {
				return oCrossAppNavService;
			})
			.catch(function () {
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
	 */
	_getRouter(oController: Controller) {
		return UIComponent.getRouterFor(oController);
	}

	/**
	 * This method is to be used only by FE V2 to get access to toExternal promise.
	 *
	 * @param fnCallback Callback to be called by 'navigate' method in case of toExternal is used to navigate.
	 * @private
	 */
	registerNavigateCallback(fnCallback: Function) {
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
	 */
	navigate(
		sSemanticObject: string,
		sActionName: string,
		vNavigationParameters: object | string,
		oInnerAppData?: InnerAppData,
		fnOnError?: Function,
		oExternalAppData?: {
			valueTexts?: object | undefined;
			presentationVariant?: object | undefined;
			selectionVariant?: object | undefined;
		},
		sNavMode?: string
	) {
		let sSelectionVariant: any,
			mParameters,
			oXAppDataObj: any,
			oStartupParameters,
			bExPlace = false,
			oTmpData: any = {};
		const oNavHandler: NavigationHandler = this;

		const oComponentData = this.oComponent.getComponentData();
		/*
		 * There are some race conditions where the oComponentData may not be set, for example in case the UShell was not initialized properly. To
		 * make sure that we do not dump here with an exception, we take this special error handling behavior:
		 */
		if (oComponentData) {
			oStartupParameters = oComponentData.startupParameters;

			if (
				oStartupParameters &&
				oStartupParameters["sap-ushell-next-navmode"] &&
				oStartupParameters["sap-ushell-next-navmode"].length > 0
			) {
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
			const oEnrichedSelVar = this._splitInboundNavigationParameters(
				new SelectionVariant(),
				vNavigationParameters,
				[]
			).oNavigationSelVar;
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

		const oNavArguments: any = {
			target: {
				semanticObject: sSemanticObject,
				action: sActionName
			},
			params: mParameters || {}
		};

		const fnNavigate = function (oCrossAppNavService: any) {
			if (!oXAppDataObj.selectionVariant) {
				oXAppDataObj.selectionVariant = sSelectionVariant;
			}

			const fnNavExplace = function () {
				const sNewHrefPromise = oCrossAppNavService.hrefForExternalAsync(oNavArguments, oNavHandler.oComponent);
				sNewHrefPromise
					.then(function (sNewHref: any) {
						openWindow(sNewHref);
					})
					.catch(function (oError: any) {
						Log.error("Error while retireving hrefForExternal : " + oError);
					});
			};

			oXAppDataObj = oNavHandler._removeMeasureBasedInformation(oXAppDataObj);
			return oNavHandler._fnSaveAppStateAsync(oXAppDataObj, fnOnError).then(function (oSaveAppStateReturn: any) {
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
		const fnStoreAndNavigate = function (oCrossAppNavService: any) {
			oNavHandler
				.storeInnerAppStateAsync(oInnerAppData as any, true)
				.then(function (sAppStateKey: any) {
					if (sAppStateKey) {
						oNavHandler.replaceHash(sAppStateKey);
					}
					return fnNavigate(oCrossAppNavService);
				})
				.catch(function (oError: any) {
					if (fnOnError) {
						fnOnError(oError);
					}
				});
		};
		if (sNavMode) {
			oNavArguments.params["sap-ushell-navmode"] = bExPlace ? "explace" : "inplace";
		}
		oNavHandler
			._getAppNavigationServiceAsync()
			.then(function (oCrossAppNavService: any) {
				const oSupportedPromise = oCrossAppNavService.isNavigationSupported([oNavArguments], oNavHandler.oComponent);
				oSupportedPromise.done(function (oTargets: any) {
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
			})
			.catch(function (oError: any) {
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
	 */
	parseNavigation() {
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

		let aDefaultedParameters: any = [];
		if (
			oStartupParameters &&
			oStartupParameters[DEFAULTED_PARAMETER_PROPERTY] &&
			oStartupParameters[DEFAULTED_PARAMETER_PROPERTY].length > 0
		) {
			aDefaultedParameters = JSON.parse(oStartupParameters[DEFAULTED_PARAMETER_PROPERTY][0]);
		}

		const oMyDeferred = jQuery.Deferred();
		const oNavHandler = this;
		const parseUrlParams = function (oSubStartupParameters: any, aSubDefaultedParameters: any, oSubMyDeferred: any, sNavType: any) {
			// standard URL navigation
			const oSelVars = oNavHandler._splitInboundNavigationParameters(
				new SelectionVariant(),
				oSubStartupParameters,
				aSubDefaultedParameters
			);
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
				const oAppStateData: any = {};
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
				this._getAppNavigationServiceAsync()
					.then(function (oCrossAppNavService: any) {
						const oStartupPromise = oCrossAppNavService.getStartupAppState(that.oComponent);
						oStartupPromise.done(function (oAppState: any) {
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

								const oSelVars = oNavHandler._splitInboundNavigationParameters(
									oSelVar,
									oStartupParameters,
									aDefaultedParameters
								);
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
					})
					.catch(function () {
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
	 */
	setTechnicalParameters(aTechnicalParameters?: any[]) {
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
	 */
	getTechnicalParameters() {
		return this._aTechnicalParamaters.concat([]);
	}

	/**
	 * Checks if the passed parameter is considered as technical parameter.
	 *
	 * @param sParameterName Name of a request parameter, considered as technical parameter.
	 * @returns Indicates if the parameter is considered as technical parameter or not.
	 * @private
	 */
	_isTechnicalParameter(sParameterName: string) {
		if (sParameterName) {
			if (
				!(
					sParameterName === "sap-ui-fe-variant-id" ||
					sParameterName === "sap-ui-fe-table-variant-id" ||
					sParameterName === "sap-ui-fe-chart-variant-id" ||
					sParameterName === "sap-ui-fe-filterbar-variant-id"
				)
			) {
				if (sParameterName.toLowerCase().indexOf("sap-") === 0) {
					return true;
				} else if (this._aTechnicalParamaters.indexOf(sParameterName) >= 0) {
					return true;
				}
			}
		}
		return false;
	}

	_isFEParameter(sParameterName: any) {
		return sParameterName.toLowerCase().indexOf("sap-ui-fe") === 0;
	}

	/**
	 * Rmoves if the passed parameter is considered as technical parameter.
	 *
	 * @param oSelectionVariant Selection Variant which consists of technical Parameters.
	 * @returns Selection Variant without technical Parameters.
	 * @private
	 */
	_removeTechnicalParameters(oSelectionVariant: SelectionVariant) {
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
	 */
	_splitInboundNavigationParameters(
		oSelectionVariant: InstanceType<typeof SelectionVariant>,
		oStartupParameters: { [key: string]: any },
		aDefaultedParameters: any[]
	) {
		if (!Array.isArray(aDefaultedParameters)) {
			throw new NavError("NavigationHandler.INVALID_INPUT");
		}

		let sPropName, i;
		// First we do some parsing of the StartUp Parameters.
		const oStartupParametersAdjusted: { [key: string]: any } = {};
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
					oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName)!);
					this._addParameterValues(oDefaultedSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
				} else {
					switch (this.sParamHandlingMode) {
						case ParamHandlingMode.SelVarWins:
							oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName)!);
							break;
						case ParamHandlingMode.URLParamWins:
							this._addParameterValues(oNavigationSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
							break;
						case ParamHandlingMode.InsertInSelOpt:
							oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName)!);
							this._addParameterValues(oNavigationSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
							break;
						default:
							throw new NavError("NavigationHandler.INVALID_INPUT");
					}
				}
			} else if (aDefaultedParameters.indexOf(sPropName) > -1) {
				// parameter only in SelVar
				oDefaultedSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName)!);
			} else {
				oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName)!);
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
				oNavigationSelVar.massAddSelectOption(aPropNames[i], oDefaultedSelVar.getValue(aPropNames[i])!);
			}
		}

		return {
			oNavigationSelVar: oNavigationSelVar,
			oDefaultedSelVar: oDefaultedSelVar,
			bNavSelVarHasDefaultsOnly: bNavSelVarHasDefaultsOnly
		};
	}

	_addParameterValues(oSelVariant: any, sPropName: any, sSign: any, sOption: any, oValues: any) {
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
	 */
	replaceHash(sAppStateKey: string) {
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
	 */
	storeInnerAppStateAsync(
		mInnerAppData: InnerAppData,
		bImmediateHashReplace?: boolean,
		bSkipHashReplace?: boolean
	): jQuery.Promise<string> {
		if (typeof bImmediateHashReplace !== "boolean") {
			bImmediateHashReplace = true; // default
		}
		const oNavHandler = this;
		const oMyDeferred = jQuery.Deferred<string>();

		const fnReplaceHash = function (sAppStateKey: any) {
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
		if (isEmptyObject(mInnerAppData as object)) {
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

		const fnOnAfterSave = function (sAppStateKey: any) {
			// replace inner app hash with new appStateKey in url
			if (!bSkipHashReplace && !bImmediateHashReplace) {
				fnReplaceHash(sAppStateKey);
			}

			// remember last saved state
			oNavHandler._oLastSavedInnerAppData.oAppData = mInnerAppData;
			oNavHandler._oLastSavedInnerAppData.sAppStateKey = sAppStateKey;
			oMyDeferred.resolve(sAppStateKey);
		};

		const fnOnError = function (oError: any) {
			oMyDeferred.reject(oError);
		};

		this._saveAppStateAsync(mInnerAppData, fnOnAfterSave, fnOnError)
			.then(function (sAppStateKey: any) {
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
			})
			.catch(function () {
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
	 */
	storeInnerAppState(mInnerAppData: InnerAppData, bImmediateHashReplace?: boolean): jQuery.Promise<string> {
		Log.error(
			"Deprecated API call of 'sap.fe.navigation.NavigationHandler.storeInnerAppState'. Please use 'storeInnerAppStateAsync' instead",
			undefined,
			"sap.fe.navigation.NavigationHandler"
		);
		if (typeof bImmediateHashReplace !== "boolean") {
			bImmediateHashReplace = true; // default
		}
		const oNavHandler = this;
		const oMyDeferred = jQuery.Deferred();

		const fnReplaceHash = function (sAppStateKey: any) {
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
		if (isEmptyObject(mInnerAppData as object)) {
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

		const fnOnAfterSave = function (sAppStateKey: any) {
			// replace inner app hash with new appStateKey in url
			if (!bImmediateHashReplace) {
				fnReplaceHash(sAppStateKey);
			}

			// remember last saved state
			oNavHandler._oLastSavedInnerAppData.oAppData = mInnerAppData;
			oNavHandler._oLastSavedInnerAppData.sAppStateKey = sAppStateKey;
			oMyDeferred.resolve(sAppStateKey);
		};

		const fnOnError = function (oError: any) {
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
	 */
	storeInnerAppStateWithImmediateReturn(mInnerAppData: InnerAppData, bImmediateHashReplace?: boolean) {
		Log.error(
			"Deprecated API call of 'sap.fe.navigation.NavigationHandler.storeInnerAppStateWithImmediateReturn'. Please use 'storeInnerAppStateAsync' instead",
			undefined,
			"sap.fe.navigation.NavigationHandler"
		);
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

		const fnOnAfterSave = function (sAppStateKey: any) {
			// replace inner app hash with new appStateKey in url
			if (!bImmediateHashReplace) {
				oNavHandler.replaceHash(sAppStateKey);
			}

			// remember last saved state
			oNavHandler._oLastSavedInnerAppData.oAppData = mInnerAppData;
			oNavHandler._oLastSavedInnerAppData.sAppStateKey = sAppStateKey;
			oAppStatePromise.resolve(sAppStateKey);
		};

		const fnOnError = function (oError: any) {
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
	 */
	processBeforeSmartLinkPopoverOpens(
		oTableEventParameters: any,
		sSelectionVariant: string,
		mInnerAppData?: InnerAppData,
		oExternalAppData?: {
			selectionVariant?: object;
			presentationVariant?: object;
			valueTexts?: object;
		}
	) {
		const oMyDeferred = jQuery.Deferred();
		let mSemanticAttributes: any;
		if (oTableEventParameters != undefined) {
			mSemanticAttributes = oTableEventParameters.semanticAttributes;
		}

		let oXAppDataObj: any;
		const oNavHandler: NavigationHandler = this;

		if (oExternalAppData === undefined) {
			oXAppDataObj = {};
		} else {
			oXAppDataObj = oExternalAppData;
		}

		const fnStoreXappAndCallOpen = function (mSubSemanticAttributes: any, sSubSelectionVariant: any) {
			// mix the semantic attributes (e.g. from the row line) with the selection variant (e.g. from the filter bar)
			sSubSelectionVariant = oXAppDataObj.selectionVariant || sSubSelectionVariant || "{}";

			const iSuppressionBehavior = SuppressionBehavior.raiseErrorOnNull | SuppressionBehavior.raiseErrorOnUndefined;
			/*
			 * compatiblity: Until SAPUI5 1.28.5 (or even later) the Smart Link in a Smart Table is filtering all null- and undefined values.
			 * Therefore, mSemanticAttributes are already reduced appropriately -- this does not need to be done by
			 * mixAttributesAndSelectionVariant again. To ensure that we still have the old behaviour (i.e. an NavError is raised in case that
			 * behaviour of the Smart Link control has changed), the "old" Suppression Behaviour is retained.
			 */

			const oMixedSelVar = oNavHandler.mixAttributesAndSelectionVariant(
				mSubSemanticAttributes,
				sSubSelectionVariant,
				iSuppressionBehavior
			);
			sSubSelectionVariant = oMixedSelVar.toJSONString();

			// enrich the semantic attributes with single selections from the selection variant
			let oTmpData: any = {};
			oTmpData.selectionVariant = oMixedSelVar.toJSONObject();

			oTmpData = oNavHandler._removeMeasureBasedInformation(oTmpData);

			oTmpData = oNavHandler._checkIsPotentiallySensitive(oTmpData);

			mSubSemanticAttributes = oTmpData.selectionVariant
				? oNavHandler._getURLParametersFromSelectionVariant(new SelectionVariant(oTmpData.selectionVariant))
				: {};

			const fnOnContainerSave = function (sAppStateKey: any) {
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

			const fnOnError = function (oError: any) {
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

			oStoreInnerAppStatePromise.fail(function (oError: any) {
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
	 */
	_getAppStateKeyAndUrlParameters(sSelectionVariant: string) {
		return this.processBeforeSmartLinkPopoverOpens(undefined, sSelectionVariant, undefined, undefined);
	}

	_mixAttributesToSelVariant(mSemanticAttributes: any, oSelVariant: any, iSuppressionBehavior: any) {
		// add all semantic attributes to the mixed selection variant
		for (const sPropertyName in mSemanticAttributes) {
			if (mSemanticAttributes.hasOwnProperty(sPropertyName)) {
				// A value of a semantic attribute may not be a string, but can be e.g. a date.
				// Since the selection variant accepts only a string, we have to convert it in dependence of the type.
				let vSemanticAttributeValue = mSemanticAttributes[sPropertyName];
				if (vSemanticAttributeValue instanceof Date) {
					// use the same conversion method for dates as the SmartFilterBar: toJSON()
					vSemanticAttributeValue = vSemanticAttributeValue.toJSON();
				} else if (
					Array.isArray(vSemanticAttributeValue) ||
					(vSemanticAttributeValue && typeof vSemanticAttributeValue === "object")
				) {
					vSemanticAttributeValue = JSON.stringify(vSemanticAttributeValue);
				} else if (typeof vSemanticAttributeValue === "number" || typeof vSemanticAttributeValue === "boolean") {
					vSemanticAttributeValue = vSemanticAttributeValue.toString();
				}

				if (vSemanticAttributeValue === "") {
					if (iSuppressionBehavior & SuppressionBehavior.ignoreEmptyString) {
						Log.info(
							"Semantic attribute " +
								sPropertyName +
								" is an empty string and due to the chosen Suppression Behiavour is being ignored."
						);
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
	 */
	mixAttributesAndSelectionVariant(
		vSemanticAttributes: object | any[],
		sSelectionVariant: string | SerializedSelectionVariant,
		iSuppressionBehavior?: number
	): SelectionVariant {
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
			vSemanticAttributes.forEach(function (mSemanticAttributes: any) {
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
			const aSelectOption: any[] = oSelectionVariant.getSelectOption(aSelOptionNames[i])!;
			if (!oNewSelVariant.getSelectOption(aSelOptionNames[i])) {
				for (let j = 0; j < aSelectOption.length; j++) {
					oNewSelVariant.addSelectOption(
						aSelOptionNames[i],
						aSelectOption[j].Sign,
						aSelectOption[j].Option,
						aSelectOption[j].Low,
						aSelectOption[j].High
					);
				}
			}
		}

		return oNewSelVariant;
	}

	_ensureSelectionVariantFormatString(vSelectionVariant: any) {
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
	}

	_fnHandleAppStatePromise(oReturn: any, fnOnAfterSave: any, fnOnError: any) {
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
	}

	_saveAppStateAsync(oAppData: any, fnOnAfterSave: any, fnOnError: any) {
		const oNavHandler = this;
		return this._fnSaveAppStateAsync(oAppData, fnOnError).then(function (oReturn: any) {
			if (oReturn) {
				oNavHandler._fnHandleAppStatePromise(oReturn, fnOnAfterSave, fnOnError);
				return oReturn.appStateKey;
			}

			return undefined;
		});
	}

	_saveAppState(oAppData: any, fnOnAfterSave: any, fnOnError: any) {
		const oReturn = this._saveAppStateWithImmediateReturn(oAppData, fnOnError);
		if (oReturn) {
			this._fnHandleAppStatePromise(oReturn, fnOnAfterSave, fnOnError);
			return oReturn.appStateKey;
		}

		return undefined;
	}

	_fnSaveAppStateWithImmediateReturn(oAppData: any, oAppState: any, fnOnError: any) {
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
	}

	_fetchAppDataForSave(oAppData: InnerAppData, fnOnError: any) {
		let oAppDataForSave: Partial<InnerAppData> = {};

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
			oAppDataForSave = extend(
				{
					selectionVariant: {},
					tableVariantId: "",
					customData: {}
				},
				oAppDataForSave
			) as InnerAppData;

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
	}

	_fnSaveAppStateAsync(oAppData: any, fnOnError?: any) {
		const oNavHandler = this;
		return this._getAppNavigationServiceAsync()
			.then(function (oCrossAppNavService: any) {
				return oCrossAppNavService.createEmptyAppStateAsync(oNavHandler.oComponent);
			})
			.then(function (oAppState: any) {
				return oNavHandler._fnSaveAppStateWithImmediateReturn(oAppData, oAppState, fnOnError);
			})
			.catch(function (oError: any) {
				if (fnOnError) {
					fnOnError(oError);
				}
			});
	}

	_saveAppStateWithImmediateReturn(oAppData: any, fnOnError?: any) {
		const oAppState = this._getAppNavigationService().createEmptyAppState(this.oComponent);
		return this._fnSaveAppStateWithImmediateReturn(oAppData, oAppState, fnOnError);
	}

	_loadAppState(sAppStateKey: any, oDeferred: any) {
		const oNavHandler = this;
		this._getAppNavigationServiceAsync()
			.then(function (oCrossAppNavService: any) {
				const oAppStatePromise = oCrossAppNavService.getAppState(oNavHandler.oComponent, sAppStateKey);
				oAppStatePromise.done(function (oAppState: any) {
					let oAppData: any = {};
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
			})
			.catch(function () {
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
	 */
	_getInnerAppStateKey(sAppHash: string) {
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
	 */
	_replaceInnerAppStateKey(sAppHash: string, sAppStateKey: string) {
		const sNewIAppState = IAPP_STATE + "=" + sAppStateKey;

		/*
		 * generate sap-iapp-states with the new way
		 */
		if (!sAppHash) {
			// there's no sAppHash key yet
			return "?" + sNewIAppState;
		}

		const fnAppendToQueryParameter = function (sSubAppHash: any) {
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
			return sAppHash.replace(this._rIAppStateNew, function (sNeedle: string) {
				return sNeedle.replace(/[=].*/gi, "=" + sAppStateKey);
			});
		}

		// we need to remove the old AppHash entirely and replace it with a new one.

		const fnReplaceOldApproach = function (rOldApproach: any, sSubAppHash: any) {
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
	}

	_getURLParametersFromSelectionVariant(vSelectionVariant: any) {
		const mURLParameters: any = {};
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
	}

	_createTechnicalError(sErrorCode: any) {
		return new NavError(sErrorCode);
	}

	/**
	 * Sets the model that is used for verification of sensitive information. If the model is not set, the unnamed component model is used for the
	 * verification of sensitive information.
	 *
	 * @public
	 * @param oModel For checking sensitive information
	 */
	setModel(oModel: V2ODataModel | V4ODataModel) {
		this._oModel = oModel;
	}

	_getModel(): V2ODataModel | V4ODataModel {
		return this._oModel || this.oComponent.getModel();
	}

	_removeAllProperties(oData: any) {
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
	}

	_removeProperties(aFilterName: any, aParameterName: any, oData: any) {
		if (aFilterName.length && oData && (oData.selectionVariant || oData.valueTexts || oData.semanticDates)) {
			aFilterName.forEach(function (sName: any) {
				if (oData.selectionVariant.SelectOptions) {
					oData.selectionVariant.SelectOptions.some(function (oValue: any, nIdx: any) {
						if (sName === oValue.PropertyName) {
							oData.selectionVariant.SelectOptions.splice(nIdx, 1);
							return true;
						}

						return false;
					});
				}

				if (oData.valueTexts && oData.valueTexts.Texts) {
					oData.valueTexts.Texts.forEach(function (oTexts: any) {
						if (oTexts.PropertyTexts) {
							oTexts.PropertyTexts.some(function (oValue: any, nIdx: any) {
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
					oData.semanticDates.Dates.forEach(function (oDates: any, nIdx: any) {
						if (sName === oDates.PropertyName) {
							oData.semanticDates.Dates.splice(nIdx, 1);
						}
					});
				}
			});
		}

		if (aParameterName.length && oData && oData.selectionVariant && oData.selectionVariant.Parameters) {
			aParameterName.forEach(function (sName: any) {
				oData.selectionVariant.Parameters.some(function (oValue: any, nIdx: any) {
					if (sName === oValue.PropertyName || "$Parameter." + sName === oValue.PropertyName) {
						oData.selectionVariant.Parameters.splice(nIdx, 1);
						return true;
					}

					return false;
				});
			});
		}
	}

	_isTermTrue(oProperty: any, sTerm: any) {
		const fIsTermDefaultTrue = function (oTerm: any) {
			if (oTerm) {
				return oTerm.Bool ? oTerm.Bool !== "false" : true;
			}
			return false;
		};

		return !!oProperty[sTerm] && fIsTermDefaultTrue(oProperty[sTerm]);
	}

	_isExcludedFromNavigationContext(oProperty: any) {
		return this._isTermTrue(oProperty, "com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext");
	}

	_isPotentiallySensitive(oProperty: any) {
		return this._isTermTrue(oProperty, "com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive");
	}

	_isMeasureProperty(oProperty: any) {
		return this._isTermTrue(oProperty, "com.sap.vocabularies.Analytics.v1.Measure");
	}

	_isToBeExcluded(oProperty: any) {
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
	 */
	constructContextUrl(sEntitySetName: string, oModel?: V2ODataModel | V4ODataModel) {
		if (!sEntitySetName) {
			throw new NavError("NavigationHandler.NO_ENTITY_SET_PROVIDED");
		}

		if (oModel === undefined) {
			oModel = this._getModel();
		}

		return this._constructContextUrl(oModel) + "#" + sEntitySetName;
	}

	_constructContextUrl(oModel: V2ODataModel | V4ODataModel) {
		let sServerUrl;

		if (oModel.isA<V2ODataModel>("sap.ui.model.odata.v2.ODataModel")) {
			sServerUrl = oModel._getServerUrl();
		} else if (oModel.isA<V4ODataModel>("sap.ui.model.odata.v4.ODataModel")) {
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
	 */
	_checkIsPotentiallySensitive(oData: any) {
		let oAdaptedData = oData;
		if (
			oData &&
			oData.selectionVariant &&
			((oData.selectionVariant.FilterContextUrl && oData.selectionVariant.SelectOptions) ||
				(oData.selectionVariant.ParameterContextUrl && oData.selectionVariant.Parameters))
		) {
			const oModel = this._getModel();
			if (this.oComponent && oModel && oModel.isA<V2ODataModel>("sap.ui.model.odata.v2.ODataModel")) {
				const aSensitiveFilterName = [];
				const aSensitiveParameterName = [];
				let i,
					oEntitySet: any,
					oEntityDef: any,
					oSubEntityDef: any,
					oEndRole: any,
					aFilterContextPart = [],
					aParamContextPart = [];

				const oMetaModel = oModel.getMetaModel();
				if (oModel.getServiceMetadata() && oMetaModel?.oModel) {
					if (oData.selectionVariant.FilterContextUrl) {
						aFilterContextPart = oData.selectionVariant.FilterContextUrl.split("#");
					}

					if (
						aFilterContextPart.length === 2 &&
						oData.selectionVariant.SelectOptions &&
						this._constructContextUrl(oModel).indexOf(aFilterContextPart[0]) === 0
					) {
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
													aSensitiveFilterName.push(
														oEntityDef.navigationProperty[i].name + "." + oSubEntityDef.property[j].name
													);
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

					if (
						aParamContextPart.length === 2 &&
						oData.selectionVariant.Parameters &&
						this._constructContextUrl(oModel).indexOf(aParamContextPart[0]) === 0
					) {
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
						oAdaptedData = extend(true as any, {}, oAdaptedData);

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
	}

	_removeMeasureBasedInformation(oAppData: any) {
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
	 */
	_removeMeasureBasedProperties(oData: any) {
		let oAdaptedData = oData;
		const aMeasureFilterName = [];
		const aMeasureParameterName = [];
		let i,
			oModel,
			oMetaModel,
			oEntitySet: any,
			oEntityDef: any,
			oSubEntityDef: any,
			oEndRole: any,
			aFilterContextPart = [],
			aParamContextPart = [];

		if (
			oData &&
			oData.selectionVariant &&
			((oData.selectionVariant.FilterContextUrl && oData.selectionVariant.SelectOptions) ||
				(oData.selectionVariant.ParameterContextUrl && oData.selectionVariant.Parameters))
		) {
			oModel = this._getModel();
			if (this.oComponent && oModel && oModel.isA<V2ODataModel>("sap.ui.model.odata.v2.ODataModel")) {
				oMetaModel = oModel.getMetaModel();
				if (oModel.getServiceMetadata() && oMetaModel && oMetaModel.oModel) {
					if (oData.selectionVariant.FilterContextUrl) {
						aFilterContextPart = oData.selectionVariant.FilterContextUrl.split("#");
					}

					if (
						aFilterContextPart.length === 2 &&
						oData.selectionVariant.SelectOptions &&
						this._constructContextUrl(oModel).indexOf(aFilterContextPart[0]) === 0
					) {
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
													aMeasureFilterName.push(
														oEntityDef.navigationProperty[i].name + "." + oSubEntityDef.property[j].name
													);
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

					if (
						aParamContextPart.length === 2 &&
						oData.selectionVariant.Parameters &&
						this._constructContextUrl(oModel).indexOf(aParamContextPart[0]) === 0
					) {
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
						oAdaptedData = extend(true as any, {}, oAdaptedData);

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
	 */
	_removeSensitiveDataForODataV4(oData: any, bMeasure?: boolean) {
		const oNavHandler = this,
			oSV = new SelectionVariant(oData.selectionVariant),
			oModel = this._getModel();
		let aFilterContextPart: string[] | undefined;

		if (!oModel.getMetaModel().getObject("/")) {
			// annotations are not loaded
			this._removeAllProperties(oData);
			Log.error("NavigationHandler: oMetadata are not fully loaded!");
			return oData;
		}

		if (oData.selectionVariant.FilterContextUrl) {
			aFilterContextPart = oData.selectionVariant.FilterContextUrl.split("#");
		}

		if (
			aFilterContextPart?.length === 2 &&
			oData.selectionVariant.SelectOptions &&
			this._constructContextUrl(oModel).indexOf(aFilterContextPart[0]) === 0
		) {
			oSV.removeSelectOption("@odata.context");
			oSV.removeSelectOption("@odata.metadataEtag");
			oSV.removeSelectOption("SAP__Messages");

			const sEntitySet = aFilterContextPart[1],
				oMetaModel = oModel.getMetaModel(),
				aPropertyNames = oSV.getPropertyNames() || [],
				fnIsSensitiveData = function (sProp: any, esName: any) {
					esName = esName || sEntitySet;
					const aPropertyAnnotations = oMetaModel.getObject("/" + esName + "/" + sProp + "@");
					if (aPropertyAnnotations) {
						if (
							(bMeasure && aPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"]) ||
							oNavHandler._checkPropertyAnnotationsForSensitiveData(aPropertyAnnotations)
						) {
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
	}

	_checkPropertyAnnotationsForSensitiveData(aPropertyAnnotations: any) {
		return (
			aPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] ||
			aPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"]
		);
	}
}

// Exporting the class as properly typed UI5Class

const NavigationHandlerUI5Class = BaseObject.extend(
	"sap.fe.navigation.NavigationHandler",
	NavigationHandler.prototype as any
) as typeof NavigationHandler;
type NavigationHandlerUI5Class = InstanceType<typeof NavigationHandler>;
export default NavigationHandlerUI5Class;
