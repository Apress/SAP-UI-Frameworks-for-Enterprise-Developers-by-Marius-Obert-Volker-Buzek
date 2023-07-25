// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file the URL Template Parameter parser.
 *
 * This file contains utilities to parse an entire set of template parameter definitions.
 * This parser allows to log what is understood by the machine during runtime (for debugging purposes),
 * but also to dramatically reduce the complexity of the code and its future maintainability.
 *
 * In practice, can be used to turn sets of strings like definitions like:
 *   <pre>
 *   { p1: "{*|match(a)|match(b)}" }
 *   </pre>
 * into something like:
 *   <pre>
 *   {
 *     "type": "expression",
 *     "value": {
 *       "type": "pipe",
 *       "value": [
 *         { "type": "wildcard", "value": "*" },
 *         {
 *           "type": "function",
 *           "args": [{ type: "literal", value: "a" }],
 *           "name": "match",
 *           "params": []
 *         }, {
 *           "type": "function",
 *           "args": [{ type: "literal", value: "b" }],
 *           "name": "match",
 *           "params": []
 *         }
 *       ]
 *     }
 *   }
 *   </pre>
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/ushell/_URLTemplateProcessor/Functions"
], function (
    _Functions
) {
    "use strict";

    function parseExpression (sDefaultNamespace, sExpressionBody) {
        var reExpression = buildExpressionRegExp();
        var aExpressionGroups = reExpression.exec(sExpressionBody);

        if (aExpressionGroups === null) {
            throw new Error("Cannot parse expression: '" + sExpressionBody + "'");
        }

        var sStrippedExpressionBody = removeSurroundingChars(sExpressionBody);

        if (sStrippedExpressionBody.indexOf("*") === 0) {
            return parsePipeExpression(sDefaultNamespace, sStrippedExpressionBody);
        }

        var sAllFunctionsRegExpString =
            "^(" + _Functions.getPossibleFunctionsRegExpString() + ")[^a-z]";
        var rRegExp = new RegExp(sAllFunctionsRegExpString);
        if (rRegExp.exec(sStrippedExpressionBody)) {
            return parseFunction(sDefaultNamespace, sStrippedExpressionBody);
        }

        return parseListItem(sDefaultNamespace, sStrippedExpressionBody);
    }

    function parsePipeExpression (sDefaultNamespace, sPipeExpression) {
        var aPipeParts = parseList(sDefaultNamespace, sPipeExpression, "|");
        var sWildcard = aPipeParts.shift();
        return {
            type: "pipe",
            value: [{
                type: "wildcard",
                value: sWildcard
            }].concat(aPipeParts.map(parseFunction.bind(null, sDefaultNamespace)))
        };
    }

    function parseReference (sReference) {
        var sReferenceName = sReference.substr(1);
        var sNamespace;
        if (sReferenceName.indexOf(":") >= 0) {
            var aReferenceParts = sReferenceName.split(":");
            sNamespace = aReferenceParts[0];
            sReferenceName = aReferenceParts[1];
        }

        var oResult = {
            type: "reference",
            value: sReferenceName
        };

        if (sNamespace) {
            oResult.namespace = sNamespace;
        }

        return oResult;
    }

    function parsePath (sDefaultNamespace, sPath) {
        var aPathParts = sPath.split("/");
        var sPathType = "relative";

        if (aPathParts[0] === "") {
            sPathType = "absolute";
            aPathParts.shift();
        }

        if (aPathParts[0] === ".") {
            aPathParts.shift();
        }

        return {
            type: "path",
            pathType: sPathType,
            value: aPathParts.map(parsePathPart.bind(null, sDefaultNamespace))
        };
    }

    function parseListItem (sDefaultNamespace, sListItem) {
        if (sListItem.charAt(0) === "{" && sListItem.charAt(sListItem.length - 1) === "}") {
            return parseListItem(sDefaultNamespace, removeSurroundingChars(sListItem));
        }
        if (sListItem.indexOf(".") === 0 || sListItem.indexOf("/") === 0) {
            return parsePath(sDefaultNamespace, sListItem);
        }
        if (sListItem.charAt(0) === "'" && sListItem.charAt(sListItem.length - 1) === "'") {
            return parseLiteral(removeSurroundingChars(sListItem));
        }
        if (sListItem.charAt(0) === "&") {
            return parseReference(sListItem);
        }

        return {
            type: "reference",
            value: sListItem,
            namespace: sDefaultNamespace
        };
    }

    function parsePathPart (sDefaultNamespace, sPart) {
        if (sPart.charAt(0) === "{" && sPart.charAt(sPart.length - 1) === "}") {
            return parseListItem(sDefaultNamespace, removeSurroundingChars(sPart));
        }

        return {
            type: "literal",
            value: sPart
        };
    }

    function parseLiteral (sLiteral) {
        return {
            type: "literal",
            value: sLiteral
        };
    }

    function parseFunction (sDefaultNamespace, sFunction) {
        var sFunctionName = sFunction.split(/[(\s]/)[0];

        var sRemainingFunction = removePrefix(sFunction, sFunctionName);
        sRemainingFunction = sRemainingFunction.replace(/^\s+/, "");

        var sFunctionArgs = "";
        if (sRemainingFunction.charAt(0) === "(") {
            // there are arguments
            var iFunctionArgsEnd = sRemainingFunction.search(/([)]\s)|([)]$)/);
            if (iFunctionArgsEnd === -1) {
                throw new Error("Cannot find termination of function '" + sRemainingFunction + "' in '" + sFunction + "'");
            }
            sFunctionArgs = sRemainingFunction.substr(1, iFunctionArgsEnd - 1);

            sRemainingFunction = removePrefix(sRemainingFunction, "(" + sFunctionArgs + ")");
            sRemainingFunction = sRemainingFunction.replace(/^\s+/, "");
        }

        var sFunctionParams = sRemainingFunction;

        return {
            type: "function",
            name: sFunctionName,
            args: parseList(sDefaultNamespace, sFunctionArgs, ",").map(function (s) {
                // function arguments use another syntax
                // name -> a literal
                // {name} -> reference
                // ... and these are the only possibilities.
                // so we convert accordingly, to be able to use parseListItem
                return s.charAt(0) === "{"
                    ? removeSurroundingChars(s)
                    : "'" + s + "'";
            }).map(parseListItem.bind(null, sDefaultNamespace)),
            params: parseList(sDefaultNamespace, sFunctionParams, ",").map(parseListItem.bind(null, sDefaultNamespace))
        };
    }

    function parseList (sDefaultNamespace, sList, sSeparator) {
        if (!sList) {
            return [];
        }

        // prevent splitting on escaped separator
        var aSplittedList = sList
            .split(sSeparator)
            .reduce(function (aArgs, sNextArg, iIdx) {
                if (iIdx === 0) {
                    aArgs.push(sNextArg);
                    return aArgs;
                }

                var iLastIndex = aArgs.length - 1;
                var sPrevious = aArgs[iLastIndex];

                var bMustMerge = sPrevious.length > 0
                    && sPrevious.charAt(sPrevious.length - 1) === "\\";

                var sPrevArg = "";
                if (bMustMerge) {
                    sPrevArg = aArgs.pop();
                    sPrevArg = sPrevArg.substr(0, sPrevArg.length - 1) + sSeparator;
                }

                aArgs.push(sPrevArg + sNextArg);
                return aArgs;
            }, []);

        return aSplittedList;
    }

    function parseParameterValue (sDefaultNamespace, vParameterValue) {
        var sParameterValue = vParameterValue;
        var sRenameTo = null;
        if (Object.prototype.toString.apply(vParameterValue) === "[object Object]") {
            sParameterValue = vParameterValue.value;
            sRenameTo = vParameterValue.renameTo;
        }

        var bIsLiteral = isLiteral(sParameterValue);
        if (bIsLiteral) {
            return parseLiteral(sParameterValue);
        }

        var sType = "expression";
        var oParsedExpression = parseExpression(sDefaultNamespace, sParameterValue);

        var oParsedParameter = {
            type: sType,
            value: oParsedExpression
        };

        if (sRenameTo) {
            oParsedExpression.renameTo = sRenameTo;
        }

        return oParsedParameter;
    }

    function extractExpressionBody (s) {
        var bExpressionExpected = s.indexOf("{") === 0;
        var reExpr = buildExpressionRegExp();
        var aGroups = reExpr.exec(s);

        if (!aGroups) {
            if (bExpressionExpected) {
                throw new Error("Expression was expected. But " + s + " does not look like a valid expression");
            }
            return null;
        }

        return aGroups[1];
    }

    function buildExpressionRegExp () {
        var sOptionalNameSpace = "[a-zA-Z0-9]+?:";
        var sVarName = "((&(" + sOptionalNameSpace + ")?)?[.a-zA-Z0-9_-]+?)";
        var sQuotedLiteral = "('(.*?)')";
        var sUnquotedLiteral = "([^' ]*?)";
        var sVarRef = "{(" + sVarName + ")}";

        var sPath = "("
            + "[.]?([/](" + sVarName + "|" + sVarRef + "))+"
            + ")";

        var sListItem = "("
            + sPath
            + "|"
            + sQuotedLiteral
            + "|"
            + sVarName
            + "|"
            + sVarRef
            + ")";

        var sList = "(" + sListItem + "(," + sListItem + ")*)";

        var sFunctionArg = "("
            + sUnquotedLiteral
            + "|"
            + sVarRef
            + ")";

        var sFunctionArgsList = "(" + sFunctionArg + "(," + sFunctionArg + ")*)";

        var sFunctionArgs = "("
            + "[(]"
            + sFunctionArgsList
            + "[)]"
            + ")?";

        var sAllFunctionsRegExpString = _Functions.getPossibleFunctionsRegExpString();

        var sFunction = "("
            + "(" + sAllFunctionsRegExpString + ")"
            + "(" + sFunctionArgs + ")"
            + ")";

        var sWildcardExpression = "([*]([|]" + sFunction + ")*)";

        var sExpRegExp = "^{("
            + sWildcardExpression
            + "|"
            + "((" + sFunction + ")([ ](" + sList + "))?)"
            + "|"
            + "(" + sListItem + ")"
            + ")}$";

        var reExpr = new RegExp(sExpRegExp);
        return reExpr;
    }

    function isExpression (s) {
        return extractExpressionBody(s) !== null;
    }

    function removeSurroundingChars (s) {
        var aChars = s.split("");
        aChars.shift();
        aChars.pop();
        return aChars.join("");
    }

    function removePrefix (sTarget, sPrefixToRemove) {
        if (sTarget.indexOf(sPrefixToRemove) === 0) {
            return sTarget.substr(sPrefixToRemove.length);
        }
        throw new Error("Given string does not start with prefix '" + sPrefixToRemove + "'");
    }

    function isLiteral (s) {
        return typeof s === "string" && !isExpression(s);
    }

    function parseTemplateParameterSet (oParameterSet, sDefaultNamespace) {
        return Object.keys(oParameterSet).reduce(function (oParsed, sNextParameter) {
            var vParameterValue = oParameterSet[sNextParameter];
            oParsed[sNextParameter] = parseParameterValue(sDefaultNamespace, vParameterValue);
            return oParsed;
        }, {});
    }

    function parseTemplateParameterSetAsLiterals (oParameterSet, sDefaultNamespace) {
        return Object.keys(oParameterSet).reduce(function (oParsed, sNextParameter) {
            var vParameterValue = oParameterSet[sNextParameter];
            oParsed[sNextParameter] = parseLiteral(vParameterValue);
            return oParsed;
        }, {});
    }

    return {
        parseTemplateParameterSet: parseTemplateParameterSet,
        parseTemplateParameterSetAsLiterals: parseTemplateParameterSetAsLiterals,
        parsePath: parsePath,

        _isExpression: isExpression,
        _parseList: parseList,
        _parseParameterValue: parseParameterValue
    };
});
