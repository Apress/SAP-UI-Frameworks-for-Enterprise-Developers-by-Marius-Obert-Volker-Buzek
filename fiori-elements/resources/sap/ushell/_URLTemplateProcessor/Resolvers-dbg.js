// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file URL Template Processor Resolvers.
 * For a given context (e.g. the reference to a site, the application section from the site, parameters added during runtime, etc),
 * this module can be used to find the values associated to given URL Template parameter names.
 *
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/ushell/_URLTemplateProcessor/Functions",
    "sap/ushell/_URLTemplateProcessor/utils"
], function (
    deepExtend,
    _Functions,
    _utils
) {
    "use strict";

    var O_RESOLVERS = {
        literal: resolveLiteral,
        expression: resolveExpression,
        reference: resolveReference,
        function: resolveFunction,
        path: resolvePath,
        pipe: resolvePipe
    };

    function find (oStructure, aPathPieces, oKnownValues) {
        var vCurrentNode = null;
        var aPathSoFar = [];
        var bFail = false;
        var sPath = aPathPieces.join("/");

        vCurrentNode = oStructure;
        if (typeof vCurrentNode === "undefined") {
            bFail = true;
        }

        aPathPieces.forEach(function (sPiece, iIdx) {
            if (bFail) {
                return;
            }
            aPathSoFar.push(sPiece);
            if (!vCurrentNode.hasOwnProperty(sPiece)) {
                vCurrentNode = undefined;
                bFail = true;
                return;
            }
            if (!vCurrentNode.hasOwnProperty(sPiece)) {
                throw new Error("Cannot find path '" + sPath + "' in given structure: '" + sPiece + "' seems to be missing in the object.");
            }
            vCurrentNode = vCurrentNode[sPiece];
        });

        return vCurrentNode;
    }

    function resolveLiteral (oParamDef) {
        return oParamDef.value;
    }

    function resolvePath (oParamDef, oResolvedParameters, oSite, oApplicationContext, oRuntime, sDefaultNamespace) {
        var aResolvedPathParts = oParamDef.value.map(function (oPathParam) {
            return resolveParameterValue(oPathParam, oResolvedParameters, oSite, oApplicationContext, oRuntime, sDefaultNamespace);
        });

        var bIsRelativePath = oParamDef.pathType === "relative";
        var oRoot = bIsRelativePath
            ? oApplicationContext
            : oSite;

        return find(oRoot, aResolvedPathParts, oResolvedParameters);
    }

    function resolvePipe (oParamDef, oResolvedParameters, oSite, oApplicationContext, oRuntime, sDefaultNamespace) {
        var aPipe = oParamDef.value;
        if (aPipe[0].type !== "wildcard") {
            throw new Error("Leading wildcard expected in pipe expression");
        }
        if (aPipe[0].value !== "*") {
            throw new Error("Unsupported wildcard expression: " + aPipe[0].value);
        }

        return aPipe.slice(1).reduce(function (oValues, oOperation) {
            if (oOperation.type !== "function") {
                throw new Error("Invalid operation specified in pipe expression");
            }
            return _Functions.applyFunctionInPipeContext(
                oOperation.name,
                oOperation.args.map(function (oArg) {
                    return resolveParameterValue(oArg, oResolvedParameters, oSite, oApplicationContext, oRuntime, sDefaultNamespace);
                }),
                oValues
            );
        }, deepExtend({}, oRuntime[sDefaultNamespace] || {}));
    }

    function resolveFunction (oParamDef, oResolvedParameters, oSite, oApplicationContext, oRuntime, sDefaultNamespace) {
        var sFunctionName = oParamDef.name;
        var aFunctionArgs = oParamDef.args.map(function (oParam) {
            return resolveParameterValue(oParam, oResolvedParameters, oSite, oApplicationContext, oRuntime, sDefaultNamespace);
        });
        var aValues = oParamDef.params.map(function (oParam) {
            return resolveParameterValue(oParam, oResolvedParameters, oSite, oApplicationContext, oRuntime, sDefaultNamespace);
        });

        return _Functions.applyFunctionInValueContext(sFunctionName, aFunctionArgs, aValues);
    }

    function resolveExpression (oParamDef, oResolvedParameters, oSite, oApplicationContext, oRuntime, sDefaultNamespace) {
        var oExpression = oParamDef.value;

        if (O_RESOLVERS[oExpression.type]) {
            return resolveParameterValue(oExpression, oResolvedParameters, oSite, oApplicationContext, oRuntime, sDefaultNamespace);
        }

        throw new Error("unknown expression type: " + oExpression.type);
    }

    function resolveReference (oParamDef, oResolvedParameters, oSite, oApplicationContext, oRuntime, sDefaultNamespace) {
        var sValueKey = oParamDef.value;
        if (!oParamDef.hasOwnProperty("namespace")) {
            return oResolvedParameters[sValueKey];
        }

        var sNamespace = oParamDef.namespace;
        var sErrorHeading = "The template attemps to take the value '" + sValueKey + "' from '" + sNamespace + "' namespace.";
        if (!oRuntime.hasOwnProperty(sNamespace)) {
            throw new Error(sErrorHeading + " However this value was not defined at runtime. The template should reference only defined values.");
        }
        var vNamespaceContent = oRuntime[sNamespace];
        var bNamespaceContentRequested = sValueKey === ".";
        if (bNamespaceContentRequested) {
            return vNamespaceContent;
        }

        if (typeof vNamespaceContent !== "object") {
            throw new Error(sErrorHeading + " However the runtime did not define the namespace as an object. The template cannot access the desired value using the object notation in this case.");
        }

        return vNamespaceContent[sValueKey];
    }

    function resolveParameterValue (oParsedParameterDefinition, oResolvedParameters, oSite, oApplicationContext, oRuntime, sDefaultNamespace) {
        var sParameterType = oParsedParameterDefinition.type;
        if (O_RESOLVERS[sParameterType]) {
            return O_RESOLVERS[sParameterType](
                oParsedParameterDefinition,
                oResolvedParameters,
                oSite,
                oApplicationContext,
                oRuntime,
                sDefaultNamespace
            );
        }

        throw new Error("Cannot resolve unknown parameter type: '" + sParameterType + "'");
    }

    /**
     * Resolves all parameters.
     *
     * @param {object} oParameterSetParsed The definition of all parameter names, parsed by the URL Template parameter parser.
     *   This is, for example, an object like:
     *   <pre>
     *   {
     *     someUrlTemplateParameterName: {
     *       type: "expression"
     *       value: {
     *         namespace: "innerAppRoute",
     *         type: "reference",
     *         value: "."
     *       }
     *     }
     *   }
     *   </pre>
     * @param {array} aResolutionOrder The order to be used while resolving individual parameters.
     * @param {object} oSite The reference to the site containing all data. This is used to resolve parameters of (absolute) path types.
     * @param {object} oRuntime The runtime. It's an object containing namespaces defined by the runtime
     *   that exposes URL templating functionality (e.g., ClientSideTargetResolution).
     *   Each namespace can be a single string value, or an object containing a set of parameters, for example:
     *   <pre>
     *   {
     *     innerAppRoute: "/some/app/route",
     *     intentParameters: {
     *       p1: ["v1"],
     *       p2: "v2"
     *     }
     *   }
     *   </pre>
     * @param {object} oApplicationContext The application context. This is an object used to resolve relative paths.
     *   It's normally a subset of the site, but this is not a necessity. It can be a completely separate object.
     * @param {string} sDefaultNamespace The default namespace to use when no namespace is specified in pipe expressions.
     * @returns {object} The set of parameters along with their values recovered by the respective contexts (e.g. site).
     * @private
     */
    function resolveAllParameters (oParameterSetParsed, aResolutionOrder, oSite, oRuntime, oApplicationContext, sDefaultNamespace) {
        var oResolvedParameters = {};
        aResolutionOrder.forEach(function (sParameterToResolve) {
            var oParamDef = oParameterSetParsed[sParameterToResolve];
            var sResolvedParameterValue = resolveParameterValue(
                oParamDef,
                oResolvedParameters,
                oSite,
                oApplicationContext,
                oRuntime,
                sDefaultNamespace
            );
            oResolvedParameters[sParameterToResolve] = sResolvedParameterValue;
        });
        return oResolvedParameters;
    }

    return {
        resolveLiteral: resolveLiteral,
        resolveExpression: resolveExpression,
        resolveReference: resolveReference,
        resolveFunction: resolveFunction,
        resolvePath: resolvePath,
        resolvePipe: resolvePipe,

        resolveParameterValue: resolveParameterValue,
        resolveAllParameters: resolveAllParameters
    };
});
