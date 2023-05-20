// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview UI5 Service Factory
 *
 * Exposes methods to create a UI5 Service Factory for a specific Unified Shell
 * Service.
 *
 * @version 1.113.0
 */

/**
 * @namespace sap.ushell.Ui5ServiceFactory
 *
 * @private
 */

sap.ui.define([
    "sap/ui/core/service/ServiceFactory",
    "sap/ui/core/service/Service",
    "sap/base/Log",
    "sap/base/util/ObjectPath",
    "sap/base/util/isPlainObject"
], function (ServiceFactory, Service, Log, ObjectPath, isPlainObject) {
    "use strict";

    var sActiveComponentId;

    /**
     * Sets the id of the active component, that is, the component allowed
     * to call public methods of this service.
     *
     * @param {string} sId
     *    The id of the active component.
     * @private
    */
    function setActiveComponentId (sId) {
        sActiveComponentId = sId;
    }

    /**
     * Getter for the id of the active component.
     *
     * @returns {string}
     *   The id of the component currently active in the Launchpad.
     * @private
     */
    function getActiveComponentId () {
        return sActiveComponentId;
    }

    /**
     * Determines if the given method name looks like a public method.
     *
     * @param {string} sMethodToSetup
     *    A method name
     * @returns {boolean}
     *    Whether the given method looks like a public method
     * @private
     */
    function isPublicMember (sMethodToSetup) {
        // no leading underscore
        return !!/^[^_].+/.test(sMethodToSetup);
    }

    /**
     * Returns all the properties of an object (owned and not owned).
     *
     * @param {object} oObject
     *    An object.
     *
     * @returns {array}
     *    The names of the object properties (owned and not).
     *
     * @private
     */
    function getAllProperties (oObject) {
        var sProperty,
            aProperties = [];

        for (sProperty in oObject) {
            aProperties.push(sProperty);
        }

        return aProperties;
    }

        /**
     * Wraps a given public service interface method with a check that
     * determines whether the method can be called. This helps preventing
     * cases in which calling the method would disrupt the functionality of
     * the currently running app.  For example, this check would prevent a
     * still alive app to change the header title while another app is
     * being displayed.
     *
     * @param {object} oPublicServiceContext
     *  The context in which the public service was created.
     *
     * @param {object} oPublicServiceInstance
     *  The instance of the public service interface.
     *
     * @param {string} sPublicServiceMethod
     *  The method to be wrapped with the check.
     *
     * @private
     */
    function addCallAllowedCheck (oPublicServiceContext, oPublicServiceInstance, sPublicServiceMethod) {
        var fnOriginalMethod = oPublicServiceInstance[sPublicServiceMethod];

        oPublicServiceInstance[sPublicServiceMethod] = function () {
            var i,
                aArgs, sComponentId = getActiveComponentId();

            if (!oPublicServiceContext || oPublicServiceContext.scopeObject.getId() !== sComponentId) {
                Log.warning(
                    "Call to " + sPublicServiceMethod + " is not allowed",
                    "This may be caused by an app component other than the active '"
                    + sComponentId + "' that tries to call the method",
                    "sap.ushell.Ui5ServiceFactory"
                );
                return undefined; // eslint
            }

            // clone args to allow Chrome to optimize addCallAllowedCheck
            aArgs = new Array(arguments.length);
            for (i=0; i < aArgs.length; ++i) {
              aArgs[i] = arguments[i];
            }

            return fnOriginalMethod.apply(oPublicServiceInstance, aArgs);
        };
    }

    /**
     * Adds public methods from the Ushell service instance to the public
     * service instance exposed to the applications.
     *
     * <p>All public method are bound to the private service instance, because
     * private services and members are not exposed, and there would be
     * problems if a public method (exposed) calls a private one (like
     * 'this._privateMethod').  We want the 'this' to be the private service
     * always in these cases.</p>
     *
     * <p>Also all public methods are wrapped with a 'call check protection'
     * which prevent that a public method is called from a component that is
     * not active anymore. Only the currently active component can call
     * ui5service methods.</p>
     *
     * @param {object} oUshellServiceInstance
     *  The private service interface.
     *
     * @param {object} oPublicServiceInstance
     *  The public service instance.
     *
     * @param {object} oPublicServiceContext
     *  The public service context.
     *
     * @param {boolean} bAddCallProtection Whether to add call protection check, a mechanism to prevent
     *  non-active applications to call public methods which might interfere with the currently active application
     *  experience (e.g., setting a title from application B while application A is currently visible).
     *
     * @private
     */
    function setPublicMethods (oUshellServiceInstance, oPublicServiceInstance, oPublicServiceContext, bAddCallProtection) {

        getAllProperties(oUshellServiceInstance)
            .filter(isPublicMember)
            .filter(function (sName) {
                // copy all public functions/members
                var vValue = oUshellServiceInstance[sName];
                oPublicServiceInstance[sName] = vValue;

                return typeof vValue === "function";
            })
            .forEach(function (sFunctionName) { // special function treatment

                oPublicServiceInstance[sFunctionName] =
                    oPublicServiceInstance[sFunctionName].bind(
                        oUshellServiceInstance);

                if (bAddCallProtection) {
                    // add protection check on each public method
                    addCallAllowedCheck(oPublicServiceContext, oPublicServiceInstance, sFunctionName);
                }
            });
    }

    /**
     * Checks whether the given context is a valid context
     *
     * @param {object} oContext
     *   the context to check.
     *
     * @return {boolean}
     *   whether the given context is a valid context.
     *
     * @private
     */
    function isValidContext (oContext) {
        var fnGetId;

        if (typeof oContext === "undefined") {
            return true; // undefined is ok -> (when factory get method used)
        }

        if (!isPlainObject(oContext)) {
            return false;
        }

        if (!oContext.scopeType) {
            return false;
        }

        fnGetId = ObjectPath.get("scopeObject.getId", oContext);
        if (typeof fnGetId !== "function") {
            return false;
        }

        return true;
    }

    /**
     * Get an object representing the public service.
     *
     * <p>This object will include only public members and methods of the
     * Unified Shell service. The context of all public methods will be bound
     * to the Unified Shell service instance, to allow private methods and
     * members to still be reachable when the public method is invoked.</p>
     *
     * <p>To avoid components of two different applications to interfere, all
     * public methods will be wrapped with a 'method invocation check' . This
     * will ensure that only the last component that has instantiated the
     * service can invoke methods of the service. This check will not be active
     * if the service is consumed via
     * <code>sap.ui.core.service.ServiceFactoryRegistry#get("sap.ushell.ui5service.<service>").createInstance()</code>
     * </p>
     *
     * @param {object} oPublicServiceContext
     *  The context in which the public service is created. This can be undefined,
     *  or an object like:
     *  <pre>
     *      {
     *          scopeObject: <the ui5 root component>,
     *          scopeType: "component"
     *      }
     *  </pre>
     *
     * An <code>undefined<code> value indicates that
     * <code>sap.ui.core.service.ServiceFactoryRegistry#get("sap.ushell.ui5service.<service>").createInstance()</code>
     * was used to obtain the service. In this case public methods of the service
     * will not be wrapped with
     * component therefore we must skip the check on the method call.
     *
     *
     * @param {object} oUshellService
     *  An instance of a Unified Shell service.
     * @param {boolean} bAddCallProtection Whether to add call protection check, a mechanism to prevent
     *  non-active applications to call public methods which might interfere with the currently active application
     *  experience (e.g., setting a title from application B while application A is currently visible).
     *
     * @returns {object}
     *  An object containing the public methods and members of the given
     *  Unified Shell service.
     *
     * @private
     */
    function getServiceInfo (oPublicServiceContext, oUshellService, bAddCallProtection) {
        var oPublicService = {};

        if (bAddCallProtection) {
            bAddCallProtection = typeof oPublicServiceContext === "object";
        }

        setPublicMethods(
            oUshellService,
            oPublicService,
            oPublicServiceContext,
            bAddCallProtection
        );

        if (bAddCallProtection
            && oPublicServiceContext.scopeType === "component"
            && oPublicServiceContext.scopeObject
            && oPublicServiceContext.scopeObject.getId) { // scopeObject : app component

            setActiveComponentId(oPublicServiceContext.scopeObject.getId());
        }

        return oPublicService;
    }

    /**
     * Returns a Unified Shell Service asynchronously.
     *
     * @param {string} sUshellServiceName
     *   The Unified Shell service name.
     *
     * @return {Promise}
     *   An ES6 promise that resolves with an instance of the specified
     *   Unified Shell service.
     * @private
     */
    function getServiceAsync (sUshellServiceName) {
        return sap.ushell.Container.getServiceAsync(sUshellServiceName);
    }

    /**
     * Creates (an instance of) a UI5 Service Factory for a specific Unified
     * Shell Service under the
     * <code>sap.ushell.ui5service.${ushellServiceName}Factory.</code>
     *
     * <p>This factory can be registered into a UI5 factory registry via
     * <code>sap.ui.core.service.ServiceFactoryRegistry#register</code>.  UI5
     * can then pull the factory from this registry and use it to create an
     * injectable UI5 service.</p>
     *
     * <p>When the ui5 service is created, it will be registered under the
     * <code>sap.ushell.ui5service.${ushellServiceName} namespace.</code></p>
     *
     * @param {string} sUshellServiceName
     *  The name of a Unified Shell Service (no namespace).
     * @param {boolean} bAddCallProtection Whether to add call protection check, a mechanism to prevent
     *  non-active applications to call public methods which might interfere with the currently active application
     *  experience (e.g., setting a title from application B while application A is currently visible).
     *
     * @return {object}
     *   A factory that can create an instance of a public UI5 service.
     * @private
     */
    function createServiceFactory (sUshellServiceName, bAddCallProtection) {

        var Ui5ServiceFactory = ServiceFactory.extend("sap.ushell.ui5service." + sUshellServiceName + "Factory", {

            createInstance: function (oPublicServiceContext) {

                return new Promise(function (fnResolve, fnReject) {

                    getServiceAsync(sUshellServiceName).then(function (oUshellService) {
                        var oUi5ServiceInstance,
                            oUi5ServiceInfo,
                            Ui5Service;

                        if (!isValidContext(oPublicServiceContext)) {
                            Log.error(
                                "Invalid context for " + sUshellServiceName + " service interface",
                                "The context must be empty or an object like { scopeType: ..., scopeObject: ... }",
                                "sap.ushell.Ui5ServiceFactory"
                            );
                            fnReject("Invalid Context for " + sUshellServiceName + " service");
                            return;
                        }

                        oUi5ServiceInfo = getServiceInfo(oPublicServiceContext, oUshellService, bAddCallProtection);

                        // Alternative approach is to use
                        // Service.create(oUi5ServiceInfo), but this causes
                        // UI5 anonymous service implementation to hide public
                        // members of oUi5ServiceInfo.
                        Ui5Service = Service.extend("sap.ushell.ui5service." + sUshellServiceName, {
                            getInterface: function () {
                                return oUi5ServiceInfo;
                            }
                        });

                        oUi5ServiceInstance = new Ui5Service(oPublicServiceContext);

                        fnResolve(oUi5ServiceInstance);
                    }, function (oGetServiceError) {
                        fnReject(oGetServiceError);
                    });
                });
            }
        });

        return new Ui5ServiceFactory();
    }

    return {
        createServiceFactory: createServiceFactory
    };

});
