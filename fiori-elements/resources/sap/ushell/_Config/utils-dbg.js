// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview Utility functions for sap/ushell/Config.
 *
 * @private
 */
sap.ui.define([
], function () {
    "use strict";

    /**
     * Separates the piece of a path that belongs to the given contract and the
     * piece that doesn't.
     *
     * @param {string} sPath
     *   The path, *must* start with '/'.
     *
     * @param {object} oContract
     *   The configuration contract. In other words, a plain object describing
     *   the structure of the configuration.
     *
     * @return {object}
     *   An object indicating what part of the path belongs to the contract and
     *   what part doesn't. Note that the path that belongs to the contract is
     *   returned as a string, and the one that doesn't is returned as an
     *   array, as shown in the example below:
     *<pre>
     *   {
     *      contractPart: "/root/child1/child2",
     *      nonContractPart: ["child3", "child4", "leaf"]
     *   }
     *</pre>
     *
     * @private
     */
    function identifyContractParts (sPath /* starting with '/' */, oContract) {
        var aContractPart = [];
        var aNonContractPart = [];
        var oContractSoFar = oContract;
        var bContractPathFound = false;
        var aPath = sPath.split("/");
        aPath.shift(); // discard empty first item
        aPath.forEach(function (sPiece) {
            if (!bContractPathFound && oContractSoFar.hasOwnProperty(sPiece)) {
                oContractSoFar = oContractSoFar[sPiece];
                aContractPart.push(sPiece);
                return;
            }
            bContractPathFound = true;
            aNonContractPart.push(sPiece);
        });

        return {
            contractPart: "/" + aContractPart.join("/"), // leading slash: easy emit
            nonContractPart: aNonContractPart            // return array: easy iteration later
        };
    }

    /**
     * Determines whether the given object looks like a UI5 binding context.
     * This function assumes that if the given object has a 'isA' method, then
     * it's an object that belongs to the "sap.ui" namespace.
     *
     * @param {variant} v
     *   Any value.
     *
     * @return {boolean}
     *   Whether the given argument represents a
     *   <code>sap.ui.model.Context</code>.
     * @private
     */
    function isBindingContext (v) {
        return v && v.isA && v.isA("sap.ui.model.Context");
    }

    /**
     * Small utility to write a value into a plain object at the given path.
     *
     * This function assumes that the given path and the object to write into
     * are located within the given path of a "container" object, that is
     * a bigger object that contains the given object.
     *
     * This function throws
     *
     * @param {string} sContainerPath
     *   The path of the object that contains <code>oObject</code>. This is
     *   used to have a more descriptive error message.
     * @param {array} aPath
     *   The path to search within <code>oObject</code>.
     * @param {object} oObject
     *   The object where <code>vValue</code> is to be written.
     * @param {variant} vValue
     *   The value to be written.
     * @private
     */
    function writeObject (sContainerPath, aPath, oObject, vValue) {
        var oDataSoFar = oObject;
        aPath.forEach(function (sPartPiece, iIdx) {
            if (iIdx === aPath.length - 1) {
                oDataSoFar[sPartPiece] = vValue;
                return;
            }

            if (!oDataSoFar.hasOwnProperty(sPartPiece)) {
                throw new Error("Cannot find " + sPartPiece + " inside " + sContainerPath);
            }

            // drill down
            oDataSoFar = oDataSoFar[sPartPiece];
        });
    }

    /**
     * Creates a function that can be used to prepend the contract path as the
     * prefix of a non-contract path.
     *
     * @param {variant} vPropertyToPrefixMapping
     *   The property-to-prefix mapping (object), or just the prefix to prepend
     *   (string).
     *
     * @return {function}
     *   The prefix prepender, a function that takes a string indicating a path
     *   , and returns the string with the right prefix prepended.
     * @private
     */
    function createPrefixPrepender (vPropertyToPrefixMapping) {
        var fnPrependPrefix = function (sPath) {
            return vPropertyToPrefixMapping + sPath;
        };

        if (typeof vPropertyToPrefixMapping === "object") {
            var sSep = "/";

            fnPrependPrefix = function (sPath) {
                var aParts = sPath.split(sSep);
                aParts.shift();
                var sFirstChild = aParts.shift();

                return vPropertyToPrefixMapping[sFirstChild] + (
                    aParts.length > 0
                        ? sSep + aParts.join(sSep)
                        : ""
                );
            };
        }

        return fnPrependPrefix;
    }

    /**
     * Constructs a path relative to the config channel contract (the full path)
     * from a path relative to the model.
     *
     * @param {string} sPath
     *   The path relative to the model. Must start with '/'.
     * @param {variant} [vMaybeBindingContext]
     *   The binding context the given <code>sPath</code> is bound to.
     * @param {variant} vPropertyToPrefixMapping
     *   The property to prefix mapping. Holds the model path prefix if the
     *   model was created from a single path, or a property-to-path-prefix
     *   mapping if the model was created from multiple paths.
     * @return {string}
     *   The full path, relative to the config channel.
     * @private
     */
    function constructFullPath (sPath, vMaybeBindingContext, vPropertyToPrefixMapping) {
        var fnPrependPrefix = createPrefixPrepender(vPropertyToPrefixMapping);
        var sFullPath = fnPrependPrefix(sPath);
        if (isBindingContext(vMaybeBindingContext) && sPath.charAt(0) !== "/") {
            var sRelativePath = vMaybeBindingContext.getPath() + "/" + sPath;
            sFullPath = fnPrependPrefix(sRelativePath);
        }

        return sFullPath;
    }


    /**
     * Overwrites properties that allow to write in the constructed UI5 model,
     * namely <code>#setProperty</code> and <code>#setData</code>, allowing to
     * emit in the configuration instead.
     *
     * @param {object} oFlpConfigChannel
     *   The FLP config channel.
     * @param {object} oChannelContract
     *   The channel contract.
     * @param {object} oModel
     *   The UI5 model.
     * @param {variant} vPropertyToPrefixMapping
     *   The property to prefix mapping. Holds the model path prefix if the
     *   model was created from a single path, or a property-to-path-prefix
     *   mapping if the model was created from multiple paths.
     *
     * @return {object}
     *   A "sealed" model, where calling <code>setData</code> throws and
     *   calling setProperty causes an event to be emitted against the
     *   configuration channel.
     * @private
     */
    function sealModel (oFlpConfigChannel, oChannelContract, oModel, vPropertyToPrefixMapping) {

        // we need to reflect model changes in the configuration
        oModel.setData = function (sPath, vData) {
            throw new Error("not yet implemented");
        };

        oModel.setProperty = function (sPath, vData, vMaybeBindingContext) {
            var sFullPath = constructFullPath(sPath, vMaybeBindingContext, vPropertyToPrefixMapping);
            var oIdentification = identifyContractParts(sFullPath, oChannelContract);

            if (oIdentification.nonContractPart.length === 0) {
                oFlpConfigChannel.emit(oIdentification.contractPart, vData);
                return;
            }

            var oBaseObject = oFlpConfigChannel.last(oIdentification.contractPart);

            writeObject(
                oIdentification.contractPart,
                oIdentification.nonContractPart,
                oBaseObject,
                vData
            );

            oFlpConfigChannel.emit(oIdentification.contractPart, oBaseObject);
        };

        return oModel;
    }


    /**
     *
     * Creates a UI5 model that is updated automatically when a configuration
     * property changes and vice versa.
     *
     * @param {object} oFlpConfigChannel
     *   The event channel to create the model from
     *
     * @param {object} oChannelContract
     *   The channel contract
     *
     * @param {variant} vPathOrDefinition
     *   The path (as string) or several paths that point to the model (an
     *   object).
     *
     * @param {function} Constructor
     *   The constructor of the model. This is mainly used to avoid a
     *   dependency as this code is used during bootstrap. This argument can be
     *   the constructor of a model. Should really be
     *   <code>sap.ui.models.json.JSONModel</code>.
     * @private
     */
    function createModel (oFlpConfigChannel, oChannelContract, vPathOrDefinition, Constructor) {
        var oModel,
            fnSetProperty,
            fnSetData,
            vPropertyToPrefixMapping;

        if (typeof vPathOrDefinition === "string") {
            // Path that points to a non leaf node of the configuration
            var sChannelPath = vPathOrDefinition;

            vPropertyToPrefixMapping = sChannelPath;

            // validation only: in this case path must point to an object
            var vInitialData = oFlpConfigChannel.last(sChannelPath);
            if (Object.prototype.toString.apply(vInitialData) !== "[object Object]") {
                throw new Error("Cannot bind on leaf property of Configuration: '" + sChannelPath + "'");
            }
            oModel = new Constructor(vInitialData);
            fnSetData = oModel.setData.bind(oModel);

            oFlpConfigChannel.on(sChannelPath).do(function (vData) {
                fnSetData(vData);
            });

            return sealModel(oFlpConfigChannel, oChannelContract, oModel, vPropertyToPrefixMapping);
        }

        if (Object.prototype.toString.apply(vPathOrDefinition) === "[object Object]") {
            // An map of key to path to create the model from
            var oDefinition = vPathOrDefinition;

            // 1. define the initial set of data that make up the model
            var oModelData = Object.keys(oDefinition).reduce(function (oModelData, sKey) {
                var sPath = oDefinition[sKey];
                // initial data (makes sure model is created with data)
                oModelData[sKey] = oFlpConfigChannel.last(sPath);

                // 3. when data change, update model
                oFlpConfigChannel.on(sPath).do(function (sKey, vData) {
                    fnSetProperty("/" + sKey, vData);
                }.bind(null, sKey));

                return oModelData;
            }, { } /* oModelData */);

            // 2. create model with initial data
            oModel = new Constructor(oModelData);
            fnSetProperty = oModel.setProperty.bind(oModel);

            return sealModel(oFlpConfigChannel, oChannelContract, oModel, oDefinition);
        }

        throw new Error("Invalid parameter provided to createModel. Must be an object or a string.");
    }

    return {
        createModel: createModel
    };

}, false);
