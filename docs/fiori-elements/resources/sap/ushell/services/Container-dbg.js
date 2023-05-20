// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/Container",
    "sap/base/Log"
], function (
    Container,
    Log
) {
    "use strict";

    /**
     * Constructs a new Unified Shell container for the given container adapter.
     *
     * @param {object} oAdapter the platform-specific adapter corresponding to this service
     * @class
     * @classdesc The Unified Shell's container which manages renderers, services, and adapters.
     * @alias sap.ushell.services.Container
     * @since 1.15.0
     * @deprecated since 1.101
     * @public
     * @hideconstructor
     */

    Log.warning("The use of sap/ushell/services/Container is deprecated. Please use sap/ushell/Container instead!");
    return Container;
});
