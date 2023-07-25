// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/EventHub",
    "sap/ushell/bootstrap/common/common.create.configcontract.core",
    "sap/ushell/_Config/utils"
], function (EventHub, CommonCreateConfigContract, oConfigUtils) {
    "use strict";

    var oChannelContract = CommonCreateConfigContract.createConfigContract(window["sap-ushell-config"]);
    var oFlpConfigChannel = EventHub.createChannel(oChannelContract);

    // expose about the same API as channel
    var oAPI = Object.keys(oFlpConfigChannel).reduce(function (oAPI, sMethod) {
        oAPI[sMethod] = function () {
            if (!oFlpConfigChannel) {
                oFlpConfigChannel = EventHub.createChannel(oChannelContract);
            }

            return oFlpConfigChannel[sMethod].apply(oFlpConfigChannel, arguments);
        };

        return oAPI;
    }, {
        // For testing only
        _reset: function () {
            oFlpConfigChannel = null;
        },
        // TODO: this is now more a replace configuration and must be changed
        // to implement the API from future concept.
        registerConfiguration: function (sOwnerName, oContract) {
            oChannelContract = oContract;
        },

        /**
         * Create a model from a piece of configuration.
         *
         * @param {variant} vPathOrDefinition
         *   A path pointing at a node of the configuration contract. Or an
         *   object pointing at several parts of the configuration contract.
         *   For example:
         *<pre>"/core/shell"</pre>
         *   or:
         *<pre>{ path1: "/core/shell/A", path2: "/core/shell/B" }</pre>
         *
         * @param {function} Constructor
         *   A constructor that constructs a model. The constructor will be
         *   called with an object as an argument and must construct a model,
         *   which is an object with at least a setter. Today we require that
         *   the setter has a method called 'setProperty' that usually writes
         *   in the model based on path specifications and the binding context.
         *   These qualities are fulfilled by the JSONModel constructor from
         *   <code>sap.ui.model.json.JSONModel</code> which is not part of this
         *   module to avoid an unnecessary dependency that comes into play
         *   only when UI5 is fully loaded. Before that time (e.g., during
         *   bootstrap) we should write into the configuration rather than
         *   creating a model.
         *
         * @return {object}
         *   A model where setProperty will be called whenever corresponding
         *   properties on the configuration change.
         *
         * @private
         */
        createModel: function (vPathOrDefinition, Constructor) {
            // Ensures channel is created whenever method is accessed in tests
            // after _reset.
            if (!oFlpConfigChannel) {
                oFlpConfigChannel = EventHub.createChannel(oChannelContract);
            }

            return oConfigUtils.createModel(
                oFlpConfigChannel, oChannelContract, vPathOrDefinition, Constructor
            );
        }
    });

    return oAPI;
}, false);
