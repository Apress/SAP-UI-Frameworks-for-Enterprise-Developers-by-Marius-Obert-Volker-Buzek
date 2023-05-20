// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Implementation of FLP User Activity Log.
 * Records the User's last _maxLoggedMessages (currently set to 30) Actions and Errors,
 *  and last Navigation action details.
 * Implementing API for adding a message (either ACTION or ERROR) and retrieving the logged data
 *  or the enhanced logged data.
 *
 * The data is kept on sessionStorage, hence it is session-based and is cleaned on browser refresh action
 *
 * Logged Errors and actions:
 * Kept on the sessionStorage in sap.ushell.UserActivityLog.loggingQueue
 *  - Any call to Log.fatal, Log.error or Log.warning is logged using a LogListener
 *  - Any Error Message is logged using Log.error call in the "error" function of Message Service
 *  - User Actions that invoke any of the events in _observedLaunchpadActions or _observedGeneralActions are logged
 *     using and additional listener (i.e. _handleAction) that is subscribed to those events
 *  - Failure in functions of LaunchPage that return Deferred.promise are logged using an additional fail handler
 *     that call Log.error
 *
 *  Last navigation action's details are kept on the sessionStorage in sap.ushell.UserActivityLog.lastNavigationActionData
 *  and collected using:
 *   - Decorator function (i.e. _tileOnTapDecorator) of sap.ushell.ui.tile.TileBase.prototype.ontap event of TileBase
 *   - Event handler subscribed to openApp event
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/extend",
    "sap/ui/core/Core",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/EventHub",
    "sap/ushell/ui/launchpad/Tile",
    "sap/ushell/utils",
    "sap/ushell/utils/UrlParsing"
], function (
    Log,
    extend,
    Core,
    hasher,
    EventHub,
    Tile,
    utils,
    urlParsing
) {
    "use strict";

    // Constructor
    var UserActivityLogClass = function () { };

    UserActivityLogClass.prototype = {
        _maxLoggedMessages: 50,
        _maxMessageByteSize: 2048,
        _maxQueueByteSize: 30720,
        _isActive: false,

        // Launchpad action events that should trigger logging
        _observedLaunchpadActions: [
            "createGroupAt",
            "deleteGroup",
            "resetGroup",
            "changeGroupTitle",
            "moveGroup",
            "addTile",
            "deleteTile",
            "movetile",
            "externalSearch",
            "addBookmarkTile"
        ],

        _observedGeneralActions: ["openApp"],
        _observedEventHubEvents: ["showCatalog"],
        _aDoables: [],

        // API - Begin
        messageType: { ACTION: 0, ERROR: 1 },

        _tileOntapOrigFunc: undefined,

        activate: function (/*clean*/) {
            if (this._isActive) {
                return;
            }

            this._isActive = true;

            var oEventBus = Core.getEventBus();

            // Action logging: Subscribe to all the events in  _observedLaunchpadActions - User actions
            this._observedLaunchpadActions.forEach(function (item) {
                oEventBus.subscribe("launchpad", item, this._handleAction, this);
            }.bind(this));

            oEventBus.subscribe("sap.ushell", "appOpened", this._handleAction, this);

            // Action logging: Subscribe to all the events in  _observedGeneralActions - User actions
            this._observedGeneralActions.forEach(function (item) {
                oEventBus.subscribe(item, this._handleAction, this);
            }.bind(this));

            // Action logging: Subscribe to all the events in  _observedEventHubEvents - User actions
            this._observedEventHubEvents.forEach(function (item) {
                this._aDoables.push(EventHub.on(item).do(this._handleActionEventHub.bind(this)));
            }.bind(this));

            Log.addLogListener(this);

            this._tileOntapOrigFunc = Tile.prototype.ontap;
            Tile.prototype.ontap = this._tileOnTapDecorator(this._tileOntapOrigFunc);
        },

        deactivate: function () {
            if (!this._isActive) {
                return;
            }

            this._isActive = false;

            var oEventBus = Core.getEventBus();

            // Action logging: Unsubscribe to all the events in  _observedLaunchpadActions - User actions
            this._observedLaunchpadActions.forEach(function (item, i, arr) {
                oEventBus.unsubscribe("launchpad", item, this._handleAction, this);
            }.bind(this));

            oEventBus.unsubscribe("sap.ushell", "appOpened", this._handleAction, this);

            // Action logging: Unsubscribe to all the events in  _observedGeneralActions - User actions
            this._observedGeneralActions.forEach(function (item, i, arr) {
                oEventBus.unsubscribe(item, this._handleAction, this);
            }.bind(this));

            // Action logging: Unsubscribe to all the events in  _observedEventHubEvents - User actions
            // The doable objects were stored in _aDoables
            this._aDoables.forEach(function (oDoable) {
                oDoable.off();
            });
            this._aDoables = [];

            Log.removeLogListener(this);

            Tile.prototype.ontap = this._tileOntapOrigFunc;
        },

        addMessage: function (type, messageText, messageID) {
            if (this._isActive) {
                this._addMessageInternal(type, messageText, messageID);
            }
        },

        /**
         * Returns the queue that contains the last user actions and errors
         *
         * @returns {Array} Log queue
         */
        getLog: function () {
            // return this._loggingQueue;
            return this._getLoggingQueueFromStorage();
        },

        /**
         * Returns a JSON that contains the last _maxLoggedMessages user actions and errors,
         * the details of the last navigation actions, user details and shell state
         *
         * @returns {Object} MessageInfo object
         */
        getMessageInfo: function (/*sUserText*/) {
            return {
                userDetails: this._getUserDetails(),
                shellState: this._getShellState(),
                navigationData: this._getLastNavActionFromStorage(),
                userLog: this.getLog(),
                formFactor: utils.getFormFactor()
            };
        },

        /**
         * Returns a JSON as String that contains the last _maxLoggedMessages (currently - 30) user actions and errors,
         * the details of the last navigation actions, user details and shell state
         *
         * @param {String} sUserText Text
         * @returns {String} JSONString
         */
        getMessageInfoAsString: function (sUserText) {
            return JSON.stringify(this.getMessageInfo(sUserText));
        },

        // API - End

        // Functions for log listener - Begin
        onLogEntry: function (oData) {
            // track only log levels "fatal", "error", "warning"
            if (oData.level <= 2) {
                var sErrorMes = oData.message;
                if (typeof oData.details !== "undefined" && (oData.details !== "")) {
                    sErrorMes = sErrorMes + ", " + oData.details;
                }
                this.addMessage(this.messageType.ERROR, sErrorMes);
            }
        },

        onAttachToLog: function () { },

        onDetachFromLog: function () { },

        // For log listener - End

        // Navigation/ClickOnTile action listener - Begin

        /**
         * Decorator for click-on-Tile action for getting Navigation and Tile details
         *
         * @param {function} origFunc Original function
         * @returns {function} TabDecorator
         */
        _tileOnTapDecorator: function (origFunc) {
            var that = this;

            return function (/*event, ui*/) {
                // If the Tile that was clicked is a PlusTile
                if (this.isA("sap.ushell.ui.launchpad.PlusTile")) {
                    that.addMessage(that.messageType.ACTION, "Open Catalog for empty group " + this.getGroupId());

                    // If the Tile that was clicked is a regular Tile
                } else if (this.isA("sap.ushell.ui.launchpad.Tile")) {
                    // Get the href of the anchor of the clicked tile
                    var sNavigationHash = hasher.getHash();

                    /*
                    according to wiki PSSEC/SEC-222
                    we need to make sure we don't store sensitive data in the
                    sessionStorage, therefore we remove the application parameters
                    which might contains sensitive data like account number
                     */
                    if (sNavigationHash) {
                        var oNavObj = urlParsing.parseShellHash(sNavigationHash);
                        sNavigationHash = "#" + urlParsing.constructShellHash({
                            target: {
                                semanticObject: oNavObj.semanticObject,
                                action: oNavObj.action
                            }
                        });
                    }

                    var oLastNavigationActionData = that._getLastNavActionFromStorage();
                    oLastNavigationActionData.time = new Date();
                    oLastNavigationActionData.navigationHash = sNavigationHash;
                    oLastNavigationActionData.tileDebugInfo = this.getDebugInfo();

                    // Get tile title
                    var oTile = Core.byId(this.getId());
                    var oModel = oTile.getModel();
                    var oBindingContext = this.getBindingContext();
                    var sPath = oBindingContext.getPath();

                    oLastNavigationActionData.tileTitle = oBindingContext.getModel().getProperty(sPath).title;

                    that._putInSessionStorage(
                        "sap.ushell.UserActivityLog.lastNavigationActionData",
                        JSON.stringify(oLastNavigationActionData)
                    );

                    that.addMessage(
                        that.messageType.ACTION,
                        "Click on Tile: " + oModel.getData().title + " Tile debugInfo: " + this.getDebugInfo()
                    );
                }
                origFunc.apply(this, arguments);
            };
        },
        // Navigation/ClickOnTile action listener - End

        /**
         * Adds a new message to the sessionStorage (sap.ushell.UserActivityLog.loggingQueue)
         *  after validating the message Type and keeping the queue's size limits
         *
         * @param {Integer} type either ACTION (0) or ERROR (1)
         * @param {String} messageText Text that is added to the log
         * @param {String} messageID an ID...
         */
        _addMessageInternal: function (type, messageText, messageID) {
            var aLoggingQueue = this._getLoggingQueueFromStorage();
            var oLoggedMessage = {
                type: null
            };
            for (var prop in this.messageType) {
                if (type === this.messageType[prop]) {
                    oLoggedMessage.type = prop;
                    break;
                }
            }
            if (oLoggedMessage.type === null) {
                return;
            }
            extend(oLoggedMessage, {
                messageID: messageID,
                messageText: messageText,
                time: new Date(),
                toString: function () {
                    var aStringBuffer = [this.type, this.time];
                    if (typeof this.messageID !== "undefined") {
                        aStringBuffer.push(this.messageID);
                    }
                    aStringBuffer.push(this.messageText);
                    return aStringBuffer.join(" :: ");
                }
            });
            aLoggingQueue.push(oLoggedMessage);
            if (aLoggingQueue.length > this._maxLoggedMessages) {
                aLoggingQueue.shift();
            }
            this._putInSessionStorage("sap.ushell.UserActivityLog.loggingQueue", JSON.stringify(aLoggingQueue));
        },

        /**
         * A wrapper for _handleAction to be used when calling through the EventHub.
         * It translates the data from the EventHub to the syntax of the EventBus,
         * as expected by _handleAction
         *
         * @private
         * @param {object} oEventData The data passed to the EventHub.
         * @param {string} oEventData.sId must contain the name of the EventBus event being replaced.
         * @param {object} oEventData.oData The data as sent by the EventHub.
         */
        _handleActionEventHub: function (oEventData) {
            this._handleAction("", oEventData.sId, oEventData.oData);
        },

        /**
         * Event Handler for user actions.
         * For each action - preparing the appropriate message that is passed to addMessage
         * Expected to be called by the EventBus, not directly.
         *
         * @private
         * @param {string} sChannelId The channel the event was emitted on.
         * @param {string} sEventId The name of the emitted event.
         * @param {object} oData The data sent with the event.
         */
        _handleAction: function (sChannelId, sEventId, oData) {
            var sMessage;

            switch (sEventId) {
                case "deleteTile":
                    sMessage = "Delete Tile " + (oData.tileId || "");
                    break;
                case "moveTile":
                    sMessage = "Move Tile " + (oData.sTileId || "") + " to Group " + (oData.toGroupId || "");
                    break;
                case "createGroupAt":
                    sMessage = "Create Group";
                    break;
                case "changeGroupTitle":
                    sMessage = "Change Group Title of " + (oData.groupId || "") + " to " + (oData.newTitle || "");
                    break;
                case "deleteGroup":
                    sMessage = "Delete Group " + (oData.groupId || "");
                    break;
                case "addTile":
                    var oModel = oData.catalogTileContext.oModel;
                    var sPath = oData.catalogTileContext.sPath;
                    var oTileContext = oModel.getProperty(sPath);
                    var sTileID = (oTileContext && oTileContext.id) || "";
                    var oGroupContext = oData.groupContext.getObject();
                    var sGroupID = (oGroupContext && oGroupContext.id) || "";
                    sMessage = "Add Tile " + sTileID + " to Group " + sGroupID;
                    break;
                case "moveGroup":
                    sMessage = "Move Group from index " + (oData.fromIndex || "") + " to index " + (oData.toIndex || "");
                    break;
                case "appOpened":
                    sMessage = "Open application " + oData.action;
                    var lastNavigationActionData = this._getLastNavActionFromStorage();

                    // TODO, clone, we are mutating an present object?
                    // Add the applicationInformation to the navigation data that was collected before the openApp event
                    lastNavigationActionData.applicationInformation = {};
                    ["applicationType", "ui5ComponentName", "url", "additionalInformation", "text"].forEach(function (sProp) {
                        lastNavigationActionData.applicationInformation[sProp] = oData[sProp];
                    });

                    // Check if the hash kept in lastNavigationActionData (the hash of the last app launching action)
                    // equals the current hash.
                    // If the application was launched as a result of clicking on a tile - then the hashes should match,
                    // but if the application was launched by right_click + open_in_new _tab -
                    // then the hashed probably don't match since the hash in lastNavigationActionData is from previous launching action
                    // of a different application, in this case tileDebugInfo does not match the current opened tile/application
                    // because it describes the tile. so it should be removed
                    if (!this._hashSegmentsEqual(lastNavigationActionData.navigationHash, oData.sShellHash)) {
                        lastNavigationActionData.tileDebugInfo = "";
                    }
                    // Anyway the hash of the current opened application is the most relevant one
                    // and should be in lastNavigationActionData.navigationHash
                    lastNavigationActionData.navigationHash = oData.sShellHash;
                    this._putInSessionStorage(
                        "sap.ushell.UserActivityLog.lastNavigationActionData",
                        JSON.stringify(lastNavigationActionData)
                    );
                    break;
                case "addBookmarkTile":
                    sMessage = "Add Bookmark " + (oData.title || "") + " " + (oData.subtitle || "") + " for URL: " + (oData.url || "");
                    break;
                case "showCatalog":
                    sMessage = "Show Catalog";
                    break;
                default:
                    break;
            } // End of switch

            this.addMessage(this.messageType.ACTION, sMessage);
        },

        /**
         * @returns {object} The current user details.
         * @private
         */
        _getUserDetails: function (/*sUserText*/) {
            var oUser = sap.ushell.Container.getUser();
            return {
                fullName: oUser.getFullName() || "",
                userId: oUser.getId() || "",
                eMail: oUser.getEmail() || "",
                Language: oUser.getLanguage() || ""
            };
        },

        /**
         * @returns {string} The current shell state or empty sting.
         * @private
         */
        _getShellState: function () {
            var oViewPortContainer = Core.byId("viewPortContainer");
            var sResult = "";

            if (oViewPortContainer !== undefined) {
                var oModel = oViewPortContainer.getModel();
                sResult = oModel.getProperty("/currentState/stateName");
            }

            return sResult;
        },

        /**
         * @returns {object[]} The logging queue from the session storage.
         * @private
         */
        _getLoggingQueueFromStorage: function () {
            var sLoggingQueue = this._getFromSessionStorage("sap.ushell.UserActivityLog.loggingQueue");
            var aQueue = [];
            if (sLoggingQueue) {
                try {
                    aQueue = JSON.parse(sLoggingQueue);
                } catch (e) {
                    //ignore cases where its not a valid JSON
                }
            }
            return aQueue;
        },

        /**
         * @returns {object} The last stored navigation action data or an empty object.
         * @private
         */
        _getLastNavActionFromStorage: function () {
            var sLastNavigationActionData = this._getFromSessionStorage("sap.ushell.UserActivityLog.lastNavigationActionData");
            return (sLastNavigationActionData ? JSON.parse(sLastNavigationActionData) : {});
        },

        _hashSegmentsEqual: function (url1, url2) {
            // Check if both URLs are not empty
            if ((!url1) || (!url2)) {
                return false;
            }
            return (this._getHashSegment(url1) === this._getHashSegment(url2));
        },

        /**
         * Gets a url (or hash part of a url) and returns the intent,
         * which is the section between the hash and the "~" or the "?" (the first between the two)
         *
         * @param {String} url Url
         * @returns {String} Url
         * @private
         */
        _getHashSegment: function (url) {
            var aParts = url.split("~");
            if (aParts.length > 1) {
                return aParts[0];
            }

            aParts = url.split("?");
            if (aParts.length > 1) {
                return aParts[0];
            }

            return url;
        },

        /**
         * Returns the value from the session storage at a given key.
         *
         * @param {string} key The key related to the value that should be fetched from the session storage.
         * @returns {string} The value at the given key in the session storage or null.
         * @private
         */
        _getFromSessionStorage: function (key) {
            var sReturnedValue = null;
            try {
                sReturnedValue = sessionStorage.getItem(key);
            } catch (err) {
                // continue regardless of error
            }
            return sReturnedValue;
        },

        /**
         * Places a given value into the session storage at a given key.
         *
         * @param {string} key The key where the given value is placed in the session storage.
         * @param {string} value The value that is placed in to the session storage.
         * @private
         */
        _putInSessionStorage: function (key, value) {
            try {
                sessionStorage.setItem(key, value);
            } catch (err) {
                // continue regardless of error
            }
        }
    };

    var UserActivityLog = new UserActivityLogClass();

    return UserActivityLog;
});
