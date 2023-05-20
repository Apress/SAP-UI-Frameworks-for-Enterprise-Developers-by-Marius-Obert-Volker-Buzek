// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The extensions for the ShellHeader
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/EventHub"
], function (EventHub) {
    "use strict";

    /**
     * Use only in Fiori3
     *
     * Set the control in the central area of header.
     * @param {String} id The id of the control which should be shown in the central area of the header
     * @param {Boolean} currentState Flag, to set the control only for the current state.
     * @param {List} [states] The list of the states where control should be shown. This parameter is ignored when currentState is true.
     *  If this parameter is not set and current state is false, then all states will be updated.
     *
     * @private
     * @since 1.63
     */
    function setHeaderCentralAreaElement (id, currentState, states) {
        EventHub.emit("setHeaderCentralAreaElement", {
            id: id,
            currentState: currentState,
            states: states
        });
    }

    return {
        setHeaderCentralAreaElement: setHeaderCentralAreaElement
    };
});
