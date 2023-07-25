// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview
 *
 * Holds the inbounds that should be always consider during the target
 * resolution process.
 *
 * <p>These inbounds are called "virtual" because they figure exactly as
 * if they were regular inbounds configured by the FLP user/admin.</p>
 *
 * <p>This is a dependency of ClientSideTargetResolution.  Interfaces
 * exposed by this module may change at any time without notice.</p>
 *
 * @version 1.113.0
 */
sap.ui.define([], function () {
    "use strict";

    var oVirtualInbounds = {};

    var A_VIRTUAL_INBOUNDS = [
        {
            hideIntentLink: true, // don't show in getLinks
            semanticObject: "Action",
            action: "search",
            deviceTypes: {
                desktop: true, tablet: true, phone: true
            },
            signature: {
                parameters: {},
                additionalParameters: "notallowed"
            },
            resolutionResult: {
                applicationType: "SAPUI5",
                ui5ComponentName: "sap.ushell.renderers.fiori2.search.searchComponent",
                additionalInformation: "SAPUI5.Component=sap.ushell.renderers.fiori2.search.searchComponent",
                url: sap.ui.require.toUrl("sap/ushell/renderers/fiori2/search/searchComponent"),
                loadCoreExt: true, // for the search component core-ext-light should be loaded to avoid single module loading
                loadDefaultDependencies: false
            }
        },
        // #FLPPageTemplate-manage used for CONF layer.
        // This virtual inbound will be removed if the PageComposer is ready to run in a standalone html.
        // The PageComposer as of now, is only supported on ABAP platform.
        // If this intent is called on non-abap platforms, a runtime error will occur as before.
        {
            hideIntentLink: true, // don't show in getLinks
            semanticObject: "FLPPageTemplate",
            action: "manage",
            deviceTypes: {
                desktop: true, tablet: false, phone: false
            },
            signature: {
                parameters: {
                    pageId: {
                        required: false,
                        defaultValue: {
                            value: ""
                        }
                    },
                    mode: {
                        required: false,
                        defaultValue: {
                            value: "view"
                        }
                    }
                },
                additionalParameters: "notallowed"
            },
            resolutionResult: {
                applicationType: "URL",
                ui5ComponentName: "nw.core.flp.pagecomposer.conf",
                additionalInformation: "SAPUI5.Component=nw.core.flp.pagecomposer.conf",
                url: "/sap/bc/ui5_ui5/sap/sui_paget_man",
                applicationDependencies: {
                    manifest: "/sap/bc/lrep/content/apps/nw.core.flp.pagecomposer.conf/app/sap/sui_paget_man/manifest.appdescr",
                    name: "nw.core.flp.pagecomposer.conf",
                    self: {
                        name: "nw.core.flp.pagecomposer.conf",
                        url: "/sap/bc/ui5_ui5/sap/sui_paget_man"
                    },
                    asyncHints: {
                        libs: [
                            {
                                name: "nw.core.flp.transport.cust",
                                url: {
                                    final: false,
                                    url: "/sap/bc/ui5_ui5/sap/sui_tr_cust"
                                }
                            }
                        ]
                    }
                },
                async: true,
                loadDefaultDependencies: false
            }
        }
    ];

    /**
     * Returns whether the given inbound is a virtual inbound.
     *
     * <p>Compares the reference of the inbound to determine this,
     * to ensure the output of this method is not influenced by input
     * coming beyond ClientSideTargetResolution service.</p>
     *
     * <p>NOTE: this method could be a potential performance bottleneck
     * if the number of virtual inbounds increases too much. But for
     * the time being we keep it simple, avoid premature optimization
     * and reserve the right to increase complexity of this method
     * later in case.</p>
     *
     * @param {object} oInbound
     *    The inbound that must be checked.
     *
     * @returns {boolean}
     *    Whether the inbound is a virtual inbound.
     *
     * @private
     */
    oVirtualInbounds.isVirtualInbound = function (oInbound) {
        return A_VIRTUAL_INBOUNDS.some(function (oVirtualInbound) {
            return oVirtualInbound === oInbound; // ref equality
        });
    };

    oVirtualInbounds.getInbounds = function () {
        return A_VIRTUAL_INBOUNDS;
    };

    return oVirtualInbounds;
});
