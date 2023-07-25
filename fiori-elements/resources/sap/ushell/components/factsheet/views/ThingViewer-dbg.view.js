// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview sap.ushell.components.factsheet.views.ThingViewer
 * @deprecated
 */
sap.ui.define([
    "sap/ushell/components/factsheet/tools/ODataUrlTemplating",
    "sap/ushell/components/factsheet/factory/ThingInspector",
    "sap/ui/model/odata/ODataUtils",
    "sap/ui/core/Component"
], function (ODataUrlTemplating, ThingInspector, ODataUtils, Component) {
    "use strict";

    sap.ui.jsview("sap.ushell.components.factsheet.views.ThingViewer", {
        getControllerName: function () {
            return "sap.ushell.components.factsheet.views.ThingViewer";
        },

        createContent: function (/*oController*/) {
            var sEntityUrl, sAnnotationUrl, sEntityUrlTemplate, oTI, oViewData, sServiceUrl;
            oViewData = this.getViewData();

            // Sample Hash UI2_DEMO_PRODUCT-DisplayFactSheet~6bpO?ProductID=HT-1000
            sEntityUrl = oViewData.entity || oViewData.service;// Old Parameter Name was Service
            if (!sEntityUrl) {
                sEntityUrlTemplate = oViewData.entityTemplateURI || oViewData.template;

                if (sEntityUrlTemplate) {
                    // Parameters may be arrays
                    if (typeof sEntityUrlTemplate !== "string") {
                        sEntityUrlTemplate = sEntityUrlTemplate[0];
                    }
                    // regEx = /{[A-Za-z0-9_]*}/g;
                    // Depending on the basis version it is possible, that the value of sEntityUrlTemplate is double encoded.
                    // Therefor the following decoding was implemented as a workaround.
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%25/g, "%");
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%28/g, "(");
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%29/g, ")");
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%27/g, "'");
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%3D/g, "=");
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%7B/g, "{");
                    sEntityUrlTemplate = sEntityUrlTemplate.replace(/%7D/g, "}");

                    sEntityUrl = ODataUrlTemplating.resolve(sEntityUrlTemplate, oViewData);
                }
            }
            sAnnotationUrl = oViewData.annotationURI || oViewData.annotation;

            if (typeof sEntityUrl !== "string") {
                sEntityUrl = sEntityUrl[0];
            }
            if (typeof sAnnotationUrl !== "string") {
                sAnnotationUrl = sAnnotationUrl[0];
            }

            // sEntityUrl is f.e. "/sap/opu/odata/sap/CB_FUNDS_SRV/Fundss(FMArea='PS05',Fund='GENERAL')"
            // With the substr the service url "/sap/opu/odata/sap/CB_FUNDS_SRV" is saved in sServiceUrl
            sServiceUrl = sEntityUrl.substr(0, sEntityUrl.lastIndexOf("/"));
            function amendServiceUrlWithSapSystemIfRequired (oComponent, sServiceUrl) {
                var sSystem;
                // test for presence of the interface
                if (sap.ui.model.odata && ODataUtils && typeof ODataUtils.setOrigin === "function") {
                    // test for presence of a sap-system parameter
                    if (!(oComponent && oComponent.getComponentData())) {
                        throw new Error("no component passed");
                    }
                    if (oComponent && oComponent.getComponentData() && oComponent.getComponentData().startupParameters &&
                        oComponent.getComponentData().startupParameters["sap-system"]) {
                        sSystem = oComponent.getComponentData().startupParameters["sap-system"][0];
                        sServiceUrl = ODataUtils.setOrigin(sServiceUrl, { alias: sSystem });
                    }
                }
                return sServiceUrl;
            }
            sServiceUrl = amendServiceUrlWithSapSystemIfRequired(Component.getOwnerComponentFor(this), sServiceUrl);
            // Now the given entity is written back to the url. In the example above the substr returns "/Fundss(FMArea='PS05',Fund='GENERAL')"
            sServiceUrl = sServiceUrl + sEntityUrl.substr(sEntityUrl.lastIndexOf("/"));

            oTI = ThingInspector(sServiceUrl, sAnnotationUrl);

            // Add min-height
            oTI.addStyleClass("ThingInspector");
            return oTI;
        }
    });
});
