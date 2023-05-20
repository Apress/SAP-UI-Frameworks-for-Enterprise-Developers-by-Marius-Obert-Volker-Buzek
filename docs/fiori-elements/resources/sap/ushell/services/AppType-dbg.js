// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/library",
    "sap/ushell/utils/AppType"
], function (library, AppTypeUtils) {
    "use strict";

    /**
     * AppType object.
     * Enumeration for application types.
     * Used by the AppConfiguration service in order to add activities of certain types.
     * This enumeration has been moved to the sap.ushell library.
     *
     * @private
     * @deprecated since 1.94. Please use {@link sap.ushell.library.AppType} instead.
     */
    var oAppType = JSON.parse(JSON.stringify(library.AppType));

    oAppType.getDisplayName = AppTypeUtils.getDisplayName;

    return oAppType;
});
