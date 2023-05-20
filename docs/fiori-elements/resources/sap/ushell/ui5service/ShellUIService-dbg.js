// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The ShellUIService UI5 service
 *
 * @version 1.113.0
 */

/**
 * @namespace sap.ushell.ui5service.ShellUIService
 *
 * @public
 */

sap.ui.define([
    "sap/ui/core/service/ServiceFactoryRegistry",
    "sap/ui/core/service/ServiceFactory",
    "sap/ui/core/service/Service",
    "./_ShellUIService/shelluiservice.class.factory"
], function (ServiceFactoryRegistry, ServiceFactory, Service, fnDefineClass) {
    "use strict";

    // this function is designed for the qUnit test to inject the stubbed dependencies
    // directly into the module. Without this function, it's impossbile to stub the
    // dependency modules since they are only available inside this module.
    return fnDefineClass({
        serviceRegistry: ServiceFactoryRegistry,
        serviceFactory: ServiceFactory,
        service: Service
    });
}, true /* bExport */);
