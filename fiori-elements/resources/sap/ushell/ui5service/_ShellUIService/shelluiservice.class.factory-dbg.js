// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/base/EventProvider",
    "sap/ui/thirdparty/hasher",
    "sap/base/util/isPlainObject",
    "sap/base/util/Version",
    "sap/base/Log",
    "sap/ushell/utils/UrlParsing",
    "sap/ui/core/Configuration"
], function (
    EventProvider,
    hasher,
    isPlainObject,
    Version,
    Log,
    UrlParsing,
    Configuration
    ) {
    "use strict";

    return function (oSetting) {
        var ServiceFactoryRegistry = oSetting.serviceRegistry,
            ServiceFactory = oSetting.serviceFactory,
            Service = oSetting.service;

        var sLastSetTitle;

        var oEventProvider = new EventProvider();

        var O_EVENT_NAME = {
            hierarchyChanged: "hierarchyChanged",
            relatedAppsChanged: "relatedAppsChanged",
            titleChanged: "titleChanged",
            backNavigationChanged: "backNavigationChanged"
        };

        var sActiveComponentId;

        /**
         * Returns an instance of the ShellUIService. This constructor must only be
         * called internally by the Fiori Launchpad renderer and never by
         * applications.
         *
         * Instead, this service should be consumed by app components as described
         * in the overview section of this class.
         *
         * @name sap.ushell.ui5service.ShellUIService
         * @class
         *
         * @classdesc The Unified Shell's ShellUIService service.
         *
         * This service allows apps to interact with the Fiori Launchpad UI.
         * The service is injected in the app components by the FLP renderer
         * before the corresponding apps start. To consume the service,
         * app components should declare it in their manifest.json as follows:
         *
         * <pre>
         * {
         *    ...
         *    "sap.ui5": {
         *       "services" : {
         *          "ShellUIService": {
         *              "factoryName": "sap.ushell.ui5service.ShellUIService"
         *          }
         *       }
         *    }
         *    ...
         * }
         * </pre>
         *
         * The service can be then retrieved and consumed from the app root component
         * as in the following example:
         * <pre>
         * // Component.js (the app root component)
         * ...
         * this.getServiceAsync("ShellUIService").then( // promise is returned
         *    function (oService) {
         *       oService.setTitle("Application Title");
         *    },
         *    function (oError) {
         *       Log.error("Cannot get ShellUIService", oError, "my.app.Component");
         *    }
         * );
         * ...
         * </pre>
         *
         * The ShellUIService can work together with the routing defined in a UI5
         * app to set title and hierarchy automatically, as the navigation within
         * the app occurs. This can be achieved by enabling the ShellUIService to
         * load instantly and configuring one or both <code>setTitle</code> and
         * <code>setHierarchy</code> options to
         * <code>auto</code> in the app manifest, as shown in the example below:
         *
         * <pre>
         * {
         *    "sap.ui5": {
         *       "services" : {
         *          "ShellUIService": {
         *              "lazy": false,
         *              "factoryName": "sap.ushell.ui5service.ShellUIService",
         *              "settings": {
         *                  "setHierarchy": "auto",
         *                  "setTitle": "auto"
         *              }
         *          }
         *       }
         *    }
         * }
         * </pre>
         *
         * Please note that the <code>setHierarchy</code> or <code>setTitle</code>
         * methods should not be actively called by the application when title and
         * hierarchy are set automatically.
         *
         * <strong>Note:</strong> Please be aware that the sapFiori2Adaptation configuration
         * of the application may cause the ShellUIService service to work incorrectly.
         * We recommend to disable the sapFiori2Adaptation configuration for the new applications
         * if you use ShellUIService.
         *
         * @param {object} oCallerContext
         *   The context in which the service was instantiated. Must have the
         *   format:
         * <pre>
         * {
         *   scopeType: "component",
         *   scopeObject: [a UI5 Component in the sap.ushell package]
         * }
         * </pre>
         *
         * @public
         * @extends sap.ui.core.service.Service
         * @since 1.38.0
         */
        var ShellUIService = Service.extend("sap.ushell.ui5service.ShellUIService", /** @lends sap.ushell.ui5service.ShellUIService# */ {
            init: function () {
                /*
                 * Service injection
                 */
                var that = this,
                    oPublicInterface = this.getInterface();

                // Only one component can set/get at a given time. Here we try to
                // avoid that no yet-to-be-destroyed apps call set/get methods by
                // giving priority to the last instantiated component.
                oPublicInterface.init = function () {
                    that._amendPublicServiceInstance.call(
                        that, // always the "private" service
                        this // public service instance
                    );
                };

                ServiceFactoryRegistry.register(
                    "sap.ushell.ui5service.ShellUIService",
                    new ServiceFactory(oPublicInterface)
                );
            },
            /**
             * Sets the id of the active component, that is, the component allowed
             * to call public methods of this service. This method is mainly here
             * for supportability purposes.
             *
             * @param {string} sId
             *    The id of the active component.
             * @private
             * @since 1.38.0
             */
            _setActiveComponentId: function (sId) {
                sActiveComponentId = sId;
            },
            /**
             * Getter for the id of the active component.  This method is mainly
             * here for supportability purposes.
             *
             * @returns {string}
             *   The id of the component currently active in the Launchpad.
             * @private
             * @since 1.38.0
             */
            _getActiveComponentId: function () {
                return sActiveComponentId;
            },
            /*
             * Determines whether the hierarchy should be set automatically
             * using the UI5 router for the given App component.
             *
             * @param {object} oAppComponent
             *   The UI5 App root component.
             *
             * @returns {boolean}
             *   Whether the hierarchy should be set automatically in the given
             *   app component.
             *
             * @private
             * @since 1.44.0
             */
            _shouldEnableAutoHierarchy: function (oAppComponent) {
                return typeof oAppComponent.getManifestEntry === "function"
                    && oAppComponent.getManifestEntry("/sap.ui5/services/ShellUIService/settings/setHierarchy") === "auto";
            },
            /*
             * Determines whether the title should be set automatically using the
             * UI5 router for the given App component.
             *
             * @param {object} oAppComponent
             *   The UI5 App root component.
             *
             * @returns {boolean}
             *   Whether the title should be set automatically in the given
             *   app component.
             *
             * @private
             * @since 1.44.0
             */
            _shouldEnableAutoTitle: function (oAppComponent) {
                return typeof oAppComponent.getManifestEntry === "function"
                    && oAppComponent.getManifestEntry("/sap.ui5/services/ShellUIService/settings/setTitle") === "auto";
            },
            /**
             * Enables automatic <code>setHierarchy</code> calls based on
             * UI5 Router on the given app component.
             *
             * @param {object} oAppComponent
             *   The UI5 root app component with a router.
             *
             * @private
             * @since 1.44.0
             */
            _enableAutoHierarchy: function (oAppComponent) {
                var that = this;
                var oRouter = oAppComponent.getRouter && oAppComponent.getRouter();
                if (!oRouter) {
                    Log.error(
                        "Could not enable automatic setHierarchy on the current app",
                        "Router could not be obtained on the app root component via getRouter",
                        "sap.ushell.ui5service.ShellUIService"
                    );
                    return;
                }

                oRouter.attachTitleChanged(function (oEvent) {
                    var aHistory = oEvent.getParameter("history");
                    that.setHierarchy(aHistory.reverse().map(function (oUi5HierarchyItem) {
                        var sShellHash = that._getCurrentShellHashWithoutAppRoute();

                        return {
                            title: oUi5HierarchyItem.title,
                            intent: sShellHash + "&/" + oUi5HierarchyItem.hash
                        };
                    }));
                });
            },
            /**
             * Enables automatic <code>setTitle</code> calls based on
             * UI5 Router on the given app component.
             *
             * @param {object} oAppComponent
             *   The UI5 root app component with a router.
             *
             * @private
             * @since 1.44.0
             */
            _enableAutoTitle: function (oAppComponent) {
                var that = this;
                var oRouter = oAppComponent.getRouter && oAppComponent.getRouter();
                if (!oRouter) {
                    Log.error(
                        "Could not enable automatic setTitle on the current app",
                        "Router could not be obtained on the app root component via getRouter",
                        "sap.ushell.ui5service.ShellUIService"
                    );
                    return;
                }

                // set the initial title
                var oTitleHistory = oRouter.getTitleHistory()[0];
                if (oTitleHistory && oTitleHistory.title) {
                    setTimeout(function () {
                        that.setTitle(oTitleHistory.title);
                    }, 0);
                }

                oRouter.attachTitleChanged(function (oEvent) {
                    // set title after navigation
                    var sTitle = oEvent.getParameter("title");
                    that.setTitle(sTitle);
                });
            },
            /**
             * Helper function that returns the Hash part of the current URL
             * without the inner app hash part.
             *
             * @returns {string}
             *   The intent (i.e., URL hash) without any inner app hash part.
             *
             * @private
             * @since 1.44.0
             */
            _getCurrentShellHashWithoutAppRoute: function () {
                var sFullURL = "#" + hasher.getHash();
                var sURLHashWithParams = UrlParsing.getShellHash(sFullURL);

                if (!sURLHashWithParams) {
                    Log.error(
                        "Cannot get the current shell hash",
                        "UrlParsing service returned a falsy value for " + sFullURL,
                        "sap.ushell.ui5service.ShellUIService"
                    );
                    return "";
                }

                return "#" + sURLHashWithParams;
            },
            /**
             * Getter for the event provider.  This method is mainly
             * here for supportability purposes.
             *
             * @returns {object}
             *   The event provider
             * @private
             * @since 1.38.0
             */
            _getEventProvider: function () {
                return oEventProvider;
            },
            /**
             * Getter for the title.  This method is mainly
             * here for supportability purposes.
             *
             * @returns {object}
             *   The event provider
             * @private
             * @since 1.38.0
             */
            _getLastSetTitle: function () {
                return sLastSetTitle;
            },

            /**
             * Ensures that the given argument is an array of object, having all string values.
             * This method logs an error message in case this is not the case.
             *
             * <pre>
             * IMPORTANT: this method must not rely on its context when called or
             * produce side effects.
             * </pre>
             *
             * @param {variant} vArg
             *   Any value.
             * @param {string} sMethodName
             *   The name of the method that called this function.
             * @returns {boolean}
             *   Whether <code>vArg</code> is a string. Logs an error message
             *   reporting <code>sMethodName</code> in case <code>vArg</code> is
             *   not a string.
             *
             * @private
             * @since 1.38.0
             */
            _ensureArrayOfObjectOfStrings: function (vArg, sMethodName) {
                var bValidates = Array.isArray(vArg) && vArg.every(function (oObject) {
                    return isPlainObject(oObject)
                        && Object.keys(oObject).length > 0
                        && Object.keys(oObject).every(function (sKey) {
                            return typeof oObject[sKey] === "string";
                        });
                });

                if (!bValidates) {
                    Log.error(
                        "'" + sMethodName + "' was called with invalid parameters",
                        "An array of non-empty objects with string values is expected",
                        "sap.ushell.ui5service.ShellUIService"
                    );
                }

                return bValidates;
            },

            /**
             * Ensures that the given argument is a function, logging an error
             * message in case it's not.
             *
             * <pre>
             * IMPORTANT: this method must not rely on its context when called or
             * produce side effects.
             * </pre>
             *
             * @param {variant} vArg
             *   Any value.
             * @param {string} sMethodName
             *   The name of the method that called this function.
             * @returns {boolean}
             *   Whether <code>vArg</code> is a function. Logs an error message
             *   reporting <code>sMethodName</code> in case <code>vArg</code> is
             *   not a function.
             *
             * @private
             * @since 1.38.0
             */
            _ensureFunction: function (vArg, sMethodName) {
                var sType = typeof vArg;
                if (sType !== "function") {
                    Log.error(
                        "'" + sMethodName + "' was called with invalid arguments",
                        "the parameter should be a function, got '" + sType + "' instead",
                        "sap.ushell.ui5service.ShellUIService"
                    );
                    return false;
                }
                return true;
            },

            /**
             * Ensures that the given argument is a string, logging an error
             * message in case it's not.
             *
             * <pre>
             * IMPORTANT: this method must not rely on its context when called or
             * produce side effects.
             * </pre>
             *
             * @param {variant} vArg
             *   Any value.
             * @param {string} sMethodName
             *   The name of the method that called this function.
             * @returns {boolean}
             *   Whether <code>vArg</code> is a string. Logs an error message
             *   reporting <code>sMethodName</code> in case <code>vArg</code> is
             *   not a string.
             *
             * @private
             * @since 1.38.0
             */
            _ensureString: function (vArg, sMethodName) {
                var sType = typeof vArg;
                if (sType !== "string") {
                    Log.error(
                        "'" + sMethodName + "' was called with invalid arguments",
                        "the parameter should be a string, got '" + sType + "' instead",
                        "sap.ushell.ui5service.ShellUIService"
                    );
                    return false;
                }
                return true;
            },

            /**
             * Wraps a given public service interface method with a check that
             * determines whether the method can be called. This helps preventing
             * cases in which calling the method would disrupt the functionality of
             * the currently running app.  For example, this check would prevent a
             * still alive app to change the header title while another app is
             * being displayed.
             *
             * @param {object} oPublicServiceInstance
             *  The instance of the public service interface.
             * @param {string} sPublicServiceMethod
             *  The method to be wrapped with the check.
             *
             * @private
             * @since 1.38.0
             */
            _addCallAllowedCheck: function (oPublicServiceInstance, sPublicServiceMethod) {
                var that = this;
                oPublicServiceInstance[sPublicServiceMethod] = function () {
                    var oContext = oPublicServiceInstance.getContext(); // undefined -> don't authorize

                    if (!oContext || oContext.scopeObject.getId() !== sActiveComponentId) {
                        Log.warning(
                            "Call to " + sPublicServiceMethod + " is not allowed",
                            "This may be caused by an app component other than the active '" + sActiveComponentId + "' that tries to call the method",
                            "sap.ushell.ui5service.ShellUIService"
                        );
                        return undefined; // eslint
                    }

                    if (sPublicServiceMethod === "setHierarchy" /* app called setHierarchy... */
                        && oContext.scopeType === "component"
                        && oContext.scopeObject
                        && that._shouldEnableAutoHierarchy(oContext.scopeObject) /* ... but should be called automatically */) {
                        Log.warning(
                            "Call to " + sPublicServiceMethod + " is not allowed",
                            "The app defines that setHierarchy should be called automatically",
                            "sap.ushell.ui5service.ShellUIService"
                        );
                        return undefined; // eslint
                    }
                    if (sPublicServiceMethod === "setTitle" /* app called setHierarchy... */
                        && oContext.scopeType === "component"
                        && oContext.scopeObject
                        && that._shouldEnableAutoTitle(oContext.scopeObject) /* ... but should be called automatically */) {
                        Log.warning(
                            "Call to " + sPublicServiceMethod + " is not allowed",
                            "The app defines that setTitle should be called automatically",
                            "sap.ushell.ui5service.ShellUIService"
                        );
                        return undefined; // eslint
                    }

                    return that[sPublicServiceMethod].apply(oPublicServiceInstance, arguments);
                };
            },
            /**
             * Adjusts the method of the public service instance.
             * Specifically:
             * <ul>
             * <li>Adds safety checks to public methods</li>
             * <li>Register the component that called <code>.getService</code> as
             *     the currently active component.
             * </ul>
             *
             * @param {sap.ui.base.Interface} oPublicServiceInstance
             *    The public service interface.
             *
             * @private
             * @since 1.38.0
             */
            _amendPublicServiceInstance: function (oPublicServiceInstance) {
                var that = this,
                    oContext;

                // attempt to register this as the "active component"

                oContext = oPublicServiceInstance.getContext();
                if (typeof oContext === "undefined") {
                    // ServiceFactoryRegistry#get static method was used on the
                    // service factory to obtain the service. Don't record the
                    // currently active component so that future call from an
                    // active app succeed. E.g., on view change.
                    //
                    return;
                }

                // must re-bind all public methods to the public interface
                // instance, as they would be otherwise called in the context of
                // the service instance.
                ["setTitle", "setHierarchy", "setRelatedApps", "setBackNavigation"].forEach(function (sMethodToSetup) {
                    that._addCallAllowedCheck(oPublicServiceInstance, sMethodToSetup);
                });

                var oAppComponent = oContext.scopeObject;
                if (oContext.scopeType === "component" && oAppComponent) {
                    this._setActiveComponentId(oAppComponent.getId());

                    if (this._shouldEnableAutoHierarchy(oAppComponent)) {
                        this._enableAutoHierarchy(oAppComponent);
                    }
                    if (this._shouldEnableAutoTitle(oAppComponent)) {
                        this._enableAutoTitle(oAppComponent);
                    }

                    return;
                }

                Log.error(
                    "Invalid context for ShellUIService interface",
                    "The context must be empty or an object like { scopeType: ..., scopeObject: ... }",
                    "sap.ushell.ui5service.ShellUIService"
                );
            },

            /**
             * Displays the given hierarchy in the shell header.
             *
             * @param {object[]} [aHierarchyLevels]
             *    An array representing hierarchies of the currently displayed
             *    app.  The array should specify title, icon, and
             *    navigation intent as shown in the following example:
             *
             * <pre>
             * [
             *     {
             *         title: "Main View",
             *         icon: "sap-icon://documents",
             *         intent: "#Action-sameApp"
             *     },
             *     {
             *         title: "View 2",
             *         subtitle: "Application view number 2",
             *         intent: "#Action-sameApp&/View2/"
             *     },
             *     {
             *         title: "View 3",
             *         subtitle: "Application view number 3",
             *         intent: "#Action-sameApp&/View3/"
             *     }
             * ]
             * </pre>
             *
             * The default app hierarchy is applied if no parameter is given.
             *
             * @since 1.38.0
             * @public
             */
            setHierarchy: function (aHierarchyLevels) {
                /*
                 * IMPORTANT: this method may be called in the context of the
                 * service or the public service instance. In the latter case
                 * "this" has no access to private methods.
                 */

                // validate input
                if (typeof aHierarchyLevels !== "undefined"
                    && !ShellUIService.prototype._ensureArrayOfObjectOfStrings(aHierarchyLevels, "setHierarchy")) {
                    return;
                }

                var oComponent = this.getContext().scopeObject;

                oEventProvider.fireEvent(O_EVENT_NAME.hierarchyChanged, {
                    data: aHierarchyLevels,
                    component: oComponent
                });
            },
            /**
             * Displays the given title in the shell header. This method should not
             * be called if the app calling the method is not currently displayed
             * in the Fiori Launchpad.
             *
             * @param {string} [sTitle]
             *    The new title. The default title is set if this argument is not given.
             *
             * @since 1.38.0
             * @public
             */
            setTitle: function (sTitle) {
                /*
                 * IMPORTANT: this method may be called in the context of the
                 * service or the public service instance. In the latter case
                 * "this" has no access to private methods.
                 */

                // validate input
                if (typeof sTitle !== "undefined"
                    && !ShellUIService.prototype._ensureString(sTitle, "setTitle")) {
                    return;
                }

                var oComponent = this.getContext().scopeObject,
                    oEventData;

                sLastSetTitle = sTitle;
                oEventData = {
                    data: sTitle,
                    component: oComponent
                };
                if (typeof arguments[1] === "boolean" && arguments[1]) {
                    oEventData.bAcceptEmptyString = true;
                }
                oEventProvider.fireEvent(O_EVENT_NAME.titleChanged, oEventData);
            },
            /**
             * Displays the back button in the shell header.
             *
             * @param {function} [fnCallback]
             *    A callback function called when the button is clicked in the UI.
             *
             * @since 1.38.0
             * @private
             * @ui5-restricted sap.fe, sap.suite.ui.generic
             */
            setBackNavigation: function (fnCallback) {
                /*
                 * IMPORTANT: this method may be called in the context of the
                 * service or the public service instance. In the latter case
                 * "this" has no access to private methods.
                 */

                // validate input
                if (typeof fnCallback !== "undefined"
                    && !ShellUIService.prototype._ensureFunction(fnCallback, "setBackNavigation")) {
                    return;
                }

                var oComponent = this.getContext().scopeObject;

                oEventProvider.fireEvent(O_EVENT_NAME.backNavigationChanged, {
                    data: fnCallback,
                    component: oComponent
                });
            },
            /**
             * Returns the title that was last set via {@link setTitle}.
             *
             * @returns {string}
             *    The title that was last set via {@link setTitle}.
             *
             * @since 1.38.0
             * @public
             */
            getTitle: function () {
                return this._getLastSetTitle();
            },
            /**
             * Used by apps to set related apps.  This setting is propagated
             * towards the Shell Header via corresponding events.
             *
             * @param {object[]} [aRelatedApps]
             *    an array of related apps, for example like:
             *
             * <pre>
             * [
             *       {
             *           title: "App 1",
             *           icon: "sap-icon://folder",
             *           subtitle: "go to app 1",
             *           intent: "#Action-toapp1"
             *       },
             *       {
             *           title: "App 2",
             *           icon: "sap-icon://folder",
             *           subtitle: "go to app 2",
             *           intent: "#Action-toapp2"
             *       },
             *       {
             *           title: "App 3",
             *           icon: "sap-icon://folder",
             *           subtitle: "go to app 3",
             *           intent: "#Action-toapp3"
             *       }
             * ]
             * </pre>
             *
             * @since 1.40.0
             * @public
             */
            setRelatedApps: function (aRelatedApps) {
                /*
                 * IMPORTANT: this method may be called in the context of the
                 * service or the public service instance. In the latter case
                 * "this" has no access to private methods.
                 */

                // validate input
                if (typeof aRelatedApps !== "undefined"
                    && !ShellUIService.prototype._ensureArrayOfObjectOfStrings(aRelatedApps, "setRelatedApps")) {
                    return;
                }

                var oComponent = this.getContext().scopeObject;

                oEventProvider.fireEvent(O_EVENT_NAME.relatedAppsChanged, {
                    data: aRelatedApps,
                    component: oComponent
                });
            },
            /**
             * Returns version number in use (e.g. 2 for Fiori 2.0). Will be used
             * for checking whether the Fiori 2.0 header should be used or not.
             *
             * @returns {number}
             *    the version number
             *
             * @since 1.38.0
             * @private
             */
            getUxdVersion: function () {
                // use 1.37.0 to include cases where the snapshot is used
                if ((new Version(Configuration.getVersion()).compareTo("1.37.0")) >= 0) {
                    return 2;
                }
                return 1;
            },
            _attachHierarchyChanged: function (fnFunction) {
                this._getEventProvider().attachEvent(O_EVENT_NAME.hierarchyChanged, fnFunction);
            },
            _detachHierarchyChanged: function (fnFunction) {
                this._getEventProvider().detachEvent(O_EVENT_NAME.hierarchyChanged, fnFunction);
            },
            _attachTitleChanged: function (fnFunction) {
                this._getEventProvider().attachEvent(O_EVENT_NAME.titleChanged, fnFunction);
            },
            _attachBackNavigationChanged: function (fnFunction) {
                this._getEventProvider().attachEvent(O_EVENT_NAME.backNavigationChanged, fnFunction);
            },
            _detachBackNavigationChanged: function (fnFunction) {
                this._getEventProvider().detachEvent(O_EVENT_NAME.backNavigationChanged, fnFunction);
            },
            _detachTitleChanged: function (fnFunction) {
                this._getEventProvider().detachEvent(O_EVENT_NAME.titleChanged, fnFunction);
            },
            _attachRelatedAppsChanged: function (fnFunction) {
                this._getEventProvider().attachEvent(O_EVENT_NAME.relatedAppsChanged, fnFunction);
            },
            _detachRelatedAppsChanged: function (fnFunction) {
                this._getEventProvider().detachEvent(O_EVENT_NAME.relatedAppsChanged, fnFunction);
            }
        });

        return ShellUIService;
    };
});
