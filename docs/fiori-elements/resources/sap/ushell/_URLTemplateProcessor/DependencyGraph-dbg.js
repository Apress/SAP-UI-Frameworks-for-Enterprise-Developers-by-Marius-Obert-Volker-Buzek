// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file Methods to understand in what order template parameters shall be resolved.
 *
 * Because values of URL Template Parameters can refer to the value of other parameters, a proper order
 * for finding the value of parameters must be established (e.g. by resolving parameters without a depending parameters first).
 * The proper order of evaluation can be determined by creating and visiting a graph that represents parameters and depending parameters
 * as nodes. This graph can be also used to detect cyclic references in the parameter set definition.
 *
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/base/util/deepExtend"
], function (
    deepExtend
) {
    "use strict";

    function isTerminalNode (oNode) {
        return typeof oNode === "string"
            || oNode.type === "wildcard"
            || oNode.type === "literal"
            || oNode.type === "intentParameter"
            || oNode.type === "reference";
    }

    function isNodeInGraph (oNode) {
        return oNode.type === "reference" && !oNode.namespace;
    }

    function addDependencyNodeToGraph (oGraph, sParentNodeId, oNode) {
        if (!oGraph.hasOwnProperty(sParentNodeId)) {
            oGraph[sParentNodeId] = [];
        }
        if (isNodeInGraph(oNode)) {
            oGraph[sParentNodeId].push(oNode.value);
        }
    }

    function buildDependencyGraph (oParameterSetParsed) {
        var oDependencyGraph = {};
        var fnAddNodeToGraph = addDependencyNodeToGraph.bind(null, oDependencyGraph);

        Object.keys(oParameterSetParsed).forEach(function (sParameter) {
            var oNode = oParameterSetParsed[sParameter];
            visitNode(oNode, sParameter, fnAddNodeToGraph);
        });

        return oDependencyGraph;
    }

    function extractNodeDependencies (oNode) {
        var sNodeType = oNode.type;

        if (sNodeType === "expression") {
            return [oNode.value];
        }
        if (sNodeType === "function") {
            return (oNode.args || []).concat(oNode.params || []);
        }
        if (sNodeType === "pipe" || sNodeType === "path") {
            return oNode.value; // already an array
        }
        throw new Error("Unknown type encountered while building dependency graph: '" + sNodeType + "'");
    }

    function visitNode (oNode, sParent, fnAddNodeToGraph) {
        fnAddNodeToGraph(sParent, oNode);

        if (isTerminalNode(oNode)) {
            return;
        }

        var aNodeContent = extractNodeDependencies(oNode);
        aNodeContent.forEach(function (oNode) {
            visitNode(oNode, sParent, fnAddNodeToGraph);
        });
    }

    function getDependencyResolutionOrder (oDependencyGraphReadOnly) {
        var oDependencyGraph = deepExtend({}, oDependencyGraphReadOnly);
        var iNumNodesBefore,
            iNumNodesAfter,
            aResolutionOrder = [],
            oResolutionOrderIndex = {};

        do {
            var aDependencyGraphNodes = Object.keys(oDependencyGraph);
            iNumNodesBefore = aDependencyGraphNodes.length;
            aDependencyGraphNodes.forEach(function (sNode) {
                if (oDependencyGraph[sNode].length > 0) {
                    oDependencyGraph[sNode] = oDependencyGraph[sNode].filter(function (sDependant) {
                        var bWasNotDetermined = !oResolutionOrderIndex[sDependant];
                        var bMustBeDetermined = oDependencyGraph.hasOwnProperty(sDependant);
                        return bWasNotDetermined && bMustBeDetermined;
                    });
                }

                if (oDependencyGraph[sNode].length === 0) {
                    delete oDependencyGraph[sNode];
                    aResolutionOrder.push(sNode);
                    oResolutionOrderIndex[sNode] = true;
                }
            });

            iNumNodesAfter = Object.keys(oDependencyGraph).length;
        } while (iNumNodesBefore !== iNumNodesAfter);

        if (iNumNodesAfter !== 0) {
            throw new Error("Graph of dependencies contains cyclic references");
        }

        return aResolutionOrder;
    }

    return {
        buildDependencyGraph: buildDependencyGraph,
        getDependencyResolutionOrder: getDependencyResolutionOrder
    };
});
