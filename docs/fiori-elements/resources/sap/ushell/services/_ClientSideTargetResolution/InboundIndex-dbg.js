// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview
 *
 * Exposes a method to create an index over an array of inbounds. The index can
 * be used to efficiently retrieve "chunks" (i.e., segments) of the whole
 * response.
 *
 * Usage:
 *
 * <pre>
 *    sap.ui.require([InboundIndex], function (InboundIndex) {
 *        var oIndex = InboundIndex.createIndex([ ...aInbounds ], {
 *           "someTag": function (oInbound) { return oInbound.semanticObject.length > 0 ; },
 *           "otherTag": function (oInbound) { return oInbound.action.indexOf("A") > 0; }
 *        });
 *
 *        var aInbounds = oIndex.getSegment("SomeSemanticObject");
 *
 *        var aInbounds = oIndex.getSegmentByTag("someTag");
 *    });
 * </pre>
 *
 * <p>This is a dependency of ClientSideTargetResolution.  Interfaces exposed
 * by this module may change at any time without notice.</p>
 *
 * @private
 *
 * @version 1.113.0
 */
sap.ui.define([
"sap/base/util/ObjectPath",
"sap/base/Log"
], function (ObjectPath, Log) {
    "use strict";

    /**
     * Returns all the inbounds.
     *
     * @returns {array}
     *   An array containing all the known inbounds
     */
    function getAllInbounds () {
        return this.index.all;
    }

    /**
     * Returns the portion of the inbounds from the specified segment.
     *
     * @param {string} sSemanticObject
     *   The semantic object
     *
     * @returns {array}
     *   An array of inbounds
     */
    function getSegment (sSemanticObject) {
        if (sSemanticObject === "*" || sSemanticObject === undefined) {
            return this.index.all;
        }
        return (this.index.segment[sSemanticObject] || []).concat(this.index.always);
    }

    /**
     * Returns a union of the segments in the specified tag set.
     *
     * @param {array} aTags
     *   The tags to obtain the group from.
     *
     * @returns {array}
     *   A list representing union of the inbounds in the specified tag set.
     */
    function getSegmentByTags (aTags) {
        return aTags
            .map(function (sTag) {
                return this.index.tag[sTag] || [ ];
            }, this)
            .reduce(function (aUnion, aInboundSegment) {
                Array.prototype.push.apply(aUnion, aInboundSegment.filter(function (oInbound) {
                    return oInbound.isAlreadyInUnion ? false : (oInbound.isAlreadyInUnion = true);
                }));

                return aUnion;
            }, [ ])
            .map(function (oInbound) {
                // Or make it false for efficiency -- to save the time required to
                // add a new item to a map?
                delete oInbound.isAlreadyInUnion;

                return oInbound;
            });
    }

    var oIndexPrototype = {
        getSegment: getSegment,
        getAllInbounds: getAllInbounds,
        getSegmentByTags: getSegmentByTags
    };

    function tagInbound (oInbound, oIndex) {
        var sTagName = ObjectPath.get(
            "signature.parameters.sap-tag.defaultValue.value", oInbound);

        if (!sTagName) {
            return;
        }

        if (!oIndex.tag[sTagName]) {
            oIndex.tag[sTagName] = [ ];
        }

        oIndex.tag[sTagName].push(oInbound);
    }

    function segmentInbound (oInbound, oIndex) {

        var sSemanticObject = oInbound.semanticObject;

        if (sSemanticObject === "*") {
            // inbounds that are always added to a segment
            oIndex.always.push(oInbound);
        } else {
            // create each named segment
            if (!oIndex.segment[sSemanticObject]) {
                oIndex.segment[sSemanticObject] = [ ];
            }
            oIndex.segment[sSemanticObject].push(oInbound);
        }
    }

    /**
     * Creates an index of the given inbounds.
     *
     * @param {array} aInbounds
     *   An array of inbounds to be indexed.
     *
     * @param {object} oApplyTagsFn
     *   An optional set of functions to decide what inbounds will be marked
     *   with a certain tag. For example:
     *
     * <pre>
     * {
     *     "tag1" : function (oInbound) {
     *         return oInbound.semanticObject.indexOf("2") >= 0
     *             || oInbound.action === "a3";
     *     },
     *     "tag2" : function (oInbound) {
     *         return oInbound.semanticObject.indexOf("o") >= 0;
     *     }
     * }
     * </pre>
     *
     *
     *
     * @returns {object}
     *   An instance of an inbound index. This is an object like:
     *
     * <pre>
     *   {
     *      index: {
     *          segment: {
     *            "SemantiObject1" : [ ...oInbounds1 ],
     *            "SemantiObject2" : [ ...oInbounds2 ],
     *            ...
     *          },
     *          tag: {  // may not be there
     *            "tag1": [ ...oInboundsX ],
     *            "tag2": [ ...oInboundsY ]
     *            ...
     *          }
     *      },
     *
     *      // methods to access the index
     *      getGroup: function () { ... },
     *      getTaggedGroup: function (["tag1", "tag2"... ])
     *   }
     * </pre>
     *
     */
    function createIndex (aInbounds) {
        var oIndex = {
            // The set of all the inbounds
            all: aInbounds,
            // The set of inbounds with a specific semantic object
            segment: { },
            // The set of the inbounds that is always added to any requested segment.
            // for example, inbounds with a "*" semantic object.
            always: [ ],
            // The tagged sets of inbounds
            tag: {}
        };

        aInbounds.forEach(function (oInbound, iIndex) {

            if (!oInbound) {
                Log.warning(
                    "Void inbound provided to indexer",
                    "the inbound will be skipped"
                );
                return;
            }

            tagInbound(oInbound, oIndex);
            segmentInbound(oInbound, oIndex);
        });

        oIndexPrototype.index = oIndex;
        return oIndexPrototype;
    }

    return {
        createIndex: createIndex,
        private: {
            tagInbound: tagInbound,
            createIndex: createIndex,
            segmentInbound: segmentInbound
        }
    };
});
