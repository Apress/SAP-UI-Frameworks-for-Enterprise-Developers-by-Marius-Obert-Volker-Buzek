// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview API for analytical extensions in OData service metadata.
 *
 * <a href="../sap-odata-analytics.jpg">Overview class diagram.</a><p/>
 * At the current stage, the API is purely experimental, not yet functionally complete and not meant for productive usage.
 * At present, its only purpose is to demonstrate how easy analytical extensions of OData4SAP can be consumed.<p/>
 * <em>USE OBJECTS VIA METHODS ONLY - DO NOT ACCESS JAVASCRIPT OBJECT PROPERTIES DIRECTLY !</em>
 * Lazy initialization of attributes will cause unexpected values when you access object attributes directly.<p/>
 * PI BIT Consumption and Collaboration
 * <p/>Main contact: Gerald Krause
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ui/model/odata/ODataModel",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/ui/core/Core"
], function (
    ODataModel,
    FilterOperator,
    Filter,
    Sorter
    /* Core */
) {
    "use strict";

    /* eslint-disable block-scoped-var */ // TODO: remove eslint-disable
    /* eslint-disable no-cond-assign */ // TODO: remove eslint-disable

    /*
     * try { if (typeof sap.ui.model.odata.ODataModel === "undefined")
     * throw "SAP UI5 library not present. Load it beforehand to avoid this error"; }
     * catch (error) { throw "SAP UI5 library not present. Load it beforehand to avoid this error"; }
     */
    sap = sap || {};
    sap.ushell = sap.ushell || {};
    sap.ushell.components = sap.ushell.components || {};
    sap.ushell.components.tiles.indicatorTileUtils = sap.ushell.components.tiles.indicatorTileUtils || {};
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics = sap.ushell.components.tiles.indicatorTileUtils.odata4analytics || {};
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.constants = {};
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.constants.SAP_NAMESPACE = "http://www.sap.com/Protocols/SAPData";
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.constants.VERSION = "0.7";
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.helper = {
        renderPropertyKeyValue: function (sFilterValue, sPropertyEDMTypeName) {
            if (sFilterValue.charAt(0) == "'") {
                throw "Illegal property value starting with a quote";
            }
            switch (sPropertyEDMTypeName) {
                case "Edm.String":
                    return "'" + sFilterValue + "'";
                case "Edm.DateTime":
                    return "datetime'" + sFilterValue + "'";
                case "Edm.Guid":
                    return "guid'" + sFilterValue + "'";
                case "Edm.Time":
                    return "time'" + sFilterValue + "'";
                case "Edm.DateTimeOffset":
                    return "datetimeoffset'" + sFilterValue + "'";
                default:
                    return sFilterValue;
            }
        },

        renderPropertyFilterValue: function (sFilterValue, sPropertyEDMTypeName) {
            if (sFilterValue.charAt(0) == "'") {
                throw "Illegal property value starting with a quote";
            }
            switch (sPropertyEDMTypeName) {
                case "Edm.String":
                    return "'" + sFilterValue + "'";
                case "Edm.DateTime":
                    return "datetime'" + sFilterValue + "'";
                case "Edm.Guid":
                    return "guid'" + sFilterValue + "'";
                case "Edm.Time":
                    return "time'" + sFilterValue + "'";
                case "Edm.DateTimeOffset":
                    return "datetimeoffset'" + sFilterValue + "'";
                default:
                    return sFilterValue;
            }
        },

        tokenizeNametoLabelText: function (sName) {
            var sLabel = "";

            // split UpperCamelCase in words (treat numbers and _ as upper case)
            sLabel = sName.replace(/([^A-Z0-9_]+)([A-Z0-9_])/g, "$1 $2");
            // split acronyms in words
            sLabel = sLabel.replace(/([A-Z0-9_]{2,})([A-Z0-9_])([^A-Z0-9_]+)/g, "$1 $2$3");
            // remove trailing _E
            sLabel = sLabel.replace(/(.*) _E$/, "$1");
            // remove underscores that were identified as upper case
            sLabel = sLabel.replace(/(.*) _(.*)/g, "$1 $2");
            return sLabel;
        }
    };

    /**
     * Create a representation of the analytical semantics of OData service metadata
     *
     * @param {object} oModelReference An instance of ReferenceByURI, ReferenceByModel
     *   or ReferenceWithWorkaround for locating the OData service.
     * @param {string} sAnnotationJSONDoc A JSON document providing extra annotations to the elements of the structure of the given service
     * @constructor
     * @class Representation of an OData model with analytical annotations defined by OData4SAP.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Model = function (oModelReference, sAnnotationJSONDoc) {
        this._init(oModelReference, sAnnotationJSONDoc);
    };

    /**
     * Create a reference to an OData model by the URI of the related OData service.
     *
     * @param {string} sURI holding the URI.
     * @constructor
     * @class Handle to an OData model by the URI pointing to it.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Model.ReferenceByURI = function (sURI) {
        return { sServiceURI: sURI };
    };

    /**
     * Create a reference to an OData model already loaded elsewhere with the help of SAP UI5.
     *
     * @param {object} oModel holding the OData model.
     * @constructor
     * @class Handle to an already instantiated SAP UI5 OData model.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Model.ReferenceByModel = function (oModel) {
        return { oModel: oModel };
    };

    /**
     * Create a reference to an OData model having certain workarounds activated.
     * A workaround is an implementation that changes the standard behavior of the API to overcome some gap or restriction in the OData provider.
     * The workaround implementation can be conditionally activated by passing the identifier in the contructor.
     *
     * Known workaround identifiers are:
     *
     * <li>"CreateLabelsFromTechnicalNames" - If a property has no label text, it gets generated from the property name.</li>
     *
     * <li>"IdentifyTextPropertiesByName" -If a dimension property has no text and another property with the same name and an
     * appended "Name", "Text" etc. exists, they are linked via annotation.</li>
     *
     * @param {object} oModelReference holding a reference to the OData model, obtained by
     *   sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Model.ReferenceByModel or by sap.odata4analytics.Model.ReferenceByURI.
     * @param {string[]} aWorkaroundID listing all workarounds to be applied.
     * @constructor
     * @class Handle to an already instantiated SAP UI5 OData model.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Model.ReferenceWithWorkaround = function (oModel, aWorkaroundID) {
        return {
            oModelReference: oModel,
            aWorkaroundID: aWorkaroundID
        };
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Model.prototype = {
        /**
         * initialize a new object
         *
         * @private
         */
        _init: function (oModelReference, sAnnotationJSONDoc) {
            // get access to OData model

            this._oActivatedWorkarounds = {};

            if (oModelReference && oModelReference.aWorkaroundID) {
                var aWorkaroundID = oModelReference.aWorkaroundID;

                for (var i = 0; i < aWorkaroundID.length; i++) {
                    this._oActivatedWorkarounds[aWorkaroundID[i]] = true;
                }

                oModelReference = oModelReference.oModelReference;
            }

            // check proper usage
            if (!oModelReference || (!oModelReference.sServiceURI && !oModelReference.oModel)) {
                throw "Usage with oModelReference being an instance of Model.ReferenceByURI or Model.ReferenceByModel";
            }

            if (oModelReference.oModel) {
                this._oModel = oModelReference.oModel;
            } else {
                this._oModel = new ODataModel(oModelReference.sServiceURI);
            }

            if (this._oModel.getServiceMetadata().dataServices == undefined) {
                throw "Model could not be loaded";
            }

            // add extra annotations if provided
            this.mergeV2Annotations(sAnnotationJSONDoc);

            // parse OData model for analytic queries

            this._oQueryResultSet = {};
            this._oParameterizationSet = {};
            this._oEntityTypeSet = {};
            this._oEntitySetSet = {};
            this._oEntityTypeNameToEntitySetMap = {};

            // loop over all schemas and entity containers
            // TODO: extend this implementation to support many schemas
            var oSchema = this._oModel.getServiceMetadata().dataServices.schema[0];

            // remember default container
            var oContainer;
            for (i = -1, oContainer; oContainer = oSchema.entityContainer[++i];) {
                if (oContainer.isDefaultEntityContainer == "true") {
                    this._oDefaultEntityContainer = oContainer;
                    break;
                }
            }

            var aEntityType = oSchema.entityType;

            // A. preparation

            // A.1 collect all relevant OData entity types representing query results, parameters
            var aQueryResultEntityTypes = [], aParameterEntityTypes = [], aUnsortedEntityTypes = [];
            var j;
            for (i = -1, oType; oType = aEntityType[++i];) {
                var bProcessed = false;

                if (oType.extensions != undefined) {
                    var oExtension;
                    for (j = -1; oExtension = oType.extensions[++j];) {
                        if (oExtension.namespace == sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.constants.SAP_NAMESPACE
                            && oExtension.name == "semantics") {
                            bProcessed = true;
                            switch (oExtension.value) {
                                case "aggregate":
                                    aQueryResultEntityTypes.push(oType);
                                    break;
                                case "parameters":
                                    aParameterEntityTypes.push(oType);
                                    break;
                                default:
                                    aUnsortedEntityTypes.push(oType);
                            }
                        }
                        if (bProcessed) {
                            continue;
                        }
                    }
                    if (!bProcessed) {
                        aUnsortedEntityTypes.push(oType);
                    }
                } else {
                    aUnsortedEntityTypes.push(oType);
                }
            }
            // A.2 create entity type representations for the unsorted types
            for (i = -1, oType; oType = aUnsortedEntityTypes[++i];) {
                var oEntityType = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntityType(this._oModel
                    .getServiceMetadata(), oSchema, oType);
                this._oEntityTypeSet[oEntityType.getQName()] = oEntityType;
                var aEntitySet = this._getEntitySetsOfType(oSchema, oEntityType.getQName());
                if (aEntitySet.length == 0) {
                    throw "Invalid consumption model: No entity set for entity type annotated with parameters semantics";
                }
                if (aEntitySet.length > 1) {
                    throw "Unsupported consumption model: More than one entity set for entity type annotated with parameters semantics";
                }
                var oEntitySet = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntitySet(this._oModel
                    .getServiceMetadata(), oSchema, aEntitySet[0][0], aEntitySet[0][1]);
                this._oEntitySetSet[oEntitySet.getQName()] = oEntitySet;
                this._oEntityTypeNameToEntitySetMap[oEntityType.getQName()] = oEntitySet;
            }

            // B. create objects for the analytical extensions of these entity types
            // B.1 create parameters

            // temporary storage for lookup of entity *types* annotated with parameters semantics
            var oParameterizationEntityTypeSet = {};

            for (i = -1, oType; oType = aParameterEntityTypes[++i];) {
                // B.1.1 create object for OData entity type
                oEntityType = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntityType(this._oModel
                    .getServiceMetadata(), oSchema, oType);
                this._oEntityTypeSet[oEntityType.getQName()] = oEntityType;
                // B.1.2 get sets with this type
                aEntitySet = this._getEntitySetsOfType(oSchema, oEntityType.getQName());
                if (aEntitySet.length == 0) {
                    throw "Invalid consumption model: No entity set for entity type annotated with parameters semantics";
                }
                if (aEntitySet.length > 1) {
                    throw "Unsupported consumption model: More than one entity set for entity type annotated with parameters semantics";
                }

                // B.1.3 create object for OData entity set
                oEntitySet = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntitySet(this._oModel
                    .getServiceMetadata(), oSchema, aEntitySet[0][0], aEntitySet[0][1]);
                this._oEntitySetSet[oEntitySet.getQName()] = oEntitySet;
                this._oEntityTypeNameToEntitySetMap[oEntityType.getQName()] = oEntitySet;

                // B.1.4 create object for parameters and related OData entity
                var oParameterization = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameterization(oEntityType,
                    oEntitySet);
                this._oParameterizationSet[oParameterization.getName()] = oParameterization;
                oParameterizationEntityTypeSet[oEntityType.getQName()] = oParameterization;

                // B.1.5 recognize all available parameter value helps
                var sParameterizationEntityTypeQTypeName = oEntityType.getQName();

                if (oSchema.association != undefined) {
                    var oAssoc;
                    for (j = -1; oAssoc = oSchema.association[++j];) {
                        // value help always established by a referential constraint on an association
                        if (oAssoc.referentialConstraint == undefined) {
                            continue;
                        }

                        var sParameterValueHelpEntityTypeQTypeName = null;

                        // B.1.5.1 relevant only if one end has same type as the given parameterization entity type
                        if (oAssoc.end[0].type == sParameterizationEntityTypeQTypeName
                            && oAssoc.end[0].multiplicity == "*"
                            && oAssoc.end[1].multiplicity == "1") {
                            sParameterValueHelpEntityTypeQTypeName = oAssoc.end[1].type;

                        } else if (oAssoc.end[1].type == sParameterizationEntityTypeQTypeName
                            && oAssoc.end[1].multiplicity == "*"
                            && oAssoc.end[0].multiplicity == "1") {
                            sParameterValueHelpEntityTypeQTypeName = oAssoc.end[0].type;
                        }
                        if (!sParameterValueHelpEntityTypeQTypeName) {
                            continue;
                        }

                        // B.1.5.2 check if the referential constraint declares a parameter property as dependent
                        if (oAssoc.referentialConstraint.dependent.propertyRef.length != 1) {
                            continue;
                        }
                        var oParameter = oParameterization.findParameterByName(oAssoc.referentialConstraint.dependent.propertyRef[0].name);
                        if (oParameter == null) {
                            continue;
                        }

                        // B.1.5.3 Register the recognized parameter value help entity type and set and link it to the parameter
                        var oValueListEntityType = this._oEntityTypeSet[sParameterValueHelpEntityTypeQTypeName];
                        var oValueListEntitySet = this._oEntityTypeNameToEntitySetMap[sParameterValueHelpEntityTypeQTypeName];
                        oParameter.setValueSetEntity(oValueListEntityType, oValueListEntitySet);
                    }
                }
            }

            // B.2
            // B.2 create analytic queries
            var oType;
            for (i = -1, oType; oType = aQueryResultEntityTypes[++i];) {
                // B.2.1 create object for OData entity
                oEntityType = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntityType(this._oModel
                    .getServiceMetadata(), oSchema, oType);
                this._oEntityTypeSet[oEntityType.getQName()] = oEntityType;
                var sQueryResultEntityTypeQTypeName = oEntityType.getQName();

                // B.2.2 find assocs to parameter entity types
                oParameterization = null;
                var oAssocFromParamsToResult = null;

                if (oSchema.association != undefined) {
                    for (j = -1, oAssoc; oAssoc = oSchema.association[++j];) {
                        var sParameterEntityTypeQTypeName = null;
                        if (oAssoc.end[0].type == sQueryResultEntityTypeQTypeName) {
                            sParameterEntityTypeQTypeName = oAssoc.end[1].type;
                        } else if (oAssoc.end[1].type == sQueryResultEntityTypeQTypeName) {
                            sParameterEntityTypeQTypeName = oAssoc.end[0].type;
                        } else {
                            continue;
                        }

                        // B.2.2.2 fetch Parameterization object if any
                        var oMatchingParameterization = null;

                        oMatchingParameterization = oParameterizationEntityTypeSet[sParameterEntityTypeQTypeName];
                        if (oMatchingParameterization != null) {
                            if (oParameterization != null) {
                                // TODO: extend this implementation to support more than one related parameter entity type
                                throw "RESTRICTION: Unable to handle multiple parameter entity types of query entity "
                                + oEntityType.name;
                            } else {
                                oParameterization = oMatchingParameterization;
                                oAssocFromParamsToResult = oAssoc;
                            }
                        }
                    }
                }

                // B.2.3 get sets with this type
                aEntitySet = this._getEntitySetsOfType(oSchema, oEntityType.getQName());
                if (aEntitySet.length != 1) {
                    throw "Invalid consumption model: There must be exactly one entity set for an entity type annotated with aggregating semantics";
                }

                // B.2.4 create object for OData entity set of analytic query result
                oEntitySet = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntitySet(this._oModel
                    .getServiceMetadata(), oSchema, aEntitySet[0][0], aEntitySet[0][1]);
                this._oEntitySetSet[oEntitySet.getQName()] = oEntitySet;
                this._oEntityTypeNameToEntitySetMap[oEntityType.getQName()] = oEntitySet;

                // B.2.5 create object for analytic query result, related OData entity type and set and (if any) related parameters object
                var oQueryResult = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResult(this, oEntityType,
                    oEntitySet, oParameterization);
                this._oQueryResultSet[oQueryResult.getName()] = oQueryResult;

                // B.2.6 set target result for found parameterization
                if (oParameterization) {
                    oParameterization.setTargetQueryResult(oQueryResult, oAssocFromParamsToResult);
                }
            }
        },

        /**
         * Control data for adding extra annotations to service metadata
         *
         * @private
         */
        oUI5ODataModelAnnotatableObject: {
            objectName: "schema",
            keyPropName: "namespace",
            extensions: true,
            aSubObject: [{
                objectName: "entityType",
                keyPropName: "name",
                extensions: true,
                aSubObject: [{
                    objectName: "property",
                    keyPropName: "name",
                    aSubObject: [],
                    extensions: true
                }]
            }, {
                objectName: "entityContainer",
                keyPropName: "name",
                extensions: false,
                aSubObject: [{
                    objectName: "entitySet",
                    keyPropName: "name",
                    extensions: true,
                    aSubObject: []
                }]
            }]
        },

        /**
         * merging extra annotations with provided service metadata
         *
         * @param {string} sAnnotationJSONDoc annotations
         * @private
         */
        mergeV2Annotations: function (sAnnotationJSONDoc) {
            try {
                var oAnnotation = JSON.parse(sAnnotationJSONDoc);
            } catch (exception) {
                return;
            }

            var oMetadata;
            try {
                oMetadata = this._oModel.getServiceMetadata().dataServices;
            } catch (exception) {
                return;
            }

            // find "schema" entry in annotation document
            for (var propName in oAnnotation) {
                if (!(this.oUI5ODataModelAnnotatableObject.objectName === propName)) {
                    continue;
                }
                if (!(oAnnotation[propName] instanceof Array)) {
                    continue;
                }
                this.mergeV2AnnotationLevel(oMetadata[this.oUI5ODataModelAnnotatableObject.objectName],
                    oAnnotation[this.oUI5ODataModelAnnotatableObject.objectName],
                    this.oUI5ODataModelAnnotatableObject);
                break;
            }

            return;
        },

        /**
         * merging extra annotations with agiven service metadata object
         *
         * @private
         */
        mergeV2AnnotationLevel: function (aMetadata, aAnnotation, oUI5ODataModelAnnotatableObject) {
            for (var i = -1, oAnnotation; oAnnotation = aAnnotation[++i];) {
                for (var j = -1, oMetadata; oMetadata = aMetadata[++j];) {
                    if (!(oAnnotation[oUI5ODataModelAnnotatableObject.keyPropName] == oMetadata[oUI5ODataModelAnnotatableObject.keyPropName])) {
                        continue;
                    }
                    // found match: apply extensions from oAnnotation object to oMetadata object
                    if (oAnnotation.extensions != undefined) {
                        if (oMetadata.extensions == undefined) {
                            oMetadata.extensions = [];
                        }

                        for (var l = -1, oAnnotationExtension; oAnnotationExtension = oAnnotation.extensions[++l];) {
                            var bFound = false;
                            for (var m = -1, oMetadataExtension; oMetadataExtension = oMetadata.extensions[++m];) {
                                if (oAnnotationExtension.name == oMetadataExtension.name
                                    && oAnnotationExtension.namespace == oMetadataExtension.namespace) {
                                    oMetadataExtension.value = oAnnotationExtension.value;
                                    bFound = true;
                                    break;
                                }
                            }
                            if (!bFound) {
                                oMetadata.extensions.push(oAnnotationExtension);
                            }
                        }
                    }
                    // walk down to sub objects
                    for (var k = -1, oUI5ODataModelAnnotatableSubObject; oUI5ODataModelAnnotatableSubObject = oUI5ODataModelAnnotatableObject.aSubObject[++k];) {

                        for (var propName in oAnnotation) {
                            if (!(oUI5ODataModelAnnotatableSubObject.objectName == propName)) {
                                continue;
                            }
                            if (!(oAnnotation[oUI5ODataModelAnnotatableSubObject.objectName] instanceof Array)) {
                                continue;
                            }
                            if ((oMetadata[oUI5ODataModelAnnotatableSubObject.objectName] == undefined)
                                || (!(oMetadata[oUI5ODataModelAnnotatableSubObject.objectName] instanceof Array))) {
                                continue;
                            }
                            this.mergeV2AnnotationLevel(
                                oMetadata[oUI5ODataModelAnnotatableSubObject.objectName],
                                oAnnotation[oUI5ODataModelAnnotatableSubObject.objectName],
                                oUI5ODataModelAnnotatableSubObject);
                            break;
                        }
                    }
                }
            }
            return;
        },

        /**
         * Find analytic query result by name
         *
         * @param {string} sName Fully qualified name of query result entity set
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResult}
         *   The query result object with this name or null if it does not exist
         */
        findQueryResultByName: function (sName) {
            var oQueryResult = this._oQueryResultSet[sName];

            // Everybody should have a second chance:
            // If the name was not fully qualified, check if it is in the default container
            if (!oQueryResult && this._oDefaultEntityContainer) {
                var sQName = this._oDefaultEntityContainer.name + "." + sName;

                oQueryResult = this._oQueryResultSet[sQName];
            }
            return oQueryResult;
        },

        /**
         * Get the names of all query results (entity sets) offered by the model
         *
         * @returns {array(string)} List of all query result names
         */
        getAllQueryResultNames: function () {
            if (this._aQueryResultNames) {
                return this._aQueryResultNames;
            }

            this._aQueryResultNames = new Array(0);

            for (var sName in this._oQueryResultSet) { this._aQueryResultNames.push(this._oQueryResultSet[sName].getName()); }

            return this._aQueryResultNames;
        },

        /**
         * Get all query results offered by the model
         *
         * @returns {object} An object with individual JS properties for each query result included in the model.
         *   The JS object properties all are objects of type sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResult.
         *   The names of the JS object properties are given by the entity set names representing the query results.
         */
        getAllQueryResults: function () {
            return this._oQueryResultSet;
        },

        /**
         * Get underlying OData model provided by SAP UI5
         *
         * @returns {object} The SAP UI5 representation of the model.
         */
        getODataModel: function () {
            return this._oModel;
        },

        /**
         * Private methods
         */

        /**
         * Find entity sets of a given type
         *
         * @private
         */
        _getEntitySetsOfType: function (oSchema, sQTypeName) {
            var aEntitySet = [];

            for (var i = -1, oEntityContainer; oEntityContainer = oSchema.entityContainer[++i];) {
                for (var j = -1, oEntitySet; oEntitySet = oEntityContainer.entitySet[++j];) {
                    if (oEntitySet.entityType == sQTypeName) {
                        aEntitySet.push([oEntityContainer, oEntitySet]);
                    }
                }
            }

            return aEntitySet;
        },

        /**
         * Private member attributes
         */
        _oModel: null,
        _oDefaultEntityContainer: null,

        _aQueryResultNames: null,
        _oQueryResultSet: null,
        _oParameterizationSet: null,
        _oEntityTypeSet: null,
        _oEntitySetSet: null,
        _oEntityTypeNameToEntitySetMap: null,

        _oActivatedWorkarounds: null
    };

    /** ******************************************************************** */

    /**
     * Create a representation of an analytic query
     *
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Model} oModel
     *   The analytical model containing this query result entity set
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntityType} oEntityType
     *   The OData entity type for this query
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntitySet} oEntitySet
     *   The OData entity set for this query offered by the OData service
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameterization} oParameterization
     *   The parameterization of this query, if any
     * @constructor
     * @this (QueryResult)
     * @class Representation of an entity type annotated with sap:semantics="aggregate".
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResult = function (oModel, oEntityType, oEntitySet, oParameterization) {
        this._init(oModel, oEntityType, oEntitySet, oParameterization);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResult.prototype = {
        /**
         * initialize new object
         *
         * @private
         */
        _init: function (oModel, oEntityType, oEntitySet, oParameterization, oAssocFromParamsToResult) {
            this._oModel = oModel;
            this._oEntityType = oEntityType;
            this._oEntitySet = oEntitySet;
            this._oParameterization = oParameterization;

            this._oDimensionSet = {};
            this._oMeasureSet = {};

            // parse entity type for analytic semantics described by annotations
            var aProperty = oEntityType.getTypeDescription().property;
            var oAttributeForPropertySet = {};
            for (var i = -1, oProperty; oProperty = aProperty[++i];) {
                if (oProperty.extensions == undefined) {
                    continue;
                }
                for (var j = -1, oExtension; oExtension = oProperty.extensions[++j];) {
                    if (!oExtension.namespace == sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.constants.SAP_NAMESPACE) {
                        continue;
                    }

                    switch (oExtension.name) {
                        case "aggregation-role":
                            switch (oExtension.value) {
                                case "dimension":
                                    var oDimension = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Dimension(this, oProperty);
                                    this._oDimensionSet[oDimension.getName()] = oDimension;
                                    break;
                                case "measure":
                                    var oMeasure = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Measure(this, oProperty);
                                    this._oMeasureSet[oMeasure.getName()] = oMeasure;
                                    break;
                                case "totaled-properties-list":
                                    this._oTotaledPropertyListProperty = oProperty;
                                    break;
                            }
                            break;
                        case "attribute-for":
                            var oDimensionAttribute = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.DimensionAttribute(this,
                                oProperty);
                            oAttributeForPropertySet[oDimensionAttribute.getKeyProperty()] = oDimensionAttribute;
                            break;
                    }
                }
            }

            // assign dimension attributes to the respective dimension objects
            for (var sDimensionAttributeName in oAttributeForPropertySet) {
                oDimensionAttribute = oAttributeForPropertySet[sDimensionAttributeName];
                oDimensionAttribute.getDimension().addAttribute(oDimensionAttribute);
            }

            // apply workaround for missing text properties if requested
            if (oModel._oActivatedWorkarounds.IdentifyTextPropertiesByName) {
                var aMatchedTextPropertyName = [];
                for (var oDimName in this._oDimensionSet) {
                    oDimension = this._oDimensionSet[oDimName];
                    if (!oDimension.getTextProperty()) {
                        var oTextProperty = null; // order of matching is
                        // significant!
                        oTextProperty = oEntityType.findPropertyByName(oDimName + "Name");
                        if (!oTextProperty) {
                            oTextProperty = oEntityType.findPropertyByName(oDimName + "Text");
                        }
                        if (!oTextProperty) {
                            oTextProperty = oEntityType.findPropertyByName(oDimName + "Desc");
                        }
                        if (!oTextProperty) {
                            oTextProperty = oEntityType.findPropertyByName(oDimName + "Description");
                        }
                        if (oTextProperty) { // any match?
                            oDimension.setTextProperty(oTextProperty); // link
                            // dimension
                            // with text
                            // property
                            aMatchedTextPropertyName.push(oTextProperty.name);
                        }
                    }
                }
                // make sure that any matched text property is not exposed as dimension (according to spec)
                var sPropertyName;
                for (i = -1, sPropertyName; sPropertyName = aMatchedTextPropertyName[++i];) {
                    delete this._oDimensionSet[sPropertyName];
                }
            }
        },

        /**
         * Get the name of the query result
         *
         * @returns {string} The fully qualified name of the parameter
         */
        getName: function () {
            return this.getEntitySet().getQName();
        },

        /**
         * Get the parameterization of this query result
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameterization}
         *   The object for the parameterization or null if the query result is not parameterized
         */
        getParameterization: function () {
            return this._oParameterization;
        },

        /**
         * Get the names of all dimensions included in the query result
         *
         * @returns {string[]} List of all dimension names
         */
        getAllDimensionNames: function () {
            if (this._aDimensionNames) {
                return this._aDimensionNames;
            }

            this._aDimensionNames = [];

            for (var sName in this._oDimensionSet) { this._aDimensionNames.push(this._oDimensionSet[sName].getName()); }

            return this._aDimensionNames;
        },

        /**
         * Get all dimensions included in this query result
         *
         * @returns {object} An object with individual JS properties for each dimension included in the query result.
         *   The JS object properties all are objects of type sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Dimension.
         *   The names of the JS object properties are given by the OData entity type property names representing the dimension keys.
         */
        getAllDimensions: function () {
            return this._oDimensionSet;
        },

        /**
         * Get the names of all measures included in the query result
         *
         * @returns {array(string)} List of all measure names
         */
        getAllMeasureNames: function () {
            if (this._aMeasureNames) {
                return this._aMeasureNames;
            }

            this._aMeasureNames = [];

            for (var sName in this._oMeasureSet) { this._aMeasureNames.push(this._oMeasureSet[sName].getName()); }

            return this._aMeasureNames;
        },

        /**
         * Get all measures included in this query result
         *
         * @returns {object} An object with individual JS properties for each measure included in the query result.
         *   The JS object properties all are objects of type sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Measure.
         *   The names of the JS object properties are given by the OData entity type property names representing the measure raw values.
         */
        getAllMeasures: function () {
            return this._oMeasureSet;
        },

        /**
         * Find dimension by name
         *
         * @param {string} sName Dimension name
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Dimension}
         *   The dimension object with this name or null if it does not exist
         */
        findDimensionByName: function (sName) {
            return this._oDimensionSet[sName];
        },

        /**
         * Get property holding the totaled property list
         *
         * @returns {object} The DataJS object representing this property
         */
        getTotaledPropertiesListProperty: function () {
            return this._oTotaledPropertyListProperty;
        },

        /**
         * Find measure by name
         *
         * @param {string} sName Measure name
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Dimension}
         *   The measure object with this name or null if it does not exist
         */
        findMeasureByName: function (sName) {
            return this._oMeasureSet[sName];
        },

        /**
         * Get the analytical model containing the entity set for this query result
         *
         * @returns {object} The analytical representation of the OData model
         */
        getModel: function () {
            return this._oModel;
        },

        getEntityType: function () {
            return this._oEntityType;
        },

        getEntitySet: function () {
            return this._oEntitySet;
        },

        /**
         * Private member attributes
         */
        _oModel: null,
        _oEntityType: null,
        _oEntitySet: null,
        _oParameterization: null,
        _aDimensionNames: null,
        _oDimensionSet: null,
        _aMeasureNames: null,
        _oMeasureSet: null,
        _oTotaledPropertyListProperty: null
    };

    /** ******************************************************************** */

    /**
     * Create a representation of a parameterization for an analytic query
     *
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntityType} oEntityType
     *   The OData entity type for this parameterization
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntitySet} oEntitySet
     *   The OData entity set for this parameterization offered by the OData service
     * @class Representation of an entity type annotated with sap:semantics="parameters".
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameterization = function (oEntityType, oEntitySet) {
        this._init(oEntityType, oEntitySet);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameterization.prototype = {
        /**
         * @private
         */
        _init: function (oEntityType, oEntitySet) {
            this._oEntityType = oEntityType;
            this._oEntitySet = oEntitySet;
            this._oParameterSet = {};

            // parse entity type for analytic semantics described by annotations
            var aProperty = oEntityType.getTypeDescription().property;
            for (var i = -1, oProperty; oProperty = aProperty[++i];) {
                if (oProperty.extensions == undefined) {
                    continue;
                }

                for (var j = -1, oExtension; oExtension = oProperty.extensions[++j];) {
                    if (!oExtension.namespace == sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.constants.SAP_NAMESPACE) {
                        continue;
                    }

                    switch (oExtension.name) {
                        // process parameter semantics
                        case "parameter":
                            var oParameter = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameter(this, oProperty);
                            this._oParameterSet[oParameter.getName()] = oParameter;

                            break;
                    }
                }
            }
        },

        // to be called only by Model objects
        setTargetQueryResult: function (oQueryResult, oAssociation) {
            this._oQueryResult = oQueryResult;
            var sQAssocName = this._oEntityType.getSchema().namespace + "." + oAssociation.name;
            var aNavProp = this._oEntityType.getTypeDescription().navigationProperty;
            if (!aNavProp) {
                throw "Invalid consumption model: Parameters entity type lacks navigation property for association to query result entity type";
            }
            for (var i = -1, oNavProp; oNavProp = aNavProp[++i];) {
                if (oNavProp.relationship == sQAssocName) {
                    this._oNavPropToQueryResult = oNavProp.name;
                }
            }
            if (!this._oNavPropToQueryResult) {
                throw "Invalid consumption model: Parameters entity type lacks navigation property for association to query result entity type";
            }
        },

        /**
         * Get the name of the parameter
         *
         * @returns {string} The name of the parameter
         */
        getName: function () {
            return this.getEntitySet().getQName();
        },

        /**
         * Get the names of all parameters part of the parameterization
         *
         * @returns {array(string)} List of all parameter names
         */
        getAllParameterNames: function () {
            if (this._aParameterNames) {
                return this._aParameterNames;
            }

            this._aParameterNames = [];

            for (var sName in this._oParameterSet) { this._aParameterNames.push(this._oParameterSet[sName].getName()); }

            return this._aParameterNames;
        },

        /**
         * Get all parameters included in this parameterization
         *
         * @returns {object} An object with individual JS properties for each parameter included in the query result.
         *   The JS object properties all are objects of type sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameter.
         *   The names of the JS object properties are given by the OData entity type property names representing the parameter keys.
         */
        getAllParameters: function () {
            return this._oParameterSet;
        },

        /**
         * Find parameter by name
         *
         * @param {string} sName Parameter name
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameter}
         *   The parameter object with this name or null if it does not exist
         */
        findParameterByName: function (sName) {
            return this._oParameterSet[sName];
        },

        /**
         * Get navigation property to query result
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResult}
         *   The parameter object with this name or null if it does not exist
         */
        getNavigationPropertyToQueryResult: function () {
            return this._oNavPropToQueryResult;
        },

        getEntityType: function () {
            return this._oEntityType;
        },

        getEntitySet: function () {
            return this._oEntitySet;
        },

        /**
         * Private member attributes
         */
        _oEntityType: null,
        _oEntitySet: null,
        _oQueryResult: null,
        _oNavPropToQueryResult: null,
        _aParameterNames: null,
        _oParameterSet: null
    };

    /** ******************************************************************** */

    /**
     * Create a representation of a single parameter contained in a parameterization
     *
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameterization} oParameterization
     *   The parameterization containing this parameter
     * @param {object} oProperty The DataJS object object representing the text property
     * @constructor
     * @class Representation of a property annotated with sap:parameter.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameter = function (oParameterization, oProperty) {
        this._init(oParameterization, oProperty);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameter.prototype = {
        /**
         * @private
         */
        _init: function (oParameterization, oProperty) {
            this._oParameterization = oParameterization;
            this._oProperty = oProperty;

            var oEntityType = oParameterization.getEntityType();

            if (oProperty.extensions != undefined) {
                for (var i = -1, oExtension; oExtension = oProperty.extensions[++i];) {
                    if (!oExtension.namespace == sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.constants.SAP_NAMESPACE) {
                        continue;
                    }

                    switch (oExtension.name) {
                        case "parameter":
                            switch (oExtension.value) {
                                case "mandatory":
                                    this._bRequired = true;
                                    break;
                                case "optional":
                                    this._bRequired = false;
                                    break;
                                default:
                                    throw "Invalid annotation value for parameter property";
                            }
                            break;
                        case "label":
                            this._sLabelText = oExtension.value;
                            break;
                        case "text":
                            this._oTextProperty = oEntityType.findPropertyByName(oExtension.value);
                            break;
                        case "upper-boundary":
                            this._bIntervalBoundaryParameter = true;
                            this._oUpperIntervalBoundaryParameterProperty = oEntityType
                                .findPropertyByName(oExtension.value);
                            break;
                        case "lower-boundary":
                            this._bIntervalBoundaryParameter = true;
                            this._oLowerIntervalBoundaryParameterProperty = oEntityType
                                .findPropertyByName(oExtension.value);
                            break;
                    }
                }
            }
            if (!this._sLabelText) {
                this._sLabelText = "";
            }
        },

        // to be called only by Model objects
        setValueSetEntity: function (oEntityType, oEntitySet) {
            this._oValueSetEntityType = oEntityType;
            this._oValueSetEntitySet = oEntitySet;
        },

        /**
         * Get text property related to this parameter
         *
         * @returns {object} The DataJS object representing the text property or null if it does not exist
         */
        getTextProperty: function () {
            return this._oTextProperty;
        },

        /**
         * Get label
         *
         * @returns {string} The (possibly language-dependent) label text for this parameter
         */
        getLabelText: function () {
            if (!this._sLabelText && this._oQueryResult._oModel._oActivatedWorkarounds.CreateLabelsFromTechnicalNames) {
                this._sLabelText = sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.helper.tokenizeNametoLabelText(this.getName());
            }
            return this._sLabelText;
        },

        /**
         * Get indicator whether or not the parameter is optional
         *
         * @returns {boolean} True iff the parameter is optional
         */
        isOptional: function () {
            return (!this._bRequired);
        },

        /**
         * Get indicator if the parameter represents an interval boundary
         *
         * @returns {boolean} True iff it represents an interval boundary, otherwise false
         */
        isIntervalBoundary: function () {
            return this._bIntervalBoundaryParameter;
        },

        /**
         * Get indicator if the parameter represents the lower boundary of an interval
         *
         * @returns {boolean} True iff it represents the lower boundary of an interval, otherwise false
         */
        isLowerIntervalBoundary: function () {
            return (!!this._oUpperIntervalBoundaryParameterProperty);
        },

        /**
         * Get property for the parameter representing the peer boundary of the same interval
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameter}
         *   The parameter representing the peer boundary of the same interval.
         *   This means that if *this* parameter is a lower boundary, the returned object
         */
        getPeerIntervalBoundaryParameter: function () {
            var sPeerParamPropName = null;
            if (this._oLowerIntervalBoundaryParameterProperty) {
                sPeerParamPropName = this._oLowerIntervalBoundaryParameterProperty.name;
            } else {
                sPeerParamPropName = this._oUpperIntervalBoundaryParameterProperty.name;
            }

            if (!sPeerParamPropName) {
                throw "Parameter is not an interval boundary";
            }
            return this._oParameterization.findParameterByName(sPeerParamPropName);
        },

        /**
         * Get indicator if a set of values is available for this parameter.
         * Typically, this is true for parameters with a finite set of known values such as products,
         * business partners in different roles, organization units, and false for integer or date parameters
         *
         * @returns {boolean} True iff a value set is available, otherwise false
         */
        isValueSetAvailable: function () {
            return (!!this._oValueSetEntityType);
        },

        /**
         * Get the name of the parameter
         *
         * @returns {string} The name of the parameter
         */
        getName: function () {
            return this._oProperty.name;
        },

        /**
         * Get property
         *
         * @returns {object} The DataJS object representing the property of this parameter
         */
        getProperty: function () {
            return this._oProperty;
        },

        /**
         * Get parameterization containing this parameter
         *
         * @return {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameterization} The parameterization object
         */
        getContainingParameterization: function () {
            return this._oParameterization;
        },

        /**
         * Get the URI to locate the entity set holding the value set, if it is available.
         *
         * @param {String} sServiceRootURI (optional) Identifies the root of the OData service
         * @returns {String} The resource path of the URI pointing to the entity set.
         *   It is a relative URI unless a service root is given, which would then prefixed in order to return a complete URL.
         */
        getURIToValueEntitySet: function (sServiceRootURI) {
            var sURI = null;
            sURI = (sServiceRootURI || "") + "/" + this._oValueSetEntitySet.getQName();
            return sURI;
        },

        /**
         * Private member attributes
         */
        _oParameterization: null,
        _oProperty: null,
        _sLabelText: null,
        _oTextProperty: null,
        _bRequired: false,
        _bIntervalBoundaryParameter: false,
        _oLowerIntervalBoundaryParameterProperty: null,
        _oUpperIntervalBoundaryParameterProperty: null,

        _oValueSetEntityType: null,
        _oValueSetEntitySet: null
    };

    /** ******************************************************************** */

    /**
     * Create a representation of a dimension provided by an analytic query
     *
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResult} oQueryResult
     *   The query result containing this dimension
     * @param {object} oProperty The DataJS object object representing the dimension
     *
     * Representation of a property annotated with sap:aggregation-role="dimension".
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Dimension = function (oQueryResult, oProperty) {
        this._init(oQueryResult, oProperty);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Dimension.prototype = {
        _init: function (oQueryResult, oProperty) {
            this._oQueryResult = oQueryResult;
            this._oProperty = oProperty;

            this._oAttributeSet = {};

            if (oProperty.extensions != undefined) {
                for (var i = -1, oExtension; oExtension = oProperty.extensions[++i];) {
                    if (!oExtension.namespace == sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.constants.SAP_NAMESPACE) {
                        continue;
                    }

                    switch (oExtension.name) {
                        case "label":
                            this._sLabelText = oExtension.value;
                            break;
                        case "text":
                            this._oTextProperty = oQueryResult.getEntityType().findPropertyByName(
                                oExtension.value);
                            break;
                        case "super-ordinate":
                            this._sSuperOrdinatePropertyName = oExtension.value;
                            break;
                    }
                }
            }
            if (!this._sLabelText) {
                this._sLabelText = "";
            }
        },

        /**
         * Get the name of the dimension
         *
         * @returns {string} The name of this dimension
         */
        getName: function () {
            return this._oProperty.name;
        },

        /**
         * Get the key property
         *
         * @returns {object} The DataJS object representing the property for the dimension key
         */
        getKeyProperty: function () {
            return this._oProperty;
        },

        /**
         * Get text property related to this dimension
         *
         * @returns {object} The DataJS object representing the text property or null if it does not exist
         */
        getTextProperty: function () {
            return this._oTextProperty;
        },

        /**
         * Set text property Relevant for workaround w/ID IdentifyTextPropertiesByName
         *
         * @private
         * @param {Object} oTextProperty text property
         */
        setTextProperty: function (oTextProperty) {
            this._oTextProperty = oTextProperty;
        },

        /**
         * Get label
         *
         * @returns {string} The (possibly language-dependent) label text for this dimension
         */
        getLabelText: function () {
            if (!this._sLabelText && this._oQueryResult._oModel._oActivatedWorkarounds.CreateLabelsFromTechnicalNames) {
                this._sLabelText = sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.helper.tokenizeNametoLabelText(this.getName());
            }
            return this._sLabelText;
        },

        /**
         * Get super-ordinate dimension
         *
         * @returns {object} The super-ordinate dimension or null if there is none
         */
        getSuperOrdinateDimension: function () {
            if (!this._sSuperOrdinatePropertyName) {
                return null;
            }
            return this._oQueryResult.findDimensionByName(this._sSuperOrdinatePropertyName);
        },

        /**
         * Get associated hierarchy
         *
         * @returns {object} The hierarchy object or null if there is none. It can be an instance of class
         *   sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.RecursiveHierarchy (TODO later: or a leveled hierarchy).
         *   Use methods isLeveledHierarchy and isRecursiveHierarchy to determine object type.
         */
        getHierarchy: function () {
            // set associated hierarchy if any
            if (!this._oHierarchy) {
                this._oHierarchy = this._oQueryResult.getEntityType().getHierarchy(this._oProperty.name);
            }

            return this._oHierarchy;
        },

        /**
         * Get the names of all dimensions included in the query result
         *
         * @returns {String[]} List of all dimension names
         */
        getAllAttributeNames: function () {
            if (this._aAttributeNames) {
                return this._aAttributeNames;
            }

            this._aAttributeNames = [];

            for (var sName in this._oAttributeSet) { this._aAttributeNames.push(this._oAttributeSet[sName].getName()); }

            return this._aAttributeNames;
        },

        /**
         * Get all attributes of this dimensions
         *
         * @returns {object} An object with individual JS properties for each attribute of this dimension.
         *   The JS object properties all are objects of type sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.DimensionAttribute.
         *   The names of the JS object properties are given by the OData entity type property names representing the dimension attribute keys.
         */
        getAllAttributes: function () {
            return this._oAttributeSet;
        },

        /**
         * Find attribute by name
         *
         * @param {string} sName Attribute name
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Dimension}
         *   The dimension attribute object with this name or null if it does not exist
         */
        findAttributeByName: function (sName) {
            return this._oAttributeSet[sName];
        },

        // to be called only by QueryResult objects
        addAttribute: function (oDimensionAttribute) {
            this._oAttributeSet[oDimensionAttribute.getName()] = oDimensionAttribute;
        },

        /**
         * Get query result containing this parameter
         *
         * @return {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResult} The query result object
         */
        getContainingQueryResult: function () {
            return this._oQueryResult;
        },

        /**
         * Private member attributes
         */
        _oQueryResult: null,
        _oProperty: null,

        _oTextProperty: null,
        _sLabelText: null,
        _sSuperOrdinatePropertyName: null,
        _aAttributeNames: null,
        _oAttributeSet: null,

        _oHierarchy: null
    };

    /** ******************************************************************** */

    /**
     * Create a representation of a dimension attribute provided by an analytic query
     *
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResult} oQueryResult
     *   The query result containing this dimension attribute
     * @param {object} oProperty The DataJS object object representing the dimension attribute
     *
     * Representation of a dimension attribute.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.DimensionAttribute = function (oQueryResult, oProperty) {
        this._init(oQueryResult, oProperty);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.DimensionAttribute.prototype = {
        /**
         * @private
         */
        _init: function (oQueryResult, oProperty) {
            this._oQueryResult = oQueryResult;
            this._oProperty = oProperty;

            if (oProperty.extensions != undefined) {
                for (var i = -1, oExtension; oExtension = oProperty.extensions[++i];) {
                    if (!oExtension.namespace == sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.constants.SAP_NAMESPACE) {
                        continue;
                    }

                    switch (oExtension.name) {
                        case "attribute-for":
                            this._sDimensionName = oExtension.value;
                            break;
                        case "label":
                            this._sLabelText = oExtension.value;
                            break;
                        case "text":
                            this._oTextProperty = oQueryResult.getEntityType().findPropertyByName(
                                oExtension.value);
                            break;
                    }
                }
            }
        },

        /**
         * Get the name of the dimension attribute
         *
         * @returns {string} The name of the dimension attribute
         */
        getName: function () {
            return this._oProperty.name;
        },

        /**
         * Get the key property
         *
         * @returns {object} The DataJS object representing the property for the key of this dimension attribute
         */
        getKeyProperty: function () {
            return this._oProperty;
        },

        /**
         * Get text property related to this dimension attribute
         *
         * @returns {object} The DataJS object representing the text property or null if it does not exist
         */
        getTextProperty: function () {
            return this._oTextProperty;
        },

        /**
         * Get label
         *
         * @returns {string} The (possibly language-dependent) label text for this dimension attribute
         */
        getLabelText: function () {
            return this._sLabelText;
        },

        /**
         * Get dimension
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Dimension}
         *   The dimension object containing this attribute
         */
        getDimension: function () {
            return this._oQueryResult.findDimensionByName(this._sDimensionName);
        },

        /**
         * Private member attributes
         */
        _oQueryResult: null,
        _oProperty: null,
        _oTextProperty: null,
        _sLabelText: null,
        _sDimensionName: null
    };

    /** ******************************************************************** */

    /**
     * Create a representation of a measure provided by an analytic query
     *
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResult} oQueryResult
     *   The query result containing this measure
     * @param {object} oProperty The DataJS object object representing the measure
     * @constructor
     * @class Representation of a property annotated with sap:aggregation-role="measure".
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Measure = function (oQueryResult, oProperty) {
        this._init(oQueryResult, oProperty);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Measure.prototype = {
        /**
         * @private
         */
        _init: function (oQueryResult, oProperty) {
            this._oQueryResult = oQueryResult;
            this._oProperty = oProperty;

            if (oProperty.extensions != undefined) {
                for (var i = -1, oExtension; oExtension = oProperty.extensions[++i];) {
                    if (!oExtension.namespace == sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.constants.SAP_NAMESPACE) {
                        continue;
                    }

                    switch (oExtension.name) {
                        case "label":
                            this._sLabelText = oExtension.value;
                            break;
                        case "text":
                            this._oTextProperty = oQueryResult.getEntityType().findPropertyByName(
                                oExtension.value);
                            break;
                        case "unit":
                            this._oUnitProperty = oQueryResult.getEntityType().findPropertyByName(
                                oExtension.value);
                            break;
                    }
                }
            }
            if (!this._sLabelText) {
                this._sLabelText = "";
            }
        },

        /**
         * Get the name of the measure
         *
         * @returns {string} The name of the measure
         */
        getName: function () {
            return this._oProperty.name;
        },

        /**
         * Get the raw value property
         *
         * @returns {object} The DataJS object representing the property holding the raw value of this measure
         */
        getRawValueProperty: function () {
            return this._oProperty;
        },

        /**
         * Get the text property associated to the raw value property holding the formatted value related to this measure
         *
         * @returns {object} The DataJS object representing the property holding the formatted value text of this measure
         *   or null if this measure does not have a unit
         */
        getFormattedValueProperty: function () {
            return this._oTextProperty;
        },

        /**
         * Get the unit property related to this dimension
         *
         * @returns {object} The DataJS object representing the unit property or null if this measure does not have a unit
         */
        getUnitProperty: function () {
            return this._oUnitProperty;
        },

        /**
         * Get label
         *
         * @returns {string} The (possibly language-dependent) label text for this measure
         */
        getLabelText: function () {
            return this._sLabelText;
        },

        /**
         * Private member attributes
         */
        _oQueryResult: null,
        _oProperty: null,
        _oTextProperty: null,
        _sLabelText: null,
        _oUnitProperty: null
    };

    /** ******************************************************************** */

    /**
    * Create a representation of an OData entity set in the context of an analytic query
    *
    * @param {object} oModel DataJS object for the OData model containing this entity set
    * @param {object} oSchema DataJS object for the schema surrounding the container of this entity set
    * @param {object} oContainer DataJS object for the container holding this entity set
    * @param {object} oEntitySet DataJS object for the entity set
    *
    * Representation of a OData entity set.
    */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntitySet = function (oModel, oSchema, oContainer, oEntitySet) {
        this._init(oModel, oSchema, oContainer, oEntitySet);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntitySet.prototype = {
        /**
         * @private
         */
        _init: function (oModel, oSchema, oContainer, oEntitySet) {
            this._oEntitySet = oEntitySet;
            this._oContainer = oContainer;
            this._oSchema = oSchema;
            this._oModel = oModel;

            if (oSchema.entityContainer.length > 1) {
                this._sQName = oContainer.name + "." + oEntitySet.name;
            } else {
                // no need to disambiguate this for the simple case
                this._sQName = oEntitySet.name;
            }
        },

        /**
         * Get the fully qualified name for this entity type
         *
         * @returns {string} The fully qualified name
         */
        getQName: function () {
            return this._sQName;
        },

        /**
         * Get full description for this entity set
         *
         * @returns {object} The DataJS object representing the entity set
         */
        getSetDescription: function () {
            return this._oEntitySet;
        },

        getSchema: function () {
            return this._oSchema;
        },

        getModel: function () {
            return this._oModel;
        },

        /**
         * Private member attributes
         */

        _oEntitySet: null,
        _oContainer: null,
        _oSchema: null,
        _oModel: null,
        _sQName: null
    };

    /** ******************************************************************** */

    /**
     * Create a representation of an OData entity type in the context of an analytic query
     *
     * @param {object} oModel DataJS object for the OData model containing this entity type
     * @param {object} oSchema DataJS object for the schema containing this entity type
     * @param {object} oEntityType DataJS object for the entity type
     *
     * Representation of a OData entity type.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntityType = function (oModel, oSchema, oEntityType) {
        this._init(oModel, oSchema, oEntityType);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntityType.prototype = {
        /**
         * @private
         */
        _init: function (oModel, oSchema, oEntityType) {
            this._oEntityType = oEntityType;
            this._oSchema = oSchema;
            this._oModel = oModel;

            this._oPropertySet = {};
            this._aFilterablePropertyNames = [];
            this._aSortablePropertyNames = [];
            this._aRequiredFilterPropertyNames = [];

            this._sQName = oSchema.namespace + "." + oEntityType.name;

            // collect all hierarchies defined in this entity type
            var oRecursiveHierarchies = {}; // temp for collecting all properties
            // participating in hierarchies
            var oRecursiveHierarchy = null;

            for (var i = -1, oProperty; oProperty = oEntityType.property[++i];) {
                // by default, every property can be filtered
                this._aFilterablePropertyNames.push(oProperty.name);

                // by default, every property can be sorted
                this._aSortablePropertyNames.push(oProperty.name);

                if (oProperty.extensions == undefined) {
                    continue;
                }
                for (var j = -1, oExtension; oExtension = oProperty.extensions[++j];) {
                    if (!oExtension.namespace == sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.constants.SAP_NAMESPACE) {
                        continue;
                    }

                    switch (oExtension.name) {
                        case "filterable":
                            if (oExtension.value == "false") {
                                this._aFilterablePropertyNames.pop(oProperty.name);
                            }
                            break;
                        case "sortable":
                            if (oExtension.value == "false") {
                                this._aSortablePropertyNames.pop(oProperty.name);
                            }
                            break;
                        case "required-filter":
                            if (oExtension.value == "true") {
                                this._aRequiredFilterPropertyNames.push(oProperty.name);
                            }
                            break;

                        // hierarchy annotations: build temporary set of hierarchy-node-id properties with relevant attributes
                        case "hierarchy-node-for":
                            if (!(oRecursiveHierarchy = oRecursiveHierarchies[oProperty.name])) {
                                oRecursiveHierarchy = oRecursiveHierarchies[oProperty.name] = {};
                            }
                            oRecursiveHierarchy.dimensionName = oExtension.value;
                            break;
                        case "hierarchy-parent-node-for":
                        case "hierarchy-parent-nod": // TODO workaround for GW bug
                            if (!(oRecursiveHierarchy = oRecursiveHierarchies[oExtension.value])) {
                                oRecursiveHierarchy = oRecursiveHierarchies[oExtension.value] = {};
                            }
                            oRecursiveHierarchy.parentNodeIDProperty = oProperty;
                            break;
                        case "hierarchy-level-for":
                            if (!(oRecursiveHierarchy = oRecursiveHierarchies[oExtension.value])) {
                                oRecursiveHierarchy = oRecursiveHierarchies[oExtension.value] = {};
                            }
                            oRecursiveHierarchy.levelProperty = oProperty;
                            break;
                        case "hierarchy-drill-state-for":
                        case "hierarchy-drill-stat": // TODO workaround for GW bug
                            if (!(oRecursiveHierarchy = oRecursiveHierarchies[oExtension.value])) {
                                oRecursiveHierarchy = oRecursiveHierarchies[oExtension.value] = {};
                            }
                            oRecursiveHierarchy.drillStateProperty = oProperty;
                            break;
                    }
                }

                // store property references for faster lookup
                this._oPropertySet[oProperty.name] = oProperty;
            }

            // post processing: set up hierarchy objects
            this._oRecursiveHierarchySet = {};
            for (var hierNodeIDPropertyName in oRecursiveHierarchies) {
                var oHierarchy = oRecursiveHierarchies[hierNodeIDPropertyName];
                var oHierarchyNodeIDProperty = this._oPropertySet[hierNodeIDPropertyName];
                var oDimensionProperty = this._oPropertySet[oHierarchy.dimensionName];
                if (oDimensionProperty == null) {
                    // TODO temporary workaround for BW provider, which does not return it let dimension coincide with hierarchy node ID
                    oDimensionProperty = oHierarchyNodeIDProperty;
                }
                this._oRecursiveHierarchySet[oDimensionProperty.name] = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.RecursiveHierarchy(
                    oEntityType, oHierarchyNodeIDProperty, oHierarchy.parentNodeIDProperty,
                    oHierarchy.levelProperty, oDimensionProperty);
            }
        },

        /**
         * Find property by name
         *
         * @param {string} sName Property name
         * @returns {object} The DataJS object representing the property or null if it does not exist
         */
        findPropertyByName: function (sName) {
            return this._oPropertySet[sName];
        },

        /**
         * Get names of properties that can be filtered, that is they can be used in $filter expressions
         *
         * @returns {array(string)} Array with names of properties that can be filtered.
         */
        getFilterablePropertyNames: function () {
            return this._aFilterablePropertyNames;
        },

        /**
         * Get names of properties that can be sorted, that is they can be used in $orderby expressions
         *
         * @returns {array(string)} Array with names of properties that can be sorted.
         */
        getSortablePropertyNames: function () {
            return this._aSortablePropertyNames;
        },

        /**
         * Get names of properties that must be filtered, that is they must appear in every $filter expression
         *
         * @returns {array(string)} Array with names of properties that must be filtered.
         */
        getRequiredFilterPropertyNames: function () {
            return this._aRequiredFilterPropertyNames;
        },

        /**
         * Get the names of all properties with an associated hierarchy
         *
         * @returns {array(string)} List of all property names
         */
        getAllHierarchyPropertyNames: function () {
            if (this._aHierarchyPropertyNames) {
                return this._aHierarchyPropertyNames;
            }

            this._aHierarchyPropertyNames = [];

            for (var sName in this._oRecursiveHierarchySet) {
                this._aHierarchyPropertyNames.push(this._oRecursiveHierarchySet[sName]
                    .getNodeValueProperty().name);
            }

            return this._aHierarchyPropertyNames;
        },

        /**
         * Get the hierarchy associated to a given property Based on the current specification,
         * hierarchies are always recursive. TODO: Extend behavior when leveled hierarchies get in scope
         *
         * @param {string} sName Parameter name
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.RecursiveHierarchy}
         *   The hierarchy object or null if it does not exist
         */
        getHierarchy: function (sName) {
            if (this._oRecursiveHierarchySet[sName] == undefined) {
                return null;
            }
            return this._oRecursiveHierarchySet[sName];
        },

        /**
         * Get the fully qualified name for this entity type
         *
         * @returns {string} The fully qualified name
         */
        getQName: function () {
            return this._sQName;
        },

        /**
         * Get full description for this entity type
         *
         * @returns {object} The DataJS object representing the entity type
         */
        getTypeDescription: function () {
            return this._oEntityType;
        },

        getSchema: function () {
            return this._oSchema;
        },

        getModel: function () {
            return this._oModel;
        },

        /**
         * Private member attributes
         */
        _oEntityType: null,
        _oSchema: null,
        _oModel: null,
        _sQName: null,
        _oPropertySet: null,
        _aFilterablePropertyNames: null,
        _aRequiredFilterPropertyNames: null,
        _aHierarchyPropertyNames: null,
        _oRecursiveHierarchySet: null
    };

    /** ******************************************************************** */

    /**
     * Create a representation of a recursive hierarchy defined on one multiple properties in an OData entity type query
     *
     * @param {EntityType} oEntityType object for the entity type
     * @param {object} oNodeIDProperty DataJS object for the property holding the
     *   hierarchy node ID identifying the hierarchy node to which the OData entry belongs
     * @param {object} oParentNodeIDProperty DataJS object for the property holding the
     *   node ID of the parent of the hierarchy node pointed to by the value of oNodeIDProperty
     * @param {object} oNodeLevelProperty DataJS object for the property holding the
     *   level number for the of the hierarchy node pointed to by the value of oNodeIDProperty
     * @param {object} oNodeValueProperty DataJS object for the property holding the data
     *   value for the of the hierarchy node pointed to by the value of oNodeIDProperty
     *
     * Representation of a recursive hierarchy.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.RecursiveHierarchy = function (oEntityType, oNodeIDProperty,
        oParentNodeIDProperty, oNodeLevelProperty, oNodeValueProperty) {
        this._init(oEntityType, oNodeIDProperty, oParentNodeIDProperty, oNodeLevelProperty,
            oNodeValueProperty);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.RecursiveHierarchy.prototype = {
        /**
         * @private
         */
        _init: function (oEntityType, oNodeIDProperty, oParentNodeIDProperty, oNodeLevelProperty,
            oNodeValueProperty) {
            this._oEntityType = oEntityType;

            this._oNodeIDProperty = oNodeIDProperty;
            this._oParentNodeIDProperty = oParentNodeIDProperty;
            this._oNodeLevelProperty = oNodeLevelProperty;
            this._oNodeValueProperty = oNodeValueProperty;
        },

        /**
         * Get indicator if this is a recursive hierarchy
         *
         * @returns {boolean} True
         */
        isRecursiveHierarchy: function () {
            return true;
        },

        /**
         * Get indicator if this is a leveled hierarchy
         *
         * @returns {boolean} False
         */
        isLeveledHierarchy: function () {
            return false;
        },

        /**
         * Get the property holding the node ID of the hierarchy node
         *
         * @returns {object} The DataJS object representing this property
         */
        getNodeIDProperty: function () {
            return this._oNodeIDProperty;
        },

        /**
         * Get the property holding the parent node ID of the hierarchy node
         *
         * @returns {object} The DataJS object representing this property
         */
        getParentNodeIDProperty: function () {
            return this._oParentNodeIDProperty;
        },

        /**
         * Get the property holding the level of the hierarchy node
         *
         * @returns {object} The DataJS object representing this property
         */
        getNodeLevelProperty: function () {
            return this._oNodeLevelProperty;
        },

        /**
         * Get the property holding the value that is structurally organized by the hierarchy
         *
         * @returns {object} The DataJS object representing this property
         */
        getNodeValueProperty: function () {
            return this._oNodeValueProperty;
        },

        /**
         * Private member attributes
         */

        _oNodeIDProperty: null,
        _oParentNodeIDProperty: null,
        _oNodeLevelProperty: null,
        _oNodeValueProperty: null
    };

    /** ******************************************************************** */

    /**
     * Create a representation of a filter expression for a given entity type.
     * It can be rendered as value for the $filter system query option.
     *
     * @param {object} oModel DataJS object for the OData model containing this entity type
     * @param {object} oSchema DataJS object for the schema containing this entity type
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntityType} oEntityType Object for the entity type
     *
     * Representation of a $filter expression for an OData entity type.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression = function (oModel, oSchema, oEntityType) {
        this._init(oModel, oSchema, oEntityType);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression.prototype = {
        /**
         * @private
         */
        _init: function (oModel, oSchema, oEntityType) {
            this._oEntityType = oEntityType;
            this._oSchema = oSchema;
            this._oModel = oModel;

            this._aFilterCondition = [];
        },

        /**
         * Clear expression from any conditions that may have been set previously
         */
        clear: function () {
            this._aFilterCondition = [];
        },

        /**
         * Add a condition to the filter expression.
         *
         * Multiple conditions on the same property are combined with a logical OR first,
         * and in a second step conditions for different properties are combined with a logical AND.
         *
         * @param {string} sPropertyName The name of the property bound in the condition
         * @param {sap.ui.model.FilterOperator} sOperator operator used for the condition
         * @param {object} oValue value to be used for this condition
         * @param {object} oValue2 (optional) as second value to be used for this condition
         * @throws Exception if the property is unknown or not filterable
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression} This object for method chaining
         */
        addCondition: function (sPropertyName, sOperator, oValue, oValue2) {
            var oProperty = this._oEntityType.findPropertyByName(sPropertyName);
            if (oProperty == null) {
                throw "Cannot add filter condition for unknown property name " + sPropertyName; // TODO
            }
            var aFilterablePropertyNames = this._oEntityType.getFilterablePropertyNames();
            if (aFilterablePropertyNames.indexOf(sPropertyName) === -1) {
                throw "Cannot add filter condition for not filterable property name " + sPropertyName; // TODO
            }
            this._aFilterCondition.push({
                property: oProperty,
                op: sOperator,
                val1: oValue,
                val2: oValue2
            });
            return this._aFilterablePropertyNames;
        },

        /**
         * Add a set condition to the filter expression.
         *
         * A set condition tests if the value of a property is included in a set of given values.
         * It is a convenience method for this particular use case eliminating the need for multiple API calls.
         *
         * @param {string} sPropertyName The name of the property bound in the condition
         * @param {array} aValues values defining the set
         * @throws Exception if the property is unknown or not filterable
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression} This object for method chaining
         */
        addSetCondition: function (sPropertyName, aValues) {
            var oProperty = this._oEntityType.findPropertyByName(sPropertyName);
            if (oProperty == null) {
                throw "Cannot add filter condition for unknown property name " + sPropertyName; // TODO
            }
            var aFilterablePropertyNames = this._oEntityType.getFilterablePropertyNames();
            if (aFilterablePropertyNames.indexOf(sPropertyName) === -1) {
                throw "Cannot add filter condition for not filterable property name " + sPropertyName; // TODO
            }
            for (var i = -1, oValue; oValue = aValues[++i];) {
                this._aFilterCondition.push({
                    property: oProperty,
                    op: FilterOperator.EQ,
                    val1: oValue
                });
            }
            return this._aFilterablePropertyNames;
        },

        /**
         * Get an array of SAPUI5 Filter objects corresponding to this expression.
         *
         * @returns {sap.ui.model.Filter[]} List of filter objects representing this expression
         */
        getExpressionAsUI5FilterArray: function () {
            var aFilterObjects = [];

            for (var i = -1, oCondition; oCondition = this._aFilterCondition[++i];) {
                aFilterObjects.push(new Filter(oCondition.property.name, oCondition.op,
                    oCondition.val1, oCondition.val2));
            }
            return aFilterObjects;
        },

        /**
         * Get the value for the OData system query option $filter corresponding to this expression.
         *
         * @returns {string} The $filter value for the filter expression
         */
        getURIFilterOptionValue: function () {
            if (this._aFilterCondition.length == 0) {
                return "";
            }

            this._aFilterCondition.sort(function (a, b) {
                if (a.property.name == b.property.name) {
                    return 0;
                }
                if (a.property.name > b.property.name) {
                    return 1;
                }
                return -1;
            });

            var sPropertyName = this._aFilterCondition[0].property.name;
            var sOptionString = "";
            var sSubExpression = "";
            for (var i = -1, oCondition; oCondition = this._aFilterCondition[++i];) {
                if (sPropertyName != oCondition.property.name) {
                    sOptionString += (sOptionString == "" ? "" : " and ") + "(" + sSubExpression + ")";
                    sSubExpression = "";
                    sPropertyName = oCondition.property.name;
                }

                switch (oCondition.op) {
                    case FilterOperator.BT:
                        sSubExpression += (sSubExpression == "" ? "" : " or ")
                            + "("
                            + oCondition.property.name
                            + " "
                            + FilterOperator.GE.toLowerCase()
                            + " "
                            + sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.helper
                                .renderPropertyFilterValue(oCondition.val1, oCondition.property.type)
                            + " and "
                            + oCondition.property.name
                            + " "
                            + FilterOperator.LE.toLowerCase()
                            + " "
                            + sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.helper
                                .renderPropertyFilterValue(oCondition.val2, oCondition.property.type)
                            + ")";
                        break;
                    default:
                        sSubExpression += (sSubExpression == "" ? "" : " or ")
                            + "("
                            + oCondition.property.name
                            + " "
                            + oCondition.op.toLowerCase()
                            + " "
                            + sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.helper
                                .renderPropertyFilterValue(oCondition.val1, oCondition.property.type)
                            + ")";
                }
            }
            sOptionString += (sOptionString == "" ? "" : " and ") + "(" + sSubExpression + ")";

            return sOptionString;
        },

        /**
         * Get description for this entity type
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntityType} The object representing the entity type
         */
        getEntityType: function () {
            return this._oEntityType;
        },

        getSchema: function () {
            return this._oSchema;
        },

        getModel: function () {
            return this._oModel;
        },

        /**
         * Private member attributes
         */

        _oEntityType: null,
        _oSchema: null,
        _oModel: null,

        _aFilterCondition: null
    };

    /** ******************************************************************** */

    /**
     * @class Sort order of a property
     * @static
     * @public
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortOrder = {
        /**
         * Sort Order: ascending.
         *
         * @public
         */
        Ascending: "asc",

        /**
         * Sort Order: descending.
         *
         * @public
         */
        Descending: "desc"
    };

    /** ******************************************************************** */

    /**
     * Create a representation of an order by expression for a given entity type.
     * It can be rendered as value for the $orderby system query option.
     *
     * @param {object} oModel DataJS object for the OData model containing this entity type
     * @param {object} oSchema DataJS object for the schema containing this entity type
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntityType} oEntityType object for the entity type
     *
     * Representation of a $orderby expression for an OData entity type.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortExpression = function (oModel, oSchema, oEntityType) {
        this._init(oModel, oSchema, oEntityType);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortExpression.prototype = {
        /**
         * @private
         */
        _init: function (oModel, oSchema, oEntityType) {
            this._oEntityType = oEntityType;
            this._oSchema = oSchema;
            this._oModel = oModel;

            this._aSortCondition = [];
        },

        /**
         * Checks if an order by expression for the given property is already defined and returns a reference to an object
         * with property sorter and index of the object or null if the property is not yet defined in an order by expression.
         *
         * @private
         */
        _containsSorter: function (sPropertyName) {
            var oResult = null;
            for (var i = -1, oCurrentSorter; oCurrentSorter = this._aSortCondition[++i];) {
                if (oCurrentSorter.property.name === sPropertyName) {
                    oResult = {
                        sorter: oCurrentSorter,
                        index: i
                    };
                    break;
                }
            }
            return oResult;
        },

        /**
         * TODO helper method to remove elements from array
         *
         * @private
         */
        _removeFromArray: function (array, from, to) {
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
        },

        /**
         * Clear expression from any sort conditions that may have been set previously
         */
        clear: function () {
            this._aSortCondition = [];
        },

        /**
         * Add a condition to the order by expression. Multiple conditions on the same property will throw an exception,
         * e.g. you cannot order by ascending and descending at the same time on the same property.
         *
         * @param {string} sPropertyName The name of the property bound in the condition
         * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortOrder} sSortOrder sorting order used for the condition
         * @throws Exception if the property is unknown, not sortable or already added as sorter
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortExpression} This object for method chaining
         */
        addSorter: function (sPropertyName, sSortOrder) {
            var oProperty = this._oEntityType.findPropertyByName(sPropertyName);
            if (oProperty == null) {
                throw "Cannot add sort condition for unknown property name " + sPropertyName; // TODO
            }
            if (this._containsSorter(sPropertyName) != null) {
                throw "Sort condition for this property name is already defined " + sPropertyName; // TODO
            }
            var aSortablePropertyNames = this._oEntityType.getSortablePropertyNames();
            if (aSortablePropertyNames.indexOf(sPropertyName) === -1) {
                throw "Cannot add sort condition for not sortable property name " + sPropertyName; // TODO
            }

            this._aSortCondition.push({
                property: oProperty,
                order: sSortOrder
            });
            return this;
        },

        /**
         * Removes the order by expression for the given property name from the list of order by expression.
         * If no order by expression with this property name exists the method does nothing.
         *
         * @param {string} sPropertyName The name of the property to be removed from the condition
         */
        removeSorter: function (sPropertyName) {
            if (!sPropertyName) {
                return;
            }

            var oSorter = this._containsSorter(sPropertyName);
            if (oSorter) {
                this._removeFromArray(this._aSortCondition, oSorter.index);
            }
        },

        /**
         * Get an array of SAPUI5 Sorter objects corresponding to this expression.
         *
         * @returns {sap.ui.model.Sorter[]} List of sorter objects representing this expression
         */
        getExpressionsAsUI5SorterArray: function () {
            var aSorterObjects = [];

            for (var i = -1, oCondition; oCondition = this._aSortCondition[++i];) {
                aSorterObjects.push(new Sorter(oCondition.property.name,
                    oCondition.order == sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortOrder.Descending));
            }

            return aSorterObjects;
        },

        /**
         * Get the first SAPUI5 Sorter object.
         *
         * @returns {sap.ui.model.Sorter} first sorter object or null if empty
         */
        getExpressionAsUI5Sorter: function () {
            var aSortArray = this.getExpressionsAsUI5SorterArray();
            if (aSortArray.length == 0) {
                return null;
            }
            return aSortArray[0];
        },

        /**
         * Get the value for the OData system query option $orderby corresponding to this expression.
         *
         * @returns {string} The $orderby value for the sort expressions
         */
        getURIOrderByOptionValue: function () {
            if (this._aSortCondition.length == 0) {
                return "";
            }

            var sOrderByOptionString = "";
            for (var i = -1, oCondition; oCondition = this._aSortCondition[++i];) {
                sOrderByOptionString += oCondition.property.name + " " + oCondition.order;
                if (i < this._aSortCondition.length - 1) {
                    sOrderByOptionString += ", ";
                }
            }

            return sOrderByOptionString;
        },

        /**
         * Get description for this entity type
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.EntityType} The object representing the entity type
         */
        getEntityType: function () {
            return this._oEntityType;
        },

        getSchema: function () {
            return this._oSchema;
        },

        getModel: function () {
            return this._oModel;
        },

        /**
         * Private member attributes
         */
        _oEntityType: null,
        _oSchema: null,
        _oModel: null,
        _aSortCondition: null
    };

    /** ******************************************************************** */

    /**
     * Create a request object for interaction with a query parameterization.
     *
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameterization} oParameterization
     *   Description of a query parameterization
     *
     * Creation of URIs for query parameterizations.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.ParameterizationRequest = function (oParameterization) {
        this._init(oParameterization);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.ParameterizationRequest.prototype = {
        /**
         * @private
         */
        _init: function (oParameterization) {
            if (!oParameterization) {
                throw "No parameterization given"; // TODO
            }
            this._oParameterization = oParameterization;
            this._oParameterValueAssignment = [];
        },

        /**
         * Get the description of the parameterization on which this request operates on
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameterization}
         *   Description of a query parameterization
         */
        getParameterization: function () {
            return this._oParameterization;
        },

        /**
         * Assign a value to a parameter
         *
         * @param {String} sParameterName Name of the parameter. In case of a range value, provide the name of the lower boundary parameter.
         * @param {String} sValue Assigned value. Pass null to remove a value assignment.
         * @param {String} sToValue Omit it or set it to null for single values. If set, it will be assigned to the upper boundary parameter
         */
        setParameterValue: function (sParameterName, sValue, sToValue) {
            var oParameter = this._oParameterization.findParameterByName(sParameterName);
            if (!oParameter) {
                throw "Invalid parameter name " + sParameterName; // TODO improve
            }
            // error handling
            if (sToValue != null) {
                if (!oParameter.isIntervalBoundary()) {
                    // TODO improve error handling
                    throw "Range value cannot be applied to parameter " + sParameterName
                    + " accepting only single values"; // TODO
                }
                if (!oParameter.isLowerIntervalBoundary()) {
                    // TODO improve error handling
                    throw "Range value given, but parameter " + sParameterName
                    + " does not hold the lower boundary"; // TODO
                }
            }
            if (!oParameter.isIntervalBoundary()) {
                if (sValue == null) {
                    delete this._oParameterValueAssignment[sParameterName];
                } else {
                    this._oParameterValueAssignment[sParameterName] = sValue;
                }
            } else {
                if (sValue == null && sToValue != null) {
                    throw "Parameter " + sParameterName + ": An upper boundary cannot be given without the lower boundary"; // TODO
                }
                if (sValue == null) {
                    delete this._oParameterValueAssignment[sParameterName];
                    sToValue = null;
                } else {
                    this._oParameterValueAssignment[sParameterName] = sValue;
                }
                var oUpperBoundaryParameter = oParameter.getPeerIntervalBoundaryParameter();
                if (sToValue == null) {
                    sToValue = sValue;
                }
                if (sValue == null) {
                    delete this._oParameterValueAssignment[oUpperBoundaryParameter.getName()];
                } else {
                    this._oParameterValueAssignment[oUpperBoundaryParameter.getName()] = sToValue;
                }
            }
            return;
        },

        /**
         * Get the URI to locate the entity set for the query parameterization.
         *
         * @param {String} sServiceRootURI (optional) Identifies the root of the OData service
         * @returns {String} The resource path of the URI pointing to the entity set.
         *   It is a relative URI unless a service root is given, which would then prefixed in order to return a complete URL.
         */
        getURIToParameterizationEntitySet: function (sServiceRootURI) {
            return (sServiceRootURI || "") + "/"
                + this._oParameterization.getEntitySet().getQName();
        },

        /**
         * Get the URI to locate the parameterization entity for the values assigned to all parameters beforehand.
         * Notice that a value must be supplied for every parameter including those marked as optional.
         * For optional parameters, assign the special value that the service provider uses as an "omitted" value.
         * For example, for services based on BW Easy Queries, this would be an empty string.
         *
         * @param {String} sServiceRootURI (optional) Identifies the root of the OData service
         * @returns {String} The resource path of the URI pointing to the entity set.
         *   It is a relative URI unless a service root is given, which would then prefixed in order to return a complete URL.
         */
        getURIToParameterizationEntry: function (sServiceRootURI) {
            var oDefinedParameters = this._oParameterization.getAllParameters();
            for (var sDefinedParameterName in oDefinedParameters) {
                // check that all parameters have a value assigned. This is also
                // true for those marked as optional, because the omitted value is
                // conveyed by some default value, e.g. as empty string.
                if (this._oParameterValueAssignment[sDefinedParameterName] == undefined) {
                    throw "Parameter " + sDefinedParameterName + " has no value assigned"; // TODO
                }
            }
            var sKeyIdentification = "", bFirst = true;
            for (var sParameterName in this._oParameterValueAssignment) {
                sKeyIdentification += (bFirst ? "" : ",")
                    + sParameterName
                    + "="
                    + sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.helper.renderPropertyKeyValue(
                        this._oParameterValueAssignment[sParameterName],
                        oDefinedParameters[sParameterName].getProperty().type);
                bFirst = false;
            }

            return (sServiceRootURI || "") + "/"
                + this._oParameterization.getEntitySet().getQName() + "(" + sKeyIdentification
                + ")";
        },

        /**
         * Private member attributes
         */
        _oParameterization: null,
        _oParameterValueAssignment: null
    };

    /** ******************************************************************** */

    /**
     * Create a request object for interaction with a query result.
     *
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResult} oParameterization
     *   Description of a query parameterization
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.ParameterizationRequest} oParameterizationRequest
     *   (optional) Request object for interactions with the parameterization of this query.
     *   Only required if the query service includes parameters.
     *
     * Creation of URIs for fetching query results.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResultRequest = function (oQueryResult/*, oParameterizationRequest*/) {
        this._init(oQueryResult);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResultRequest.prototype = {
        /**
         * @private
         */
        _init: function (oQueryResult, oParameterizationRequest) {
            this._oQueryResult = oQueryResult;
            this._oParameterizationRequest = oParameterizationRequest;
            this._oAggregationLevel = {};
            this._oMeasures = {};
            this._bIncludeEntityKey = false;
            this._oFilterExpression = null;
        },

        /**
         * Set the parameterization request required for interactions with the query result of parameterized queries
         *
         * @param {Object} oParameterizationRequest Request object for interactions with the parameterization of this query
         */
        setParameterizationRequest: function (oParameterizationRequest) {
            this._oParameterizationRequest = oParameterizationRequest;
        },

        /**
         * Get the description of the query result on which this request operates on
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResult} Description of a query result
         */
        getQueryResult: function () {
            return this._oQueryResult;
        },

        /**
         * Set the aggregation level for the query result request. By default, the query result will include the properties holding the
         * keys of the given dimensions. This setting can be changed using includeDimensionKeyTextAttributes.
         *
         * @param {Array} aDimensionName Array of dimension names to be part of the aggregation level.
         *   If null, the aggregation level includes all dimensions, if empty, no dimension is included.
         */
        setAggregationLevel: function (aDimensionName) {
            this._oAggregationLevel = {};
            if (!aDimensionName) {
                aDimensionName = this._oQueryResult.getAllDimensionNames();
            }
            this.addToAggregationLevel(aDimensionName);
        },

        /**
         * Add one or more dimensions to the aggregation level
         *
         * @param {Array} aDimensionName Array of dimension names to be added to the already defined aggregation level.
         */
        addToAggregationLevel: function (aDimensionName) {
            if (!aDimensionName) {
                return;
            }

            for (var i = -1, sDimName; sDimName = aDimensionName[++i];) {
                if (!this._oQueryResult.findDimensionByName(sDimName)) {
                    throw sDimName + " is not a valid dimension name"; // TODO
                }
                this._oAggregationLevel[sDimName] = {
                    key: true,
                    text: false,
                    attributes: null
                };
            }
        },

        /**
         * Remove one or more dimensions from the aggregation level. The method also removed a potential sort expression on the dimension.
         *
         * @param {Array} aDimensionName Array of dimension names to be removed from the already defined aggregation level.
         */
        removeFromAggregationLevel: function (aDimensionName) {
            if (!aDimensionName) {
                return;
            }
            for (var i = -1, sDimName; sDimName = aDimensionName[++i];) {
                if (!this._oQueryResult.findDimensionByName(sDimName)) {
                    throw sDimName + " is not a valid dimension name"; // TODO
                }
                if (this._oAggregationLevel[sDimName] != undefined) {
                    delete this._oAggregationLevel[sDimName];

                    // remove potential sort expression on this dimension
                    this.getSortExpression().removeSorter(sDimName);
                }
            }
        },

        /**
         * Get the names of the dimensions included in the aggregation level
         *
         * @returns {Array} The dimension names included in the aggregation level
         */
        getAggregationLevel: function () {
            var aDimName = [];
            for (var sDimName in this._oAggregationLevel) {
                aDimName.push(sDimName);
            }
            return aDimName;
        },

        /**
         * Get details about a dimensions included in the aggregation level
         *
         * @param {String} sDimensionName Name of a dimension included in the aggregation level of this request,
         *   for which details shall be returned
         * @returns {object} An object with three properties named key and text, both with Boolean values indicating whether the key
         *   and text of this dimension are included in this request. The third property named attributes is an array of attribute
         *   names of this dimension included in this request, or null, if there are none.
         */
        getAggregationLevelDetails: function (sDimensionName) {
            if (this._oAggregationLevel[sDimensionName] == undefined) {
                throw "Aggregation level does not include dimension " + sDimensionName;
            }
            return this._oAggregationLevel[sDimensionName];
        },

        /**
         * Set the measures to be included in the query result request. By default, the query result will include the properties holding the
         * raw values of the given measures. This setting can be changed using includeMeasureRawFormattedValueUnit.
         *
         * @param {Array} aMeasureName Array of measure names to be part of the query result request.
         *   If null, the request includes all measures, if empty, no measure is included.
         */
        setMeasures: function (aMeasureName) {
            if (!aMeasureName) {
                aMeasureName = this._oQueryResult.getAllMeasureNames();
            }
            this._oMeasures = {};
            for (var i = -1, sMeasName; sMeasName = aMeasureName[++i];) {
                if (!this._oQueryResult.findMeasureByName(sMeasName)) {
                    throw sMeasName + " is not a valid measure name"; // TODO
                }

                this._oMeasures[sMeasName] = {
                    value: true,
                    text: false,
                    unit: false
                };
            }
        },

        /**
         * Get the names of the measures included in the query result request
         *
         * @returns {Array} The measure names included in the query result request
         */
        getMeasureNames: function () {
            var aMeasName = [];
            for (var sMeasName in this._oMeasures) {
                aMeasName.push(sMeasName);
            }
            return aMeasName;
        },

        /**
         * Specify which dimension components shall be included in the query result.
         * The settings get applied to the currently defined aggregation level.
         *
         * @param {String} sDimensionName Name of the dimension for which the settings get applied.
         *   Specify null to apply the settings to all dimensions in the aggregation level.
         * @param {Boolean} bIncludeKey Indicator whether or not to include the dimension key in the query result.
         *   Pass null to keep current setting.
         * @param {Boolean} bIncludeText Indicator whether or not to include the dimension text (if available)
         *   in the query result. Pass null to keep current setting.
         * @param {Array} aAttributeName Array of dimension attribute names to be included in the result.
         *   Pass null to keep current setting. This argument is ignored if sDimensionName is null.
         */
        includeDimensionKeyTextAttributes: function (sDimensionName, bIncludeKey, bIncludeText,
            aAttributeName) {
            var aDimName = [];
            if (sDimensionName) {
                if (this._oAggregationLevel[sDimensionName] == undefined) {
                    throw sDimensionName + " is not included in the aggregation level";
                }
                aDimName.push(sDimensionName);
            } else {
                for (var sName in this._oAggregationLevel) {
                    aDimName.push(sName);
                }
                aAttributeName = null;
            }
            for (var i = -1, sDimName; sDimName = aDimName[++i];) {
                if (bIncludeKey != null) {
                    this._oAggregationLevel[sDimName].key = bIncludeKey;
                }
                if (bIncludeText != null) {
                    this._oAggregationLevel[sDimName].text = bIncludeText;
                }
                if (aAttributeName != null) {
                    this._oAggregationLevel[sDimName].attributes = aAttributeName;
                }
            }
        },

        /**
         * Specify which measure components shall be included in the query result.
         * The settings get applied to the currently set measures.
         *
         * @param {String} sMeasureName Name of the measure for which the settings get applied.
         *   Specify null to apply the settings to all currently set measures.
         * @param {Boolean} bIncludeRawValue Indicator whether or not to include the raw value in the query result.
         *   Pass null to keep current setting.
         * @param {Boolean} bIncludeFormattedValue Indicator whether or not to include the formatted value (if available) in the query result.
         *   Pass null to keep current setting.
         * @param {Boolean} bIncludeUnit Indicator whether or not to include the unit (if available) in the query result.
         *   Pass null to keep current setting.
         */
        includeMeasureRawFormattedValueUnit: function (sMeasureName, bIncludeRawValue,
            bIncludeFormattedValue, bIncludeUnit) {
            var aMeasName = [];
            if (sMeasureName) {
                if (this._oMeasures[sMeasureName] == undefined) {
                    throw sMeasureName + " is not part of the query result";
                }
                aMeasName.push(sMeasureName);
            } else {
                for (var sName in this._oMeasures) {
                    aMeasName.push(sName);
                }
            }
            for (var i = -1, sMeasName; sMeasName = aMeasName[++i];) {
                if (bIncludeRawValue != null) {
                    this._oMeasures[sMeasName].value = bIncludeRawValue;
                }
                if (bIncludeFormattedValue != null) {
                    this._oMeasures[sMeasName].text = bIncludeFormattedValue;
                }
                if (bIncludeUnit != null) {
                    this._oMeasures[sMeasName].unit = bIncludeUnit;
                }
            }
        },

        /**
         * Get the filter expression for this request.
         *
         * Expressions are represented by separate objects. If none exists so far, a new expression object gets created.
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression}
         *   The filter object associated to this request.
         */
        getFilterExpression: function () {
            if (this._oFilterExpression == null) {
                var oEntityType = this._oQueryResult.getEntityType();
                this._oFilterExpression = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression(oEntityType
                    .getModel(), oEntityType.getSchema(), oEntityType);
            }
            return this._oFilterExpression;
        },

        /**
         * Set the filter expression for this request.
         *
         * Expressions are represented by separate objects. Calling this method replaces the filter object maintained by this request.
         *
         * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression} oFilter
         *   The filter object to be associated with this request.
         */
        setFilterExpression: function (oFilter) {
            this._oFilterExpression = oFilter;
        },

        /**
         * Get the sort expression for this request.
         *
         * Expressions are represented by separate objects. If none exists so far, a new expression object gets created.
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortExpression}
         *   The sort object associated to this request.
         */
        getSortExpression: function () {
            if (this._oSortExpression == null) {
                var oEntityType = this._oQueryResult.getEntityType();
                this._oSortExpression = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortExpression(oEntityType
                    .getModel(), oEntityType.getSchema(), oEntityType);
            }
            return this._oSortExpression;
        },

        /**
         * Set the sort expression for this request.
         *
         * Expressions are represented by separate objects. Calling this method replaces the sort object maintained by this request.
         *
         * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortExpression} oSorter
         *   The sort object to be associated with this request.
         */
        setSortExpression: function (oSorter) {
            this._oSortExpression = oSorter;
        },

        /**
         * Set further options to be applied for the OData request to fetch the query result
         *
         * @param {Boolean} bIncludeEntityKey Indicates whether or not the entity key should be returned for every entry in the query result.
         *   Default is not to include it. Pass null to keep current setting.
         * @param {Boolean} bIncludeCount Indicates whether or not the result shall include a count for the returned entities.
         *   Default is not to include it. Pass null to keep current setting.
         */
        setRequestOptions: function (bIncludeEntityKey, bIncludeCount) {
            if (bIncludeEntityKey) {
                this._bIncludeEntityKey = bIncludeEntityKey;
            }
            if (bIncludeCount) {
                this._bIncludeCount = bIncludeCount;
            }
        },

        /**
         * Specify that only a page of the query result shall be returned. A page is described by its boundaries,
         * that are row numbers for the first and last rows in the query result to be returned.
         *
         * @param {Number} start The first row of the query result to be returned. Numbering starts at 1.
         *   Passing null is equivalent to start with the first row.
         * @param {Number} end The last row of the query result to be returned.
         *   Passing null is equivalent to get all rows up to the end of the query result.
         */
        setResultPageBoundaries: function (start, end) {
            if (start != null && typeof start !== "number") {
                throw "Start value must be null or numeric"; // TODO
            }
            if (end !== null && typeof end !== "number") {
                throw "End value must be null or numeric"; // TODO
            }

            if (start == null) {
                start = 1;
            }

            if (start < 1 || start > (end == null ? start : end)) {
                throw "Invalid values for requested page boundaries"; // TODO
            }

            this._iSkipRequestOption = (start > 1) ? start : null;
            this._iTopRequestOption = (end != null) ? (end - start + 1) : null;
        },

        /**
         * Returns the current page boundaries as object with properties <code>start</code> and <code>end</code>.
         * If the end of the page is unbounded, <code>end</code> is null.
         *
         * @returns {Object} the current page boundaries as object
         */
        getResultPageBoundaries: function () {
            var start, end;
            if (this._iSkipRequestOption == null) {
                start = 1;
                end = 1;
            } else {
                start = this._iSkipRequestOption;
                end = this._iSkipRequestOption + this._iTopRequestOption;
            }
            return {
                start: start,
                end: (this._iTopRequestOption != null) ? end : null
            };
        },

        /**
         * Get the URI to locate the entity set for the query result.
         *
         * @param {String} sServiceRootURI (optional) Identifies the root of the OData service
         * @returns {String} The resource path of the URI pointing to the entity set.
         *   It is a relative URI unless a service root is given, which would then prefixed in order to return a complete URL.
         */
        getURIToQueryResultEntitySet: function (sServiceRootURI) {
            var sURI = null;
            if (this._oQueryResult.getParameterization()) {
                if (!this._oParameterizationRequest) {
                    throw "Missing parameterization request";
                } else {
                    sURI = this._oParameterizationRequest.getURIToParameterizationEntry(sServiceRootURI)
                        + "/"
                        + this._oQueryResult.getParameterization().getNavigationPropertyToQueryResult();
                }
            } else {
                sURI = (sServiceRootURI || "") + "/" + this._oQueryResult.getEntitySet().getQName();
            }
            return sURI;
        },

        /**
         * Get the value of an query option for the OData request URI corresponding to this request.
         *
         * @param {String} sQueryOptionName Identifies the query option: $select, $filter,$orderby ... or any custom query option
         * @returns {String} The value of the requested query option or null, if this option is not used for the OData request.
         */
        getURIQueryOptionValue: function (sQueryOptionName) {
            var sQueryOptionValue = null;

            switch (sQueryOptionName) {
                case "$select": {
                    var sSelectOption = "",
                        i;
                    for (var sDimName in this._oAggregationLevel) {
                        var oDim = this._oQueryResult.findDimensionByName(sDimName);
                        var oDimSelect = this._oAggregationLevel[sDimName];
                        if (oDimSelect.key == true) {
                            sSelectOption += (sSelectOption == "" ? "" : ",") + oDim.getKeyProperty().name;
                        }
                        if (oDimSelect.text == true && oDim.getTextProperty()) {
                            sSelectOption += (sSelectOption == "" ? "" : ",") + oDim.getTextProperty().name;
                        }
                        if (oDimSelect.attributes) {
                            var sAttrName;
                            for (i = -1; sAttrName = oDimSelect.attributes[++i];) {
                                sSelectOption += (sSelectOption == "" ? "" : ",")
                                    + oDim.findAttributeByName(sAttrName).getName();
                            }
                        }
                    }

                    for (var sMeasName in this._oMeasures) {
                        var oMeas = this._oQueryResult.findMeasureByName(sMeasName);
                        var oMeasSelect = this._oMeasures[sMeasName];
                        if (oMeasSelect.value == true) {
                            sSelectOption += (sSelectOption == "" ? "" : ",")
                                + oMeas.getRawValueProperty().name;
                        }
                        if (oMeasSelect.text == true && oMeas.getFormattedValueProperty()) {
                            sSelectOption += (sSelectOption == "" ? "" : ",")
                                + oMeas.getFormattedValueProperty().name;
                        }
                        if (oMeasSelect.unit == true && oMeas.getUnitProperty()) {
                            sSelectOption += (sSelectOption == "" ? "" : ",")
                                + oMeas.getUnitProperty().name;
                        }
                    }

                    if (this._bIncludeEntityKey) {
                        var aKeyPropRef = this._oQueryResult.getEntityType().getTypeDescription().key.propertyRef,
                            oKeyProp;
                        for (i = -1; oKeyProp = aKeyPropRef[++i];) {
                            sSelectOption += (sSelectOption == "" ? "" : ",") + oKeyProp.name;
                        }
                    }
                    sQueryOptionValue = (sSelectOption || null);
                    break;
                }
                case "$filter": {
                    var sFilterOption = null;
                    if (this._oFilterExpression) {
                        sFilterOption = this._oFilterExpression.getURIFilterOptionValue();
                    }
                    sQueryOptionValue = (sFilterOption || null);
                    break;
                }
                case "$orderby": {
                    var sSortOption = null;
                    if (this._oSortExpression) {
                        sSortOption = this._oSortExpression.getURIOrderByOptionValue();
                    }
                    sQueryOptionValue = (sSortOption || null);
                    break;
                }
                case "$top": {
                    if (this._iTopRequestOption !== null) {
                        sQueryOptionValue = this._iTopRequestOption;
                    }
                    break;
                }
                case "$skip": {
                    sQueryOptionValue = this._iSkipRequestOption;
                    break;
                }
                default:
                    break;
            }
            return sQueryOptionValue;
        },

        /**
         * Get the unescaped URI to fetch the query result.
         *
         * @param {String} sServiceRootURI (optional) Identifies the root of the OData service
         * @returns {String} The unescaped URI that contains the OData resource path and OData system query options
         *   to express the aggregation level, filter expression and further options.
         */
        getURIToQueryResultEntries: function (sServiceRootURI) {
            // construct resource path
            var sResourcePath = this.getURIToQueryResultEntitySet(sServiceRootURI);

            // construct $select
            var sSelectOption = this.getURIQueryOptionValue("$select");
            var sFilterOption = this.getURIQueryOptionValue("$filter");
            var sSortOption = this.getURIQueryOptionValue("$orderby");
            var sTopOption = this.getURIQueryOptionValue("$top");
            var sSkipOption = this.getURIQueryOptionValue("$skip");

            var sURI = sResourcePath;
            var bQuestionmark = false;

            if (sSelectOption) {
                sURI += "?$select=" + sSelectOption;
                bQuestionmark = true;
            }
            if (this._oFilterExpression && sFilterOption) {
                if (!bQuestionmark) {
                    sURI += "?";
                    bQuestionmark = true;
                } else {
                    sURI += "&";
                }
                sURI += "$filter=" + sFilterOption;
            }
            if (this._oSortExpression && sSortOption) {
                if (!bQuestionmark) {
                    sURI += "?";
                    bQuestionmark = true;
                } else {
                    sURI += "&";
                }
                sURI += "$orderby=" + sSortOption;
            }

            if (this._iTopRequestOption && sTopOption) {
                if (!bQuestionmark) {
                    sURI += "?";
                    bQuestionmark = true;
                } else {
                    sURI += "&";
                }
                sURI += "$top=" + sTopOption;
            }
            if (this._iSkipRequestOption && sSkipOption) {
                if (!bQuestionmark) {
                    sURI += "?";
                    bQuestionmark = true;
                } else {
                    sURI += "&";
                }
                sURI += "$skip=" + sSkipOption;
            }
            if (this._bIncludeCount) {
                if (!bQuestionmark) {
                    sURI += "?";
                    bQuestionmark = true;
                } else {
                    sURI += "&";
                }
                sURI += "$inlinecount=allpages";
            }
            return sURI;
        },

        /**
         * Private member attributes
         */
        _oQueryResult: null,
        _oParameterizationRequest: null,
        _oAggregationLevel: null,
        _oMeasures: null,
        _bIncludeEntityKey: null,
        _bIncludeCount: null,
        _oFilterExpression: null,
        _oSortExpression: null,
        _iSkipRequestOption: 0,
        _iTopRequestOption: null
    };

    /** ******************************************************************** */

    /**
     * Create a request object for interaction with a query parameter value help.
     *
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameter} oParameter Description of a query parameter
     *
     * Creation of URIs for fetching a query parameter value set.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.ParameterValueSetRequest = function (oParameter) {
        this._init(oParameter);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.ParameterValueSetRequest.prototype = {
        /**
         * @private
         */
        _init: function (oParameter) {
            this._oParameter = oParameter;
            this._oValueSetResult = {};
            this._oFilterExpression = null;
            this._oSortExpression = null;
        },

        /**
         * Specify which components of the parameter shall be included in the value set.
         *
         * @param {Boolean} bIncludeText Indicator whether or not to include the parameter text (if available) in the value set.
         *   Pass null to keep current setting.
         */
        includeParameterText: function (bIncludeText) {
            if (bIncludeText != null) {
                this._oValueSetResult.text = bIncludeText;
            }
        },

        /**
         * Get the filter expression for this request.
         *
         * Expressions are represented by separate objects. If none exists so far, a new expression object gets created.
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression}
         *   The filter object associated to this request.
         */
        getFilterExpression: function () {
            if (this._oFilterExpression == null) {
                var oEntityType = this._oParameter.getContainingParameterization().getEntityType();
                this._oFilterExpression = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression(oEntityType
                    .getModel(), oEntityType.getSchema(), oEntityType);
            }
            return this._oFilterExpression;
        },

        /**
         * Set the filter expression for this request.
         *
         * Expressions are represented by separate objects.
         * Calling this method replaces the filter object maintained by this request.
         *
         * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression} oFilter
         *   The filter object to be associated with this request.
         */
        setFilterExpression: function (oFilter) {
            this._oFilterExpression = oFilter;
        },

        /**
         * Get the sort expression for this request.
         *
         * Expressions are represented by separate objects.
         * If none exists so far, a new expression object gets created.
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortExpression}
         *   The sort object associated to this request.
         */
        getSortExpression: function () {
            if (this._oSortExpression == null) {
                var oEntityType = this._oQueryResult.getEntityType();
                this._oSortExpression = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortExpression(oEntityType
                    .getModel(), oEntityType.getSchema(), oEntityType);
            }
            return this._oSortExpression;
        },

        /**
         * Set the sort expression for this request.
         *
         * Expressions are represented by separate objects.
         * Calling this method replaces the sort object maintained by this request.
         *
         * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortExpression} oSorter
         *   The sort object to be associated with this request.
         */
        setSortExpression: function (oSorter) {
            this._oSortExpression = oSorter;
        },

        /**
         * Get the value of an query option for the OData request URI corresponding to this request.
         *
         * @param {String} sQueryOptionName Identifies the query option: $select, $filter,... or any custom query option
         * @returns {String} The value of the requested query option or null, if this option is not used for the OData request.
         */
        getURIQueryOptionValue: function (sQueryOptionName) {
            var sQueryOptionValue = null;

            switch (sQueryOptionName) {
                case "$select": {
                    var sSelectOption = "";
                    sSelectOption += (sSelectOption == "" ? "" : ",") + this._oParameter.getProperty().name;
                    if (this._oValueSetResult.text == true && this._oParameter.getTextProperty()) {
                        sSelectOption += (sSelectOption == "" ? "" : ",")
                            + this._oParameter.getTextProperty().name;
                    }
                    sQueryOptionValue = (sSelectOption || null);
                    break;
                }
                case "$filter": {
                    var sFilterOption = null;
                    if (this._oFilterExpression) {
                        sFilterOption = this._oFilterExpression.getURIFilterOptionValue();
                    }
                    sQueryOptionValue = (sFilterOption || null);
                    break;
                }
                case "$orderby": {
                    var sSortOption = null;
                    if (this._oSortExpression) {
                        sSortOption = this._oSortExpression.getURIOrderByOptionValue();
                    }
                    sQueryOptionValue = (sSortOption || null);
                    break;
                }
                default:
                    break;
            }

            return sQueryOptionValue;
        },

        /**
         * Get the unescaped URI to fetch the parameter value set.
         *
         * @param {String} sServiceRootURI (optional) Identifies the root of the OData service
         * @returns {String} The unescaped URI that contains the OData resource path and OData
         *   system query options to express the request for the parameter value set.
         */
        getURIToParameterValueSetEntries: function (sServiceRootURI) {
            // construct resource path
            var sResourcePath = null;

            sResourcePath = (sServiceRootURI || "") + "/"
                + this._oParameter.getContainingParameterization().getEntitySet().getQName();

            // construct query options
            var sSelectOption = this.getURIQueryOptionValue("$select");
            var sFilterOption = this.getURIQueryOptionValue("$filter");
            var sSortOption = this.getURIQueryOptionValue("$orderby");

            var sURI = sResourcePath;
            var bQuestionmark = false;

            if (sSelectOption) {
                sURI += "?$select=" + sSelectOption;
                bQuestionmark = true;
            }
            if (this._oFilterExpression && sFilterOption) {
                if (!bQuestionmark) {
                    sURI += "?";
                    bQuestionmark = true;
                } else {
                    sURI += "&";
                }
                sURI += "$filter=" + sFilterOption;
            }
            if (this._oSortExpression && sSortOption) {
                if (!bQuestionmark) {
                    sURI += "?";
                    bQuestionmark = true;
                } else {
                    sURI += "&";
                }
                sURI += "$orderby=" + sSortOption;
            }
            return sURI;
        },

        /**
         * Private member attributes
         */
        _oParameter: null,
        _oFilterExpression: null,
        _oSortExpression: null,
        _oValueSetResult: null
    };

    /** ******************************************************************** */

    /**
     * Create a request object for interaction with a dimension value help.
     *
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Dimension} oDimension Description of a dimension
     * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.ParameterizationRequest} oParameterizationRequest (optional)
     *   Request object for interactions with the parameterization of this query.
     *   Only required if the query service includes parameters.
     *
     * Creation of URIs for fetching a query dimension value set.
     */
    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.DimensionMemberSetRequest = function (oDimension, oParameterizationRequest) {
        this._init(oDimension, oParameterizationRequest);
    };

    sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.DimensionMemberSetRequest.prototype = {
        /**
         * @private
         */
        _init: function (oDimension, oParameterizationRequest) {
            this._oDimension = oDimension;
            this._oParameterizationRequest = oParameterizationRequest;
            this._oValueSetResult = {};
            this._oFilterExpression = null;
            this._oSortExpression = null;
        },

        /**
         * Set the parameterization request required for retrieving dimension members of a parameterized query
         *
         * @param oParameterizationRequest Request object for interactions with the parameterization of this query
         */
        setParameterizationRequest: function (oParameterizationRequest) {
            this._oParameterizationRequest = oParameterizationRequest;
        },

        /**
         * Specify which components of the dimension shall be included in the value set.
         *
         * @param bIncludeText Indicator whether or not to include the parameter text (if available) in the value set.
         *   Pass null to keep current setting.
         * @param aAttributeName Array of dimension attribute names to be included in the result.
         *   Pass null to keep current setting.
         */
        includeDimensionTextAttributes: function (bIncludeText, aAttributeName) {
            if (bIncludeText != null) {
                this._oValueSetResult.text = bIncludeText;
            }
            if (aAttributeName != null) {
                this._oValueSetResult.attributes = aAttributeName;
            }
        },

        /**
         * Get the filter expression for this request.
         *
         * Expressions are represented by separate objects. If none exists so far, a new expression object gets created.
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression}
         *   The filter object associated to this request.
         */
        getFilterExpression: function () {
            if (this._oFilterExpression == null) {
                var oEntityType = this._oDimension.getContainingQueryResult().getEntityType();
                this._oFilterExpression = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression(oEntityType
                    .getModel(), oEntityType.getSchema(), oEntityType);
            }
            return this._oFilterExpression;
        },

        /**
         * Set the filter expression for this request.
         *
         * Expressions are represented by separate objects.
         * Calling this method replaces the filter object maintained by this request.
         *
         * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression} oFilter
         *   The filter object to be associated with this request.
         */
        setFilterExpression: function (oFilter) {
            this._oFilterExpression = oFilter;
        },

        /**
         * Get the sort expression for this request.
         *
         * Expressions are represented by separate objects.
         * If none exists so far, a new expression object gets created.
         *
         * @returns {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortExpression}
         *   The sort object associated to this request.
         */
        getSortExpression: function () {
            if (this._oSortExpression == null) {
                var oEntityType = this._oQueryResult.getEntityType();
                this._oSortExpression = new sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortExpression(oEntityType
                    .getModel(), oEntityType.getSchema(), oEntityType);
            }
            return this._oSortExpression;
        },

        /**
         * Set the sort expression for this request.
         *
         * Expressions are represented by separate objects.
         * Calling this method replaces the sort object maintained by this request.
         *
         * @param {sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.SortExpression} oSorter
         *   The sort object to be associated with this request.
         */
        setSortExpression: function (oSorter) {
            this._oSortExpression = oSorter;
        },

        /**
         * Get indicator whether or not master data are available for this dimension
         *
         * @returns {boolean} True iff the master data are available
         */
        hasMasterDataAvailable: function () {
            return false; // TODO support to be added
        },

        /**
         * Get the value of an query option for the OData request URI corresponding to this request.
         *
         * @param {String} sQueryOptionName Identifies the query option: $select, $filter,... or any custom query option
         * @returns {String} The value of the requested query option or null, if this option is not used for the OData request.
         */
        getURIQueryOptionValue: function (sQueryOptionName) {
            var sQueryOptionValue = null;

            switch (sQueryOptionName) {
                case "$select": {
                    var sSelectOption = "";
                    sSelectOption += (sSelectOption == "" ? "" : ",")
                        + this._oDimension.getKeyProperty().name;
                    if (this._oValueSetResult.text == true && this._oDimension.getTextProperty()) {
                        sSelectOption += (sSelectOption == "" ? "" : ",")
                            + this._oDimension.getTextProperty().name;
                    }
                    if (this._oValueSetResult.attributes) {
                        for (var i = -1, sAttrName; sAttrName = this._oValueSetResult.attributes[++i];) {
                            sSelectOption += (sSelectOption == "" ? "" : ",")
                                + this._oDimension.findAttributeByName(sAttrName).getName();
                        }
                    }
                    sQueryOptionValue = (sSelectOption || null);
                    break;
                }
                case "$filter": {
                    var sFilterOption = null;
                    if (this._oFilterExpression) {
                        sFilterOption = this._oFilterExpression.getURIFilterOptionValue();
                    }
                    sQueryOptionValue = (sFilterOption || null);
                    break;
                }
                case "$orderby": {
                    var sSortOption = null;
                    if (this._oSortExpression) {
                        sSortOption = this._oSortExpression.getURIOrderByOptionValue();
                    }
                    sQueryOptionValue = (sSortOption || null);
                    break;
                }
                default:
                    break;
            }

            return sQueryOptionValue;
        },

        /**
         * Get the unescaped URI to fetch the dimension members, optionally augmented by text and attributes.
         *
         * @param {String} sServiceRootURI (optional) Identifies the root of the OData service
         * @returns {String} The unescaped URI that contains the OData resource path and OData system
         *   query options to express the request for the parameter value set.
         */
        getURIToDimensionMemberEntries: function (sServiceRootURI) {
            // construct resource path
            var sResourcePath = null;
            if (this._oDimension.getContainingQueryResult().getParameterization()) {
                if (!this._oParameterizationRequest) {
                    throw "Missing parameterization request";
                } else {
                    sResourcePath = this._oParameterizationRequest.getURIToParameterizationEntry(sServiceRootURI)
                        + "/"
                        + this._oDimension.getContainingQueryResult().getParameterization().getNavigationPropertyToQueryResult();
                }
            } else {
                sResourcePath = (sServiceRootURI || "") + "/"
                    + this._oDimension.getContainingQueryResult().getEntitySet().getQName();
            }

            // construct query options
            var sSelectOption = this.getURIQueryOptionValue("$select");
            var sFilterOption = this.getURIQueryOptionValue("$filter");
            var sSortOption = this.getURIQueryOptionValue("$orderby");

            var sURI = sResourcePath;
            var bQuestionmark = false;

            if (sSelectOption) {
                sURI += "?$select=" + sSelectOption;
                bQuestionmark = true;
            }
            if (this._oFilterExpression && sFilterOption) {
                if (!bQuestionmark) {
                    sURI += "?";
                    bQuestionmark = true;
                } else {
                    sURI += "&";
                }
                sURI += "$filter=" + sFilterOption;
            }
            if (this._oSortExpression && sSortOption) {
                if (!bQuestionmark) {
                    sURI += "?";
                    bQuestionmark = true;
                } else {
                    sURI += "&";
                }
                sURI += "$orderby=" + sSortOption;
            }
            return sURI;
        },

        /**
         * Private member attributes
         */
        _oDimension: null,
        _oParameterizationRequest: null,
        _oFilterExpression: null,
        _oSortExpression: null,
        _oValueSetResult: null
    };

    // Desirable extensions:
    // - Another class for representing value help entities to
    // specifiy text properties, attribute properties (with association to
    // sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Parameter and sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.Dimension)
    // - ParameterValueSetRequest: Add option to read values from separate entity
    // set (sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.ParameterValueSetRequest)
    // - DimensionMemberSetRequest: Add option to read values from separate master data entity
    // set (sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.DimensionMemberSetRequest)
    // DONE - value rendering: Add support for types other than string
    // (sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.helper.renderPropertyKeyValue)
    // - filter expressions are validated against filter restriction annotations
    // (sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression)
    // - Implemenentation of filter expressions shall use SAPUI5 class sap.ui.model.Filter. Problem:
    // This class does not provide accessor methods for object attributes.
    // (sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.FilterExpression)
    // - Shield API implementation from direct access to object properties.
    // Introduce closures for this purpose.

    /**
     * Pattern: sap.ushell.components.tiles.indicatorTileUtils.odata4analytics.QueryResult = (function ($){ var _init = func
     *
     * var class = function(oEntityType, oEntitySet, oParameterization) {
     * _init(oEntityType, oEntitySet, oParameterization); }; }; return class;
     * })(jQuery);
     */

    return {};
}, /* bExport= */ true);
