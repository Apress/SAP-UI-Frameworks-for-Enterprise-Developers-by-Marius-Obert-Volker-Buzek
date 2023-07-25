// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/resources",
    "sap/ushell/Config",
    "sap/ushell/utils",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/model/json/JSONModel",
    "sap/m/VBox",
    "sap/ui/core/library",
    "sap/m/library",
    "sap/ushell/ui/launchpad/LoadingDialog",
    "sap/ui/thirdparty/jquery",
    "sap/ui/util/Storage",
    "sap/base/Log",
    "sap/ushell/EventHub",
    "sap/ui/core/Core"
], function (
    oResources,
    Config,
    ushellUtils,
    Dialog,
    Button,
    Text,
    JSONModel,
    VBox,
    coreLibrary,
    mobileLibrary,
    LoadingDialog,
    jQuery,
    Storage,
    Log,
    EventHub,
    Core
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.ui.core.ValueState
    var ValueState = coreLibrary.ValueState;

    var bIsLogoutProcessStarted = false;
    /**
     * Manages the timeout of an FLP session
     * - Announces user activity to the platform (via UShell container service)
     * - Maintains user activity data on local storage to support multi-browser-tab use cases
     * - Notifies the user once the session is about to end, and gets the option of extending the session.
     *
     * Configuration settings
     *   - sessionTimeoutIntervalInMinutes : Session timeout configured by platform
     *   - keepSessionAliveAlertTimeInMinutes : Time before session timeout to display session keep alive popup
     *   - enableAutomaticLogout : When true the session refresh window is omitted and an automatic logoff performed.
     *
     * @param {object} AppLifeCycle The AppLifeCycle service
     */
    var SessionHandler = function (AppLifeCycle) {
        var that = this;
        var bInitialized = false;
        var bLogoutInitialized = false;

        /**
         * Initializes the sessionHandler and starts it
         *
         * @param {object} oConfig The configuration of the SessionHandler
         * @private
         */
        this.init = function (oConfig) {
            /** ===== Debugging Hint =====
             *
             * It may be difficult to debug the session timeout monitoring and the
             * corresponding session timeout warning dialog in multiple browser
             * windows, tabs and sessions. In particular when the Internet Explorer
             * is involved.
             *
             * As a help, you may comment out the following lines,
             * or alternatively set a breakpoint and initiate the commands manually
             * in the console.
             *
             *    Log.setLevel(Log.Level.DEBUG);
             *
             *    // Time span after that a session timeout gets triggered when user was inactive             *
             *    oConfig.sessionTimeoutIntervalInMinutes = 1;
             *
             *    // Time span a session timeout warning dialog appears before the actual timeout happens
             *    oConfig.sessionTimeoutReminderInMinutes = 0.75;
             *
             *    // Automatic signout or reload request dialog (undefined->false)
             *    oConfig.enableAutomaticSignout = true;
             *
             *    debugger;
             */

            Log.debug("SessionHandler.oConfig.sessionTimeoutIntervalInMinutes: " + oConfig.sessionTimeoutIntervalInMinutes, "", "SessionHandler");
            Log.debug("SessionHandler.oConfig.sessionTimeoutReminderInMinutes: " + oConfig.sessionTimeoutReminderInMinutes, "", "SessionHandler");
            Log.debug("SessionHandler.oConfig.enableAutomaticSignout: " + oConfig.enableAutomaticSignout, "", "SessionHandler");

            // Remember configuration and initialize JSON model for session timeout warning dialog
            this.oConfig = oConfig;
            this.oModel = new JSONModel();

            // Initialize time stamp of last user interaction
            this.putTimestampInStorage(this._getCurrentDate());

            this.initLogout();

            this._fnOnVisibilityChange = this.onVisibilityChange.bind(this);

            // Define which user events shall extend the current FLP session
            sap.ushell.Container.getServiceAsync("AppLifeCycle")
                .then(function (oAppLifeCycleService) {
                    this.oAppLifeCycleService = oAppLifeCycleService;
                    this.attachUserEvents();

                    // Initialize session timeout monitoring
                    if (oConfig.sessionTimeoutIntervalInMinutes > 0) {
                        this.attachVisibilityEvents();
                        this.initSessionTimeout();
                    }

                    // Initialize logic to discontinue tile refreshing
                    if (oConfig.sessionTimeoutTileStopRefreshIntervalInMinutes > 0) {
                        this.initTileRequestTimeout();
                    }

                    EventHub.on("nwbcUserIsActive").do(this.userActivityHandler.bind(this));

                    bInitialized = true;
                }.bind(this));
        };

        /**
         * Initialization of the session logout logic
         *
         * @since 1.89.0
         * @private
         */
        this.initLogout = function () {
            if (bLogoutInitialized === false) {
                sap.ushell.Container.registerLogout(this.logout);
                this.registerCommHandlers();
                bLogoutInitialized = true;
            }
        };

        /**
         * Initialization of the session handling logic
         * Steps:
         *   1. Creating the local storage entry for session handling
         *   2. Setting of the local storage property that maintains the time of the last activity
         *
         * @since 1.70.0
         * @private
         */
        this.initSessionTimeout = function () {
            // Default is to show the session timeout message box and not doing automatic logout (kiosk mode)
            if (this.oConfig.enableAutomaticSignout === undefined) {
                this.oConfig.enableAutomaticSignout = false;
            }
            if (this.oConfig.sessionTimeoutReminderInMinutes === undefined) {
                this.oConfig.sessionTimeoutReminderInMinutes = 0;
            }
            this.oModel.setProperty("/SessionRemainingTimeInSeconds", this.oConfig.sessionTimeoutReminderInMinutes * 60);
            this.counter = 0;
            this.oKeepAliveDialog = undefined;
            // Related to sessionTimeoutIntervalInMinutes (e.g., 30 minutes)
            // For updating the server
            this.notifyServer();
            this.monitorUserIsInactive();
        };

        this.registerCommHandlers = function () {
            AppLifeCycle.registerShellCommunicationHandler({
                "sap.ushell.sessionHandler": {
                    oRequestCalls: {
                        logout: {
                            isActiveOnly: false,
                            distributionType: ["URL"]
                        },
                        extendSessionEvent: {
                            isActiveOnly: false,
                            distributionType: ["all"]
                        }
                    },
                    oServiceCalls: {
                        notifyUserActive: {
                            executeServiceCallFn: function (/*oServiceParams*/) {
                                if (bInitialized === true) {
                                    that.userActivityHandler();
                                }
                                return new jQuery.Deferred().resolve().promise();
                            }
                        }
                    }
                }
            });
        };

        /**
         * Monitors if user is not active:
         * Display and handle session timeout warning, initiate session over handling if needed.
         *
         * @param {boolean} [bRescheduleTimer] Flag to reschedule a call of this function when iRemainingTimeUntilDialog is expired. Default is true.
         *
         * @since 1.84.0
         * @private
         */
        this.monitorUserIsInactive = function (bRescheduleTimer) {
            Log.debug("SessionHandler.monitorInactiveUser : Check started", "*****", "SessionHandler");
            bRescheduleTimer = typeof bRescheduleTimer !== "undefined" ? bRescheduleTimer : true;

            // Calculate current timing
            var iTimeLastInteraction = this.timeLastInteraction();
            var iTimePopup = this.timePopup();
            var iTimeNow = this.timeNow();
            var iTimeOver = this.timeOver();
            var iRemainingTimeUntilDialog = iTimePopup - iTimeNow;
            var iTimeSinceLastInteraction = iTimeNow - iTimeLastInteraction;

            Log.debug("SessionHandler.monitorUserIsInactive :: time since last interaction : " + iTimeSinceLastInteraction, "", "SessionHandler");
            Log.debug("SessionHandler.monitorUserIsInactive :: remaining time until dialog : " + iRemainingTimeUntilDialog, "", "SessionHandler");

            // Nothing to do, if not yet time for the session timeout warning dialog
            // ... Schedule next check then
            if (iTimeNow < iTimePopup && bRescheduleTimer) {
                var oMonitorUserIsInactiveTimer = setTimeout(this.monitorUserIsInactive.bind(this), iRemainingTimeUntilDialog * 1000);
                this.oMonitorUserIsInactiveTimer = this.oMonitorUserIsInactiveTimer || oMonitorUserIsInactiveTimer;
                return;
            }

            // Otherwise display session timeout warning dialog, if configured
            if (iTimeNow >= iTimePopup && iTimeNow < iTimeOver
                && this.oConfig.sessionTimeoutReminderInMinutes > 0) {
                // Deactivate user activity monitoring if dialog is active
                this.detachUserEvents();
                this.detachVisibilityEvents();

                // Open session timeout warning dialog
                this.oContinueWorkingDialog = this.createContinueWorkingDialog();
                this.oContinueWorkingDialog.open();
                Log.debug("SessionHandler.monitorUserIsInactive :: Dialog opened", "", "SessionHandler");

                // Handle countdown
                this.monitorCountdown(true);

                // Trigger platform-specific notification
                this._createSystemNotification();
            }

            // Logout if time user was inactive has been exceeded
            if (iTimeNow >= iTimeOver) {
                Log.debug("SessionHandler.monitorUserIsInactive :: Session over detected", "", "SessionHandler");
                this.handleSessionOver();
                return;
            }

            Log.debug("SessionHandler.monitorInactiveUser :: Check done", "*****", "SessionHandler");
        };

        this.handleSessionOver = function () {
            clearTimeout(this.notifyServerTimer);
            Core.getEventBus().publish("launchpad", "sessionTimeout");
            if (this.oConfig.enableAutomaticSignout === true) {
                Log.debug("SessionHandler.handleSessionOver :: Automatic signout gets initiated", "", "SessionHandler");
                this.logout();
            } else {
                Log.debug("SessionHandler.handleSessionOver :: Session expired dialog gets opened", "", "SessionHandler");
                this.createSessionExpiredDialog().open();
            }
        };

        this.notifyServer = function () {
            var timeSinceLastActionInMilliseconds = this._getCurrentDate() - new Date(this.getTimestampFromStorage());
            var timeSinceLastActionInMinutes = timeSinceLastActionInMilliseconds / (1000 * 60);

            //Setting the timeout to be sessionTimeoutIntervalInMinutes / 2 (hence the 30 instead of 60)
            var iTimeout = this.oConfig.sessionTimeoutIntervalInMinutes * 30 * 1000;

            // Last user action happened during the last sessionTimeoutIntervalInMinutes (e.g., 30 min)
            if (timeSinceLastActionInMinutes <= this.oConfig.sessionTimeoutIntervalInMinutes) {
                // call service keepAlive to prevent server session time out before client session time
                sap.ushell.Container.sessionKeepAlive();

                // send post to isolated
                AppLifeCycle.postMessageToIframeApp("sap.ushell.sessionHandler", "extendSessionEvent", {});
            } else {
                // No activity during last server session length - do nothing
            }
            this.notifyServerTimer = setTimeout(this.notifyServer.bind(this), ushellUtils.sanitizeTimeoutDelay(iTimeout));
        };

        /**
         * Monitors countdown of session timeout warning dialog
         *
         * @param {boolean} bIsExternalCall Indicates if monitor call is an initial call or a follow-up check
         * @since 1.84.0
         * @private
         */
        this.monitorCountdown = function (bIsExternalCall) {
            // Debugging
            if (bIsExternalCall) {
                Log.debug("SessionHandler.monitorCountdown :: Initiated from outside", "*****", "SessionHandler");
            } else {
                Log.debug("SessionHandler.monitorCountdown :: Initiated from internal call", "**", "SessionHandler");
            }

            // Calculate current timing
            var iTimeLastInteraction = this.timeLastInteraction();
            var iTimePopup = this.timePopup();
            var iTimeNow = this.timeNow();
            var iTimeOver = this.timeOver();
            var iTimeSinceLastInteraction = iTimeNow - iTimeLastInteraction;

            Log.debug("SessionHandler.monitorCountdown :: timeNow : " + iTimeNow, "", "SessionHandler");
            Log.debug("SessionHandler.monitorCountdown :: iTimeLastInteraction : " + iTimeLastInteraction, "", "SessionHandler");
            Log.debug("SessionHandler.monitorCountdown :: timeSinceLastInteraction : " + iTimeSinceLastInteraction, "", "SessionHandler");
            Log.debug("SessionHandler.monitorCountdown :: iTimeOver : " + iTimeOver, "", "SessionHandler");

            // Click the continue working button automatically,
            // if the user has done so in another session already
            // ... Leave monitorCountdown time then
            if (iTimeNow < iTimePopup) {
                Log.debug("SessionHandler.monitorCountdown :: Auto-click", "<=", "SessionHandler");
                this.continueWorkingButtonPressHandler(true);
                return;
            }

            // Count down if there's time remaining
            // ... for the user to decide
            var iRemainingTimeInSeconds = iTimeOver - iTimeNow;
            if (iRemainingTimeInSeconds > 0) {
                // Expose remaining seconds in model for display

                Log.debug("SessionHandler.monitorCountdown :: Remaining seconds : " + iRemainingTimeInSeconds
                    + " - iTimeOver : " + iTimeOver, "", "SessionHandler");

                this.oModel.setProperty("/SessionRemainingTimeInSeconds", iRemainingTimeInSeconds);
                // Check again some time later
                this.remainingTimer = setTimeout(this.monitorCountdown.bind(this, false), 500);
                return;
            }

            // Handle session over if no time left
            // ... User didn't choose to continue working
            if (iRemainingTimeInSeconds <= 0) {
                if (this.oSessionKeepAliveDialog) {
                    this.oSessionKeepAliveDialog.close();
                }
                this.handleSessionOver();
            }
        };

        /**
         * Initializes the tile request timeout
         *
         * @since 1.70.0
         * @private
         */
        this.initTileRequestTimeout = function () {
            this.checkStopBackendRequestRemainingTime();
            this.bBackendRequestsActive = true;
        };

        /**
         * Sets up a timer to cancel all recurring requests by the tiles on the homepage to allow the backend session to timeout
         *
         * @since 1.70.0
         * @private
         */
        this.checkStopBackendRequestRemainingTime = function () {
            var sTimeSinceLastActionInMilliseconds = this._getCurrentDate() - new Date(this.getTimestampFromStorage());
            var sTimeSinceLastActionInMinutes = sTimeSinceLastActionInMilliseconds / (1000 * 60);
            var sReminderIntervalInMinutes = this.oConfig.sessionTimeoutTileStopRefreshIntervalInMinutes;
            var sRemainingMillisecondsUntilTimeout = (sReminderIntervalInMinutes - sTimeSinceLastActionInMinutes) * 60 * 1000;

            if (sTimeSinceLastActionInMinutes < sReminderIntervalInMinutes) {
                setTimeout(this.checkStopBackendRequestRemainingTime.bind(this), ushellUtils.sanitizeTimeoutDelay(sRemainingMillisecondsUntilTimeout));
            } else if (sReminderIntervalInMinutes > 0) {
                this._setConnectionActive(false);
            }
        };

        /**
         * Closes or resumes all connections to the servers
         *
         * The implementation is triggered via event <code>'launchpad'/'setConnectionToServer'</code>.
         * For the classic home page mode however, the server connection of the tiles is controlled within this module explicitly.
         *
         * @param {boolean} active Determines if the connection should be closed or resumed
         *
         * @since 1.70.0
         * @private
         */
        this._setConnectionActive = function (active) {
            // Periodically check if an active server connection is to be turned off
            if (active) {
                setTimeout(this.checkStopBackendRequestRemainingTime.bind(this), 0);
            }

            // Return if nothing to do
            if (this.bBackendRequestsActive === active) {
                return;
            }

            // Raise event to enable or disable communication to servers
            Core.getEventBus().publish("launchpad", "setConnectionToServer", { active: active });

            // Set tiles visible/invisible explicitly for classic homepage
            if (!Config.last("/core/spaces/enabled")) {
                if (active) {
                    this._setTilesVisibleOnHomepage();
                } else {
                    this._setTilesInvisibleOnHomepage();
                }
            }

            // Remember current state
            this.bBackendRequestsActive = active;
        };

        /**
         * Triggers the visibility update for tiles on the homepage.
         *
         * @since 1.70.0
         * @private
         */
        this._setTilesVisibleOnHomepage = function () {
            sap.ui.require(["sap/ushell/utils"], function (oUtils) {
                oUtils.handleTilesVisibility();
            });
        };

        /**
         * Sets all tiles on the homepage to invisible.
         * This stops the automatically recurring requests of dynamic and, if the visibility contract was implemented, custom tiles.
         *
         * @returns {Promise} A promises which resolves once all tiles were set invisible
         *
         * @since 1.70.0
         * @private
         */
        this._setTilesInvisibleOnHomepage = function () {
            // Return a promise mainly to make it testable
            return new Promise(function (resolve, reject) {
                return sap.ushell.Container.getServiceAsync("LaunchPage").then(function (LaunchPageService) {
                    LaunchPageService.getGroups().then(function (aGroups) {
                        var oEventBus = Core.getEventBus();
                        aGroups.forEach(function (oGroup) {
                            LaunchPageService.getGroupTiles(oGroup).forEach(function (oGroupTile) {
                                LaunchPageService.setTileVisible(oGroupTile, false);
                            });
                        });

                        oEventBus.publish("launchpad", "visibleTilesChanged", []); // This will clear the active dynamic tile cache of DashboardLoadingManager
                        resolve();
                    });
                });
            });
        };

        /**
         * Instantiates and validates the support of the local storage, then returns an interface for it.
         * A reference to the storage is kept after a successful instantiation for later use.
         *
         * @returns {object} The local Storage interface
         * @private
         */
        this.getLocalStorage = function () {
            if (this.oLocalStorage === undefined) {
                var oStorage = new Storage(this.oConfig && this.oConfig.sessionType || Storage.Type.local);
                if (this._isLocalStorageSupported(oStorage)) {
                    this.oLocalStorage = oStorage;
                } else {
                    this.oLocalStorage = false; // Let's not keep creating new instances. If it is failing once it is expected to fail every time this session
                }
            }

            return this.oLocalStorage;
        };

        /**
         * Checks if the local storage is supported by the browser
         *
         * @param {object} storage The storage interface to be checked
         * @returns {boolean} The result of the check
         * @private
         */
        this._isLocalStorageSupported = function (storage) {
            var bIsSupported;
            try {
                bIsSupported = storage.isSupported();
            } catch (error) {
                bIsSupported = false;
            }

            if (!bIsSupported) {
                Log.warning("SessionHandler._isLocalStorageSupported :: Failed to instantiate local storage handler: "
                    + "Might be disabled by the browser!", "", "SessionHandler");
            }

            return bIsSupported;
        };

        /**
         * Triggers a system notification when
         * a) Browser supports notifications
         * b) User has granted permissions (otherwise, user is asked to do so)
         *
         * @private
         */
        this._createSystemNotification = function () {
            var fnFireNotification = function () {
                var iSessionRemainingTimeInSeconds = this.oModel.getProperty("/SessionRemainingTimeInSeconds");
                var oNotification = new Notification(oResources.i18n.getText("sessionTimeoutMessage_title"), {
                    body: this.continueWorkingFormatter(iSessionRemainingTimeInSeconds)
                });
                oNotification.onclick = function (oEvent) {
                    window.focus();
                };
            }.bind(this);

            // Let's check if the browser supports notifications
            if (!("Notification" in window)) {
                return;
            } else if (Notification.permission === "granted") {
                // If it's okay let's create a notification
                fnFireNotification();
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(function (permission) {
                    // If the user accepts, let's create a notification
                    if (permission === "granted") {
                        fnFireNotification();
                    }
                });
            }
        };

        /* ----------------------------------------- User Dialog controls - begin ----------------------------------------- */

        this.continueWorkingFormatter = function (iSessionRemainingTimeInSeconds) {
            var bIsTimeInMinutes = iSessionRemainingTimeInSeconds > 60;
            var sMessage;
            var sTimeUnit = bIsTimeInMinutes ? oResources.i18n.getText("sessionTimeoutMessage_units_minutes") : oResources.i18n.getText("sessionTimeoutMessage_units_seconds");
            var iSessionRemainingTime = bIsTimeInMinutes ? Math.ceil(iSessionRemainingTimeInSeconds / 60) : iSessionRemainingTimeInSeconds;
            if (that.oConfig.enableAutomaticSignout) {
                sMessage = oResources.i18n.getText("sessionTimeoutMessage_kioskMode_main", [iSessionRemainingTime, sTimeUnit]);
            } else {
                sMessage = oResources.i18n.getText("sessionTimeoutMessage_main", [iSessionRemainingTime, sTimeUnit]);
            }
            return sMessage;
        };

        /**
         * Creates and returns a dialog box that announces the user about the remaining time until session timeout
         * and allows the user to renew the session or (depends of configuration) to sign out immediately.
         * The Dialog box structure:
         *   - sap.m.Dialog
         *     - sap.m.VBox (Texts VBox)
         *        - sap.m.Text (Mandatory: Remaining time text)
         *        - sap.m.Text (Optional: Data lost reminder text)
         *     - sap.m.Button (Mandatory: Continue working button)
         *     - sap.m.Button (Optional: Sign Out button)
         *
         * @returns {object} The session keep alive dialog
         */
        this.createContinueWorkingDialog = function () {
            Log.debug("SessionHandler.createContinueWorkingDialog :: Continue working dialog being created", "", "SessionHandler");

            this.oMessageVBox = new VBox();
            this.oSessionKeepAliveLabel = new Text({
                text: {
                    parts: ["/SessionRemainingTimeInSeconds"],
                    formatter: this.continueWorkingFormatter
                }
            });
            this.oMessageVBox.addItem(this.oSessionKeepAliveLabel);

            if (this.oConfig.enableAutomaticSignout === false) {
                this.oLostDataReminder = new Text({
                    text: oResources.i18n.getText("sessionTimeoutMessage_unsavedData")
                });
                this.oMessageVBox.addItem(this.oLostDataReminder);
            }

            this.oSessionKeepAliveLabel.setModel(this.oModel);

            this.oSessionKeepAliveDialog = new Dialog("sapUshellKeepAliveDialog", {
                title: oResources.i18n.getText("sessionTimeoutMessage_title"),
                type: "Message",
                state: ValueState.Warning,
                content: this.oMessageVBox,
                beginButton: this.createContinueWorkingButton(),
                afterClose: function () {
                    this.oSessionKeepAliveDialog.destroy();
                }.bind(this)
            }).addStyleClass("sapContrastPlus");

            if (this.oConfig.enableAutomaticSignout === true) {
                this.oSignOutButton = new Button({
                    text: oResources.i18n.getText("logoutBtn_title"),
                    tooltip: oResources.i18n.getText("logoutBtn_tooltip"),
                    press: this.logout.bind(this)
                });
                this.oSessionKeepAliveDialog.setEndButton(this.oSignOutButton);
            }

            return this.oSessionKeepAliveDialog;
        };

        this.createContinueWorkingButton = function () {
            return new Button({
                text: oResources.i18n.getText("sessionTimeoutMessage_continue_button_title"),
                type: ButtonType.Emphasized,
                press: that.continueWorkingButtonPressHandler.bind(that, false)
            });
        };

        /**
         * Handles the click on the [Continue] button in the session timeout warning dialog:
         * Closes the dialog, extends the session and restarts user activity monitoring.
         * @param {boolean} isTriggeredBySessionHandler
         *    Tells if the button was clicked by the user or automatically by the session handler
         * @private
         */
        this.continueWorkingButtonPressHandler = function (isTriggeredBySessionHandler) {
            Log.debug("SessionHandler.continueWorkingButtonPressHandler :: Session was extended"
                + isTriggeredBySessionHandler ? "automatically" : "by user", "", "SessionHandler");

            // Close dialog
            if (this.oSessionKeepAliveDialog) {
                this.oSessionKeepAliveDialog.close();
            }
            clearTimeout(this.remainingTimer);

            // Update timestamp of last user interaction
            // ... Only if user explicitly clicked the [continue] button
            if (!isTriggeredBySessionHandler) {
                this.putTimestampInStorage(this._getCurrentDate());
            }

            // Restart monitoring if user is inactive
            this.monitorUserIsInactive();

            // Listen to user events (i.e., keyboard and mouse)
            // ... after they were detached when UserKeepAliveDialog UI was created
            this.attachUserEvents();
            this.attachVisibilityEvents();

            // Send post to isolated
            AppLifeCycle.postMessageToIframeApp("sap.ushell.sessionHandler", "extendSessionEvent", {});
        };

        this.createSessionExpiredDialog = function () {
            this.oSessionExpiredDialog = new Dialog("sapUshellSessionTimedOutDialog", {
                title: oResources.i18n.getText("sessionExpiredMessage_title"),
                type: "Message",
                state: ValueState.Warning,
                content: new Text({ text: oResources.i18n.getText("sessionExpiredMessage_main") }),
                beginButton: this.createReloadButton(),
                afterClose: function () {
                    this.oSessionExpiredDialog.destroy();
                }.bind(this)
            }).addStyleClass("sapContrastPlus");
            return this.oSessionExpiredDialog;
        };

        this.createReloadButton = function () {
            return new Button({
                text: oResources.i18n.getText("sessionExpiredMessage_reloadPage_button_title"),
                press: function () {
                    that.oSessionExpiredDialog.close();
                    location.reload();
                }
            });
        };

        /* ------------------------------------------ User Dialogs controls - end ------------------------------------------ */

        /**
         * Defines which user actions in the browser extend the FLP session
         */
        this.attachUserEvents = function () {
            jQuery(document).on("mousedown.sessionTimeout mousemove.sessionTimeout", this.userActivityHandler.bind(this));
            jQuery(document).on("keyup.sessionTimeout", this.userActivityHandler.bind(this));
            jQuery(document).on("touchstart.sessionTimeout", this.userActivityHandler.bind(this));
            this.oAppLifeCycleService.attachAppLoaded({}, this.userActivityHandler, this);
        };

        this.detachUserEvents = function () {
            jQuery(document).off("mousedown.sessionTimeout mousemove.sessionTimeout");
            jQuery(document).off("keydown.sessionTimeout");
            jQuery(document).off("touchstart.sessionTimeout");
            this.oAppLifeCycleService.detachAppLoaded(this.userActivityHandler, this);
        };

        /**
         * Handler for the visibilitychange event.
         * If the document is made visible, the inactive check is once again called.
         * The reason for this is that mobile devices will stop JavaScript execution when they are locked.
         * When they are unlocked, JavaScript execution is resumed and the "visibilitychange" is fired.
         * That way we can do an additional check if the session has run out in the meantime.
         *
         * @param {Event} oEvent The DOM event.
         */
        this.onVisibilityChange = function (oEvent) {
            if (oEvent.target && oEvent.target.visibilityState === "visible") {
                this.monitorUserIsInactive(false);
            }
        };

        /**
         * This event is fired if the document is made visible / invisible.
         * For example, if the tab of the currently running FLP is selected or if a device screen is unlocked.
         */
        this.attachVisibilityEvents = function () {
            document.addEventListener("visibilitychange", this._fnOnVisibilityChange);
        };

        /**
         * Detaches the visibilitychange event
         */
        this.detachVisibilityEvents = function () {
            document.removeEventListener("visibilitychange", this._fnOnVisibilityChange);
        };

        /**
         * Puts the timestamp of the latest user interaction into the local storage
         * @param {Date} tTimestamp timestamp of latest user interaction
         * @private
         */
        this.putTimestampInStorage = function (tTimestamp) {
            Log.debug("SessionHandler.putTimestampInStorage :: Timestamp is " + tTimestamp, "", "SessionHandler");

            var oLocalStorage = this.getLocalStorage();
            if (oLocalStorage) {
                oLocalStorage.put("lastActivityTime", tTimestamp);
                if (this.bBackendRequestsActive === false) {
                    this._setConnectionActive(true);
                }
            }
        };

        this.getTimestampFromStorage = function () {
            var oLocalStorage = this.getLocalStorage();
            if (oLocalStorage) {
                return oLocalStorage.get("lastActivityTime");
            }
            return null;
        };

        /**
         * Returns the current time (as timestamp in seconds)
         * @returns {integer} Timestamp of current time in seconds
         * @since 1.84.0
         * @private
         */
        this.timeNow = function () {
            return Math.floor(Date.now() / 1000);
        };

        /**
         * Returns the time of the last user interaction (as timestamp in seconds)
         * @returns {integer} Timestamp of last user interaction (in seconds)
         * @since 1.84.0
         * @private
         */
        this.timeLastInteraction = function () {
            return Math.floor(new Date(this.getTimestampFromStorage()).getTime() / 1000);
        };

        /**
         * Tells when the session is supposed to timeout
         * if no further user interactions should happen from now on
         * @returns {integer} Timestamp a session timeout is going to happen (in seconds)
         * @since 1.84.0
         * @private
         */
        this.timeOver = function () {
            return Math.floor(this.timeLastInteraction()
                + this.oConfig.sessionTimeoutIntervalInMinutes * 60);
        };

        /**
         * Tells when a session timeout warning dialog is going to show up
         * if no further user interactions should happen from now on
         * @returns {integer} timestamp a session timeout warning dialog is going show up (in seconds)
         * @since 1.84.0
         * @private
         */
        this.timePopup = function () {
            return Math.floor(this.timeLastInteraction()
                + this.oConfig.sessionTimeoutIntervalInMinutes * 60
                - this.oConfig.sessionTimeoutReminderInMinutes * 60);
        };

        /**
         * Updates time stamp in the local storage whenever the user
         * did some actions on the UI.
         *
         * The time stamp is updated once a second or less.
         * @private
         */
        this.userActivityHandler = function (/*oEventData*/) {
            if (this.oUserActivityTimer !== undefined) {
                return;
            }

            this.oUserActivityTimer = setTimeout(function () {
                Log.debug("SessionHandler.userActivityHandler :: Timed time stamp update", "", "SessionHandler");

                that.putTimestampInStorage(that._getCurrentDate());
                that.oUserActivityTimer = undefined;
            }, 1000);
        };

        this._getCurrentDate = function () {
            return new Date();
        };

        /**
         * Handle the logout functionality:
         *   1. Detach mouse and keyboard event handlers
         *   2. Clear timeouts
         *   3. Show logout message
         *   4. Perform logout via sap.ushell.Container
         */
        this.logout = function () {
            Log.debug("SessionHandler.logout :: Logout initiated", "", "SessionHandler");

            function _logout (oLoading) {
                if (bInitialized === true) {
                    that.detachUserEvents();
                    that.detachVisibilityEvents();
                }
                if (that.oUserActivityTimer) {
                    clearTimeout(that.oUserActivityTimer);
                }
                if (that.remainingTimer) {
                    clearTimeout(that.remainingTimer);
                }
                if (that.notifyServerTimer) {
                    clearTimeout(that.notifyServerTimer);
                }
                oLoading.openLoadingScreen();
                oLoading.showAppInfo(oResources.i18n.getText("beforeLogoutMsg"), null);
                sap.ushell.Container.setDirtyFlag(false);
                sap.ushell.Container.defaultLogout();
            }

            var oLoading = new LoadingDialog({ text: "" });
            var oTimeout;

            // post the logout event to isolated
            AppLifeCycle.postMessageToIframeApp("sap.ushell.sessionHandler", "logout", {}, true).then(function () {
                if (bIsLogoutProcessStarted === false) {
                    bIsLogoutProcessStarted = true;
                    window.clearTimeout(oTimeout);
                    _logout(oLoading);
                }
            });

            oTimeout = window.setTimeout(function () {
                bIsLogoutProcessStarted = true;
                _logout(oLoading);
            }, 4000);
        };
    };

    return SessionHandler;
}, /* bExport= */ false);
