// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file The URL Template Processor.
 *
 * This module can be used to generate URLs, based on a template and a given context.
 * A URL template shows the structure of the desired URL, reporting
 * the name of the target parameters in the various parts of this structure.
 *
 * A URL template is expressed according to the proposed standard rfc6570, for example:
 * <code>http://www.example.com{?queryParam}</code>
 *
 * The parameters that appear in the URL template are then resolved as specified
 * by a mini-language that expresses how the parameter can be recovered.
 *
 * For example, the set below allows to recover <code>queryParam</code> from a specific path in the site:
 * <pre>
 * {
 *   queryParam: "{/path/to/my/section}"
 * }
 * </pre>
 *
 * The following URL results when the template of the example above is expanded with the above set of parameters:
 * <code>http://www.example.com?queryParam=myValue</code>
 *
 * The language to define parameters in the URL Template parameter set contains a minimal set of conditionals,
 * logical operators, and functions that allow to define the parameter set with a certain degree of control.
 *
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/thirdparty/URI",
    "sap/ui/thirdparty/URITemplate", // needed for "URI#expand"
    "sap/ushell/_URLTemplateProcessor/DefinitionParameterSetBuilder",
    "sap/ushell/_URLTemplateProcessor/DependencyGraph",
    "sap/ushell/_URLTemplateProcessor/Resolvers",
    "sap/ushell/_URLTemplateProcessor/TemplateParameterParser",
    "sap/ushell/_URLTemplateProcessor/utils"
], function (
    Log,
    URI,
    URITemplate,
    _DefinitionParameterSetBuilder,
    _DependencyGraph,
    _Resolvers,
    _TemplateParameterParser,
    _utils
) {
    "use strict";

    function log (s) {
        Log.debug(s, "sap.ushell.URLTemplateProcessor");
    }

    function formatValueForLogging (vValue) {
        if (typeof vValue === "undefined") {
            return "<undefined>";
        }
        if (typeof vValue === "string") {
            if (vValue === "") {
                return "<empty string>";
            }
            return "'" + vValue + "'";
        }
        if (typeof vValue === "number") {
            return "(number) " + vValue;
        }
        if (typeof vValue === "boolean") {
            return "(bool) " + vValue;
        }

        var sSerializedObject;
        if (typeof vValue === "object") {
            sSerializedObject = JSON.stringify(vValue);
            if (sSerializedObject.length > 255) {
                sSerializedObject = sSerializedObject.substr(0, 255) + "...";
            }
        } else {
            sSerializedObject = "{other type}";
        }

        return sSerializedObject;
    }

    function extractPostExpansionOperations (oParameterSet) {
        var aParametersWithOperations = Object.keys(oParameterSet).filter(function (sParamName) {
            return typeof oParameterSet[sParamName] === "object"
                && oParameterSet[sParamName].hasOwnProperty("renameTo");
        });

        var aOperations = [];

        aParametersWithOperations.forEach(function (sParamName) {
            var oParamDef = oParameterSet[sParamName];
            if (oParamDef.hasOwnProperty("renameTo")) {
                aOperations.push(function (sUrlTemplate, sUrl) {
                    // limit replacement to query only
                    var sReplacedUrl = sUrl;

                    sReplacedUrl = sUrl.replace(
                        new RegExp(sParamName + "=", "g"),
                        oParamDef.renameTo + "="
                    );

                    return sReplacedUrl;
                });
            }
        });

        return aOperations;
    }

    /**
     * Expands a URL Template, logging any activity via <code>Log.debug</code>.
     *
     * @param {object} oTemplatePayload The template payload, an object including the url template and the url template parameter set.
     * @param {object} oSite The reference to the site containing all data. This is used to resolve parameters of (absolute) path types.
     * @param {object} oRuntime The runtime. It is an object containing namespaces defined by the runtime
     *   that exposes URL templating functionality (e.g., ClientSideTargetResolution).
     *   Each namespace can be a single string value, or an object containing a set of parameters, for example like:
     *   <pre>
     *   {
     *     innerAppRoute: "/some/app/route",
     *     intentParameters: {
     *       p1: ["v1"],
     *       p2: "v2"
     *     }
     *   }
     *   </pre>
     * @param {object} oApplicationContext The application context. This is an object used to resolve parameters with relative path type.
     *   It's normally a subset of the site, but this is not a necessity.  It can be a completely separate object.
     * @param {string} sDefaultNamespace The default namespace from <code>oRuntime</code>
     *   where the values of parameters without specified namespace can be recovered.
     * @returns {string} A URL expanded according to the given template.
     */
    function expand (oTemplatePayload, oSite, oRuntime, oApplicationContext, sDefaultNamespace) {
        var oExpandProcessData = prepareExpandData(oTemplatePayload, oSite, oRuntime, oApplicationContext, sDefaultNamespace);
        return _expand(oTemplatePayload, oExpandProcessData);
    }

    function prepareExpandData (oTemplatePayload, oSite, oRuntime, oApplicationContext, sDefaultNamespace) {
        log("[TEMPLATE EXPANSION] " + oTemplatePayload.urlTemplate);

        var oDefinitionParamsSet = _DefinitionParameterSetBuilder.buildDefinitionParameterSet(oTemplatePayload.parameters, oSite, sDefaultNamespace) || {};
        var oRuntimeParamsSimpleSet = _utils.removeArrayParameterNotation(oRuntime[sDefaultNamespace] || {});
        var oDefinitionParameterSetParsed = _TemplateParameterParser.parseTemplateParameterSet(oDefinitionParamsSet, sDefaultNamespace);
        var oRuntimeParamsSimpleSetParsed = _TemplateParameterParser.parseTemplateParameterSetAsLiterals(oRuntimeParamsSimpleSet);
        var oParameterSetParsed = _utils.mergeObject(oRuntimeParamsSimpleSetParsed, oDefinitionParameterSetParsed);

        log("- parsed template parameters: " + JSON.stringify(oParameterSetParsed, null, 3));

        var oGraph = _DependencyGraph.buildDependencyGraph(oParameterSetParsed);

        log("- created dependency graph: " + JSON.stringify(oGraph, null, 3));

        var aResolutionOrder = _DependencyGraph.getDependencyResolutionOrder(oGraph);

        log("- resolving in order: " + aResolutionOrder.join(" > "));

        var oResolvedParameters = _Resolvers.resolveAllParameters(
            oParameterSetParsed,
            aResolutionOrder,
            oSite,
            oRuntime,
            oApplicationContext,
            sDefaultNamespace
        );

        Object.keys(oResolvedParameters).forEach(function (sParamName) {
            var sParamValue = oResolvedParameters[sParamName];
            log(sParamName + " --> " + formatValueForLogging(sParamValue));
        });

        return {
            oDefinitionParamsSet: oDefinitionParamsSet,
            oResolvedParameters: oResolvedParameters
        };
    }

    function _expand (oTemplatePayload, oExpandProcessData) {
        var aPostExpansionOperations = extractPostExpansionOperations(oExpandProcessData.oDefinitionParamsSet || {});
        var sUrlTemplate = oTemplatePayload.urlTemplate;

        var sUrl = URI.expand(sUrlTemplate, oExpandProcessData.oResolvedParameters).toString();
        log("- created URL: " + sUrl);

        aPostExpansionOperations.forEach(function (fnOperation) {
            sUrl = fnOperation(sUrlTemplate, sUrl);
        });

        if (aPostExpansionOperations.length > 0) {
            log("- created URL (post expansion): " + sUrl);
        }

        return sUrl;
    }

    return {
        prepareExpandData: prepareExpandData,
        expand: expand
    };
});
