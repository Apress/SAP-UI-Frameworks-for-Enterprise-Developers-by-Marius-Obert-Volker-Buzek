// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview URL Parsing
 *
 * URL Parsing util for shell compliant hashes
 *
 * [ SO-Action~[Context]]
 * [ ? [A=B(&C=D)+]
 * &/
 *
 * The parsing functions are deliberately restrictive and fragile, only shell compliant hashes are parsed correctly,
 * invalid or completely empty results ( not silently ignored parts) are returned if the hash is not deemed parseable
 */
sap.ui.define([
    "sap/ui/thirdparty/URI",
    "sap/base/util/UriParameters",
    "sap/base/Log"
], function (
    URI,
    UriParameters,
    Log
) {
    "use strict";

    // usage : sap.ushell.Container.getServiceAsync("URLParsing").then(function (URLParsing) {
    //             URLParsing.parseShellHash();
    //         });
    //         etc.

    /**
     * The Unified Shell's internal URL parsing service (platform independent)
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getServiceAsync("URLParsing").then(function (URLParsing) {});</code>.
     * Constructs a new instance of the URL parsing service.
     *
     * Methods in this class allow to break down a shell compliant hash into it's respective parts
     * (SemanticObject,Action,Context, Parameters, appSpecificHash) or (ShellPart,appSpecificHash) respectively
     * or construct a hash from its constituents.
     *
     * All methods deal with the *internal* shellHash format.
     *
     * Most of the parse methods are robust w.r.t. a leading "#".
     *
     * Note: The functions were designed with a "truthy" behaviour for not present values,
     * Thus a client should not rely on the difference between null, "undefined", "" when testing for the result of a parse action.
     *
     * The parsing functions are deliberately restrictive and fragile, only shell compliant hashes are parsed correctly,
     * behaviour for non-compliant hashes is undefined and subject to change,
     * notably we do not aim do "degrade" nicefully or support partial parsing of corrupted urls.
     *
     * @name sap.ushell.utils.UrlParsing
     * @constructor
     * @class
     * @since 1.94.0
     * @private
     */
    function UrlParsing () { }
    var reValidShellPart = /^(([A-Za-z0-9_/]+)-([A-Za-z0-9_/-]+)(~([A-Z0-9a-z=+/]+))?)?([?]([^&]|(&[^/]))*&?)?$/;


    /**
     * Extract the Shell hash# part from an URL
     * The application specific route part is removed
     * See {@link #getHash} for a function which retains the app specific route.
     *
     * Shell services shall use this service to extract relevant parts of an URL from an actual URL string
     * (which should be treated as opaque)
     * <p>
     * The URL has to comply with the Fiori-Wave 2 agreed upon format
     * <p>
     * This service shall be used to extract a hash part from an url.
     * The result can be further broken up by parseShellHash
     *
     * Examples<p>
     * http://a.b.c?defhij#SemanticObject-Action~Context?PV1=A&PV2=B&/appspecific
     * <br/>
     * returns : "#SemanticObject-Action~Context?PV1=A&PV2=B&/appspecific"
     *
     * Note: the results when passing an illegal (non-compliant) url are undefined and subject to change w.o. notice.
     * Notably further checks may added.
     * The design is deliberately restrictive and non-robust.
     *
     * @param {string} sShellHashString a valid (Shell) url, e.g. <br/>
     *   <code>http://xx.b.c#Object-name~AFE2==?PV1=PV2&PV4=V5&/display/detail/7?UU=HH</code>
     * @returns {Object} the parsed result
     * @since 1.94.0
     * @protected
     */
    UrlParsing.getShellHash = function (sShellHashString) {
        var re = /[^#]*#(([^&]|&[^/])*)(&\/.*)?/,
            match = re.exec(sShellHashString);
        if (match) {
            return match[1];
        }
        return undefined;
    };


    /**
     * Extract a hash part from an URL, including an app-specific part
     *
     * @param {string} sURL any value
     * @returns {string} <code>extracted string</code> if and only if a hash is present, undefined otherwise
     * @since 1.94.0
     * @protected
     */
    UrlParsing.getHash = function (sURL) {
        var re = /#(.*)/,
            match = re.exec(sURL);
        if (match) {
            return match[1];
        }
        return undefined;
    };


    /**
     * Check if a URL has an intent based navigation part which can be parsed into a semantic object and action part.
     * Accepts only a relative URL (must contain #) or fully qualified Urls for which
     * origin and filename must correspond to the running launchpad.
     *
     * Given actual url
     * <code>http://www.mycorp.com/sap/fiori/FioriLaunchpad.html?sap-language=DE#SO-action?P1=value1</code>, the following parts
     * <code>http://www.mycorp.com/sap/fiori/FioriLaunchpad.html</code> must match.
     *
     * The actual test is synchronous and *only* tests whether the hash part can be parsed and contains a semantic object and action.
     * It does not test whether the intent or its parameters are valid for a given user
     *
     * This function does not work properly when used inside the app runtime as it compares the given URL to the app runtime's URL
     * instead of the outer FLP's URL.
     * It can still be used for synchronous use cases in the ushell that do not run inside the app runtime.
     *
     * @param {string} sUrl the URL to test. Note: this url must be in internal format.
     * @returns {boolean} true if the conditions are fulfilled.
     * @since 1.94.0
     * @protected
     */
    UrlParsing.isIntentUrl = function (sUrl) {
        return this._isIntentUrl(sUrl, window.location.href);
    };


    /**
     * Check if a URL has an intent based navigation part which can be parsed into a semantic object and action part.
     * Accepts only a relative URL (must contain #) or fully qualified Urls for which
     * origin and filename must correspond to the running launchpad.
     *
     * Given actual url
     * <code>http://www.mycorp.com/sap/fiori/FioriLaunchpad.html?sap-language=DE#SO-action?P1=value1</code>, the following parts
     * <code>http://www.mycorp.com/sap/fiori/FioriLaunchpad.html</code> must match.
     *
     * This function *only* tests whether the hash part can be parsed and contains a semantic object and action.
     * It does not test whether the intent or its parameters are valid for a given user
     *
     * @param {string} sUrl the URL to test. Note: this url must be in internal format.
     * @returns {Promise<boolean>} true if the conditions are fulfilled.
     * @since 1.94.0
     * @protected
     */
    UrlParsing.isIntentUrlAsync = function (sUrl) {
        return new Promise(function (resolve, reject) {
            // in the app runtime this returns the URL of the outer FLP
            sap.ushell.Container.getFLPUrlAsync(true).done(resolve).fail(reject);
        })
            .then(function (sFlpUrl) {
                return this._isIntentUrl(sUrl, sFlpUrl);
            }.bind(this));
    };


    /**
     * The internal implementation of isIntentUrl. See isIntentUrl and isIntentURLAsync for more information.
     *
     * @param {string} sUrl the URL to test. Note: this url must be in internal format.
     * @param {string} sFlpUrl the FLP URL to test against.
     * @returns {boolean} true if the conditions are fulfilled.
     * @since 1.94.0
     * @private
     */
    UrlParsing._isIntentUrl = function (sUrl, sFlpUrl) {
        var reStartWithHash = /^#/,
            oTestUri,
            oLaunchpadUri,
            sTestUriFullResource,
            sLaunchpadUriFullResource,
            sHash,
            oParsedHash;
        if (typeof sUrl !== "string") {
            return false;
        }
        if (!reStartWithHash.test(sUrl)) {
            oTestUri = (new URI(sUrl)).normalize();
            sTestUriFullResource = oTestUri.protocol() + "://" + oTestUri.host() + oTestUri.pathname();
            oLaunchpadUri = (new URI(sFlpUrl)).normalize();
            sLaunchpadUriFullResource = oLaunchpadUri.protocol() + "://" + oLaunchpadUri.host() + oLaunchpadUri.pathname();
            if (sTestUriFullResource !== sLaunchpadUriFullResource) {
                return false;
            }
        }
        // sUrl is to be processed by our launchpad
        sHash = UrlParsing.getHash(sUrl);
        if (!sHash) {
            return false;
        }
        oParsedHash = UrlParsing.parseShellHash(sHash);
        if (oParsedHash && oParsedHash.semanticObject && oParsedHash.action) {
            return true;
        }
        return false;
    };

    /**
     * Parses parameters from a URI query string (starting with "?") into a parameter object.
     * Keys are decoded twice. This assumes that literal "%" characters are not used on keys, otherwise parsing will fail.
     *
     * @param {string} sParams Parameter string, e.g. <code>?ABC=1&ABC=1%202DEF=4</code>
     * @returns {object} Any value, e.g. <code>{ ABC: ["1", "1 2DEF=4"] }</code>
     * @since 1.94.0
     * @protected
     */
    UrlParsing.parseParameters = function (sParams) {
        var oUriParams = UriParameters.fromQuery(sParams);
        var vKeys = oUriParams.keys();
        var oKey = vKeys.next();
        var oParamObject = {};

        while (oKey.done === false) {
            // decodeURIComponent: required when a key has double encoding, e.g. "%2524" (BCP: 2180415300)
            // this extra decode is fine as long as literal "%" characters are not used on keys
            oParamObject[decodeURIComponent(oKey.value)] = oUriParams.getAll(oKey.value);
            oKey = vKeys.next();
        }
        return oParamObject;
    };

    /**
     * Combines members of a JavaScript object into a parameter string.
     * Parameters are ordered in an arbitrary manner which might change.
     *
     * @param {object} parameters The parameter object, e.g. <code>{ ABC: [1, "1 2"], DEF: ["4"] }</code>.
     * @param {string} delimiter The parameter delimiter. Default is "&".
     * @param {string} assign The parameter assignment. Default is "=".
     * @returns {string} The result parameter string, e.g. <code>ABC=1&ABC=1%202&DEF=4</code>.
     *   The result is *not* prefixed with a "?". Parameter values are URI encoded.
     * @since 1.94.0
     * @private
     */
    function _urlParametersToString (parameters, delimiter, assign) {
        var first,
            a,
            k,
            i,
            lst,
            shellPart = "";

        delimiter = delimiter || "&";
        assign = assign || "=";

        first = "";
        a = null;
        lst = [];
        for (a in parameters) {
            if (parameters.hasOwnProperty(a)) {
                lst.push(a);
            }
        }
        lst.sort();
        for (k = 0; k < lst.length; k = k + 1) {
            a = lst[k];
            if (Array.isArray(parameters[a])) {
                for (i = 0; i < parameters[a].length; i = i + 1) {
                    shellPart += first + encodeURIComponent(a) + assign + encodeURIComponent(parameters[a][i]);
                    first = delimiter;
                }
            } else {
                shellPart += first + encodeURIComponent(a) + assign + encodeURIComponent(parameters[a]);
                first = delimiter;
            }
        }
        return shellPart;
    }

    /**
     * combine members of a javascript object into a parameter string,
     * note that parameters are ordered in an arbitrary manner which is subject to change
     *
     * @param {Object} oParams any value { ABC : [1,"1 2"], DEF : ["4"]}
     * @returns {string} <code>ABC=1&ABC=1%202DEF=4</code>
     *   Note that the result is *not* prefixed with a "?", parameter values are encodeURIComponent encoded.
     * @since 1.94.0
     * @protected
     */
    UrlParsing.paramsToString = function (oParams) {
        return _urlParametersToString(oParams);
    };

    /**
     * Internal function
     *
     * @param {Object} oParams parameter object
     * @param {string} sDelimiter string to use as parameter delimiter (e.g., "&")
     * @param {string} sAssign string to use for parameter assignment (e.g., "=")
     * @returns {string} the result parameters
     * @since 1.94.0
     * @private
     */
    UrlParsing.privparamsToString = function (oParams, sDelimiter, sAssign) {
        return _urlParametersToString(oParams, sDelimiter, sAssign);
    };

    /**
     * Decompose a shell hash into the respective parts
     *
     * @param {string} sHash Hash part of a shell compliant URL
     *   <code>#SO-Action~Context?P1=a&P2=x&/route?RPV=1</code> the hash part of an URL, <br/>
     *   e.g. <code>"#Object-name~AFE2==?PV1=PV2&PV4=V5&/display/detail/7?UU=HH</code>
     * @returns {object} <code>undefined</code> if not a parseable hash<br/>
     * <pre>
     *   {
     *     semanticObject : string, <br/>
     *     action : string, <br/>
     *     contextRaw : string, <br/>
     *     params :  MapObject<String,Array[String]>, <br/>
     *     appSpecificRoute : string <br/>
     *   }
     * </pre>
     *   Note that params always has an Array for each parameter value!
     * @since 1.94.0
     * @protected
     */
    UrlParsing.parseShellHash = function (sHash) {
        var re = reValidShellPart,
            oSplitHash,
            sSemanticObject,
            sAction,
            sContext,
            sParams,
            match,
            pm;
        if (!sHash) {
            return undefined;
        }
        // split shell-hash and app-specific parts first
        oSplitHash = UrlParsing.splitHash(sHash);

        match = re.exec(oSplitHash.shellPart);
        if (match) {
            sSemanticObject = match[2];
            sAction = match[3];
            sContext = match[5];
            sParams = match[6];
            pm = UrlParsing.parseParameters(sParams);
            return {
                semanticObject: sSemanticObject,
                action: sAction,
                contextRaw: sContext,
                params: pm,
                appSpecificRoute: oSplitHash.appSpecificRoute
            };
        }
        if (oSplitHash.appSpecificRoute) {
            return {
                semanticObject: undefined,
                action: undefined,
                contextRaw: undefined,
                params: {},
                appSpecificRoute: oSplitHash.appSpecificRoute
            };
        }
        return undefined;
    };

    /**
     * Internal function
     *
     * @name privstripLeadingHash
     * @param {string} sHash Shell hash
     * @returns {string} the string wihtout a leading #
     * @since 1.94.0
     * @private
     */
    UrlParsing.privstripLeadingHash = function (sHash) {
        if (sHash[0] === "#") {
            return sHash.substring(1);
        }
        return sHash;
    };

    /**
     * split a Unified Shell compliant hash into an Object containing a shell specific part and an app specific parts</br>
     * for non compliant hash strings, the empty object {} is returned.
     * an optional leading # is stripped
     *
     * @param {string} sHash Hash part of a shell conformant URL
     *   <code>#SO-Action~Context?P1=a&P2=x&/route?RPV=1<code>
     *   the hash part of an URL, e.g. <code>"#Object-name~AFE2==?PV1=PV2&PV4=V5&/display/detail/7?UU=HH<code>
     * @returns {object}
     *   <code>{}</code>(empty object) if not a parseable hash
     * <pre>
     *   {
     *     shellPart : "Object-name~AFE2==?PV1=PV2&PV4=V5",
     *     appSpecificRoute : "display/detail/7?UU=HH"
     *   }
     * </pre> otherwise
     *   Note that params always has an Array for each parameter value!
     * @since 1.94.0
     * @protected
     */
    UrlParsing.splitHash = function (sHash) {
        var re = /^(?:#|)([\S\s]*?)(&\/[\S\s]*)?$/,
            aMatch,
            sShellPart,
            sAppSpecificRoute;

        if (sHash === undefined || sHash === null || sHash === "") {
            return {};
        }
        // break down hash into parts
        // "#SO-ABC~CONTXT?ABC=3A&DEF=4B&/detail/1?A=B");
        aMatch = re.exec(sHash);
        sShellPart = aMatch[1];
        if (sShellPart !== "" && !reValidShellPart.test(sShellPart)) {
            return {};
        }
        sAppSpecificRoute = aMatch[2];
        if (sShellPart || sAppSpecificRoute) {
            return {
                shellPart: sShellPart,
                appSpecificRoute: sAppSpecificRoute // ,"&/detail/1?A=B");
            };
        }
        return {};
    };

    function appendIf (sUrl, app) {
        if (app) {
            return sUrl + app;
        }
        return sUrl;
    }

    /**
     * compose a shell Hash from it's respective parts
     * Note that it also may append an app specific route !
     *
     * @returns {string} the hash part of an URL, e.g. <code>"Object-name~AFE2==?PV1=PV2&PV4=V5&/display/detail/7?UU=HH</code>
     *   returns "" for an undefined object
     * @param {object} oShellHash The action must be a valid action, it may not contain "?" or directly a parameter string
     *   <code>undefined</code> if not a parseable hash
     * <pre>
     *   {
     *     target: {
     *       semanticObject: string,
     *       action: string,
     *       contextRaw: string
     *     },
     *     params: MapObject<String,Array[String]>,
     *     appStateKey: string
     *     appSpecificRoute: string
     *   }
     * </pre>
     *   xor
     *   <code>{ target: { shellHash } }</code>
     *   Note: in general it is preferred to add an appStateKey directly to the params object
     * @since 1.94.0
     * @protected
     */
    UrlParsing.constructShellHash = function (oShellHash) {
        var shellPart,
            paramsCopy,
            result,
            i = null,
            k,
            lst = [],
            first = "?",
            a = null;
        if (!oShellHash) {
            return "";
        }
        // align lack of target
        if (!oShellHash.target) {
            oShellHash.target = {};
            oShellHash.target.semanticObject = oShellHash.semanticObject;
            oShellHash.target.action = oShellHash.action;
            oShellHash.target.contextRaw = oShellHash.contextRaw;
        }
        if (oShellHash.target.shellHash || oShellHash.target.shellHash === "") {
            result = UrlParsing.privstripLeadingHash(oShellHash.target.shellHash);
            return appendIf(result, oShellHash.appSpecificRoute);
        }
        // reconstruct shell part
        if (oShellHash.target.semanticObject && oShellHash.target.action) {
            shellPart = oShellHash.target.semanticObject + "-" + oShellHash.target.action.replace(/[?].*/, "");
        } else {
            return appendIf("", oShellHash.appSpecificRoute);
        }

        if (oShellHash.target.contextRaw) {
            shellPart += "~" + oShellHash.target.contextRaw;
        }
        first = "?";
        a = null;
        lst = [];
        for (a in oShellHash.params) {
            if (oShellHash.params.hasOwnProperty(a)) {
                lst.push(a);
            }
        }
        paramsCopy = (oShellHash.params && JSON.parse(JSON.stringify(oShellHash.params))) || {};
        if (oShellHash.appStateKey) {
            lst.push("sap-xapp-state");
            paramsCopy["sap-xapp-state"] = oShellHash.appStateKey;
        }
        lst.sort();
        for (k = 0; k < lst.length; k = k + 1) {
            a = lst[k];
            if (Array.isArray(paramsCopy[a])) {
                if (paramsCopy[a].length > 1) {
                    Log.error("Array startup parameters violate the designed intent of the Unified Shell Intent, use only single-valued parameters!");
                }
                for (i = 0; i < paramsCopy[a].length; i = i + 1) {
                    shellPart += first + encodeURIComponent(a) + "=" + encodeURIComponent(paramsCopy[a][i]);
                    first = "&";
                }
            } else {
                shellPart += first + encodeURIComponent(a) + "=" + encodeURIComponent(paramsCopy[a]);
                first = "&";
            }
        }
        return appendIf(shellPart, oShellHash.appSpecificRoute);
    };

    return UrlParsing;
});
