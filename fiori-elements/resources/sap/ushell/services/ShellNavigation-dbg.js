// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Shell Navigation Service.
 */
sap.ui.define([
    "sap/ushell/services/ShellNavigationHashChanger",
    "sap/m/MessageBox",
    "sap/ui/core/routing/HashChanger"
], function (ShellNavigationHashChanger, MessageBox, HashChanger) {
    "use strict";

    // shortcut for sap.m.MessageBox.Action
    var Action = MessageBox.Action;

    // shortcut for sap.m.MessageBox.Icon
    var Icon = MessageBox.Icon;

    /* global hasher */

    /**
     * The Unified Shell's internal navigation service (platform independent)
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (ShellNavigation) {});</code>.
     * Constructs a new instance of the shell navigation service.
     *
     * Note that the shell instantiation mechanism has to assure exactly one instance is created (!)
     *
     * This interface is for consumption by shell renderers/containers only
     *
     * It is not for direct usage by applications, see
     *   inner app navigation : UI5 interfaces (hashChanger, Router)
     *   cross app navigation : @see CrossApplicationNavigation
     *
     * Usage:
     *
     * Example: see renders/fiorisandbox/Shell.controller.js
     *
     *   <pre>
     *   sap.ui.define([
     *      "sap/ushell/services/ShellNavigation"
     *   ], function (ShellNavigation) {
     *       Shell.onHashChange(shellHash,appHash) {  / *resolve url, load app and exchange root view* / }
     *       Shell.init() {
     *         this.privShellNavigator = new ShellNavigation();
     *         this.privShellNavigator.init(jQuery.proxy(this.doHashChange, this));
     *       }
     *   });
     *   </pre>
     *
     * Note: further app specific integration via the reference app reuse code (setting of app specific handler)
     *
     * Note: the ShellNavigation service replaces the UI5 core HashChanger which abstracts from the browser url modification.
     *
     * It performs the following services:
     *   - encoding of the actual browser url hash ( via hasher.js).
     *   - expansion of "shortened" urls ( AppParameterParts) via invocation.
     *   - splitting of shellHash and AppSpecific hash and abstraction w.r.t. Eventing
     *
     * Thus it is crucial to use appropriate interfaces and not directly invoke window.location.hash.
     *
     * - internal construction methods for a "current" App specific and non-app specific hash
     *   (invoked by CrossApplicationNavigation), not to be invoked directly!
     *
     * @name sap.ushell.services.ShellNavigation
     * @param {object} oContainerInterface interface
     * @param {string} sParameters parameters
     * @param {object} oServiceConfiguration configuration
     * @constructor
     * @class
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.15.0
     * @public
     */
    function ShellNavigation (oContainerInterface, sParameters, oServiceConfiguration) {
        function requestReload () {
            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                MessageBox.show("Due to a configuration change on the server,\nclient and server are out of sync.\n We strongly recommend to reload the page soon.\nReload page now?", {
                    icon: Icon.ERROR,
                    title: "Client out of sync with server.",
                    actions: [Action.YES, Action.NO],
                    onClose: function (oAction) {
                        if (oAction === Action.YES) {
                            window.setTimeout(function () {
                                window.location.reload();
                            }, 0);
                        }
                    }
                });
            });
        }

        var oServiceConfig = oServiceConfiguration && oServiceConfiguration.config;

        // instantiate and exchange the HashChanger from UI5
        this.hashChanger = new ShellNavigationHashChanger(oServiceConfig);

        this._navigationFilterForForwardingToRegisteredRouters = function (AppLifeCycle, sHash) {
            var bMatchedFLPRouters = this._aRouters.some(function (oRouter) {
                return oRouter.match(sHash);
            });

            if (bMatchedFLPRouters) {
                var oCurrentApplication = AppLifeCycle.getCurrentApplication();
                var bIsApp = oCurrentApplication && oCurrentApplication.componentInstance && !oCurrentApplication.homePage;

                if (bIsApp) {
                    var oAppRouter = oCurrentApplication.componentInstance.getRouter();

                    if (oAppRouter) {
                        // Avoid unexpected route matched in the application
                        oAppRouter.stop();
                    }
                }
                return this.NavigationFilterStatus.Keep;
            }
            return this.NavigationFilterStatus.Continue;
        };

        /////////////////////////////// api for external usage

        /**
         * Returns the current navigation context.
         *
         * @returns {object}
         *   An object like:
         *   <pre>
         *   {
         *      "status": sap.ushell.NavigationState.Navigating,
         *      "isCrossAppNavigation": true,
         *      "innerAppRoute": "employee/overview"
         *   }
         *   </pre>
         *
         *   This object can be used inside dirty flag providers to take
         *   corresponding actions.
         *
         * @protected
         */
        this.getNavigationContext = function () {
            var oNavigationState = this.hashChanger.getCurrentNavigationState();
            var bIsExternalNavigation = !this.hashChanger.isInnerAppNavigation(oNavigationState.oldHash, oNavigationState.newHash);

            return {
                status: oNavigationState.status,
                isCrossAppNavigation: bIsExternalNavigation,
                innerAppRoute: this.hashChanger.getHash()
            };
        };

        /**
         * Returns a Boolean value indicating whether only the initial navigation occcurred or if already any additional
         * navigation step was tracked.
         *
         * Note: There is a difference between the initial navigation and the first position in the navigation history: The function
         * returns <code>false</code> after having returned to the first "FLP entry" via back navigation although this might be
         * the same history position as the initial navigation. <code>true</code> is only returned as long as
         * no further navigation happened, indepdent of the current history position.
         *
         * @returns {boolean} Whether the first navigation occurred (true) or a successive navigation occurred (false).
         * @see {@link sap.ushell.services.ShellNavigationHashChanger#isInitialNavigation}
         * @private
         */
        this.isInitialNavigation = function () {
            return this._bIsInitialNavigation;
        };

        /**
         * Set the value of the property this._bIsInitialNavigation.
         *
         * @private
         */
        this.setIsInitialNavigation = function (isInitialNavigation) {
            this._bIsInitialNavigation = isInitialNavigation;
        };

        /**
         * Returns a string which can be put into the DOM (e.g. in a link tag)
         * Please use CrossApplicationNavigation service and do not invoke this method directly if you are an application.
         *
         * @param {Object} oArgs object encoding a semantic object and action, e.g.:
         *   <pre>
         *   {
         *     target: {
         *       semanticObject: "AnObject",
         *       action: "Action"
         *     },
         *     params: { A: "B" }
         *   }
         *   </pre>
         *   or
         *   <pre>{ target: { shellHash: "SO-36&jumper=postman" } } </pre>
         * @param {boolean} [bVerbose] whether the response should be returned in verbose format.
         *   If this flag is set to true, this function returns an object instead of a string.
         * @param {object} [oComponent] an optional instance of sap.ui.core.UIComponent
         * @param {boolean} [bAsync] indicates whether the method should return the result asynchronously.
         *   When set to <code>true</code>, the method returns a jQuery Deferred object that is resolved only
         *   after the URLShortening save operation is completed.
         * @returns {object} <p>a string that can be put into an href attribute of an HTML anchor.
         *   The returned string will always start with a hash character.</p>
         *   <p>
         *   In case the <b>bVerbose</b> parameter is set to true, an object that wraps the result string will be returned instead:
         *   <pre>
         *   {
         *     hash : {string},
         *     params : {object}
         *     skippedParams : {object}
         *   }
         *   </pre>
         *   </p>
         *   where:
         *   <ul>
         *     <li><code>params</code> is an object containing non-truncated parameters</li>
         *     <li><code>skippedParams</code> is an object containing truncated parameters if truncation occurred or undefined if not</li>
         *   </ul>
         * @methodOf sap.ushell.services.ShellNavigation#
         * @name hrefForExternal
         * @since 1.15.0
         * @private
         */
        this.hrefForExternal = function (oArgs, bVerbose, oComponent, bAsync) {
            return this.hashChanger.hrefForExternal(oArgs, bVerbose, oComponent, bAsync);
        };

        /**
         * returns a string which can be put into the DOM (e.g. in a link tag) given an app specific hash suffix,
         * (it may shorten the app specific parts of the url to fit browser restrictions)
         *
         * @param {string} sAppHash Applicatiom hash
         * @returns {string} a string which can be put into the link tag,
         *   containing the current shell hash as prefix and the specified application hash as suffix
         *   example: hrefForAppSpecificHash("View1/details/0/") returns "#MyApp-Display&/View1/details/0/"
         * @methodOf sap.ushell.services.ShellNavigation#
         * @name parseShellHash
         * @since 1.15.0
         * @private
         */
        this.hrefForAppSpecificHash = function (sAppHash) {
            return this.hashChanger.hrefForAppSpecificHash(sAppHash);
        };

        /**
         * compact the parameter object, if required a number of parameters will be removed, instead a corresponding
         * "sap-intent-param" containing a key of an appstate representing the removed parameters will be inserted
         *
         * @param {object} oParams A parameter object
         * @param {Array} [aRetainedParameters] An array of string value of parameters which shall not be compacted
         *   The array may contains a *-terminated string, which will match and strings with the same prefix
         *   ( e.g. "sap-*" will match "sap-ushell", "sap-wd", "sap-" etc. )
         * @param {Object} [oComponent] optional, a SAP UI5 Component
         * @param {boolean} [bTransient] whether an transient appstate is sufficient
         * @returns {promise} a promise, whose first argument of resolve is
         * @protected
         */
        this.compactParams = function (oParams, aRetainedParameters, oComponent, bTransient) {
            return this.hashChanger.compactParams(oParams, aRetainedParameters, oComponent, bTransient);
        };

        /**
         * Navigate to an external target
         *
         * @param {Object} oArgs configuration object describing the target, e.g.:
         *   {
         *     target : { semanticObject : "AnObject", action: "Action" },
         *     params : { A : "B" }
         *   }
         *   constructs sth like http://....ushell#AnObject-Action?A=B ....
         *   and navigates to it.
         * @param {Object} oComponent optional, a SAP UI5 Component
         * @param {boolean} bWriteHistory writeHistory whether to create a history record (true, undefined) or replace the hash (false)
         * @returns {Promise<void>} A Promise which resolves once the navigation was triggered
         *
         * @private
         */
        this.toExternal = function (oArgs, oComponent, bWriteHistory) {
            return this.hashChanger.toExternal(oArgs, oComponent, bWriteHistory);
        };

        /**
         * Constructs the full shell hash and sets it, thus triggering a navigation to it
         *
         * @param {string} sAppHash specific hash
         * @param {boolean} bWriteHistory if true it adds a history entry in the browser if not it replaces the hash
         * @private
         */
        this.toAppHash = function (sAppHash, bWriteHistory) {
            this.hashChanger.toAppHash(sAppHash, bWriteHistory);
        };

        // Lifecycle methods

        /**
         * Initializes ShellNavigation
         *
         * This function should be used by a custom renderer in order to implement custom navigation.
         * Do not use this function for developing Fiori applications.
         *
         * This method should be invoked by the Shell in order to:
         *   - Register the event listener
         *   - Register the container callback for the (currently single) ShellHash changes.
         *
         * Signature of the callback function
         *   sShellHashPart,  // The hash part on the URL that is resolved and used for application loading
         *   sAppSpecificPart // Typically ignored
         *   sOldShellHashPart, // The old shell hash part, if exist
         *   sOldAppSpecificPart, // The old app hash part, if exist
         *
         * @param {function} fnShellCallback The callback method for hash changes
         * @returns {object} this
         * @public
         * @alias sap.ushell.services.ShellNavigation#init
         */
        this.init = function (fnShellCallback) {
            this._bIsInitialNavigation = true;
            hasher.prependHash = "";
            HashChanger.replaceHashChanger(this.hashChanger);
            var oBus = sap.ui.getCore().getEventBus();
            oBus.subscribe("sap.ui.core.UnrecoverableClientStateCorruption", "RequestReload", requestReload);
            this.hashChanger.initShellNavigation(fnShellCallback);

            this._enableHistoryEntryReplacedDetection();

            return this;
        };

        /**
         * Allows to detect how was the last hash changed at low levels, before events are emitted by the HashChanger.
         * This is useful to handle data loss cancellation. After the confirmation dialog is cancelled,
         * we need to restore the hash correctly based on the direction and on whether setHash (adds a new history entry)
         * or replaceHash (no history entry) was last used.
         *
         * For example, when the user went backwards via browser back button.
         *
         * NOTE: relies on "hasher" available as a global variable.
         * Records the last hash change mode in the "_lastHashChangeMode" member, which can have values:
         *   <ul>
         *     <li>"setHash" when hasher.setHash is called</li>
         *     <li>"replaceHash" when hasher.replaceHash is called</li>
         *   </ul>
         *
         * @private
         */
        this._enableHistoryEntryReplacedDetection = function () {
            this._lastHashChangeMode = null;

            this._fnOriginalSetHash = hasher.setHash;
            this._fnOriginalReplaceHash = hasher.replaceHash;

            hasher.setHash = function () {
                this._hashChangedByApp = true;
                this._lastHashChangeMode = "setHash";
                return this._fnOriginalSetHash.apply(hasher, arguments);
            }.bind(this);

            hasher.replaceHash = function () {
                this._hashChangedByApp = true;
                this._lastHashChangeMode = "replaceHash";
                return this._fnOriginalReplaceHash.apply(hasher, arguments);
            }.bind(this);
        };

        /**
         * Returns true if the history entry was replaced immediately after the last navigation.
         * To be useful, this method should be called immediately after the hash enters the URL
         * but before the target application is finally navigated to.
         *
         * This method should not be used externally.
         * It's reserved uniquely for internal shell consumption and its signature or result might change at any time.
         *
         * @returns {boolean} Whether <code>hasher#replaceHash</code> was called after the last navigation.
         * @protected
         */
        this.wasHistoryEntryReplaced = function () {
            return this._lastHashChangeMode === "replaceHash";
        };

        /**
         * Resets the internal flag used to track whether the last navigation is made via hasher#setHash or hasher#replaceHash.
         * This method should be called after a navigation is successfully made to a target application to avoid returning
         * an inconsistent answer when calling <code>#wasHistoryEntryReplaced</code>.
         * An inconsistent answer might occur when a navigation is made via forward/back button without
         * passing via <code>hasher#replaceHash</code> or <code>hasher#setHash</code>.
         *
         * This method should not be used externally.
         * It's reserved uniquely for internal shell consumption and its signature or result might change at any time.
         *
         * @protected
         */
        this.resetHistoryEntryReplaced = function () {
            this._lastHashChangeMode = null;
        };

        /**
         * Rewrite the hash fragment identifier without triggering any navigation at
         *
         * @param {string} sNewHash new hash fragment
         *
         * @protected
         */
        this.replaceHashWithoutNavigation = function (sNewHash) {
            hasher.changed.active = false; //disable changed signal
            this._fnOriginalSetHash(sNewHash); //set hash without dispatching changed signal
            hasher.changed.active = true; //re-enable signal
        };

        /**
         * The navigation filter statuses that should be returned by a navigation filter
         * @see sap.ushell.services.ShellNavigation.registerNavigationFilter
         * @alias sap.ushell.services.ShellNavigation#registerNavigationFilter
         *
         * Continue - continue with the navigation flow
         * Abandon - stop the navigation flow, and revert to the previous hash state
         * Custom - stop the navigation flow, but leave the hash state as is. The filter should use this status
         *   to provide alternative navigation handling
         *
         */
        this.NavigationFilterStatus = this.hashChanger.NavigationFilterStatus;

        /**
         * Register the navigation filter callback function.
         * A navigation filter provides plugins with the ability to intervene in the navigation flow,
         * and optionally to stop the navigation.
         *
         * The callback has to return @see sap.ushell.services.ShellNavigation.NavigationFilterStatus
         * The callback has to return @alias sap.ushell.services.ShellNavigation#registerNavigationFilter
         *
         * Use <code>Function.prototype.bind()</code> to determine the callback's <code>this</code> or some of its arguments.
         *
         * @param {Object} fnFilter navigation filter function
         */
        this.registerNavigationFilter = function (fnFilter) {
            this.hashChanger.registerNavigationFilter(fnFilter);
        };

        this._aRouters = [];
        this.registerExtraRouter = function (oRouter) {
            this._aRouters.push(oRouter);
        };

        /**
         * Unregister a previously registered navigation filter
         *
         * The callback has to return @see sap.ushell.services.ShellNavigation.NavigationFilterStatus
         * The callback has to return @alias sap.ushell.services.ShellNavigation#unregisterNavigationFilter
         *
         * Note the same filter function that was registered should be passed as a parameter to this method.
         *
         * @param {Object} fnFilter navigation filter function
         */
        this.unregisterNavigationFilter = function (fnFilter) {
            this.hashChanger.unregisterNavigationFilter(fnFilter);
        };

        // this navigation filter must always be the first filter
        this.registerNavigationFilter(function () {
            /**
             * Checks whether the current hashChange event is triggered by the application by calling either
             * setHash or replaceHash method on the HashChanger.
             *
             * If the current hashChange event is triggered by the browser, either call window.history.go (back)
             * or press the browser forward/backward button, the flag this._hashChangedByApp has a falsy value.
             *
             * If the current hashChange isn't triggered by the app, the flag this._lastHashChangeMode is reset
             */
            if (!this._hashChangedByApp) {
                this.resetHistoryEntryReplaced();
            }

            // reset the hashChangedByApp flag
            this._hashChangedByApp = undefined;

            // continue with hashChange event processing
            return this.NavigationFilterStatus.Continue;
        }.bind(this));

        /**
         *This helper allows to register ShellNavigation filters which depend on additional services, which might not be
         * available at constructor time
         * @param {object} AppLifeCycle The AppLifeCycle service
         *
         * @private
         * @since 1.95
         */
        this.registerPrivateFilters = function (AppLifeCycle) {
            // ensure registered Routers get the full hash
            this.registerNavigationFilter(this._navigationFilterForForwardingToRegisteredRouters.bind(this, AppLifeCycle));
        };
    }

    ShellNavigation.hasNoAdapter = true;
    return ShellNavigation;
}, true /* bExport */);
