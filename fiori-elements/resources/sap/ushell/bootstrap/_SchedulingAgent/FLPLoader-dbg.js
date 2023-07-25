// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/EventHub",
    "sap/ui/core/Component"
], function (EventHub, Component) {
    "use strict";

    var FLPLoader = {

        /**
         * Start the loading of a component with an event.
         *
         * @param {{eventName: string, eventData: object}} componentEvent An object containing
         *      the name and the data needed to emit the loading event through the EventHub.
         *
         * @protected
         */
        loadComponentByEvent: function (componentEvent) {
            EventHub.emit(componentEvent.eventName, componentEvent.eventData);
        },

        /**
         * Start the loading of a component with Component.create.
         *@param {{sStepName: string, oData: object}} oStepConfig step config
         *     sStepName: loading mode
         *     oData: the data needed to be passed to the Component.create
         *     @see sap.ui.core.Component.create
         *     Examples:
         *     {string} componentOptions.name The name of the component to be created. This is the dot-separated name of the
         *     package that contains the Component.js module.
         *     {boolean} componentOptions.manifest If a manifest json file has to be loaded.
         *
         * @returns {Promise<string>} A Promise that resolves/reject with sStepName.
         * @protected
         */
        loadComponentByComponentCreate: function (oStepConfig) {
            return Component.create(oStepConfig.oData).then(function () {
                return Promise.resolve(oStepConfig.sStepName);
            }, function () {
                return Promise.reject(oStepConfig.sStepName);
            });
        },

        /**
         * Start the loading of a component with sap.ui.require.
         *
         * @param {string} sPath the path where the dependency is located
         * @see sap.ui.require
         * Examples:
         * {string} sap/ushell/designtime/PageComposition.extension
         * @returns {Promise<Object>} A Promise that resolves with the dependency at the specified <code>sPath</code>.
         * @protected
         */
        loadComponentByRequire: function (sPath) {
            return new Promise(function (fnResolve, fnReject) {
                sap.ui.require([sPath], function (oDependency) {
                    fnResolve(oDependency);
                });
            });
        },

        /**
         * Sets a timeout. This kind of step should enable the scheduler to wait an arbitrary amounts of time.
         * Do use with care!
         *
         * @param {{sStepName: string, iWaitingTime: number}} waitingObject An object containing the name of the step
         *      setting the timeout and an integer giving the duration in ms of said timeout
         * @protected
         */
        waitInMs: function (waitingObject) {
            setTimeout(function () {
                EventHub.emit("StepDone", waitingObject.sStepName);
            }, waitingObject.iWaitingTime);
        },

        /**
         * Place-holder. No need to implement yet.
         */
        directLoading: function () {}

    };

    return FLPLoader;

}, false);
