// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/NavTargetResolution",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext",
    "sap/ui/thirdparty/jquery"
], function (
    NavTargetResolution,
    AppRuntimeService,
    AppRuntimeContext,
    jQuery
) {
    "use strict";

    function NavTargetResolutionProxy (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        NavTargetResolution.call(this, oAdapter, oContainerInterface, sParameters, oServiceConfiguration);

        this.getDistinctSemanticObjectsLocal = this.getDistinctSemanticObjects;
        this.getDistinctSemanticObjects = function () {
            var oDeferred = new jQuery.Deferred(),
                aPromises = [],
                arrResult;

            aPromises.push(AppRuntimeContext.getIsScube() ? this.getDistinctSemanticObjectsLocal() : Promise.resolve([]));
            aPromises.push(AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.services.NavTargetResolution.getDistinctSemanticObjects"
                ));
            Promise.allSettled(aPromises).then(function (aResults) {
                arrResult = aResults[0].status === "fulfilled" ? aResults[0].value : [];
                arrResult = arrResult.concat(aResults[1].status === "fulfilled" ? aResults[1].value : []);
                arrResult = arrResult.filter(function(item, pos, self) {
                    return self.indexOf(item) == pos;
                }).sort();
                oDeferred.resolve(arrResult);
            });

            return oDeferred.promise();
        };

        this.expandCompactHash = function (sHashFragment) {
            if (sHashFragment && sHashFragment.indexOf("sap-intent-param") > 0) {
                return AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.services.NavTargetResolution.expandCompactHash", {
                        sHashFragment: sHashFragment
                    });
            }
            return new jQuery.Deferred().resolve(sHashFragment).promise();
        };

        this.resolveHashFragmentLocal = this.resolveHashFragment;
        this.resolveHashFragment = function (sHashFragment) {
            if (AppRuntimeContext.getIsScube()) {
                var oDeferred = new jQuery.Deferred();

                this.resolveHashFragmentLocal(sHashFragment)
                    .done(oDeferred.resolve)
                    .fail(function () {
                        return AppRuntimeService.sendMessageToOuterShell(
                            "sap.ushell.services.NavTargetResolution.resolveHashFragment", {
                                sHashFragment: sHashFragment
                            })
                            .done(oDeferred.resolve)
                            .fail(oDeferred.reject);
                    });
                return oDeferred.promise();
            } else {
                return AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.services.NavTargetResolution.resolveHashFragment", {
                        sHashFragment: sHashFragment
                    });
            }

        };

        this.isIntentSupportedLocal = this.isIntentSupported;
        this.isIntentSupported = function (aIntents) {
            var oDeferred = new jQuery.Deferred(),
                aPromises = [],
                oResult1,
                oResult2;

            aPromises.push(AppRuntimeContext.getIsScube() ? this.isIntentSupportedLocal(aIntents) : Promise.resolve(undefined));
            aPromises.push(AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.NavTargetResolution.isIntentSupported", {
                    aIntents: aIntents
                }));
            Promise.allSettled(aPromises).then(function (aResults) {
                oResult1 = aResults[0].status === "fulfilled" ? aResults[0].value : undefined;
                oResult2 = aResults[1].status === "fulfilled" ? aResults[1].value : undefined;
                if (oResult1 && oResult2) {
                    Object.keys(oResult1).forEach(function (sIntent) {
                        oResult1[sIntent].supported = oResult1[sIntent].supported || oResult2[sIntent].supported;
                    });
                } else if (oResult1 || oResult2) {
                    oResult1 = oResult1 || oResult2;
                } else {
                    oResult1 = {};
                    aIntents.forEach(function (sIntent) {
                        oResult1[sIntent] = { supported: undefined };
                    });
                }
                oDeferred.resolve(oResult1);
            });

            return oDeferred.promise();
        };
    }

    NavTargetResolutionProxy.prototype = NavTargetResolution.prototype;
    NavTargetResolutionProxy.hasNoAdapter = NavTargetResolution.hasNoAdapter;

    return NavTargetResolutionProxy;
}, true);
