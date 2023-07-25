// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The UserStatus UI5 service
 *
 * @version 1.113.0
 */

/**
 * @namespace sap.ushell.ui5service.UserStatus
 *
 * @public
 * @deprecated since 1.70. Support for this service has been discontinued.
 */

sap.ui.define([
    "sap/ui/core/service/ServiceFactoryRegistry",
    "sap/ui/core/service/ServiceFactory",
    "sap/ui/core/service/Service",
    "sap/ui/base/EventProvider"
], function (ServiceFactoryRegistry, ServiceFactory, Service, EventProvider) {
    "use strict";

    var O_EVENT_NAME = {
        statusChanged: "statusChanged",
        serviceStateChanged: "serviceStateChanged"
    };

    var UserStatus = Service.extend("sap.ushell.ui5service.UserStatus", /** @lends sap.ushell.ui5service.UserStatus# */ {
        init: function () {
            // Service injection
            UserStatus.prototype.isEnabled = false;

            ServiceFactoryRegistry.register(
                "sap.ushell.ui5service.UserStatus",
                new ServiceFactory(UserStatus)
            );

            this.oEventProvider = new EventProvider();

            UserStatus.prototype.AvailableStatus = {
                AVAILABLE: "AVAILABLE",
                AWAY: "AWAY",
                BUSY: "BUSY",
                APPEAR_OFFLINE: "APPEAR_OFFLINE"
            };
        },

        exit: function () {
            this.oEventProvider.destroy();
        }
    });

    /**
     * Enable the User Status service (online status)
     *
     * If the user has never agreed to share their online status, then the method will show the opt-in screen to the user.
     * If the user already agreed to share their online status, the setStatus method will be called with the default online status that was set by the user.
     * If the user already declined to share their online status, the setStatus method will be called with a null value.
     *
     * @param {variant} bEnable boolean.
     * @since 1.46
     * @public
     * @deprecated since 1.70
     */
    UserStatus.prototype.setEnabled = function (bEnable) {
        this.oEventProvider.fireEvent(O_EVENT_NAME.serviceStateChanged, {
            data: bEnable
        });
        UserStatus.prototype.isEnabled = bEnable;
        return;
    };

    /**
     * Publish the user status.
     * This method is used to publish the status to other components.
     *
     * The publication of the status by firing the 'statusChanged' event will happen when all the following apply:
     *   1) the User Status service is enabled
     *   2) the status is null or exists in the list of available statuses (sap.ushell.ui5service.UserStatus.prototype.AvailableStatus)
     *   3) the user has agreed to share their online status
     *
     * @param {variant} oNewStatus sap.ushell.ui5service.UserStatus.prototype.AvailableStatus
     * @since 1.46
     * @public
     * @deprecated since 1.70
     */
    UserStatus.prototype.setStatus = function (oNewStatus) {
        if (!UserStatus.prototype.isEnabled) {
            throw new Error("Unable to change status because the UserStatus service is disabled.");
        }

        if (!UserStatus.prototype.AvailableStatus[oNewStatus] && oNewStatus !== null) {
            throw new Error("Enter a valid status.");
        }

        this.oEventProvider.fireEvent(O_EVENT_NAME.statusChanged, {
            data: oNewStatus
        });
    };

    /**
     * Attaches an event handler fnFunction to be called upon the 'statusChanged' event.
     * Event is fired when the setStatus method is called.
     *
     * @param {function} [fnFunction] The function to be called when the event occurs.
     * @since 1.46
     * @public
     * @deprecated since 1.70
     */
    UserStatus.prototype.attachStatusChanged = function (fnFunction) {
        this.oEventProvider.attachEvent(O_EVENT_NAME.statusChanged, fnFunction);
    };

    /**
     * Detaches an event handler from the 'statusChanged' event.
     *
     * @param  {function} fnFunction Event handler to be detached.
     *
     * @since 1.46
     * @public
     * @deprecated since 1.70
     */
    UserStatus.prototype.detachStatusChanged = function (fnFunction) {
        this.oEventProvider.detachEvent(O_EVENT_NAME.statusChanged, fnFunction);
    };

    return UserStatus;
});
