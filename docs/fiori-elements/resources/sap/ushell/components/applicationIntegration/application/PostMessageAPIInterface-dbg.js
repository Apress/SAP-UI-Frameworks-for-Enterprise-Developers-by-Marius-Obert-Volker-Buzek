// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/ui/thirdparty/jquery"
], function (deepExtend, jQuery) {
    "use strict";

    var USER_API_PREFIX = "user.postapi.";

    /**
     * @private
     */
    function PostMessageAPIInterface () {
        var _bIsFLP,
            _fnDoRegistration;

        /**
         * @private
         */
        this.init = function (bIsFLP, fnDoRegistration) {
            _bIsFLP = bIsFLP;
            _fnDoRegistration = fnDoRegistration;
        };

        /**
         * @private
         */
        this.getInterface = function () {
            var oInterface = {};

            oInterface.registerPostMessageAPIs = registerUserPostMessageAPIs.bind(null, _fnDoRegistration);
            oInterface[(_bIsFLP === true ? "postMessageToApp" : "postMessageToFlp")] = doPostMessage.bind(null, _bIsFLP);
            oInterface.createPostMessageResult = createPostMessageResult;
            return oInterface;
        };
    }

    /**
     * @private
     */
    function registerUserPostMessageAPIs (fnDoRegistration, oPostMessageAPIs, bSAPInternal) {
        var oRes = {
            status: "success",
            desc: ""
        };
        var oDefaultInCallProps = {
            isActiveOnly: true,
            distributionType: ["all"],
            fnResponseHandler: function () { }
        };

        if (oPostMessageAPIs === undefined || Object.keys(oPostMessageAPIs).length <= 0) {
            oRes.status = "error";
            oRes.desc = "no handler was found to register";
            return oRes;
        }

        if (bSAPInternal === undefined) {
            bSAPInternal = false;
        }
        Object.keys(oPostMessageAPIs).forEach(function (sService) {
            if (typeof sService !== "string") {
                oRes.status = "error";
                oRes.desc = "oPostMessageAPIs should contain only string keys";
            } else if (bSAPInternal === false && sService.indexOf(USER_API_PREFIX) !== 0) {
                oRes.status = "error";
                oRes.desc = "all user custom Message APIs must start with '" + USER_API_PREFIX + "'";
            } else {
                Object.keys(oPostMessageAPIs[sService]).forEach(function (sType) {
                    if (sType == "inCalls") {
                        oPostMessageAPIs[sService].oServiceCalls = oPostMessageAPIs[sService][sType];
                        delete oPostMessageAPIs[sService][sType];
                    } else if (sType == "outCalls") {
                        Object.keys(oPostMessageAPIs[sService][sType]).forEach(function (sMethod) {
                            oPostMessageAPIs[sService][sType][sMethod] = deepExtend({}, oDefaultInCallProps, oPostMessageAPIs[sService][sType][sMethod]);
                        });
                        oPostMessageAPIs[sService].oRequestCalls = oPostMessageAPIs[sService][sType];
                        delete oPostMessageAPIs[sService][sType];
                    } else {
                        oRes.status = "error";
                        oRes.desc = "api should contain either 'inCalls' or 'outCalls'";
                    }
                });
            }
        });

        if (oRes.status === "success") {
            fnDoRegistration(oPostMessageAPIs);
        }

        return oRes;
    }

    /**
     * @private
     */
    function doPostMessage (bIsFLP, sServiceName, sInterface, oParams) {
        var oDeferred = new jQuery.Deferred();

        if (oParams === undefined) {
            oParams = {};
        }

        if (bIsFLP) {
            sap.ui.require(["sap/ushell/components/applicationIntegration/AppLifeCycle"], function (AppLifeCycle) {
                AppLifeCycle.postMessageToIframeApp(sServiceName, sInterface, oParams, true)
                    .then(function (oResult) {
                        oDeferred.resolve(oResult && oResult[0] && oResult[0].body.result);
                    });
            });
        } else {
            sap.ui.require(["sap/ushell/appRuntime/ui5/AppRuntimeService"], function (AppRuntimeService) {
                AppRuntimeService.sendMessageToOuterShell(sServiceName + "." + sInterface, oParams)
                    .done(function (oResult) {
                        oDeferred.resolve(oResult);
                    });
            });
        }

        return oDeferred.promise();
    }

    /**
     * @private
     */
    function createPostMessageResult (oResult) {
        if (oResult === undefined) {
            oResult = {};
        }
        return new jQuery.Deferred().resolve(oResult).promise();
    }

    return new PostMessageAPIInterface();
});
