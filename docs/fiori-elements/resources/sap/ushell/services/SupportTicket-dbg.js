// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The SupportTicket service.
 */
sap.ui.define([
    "sap/ushell/Config"
], function (Config) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only, others
     * MUST call <code>sap.ushell.Container.getServiceAsync("SupportTicket").then(function (SupportTicket) {});</code>.
     * Constructs a new instance of the support ticket service.
     *
     * @name sap.ushell.services.SupportTicket
     *
     * @param {object}
     *            oAdapter the service adapter for the support ticket service,
     *            as already provided by the container
     * @param {object}
     *            oContainerInterface the interface provided by the container
     * @param {string}
     *            sParameters the runtime configuration specified in the
     *            <code>sap.ushell.Container.getServiceAsync()</code> call (not
     *            evaluated yet)
     * @param {object}
     *            oServiceConfiguration the service configuration defined in the
     *            bootstrap configuration; the boolean property
     *            <code>enabled</code> controls the service enablement
     *
     * This service is disabled by default. It can be enabled explicitly in the
     * bootstrap configuration of the start page:
     * <pre>
     * window[&quot;sap-ushell-config&quot;] = {
     *     services: {
     *         SupportTicket: {
     *             config: {
     *                 enabled: true
     *             }
     *         }
     *     }
     * }
     *
     * Platform implementations can also enable it dynamically by modification of the
     * bootstrap configuration during boot time.
     *
     * @class The Unified Shell's Support Ticket service
     *
     * @public
     * @constructor
     * @see sap.ushell.services.Container#getServiceAsync
     *
     * @since 1.19.1
     *
     */
    function SupportTicket (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        /**
         * Creates a Support Ticket. Forwards the given data (JSON object) to the associated adapter.
         *
         * @param {object} oSupportTicketData JSON object containing the input fields required for the support ticket.
         * @returns {object} promise
         * @public
         * @alias sap.ushell.services.SupportTicket#createTicket
         * @since 1.20.0
         */
        this.createTicket = function (oSupportTicketData) {
            return oAdapter.createTicket(oSupportTicketData);
        };

        /**
         * Checks if the service is enabled.
         * <p>
         * The service enablement depends on the configuration in the back-end system and the bootstrap configuration.
         *
         * @return {boolean} <code>true</code> if the service is enabled; <code>false</code> otherwise
         *
         * @public
         * @alias sap.ushell.services.SupportTicket#isEnabled
         * @since 1.20.0
         */
        this.isEnabled = function () {
            return Config.last("/core/extension/SupportTicket");
        };
    }

    SupportTicket.hasNoAdapter = false;
    return SupportTicket;
}, true /* bExport */);
